import React, { useState } from 'react';
import { updateOrderStatus, updateInventoryStock, saveFoodItem } from '../state/api.js';

export default function CounterBoard({ db, user, onLogout }) {
  const [breakMode, setBreakMode] = useState(db.breakMode || false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [qrTokenInput, setQrTokenInput] = useState('');
  const [showProfileModal, setShowProfileModal] = useState(false);

  // Handle Break Mode toggle
  const handleBreakToggle = () => {
    const nextVal = !breakMode;
    setBreakMode(nextVal);
    db.breakMode = nextVal;
    
    // Save to trigger WebSocket reload
    fetch('http://localhost:8080/api/orders') // dummy trigger since WebSocketConfig handles reload on saving DB properties
      .then(() => {
        // Spring Boot is seeded, we can just save it or broadcast
      });
  };

  const updateStatus = async (orderId, nextStatus) => {
    try {
      await updateOrderStatus(orderId, nextStatus);
    } catch(e) {
      alert('Error updating order status.');
    }
  };

  const handleQRPickup = async (e) => {
    e.preventDefault();
    const token = qrTokenInput.trim().toUpperCase();
    const order = db.orders.find(o => o.token === token && o.status === 'Ready');
    
    if (order) {
      await updateOrderStatus(order.id, 'Completed');
      alert(`🎉 Order token ${token} marked as Completed & Delivered!`);
      setQrTokenInput('');
      setShowQRModal(false);
    } else {
      alert('❌ Token invalid or order is not in "Ready" status for pickup.');
    }
  };

  const toggleFoodAvailability = async (food) => {
    food.availability = !food.availability;
    try {
      await saveFoodItem(food);
    } catch (e) {
      alert('Error updating food availability.');
    }
  };

  const adjustStock = async (item, delta) => {
    const nextStock = Math.max(0, item.stock + delta);
    try {
      await updateInventoryStock(item.id, nextStock);
    } catch (e) {
      alert('Error adjusting stock.');
    }
  };

  // KPIs
  const activeOrders = db.orders.filter(o => o.status !== 'Completed' && o.status !== 'Cancelled').length;
  const readyForCollection = db.orders.filter(o => o.status === 'Ready').length;
  const completedToday = db.orders.filter(o => o.status === 'Completed').length;
  const totalRevenue = db.orders.filter(o => o.status === 'Completed').reduce((sum, o) => sum + o.grandTotal, 0);

  return (
    <div>
      {/* Top Navbar */}
      <header className="top-nav">
        <div className="logo">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2L2 22H22L12 2Z" stroke="url(#logo-grad)" strokeWidth="2" strokeLinejoin="round"/>
          </svg>
          Smart Food Court <span style={{ fontSize: '0.8rem', padding: '0.2rem 0.5rem', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', marginLeft: '0.5rem' }}>Counter Board</span>
        </div>
        <div className="nav-actions">
          <button className={`btn btn-secondary btn-sm ${breakMode ? 'active-break' : ''}`} onClick={handleBreakToggle} style={{ background: breakMode ? 'rgba(239, 68, 68, 0.2)' : '', color: breakMode ? 'var(--color-danger)' : '', border: breakMode ? '1px solid var(--color-danger)' : '' }}>
            {breakMode ? '☕ ON BREAK' : '☕ Toggle Break'}
          </button>
          <button className="btn btn-primary btn-sm" onClick={() => setShowQRModal(true)}>📲 Scan QR Code</button>
          <div className="user-profile" style={{ cursor: 'pointer' }} onClick={() => setShowProfileModal(true)}>
            <span className="user-avatar">👥</span>
            <span className="user-name" style={{ borderBottom: '1px dashed rgba(255,255,255,0.2)' }}>{user.username}</span>
          </div>
          <button onClick={onLogout} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-danger)', marginLeft: '0.5rem' }} title="Logout">🚪</button>
        </div>
      </header>

      <div className="container main-layout animate-fade-in" style={{ marginTop: '1.5rem', marginBottom: '3rem' }}>
        
        {/* KPI stats */}
        <section className="kpi-row grid-cols-4" style={{ marginBottom: '1.5rem' }}>
          <div className="glass-card kpi-card">
            <span className="kpi-title">Active Orders</span>
            <span className="kpi-value" style={{ color: 'var(--color-info)' }}>{activeOrders}</span>
          </div>
          <div className="glass-card kpi-card">
            <span className="kpi-title">Collection Ready</span>
            <span className="kpi-value" style={{ color: 'var(--color-secondary)' }}>{readyForCollection}</span>
          </div>
          <div className="glass-card kpi-card">
            <span className="kpi-title">Completed Today</span>
            <span className="kpi-value" style={{ color: 'var(--color-warning)' }}>{completedToday}</span>
          </div>
          <div className="glass-card kpi-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <span className="kpi-title">Total Sales Revenue</span>
            {localStorage.getItem('staff_revenue_request') === 'approved' ? (
              <span className="kpi-value" style={{ color: '#ffb300' }}>₹{totalRevenue.toFixed(2)}</span>
            ) : localStorage.getItem('staff_revenue_request') === 'requested' ? (
              <button className="btn btn-secondary btn-sm w-full" disabled style={{ fontSize: '0.75rem', marginTop: '0.5rem', background: 'rgba(245, 158, 11, 0.1)', color: 'var(--color-warning)', borderColor: 'var(--color-warning)' }}>
                ⏳ Awaiting Admin Approval...
              </button>
            ) : (
              <button className="btn btn-secondary btn-sm w-full" onClick={() => {
                localStorage.setItem('staff_revenue_request', 'requested');
                fetch('http://localhost:8080/api/orders').then(() => {});
                alert('Permission request sent to Admin Console!');
                window.location.reload();
              }} style={{ fontSize: '0.72rem', marginTop: '0.5rem', borderColor: 'var(--color-warning)', color: 'var(--color-warning)', background: 'transparent' }}>
                🔒 Request Admin Permission
              </button>
            )}
          </div>
        </section>

        {/* Dashboard Split screen */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '1.5rem' }}>
          
          {/* Left panel: Column Swimlanes */}
          <section className="glass-card" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '1.25rem' }}>📋 Live Order Swimlanes</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '1rem' }}>
              
              {/* Lane 1: Pending (needs accepting) */}
              <div className="swimlane-column" style={{ background: 'rgba(255,255,255,0.01)', borderRadius: '12px', padding: '0.75rem', border: '1px solid rgba(255,255,255,0.03)' }}>
                <h4 style={{ fontSize: '0.9rem', color: 'var(--color-primary)', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.5rem', marginBottom: '0.75rem' }}>📥 Pending Acceptance</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {db.orders.filter(o => o.status === 'Pending').map(order => (
                    <div key={order.id} className="staff-order-card" style={{ background: 'rgba(255,255,255,0.02)', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--glass-border)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '0.25rem' }}>
                        <span>Token {order.token}</span>
                        <span style={{ color: 'var(--color-primary)' }}>₹{order.grandTotal.toFixed(2)}</span>
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Items: {order.items.length}</div>
                      <button className="btn btn-primary btn-sm w-full" onClick={() => updateStatus(order.id, 'Preparing')} style={{ fontSize: '0.7rem', padding: '0.35rem' }}>Accept Order 🍳</button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Lane 2: Cooking (Kitchen) */}
              <div className="swimlane-column" style={{ background: 'rgba(255,255,255,0.01)', borderRadius: '12px', padding: '0.75rem', border: '1px solid rgba(255,255,255,0.03)' }}>
                <h4 style={{ fontSize: '0.9rem', color: 'var(--color-warning)', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.5rem', marginBottom: '0.75rem' }}>🍳 In Preparation</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {db.orders.filter(o => o.status === 'Preparing').map(order => (
                    <div key={order.id} className="staff-order-card" style={{ background: 'rgba(255,255,255,0.02)', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--glass-border)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '0.25rem' }}>
                        <span>Token {order.token}</span>
                        <span style={{ color: 'var(--color-warning)' }}>Cooking</span>
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Name: {order.studentName}</div>
                      <button className="btn btn-secondary btn-sm w-full" onClick={() => updateStatus(order.id, 'Packaging')} style={{ fontSize: '0.7rem', padding: '0.35rem', borderColor: 'var(--color-warning)', color: 'var(--color-warning)', background: 'transparent' }}>Mark Cooked ➔</button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Lane 2: Packaging (cooked and ready to package) */}
              <div className="swimlane-column" style={{ background: 'rgba(255,255,255,0.01)', borderRadius: '12px', padding: '0.75rem', border: '1px solid rgba(255,255,255,0.03)' }}>
                <h4 style={{ fontSize: '0.9rem', color: 'var(--color-info)', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.5rem', marginBottom: '0.75rem' }}>📦 Counter Packaging</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {db.orders.filter(o => o.status === 'Packaging').map(order => (
                    <div key={order.id} className="staff-order-card" style={{ background: 'rgba(255,255,255,0.02)', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--glass-border)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '0.25rem' }}>
                        <span>Token {order.token}</span>
                        <span style={{ color: 'var(--color-info)' }}>{order.diningOption.toUpperCase()}</span>
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Instructions: {order.specialInstructions}</div>
                      <button className="btn btn-secondary btn-sm w-full" onClick={() => updateStatus(order.id, 'Ready')} style={{ fontSize: '0.7rem', padding: '0.35rem', borderColor: 'var(--color-info)', color: 'var(--color-info)' }}>Mark Ready 🔔</button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Lane 3: Ready for collection */}
              <div className="swimlane-column" style={{ background: 'rgba(255,255,255,0.01)', borderRadius: '12px', padding: '0.75rem', border: '1px solid rgba(255,255,255,0.03)' }}>
                <h4 style={{ fontSize: '0.9rem', color: 'var(--color-secondary)', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.5rem', marginBottom: '0.75rem' }}>📢 Ready for Pickup</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {db.orders.filter(o => o.status === 'Ready').map(order => (
                    <div key={order.id} className="staff-order-card" style={{ background: 'rgba(255,255,255,0.02)', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--glass-border)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '0.25rem' }}>
                        <span>Token {order.token}</span>
                        <span style={{ color: 'var(--color-secondary)' }}>Ready</span>
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Name: {order.studentName}</div>
                      <button className="btn btn-secondary btn-sm w-full" onClick={() => updateStatus(order.id, 'Completed')} style={{ fontSize: '0.7rem', padding: '0.35rem', borderColor: 'var(--color-secondary)', color: 'var(--color-secondary)', background: 'rgba(16,185,129,0.05)' }}>Mark as Delivered 📦</button>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </section>

          {/* Right panel: Inventory availability controls */}
          <aside style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Quick stock toggles */}
            <div class="glass-card" style={{ padding: '1.25rem' }}>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '0.75rem' }}>🍔 Menu Availability</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '200px', overflowY: 'auto' }}>
                {db.foods.map(food => (
                  <div key={food.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem' }}>
                    <span>{food.name}</span>
                    <button className={`btn btn-sm ${food.availability ? 'btn-primary' : 'btn-secondary'}`} onClick={() => toggleFoodAvailability(food)} style={{ fontSize: '0.65rem', padding: '0.2rem 0.5rem', border: !food.availability ? '1px dashed #ef4444' : '', color: !food.availability ? '#ef4444' : '' }}>
                      {food.availability ? 'Available' : 'Unavailable'}
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Pantry levels */}
            <div class="glass-card" style={{ padding: '1.25rem' }}>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '0.75rem' }}>📦 Pantry Levels</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {db.inventory.map(item => (
                  <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem' }}>
                    <span style={{ color: item.stock <= item.lowStockThreshold ? 'var(--color-danger)' : '' }}>
                      {item.name} {item.stock <= item.lowStockThreshold ? '⚠️' : ''}
                    </span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <button className="qty-btn" onClick={() => adjustStock(item, -5)} style={{ width: '20px', height: '20px' }}>-</button>
                      <span>{item.stock} {item.unit}</span>
                      <button className="qty-btn" onClick={() => adjustStock(item, 5)} style={{ width: '20px', height: '20px' }}>+</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </aside>

        </div>
      </div>

      {/* QR scanner simulator overlay */}
      {showQRModal && (
        <div className="dialog-overlay" style={{ display: 'flex', zIndex: 10000 }}>
          <div className="dialog-content glass-card" style={{ width: '360px', padding: '1.5rem' }}>
            <div className="dialog-header" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <h3>📲 QR Collection Scan</h3>
              <button className="dialog-close" onClick={() => setShowQRModal(false)}>×</button>
            </div>
            <form onSubmit={handleQRPickup}>
              <div className="form-group">
                <label>Scan / Type Customer Token</label>
                <input type="text" className="form-input" placeholder="e.g. A201" value={qrTokenInput} onChange={e => setQrTokenInput(e.target.value)} style={{ textAlign: 'center', fontSize: '1.25rem', letterSpacing: '4px' }} required />
              </div>
              <button type="submit" className="btn btn-primary w-full">Verify Scan Code</button>
            </form>
          </div>
        </div>
      )}

      {/* Staff Profile Modal */}
      {showProfileModal && (
        <div className="dialog-overlay" style={{ display: 'flex', zIndex: 10000 }}>
          <div className="dialog-content glass-card animate-scale-in" style={{ width: '420px', padding: '2rem', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.08)' }}>
            <div className="dialog-header" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', alignItems: 'center' }}>
              <h3 style={{ fontSize: '1.25rem', color: '#fff' }}>👤 Staff Member Profile</h3>
              <button className="dialog-close" onClick={() => setShowProfileModal(false)}>×</button>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '1.5rem' }}>
              <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(255,255,255,0.02)', border: '2px solid var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3rem' }}>
                👥
              </div>
              <div style={{ textAlign: 'center' }}>
                <h4 style={{ fontSize: '1.15rem', color: '#fff' }}>{user.username}</h4>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{user.email}</p>
                <span className="badge badge-warning" style={{ fontSize: '0.65rem', marginTop: '0.5rem', display: 'inline-block' }}>Counter Operations Operator</span>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', fontSize: '0.85rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>📍 Station Assignment:</span>
                <strong>Counter 1 - Delivery Hub</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>⏰ Shift Timings:</span>
                <strong>11:00 AM - 4:00 PM</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>🔑 Session Key:</span>
                <strong style={{ color: 'var(--color-secondary)' }}>AUTH_COUNTER_01</strong>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
