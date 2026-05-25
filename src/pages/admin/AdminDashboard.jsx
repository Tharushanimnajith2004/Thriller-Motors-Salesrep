import React, { useState } from 'react';
import { useStore } from '../../store/StoreContext';
import { LogOut, Package, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
  const { items, addItem, logout, currentUser } = useStore();
  const navigate = useNavigate();
  const [showAddForm, setShowAddForm] = useState(false);
  const [newItem, setNewItem] = useState({ name: '', price: '' });

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleAddItem = (e) => {
    e.preventDefault();
    if (newItem.name && newItem.price) {
      addItem({ ...newItem, price: parseFloat(newItem.price) });
      setNewItem({ name: '', price: '' });
      setShowAddForm(false);
    }
  };

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
            <Package size={20} color="white" />
          </div>
          <h2 className="text-xl font-bold m-0 text-white">Admin Portal</h2>
        </div>
        
        <nav className="flex-1 flex flex-col gap-2">
          <button className="flex items-center gap-3 w-full p-3 rounded-md bg-primary/20 text-primary font-medium text-left">
            <Package size={20} />
            Items Management
          </button>
          {/* Add more nav items here if needed */}
        </nav>

        <div className="mt-auto">
          <div className="p-4 mb-4 rounded-lg bg-surface-color border border-surface-border">
            <p className="text-sm text-muted mb-1">Logged in as</p>
            <p className="font-semibold text-white capitalize">{currentUser}</p>
          </div>
          <button onClick={handleLogout} className="btn btn-outline w-full justify-start text-danger hover:border-danger hover:bg-danger/10">
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="admin-main">
        <div className="flex items-center justify-between mb-8 animate-fade-in">
          <div>
            <h1 className="text-3xl font-bold text-white">Item Management</h1>
            <p className="text-muted">View and manage the product catalog</p>
          </div>
          <button 
            onClick={() => setShowAddForm(!showAddForm)}
            className="btn btn-primary"
          >
            <Plus size={20} />
            {showAddForm ? 'Cancel' : 'Add New Item'}
          </button>
        </div>

        {showAddForm && (
          <div className="glass-panel p-6 mb-8 animate-fade-in">
            <h3 className="text-xl font-semibold mb-4 text-white">Add New Item</h3>
            <form onSubmit={handleAddItem} className="flex gap-4 items-end">
              <div className="flex-1 form-group m-0">
                <label>Item Name</label>
                <input 
                  type="text" 
                  value={newItem.name}
                  onChange={e => setNewItem({...newItem, name: e.target.value})}
                  placeholder="e.g. Premium Soap" 
                  required
                />
              </div>
              <div className="flex-1 form-group m-0">
                <label>Price (LKR)</label>
                <input 
                  type="number" 
                  value={newItem.price}
                  onChange={e => setNewItem({...newItem, price: e.target.value})}
                  placeholder="e.g. 150" 
                  required
                  min="0"
                  step="0.01"
                />
              </div>
              <button type="submit" className="btn btn-success h-12 px-8">
                Save Item
              </button>
            </form>
          </div>
        )}

        <div className="table-container animate-fade-in" style={{ animationDelay: '0.1s' }}>
          <table>
            <thead>
              <tr>
                <th>Item ID</th>
                <th>Name</th>
                <th>Price (LKR)</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 ? (
                <tr>
                  <td colSpan="4" className="text-center py-8 text-muted">No items found. Add some!</td>
                </tr>
              ) : (
                items.map(item => (
                  <tr key={item.id}>
                    <td className="text-muted font-mono">{item.id}</td>
                    <td className="font-medium text-white">{item.name}</td>
                    <td>Rs. {parseFloat(item.price).toFixed(2)}</td>
                    <td>
                      <button className="text-primary hover:text-primary-hover text-sm font-medium mr-3">Edit</button>
                      <button className="text-danger hover:text-red-400 text-sm font-medium">Delete</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
