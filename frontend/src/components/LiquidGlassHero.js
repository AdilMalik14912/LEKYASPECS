const React = require('react');
const { useState, useEffect, useRef } = React;
const Link = require('next/link').default;
const { ArrowRight } = require('lucide-react');

const DEFAULT_VIDEO_URL = 'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260511_230229_7c9bc431-46cf-489a-948d-e8144d8eb5d4.mp4';

function LiquidGlassHero({ videoUrl = DEFAULT_VIDEO_URL }) {
  const videoRef = useRef(null);
  const heroRef = useRef(null);
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

  return (
    <div
      ref={heroRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative w-full min-h-[92vh] lg:h-[95vh] overflow-hidden text-white font-sans flex flex-col justify-end"
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
      <div className="absolute inset-0 z-1 bg-gradient-to-t from-black/95 via-black/40 to-black/60 pointer-events-none" />

      {/* ── DYNAMIC CURSOR SPOTLIGHT LIGHT ORB ── */}
      <div
        className="absolute w-[450px] h-[450px] rounded-full pointer-events-none z-1 transition-opacity duration-300"
        style={{
          left: mousePos.rawX - 225,
          top: mousePos.rawY - 225,
          background: 'radial-gradient(circle, rgba(250,174,98,0.2) 0%, rgba(123,34,168,0.08) 50%, transparent 70%)',
          filter: 'blur(45px)',
          opacity: mousePos.rawX ? 1 : 0,
        }}
      />

      {/* ── HERO CONTENT POSITIONED IN BOTTOM-LEFT CORNER WITH COMFORTABLE TOP MARGIN & PADDING (SS #2 FIX) ── */}
      <div className="relative z-20 w-full max-w-7xl mx-auto px-6 sm:px-12 pt-32 sm:pt-40 lg:pt-48 pb-24 sm:pb-32 mt-auto">
        <div className="max-w-xl text-left space-y-6">

          {/* Hero Headline (Positioned comfortably lower below top header) */}
          <h1 className="text-white text-4xl sm:text-5xl lg:text-6xl font-serif font-bold leading-[1.12] tracking-tight drop-shadow-2xl">
            Frame Your Identity
          </h1>

          {/* Subtitle / Paragraph */}
          <p className="text-white/85 text-sm sm:text-base leading-relaxed font-light max-w-lg drop-shadow-md">
            Eyewear isn't just about vision—it's your signature statement. Hand-crafted precision optics delivered straight to your doorstep without luxury markups.
          </p>

          {/* Action Buttons Row */}
          <div className="flex flex-wrap items-center gap-4 pt-2">
            <Link
              href="/face-shape"
              className="bg-gradient-to-r from-[#D4893F] to-[#FAAE62] text-[#0D0016] text-xs sm:text-sm font-extrabold uppercase tracking-widest px-8 py-3.5 rounded-full shadow-2xl transition-all hover:scale-105 active:scale-95 flex items-center gap-2 border border-[#FAAE62]/40"
            >
              Discover Your Fit
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/blog"
              className="liquid-glass text-white text-xs sm:text-sm font-bold uppercase tracking-widest px-8 py-3.5 rounded-full hover:bg-white/15 transition-all border border-white/20 hover:border-[#FAAE62]/50 flex items-center gap-2 hover:scale-105"
            >
              <span>📰</span> Optical Style Guide
            </Link>
          </div>

          {/* Live Stats Bar — Perfectly Aligned & Uncut */}
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

    </div>
  );
}

module.exports = LiquidGlassHero;
module.exports.LiquidGlassHero = LiquidGlassHero;
