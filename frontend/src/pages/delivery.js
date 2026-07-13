const React = require('react');
const { useState, useEffect, useRef } = React;
const Link = require('next/link').default;
const { useRouter } = require('next/router');
const { useAuth } = require('./_app');
const {
  Truck, MapPin, Package, CheckCircle2, Clock, AlertCircle,
  RefreshCw, Search, X, Navigation, ChevronRight, Star,
  Inbox, PhoneCall, User, Shield, SendHorizonal, RotateCcw,
  AlertTriangle, MessageSquare, Lock
} = require('lucide-react');

const API_BASE = typeof window !== 'undefined'
  ? (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' ? 'http://localhost:5000' : '')
  : '';

// Status order for forward-only enforcement on frontend
const STATUS_ORDER = {
  'Payment Confirmed': 1,
  'Processing':        2,
  'Packed':            3,
  'Shipped':           4,
  'Out for Delivery':  5,
  'Delivered':         6
};
const DELIVERY_STATUS_STEPS = ['Payment Confirmed', 'Processing', 'Packed', 'Shipped', 'Out for Delivery', 'Delivered'];

const STATUS_COLORS = {
  'Pending':           { bg: 'bg-yellow-500/15', text: 'text-yellow-400',  border: 'border-yellow-500/30' },
  'Paid':              { bg: 'bg-green-500/15',  text: 'text-green-400',   border: 'border-green-500/30' },
  'Payment Confirmed': { bg: 'bg-green-500/15',  text: 'text-green-400',   border: 'border-green-500/30' },
  'Processing':        { bg: 'bg-blue-500/15',   text: 'text-blue-400',    border: 'border-blue-500/30' },
  'Packed':            { bg: 'bg-violet-500/15', text: 'text-violet-400',  border: 'border-violet-500/30' },
  'Shipped':           { bg: 'bg-indigo-500/15', text: 'text-indigo-400',  border: 'border-indigo-500/30' },
  'Out for Delivery':  { bg: 'bg-orange-500/15', text: 'text-orange-400',  border: 'border-orange-500/30' },
  'Delivered':         { bg: 'bg-emerald-500/15',text: 'text-emerald-400', border: 'border-emerald-500/30' },
};

function StatCard({ icon: Icon, label, value, sub, color = 'gold' }) {
  const colorMap = {
    gold:    'from-amber-500/20 to-yellow-500/5 border-amber-400/30 text-amber-400',
    green:   'from-emerald-500/20 to-green-500/5 border-emerald-400/30 text-emerald-400',
    orange:  'from-orange-500/20 to-orange-500/5 border-orange-400/30 text-orange-400',
    indigo:  'from-indigo-500/20 to-indigo-500/5 border-indigo-400/30 text-indigo-400',
    blue:    'from-blue-500/20 to-blue-500/5 border-blue-400/30 text-blue-400',
  };
  return (
    <div className={`bg-gradient-to-br ${colorMap[color]} border rounded-xl p-5 shadow-lg`}>
      <div className="mb-3"><Icon className="w-6 h-6" /></div>
      <div className="text-3xl font-black text-white font-mono mb-1">{value}</div>
      <div className="text-xs font-bold tracking-widest uppercase text-gray-400">{label}</div>
      {sub && <div className="text-[10px] text-gray-500 mt-1">{sub}</div>}
    </div>
  );
}

function AddressDisplay({ address }) {
  if (!address || typeof address !== 'object') return <span className="text-gray-600 text-xs">No address</span>;
  const parts = [
    address.line1 || address.address,
    address.line2,
    address.city,
    address.state,
    address.pincode
  ].filter(Boolean);
  return (
    <div className="flex items-start gap-1.5">
      <MapPin className="w-3 h-3 text-orange-400 shrink-0 mt-0.5" />
      <span className="text-xs text-gray-400 leading-relaxed">{parts.join(', ')}</span>
    </div>
  );
}

// OTP Input Component — 6 individual digit boxes
function OtpInput({ value, onChange, disabled }) {
  const inputsRef = useRef([]);
  const digits = value.split('').concat(Array(6).fill('')).slice(0, 6);

  const handleChange = (idx, e) => {
    const val = e.target.value.replace(/\D/, '');
    const newDigits = [...digits];
    newDigits[idx] = val.slice(-1);
    onChange(newDigits.join(''));
    if (val && idx < 5) inputsRef.current[idx + 1]?.focus();
  };

  const handleKeyDown = (idx, e) => {
    if (e.key === 'Backspace' && !digits[idx] && idx > 0) {
      inputsRef.current[idx - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    onChange(pasted.padEnd(6, '').slice(0, 6));
    if (pasted.length > 0) inputsRef.current[Math.min(pasted.length - 1, 5)]?.focus();
  };

  return (
    <div className="flex gap-2 justify-center" onPaste={handlePaste}>
      {digits.map((d, i) => (
        <input
          key={i}
          ref={el => inputsRef.current[i] = el}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={d}
          disabled={disabled}
          onChange={e => handleChange(i, e)}
          onKeyDown={e => handleKeyDown(i, e)}
          onFocus={e => e.target.select()}
          className={`w-11 h-14 text-center text-2xl font-black rounded-xl border-2 bg-black/40 text-white outline-none transition-all
            ${d ? 'border-orange-400 shadow-orange-500/20 shadow-md' : 'border-white/15'}
            ${disabled ? 'opacity-50 cursor-not-allowed' : 'focus:border-orange-400 focus:shadow-md focus:shadow-orange-500/20'}
          `}
        />
      ))}
    </div>
  );
}

export default function DeliveryPanel() {
  const { user, token, logout } = useAuth();
  const router = useRouter();

  // Local toast
  const [toastMsg, setToastMsg] = React.useState(null);
  const showToast = (msg, type = 'success') => {
    setToastMsg({ msg, type });
    setTimeout(() => setToastMsg(null), 4000);
  };

  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState(null);
  const [myOrders, setMyOrders] = useState([]);
  const [availableOrders, setAvailableOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingAvailable, setLoadingAvailable] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);
  const [claimingId, setClaimingId] = useState(null);
  const [resendingId, setResendingId] = useState(null);

  // OTP modal state
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [pendingStatus, setPendingStatus] = useState(null);
  const [otpInput, setOtpInput] = useState('');
  const [otpError, setOtpError] = useState('');

  const authHeaders = { Authorization: `Bearer ${token}` };

  // Access guard
  useEffect(() => {
    if (!user) { router.push('/account'); return; }
    const allowed = ['delivery', 'admin'];
    const isAllowed = allowed.includes(user.role) ||
      user.email === 'dev.parceluncle@gmail.com' ||
      user.email === 'admin@specs.com';
    if (!isAllowed) { router.push('/'); return; }
  }, [user]);

  const fetchStats = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/delivery/stats`, { headers: authHeaders });
      if (res.ok) setStats(await res.json());
    } catch {}
  };

  const fetchMyOrders = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/delivery/my-orders`, { headers: authHeaders });
      if (res.ok) setMyOrders(await res.json());
    } catch {}
  };

  const fetchAvailable = async () => {
    setLoadingAvailable(true);
    try {
      const res = await fetch(`${API_BASE}/api/delivery/available`, { headers: authHeaders });
      if (res.ok) setAvailableOrders(await res.json());
    } catch {}
    setLoadingAvailable(false);
  };

  const fetchAll = async () => {
    if (!token) return;
    setLoading(true);
    await Promise.all([fetchStats(), fetchMyOrders()]);
    setLoading(false);
  };

  useEffect(() => { fetchAll(); }, [token]);
  useEffect(() => { if (activeTab === 'available') fetchAvailable(); }, [activeTab]);

  const handleClaimOrder = async (orderId) => {
    setClaimingId(orderId);
    try {
      const res = await fetch(`${API_BASE}/api/delivery/claim/${orderId}`, {
        method: 'POST',
        headers: authHeaders
      });
      const data = await res.json();
      if (res.ok) {
        showToast(data.message);
        setAvailableOrders(prev => prev.filter(o => o.id !== orderId));
        await Promise.all([fetchStats(), fetchMyOrders()]);
        setActiveTab('my-orders');
      } else {
        showToast(data.message, 'error');
      }
    } catch { showToast('Failed to claim order', 'error'); }
    setClaimingId(null);
  };

  // Called when a status button is clicked
  const initiateStatusUpdate = (order, targetStatus) => {
    const currentRank = STATUS_ORDER[order.status] || 0;
    const targetRank = STATUS_ORDER[targetStatus] || 0;

    // Frontend forward-only check
    if (targetRank <= currentRank) {
      showToast(`Cannot go back. Order is already "${order.status}".`, 'error');
      return;
    }

    if (targetStatus === 'Delivered') {
      // Open OTP modal
      setPendingStatus(targetStatus);
      setOtpInput('');
      setOtpError('');
      setShowOtpModal(true);
    } else {
      // Direct status update (no OTP needed)
      executeStatusUpdate(order.id, targetStatus, null);
    }
  };

  const executeStatusUpdate = async (orderId, status, otpValue) => {
    setUpdatingId(orderId);
    try {
      const res = await fetch(`${API_BASE}/api/delivery/orders/${orderId}/status`, {
        method: 'PUT',
        headers: { ...authHeaders, 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, delivery_otp: otpValue })
      });
      const data = await res.json();
      if (res.ok) {
        showToast(data.message);
        setMyOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));
        if (selectedOrder?.id === orderId) setSelectedOrder(prev => ({ ...prev, status }));
        await fetchStats();
        if (showOtpModal) {
          setShowOtpModal(false);
          setOtpInput('');
          setOtpError('');
          setPendingStatus(null);
        }
      } else {
        if (showOtpModal) {
          setOtpError(data.message || 'Incorrect OTP. Please try again.');
        } else {
          showToast(data.message, 'error');
        }
      }
    } catch {
      showToast('Update failed', 'error');
    }
    setUpdatingId(null);
  };

  const handleOtpSubmit = () => {
    if (!otpInput || otpInput.length < 6) {
      setOtpError('Please enter the complete 6-digit OTP from the customer.');
      return;
    }
    setOtpError('');
    executeStatusUpdate(selectedOrder.id, pendingStatus, otpInput);
  };

  const handleResendOtp = async (orderId) => {
    setResendingId(orderId);
    try {
      const res = await fetch(`${API_BASE}/api/delivery/orders/${orderId}/resend-otp`, {
        method: 'POST',
        headers: authHeaders
      });
      const data = await res.json();
      if (res.ok) {
        showToast(data.message);
      } else {
        showToast(data.message, 'error');
      }
    } catch { showToast('Failed to resend OTP', 'error'); }
    setResendingId(null);
  };

  const filteredMyOrders = myOrders.filter(o => {
    const q = search.toLowerCase();
    return !q ||
      String(o.id).includes(q) ||
      (o.customer_name || '').toLowerCase().includes(q) ||
      (o.status || '').toLowerCase().includes(q);
  });

  if (!user) return null;

  const tabs = [
    { id: 'dashboard', label: 'Dashboard',     icon: Truck },
    { id: 'my-orders', label: 'My Deliveries', icon: Package },
    { id: 'available', label: 'Available',      icon: Inbox },
  ];

  const activeOrders = myOrders.filter(o => o.status !== 'Delivered');
  const ofdOrders = myOrders.filter(o => o.status === 'Out for Delivery');

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Toast Notification */}
      {toastMsg && (
        <div className={`fixed top-4 right-4 z-[9999] max-w-sm px-4 py-3 rounded-lg text-xs font-bold shadow-2xl transition-all ${
          toastMsg.type === 'error' ? 'bg-red-900 border border-red-500 text-red-200' : 'bg-emerald-900 border border-emerald-500 text-emerald-200'
        }`}>
          {toastMsg.msg}
        </div>
      )}

      {/* ── OTP VERIFICATION MODAL ── */}
      {showOtpModal && selectedOrder && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-[9998] flex items-center justify-center p-4">
          <div className="bg-[#0f0f0f] border border-orange-400/30 rounded-2xl w-full max-w-sm shadow-2xl shadow-orange-900/20">
            <div className="p-6 text-center border-b border-white/10">
              <div className="w-14 h-14 rounded-full bg-orange-500/10 border border-orange-500/30 flex items-center justify-center mx-auto mb-4">
                <Shield className="w-7 h-7 text-orange-400" />
              </div>
              <h3 className="text-base font-black text-white">Customer Delivery OTP</h3>
              <p className="text-[10px] text-gray-500 mt-1">Order #{selectedOrder.id} — {selectedOrder.customer_name}</p>
            </div>

            <div className="p-6 space-y-5">
              <div className="bg-orange-500/5 border border-orange-500/20 rounded-xl p-4 text-center">
                <p className="text-xs text-orange-300 font-bold mb-1">Ask the customer for their 6-digit OTP</p>
                <p className="text-[10px] text-gray-500">The OTP was sent to the customer's registered email when the order was marked "Out for Delivery".</p>
              </div>

              <div>
                <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-3 text-center">Enter Customer OTP</p>
                <OtpInput
                  value={otpInput}
                  onChange={setOtpInput}
                  disabled={updatingId === selectedOrder?.id}
                />
                {otpError && (
                  <p className="text-xs text-red-400 text-center mt-3 flex items-center justify-center gap-1">
                    <AlertTriangle className="w-3 h-3" /> {otpError}
                  </p>
                )}
              </div>

              {/* Resend OTP */}
              <div className="text-center">
                <button
                  onClick={() => handleResendOtp(selectedOrder.id)}
                  disabled={resendingId === selectedOrder.id || selectedOrder.status !== 'Out for Delivery'}
                  className="text-[10px] text-blue-400 hover:text-blue-300 flex items-center gap-1 mx-auto transition-colors disabled:opacity-40"
                >
                  {resendingId === selectedOrder.id ? (
                    <div className="w-3 h-3 border border-blue-400/50 border-t-blue-400 rounded-full animate-spin" />
                  ) : (
                    <RotateCcw className="w-3 h-3" />
                  )}
                  Resend OTP to Customer's Email
                </button>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => { setShowOtpModal(false); setOtpInput(''); setOtpError(''); setPendingStatus(null); }}
                  className="flex-1 py-3 text-xs font-bold text-gray-400 border border-white/10 rounded-xl hover:border-white/20 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleOtpSubmit}
                  disabled={updatingId === selectedOrder?.id || otpInput.length < 6}
                  className="flex-1 py-3 text-xs font-black bg-gradient-to-r from-orange-500 to-amber-500 text-black rounded-xl hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {updatingId === selectedOrder?.id ? (
                    <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4" />
                  )}
                  Verify & Deliver
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="border-b border-white/10 bg-[#0f0f0f] sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <svg width="32" height="16" viewBox="0 0 88 40" fill="none">
                <rect x="2" y="8" width="34" height="24" rx="12" stroke="#C5A028" strokeWidth="3.5" fill="none"/>
                <rect x="52" y="8" width="34" height="24" rx="12" stroke="#C5A028" strokeWidth="3.5" fill="none"/>
                <path d="M36 20 Q44 14 52 20" stroke="#C5A028" strokeWidth="3" fill="none" strokeLinecap="round"/>
              </svg>
              <span className="text-xs font-bold tracking-[0.3em] text-[#C5A028] uppercase">Lekya Specs</span>
            </Link>
            <div className="hidden sm:flex items-center gap-1.5 bg-orange-500/10 border border-orange-500/30 rounded-full px-3 py-1">
              <Truck className="w-3 h-3 text-orange-400" />
              <span className="text-[10px] font-bold tracking-widest text-orange-400 uppercase">Delivery Agent</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {ofdOrders.length > 0 && (
              <div className="flex items-center gap-1.5 bg-orange-500/10 border border-orange-500/30 rounded-lg px-3 py-1.5 animate-pulse">
                <Clock className="w-3 h-3 text-orange-400" />
                <span className="text-[10px] font-bold text-orange-400">{ofdOrders.length} Out for Delivery</span>
              </div>
            )}
            <Link
              href="/delivery-map"
              className="flex items-center gap-1.5 text-[10px] bg-blue-900/50 hover:bg-blue-800/60 text-blue-300 border border-blue-700/50 font-bold px-3 py-2 rounded-lg transition-colors uppercase tracking-wider"
            >
              <Navigation className="w-3.5 h-3.5" /> Route Map
            </Link>
            <Link
              href="/chat"
              className="flex items-center gap-1.5 text-[10px] bg-amber-900/50 hover:bg-amber-800/60 text-amber-300 border border-amber-700/50 font-bold px-3 py-2 rounded-lg transition-colors uppercase tracking-wider"
            >
              💬 Team Chat
            </Link>
            <button onClick={fetchAll} className="p-2 text-gray-400 hover:text-orange-400 transition-colors" title="Refresh">
              <RefreshCw className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-orange-500/20 border border-orange-500/40 flex items-center justify-center">
                <span className="text-xs font-bold text-orange-400">{user?.name?.charAt(0)?.toUpperCase()}</span>
              </div>
              <div className="hidden sm:block">
                <p className="text-xs font-semibold text-white">{user?.name?.split(' ')[0]}</p>
                <p className="text-[10px] text-orange-400 uppercase tracking-wider font-bold">Delivery</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Bar */}
        <div className="max-w-5xl mx-auto px-4 sm:px-6 flex gap-1 overflow-x-auto">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 text-xs font-bold uppercase tracking-widest border-b-2 transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-orange-400 text-orange-400'
                    : 'border-transparent text-gray-500 hover:text-gray-300'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {tab.label}
                {tab.id === 'my-orders' && activeOrders.length > 0 && (
                  <span className="bg-orange-500 text-white text-[9px] font-black px-1.5 rounded-full">
                    {activeOrders.length}
                  </span>
                )}
                {tab.id === 'available' && availableOrders.length > 0 && (
                  <span className="bg-green-500 text-white text-[9px] font-black px-1.5 rounded-full">
                    {availableOrders.length}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">

        {/* ── DASHBOARD ── */}
        {activeTab === 'dashboard' && (
          <div className="space-y-8">
            <div>
              <h1 className="text-2xl font-black tracking-wider text-white">My Delivery Hub</h1>
              <p className="text-sm text-gray-500 mt-1">Track your deliveries and manage assignments</p>
            </div>

            {loading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-28 rounded-xl bg-white/5 animate-pulse" />
                ))}
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                  <StatCard icon={Truck}         label="Total Assigned" value={stats?.totalAssigned || 0}   color="indigo" />
                  <StatCard icon={CheckCircle2}  label="Delivered"      value={stats?.delivered || 0}       color="green"  />
                  <StatCard icon={Navigation}    label="Out for Dlv."   value={stats?.outForDelivery || 0}  color="orange" />
                  <StatCard icon={Package}       label="Shipped"        value={stats?.shipped || 0}         color="blue"   />
                  <StatCard icon={Star}          label="Today"          value={stats?.todayDelivered || 0}  color="gold"   sub="delivered today" />
                </div>

                {/* OFD Alert Banner — critical orders needing delivery */}
                {ofdOrders.length > 0 && (
                  <div className="bg-orange-500/10 border border-orange-500/30 rounded-xl p-5">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm font-black text-orange-400 tracking-widest uppercase flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 animate-pulse" />
                        ⚡ Out for Delivery — OTP Required
                      </h3>
                      <span className="text-[10px] text-gray-500">{ofdOrders.length} order{ofdOrders.length > 1 ? 's' : ''}</span>
                    </div>
                    <p className="text-xs text-gray-400 mb-4">These orders are en route. You need the customer's OTP to mark them as Delivered.</p>
                    <div className="space-y-2">
                      {ofdOrders.slice(0, 3).map(order => (
                        <div key={order.id} className="flex items-center justify-between p-3 bg-orange-900/20 border border-orange-500/20 rounded-lg">
                          <div>
                            <span className="text-xs font-black text-orange-400">#{order.id}</span>
                            <span className="text-xs text-gray-400 ml-2">{order.customer_name}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleResendOtp(order.id)}
                              disabled={resendingId === order.id}
                              className="text-[10px] text-blue-400 hover:text-blue-300 border border-blue-700/40 px-2 py-1 rounded-lg flex items-center gap-1 transition-colors disabled:opacity-50"
                            >
                              {resendingId === order.id ? <div className="w-2.5 h-2.5 border border-blue-400/50 border-t-blue-400 rounded-full animate-spin" /> : <RotateCcw className="w-2.5 h-2.5" />}
                              Resend OTP
                            </button>
                            <button
                              onClick={() => { setSelectedOrder(order); setShowOtpModal(true); setPendingStatus('Delivered'); setOtpInput(''); setOtpError(''); }}
                              className="text-[10px] text-emerald-400 border border-emerald-500/40 px-2 py-1 rounded-lg flex items-center gap-1 hover:bg-emerald-500/10 transition-colors"
                            >
                              <Shield className="w-2.5 h-2.5" /> Enter OTP
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Active Deliveries Quick View */}
                <div className="bg-[#111] border border-white/10 rounded-xl p-6">
                  <div className="flex items-center justify-between mb-5">
                    <h3 className="text-sm font-black text-orange-400 tracking-widest uppercase flex items-center gap-2">
                      <Navigation className="w-4 h-4" /> Active Deliveries
                    </h3>
                    <button
                      onClick={() => setActiveTab('my-orders')}
                      className="text-[10px] text-gray-500 hover:text-orange-400 flex items-center gap-1 transition-colors"
                    >
                      View all <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>

                  {activeOrders.length === 0 ? (
                    <div className="text-center py-8">
                      <CheckCircle2 className="w-10 h-10 text-emerald-500/30 mx-auto mb-2" />
                      <p className="text-sm text-gray-600">All deliveries complete! Claim new orders below.</p>
                      <button
                        onClick={() => setActiveTab('available')}
                        className="mt-3 text-xs text-orange-400 hover:text-orange-300 transition-colors"
                      >
                        Browse Available Orders →
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {activeOrders.slice(0, 4).map(order => {
                        const sc = STATUS_COLORS[order.status] || STATUS_COLORS['Shipped'];
                        return (
                          <div key={order.id} className="flex items-start justify-between p-3 bg-white/5 rounded-lg hover:bg-white/8 transition-all gap-3">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-xs font-black text-orange-400">#{order.id}</span>
                                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${sc.bg} ${sc.text} ${sc.border}`}>
                                  {order.status}
                                </span>
                              </div>
                              <p className="text-xs font-semibold text-white truncate">{order.customer_name || 'Guest'}</p>
                              <AddressDisplay address={order.shipping_address} />
                            </div>
                            <button
                              onClick={() => setSelectedOrder(order)}
                              className="shrink-0 text-[10px] text-orange-400 hover:text-orange-300 font-bold bg-orange-500/10 border border-orange-500/20 rounded-lg px-3 py-1.5 transition-all"
                            >
                              Manage
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Delivery Tips / Info Card */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-[#111] border border-white/10 rounded-xl p-4 text-center">
                    <Shield className="w-6 h-6 text-orange-400 mx-auto mb-2" />
                    <p className="text-xs font-bold text-white mb-1">OTP Protected</p>
                    <p className="text-[10px] text-gray-500">Customer must verify delivery with a unique OTP before you can mark Delivered.</p>
                  </div>
                  <div className="bg-[#111] border border-white/10 rounded-xl p-4 text-center">
                    <Lock className="w-6 h-6 text-blue-400 mx-auto mb-2" />
                    <p className="text-xs font-bold text-white mb-1">Forward-Only</p>
                    <p className="text-[10px] text-gray-500">Status can only move forward: Shipped → Out for Delivery → Delivered.</p>
                  </div>
                  <div className="bg-[#111] border border-white/10 rounded-xl p-4 text-center">
                    <SendHorizonal className="w-6 h-6 text-emerald-400 mx-auto mb-2" />
                    <p className="text-xs font-bold text-white mb-1">Resend OTP</p>
                    <p className="text-[10px] text-gray-500">If customer didn't receive OTP, use the Resend button to send again.</p>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* ── MY DELIVERIES ── */}
        {activeTab === 'my-orders' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-black tracking-wider text-white">My Deliveries</h1>
                <p className="text-sm text-gray-500 mt-1">All orders assigned to you</p>
              </div>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-gray-500" />
                <input
                  type="text"
                  placeholder="Search orders..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="bg-white/5 border border-white/10 rounded-lg pl-8 pr-3 py-2 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-orange-400/50 w-48"
                />
              </div>
            </div>

            {loading ? (
              <div className="space-y-3">
                {[...Array(4)].map((_, i) => <div key={i} className="h-24 rounded-xl bg-white/5 animate-pulse" />)}
              </div>
            ) : filteredMyOrders.length === 0 ? (
              <div className="text-center py-20 text-gray-600">
                <Truck className="w-12 h-12 mx-auto mb-3 opacity-20" />
                <p className="text-sm">No deliveries assigned yet</p>
                <button
                  onClick={() => setActiveTab('available')}
                  className="mt-3 text-xs text-orange-400 hover:text-orange-300 transition-colors"
                >
                  Browse available orders →
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredMyOrders.map(order => {
                  const sc = STATUS_COLORS[order.status] || STATUS_COLORS['Shipped'];
                  const isOFD = order.status === 'Out for Delivery';
                  return (
                    <div key={order.id} className={`bg-[#111] border rounded-xl p-5 transition-all ${isOFD ? 'border-orange-400/30 shadow-orange-900/10 shadow-lg' : 'border-white/10 hover:border-orange-400/20'}`}>
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2 flex-wrap">
                            <span className="text-sm font-black text-orange-400">#{order.id}</span>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${sc.bg} ${sc.text} ${sc.border}`}>
                              {order.status}
                            </span>
                            {isOFD && (
                              <span className="text-[9px] bg-orange-500/20 border border-orange-500/40 text-orange-300 px-2 py-0.5 rounded font-bold uppercase flex items-center gap-1">
                                <Shield className="w-2.5 h-2.5" /> OTP Required
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 mb-1">
                            <User className="w-3.5 h-3.5 text-gray-500" />
                            <p className="text-sm font-semibold text-white">{order.customer_name || 'Guest'}</p>
                          </div>
                          {order.customer_phone && (
                            <div className="flex items-center gap-2 mb-2">
                              <PhoneCall className="w-3.5 h-3.5 text-gray-500" />
                              <a href={`tel:${order.customer_phone}`} className="text-xs text-orange-400 hover:text-orange-300">
                                {order.customer_phone}
                              </a>
                            </div>
                          )}
                          <AddressDisplay address={order.shipping_address} />

                          {/* Progress Steps */}
                          <div className="flex items-center gap-1 mt-4">
                            {DELIVERY_STATUS_STEPS.map((step, idx) => {
                              const isActive = order.status === step;
                              const isDone = DELIVERY_STATUS_STEPS.indexOf(order.status) > idx;
                              return (
                                <React.Fragment key={step}>
                                  <div className={`flex items-center gap-1 text-[9px] font-bold px-2 py-1 rounded-full transition-all ${
                                    isDone ? 'bg-emerald-500/20 text-emerald-400' :
                                    isActive ? 'bg-orange-500/20 text-orange-400 ring-1 ring-orange-500/50' :
                                    'bg-white/5 text-gray-600'
                                  }`}>
                                    {isDone ? <CheckCircle2 className="w-2.5 h-2.5" /> : null}
                                    {step}
                                  </div>
                                  {idx < DELIVERY_STATUS_STEPS.length - 1 && (
                                    <div className={`flex-1 h-px ${isDone ? 'bg-emerald-500/40' : 'bg-white/10'}`} />
                                  )}
                                </React.Fragment>
                              );
                            })}
                          </div>
                        </div>

                        <div className="flex flex-col items-end gap-3 shrink-0">
                          <p className="text-base font-black text-orange-400">₹{order.total_amount?.toLocaleString('en-IN')}</p>
                          <div className="flex flex-col gap-2">
                            <button
                              onClick={() => setSelectedOrder(order)}
                              className="text-[10px] font-bold bg-orange-500/10 border border-orange-500/20 text-orange-400 hover:bg-orange-500/20 px-3 py-2 rounded-lg transition-all flex items-center gap-1.5"
                            >
                              <Navigation className="w-3 h-3" /> Update Status
                            </button>
                            {isOFD && (
                              <button
                                onClick={() => handleResendOtp(order.id)}
                                disabled={resendingId === order.id}
                                className="text-[10px] font-bold bg-blue-500/10 border border-blue-500/20 text-blue-400 hover:bg-blue-500/20 px-3 py-2 rounded-lg transition-all flex items-center gap-1.5 disabled:opacity-50"
                              >
                                {resendingId === order.id ? (
                                  <div className="w-3 h-3 border border-blue-400/50 border-t-blue-400 rounded-full animate-spin" />
                                ) : (
                                  <RotateCcw className="w-3 h-3" />
                                )}
                                Resend OTP
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ── AVAILABLE ORDERS ── */}
        {activeTab === 'available' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-black tracking-wider text-white">Available Orders</h1>
                <p className="text-sm text-gray-500 mt-1">Claim unassigned orders to start delivering</p>
              </div>
              <button
                onClick={fetchAvailable}
                className="flex items-center gap-2 text-xs text-gray-400 hover:text-orange-400 transition-colors border border-white/10 px-3 py-2 rounded-lg hover:border-orange-400/30"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Refresh
              </button>
            </div>

            {loadingAvailable ? (
              <div className="space-y-3">
                {[...Array(4)].map((_, i) => <div key={i} className="h-24 rounded-xl bg-white/5 animate-pulse" />)}
              </div>
            ) : availableOrders.length === 0 ? (
              <div className="text-center py-20 text-gray-600">
                <Inbox className="w-12 h-12 mx-auto mb-3 opacity-20" />
                <p className="text-sm">No unassigned orders available right now</p>
                <p className="text-[10px] text-gray-700 mt-1">Check back soon!</p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* 📍 City-Grouped Available Orders */}
                {(() => {
                  const grouped = {};
                  availableOrders.forEach(order => {
                    const addr = typeof order.shipping_address === 'object' ? order.shipping_address : {};
                    const city = addr.city || addr.City || 'Other';
                    if (!grouped[city]) grouped[city] = [];
                    grouped[city].push(order);
                  });

                  return Object.entries(grouped).map(([city, cityOrders]) => (
                    <div key={city}>
                      <div className="flex items-center gap-2 mb-3">
                        <MapPin className="w-3.5 h-3.5 text-orange-400" />
                        <span className="text-xs font-black text-orange-400 uppercase tracking-widest">{city}</span>
                        <span className="text-[10px] bg-white/10 text-gray-400 px-2 py-0.5 rounded-full">{cityOrders.length} order{cityOrders.length > 1 ? 's' : ''}</span>
                      </div>
                      <div className="space-y-3">
                        {cityOrders.map(order => (
                          <div key={order.id} className={`bg-[#111] border rounded-xl p-5 hover:border-green-400/20 transition-all ${
                            order.is_urgent ? 'border-red-500/40 shadow-red-900/20 shadow-lg' : 'border-white/10'
                          }`}>
                            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                  <span className="text-sm font-black text-green-400">#{order.id}</span>
                                  {order.is_urgent && (
                                    <span className="text-[9px] bg-red-500 text-white px-2 py-0.5 rounded font-black uppercase animate-pulse">
                                      ⚡ URGENT EXPRESS
                                    </span>
                                  )}
                                  <span className="text-[10px] text-gray-500 font-mono">
                                    {new Date(order.created_at).toLocaleDateString('en-IN')}
                                  </span>
                                </div>
                                {order.is_urgent && order.urgent_note && (
                                  <p className="text-[10px] text-red-400 bg-red-900/20 border border-red-500/20 px-2 py-1.5 rounded mb-2">
                                    🚨 {order.urgent_note}
                                  </p>
                                )}
                                <div className="flex items-center gap-2 mb-1">
                                  <User className="w-3.5 h-3.5 text-gray-500" />
                                  <p className="text-sm font-semibold text-white">{order.customer_name || 'Guest'}</p>
                                </div>
                                {order.customer_phone && (
                                  <p className="text-xs text-gray-500 mb-2">📞 {order.customer_phone}</p>
                                )}
                                <AddressDisplay address={order.shipping_address} />
                                <div className="flex flex-wrap gap-1 mt-3">
                                  {(order.items || []).map((item, i) => (
                                    <span key={i} className="text-[10px] bg-white/5 border border-white/10 px-2 py-0.5 rounded text-gray-400">
                                      {item.name} ×{item.quantity}
                                    </span>
                                  ))}
                                </div>
                              </div>
                              <div className="flex flex-col items-end gap-3 shrink-0">
                                <p className="text-base font-black text-green-400">₹{order.total_amount?.toLocaleString('en-IN')}</p>
                                <button
                                  disabled={claimingId === order.id}
                                  onClick={() => handleClaimOrder(order.id)}
                                  className={`text-[10px] font-black border px-4 py-2 rounded-lg transition-all flex items-center gap-1.5 disabled:opacity-50 ${
                                    order.is_urgent
                                      ? 'bg-red-500/20 border-red-500/40 text-red-400 hover:bg-red-500/30'
                                      : 'bg-green-500/20 border-green-500/40 text-green-400 hover:bg-green-500/30'
                                  }`}
                                >
                                  {claimingId === order.id ? (
                                    <div className="w-3 h-3 border border-current/50 border-t-current rounded-full animate-spin" />
                                  ) : (
                                    <Truck className="w-3 h-3" />
                                  )}
                                  {order.is_urgent ? 'Claim URGENT' : 'Claim Order'}
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ));
                })()}
              </div>
            )}
          </div>
        )}
      </main>

      {/* ── UPDATE STATUS MODAL ── */}
      {selectedOrder && !showOtpModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#111] border border-white/15 rounded-2xl w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <div>
                <h3 className="text-sm font-black text-white">Update Delivery Status</h3>
                <p className="text-[10px] text-gray-500 mt-0.5">Order #{selectedOrder.id} — {selectedOrder.customer_name}</p>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="p-2 text-gray-500 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              {/* Delivery Address */}
              <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-4">
                <p className="text-[10px] font-bold text-orange-400 mb-2 uppercase tracking-widest">Delivery Address</p>
                <AddressDisplay address={selectedOrder.shipping_address} />
                {selectedOrder.customer_phone && (
                  <a href={`tel:${selectedOrder.customer_phone}`} className="flex items-center gap-1.5 mt-2 text-xs text-orange-400 hover:text-orange-300 transition-colors">
                    <PhoneCall className="w-3.5 h-3.5" /> {selectedOrder.customer_phone}
                  </a>
                )}
              </div>

              {/* Items */}
              <div>
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">Items</p>
                <div className="space-y-1">
                  {(selectedOrder.items || []).map((item, i) => (
                    <div key={i} className="flex justify-between text-xs">
                      <span className="text-gray-400">{item.name} ×{item.quantity}</span>
                      <span className="text-orange-400">₹{(item.price * item.quantity)?.toLocaleString('en-IN')}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Status Buttons — forward-only */}
              <div>
                <p className="text-[10px] font-bold text-orange-400 uppercase tracking-widest mb-3">
                  Move Status Forward
                </p>
                <div className="space-y-2">
                  {DELIVERY_STATUS_STEPS.map(s => {
                    const sc = STATUS_COLORS[s];
                    const isCurrentStatus = selectedOrder.status === s;
                    const currentRank = STATUS_ORDER[selectedOrder.status] || 0;
                    const thisRank = STATUS_ORDER[s] || 0;
                    const isDisabled = thisRank <= currentRank || updatingId === selectedOrder.id;
                    const isPast = thisRank < currentRank;
                    const isDeliveredStep = s === 'Delivered';

                    return (
                      <button
                        key={s}
                        disabled={isDisabled}
                        onClick={() => initiateStatusUpdate(selectedOrder, s)}
                        className={`w-full text-left text-xs font-bold px-4 py-3 rounded-xl border transition-all flex items-center justify-between ${
                          isCurrentStatus
                            ? `${sc.bg} ${sc.text} ${sc.border}`
                            : isPast
                            ? 'bg-white/3 text-gray-600 border-white/5 cursor-not-allowed opacity-50'
                            : 'bg-white/5 text-gray-300 border-white/10 hover:border-orange-400/30 hover:text-white'
                        } disabled:cursor-not-allowed`}
                      >
                        <div className="flex items-center gap-2">
                          {isCurrentStatus && <CheckCircle2 className="w-3.5 h-3.5" />}
                          {isPast && <CheckCircle2 className="w-3.5 h-3.5 text-gray-600" />}
                          {isDeliveredStep && !isCurrentStatus && !isPast && <Shield className="w-3.5 h-3.5 text-orange-400/50" />}
                          <span>{s}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          {isCurrentStatus && <span className="text-[9px] font-black tracking-widest uppercase opacity-70">CURRENT</span>}
                          {isPast && <span className="text-[9px] uppercase opacity-40">DONE</span>}
                          {isDeliveredStep && !isCurrentStatus && !isPast && (
                            <span className="text-[9px] text-orange-400 uppercase font-bold">OTP needed</span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Resend OTP if OFD */}
              {selectedOrder.status === 'Out for Delivery' && (
                <div className="flex items-center justify-between bg-blue-900/20 border border-blue-700/30 rounded-xl p-4">
                  <div>
                    <p className="text-xs font-bold text-blue-300">Customer hasn't received the OTP?</p>
                    <p className="text-[10px] text-gray-500 mt-0.5">Resend the delivery OTP to their email</p>
                  </div>
                  <button
                    onClick={() => handleResendOtp(selectedOrder.id)}
                    disabled={resendingId === selectedOrder.id}
                    className="text-[10px] font-black bg-blue-500/20 border border-blue-500/30 text-blue-400 hover:bg-blue-500/30 px-3 py-2 rounded-lg transition-all flex items-center gap-1.5 disabled:opacity-50"
                  >
                    {resendingId === selectedOrder.id ? (
                      <div className="w-3 h-3 border border-blue-400/50 border-t-blue-400 rounded-full animate-spin" />
                    ) : (
                      <SendHorizonal className="w-3 h-3" />
                    )}
                    Resend OTP
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
