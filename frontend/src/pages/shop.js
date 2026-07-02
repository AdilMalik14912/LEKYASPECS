const React = require('react');
const { useState, useEffect } = React;
const Link = require('next/link').default;
const { useRouter } = require('next/router');
const { useAuth } = require('./_app');
const { Star, SlidersHorizontal, Grid, List, Check, RotateCcw, Search } = require('lucide-react');

export default function Shop() {
  const router = useRouter();
  const { user } = useAuth();
  
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
    fetch('${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/products/filters')
      .then(res => res.json())
      .then(data => {
        setFilterOptions(data);
        if (data.price_range) {
          setPriceRange(parseFloat(data.price_range.max_price || 10000));
        }
      })
      .catch(err => console.error('Error fetching filters:', err));
  }, []);

  // Fetch products whenever filters or sort changes
  useEffect(() => {
    if (!router.isReady) return;
    
    setLoading(true);
    let url = '${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/products?';
    
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
      .then(res => res.json())
      .then(data => {
        // Apply frontend sorting
        let sorted = [...data];
        if (sortOption === 'price-low') {
          sorted.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
        } else if (sortOption === 'price-high') {
          sorted.sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
        } else if (sortOption === 'rating') {
          sorted.sort((a, b) => parseFloat(b.average_rating || 0) - parseFloat(a.average_rating || 0));
        }
        setProducts(sorted);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching products:', err);
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

  return (
    <div className="bg-premium-light min-h-screen py-8 sm:py-12">
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
                {products.map(product => (
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
                      {product.stock === 0 && (
                        <span className="absolute top-2 left-2 bg-red-600 text-white text-[10px] uppercase font-bold px-2 py-0.5 rounded">Out of stock</span>
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
                    <div className="font-semibold text-premium-black mt-auto text-lg">
                      ₹{parseFloat(product.price).toLocaleString('en-IN')}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}
