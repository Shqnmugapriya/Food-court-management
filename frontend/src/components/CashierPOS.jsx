import React, { useState } from 'react';
import { checkoutOrder } from '../state/api.js';

export default function CashierPOS({ db, user, onLogout }) {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [cart, setCart] = useState([]);
  const [customerName, setCustomerName] = useState('Walk-in Guest');
  const [payMethod, setPayMethod] = useState('cash');

  // Receipt Modal
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [lastPlacedOrder, setLastPlacedOrder] = useState(null);

  const playPOSBeep = () => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, ctx.currentTime);
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
      osc.start();
      osc.stop(ctx.currentTime + 0.15);
    } catch(e) {}
  };

  const addToCart = (food) => {
    const existing = cart.find(i => i.id === food.id);
    if (existing) {
      setCart(cart.map(i => i.id === food.id ? { ...i, quantity: i.quantity + 1 } : i));
    } else {
      setCart([...cart, { id: food.id, name: food.name, price: food.price, quantity: 1 }]);
    }
    playPOSBeep();
  };

  const changeCartQty = (id, delta) => {
    setCart(cart.map(i => {
      if (i.id === id) {
        const nextQty = i.quantity + delta;
        return nextQty <= 0 ? null : { ...i, quantity: nextQty };
      }
      return i;
    }).filter(Boolean));
  };

  // Calculations
  const subtotal = cart.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const tax = subtotal * 0.05;
  const total = subtotal + tax;

  const handleCheckout = async (e) => {
    e.preventDefault();
    if (cart.length === 0) return;

    const orderPayload = {
      studentName: customerName.trim() || 'Walk-in Guest',
      items: cart.map(i => ({ foodId: i.id, name: i.name, quantity: i.quantity, price: i.price })),
      total: subtotal,
      tax: tax,
      serviceCharge: 0.00,
      grandTotal: total,
      diningOption: 'dine-in',
      pickupTime: 'Immediate',
      specialInstructions: 'POS Walk-in Order',
      sustainabilitySaved: 0.0,
      pointsEarned: 0
    };

    try {
      const savedOrder = await checkoutOrder(orderPayload);
      setLastPlacedOrder(savedOrder);
      setShowReceiptModal(true);
    } catch(e) {
      alert('POS checkout failed.');
    }
  };

  const closeReceipt = () => {
    setCart([]);
    setCustomerName('Walk-in Guest');
    setLastPlacedOrder(null);
    setShowReceiptModal(false);
  };

  const filteredFoods = db.foods.filter(food => {
    if (selectedCategory !== 'All' && food.category !== selectedCategory) return false;
    return true;
  });

  return (
    <div>
      {/* Top Navbar */}
      <header className="top-nav">
        <div className="logo">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2L2 22H22L12 2Z" stroke="url(#logo-grad)" strokeWidth="2" strokeLinejoin="round"/>
          </svg>
          Smart Food Court <span style={{ fontSize: '0.8rem', padding: '0.2rem 0.5rem', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', marginLeft: '0.5rem' }}>POS Cashier</span>
        </div>
        <div className="nav-actions">
          <div className="user-profile" style={{ cursor: 'pointer' }} onClick={() => setShowProfileModal(true)}>
            <span className="user-avatar">💰</span>
            <span className="user-name" style={{ borderBottom: '1px dashed rgba(255,255,255,0.2)' }}>{user.username}</span>
          </div>
          <button onClick={onLogout} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-danger)', marginLeft: '0.5rem' }} title="Logout">🚪</button>
        </div>
      </header>

      <div className="container main-layout animate-fade-in" style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: '1.5rem', marginTop: '1.5rem', marginBottom: '3rem' }}>
        
        {/* Left Side: Menu Grid */}
        <main className="cashier-menu-section">
          {/* Categories Tab */}
          <div className="menu-controls glass-card" style={{ padding: '1.25rem', marginBottom: '1.5rem' }}>
            <div className="category-tabs">
              <button className={`tab-btn ${selectedCategory === 'All' ? 'active' : ''}`} onClick={() => setSelectedCategory('All')}>All Items</button>
              {db.categories.map(cat => (
                <button key={cat} className={`tab-btn ${selectedCategory === cat ? 'active' : ''}`} onClick={() => setSelectedCategory(cat)}>{cat}</button>
              ))}
            </div>
          </div>

          {/* Grid */}
          <div className="food-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '1.25rem' }}>
            {filteredFoods.map(food => {
              const emojis = { f1: '🥑', f2: '🌯', f3: '🥗', f4: '🍚', f5: '🍰', f6: '🍵' };
              const emoji = emojis[food.id] || '🍲';
              return (
                <div key={food.id} className="glass-card food-card interactive" style={{ padding: '1rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '240px' }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>{emoji}</div>
                    <h4 style={{ fontSize: '0.9rem', marginBottom: '0.25rem' }}>{food.name}</h4>
                    <span style={{ fontSize: '1rem', fontWeight: 'bold', color: 'var(--color-primary)' }}>₹{food.price.toFixed(2)}</span>
                  </div>
                  <button className="btn btn-primary btn-sm w-full" onClick={() => addToCart(food)} disabled={!food.availability} style={{ fontSize: '0.75rem', marginTop: '0.5rem' }}>
                    {food.availability ? 'Add to POS' : 'Unavailable'}
                  </button>
                </div>
              );
            })}
          </div>
        </main>

        {/* Right Side: Checkout Drawers */}
        <aside className="pos-cart-aside">
          <div className="glass-card cart-panel" style={{ height: '100%', padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>🛒 Walk-in Checkout</h3>
              
              <div className="cart-items" style={{ maxHeight: '280px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.25rem' }}>
                {cart.length === 0 ? (
                  <div className="empty-cart-message">Walk-in checkout cart is empty. Click menu items to add!</div>
                ) : (
                  cart.map(item => (
                    <div key={item.id} className="cart-item-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div className="cart-item-details" style={{ flexGrow: 1 }}>
                        <div className="cart-item-name" style={{ fontSize: '0.85rem' }}>{item.name}</div>
                        <div className="cart-item-price" style={{ fontSize: '0.75rem' }}>₹{item.price.toFixed(2)}</div>
                      </div>
                      <div className="cart-item-qty">
                        <button className="qty-btn" onClick={() => changeCartQty(item.id, -1)}>-</button>
                        <span style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>{item.quantity}</span>
                        <button className="qty-btn" onClick={() => changeCartQty(item.id, 1)}>+</button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {cart.length > 0 && (
              <div className="cart-summary" style={{ borderTop: '1px solid var(--glass-border)', paddingTop: '1rem' }}>
                <div className="summary-line" style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                  <span>Subtotal</span>
                  <span>₹{subtotal.toFixed(2)}</span>
                </div>
                <div className="summary-line" style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                  <span>Taxes (5%)</span>
                  <span>₹{tax.toFixed(2)}</span>
                </div>
                <hr className="summary-divider" style={{ border: 'none', borderTop: '1px solid rgba(255,255,255,0.05)', margin: '0.5rem 0' }} />
                <div className="summary-line grand-total" style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1rem', fontWeight: 'bold', marginBottom: '1.25rem' }}>
                  <span>Grand Total</span>
                  <span>₹{total.toFixed(2)}</span>
                </div>

                {/* Checkout Details Form */}
                <form onSubmit={handleCheckout} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label>Customer Identifier / Seat No.</label>
                    <input type="text" className="form-input" value={customerName} onChange={e => setCustomerName(e.target.value)} placeholder="e.g. Walk-in Guest (Table 4)" />
                  </div>
                  
                  <div className="form-group" style={{ marginBottom: '0.5rem' }}>
                    <label>Payment Method</label>
                    <div className="payment-method-selector" style={{ display: 'flex', gap: '0.5rem', marginTop: '0.25rem' }}>
                      <label className={`pay-method-chip ${payMethod === 'cash' ? 'active' : ''}`} onClick={() => { setPayMethod('cash'); playPOSBeep(); }}>
                        💵 Cash
                      </label>
                      <label className={`pay-method-chip ${payMethod === 'card' ? 'active' : ''}`} onClick={() => { setPayMethod('card'); playPOSBeep(); }}>
                        💳 Card
                      </label>
                      <label className={`pay-method-chip ${payMethod === 'rfid' ? 'active' : ''}`} onClick={() => { setPayMethod('rfid'); playPOSBeep(); }}>
                        📡 RFID Tap
                      </label>
                    </div>
                  </div>

                  <button type="submit" className="btn btn-primary w-full" style={{ background: 'linear-gradient(135deg, var(--color-primary), #ff9f43)' }}>Complete Order & Print ➔</button>
                </form>
              </div>
            )}
          </div>
        </aside>

      </div>

      {/* Thermal Receipt Print Modal */}
      {showReceiptModal && lastPlacedOrder && (
        <div className="dialog-overlay" style={{ display: 'flex', zIndex: 10000 }}>
          <div className="dialog-content glass-card" style={{ width: '360px', padding: '1.5rem', color: '#111', background: '#fbfbfb', border: '2px solid #555', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="dialog-header" style={{ borderBottom: '1px dashed #555', paddingBottom: '0.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ color: '#111', fontFamily: 'monospace', textAlign: 'center', width: '100%' }}>🍽️ CAMPUS FOOD COURT</h3>
              <button className="dialog-close" onClick={closeReceipt} style={{ color: '#555' }}>×</button>
            </div>

            {/* Thermal Print Content */}
            <div className="receipt-print-area" style={{ fontFamily: 'monospace', fontSize: '0.85rem', lineHeight: '1.4' }}>
              <div style={{ textAlign: 'center', marginBottom: '0.75rem' }}>
                <div>CAMPUS STUDENT FOOD COURT</div>
                <div style={{ fontSize: '0.75rem' }}>Counter POS Terminal</div>
              </div>
              <div className="receipt-header-divider"></div>
              <div style={{ textAlign: 'center', fontSize: '1.5rem', fontWeight: 'bold', margin: '0.5rem 0' }}>
                ORDER TOKEN: {lastPlacedOrder.token}
              </div>
              <div className="receipt-header-divider"></div>
              <div>Date: {new Date(lastPlacedOrder.timeOrdered).toLocaleString()}</div>
              <div>Cashier: {user.username}</div>
              <div>Customer: {lastPlacedOrder.studentName}</div>
              <div className="receipt-header-divider"></div>
              <div style={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>ITEMS:</div>
              {lastPlacedOrder.items.map(item => (
                <div key={item.foodId} className="receipt-line-item">
                  <span>{item.name.substring(0, 18)} x{item.quantity}</span>
                  <span>₹{(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
              <div className="receipt-header-divider"></div>
              <div className="receipt-line-item">
                <span>Subtotal:</span>
                <span>₹{lastPlacedOrder.total.toFixed(2)}</span>
              </div>
              <div className="receipt-line-item">
                <span>Tax (5%):</span>
                <span>₹{lastPlacedOrder.tax.toFixed(2)}</span>
              </div>
              <div className="receipt-line-item" style={{ fontWeight: 'bold', fontSize: '1rem', marginTop: '0.25rem' }}>
                <span>TOTAL PAID:</span>
                <span>₹{lastPlacedOrder.grandTotal.toFixed(2)}</span>
              </div>
              <div style={{ marginTop: '0.25rem' }}>Payment Method: {payMethod.toUpperCase()}</div>
              <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
                <div className="receipt-barcode"></div>
                <span style={{ fontSize: '0.65rem' }}>Thank you for dining with us!</span>
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: '0.5rem', borderTop: '1px dashed #555', paddingTop: '1rem' }}>
              <button className="btn btn-secondary btn-sm w-full" onClick={closeReceipt} style={{ background: '#e2e8f0', color: '#333', borderColor: '#cbd5e1' }}>Close</button>
              <button className="btn btn-primary btn-sm w-full" onClick={() => { playPOSBeep(); alert('🖨️ Simulated Thermal Print Job successfully sent!'); closeReceipt(); }} style={{ background: '#1e293b', color: '#fff' }}>Print Receipt 🖨️</button>
            </div>
          </div>
        </div>
      )}

      {/* Cashier Profile Modal */}
      {showProfileModal && (
        <div className="dialog-overlay" style={{ display: 'flex', zIndex: 10000 }}>
          <div className="dialog-content glass-card animate-scale-in" style={{ width: '420px', padding: '2rem', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.08)' }}>
            <div className="dialog-header" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', alignItems: 'center' }}>
              <h3 style={{ fontSize: '1.25rem', color: '#fff' }}>👤 Cashier Member Profile</h3>
              <button className="dialog-close" onClick={() => setShowProfileModal(false)}>×</button>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '1.5rem' }}>
              <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(255,255,255,0.02)', border: '2px solid var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3rem' }}>
                💰
              </div>
              <div style={{ textAlign: 'center' }}>
                <h4 style={{ fontSize: '1.15rem', color: '#fff' }}>{user.username}</h4>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{user.email}</p>
                <span className="badge badge-info" style={{ fontSize: '0.65rem', marginTop: '0.5rem', display: 'inline-block' }}>POS Cashier Operator</span>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', fontSize: '0.85rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>🖥️ Shift Terminal:</span>
                <strong>Terminal A - Counter Gate 1</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>📊 Transactions Today:</span>
                <strong>{db.orders.filter(o => o.status === 'Completed').length} orders</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>🔓 Status:</span>
                <strong style={{ color: 'var(--color-secondary)' }}>Active Shift</strong>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
