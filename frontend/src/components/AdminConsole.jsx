import React, { useState, useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';
import { saveFoodItem, deleteFoodItem, saveCategory, deleteCategory, saveShiftRoster, deleteShiftRoster, saveWasteLog, saveCoupon } from '../state/api.js';

export default function AdminConsole({ db, user, onLogout }) {
  const [activeTab, setActiveTab] = useState('analytics');
  const [showProfileModal, setShowProfileModal] = useState(false);

  // Chart References
  const canvasRevRef = useRef(null);
  const canvasQueueRef = useRef(null);
  const canvasSustRef = useRef(null);
  const chartRevInst = useRef(null);
  const chartQueueInst = useRef(null);
  const chartSustInst = useRef(null);

  // Food CRUD Modal states
  const [showFoodModal, setShowFoodModal] = useState(false);
  const [foodEditId, setFoodEditId] = useState('');
  const [foodName, setFoodName] = useState('');
  const [foodCategory, setFoodCategory] = useState('Breakfast');
  const [foodPrice, setFoodPrice] = useState(5.99);
  const [foodCookTime, setFoodCookTime] = useState(5);
  const [foodCarbon, setFoodCarbon] = useState(0.15);
  const [foodDesc, setFoodDesc] = useState('');
  const [foodIsEco, setFoodIsEco] = useState(false);
  const [foodIsJain, setFoodIsJain] = useState(false);

  // Categories CRUD Form states
  const [newCatName, setNewCatName] = useState('');

  // Roster Shift Form states
  const [rosterName, setRosterName] = useState('');
  const [rosterCounter, setRosterCounter] = useState('Counter 1 - Fast Food');
  const [rosterTime, setRosterTime] = useState('');

  // Waste Log Form states
  const [wasteName, setWasteName] = useState('');
  const [wasteQty, setWasteQty] = useState(10);
  const [wasteNgo, setWasteNgo] = useState('NGO Rescue Food');

  // Coupon Code Form states
  const [couponCode, setCouponCode] = useState('');
  const [couponDiscount, setCouponDiscount] = useState(10);
  const [couponDesc, setCouponDesc] = useState('General Campaign');

  // Chart Rendering Hook
  useEffect(() => {
    if (activeTab === 'analytics') {
      const textColor = '#9ca3af';
      const gridColor = 'rgba(255, 255, 255, 0.05)';
      const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { labels: { color: textColor, font: { family: 'Outfit' } } }
        },
        scales: {
          x: { grid: { color: gridColor }, ticks: { color: textColor, font: { family: 'Outfit' } } },
          y: { grid: { color: gridColor }, ticks: { color: textColor, font: { family: 'Outfit' } } }
        }
      };

      // 1. Revenue
      if (canvasRevRef.current) {
        if (chartRevInst.current) chartRevInst.current.destroy();
        chartRevInst.current = new Chart(canvasRevRef.current, {
          type: 'bar',
          data: {
            labels: ['June 23', 'June 24', 'June 25', 'June 26', 'Today'],
            datasets: [{
              label: 'Revenue (₹)',
              data: [320.45, 412.90, 395.10, 485.60, 485.60 + db.orders.filter(o => o.status === 'Completed').reduce((sum, o) => sum + o.grandTotal, 0)],
              backgroundColor: '#ff7e47',
              borderRadius: 6
            }]
          },
          options: chartOptions
        });
      }

      // 2. Queue Wait Spikes
      if (canvasQueueRef.current) {
        if (chartQueueInst.current) chartQueueInst.current.destroy();
        chartQueueInst.current = new Chart(canvasQueueRef.current, {
          type: 'line',
          data: {
            labels: ['9:00 AM', '11:00 AM', '12:30 PM (Rush)', '2:00 PM', '4:00 PM'],
            datasets: [
              {
                label: 'Avg Waiting Time (mins)',
                data: [4, 6, 13, 8, 4],
                borderColor: '#ff7e47',
                backgroundColor: 'rgba(255, 126, 71, 0.1)',
                tension: 0.4,
                fill: true
              },
              {
                label: 'Queue Length (people)',
                data: [2, 5, 11, 7, 3],
                borderColor: '#3b82f6',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                tension: 0.4,
                fill: true
              },
              {
                label: 'AI Predicted Waiting Time (Rush Forecast)',
                data: [5, 7, 14, 9, 5],
                borderColor: '#10b981',
                borderDash: [5, 5],
                backgroundColor: 'transparent',
                tension: 0.4,
                fill: false
              }
            ]
          },
          options: chartOptions
        });
      }

      // 3. Sustainability Doughnut
      if (canvasSustRef.current) {
        if (chartSustInst.current) chartSustInst.current.destroy();
        const carbonSaved = db.orders.filter(o => o.status === 'Completed').reduce((sum, o) => sum + o.sustainabilitySaved, 0) + 12.4;
        const wasteReduced = db.wasteLog.reduce((sum, w) => sum + (w.qty * 0.15), 0) + 4.2;

        chartSustInst.current = new Chart(canvasSustRef.current, {
          type: 'doughnut',
          data: {
            labels: ['CO₂ Saved via Eco-meals (kg)', 'CO₂ Saved via Leftovers Rescue (kg)'],
            datasets: [{
              data: [carbonSaved, wasteReduced],
              backgroundColor: ['#10b981', '#3b82f6'],
              borderColor: 'rgba(0,0,0,0.2)'
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { labels: { color: textColor, font: { family: 'Outfit' } } }
            }
          }
        });
      }
    }
  }, [activeTab, db.orders, db.wasteLog]);

  // Food CRUD methods
  const openAddFood = () => {
    setFoodEditId('');
    setFoodName('');
    setFoodCategory('Breakfast');
    setFoodPrice(5.99);
    setFoodCookTime(5);
    setFoodCarbon(0.15);
    setFoodDesc('');
    setFoodIsEco(false);
    setFoodIsJain(false);
    setShowFoodModal(true);
  };

  const openEditFood = (food) => {
    setFoodEditId(food.id);
    setFoodName(food.name);
    setFoodCategory(food.category);
    setFoodPrice(food.price);
    setFoodCookTime(food.cookingTime);
    setFoodCarbon(food.carbonFootprint);
    setFoodDesc(food.description);
    setFoodIsEco(food.isEco);
    setFoodIsJain(food.isJain);
    setShowFoodModal(true);
  };

  const handleSaveFood = async (e) => {
    e.preventDefault();
    const payload = {
      id: foodEditId,
      name: foodName,
      description: foodDesc,
      price: foodPrice,
      category: foodCategory,
      cookingTime: foodCookTime,
      carbonFootprint: foodCarbon,
      isEco: foodIsEco,
      isJain: foodIsJain,
      availability: true
    };
    try {
      await saveFoodItem(payload);
      setShowFoodModal(false);
    } catch(err) {
      alert('Error saving food.');
    }
  };

  const handleDeleteFood = async (id) => {
    if (confirm('Are you sure you want to delete this food item?')) {
      try {
        await deleteFoodItem(id);
      } catch(e) {
        alert('Error deleting food.');
      }
    }
  };

  // Category CRUD methods
  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    try {
      await saveCategory(newCatName.trim());
      setNewCatName('');
    } catch(err) {
      alert('Error creating category.');
    }
  };

  const handleDeleteCategoryName = async (name) => {
    if (confirm(`Are you sure you want to delete category "${name}"?`)) {
      try {
        await deleteCategory(name);
      } catch(e) {
        alert('Error deleting category.');
      }
    }
  };

  // Roster Shift methods
  const handleAddRoster = async (e) => {
    e.preventDefault();
    if (!rosterName.trim() || !rosterTime.trim()) return;
    const payload = { name: rosterName, counter: rosterCounter, time: rosterTime };
    try {
      await saveShiftRoster(payload);
      setRosterName('');
      setRosterTime('');
    } catch(err) {
      alert('Error scheduling shift.');
    }
  };

  const handleDeleteRosterItem = async (id) => {
    try {
      await deleteShiftRoster(id);
    } catch(e) {
      alert('Error cancelling shift.');
    }
  };

  // Waste Log methods
  const handleAddWasteLog = async (e) => {
    e.preventDefault();
    if (!wasteName.trim()) return;
    const payload = { name: wasteName, qty: wasteQty, destination: wasteNgo };
    try {
      await saveWasteLog(payload);
      setWasteName('');
    } catch(err) {
      alert('Error logging leftovers.');
    }
  };

  // Coupon methods
  const handleAddCoupon = async (e) => {
    e.preventDefault();
    if (!couponCode.trim()) return;
    const payload = { code: couponCode, discount: couponDiscount, type: couponDesc };
    try {
      await saveCoupon(payload);
      setCouponCode('');
    } catch(err) {
      alert('Error saving coupon.');
    }
  };

  // CSV Sales Report exporter
  const exportExcel = () => {
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Token,Customer,Items count,Grand Total,Status,Dining Option,Ordered Time\n";
    db.orders.forEach(o => {
      csvContent += `"${o.token}","${o.studentName}",${o.items.length},${o.grandTotal.toFixed(2)},"${o.status}","${o.diningOption}","${o.timeOrdered}"\n`;
    });
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `sales_report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    alert('📊 Excel Sales Report downloaded successfully!');
  };

  return (
    <div>
      {/* Top Navbar */}
      <header className="top-nav">
        <div className="logo">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2L2 22H22L12 2Z" stroke="url(#logo-grad)" strokeWidth="2" strokeLinejoin="round"/>
          </svg>
          Smart Food Court <span style={{ fontSize: '0.8rem', padding: '0.2rem 0.5rem', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', marginLeft: '0.5rem' }}>Admin Console</span>
        </div>
        <div className="nav-actions">
          <div className="user-profile" style={{ cursor: 'pointer' }} onClick={() => setShowProfileModal(true)}>
            <span className="user-avatar">💼</span>
            <span className="user-name" style={{ borderBottom: '1px dashed rgba(255,255,255,0.2)' }}>{user.username}</span>
          </div>
          <button onClick={onLogout} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-danger)', marginLeft: '0.5rem' }} title="Logout">🚪</button>
        </div>
      </header>

      <div className="container main-layout animate-fade-in" style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: '1.5rem', marginTop: '1.5rem', marginBottom: '3rem' }}>
        
        {/* Sidebar Nav */}
        <aside className="admin-sidebar glass-card">
          <button className={`tab-btn w-full ${activeTab === 'analytics' ? 'active' : ''}`} onClick={() => setActiveTab('analytics')}>📊 System Analytics</button>
          <button className={`tab-btn w-full ${activeTab === 'food-crud' ? 'active' : ''}`} onClick={() => setActiveTab('food-crud')}>🍔 Food Catalog (CRUD)</button>
          <button className={`tab-btn w-full ${activeTab === 'categories' ? 'active' : ''}`} onClick={() => setActiveTab('categories')}>🗂️ Categories CRUD</button>
          <button className={`tab-btn w-full ${activeTab === 'users' ? 'active' : ''}`} onClick={() => setActiveTab('users')}>👥 Shift Scheduling</button>
          <button className={`tab-btn w-full ${activeTab === 'sustainability' ? 'active' : ''}`} onClick={() => setActiveTab('sustainability')}>🌍 Green & Donation Log</button>
          <button className={`tab-btn w-full ${activeTab === 'coupons' ? 'active' : ''}`} onClick={() => setActiveTab('coupons')}>🎫 Coupons & Offers</button>
          <button className={`tab-btn w-full ${activeTab === 'audit-logs' ? 'active' : ''}`} onClick={() => setActiveTab('audit-logs')}>📜 System Audit Logs</button>
          <button className={`tab-btn w-full ${activeTab === 'permissions' ? 'active' : ''}`} onClick={() => setActiveTab('permissions')}>🔒 Staff Permissions</button>
          <button className={`tab-btn w-full ${activeTab === 'feedbacks' ? 'active' : ''}`} onClick={() => setActiveTab('feedbacks')}>💬 Feedback Reviews</button>
        </aside>

        {/* Worksheets */}
        <main className="admin-main-panel glass-card" style={{ padding: '1.5rem' }}>
          
          {/* SECTION: SYSTEM ANALYTICS */}
          {activeTab === 'analytics' && (
            <div className="admin-tab-content active">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <h3>📊 Real-Time Operations Analytics</h3>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button className="btn btn-secondary btn-sm" onClick={() => window.print()} style={{ background: 'rgba(239, 68, 68, 0.15)', borderColor: 'rgba(239, 68, 68, 0.2)', color: 'var(--color-danger)' }}>Export PDF Report 📄</button>
                  <button className="btn btn-secondary btn-sm" onClick={exportExcel} style={{ background: 'rgba(16, 185, 129, 0.15)', borderColor: 'rgba(16, 185, 129, 0.2)', color: 'var(--color-secondary)' }}>Export Excel Report 📊</button>
                </div>
              </div>

              <div className="charts-grid grid-cols-2">
                <div className="chart-container glass-card" style={{ height: '220px', padding: '1rem' }}>
                  <h4>Revenue Trends (₹)</h4>
                  <canvas ref={canvasRevRef}></canvas>
                </div>
                <div className="chart-container glass-card" style={{ height: '220px', padding: '1rem' }}>
                  <h4>Hourly Queue Length vs Waiting Time (mins)</h4>
                  <canvas ref={canvasQueueRef}></canvas>
                </div>
                <div className="chart-container glass-card" style={{ gridColumn: '1 / -1', height: '220px', padding: '1rem' }}>
                  <h4>Green Sustainability Report (Carbon saved in kg CO₂ equivalent)</h4>
                  <canvas ref={canvasSustRef}></canvas>
                </div>
              </div>
            </div>
          )}

          {/* SECTION: FOOD CRUD */}
          {activeTab === 'food-crud' && (
            <div className="admin-tab-content active">
              <div className="section-title-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3>🍔 Food Item Management</h3>
                <button className="btn btn-primary btn-sm" onClick={openAddFood}>+ Add Food Item</button>
              </div>

              <div className="table-container">
                <table className="crud-table">
                  <thead>
                    <tr>
                      <th>Image</th>
                      <th>Name</th>
                      <th>Category</th>
                      <th>Price</th>
                      <th>Carbon</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {db.foods.map(food => (
                      <tr key={food.id}>
                        <td style={{ fontSize: '1.5rem' }}>{food.id === 'f1' ? '🥑' : food.id === 'f2' ? '🌯' : food.id === 'f3' ? '🥗' : food.id === 'f4' ? '🍚' : food.id === 'f5' ? '🍰' : '🍵'}</td>
                        <td><strong>{food.name}</strong></td>
                        <td>{food.category}</td>
                        <td style={{ color: 'var(--color-primary)', fontWeight: 'bold' }}>₹{food.price.toFixed(2)}</td>
                        <td>{food.carbonFootprint} kg</td>
                        <td>
                          <button className="btn btn-secondary btn-sm" onClick={() => openEditFood(food)} style={{ marginRight: '0.25rem' }}>Edit</button>
                          <button className="btn btn-secondary btn-sm" onClick={() => handleDeleteFood(food.id)} style={{ color: 'var(--color-danger)' }}>Delete</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* SECTION: CATEGORIES CRUD */}
          {activeTab === 'categories' && (
            <div className="admin-tab-content active">
              <div className="section-title-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <h3>🗂️ Category Management</h3>
                <form onSubmit={handleAddCategory} style={{ display: 'flex', gap: '0.5rem' }}>
                  <input type="text" className="form-input" placeholder="e.g. Health Food" value={newCatName} onChange={e => setNewCatName(e.target.value)} required style={{ width: '200px', marginBottom: 0 }} />
                  <button type="submit" className="btn btn-primary btn-sm">+ Add Category</button>
                </form>
              </div>

              <div className="table-container">
                <table className="crud-table">
                  <thead>
                    <tr>
                      <th>Category Name</th>
                      <th style={{ width: '120px' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {db.categories.map(cat => (
                      <tr key={cat}>
                        <td><strong>{cat}</strong></td>
                        <td>
                          <button className="btn btn-secondary btn-sm" onClick={() => handleDeleteCategoryName(cat)} style={{ color: 'var(--color-danger)' }}>Delete</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* SECTION: SHIFT SCHEDULING */}
          {activeTab === 'users' && (
            <div className="admin-tab-content active">
              <h3>👥 Shift Scheduling & Roster</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '1.5rem', marginTop: '1.25rem' }}>
                {/* list roster */}
                <div>
                  <div className="roster-grid" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {db.roster.map(item => (
                      <div key={item.id} className="roster-card glass-card" style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem' }}>
                        <div>
                          <strong>{item.name}</strong>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{item.counter} | {item.time}</div>
                        </div>
                        <button className="btn btn-secondary btn-sm" onClick={() => handleDeleteRosterItem(item.id)} style={{ color: 'var(--color-danger)' }}>Delete</button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Form */}
                <div className="glass-card" style={{ padding: '1.25rem' }}>
                  <h4 style={{ marginBottom: '1rem' }}>Schedule Shift</h4>
                  <form onSubmit={handleAddRoster}>
                    <div className="form-group">
                      <label>Staff Name</label>
                      <input type="text" className="form-input" placeholder="Chef Mario" value={rosterName} onChange={e => setRosterName(e.target.value)} required />
                    </div>
                    <div className="form-group">
                      <label>Counter</label>
                      <select className="form-input" value={rosterCounter} onChange={e => setRosterCounter(e.target.value)}>
                        <option value="Counter 1 - Fast Food">Counter 1 - Fast Food</option>
                        <option value="Counter 2 - Salads">Counter 2 - Salads</option>
                        <option value="Counter 3 - Desserts">Counter 3 - Desserts</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Shift Timing</label>
                      <input type="text" className="form-input" placeholder="e.g. 11:00 AM - 4:00 PM" value={rosterTime} onChange={e => setRosterTime(e.target.value)} required />
                    </div>
                    <button type="submit" className="btn btn-primary w-full">Save Assignment</button>
                  </form>
                </div>
              </div>
            </div>
          )}

          {/* SECTION: DONATIONS WASTE LOG */}
          {activeTab === 'sustainability' && (
            <div className="admin-tab-content active">
              <h3>🌍 Green Leftovers & Donation rescue Log</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '1.5rem', marginTop: '1.25rem' }}>
                {/* List table */}
                <div className="table-container">
                  <table className="crud-table">
                    <thead>
                      <tr>
                        <th>Food Item</th>
                        <th>Qty</th>
                        <th>Ngo Partner</th>
                        <th>Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {db.wasteLog.map(log => (
                        <tr key={log.id}>
                          <td><strong>{log.name}</strong></td>
                          <td>{log.qty} pcs</td>
                          <td>{log.destination}</td>
                          <td>{log.date}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Form */}
                <div className="glass-card" style={{ padding: '1.25rem' }}>
                  <h4 style={{ marginBottom: '1rem' }}>Log Surplus Donation</h4>
                  <form onSubmit={handleAddWasteLog}>
                    <div className="form-group">
                      <label>Ingredient / Surplus Food</label>
                      <input type="text" className="form-input" placeholder="Whole-wheat Buns" value={wasteName} onChange={e => setWasteName(e.target.value)} required />
                    </div>
                    <div className="form-group">
                      <label>Quantity</label>
                      <input type="number" className="form-input" value={wasteQty} onChange={e => setWasteQty(parseInt(e.target.value))} required />
                    </div>
                    <div className="form-group">
                      <label>NGO Destination</label>
                      <input type="text" className="form-input" placeholder="NGO Rescue Food" value={wasteNgo} onChange={e => setWasteNgo(e.target.value)} required />
                    </div>
                    <button type="submit" className="btn btn-primary w-full">Log Leftover Recovery</button>
                  </form>
                </div>
              </div>
            </div>
          )}

          {/* SECTION: COUPONS */}
          {activeTab === 'coupons' && (
            <div className="admin-tab-content active">
              <h3>🎫 Active Coupon Campaigns</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '1.5rem', marginTop: '1.25rem' }}>
                {/* List table */}
                <div className="table-container">
                  <table className="crud-table">
                    <thead>
                      <tr>
                        <th>Promo Code</th>
                        <th>Discount</th>
                        <th>Campaign</th>
                      </tr>
                    </thead>
                    <tbody>
                      {db.coupons.map(coupon => (
                        <tr key={coupon.code}>
                          <td><strong>{coupon.code}</strong></td>
                          <td>{coupon.discount}% off</td>
                          <td>{coupon.type}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Form */}
                <div className="glass-card" style={{ padding: '1.25rem' }}>
                  <h4 style={{ marginBottom: '1rem' }}>Create Promo Code</h4>
                  <form onSubmit={handleAddCoupon}>
                    <div className="form-group">
                      <label>Promo Code</label>
                      <input type="text" className="form-input" placeholder="e.g. FESTIVE30" value={couponCode} onChange={e => setCouponCode(e.target.value)} required />
                    </div>
                    <div className="form-group">
                      <label>Discount (%)</label>
                      <input type="number" className="form-input" min="5" max="90" value={couponDiscount} onChange={e => setCouponDiscount(parseInt(e.target.value))} required />
                    </div>
                    <div className="form-group">
                      <label>Campaign Details</label>
                      <input type="text" className="form-input" placeholder="e.g. Festival Offer" value={couponDesc} onChange={e => setCouponDesc(e.target.value)} required />
                    </div>
                    <button type="submit" className="btn btn-primary w-full">Save Coupon</button>
                  </form>
                </div>
              </div>
            </div>
          )}

          {/* SECTION: AUDIT LOGS */}
          {activeTab === 'audit-logs' && (
            <div className="admin-tab-content active">
              <h3>📜 System Audit Logs</h3>
              <p className="section-desc">Real-time database actions trace.</p>
              <div className="table-container" style={{ marginTop: '1.25rem', maxHeight: '400px', overflowY: 'auto' }}>
                <table className="crud-table" style={{ fontSize: '0.8rem' }}>
                  <thead>
                    <tr>
                      <th>Timestamp</th>
                      <th>User</th>
                      <th>Event</th>
                      <th>Details</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...db.auditLogs].reverse().map((log, idx) => (
                      <tr key={idx}>
                        <td><span style={{ color: 'var(--text-muted)' }}>{new Date(log.timestamp).toLocaleString()}</span></td>
                        <td><strong>{log.user}</strong></td>
                        <td><span className="badge badge-info" style={{ fontSize: '0.65rem' }}>{log.event}</span></td>
                        <td>{log.details}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* SECTION: STAFF PERMISSIONS */}
          {activeTab === 'permissions' && (
            <div className="admin-tab-content active">
              <h3>🔒 Staff Dashboard Permissions</h3>
              <p className="section-desc">Manage staff access controls for sensitive business indicators (e.g. Sales Revenue Analytics).</p>
              
              <div className="glass-card" style={{ padding: '1.5rem', marginTop: '1.25rem' }}>
                <h4 style={{ marginBottom: '1rem', color: '#fff' }}>Active Request Queue</h4>
                
                {localStorage.getItem('staff_revenue_request') === 'requested' ? (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(245, 158, 11, 0.1)', border: '1px solid var(--color-warning)', padding: '1rem', borderRadius: '12px' }}>
                    <div>
                      <strong>👤 Staff Member (Counter Terminal)</strong>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Requested access to view: <strong>Total Sales Revenue & KPIs</strong></div>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button className="btn btn-primary btn-sm" onClick={() => {
                        localStorage.setItem('staff_revenue_request', 'approved');
                        fetch('http://localhost:8080/api/orders').then(() => {});
                        alert('Granted access to Sales Revenue for Staff Counter Board!');
                        setActiveTab('permissions');
                      }}>Approve Access</button>
                      <button className="btn btn-secondary btn-sm" onClick={() => {
                        localStorage.setItem('staff_revenue_request', 'denied');
                        fetch('http://localhost:8080/api/orders').then(() => {});
                        alert('Denied permission request.');
                        setActiveTab('permissions');
                      }} style={{ color: 'var(--color-danger)' }}>Deny</button>
                    </div>
                  </div>
                ) : localStorage.getItem('staff_revenue_request') === 'approved' ? (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid var(--color-secondary)', padding: '1rem', borderRadius: '12px' }}>
                    <div>
                      <strong>👤 Staff Member (Counter Terminal)</strong>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Permission Status: <span style={{ color: 'var(--color-secondary)', fontWeight: 'bold' }}>APPROVED</span></div>
                    </div>
                    <button className="btn btn-secondary btn-sm" onClick={() => {
                      localStorage.setItem('staff_revenue_request', 'denied');
                      fetch('http://localhost:8080/api/orders').then(() => {});
                      alert('Revoked access for Staff.');
                      setActiveTab('permissions');
                    }} style={{ color: 'var(--color-danger)' }}>Revoke Access</button>
                  </div>
                ) : (
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No active staff permission requests. When a staff member requests revenue access, it will appear here for validation.</p>
                )}
              </div>
            </div>
          )}

          {/* SECTION: FEEDBACK REVIEWS */}
          {activeTab === 'feedbacks' && (
            <div className="admin-tab-content active">
              <h3>💬 Student Feedback Log</h3>
              <p className="section-desc">Trace ratings and dining comments shared by campus students in real-time.</p>
              
              <div className="table-container" style={{ marginTop: '1.25rem' }}>
                <table className="crud-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Student</th>
                      <th>Rating</th>
                      <th>Feedback Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    {JSON.parse(localStorage.getItem('student_feedbacks') || '[]').length === 0 ? (
                      <tr>
                        <td colSpan="4" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No feedback reviews logged in system database yet.</td>
                      </tr>
                    ) : (
                      [...JSON.parse(localStorage.getItem('student_feedbacks') || '[]')].reverse().map(fb => (
                        <tr key={fb.id}>
                          <td><span style={{ color: 'var(--text-muted)' }}>{fb.date}</span></td>
                          <td><strong>{fb.studentName}</strong></td>
                          <td style={{ color: 'var(--color-warning)', fontWeight: 'bold' }}>{'★'.repeat(fb.rating)}</td>
                          <td>{fb.comment}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </main>
      </div>

      {/* CRUD Food Modal */}
      {showFoodModal && (
        <div className="dialog-overlay" style={{ display: 'flex', zIndex: 10000 }}>
          <div className="dialog-content glass-card" style={{ width: '540px', padding: '2rem' }}>
            <div className="dialog-header" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <h3>{foodEditId ? 'Edit Food Item' : 'Add Food Item'}</h3>
              <button className="dialog-close" onClick={() => setShowFoodModal(false)}>×</button>
            </div>
            <form onSubmit={handleSaveFood}>
              <div className="form-group">
                <label>Food Name</label>
                <input type="text" className="form-input" value={foodName} onChange={e => setFoodName(e.target.value)} required />
              </div>
              <div className="grid-cols-2" style={{ gap: '1rem' }}>
                <div className="form-group">
                  <label>Category</label>
                  <select className="form-input" value={foodCategory} onChange={e => setFoodCategory(e.target.value)}>
                    {db.categories.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Price (₹)</label>
                  <input type="number" step="0.01" min="0.50" className="form-input" value={foodPrice} onChange={e => setFoodPrice(parseFloat(e.target.value))} required />
                </div>
              </div>

              <div className="grid-cols-2" style={{ gap: '1rem' }}>
                <div className="form-group">
                  <label>Cooking Time (mins)</label>
                  <input type="number" min="1" className="form-input" value={foodCookTime} onChange={e => setFoodCookTime(parseInt(e.target.value))} required />
                </div>
                <div className="form-group">
                  <label>Carbon Footprint (kg CO₂)</label>
                  <input type="number" step="0.05" min="0.05" className="form-input" value={foodCarbon} onChange={e => setFoodCarbon(parseFloat(e.target.value))} required />
                </div>
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea className="form-input" rows="2" value={foodDesc} onChange={e => setFoodDesc(e.target.value)} required></textarea>
              </div>

              <div className="grid-cols-2" style={{ gap: '1rem', alignItems: 'center', marginBottom: '1.5rem' }}>
                <label className="radio-label">
                  <input type="checkbox" checked={foodIsEco} onChange={e => setFoodIsEco(e.target.checked)} /> Green Eco-Meal 🌱
                </label>
                <label className="radio-label">
                  <input type="checkbox" checked={foodIsJain} onChange={e => setFoodIsJain(e.target.checked)} /> Jain Food Friendly
                </label>
              </div>

              <button type="submit" className="btn btn-primary w-full">Save Food Item</button>
            </form>
          </div>
        </div>
      )}

      {/* Admin Profile Modal */}
      {showProfileModal && (
        <div className="dialog-overlay" style={{ display: 'flex', zIndex: 10000 }}>
          <div className="dialog-content glass-card animate-scale-in" style={{ width: '420px', padding: '2rem', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.08)' }}>
            <div className="dialog-header" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', alignItems: 'center' }}>
              <h3 style={{ fontSize: '1.25rem', color: '#fff' }}>👤 Administrator Profile</h3>
              <button className="dialog-close" onClick={() => setShowProfileModal(false)}>×</button>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '1.5rem' }}>
              <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(255,255,255,0.02)', border: '2px solid var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3rem' }}>
                💼
              </div>
              <div style={{ textAlign: 'center' }}>
                <h4 style={{ fontSize: '1.15rem', color: '#fff' }}>{user.username}</h4>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{user.email}</p>
                <span className="badge badge-ready" style={{ fontSize: '0.65rem', marginTop: '0.5rem', display: 'inline-block' }}>System Administrator</span>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', fontSize: '0.85rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>🔒 Privilege Level:</span>
                <strong>Super Admin (Level 4 Clearance)</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>🛠️ Managed Outlets:</span>
                <strong>Main Campus Food Court</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>👥 Audited Users:</span>
                <strong>{db.allUsers.length} active users</strong>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
