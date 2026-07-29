const React = require('react');
const { useState, useEffect, createContext, useContext } = React;
require('../styles/globals.css');
const Link = require('next/link').default;
const { useRouter } = require('next/router');
const Head = require('next/head').default;
const { ShoppingBag, Heart, User, LogOut, Menu, X, Check, ArrowRight, Search, XCircle, Info, ChevronDown, ExternalLink, Building2, Truck, Layers, Zap, Gift, MessageCircle, Sparkles } = require('lucide-react');
const SpinWheel = require('../components/SpinWheel').default;
const VisionEyeLogo = require('../components/VisionEyeLogo');

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

  // 7. Toast & SpinWheel State
  const [showSpinWheel, setShowSpinWheel] = useState(false);
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

  const isStaffRoute = router.pathname.startsWith('/admin') ||
                       router.pathname.startsWith('/seller') ||
                       router.pathname.startsWith('/delivery') ||
                       router.pathname.startsWith('/chat') ||
                       router.pathname.startsWith('/crm') ||
                       router.pathname.startsWith('/stylist') ||
                       router.pathname.startsWith('/ho-staff') ||
                       router.pathname.startsWith('/admin-map') ||
                       router.pathname.startsWith('/delivery-map') ||
                       (router.pathname === '/account' && !!user);

  return (
    <ToastContext.Provider value={{ showToast }}>
      <AuthContext.Provider value={{ user, token, login, logout, authLoading, updateProfileFaceShape, updateProfile }}>
        <Head>
          <title>Lekya Specs | Premium Luxury Eyewear & Optical Journal | lekya.in</title>
          <meta name="description" content="lekya.in — Shop luxury eyeglasses and sunglasses in India. AI Face Shape Detection, Live 2D Virtual Try-On, Japanese Beta Titanium frames & Optical Journal." />
          <meta name="keywords" content="lekya.in, Lekya Specs, Lekya Eyewear, Lekya Group, Luxury Eyeglasses India, Titanium Eyewear, Polarized Sunglasses" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <link rel="canonical" href="https://lekya.in" />
          
          {/* OpenGraph & Social Cards */}
          <meta property="og:title" content="Lekya Specs | Premium Luxury Eyewear | lekya.in" />
          <meta property="og:description" content="Shop handcrafted Beta Titanium & Italian Acetate frames with Live 2D Try-On Studio and Custom Prescription Lenses." />
          <meta property="og:url" content="https://lekya.in" />
          <meta property="og:site_name" content="Lekya Specs" />
          <meta property="og:type" content="website" />
          <meta name="twitter:card" content="summary_large_image" />

          <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />
          <meta name="googlebot" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />
          <meta name="google-site-verification" content="lekya-specs-google-indexing-verification" />
          <meta name="msvalidate.01" content="lekya-specs-bing-indexing-verification" />

          {/* Favicon */}
          <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 60'><path d='M5 30 C6 14,28 6,50 18 C72 6,94 14,95 30 C94 46,72 54,50 42 C28 54,6 46,5 30Z' fill='none' stroke='%23FAAE62' stroke-width='5'/><path d='M46 30 C47 26,53 26,54 30' fill='none' stroke='%23FAAE62' stroke-width='4'/></svg>" />

          {/* Google Structured Data (JSON-LD) for Sitelinks Snippets */}
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify([
                {
                  "@context": "https://schema.org",
                  "@type": "Organization",
                  "name": "Lekya Specs",
                  "alternateName": ["Lekya Eyewear", "Lekya Group Specs", "lekya.in"],
                  "url": "https://lekya.in",
                  "logo": "https://lekya.in/lekya_logo.png",
                  "contactPoint": {
                    "@type": "ContactPoint",
                    "telephone": "+91-9654119262",
                    "contactType": "customer service",
                    "areaServed": "IN",
                    "availableLanguage": ["English", "Hindi"]
                  },
                  "sameAs": [
                    "https://instagram.com/lekya.in",
                    "https://facebook.com/lekyaspecs",
                    "https://twitter.com/lekyain"
                  ]
                },
                {
                  "@context": "https://schema.org",
                  "@type": "WebSite",
                  "name": "Lekya Specs",
                  "url": "https://lekya.in",
                  "potentialAction": {
                    "@type": "SearchAction",
                    "target": "https://lekya.in/shop?q={search_term_string}",
                    "query-input": "required name=search_term_string"
                  }
                },
                {
                  "@context": "https://schema.org",
                  "@type": "ItemList",
                  "itemListElement": [
                    {
                      "@type": "SiteNavigationElement",
                      "position": 1,
                      "name": "About Us",
                      "description": "Discover Lekya Specs craftsmanship, Japanese Beta Titanium & Group Vision.",
                      "url": "https://lekya.in/about"
                    },
                    {
                      "@type": "SiteNavigationElement",
                      "position": 2,
                      "name": "Eyewear Collections",
                      "description": "Shop luxury prescription eyeglasses & polarized sunglasses.",
                      "url": "https://lekya.in/shop"
                    },
                    {
                      "@type": "SiteNavigationElement",
                      "position": 3,
                      "name": "2D Virtual Try-On Studio",
                      "description": "Try on luxury frames live in your browser using interactive 2D Studio.",
                      "url": "https://lekya.in/tryon"
                    },
                    {
                      "@type": "SiteNavigationElement",
                      "position": 4,
                      "name": "Optical & Style Journal",
                      "description": "Read expert articles on lens tech, blue shield, and face shape fitting.",
                      "url": "https://lekya.in/blog"
                    },
                    {
                      "@type": "SiteNavigationElement",
                      "position": 5,
                      "name": "Track Order Status",
                      "description": "Track your eyewear dispatch & delivery live.",
                      "url": "https://lekya.in/track"
                    },
                    {
                      "@type": "SiteNavigationElement",
                      "position": 6,
                      "name": "Contact Us",
                      "description": "Get in touch with Lekya Specs HQ in South Delhi, India.",
                      "url": "https://lekya.in/contact"
                    }
                  ]
                }
              ])
            }}
          />
        </Head>
      <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateCartQuantity, clearCart }}>
        <WishlistContext.Provider value={{ wishlist, toggleWishlist }}>
          <div className="flex flex-col min-h-screen">

            {/* --- GOOGLE RICH SEARCH SCHEMAS & SEO METADATA --- */}
            <Head>
              <title>Lekya Specs | Luxury Eyewear, Prescription Glasses &amp; 3D AR Try-On</title>
              <meta name="description" content="Lekya Specs is India's premier luxury optical eyewear destination. Hand-polished acetate frames, 3D AR virtual try-on, 4-hour express delivery, and custom prescription lenses." />
              <meta name="keywords" content="Lekya Specs, Lekya Eyewear, Lekya, lekya.in, Buy Glasses Online India, Prescription Eyeglasses, Sunglasses India, 3D Virtual Try On Glasses, Frame Customizer, Delhi NCR Same Day Glasses" />
              <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
              <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
              <link rel="canonical" href="https://lekya.in" />

              {/* Open Graph / Social Media */}
              <meta property="og:type" content="website" />
              <meta property="og:url" content="https://lekya.in" />
              <meta property="og:title" content="Lekya Specs | Luxury Eyewear &amp; 3D AR Try-On" />
              <meta property="og:description" content="Hand-polished acetate frames, 3D AR virtual try-on, 4-hour express delivery, and custom optical lenses." />
              <meta property="og:site_name" content="Lekya Specs" />

              {/* Geo Location Tags for Google Map & Local Pack */}
              <meta name="geo.region" content="IN-DL" />
              <meta name="geo.placename" content="New Delhi" />
              <meta name="geo.position" content="28.5701;77.2573" />
              <meta name="ICBM" content="28.5701, 77.2573" />

              {/* Google Structured Data (JSON-LD) for Sitelinks & Local Business */}
              <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                  __html: JSON.stringify({
                    "@context": "https://schema.org",
                    "@graph": [
                      {
                        "@type": "Organization",
                        "@id": "https://lekya.in/#organization",
                        "name": "Lekya Specs",
                        "legalName": "Lekya Specs Private Limited",
                        "url": "https://lekya.in",
                        "logo": "https://lekya.in/logo.png",
                        "sameAs": [
                          "https://lekyalogistics.com",
                          "https://parceluncle.com",
                          "https://infinioradvisors.com",
                          "https://lekyaenergy.com"
                        ],
                        "contactPoint": {
                          "@type": "ContactPoint",
                          "telephone": "+91-9654119262",
                          "contactType": "customer service",
                          "areaServed": "IN",
                          "availableLanguage": ["English", "Hindi"]
                        }
                      },
                      {
                        "@type": "WebSite",
                        "@id": "https://lekya.in/#website",
                        "url": "https://lekya.in",
                        "name": "Lekya Specs",
                        "description": "Luxury Eyewear & 3D AR Try-On Portal",
                        "publisher": { "@id": "https://lekya.in/#organization" },
                        "potentialAction": {
                          "@type": "SearchAction",
                          "target": "https://lekya.in/shop?search={search_term_string}",
                          "query-input": "required name=search_term_string"
                        }
                      },
                      {
                        "@type": "SiteNavigationElement",
                        "name": [
                          "Track Order & Shipments",
                          "Browse Eyewear Catalog",
                          "Live 3D Virtual AR Try-On",
                          "Optical Refraction Studio",
                          "3D Interactive Lookbook",
                          "AI Face Shape Analyzer",
                          "Support & Contact"
                        ],
                        "url": [
                          "https://lekya.in/account",
                          "https://lekya.in/shop",
                          "https://lekya.in/ar-tryon",
                          "https://lekya.in/lens-guide",
                          "https://lekya.in/lookbook",
                          "https://lekya.in/face-shape",
                          "https://lekya.in/contact"
                        ]
                      },
                      {
                        "@type": ["Optician", "LocalBusiness"],
                        "@id": "https://lekya.in/#store",
                        "name": "Lekya Specs Flagship Store & Experience Center",
                        "telephone": "+91-9654119262",
                        "email": "dev.parceluncle@gmail.com",
                        "address": {
                          "@type": "PostalAddress",
                          "streetAddress": "102-J, Hari Nagar Ashram, South Delhi",
                          "addressLocality": "New Delhi",
                          "addressRegion": "Delhi",
                          "postalCode": "110014",
                          "addressCountry": "IN"
                        },
                        "geo": {
                          "@type": "GeoCoordinates",
                          "latitude": 28.5701,
                          "longitude": 77.2573
                        },
                        "openingHoursSpecification": {
                          "@type": "OpeningHoursSpecification",
                          "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
                          "opens": "10:00",
                          "closes": "21:00"
                        },
                        "priceRange": "₹₹"
                      }
                    ]
                  })
                }}
              />
            </Head>
            
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
                  
                  {/* Lekya.in Logo — actual transparent glasses PNG */}
                  <div className="flex items-center justify-center" style={{ minWidth: 240 }}>
                    <VisionEyeLogo size={48} showText={true} showTagline={false} animated={true} />
                  </div>

                  {/* Tagline */}
                  <div className="flex flex-col items-center">
                    <span className="text-[10px] font-bold tracking-[0.35em] text-[#FAAE62] uppercase">
                      See Beyond. Deliver More.
                    </span>
                  </div>

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
              <header className="sticky top-0 z-50 border-b backdrop-blur-xl bg-[#0D0016]/80 border-white/10 shadow-2xl transition-all">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                  <div className="flex items-center justify-between h-16 sm:h-20 relative">
                    
                    {/* Menu Button for Mobile */}
                    <div className="flex items-center lg:hidden">
                      <button 
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className="text-[#FEF6EE] hover:text-[#FAAE62] p-2 transition-colors"
                      >
                        {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                      </button>
                    </div>

                    {/* Logo — Vision Eye Concept 10 */}
                    <div className="flex-shrink-0 flex items-center absolute left-1/2 -translate-x-1/2 lg:static lg:left-auto lg:transform-none lg:mr-8 xl:mr-12">
                      <Link href="/" className="flex items-center hover:opacity-90 transition-opacity group">
                        <VisionEyeLogo size={40} showText={true} tagline="See Beyond. Deliver More." showTagline={true} />
                      </Link>
                    </div>

                    {/* Desktop Navigation Links — Unclipped Glassmorphic Pill Container */}
                    {!isStaffRoute ? (
                      <nav className="hidden lg:flex items-center space-x-5 text-xs font-bold uppercase tracking-wider text-[#FEF6EE] px-6 py-2.5 rounded-full shadow-2xl border border-white/15 backdrop-blur-xl bg-white/5 mr-4">
                        <Link href="/shop?category=Eyeglasses" className="hover:text-[#FAAE62] transition-colors py-1">Eyeglasses</Link>
                        <Link href="/shop?category=Sunglasses" className="hover:text-[#FAAE62] transition-colors py-1">Sunglasses</Link>
                        <Link href="/lookbook" className="hover:text-[#FAAE62] transition-colors py-1">Lookbook</Link>
                        <Link href="/blog" className="hover:text-[#FAAE62] transition-colors py-1">Blog</Link>
                        
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
                                className="flex items-center gap-3 p-2.5 rounded-xl transition-all group/item cursor-pointer border border-transparent hover:border-[#3B82F6]/50 hover:bg-[#3E0856]/40"
                              >
                                <div className="w-10 h-10 rounded-xl bg-[#2563EB] text-white flex items-center justify-center font-bold shadow-sm group-hover/item:scale-105 transition-transform flex-shrink-0">
                                  <Truck className="w-5 h-5" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs font-black uppercase tracking-wide text-[#FEF6EE] group-hover/item:text-[#3B82F6] transition-colors truncate">Lekya Logistics</p>
                                  <p className="text-[10px] font-semibold uppercase tracking-wider text-[#9B7EA8] truncate">Pan-India Freight Logistics</p>
                                </div>
                                <ExternalLink className="w-4 h-4 text-[#3B82F6] opacity-80 group-hover/item:opacity-100 flex-shrink-0" />
                              </a>

                              {/* 2. Parcel Uncle */}
                              <a 
                                href="https://parceluncle.com" 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="flex items-center gap-3 p-2.5 rounded-xl transition-all group/item cursor-pointer border border-transparent hover:border-[#FAAE62]/50 hover:bg-[#3E0856]/40"
                              >
                                <div className="w-10 h-10 rounded-xl bg-[#F97316] text-white flex items-center justify-center font-extrabold text-sm tracking-tighter shadow-sm group-hover/item:scale-105 transition-transform flex-shrink-0">
                                  PU
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs font-black uppercase tracking-wide text-[#FEF6EE] group-hover/item:text-[#FAAE62] transition-colors truncate">Parcel Uncle</p>
                                  <p className="text-[10px] font-semibold uppercase tracking-wider text-[#9B7EA8] truncate">Hyperlocal Dispatch Network</p>
                                </div>
                                <ExternalLink className="w-4 h-4 text-[#FAAE62] opacity-80 group-hover/item:opacity-100 flex-shrink-0" />
                              </a>

                              {/* 3. Infinior Advisors */}
                              <a 
                                href="https://infinioradvisors.com" 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="flex items-center gap-3 p-2.5 rounded-xl transition-all group/item cursor-pointer border border-transparent hover:border-[#8B5CF6]/50 hover:bg-[#3E0856]/40"
                              >
                                <div className="w-10 h-10 rounded-xl bg-[#8B5CF6] text-white flex items-center justify-center font-bold shadow-sm group-hover/item:scale-105 transition-transform flex-shrink-0">
                                  <Layers className="w-5 h-5" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs font-black uppercase tracking-wide text-[#FEF6EE] group-hover/item:text-[#A78BFA] transition-colors truncate">Infinior Advisors</p>
                                  <p className="text-[10px] font-semibold uppercase tracking-wider text-[#9B7EA8] truncate">Corporate Growth & Advisory</p>
                                </div>
                                <ExternalLink className="w-4 h-4 text-[#8B5CF6] opacity-80 group-hover/item:opacity-100 flex-shrink-0" />
                              </a>

                              {/* 4. Lekya Energy */}
                              <a 
                                href="https://lekyaenergy.com" 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="flex items-center gap-3 p-2.5 rounded-xl transition-all group/item cursor-pointer border border-[#10B981]/40 hover:border-[#10B981] bg-[#059669]/10 hover:bg-[#059669]/25"
                              >
                                <div className="w-10 h-10 rounded-xl bg-[#059669] text-white flex items-center justify-center font-bold shadow-sm group-hover/item:scale-105 transition-transform flex-shrink-0">
                                  <Zap className="w-5 h-5 fill-white stroke-none" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-1.5">
                                    <p className="text-xs font-black uppercase tracking-wide text-[#FEF6EE] group-hover/item:text-[#34D399] transition-colors truncate">Lekya Energy</p>
                                    <span className="bg-[#059669] text-white text-[9px] font-extrabold px-1.5 py-0.5 rounded-md tracking-wider uppercase flex items-center gap-0.5 flex-shrink-0">
                                      SOLAR ☀️
                                    </span>
                                  </div>
                                  <p className="text-[10px] font-bold uppercase tracking-wider text-[#34D399] truncate mt-0.5">Clean Renewable Energy</p>
                                </div>
                                <ExternalLink className="w-4 h-4 text-[#34D399] flex-shrink-0" />
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
                    {!isStaffRoute && (
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
                      {!isStaffRoute && (
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
                      {!isStaffRoute ? (
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
              <footer className="py-12 sm:py-16" style={{background: 'linear-gradient(180deg, #0D0016 0%, #1A0024 50%, #0D0016 100%)', borderTop: '1px solid rgba(250,174,98,0.2)'}}>
                {/* Footer ambient glow */}
                <div className="relative">
                  <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute bottom-0 left-1/3 w-96 h-48 rounded-full" style={{background: 'radial-gradient(circle, rgba(62,8,86,0.35) 0%, transparent 70%)'}} />
                    <div className="absolute bottom-0 right-1/4 w-64 h-32 rounded-full" style={{background: 'radial-gradient(circle, rgba(250,174,98,0.08) 0%, transparent 70%)'}} />
                  </div>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-8 sm:gap-12">
                    
                    {/* Column 1: Brand & Vision */}
                    <div className="md:col-span-1 space-y-4">
                      <Link href="/" className="inline-block hover:opacity-90 transition-opacity">
                        <VisionEyeLogo size={44} showText={true} tagline="See Beyond. Deliver More." showTagline={true} />
                      </Link>
                      <p className="text-xs leading-relaxed" style={{color: '#9B7EA8'}}>
                        Hand-crafted Japanese Beta Titanium & Mazzucchelli Acetate frames. High-fashion, high-function eyewear without luxury markups.
                      </p>
                      <div className="flex flex-wrap gap-2 text-[10px] tracking-wider font-semibold uppercase text-[#FAAE62]">
                        <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10">Classic</span>
                        <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10">Beta Titanium</span>
                        <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10">Smart Fitting</span>
                      </div>
                    </div>

                    {/* Column 2: Collections & Interactive Tools */}
                    <div>
                      <h3 className="text-xs uppercase tracking-widest font-bold mb-4" style={{color: '#FAAE62'}}>Collections & Tools</h3>
                      <ul className="space-y-2.5 text-xs font-medium" style={{color: '#9B7EA8'}}>
                        <li><Link href="/shop?category=Eyeglasses" className="hover:text-[#FEF6EE] transition-colors">Prescription Eyeglasses</Link></li>
                        <li><Link href="/shop?category=Sunglasses" className="hover:text-[#FEF6EE] transition-colors">Polarized Sunglasses</Link></li>
                        <li><Link href="/lookbook" className="hover:text-[#FEF6EE] transition-colors">2026 Style Lookbook</Link></li>
                        <li><Link href="/tryon" className="hover:text-[#FEF6EE] transition-colors flex items-center gap-1.5"><Sparkles className="w-3.5 h-3.5 text-[#FAAE62]" /> 2D Virtual Try-On Studio</Link></li>
                        <li><Link href="/face-shape" className="hover:text-[#FEF6EE] transition-colors">Face Shape Frame Matcher</Link></li>
                      </ul>
                    </div>

                    {/* Column 3: Journal, Account & Order Tracking */}
                    <div>
                      <h3 className="text-xs uppercase tracking-widest font-bold mb-4" style={{color: '#FAAE62'}}>Journal & Self-Service</h3>
                      <ul className="space-y-2.5 text-xs font-medium" style={{color: '#9B7EA8'}}>
                        <li><Link href="/blog" className="hover:text-[#FEF6EE] transition-colors flex items-center gap-1.5 text-[#FAAE62] font-bold">📰 Optical & Style Journal</Link></li>
                        <li><Link href="/about" className="hover:text-[#FEF6EE] transition-colors">About Us & Group Vision</Link></li>
                        <li><Link href="/account" className="hover:text-[#FEF6EE] transition-colors">My VIP Profile & Orders</Link></li>
                        <li><Link href="/track" className="font-bold transition-colors text-[#FAAE62] hover:underline flex items-center gap-1">Track Order Status 🔍</Link></li>
                        <li><Link href="/cart" className="hover:text-[#FEF6EE] transition-colors">Shopping Bag & Checkout</Link></li>
                      </ul>
                    </div>

                    {/* Column 4: Contact & Corporate HQ */}
                    <div>
                      <h3 className="text-xs uppercase tracking-widest font-bold mb-4" style={{color: '#FAAE62'}}>Corporate HQ</h3>
                      <p className="text-xs leading-relaxed mb-3" style={{color: '#9B7EA8'}}>
                        102-J (part of 102), Hari Nagar Ashram, South Delhi, New Delhi - 110014
                      </p>
                      <p className="text-xs font-bold text-[#FAAE62]">
                        📧 support@lekyaspecs.in
                      </p>
                      <p className="text-xs mt-1 font-semibold text-white">
                        📞 +91 96541 19262
                      </p>
                      <p className="text-[10px] mt-2 text-[#9B7EA8]">Mon - Sat: 9:30 AM - 7:30 PM IST</p>
                    </div>

                  </div>

                  {/* Footer Copyright & Legal */}
                  <div className="mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between text-xs" style={{borderTop: '1px solid rgba(74,18,104,0.5)', color: '#6B4A80'}}>
                    <p>© 2026 <span style={{color:'#FAAE62', fontWeight:700}}>lekya.in</span> — Lekya Specs Eyewear. All rights reserved.</p>
                    <div className="flex space-x-6 mt-4 sm:mt-0 font-medium">
                      <Link href="/privacy" className="hover:text-[#FAAE62] transition-colors">Privacy Policy</Link>
                      <Link href="/terms" className="hover:text-[#FAAE62] transition-colors">Terms of Service</Link>
                      <Link href="/sitemap" className="hover:text-[#FAAE62] transition-colors">Sitemap</Link>
                    </div>
                  </div>
                </div>
                </div>
              </footer>
            )}

            {/* Floating Glassmorphic VIP Concierge & Rewards Bar — Bottom RIGHT (desktop) / compact (mobile) */}
            {!isStaffRoute && (
            <div className="fixed z-40" style={{
              bottom: 'calc(68px + env(safe-area-inset-bottom, 0px))',
              right: '1rem',
            }}
              // Only show on desktop — on mobile it's hidden by CSS or shown compact
            >
              <div
                className="hidden sm:flex items-center gap-2 p-1.5 rounded-full border shadow-2xl backdrop-blur-xl transition-all hover:border-[#FAAE62]/50"
                style={{ 
                  background: 'rgba(13,0,22,0.85)', 
                  borderColor: 'rgba(250,174,98,0.3)',
                  boxShadow: '0 12px 35px rgba(0,0,0,0.6)' 
                }}
              >
                {/* 1. Spin & Win Rewards Button */}
                <button
                  onClick={() => setShowSpinWheel(true)}
                  className="flex items-center gap-2 px-3.5 py-2 rounded-full text-xs font-bold text-[#FAAE62] hover:bg-[#FAAE62]/15 transition-all group"
                  title="Spin & Win Exclusive Rewards"
                >
                  <Gift className="w-4 h-4 text-[#FAAE62] group-hover:scale-110 transition-transform" />
                  <span className="tracking-wider uppercase text-[11px] font-extrabold">Spin & Win 🎡</span>
                </button>

                <div className="w-[1px] h-4 bg-white/20" />

                {/* 2. WhatsApp VIP Concierge Button */}
                <a
                  href="https://wa.me/919654119262?text=Hello%20Lekya%20Specs%20VIP%20Concierge%2C%20I%20need%20assistance"
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold text-[#25D366] bg-[#25D366]/10 border border-[#25D366]/30 hover:bg-[#25D366] hover:text-[#0D0016] transition-all shadow-md"
                  title="Chat with Lekya VIP Concierge on WhatsApp"
                >
                  <MessageCircle className="w-4 h-4 fill-current" />
                  <span className="tracking-wider uppercase text-[11px] font-extrabold">VIP Concierge</span>
                </a>
              </div>
            </div>
            )}

            {/* ── Mobile Bottom Navigation Bar (storefront only, hidden on desktop) ── */}
            {!isStaffRoute && (
              <nav className="mobile-bottom-nav" aria-label="Mobile navigation">
                <a href="/" className={router.pathname === '/' ? 'active' : ''}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
                  Home
                </a>
                <a href="/shop" className={router.pathname === '/shop' ? 'active' : ''}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                  Shop
                </a>
                <button onClick={() => setShowSpinWheel(true)} style={{color: '#FAAE62'}}>
                  <Gift style={{width:22,height:22,color:'#FAAE62'}} />
                  Spin
                </button>
                <a href="/cart" className={router.pathname === '/cart' ? 'active' : ''} style={{position:'relative'}}>
                  <span style={{position:'relative', display:'inline-block'}}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
                    {cart.length > 0 && <span style={{position:'absolute',top:'-6px',right:'-8px',background:'#FAAE62',color:'#0D0016',borderRadius:'999px',width:'16px',height:'16px',fontSize:'9px',fontWeight:'800',display:'flex',alignItems:'center',justifyContent:'center'}}>{cart.reduce((t,i)=>t+i.quantity,0)}</span>}
                  </span>
                  Bag
                </a>
                <a href="/account" className={router.pathname === '/account' ? 'active' : ''}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                  Account
                </a>
              </nav>
            )}

            {/* Spin & Win Modal */}
            <SpinWheel
              isOpen={showSpinWheel}
              onClose={() => setShowSpinWheel(false)}
              onApplyCoupon={(code) => {
                showToast(`🎉 Coupon ${code} unlocked! Auto-applying at checkout.`, 'success');
              }}
            />

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
