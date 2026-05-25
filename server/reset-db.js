import './dns-bypass.js';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { Item, Route, Customer, Salesman, Bill, DailyTarget } from './models.js';

dotenv.config();

const DATABASE_MODE = process.env.DATABASE_MODE || 'local';

// Resolve __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const LOCAL_DB_PATH = path.join(__dirname, 'data', 'db.json');

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

async function resetDb() {
  if (DATABASE_MODE === 'local') {
    console.log('Resetting LOCAL JSON Database to fresh default state...');
    try {
      fs.writeFileSync(LOCAL_DB_PATH, JSON.stringify(defaultLocalDb, null, 2));
      console.log('SUCCESS: Local db.json has been completely reset and re-seeded!');
      process.exit(0);
    } catch (err) {
      console.error('Reset Error:', err.message);
      process.exit(1);
    }
  } else {
    console.log('Resetting CLOUD MongoDB Atlas Database to fresh default state...');
    const MONGODB_URI = process.env.MONGODB_URI;
    try {
      await mongoose.connect(MONGODB_URI);
      console.log('Connected to MongoDB Atlas...');

      // Drop all collections
      console.log('Clearing old collections...');
      await Promise.all([
        Item.deleteMany({}),
        Route.deleteMany({}),
        Customer.deleteMany({}),
        Salesman.deleteMany({}),
        Bill.deleteMany({}),
        DailyTarget.deleteMany({})
      ]);

      // Seed fresh default data
      console.log('Seeding fresh default database data...');
      
      // 1. Salesmen
      await Salesman.insertMany([
        { id: 'sales1', name: 'Salesman 1', isTracking: false, lat: null, lng: null, lastUpdated: null },
        { id: 'sales2', name: 'Salesman 2', isTracking: false, lat: null, lng: null, lastUpdated: null }
      ]);

      // 2. Targets
      await DailyTarget.insertMany([
        { salesmanId: 'sales1', amount: 25000 },
        { salesmanId: 'sales2', amount: 25000 }
      ]);

      // 3. Items
      await Item.insertMany([
        { name: 'Premium Soap', price: 150 },
        { name: 'Shampoo 200ml', price: 450 }
      ]);

      // 4. Routes and Customers
      const colomboRoute = await new Route({ name: 'Colombo North' }).save();
      const kandyRoute = await new Route({ name: 'Kandy City' }).save();

      await Customer.insertMany([
        { routeId: colomboRoute._id.toString(), name: 'Saman Stores', address: 'Main St, Colombo', order: 0 },
        { routeId: colomboRoute._id.toString(), name: 'Perera Grocery', address: '2nd Cross, Colombo', order: 1 },
        { routeId: kandyRoute._id.toString(), name: 'Nimal Pharmacy', address: 'Dalada Veediya, Kandy', order: 0 }
      ]);

      console.log('SUCCESS: MongoDB Atlas cloud database has been completely cleared and re-seeded!');
      await mongoose.disconnect();
      process.exit(0);
    } catch (err) {
      console.error('Cloud Reset Error:', err.message);
      process.exit(1);
    }
  }
}

resetDb();
