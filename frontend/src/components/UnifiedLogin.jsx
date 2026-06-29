import React, { useState, useEffect, useRef } from 'react';
import { loginUser, registerUser } from '../state/api.js';

export default function UnifiedLogin({ onLoginSuccess, onViewDisplay }) {
  const [activeTab, setActiveTab] = useState('login'); // login, face, nfc, register
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Registration States
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPass, setRegPass] = useState('');
  const [regRole, setRegRole] = useState('student');
  const [showCodeModal, setShowCodeModal] = useState(false);
  const [isStaffReg, setIsStaffReg] = useState(false);
  const [staffKey, setStaffKey] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [actualCode, setActualCode] = useState(''); // generated dynamically per user

  // Face Recognition simulation variables
  const canvasRef = useRef(null);
  const animationRef = useRef(null);

  // Sound synthesis for simulated RFID taps
  const playNFCSound = () => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
      osc.start();
      osc.stop(ctx.currentTime + 0.15);
    } catch(e) {}
  };

  // Face Scan Guide Animation Loop
  useEffect(() => {
    if (activeTab === 'face') {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      let tick = 0;

      const drawMesh = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Circular Face Guide
        ctx.strokeStyle = 'rgba(16, 185, 129, 0.4)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(canvas.width / 2, canvas.height / 2, 70, 0, Math.PI * 2);
        ctx.stroke();

        // Pulsing Scan Laser Line
        const y = (canvas.height / 2) + Math.sin(tick * 0.05) * 70;
        ctx.strokeStyle = '#10b981';
        ctx.shadowBlur = 8;
        ctx.shadowColor = '#10b981';
        ctx.beginPath();
        ctx.moveTo(canvas.width / 2 - 60, y);
        ctx.lineTo(canvas.width / 2 + 60, y);
        ctx.stroke();
        ctx.shadowBlur = 0; // reset

        // Mock Node dots inside guide
        ctx.fillStyle = '#ff7e47';
        for (let i = 0; i < 5; i++) {
          const angle = (tick * 0.02 + i * (Math.PI / 2.5));
          const dx = canvas.width / 2 + Math.cos(angle) * 50;
          const dy = canvas.height / 2 + Math.sin(angle) * 50;
          ctx.beginPath();
          ctx.arc(dx, dy, 3, 0, Math.PI * 2);
          ctx.fill();
        }

        tick++;
        animationRef.current = requestAnimationFrame(drawMesh);
      };
      
      drawMesh();
      
      // Auto-trigger Face Login simulation after 3.5 seconds
      const timer = setTimeout(async () => {
        const res = await loginUser('priya.sharma@campus.edu', 'priya123');
        if (res.success) {
          onLoginSuccess(res.user);
        } else {
          alert('Biometrics failed. Redirecting to standard credentials login.');
          setActiveTab('login');
        }
      }, 3500);

      return () => {
        cancelAnimationFrame(animationRef.current);
        clearTimeout(timer);
      };
    }
  }, [activeTab]);

  const handlePasswordLogin = async (e) => {
    e.preventDefault();
    const res = await loginUser(email, password);
    if (res.success) {
      onLoginSuccess(res.user);
    } else {
      alert(`❌ ${res.message}`);
    }
  };

  const handleNFCTap = async () => {
    playNFCSound();
    // Simulate smart card lookup: defaults to student Priya
    const res = await loginUser('priya.sharma@campus.edu', 'priya123');
    if (res.success) {
      onLoginSuccess(res.user);
    } else {
      alert('RFID Tapped Card rejected.');
    }
  };

  const handleRegisterSubmit = (e) => {
    e.preventDefault();
    if (isStaffReg && staffKey !== 'campus_staff_2026') {
      alert('❌ Invalid staff security passkey. Please verify or register as a student.');
      return;
    }
    const generatedOtp = Math.floor(1000 + Math.random() * 9000).toString();
    setActualCode(generatedOtp);
    setShowCodeModal(true);
    alert(`💡 [SIMULATED OTP] Verification Code sent to ${regEmail}.\n\n🔑 Enter Code: ${generatedOtp}`);
  };

  const handleVerifyCode = async (e) => {
    e.preventDefault();
    if (verificationCode === actualCode) {
      const res = await registerUser(regName, regEmail, regPass, regRole);
      if (res.success) {
        alert('🎉 Account successfully registered and verified! Logging in...');
        setShowCodeModal(false);
        onLoginSuccess(res.user);
      } else {
        alert(`❌ Registration error: ${res.message}`);
      }
    } else {
      alert('❌ Invalid 4-digit code. Please enter: 4826');
    }
  };

  const handleQuickLogin = async (mockEmail, mockPass) => {
    const res = await loginUser(mockEmail, mockPass);
    if (res.success) {
      onLoginSuccess(res.user);
    } else {
      alert('Quick Login failed.');
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'radial-gradient(circle at top right, var(--color-primary-glow, rgba(255,126,71,0.08)) 0%, #070a13 75%)',
      color: '#fff',
      padding: '2rem',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Decorative background glows */}
      <div style={{ position: 'absolute', top: '-10%', right: '-10%', width: '40vw', height: '40vw', background: 'radial-gradient(circle, var(--color-primary-glow, rgba(255, 126, 71, 0.08)) 0%, transparent 70%)', pointerEvents: 'none' }}></div>
      <div style={{ position: 'absolute', bottom: '-15%', left: '-10%', width: '50vw', height: '50vw', background: 'radial-gradient(circle, var(--color-secondary-glow, rgba(16, 185, 129, 0.06)) 0%, transparent 70%)', pointerEvents: 'none' }}></div>

      {/* Main Glass Login Card */}
      <div className="glass-card animate-fade-in" style={{
        maxWidth: '460px',
        width: '100%',
        padding: '2.5rem',
        borderRadius: '24px',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        boxShadow: '0 20px 50px rgba(0, 0, 0, 0.3)',
        backdropFilter: 'blur(20px)',
        zIndex: 5
      }}>
        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: '0.85rem', borderRadius: '16px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', marginBottom: '1rem' }}>
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L2 22H22L12 2Z" stroke="url(#logo-grad-auth)" strokeWidth="2.5" strokeLinejoin="round"/>
              <defs>
                <linearGradient id="logo-grad-auth" x1="2" y1="22" x2="22" y2="2">
                  <stop stopColor="#ff7e47"/>
                  <stop offset="1" stopColor="#10b981"/>
                </linearGradient>
              </defs>
            </svg>
          </div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: '800', tracking: '-0.025em', background: 'linear-gradient(to right, #fff, #9ca3af)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Campus Food Court
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '0.25rem' }}>Secure Multi-Role Access Terminal</p>
        </div>

        {/* Tab Switcher */}
        <div style={{
          display: 'flex',
          background: 'rgba(0,0,0,0.2)',
          padding: '0.3rem',
          borderRadius: '12px',
          border: '1px solid rgba(255,255,255,0.05)',
          marginBottom: '1.5rem',
          gap: '0.2rem'
        }}>
          <button
            className={`tab-btn w-full ${activeTab === 'login' ? 'active' : ''}`}
            onClick={() => setActiveTab('login')}
            style={{ padding: '0.5rem 0.25rem', fontSize: '0.75rem', fontWeight: '600' }}
          >
            Password
          </button>
          <button
            className={`tab-btn w-full ${activeTab === 'register' ? 'active' : ''}`}
            onClick={() => setActiveTab('register')}
            style={{ padding: '0.5rem 0.25rem', fontSize: '0.75rem', fontWeight: '600' }}
          >
            Register
          </button>
        </div>

        {/* Form Views */}
        {activeTab === 'login' && (
          <form onSubmit={handlePasswordLogin} className="animate-fade-in">
            <div className="form-group">
              <label style={{ fontSize: '0.75rem', textTransform: 'uppercase', tracking: '0.05em', color: 'var(--text-secondary)' }}>Account Email</label>
              <input
                type="email"
                className="form-input"
                placeholder="name@campus.edu"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                style={{ background: 'rgba(0,0,0,0.15)', borderColor: 'rgba(255,255,255,0.08)' }}
              />
            </div>
            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
              <label style={{ fontSize: '0.75rem', textTransform: 'uppercase', tracking: '0.05em', color: 'var(--text-secondary)' }}>Password</label>
              <input
                type="password"
                className="form-input"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                style={{ background: 'rgba(0,0,0,0.15)', borderColor: 'rgba(255,255,255,0.08)' }}
              />
            </div>
            <button type="submit" className="btn btn-primary w-full" style={{ padding: '0.75rem', borderRadius: '12px' }}>
              Login to Workspace ➔
            </button>
          </form>
        )}

        {activeTab === 'register' && (
          <form onSubmit={handleRegisterSubmit} className="animate-fade-in">
            <div className="form-group">
              <label style={{ fontSize: '0.75rem', textTransform: 'uppercase', tracking: '0.05em', color: 'var(--text-secondary)' }}>Full Name</label>
              <input
                type="text"
                className="form-input"
                placeholder="Enter full name"
                value={regName}
                onChange={e => setRegName(e.target.value)}
                required
                style={{ background: 'rgba(0,0,0,0.15)' }}
              />
            </div>
            <div className="form-group">
              <label style={{ fontSize: '0.75rem', textTransform: 'uppercase', tracking: '0.05em', color: 'var(--text-secondary)' }}>Email Address</label>
              <input
                type="email"
                className="form-input"
                placeholder="name@campus.edu"
                value={regEmail}
                onChange={e => setRegEmail(e.target.value)}
                required
                style={{ background: 'rgba(0,0,0,0.15)' }}
              />
            </div>
            <div className="form-group">
              <label style={{ fontSize: '0.75rem', textTransform: 'uppercase', tracking: '0.05em', color: 'var(--text-secondary)' }}>Password</label>
              <input
                type="password"
                className="form-input"
                placeholder="••••••••"
                value={regPass}
                onChange={e => setRegPass(e.target.value)}
                required
                style={{ background: 'rgba(0,0,0,0.15)' }}
              />
            </div>
            {/* Staff/Admin Secure Option Toggle */}
            <div className="form-group" style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <input 
                type="checkbox" 
                id="isStaffReg"
                checked={isStaffReg} 
                onChange={e => {
                  setIsStaffReg(e.target.checked);
                  if (e.target.checked) {
                    setRegRole('staff');
                  } else {
                    setRegRole('student');
                  }
                }} 
              />
              <label htmlFor="isStaffReg" style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', cursor: 'pointer', margin: 0 }}>
                🔑 Staff / Administrator registration
              </label>
            </div>

            {isStaffReg && (
              <div className="animate-scale-in" style={{ background: 'rgba(0,0,0,0.15)', padding: '0.85rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)', marginBottom: '1rem' }}>
                <div className="form-group">
                  <label style={{ fontSize: '0.7rem', textTransform: 'uppercase', tracking: '0.05em', color: 'var(--color-primary)' }}>Staff Security Passkey</label>
                  <input
                    type="password"
                    className="form-input"
                    placeholder="Enter passkey (e.g. campus_staff_2026)"
                    value={staffKey}
                    onChange={e => setStaffKey(e.target.value)}
                    required={isStaffReg}
                    style={{ background: 'rgba(0,0,0,0.2)', marginBottom: '0.5rem' }}
                  />
                  <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>* Normal student accounts do not require this. Simulation key: <code>campus_staff_2026</code></span>
                </div>

                {staffKey === 'campus_staff_2026' ? (
                  <div className="form-group animate-fade-in" style={{ marginBottom: 0 }}>
                    <label style={{ fontSize: '0.7rem', textTransform: 'uppercase', tracking: '0.05em', color: 'var(--color-secondary)' }}>Authorized Account Role</label>
                    <select
                      className="form-input"
                      value={regRole}
                      onChange={e => setRegRole(e.target.value)}
                      style={{ background: 'rgba(0,0,0,0.2)', color: '#fff', marginBottom: 0 }}
                    >
                      <option value="staff">Chef / Counter Staff</option>
                      <option value="cashier">POS Cashier</option>
                      <option value="admin">Administrator</option>
                    </select>
                  </div>
                ) : staffKey.length > 0 && (
                  <div style={{ fontSize: '0.7rem', color: 'var(--color-danger)' }}>❌ Invalid security passkey. Selection locked.</div>
                )}
              </div>
            )}
            <button type="submit" className="btn btn-primary w-full" style={{ padding: '0.75rem', borderRadius: '12px' }}>
              Send OTP Code ➔
            </button>
          </form>
        )}
      </div>

      {/* Bottom utility links: lounge and demo bypass */}
      <div style={{
        marginTop: '2rem',
        textAlign: 'center',
        zIndex: 5,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '0.75rem'
      }}>
        {/* Waiting Lounge Display Monitor */}
        <button
          onClick={onViewDisplay}
          style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.08)',
            padding: '0.5rem 1rem',
            borderRadius: '12px',
            color: '#a855f7',
            fontSize: '0.8rem',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.2s',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
            e.currentTarget.style.borderColor = '#a855f7';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
          }}
        >
          📲 Launch Public Queue Display Monitor
        </button>

      </div>

      {/* Modal: Verification Code (Simulation Registration) */}
      {showCodeModal && (
        <div className="dialog-overlay" style={{ display: 'flex', zIndex: 10000 }}>
          <div className="dialog-content glass-card animate-scale-in" style={{ width: '320px', padding: '2rem', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.1)' }}>
            <h4 style={{ marginBottom: '0.5rem', color: '#fff', fontSize: '1rem', fontWeight: 'bold' }}>OTP Verification</h4>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>Enter the 4-digit code simulated in prompt.</p>
            <form onSubmit={handleVerifyCode}>
              <div className="form-group">
                <input
                  type="text"
                  className="form-input"
                  maxLength="4"
                  placeholder="e.g. 4826"
                  style={{ textAlign: 'center', fontSize: '1.5rem', fontWeight: '800', letterSpacing: '8px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)' }}
                  value={verificationCode}
                  onChange={e => setVerificationCode(e.target.value)}
                  required
                />
              </div>
              <button type="submit" className="btn btn-primary w-full" style={{ padding: '0.6rem', borderRadius: '10px' }}>
                Verify & Create Account
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
