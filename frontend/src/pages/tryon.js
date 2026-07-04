const React = require('react');
const { useState, useEffect, useRef, useCallback } = React;
const Link = require('next/link').default;
const Head = require('next/head').default;
const { Upload, RefreshCw, ArrowLeft, Download, Check, Wand2, Eye, ZoomIn, ZoomOut, Move, RotateCw, Sparkles } = require('lucide-react');

const API_BASE = typeof window !== 'undefined'
  ? (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' ? 'http://localhost:5000' : '')
  : '';

// Curated face model images — front-facing portraits with clear eye region
const MODEL_FACES = [
  { id: 1, name: 'Sophia', shape: 'Oval', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=90&w=800&h=900&crop=faces' },
  { id: 2, name: 'James',  shape: 'Round', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=90&w=800&h=900&crop=faces' },
  { id: 3, name: 'Emily',  shape: 'Heart', url: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&q=90&w=800&h=900&crop=faces' },
  { id: 4, name: 'Marcus', shape: 'Square', url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=90&w=800&h=900&crop=faces' },
];

// Eyewear SVG frames — transparent, pure CSS overlays, no white background issue
const SVG_FRAMES = [
  {
    id: 'wayfarer',
    name: 'Classic Wayfarer',
    color: '#1a1a1a',
    svg: (color, opacity) => `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 100" fill="none">
        <rect x="10" y="15" width="115" height="65" rx="8" ry="8" stroke="${color}" stroke-width="5" fill="rgba(100,120,140,${opacity})" />
        <rect x="175" y="15" width="115" height="65" rx="8" ry="8" stroke="${color}" stroke-width="5" fill="rgba(100,120,140,${opacity})" />
        <path d="M125 40 Q150 30 175 40" stroke="${color}" stroke-width="5" fill="none" stroke-linecap="round"/>
        <line x1="0" y1="35" x2="10" y2="40" stroke="${color}" stroke-width="4" stroke-linecap="round"/>
        <line x1="300" y1="35" x2="290" y2="40" stroke="${color}" stroke-width="4" stroke-linecap="round"/>
      </svg>
    `,
  },
  {
    id: 'round',
    name: 'Round Frames',
    color: '#8B6914',
    svg: (color, opacity) => `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 100" fill="none">
        <circle cx="80" cy="50" r="42" stroke="${color}" stroke-width="5" fill="rgba(150,180,120,${opacity})"/>
        <circle cx="220" cy="50" r="42" stroke="${color}" stroke-width="5" fill="rgba(150,180,120,${opacity})"/>
        <path d="M122 45 Q150 32 178 45" stroke="${color}" stroke-width="4" fill="none" stroke-linecap="round"/>
        <line x1="0" y1="38" x2="38" y2="44" stroke="${color}" stroke-width="4" stroke-linecap="round"/>
        <line x1="300" y1="38" x2="262" y2="44" stroke="${color}" stroke-width="4" stroke-linecap="round"/>
      </svg>
    `,
  },
  {
    id: 'aviator',
    name: 'Aviator',
    color: '#C5A028',
    svg: (color, opacity) => `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 100" fill="none">
        <path d="M15,25 Q67,5 120,25 Q105,80 67,90 Q30,80 15,25Z" stroke="${color}" stroke-width="4" fill="rgba(180,210,200,${opacity})"/>
        <path d="M285,25 Q233,5 180,25 Q195,80 233,90 Q270,80 285,25Z" stroke="${color}" stroke-width="4" fill="rgba(180,210,200,${opacity})"/>
        <path d="M120 30 Q150 22 180 30" stroke="${color}" stroke-width="4" fill="none" stroke-linecap="round"/>
        <line x1="0" y1="32" x2="15" y2="30" stroke="${color}" stroke-width="3.5" stroke-linecap="round"/>
        <line x1="300" y1="32" x2="285" y2="30" stroke="${color}" stroke-width="3.5" stroke-linecap="round"/>
      </svg>
    `,
  },
  {
    id: 'cateye',
    name: 'Cat-Eye',
    color: '#8B0000',
    svg: (color, opacity) => `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 100" fill="none">
        <path d="M15,50 Q20,15 70,10 L125,20 Q130,35 120,60 Q85,85 45,75 Z" stroke="${color}" stroke-width="4.5" fill="rgba(220,160,180,${opacity})"/>
        <path d="M285,50 Q280,15 230,10 L175,20 Q170,35 180,60 Q215,85 255,75 Z" stroke="${color}" stroke-width="4.5" fill="rgba(220,160,180,${opacity})"/>
        <path d="M125 25 Q150 16 175 25" stroke="${color}" stroke-width="4" fill="none" stroke-linecap="round"/>
        <line x1="0" y1="42" x2="15" y2="48" stroke="${color}" stroke-width="3.5" stroke-linecap="round"/>
        <line x1="300" y1="42" x2="285" y2="48" stroke="${color}" stroke-width="3.5" stroke-linecap="round"/>
      </svg>
    `,
  },
  {
    id: 'rectangle',
    name: 'Rectangle',
    color: '#1a3a5c',
    svg: (color, opacity) => `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 100" fill="none">
        <rect x="10" y="22" width="120" height="56" rx="4" stroke="${color}" stroke-width="4.5" fill="rgba(160,200,220,${opacity})"/>
        <rect x="170" y="22" width="120" height="56" rx="4" stroke="${color}" stroke-width="4.5" fill="rgba(160,200,220,${opacity})"/>
        <path d="M130 42 Q150 32 170 42" stroke="${color}" stroke-width="4" fill="none" stroke-linecap="round"/>
        <line x1="0" y1="36" x2="10" y2="40" stroke="${color}" stroke-width="4" stroke-linecap="round"/>
        <line x1="300" y1="36" x2="290" y2="40" stroke="${color}" stroke-width="4" stroke-linecap="round"/>
      </svg>
    `,
  },
  {
    id: 'hexagonal',
    name: 'Hexagonal',
    color: '#2d4a22',
    svg: (color, opacity) => `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 100" fill="none">
        <polygon points="30,25 70,10 110,25 110,65 70,80 30,65" stroke="${color}" stroke-width="4.5" fill="rgba(160,220,160,${opacity})"/>
        <polygon points="190,25 230,10 270,25 270,65 230,80 190,65" stroke="${color}" stroke-width="4.5" fill="rgba(160,220,160,${opacity})"/>
        <path d="M110 32 Q150 20 190 32" stroke="${color}" stroke-width="4" fill="none" stroke-linecap="round"/>
        <line x1="0" y1="38" x2="30" y2="40" stroke="${color}" stroke-width="4" stroke-linecap="round"/>
        <line x1="300" y1="38" x2="270" y2="40" stroke="${color}" stroke-width="4" stroke-linecap="round"/>
      </svg>
    `,
  },
];

// Frame color palette options
const FRAME_COLORS = [
  { name: 'Noir', value: '#111111' },
  { name: 'Gold', value: '#C5A028' },
  { name: 'Rose Gold', value: '#c97777' },
  { name: 'Silver', value: '#9e9e9e' },
  { name: 'Tortoise', value: '#8B4513' },
  { name: 'Navy', value: '#1a3a6c' },
  { name: 'Crimson', value: '#8B0000' },
  { name: 'Forest', value: '#2d5a1b' },
];

export default function TryOnStudio() {
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [useProductFrame, setUseProductFrame] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Face model state
  const [faceImage, setFaceImage] = useState(MODEL_FACES[0].url);
  const [userUploadedImage, setUserUploadedImage] = useState(null);

  // SVG frame state
  const [selectedFrame, setSelectedFrame] = useState(SVG_FRAMES[0]);
  const [frameColor, setFrameColor] = useState(FRAME_COLORS[0].value);
  const [lensOpacity, setLensOpacity] = useState(0.12);

  // Adjustment state
  const [scale, setScale] = useState(1);
  const [posX, setPosX] = useState(0);
  const [posY, setPosY] = useState(0);
  const [rotation, setRotation] = useState(0);

  // AI auto-fit state
  const [autoFitDone, setAutoFitDone] = useState(false);
  const [autoFitting, setAutoFitting] = useState(false);
  const [autoFitError, setAutoFitError] = useState(null);

  // Image & Canvas refs
  const faceImageRef = useRef(null);
  const previewRef = useRef(null);

  // Fetch product catalog
  useEffect(() => {
    fetch(`${API_BASE}/api/products`)
      .then(res => res.json())
      .then(data => {
        setProducts(data);
        if (data.length > 0) setSelectedProduct(data[0]);
        setLoadingProducts(false);
      })
      .catch(() => setLoadingProducts(false));
  }, []);

  const currentFaceImg = userUploadedImage || faceImage;

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setUserUploadedImage(ev.target.result);
      setPosX(0); setPosY(0); setScale(1); setRotation(0); setAutoFitDone(false);
      setAutoFitError(null);
    };
    reader.readAsDataURL(file);
  };

  // Helper to load face-api script on demand
  const loadFaceApi = () => new Promise((resolve, reject) => {
    if (window.faceapi) { resolve(window.faceapi); return; }
    const s = document.createElement('script');
    s.src = 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api/dist/face-api.js';
    s.onload = () => resolve(window.faceapi);
    s.onerror = (err) => reject(err);
    document.head.appendChild(s);
  });

  // AI Auto-Fit: Runs real face-api detection on the loaded image ref
  const runAutoFit = useCallback(async () => {
    setAutoFitting(true);
    setAutoFitError(null);
    setAutoFitDone(false);

    try {
      const imgEl = faceImageRef.current;
      if (!imgEl) throw new Error("Face image not loaded in DOM yet.");

      // 1. Ensure face-api is loaded
      const faceapi = await loadFaceApi();

      // 2. Load neural net models if needed
      const MODEL_URL = 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model';
      if (!faceapi.nets.tinyFaceDetector.params) {
        await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
      }
      if (!faceapi.nets.faceLandmark68Net.params) {
        await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL);
      }

      // 3. Detect face landmarks
      const options = new faceapi.TinyFaceDetectorOptions({ scoreThreshold: 0.15, inputSize: 224 });
      const detection = await faceapi.detectSingleFace(imgEl, options).withFaceLandmarks();

      if (detection) {
        const landmarks = detection.landmarks;
        const leftEye = landmarks.getLeftEye();
        const rightEye = landmarks.getRightEye();

        // Calculate centers of each eye
        const getCenter = (points) => {
          let x = 0, y = 0;
          points.forEach(p => { x += p.x; y += p.y; });
          return { x: x / points.length, y: y / points.length };
        };

        const leftCenter = getCenter(leftEye);
        const rightCenter = getCenter(rightEye);

        // Reference natural dimensions of the image to keep percentage calculations accurate
        const imgW = imgEl.naturalWidth || imgEl.width;
        const imgH = imgEl.naturalHeight || imgEl.height;

        // Current rendered dimensions
        const rect = imgEl.getBoundingClientRect();
        const dispW = rect.width;
        const dispH = rect.height;

        // Conversion factor from display pixels to natural image pixels if coordinates are in display scale
        const scaleX = imgW / dispW;
        const scaleY = imgH / dispH;

        // Landmark positions are scale-relative to client dimensions by default if passed direct DOM element
        // Let's project them back to percentage coordinates of the image
        const midX = (leftCenter.x + rightCenter.x) / 2;
        const midY = (leftCenter.y + rightCenter.y) / 2;

        const pctX = (midX / dispW) * 100;
        const pctY = (midY / dispH) * 100;

        // Distance between eyes in display pixels
        const dx = (rightCenter.x - leftCenter.x);
        const dy = (rightCenter.y - leftCenter.y);
        const eyeDistance = Math.sqrt(dx * dx + dy * dy);

        // Angle tilt
        const angle = Math.atan2(dy, dx) * (180 / Math.PI);

        // We want the glasses width to be roughly 2.3 times eye distance.
        // In the CSS overlay: width: ${frameWidthPct * scale}%
        // Glasses width = dispW * (frameWidthPct/100) * scale
        // Therefore: scale = (eyeDistance * 2.3) / (dispW * 0.72)
        const baseGlassesWidth = dispW * 0.72;
        const calculatedScale = (eyeDistance * 2.3) / baseGlassesWidth;

        // Set state adjustments (percentage relative to center 50%)
        setPosX(Math.round(pctX - 50));
        setPosY(Math.round(pctY - 38)); // 38% is default center of eyes in portrait
        setScale(Math.max(0.6, Math.min(1.5, calculatedScale)));
        setRotation(Math.round(angle));
        setAutoFitDone(true);
      } else {
        throw new Error("No face found in this image. Try another photo or adjust manually.");
      }
    } catch (err) {
      console.warn("AI Auto-fit fail:", err);
      setAutoFitError(err.message || "Could not detect face landmarks.");
      // Fallback centering
      setPosX(0);
      setPosY(0);
      setScale(1.0);
      setRotation(0);
    } finally {
      setAutoFitting(false);
    }
  }, []);

  // Reset adjustments on face changes
  useEffect(() => {
    setAutoFitDone(false);
    setAutoFitError(null);
    setPosX(0); setPosY(0); setScale(1); setRotation(0);
  }, [faceImage, userUploadedImage]);

  const resetAll = () => {
    setPosX(0); setPosY(0); setScale(1); setRotation(0); setAutoFitDone(false); setAutoFitError(null);
  };

  // Get selected product image
  const getProductImgUrl = () => {
    if (!selectedProduct) return '';
    let img = selectedProduct.image_urls;
    if (Array.isArray(img)) img = img[0];
    else if (typeof img === 'string' && img.startsWith('[')) {
      try { img = JSON.parse(img)[0]; } catch (_) {}
    }
    return img;
  };

  // Download try-on image as canvas composition
  const downloadTryon = () => {
    const preview = previewRef.current;
    const imgEl = faceImageRef.current;
    if (!preview || !imgEl) return;

    const canvas = document.createElement('canvas');
    canvas.width = imgEl.naturalWidth || 800;
    canvas.height = imgEl.naturalHeight || 1000;
    const ctx = canvas.getContext('2d');

    const faceImg = new Image();
    faceImg.crossOrigin = 'anonymous';
    faceImg.src = currentFaceImg;
    faceImg.onload = () => {
      ctx.drawImage(faceImg, 0, 0, canvas.width, canvas.height);

      const glassesImg = new Image();
      glassesImg.crossOrigin = 'anonymous';

      const drawGlassesOnCanvas = () => {
        // Calculate coordinate relative to natural canvas resolution
        // default top eye line is 38% of canvas height
        const eyeYPct = 38 + posY;
        const eyeXPct = 50 + posX;

        const eyeX = (canvas.width * (eyeXPct / 100));
        const eyeY = (canvas.height * (eyeYPct / 100));

        const eyeW = canvas.width * 0.72 * scale;
        // Keep aspect ratio
        const eyeH = useProductFrame
          ? (eyeW * glassesImg.height) / glassesImg.width
          : (eyeW / 3);

        ctx.save();
        ctx.translate(eyeX, eyeY);
        ctx.rotate((rotation * Math.PI) / 180);

        if (useProductFrame) {
          ctx.globalCompositeOperation = 'multiply'; // removes the white background
        }
        ctx.drawImage(glassesImg, -eyeW/2, -eyeH/2, eyeW, eyeH);
        ctx.restore();

        const link = document.createElement('a');
        link.href = canvas.toDataURL('image/png');
        link.download = `lekya_specs_tryon_${useProductFrame ? selectedProduct.name.replace(/\s+/g,'_') : selectedFrame.id}.png`;
        link.click();
      };

      if (useProductFrame) {
        glassesImg.src = getProductImgUrl();
        glassesImg.onload = drawGlassesOnCanvas;
      } else {
        const svgBlob = new Blob([selectedFrame.svg(frameColor, lensOpacity)], { type: 'image/svg+xml' });
        const svgUrl = URL.createObjectURL(svgBlob);
        glassesImg.onload = () => {
          drawGlassesOnCanvas();
          URL.revokeObjectURL(svgUrl);
        };
        glassesImg.src = svgUrl;
      }
    };
  };

  // Compute values for preview rendering
  const svgDataUrl = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(selectedFrame.svg(frameColor, lensOpacity))}`;
  const eyeRegionTop = 38; // Default vertical positioning for front-facing portrait
  const frameWidthPct = 72; // Width relative to face container


  return (
    <>
      <Head>
        <title>Virtual Try-On Studio — Lekya Specs</title>
        <meta name="description" content="Virtually try on any eyewear frame in real-time. Upload your photo, choose frames, and find your perfect look." />
      </Head>

      <style>{`
        .tryon-container { background: linear-gradient(135deg, #0a0a0a 0%, #1a1410 100%); min-height: 100vh; }
        .glass-card { background: rgba(255,255,255,0.04); backdrop-filter: blur(20px); border: 1px solid rgba(197,160,40,0.15); border-radius: 20px; }
        .gold-btn { background: linear-gradient(135deg, #C5A028, #e8c547); color: #0a0a0a; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; font-size: 11px; padding: 14px 24px; border-radius: 12px; transition: all 0.3s; border: none; cursor: pointer; display: flex; align-items: center; gap: 8px; }
        .gold-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(197,160,40,0.4); }
        .ghost-btn { background: rgba(255,255,255,0.06); color: rgba(255,255,255,0.7); font-weight: 600; letter-spacing: 0.06em; text-transform: uppercase; font-size: 10px; padding: 10px 16px; border-radius: 10px; transition: all 0.3s; border: 1px solid rgba(255,255,255,0.1); cursor: pointer; }
        .ghost-btn:hover { background: rgba(197,160,40,0.15); border-color: rgba(197,160,40,0.4); color: #C5A028; }
        .face-model-btn { border-radius: 12px; overflow: hidden; border: 2px solid transparent; transition: all 0.3s; cursor: pointer; background: none; padding: 0; }
        .face-model-btn.active { border-color: #C5A028; box-shadow: 0 0 0 3px rgba(197,160,40,0.25); }
        .face-model-btn:hover { border-color: rgba(197,160,40,0.5); transform: scale(1.04); }
        .frame-option { border-radius: 12px; border: 2px solid rgba(255,255,255,0.08); padding: 12px; cursor: pointer; transition: all 0.3s; background: rgba(255,255,255,0.03); display: flex; align-items: center; gap: 10px; }
        .frame-option:hover { border-color: rgba(197,160,40,0.4); background: rgba(197,160,40,0.06); }
        .frame-option.active { border-color: #C5A028; background: rgba(197,160,40,0.1); }
        .color-dot { width: 24px; height: 24px; border-radius: 50%; border: 2px solid transparent; cursor: pointer; transition: all 0.2s; flex-shrink: 0; }
        .color-dot:hover { transform: scale(1.2); }
        .color-dot.active { border-color: white; box-shadow: 0 0 0 2px rgba(255,255,255,0.4); transform: scale(1.15); }
        .range-slider { -webkit-appearance: none; appearance: none; width: 100%; height: 4px; border-radius: 2px; background: rgba(255,255,255,0.1); outline: none; }
        .range-slider::-webkit-slider-thumb { -webkit-appearance: none; appearance: none; width: 18px; height: 18px; border-radius: 50%; background: #C5A028; cursor: pointer; box-shadow: 0 2px 8px rgba(197,160,40,0.5); }
        .preview-wrapper { position: relative; width: 100%; border-radius: 20px; overflow: hidden; background: #111; }
        .preview-face { width: 100%; display: block; object-fit: cover; object-position: top center; border-radius: 20px; }
        .glasses-overlay { position: absolute; left: 50%; transform: translateX(-50%); pointer-events: none; }
        .ai-badge { position: absolute; top: 14px; left: 14px; background: rgba(197,160,40,0.95); color: #0a0a0a; font-size: 9px; font-weight: 800; letter-spacing: 0.12em; text-transform: uppercase; padding: 6px 12px; border-radius: 100px; display: flex; align-items: center; gap: 5px; }
        .autofit-pulse { animation: pulse-gold 1.4s ease-in-out infinite; }
        @keyframes pulse-gold { 0%,100% { box-shadow: 0 0 0 0 rgba(197,160,40,0.6); } 50% { box-shadow: 0 0 0 10px rgba(197,160,40,0); } }
        .section-title { font-size: 11px; font-weight: 800; letter-spacing: 0.12em; text-transform: uppercase; color: rgba(197,160,40,0.8); margin-bottom: 12px; display: flex; align-items: center; gap-6; }
        .product-frame-row { display: flex; align-items: center; gap: 10px; padding: 10px; border-radius: 10px; border: 1px solid rgba(255,255,255,0.06); cursor: pointer; transition: all 0.2s; }
        .product-frame-row:hover { background: rgba(197,160,40,0.06); border-color: rgba(197,160,40,0.3); }
        .product-frame-row.active { background: rgba(197,160,40,0.1); border-color: #C5A028; }
      `}</style>

      <div className="tryon-container">
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '40px 24px' }}>

          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 36 }}>
            <Link href="/shop" style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
              <ArrowLeft style={{ width: 18, height: 18 }} />
            </Link>
            <div>
              <h1 style={{ fontFamily: 'Georgia, serif', fontSize: 32, fontWeight: 700, color: '#fff', margin: 0, letterSpacing: '0.02em' }}>
                Virtual Try-On Studio
              </h1>
              <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 13, margin: '4px 0 0' }}>
                AI-powered frame preview — no background bleed, instant placement
              </p>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 420px', gap: 28, alignItems: 'start' }}>

            {/* LEFT: Preview Canvas */}
            <div>
              <div className="glass-card" style={{ padding: 24 }}>

                {/* Preview */}
                <div className="preview-wrapper" ref={previewRef} style={{ aspectRatio: '4/5', maxHeight: 580, margin: '0 auto', maxWidth: 460 }}>
                  {/* Face Photo */}
                  <img
                    ref={faceImageRef}
                    id="tryon-face-image"
                    src={currentFaceImg}
                    alt="face model"
                    className="preview-face"
                    style={{ height: '100%', width: '100%', objectFit: 'cover', objectPosition: 'top center' }}
                    crossOrigin="anonymous"
                  />

                  {/* SVG or Catalog Product Glasses Overlay — transparent/multiplied! */}
                  <div
                    className="glasses-overlay"
                    style={{
                      top: `${eyeRegionTop + posY}%`,
                      left: `${50 + posX}%`,
                      width: `${frameWidthPct * scale}%`,
                      transform: `translate(-50%, -50%) rotate(${rotation}deg)`,
                      transition: autoFitting ? 'all 0.6s cubic-bezier(0.34,1.56,0.64,1)' : 'none',
                      filter: 'drop-shadow(0 4px 16px rgba(0,0,0,0.45))',
                    }}
                  >
                    <img
                      src={useProductFrame ? getProductImgUrl() : svgDataUrl}
                      alt="glasses frame"
                      style={{
                        width: '100%',
                        display: 'block',
                        mixBlendMode: useProductFrame ? 'multiply' : 'normal',
                        filter: useProductFrame ? 'contrast(1.06) saturate(1.06)' : 'none'
                      }}
                    />
                  </div>

                  {/* Status badge */}
                  <div className="ai-badge">
                    {autoFitting ? (
                      <><RefreshCw style={{ width: 9, height: 9, animation: 'spin 0.8s linear infinite' }} /> AI Detecting Eyes...</>
                    ) : autoFitDone ? (
                      <><Sparkles style={{ width: 9, height: 9 }} /> Auto-Aligned</>
                    ) : (
                      <><Eye style={{ width: 9, height: 9 }} /> Live View</>
                    )}
                  </div>
                </div>

                {/* Action buttons */}
                <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
                  <button
                    className={`gold-btn ${autoFitting ? 'autofit-pulse' : ''}`}
                    onClick={runAutoFit}
                    disabled={autoFitting}
                    style={{ flex: 1 }}
                  >
                    <Wand2 style={{ width: 15, height: 15 }} />
                    {autoFitting ? 'Detecting Eyes...' : 'AI Auto-Fit Eyes ✨'}
                  </button>
                  <button className="ghost-btn" onClick={resetAll}>
                    <RefreshCw style={{ width: 13, height: 13 }} />
                    Reset
                  </button>
                  <button className="ghost-btn" onClick={downloadTryon}>
                    <Download style={{ width: 13, height: 13 }} />
                    Save Try-On
                  </button>
                </div>

                {autoFitError && (
                  <div style={{ marginTop: 12, padding: '10px 14px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.25)', borderRadius: 10, color: '#f87171', fontSize: 11, textAlign: 'center' }}>
                    {autoFitError}
                  </div>
                )}

                {/* Fine-tune sliders */}
                <div style={{ marginTop: 24, padding: '20px', background: 'rgba(255,255,255,0.03)', borderRadius: 14, border: '1px solid rgba(255,255,255,0.06)' }}>
                  <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(197,160,40,0.7)', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Move style={{ width: 12, height: 12 }} /> Manual Fine-Tune Position
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'rgba(255,255,255,0.5)', fontWeight: 600, marginBottom: 6 }}>
                        <span>Frame Size</span>
                        <span style={{ color: '#C5A028', fontFamily: 'monospace' }}>{Math.round(scale * 100)}%</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <ZoomOut style={{ width: 12, height: 12, color: 'rgba(255,255,255,0.3)' }} />
                        <input type="range" className="range-slider" min="0.6" max="1.5" step="0.01" value={scale} onChange={e => setScale(parseFloat(e.target.value))} />
                        <ZoomIn style={{ width: 12, height: 12, color: 'rgba(255,255,255,0.3)' }} />
                      </div>
                    </div>

                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'rgba(255,255,255,0.5)', fontWeight: 600, marginBottom: 6 }}>
                        <span>Vertical Shift</span>
                        <span style={{ color: '#C5A028', fontFamily: 'monospace' }}>{posY > 0 ? '+' : ''}{posY}%</span>
                      </div>
                      <input type="range" className="range-slider" min="-30" max="30" step="1" value={posY} onChange={e => setPosY(parseInt(e.target.value))} />
                    </div>

                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'rgba(255,255,255,0.5)', fontWeight: 600, marginBottom: 6 }}>
                        <span>Horizontal Shift</span>
                        <span style={{ color: '#C5A028', fontFamily: 'monospace' }}>{posX > 0 ? '+' : ''}{posX}%</span>
                      </div>
                      <input type="range" className="range-slider" min="-30" max="30" step="1" value={posX} onChange={e => setPosX(parseInt(e.target.value))} />
                    </div>

                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'rgba(255,255,255,0.5)', fontWeight: 600, marginBottom: 6 }}>
                        <span>Tilt Angle</span>
                        <span style={{ color: '#C5A028', fontFamily: 'monospace' }}>{rotation}°</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <RotateCw style={{ width: 12, height: 12, color: 'rgba(255,255,255,0.3)', transform: 'scaleX(-1)' }} />
                        <input type="range" className="range-slider" min="-25" max="25" step="1" value={rotation} onChange={e => setRotation(parseInt(e.target.value))} />
                        <RotateCw style={{ width: 12, height: 12, color: 'rgba(255,255,255,0.3)' }} />
                      </div>
                    </div>

                    {!useProductFrame && (
                      <div style={{ gridColumn: '1 / -1' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'rgba(255,255,255,0.5)', fontWeight: 600, marginBottom: 6 }}>
                          <span>Lens Tint Darkness</span>
                          <span style={{ color: '#C5A028', fontFamily: 'monospace' }}>{Math.round(lensOpacity * 100)}%</span>
                        </div>
                        <input type="range" className="range-slider" min="0" max="0.85" step="0.01" value={lensOpacity} onChange={e => setLensOpacity(parseFloat(e.target.value))} />
                      </div>
                    )}
                  </div>
                </div>

              </div>
            </div>

            {/* RIGHT: Controls */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

              {/* 1. Choose Face */}
              <div className="glass-card" style={{ padding: 22 }}>
                <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(197,160,40,0.75)', marginBottom: 14 }}>
                  1. Choose Face Photo
                </div>

                {/* Upload */}
                <label style={{ display: 'block', border: '2px dashed rgba(197,160,40,0.25)', borderRadius: 14, padding: '16px 12px', textAlign: 'center', cursor: 'pointer', transition: 'all 0.3s', marginBottom: 14 }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(197,160,40,0.6)'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(197,160,40,0.25)'}
                >
                  <Upload style={{ width: 22, height: 22, color: '#C5A028', margin: '0 auto 6px' }} />
                  <div style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Upload My Photo</div>
                  <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)', marginTop: 2 }}>PNG, JPG — front-facing portrait</div>
                  <input type="file" accept="image/*" onChange={handlePhotoUpload} style={{ display: 'none' }} />
                </label>

                {/* Model grid */}
                <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700, textAlign: 'center', marginBottom: 10 }}>— Or choose a face model —</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
                  {MODEL_FACES.map(m => (
                    <button
                      key={m.id}
                      className={`face-model-btn ${(currentFaceImg === m.url && !userUploadedImage) ? 'active' : ''}`}
                      onClick={() => { setFaceImage(m.url); setUserUploadedImage(null); }}
                    >
                      <img src={m.url} alt={m.name} style={{ width: '100%', height: 72, objectFit: 'cover', objectPosition: 'top center', display: 'block' }} />
                      <div style={{ background: 'rgba(0,0,0,0.75)', color: 'white', fontSize: 8, fontWeight: 700, textAlign: 'center', padding: '3px 4px', letterSpacing: '0.06em' }}>
                        {m.name}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Mode Switcher */}
              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  className={!useProductFrame ? 'gold-btn' : 'ghost-btn'}
                  onClick={() => setUseProductFrame(false)}
                  style={{ flex: 1, padding: '12px 0', fontSize: 10, justifyContent: 'center' }}
                >
                  Custom Shapes
                </button>
                <button
                  className={useProductFrame ? 'gold-btn' : 'ghost-btn'}
                  onClick={() => setUseProductFrame(true)}
                  style={{ flex: 1, padding: '12px 0', fontSize: 10, justifyContent: 'center' }}
                >
                  Catalog Products
                </button>
              </div>

              {/* 2. Choose Frame Style / Catalog Select */}
              {!useProductFrame ? (
                <>
                  {/* SVG Frames list */}
                  <div className="glass-card" style={{ padding: 22 }}>
                    <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(197,160,40,0.75)', marginBottom: 14 }}>
                      2. Frame Style
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {SVG_FRAMES.map(frame => (
                        <button
                          key={frame.id}
                          className={`frame-option ${selectedFrame.id === frame.id ? 'active' : ''}`}
                          onClick={() => { setSelectedFrame(frame); setFrameColor(frame.color); }}
                        >
                          <img
                            src={`data:image/svg+xml;charset=utf-8,${encodeURIComponent(frame.svg(frame.color, 0.25))}`}
                            alt={frame.name}
                            style={{ width: 68, height: 24, objectFit: 'contain', flexShrink: 0 }}
                          />
                          <span style={{ fontSize: 12, fontWeight: 600, color: selectedFrame.id === frame.id ? '#C5A028' : 'rgba(255,255,255,0.65)' }}>
                            {frame.name}
                          </span>
                          {selectedFrame.id === frame.id && (
                            <Check style={{ width: 13, height: 13, color: '#C5A028', marginLeft: 'auto', flexShrink: 0 }} />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 3. Frame Color */}
                  <div className="glass-card" style={{ padding: 22 }}>
                    <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(197,160,40,0.75)', marginBottom: 14 }}>
                      3. Frame Color
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                      {FRAME_COLORS.map(c => (
                        <button
                          key={c.value}
                          className={`color-dot ${frameColor === c.value ? 'active' : ''}`}
                          style={{ background: c.value }}
                          title={c.name}
                          onClick={() => setFrameColor(c.value)}
                        />
                      ))}
                    </div>
                    <div style={{ marginTop: 10, fontSize: 10, color: 'rgba(255,255,255,0.35)' }}>
                      Selected: <span style={{ color: '#C5A028', fontWeight: 700 }}>{FRAME_COLORS.find(c => c.value === frameColor)?.name || 'Custom'}</span>
                    </div>
                  </div>
                </>
              ) : (
                /* Catalog Products List */
                <div className="glass-card" style={{ padding: 22 }}>
                  <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(197,160,40,0.75)', marginBottom: 6 }}>
                    2. Select Catalog Eyewear
                  </div>
                  <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', marginBottom: 12 }}>
                    Select a frame below to try it on instantly:
                  </div>

                  {loadingProducts ? (
                    <div style={{ textAlign: 'center', padding: '20px 0' }}>
                      <RefreshCw style={{ width: 20, height: 20, color: '#C5A028', animation: 'spin 1s linear infinite', margin: '0 auto' }} />
                    </div>
                  ) : products.length === 0 ? (
                    <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', textAlign: 'center', padding: '10px 0' }}>No products available.</div>
                  ) : (
                    <div style={{ maxHeight: 320, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 8, paddingRight: 4 }}>
                      {products.map(p => {
                        let img = p.image_urls;
                        if (Array.isArray(img)) img = img[0];
                        else if (typeof img === 'string' && img.startsWith('[')) { try { img = JSON.parse(img)[0]; } catch(_) {} }
                        const isSelected = selectedProduct && selectedProduct.id === p.id;
                        return (
                          <button
                            key={p.id}
                            className={`product-frame-row ${isSelected ? 'active' : ''}`}
                            onClick={() => setSelectedProduct(p)}
                            style={{ background: 'none', border: '1px solid rgba(255,255,255,0.06)', width: '100%', textAlign: 'left', display: 'flex', alignItems: 'center', gap: 10, padding: 10, borderRadius: 10, cursor: 'pointer' }}
                          >
                            <img src={img} alt={p.name} style={{ width: 44, height: 32, objectFit: 'contain', borderRadius: 6, background: 'rgba(255,255,255,0.06)', flexShrink: 0, padding: 4 }} />
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ fontSize: 11, fontWeight: 600, color: isSelected ? '#C5A028' : 'rgba(255,255,255,0.75)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</div>
                              <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{p.frame_shape} • {p.category}</div>
                            </div>
                            <div style={{ fontSize: 11, fontWeight: 700, color: '#C5A028', flexShrink: 0 }}>₹{parseFloat(p.price).toLocaleString('en-IN')}</div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* View product detail page if using catalog frame */}
              {useProductFrame && selectedProduct && (
                <div style={{ display: 'flex', gap: 10 }}>
                  <Link
                    href={`/product/${selectedProduct.id}`}
                    style={{ flex: 1, textDecoration: 'none', textAlign: 'center' }}
                    className="gold-btn"
                  >
                    View Product Details
                  </Link>
                </div>
              )}

            </div>
          </div>
        </div>
      </div>
    </>
  );
}
