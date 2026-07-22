const React = require('react');
const Link = require('next/link').default;
const { useCart } = require('./_app');
const { Trash2, ShoppingBag, Plus, Minus, ArrowRight, ShieldCheck } = require('lucide-react');

export default function Cart() {
  const { cart, removeFromCart, updateCartQuantity } = useCart();

  // Calculate totals
  const subtotal = cart.reduce((acc, item) => acc + parseFloat(item.product.price) * item.quantity, 0);
  const shipping = 0; // Free shipping
  const total = subtotal + shipping;

  if (cart.length === 0) {
    return (
      <div className="bg-premium-black min-h-screen py-16 sm:py-24 text-center">
        <div className="max-w-md mx-auto px-4">
          <ShoppingBag className="w-16 h-16 text-premium-accent mx-auto mb-4 animate-pulse-subtle" />
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-premium-black mb-2">Your Bag is Empty</h2>
          <p className="text-sm text-premium-gray mb-8">
            You haven't added any premium frames to your shopping bag yet. Explore our collections to find your perfect fit.
          </p>
          <Link href="/shop" className="bg-premium-black text-white hover:bg-premium-accent hover:text-premium-black font-semibold text-xs tracking-widest uppercase px-8 py-4 rounded transition-all inline-block">
            Start Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-premium-black min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <h1 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-premium-black mb-10 text-center sm:text-left">
          Shopping Bag
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* 1. Left side: Items List */}
          <div className="lg:col-span-2 space-y-4">
            {cart.map(item => (
              <div key={item.product.id} className="bg-white border border-premium-border rounded p-4 sm:p-6 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
                
                {/* Product thumbnail & metadata */}
                <div className="flex items-center gap-4 w-full sm:w-auto">
                  <div className="w-20 h-20 bg-premium-light rounded border border-premium-border overflow-hidden shrink-0 flex items-center justify-center">
                    <img src={item.product.image_urls[0]} alt={item.product.name} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h3 className="font-serif text-base font-bold text-premium-black hover:text-premium-accent transition-colors">
                      <Link href={`/product/${item.product.id}`}>{item.product.name}</Link>
                    </h3>
                    <p className="text-xs text-premium-gray mt-1">Shape: {item.product.frame_shape} • Gender: {item.product.gender}</p>
                    <p className="text-sm font-semibold text-premium-accent mt-2">₹{parseFloat(item.product.price).toLocaleString('en-IN')}</p>
                    {item.product.stock <= 5 && item.product.stock > 0 && (
                      <p className="text-[10px] text-amber-600 font-bold mt-1 uppercase tracking-wider">Only {item.product.stock} left</p>
                    )}
                    {item.product.stock === 0 && (
                      <p className="text-[10px] text-red-600 font-bold mt-1 uppercase tracking-wider">Out of stock</p>
                    )}
                  </div>
                </div>

                {/* Operations: quantity counter & trash */}
                <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-6 border-t sm:border-t-0 pt-3 sm:pt-0">
                  
                  {/* Quantity Counter */}
                  <div className="flex items-center border border-premium-border rounded bg-premium-light">
                    <button
                      onClick={() => updateCartQuantity(item.product.id, item.quantity - 1)}
                      className="p-2 hover:text-premium-accent transition-colors"
                      title="Decrease quantity"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="px-3 text-sm font-semibold text-premium-dark">{item.quantity}</span>
                    <button
                      onClick={() => updateCartQuantity(item.product.id, item.quantity + 1)}
                      className="p-2 hover:text-premium-accent transition-colors"
                      title="Increase quantity"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Price product total & Remove */}
                  <div className="flex items-center gap-4">
                    <div className="text-right hidden sm:block">
                      <p className="text-sm font-bold text-premium-black">
                        ₹{(parseFloat(item.product.price) * item.quantity).toLocaleString('en-IN')}
                      </p>
                    </div>
                    
                    <button
                      onClick={() => removeFromCart(item.product.id)}
                      className="p-2 text-premium-gray hover:text-red-600 transition-colors"
                      title="Remove item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                </div>

              </div>
            ))}
          </div>

          {/* 2. Right side: Order Summary */}
          <div>
            <div className="bg-white border border-premium-border rounded p-6 shadow-sm">
              <h2 className="font-serif text-lg font-bold text-premium-black border-b border-premium-border pb-4 mb-6">
                Order Summary
              </h2>

              <div className="space-y-3 text-sm font-medium mb-6">
                <div className="bg-premium-light border border-premium-border rounded p-3 mb-4 flex items-center justify-between text-xs font-semibold text-premium-dark">
                  <span>Have a coupon?</span>
                  <span className="text-premium-gray">Apply at checkout</span>
                </div>
                <div className="flex items-center justify-between text-premium-gray">
                  <span>Bag Subtotal</span>
                  <span className="text-premium-dark">₹{subtotal.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex items-center justify-between text-premium-gray">
                  <span>Shipping</span>
                  <span className="text-green-600 uppercase text-xs font-bold">Free</span>
                </div>
                <div className="border-t border-premium-border pt-4 mt-4 flex items-center justify-between text-base font-bold text-premium-black">
                  <span>Total Amount</span>
                  <span className="text-premium-accent">₹{total.toLocaleString('en-IN')}</span>
                </div>
              </div>

              <div className="space-y-4">
                <Link href="/checkout" className="w-full bg-premium-black text-white hover:bg-premium-accent hover:text-premium-black font-semibold text-xs tracking-widest uppercase py-4 rounded transition-all text-center flex items-center justify-center gap-2">
                  Proceed to Checkout
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <Link href="/shop" className="w-full border border-premium-border hover:border-premium-accent text-premium-dark font-semibold text-xs tracking-widest uppercase py-4 rounded transition-all text-center block">
                  Continue Shopping
                </Link>
              </div>

              {/* Security trust badge */}
              <div className="mt-6 border-t border-premium-border pt-4 flex items-center justify-center gap-2 text-xs text-premium-gray font-medium">
                <ShieldCheck className="w-4 h-4 text-premium-accent" />
                Secure Checkout with Razorpay
              </div>

            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
