const React = require('react');
const { useState, useEffect, useRef } = React;
const Link = require('next/link').default;
const VisionEyeLogo = require('./VisionEyeLogo');
const { Sparkles, ArrowRight, ChevronDown, Menu, X, Play, Pause } = require('lucide-react');

const DEFAULT_VIDEO_URL = 'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260511_230229_7c9bc431-46cf-489a-948d-e8144d8eb5d4.mp4';

function LiquidGlassHero({ videoUrl = DEFAULT_VIDEO_URL, renderHeader = false }) {
  const videoRef = useRef(null);
  const heroRef = useRef(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0, rawX: 0, rawY: 0 });

  // 1. HLS.js Support & Video Initialization
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    let hlsInstance = null;

    if (videoUrl.endsWith('.m3u8')) {
      // If HLS stream (.m3u8) is provided, dynamically load hls.js
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/hls.js@latest';
      script.async = true;
      script.onload = () => {
        if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true,
          });
          hlsInstance.loadSource(videoUrl);
          hlsInstance.attachMedia(video);
          hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, () => {
            video.play().catch(() => {});
          });
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = videoUrl;
          video.play().catch(() => {});
        }
      };
      document.body.appendChild(script);
    } else {
      // Standard MP4 Fallback
      video.src = videoUrl;
      video.play().catch(() => {});
    }

    return () => {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    };
  }, [videoUrl]);

  // 2. Interactive Parallax & Cursor Spotlight
  const handleMouseMove = (e) => {
    if (!heroRef.current) return;
    const rect = heroRef.current.getBoundingClientRect();
    setMousePos({
      x: (e.clientX - rect.left) / rect.width - 0.5,
      y: (e.clientY - rect.top) / rect.height - 0.5,
      rawX: e.clientX - rect.left,
      rawY: e.clientY - rect.top,
    });
  };

  const handleMouseLeave = () => {
    setMousePos({ x: 0, y: 0, rawX: 0, rawY: 0 });
  };

  const togglePlayPause = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  const navLinks = [
    { label: 'Eyeglasses', href: '/shop?category=Eyeglasses' },
    { label: 'Sunglasses', href: '/shop?category=Sunglasses' },
    { label: 'Lookbook', href: '/lookbook' },
    { label: 'AR Try-On', href: '/tryon' },
    { label: 'Our Team', href: '/about' },
  ];

  return (
    <div
      ref={heroRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative w-full h-screen overflow-hidden text-white font-sans flex flex-col justify-between"
    >
      {/* ── FULL-SCREEN HLS / MP4 VIDEO BACKGROUND ── */}
      <video
        ref={videoRef}
        autoPlay
        muted
        loop
        playsInline
        className="absolute inset-0 w-full h-full object-cover z-0 transition-transform duration-300 ease-out"
        style={{
          transform: `scale(1.04) translate(${mousePos.x * -10}px, ${mousePos.y * -6}px)`,
        }}
      />

      {/* ── DARK GRADIENT OVERLAY (Bottom-Heavy for Contrast) ── */}
      <div className="absolute inset-0 z-1 bg-gradient-to-t from-black/95 via-black/45 to-black/70 pointer-events-none" />

      {/* ── CURSOR SPOTLIGHT LIGHT ORB ── */}
      <div
        className="absolute w-[450px] h-[450px] rounded-full pointer-events-none z-1 transition-opacity duration-300"
        style={{
          left: mousePos.rawX - 225,
          top: mousePos.rawY - 225,
          background: 'radial-gradient(circle, rgba(250,174,98,0.22) 0%, rgba(123,34,168,0.1) 50%, transparent 70%)',
          filter: 'blur(45px)',
          opacity: mousePos.rawX ? 1 : 0,
        }}
      />

      {/* ── OPTIONAL GLASSMORTIC NAVIGATION HEADER (When Standalone) ── */}
      {renderHeader && (
        <header className="relative z-30 flex items-center justify-between px-6 sm:px-12 py-5 backdrop-blur-md bg-white/10 border-b border-white/10 shadow-2xl">
          <Link href="/" className="flex items-center gap-2 hover:opacity-90 transition-opacity">
            <VisionEyeLogo size={36} showText={true} tagline="See Beyond. Deliver More." showTagline={true} />
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-xs font-bold uppercase tracking-wider text-white/90">
            {navLinks.map((link) => (
              <Link key={link.label} href={link.href} className="hover:text-[#FAAE62] transition-colors py-1">
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-3">
            <Link
              href="/account"
              className="liquid-glass text-white text-xs uppercase font-bold tracking-wider px-5 py-2.5 rounded-full hover:bg-white/10 transition-all border border-white/15"
            >
              Log in
            </Link>
            <Link
              href="/shop"
              className="bg-white text-black text-xs uppercase font-bold tracking-wider px-5 py-2.5 rounded-full hover:bg-white/90 transition-all shadow-lg font-bold"
            >
              Begin Now
            </Link>
          </div>

          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden liquid-glass text-white p-2.5 rounded-xl flex items-center justify-center border border-white/15"
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </header>
      )}

      {/* MOBILE MENU DRAWER */}
      {renderHeader && menuOpen && (
        <div className="absolute top-20 left-4 right-4 z-40 md:hidden backdrop-blur-xl bg-black/80 border border-white/15 rounded-2xl p-5 flex flex-col gap-3 shadow-2xl">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className="text-xs uppercase font-bold tracking-wider text-white py-2 border-b border-white/10"
            >
              {link.label}
            </Link>
          ))}
          <div className="flex gap-3 pt-2">
            <Link href="/account" className="flex-1 text-center liquid-glass text-white text-xs font-bold uppercase py-2.5 rounded-xl border border-white/15">
              Log in
            </Link>
            <Link href="/shop" className="flex-1 text-center bg-white text-black text-xs font-bold uppercase py-2.5 rounded-xl font-bold">
              Begin Now
            </Link>
          </div>
        </div>
      )}

      {/* ── HERO CONTENT POSITIONED IN BOTTOM-LEFT CORNER ── */}
      <div className="relative z-20 w-full max-w-7xl mx-auto px-6 sm:px-12 pb-12 sm:pb-16 pt-20 mt-auto">
        <div className="max-w-xl text-left space-y-5">
          
          {/* Glassmorphic Badge Pill */}
          <div className="inline-flex">
            <div className="liquid-glass inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold tracking-widest uppercase text-[#FAAE62] shadow-xl border border-white/15">
              <Sparkles className="w-3.5 h-3.5" />
              Liquid Glass Optical Collection
            </div>
          </div>

          {/* Hero Headline */}
          <h1 className="text-white text-4xl sm:text-5xl lg:text-6xl font-serif font-bold leading-[1.1] tracking-tight drop-shadow-2xl">
            Live Better, See Clearly Every Day
          </h1>

          {/* Subtitle / Paragraph */}
          <p className="text-white/80 text-sm sm:text-base leading-relaxed font-light max-w-lg drop-shadow-md">
            Take charge of how you feel with a companion built for your journey—build routines, follow your growth, and unlock tailored optical insights for a steadier, more vibrant life each day.
          </p>

          {/* Action Buttons Row */}
          <div className="flex flex-wrap items-center gap-4 pt-2">
            <Link
              href="/shop"
              className="bg-white text-black text-sm sm:text-base font-bold px-8 py-3.5 rounded-full hover:bg-white/90 transition-all shadow-2xl flex items-center gap-2 hover:scale-105 active:scale-95"
            >
              Start Today
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/tryon"
              className="liquid-glass text-white text-sm sm:text-base font-semibold px-8 py-3.5 rounded-full hover:bg-white/15 transition-all border border-white/15 flex items-center gap-2 hover:scale-105"
            >
              Discover How
            </Link>
          </div>

          {/* Live Stats Bar */}
          <div className="flex items-center gap-8 sm:gap-10 pt-6 border-t border-white/15 max-w-md">
            {[
              { val: '10K+', label: 'Happy Clients' },
              { val: '500+', label: 'Luxury Designs' },
              { val: '4.9★', label: 'Avg Rating' },
            ].map(({ val, label }) => (
              <div key={label} className="text-left">
                <p className="text-xl font-bold font-mono text-[#FAAE62]">{val}</p>
                <p className="text-[10px] uppercase tracking-wider text-[#9B7EA8] mt-0.5">{label}</p>
              </div>
            ))}
          </div>

        </div>
      </div>

      {/* Video Motion Toggle (Bottom Right Corner) */}
      <button
        onClick={togglePlayPause}
        className="absolute bottom-6 right-6 z-30 liquid-glass p-3 rounded-full text-white/80 hover:text-white transition-all shadow-lg border border-white/15 flex items-center gap-2 text-xs font-bold uppercase tracking-wider hover:bg-white/10"
        title={isPlaying ? 'Pause Motion' : 'Play Motion'}
      >
        {isPlaying ? <Pause size={14} /> : <Play size={14} />}
        <span className="hidden sm:inline">{isPlaying ? 'Motion Active' : 'Play Motion'}</span>
      </button>

    </div>
  );
}

module.exports = LiquidGlassHero;
module.exports.LiquidGlassHero = LiquidGlassHero;
