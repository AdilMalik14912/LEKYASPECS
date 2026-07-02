import React, { useState, useRef } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { Upload, Sparkles, Palette, Sun, Moon, RefreshCw } from 'lucide-react';

// ─────────────────────────────────────────────────────────────────────────────
// Skin Tone Analyzer: Uses HTML5 Canvas pixel sampling to extract average skin
// hue/saturation/lightness from the user's photo → maps to undertone (warm /
// cool / neutral) → generates personalized frame + lens color recommendations.
// 100% client-side, zero backend, zero data sent anywhere.
// ─────────────────────────────────────────────────────────────────────────────

// RGB → HSL
function rgbToHsl(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r,g,b), min = Math.min(r,g,b);
  let h, s, l = (max+min)/2;
  if (max === min) { h = s = 0; }
  else {
    const d = max - min;
    s = l > 0.5 ? d/(2-max-min) : d/(max+min);
    switch(max) {
      case r: h = ((g-b)/d + (g<b?6:0))/6; break;
      case g: h = ((b-r)/d + 2)/6; break;
      default: h = ((r-g)/d + 4)/6;
    }
  }
  return { h: h*360, s: s*100, l: l*100 };
}

// Classify undertone from skin pixel stats
function classifyUndertone(hMean, sMean, lMean) {
  // Warm: reds/yellows/oranges (hue 15-55)
  // Cool: pinks/blues/purples (hue 330-360 or 180-260)
  // Neutral: balanced
  if (hMean >= 15 && hMean <= 55 && sMean > 20) return 'warm';
  if ((hMean >= 310 || hMean <= 15) || (hMean >= 180 && hMean <= 260)) return 'cool';
  return 'neutral';
}

// Fitzpatrick-ish shade from lightness
function classifyShade(lMean) {
  if (lMean >= 75) return { label: 'Light/Fair', roman: 'I–II', emoji: '🌸' };
  if (lMean >= 60) return { label: 'Light-Medium', roman: 'II–III', emoji: '🍑' };
  if (lMean >= 48) return { label: 'Medium', roman: 'III', emoji: '🌻' };
  if (lMean >= 36) return { label: 'Medium-Deep', roman: 'IV', emoji: '🌰' };
  if (lMean >= 22) return { label: 'Deep', roman: 'V', emoji: '☕' };
  return { label: 'Rich Deep', roman: 'VI', emoji: '🍫' };
}

const RECOMMENDATIONS = {
  warm: {
    tagline: 'Warm, golden undertones — rich amber, tortoise & earth-tone frames will glow on you.',
    frames: [
      { label: 'Tortoise Shell', hex: '#8B4513', reason: 'Earth brown mirrors your warmth' },
      { label: 'Cognac Acetate', hex: '#A0522D', reason: 'Amber reflects your golden glow' },
      { label: 'Polished Gold', hex: '#D4AF37', reason: 'Gold metal elevates warm skin' },
      { label: 'Olive Green',   hex: '#556B2F', reason: 'Earthy green complements red undertones' },
      { label: 'Warm Copper',   hex: '#B87333', reason: 'Copper harmonizes with your skin tone' },
    ],
    avoidFrames: ['Cool Silver', 'Navy Blue', 'Stark White'],
    lenses: ['Champagne Gold', 'Amber Brown', 'Peachy Rose'],
    celebrities: ['Priyanka Chopra', 'Beyoncé', 'Jennifer Lopez'],
  },
  cool: {
    tagline: 'Cool, rosy undertones — silver, charcoal & jewel-toned frames will be your secret weapon.',
    frames: [
      { label: 'Polished Silver', hex: '#A8A9AD', reason: 'Silver amplifies cool pink tones' },
      { label: 'Onyx Matte',     hex: '#1C1C1E', reason: 'High-contrast black is universally cool' },
      { label: 'Sapphire Blue',  hex: '#0F52BA', reason: 'Cool blue echo cool undertones perfectly' },
      { label: 'Plum Purple',    hex: '#5C1F7A', reason: 'Deep jewel tones complement your skin' },
      { label: 'Rose Gold',      hex: '#B76E79', reason: 'Rose-pink metal mirrors your skin flush' },
    ],
    avoidFrames: ['Warm Orange', 'Olive Green', 'Bright Yellow'],
    lenses: ['Polarized Slate', 'Lavender Tint', 'Ocean Blue'],
    celebrities: ['Deepika Padukone', 'Emma Watson', 'Lupita Nyong\'o'],
  },
  neutral: {
    tagline: 'Balanced neutral undertones — you\'re the lucky one! Almost any color works beautifully.',
    frames: [
      { label: 'Classic Tortoise', hex: '#8B6914', reason: 'Works across warm and cool spectrums' },
      { label: 'Onyx Matte',       hex: '#1C1C1E', reason: 'Neutral black pairs with everything' },
      { label: 'Warm Gunmetal',    hex: '#697077', reason: 'Perfectly mid-spectrum grey-brown' },
      { label: 'Crystal Clear',    hex: '#C0C8D0', reason: 'Transparent lets your skin shine through' },
      { label: 'Rosewood',         hex: '#A45C6A', reason: 'Elegant pinkish-brown bridges both ends' },
    ],
    avoidFrames: [], // Neutral undertones avoid nothing!
    lenses: ['Polarized Smoke', 'Champagne Gold', 'Crystal Tint'],
    celebrities: ['Zendaya', 'Aishwarya Rai', 'Viola Davis'],
  },
};

