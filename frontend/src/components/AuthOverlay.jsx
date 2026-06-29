import React, { useState, useEffect, useRef } from 'react';
import { loginUser, registerUser } from '../state/api.js';

export default function AuthOverlay({ allowedRoles, onSuccess, title }) {
  const [activeTab, setActiveTab] = useState('login'); // login, register, face, nfc
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Registration States
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPass, setRegPass] = useState('');
  const [regRole, setRegRole] = useState('student');
  const [showCodeModal, setShowCodeModal] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [actualCode] = useState('4826'); // hardcoded simulation code

  // Face Recognition simulation variables
  const canvasRef = useRef(null);
  const animationRef = useRef(null);

  // sound synthesis for NFC
  const playNFCSound = () => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.setValueAtTime(880, ctx.currentTime); // High pitch beep
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
      osc.start();
      osc.stop(ctx.currentTime + 0.15);
    } catch(e) {}
  };

  // Face ID animation loops
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
        // Priya Sharma default credentials
        const res = await loginUser('priya.sharma@campus.edu', 'priya123');
        if (res.success && allowedRoles.includes(res.user.role)) {
          onSuccess(res.user);
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
      if (allowedRoles.includes(res.user.role)) {
        onSuccess(res.user);
      } else {
        alert(`🚫 Access Denied: Authorized roles are: ${allowedRoles.join(', ')}`);
      }
    } else {
      alert(`❌ ${res.message}`);
    }
  };

  const handleNFCTap = async () => {
    playNFCSound();
    // Simulate smart card lookup: defaults to Priya Sharma if student role, or Staff if staff role
    const mockEmail = allowedRoles.includes('student') ? 'priya.sharma@campus.edu' : 'staff@campus.edu';
    const mockPass = allowedRoles.includes('student') ? 'priya123' : 'staff123';
    
    const res = await loginUser(mockEmail, mockPass);
    if (res.success && allowedRoles.includes(res.user.role)) {
      onSuccess(res.user);
    } else {
      alert('RFID Tapped Card rejected or unauthorized role permissions.');
    }
  };

  const handleRegisterSubmit = (e) => {
    e.preventDefault();
    setShowCodeModal(true);
    alert(`🔐 Simulation: Verification Code sent to email ${regEmail}. Code is: ${actualCode}`);
  };

  const handleVerifyCode = async (e) => {
    e.preventDefault();
    if (verificationCode === actualCode) {
      const res = await registerUser(regName, regEmail, regPass, regRole);
      if (res.success) {
        alert('🎉 Account successfully registered and verified!');
        setShowCodeModal(false);
        setActiveTab('login');
      } else {
        alert(`❌ Registration error: ${res.message}`);
      }
    } else {
      alert('❌ Invalid 4-digit code. Please enter: 4826');
    }
  };

  return (
    <div id="auth-overlay" className="auth-overlay" style={{ display: 'flex' }}>
      <div className="auth-card glass-card">
        <div className="auth-logo">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2L2 22H22L12 2Z" stroke="url(#logo-grad-auth)" strokeWidth="2" strokeLinejoin="round"/>
            <defs>
              <linearGradient id="logo-grad-auth" x1="2" y1="22" x2="22" y2="2">
                <stop stopColor="#ff7e47"/>
                <stop offset="1" stopColor="#10b981"/>
              </linearGradient>
            </defs>
          </svg>
          <span>{title || 'Terminal Access'}</span>
        </div>

        {/* Tab Selection */}
        {allowedRoles.includes('student') && (
          <div className="auth-tabs" style={{ display: 'flex', gap: '0.25rem', marginBottom: '1.25rem', background: 'rgba(255,255,255,0.02)', padding: '0.25rem', borderRadius: '8px' }}>
            <button className={`tab-btn w-full ${activeTab === 'login' ? 'active' : ''}`} onClick={() => setActiveTab('login')} style={{ padding: '0.4rem', fontSize: '0.75rem' }}>Password</button>
            <button className={`tab-btn w-full ${activeTab === 'face' ? 'active' : ''}`} onClick={() => setActiveTab('face')} style={{ padding: '0.4rem', fontSize: '0.75rem' }}>Face ID</button>
            <button className={`tab-btn w-full ${activeTab === 'nfc' ? 'active' : ''}`} onClick={() => setActiveTab('nfc')} style={{ padding: '0.4rem', fontSize: '0.75rem' }}>NFC Tap</button>
            <button className={`tab-btn w-full ${activeTab === 'register' ? 'active' : ''}`} onClick={() => setActiveTab('register')} style={{ padding: '0.4rem', fontSize: '0.75rem' }}>Register</button>
          </div>
        )}

        {/* VIEW: LOGIN */}
        {activeTab === 'login' && (
          <div className="auth-view active">
            <form onSubmit={handlePasswordLogin}>
              <div className="form-group">
                <label>Terminal Email</label>
                <input type="email" className="form-input" placeholder="e.g. priya.sharma@campus.edu, admin@campus.edu" value={email} onChange={e => setEmail(e.target.value)} required />
              </div>
              <div className="form-group">
                <label>Password</label>
                <input type="password" className="form-input" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required />
              </div>
              <button type="submit" className="btn btn-primary w-full">Authenticate ➔</button>
            </form>
          </div>
        )}

        {/* VIEW: FACE SCANNER */}
        {activeTab === 'face' && (
          <div className="auth-view active" style={{ textAlign: 'center' }}>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>Align face with terminal camera guide...</p>
            <canvas ref={canvasRef} width="220" height="180" style={{ background: '#131b26', borderRadius: '12px', border: '1px solid var(--glass-border)', display: 'block', margin: '0 auto 1rem' }}></canvas>
            <span className="badge badge-preparing animate-pulse-glow">SIMULATING BIO-SCANNER</span>
          </div>
        )}

        {/* VIEW: NFC READER */}
        {activeTab === 'nfc' && (
          <div className="auth-view active" style={{ textAlign: 'center' }}>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>Place your student ID card close to screen scanner</p>
            <div className="rfid-tap-area" onClick={handleNFCTap} style={{ width: '100%', height: '140px', background: 'rgba(255, 255, 255, 0.02)', border: '2px dashed var(--color-primary)', borderRadius: '12px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
              <span style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>📡</span>
              <strong style={{ fontSize: '0.85rem', color: 'var(--color-primary)' }}>CLICK SCREEN TO MOCK NFC TAP</strong>
            </div>
          </div>
        )}

        {/* VIEW: REGISTER */}
        {activeTab === 'register' && (
          <div className="auth-view active">
            <form onSubmit={handleRegisterSubmit}>
              <div className="form-group">
                <label>Full Name</label>
                <input type="text" className="form-input" placeholder="Priya Sharma" value={regName} onChange={e => setRegName(e.target.value)} required />
              </div>
              <div className="form-group">
                <label>Email Address</label>
                <input type="email" className="form-input" placeholder="priya.sharma@campus.edu" value={regEmail} onChange={e => setRegEmail(e.target.value)} required />
              </div>
              <div className="form-group">
                <label>Password</label>
                <input type="password" className="form-input" placeholder="••••••••" value={regPass} onChange={e => setRegPass(e.target.value)} required />
              </div>
              <div className="form-group">
                <label>Role</label>
                <select className="form-input" value={regRole} onChange={e => setRegRole(e.target.value)}>
                  <option value="student">Student</option>
                  <option value="staff">Chef / Counter Staff</option>
                  <option value="cashier">POS Cashier</option>
                  <option value="admin">Administrator</option>
                </select>
              </div>
              <button type="submit" className="btn btn-primary w-full">Request Email Code ➔</button>
            </form>
          </div>
        )}

        {/* Modal: Verification Code */}
        {showCodeModal && (
          <div className="dialog-overlay" style={{ display: 'flex', zIndex: 10000 }}>
            <div className="dialog-content glass-card" style={{ width: '320px', padding: '1.5rem' }}>
              <h4 style={{ marginBottom: '0.75rem', color: 'var(--text-primary)' }}>Enter 4-Digit Verification Code</h4>
              <form onSubmit={handleVerifyCode}>
                <div className="form-group">
                  <input type="text" className="form-input" maxLength="4" placeholder="e.g. 4826" style={{ textAlign: 'center', fontSize: '1.25rem', letterSpacing: '8px' }} value={verificationCode} onChange={e => setVerificationCode(e.target.value)} required />
                </div>
                <button type="submit" className="btn btn-primary w-full">Verify & Register</button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
