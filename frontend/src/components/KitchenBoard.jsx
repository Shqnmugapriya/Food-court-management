import React, { useState, useEffect } from 'react';
import { updateOrderStatus } from '../state/api.js';

export default function KitchenBoard({ db, user, onLogout }) {
  const [timers, setTimers] = useState({});

  // Audio delay synthesizer
  const playKitchenWarningChime = () => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(220, ctx.currentTime);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
      osc.start();
      osc.stop(ctx.currentTime + 0.4);
    } catch(e) {}
  };

  // Timer tick loop
  useEffect(() => {
    const interval = setInterval(() => {
      const newTimers = {};
      const preparingOrders = db.orders.filter(o => o.status === 'Preparing');
      
      preparingOrders.forEach(order => {
        if (order.expectedReadyTime) {
          const secondsLeft = Math.round((order.expectedReadyTime - Date.now()) / 1000);
          newTimers[order.id] = secondsLeft;
          
          // Sound trigger on crossing limit exactly
          if (secondsLeft === 0) {
            playKitchenWarningChime();
          }
        }
      });
      setTimers(newTimers);
    }, 1000);

    return () => clearInterval(interval);
  }, [db.orders]);

  const markCooked = async (orderId) => {
    try {
      await updateOrderStatus(orderId, 'Packaging');
    } catch(e) {
      alert('Error updating status.');
    }
  };

  // Order List & Sorting
  const preparingOrders = db.orders.filter(o => o.status === 'Preparing');
  const lowStockItems = db.inventory.filter(item => item.stock <= item.lowStockThreshold);

  const sortedOrders = preparingOrders.map(order => {
    let priority = 'standard';
    const seconds = timers[order.id] ?? 60;
    const isDelayed = seconds <= 0;

    // Check if Jain
    const containsJain = order.items.some(item => {
      const f = db.foods.find(food => food.id === item.foodId);
      return f && f.isJain;
    });

    if (isDelayed) {
      priority = 'urgent';
    } else if (containsJain || order.specialInstructions) {
      priority = 'high';
    }

    return { ...order, priority, isDelayed, seconds };
  }).sort((a, b) => {
    const prios = { urgent: 0, high: 1, standard: 2 };
    return prios[a.priority] - prios[b.priority];
  });

  const delayedOrdersList = sortedOrders.filter(o => o.isDelayed);

  return (
    <div>
      {/* Top Navbar */}
      <header className="top-nav">
        <div className="logo">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2L2 22H22L12 2Z" stroke="url(#logo-grad)" strokeWidth="2" strokeLinejoin="round"/>
          </svg>
          Smart Food Court <span style={{ fontSize: '0.8rem', padding: '0.2rem 0.5rem', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', marginLeft: '0.5rem' }}>Kitchen Terminal</span>
        </div>
        <div className="nav-actions">
          {db.breakMode && (
            <div className="indicator-glow" style={{ padding: '0.25rem 0.75rem', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid var(--color-danger)', borderRadius: '4px', color: 'var(--color-danger)', fontSize: '0.8rem', fontWeight: 'bold' }}>☕ STAFF ON BREAK</div>
          )}
          <div className="user-profile">
            <span className="user-avatar">👨🍳</span>
            <span className="user-name">{user.username}</span>
            <button onClick={onLogout} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-danger)', marginLeft: '0.5rem' }}>🚪</button>
          </div>
        </div>
      </header>

      <div className="container main-layout animate-fade-in" style={{ marginTop: '1.5rem', marginBottom: '3rem' }}>
        
        {/* KPI counters */}
        <section className="kpi-row grid-cols-4" style={{ marginBottom: '1.5rem' }}>
          <div className="glass-card kpi-card">
            <span className="kpi-title">Active Cooks</span>
            <span className="kpi-value" style={{ color: 'var(--color-info)' }}>3 Chefs</span>
          </div>
          <div className="glass-card kpi-card">
            <span className="kpi-title">Orders in Preparation</span>
            <span className="kpi-value">{preparingOrders.length}</span>
          </div>
          <div className="glass-card kpi-card">
            <span className="kpi-title">Delayed Orders Alert</span>
            <span className="kpi-value" style={{ color: 'var(--color-warning)' }}>{delayedOrdersList.length}</span>
          </div>
          <div className="glass-card kpi-card">
            <span className="kpi-title">Kitchen Efficiency Score</span>
            <span className="kpi-value" style={{ color: 'var(--color-secondary)' }}>94%</span>
          </div>
        </section>

        {/* Layout split */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '1.5rem' }}>
          
          {/* Active cooking cards */}
          <section className="glass-card" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.25rem' }}>🍳 Active Prep Station</h3>
              <span className="badge badge-preparing">{preparingOrders.length} Cooking</span>
            </div>

            <div className="cooking-orders-list">
              {sortedOrders.length === 0 ? (
                <div className="empty-cart-message" style={{ gridColumn: '1 / -1' }}>No active orders cooking at this moment.</div>
              ) : (
                sortedOrders.map(order => {
                  const prioLabelMap = { urgent: 'Urgent Priority', high: 'High Priority', standard: 'Standard Priority' };
                  const prioClassMap = { urgent: 'badge-urgent', high: 'badge-high', standard: 'badge-standard' };

                  // format timer string
                  let timerStr = '--:--';
                  if (order.seconds > 0) {
                    const m = Math.floor(order.seconds / 60);
                    const s = order.seconds % 60;
                    timerStr = `${m}:${s < 10 ? '0' : ''}${s}`;
                  } else {
                    const overdue = Math.abs(order.seconds);
                    const m = Math.floor(overdue / 60);
                    const s = overdue % 60;
                    timerStr = `DELAYED +${m}:${s < 10 ? '0' : ''}${s}`;
                  }

                  return (
                    <div key={order.id} className={`kitchen-order-card-detail priority-${order.priority}`}>
                      <div>
                        <div className="kitchen-card-header">
                          <span className="kitchen-card-token">Token {order.token}</span>
                          <span className={`kitchen-card-priority-badge ${prioClassMap[order.priority]}`}>{prioLabelMap[order.priority]}</span>
                        </div>
                        <ul className="kitchen-card-items">
                          {order.items.map(item => (
                            <li key={item.foodId}><span>{item.name}</span> <span>x{item.quantity}</span></li>
                          ))}
                        </ul>
                        {order.specialInstructions && (
                          <div className="kitchen-card-instructions" title={order.specialInstructions}>⚠️ Notes: {order.specialInstructions}</div>
                        )}
                      </div>
                      <div className="kitchen-card-footer">
                        <div className={`kitchen-card-timer ${order.isDelayed ? 'delayed' : ''}`}>
                          ⏱️ {timerStr}
                        </div>
                        <button className="btn btn-secondary btn-sm" onClick={() => markCooked(order.id)} style={{ background: 'linear-gradient(135deg, var(--color-secondary), #34d399)', color: '#fff', border: 'none', fontSize: '0.75rem' }}>Done Cooking 🍳</button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </section>

          {/* Sidebar */}
          <aside style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Low stock alerts */}
            <div className="glass-card" style={{ padding: '1.25rem' }}>
              <h3 style={{ fontSize: '1.1rem', color: 'var(--color-danger)', marginBottom: '0.5rem' }}>⚠️ Low Stock Alerts</h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>Pantry ingredients running low:</p>
              <div className="stock-alerts-list">
                {lowStockItems.length === 0 ? (
                  <div className="stock-alert-item" style={{ background: 'rgba(16,185,129,0.05)', borderColor: 'rgba(16,185,129,0.1)', color: 'var(--color-secondary)' }}>✅ Pantry fully stocked!</div>
                ) : (
                  lowStockItems.map(item => (
                    <div key={item.id} className="stock-alert-item">
                      <span className="stock-alert-item-name">⚠️ {item.name}</span>
                      <span className="stock-alert-item-qty">LOW: {item.stock} {item.unit}</span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Delay log Warnings */}
            <div className="glass-card" style={{ padding: '1.25rem' }}>
              <h3 style={{ fontSize: '1.1rem', color: 'var(--color-warning)', marginBottom: '0.75rem' }}>🔔 Delay Warnings</h3>
              <div className="delay-warnings-list">
                {delayedOrdersList.length === 0 ? (
                  <div className="delay-warning-item" style={{ background: 'rgba(16,185,129,0.05)', borderColor: 'rgba(16,185,129,0.1)', color: 'var(--color-secondary)' }}>✅ Kitchen timing optimal.</div>
                ) : (
                  delayedOrdersList.map(order => {
                    const overdueSecs = Math.abs(timers[order.id] || 0);
                    const m = Math.floor(overdueSecs / 60);
                    const s = overdueSecs % 60;
                    return (
                      <div key={order.id} className="delay-warning-item">
                        <div className="delay-warning-title">🚨 Delay: Token {order.token}</div>
                        <div>Expected time exceeded by: <strong>{m}m {s}s</strong></div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </aside>

        </div>
      </div>
    </div>
  );
}