export default function SkinToneAnalyzer() {
  const canvasRef   = useRef(null);
  const fileRef     = useRef(null);
  const [imageSrc, setImageSrc]       = useState(null);
  const [analyzing, setAnalyzing]     = useState(false);
  const [result, setResult]           = useState(null);
  const [samplePoints, setSamplePoints] = useState([]);

  const analyzeImage = async (dataUrl) => {
    setAnalyzing(true);
    setResult(null);

    // Small delay to allow render
    await new Promise(r => setTimeout(r, 50));

    const img = new window.Image();
    img.src = dataUrl;
    await new Promise(r => { img.onload = r; });

    const canvas = canvasRef.current;
    canvas.width  = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0);

    // Sample regions: cheeks (left/right), forehead center, nose tip
    const W = canvas.width, H = canvas.height;
    // Approximate face-center sampling in thirds of image
    const regions = [
      { name: 'L-cheek',   rx: 0.25, ry: 0.52, rw: 0.12, rh: 0.12 },
      { name: 'R-cheek',   rx: 0.63, ry: 0.52, rw: 0.12, rh: 0.12 },
      { name: 'Forehead',  rx: 0.38, ry: 0.22, rw: 0.24, rh: 0.10 },
      { name: 'Nose-tip',  rx: 0.44, ry: 0.54, rw: 0.12, rh: 0.08 },
    ];

    let totalH = 0, totalS = 0, totalL = 0, totalPx = 0;
    const points = [];

    for (const r of regions) {
      const x = Math.round(r.rx * W), y = Math.round(r.ry * H);
      const w = Math.round(r.rw * W), h = Math.round(r.rh * H);
      const imgData = ctx.getImageData(x, y, w, h);
      const d = imgData.data;
      let rAcc = 0, gAcc = 0, bAcc = 0, n = 0;
      for (let i = 0; i < d.length; i += 4) {
        // Skip near-black or near-white (background/artifact pixels)
        const brightness = (d[i] + d[i+1] + d[i+2]) / 3;
        if (brightness < 20 || brightness > 235) continue;
        rAcc += d[i]; gAcc += d[i+1]; bAcc += d[i+2]; n++;
      }
      if (n > 0) {
        const avgR = rAcc/n, avgG = gAcc/n, avgB = bAcc/n;
        const hsl = rgbToHsl(avgR, avgG, avgB);
        totalH += hsl.h; totalS += hsl.s; totalL += hsl.l; totalPx++;
        points.push({
          name: r.name,
          hex: `#${Math.round(avgR).toString(16).padStart(2,'0')}${Math.round(avgG).toString(16).padStart(2,'0')}${Math.round(avgB).toString(16).padStart(2,'0')}`,
          hsl,
          screen: { x: r.rx * 100, y: r.ry * 100 }
        });
      }
    }

    const hMean = totalH / totalPx;
    const sMean = totalS / totalPx;
    const lMean = totalL / totalPx;

    const undertone = classifyUndertone(hMean, sMean, lMean);
    const shade     = classifyShade(lMean);
    const recs      = RECOMMENDATIONS[undertone];

    setSamplePoints(points);
    setResult({ undertone, shade, recs, hMean, sMean, lMean, dominantHex: points[0]?.hex });
    setAnalyzing(false);
  };

  const handleUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setImageSrc(ev.target.result);
      setResult(null);
      setSamplePoints([]);
      analyzeImage(ev.target.result);
    };
    reader.readAsDataURL(file);
  };

  const reset = () => {
    setImageSrc(null);
    setResult(null);
    setSamplePoints([]);
  };

  const undertoneStyles = {
    warm:    { gradient: 'from-amber-900/30 via-orange-900/20 to-transparent', badge: 'bg-amber-500/20 border-amber-500/40 text-amber-300', icon: <Sun className="w-4 h-4" /> },
    cool:    { gradient: 'from-blue-900/30 via-purple-900/20 to-transparent',  badge: 'bg-blue-500/20 border-blue-500/40 text-blue-300',   icon: <Moon className="w-4 h-4" /> },
    neutral: { gradient: 'from-gray-800/40 via-slate-900/20 to-transparent',   badge: 'bg-gray-500/20 border-gray-500/40 text-gray-300',   icon: <Sparkles className="w-4 h-4" /> },
  };

  return (
    <>
      <Head>
        <title>AI Skin Tone Analyzer — Lekya Specs</title>
        <meta name="description" content="Upload your photo for AI-powered skin tone and undertone analysis. Get personalized frame color recommendations based on your exact skin palette." />
      </Head>

      <div className="min-h-screen bg-[#08080D] text-white pb-20">
        <canvas ref={canvasRef} className="hidden" />

        {/* Header */}
        <div className="pt-20 pb-10 text-center px-4">
          <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-widest text-premium-accent font-bold bg-premium-accent/10 border border-premium-accent/20 px-3 py-1 rounded-full mb-3">
            <Palette className="w-3 h-3" /> Chromatic Intelligence
          </span>
          <h1 className="font-serif text-3xl sm:text-5xl font-bold text-white">
            Skin Tone <span className="text-premium-accent">AI Lab</span>
          </h1>
          <p className="text-gray-400 text-sm font-light mt-2 max-w-lg mx-auto">
            Upload a selfie. Our canvas pixel analyzer samples 4 facial regions, extracts HSL values, classifies your undertone, and generates a bespoke color DNA for your perfect frames.
          </p>
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          
          {/* Upload zone */}
          {!imageSrc && (
            <div className="flex flex-col items-center">
              <label
                htmlFor="skin-upload"
                className="group relative w-full max-w-md h-64 border-2 border-dashed border-white/20 hover:border-premium-accent/60 rounded-2xl flex flex-col items-center justify-center gap-4 cursor-pointer transition-all bg-[#111118] hover:bg-premium-accent/5"
              >
                <div className="w-14 h-14 rounded-full bg-premium-accent/10 border border-premium-accent/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Upload className="w-6 h-6 text-premium-accent" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-bold text-white">Upload a Selfie</p>
                  <p className="text-xs text-gray-400 mt-1">JPEG, PNG — processed entirely in-browser</p>
                </div>
                <span className="text-[10px] text-premium-accent/60 font-bold tracking-wider uppercase border border-premium-accent/20 px-3 py-1 rounded-full">
                  Choose File
                </span>
                <input id="skin-upload" ref={fileRef} type="file" accept="image/*" onChange={handleUpload} className="hidden" />
              </label>
            </div>
          )}

          {/* Analysis in progress */}
          {analyzing && (
            <div className="flex flex-col items-center gap-6 py-10">
              <div className="relative w-20 h-20">
                <div className="absolute inset-0 border-4 border-premium-accent/20 rounded-full" />
                <div className="absolute inset-0 border-4 border-t-premium-accent rounded-full animate-spin" />
                <Palette className="absolute inset-0 m-auto w-8 h-8 text-premium-accent" />
              </div>
              <div className="text-center space-y-1">
                <p className="text-premium-accent text-sm font-bold tracking-wider">Analyzing Skin Chromatics…</p>
                <p className="text-gray-500 text-xs">Sampling pixels from cheeks, forehead, and nose regions</p>
              </div>
            </div>
          )}

          {/* Photo + Sample points overlay */}
          {imageSrc && !analyzing && (
            <div className="flex flex-col sm:flex-row gap-6 items-start max-w-4xl mx-auto">
              {/* Photo with color dots */}
              <div className="relative rounded-2xl overflow-hidden border border-white/10 shadow-xl w-full sm:w-64 shrink-0">
                <img src={imageSrc} alt="uploaded" className="w-full block" />
                {samplePoints.map((pt, i) => (
                  <div
                    key={i}
                    className="absolute w-5 h-5 rounded-full border-2 border-white shadow-lg transform -translate-x-1/2 -translate-y-1/2 cursor-help transition-transform hover:scale-150"
                    style={{ left: `${pt.screen.x}%`, top: `${pt.screen.y}%`, backgroundColor: pt.hex }}
                    title={`${pt.name}: ${pt.hex} — H:${Math.round(pt.hsl.h)}° S:${Math.round(pt.hsl.s)}% L:${Math.round(pt.hsl.l)}%`}
                  />
                ))}
                <button
                  onClick={reset}
                  className="absolute bottom-2 right-2 bg-black/70 hover:bg-red-700 text-white text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded flex items-center gap-1 transition-colors"
                >
                  <RefreshCw className="w-3 h-3" /> New Photo
                </button>
              </div>

              {/* Color swatches row */}
              {result && (
                <div className="space-y-4 flex-1">
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-2">Extracted Skin Pixels</p>
                    <div className="flex gap-3">
                      {samplePoints.map((pt, i) => (
                        <div key={i} className="flex flex-col items-center gap-1">
                          <div className="w-9 h-9 rounded-full border-2 border-white/20 shadow" style={{ backgroundColor: pt.hex }} />
                          <span className="text-[9px] text-gray-400">{pt.name}</span>
                          <span className="text-[8px] font-mono text-gray-500">{pt.hex}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="text-[10px] text-gray-500 font-mono space-y-0.5">
                    <p>Avg Hue: <span className="text-gray-300">{Math.round(result.hMean)}°</span></p>
                    <p>Saturation: <span className="text-gray-300">{Math.round(result.sMean)}%</span></p>
                    <p>Lightness: <span className="text-gray-300">{Math.round(result.lMean)}%</span></p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Results section */}
          {result && !analyzing && (
            <div className={`rounded-2xl p-6 sm:p-10 bg-gradient-to-br ${undertoneStyles[result.undertone].gradient} border border-white/10 space-y-8 max-w-4xl mx-auto`}>

              {/* Undertone badge */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div className="space-y-1">
                  <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-bold uppercase tracking-wider ${undertoneStyles[result.undertone].badge}`}>
                    {undertoneStyles[result.undertone].icon}
                    {result.undertone} Undertone
                  </div>
                  <p className="text-sm text-gray-300 font-light mt-2 leading-relaxed max-w-lg">{result.recs.tagline}</p>
                </div>
                <div className="shrink-0 text-center bg-white/5 border border-white/10 rounded-xl p-4">
                  <span className="text-4xl">{result.shade.emoji}</span>
                  <p className="text-[10px] text-gray-400 uppercase tracking-widest mt-1">{result.shade.label}</p>
                  <p className="text-[10px] text-premium-accent font-bold">Fitzpatrick {result.shade.roman}</p>
                </div>
              </div>

              {/* Frame Recommendations */}
              <div>
                <h2 className="text-xs uppercase tracking-widest font-bold text-premium-accent mb-4 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" /> Your Perfect Frame Colors
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                  {result.recs.frames.map((f, i) => (
                    <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-3 flex flex-col gap-2 hover:border-premium-accent/40 transition-all">
                      <div className="w-10 h-10 rounded-full mx-auto border-2 border-white/10 shadow-lg" style={{ backgroundColor: f.hex }} />
                      <p className="text-[10px] font-bold text-white text-center">{f.label}</p>
                      <p className="text-[9px] text-gray-400 text-center leading-tight">{f.reason}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Lens tints */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-xs uppercase tracking-widest font-bold text-premium-accent mb-3">Recommended Lenses</h3>
                  <ul className="space-y-1.5">
                    {result.recs.lenses.map(l => (
                      <li key={l} className="flex items-center gap-2 text-xs text-gray-300">
                        <span className="w-1.5 h-1.5 rounded-full bg-premium-accent shrink-0" /> {l}
                      </li>
                    ))}
                  </ul>
                </div>
                {result.recs.avoidFrames.length > 0 && (
                  <div>
                    <h3 className="text-xs uppercase tracking-widest font-bold text-red-400 mb-3">Frames to Avoid</h3>
                    <ul className="space-y-1.5">
                      {result.recs.avoidFrames.map(f => (
                        <li key={f} className="flex items-center gap-2 text-xs text-gray-400">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-400 shrink-0" /> {f}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Style icons */}
              <div>
                <h3 className="text-xs uppercase tracking-widest font-bold text-premium-accent mb-3">Your Celebrity Style Icons</h3>
                <div className="flex gap-3 flex-wrap">
                  {result.recs.celebrities.map(c => (
                    <span key={c} className="text-xs bg-white/5 border border-white/10 px-3 py-1.5 rounded-full text-gray-300 font-medium">✨ {c}</span>
                  ))}
                </div>
              </div>

              {/* CTA */}
              <div className="pt-4 border-t border-white/10 flex flex-wrap gap-4">
                <Link href="/shop" className="flex items-center gap-2 bg-premium-accent hover:bg-premium-golddark text-premium-black font-bold uppercase tracking-wider text-xs py-3 px-6 rounded-xl transition-all">
                  Shop Your Palette →
                </Link>
                <Link href="/ar-tryon" className="flex items-center gap-2 border border-white/20 hover:border-premium-accent text-white hover:text-premium-accent font-bold uppercase tracking-wider text-xs py-3 px-6 rounded-xl transition-all">
                  Live AR Try-On →
                </Link>
                <button
                  onClick={reset}
                  className="flex items-center gap-2 border border-white/20 hover:border-white/40 text-gray-400 hover:text-white font-bold uppercase tracking-wider text-xs py-3 px-6 rounded-xl transition-all"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> New Photo
                </button>
              </div>

            </div>
          )}

        </div>
      </div>
    </>
  );
}
