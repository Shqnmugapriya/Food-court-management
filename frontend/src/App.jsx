import React, { useState, useEffect } from 'react';
import { fetchDatabase, subscribeToUpdates, getCurrentUser, logoutUser } from './state/api.js';
import UnifiedLogin from './components/UnifiedLogin.jsx';
import StudentPortal from './components/StudentPortal.jsx';
import CounterBoard from './components/CounterBoard.jsx';
import KitchenBoard from './components/KitchenBoard.jsx';
import CashierPOS from './components/CashierPOS.jsx';
import AdminConsole from './components/AdminConsole.jsx';
import LoungeDisplay from './components/LoungeDisplay.jsx';

function hexToRgba(hex, alpha) {
  hex = hex.replace('#', '');
  if (hex.length === 3) {
    hex = hex.split('').map(c => c + c).join('');
  }
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  if (isNaN(r) || isNaN(g) || isNaN(b)) {
    return `rgba(255, 126, 71, ${alpha})`;
  }
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export default function App() {
  const [view, setView] = useState('hub'); // hub/login, student, staff, kitchen, cashier, admin, display
  const [db, setDb] = useState(null);
  const [user, setUser] = useState(getCurrentUser());
  const [loading, setLoading] = useState(true);

  // Dynamic Theme Colors
  const [primaryColor, setPrimaryColor] = useState(localStorage.getItem('primary_color') || '#ff7e47');
  const [secondaryColor, setSecondaryColor] = useState(localStorage.getItem('secondary_color') || '#10b981');
  const [showThemePanel, setShowThemePanel] = useState(false);

  useEffect(() => {
    document.documentElement.style.setProperty('--color-primary', primaryColor);
    document.documentElement.style.setProperty('--color-primary-glow', hexToRgba(primaryColor, 0.08));
    localStorage.setItem('primary_color', primaryColor);
  }, [primaryColor]);

  const [themeMode, setThemeMode] = useState(localStorage.getItem('theme_mode') || 'dark');

  useEffect(() => {
    const body = document.body;
    body.classList.remove('light-theme', 'dark-theme');
    if (themeMode === 'light') {
      body.classList.add('light-theme');
    } else if (themeMode === 'dark') {
      body.classList.add('dark-theme');
    } else {
      const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      body.classList.add(systemPrefersDark ? 'dark-theme' : 'light-theme');
    }
    localStorage.setItem('theme_mode', themeMode);
  }, [themeMode]);

  // Sync Database from Spring Boot
  const syncDb = async () => {
    const data = await fetchDatabase();
    if (data) {
      setDb(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    syncDb();
    // Subscribe to WebSockets broadcast reload
    subscribeToUpdates(() => {
      syncDb();
    });
  }, []);

  const handleLogout = () => {
    logoutUser();
    setUser(null);
    setView('hub');
  };

  const handleAuthSuccess = (authenticatedUser) => {
    setUser(authenticatedUser);
    // Automatically redirect based on user role
    if (authenticatedUser.role === 'student') {
      setView('student');
    } else if (authenticatedUser.role === 'cashier') {
      setView('cashier');
    } else if (authenticatedUser.role === 'admin') {
      setView('admin');
    } else if (authenticatedUser.role === 'staff') {
      setView('staff_hub'); // Show workspace selection for staff
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center', background: '#0a0e17', color: '#fff' }}>
        <div style={{ textAlign: 'center' }}>
          <h3 className="animate-pulse-glow" style={{ color: 'var(--color-primary)' }}>Loading Food Court Ecosystem...</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '0.5rem' }}>Syncing Spring Boot backend database</p>
        </div>
      </div>
    );
  }

  if (!db) {
    return (
      <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center', background: '#0a0e17', color: '#fff', padding: '2rem' }}>
        <div style={{ textAlign: 'center', maxWidth: '400px' }}>
          <h2 style={{ color: 'var(--color-danger)', marginBottom: '1rem' }}>❌ Backend Offline</h2>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
            Cannot connect to the Spring Boot REST server on <strong>http://localhost:8080</strong>.<br/>
            Please boot up the Spring Boot backend service and refresh this page.
          </p>
        </div>
      </div>
    );
  }

  // ----------------------------------------------------
  // ROUTING VIEW RENDERERS
  // ----------------------------------------------------

  const currentUser = user || getCurrentUser();
  let currentActiveComponent = null;

  if (view === 'display') {
    currentActiveComponent = <LoungeDisplay db={db} onBackToLogin={() => setView('hub')} />;
  } else if (!currentUser) {
    currentActiveComponent = <UnifiedLogin onLoginSuccess={handleAuthSuccess} onViewDisplay={() => setView('display')} />;
  } else if (currentUser.role === 'student') {
    currentActiveComponent = <StudentPortal db={db} user={currentUser} onUpdateUser={setUser} onLogout={handleLogout} />;
  } else if (currentUser.role === 'cashier') {
    currentActiveComponent = <CashierPOS db={db} user={currentUser} onLogout={handleLogout} />;
  } else if (currentUser.role === 'admin') {
    currentActiveComponent = <AdminConsole db={db} user={currentUser} onLogout={handleLogout} />;
  } else if (currentUser.role === 'staff') {
    if (view === 'kitchen') {
      currentActiveComponent = <KitchenBoard db={db} user={currentUser} onLogout={handleLogout} onBackToWorkspaces={() => setView('staff_hub')} />;
    } else if (view === 'staff') {
      currentActiveComponent = <CounterBoard db={db} user={currentUser} onLogout={handleLogout} onBackToWorkspaces={() => setView('staff_hub')} />;
    } else {
      // Default Workspace Selection Dashboard for Staff members
      currentActiveComponent = (
        <div style={{ minHeight: '100vh', background: 'radial-gradient(circle at bottom left, var(--color-primary-glow, rgba(255,126,71,0.08)) 0%, #070a13 80%)', color: '#fff' }}>
          <header className="top-nav" style={{ justifyContent: 'space-between', padding: '1rem 2rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
            <div className="logo" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 'bold' }}>
              <span>🛠️</span> Staff Workspace Portal
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>👤 Logged in as: <strong>{currentUser.username}</strong></span>
              <button className="btn btn-secondary btn-sm" onClick={handleLogout} style={{ padding: '0.3rem 0.75rem', borderRadius: '8px', fontSize: '0.8rem' }}>Logout</button>
            </div>
          </header>
          
          <main className="container animate-fade-in" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '80vh', padding: '2rem' }}>
            <h2 style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '0.5rem', background: 'linear-gradient(135deg, #fb7185, #f43f5e)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Welcome to the Staff Workspace
            </h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '2.5rem', fontSize: '0.95rem' }}>Select your assigned workspace terminal below to begin managing food court operations.</p>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem', maxWidth: '800px', width: '100%' }}>
              {/* Option 1: Kitchen Screen */}
              <div className="glass-card module-card interactive" style={{ textAlign: 'center', padding: '2.5rem', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '320px' }}>
                <div>
                  <span style={{ fontSize: '3.5rem', display: 'block', marginBottom: '1rem' }}>👨‍🍳</span>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '0.5rem', color: '#38bdf8' }}>Chef Kitchen Board</h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: '1.5' }}>
                    Displays active cooks, countdown timers, priority sorting (Jain options first), and low-ingredient inventory alarms.
                  </p>
                </div>
                <button className="btn btn-primary w-full" onClick={() => setView('kitchen')} style={{ background: '#0284c7', borderColor: '#0284c7', padding: '0.6rem', borderRadius: '10px' }}>
                  Launch Kitchen Board ➔
                </button>
              </div>

              {/* Option 2: Delivery/Counter Screen */}
              <div className="glass-card module-card interactive" style={{ textAlign: 'center', padding: '2.5rem', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '320px' }}>
                <div>
                  <span style={{ fontSize: '3.5rem', display: 'block', marginBottom: '1rem' }}>👥</span>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '0.5rem', color: '#fb7185' }}>Counter & Shift Board</h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: '1.5' }}>
                    Manage the full order lifecycle (preparing, packaging, readying), process physical pickups, and toggle staff break mode.
                  </p>
                </div>
                <button className="btn btn-primary w-full" onClick={() => setView('staff')} style={{ background: '#e11d48', borderColor: '#e11d48', padding: '0.6rem', borderRadius: '10px' }}>
                  Launch Counter Board ➔
                </button>
              </div>
            </div>
          </main>
        </div>
      );
    }
  } else {
    currentActiveComponent = <UnifiedLogin onLoginSuccess={handleAuthSuccess} onViewDisplay={() => setView('display')} />;
  }

  return (
    <>
      {currentActiveComponent}

      {/* FLOATING THEME SELECTOR WIDGET */}
      <div style={{ position: 'fixed', bottom: '2rem', right: '2rem', zIndex: 10000 }}>
        {showThemePanel ? (
          <div className="glass-card animate-scale-in" style={{ padding: '1.25rem', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.08)', width: '260px', boxShadow: '0 10px 30px rgba(0,0,0,0.5)', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#fff' }}>🎨 Theme Customizer</span>
              <button onClick={() => setShowThemePanel(false)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '1.25rem', lineHeight: 1 }}>×</button>
            </div>
            
            {/* Presets */}
            <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'space-between' }}>
              {[
                { name: 'Sunset', prim: '#ff7e47', sec: '#10b981' },
                { name: 'Emerald', prim: '#10b981', sec: '#3b82f6' },
                { name: 'Ocean', prim: '#0ea5e9', sec: '#10b981' },
                { name: 'Rose', prim: '#f43f5e', sec: '#fbbf24' },
                { name: 'Violet', prim: '#8b5cf6', sec: '#ec4899' },
              ].map(themePreset => (
                <button
                  key={themePreset.name}
                  onClick={() => {
                    setPrimaryColor(themePreset.prim);
                    setSecondaryColor(themePreset.sec);
                  }}
                  title={themePreset.name}
                  style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    background: `linear-gradient(135deg, ${themePreset.prim}, ${themePreset.sec})`,
                    border: primaryColor === themePreset.prim ? '2px solid #fff' : '1px solid rgba(255,255,255,0.1)',
                    cursor: 'pointer',
                    boxShadow: primaryColor === themePreset.prim ? '0 0 8px rgba(255,255,255,0.3)' : ''
                  }}
                />
              ))}
            </div>

            {/* Custom Color Pickers */}
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Primary Color:</span>
                <input
                  type="color"
                  value={primaryColor}
                  onChange={e => setPrimaryColor(e.target.value)}
                  style={{ width: '40px', height: '24px', border: 'none', background: 'none', cursor: 'pointer' }}
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Secondary Color:</span>
                <input
                  type="color"
                  value={secondaryColor}
                  onChange={e => setSecondaryColor(e.target.value)}
                  style={{ width: '40px', height: '24px', border: 'none', background: 'none', cursor: 'pointer' }}
                />
              </div>
            </div>

            {/* Theme Mode Toggles */}
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 'bold' }}>Appearance:</span>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.25rem', background: 'rgba(0,0,0,0.2)', padding: '0.2rem', borderRadius: '8px' }}>
                <button 
                  onClick={() => setThemeMode('light')} 
                  style={{ 
                    background: themeMode === 'light' ? 'var(--color-primary)' : 'none', 
                    color: themeMode === 'light' ? '#fff' : 'var(--text-secondary)', 
                    border: 'none', 
                    fontSize: '0.65rem', 
                    fontWeight: 'bold', 
                    borderRadius: '6px', 
                    padding: '0.3rem', 
                    cursor: 'pointer' 
                  }}
                >
                  ☀️ Light
                </button>
                <button 
                  onClick={() => setThemeMode('dark')} 
                  style={{ 
                    background: themeMode === 'dark' ? 'var(--color-primary)' : 'none', 
                    color: themeMode === 'dark' ? '#fff' : 'var(--text-secondary)', 
                    border: 'none', 
                    fontSize: '0.65rem', 
                    fontWeight: 'bold', 
                    borderRadius: '6px', 
                    padding: '0.3rem', 
                    cursor: 'pointer' 
                  }}
                >
                  🌙 Dark
                </button>
                <button 
                  onClick={() => setThemeMode('default')} 
                  style={{ 
                    background: themeMode === 'default' ? 'var(--color-primary)' : 'none', 
                    color: themeMode === 'default' ? '#fff' : 'var(--text-secondary)', 
                    border: 'none', 
                    fontSize: '0.65rem', 
                    fontWeight: 'bold', 
                    borderRadius: '6px', 
                    padding: '0.3rem', 
                    cursor: 'pointer' 
                  }}
                >
                  🖥️ Default
                </button>
              </div>
            </div>
            
            <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textAlign: 'center', margin: 0 }}>Select a preset or pick any custom color hex dynamically!</p>
          </div>
        ) : (
          <button
            onClick={() => setShowThemePanel(true)}
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              background: 'var(--color-primary)',
              color: '#fff',
              border: 'none',
              fontSize: '1.25rem',
              cursor: 'pointer',
              boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'transform 0.2s',
            }}
            onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.1)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
            title="Change UI Theme Colors"
          >
            🎨
          </button>
        )}
      </div>
    </>
  );
}
