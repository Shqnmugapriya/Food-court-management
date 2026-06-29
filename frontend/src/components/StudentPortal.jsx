import React, { useState, useEffect } from 'react';
import { claimDailyCheckin, checkoutOrder } from '../state/api.js';

// Multi-language translation dictionary
const translations = {
  en: {
    welcome: "Welcome back",
    points: "Green Points",
    rank: "Rank Level",
    checkin: "Claim Today's Check-in (+10 pts)",
    alreadyChecked: "Check-in claimed today!",
    search: "Search foods, ingredients, category...",
    price: "Max Price",
    calories: "Max Calories",
    rating: "Min Rating",
    veg: "Veg Only",
    jain: "Jain Food Friendly",
    ecoMeal: "Eco sugarcane packaging",
    checkout: "Proceed to Checkout",
    cartEmpty: "Your meal tray is empty.",
    ecoPoints: "Green points earned",
    carbonSavings: "Carbon footprints saved",
    diningOption: "Dining Option",
    pickupTime: "Expected Pick-up",
    placeOrder: "Confirm Trailing Order",
    specialNotes: "Allergens & Notes",
    successOrder: "Order placed successfully!"
  },
  es: {
    welcome: "Bienvenido",
    points: "Puntos Verdes",
    rank: "Nivel de Rango",
    checkin: "Reclamar Check-in de Hoy (+10 pts)",
    alreadyChecked: "¡Check-in reclamado hoy!",
    search: "Buscar comida, ingredientes...",
    price: "Precio Máximo",
    calories: "Calorías Máximas",
    rating: "Calificación Mínima",
    veg: "Solo Vegano",
    jain: "Apto Jainista",
    ecoMeal: "Envase de caña de azúcar ecológico",
    checkout: "Proceder al Pago",
    cartEmpty: "Tu bandeja de comida está vacía.",
    ecoPoints: "Puntos verdes ganados",
    carbonSavings: "Huella de carbono ahorrada",
    diningOption: "Opción de comedor",
    pickupTime: "Recogida esperada",
    placeOrder: "Confirmar Pedido",
    specialNotes: "Alérgenos y notas",
    successOrder: "¡Pedido realizado con éxito!"
  },
  hi: {
    welcome: "स्वागत है",
    points: "ग्रीन पॉइंट्स",
    rank: "रैंक स्तर",
    checkin: "आज का चेक-इन दावा करें (+10 अंक)",
    alreadyChecked: "आज का चेक-इन दावा किया जा चुका है!",
    search: "भोजन, सामग्री खोजें...",
    price: "अधिकतम मूल्य",
    calories: "अधिकतम कैलोरी",
    rating: "न्यूनतम रेटिंग",
    veg: "केवल शाकाहारी",
    jain: "जैन भोजन अनुकूल",
    ecoMeal: "पारिस्थितिकी गन्ना पैकेजिंग",
    checkout: "चेकआउट करें",
    cartEmpty: "आपकी भोजन ट्रे खाली है।",
    ecoPoints: "अर्जित ग्रीन पॉइंट्स",
    carbonSavings: "बचाया गया कार्बन उत्सर्जन",
    diningOption: "भोजन का विकल्प",
    pickupTime: "अपेक्षित पिक-अप समय",
    placeOrder: "ऑर्डर की पुष्टि करें",
    specialNotes: "एलर्जी और विशेष निर्देश",
    successOrder: "ऑर्डर सफलतापूर्वक भेजा गया!"
  }
};

