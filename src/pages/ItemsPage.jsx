import React, { useState, useEffect, useRef } from 'react';
import { useStore } from '../store/StoreContext';
import { LogOut, Package, Plus, ArrowLeft, Users, Check, Sparkles, Compass, Play, Square, ExternalLink, Trash, Edit, FileText, ChevronDown, ChevronUp, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ItemsPage = () => {
  const { items, addItem, updateItem, deleteItem, logout, salesmen, updateSalesmanName, updateSalesmanLocation, bills, customers } = useStore();
  const navigate = useNavigate();
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [newItem, setNewItem] = useState({ name: '', price: '' });
  const [activeTab, setActiveTab] = useState('catalog'); // 'catalog', 'gps', or 'sales'
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedDates, setExpandedDates] = useState({});
  const [expandedBills, setExpandedBills] = useState({});

  // Salesmen editing state
  const [sales1Name, setSales1Name] = useState('');
  const [sales2Name, setSales2Name] = useState('');
  const [toastMsg, setToastMsg] = useState('');

  // Live Tracking Simulator state
  const [isSimulating, setIsSimulating] = useState(false);

  // Leaflet Map states & refs
  const mapInstanceRef = useRef(null);
  const markersRef = useRef({});
  const [leafletLoaded, setLeafletLoaded] = useState(false);

  useEffect(() => {
    if (salesmen) {
      setSales1Name(salesmen.find(s => s.id === 'sales1')?.name || '');
      setSales2Name(salesmen.find(s => s.id === 'sales2')?.name || '');
    }
  }, [salesmen]);

  // Load Leaflet dynamically
  useEffect(() => {
    if (window.L) {
      setLeafletLoaded(true);
      return;
    }

    // Add Leaflet CSS
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    document.head.appendChild(link);

    // Add Leaflet JS
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    script.async = true;
    script.onload = () => {
      setLeafletLoaded(true);
    };
    document.body.appendChild(script);

    return () => {
      // Cleanup loaded script & link
      if (document.head.contains(link)) document.head.removeChild(link);
      if (document.body.contains(script)) document.body.removeChild(script);
    };
  }, []);

  // Initialize Map
  useEffect(() => {
    if (!leafletLoaded || !window.L || activeTab !== 'gps') return;

    // Check if map container exists
    const container = document.getElementById('leaflet-map');
    if (!container) return;

    const L = window.L;

    // Centered on Sri Lanka, zoom 8 for national overview!
    const map = L.map('leaflet-map', {
      zoomControl: true,
      attributionControl: false,
      scrollWheelZoom: false // Prevent map from hijacking page scroll
    }).setView([7.8731, 80.7718], 7.5);

    // Premium Dark CartoDB Tiles matching our visual theme perfectly!
    L.tileLayer('https://{s}.tile.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png', {
      maxZoom: 18,
      minZoom: 6
    }).addTo(map);

    mapInstanceRef.current = map;

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
      markersRef.current = {};
    };
  }, [leafletLoaded, activeTab]);

  // Update Map Markers dynamically
  useEffect(() => {
    if (!leafletLoaded || !window.L || !mapInstanceRef.current) return;
    const L = window.L;
    const map = mapInstanceRef.current;

    salesmen.forEach(s => {
      const hasSignal = s.isTracking && s.lat && s.lng;
      if (hasSignal) {
        const coords = [s.lat, s.lng];
        const iconColor = s.id === 'sales1' ? '#ec4899' : '#10b981';

        // Custom Leaflet DivIcon for premium glowing beacon markers
        const customIcon = L.divIcon({
          className: 'custom-gps-marker',
          html: `<div style="
            width: 14px; 
            height: 14px; 
            background: ${iconColor}; 
            border: 2px solid white; 
            border-radius: 50%; 
            box-shadow: 0 0 10px ${iconColor}, 0 0 20px ${iconColor};
            animation: pulse-ring 2s infinite;
          "></div>`,
          iconSize: [14, 14],
          iconAnchor: [7, 7]
        });

        if (markersRef.current[s.id]) {
          markersRef.current[s.id].setLatLng(coords);
        } else {
          const marker = L.marker(coords, { icon: customIcon }).addTo(map);
          marker.bindPopup(`<strong style="color: ${iconColor}">${s.name}</strong><br/>Status: Online & Active<br/>Lat: ${s.lat.toFixed(5)}<br/>Lng: ${s.lng.toFixed(5)}`);
          markersRef.current[s.id] = marker;
        }
      } else {
        if (markersRef.current[s.id]) {
          markersRef.current[s.id].remove();
          delete markersRef.current[s.id];
        }
      }
    });

    // Auto fit map bounds to display all active tracking representatives dynamically
    const activeCoords = salesmen.filter(s => s.isTracking && s.lat && s.lng).map(s => [s.lat, s.lng]);
    if (activeCoords.length > 0) {
      if (activeCoords.length === 1) {
        map.panTo(activeCoords[0]);
      } else {
        map.fitBounds(L.latLngBounds(activeCoords), { padding: [50, 50], maxZoom: 14 });
      }
    }
  }, [salesmen, leafletLoaded]);

  // GPS Simulation engine
  useEffect(() => {
    let intervalId = null;
    if (isSimulating) {
      // Base positions in Colombo, Sri Lanka
      let sales1Pos = { lat: 6.927079, lng: 79.861244 };
      let sales2Pos = { lat: 6.931500, lng: 79.844500 };

      // Trigger tracking state instantly
      updateSalesmanLocation('sales1', true, sales1Pos.lat, sales1Pos.lng);
      updateSalesmanLocation('sales2', true, sales2Pos.lat, sales2Pos.lng);

      intervalId = setInterval(() => {
        // Increment coordinates to simulate real vehicle travels
        sales1Pos.lat += (Math.random() - 0.5) * 0.0006;
        sales1Pos.lng += (Math.random() - 0.5) * 0.0006;
        sales2Pos.lat += (Math.random() - 0.5) * 0.0009;
        sales2Pos.lng += (Math.random() - 0.5) * 0.0009;

        updateSalesmanLocation('sales1', true, sales1Pos.lat, sales1Pos.lng);
        updateSalesmanLocation('sales2', true, sales2Pos.lat, sales2Pos.lng);
      }, 1500);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isSimulating]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleSubmitItem = (e) => {
    e.preventDefault();
    if (newItem.name && newItem.price) {
      if (editingItem) {
        updateItem(editingItem.id, { name: newItem.name, price: parseFloat(newItem.price) });
        setToastMsg('Item updated successfully!');
      } else {
        addItem({ ...newItem, price: parseFloat(newItem.price) });
        setToastMsg('Item added successfully!');
      }
      setNewItem({ name: '', price: '' });
      setEditingItem(null);
      setShowAddForm(false);
      setTimeout(() => setToastMsg(''), 3000);
    }
  };

  const handleEditItemClick = (item) => {
    setEditingItem(item);
    setNewItem({ name: item.name, price: item.price.toString() });
    setShowAddForm(true);
  };

  const handleDeleteItemClick = (id) => {
    if (window.confirm("Are you sure you want to delete this item?")) {
      deleteItem(id);
      setToastMsg('Item deleted successfully!');
      setTimeout(() => setToastMsg(''), 3000);
    }
  };

  const handleSaveSalesman = (id, name) => {
    if (name.trim()) {
      updateSalesmanName(id, name.trim());
      setToastMsg(`Saved successfully!`);
      setTimeout(() => setToastMsg(''), 3000);
    }
  };

  const getCustomerName = (cId) => {
    const c = customers?.find(cust => cust.id === cId || cust._id === cId);
    return c ? c.name : 'Unknown Customer';
  };

  const getSalesmanName = (sId) => {
    const s = salesmen?.find(sales => sales.id === sId);
    return s ? s.name : sId === 'sales1' ? 'Salesman 1' : sId === 'sales2' ? 'Salesman 2' : 'Unknown Salesman';
  };

  const formatDateFriendly = (dateStr) => {
    try {
      const options = { year: 'numeric', month: 'short', day: 'numeric' };
      const dateObj = new Date(dateStr);
      return dateObj.toLocaleDateString('en-US', options);
    } catch (e) {
      return dateStr;
    }
  };

  const formatTimeFriendly = (isoStr) => {
    try {
      const dateObj = new Date(isoStr);
      return dateObj.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    } catch (e) {
      return '';
    }
  };

  // Group bills by date
  const groupedBillsByDate = {};
  if (bills) {
    bills.forEach(bill => {
      const dateStr = bill.date ? bill.date.split('T')[0] : new Date().toISOString().split('T')[0];
      if (!groupedBillsByDate[dateStr]) {
        groupedBillsByDate[dateStr] = [];
      }
      groupedBillsByDate[dateStr].push(bill);
    });
  }

  const toggleDateExpanded = (date) => {
    setExpandedDates(prev => ({ ...prev, [date]: !prev[date] }));
  };

  const toggleBillExpanded = (billId) => {
    setExpandedBills(prev => ({ ...prev, [billId]: !prev[billId] }));
  };

  const sortedDates = Object.keys(groupedBillsByDate).sort((a, b) => b.localeCompare(a));

  const filteredItems = items.filter(item => 
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (item.id && item.id.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="min-h-screen p-4 md:p-8" style={{ paddingBottom: '60px' }}>
      {/* Toast Notification */}
      {toastMsg && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
          color: 'white',
          padding: '0.85rem 1.5rem',
          borderRadius: '12px',
          boxShadow: '0 10px 25px rgba(16, 185, 129, 0.3)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          zIndex: 9999,
          fontWeight: '600',
          fontSize: '0.95rem',
          border: '1px solid rgba(255,255,255,0.1)',
          animation: 'fadeIn 0.3s ease-out'
        }}>
          <Check size={18} />
          {toastMsg}
        </div>
      )}

      <header className="max-w-6xl mx-auto flex items-center justify-between mb-8 animate-fade-in glass-panel p-4">
        <div className="flex items-center gap-3">
          <button onClick={handleLogout} className="btn-icon">
            <ArrowLeft size={20} />
          </button>
          <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
            <Package size={20} color="white" />
          </div>
          <div className="hidden sm:block">
            <h2 className="text-xl font-bold m-0 text-white">Thriller Motors</h2>
            <p className="text-xs text-muted m-0">Admin Management Portal</p>
          </div>
        </div>
        <button onClick={handleLogout} className="btn btn-outline text-danger hover:border-danger">
          <LogOut size={18} />
          Back to Login
        </button>
      </header>

      <main className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 animate-fade-in gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <Sparkles size={24} className="text-primary" />
              Store Dashboard
            </h1>
            <p className="text-muted">Manage product catalog, salesman profiles & track real-time locations</p>
          </div>
          
          {activeTab === 'catalog' && (
            <button 
              onClick={() => setShowAddForm(!showAddForm)}
              className="btn btn-primary"
            >
              <Plus size={20} />
              {showAddForm ? 'Cancel' : 'Add New Item'}
            </button>
          )}
        </div>

        {/* Premium Dashboard Glass Tabs */}
        <div className="glass-panel mb-8 p-1 flex max-w-xl animate-fade-in" style={{
          background: 'rgba(15, 23, 42, 0.45)',
          borderRadius: '14px',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
          width: '100%'
        }}>
          <button 
            onClick={() => { setActiveTab('catalog'); setShowAddForm(false); }}
            style={{
              flex: 1,
              height: '40px',
              border: 'none',
              borderRadius: '10px',
              background: activeTab === 'catalog' ? 'rgba(99, 102, 241, 0.2)' : 'transparent',
              color: activeTab === 'catalog' ? '#ffffff' : '#cbd5e1',
              fontWeight: '700',
              fontSize: '0.85rem',
              cursor: 'pointer',
              border: activeTab === 'catalog' ? '1px solid rgba(99, 102, 241, 0.25)' : '1px solid transparent',
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.35rem'
            }}
          >
            <Package size={16} />
            Store Catalog
          </button>
          <button 
            onClick={() => { setActiveTab('gps'); setShowAddForm(false); }}
            style={{
              flex: 1,
              height: '40px',
              border: 'none',
              borderRadius: '10px',
              background: activeTab === 'gps' ? 'rgba(99, 102, 241, 0.2)' : 'transparent',
              color: activeTab === 'gps' ? '#ffffff' : '#cbd5e1',
              fontWeight: '700',
              fontSize: '0.85rem',
              cursor: 'pointer',
              border: activeTab === 'gps' ? '1px solid rgba(99, 102, 241, 0.25)' : '1px solid transparent',
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.35rem'
            }}
          >
            <Compass size={16} />
            Salesman GPS Radar
          </button>
          <button 
            onClick={() => { setActiveTab('sales'); setShowAddForm(false); }}
            style={{
              flex: 1,
              height: '40px',
              border: 'none',
              borderRadius: '10px',
              background: activeTab === 'sales' ? 'rgba(99, 102, 241, 0.2)' : 'transparent',
              color: activeTab === 'sales' ? '#ffffff' : '#cbd5e1',
              fontWeight: '700',
              fontSize: '0.85rem',
              cursor: 'pointer',
              border: activeTab === 'sales' ? '1px solid rgba(99, 102, 241, 0.25)' : '1px solid transparent',
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.35rem'
            }}
          >
            <FileText size={16} />
            Daily Sales
          </button>
        </div>

        {activeTab === 'catalog' && (
          <>
            {showAddForm && (
              <div className="glass-panel p-6 mb-8 animate-fade-in border border-primary/30">
                <h3 className="text-xl font-semibold mb-4 text-white">
                  {editingItem ? 'Edit Item' : 'Add New Item'}
                </h3>
                <form onSubmit={handleSubmitItem} className="flex flex-col md:flex-row gap-4 items-end">
                  <div className="flex-1 form-group m-0 w-full">
                    <label>Item Name</label>
                    <input 
                      type="text" 
                      value={newItem.name}
                      onChange={e => setNewItem({...newItem, name: e.target.value})}
                      placeholder="e.g. Premium Soap" 
                      required
                    />
                  </div>
                  <div className="flex-1 form-group m-0 w-full">
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
                  <button type="submit" className="btn btn-success h-12 px-8 w-full md:w-auto">
                    Save Item
                  </button>
                </form>
              </div>
            )}

            {/* 2-Column Responsive Dashboard Layout */}
            <div className="items-main-layout animate-fade-in">
              {/* Left Column: Product Table */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <h3 className="text-lg font-semibold text-white m-0">Product Catalog</h3>
                
                {/* Glowing Premium Search Bar */}
                <div style={{ position: 'relative', width: '100%', marginBottom: '0.25rem' }}>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="🔍 Search items by name or ID..."
                    style={{
                      width: '100%',
                      height: '42px',
                      background: 'rgba(15, 23, 42, 0.45)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '12px',
                      padding: '0 1rem',
                      color: 'white',
                      fontSize: '0.9rem',
                      outline: 'none',
                      transition: 'all 0.3s ease',
                      boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.2)'
                    }}
                    onFocus={e => { e.target.style.borderColor = '#6366f1'; e.target.style.boxShadow = '0 0 10px rgba(99,102,241,0.2)'; }}
                    onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.1)'; e.target.style.boxShadow = 'inset 0 2px 4px rgba(0,0,0,0.2)'; }}
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      style={{
                        position: 'absolute',
                        right: '12px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'transparent',
                        border: 'none',
                        color: '#94a3b8',
                        cursor: 'pointer',
                        fontSize: '0.8rem',
                        fontWeight: 'bold'
                      }}
                    >
                      Clear
                    </button>
                  )}
                </div>

                <div className="table-container">
                  <table>
                    <thead>
                      <tr>
                        <th>Item ID</th>
                        <th>Name</th>
                        <th>Price (LKR)</th>
                        <th style={{ textAlign: 'right' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredItems.length === 0 ? (
                        <tr>
                          <td colSpan="4" className="text-center py-8 text-muted">No matching items found.</td>
                        </tr>
                      ) : (
                        filteredItems.map(item => (
                          <tr key={item.id}>
                            <td className="text-muted font-mono">{item.id}</td>
                            <td className="font-medium text-white">{item.name}</td>
                            <td className="font-semibold text-primary">Rs. {parseFloat(item.price).toFixed(2)}</td>
                            <td style={{ textAlign: 'right' }}>
                              <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                                <button 
                                  onClick={() => handleEditItemClick(item)} 
                                  className="btn-icon border-primary/20 hover:border-primary text-primary"
                                  style={{ width: '32px', height: '32px', padding: 0, borderRadius: '8px' }}
                                >
                                  <Edit size={14} />
                                </button>
                                <button 
                                  onClick={() => handleDeleteItemClick(item.id)} 
                                  className="btn-icon border-danger/20 hover:border-danger text-danger"
                                  style={{ width: '32px', height: '32px', padding: 0, borderRadius: '8px' }}
                                >
                                  <Trash size={14} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Right Column: Manage Salesmen */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <h3 className="text-lg font-semibold text-white m-0">Manage Salesmen</h3>
                <div className="glass-panel p-6 flex flex-col gap-5 border border-surface-border">
                  <div className="flex items-center gap-2 border-b border-surface-border pb-3">
                    <Users size={20} className="text-primary" />
                    <span className="font-bold text-white text-sm">Edit Salesman Names</span>
                  </div>

                  {/* Salesman 1 form card */}
                  <div style={{
                    background: 'rgba(255,255,255,0.02)',
                    border: '1px solid rgba(236,72,153,0.15)',
                    borderRadius: '16px',
                    padding: '1.25rem'
                  }}>
                    <label style={{ color: '#f472b6', fontWeight: '700', fontSize: '0.8rem', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '0.5rem', display: 'block' }}>
                      Salesman 1 Name
                    </label>
                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        value={sales1Name}
                        onChange={e => setSales1Name(e.target.value)}
                        placeholder="Enter Custom Name"
                        style={{ height: '42px', fontSize: '0.95rem' }}
                      />
                      <button 
                        onClick={() => handleSaveSalesman('sales1', sales1Name)}
                        className="btn btn-primary"
                        style={{ height: '42px', padding: '0 1rem', minWidth: '70px' }}
                      >
                        Save
                      </button>
                    </div>
                  </div>

                  {/* Salesman 2 form card */}
                  <div style={{
                    background: 'rgba(255,255,255,0.02)',
                    border: '1px solid rgba(16,185,129,0.15)',
                    borderRadius: '16px',
                    padding: '1.25rem'
                  }}>
                    <label style={{ color: '#34d399', fontWeight: '700', fontSize: '0.8rem', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '0.5rem', display: 'block' }}>
                      Salesman 2 Name
                    </label>
                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        value={sales2Name}
                        onChange={e => setSales2Name(e.target.value)}
                        placeholder="Enter Custom Name"
                        style={{ height: '42px', fontSize: '0.95rem' }}
                      />
                      <button 
                        onClick={() => handleSaveSalesman('sales2', sales2Name)}
                        className="btn btn-primary"
                        style={{ height: '42px', padding: '0 1rem', minWidth: '70px' }}
                      >
                        Save
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {activeTab === 'gps' && (
          /* Live Sri Lankan Map GPS Hub View */
          <div className="gps-dashboard-grid animate-fade-in">
              
              {/* Sri Lanka Radar Map Panel */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <h3 className="text-lg font-semibold text-white m-0">Live Sri Lanka GPS Radar Map</h3>
                <div className="glass-panel p-5 border border-surface-border flex flex-col items-center justify-center text-center relative" style={{
                  background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.8) 0%, rgba(10, 15, 30, 0.95) 100%)',
                  boxShadow: '0 20px 40px rgba(0,0,0,0.6)'
                }}>
                  {/* Real-time Interactive Leaflet Map of Sri Lanka */}
                  <div id="leaflet-map" style={{
                    width: '100%',
                    height: '350px',
                    borderRadius: '16px',
                    border: '2px solid rgba(255, 255, 255, 0.1)',
                    boxShadow: 'inset 0 0 20px rgba(0, 0, 0, 0.6), 0 0 25px rgba(99, 102, 241, 0.1)',
                    background: '#090d16',
                    overflow: 'hidden',
                    zIndex: 1
                  }}>
                    {!leafletLoaded && (
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '0.5rem', color: '#cbd5e1' }}>
                        <Compass className="animate-spin text-primary" size={32} />
                        <span>Initializing Sri Lankan Map Grid...</span>
                      </div>
                    )}
                  </div>

                  {/* Simulator Control Board */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', width: '100%', marginTop: '1.25rem', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '1.25rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.8rem', fontWeight: '700', color: '#cbd5e1', letterSpacing: '0.05em' }}>GPS SIMULATOR CONTROL</span>
                      <span style={{ fontSize: '0.75rem', color: isSimulating ? '#34d399' : '#94a3b8', background: isSimulating ? 'rgba(52,211,153,0.12)' : 'rgba(255,255,255,0.04)', padding: '0.15rem 0.5rem', borderRadius: '20px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: isSimulating ? '#34d399' : '#94a3b8', display: 'inline-block', animation: isSimulating ? 'pulse 1s infinite' : 'none' }} />
                        {isSimulating ? 'SIMULATOR ACTIVE' : 'SIMULATOR STANDBY'}
                      </span>
                    </div>
                    <button 
                      onClick={() => setIsSimulating(!isSimulating)}
                      className={`btn w-full mt-2 py-3 flex items-center justify-center gap-2 ${isSimulating ? 'btn-danger' : 'btn-primary'}`}
                      style={{ height: '42px', borderRadius: '10px', fontSize: '0.85rem' }}
                    >
                      {isSimulating ? (
                        <>
                          <Square size={14} fill="white" />
                          Deactivate Route Simulation
                        </>
                      ) : (
                        <>
                          <Play size={14} fill="white" />
                          Activate Demo Route Simulation
                        </>
                      )}
                    </button>
                    <p style={{ fontSize: '0.75rem', color: '#cbd5e1', fontStyle: 'italic', margin: 0, marginTop: '0.25rem' }}>
                      * Simulates live traveling coordinates on administrative devices for previewing real-time compass movements.
                    </p>
                  </div>
                </div>
              </div>

              {/* Salesmen Fleet Tracking table */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <h3 className="text-lg font-semibold text-white m-0">Fleet Live Coordinates</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {salesmen.map(s => {
                    const hasSignal = s.isTracking && s.lat && s.lng;
                    return (
                      <div key={s.id} className="glass-panel p-5 border border-surface-border flex flex-col gap-4 animate-fade-in" style={{
                        background: 'rgba(30, 41, 59, 0.45)',
                        borderColor: hasSignal ? 'rgba(16, 185, 129, 0.25)' : 'rgba(255,255,255,0.08)'
                      }}>
                        {/* Title Header Row */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div>
                            <h4 style={{ margin: 0, color: 'white', fontSize: '1.1rem', fontWeight: '700' }}>{s.name}</h4>
                            <span style={{ fontSize: '0.75rem', color: '#cbd5e1', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Representative Profile</span>
                          </div>
                          
                          {/* Online indicator badge */}
                          <span style={{
                            fontSize: '0.7rem',
                            fontWeight: '700',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em',
                            padding: '0.25rem 0.55rem',
                            borderRadius: '20px',
                            background: hasSignal ? 'rgba(16, 185, 129, 0.1)' : 'rgba(255,255,255,0.04)',
                            border: `1px solid ${hasSignal ? 'rgba(16, 185, 129, 0.3)' : 'rgba(255,255,255,0.1)'}`,
                            color: hasSignal ? '#34d399' : '#cbd5e1',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.35rem'
                          }}>
                            <span style={{ 
                              width: '6px', 
                              height: '6px', 
                              borderRadius: '50%', 
                              background: hasSignal ? '#34d399' : '#cbd5e1', 
                              display: 'inline-block',
                              animation: hasSignal ? 'pulse 1.5s infinite' : 'none'
                            }} />
                            {hasSignal ? 'TRANSMITTING GPS' : 'SIGNAL OFFLINE'}
                          </span>
                        </div>

                        {/* Coordinate values */}
                        <div style={{ 
                          display: 'grid', 
                          gridTemplateColumns: '1fr 1fr', 
                          gap: '0.75rem', 
                          background: 'rgba(0,0,0,0.2)', 
                          padding: '0.75rem 1rem', 
                          borderRadius: '12px',
                          border: '1px solid rgba(255,255,255,0.05)'
                        }}>
                          <div>
                            <span style={{ display: 'block', fontSize: '0.65rem', color: '#94a3b8', fontWeight: '700', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '0.15rem' }}>Latitude</span>
                            <span style={{ fontSize: '1rem', fontWeight: '800', color: hasSignal ? 'white' : '#cbd5e1', fontFamily: 'monospace' }}>
                              {hasSignal ? s.lat.toFixed(6) : 'N/A'}
                            </span>
                          </div>
                          <div>
                            <span style={{ display: 'block', fontSize: '0.65rem', color: '#94a3b8', fontWeight: '700', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '0.15rem' }}>Longitude</span>
                            <span style={{ fontSize: '1rem', fontWeight: '800', color: hasSignal ? 'white' : '#cbd5e1', fontFamily: 'monospace' }}>
                              {hasSignal ? s.lng.toFixed(6) : 'N/A'}
                            </span>
                          </div>
                        </div>

                        {/* Telemetry metadata & maps link */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: '0.75rem', color: '#cbd5e1' }}>
                            {hasSignal ? (
                              <>Last Ping: <strong style={{ color: '#34d399' }}>Just Now</strong></>
                            ) : (
                              'Waiting for active transmission'
                            )}
                          </span>
                          
                          {hasSignal && (
                            <a 
                              href={`https://www.google.com/maps?q=${s.lat},${s.lng}`}
                              target="_blank"
                              rel="noreferrer"
                              className="btn btn-outline"
                              style={{ 
                                height: '36px', 
                                padding: '0 0.75rem', 
                                fontSize: '0.75rem', 
                                fontWeight: '700', 
                                borderRadius: '8px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.35rem',
                                color: '#34d399',
                                borderColor: 'rgba(16, 185, 129, 0.3)'
                              }}
                            >
                              <ExternalLink size={12} />
                              Open Google Maps
                            </a>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

        {activeTab === 'sales' && (
          <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-white m-0 flex items-center gap-2">
                  <FileText size={22} className="text-primary" />
                  Daily Sales Ledger
                </h2>
                <p className="text-muted text-sm m-0">Review chronological sales history, daily revenues, and salesman billing reports</p>
              </div>
              <div className="glass-panel py-2 px-4 border border-surface-border text-center sm:text-right" style={{ background: 'rgba(15,23,42,0.45)', borderRadius: '12px' }}>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', textTransform: 'uppercase', fontWeight: '700', letterSpacing: '0.05em' }}>All-Time Sales</span>
                <span style={{ fontSize: '1.25rem', fontWeight: '900', color: '#34d399' }}>
                  Rs. {bills?.filter(b => b.status !== 'cancelled').reduce((sum, b) => sum + (parseFloat(b.total) || 0), 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            {sortedDates.length === 0 ? (
              <div className="glass-panel p-8 text-center text-muted border border-surface-border" style={{ padding: '3rem 1.5rem' }}>
                <Calendar size={36} className="mx-auto mb-3 text-muted/50" />
                <p className="m-0 font-medium text-white">No sales bills recorded yet.</p>
                <p className="text-xs text-muted/60 mt-1">Once representatives issue bills, they will appear here grouped by date!</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {sortedDates.map(date => {
                  const dayBills = groupedBillsByDate[date];
                  const activeBills = dayBills.filter(b => b.status !== 'cancelled');
                  const dailyTotal = activeBills.reduce((sum, b) => sum + (parseFloat(b.total) || 0), 0);
                  const isExpanded = expandedDates[date] || false;

                  return (
                    <div 
                      key={date} 
                      className="glass-panel border animate-fade-in"
                      style={{
                        borderColor: isExpanded ? 'rgba(99, 102, 241, 0.3)' : 'rgba(255, 255, 255, 0.08)',
                        background: isExpanded ? 'linear-gradient(180deg, rgba(30, 41, 59, 0.65) 0%, rgba(15, 23, 42, 0.9) 100%)' : 'rgba(30, 41, 59, 0.25)',
                        transition: 'all 0.3s ease',
                        overflow: 'hidden',
                        padding: 0
                      }}
                    >
                      {/* Date Header Row */}
                      <div 
                        onClick={() => toggleDateExpanded(date)}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          padding: '1.25rem 1.5rem',
                          cursor: 'pointer',
                          userSelect: 'none'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <div style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '10px',
                            background: isExpanded ? 'rgba(99, 102, 241, 0.15)' : 'rgba(255, 255, 255, 0.04)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: isExpanded ? '#818cf8' : '#cbd5e1'
                          }}>
                            <Calendar size={18} />
                          </div>
                          <div>
                            <h4 style={{ margin: 0, color: 'white', fontSize: '1.05rem', fontWeight: '700' }}>
                              {formatDateFriendly(date)}
                            </h4>
                            <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                              {dayBills.length} {dayBills.length === 1 ? 'Bill' : 'Bills'} Issued
                            </span>
                          </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                          <div style={{ textAlign: 'right' }}>
                            <span style={{ display: 'block', fontSize: '0.65rem', color: '#94a3b8', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Daily Revenue</span>
                            <span style={{ fontSize: '1.15rem', fontWeight: '800', color: '#10b981' }}>
                              Rs. {dailyTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </span>
                          </div>
                          <div style={{ color: '#94a3b8' }}>
                            {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                          </div>
                        </div>
                      </div>

                      {/* Bills Accordion Content */}
                      {isExpanded && (
                        <div style={{
                          borderTop: '1px solid rgba(255,255,255,0.06)',
                          padding: '1.25rem 1.5rem',
                          background: 'rgba(10, 15, 30, 0.35)',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '1rem'
                        }}>
                          {dayBills.map(bill => {
                            const billId = bill.id || bill._id;
                            const isBillExpanded = expandedBills[billId] || false;
                            
                            // Status colors
                            let statusColor = '#eab308'; // pending
                            let statusBg = 'rgba(234, 179, 8, 0.1)';
                            let statusBorder = 'rgba(234, 179, 8, 0.2)';
                            if (bill.status === 'delivered') {
                              statusColor = '#10b981';
                              statusBg = 'rgba(16, 185, 129, 0.1)';
                              statusBorder = 'rgba(16, 185, 129, 0.2)';
                            } else if (bill.status === 'cancelled') {
                              statusColor = '#ef4444';
                              statusBg = 'rgba(239, 68, 68, 0.1)';
                              statusBorder = 'rgba(239, 68, 68, 0.2)';
                            }

                            return (
                              <div 
                                key={billId} 
                                style={{
                                  background: 'rgba(30, 41, 59, 0.25)',
                                  border: '1px solid rgba(255, 255, 255, 0.05)',
                                  borderRadius: '12px',
                                  padding: '1rem',
                                  display: 'flex',
                                  flexDirection: 'column',
                                  gap: '0.75rem'
                                }}
                              >
                                <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem' }}>
                                  <div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                      <span style={{ color: 'white', fontWeight: '700', fontSize: '0.95rem' }}>
                                        {getCustomerName(bill.customerId)}
                                      </span>
                                      <span style={{
                                        fontSize: '0.65rem',
                                        fontWeight: '700',
                                        color: statusColor,
                                        background: statusBg,
                                        border: `1px solid ${statusBorder}`,
                                        padding: '0.15rem 0.45rem',
                                        borderRadius: '20px',
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.04em'
                                      }}>
                                        {bill.status}
                                      </span>
                                    </div>
                                    <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                                      By: <strong style={{ color: '#c7d2fe' }}>{getSalesmanName(bill.salesmanId)}</strong> &bull; {formatTimeFriendly(bill.date)}
                                    </span>
                                  </div>

                                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    <div style={{ textAlign: 'right' }}>
                                      <span style={{ fontSize: '1rem', fontWeight: '800', color: bill.status === 'cancelled' ? '#94a3b8' : 'white' }}>
                                        Rs. {bill.total.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                      </span>
                                    </div>
                                    <button 
                                      onClick={() => toggleBillExpanded(billId)}
                                      className="btn btn-outline"
                                      style={{ height: '32px', padding: '0 0.5rem', fontSize: '0.75rem', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.1)' }}
                                    >
                                      {isBillExpanded ? 'Hide Items' : 'View Items'}
                                    </button>
                                  </div>
                                </div>

                                {/* Bill Items Detailed Summary Accordion */}
                                {isBillExpanded && (
                                  <div style={{ 
                                    background: 'rgba(0,0,0,0.25)', 
                                    padding: '0.85rem', 
                                    borderRadius: '8px', 
                                    border: '1px solid rgba(255,255,255,0.03)',
                                    animation: 'fadeIn 0.2s ease-out',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '0.6rem'
                                  }}>
                                    <span style={{ fontSize: '0.65rem', color: '#94a3b8', fontWeight: '700', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                                      BILL ITEMS LIST
                                    </span>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                                      {bill.items.map((bi, idx) => (
                                        <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#e2e8f0' }}>
                                          <span>
                                            {bi.name} <span style={{ color: '#94a3b8', fontSize: '0.75rem' }}>({bi.qty} x Rs. {bi.price})</span>
                                          </span>
                                          <span style={{ fontWeight: '600' }}>
                                            Rs. {bi.total.toLocaleString('en-US')}
                                          </span>
                                        </div>
                                      ))}
                                    </div>
                                    
                                    <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '0.5rem', marginTop: '0.2rem', display: 'flex', flexDirection: 'column', gap: '0.25rem', fontSize: '0.75rem', color: '#cbd5e1' }}>
                                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span>Subtotal:</span>
                                        <span>Rs. {bill.subtotal.toLocaleString('en-US')}</span>
                                      </div>
                                      {bill.discountAmount > 0 && (
                                        <div style={{ display: 'flex', justifyContent: 'space-between', color: '#f87171' }}>
                                          <span>Discount ({bill.discountType === 'percent' ? `${bill.discountValue}%` : 'Cash'}):</span>
                                          <span>- Rs. {bill.discountAmount.toLocaleString('en-US')}</span>
                                        </div>
                                      )}
                                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: '700', color: 'white', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '0.3rem', marginTop: '0.15rem' }}>
                                        <span>Net Total:</span>
                                        <span style={{ color: '#34d399' }}>Rs. {bill.total.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default ItemsPage;
