const React = require('react');

/**
 * Lekya.in Official High-Res PNG Logo Component
 * Renders the official brand logo.png with golden drop-shadow,
 * polished typography, and responsive scaling.
 */
function VisionEyeLogo({
  size = 40,
  showText = true,
  tagline = 'See Beyond. Deliver More.',
  showTagline = true,
  className = '',
  textClassName = '',
  animated = false,
}) {
  const imgHeight = size;

  return (
    <div className={`inline-flex items-center gap-3 select-none ${className}`}>
      {/* High-res Brand PNG Logo */}
      <div className="relative flex items-center shrink-0">
        <img
          src="/logo.png"
          alt="Lekya Specs Logo"
          onError={(e) => {
            e.currentTarget.src = '/lekya-logo.png';
          }}
          style={{
            height: `${imgHeight}px`,
            width: 'auto',
            filter: 'drop-shadow(0 0 12px rgba(250,174,98,0.5)) drop-shadow(0 2px 4px rgba(0,0,0,0.8))',
            transition: 'transform 0.3s ease, filter 0.3s ease',
            ...(animated ? { animation: 'pulse 2.5s ease-in-out infinite' } : {})
          }}
          className="object-contain hover:scale-105"
        />
      </div>

      {/* Brand Text Suffix */}
      {showText && (
        <div className={`flex flex-col leading-none ${textClassName}`}>
          <div className="flex items-baseline gap-1">
            <span
              className="font-serif font-black tracking-tight"
              style={{
                fontSize: `${size * 0.55}px`,
                background: 'linear-gradient(135deg, #FFF 0%, #FAAE62 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                lineHeight: 1,
              }}
            >
              LEKYA
            </span>
            <span
              className="font-serif font-bold italic"
              style={{
                fontSize: `${size * 0.48}px`,
                color: '#FAAE62',
                lineHeight: 1,
              }}
            >
              .in
            </span>
          </div>
          {showTagline && tagline && (
            <span
              className="font-sans font-bold uppercase tracking-[0.2em]"
              style={{
                fontSize: `${size * 0.18}px`,
                color: '#9B7EA8',
                marginTop: '4px',
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
