const React = require('react');
const { useState, useEffect, useRef } = React;
const Link = require('next/link').default;
const { Sparkles, ArrowRight, Play, Pause, ChevronDown } = require('lucide-react');

const BG_VIDEO = 'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260511_230229_7c9bc431-46cf-489a-948d-e8144d8eb5d4.mp4';

function LiquidGlassHero() {
  const videoRef = useRef(null);
  const heroRef = useRef(null);
  const targetScrollRef = useRef(0);
  const currentScrollRef = useRef(0);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0, rawX: 0, rawY: 0 });
  const [isPlaying, setIsPlaying] = useState(true);

  // 1. Mouse Movement 3D Parallax & Cursor Spotlight Glow
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

  // 2. Buttery Smooth Video Frame Scrubbing & Scroll Sync Animation Loop
  useEffect(() => {
    let animId;

    const handleScroll = () => {
      const scrollY = window.scrollY;
      const heroH = heroRef.current ? heroRef.current.offsetHeight : 800;
      targetScrollRef.current = Math.min(1, Math.max(0, scrollY / (heroH * 1.2)));
    };

    const updateVideoFrame = () => {
      // Lerp smooth interpolation for video scrubbing
      currentScrollRef.current += (targetScrollRef.current - currentScrollRef.current) * 0.1;

      if (videoRef.current && videoRef.current.duration) {
        const dur = videoRef.current.duration;
        // Calculate exact scrubbed video time based on scroll depth
        const targetTime = currentScrollRef.current * (dur * 0.85);
        if (Math.abs(videoRef.current.currentTime - targetTime) > 0.05) {
          videoRef.current.currentTime = targetTime;
        }
      }

      animId = requestAnimationFrame(updateVideoFrame);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    animId = requestAnimationFrame(updateVideoFrame);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      cancelAnimationFrame(animId);
    };
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
      className="relative w-full min-h-screen overflow-hidden text-white font-sans flex items-center justify-center pt-8 pb-16"
    >
      {/* Background HD Video — Scroll Scrubbed */}
      <video
        ref={videoRef}
        autoPlay
        muted
        loop
        playsInline
        className="absolute inset-0 w-full h-full object-cover z-0 transition-transform duration-100 ease-out"
        style={{
          transform: `scale(1.06) translate(${mousePos.x * -12}px, ${mousePos.y * -8}px)`,
        }}
        src={BG_VIDEO}
      />

      {/* Dynamic Cursor Spotlight Light Orb */}
      <div
        className="absolute w-[500px] h-[500px] rounded-full pointer-events-none z-1 transition-opacity duration-300"
        style={{
          left: mousePos.rawX - 250,
          top: mousePos.rawY - 250,
          background: 'radial-gradient(circle, rgba(250,174,98,0.25) 0%, rgba(123,34,168,0.12) 50%, transparent 70%)',
          filter: 'blur(50px)',
          opacity: mousePos.rawX ? 1 : 0,
        }}
      />

      {/* Multi-layer Dark Purple Gradient Overlays */}
      <div
        className="absolute inset-0 z-1 pointer-events-none"
        style={{
          background: 'linear-gradient(180deg, rgba(13,0,22,0.85) 0%, rgba(13,0,22,0.45) 45%, rgba(13,0,22,0.95) 100%)',
        }}
      />

      {/* Interactive Motion Control Button */}
      <button
        onClick={togglePlayPause}
        className="absolute bottom-6 right-6 z-30 liquid-glass px-4 py-2.5 rounded-full text-white/80 hover:text-white transition-all shadow-lg flex items-center gap-2 text-xs font-bold uppercase tracking-wider hover:bg-white/10"
        title={isPlaying ? 'Pause Video Motion' : 'Play Video Motion'}
      >
        {isPlaying ? <Pause size={14} /> : <Play size={14} />}
        <span className="hidden sm:inline">{isPlaying ? 'Interactive Motion' : 'Play Motion'}</span>
      </button>

      {/* CLEAN CENTERED HERO CONTENT — NO SIDE IMAGES */}
      <div className="relative z-20 max-w-4xl mx-auto px-6 sm:px-12 text-center flex flex-col items-center">
        
        {/* 3D Tilt Wrapper */}
        <div
          className="space-y-7 transition-transform duration-150 ease-out flex flex-col items-center"
          style={{
            transform: `perspective(1000px) rotateY(${mousePos.x * 8}deg) rotateX(${mousePos.y * -5}deg)`,
          }}
        >
          {/* Liquid Glass Badge Pill */}
          <div>
            <div className="liquid-glass inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full text-xs font-bold tracking-[0.2em] uppercase text-[#FAAE62] shadow-xl border border-white/10">
              <Sparkles className="w-4 h-4" />
              Liquid Glass Optical Collection
            </div>
          </div>

          {/* Headline */}
          <h1 className="text-white text-4xl sm:text-6xl lg:text-7xl font-serif font-bold leading-[1.1] tracking-tight drop-shadow-2xl max-w-3xl">
            Live Better, See Clearly Every Day
          </h1>

          {/* Subtitle / Paragraph */}
          <p className="text-white/80 text-base sm:text-lg leading-relaxed max-w-2xl font-light drop-shadow-md">
            Take charge of how you feel with a companion built for your journey—build routines, follow your growth, and unlock tailored optical insights for a steadier, more vibrant life each day.
          </p>

          {/* Action Buttons Pill Row */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <Link
              href="/shop"
              className="bg-white text-black text-sm sm:text-base font-bold px-9 py-4 rounded-full hover:bg-white/90 transition-all shadow-2xl flex items-center gap-2.5 hover:scale-105 active:scale-95"
            >
              Start Today
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/tryon"
              className="liquid-glass text-white text-sm sm:text-base font-bold px-9 py-4 rounded-full hover:bg-white/15 transition-all border border-white/15 flex items-center gap-2 hover:scale-105"
            >
              Discover How
            </Link>
          </div>

          {/* Live Stats Bar */}
          <div className="flex items-center justify-center gap-10 sm:gap-14 pt-8 mt-4 border-t border-white/15 w-full max-w-xl">
            {[
              { val: '10K+', label: 'Happy Clients' },
              { val: '500+', label: 'Frame Designs' },
              { val: '4.9★', label: 'Client Rating' },
            ].map(({ val, label }) => (
              <div key={label} className="text-center">
                <p className="text-2xl font-bold font-mono text-[#FAAE62]">{val}</p>
                <p className="text-[11px] uppercase tracking-wider text-[#9B7EA8] mt-0.5">{label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="mt-12 animate-bounce flex flex-col items-center text-white/50 text-xs tracking-widest uppercase gap-1">
          <span>Scroll To Explore</span>
          <ChevronDown size={16} />
        </div>

      </div>
    </div>
  );
}

module.exports = LiquidGlassHero;
module.exports.LiquidGlassHero = LiquidGlassHero;
