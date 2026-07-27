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
      {/* Actual Lekya Logo — transparent PNG, dark glasses + teal LEKYA text */}
      <img
        src="/lekya-logo.png"
        alt="Lekya"
        style={{
          width: imgW,
          height: imgH,
          objectFit: 'contain',
          flexShrink: 0,
          // Drop shadow to help visibility on any background
          filter: 'drop-shadow(0 1px 6px rgba(0,188,212,0.25)) drop-shadow(0 0 12px rgba(250,174,98,0.2))',
          ...(animated
            ? { animation: 'pulse 2.5s ease-in-out infinite' }
            : {}),
        }}
      />

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
