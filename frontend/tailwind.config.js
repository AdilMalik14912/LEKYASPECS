/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        premium: {
          // Dark Purple base palette
          dark:      '#3E0856',   // Primary dark (Deep Purple)
          black:     '#0D0016',   // Deepest background
          mid:       '#1A0024',   // Mid-dark purple
          deeper:    '#2A0440',   // Between mid and dark
          // Light Orange accent palette
          accent:    '#FAAE62',   // Primary accent (Light Orange)
          goldlight: '#FCC48A',   // Accent light tint
          golddark:  '#D4893F',   // Accent dark shade
          // Neutral tones
          light:     '#FEF6EE',   // Warm off-white (for text on dark bg)
          muted:     '#9B7EA8',   // Purple-tinted muted text
          border:    '#4A1268',   // Purple border
          borderlight: '#F2CEAC', // Orange-tinted light border
          // Rich purple glows
          glow:      '#7B22A8',   // Medium purple for glows
          surface:   '#1E0030',   // Card surface purple
        }
      },
      fontFamily: {
        sans:  ['Inter', 'sans-serif'],
        serif: ['Cormorant Garamond', 'Playfair Display', 'Georgia', 'serif'],
      },
      animation: {
        'fade-in':          'fadeIn 0.5s ease-out forwards',
        'slide-up':         'slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'pulse-subtle':     'pulseSubtle 2s infinite ease-in-out',
        'float-orb':        'floatOrb 8s ease-in-out infinite',
        'float-orb-slow':   'floatOrb 12s ease-in-out infinite',
        'glow-pulse':       'glowPulse 3s ease-in-out infinite',
        'shimmer-orange':   'shimmerOrange 4s linear infinite',
        'spin-3d':          'spin3d 3.5s cubic-bezier(0.77, 0, 0.175, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%':   { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)',     opacity: '1' },
        },
        pulseSubtle: {
          '0%, 100%': { opacity: '1' },
          '50%':      { opacity: '0.6' },
        },
        floatOrb: {
          '0%, 100%': { transform: 'translateY(0px) translateX(0px) scale(1)',    opacity: '0.6' },
          '33%':      { transform: 'translateY(-30px) translateX(15px) scale(1.1)', opacity: '0.8' },
          '66%':      { transform: 'translateY(-15px) translateX(-10px) scale(0.95)', opacity: '0.5' },
        },
        glowPulse: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(250,174,98,0.3)' },
          '50%':      { boxShadow: '0 0 50px rgba(250,174,98,0.7), 0 0 80px rgba(62,8,86,0.5)' },
        },
        shimmerOrange: {
          '0%':   { backgroundPosition: '-200% center' },
          '100%': { backgroundPosition: '200% center' },
        },
        spin3d: {
          '0%':   { transform: 'rotateY(0deg) rotateX(12deg)' },
          '50%':  { transform: 'rotateY(180deg) rotateX(-6deg)' },
          '100%': { transform: 'rotateY(360deg) rotateX(12deg)' },
        },
      },
      backgroundImage: {
        'gradient-purple-orange': 'linear-gradient(135deg, #0D0016 0%, #1A0024 40%, #3E0856 70%, #5C1080 100%)',
        'gradient-orange':        'linear-gradient(90deg, #D4893F 0%, #FAAE62 50%, #FCC48A 100%)',
        'gradient-hero':          'radial-gradient(ellipse at 70% 50%, rgba(62,8,86,0.6) 0%, rgba(13,0,22,1) 70%)',
      },
      boxShadow: {
        'orange-glow':    '0 0 30px rgba(250,174,98,0.4), 0 10px 40px rgba(0,0,0,0.5)',
        'orange-glow-lg': '0 0 60px rgba(250,174,98,0.5), 0 20px 60px rgba(0,0,0,0.6)',
        'purple-depth':   '0 4px 6px rgba(62,8,86,0.2), 0 10px 15px rgba(62,8,86,0.15), 0 20px 40px rgba(0,0,0,0.4)',
        'card-3d':        '0 2px 4px rgba(0,0,0,0.3), 0 8px 16px rgba(0,0,0,0.3), 0 20px 40px rgba(0,0,0,0.4), 0 0 40px rgba(250,174,98,0.08)',
        'card-3d-hover':  '0 4px 8px rgba(0,0,0,0.4), 0 16px 32px rgba(0,0,0,0.4), 0 40px 80px rgba(0,0,0,0.5), 0 0 60px rgba(250,174,98,0.2)',
      },
    },
  },
  plugins: [],
};
