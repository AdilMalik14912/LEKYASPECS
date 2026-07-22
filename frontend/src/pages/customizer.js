import React, { useState, useEffect, useRef } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useAuth } from './_app';
import { Sparkles, Eye, ShieldCheck, Heart, ShoppingBag, Sliders, Palette, Edit3, ArrowRight, RotateCcw } from 'lucide-react';

export default function FrameCustomizer() {
  const { user, token } = useAuth();
  
  // Customizer options states
  const [shape, setShape] = useState('Rectangle');
  const [material, setMaterial] = useState('acetate'); // 'acetate' or 'titanium'
  const [frameColor, setFrameColor] = useState('Onyx Matte');
  const [lensTint, setLensTint] = useState('Polarized Slate');
  const [engraving, setEngraving] = useState('');
  const [lensOpacity, setLensOpacity] = useState(0.85);
  
  // Try on background photo state
  const [tryOnImage, setTryOnImage] = useState(null);
  const [showFaceGrid, setShowFaceGrid] = useState(false);
  const fileInputRef = useRef(null);

  // Load face shape recommendation if available
  useEffect(() => {
    if (user?.face_shape) {
      // Map face shape to recommended starting frame shape
      const recMap = {
        round: 'Rectangle',
        oval: 'Wayfarer',
        square: 'Round',
        heart: 'Cat-Eye',
        diamond: 'Round',
        oblong: 'Square'
      };
      const rec = recMap[user.face_shape.toLowerCase()];
      if (rec) setShape(rec);
    }
  }, [user]);

  // Design system options
  const shapes = ['Rectangle', 'Round', 'Cat-Eye', 'Wayfarer', 'Aviator', 'Hexagonal'];
  const frameColors = [
    { name: 'Onyx Matte', value: '#1C1C1E', border: '#2C2C2E', text: 'text-white' },
    { name: 'Polished Gold', value: '#D4AF37', border: '#AA7C11', text: 'text-[#D4AF37]' },
    { name: 'Rose Gold', value: '#B76E79', border: '#8A4F58', text: 'text-[#B76E79]' },
    { name: 'Tortoise Shell', value: 'url(#tortoise)', border: '#5C4033', text: 'text-amber-800' },
    { name: 'Crystal Clear', value: 'rgba(255,255,255,0.4)', border: 'rgba(255,255,255,0.8)', text: 'text-gray-300' }
  ];
  
  const lensTints = [
    { name: 'Polarized Slate', color: '#2C2C2E', tint: 'rgba(44, 44, 46, ' },
    { name: 'Champagne Gold', color: '#D4AF37', tint: 'rgba(212, 175, 55, ' },
    { name: 'Ocean Blue', color: '#007AFF', tint: 'rgba(0, 122, 255, ' },
    { name: 'Emerald Green', color: '#34C759', tint: 'rgba(52, 199, 89, ' },
    { name: 'Sunset Rose', color: '#FF2D55', tint: 'rgba(255, 45, 85, ' }
  ];

  const activeColorObj = frameColors.find(c => c.name === frameColor) || frameColors[0];
  const activeLensObj = lensTints.find(l => l.name === lensTint) || lensTints[0];

  // Simulated add to cart
  const [successMsg, setSuccessMsg] = useState('');
  const handleAddToCart = () => {
    setSuccessMsg('Your customized frame has been saved & added to your cart!');
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  // Image upload handler
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setTryOnImage(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <>
      <Head>
        <title>Premium Frame Customizer — Lekya Specs</title>
        <meta name="description" content="Design and customize your own premium eyewear. Choose frame shapes, polished metals, polarized lens tints, and add personal engravings with instant live preview." />
      </Head>

      <div className="min-h-screen bg-premium-black text-white pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Header */}
          <div className="text-center lg:text-left mb-10 flex flex-col lg:flex-row items-center justify-between gap-6">
            <div>
              <span className="inline-flex items-center gap-1 bg-premium-accent/15 border border-premium-accent/30 text-premium-accent px-3 py-1 rounded text-xs font-bold uppercase tracking-wider mb-2">
                <Sparkles className="w-3.5 h-3.5 animate-pulse" /> Lekya Labs
              </span>
              <h1 className="font-serif text-3xl sm:text-5xl font-bold tracking-tight text-white">
                Bespoke Customizer
              </h1>
              <p className="text-sm text-gray-400 font-light mt-1.5 max-w-xl">
                Configure frame geometry, premium materials, high-fidelity lens filters, and bespoke personal temple engravings.
              </p>
            </div>
            
            {user?.face_shape && (
              <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-center gap-4">
                <div className="text-right">
                  <span className="text-[10px] text-gray-400 uppercase tracking-widest block font-bold">Face Shape Match</span>
                  <span className="text-sm font-bold text-premium-accent uppercase tracking-wide">{user.face_shape}</span>
                </div>
                <span className="text-xs text-gray-400 bg-white/10 px-2.5 py-1.5 rounded-lg border border-white/5 font-semibold">
                  Pre-optimized for You
                </span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* ─── LEFT: LIVE INTERACTIVE PREVIEW (SVG + TRY ON CANVAS) ─── */}
            <div className="lg:col-span-7 space-y-6">
              
              <div className="relative bg-neutral-900 border border-white/10 rounded-2xl aspect-[4/3] w-full overflow-hidden shadow-2xl flex items-center justify-center">
                
                {/* Background Try-on Image */}
                {tryOnImage ? (
                  <div className="absolute inset-0">
                    <img src={tryOnImage} alt="Try On Background" className="w-full h-full object-cover" />
                    {showFaceGrid && (
                      <div className="absolute inset-0 border border-premium-accent/30 bg-radial-gradient flex items-center justify-center opacity-40 pointer-events-none">
                        <div className="w-[60%] h-[75%] border border-dashed border-premium-accent rounded-[100px]" />
                      </div>
                    )}
                  </div>
                ) : (
                  // Holographic background when no image uploaded
                  <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#FAAE62_1px,transparent_1px)] [background-size:16px_16px]" />
                )}

                {/* Live Glasses Rendering */}
                <div className="relative z-10 w-full max-w-[320px] transition-transform duration-300 transform hover:scale-105">
                  <svg viewBox="0 0 400 180" className="w-full h-auto drop-shadow-[0_12px_24px_rgba(0,0,0,0.6)]">
                    <defs>
                      {/* Tortoise pattern definition */}
                      <pattern id="tortoise" width="60" height="60" patternUnits="userSpaceOnUse">
                        <rect width="60" height="60" fill="#4B2A0F" />
                        <circle cx="10" cy="15" r="12" fill="#D27D2D" opacity="0.8" />
                        <circle cx="45" cy="40" r="15" fill="#1C0D02" opacity="0.9" />
                        <circle cx="30" cy="20" r="8" fill="#E5A65D" opacity="0.6" />
                        <circle cx="15" cy="50" r="10" fill="#D27D2D" opacity="0.7" />
                      </pattern>
                      
                      {/* Metal reflection gradient */}
                      <linearGradient id="metal-reflection" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#ffffff" stopOpacity="0.4" />
                        <stop offset="50%" stopColor="#d4af37" stopOpacity="0.1" />
                        <stop offset="100%" stopColor="#000000" stopOpacity="0.5" />
                      </linearGradient>
                    </defs>

                    {/* Left Frame Base */}
                    {shape === 'Rectangle' && <rect x="35" y="45" width="130" height="85" rx="16" fill={activeColorObj.value} stroke={activeColorObj.border} strokeWidth="6" />}
                    {shape === 'Round' && <circle cx="100" cy="85" r="48" fill={activeColorObj.value} stroke={activeColorObj.border} strokeWidth="6" />}
                    {shape === 'Cat-Eye' && <path d="M 35,45 C 35,45 100,25 165,55 C 165,95 145,130 100,130 C 55,130 35,95 35,45 Z" fill={activeColorObj.value} stroke={activeColorObj.border} strokeWidth="6" />}
                    {shape === 'Wayfarer' && <path d="M 35,45 L 165,52 C 160,95 145,125 100,125 C 55,125 40,95 35,45 Z" fill={activeColorObj.value} stroke={activeColorObj.border} strokeWidth="6" />}
                    {shape === 'Aviator' && <path d="M 40,50 L 160,50 C 160,90 145,135 95,135 C 45,135 40,90 40,50 Z" fill={activeColorObj.value} stroke={activeColorObj.border} strokeWidth="6" />}
                    {shape === 'Hexagonal' && <polygon points="35,65 100,45 165,65 165,110 100,130 35,110" fill={activeColorObj.value} stroke={activeColorObj.border} strokeWidth="6" />}

                    {/* Right Frame Base */}
                    {shape === 'Rectangle' && <rect x="235" y="45" width="130" height="85" rx="16" fill={activeColorObj.value} stroke={activeColorObj.border} strokeWidth="6" />}
                    {shape === 'Round' && <circle cx="300" cy="85" r="48" fill={activeColorObj.value} stroke={activeColorObj.border} strokeWidth="6" />}
                    {shape === 'Cat-Eye' && <path d="M 235,55 C 300,25 365,45 365,45 C 365,95 345,130 300,130 C 255,130 235,95 235,55 Z" fill={activeColorObj.value} stroke={activeColorObj.border} strokeWidth="6" />}
                    {shape === 'Wayfarer' && <path d="M 235,52 L 365,45 C 360,95 345,125 300,125 C 255,125 240,95 235,52 Z" fill={activeColorObj.value} stroke={activeColorObj.border} strokeWidth="6" />}
                    {shape === 'Aviator' && <path d="M 240,50 L 360,50 C 360,90 355,135 305,135 C 255,135 240,90 240,50 Z" fill={activeColorObj.value} stroke={activeColorObj.border} strokeWidth="6" />}
                    {shape === 'Hexagonal' && <polygon points="235,65 300,45 365,65 365,110 300,130 235,110" fill={activeColorObj.value} stroke={activeColorObj.border} strokeWidth="6" />}

                    {/* Bridge */}
                    <path d="M 155,75 Q 200,60 245,75" stroke={activeColorObj.border} strokeWidth="6" fill="none" />
                    {shape === 'Aviator' && (
                      // Double bridge for Aviator
                      <path d="M 157,55 Q 200,48 243,55" stroke={activeColorObj.border} strokeWidth="4" fill="none" />
                    )}

                    {/* Left Lens Fill */}
                    {shape === 'Rectangle' && <rect x="42" y="52" width="116" height="71" rx="10" fill={activeLensObj.color} fillOpacity={lensOpacity} />}
                    {shape === 'Round' && <circle cx="100" cy="85" r="41" fill={activeLensObj.color} fillOpacity={lensOpacity} />}
                    {shape === 'Cat-Eye' && <path d="M 42,52 C 42,52 100,32 158,59 C 158,92 140,121 100,121 C 60,121 42,92 42,52 Z" fill={activeLensObj.color} fillOpacity={lensOpacity} />}
                    {shape === 'Wayfarer' && <path d="M 42,52 L 158,58 C 153,90 140,117 100,117 C 60,117 47,90 42,52 Z" fill={activeLensObj.color} fillOpacity={lensOpacity} />}
                    {shape === 'Aviator' && <path d="M 47,56 L 153,56 C 153,88 140,127 95,127 C 50,127 47,88 47,56 Z" fill={activeLensObj.color} fillOpacity={lensOpacity} />}
                    {shape === 'Hexagonal' && <polygon points="42,70 100,52 158,70 158,105 100,121 42,105" fill={activeLensObj.color} fillOpacity={lensOpacity} />}

                    {/* Right Lens Fill */}
                    {shape === 'Rectangle' && <rect x="242" y="52" width="116" height="71" rx="10" fill={activeLensObj.color} fillOpacity={lensOpacity} />}
                    {shape === 'Round' && <circle cx="300" cy="85" r="41" fill={activeLensObj.color} fillOpacity={lensOpacity} />}
                    {shape === 'Cat-Eye' && <path d="M 242,59 C 300,32 358,52 358,52 C 358,92 340,121 300,121 C 260,121 242,92 242,59 Z" fill={activeLensObj.color} fillOpacity={lensOpacity} />}
                    {shape === 'Wayfarer' && <path d="M 242,58 L 358,52 C 353,90 340,117 300,117 C 260,117 247,90 242,58 Z" fill={activeLensObj.color} fillOpacity={lensOpacity} />}
                    {shape === 'Aviator' && <path d="M 247,56 L 353,56 C 353,88 340,127 305,127 C 260,127 247,88 247,56 Z" fill={activeLensObj.color} fillOpacity={lensOpacity} />}
                    {shape === 'Hexagonal' && <polygon points="242,70 300,52 358,70 358,105 300,121 242,105" fill={activeLensObj.color} fillOpacity={lensOpacity} />}

                    {/* Glass Reflection glare */}
                    <path d="M 60,65 Q 120,45 130,95" stroke="rgba(255,255,255,0.25)" strokeWidth="4" strokeLinecap="round" fill="none" />
                    <path d="M 260,65 Q 320,45 330,95" stroke="rgba(255,255,255,0.25)" strokeWidth="4" strokeLinecap="round" fill="none" />
                    <path d="M 50,60 L 80,60" stroke="rgba(255,255,255,0.15)" strokeWidth="2" strokeLinecap="round" fill="none" />
                    <path d="M 250,60 L 280,60" stroke="rgba(255,255,255,0.15)" strokeWidth="2" strokeLinecap="round" fill="none" />

                    {/* Corner Rivets */}
                    {shape === 'Wayfarer' && (
                      <>
                        <ellipse cx="44" cy="55" rx="3" ry="1.5" fill="#fff" opacity="0.8" transform="rotate(-10, 44, 55)" />
                        <ellipse cx="356" cy="55" rx="3" ry="1.5" fill="#fff" opacity="0.8" transform="rotate(10, 356, 55)" />
                      </>
                    )}
                  </svg>
                </div>

                {/* Engraving Tag Indicator */}
                {engraving && (
                  <div className="absolute bottom-4 left-4 bg-black/80 border border-premium-accent/30 rounded px-2.5 py-1 text-[10px] tracking-wider text-premium-accent font-mono uppercase">
                    Temple Engraving: "{engraving}"
                  </div>
                )}

                {/* Mode controls on top right */}
                <div className="absolute top-4 right-4 flex gap-2">
                  <button 
                    onClick={() => fileInputRef.current.click()}
                    className="bg-black/60 hover:bg-premium-accent hover:text-premium-black p-2 rounded-lg text-white border border-white/10 transition-colors"
                    title="Upload Selfie for Try On"
                  >
                    <Sliders className="w-4 h-4" />
                  </button>
                  {tryOnImage && (
                    <>
                      <button 
                        onClick={() => setShowFaceGrid(!showFaceGrid)}
                        className={`p-2 rounded-lg border transition-colors ${showFaceGrid ? 'bg-premium-accent text-premium-black border-premium-accent' : 'bg-black/60 text-white border-white/10'}`}
                        title="Toggle Face Alignment Grid"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => setTryOnImage(null)}
                        className="bg-black/60 hover:bg-red-600 p-2 rounded-lg text-white border border-white/10 transition-colors"
                        title="Clear Try On Photo"
                      >
                        <RotateCcw className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>

                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleImageUpload} 
                  accept="image/*" 
                  className="hidden" 
                />

              </div>

              {/* Try on Instructions */}
              <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex gap-3 items-center text-xs text-gray-300">
                <ShieldCheck className="w-5 h-5 text-premium-accent shrink-0" />
                <p>
                  <strong>Virtual Try-On:</strong> Upload your photo using the slider icon at the top right to overlay your customized frames directly onto your face.
                </p>
              </div>

            </div>

            {/* ─── RIGHT: CUSTOMIZATION PANELS ─── */}
            <div className="lg:col-span-5 space-y-6">
              
              <div className="bg-neutral-900 border border-white/10 rounded-2xl p-6 sm:p-8 space-y-6">
                
                {/* 1. Choose Frame Shape */}
                <div className="space-y-3">
                  <h3 className="text-xs uppercase tracking-wider text-premium-accent font-bold flex items-center gap-1.5">
                    <Sliders className="w-3.5 h-3.5" /> 1. Frame Silhouette
                  </h3>
                  <div className="grid grid-cols-3 gap-2">
                    {shapes.map(s => (
                      <button
                        key={s}
                        onClick={() => setShape(s)}
                        className={`py-3 px-2 border rounded-lg text-xs font-bold transition-all ${
                          shape === s
                            ? 'border-premium-accent bg-premium-accent/10 text-premium-accent'
                            : 'border-white/10 hover:border-premium-accent/50 text-gray-400'
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 2. Choose Material */}
                <div className="space-y-3">
                  <h3 className="text-xs uppercase tracking-wider text-premium-accent font-bold flex items-center gap-1.5">
                    <Palette className="w-3.5 h-3.5" /> 2. Core Material
                  </h3>
                  <div className="flex gap-4">
                    {[
                      { id: 'acetate', name: 'Polished Acetate', desc: 'Handcrafted natural fiber gloss' },
                      { id: 'titanium', name: 'Beta Titanium', desc: 'Ultra-light flexible aerospace metal' }
                    ].map(m => (
                      <button
                        key={m.id}
                        onClick={() => setMaterial(m.id)}
                        className={`flex-1 p-3 border rounded-lg text-left transition-all ${
                          material === m.id
                            ? 'border-premium-accent bg-premium-accent/5'
                            : 'border-white/10 hover:border-premium-accent/40'
                        }`}
                      >
                        <p className={`text-xs font-bold ${material === m.id ? 'text-premium-accent' : 'text-white'}`}>{m.name}</p>
                        <p className="text-[10px] text-gray-400 mt-0.5 leading-tight">{m.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* 3. Choose Frame Colors */}
                <div className="space-y-3">
                  <h3 className="text-xs uppercase tracking-wider text-premium-accent font-bold flex items-center gap-1.5">
                    <Palette className="w-3.5 h-3.5" /> 3. Frame Polish & Texture
                  </h3>
                  <div className="grid grid-cols-2 gap-2.5">
                    {frameColors.map(c => (
                      <button
                        key={c.name}
                        onClick={() => setFrameColor(c.name)}
                        className={`flex items-center gap-2.5 p-2.5 border rounded-lg text-xs font-semibold text-left transition-all ${
                          frameColor === c.name
                            ? 'border-premium-accent bg-premium-accent/5'
                            : 'border-white/10 hover:border-premium-accent/40'
                        }`}
                      >
                        <span 
                          className="w-4 h-4 rounded-full border border-white/20 shrink-0" 
                          style={{ background: c.value.startsWith('url') ? '#8A4F58' : c.value }} 
                        />
                        <span className={frameColor === c.name ? 'text-premium-accent' : 'text-white'}>{c.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* 4. Choose Lens Tint */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <h3 className="text-xs uppercase tracking-wider text-premium-accent font-bold flex items-center gap-1.5">
                      <Eye className="w-3.5 h-3.5" /> 4. Polarized Lens Filter
                    </h3>
                    <span className="text-[10px] font-mono text-gray-400">{Math.round(lensOpacity * 100)}% Opacity</span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2.5">
                    {lensTints.map(l => (
                      <button
                        key={l.name}
                        onClick={() => setLensTint(l.name)}
                        className={`flex items-center gap-2.5 p-2.5 border rounded-lg text-xs font-semibold text-left transition-all ${
                          lensTint === l.name
                            ? 'border-premium-accent bg-premium-accent/5'
                            : 'border-white/10 hover:border-premium-accent/40'
                        }`}
                      >
                        <span className="w-4 h-4 rounded-full border border-white/20 shrink-0" style={{ backgroundColor: l.color }} />
                        <span className={lensTint === l.name ? 'text-premium-accent' : 'text-white'}>{l.name}</span>
                      </button>
                    ))}
                  </div>

                  {/* Opacity slider */}
                  <div className="pt-2">
                    <input 
                      type="range" 
                      min="0.2" 
                      max="0.95" 
                      step="0.05"
                      value={lensOpacity} 
                      onChange={(e) => setLensOpacity(parseFloat(e.target.value))}
                      className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-premium-accent" 
                    />
                  </div>
                </div>

                {/* 5. Custom Temple Engraving */}
                <div className="space-y-3">
                  <h3 className="text-xs uppercase tracking-wider text-premium-accent font-bold flex items-center gap-1.5">
                    <Edit3 className="w-3.5 h-3.5" /> 5. Custom Monogram
                  </h3>
                  <input
                    type="text"
                    maxLength={15}
                    placeholder="Enter initials or name (e.g. ADIL)"
                    value={engraving}
                    onChange={(e) => setEngraving(e.target.value.toUpperCase())}
                    className="w-full bg-white/5 border border-white/10 rounded-lg py-3 px-4 text-xs font-mono text-premium-accent focus:outline-none focus:border-premium-accent uppercase placeholder:text-gray-600"
                  />
                  <p className="text-[10px] text-gray-500 font-light">Laser-etched inside the right temple tip. Maximum 15 characters.</p>
                </div>

                {/* Success alert */}
                {successMsg && (
                  <div className="p-4 bg-green-950/40 border border-green-800 text-green-400 text-xs font-semibold rounded-lg flex items-center gap-2 animate-pulse">
                    <span>✓</span> {successMsg}
                  </div>
                )}

                {/* Action buttons */}
                <div className="flex gap-4 pt-4 border-t border-white/5">
                  <button 
                    onClick={handleAddToCart}
                    className="flex-1 bg-premium-accent hover:bg-premium-golddark text-premium-black font-bold uppercase tracking-wider text-xs py-4 px-6 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    Configure & Cart
                  </button>
                  <button 
                    onClick={() => {
                      setShape('Rectangle');
                      setMaterial('acetate');
                      setFrameColor('Onyx Matte');
                      setLensTint('Polarized Slate');
                      setEngraving('');
                      setLensOpacity(0.85);
                    }}
                    className="border border-white/10 hover:border-premium-accent text-white hover:text-premium-accent font-semibold text-xs tracking-wider uppercase py-4 px-4 rounded-xl transition-all"
                    title="Reset Configuration"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                </div>

              </div>

            </div>

          </div>

        </div>
      </div>
    </>
  );
}
