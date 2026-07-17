const React = require('react');
const { useState, useEffect, useRef } = React;
const Link = require('next/link').default;
const { useAuth } = require('./_app');
const { Camera, Upload, RefreshCw, Sparkles, Check, Info, ShieldCheck, HelpCircle, Star } = require('lucide-react');
const API_BASE = typeof window !== 'undefined'
  ? (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' ? 'http://localhost:5000' : '')
  : '';

export default function FaceShapeSuggestion() {
  const { user, token, updateProfileFaceShape } = useAuth();
  
  // Media capture states
  const [stream, setStream] = useState(null);
  const [imageSrc, setImageSrc] = useState(null);
  const [activeMode, setActiveMode] = useState('camera'); // 'camera' or 'upload'
  const [cameraError, setCameraError] = useState('');

  // Calibration states
  const [step, setStep] = useState(1); // 1: Capture, 2: Calibrate, 3: Result
  const [detectedShape, setDetectedShape] = useState('');
  const [recommendedFrames, setRecommendedFrames] = useState([]);
  const [savingResult, setSavingResult] = useState(false);
  const [autoDetecting, setAutoDetecting] = useState(false);
  const [detectionMessage, setDetectionMessage] = useState('');

  // Video and Canvas Refs
  const videoRef = useRef(null);
  const canvasRef = useRef(null);


  // VERIFIED DEFAULT PIN POSITIONS (produces OVAL by default)
  // Math check:
  //   foreheadWidth = 285-115 = 170
  //   cheekboneWidth = 290-110 = 180
  //   jawWidth       = 280-120 = 160
  //   faceHeight     = 360-90  = 270
  //   hwRatio        = 270/180 = 1.50  → oval range (1.15-1.55) ✓
  //   cheekVsForehead= 180/170 = 1.06  → NOT diamond (<1.15) ✓
  //   cheekVsJaw     = 180/160 = 1.125 → NOT diamond (<1.15) ✓
  const [points, setPoints] = useState({
    foreheadLeft:  { x: 115, y: 90  },
    foreheadRight: { x: 285, y: 90  },
    cheekLeft:     { x: 110, y: 200 },
    cheekRight:    { x: 290, y: 200 },
    jawLeft:       { x: 120, y: 295 },
    jawRight:      { x: 280, y: 295 },
    chin:          { x: 200, y: 360 }
  });

  const [activePoint, setActivePoint] = useState(null);

  // Start webcam stream
  const startCamera = async () => {
    setCameraError('');
    try {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { width: 400, height: 400, facingMode: 'user' },
        audio: false
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.error(err);
      setCameraError('Webcam access was denied or is unavailable. Please upload a photo instead.');
      setActiveMode('upload');
    }
  };

  // Lifecycle webcam
  useEffect(() => {
    if (activeMode === 'camera' && step === 1) {
      startCamera();
    }
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [activeMode, step]);

  // ─── REAL AI FACE DETECTION via face-api.js (jsDelivr CDN) ───────────────
  const MODEL_URL = 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model';

  const loadFaceApi = () => new Promise((resolve, reject) => {
    if (window.faceapi) { resolve(window.faceapi); return; }
    const s = document.createElement('script');
    s.src = 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api/dist/face-api.js';
    s.onload = () => resolve(window.faceapi);
    s.onerror = reject;
    document.head.appendChild(s);
  });

  const autoDetectFaceLandmarks = async (imageDataUrl) => {
    setAutoDetecting(true);
    setDetectionMessage('Loading AI neural network...');
    setStep(2);
    try {
      const faceapi = await loadFaceApi();
      setDetectionMessage('Initializing FaceNet landmark model...');
      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
        faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
      ]);
      setDetectionMessage('Scanning facial geometry...');

      const img = new window.Image();
      img.crossOrigin = 'anonymous';
      img.src = imageDataUrl;
      await new Promise((res, rej) => { img.onload = res; img.onerror = rej; });

      const detection = await faceapi
        .detectSingleFace(img, new faceapi.TinyFaceDetectorOptions({ scoreThreshold: 0.25 }))
        .withFaceLandmarks();

      if (!detection) {
        setDetectionMessage('⚠ No face detected — please align pins manually.');
        setAutoDetecting(false);
        return;
      }

      setDetectionMessage('Mapping 68 landmark coordinates...');
      const lm  = detection.landmarks.positions;
      const iW  = img.naturalWidth  || 400;
      const iH  = img.naturalHeight || 400;
      const sx  = (p) => Math.round((p.x / iW) * 400);
      const sy  = (p) => Math.round((p.y / iH) * 400);
      const clamp = (v) => Math.max(10, Math.min(390, v));

      // 68-pt map: 0-16 jawline, 17-21 L-brow, 22-26 R-brow, 8 chin
      // Forehead = estimate above eyebrow midpoints by 35% of brow-to-chin height
      const lBrowPeak = lm[19];  // left brow peak
      const rBrowPeak = lm[24];  // right brow peak
      const chinPt    = lm[8];
      const fhOffset  = Math.abs((chinPt.y - lBrowPeak.y) / iH * 400) * 0.35;

      const newPts = {
        foreheadLeft:  { x: clamp(sx(lm[17])),   y: clamp(Math.round(sy(lBrowPeak) - fhOffset)) },
        foreheadRight: { x: clamp(sx(lm[26])),   y: clamp(Math.round(sy(rBrowPeak) - fhOffset)) },
        cheekLeft:     { x: clamp(sx(lm[2])),    y: clamp(sy(lm[2]))  },
        cheekRight:    { x: clamp(sx(lm[14])),   y: clamp(sy(lm[14])) },
        jawLeft:       { x: clamp(sx(lm[5])),    y: clamp(sy(lm[5]))  },
        jawRight:      { x: clamp(sx(lm[11])),   y: clamp(sy(lm[11])) },
        chin:          { x: clamp(sx(chinPt)),   y: clamp(sy(chinPt)) },
      };

      setPoints(newPts);
      setDetectionMessage('✓ Face auto-mapped! Fine-tune pins if needed.');
      setTimeout(() => setDetectionMessage(''), 4000);
    } catch (err) {
      console.error('face-api error:', err);
      setDetectionMessage('Detection failed — align pins manually.');
    } finally {
      setAutoDetecting(false);
    }
  };
  // ──────────────────────────────────────────────────────────────────────────

  // Capture photo from video stream
  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0, 400, 400);
      const dataUrl = canvas.toDataURL('image/jpeg');
      setImageSrc(dataUrl);
      if (stream) { stream.getTracks().forEach(t => t.stop()); setStream(null); }
      // Kick off real AI landmark detection
      autoDetectFaceLandmarks(dataUrl);
    }
  };

  // Handle image upload
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target.result;
        setImageSrc(dataUrl);
        // Kick off real AI landmark detection
        autoDetectFaceLandmarks(dataUrl);
      };
      reader.readAsDataURL(file);
    }
  };

  // Mouse / Touch handlers for dragging calibration pins
  const handlePinMouseDown = (pointName) => {
    setActivePoint(pointName);
  };

  const handleContainerMouseMove = (e) => {
    if (!activePoint) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    
    // Support touch coordinates for mobile screens
    let clientX = e.clientX;
    let clientY = e.clientY;
    
    if (e.touches && e.touches.length > 0) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else if (e.changedTouches && e.changedTouches.length > 0) {
      clientX = e.changedTouches[0].clientX;
      clientY = e.changedTouches[0].clientY;
    } else if (e.nativeEvent && e.nativeEvent.touches && e.nativeEvent.touches.length > 0) {
      clientX = e.nativeEvent.touches[0].clientX;
      clientY = e.nativeEvent.touches[0].clientY;
    }

    // Fallback check if coordinates are still undefined
    if (clientX === undefined || clientY === undefined) return;
    
    let x = clientX - rect.left;
    let y = clientY - rect.top;

    // Scale coordinate if display box is responsive
    const displayWidth = rect.width;
    const displayHeight = rect.height;
    x = (x / displayWidth) * 400;
    y = (y / displayHeight) * 400;

    // Constrain boundaries
    x = Math.max(10, Math.min(390, x));
    y = Math.max(10, Math.min(390, y));

    setPoints(prev => ({
      ...prev,
      [activePoint]: { x: Math.round(x), y: Math.round(y) }
    }));
  };

  const handleContainerMouseUp = () => {
    setActivePoint(null);
  };

  // ============================================================
  // REALISTIC FACE SHAPE CLASSIFICATION (Fixed Algorithm)
  // Based on anthropometric ratio research
  // ============================================================
  const analyzeFaceShape = () => {
    // 1. Calculate all key width measurements (in pixels)
    const foreheadWidth  = Math.abs(points.foreheadRight.x - points.foreheadLeft.x);
    const cheekboneWidth = Math.abs(points.cheekRight.x   - points.cheekLeft.x);
    const jawWidth       = Math.abs(points.jawRight.x     - points.jawLeft.x);

    // 2. Face height: top of forehead to chin
    const foreheadY  = (points.foreheadLeft.y + points.foreheadRight.y) / 2;
    const faceHeight = Math.abs(points.chin.y - foreheadY);

    // 3. Key derived ratios
    // hwRatio > 1.5 = very long/oblong, 1.2-1.5 = oval, 0.9-1.2 = round/square
    const hwRatio          = faceHeight / cheekboneWidth;
    // How much wider forehead is vs jaw (positive = heart/round, negative = pear)
    const foreheadJawRatio = foreheadWidth / jawWidth;
    // How dominant cheekbones are vs forehead and jaw
    const cheekVsForehead  = cheekboneWidth / foreheadWidth;
    const cheekVsJaw       = cheekboneWidth / jawWidth;

    let shape = 'oval'; // default safe fallback

    // --- CLASSIFICATION RULES (priority ordered) ---

    // OBLONG/LONG: Very tall face relative to width
    if (hwRatio > 1.55) {
      shape = 'oblong';
    }
    // DIAMOND: Cheekbones clearly wider than BOTH forehead AND jaw by 15%+
    else if (cheekVsForehead > 1.15 && cheekVsJaw > 1.15) {
      shape = 'diamond';
    }
    // HEART: Forehead notably wider than jaw (forehead > jaw by 30%+), moderate height
    else if (foreheadJawRatio > 1.30 && hwRatio < 1.55) {
      shape = 'heart';
    }
    // SQUARE: Height and widest width are similar, jaw is almost as wide as cheeks
    else if (hwRatio < 1.05 && cheekVsJaw < 1.10) {
      shape = 'square';
    }
    // ROUND: Height and width are similar but jaw is narrower (softer jawline)
    else if (hwRatio < 1.15 && cheekVsJaw >= 1.10) {
      shape = 'round';
    }
    // OVAL: Height 20-55% more than width, balanced features
    else if (hwRatio >= 1.15 && hwRatio <= 1.55) {
      shape = 'oval';
    }

    setDetectedShape(shape);
    setStep(3);

    // Fetch matched recommendations
    const fetchShape = shape === 'oblong' ? 'oval' : shape; // map oblong -> oval for API
    fetch(`${API_BASE}/api/products/recommendations/${fetchShape}`)
      .then(res => res.json())
      .then(data => {
        setRecommendedFrames(data.products || []);
      })
      .catch(err => console.error(err));

    // Save to user profile
    if (token) {
      setSavingResult(true);
      fetch(`${API_BASE}/api/auth/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ face_shape: shape })
      })
        .then(res => res.json())
        .then(data => {
          updateProfileFaceShape(shape);
          setSavingResult(false);
        })
        .catch(err => {
          console.error(err);
          setSavingResult(false);
        });
    }
  };

  const getShapeDescription = (shape) => {
    switch (shape) {
      case 'round':
        return 'Round faces feature soft curves and smooth lines, with similar height and width. Contrast these soft features with angular frame shapes — Square, Rectangular, or Geometric frames add sharp definition and make your face look more elongated.';
      case 'oval':
        return 'Oval faces are the most versatile — balanced proportions with face height slightly greater than width and a softly curved jawline. Almost any frame style works beautifully. Try Rectangular wayfarers, Aviators, or classic Rounds for a timeless look.';
      case 'square':
        return 'Square faces display strong jawlines and broad foreheads with similar width and height. Soften these sharp angles with Round, Oval, or teardrop Aviator frames. Thin rimless frames also work wonderfully to lighten strong features.';
      case 'heart':
        return 'Heart-shaped faces feature a broad forehead that tapers down to a narrow, pointed chin. Balance your proportions with bottom-heavy frames like Cat-Eye, Round, or Light Aviators that draw attention downward.';
      case 'diamond':
        return 'Diamond faces have dramatic, wide cheekbones with narrow foreheads and jawlines. Oval and rimless round frames beautifully soften your facial angles. Cat-Eye frames also complement your widest cheekbones elegantly.';
      case 'oblong':
        return 'Oblong (long) faces are noticeably taller than wide, with a straight cheek line. Choose frames with width and depth to add visual width — Oversized Round frames, Wide Square frames, and Decorative temples all help balance your proportions.';
      default:
        return 'Your unique facial structure has been analyzed. Browse our curated recommendations below — each frame has been handpicked to complement your natural features.';
    }
  };

  return (
    <div className="bg-premium-light min-h-screen py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Title */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-1.5 bg-premium-accent/15 border border-premium-accent/40 text-premium-golddark px-3 py-1 rounded text-xs font-bold uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5" /> Smart Frame Analyzer
          </div>
          <h1 className="font-serif text-3xl sm:text-5xl font-bold tracking-tight text-premium-black mb-2">
            Find Your Perfect Fit
          </h1>
          <p className="text-sm text-premium-gray font-light max-w-lg mx-auto">
            Analyze your face structure in real-time. We calculate your cosmetic boundaries locally in the browser to maintain absolute privacy.
          </p>
        </div>

        {/* --- STEP 1: CAPTURE AND CAPABILITY MODES --- */}
        {step === 1 && (
          <div className="bg-white border border-premium-border rounded p-6 sm:p-10 shadow-sm flex flex-col items-center">
            
            {/* View finder window */}
            <div className="relative w-80 h-80 sm:w-[400px] sm:h-[400px] bg-premium-black rounded overflow-hidden mb-8 border border-premium-accent/30 shadow-inner flex items-center justify-center">
              
              {activeMode === 'camera' ? (
                <>
                  <video 
                    ref={videoRef}
                    autoPlay 
                    playsInline 
                    className="w-full h-full object-cover transform -scale-x-100"
                  />
                  {/* Scanner alignment guidelines */}
                  <div className="absolute inset-0 border-[20px] border-black/40 pointer-events-none"></div>
                  <div className="absolute w-[60%] h-[75%] border-2 border-dashed border-premium-accent/50 rounded-[100px] top-[12.5%] left-[20%] pointer-events-none flex items-center justify-center">
                    <span className="text-[10px] text-premium-accent/70 uppercase tracking-widest font-bold bg-black/40 px-2 py-0.5 rounded">Align Face</span>
                  </div>
                  <div className="absolute w-full h-0.5 bg-premium-accent/30 top-1/2 animate-pulse-subtle pointer-events-none"></div>
                </>
              ) : (
                <div className="text-center p-8">
                  <Upload className="w-12 h-12 text-premium-accent mx-auto mb-4 animate-bounce" />
                  <p className="text-sm font-semibold text-white mb-2">Upload Selfie Photo</p>
                  <p className="text-xs text-gray-400 max-w-[200px] mx-auto">Choose a clear front-facing portrait image with neutral lighting.</p>
                </div>
              )}

              {/* Offline error handler */}
              {cameraError && activeMode === 'camera' && (
                <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center p-6 text-center">
                  <p className="text-xs text-red-500 font-semibold mb-4">{cameraError}</p>
                </div>
              )}
            </div>

            {/* Toggle Modes */}
            <div className="flex gap-4 mb-6">
              <button
                onClick={() => { setActiveMode('camera'); }}
                className={`flex items-center gap-1.5 px-4 py-2 border rounded text-xs uppercase tracking-wider font-semibold transition-all ${
                  activeMode === 'camera' ? 'border-premium-accent bg-premium-accent/10 text-premium-golddark' : 'border-premium-border text-premium-dark hover:border-premium-accent'
                }`}
              >
                <Camera className="w-4 h-4" /> Live Camera
              </button>
              <button
                onClick={() => { setActiveMode('upload'); }}
                className={`flex items-center gap-1.5 px-4 py-2 border rounded text-xs uppercase tracking-wider font-semibold transition-all ${
                  activeMode === 'upload' ? 'border-premium-accent bg-premium-accent/10 text-premium-golddark' : 'border-premium-border text-premium-dark hover:border-premium-accent'
                }`}
              >
                <Upload className="w-4 h-4" /> Upload Image
              </button>
            </div>

            {/* Capture Triggers */}
            {activeMode === 'camera' ? (
              <button
                onClick={capturePhoto}
                disabled={cameraError !== ''}
                className="bg-premium-black text-white hover:bg-premium-accent hover:text-premium-black font-semibold text-xs tracking-widest uppercase py-4 px-10 rounded transition-all shadow-md flex items-center gap-2 disabled:opacity-50"
              >
                <Camera className="w-4 h-4" /> Capture Selfie
              </button>
            ) : (
              <label className="bg-premium-black text-white hover:bg-premium-accent hover:text-premium-black font-semibold text-xs tracking-widest uppercase py-4 px-10 rounded transition-all shadow-md flex items-center gap-2 cursor-pointer">
                <Upload className="w-4 h-4" /> Choose File
                <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
              </label>
            )}

            {/* Hidden canvas helper */}
            <canvas ref={canvasRef} width="400" height="400" className="hidden" />

          </div>
        )}

        {/* --- STEP 2: FACE MESH CALIBRATION --- */}
        {step === 2 && imageSrc && (
          <div className="bg-white border border-premium-border rounded p-6 sm:p-10 shadow-sm flex flex-col items-center">
            
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-premium-black mb-2 text-center">
              Align Pins to Your Face
            </h2>
            <p className="text-xs text-premium-gray font-light mb-4 text-center max-w-md">
              Drag each glowing pin onto your face photo. The more accurate your placement, the more precise your face shape result.
            </p>

            {/* Pin Guide Legend */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-6 w-full max-w-md text-center">
              {[
                { label: 'Forehead', color: 'bg-blue-400', emoji: '⬆️', desc: 'Top sides of forehead' },
                { label: 'Cheekbones', color: 'bg-green-400', emoji: '↔️', desc: 'Widest part of cheeks' },
                { label: 'Jawline', color: 'bg-orange-400', emoji: '⬇️', desc: 'Jaw corner angles' },
                { label: 'Chin', color: 'bg-pink-400', emoji: '📍', desc: 'Bottom tip of chin' },
              ].map(g => (
                <div key={g.label} className="bg-premium-light border border-premium-border rounded p-2">
                  <div className="text-base mb-1">{g.emoji}</div>
                  <p className="text-[10px] font-bold text-premium-black">{g.label}</p>
                  <p className="text-[9px] text-premium-gray">{g.desc}</p>
                </div>
              ))}
            </div>

            {/* Interactive Image Container */}
            <div 
              onMouseMove={handleContainerMouseMove}
              onMouseUp={handleContainerMouseUp}
              onMouseLeave={handleContainerMouseUp}
              onTouchMove={handleContainerMouseMove}
              onTouchEnd={handleContainerMouseUp}
              className="relative w-80 h-80 sm:w-[400px] sm:h-[400px] bg-premium-black rounded overflow-hidden select-none cursor-crosshair border border-premium-accent/30 shadow mb-3"
            >
              {/* Captured Photo */}
              <img src={imageSrc} alt="selfie" className="w-full h-full object-cover pointer-events-none" />

              {/* ─── AI DETECTION OVERLAY ─── */}
              {autoDetecting && (
                <div className="absolute inset-0 bg-black/75 flex flex-col items-center justify-center z-20 gap-4">
                  {/* Scanning animation */}
                  <div className="relative w-16 h-16">
                    <div className="absolute inset-0 border-4 border-premium-accent/30 rounded-full" />
                    <div className="absolute inset-0 border-4 border-t-premium-accent rounded-full animate-spin" />
                    <svg className="absolute inset-0 w-full h-full p-3 text-premium-accent" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2V9M9 21H5a2 2 0 01-2-2V9m0 0h18" />
                    </svg>
                  </div>
                  <p className="text-premium-accent text-xs font-bold tracking-widest uppercase text-center px-4">{detectionMessage}</p>
                  {/* Scanning line sweep */}
                  <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-premium-accent to-transparent animate-[scan_2s_linear_infinite]"
                      style={{animation: 'scan 2s linear infinite'}} />
                  </div>
                </div>
              )}

              {/* Connecting Holographic Grid Lines */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none">
                {/* Forehead */}
                <line x1={`${(points.foreheadLeft.x / 400) * 100}%`} y1={`${(points.foreheadLeft.y / 400) * 100}%`} x2={`${(points.foreheadRight.x / 400) * 100}%`} y2={`${(points.foreheadRight.y / 400) * 100}%`} stroke="#c5a880" strokeWidth="1.5" strokeDasharray="3" />
                {/* Cheekbones */}
                <line x1={`${(points.cheekLeft.x / 400) * 100}%`} y1={`${(points.cheekLeft.y / 400) * 100}%`} x2={`${(points.cheekRight.x / 400) * 100}%`} y2={`${(points.cheekRight.y / 400) * 100}%`} stroke="#c5a880" strokeWidth="1.5" strokeDasharray="3" />
                {/* Jawline */}
                <line x1={`${(points.jawLeft.x / 400) * 100}%`} y1={`${(points.jawLeft.y / 400) * 100}%`} x2={`${(points.jawRight.x / 400) * 100}%`} y2={`${(points.jawRight.y / 400) * 100}%`} stroke="#c5a880" strokeWidth="1.5" strokeDasharray="3" />
                {/* Center line (Face Height) */}
                <line x1="50%" y1={`${(((points.foreheadLeft.y + points.foreheadRight.y) / 2) / 400) * 100}%`} x2="50%" y2={`${(points.chin.y / 400) * 100}%`} stroke="#c5a880" strokeWidth="1.5" strokeDasharray="3" />
              </svg>

              {/* Draggable Pins */}
              {Object.keys(points).map(pointKey => {
                const pt = points[pointKey];
                const pinColors = {
                  foreheadLeft: 'bg-blue-400', foreheadRight: 'bg-blue-400',
                  cheekLeft: 'bg-green-400', cheekRight: 'bg-green-400',
                  jawLeft: 'bg-orange-400', jawRight: 'bg-orange-400',
                  chin: 'bg-pink-400',
                };
                const pinLabels = {
                  foreheadLeft: 'FH-L', foreheadRight: 'FH-R',
                  cheekLeft: 'CK-L', cheekRight: 'CK-R',
                  jawLeft: 'JW-L', jawRight: 'JW-R',
                  chin: 'CHN',
                };
                return (
                  <div
                    key={pointKey}
                    onMouseDown={() => handlePinMouseDown(pointKey)}
                    onTouchStart={(e) => { e.preventDefault(); handlePinMouseDown(pointKey); }}
                    style={{
                      left: `calc(${(pt.x / 400) * 100}% - 10px)`,
                      top: `calc(${(pt.y / 400) * 100}% - 10px)`
                    }}
                    className={`absolute w-5 h-5 rounded-full border-2 border-white shadow-lg cursor-pointer transition-all flex items-center justify-center z-10 ${
                      activePoint === pointKey 
                        ? 'scale-150 ring-4 ring-white/50 bg-premium-accent' 
                        : `${pinColors[pointKey]} hover:scale-125`
                    }`}
                    title={pointKey}
                  >
                    <span className="w-2 h-2 rounded-full bg-white shadow"></span>
                    {/* Label tooltip */}
                    <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-[8px] font-bold text-white bg-black/60 px-1 rounded whitespace-nowrap opacity-0 hover:opacity-100 transition-opacity pointer-events-none">
                      {pinLabels[pointKey]}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* AI Detection Status Toast */}
            {detectionMessage && (
              <div className={`w-full max-w-md mb-3 px-4 py-2.5 rounded border text-xs font-semibold flex items-center gap-2 ${
                detectionMessage.startsWith('✓')
                  ? 'bg-green-50 border-green-300 text-green-700'
                  : detectionMessage.startsWith('⚠') || detectionMessage.includes('failed')
                  ? 'bg-amber-50 border-amber-300 text-amber-700'
                  : 'bg-premium-light border-premium-border text-premium-accent animate-pulse'
              }`}>
                <span>{detectionMessage.startsWith('✓') ? '✓' : detectionMessage.startsWith('⚠') ? '⚠' : '⏳'}</span>
                <span>{detectionMessage}</span>
              </div>
            )}

            {/* Live Measurement Readout */}
            <div className="w-full max-w-md mb-5 bg-premium-light border border-premium-border rounded p-3">
              <p className="text-[10px] font-bold uppercase tracking-wider text-premium-gray mb-2">Live Measurements</p>
              <div className="grid grid-cols-4 gap-2 text-center">
                {[
                  { label: 'Forehead', val: Math.abs(points.foreheadRight.x - points.foreheadLeft.x) },
                  { label: 'Cheeks', val: Math.abs(points.cheekRight.x - points.cheekLeft.x) },
                  { label: 'Jaw', val: Math.abs(points.jawRight.x - points.jawLeft.x) },
                  { label: 'Height', val: Math.abs(points.chin.y - (points.foreheadLeft.y + points.foreheadRight.y) / 2) },
                ].map(m => (
                  <div key={m.label}>
                    <p className="text-[9px] text-premium-gray">{m.label}</p>
                    <p className="text-xs font-bold text-premium-black">{m.val}px</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={analyzeFaceShape}
                className="bg-premium-black text-white hover:bg-premium-accent hover:text-premium-black font-semibold text-xs tracking-widest uppercase py-4 px-8 rounded transition-all shadow-md flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4" /> Analyze Face Shape
              </button>
              <button
                onClick={() => setPoints({
                  foreheadLeft:  { x: 115, y: 90  },
                  foreheadRight: { x: 285, y: 90  },
                  cheekLeft:     { x: 110, y: 200 },
                  cheekRight:    { x: 290, y: 200 },
                  jawLeft:       { x: 120, y: 295 },
                  jawRight:      { x: 280, y: 295 },
                  chin:          { x: 200, y: 360 }
                })}
                className="border border-premium-border hover:border-premium-accent text-premium-dark hover:text-premium-accent font-semibold text-xs tracking-widest uppercase py-4 px-5 rounded transition-all"
              >
                ↺ Reset Pins
              </button>
              <button
                onClick={() => { setStep(1); }}
                className="border border-premium-border hover:bg-gray-50 text-premium-dark font-semibold text-xs tracking-widest uppercase py-4 px-5 rounded transition-all"
              >
                Retake Photo
              </button>
            </div>

          </div>
        )}

        {/* --- STEP 3: RESULTS AND SUGGESTIONS CATALOG --- */}
        {step === 3 && (
          <div className="space-y-12">
            
            {/* Classification Analysis Card */}
            <div className="bg-white border border-premium-border rounded p-6 sm:p-10 shadow-sm grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
              
              {/* Photo representation */}
              <div className="relative w-64 h-64 mx-auto md:w-full md:h-64 bg-premium-light border rounded overflow-hidden shadow-inner">
                <img src={imageSrc} alt="selfie result" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-premium-accent/10 flex items-center justify-center">
                  <Check className="w-12 h-12 text-premium-accent filter drop-shadow bg-black/20 p-2.5 rounded-full" />
                </div>
              </div>

              {/* Results Text */}
              <div className="md:col-span-2 space-y-4">
                <span className="text-[10px] uppercase font-bold text-premium-accent tracking-widest">Scanner Report</span>
                <h2 className="font-serif text-3xl font-bold text-premium-black">
                  Face Shape: <span className="text-premium-accent uppercase tracking-wide">{detectedShape}</span>
                </h2>
                
                <p className="text-sm text-premium-gray leading-relaxed font-light">
                  {getShapeDescription(detectedShape)}
                </p>

                {savingResult && (
                  <p className="text-xs text-premium-accent font-semibold animate-pulse">Syncing face profile with database...</p>
                )}

                <div className="flex gap-4 pt-4 border-t border-premium-border">
                  <button
                    onClick={() => { setStep(1); }}
                    className="border border-premium-border hover:bg-gray-50 text-premium-dark font-semibold text-xs tracking-widest uppercase py-3 px-6 rounded transition-all"
                  >
                    Scan Again
                  </button>
                  <Link href={`/shop?face_shape=${detectedShape}`} className="bg-premium-black text-white hover:bg-premium-accent hover:text-premium-black font-semibold text-xs tracking-widest uppercase py-3 px-6 rounded transition-all text-center">
                    Explore recommendations
                  </Link>
                </div>
              </div>

            </div>

            {/* Recommendations Catalog Carousels */}
            <div>
              <div className="flex flex-col sm:flex-row items-center justify-between mb-8 gap-2">
                <div>
                  <h3 className="font-serif text-2xl font-bold text-premium-black">Recommended for You</h3>
                  <p className="text-xs text-premium-gray font-light">Specially curated frames matching your {detectedShape} face shape</p>
                </div>
                <span className="text-xs uppercase tracking-wider bg-premium-accent/20 text-premium-golddark px-3 py-1 rounded font-bold">
                  Matches Face Shape
                </span>
              </div>

              {recommendedFrames.length === 0 ? (
                <p className="text-center py-10 bg-white border border-premium-border rounded text-premium-gray">No matched frames in stock currently.</p>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                  {recommendedFrames.map(product => (
                    <Link 
                      key={product.id} 
                      href={`/product/${product.id}`}
                      className="group bg-white border border-premium-border rounded p-4 shadow-sm hover:shadow-md hover:border-premium-accent/50 transition-all flex flex-col"
                    >
                      <div className="relative overflow-hidden bg-premium-light rounded mb-4 aspect-square flex items-center justify-center hover-zoom">
                        <img 
                          src={product.image_urls[0]} 
                          alt={product.name} 
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="text-[10px] uppercase tracking-wider text-premium-accent font-semibold mb-1">
                        {product.gender} • {product.category}
                      </div>
                      <h3 className="font-serif text-base font-bold text-premium-black truncate group-hover:text-premium-accent transition-colors">
                        {product.name}
                      </h3>
                      <div className="flex items-center gap-1 mt-1 mb-2 text-xs text-amber-500">
                        <Star className="w-3.5 h-3.5 fill-current" />
                        <span className="font-medium text-premium-dark">{parseFloat(product.average_rating || 0).toFixed(1)}</span>
                        <span className="text-gray-400">({product.review_count})</span>
                      </div>
                      <div className="font-semibold text-premium-black mt-auto text-lg">
                        ₹{parseFloat(product.price).toLocaleString('en-IN')}
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

          </div>
        )}

        {/* Trust shield */}
        <div className="mt-12 flex items-center justify-center gap-2 text-xs text-premium-gray font-medium">
          <ShieldCheck className="w-4 h-4 text-premium-accent" />
          Webcam stream is processed entirely client-side. No photo is stored or sent to any server.
        </div>

      </div>
    </div>
  );
}
