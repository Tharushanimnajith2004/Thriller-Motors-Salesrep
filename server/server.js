import './dns-bypass.js';
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { Item, Route, Customer, Salesman, Bill, DailyTarget } from './models.js';

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;
const DATABASE_MODE = process.env.MONGODB_URI ? 'cloud' : (process.env.DATABASE_MODE || 'local');

app.use(cors());
app.use(express.json());

// Resolve __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const LOCAL_DB_PATH = path.join(__dirname, 'data', 'db.json');

// Ensure data folder exists only in local mode to avoid EROFS errors on Vercel serverless startup
if (DATABASE_MODE === 'local') {
  const dataFolder = path.dirname(LOCAL_DB_PATH);
  if (!fs.existsSync(dataFolder)) {
    fs.mkdirSync(dataFolder, { recursive: true });
  }
}

// Default Seed Data for Local Database fallback
const defaultLocalDb = {
  items: [
    { id: 'i1', name: 'Premium Soap', price: 150 },
    { id: 'i2', name: 'Shampoo 200ml', price: 450 }
  ],
  routes: [
    { id: 'r1', name: 'Colombo North' },
    { id: 'r2', name: 'Kandy City' }
  ],
  customers: [
    { id: 'c1', routeId: 'r1', name: 'Saman Stores', address: 'Main St, Colombo', order: 0 },
    { id: 'c2', routeId: 'r1', name: 'Perera Grocery', address: '2nd Cross, Colombo', order: 1 },
    { id: 'c3', routeId: 'r2', name: 'Nimal Pharmacy', address: 'Dalada Veediya, Kandy', order: 0 }
  ],
  salesmen: [
    { id: 'sales1', name: 'Salesman 1', isTracking: false, lat: null, lng: null, lastUpdated: null },
    { id: 'sales2', name: 'Salesman 2', isTracking: false, lat: null, lng: null, lastUpdated: null }
  ],
  dailyTargets: {
    sales1: 25000,
    sales2: 25000
  },
  bills: []
};

// Local JSON Database Helper Functions
const readLocalDb = () => {
  try {
    if (!fs.existsSync(LOCAL_DB_PATH)) {
      fs.writeFileSync(LOCAL_DB_PATH, JSON.stringify(defaultLocalDb, null, 2));
      return defaultLocalDb;
    }
    const data = fs.readFileSync(LOCAL_DB_PATH, 'utf-8');
    if (!data.trim()) {
      fs.writeFileSync(LOCAL_DB_PATH, JSON.stringify(defaultLocalDb, null, 2));
      return defaultLocalDb;
    }
    return JSON.parse(data);
  } catch (err) {
    console.error('Error reading local JSON db:', err.message);
    return defaultLocalDb;
  }
};

