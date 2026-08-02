const React = require('react');
const { useState, useEffect } = React;
const Link = require('next/link').default;
const Head = require('next/head').default;
const { useRouter } = require('next/router');
const { useAuth, useCart, useWishlist } = require('./_app');
const { Star, SlidersHorizontal, Grid, List, Check, RotateCcw, Search, Eye, ShoppingBag, Heart, X, Scale, Sparkles } = require('lucide-react');
const API_BASE = typeof window !== 'undefined'
  ? (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' ? 'http://localhost:5000' : '')
  : '';

export default function Shop() {
  const router = useRouter();
  const { user } = useAuth();
  const { addToCart } = useCart();
  const { wishlist, toggleWishlist } = useWishlist();

  const [activeQuickViewProduct, setActiveQuickViewProduct] = useState(null);
  const [recentlyViewed, setRecentlyViewed] = useState([]);
  const [compareList, setCompareList] = useState([]);

  const handleToggleCompare = (product) => {
    setCompareList(prev => {
      const exists = prev.some(item => item.id === product.id);
      if (exists) {
        return prev.filter(item => item.id !== product.id);
      }
      if (prev.length >= 3) {
        alert('You can compare a maximum of 3 frames side-by-side.');
        return prev;
      }
      return [...prev, product];
    });
  };
  
  // Loading & State
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterOptions, setFilterOptions] = useState({
    frame_shapes: [],
    categories: [],
    genders: [],
    price_range: { min_price: 0, max_price: 10000 }
  });

  // Active filters from URL query or state
  const { category, gender, frame_shape, price_max, face_shape, search } = router.query;
  const [priceRange, setPriceRange] = useState(10000);
  const [sortOption, setSortOption] = useState('newest');
  const [catalogSearch, setCatalogSearch] = useState('');

  const openQuickView = (e, product) => {
    e.preventDefault();
    e.stopPropagation();
    setActiveQuickViewProduct(product);
  };

  // Sync search state with URL query parameter
  useEffect(() => {
    if (search) {
      setCatalogSearch(search);
    } else {
      setCatalogSearch('');
    }
  }, [search]);

  const handleSearchSubmit = () => {
    const query = { ...router.query };
    if (catalogSearch.trim()) {
      query.search = catalogSearch.trim();
    } else {
      delete query.search;
    }
    router.push({ pathname: '/shop', query });
  };

  // Load filter options on mount
  useEffect(() => {
    fetch(`${API_BASE}/api/products/filters`)
      .then(res => res.ok ? res.json() : {})
      .then(data => {
        if (data && typeof data === 'object') {
          setFilterOptions({
            frame_shapes: Array.isArray(data.frame_shapes) ? data.frame_shapes : [],
            categories: Array.isArray(data.categories) ? data.categories : [],
            genders: Array.isArray(data.genders) ? data.genders : [],
            price_range: data.price_range || { min_price: 0, max_price: 10000 }
          });
          if (data.price_range) {
            setPriceRange(parseFloat(data.price_range.max_price || 10000));
          }
        }
      })
      .catch(err => console.error('Error fetching filters:', err));
  }, []);

  // Fetch products whenever filters or sort changes
  useEffect(() => {
    if (!router.isReady) return;
    
    setLoading(true);
    let url = `${API_BASE}/api/products?`;
    
    const params = new URLSearchParams();
    if (category) params.append('category', category);
    if (gender) params.append('gender', gender);
    if (frame_shape) {
      if (Array.isArray(frame_shape)) {
        frame_shape.forEach(s => params.append('frame_shape', s));
      } else {
        params.append('frame_shape', frame_shape);
      }
    }
    if (price_max) params.append('price_max', price_max);
    if (face_shape) params.append('face_shape', face_shape);
    if (search) params.append('search', search);

    fetch(url + params.toString())
      .then(res => res.ok ? res.json() : [])
      .then(data => {
        const arr = Array.isArray(data) ? data : [];
        let sorted = [...arr];
        if (sortOption === 'price-low') {
          sorted.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
        } else if (sortOption === 'price-high') {
          sorted.sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
        } else if (sortOption === 'rating') {
          sorted.sort((a, b) => parseFloat(b.average_rating || 0) - parseFloat(a.average_rating || 0));
        } else if (sortOption === 'reviews') {
          sorted.sort((a, b) => parseInt(b.review_count || 0) - parseInt(a.review_count || 0));
        }
        setProducts(sorted);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching products:', err);
        setProducts([]);
        setLoading(false);
      });
  }, [router.query, sortOption, router.isReady]);

  // Sync state with URL slider
  useEffect(() => {
    if (price_max) {
      setPriceRange(parseFloat(price_max));
    }
  }, [price_max]);

  // Update filter helper
  const handleFilterChange = (key, value) => {
    const query = { ...router.query };
    
    if (key === 'frame_shape') {
      let currentShapes = query.frame_shape ? (Array.isArray(query.frame_shape) ? query.frame_shape : [query.frame_shape]) : [];
      if (currentShapes.includes(value)) {
        currentShapes = currentShapes.filter(s => s !== value);
      } else {
        currentShapes.push(value);
      }
      
      if (currentShapes.length === 0) {
        delete query.frame_shape;
      } else {
        query.frame_shape = currentShapes;
      }
    } else {
      if (query[key] === value) {
        delete query[key];
      } else {
        query[key] = value;
      }
    }
    
    router.push({ pathname: '/shop', query });
  };

  const resetFilters = () => {
    router.push('/shop');
    setPriceRange(10000);
  };

  // Load recently viewed from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('specs_recently_viewed');
        if (stored) {
          setRecentlyViewed(JSON.parse(stored));
        }
      } catch (_) {}
    }
  }, []);

  return (
    <div className="bg-premium-black min-h-screen py-8 sm:py-12">
      <Head>
        <title>Buy Glasses Online India | Prescription Eyeglasses & Sunglasses | Lekya Specs</title>
        <meta name="description" content="Shop Lekya Specs luxury eyewear catalog. Browse acetate spectacle frames, prescription glasses, and sunglasses. Free delivery in Delhi NCR & Pan-India shipping." />
        <meta name="keywords" content="Buy glasses online India, prescription eyeglasses, sunglasses India, spectacle frames, acetate glasses, Delhi NCR same day glasses, lekya specs shop" />
        <link rel="canonical" href="https://lekya.in/shop" />
      </Head>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Page Title & Breadcrumbs */}
        <div className="text-center sm:text-left mb-8 sm:mb-12">
          <h1 className="font-serif text-3xl sm:text-5xl font-bold tracking-tight text-premium-black mb-2">
            The Eyewear Catalog
          </h1>
          <p className="text-sm text-premium-gray font-light">
            Individually tailored frames built with hand-polished acetate and durable titanium temples.
          </p>
        </div>

        {/* Top Control Bar (Sort, Filter count) */}
        <div className="flex flex-col sm:flex-row items-center justify-between border-y border-premium-border py-4 mb-8 gap-4 bg-white px-4 rounded shadow-sm">
          <div className="text-sm text-premium-dark flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-premium-accent" />
            <span className="font-semibold">{products.length}</span> frames found
            {face_shape && (
              <span className="ml-2 bg-premium-accent/20 text-premium-golddark text-[10px] font-bold uppercase px-2 py-0.5 rounded tracking-wide animate-pulse">
                Recommended for {face_shape} face
              </span>
            )}
          </div>
          
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
            {/* Search Input */}
            <div className="relative w-full sm:w-64">
              <input
                type="text"
                placeholder="Search catalog..."
                value={catalogSearch}
                onChange={(e) => setCatalogSearch(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSearchSubmit();
                  }
                }}
                className="w-full bg-premium-light border border-premium-border rounded py-1.5 pl-3 pr-8 text-xs focus:outline-none focus:border-premium-accent text-premium-dark font-medium"
              />
              <Search className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-premium-gray cursor-pointer hover:text-premium-accent" onClick={handleSearchSubmit} />
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
              <label className="text-xs uppercase tracking-wider text-premium-gray font-semibold">Sort By</label>
              <select
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
                className="bg-premium-light text-sm border border-premium-border rounded px-3 py-1.5 focus:outline-none focus:border-premium-accent font-medium text-premium-dark"
              >
                <option value="newest">New Releases</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Customer Rating</option>
                <option value="reviews">Most Reviewed</option>
              </select>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* --- Sidebar Filter Widget --- */}
          <div className="bg-white border border-premium-border rounded p-6 shadow-sm self-start">
            <div className="flex items-center justify-between border-b border-premium-border pb-4 mb-6">
              <h2 className="font-serif text-lg font-bold text-premium-black">Filters</h2>
              <button 
                onClick={resetFilters}
                className="text-xs uppercase tracking-widest text-premium-gray hover:text-red-600 transition-colors flex items-center gap-1 font-semibold"
              >
                <RotateCcw className="w-3 h-3" /> Clear All
              </button>
            </div>

            {/* Profile Recommendation Quick Filter */}
            {user && user.face_shape && (
              <div className="mb-6 p-4 bg-premium-accent/10 border border-premium-accent/30 rounded">
                <h3 className="text-xs uppercase tracking-wider text-premium-golddark font-bold mb-2">My Face Profile</h3>
                <label className="flex items-center gap-2 cursor-pointer text-sm font-semibold text-premium-black">
                  <input
                    type="checkbox"
                    checked={face_shape === user.face_shape}
                    onChange={() => handleFilterChange('face_shape', user.face_shape)}
                    className="accent-premium-accent w-4 h-4 rounded"
                  />
                  Suggest for my <span className="underline uppercase">{user.face_shape}</span> face
                </label>
              </div>
            )}

            {/* Category Filter */}
            <div className="mb-6">
              <h3 className="text-xs uppercase tracking-widest text-premium-gray font-bold mb-3">Category</h3>
              <div className="space-y-2">
                {filterOptions.categories.map(cat => (
                  <label key={cat} className="flex items-center gap-2 text-sm text-premium-dark font-medium cursor-pointer">
                    <input
                      type="checkbox"
                      checked={category === cat}
                      onChange={() => handleFilterChange('category', cat)}
                      className="accent-premium-accent"
                    />
                    {cat}
                  </label>
                ))}
              </div>
            </div>

            {/* Gender Filter */}
            <div className="mb-6 border-t border-premium-border pt-6">
              <h3 className="text-xs uppercase tracking-widest text-premium-gray font-bold mb-3">Gender</h3>
              <div className="space-y-2">
                {filterOptions.genders.map(g => (
                  <label key={g} className="flex items-center gap-2 text-sm text-premium-dark font-medium cursor-pointer">
                    <input
                      type="checkbox"
                      checked={gender === g}
                      onChange={() => handleFilterChange('gender', g)}
                      className="accent-premium-accent"
                    />
                    {g}
                  </label>
                ))}
              </div>
            </div>

            {/* Frame Shape Filter */}
            <div className="mb-6 border-t border-premium-border pt-6">
              <h3 className="text-xs uppercase tracking-widest text-premium-gray font-bold mb-3">Frame Shape</h3>
              <div className="grid grid-cols-2 gap-2">
                {filterOptions.frame_shapes.map(shape => {
                  const isChecked = Array.isArray(frame_shape) 
                    ? frame_shape.includes(shape) 
                    : frame_shape === shape;
                  return (
                    <button
                      key={shape}
                      onClick={() => handleFilterChange('frame_shape', shape)}
                      className={`text-xs px-2 py-1.5 border rounded text-center transition-all ${
                        isChecked 
                          ? 'border-premium-accent bg-premium-accent/10 text-premium-golddark font-semibold' 
                          : 'border-premium-border hover:border-premium-accent text-premium-dark'
                      }`}
                    >
                      {shape}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Price Filter */}
            <div className="border-t border-premium-border pt-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs uppercase tracking-widest text-premium-gray font-bold">Max Price</h3>
                <span className="text-sm font-semibold text-premium-accent">₹{priceRange.toLocaleString('en-IN')}</span>
              </div>
              <input
                type="range"
                min={filterOptions.price_range.min_price || 0}
                max={filterOptions.price_range.max_price || 10000}
                step="500"
                value={priceRange}
                onChange={(e) => setPriceRange(parseFloat(e.target.value))}
                onMouseUp={() => handleFilterChange('price_max', priceRange.toString())}
                onTouchEnd={() => handleFilterChange('price_max', priceRange.toString())}
                className="w-full accent-premium-accent cursor-pointer"
              />
              <div className="flex items-center justify-between text-[10px] text-gray-400 mt-1 font-medium">
                <span>₹{parseFloat(filterOptions.price_range.min_price || 0).toLocaleString('en-IN')}</span>
                <span>₹{parseFloat(filterOptions.price_range.max_price || 10000).toLocaleString('en-IN')}</span>
              </div>
            </div>

          </div>

          {/* --- Products Grid --- */}
          <div className="lg:col-span-3">
            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map(n => (
                  <div key={n} className="animate-pulse bg-white border border-premium-border rounded p-4 h-[320px]">
                    <div className="bg-premium-light h-48 w-full rounded mb-4"></div>
                    <div className="h-4 bg-premium-light rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-premium-light rounded w-1/2"></div>
                  </div>
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="bg-white border border-premium-border rounded p-12 text-center shadow-sm">
                <SlidersHorizontal className="w-12 h-12 text-premium-accent mx-auto mb-4 animate-pulse-subtle" />
                <h3 className="font-serif text-xl font-bold text-premium-black mb-2">No Frames Found</h3>
                <p className="text-sm text-premium-gray mb-6 max-w-sm mx-auto">
                  We couldn't find any products matching those filters. Try adjusting your sidebar selections or clear filters.
                </p>
                <button 
                  onClick={resetFilters} 
                  className="bg-premium-black text-white hover:bg-premium-accent hover:text-premium-black font-semibold text-xs tracking-widest uppercase px-6 py-3 rounded transition-all"
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                {products.map((product, idx) => (
                  <Link 
                    key={product.id} 
                    href={`/product/${product.id}`}
                    className="stagger-item group bg-white border border-premium-border rounded p-4 shadow-sm hover:shadow-md hover:border-premium-accent/50 transition-all flex flex-col"
                    style={{ animationDelay: `${Math.min(idx * 0.07, 0.7)}s` }}
                  >
                    <div className="relative overflow-hidden bg-premium-light rounded mb-4 aspect-square flex items-center justify-center group/image">
                      <img 
                        src={Array.isArray(product.image_urls) && product.image_urls.length > 0 ? product.image_urls[0] : 'https://images.unsplash.com/photo-1591076482161-42ce6da69f67?auto=format&fit=crop&w=600&q=80'} 
                        alt={product.name} 
                        onError={(e) => { e.currentTarget.src = 'https://images.unsplash.com/photo-1591076482161-42ce6da69f67?auto=format&fit=crop&w=600&q=80'; }}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover/image:scale-105"
                      />
                      {product.stock === 0 ? (
                        <span className="absolute top-2 left-2 bg-red-600 text-white text-[10px] uppercase font-bold px-2 py-0.5 rounded shadow">Out of stock</span>
                      ) : (
                        <>
                          <span className="absolute top-2 left-2 bg-black/70 backdrop-blur-md text-[#FAAE62] border border-[#FAAE62]/40 text-[9px] font-bold uppercase px-2 py-0.5 rounded shadow flex items-center gap-1">
                            <Sparkles className="w-2.5 h-2.5 animate-pulse" /> Try-On Ready
                          </span>
                          <div className="absolute inset-0 bg-premium-black/40 opacity-0 group-hover/image:opacity-100 flex items-center justify-center gap-2 transition-all duration-300 backdrop-blur-[2px] p-2">
                            <button
                              onClick={(e) => openQuickView(e, product)}
                              className="bg-white text-premium-black hover:bg-premium-accent text-[10px] font-bold uppercase tracking-wider px-3 py-2 rounded-full shadow-md flex items-center gap-1 transition-all transform translate-y-2 group-hover/image:translate-y-0 duration-300"
                            >
                              <Eye className="w-3.5 h-3.5" /> Quick View
                            </button>
                            <Link
                              href={`/tryon?product_id=${product.id}`}
                              onClick={(e) => e.stopPropagation()}
                              className="bg-[#FAAE62] text-black hover:bg-white text-[10px] font-bold uppercase tracking-wider px-3 py-2 rounded-full shadow-md flex items-center gap-1 transition-all transform translate-y-2 group-hover/image:translate-y-0 duration-300"
                            >
                              <Sparkles className="w-3.5 h-3.5" /> 3D Try-On
                            </Link>
                          </div>
                        </>
                      )}
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
                    <div className="flex items-center justify-between mt-auto pt-2 border-t border-premium-border/40">
                      <span className="font-semibold text-premium-black text-lg">
                        ₹{parseFloat(product.price).toLocaleString('en-IN')}
                      </span>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleToggleCompare(product);
                        }}
                        className={`text-[9px] uppercase tracking-wider font-bold px-2 py-1 rounded border transition-colors flex items-center gap-1 ${
                          compareList.some(item => item.id === product.id)
                            ? 'bg-premium-black text-premium-accent border-premium-black'
                            : 'border-premium-border text-premium-gray hover:border-premium-accent hover:text-premium-accent bg-white'
                        }`}
                      >
                        <Scale className="w-3.5 h-3.5" /> Compare
                      </button>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>


        </div> {/* Closes grid grid-cols-1 lg:grid-cols-4 gap-8 */}

        {/* Recently Viewed Products strip */}
        {recentlyViewed.length > 0 && (
          <div className="mt-16 pt-12 border-t border-premium-border">
            <h3 className="font-serif text-xl font-bold text-premium-black mb-6 flex items-center gap-2">
              <span className="text-xl">🕐</span> Your Recently Viewed Frames
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
              {recentlyViewed.map(product => (
                <Link key={product.id} href={`/product/${product.id}`} className="group bg-white border border-premium-border rounded p-3 shadow-sm hover:shadow-md transition-all flex flex-col text-center">
                  <div className="relative overflow-hidden bg-premium-light rounded mb-2 aspect-square flex items-center justify-center">
                    <img 
                      src={Array.isArray(product.image_urls) && product.image_urls.length > 0 ? product.image_urls[0] : 'https://images.unsplash.com/photo-1591076482161-42ce6da69f67?auto=format&fit=crop&w=600&q=80'} 
                      alt={product.name} 
                      onError={(e) => { e.currentTarget.src = 'https://images.unsplash.com/photo-1591076482161-42ce6da69f67?auto=format&fit=crop&w=600&q=80'; }}
                      className="w-full h-full object-cover transition-transform group-hover:scale-105" 
                    />
                  </div>
                  <h4 className="font-serif text-xs font-bold text-premium-black truncate group-hover:text-premium-accent">
                    {product.name}
                  </h4>
                  <div className="text-[10px] text-premium-accent font-semibold mt-1">
                    ₹{parseFloat(product.price).toLocaleString('en-IN')}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

      </div> {/* Closes the outer page container */}

      {/* Floating Comparison Tray */}
      {compareList.length > 0 && (
        <div className="fixed bottom-0 inset-x-0 bg-premium-black text-white p-4 border-t border-premium-accent/40 z-40 shadow-2xl backdrop-blur-md bg-opacity-95">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="bg-premium-accent text-premium-black rounded-full w-5 h-5 flex items-center justify-center font-bold text-xs shrink-0">{compareList.length}</span>
              <div>
                <p className="font-serif text-sm font-bold tracking-wide">Frame Comparison Tray</p>
                <p className="text-[10px] text-gray-400">Add up to 3 frames to compare specs side-by-side</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                {compareList.map(item => (
                  <div key={item.id} className="relative group/tray">
                    <img src={item.image_urls[0]} alt={item.name} className="w-10 h-10 object-contain bg-white rounded border border-premium-border p-1" />
                    <button 
                      onClick={() => handleToggleCompare(item)}
                      className="absolute -top-1.5 -right-1.5 bg-red-600 text-white rounded-full p-0.5 hover:bg-red-700 transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
                {Array.from({ length: Math.max(0, 3 - compareList.length) }).map((_, i) => (
                  <div key={i} className="w-10 h-10 border border-dashed border-gray-600 rounded flex items-center justify-center text-[10px] text-gray-500 font-bold font-mono">
                    +
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <Link 
                  href={`/compare?ids=${compareList.map(item => item.id).join(',')}`}
                  className="bg-premium-accent hover:bg-premium-golddark text-premium-black text-xs font-bold uppercase tracking-wider px-5 py-2.5 rounded transition-all shadow"
                >
                  Compare Now
                </Link>
                <button 
                  onClick={() => setCompareList([])}
                  className="text-xs uppercase font-bold tracking-wider text-gray-400 hover:text-red-600 px-2.5 py-1.5 transition-colors"
                >
                  Clear
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quick View Modal */}
      {activeQuickViewProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white border border-premium-border rounded-lg max-w-2xl w-full p-6 sm:p-8 shadow-2xl relative flex flex-col md:flex-row gap-6 max-h-[90vh] overflow-y-auto">
            <button 
              onClick={() => setActiveQuickViewProduct(null)} 
              className="absolute top-4 right-4 text-premium-gray hover:text-premium-accent transition-colors p-1"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Left: Product Image */}
            <div className="md:w-1/2 flex flex-col items-center justify-center bg-premium-light rounded p-4 border border-premium-border">
              <img 
                src={Array.isArray(activeQuickViewProduct.image_urls) && activeQuickViewProduct.image_urls.length > 0 ? activeQuickViewProduct.image_urls[0] : 'https://images.unsplash.com/photo-1591076482161-42ce6da69f67?auto=format&fit=crop&w=600&q=80'} 
                alt={activeQuickViewProduct.name} 
                onError={(e) => { e.currentTarget.src = 'https://images.unsplash.com/photo-1591076482161-42ce6da69f67?auto=format&fit=crop&w=600&q=80'; }}
                className="max-h-[250px] object-cover rounded-lg"
              />
            </div>

            {/* Right: Product Details */}
            <div className="md:w-1/2 flex flex-col">
              <div className="text-[10px] uppercase tracking-wider text-premium-accent font-bold mb-1">
                {activeQuickViewProduct.gender} • {activeQuickViewProduct.category}
              </div>
              <h3 className="font-serif text-2xl font-bold text-premium-black mb-2">
                {activeQuickViewProduct.name}
              </h3>
              
              <div className="flex items-center gap-1.5 mb-4 text-xs text-amber-500">
                <Star className="w-4 h-4 fill-current" />
                <span className="font-semibold text-premium-dark">{parseFloat(activeQuickViewProduct.average_rating || 0).toFixed(1)}</span>
                <span className="text-gray-400">({activeQuickViewProduct.review_count} reviews)</span>
              </div>

              <div className="text-2xl font-black text-premium-black mb-4">
                ₹{parseFloat(activeQuickViewProduct.price).toLocaleString('en-IN')}
              </div>

              <p className="text-xs text-premium-gray leading-relaxed mb-6 font-light">
                {activeQuickViewProduct.description}
              </p>

              <div className="border border-premium-border rounded p-3 bg-premium-light text-xs font-semibold text-premium-dark mb-6 space-y-1">
                <div><span className="text-premium-gray">Shape:</span> {activeQuickViewProduct.frame_shape}</div>
                <div><span className="text-premium-gray">Stock status:</span> {activeQuickViewProduct.stock > 0 ? `${activeQuickViewProduct.stock} frames left` : <span className="text-red-600 font-bold">Out of stock</span>}</div>
              </div>

              <div className="flex gap-3 mt-auto pt-4 border-t border-premium-border/40">
                <button
                  disabled={activeQuickViewProduct.stock === 0}
                  onClick={() => {
                    addToCart(activeQuickViewProduct);
                    setActiveQuickViewProduct(null);
                  }}
                  className="flex-grow bg-premium-black text-white hover:bg-premium-accent hover:text-premium-black font-semibold text-xs tracking-widest uppercase py-3 rounded transition-all flex items-center justify-center gap-2 disabled:opacity-40"
                >
                  <ShoppingBag className="w-4 h-4" /> Add to Cart
                </button>
                <Link
                  href={`/tryon?product_id=${activeQuickViewProduct.id}`}
                  className="bg-amber-400 text-black hover:bg-black hover:text-amber-400 border border-amber-400 font-bold text-xs tracking-wider uppercase px-4 py-3 rounded transition-all flex items-center justify-center gap-1.5 shrink-0"
                >
                  <Sparkles className="w-4 h-4" /> 3D Try-On
                </Link>
                <button
                  onClick={() => {
                    toggleWishlist(activeQuickViewProduct);
                  }}
                  className={`p-3 border rounded transition-all ${
                    wishlist.some(w => w.id === activeQuickViewProduct.id) 
                      ? 'border-premium-accent bg-premium-accent/10 text-premium-accent' 
                      : 'border-premium-border hover:border-premium-accent text-premium-gray'
                  }`}
                >
                  <Heart className="w-4 h-4 fill-current" />
                </button>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
