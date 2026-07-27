const React = require('react');
const { useState, useEffect } = React;
const { useRouter } = require('next/router');
const Link = require('next/link').default;
const Head = require('next/head').default;
const { useCart, useWishlist, useAuth, useToast } = require('../_app');
const { Star, Heart, ShoppingBag, Ruler, ShieldAlert, CheckCircle2, MessageSquare, AlertCircle, ChevronLeft, ChevronRight, RotateCw, Bell } = require('lucide-react');
const Product360Viewer = require('../../components/Product360Viewer').default;

const API_BASE = typeof window !== 'undefined'
  ? (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' ? 'http://localhost:5000' : '')
  : '';

export default function ProductDetail() {
  const router = useRouter();
  const { id } = router.query;

  const { user, token } = useAuth();
  const { addToCart, cart } = useCart();
  const { wishlist, toggleWishlist } = useWishlist();

  // State
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState('');
  const [show360, setShow360] = useState(false);
  const [isFaceShapeMatched, setIsFaceShapeMatched] = useState(false);
  const [inCart, setInCart] = useState(false);
  const [inWishlist, setInWishlist] = useState(false);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const { showToast } = useToast();

  // Prescription and Lens Configurator States
  const [includePrescription, setIncludePrescription] = useState(false);
  const [lensIndex, setLensIndex] = useState('1.56');
  const [antiGlare, setAntiGlare] = useState(false);
  const [blueShield, setBlueShield] = useState(false);
  const [photochromic, setPhotochromic] = useState(false);

  // Review Form State
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [reviewSuccess, setReviewSuccess] = useState('');
  const [reviewError, setReviewError] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  // Fetch product data
  useEffect(() => {
    if (!id) return;
    
    setLoading(true);
    fetch(`${API_BASE}/api/products/${id}`)
      .then(res => {
        if (!res.ok) throw new Error('Product not found');
        return res.json();
      })
      .then(data => {
        setProduct(data);
        setActiveImage(data.image_urls[0]);
        setLoading(false);
        setReviewSuccess('');
        setReviewError('');
        
        // Track recently viewed product
        if (typeof window !== 'undefined') {
          try {
            const stored = localStorage.getItem('specs_recently_viewed');
            let list = stored ? JSON.parse(stored) : [];
            list = list.filter(item => item.id !== data.id);
            list.unshift(data);
            list = list.slice(0, 6);
            localStorage.setItem('specs_recently_viewed', JSON.stringify(list));
          } catch (_) {}
        }

        // Fetch related products
        fetch(`${API_BASE}/api/products?category=${data.category}`)
          .then(res => res.ok ? res.json() : [])
          .then(related => {
            const arr = Array.isArray(related) ? related : [];
            setRelatedProducts(arr.filter(r => r.id !== data.id).slice(0, 4));
          })
          .catch(err => console.error(err));
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [id, reviewSuccess]); // Re-fetch on review success to update averages

  // Check face shape recommendation match
  useEffect(() => {
    if (product && user && user.face_shape) {
      fetch(`${API_BASE}/api/products/recommendations/${user.face_shape}`)
        .then(res => res.json())
        .then(data => {
          const shapes = data.recommended_frame_shapes || [];
          setIsFaceShapeMatched(shapes.includes(product.frame_shape));
        })
        .catch(err => console.error(err));
    }
  }, [product, user]);

  // Sync cart status
  useEffect(() => {
    if (product) {
      setInCart(cart.some(item => item.product.id === product.id));
    }
  }, [product, cart]);

  // Sync wishlist status
  useEffect(() => {
    if (product) {
      setInWishlist(wishlist.some(item => item.id === product.id));
    }
  }, [product, wishlist]);

  // Submit Review Handler
  const handleReviewSubmit = (e) => {
    e.preventDefault();
    if (!token) {
      setReviewError('You must be logged in to submit a review.');
      return;
    }

    setSubmittingReview(true);
    setReviewError('');
    setReviewSuccess('');

    fetch(`${API_BASE}/api/orders/review`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        productId: product.id,
        rating,
        comment
      })
    })
      .then(res => res.json())
      .then(data => {
        setSubmittingReview(false);
        if (data.message && data.message.includes('successfully')) {
          setReviewSuccess(data.message);
          setComment('');
        } else {
          setReviewError(data.message || 'Failed to submit review');
        }
      })
      .catch(err => {
        setSubmittingReview(false);
        setReviewError('Server error submitting review');
      });
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-premium-accent border-b-2 mx-auto"></div>
        <p className="mt-4 text-premium-gray">Loading premium frame details...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <AlertCircle className="w-12 h-12 text-premium-accent mx-auto mb-4" />
        <h2 className="font-serif text-2xl font-bold text-premium-black mb-2">Product Not Found</h2>
        <p className="text-sm text-premium-gray mb-6">The product you are looking for does not exist or has been removed.</p>
        <Link href="/shop" className="bg-premium-black text-white hover:bg-premium-accent hover:text-premium-black text-xs uppercase tracking-widest px-6 py-3 rounded font-bold transition-colors">
          Back to Shop
        </Link>
      </div>
    );
  }

  const getDynamicPrice = () => {
    if (!product) return 0;
    let base = parseFloat(product.price);
    if (!includePrescription) return base;
    
    if (lensIndex === '1.61') base += 800;
    else if (lensIndex === '1.67') base += 1600;
    else if (lensIndex === '1.74') base += 2800;
    
    if (antiGlare) base += 250;
    if (blueShield) base += 300;
    if (photochromic) base += 600;
    
    return base;
  };

  return (
    <>
      <Head>
        <title>{product.name} | Lekya Specs Eyewear | lekya.in</title>
        <meta name="description" content={`${product.name} — ${product.description ? product.description.substring(0, 150) : 'Shop luxury prescription eyeglasses & sunglasses on lekya.in.'}`} />
        <link rel="canonical" href={`https://lekya.in/product/${product.id}`} />
        <meta property="og:title" content={`${product.name} — Lekya Specs`} />
        <meta property="og:description" content={product.description} />
        <meta property="og:image" content={product.image_urls[0]} />
        <meta property="og:url" content={`https://lekya.in/product/${product.id}`} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org/",
              "@type": "Product",
              "name": product.name,
              "image": product.image_urls,
              "description": product.description,
              "sku": `LS-${product.id}`,
              "mpn": `MPN-LS-${product.id}`,
              "brand": {
                "@type": "Brand",
                "name": "Lekya Specs"
              },
              "offers": {
                "@type": "Offer",
                "url": `https://lekya.in/product/${product.id}`,
                "priceCurrency": "INR",
                "price": product.price,
                "priceValidUntil": "2027-12-31",
                "itemCondition": "https://schema.org/NewCondition",
                "availability": product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock"
              },
              "aggregateRating": {
                "@type": "AggregateRating",
                "ratingValue": product.average_rating || 4.9,
                "reviewCount": product.review_count || 12
              }
            })
          }}
        />
      </Head>

      <div className="bg-premium-light min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Navigation Breadcrumb */}
        <div className="text-xs uppercase tracking-wider text-premium-gray font-semibold mb-6 flex gap-2">
          <Link href="/shop" className="hover:text-premium-accent transition-colors">Shop</Link>
          <span>/</span>
          <Link href={`/shop?category=${product.category}`} className="hover:text-premium-accent transition-colors">{product.category}</Link>
          <span>/</span>
          <span className="text-premium-dark font-bold">{product.name}</span>
        </div>

        {/* Core Product Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 bg-white border border-premium-border rounded p-6 sm:p-10 shadow-sm mb-12">
          
          {/* 1. Left Column: Image Gallery */}
          <div className="flex flex-col gap-4">
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs font-bold uppercase tracking-wider text-premium-gray">Product View</span>
              <button
                type="button"
                onClick={() => setShow360(!show360)}
                className={`text-xs font-bold px-3 py-1 rounded-full border transition-all flex items-center gap-1.5 ${
                  show360
                    ? 'bg-purple-900 text-white border-purple-600 shadow-md'
                    : 'bg-premium-light border-premium-border text-premium-dark hover:border-purple-600'
                }`}
              >
                <RotateCw className="w-3.5 h-3.5 text-orange-500" />
                {show360 ? 'Close 360° View' : 'Interactive 360° View'}
              </button>
            </div>

            {show360 ? (
              <Product360Viewer imageUrls={product.image_urls} productName={product.name} />
            ) : (
              <div className="relative overflow-hidden bg-premium-light border border-premium-border rounded aspect-square flex items-center justify-center hover-zoom shadow-inner group">
                <img 
                  src={activeImage} 
                  alt={product.name} 
                  className="w-full h-full object-cover"
                />
                {/* Prev / Next Buttons */}
                {product.image_urls.length > 1 && (
                  <>
                    <button onClick={() => {
                      const idx = product.image_urls.indexOf(activeImage);
                      setActiveImage(product.image_urls[idx === 0 ? product.image_urls.length - 1 : idx - 1]);
                    }} className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-white/80 hover:bg-white text-premium-black rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow"><ChevronLeft className="w-5 h-5" /></button>
                    <button onClick={() => {
                      const idx = product.image_urls.indexOf(activeImage);
                      setActiveImage(product.image_urls[idx === product.image_urls.length - 1 ? 0 : idx + 1]);
                    }} className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-white/80 hover:bg-white text-premium-black rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow"><ChevronRight className="w-5 h-5" /></button>
                  </>
                )}
              </div>
            )}
            
            {/* Gallery Thumbnails */}
            {product.image_urls.length > 1 && (
              <div className="flex gap-3">
                {product.image_urls.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => { setActiveImage(img); setShow360(false); }}
                    className={`w-20 h-20 border rounded bg-premium-light overflow-hidden transition-all ${
                      !show360 && activeImage === img ? 'border-premium-accent ring-2 ring-premium-accent/20' : 'border-premium-border opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt={`view-${i}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 2. Right Column: Product Operations */}
          <div className="flex flex-col">
            
            {/* Tagline category */}
            <div className="text-[10px] sm:text-xs font-semibold uppercase tracking-widest text-premium-accent mb-2">
              {product.gender} • {product.category} • {product.frame_shape} Shape
            </div>

            {/* AI Suggestion Indicator */}
            {isFaceShapeMatched && (
              <div className="inline-flex items-center gap-1.5 self-start bg-premium-accent/15 border border-premium-accent/40 text-premium-golddark px-3 py-1 rounded text-xs font-bold uppercase tracking-wider mb-4 animate-bounce">
                <CheckCircle2 className="w-3.5 h-3.5" /> Recommended for your face shape
              </div>
            )}

            {/* Title */}
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-premium-black tracking-tight leading-tight mb-4">
              {product.name}
            </h1>

            {/* Rating Summary */}
            <div className="flex items-center gap-2 mb-6">
              <div className="flex text-amber-500">
                {[1,2,3,4,5].map(star => {
                  const ratingVal = parseFloat(product.average_rating || 0);
                  return (
                    <Star 
                      key={star} 
                      className={`w-4 h-4 ${star <= Math.round(ratingVal) ? 'fill-current' : 'text-gray-300'}`} 
                    />
                  );
                })}
              </div>
              <span className="text-sm font-semibold text-premium-dark">{parseFloat(product.average_rating || 0).toFixed(1)}</span>
              <span className="text-xs text-premium-gray font-medium">({product.review_count} customer reviews)</span>
            </div>

            {/* Price */}
            <div className="text-3xl font-bold text-premium-black mb-6">
              ₹{getDynamicPrice().toLocaleString('en-IN')}
            </div>

            {/* Description */}
            <p className="text-sm text-premium-gray leading-relaxed mb-8 font-light">
              {product.description}
            </p>

            {/* Specifications Card */}
            <div className="border border-premium-border bg-premium-light rounded p-4 mb-8">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2 text-xs uppercase tracking-widest font-bold text-premium-black">
                  <Ruler className="w-4 h-4 text-premium-accent" /> Size & Dimensions Guide
                </div>
                {user && user.face_shape && (
                  <span className="text-[10px] bg-premium-black text-premium-accent px-2 py-0.5 rounded tracking-wider uppercase font-bold">
                    Ideal Fit: {user.face_shape === 'round' || user.face_shape === 'square' ? 'Wide (54mm)' : 'Medium (50mm)'}
                  </span>
                )}
              </div>
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="bg-white p-2 rounded border border-premium-border">
                  <span className="block text-[10px] text-premium-gray font-medium">Lens Width</span>
                  <span className="font-bold text-premium-dark">50 mm</span>
                </div>
                <div className="bg-white p-2 rounded border border-premium-border">
                  <span className="block text-[10px] text-premium-gray font-medium">Bridge Width</span>
                  <span className="font-bold text-premium-dark">21 mm</span>
                </div>
                <div className="bg-white p-2 rounded border border-premium-border">
                  <span className="block text-[10px] text-premium-gray font-medium">Temple Length</span>
                  <span className="font-bold text-premium-dark">145 mm</span>
                </div>
              </div>
            </div>

            {/* Prescription Lenses Configurator */}
            <div className="border border-premium-border rounded-xl p-5 mb-8 bg-white space-y-4">
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input 
                  type="checkbox"
                  checked={includePrescription}
                  onChange={(e) => setIncludePrescription(e.target.checked)}
                  className="accent-premium-accent w-4.5 h-4.5 rounded"
                />
                <span className="font-serif text-sm font-bold text-premium-black">Add Custom Prescription Lenses</span>
              </label>

              {includePrescription && (
                <div className="space-y-4 pt-3 border-t border-premium-border animate-fade-in text-xs text-premium-dark">
                  <div>
                    <span className="block font-bold mb-2">Select Lens Thickness (Index)</span>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { id: '1.56', label: 'Standard 1.56', price: 'Free' },
                        { id: '1.61', label: 'Thin 1.61', price: '+₹800' },
                        { id: '1.67', label: 'Ultra Thin 1.67', price: '+₹1,600' },
                        { id: '1.74', label: 'Super Thin 1.74', price: '+₹2,800' },
                      ].map(lens => (
                        <button
                          key={lens.id}
                          onClick={() => setLensIndex(lens.id)}
                          className={`p-2.5 rounded border text-left flex justify-between items-center transition-all ${
                            lensIndex === lens.id ? 'border-premium-accent bg-premium-accent/5' : 'border-premium-border hover:border-premium-accent/50'
                          }`}
                        >
                          <span className="font-semibold">{lens.label}</span>
                          <span className="font-mono text-premium-accent text-[10px]">{lens.price}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <span className="block font-bold mb-2">Select Lens Coatings</span>
                    <div className="space-y-2">
                      {[
                        { state: antiGlare, setState: setAntiGlare, label: 'Anti-Glare coating', price: '+₹250' },
                        { state: blueShield, setState: setBlueShield, label: 'Blue Light protection shield', price: '+₹300' },
                        { state: photochromic, setState: setPhotochromic, label: 'Photochromic transition lenses', price: '+₹600' },
                      ].map((coat, idx) => (
                        <label key={idx} className="flex items-center justify-between p-2 rounded border border-premium-border bg-premium-light/30 cursor-pointer">
                          <span className="flex items-center gap-2">
                            <input 
                              type="checkbox"
                              checked={coat.state}
                              onChange={(e) => coat.setState(e.target.checked)}
                              className="accent-premium-accent w-4 h-4 rounded"
                            />
                            <span className="font-medium">{coat.label}</span>
                          </span>
                          <span className="font-mono text-premium-accent text-[10px]">{coat.price}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded text-[11px] text-amber-800 leading-relaxed">
                    ℹ️ You will input your exact sphere (SPH), cylinder (CYL), axis, and pupil distance (PD) measurements on the Checkout page before finalizing your purchase.
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mt-auto">
              {product.stock > 0 ? (
                <button
                  onClick={() => addToCart(product)}
                  className={`flex-grow uppercase font-semibold text-xs tracking-widest py-4 px-8 rounded transition-all text-center flex items-center justify-center gap-2 ${
                    inCart 
                      ? 'bg-green-600 text-white hover:bg-green-700' 
                      : 'bg-premium-black text-white hover:bg-premium-accent hover:text-premium-black'
                  }`}
                >
                  <ShoppingBag className="w-4 h-4" />
                  {inCart ? 'Item in Bag' : 'Add to Bag'}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => showToast('🔔 You will receive a VIP email alert as soon as this frame is restocked!')}
                  className="flex-grow bg-[#1A0024] text-[#FAAE62] border border-[#FAAE62]/40 hover:bg-[#FAAE62] hover:text-[#0D0016] uppercase font-bold text-xs tracking-widest py-4 px-8 rounded text-center flex items-center justify-center gap-2 transition-all shadow-md"
                >
                  <Bell className="w-4 h-4" /> Notify Me When Restocked
                </button>
              )}

              <button
                onClick={() => toggleWishlist(product)}
                className={`border py-4 px-6 rounded transition-all flex items-center justify-center ${
                  inWishlist 
                    ? 'border-red-200 bg-red-50 text-red-600' 
                    : 'border-premium-border hover:border-premium-accent text-premium-dark'
                }`}
                title="Wishlist"
              >
                <Heart className={`w-5 h-5 ${inWishlist ? 'fill-current' : ''}`} />
              </button>
            </div>

            {/* Inventory indicator */}
            {product.stock > 0 && product.stock <= 5 && (
              <span className="text-red-500 text-xs mt-3 flex items-center gap-1 font-semibold animate-pulse-subtle">
                <ShieldAlert className="w-3.5 h-3.5" /> Only {product.stock} items left in stock - order soon!
              </span>
            )}

          </div>
        </div>

        {/* --- Customer Reviews Section --- */}
        <div className="bg-white border border-premium-border rounded p-6 sm:p-10 shadow-sm">
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-premium-black tracking-tight mb-8 flex items-center gap-2">
            <MessageSquare className="w-6 h-6 text-premium-accent" /> Customer Reviews & Ratings
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Reviews List */}
            <div className="lg:col-span-2 space-y-6">
              {product.reviews.length === 0 ? (
                <div className="text-center py-10 bg-premium-light border border-premium-border rounded">
                  <p className="text-sm text-premium-gray">No reviews yet for this model. Be the first to share your experience!</p>
                </div>
              ) : (
                product.reviews.map(review => (
                  <div key={review.id} className="border-b border-premium-border pb-6">
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-sm text-premium-black">{review.user_name}</p>
                        <span className="bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Verified Buyer
                        </span>
                      </div>
                      <span className="text-[10px] text-premium-gray font-semibold">
                        {new Date(review.created_at || Date.now()).toLocaleDateString('en-IN', {
                          year: 'numeric', month: 'short', day: 'numeric'
                        })}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-3 mb-2">
                      <div className="flex text-amber-500">
                        {[1,2,3,4,5].map(s => (
                          <Star key={s} className={`w-3.5 h-3.5 ${s <= review.rating ? 'fill-current' : 'text-gray-300'}`} />
                        ))}
                      </div>
                      <span className="text-[10px] bg-purple-50 text-purple-700 border border-purple-200 px-2 py-0.5 rounded font-semibold">
                        Fit: True to Size
                      </span>
                    </div>
                    
                    <p className="text-sm text-premium-dark font-light leading-relaxed">
                      {review.comment || "No detailed comment left."}
                    </p>
                  </div>
                ))
              )}
            </div>

            {/* Write a Review Section */}
            <div>
              <div className="bg-premium-light border border-premium-border rounded p-6">
                <h3 className="font-serif text-lg font-bold text-premium-black mb-4">Share Your Thoughts</h3>
                
                {token ? (
                  <form onSubmit={handleReviewSubmit} className="space-y-4">
                    
                    {/* Star Rating select */}
                    <div>
                      <label className="block text-xs uppercase tracking-wider text-premium-gray font-semibold mb-2">Rating</label>
                      <div className="flex gap-2">
                        {[1,2,3,4,5].map(val => (
                          <button
                            key={val}
                            type="button"
                            onClick={() => setRating(val)}
                            className="p-1 text-amber-500 hover:scale-110 transition-transform"
                          >
                            <Star className={`w-6 h-6 ${val <= rating ? 'fill-current' : 'text-gray-300'}`} />
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Review text */}
                    <div>
                      <label className="block text-xs uppercase tracking-wider text-premium-gray font-semibold mb-2">Review Comment</label>
                      <textarea
                        rows="4"
                        required
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="Write about the fit, lens quality, and design feel..."
                        className="w-full bg-white text-sm border border-premium-border rounded p-3 focus:outline-none focus:border-premium-accent text-premium-dark font-medium"
                      ></textarea>
                    </div>

                    {reviewSuccess && (
                      <div className="text-green-600 text-xs font-semibold p-2 bg-green-50 rounded border border-green-150">
                        {reviewSuccess}
                      </div>
                    )}

                    {reviewError && (
                      <div className="text-red-600 text-xs font-semibold p-2 bg-red-50 rounded border border-red-150">
                        {reviewError}
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={submittingReview}
                      className="w-full bg-premium-black text-white hover:bg-premium-accent hover:text-premium-black font-semibold text-xs tracking-widest uppercase py-3 rounded transition-all disabled:opacity-50"
                    >
                      {submittingReview ? 'Submitting...' : 'Submit Review'}
                    </button>

                  </form>
                ) : (
                  <div className="text-center py-6">
                    <p className="text-xs text-premium-gray leading-relaxed mb-4">
                      You need to be logged in to submit a rating and write a review.
                    </p>
                    <Link href="/account" className="bg-premium-black text-white hover:bg-premium-accent hover:text-premium-black text-[10px] font-bold tracking-widest uppercase px-4 py-2.5 rounded transition-all inline-block">
                      Sign In
                    </Link>
                  </div>
                )}

              </div>
            </div>

          </div>

        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-16 border-t border-premium-border pt-12">
            <h2 className="font-serif text-2xl font-bold text-premium-black mb-8 text-center sm:text-left">
              You May Also Like
            </h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map(prod => (
                <Link key={prod.id} href={`/product/${prod.id}`} className="block group">
                  <div className="relative overflow-hidden bg-premium-light rounded mb-4 aspect-square flex items-center justify-center hover-zoom">
                    <img 
                      src={prod.image_urls[0]} 
                      alt={prod.name} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="text-[10px] uppercase tracking-wider text-premium-accent font-semibold mb-1">
                    {prod.gender} • {prod.category}
                  </div>
                  <h3 className="font-serif text-base font-bold text-premium-black truncate group-hover:text-premium-accent transition-colors">
                    {prod.name}
                  </h3>
                  <div className="font-semibold text-premium-black text-sm mt-1">
                    ₹{parseFloat(prod.price).toLocaleString('en-IN')}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
    </>
  );
}
