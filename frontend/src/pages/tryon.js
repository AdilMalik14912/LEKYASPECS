const React = require('react');
const { useState, useEffect, useRef } = React;
const Link = require('next/link').default;
const Head = require('next/head').default;
const { Upload, Sliders, RotateCw, Move, Check, Download, ArrowLeft, RefreshCw, ZoomIn, ZoomOut } = require('lucide-react');

const API_BASE = typeof window !== 'undefined'
  ? (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' ? 'http://localhost:5000' : '')
  : '';

const MODEL_FACES = [
  { name: 'Model 1 (Oval)', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=600&h=600' },
  { name: 'Model 2 (Round)', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=600&h=600' },
  { name: 'Model 3 (Square)', url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=600&h=600' },
  { name: 'Model 4 (Heart)', url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=600&h=600' },
];

export default function TryOnStudio() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Studio canvas settings
  const [faceImage, setFaceImage] = useState(MODEL_FACES[0].url);
  const [glassesScale, setGlassesScale] = useState(1);
  const [glassesX, setGlassesX] = useState(0);
  const [glassesY, setGlassesY] = useState(0);
  const [glassesRotation, setGlassesRotation] = useState(0);

  const canvasRef = useRef(null);

  // Fetch product catalog for glasses overlay
  useEffect(() => {
    fetch(`${API_BASE}/api/products`)
      .then(res => res.json())
      .then(data => {
        setProducts(data);
        if (data.length > 0) {
          setSelectedProduct(data[0]);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  // Drawing method to combine portrait + glasses overlay
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw Portrait image
    const faceImg = new Image();
    faceImg.crossOrigin = 'anonymous';
    faceImg.src = faceImage;
    faceImg.onload = () => {
      ctx.drawImage(faceImg, 0, 0, canvas.width, canvas.height);

      // Draw Selected Glasses overlay
      if (selectedProduct) {
        let glassesUrl = selectedProduct.image_urls;
        if (Array.isArray(glassesUrl)) glassesUrl = glassesUrl[0];
        else if (typeof glassesUrl === 'string' && glassesUrl.startsWith('[')) {
          try { glassesUrl = JSON.parse(glassesUrl)[0]; } catch (_) {}
        }

        const glassesImg = new Image();
        glassesImg.crossOrigin = 'anonymous';
        glassesImg.src = glassesUrl;
        glassesImg.onload = () => {
          ctx.save();
          // Position translation (default center of canvas is width/2, height/2.5)
          const baseCX = canvas.width / 2 + glassesX;
          const baseCY = canvas.height / 2.6 + glassesY;
          ctx.translate(baseCX, baseCY);
          ctx.rotate((glassesRotation * Math.PI) / 180);

          // Calculate dimensions
          const gWidth = canvas.width * 0.45 * glassesScale;
          const gHeight = (gWidth * glassesImg.height) / glassesImg.width;

          // Draw image centered on base coordinates
          ctx.drawImage(glassesImg, -gWidth / 2, -gHeight / 2, gWidth, gHeight);
          ctx.restore();
        };
      }
    };
  }, [faceImage, selectedProduct, glassesScale, glassesX, glassesY, glassesRotation]);

  // Handle portrait file upload
  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setFaceImage(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Download finished try-on image
  const downloadTryon = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.href = canvas.toDataURL('image/png');
    link.download = `tryon_specs_${selectedProduct ? selectedProduct.name.replace(/\s+/g, '_') : 'eyewear'}.png`;
    link.click();
  };

  const resetAdjustments = () => {
    setGlassesScale(1);
    setGlassesX(0);
    setGlassesY(0);
    setGlassesRotation(0);
  };

  return (
    <>
      <Head>
        <title>2D Virtual Try-On Studio — Lekya Specs</title>
        <meta name="description" content="Upload your portrait or choose face models to visually adjust and find the perfect eyewear shape." />
      </Head>

      <div className="bg-premium-light min-h-screen py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <Link href="/shop" className="p-2 bg-white border rounded-full hover:bg-premium-light hover:text-premium-accent transition-all shadow-sm">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="font-serif text-3xl font-bold text-premium-black">2D Virtual Try-On Studio</h1>
              <p className="text-xs text-premium-gray">Upload a portrait or select face models to find your best fit.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

            {/* Left Col: Canvas view editor */}
            <div className="lg:col-span-7 flex flex-col items-center">
              <div className="relative bg-white border border-premium-border p-4 rounded-xl shadow-lg w-full max-w-[500px]">
                <canvas 
                  ref={canvasRef} 
                  width={500} 
                  height={500} 
                  className="w-full h-auto bg-premium-light border rounded-lg shadow-inner"
                />

                {/* Drag adjustments floating helpers */}
                <div className="absolute top-6 left-6 bg-premium-black/85 text-premium-accent text-[9px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-full backdrop-blur flex items-center gap-1">
                  <Move className="w-3.5 h-3.5" /> Adjustment Active
                </div>
              </div>

              {/* Adjustments Panel */}
              <div className="bg-white border border-premium-border rounded-xl p-6 mt-6 shadow-sm w-full max-w-[500px] space-y-4">
                <div className="flex items-center justify-between border-b border-premium-border pb-3">
                  <span className="font-bold text-xs uppercase tracking-wider text-premium-dark flex items-center gap-1.5">
                    <Sliders className="w-4 h-4 text-premium-accent" /> Fine-Tune Fit
                  </span>
                  <button 
                    onClick={resetAdjustments}
                    className="text-[10px] uppercase font-bold text-premium-gray hover:text-premium-accent flex items-center gap-1 transition-colors"
                  >
                    <RefreshCw className="w-3.5 h-3.5" /> Reset
                  </button>
                </div>

                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-xs font-semibold mb-1">
                      <span>Frame Size (Scale)</span>
                      <span className="text-premium-accent font-mono">{Math.round(glassesScale * 100)}%</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <ZoomOut className="w-4 h-4 text-premium-gray" />
                      <input 
                        type="range" 
                        min="0.5" 
                        max="1.5" 
                        step="0.01" 
                        value={glassesScale} 
                        onChange={(e) => setGlassesScale(parseFloat(e.target.value))}
                        className="w-full accent-premium-accent"
                      />
                      <ZoomIn className="w-4 h-4 text-premium-gray" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="block text-xs font-semibold mb-1">Horiz. Offset (X)</span>
                      <input 
                        type="range" 
                        min="-150" 
                        max="150" 
                        step="1" 
                        value={glassesX} 
                        onChange={(e) => setGlassesX(parseInt(e.target.value))}
                        className="w-full accent-premium-accent"
                      />
                    </div>
                    <div>
                      <span className="block text-xs font-semibold mb-1">Vert. Offset (Y)</span>
                      <input 
                        type="range" 
                        min="-150" 
                        max="150" 
                        step="1" 
                        value={glassesY} 
                        onChange={(e) => setGlassesY(parseInt(e.target.value))}
                        className="w-full accent-premium-accent"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-semibold mb-1">
                      <span>Frame Rotation Angle</span>
                      <span className="text-premium-accent font-mono">{glassesRotation}°</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <input 
                        type="range" 
                        min="-45" 
                        max="45" 
                        step="1" 
                        value={glassesRotation} 
                        onChange={(e) => setGlassesRotation(parseInt(e.target.value))}
                        className="w-full accent-premium-accent"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Col: Frame selection & models list */}
            <div className="lg:col-span-5 space-y-6">

              {/* Step 1: Model faces / Upload */}
              <div className="bg-white border border-premium-border rounded-xl p-6 shadow-sm">
                <h3 className="font-serif text-lg font-bold text-premium-black border-b border-premium-border pb-3 mb-4">
                  1. Choose Face Photo
                </h3>
                
                {/* File Upload Button */}
                <div className="mb-4">
                  <label className="border-2 border-dashed border-premium-border hover:border-premium-accent bg-premium-light/50 p-4 rounded-xl flex flex-col items-center justify-center cursor-pointer transition-all">
                    <Upload className="w-8 h-8 text-premium-accent mb-2" />
                    <span className="text-xs font-bold text-premium-dark uppercase tracking-wider">Upload My Portrait</span>
                    <span className="text-[10px] text-premium-gray mt-1">PNG, JPG formats supported</span>
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handlePhotoUpload} 
                      className="hidden" 
                    />
                  </label>
                </div>

                <div className="relative flex items-center justify-center my-4">
                  <hr className="w-full border-premium-border" />
                  <span className="absolute bg-white px-2.5 text-[9px] font-bold tracking-widest text-premium-gray uppercase">Or Use Face Models</span>
                </div>

                {/* Model Faces Grid */}
                <div className="grid grid-cols-4 gap-2">
                  {MODEL_FACES.map((m, idx) => (
                    <button
                      key={idx}
                      onClick={() => setFaceImage(m.url)}
                      className={`relative border-2 rounded-lg overflow-hidden h-16 transition-all ${
                        faceImage === m.url ? 'border-premium-accent scale-95 shadow-md' : 'border-premium-border hover:border-premium-accent/50'
                      }`}
                    >
                      <img src={m.url} alt={m.name} className="w-full h-full object-cover" />
                      <div className="absolute inset-x-0 bottom-0 bg-black/60 text-[8px] text-center text-white py-0.5 font-semibold leading-normal truncate">{m.name.split(' ')[1]}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Step 2: Glasses overlay list */}
              <div className="bg-white border border-premium-border rounded-xl p-6 shadow-sm">
                <h3 className="font-serif text-lg font-bold text-premium-black border-b border-premium-border pb-3 mb-4">
                  2. Select Eyewear Frame
                </h3>

                {loading ? (
                  <div className="text-center py-10"><RefreshCw className="w-8 h-8 text-premium-accent animate-spin mx-auto" /></div>
                ) : products.length === 0 ? (
                  <p className="text-xs text-premium-gray py-4">No eyewear catalog frames available.</p>
                ) : (
                  <div className="max-h-[300px] overflow-y-auto space-y-2 pr-1 divide-y divide-premium-border">
                    {products.map(p => {
                      let img = p.image_urls;
                      if (Array.isArray(img)) img = img[0];
                      else if (typeof img === 'string' && img.startsWith('[')) {
                        try { img = JSON.parse(img)[0]; } catch (_) {}
                      }
                      const isSelected = selectedProduct && selectedProduct.id === p.id;
                      return (
                        <button
                          key={p.id}
                          onClick={() => {
                            setSelectedProduct(p);
                            resetAdjustments();
                          }}
                          className={`w-full py-2.5 flex items-center justify-between text-left transition-colors ${
                            isSelected ? 'bg-premium-light/50 px-2 rounded-lg' : 'hover:bg-premium-light/30'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <img src={img} alt={p.name} className="w-10 h-10 object-contain bg-premium-light border rounded p-1" />
                            <div>
                              <span className="font-semibold text-xs text-premium-dark block leading-normal">{p.name}</span>
                              <span className="text-[9px] text-premium-gray uppercase font-bold tracking-wider">{p.frame_shape} • {p.category}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-xs">₹{parseFloat(p.price).toLocaleString('en-IN')}</span>
                            {isSelected && <Check className="w-4 h-4 text-premium-accent shrink-0" />}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Actions panel */}
              <div className="flex gap-4">
                <button
                  onClick={downloadTryon}
                  className="flex-grow bg-premium-black text-white hover:bg-premium-accent hover:text-premium-black font-semibold text-xs tracking-widest uppercase py-4 rounded-lg transition-all flex items-center justify-center gap-2 shadow"
                >
                  <Download className="w-4 h-4" /> Save Portrait
                </button>
                {selectedProduct && (
                  <Link
                    href={`/product/${selectedProduct.id}`}
                    className="border border-premium-border hover:border-premium-accent hover:text-premium-accent bg-white font-semibold text-xs tracking-widest uppercase py-4 px-6 rounded-lg text-center transition-all"
                  >
                    View Details
                  </Link>
                )}
              </div>

            </div>

          </div>

        </div>
      </div>
    </>
  );
}
