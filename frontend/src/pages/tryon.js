const React = require('react');
const { useState, useEffect, useRef, useCallback } = React;
const Link = require('next/link').default;
const Head = require('next/head').default;
const {
  Upload, RefreshCw, ArrowLeft, Download, Check, Wand2, Eye, ZoomIn, ZoomOut,
  Move, RotateCw, Sparkles, Camera, FlipHorizontal, SplitSquareHorizontal,
  Sliders, X, Play, Pause, Image: ImageIcon, ShoppingBag
} = require('lucide-react');



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

// Premium SVG Frames — fully transparent lenses, realistic frame designs
const SVG_FRAMES = [
  {
    id: 'wayfarer', name: 'Classic Wayfarer', color: '#1a1a1a',
    svg: (color, opacity) => `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 110" fill="none">
        <defs>
          <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="2" stdDeviation="3" flood-color="rgba(0,0,0,0.4)"/>
          </filter>
        </defs>
        <rect x="8" y="12" width="128" height="72" rx="10" ry="10" stroke="${color}" stroke-width="5.5" fill="rgba(80,100,120,${opacity})" filter="url(#shadow)"/>
        <rect x="184" y="12" width="128" height="72" rx="10" ry="10" stroke="${color}" stroke-width="5.5" fill="rgba(80,100,120,${opacity})" filter="url(#shadow)"/>
        <path d="M136 38 Q160 26 184 38" stroke="${color}" stroke-width="5" fill="none" stroke-linecap="round"/>
        <rect x="8" y="12" width="128" height="72" rx="10" ry="10" stroke="rgba(255,255,255,0.08)" stroke-width="1.5" fill="none"/>
        <rect x="184" y="12" width="128" height="72" rx="10" ry="10" stroke="rgba(255,255,255,0.08)" stroke-width="1.5" fill="none"/>
        <line x1="0" y1="32" x2="8" y2="38" stroke="${color}" stroke-width="4.5" stroke-linecap="round"/>
        <line x1="320" y1="32" x2="312" y2="38" stroke="${color}" stroke-width="4.5" stroke-linecap="round"/>
      </svg>
    `,
  },
  {
    id: 'round', name: 'Round Frames', color: '#8B6914',
    svg: (color, opacity) => `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 110" fill="none">
        <defs><filter id="shadow2"><feDropShadow dx="0" dy="2" stdDeviation="3" flood-color="rgba(0,0,0,0.4)"/></filter></defs>
        <circle cx="88" cy="55" r="46" stroke="${color}" stroke-width="5.5" fill="rgba(120,160,100,${opacity})" filter="url(#shadow2)"/>
        <circle cx="232" cy="55" r="46" stroke="${color}" stroke-width="5.5" fill="rgba(120,160,100,${opacity})" filter="url(#shadow2)"/>
        <circle cx="88" cy="55" r="46" stroke="rgba(255,255,255,0.07)" stroke-width="1.5" fill="none"/>
        <circle cx="232" cy="55" r="46" stroke="rgba(255,255,255,0.07)" stroke-width="1.5" fill="none"/>
        <path d="M134 48 Q160 34 186 48" stroke="${color}" stroke-width="4.5" fill="none" stroke-linecap="round"/>
        <line x1="0" y1="40" x2="42" y2="48" stroke="${color}" stroke-width="4.5" stroke-linecap="round"/>
        <line x1="320" y1="40" x2="278" y2="48" stroke="${color}" stroke-width="4.5" stroke-linecap="round"/>
      </svg>
    `,
  },
  {
    id: 'aviator', name: 'Aviator', color: '#C5A028',
    svg: (color, opacity) => `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 110" fill="none">
        <defs><filter id="shadow3"><feDropShadow dx="0" dy="3" stdDeviation="4" flood-color="rgba(0,0,0,0.5)"/></filter></defs>
        <path d="M14,22 Q70,2 130,22 Q112,85 70,95 Q28,85 14,22Z" stroke="${color}" stroke-width="4.5" fill="rgba(160,200,180,${opacity})" filter="url(#shadow3)"/>
        <path d="M306,22 Q250,2 190,22 Q208,85 250,95 Q292,85 306,22Z" stroke="${color}" stroke-width="4.5" fill="rgba(160,200,180,${opacity})" filter="url(#shadow3)"/>
        <path d="M14,22 Q70,2 130,22 Q112,85 70,95 Q28,85 14,22Z" stroke="rgba(255,255,255,0.1)" stroke-width="1" fill="none"/>
        <path d="M306,22 Q250,2 190,22 Q208,85 250,95 Q292,85 306,22Z" stroke="rgba(255,255,255,0.1)" stroke-width="1" fill="none"/>
        <path d="M130 28 Q160 18 190 28" stroke="${color}" stroke-width="4.5" fill="none" stroke-linecap="round"/>
        <line x1="0" y1="30" x2="14" y2="28" stroke="${color}" stroke-width="4" stroke-linecap="round"/>
        <line x1="320" y1="30" x2="306" y2="28" stroke="${color}" stroke-width="4" stroke-linecap="round"/>
      </svg>
    `,
  },
  {
    id: 'cateye', name: 'Cat-Eye', color: '#8B0000',
    svg: (color, opacity) => `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 110" fill="none">
        <defs><filter id="shadow4"><feDropShadow dx="0" dy="2" stdDeviation="3" flood-color="rgba(0,0,0,0.4)"/></filter></defs>
        <path d="M12,55 Q16,12 75,6 L135,18 Q142,36 130,65 Q90,90 48,78 Z" stroke="${color}" stroke-width="5" fill="rgba(200,140,160,${opacity})" filter="url(#shadow4)"/>
        <path d="M308,55 Q304,12 245,6 L185,18 Q178,36 190,65 Q230,90 272,78 Z" stroke="${color}" stroke-width="5" fill="rgba(200,140,160,${opacity})" filter="url(#shadow4)"/>
        <path d="M135 24 Q160 13 185 24" stroke="${color}" stroke-width="4.5" fill="none" stroke-linecap="round"/>
        <line x1="0" y1="45" x2="12" y2="52" stroke="${color}" stroke-width="4" stroke-linecap="round"/>
        <line x1="320" y1="45" x2="308" y2="52" stroke="${color}" stroke-width="4" stroke-linecap="round"/>
      </svg>
    `,
  },
  {
    id: 'rectangle', name: 'Rectangle', color: '#1a3a5c',
    svg: (color, opacity) => `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 110" fill="none">
        <defs><filter id="shadow5"><feDropShadow dx="0" dy="2" stdDeviation="3" flood-color="rgba(0,0,0,0.4)"/></filter></defs>
        <rect x="8" y="20" width="136" height="62" rx="5" stroke="${color}" stroke-width="5.5" fill="rgba(140,180,210,${opacity})" filter="url(#shadow5)"/>
        <rect x="176" y="20" width="136" height="62" rx="5" stroke="${color}" stroke-width="5.5" fill="rgba(140,180,210,${opacity})" filter="url(#shadow5)"/>
        <rect x="8" y="20" width="136" height="62" rx="5" stroke="rgba(255,255,255,0.07)" stroke-width="1" fill="none"/>
        <rect x="176" y="20" width="136" height="62" rx="5" stroke="rgba(255,255,255,0.07)" stroke-width="1" fill="none"/>
        <path d="M144 40 Q160 30 176 40" stroke="${color}" stroke-width="4.5" fill="none" stroke-linecap="round"/>
        <line x1="0" y1="35" x2="8" y2="40" stroke="${color}" stroke-width="4.5" stroke-linecap="round"/>
        <line x1="320" y1="35" x2="312" y2="40" stroke="${color}" stroke-width="4.5" stroke-linecap="round"/>
      </svg>
    `,
  },
  {
    id: 'hexagonal', name: 'Hexagonal', color: '#2d4a22',
    svg: (color, opacity) => `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 110" fill="none">
        <defs><filter id="shadow6"><feDropShadow dx="0" dy="2" stdDeviation="3" flood-color="rgba(0,0,0,0.4)"/></filter></defs>
        <polygon points="28,22 72,6 116,22 116,70 72,86 28,70" stroke="${color}" stroke-width="5" fill="rgba(140,210,140,${opacity})" filter="url(#shadow6)"/>
        <polygon points="204,22 248,6 292,22 292,70 248,86 204,70" stroke="${color}" stroke-width="5" fill="rgba(140,210,140,${opacity})" filter="url(#shadow6)"/>
        <path d="M116 30 Q160 16 204 30" stroke="${color}" stroke-width="4.5" fill="none" stroke-linecap="round"/>
        <line x1="0" y1="36" x2="28" y2="40" stroke="${color}" stroke-width="4.5" stroke-linecap="round"/>
        <line x1="320" y1="36" x2="292" y2="40" stroke="${color}" stroke-width="4.5" stroke-linecap="round"/>
      </svg>
    `,
  },
  {
    id: 'rimless', name: 'Rimless', color: '#888888',
    svg: (color, opacity) => `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 110" fill="none">
        <ellipse cx="88" cy="52" rx="72" ry="42" stroke="${color}" stroke-width="2" fill="rgba(180,210,230,${opacity})" stroke-dasharray="6,3"/>
        <ellipse cx="232" cy="52" rx="72" ry="42" stroke="${color}" stroke-width="2" fill="rgba(180,210,230,${opacity})" stroke-dasharray="6,3"/>
        <path d="M160 30 Q160 20 160 20" stroke="${color}" stroke-width="3" fill="none"/>
        <circle cx="160" cy="20" r="3" fill="${color}"/>
        <path d="M160 52 L160 20" stroke="${color}" stroke-width="2.5"/>
        <line x1="0" y1="38" x2="16" y2="42" stroke="${color}" stroke-width="2" stroke-linecap="round"/>
        <line x1="320" y1="38" x2="304" y2="42" stroke="${color}" stroke-width="2" stroke-linecap="round"/>
      </svg>
    `,
  },
  {
    id: 'browline', name: 'Browline', color: '#3d2b1a',
    svg: (color, opacity) => `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 110" fill="none">
        <defs><filter id="shadow7"><feDropShadow dx="0" dy="2" stdDeviation="3" flood-color="rgba(0,0,0,0.5)"/></filter></defs>
        <rect x="8" y="10" width="132" height="20" rx="4" fill="${color}" filter="url(#shadow7)"/>
        <rect x="180" y="10" width="132" height="20" rx="4" fill="${color}" filter="url(#shadow7)"/>
        <rect x="8" y="28" width="132" height="52" rx="4" stroke="${color}" stroke-width="2.5" fill="rgba(160,190,210,${opacity})"/>
        <rect x="180" y="28" width="132" height="52" rx="4" stroke="${color}" stroke-width="2.5" fill="rgba(160,190,210,${opacity})"/>
        <path d="M140 22 Q160 14 180 22" stroke="${color}" stroke-width="5" fill="none" stroke-linecap="round"/>
        <line x1="0" y1="24" x2="8" y2="20" stroke="${color}" stroke-width="4.5" stroke-linecap="round"/>
        <line x1="320" y1="24" x2="312" y2="20" stroke="${color}" stroke-width="4.5" stroke-linecap="round"/>
      </svg>
    `,
  },
];

