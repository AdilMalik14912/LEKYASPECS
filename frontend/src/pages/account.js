const React = require('react');
const { useState, useEffect, useRef } = React;
const Link = require('next/link').default;
const { useRouter } = require('next/router');
const { useAuth, useToast } = require('./_app');
const { User, Mail, Calendar, Eye, ShoppingBag, Landmark, ArrowRight, Star, RefreshCw, PackageCheck, Truck, Package, CheckCircle2, XCircle, Edit2, Save, X, Copy, Award, Gift, Phone, Key } = require('lucide-react');

const API_BASE = typeof window !== 'undefined'
  ? (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' ? 'http://localhost:5000' : '')
  : '';

// Count-up hook: animates a number from 0 to target over duration ms
function useCountUp(target, duration = 1200) {
  const [count, setCount] = useState(0);
  const started = useRef(false);
  useEffect(() => {
    if (target <= 0 || started.current) return;
    started.current = true;
    const steps = 40;
    const step = target / steps;
    let current = 0;
    const interval = setInterval(() => {
      current += step;
      if (current >= target) {
        setCount(target);
        clearInterval(interval);
      } else {
        setCount(Math.floor(current));
      }
    }, duration / steps);
    return () => clearInterval(interval);
  }, [target, duration]);
  return count;
}

export default function Account() {
  const { user, token, login, logout, updateProfile } = useAuth();
  const { showToast } = useToast();
  const router = useRouter();

  // Handle URL errors (e.g. from Google or Facebook OAuth failure)
  useEffect(() => {
    if (!router.isReady) return;
    const { error } = router.query;
    if (error) {
      if (error === 'google_failed') {
        showToast('Google Sign-In failed. Please try again.', 'error');
      } else if (error === 'facebook_failed') {
        showToast('Facebook Sign-In failed. Please try again.', 'error');
      } else {
        showToast('Authentication failed. Please try again.', 'error');
      }
      // Remove the query parameters from the URL
      router.replace('/account', undefined, { shallow: true });
    }
  }, [router.isReady, router.query]);
  
  // Profile Edit states
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState('');
  const [copied, setCopied] = useState(false);

  const handleCopyLink = () => {
    if (!user) return;
    const link = `${window.location.origin}/account?ref=${user.referral_code || 'REF-USER'}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  useEffect(() => {
    if (user) {
      setEditedName(user.name);
    }
  }, [user]);

  const handleSaveName = async () => {
    if (!editedName.trim()) return;
    try {
      updateProfile({ name: editedName.trim() });
      setIsEditingName(false);
      showToast('Profile name updated successfully');
    } catch (err) {
      showToast('Failed to update name', 'error');
    }
  };

  // Tab states for auth
  const [isLoginTab, setIsLoginTab] = useState(true);

  // Form input states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [formError, setFormError] = useState('');
  const [formLoading, setFormLoading] = useState(false);
  const [registrationStep, setRegistrationStep] = useState(1); // 1 = details, 2 = verify OTP
  const [otpCode, setOtpCode] = useState('');
  const [otpTarget, setOtpTarget] = useState({ email: '', phone: '' });

  // Client-side Canvas Captcha (no backend needed)
  const [captchaCode, setCaptchaCode] = useState('');
  const [captchaInput, setCaptchaInput] = useState('');
  const [websiteVerify, setWebsiteVerify] = useState('');
  const captchaCanvasRef = React.useRef(null);

  const CAPTCHA_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const generateCaptchaCode = () => {
    let c = '';
    for (let i = 0; i < 5; i++) c += CAPTCHA_CHARS[Math.floor(Math.random() * CAPTCHA_CHARS.length)];
    return c;
  };

  const drawCaptcha = (code) => {
    if (typeof window === 'undefined') return;
    const canvas = captchaCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width, H = canvas.height;
    // Dark background
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, W, H);
    // Noise dots
    for (let i = 0; i < 40; i++) {
      ctx.beginPath();
      ctx.arc(Math.random()*W, Math.random()*H, Math.random()*2+0.5, 0, 2*Math.PI);
      ctx.fillStyle = `rgba(197,160,40,${(Math.random()*0.25+0.05).toFixed(2)})`;
      ctx.fill();
    }
    // Noise lines
    for (let i = 0; i < 5; i++) {
      ctx.beginPath();
      ctx.moveTo(Math.random()*W*0.3, Math.random()*H);
      ctx.lineTo(Math.random()*W*0.5+W*0.5, Math.random()*H);
      ctx.strokeStyle = `rgba(197,160,40,${(Math.random()*0.3+0.1).toFixed(2)})`;
      ctx.lineWidth = Math.random()*1.5+0.5;
      ctx.stroke();
    }
    // Draw each character
    const colors = ['#C5A028','#e8c547','#ffffff','#aaaaaa','#d4870c'];
    const cw = W / (code.length + 1);
    code.split('').forEach((ch, i) => {
      ctx.save();
      const x = cw*(i+0.7) + (Math.random()*6-3);
      const y = H/2 + 8 + (Math.random()*8-4);
      const angle = (Math.random()*30-15) * Math.PI/180;
      ctx.translate(x, y);
      ctx.rotate(angle);
      ctx.font = `bold ${Math.floor(Math.random()*6)+22}px 'Courier New',monospace`;
      ctx.fillStyle = colors[Math.floor(Math.random()*colors.length)];
      ctx.shadowColor = 'rgba(0,0,0,0.7)';
      ctx.shadowBlur = 4;
      ctx.fillText(ch, 0, 0);
      ctx.restore();
    });
  };

  const refreshCaptcha = () => {
    const code = generateCaptchaCode();
    setCaptchaCode(code);
    setCaptchaInput('');
    // Draw after state update
    setTimeout(() => drawCaptcha(code), 30);
  };

  useEffect(() => {
    if (!user && (isLoginTab || registrationStep === 1)) {
      refreshCaptcha();
    }
  }, [user, isLoginTab, registrationStep]);

  // Redraw when canvas ref is available
  useEffect(() => {
    if (captchaCode && captchaCanvasRef.current) drawCaptcha(captchaCode);
  }, [captchaCanvasRef.current]);

  // User Dashboard states
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);

  // Fetch Order History if logged in
  useEffect(() => {
    if (!token) return;
    
    setOrdersLoading(true);
    fetch(`${API_BASE}/api/orders/history`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
      .then(res => res.json())
      .then(data => {
        setOrders(data);
        setOrdersLoading(false);
      })
      .catch(err => {
        console.error('Error fetching orders:', err);
        setOrdersLoading(false);
      });
  }, [token]);

  // Handle Login / Registration
  const handleAuthSubmit = (e) => {
    e.preventDefault();
    setFormError('');
    setFormLoading(true);

    if (isLoginTab) {
      // Client-side captcha verification
      if (!captchaInput || captchaInput.trim().toUpperCase() !== captchaCode.toUpperCase()) {
        setFormLoading(false);
        setFormError('Incorrect security code. Please try again.');
        refreshCaptcha();
        return;
      }
      // Login flow: email field holds either email or phone
      fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email, 
          password, 
          website_verify: websiteVerify
        })
      })
        .then(res => res.json())
        .then(data => {
          setFormLoading(false);
          if (data.token) {
            login(data.token, data.user);
          } else {
            setFormError(data.message || 'Invalid credentials');
            refreshCaptcha();
          }
        })
        .catch(() => {
          setFormLoading(false);
          setFormError('Connection to server failed. Please try again.');
          refreshCaptcha();
        });
    } else {
      // Registration flow
      if (registrationStep === 1) {
        if (!email && !phone) {
          setFormLoading(false);
          setFormError('Either Email or Phone Number is required for registration.');
          return;
        }
        // Client-side captcha check for registration too
        if (!captchaInput || captchaInput.trim().toUpperCase() !== captchaCode.toUpperCase()) {
          setFormLoading(false);
          setFormError('Incorrect security code. Please try again.');
          refreshCaptcha();
          return;
        }

        fetch(`${API_BASE}/api/auth/register/initiate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            name, 
            email: email || '', 
            phone: phone || '', 
            password,
            website_verify: websiteVerify
          })
        })
          .then(res => {
            if (!res.ok) return res.json().then(d => { throw new Error(d.message || 'Initiation failed') });
            return res.json();
          })
          .then(data => {
            setFormLoading(false);
            setOtpTarget({ email: data.email || '', phone: data.phone || '' });
            setRegistrationStep(2);
          })
          .catch(err => {
            setFormLoading(false);
            setFormError(err.message);
            fetchCaptcha(); // Refresh captcha on error
          });
      } else {
        // OTP Verification step
        fetch(`${API_BASE}/api/auth/register/verify`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: otpTarget.email, phone: otpTarget.phone, otp: otpCode })
        })
          .then(res => {
            if (!res.ok) return res.json().then(d => { throw new Error(d.message || 'OTP verification failed') });
            return res.json();
          })
          .then(data => {
            setFormLoading(false);
            setRegistrationStep(1);
            setOtpCode('');
            login(data.token, data.user);
          })
          .catch(err => {
            setFormLoading(false);
            setFormError(err.message);
          });
      }
    }
  };

  // --- RENDERING: Logged Out (Auth Screen) ---
  if (!user) {
    return (
      <div className="bg-premium-light min-h-screen py-16 sm:py-24 flex items-center justify-center">
        <div className="max-w-md w-full mx-4 bg-white border border-premium-border rounded p-6 sm:p-10 shadow-sm">
          
          {/* Tab Selector */}
          <div className="flex border-b border-premium-border mb-8">
            <button
              onClick={() => { setIsLoginTab(true); setFormError(''); }}
              className={`flex-1 pb-4 text-sm font-semibold uppercase tracking-wider transition-all border-b-2 ${
                isLoginTab ? 'border-premium-accent text-premium-accent' : 'border-transparent text-premium-gray hover:text-premium-dark'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => { setIsLoginTab(false); setFormError(''); }}
              className={`flex-1 pb-4 text-sm font-semibold uppercase tracking-wider transition-all border-b-2 ${
                !isLoginTab ? 'border-premium-accent text-premium-accent' : 'border-transparent text-premium-gray hover:text-premium-dark'
              }`}
            >
              Register
            </button>
          </div>

          <h2 className="font-serif text-2xl font-bold text-premium-black text-center mb-6">
            {isLoginTab ? 'Welcome Back to Lekya Specs' : 'Create Premium Account'}
          </h2>

          <form onSubmit={handleAuthSubmit} className="space-y-4">
            {isLoginTab ? (
              // --- SIGN IN FORM ---
              <>
                <div>
                  <label className="block text-xs uppercase tracking-wider text-premium-gray font-semibold mb-2">Email Address or Phone Number</label>
                  <div className="relative">
                    <User className="absolute left-3 top-3.5 h-4 w-4 text-premium-gray" />
                    <input
                      type="text"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. mail@example.com or 9876543210"
                      className="w-full bg-premium-light text-sm border border-premium-border rounded pl-10 pr-3 py-3 focus:outline-none focus:border-premium-accent text-premium-dark font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider text-premium-gray font-semibold mb-2">Password</label>
                  <div className="relative">
                    <Eye className="absolute left-3 top-3.5 h-4 w-4 text-premium-gray" />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-premium-light text-sm border border-premium-border rounded pl-10 pr-3 py-3 focus:outline-none focus:border-premium-accent text-premium-dark font-medium"
                    />
                  </div>
                </div>
              </>
            ) : registrationStep === 1 ? (
              // --- REGISTRATION STEP 1: INPUT DETAILS ---
              <>
                <div>
                  <label className="block text-xs uppercase tracking-wider text-premium-gray font-semibold mb-2">Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-3.5 h-4 w-4 text-premium-gray" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Enter your name"
                      className="w-full bg-premium-light text-sm border border-premium-border rounded pl-10 pr-3 py-3 focus:outline-none focus:border-premium-accent text-premium-dark font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider text-premium-gray font-semibold mb-2">Email Address (Optional if Phone is set)</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3.5 h-4 w-4 text-premium-gray" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter email address"
                      className="w-full bg-premium-light text-sm border border-premium-border rounded pl-10 pr-3 py-3 focus:outline-none focus:border-premium-accent text-premium-dark font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider text-premium-gray font-semibold mb-2">Phone Number (Optional if Email is set)</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3.5 h-4 w-4 text-premium-gray" />
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="e.g. 9876543210"
                      className="w-full bg-premium-light text-sm border border-premium-border rounded pl-10 pr-3 py-3 focus:outline-none focus:border-premium-accent text-premium-dark font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider text-premium-gray font-semibold mb-2">Password</label>
                  <div className="relative">
                    <Eye className="absolute left-3 top-3.5 h-4 w-4 text-premium-gray" />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-premium-light text-sm border border-premium-border rounded pl-10 pr-3 py-3 focus:outline-none focus:border-premium-accent text-premium-dark font-medium"
                    />
                  </div>
                </div>
              </>
            ) : (
              // --- REGISTRATION STEP 2: OTP VERIFICATION ---
              <>
                <div className="bg-premium-light border border-premium-border rounded p-4 text-center space-y-2">
                  <p className="text-xs text-premium-dark font-medium">
                    We've sent a 6-digit OTP code to:
                  </p>
                  <strong className="text-xs text-premium-accent block font-mono">
                    {otpTarget.email && !otpTarget.email.startsWith('phone_') ? otpTarget.email : otpTarget.phone}
                  </strong>
                  <p className="text-[10px] text-premium-gray">
                    Please check your inbox (and spam folder) or messages to verify.
                  </p>
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider text-premium-gray font-semibold mb-2">Enter 6-Digit OTP</label>
                  <div className="relative">
                    <Key className="absolute left-3 top-3.5 h-4 w-4 text-premium-gray" />
                    <input
                      type="text"
                      required
                      maxLength="6"
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                      placeholder="e.g. 123456"
                      className="w-full bg-premium-light text-sm border border-premium-border rounded pl-10 pr-3 py-3 focus:outline-none focus:border-premium-accent text-premium-dark font-mono font-bold tracking-widest text-center"
                    />
                  </div>
                </div>
              </>
            )}
            {/* Honeypot field (hidden from view, bot trap) */}
            <div style={{ position: 'absolute', left: '-9999px', top: '-9999px', opacity: 0, zIndex: -1 }}>
              <input
                type="text"
                name="website_verify"
                value={websiteVerify}
                onChange={(e) => setWebsiteVerify(e.target.value)}
                tabIndex="-1"
                autoComplete="off"
                placeholder="Do not fill this"
              />
            </div>

            {/* Captcha Verification Widget */}
            {(isLoginTab || registrationStep === 1) && (
              <div className="space-y-2 bg-premium-light border border-premium-border rounded p-4 mb-4">
                <label className="block text-[10px] uppercase tracking-wider text-premium-accent font-bold">
                  Security Verification
                </label>
                <div className="flex flex-col sm:flex-row items-center gap-3">
                  <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-start">
                    <canvas
                      ref={captchaCanvasRef}
                      width={180}
                      height={60}
                      onClick={refreshCaptcha}
                      title="Click to refresh"
                      className="flex-shrink-0 cursor-pointer rounded"
                      style={{ border: '1px solid rgba(197,160,40,0.25)', borderRadius: 8 }}
                    />
                    <button
                      type="button"
                      onClick={refreshCaptcha}
                      className="p-3 border border-premium-border text-premium-accent hover:border-premium-accent rounded bg-white transition-colors flex items-center justify-center shrink-0"
                      title="Refresh Security Code"
                    >
                      <RefreshCw className="w-4 h-4" />
                    </button>
                  </div>
                  <input
                    type="text"
                    required
                    value={captchaInput}
                    onChange={(e) => setCaptchaInput(e.target.value.toUpperCase())}
                    placeholder="ENTER CODE"
                    className="w-full sm:flex-grow bg-white text-sm border border-premium-border rounded px-3 py-3 focus:outline-none focus:border-premium-accent text-premium-dark font-mono font-bold uppercase text-center tracking-widest"
                    maxLength="5"
                    autoComplete="off"
                  />
                </div>
                <p className="text-[9px] text-premium-gray font-light">
                  Type the 5 characters shown above (uppercase letters &amp; digits only — case insensitive).
                </p>

              </div>
            )}

            {formError && (
              <div className="text-red-600 text-xs font-semibold p-3 bg-red-50 rounded border border-red-200 mb-4">
                {formError}
              </div>
            )}

            <button
              type="submit"
              disabled={formLoading}
              className="w-full bg-premium-black text-white hover:bg-premium-accent hover:text-premium-black font-semibold text-xs tracking-widest uppercase py-4 rounded transition-all flex items-center justify-center gap-2"
            >
              {formLoading 
                ? 'Processing...' 
                : isLoginTab 
                  ? 'Sign In' 
                  : registrationStep === 1 
                    ? 'Get OTP Code' 
                    : 'Verify & Register'}
            </button>

            {!isLoginTab && registrationStep === 2 && (
              <button
                type="button"
                onClick={() => {
                  setRegistrationStep(1);
                  setOtpCode('');
                  setFormError('');
                }}
                className="w-full text-center text-xs font-semibold text-premium-gray hover:text-premium-black py-1 mt-2 focus:outline-none transition-colors"
              >
                &larr; Back to edit details
              </button>
            )}
          </form>

          {/* Social connection divider */}
          <div className="relative flex items-center justify-center my-6">
            <hr className="w-full border-premium-border" />
            <span className="absolute bg-white px-3 text-[10px] font-bold tracking-widest text-premium-gray uppercase">
              Or Connect With
            </span>
          </div>

          {/* Google & Facebook OAuth Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <a
              href={`${API_BASE}/api/auth/google`}
              className="flex items-center justify-center gap-2 border border-premium-border hover:border-premium-accent rounded-lg py-3 text-xs font-bold text-premium-dark hover:bg-premium-light transition-all cursor-pointer"
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#EA4335"
                  d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.114-5.137 4.114-3.478 0-6.3-2.823-6.3-6.3 0-3.478 2.822-6.3 6.3-6.3 1.63 0 3.106.625 4.225 1.637l3.136-3.136C19.123 2.502 15.86 1 12.24 1 6.033 1 1 6.033 1 12.24s5.033 11.24 11.24 11.24c5.895 0 10.865-4.224 10.865-11.24 0-.668-.057-1.314-.165-1.955H12.24z"
                />
              </svg>
              <span>Google Account</span>
            </a>

            <a
              href={`${API_BASE}/api/auth/facebook`}
              className="flex items-center justify-center gap-2 border border-premium-border hover:border-premium-accent rounded-lg py-3 text-xs font-bold text-premium-dark hover:bg-premium-light transition-all cursor-pointer"
            >
              <svg className="w-4 h-4 fill-[#1877F2] shrink-0" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
              <span>Facebook Account</span>
            </a>
          </div>


          {/* Quick tester credentials */}
          {process.env.NODE_ENV === 'development' && (
            <div className="mt-8 pt-6 border-t border-premium-border text-center text-xs text-premium-gray leading-relaxed">
              <span className="font-bold text-premium-accent block mb-1">Developer Testing Accounts:</span>
              <span>Admin Dashboard: <strong>dev.parceluncle@gmail.com</strong> / password: <strong>14912malik</strong></span>
            </div>
          )}

        </div>
      </div>
    );
  }

  // --- RENDERING: Logged In (Dashboard) ---
  const loyaltyCount = useCountUp(user ? (user.loyalty_points || 0) : 0, 1500);

  return (
    <div className="bg-premium-light min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Profile overview bar */}
        <div className="stat-card-enter bg-white border border-premium-border rounded p-6 sm:p-8 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6 mb-8">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-premium-accent/20 border-2 border-premium-accent flex items-center justify-center shrink-0">
              <User className="w-8 h-8 text-premium-accent" />
            </div>
            <div>
              {isEditingName ? (
                <div className="flex items-center gap-2 mb-1">
                  <input 
                    type="text" 
                    value={editedName} 
                    onChange={(e) => setEditedName(e.target.value)}
                    className="border border-premium-border rounded px-2 py-1 text-lg font-serif font-bold text-premium-black focus:outline-none focus:border-premium-accent"
                    autoFocus
                  />
                  <button onClick={handleSaveName} className="p-1.5 bg-premium-black text-white rounded hover:bg-premium-accent transition-colors"><Save className="w-4 h-4" /></button>
                  <button onClick={() => { setIsEditingName(false); setEditedName(user.name); }} className="p-1.5 bg-gray-200 text-premium-dark rounded hover:bg-gray-300 transition-colors"><X className="w-4 h-4" /></button>
                </div>
              ) : (
                <div className="flex items-center gap-2 group">
                  <h2 className="font-serif text-2xl font-bold text-premium-black">{user.name}</h2>
                  <button onClick={() => setIsEditingName(true)} className="text-premium-gray hover:text-premium-accent opacity-0 group-hover:opacity-100 transition-all">
                    <Edit2 className="w-4 h-4" />
                  </button>
                </div>
              )}
              <p className="text-sm text-premium-gray font-light mt-0.5">{user.email}</p>
            </div>
          </div>
          <div className="flex gap-4">
            {(user.role === 'admin' || user.email === 'dev.parceluncle@gmail.com' || user.email === 'admin@specs.com') && (
              <Link href="/admin" className="bg-premium-black text-white hover:bg-premium-accent hover:text-premium-black font-semibold text-xs tracking-widest uppercase px-6 py-3 rounded transition-all">
                Admin Panel
              </Link>
            )}
            <button
              onClick={logout}
              className="border border-premium-border hover:border-red-600 hover:text-red-600 text-premium-dark font-semibold text-xs tracking-widest uppercase px-6 py-3 rounded transition-all"
            >
              Log Out
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Dashboard Left side: Personalized suggestions & info */}
          <div className="space-y-8">
            
            {/* AI Face Shape Suggestion Profile info */}
            <div className="bg-white border border-premium-border rounded p-6 shadow-sm">
              <h3 className="font-serif text-lg font-bold text-premium-black border-b border-premium-border pb-4 mb-4">
                My Face Shape Profile
              </h3>
              {user.face_shape ? (
                <div>
                  <div className="bg-premium-accent/15 border border-premium-accent/40 rounded p-4 text-center mb-4">
                    <span className="block text-[10px] text-premium-gray uppercase font-bold tracking-wider">Detected Shape</span>
                    <span className="text-2xl font-serif font-bold text-premium-golddark uppercase tracking-wide">
                      {user.face_shape}
                    </span>
                  </div>
                  <p className="text-xs text-premium-gray leading-relaxed mb-6 font-light">
                    Based on your face scan, we recommend wearing frame shapes that contrast your natural dimensions for a perfectly balanced cosmetic profile.
                  </p>
                  <Link href={`/shop?face_shape=${user.face_shape}`} className="w-full bg-premium-black text-white hover:bg-premium-accent hover:text-premium-black font-semibold text-xs tracking-widest uppercase py-3.5 rounded transition-all text-center flex items-center justify-center gap-1.5 shadow">
                    View Recommended Frames
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              ) : (
                <div className="text-center py-6">
                  <Landmark className="w-10 h-10 text-premium-accent mx-auto mb-2" />
                  <p className="text-xs text-premium-gray leading-relaxed mb-4">
                    You haven't scanned your face shape yet. Scan in seconds using your camera to get custom recommendations!
                  </p>
                  <Link href="/face-shape" className="bg-premium-accent hover:bg-premium-golddark text-premium-black font-bold uppercase tracking-wider text-[10px] px-6 py-3 rounded transition-all inline-block">
                    Scan Face Now
                  </Link>
                </div>
              )}
            </div>

            {/* Loyalty points and Referral system card */}
            <div className="bg-white border border-premium-border rounded p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-premium-border pb-3">
                <h3 className="font-serif text-lg font-bold text-premium-black flex items-center gap-1.5">
                  <Award className="w-5 h-5 text-premium-accent" /> Specs Rewards Club
                </h3>
                <span className={`text-[9px] uppercase font-bold px-2 py-0.5 rounded ${
                  (user.loyalty_points || 0) >= 300 ? 'bg-yellow-100 text-yellow-800' :
                  (user.loyalty_points || 0) >= 100 ? 'bg-gray-100 text-gray-800' :
                  'bg-orange-100 text-orange-800'
                }`}>
                  {(user.loyalty_points || 0) >= 300 ? 'Gold Ambassador' :
                   (user.loyalty_points || 0) >= 100 ? 'Silver VIP' :
                   'Bronze Member'}
                </span>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span>Reward Balance</span>
                  <span className="text-premium-accent font-bold font-mono">{loyaltyCount} pts</span>
                </div>
                {/* Progress bar towards next reward milestone */}
                <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                  <div 
                    className="bg-premium-accent h-full transition-all duration-500" 
                    style={{ width: `${Math.min(100, ((user.loyalty_points || 0) % 500) / 500 * 100)}%` }}
                  />
                </div>
                <p className="text-[10px] text-premium-gray mt-1.5">
                  {500 - ((user.loyalty_points || 0) % 500)} points remaining to unlock a ₹500 store credit.
                </p>
              </div>

              <div className="border-t border-premium-border pt-4">
                <span className="block text-xs font-bold text-premium-dark mb-1.5 flex items-center gap-1">
                  <Gift className="w-4 h-4 text-premium-accent" /> Share the Love
                </span>
                <p className="text-[10px] text-premium-gray mb-3 leading-relaxed">
                  Invite your friends! When they place their first eyewear order, they get a 10% discount and you get 100 loyalty points!
                </p>
                <div className="flex items-center gap-2">
                  <input 
                    type="text" 
                    readOnly 
                    value={user ? `${window.location.origin}/account?ref=${user.referral_code || 'REF-USER'}` : ''}
                    className="flex-grow bg-premium-light border border-premium-border rounded px-2.5 py-1.5 text-[10px] text-premium-dark focus:outline-none"
                  />
                  <button
                    onClick={handleCopyLink}
                    className="bg-premium-black text-white hover:bg-premium-accent hover:text-premium-black p-2 rounded transition-colors"
                    title="Copy Referral Link"
                  >
                    {copied ? <span className="text-[9px] font-bold px-1 uppercase tracking-wider text-green-400">Copied</span> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Premium service warranty card */}
            <div className="bg-premium-black text-white border border-premium-accent/30 rounded p-6 shadow-sm">
              <h3 className="font-serif text-lg font-bold text-premium-accent mb-2">Specs Warranty</h3>
              <p className="text-xs text-gray-400 leading-relaxed font-light mb-4">
                Every frame purchased includes a complimentary 1-year anti-scratch protection and free adjustment service at any partner boutique.
              </p>
              <div className="flex gap-4 text-xs font-semibold text-premium-accent">
                <span>Free Tuning</span>
                <span>•</span>
                <span>Anti-UV Coat</span>
              </div>
            </div>

          </div>

          {/* Dashboard Right side: Order History */}
          <div className="lg:col-span-2 bg-white border border-premium-border rounded p-6 sm:p-8 shadow-sm">
            <h3 className="font-serif text-xl font-bold text-premium-black border-b border-premium-border pb-4 mb-6 flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-premium-accent" /> Order History
            </h3>

            {ordersLoading ? (
              <div className="text-center py-10">
                <RefreshCw className="w-8 h-8 text-premium-accent mx-auto mb-2 animate-spin" />
                <p className="text-sm text-premium-gray">Retrieving your orders...</p>
              </div>
            ) : orders.length === 0 ? (
              <div className="text-center py-10 bg-premium-light border border-premium-border rounded">
                <p className="text-sm text-premium-gray mb-4">You haven't placed any orders yet.</p>
                <Link href="/shop" className="bg-premium-black text-white hover:bg-premium-accent hover:text-premium-black text-xs uppercase tracking-widest px-4 py-2.5 rounded font-bold transition-all inline-block">
                  Shop Catalog
                </Link>
              </div>
            ) : (
              <div className="space-y-6">
                {orders.map(order => (
                  <div key={order.id} className="border border-premium-border rounded p-4 sm:p-6 bg-premium-light">
                    
                    {/* Header info */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-premium-border/60 pb-3 mb-4 gap-2 text-xs">
                      <div>
                        <span className="text-premium-gray font-medium">Order ID:</span>{' '}
                        <strong className="text-premium-dark font-bold">#{order.id}</strong>
                      </div>
                      <div className="text-premium-gray flex items-center gap-4">
                        <span>
                          {new Date(order.created_at).toLocaleDateString('en-IN', {
                            year: 'numeric', month: 'short', day: 'numeric'
                          })}
                        </span>
                        <span className={`font-bold px-2 py-0.5 rounded uppercase text-[10px] ${
                          order.status === 'Paid' ? 'bg-green-100 text-green-700' :
                          order.status === 'Shipped' ? 'bg-blue-100 text-blue-700' :
                          order.status === 'Delivered' ? 'bg-gray-200 text-gray-700' :
                          'bg-amber-100 text-amber-700'
                        }`}>
                          {order.status}
                        </span>
                      </div>
                    </div>

                    {/* Order Progress Tracker Stepper */}
                    {order.status !== 'Cancelled' ? (
                      <div className="mb-5">
                        <p className="text-[10px] uppercase tracking-wider text-premium-gray font-bold mb-3">Order Progress</p>
                        <div className="flex items-center">
                          {[
                            { label: 'Ordered', icon: Package, statuses: ['Paid', 'Processing', 'Shipped', 'Delivered'] },
                            { label: 'Processing', icon: RefreshCw, statuses: ['Processing', 'Shipped', 'Delivered'] },
                            { label: 'Shipped', icon: Truck, statuses: ['Shipped', 'Delivered'] },
                            { label: 'Delivered', icon: PackageCheck, statuses: ['Delivered'] },
                          ].map((step, idx, arr) => {
                            const isActive = step.statuses.includes(order.status);
                            const StepIcon = step.icon;
                            return (
                              <React.Fragment key={step.label}>
                                <div className="flex flex-col items-center gap-1.5 flex-shrink-0">
                                  <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                                    isActive
                                      ? 'bg-premium-black text-premium-accent'
                                      : 'bg-gray-100 text-gray-400'
                                  }`}>
                                    <StepIcon className="w-4 h-4" />
                                  </div>
                                  <span className={`text-[9px] font-bold uppercase tracking-wider ${
                                    isActive ? 'text-premium-black' : 'text-gray-400'
                                  }`}>{step.label}</span>
                                </div>
                                {idx < arr.length - 1 && (
                                  <div className={`flex-grow h-0.5 mx-1 rounded transition-all ${
                                    arr[idx + 1].statuses.includes(order.status)
                                      ? 'bg-premium-black'
                                      : 'bg-gray-200'
                                  }`} />
                                )}
                              </React.Fragment>
                            );
                          })}
                        </div>
                      </div>
                    ) : (
                      <div className="mb-5 flex items-center gap-2 p-2.5 bg-red-50 border border-red-200 rounded text-xs text-red-600 font-semibold">
                        <XCircle className="w-4 h-4" /> This order has been cancelled.
                      </div>
                    )}

                    {/* Order items list */}
                    <div className="space-y-3 mb-4">
                      {order.items && order.items.map(item => (
                        <div key={item.id} className="flex justify-between items-center text-sm">
                          <div className="flex items-center gap-3">
                            {item.image && (
                              <img src={item.image} alt={item.name} className="w-8 h-8 object-cover rounded border border-premium-border" />
                            )}
                            <div>
                              <span className="font-semibold text-premium-black">{item.name}</span>
                              <span className="text-xs text-premium-gray block sm:inline sm:ml-2">Qty: {item.quantity}</span>
                            </div>
                          </div>
                          <span className="font-bold text-premium-dark">₹{parseFloat(item.price * item.quantity).toLocaleString('en-IN')}</span>
                        </div>
                      ))}
                    </div>

                    {/* Order visual tracking updates comments */}
                    {order.tracking_comments && (
                      <div className="mb-4 p-3 bg-amber-50/50 border border-amber-200/60 rounded text-xs text-premium-dark">
                        <p className="font-bold text-amber-800 uppercase tracking-widest text-[9px] mb-1 flex items-center gap-1">
                          <Truck className="w-3.5 h-3.5" /> Shipping / Dispatch Notes
                        </p>
                        <p className="font-medium leading-relaxed">{order.tracking_comments}</p>
                      </div>
                    )}

                    {/* Footer values */}
                    <div className="border-t border-premium-border/60 pt-3 flex justify-between items-center text-sm font-bold">
                      <span className="text-premium-gray font-medium text-xs uppercase tracking-wider">Total Paid</span>
                      <span className="text-premium-accent text-base">₹{parseFloat(order.total_amount).toLocaleString('en-IN')}</span>
                    </div>

                  </div>
                ))}
              </div>
            )}

          </div>

        </div>

      </div>
    </div>
  );
}
