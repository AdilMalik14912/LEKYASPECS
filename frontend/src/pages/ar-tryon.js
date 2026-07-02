import React, { useState, useRef, useEffect, useCallback } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { Camera, RefreshCw, Sparkles, Download, Video, Eye, Sliders } from 'lucide-react';

// ──────────────────────────────────────────────────────────────────────────────
// AR Try-On: Loads face-api.js from CDN, runs real-time face landmark detection
// on the live webcam feed every animation frame, and draws custom SVG frames on
// the user's face using the detected eye / nose / jaw positions — NO backend.
// ──────────────────────────────────────────────────────────────────────────────

const FRAME_SHAPES = [
  { id: 'wayfarer',   label: 'Wayfarer',   icon: '⬛' },
  { id: 'round',      label: 'Round',      icon: '⭕' },
  { id: 'aviator',    label: 'Aviator',    icon: '🔽' },
  { id: 'catEye',     label: 'Cat-Eye',    icon: '🐱' },
  { id: 'rectangle',  label: 'Rectangle',  icon: '▬' },
  { id: 'hexagonal',  label: 'Hexagonal',  icon: '⬡' },
];

const FRAME_COLORS = [
  { name: 'Onyx',         hex: '#1C1C1E', lens: 'rgba(30,30,30,0.65)' },
  { name: 'Gold',         hex: '#D4AF37', lens: 'rgba(212,175,55,0.50)' },
  { name: 'Rose Gold',    hex: '#B76E79', lens: 'rgba(183,110,121,0.50)' },
  { name: 'Crystal',      hex: '#9BA8B5', lens: 'rgba(155,168,181,0.40)' },
  { name: 'Ocean Blue',   hex: '#005F99', lens: 'rgba(0,95,153,0.55)' },
  { name: 'Forest',       hex: '#2D6A4F', lens: 'rgba(45,106,79,0.50)' },
];

