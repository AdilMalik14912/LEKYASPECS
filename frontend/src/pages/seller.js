const React = require('react');
const { useState, useEffect } = React;
const Link = require('next/link').default;
const { useRouter } = require('next/router');
const { useAuth } = require('./_app');
const {
  BarChart3, Package, ShoppingBag, Users, AlertTriangle, TrendingUp,
  RefreshCw, Truck, CheckCircle2, Clock, ChevronRight, Search,
  ArrowUpRight, Box, Layers, Tag, Filter, Eye, Edit3, X
} = require('lucide-react');

const API_BASE = typeof window !== 'undefined'
  ? (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' ? 'http://localhost:5000' : '')
  : '';

const STATUS_COLORS = {
  'Pending':          { bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-200' },
  'Paid':             { bg: 'bg-green-100',  text: 'text-green-800',  border: 'border-green-200' },
  'Processing':       { bg: 'bg-blue-100',   text: 'text-blue-800',   border: 'border-blue-200' },
  'Shipped':          { bg: 'bg-indigo-100', text: 'text-indigo-800', border: 'border-indigo-200' },
  'Out for Delivery': { bg: 'bg-orange-100', text: 'text-orange-800', border: 'border-orange-200' },
  'Delivered':        { bg: 'bg-emerald-100',text: 'text-emerald-800',border: 'border-emerald-200' },
};

function StatCard({ icon: Icon, label, value, sub, color = 'gold', onClick }) {
  const colorMap = {
    gold:   'from-amber-500/20 to-yellow-500/5 border-amber-400/30 text-amber-400',
    green:  'from-emerald-500/20 to-green-500/5 border-emerald-400/30 text-emerald-400',
    red:    'from-red-500/20 to-red-500/5 border-red-400/30 text-red-400',
    blue:   'from-blue-500/20 to-blue-500/5 border-blue-400/30 text-blue-400',
    orange: 'from-orange-500/20 to-orange-500/5 border-orange-400/30 text-orange-400',
  };
  return (
    <div
      onClick={onClick}
      className={`bg-gradient-to-br ${colorMap[color]} border rounded-xl p-5 cursor-pointer hover:scale-[1.02] transition-all duration-200 shadow-lg`}
    >
      <div className="flex items-start justify-between mb-3">
        <Icon className="w-6 h-6" />
        {onClick && <ArrowUpRight className="w-4 h-4 opacity-50" />}
      </div>
      <div className="text-3xl font-black text-white font-mono mb-1">{value}</div>
      <div className="text-xs font-bold tracking-widest uppercase text-gray-400">{label}</div>
      {sub && <div className="text-[10px] text-gray-500 mt-1">{sub}</div>}
    </div>
  );
}

export default function SellerPanel() {
  const { user, token } = useAuth();
  const router = useRouter();

  // Simple local toast
  const [toastMsg, setToastMsg] = React.useState(null);
  const showToast = (msg, type = 'success') => {
    setToastMsg({ msg, type });
    setTimeout(() => setToastMsg(null), 3000);
  };

  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState(null);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [deliveryAgents, setDeliveryAgents] = useState([]);
  const [agentWorkloads, setAgentWorkloads] = useState([]);
  const [staleOrders, setStaleOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [orderSearch, setOrderSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState(null);
  const [assigningAgent, setAssigningAgent] = useState(null);
  const [autoAssigning, setAutoAssigning] = useState(null);
  const [togglingUrgent, setTogglingUrgent] = useState(null);
  const [showWorkloadModal, setShowWorkloadModal] = useState(false);

  const authHeaders = { Authorization: `Bearer ${token}` };

  // Access guard
  useEffect(() => {
    if (!user) { router.push('/account'); return; }
    const allowed = ['seller', 'admin'];
    const isAllowed = allowed.includes(user.role) ||
      user.email === 'dev.parceluncle@gmail.com' ||
      user.email === 'admin@specs.com';
    if (!isAllowed) { router.push('/'); return; }
  }, [user]);

  const fetchAll = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const [statsRes, ordersRes, agentsRes, workloadsRes, staleRes] = await Promise.all([
        fetch(`${API_BASE}/api/seller/stats`, { headers: authHeaders }),
        fetch(`${API_BASE}/api/seller/orders`, { headers: authHeaders }),
        fetch(`${API_BASE}/api/seller/delivery-agents`, { headers: authHeaders }),
        fetch(`${API_BASE}/api/seller/agent-workloads`, { headers: authHeaders }),
        fetch(`${API_BASE}/api/seller/stale-orders`, { headers: authHeaders }),
      ]);
      if (statsRes.ok) setStats(await statsRes.json());
      if (ordersRes.ok) setOrders(await ordersRes.json());
      if (agentsRes.ok) setDeliveryAgents(await agentsRes.json());
      if (workloadsRes.ok) setAgentWorkloads(await workloadsRes.json());
      if (staleRes.ok) setStaleOrders(await staleRes.json());
    } catch (err) {
      showToast('Failed to load data', 'error');
    }
    setLoading(false);
  };

  const fetchProducts = async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE}/api/seller/products`, { headers: authHeaders });
      if (res.ok) setProducts(await res.json());
    } catch (err) { showToast('Failed to load products', 'error'); }
  };

  useEffect(() => { fetchAll(); }, [token]);
  useEffect(() => { if (activeTab === 'inventory') fetchProducts(); }, [activeTab]);

  // 🤖 Auto-assign handler
  const handleAutoAssign = async (orderId) => {
    setAutoAssigning(orderId);
    try {
      const res = await fetch(`${API_BASE}/api/seller/orders/${orderId}/auto-assign`, {
        method: 'POST', headers: authHeaders
      });
      const data = await res.json();
      if (res.ok) {
        showToast(data.message, 'success');
        fetchAll();
      } else {
        showToast(data.message || 'Auto-assign failed', 'error');
      }
    } catch { showToast('Connection error', 'error'); }
    setAutoAssigning(null);
  };

  // ⚡ Toggle urgent handler
  const handleToggleUrgent = async (orderId, currentUrgent) => {
    setTogglingUrgent(orderId);
    const newUrgent = !currentUrgent;
    const urgentNote = newUrgent ? prompt('Enter urgent reason (e.g. "Gift, deliver by tonight"):') : null;
    try {
      const res = await fetch(`${API_BASE}/api/seller/orders/${orderId}/urgent`, {
        method: 'PUT',
        headers: { ...authHeaders, 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_urgent: newUrgent, urgent_note: urgentNote })
      });
      const data = await res.json();
      if (res.ok) {
        showToast(data.message, newUrgent ? 'error' : 'success');
        setOrders(prev => prev.map(o => o.id === orderId ? { ...o, is_urgent: newUrgent ? 1 : 0, urgent_note: urgentNote } : o));
      } else { showToast(data.message || 'Failed', 'error'); }
    } catch { showToast('Connection error', 'error'); }
    setTogglingUrgent(null);
  };

  const handleStatusUpdate = async (orderId, status) => {
    setUpdatingStatus(orderId);
    try {
      const res = await fetch(`${API_BASE}/api/seller/orders/${orderId}/status`, {
        method: 'PUT',
        headers: { ...authHeaders, 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      const data = await res.json();
      if (res.ok) {
        showToast(data.message);
        setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));
        if (selectedOrder?.id === orderId) setSelectedOrder(prev => ({ ...prev, status }));
      } else {
        showToast(data.message, 'error');
      }
    } catch { showToast('Update failed', 'error'); }
    setUpdatingStatus(null);
  };

  const handleAssignAgent = async (orderId, agentId) => {
    setAssigningAgent(orderId);
    try {
      const res = await fetch(`${API_BASE}/api/seller/orders/${orderId}/assign`, {
        method: 'PUT',
        headers: { ...authHeaders, 'Content-Type': 'application/json' },
        body: JSON.stringify({ delivery_agent_id: agentId })
      });
      const data = await res.json();
      if (res.ok) {
        showToast(data.message);
        const agent = deliveryAgents.find(a => a.id === agentId);
        setOrders(prev => prev.map(o => o.id === orderId
          ? { ...o, assigned_delivery_agent_id: agentId, delivery_agent_name: agent?.name, status: 'Shipped' }
          : o
        ));
        if (selectedOrder?.id === orderId) {
          setSelectedOrder(prev => ({ ...prev, assigned_delivery_agent_id: agentId, delivery_agent_name: agent?.name, status: 'Shipped' }));
        }
      } else {
        showToast(data.message, 'error');
      }
    } catch { showToast('Assignment failed', 'error'); }
    setAssigningAgent(null);
  };

  const filteredOrders = orders.filter(o => {
    const q = orderSearch.toLowerCase();
    const matchSearch = !q ||
      String(o.id).includes(q) ||
      (o.customer_name || '').toLowerCase().includes(q) ||
      (o.customer_email || '').toLowerCase().includes(q);
    const matchStatus = statusFilter === 'All' || o.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const filteredProducts = products.filter(p => {
    const q = searchQuery.toLowerCase();
    return !q || p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q);
  });

  if (!user) return null;

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'orders',    label: 'Orders',    icon: ShoppingBag },
    { id: 'inventory', label: 'Inventory', icon: Package },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Toast Notification */}
      {toastMsg && (
        <div className={`fixed top-4 right-4 z-[9999] px-4 py-3 rounded-lg text-xs font-bold shadow-2xl transition-all ${
          toastMsg.type === 'error' ? 'bg-red-900 border border-red-500 text-red-200' : 'bg-emerald-900 border border-emerald-500 text-emerald-200'
        }`}>
          {toastMsg.msg}
        </div>
      )}
      {/* Header */}
      <header className="border-b border-white/10 bg-[#0f0f0f] sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <svg width="32" height="16" viewBox="0 0 88 40" fill="none">
                <rect x="2" y="8" width="34" height="24" rx="12" stroke="#C5A028" strokeWidth="3.5" fill="none"/>
                <rect x="52" y="8" width="34" height="24" rx="12" stroke="#C5A028" strokeWidth="3.5" fill="none"/>
                <path d="M36 20 Q44 14 52 20" stroke="#C5A028" strokeWidth="3" fill="none" strokeLinecap="round"/>
              </svg>
              <span className="text-xs font-bold tracking-[0.3em] text-premium-accent uppercase">Lekya Specs</span>
            </Link>
            <div className="hidden sm:flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/30 rounded-full px-3 py-1">
              <Layers className="w-3 h-3 text-amber-400" />
              <span className="text-[10px] font-bold tracking-widest text-amber-400 uppercase">Seller Panel</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => router.push('/chat')} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 hover:bg-amber-500/20 transition-all text-[11px] font-bold tracking-wider" title="Team Chat">
              💬 Chat
            </button>
            <button onClick={() => router.push('/crm')} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 transition-all text-[11px] font-bold tracking-wider" title="Specs CRM Platform">
              📈 CRM
            </button>
            <button onClick={fetchAll} className="p-2 text-gray-400 hover:text-amber-400 transition-colors" title="Refresh">
              <RefreshCw className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center">
                <span className="text-xs font-bold text-amber-400">{user?.name?.charAt(0)?.toUpperCase()}</span>
              </div>
              <div className="hidden sm:block">
                <p className="text-xs font-semibold text-white">{user?.name?.split(' ')[0]}</p>
                <p className="text-[10px] text-amber-400 uppercase tracking-wider font-bold">Seller</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Bar */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex gap-1 pb-0 overflow-x-auto">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 text-xs font-bold uppercase tracking-widest border-b-2 transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-amber-400 text-amber-400'
                    : 'border-transparent text-gray-500 hover:text-gray-300'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* ── DASHBOARD TAB ── */}
        {activeTab === 'dashboard' && (
          <div className="space-y-8">
            <div>
              <h1 className="text-2xl font-black tracking-wider text-white">Seller Dashboard</h1>
              <p className="text-sm text-gray-500 mt-1">Overview of your store's performance and inventory</p>
            </div>

            {loading ? (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-28 rounded-xl bg-white/5 animate-pulse" />
                ))}
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <StatCard icon={Package}      label="Total Products"   value={stats?.totalProducts || 0}   color="blue"   onClick={() => setActiveTab('inventory')} />
                  <StatCard icon={AlertTriangle} label="Low Stock"        value={stats?.lowStock || 0}        color="orange" sub="≤5 units remaining" onClick={() => setActiveTab('inventory')} />
                  <StatCard icon={Box}           label="Out of Stock"     value={stats?.outOfStock || 0}      color="red"    onClick={() => setActiveTab('inventory')} />
                  <StatCard icon={TrendingUp}    label="Total Revenue"    value={`₹${(stats?.totalRevenue || 0).toLocaleString('en-IN')}`} color="gold" />
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                  <StatCard icon={Clock}         label="Pending Orders"   value={stats?.pendingOrders || 0}    color="orange" onClick={() => { setActiveTab('orders'); setStatusFilter('Pending'); }} />
                  <StatCard icon={ShoppingBag}   label="Processing"       value={stats?.processingOrders || 0} color="blue"   onClick={() => { setActiveTab('orders'); setStatusFilter('Processing'); }} />
                  <StatCard icon={Truck}         label="Shipped"          value={stats?.shippedOrders || 0}    color="green"  onClick={() => { setActiveTab('orders'); setStatusFilter('Shipped'); }} />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Low Stock Alert */}
                  <div className="bg-[#111] border border-white/10 rounded-xl p-6">
                    <h3 className="text-sm font-bold tracking-widest uppercase text-amber-400 mb-4 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4" /> Low Stock Alert
                    </h3>
                    {stats?.lowStockProducts?.length > 0 ? (
                      <div className="space-y-3">
                        {stats.lowStockProducts.map(p => (
                          <div key={p.id} className="flex items-center justify-between py-2 border-b border-white/5">
                            <div className="flex items-center gap-3">
                              {Array.isArray(p.image_urls) && p.image_urls[0] ? (
                                <img src={p.image_urls[0]} alt={p.name} className="w-10 h-8 object-cover rounded" />
                              ) : (
                                <div className="w-10 h-8 bg-white/5 rounded flex items-center justify-center">
                                  <Package className="w-4 h-4 text-gray-600" />
                                </div>
                              )}
                              <div>
                                <p className="text-xs font-semibold text-white truncate max-w-[140px]">{p.name}</p>
                                <p className="text-[10px] text-gray-500">₹{p.price?.toLocaleString('en-IN')}</p>
                              </div>
                            </div>
                            <span className={`text-xs font-bold px-2 py-1 rounded ${p.stock === 0 ? 'bg-red-500/20 text-red-400' : 'bg-orange-500/20 text-orange-400'}`}>
                              {p.stock === 0 ? 'OUT' : `${p.stock} left`}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-gray-500">All products have sufficient stock.</p>
                    )}
                  </div>

                  {/* Recent Orders */}
                  <div className="bg-[#111] border border-white/10 rounded-xl p-6">
                    <h3 className="text-sm font-bold tracking-widest uppercase text-amber-400 mb-4 flex items-center gap-2">
                      <ShoppingBag className="w-4 h-4" /> Recent Orders
                    </h3>
                    {stats?.recentOrders?.length > 0 ? (
                      <div className="space-y-3">
                        {stats.recentOrders.map(o => {
                          const sc = STATUS_COLORS[o.status] || STATUS_COLORS['Pending'];
                          return (
                            <div key={o.id} className="flex items-center justify-between py-2 border-b border-white/5">
                              <div>
                                <p className="text-xs font-semibold text-white">Order #{o.id}</p>
                                <p className="text-[10px] text-gray-500">{o.customer_name || 'Guest'}</p>
                              </div>
                              <div className="text-right">
                                <p className="text-xs font-bold text-amber-400">₹{o.total_amount?.toLocaleString('en-IN')}</p>
                                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${sc.bg} ${sc.text}`}>{o.status}</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="text-xs text-gray-500">No recent orders yet.</p>
                    )}
                    <button onClick={() => setActiveTab('orders')} className="mt-4 text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1 transition-colors">
                      View all orders <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>


                {/* 🔔 Stale Orders Alert */}
                {staleOrders.length > 0 && (
                  <div className="bg-red-950/60 border border-red-500/40 rounded-xl p-5">
                    <h3 className="text-sm font-bold tracking-widest uppercase text-red-400 mb-3 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4" /> {staleOrders.length} Unassigned Orders Need Attention!
                    </h3>
                    <div className="space-y-2">
                      {staleOrders.slice(0, 4).map(o => (
                        <div key={o.id} className="flex items-center justify-between bg-red-900/20 rounded-lg px-4 py-2.5">
                          <div>
                            <span className="text-xs font-bold text-white">Order #{o.id}</span>
                            {o.is_urgent ? <span className="ml-2 text-[9px] bg-red-500 text-white px-1.5 py-0.5 rounded font-bold uppercase">URGENT</span> : null}
                            <p className="text-[10px] text-gray-400">{o.customer_name} · {o.hours_elapsed}h ago</p>
                          </div>
                          <button
                            onClick={() => handleAutoAssign(o.id)}
                            disabled={autoAssigning === o.id}
                            className="text-[10px] bg-amber-500 hover:bg-amber-400 text-black font-bold px-3 py-1.5 rounded transition-colors uppercase tracking-wider"
                          >
                            {autoAssigning === o.id ? '...' : '🤖 Auto-Assign'}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 📊 Agent Performance Leaderboard */}
                {agentWorkloads.length > 0 && (
                  <div className="bg-[#111] border border-white/10 rounded-xl p-6">
                    <h3 className="text-sm font-bold tracking-widest uppercase text-amber-400 mb-4 flex items-center gap-2">
                      <TrendingUp className="w-4 h-4" /> 🏆 Delivery Agent Leaderboard
                    </h3>
                    <div className="space-y-3">
                      {[...agentWorkloads].sort((a, b) => b.successRate - a.successRate).map((agent, idx) => (
                        <div key={agent.id} className="flex items-center gap-3">
                          <span className="text-lg">{idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `#${idx+1}`}</span>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs font-bold text-white">{agent.name}</span>
                              <span className="text-xs font-bold text-amber-400">{agent.successRate}%</span>
                            </div>
                            <div className="w-full bg-white/10 rounded-full h-1.5">
                              <div
                                className="bg-gradient-to-r from-amber-500 to-amber-300 h-1.5 rounded-full transition-all"
                                style={{ width: `${agent.successRate}%` }}
                              />
                            </div>
                            <p className="text-[10px] text-gray-500 mt-1">{agent.totalDelivered} delivered · {agent.activeOrders} active</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              </>
            )}
          </div>
        )}

        {/* ── ORDERS TAB ── */}
        {activeTab === 'orders' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-black tracking-wider text-white">Orders</h1>
                <p className="text-sm text-gray-500 mt-1">Manage and track all customer orders</p>
              </div>
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={() => setShowWorkloadModal(true)}
                  className="flex items-center gap-1.5 text-[10px] bg-indigo-900/60 hover:bg-indigo-800 text-indigo-300 border border-indigo-700 font-bold px-3 py-2 rounded-lg transition-colors uppercase tracking-wider"
                >
                  <Users className="w-3.5 h-3.5" /> Agent Workloads
                </button>
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-gray-500" />
                  <input
                    type="text"
                    placeholder="Search orders..."
                    value={orderSearch}
                    onChange={e => setOrderSearch(e.target.value)}
                    className="bg-white/5 border border-white/10 rounded-lg pl-8 pr-3 py-2 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-amber-400/50 w-48"
                  />
                </div>
                <select
                  value={statusFilter}
                  onChange={e => setStatusFilter(e.target.value)}
                  className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400/50"
                >
                  {['All','Pending','Paid','Processing','Shipped','Out for Delivery','Delivered'].map(s => (
                    <option key={s} value={s} className="bg-[#111]">{s}</option>
                  ))}
                </select>
              </div>
            </div>

            {loading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => <div key={i} className="h-20 rounded-xl bg-white/5 animate-pulse" />)}
              </div>
            ) : filteredOrders.length === 0 ? (
              <div className="text-center py-20 text-gray-600">
                <ShoppingBag className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p className="text-sm">No orders found</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredOrders.map(order => {
                  const sc = STATUS_COLORS[order.status] || STATUS_COLORS['Pending'];
                  const addr = typeof order.shipping_address === 'object'
                    ? `${order.shipping_address.city || ''}, ${order.shipping_address.state || ''}`.trim().replace(/^,\s*/, '')
                    : order.shipping_address || '';
                  return (
                    <div key={order.id} className="bg-[#111] border border-white/10 rounded-xl p-4 hover:border-amber-400/20 transition-all">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        {/* Left: order info */}
                        <div className="flex items-start gap-4">
                          <div className="text-center bg-white/5 rounded-lg px-3 py-2 shrink-0">
                            <p className="text-[10px] text-gray-500 uppercase">Order</p>
                            <p className="text-sm font-black text-amber-400">#{order.id}</p>
                            {order.is_urgent ? <span className="text-[8px] bg-red-500 text-white px-1 py-0.5 rounded font-black uppercase block mt-1">⚡URGENT</span> : null}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-white">{order.customer_name || 'Guest'}</p>
                            <p className="text-[10px] text-gray-500">{order.customer_email}</p>
                            {addr && <p className="text-[10px] text-gray-600 mt-0.5">📍 {addr}</p>}
                            <div className="flex flex-wrap gap-1 mt-2">
                              {(order.items || []).slice(0,2).map((item, i) => (
                                <span key={i} className="text-[10px] bg-white/5 px-2 py-0.5 rounded text-gray-400">
                                  {item.name} ×{item.quantity}
                                </span>
                              ))}
                              {(order.items || []).length > 2 && (
                                <span className="text-[10px] text-gray-600">+{order.items.length - 2} more</span>
                              )}
                            </div>
                          </div>
                        </div>
                        {/* Right: price + actions */}
                        <div className="flex flex-col items-end gap-2 shrink-0">
                          <p className="text-base font-black text-amber-400">₹{order.total_amount?.toLocaleString('en-IN')}</p>
                          <span className={`text-[10px] font-bold px-2 py-1 rounded border ${sc.bg} ${sc.text} ${sc.border}`}>
                            {order.status}
                          </span>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => setSelectedOrder(order)}
                              className="text-[10px] text-gray-400 hover:text-amber-400 flex items-center gap-1 transition-colors"
                            >
                              <Eye className="w-3 h-3" /> Manage
                            </button>
                            {!order.assigned_delivery_agent_id && (
                              <button
                                onClick={() => handleAutoAssign(order.id)}
                                disabled={autoAssigning === order.id}
                                title="Auto-assign to least busy agent"
                                className="text-[10px] bg-amber-500/20 hover:bg-amber-500/40 text-amber-400 border border-amber-500/30 px-2 py-1 rounded flex items-center gap-1 transition-colors font-bold"
                              >
                                {autoAssigning === order.id ? '...' : '🤖'}
                              </button>
                            )}
                            <button
                              onClick={() => handleToggleUrgent(order.id, order.is_urgent)}
                              disabled={togglingUrgent === order.id}
                              title={order.is_urgent ? 'Remove urgent flag' : 'Mark as urgent/express'}
                              className={`text-[10px] px-2 py-1 rounded flex items-center gap-1 transition-colors font-bold border ${
                                order.is_urgent
                                  ? 'bg-red-500/20 text-red-400 border-red-500/30 hover:bg-red-500/40'
                                  : 'bg-white/5 text-gray-500 border-white/10 hover:text-red-400'
                              }`}
                            >
                              {togglingUrgent === order.id ? '...' : '⚡'}
                            </button>
                          </div>
                        </div>
                      </div>
                      {order.delivery_agent_name && (
                        <div className="mt-3 pt-3 border-t border-white/5 flex items-center gap-2">
                          <Truck className="w-3.5 h-3.5 text-indigo-400" />
                          <span className="text-[10px] text-indigo-400">Assigned to: <strong>{order.delivery_agent_name}</strong></span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ── INVENTORY TAB ── */}
        {activeTab === 'inventory' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-black tracking-wider text-white">Inventory</h1>
                <p className="text-sm text-gray-500 mt-1">Product catalog and stock levels</p>
              </div>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-gray-500" />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="bg-white/5 border border-white/10 rounded-lg pl-8 pr-3 py-2 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-amber-400/50 w-52"
                />
              </div>
            </div>

            {products.length === 0 ? (
              <div className="flex justify-center py-20">
                <div className="w-8 h-8 border-2 border-amber-400/30 border-t-amber-400 rounded-full animate-spin" />
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredProducts.map(product => {
                  const imgs = Array.isArray(product.image_urls) ? product.image_urls : [];
                  const stockColor = product.stock === 0
                    ? 'bg-red-500/20 text-red-400 border-red-500/30'
                    : product.stock <= 5
                      ? 'bg-orange-500/20 text-orange-400 border-orange-500/30'
                      : 'bg-green-500/20 text-green-400 border-green-500/30';
                  return (
                    <div key={product.id} className="bg-[#111] border border-white/10 rounded-xl overflow-hidden hover:border-amber-400/20 transition-all group">
                      <div className="relative aspect-[4/3] bg-white/5 overflow-hidden">
                        {imgs[0] ? (
                          <img src={imgs[0]} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package className="w-10 h-10 text-gray-700" />
                          </div>
                        )}
                        <div className={`absolute top-2 right-2 text-[10px] font-bold px-2 py-0.5 rounded border ${stockColor}`}>
                          {product.stock === 0 ? 'OUT' : `${product.stock}`}
                        </div>
                      </div>
                      <div className="p-4">
                        <p className="text-xs font-bold text-white truncate">{product.name}</p>
                        <p className="text-[10px] text-gray-500 mt-0.5">{product.category} • {product.frame_shape}</p>
                        <div className="flex items-center justify-between mt-3">
                          <span className="text-sm font-black text-amber-400">₹{product.price?.toLocaleString('en-IN')}</span>
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${stockColor}`}>
                            {product.stock === 0 ? 'Out of Stock' : `${product.stock} units`}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </main>

      {/* ── ORDER DETAIL MODAL ── */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-start justify-center p-4 overflow-y-auto">
          <div className="bg-[#111] border border-white/15 rounded-2xl w-full max-w-lg my-8 shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <div>
                <h3 className="text-sm font-black text-white tracking-wider">Order #{selectedOrder.id}</h3>
                <p className="text-[10px] text-gray-500 mt-0.5">
                  {new Date(selectedOrder.created_at).toLocaleString('en-IN')}
                </p>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="p-2 text-gray-500 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              {/* Customer Info */}
              <div className="bg-white/5 rounded-xl p-4 space-y-1.5">
                <p className="text-[10px] font-bold text-amber-400 uppercase tracking-widest mb-2">Customer</p>
                <p className="text-sm text-white font-semibold">{selectedOrder.customer_name || 'Guest'}</p>
                <p className="text-xs text-gray-400">{selectedOrder.customer_email}</p>
                {selectedOrder.customer_phone && <p className="text-xs text-gray-400">📞 {selectedOrder.customer_phone}</p>}
                {typeof selectedOrder.shipping_address === 'object' && selectedOrder.shipping_address && (
                  <p className="text-xs text-gray-500 mt-1">
                    📍 {[
                      selectedOrder.shipping_address.address,
                      selectedOrder.shipping_address.city,
                      selectedOrder.shipping_address.state,
                      selectedOrder.shipping_address.pincode
                    ].filter(Boolean).join(', ')}
                  </p>
                )}
              </div>

              {/* Items */}
              <div>
                <p className="text-[10px] font-bold text-amber-400 uppercase tracking-widest mb-3">Items</p>
                <div className="space-y-2">
                  {(selectedOrder.items || []).map((item, i) => (
                    <div key={i} className="flex items-center justify-between text-xs">
                      <span className="text-gray-300">{item.name} <span className="text-gray-600">×{item.quantity}</span></span>
                      <span className="text-amber-400 font-bold">₹{(item.price * item.quantity)?.toLocaleString('en-IN')}</span>
                    </div>
                  ))}
                  <div className="border-t border-white/10 pt-2 flex justify-between text-sm">
                    <span className="font-bold text-white">Total</span>
                    <span className="font-black text-amber-400">₹{selectedOrder.total_amount?.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>

              {/* Current Status */}
              <div>
                <p className="text-[10px] font-bold text-amber-400 uppercase tracking-widest mb-2">Update Status</p>
                <div className="flex flex-wrap gap-2">
                  {['Pending', 'Processing', 'Shipped', 'Paid'].map(s => {
                    const sc = STATUS_COLORS[s];
                    return (
                      <button
                        key={s}
                        disabled={updatingStatus === selectedOrder.id}
                        onClick={() => handleStatusUpdate(selectedOrder.id, s)}
                        className={`text-[10px] font-bold px-3 py-1.5 rounded border transition-all ${
                          selectedOrder.status === s
                            ? `${sc.bg} ${sc.text} ${sc.border}`
                            : 'bg-white/5 text-gray-400 border-white/10 hover:border-amber-400/30'
                        }`}
                      >
                        {s}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Assign Delivery Agent */}
              {deliveryAgents.length > 0 && (
                <div>
                  <p className="text-[10px] font-bold text-amber-400 uppercase tracking-widest mb-2">
                    Assign Delivery Agent
                  </p>
                  {selectedOrder.delivery_agent_name && (
                    <p className="text-xs text-indigo-400 mb-2 flex items-center gap-1">
                      <Truck className="w-3.5 h-3.5" />
                      Currently: <strong>{selectedOrder.delivery_agent_name}</strong>
                    </p>
                  )}
                  <div className="grid grid-cols-2 gap-2">
                    {deliveryAgents.map(agent => (
                      <button
                        key={agent.id}
                        disabled={assigningAgent === selectedOrder.id}
                        onClick={() => handleAssignAgent(selectedOrder.id, agent.id)}
                        className={`text-[10px] font-semibold px-3 py-2 rounded border text-left transition-all ${
                          selectedOrder.assigned_delivery_agent_id === agent.id
                            ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40'
                            : 'bg-white/5 text-gray-400 border-white/10 hover:border-indigo-400/30'
                        }`}
                      >
                        <span className="block font-bold">{agent.name}</span>
                        <span className="text-[9px] text-gray-600 truncate block">{agent.email}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {selectedOrder.tracking_comments && (
                <div className="bg-white/5 rounded-xl p-3">
                  <p className="text-[10px] text-gray-500 mb-1 font-bold uppercase tracking-wider">Tracking Notes</p>
                  <p className="text-xs text-gray-300">{selectedOrder.tracking_comments}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 📊 AGENT WORKLOAD MODAL */}
      {showWorkloadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="bg-[#111] border border-white/10 rounded-2xl w-full max-w-lg p-6 relative">
            <button onClick={() => setShowWorkloadModal(false)} className="absolute top-4 right-4 text-gray-500 hover:text-white">
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-base font-black text-white tracking-wider mb-1">📊 Agent Workload & Performance</h2>
            <p className="text-xs text-gray-500 mb-5">Current active orders and delivery success rate per agent</p>
            {agentWorkloads.length === 0 ? (
              <p className="text-xs text-gray-500 text-center py-8">No delivery agents assigned yet. Go to Admin → Team Management to assign agents.</p>
            ) : (
              <div className="space-y-4">
                {agentWorkloads.map(agent => (
                  <div key={agent.id} className="bg-white/5 rounded-xl p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="text-sm font-bold text-white">{agent.name}</p>
                        <p className="text-[10px] text-gray-500">{agent.email}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-black text-amber-400">{agent.successRate}%</p>
                        <p className="text-[9px] text-gray-500 uppercase tracking-wider">Success Rate</p>
                      </div>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-2 mb-3">
                      <div
                        className={`h-2 rounded-full transition-all ${agent.successRate >= 80 ? 'bg-emerald-500' : agent.successRate >= 50 ? 'bg-amber-500' : 'bg-red-500'}`}
                        style={{ width: `${agent.successRate || 0}%` }}
                      />
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="bg-black/30 rounded-lg p-2">
                        <p className="text-sm font-black text-white">{agent.activeOrders}</p>
                        <p className="text-[9px] text-yellow-500 uppercase">Active</p>
                      </div>
                      <div className="bg-black/30 rounded-lg p-2">
                        <p className="text-sm font-black text-white">{agent.totalDelivered}</p>
                        <p className="text-[9px] text-emerald-500 uppercase">Delivered</p>
                      </div>
                      <div className="bg-black/30 rounded-lg p-2">
                        <p className="text-sm font-black text-white">{agent.totalAssigned}</p>
                        <p className="text-[9px] text-gray-400 uppercase">Total</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
