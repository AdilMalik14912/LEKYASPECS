const React = require('react');

/**
 * Lekya.in Official Logo Component — Pure SVG
 * Faithfully recreates the actual Lekya glasses logo:
 *   - Elegant single-bridge spectacle outline (matching the real Lekya logo shape)
 *   - "lekya.in" brand text in orange-gold on dark theme
 * Theme: Dark Purple + Orange Gold (#FAAE62)
 * No external image dependency — always renders perfectly.
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
  // SVG icon is 3:1 ratio (wider than tall), so icon width = size * 3
  const iconW = size * 3;
  const iconH = size;

  return (
    <div className={`inline-flex items-center gap-2 ${className}`} style={{ lineHeight: 1 }}>
      {/* Lekya Glasses SVG — faithful recreation of the actual logo */}
      <svg
        width={iconW}
        height={iconH}
        viewBox="0 0 300 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{
          flexShrink: 0,
          filter: 'drop-shadow(0 0 8px rgba(250,174,98,0.35))',
          ...(animated ? { animation: 'pulse 2.5s ease-in-out infinite' } : {}),
        }}
      >
        <defs>
          <linearGradient id="lgFrame" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FCC48A" />
            <stop offset="50%" stopColor="#FAAE62" />
            <stop offset="100%" stopColor="#D4893F" />
          </linearGradient>
        </defs>

        {/*
          Spectacle shape — matching the actual Lekya logo:
          Two lens frames connected by a bridge in the middle,
          with sweeping arms/temples on the outside.
          The bottom curves downward in two arches (like the letter W).
        */}

        {/* === LEFT LENS FRAME === */}
        {/* Top arc of left lens */}
        <path
          d="M 8 48 C 10 20, 45 10, 108 26 C 118 28, 128 32, 132 38"
          stroke="url(#lgFrame)"
          strokeWidth="7"
          strokeLinecap="round"
          fill="none"
        />
        {/* Bottom sweep of left lens (downward arch — the "W" dip) */}
        <path
          d="M 8 48 C 20 80, 60 90, 108 72 C 122 67, 130 58, 132 48"
          stroke="url(#lgFrame)"
          strokeWidth="7"
          strokeLinecap="round"
          fill="none"
        />

        {/* === BRIDGE (nose piece connecting both lenses) === */}
        <path
          d="M 132 43 C 140 38, 160 38, 168 43"
          stroke="url(#lgFrame)"
          strokeWidth="5.5"
          strokeLinecap="round"
          fill="none"
        />

        {/* === RIGHT LENS FRAME === */}
        {/* Top arc of right lens */}
        <path
          d="M 168 38 C 172 30, 200 10, 255 26 C 272 32, 285 42, 292 52"
          stroke="url(#lgFrame)"
          strokeWidth="7"
          strokeLinecap="round"
          fill="none"
        />
        {/* Bottom sweep of right lens */}
        <path
          d="M 168 48 C 175 70, 215 90, 258 74 C 278 66, 290 58, 292 52"
          stroke="url(#lgFrame)"
          strokeWidth="7"
          strokeLinecap="round"
          fill="none"
        />

        {/* === LEFT TEMPLE ARM (sweeping out to the left) === */}
        <path
          d="M 8 48 C 0 44, -2 42, 2 40"
          stroke="url(#lgFrame)"
          strokeWidth="5"
          strokeLinecap="round"
          fill="none"
        />

        {/* === RIGHT TEMPLE ARM (sweeping out to the right) === */}
        <path
          d="M 292 52 C 300 50, 302 46, 298 44"
          stroke="url(#lgFrame)"
          strokeWidth="5"
          strokeLinecap="round"
          fill="none"
        />
      </svg>

      {/* Brand Typography */}
      {showText && (
        <div className={`flex flex-col leading-none ${textClassName}`} style={{ marginLeft: 4 }}>
          <div
            className="font-serif font-black tracking-wider"
            style={{ fontSize: size * 0.58, letterSpacing: '0.06em' }}
          >
            <span style={{ color: '#FEF6EE' }}>lekya</span>
            <span style={{ color: '#FAAE62', fontStyle: 'italic' }}>.in</span>
          </div>
          {showTagline && tagline && (
            <span
              className="font-semibold uppercase"
              style={{
                fontSize: size * 0.2,
                color: '#9B7EA8',
                letterSpacing: '0.28em',
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
