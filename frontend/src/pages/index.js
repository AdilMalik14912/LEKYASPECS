const React = require('react');
const { useState, useEffect } = React;
const Link = require('next/link').default;
const { ArrowRight, Sparkles, Star, ShieldCheck, Truck, RefreshCw, Mail, Gem, Eye, Award, Headphones } = require('lucide-react');
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
  const [settings, setSettings] = useState({
    hero_title: 'Engineered for Style & Clarity',
    hero_subtitle: 'Designed with hand-polished premium materials and engineered for visual clarity. We believe in high-fashion, high-function eyewear without the luxury markup.',
    hero_image: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=1600&q=80',
    trending_title: 'Trending Frames'
  });

  // Fetch featured products + store settings
  useEffect(() => {
    fetch(`${API_BASE}/api/products`)
      .then(res => res.json())
      .then(data => {
        setFeaturedProducts(data.slice(0, 4));
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching featured products:', err);
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

    // Load recently viewed from localStorage
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('specs_recently_viewed');
        if (stored) {
          setRecentlyViewed(JSON.parse(stored));
        }
      } catch (_) {}
    }
  }, []);

  // Fetch face shape recommendations if shape exists in user profile
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

  return (
    <div className="bg-premium-light min-h-screen">
      
      {/* 1. Hero Section */}
      <section className="relative min-h-[85vh] lg:h-[90vh] flex items-center justify-center overflow-hidden bg-premium-black py-16 lg:py-0">
        {/* Background Image with Overlay */}
        <div 
          style={{ backgroundImage: `url('${settings.hero_image}')` }} 
          className="absolute inset-0 opacity-40 bg-cover bg-center"
        ></div>
        <div className="absolute inset-0 bg-gradient-to-br from-premium-black via-premium-black/90 to-black/80"></div>
        
        {/* Glowing background 3D ambient lights */}
        <div className="absolute top-1/4 left-1/4 w-[300px] h-[300px] bg-premium-accent/10 rounded-full blur-[120px] pointer-events-none animate-pulse-subtle"></div>
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-premium-accent/5 rounded-full blur-[150px] pointer-events-none"></div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Content */}
            <div className="lg:col-span-7 text-left space-y-6 animate-slide-up">
              <div className="inline-flex items-center gap-2 bg-premium-accent/10 border border-premium-accent/30 text-premium-accent px-3 py-1 rounded-full text-xs font-semibold tracking-wider uppercase">
                <Sparkles className="w-3.5 h-3.5" />
                AI-Powered Fitting Included
              </div>
              
              <h1 
                className="text-4xl sm:text-6xl font-serif font-bold text-white tracking-tight leading-none"
                dangerouslySetInnerHTML={{ __html: settings.hero_title.replace(/\\n/g, '<br/>').replace(/\n/g, '<br/>') }}
              ></h1>
              
              <p className="text-base sm:text-lg text-gray-300 leading-relaxed font-light max-w-xl">
                {settings.hero_subtitle}
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 pt-2">
                <Link href="/shop" className="bg-premium-accent hover:bg-premium-golddark text-premium-black font-semibold tracking-wider uppercase text-sm px-8 py-4 rounded transition-all text-center flex items-center justify-center gap-2">
                  Explore All Frames
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link href="/face-shape" className="border border-white/60 hover:bg-white hover:text-premium-black hover:border-white text-white font-semibold tracking-wider uppercase text-sm px-8 py-4 rounded transition-all text-center flex items-center justify-center gap-2">
                  Try Face Shape Analyzer
                </Link>
              </div>
            </div>

            {/* Right Content: Premium 3D Floating Glasses Showcase */}
            <div className="lg:col-span-5 flex items-center justify-center perspective-3d">
              <div className="w-full max-w-[400px] aspect-square rounded-2xl glass-morphic-3d p-8 shadow-premium-3d border border-white/10 flex flex-col justify-between relative overflow-hidden animate-float-3d preserve-3d">
                
                {/* Gold abstract lights inside card */}
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-premium-accent/20 rounded-full blur-3xl"></div>
                <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-premium-accent/10 rounded-full blur-2xl"></div>

                <div className="flex justify-between items-center z-10">
                  <span className="text-[10px] tracking-widest uppercase font-bold text-premium-accent">Model: Lekya Carbon-T</span>
                  <span className="text-[10px] tracking-widest uppercase font-bold text-emerald-500 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping"></span> 3D Virtual Try-On Ready
                  </span>
                </div>

                {/* SVG 3D Glasses display rotating and floating */}
                <div className="my-8 flex justify-center items-center z-10 animate-float-glasses preserve-3d">
                  <svg width="280" height="100" viewBox="0 0 280 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-2xl">
                    {/* Left frame rim */}
                    <path d="M20 50 C20 20, 110 20, 110 50 C110 80, 20 80, 20 50 Z" stroke="#C5A028" strokeWidth="4.5" fill="rgba(255,255,255,0.05)" />
                    {/* Left lens (dark polarized glass gradient) */}
                    <path d="M22 50 C22 23, 108 23, 108 50 C108 77, 22 77, 22 50 Z" fill="url(#lensGrad)" opacity="0.8" />
                    
                    {/* Right frame rim */}
                    <path d="M170 50 C170 20, 260 20, 260 50 C260 80, 170 80, 170 50 Z" stroke="#C5A028" strokeWidth="4.5" fill="rgba(255,255,255,0.05)" />
                    {/* Right lens */}
                    <path d="M172 50 C172 23, 258 23, 258 50 C258 77, 172 77, 172 50 Z" fill="url(#lensGrad)" opacity="0.8" />
                    
                    {/* Bridge */}
                    <path d="M110 42 C125 35, 145 35, 160 42" stroke="#C5A028" strokeWidth="5.5" strokeLinecap="round" />
                    <path d="M110 48 C125 41, 145 41, 160 48" stroke="#E2C974" strokeWidth="2" strokeLinecap="round" />
                    
                    {/* Left end hinge */}
                    <path d="M20 48 H5 C0 48, 0 35, 0 30" stroke="#C5A028" strokeWidth="3" strokeLinecap="round" />
                    {/* Right end hinge */}
                    <path d="M260 48 H275 C280 48, 280 35, 280 30" stroke="#C5A028" strokeWidth="3" strokeLinecap="round" />

                    {/* Gradient definition */}
                    <defs>
                      <linearGradient id="lensGrad" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor="#121212" />
                        <stop offset="30%" stopColor="#2A2A2A" />
                        <stop offset="70%" stopColor="#0B132B" stopOpacity="0.9" />
                        <stop offset="100%" stopColor="#C5A028" stopOpacity="0.4" />
                      </linearGradient>
                    </defs>
                  </svg>
                </div>

                <div className="flex justify-between items-end z-10 border-t border-white/5 pt-4">
                  <div>
                    <span className="block text-[8px] text-gray-400 uppercase tracking-widest font-semibold">Structure</span>
                    <span className="text-xs text-white font-serif font-bold">Aerospace Titanium</span>
                  </div>
                  <div className="text-right">
                    <span className="block text-[8px] text-gray-400 uppercase tracking-widest font-semibold">Finishing</span>
                    <span className="text-xs text-premium-accent font-mono font-bold">18K Gold Plated</span>
                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 2. Brand Value Pillars */}
      <section className="bg-white border-y border-premium-border py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
            <div className="flex flex-col items-center p-4">
              <Truck className="w-8 h-8 text-premium-accent mb-2" />
              <h3 className="font-semibold text-sm uppercase tracking-wider mb-1">Free Delivery & Returns</h3>
              <p className="text-xs text-premium-gray">Free standard shipping on all orders in India</p>
            </div>
            <div className="flex flex-col items-center p-4 border-y sm:border-y-0 sm:border-x border-premium-border">
              <ShieldCheck className="w-8 h-8 text-premium-accent mb-2" />
              <h3 className="font-semibold text-sm uppercase tracking-wider mb-1">1-Year Warranty</h3>
              <p className="text-xs text-premium-gray">Premium anti-scratch coating guaranteed for 365 days</p>
            </div>
            <div className="flex flex-col items-center p-4">
              <RefreshCw className="w-8 h-8 text-premium-accent mb-2" />
              <h3 className="font-semibold text-sm uppercase tracking-wider mb-1">14-Day Easy Exchange</h3>
              <p className="text-xs text-premium-gray">No questions asked return and replacement policy</p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Category Navigation Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <ScrollReveal3D>
          <h2 className="text-center font-serif text-3xl sm:text-4xl font-bold tracking-tight text-premium-black mb-12">
            Shop by Collection
          </h2>
        </ScrollReveal3D>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Eyeglasses */}
          <ScrollReveal3D>
            <ThreeDTiltCard className="relative overflow-hidden rounded h-[350px] shadow-lg border border-premium-border/40">
              <Link href="/shop?category=Eyeglasses" className="block w-full h-full group" style={{ textDecoration: 'none' }}>
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1591076482161-42ce6da69f67?auto=format&fit=crop&w=800&q=80')] bg-cover bg-center transition-transform duration-700 group-hover:scale-105"></div>
                <div className="absolute inset-0 bg-gradient-to-t from-premium-black via-premium-black/40 to-transparent"></div>
                <div className="absolute bottom-8 left-8 z-10">
                  <h3 className="text-2xl font-serif font-bold text-white mb-2">Eyeglasses</h3>
                  <p className="text-sm text-gray-300 mb-4">Anti-glare, blue-light blockers, and reading lenses</p>
                  <span className="text-xs uppercase tracking-widest font-semibold text-premium-accent group-hover:text-white transition-colors flex items-center gap-1">
                    Shop Eyeglasses <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </Link>
            </ThreeDTiltCard>
          </ScrollReveal3D>

          {/* Sunglasses */}
          <ScrollReveal3D>
            <ThreeDTiltCard className="relative overflow-hidden rounded h-[350px] shadow-lg border border-premium-border/40">
              <Link href="/shop?category=Sunglasses" className="block w-full h-full group" style={{ textDecoration: 'none' }}>
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&w=800&q=80')] bg-cover bg-center transition-transform duration-700 group-hover:scale-105"></div>
                <div className="absolute inset-0 bg-gradient-to-t from-premium-black via-premium-black/40 to-transparent"></div>
                <div className="absolute bottom-8 left-8 z-10">
                  <h3 className="text-2xl font-serif font-bold text-white mb-2">Sunglasses</h3>
                  <p className="text-sm text-gray-300 mb-4">100% UV polarized fashion shades</p>
                  <span className="text-xs uppercase tracking-widest font-semibold text-premium-accent group-hover:text-white transition-colors flex items-center gap-1">
                    Shop Sunglasses <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </Link>
            </ThreeDTiltCard>
          </ScrollReveal3D>
        </div>

        {/* Small grids for Men/Women/Kids */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-6">
          <ScrollReveal3D>
            <ThreeDTiltCard className="relative overflow-hidden rounded-xl h-[220px] shadow-md border border-premium-border/40">
              <Link href="/shop?gender=Men" className="block w-full h-full group" style={{ textDecoration: 'none' }}>
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1556306535-0f09a537f0a3?auto=format&fit=crop&w=800&q=80')] bg-cover bg-center scale-100 group-hover:scale-105 transition-transform duration-700"></div>
                <div className="absolute inset-0 bg-gradient-to-t from-premium-black/80 via-premium-black/30 to-transparent"></div>
                <div className="absolute bottom-0 left-0 right-0 p-5">
                  <span className="font-serif text-2xl font-bold text-white tracking-wider group-hover:text-premium-accent transition-colors block">MEN</span>
                  <span className="text-xs text-white/70 tracking-widest uppercase">Premium Collection</span>
                </div>
              </Link>
            </ThreeDTiltCard>
          </ScrollReveal3D>

          <ScrollReveal3D>
            <ThreeDTiltCard className="relative overflow-hidden rounded-xl h-[220px] shadow-md border border-premium-border/40">
              <Link href="/shop?gender=Women" className="block w-full h-full group" style={{ textDecoration: 'none' }}>
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1577803645773-f96470509666?auto=format&fit=crop&w=800&q=80')] bg-cover bg-center scale-100 group-hover:scale-105 transition-transform duration-700"></div>
                <div className="absolute inset-0 bg-gradient-to-t from-premium-black/80 via-premium-black/30 to-transparent"></div>
                <div className="absolute bottom-0 left-0 right-0 p-5">
                  <span className="font-serif text-2xl font-bold text-white tracking-wider group-hover:text-premium-accent transition-colors block">WOMEN</span>
                  <span className="text-xs text-white/70 tracking-widest uppercase">Elegant Frames</span>
                </div>
              </Link>
            </ThreeDTiltCard>
          </ScrollReveal3D>

          <ScrollReveal3D>
            <ThreeDTiltCard className="relative overflow-hidden rounded-xl h-[220px] shadow-md border border-premium-border/40">
              <Link href="/shop?gender=Kids" className="block w-full h-full group" style={{ textDecoration: 'none' }}>
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?auto=format&fit=crop&w=800&q=80')] bg-cover bg-center scale-100 group-hover:scale-105 transition-transform duration-700"></div>
                <div className="absolute inset-0 bg-gradient-to-t from-premium-black/80 via-premium-black/30 to-transparent"></div>
                <div className="absolute bottom-0 left-0 right-0 p-5">
                  <span className="font-serif text-2xl font-bold text-white tracking-wider group-hover:text-premium-accent transition-colors block">KIDS</span>
                  <span className="text-xs text-white/70 tracking-widest uppercase">Fun & Safe Eyewear</span>
                </div>
              </Link>
            </ThreeDTiltCard>
          </ScrollReveal3D>
        </div>
      </section>


      {/* 3.5 Five Premium Tools Section */}
      <section className="bg-white border-y border-premium-border py-16 relative overflow-hidden">
        {/* Subtle background moving shapes */}
        <div className="absolute top-10 right-10 w-24 h-24 bg-premium-accent/5 rounded-full blur-xl animate-float-slow float-delay-1"></div>
        <div className="absolute bottom-10 left-10 w-32 h-32 bg-premium-accent/5 rounded-full blur-xl animate-float-slow float-delay-2"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal3D className="text-center mb-10">
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-premium-black mb-2">
              Powerful Tools, Just For You
            </h2>
            <p className="text-sm text-premium-gray font-light">Everything you need to find the perfect pair — smarter, faster, better.</p>
          </ScrollReveal3D>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { href: '/face-shape',    emoji: '🤳', title: 'Face Shape AI', desc: '68-point neural mesh detects your face shape for personalized recommendations', label: 'Scan Now', badge: null },
              { href: '/ar-tryon',      emoji: '🥽', title: 'Live AR Try-On', desc: 'Real-time glasses overlay on your live webcam using AI face landmarks', label: 'Try Now', badge: 'NEW' },
              { href: '/skin-analysis', emoji: '🎨', title: 'Skin Tone Lab', desc: 'Canvas pixel sampling analyzes your skin DNA and recommends perfect frame colors', label: 'Analyze', badge: 'NEW' },
              { href: '/customizer',    emoji: '🛠️', title: 'Bespoke Customizer', desc: 'Design custom frames — shapes, metals, polarized lenses, monogram engraving', label: 'Design Now', badge: 'NEW' },
              { href: '/style-quiz',    emoji: '✨', title: 'Style Quiz', desc: '5 quick questions to discover your perfect frame personality', label: 'Take Quiz', badge: null },
              { href: '/compare',       emoji: '⚖️', title: 'Compare Frames', desc: 'Side-by-side spec comparison of up to 3 frames', label: 'Compare', badge: null },
              { href: '/lens-guide',    emoji: '👁️', title: 'Lens Guide', desc: 'Enter your prescription and find the ideal lens type', label: 'Check Lenses', badge: null },
              { href: '/lookbook',      emoji: '📸', title: 'Lookbook', desc: 'Editorial collections and expert styling advice', label: 'Explore', badge: null },
            ].map(({ href, emoji, title, desc, label, badge }) => (
              <ScrollReveal3D key={href}>
                <ThreeDTiltCard className="h-full">
                  <GlowSpotlightCard className="group relative border border-premium-border rounded-lg p-5 text-center transition-all bg-premium-light hover:bg-white hover:border-premium-black hover:shadow-md h-full flex flex-col justify-between">
                    <Link href={href} className="block w-full h-full" style={{ textDecoration: 'none' }}>
                      {badge && (
                        <span className="absolute -top-2 -right-2 bg-premium-accent text-premium-black text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-full z-20">
                          {badge}
                        </span>
                      )}
                      <div className="text-4xl mb-3 animate-float-fast float-delay-1">{emoji}</div>
                      <h3 className="font-bold text-sm text-premium-black mb-1.5">{title}</h3>
                      <p className="text-[11px] text-premium-gray leading-relaxed mb-4 font-light">{desc}</p>
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-premium-accent group-hover:text-premium-black transition-colors">
                        {label} <ArrowRight className="w-3 h-3" />
                      </span>
                    </Link>
                  </GlowSpotlightCard>
                </ThreeDTiltCard>
              </ScrollReveal3D>
            ))}
          </div>
        </div>
      </section>

      {/* 4. AI Widget Spotlight CTA */}
      <section className="bg-premium-dark text-white py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="border border-premium-accent/30 rounded bg-black/40 p-8 sm:p-16 flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="max-w-xl">
              <div className="inline-flex items-center gap-1.5 text-premium-accent font-semibold tracking-wider text-xs uppercase mb-4">
                <Sparkles className="w-4 h-4" />
                Next-Gen Face Shape Detection
              </div>
              <h2 className="font-serif text-3xl sm:text-4xl font-bold text-white tracking-tight mb-4">
                Not sure which frames match your face?
              </h2>
              <p className="text-gray-300 leading-relaxed font-light mb-6">
                Use your webcam to run our high-precision client-side face landmark analyzer. We process everything in your browser instantly—meaning complete privacy. We'll find whether you have an oval, round, heart, square, or diamond face and suggest the exact frame shapes that complement you.
              </p>
              <div className="flex items-center gap-6 text-sm text-gray-400">
                <span className="flex items-center gap-1.5"><ShieldCheck className="w-4 h-4 text-premium-accent" /> 100% Private (No photos sent to server)</span>
                <span className="flex items-center gap-1.5"><Star className="w-4 h-4 text-premium-accent fill-premium-accent" /> Highly Accurate</span>
              </div>
            </div>
            <div>
              <Link href="/face-shape" className="bg-premium-accent hover:bg-premium-golddark text-premium-black font-bold uppercase tracking-wider text-sm px-8 py-5 rounded transition-all inline-block shadow-lg">
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
                  <Sparkles className="w-3 h-3 animate-pulse" /> AI Custom Curation
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
                  <ThreeDTiltCard key={product.id} className="bg-white border border-premium-border rounded p-4 shadow-sm hover:shadow-md hover:border-premium-accent/50 transition-all flex flex-col">
                    <Link href={`/product/${product.id}`} className="group flex flex-col h-full" style={{ textDecoration: 'none' }}>
                      <div className="relative overflow-hidden bg-premium-light rounded mb-4 aspect-square flex items-center justify-center hover-zoom">
                        <img src={product.image_urls[0]} alt={product.name} className="w-full h-full object-cover transition-all" />
                      </div>
                      <div className="text-[10px] uppercase tracking-wider text-premium-accent font-semibold mb-1">
                        {product.gender} • {product.category}
                      </div>
                      <h3 className="font-serif text-base font-bold text-premium-black truncate group-hover:text-premium-accent transition-colors">
                        {product.name}
                      </h3>
                      <div className="flex items-center gap-1 mt-1 mb-2 text-xs text-amber-500">
                        <Star className="w-3.5 h-3.5 fill-current" />
                        <span className="font-medium text-premium-dark">{parseFloat(product.average_rating || 0).toFixed(1)}</span>
                        <span className="text-gray-400">({product.review_count})</span>
                      </div>
                      <div className="font-semibold text-premium-black mt-auto text-lg">
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
            <div className="absolute inset-0 opacity-10" style={{ background: 'radial-gradient(circle at top right, #C5A028 0%, transparent 60%)' }} />
            <span className="inline-flex items-center gap-1 bg-premium-accent/15 border border-premium-accent/40 text-premium-accent text-[9px] font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-4">
              <Sparkles className="w-3 h-3 animate-pulse" /> AI Styling Assistant
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
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-premium-black tracking-tight mb-2">{settings.trending_title}</h2>
            <p className="text-sm text-premium-gray font-light">The absolute favorites from our current catalog</p>
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
              <ThreeDTiltCard key={product.id} className="bg-white border border-premium-border rounded p-4 shadow-sm hover:shadow-md hover:border-premium-accent/50 transition-all flex flex-col">
                <Link href={`/product/${product.id}`} className="group flex flex-col h-full" style={{ textDecoration: 'none' }}>
                  <div className="relative overflow-hidden bg-premium-light rounded mb-4 aspect-square flex items-center justify-center hover-zoom">
                    <img 
                      src={product.image_urls[0]} 
                      alt={product.name} 
                      className="w-full h-full object-cover transition-all"
                    />
                    {product.stock === 0 && (
                      <span className="absolute top-2 left-2 bg-red-600 text-white text-[10px] uppercase font-bold px-2 py-0.5 rounded">Out of stock</span>
                    )}
                  </div>
                  <div className="text-[10px] uppercase tracking-wider text-premium-accent font-semibold mb-1">
                    {product.gender} • {product.category}
                  </div>
                  <h3 className="font-serif text-base font-bold text-premium-black truncate group-hover:text-premium-accent transition-colors">
                    {product.name}
                  </h3>
                  <div className="flex items-center gap-1 mt-1 mb-2 text-xs text-amber-500">
                    <Star className="w-3.5 h-3.5 fill-current" />
                    <span className="font-medium text-premium-dark">{parseFloat(product.average_rating || 0).toFixed(1)}</span>
                    <span className="text-gray-400">({product.review_count})</span>
                  </div>
                  <div className="font-semibold text-premium-black mt-auto text-lg">
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
            ))}      {/* 6. Testimonials Section */}
      <section className="bg-white py-16 sm:py-24 border-t border-premium-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal3D className="text-center">
            <h2 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-premium-black mb-4">
              Loved by Visionaries
            </h2>
            <p className="text-center text-premium-gray text-sm font-light max-w-md mx-auto mb-16">
              Hear from our community who have upgraded their eyewear experience.
            </p>
          </ScrollReveal3D>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <ScrollReveal3D>
              <ThreeDTiltCard className="h-full">
                <div className="border border-premium-border p-8 rounded bg-premium-light shadow-sm flex flex-col justify-between h-full hover:border-premium-accent/50 transition-colors">
                  <div>
                    <div className="flex text-premium-accent mb-4">
                      {[1,2,3,4,5].map(i => <Star key={i} className="w-4 h-4 fill-current" />)}
                    </div>
                    <p className="text-sm text-premium-dark italic leading-relaxed mb-6 font-light">
                      "I was skeptic about the face-shape tool but it suggested Square frames for my round face. I ordered the Classic Onyx and it looks unbelievably sharp! The lens quality is superior to my previous designer spectacles."
                    </p>
                  </div>
                  <div className="border-t border-premium-border pt-4">
                    <p className="font-bold text-sm text-premium-black">Amit Sharma</p>
                    <p className="text-xs text-premium-gray">Mumbai, India</p>
                  </div>
                </div>
              </ThreeDTiltCard>
            </ScrollReveal3D>

            <ScrollReveal3D>
              <ThreeDTiltCard className="h-full">
                <div className="border border-premium-border p-8 rounded bg-premium-light shadow-sm flex flex-col justify-between h-full hover:border-premium-accent/50 transition-colors">
                  <div>
                    <div className="flex text-premium-accent mb-4">
                      {[1,2,3,4,5].map(i => <Star key={i} className="w-4 h-4 fill-current" />)}
                    </div>
                    <p className="text-sm text-premium-dark italic leading-relaxed mb-6 font-light">
                      "Absolutely love the minimal gold aviator shades! The polarization is excellent for driving in bright sun. Delivery took just 2 days. The box packaging feels extremely luxurious like a premium design brand."
                    </p>
                  </div>
                  <div className="border-t border-premium-border pt-4">
                    <p className="font-bold text-sm text-premium-black">Priya Patel</p>
                    <p className="text-xs text-premium-gray">Bangalore, India</p>
                  </div>
                </div>
              </ThreeDTiltCard>
            </ScrollReveal3D>

            <ScrollReveal3D>
              <ThreeDTiltCard className="h-full">
                <div className="border border-premium-border p-8 rounded bg-premium-light shadow-sm flex flex-col justify-between h-full hover:border-premium-accent/50 transition-colors">
                  <div>
                    <div className="flex text-premium-accent mb-4">
                      {[1,2,3,4,5].map(i => <Star key={i} className="w-4 h-4 fill-current" />)}
                    </div>
                    <p className="text-sm text-premium-dark italic leading-relaxed mb-6 font-light">
                      "The Blue-light blockers for my daughter are indestructible. She drops them constantly, but the flexible silicon frames survive everything. Extremely happy with Lekya Specs service!"
                    </p>
                  </div>
                  <div className="border-t border-premium-border pt-4">
                    <p className="font-bold text-sm text-premium-black">Dr. Rajesh Kumar</p>
                    <p className="text-xs text-premium-gray">New Delhi, India</p>
                  </div>
                </div>
              </ThreeDTiltCard>
            </ScrollReveal3D>
          </div>
        </div>
      </section>

      {/* 6. Why Choose Us Trust Badges */}
      <section className="bg-premium-black py-16 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none" style={{ background: 'radial-gradient(circle at bottom left, #C5A028 0%, transparent 60%)' }} />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <ScrollReveal3D>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-white text-center mb-12">
              Why <span className="text-premium-accent">Lekya Specs</span>?
            </h2>
          </ScrollReveal3D>
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Gem, title: 'Premium Materials', desc: 'Handcrafted acetate & titanium frames tested for durability' },
              { icon: Award, title: 'AI-Fit Technology', desc: 'Our face shape AI recommends frames matched to your profile' },
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

      {/* 7. Newsletter Signup Banner */}
      <section className="bg-gradient-to-r from-premium-accent via-yellow-400 to-premium-accent py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 bg-black/10 border border-black/20 px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-4">
            <Mail className="w-3.5 h-3.5" /> Exclusive Members Club
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-premium-black mb-4">
            Get 15% Off Your First Order
          </h2>
          <p className="text-premium-black/70 text-sm mb-8 font-light leading-relaxed">
            Join thousands of style-forward Lekya Specs members. Subscribe for early access to new collections, exclusive coupons, and personalized eyewear recommendations.
          </p>
          {newsletterDone ? (
            <div className="bg-black/10 border border-black/20 rounded p-4 inline-block">
              <p className="font-bold text-premium-black text-sm">✓ You're subscribed! Use code <strong>WELCOME10</strong> for 10% off.</p>
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
                className="flex-grow px-4 py-3 rounded bg-white text-premium-black text-sm font-medium focus:outline-none border-2 border-transparent focus:border-premium-black"
              />
              <button
                type="submit"
                className="bg-premium-black text-white hover:bg-white hover:text-premium-black font-bold text-xs tracking-widest uppercase px-8 py-3 rounded transition-all"
              >
                Subscribe
              </button>
            </form>
          )}
          <p className="text-premium-black/50 text-[10px] mt-4">No spam. Unsubscribe anytime. Your privacy is respected.</p>
        </div>
      </section>

    </div>
  );
}
