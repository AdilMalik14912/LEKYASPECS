const React = require('react');
const { useState, useEffect, useRef } = React;
const Link = require('next/link').default;
const { Sparkles, ArrowRight, Eye, Star, Compass, Play, Pause, Layers } = require('lucide-react');

const BG_VIDEO = 'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260511_230229_7c9bc431-46cf-489a-948d-e8144d8eb5d4.mp4';

function LiquidGlassHero() {
  const videoRef = useRef(null);
  const heroRef = useRef(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0, rawX: 0, rawY: 0 });
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  // 1. Interactive Mouse Parallax 3D & Cursor Spotlight Tracking
  const handleMouseMove = (e) => {
    if (!heroRef.current) return;
    const rect = heroRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setMousePos({
      x,
      y,
      rawX: e.clientX - rect.left,
      rawY: e.clientY - rect.top,
    });
  };

  const handleMouseLeave = () => {
    setMousePos({ x: 0, y: 0, rawX: 0, rawY: 0 });
  };

  // 2. Interactive Scroll-Driven Video Playback Scrubbing & Velocity Control
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const heroH = heroRef.current ? heroRef.current.offsetHeight : 800;
      const progress = Math.min(1, Math.max(0, scrollY / heroH));
      setScrollProgress(progress);

      if (videoRef.current && videoRef.current.duration) {
        // Dynamically adjust playback rate or scrub time based on scroll position
        const targetTime = progress * (videoRef.current.duration * 0.8);
        videoRef.current.currentTime = (videoRef.current.currentTime * 0.7) + (targetTime * 0.3);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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

  return (
    <div
      ref={heroRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative w-full min-h-[92vh] lg:h-screen overflow-hidden text-white font-sans flex items-center justify-center"
    >
      {/* Background HD Video — Interactive Scroll Scrubbed */}
      <video
        ref={videoRef}
        autoPlay
        muted
        loop
        playsInline
        className="absolute inset-0 w-full h-full object-cover z-0 transition-transform duration-100 ease-out"
        style={{
          transform: `scale(${1.05 + scrollProgress * 0.15}) translate(${mousePos.x * -15}px, ${mousePos.y * -10}px)`,
        }}
        src={BG_VIDEO}
      />

      {/* Interactive Cursor Spotlight Glow Orb */}
      <div
        className="absolute w-[450px] h-[450px] rounded-full pointer-events-none z-1 transition-opacity duration-300"
        style={{
          left: mousePos.rawX - 225,
          top: mousePos.rawY - 225,
          background: 'radial-gradient(circle, rgba(250,174,98,0.22) 0%, rgba(123,34,168,0.1) 45%, transparent 70%)',
          filter: 'blur(40px)',
          opacity: mousePos.rawX ? 1 : 0,
        }}
      />

      {/* Ambient Dark Overlays */}
      <div
        className="absolute inset-0 z-1 pointer-events-none transition-opacity duration-300"
        style={{
          background: 'linear-gradient(180deg, rgba(13,0,22,0.85) 0%, rgba(13,0,22,0.4) 50%, rgba(13,0,22,0.95) 100%)',
          opacity: 1 - scrollProgress * 0.3,
        }}
      />

      {/* Video Control Button (Bottom Right) */}
      <button
        onClick={togglePlayPause}
        className="absolute bottom-6 right-6 z-30 liquid-glass p-3 rounded-full text-white/80 hover:text-white transition-all shadow-lg flex items-center gap-2 text-xs font-bold uppercase tracking-wider"
        title={isPlaying ? 'Pause Video' : 'Play Video'}
      >
        {isPlaying ? <Pause size={14} /> : <Play size={14} />}
        <span className="hidden sm:inline">{isPlaying ? 'Interactive Motion' : 'Play Motion'}</span>
      </button>

      {/* HERO CONTENT GRID */}
      <div className="relative z-20 max-w-7xl mx-auto px-6 sm:px-12 w-full py-12 lg:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

          {/* Left Copy Container — 3D Mouse Parallax Reactive */}
          <div
            className="space-y-6 transition-transform duration-150 ease-out"
            style={{
              transform: `perspective(1000px) rotateY(${mousePos.x * 6}deg) rotateX(${mousePos.y * -4}deg) translateY(${scrollProgress * -40}px)`,
            }}
          >
            {/* Liquid Glass Badge */}
            <div className="liquid-glass inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold tracking-widest uppercase text-[#FAAE62] shadow-lg">
              <Sparkles className="w-3.5 h-3.5" />
              Liquid Glass Optical Collection
            </div>

            <h1 className="text-white text-4xl sm:text-5xl lg:text-6xl font-serif font-bold leading-tight tracking-tight drop-shadow-lg">
              Live Better, Feel Whole Every Day
            </h1>

            <p className="text-white/80 text-sm sm:text-base leading-relaxed max-w-lg font-light drop-shadow-md">
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
                className="liquid-glass text-white text-sm sm:text-base font-semibold px-8 py-3.5 rounded-full hover:bg-white/15 transition-all flex items-center gap-2 hover:scale-105"
              >
                Discover How
              </Link>
            </div>

            {/* Live Stats Bar */}
            <div className="flex items-center gap-8 pt-6 border-t border-white/15">
              {[
                { val: '10K+', label: 'Happy Clients' },
                { val: '500+', label: 'Frame Models' },
                { val: '4.9★', label: 'Client Rating' },
              ].map(({ val, label }) => (
                <div key={label} className="text-left">
                  <p className="text-xl font-bold font-mono text-[#FAAE62]">{val}</p>
                  <p className="text-[11px] uppercase tracking-wider text-[#9B7EA8]">{label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right 3D Liquid Glass Card Showcase — Hover Responsive */}
          <div
            className="relative flex items-center justify-center transition-transform duration-150 ease-out"
            style={{
              transform: `perspective(1200px) rotateY(${mousePos.x * -12}deg) rotateX(${mousePos.y * 8}deg)`,
            }}
          >
            <div className="liquid-glass relative z-10 w-full max-w-sm rounded-3xl p-6 space-y-4 shadow-2xl">
              <div className="flex justify-between items-center pb-3 border-b border-white/15">
                <span className="text-xs font-bold uppercase tracking-widest text-[#FAAE62]">Equilibrium Specs</span>
                <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-white/10 text-white font-mono">2026 Edition</span>
              </div>
              <div className="h-48 rounded-2xl bg-black/40 overflow-hidden relative flex items-center justify-center p-4 group">
                <img
                  src="https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=800&q=80"
                  alt="Liquid Glass Frame"
                  className="w-full h-full object-contain filter drop-shadow(0 10px 25px rgba(0,0,0,0.9)) transition-transform duration-300 group-hover:scale-110"
                />
              </div>
              <div className="space-y-1">
                <h4 className="text-base font-serif font-bold text-white">The Equilibrium Titanium</h4>
                <p className="text-xs text-[#9B7EA8]">Hand-polished ultra-light titanium with anti-glare blue shield.</p>
              </div>
              <div className="flex justify-between items-center pt-2">
                <span className="text-sm font-bold text-[#FAAE62] font-mono">₹2,499</span>
                <Link href="/tryon" className="px-4 py-2 rounded-full bg-white text-black text-xs font-bold uppercase hover:bg-white/90 transition-colors">
                  Try On AR
                </Link>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

module.exports = LiquidGlassHero;
module.exports.LiquidGlassHero = LiquidGlassHero;
