const React = require('react');
const { useState, useEffect } = React;
const { useRouter } = require('next/router');
const Link = require('next/link').default;
const { useCart, useWishlist, useAuth } = require('../_app');
const { Star, Heart, ShoppingBag, Ruler, ShieldAlert, CheckCircle2, MessageSquare, AlertCircle } = require('lucide-react');

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
  const [isFaceShapeMatched, setIsFaceShapeMatched] = useState(false);
  const [inCart, setInCart] = useState(false);
  const [inWishlist, setInWishlist] = useState(false);

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
    fetch(`http://localhost:5000/api/products/${id}`)
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
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [id, reviewSuccess]); // Re-fetch on review success to update averages

  // Check face shape recommendation match
  useEffect(() => {
    if (product && user && user.face_shape) {
      fetch(`http://localhost:5000/api/products/recommendations/${user.face_shape}`)
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

    fetch('http://localhost:5000/api/orders/review', {
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

  return (
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
            <div className="relative overflow-hidden bg-premium-light border border-premium-border rounded aspect-square flex items-center justify-center hover-zoom shadow-inner">
              <img 
                src={activeImage} 
                alt={product.name} 
                className="w-full h-full object-cover"
              />
            </div>
            
            {/* Gallery Thumbnails */}
            {product.image_urls.length > 1 && (
              <div className="flex gap-3">
                {product.image_urls.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImage(img)}
                    className={`w-20 h-20 border rounded bg-premium-light overflow-hidden transition-all ${
                      activeImage === img ? 'border-premium-accent ring-2 ring-premium-accent/20' : 'border-premium-border opacity-70 hover:opacity-100'
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
              ₹{parseFloat(product.price).toLocaleString('en-IN')}
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
                  disabled
                  className="flex-grow bg-gray-200 text-gray-400 cursor-not-allowed uppercase font-semibold text-xs tracking-widest py-4 px-8 rounded text-center flex items-center justify-center gap-2"
                >
                  Sold Out
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
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-bold text-sm text-premium-black">{review.user_name}</p>
                      <span className="text-[10px] text-premium-gray font-semibold">
                        {new Date(review.created_at).toLocaleDateString('en-IN', {
                          year: 'numeric', month: 'short', day: 'numeric'
                        })}
                      </span>
                    </div>
                    
                    <div className="flex text-amber-500 mb-2">
                      {[1,2,3,4,5].map(s => (
                        <Star key={s} className={`w-3.5 h-3.5 ${s <= review.rating ? 'fill-current' : 'text-gray-300'}`} />
                      ))}
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

      </div>
    </div>
  );
}
