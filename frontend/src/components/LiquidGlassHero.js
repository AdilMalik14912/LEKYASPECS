const React = require('react');
const { useState, useEffect, useRef } = React;
const Link = require('next/link').default;
const { ArrowRight, Play, Pause } = require('lucide-react');

const DEFAULT_VIDEO_URL = 'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260511_230229_7c9bc431-46cf-489a-948d-e8144d8eb5d4.mp4';

function LiquidGlassHero({ videoUrl = DEFAULT_VIDEO_URL }) {
  const videoRef = useRef(null);
  const heroRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0, rawX: 0, rawY: 0 });

  // 1. HLS.js Support & Video Stream Loader
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    let hlsInstance = null;

    if (videoUrl.endsWith('.m3u8')) {
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
      video.src = videoUrl;
      video.play().catch(() => {});
    }

    return () => {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    };
  }, [videoUrl]);

  // 2. Interactive Parallax & Cursor Light Orb
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

  return (
    <div
      ref={heroRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative w-full min-h-[90vh] lg:h-[92vh] overflow-hidden text-white font-sans flex flex-col justify-end"
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

      {/* ── DARK GRADIENT OVERLAY (Bottom-Heavy for Perfect Readability) ── */}
      <div className="absolute inset-0 z-1 bg-gradient-to-t from-black/95 via-black/45 to-black/60 pointer-events-none" />

      {/* ── DYNAMIC CURSOR SPOTLIGHT LIGHT ORB ── */}
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

      {/* ── HERO CONTENT POSITIONED IN BOTTOM-LEFT CORNER WITH PERFECT BOTTOM SPACING ── */}
      <div className="relative z-20 w-full max-w-7xl mx-auto px-6 sm:px-12 pb-24 sm:pb-32 pt-16 mt-auto">
        <div className="max-w-xl text-left space-y-6">

          {/* Hero Headline (Clean - Badge Removed per Screenshot 2) */}
          <h1 className="text-white text-4xl sm:text-5xl lg:text-6xl font-serif font-bold leading-[1.1] tracking-tight drop-shadow-2xl">
            Live Better, See Clearly Every Day
          </h1>

          {/* Subtitle / Paragraph */}
          <p className="text-white/85 text-sm sm:text-base leading-relaxed font-light max-w-lg drop-shadow-md">
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

          {/* Live Stats Bar — Perfectly Aligned & Uncut (per Screenshot 1) */}
          <div className="flex items-center gap-8 sm:gap-12 pt-6 border-t border-white/20 max-w-md">
            {[
              { val: '10K+', label: 'Happy Clients' },
              { val: '500+', label: 'Luxury Designs' },
              { val: '4.9★', label: 'Avg Rating' },
            ].map(({ val, label }) => (
              <div key={label} className="text-left">
                <p className="text-xl sm:text-2xl font-bold font-mono text-[#FAAE62]">{val}</p>
                <p className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-white/70 mt-1">{label}</p>
              </div>
            ))}
          </div>

        </div>
      </div>

      {/* Video Motion Toggle (Bottom Right Corner) */}
      <button
        onClick={togglePlayPause}
        className="absolute bottom-8 right-6 z-30 liquid-glass p-3 rounded-full text-white/80 hover:text-white transition-all shadow-lg border border-white/15 flex items-center gap-2 text-xs font-bold uppercase tracking-wider hover:bg-white/10"
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
