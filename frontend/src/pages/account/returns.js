import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { RefreshCw, PackageCheck, AlertCircle, ArrowLeft, Truck, CheckCircle, ShieldCheck } from 'lucide-react';

const API_BASE = typeof window !== 'undefined'
  ? (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' ? 'http://localhost:5000' : '')
  : '';

export default function ReturnsPortal() {
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [returns, setReturns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [returnType, setReturnType] = useState('return');
  const [reason, setReason] = useState('');
  const [comments, setComments] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('specs_token');
    const userData = localStorage.getItem('specs_user');
    if (token && userData) {
      setUser(JSON.parse(userData));
      fetchData(token);
    } else {
      setLoading(false);
    }
  }, []);

  const fetchData = async (token) => {
    try {
      const [ordersRes, returnsRes] = await Promise.all([
        fetch(`${API_BASE}/api/orders/history`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_BASE}/api/returns/my`, { headers: { Authorization: `Bearer ${token}` } })
      ]);

      if (ordersRes.ok) setOrders(await ordersRes.json());
      if (returnsRes.ok) setReturns(await returnsRes.json());
    } catch (err) {
      console.error('Fetch returns error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitReturn = async (e) => {
    e.preventDefault();
    if (!selectedOrder || !reason) return;

    setSubmitting(true);
    setMessage('');
    const token = localStorage.getItem('specs_token');

    try {
      const res = await fetch(`${API_BASE}/api/returns`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          orderId: selectedOrder.id,
          returnType,
          reason,
          comments
        })
      });

      const data = await res.json();
      if (res.ok) {
        setMessage('✅ ' + data.message);
        setSelectedOrder(null);
        setReason('');
        setComments('');
        fetchData(token);
      } else {
        setMessage('⚠️ ' + (data.message || 'Failed to submit request'));
      }
    } catch (err) {
      setMessage('⚠️ Network error processing request');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0D0016] text-[#FEF6EE] font-sans pb-20">
      <Head>
        <title>Self-Service Returns & Exchange | Lekya Specs</title>
      </Head>

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#1A0024] via-[#2A0440] to-[#3E0856] border-b border-[#FAAE62]/20 py-12 px-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div>
            <Link href="/account" className="inline-flex items-center gap-2 text-xs font-bold text-[#FAAE62] uppercase tracking-widest hover:underline mb-3">
              <ArrowLeft className="w-4 h-4" /> Back to Account
            </Link>
            <h1 className="font-serif text-3xl md:text-4xl font-bold text-white">Returns & Exchange Portal</h1>
            <p className="text-xs text-[#9B7EA8] mt-1">14-Day Easy Self-Service Returns with Automated Parcel Uncle Reverse Pickup</p>
          </div>
          <div className="hidden md:flex items-center gap-2 px-4 py-2 rounded-2xl bg-[#FAAE62]/10 border border-[#FAAE62]/30 text-[#FAAE62] text-xs font-bold uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4" /> 100% Guaranteed Return Protection
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 mt-10 space-y-10">
        
        {message && (
          <div className="bg-[#2A0440] border border-[#FAAE62] rounded-2xl p-4 text-sm font-bold text-white shadow-xl animate-fadeIn">
            {message}
          </div>
        )}

        {/* Existing Return Requests List */}
        {returns.length > 0 && (
          <div className="bg-[#1A0024] border border-[#3E0856] rounded-3xl p-6 shadow-2xl">
            <h2 className="font-serif text-xl font-bold text-white mb-4 flex items-center gap-2">
              <RefreshCw className="w-5 h-5 text-[#FAAE62]" /> Active Return & Exchange Requests
            </h2>
            <div className="space-y-4">
              {returns.map((ret) => (
                <div key={ret.id} className="bg-[#2A0440] border border-[#3E0856] rounded-2xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-[#FAAE62]">Order #{ret.order_id}</span>
                      <span className="text-xs uppercase font-bold px-2.5 py-0.5 rounded-full bg-[#FAAE62]/20 text-[#FAAE62] border border-[#FAAE62]/40">
                        {ret.return_type}
                      </span>
                    </div>
                    <p className="text-xs text-white font-medium mt-1">Reason: {ret.reason}</p>
                    {ret.comments && <p className="text-xs text-[#9B7EA8] mt-0.5">"{ret.comments}"</p>}
                    {ret.waybill_id && (
                      <p className="text-[11px] font-mono text-emerald-400 mt-1 flex items-center gap-1">
                        <Truck className="w-3.5 h-3.5" /> Reverse AWB: {ret.waybill_id}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <span className={`text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full border ${
                      ret.status === 'Approved' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' :
                      ret.status === 'Requested' ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' :
                      'bg-purple-500/20 text-purple-300 border-purple-500/40'
                    }`}>
                      {ret.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Submit New Return Section */}
        <div className="bg-[#1A0024] border border-[#3E0856] rounded-3xl p-6 shadow-2xl">
          <h2 className="font-serif text-xl font-bold text-white mb-2 flex items-center gap-2">
            <PackageCheck className="w-5 h-5 text-[#FAAE62]" /> Initiate a New Return / Exchange
          </h2>
          <p className="text-xs text-[#9B7EA8] mb-6">Select an eligible delivered order below to request a replacement frame or refund.</p>

          <form onSubmit={handleSubmitReturn} className="space-y-6">
            {/* Select Order */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#FAAE62] mb-2">1. Select Delivered Order</label>
              <select
                required
                value={selectedOrder?.id || ''}
                onChange={(e) => {
                  const ord = orders.find(o => String(o.id) === e.target.value);
                  setSelectedOrder(ord || null);
                }}
                className="w-full bg-[#0D0016] border border-[#3E0856] focus:border-[#FAAE62] rounded-xl px-4 py-3 text-sm text-white focus:outline-none"
              >
                <option value="">-- Choose an order --</option>
                {orders.map((ord) => (
                  <option key={ord.id} value={ord.id}>
                    Order #{ord.id} — ₹{parseFloat(ord.total_amount).toLocaleString('en-IN')} ({ord.status})
                  </option>
                ))}
              </select>
            </div>

            {/* Request Type */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#FAAE62] mb-2">2. Request Type</label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setReturnType('return')}
                  className={`py-3 rounded-xl border text-xs font-bold uppercase tracking-wider transition-all ${
                    returnType === 'return' ? 'bg-[#FAAE62] text-[#0D0016] border-[#FAAE62]' : 'bg-[#0D0016] text-white border-[#3E0856]'
                  }`}
                >
                  🔄 Return & Refund
                </button>
                <button
                  type="button"
                  onClick={() => setReturnType('exchange')}
                  className={`py-3 rounded-xl border text-xs font-bold uppercase tracking-wider transition-all ${
                    returnType === 'exchange' ? 'bg-[#FAAE62] text-[#0D0016] border-[#FAAE62]' : 'bg-[#0D0016] text-white border-[#3E0856]'
                  }`}
                >
                  👓 Frame / Lens Exchange
                </button>
              </div>
            </div>

            {/* Reason */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#FAAE62] mb-2">3. Reason for Return</label>
              <select
                required
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full bg-[#0D0016] border border-[#3E0856] focus:border-[#FAAE62] rounded-xl px-4 py-3 text-sm text-white focus:outline-none"
              >
                <option value="">-- Select Reason --</option>
                <option value="Frame Size / Fit Mismatch">Frame Size / Fit Mismatch</option>
                <option value="Lens Power Adjustment Needed">Lens Power Adjustment Needed</option>
                <option value="Colour / Style Change">Colour / Style Change</option>
                <option value="Damaged in Transit">Damaged in Transit</option>
                <option value="Changed Mind">Changed Mind</option>
              </select>
            </div>

            {/* Additional Comments */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#FAAE62] mb-2">4. Additional Notes / Instructions</label>
              <textarea
                rows={3}
                placeholder="Specify replacement frame choice, fitting notes, or refund bank preferences..."
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                className="w-full bg-[#0D0016] border border-[#3E0856] focus:border-[#FAAE62] rounded-xl p-3 text-sm text-white focus:outline-none placeholder-gray-600"
              />
            </div>

            <button
              type="submit"
              disabled={submitting || !selectedOrder || !reason}
              className="w-full bg-gradient-to-r from-[#D4893F] to-[#FAAE62] hover:scale-[1.02] text-[#0D0016] font-black text-sm uppercase tracking-widest py-3.5 rounded-xl shadow-lg transition-all disabled:opacity-50"
            >
              {submitting ? 'Submitting Request...' : 'Submit Return Request'}
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}
