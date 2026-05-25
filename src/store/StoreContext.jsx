import React, { createContext, useContext, useState, useEffect } from 'react';

const StoreContext = createContext();

export const useStore = () => useContext(StoreContext);

export const StoreProvider = ({ children }) => {
  const [items, setItems] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [bills, setBills] = useState([]);
  const [salesmen, setSalesmen] = useState([]);
  const [dailyTargets, setDailyTargets] = useState({});
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(() => {
    return localStorage.getItem('salesrep_user') || null;
  });

  // Load all data from Mongoose Cloud Database asynchronously upon startup
  useEffect(() => {
    const loadAllData = async () => {
      try {
        setLoading(true);
        const [resItems, resRoutes, resCustomers, resBills, resSalesmen, resTargets] = await Promise.all([
          fetch('/api/items').then(r => r.json()),
          fetch('/api/routes').then(r => r.json()),
          fetch('/api/customers').then(r => r.json()),
          fetch('/api/bills').then(r => r.json()),
          fetch('/api/salesmen').then(r => r.json()),
          fetch('/api/daily-targets').then(r => r.json())
        ]);

        // Normalize MongoDB '_id' to standard 'id' for layout/routing compatibility
        const normalize = (arr) => arr.map(item => ({ ...item, id: item.id || item._id }));

        setItems(normalize(resItems));
        setRoutes(normalize(resRoutes));
        setCustomers(normalize(resCustomers));
        setBills(normalize(resBills));
        setSalesmen(normalize(resSalesmen));
        setDailyTargets(resTargets);
      } catch (err) {
        console.error('Error connecting to Mongoose Database:', err.message);
      } finally {
        setLoading(false);
      }
    };

    loadAllData();
  }, []);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('salesrep_user', currentUser);
    } else {
      localStorage.removeItem('salesrep_user');
    }
  }, [currentUser]);

  // Actions
  const login = (user) => setCurrentUser(user);
  const logout = () => setCurrentUser(null);

  const addItem = async (item) => {
    try {
      const newItem = await fetch('/api/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item)
      }).then(r => r.json());
      setItems(prev => [...prev, { ...newItem, id: newItem._id || newItem.id }]);
    } catch (err) {
      console.error('API Error adding item:', err.message);
    }
  };

  const updateItem = async (id, updatedItem) => {
    try {
      const updated = await fetch(`/api/items/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedItem)
      }).then(r => r.json());
      setItems(prev => prev.map(i => (i.id === id || i._id === id) ? { ...i, ...updated, id: updated._id || updated.id } : i));
    } catch (err) {
      console.error('API Error updating item:', err.message);
    }
  };

  const deleteItem = async (id) => {
    try {
      await fetch(`/api/items/${id}`, { method: 'DELETE' });
      setItems(prev => prev.filter(i => i.id !== id && i._id !== id));
    } catch (err) {
      console.error('API Error deleting item:', err.message);
    }
  };

  const addRoute = async (route) => {
    try {
      const newRoute = await fetch('/api/routes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(route)
      }).then(r => r.json());
      setRoutes(prev => [...prev, { ...newRoute, id: newRoute._id || newRoute.id }]);
    } catch (err) {
      console.error('API Error adding route:', err.message);
    }
  };

  const updateRoute = async (id, updatedRoute) => {
    try {
      const updated = await fetch(`/api/routes/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedRoute)
      }).then(r => r.json());
      setRoutes(prev => prev.map(r => (r.id === id || r._id === id) ? { ...r, ...updated, id: updated._id || updated.id } : r));
    } catch (err) {
      console.error('API Error updating route:', err.message);
    }
  };

  const deleteRoute = async (id) => {
    try {
      await fetch(`/api/routes/${id}`, { method: 'DELETE' });
      setRoutes(prev => prev.filter(r => r.id !== id && r._id !== id));
      const custIds = customers.filter(c => c.routeId === id).map(c => c.id || c._id);
      setCustomers(prev => prev.filter(c => c.routeId !== id));
      setBills(prev => prev.filter(b => !custIds.includes(b.customerId)));
    } catch (err) {
      console.error('API Error deleting route:', err.message);
    }
  };

  const addCustomer = async (customer) => {
    try {
      const routeCustomers = customers.filter(c => c.routeId === customer.routeId);
      const customerData = { ...customer, order: routeCustomers.length };
      const newCustomer = await fetch('/api/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(customerData)
      }).then(r => r.json());
      setCustomers(prev => [...prev, { ...newCustomer, id: newCustomer._id || newCustomer.id }]);
    } catch (err) {
      console.error('API Error adding customer:', err.message);
    }
  };

  const updateCustomer = async (id, updatedCustomer) => {
    try {
      const updated = await fetch(`/api/customers/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedCustomer)
      }).then(r => r.json());
      setCustomers(prev => prev.map(c => (c.id === id || c._id === id) ? { ...c, ...updated, id: updated._id || updated.id } : c));
    } catch (err) {
      console.error('API Error updating customer:', err.message);
    }
  };

  const deleteCustomer = async (id) => {
    try {
      await fetch(`/api/customers/${id}`, { method: 'DELETE' });
      setCustomers(prev => prev.filter(c => c.id !== id && c._id !== id));
      setBills(prev => prev.filter(b => b.customerId !== id));
    } catch (err) {
      console.error('API Error deleting customer:', err.message);
    }
  };

  const updateCustomerOrder = async (routeId, reorderedCustomers) => {
    try {
      // Optimistic UI update
      const otherCustomers = customers.filter(c => c.routeId !== routeId);
      const mappedReordered = reorderedCustomers.map(c => ({ ...c, id: c.id || c._id }));
      setCustomers([...otherCustomers, ...mappedReordered]);

      await fetch('/api/customers/reorder', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reorderedCustomers: mappedReordered })
      });
    } catch (err) {
      console.error('API Error reordering customers:', err.message);
    }
  };

  const addBill = async (bill) => {
    try {
      const newBill = await fetch('/api/bills', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bill)
      }).then(r => r.json());
      setBills(prev => [...prev, { ...newBill, id: newBill._id || newBill.id }]);
    } catch (err) {
      console.error('API Error adding bill:', err.message);
    }
  };

  const deleteBill = async (id) => {
    try {
      await fetch(`/api/bills/${id}`, { method: 'DELETE' });
      setBills(prev => prev.filter(b => b.id !== id && b._id !== id));
    } catch (err) {
      console.error('API Error deleting bill:', err.message);
    }
  };

  const updateBill = async (id, updatedBill) => {
    try {
      const updated = await fetch(`/api/bills/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedBill)
      }).then(r => r.json());
      setBills(prev => prev.map(b => (b.id === id || b._id === id) ? { ...b, ...updated, id: updated._id } : b));
    } catch (err) {
      console.error('API Error updating bill:', err.message);
    }
  };

  const updateSalesmanName = async (id, newName) => {
    try {
      const updated = await fetch(`/api/salesmen/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName })
      }).then(r => r.json());
      setSalesmen(prev => prev.map(s => s.id === id ? { ...s, name: updated.name } : s));
    } catch (err) {
      console.error('API Error updating salesman name:', err.message);
    }
  };

  const updateDailyTarget = async (salesmanId, amount) => {
    try {
      const updated = await fetch(`/api/daily-targets/${salesmanId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount })
      }).then(r => r.json());
      setDailyTargets(prev => ({ ...prev, [salesmanId]: updated.amount }));
    } catch (err) {
      console.error('API Error updating daily target:', err.message);
    }
  };

  const updateSalesmanLocation = async (salesmanId, isTracking, lat, lng) => {
    try {
      const updated = await fetch(`/api/salesmen/${salesmanId}/location`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isTracking, lat, lng })
      }).then(r => r.json());
      setSalesmen(prev => prev.map(s => s.id === salesmanId ? { 
        ...s, 
        isTracking: updated.isTracking, 
        lat: updated.lat, 
        lng: updated.lng, 
        lastUpdated: updated.lastUpdated 
      } : s));
    } catch (err) {
      console.error('API Error updating salesman location:', err.message);
    }
  };

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        fontFamily: 'Inter, sans-serif',
        gap: '1.25rem'
      }}>
        <div style={{
          width: '50px',
          height: '50px',
          border: '3px solid rgba(99, 102, 241, 0.15)',
          borderTopColor: '#6366f1',
          borderRadius: '50%',
          animation: 'radar-sweep 1s linear infinite',
          boxShadow: '0 0 15px rgba(99,102,241,0.2)'
        }} />
        <style>{`
          @keyframes radar-sweep {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}</style>
        <span style={{ fontSize: '0.9rem', color: '#a5b4fc', fontWeight: '600', letterSpacing: '0.08em' }}>
          CONNECTING TO CLOUD DATABASE...
        </span>
      </div>
    );
  }

  return (
    <StoreContext.Provider value={{
      items,
      routes,
      customers,
      bills,
      salesmen,
      dailyTargets,
      currentUser,
      login,
      logout,
      addItem,
      updateItem,
      deleteItem,
      addRoute,
      updateRoute,
      deleteRoute,
      addCustomer,
      updateCustomer,
      deleteCustomer,
      updateCustomerOrder,
      addBill,
      updateBill,
      deleteBill,
      updateSalesmanName,
      updateDailyTarget,
      updateSalesmanLocation
    }}>
      {children}
    </StoreContext.Provider>
  );
};
