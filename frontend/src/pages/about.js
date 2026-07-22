const React = require('react');
const { useState } = React;
const Link = require('next/link').default;
const Head = require('next/head').default;
const { 
  Sparkles, 
  ArrowRight, 
  ShieldCheck, 
  Award, 
  Globe, 
  ExternalLink, 
  TrendingUp, 
  Users, 
  CheckCircle2, 
  Layers, 
  Cpu, 
  Zap, 
  Truck, 
  Building2,
  ChevronRight
} = require('lucide-react');

// ── Custom SVG Corporate Brand Logos ─────────────────────────────────────────

// 1. Lekya Specs Logo
function LekyaSpecsLogo({ className = "w-10 h-10" }) {
  return (
    <svg viewBox="0 0 88 40" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <rect x="2" y="8" width="34" height="24" rx="12" stroke="#FAAE62" strokeWidth="3.5" fill="none"/>
      <rect x="52" y="8" width="34" height="24" rx="12" stroke="#FAAE62" strokeWidth="3.5" fill="none"/>
      <path d="M36 20 Q44 14 52 20" stroke="#FAAE62" strokeWidth="3" fill="none" strokeLinecap="round"/>
      <circle cx="14" cy="16" r="2.5" fill="#FAAE62" opacity="0.6"/>
      <circle cx="66" cy="16" r="2.5" fill="#FAAE62" opacity="0.6"/>
    </svg>
  );
}

// 2. Lekya Logistics Logo
function LekyaLogisticsLogo({ className = "w-10 h-10" }) {
  return (
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <rect width="100" height="100" rx="20" fill="url(#logistics_grad)"/>
      <path d="M22 62L44 32H78L56 62H22Z" fill="white" opacity="0.95"/>
      <path d="M35 68L52 44H86L69 68H35Z" fill="#60A5FA" opacity="0.85"/>
      <circle cx="32" cy="74" r="5" fill="#2563EB"/>
      <circle cx="68" cy="74" r="5" fill="#2563EB"/>
      <path d="M72 40L88 40L80 52L64 52L72 40Z" fill="#F59E0B"/>
      <defs>
        <linearGradient id="logistics_grad" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
          <stop stopColor="#1E3A8A"/>
          <stop offset="1" stopColor="#3B82F6"/>
        </linearGradient>
      </defs>
    </svg>
  );
}

// 3. Parcel Uncle Logo
function ParcelUncleLogo({ className = "w-10 h-10" }) {
  return (
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <rect width="100" height="100" rx="20" fill="url(#parcel_grad)"/>
      {/* Cube Box Wireframe */}
      <path d="M50 20L80 35L50 50L20 35L50 20Z" fill="#FDBA74"/>
      <path d="M20 35L50 50V80L20 65V35Z" fill="#EA580C"/>
      <path d="M80 35L50 50V80L80 65V35Z" fill="#C2410C"/>
      {/* Wing Arrow */}
      <path d="M38 48L62 34L50 62L46 50L38 48Z" fill="#FEF08A"/>
      <defs>
        <linearGradient id="parcel_grad" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
          <stop stopColor="#7C2D12"/>
          <stop offset="1" stopColor="#EA580C"/>
        </linearGradient>
      </defs>
    </svg>
  );
}

// 4. Infinior Advisors Logo
function InfiniorAdvisorsLogo({ className = "w-10 h-10" }) {
  return (
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <rect width="100" height="100" rx="20" fill="url(#infinior_grad)"/>
      {/* Infinity Symbol + Arrow */}
      <path d="M30 50C30 42 38 42 43 47L57 53C62 58 70 58 70 50C70 42 62 42 57 47L43 53C38 58 30 58 30 50Z" stroke="white" strokeWidth="6" strokeLinecap="round" fill="none"/>
      <path d="M68 34L82 48L68 62" stroke="#A78BFA" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
      <defs>
        <linearGradient id="infinior_grad" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
          <stop stopColor="#4C1D95"/>
          <stop offset="1" stopColor="#8B5CF6"/>
        </linearGradient>
      </defs>
    </svg>
  );
}

// 5. Lekya Energy Logo (Matching lekyaenergy.com emblem)
function LekyaEnergyLogo({ className = "w-10 h-10" }) {
  return (
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <rect width="100" height="100" rx="20" fill="url(#energy_grad)"/>
      {/* Sun Circle & Solar Array */}
      <circle cx="50" cy="36" r="16" fill="#FBBF24"/>
      <path d="M22 68L36 50H64L78 68H22Z" fill="#065F46"/>
      <path d="M25 66L37 52H48V66H25Z" fill="#10B981" opacity="0.8"/>
      <path d="M52 52H63L75 66H52V52Z" fill="#34D399" opacity="0.9"/>
      {/* Energy Spark */}
      <path d="M48 24L42 38H52L46 54L60 36H50L56 24H48Z" fill="#FEF08A"/>
      <defs>
        <linearGradient id="energy_grad" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
          <stop stopColor="#064E3B"/>
          <stop offset="1" stopColor="#059669"/>
        </linearGradient>
      </defs>
    </svg>
  );
}

