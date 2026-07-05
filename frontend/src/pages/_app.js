const React = require('react');
const { useState, useEffect, createContext, useContext } = React;
require('../styles/globals.css');
const Link = require('next/link').default;
const { useRouter } = require('next/router');
const Head = require('next/head').default;
const { ShoppingBag, Heart, User, LogOut, Menu, X, Check, ArrowRight, Search, XCircle, Info } = require('lucide-react');

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

  // 6. Toast State
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
            if (!res.ok) throw new Error();
            return res.json();
          })
          .then(freshUser => {
            const updatedUser = {
              ...parsedUser,
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

  // Hide header/footer on specific clean paths (e.g. embed modes or full admin if desired)
  const isAdminRoute = router.pathname.startsWith('/admin');

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
            
            {/* --- Premium Navigation Header --- */}
            {!isAdminRoute && (
              <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-premium-border">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                  <div className="flex items-center justify-between h-16 sm:h-20">
                    
                    {/* Menu Button for Mobile */}
                    <div className="flex items-center sm:hidden">
                      <button 
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className="text-premium-dark hover:text-premium-accent p-2"
                      >
                        {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                      </button>
                    </div>

                    {/* Logo — Inline SVG for perfect sizing and alignment */}
                    <div className="flex-1 flex justify-center sm:justify-start items-center">
                      <Link href="/" className="flex items-center gap-2.5 hover:opacity-85 transition-opacity group">
                        {/* Glasses Icon SVG */}
                        <svg width="44" height="22" viewBox="0 0 88 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0">
                          {/* Left lens */}
                          <rect x="2" y="8" width="34" height="24" rx="12" stroke="#C5A028" strokeWidth="3.5" fill="none"/>
                          {/* Right lens */}
                          <rect x="52" y="8" width="34" height="24" rx="12" stroke="#C5A028" strokeWidth="3.5" fill="none"/>
                          {/* Bridge */}
                          <path d="M36 20 Q44 14 52 20" stroke="#C5A028" strokeWidth="3" fill="none" strokeLinecap="round"/>
                          {/* Left temple */}
                          <path d="M2 20 L0 16" stroke="#1a1a1a" strokeWidth="3" strokeLinecap="round"/>
                          {/* Right temple */}
                          <path d="M86 20 L88 16" stroke="#1a1a1a" strokeWidth="3" strokeLinecap="round"/>
                          {/* Lens shimmer */}
                          <circle cx="14" cy="16" r="2.5" fill="#C5A028" opacity="0.5"/>
                          <circle cx="66" cy="16" r="2.5" fill="#C5A028" opacity="0.5"/>
                        </svg>
                        {/* Brand Name */}
                        <div className="flex flex-col leading-none">
                          <span className="font-serif text-xl sm:text-2xl font-black tracking-[0.15em] text-premium-black group-hover:text-premium-accent transition-colors uppercase">
                            Lekya
                          </span>
                          <span className="text-[9px] sm:text-[10px] font-bold tracking-[0.4em] text-premium-gray uppercase" style={{letterSpacing: '0.35em'}}>
                            Specs
                          </span>
                        </div>
                      </Link>
                    </div>

                    {/* Desktop Navigation Links */}
                    <nav className="hidden sm:flex items-center space-x-6 text-sm font-medium uppercase tracking-wider text-premium-dark mr-4">
                      <Link href="/shop?category=Eyeglasses" className="hover:text-premium-accent transition-colors py-2">Eyeglasses</Link>
                      <Link href="/shop?category=Sunglasses" className="hover:text-premium-accent transition-colors py-2">Sunglasses</Link>
                      <Link href="/lookbook" className="hover:text-premium-accent transition-colors py-2">Lookbook</Link>
                      <Link href="/contact" className="hover:text-premium-accent transition-colors py-2">Contact</Link>

                      {/* Discover Dropdown */}
                      <div className="relative group py-2">
                        <button className="flex items-center gap-1 hover:text-premium-accent transition-colors">
                          Discover
                          <svg className="w-3 h-3 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                        </button>
                        <div className="absolute top-full left-1/2 -translate-x-1/2 w-72 bg-white border border-premium-border rounded-lg shadow-xl p-4 hidden group-hover:block z-50">
                          <div className="space-y-1">
                            <Link href="/face-shape" className="flex items-center gap-3 p-2.5 rounded hover:bg-premium-light transition-colors">
                              <span className="text-xl">🤳</span>
                              <div>
                                <p className="text-xs font-bold text-premium-black">Face Shape Analyzer</p>
                                <p className="text-[10px] text-premium-gray">AI-powered frame recommendations</p>
                              </div>
                            </Link>
                            <Link href="/ar-tryon" className="flex items-center gap-3 p-2.5 rounded hover:bg-premium-light transition-colors">
                              <span className="text-xl">🥽</span>
                              <div>
                                <p className="text-xs font-bold text-premium-black">Live AR Try-On</p>
                                <p className="text-[10px] text-premium-gray">Real-time glasses on your webcam</p>
                              </div>
                            </Link>
                            <Link href="/tryon" className="flex items-center gap-3 p-2.5 rounded hover:bg-premium-light transition-colors">
                              <span className="text-xl">🕶️</span>
                              <div>
                                <p className="text-xs font-bold text-premium-black">2D Try-On Studio</p>
                                <p className="text-[10px] text-premium-gray">Upload portrait & size frames</p>
                              </div>
                            </Link>
                            <Link href="/skin-analysis" className="flex items-center gap-3 p-2.5 rounded hover:bg-premium-light transition-colors">
                              <span className="text-xl">🎨</span>
                              <div>
                                <p className="text-xs font-bold text-premium-black">Skin Tone AI Lab</p>
                                <p className="text-[10px] text-premium-gray">Pixel-perfect color DNA analysis</p>
                              </div>
                            </Link>
                            <Link href="/style-quiz" className="flex items-center gap-3 p-2.5 rounded hover:bg-premium-light transition-colors">
                              <span className="text-xl">✨</span>
                              <div>
                                <p className="text-xs font-bold text-premium-black">Style Quiz</p>
                                <p className="text-[10px] text-premium-gray">Find your frame personality</p>
                              </div>
                            </Link>
                            <Link href="/lens-guide" className="flex items-center gap-3 p-2.5 rounded hover:bg-premium-light transition-colors">
                              <span className="text-xl">👓</span>
                              <div>
                                <p className="text-xs font-bold text-premium-black">Prescription Lens Studio</p>
                                <p className="text-[10px] text-premium-gray">AI Lens refraction & coatings lab</p>
                              </div>
                            </Link>
                            <Link href="/compare" className="flex items-center gap-3 p-2.5 rounded hover:bg-premium-light transition-colors">
                              <span className="text-xl">⚖️</span>
                              <div>
                                <p className="text-xs font-bold text-premium-black">Compare Frames</p>
                                <p className="text-[10px] text-premium-gray">Side-by-side frame comparison</p>
                              </div>
                            </Link>
                            <Link href="/customizer" className="flex items-center gap-3 p-2.5 rounded hover:bg-premium-light transition-colors">
                              <span className="text-xl">🛠️</span>
                              <div>
                                <p className="text-xs font-bold text-premium-black">Bespoke Customizer</p>
                                <p className="text-[10px] text-premium-gray">Design & preview custom frames</p>
                              </div>
                            </Link>
                          </div>
                        </div>
                      </div>
                    </nav>


                    {/* Desktop Search Bar */}
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
                        className="w-full bg-premium-light border border-premium-border rounded-full py-1.5 pl-4 pr-10 text-xs focus:outline-none focus:border-premium-accent text-premium-dark font-medium transition-all"
                      />
                      <Search 
                        className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-premium-gray cursor-pointer hover:text-premium-accent" 
                        onClick={() => {
                          if (searchQuery.trim()) {
                            router.push(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
                            setSearchQuery('');
                          }
                        }} 
                      />
                    </div>

                    {/* Action Icons */}
                    <div className="flex items-center space-x-3 sm:space-x-6">
                      <Link href="/wishlist" className="relative p-2 text-premium-dark hover:text-premium-accent transition-colors">
                        <Heart className="h-5 w-5 sm:h-6 sm:w-6" />
                        {wishlist.length > 0 && (
                          <span className="absolute top-1 right-1 bg-premium-accent text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                            {wishlist.length}
                          </span>
                        )}
                      </Link>

                      <Link href="/cart" className="relative p-2 text-premium-dark hover:text-premium-accent transition-colors">
                        <ShoppingBag className="h-5 w-5 sm:h-6 sm:w-6" />
                        {cart.length > 0 && (
                          <span className="absolute top-1 right-1 bg-premium-accent text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                            {cart.reduce((total, item) => total + item.quantity, 0)}
                          </span>
                        )}
                      </Link>

                      {user ? (
                        <div className="flex items-center gap-1 sm:gap-2">
                          <Link href="/account" className="flex items-center gap-1 text-sm font-medium text-premium-dark hover:text-premium-accent transition-colors">
                            <User className="h-5 w-5 sm:h-6 sm:w-6 text-premium-accent" />
                            <span className="hidden md:inline max-w-[100px] truncate">{user.name.split(' ')[0]}</span>
                          </Link>
                          {(user.role === 'admin' || user.email === 'dev.parceluncle@gmail.com' || user.email === 'admin@specs.com') && (
                            <Link href="/admin" className="text-[10px] bg-premium-black text-premium-accent px-2 py-0.5 rounded tracking-wider uppercase font-bold hover:bg-premium-accent hover:text-white transition-all ml-1">
                              Admin
                            </Link>
                          )}
                          <button onClick={logout} className="p-2 text-premium-dark hover:text-red-600 transition-colors" title="Log Out">
                            <LogOut className="h-5 w-5" />
                          </button>
                        </div>
                      ) : (
                        <Link href="/account" className="p-2 text-premium-dark hover:text-premium-accent transition-colors" title="Login / Register">
                          <User className="h-5 w-5 sm:h-6 sm:w-6" />
                        </Link>
                      )}
                    </div>
                  </div>
                </div>

                {/* Mobile Dropdown Menu */}
                {mobileMenuOpen && (
                  <div className="sm:hidden bg-white border-b border-premium-border transition-all duration-300">
                    <div className="px-2 pt-2 pb-4 space-y-1">
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
                          className="w-full bg-premium-light border border-premium-border rounded-full py-1.5 pl-4 pr-10 text-xs focus:outline-none focus:border-premium-accent text-premium-dark font-medium"
                        />
                        <Search 
                          className="absolute right-6 top-1/2 -translate-y-1/2 w-4 h-4 text-premium-gray cursor-pointer hover:text-premium-accent" 
                          onClick={() => {
                            if (searchQuery.trim()) {
                              router.push(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
                              setSearchQuery('');
                              setMobileMenuOpen(false);
                            }
                          }} 
                        />
                      </div>
                      <Link 
                        href="/shop?category=Eyeglasses" 
                        onClick={() => setMobileMenuOpen(false)}
                        className="block px-3 py-2 rounded-md text-base font-medium text-premium-dark hover:bg-premium-light hover:text-premium-accent"
                      >
                        Eyeglasses
                      </Link>
                      <Link 
                        href="/shop?category=Sunglasses" 
                        onClick={() => setMobileMenuOpen(false)}
                        className="block px-3 py-2 rounded-md text-base font-medium text-premium-dark hover:bg-premium-light hover:text-premium-accent"
                      >
                        Sunglasses
                      </Link>
                      <Link 
                        href="/face-shape" 
                        onClick={() => setMobileMenuOpen(false)}
                        className="block px-3 py-2 rounded-md text-base font-semibold text-premium-accent hover:bg-premium-light"
                      >
                        Find Your Face Shape
                      </Link>
                      <Link 
                        href="/shop" 
                        onClick={() => setMobileMenuOpen(false)}
                        className="block px-3 py-2 rounded-md text-base font-medium text-premium-dark hover:bg-premium-light hover:text-premium-accent"
                      >
                        All Frames
                      </Link>
                      <Link 
                        href="/customizer" 
                        onClick={() => setMobileMenuOpen(false)}
                        className="block px-3 py-2 rounded-md text-base font-medium text-premium-dark hover:bg-premium-light hover:text-premium-accent"
                      >
                        Bespoke Customizer
                      </Link>
                      <Link 
                        href="/lens-guide" 
                        onClick={() => setMobileMenuOpen(false)}
                        className="block px-3 py-2 rounded-md text-base font-medium text-premium-dark hover:bg-premium-light hover:text-premium-accent"
                      >
                        Prescription Lens Studio
                      </Link>

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
            {!isAdminRoute && (
              <footer className="bg-premium-black text-white py-12 sm:py-16 border-t border-premium-accent/20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-8 sm:gap-12">
                    
                    {/* Brand column */}
                    <div className="md:col-span-2">
                      <h2 className="font-serif text-3xl tracking-widest text-premium-accent font-bold mb-4">LEKYA SPECS</h2>
                      <p className="text-sm text-gray-400 max-w-sm leading-relaxed mb-6">
                        Designed with hand-polished premium materials and engineered for visual clarity. We believe in high-fashion, high-function eyewear without the luxury markup.
                      </p>
                      <div className="flex space-x-4 text-xs tracking-widest text-premium-accent font-semibold uppercase">
                        <span>Classic</span>
                        <span>•</span>
                        <span>Premium</span>
                        <span>•</span>
                        <span>AI Personalized</span>
                      </div>
                    </div>

                    {/* Customer Service */}
                    <div>
                      <h3 className="text-xs uppercase tracking-widest text-premium-accent font-bold mb-4">Help & FAQ</h3>
                      <ul className="space-y-2 text-sm text-gray-400">
                        <li><Link href="/shop" className="hover:text-white transition-colors">Shop Catalog</Link></li>
                        <li><Link href="/face-shape" className="hover:text-white transition-colors">Face Shape Tool</Link></li>
                        <li><Link href="/cart" className="hover:text-white transition-colors">Shopping Bag</Link></li>
                        <li><Link href="/account" className="hover:text-white transition-colors">My Profile</Link></li>
                      </ul>
                    </div>

                    {/* About Us */}
                    <div>
                      <h3 className="text-xs uppercase tracking-widest text-premium-accent font-bold mb-4">Contact Specs</h3>
                      <p className="text-sm text-gray-400 leading-relaxed mb-2">
                        102-J (part of 102), Hari Nagar Ashram, South Delhi, New Delhi - 110014
                      </p>
                      <p className="text-sm text-premium-accent">
                        support@lekyaspecs.com
                      </p>
                      <p className="text-sm text-gray-400 mt-2">
                        +91 96541 19262
                      </p>
                    </div>

                  </div>

                  <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-500">
                    <p>© 2026 Lekya Specs Eyewear. All rights reserved.</p>
                    <div className="flex space-x-6 mt-4 sm:mt-0">
                      <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
                      <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
                      <a href="#" className="hover:text-white transition-colors">Sitemap</a>
                    </div>
                  </div>
                </div>
              </footer>
            )}

            {/* Global Toast */}
            {toast.visible && (
              <div className={`fixed bottom-6 right-6 z-[100] px-4 py-3 rounded shadow-xl border flex items-center gap-3 animate-slide-up-toast bg-white ${toast.type === 'error' ? 'border-red-500 text-red-600' : toast.type === 'info' ? 'border-blue-500 text-blue-600' : 'border-premium-accent text-premium-black'}`}>
                {toast.type === 'error' ? <XCircle className="w-5 h-5" /> : toast.type === 'info' ? <Info className="w-5 h-5" /> : <Check className="w-5 h-5 text-premium-accent" />}
                <p className="text-sm font-semibold">{toast.message}</p>
              </div>
            )}
          </div>
        </WishlistContext.Provider>
      </CartContext.Provider>
      </AuthContext.Provider>
    </ToastContext.Provider>
  );
}
