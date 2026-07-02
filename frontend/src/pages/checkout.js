const React = require('react');
const { useState, useEffect } = React;
const Link = require('next/link').default;
const { useRouter } = require('next/router');
const { useCart, useAuth } = require('./_app');
const { ShieldCheck, ShoppingBag, CreditCard, ArrowLeft, Loader2, Sparkles, CheckCircle2 } = require('lucide-react');

export default function Checkout() {
  const router = useRouter();
  const { cart, clearCart } = useCart();
  const { user, token } = useAuth();

  // Redirect to account if not logged in, or cart if empty
  useEffect(() => {
    if (!token) {
      router.push('/account?redirect=checkout');
    } else if (cart.length === 0) {
      router.push('/cart');
    }
  }, [token, cart]);

  // Form fields
  const [name, setName] = useState(user ? user.name : '');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [stateName, setStateName] = useState('');
  const [zip, setZip] = useState('');
  const [phone, setPhone] = useState('');
  
  // Checkout process states
  const [isProcessing, setIsProcessing] = useState(false);
  const [checkoutError, setCheckoutError] = useState('');
  
  // Mock Payment Simulator states
  const [showMockModal, setShowMockModal] = useState(false);
  const [mockOrderDetails, setMockOrderDetails] = useState(null);
  
  // Success order state
  const [orderSuccessId, setOrderSuccessId] = useState(null);

  // Load Razorpay Script dynamically
  const loadRazorpay = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  // Subtotal calculation
  const subtotal = cart.reduce((acc, item) => acc + parseFloat(item.product.price) * item.quantity, 0);
  
  // Coupon state
  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState('');
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponError, setCouponError] = useState('');
  const [couponSuccess, setCouponSuccess] = useState('');

  const handleApplyCoupon = () => {
    setCouponError('');
    setCouponSuccess('');
    const code = couponInput.toUpperCase().trim();
    if (code === 'LEKYA20') {
      setAppliedCoupon('LEKYA20');
      setCouponDiscount(0.20);
      setCouponSuccess('20% Discount Coupon Applied Successfully!');
    } else if (code === 'WELCOME10') {
      setAppliedCoupon('WELCOME10');
      setCouponDiscount(0.10);
      setCouponSuccess('10% Discount Coupon Applied Successfully!');
    } else {
      setCouponError('Invalid Coupon Code');
    }
  };

  const discountAmount = subtotal * couponDiscount;
  const total = subtotal - discountAmount;

  // Handle Checkout submission
  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (cart.length === 0) return;

    setIsProcessing(true);
    setCheckoutError('');

    const shippingAddress = { name, address, city, state: stateName, zip, phone };
    const itemsPayload = cart.map(item => ({
      productId: item.product.id,
      quantity: item.quantity
    }));

    try {
      // 1. Create order on backend
      const createRes = await fetch('${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/orders/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ items: itemsPayload, couponCode: appliedCoupon })
      });

      const orderData = await createRes.json();
      if (!createRes.ok) {
        throw new Error(orderData.message || 'Failed to create order on backend');
      }

      // 2. Check if mock environment
      if (orderData.isMock) {
        setIsProcessing(false);
        setMockOrderDetails({ ...orderData, shippingAddress, items: itemsPayload });
        setShowMockModal(true);
        return;
      }

      // 3. Run real Razorpay modal
      const isScriptLoaded = await loadRazorpay();
      if (!isScriptLoaded) {
        throw new Error('Razorpay SDK failed to load. Check your internet connection.');
      }

      const options = {
        key: orderData.key_id,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'Lekya Specs',
        description: 'Eyewear Checkout Purchase',
        order_id: orderData.id,
        handler: async function (response) {
          try {
            setIsProcessing(true);
            const verifyRes = await fetch('${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/orders/verify', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
              },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                items: itemsPayload,
                shipping_address: shippingAddress,
                couponCode: appliedCoupon
              })
            });

            const verifyData = await verifyRes.json();
            if (verifyRes.ok) {
              clearCart();
              setOrderSuccessId(verifyData.orderId);
            } else {
              setCheckoutError(verifyData.message || 'Payment verification failed');
            }
          } catch (err) {
            setCheckoutError('Error verifying transaction');
          } finally {
            setIsProcessing(false);
          }
        },
        prefill: {
          name: shippingAddress.name,
          email: user.email,
          contact: shippingAddress.phone
        },
        theme: {
          color: '#c5a880'
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (response) {
        setCheckoutError('Payment failed: ' + response.error.description);
        setIsProcessing(false);
      });
      setIsProcessing(false);
      rzp.open();

    } catch (err) {
      console.error(err);
      setCheckoutError(err.message || 'Server error initiating checkout process');
      setIsProcessing(false);
    }
  };

  // Handle Mock Sandbox Payment Simulator Actions
  const handleMockPaymentAction = async (success) => {
    setShowMockModal(false);
    
    if (!success) {
      setCheckoutError('Sandbox payment simulation cancelled / failed.');
      return;
    }

    setIsProcessing(true);
    try {
      const verifyRes = await fetch('${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/orders/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          razorpay_order_id: mockOrderDetails.id,
          razorpay_payment_id: `pay_mock_${Math.random().toString(36).substr(2, 9)}`,
          razorpay_signature: 'dummy_signature',
          items: mockOrderDetails.items,
          shipping_address: mockOrderDetails.shippingAddress,
          isMockPayment: true,
          couponCode: appliedCoupon
        })
      });

      const verifyData = await verifyRes.json();
      if (verifyRes.ok) {
        clearCart();
        setOrderSuccessId(verifyData.orderId);
      } else {
        setCheckoutError(verifyData.message || 'Mock payment verification failed');
      }
    } catch (err) {
      console.error(err);
      setCheckoutError('Error saving mock transaction');
    } finally {
      setIsProcessing(false);
    }
  };

  // --- RENDERING: Order Success Screen ---
  if (orderSuccessId) {
    return (
      <div className="bg-premium-light min-h-screen py-16 sm:py-24 flex items-center justify-center">
        <div className="max-w-md w-full mx-4 bg-white border border-premium-border rounded p-8 sm:p-12 text-center shadow-sm">
          <CheckCircle2 className="w-16 h-16 text-green-600 mx-auto mb-6" />
          <h2 className="font-serif text-3xl font-bold text-premium-black mb-2">Order Confirmed</h2>
          <p className="text-sm text-premium-gray mb-1">Thank you for your purchase.</p>
          <p className="text-sm text-premium-dark font-semibold mb-6">Order Reference: #{orderSuccessId}</p>
          
          <div className="bg-premium-light p-4 rounded text-xs text-premium-gray leading-relaxed text-left border border-premium-border mb-8">
            <span className="font-bold text-premium-accent block mb-1">Confirmation Email Simulator:</span>
            An order receipt and warranty policy booklet have been dispatched to <strong>{user ? user.email : 'your inbox'}</strong>.
          </div>

          <div className="space-y-3">
            <Link href="/account" className="w-full bg-premium-black text-white hover:bg-premium-accent hover:text-premium-black font-semibold text-xs tracking-widest uppercase py-4 rounded transition-all text-center block">
              View Order History
            </Link>
            <Link href="/shop" className="w-full border border-premium-border hover:border-premium-accent text-premium-dark font-semibold text-xs tracking-widest uppercase py-4 rounded transition-all text-center block">
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-premium-light min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Back Link */}
        <div className="mb-6">
          <Link href="/cart" className="text-xs uppercase tracking-wider text-premium-gray hover:text-premium-accent transition-colors flex items-center gap-1 font-semibold">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Cart
          </Link>
        </div>

        <h1 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-premium-black mb-10 text-center sm:text-left">
          Checkout Details
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* 1. Left Column: Address Form */}
          <div className="lg:col-span-2 bg-white border border-premium-border rounded p-6 sm:p-10 shadow-sm">
            <h2 className="font-serif text-xl font-bold text-premium-black border-b border-premium-border pb-4 mb-6">
              Shipping Address
            </h2>

            <form onSubmit={handlePlaceOrder} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs uppercase tracking-wider text-premium-gray font-semibold mb-2">Recipient Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="John Doe"
                    className="w-full bg-premium-light text-sm border border-premium-border rounded p-3 focus:outline-none focus:border-premium-accent text-premium-dark font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider text-premium-gray font-semibold mb-2">Phone Number</label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="9876543210"
                    className="w-full bg-premium-light text-sm border border-premium-border rounded p-3 focus:outline-none focus:border-premium-accent text-premium-dark font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-premium-gray font-semibold mb-2">Street Address</label>
                <input
                  type="text"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Flat No, Apartment, Street name"
                  className="w-full bg-premium-light text-sm border border-premium-border rounded p-3 focus:outline-none focus:border-premium-accent text-premium-dark font-medium"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs uppercase tracking-wider text-premium-gray font-semibold mb-2">City</label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="New Delhi"
                    className="w-full bg-premium-light text-sm border border-premium-border rounded p-3 focus:outline-none focus:border-premium-accent text-premium-dark font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider text-premium-gray font-semibold mb-2">State</label>
                  <input
                    type="text"
                    required
                    value={stateName}
                    onChange={(e) => setStateName(e.target.value)}
                    placeholder="Delhi"
                    className="w-full bg-premium-light text-sm border border-premium-border rounded p-3 focus:outline-none focus:border-premium-accent text-premium-dark font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider text-premium-gray font-semibold mb-2">ZIP Code</label>
                  <input
                    type="text"
                    required
                    value={zip}
                    onChange={(e) => setZip(e.target.value)}
                    placeholder="110001"
                    className="w-full bg-premium-light text-sm border border-premium-border rounded p-3 focus:outline-none focus:border-premium-accent text-premium-dark font-medium"
                  />
                </div>
              </div>

              {checkoutError && (
                <div className="text-red-600 text-xs font-semibold p-3 bg-red-50 rounded border border-red-200">
                  {checkoutError}
                </div>
              )}

              <button
                type="submit"
                disabled={isProcessing}
                className="w-full mt-6 bg-premium-black text-white hover:bg-premium-accent hover:text-premium-black font-semibold text-xs tracking-widest uppercase py-4 rounded transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Preparing Payment SDK...
                  </>
                ) : (
                  <>
                    <CreditCard className="w-4 h-4" /> Pay with Razorpay Secure
                  </>
                )}
              </button>
            </form>
          </div>

          {/* 2. Right Column: Order Items Summary */}
          <div>
            <div className="bg-white border border-premium-border rounded p-6 shadow-sm">
              <h2 className="font-serif text-lg font-bold text-premium-black border-b border-premium-border pb-4 mb-6 flex items-center gap-1.5">
                <ShoppingBag className="w-4 h-4 text-premium-accent" /> Order Summary
              </h2>

              <div className="space-y-4 max-h-[250px] overflow-y-auto mb-6 pr-2">
                {cart.map(item => (
                  <div key={item.product.id} className="flex justify-between text-sm">
                    <div className="flex gap-3">
                      <div className="w-10 h-10 bg-premium-light border rounded overflow-hidden shrink-0 flex items-center justify-center">
                        <img src={item.product.image_urls[0]} alt={item.product.name} className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <span className="font-semibold text-premium-black block max-w-[120px] truncate">{item.product.name}</span>
                        <span className="text-xs text-premium-gray">Qty: {item.quantity}</span>
                      </div>
                    </div>
                    <span className="font-bold text-premium-dark">₹{parseFloat(item.product.price * item.quantity).toLocaleString('en-IN')}</span>
                  </div>
                ))}
              </div>

              {/* Promo Code Input */}
              <div className="border-t border-premium-border pt-4 mb-4">
                <label className="block text-[10px] uppercase tracking-wider text-premium-gray font-semibold mb-1.5">Apply Promo Code</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Enter Coupon (e.g. LEKYA20)"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value)}
                    className="flex-grow bg-premium-light border border-premium-border rounded px-3 py-1.5 text-xs font-medium focus:outline-none focus:border-premium-accent text-premium-dark"
                  />
                  <button
                    type="button"
                    onClick={handleApplyCoupon}
                    className="bg-premium-black text-white hover:bg-premium-accent hover:text-premium-black font-semibold text-[10px] tracking-wider uppercase px-4 py-2 rounded transition-all"
                  >
                    Apply
                  </button>
                </div>
                {couponError && <p className="text-red-600 text-[10px] font-semibold mt-1">{couponError}</p>}
                {couponSuccess && <p className="text-green-700 text-[10px] font-semibold mt-1">{couponSuccess}</p>}
              </div>

              <div className="border-t border-premium-border pt-4 space-y-2 text-sm font-semibold mb-6">
                <div className="flex justify-between text-premium-gray">
                  <span>Subtotal</span>
                  <span>₹{subtotal.toLocaleString('en-IN')}</span>
                </div>
                {couponDiscount > 0 && (
                  <div className="flex justify-between text-green-700 text-xs">
                    <span>Coupon Discount ({(couponDiscount * 100)}%)</span>
                    <span>- ₹{discountAmount.toLocaleString('en-IN')}</span>
                  </div>
                )}
                <div className="flex justify-between text-premium-gray">
                  <span>Shipping</span>
                  <span className="text-green-600 text-xs font-bold uppercase">Free</span>
                </div>
                <div className="flex justify-between text-base font-bold text-premium-black pt-2 border-t border-premium-border/40">
                  <span>Grand Total</span>
                  <span className="text-premium-accent text-lg">₹{total.toLocaleString('en-IN')}</span>
                </div>
              </div>

              <div className="text-[10px] text-premium-gray leading-relaxed flex gap-2 p-3 bg-premium-light border border-premium-border rounded">
                <ShieldCheck className="w-5 h-5 text-premium-accent shrink-0" />
                <span>Specs uses 256-bit SSL secure encryption. Razorpay gateway manages transaction endpoints securely.</span>
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* --- MOCK PAYMENTS SANDBOX MODAL SIMULATOR --- */}
      {showMockModal && mockOrderDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white border border-premium-border rounded-lg max-w-md w-full p-6 sm:p-8 shadow-2xl relative animate-slide-up">
            
            <div className="inline-flex items-center gap-1.5 bg-premium-accent/15 border border-premium-accent/40 text-premium-golddark px-3 py-1 rounded text-[10px] font-bold uppercase tracking-wider mb-4">
              <Sparkles className="w-3.5 h-3.5" /> Sandbox Simulation Mode
            </div>

            <h3 className="font-serif text-2xl font-bold text-premium-black mb-2">
              Razorpay Checkout
            </h3>
            <p className="text-xs text-premium-gray mb-6 leading-relaxed">
              Dummy keys detected. We have simulated the Razorpay checkout overlay. Select a payment option below to verify database transaction integration.
            </p>

            <div className="border border-premium-border rounded bg-premium-light p-4 text-xs font-medium text-premium-dark mb-6 space-y-1">
              <div><span className="text-premium-gray">Amount:</span> <strong>₹{(mockOrderDetails.amount / 100).toLocaleString('en-IN')}</strong></div>
              <div><span className="text-premium-gray">Receipt Ref:</span> <strong>{mockOrderDetails.receipt}</strong></div>
              <div><span className="text-premium-gray">Order ID:</span> <strong>{mockOrderDetails.id}</strong></div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => handleMockPaymentAction(true)}
                className="bg-green-600 hover:bg-green-700 text-white font-bold uppercase tracking-wider text-xs py-3.5 rounded transition-all"
              >
                Simulate Success
              </button>
              <button
                onClick={() => handleMockPaymentAction(false)}
                className="border border-premium-border hover:bg-red-50 hover:border-red-200 hover:text-red-600 text-premium-dark font-bold uppercase tracking-wider text-xs py-3.5 rounded transition-all"
              >
                Simulate Cancel
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
