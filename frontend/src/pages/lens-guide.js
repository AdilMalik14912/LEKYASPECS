const React = require('react');
const { useState, useEffect, useRef } = React;
const Link = require('next/link').default;
const Head = require('next/head').default;
const { 
  Eye, Sparkles, CheckCircle2, AlertTriangle, ShieldCheck, Sun, Info, 
  Tv, EyeOff, RotateCcw, HelpCircle, Check, Glasses
} = require('lucide-react');

const API_BASE = typeof window !== 'undefined'
  ? (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' ? 'http://localhost:5000' : '')
  : '';

const LENS_INDEX_OPTIONS = [
  { index: '1.56', name: 'Standard Index', desc: 'Best for light prescriptions. Economical but thickest profile.', priceBonus: 0, factor: 1.0 },
  { index: '1.61', name: 'Thin & Light', desc: 'Up to 20% thinner than standard. Great for moderate powers.', priceBonus: 800, factor: 0.8 },
  { index: '1.67', name: 'Super Thin', desc: 'Up to 35% thinner. Highly recommended for strong prescriptions.', priceBonus: 1600, factor: 0.65 },
  { index: '1.74', name: 'Ultra Thin', desc: 'The thinnest profile possible. Maximum aesthetic value.', priceBonus: 2800, factor: 0.5 }
];

export default function LensGuidePage() {
  // Prescription state
  const [odSph, setOdSph] = useState('-2.00');
  const [odCyl, setOdCyl] = useState('0.00');
  const [odAxis, setOdAxis] = useState('0');
  const [osSph, setOsSph] = useState('-2.00');
  const [osCyl, setOsCyl] = useState('0.00');
  const [osAxis, setOsAxis] = useState('0');
  const [pd, setPd] = useState('63');

  // Lens customizer choices
  const [selectedIndex, setSelectedIndex] = useState('1.61');
  const [hasBlueFilter, setHasBlueFilter] = useState(true);
  const [hasAntiGlare, setHasAntiGlare] = useState(true);
  const [sunlightExposure, setSunlightExposure] = useState(0); // 0 = Indoor, 100 = Bright Outdoor

  // Simulator Canvas Ref
  const canvasRef = useRef(null);

  // Active view tabs: 'simulator' or 'info'
  const [activeTab, setActiveTab] = useState('simulator');

  // Generate automated lens index recommendation based on worst eye SPH
  const getRecommendedIndex = () => {
    const sph1 = Math.abs(parseFloat(odSph) || 0);
    const sph2 = Math.abs(parseFloat(osSph) || 0);
    const maxSph = Math.max(sph1, sph2);

    if (maxSph <= 2.00) return '1.56';
    if (maxSph <= 4.00) return '1.61';
    if (maxSph <= 6.00) return '1.67';
    return '1.74';
  };

  // Re-recommend when prescription inputs change
  useEffect(() => {
    setSelectedIndex(getRecommendedIndex());
  }, [odSph, osSph]);

  // Canvas render loop for interactive simulation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animId;

    const render = () => {
      const w = canvas.width = 400;
      const h = canvas.height = 300;
      ctx.clearRect(0, 0, w, h);

      // SPH power factors
      const sphVal = (parseFloat(odSph) || 0);
      const isNearsighted = sphVal < 0;
      const isFarsighted = sphVal > 0;
      const absSph = Math.abs(sphVal);

      // --- Draw Grid Background (Distorted by Lens Power) ---
      const gridSpacing = 20;
      const lensRadius = 80;
      const centerX = w / 2;
      const centerY = h / 2;

      ctx.save();
      // Draw standard grid
      ctx.strokeStyle = '#E5E5E5';
      ctx.lineWidth = 1;

      // Draw distorted grid lines
      for (let x = 10; x < w; x += gridSpacing) {
        ctx.beginPath();
        for (let y = 10; y < h; y += 5) {
          // Calculate distance from lens center
          const dx = x - centerX;
          const dy = y - centerY;
          const dist = Math.sqrt(dx * dx + dy * dy);

          let drawX = x;
          let drawY = y;

          if (dist < lensRadius) {
            // Apply optical refraction scale
            // Myopia shrunks background, Hyperopia magnifies background
            const refractionScale = isNearsighted 
              ? 1 - (absSph * 0.04) * (1 - dist / lensRadius)
              : 1 + (absSph * 0.04) * (1 - dist / lensRadius);

            drawX = centerX + dx * refractionScale;
            drawY = centerY + dy * refractionScale;
          }
          if (y === 10) ctx.moveTo(drawX, drawY);
          else ctx.lineTo(drawX, drawY);
        }
        ctx.stroke();
      }

      for (let y = 10; y < h; y += gridSpacing) {
        ctx.beginPath();
        for (let x = 10; x < w; x += 5) {
          const dx = x - centerX;
          const dy = y - centerY;
          const dist = Math.sqrt(dx * dx + dy * dy);

          let drawX = x;
          let drawY = y;

          if (dist < lensRadius) {
            const refractionScale = isNearsighted 
              ? 1 - (absSph * 0.04) * (1 - dist / lensRadius)
              : 1 + (absSph * 0.04) * (1 - dist / lensRadius);

            drawX = centerX + dx * refractionScale;
            drawY = centerY + dy * refractionScale;
          }
          if (x === 10) ctx.moveTo(drawX, drawY);
          else ctx.lineTo(drawX, drawY);
        }
        ctx.stroke();
      }
      ctx.restore();

      // --- Draw Lens Glass Outline ---
      ctx.save();
      ctx.beginPath();
      ctx.arc(centerX, centerY, lensRadius, 0, Math.PI * 2);
      
      // Lens shadow / 3D rim effect
      ctx.shadowColor = 'rgba(0,0,0,0.1)';
      ctx.shadowBlur = 8;
      ctx.fillStyle = 'rgba(255,255,255,0.05)';
      ctx.fill();

      // Lens Glass border shine
      const gradient = ctx.createRadialGradient(centerX - 10, centerY - 10, 10, centerX, centerY, lensRadius);
      gradient.addColorStop(0, 'rgba(255, 255, 255, 0.1)');
      gradient.addColorStop(0.8, 'rgba(255, 255, 255, 0.25)');
      gradient.addColorStop(1, 'rgba(250, 174, 98, 0.35)'); // subtle gold rim tint
      ctx.strokeStyle = gradient;
      ctx.lineWidth = 3;
      ctx.stroke();
      ctx.restore();

      // --- Photochromic / Sunlight Transition filter ---
      if (sunlightExposure > 0) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(centerX, centerY, lensRadius - 1.5, 0, Math.PI * 2);
        // Darkens to charcoal shade based on sunlight exposure
        ctx.fillStyle = `rgba(32, 28, 25, ${sunlightExposure * 0.0085})`;
        ctx.fill();
        ctx.restore();
      }

      // --- Blue-Light Blocking filter overlay ---
      if (hasBlueFilter) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(centerX, centerY, lensRadius - 1.5, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(250, 174, 98, 0.06)'; // warm anti-blue tint
        ctx.fill();

        // Draw soft purple/blue light reflection arcs at the top edge of lens
        ctx.strokeStyle = 'rgba(0, 100, 255, 0.35)';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(centerX, centerY, lensRadius - 6, -Math.PI / 4, -Math.PI / 1.5, true);
        ctx.stroke();
        ctx.restore();
      }

      // --- Anti-Glare Refractions ---
      if (!hasAntiGlare) {
        // Draw bright distracting white glares on the lens if anti-glare is disabled
        ctx.save();
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.lineWidth = 4;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(centerX - 40, centerY - 40);
        ctx.lineTo(centerX - 10, centerY - 10);
        ctx.moveTo(centerX - 35, centerY - 25);
        ctx.lineTo(centerX - 20, centerY - 10);
        ctx.stroke();

        ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(centerX + 30, centerY + 30);
        ctx.lineTo(centerX + 50, centerY + 50);
        ctx.stroke();
        ctx.restore();
      } else {
        // Soft, expensive multi-coated green/purple reflections
        ctx.save();
        ctx.strokeStyle = 'rgba(46, 204, 113, 0.18)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(centerX, centerY, lensRadius - 12, -Math.PI / 3, -Math.PI / 1.8, true);
        ctx.stroke();
        ctx.restore();
      }

      // Draw Center Focal crosshair
      ctx.strokeStyle = 'rgba(250, 174, 98, 0.5)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(centerX - 6, centerY);
      ctx.lineTo(centerX + 6, centerY);
      ctx.moveTo(centerX, centerY - 6);
      ctx.lineTo(centerX, centerY + 6);
      ctx.stroke();

      animId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, [odSph, hasBlueFilter, hasAntiGlare, sunlightExposure]);

  // Find lens thickness factor based on selected index
  const activeIndexDetails = LENS_INDEX_OPTIONS.find(o => o.index === selectedIndex) || LENS_INDEX_OPTIONS[0];

  return (
    <>
      <Head>
        <title>Prescription Lens Studio — lekya.in</title>
        <meta name="description" content="Precision lens customizer and 3D refraction simulator. Calculate lens thickness, test anti-reflective coatings, photochromic transitions, and screen filters." />
      </Head>

      <div className="bg-premium-black min-h-screen py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Header Banner */}
          <div className="text-center mb-16">
            <span className="inline-flex items-center gap-1 bg-premium-accent/15 border border-premium-accent/40 text-premium-golddark text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded mb-4">
              <Sparkles className="w-3 h-3" /> Optical Refraction Lab
            </span>
            <h1 className="font-serif text-4xl sm:text-5xl font-bold text-premium-black tracking-tight mb-3">
              Interactive Lens Studio & Simulator
            </h1>
            <p className="text-sm text-premium-gray font-light max-w-xl mx-auto leading-relaxed">
              Enter your cylinder power and spheres to watch your lens thickness modify dynamically, evaluate refractive indexes, and simulate advanced coatings.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* ── COLUMN 1: PRESCRIPTION FORM (LG: 5 cols) ────────────────────── */}
            <div className="lg:col-span-5 space-y-6">
              <div className="bg-white border border-premium-border rounded-lg p-6 sm:p-8 shadow-sm">
                <div className="flex items-center gap-2 border-b border-premium-border pb-4 mb-6">
                  <Eye className="w-5 h-5 text-premium-accent" />
                  <h2 className="font-serif text-lg font-bold text-premium-black">1. Medical Prescription</h2>
                </div>

                <div className="space-y-6">
                  {/* OD Right Eye */}
                  <div>
                    <h3 className="text-xs font-bold uppercase text-premium-accent tracking-wider mb-3 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-premium-accent" />
                      OD — Right Eye
                    </h3>
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[9px] uppercase tracking-wider text-premium-gray mb-1">SPH</label>
                        <select 
                          value={odSph} onChange={e => setOdSph(e.target.value)}
                          className="w-full bg-premium-light border border-premium-border rounded px-2.5 py-2 text-xs font-semibold focus:outline-none focus:border-premium-accent"
                        >
                          {Array.from({ length: 41 }, (_, i) => (-5.00 + i * 0.25).toFixed(2)).map(v => (
                            <option key={v} value={v}>{v > 0 ? `+${v}` : v}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-[9px] uppercase tracking-wider text-premium-gray mb-1">CYL</label>
                        <select 
                          value={odCyl} onChange={e => setOdCyl(e.target.value)}
                          className="w-full bg-premium-light border border-premium-border rounded px-2.5 py-2 text-xs font-semibold focus:outline-none focus:border-premium-accent"
                        >
                          {Array.from({ length: 17 }, (_, i) => (-2.00 + i * 0.25).toFixed(2)).map(v => (
                            <option key={v} value={v}>{v > 0 ? `+${v}` : v}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-[9px] uppercase tracking-wider text-premium-gray mb-1">Axis</label>
                        <input 
                          type="number" min="0" max="180" value={odAxis} onChange={e => setOdAxis(e.target.value)}
                          className="w-full bg-premium-light border border-premium-border rounded px-2.5 py-2 text-xs font-semibold focus:outline-none focus:border-premium-accent"
                        />
                      </div>
                    </div>
                  </div>

                  {/* OS Left Eye */}
                  <div>
                    <h3 className="text-xs font-bold uppercase text-premium-accent tracking-wider mb-3 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-premium-accent" />
                      OS — Left Eye
                    </h3>
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[9px] uppercase tracking-wider text-premium-gray mb-1">SPH</label>
                        <select 
                          value={osSph} onChange={e => setOsSph(e.target.value)}
                          className="w-full bg-premium-light border border-premium-border rounded px-2.5 py-2 text-xs font-semibold focus:outline-none focus:border-premium-accent"
                        >
                          {Array.from({ length: 41 }, (_, i) => (-5.00 + i * 0.25).toFixed(2)).map(v => (
                            <option key={v} value={v}>{v > 0 ? `+${v}` : v}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-[9px] uppercase tracking-wider text-premium-gray mb-1">CYL</label>
                        <select 
                          value={osCyl} onChange={e => setOsCyl(e.target.value)}
                          className="w-full bg-premium-light border border-premium-border rounded px-2.5 py-2 text-xs font-semibold focus:outline-none focus:border-premium-accent"
                        >
                          {Array.from({ length: 17 }, (_, i) => (-2.00 + i * 0.25).toFixed(2)).map(v => (
                            <option key={v} value={v}>{v > 0 ? `+${v}` : v}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-[9px] uppercase tracking-wider text-premium-gray mb-1">Axis</label>
                        <input 
                          type="number" min="0" max="180" value={osAxis} onChange={e => setOsAxis(e.target.value)}
                          className="w-full bg-premium-light border border-premium-border rounded px-2.5 py-2 text-xs font-semibold focus:outline-none focus:border-premium-accent"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Pupil Distance (PD) */}
                  <div className="border-t border-premium-border pt-4">
                    <div className="flex justify-between items-center mb-2">
                      <label className="block text-xs font-bold uppercase text-premium-dark">Pupil Distance (PD) <span className="text-premium-accent">{pd} mm</span></label>
                    </div>
                    <input 
                      type="range" min="55" max="75" step="1" value={pd} onChange={e => setPd(e.target.value)}
                      className="w-full accent-premium-accent cursor-pointer"
                    />
                    <span className="text-[10px] text-premium-gray block mt-1">Average adult PD is 58–68 mm.</span>
                  </div>
                </div>
              </div>

              {/* Disclaimer */}
              <div className="bg-amber-50/60 border border-amber-200/60 rounded-lg p-4 flex gap-3 shadow-sm">
                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-bold text-amber-900 mb-0.5">Medical Safety Disclaimer</p>
                  <p className="text-[10px] text-amber-800 leading-relaxed font-light">
                    This interactive tool acts as an optical visualization aid. Please consult a licensed optometrist for your precise prescription values.
                  </p>
                </div>
              </div>
            </div>

            {/* ── COLUMN 2: INTERACTIVE SIMULATOR (LG: 7 cols) ────────────────── */}
            <div className="lg:col-span-7 space-y-6">
              
              {/* Tab Selector */}
              <div className="flex bg-white border border-premium-border p-1 rounded-lg shadow-sm">
                <button 
                  onClick={() => setActiveTab('simulator')}
                  className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded transition-all flex items-center justify-center gap-2 ${
                    activeTab === 'simulator' ? 'bg-premium-black text-white shadow-sm' : 'text-premium-gray hover:text-premium-dark'
                  }`}
                >
                  <Tv className="w-4 h-4" /> Live Vision Simulator
                </button>
                <button 
                  onClick={() => setActiveTab('info')}
                  className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded transition-all flex items-center justify-center gap-2 ${
                    activeTab === 'info' ? 'bg-premium-black text-white shadow-sm' : 'text-premium-gray hover:text-premium-dark'
                  }`}
                >
                  <Info className="w-4 h-4" /> Index & Coating Guide
                </button>
              </div>

              {activeTab === 'simulator' ? (
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                  
                  {/* Left: Canvas Viewport (7 cols) */}
                  <div className="md:col-span-7 bg-white border border-premium-border rounded-lg p-4 shadow-sm flex flex-col items-center justify-center relative overflow-hidden">
                    <span className="absolute top-3 left-3 bg-premium-black/80 text-white text-[9px] font-mono tracking-wider px-2 py-0.5 rounded z-10">
                      FOCAL PREVIEW (SPH: {odSph > 0 ? `+${odSph}` : odSph})
                    </span>
                    <canvas 
                      ref={canvasRef} 
                      className="border border-premium-border rounded bg-premium-light shadow-inner max-w-full"
                      style={{ width: '100%', height: 'auto', aspectRatio: '4/3' }}
                    />
                    <div className="w-full flex items-center justify-between mt-3 text-[10px] text-premium-gray">
                      <span>Refraction: {parseFloat(odSph) < 0 ? 'Myopia Distorted' : parseFloat(odSph) > 0 ? 'Hyperopia Distorted' : 'Perfect Focus'}</span>
                      <span className="text-premium-golddark font-semibold">Live SVG Render</span>
                    </div>
                  </div>

                  {/* Right: Thickness & Coating Controllers (5 cols) */}
                  <div className="md:col-span-5 space-y-5">
                    
                    {/* Real-time Thickness Visualizer */}
                    <div className="bg-white border border-premium-border rounded-lg p-5 shadow-sm">
                      <h3 className="text-xs font-bold uppercase text-premium-black tracking-wider mb-4 flex items-center gap-1.5">
                        <Glasses className="w-4 h-4 text-premium-accent" />
                        2. Edge Thickness
                      </h3>

                      {/* Render simulated lens silhouette */}
                      <div className="h-16 bg-premium-light border border-premium-border rounded flex items-center justify-center relative overflow-hidden mb-4 p-2">
                        {/* Upper Lens boundary curve */}
                        <svg className="w-full h-full" viewBox="0 0 100 30" preserveAspectRatio="none">
                          <path 
                            d={parseFloat(odSph) < 0 
                              ? `M 5 2 Q 50 ${15 - (Math.abs(parseFloat(odSph)) * 1.5 * activeIndexDetails.factor)} 95 2 L 95 28 Q 50 ${15 + (Math.abs(parseFloat(odSph)) * 1.5 * activeIndexDetails.factor)} 5 28 Z` // Concave
                              : `M 5 ${12 - (Math.abs(parseFloat(odSph)) * 1.2 * activeIndexDetails.factor)} Q 50 2 95 ${12 - (Math.abs(parseFloat(odSph)) * 1.2 * activeIndexDetails.factor)} L 95 ${18 + (Math.abs(parseFloat(odSph)) * 1.2 * activeIndexDetails.factor)} Q 50 28 5 ${18 + (Math.abs(parseFloat(odSph)) * 1.2 * activeIndexDetails.factor)} Z` // Convex
                            } 
                            fill="rgba(250, 174, 98, 0.15)" 
                            stroke="rgba(250, 174, 98, 0.6)" 
                            strokeWidth="1"
                          />
                          {/* Thickness measurement lines */}
                          <line x1="5" y1="2" x2="5" y2="28" stroke="#121212" strokeWidth="1" strokeDasharray="2,2" />
                          <line x1="95" y1="2" x2="95" y2="28" stroke="#121212" strokeWidth="1" strokeDasharray="2,2" />
                        </svg>
                        <span className="absolute bottom-1 right-2 text-[8px] font-mono text-premium-gray">Scale: {activeIndexDetails.index} Index</span>
                      </div>

                      <div className="space-y-2">
                        {LENS_INDEX_OPTIONS.map(opt => {
                          const isRecommended = opt.index === getRecommendedIndex();
                          const isSelected = opt.index === selectedIndex;
                          return (
                            <button 
                              key={opt.index}
                              onClick={() => setSelectedIndex(opt.index)}
                              className={`w-full text-left border rounded p-2.5 transition-all text-xs flex justify-between items-center ${
                                isSelected 
                                  ? 'border-premium-black bg-premium-black/5 font-semibold text-premium-black' 
                                  : 'border-premium-border hover:border-premium-accent'
                              }`}
                            >
                              <div>
                                <div className="flex items-center gap-1.5">
                                  <span>{opt.index} {opt.name}</span>
                                  {isRecommended && (
                                    <span className="bg-premium-accent text-[8px] px-1 py-0.5 rounded font-bold uppercase text-premium-black">Rec</span>
                                  )}
                                </div>
                                <p className="text-[9px] text-premium-gray font-light mt-0.5">{opt.desc}</p>
                              </div>
                              <span className="text-[10px] text-premium-accent font-bold">
                                {opt.priceBonus === 0 ? 'Included' : `+ ₹${opt.priceBonus}`}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Coating Controls */}
                    <div className="bg-white border border-premium-border rounded-lg p-5 shadow-sm space-y-4">
                      <h3 className="text-xs font-bold uppercase text-premium-black tracking-wider mb-2 flex items-center gap-1.5">
                        <ShieldCheck className="w-4 h-4 text-premium-accent" />
                        3. Custom Premium Coatings
                      </h3>

                      {/* Anti-Glare toggle */}
                      <button 
                        onClick={() => setHasAntiGlare(!hasAntiGlare)}
                        className={`w-full border rounded p-3 transition-all flex items-center justify-between text-xs ${
                          hasAntiGlare ? 'border-green-300 bg-green-50/40 text-green-800' : 'border-premium-border hover:border-premium-accent'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-base">🛡️</span>
                          <div className="text-left">
                            <p className="font-bold">Premium Anti-Reflective (AR) Coat</p>
                            <p className="text-[9px] opacity-80">Removes glare lines, reflections, and halos</p>
                          </div>
                        </div>
                        <span className="text-[10px] font-bold">{hasAntiGlare ? 'Active' : 'Disabled'}</span>
                      </button>

                      {/* Blue Light toggle */}
                      <button 
                        onClick={() => setHasBlueFilter(!hasBlueFilter)}
                        className={`w-full border rounded p-3 transition-all flex items-center justify-between text-xs ${
                          hasBlueFilter ? 'border-green-300 bg-green-50/40 text-green-800' : 'border-premium-border hover:border-premium-accent'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-base">💻</span>
                          <div className="text-left">
                            <p className="font-bold">Digital Screen Blue-Shield Filter</p>
                            <p className="text-[9px] opacity-80">Blocks digital strain and headaches</p>
                          </div>
                        </div>
                        <span className="text-[10px] font-bold">{hasBlueFilter ? 'Active' : 'Disabled'}</span>
                      </button>

                      {/* Photochromic / Sun Transition Slider */}
                      <div className="border border-premium-border rounded p-3 space-y-2">
                        <div className="flex justify-between items-center text-xs">
                          <span className="font-bold text-premium-dark flex items-center gap-1">
                            <Sun className="w-3.5 h-3.5 text-amber-500" /> Photochromic Transition
                          </span>
                          <span className="text-[10px] font-bold text-premium-accent">{sunlightExposure}% Sunlight</span>
                        </div>
                        <input 
                          type="range" min="0" max="100" value={sunlightExposure} onChange={e => setSunlightExposure(parseInt(e.target.value))}
                          className="w-full accent-premium-accent cursor-pointer"
                        />
                        <div className="flex justify-between text-[8px] text-premium-gray font-mono">
                          <span>INDOOR (CLEAR)</span>
                          <span>OUTDOOR SUNLIGHT (DARK)</span>
                        </div>
                      </div>

                    </div>

                  </div>

                </div>
              ) : (
                <div className="bg-white border border-premium-border rounded-lg p-6 sm:p-8 shadow-sm space-y-6">
                  <div>
                    <h3 className="font-serif text-lg font-bold text-premium-black mb-3">Understanding Refractive Indexes</h3>
                    <p className="text-xs text-premium-gray leading-relaxed font-light mb-4">
                      The index number (e.g. 1.61, 1.67) represents how efficiently the lens material bends light. Higher index materials bend light more efficiently, meaning less physical material is required to achieve your prescription strength.
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="border border-premium-border p-4 rounded bg-premium-light">
                        <p className="text-xs font-bold text-premium-black mb-1">Standard (1.56 Index)</p>
                        <p className="text-[10px] text-premium-gray leading-relaxed">Best for sphere values between 0 and +/-2.00. Lightweight and cost-effective for standard reading or driving spectacles.</p>
                      </div>
                      <div className="border border-premium-border p-4 rounded bg-premium-light">
                        <p className="text-xs font-bold text-premium-black mb-1">Thin & Light (1.61 Index)</p>
                        <p className="text-[10px] text-premium-gray leading-relaxed">Best for sphere values between +/-2.25 and +/-4.00. Significantly reduces visual profile and edge thickness.</p>
                      </div>
                      <div className="border border-premium-border p-4 rounded bg-premium-light">
                        <p className="text-xs font-bold text-premium-black mb-1">Super Thin (1.67 Index)</p>
                        <p className="text-[10px] text-premium-gray leading-relaxed">Best for sphere values between +/-4.25 and +/-6.00. Reduces weight by up to 35% compared to standard lenses.</p>
                      </div>
                      <div className="border border-premium-border p-4 rounded bg-premium-light">
                        <p className="text-xs font-bold text-premium-black mb-1">Ultra Thin (1.74 Index)</p>
                        <p className="text-[10px] text-premium-gray leading-relaxed">Best for strong prescriptions over +/-6.25. The highest density plastic available for maximum comfort.</p>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-premium-border pt-6">
                    <h3 className="font-serif text-lg font-bold text-premium-black mb-3">Optical Coatings Guide</h3>
                    <div className="space-y-3 text-xs text-premium-gray">
                      <p>
                        <strong>1. Anti-Reflective (AR) Coating:</strong> Eliminates glare lines and reflections from windshields during night driving and overhead fluorescent light sources in office buildings.
                      </p>
                      <p>
                        <strong>2. Blue Shield Protection:</strong> Selectively filters violet-blue radiation emitted by modern monitors, screens, and tablets. Decreases visual fatigue and prevents sleep cycle disruptions.
                      </p>
                      <p>
                        <strong>3. Hydrophobic & Oleophobic Coatings:</strong> Special nanotechnology outer barriers that repel moisture droplets, finger smudges, dust particles, and oily smudges, ensuring quick cleaning.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Browse Compatible Frames callout */}
              <div className="bg-premium-black border border-premium-accent/20 rounded-lg p-6 text-center text-white shadow-md relative overflow-hidden">
                <div className="absolute inset-0 opacity-10" style={{ background: 'radial-gradient(circle at top right, #FAAE62 0%, transparent 60%)' }} />
                <h3 className="font-serif text-xl font-bold text-premium-accent mb-2">Configure Your Frames with Prescriptions</h3>
                <p className="text-xs text-gray-400 font-light max-w-md mx-auto mb-5 leading-relaxed">
                  Choose any frame from our catalog. You can configure it with the lens index and protective coatings verified in this Eye Lab during checkout!
                </p>
                <Link 
                  href="/shop"
                  className="bg-premium-accent text-premium-black hover:bg-white hover:text-premium-black px-8 py-3 rounded font-bold text-xs tracking-widest uppercase transition-all inline-flex items-center gap-2"
                >
                  <Glasses className="w-4 h-4" /> Shop Catalog & Apply Prescription
                </Link>
              </div>

            </div>

          </div>

        </div>
      </div>
    </>
  );
}
