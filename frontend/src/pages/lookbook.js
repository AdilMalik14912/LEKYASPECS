const React = require('react');
const { useState, useEffect } = React;
const Link = require('next/link').default;
const { useCart, useWishlist } = require('./_app');
const { ShoppingBag, Heart, Sparkles, ArrowRight, Camera } = require('lucide-react');
const API_BASE = typeof window !== 'undefined'
  ? (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' ? 'http://localhost:5000' : '')
  : '';

const LOOKBOOK_COLLECTIONS = [
  {
    id: 'boardroom',
    title: 'The Boardroom Edit',
    subtitle: 'Power dressing for the modern professional',
    mood: 'Professional · Confident · Authoritative',
    accent: '#1a1a1a',
    category: 'Eyeglasses',
    shape: 'Rectangle',
    theme: {
      bg: 'linear-gradient(135deg, #0a0a0f 0%, #1a1028 40%, #0f0820 100%)',
      orb1: 'rgba(26,16,40,0.9)',
      orb2: 'rgba(250,174,98,0.15)',
      orb3: 'rgba(212,137,63,0.1)',
      glassColor: 'rgba(250,174,98,0.12)',
      glassStroke: 'rgba(250,174,98,0.4)',
      accent: '#FAAE62',
      label: 'BOARDROOM',
      emoji: '💼',
      particles: ['✦', '◈', '⬟', '◆'],
    }
  },
  {
    id: 'golden-hour',
    title: 'Golden Hour',
    subtitle: 'Sun-kissed luxury for every outdoor adventure',
    mood: 'Wanderlust · Radiant · Free-spirited',
    accent: '#d4a843',
    category: 'Sunglasses',
    shape: 'Round',
    theme: {
      bg: 'linear-gradient(135deg, #1a0800 0%, #2d1200 40%, #3d2000 100%)',
      orb1: 'rgba(255,160,0,0.2)',
      orb2: 'rgba(255,100,0,0.12)',
      orb3: 'rgba(255,200,50,0.08)',
      glassColor: 'rgba(255,180,0,0.12)',
      glassStroke: 'rgba(255,180,0,0.5)',
      accent: '#FFBB33',
      label: 'GOLDEN HOUR',
      emoji: '☀️',
      particles: ['✦', '★', '⬡', '◉'],
    }
  },
  {
    id: 'midnight-city',
    title: 'Midnight City',
    subtitle: 'Urban edge for the night wanderer',
    mood: 'Bold · Dark · Magnetic',
    accent: '#8b5cf6',
    category: 'Sunglasses',
    shape: 'Square',
    theme: {
      bg: 'linear-gradient(135deg, #05001a 0%, #120033 40%, #0d0028 100%)',
      orb1: 'rgba(139,92,246,0.25)',
      orb2: 'rgba(99,24,200,0.15)',
      orb3: 'rgba(180,120,255,0.08)',
      glassColor: 'rgba(139,92,246,0.12)',
      glassStroke: 'rgba(180,120,255,0.5)',
      accent: '#A78BFA',
      label: 'MIDNIGHT CITY',
      emoji: '🌃',
      particles: ['✦', '◈', '⬟', '◆'],
    }
  },
  {
    id: 'weekend-minimalist',
    title: 'Weekend Minimalist',
    subtitle: 'Clean lines, effortless style',
    mood: 'Calm · Curated · Intentional',
    accent: '#6b7280',
    category: 'Eyeglasses',
    shape: 'Oval',
    theme: {
      bg: 'linear-gradient(135deg, #0c1014 0%, #141c22 40%, #0e151c 100%)',
      orb1: 'rgba(100,160,200,0.18)',
      orb2: 'rgba(60,120,160,0.1)',
      orb3: 'rgba(150,200,220,0.06)',
      glassColor: 'rgba(100,200,240,0.1)',
      glassStroke: 'rgba(120,200,240,0.4)',
      accent: '#7DD3FC',
      label: 'MINIMALIST',
      emoji: '🪞',
      particles: ['✦', '○', '◯', '⬡'],
    }
  },
];

const STYLE_TIPS = [
  {
    number: '01',
    title: 'Match Frame Weight to Face Size',
    tip: 'Larger faces call for bolder, wider frames. Smaller faces look best with delicate, narrow frames that don\'t overwhelm.'
  },
  {
    number: '02',
    title: 'Contrast Your Dominant Feature',
    tip: 'Strong jawlines benefit from round soft frames. Soft round faces gain definition from angular rectangular frames. Oppose, don\'t match.'
  },
  {
    number: '03',
    title: 'The Eyebrow Rule',
    tip: 'Your frame\'s top edge should mirror or slightly follow your natural eyebrow line. Frames that sit below the brow create a heavy look.'
  },
  {
    number: '04',
    title: 'Skin Tone & Frame Colour',
    tip: 'Warm skin tones shine in gold, tortoise, and warm brown frames. Cool undertones look stunning in silver, black, gunmetal, and jewel tones.'
  },
  {
    number: '05',
    title: 'The Nose Bridge Secret',
    tip: 'A low nose bridge? Choose frames with keyhole or saddle bridges. A high bridge? Standard bridge frames sit perfectly and create balance.'
  },
];

export default function Lookbook() {
  const { addToCart } = useCart();
  const { wishlist, toggleWishlist } = useWishlist();
  const [activeCollection, setActiveCollection] = useState(0);
  const [collectionProducts, setCollectionProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const col = LOOKBOOK_COLLECTIONS[activeCollection];
    setLoading(true);
    fetch(`${API_BASE}/api/products?category=${encodeURIComponent(col.category)}&limit=4`)
      .then(res => res.json())
      .then(data => {
        setCollectionProducts(Array.isArray(data) ? data.slice(0, 4) : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [activeCollection]);

  const col = LOOKBOOK_COLLECTIONS[activeCollection];

  return (
    <div className="bg-premium-black min-h-screen">

      {/* 3D Glassmorphism Hero */}
      <div className="relative h-[70vh] flex items-end justify-start overflow-hidden" style={{ background: col.theme.bg }}>

        {/* Animated gradient orbs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute w-[500px] h-[500px] rounded-full blur-[120px] animate-float-slow" style={{ background: col.theme.orb1, top: '-10%', left: '-10%' }} />
          <div className="absolute w-[400px] h-[400px] rounded-full blur-[100px] animate-float-slow2" style={{ background: col.theme.orb2, bottom: '-5%', right: '-5%' }} />
          <div className="absolute w-[300px] h-[300px] rounded-full blur-[80px] animate-float-slow3" style={{ background: col.theme.orb3, top: '40%', left: '50%' }} />
        </div>

        {/* 3D Spectacle Frame SVG — hero centerpiece */}
        <div className="absolute inset-0 flex items-center justify-end pr-8 sm:pr-20 pointer-events-none">
          <div className="relative" style={{ perspective: '1000px' }}>
            {/* Main 3D rotating frame display */}
            <div style={{
              width: '420px',
              height: '260px',
              transformStyle: 'preserve-3d',
              animation: 'glassRotate 8s ease-in-out infinite alternate',
              filter: `drop-shadow(0 0 60px ${col.theme.accent}66)`,
            }}>
              <svg viewBox="0 0 420 200" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%' }}>
                <defs>
                  <linearGradient id={`lensGrad${activeCollection}`} x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor={col.theme.accent} stopOpacity="0.25" />
                    <stop offset="50%" stopColor="white" stopOpacity="0.05" />
                    <stop offset="100%" stopColor={col.theme.accent} stopOpacity="0.15" />
                  </linearGradient>
                  <linearGradient id={`frameGrad${activeCollection}`} x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor={col.theme.accent} stopOpacity="0.9" />
                    <stop offset="100%" stopColor={col.theme.accent} stopOpacity="0.4" />
                  </linearGradient>
                  <filter id="glow">
                    <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                    <feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge>
                  </filter>
                </defs>

                {/* Left lens */}
                <ellipse cx="105" cy="100" rx="88" ry="72" fill={`url(#lensGrad${activeCollection})`} stroke={col.theme.glassStroke} strokeWidth="3" filter="url(#glow)" />
                {/* Left lens inner shine */}
                <ellipse cx="80" cy="78" rx="30" ry="18" fill="white" fillOpacity="0.06" />
                <path d="M 50 80 Q 80 60 110 80" stroke="white" strokeWidth="1.5" strokeOpacity="0.15" fill="none" />

                {/* Right lens */}
                <ellipse cx="315" cy="100" rx="88" ry="72" fill={`url(#lensGrad${activeCollection})`} stroke={col.theme.glassStroke} strokeWidth="3" filter="url(#glow)" />
                {/* Right lens inner shine */}
                <ellipse cx="290" cy="78" rx="30" ry="18" fill="white" fillOpacity="0.06" />
                <path d="M 260 80 Q 290 60 320 80" stroke="white" strokeWidth="1.5" strokeOpacity="0.15" fill="none" />

                {/* Bridge */}
                <path d="M 193 98 Q 210 85 227 98" stroke={`url(#frameGrad${activeCollection})`} strokeWidth="4" fill="none" strokeLinecap="round" filter="url(#glow)" />

                {/* Left temple */}
                <line x1="17" y1="100" x2="-20" y2="110" stroke={`url(#frameGrad${activeCollection})`} strokeWidth="4" strokeLinecap="round" />
                {/* Right temple */}
                <line x1="403" y1="100" x2="440" y2="110" stroke={`url(#frameGrad${activeCollection})`} strokeWidth="4" strokeLinecap="round" />

                {/* Lens rim highlight */}
                <ellipse cx="105" cy="100" rx="88" ry="72" fill="none" stroke="white" strokeWidth="1" strokeOpacity="0.12" />
                <ellipse cx="315" cy="100" rx="88" ry="72" fill="none" stroke="white" strokeWidth="1" strokeOpacity="0.12" />
              </svg>
            </div>

            {/* Floating particles */}
            {col.theme.particles.map((p, i) => (
              <span key={i} style={{
                position: 'absolute',
                color: col.theme.accent,
                opacity: 0.3 + (i * 0.1),
                fontSize: `${14 + i * 4}px`,
                top: `${-20 + i * 35}%`,
                left: `${5 + i * 20}%`,
                animation: `floatParticle${i % 3} ${3 + i}s ease-in-out infinite alternate`,
                filter: `drop-shadow(0 0 8px ${col.theme.accent})`,
              }}>{p}</span>
            ))}

            {/* Collection badge */}
            <div style={{
              position: 'absolute',
              bottom: '-40px',
              left: '50%',
              transform: 'translateX(-50%)',
              background: `rgba(0,0,0,0.5)`,
              border: `1px solid ${col.theme.glassStroke}`,
              backdropFilter: 'blur(12px)',
              borderRadius: '999px',
              padding: '6px 20px',
              whiteSpace: 'nowrap',
            }}>
              <span style={{ color: col.theme.accent, fontWeight: 800, fontSize: '11px', letterSpacing: '0.2em', textTransform: 'uppercase' }}>
                {col.theme.emoji} {col.theme.label}
              </span>
            </div>
          </div>
        </div>

        {/* Grid overlay pattern */}
        <div className="absolute inset-0 pointer-events-none" style={{
          backgroundImage: `linear-gradient(${col.theme.glassStroke} 1px, transparent 1px), linear-gradient(90deg, ${col.theme.glassStroke} 1px, transparent 1px)`,
          backgroundSize: '60px 60px',
          opacity: 0.04,
        }} />

        {/* Bottom fade */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/10 to-transparent" />

        {/* Collection Tabs */}
        <div className="absolute top-8 left-0 right-0 flex justify-center gap-2 z-10 px-4">
          {LOOKBOOK_COLLECTIONS.map((c, idx) => (
            <button
              key={c.id}
              onClick={() => setActiveCollection(idx)}
              className={`text-[10px] font-bold uppercase tracking-widest px-4 py-2 rounded-full border transition-all ${
                idx === activeCollection
                  ? 'bg-white text-premium-black border-white'
                  : 'bg-black/30 text-white border-white/30 hover:border-white hover:bg-white/10 backdrop-blur-sm'
              }`}
            >
              {c.title.split(' ')[0]}
            </button>
          ))}
        </div>

        {/* Hero Text */}
        <div className="relative z-10 p-8 sm:p-14 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 bg-white/10 border border-white/20 text-white/80 px-3 py-1 rounded text-[10px] font-bold uppercase tracking-widest mb-3 backdrop-blur-sm">
            <Sparkles className="w-3 h-3" /> Seasonal Collection
          </div>
          <h1 className="font-serif text-4xl sm:text-6xl font-bold text-white leading-none mb-3">
            {col.title}
          </h1>
          <p className="text-white/70 text-sm mb-2">{col.subtitle}</p>
          <p className="text-white/50 text-xs uppercase tracking-widest font-semibold mb-6">{col.mood}</p>
          <Link
            href={`/shop?category=${col.category}`}
            className="inline-flex items-center gap-2 bg-white text-premium-black hover:bg-premium-accent font-bold text-xs tracking-widest uppercase px-8 py-3.5 rounded transition-all"
          >
            Shop this Look <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Featured Products from Collection */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex items-center justify-between mb-8">
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-premium-black">
            Shop The {col.title.split(' The ')[1] || col.title}
          </h2>
          <Link
            href={`/shop?category=${col.category}`}
            className="text-xs font-bold uppercase tracking-widest text-premium-accent hover:text-premium-golddark transition-colors flex items-center gap-1"
          >
            View All <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
            {[1,2,3,4].map(i => (
              <div key={i} className="bg-gray-100 rounded-lg animate-pulse h-64" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
            {collectionProducts.map(product => (
              <div key={product.id} className="group bg-white border border-premium-border rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                <Link href={`/product/${product.id}`} className="block relative overflow-hidden">
                  <img
                    src={product.image_urls[0]}
                    alt={product.name}
                    className="w-full h-44 object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </Link>
                <div className="p-3">
                  <Link href={`/product/${product.id}`} className="block font-bold text-sm text-premium-black hover:text-premium-accent transition-colors truncate mb-1">
                    {product.name}
                  </Link>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-premium-accent text-sm">₹{parseFloat(product.price).toLocaleString('en-IN')}</span>
                    <div className="flex gap-1.5">
                      <button
                        onClick={() => toggleWishlist(product)}
                        className={`p-1.5 border rounded transition-all ${wishlist.some(w => w.id === product.id) ? 'border-red-200 text-red-500 bg-red-50' : 'border-premium-border text-premium-gray hover:border-premium-accent'}`}
                      >
                        <Heart className={`w-3.5 h-3.5 ${wishlist.some(w => w.id === product.id) ? 'fill-current' : ''}`} />
                      </button>
                      <button
                        onClick={() => addToCart(product)}
                        className="p-1.5 border border-premium-border rounded text-premium-gray hover:border-premium-black hover:text-premium-black transition-all"
                      >
                        <ShoppingBag className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Style Tips Section */}
      <div className="bg-premium-black py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-white mb-3">
              The Style <span className="text-premium-accent">Manual</span>
            </h2>
            <p className="text-gray-400 text-sm font-light">Expert tips from our optical stylists.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            {STYLE_TIPS.map(tip => (
              <div key={tip.number} className="border border-white/10 rounded-lg p-6 hover:border-premium-accent/40 transition-all bg-white/5">
                <span className="font-serif text-4xl font-bold text-premium-accent/30 block mb-3">{tip.number}</span>
                <h3 className="font-bold text-white text-sm mb-2">{tip.title}</h3>
                <p className="text-gray-400 text-xs leading-relaxed">{tip.tip}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Instagram-style UGC Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <div className="inline-flex items-center gap-2 text-premium-gray text-sm font-semibold mb-4">
          <Camera className="w-5 h-5" /> Share Your Style
        </div>
        <h2 className="font-serif text-2xl sm:text-3xl font-bold text-premium-black mb-3">
          Wear It. Share It. Inspire Others.
        </h2>
        <p className="text-premium-gray text-sm mb-6 max-w-md mx-auto font-light">
          Tag your photos with <strong>#LekyaSpecs</strong> and get featured on our official lookbook page. Community members who get featured receive a surprise discount code!
        </p>
        <a
          href="https://instagram.com"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 border border-premium-border hover:border-premium-black text-premium-dark font-bold text-xs tracking-widest uppercase px-8 py-3 rounded transition-all"
        >
          Follow @LekyaSpecs <Camera className="w-4 h-4" />
        </a>
      </div>

    </div>
  );
}
