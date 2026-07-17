const React = require('react');
const Link = require('next/link').default;
const Head = require('next/head').default;
const { ArrowLeft, Navigation, ShoppingBag, User, Sparkles, HelpCircle, ShieldAlert } = require('lucide-react');

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
    const rotateX = -(y - centerY) / 12; 
    const rotateY = (x - centerX) / 12;  

    setTransformStyle(`perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.015, 1.015, 1.015)`);
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

export default function Sitemap() {
  return (
    <>
      <Head>
        <title>Sitemap &amp; Directory — Lekya Specs Eyewear</title>
        <meta name="description" content="View the complete visual sitemap directory for Lekya Specs. Access shopping catalogs, interactive visual modules, and support dashboards." />
      </Head>

      <div className="bg-premium-light min-h-screen py-16 px-4 sm:px-6 lg:px-8 text-premium-dark font-sans">
        <div className="max-w-4xl mx-auto">
          
          {/* Back button */}
          <div className="mb-10">
            <Link href="/" className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-premium-accent font-bold hover:text-premium-black transition-colors" style={{ textDecoration: 'none' }}>
              <ArrowLeft className="w-4 h-4" /> Back to Home
            </Link>
          </div>

          {/* Heading */}
          <div className="border-b border-premium-accent/20 pb-8 mb-12">
            <div className="flex items-center gap-3 mb-4">
              <Navigation className="w-8 h-8 text-premium-accent" />
              <span className="text-xs uppercase tracking-widest text-premium-gray font-bold">Lekya Specs Directory</span>
            </div>
            <h1 className="font-serif text-4xl sm:text-5xl font-bold text-premium-black tracking-tight">
              Website Sitemap
            </h1>
            <p className="text-xs text-premium-gray font-medium mt-3">
              Comprehensive list of all curated client and administration pages.
            </p>
          </div>

          {/* Sitemap Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-sm">
            
            {/* Column 1: Shopping Experience */}
            <ThreeDTiltCard className="h-full">
              <div className="border border-premium-accent/20 bg-white/40 backdrop-blur p-6 rounded-lg shadow-sm space-y-4 h-full hover:border-premium-accent/50 transition-colors">
                <h3 className="font-serif text-lg font-bold text-premium-black border-b border-premium-accent/25 pb-2 flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5 text-premium-accent" />
                  Eyewear Storefront
                </h3>
                <div className="flex flex-col gap-2">
                  <Link href="/" className="hover:text-premium-accent transition-colors font-semibold">🏠 Home / Landing Page</Link>
                  <span className="text-xs text-premium-gray font-light">Hero banner customizer, featured spotlight frames, and reward introductions.</span>
                </div>
                <div className="flex flex-col gap-2 pt-2">
                  <Link href="/shop" className="hover:text-premium-accent transition-colors font-semibold">🕶️ Shop Eyewear Catalog</Link>
                  <span className="text-xs text-premium-gray font-light">Filter by category (eyeglasses/sunglasses), shapes (rectangle, round), colors, and gender fits.</span>
                </div>
                <div className="flex flex-col gap-2 pt-2">
                  <Link href="/compare" className="hover:text-premium-accent transition-colors font-semibold">🔲 Product Comparison Tray</Link>
                  <span className="text-xs text-premium-gray font-light">Compare frame sizes, prices, and dimensions side-by-side.</span>
                </div>
              </div>
            </ThreeDTiltCard>

            {/* Column 2: Smart Discovery Lab */}
            <ThreeDTiltCard className="h-full">
              <div className="border border-premium-accent/20 bg-white/40 backdrop-blur p-6 rounded-lg shadow-sm space-y-4 h-full hover:border-premium-accent/50 transition-colors">
                <h3 className="font-serif text-lg font-bold text-premium-black border-b border-premium-accent/25 pb-2 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-premium-accent" />
                  Smart Discovery Lab
                </h3>
                <div className="flex flex-col gap-2">
                  <Link href="/tryon" className="hover:text-premium-accent transition-colors font-semibold">🥽 Virtual Try-On Studio</Link>
                  <span className="text-xs text-premium-gray font-light">Overhauled 2D try-on with precision background removal, live webcam mode, and split preview divider.</span>
                </div>
                <div className="flex flex-col gap-2 pt-2">
                  <Link href="/face-shape" className="hover:text-premium-accent transition-colors font-semibold">🔍 Face Shape Scanner</Link>
                  <span className="text-xs text-premium-gray font-light">Local browser scans classifying face geometry to recommend the ideal eyeglasses.</span>
                </div>
                <div className="flex flex-col gap-2 pt-2">
                  <Link href="/skin-analysis" className="hover:text-premium-accent transition-colors font-semibold">🎨 Skin Tone Matcher</Link>
                  <span className="text-xs text-premium-gray font-light">Color pixel sampling recommending metal frame finishes based on warm/cool undertones.</span>
                </div>
                <div className="flex flex-col gap-2 pt-2">
                  <Link href="/style-quiz" className="hover:text-premium-accent transition-colors font-semibold">💡 Smart Style Quiz</Link>
                  <span className="text-xs text-premium-gray font-light">Answer styling queries to reveal your curated eyewear matches.</span>
                </div>
              </div>
            </ThreeDTiltCard>

            {/* Column 3: Customer Accounts */}
            <ThreeDTiltCard className="h-full">
              <div className="border border-premium-accent/20 bg-white/40 backdrop-blur p-6 rounded-lg shadow-sm space-y-4 h-full hover:border-premium-accent/50 transition-colors">
                <h3 className="font-serif text-lg font-bold text-premium-black border-b border-premium-accent/25 pb-2 flex items-center gap-2">
                  <User className="w-5 h-5 text-premium-accent" />
                  Profile &amp; Checkout
                </h3>
                <div className="flex flex-col gap-2">
                  <Link href="/account" className="hover:text-premium-accent transition-colors font-semibold">👤 Account Dashboard</Link>
                  <span className="text-xs text-premium-gray font-light">Loyalty points, referral links, order dispatch updates, and face scan records.</span>
                </div>
                <div className="flex flex-col gap-2 pt-2">
                  <Link href="/cart" className="hover:text-premium-accent transition-colors font-semibold">🛒 Shopping Cart</Link>
                  <span className="text-xs text-premium-gray font-light">Review selected frames, apply coupons, and start checkout.</span>
                </div>
                <div className="flex flex-col gap-2 pt-2">
                  <Link href="/wishlist" className="hover:text-premium-accent transition-colors font-semibold">❤️ Favorite Wishlist</Link>
                  <span className="text-xs text-premium-gray font-light">Store specific frame favorites to purchase later.</span>
                </div>
              </div>
            </ThreeDTiltCard>

            {/* Column 4: Customer Helpdesk & Legal */}
            <ThreeDTiltCard className="h-full">
              <div className="border border-premium-accent/20 bg-white/40 backdrop-blur p-6 rounded-lg shadow-sm space-y-4 h-full hover:border-premium-accent/50 transition-colors">
                <h3 className="font-serif text-lg font-bold text-premium-black border-b border-premium-accent/25 pb-2 flex items-center gap-2">
                  <HelpCircle className="w-5 h-5 text-premium-accent" />
                  Support &amp; Policies
                </h3>
                <div className="flex flex-col gap-2">
                  <Link href="/contact" className="hover:text-premium-accent transition-colors font-semibold">📞 Contact Support</Link>
                  <span className="text-xs text-premium-gray font-light">Open direct support queries to the administrator team.</span>
                </div>
                <div className="flex flex-col gap-2 pt-2">
                  <Link href="/privacy" className="hover:text-premium-accent transition-colors font-semibold">🛡️ Privacy Policy Disclosures</Link>
                  <span className="text-xs text-premium-gray font-light">Biometrics transparency, transaction parameters, and cookie storage declarations.</span>
                </div>
                <div className="flex flex-col gap-2 pt-2">
                  <Link href="/terms" className="hover:text-premium-accent transition-colors font-semibold">⚖️ Terms of Service</Link>
                  <span className="text-xs text-premium-gray font-light">Order cancellations, custom prescription verifications, and delivery timelines.</span>
                </div>
              </div>
            </ThreeDTiltCard>

          </div>

          {/* Admin Management Directory Block */}
          <ThreeDTiltCard className="mt-8">
            <div className="border border-premium-accent/20 bg-white/20 backdrop-blur p-6 rounded-lg shadow-sm space-y-4 hover:border-premium-accent/50 transition-colors">
              <h3 className="font-serif text-lg font-bold text-premium-black border-b border-premium-accent/25 pb-2 flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-premium-accent" />
                Administrative Portals (Protected)
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Link href="/admin" className="hover:text-premium-accent transition-colors font-semibold text-xs uppercase tracking-wider block">🛡️ Operations Control Dashboard</Link>
                  <span className="text-[11px] text-premium-gray font-light block mt-1">Manage orders, complete product CRUD, inspect customers, trigger emails, and view DB health benchmarks.</span>
                </div>
                <div>
                  <Link href="/stylist" className="hover:text-premium-accent transition-colors font-semibold text-xs uppercase tracking-wider block">🎨 Brand Stylist Curation Board</Link>
                  <span className="text-[11px] text-premium-gray font-light block mt-1">Create themed lookbooks, link face recommendations, pin featured items, verify brand copy, and test fits in sandbox.</span>
                </div>
              </div>
            </div>
          </ThreeDTiltCard>

        </div>
      </div>
    </>
  );
}
