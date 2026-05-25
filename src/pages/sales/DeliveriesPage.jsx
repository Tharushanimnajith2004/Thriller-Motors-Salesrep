import React, { useState } from 'react';
import { useStore } from '../../store/StoreContext';
import { Truck, Check, X, Calendar, MapPin, AlertCircle, ShoppingBag, ListOrdered } from 'lucide-react';

const DeliveriesPage = () => {
  const { bills, customers, routes, updateBill, currentUser } = useStore();
  const [selectedDate, setSelectedDate] = useState(() => {
    return new Date().toISOString().split('T')[0];
  });
  const [activeTab, setActiveTab] = useState('date'); // 'date' or 'schedule'

  // Filter bills scheduled for this date and for this salesman
  const dayDeliveries = bills
    .filter(b => {
      const matchDate = b.deliveryDate === selectedDate;
      const matchSalesman = b.salesmanId === currentUser;
      return matchDate && matchSalesman;
    })
    // Sort by order creation time (oldest/earliest first)
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  // Filter all pending deliveries sorted by planned delivery date
  const pendingDeliveries = bills
    .filter(b => b.salesmanId === currentUser && (!b.status || b.status === 'pending'))
    .sort((a, b) => {
      if (!a.deliveryDate) return 1;
      if (!b.deliveryDate) return -1;
      return new Date(a.deliveryDate) - new Date(b.deliveryDate);
    });

  const handleUpdateStatus = (billId, status) => {
    updateBill(billId, { status });
  };

  const getCustomerInfo = (customerId) => {
    const cust = customers.find(c => c.id === customerId);
    if (!cust) return { name: 'Unknown Customer', address: 'No Address', routeName: 'No Route' };
    const route = routes.find(r => r.id === cust.routeId);
    return {
      name: cust.name,
      address: cust.address,
      routeName: route ? route.name : 'Unknown Route'
    };
  };

  return (
    <div className="animate-fade-in" style={{ padding: '0.5rem', paddingBottom: '30px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
        <Truck size={24} className="text-primary" />
        <h1 className="text-2xl font-bold text-white m-0">Deliveries</h1>
      </div>

      {/* Premium Glass Custom Tabs */}
      <div className="glass-panel mb-6" style={{
        background: 'rgba(15, 23, 42, 0.45)',
        display: 'flex',
        padding: '4px',
        borderRadius: '14px',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.3)'
      }}>
        <button 
          onClick={() => setActiveTab('date')}
          style={{
            flex: 1,
            height: '38px',
            border: 'none',
            borderRadius: '10px',
            background: activeTab === 'date' ? 'rgba(99, 102, 241, 0.2)' : 'transparent',
            color: activeTab === 'date' ? '#ffffff' : '#cbd5e1',
            fontWeight: '700',
            fontSize: '0.85rem',
            cursor: 'pointer',
            border: activeTab === 'date' ? '1px solid rgba(99, 102, 241, 0.25)' : '1px solid transparent',
            transition: 'all 0.2s',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.35rem'
          }}
        >
          <Calendar size={14} />
          Day Schedule
        </button>
        <button 
          onClick={() => setActiveTab('schedule')}
          style={{
            flex: 1,
            height: '38px',
            border: 'none',
            borderRadius: '10px',
            background: activeTab === 'schedule' ? 'rgba(99, 102, 241, 0.2)' : 'transparent',
            color: activeTab === 'schedule' ? '#ffffff' : '#cbd5e1',
            fontWeight: '700',
            fontSize: '0.85rem',
            cursor: 'pointer',
            border: activeTab === 'schedule' ? '1px solid rgba(99, 102, 241, 0.25)' : '1px solid transparent',
            transition: 'all 0.2s',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.35rem'
          }}
        >
          <ListOrdered size={14} />
          All Pending (Sorted)
        </button>
      </div>

      {activeTab === 'date' ? (
        <>
          {/* Date Picker Header Card */}
          <div className="glass-panel p-4 mb-6 border border-surface-border" style={{
            background: 'rgba(30, 41, 59, 0.5)',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Calendar size={18} className="text-primary" />
              <span style={{ fontSize: '0.85rem', fontWeight: '700', color: 'white', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Select Delivery Date</span>
            </div>
            <input 
              type="date"
              value={selectedDate}
              onChange={e => setSelectedDate(e.target.value)}
              style={{
                height: '46px',
                background: 'rgba(0,0,0,0.3)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '12px',
                color: 'white',
                padding: '0.75rem',
                fontSize: '1rem',
                outline: 'none'
              }}
            />
          </div>

          {/* Deliveries List */}
          <h3 className="font-bold text-white mb-4 flex justify-between items-center animate-fade-in">
            <span style={{ fontSize: '0.95rem' }}>Deliveries for {new Date(selectedDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
            <span style={{ fontSize: '0.8rem', background: 'rgba(99,102,241,0.15)', padding: '0.2rem 0.6rem', borderRadius: '20px', border: '1px solid rgba(99,102,241,0.25)', color: '#a5b4fc' }}>
              {dayDeliveries.length} orders
            </span>
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }} className="animate-fade-in">
            {dayDeliveries.length === 0 ? (
              <div className="text-center p-8 glass-panel border border-surface-border" style={{ background: 'rgba(30, 41, 59, 0.2)' }}>
                <ShoppingBag size={48} className="text-muted mx-auto mb-3 opacity-40" />
                <p className="text-muted m-0" style={{ fontSize: '0.9rem' }}>No deliveries scheduled for this day.</p>
              </div>
            ) : (
              dayDeliveries.map(bill => {
                const custInfo = getCustomerInfo(bill.customerId);
                
                // Status colors
                let statusBg = 'rgba(234, 179, 8, 0.1)';
                let statusBorder = 'rgba(234, 179, 8, 0.25)';
                let statusColor = '#eab308';
                let statusText = 'Pending Delivery';
                
                if (bill.status === 'delivered') {
                  statusBg = 'rgba(16, 185, 129, 0.1)';
                  statusBorder = 'rgba(16, 185, 129, 0.25)';
                  statusColor = '#34d399';
                  statusText = 'Delivered';
                } else if (bill.status === 'cancelled') {
                  statusBg = 'rgba(239, 68, 68, 0.1)';
                  statusBorder = 'rgba(239, 68, 68, 0.25)';
                  statusColor = '#f87171';
                  statusText = 'Cancelled';
                }

                return (
                  <div key={bill.id} className="glass-panel p-4 border border-surface-border animate-fade-in" style={{
                    background: 'rgba(30, 41, 59, 0.45)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.85rem'
                  }}>
                    {/* Customer Details Row */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: '700', color: 'white' }}>{custInfo.name}</h4>
                        <span style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.15rem' }}>
                          <MapPin size={12} />
                          {custInfo.address} • <strong style={{ color: '#818cf8' }}>{custInfo.routeName}</strong>
                        </span>
                      </div>
                      <span style={{
                        fontSize: '0.7rem',
                        fontWeight: '700',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        padding: '0.25rem 0.5rem',
                        borderRadius: '6px',
                        background: statusBg,
                        border: `1px solid ${statusBorder}`,
                        color: statusColor
                      }}>
                        {statusText}
                      </span>
                    </div>

                    {/* Bill Summary Row */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(0,0,0,0.2)', padding: '0.65rem 0.75rem', borderRadius: '10px' }}>
                      <div style={{ fontSize: '0.75rem', color: '#cbd5e1' }}>
                        {bill.items.length} items • Issued at {new Date(bill.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                      <div style={{ fontSize: '1.15rem', fontWeight: '800', color: 'white' }}>
                        Rs. {Number(bill.total).toFixed(2)}
                      </div>
                    </div>

                    {/* Pending Actions */}
                    {(!bill.status || bill.status === 'pending') && (
                      <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.25rem' }}>
                        <button
                          onClick={() => handleUpdateStatus(bill.id, 'delivered')}
                          style={{
                            flex: 1,
                            height: '42px',
                            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                            border: 'none',
                            borderRadius: '10px',
                            color: 'white',
                            fontWeight: '700',
                            fontSize: '0.85rem',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.35rem',
                            boxShadow: '0 4px 10px rgba(16, 185, 129, 0.2)'
                          }}
                        >
                          <Check size={16} />
                          Delivered
                        </button>
                        <button
                          onClick={() => handleUpdateStatus(bill.id, 'cancelled')}
                          style={{
                            flex: 1,
                            height: '42px',
                            background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                            border: 'none',
                            borderRadius: '10px',
                            color: 'white',
                            fontWeight: '700',
                            fontSize: '0.85rem',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.35rem',
                            boxShadow: '0 4px 10px rgba(239, 68, 68, 0.2)'
                          }}
                        >
                          <X size={16} />
                          Cancel
                        </button>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </>
      ) : (
        /* Schedule Tab - Ordered by Delivery Date */
        <div className="animate-fade-in">
          <h3 className="font-bold text-white mb-4 flex justify-between items-center">
            <span style={{ fontSize: '0.95rem' }}>Pending Schedules (Chronological)</span>
            <span style={{ fontSize: '0.8rem', background: 'rgba(234,179,8,0.15)', padding: '0.2rem 0.6rem', borderRadius: '20px', border: '1px solid rgba(234,179,8,0.25)', color: '#fef08a' }}>
              {pendingDeliveries.length} pending
            </span>
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {pendingDeliveries.length === 0 ? (
              <div className="text-center p-8 glass-panel border border-surface-border" style={{ background: 'rgba(30, 41, 59, 0.2)' }}>
                <Check size={48} className="text-success mx-auto mb-3 opacity-65" />
                <p className="text-muted m-0" style={{ fontSize: '0.9rem', color: '#cbd5e1' }}>All caught up! No pending deliveries.</p>
              </div>
            ) : (
              pendingDeliveries.map(bill => {
                const custInfo = getCustomerInfo(bill.customerId);

                return (
                  <div key={bill.id} className="glass-panel p-4 border border-surface-border animate-fade-in" style={{
                    background: 'rgba(30, 41, 59, 0.45)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.85rem'
                  }}>
                    {/* Scheduled Delivery Header banner */}
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '0.45rem', 
                      background: 'rgba(99, 102, 241, 0.12)', 
                      padding: '0.4rem 0.6rem', 
                      borderRadius: '8px', 
                      border: '1px solid rgba(99, 102, 241, 0.25)',
                      color: '#a5b4fc',
                      fontSize: '0.75rem',
                      fontWeight: '700'
                    }}>
                      <Calendar size={12} />
                      Planned Date: {bill.deliveryDate ? new Date(bill.deliveryDate).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }) : 'Not set'}
                    </div>

                    {/* Customer Details Row */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: '700', color: 'white' }}>{custInfo.name}</h4>
                        <span style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.15rem' }}>
                          <MapPin size={12} />
                          {custInfo.address} • <strong style={{ color: '#818cf8' }}>{custInfo.routeName}</strong>
                        </span>
                      </div>
                      <div style={{ fontSize: '1.15rem', fontWeight: '800', color: 'white', alignSelf: 'center' }}>
                        Rs. {Number(bill.total).toFixed(2)}
                      </div>
                    </div>

                    <div style={{ fontSize: '0.75rem', color: '#cbd5e1', background: 'rgba(0,0,0,0.15)', padding: '0.4rem 0.6rem', borderRadius: '8px' }}>
                      {bill.items.length} items • Issued {new Date(bill.date).toLocaleDateString()} at {new Date(bill.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>

                    {/* Action buttons */}
                    <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.25rem' }}>
                      <button
                        onClick={() => handleUpdateStatus(bill.id, 'delivered')}
                        style={{
                          flex: 1,
                          height: '42px',
                          background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                          border: 'none',
                          borderRadius: '10px',
                          color: 'white',
                          fontWeight: '700',
                          fontSize: '0.85rem',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '0.35rem',
                          boxShadow: '0 4px 10px rgba(16, 185, 129, 0.2)'
                        }}
                      >
                        <Check size={16} />
                        Delivered
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(bill.id, 'cancelled')}
                        style={{
                          flex: 1,
                          height: '42px',
                          background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                          border: 'none',
                          borderRadius: '10px',
                          color: 'white',
                          fontWeight: '700',
                          fontSize: '0.85rem',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '0.35rem',
                          boxShadow: '0 4px 10px rgba(239, 68, 68, 0.2)'
                        }}
                      >
                        <X size={16} />
                        Cancel
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default DeliveriesPage;
