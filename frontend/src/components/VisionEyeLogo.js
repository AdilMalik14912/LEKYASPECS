const React = require('react');

/**
 * Lekya.in Official Logo Component
 * Uses the actual Lekya glasses logo image + "lekya.in" brand text
 * Theme: Dark Purple (#0D0016) + Orange Gold (#FAAE62)
 */
function VisionEyeLogo({ 
  size = 38, 
  showText = true, 
  tagline = "See Beyond. Deliver More.",
  showTagline = true,
  className = "",
  textClassName = "",
  animated = false 
}) {
  const logoHeight = size;
  const logoWidth = size * 2.4; // glasses are wider than tall

  return (
    <div className={`inline-flex items-center gap-2.5 ${className}`}>
      {/* Actual Lekya Glasses Logo Image */}
      <div
        style={{
          width: logoWidth,
          height: logoHeight,
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <img
          src="/lekya-logo.png"
          alt="Lekya Specs Logo"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            // Invert white bg to dark + tint orange: makes dark logo white, teal "LEKYA" becomes orange-warm
            filter: 'brightness(0) invert(1) sepia(1) saturate(3) hue-rotate(10deg) brightness(1.1)',
            transition: 'filter 0.3s ease',
            ...(animated ? { animation: 'pulse 2s cubic-bezier(0.4,0,0.6,1) infinite' } : {}),
          }}
        />
      </div>

      {/* Brand Typography */}
      {showText && (
        <div className={`flex flex-col leading-none ${textClassName}`}>
          <div className="flex items-baseline font-serif font-black tracking-[0.10em] uppercase" style={{ fontSize: size * 0.55 }}>
            <span style={{ color: '#FEF6EE' }}>lekya</span>
            <span style={{ color: '#FAAE62' }}>.in</span>
          </div>
          {showTagline && (
            <span
              className="font-bold uppercase tracking-[0.30em]"
              style={{ fontSize: size * 0.22, color: '#9B7EA8', marginTop: 2 }}
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
