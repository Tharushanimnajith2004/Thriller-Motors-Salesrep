import React from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useStore } from '../../store/StoreContext';
import { Map, User, LogOut, Search, Truck } from 'lucide-react';

const SalesLayout = () => {
  const { logout, currentUser, salesmen } = useStore();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isRouteActive = location.pathname === '/sales' || location.pathname.includes('/route/');
  const isProfileActive = location.pathname.includes('/profile');
  const isDeliveriesActive = location.pathname.includes('/deliveries');
  const salesmanName = salesmen?.find(s => s.id === currentUser)?.name || currentUser;

  return (
    <div className="mobile-layout">
      {/* Top Header */}
      <header className="mobile-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ width: '38px', height: '38px', borderRadius: '50%', overflow: 'hidden', border: '2px solid rgba(99, 102, 241, 0.6)', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <img src="/logo.png" alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
          <div>
            <h2 className="text-md font-bold text-white m-0" style={{ fontSize: '0.9rem', letterSpacing: '0.05em', lineHeight: '1.2' }}>THRILLER MOTORS</h2>
            <p className="text-xs text-muted m-0" style={{ fontSize: '0.75rem', fontWeight: '600', color: '#a5b4fc', textTransform: 'capitalize' }}>{salesmanName}</p>
          </div>
        </div>
        <button onClick={handleLogout} className="btn-icon text-danger hover:text-red-400 border-none" style={{ background: 'transparent', border: 'none' }}>
          <LogOut size={20} />
        </button>
      </header>

      {/* Main Content Area */}
      <main className="mobile-content">
        <Outlet />
      </main>

      {/* Bottom Navigation */}
      <nav className="bottom-nav">
        <button 
          onClick={() => navigate('/sales')}
          className={`nav-item bg-transparent border-none ${isRouteActive ? 'active text-primary' : ''}`}
        >
          <Map size={24} />
          <span>Routes</span>
        </button>
        
        <button 
          onClick={() => navigate('/sales/deliveries')}
          className={`nav-item bg-transparent border-none ${isDeliveriesActive ? 'active text-primary' : ''}`}
        >
          <Truck size={20} />
          <span>Deliveries</span>
        </button>
        
        <button 
          onClick={() => navigate('/sales/profile')}
          className={`nav-item bg-transparent border-none ${isProfileActive ? 'active text-primary' : ''}`}
        >
          <User size={24} />
          <span>Profile</span>
        </button>
      </nav>
    </div>
  );
};

export default SalesLayout;
