import React, { useState, useEffect } from 'react';
import { useStore } from '../../store/StoreContext';
import { User, Save, Check, Award, Map, FileText, Users, Compass, AlertTriangle } from 'lucide-react';

const ProfilePage = () => {
  const { currentUser, salesmen, updateSalesmanName, updateSalesmanLocation, routes, customers, bills } = useStore();
  const [name, setName] = useState('');
  const [success, setSuccess] = useState(false);
  const [gpsError, setGpsError] = useState(null);
  const [watchId, setWatchId] = useState(null);

  const currentSalesman = salesmen?.find(s => s.id === currentUser);
  const isSharing = currentSalesman?.isTracking || false;

  useEffect(() => {
    if (currentSalesman) {
      setName(currentSalesman.name);
    }
  }, [currentSalesman]);

  useEffect(() => {
    return () => {
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [watchId]);

  const handleSave = (e) => {
    e.preventDefault();
    if (name.trim() && currentSalesman) {
      updateSalesmanName(currentSalesman.id, name.trim());
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    }
  };

  const toggleGps = () => {
    if (!navigator.geolocation) {
      setGpsError('Geolocation is not supported by this browser.');
      return;
    }

    if (isSharing) {
      // Turn OFF tracking
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
        setWatchId(null);
      }
      updateSalesmanLocation(currentUser, false, null, null);
    } else {
      // Turn ON tracking
      setGpsError(null);
      const id = navigator.geolocation.watchPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          updateSalesmanLocation(currentUser, true, latitude, longitude);
        },
        (error) => {
          console.error(error);
          let errMsg = 'Unable to retrieve GPS.';
          if (error.code === error.PERMISSION_DENIED) {
            errMsg = 'Location permission denied. Please check device/browser settings.';
          }
          setGpsError(errMsg);
          updateSalesmanLocation(currentUser, false, null, null);
          if (watchId !== null) {
            navigator.geolocation.clearWatch(watchId);
            setWatchId(null);
          }
        },
        { enableHighAccuracy: true, maximumAge: 0, timeout: 10000 }
      );
      setWatchId(id);
    }
  };

  // Stats
  const routeCount = routes.length;
  const customerCount = customers.length;
  const billCount = bills.filter(b => b.items && b.items.length > 0).length;

  return (
    <div className="animate-fade-in" style={{ padding: '0.5rem', paddingBottom: '30px' }}>
      
      {/* Toast Notification */}
      {success && (
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
          Profile updated!
        </div>
      )}

      <h1 className="text-2xl font-bold text-white mb-6">My Profile</h1>

      <div className="glass-panel p-6 mb-6 border border-surface-border">
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
          <div style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.2) 0%, rgba(236, 72, 153, 0.2) 100%)',
            border: '2px solid rgba(99, 102, 241, 0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#a5b4fc',
            boxShadow: '0 0 20px rgba(99, 102, 241, 0.2)'
          }}>
            <User size={40} />
          </div>
          <div style={{ textAlign: 'center' }}>
            <h2 className="text-xl font-bold text-white m-0">{currentSalesman?.name || 'Sales Representative'}</h2>
            <p className="text-xs text-muted m-0 uppercase tracking-widest mt-1" style={{ color: '#818cf8' }}>Thriller Motors Representative</p>
          </div>
        </div>

        <form onSubmit={handleSave} className="flex flex-col gap-4">
          <div className="form-group m-0">
            <label style={{ fontWeight: '600', fontSize: '0.85rem' }}>Edit Display Name</label>
            <input 
              type="text" 
              value={name} 
              onChange={e => setName(e.target.value)} 
              placeholder="Your Name" 
              required
              style={{ height: '48px' }}
            />
          </div>

          <button type="submit" className="btn btn-primary w-full py-3 h-12 flex items-center justify-center gap-2">
            <Save size={18} />
            Save Profile Changes
          </button>
        </form>
      </div>

      {/* GPS Location Tracker Panel Card */}
      <div className="glass-panel p-5 mb-6 border border-surface-border animate-fade-in" style={{
        background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(15, 23, 42, 0.85) 100%)',
        borderColor: isSharing ? 'rgba(16, 185, 129, 0.3)' : 'rgba(255, 255, 255, 0.1)',
        boxShadow: isSharing ? '0 15px 35px rgba(0,0,0,0.5), 0 0 20px rgba(16, 185, 129, 0.05)' : 'var(--shadow-glass)',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{ 
            width: '28px', 
            height: '28px', 
            borderRadius: '50%', 
            background: isSharing ? 'rgba(16, 185, 129, 0.2)' : 'rgba(99, 102, 241, 0.15)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            color: isSharing ? '#34d399' : '#818cf8' 
          }}>
            <Compass size={16} className={isSharing ? 'animate-spin' : ''} style={{ animationDuration: '6s' }} />
          </div>
          <span style={{ fontSize: '0.8rem', fontWeight: '700', color: isSharing ? '#34d399' : '#a5b4fc', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            GPS Location Sharing
          </span>
        </div>

        <p style={{ fontSize: '0.8rem', color: '#cbd5e1', margin: 0, lineHeight: '1.4' }}>
          Transmit your active coordinate route directly to the admin tracking radar hub in real-time.
        </p>

        {/* Glowing toggle control */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(0,0,0,0.15)', padding: '0.75rem 1rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
          <span style={{ fontSize: '0.85rem', color: 'white', fontWeight: '600' }}>Stream Live Location</span>
          <button 
            type="button"
            onClick={toggleGps}
            style={{
              width: '52px',
              height: '28px',
              borderRadius: '999px',
              background: isSharing ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' : 'rgba(255, 255, 255, 0.1)',
              border: isSharing ? '1px solid rgba(16, 185, 129, 0.5)' : '1px solid rgba(255, 255, 255, 0.15)',
              position: 'relative',
              cursor: 'pointer',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              outline: 'none',
              boxShadow: isSharing ? '0 0 12px rgba(16, 185, 129, 0.4)' : 'none'
            }}
          >
            <div style={{
              width: '20px',
              height: '20px',
              borderRadius: '50%',
              background: 'white',
              position: 'absolute',
              top: '3px',
              left: isSharing ? '27px' : '3px',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)'
            }} />
          </button>
        </div>

        {/* Telemetry Display */}
        {isSharing && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem', background: 'rgba(16, 185, 129, 0.08)', padding: '0.75rem', borderRadius: '12px', border: '1px solid rgba(16, 185, 129, 0.2)', animation: 'fadeIn 0.3s ease-out' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', color: '#34d399', fontWeight: '700', fontSize: '0.75rem', letterSpacing: '0.04em' }}>
              <span style={{ 
                width: '8px', 
                height: '8px', 
                background: '#34d399', 
                borderRadius: '50%', 
                display: 'inline-block', 
                boxShadow: '0 0 8px #34d399',
                animation: 'pulse 1.5s infinite'
              }} />
              📡 GPS BEACON TRANSMITTING LIVE
            </div>
            <div style={{ fontSize: '0.75rem', color: '#cbd5e1', fontFamily: 'monospace', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginTop: '0.15rem' }}>
              <div>LAT: <span style={{ color: 'white', fontWeight: '600' }}>{currentSalesman?.lat ? currentSalesman.lat.toFixed(6) : 'Obtaining...'}</span></div>
              <div>LNG: <span style={{ color: 'white', fontWeight: '600' }}>{currentSalesman?.lng ? currentSalesman.lng.toFixed(6) : 'Obtaining...'}</span></div>
            </div>
          </div>
        )}

        {/* Error notification */}
        {gpsError && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(239, 68, 68, 0.08)', padding: '0.75rem', borderRadius: '12px', border: '1px solid rgba(239, 68, 68, 0.2)', color: '#f87171', fontSize: '0.8rem', fontWeight: '600' }}>
            <AlertTriangle size={16} />
            <span>{gpsError}</span>
          </div>
        )}
      </div>

      {/* Rep Stats */}
      <h3 className="font-bold text-white mb-4">Performance Overview</h3>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
        
        {/* Routes Stat */}
        <div className="glass-panel p-4 flex items-center gap-3 border border-surface-border">
          <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(99, 102, 241, 0.15)', display: 'flex', alignItems: 'center', justify_content: 'center', color: '#818cf8', flexShrink: 0, justifyContent: 'center' }}>
            <Map size={20} />
          </div>
          <div>
            <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)' }}>Total Routes</span>
            <span style={{ fontSize: '1.25rem', fontWeight: '800', color: 'white' }}>{routeCount}</span>
          </div>
        </div>

        {/* Customers Stat */}
        <div className="glass-panel p-4 flex items-center gap-3 border border-surface-border">
          <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(236, 72, 153, 0.15)', display: 'flex', alignItems: 'center', color: '#f472b6', flexShrink: 0, justifyContent: 'center' }}>
            <Users size={20} />
          </div>
          <div>
            <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)' }}>Customers</span>
            <span style={{ fontSize: '1.25rem', fontWeight: '800', color: 'white' }}>{customerCount}</span>
          </div>
        </div>

        {/* Bills Stat */}
        <div className="glass-panel p-4 flex items-center gap-3 border border-surface-border" style={{ gridColumn: 'span 2' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(16, 185, 129, 0.15)', display: 'flex', alignItems: 'center', color: '#34d399', flexShrink: 0, justifyContent: 'center' }}>
            <FileText size={20} />
          </div>
          <div>
            <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)' }}>Bills Issued</span>
            <span style={{ fontSize: '1.25rem', fontWeight: '800', color: 'white' }}>{billCount}</span>
          </div>
        </div>

      </div>

    </div>
  );
};

export default ProfilePage;
