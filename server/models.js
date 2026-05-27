import mongoose from 'mongoose';

const Schema = mongoose.Schema;

// 1. Item Schema
const ItemSchema = new Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true }
});

// 2. Route Schema
const RouteSchema = new Schema({
  name: { type: String, required: true }
});

// 3. Customer Schema
const CustomerSchema = new Schema({
  routeId: { type: String, required: true },
  name: { type: String, required: true },
  address: { type: String, required: true },
  order: { type: Number, required: true }
});

// 4. Salesmen Schema
const SalesmanSchema = new Schema({
  id: { type: String, required: true, unique: true }, // 'sales1', 'sales2'
  name: { type: String, required: true },
  isTracking: { type: Boolean, default: false },
  lat: { type: Number, default: null },
  lng: { type: Number, default: null },
  lastUpdated: { type: String, default: null }
}, { id: false });

// 5. Bill Schema
const BillSchema = new Schema({
  customerId: { type: String, required: true },
  salesmanId: { type: String, required: true },
  items: [{
    itemId: { type: String, required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    qty: { type: Number, required: true },
    total: { type: Number, required: true }
  }],
  subtotal: { type: Number, required: true },
  discountType: { type: String, default: 'none' },
  discountValue: { type: Number, default: 0 },
  discountAmount: { type: Number, default: 0 },
  total: { type: Number, required: true },
  status: { type: String, default: 'pending' }, // 'pending', 'delivered', 'cancelled'
  deliveryDate: { type: String, default: null },
  date: { type: String, default: () => new Date().toISOString() }
});

// 6. DailyTarget Schema
const DailyTargetSchema = new Schema({
  salesmanId: { type: String, required: true, unique: true },
  amount: { type: Number, required: true }
});

export const Item = mongoose.model('Item', ItemSchema);
export const Route = mongoose.model('Route', RouteSchema);
export const Customer = mongoose.model('Customer', CustomerSchema);
export const Salesman = mongoose.model('Salesman', SalesmanSchema);
export const Bill = mongoose.model('Bill', BillSchema);
export const DailyTarget = mongoose.model('DailyTarget', DailyTargetSchema);