// Draw the selected frame shape on the canvas at the detected eye positions
function drawFrameOnCanvas(ctx, leftEye, rightEye, shape, color, lensColor) {
  const eyeW   = Math.abs(rightEye.x - leftEye.x);
  const eyeMidX = (leftEye.x + rightEye.x) / 2;
  const eyeMidY = (leftEye.y + rightEye.y) / 2;
  const lensR  = eyeW * 0.36;        // radius of each lens
  const sep    = eyeW * 0.08;         // bridge gap

  ctx.save();
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  const leftCX  = leftEye.x;
  const rightCX = rightEye.x;
  const cy      = eyeMidY;
  const lW      = lensR * 2.2;  // lens width
  const lH      = lensR * 1.5;  // lens height

  const drawLens = (cx, w, h, ry, flip) => {
    ctx.save();
    ctx.translate(cx, cy);
    if (flip) ctx.scale(-1, 1);
    ctx.beginPath();

    if (shape === 'round') {
      ctx.arc(0, 0, lensR, 0, Math.PI * 2);
    } else if (shape === 'wayfarer') {
      const r = lensR * 0.3;
      ctx.moveTo(-w/2 + r, -h/2);
      ctx.arcTo(w/2, -h/2, w/2, h/2, r*0.5);
      ctx.arcTo(w/2, h/2, -w/2, h/2, r);
      ctx.arcTo(-w/2, h/2, -w/2, -h/2 + r*2, r);
      ctx.arcTo(-w/2, -h/2, w/2, -h/2, r);
      ctx.closePath();
    } else if (shape === 'aviator') {
      ctx.moveTo(-w/2, -h/2);
      ctx.lineTo(w/2, -h/2);
      ctx.bezierCurveTo(w/2+lensR*0.3, h*0.1, w/2+lensR*0.3, h/2, 0, h/2);
      ctx.bezierCurveTo(-w/2-lensR*0.3, h/2, -w/2-lensR*0.3, h*0.1, -w/2, -h/2);
      ctx.closePath();
    } else if (shape === 'catEye') {
      ctx.moveTo(-w/2, 0);
      ctx.bezierCurveTo(-w/2, -h, 0, -h*1.3, w/2, -h*0.5);
      ctx.bezierCurveTo(w/2+lensR*0.2, 0, w/2, h/2, 0, h/2);
      ctx.bezierCurveTo(-w/2, h/2, -w/2, h/2, -w/2, 0);
      ctx.closePath();
    } else if (shape === 'rectangle') {
      const r = lensR * 0.15;
      ctx.moveTo(-w/2+r, -h/2);
      ctx.lineTo(w/2-r, -h/2);
      ctx.arcTo(w/2, -h/2, w/2, h/2, r);
      ctx.lineTo(w/2, h/2-r);
      ctx.arcTo(w/2, h/2, -w/2, h/2, r);
      ctx.lineTo(-w/2+r, h/2);
      ctx.arcTo(-w/2, h/2, -w/2, -h/2, r);
      ctx.lineTo(-w/2, -h/2+r);
      ctx.arcTo(-w/2, -h/2, w/2, -h/2, r);
      ctx.closePath();
    } else if (shape === 'hexagonal') {
      const pts = 6;
      for (let i = 0; i < pts; i++) {
        const angle = (Math.PI / 3) * i - Math.PI / 2;
        const px = Math.cos(angle) * w/2;
        const py = Math.sin(angle) * h/2;
        if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
      }
      ctx.closePath();
    }

    // Lens fill
    ctx.fillStyle = lensColor;
    ctx.fill();
    // Frame stroke
    ctx.strokeStyle = color;
    ctx.lineWidth = lensR * 0.13;
    ctx.stroke();
    // Glare
    ctx.globalAlpha = 0.25;
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = lensR * 0.07;
    ctx.beginPath();
    ctx.moveTo(-w * 0.2, -h * 0.3);
    ctx.quadraticCurveTo(w * 0.15, -h * 0.2, w * 0.3, -h * 0.1);
    ctx.stroke();
    ctx.globalAlpha = 1;

    ctx.restore();
  };

  drawLens(leftCX, lW, lH);
  drawLens(rightCX, lW, lH);

  // Bridge
  ctx.beginPath();
  ctx.strokeStyle = color;
  ctx.lineWidth = lensR * 0.1;
  ctx.moveTo(leftCX + lW / 2, cy);
  ctx.quadraticCurveTo(eyeMidX, cy - lensR * 0.2, rightCX - lW / 2, cy);
  ctx.stroke();

  // Temples (arms)
  ctx.beginPath();
  ctx.strokeStyle = color;
  ctx.lineWidth = lensR * 0.1;
  ctx.moveTo(leftCX - lW / 2, cy);
  ctx.lineTo(leftCX - lW * 1.2, cy - lensR * 0.2);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(rightCX + lW / 2, cy);
  ctx.lineTo(rightCX + lW * 1.2, cy - lensR * 0.2);
  ctx.stroke();

  ctx.restore();
}

