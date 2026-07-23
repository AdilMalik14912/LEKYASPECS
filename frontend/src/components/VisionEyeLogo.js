const React = require('react');

/**
 * LekyaSpecs Official Logo - Concept 10: "VISION EYE"
 * Slogan: "See Beyond. Deliver More."
 * Palette: Deep Dark Purple (#3E0856 / #13011E) & Vibrant Golden Orange (#FAAE62 / #E67E22)
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
  return (
    <div className={`inline-flex items-center gap-3 ${className}`}>
      {/* SVG Vision Eye Icon */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`shrink-0 transition-transform duration-300 ${animated ? 'animate-pulse' : ''}`}
        style={{ filter: 'drop-shadow(0 0 10px rgba(250, 174, 98, 0.45)) drop-shadow(0 0 18px rgba(155, 77, 192, 0.3))' }}
      >
        <defs>
          <linearGradient id="visionEyePurpleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#C084FC" />
            <stop offset="45%" stopColor="#9333EA" />
            <stop offset="100%" stopColor="#3B0764" />
          </linearGradient>

          <linearGradient id="visionEyeWingDarkGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#7E22CE" />
            <stop offset="100%" stopColor="#2E0A4E" />
          </linearGradient>

          <linearGradient id="visionEyeOrangeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFE0B2" />
            <stop offset="40%" stopColor="#FAAE62" />
            <stop offset="100%" stopColor="#E67E22" />
          </linearGradient>

          <radialGradient id="irisCenterGlowGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="35%" stopColor="#FAAE62" />
            <stop offset="85%" stopColor="#D97706" />
            <stop offset="100%" stopColor="#78350F" />
          </radialGradient>
        </defs>

        {/* Outer Wing Sweep Top */}
        <path
          d="M 6 50 C 20 16, 80 16, 94 50 C 78 24, 22 24, 6 50 Z"
          fill="url(#visionEyePurpleGrad)"
        />

        {/* Outer Wing Sweep Bottom */}
        <path
          d="M 6 50 C 20 84, 80 84, 94 50 C 78 76, 22 76, 6 50 Z"
          fill="url(#visionEyeWingDarkGrad)"
        />

        {/* Stylized Corner Wing Accents */}
        <path
          d="M 4 50 C 14 44, 28 32, 40 30 C 28 36, 16 46, 4 50 Z"
          fill="#E9D5FF"
          opacity="0.9"
        />
        <path
          d="M 96 50 C 86 44, 72 32, 60 30 C 72 36, 84 46, 96 50 Z"
          fill="#E9D5FF"
          opacity="0.9"
        />

        {/* Outer Golden Orange Iris Ring */}
        <circle
          cx="50"
          cy="50"
          r="23"
          stroke="url(#visionEyeOrangeGrad)"
          strokeWidth="5"
          fill="#13011E"
        />

        {/* Inner Glowing Iris Fill */}
        <circle
          cx="50"
          cy="50"
          r="15"
          fill="url(#irisCenterGlowGrad)"
        />

        {/* Pupil Core (Deep Purple Dark Center) */}
        <circle
          cx="50"
          cy="50"
          r="7.5"
          fill="#0D0016"
        />

        {/* Specular Glint Highlight */}
        <circle
          cx="44.5"
          cy="44.5"
          r="3"
          fill="#FFFFFF"
          opacity="0.95"
        />
      </svg>

      {/* Brand Typography */}
      {showText && (
        <div className={`flex flex-col leading-none ${textClassName}`}>
          <div className="flex items-center font-serif font-black tracking-[0.14em] uppercase text-xl sm:text-2xl">
            <span className="text-[#FEF6EE] group-hover:text-[#FAAE62] transition-colors">Lekya</span>
            <span className="text-[#FAAE62]">Specs</span>
          </div>
          {showTagline && (
            <span className="text-[8px] sm:text-[9.5px] font-bold tracking-[0.32em] text-[#9B7EA8] uppercase mt-0.5">
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
