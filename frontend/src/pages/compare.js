const React = require('react');
const { useState, useEffect } = React;
const Link = require('next/link').default;
const { useCart, useWishlist } = require('./_app');
const { Plus, X, ShoppingBag, Heart, Scale, Check, Star, ChevronDown } = require('lucide-react');

const SPEC_FIELDS = [
  { key: 'price',       label: 'Price',         format: (v) => `₹${parseFloat(v).toLocaleString('en-IN')}` },
  { key: 'category',    label: 'Category',      format: (v) => v },
  { key: 'gender',      label: 'For',           format: (v) => v },
  { key: 'frame_shape', label: 'Frame Shape',   format: (v) => v },
  { key: 'material',    label: 'Material',      format: (v) => v || 'Premium Acetate' },
  { key: 'stock',       label: 'Availability',  format: (v) => v > 0 ? `✓ In Stock (${v})` : '✗ Out of Stock' },
  { key: 'average_rating', label: 'Rating',     format: (v) => `${parseFloat(v || 0).toFixed(1)} ★` },
  { key: 'review_count',   label: 'Reviews',    format: (v) => `${v || 0} reviews` },
];

export default function CompareFrames() {
  const { addToCart } = useCart();
  const { wishlist, toggleWishlist } = useWishlist();
  const [allProducts, setAllProducts] = useState([]);
  const [compareList, setCompareList] = useState([null, null, null]);
  const [searchQuery, setSearchQuery] = useState(['', '', '']);
  const [searchResults, setSearchResults] = useState([[], [], []]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:5000/api/products')
      .then(res => res.json())
      .then(data => { setAllProducts(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const handleSearch = (slotIdx, query) => {
    const newQueries = [...searchQuery];
    newQueries[slotIdx] = query;
    setSearchQuery(newQueries);

    if (!query.trim()) {
      const newResults = [...searchResults];
      newResults[slotIdx] = [];
      setSearchResults(newResults);
      return;
    }

    const filtered = allProducts
      .filter(p => 
        p.name.toLowerCase().includes(query.toLowerCase()) ||
        p.category.toLowerCase().includes(query.toLowerCase()) ||
        p.frame_shape.toLowerCase().includes(query.toLowerCase())
      )
      .filter(p => !compareList.some(c => c && c.id === p.id))
      .slice(0, 5);

    const newResults = [...searchResults];
    newResults[slotIdx] = filtered;
    setSearchResults(newResults);
  };

  const selectProduct = (slotIdx, product) => {
    const newList = [...compareList];
    newList[slotIdx] = product;
    setCompareList(newList);

    const newQueries = [...searchQuery];
    newQueries[slotIdx] = '';
    setSearchQuery(newQueries);

    const newResults = [...searchResults];
    newResults[slotIdx] = [];
    setSearchResults(newResults);
  };

  const removeProduct = (slotIdx) => {
    const newList = [...compareList];
    newList[slotIdx] = null;
    setCompareList(newList);
  };

  const filledSlots = compareList.filter(Boolean);
  
  // Find best value for highlighting winner on each spec
  const getBestSlot = (field) => {
    if (field === 'price') {
      const prices = compareList.map(p => p ? parseFloat(p.price) : Infinity);
      const min = Math.min(...prices);
      return prices.indexOf(min);
    }
    if (field === 'average_rating' || field === 'review_count' || field === 'stock') {
      const vals = compareList.map(p => p ? parseFloat(p[field] || 0) : -1);
      const max = Math.max(...vals);
      return vals.indexOf(max);
    }
    return -1;
  };

  return (
    <div className="bg-premium-light min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-1.5 bg-premium-accent/15 border border-premium-accent/40 text-premium-golddark px-3 py-1 rounded text-xs font-bold uppercase tracking-wider mb-4">
            <Scale className="w-3.5 h-3.5" /> Frame Comparison
          </div>
          <h1 className="font-serif text-3xl sm:text-5xl font-bold text-premium-black tracking-tight mb-2">
            Compare Frames
          </h1>
          <p className="text-sm text-premium-gray font-light">
            Add up to 3 frames side-by-side to find your perfect match.
          </p>
        </div>

        {/* Comparison Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {compareList.map((product, slotIdx) => (
            <div key={slotIdx} className="flex flex-col">
              
              {/* Product Slot */}
              {product ? (
                <div className="bg-white border border-premium-border rounded-lg overflow-hidden shadow-sm">
                  
                  {/* Product Image */}
                  <div className="relative">
                    <img 
                      src={product.image_urls[0]} 
                      alt={product.name}
                      className="w-full h-52 object-cover"
                    />
                    <button
                      onClick={() => removeProduct(slotIdx)}
                      className="absolute top-3 right-3 w-8 h-8 bg-black/60 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-all"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    {filledSlots.length > 0 && slotIdx === getBestSlot('price') && (
                      <div className="absolute top-3 left-3 bg-green-600 text-white text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded">
                        Best Value
                      </div>
                    )}
                  </div>
                  
                  {/* Name & Price */}
                  <div className="p-4 border-b border-premium-border">
                    <Link href={`/product/${product.id}`} className="font-serif font-bold text-lg text-premium-black hover:text-premium-accent transition-colors leading-tight block mb-1">
                      {product.name}
                    </Link>
                    <div className="text-2xl font-bold text-premium-accent">
                      ₹{parseFloat(product.price).toLocaleString('en-IN')}
                    </div>
                    <div className="flex text-amber-500 mt-1">
                      {[1,2,3,4,5].map(s => (
                        <Star key={s} className={`w-3 h-3 ${s <= Math.round(parseFloat(product.average_rating || 0)) ? 'fill-current' : 'text-gray-300'}`} />
                      ))}
                      <span className="text-xs text-premium-gray ml-1">({product.review_count})</span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="p-4 flex gap-2">
                    <button
                      onClick={() => addToCart(product)}
                      className="flex-grow bg-premium-black text-white hover:bg-premium-accent hover:text-premium-black text-xs font-bold uppercase tracking-wider py-2.5 rounded transition-all flex items-center justify-center gap-1.5"
                    >
                      <ShoppingBag className="w-4 h-4" /> Add to Bag
                    </button>
                    <button
                      onClick={() => toggleWishlist(product)}
                      className={`p-2.5 border rounded transition-all ${wishlist.some(w => w.id === product.id) ? 'border-red-200 bg-red-50 text-red-500' : 'border-premium-border hover:border-premium-accent text-premium-gray'}`}
                    >
                      <Heart className={`w-4 h-4 ${wishlist.some(w => w.id === product.id) ? 'fill-current' : ''}`} />
                    </button>
                  </div>
                </div>
              ) : (
                /* Empty Slot */
                <div className="bg-white border-2 border-dashed border-premium-border rounded-lg p-6 flex flex-col items-center justify-center min-h-[280px] hover:border-premium-accent/50 transition-colors">
                  <Plus className="w-10 h-10 text-premium-border mb-3" />
                  <p className="text-sm text-premium-gray font-semibold mb-4 text-center">Add a frame to compare</p>
                  <div className="w-full relative">
                    <input
                      type="text"
                      placeholder="Search frames..."
                      value={searchQuery[slotIdx]}
                      onChange={(e) => handleSearch(slotIdx, e.target.value)}
                      className="w-full border border-premium-border rounded p-2.5 text-xs focus:outline-none focus:border-premium-accent text-premium-dark"
                    />
                    {searchResults[slotIdx].length > 0 && (
                      <div className="absolute top-full left-0 right-0 bg-white border border-premium-border rounded mt-1 shadow-lg z-10 max-h-48 overflow-y-auto">
                        {searchResults[slotIdx].map(result => (
                          <button
                            key={result.id}
                            onClick={() => selectProduct(slotIdx, result)}
                            className="w-full text-left px-3 py-2.5 hover:bg-premium-light flex items-center gap-3 border-b border-premium-border/40 last:border-0"
                          >
                            <img src={result.image_urls[0]} alt={result.name} className="w-10 h-10 object-cover rounded" />
                            <div>
                              <p className="text-xs font-semibold text-premium-black">{result.name}</p>
                              <p className="text-[10px] text-premium-gray">₹{parseFloat(result.price).toLocaleString('en-IN')} · {result.frame_shape}</p>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

            </div>
          ))}
        </div>

        {/* Spec Comparison Table */}
        {filledSlots.length >= 2 && (
          <div className="mt-8 bg-white border border-premium-border rounded-lg overflow-hidden shadow-sm">
            <div className="bg-premium-black text-white px-6 py-4">
              <h2 className="font-serif text-lg font-bold flex items-center gap-2">
                <Scale className="w-5 h-5 text-premium-accent" /> Detailed Comparison
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-premium-light border-b border-premium-border">
                    <th className="text-left px-6 py-3 text-[10px] uppercase tracking-wider text-premium-gray font-bold w-32">Specification</th>
                    {compareList.map((p, i) => (
                      <th key={i} className="text-left px-6 py-3 text-xs font-bold text-premium-black">
                        {p ? p.name : <span className="text-premium-gray font-normal italic">Empty slot</span>}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-premium-border">
                  {SPEC_FIELDS.map((field) => {
                    const bestSlot = getBestSlot(field.key);
                    return (
                      <tr key={field.key} className="hover:bg-premium-light/30">
                        <td className="px-6 py-3.5 text-xs text-premium-gray font-semibold uppercase tracking-wider">{field.label}</td>
                        {compareList.map((p, i) => (
                          <td key={i} className={`px-6 py-3.5 text-sm font-medium ${
                            bestSlot === i && p ? 'text-green-700 font-bold' : 'text-premium-dark'
                          }`}>
                            {p ? (
                              <span className="flex items-center gap-1.5">
                                {field.format(p[field.key])}
                                {bestSlot === i && ['price','average_rating','stock'].includes(field.key) && (
                                  <Check className="w-3.5 h-3.5 text-green-600" />
                                )}
                              </span>
                            ) : (
                              <span className="text-premium-border">—</span>
                            )}
                          </td>
                        ))}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {filledSlots.length < 2 && (
          <p className="text-center mt-10 text-sm text-premium-gray">Add at least 2 frames to see a detailed comparison table.</p>
        )}

      </div>
    </div>
  );
}
