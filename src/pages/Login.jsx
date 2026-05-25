import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/StoreContext';
import { Users, Package, ChevronRight, Award, Settings, X, Save } from 'lucide-react';

const Login = () => {
  const { login, currentUser, salesmen, updateSalesmanName } = useStore();
  const navigate = useNavigate();

  // Settings modal state
  const [showSettings, setShowSettings] = useState(false);
  const [sales1Input, setSales1Input] = useState('');
  const [sales2Input, setSales2Input] = useState('');

  useEffect(() => {
    if (salesmen) {
      setSales1Input(salesmen.find(s => s.id === 'sales1')?.name || '');
      setSales2Input(salesmen.find(s => s.id === 'sales2')?.name || '');
    }
  }, [salesmen]);

  useEffect(() => {
    if (currentUser) {
      if (currentUser === 'items') navigate('/items');
      else navigate('/sales');
    }
  }, [currentUser, navigate]);

  const handleLogin = (role) => {
    login(role);
    if (role === 'items') navigate('/items');
    else navigate('/sales');
  };

  const handleSaveNames = (e) => {
    e.preventDefault();
    if (sales1Input.trim()) updateSalesmanName('sales1', sales1Input.trim());
    if (sales2Input.trim()) updateSalesmanName('sales2', sales2Input.trim());
    setShowSettings(false);
  };

  const s1Name = salesmen?.find(s => s.id === 'sales1')?.name || 'Salesman 1';
  const s2Name = salesmen?.find(s => s.id === 'sales2')?.name || 'Salesman 2';

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center', 
      padding: '1.5rem', 
      background: 'transparent',
      position: 'relative',
      overflow: 'hidden'
    }}>
      
      {/* Background glow effects */}
      <div style={{ 
        position: 'absolute', 
        top: '-15%', 
        left: '-15%', 
        width: '600px', 
        height: '600px', 
        background: 'radial-gradient(circle, rgba(99,102,241,0.18) 0%, transparent 70%)', 
        pointerEvents: 'none',
        filter: 'blur(40px)'
      }}></div>
      <div style={{ 
        position: 'absolute', 
        bottom: '-15%', 
        right: '-15%', 
        width: '600px', 
        height: '600px', 
        background: 'radial-gradient(circle, rgba(236,72,153,0.12) 0%, transparent 70%)', 
        pointerEvents: 'none',
        filter: 'blur(40px)'
      }}></div>

      <div className="animate-fade-in" style={{ width: '100%', maxWidth: '420px', zIndex: 1 }}>
        
        {/* Company Logo & Name Card */}
        <div style={{ 
          textAlign: 'center', 
          marginBottom: '2rem',
          padding: '2.5rem 1.5rem',
          background: 'rgba(15, 23, 42, 0.76)',
          backdropFilter: 'blur(40px)',
          WebkitBackdropFilter: 'blur(40px)',
          borderRadius: '28px',
          border: '1px solid rgba(255, 255, 255, 0.16)',
          boxShadow: '0 30px 60px rgba(0, 0, 0, 0.7), inset 0 1px 0 rgba(255,255,255,0.15)',
          position: 'relative'
        }}>
          {/* Settings button inside card at top right */}
          <button 
            onClick={() => setShowSettings(true)}
            style={{
              position: 'absolute',
              top: '1.25rem',
              right: '1.25rem',
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '50%',
              width: '36px',
              height: '36px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#94a3b8',
              transition: 'all 0.2s ease',
              outline: 'none'
            }}
            onMouseEnter={e => { e.currentTarget.style.color = '#ffffff'; e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; }}
            onMouseLeave={e => { e.currentTarget.style.color = '#94a3b8'; e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
          >
            <Settings size={18} />
          </button>
          {/* Logo Image with Animated Glow Ring */}
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            marginBottom: '1.25rem' 
          }}>
            <div style={{ 
              width: '110px', 
              height: '110px', 
              borderRadius: '50%',
              overflow: 'hidden',
              border: '3px solid rgba(99, 102, 241, 0.6)',
              boxShadow: '0 0 35px rgba(99, 102, 241, 0.5), inset 0 0 15px rgba(0,0,0,0.2)',
              background: '#ffffff',
              padding: '4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <img 
                src="/logo.png" 
                alt="Thriller Motors Logo" 
                style={{ 
                  width: '100%', 
                  height: '100%', 
                  objectFit: 'cover',
                  borderRadius: '50%'
                }} 
              />
            </div>
          </div>

          {/* Company Name */}
          <h1 style={{ 
            fontSize: '2rem', 
            fontWeight: '900', 
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            background: 'linear-gradient(135deg, #ffffff 0%, #a5b4fc 50%, #c084fc 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            margin: '0 0 0.5rem 0',
            lineHeight: '1.1'
          }}>
            THRILLER MOTORS
          </h1>
          <div style={{ 
            display: 'inline-block',
            padding: '0.25rem 1.25rem',
            background: 'linear-gradient(90deg, rgba(99,102,241,0.2) 0%, rgba(236,72,153,0.1) 100%)',
            border: '1px solid rgba(99,102,241,0.3)',
            borderRadius: '999px',
            marginBottom: '0.75rem'
          }}>
            <p style={{ 
              fontSize: '0.75rem', 
              fontWeight: '700', 
              letterSpacing: '0.25em',
              color: '#c7d2fe',
              margin: 0,
              textTransform: 'uppercase'
            }}>
              ── PVT LTD ──
            </p>
          </div>
          <p style={{ color: '#94a3b8', fontSize: '0.85rem', margin: 0, marginTop: '0.5rem', letterSpacing: '0.02em' }}>
            Sales Representative System
          </p>
        </div>

        {/* Login Options */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          
          <p style={{ 
            color: '#64748b', 
            fontSize: '0.8rem', 
            textAlign: 'center', 
            margin: '0 0 0.4rem 0', 
            letterSpacing: '0.15em', 
            textTransform: 'uppercase',
            fontWeight: '600'
          }}>
            Select your role
          </p>

          {/* Manage Items */}
          <button 
            onClick={() => handleLogin('items')}
            style={{ 
              display: 'flex', alignItems: 'center', gap: '1rem',
              padding: '1.1rem 1.35rem',
              background: 'rgba(15, 23, 42, 0.76)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(99, 102, 241, 0.35)',
              borderRadius: '20px',
              cursor: 'pointer',
              transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
              width: '100%',
              textAlign: 'left',
              boxShadow: '0 10px 25px rgba(0, 0, 0, 0.3)'
            }}
            onMouseEnter={e => { 
              e.currentTarget.style.background = 'rgba(99, 102, 241, 0.16)'; 
              e.currentTarget.style.borderColor = 'rgba(99, 102, 241, 0.75)'; 
              e.currentTarget.style.transform = 'translateY(-2px)'; 
              e.currentTarget.style.boxShadow = '0 12px 25px rgba(99, 102, 241, 0.35)';
            }}
            onMouseLeave={e => { 
              e.currentTarget.style.background = 'rgba(15, 23, 42, 0.76)'; 
              e.currentTarget.style.borderColor = 'rgba(99, 102, 241, 0.35)'; 
              e.currentTarget.style.transform = 'translateY(0)'; 
              e.currentTarget.style.boxShadow = '0 10px 25px rgba(0, 0, 0, 0.3)';
            }}
          >
            <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'linear-gradient(135deg, rgba(99,102,241,0.2) 0%, rgba(99,102,241,0.05) 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, border: '1px solid rgba(99,102,241,0.3)' }}>
              <Package size={22} color="#a5b4fc" />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ color: '#ffffff', fontWeight: '600', fontSize: '1.05rem', marginBottom: '0.15rem' }}>Manage Items</div>
              <div style={{ color: '#cbd5e1', fontSize: '0.8rem' }}>Add products and view catalog</div>
            </div>
            <ChevronRight size={18} color="#94a3b8" />
          </button>

          {/* Salesman 1 */}
          <button 
            onClick={() => handleLogin('sales1')}
            style={{ 
              display: 'flex', alignItems: 'center', gap: '1rem',
              padding: '1.1rem 1.35rem',
              background: 'rgba(15, 23, 42, 0.76)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(236, 72, 153, 0.35)',
              borderRadius: '20px',
              cursor: 'pointer',
              transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
              width: '100%',
              textAlign: 'left',
              boxShadow: '0 10px 25px rgba(0, 0, 0, 0.3)'
            }}
            onMouseEnter={e => { 
              e.currentTarget.style.background = 'rgba(236, 72, 153, 0.16)'; 
              e.currentTarget.style.borderColor = 'rgba(236, 72, 153, 0.75)'; 
              e.currentTarget.style.transform = 'translateY(-2px)'; 
              e.currentTarget.style.boxShadow = '0 12px 25px rgba(236, 72, 153, 0.35)';
            }}
            onMouseLeave={e => { 
              e.currentTarget.style.background = 'rgba(15, 23, 42, 0.76)'; 
              e.currentTarget.style.borderColor = 'rgba(236, 72, 153, 0.35)'; 
              e.currentTarget.style.transform = 'translateY(0)'; 
              e.currentTarget.style.boxShadow = '0 10px 25px rgba(0, 0, 0, 0.3)';
            }}
          >
            <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'linear-gradient(135deg, rgba(236,72,153,0.2) 0%, rgba(236,72,153,0.05) 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, border: '1px solid rgba(236,72,153,0.3)' }}>
              <Users size={22} color="#f472b6" />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ color: '#ffffff', fontWeight: '600', fontSize: '1.05rem', marginBottom: '0.15rem' }}>{s1Name}</div>
              <div style={{ color: '#cbd5e1', fontSize: '0.8rem' }}>Mobile field operations</div>
            </div>
            <ChevronRight size={18} color="#94a3b8" />
          </button>

          {/* Salesman 2 */}
          <button 
            onClick={() => handleLogin('sales2')}
            style={{ 
              display: 'flex', alignItems: 'center', gap: '1rem',
              padding: '1.1rem 1.35rem',
              background: 'rgba(15, 23, 42, 0.76)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(16, 185, 129, 0.35)',
              borderRadius: '20px',
              cursor: 'pointer',
              transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
              width: '100%',
              textAlign: 'left',
              boxShadow: '0 10px 25px rgba(0, 0, 0, 0.3)'
            }}
            onMouseEnter={e => { 
              e.currentTarget.style.background = 'rgba(16, 185, 129, 0.16)'; 
              e.currentTarget.style.borderColor = 'rgba(16, 185, 129, 0.75)'; 
              e.currentTarget.style.transform = 'translateY(-2px)'; 
              e.currentTarget.style.boxShadow = '0 12px 25px rgba(16, 185, 129, 0.35)';
            }}
            onMouseLeave={e => { 
              e.currentTarget.style.background = 'rgba(15, 23, 42, 0.76)'; 
              e.currentTarget.style.borderColor = 'rgba(16, 185, 129, 0.35)'; 
              e.currentTarget.style.transform = 'translateY(0)'; 
              e.currentTarget.style.boxShadow = '0 10px 25px rgba(0, 0, 0, 0.3)';
            }}
          >
            <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'linear-gradient(135deg, rgba(16,185,129,0.2) 0%, rgba(16,185,129,0.05) 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, border: '1px solid rgba(16,185,129,0.3)' }}>
              <Users size={22} color="#34d399" />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ color: '#ffffff', fontWeight: '600', fontSize: '1.05rem', marginBottom: '0.15rem' }}>{s2Name}</div>
              <div style={{ color: '#cbd5e1', fontSize: '0.8rem' }}>Mobile field operations</div>
            </div>
            <ChevronRight size={18} color="#94a3b8" />
          </button>
        </div>

        <p style={{ textAlign: 'center', color: '#475569', fontSize: '0.75rem', marginTop: '2rem', letterSpacing: '0.05em' }}>
          © 2026 Thriller Motors PVT LTD. All rights reserved.
        </p>
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.65)',
          backdropFilter: 'blur(10px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '1.5rem'
        }}>
          <div className="animate-fade-in" style={{
            width: '100%',
            maxWidth: '380px',
            background: 'rgba(15, 23, 42, 0.85)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '24px',
            padding: '2rem 1.5rem',
            boxShadow: '0 25px 50px rgba(0,0,0,0.5)',
            position: 'relative'
          }}>
            <button 
              onClick={() => setShowSettings(false)}
              style={{
                position: 'absolute',
                top: '1.25rem',
                right: '1.25rem',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                color: '#94a3b8',
                outline: 'none'
              }}
            >
              <X size={20} />
            </button>

            <h3 style={{ color: 'white', fontWeight: '700', fontSize: '1.2rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '0.75rem' }}>
              <Settings size={20} color="#818cf8" />
              Edit Salesman Names
            </h3>

            <form onSubmit={handleSaveNames} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              
              <div className="form-group m-0" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ color: '#f472b6', fontWeight: '700', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Salesman 1 Name</label>
                <input 
                  type="text"
                  value={sales1Input}
                  onChange={e => setSales1Input(e.target.value)}
                  placeholder="Salesman 1 Name"
                  required
                  style={{ height: '42px', padding: '0.75rem', borderRadius: '10px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}
                />
              </div>

              <div className="form-group m-0" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ color: '#34d399', fontWeight: '700', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Salesman 2 Name</label>
                <input 
                  type="text"
                  value={sales2Input}
                  onChange={e => setSales2Input(e.target.value)}
                  placeholder="Salesman 2 Name"
                  required
                  style={{ height: '42px', padding: '0.75rem', borderRadius: '10px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1, height: '42px', borderRadius: '10px', fontSize: '0.9rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}>
                  <Save size={16} />
                  Save
                </button>
                <button type="button" onClick={() => setShowSettings(false)} className="btn btn-outline" style={{ flex: 1, height: '42px', borderRadius: '10px', fontSize: '0.9rem' }}>
                  Cancel
                </button>
              </div>

            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;