export default function StudentPortal({ db, user, onUpdateUser, onLogout }) {
  const [lang, setLang] = useState('en');
  const t = translations[lang];

  // Accessibility States
  const [largeFont, setLargeFont] = useState(false);
  const [highContrast, setHighContrast] = useState(false);

  // Filter States
  const [search, setSearch] = useState('');
  const [priceRange, setPriceRange] = useState(300.00);
  const [calRange, setCalRange] = useState(800);
  const [ratingRange, setRatingRange] = useState(4.0);
  const [vegOnly, setVegOnly] = useState(false);
  const [jainOnly, setJainOnly] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Profile & Spend
  const [showProfileModal, setShowProfileModal] = useState(false);
  const trayTotalSpend = db.orders.filter(o => o.studentName.toLowerCase() === user.username.toLowerCase() && o.status === 'Completed').reduce((sum, o) => sum + o.grandTotal, 0);

  // Non-Veg and Feedback States
  const [nonVegOnly, setNonVegOnly] = useState(false);
  const [activePortalTab, setActivePortalTab] = useState('menu'); // menu, feedback
  const [feedbackRating, setFeedbackRating] = useState(5);
  const [feedbackComment, setFeedbackComment] = useState('');

  const handleFeedbackSubmit = (e) => {
    e.preventDefault();
    if (!feedbackComment.trim()) return;
    
    const feedbacks = JSON.parse(localStorage.getItem('student_feedbacks') || '[]');
    feedbacks.push({
      id: 'fb_' + Date.now(),
      studentName: user.username,
      rating: feedbackRating,
      comment: feedbackComment.trim(),
      date: new Date().toLocaleString()
    });
    localStorage.setItem('student_feedbacks', JSON.stringify(feedbacks));
    
    // Force sync update
    fetch('http://localhost:8080/api/orders').then(() => {});
    
    setFeedbackRating(5);
    setFeedbackComment('');
    alert('Thank you! Your feedback has been recorded and submitted to the Admin Console.');
  };

  // Checkout Tray
  const [tray, setTray] = useState([]); // Array of { food, quantity }
  const [ecoPackaging, setEcoPackaging] = useState(false);
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  
  // Checkout Form
  const [diningOption, setDiningOption] = useState('dine-in');
  const [pickupTime, setPickupTime] = useState('Immediate');
  const [specialNotes, setSpecialNotes] = useState('');

  // Daily Checkin Claim check
  const [checkinClaimed, setCheckinClaimed] = useState(false);

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    const claimedDates = JSON.parse(localStorage.getItem(`claimed_dates_${user.email}`) || '[]');
    if (claimedDates.includes(today)) {
      setCheckinClaimed(true);
    }
  }, [user.email]);

  const handleCheckin = async () => {
    if (checkinClaimed) return;
    try {
      const updatedUser = await claimDailyCheckin(user.email);
      onUpdateUser(updatedUser);
      
      const today = new Date().toISOString().split('T')[0];
      const claimedDates = JSON.parse(localStorage.getItem(`claimed_dates_${user.email}`) || '[]');
      claimedDates.push(today);
      localStorage.setItem(`claimed_dates_${user.email}`, JSON.stringify(claimedDates));
      
      setCheckinClaimed(true);
      alert('🎉 +10 Green Points awarded for daily check-in!');
    } catch(e) {
      alert('Error claiming checkin.');
    }
  };

  const addToTray = (food) => {
    const existing = tray.find(item => item.food.id === food.id);
    if (existing) {
      setTray(tray.map(item => item.food.id === food.id ? { ...item, quantity: item.quantity + 1 } : item));
    } else {
      setTray([...tray, { food, quantity: 1 }]);
    }
  };

  const changeTrayQty = (foodId, delta) => {
    setTray(tray.map(item => {
      if (item.food.id === foodId) {
        const nextQty = item.quantity + delta;
        return nextQty <= 0 ? null : { ...item, quantity: nextQty };
      }
      return item;
    }).filter(Boolean));
  };

  // Calculations
  const subtotal = tray.reduce((sum, item) => sum + item.food.price * item.quantity, 0);
  const packagingFee = ecoPackaging ? 0.25 : 0.00;
  const tax = (subtotal + packagingFee) * 0.05;
  const total = subtotal + packagingFee + tax;
  const pointsEarned = tray.reduce((sum, item) => sum + (item.food.isEco ? 15 : 10) * item.quantity, 0) + (ecoPackaging ? 10 : 0);
  const carbonSaved = tray.reduce((sum, item) => sum + (item.food.isEco ? item.food.carbonFootprint : 0) * item.quantity, 0) + (ecoPackaging ? 0.15 : 0.0);

  const handleCheckoutSubmit = async (e) => {
    e.preventDefault();
    if (tray.length === 0) return;

    const orderPayload = {
      studentName: user.username,
      items: tray.map(item => ({
        foodId: item.food.id,
        name: item.food.name,
        quantity: item.quantity,
        price: item.food.price
      })),
      total: subtotal,
      tax: tax,
      serviceCharge: packagingFee,
      grandTotal: total,
      diningOption: diningOption,
      pickupTime: pickupTime,
      specialInstructions: `${specialNotes} ${ecoPackaging ? '[Sugarcane eco pack]' : ''}`.trim(),
      sustainabilitySaved: carbonSaved,
      pointsEarned: pointsEarned
    };

    try {
      await checkoutOrder(orderPayload);
      alert(t.successOrder);
      setTray([]);
      setEcoPackaging(false);
      setShowCheckoutModal(false);
    } catch(e) {
      alert('Checkout failed.');
    }
  };

  // Filters
  const filteredFoods = db.foods.filter(food => {
    if (selectedCategory !== 'All' && food.category !== selectedCategory) return false;
    if (vegOnly && !food.isEco) return false; // eco = veg
    if (nonVegOnly && food.isEco) return false; // not eco = non-veg
    if (jainOnly && !food.isJain) return false;
    if (food.price > priceRange) return false;
    if (food.rating < ratingRange) return false;
    
    // search check
    if (search) {
      const q = search.toLowerCase();
      const matchesName = food.name.toLowerCase().includes(q);
      const matchesDesc = food.description.toLowerCase().includes(q);
      const matchesCat = food.category.toLowerCase().includes(q);
      return matchesName || matchesDesc || matchesCat;
    }
    
    return true;
  });

  // Live trackers & queue analysis
  const studentActiveOrders = db.orders.filter(
    o => o.studentName.toLowerCase() === user.username.toLowerCase() && 
    o.status !== 'Completed' && 
    o.status !== 'Cancelled'
  );
  
  const totalSystemQueue = db.orders.filter(o => o.status !== 'Completed' && o.status !== 'Cancelled').length;
  
  let queueLoadText = "Short (Easy to get food!)";
  let queueLoadColor = "#10b981"; // green
  if (totalSystemQueue >= 6) {
    queueLoadText = "Busy (Long wait times)";
    queueLoadColor = "#ef4444"; // red
  } else if (totalSystemQueue >= 3) {
    queueLoadText = "Moderate (Normal wait)";
    queueLoadColor = "#f59e0b"; // yellow
  }

  return (
    <div className={`${largeFont ? 'accessibility-large-text' : ''} ${highContrast ? 'accessibility-high-contrast' : ''}`}>
      {/* Top Navbar */}
      <header className="top-nav">
        <div className="logo">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2L2 22H22L12 2Z" stroke="url(#logo-grad)" strokeWidth="2" strokeLinejoin="round"/>
          </svg>
          Smart Food Court <span style={{ fontSize: '0.8rem', padding: '0.2rem 0.5rem', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', marginLeft: '0.5rem' }}>Student Portal</span>
        </div>
        <div className="nav-actions">
          {/* Lang */}
          <select value={lang} onChange={e => setLang(e.target.value)} style={{ background: 'rgba(0,0,0,0.5)', border: '1px solid var(--glass-border)', color: '#fff', borderRadius: '4px', padding: '0.2rem 0.5rem', fontSize: '0.8rem' }}>
            <option value="en">English</option>
            <option value="es">Español</option>
            <option value="hi">हिन्दी</option>
          </select>
          {/* Accessibility */}
          <button className="theme-toggle" onClick={() => setLargeFont(!largeFont)} title="Toggle font size" style={{ fontSize: '0.85rem' }}>🅰️</button>
          <button className="theme-toggle" onClick={() => setHighContrast(!highContrast)} title="Toggle High Contrast">👁️</button>
          {/* Profile */}
          <div className="user-profile" style={{ cursor: 'pointer' }} onClick={() => setShowProfileModal(true)} title="View Profile Info">
            <span className="user-avatar">👤</span>
            <span className="user-name" style={{ borderBottom: '1px dashed rgba(255,255,255,0.2)' }}>{user.username}</span>
          </div>
          <button onClick={onLogout} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-danger)', marginLeft: '0.5rem', fontSize: '1.1rem' }} title="Logout">🚪</button>
        </div>
      </header>

      <div className="container main-layout animate-fade-in" style={{ display: 'grid', gridTemplateColumns: '300px 1fr 340px', gap: '1.5rem', marginTop: '1.5rem' }}>
        
        {/* Left column: loyalty hub, Leaderboard, Queue Analysis & Active Orders */}
        <aside className="student-profile-sidebar" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Welcome Card */}
          <div className="glass-card welcome-card" style={{ padding: '1.25rem' }}>
            <h4 style={{ color: 'var(--text-secondary)' }}>{t.welcome}, {user.username}!</h4>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.8rem', fontSize: '0.85rem' }}>
              <span>🍃 {t.points}:</span>
              <strong style={{ color: 'var(--color-secondary)' }}>{user.loyaltyPoints} pts</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.4rem', fontSize: '0.85rem' }}>
              <span>🏆 {t.rank}:</span>
              <strong>{user.loyaltyRank}</strong>
            </div>
            <button className="btn btn-primary btn-sm w-full" onClick={handleCheckin} disabled={checkinClaimed} style={{ marginTop: '0.8rem', fontSize: '0.75rem', background: checkinClaimed ? 'rgba(255,255,255,0.05)' : '' }}>
              {checkinClaimed ? t.alreadyChecked : t.checkin}
            </button>
          </div>

          {/* Queue Analysis Widget */}
          <div className="glass-card" style={{ padding: '1.25rem' }}>
            <h4 style={{ fontSize: '0.95rem', marginBottom: '0.5rem', color: '#fff' }}>🚦 Live Queue Analysis</h4>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: '0.5rem 0' }}>
              <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: queueLoadColor, boxShadow: `0 0 8px ${queueLoadColor}` }}></div>
              <strong style={{ fontSize: '0.85rem', color: queueLoadColor }}>{queueLoadText}</strong>
            </div>
            <p style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
              Current queue load: <strong>{totalSystemQueue} orders</strong> active.
              {totalSystemQueue <= 2 ? ' Highly recommended to order now: minimal wait!' : totalSystemQueue <= 5 ? ' Moderate service flow. Expect normal cooking delays.' : ' High volume right now. Wait times are elevated.'}
            </p>
          </div>

          {/* Active Orders Tracker */}
          <div className="glass-card" style={{ padding: '1.25rem', flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
            <h4 style={{ fontSize: '0.95rem', marginBottom: '0.75rem', color: '#fff' }}>📡 Active Trackers</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', overflowY: 'auto', maxHeight: '320px', flexGrow: 1 }}>
              {studentActiveOrders.length === 0 ? (
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center', margin: 'auto' }}>No active orders in the queue. Place an order to trace progress!</p>
              ) : (
                studentActiveOrders.map(order => {
                  const isPending = order.status === 'Pending';
                  const isPreparing = order.status === 'Preparing';
                  const isPackaging = order.status === 'Packaging';
                  const isReady = order.status === 'Ready';

                  const countAhead = db.orders.filter(o => o.status !== 'Completed' && o.status !== 'Cancelled' && o.timeOrdered < order.timeOrdered).length;
                  const estTimeMins = (countAhead + 1) * 3;

                  let statusDescText = "Order Placed";
                  if (isPending) statusDescText = "⏳ Awaiting counter acceptance...";
                  if (isPreparing) statusDescText = "🍳 Chef is actively preparing...";
                  if (isPackaging) statusDescText = "📦 Counter packaging your meal...";
                  if (isReady) statusDescText = "🔔 Ready! Collect at Counter 1.";

                  return (
                    <div key={order.id} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', padding: '0.75rem', borderRadius: '12px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                        <span style={{ color: 'var(--color-primary)' }}>Token {order.token}</span>
                        <span>Est: ~{estTimeMins}m</span>
                      </div>
                      
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '0.75rem 0', position: 'relative' }}>
                        <div style={{ position: 'absolute', left: '5%', right: '5%', top: '50%', height: '2px', background: 'rgba(255,255,255,0.08)', zIndex: 1 }}></div>
                        <div style={{ position: 'absolute', left: '5%', width: isReady ? '90%' : isPreparing ? '50%' : '10%', top: '50%', height: '2px', background: 'var(--color-primary)', zIndex: 1, transition: 'width 0.5s' }}></div>

                        <div style={{ width: '16px', height: '16px', borderRadius: '50%', background: 'var(--color-primary)', border: '2px solid #000', zIndex: 2 }} title="Placed"></div>
                        <div style={{ width: '16px', height: '16px', borderRadius: '50%', background: isPreparing || isPackaging || isReady ? 'var(--color-primary)' : '#1f2937', border: '2px solid #000', zIndex: 2 }} title="Preparing"></div>
                        <div style={{ width: '16px', height: '16px', borderRadius: '50%', background: isReady ? 'var(--color-primary)' : '#1f2937', border: '2px solid #000', zIndex: 2 }} title="Ready"></div>
                      </div>

                      <div style={{ fontSize: '0.72rem', color: isReady ? 'var(--color-secondary)' : 'var(--text-secondary)', fontWeight: isReady ? 'bold' : 'normal', textAlign: 'center', background: 'rgba(0,0,0,0.1)', padding: '0.3rem', borderRadius: '6px' }}>
                        {statusDescText}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Leaderboard */}
          <div className="glass-card leaderboard-widget" style={{ padding: '1.25rem' }}>
            <h4 style={{ fontSize: '0.95rem', marginBottom: '0.75rem', color: '#fff' }}>🏆 Loyalty Leaderboard</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '140px', overflowY: 'auto' }}>
              {db.allUsers.slice(0, 5).map((u, idx) => (
                <div key={u.email} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', padding: '0.25rem 0', borderBottom: '1px solid rgba(255,255,255,0.02)', color: u.email === user.email ? 'var(--color-secondary)' : '' }}>
                  <span>{idx + 1}. {u.username}</span>
                  <strong>{u.loyaltyPoints} pts</strong>
                </div>
              ))}
            </div>
          </div>
        </aside>

        {/* Center column: Menu cards */}
        <main className="student-menu-feed">
          {/* Tabs Header */}
          <div style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid rgba(255,255,255,0.05)', marginBottom: '1.5rem', paddingBottom: '0.5rem' }}>
            <button className={`tab-btn ${activePortalTab === 'menu' ? 'active' : ''}`} onClick={() => setActivePortalTab('menu')} style={{ fontSize: '0.9rem', padding: '0.4rem 1rem' }}>
              🍔 Order Menu
            </button>
            <button className={`tab-btn ${activePortalTab === 'feedback' ? 'active' : ''}`} onClick={() => setActivePortalTab('feedback')} style={{ fontSize: '0.9rem', padding: '0.4rem 1rem' }}>
              💬 Student Feedback Hub
            </button>
          </div>

          {activePortalTab === 'menu' ? (
            <>
              {/* Search Filters */}
          <div className="glass-card search-filter-card" style={{ padding: '1.25rem', marginBottom: '1.5rem' }}>
            <input type="text" className="form-input" placeholder={t.search} value={search} onChange={e => setSearch(e.target.value)} style={{ marginBottom: '1rem' }} />
            
            <div className="grid-cols-3" style={{ gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.75rem' }}>{t.price}: ₹{priceRange.toFixed(2)}</label>
                <input type="range" min="40" max="300" step="10" value={priceRange} onChange={e => setPriceRange(parseFloat(e.target.value))} style={{ width: '100%' }} />
              </div>
              <div>
                <label style={{ fontSize: '0.75rem' }}>{t.calories}: {calRange} kcal</label>
                <input type="range" min="300" max="1000" step="50" value={calRange} onChange={e => setCalRange(parseInt(e.target.value))} style={{ width: '100%' }} />
              </div>
              <div>
                <label style={{ fontSize: '0.75rem' }}>{t.rating}: {ratingRange.toFixed(1)} ★</label>
                <input type="range" min="3.5" max="5.0" step="0.1" value={ratingRange} onChange={e => setRatingRange(parseFloat(e.target.value))} style={{ width: '100%' }} />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.8rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', cursor: 'pointer' }}>
                <input type="checkbox" checked={vegOnly} onChange={e => {
                  setVegOnly(e.target.checked);
                  if (e.target.checked) setNonVegOnly(false);
                }} /> 🌱 Veg Only
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', cursor: 'pointer' }}>
                <input type="checkbox" checked={nonVegOnly} onChange={e => {
                  setNonVegOnly(e.target.checked);
                  if (e.target.checked) setVegOnly(false);
                }} /> 🍗 Non-Veg Only
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', cursor: 'pointer' }}>
                <input type="checkbox" checked={jainOnly} onChange={e => setJainOnly(e.target.checked)} /> 🕉️ {t.jain}
              </label>
            </div>
          </div>

          {/* Categories Tab */}
          <div className="category-tabs" style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', overflowX: 'auto', paddingBottom: '0.25rem' }}>
            <button className={`tab-btn ${selectedCategory === 'All' ? 'active' : ''}`} onClick={() => setSelectedCategory('All')}>All</button>
            {db.categories.map(cat => (
              <button key={cat} className={`tab-btn ${selectedCategory === cat ? 'active' : ''}`} onClick={() => setSelectedCategory(cat)}>{cat}</button>
            ))}
          </div>

          {/* Food Grid */}
          <div className="food-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1.25rem' }}>
            {filteredFoods.map(food => (
              <div key={food.id} className="glass-card food-card interactive" style={{ padding: '1rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '300px' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '2.5rem', margin: '0.5rem 0' }}>
                    {food.id === 'f1' ? '🥑' : food.id === 'f2' ? '🌯' : food.id === 'f3' ? '🥗' : food.id === 'f4' ? '🍚' : food.id === 'f5' ? '🍰' : '🍵'}
                  </div>
                  <h4 style={{ fontSize: '0.95rem', margin: '0.25rem 0' }}>{food.name}</h4>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', height: '40px', overflow: 'hidden' }}>{food.description}</p>
                </div>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <span style={{ fontWeight: '700', color: 'var(--color-primary)' }}>₹{food.price.toFixed(2)}</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--color-secondary)' }}>🌱 {food.carbonFootprint} kg</span>
                  </div>
                  <button className="btn btn-primary btn-sm w-full" onClick={() => addToTray(food)}>Add Tray</button>
                </div>
              </div>
            ))}
          </div>
          </>
          ) : (
            /* Feedback Form */
            <div className="glass-card animate-fade-in" style={{ padding: '2rem' }}>
              <h3 style={{ marginBottom: '0.5rem', color: '#fff' }}>💬 Share Your Experience</h3>
               <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>Your ratings and feedback help us improve the campus dining experience.</p>
               
               <form onSubmit={handleFeedbackSubmit}>
                 <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                   <label>Rating (1 to 5 Stars)</label>
                   <select className="form-input" value={feedbackRating} onChange={e => setFeedbackRating(parseInt(e.target.value))} style={{ width: '150px', background: 'rgba(0,0,0,0.2)', color: '#fff' }}>
                     <option value="5">★★★★★ (5 Stars)</option>
                     <option value="4">★★★★☆ (4 Stars)</option>
                     <option value="3">★★★☆☆ (3 Stars)</option>
                     <option value="2">★★☆☆☆ (2 Stars)</option>
                     <option value="1">★☆☆☆☆ (1 Star)</option>
                   </select>
                 </div>
                 
                 <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                   <label>Comments / Suggestions</label>
                   <textarea className="form-input" rows="4" placeholder="How was your food? Mention items you liked, or counter wait time suggestions..." value={feedbackComment} onChange={e => setFeedbackComment(e.target.value)} required style={{ background: 'rgba(0,0,0,0.2)' }}></textarea>
                 </div>
                 
                 <button type="submit" className="btn btn-primary">Submit Feedback Log</button>
               </form>
               
               {/* List of past reviews from localStorage */}
               <div style={{ marginTop: '2.5rem', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '1.5rem' }}>
                 <h4 style={{ color: '#fff', marginBottom: '1rem' }}>📋 Recent Dining Feedback</h4>
                 <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '300px', overflowY: 'auto' }}>
                   {JSON.parse(localStorage.getItem('student_feedbacks') || '[]').length === 0 ? (
                     <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>No feedback left yet. Be the first to share your thoughts!</p>
                   ) : (
                     [...JSON.parse(localStorage.getItem('student_feedbacks') || '[]')].reverse().map(fb => (
                       <div key={fb.id} style={{ background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.04)' }}>
                         <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 'bold', marginBottom: '0.25rem' }}>
                           <span>👤 {fb.studentName}</span>
                           <span style={{ color: 'var(--color-warning)' }}>{'★'.repeat(fb.rating) + '☆'.repeat(5 - fb.rating)}</span>
                         </div>
                         <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{fb.comment}</p>
                         <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.25rem', textAlign: 'right' }}>{fb.date}</div>
                       </div>
                     ))
                   )}
                 </div>
               </div>
            </div>
          )}
        </main>

        {/* Right column: Tray checkout */}
        <aside className="student-tray-aside">
          <div className="glass-card cart-panel" style={{ padding: '1.25rem', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <h3 style={{ fontSize: '1.15rem', marginBottom: '1rem' }}>🛒 Tray Checkout</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '260px', overflowY: 'auto' }}>
                {tray.length === 0 ? (
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{t.cartEmpty}</p>
                ) : (
                  tray.map(item => (
                    <div key={item.food.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem' }}>
                      <span style={{ maxWidth: '120px' }}>{item.food.name}</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <button className="qty-btn" onClick={() => changeTrayQty(item.food.id, -1)}>-</button>
                        <strong>{item.quantity}</strong>
                        <button className="qty-btn" onClick={() => changeTrayQty(item.food.id, 1)}>+</button>
                      </div>
                      <span>₹{(item.food.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {tray.length > 0 && (
              <div style={{ borderTop: '1px solid var(--glass-border)', paddingTop: '1rem' }}>
                <label style={{ display: 'flex', gap: '0.5rem', fontSize: '0.8rem', marginBottom: '1rem', cursor: 'pointer' }}>
                  <input type="checkbox" checked={ecoPackaging} onChange={e => setEcoPackaging(e.target.checked)} />
                  🌱 {t.ecoMeal} (+₹0.25)
                </label>

                <div className="summary-line" style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                  <span>Subtotal</span>
                  <span>₹{subtotal.toFixed(2)}</span>
                </div>
                {ecoPackaging && (
                  <div className="summary-line" style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                    <span>Eco Container</span>
                    <span>₹0.25</span>
                  </div>
                )}
                <div className="summary-line" style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                  <span>Tax (5%)</span>
                  <span>₹{tax.toFixed(2)}</span>
                </div>
                <div className="summary-line grand-total" style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '1rem', marginTop: '0.25rem', marginBottom: '1rem' }}>
                  <span>Total</span>
                  <span>₹{total.toFixed(2)}</span>
                </div>

                <div style={{ background: 'rgba(16,185,129,0.05)', padding: '0.5rem', borderRadius: '6px', fontSize: '0.75rem', marginBottom: '1rem' }}>
                  <div>🎁 {t.ecoPoints}: <strong>+{pointsEarned} pts</strong></div>
                  <div>🌍 {t.carbonSavings}: <strong>-{carbonSaved.toFixed(2)}kg CO₂</strong></div>
                </div>

                <button className="btn btn-primary w-full" onClick={() => setShowCheckoutModal(true)}>{t.checkout} ➔</button>
              </div>
            )}
          </div>
        </aside>
      </div>

      {/* Checkout Options Modal */}
      {showCheckoutModal && (
        <div className="dialog-overlay" style={{ display: 'flex' }}>
          <div className="dialog-content glass-card" style={{ width: '400px', padding: '2rem' }}>
            <div className="dialog-header" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <h3>{t.checkout} Options</h3>
              <button className="dialog-close" onClick={() => setShowCheckoutModal(false)}>×</button>
            </div>
            <form onSubmit={handleCheckoutSubmit}>
              <div className="form-group">
                <label>{t.diningOption}</label>
                <select className="form-input" value={diningOption} onChange={e => setDiningOption(e.target.value)}>
                  <option value="dine-in">Dine-in (Lounge)</option>
                  <option value="takeaway">Takeaway (Packaging)</option>
                </select>
              </div>
              <div className="form-group">
                <label>{t.pickupTime}</label>
                <select className="form-input" value={pickupTime} onChange={e => setPickupTime(e.target.value)}>
                  <option value="Immediate">Immediate Prep</option>
                  <option value="15 mins">In 15 Mins</option>
                  <option value="30 mins">In 30 Mins</option>
                  <option value="1 hour">In 1 Hour</option>
                </select>
              </div>
              <div className="form-group">
                <label>{t.specialNotes}</label>
                <input type="text" className="form-input" placeholder="e.g. No onions, peanut allergies..." value={specialNotes} onChange={e => setSpecialNotes(e.target.value)} />
              </div>
              <button type="submit" className="btn btn-primary w-full" style={{ marginTop: '1rem' }}>{t.placeOrder}</button>
            </form>
          </div>
        </div>
      )}

      {/* Profile Modal */}
      {showProfileModal && (
        <div className="dialog-overlay" style={{ display: 'flex', zIndex: 10000 }}>
          <div className="dialog-content glass-card animate-scale-in" style={{ width: '420px', padding: '2rem', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.08)' }}>
            <div className="dialog-header" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', alignItems: 'center' }}>
              <h3 style={{ fontSize: '1.25rem', color: '#fff' }}>👤 My Member Profile</h3>
              <button className="dialog-close" onClick={() => setShowProfileModal(false)}>×</button>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '1.5rem' }}>
              <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(255,255,255,0.02)', border: '2px solid var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3rem' }}>
                🎓
              </div>
              <div style={{ textAlign: 'center' }}>
                <h4 style={{ fontSize: '1.15rem', color: '#fff' }}>{user.username}</h4>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{user.email}</p>
                <span className="badge badge-preparing" style={{ fontSize: '0.65rem', marginTop: '0.5rem', display: 'inline-block' }}>Student Account</span>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', fontSize: '0.85rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>🏆 Loyalty Rank:</span>
                <strong>{user.loyaltyRank}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>🍃 Green Points:</span>
                <strong style={{ color: 'var(--color-secondary)' }}>{user.loyaltyPoints} pts</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>💰 Total Spend:</span>
                <strong style={{ color: 'var(--color-primary)' }}>₹{trayTotalSpend.toFixed(2)}</strong>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginTop: '0.5rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>🏅 Earned Badges:</span>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginTop: '0.2rem' }}>
                  {user.badges ? user.badges.split(',').map(b => (
                    <span key={b} className="badge badge-info" style={{ fontSize: '0.65rem', padding: '0.25rem 0.5rem', background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.2)', borderRadius: '6px' }}>
                      {b.trim()}
                    </span>
                  )) : <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>No badges yet</span>}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
