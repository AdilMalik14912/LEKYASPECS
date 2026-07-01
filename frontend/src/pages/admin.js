const React = require('react');
const { useState, useEffect } = React;
const Link = require('next/link').default;
const { useRouter } = require('next/router');
const { useAuth } = require('./_app');
const { 
  BarChart3, ShoppingBag, ClipboardList, Users, ShieldCheck, 
  Trash2, Edit, Plus, Star, Landmark, ShieldAlert, CheckCircle2, RotateCcw, AlertTriangle, Loader2, Sliders 
} = require('lucide-react');

export default function Admin() {
  const router = useRouter();
  const { user, token, authLoading } = useAuth();

  // Active dashboard tabs: 'stats', 'products', 'orders', 'customers'
  const [activeTab, setActiveTab] = useState('stats');

  // Stats / Analytics State
  const [analytics, setAnalytics] = useState(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);

  // Products CRUD State
  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  // Add/Edit Product Form state
  const [prodName, setProdName] = useState('');
  const [prodDescription, setProdDescription] = useState('');
  const [prodPrice, setProdPrice] = useState('');
  const [prodCategory, setProdCategory] = useState('Eyeglasses');
  const [prodGender, setProdGender] = useState('Unisex');
  const [prodShape, setProdShape] = useState('Rectangle');
  const [prodImage, setProdImage] = useState('');
  const [prodStock, setProdStock] = useState('10');
  const [crudError, setCrudError] = useState('');

  // Orders State
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);

  // Customers State
  const [customers, setCustomers] = useState([]);
  const [customersLoading, setCustomersLoading] = useState(true);

  // CMS Customizer State
  const [heroTitle, setHeroTitle] = useState('');
  const [heroSubtitle, setHeroSubtitle] = useState('');
  const [heroImage, setHeroImage] = useState('');
  const [trendingTitle, setTrendingTitle] = useState('');
  const [settingsLoading, setSettingsLoading] = useState(false);
  const [settingsSaving, setSettingsSaving] = useState(false);
  const [settingsSuccess, setSettingsSuccess] = useState('');
  const [settingsError, setSettingsError] = useState('');

  // Order Filtering State
  const [orderSearch, setOrderSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState('ALL');

  // Customer Filtering State
  const [customerSearch, setCustomerSearch] = useState('');

  // Product Filtering State
  const [productSearch, setProductSearch] = useState('');

  // Security gate: redirect if not admin
  useEffect(() => {
    if (!authLoading) {
      if (!user || user.email !== 'admin@specs.com') {
        router.push('/account');
      }
    }
  }, [user, authLoading]);

  // Fetch data depending on active tab
  useEffect(() => {
    if (!token || (user && user.email !== 'admin@specs.com')) return;

    if (activeTab === 'stats') {
      setAnalyticsLoading(true);
      fetch('http://localhost:5000/api/admin/stats', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => { setAnalytics(data); setAnalyticsLoading(false); })
        .catch(err => console.error(err));
    } else if (activeTab === 'products') {
      setProductsLoading(true);
      fetch('http://localhost:5000/api/products')
        .then(res => res.json())
        .then(data => { setProducts(data); setProductsLoading(false); })
        .catch(err => console.error(err));
    } else if (activeTab === 'orders') {
      setOrdersLoading(true);
      fetch('http://localhost:5000/api/admin/orders', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => { setOrders(data); setOrdersLoading(false); })
        .catch(err => console.error(err));
    } else if (activeTab === 'customers') {
      setCustomersLoading(true);
      fetch('http://localhost:5000/api/admin/customers', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => { setCustomers(data); setCustomersLoading(false); })
        .catch(err => console.error(err));
    } else if (activeTab === 'customizer') {
      setSettingsLoading(true);
      setSettingsError('');
      setSettingsSuccess('');
      fetch('http://localhost:5000/api/settings')
        .then(res => res.json())
        .then(data => {
          setHeroTitle(data.hero_title || '');
          setHeroSubtitle(data.hero_subtitle || '');
          setHeroImage(data.hero_image || '');
          setTrendingTitle(data.trending_title || '');
          setSettingsLoading(false);
        })
        .catch(err => {
          console.error(err);
          setSettingsError('Failed to load store CMS settings');
          setSettingsLoading(false);
        });
    }
  }, [activeTab, token, user]);

  // --- CRUD OPERATORS ---

  const openAddModal = () => {
    setEditingProduct(null);
    setProdName('');
    setProdDescription('');
    setProdPrice('');
    setProdCategory('Eyeglasses');
    setProdGender('Unisex');
    setProdShape('Rectangle');
    setProdImage('https://images.unsplash.com/photo-1591076482161-42ce6da69f67?auto=format&fit=crop&w=600&q=80');
    setProdStock('20');
    setCrudError('');
    setShowProductModal(true);
  };

  const openEditModal = (product) => {
    setEditingProduct(product);
    setProdName(product.name);
    setProdDescription(product.description || '');
    setProdPrice(product.price.toString());
    setProdCategory(product.category);
    setProdGender(product.gender);
    setProdShape(product.frame_shape);
    setProdImage(product.image_urls.join(', '));
    setProdStock(product.stock.toString());
    setCrudError('');
    setShowProductModal(true);
  };

  const handleProductSubmit = (e) => {
    e.preventDefault();
    setCrudError('');

    const url = editingProduct 
      ? `http://localhost:5000/api/admin/products/${editingProduct.id}` 
      : 'http://localhost:5000/api/admin/products';
    const method = editingProduct ? 'PUT' : 'POST';

    const payload = {
      name: prodName,
      description: prodDescription,
      price: parseFloat(prodPrice),
      category: prodCategory,
      gender: prodGender,
      frame_shape: prodShape,
      image_urls: prodImage.split(',').map(url => url.trim()).filter(url => url !== ''),
      stock: parseInt(prodStock)
    };

    fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    })
      .then(res => res.json())
      .then(data => {
        if (data.product) {
          setShowProductModal(false);
          // Refresh products tab
          setActiveTab('');
          setTimeout(() => setActiveTab('products'), 50);
        } else {
          setCrudError(data.message || 'Product operation failed');
        }
      })
      .catch(err => setCrudError('Connection error during product save'));
  };

  const handleSettingsSubmit = (e) => {
    e.preventDefault();
    setSettingsSaving(true);
    setSettingsError('');
    setSettingsSuccess('');

    fetch('http://localhost:5000/api/admin/settings', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        hero_title: heroTitle,
        hero_subtitle: heroSubtitle,
        hero_image: heroImage,
        trending_title: trendingTitle
      })
    })
      .then(res => res.json())
      .then(data => {
        setSettingsSaving(false);
        if (data.message && data.message.includes('successfully')) {
          setSettingsSuccess('Store configurations saved and applied successfully!');
        } else {
          setSettingsError(data.message || 'Failed to save store settings.');
        }
      })
      .catch(err => {
        console.error(err);
        setSettingsError('Connection error during settings save.');
        setSettingsSaving(false);
      });
  };

  const handleDeleteProduct = (id) => {
    if (!confirm('Are you sure you want to delete this eyewear frame from the catalog?')) return;

    fetch(`http://localhost:5000/api/admin/products/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        setProducts(products.filter(p => p.id !== id));
      })
      .catch(err => console.error(err));
  };

  // Update order status trigger
  const handleStatusUpdate = (orderId, newStatus) => {
    fetch(`http://localhost:5000/api/admin/orders/${orderId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ status: newStatus })
    })
      .then(res => res.json())
      .then(data => {
        setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
      })
      .catch(err => console.error(err));
  };

  // --- RENDER SECURITY CHECKS ---
  if (authLoading) {
    return (
      <div className="min-h-screen bg-premium-light flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-premium-accent"></div>
      </div>
    );
  }

  if (!user || user.email !== 'admin@specs.com') {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 text-center">
        <AlertTriangle className="w-16 h-16 text-red-600 mx-auto mb-4" />
        <h2 className="font-serif text-3xl font-bold text-premium-black mb-2">Access Forbidden</h2>
        <p className="text-sm text-premium-gray mb-6">You do not have administrative access permissions to view this dashboard.</p>
        <Link href="/account" className="bg-premium-black text-white hover:bg-premium-accent hover:text-premium-black text-xs uppercase tracking-widest px-6 py-3 rounded font-bold transition-colors">
          Return to Profile
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-premium-light min-h-screen flex flex-col md:flex-row">
      
      {/* Sidebar Controls */}
      <aside className="w-full md:w-64 bg-premium-black text-white p-6 shrink-0 flex flex-col border-r border-premium-accent/20">
        <div className="mb-10 text-center sm:text-left">
          <Link href="/" className="font-serif text-2xl font-bold tracking-widest text-premium-accent">
            LEKYA SPECS ADMIN
          </Link>
          <span className="block text-[10px] text-gray-500 uppercase tracking-widest mt-1">Management Portal</span>
        </div>

        <nav className="space-y-2 flex-grow uppercase text-xs tracking-wider font-semibold">
          <button
            onClick={() => setActiveTab('stats')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded transition-all text-left ${
              activeTab === 'stats' ? 'bg-premium-accent text-premium-black' : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <BarChart3 className="w-4 h-4" /> Dashboard Analytics
          </button>
          
          <button
            onClick={() => setActiveTab('products')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded transition-all text-left ${
              activeTab === 'products' ? 'bg-premium-accent text-premium-black' : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <ShoppingBag className="w-4 h-4" /> Manage Products
          </button>

          <button
            onClick={() => setActiveTab('orders')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded transition-all text-left ${
              activeTab === 'orders' ? 'bg-premium-accent text-premium-black' : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <ClipboardList className="w-4 h-4" /> Customer Orders
          </button>

          <button
            onClick={() => setActiveTab('customers')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded transition-all text-left ${
              activeTab === 'customers' ? 'bg-premium-accent text-premium-black' : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Users className="w-4 h-4" /> View Customers
          </button>

          <button
            onClick={() => setActiveTab('customizer')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded transition-all text-left ${
              activeTab === 'customizer' ? 'bg-premium-accent text-premium-black' : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Sliders className="w-4 h-4" /> Store Customizer (CMS)
          </button>
        </nav>

        <div className="border-t border-gray-800 pt-6 mt-10 flex items-center gap-2 text-[10px] text-premium-accent">
          <ShieldCheck className="w-4 h-4" /> Root Authorization
        </div>
      </aside>

      {/* Main Panel Content */}
      <main className="flex-grow p-6 sm:p-10 max-w-7xl overflow-x-hidden">
        
        {/* --- TAB 1: ANALYTICS OVERVIEW --- */}
        {activeTab === 'stats' && (
          <div>
            <h2 className="font-serif text-3xl font-bold text-premium-black mb-8 border-b border-premium-border pb-4">
              Dashboard Analytics
            </h2>

            {analyticsLoading ? (
              <div className="text-center py-20"><Loader2 className="w-10 h-10 text-premium-accent animate-spin mx-auto" /></div>
            ) : (
              <div className="space-y-8">
                {/* Metric Summary Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  <div className="bg-white border border-premium-border rounded p-6 shadow-sm">
                    <span className="block text-xs uppercase tracking-wider text-premium-gray font-semibold mb-1">Total Sales Revenue</span>
                    <span className="text-3xl font-bold text-premium-black">₹{analytics.metrics.total_sales.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="bg-white border border-premium-border rounded p-6 shadow-sm">
                    <span className="block text-xs uppercase tracking-wider text-premium-gray font-semibold mb-1">Paid Orders</span>
                    <span className="text-3xl font-bold text-premium-black">{analytics.metrics.total_orders}</span>
                  </div>
                  <div className="bg-white border border-premium-border rounded p-6 shadow-sm">
                    <span className="block text-xs uppercase tracking-wider text-premium-gray font-semibold mb-1">Registered Customers</span>
                    <span className="text-3xl font-bold text-premium-black">{analytics.metrics.total_customers}</span>
                  </div>
                </div>

                {/* Grid for top selling & low stock */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Top Selling Products */}
                  <div className="bg-white border border-premium-border rounded p-6 shadow-sm">
                    <h3 className="font-serif text-lg font-bold text-premium-black mb-4">Top 5 Best Sellers</h3>
                    <div className="divide-y divide-premium-border">
                      {analytics.top_products.map((item, idx) => (
                        <div key={item.id} className="py-3 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span className="font-bold text-xs text-premium-accent w-4">{idx + 1}</span>
                            <img src={item.image} alt={item.name} className="w-10 h-10 object-cover rounded border border-premium-border" />
                            <div>
                              <span className="font-semibold text-sm text-premium-dark block truncate max-w-[150px]">{item.name}</span>
                              <span className="text-[10px] text-premium-gray uppercase font-semibold">{item.frame_shape} shape</span>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="font-bold text-sm block">₹{parseFloat(item.revenue).toLocaleString('en-IN')}</span>
                            <span className="text-[10px] text-premium-gray block">{item.units_sold} units sold</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Low Stock Warnings */}
                  <div className="bg-white border border-premium-border rounded p-6 shadow-sm">
                    <h3 className="font-serif text-lg font-bold text-premium-black mb-4 text-red-600 flex items-center gap-2">
                      <ShieldAlert className="w-5 h-5 text-red-600" /> Low Stock Alerts
                    </h3>
                    {analytics.low_stock_alerts.length === 0 ? (
                      <p className="text-sm text-premium-gray py-4 text-center">All product inventory columns healthy.</p>
                    ) : (
                      <div className="divide-y divide-premium-border">
                        {analytics.low_stock_alerts.map(item => (
                          <div key={item.id} className="py-3 flex items-center justify-between">
                            <div>
                              <span className="font-semibold text-sm text-premium-dark block">{item.name}</span>
                              <span className="text-xs text-premium-gray">Price: ₹{parseFloat(item.price).toLocaleString('en-IN')}</span>
                            </div>
                            <span className={`font-bold px-3 py-1 rounded text-xs ${
                              item.stock === 0 ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                            }`}>
                              {item.stock} left
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Sales Category Distribution */}
                <div className="bg-white border border-premium-border rounded p-6 shadow-sm">
                  <h3 className="font-serif text-lg font-bold text-premium-black mb-4">Category Distribution</h3>
                  <div className="grid grid-cols-2 gap-4 text-center">
                    {analytics.category_distribution.map(cat => (
                      <div key={cat.category} className="p-4 bg-premium-light border border-premium-border rounded">
                        <span className="block text-xs uppercase tracking-wider text-premium-gray font-semibold mb-1">{cat.category}</span>
                        <span className="text-xl font-bold text-premium-black">₹{parseFloat(cat.revenue).toLocaleString('en-IN')}</span>
                        <span className="block text-[10px] text-premium-accent uppercase font-bold mt-1">{cat.items_sold} sold</span>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            )}
          </div>
        )}

        {/* --- TAB 2: PRODUCT CATALOG MANAGEMENT --- */}
        {activeTab === 'products' && (
          <div>
            <div className="flex flex-col sm:flex-row items-center justify-between mb-8 gap-4 border-b border-premium-border pb-4">
              <h2 className="font-serif text-3xl font-bold text-premium-black">
                Manage Inventory
              </h2>
              <button
                onClick={openAddModal}
                className="bg-premium-black text-white hover:bg-premium-accent hover:text-premium-black font-semibold text-xs tracking-widest uppercase px-6 py-3.5 rounded transition-all flex items-center gap-1.5 shadow"
              >
                <Plus className="w-4 h-4" /> Add Eyewear Frame
              </button>
            </div>

            {productsLoading ? (
              <div className="text-center py-20"><Loader2 className="w-10 h-10 text-premium-accent animate-spin mx-auto" /></div>
            ) : (
              <div>
                {/* Product Search */}
                <div className="flex flex-col sm:flex-row gap-4 mb-5 items-center">
                  <input
                    type="text"
                    placeholder="Search products by name, category, shape..."
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    className="w-full sm:w-96 bg-white border border-premium-border rounded p-2.5 text-xs focus:outline-none focus:border-premium-accent text-premium-dark font-medium"
                  />
                  <span className="text-xs text-premium-gray font-semibold">{products.filter(p =>
                    p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
                    p.category.toLowerCase().includes(productSearch.toLowerCase()) ||
                    p.frame_shape.toLowerCase().includes(productSearch.toLowerCase())
                  ).length} of {products.length} products</span>
                </div>

                <div className="bg-white border border-premium-border rounded overflow-x-auto shadow-sm">
                  <table className="min-w-full divide-y divide-premium-border text-left">
                    <thead className="bg-premium-light text-[10px] uppercase tracking-wider text-premium-gray font-bold">
                      <tr>
                        <th className="px-6 py-4">ID</th>
                        <th className="px-6 py-4">Product Details</th>
                        <th className="px-6 py-4">Gender/Category</th>
                        <th className="px-6 py-4">Frame Shape</th>
                        <th className="px-6 py-4">Price</th>
                        <th className="px-6 py-4">Stock</th>
                        <th className="px-6 py-4 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-premium-border text-sm font-medium text-premium-dark">
                      {products.filter(p =>
                        p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
                        p.category.toLowerCase().includes(productSearch.toLowerCase()) ||
                        p.frame_shape.toLowerCase().includes(productSearch.toLowerCase())
                      ).map(prod => (
                        <tr key={prod.id} className="hover:bg-premium-light/50">
                          <td className="px-6 py-4 text-xs font-bold text-premium-accent">#{prod.id}</td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <img src={prod.image_urls[0]} alt={prod.name} className="w-10 h-10 object-cover rounded border border-premium-border" />
                              <span className="font-semibold block truncate max-w-[180px]">{prod.name}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-xs">{prod.gender} • {prod.category}</td>
                          <td className="px-6 py-4">{prod.frame_shape}</td>
                          <td className="px-6 py-4 font-bold">₹{parseFloat(prod.price).toLocaleString('en-IN')}</td>
                          <td className="px-6 py-4">
                            <span className={`font-bold px-2.5 py-0.5 rounded text-xs ${
                              prod.stock === 0 ? 'bg-red-100 text-red-700' :
                              prod.stock <= 5 ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'
                            }`}>
                              {prod.stock}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex justify-center items-center gap-3">
                              <button onClick={() => openEditModal(prod)} className="p-1.5 text-premium-gray hover:text-premium-accent transition-colors" title="Edit Frame">
                                <Edit className="w-4 h-4" />
                              </button>
                              <button onClick={() => handleDeleteProduct(prod.id)} className="p-1.5 text-premium-gray hover:text-red-600 transition-colors" title="Delete Frame">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* --- TAB 3: ORDER STATUS ACTIONS --- */}
        {activeTab === 'orders' && (
          <div>
            <h2 className="font-serif text-3xl font-bold text-premium-black mb-8 border-b border-premium-border pb-4">
              Customer Orders
            </h2>

            {ordersLoading ? (
              <div className="text-center py-20"><Loader2 className="w-10 h-10 text-premium-accent animate-spin mx-auto" /></div>
            ) : (
              <div>
                {/* Search & Status Filters */}
                <div className="flex flex-col sm:flex-row gap-4 mb-6 items-center justify-between">
                  <input
                    type="text"
                    placeholder="Search orders (ID, Name, Email)..."
                    value={orderSearch}
                    onChange={(e) => setOrderSearch(e.target.value)}
                    className="w-full sm:w-80 bg-white border border-premium-border rounded p-2.5 text-xs focus:outline-none focus:border-premium-accent text-premium-dark font-medium"
                  />
                  <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                    <label className="text-xs uppercase tracking-wider text-premium-gray font-semibold">Filter Status</label>
                    <select
                      value={orderStatusFilter}
                      onChange={(e) => setOrderStatusFilter(e.target.value)}
                      className="bg-white text-xs border border-premium-border rounded px-3 py-2 focus:outline-none focus:border-premium-accent font-bold uppercase tracking-wider text-premium-dark"
                    >
                      <option value="ALL">All Statuses</option>
                      <option value="Paid">Paid</option>
                      <option value="Processing">Processing</option>
                      <option value="Shipped">Shipped</option>
                      <option value="Delivered">Delivered</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>

                {orders.filter(order => {
                  const matchesSearch = 
                    order.user_name.toLowerCase().includes(orderSearch.toLowerCase()) ||
                    order.user_email.toLowerCase().includes(orderSearch.toLowerCase()) ||
                    order.id.toString().includes(orderSearch);
                    
                  const matchesStatus = orderStatusFilter === 'ALL' || order.status === orderStatusFilter;
                  
                  return matchesSearch && matchesStatus;
                }).length === 0 ? (
                  <p className="text-center py-10 bg-white border rounded text-premium-gray">No customer orders matching the filter.</p>
                ) : (
                  <div className="bg-white border border-premium-border rounded overflow-x-auto shadow-sm">
                    <table className="min-w-full divide-y divide-premium-border text-left">
                      <thead className="bg-premium-light text-[10px] uppercase tracking-wider text-premium-gray font-bold">
                        <tr>
                          <th className="px-6 py-4">Order ID</th>
                          <th className="px-6 py-4">Customer</th>
                          <th className="px-6 py-4">Payment ID</th>
                          <th className="px-6 py-4">Shipping Info</th>
                          <th className="px-6 py-4">Date</th>
                          <th className="px-6 py-4">Total Amount</th>
                          <th className="px-6 py-4">Fulfillment Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-premium-border text-sm font-medium text-premium-dark">
                        {orders.filter(order => {
                          const matchesSearch = 
                            order.user_name.toLowerCase().includes(orderSearch.toLowerCase()) ||
                            order.user_email.toLowerCase().includes(orderSearch.toLowerCase()) ||
                            order.id.toString().includes(orderSearch);
                            
                          const matchesStatus = orderStatusFilter === 'ALL' || order.status === orderStatusFilter;
                          
                          return matchesSearch && matchesStatus;
                        }).map(order => (
                          <tr key={order.id} className="hover:bg-premium-light/50">
                            <td className="px-6 py-4 text-xs font-bold text-premium-accent">#{order.id}</td>
                            <td className="px-6 py-4">
                              <div>
                                <span className="font-semibold block">{order.user_name}</span>
                                <span className="text-[10px] text-premium-gray block mt-0.5">{order.user_email}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-xs font-mono">{order.payment_id || 'N/A'}</td>
                            <td className="px-6 py-4 text-xs max-w-[200px] truncate" title={`${order.shipping_address.address}, ${order.shipping_address.city}`}>
                              {order.shipping_address.address}, {order.shipping_address.city} (PIN {order.shipping_address.zip})
                            </td>
                            <td className="px-6 py-4 text-xs">
                              {new Date(order.created_at).toLocaleDateString('en-IN', {
                                year: 'numeric', month: 'short', day: 'numeric'
                              })}
                            </td>
                            <td className="px-6 py-4 font-bold text-premium-accent">₹{parseFloat(order.total_amount).toLocaleString('en-IN')}</td>
                            <td className="px-6 py-4">
                              <select
                                value={order.status}
                                onChange={(e) => handleStatusUpdate(order.id, e.target.value)}
                                className={`bg-premium-light text-xs font-bold border border-premium-border rounded px-2.5 py-1 focus:outline-none focus:border-premium-accent uppercase tracking-wide cursor-pointer ${
                                  order.status === 'Paid' ? 'text-green-700' :
                                  order.status === 'Processing' ? 'text-amber-700' :
                                  order.status === 'Shipped' ? 'text-blue-700' : 'text-gray-700'
                                }`}
                              >
                                <option value="Paid">Paid</option>
                                <option value="Processing">Processing</option>
                                <option value="Shipped">Shipped</option>
                                <option value="Delivered">Delivered</option>
                                <option value="Cancelled">Cancelled</option>
                              </select>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* --- TAB 4: CUSTOMERS DIRECTORY --- */}
        {activeTab === 'customers' && (
          <div>
            <h2 className="font-serif text-3xl font-bold text-premium-black mb-8 border-b border-premium-border pb-4">
              Registered Customers
            </h2>

            {customersLoading ? (
              <div className="text-center py-20"><Loader2 className="w-10 h-10 text-premium-accent animate-spin mx-auto" /></div>
            ) : (
              <div>
                {/* Customer Search */}
                <div className="flex flex-col sm:flex-row gap-4 mb-6 items-center justify-between">
                  <input
                    type="text"
                    placeholder="Search customers (name, email, face shape)..."
                    value={customerSearch}
                    onChange={(e) => setCustomerSearch(e.target.value)}
                    className="w-full sm:w-96 bg-white border border-premium-border rounded p-2.5 text-xs focus:outline-none focus:border-premium-accent text-premium-dark font-medium"
                  />
                  <span className="text-xs text-premium-gray font-semibold">
                    {customers.filter(c =>
                      c.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
                      c.email.toLowerCase().includes(customerSearch.toLowerCase()) ||
                      (c.face_shape || '').toLowerCase().includes(customerSearch.toLowerCase())
                    ).length} results
                  </span>
                </div>

                {customers.filter(c =>
                  c.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
                  c.email.toLowerCase().includes(customerSearch.toLowerCase()) ||
                  (c.face_shape || '').toLowerCase().includes(customerSearch.toLowerCase())
                ).length === 0 ? (
                  <p className="text-center py-10 bg-white border rounded text-premium-gray">No customers matching your search.</p>
                ) : (
                  <div className="bg-white border border-premium-border rounded overflow-x-auto shadow-sm">
                    <table className="min-w-full divide-y divide-premium-border text-left">
                      <thead className="bg-premium-light text-[10px] uppercase tracking-wider text-premium-gray font-bold">
                        <tr>
                          <th className="px-6 py-4">User ID</th>
                          <th className="px-6 py-4">Customer Name</th>
                          <th className="px-6 py-4">Email</th>
                          <th className="px-6 py-4">Face Profile</th>
                          <th className="px-6 py-4">Registration Date</th>
                          <th className="px-6 py-4">Paid Orders</th>
                          <th className="px-6 py-4">Total Revenue Generated</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-premium-border text-sm font-medium text-premium-dark">
                        {customers.filter(c =>
                          c.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
                          c.email.toLowerCase().includes(customerSearch.toLowerCase()) ||
                          (c.face_shape || '').toLowerCase().includes(customerSearch.toLowerCase())
                        ).map(cust => (
                          <tr key={cust.id} className="hover:bg-premium-light/50">
                            <td className="px-6 py-4 text-xs font-bold text-premium-accent">#{cust.id}</td>
                            <td className="px-6 py-4 font-semibold">{cust.name}</td>
                            <td className="px-6 py-4 font-mono text-xs">{cust.email}</td>
                            <td className="px-6 py-4">
                              <span className={`text-[10px] uppercase font-bold tracking-wide ${cust.face_shape ? 'text-premium-golddark font-semibold' : 'text-gray-400'}`}>
                                {cust.face_shape || 'No Scan'}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-xs">
                              {new Date(cust.created_at).toLocaleDateString('en-IN', {
                                year: 'numeric', month: 'short', day: 'numeric'
                              })}
                            </td>
                            <td className="px-6 py-4 font-bold text-center sm:text-left">{cust.paid_orders_count}</td>
                            <td className="px-6 py-4 font-bold text-premium-accent">₹{parseFloat(cust.total_spend || 0).toLocaleString('en-IN')}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* --- TAB 5: STORE CUSTOMIZER (CMS) --- */}
        {activeTab === 'customizer' && (
          <div>
            <h2 className="font-serif text-3xl font-bold text-premium-black mb-2 border-b border-premium-border pb-4">
              Store Content Customizer
            </h2>
            <p className="text-xs text-premium-gray font-light mb-8">
              Modify the homepage hero banners, main headings, subtitles, background slides, and product showcase titles in real time.
            </p>

            {settingsLoading ? (
              <div className="text-center py-20"><Loader2 className="w-10 h-10 text-premium-accent animate-spin mx-auto" /></div>
            ) : (
              <form onSubmit={handleSettingsSubmit} className="bg-white border border-premium-border rounded p-6 sm:p-10 shadow-sm space-y-6 max-w-2xl">
                
                <div>
                  <label className="block text-xs uppercase tracking-wider text-premium-gray font-semibold mb-2">Homepage Hero Title</label>
                  <textarea
                    required
                    rows="3"
                    value={heroTitle}
                    onChange={(e) => setHeroTitle(e.target.value)}
                    placeholder="Engineered for \n Style & Clarity"
                    className="w-full bg-premium-light text-sm border border-premium-border rounded p-3 focus:outline-none focus:border-premium-accent text-premium-dark font-medium leading-relaxed"
                  />
                  <p className="text-[10px] text-gray-400 mt-1 font-light">Tip: Type a new line or \n to break the heading line on larger screens.</p>
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider text-premium-gray font-semibold mb-2">Hero Description Subtitle</label>
                  <textarea
                    required
                    rows="4"
                    value={heroSubtitle}
                    onChange={(e) => setHeroSubtitle(e.target.value)}
                    placeholder="Crafted from premium materials..."
                    className="w-full bg-premium-light text-sm border border-premium-border rounded p-3 focus:outline-none focus:border-premium-accent text-premium-dark font-medium leading-relaxed"
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider text-premium-gray font-semibold mb-2">Hero Background Image URL</label>
                  <input
                    type="text"
                    required
                    value={heroImage}
                    onChange={(e) => setHeroImage(e.target.value)}
                    placeholder="https://images.unsplash.com/photo-..."
                    className="w-full bg-premium-light text-sm border border-premium-border rounded p-3 focus:outline-none focus:border-premium-accent text-premium-dark font-medium"
                  />
                  <div className="mt-3 relative h-40 w-full bg-premium-light border rounded overflow-hidden">
                    {heroImage && <img src={heroImage} alt="hero preview" className="w-full h-full object-cover" />}
                  </div>
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider text-premium-gray font-semibold mb-2">Showcase Section Title</label>
                  <input
                    type="text"
                    required
                    value={trendingTitle}
                    onChange={(e) => setTrendingTitle(e.target.value)}
                    placeholder="Trending Frames"
                    className="w-full bg-premium-light text-sm border border-premium-border rounded p-3 focus:outline-none focus:border-premium-accent text-premium-dark font-medium"
                  />
                </div>

                {settingsError && (
                  <div className="text-red-600 text-xs font-semibold p-3 bg-red-50 rounded border border-red-200">
                    {settingsError}
                  </div>
                )}

                {settingsSuccess && (
                  <div className="text-green-700 text-xs font-semibold p-3 bg-green-50 rounded border border-green-200 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                    {settingsSuccess}
                  </div>
                )}

                <div className="pt-4 border-t border-premium-border">
                  <button
                    type="submit"
                    disabled={settingsSaving}
                    className="bg-premium-black text-white hover:bg-premium-accent hover:text-premium-black font-semibold text-xs tracking-widest uppercase py-4 px-10 rounded transition-all shadow-md flex items-center gap-2 disabled:opacity-50"
                  >
                    {settingsSaving ? 'Saving Configurations...' : 'Save & Publish Changes'}
                  </button>
                </div>

              </form>
            )}
          </div>
        )}

      </main>

      {/* --- ADD/EDIT PRODUCT MODAL POPUP --- */}
      {showProductModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white border border-premium-border rounded-lg max-w-lg w-full p-6 sm:p-8 shadow-2xl relative my-8">
            <h3 className="font-serif text-2xl font-bold text-premium-black mb-6">
              {editingProduct ? 'Edit Eyewear Specs' : 'Add New Eyewear Frame'}
            </h3>

            <form onSubmit={handleProductSubmit} className="space-y-4">
              <div>
                <label className="block text-xs uppercase tracking-wider text-premium-gray font-semibold mb-1">Frame Name</label>
                <input
                  type="text"
                  required
                  value={prodName}
                  onChange={(e) => setProdName(e.target.value)}
                  placeholder="Vintage Golden Round"
                  className="w-full bg-premium-light text-sm border border-premium-border rounded p-3 focus:outline-none focus:border-premium-accent text-premium-dark font-medium"
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-premium-gray font-semibold mb-1">Description</label>
                <textarea
                  rows="3"
                  value={prodDescription}
                  onChange={(e) => setProdDescription(e.target.value)}
                  placeholder="Describe material details, temples, lenses, fit..."
                  className="w-full bg-premium-light text-sm border border-premium-border rounded p-3 focus:outline-none focus:border-premium-accent text-premium-dark font-medium"
                ></textarea>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs uppercase tracking-wider text-premium-gray font-semibold mb-1">Price (INR)</label>
                  <input
                    type="number"
                    required
                    value={prodPrice}
                    onChange={(e) => setProdPrice(e.target.value)}
                    placeholder="3999"
                    className="w-full bg-premium-light text-sm border border-premium-border rounded p-3 focus:outline-none focus:border-premium-accent text-premium-dark font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider text-premium-gray font-semibold mb-1">Stock Qty</label>
                  <input
                    type="number"
                    required
                    value={prodStock}
                    onChange={(e) => setProdStock(e.target.value)}
                    placeholder="25"
                    className="w-full bg-premium-light text-sm border border-premium-border rounded p-3 focus:outline-none focus:border-premium-accent text-premium-dark font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs uppercase tracking-wider text-premium-gray font-semibold mb-1">Category</label>
                  <select
                    value={prodCategory}
                    onChange={(e) => setProdCategory(e.target.value)}
                    className="w-full bg-premium-light text-sm border border-premium-border rounded p-3 focus:outline-none focus:border-premium-accent text-premium-dark font-semibold"
                  >
                    <option value="Eyeglasses">Eyeglasses</option>
                    <option value="Sunglasses">Sunglasses</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider text-premium-gray font-semibold mb-1">Gender</label>
                  <select
                    value={prodGender}
                    onChange={(e) => setProdGender(e.target.value)}
                    className="w-full bg-premium-light text-sm border border-premium-border rounded p-3 focus:outline-none focus:border-premium-accent text-premium-dark font-semibold"
                  >
                    <option value="Men">Men</option>
                    <option value="Women">Women</option>
                    <option value="Kids">Kids</option>
                    <option value="Unisex">Unisex</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider text-premium-gray font-semibold mb-1">Frame Shape</label>
                  <select
                    value={prodShape}
                    onChange={(e) => setProdShape(e.target.value)}
                    className="w-full bg-premium-light text-sm border border-premium-border rounded p-3 focus:outline-none focus:border-premium-accent text-premium-dark font-semibold"
                  >
                    <option value="Rectangle">Rectangle</option>
                    <option value="Square">Square</option>
                    <option value="Round">Round</option>
                    <option value="Aviator">Aviator</option>
                    <option value="Cat-Eye">Cat-Eye</option>
                    <option value="Wayfarer">Wayfarer</option>
                    <option value="Oval">Oval</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-premium-gray font-semibold mb-1">Image URL</label>
                <input
                  type="text"
                  required
                  value={prodImage}
                  onChange={(e) => setProdImage(e.target.value)}
                  placeholder="https://unsplash.com/..."
                  className="w-full bg-premium-light text-sm border border-premium-border rounded p-3 focus:outline-none focus:border-premium-accent text-premium-dark font-medium"
                />
              </div>

              {crudError && (
                <div className="text-red-600 text-xs font-semibold p-3 bg-red-50 rounded border border-red-200">
                  {crudError}
                </div>
              )}

              <div className="flex gap-4 pt-4 border-t border-premium-border">
                <button
                  type="submit"
                  className="flex-grow bg-premium-black text-white hover:bg-premium-accent hover:text-premium-black font-semibold text-xs tracking-widest uppercase py-3.5 rounded transition-all"
                >
                  {editingProduct ? 'Update Product' : 'Add Frame'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowProductModal(false)}
                  className="border border-premium-border hover:bg-gray-50 text-premium-dark font-semibold text-xs tracking-widest uppercase py-3.5 px-6 rounded transition-all"
                >
                  Cancel
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
