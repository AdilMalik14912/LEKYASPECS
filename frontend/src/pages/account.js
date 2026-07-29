// Lekya Specs - Dedicated Customer Portal Hub v2.0 - Build 2026.07.27
const React = require('react');
const { useState, useEffect, useRef } = React;
const Link = require('next/link').default;
const { useRouter } = require('next/router');
const { useAuth, useToast, useWishlist, useCart } = require('./_app');
const VisionEyeLogo = require('../components/VisionEyeLogo');
const { 
  User, Mail, Calendar, Eye, ShoppingBag, Landmark, ArrowRight, Star, RefreshCw, 
  Truck, Package, CheckCircle2, XCircle, Edit2, Save, X, Copy, Award, Gift, 
  Phone, Key, Navigation, Download, Loader2, AlertCircle, Check, Sparkles, 
  Heart, MapPin, Shield, FileText, LayoutDashboard, LogOut, Store, Search, ChevronRight
} = require('lucide-react');

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

  // Wishlist and Cart context safe access
  const wishlistContext = useWishlist ? useWishlist() : null;
  const wishlist = wishlistContext ? wishlistContext.wishlist || [] : [];
  const toggleWishlist = wishlistContext ? wishlistContext.toggleWishlist : () => {};

  const cartContext = useCart ? useCart() : null;
  const addToCart = cartContext ? cartContext.addToCart : () => {};

  const loyaltyCount = useCountUp(user ? user.loyalty_points || 0 : 0);

  // Portal Navigation Tab State
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'orders' | 'returns' | 'prescription' | 'wishlist' | 'rewards' | 'addresses' | 'security'
  const [orderFilter, setOrderFilter] = useState('all');

  // Handle URL errors & query tabs
  useEffect(() => {
    if (!router.isReady) return;
    const { error, tab } = router.query;
    if (error) {
      if (error === 'google_failed') {
        showToast('Google Sign-In failed. Please try again.', 'error');
      } else if (error === 'facebook_failed') {
        showToast('Facebook Sign-In failed. Please try again.', 'error');
      } else {
        showToast('Authentication failed. Please try again.', 'error');
      }
      router.replace('/account', undefined, { shallow: true });
    }
    if (tab && ['overview', 'orders', 'returns', 'prescription', 'wishlist', 'rewards', 'addresses', 'security'].includes(tab)) {
      setActiveTab(tab);
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
  const [registrationStep, setRegistrationStep] = useState(1);
  const [otpCode, setOtpCode] = useState('');
  const [otpTarget, setOtpTarget] = useState({ email: '', phone: '' });
  const [showOtpSuccessModal, setShowOtpSuccessModal] = useState(false);
  const [otpSuccessData, setOtpSuccessData] = useState(null);
  const [otpErrorShake, setOtpErrorShake] = useState(false);

  // Social OAuth Selector Modal State
  const [socialModalOpen, setSocialModalOpen] = useState(false);
  const [socialModalProvider, setSocialModalProvider] = useState('google');
  const [socialEmail, setSocialEmail] = useState('');
  const [socialName, setSocialName] = useState('');
  const [socialLoading, setSocialLoading] = useState(false);
  const [socialError, setSocialError] = useState('');

  // Check URL query for social modal
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

  // Client-side Canvas Captcha
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
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, W, H);
    for (let i = 0; i < 40; i++) {
      ctx.beginPath();
      ctx.arc(Math.random()*W, Math.random()*H, Math.random()*2+0.5, 0, 2*Math.PI);
      ctx.fillStyle = `rgba(250,174,98,${(Math.random()*0.25+0.05).toFixed(2)})`;
      ctx.fill();
    }
    for (let i = 0; i < 5; i++) {
      ctx.beginPath();
      ctx.moveTo(Math.random()*W*0.3, Math.random()*H);
      ctx.lineTo(Math.random()*W*0.5+W*0.5, Math.random()*H);
      ctx.strokeStyle = `rgba(250,174,98,${(Math.random()*0.3+0.1).toFixed(2)})`;
      ctx.lineWidth = Math.random()*1.5+0.5;
      ctx.stroke();
    }
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
    setTimeout(() => drawCaptcha(code), 30);
  };

  useEffect(() => {
    if (!user && (isLoginTab || registrationStep === 1)) {
      refreshCaptcha();
    }
  }, [user, isLoginTab, registrationStep]);

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
  const [returnType, setReturnType] = useState('exchange');
  const [returnReason, setReturnReason] = useState('Size / Fit issue (Too tight / Too loose)');
  const [returnComments, setReturnComments] = useState('');
  const [returnSubmitting, setReturnSubmitting] = useState(false);
  const [returnError, setReturnError] = useState('');

  // Address State
  const [addressData, setAddressData] = useState({
    street: '102-J Hari Nagar Ashram',
    city: 'New Delhi',
    state: 'Delhi',
    pincode: '110014',
    landmark: 'Near Ashram Chowk'
  });
  const [isEditingAddress, setIsEditingAddress] = useState(false);

  // Prescription Locker State
  const [prescription, setPrescription] = useState({
    rightSph: '-1.25', rightCyl: '-0.50', rightAxis: '90',
    leftSph: '-1.50', leftCyl: '-0.25', leftAxis: '180',
    pd: '63'
  });
  const [isEditingPrescription, setIsEditingPrescription] = useState(false);

  // Password Security State
  const [passData, setPassData] = useState({ current: '', newPass: '', confirmPass: '' });
  const [passLoading, setPassLoading] = useState(false);
  const [passError, setPassError] = useState('');

  // Fetch Order History & Return Requests if logged in
  useEffect(() => {
    if (!token) return;
    
    setOrdersLoading(true);
    Promise.all([
      fetch(`${API_BASE}/api/orders/history`, { headers: { 'Authorization': `Bearer ${token}` } }).then(r => r.ok ? r.json() : []),
      fetch(`${API_BASE}/api/returns/my-returns`, { headers: { 'Authorization': `Bearer ${token}` } }).then(r => r.ok ? r.json() : [])
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

  const handleTabSwitch = (toLogin) => {
    setIsLoginTab(toLogin);
    setFormError('');
    setEmail('');
    setPassword('');
    setName('');
    setPhone('');
    setCaptchaInput('');
    setRegistrationStep(1);
    setOtpCode('');
    refreshCaptcha();
  };

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
          try { data = await res.json(); } catch (_) {}
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
      if (registrationStep === 1) {
        if (!email && !phone) {
          setFormLoading(false);
          setFormError('Either Email or Phone Number is required for registration.');
          return;
        }
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
            password
          })
        })
          .then(async res => {
            let data = {};
            try { data = await res.json(); } catch (_) {}
            if (!res.ok) throw new Error(data.message || 'Registration initiation failed. Please try again.');
            return data;
          })
          .then(data => {
            setFormLoading(false);
            showToast(data.message || 'OTP verification code sent! Please check your email inbox.', 'success');
            setOtpTarget({ email: data.email || email, phone: data.phone || phone });
            setRegistrationStep(2);
            setOtpCode('');
          })
          .catch(err => {
            console.error(err);
            setFormLoading(false);
            setFormError(err.message || 'Registration initiation failed.');
            refreshCaptcha();
          });
      } else {
        if (!otpCode || otpCode.length !== 6) {
          setFormLoading(false);
          setFormError('Please enter the full 6-digit verification code.');
          setOtpErrorShake(true);
          setTimeout(() => setOtpErrorShake(false), 800);
          return;
        }

        fetch(`${API_BASE}/api/auth/register/verify`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            email: otpTarget.email,
            phone: otpTarget.phone,
            otp: otpCode 
          })
        })
          .then(async res => {
            let data = {};
            try { data = await res.json(); } catch (_) {}
            if (!res.ok) throw new Error(data.message || 'Invalid or expired OTP code.');
            return data;
          })
          .then(data => {
            setFormLoading(false);
            if (data && data.token) {
              setOtpSuccessData(data);
              setShowOtpSuccessModal(true);
            }
          })
          .catch(err => {
            console.error(err);
            setFormLoading(false);
            setFormError(err.message || 'OTP verification failed.');
            setOtpErrorShake(true);
            setTimeout(() => setOtpErrorShake(false), 800);
          });
      }
    }
  };

  // --- RENDERING: Unauthenticated (Login / Registration) ---
  if (!user) {
    return (
      <>
      <div className="min-h-screen bg-premium-black py-16 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
        <div className="max-w-md w-full bg-white border border-premium-border rounded p-8 shadow-xl">
          
          {/* Header tabs */}
          <div className="flex border-b border-premium-border mb-8">
            <button
              onClick={() => handleTabSwitch(true)}
              className={`flex-1 pb-4 text-sm font-semibold uppercase tracking-wider transition-all border-b-2 ${
                isLoginTab ? 'border-premium-accent text-premium-accent' : 'border-transparent text-premium-gray hover:text-premium-dark'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => handleTabSwitch(false)}
              className={`flex-1 pb-4 text-sm font-semibold uppercase tracking-wider transition-all border-b-2 ${
                !isLoginTab ? 'border-premium-accent text-premium-accent' : 'border-transparent text-premium-gray hover:text-premium-dark'
              }`}
            >
              Register
            </button>
          </div>

          <h2 className="font-serif text-2xl font-bold text-premium-black text-center mb-6">
            {isLoginTab ? 'Welcome Back to lekya.in' : 'Create Customer Account'}
          </h2>

          <form noValidate onSubmit={handleAuthSubmit} className="space-y-4">
            {isLoginTab ? (
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
              <>
                <div>
                  <label className="block text-xs uppercase tracking-wider text-premium-gray font-semibold mb-2">Full Name</label>
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
                  <label className="block text-xs uppercase tracking-wider text-premium-gray font-semibold mb-2">Email Address</label>
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
                  <label className="block text-xs uppercase tracking-wider text-premium-gray font-semibold mb-2">Phone Number</label>
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
              <>
                <div className="bg-premium-light border border-premium-border rounded p-4 text-center space-y-2">
                  <p className="text-xs text-premium-dark font-medium">
                    We've sent a 6-digit OTP code to:
                  </p>
                  <strong className="text-xs text-premium-accent block font-mono">
                    {otpTarget.email && !otpTarget.email.startsWith('phone_') ? otpTarget.email : otpTarget.phone}
                  </strong>
                </div>

                <div className={otpErrorShake ? 'animate-shake' : ''}>
                  <label className="block text-xs uppercase tracking-wider text-premium-gray font-semibold mb-3 text-center">
                    Enter 6-Digit Verification Code
                  </label>
                  
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
                          className={`w-10 h-12 sm:w-12 sm:h-14 text-center font-mono font-bold text-lg sm:text-xl rounded-lg border transition-all duration-300 outline-none ${
                            digit
                              ? 'border-premium-accent bg-premium-accent/10 text-premium-accent shadow-[0_0_12px_rgba(250,174,98,0.3)] scale-105'
                              : 'border-premium-border bg-premium-light text-premium-dark focus:border-premium-accent focus:bg-white'
                          }`}
                        />
                      );
                    })}
                  </div>
                </div>
              </>
            )}

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
                      className="p-3 border border-premium-border text-premium-accent hover:border-premium-accent rounded bg-white transition-colors"
                      title="Refresh Code"
                    >
                      <RefreshCw className="w-4 h-4" />
                    </button>
                  </div>
                  <input
                    type="text"
                    value={captchaInput}
                    onChange={(e) => setCaptchaInput(e.target.value.toUpperCase())}
                    placeholder="CODE"
                    className="w-full sm:flex-grow bg-white text-sm border border-premium-border rounded px-3 py-3 focus:outline-none focus:border-premium-accent text-premium-dark font-mono font-bold uppercase text-center tracking-widest"
                    maxLength="5"
                  />
                </div>
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
                  ? 'Sign In to Portal' 
                  : registrationStep === 1 
                    ? 'Get Verification Code' 
                    : 'Verify & Access Panel'}
            </button>
          </form>

        </div>
      </div>
      </>
    );
  }

  // --- RENDERING: Logged In (Full-Screen Customer Portal Panel — No Store Header/Footer) ---

  const filteredOrders = orders.filter(o => {
    if (orderFilter === 'in_progress') return o.status !== 'Delivered' && o.status !== 'Cancelled';
    if (orderFilter === 'delivered') return o.status === 'Delivered';
    if (orderFilter === 'cancelled') return o.status === 'Cancelled';
    return true;
  });

  return (
    <div className="min-h-screen bg-[#0D0016] text-[#FEF6EE]">
      
      {/* === 1. CUSTOMER PORTAL TOP BAR === */}
      <header className="sticky top-0 z-40 border-b border-[#4A1268]/70 bg-[#0D0016]/95 backdrop-blur-xl shadow-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            
            {/* Left: Brand Logo & Panel Title */}
            <div className="flex items-center gap-3">
              <Link href="/" className="hover:opacity-90 transition-opacity">
                <VisionEyeLogo size={36} showText={true} tagline="Customer Portal" showTagline={true} />
              </Link>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-3">
              {/* Rewards points badge */}
              <button 
                onClick={() => setActiveTab('rewards')}
                className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#FAAE62]/15 border border-[#FAAE62]/40 text-[#FAAE62] text-xs font-bold hover:bg-[#FAAE62]/30 transition-all cursor-pointer shadow-sm"
              >
                <Award className="w-4 h-4 text-[#FAAE62]" />
                <span>{loyaltyCount} PTS</span>
              </button>

              {/* BACK TO STORE BUTTON */}
              <Link 
                href="/shop" 
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#D4893F] to-[#FAAE62] text-[#0D0016] font-bold text-xs uppercase tracking-wider hover:scale-105 active:scale-95 transition-all shadow-md shadow-[#FAAE62]/20"
              >
                <Store className="w-4 h-4" />
                <span className="hidden sm:inline">Back to Store</span>
                <span className="sm:hidden">Store</span>
              </Link>

              {/* User Avatar */}
              <div className="hidden lg:flex items-center gap-2 pl-2 border-l border-white/10">
                <div className="w-9 h-9 rounded-full bg-[#FAAE62]/20 border border-[#FAAE62] flex items-center justify-center text-[#FAAE62] font-bold text-sm">
                  {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <div className="text-left leading-tight">
                  <span className="block text-xs font-bold text-white truncate max-w-[120px]">{user.name}</span>
                  <span className="block text-[10px] text-[#9B7EA8] uppercase font-semibold">VIP Client</span>
                </div>
              </div>

              {/* Logout Button */}
              <button
                onClick={logout}
                className="p-2.5 rounded-xl text-gray-400 hover:text-red-400 hover:bg-red-950/40 border border-transparent hover:border-red-800/60 transition-colors"
                title="Log Out of Customer Portal"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* === 2. MAIN PORTAL BODY === */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Welcome Header */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#1A0024] via-[#2A0038] to-[#0D0016] border border-[#FAAE62]/30 p-6 sm:p-8 mb-8 shadow-2xl">
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-[#FAAE62]/10 rounded-full blur-3xl pointer-events-none"></div>
          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FAAE62]/10 border border-[#FAAE62]/30 text-[#FAAE62] text-[10px] font-bold uppercase tracking-wider mb-2">
                <Sparkles className="w-3.5 h-3.5" /> VIP Customer Portal
              </div>
              <h1 className="text-2xl sm:text-3xl font-serif font-bold text-white">
                Welcome back, <span className="text-[#FAAE62]">{user.name}</span> 👋
              </h1>
              <p className="text-xs sm:text-sm text-[#9B7EA8] mt-1 max-w-xl">
                Your personal hub for tracking orders, managing prescriptions, requesting doorstep returns, and accessing exclusive member privileges.
              </p>
            </div>

            {/* Quick Stat Counter Cards */}
            <div className="flex flex-wrap gap-3">
              <button 
                onClick={() => setActiveTab('orders')}
                className="bg-white/5 border border-white/10 hover:border-[#FAAE62]/50 rounded-2xl px-4 py-3 text-center transition-all cursor-pointer"
              >
                <span className="block text-sm font-bold text-white font-mono">{orders.length}</span>
                <span className="text-[10px] text-[#9B7EA8] uppercase tracking-wider font-semibold">Orders</span>
              </button>
              <button 
                onClick={() => setActiveTab('wishlist')}
                className="bg-white/5 border border-white/10 hover:border-[#FAAE62]/50 rounded-2xl px-4 py-3 text-center transition-all cursor-pointer"
              >
                <span className="block text-sm font-bold text-white font-mono">{wishlist.length}</span>
                <span className="text-[10px] text-[#9B7EA8] uppercase tracking-wider font-semibold">Saved</span>
              </button>
              <button 
                onClick={() => setActiveTab('rewards')}
                className="bg-[#FAAE62]/15 border border-[#FAAE62]/40 rounded-2xl px-4 py-3 text-center transition-all cursor-pointer"
              >
                <span className="block text-sm font-bold text-[#FAAE62] font-mono">{loyaltyCount}</span>
                <span className="text-[10px] text-[#FAAE62] uppercase tracking-wider font-semibold">Points</span>
              </button>
            </div>
          </div>
        </div>

        {/* Portal Grid: Left Sidebar Navigation + Right Tab Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* SIDEBAR NAVIGATION */}
          <div className="lg:col-span-1 space-y-2">
            {[
              { id: 'overview', label: 'Dashboard Overview', icon: LayoutDashboard },
              { id: 'orders', label: 'My Orders & Tracking', icon: Package, badge: orders.length },
              { id: 'returns', label: 'Returns & Refunds', icon: RefreshCw, badge: userReturns.length },
              { id: 'prescription', label: 'Prescription Locker', icon: Eye },
              { id: 'wishlist', label: 'Saved Wishlist', icon: Heart, badge: wishlist.length },
              { id: 'rewards', label: 'Rewards & Offers', icon: Award, badge: `${loyaltyCount} pts` },
              { id: 'addresses', label: 'Address Book', icon: MapPin },
              { id: 'security', label: 'Account & Security', icon: Shield },
            ].map(tab => {
              const TabIcon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center justify-between p-3.5 rounded-2xl text-xs font-bold transition-all text-left ${
                    isActive
                      ? 'bg-gradient-to-r from-[#7B22A8]/60 to-[#3E0856]/60 border border-[#FAAE62]/70 text-white shadow-lg shadow-[#FAAE62]/10'
                      : 'bg-[#1A0024]/40 border border-white/5 text-[#9B7EA8] hover:text-white hover:bg-[#1A0024] hover:border-white/15'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <TabIcon className={`w-4 h-4 ${isActive ? 'text-[#FAAE62]' : 'text-gray-400'}`} />
                    <span>{tab.label}</span>
                  </div>
                  {tab.badge !== undefined && tab.badge !== 0 && (
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold ${
                      isActive ? 'bg-[#FAAE62] text-[#0D0016]' : 'bg-white/10 text-gray-300'
                    }`}>
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}

            {/* Quick Link to Shop */}
            <div className="pt-4 border-t border-white/10">
              <Link
                href="/shop"
                className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-gradient-to-r from-[#D4893F]/20 to-[#FAAE62]/20 border border-[#FAAE62]/40 text-[#FAAE62] hover:bg-[#FAAE62]/30 text-xs font-bold transition-all"
              >
                <div className="flex items-center gap-2">
                  <Store className="w-4 h-4" />
                  <span>Browse Eyewear Shop</span>
                </div>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* MAIN TAB CONTENT AREA */}
          <div className="lg:col-span-3">
            
            {/* === TAB 1: OVERVIEW === */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                
                {/* 4 Stat Overview Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="p-5 rounded-2xl bg-[#1A0024] border border-white/10">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-[10px] text-[#9B7EA8] uppercase font-bold tracking-wider">Total Orders</span>
                      <Package className="w-4 h-4 text-[#FAAE62]" />
                    </div>
                    <div className="text-2xl font-bold text-white font-mono">{orders.length}</div>
                    <span className="text-[10px] text-emerald-400 mt-1 block">Lifetime Eyewear Purchases</span>
                  </div>

                  <div className="p-5 rounded-2xl bg-[#1A0024] border border-white/10">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-[10px] text-[#9B7EA8] uppercase font-bold tracking-wider">Active Shipments</span>
                      <Truck className="w-4 h-4 text-[#FAAE62]" />
                    </div>
                    <div className="text-2xl font-bold text-white font-mono">
                      {orders.filter(o => o.status !== 'Delivered' && o.status !== 'Cancelled').length}
                    </div>
                    <span className="text-[10px] text-[#FAAE62] mt-1 block">Parcel Uncle Tracking Active</span>
                  </div>

                  <div className="p-5 rounded-2xl bg-[#1A0024] border border-white/10">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-[10px] text-[#9B7EA8] uppercase font-bold tracking-wider">Rewards Balance</span>
                      <Award className="w-4 h-4 text-[#FAAE62]" />
                    </div>
                    <div className="text-2xl font-bold text-[#FAAE62] font-mono">{loyaltyCount} pts</div>
                    <span className="text-[10px] text-gray-400 mt-1 block">₹{(loyaltyCount * 0.5).toFixed(0)} Redeemable Value</span>
                  </div>

                  <div className="p-5 rounded-2xl bg-[#1A0024] border border-white/10">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-[10px] text-[#9B7EA8] uppercase font-bold tracking-wider">Face Shape AI</span>
                      <Landmark className="w-4 h-4 text-[#FAAE62]" />
                    </div>
                    <div className="text-lg font-bold text-white uppercase truncate">
                      {user.face_shape || 'Not Scanned'}
                    </div>
                    <span className="text-[10px] text-[#FAAE62] mt-1 block">3D Landmark Profile</span>
                  </div>
                </div>

                {/* AI Face Shape Recommendation Card */}
                <div className="p-6 rounded-3xl bg-[#1A0024] border border-[#FAAE62]/30 flex flex-col md:flex-row items-center justify-between gap-6">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-[#FAAE62]/15 border border-[#FAAE62]/40 flex items-center justify-center text-[#FAAE62] shrink-0">
                      <Eye className="w-7 h-7" />
                    </div>
                    <div>
                      <h3 className="font-serif text-lg font-bold text-white">AI Face Shape Suggestion Profile</h3>
                      <p className="text-xs text-[#9B7EA8] mt-0.5">
                        {user.face_shape 
                          ? `Your detected face shape is ${user.face_shape.toUpperCase()}. We have selected frames that complement your jawline.` 
                          : 'Scan your face in 3 seconds using your webcam to unlock tailor-made optical frame recommendations.'}
                      </p>
                    </div>
                  </div>
                  <Link 
                    href={user.face_shape ? `/shop?face_shape=${user.face_shape}` : '/face-shape'}
                    className="shrink-0 px-5 py-3 rounded-xl bg-gradient-to-r from-[#D4893F] to-[#FAAE62] text-[#0D0016] font-bold text-xs uppercase tracking-wider hover:scale-105 transition-all"
                  >
                    {user.face_shape ? 'View Recommended Frames' : 'Scan Face Now'}
                  </Link>
                </div>

                {/* Recent Orders Overview */}
                <div className="p-6 rounded-3xl bg-[#1A0024] border border-white/10 space-y-4">
                  <div className="flex items-center justify-between border-b border-white/10 pb-4">
                    <h3 className="font-serif text-lg font-bold text-white flex items-center gap-2">
                      <Package className="w-5 h-5 text-[#FAAE62]" /> Recent Orders
                    </h3>
                    <button 
                      onClick={() => setActiveTab('orders')}
                      className="text-xs text-[#FAAE62] hover:underline font-bold"
                    >
                      View All Orders ({orders.length}) &rarr;
                    </button>
                  </div>

                  {orders.length === 0 ? (
                    <div className="text-center py-8 text-xs text-[#9B7EA8]">
                      No orders placed yet. Visit the catalog to explore luxury frames!
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {orders.slice(0, 2).map(order => (
                        <div key={order.id} className="p-4 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-between">
                          <div>
                            <span className="text-xs font-bold text-white">Order #{order.id}</span>
                            <span className="text-[10px] text-[#9B7EA8] block mt-0.5">
                              {new Date(order.created_at).toLocaleDateString('en-IN')} • ₹{parseFloat(order.total_amount).toLocaleString('en-IN')}
                            </span>
                          </div>
                          <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase ${
                            order.status === 'Delivered' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'bg-amber-950 text-amber-300 border border-amber-800'
                          }`}>
                            {order.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>
            )}

            {/* === TAB 2: MY ORDERS & TRACKING === */}
            {activeTab === 'orders' && (
              <div className="space-y-6">
                
                {/* Order Status Filters */}
                <div className="flex flex-wrap gap-2 pb-2 border-b border-white/10">
                  {[
                    { id: 'all', label: 'All Orders' },
                    { id: 'in_progress', label: 'In Transit / Active' },
                    { id: 'delivered', label: 'Delivered' },
                    { id: 'cancelled', label: 'Cancelled' },
                  ].map(f => (
                    <button
                      key={f.id}
                      onClick={() => setOrderFilter(f.id)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                        orderFilter === f.id
                          ? 'bg-[#FAAE62] text-[#0D0016] shadow-md'
                          : 'bg-white/5 border border-white/10 text-[#9B7EA8] hover:text-white'
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>

                {ordersLoading ? (
                  <div className="text-center py-12">
                    <Loader2 className="w-8 h-8 text-[#FAAE62] animate-spin mx-auto mb-2" />
                    <p className="text-xs text-[#9B7EA8]">Loading order history...</p>
                  </div>
                ) : filteredOrders.length === 0 ? (
                  <div className="text-center py-12 p-6 rounded-3xl bg-[#1A0024] border border-white/10">
                    <p className="text-xs text-[#9B7EA8] mb-4">No orders match the selected filter.</p>
                    <Link href="/shop" className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#D4893F] to-[#FAAE62] text-[#0D0016] font-bold text-xs uppercase tracking-wider inline-block">
                      Browse Shop Catalog
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {filteredOrders.map(order => (
                      <div key={order.id} className="p-6 rounded-3xl bg-[#1A0024] border border-white/10 space-y-4">
                        
                        {/* Order Header */}
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-white/10 pb-4 gap-2 text-xs">
                          <div>
                            <span className="text-white font-bold text-base">Order #{order.id}</span>
                            {order.tracking_id && (
                              <span className="text-[11px] text-[#9B7EA8] block mt-0.5">
                                AWB / Tracking: <Link href={`/track?id=${order.tracking_id}`} className="text-[#FAAE62] hover:underline font-mono font-bold">{order.tracking_id}</Link>
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-xs text-[#9B7EA8]">
                              {new Date(order.created_at).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })}
                            </span>
                            <span className={`font-bold px-3 py-1 rounded-full uppercase text-[10px] ${
                              order.status === 'Delivered' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' :
                              order.status === 'Cancelled' ? 'bg-red-950 text-red-300 border border-red-800' :
                              'bg-amber-950 text-amber-300 border border-amber-800'
                            }`}>
                              {order.status}
                            </span>
                          </div>
                        </div>

                        {/* Order Progress Stepper */}
                        {order.status !== 'Cancelled' && (
                          <div className="overflow-x-auto pb-2">
                            <div className="flex items-center min-w-[480px]">
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
                                    <div className="flex flex-col items-center gap-1 flex-shrink-0">
                                      <div className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${
                                        isActive ? 'bg-[#FAAE62] text-[#0D0016]' : 'bg-white/10 text-gray-500'
                                      }`}>
                                        <StepIcon className="w-3.5 h-3.5" />
                                      </div>
                                      <span className={`text-[9px] font-bold uppercase tracking-wider ${
                                        isActive ? 'text-white' : 'text-gray-500'
                                      }`}>{step.label}</span>
                                    </div>
                                    {idx < arr.length - 1 && (
                                      <div className={`flex-grow h-0.5 mx-1 rounded transition-all ${
                                        arr[idx + 1].statuses.includes(order.status) ? 'bg-[#FAAE62]' : 'bg-white/10'
                                      }`} />
                                    )}
                                  </React.Fragment>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        {/* Delivery OTP Badge */}
                        {order.status !== 'Cancelled' && order.delivery_otp && (
                          <div className="p-3.5 rounded-2xl bg-[#FAAE62]/10 border border-[#FAAE62]/30 flex items-center justify-between">
                            <div>
                              <span className="block text-[10px] text-[#FAAE62] uppercase font-bold tracking-wider">Delivery Verification Code</span>
                              <span className="text-[10px] text-[#9B7EA8]">Share with delivery agent upon arrival.</span>
                            </div>
                            <span className="text-xl font-bold font-mono text-[#FAAE62] bg-[#0D0016] border border-[#FAAE62]/50 rounded-xl px-4 py-1">
                              {order.delivery_otp}
                            </span>
                          </div>
                        )}

                        {/* Order Items */}
                        <div className="space-y-2 pt-2 border-t border-white/5">
                          {order.items && order.items.map(item => (
                            <div key={item.id} className="flex justify-between items-center text-xs">
                              <div className="flex items-center gap-3">
                                {item.image && (
                                  <img src={item.image} alt={item.name} className="w-8 h-8 object-cover rounded-lg border border-white/10" />
                                )}
                                <span className="text-white font-bold">{item.name} <span className="text-[#9B7EA8] font-normal">x{item.quantity}</span></span>
                              </div>
                              <span className="text-[#FAAE62] font-bold font-mono">₹{((parseFloat(item.price) || 0) * (parseInt(item.quantity) || 1)).toLocaleString('en-IN')}</span>
                            </div>
                          ))}
                        </div>

                        {/* Footer Controls */}
                        <div className="flex flex-wrap justify-between items-center pt-3 border-t border-white/10 text-xs">
                          <div>
                            <span className="text-[#9B7EA8]">Total Paid: </span>
                            <strong className="text-[#FAAE62] text-sm font-mono">₹{parseFloat(order.total_amount).toLocaleString('en-IN')}</strong>
                          </div>
                          <div className="flex items-center gap-2">
                            {order.status !== 'Cancelled' && (
                              <button
                                onClick={() => handleOpenReturnModal(order)}
                                className="px-3 py-1.5 rounded-xl border border-[#FAAE62]/40 text-[#FAAE62] hover:bg-[#FAAE62]/20 font-bold text-[11px] flex items-center gap-1.5 transition-all"
                              >
                                <RefreshCw className="w-3.5 h-3.5" /> Return / Exchange
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
  <title>Tax Invoice #${order.id} - lekya.in</title>
  <style>
    body { font-family: sans-serif; color: #1a1a1a; padding: 40px; margin: 0; background: #fff; }
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
      <div class="brand">lekya<span class="gold">.in</span></div>
      <p style="font-size:12px; color:#666; margin:4px 0 0;">Official Tax Invoice & Warranty</p>
    </div>
    <div style="text-align:right;">
      <h2 style="margin:0; font-size:20px;">INVOICE</h2>
      <p style="margin:4px 0 0; font-size:12px; color:#555;">Invoice #: <strong>INV-${String(order.id).padStart(6, '0')}</strong></p>
      <p style="margin:2px 0 0; font-size:12px; color:#555;">Date: ${new Date(order.created_at).toLocaleDateString('en-IN')}</p>
    </div>
  </div>
  <table>
    <thead>
      <tr><th>Item Description</th><th style="text-align:center;">Qty</th><th style="text-align:right;">Unit Price</th><th style="text-align:right;">Total</th></tr>
    </thead>
    <tbody>${itemsList}</tbody>
  </table>
  <div class="total">Total Amount Paid: <span class="gold">₹${parseFloat(order.total_amount).toLocaleString('en-IN')}</span></div>
  <script>window.onload = function() { setTimeout(function() { window.print(); }, 400); };</script>
</body>
</html>`;
                                const blob = new Blob([fullHtml], { type: 'text/html;charset=utf-8' });
                                const url = URL.createObjectURL(blob);
                                const a = document.createElement('a');
                                a.href = url;
                                a.download = `lekya.in_Invoice_INV-${String(order.id).padStart(6, '0')}.html`;
                                document.body.appendChild(a);
                                a.click();
                                document.body.removeChild(a);
                                URL.revokeObjectURL(url);
                              }}
                              className="px-3 py-1.5 rounded-xl bg-[#FAAE62] text-[#0D0016] font-bold text-[11px] flex items-center gap-1.5 hover:bg-[#D4893F] transition-all"
                            >
                              <Download className="w-3.5 h-3.5" /> Tax Invoice
                            </button>
                          </div>
                        </div>

                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* === TAB 3: RETURNS & REFUNDS === */}
            {activeTab === 'returns' && (
              <div className="space-y-6">
                <div className="p-6 rounded-3xl bg-[#1A0024] border border-[#FAAE62]/30 flex items-center justify-between">
                  <div>
                    <h3 className="font-serif text-lg font-bold text-white">7-Day Doorstep Return &amp; Exchange Guarantee</h3>
                    <p className="text-xs text-[#9B7EA8] mt-0.5">
                      Parcel Uncle Express will pick up your package from your doorstep with zero return shipping fee.
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveTab('orders')}
                    className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#D4893F] to-[#FAAE62] text-[#0D0016] font-bold text-xs uppercase"
                  >
                    Select Order to Return
                  </button>
                </div>

                {userReturns.length === 0 ? (
                  <div className="text-center py-12 p-6 rounded-3xl bg-[#1A0024] border border-white/10">
                    <p className="text-xs text-[#9B7EA8]">You have no active return or exchange requests.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {userReturns.map(ret => (
                      <div key={ret.id} className="p-5 rounded-2xl bg-[#1A0024] border border-white/10 space-y-2">
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-white font-bold">Request #{ret.id} (Order #{ret.order_id})</span>
                          <span className="text-[10px] font-bold uppercase px-2.5 py-1 rounded-full bg-amber-950 text-amber-300 border border-amber-800">
                            {ret.status || 'Pending Review'}
                          </span>
                        </div>
                        <p className="text-xs text-[#9B7EA8]">Reason: {ret.reason}</p>
                        {ret.comments && <p className="text-[11px] text-gray-400 italic">"{ret.comments}"</p>}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* === TAB 4: PRESCRIPTION LOCKER === */}
            {activeTab === 'prescription' && (
              <div className="space-y-6">
                <div className="p-6 rounded-3xl bg-[#1A0024] border border-white/10 space-y-4">
                  <div className="flex justify-between items-center border-b border-white/10 pb-4">
                    <div>
                      <h3 className="font-serif text-lg font-bold text-white flex items-center gap-2">
                        <Eye className="w-5 h-5 text-[#FAAE62]" /> Prescription Locker &amp; Refraction Data
                      </h3>
                      <p className="text-xs text-[#9B7EA8]">Stored lens power for seamless 1-click checkout.</p>
                    </div>
                    <button
                      onClick={() => setIsEditingPrescription(!isEditingPrescription)}
                      className="px-3.5 py-1.5 rounded-xl border border-[#FAAE62]/40 text-[#FAAE62] hover:bg-[#FAAE62]/20 font-bold text-xs"
                    >
                      {isEditingPrescription ? 'Save Locker' : 'Edit Lens Power'}
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    {/* Right Eye */}
                    <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3">
                      <span className="font-bold text-[#FAAE62] block">Right Eye (OD)</span>
                      <div className="grid grid-cols-3 gap-2 text-center">
                        <div>
                          <span className="text-[10px] text-[#9B7EA8] block">SPH</span>
                          <span className="font-mono font-bold text-white">{prescription.rightSph}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-[#9B7EA8] block">CYL</span>
                          <span className="font-mono font-bold text-white">{prescription.rightCyl}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-[#9B7EA8] block">AXIS</span>
                          <span className="font-mono font-bold text-white">{prescription.rightAxis}°</span>
                        </div>
                      </div>
                    </div>

                    {/* Left Eye */}
                    <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3">
                      <span className="font-bold text-[#FAAE62] block">Left Eye (OS)</span>
                      <div className="grid grid-cols-3 gap-2 text-center">
                        <div>
                          <span className="text-[10px] text-[#9B7EA8] block">SPH</span>
                          <span className="font-mono font-bold text-white">{prescription.leftSph}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-[#9B7EA8] block">CYL</span>
                          <span className="font-mono font-bold text-white">{prescription.leftCyl}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-[#9B7EA8] block">AXIS</span>
                          <span className="font-mono font-bold text-white">{prescription.leftAxis}°</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex justify-between items-center text-xs">
                    <span className="text-white font-bold">Pupillary Distance (PD):</span>
                    <span className="font-mono font-bold text-[#FAAE62]">{prescription.pd} mm</span>
                  </div>
                </div>
              </div>
            )}

            {/* === TAB 5: SAVED WISHLIST === */}
            {activeTab === 'wishlist' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center border-b border-white/10 pb-4">
                  <h3 className="font-serif text-lg font-bold text-white flex items-center gap-2">
                    <Heart className="w-5 h-5 text-red-500 fill-red-500" /> Saved Wishlist Frames ({wishlist.length})
                  </h3>
                  <Link href="/shop" className="text-xs text-[#FAAE62] font-bold hover:underline">
                    Browse All Catalog &rarr;
                  </Link>
                </div>

                {wishlist.length === 0 ? (
                  <div className="text-center py-12 p-6 rounded-3xl bg-[#1A0024] border border-white/10">
                    <Heart className="w-10 h-10 text-gray-600 mx-auto mb-2" />
                    <p className="text-xs text-[#9B7EA8] mb-4">Your wishlist is currently empty.</p>
                    <Link href="/shop" className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#D4893F] to-[#FAAE62] text-[#0D0016] font-bold text-xs uppercase">
                      Discover Frames
                    </Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {wishlist.map(item => (
                      <div key={item.id} className="p-4 rounded-2xl bg-[#1A0024] border border-white/10 space-y-3 relative group">
                        <img src={item.image} alt={item.name} className="w-full h-36 object-contain bg-black/20 rounded-xl" />
                        <div>
                          <h4 className="text-xs font-bold text-white truncate">{item.name}</h4>
                          <span className="text-[10px] text-[#FAAE62] font-mono font-bold">₹{parseFloat(item.price).toLocaleString('en-IN')}</span>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => { addToCart(item); showToast(`Added ${item.name} to Cart`); }}
                            className="flex-1 py-2 rounded-xl bg-[#FAAE62] text-[#0D0016] font-bold text-[11px] uppercase"
                          >
                            Add to Cart
                          </button>
                          <button
                            onClick={() => toggleWishlist(item)}
                            className="p-2 rounded-xl bg-white/5 border border-white/10 text-red-400 hover:bg-red-950/40"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* === TAB 6: REWARDS & OFFERS === */}
            {activeTab === 'rewards' && (
              <div className="space-y-6">
                <div className="p-6 rounded-3xl bg-[#1A0024] border border-[#FAAE62]/30 space-y-4">
                  <div className="flex justify-between items-center border-b border-white/10 pb-4">
                    <h3 className="font-serif text-lg font-bold text-white flex items-center gap-2">
                      <Award className="w-5 h-5 text-[#FAAE62]" /> Specs Rewards &amp; Referral Hub
                    </h3>
                    <span className="text-xs font-bold text-[#FAAE62] font-mono">{loyaltyCount} PTS</span>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-bold text-white mb-2">
                      <span>Tier Level: Bronze Member</span>
                      <span>Next Tier: 500 PTS</span>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-2.5 overflow-hidden">
                      <div className="bg-[#FAAE62] h-full transition-all duration-500" style={{ width: `${Math.min(100, (loyaltyCount / 500) * 100)}%` }} />
                    </div>
                  </div>

                  {/* Referral Link */}
                  <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                    <span className="text-xs font-bold text-[#FAAE62] block">Your Referral Link (Earn 100 PTS per friend)</span>
                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        readOnly 
                        value={user && typeof window !== 'undefined' ? `${window.location.origin}/account?ref=${user.referral_code || 'REF-USER'}` : ''}
                        className="flex-grow bg-[#0D0016] border border-white/10 rounded-xl px-3 py-2 text-xs text-gray-300 font-mono"
                      />
                      <button
                        onClick={handleCopyLink}
                        className="px-4 py-2 bg-[#FAAE62] text-[#0D0016] font-bold text-xs rounded-xl hover:bg-[#D4893F]"
                      >
                        {copied ? 'Copied!' : 'Copy'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* === TAB 7: ADDRESS BOOK === */}
            {activeTab === 'addresses' && (
              <div className="space-y-6">
                <div className="p-6 rounded-3xl bg-[#1A0024] border border-white/10 space-y-4">
                  <div className="flex justify-between items-center border-b border-white/10 pb-4">
                    <h3 className="font-serif text-lg font-bold text-white flex items-center gap-2">
                      <MapPin className="w-5 h-5 text-[#FAAE62]" /> Shipping Address Book
                    </h3>
                    <button 
                      onClick={() => setIsEditingAddress(!isEditingAddress)}
                      className="px-3.5 py-1.5 rounded-xl border border-[#FAAE62]/40 text-[#FAAE62] text-xs font-bold"
                    >
                      {isEditingAddress ? 'Save Address' : 'Edit Address'}
                    </button>
                  </div>

                  <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2 text-xs text-gray-300">
                    <strong className="text-white block text-sm">{user.name}</strong>
                    <p>{addressData.street}</p>
                    <p>{addressData.city}, {addressData.state} - {addressData.pincode}</p>
                    <span className="text-[10px] text-[#FAAE62] block font-bold mt-2">Primary Shipping Address</span>
                  </div>
                </div>
              </div>
            )}

            {/* === TAB 8: SECURITY & ACCOUNT === */}
            {activeTab === 'security' && (
              <div className="space-y-6">
                <div className="p-6 rounded-3xl bg-[#1A0024] border border-white/10 space-y-4">
                  <h3 className="font-serif text-lg font-bold text-white flex items-center gap-2 border-b border-white/10 pb-4">
                    <Shield className="w-5 h-5 text-[#FAAE62]" /> Profile &amp; Security Settings
                  </h3>

                  <div className="space-y-3 text-xs">
                    <div>
                      <label className="block text-[#9B7EA8] mb-1 font-bold">Full Name</label>
                      <input 
                        type="text" 
                        value={editedName} 
                        onChange={(e) => setEditedName(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-[#9B7EA8] mb-1 font-bold">Email Address</label>
                      <input 
                        type="text" 
                        disabled 
                        value={user.email} 
                        className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-2.5 text-gray-400 cursor-not-allowed"
                      />
                    </div>

                    <button 
                      onClick={handleSaveName}
                      className="px-5 py-2.5 rounded-xl bg-[#FAAE62] text-[#0D0016] font-bold text-xs uppercase"
                    >
                      Update Profile
                    </button>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>

      </main>

      {/* Return & Exchange Request Modal */}
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
              <div>
                <label className="block text-xs font-bold text-[#FAAE62] uppercase tracking-wider mb-2">Select Resolution Type</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setReturnType('exchange')}
                    className={`p-3.5 rounded-xl border text-left transition-all ${
                      returnType === 'exchange'
                        ? 'border-[#FAAE62] bg-[#FAAE62]/15 text-white shadow-lg'
                        : 'border-white/10 bg-white/5 text-gray-400'
                    }`}
                  >
                    <div className="font-bold text-sm flex items-center gap-1.5 text-[#FAAE62] mb-1">
                      <span>🔄</span> Frame Exchange
                    </div>
                    <span className="text-[10px] text-[#9B7EA8] block leading-tight">Switch frame size, color, or model.</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setReturnType('refund')}
                    className={`p-3.5 rounded-xl border text-left transition-all ${
                      returnType === 'refund'
                        ? 'border-[#FAAE62] bg-[#FAAE62]/15 text-white shadow-lg'
                        : 'border-white/10 bg-white/5 text-gray-400'
                    }`}
                  >
                    <div className="font-bold text-sm flex items-center gap-1.5 text-[#FAAE62] mb-1">
                      <span>↩️</span> Full Refund
                    </div>
                    <span className="text-[10px] text-[#9B7EA8] block leading-tight">Refund to payment method.</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#FAAE62] uppercase tracking-wider mb-1.5">Reason for Request</label>
                <select
                  value={returnReason}
                  onChange={(e) => setReturnReason(e.target.value)}
                  className="w-full bg-[#1A0024] border border-[#FAAE62]/40 rounded-xl px-4 py-3 text-sm text-white focus:outline-none"
                >
                  <option value="Size / Fit issue (Too tight / Too loose)">Size / Fit issue (Too tight / Too loose)</option>
                  <option value="Disliked style / Frame shape on face">Disliked style / Frame shape on face</option>
                  <option value="Prescription mismatch / Lens discomfort">Prescription mismatch / Lens discomfort</option>
                  <option value="Frame damaged / Transit damage">Frame damaged / Transit damage</option>
                  <option value="Incorrect product received">Incorrect product received</option>
                  <option value="Other / Changed mind">Other / Changed mind</option>
                </select>
              </div>

              {returnError && (
                <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs font-semibold">
                  {returnError}
                </div>
              )}

              <button
                type="submit"
                disabled={returnSubmitting}
                className="w-full bg-gradient-to-r from-[#D4893F] to-[#FAAE62] text-[#0D0016] font-black text-xs uppercase tracking-widest py-3.5 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2"
              >
                {returnSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : `Submit Request &rarr;`}
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
