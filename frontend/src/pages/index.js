const React = require('react');
const { useState, useEffect } = React;
const Link = require('next/link').default;
const { ArrowRight, Sparkles, Star, ShieldCheck, Truck, RefreshCw, Mail, Gem, Eye, Award, Headphones, Camera, Palette, Sliders, Search, BookOpen, Layers, CheckCircle2, Compass, ExternalLink, Zap, Package, Building2 } = require('lucide-react');
const { useAuth } = require('./_app');

const API_BASE = typeof window !== 'undefined'
  ? (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' ? 'http://localhost:5000' : '')
  : '';

// Interactive 3D Card Tilt component helper
function ThreeDTiltCard({ children, className = '', style = {} }) {
  const cardRef = React.useRef(null);
  const [transformStyle, setTransformStyle] = React.useState('');

  const handleMouseMove = (e) => {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left; 
    const y = e.clientY - rect.top;  
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = -(y - centerY) / 10; 
    const rotateY = (x - centerX) / 10;  

    setTransformStyle(`perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`);
  };

  const handleMouseLeave = () => {
    setTransformStyle('perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)');
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`transition-all duration-200 ease-out cursor-pointer preserve-3d ${className}`}
      style={{
        ...style,
        transform: transformStyle,
      }}
    >
      {children}
    </div>
  );
}

// 3D Scroll-Triggered Reveal Component
function ScrollReveal3D({ children, className = '' }) {
  const ref = React.useRef(null);
  const [isVisible, setIsVisible] = React.useState(false);

  React.useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );
    if (ref.current) observer.observe(ref.current);
    return () => {
      if (ref.current) observer.unobserve(ref.current);
    };
  }, []);

  return (
    <div
      ref={ref}
      className={`reveal-3d ${isVisible ? 'active' : ''} ${className}`}
    >
      {children}
    </div>
  );
}

// Glow Spotlight wrapper that follows cursor
function GlowSpotlightCard({ children, className = '', style = {} }) {
  const cardRef = React.useRef(null);

  const handleMouseMove = (e) => {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    card.style.setProperty('--mouse-x', `${x}px`);
    card.style.setProperty('--mouse-y', `${y}px`);
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      className={`glow-spotlight-card ${className}`}
      style={style}
    >
      {children}
    </div>
  );
}

