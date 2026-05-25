import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../../store/StoreContext';
import { MapPin, Plus, ChevronRight, Target, Edit2, TrendingUp, CheckCircle, Trash } from 'lucide-react';

const RoutesView = () => {
  const { routes, addRoute, updateRoute, deleteRoute, bills, customers, currentUser, dailyTargets, updateDailyTarget } = useStore();
  const navigate = useNavigate();
  const [showAdd, setShowAdd] = useState(false);
  const [editingRoute, setEditingRoute] = useState(null);
  const [newRouteName, setNewRouteName] = useState('');

  // Daily target edit states
  const [showEditTarget, setShowEditTarget] = useState(false);
  const [newTargetInput, setNewTargetInput] = useState('');

  const handleAddRoute = (e) => {
    e.preventDefault();
    if (newRouteName.trim()) {
      if (editingRoute) {
        updateRoute(editingRoute.id, { name: newRouteName.trim() });
      } else {
        addRoute({ name: newRouteName.trim() });
      }
      setNewRouteName('');
      setEditingRoute(null);
      setShowAdd(false);
    }
  };

  const handleEditRouteClick = (e, route) => {
    e.stopPropagation();
    setEditingRoute(route);
    setNewRouteName(route.name);
    setShowAdd(true);
  };

  const handleDeleteRouteClick = (e, id) => {
    e.stopPropagation();
    if (window.confirm("Are you sure you want to delete this route? This will also delete all customers and bills inside this route!")) {
      deleteRoute(id);
    }
  };

  // Target Calculations
  const currentTarget = dailyTargets?.[currentUser] || 25000;
  const salesmanBills = bills.filter(b => b.salesmanId === currentUser);
  const totalAchieved = salesmanBills.reduce((sum, b) => sum + (parseFloat(b.total) || 0), 0);
  const remaining = Math.max(0, currentTarget - totalAchieved);
  const progressPercent = Math.min(100, (totalAchieved / currentTarget) * 100);

  // Monthly Sales Calculations (Only Delivered Bills!)
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const monthlyDeliveredBills = bills.filter(b => 
    b.salesmanId === currentUser && 
    b.status === 'delivered' &&
    new Date(b.date).getMonth() === currentMonth &&
    new Date(b.date).getFullYear() === currentYear
  );
  const monthlySalesTotal = monthlyDeliveredBills.reduce((sum, b) => sum + (parseFloat(b.total) || 0), 0);

  const handleSaveTarget = (e) => {
    e.preventDefault();
    const val = parseFloat(newTargetInput);
    if (val > 0) {
      updateDailyTarget(currentUser, val);
      setShowEditTarget(false);
    }
  };

  return (
    <div className="animate-fade-in">
      
      {/* Daily Target Progress Card */}
      <div className="glass-panel p-5 mb-6 border animate-fade-in" style={{
        background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.12) 0%, rgba(15, 23, 42, 0.8) 100%)',
        borderColor: 'rgba(99, 102, 241, 0.3)',
        boxShadow: '0 15px 30px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255,255,255,0.1)',
        borderRadius: '24px',
        padding: '1.25rem 1.5rem'
      }}>
        
        {/* Header row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'rgba(99, 102, 241, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#818cf8' }}>
              <Target size={16} />
            </div>
            <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#a5b4fc', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Daily Target Progress</span>
          </div>
          <button 
            onClick={() => { setNewTargetInput(currentTarget.toString()); setShowEditTarget(!showEditTarget); }}
            style={{ background: 'rgba(255, 255, 255, 0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '0.4rem 0.75rem', color: '#c7d2fe', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.75rem', fontWeight: '600', outline: 'none', transition: 'all 0.2s' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = '#ffffff'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = '#c7d2fe'; }}
          >
            <Edit2 size={12} />
            Edit
          </button>
        </div>

        {showEditTarget ? (
          <form onSubmit={handleSaveTarget} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <input 
              type="number"
              value={newTargetInput}
              onChange={e => setNewTargetInput(e.target.value)}
              min="1"
              required
              style={{ flex: 1, height: '38px', padding: '0.5rem 0.75rem', borderRadius: '10px', fontSize: '0.9rem', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(99,102,241,0.3)', color: 'white' }}
            />
            <button type="submit" className="btn btn-primary" style={{ padding: '0 1rem', height: '38px', borderRadius: '10px', fontSize: '0.85rem' }}>Save</button>
            <button type="button" onClick={() => setShowEditTarget(false)} className="btn btn-outline" style={{ padding: '0 1rem', height: '38px', borderRadius: '10px', fontSize: '0.85rem' }}>Cancel</button>
          </form>
        ) : (
          <div>
            {/* 2-Column Balance Amounts Section */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <span style={{ display: 'block', fontSize: '0.65rem', fontWeight: '700', color: '#94a3b8', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '0.15rem' }}>Achieved Today</span>
                <span style={{ fontSize: '1.5rem', fontWeight: '900', color: 'white', lineHeight: '1.2' }}>
                  Rs. {totalAchieved.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ display: 'block', fontSize: '0.65rem', fontWeight: '700', color: '#94a3b8', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '0.15rem' }}>Target Limit</span>
                <span style={{ fontSize: '1.5rem', fontWeight: '900', color: '#818cf8', lineHeight: '1.2' }}>
                  Rs. {currentTarget.toLocaleString(undefined, { minimumFractionDigits: 0 })}
                </span>
              </div>
            </div>

            {/* Premium Gradient Progress Bar */}
            <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.06)', borderRadius: '999px', overflow: 'hidden', marginBottom: '1rem', border: '1px solid rgba(255,255,255,0.08)' }}>
              <div style={{ 
                width: `${progressPercent}%`, 
                height: '100%', 
                background: 'linear-gradient(90deg, #6366f1 0%, #ec4899 100%)', 
                borderRadius: '999px',
                boxShadow: '0 0 10px rgba(99, 102, 241, 0.5)',
                transition: 'width 0.5s cubic-bezier(0.4, 0, 0.2, 1)'
              }}></div>
            </div>

            {/* Footer Status Indicators */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              {remaining > 0 ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', background: 'rgba(244, 114, 182, 0.08)', padding: '0.25rem 0.6rem', borderRadius: '8px', border: '1px solid rgba(244, 114, 182, 0.15)' }}>
                  <TrendingUp size={12} style={{ color: '#f472b6' }} />
                  <span style={{ fontSize: '0.75rem', color: '#cbd5e1', fontWeight: '600' }}>
                    Remaining: <strong style={{ color: '#f472b6' }}>Rs. {remaining.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
                  </span>
                </div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', background: 'rgba(52, 211, 153, 0.08)', padding: '0.25rem 0.6rem', borderRadius: '8px', border: '1px solid rgba(52, 211, 153, 0.15)', color: '#34d399' }}>
                  <CheckCircle size={12} />
                  <span style={{ fontSize: '0.75rem', fontWeight: '700', letterSpacing: '0.02em' }}>
                    Target Achieved! 🎉
                  </span>
                </div>
              )}
              
              <div style={{ background: 'rgba(99, 102, 241, 0.08)', padding: '0.25rem 0.6rem', borderRadius: '8px', border: '1px solid rgba(99, 102, 241, 0.15)' }}>
                <span style={{ fontSize: '0.75rem', color: '#c7d2fe', fontWeight: '700' }}>
                  {progressPercent.toFixed(0)}% Done
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Monthly Sales Card */}
      <div className="glass-panel p-4 mb-6 border animate-fade-in" style={{
        background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, rgba(15, 23, 42, 0.8) 100%)',
        borderColor: 'rgba(16, 185, 129, 0.25)',
        boxShadow: '0 15px 30px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255,255,255,0.1)',
        borderRadius: '24px',
        padding: '1.25rem 1.5rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.85rem' }}>
          <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#34d399' }}>
            <TrendingUp size={16} />
          </div>
          <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#34d399', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Monthly Sales Progress</span>
        </div>

        <div>
          <span style={{ display: 'block', fontSize: '0.65rem', fontWeight: '700', color: '#cbd5e1', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '0.15rem' }}>Delivered Sales (this month)</span>
          <span style={{ fontSize: '1.65rem', fontWeight: '900', color: 'white', lineHeight: '1.2' }}>
            Rs. {monthlySalesTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
          <span style={{ display: 'block', fontSize: '0.7rem', color: '#cbd5e1', marginTop: '0.45rem', fontStyle: 'italic' }}>
            * Only bills marked as "Delivered" are added to your monthly sales total.
          </span>
        </div>
      </div>

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white m-0">My Routes</h1>
        <button 
          onClick={() => setShowAdd(!showAdd)}
          className="btn-icon bg-primary text-white border-primary"
        >
          <Plus size={20} />
        </button>
      </div>

      {showAdd && (
        <form onSubmit={handleAddRoute} className="glass-panel p-4 mb-6 animate-fade-in border border-primary/20">
          <div className="form-group mb-4">
            <label>{editingRoute ? 'Edit Route Name' : 'Route Name'}</label>
            <input 
              type="text" 
              value={newRouteName}
              onChange={e => setNewRouteName(e.target.value)}
              placeholder="e.g. Colombo South" 
              autoFocus
              required
            />
          </div>
          <div className="flex gap-2">
            <button type="submit" className="btn btn-primary flex-1">Save</button>
            <button type="button" onClick={() => { setShowAdd(false); setEditingRoute(null); setNewRouteName(''); }} className="btn btn-outline flex-1">Cancel</button>
          </div>
        </form>
      )}

      <div className="flex flex-col gap-3" style={{ paddingBottom: '20px' }}>
        {routes.length === 0 ? (
          <div className="text-center p-8 glass-panel">
            <MapPin size={48} className="text-muted mx-auto mb-4 opacity-50" />
            <p className="text-muted">No routes found. Create your first route.</p>
          </div>
        ) : (
          routes.map(route => (
            <div 
              key={route.id} 
              onClick={() => navigate(`/sales/route/${route.id}`)}
              className="list-item cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                  <MapPin size={20} />
                </div>
                <span className="font-medium text-lg text-white">{route.name}</span>
              </div>
              <div className="flex items-center gap-3">
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button 
                    onClick={(e) => handleEditRouteClick(e, route)}
                    className="btn-icon border-primary/20 hover:border-primary text-primary"
                    style={{ width: '32px', height: '32px', padding: 0, borderRadius: '8px' }}
                  >
                    <Edit2 size={12} />
                  </button>
                  <button 
                    onClick={(e) => handleDeleteRouteClick(e, route.id)}
                    className="btn-icon border-danger/20 hover:border-danger text-danger"
                    style={{ width: '32px', height: '32px', padding: 0, borderRadius: '8px' }}
                  >
                    <Trash size={12} />
                  </button>
                </div>
                <ChevronRight size={20} className="text-muted" />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default RoutesView;
