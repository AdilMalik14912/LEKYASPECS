const React = require('react');

/**
 * Lekya.in Official Logo Component
 * Uses the actual transparent Lekya glasses PNG logo (no background).
 * Dark theme ready — dark glasses outline + teal "LEKYA" text visible on any bg.
 * Appends ".in" brand suffix in orange-gold.
 */
function VisionEyeLogo({
  size = 38,
  showText = true,
  tagline = 'See Beyond. Deliver More.',
  showTagline = true,
  className = '',
  textClassName = '',
  animated = false,
}) {
  // Logo image is square-ish, ~1.45:1 ratio (width:height)
  const imgH = size * 1.1;
  const imgW = size * 1.8;

  return (
    <div
      className={`inline-flex items-center gap-2 ${className}`}
      style={{ lineHeight: 1 }}
    >
      {/* Premium Vector Glasses Logo — 100% Transparent, sharp on any theme background */}
      <svg
        width={imgW}
        height={imgH}
        viewBox="0 0 100 60"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{
          flexShrink: 0,
          filter: 'drop-shadow(0 2px 8px rgba(250,174,98,0.3))',
          ...(animated ? { animation: 'pulse 2.5s ease-in-out infinite' } : {})
        }}
      >
        <path d="M 12 30 C 14 14, 42 14, 45 30 C 42 46, 14 46, 12 30 Z" fill="rgba(42,4,64,0.6)" stroke="#FAAE62" strokeWidth="4.5" />
        <path d="M 55 30 C 58 14, 86 14, 88 30 C 86 46, 58 46, 55 30 Z" fill="rgba(42,4,64,0.6)" stroke="#FAAE62" strokeWidth="4.5" />
        <path d="M 45 28 C 47 23, 53 23, 55 28" fill="none" stroke="#FAAE62" strokeWidth="3.5" strokeLinecap="round" />
        <path d="M 12 28 C 8 26, 4 22, 2 18" fill="none" stroke="#FAAE62" strokeWidth="3" strokeLinecap="round" />
        <path d="M 88 28 C 92 26, 96 22, 98 18" fill="none" stroke="#FAAE62" strokeWidth="3" strokeLinecap="round" />
        <text x="50" y="34" textAnchor="middle" fill="#2DD4BF" fontSize="10" fontWeight="900" fontFamily="Inter, sans-serif" letterSpacing="1.2">LEKYA</text>
      </svg>

      {/* ".in" brand suffix + optional tagline */}
      {showText && (
        <div
          className={`flex flex-col leading-none ${textClassName}`}
          style={{ marginLeft: 2 }}
        >
          {/* .in suffix in orange-gold */}
          <span
            className="font-serif font-black italic"
            style={{
              fontSize: size * 0.52,
              color: '#FAAE62',
              letterSpacing: '0.04em',
              lineHeight: 1,
            }}
          >
            .in
          </span>
          {showTagline && tagline && (
            <span
              className="font-semibold uppercase"
              style={{
                fontSize: size * 0.19,
                color: '#9B7EA8',
                letterSpacing: '0.25em',
                marginTop: 3,
              }}
            >
              {tagline}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

module.exports = VisionEyeLogo;
module.exports.VisionEyeLogo = VisionEyeLogo;
