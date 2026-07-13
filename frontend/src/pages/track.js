const React = require('react');
const { useState, useEffect } = React;
const { useRouter } = require('next/router');
const Link = require('next/link').default;
const {
  Search, Package, RefreshCw, Gift, Truck, Navigation, CheckCircle2,
  Clock, MapPin, Sparkles, Inbox, AlertCircle, Calendar, ArrowRight, User
} = require('lucide-react');

const API_BASE = typeof window !== 'undefined'
  ? (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' ? 'http://localhost:5000' : '')
  : '';

const ALL_STATUSES = ['Payment Confirmed', 'Processing', 'Packed', 'Shipped', 'Out for Delivery', 'Delivered'];

const STATUS_ICONS = {
  'Payment Confirmed': Package,
  'Processing':        RefreshCw,
  'Packed':            Gift,
  'Shipped':           Truck,
  'Out for Delivery':  Navigation,
  'Delivered':         CheckCircle2
};

const STATUS_DETAILS = {
  'Payment Confirmed': 'Payment confirmed successfully. We are preparing to process your items.',
  'Processing':        'Your prescription lens is being custom-fit and quality tested in our laboratory.',
  'Packed':            'Frames have been certified by our stylists, packaged, and handed over to courier dispatch.',
  'Shipped':           'The shipment has left our central hub. Courier tracking link updated.',
  'Out for Delivery':  'Our local agent is en route. Please keep your delivery OTP ready.',
  'Delivered':         'Shipment handed over. Thank you for choosing Lekya Specs!'
};

export default function PublicTracker() {
  const router = useRouter();
  const [trackingId, setTrackingId] = useState('');
  const [loading, setLoading] = useState(false);
  const [order, setOrder] = useState(null);
  const [error, setError] = useState('');

  // Handle auto-track if ID is in query string
  useEffect(() => {
    if (!router.isReady) return;
    const { id } = router.query;
    if (id) {
      setTrackingId(id.toString().toUpperCase().trim());
      fetchTrackingInfo(id.toString());
    }
  }, [router.isReady, router.query]);

  const fetchTrackingInfo = async (idToSearch) => {
    const cleanId = (idToSearch || trackingId).trim().toUpperCase();
    if (!cleanId) return;

    setLoading(true);
    setError('');
    setOrder(null);

    try {
      const res = await fetch(`${API_BASE}/api/orders/track/${cleanId}`);
      const data = await res.json();

      if (res.ok) {
        setOrder(data);
      } else {
        setError(data.message || 'Tracking ID not found. Verify code format (e.g., LS1029384756).');
      }
    } catch (err) {
      setError('Connection to server failed. Please check network connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!trackingId) return;
    router.replace(`/track?id=${trackingId.trim().toUpperCase()}`, undefined, { shallow: true });
    fetchTrackingInfo();
  };

  const currentStatusIdx = order ? ALL_STATUSES.indexOf(order.status) : -1;

  return (
    <div className="min-h-screen bg-[#060606] text-white flex flex-col justify-between font-sans">
      
      {/* Decorative radial gradients */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-amber-500/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-10 right-1/4 w-[400px] h-[400px] bg-amber-500/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Header */}
      <header className="border-b border-white/5 bg-black/40 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 flex items-center justify-between h-20">
          <Link href="/" className="flex items-center gap-2 hover:opacity-85 transition-opacity">
            <svg width="34" height="17" viewBox="0 0 88 40" fill="none">
              <rect x="2" y="8" width="34" height="24" rx="12" stroke="#C5A028" strokeWidth="4" fill="none"/>
              <rect x="52" y="8" width="34" height="24" rx="12" stroke="#C5A028" strokeWidth="4" fill="none"/>
              <path d="M36 20 Q44 14 52 20" stroke="#C5A028" strokeWidth="3.5" fill="none" strokeLinecap="round"/>
            </svg>
            <span className="text-xs font-bold tracking-[0.4em] text-[#C5A028] uppercase font-serif">Lekya Specs</span>
          </Link>
          <Link href="/shop" className="text-[10px] uppercase font-bold tracking-widest text-gray-400 hover:text-[#C5A028] transition-colors">
            Shop Storefront
          </Link>
        </div>
      </header>

      {/* Main content container */}
      <main className="max-w-3xl mx-auto w-full px-4 py-16 relative z-10 flex-grow">
        
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/20 px-3 py-1 rounded-full text-amber-400 text-[10px] font-bold uppercase tracking-widest mb-4">
            <Sparkles className="w-3.5 h-3.5" /> Premium AI Logistics
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold font-serif tracking-wide text-white">
            Track Your Shipment
          </h1>
          <p className="text-xs text-gray-400 mt-2 max-w-md mx-auto leading-relaxed">
            Enter your 12-character unique tracking code starting with <strong className="text-amber-400">LS</strong> to trace fulfillment & styling milestones.
          </p>
        </div>

        {/* Input Form Search bar */}
        <form onSubmit={handleSearchSubmit} className="mb-10">
          <div className="relative group max-w-xl mx-auto">
            <div className="absolute inset-0 bg-gradient-to-r from-amber-500 to-amber-600 rounded-2xl blur opacity-15 group-focus-within:opacity-30 transition-opacity" />
            <div className="relative bg-[#0d0d0d] border border-white/10 rounded-2xl p-2 flex items-center shadow-2xl">
              <Search className="w-5 h-5 text-gray-500 ml-3 shrink-0" />
              <input
                type="text"
                required
                maxLength={12}
                placeholder="Enter Tracking ID (e.g. LS1029384756)"
                value={trackingId}
                onChange={(e) => setTrackingId(e.target.value.toUpperCase())}
                className="w-full bg-transparent border-none text-sm text-white placeholder-gray-600 font-mono font-bold tracking-wider px-3 focus:outline-none uppercase"
              />
              <button
                type="submit"
                disabled={loading}
                className="bg-[#C5A028] text-black hover:opacity-90 font-bold text-xs uppercase tracking-widest py-3.5 px-6 rounded-xl transition-all shadow-lg shrink-0 flex items-center gap-1.5"
              >
                {loading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : 'Track'}
              </button>
            </div>
          </div>
        </form>

        {/* Error panel display */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-200 rounded-2xl p-5 max-w-xl mx-auto flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-bold">Search Failure</p>
              <p className="text-[11px] opacity-75 mt-0.5">{error}</p>
            </div>
          </div>
        )}

        {/* Active search loading animation */}
        {loading && (
          <div className="text-center py-20">
            <div className="w-10 h-10 border-2 border-amber-500/30 border-t-amber-500 rounded-full animate-spin mx-auto mb-3" />
            <p className="text-xs text-gray-400 font-semibold font-mono tracking-widest uppercase">Syncing Live Status...</p>
          </div>
        )}

        {/* Tracking results card */}
        {order && !loading && (
          <div className="space-y-6">
            
            {/* Top Order Overview Banner */}
            <div className="bg-[#0f0f0f] border border-white/10 rounded-2xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-5 mb-5 text-xs">
                <div>
                  <span className="text-gray-400 block text-[10px] uppercase tracking-widest">Tracking Code</span>
                  <span className="text-sm font-black font-mono tracking-widest text-[#C5A028] block mt-0.5">
                    {order.tracking_id}
                  </span>
                </div>
                <div className="sm:text-right">
                  <span className="text-gray-400 block text-[10px] uppercase tracking-widest">Order Placed</span>
                  <span className="text-xs font-bold text-white flex items-center sm:justify-end gap-1.5 mt-0.5">
                    <Calendar className="w-3.5 h-3.5 text-gray-500" />
                    {new Date(order.created_at).toLocaleDateString('en-IN', {
                      year: 'numeric', month: 'long', day: 'numeric'
                    })}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                <div>
                  <span className="text-gray-400 block text-[10px] uppercase tracking-widest">Recipient</span>
                  <span className="font-bold text-white block mt-0.5 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-gray-500" /> {order.customer_name}
                  </span>
                </div>
                <div>
                  <span className="text-gray-400 block text-[10px] uppercase tracking-widest">Destination</span>
                  <span className="font-bold text-white block mt-0.5 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-gray-500" /> {order.city}
                  </span>
                </div>
                <div>
                  <span className="text-gray-400 block text-[10px] uppercase tracking-widest">Lens Package</span>
                  <span className="font-bold text-[#C5A028] block mt-0.5">
                    {order.lens_type || 'Standard Fitted'}
                  </span>
                </div>
                <div>
                  <span className="text-gray-400 block text-[10px] uppercase tracking-widest">Fulfillment</span>
                  <span className="font-black text-emerald-400 block mt-0.5 uppercase tracking-wider">
                    {order.status}
                  </span>
                </div>
              </div>
            </div>

            {/* Visual Tracking Timelines */}
            <div className="bg-[#0f0f0f] border border-white/10 rounded-2xl p-6 sm:p-8 shadow-2xl">
              <h3 className="text-xs font-black uppercase tracking-widest text-[#C5A028] mb-6">
                Fulfillment Timeline
              </h3>

              {/* ── HORIZONTAL STEP PROGRESS BAR ── */}
              <div style={{ overflowX: 'auto', paddingBottom: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', minWidth: 480, marginBottom: 32 }}>
                  {ALL_STATUSES.map((step, idx) => {
                    const StepIcon = STATUS_ICONS[step] || Package;
                    const isCompleted = idx < currentStatusIdx;
                    const isActive    = idx === currentStatusIdx;
                    return (
                      <React.Fragment key={step}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: '0 0 auto', zIndex: 2 }}>
                          <div style={{
                            width: 40, height: 40, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            transition: 'all 0.4s',
                            background: isCompleted ? 'rgba(52,211,153,0.15)' : isActive ? 'rgba(197,160,40,0.15)' : 'rgba(255,255,255,0.03)',
                            border: isCompleted ? '2px solid #34d399' : isActive ? '2px solid #C5A028' : '2px solid rgba(255,255,255,0.08)',
                            boxShadow: isActive ? '0 0 20px rgba(197,160,40,0.3), 0 0 40px rgba(197,160,40,0.1)' : 'none',
                          }}>
                            {isCompleted
                              ? <CheckCircle2 style={{ width: 18, height: 18, color: '#34d399' }} />
                              : <StepIcon style={{ width: 16, height: 16, color: isActive ? '#C5A028' : '#4b5563' }} />
                            }
                          </div>
                          <div style={{
                            fontSize: 9, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', marginTop: 8, textAlign: 'center', maxWidth: 64,
                            color: isActive ? '#C5A028' : isCompleted ? '#34d399' : '#4b5563', lineHeight: 1.3
                          }}>{step}</div>
                        </div>
                        {idx < ALL_STATUSES.length - 1 && (
                          <div style={{ flex: 1, height: 2, minWidth: 20, position: 'relative', margin: '0 4px', marginBottom: 28 }}>
                            <div style={{ position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.05)', borderRadius: 2 }} />
                            <div style={{
                              position: 'absolute', left: 0, top: 0, bottom: 0, borderRadius: 2,
                              background: 'linear-gradient(90deg, #C5A028, #f0c040)',
                              width: idx < currentStatusIdx ? '100%' : idx === currentStatusIdx - 1 ? '100%' : '0%',
                              transition: 'width 0.8s ease'
                            }} />
                          </div>
                        )}
                      </React.Fragment>
                    );
                  })}
                </div>
              </div>

              {/* ── VERTICAL DETAIL NODES ── */}
              <div className="space-y-8 relative before:absolute before:left-[17px] before:top-2 before:bottom-2 before:w-[2px] before:bg-white/5">
                
                {ALL_STATUSES.map((step, idx) => {
                  const StepIcon = STATUS_ICONS[step] || Package;
                  const isCompleted = idx < currentStatusIdx;
                  const isActive = idx === currentStatusIdx;
                  
                  return (
                    <div key={step} className="flex gap-4 relative">
                      {/* Timeline dot/icon */}
                      <div className={`w-9 h-9 rounded-full border flex items-center justify-center shrink-0 z-10 transition-all ${
                        isCompleted
                          ? 'bg-emerald-900/40 border-emerald-500 text-emerald-400 shadow-md shadow-emerald-500/10'
                          : isActive
                          ? 'bg-amber-500/20 border-[#C5A028] text-[#C5A028] shadow-md shadow-amber-500/10 scale-105'
                          : 'bg-[#121212] border-white/10 text-gray-600'
                      }`}>
                        {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : <StepIcon className="w-4 h-4" />}
                      </div>

                      {/* Content */}
                      <div className="flex-grow pt-1 text-xs">
                        <div className="flex items-center justify-between">
                          <h4 className={`font-bold uppercase tracking-wider ${
                            isActive ? 'text-[#C5A028] text-sm' : isCompleted ? 'text-emerald-400' : 'text-gray-500'
                          }`}>
                            {step}
                          </h4>
                          {isActive && (
                            <span className="bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[8px] font-black uppercase px-2 py-0.5 rounded tracking-widest animate-pulse">
                              ACTIVE STEP
                            </span>
                          )}
                          {isCompleted && (
                            <span className="text-emerald-500/50 text-[10px] font-bold">✓ Completed</span>
                          )}
                        </div>
                        <p className={`mt-1.5 leading-relaxed ${isActive ? 'text-gray-300 font-medium' : 'text-gray-500'}`}>
                          {STATUS_DETAILS[step] || 'Status milestone initialized.'}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Shipping Dispatch Notes */}
            {order.tracking_comments && (
              <div className="bg-[#0f0f0f] border border-amber-500/20 rounded-2xl p-6 shadow-2xl">
                <h4 className="text-xs font-black uppercase tracking-widest text-amber-400 mb-2 flex items-center gap-1.5">
                  <Clock className="w-4 h-4 animate-pulse" /> Dispatch Log & Notes
                </h4>
                <p className="text-xs text-gray-300 leading-relaxed font-mono">
                  {order.tracking_comments}
                </p>
              </div>
            )}

            {/* Shipment Items Preview */}
            <div className="bg-[#0f0f0f] border border-white/10 rounded-2xl p-6 sm:p-8 shadow-2xl">
              <h3 className="text-xs font-black uppercase tracking-widest text-[#C5A028] mb-4">
                Package Contents
              </h3>
              <div className="divide-y divide-white/5">
                {order.items.map((item, i) => (
                  <div key={i} className="py-3 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3">
                      {item.image ? (
                        <img src={item.image} alt={item.name} className="w-9 h-9 object-cover rounded border border-white/10" />
                      ) : (
                        <div className="w-9 h-9 bg-white/5 border border-white/10 rounded flex items-center justify-center text-gray-600">👓</div>
                      )}
                      <div>
                        <span className="font-bold text-white block">{item.name}</span>
                        <span className="text-[10px] text-gray-500 block mt-0.5">Quantity: {item.quantity}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 bg-black/60 py-8">
        <div className="max-w-5xl mx-auto px-4 text-center text-[10px] text-gray-600 uppercase tracking-widest font-bold">
          © 2026 Lekya Specs. Secure Package Tracking Portal.
        </div>
      </footer>

    </div>
  );
}
