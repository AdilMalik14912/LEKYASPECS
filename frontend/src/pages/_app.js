const React = require('react');
const { useState, useEffect, createContext, useContext } = React;
require('../styles/globals.css');
const Link = require('next/link').default;
const { useRouter } = require('next/router');
const Head = require('next/head').default;
const { ShoppingBag, Heart, User, LogOut, Menu, X, Check, ArrowRight, Search, XCircle, Info, ChevronDown, ExternalLink, Building2, Truck, Layers, Zap } = require('lucide-react');

// Contexts
const AuthContext = createContext(null);
const CartContext = createContext(null);
const WishlistContext = createContext(null);
const ToastContext = createContext(null);

export const useAuth = () => useContext(AuthContext);
export const useCart = () => useContext(CartContext);
export const useWishlist = () => useContext(WishlistContext);
export const useToast = () => useContext(ToastContext);

export default function App({ Component, pageProps }) {
  const router = useRouter();
  
  // 1. Auth State
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  // 2. Cart State
  const [cart, setCart] = useState([]);
  
  // 3. Wishlist State
  const [wishlist, setWishlist] = useState([]);

  // 4. Mobile Menu State
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // 5. Header Search State
  const [searchQuery, setSearchQuery] = useState('');

  // 6. Preloader and Route transitions State
  const [preloaderVisible, setPreloaderVisible] = useState(true);
  const [preloaderFade, setPreloaderFade] = useState(false);
  const [loadProgress, setLoadProgress] = useState(0);
  const [routeChanging, setRouteChanging] = useState(false);

  // 7. Toast State
  const [toast, setToast] = useState({ message: '', type: '', visible: false });
  const [toastTimeout, setToastTimeout] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type, visible: true });
    if (toastTimeout) clearTimeout(toastTimeout);
    const timeout = setTimeout(() => {
      setToast(prev => ({ ...prev, visible: false }));
    }, 3000);
    setToastTimeout(timeout);
  };

  // Load state from localStorage on mount
  useEffect(() => {
    try {
      const storedToken = localStorage.getItem('specs_token');
      const storedUser = localStorage.getItem('specs_user');
      const storedCart = localStorage.getItem('specs_cart');
      const storedWishlist = localStorage.getItem('specs_wishlist');

      if (storedToken && storedUser) {
        setToken(storedToken);
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);

        // Define API Base locally inside useEffect to match backend port resolving
        const apiBaseUrl = typeof window !== 'undefined'
          ? (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' ? 'http://localhost:5000' : '')
          : '';

        fetch(`${apiBaseUrl}/api/auth/profile`, {
          headers: { 'Authorization': `Bearer ${storedToken}` }
        })
          .then(res => {
            if (res.status === 401 || res.status === 403) {
              localStorage.removeItem('specs_token');
              localStorage.removeItem('specs_user');
              setToken(null);
              setUser(null);
              throw new Error('Token expired');
            }
            if (!res.ok) throw new Error('Profile fetch error');
            return res.json();
          })
          .then(freshUser => {
            const updatedUser = {
              ...parsedUser,
              name: freshUser.name || parsedUser.name,
              email: freshUser.email || parsedUser.email,
              face_shape: freshUser.face_shape,
              role: freshUser.role || 'user',
              loyalty_points: freshUser.loyalty_points || 0,
              referral_code: freshUser.referral_code
            };
            setUser(updatedUser);
            localStorage.setItem('specs_user', JSON.stringify(updatedUser));
          })
          .catch(() => {});
      }
      if (storedCart) {
        setCart(JSON.parse(storedCart));
      }
      if (storedWishlist) {
        setWishlist(JSON.parse(storedWishlist));
      }
    } catch (err) {
      console.warn('localStorage error:', err);
    }
    setAuthLoading(false);
  }, []);

  // Preloader progress counter hook
  useEffect(() => {
    const interval = setInterval(() => {
      setLoadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => setPreloaderFade(true), 250);
          setTimeout(() => setPreloaderVisible(false), 1050);
          return 100;
        }
        const step = Math.floor(Math.random() * 18) + 6;
        return Math.min(100, prev + step);
      });
    }, 120);
    return () => clearInterval(interval);
  }, []);

  // Route transition progress indicator hook
  useEffect(() => {
    const handleStart = () => setRouteChanging(true);
    const handleComplete = () => setRouteChanging(false);

    router.events.on('routeChangeStart', handleStart);
    router.events.on('routeChangeComplete', handleComplete);
    router.events.on('routeChangeError', handleComplete);

    return () => {
      router.events.off('routeChangeStart', handleStart);
      router.events.off('routeChangeComplete', handleComplete);
      router.events.off('routeChangeError', handleComplete);
    };
  }, [router]);

  // Auto-redirect staff/rider accounts away from storefront pages
  useEffect(() => {
    if (!user) return;
    const isStaffUser = user.role === 'admin' || user.role === 'seller' || user.role === 'delivery' || user.email === 'dev.parceluncle@gmail.com' || user.email === 'admin@specs.com';
    if (!isStaffUser) return;

    // Direct staff to their respective dashboards if they try to access storefront flow pages or customer account dashboard
    const storefrontPaths = ['/shop', '/cart', '/checkout', '/wishlist', '/compare', '/customizer', '/lens-guide', '/ar-tryon', '/tryon', '/skin-analysis', '/style-quiz', '/account'];
    if (storefrontPaths.includes(router.pathname) || router.pathname.startsWith('/product/')) {
      if (user.role === 'admin' || user.email === 'dev.parceluncle@gmail.com' || user.email === 'admin@specs.com') {
        router.push('/admin');
      } else if (user.role === 'seller') {
        router.push('/seller');
      } else if (user.role === 'delivery') {
        router.push('/delivery');
      }
    }
  }, [user, router.pathname]);

  // Sync Cart to localStorage
  const saveCart = (newCart) => {
    setCart(newCart);
    try {
      localStorage.setItem('specs_cart', JSON.stringify(newCart));
    } catch (err) {
      console.warn('localStorage error:', err);
    }
  };

  // Sync Wishlist to localStorage
  const saveWishlist = (newWishlist) => {
    setWishlist(newWishlist);
    try {
      localStorage.setItem('specs_wishlist', JSON.stringify(newWishlist));
    } catch (err) {
      console.warn('localStorage error:', err);
    }
  };

  // Auth Functions
  const login = (jwtToken, userData) => {
    setToken(jwtToken);
    setUser(userData);
    localStorage.setItem('specs_token', jwtToken);
    localStorage.setItem('specs_user', JSON.stringify(userData));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('specs_token');
    localStorage.removeItem('specs_user');
    router.push('/');
  };

  const updateProfileFaceShape = (faceShape) => {
    if (user) {
      const updatedUser = { ...user, face_shape: faceShape };
      setUser(updatedUser);
      localStorage.setItem('specs_user', JSON.stringify(updatedUser));
    }
  };

  const updateProfile = (updates) => {
    if (user) {
      const updatedUser = { ...user, ...updates };
      setUser(updatedUser);
      localStorage.setItem('specs_user', JSON.stringify(updatedUser));
    }
  };

  // Cart Functions
  const addToCart = (product, quantity = 1) => {
    if (user && (user.role === 'admin' || user.role === 'seller' || user.role === 'delivery' || user.email === 'dev.parceluncle@gmail.com' || user.email === 'admin@specs.com')) {
      showToast('Staff/Rider accounts cannot purchase items.', 'error');
      return;
    }
    const existingIndex = cart.findIndex(item => item.product.id === product.id);
    let newCart = [...cart];
    
    if (existingIndex > -1) {
      newCart[existingIndex].quantity += quantity;
    } else {
      newCart.push({ product, quantity });
    }
    saveCart(newCart);
    showToast(`Added ${product.name} to bag`);
  };

  const removeFromCart = (productId) => {
    const newCart = cart.filter(item => item.product.id !== productId);
    saveCart(newCart);
    showToast('Item removed from bag', 'info');
  };

  const updateCartQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    const newCart = cart.map(item => {
      if (item.product.id === productId) {
        const finalQuantity = Math.min(quantity, item.product.stock);
        if (quantity > item.product.stock) {
          showToast(`Only ${item.product.stock} units available`, 'info');
        }
        return { ...item, quantity: finalQuantity };
      }
      return item;
    });
    saveCart(newCart);
  };

  const clearCart = () => {
    saveCart([]);
  };

  // Wishlist Functions
  const toggleWishlist = (product) => {
    const exists = wishlist.some(item => item.id === product.id);
    let newWishlist;
    if (exists) {
      newWishlist = wishlist.filter(item => item.id !== product.id);
      showToast(`Removed ${product.name} from wishlist`, 'info');
    } else {
      newWishlist = [...wishlist, product];
      showToast(`Added ${product.name} to wishlist`);
    }
    saveWishlist(newWishlist);
  };

  const isStaff = user && (
    user.role === 'admin' ||
    user.role === 'seller' ||
    user.role === 'delivery' ||
    user.role === 'stylist' ||
    user.role === 'ho_staff' ||
    user.email === 'dev.parceluncle@gmail.com' ||
    user.email === 'admin@specs.com'
  );

  const isStaffRoute = isStaff ||
                       router.pathname.startsWith('/admin') ||
                       router.pathname.startsWith('/seller') ||
                       router.pathname.startsWith('/delivery') ||
                       router.pathname.startsWith('/chat') ||
                       router.pathname.startsWith('/crm') ||
                       router.pathname.startsWith('/stylist') ||
                       router.pathname.startsWith('/ho-staff') ||
                       router.pathname.startsWith('/admin-map') ||
                       router.pathname.startsWith('/delivery-map');

  return (
    <ToastContext.Provider value={{ showToast }}>
      <AuthContext.Provider value={{ user, token, login, logout, authLoading, updateProfileFaceShape, updateProfile }}>
        <Head>
          <title>Lekya Specs — Premium Eyewear E-Commerce Store</title>
          <meta name="description" content="Shop luxury eyeglasses and sunglasses designed with premium materials. Try our interactive webcam-based AI Face Shape suggestion widget." />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>👓</text></svg>" />
        </Head>
      <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateCartQuantity, clearCart }}>
        <WishlistContext.Provider value={{ wishlist, toggleWishlist }}>
          <div className="flex flex-col min-h-screen">
            
            {/* Top route change loader bar */}
            {routeChanging && <div className="top-route-progress" />}

            {/* Premium 3D Preloader Overlay — Deep Purple */}
            {preloaderVisible && (
              <div className={`preloader-overlay ${preloaderFade ? 'fade-out' : ''}`}>
                {/* Ambient background orbs */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                  <div className="ambient-orb-1 absolute top-1/4 left-1/4 w-72 h-72 rounded-full" style={{background: 'radial-gradient(circle, rgba(62,8,86,0.6) 0%, transparent 70%)'}} />
                  <div className="ambient-orb-2 absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full" style={{background: 'radial-gradient(circle, rgba(250,174,98,0.12) 0%, transparent 70%)'}} />
                  <div className="ambient-orb-3 absolute top-1/2 right-1/3 w-48 h-48 rounded-full" style={{background: 'radial-gradient(circle, rgba(123,34,168,0.4) 0%, transparent 70%)'}} />
                </div>
                <div className="flex flex-col items-center justify-center space-y-8 max-w-sm px-6 text-center relative z-10">
                  
                  {/* Rotating 3D Logo wireframe — Orange Neon */}
                  <div className="w-24 h-24 flex items-center justify-center perspective-3d">
                    <div style={{filter: 'drop-shadow(0 0 12px rgba(250,174,98,0.7)) drop-shadow(0 0 25px rgba(250,174,98,0.3))'}}>
                      <svg width="100" height="40" viewBox="0 0 100 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="animate-preloader-spin-3d">
                        <rect x="2" y="8" width="38" height="26" rx="13" stroke="#FAAE62" strokeWidth="4" fill="none"/>
                        <rect x="60" y="8" width="38" height="26" rx="13" stroke="#FAAE62" strokeWidth="4" fill="none"/>
                        <path d="M40 21 Q50 15 60 21" stroke="#FAAE62" strokeWidth="4.5" fill="none" strokeLinecap="round"/>
                        <circle cx="14" cy="20" r="4" fill="rgba(250,174,98,0.15)" />
                        <circle cx="76" cy="20" r="4" fill="rgba(250,174,98,0.15)" />
                      </svg>
                    </div>
                  </div>

                  {/* Brand name — Orange shimmer */}
                  <h1 className="font-serif text-3xl font-bold tracking-widest uppercase shimmer-orange-text">
                    LEKYASPECS
                  </h1>

                  {/* Loading progress bar — Orange on purple */}
                  <div className="w-full bg-white/5 border border-[#FAAE62]/20 rounded-full h-1.5 overflow-hidden p-0.5">
                    <div 
                      className="h-full rounded-full transition-all duration-150"
                      style={{ width: `${loadProgress}%`, background: 'linear-gradient(90deg, #D4893F, #FAAE62, #FCC48A)' }}
                    />
                  </div>

                  <div className="flex justify-between items-center text-[10px] text-[#9B7EA8] font-mono w-full">
                    <span className="uppercase tracking-widest">3D Optical Engine</span>
                    <span className="text-[#FAAE62]">{loadProgress}%</span>
                  </div>

                </div>
              </div>
            )}
            
            {/* --- Premium Navigation Header --- */}
            {!isStaffRoute && (
              <header className="sticky top-0 z-50 border-b" style={{background: 'rgba(13,0,22,0.88)', backdropFilter: 'blur(24px) saturate(160%)', WebkitBackdropFilter: 'blur(24px) saturate(160%)', borderColor: 'rgba(74,18,104,0.7)'}}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                  <div className="flex items-center justify-between h-16 sm:h-20">
                    
                    {/* Menu Button for Mobile */}
                    <div className="flex items-center lg:hidden">
                      <button 
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className="text-[#FEF6EE] hover:text-[#FAAE62] p-2 transition-colors"
                      >
                        {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                      </button>
                    </div>

                    {/* Logo — Inline SVG for perfect sizing and alignment */}
                    <div className="flex-shrink-0 flex justify-center sm:justify-start items-center mr-6 md:mr-10 lg:mr-16">
                      <Link href="/" className="flex items-center gap-2.5 hover:opacity-85 transition-opacity group">
                        {/* Glasses Icon SVG */}
                        <div style={{filter: 'drop-shadow(0 0 8px rgba(250,174,98,0.45))'}}>
                          <svg width="44" height="22" viewBox="0 0 88 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0">
                            {/* Left lens */}
                            <rect x="2" y="8" width="34" height="24" rx="12" stroke="#FAAE62" strokeWidth="3.5" fill="none"/>
                            {/* Right lens */}
                            <rect x="52" y="8" width="34" height="24" rx="12" stroke="#FAAE62" strokeWidth="3.5" fill="none"/>
                            {/* Bridge */}
                            <path d="M36 20 Q44 14 52 20" stroke="#FAAE62" strokeWidth="3" fill="none" strokeLinecap="round"/>
                            {/* Left temple */}
                            <path d="M2 20 L0 16" stroke="#9B4DC0" strokeWidth="3" strokeLinecap="round"/>
                            {/* Right temple */}
                            <path d="M86 20 L88 16" stroke="#9B4DC0" strokeWidth="3" strokeLinecap="round"/>
                            {/* Lens shimmer dots */}
                            <circle cx="14" cy="16" r="2.5" fill="#FAAE62" opacity="0.6"/>
                            <circle cx="66" cy="16" r="2.5" fill="#FAAE62" opacity="0.6"/>
                          </svg>
                        </div>
                        {/* Brand Name */}
                        <div className="flex flex-col leading-none">
                          <span className="font-serif text-xl sm:text-2xl font-black tracking-[0.15em] text-[#FEF6EE] group-hover:text-[#FAAE62] transition-colors uppercase">
                            Lekya
                          </span>
                          <span className="text-[9px] sm:text-[10px] font-bold tracking-[0.4em] text-[#9B7EA8] uppercase" style={{letterSpacing: '0.35em'}}>
                            Specs
                          </span>
                        </div>
                      </Link>
                    </div>

                    {/* Desktop Navigation Links */}
                    {!isStaff ? (
                      <nav className="hidden lg:flex items-center space-x-4 xl:space-x-6 text-sm font-medium uppercase tracking-wider text-[#D4C8DC] mr-4">
                        <Link href="/shop?category=Eyeglasses" className="hover:text-[#FAAE62] transition-colors py-2">Eyeglasses</Link>
                        <Link href="/shop?category=Sunglasses" className="hover:text-[#FAAE62] transition-colors py-2">Sunglasses</Link>
                        <Link href="/lookbook" className="hover:text-[#FAAE62] transition-colors py-2">Lookbook</Link>
                        
                        {/* About & Group Companies Dropdown */}
                        <div className="relative group py-2">
                          <button className="flex items-center gap-1 hover:text-[#FAAE62] transition-colors font-medium">
                            About
                            <ChevronDown className="w-3 h-3 mt-0.5 group-hover:rotate-180 transition-transform duration-200" />
                          </button>
                          <div className="absolute top-full left-0 w-88 min-w-[340px] rounded-2xl shadow-2xl p-4 hidden group-hover:block z-50 animate-fade-in" style={{background: 'rgba(13,0,22,0.97)', backdropFilter: 'blur(20px)', border: '1px solid rgba(74,18,104,0.8)'}}>
                            {/* About Us Link Header */}
                            <Link href="/about" className="flex items-center gap-3 p-2.5 rounded-xl transition-all group/item mb-2 border" style={{borderColor: 'rgba(250,174,98,0.2)'}} onMouseEnter={e => e.currentTarget.style.borderColor='rgba(250,174,98,0.5)'} onMouseLeave={e => e.currentTarget.style.borderColor='rgba(250,174,98,0.2)'}>
                              <div className="w-9 h-9 rounded-xl flex items-center justify-center font-bold shadow-sm" style={{background: 'linear-gradient(135deg, #D4893F, #FAAE62)'}}>
                                <Building2 className="w-5 h-5 text-[#0D0016]" />
                              </div>
                              <div className="flex-1">
                                <p className="text-xs font-black uppercase tracking-wide text-[#FEF6EE] group-hover/item:text-[#FAAE62] transition-colors">About Us & Group Vision</p>
                                <p className="text-[10px] font-semibold uppercase tracking-wider text-[#9B7EA8]">Heritage, Innovation & Corporate Legacy</p>
                              </div>
                              <ArrowRight className="w-4 h-4 text-[#FAAE62] opacity-60 group-hover/item:opacity-100 group-hover/item:translate-x-0.5 transition-all" />
                            </Link>

                            <div className="my-2.5 border-t" style={{borderColor: 'rgba(74,18,104,0.6)'}} />

                            {/* Group Companies Section Header */}
                            <div className="text-[11px] font-bold uppercase tracking-wider text-[#9B7EA8] px-1 py-1 mb-2 flex items-center justify-between">
                              <span>Group Companies</span>
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md tracking-wider" style={{background: 'linear-gradient(135deg, #D4893F, #FAAE62)', color: '#0D0016'}}>Lekya Group</span>
                            </div>

                            {/* Company Items Matching User Screenshot */}
                            <div className="space-y-2">
                              {/* 1. Lekya Logistics */}
                              <a 
                                href="https://lekyalogistics.com" 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="flex items-center gap-3 p-2 rounded-xl hover:bg-white transition-all group/item cursor-pointer border border-transparent hover:border-blue-200 shadow-none hover:shadow-sm"
                              >
                                <div className="w-11 h-11 rounded-2xl bg-[#2563EB] text-white flex items-center justify-center font-bold shadow-sm group-hover:scale-105 transition-transform flex-shrink-0">
                                  <Truck className="w-5 h-5" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs font-black uppercase tracking-wide text-black group-hover/item:text-blue-600 transition-colors truncate">Lekya Logistics</p>
                                  <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 truncate">Pan-India Freight Logistics</p>
                                </div>
                                <ExternalLink className="w-4 h-4 text-[#3B82F6] opacity-80 group-hover/item:opacity-100 flex-shrink-0" />
                              </a>

                              {/* 2. Parcel Uncle */}
                              <a 
                                href="https://parceluncle.com" 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="flex items-center gap-3 p-2 rounded-xl hover:bg-white transition-all group/item cursor-pointer border border-transparent hover:border-orange-200 shadow-none hover:shadow-sm"
                              >
                                <div className="w-11 h-11 rounded-2xl bg-[#F97316] text-white flex items-center justify-center font-extrabold text-sm tracking-tighter shadow-sm group-hover:scale-105 transition-transform flex-shrink-0">
                                  PU
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs font-black uppercase tracking-wide text-black group-hover/item:text-orange-600 transition-colors truncate">Parcel Uncle</p>
                                  <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 truncate">Hyperlocal Dispatch Network</p>
                                </div>
                                <ExternalLink className="w-4 h-4 text-[#F97316] opacity-80 group-hover/item:opacity-100 flex-shrink-0" />
                              </a>

                              {/* 3. Infinior Advisors */}
                              <a 
                                href="https://infinioradvisors.com" 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="flex items-center gap-3 p-2 rounded-xl hover:bg-white transition-all group/item cursor-pointer border border-transparent hover:border-purple-200 shadow-none hover:shadow-sm"
                              >
                                <div className="w-11 h-11 rounded-2xl bg-[#8B5CF6] text-white flex items-center justify-center font-bold shadow-sm group-hover:scale-105 transition-transform flex-shrink-0">
                                  <Layers className="w-5 h-5" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs font-black uppercase tracking-wide text-black group-hover/item:text-purple-600 transition-colors truncate">Infinior Advisors</p>
                                  <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 truncate">Corporate Growth & Advisory</p>
                                </div>
                                <ExternalLink className="w-4 h-4 text-[#8B5CF6] opacity-80 group-hover/item:opacity-100 flex-shrink-0" />
                              </a>

                              {/* 4. Lekya Energy (Bordered Highlight Card) */}
                              <a 
                                href="https://lekyaenergy.com" 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="flex items-center gap-3 p-2.5 rounded-2xl bg-[#ECFDF5] hover:bg-[#D1FAE5] border-2 border-[#10B981] transition-all group/item shadow-sm"
                              >
                                <div className="w-11 h-11 rounded-2xl bg-[#059669] text-white flex items-center justify-center font-bold shadow-sm group-hover:scale-105 transition-transform flex-shrink-0">
                                  <Zap className="w-5 h-5 fill-white stroke-none" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-1.5">
                                    <p className="text-xs font-black uppercase tracking-wide text-black group-hover/item:text-[#047857] transition-colors truncate">Lekya Energy</p>
                                    <span className="bg-[#059669] text-white text-[9px] font-extrabold px-1.5 py-0.5 rounded-md tracking-wider uppercase flex items-center gap-0.5 flex-shrink-0">
                                      SOLAR ☀️
                                    </span>
                                  </div>
                                  <p className="text-[10px] font-bold uppercase tracking-wider text-[#047857] truncate mt-0.5">Clean Renewable Energy</p>
                                </div>
                                <ExternalLink className="w-4 h-4 text-[#059669] flex-shrink-0" />
                              </a>
                            </div>
                          </div>
                        </div>

                        <Link href="/contact" className="hover:text-[#FAAE62] transition-colors py-2">Contact</Link>
                        <Link href="/track" className="hover:text-[#FCC48A] transition-colors py-2 text-[#FAAE62] font-bold">Track Order</Link>

                        {/* Discover Dropdown */}
                        <div className="relative group py-2">
                          <button className="flex items-center gap-1 hover:text-[#FAAE62] transition-colors">
                            Discover
                            <svg className="w-3 h-3 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                          </button>
                          <div className="absolute top-full left-1/2 -translate-x-1/2 w-72 rounded-lg shadow-xl p-4 hidden group-hover:block z-50" style={{background: 'rgba(13,0,22,0.97)', backdropFilter: 'blur(20px)', border: '1px solid rgba(74,18,104,0.8)'}}>
                            <div className="space-y-1">
                              {[
                                {href:'/face-shape', icon:'🤳', title:'Face Shape Analyzer', desc:'Smart frame recommendations'},
                                {href:'/ar-tryon',   icon:'🥽', title:'Live AR Try-On',       desc:'Real-time glasses on your webcam'},
                                {href:'/tryon',     icon:'🕶️', title:'2D Try-On Studio',     desc:'Upload portrait & size frames'},
                                {href:'/skin-analysis',icon:'🎨',title:'Skin Tone Studio',    desc:'Pixel-perfect color analysis'},
                                {href:'/style-quiz', icon:'✨', title:'Style Quiz',            desc:'Find your frame personality'},
                                {href:'/lens-guide', icon:'👓', title:'Prescription Lens Studio', desc:'Refraction & coatings lab'},
                                {href:'/compare',   icon:'⚖️', title:'Compare Frames',       desc:'Side-by-side comparison'},
                                {href:'/customizer',icon:'🛠️', title:'Bespoke Customizer',   desc:'Design custom frames'},
                              ].map(item => (
                                <Link key={item.href} href={item.href} className="flex items-center gap-3 p-2.5 rounded-lg transition-all group/disc" style={{}} onMouseEnter={e => e.currentTarget.style.background='rgba(62,8,86,0.5)'} onMouseLeave={e => e.currentTarget.style.background='transparent'}>
                                  <span className="text-xl">{item.icon}</span>
                                  <div>
                                    <p className="text-xs font-bold text-[#FEF6EE] group-hover/disc:text-[#FAAE62] transition-colors">{item.title}</p>
                                    <p className="text-[10px] text-[#9B7EA8]">{item.desc}</p>
                                  </div>
                                </Link>
                              ))}
                            </div>
                          </div>
                        </div>
                      </nav>
                    ) : (
                      <div className="hidden sm:flex items-center gap-2.5 rounded-full px-5 py-2.5 text-[10px] font-bold tracking-[0.2em] uppercase select-none animate-pulse" style={{background: 'rgba(250,174,98,0.12)', border: '1px solid rgba(250,174,98,0.35)', color: '#FAAE62'}}>
                        🛡️ Staff Console Active
                      </div>
                    )}


                    {/* Desktop Search Bar */}
                    {!isStaff && (
                      <div className="hidden lg:flex items-center relative max-w-xs w-full mr-6">
                        <input
                          type="text"
                          placeholder="Search frames..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && searchQuery.trim()) {
                              router.push(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
                              setSearchQuery('');
                            }
                          }}
                          className="w-full rounded-full py-1.5 pl-4 pr-10 text-xs focus:outline-none font-medium transition-all text-[#FEF6EE] placeholder-[#6B4A80]"
                          style={{background: 'rgba(30,0,48,0.8)', border: '1px solid rgba(74,18,104,0.7)'}}
                        />
                        <Search 
                          className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9B7EA8] cursor-pointer hover:text-[#FAAE62]" 
                          onClick={() => {
                            if (searchQuery.trim()) {
                              router.push(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
                              setSearchQuery('');
                            }
                          }} 
                        />
                      </div>
                    )}

                    {/* Action Icons */}
                    <div className="flex items-center space-x-3 sm:space-x-6">
                      {!isStaff && (
                        <>
                          <Link href="/wishlist" className="relative p-2 text-[#D4C8DC] hover:text-[#FAAE62] transition-colors">
                            <Heart className="h-5 w-5 sm:h-6 sm:w-6" />
                            {wishlist.length > 0 && (
                              <span className="absolute top-1 right-1 text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold text-[#0D0016]" style={{background: 'linear-gradient(135deg, #D4893F, #FAAE62)'}}>
                                {wishlist.length}
                              </span>
                            )}
                          </Link>

                          <Link href="/cart" className="relative p-2 text-[#D4C8DC] hover:text-[#FAAE62] transition-colors">
                            <ShoppingBag className="h-5 w-5 sm:h-6 sm:w-6" />
                            {cart.length > 0 && (
                              <span className="absolute top-1 right-1 text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold text-[#0D0016]" style={{background: 'linear-gradient(135deg, #D4893F, #FAAE62)'}}>
                                {cart.reduce((total, item) => total + item.quantity, 0)}
                              </span>
                            )}
                          </Link>
                        </>
                      )}

                      {user ? (
                        <div className="flex items-center gap-1">
                          <Link href="/account" className="flex items-center gap-1.5 text-sm font-medium text-[#D4C8DC] hover:text-[#FAAE62] transition-colors p-1">
                            <User className="h-5 w-5 shrink-0 text-[#FAAE62]" />
                            <span className="hidden md:inline max-w-[80px] truncate text-xs font-semibold">{user?.name?.split(' ')[0] || 'Account'}</span>
                          </Link>
                          {(user.role === 'admin' || user.email === 'dev.parceluncle@gmail.com' || user.email === 'admin@specs.com') && (
                            <Link href="/admin" className="hidden sm:inline-flex text-[9px] px-1.5 py-0.5 rounded tracking-wider uppercase font-bold transition-all" style={{background: '#1E0030', color: '#FAAE62', border: '1px solid rgba(250,174,98,0.3)'}}>
                              Admin
                            </Link>
                          )}
                          {user.role === 'seller' && (
                            <Link href="/seller" className="hidden sm:inline-flex text-[9px] bg-amber-900 text-amber-300 px-1.5 py-0.5 rounded tracking-wider uppercase font-bold hover:bg-amber-500 hover:text-white transition-all">
                              Seller
                            </Link>
                          )}
                          {user.role === 'delivery' && (
                            <Link href="/delivery" className="hidden sm:inline-flex text-[9px] bg-indigo-900 text-indigo-300 px-1.5 py-0.5 rounded tracking-wider uppercase font-bold hover:bg-indigo-500 hover:text-white transition-all">
                              Delivery
                            </Link>
                          )}
                          <button onClick={logout} className="p-1.5 text-[#9B7EA8] hover:text-red-400 transition-colors" title="Log Out">
                            <LogOut className="h-4 w-4 sm:h-5 sm:w-5" />
                          </button>
                        </div>
                      ) : (
                        <Link href="/account" className="p-2 text-[#D4C8DC] hover:text-[#FAAE62] transition-colors" title="Login / Register">
                          <User className="h-5 w-5 sm:h-6 sm:w-6" />
                        </Link>
                      )}
                    </div>
                  </div>
                </div>

                {/* Mobile Dropdown Menu — Dark Purple */}
                {mobileMenuOpen && (
                  <div className="lg:hidden transition-all duration-300 border-b" style={{background: 'rgba(13,0,22,0.97)', backdropFilter: 'blur(20px)', borderColor: 'rgba(74,18,104,0.7)'}}>
                    <div className="px-2 pt-2 pb-4 space-y-1">
                      {!isStaff ? (
                        <>
                          {/* Mobile Search Bar */}
                          <div className="px-3 py-2 relative">
                            <input
                              type="text"
                              placeholder="Search frames..."
                              value={searchQuery}
                              onChange={(e) => setSearchQuery(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' && searchQuery.trim()) {
                                  router.push(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
                                  setSearchQuery('');
                                  setMobileMenuOpen(false);
                                }
                              }}
                              className="w-full rounded-full py-1.5 pl-4 pr-10 text-xs focus:outline-none font-medium text-[#FEF6EE] placeholder-[#6B4A80]"
                              style={{background: 'rgba(30,0,48,0.8)', border: '1px solid rgba(74,18,104,0.7)'}}
                            />
                            <Search 
                              className="absolute right-6 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9B7EA8] cursor-pointer hover:text-[#FAAE62]" 
                              onClick={() => {
                                if (searchQuery.trim()) {
                                  router.push(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
                                  setSearchQuery('');
                                  setMobileMenuOpen(false);
                                }
                              }} 
                            />
                          </div>
                          {[
                            {href:'/about', label:'📖 About & Group Companies', accent: true},
                            {href:'/shop?category=Eyeglasses', label:'Eyeglasses', accent: false},
                            {href:'/shop?category=Sunglasses', label:'Sunglasses', accent: false},
                            {href:'/face-shape', label:'✨ Face Shape Analyzer', accent: true},
                            {href:'/shop', label:'All Frames', accent: false},
                            {href:'/track', label:'🔍 Track Order', accent: true},
                            {href:'/customizer', label:'Bespoke Customizer', accent: false},
                            {href:'/lens-guide', label:'Prescription Lens Studio', accent: false},
                          ].map(item => (
                            <Link 
                              key={item.href}
                              href={item.href} 
                              onClick={() => setMobileMenuOpen(false)}
                              className="block px-3 py-2.5 rounded-lg text-base font-medium transition-colors"
                              style={{color: item.accent ? '#FAAE62' : '#D4C8DC'}}
                            >
                              {item.label}
                            </Link>
                          ))}
                        </>
                      ) : (
                        <div className="px-3 py-4 text-center">
                          <span className="block text-xs font-bold tracking-widest uppercase select-none" style={{color: '#FAAE62'}}>🛡️ STAFF CONSOLE ACTIVE</span>
                          {user.role === 'admin' && <Link href="/admin" onClick={() => setMobileMenuOpen(false)} className="block mt-3 font-semibold text-xs py-2.5 rounded-lg tracking-wider uppercase text-center transition-all" style={{background: 'linear-gradient(135deg, #D4893F, #FAAE62)', color: '#0D0016'}}>Go to Admin Dashboard</Link>}
                          {user.role === 'seller' && <Link href="/seller" onClick={() => setMobileMenuOpen(false)} className="block mt-3 bg-amber-900 text-amber-300 hover:bg-amber-500 hover:text-white font-semibold text-xs py-2.5 rounded-lg tracking-wider uppercase text-center">Go to Seller Dashboard</Link>}
                          {user.role === 'delivery' && <Link href="/delivery" onClick={() => setMobileMenuOpen(false)} className="block mt-3 bg-indigo-900 text-indigo-300 hover:bg-indigo-500 hover:text-white font-semibold text-xs py-2.5 rounded-lg tracking-wider uppercase text-center">Go to Rider Dashboard</Link>}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </header>
            )}

            {/* --- Main Content Section --- */}
            <main className="flex-grow">
              <Component {...pageProps} />
            </main>

            {/* --- Premium Footer --- */}
            {!isStaffRoute && (
              <footer className="py-12 sm:py-16" style={{background: 'linear-gradient(180deg, #0D0016 0%, #1A0024 50%, #0D0016 100%)', borderTop: '1px solid rgba(250,174,98,0.15)'}}>
                {/* Footer ambient glow */}
                <div className="relative">
                  <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute bottom-0 left-1/3 w-96 h-48 rounded-full" style={{background: 'radial-gradient(circle, rgba(62,8,86,0.3) 0%, transparent 70%)'}} />
                    <div className="absolute bottom-0 right-1/4 w-64 h-32 rounded-full" style={{background: 'radial-gradient(circle, rgba(250,174,98,0.05) 0%, transparent 70%)'}} />
                  </div>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-8 sm:gap-12">
                    
                    {/* Brand column */}
                    <div className="md:col-span-2">
                      <h2 className="font-serif text-3xl tracking-widest font-bold mb-4 shimmer-orange-text">LEKYA SPECS</h2>
                      <p className="text-sm leading-relaxed mb-6 max-w-sm" style={{color: '#9B7EA8'}}>
                        Designed with hand-polished premium materials and engineered for visual clarity. We believe in high-fashion, high-function eyewear without the luxury markup.
                      </p>
                      <div className="flex space-x-4 text-xs tracking-widest font-semibold uppercase" style={{color: '#FAAE62'}}>
                        <span>Classic</span>
                        <span>•</span>
                        <span>Premium</span>
                        <span>•</span>
                        <span>Smart Fitting</span>
                      </div>
                    </div>

                    {/* Customer Service */}
                    <div>
                      <h3 className="text-xs uppercase tracking-widest font-bold mb-4" style={{color: '#FAAE62'}}>Help & FAQ</h3>
                      <ul className="space-y-2 text-sm" style={{color: '#9B7EA8'}}>
                        <li><Link href="/shop" className="hover:text-[#FEF6EE] transition-colors">Shop Catalog</Link></li>
                        <li><Link href="/face-shape" className="hover:text-[#FEF6EE] transition-colors">Face Shape Tool</Link></li>
                        <li><Link href="/cart" className="hover:text-[#FEF6EE] transition-colors">Shopping Bag</Link></li>
                        <li><Link href="/account" className="hover:text-[#FEF6EE] transition-colors">My Profile</Link></li>
                        <li><Link href="/track" className="font-bold transition-colors" style={{color:'#FAAE62'}}>Track Order 🔍</Link></li>
                      </ul>
                    </div>

                    {/* Contact */}
                    <div>
                      <h3 className="text-xs uppercase tracking-widest font-bold mb-4" style={{color: '#FAAE62'}}>Contact Specs</h3>
                      <p className="text-sm leading-relaxed mb-2" style={{color: '#9B7EA8'}}>
                        102-J (part of 102), Hari Nagar Ashram, South Delhi, New Delhi - 110014
                      </p>
                      <p className="text-sm font-medium" style={{color: '#FAAE62'}}>
                        support@lekyaspecs.com
                      </p>
                      <p className="text-sm mt-2" style={{color: '#9B7EA8'}}>
                        +91 96541 19262
                      </p>
                    </div>

                  </div>

                  <div className="mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between text-xs" style={{borderTop: '1px solid rgba(74,18,104,0.5)', color: '#6B4A80'}}>
                    <p>© 2026 Lekya Specs Eyewear. All rights reserved.</p>
                    <div className="flex space-x-6 mt-4 sm:mt-0">
                      <Link href="/privacy" className="hover:text-[#FAAE62] transition-colors">Privacy Policy</Link>
                      <Link href="/terms" className="hover:text-[#FAAE62] transition-colors">Terms of Service</Link>
                      <Link href="/sitemap" className="hover:text-[#FAAE62] transition-colors">Sitemap</Link>
                    </div>
                  </div>
                </div>
                </div>
              </footer>
            )}

            {/* Global Toast */}
            {toast.visible && (
              <div 
                className={`fixed bottom-6 right-6 z-[100] px-4 py-3 rounded-xl flex items-center gap-3 animate-slide-up-toast`}
                style={{
                  background: 'rgba(13,0,22,0.95)',
                  backdropFilter: 'blur(20px)',
                  border: toast.type === 'error' ? '1px solid rgba(239,68,68,0.5)' : toast.type === 'info' ? '1px solid rgba(96,165,250,0.5)' : '1px solid rgba(250,174,98,0.5)',
                  boxShadow: toast.type === 'error' ? '0 8px 30px rgba(239,68,68,0.2)' : '0 8px 30px rgba(250,174,98,0.2)'
                }}
              >
                {toast.type === 'error' ? <XCircle className="w-5 h-5 text-red-400" /> : toast.type === 'info' ? <Info className="w-5 h-5 text-blue-400" /> : <Check className="w-5 h-5" style={{color:'#FAAE62'}} />}
                <p className="text-sm font-semibold" style={{color: '#FEF6EE'}}>{toast.message}</p>
              </div>
            )}
          </div>
        </WishlistContext.Provider>
      </CartContext.Provider>
      </AuthContext.Provider>
    </ToastContext.Provider>
  );
}
