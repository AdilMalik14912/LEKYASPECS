const React = require('react');
const Link = require('next/link').default;
const { useWishlist, useCart } = require('./_app');
const { Heart, ShoppingBag, Star, X } = require('lucide-react');

export default function Wishlist() {
  const { wishlist, toggleWishlist } = useWishlist();
  const { addToCart } = useCart();

  if (wishlist.length === 0) {
    return (
      <div className="bg-premium-black min-h-screen py-16 sm:py-24 text-center">
        <div className="max-w-md mx-auto px-4">
          <Heart className="w-20 h-20 text-red-400 mx-auto mb-4 animate-heartbeat" fill="currentColor" />
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-premium-black mb-2">Your Wishlist is Empty</h2>
          <p className="text-sm text-premium-gray mb-8">
            Keep track of the eyewear frames you love! Tap the heart icon on any frame in our shop, and they will appear here.
          </p>
          <Link href="/shop" className="bg-premium-black text-white hover:bg-premium-accent hover:text-premium-black font-semibold text-xs tracking-widest uppercase px-8 py-4 rounded transition-all inline-block">
            Explore All Frames
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-premium-black min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-10 gap-4">
          <h1 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-premium-black text-center sm:text-left flex items-center gap-3">
            <Heart className="w-8 h-8 text-red-400 animate-heartbeat flex-shrink-0" fill="currentColor" />
            My Saved Frames
          </h1>
          <button
            onClick={() => {
              wishlist.forEach(item => addToCart(item));
            }}
            className="bg-premium-black text-white hover:bg-premium-accent hover:text-premium-black font-semibold text-xs tracking-widest uppercase px-6 py-3 rounded transition-all flex items-center justify-center gap-2 shadow"
          >
            <ShoppingBag className="w-4 h-4" />
            Add All to Bag
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {wishlist.map((product, idx) => (
            <div key={product.id} className="stagger-item relative group bg-white border border-premium-border rounded p-4 shadow-sm hover:shadow-md hover:border-premium-accent/50 transition-all flex flex-col" style={{ animationDelay: `${idx * 0.08}s` }}>
              
              {/* Remove button */}
              <button 
                onClick={() => toggleWishlist(product)}
                className="absolute top-6 right-6 z-10 bg-white/80 hover:bg-white text-premium-dark hover:text-red-600 p-1.5 rounded-full border border-premium-border transition-colors shadow"
                title="Remove from wishlist"
              >
                <X className="w-3.5 h-3.5" />
              </button>

              <Link href={`/product/${product.id}`} className="block">
                <div className="relative overflow-hidden bg-premium-light rounded mb-4 aspect-square flex items-center justify-center hover-zoom">
                  <img 
                    src={product.image_urls[0]} 
                    alt={product.name} 
                    className="w-full h-full object-cover"
                  />
                </div>
              </Link>

              <div className="text-[10px] uppercase tracking-wider text-premium-accent font-semibold mb-1">
                {product.gender} • {product.category}
              </div>
              
              <h3 className="font-serif text-base font-bold text-premium-black truncate hover:text-premium-accent transition-colors">
                <Link href={`/product/${product.id}`}>{product.name}</Link>
              </h3>
              
              <div className="flex items-center gap-1 mt-1 mb-2 text-xs text-amber-500">
                <Star className="w-3.5 h-3.5 fill-current" />
                <span className="font-medium text-premium-dark">{parseFloat(product.average_rating || 0).toFixed(1)}</span>
                <span className="text-gray-400">({product.review_count})</span>
              </div>
              
              <div className="font-semibold text-premium-black text-lg mb-4">
                ₹{parseFloat(product.price).toLocaleString('en-IN')}
              </div>

              {/* Add to Cart Quick action */}
              <button
                onClick={() => addToCart(product)}
                className="w-full mt-auto bg-premium-black text-white hover:bg-premium-accent hover:text-premium-black font-semibold text-[10px] tracking-widest uppercase py-2.5 rounded transition-all flex items-center justify-center gap-1.5"
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                Add to Bag
              </button>

            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
