import React, { useEffect, useRef, useState } from 'react';

export default function LoungeDisplay({ db, onBackToLogin }) {
  const previousReadyTokens = useRef([]);
  const [isDark, setIsDark] = useState(true);

  // TTS Voice Announcer
  const speakTokenAnnouncement = (token) => {
    try {
      // Play brief digital chime bell
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5 note
      osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.1); // E5 note
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
      osc.start();
      osc.stop(ctx.currentTime + 0.3);
      
      // Delay speech slightly to let chime play
      setTimeout(() => {
        const text = `Order Token ${token.split('').join(' ')}, is ready for collection at counter 1.`;
        const utterance = new SpeechSynthesisUtterance(text);
        
        // Find a premium English voice if available
        const voices = window.speechSynthesis.getVoices();
        const enVoice = voices.find(v => v.lang.startsWith('en') && v.name.includes('Google'));
        if (enVoice) utterance.voice = enVoice;
        
        utterance.rate = 0.95;
        window.speechSynthesis.speak(utterance);
      }, 350);
    } catch(e) {}
  };

  // Monitor for newly added Ready orders
  useEffect(() => {
    const readyOrders = db.orders.filter(o => o.status === 'Ready');
    const currentTokens = readyOrders.map(o => o.token);

    // Find if any new token is in currentTokens that was not in previous
    currentTokens.forEach(t => {
      if (!previousReadyTokens.current.includes(t)) {
        speakTokenAnnouncement(t);
      }
    });

    previousReadyTokens.current = currentTokens;
  }, [db.orders]);

  const servingList = db.orders.filter(o => o.status === 'Ready');
  const preparingList = db.orders.filter(o => o.status === 'Preparing' || o.status === 'Pending');

  return (
    <div style={{ background: isDark ? '#0a0e17' : '#f3f4f6', color: isDark ? '#fff' : '#111827', minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', transition: 'all 0.3s' }}>
      
      {/* Header */}
      <header className="top-nav" style={{ background: isDark ? 'rgba(10,14,23,0.9)' : 'rgba(255,255,255,0.95)', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div className="logo" style={{ fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: isDark ? '#fff' : '#111827' }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2L2 22H22L12 2Z" stroke="url(#logo-grad)" strokeWidth="2" strokeLinejoin="round"/>
          </svg>
          Smart Food Court <span style={{ fontSize: '0.8rem', padding: '0.2rem 0.5rem', background: 'rgba(0,0,0,0.1)', color: isDark ? 'rgba(255,255,255,0.7)' : '#333', borderRadius: '4px' }}>Lounge Board</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <button onClick={() => setIsDark(!isDark)} style={{ background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)', border: '1px solid rgba(128,128,128,0.2)', color: isDark ? '#fff' : '#111827', cursor: 'pointer', padding: '0.4rem 0.8rem', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 'bold' }} title="Toggle Light/Dark Display Mode">
            {isDark ? '☀️ Light Mode' : '🌙 Dark Mode'}
          </button>
          <div style={{ fontSize: '0.9rem', color: '#10b981', fontWeight: 'bold' }}>● WebSockets Synchronized</div>
          {onBackToLogin && (
            <button className="btn btn-secondary btn-sm" onClick={onBackToLogin} style={{ padding: '0.3rem 0.75rem', borderRadius: '8px', fontSize: '0.8rem', borderColor: 'rgba(128,128,128,0.2)', color: isDark ? '#fff' : '#333' }}>Exit Monitor</button>
          )}
        </div>
      </header>

      {/* Main Boards */}
      <main className="container" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginTop: '2rem', flexGrow: 1, marginBottom: '2rem' }}>
        
        {/* Column 1: Now Serving */}
        <section className="glass-card" style={{ padding: '2rem', border: '2px solid rgba(16,185,129,0.3)', background: isDark ? 'rgba(16,185,129,0.02)' : '#fff', textAlign: 'center', display: 'flex', flexDirection: 'column', color: isDark ? '#fff' : '#111827' }}>
          <h2 style={{ fontSize: '1.75rem', color: 'var(--color-secondary)', textTransform: 'uppercase', letterSpacing: '2px', borderBottom: '2px solid rgba(16,185,129,0.15)', paddingBottom: '0.75rem', marginBottom: '1.5rem' }}>📢 NOW SERVING</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '1.25rem', overflowY: 'auto', flexGrow: 1, maxHeight: '420px' }}>
            {servingList.map(order => (
              <div key={order.id} className="animate-pulse-glow" style={{ background: '#10b981', color: '#0a0e17', fontSize: '2.5rem', fontWeight: '900', padding: '1rem', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 15px rgba(16,185,129,0.4)', height: '80px' }}>
                {order.token}
              </div>
            ))}
            {servingList.length === 0 && (
              <div style={{ gridColumn: '1 / -1', alignSelf: 'center', color: 'var(--text-muted)', fontSize: '1.25rem', marginTop: '3rem' }}>Tray collection desk is currently empty.</div>
            )}
          </div>
        </section>

        {/* Column 2: Preparing */}
        <section className="glass-card" style={{ padding: '2rem', border: '1px solid rgba(128,128,128,0.15)', background: isDark ? 'rgba(255,255,255,0.01)' : '#fff', textAlign: 'center', display: 'flex', flexDirection: 'column', color: isDark ? '#fff' : '#111827' }}>
          <h2 style={{ fontSize: '1.75rem', color: 'var(--color-primary)', textTransform: 'uppercase', letterSpacing: '2px', borderBottom: '2px solid rgba(128,128,128,0.15)', paddingBottom: '0.75rem', marginBottom: '1.5rem' }}>⏳ IN PREPARATION</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '1.25rem', overflowY: 'auto', flexGrow: 1, maxHeight: '420px' }}>
            {preparingList.map(order => (
              <div key={order.id} style={{ background: isDark ? 'rgba(255, 255, 255, 0.03)' : '#f9fafb', border: '1px solid rgba(128,128,128,0.15)', color: 'var(--color-primary)', fontSize: '2.25rem', fontWeight: '800', padding: '1rem', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '80px' }}>
                {order.token}
              </div>
            ))}
            {preparingList.length === 0 && (
              <div style={{ gridColumn: '1 / -1', alignSelf: 'center', color: 'var(--text-muted)', fontSize: '1.25rem', marginTop: '3rem' }}>All orders processed! No queue.</div>
            )}
          </div>
        </section>

      </main>

      {/* Lounger Ticker Message Banner */}
      <footer style={{ background: '#111', borderTop: '1px solid rgba(255,255,255,0.05)', padding: '0.75rem 0', overflow: 'hidden', whiteSpace: 'nowrap' }}>
        <div style={{ display: 'inline-block', animation: 'marquee 25s linear infinite', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
          ✨ Welcome to the Smart Campus Food Court! | 🌱 Order Green eco-meals to claim +15 loyalty points and save carbon. | 📦 Counter delivery is now fully automated. | ⚠️ NOTICE: Chef shifts are actively monitored. Please collect meals promptly when token calls. | ✨ Welcome to the Smart Campus Food Court!
        </div>
        <style dangerouslySetInnerHTML={{__html: `
          @keyframes marquee {
            0% { transform: translateX(100%); }
            100% { transform: translateX(-100%); }
          }
        `}} />
      </footer>

    </div>
  );
}