export default function ARTryOn() {
  const videoRef     = useRef(null);
  const canvasRef    = useRef(null);
  const animFrameRef = useRef(null);
  const faceapiRef   = useRef(null);

  const [selectedShape, setSelectedShape] = useState('wayfarer');
  const [selectedColor, setSelectedColor] = useState(FRAME_COLORS[0]);
  const [status, setStatus]               = useState('initializing'); // 'initializing' | 'loading' | 'running' | 'error'
  const [statusMsg, setStatusMsg]         = useState('Starting camera…');
  const [fpsCount, setFpsCount]           = useState(0);
  const [faceFound, setFaceFound]         = useState(false);
  const [showMesh, setShowMesh]           = useState(false);
  const [captured, setCaptured]           = useState(null);

  const MODEL_URL = 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model';
  const shapeRef    = useRef(selectedShape);
  const colorRef    = useRef(selectedColor);
  const showMeshRef = useRef(false);

  useEffect(() => { shapeRef.current = selectedShape; }, [selectedShape]);
  useEffect(() => { colorRef.current = selectedColor; }, [selectedColor]);
  useEffect(() => { showMeshRef.current = showMesh; }, [showMesh]);

  // ── Load face-api.js from CDN ──────────────────────────────────────────────
  const loadFaceApi = useCallback(() => new Promise((resolve, reject) => {
    if (window.faceapi) { resolve(window.faceapi); return; }
    const s = document.createElement('script');
    s.src = 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api/dist/face-api.js';
    s.onload = () => resolve(window.faceapi);
    s.onerror = reject;
    document.head.appendChild(s);
  }), []);

  // ── Main boot sequence ─────────────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        // 1. Start webcam
        setStatusMsg('Requesting camera access…');
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 640, height: 480, facingMode: 'user' },
          audio: false
        });
        if (cancelled) { stream.getTracks().forEach(t => t.stop()); return; }
        videoRef.current.srcObject = stream;
        await new Promise(r => { videoRef.current.onloadedmetadata = r; });
        videoRef.current.play();

        // 2. Load library
        setStatus('loading');
        setStatusMsg('Loading face-api.js neural net from CDN…');
        const faceapi = await loadFaceApi();
        faceapiRef.current = faceapi;

        // 3. Load models
        setStatusMsg('Downloading TinyFace + Landmark68 models…');
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
          faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
        ]);
        if (cancelled) return;

        setStatus('running');
        setStatusMsg('Running — face your camera!');

        // 4. Detection loop — FAST architecture:
        //    RAF runs at 60fps drawing video + last-known glasses position.
        //    AI detection runs in background (never blocks RAF).
        let lastT = performance.now();
        let fpsAcc = 0, fpsFrames = 0;
        // inputSize 160 = fastest TinyFaceDetector setting (vs 320 = 4× slower)
        const OPTIONS = new faceapi.TinyFaceDetectorOptions({ scoreThreshold: 0.25, inputSize: 160 });
        const canvas  = canvasRef.current;
        const video   = videoRef.current;
        const ctx     = canvas.getContext('2d', { willReadFrequently: true });

        // Cache last detection result — glasses are drawn from this every frame
        let lastLm = null;
        let detectionRunning = false;

        // ── Background detection (fires independently of RAF) ──────────────
        const runDetection = async () => {
          if (detectionRunning || cancelled) return;
          detectionRunning = true;
          try {
            const result = await faceapi
              .detectSingleFace(canvas, OPTIONS)
              .withFaceLandmarks();
            lastLm = result ? result.landmarks.positions : null;
            setFaceFound(!!lastLm);
          } catch (_) { /* silent */ } finally {
            detectionRunning = false;
          }
        };

        // Run detection every 80ms (~12 times/sec) — enough for smooth glasses
        const detectionInterval = setInterval(runDetection, 80);

        // ── Render loop (runs at full 60fps) ──────────────────────────────
        const loop = () => {
          if (cancelled) return;

          const t  = performance.now();
          const dt = t - lastT; lastT = t;
          fpsAcc += 1000 / dt; fpsFrames++;
          if (fpsFrames >= 20) {
            setFpsCount(Math.round(fpsAcc / fpsFrames));
            fpsAcc = 0; fpsFrames = 0;
          }

          const vw = video.videoWidth  || 640;
          const vh = video.videoHeight || 480;
          if (canvas.width !== vw)  canvas.width  = vw;
          if (canvas.height !== vh) canvas.height = vh;

          // Mirrored video frame
          ctx.save();
          ctx.translate(vw, 0);
          ctx.scale(-1, 1);
          ctx.drawImage(video, 0, 0, vw, vh);
          ctx.restore();

          // Draw glasses from last known landmarks (never waits for AI)
          if (lastLm) {
            const eyeAvg = (s, e) => {
              let x = 0, y = 0;
              for (let i = s; i <= e; i++) { x += lastLm[i].x; y += lastLm[i].y; }
              const n = e - s + 1;
              return { x: x / n, y: y / n };
            };
            const leftEye  = eyeAvg(42, 47); // mirrored: appears as left
            const rightEye = eyeAvg(36, 41);

            // Draw wireframe mesh if toggled
            if (showMeshRef.current) {
              ctx.strokeStyle = 'rgba(197,168,128,0.55)';
              ctx.lineWidth = 1;
              ctx.beginPath();
              for (let i = 0; i <= 16; i++) {
                const p = lastLm[i];
                if (i === 0) ctx.moveTo(vw - p.x, p.y);
                else ctx.lineTo(vw - p.x, p.y);
              }
              ctx.stroke();
            }

            drawFrameOnCanvas(
              ctx,
              { x: vw - leftEye.x,  y: leftEye.y  },
              { x: vw - rightEye.x, y: rightEye.y },
              shapeRef.current,
              colorRef.current.hex,
              colorRef.current.lens
            );
          }

          animFrameRef.current = requestAnimationFrame(loop);
        };

        // Store interval so cleanup can clear it
        animFrameRef.intervalId = detectionInterval;
        loop();
      } catch (err) {
        console.error(err);
        setStatus('error');
        setStatusMsg(`Error: ${err.message}`);
      }
    })();

    return () => {
      cancelled = true;
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      if (animFrameRef.intervalId) clearInterval(animFrameRef.intervalId);
      if (videoRef.current?.srcObject) {
        videoRef.current.srcObject.getTracks().forEach(t => t.stop());
      }
    };
  }, []);

  // Capture snapshot
  const captureSnapshot = () => {
    if (canvasRef.current) {
      setCaptured(canvasRef.current.toDataURL('image/png'));
    }
  };

  const downloadCapture = () => {
    if (!captured) return;
    const a = document.createElement('a');
    a.href = captured;
    a.download = 'lekya-specs-tryon.png';
    a.click();
  };

  return (
    <>
      <Head>
        <title>Live AR Try-On — Lekya Specs</title>
        <meta name="description" content="Try on premium eyewear in real-time using your webcam. AI-powered face landmark detection places frames perfectly on your face." />
      </Head>

      <div className="min-h-screen bg-[#0A0A0F] text-white">
        {/* Top hero bar */}
        <div className="pt-20 pb-6 px-4 sm:px-8 text-center">
          <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-widest text-premium-accent font-bold bg-premium-accent/10 border border-premium-accent/20 px-3 py-1 rounded-full mb-3">
            <Sparkles className="w-3 h-3" /> Lekya AR
          </span>
          <h1 className="font-serif text-3xl sm:text-5xl font-bold text-white tracking-tight">
            Live <span className="text-premium-accent">AR Try-On</span>
          </h1>
          <p className="text-gray-400 text-sm font-light mt-2 max-w-lg mx-auto">
            Real-time face landmark detection renders your chosen frames directly on your live webcam feed using a 68-point neural mesh.
          </p>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 flex flex-col lg:flex-row gap-8">

          {/* ── CAMERA VIEW ────────────────────────────────────────────────── */}
          <div className="flex-1 space-y-4">
            <div className="relative rounded-2xl overflow-hidden bg-[#111118] border border-white/10 shadow-2xl aspect-[4/3] w-full flex items-center justify-center">
              {/* Hidden source video */}
              <video ref={videoRef} className="hidden" playsInline muted />

              {/* The canvas receives video + AR overlay */}
              <canvas ref={canvasRef} className="w-full h-full object-cover" />

              {/* Status overlay */}
              {status !== 'running' && (
                <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center gap-4">
                  <div className="w-12 h-12 border-4 border-premium-accent/20 border-t-premium-accent rounded-full animate-spin" />
                  <p className="text-premium-accent text-xs font-bold tracking-widest uppercase text-center px-6">{statusMsg}</p>
                  {status === 'error' && (
                    <p className="text-red-400 text-xs mt-2 px-8 text-center">{statusMsg}</p>
                  )}
                </div>
              )}

              {/* HUD: FPS + Face indicator */}
              {status === 'running' && (
                <div className="absolute top-3 left-3 flex gap-2">
                  <span className="text-[10px] font-mono bg-black/70 text-green-400 px-2 py-0.5 rounded border border-green-500/20">
                    {fpsCount} FPS
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${faceFound ? 'bg-black/70 text-premium-accent border-premium-accent/20' : 'bg-black/70 text-red-400 border-red-500/20'}`}>
                    {faceFound ? '● FACE LOCKED' : '○ NO FACE'}
                  </span>
                </div>
              )}

              {/* Controls top right */}
              <div className="absolute top-3 right-3 flex gap-2">
                <button
                  onClick={() => setShowMesh(!showMesh)}
                  className={`p-2 rounded-lg border text-xs font-bold transition-all ${showMesh ? 'bg-premium-accent text-premium-black border-premium-accent' : 'bg-black/70 text-white border-white/10'}`}
                  title="Toggle Mesh"
                >
                  <Eye className="w-4 h-4" />
                </button>
                <button
                  onClick={captureSnapshot}
                  className="p-2 rounded-lg bg-black/70 border border-white/10 text-white hover:bg-premium-accent hover:text-premium-black hover:border-premium-accent transition-all"
                  title="Take Snapshot"
                >
                  <Camera className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Snapshot preview */}
            {captured && (
              <div className="bg-[#111118] border border-white/10 rounded-2xl p-4 space-y-3">
                <p className="text-xs font-bold uppercase tracking-wider text-premium-accent">📸 Captured Snapshot</p>
                <img src={captured} alt="AR snapshot" className="w-full rounded-lg" />
                <div className="flex gap-3">
                  <button onClick={downloadCapture} className="flex-1 flex items-center justify-center gap-2 bg-premium-accent hover:bg-premium-golddark text-premium-black font-bold text-xs uppercase tracking-wider py-2.5 rounded-lg transition-all">
                    <Download className="w-3.5 h-3.5" /> Download Image
                  </button>
                  <button onClick={() => setCaptured(null)} className="px-4 border border-white/10 text-gray-400 hover:border-red-500 hover:text-red-400 text-xs font-bold rounded-lg transition-all">
                    Clear
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* ── CONTROLS PANEL ──────────────────────────────────────────────── */}
          <div className="w-full lg:w-80 space-y-5">

            {/* Frame shape picker */}
            <div className="bg-[#111118] border border-white/10 rounded-2xl p-5 space-y-4">
              <h3 className="text-xs uppercase tracking-wider font-bold text-premium-accent flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5" /> Frame Silhouette
              </h3>
              <div className="grid grid-cols-3 gap-2">
                {FRAME_SHAPES.map(s => (
                  <button
                    key={s.id}
                    onClick={() => setSelectedShape(s.id)}
                    className={`flex flex-col items-center gap-1 py-3 px-2 rounded-xl border text-xs font-bold transition-all ${
                      selectedShape === s.id
                        ? 'border-premium-accent bg-premium-accent/10 text-premium-accent'
                        : 'border-white/10 text-gray-400 hover:border-premium-accent/40'
                    }`}
                  >
                    <span className="text-lg">{s.icon}</span>
                    <span>{s.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Color picker */}
            <div className="bg-[#111118] border border-white/10 rounded-2xl p-5 space-y-4">
              <h3 className="text-xs uppercase tracking-wider font-bold text-premium-accent">Frame Finish</h3>
              <div className="grid grid-cols-2 gap-2">
                {FRAME_COLORS.map(c => (
                  <button
                    key={c.name}
                    onClick={() => setSelectedColor(c)}
                    className={`flex items-center gap-2.5 p-3 rounded-xl border text-xs font-semibold transition-all ${
                      selectedColor.name === c.name
                        ? 'border-premium-accent bg-premium-accent/10 text-premium-accent'
                        : 'border-white/10 text-gray-400 hover:border-premium-accent/40'
                    }`}
                  >
                    <span className="w-4 h-4 rounded-full border border-white/20 shrink-0" style={{ backgroundColor: c.hex }} />
                    {c.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Tips */}
            <div className="bg-[#111118] border border-white/10 rounded-2xl p-5 space-y-3 text-xs text-gray-400">
              <h3 className="text-xs uppercase tracking-wider font-bold text-premium-accent">💡 Tips</h3>
              <ul className="space-y-2 list-none">
                {[
                  'Face your camera with neutral lighting',
                  'Sit about 60cm from screen for best detection',
                  'Toggle "Mesh" to see live landmark overlay',
                  'Snapshot saves your try-on to your device',
                ].map(t => <li key={t} className="flex gap-2"><span className="text-premium-accent shrink-0">›</span>{t}</li>)}
              </ul>
              <Link href="/customizer" className="mt-4 w-full flex items-center justify-center gap-2 border border-premium-accent/30 text-premium-accent font-bold uppercase tracking-wider text-[10px] py-2.5 rounded-lg hover:bg-premium-accent hover:text-premium-black transition-all">
                Open Bespoke Customizer →
              </Link>
            </div>

          </div>
        </div>
      </div>
    </>
  );
}