export default function About() {
  const [activeTab, setActiveTab] = useState('all');

  const groupCompanies = [
    {
      id: 'specs',
      name: 'Lekya Specs',
      category: 'Eyewear & Fashion Optics',
      desc: 'High-precision eyewear e-commerce platform incorporating 3D Virtual Try-On, client-side AI Face Shape Detection, custom lens refraction configurators, and Mazzucchelli hand-polished acetate optics.',
      tag: 'Luxury Retail',
      tagColor: 'bg-amber-100 text-amber-900 border-amber-300',
      logo: LekyaSpecsLogo,
      stats: '50K+ Customers · 99.4% CSAT',
      link: '/shop',
      domain: 'lekyaspecs.com',
      btnColor: 'bg-amber-500 hover:bg-amber-400 text-black',
      isInternal: true
    },
    {
      id: 'logistics',
      name: 'Lekya Logistics',
      category: 'Supply Chain & Freight Infrastructure',
      desc: 'Nationwide Pan-India logistics infrastructure featuring automated smart fulfillment hubs, B2B express line-haul transportation, optimized warehouse routing, and temperature-controlled freight.',
      tag: 'Pan-India Freight',
      tagColor: 'bg-blue-100 text-blue-900 border-blue-300',
      logo: LekyaLogisticsLogo,
      stats: '1.2M+ Shipments Dispatched',
      link: 'https://lekyalogistics.com',
      domain: 'lekyalogistics.com',
      btnColor: 'bg-blue-600 hover:bg-blue-500 text-white',
      isInternal: false
    },
    {
      id: 'parcel',
      name: 'Parcel Uncle',
      category: 'Hyperlocal Courier & Express Shipping',
      desc: 'Ultra-fast urban shipping network for direct-to-consumer brands and local merchants. Offers API-driven automated dispatch, live rider GPS tracking, and same-day delivery guarantees.',
      tag: 'Hyperlocal Express',
      tagColor: 'bg-orange-100 text-orange-900 border-orange-300',
      logo: ParcelUncleLogo,
      stats: '500K+ Orders Handled',
      link: 'https://parceluncle.com',
      domain: 'parceluncle.com',
      btnColor: 'bg-orange-600 hover:bg-orange-500 text-white',
      isInternal: false
    },
    {
      id: 'infinior',
      name: 'Infinior Advisors',
      category: 'Corporate Growth & Financial Consulting',
      desc: 'Premier financial and business advisory firm providing strategic M&A guidance, tax planning, capital structuring, corporate governance, and digital transformation consulting for high-growth enterprises.',
      tag: 'Corporate Advisory',
      tagColor: 'bg-purple-100 text-purple-900 border-purple-300',
      logo: InfiniorAdvisorsLogo,
      stats: '₹500Cr+ Deals Advised',
      link: 'https://infinioradvisors.com',
      domain: 'infinioradvisors.com',
      btnColor: 'bg-purple-600 hover:bg-purple-500 text-white',
      isInternal: false
    },
    {
      id: 'energy',
      name: 'Lekya Energy',
      category: 'Clean Solar & Renewable Infrastructure',
      desc: 'Pioneering clean energy transitions through utility-scale solar parks, rooftop photovoltaic systems for industrial enterprises, energy storage networks, and zero-emission green power initiatives.',
      tag: 'Clean Energy ☀️',
      tagColor: 'bg-emerald-100 text-emerald-900 border-emerald-300',
      logo: LekyaEnergyLogo,
      stats: '150MW+ Solar Commissioned',
      link: 'https://lekyaenergy.com',
      domain: 'lekyaenergy.com',
      btnColor: 'bg-emerald-500 hover:bg-emerald-400 text-black',
      isInternal: false,
      isHighlight: true
    }
  ];

  return (
    <div className="bg-white min-h-screen">
      <Head>
        <title>About Us & Lekya Group Ecosystem | Lekya Specs</title>
        <meta name="description" content="Discover the legacy of Lekya Group — pioneering excellence across luxury eyewear (Lekya Specs), logistics, shipping, advisory, and clean solar energy (Lekya Energy)." />
      </Head>

      {/* 1. Hero Header */}
      <section className="relative py-24 sm:py-32 bg-[#090a0f] text-white overflow-hidden border-b border-premium-border">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-600/15 via-transparent to-transparent pointer-events-none" />
        <div className="absolute top-10 left-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <span className="inline-flex items-center gap-2 bg-amber-500/15 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full mb-6">
            <Sparkles className="w-3.5 h-3.5" /> Corporate Legacy & Group Vision
          </span>
          <h1 className="font-serif text-4xl sm:text-6xl font-bold tracking-tight text-white mb-6 leading-[1.1]">
            Engineering Disruption. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-amber-400 to-amber-200">
              Empowering Global Futures.
            </span>
          </h1>
          <p className="text-gray-300 text-base sm:text-lg font-light max-w-3xl mx-auto leading-relaxed mb-10">
            Lekya Group is a multi-disciplinary corporate powerhouse operating at the intersection of luxury e-commerce fashion optics, nationwide logistics infrastructure, financial advisory, and clean renewable energy.
          </p>

          {/* Key Metrics Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto pt-8 border-t border-white/10">
            {[
              { label: 'Group Entities', val: '5 Companies' },
              { label: 'Active Customers', val: '2M+ Served' },
              { label: 'Clean Power Output', val: '150MW Solar' },
              { label: 'Pan-India Reach', val: '28+ States' },
            ].map(({ label, val }) => (
              <div key={label} className="bg-white/5 border border-white/10 rounded-xl p-4 text-center backdrop-blur-sm">
                <p className="text-xl sm:text-2xl font-bold text-amber-400 font-mono mb-1">{val}</p>
                <p className="text-xs text-gray-400 uppercase tracking-wider">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 2. Brand Story / Philosophy */}
      <section className="py-20 sm:py-28 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-6">
            <span className="text-xs font-bold uppercase tracking-widest text-premium-accent">Our Foundations</span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-premium-black tracking-tight leading-tight">
              Crafting Perfection in Every Detail — From Optics to Infrastructure
            </h2>
            <p className="text-premium-gray text-base leading-relaxed font-light">
              At **Lekya Specs**, we revolutionized the eyewear industry by eliminating traditional luxury retail markups and introducing client-side smart computer vision algorithms to match customers with their mathematically ideal frame shapes.
            </p>
            <p className="text-premium-gray text-base leading-relaxed font-light">
              As part of the **Lekya Group**, our mission extends beyond optics. Through our subsidiary entities in freight supply chain (**Lekya Logistics** & **Parcel Uncle**), corporate advisory (**Infinior Advisors**), and clean solar infrastructure (**Lekya Energy**), we build end-to-end ecosystems designed for resilience, speed, and environmental sustainability.
            </p>
            <div className="pt-4 flex flex-wrap gap-4">
              <div className="flex items-center gap-2 text-xs font-bold text-premium-black bg-premium-light px-3.5 py-2 rounded-lg border border-premium-border">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Italian Acetate & Titanium
              </div>
              <div className="flex items-center gap-2 text-xs font-bold text-premium-black bg-premium-light px-3.5 py-2 rounded-lg border border-premium-border">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" /> 100% Carbon-Neutral Energy Focus
              </div>
              <div className="flex items-center gap-2 text-xs font-bold text-premium-black bg-premium-light px-3.5 py-2 rounded-lg border border-premium-border">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Precision 3D Optical Fitting
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="relative rounded-2xl overflow-hidden border border-premium-border shadow-2xl bg-premium-dark aspect-[4/3] group">
              <img 
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=1000&q=80" 
                alt="Lekya Group Philosophy" 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-90"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
                <p className="text-xs uppercase tracking-widest text-amber-400 font-bold mb-1">Corporate Mission</p>
                <h3 className="font-serif text-2xl font-bold mb-2">Uncompromising Quality & Innovation</h3>
                <p className="text-xs text-gray-300 font-light leading-relaxed">
                  "Excellence is not an act, but a habit embedded across every Lekya Group venture."
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. GROUP COMPANIES SHOWCASE SECTION (HIGH DEFINITION & INTERACTIVE HOVER CARDS) */}
      <section className="py-20 sm:py-28 bg-[#090b14] text-white relative overflow-hidden border-y border-premium-border/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="inline-flex items-center gap-2 bg-amber-500/15 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full mb-4">
              <Building2 className="w-3.5 h-3.5" /> Group Corporate Ecosystem
            </span>
            <h2 className="font-serif text-3xl sm:text-5xl font-bold tracking-tight text-white mb-4">
              Explore Our Group Companies
            </h2>
            <p className="text-gray-400 text-sm font-light leading-relaxed">
              Hover over any entity to explore its corporate profile, capabilities, and key operating metrics across the Lekya Group ecosystem. Click any company to visit its direct web platform!
            </p>
          </div>

          {/* Group Grid Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {groupCompanies.map(comp => {
              const LogoComponent = comp.logo;
              const isHighlight = comp.isHighlight;

              return (
                <div 
                  key={comp.id}
                  className={`group relative rounded-2xl p-7 transition-all duration-300 flex flex-col justify-between ${
                    isHighlight 
                      ? 'bg-gradient-to-b from-emerald-950/90 via-emerald-900/40 to-black/95 border-2 border-emerald-500/70 hover:border-emerald-400 shadow-[0_0_40px_rgba(16,185,129,0.25)]' 
                      : 'bg-white/5 border border-white/10 hover:border-amber-500/60 hover:bg-white/10 hover:shadow-2xl'
                  }`}
                >
                  {/* Subtle Background Glow on Hover */}
                  <div className={`absolute -top-16 -right-16 w-32 h-32 rounded-full blur-2xl group-hover:scale-150 transition-transform ${isHighlight ? 'bg-emerald-500/20' : 'bg-amber-500/10'}`} />

                  <div>
                    {/* Header: Brand Logo & Tag */}
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-white/10 rounded-xl border border-white/15 group-hover:scale-105 transition-transform shadow-md">
                          <LogoComponent className="w-10 h-10" />
                        </div>
                        <div>
                          <h3 className={`text-xl font-bold tracking-tight ${isHighlight ? 'text-emerald-300' : 'text-white group-hover:text-amber-400'} transition-colors`}>
                            {comp.name}
                          </h3>
                          <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">{comp.category}</p>
                        </div>
                      </div>

                      <span className={`text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full border ${comp.tagColor}`}>
                        {comp.tag}
                      </span>
                    </div>

                    {/* Description */}
                    <p className="text-gray-300 text-xs sm:text-sm leading-relaxed font-light mb-6">
                      {comp.desc}
                    </p>
                  </div>

                  <div>
                    {/* Operating Metric Badge */}
                    <div className="py-2.5 px-3.5 bg-white/5 border border-white/10 rounded-lg mb-6 flex items-center justify-between text-xs text-gray-300 font-mono">
                      <span className="text-[10px] text-gray-400 uppercase tracking-widest">Metric</span>
                      <span className="font-bold text-amber-400">{comp.stats}</span>
                    </div>

                    {/* Action Link Button */}
                    {comp.isInternal ? (
                      <Link
                        href={comp.link}
                        className={`w-full py-3.5 px-4 rounded-xl font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-lg ${comp.btnColor}`}
                      >
                        Visit {comp.domain} <ArrowRight className="w-4 h-4" />
                      </Link>
                    ) : (
                      <a
                        href={comp.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`w-full py-3.5 px-4 rounded-xl font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-lg ${comp.btnColor}`}
                      >
                        Visit {comp.domain} <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 4. Core Values Grid */}
      <section className="py-20 sm:py-28 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-bold uppercase tracking-widest text-premium-accent">Guiding Pillars</span>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-premium-black tracking-tight mb-2">
            Built On Core Corporate Values
          </h2>
          <p className="text-premium-gray text-sm font-light">The foundational standards governing every service and product across our entities.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { icon: Award, title: 'Precision Craftsmanship', desc: 'Every frame and service undergoes multi-stage technical inspection for perfection.' },
            { icon: Cpu, title: 'AI & Technological Leadership', desc: 'Pioneering proprietary computer vision neural networks for face shape optical fitting.' },
            { icon: Zap, title: 'Clean Sustainable Future', desc: 'Dedicated to green renewable solar energy solutions via Lekya Energy.' },
            { icon: ShieldCheck, title: 'Unwavering Customer Trust', desc: '100% transparent pricing, zero hidden charges, and continuous support across brands.' },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="bg-premium-light border border-premium-border rounded-2xl p-6 hover:bg-white hover:shadow-xl hover:border-premium-accent/50 transition-all flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-premium-accent/15 border border-premium-accent/30 flex items-center justify-center mb-5 text-premium-golddark">
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-base text-premium-black mb-2">{title}</h3>
                <p className="text-xs text-premium-gray leading-relaxed font-light">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. Call to Action Banner */}
      <section className="bg-gradient-to-r from-premium-accent via-yellow-400 to-premium-accent py-16 text-center text-premium-black">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-serif text-3xl sm:text-4xl font-bold mb-4">
            Experience the Vision of Lekya Specs
          </h2>
          <p className="text-premium-black/80 text-sm max-w-xl mx-auto mb-8 font-medium leading-relaxed">
            Discover our collection of handcrafted Italian acetate and ultra-light titanium eyeglasses and sunglasses.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link 
              href="/shop" 
              className="bg-premium-black text-white hover:bg-white hover:text-premium-black px-8 py-4 rounded font-bold text-xs uppercase tracking-widest transition-all shadow-xl"
            >
              Shop Eyewear Catalog
            </Link>
            <a 
              href="https://lekyaenergy.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="bg-emerald-900 text-white hover:bg-emerald-950 px-8 py-4 rounded font-bold text-xs uppercase tracking-widest transition-all flex items-center gap-2 shadow-xl"
            >
              Explore Lekya Energy <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>
      </section>

    </div>
  );
}