const FRAME_COLORS = [
  { name: 'Noir', value: '#111111' },
  { name: 'Gold', value: '#C5A028' },
  { name: 'Rose Gold', value: '#c97777' },
  { name: 'Silver', value: '#9e9e9e' },
  { name: 'Tortoise', value: '#8B4513' },
  { name: 'Navy', value: '#1a3a6c' },
  { name: 'Crimson', value: '#8B0000' },
  { name: 'Forest', value: '#2d5a1b' },
  { name: 'Crystal', value: '#a8d8e8' },
  { name: 'Amber', value: '#d4870c' },
];

// ─── Canvas-based Background Removal Engine ───────────────────────────────────
// Removes white/light backgrounds from product images, returning a transparent PNG data URL.
function removeBackground(imgSrc, tolerance, onDone, onError) {
  const img = new Image();
  img.crossOrigin = 'anonymous';
  img.onload = () => {
    try {
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;

      // Sample background color from corners (average of 4 corners)
      const cornerPixels = [
        [0, 0], [canvas.width - 1, 0], [0, canvas.height - 1],
        [canvas.width - 1, canvas.height - 1]
      ];
      let bgR = 0, bgG = 0, bgB = 0;
      cornerPixels.forEach(([x, y]) => {
        const idx = (y * canvas.width + x) * 4;
        bgR += data[idx]; bgG += data[idx + 1]; bgB += data[idx + 2];
      });
      bgR = Math.round(bgR / 4); bgG = Math.round(bgG / 4); bgB = Math.round(bgB / 4);

      const tol = tolerance * 2.55; // 0-100 → 0-255

      for (let i = 0; i < data.length; i += 4) {
        const r = data[i], g = data[i + 1], b = data[i + 2];
        // Distance from background color
        const dist = Math.sqrt(
          Math.pow(r - bgR, 2) + Math.pow(g - bgG, 2) + Math.pow(b - bgB, 2)
        );
        if (dist < tol) {
          // Soft edge: fade alpha based on proximity to threshold
          const alpha = Math.round(Math.min(255, (dist / tol) * 255 * 1.5));
          data[i + 3] = alpha;
        }
      }
      ctx.putImageData(imageData, 0, 0);
      onDone(canvas.toDataURL('image/png'));
    } catch (err) {
      onError(err);
    }
  };
  img.onerror = onError;
  // Add cache-buster for crossorigin
  img.src = imgSrc + (imgSrc.includes('?') ? '&' : '?') + 'tryonbg=1';
}

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
  const [lensOpacity, setLensOpacity] = useState(0.15);

  // Adjustment state
  const [scale, setScale] = useState(1);
  const [posX, setPosX] = useState(0);
  const [posY, setPosY] = useState(0);
  const [rotation, setRotation] = useState(0);

  // AI auto-fit state
  const [autoFitDone, setAutoFitDone] = useState(false);
  const [autoFitting, setAutoFitting] = useState(false);
  const [autoFitError, setAutoFitError] = useState(null);

  // NEW: Background removal state
  const [bgRemovedUrl, setBgRemovedUrl] = useState(null);
  const [bgRemoving, setBgRemoving] = useState(false);
  const [bgTolerance, setBgTolerance] = useState(55);
  const [bgRemoveError, setBgRemoveError] = useState(null);

  // NEW: Webcam mode
  const [webcamMode, setWebcamMode] = useState(false);
  const [webcamStream, setWebcamStream] = useState(null);
  const [webcamSnapped, setWebcamSnapped] = useState(null);
  const webcamVideoRef = useRef(null);
  const webcamCanvasRef = useRef(null);

  // NEW: Mirror mode
  const [mirrorMode, setMirrorMode] = useState(false);

  // NEW: Split comparison mode
  const [splitMode, setSplitMode] = useState(false);
  const [splitPos, setSplitPos] = useState(50); // percentage
  const splitDragging = useRef(false);
  const splitContainerRef = useRef(null);

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

  // When product changes, reset BG removed cache and auto-remove
  useEffect(() => {
    setBgRemovedUrl(null);
    setBgRemoveError(null);
    if (useProductFrame && selectedProduct) {
      triggerBgRemoval(getProductImgUrl(selectedProduct), bgTolerance);
    }
  }, [selectedProduct, useProductFrame]);

  // When tolerance changes, re-run removal
  useEffect(() => {
    if (useProductFrame && selectedProduct) {
      const timer = setTimeout(() => {
        triggerBgRemoval(getProductImgUrl(selectedProduct), bgTolerance);
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [bgTolerance]);

  const currentFaceImg = webcamSnapped || userUploadedImage || faceImage;

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setUserUploadedImage(ev.target.result);
      setWebcamSnapped(null);
      setPosX(0); setPosY(0); setScale(1); setRotation(0); setAutoFitDone(false);
      setAutoFitError(null);
    };
    reader.readAsDataURL(file);
  };

  const getProductImgUrl = (product) => {
    if (!product) return '';
    let img = product.image_urls;
    if (Array.isArray(img)) img = img[0];
    else if (typeof img === 'string' && img.startsWith('[')) {
      try { img = JSON.parse(img)[0]; } catch (_) {}
    }
    return img || '';
  };

  // ─── Background Removal Trigger ───────────────────────────────────────────
  const triggerBgRemoval = useCallback((imgUrl, tol) => {
    if (!imgUrl) return;
    setBgRemoving(true);
    setBgRemoveError(null);
    setBgRemovedUrl(null);
    removeBackground(
      imgUrl, tol,
      (resultUrl) => { setBgRemovedUrl(resultUrl); setBgRemoving(false); },
      (err) => { setBgRemoveError('Background removal failed. Using original image.'); setBgRemoving(false); console.warn('BG Removal Error:', err); }
    );
  }, []);

  // ─── Webcam ───────────────────────────────────────────────────────────────
  const startWebcam = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user', width: 800, height: 900 } });
      setWebcamStream(stream);
      setWebcamMode(true);
      setWebcamSnapped(null);
      setUserUploadedImage(null);
      // Give DOM time to mount the video element
      setTimeout(() => {
        if (webcamVideoRef.current) {
          webcamVideoRef.current.srcObject = stream;
          webcamVideoRef.current.play();
        }
      }, 200);
    } catch (err) {
      alert('Camera access denied. Please allow camera permission in your browser.');
    }
  }, []);

  const stopWebcam = useCallback(() => {
    if (webcamStream) {
      webcamStream.getTracks().forEach(t => t.stop());
      setWebcamStream(null);
    }
    setWebcamMode(false);
  }, [webcamStream]);

  const snapPhoto = useCallback(() => {
    const video = webcamVideoRef.current;
    if (!video) return;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 800;
    canvas.height = video.videoHeight || 900;
    const ctx = canvas.getContext('2d');
    if (mirrorMode) {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const snap = canvas.toDataURL('image/png');
    setWebcamSnapped(snap);
    stopWebcam();
    setPosX(0); setPosY(0); setScale(1); setRotation(0);
    setAutoFitDone(false); setAutoFitError(null);
  }, [mirrorMode, stopWebcam]);

  // ─── Face-api Loader ──────────────────────────────────────────────────────
  const loadFaceApi = () => new Promise((resolve, reject) => {
    if (window.faceapi) { resolve(window.faceapi); return; }
    const s = document.createElement('script');
    s.src = 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api/dist/face-api.js';
    s.onload = () => resolve(window.faceapi);
    s.onerror = (err) => reject(err);
    document.head.appendChild(s);
  });

  // ─── AI Auto-Fit ──────────────────────────────────────────────────────────
  const runAutoFit = useCallback(async () => {
    setAutoFitting(true);
    setAutoFitError(null);
    setAutoFitDone(false);
    try {
      const imgEl = faceImageRef.current;
      if (!imgEl) throw new Error("Face image not loaded.");
      const faceapi = await loadFaceApi();
      const MODEL_URL = 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model';
      if (!faceapi.nets.tinyFaceDetector.params) await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
      if (!faceapi.nets.faceLandmark68Net.params) await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL);
      const options = new faceapi.TinyFaceDetectorOptions({ scoreThreshold: 0.15, inputSize: 224 });
      const detection = await faceapi.detectSingleFace(imgEl, options).withFaceLandmarks();
      if (detection) {
        const landmarks = detection.landmarks;
        const leftEye = landmarks.getLeftEye();
        const rightEye = landmarks.getRightEye();
        const getCenter = (pts) => {
          let x = 0, y = 0;
          pts.forEach(p => { x += p.x; y += p.y; });
          return { x: x / pts.length, y: y / pts.length };
        };
        const lc = getCenter(leftEye), rc = getCenter(rightEye);
        const rect = imgEl.getBoundingClientRect();
        const dispW = rect.width, dispH = rect.height;
        const midX = (lc.x + rc.x) / 2, midY = (lc.y + rc.y) / 2;
        const pctX = (midX / dispW) * 100;
        const pctY = (midY / dispH) * 100;
        const dx = rc.x - lc.x, dy = rc.y - lc.y;
        const eyeDistance = Math.sqrt(dx * dx + dy * dy);
        const angle = Math.atan2(dy, dx) * (180 / Math.PI);
        const baseGlassesWidth = dispW * 0.72;
        const calculatedScale = (eyeDistance * 2.4) / baseGlassesWidth;
        setPosX(Math.round(pctX - 50));
        setPosY(Math.round(pctY - 38));
        setScale(Math.max(0.5, Math.min(1.6, calculatedScale)));
        setRotation(Math.round(angle));
        setAutoFitDone(true);
      } else {
        throw new Error("No face detected. Try another photo or adjust manually.");
      }
    } catch (err) {
      setAutoFitError(err.message || "Could not detect face.");
      setPosX(0); setPosY(0); setScale(1); setRotation(0);
    } finally {
      setAutoFitting(false);
    }
  }, []);

  // Reset on face change
  useEffect(() => {
    setAutoFitDone(false); setAutoFitError(null);
    setPosX(0); setPosY(0); setScale(1); setRotation(0);
  }, [faceImage, userUploadedImage, webcamSnapped]);

  const resetAll = () => {
    setPosX(0); setPosY(0); setScale(1); setRotation(0);
    setAutoFitDone(false); setAutoFitError(null);
  };

  // ─── Split View drag handlers ─────────────────────────────────────────────
  const onSplitMouseDown = (e) => { splitDragging.current = true; e.preventDefault(); };
  useEffect(() => {
    const move = (e) => {
      if (!splitDragging.current || !splitContainerRef.current) return;
      const rect = splitContainerRef.current.getBoundingClientRect();
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const pct = Math.max(5, Math.min(95, ((clientX - rect.left) / rect.width) * 100));
      setSplitPos(pct);
    };
    const up = () => { splitDragging.current = false; };
    window.addEventListener('mousemove', move);
    window.addEventListener('mouseup', up);
    window.addEventListener('touchmove', move);
    window.addEventListener('touchend', up);
    return () => {
      window.removeEventListener('mousemove', move);
      window.removeEventListener('mouseup', up);
      window.removeEventListener('touchmove', move);
      window.removeEventListener('touchend', up);
    };
  }, []);

  // ─── Download ─────────────────────────────────────────────────────────────
  const downloadTryon = () => {
    const imgEl = faceImageRef.current;
    if (!imgEl) return;
    const canvas = document.createElement('canvas');
    canvas.width = imgEl.naturalWidth || 800;
    canvas.height = imgEl.naturalHeight || 1000;
    const ctx = canvas.getContext('2d');
    const faceImg = new Image();
    faceImg.crossOrigin = 'anonymous';
    faceImg.src = currentFaceImg;
    faceImg.onload = () => {
      if (mirrorMode) { ctx.translate(canvas.width, 0); ctx.scale(-1, 1); }
      ctx.drawImage(faceImg, 0, 0, canvas.width, canvas.height);
      if (mirrorMode) { ctx.setTransform(1, 0, 0, 1, 0, 0); }

      const glassesImg = new Image();
      glassesImg.crossOrigin = 'anonymous';
      const draw = () => {
        const eyeX = canvas.width * ((50 + posX) / 100);
        const eyeY = canvas.height * ((38 + posY) / 100);
        const eyeW = canvas.width * 0.72 * scale;
        const eyeH = useProductFrame ? (eyeW * glassesImg.height) / glassesImg.width : eyeW / 3;
        ctx.save();
        ctx.translate(eyeX, eyeY);
        ctx.rotate((rotation * Math.PI) / 180);
        ctx.drawImage(glassesImg, -eyeW / 2, -eyeH / 2, eyeW, eyeH);
        ctx.restore();
        const link = document.createElement('a');
        link.href = canvas.toDataURL('image/png');
        link.download = `lekya_tryon_${Date.now()}.png`;
        link.click();
      };
      if (useProductFrame) {
        glassesImg.src = bgRemovedUrl || getProductImgUrl(selectedProduct);
        glassesImg.onload = draw;
      } else {
        const svgBlob = new Blob([selectedFrame.svg(frameColor, lensOpacity)], { type: 'image/svg+xml' });
        const svgUrl = URL.createObjectURL(svgBlob);
        glassesImg.onload = () => { draw(); URL.revokeObjectURL(svgUrl); };
        glassesImg.src = svgUrl;
      }
    };
  };

  // Computed values
  const svgDataUrl = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(selectedFrame.svg(frameColor, lensOpacity))}`;
  const eyeRegionTop = 38;
  const frameWidthPct = 72;

  // Overlay image source — for catalog: use bg-removed version if ready, else original
  const overlayImgSrc = useProductFrame
    ? (bgRemovedUrl || getProductImgUrl(selectedProduct))
    : svgDataUrl;

  // Glasses overlay styles shared
  const glassesOverlayStyle = {
    position: 'absolute',
    top: `${eyeRegionTop + posY}%`,
    left: `${50 + posX}%`,
    width: `${frameWidthPct * scale}%`,
    transform: `translate(-50%, -50%) rotate(${rotation}deg)`,
    transition: autoFitting ? 'all 0.6s cubic-bezier(0.34,1.56,0.64,1)' : 'none',
    filter: 'drop-shadow(0 4px 20px rgba(0,0,0,0.5))',
    pointerEvents: 'none',
    zIndex: 3,
  };

  return (
    <>
      <Head>
        <title>Virtual Try-On Studio — Lekya Specs</title>
        <meta name="description" content="Try on any eyewear frame instantly. Upload your photo or use live webcam. AI-powered face detection with real-time background removal." />
      </Head>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Outfit:wght@400;600;700;800&display=swap');
        
        .tryon-container { background: linear-gradient(135deg, #080808 0%, #140f0a 50%, #0a0a12 100%); min-height: 100vh; font-family: 'Inter', sans-serif; }
        
        .glass-card { 
          background: rgba(255,255,255,0.032); 
          backdrop-filter: blur(24px); 
          border: 1px solid rgba(197,160,40,0.12); 
          border-radius: 22px;
          box-shadow: 0 8px 40px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05);
        }
        
        .gold-btn { 
          background: linear-gradient(135deg, #C5A028 0%, #e8c547 50%, #C5A028 100%); 
          color: #0a0a0a; font-weight: 800; letter-spacing: 0.09em; text-transform: uppercase; 
          font-size: 10.5px; padding: 14px 22px; border-radius: 12px; transition: all 0.3s ease; 
          border: none; cursor: pointer; display: flex; align-items: center; gap: 8px;
          box-shadow: 0 4px 16px rgba(197,160,40,0.3);
          font-family: 'Inter', sans-serif;
        }
        .gold-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 30px rgba(197,160,40,0.5); }
        .gold-btn:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }
        
        .ghost-btn { 
          background: rgba(255,255,255,0.05); color: rgba(255,255,255,0.65); 
          font-weight: 700; letter-spacing: 0.07em; text-transform: uppercase; 
          font-size: 10px; padding: 11px 16px; border-radius: 11px; transition: all 0.25s; 
          border: 1px solid rgba(255,255,255,0.09); cursor: pointer;
          display: flex; align-items: center; gap: 7px;
          font-family: 'Inter', sans-serif;
        }
        .ghost-btn:hover { background: rgba(197,160,40,0.12); border-color: rgba(197,160,40,0.35); color: #C5A028; }
        .ghost-btn.active { background: rgba(197,160,40,0.15); border-color: rgba(197,160,40,0.5); color: #C5A028; }
        
        .face-model-btn { 
          border-radius: 14px; overflow: hidden; border: 2.5px solid transparent; 
          transition: all 0.3s; cursor: pointer; background: none; padding: 0; 
          box-shadow: 0 2px 12px rgba(0,0,0,0.4);
        }
        .face-model-btn.active { border-color: #C5A028; box-shadow: 0 0 0 3px rgba(197,160,40,0.3), 0 4px 16px rgba(197,160,40,0.2); }
        .face-model-btn:hover { border-color: rgba(197,160,40,0.5); transform: scale(1.05); }
        
        .frame-option { 
          border-radius: 14px; border: 2px solid rgba(255,255,255,0.06); padding: 12px 14px; 
          cursor: pointer; transition: all 0.25s; background: rgba(255,255,255,0.02); 
          display: flex; align-items: center; gap: 12px; 
        }
        .frame-option:hover { border-color: rgba(197,160,40,0.35); background: rgba(197,160,40,0.05); transform: translateX(2px); }
        .frame-option.active { border-color: #C5A028; background: rgba(197,160,40,0.1); box-shadow: 0 0 0 1px rgba(197,160,40,0.2); }
        
        .color-dot { 
          width: 26px; height: 26px; border-radius: 50%; border: 2.5px solid transparent; 
          cursor: pointer; transition: all 0.2s; flex-shrink: 0; 
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        }
        .color-dot:hover { transform: scale(1.25); box-shadow: 0 4px 12px rgba(0,0,0,0.4); }
        .color-dot.active { border-color: white; box-shadow: 0 0 0 3px rgba(255,255,255,0.3); transform: scale(1.2); }
        
        .range-slider { 
          -webkit-appearance: none; appearance: none; width: 100%; height: 4px; 
          border-radius: 2px; background: rgba(255,255,255,0.1); outline: none; 
        }
        .range-slider::-webkit-slider-thumb { 
          -webkit-appearance: none; appearance: none; width: 18px; height: 18px; 
          border-radius: 50%; background: linear-gradient(135deg, #C5A028, #e8c547); 
          cursor: pointer; box-shadow: 0 2px 10px rgba(197,160,40,0.6); 
        }
        
        .preview-wrapper { 
          position: relative; width: 100%; border-radius: 22px; overflow: hidden; 
          background: linear-gradient(180deg, #1a1410 0%, #0d0d0d 100%); 
          box-shadow: 0 24px 60px rgba(0,0,0,0.8), 0 0 0 1px rgba(197,160,40,0.1);
        }
        .preview-face { width: 100%; height: 100%; display: block; object-fit: cover; object-position: top center; }
        
        .ai-badge { 
          position: absolute; top: 14px; left: 14px; 
          background: rgba(197,160,40,0.95); 
          backdrop-filter: blur(10px);
          color: #0a0a0a; font-size: 9px; font-weight: 900; letter-spacing: 0.14em; 
          text-transform: uppercase; padding: 6px 12px; border-radius: 100px; 
          display: flex; align-items: center; gap: 5px; z-index: 10;
          box-shadow: 0 4px 16px rgba(197,160,40,0.4);
        }
        
        .tool-badge {
          position: absolute; top: 14px; right: 14px;
          display: flex; gap: 6px; z-index: 10;
        }
        .mini-badge {
          background: rgba(0,0,0,0.65); backdrop-filter: blur(10px);
          border: 1px solid rgba(255,255,255,0.1);
          color: rgba(255,255,255,0.8); font-size: 9px; font-weight: 700;
          letter-spacing: 0.1em; text-transform: uppercase;
          padding: 5px 10px; border-radius: 100px;
          display: flex; align-items: center; gap: 4px;
          cursor: pointer; transition: all 0.2s;
        }
        .mini-badge:hover { background: rgba(197,160,40,0.2); border-color: rgba(197,160,40,0.4); color: #C5A028; }
        .mini-badge.on { background: rgba(197,160,40,0.25); border-color: rgba(197,160,40,0.5); color: #C5A028; }
        
        .autofit-pulse { animation: pulse-gold 1.4s ease-in-out infinite; }
        @keyframes pulse-gold { 0%,100% { box-shadow: 0 4px 16px rgba(197,160,40,0.3); } 50% { box-shadow: 0 0 0 12px rgba(197,160,40,0); } }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
        
        .bg-removing-shimmer {
          background: linear-gradient(90deg, rgba(197,160,40,0.1) 25%, rgba(197,160,40,0.3) 50%, rgba(197,160,40,0.1) 75%);
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
          border-radius: 8px; padding: 10px; text-align: center;
        }
        
        .section-label { 
          font-size: 10px; font-weight: 900; letter-spacing: 0.14em; text-transform: uppercase; 
          color: rgba(197,160,40,0.75); margin-bottom: 14px; display: flex; align-items: center; gap: 7px; 
        }
        
        .product-frame-row { 
          display: flex; align-items: center; gap: 10px; padding: 11px 12px; 
          border-radius: 12px; border: 1px solid rgba(255,255,255,0.06); 
          cursor: pointer; transition: all 0.2s; width: 100%; background: none; text-align: left;
        }
        .product-frame-row:hover { background: rgba(197,160,40,0.06); border-color: rgba(197,160,40,0.3); transform: translateX(2px); }
        .product-frame-row.active { background: rgba(197,160,40,0.12); border-color: #C5A028; box-shadow: 0 0 0 1px rgba(197,160,40,0.2); }
        
        .webcam-overlay {
          position: absolute; inset: 0; z-index: 5;
          display: flex; flex-direction: column; align-items: center; justify-content: flex-end;
          padding: 20px;
          background: linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 60%);
        }
        
        .split-container { position: relative; width: 100%; height: 100%; user-select: none; }
        .split-divider {
          position: absolute; top: 0; bottom: 0; width: 3px; z-index: 6;
          background: linear-gradient(180deg, #C5A028, #e8c547, #C5A028);
          cursor: col-resize; transform: translateX(-50%);
          box-shadow: 0 0 20px rgba(197,160,40,0.8);
        }
        .split-handle {
          position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);
          width: 32px; height: 32px; border-radius: 50%;
          background: linear-gradient(135deg, #C5A028, #e8c547);
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 4px 20px rgba(197,160,40,0.6);
          cursor: col-resize;
        }
        .split-label {
          position: absolute; top: 14px; font-size: 9px; font-weight: 900;
          letter-spacing: 0.12em; text-transform: uppercase;
          background: rgba(0,0,0,0.7); backdrop-filter: blur(8px);
          border-radius: 6px; padding: 4px 8px; z-index: 7;
        }
        
        .mode-tab-bar { display: flex; gap: 6px; margin-bottom: 16px; }
        .mode-tab {
          flex: 1; padding: 10px; border-radius: 10px; border: 1px solid rgba(255,255,255,0.07);
          background: rgba(255,255,255,0.03); color: rgba(255,255,255,0.5);
          font-size: 10px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase;
          cursor: pointer; transition: all 0.25s; display: flex; align-items: center; justify-content: center; gap: 5px;
          font-family: 'Inter', sans-serif;
        }
        .mode-tab.active { background: rgba(197,160,40,0.15); border-color: rgba(197,160,40,0.5); color: #C5A028; }
        .mode-tab:hover { background: rgba(197,160,40,0.08); border-color: rgba(197,160,40,0.3); color: rgba(255,255,255,0.8); }
        
        .upload-zone {
          display: block; border: 2px dashed rgba(197,160,40,0.25); border-radius: 16px; 
          padding: 20px 12px; text-align: center; cursor: pointer; transition: all 0.3s; margin-bottom: 16px;
          background: rgba(197,160,40,0.02);
        }
        .upload-zone:hover { border-color: rgba(197,160,40,0.6); background: rgba(197,160,40,0.05); transform: scale(1.01); }
        
        .webcam-start-btn {
          width: 100%; padding: 16px; border-radius: 14px; margin-bottom: 16px;
          background: rgba(255,255,255,0.04); border: 2px dashed rgba(100,180,255,0.3);
          color: rgba(100,180,255,0.8); font-size: 11px; font-weight: 700;
          letter-spacing: 0.08em; text-transform: uppercase; cursor: pointer;
          transition: all 0.3s; display: flex; align-items: center; justify-content: center; gap: 8px;
          font-family: 'Inter', sans-serif;
        }
        .webcam-start-btn:hover { border-color: rgba(100,180,255,0.6); background: rgba(100,180,255,0.08); color: rgba(140,210,255,1); }
        
        .bg-remove-indicator {
          display: flex; align-items: center; gap: 8px; padding: 10px 14px;
          border-radius: 10px; font-size: 10px; font-weight: 700; letter-spacing: 0.06em;
          margin-bottom: 14px;
        }
        .bg-remove-indicator.processing { background: rgba(197,160,40,0.1); border: 1px solid rgba(197,160,40,0.3); color: #C5A028; }
        .bg-remove-indicator.done { background: rgba(34,197,94,0.1); border: 1px solid rgba(34,197,94,0.3); color: #4ade80; }
        .bg-remove-indicator.error { background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.25); color: #f87171; }
        
        .fine-tune-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 18px; }
        
        .scrollbar-thin::-webkit-scrollbar { width: 4px; }
        .scrollbar-thin::-webkit-scrollbar-track { background: rgba(255,255,255,0.03); border-radius: 2px; }
        .scrollbar-thin::-webkit-scrollbar-thumb { background: rgba(197,160,40,0.3); border-radius: 2px; }
        
        @media (max-width: 900px) {
          .tryon-main-grid { grid-template-columns: 1fr !important; }
          .right-panel { max-width: 100% !important; }
        }
      `}</style>

      <div className="tryon-container">
        <div style={{ maxWidth: 1300, margin: '0 auto', padding: '40px 20px' }}>

          {/* ── Header ── */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 18, marginBottom: 40 }}>
            <Link href="/shop" style={{ width: 44, height: 44, borderRadius: '50%', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', flexShrink: 0, transition: 'all 0.2s', textDecoration: 'none' }}>
              <ArrowLeft style={{ width: 18, height: 18 }} />
            </Link>
            <div style={{ flex: 1 }}>
              <h1 style={{ fontFamily: 'Outfit, Georgia, serif', fontSize: 34, fontWeight: 800, color: '#fff', margin: 0, letterSpacing: '0.01em' }}>
                Virtual Try-On Studio
                <span style={{ marginLeft: 12, fontSize: 12, fontWeight: 700, background: 'linear-gradient(135deg, #C5A028, #e8c547)', color: '#0a0a0a', padding: '3px 10px', borderRadius: 20, letterSpacing: '0.1em', textTransform: 'uppercase', verticalAlign: 'middle' }}>AI Powered</span>
              </h1>
              <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13, margin: '5px 0 0', fontWeight: 500 }}>
                Real-time frame overlay • Smart background removal • Live webcam try-on
              </p>
            </div>
          </div>

          {/* ── Main Grid ── */}
          <div className="tryon-main-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 430px', gap: 28, alignItems: 'start' }}>

            {/* ════ LEFT: Preview Canvas ════ */}
            <div>
              <div className="glass-card" style={{ padding: 24 }}>

                {/* ── Preview area ── */}
                <div
                  className="preview-wrapper"
                  ref={previewRef}
                  style={{ aspectRatio: '4/5', maxHeight: 600, margin: '0 auto', maxWidth: 480 }}
                >
                  {webcamMode && !webcamSnapped ? (
                    /* ── Live Webcam Feed ── */
                    <>
                      <video
                        ref={webcamVideoRef}
                        autoPlay
                        playsInline
                        muted
                        style={{
                          width: '100%', height: '100%', objectFit: 'cover',
                          transform: mirrorMode ? 'scaleX(-1)' : 'none',
                          borderRadius: 22,
                        }}
                      />
                      <canvas ref={webcamCanvasRef} style={{ display: 'none' }} />

                      {/* Glasses overlay on top of webcam */}
                      <div style={glassesOverlayStyle}>
                        <img
                          src={overlayImgSrc}
                          alt="glasses frame"
                          style={{ width: '100%', display: 'block' }}
                        />
                      </div>

                      <div className="ai-badge">
                        <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#ff4444', display: 'inline-block', animation: 'pulse-gold 1s infinite' }} />
                        Live Webcam
                      </div>

                      <div className="webcam-overlay">
                        <button
                          onClick={snapPhoto}
                          style={{
                            width: 64, height: 64, borderRadius: '50%',
                            background: 'linear-gradient(135deg, #C5A028, #e8c547)',
                            border: '4px solid rgba(255,255,255,0.3)',
                            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            boxShadow: '0 8px 30px rgba(197,160,40,0.6)',
                            transition: 'transform 0.2s',
                          }}
                          title="Take Snapshot"
                        >
                          <Camera style={{ width: 26, height: 26, color: '#0a0a0a' }} />
                        </button>
                        <button onClick={stopWebcam} style={{ marginTop: 10, padding: '6px 16px', background: 'rgba(0,0,0,0.6)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 20, color: 'rgba(255,255,255,0.7)', fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', cursor: 'pointer' }}>
                          Stop Camera
                        </button>
                      </div>
                    </>
                  ) : splitMode ? (
                    /* ── Split Comparison View ── */
                    <div
                      className="split-container"
                      ref={splitContainerRef}
                      style={{ width: '100%', height: '100%' }}
                    >
                      {/* BEFORE — original face */}
                      <img
                        src={currentFaceImg}
                        alt="before"
                        style={{
                          position: 'absolute', inset: 0, width: '100%', height: '100%',
                          objectFit: 'cover', objectPosition: 'top center',
                          transform: mirrorMode ? 'scaleX(-1)' : 'none',
                          borderRadius: 22,
                        }}
                      />
                      {/* AFTER — with glasses, clipped to right side */}
                      <div style={{
                        position: 'absolute', inset: 0, overflow: 'hidden',
                        clipPath: `inset(0 0 0 ${splitPos}%)`,
                      }}>
                        <img
                          ref={faceImageRef}
                          src={currentFaceImg}
                          alt="after face"
                          crossOrigin="anonymous"
                          style={{
                            position: 'absolute', inset: 0, width: '100%', height: '100%',
                            objectFit: 'cover', objectPosition: 'top center',
                            transform: mirrorMode ? 'scaleX(-1)' : 'none',
                            borderRadius: 22,
                          }}
                        />
                        <div style={{ ...glassesOverlayStyle, position: 'absolute' }}>
                          <img src={overlayImgSrc} alt="glasses" style={{ width: '100%', display: 'block' }} />
                        </div>
                      </div>

                      {/* Divider */}
                      <div
                        className="split-divider"
                        style={{ left: `${splitPos}%` }}
                        onMouseDown={onSplitMouseDown}
                        onTouchStart={onSplitMouseDown}
                      >
                        <div className="split-handle">
                          <SplitSquareHorizontal style={{ width: 14, height: 14, color: '#0a0a0a' }} />
                        </div>
                      </div>

                      {/* Labels */}
                      <span className="split-label" style={{ left: 12, color: 'rgba(255,255,255,0.7)' }}>BEFORE</span>
                      <span className="split-label" style={{ right: 12, color: '#C5A028' }}>AFTER</span>
                    </div>
                  ) : (
                    /* ── Standard Preview ── */
                    <>
                      <img
                        ref={faceImageRef}
                        id="tryon-face-image"
                        src={currentFaceImg}
                        alt="face model"
                        className="preview-face"
                        crossOrigin="anonymous"
                        style={{
                          transform: mirrorMode ? 'scaleX(-1)' : 'none',
                          transition: 'transform 0.3s',
                        }}
                      />

                      {/* Background removing overlay shimmer */}
                      {bgRemoving && useProductFrame && (
                        <div style={{
                          position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
                          background: 'rgba(0,0,0,0.15)', zIndex: 4, borderRadius: 22,
                        }}>
                          <div style={{ textAlign: 'center' }}>
                            <div style={{ width: 48, height: 48, borderRadius: '50%', border: '3px solid rgba(197,160,40,0.3)', borderTopColor: '#C5A028', animation: 'spin 0.8s linear infinite', margin: '0 auto 10px' }} />
                            <div style={{ fontSize: 10, fontWeight: 800, color: '#C5A028', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
                              Removing Background
                            </div>
                            <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.4)', marginTop: 4 }}>AI Processing Image...</div>
                          </div>
                        </div>
                      )}

                      {/* Glasses Overlay — transparent, positioned on eyes */}
                      {!(bgRemoving && useProductFrame) && (
                        <div style={glassesOverlayStyle}>
                          <img
                            src={overlayImgSrc}
                            alt="glasses frame"
                            style={{
                              width: '100%',
                              display: 'block',
                              // For bg-removed images, no blend mode needed — already transparent
                              mixBlendMode: (useProductFrame && !bgRemovedUrl) ? 'multiply' : 'normal',
                            }}
                          />
                        </div>
                      )}

                      {/* Status badge */}
                      <div className="ai-badge">
                        {autoFitting ? (
                          <><RefreshCw style={{ width: 9, height: 9, animation: 'spin 0.8s linear infinite' }} /> AI Detecting...</>
                        ) : autoFitDone ? (
                          <><Sparkles style={{ width: 9, height: 9 }} /> Auto-Aligned</>
                        ) : (
                          <><Eye style={{ width: 9, height: 9 }} /> Live View</>
                        )}
                      </div>

                      {/* Tool badges — Mirror + Split */}
                      <div className="tool-badge">
                        <button
                          className={`mini-badge ${mirrorMode ? 'on' : ''}`}
                          onClick={() => setMirrorMode(m => !m)}
                          title="Mirror Mode"
                        >
                          <FlipHorizontal style={{ width: 10, height: 10 }} />
                          Mirror
                        </button>
                        <button
                          className={`mini-badge ${splitMode ? 'on' : ''}`}
                          onClick={() => setSplitMode(m => !m)}
                          title="Before / After Split"
                        >
                          <SplitSquareHorizontal style={{ width: 10, height: 10 }} />
                          Split
                        </button>
                      </div>
                    </>
                  )}
                </div>

                {/* ── Action buttons ── */}
                <div style={{ display: 'flex', gap: 10, marginTop: 20, flexWrap: 'wrap' }}>
                  <button
                    className={`gold-btn ${autoFitting ? 'autofit-pulse' : ''}`}
                    onClick={runAutoFit}
                    disabled={autoFitting || webcamMode}
                    style={{ flex: 1, justifyContent: 'center', minWidth: 140 }}
                  >
                    <Wand2 style={{ width: 14, height: 14 }} />
                    {autoFitting ? 'Detecting Eyes...' : 'AI Auto-Fit ✨'}
                  </button>
                  <button className="ghost-btn" onClick={resetAll}>
                    <RefreshCw style={{ width: 12, height: 12 }} /> Reset
                  </button>
                  <button className="ghost-btn" onClick={downloadTryon} disabled={webcamMode && !webcamSnapped}>
                    <Download style={{ width: 12, height: 12 }} /> Save PNG
                  </button>
                </div>

                {autoFitError && (
                  <div style={{ marginTop: 12, padding: '10px 14px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 10, color: '#f87171', fontSize: 11, textAlign: 'center' }}>
                    ⚠ {autoFitError}
                  </div>
                )}

                {/* ── Fine-tune sliders ── */}
                <div style={{ marginTop: 22, padding: '20px', background: 'rgba(255,255,255,0.025)', borderRadius: 16, border: '1px solid rgba(255,255,255,0.05)' }}>
                  <div style={{ fontSize: 10, fontWeight: 900, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(197,160,40,0.7)', marginBottom: 18, display: 'flex', alignItems: 'center', gap: 7 }}>
                    <Move style={{ width: 12, height: 12 }} /> Manual Fine-Tune Position
                  </div>

                  <div className="fine-tune-grid">
                    {[
                      { label: 'Frame Size', value: `${Math.round(scale * 100)}%`, min: 0.5, max: 1.8, step: 0.01, state: scale, setState: setScale, icons: [<ZoomOut style={{ width: 11, height: 11 }} />, <ZoomIn style={{ width: 11, height: 11 }} />], isFloat: true },
                      { label: 'Vertical Shift', value: `${posY > 0 ? '+' : ''}${posY}%`, min: -35, max: 35, step: 1, state: posY, setState: setPosY, isFloat: false },
                      { label: 'Horizontal Shift', value: `${posX > 0 ? '+' : ''}${posX}%`, min: -35, max: 35, step: 1, state: posX, setState: setPosX, isFloat: false },
                      { label: 'Tilt Angle', value: `${rotation}°`, min: -25, max: 25, step: 1, state: rotation, setState: setRotation, icons: [<RotateCw style={{ width: 11, height: 11, transform: 'scaleX(-1)' }} />, <RotateCw style={{ width: 11, height: 11 }} />], isFloat: false },
                    ].map(({ label, value, min, max, step, state, setState, icons, isFloat }) => (
                      <div key={label}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'rgba(255,255,255,0.45)', fontWeight: 700, marginBottom: 8 }}>
                          <span>{label}</span>
                          <span style={{ color: '#C5A028', fontFamily: 'monospace', fontSize: 11, fontWeight: 800 }}>{value}</span>
                        </div>
                        {icons ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span style={{ color: 'rgba(255,255,255,0.25)' }}>{icons[0]}</span>
                            <input type="range" className="range-slider" min={min} max={max} step={step} value={state} onChange={e => setState(isFloat ? parseFloat(e.target.value) : parseInt(e.target.value))} />
                            <span style={{ color: 'rgba(255,255,255,0.25)' }}>{icons[1]}</span>
                          </div>
                        ) : (
                          <input type="range" className="range-slider" min={min} max={max} step={step} value={state} onChange={e => setState(isFloat ? parseFloat(e.target.value) : parseInt(e.target.value))} />
                        )}
                      </div>
                    ))}

                    {!useProductFrame && (
                      <div style={{ gridColumn: '1 / -1' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'rgba(255,255,255,0.45)', fontWeight: 700, marginBottom: 8 }}>
                          <span>Lens Tint Darkness</span>
                          <span style={{ color: '#C5A028', fontFamily: 'monospace', fontSize: 11, fontWeight: 800 }}>{Math.round(lensOpacity * 100)}%</span>
                        </div>
                        <input type="range" className="range-slider" min="0" max="0.9" step="0.01" value={lensOpacity} onChange={e => setLensOpacity(parseFloat(e.target.value))} />
                      </div>
                    )}

                    {useProductFrame && (
                      <div style={{ gridColumn: '1 / -1' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'rgba(255,255,255,0.45)', fontWeight: 700, marginBottom: 8 }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><Sliders style={{ width: 10, height: 10 }} /> BG Remove Tolerance</span>
                          <span style={{ color: '#C5A028', fontFamily: 'monospace', fontSize: 11, fontWeight: 800 }}>{bgTolerance}%</span>
                        </div>
                        <input
                          type="range" className="range-slider" min="10" max="90" step="1"
                          value={bgTolerance}
                          onChange={e => setBgTolerance(parseInt(e.target.value))}
                        />
                        <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)', marginTop: 6 }}>
                          Drag to fine-tune how aggressively the background is removed
                        </div>
                      </div>
                    )}
                  </div>
                </div>

              </div>
            </div>

            {/* ════ RIGHT: Controls Panel ════ */}
            <div className="right-panel" style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

              {/* ── 1. Choose Face Photo ── */}
              <div className="glass-card" style={{ padding: 22 }}>
                <div className="section-label">
                  <ImageIcon style={{ width: 12, height: 12 }} />
                  1. Choose Face Photo
                </div>


                {/* Upload zone */}
                <label className="upload-zone">
                  <Upload style={{ width: 22, height: 22, color: '#C5A028', margin: '0 auto 7px' }} />
                  <div style={{ fontSize: 10, fontWeight: 800, color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', letterSpacing: '0.09em' }}>Upload My Photo</div>
                  <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)', marginTop: 3 }}>PNG, JPG — front-facing portrait</div>
                  {userUploadedImage && <div style={{ marginTop: 8, fontSize: 9, color: '#4ade80', fontWeight: 700 }}>✓ Photo loaded!</div>}
                  <input type="file" accept="image/*" onChange={handlePhotoUpload} style={{ display: 'none' }} />
                </label>

                {/* Live Webcam button */}
                {!webcamMode ? (
                  <button className="webcam-start-btn" onClick={startWebcam}>
                    <Camera style={{ width: 16, height: 16 }} />
                    Use Live Webcam Camera
                  </button>
                ) : (
                  <button
                    onClick={stopWebcam}
                    style={{ width: '100%', padding: '12px', borderRadius: 12, marginBottom: 14, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171', fontSize: 10, fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontFamily: 'Inter, sans-serif' }}
                  >
                    <X style={{ width: 13, height: 13 }} />
                    Stop Webcam
                  </button>
                )}

                {webcamSnapped && (
                  <div style={{ marginBottom: 14, padding: '8px 12px', background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.25)', borderRadius: 10, fontSize: 10, color: '#4ade80', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Check style={{ width: 12, height: 12 }} /> Webcam photo captured!
                  </div>
                )}

                {/* Separator */}
                <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.25)', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700, textAlign: 'center', marginBottom: 12 }}>— or choose a face model —</div>

                {/* Model grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
                  {MODEL_FACES.map(m => (
                    <button
                      key={m.id}
                      className={`face-model-btn ${(currentFaceImg === m.url && !userUploadedImage && !webcamSnapped) ? 'active' : ''}`}
                      onClick={() => { setFaceImage(m.url); setUserUploadedImage(null); setWebcamSnapped(null); stopWebcam(); }}
                    >
                      <img src={m.url} alt={m.name} style={{ width: '100%', height: 76, objectFit: 'cover', objectPosition: 'top center', display: 'block' }} />
                      <div style={{ background: 'rgba(0,0,0,0.8)', color: 'white', fontSize: 8, fontWeight: 800, textAlign: 'center', padding: '4px 4px', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                        {m.name}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* ── Mode Switcher ── */}
              <div className="mode-tab-bar">
                <button className={`mode-tab ${!useProductFrame ? 'active' : ''}`} onClick={() => setUseProductFrame(false)}>
                  <Sparkles style={{ width: 11, height: 11 }} /> Custom SVG Shapes
                </button>
                <button className={`mode-tab ${useProductFrame ? 'active' : ''}`} onClick={() => setUseProductFrame(true)}>
                  <ShoppingBag style={{ width: 11, height: 11 }} /> Catalog Products
                </button>
              </div>

              {!useProductFrame ? (
                <>
                  {/* ── 2. Frame Style ── */}
                  <div className="glass-card" style={{ padding: 22 }}>
                    <div className="section-label">
                      <Eye style={{ width: 12, height: 12 }} />
                      2. Frame Style
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 7, maxHeight: 280, overflowY: 'auto' }} className="scrollbar-thin">
                      {SVG_FRAMES.map(frame => (
                        <button
                          key={frame.id}
                          className={`frame-option ${selectedFrame.id === frame.id ? 'active' : ''}`}
                          onClick={() => { setSelectedFrame(frame); setFrameColor(frame.color); }}
                        >
                          <img
                            src={`data:image/svg+xml;charset=utf-8,${encodeURIComponent(frame.svg(frame.color, 0.3))}`}
                            alt={frame.name}
                            style={{ width: 72, height: 26, objectFit: 'contain', flexShrink: 0 }}
                          />
                          <span style={{ fontSize: 12, fontWeight: 700, color: selectedFrame.id === frame.id ? '#C5A028' : 'rgba(255,255,255,0.6)', flex: 1, textAlign: 'left' }}>
                            {frame.name}
                          </span>
                          {selectedFrame.id === frame.id && <Check style={{ width: 13, height: 13, color: '#C5A028', flexShrink: 0 }} />}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* ── 3. Frame Color ── */}
                  <div className="glass-card" style={{ padding: 22 }}>
                    <div className="section-label">
                      <Sliders style={{ width: 12, height: 12 }} />
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
                    <div style={{ marginTop: 12, fontSize: 10, color: 'rgba(255,255,255,0.3)', fontWeight: 600 }}>
                      Selected: <span style={{ color: '#C5A028', fontWeight: 800 }}>{FRAME_COLORS.find(c => c.value === frameColor)?.name || 'Custom'}</span>
                    </div>
                  </div>
                </>
              ) : (
                /* ── Catalog Products ── */
                <div className="glass-card" style={{ padding: 22 }}>
                  <div className="section-label">
                    <ShoppingBag style={{ width: 12, height: 12 }} />
                    2. Select Catalog Eyewear
                  </div>
                  <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', marginBottom: 14, lineHeight: 1.5 }}>
                    Background is removed automatically. Adjust tolerance slider to fine-tune.
                  </div>

                  {/* BG removal status */}
                  {bgRemoving && (
                    <div className="bg-remove-indicator processing">
                      <RefreshCw style={{ width: 12, height: 12, animation: 'spin 0.8s linear infinite', flexShrink: 0 }} />
                      Removing background from product image...
                    </div>
                  )}
                  {bgRemovedUrl && !bgRemoving && (
                    <div className="bg-remove-indicator done">
                      <Check style={{ width: 12, height: 12, flexShrink: 0 }} />
                      Background removed — glasses floating on your face!
                    </div>
                  )}
                  {bgRemoveError && !bgRemoving && (
                    <div className="bg-remove-indicator error">
                      ⚠ {bgRemoveError}
                    </div>
                  )}

                  {loadingProducts ? (
                    <div style={{ textAlign: 'center', padding: '24px 0' }}>
                      <RefreshCw style={{ width: 22, height: 22, color: '#C5A028', animation: 'spin 1s linear infinite', margin: '0 auto 8px', display: 'block' }} />
                      <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)' }}>Loading catalog...</div>
                    </div>
                  ) : products.length === 0 ? (
                    <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', textAlign: 'center', padding: '14px 0' }}>No products available.</div>
                  ) : (
                    <div style={{ maxHeight: 340, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 7, paddingRight: 2 }} className="scrollbar-thin">
                      {products.map(p => {
                        let img = p.image_urls;
                        if (Array.isArray(img)) img = img[0];
                        else if (typeof img === 'string' && img.startsWith('[')) { try { img = JSON.parse(img)[0]; } catch (_) {} }
                        const isSelected = selectedProduct && selectedProduct.id === p.id;
                        return (
                          <button
                            key={p.id}
                            className={`product-frame-row ${isSelected ? 'active' : ''}`}
                            onClick={() => setSelectedProduct(p)}
                          >
                            <div style={{ position: 'relative', flexShrink: 0 }}>
                              <img src={img} alt={p.name} style={{ width: 48, height: 36, objectFit: 'contain', borderRadius: 8, background: 'rgba(255,255,255,0.08)', padding: 4, display: 'block' }} />
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ fontSize: 11, fontWeight: 700, color: isSelected ? '#C5A028' : 'rgba(255,255,255,0.75)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</div>
                              <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.06em', marginTop: 2 }}>{p.frame_shape} • {p.category}</div>
                            </div>
                            <div style={{ fontSize: 12, fontWeight: 800, color: '#C5A028', flexShrink: 0 }}>₹{parseFloat(p.price).toLocaleString('en-IN')}</div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* ── View Product / BG Preview ── */}
              {useProductFrame && selectedProduct && (
                <div style={{ display: 'flex', gap: 10 }}>
                  <Link
                    href={`/product/${selectedProduct.id}`}
                    style={{ flex: 1, textDecoration: 'none', textAlign: 'center', padding: '13px', borderRadius: 12, background: 'linear-gradient(135deg, #C5A028, #e8c547)', color: '#0a0a0a', fontSize: 10.5, fontWeight: 800, letterSpacing: '0.09em', textTransform: 'uppercase', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7 }}
                  >
                    <ShoppingBag style={{ width: 14, height: 14 }} />
                    View & Buy This Frame
                  </Link>
                </div>
              )}

              {/* ── Tips card ── */}
              <div style={{ padding: '16px 18px', background: 'rgba(197,160,40,0.04)', border: '1px solid rgba(197,160,40,0.12)', borderRadius: 16 }}>
                <div style={{ fontSize: 9, fontWeight: 900, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(197,160,40,0.6)', marginBottom: 10 }}>
                  💡 Pro Tips
                </div>
                {[
                  'Hit AI Auto-Fit for instant eye alignment',
                  'Use Mirror mode to see it like a real mirror',
                  'Drag the Split bar to compare before/after',
                  'Webcam snap = best real-time try-on experience',
                  useProductFrame ? 'Adjust tolerance if background bleeds through' : 'Lens tint slider controls transparency',
                ].map((tip, i) => (
                  <div key={i} style={{ fontSize: 10, color: 'rgba(255,255,255,0.45)', padding: '5px 0', borderBottom: i < 4 ? '1px solid rgba(255,255,255,0.04)' : 'none', fontWeight: 500, display: 'flex', alignItems: 'flex-start', gap: 6 }}>
                    <span style={{ color: '#C5A028', fontWeight: 800, flexShrink: 0 }}>→</span>
                    {tip}
                  </div>
                ))}
              </div>

            </div>
          </div>
        </div>
      </div>
    </>
  );
}