const writeLocalDb = (data) => {
  try {
    fs.writeFileSync(LOCAL_DB_PATH, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('Error writing to local JSON db:', err.message);
  }
};

// Initialize Database connection based on DATABASE_MODE
if (DATABASE_MODE === 'cloud') {
  console.log('Connecting to MongoDB Atlas Cloud Database...');
  const MONGODB_URI = process.env.MONGODB_URI;
  mongoose.connect(MONGODB_URI)
    .then(async () => {
      console.log('Connected to MongoDB Atlas successfully.');
      await seedCloudDatabase();
    })
    .catch(err => {
      console.error('MongoDB Cloud Connection Error:', err.message);
      console.log('Failing back to Local JSON database mode due to network connection issues.');
    });
} else {
  console.log('Starting server in LOCAL JSON DATABASE mode...');
  readLocalDb(); // Initialize file
  console.log(`Local persistent database file ready at: ${LOCAL_DB_PATH}`);
}

// Cloud Seeding logic
async function seedCloudDatabase() {
  try {
    const salesmanCount = await Salesman.countDocuments();
    if (salesmanCount === 0) {
      await Salesman.insertMany([
        { id: 'sales1', name: 'Salesman 1', isTracking: false, lat: null, lng: null, lastUpdated: null },
        { id: 'sales2', name: 'Salesman 2', isTracking: false, lat: null, lng: null, lastUpdated: null }
      ]);
    }
    const targetCount = await DailyTarget.countDocuments();
    if (targetCount === 0) {
      await DailyTarget.insertMany([
        { salesmanId: 'sales1', amount: 25000 },
        { salesmanId: 'sales2', amount: 25000 }
      ]);
    }
    const itemCount = await Item.countDocuments();
    if (itemCount === 0) {
      await Item.insertMany([
        { name: 'Premium Soap', price: 150 },
        { name: 'Shampoo 200ml', price: 450 }
      ]);
    }
    const routeCount = await Route.countDocuments();
    if (routeCount === 0) {
      const colomboRoute = await new Route({ name: 'Colombo North' }).save();
      const kandyRoute = await new Route({ name: 'Kandy City' }).save();
      await Customer.insertMany([
        { routeId: colomboRoute._id.toString(), name: 'Saman Stores', address: 'Main St, Colombo', order: 0 },
        { routeId: colomboRoute._id.toString(), name: 'Perera Grocery', address: '2nd Cross, Colombo', order: 1 },
        { routeId: kandyRoute._id.toString(), name: 'Nimal Pharmacy', address: 'Dalada Veediya, Kandy', order: 0 }
      ]);
      console.log('Cloud seeding complete.');
    }
  } catch (err) {
    console.error('Cloud Seeding Error:', err.message);
  }
}

// ==================== DUAL-MODE API ROUTERS ====================

app.get('/api/status', (req, res) => {
  res.json({
    databaseMode: DATABASE_MODE,
    mongooseStatus: mongoose.connection.readyState, // 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
    envExists: {
      MONGODB_URI: !!process.env.MONGODB_URI,
      DATABASE_MODE: !!process.env.DATABASE_MODE
    }
  });
});

// 1. Items API
app.get('/api/items', async (req, res) => {
  if (DATABASE_MODE === 'local') {
    const db = readLocalDb();
    res.json(db.items);
  } else {
    try {
      const items = await Item.find();
      res.json(items);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
});

app.post('/api/items', async (req, res) => {
  if (DATABASE_MODE === 'local') {
    const { name, price } = req.body;
    const db = readLocalDb();
    const newItem = { id: Date.now().toString(), name, price: parseFloat(price) };
    db.items.push(newItem);
    writeLocalDb(db);
    res.status(201).json(newItem);
  } else {
    try {
      const { name, price } = req.body;
      const newItem = new Item({ name, price });
      await newItem.save();
      res.status(201).json(newItem);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }
});

app.put('/api/items/:id', async (req, res) => {
  const { name, price } = req.body;
  if (DATABASE_MODE === 'local') {
    const db = readLocalDb();
    const idx = db.items.findIndex(i => i.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: 'Item not found' });
    db.items[idx] = { ...db.items[idx], name, price: parseFloat(price) };
    writeLocalDb(db);
    res.json(db.items[idx]);
  } else {
    try {
      const updatedItem = await Item.findByIdAndUpdate(req.params.id, { name, price: parseFloat(price) }, { new: true });
      if (!updatedItem) return res.status(404).json({ error: 'Item not found' });
      res.json(updatedItem);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }
});

app.delete('/api/items/:id', async (req, res) => {
  if (DATABASE_MODE === 'local') {
    const db = readLocalDb();
    db.items = db.items.filter(i => i.id !== req.params.id);
    writeLocalDb(db);
    res.json({ success: true });
  } else {
    try {
      let deleted;
      if (mongoose.Types.ObjectId.isValid(req.params.id)) {
        deleted = await Item.findByIdAndDelete(req.params.id);
      } else {
        deleted = await Item.findOneAndDelete({ id: req.params.id });
      }
      if (!deleted) return res.status(404).json({ error: 'Item not found' });
      res.json({ success: true });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }
});

// 2. Routes API
app.get('/api/routes', async (req, res) => {
  if (DATABASE_MODE === 'local') {
    const db = readLocalDb();
    res.json(db.routes);
  } else {
    try {
      const routes = await Route.find();
      res.json(routes);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
});

app.post('/api/routes', async (req, res) => {
  if (DATABASE_MODE === 'local') {
    const { name } = req.body;
    const db = readLocalDb();
    const newRoute = { id: Date.now().toString(), name };
    db.routes.push(newRoute);
    writeLocalDb(db);
    res.status(201).json(newRoute);
  } else {
    try {
      const { name } = req.body;
      const newRoute = new Route({ name });
      await newRoute.save();
      res.status(201).json(newRoute);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }
});

app.put('/api/routes/:id', async (req, res) => {
  const { name } = req.body;
  if (DATABASE_MODE === 'local') {
    const db = readLocalDb();
    const idx = db.routes.findIndex(r => r.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: 'Route not found' });
    db.routes[idx].name = name;
    writeLocalDb(db);
    res.json(db.routes[idx]);
  } else {
    try {
      const updatedRoute = await Route.findByIdAndUpdate(req.params.id, { name }, { new: true });
      if (!updatedRoute) return res.status(404).json({ error: 'Route not found' });
      res.json(updatedRoute);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }
});

app.delete('/api/routes/:id', async (req, res) => {
  if (DATABASE_MODE === 'local') {
    const db = readLocalDb();
    db.routes = db.routes.filter(r => r.id !== req.params.id);
    const routeCustomers = db.customers.filter(c => c.routeId === req.params.id).map(c => c.id);
    db.customers = db.customers.filter(c => c.routeId !== req.params.id);
    db.bills = db.bills.filter(b => !routeCustomers.includes(b.customerId));
    writeLocalDb(db);
    res.json({ success: true });
  } else {
    try {
      let deleted;
      if (mongoose.Types.ObjectId.isValid(req.params.id)) {
        deleted = await Route.findByIdAndDelete(req.params.id);
      } else {
        deleted = await Route.findOneAndDelete({ id: req.params.id });
      }
      if (!deleted) return res.status(404).json({ error: 'Route not found' });
      const custs = await Customer.find({ routeId: req.params.id });
      const custIds = custs.map(c => c._id.toString());
      await Customer.deleteMany({ routeId: req.params.id });
      await Bill.deleteMany({ customerId: { $in: custIds } });
      res.json({ success: true });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }
});

// 3. Customers API
app.get('/api/customers', async (req, res) => {
  if (DATABASE_MODE === 'local') {
    const db = readLocalDb();
    res.json(db.customers);
  } else {
    try {
      const customers = await Customer.find();
      res.json(customers);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
});

app.post('/api/customers', async (req, res) => {
  if (DATABASE_MODE === 'local') {
    const { routeId, name, address, order } = req.body;
    const db = readLocalDb();
    const newCustomer = { id: Date.now().toString(), routeId, name, address, order: parseInt(order) };
    db.customers.push(newCustomer);
    writeLocalDb(db);
    res.status(201).json(newCustomer);
  } else {
    try {
      const { routeId, name, address, order } = req.body;
      const newCustomer = new Customer({ routeId, name, address, order });
      await newCustomer.save();
      res.status(201).json(newCustomer);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }
});

app.put('/api/customers/:id', async (req, res) => {
  const { name, address } = req.body;
  if (DATABASE_MODE === 'local') {
    const db = readLocalDb();
    const idx = db.customers.findIndex(c => c.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: 'Customer not found' });
    db.customers[idx] = { ...db.customers[idx], name, address };
    writeLocalDb(db);
    res.json(db.customers[idx]);
  } else {
    try {
      const updatedCustomer = await Customer.findByIdAndUpdate(req.params.id, { name, address }, { new: true });
      if (!updatedCustomer) return res.status(404).json({ error: 'Customer not found' });
      res.json(updatedCustomer);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }
});

app.delete('/api/customers/:id', async (req, res) => {
  if (DATABASE_MODE === 'local') {
    const db = readLocalDb();
    db.customers = db.customers.filter(c => c.id !== req.params.id);
    db.bills = db.bills.filter(b => b.customerId !== req.params.id);
    writeLocalDb(db);
    res.json({ success: true });
  } else {
    try {
      let deleted;
      if (mongoose.Types.ObjectId.isValid(req.params.id)) {
        deleted = await Customer.findByIdAndDelete(req.params.id);
      } else {
        deleted = await Customer.findOneAndDelete({ id: req.params.id });
      }
      if (!deleted) return res.status(404).json({ error: 'Customer not found' });
      await Bill.deleteMany({ customerId: req.params.id });
      res.json({ success: true });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }
});

app.put('/api/customers/reorder', async (req, res) => {
  if (DATABASE_MODE === 'local') {
    const { reorderedCustomers } = req.body;
    const db = readLocalDb();
    reorderedCustomers.forEach(rc => {
      const idx = db.customers.findIndex(c => c.id === rc.id || c._id === rc.id);
      if (idx !== -1) {
        db.customers[idx].order = rc.order;
      }
    });
    writeLocalDb(db);
    res.json({ success: true });
  } else {
    try {
      const { reorderedCustomers } = req.body;
      const promises = reorderedCustomers.map(c => 
        Customer.findByIdAndUpdate(c.id || c._id, { order: c.order })
      );
      await Promise.all(promises);
      res.json({ success: true });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }
});

// 4. Salesmen API
app.get('/api/salesmen', async (req, res) => {
  if (DATABASE_MODE === 'local') {
    const db = readLocalDb();
    res.json(db.salesmen);
  } else {
    try {
      // Self-heal: Ensure sales1 and sales2 documents exist in Cloud Database
      const sales1 = await Salesman.findOne({ id: 'sales1' });
      const sales2 = await Salesman.findOne({ id: 'sales2' });
      if (!sales1 || !sales2) {
        console.log('[Self-Heal] Salesman collection is incomplete. Re-seeding cleanly...');
        await Salesman.deleteMany({});
        await Salesman.insertMany([
          { id: 'sales1', name: 'Salesman 1', isTracking: false, lat: null, lng: null, lastUpdated: null },
          { id: 'sales2', name: 'Salesman 2', isTracking: false, lat: null, lng: null, lastUpdated: null }
        ]);
      }

      const salesmen = await Salesman.find();
      res.json(salesmen);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
});

app.put('/api/salesmen/:id', async (req, res) => {
  if (DATABASE_MODE === 'local') {
    const { name } = req.body;
    const db = readLocalDb();
    const idx = db.salesmen.findIndex(s => s.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: 'Salesman not found' });
    db.salesmen[idx].name = name;
    writeLocalDb(db);
    res.json(db.salesmen[idx]);
  } else {
    try {
      const { name } = req.body;
      const salesman = await Salesman.findOneAndUpdate(
        { id: req.params.id }, 
        { name }, 
        { new: true, upsert: true }
      );
      res.json(salesman);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }
});

app.put('/api/salesmen/:id/location', async (req, res) => {
  if (DATABASE_MODE === 'local') {
    const { isTracking, lat, lng } = req.body;
    const db = readLocalDb();
    const idx = db.salesmen.findIndex(s => s.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: 'Salesman not found' });
    db.salesmen[idx] = {
      ...db.salesmen[idx],
      isTracking,
      lat: isTracking ? parseFloat(lat) : null,
      lng: isTracking ? parseFloat(lng) : null,
      lastUpdated: isTracking ? new Date().toISOString() : null
    };
    writeLocalDb(db);
    res.json(db.salesmen[idx]);
  } else {
    try {
      const { isTracking, lat, lng } = req.body;
      const updateData = {
        isTracking,
        lat: lat !== undefined ? lat : null,
        lng: lng !== undefined ? lng : null,
        lastUpdated: isTracking ? new Date().toISOString() : null
      };
      // Upsert: true ensures that even if missing it will be created on tracking activation
      const salesman = await Salesman.findOneAndUpdate(
        { id: req.params.id }, 
        updateData, 
        { new: true, upsert: true }
      );
      res.json(salesman);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }
});

// 5. Daily Targets API
app.get('/api/daily-targets', async (req, res) => {
  if (DATABASE_MODE === 'local') {
    const db = readLocalDb();
    res.json(db.dailyTargets);
  } else {
    try {
      // Self-heal: Ensure sales1 and sales2 targets exist
      let t1 = await DailyTarget.findOne({ salesmanId: 'sales1' });
      if (!t1) {
        console.log('[Self-Heal] Re-creating missing daily target for sales1...');
        t1 = await new DailyTarget({ salesmanId: 'sales1', amount: 25000 }).save();
      }
      let t2 = await DailyTarget.findOne({ salesmanId: 'sales2' });
      if (!t2) {
        console.log('[Self-Heal] Re-creating missing daily target for sales2...');
        t2 = await new DailyTarget({ salesmanId: 'sales2', amount: 25000 }).save();
      }

      const targets = await DailyTarget.find();
      const targetsObj = {};
      targets.forEach(t => {
        targetsObj[t.salesmanId] = t.amount;
      });
      res.json(targetsObj);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
});

app.put('/api/daily-targets/:id', async (req, res) => {
  if (DATABASE_MODE === 'local') {
    const { amount } = req.body;
    const db = readLocalDb();
    db.dailyTargets[req.params.id] = parseFloat(amount) || 0;
    writeLocalDb(db);
    res.json({ salesmanId: req.params.id, amount: db.dailyTargets[req.params.id] });
  } else {
    try {
      const { amount } = req.body;
      const target = await DailyTarget.findOneAndUpdate(
        { salesmanId: req.params.id }, 
        { amount: parseFloat(amount) || 0 }, 
        { new: true, upsert: true }
      );
      res.json(target);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }
});

// 6. Bills API
app.get('/api/bills', async (req, res) => {
  if (DATABASE_MODE === 'local') {
    const db = readLocalDb();
    res.json(db.bills);
  } else {
    try {
      const bills = await Bill.find();
      res.json(bills);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
});

app.post('/api/bills', async (req, res) => {
  if (DATABASE_MODE === 'local') {
    const billData = req.body;
    const db = readLocalDb();
    const newBill = {
      ...billData,
      id: Date.now().toString(),
      _id: Date.now().toString(),
      date: new Date().toISOString()
    };
    db.bills.push(newBill);
    writeLocalDb(db);
    res.status(201).json(newBill);
  } else {
    try {
      const billData = req.body;
      const newBill = new Bill(billData);
      await newBill.save();
      res.status(201).json(newBill);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }
});

app.put('/api/bills/:id', async (req, res) => {
  if (DATABASE_MODE === 'local') {
    const db = readLocalDb();
    const idx = db.bills.findIndex(b => b.id === req.params.id || b._id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: 'Bill not found' });
    db.bills[idx] = {
      ...db.bills[idx],
      ...req.body
    };
    writeLocalDb(db);
    res.json(db.bills[idx]);
  } else {
    try {
      const updatedBill = await Bill.findByIdAndUpdate(req.params.id, req.body, { new: true });
      if (!updatedBill) return res.status(404).json({ error: 'Bill not found' });
      res.json(updatedBill);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }
});

app.delete('/api/bills/:id', async (req, res) => {
  if (DATABASE_MODE === 'local') {
    const db = readLocalDb();
    db.bills = db.bills.filter(b => b.id !== req.params.id && b._id !== req.params.id);
    writeLocalDb(db);
    res.json({ success: true });
  } else {
    try {
      let deleted;
      if (mongoose.Types.ObjectId.isValid(req.params.id)) {
        deleted = await Bill.findByIdAndDelete(req.params.id);
      } else {
        deleted = await Bill.findOneAndDelete({ id: req.params.id });
      }
      if (!deleted) return res.status(404).json({ error: 'Bill not found' });
      res.json({ success: true });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }
});

if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Express server running on http://localhost:${PORT}`);
  });
}

export default app;