export default function Home() {
  const { user } = useAuth();
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [recommendedProducts, setRecommendedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [recLoading, setRecLoading] = useState(false);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterDone, setNewsletterDone] = useState(false);
  const [recentlyViewed, setRecentlyViewed] = useState([]);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [settings, setSettings] = useState({
    hero_title: 'Engineered for Style & Clarity',
    hero_subtitle: 'Designed with hand-polished premium materials and engineered for visual clarity. We believe in high-fashion, high-function eyewear without the luxury markup.',
    hero_image: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=1600&q=80',
    trending_title: 'Trending Frames'
  });

  // Fetch featured products + store settings
  useEffect(() => {
    fetch(`${API_BASE}/api/products`)
      .then(res => res.ok ? res.json() : [])
      .then(data => {
        const arr = Array.isArray(data) ? data : [];
        setFeaturedProducts(arr.slice(0, 4));
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching featured products:', err);
        setFeaturedProducts([]);
        setLoading(false);
      });

    fetch(`${API_BASE}/api/settings`)
      .then(res => res.json())
      .then(data => {
        if (data && data.hero_title) {
          setSettings(data);
        }
      })
      .catch(err => console.error('Error fetching store settings:', err));

    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('specs_recently_viewed');
        if (stored) {
          setRecentlyViewed(JSON.parse(stored));
        }
      } catch (_) {}
    }
  }, []);

  // Face shape recommendations
  useEffect(() => {
    if (user && user.face_shape) {
      setRecLoading(true);
      fetch(`${API_BASE}/api/products/recommendations/${user.face_shape}`)
        .then(res => res.json())
        .then(data => {
          if (data && data.products) {
            setRecommendedProducts(data.products.slice(0, 4));
          }
          setRecLoading(false);
        })
        .catch(err => {
          console.error('Error fetching recommendations:', err);
          setRecLoading(false);
        });
    }
  }, [user]);

  // Parallax mouse tracking for hero
  const handleHeroMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setMousePos({ x, y });
  };
  const handleHeroMouseLeave = () => setMousePos({ x: 0, y: 0 });

  return (
    <div className="bg-premium-black min-h-screen">

      {/* ═══════════════════════════════════════════════════
          1. HERO       {/* ═══════════════════════════════════════════════════
          1. HERO — Full Immersive Liquid Glass & Background Video Showcase
      ═══════════════════════════════════════════════════ */}
      <section
        className="relative w-full h-screen overflow-hidden flex items-center justify-center"
        onMouseMove={handleHeroMouseMove}
        onMouseLeave={handleHeroMouseLeave}
      >
        {/* Background Looping HD Video */}
        <video
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover z-0"
          src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260511_230229_7c9bc431-46cf-489a-948d-e8144d8eb5d4.mp4"
        />

        {/* Multi-layer Dark Purple Overlay Gradients */}
        <div className="absolute inset-0 z-1" style={{background: 'linear-gradient(180deg, rgba(13,0,22,0.8) 0%, rgba(13,0,22,0.45) 50%, rgba(13,0,22,0.95) 100%)'}} />
        <div className="absolute inset-0 z-1" style={{background: 'radial-gradient(circle at 75% 30%, rgba(250,174,98,0.18) 0%, transparent 60%)'}} />

        {/* Ambient Parallax Glow Blobs */}
        <div
          className="absolute animate-ambient-glow z-2 pointer-events-none"
          style={{
            top: '20%', left: '55%',
            width: 500, height: 500,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(250,174,98,0.2) 0%, transparent 70%)',
            filter: 'blur(60px)',
            transform: `translate(${mousePos.x * 40}px, ${mousePos.y * 25}px)`,
            transition: 'transform 0.15s ease-out',
          }}
        />

        {/* Hero Content Grid */}
        <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-12 w-full py-12 lg:py-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

            {/* Left Copy */}
            <div className="space-y-6">
              {/* Badge */}
              <div className="animate-slide-up">
                <div className="liquid-glass inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold tracking-widest uppercase text-[#FAAE62]">
                  <Sparkles className="w-3.5 h-3.5" />
                  Liquid Glass Optical Collection
                </div>
              </div>

              <h1 className="animate-slide-up-delay-1 text-4xl sm:text-5xl lg:text-6xl font-serif font-bold text-white leading-tight tracking-tight">
                Live Better, See Clearly Every Day
              </h1>

              <p className="animate-slide-up-delay-2 text-white/70 text-sm sm:text-base leading-relaxed max-w-lg font-light">
                Take charge of how you feel with a companion built for your journey—build routines, follow your growth, and unlock tailored optical insights for a steadier, more vibrant life each day.
              </p>

              {/* Action Buttons Row */}
              <div className="animate-slide-up-delay-3 flex flex-wrap items-center gap-3 pt-2">
                <Link
                  href="/shop"
                  className="bg-white text-black text-sm sm:text-base font-semibold px-7 py-3.5 rounded-full hover:bg-white/90 transition-colors shadow-lg flex items-center gap-2"
                >
                  Start Today
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/tryon"
                  className="liquid-glass text-white text-sm sm:text-base font-semibold px-7 py-3.5 rounded-full hover:bg-white/10 transition-colors flex items-center gap-2"
                >
                  Discover How
                </Link>
              </div>

              {/* Stats Bar */}
              <div className="animate-slide-up-delay-3 flex items-center gap-8 pt-6 border-t border-white/10">
                {[
                  { val: '10K+', label: 'Happy Clients' },
                  { val: '500+', label: 'Luxury Designs' },
                  { val: '4.9★', label: 'Avg Rating' },
                ].map(({ val, label }) => (
                  <div key={label} className="text-left">
                    <p className="text-xl font-bold font-mono text-[#FAAE62]">{val}</p>
                    <p className="text-[11px] uppercase tracking-wider text-[#9B7EA8]">{label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Liquid Glass 3D Interactive Showcase */}
            <div
              className="relative flex items-center justify-center"
              style={{
                minHeight: 400,
                transform: `perspective(1200px) rotateY(${mousePos.x * -8}deg) rotateX(${mousePos.y * 5}deg)`,
                transition: 'transform 0.12s ease-out',
              }}
            >
              {/* Central Liquid Glass Showcase Card */}
              <div className="liquid-glass relative z-10 w-full max-w-sm rounded-3xl p-6 space-y-4 shadow-2xl">
                <div className="flex justify-between items-center pb-3 border-b border-white/10">
                  <span className="text-xs font-bold uppercase tracking-widest text-[#FAAE62]">Equilibrium Specs</span>
                  <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-white/10 text-white font-mono">2026 Edition</span>
                </div>
                <div className="h-44 rounded-2xl bg-black/40 overflow-hidden relative flex items-center justify-center p-4">
                  <img
                    src="https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=800&q=80"
                    alt="Liquid Glass Frame"
                    className="w-full h-full object-contain filter drop-shadow(0 10px 20px rgba(0,0,0,0.8))"
                  />
                </div>
                <div className="space-y-1">
                  <h4 className="text-base font-serif font-bold text-white">The Equilibrium Titanium</h4>
                  <p className="text-xs text-[#9B7EA8]">Hand-polished ultra-light titanium with anti-glare blue shield.</p>
                </div>
                <div className="flex justify-between items-center pt-2">
                  <span className="text-sm font-bold text-[#FAAE62] font-mono">₹2,499</span>
                  <Link href="/shop" className="px-4 py-2 rounded-full bg-white text-black text-xs font-bold uppercase hover:bg-white/90 transition-colors">
                    Try On AR
                  </Link>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>) 50%, rgba(13,0,22,0.95) 100%)',
                  backdropFilter: 'blur(24px)',
                  border: '1.5px solid rgba(250,174,98,0.3)',
                  boxShadow: '0 30px 80px rgba(13,0,22,0.9), 0 0 45px rgba(250,174,98,0.2)'
                }}
              >
                {/* Inner ambient glow blobs */}
                <div className="absolute -top-16 -right-16 w-52 h-52 rounded-full blur-3xl animate-ambient-glow" style={{background: 'rgba(250,174,98,0.25)'}} />
                <div className="absolute -bottom-16 -left-16 w-44 h-44 rounded-full blur-2xl animate-ambient-glow-slow" style={{background: 'rgba(123,34,168,0.5)'}} />

                {/* Card header */}
                <div className="flex justify-between items-center p-6" style={{borderBottom: '1px solid rgba(250,174,98,0.15)'}}>
                  <div>
                    <p className="text-[9px] tracking-[0.25em] uppercase font-black" style={{color: '#FAAE62'}}>LEKYA ARCHITECTURE 2025</p>
                    <p className="text-base font-serif font-bold mt-0.5" style={{color: '#FEF6EE'}}>Titanium Vanguard 3D</p>
                  </div>
                  <div className="flex items-center gap-1.5 rounded-full px-3 py-1" style={{background: 'rgba(250,174,98,0.15)', border: '1px solid rgba(250,174,98,0.4)'}}>
                    <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{background: '#FAAE62'}} />
                    <span className="text-[9px] font-black uppercase tracking-wider" style={{color: '#FAAE62'}}>3D AR FIT</span>
                  </div>
                </div>

                {/* Glasses 3D SVG showcase */}
                <div className="flex items-center justify-center flex-1 py-6 px-4">
                  <div className="animate-glasses-showcase w-full flex justify-center">
                    <svg width="270" height="110" viewBox="0 0 270 110" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <defs>
                        <linearGradient id="frameGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#FCC48A" />
                          <stop offset="50%" stopColor="#FAAE62" />
                          <stop offset="100%" stopColor="#D4893F" />
                        </linearGradient>
                        <radialGradient id="lensLGrad" cx="40%" cy="30%" r="70%">
                          <stop offset="0%" stopColor="#4A1268" stopOpacity="0.85" />
                          <stop offset="50%" stopColor="#1A0024" stopOpacity="0.95" />
                          <stop offset="100%" stopColor="#0D0016" />
                        </radialGradient>
                        <radialGradient id="lensRGrad" cx="40%" cy="30%" r="70%">
                          <stop offset="0%" stopColor="#4A1268" stopOpacity="0.85" />
                          <stop offset="50%" stopColor="#1A0024" stopOpacity="0.95" />
                          <stop offset="100%" stopColor="#0D0016" />
                        </radialGradient>
                        <filter id="neonOrangeGlow" x="-20%" y="-20%" width="140%" height="140%">
                          <feGaussianBlur stdDeviation="3.5" result="blur" />
                          <feMerge>
                            <feMergeNode in="blur" />
                            <feMergeNode in="SourceGraphic" />
                          </feMerge>
                        </filter>
                      </defs>

                      {/* Temples (Hinges extending outwards) */}
                      <path d="M 12 52 Q 2 48 0 35" stroke="url(#frameGrad)" strokeWidth="3.5" strokeLinecap="round" fill="none" />
                      <path d="M 258 52 Q 268 48 270 35" stroke="url(#frameGrad)" strokeWidth="3.5" strokeLinecap="round" fill="none" />

                      {/* Left Lens Glass */}
                      <path d="M 24 32 C 40 28, 95 28, 112 32 C 120 50, 115 78, 95 84 C 65 90, 32 86, 24 68 Z" fill="url(#lensLGrad)" />
                      {/* Left Frame Rim Outer */}
                      <path d="M 24 32 C 40 28, 95 28, 112 32 C 120 50, 115 78, 95 84 C 65 90, 32 86, 24 68 Z" stroke="url(#frameGrad)" strokeWidth="4" fill="none" filter="url(#neonOrangeGlow)" />
                      {/* Left Lens Diagonal Reflection Highlight */}
                      <path d="M 38 36 Q 60 33 80 44" stroke="rgba(255,255,255,0.4)" strokeWidth="2.5" strokeLinecap="round" fill="none" />

                      {/* Right Lens Glass */}
                      <path d="M 158 32 C 175 28, 230 28, 246 32 C 246 68, 238 86, 205 90 C 185 78, 180 50, 158 32 Z" fill="url(#lensRGrad)" />
                      {/* Right Frame Rim Outer */}
                      <path d="M 158 32 C 175 28, 230 28, 246 32 C 246 68, 238 86, 205 90 C 185 78, 180 50, 158 32 Z" stroke="url(#frameGrad)" strokeWidth="4" fill="none" filter="url(#neonOrangeGlow)" />
                      {/* Right Lens Reflection Highlight */}
                      <path d="M 172 36 Q 194 33 214 44" stroke="rgba(255,255,255,0.4)" strokeWidth="2.5" strokeLinecap="round" fill="none" />

                      {/* Double Top Bridge (Luxury Aviator Double Bar) */}
                      <path d="M 110 32 Q 135 25 160 32" stroke="url(#frameGrad)" strokeWidth="3.5" strokeLinecap="round" fill="none" filter="url(#neonOrangeGlow)" />
                      <path d="M 112 40 Q 135 34 158 40" stroke="url(#frameGrad)" strokeWidth="2.5" strokeLinecap="round" fill="none" />

                      {/* Frame Hinge Gold Accent Pins */}
                      <circle cx="20" cy="50" r="3" fill="#FAAE62" />
                      <circle cx="250" cy="50" r="3" fill="#FAAE62" />
                    </svg>
                  </div>
                </div>

                {/* Card footer specs — orange accents */}
                <div className="px-6 pb-6 grid grid-cols-3 gap-3 pt-4" style={{borderTop: '1px solid rgba(250,174,98,0.08)'}}>
                  {[
                    { label: 'Material', value: 'Titanium' },
                    { label: 'Finish', value: 'Satin PVD' },
                    { label: 'Lens', value: 'Polarized' },
                  ].map(({ label, value }) => (
                    <div key={label} className="text-center">
                      <p className="text-[9px] uppercase tracking-wider mb-0.5" style={{color: '#9B7EA8'}}>{label}</p>
                      <p className="text-xs font-bold font-mono" style={{color: '#FAAE62'}}>{value}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Floating badge chips — Purple glassmorphism */}
              <div
                className="absolute -top-4 -left-4 rounded-xl px-3 py-2 shadow-lg animate-float-slow float-delay-1"
                style={{background: 'rgba(13,0,22,0.85)', border: '1px solid rgba(250,174,98,0.25)', backdropFilter: 'blur(10px)'}}
              >
                <p className="text-[9px] uppercase tracking-wider" style={{color: '#9B7EA8'}}>Try-On</p>
                <p className="text-xs font-bold" style={{color: '#FEF6EE'}}>Live AR 🥽</p>
              </div>
              <div
                className="absolute -bottom-4 -right-4 rounded-xl px-3 py-2 shadow-lg animate-float-slow float-delay-2"
                style={{background: 'rgba(13,0,22,0.85)', border: '1px solid rgba(16,185,129,0.3)', backdropFilter: 'blur(10px)'}}
              >
                <p className="text-[9px] uppercase tracking-wider" style={{color: '#9B7EA8'}}>Delivery</p>
                <p className="text-xs font-bold text-emerald-400">Free & Fast ✓</p>
              </div>
            </div>

          </div>
        </div>

        {/* Bottom fade into dark purple */}
        <div className="absolute bottom-0 left-0 right-0 h-24 pointer-events-none" style={{background: 'linear-gradient(to top, #0D0016, transparent)'}} />
      </section>

      {/* 2. Brand Value Pillars */}
      <section className="border-y py-8" style={{background: "rgba(30,0,48,0.6)", borderColor: "rgba(74,18,104,0.5)"}}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
            <div className="flex flex-col items-center p-4 group cursor-default">
              <div className="w-12 h-12 bg-premium-accent/10 rounded-full flex items-center justify-center mb-3 transition-all duration-300 group-hover:bg-premium-accent/20 group-hover:scale-110">
                <Truck className="w-6 h-6 text-premium-accent" />
              </div>
              <h3 className="font-semibold text-sm uppercase tracking-wider mb-1">Free Delivery & Returns</h3>
              <p className="text-xs text-premium-gray">Free standard shipping on all orders in India</p>
            </div>
            <div className="flex flex-col items-center p-4 border-y sm:border-y-0 sm:border-x border-premium-border group cursor-default">
              <div className="w-12 h-12 bg-premium-accent/10 rounded-full flex items-center justify-center mb-3 transition-all duration-300 group-hover:bg-premium-accent/20 group-hover:scale-110">
                <ShieldCheck className="w-6 h-6 text-premium-accent" />
              </div>
              <h3 className="font-semibold text-sm uppercase tracking-wider mb-1">1-Year Warranty</h3>
              <p className="text-xs text-premium-gray">Premium anti-scratch coating guaranteed for 365 days</p>
            </div>
            <div className="flex flex-col items-center p-4 group cursor-default">
              <div className="w-12 h-12 bg-premium-accent/10 rounded-full flex items-center justify-center mb-3 transition-all duration-300 group-hover:bg-premium-accent/20 group-hover:scale-110">
                <RefreshCw className="w-6 h-6 text-premium-accent" />
              </div>
              <h3 className="font-semibold text-sm uppercase tracking-wider mb-1">14-Day Easy Exchange</h3>
              <p className="text-xs text-premium-gray">No questions asked return and replacement policy</p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Category Navigation Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <ScrollReveal3D>
          <div className="text-center mb-12">
            <p className="text-xs uppercase tracking-widest font-bold mb-2" style={{color: '#FAAE62'}}>Curated Collections</p>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight" style={{color: '#FEF6EE'}}>
              Shop by Collection
            </h2>
          </div>
        </ScrollReveal3D>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Eyeglasses */}
          <ScrollReveal3D>
            <Link href="/shop?category=Eyeglasses" style={{ textDecoration: 'none' }}>
              <div className="cat-card rounded-2xl h-[380px] cursor-pointer" style={{ overflow: 'hidden' }}>
                <div
                  className="cat-img absolute inset-0 bg-cover bg-center"
                  style={{ backgroundImage: "url('https://images.unsplash.com/photo-1591076482161-42ce6da69f67?auto=format&fit=crop&w=900&q=80')", position: 'absolute', inset: 0 }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
                <div className="cat-border-reveal rounded-2xl" />
                <div className="absolute bottom-0 left-0 right-0 p-8 z-10">
                  <div className="cat-label">
                    <p className="text-[10px] uppercase tracking-widest text-premium-accent font-bold mb-1">Category</p>
                    <h3 className="text-3xl font-serif font-bold text-white mb-2">Eyeglasses</h3>
                    <p className="text-sm text-gray-300 leading-relaxed">Anti-glare, blue-light blockers, and reading lenses</p>
                  </div>
                  <div className="cat-cta mt-4 flex items-center gap-2 text-premium-accent text-xs font-bold uppercase tracking-widest">
                    Shop Eyeglasses <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>
            </Link>
          </ScrollReveal3D>

          {/* Sunglasses */}
          <ScrollReveal3D>
            <Link href="/shop?category=Sunglasses" style={{ textDecoration: 'none' }}>
              <div className="cat-card rounded-2xl h-[380px] cursor-pointer" style={{ overflow: 'hidden' }}>
                <div
                  className="cat-img absolute inset-0 bg-cover bg-center"
                  style={{ backgroundImage: "url('https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&w=900&q=80')", position: 'absolute', inset: 0 }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
                <div className="cat-border-reveal rounded-2xl" />
                <div className="absolute bottom-0 left-0 right-0 p-8 z-10">
                  <div className="cat-label">
                    <p className="text-[10px] uppercase tracking-widest text-premium-accent font-bold mb-1">Category</p>
                    <h3 className="text-3xl font-serif font-bold text-white mb-2">Sunglasses</h3>
                    <p className="text-sm text-gray-300 leading-relaxed">100% UV polarized fashion shades</p>
                  </div>
                  <div className="cat-cta mt-4 flex items-center gap-2 text-premium-accent text-xs font-bold uppercase tracking-widest">
                    Shop Sunglasses <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>
            </Link>
          </ScrollReveal3D>
        </div>

        {/* Men / Women / Polarized Lux */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mt-5">
          {[
            { href: '/shop?gender=Men',   img: 'https://images.unsplash.com/photo-1508296695146-257a814070b4?auto=format&fit=crop&w=900&q=80', label: 'Men\'s Optics',   sub: 'Precision Metal & Acetate' },
            { href: '/shop?gender=Women', img: 'https://images.unsplash.com/photo-1577803645773-f96470509666?auto=format&fit=crop&w=900&q=80', label: 'Women\'s Couture', sub: 'Elegant Silhouette Frames' },
            { href: '/shop?category=Sunglasses',  img: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=900&q=80', label: 'Polarized Lux',  sub: 'UV400 Designer Sunwear' },
          ].map(({ href, img, label, sub }) => (
            <ScrollReveal3D key={href}>
              <Link href={href} style={{ textDecoration: 'none' }}>
                <div className="cat-card rounded-xl h-[240px] cursor-pointer" style={{ overflow: 'hidden' }}>
                  <div
                    className="cat-img absolute inset-0 bg-cover bg-center"
                    style={{ backgroundImage: `url('${img}')`, position: 'absolute', inset: 0 }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
                  <div className="cat-border-reveal rounded-xl" />
                  <div className="absolute bottom-0 left-0 right-0 p-5 z-10">
                    <div className="cat-label">
                      <h3 className="text-2xl font-serif font-bold text-white tracking-wide">{label}</h3>
                      <p className="text-xs text-white/70 tracking-widest uppercase">{sub}</p>
                    </div>
                    <div className="cat-cta mt-3 flex items-center gap-1.5 text-premium-accent text-[10px] font-bold uppercase tracking-widest">
                      Explore <ArrowRight className="w-3 h-3" />
                    </div>
                  </div>
                </div>
              </Link>
            </ScrollReveal3D>
          ))}
        </div>
      </section>

      {/* 3.5 Five Premium Tools Section */}
      <section className="border-y py-16 relative overflow-hidden" style={{background: 'linear-gradient(135deg, #0D0016 0%, #1A0024 50%, #0D0016 100%)', borderColor: 'rgba(74,18,104,0.5)'}}>
        {/* Animated background orbs */}
        <div className="absolute top-10 right-10 w-24 h-24 rounded-full blur-xl animate-float-slow float-delay-1" style={{background: 'rgba(250,174,98,0.06)'}}></div>
        <div className="absolute bottom-10 left-10 w-32 h-32 rounded-full blur-xl animate-float-slow float-delay-2" style={{background: 'rgba(62,8,86,0.4)'}}></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal3D className="text-center mb-10">
            <h2 className="font-serif text-2xl sm:text-3xl font-bold mb-2" style={{color: '#FEF6EE'}}>
              Powerful Tools, Just For You
            </h2>
            <p className="text-sm font-light" style={{color: '#9B7EA8'}}>Everything you need to find the perfect pair — smarter, faster, better.</p>
          </ScrollReveal3D>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { href: '/face-shape',    icon: Camera, title: 'Face Shape Analyzer', desc: 'Optical 3D mesh detects your face shape for personalized recommendations', label: 'Scan Now', badge: null },
              { href: '/ar-tryon',      icon: Sparkles, title: 'Live AR Try-On', desc: 'Real-time glasses overlay on your live webcam with precision tracking', label: 'Try Now', badge: 'NEW' },
              { href: '/skin-analysis', icon: Palette, title: 'Skin Tone Lab', desc: 'Canvas pixel sampling analyzes your skin DNA and recommends perfect frame colors', label: 'Analyze', badge: 'NEW' },
              { href: '/customizer',    icon: Sliders, title: 'Bespoke Customizer', desc: 'Design custom frames — shapes, metals, polarized lenses, monogram engraving', label: 'Design Now', badge: 'NEW' },
              { href: '/style-quiz',    icon: Search, title: 'Style Quiz', desc: '5 quick questions to discover your perfect frame personality', label: 'Take Quiz', badge: null },
              { href: '/compare',       icon: Layers, title: 'Compare Frames', desc: 'Side-by-side spec comparison of up to 3 frames', label: 'Compare', badge: null },
              { href: '/lens-guide',    icon: Eye, title: 'Lens Guide', desc: 'Enter your prescription and find the ideal lens type', label: 'Check Lenses', badge: null },
              { href: '/lookbook',      icon: BookOpen, title: 'Lookbook', desc: 'Editorial collections and expert styling advice', label: 'Explore', badge: null },
            ].map(({ href, icon: Icon, title, desc, label, badge }) => (
              <ScrollReveal3D key={href}>
                <ThreeDTiltCard className="h-full">
                  <Link href={href} className="block h-full" style={{ textDecoration: 'none' }}>
                    <div
                      className="group relative rounded-xl p-5 text-center transition-all duration-300 h-full flex flex-col justify-between"
                      style={{background: 'rgba(30,0,48,0.7)', border: '1px solid rgba(74,18,104,0.5)'}}
                      onMouseEnter={e => { e.currentTarget.style.border = '1px solid rgba(250,174,98,0.4)'; e.currentTarget.style.background = 'rgba(42,4,64,0.9)'; }}
                      onMouseLeave={e => { e.currentTarget.style.border = '1px solid rgba(74,18,104,0.5)'; e.currentTarget.style.background = 'rgba(30,0,48,0.7)'; }}
                    >
                      {badge && (
                        <span className="absolute -top-2 -right-2 text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-full z-20" style={{background: 'linear-gradient(135deg, #D4893F, #FAAE62)', color: '#0D0016'}}>
                          {badge}
                        </span>
                      )}
                      <div>
                        <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-all duration-300" style={{background: 'rgba(250,174,98,0.1)', border: '1px solid rgba(250,174,98,0.2)'}}>
                          <Icon className="w-5 h-5" style={{color: '#FAAE62'}} />
                        </div>
                        <h3 className="font-bold text-sm mb-1.5" style={{color: '#FEF6EE'}}>{title}</h3>
                        <p className="text-[11px] leading-relaxed mb-4 font-light" style={{color: '#9B7EA8'}}>{desc}</p>
                      </div>
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider" style={{color: '#FAAE62'}}>
                        {label} <ArrowRight className="w-3 h-3" />
                      </span>
                    </div>
                  </Link>
                </ThreeDTiltCard>
              </ScrollReveal3D>
            ))}
          </div>
        </div>
      </section>

      {/* 4. AI Widget Spotlight CTA — Purple + Orange */}
      <section className="py-16 sm:py-24" style={{background: 'linear-gradient(135deg, #0D0016 0%, #1A0024 100%)'}}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl p-8 sm:p-16 flex flex-col lg:flex-row items-center justify-between gap-8 relative overflow-hidden" style={{background: 'rgba(30,0,48,0.8)', border: '1px solid rgba(250,174,98,0.2)'}}>
            {/* Ambient glow in corner */}
            <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full blur-3xl pointer-events-none" style={{background: 'radial-gradient(circle, rgba(250,174,98,0.12) 0%, transparent 70%)'}} />
            <div className="max-w-xl relative z-10">
              <div className="inline-flex items-center gap-1.5 font-semibold tracking-wider text-xs uppercase mb-4" style={{color: '#FAAE62'}}>
                <Sparkles className="w-4 h-4" />
                Next-Gen Face Shape Detection
              </div>
              <h2 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight mb-4" style={{color: '#FEF6EE'}}>
                Not sure which frames match your face?
              </h2>
              <p className="leading-relaxed font-light mb-6" style={{color: '#9B7EA8'}}>
                Use your webcam to run our high-precision client-side face landmark analyzer. We process everything in your browser instantly—meaning complete privacy. We'll find whether you have an oval, round, heart, square, or diamond face and suggest the exact frame shapes that complement you.
              </p>
              <div className="flex items-center gap-6 text-sm" style={{color: '#6B4A80'}}>
                <span className="flex items-center gap-1.5"><ShieldCheck className="w-4 h-4" style={{color:'#FAAE62'}} /> 100% Private (No photos sent to server)</span>
                <span className="flex items-center gap-1.5"><Star className="w-4 h-4" style={{color:'#FAAE62',fill:'#FAAE62'}} /> Highly Accurate</span>
              </div>
            </div>
            <div className="relative z-10">
              <Link href="/face-shape" className="inline-block font-bold uppercase tracking-wider text-sm px-8 py-5 rounded-xl shadow-lg transition-all hover:scale-105" style={{background: 'linear-gradient(135deg, #D4893F, #FAAE62)', color: '#0D0016'}}>
                Scan Your Face Shape Now
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 4.5 Personalized Recommendations Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 border-t border-premium-border/60">
        {user && user.face_shape ? (
          <div>
            <div className="flex flex-col sm:flex-row items-center justify-between mb-12">
              <div>
                <span className="inline-flex items-center gap-1 bg-premium-accent/15 border border-premium-accent/40 text-premium-golddark text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded mb-2">
                  <Sparkles className="w-3 h-3 animate-pulse" /> Precision Curation
                </span>
                <h2 className="font-serif text-3xl sm:text-4xl font-bold text-premium-black tracking-tight mb-2">
                  Recommended for Your <span className="capitalize text-premium-accent">{user.face_shape}</span> Face
                </h2>
                <p className="text-sm text-premium-gray font-light">Frames mathematically optimized to complement your facial structure</p>
              </div>
              <Link href={recommendedProducts.length > 0 ? `/shop?shape=${recommendedProducts[0].frame_shape}` : '/shop'} className="text-sm uppercase tracking-wider text-premium-black hover:text-premium-accent font-semibold flex items-center gap-1 mt-4 sm:mt-0">
                Explore More Fits <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {recLoading ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {[1, 2, 3, 4].map(n => (
                  <div key={n} className="animate-pulse bg-white border border-premium-border rounded p-4 h-[320px]">
                    <div className="bg-premium-light h-48 w-full rounded mb-4"></div>
                    <div className="h-4 bg-premium-light rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-premium-light rounded w-1/2"></div>
                  </div>
                ))}
              </div>
            ) : recommendedProducts.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {recommendedProducts.map(product => (
                  <ThreeDTiltCard key={product.id} className="rounded-xl p-4 flex flex-col transition-all" style={{background:"rgba(30,0,48,0.7)",border:"1px solid rgba(74,18,104,0.5)"}} onMouseEnter={e=>e.currentTarget.style.border="1px solid rgba(250,174,98,0.4)"} onMouseLeave={e=>e.currentTarget.style.border="1px solid rgba(74,18,104,0.5)"}>
                    <Link href={`/product/${product.id}`} className="group flex flex-col h-full" style={{ textDecoration: 'none' }}>
                      <div className="relative overflow-hidden rounded-lg mb-4 aspect-square flex items-center justify-center hover-zoom">
                        <img src={product.image_urls[0]} alt={product.name} className="w-full h-full object-cover transition-all" />
                      </div>
                      <div className="text-[10px] uppercase tracking-wider font-semibold mb-1" style={{color:"#FAAE62"}}>
                        {product.gender} • {product.category}
                      </div>
                      <h3 className="font-serif text-base font-bold truncate transition-colors" style={{color:"#FEF6EE"}}>
                        {product.name}
                      </h3>
                      <div className="flex items-center gap-1 mt-1 mb-2 text-xs text-amber-500">
                        <Star className="w-3.5 h-3.5 fill-current" />
                        <span className="font-medium text-premium-dark">{parseFloat(product.average_rating || 0).toFixed(1)}</span>
                        <span className="text-gray-400">({product.review_count})</span>
                      </div>
                      <div className="font-semibold mt-auto text-lg" style={{color:"#FAAE62"}}>
                        ₹{parseFloat(product.price).toLocaleString('en-IN')}
                      </div>
                    </Link>
                  </ThreeDTiltCard>
                ))}
              </div>
            ) : (
              <p className="text-sm text-premium-gray font-light text-center py-6">Could not find specific matching frames in stock. Browse our full catalog instead!</p>
            )}
          </div>
        ) : (
          <div className="bg-premium-black border border-premium-accent/20 rounded-xl p-8 sm:p-12 text-center text-white relative overflow-hidden shadow-xl">
            <div className="absolute inset-0 opacity-10" style={{ background: 'radial-gradient(circle at top right, #FAAE62 0%, transparent 60%)' }} />
            <span className="inline-flex items-center gap-1 bg-premium-accent/15 border border-premium-accent/40 text-premium-accent text-[9px] font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-4">
              <Sparkles className="w-3 h-3 animate-pulse" /> Smart Styling Studio
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-white mb-4">
              Get Personalized Frame Recommendations
            </h2>
            <p className="text-sm text-gray-400 font-light max-w-lg mx-auto mb-8 leading-relaxed">
              Every face structure is unique. Take a quick webcam scan using our Face Shape Analyzer to save your profile shape and unlock a personalized collection curated just for your eyes.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/face-shape" className="bg-premium-accent hover:bg-premium-golddark text-premium-black px-8 py-4 rounded font-bold text-xs tracking-widest uppercase transition-all shadow-md inline-block">
                Start Shape Scan
              </Link>
              {!user && (
                <Link href="/account" className="border border-white/40 hover:bg-white hover:text-premium-black text-white px-8 py-4 rounded font-bold text-xs tracking-widest uppercase transition-all inline-block">
                  Login to Save Profile
                </Link>
              )}
            </div>
          </div>
        )}
      </section>

      {/* 5. Trending / Featured Frames Showcase */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <div className="flex flex-col sm:flex-row items-center justify-between mb-12">
          <div>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight mb-2" style={{color: "#FEF6EE"}}>{settings.trending_title}</h2>
            <p className="text-sm font-light" style={{color:"#9B7EA8"}}>The absolute favorites from our current catalog</p>
          </div>
          <Link href="/shop" className="text-sm uppercase tracking-wider text-premium-black hover:text-premium-accent font-semibold flex items-center gap-1 mt-4 sm:mt-0">
            View All Catalog <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(n => (
              <div key={n} className="animate-pulse bg-white border border-premium-border rounded p-4 h-[320px]">
                <div className="bg-premium-light h-48 w-full rounded mb-4"></div>
                <div className="h-4 bg-premium-light rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-premium-light rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {featuredProducts.map(product => (
              <ThreeDTiltCard key={product.id} className="rounded-xl p-4 flex flex-col transition-all" style={{background:"rgba(30,0,48,0.7)",border:"1px solid rgba(74,18,104,0.5)"}} onMouseEnter={e=>e.currentTarget.style.border="1px solid rgba(250,174,98,0.4)"} onMouseLeave={e=>e.currentTarget.style.border="1px solid rgba(74,18,104,0.5)"}>
                <Link href={`/product/${product.id}`} className="group flex flex-col h-full" style={{ textDecoration: 'none' }}>
                  <div className="relative overflow-hidden rounded-lg mb-4 aspect-square flex items-center justify-center hover-zoom">
                    <img 
                      src={product.image_urls[0]} 
                      alt={product.name} 
                      className="w-full h-full object-cover transition-all"
                    />
                    {product.stock === 0 && (
                      <span className="absolute top-2 left-2 bg-red-600 text-white text-[10px] uppercase font-bold px-2 py-0.5 rounded">Out of stock</span>
                    )}
                  </div>
                  <div className="text-[10px] uppercase tracking-wider font-semibold mb-1" style={{color:"#FAAE62"}}>
                    {product.gender} • {product.category}
                  </div>
                  <h3 className="font-serif text-base font-bold truncate transition-colors" style={{color:"#FEF6EE"}}>
                    {product.name}
                  </h3>
                  <div className="flex items-center gap-1 mt-1 mb-2 text-xs text-amber-500">
                    <Star className="w-3.5 h-3.5 fill-current" />
                    <span className="font-medium text-premium-dark">{parseFloat(product.average_rating || 0).toFixed(1)}</span>
                    <span className="text-gray-400">({product.review_count})</span>
                  </div>
                  <div className="font-semibold mt-auto text-lg" style={{color:"#FAAE62"}}>
                    ₹{parseFloat(product.price).toLocaleString('en-IN')}
                  </div>
                </Link>
              </ThreeDTiltCard>
            ))}
          </div>
        )}
      </section>

      {/* 5.5 Recently Viewed Products Section */}
      {recentlyViewed.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 border-t border-premium-border/60">
          <h2 className="font-serif text-xl sm:text-2xl font-bold text-premium-black mb-6 flex items-center gap-2">
            <span className="text-xl">🕐</span> Recently Viewed
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
            {recentlyViewed.map(product => (
              <Link key={product.id} href={`/product/${product.id}`} className="group bg-white border border-premium-border rounded p-3 shadow-sm hover:shadow-md transition-all flex flex-col text-center">
                <div className="relative overflow-hidden bg-premium-light rounded mb-2 aspect-square flex items-center justify-center">
                  <img src={product.image_urls[0]} alt={product.name} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                </div>
                <h4 className="font-serif text-xs font-bold text-premium-black truncate group-hover:text-premium-accent">
                  {product.name}
                </h4>
                <div className="text-[10px] text-premium-accent font-semibold mt-1">
                  ₹{parseFloat(product.price).toLocaleString('en-IN')}
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* 6. Testimonials Section */}
      <section className="py-16 sm:py-24 border-t" style={{background:"rgba(30,0,48,0.5)",borderColor:"rgba(74,18,104,0.5)"}}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal3D className="text-center">
            <h2 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-premium-black mb-4">
              Loved by Visionaries
            </h2>
            <p className="text-center text-sm font-light max-w-md mx-auto mb-16" style={{color:"#9B7EA8"}}>
              Hear from our community who have upgraded their eyewear experience.
            </p>
          </ScrollReveal3D>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <ScrollReveal3D>
              <ThreeDTiltCard className="h-full">
                <div className="rounded-xl p-8 flex flex-col justify-between h-full transition-all" style={{background:"rgba(13,0,22,0.6)",border:"1px solid rgba(74,18,104,0.5)"}}>
                  <div>
                    <div className="flex mb-4" style={{color:"#FAAE62"}}>
                      {[1,2,3,4,5].map(i => <Star key={i} className="w-4 h-4 fill-current" />)}
                    </div>
                    <p className="text-sm italic leading-relaxed mb-6 font-light" style={{color:"#D4C8DC"}}>
                      "I was skeptic about the face-shape tool but it suggested Square frames for my round face. I ordered the Classic Onyx and it looks unbelievably sharp! The lens quality is superior to my previous designer spectacles."
                    </p>
                  </div>
                  <div className="pt-4" style={{borderTop:"1px solid rgba(74,18,104,0.5)"}}>
                    <p className="font-bold text-sm" style={{color:"#FEF6EE"}}>Amit Sharma</p>
                    <p className="text-xs" style={{color:"#9B7EA8"}}>Mumbai, India</p>
                  </div>
                </div>
              </ThreeDTiltCard>
            </ScrollReveal3D>

            <ScrollReveal3D>
              <ThreeDTiltCard className="h-full">
                <div className="rounded-xl p-8 flex flex-col justify-between h-full transition-all" style={{background:"rgba(13,0,22,0.6)",border:"1px solid rgba(74,18,104,0.5)"}}>
                  <div>
                    <div className="flex mb-4" style={{color:"#FAAE62"}}>
                      {[1,2,3,4,5].map(i => <Star key={i} className="w-4 h-4 fill-current" />)}
                    </div>
                    <p className="text-sm italic leading-relaxed mb-6 font-light" style={{color:"#D4C8DC"}}>
                      "Absolutely love the minimal gold aviator shades! The polarization is excellent for driving in bright sun. Delivery took just 2 days. The box packaging feels extremely luxurious like a premium design brand."
                    </p>
                  </div>
                  <div className="pt-4" style={{borderTop:"1px solid rgba(74,18,104,0.5)"}}>
                    <p className="font-bold text-sm" style={{color:"#FEF6EE"}}>Priya Patel</p>
                    <p className="text-xs" style={{color:"#9B7EA8"}}>Bangalore, India</p>
                  </div>
                </div>
              </ThreeDTiltCard>
            </ScrollReveal3D>

            <ScrollReveal3D>
              <ThreeDTiltCard className="h-full">
                <div className="rounded-xl p-8 flex flex-col justify-between h-full transition-all" style={{background:"rgba(13,0,22,0.6)",border:"1px solid rgba(74,18,104,0.5)"}}>
                  <div>
                    <div className="flex mb-4" style={{color:"#FAAE62"}}>
                      {[1,2,3,4,5].map(i => <Star key={i} className="w-4 h-4 fill-current" />)}
                    </div>
                    <p className="text-sm italic leading-relaxed mb-6 font-light" style={{color:"#D4C8DC"}}>
                      "The Blue-light blockers for my daughter are indestructible. She drops them constantly, but the flexible silicon frames survive everything. Extremely happy with Lekya Specs service!"
                    </p>
                  </div>
                  <div className="pt-4" style={{borderTop:"1px solid rgba(74,18,104,0.5)"}}>
                    <p className="font-bold text-sm" style={{color:"#FEF6EE"}}>Dr. Rajesh Kumar</p>
                    <p className="text-xs" style={{color:"#9B7EA8"}}>New Delhi, India</p>
                  </div>
                </div>
              </ThreeDTiltCard>
            </ScrollReveal3D>
          </div>
        </div>
      </section>

      {/* 5.8 Lekya Group Companies Section */}
      <section className="bg-gradient-to-b from-slate-950 via-[#0a0f1d] to-black py-20 sm:py-24 relative overflow-hidden text-white border-t border-premium-border/40">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <ScrollReveal3D className="text-center mb-16">
            <span className="inline-flex items-center gap-2 bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full mb-4">
              <Sparkles className="w-3.5 h-3.5" /> Corporate Ecosystem
            </span>
            <h2 className="font-serif text-3xl sm:text-5xl font-bold tracking-tight text-white mb-4">
              Lekya Group Companies
            </h2>
            <p className="text-gray-400 text-sm font-light max-w-2xl mx-auto leading-relaxed">
              Powering innovation across logistics, supply chain, financial advisory, luxury fashion optics, and clean renewable energy solutions.
            </p>
          </ScrollReveal3D>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* 1. Lekya Logistics */}
            <ScrollReveal3D>
              <ThreeDTiltCard className="h-full">
                <a 
                  href="https://lekyalogistics.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="bg-white/5 border border-white/10 hover:border-blue-500/60 rounded-2xl p-6 transition-all hover:bg-white/10 hover:shadow-2xl h-full flex flex-col justify-between group relative overflow-hidden block text-left"
                >
                  <div className="absolute -top-12 -right-12 w-24 h-24 bg-blue-500/10 rounded-full blur-xl group-hover:scale-150 transition-transform" />
                  <div>
                    <div className="w-14 h-14 rounded-xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                      <Truck className="w-7 h-7 text-blue-400" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2 group-hover:text-blue-400 transition-colors flex items-center gap-2">
                      Lekya Logistics
                      <ExternalLink className="w-4 h-4 text-blue-400 opacity-80" />
                    </h3>
                    <p className="text-gray-400 text-xs leading-relaxed font-light mb-4">
                      Nationwide supply chain infrastructure, automated fulfillment centers, and express B2B freight transportation.
                    </p>
                  </div>
                  <div className="pt-4 border-t border-white/10 flex items-center justify-between text-xs text-blue-400 font-semibold tracking-wider uppercase">
                    <span>Visit lekyalogistics.com</span>
                    <ExternalLink className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  </div>
                </a>
              </ThreeDTiltCard>
            </ScrollReveal3D>

            {/* 2. Parcel Uncle */}
            <ScrollReveal3D>
              <ThreeDTiltCard className="h-full">
                <a 
                  href="https://parceluncle.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="bg-white/5 border border-white/10 hover:border-orange-500/60 rounded-2xl p-6 transition-all hover:bg-white/10 hover:shadow-2xl h-full flex flex-col justify-between group relative overflow-hidden block text-left"
                >
                  <div className="absolute -top-12 -right-12 w-24 h-24 bg-orange-500/10 rounded-full blur-xl group-hover:scale-150 transition-transform" />
                  <div>
                    <div className="w-14 h-14 rounded-xl bg-orange-500/20 border border-orange-500/30 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                      <Package className="w-7 h-7 text-orange-400" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2 group-hover:text-orange-400 transition-colors flex items-center gap-2">
                      Parcel Uncle
                      <ExternalLink className="w-4 h-4 text-orange-400 opacity-80" />
                    </h3>
                    <p className="text-gray-400 text-xs leading-relaxed font-light mb-4">
                      Next-generation hyperlocal delivery ecosystem, same-day urban shipping, and end-to-end seller dispatch solutions.
                    </p>
                  </div>
                  <div className="pt-4 border-t border-white/10 flex items-center justify-between text-xs text-orange-400 font-semibold tracking-wider uppercase">
                    <span>Visit parceluncle.com</span>
                    <ExternalLink className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  </div>
                </a>
              </ThreeDTiltCard>
            </ScrollReveal3D>

            {/* 3. Infinior Advisors */}
            <ScrollReveal3D>
              <ThreeDTiltCard className="h-full">
                <a 
                  href="https://infinioradvisors.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="bg-white/5 border border-white/10 hover:border-purple-500/60 rounded-2xl p-6 transition-all hover:bg-white/10 hover:shadow-2xl h-full flex flex-col justify-between group relative overflow-hidden block text-left"
                >
                  <div className="absolute -top-12 -right-12 w-24 h-24 bg-purple-500/10 rounded-full blur-xl group-hover:scale-150 transition-transform" />
                  <div>
                    <div className="w-14 h-14 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                      <Layers className="w-7 h-7 text-purple-400" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2 group-hover:text-purple-400 transition-colors flex items-center gap-2">
                      Infinior Advisors
                      <ExternalLink className="w-4 h-4 text-purple-400 opacity-80" />
                    </h3>
                    <p className="text-gray-400 text-xs leading-relaxed font-light mb-4">
                      Strategic corporate management, growth consulting, tax strategy, and financial restructuring advisory services.
                    </p>
                  </div>
                  <div className="pt-4 border-t border-white/10 flex items-center justify-between text-xs text-purple-400 font-semibold tracking-wider uppercase">
                    <span>Visit infinioradvisors.com</span>
                    <ExternalLink className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  </div>
                </a>
              </ThreeDTiltCard>
            </ScrollReveal3D>

            {/* 4. Lekya Energy */}
            <ScrollReveal3D>
              <ThreeDTiltCard className="h-full">
                <a 
                  href="https://lekyaenergy.com" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="bg-gradient-to-b from-emerald-950/80 to-black/90 border border-emerald-500/50 hover:border-emerald-400 rounded-2xl p-6 transition-all hover:shadow-[0_0_30px_rgba(16,185,129,0.3)] h-full flex flex-col justify-between group relative overflow-hidden block text-left"
                >
                  <div className="absolute top-3 right-3 bg-emerald-500 text-black text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
                    <span>Solar ☀️</span>
                  </div>
                  <div className="absolute -top-12 -right-12 w-24 h-24 bg-emerald-500/20 rounded-full blur-xl group-hover:scale-150 transition-transform" />
                  <div>
                    <div className="w-14 h-14 rounded-xl bg-emerald-500/30 border border-emerald-400/50 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform shadow-lg">
                      <Zap className="w-7 h-7 text-emerald-300" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2 group-hover:text-emerald-300 transition-colors flex items-center gap-2">
                      Lekya Energy
                      <ExternalLink className="w-4 h-4 text-emerald-400 opacity-80" />
                    </h3>
                    <p className="text-emerald-100/70 text-xs leading-relaxed font-light mb-4">
                      Clean solar energy installations, industrial solar parks, and long-term sustainable power infrastructure solutions.
                    </p>
                  </div>
                  <div className="pt-4 border-t border-emerald-500/30 flex items-center justify-between text-xs text-emerald-300 font-semibold tracking-wider uppercase">
                    <span>Visit lekyaenergy.com</span>
                    <ExternalLink className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  </div>
                </a>
              </ThreeDTiltCard>
            </ScrollReveal3D>

          </div>
        </div>
      </section>

      {/* 6. Why Choose Us Trust Badges — dark purple bg already */}
      <section className="py-16 relative overflow-hidden" style={{background: 'linear-gradient(180deg, #0D0016 0%, #1A0024 100%)'}}>
        <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none" style={{ background: 'radial-gradient(circle at bottom left, #FAAE62 0%, transparent 60%)' }} />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <ScrollReveal3D>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-white text-center mb-12">
              Why <span className="text-premium-accent">Lekya Specs</span>?
            </h2>
          </ScrollReveal3D>
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Gem, title: 'Premium Materials', desc: 'Handcrafted acetate & titanium frames tested for durability' },
              { icon: Award, title: 'Smart Optical Fitting', desc: 'Our face shape analyzer recommends frames matched to your profile' },
              { icon: Truck, title: 'Free Express Delivery', desc: 'Pan-India free shipping on all orders, no minimum required' },
              { icon: Headphones, title: '24/7 Support', desc: 'Dedicated eyewear experts available via chat, call, and email' },
            ].map(({ icon: Icon, title, desc }) => (
              <ScrollReveal3D key={title}>
                <ThreeDTiltCard className="h-full">
                  <div className="bg-white/5 border border-white/10 rounded p-6 text-center hover:bg-white/10 hover:border-premium-accent/40 transition-all h-full flex flex-col justify-between">
                    <div>
                      <div className="w-12 h-12 bg-premium-accent/20 rounded-full flex items-center justify-center mx-auto mb-4 animate-float-slow">
                        <Icon className="w-6 h-6 text-premium-accent" />
                      </div>
                      <h3 className="font-bold text-white text-sm mb-2">{title}</h3>
                    </div>
                    <p className="text-gray-400 text-xs leading-relaxed mt-2">{desc}</p>
                  </div>
                </ThreeDTiltCard>
              </ScrollReveal3D>
            ))}
          </div>
        </div>
      </section>

      {/* 7. Newsletter Signup Banner — Orange Premium */}
      <section className="py-16 relative overflow-hidden" style={{background: 'linear-gradient(135deg, #D4893F 0%, #FAAE62 40%, #FCC48A 60%, #FAAE62 80%, #D4893F 100%)'}}>
        <div className="absolute inset-0 pointer-events-none" style={{background: 'radial-gradient(circle at 30% 50%, rgba(62,8,86,0.2) 0%, transparent 60%)'}} />
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-4" style={{background: 'rgba(0,0,0,0.15)', border: '1px solid rgba(0,0,0,0.2)', color: '#0D0016'}}>
            <Mail className="w-3.5 h-3.5" /> Exclusive Members Club
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold mb-4" style={{color: '#0D0016'}}>
            Get 15% Off Your First Order
          </h2>
          <p className="text-sm mb-8 font-light leading-relaxed" style={{color: 'rgba(13,0,22,0.7)'}}>
            Join thousands of style-forward Lekya Specs members. Subscribe for early access to new collections, exclusive coupons, and personalized eyewear recommendations.
          </p>
          {newsletterDone ? (
            <div className="inline-block rounded-xl p-4" style={{background: 'rgba(0,0,0,0.12)', border: '1px solid rgba(0,0,0,0.2)'}}>
              <p className="font-bold text-sm" style={{color: '#0D0016'}}>✓ You're subscribed! Use code <strong>WELCOME10</strong> for 10% off.</p>
            </div>
          ) : (
            <form
              onSubmit={(e) => { e.preventDefault(); setNewsletterDone(true); }}
              className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
            >
              <input
                type="email"
                required
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                placeholder="Your email address"
                className="flex-grow px-4 py-3 rounded-xl text-sm font-medium focus:outline-none"
                style={{background: '#FEF6EE', color: '#0D0016', border: '2px solid transparent'}}
              />
              <button
                type="submit"
                className="font-bold text-xs tracking-widest uppercase px-8 py-3 rounded-xl transition-all hover:scale-105"
                style={{background: '#0D0016', color: '#FAAE62'}}
              >
                Subscribe
              </button>
            </form>
          )}
          <p className="text-[10px] mt-4" style={{color: 'rgba(13,0,22,0.45)'}}>No spam. Unsubscribe anytime. Your privacy is respected.</p>
        </div>
      </section>

    </div>
  );
}
