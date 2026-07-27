const React = require('react');
const { useState } = React;
const Link = require('next/link').default;
const VisionEyeLogo = require('./VisionEyeLogo');
const { ChevronDown, Menu, X, Sparkles, ArrowRight, Eye, Star, Infinity } = require('lucide-react');

const BG_VIDEO = 'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260511_230229_7c9bc431-46cf-489a-948d-e8144d8eb5d4.mp4';

function LiquidGlassHero() {
  const [menuOpen, setMenuOpen] = useState(false);

  const navLinks = [
    { label: 'Home', active: true, href: '/' },
    { label: 'Eyeglasses', dropdown: true, href: '/shop?category=Eyeglasses' },
    { label: 'Sunglasses', dropdown: true, href: '/shop?category=Sunglasses' },
    { label: 'AR Try-On', href: '/tryon' },
    { label: 'Our Team', href: '/about' },
  ];

  return (
    <div className="relative w-full h-screen overflow-hidden text-white font-sans">
      
      {/* Background Looping HD Video */}
      <video
        autoPlay
        muted
        loop
        playsInline
        className="absolute inset-0 w-full h-full object-cover z-0"
        src={BG_VIDEO}
      />

      {/* Dark Ambient Overlay Gradients */}
      <div className="absolute inset-0 z-1 bg-gradient-to-b from-[#0D0016]/80 via-[#0D0016]/40 to-[#0D0016]/95 pointer-events-none" />
      <div className="absolute inset-0 z-1 bg-radial-at-c from-[#FAAE62]/10 via-transparent to-transparent pointer-events-none" />

      {/* NAVBAR */}
      <nav className="absolute top-0 left-0 right-0 z-30 flex items-center justify-between px-5 sm:px-8 py-5">
        
        {/* Brand Logo (Left) */}
        <Link href="/" className="flex items-center gap-2.5 hover:opacity-90 transition-opacity">
          <VisionEyeLogo size={36} showText={true} tagline="See Beyond. Deliver More." showTagline={true} />
        </Link>

        {/* Center Nav Pill (Desktop) */}
        <div className="hidden md:flex liquid-glass items-center gap-1 rounded-xl px-2 py-2">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className={`flex items-center gap-1 px-3.5 py-1.5 rounded-lg text-xs uppercase font-bold tracking-wider transition-all ${
                link.active
                  ? 'bg-white/20 text-white shadow-sm'
                  : 'text-white/80 hover:text-white hover:bg-white/10'
              }`}
            >
              <span>{link.label}</span>
              {link.dropdown && <ChevronDown size={13} className="mt-px opacity-70" />}
            </Link>
          ))}
        </div>

        {/* Right CTAs (Desktop) */}
        <div className="hidden md:flex items-center gap-3">
          <Link
            href="/account"
            className="liquid-glass text-white text-xs uppercase font-bold tracking-wider px-5 py-2.5 rounded-full hover:bg-white/10 transition-all"
          >
            Log in
          </Link>
          <Link
            href="/shop"
            className="bg-white text-black text-xs uppercase font-bold tracking-wider px-5 py-2.5 rounded-full hover:bg-white/90 transition-all shadow-lg"
          >
            Begin Now
          </Link>
        </div>

        {/* Mobile Toggle Button */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden liquid-glass text-white p-2.5 rounded-xl flex items-center justify-center"
          aria-label="Toggle menu"
        >
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>

      </nav>

      {/* MOBILE MENU DRAWER */}
      {menuOpen && (
        <div className="absolute top-[76px] left-4 right-4 z-40 md:hidden liquid-glass rounded-2xl p-5 flex flex-col gap-2 shadow-2xl animate-fade-in">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className="flex items-center justify-between w-full px-4 py-3 rounded-xl text-xs uppercase font-bold tracking-wider text-white hover:bg-white/10 transition-colors"
            >
              <span>{link.label}</span>
              {link.dropdown && <ChevronDown size={14} />}
            </Link>
          ))}
          <div className="flex gap-3 mt-3 pt-3 border-t border-white/15">
            <Link
              href="/account"
              onClick={() => setMenuOpen(false)}
              className="flex-1 text-center liquid-glass text-white text-xs font-bold uppercase tracking-wider py-3 rounded-xl"
            >
              Log in
            </Link>
            <Link
              href="/shop"
              onClick={() => setMenuOpen(false)}
              className="flex-1 text-center bg-white text-black text-xs font-bold uppercase tracking-wider py-3 rounded-xl"
            >
              Begin Now
            </Link>
          </div>
        </div>
      )}

      {/* HERO CONTENT (BOTTOM-LEFT / CENTER) */}
      <div className="absolute bottom-0 left-0 z-20 px-6 sm:px-12 pb-10 sm:pb-16 max-w-2xl">
        {/* Liquid Glass Badge */}
        <div className="liquid-glass inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold tracking-widest uppercase text-[#FAAE62] mb-4">
          <Sparkles className="w-3.5 h-3.5" />
          Liquid Glass Optical Collection
        </div>

        <h1 className="text-white text-4xl sm:text-5xl lg:text-6xl font-serif font-bold leading-tight tracking-tight mb-4">
          Live Better, Feel Whole Every Day
        </h1>

        <p className="text-white/70 text-sm sm:text-base leading-relaxed mb-7 max-w-lg font-light">
          Take charge of how you feel with a companion built for your journey—build routines, follow your growth, and unlock tailored insights for a steadier, more vibrant life each day.
        </p>

        {/* Buttons Row */}
        <div className="flex flex-wrap items-center gap-3">
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
      </div>

    </div>
  );
}

module.exports = LiquidGlassHero;
module.exports.LiquidGlassHero = LiquidGlassHero;
