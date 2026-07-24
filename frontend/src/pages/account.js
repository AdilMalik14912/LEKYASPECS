// Lekya Specs - Full Parcel Uncle API Suite v1.0.3 Live - Build 2026.07.23.03
const React = require('react');
const { useState, useEffect, useRef } = React;
const Link = require('next/link').default;
const { useRouter } = require('next/router');
const { useAuth, useToast } = require('./_app');
const { User, Mail, Calendar, Eye, ShoppingBag, Landmark, ArrowRight, Star, RefreshCw, Truck, Package, CheckCircle2, XCircle, Edit2, Save, X, Copy, Award, Gift, Phone, Key, Navigation, Download, Loader2, AlertCircle, Check, Sparkles } = require('lucide-react');

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

  const loyaltyCount = useCountUp(user ? user.loyalty_points || 0 : 0);

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
      // Auto-redirect staff members to their respective panels
      if (user.role === 'admin' || user.email === 'dev.parceluncle@gmail.com' || user.email === 'admin@specs.com') {
        router.push('/admin');
      } else if (user.role === 'seller') {
        router.push('/seller');
      } else if (user.role === 'delivery') {
        router.push('/delivery');
      } else if (user.role === 'stylist') {
        router.push('/stylist');
      } else if (user.role === 'ho_staff') {
        router.push('/ho-staff');
      }
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
  const [showOtpSuccessModal, setShowOtpSuccessModal] = useState(false);
  const [otpSuccessData, setOtpSuccessData] = useState(null);
  const [otpErrorShake, setOtpErrorShake] = useState(false);

  // Social OAuth Selector Modal State
  const [socialModalOpen, setSocialModalOpen] = useState(false);
  const [socialModalProvider, setSocialModalProvider] = useState('google'); // 'google' | 'facebook'
  const [socialEmail, setSocialEmail] = useState('');
  const [socialName, setSocialName] = useState('');
  const [socialLoading, setSocialLoading] = useState(false);
  const [socialError, setSocialError] = useState('');

  // Check URL query to see if redirect requested social modal
  useEffect(() => {
    if (!router.isReady) return;
    const { open_social_modal } = router.query;
    if (open_social_modal === 'google' || open_social_modal === 'facebook') {
      setSocialModalProvider(open_social_modal);
      setSocialModalOpen(true);
      router.replace('/account', undefined, { shallow: true });
    }
  }, [router.isReady, router.query]);

  const handleOpenSocialModal = (provider) => {
    setSocialModalProvider(provider);
    setSocialError('');
    setSocialModalOpen(true);
  };

  const handleSocialSubmit = async (e) => {
    e.preventDefault();
    if (!socialEmail || !socialEmail.includes('@')) {
      setSocialError('Please enter a valid Google/Facebook email address');
      return;
    }

    setSocialLoading(true);
    setSocialError('');

    try {
      const res = await fetch(`${API_BASE}/api/auth/social-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider: socialModalProvider,
          email: socialEmail.trim(),
          name: socialName.trim() || (socialModalProvider === 'google' ? 'Google Member' : 'Facebook Member')
        })
      });

      const data = await res.json();
      if (res.ok && data.token) {
        login(data.token, data.user);
        setSocialModalOpen(false);
        showToast(`Successfully signed in via ${socialModalProvider === 'google' ? 'Google' : 'Facebook'}!`);
      } else {
        setSocialError(data.message || 'Social authentication failed');
      }
    } catch (err) {
      console.error(err);
      setSocialError('Authentication error. Please check connection.');
    } finally {
      setSocialLoading(false);
    }
  };

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
      ctx.fillStyle = `rgba(250,174,98,${(Math.random()*0.25+0.05).toFixed(2)})`;
      ctx.fill();
    }
    // Noise lines
    for (let i = 0; i < 5; i++) {
      ctx.beginPath();
      ctx.moveTo(Math.random()*W*0.3, Math.random()*H);
      ctx.lineTo(Math.random()*W*0.5+W*0.5, Math.random()*H);
      ctx.strokeStyle = `rgba(250,174,98,${(Math.random()*0.3+0.1).toFixed(2)})`;
      ctx.lineWidth = Math.random()*1.5+0.5;
      ctx.stroke();
    }
    // Draw each character
    const colors = ['#FAAE62','#e8c547','#ffffff','#aaaaaa','#d4870c'];
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
  const [userReturns, setUserReturns] = useState([]);

  // Return & Exchange Modal states
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [selectedReturnOrder, setSelectedReturnOrder] = useState(null);
  const [returnType, setReturnType] = useState('exchange'); // 'exchange' | 'refund' | 'credit'
  const [returnReason, setReturnReason] = useState('Size / Fit issue (Too tight / Too loose)');
  const [returnComments, setReturnComments] = useState('');
  const [returnSubmitting, setReturnSubmitting] = useState(false);
  const [returnError, setReturnError] = useState('');

  // Fetch Order History & Return Requests if logged in
  useEffect(() => {
    if (!token) return;
    
    setOrdersLoading(true);
    Promise.all([
      fetch(`${API_BASE}/api/orders/history`, { headers: { 'Authorization': `Bearer ${token}` } }).then(r => r.json()),
      fetch(`${API_BASE}/api/returns/my-returns`, { headers: { 'Authorization': `Bearer ${token}` } }).then(r => r.json())
    ])
      .then(([ordersData, returnsData]) => {
        setOrders(Array.isArray(ordersData) ? ordersData : []);
        setUserReturns(Array.isArray(returnsData) ? returnsData : []);
        setOrdersLoading(false);
      })
      .catch(err => {
        console.error('Error fetching orders/returns:', err);
        setOrders([]);
        setUserReturns([]);
        setOrdersLoading(false);
      });
  }, [token]);

  const handleOpenReturnModal = (order) => {
    setSelectedReturnOrder(order);
    setReturnType('exchange');
    setReturnReason('Size / Fit issue (Too tight / Too loose)');
    setReturnComments('');
    setReturnError('');
    setShowReturnModal(true);
  };

  const handleSubmitReturn = async (e) => {
    e.preventDefault();
    if (!selectedReturnOrder) return;

    setReturnSubmitting(true);
    setReturnError('');

    try {
      const res = await fetch(`${API_BASE}/api/returns/request`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          orderId: selectedReturnOrder.id,
          returnType,
          reason: returnReason,
          comments: returnComments
        })
      });

      const data = await res.json();
      if (res.ok) {
        showToast(data.message || 'Return request submitted successfully!');
        setShowReturnModal(false);
        // Refresh orders and returns
        const [ordersData, returnsData] = await Promise.all([
          fetch(`${API_BASE}/api/orders/history`, { headers: { 'Authorization': `Bearer ${token}` } }).then(r => r.json()),
          fetch(`${API_BASE}/api/returns/my-returns`, { headers: { 'Authorization': `Bearer ${token}` } }).then(r => r.json())
        ]);
        setOrders(Array.isArray(ordersData) ? ordersData : []);
        setUserReturns(Array.isArray(returnsData) ? returnsData : []);
      } else {
        setReturnError(data.message || 'Failed to submit return request');
      }
    } catch (err) {
      console.error(err);
      setReturnError('Server error submitting request. Please try again.');
    } finally {
      setReturnSubmitting(false);
    }
  };

  // Handle Login / Registration
  const handleAuthSubmit = (e) => {
    e.preventDefault();
    setFormError('');
    setFormLoading(true);

    if (isLoginTab) {
      if (!email || email.trim() === '') {
        setFormLoading(false);
        setFormError('Please enter your email address or phone number.');
        return;
      }
      if (!password || password === '') {
        setFormLoading(false);
        setFormError('Please enter your password.');
        return;
      }
      if (!captchaInput || captchaInput.trim().toUpperCase() !== captchaCode.toUpperCase()) {
        setFormLoading(false);
        setFormError('Incorrect security code. Please try again.');
        refreshCaptcha();
        return;
      }

      fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: email.trim(), 
          password: password
        })
      })
        .then(async (res) => {
          let data = {};
          try {
            data = await res.json();
          } catch (_) {}

          setFormLoading(false);
          if (res.ok && data && data.token) {
            login(data.token, data.user);
            if (data.user?.role === 'admin' || data.user?.email === 'admin@specs.com' || data.user?.email === 'dev.parceluncle@gmail.com') {
              router.push('/admin');
            }
          } else {
            setFormError(data.message || 'Invalid email or password');
            refreshCaptcha();
          }
        })
        .catch((err) => {
          console.error('Login error:', err);
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
            refreshCaptcha(); // Refresh captcha on error
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
            // Trigger 3D celebratory OTP success animation state
            setOtpSuccessData({ token: data.token, user: data.user });
            setShowOtpSuccessModal(true);
          })
          .catch(err => {
            setFormLoading(false);
            setFormError(err.message);
            // Add shake animation trigger on error
            setOtpErrorShake(true);
            setTimeout(() => setOtpErrorShake(false), 600);
          });
      }
    }
  };

  // --- RENDERING: Logged Out (Auth Screen) ---
  if (!user) {
    return (
      <>
      <div className="bg-premium-black min-h-screen py-16 sm:py-24 flex items-center justify-center">
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

          <form noValidate onSubmit={handleAuthSubmit} className="space-y-4">
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
                  <label className="block text-xs uppercase tracking-wider text-[#9B7EA8] font-semibold mb-2">Password</label>
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

                <div className={otpErrorShake ? 'animate-shake' : ''}>
                  <label className="block text-xs uppercase tracking-wider text-premium-gray font-semibold mb-3 text-center">
                    Enter 6-Digit Verification Code
                  </label>
                  
                  {/* Segmented 6-digit OTP boxes with luxury focus animations */}
                  <div className="flex justify-center gap-2 sm:gap-3 my-2">
                    {[0, 1, 2, 3, 4, 5].map((idx) => {
                      const digit = otpCode[idx] || '';
                      return (
                        <input
                          key={idx}
                          id={`otp-box-${idx}`}
                          type="text"
                          inputMode="numeric"
                          maxLength={1}
                          value={digit}
                          onChange={(e) => {
                            const val = e.target.value.replace(/\D/g, '');
                            if (!val) {
                              const newOtp = otpCode.split('');
                              newOtp[idx] = '';
                              setOtpCode(newOtp.join(''));
                              return;
                            }
                            const newOtp = otpCode.split('');
                            newOtp[idx] = val[val.length - 1];
                            const updated = newOtp.join('');
                            setOtpCode(updated);
                            // Auto-focus next box
                            if (idx < 5 && val) {
                              const nextBox = document.getElementById(`otp-box-${idx + 1}`);
                              if (nextBox) nextBox.focus();
                            }
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Backspace' && !otpCode[idx] && idx > 0) {
                              const prevBox = document.getElementById(`otp-box-${idx - 1}`);
                              if (prevBox) prevBox.focus();
                            }
                          }}
                          onPaste={(e) => {
                            e.preventDefault();
                            const pasteData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
                            if (pasteData) {
                              setOtpCode(pasteData);
                              const targetIdx = Math.min(pasteData.length, 5);
                              const targetBox = document.getElementById(`otp-box-${targetIdx}`);
                              if (targetBox) targetBox.focus();
                            }
                          }}
                          className={`w-10 h-12 sm:w-12 sm:h-14 text-center font-mono font-bold text-lg sm:text-xl rounded-lg border transition-all duration-300 outline-none ${
                            digit
                              ? 'border-premium-accent bg-premium-accent/10 text-premium-accent shadow-[0_0_12px_rgba(250,174,98,0.3)] scale-105'
                              : 'border-premium-border bg-premium-light text-premium-dark focus:border-premium-accent focus:bg-white focus:shadow-[0_0_15px_rgba(250,174,98,0.4)]'
                          }`}
                        />
                      );
                    })}
                  </div>
                  <p className="text-[10px] text-center text-premium-gray mt-2">
                    {otpCode.length === 6 ? '✨ Code complete! Click Verify to continue.' : `Type code (${otpCode.length}/6)`}
                  </p>
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
                      style={{ border: '1px solid rgba(250,174,98,0.25)', borderRadius: 8 }}
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

          {/* Quick tester credentials */}
          {process.env.NODE_ENV === 'development' && (
            <div className="mt-8 pt-6 border-t border-premium-border text-center text-xs text-premium-gray leading-relaxed">
              <span className="font-bold text-premium-accent block mb-1">Developer Testing Accounts:</span>
              <span>Admin Dashboard: <strong>dev.parceluncle@gmail.com</strong> / password: <strong>14912malik</strong></span>
            </div>
          )}

        </div>
      </div>

      {/* --- 3D Celebratory OTP Success Modal Overlay --- */}
      {showOtpSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-sm bg-[#0D0016] border border-[#FAAE62]/50 rounded-3xl p-8 shadow-[0_0_50px_rgba(250,174,98,0.3)] text-center overflow-hidden animate-scaleUp">
            
            {/* Ambient background glow orbs */}
            <div className="absolute -top-16 -left-16 w-36 h-36 bg-[#7B22A8]/40 rounded-full blur-2xl animate-pulse"></div>
            <div className="absolute -bottom-16 -right-16 w-36 h-36 bg-[#FAAE62]/30 rounded-full blur-2xl animate-pulse"></div>

            {/* Floating Sparkles & Confetti */}
            <div className="absolute top-6 left-8 text-xl animate-bounce">✨</div>
            <div className="absolute top-8 right-10 text-xl animate-bounce" style={{ animationDelay: '0.2s' }}>🎉</div>
            <div className="absolute bottom-10 left-10 text-xl animate-bounce" style={{ animationDelay: '0.4s' }}>🌟</div>
            <div className="absolute bottom-8 right-8 text-xl animate-bounce" style={{ animationDelay: '0.3s' }}>💫</div>

            {/* Animated 3D Checkmark Badge */}
            <div className="relative mx-auto w-24 h-24 mb-6 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-[#7B22A8] to-[#FAAE62] opacity-30 animate-ping"></div>
              <div className="absolute inset-2 rounded-full border-2 border-[#FAAE62] shadow-[0_0_20px_#FAAE62]"></div>
              <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-[#FAAE62] to-[#D4893F] flex items-center justify-center text-[#0D0016] shadow-xl animate-bounce">
                <Check className="w-10 h-10 stroke-[3]" />
              </div>
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FAAE62]/10 border border-[#FAAE62]/30 text-[#FAAE62] text-[10px] font-bold uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5" /> Verification Complete
            </div>

            <h3 className="text-2xl font-serif font-bold text-white mb-2">
              OTP Verified! 🎉
            </h3>
            <p className="text-xs text-[#9B7EA8] leading-relaxed mb-6">
              Welcome to <strong>Lekya Specs</strong>! Your account has been registered successfully. Setting up your VIP dashboard...
            </p>

            {/* Action button to continue */}
            <button
              onClick={() => {
                setShowOtpSuccessModal(false);
                setRegistrationStep(1);
                setOtpCode('');
                if (otpSuccessData) {
                  login(otpSuccessData.token, otpSuccessData.user);
                }
              }}
              className="w-full bg-gradient-to-r from-[#D4893F] to-[#FAAE62] hover:scale-105 active:scale-95 text-[#0D0016] font-black text-xs uppercase tracking-widest py-3.5 rounded-xl shadow-lg shadow-[#FAAE62]/20 transition-all flex items-center justify-center gap-2"
            >
              Continue to Dashboard &rarr;
            </button>
          </div>
        </div>
      )}
      </>
    );
  }

  // --- RENDERING: Logged In (Dashboard) ---

  return (
    <div className="bg-premium-black min-h-screen py-12">
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
            {user.role === 'seller' && (
              <Link href="/seller" className="bg-premium-black text-white hover:bg-premium-accent hover:text-premium-black font-semibold text-xs tracking-widest uppercase px-6 py-3 rounded transition-all">
                Seller Hub
              </Link>
            )}
            {user.role === 'delivery' && (
              <Link href="/delivery" className="bg-premium-black text-white hover:bg-premium-accent hover:text-premium-black font-semibold text-xs tracking-widest uppercase px-6 py-3 rounded transition-all">
                Rider Console
              </Link>
            )}
            {user.role === 'stylist' && (
              <Link href="/stylist" className="bg-premium-black text-white hover:bg-premium-accent hover:text-premium-black font-semibold text-xs tracking-widest uppercase px-6 py-3 rounded transition-all">
                Stylist Hub
              </Link>
            )}
            {user.role === 'ho_staff' && (
              <Link href="/ho-staff" className="bg-premium-black text-white hover:bg-premium-accent hover:text-premium-black font-semibold text-xs tracking-widest uppercase px-6 py-3 rounded transition-all">
                HO Staff Hub
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
                    value={user && typeof window !== 'undefined' ? `${window.location.origin}/account?ref=${user.referral_code || 'REF-USER'}` : ''}
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
                      <div className="flex flex-wrap gap-x-4">
                        <div>
                          <span className="text-premium-gray font-medium">Order ID:</span>{' '}
                          <strong className="text-premium-dark font-bold">#{order.id}</strong>
                        </div>
                        {order.tracking_id && (
                          <div>
                            <span className="text-premium-gray font-medium">Tracking ID:</span>{' '}
                            <Link href={`/track?id=${order.tracking_id}`} className="text-premium-accent hover:underline font-bold font-mono tracking-widest">
                              {order.tracking_id}
                            </Link>
                          </div>
                        )}
                      </div>
                      <div className="text-premium-gray flex items-center gap-4">
                        <span>
                          {new Date(order.created_at).toLocaleDateString('en-IN', {
                            year: 'numeric', month: 'short', day: 'numeric'
                          })}
                        </span>
                        <span className={`font-bold px-2 py-0.5 rounded uppercase text-[10px] ${
                          order.status === 'Paid' || order.status === 'Payment Confirmed' ? 'bg-green-100 text-green-700' :
                          order.status === 'Processing' ? 'bg-blue-100 text-blue-700' :
                          order.status === 'Packed' ? 'bg-violet-100 text-violet-700' :
                          order.status === 'Shipped' ? 'bg-indigo-100 text-indigo-700' :
                          order.status === 'Out for Delivery' ? 'bg-orange-100 text-orange-700' :
                          order.status === 'Delivered' ? 'bg-emerald-100 text-emerald-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {order.status}
                        </span>
                      </div>
                    </div>

                    {/* Order Progress Tracker Stepper */}
                    {order.status !== 'Cancelled' ? (
                      <div className="mb-5 overflow-x-auto pb-2">
                        <p className="text-[10px] uppercase tracking-wider text-premium-gray font-bold mb-3">Order Progress</p>
                        <div className="flex items-center min-w-[500px]">
                          {[
                            { label: 'Confirmed', icon: Package, statuses: ['Paid', 'Payment Confirmed', 'Processing', 'Packed', 'Shipped', 'Out for Delivery', 'Delivered'] },
                            { label: 'Processing', icon: RefreshCw, statuses: ['Processing', 'Packed', 'Shipped', 'Out for Delivery', 'Delivered'] },
                            { label: 'Packed', icon: Gift, statuses: ['Packed', 'Shipped', 'Out for Delivery', 'Delivered'] },
                            { label: 'Shipped', icon: Truck, statuses: ['Shipped', 'Out for Delivery', 'Delivered'] },
                            { label: 'Out for Delivery', icon: Navigation, statuses: ['Out for Delivery', 'Delivered'] },
                            { label: 'Delivered', icon: CheckCircle2, statuses: ['Delivered'] },
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

                    {order.status !== 'Cancelled' && order.delivery_otp && (
                      <div className="mb-5 p-3.5 bg-premium-accent/10 border border-premium-accent/30 rounded flex items-center justify-between gap-4">
                        <div>
                          <span className="block text-[10px] text-premium-gray uppercase font-bold tracking-wider">Delivery Verification Code</span>
                          <span className="text-[9px] text-premium-gray font-light mt-0.5 block">Share this code with the delivery agent only when you receive the shipment.</span>
                        </div>
                        <div className="text-right">
                          <span className="text-xl font-bold font-mono text-premium-golddark tracking-widest bg-premium-accent/20 border border-premium-accent/40 rounded px-3.5 py-1.5 inline-block">
                            {order.delivery_otp}
                          </span>
                        </div>
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
                          <span className="font-bold text-premium-dark">₹{((parseFloat(item.price) || 0) * (parseInt(item.quantity) || 1)).toLocaleString('en-IN')}</span>
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
                    <div className="border-t border-premium-border/60 pt-3 flex flex-wrap justify-between items-center text-sm font-bold gap-3">
                      <div className="flex items-center gap-2">
                        <span className="text-premium-gray font-medium text-xs uppercase tracking-wider">Total Paid</span>
                        <span className="text-premium-accent text-base">₹{parseFloat(order.total_amount).toLocaleString('en-IN')}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        {/* Request Return / Exchange Button for non-cancelled orders */}
                        {order.status !== 'Cancelled' && (
                          <button
                            onClick={() => handleOpenReturnModal(order)}
                            className="border border-premium-accent text-premium-accent hover:bg-premium-accent hover:text-premium-black font-bold text-[11px] px-3.5 py-1.5 rounded flex items-center gap-1.5 transition-all shadow-sm"
                          >
                            <RefreshCw className="w-3.5 h-3.5" /> Request Return / Exchange
                          </button>
                        )}

                        <button
                          onClick={() => {
                            const itemsList = (order.items || []).map(item => `
                              <tr>
                                <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.name}</td>
                                <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
                                <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">₹${parseFloat(item.price).toLocaleString('en-IN')}</td>
                                <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">₹${(item.price * item.quantity).toLocaleString('en-IN')}</td>
                              </tr>
                            `).join('');

                            const fullHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Tax Invoice #${order.id} - Lekya Specs</title>
  <style>
    body { font-family: Georgia, serif; color: #1a1a1a; padding: 40px; margin: 0; background: #fff; }
    .header { border-bottom: 2px solid #FAAE62; padding-bottom: 20px; margin-bottom: 30px; display: flex; justify-content: space-between; }
    .brand { font-size: 26px; font-weight: bold; color: #000; }
    .gold { color: #FAAE62; }
    table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 14px; }
    th { background: #f8f9fa; text-align: left; padding: 10px; border-bottom: 2px solid #ddd; }
    .total { text-align: right; margin-top: 30px; font-size: 18px; font-weight: bold; }
    @media print { body { padding: 0; } }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <div class="brand">LEKYA<span class="gold">SPECS</span></div>
      <p style="font-size:12px; color:#666; margin:4px 0 0;">Official Tax Invoice & Warranty</p>
    </div>
    <div style="text-align:right;">
      <h2 style="margin:0; font-size:20px;">INVOICE</h2>
      <p style="margin:4px 0 0; font-size:12px; color:#555;">Invoice #: <strong>INV-${String(order.id).padStart(6, '0')}</strong></p>
      <p style="margin:2px 0 0; font-size:12px; color:#555;">Date: ${new Date(order.created_at).toLocaleDateString('en-IN')}</p>
    </div>
  </div>

  <div style="display:flex; justify-between; margin-bottom: 30px; font-size: 13px;">
    <div>
      <strong>Customer:</strong> ${user?.name || 'Customer'}<br>
      <strong>Email:</strong> ${user?.email || 'N/A'}<br>
      <strong>Shipping Address:</strong> ${order.shipping_address || 'Provided at checkout'}
    </div>
    <div style="text-align:right;">
      <strong>Payment Method:</strong> Prepaid (Razorpay / Online)<br>
      <strong>Status:</strong> ${order.status}
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th>Item Description</th>
        <th style="text-align:center;">Qty</th>
        <th style="text-align:right;">Unit Price</th>
        <th style="text-align:right;">Total</th>
      </tr>
    </thead>
    <tbody>
      ${itemsList}
    </tbody>
  </table>

  <div class="total">
    Total Amount Paid: <span class="gold">₹${parseFloat(order.total_amount).toLocaleString('en-IN')}</span>
  </div>

  <div style="margin-top: 50px; padding-top: 20px; border-t: 1px solid #eee; text-align: center; font-size: 11px; color: #888;">
    Thank you for shopping with Lekya Specs • Included 1-Year Scratch Warranty • Lekya Group Official Invoice
  </div>

  <script>
    window.onload = function() { setTimeout(function() { window.print(); }, 400); };
  </script>
</body>
</html>`;

                            const blob = new Blob([fullHtml], { type: 'text/html;charset=utf-8' });
                            const url = URL.createObjectURL(blob);
                            const a = document.createElement('a');
                            a.href = url;
                            a.download = `LekyaSpecs_Invoice_INV-${String(order.id).padStart(6, '0')}.html`;
                            document.body.appendChild(a);
                            a.click();
                            document.body.removeChild(a);
                            URL.revokeObjectURL(url);
                          }}
                          className="bg-amber-500 hover:bg-amber-600 text-black font-bold text-[11px] px-3.5 py-1.5 rounded flex items-center gap-1.5 transition-all shadow-sm"
                        >
                          <Download className="w-3.5 h-3.5" /> Download Tax Invoice
                        </button>
                      </div>
                    </div>

                  </div>
                ))}
              </div>
            )}

          </div>

        </div>

      </div>
      {/* Social Auth Account Selector Modal — dashboard view (logged in user) */}
      {socialModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="bg-[#12021c] border border-[#FAAE62]/40 rounded-2xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative text-left">
            <button
              type="button"
              onClick={() => setSocialModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white p-1.5 rounded-full hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex flex-col items-center text-center mb-6">
              {socialModalProvider === 'google' ? (
                <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center shadow-lg mb-3">
                  <svg className="w-8 h-8" viewBox="0 0 24 24">
                    <path
                      fill="#EA4335"
                      d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.114-5.137 4.114-3.478 0-6.3-2.823-6.3-6.3 0-3.478 2.822-6.3 6.3-6.3 1.63 0 3.106.625 4.225 1.637l3.136-3.136C19.123 2.502 15.86 1 12.24 1 6.033 1 1 6.033 1 12.24s5.033 11.24 11.24 11.24c5.895 0 10.865-4.224 10.865-11.24 0-.668-.057-1.314-.165-1.955H12.24z"
                    />
                  </svg>
                </div>
              ) : (
                <div className="w-14 h-14 rounded-full bg-[#1877F2] flex items-center justify-center shadow-lg mb-3">
                  <svg className="w-8 h-8 fill-white" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                </div>
              )}

              <h3 className="font-serif text-xl font-bold text-white">
                Sign in with {socialModalProvider === 'google' ? 'Google' : 'Facebook'}
              </h3>
              <p className="text-xs text-[#9B7EA8] mt-1">
                Choose an account to continue to <strong className="text-white">Lekya Specs</strong>
              </p>
            </div>

            {socialError && (
              <div className="mb-4 bg-red-950/60 border border-red-800 text-red-300 text-xs p-3 rounded-lg flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{socialError}</span>
              </div>
            )}

            <form onSubmit={handleSocialSubmit} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-300 mb-1.5">
                  Your Full Name
                </label>
                <input
                  type="text"
                  required
                  value={socialName}
                  onChange={(e) => setSocialName(e.target.value)}
                  placeholder="e.g. Adil Malik"
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-[#FAAE62]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-300 mb-1.5">
                  {socialModalProvider === 'google' ? 'Google Email Address' : 'Facebook Email Address'}
                </label>
                <input
                  type="email"
                  required
                  value={socialEmail}
                  onChange={(e) => setSocialEmail(e.target.value)}
                  placeholder={socialModalProvider === 'google' ? 'yourname@gmail.com' : 'yourname@facebook.com'}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-[#FAAE62]"
                />
              </div>

              <button
                type="submit"
                disabled={socialLoading}
                className={`w-full py-3.5 rounded-lg font-bold text-xs uppercase tracking-wider text-white transition-all shadow-lg flex items-center justify-center gap-2 ${
                  socialModalProvider === 'google'
                    ? 'bg-[#1a73e8] hover:bg-[#1557b0]'
                    : 'bg-[#1877F2] hover:bg-[#1464cc]'
                }`}
              >
                {socialLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  `Continue as ${socialName ? socialName.split(' ')[0] : (socialModalProvider === 'google' ? 'Google User' : 'Facebook User')}`
                )}
              </button>
            </form>

            <div className="mt-5 text-[10px] text-gray-400 text-center leading-relaxed">
              To continue, {socialModalProvider === 'google' ? 'Google' : 'Facebook'} will share your name and email address with Lekya Specs. See our <a href="/privacy" className="text-[#FAAE62] hover:underline">Privacy Policy</a>.
            </div>
          </div>
        </div>
      )}

      {/* --- Return & Exchange Request Modal --- */}
      {showReturnModal && selectedReturnOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-lg bg-[#0D0016] border border-[#FAAE62]/50 rounded-3xl p-6 sm:p-8 shadow-[0_0_50px_rgba(250,174,98,0.25)] text-left overflow-hidden">
            
            <button
              onClick={() => setShowReturnModal(false)}
              className="absolute top-5 right-5 text-gray-400 hover:text-white p-1 rounded-full bg-white/5 border border-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FAAE62]/10 border border-[#FAAE62]/30 text-[#FAAE62] text-[10px] font-bold uppercase tracking-wider mb-2">
              <RefreshCw className="w-3.5 h-3.5" /> 7-Day Easy Self-Service
            </div>

            <h3 className="text-2xl font-serif font-bold text-white mb-1">
              Return &amp; Exchange Portal
            </h3>
            <p className="text-xs text-[#9B7EA8] mb-5">
              Order Reference: <strong className="text-white font-mono">#{selectedReturnOrder.id}</strong> (Total Paid: ₹{parseFloat(selectedReturnOrder.total_amount).toLocaleString('en-IN')})
            </p>

            <form onSubmit={handleSubmitReturn} className="space-y-4">
              {/* Option Type */}
              <div>
                <label className="block text-xs font-bold text-[#FAAE62] uppercase tracking-wider mb-2">Select Resolution Type</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setReturnType('exchange')}
                    className={`p-3.5 rounded-xl border text-left transition-all ${
                      returnType === 'exchange'
                        ? 'border-[#FAAE62] bg-[#FAAE62]/15 text-white shadow-lg'
                        : 'border-white/10 bg-white/5 text-gray-400 hover:border-white/30'
                    }`}
                  >
                    <div className="font-bold text-sm flex items-center gap-1.5 text-[#FAAE62] mb-1">
                      <span>🔄</span> Frame Exchange
                    </div>
                    <span className="text-[10px] text-[#9B7EA8] block leading-tight">Switch frame size, color, or model. Free doorstep swap.</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setReturnType('refund')}
                    className={`p-3.5 rounded-xl border text-left transition-all ${
                      returnType === 'refund'
                        ? 'border-[#FAAE62] bg-[#FAAE62]/15 text-white shadow-lg'
                        : 'border-white/10 bg-white/5 text-gray-400 hover:border-white/30'
                    }`}
                  >
                    <div className="font-bold text-sm flex items-center gap-1.5 text-[#FAAE62] mb-1">
                      <span>↩️</span> Full Refund
                    </div>
                    <span className="text-[10px] text-[#9B7EA8] block leading-tight">Refund to original payment method or Lekya Store Credit.</span>
                  </button>
                </div>
              </div>

              {/* Reason selection */}
              <div>
                <label className="block text-xs font-bold text-[#FAAE62] uppercase tracking-wider mb-1.5">Reason for Request</label>
                <select
                  value={returnReason}
                  onChange={(e) => setReturnReason(e.target.value)}
                  className="w-full bg-[#1A0024] border border-[#FAAE62]/40 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#FAAE62]"
                >
                  <option value="Size / Fit issue (Too tight / Too loose)">Size / Fit issue (Too tight / Too loose)</option>
                  <option value="Disliked style / Frame shape on face">Disliked style / Frame shape on face</option>
                  <option value="Prescription mismatch / Lens discomfort">Prescription mismatch / Lens discomfort</option>
                  <option value="Frame damaged / Transit damage">Frame damaged / Transit damage</option>
                  <option value="Incorrect product received">Incorrect product received</option>
                  <option value="Other / Changed mind">Other / Changed mind</option>
                </select>
              </div>

              {/* Additional Comments */}
              <div>
                <label className="block text-xs font-bold text-[#FAAE62] uppercase tracking-wider mb-1.5">Additional Details (Optional)</label>
                <textarea
                  rows="3"
                  value={returnComments}
                  onChange={(e) => setReturnComments(e.target.value)}
                  placeholder="Describe your preference (e.g., 'Please send size Medium instead' or specific lens instructions)..."
                  className="w-full bg-[#1A0024] border border-white/15 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-[#FAAE62]"
                />
              </div>

              {/* Trust Guarantee Box */}
              <div className="bg-[#1A0024]/80 border border-[#25D366]/30 rounded-xl p-3 text-[11px] text-[#9B7EA8] leading-relaxed flex items-start gap-2.5">
                <span className="text-base">🚚</span>
                <div>
                  <strong className="text-[#25D366] block mb-0.5">Free Doorstep Reverse Pickup</strong>
                  Parcel Uncle Express courier will collect the package from your address. Zero return shipping fees.
                </div>
              </div>

              {returnError && (
                <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs font-semibold">
                  {returnError}
                </div>
              )}

              <button
                type="submit"
                disabled={returnSubmitting}
                className="w-full bg-gradient-to-r from-[#D4893F] to-[#FAAE62] hover:scale-105 active:scale-95 text-[#0D0016] font-black text-xs uppercase tracking-widest py-3.5 rounded-xl shadow-lg shadow-[#FAAE62]/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {returnSubmitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  `Submit ${returnType === 'exchange' ? 'Exchange' : 'Return'} Request &rarr;`
                )}
              </button>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}
