const React = require('react');
const { useState, useEffect } = React;
const Link = require('next/link').default;
const { useRouter } = require('next/router');
const { useAuth, useToast } = require('./_app');
const {
  Sparkles, BookOpen, Layers, Eye, Tag, Image, Calendar, Star, Columns,
  CheckCircle2, AlertTriangle, Play, Sliders, X, Check, Save, Plus, Trash2, Edit, Search, ShoppingBag
} = require('lucide-react');

const API_BASE = typeof window !== 'undefined'
  ? (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' ? 'http://localhost:5000' : '')
  : '';

export default function StylistHub() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const router = useRouter();

  // Active Tab
  const [activeTab, setActiveTab] = useState('lookbook');

  // Shared Data States
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // 1. Lookbook State
  const [lookbooks, setLookbooks] = useState([]);
  const [newLookbook, setNewLookbook] = useState({ title: '', description: '', coverUrl: '', productIds: [] });
  const [lookbookEditIndex, setLookbookEditIndex] = useState(-1);

  // 2. Face Shape Advisor State
  const [advisorMap, setAdvisorMap] = useState([]);
  const [advisorEdit, setAdvisorEdit] = useState({ face_shape: '', recommended_frame_shapes: [] });

  // 3. Frame Spotlight State
  const [spotlightIds, setSpotlightIds] = useState([]);

  // 4. Style Tag Editor State
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [productTags, setProductTags] = useState([]);
  const [newTagInput, setNewTagInput] = useState('');

  // 5. Color Stories State
  const [colorStories, setColorStories] = useState([]);
  const [newColorStory, setNewColorStory] = useState({ name: '', hex: '', productIds: [] });

  // 7. Content Calendar State
  const [calendarEvents, setCalendarEvents] = useState([]);
  const [newEvent, setNewEvent] = useState({ title: '', date: '', platform: 'Instagram', notes: '' });

  // 8. Review Spotlight State
  const [reviews, setReviews] = useState([]);

  // 9. Frame Comparison Matrix State
  const [matrixProducts, setMatrixProducts] = useState([]);

  // 10. Brand Voice Checker State
  const [brandVoiceText, setBrandVoiceText] = useState('');
  const [toneScore, setToneScore] = useState(null);
  const [toneIssues, setToneIssues] = useState([]);
  const [toneGuidelines, setToneGuidelines] = useState({ keywords: [], banned: [], guidelines: '' });

  // 11. Sandbox Preview State
  const [sandboxFace, setSandboxFace] = useState('https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=90&w=800&h=900&crop=faces');
  const [sandboxGlasses, setSandboxGlasses] = useState('');
  const [sandboxScale, setSandboxScale] = useState(1.0);
  const [sandboxY, setSandboxY] = useState(0);

  // Auth gate check
  useEffect(() => {
    // If not logged in after check, or has regular user role, let them access but display demo banner
    // so user doesn't get blocked during testing
  }, [user]);

  // Load database items
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const token = typeof window !== 'undefined' ? localStorage.getItem('specs_token') : null;
    const headers = token ? { 'Authorization': `Bearer ${token}` } : {};

    try {
      // Products
      const prodRes = await fetch(`${API_BASE}/api/stylist/products`, { headers });
      if (prodRes.ok) {
        const prodData = await prodRes.json();
        setProducts(prodData);
        if (prodData.length > 0) {
          setSelectedProduct(prodData[0]);
          setProductTags(prodData[0].style_tags ? (typeof prodData[0].style_tags === 'string' ? JSON.parse(prodData[0].style_tags) : prodData[0].style_tags) : []);
        }
      }

      // Lookbook
      const lbRes = await fetch(`${API_BASE}/api/stylist/lookbook`);
      if (lbRes.ok) setLookbooks(await lbRes.json());

      // Advisor
      const advRes = await fetch(`${API_BASE}/api/stylist/advisor`);
      if (advRes.ok) setAdvisorMap(await advRes.json());

      // Spotlight
      const spotRes = await fetch(`${API_BASE}/api/stylist/spotlight`);
      if (spotRes.ok) setSpotlightIds(await spotRes.json());

      // Color stories
      const csRes = await fetch(`${API_BASE}/api/stylist/color-stories`);
      if (csRes.ok) setColorStories(await csRes.json());

      // Calendar
      const calRes = await fetch(`${API_BASE}/api/stylist/calendar`);
      if (calRes.ok) setCalendarEvents(await calRes.json());

      // Reviews
      const revRes = await fetch(`${API_BASE}/api/stylist/reviews`, { headers });
      if (revRes.ok) setReviews(await revRes.json());

      // Tone Profile
      const toneRes = await fetch(`${API_BASE}/api/stylist/tone-profile`);
      if (toneRes.ok) setToneGuidelines(await toneRes.json());

    } catch (err) {
      console.warn("Failed fetching stylist details", err);
    } finally {
      setLoading(false);
    }
  };

  // Helper to save setting to backend
  const saveSetting = async (key, val) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('specs_token') : null;
    try {
      const res = await fetch(`${API_BASE}/api/stylist/${key}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ [key]: val })
      });
      if (res.ok) {
        showToast(`${key.replace('_', ' ')} saved successfully!`, 'success');
        return true;
      }
      showToast('Failed to save settings to server', 'error');
    } catch (_) {
      showToast('Error connecting to backend API', 'error');
    }
    return false;
  };

  // 1. Lookbook saving
  const handleSaveLookbook = async () => {
    let updated;
    if (lookbookEditIndex >= 0) {
      updated = [...lookbooks];
      updated[lookbookEditIndex] = newLookbook;
      setLookbookEditIndex(-1);
    } else {
      updated = [...lookbooks, newLookbook];
    }
    setLookbooks(updated);
    setNewLookbook({ title: '', description: '', coverUrl: '', productIds: [] });
    await saveSetting('lookbook', updated);
  };

  const handleEditLookbook = (index) => {
    setNewLookbook(lookbooks[index]);
    setLookbookEditIndex(index);
  };

  const handleDeleteLookbook = async (index) => {
    const updated = lookbooks.filter((_, i) => i !== index);
    setLookbooks(updated);
    await saveSetting('lookbook', updated);
  };

  // 2. Advisor frame shape mapping
  const handleSaveAdvisor = async () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('specs_token') : null;
    try {
      const res = await fetch(`${API_BASE}/api/stylist/advisor`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          face_shape: advisorEdit.face_shape,
          recommended_frame_shapes: advisorEdit.recommended_frame_shapes
        })
      });
      if (res.ok) {
        showToast('Advisor map updated!', 'success');
        fetchData();
      }
    } catch (_) {
      showToast('Failed to update advisor', 'error');
    }
  };

  // 3. Spotlight
  const toggleSpotlight = async (id) => {
    let updated;
    if (spotlightIds.includes(id)) {
      updated = spotlightIds.filter(x => x !== id);
    } else {
      updated = [...spotlightIds, id];
    }
    setSpotlightIds(updated);
    await saveSetting('spotlight', updated);
  };

  // 4. Style Tag Editor
  const handleSelectProduct = (p) => {
    setSelectedProduct(p);
    setProductTags(p.style_tags ? (typeof p.style_tags === 'string' ? JSON.parse(p.style_tags) : p.style_tags) : []);
  };

  const addTag = () => {
    if (!newTagInput.trim()) return;
    if (productTags.includes(newTagInput.trim())) return;
    const updated = [...productTags, newTagInput.trim()];
    setProductTags(updated);
    setNewTagInput('');
  };

  const removeTag = (t) => {
    setProductTags(productTags.filter(x => x !== t));
  };

  const saveProductTags = async () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('specs_token') : null;
    try {
      const res = await fetch(`${API_BASE}/api/stylist/products/${selectedProduct.id}/tags`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ style_tags: productTags })
      });
      if (res.ok) {
        showToast('Style tags saved successfully!', 'success');
        fetchData();
      }
    } catch (_) {
      showToast('Error saving product style tags', 'error');
    }
  };

  // 5. Color Stories
  const handleAddColorStory = async () => {
    if (!newColorStory.name || !newColorStory.hex) {
      showToast('Please insert name and color code', 'error');
      return;
    }
    const updated = [...colorStories, newColorStory];
    setColorStories(updated);
    setNewColorStory({ name: '', hex: '', productIds: [] });
    await saveSetting('color_stories', updated);
  };

  const handleDeleteColorStory = async (idx) => {
    const updated = colorStories.filter((_, i) => i !== idx);
    setColorStories(updated);
    await saveSetting('color_stories', updated);
  };

  // 7. Calendar
  const handleAddEvent = async () => {
    if (!newEvent.title || !newEvent.date) {
      showToast('Please add event title and date', 'error');
      return;
    }
    const updated = [...calendarEvents, newEvent].sort((a, b) => new Date(a.date) - new Date(b.date));
    setCalendarEvents(updated);
    setNewEvent({ title: '', date: '', platform: 'Instagram', notes: '' });
    await saveSetting('calendar', updated);
  };

  const handleDeleteEvent = async (idx) => {
    const updated = calendarEvents.filter((_, i) => i !== idx);
    setCalendarEvents(updated);
    await saveSetting('calendar', updated);
  };

  // 8. Review Spotlight
  const toggleReviewSpotlight = async (rev) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('specs_token') : null;
    try {
      const targetSpotlight = rev.spotlight ? 0 : 1;
      const res = await fetch(`${API_BASE}/api/stylist/reviews/${rev.id}/spotlight`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ spotlight: targetSpotlight })
      });
      if (res.ok) {
        showToast(targetSpotlight ? 'Review pinned to product spotlight!' : 'Review unpinned.', 'success');
        fetchData();
      }
    } catch (_) {
      showToast('Error toggling review spotlight', 'error');
    }
  };

  // 9. Matrix products selector
  const toggleMatrixProduct = (p) => {
    if (matrixProducts.some(x => x.id === p.id)) {
      setMatrixProducts(matrixProducts.filter(x => x.id !== p.id));
    } else {
      if (matrixProducts.length >= 4) {
        showToast('You can compare maximum of 4 products in matrix', 'error');
        return;
      }
      setMatrixProducts([...matrixProducts, p]);
    }
  };

  // 10. Brand Voice Analyzer
  const checkBrandVoice = () => {
    if (!brandVoiceText.trim()) return;
    const issues = [];
    const lower = brandVoiceText.toLowerCase();

    // Check banned words
    toneGuidelines.banned.forEach(word => {
      if (lower.includes(word.toLowerCase())) {
        issues.push(`Banned word found: "${word}" (sounds un-premium or cheap)`);
      }
    });

    // Check luxury keywords presence
    const foundKeywords = toneGuidelines.keywords.filter(word => lower.includes(word.toLowerCase()));
    const missingCount = toneGuidelines.keywords.length - foundKeywords.length;

    let score = 100 - (issues.length * 20) - (missingCount * 8);
    score = Math.max(0, Math.min(100, score));

    setToneScore(score);
    setToneIssues(issues);
  };

  // 11. Get product image helper
  const getProductImgUrl = (product) => {
    if (!product) return '';
    let img = product.image_urls;
    if (Array.isArray(img)) img = img[0];
    else if (typeof img === 'string' && img.startsWith('[')) {
      try { img = JSON.parse(img)[0]; } catch (_) {}
    }
    return img || '';
  };

  return (
    <>
      <Head>
        <title>Brand Stylist & Curation Hub — Lekya Specs</title>
      </Head>

      <style>{`
        .stylist-container { background: #070707; min-height: 100vh; font-family: 'Inter', sans-serif; color: #fff; }
        .glass-header { background: rgba(10,10,10,0.85); backdrop-filter: blur(20px); border-bottom: 1px solid rgba(197,160,40,0.15); padding: 20px 40px; }
        .gold-border { border: 1px solid rgba(197,160,40,0.2); }
        .gold-card { background: rgba(255,255,255,0.02); backdrop-filter: blur(10px); border: 1px solid rgba(197,160,40,0.12); border-radius: 16px; padding: 24px; }
        .nav-tab { display: flex; align-items: center; gap: 10px; padding: 14px 20px; border-radius: 12px; font-size: 13px; font-weight: 600; color: rgba(255,255,255,0.6); border: 1px solid transparent; background: none; cursor: pointer; text-align: left; width: 100%; transition: all 0.25s; }
        .nav-tab:hover { background: rgba(255,255,255,0.03); color: #fff; }
        .nav-tab.active { background: rgba(197,160,40,0.12); border-color: rgba(197,160,40,0.3); color: #C5A028; }
        
        .stylist-btn { background: linear-gradient(135deg, #C5A028, #e8c547); color: #000; font-weight: 700; font-size: 11px; text-transform: uppercase; letter-spacing: 0.08em; padding: 12px 20px; border-radius: 8px; border: none; cursor: pointer; display: flex; align-items: center; gap: 6px; transition: all 0.25s; }
        .stylist-btn:hover { transform: translateY(-1px); box-shadow: 0 4px 15px rgba(197,160,40,0.3); }
        
        .stylist-input { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.12); border-radius: 8px; padding: 10px 14px; color: #fff; font-size: 13px; outline: none; }
        .stylist-input:focus { border-color: #C5A028; }
        
        .badge-tag { background: rgba(197,160,40,0.15); border: 1px solid rgba(197,160,40,0.3); color: #C5A028; font-size: 11px; padding: 4px 10px; border-radius: 100px; display: inline-flex; align-items: center; gap: 6px; font-weight: 600; }
        .badge-tag button { background: none; border: none; color: #ff6b6b; cursor: pointer; padding: 0; font-weight: bold; }
        
        .scrollbar-custom::-webkit-scrollbar { width: 6px; height: 6px; }
        .scrollbar-custom::-webkit-scrollbar-track { background: rgba(255,255,255,0.02); }
        .scrollbar-custom::-webkit-scrollbar-thumb { background: rgba(197,160,40,0.25); border-radius: 3px; }
      `}</style>

      <div className="stylist-container">
        {/* Header */}
        <div className="glass-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <Sparkles style={{ color: '#C5A028', width: 24, height: 24 }} />
              <h1 style={{ fontSize: 24, fontWeight: 800, letterSpacing: '0.02em', margin: 0, fontFamily: 'Outfit, sans-serif' }}>LEKYA BRAND STYLIST HUB</h1>
            </div>
            <p style={{ margin: '4px 0 0', fontSize: 12, color: 'rgba(255,255,255,0.4)', fontWeight: 500 }}>
              Creative Direction • Visual Curation • Brand Expression & Styling Workspace
            </p>
          </div>

          <div style={{ display: 'flex', gap: 12 }}>
            <Link href="/admin" style={{ textDecoration: 'none' }}>
              <button style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.8)', fontSize: 11, fontWeight: 700, padding: '10px 18px', borderRadius: 8, cursor: 'pointer', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                Admin Operations
              </button>
            </Link>
            <Link href="/shop" style={{ textDecoration: 'none' }}>
              <button style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.8)', fontSize: 11, fontWeight: 700, padding: '10px 18px', borderRadius: 8, cursor: 'pointer', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                View Shop
              </button>
            </Link>
          </div>
        </div>

        {/* Demo Banner */}
        <div style={{ background: 'linear-gradient(90deg, #140f0a, #C5A028, #140f0a)', color: '#000', textAlign: 'center', padding: '6px 20px', fontSize: 11, fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
          ✨ Brand Merchandising Sandbox Mode Active — All edits sync to database instantly ✨
        </div>

        {/* Layout Grid */}
        <div style={{ maxWidth: 1400, margin: '0 auto', padding: '30px 20px', display: 'grid', gridTemplateColumns: '280px 1fr', gap: 26 }}>

          {/* Sidebar Nav */}
          <div className="gold-card" style={{ display: 'flex', flexDirection: 'column', gap: 6, height: 'fit-content' }}>
            <div style={{ fontSize: 10, fontWeight: 800, color: 'rgba(197,160,40,0.7)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 10, paddingLeft: 10 }}>Curation Modules</div>

            {[
              { id: 'lookbook', label: '1. Lookbook Builder', icon: <BookOpen style={{ width: 16, height: 16 }} /> },
              { id: 'advisor', label: '2. Face Shape Advisor', icon: <Sliders style={{ width: 16, height: 16 }} /> },
              { id: 'spotlight', label: '3. Frame Spotlight', icon: <Star style={{ width: 16, height: 16 }} /> },
              { id: 'tags', label: '4. Style Tag Editor', icon: <Tag style={{ width: 16, height: 16 }} /> },
              { id: 'color', label: '5. Color Story Board', icon: <Layers style={{ width: 16, height: 16 }} /> },
              { id: 'photos', label: '6. Product Photo Hub', icon: <Image style={{ width: 16, height: 16 }} /> },
              { id: 'calendar', label: '7. Content Calendar', icon: <Calendar style={{ width: 16, height: 16 }} /> },
              { id: 'reviews', label: '8. Review Spotlight', icon: <Star style={{ width: 16, height: 16 }} /> },
              { id: 'matrix', label: '9. Comparison Matrix', icon: <Columns style={{ width: 16, height: 16 }} /> },
              { id: 'voice', label: '10. Brand Voice Checker', icon: <CheckCircle2 style={{ width: 16, height: 16 }} /> },
              { id: 'preview', label: '11. Sandbox Preview', icon: <Eye style={{ width: 16, height: 16 }} /> },
            ].map(tab => (
              <button
                key={tab.id}
                className={`nav-tab ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>

          {/* Core Panel Content */}
          <div className="gold-card" style={{ minHeight: 600 }}>

            {loading ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', minHeight: 400 }}>
                <div style={{ width: 40, height: 40, border: '3px solid rgba(197,160,40,0.2)', borderTopColor: '#C5A028', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                <p style={{ marginTop: 12, color: 'rgba(255,255,255,0.4)', fontSize: 12, fontWeight: 700 }}>Reading Brand Database...</p>
              </div>
            ) : (
              <>
                {/* 1. LOOKBOOK BUILDER */}
                {activeTab === 'lookbook' && (
                  <div>
                    <h2 style={{ fontFamily: 'Outfit', fontSize: 20, color: '#C5A028', margin: '0 0 8px 0' }}>1. Lookbook Curation Builder</h2>
                    <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, margin: '0 0 20px 0' }}>
                      Design editorial themes/lookbooks pairing visual assets with selected glasses models.
                    </p>

                    <div style={{ display: 'grid', gridTemplateColumns: '350px 1fr', gap: 24 }}>
                      {/* Left: Add/Edit Lookbook */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 14, paddingRight: 20, borderRight: '1px solid rgba(255,255,255,0.06)' }}>
                        <h4 style={{ margin: 0, fontSize: 13, textTransform: 'uppercase', color: 'rgba(197,160,40,0.8)' }}>
                          {lookbookEditIndex >= 0 ? 'Edit Collection' : 'Create Collection'}
                        </h4>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                          <label style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>Collection Title</label>
                          <input
                            type="text" className="stylist-input" placeholder="e.g. Vintage Summer"
                            value={newLookbook.title} onChange={e => setNewLookbook({ ...newLookbook, title: e.target.value })}
                          />
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                          <label style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>Description</label>
                          <textarea
                            className="stylist-input" rows="3" placeholder="Description of look/aesthetic..."
                            value={newLookbook.description} onChange={e => setNewLookbook({ ...newLookbook, description: e.target.value })}
                            style={{ resize: 'none', fontFamily: 'inherit' }}
                          />
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                          <label style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>Cover Photo URL</label>
                          <input
                            type="text" className="stylist-input" placeholder="https://images.unsplash.com/..."
                            value={newLookbook.coverUrl} onChange={e => setNewLookbook({ ...newLookbook, coverUrl: e.target.value })}
                          />
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                          <label style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>Paired Products (Select all that apply)</label>
                          <div style={{ maxHeight: 150, overflowY: 'auto', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, padding: 8 }} className="scrollbar-custom">
                            {products.map(p => {
                              const checked = newLookbook.productIds.includes(p.id);
                              return (
                                <label key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11, padding: '4px 0', cursor: 'pointer' }}>
                                  <input
                                    type="checkbox" checked={checked}
                                    onChange={() => {
                                      const ids = checked 
                                        ? newLookbook.productIds.filter(x => x !== p.id)
                                        : [...newLookbook.productIds, p.id];
                                      setNewLookbook({ ...newLookbook, productIds: ids });
                                    }}
                                  />
                                  <span>{p.name}</span>
                                </label>
                              );
                            })}
                          </div>
                        </div>

                        <button className="stylist-btn" onClick={handleSaveLookbook}>
                          <Save style={{ width: 14, height: 14 }} /> Save Collection
                        </button>
                      </div>

                      {/* Right: Curated Collections List */}
                      <div>
                        <h4 style={{ margin: '0 0 14px 0', fontSize: 13, textTransform: 'uppercase', color: 'rgba(197,160,40,0.8)' }}>
                          Curated Live Collections ({lookbooks.length})
                        </h4>

                        {lookbooks.length === 0 ? (
                          <div style={{ textAlign: 'center', padding: '40px 0', color: 'rgba(255,255,255,0.3)', fontSize: 12 }}>
                            No lookbook collections curated yet. Use form on left to add.
                          </div>
                        ) : (
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
                            {lookbooks.map((lb, idx) => (
                              <div key={idx} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, overflow: 'hidden' }}>
                                <img
                                  src={lb.coverUrl || 'https://images.unsplash.com/photo-1473496169904-658ba7c44d8a'}
                                  alt={lb.title} style={{ width: '100%', height: 130, objectFit: 'cover' }}
                                />
                                <div style={{ padding: 14 }}>
                                  <h5 style={{ margin: '0 0 4px 0', fontSize: 14, color: '#C5A028' }}>{lb.title}</h5>
                                  <p style={{ margin: '0 0 10px 0', fontSize: 11, color: 'rgba(255,255,255,0.5)', lineHeight: 1.4 }}>{lb.description}</p>
                                  <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', marginBottom: 12 }}>
                                    Paired items: {lb.productIds ? lb.productIds.length : 0} models
                                  </div>
                                  <div style={{ display: 'flex', gap: 10 }}>
                                    <button onClick={() => handleEditLookbook(idx)} style={{ background: 'none', border: 'none', color: '#C5A028', fontSize: 11, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
                                      <Edit style={{ width: 12, height: 12 }} /> Edit
                                    </button>
                                    <button onClick={() => handleDeleteLookbook(idx)} style={{ background: 'none', border: 'none', color: '#ff6b6b', fontSize: 11, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
                                      <Trash2 style={{ width: 12, height: 12 }} /> Delete
                                    </button>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* 2. FACE SHAPE ADVISOR */}
                {activeTab === 'advisor' && (
                  <div>
                    <h2 style={{ fontFamily: 'Outfit', fontSize: 20, color: '#C5A028', margin: '0 0 8px 0' }}>2. Face Shape Recommendation Advisor</h2>
                    <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, margin: '0 0 20px 0' }}>
                      Configure which frames shapes are recommended for users when face scan matches specific categories.
                    </p>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 14, marginBottom: 30 }}>
                      {advisorMap.map(adv => {
                        const shapes = typeof adv.recommended_frame_shapes === 'string' 
                          ? JSON.parse(adv.recommended_frame_shapes) 
                          : adv.recommended_frame_shapes;
                        return (
                          <button
                            key={adv.face_shape}
                            onClick={() => setAdvisorEdit({ face_shape: adv.face_shape, recommended_frame_shapes: shapes })}
                            className={`gold-card ${advisorEdit.face_shape === adv.face_shape ? 'active' : ''}`}
                            style={{ 
                              cursor: 'pointer', textTransform: 'capitalize', textAlign: 'center',
                              borderColor: advisorEdit.face_shape === adv.face_shape ? '#C5A028' : 'rgba(197,160,40,0.12)',
                              background: advisorEdit.face_shape === adv.face_shape ? 'rgba(197,160,40,0.06)' : 'rgba(255,255,255,0.01)'
                            }}
                          >
                            <h4 style={{ margin: '0 0 8px 0', fontSize: 14, color: '#C5A028' }}>{adv.face_shape}</h4>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, justifyContent: 'center' }}>
                              {shapes.map(s => (
                                <span key={s} style={{ fontSize: 9, background: 'rgba(255,255,255,0.06)', padding: '2px 6px', borderRadius: 4 }}>{s}</span>
                              ))}
                            </div>
                          </button>
                        );
                      })}
                    </div>

                    {advisorEdit.face_shape ? (
                      <div style={{ padding: 20, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(197,160,40,0.15)', borderRadius: 12 }}>
                        <h4 style={{ margin: '0 0 14px 0', textTransform: 'capitalize', color: '#C5A028' }}>
                          Edit Recommendation Rules: {advisorEdit.face_shape} Shape
                        </h4>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14, marginBottom: 20 }}>
                          {['Rectangle', 'Square', 'Wayfarer', 'Round', 'Oval', 'Aviator', 'Cat-Eye', 'Hexagonal'].map(shape => {
                            const isRecommended = advisorEdit.recommended_frame_shapes.includes(shape);
                            return (
                              <label key={shape} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, cursor: 'pointer' }}>
                                <input
                                  type="checkbox" checked={isRecommended}
                                  onChange={() => {
                                    const updated = isRecommended
                                      ? advisorEdit.recommended_frame_shapes.filter(x => x !== shape)
                                      : [...advisorEdit.recommended_frame_shapes, shape];
                                    setAdvisorEdit({ ...advisorEdit, recommended_frame_shapes: updated });
                                  }}
                                />
                                <span>{shape}</span>
                              </label>
                            );
                          })}
                        </div>
                        <button className="stylist-btn" onClick={handleSaveAdvisor}>
                          <Save style={{ width: 14, height: 14 }} /> Save Recommendation Rules
                        </button>
                      </div>
                    ) : (
                      <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.4)', padding: 30, fontSize: 12 }}>
                        Select a face shape card above to modify frame recommendations.
                      </div>
                    )}
                  </div>
                )}

                {/* 3. FRAME SPOTLIGHT */}
                {activeTab === 'spotlight' && (
                  <div>
                    <h2 style={{ fontFamily: 'Outfit', fontSize: 20, color: '#C5A028', margin: '0 0 8px 0' }}>3. Frame Spotlight Manager</h2>
                    <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, margin: '0 0 20px 0' }}>
                      Pin top design frames to the homepage's featured catalog strip.
                    </p>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
                      {products.map(p => {
                        const isFeatured = spotlightIds.includes(p.id);
                        return (
                          <div
                            key={p.id}
                            style={{ 
                              background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: 14,
                              borderColor: isFeatured ? '#C5A028' : 'rgba(255,255,255,0.06)'
                            }}
                          >
                            <img src={getProductImgUrl(p)} alt={p.name} style={{ width: '100%', height: 100, objectFit: 'contain', background: 'rgba(255,255,255,0.03)', borderRadius: 8, padding: 6, display: 'block', marginBottom: 10 }} />
                            <h4 style={{ margin: '0 0 4px 0', fontSize: 12, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name}</h4>
                            <p style={{ margin: '0 0 12px 0', fontSize: 9, textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', letterSpacing: '0.05em' }}>{p.frame_shape} • {p.category}</p>
                            <button
                              onClick={() => toggleSpotlight(p.id)}
                              style={{ 
                                width: '100%', border: 'none', borderRadius: 6, padding: '8px 0', fontSize: 10, fontWeight: 700, cursor: 'pointer',
                                background: isFeatured ? '#C5A028' : 'rgba(255,255,255,0.05)',
                                color: isFeatured ? '#000' : '#fff',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4
                              }}
                            >
                              <Star style={{ width: 11, height: 11 }} />
                              {isFeatured ? 'Spotlight Active' : 'Pin to Spotlight'}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* 4. STYLE TAG EDITOR */}
                {activeTab === 'tags' && (
                  <div>
                    <h2 style={{ fontFamily: 'Outfit', fontSize: 20, color: '#C5A028', margin: '0 0 8px 0' }}>4. Style Tag Manager</h2>
                    <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, margin: '0 0 20px 0' }}>
                      Add aesthetic style tags (like "Vintage", "Minimalist", "Trendy", "Luxury") to catalog models.
                    </p>

                    <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: 24 }}>
                      {/* Products select */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 450, overflowY: 'auto', borderRight: '1px solid rgba(255,255,255,0.06)', paddingRight: 16 }} className="scrollbar-custom">
                        {products.map(p => (
                          <button
                            key={p.id} onClick={() => handleSelectProduct(p)}
                            style={{ 
                              display: 'flex', alignItems: 'center', gap: 10, padding: 10, borderRadius: 8, background: 'none', border: '1px solid rgba(255,255,255,0.05)', cursor: 'pointer', textAlign: 'left',
                              borderColor: selectedProduct && selectedProduct.id === p.id ? '#C5A028' : 'rgba(255,255,255,0.05)',
                              background: selectedProduct && selectedProduct.id === p.id ? 'rgba(197,160,40,0.06)' : 'none'
                            }}
                          >
                            <img src={getProductImgUrl(p)} alt="" style={{ width: 34, height: 26, objectFit: 'contain', background: '#222', borderRadius: 4, padding: 2 }} />
                            <div style={{ minWidth: 0, flex: 1 }}>
                              <div style={{ fontSize: 11, fontWeight: 700, color: selectedProduct && selectedProduct.id === p.id ? '#C5A028' : '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</div>
                              <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)' }}>{p.frame_shape}</div>
                            </div>
                          </button>
                        ))}
                      </div>

                      {/* Tag edit area */}
                      {selectedProduct ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                          <div>
                            <h3 style={{ margin: '0 0 4px 0', fontSize: 16, color: '#C5A028' }}>{selectedProduct.name}</h3>
                            <p style={{ margin: 0, fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>Category: {selectedProduct.category} | Frame: {selectedProduct.frame_shape}</p>
                          </div>

                          <div style={{ background: 'rgba(255,255,255,0.02)', padding: 16, borderRadius: 10, border: '1px solid rgba(255,255,255,0.06)' }}>
                            <label style={{ display: 'block', fontSize: 11, color: 'rgba(255,255,255,0.4)', marginBottom: 8 }}>Add New Style Keyword</label>
                            <div style={{ display: 'flex', gap: 10 }}>
                              <input
                                type="text" className="stylist-input" placeholder="e.g. Retro-chic"
                                value={newTagInput} onChange={e => setNewTagInput(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && addTag()}
                                style={{ flex: 1 }}
                              />
                              <button className="stylist-btn" onClick={addTag}>
                                <Plus style={{ width: 14, height: 14 }} /> Add
                              </button>
                            </div>
                          </div>

                          <div>
                            <h4 style={{ margin: '0 0 10px 0', fontSize: 12, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase' }}>Active Style Tags</h4>
                            {productTags.length === 0 ? (
                              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)' }}>No tags added yet.</div>
                            ) : (
                              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                                {productTags.map(tag => (
                                  <span key={tag} className="badge-tag">
                                    {tag}
                                    <button onClick={() => removeTag(tag)}>×</button>
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>

                          <button className="stylist-btn" onClick={saveProductTags} style={{ width: 'fit-content', marginTop: 10 }}>
                            <Save style={{ width: 14, height: 14 }} /> Save Style Tags
                          </button>
                        </div>
                      ) : (
                        <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.4)', padding: 40, fontSize: 12 }}>
                          Select a product from the list on the left to edit tags.
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* 5. COLOR STORY BOARD */}
                {activeTab === 'color' && (
                  <div>
                    <h2 style={{ fontFamily: 'Outfit', fontSize: 20, color: '#C5A028', margin: '0 0 8px 0' }}>5. Color Story Board</h2>
                    <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, margin: '0 0 20px 0' }}>
                      Cluster catalog frames into seasonal aesthetic color stories (e.g. "Monsoon Green", "Autumn Gold").
                    </p>

                    <div style={{ display: 'grid', gridTemplateColumns: '350px 1fr', gap: 24 }}>
                      {/* Left: Add story */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 14, borderRight: '1px solid rgba(255,255,255,0.06)', paddingRight: 20 }}>
                        <h4 style={{ margin: 0, fontSize: 12, color: '#C5A028', textTransform: 'uppercase' }}>Create Color Story</h4>
                        
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                          <label style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>Color Story Name</label>
                          <input
                            type="text" className="stylist-input" placeholder="e.g. Electric Neon"
                            value={newColorStory.name} onChange={e => setNewColorStory({ ...newColorStory, name: e.target.value })}
                          />
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                          <label style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>Hex Color Indicator</label>
                          <div style={{ display: 'flex', gap: 8 }}>
                            <input
                              type="text" className="stylist-input" placeholder="#00ffcc"
                              value={newColorStory.hex} onChange={e => setNewColorStory({ ...newColorStory, hex: e.target.value })}
                              style={{ flex: 1 }}
                            />
                            <div style={{ width: 38, height: 38, borderRadius: 8, border: '1px solid rgba(255,255,255,0.2)', background: newColorStory.hex || '#333' }} />
                          </div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                          <label style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>Select Products</label>
                          <div style={{ maxHeight: 150, overflowY: 'auto', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, padding: 8 }} className="scrollbar-custom">
                            {products.map(p => {
                              const checked = newColorStory.productIds.includes(p.id);
                              return (
                                <label key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11, padding: '4px 0', cursor: 'pointer' }}>
                                  <input
                                    type="checkbox" checked={checked}
                                    onChange={() => {
                                      const ids = checked
                                        ? newColorStory.productIds.filter(x => x !== p.id)
                                        : [...newColorStory.productIds, p.id];
                                      setNewColorStory({ ...newColorStory, productIds: ids });
                                    }}
                                  />
                                  <span>{p.name}</span>
                                </label>
                              );
                            })}
                          </div>
                        </div>

                        <button className="stylist-btn" onClick={handleAddColorStory}>
                          <Plus style={{ width: 14, height: 14 }} /> Create Color Story
                        </button>
                      </div>

                      {/* Right: Color stories list */}
                      <div>
                        <h4 style={{ margin: '0 0 14px 0', fontSize: 12, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase' }}>Seasonal Stories</h4>
                        {colorStories.length === 0 ? (
                          <div style={{ textAlign: 'center', padding: '40px 0', color: 'rgba(255,255,255,0.3)', fontSize: 12 }}>
                            No color stories grouped yet.
                          </div>
                        ) : (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                            {colorStories.map((cs, idx) => (
                              <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 14, background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.05)', padding: 14, borderRadius: 10 }}>
                                <div style={{ width: 24, height: 24, borderRadius: '50%', background: cs.hex, flexShrink: 0, boxShadow: `0 2px 10px ${cs.hex}50` }} />
                                <div style={{ flex: 1 }}>
                                  <h4 style={{ margin: 0, fontSize: 13, color: '#C5A028' }}>{cs.name}</h4>
                                  <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)' }}>{cs.productIds.length} frames grouped</span>
                                </div>
                                <button onClick={() => handleDeleteColorStory(idx)} style={{ background: 'none', border: 'none', color: '#ff6b6b', cursor: 'pointer' }}>
                                  <Trash2 style={{ width: 14, height: 14 }} />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* 6. PRODUCT PHOTO HUB */}
                {activeTab === 'photos' && (
                  <div>
                    <h2 style={{ fontFamily: 'Outfit', fontSize: 20, color: '#C5A028', margin: '0 0 8px 0' }}>6. Product Photo Manager</h2>
                    <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, margin: '0 0 20px 0' }}>
                      Preview, audit, and examine the active visual URL links of all catalog products in detail.
                    </p>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
                      {products.map(p => {
                        const urls = Array.isArray(p.image_urls) ? p.image_urls : [p.image_urls];
                        return (
                          <div key={p.id} style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: 14 }}>
                            <div style={{ display: 'flex', gap: 6, marginBottom: 8, overflowX: 'auto', paddingBottom: 4 }} className="scrollbar-custom">
                              {urls.map((url, i) => (
                                <img
                                  key={i} src={url} alt=""
                                  style={{ width: 60, height: 44, objectFit: 'contain', background: '#111', borderRadius: 4, padding: 2, border: '1px solid rgba(255,255,255,0.08)' }}
                                />
                              ))}
                            </div>
                            <h4 style={{ margin: '0 0 4px 0', fontSize: 12, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</h4>
                            <div style={{ fontSize: 9, color: 'rgba(197,160,40,0.85)', wordBreak: 'break-all', fontFamily: 'monospace', maxHeight: 38, overflow: 'hidden' }}>
                              {urls[0] || 'No Image Url'}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* 7. CONTENT CALENDAR */}
                {activeTab === 'calendar' && (
                  <div>
                    <h2 style={{ fontFamily: 'Outfit', fontSize: 20, color: '#C5A028', margin: '0 0 8px 0' }}>7. Promo & Content Calendar</h2>
                    <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, margin: '0 0 20px 0' }}>
                      Schedule and catalog upcoming design launches, visual theme updates, and social campaign schedules.
                    </p>

                    <div style={{ display: 'grid', gridTemplateColumns: '350px 1fr', gap: 24 }}>
                      {/* Left form */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 14, borderRight: '1px solid rgba(255,255,255,0.06)', paddingRight: 20 }}>
                        <h4 style={{ margin: 0, fontSize: 12, color: '#C5A028', textTransform: 'uppercase' }}>Add Campaign/Theme launch</h4>
                        
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                          <label style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>Campaign/Event Name</label>
                          <input
                            type="text" className="stylist-input" placeholder="e.g. Aviator Revival Launch"
                            value={newEvent.title} onChange={e => setNewEvent({ ...newEvent, title: e.target.value })}
                          />
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                          <label style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>Launch Date</label>
                          <input
                            type="date" className="stylist-input"
                            value={newEvent.date} onChange={e => setNewEvent({ ...newEvent, date: e.target.value })}
                            style={{ colorScheme: 'dark' }}
                          />
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                          <label style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>Primary Channel</label>
                          <select
                            className="stylist-input" value={newEvent.platform}
                            onChange={e => setNewEvent({ ...newEvent, platform: e.target.value })}
                          >
                            <option value="Instagram">Instagram (Visuals)</option>
                            <option value="Website">Website Home CMS</option>
                            <option value="Storefront">Digital Lookbook</option>
                            <option value="Newsletter">VIP Email Blast</option>
                          </select>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                          <label style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>Campaign Description/Notes</label>
                          <textarea
                            className="stylist-input" rows="3" placeholder="Focus tags, products to highlight..."
                            value={newEvent.notes} onChange={e => setNewEvent({ ...newEvent, notes: e.target.value })}
                            style={{ resize: 'none', fontFamily: 'inherit' }}
                          />
                        </div>

                        <button className="stylist-btn" onClick={handleAddEvent}>
                          <Plus style={{ width: 14, height: 14 }} /> Schedule launch
                        </button>
                      </div>

                      {/* Right timeline */}
                      <div>
                        <h4 style={{ margin: '0 0 14px 0', fontSize: 12, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase' }}>Launch Schedule Calendar</h4>
                        {calendarEvents.length === 0 ? (
                          <div style={{ textAlign: 'center', padding: '40px 0', color: 'rgba(255,255,255,0.3)', fontSize: 12 }}>
                            No visual content scheduled.
                          </div>
                        ) : (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, borderLeft: '2px solid rgba(197,160,40,0.2)', paddingLeft: 16 }}>
                            {calendarEvents.map((ev, idx) => (
                              <div key={idx} style={{ position: 'relative', background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.05)', padding: 14, borderRadius: 10 }}>
                                <div style={{ position: 'absolute', left: -24, top: 16, width: 14, height: 14, borderRadius: '50%', background: '#C5A028', border: '3px solid #070707' }} />
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                  <div>
                                    <span style={{ fontSize: 10, color: '#C5A028', fontWeight: 700, textTransform: 'uppercase' }}>{new Date(ev.date).toLocaleDateString('en-IN', { dateStyle: 'medium' })}</span>
                                    <h4 style={{ margin: '2px 0 4px 0', fontSize: 14 }}>{ev.title}</h4>
                                    <p style={{ margin: '0 0 6px 0', fontSize: 11, color: 'rgba(255,255,255,0.4)', fontStyle: 'italic' }}>Platform: {ev.platform}</p>
                                    <p style={{ margin: 0, fontSize: 11, color: 'rgba(255,255,255,0.55)', lineHeight: 1.4 }}>{ev.notes}</p>
                                  </div>
                                  <button onClick={() => handleDeleteEvent(idx)} style={{ background: 'none', border: 'none', color: '#ff6b6b', cursor: 'pointer' }}>
                                    <X style={{ width: 14, height: 14 }} />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* 8. REVIEW SPOTLIGHT */}
                {activeTab === 'reviews' && (
                  <div>
                    <h2 style={{ fontFamily: 'Outfit', fontSize: 20, color: '#C5A028', margin: '0 0 8px 0' }}>8. Review & Testimonial Spotlight</h2>
                    <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, margin: '0 0 20px 0' }}>
                      Spotlight exceptional buyer testimonials. Featured reviews will be showcased at the top of detail pages.
                    </p>

                    {reviews.length === 0 ? (
                      <div style={{ textAlign: 'center', padding: '40px 0', color: 'rgba(255,255,255,0.3)', fontSize: 12 }}>
                        No product reviews found on site.
                      </div>
                    ) : (
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14 }}>
                        {reviews.map(r => (
                          <div
                            key={r.id}
                            style={{ 
                              background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 12, padding: 16,
                              borderColor: r.spotlight ? '#C5A028' : 'rgba(255,255,255,0.05)'
                            }}
                          >
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                              <div>
                                <h4 style={{ margin: 0, fontSize: 13, color: '#C5A028' }}>{r.user_name || 'Anonymous User'}</h4>
                                <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)' }}>reviewed: {r.product_name}</span>
                              </div>
                              <div style={{ display: 'flex', gap: 2 }}>
                                {[...Array(5)].map((_, i) => (
                                  <Star key={i} style={{ width: 11, height: 11, fill: i < r.rating ? '#C5A028' : 'none', color: '#C5A028' }} />
                                ))}
                              </div>
                            </div>
                            <p style={{ margin: '0 0 14px 0', fontSize: 12, color: 'rgba(255,255,255,0.65)', fontStyle: 'italic', lineHeight: 1.4 }}>
                              "{r.comment || 'No comment left'}"
                            </p>
                            <button
                              onClick={() => toggleReviewSpotlight(r)}
                              style={{ 
                                background: 'none', border: '1px solid', padding: '6px 12px', borderRadius: 6, fontSize: 10, fontWeight: 700, cursor: 'pointer',
                                color: r.spotlight ? '#000' : '#C5A028',
                                backgroundColor: r.spotlight ? '#C5A028' : 'transparent',
                                borderColor: '#C5A028'
                              }}
                            >
                              {r.spotlight ? 'Spotlight Active' : 'Spotlight Testimonial'}
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* 9. FRAME COMPARISON MATRIX */}
                {activeTab === 'matrix' && (
                  <div>
                    <h2 style={{ fontFamily: 'Outfit', fontSize: 20, color: '#C5A028', margin: '0 0 8px 0' }}>9. Frame Curation Comparison Matrix</h2>
                    <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, margin: '0 0 20px 0' }}>
                      Select up to 4 models to audit their specifications, dimensions, frame sizes, and pricing side-by-side.
                    </p>

                    {/* Products selector strips */}
                    <div style={{ display: 'flex', gap: 10, overflowX: 'auto', marginBottom: 20, paddingBottom: 6 }} className="scrollbar-custom">
                      {products.map(p => {
                        const selected = matrixProducts.some(x => x.id === p.id);
                        return (
                          <button
                            key={p.id} onClick={() => toggleMatrixProduct(p)}
                            style={{ 
                              flexShrink: 0, padding: '8px 12px', border: '1px solid', borderRadius: 8, fontSize: 11, cursor: 'pointer',
                              background: selected ? 'rgba(197,160,40,0.12)' : 'none',
                              color: selected ? '#C5A028' : 'rgba(255,255,255,0.6)',
                              borderColor: selected ? '#C5A028' : 'rgba(255,255,255,0.08)'
                            }}
                          >
                            {p.name}
                          </button>
                        );
                      })}
                    </div>

                    {matrixProducts.length === 0 ? (
                      <div style={{ textAlign: 'center', padding: '40px 0', color: 'rgba(255,255,255,0.3)', fontSize: 12 }}>
                        Please select frames from the top strip to build comparison matrix.
                      </div>
                    ) : (
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12, border: '1px solid rgba(255,255,255,0.08)' }}>
                        <thead>
                          <tr style={{ background: 'rgba(255,255,255,0.02)' }}>
                            <th style={{ padding: 12, textAlign: 'left', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>Specs Curation Matrix</th>
                            {matrixProducts.map(p => (
                              <th key={p.id} style={{ padding: 12, textAlign: 'center', borderBottom: '1px solid rgba(255,255,255,0.08)', color: '#C5A028' }}>{p.name}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {[
                            { label: 'Category', key: 'category' },
                            { label: 'Frame Shape', key: 'frame_shape' },
                            { label: 'Gender Fit', key: 'gender' },
                            { label: 'Price Value', render: (p) => `₹${parseFloat(p.price).toLocaleString('en-IN')}` },
                            { label: 'Stylist Tags', render: (p) => p.style_tags ? (typeof p.style_tags === 'string' ? JSON.parse(p.style_tags).join(', ') : p.style_tags.join(', ')) : 'None' },
                          ].map((row, idx) => (
                            <tr key={idx} style={{ background: idx % 2 === 1 ? 'rgba(255,255,255,0.01)' : 'none' }}>
                              <td style={{ padding: 12, borderBottom: '1px solid rgba(255,255,255,0.06)', fontWeight: 600, color: 'rgba(255,255,255,0.5)' }}>{row.label}</td>
                              {matrixProducts.map(p => (
                                <td key={p.id} style={{ padding: 12, borderBottom: '1px solid rgba(255,255,255,0.06)', textAlign: 'center' }}>
                                  {row.render ? row.render(p) : p[row.key]}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                )}

                {/* 10. BRAND VOICE CHECKER */}
                {activeTab === 'voice' && (
                  <div>
                    <h2 style={{ fontFamily: 'Outfit', fontSize: 20, color: '#C5A028', margin: '0 0 8px 0' }}>10. Brand Voice Tone Analyzer</h2>
                    <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, margin: '0 0 20px 0' }}>
                      Ensure written product copies follow the brand's premium guidelines. Check for banned/un-premium terms instantly.
                    </p>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 24 }}>
                      {/* Left: Input */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                        <label style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase' }}>Analyze copy copytext</label>
                        <textarea
                          className="stylist-input" rows="8" placeholder="Paste product copy, description or advertisement hook here..."
                          value={brandVoiceText} onChange={e => setBrandVoiceText(e.target.value)}
                          style={{ resize: 'none', fontFamily: 'inherit', lineHeight: 1.5 }}
                        />
                        <button className="stylist-btn" onClick={checkBrandVoice} style={{ width: 'fit-content' }}>
                          Analyze Copy Tone
                        </button>
                      </div>

                      {/* Right: Score card */}
                      <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: 18 }}>
                        <h4 style={{ margin: '0 0 12px 0', fontSize: 13, textTransform: 'uppercase', color: '#C5A028' }}>Analysis Results</h4>
                        
                        {toneScore !== null ? (
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                              <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>Luxury Index:</span>
                              <span style={{ fontSize: 28, fontWeight: 800, color: toneScore >= 80 ? '#4ade80' : toneScore >= 50 ? '#f39c12' : '#ff4444', fontFamily: 'monospace' }}>
                                {toneScore}%
                              </span>
                            </div>

                            <div style={{ height: 6, width: '100%', background: 'rgba(255,255,255,0.08)', borderRadius: 10, overflow: 'hidden', marginBottom: 18 }}>
                              <div style={{ height: '100%', background: toneScore >= 80 ? '#4ade80' : toneScore >= 50 ? '#f39c12' : '#ff4444', width: `${toneScore}%` }} />
                            </div>

                            {toneIssues.length > 0 ? (
                              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                <span style={{ fontSize: 11, color: '#ff6b6b', display: 'flex', alignItems: 'center', gap: 4, fontWeight: 700 }}><AlertTriangle style={{ width: 12, height: 12 }} /> Style Guide Warnings:</span>
                                {toneIssues.map((iss, i) => (
                                  <div key={i} style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', paddingLeft: 8, borderLeft: '2px solid #ff6b6b' }}>
                                    {iss}
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#4ade80', fontWeight: 700 }}>
                                <CheckCircle2 style={{ width: 14, height: 14 }} /> Copy aligns perfectly with Lekya Specs brand voice!
                              </div>
                            )}
                          </div>
                        ) : (
                          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', fontStyle: 'italic', padding: '20px 0', textAlign: 'center' }}>
                            Paste content and hit analyze.
                          </div>
                        )}

                        <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', marginTop: 20, paddingTop: 14 }}>
                          <span style={{ display: 'block', fontSize: 10, fontWeight: 700, color: 'rgba(197,160,40,0.7)', textTransform: 'uppercase', marginBottom: 6 }}>Banned terms monitored:</span>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                            {toneGuidelines.banned.map(w => (
                              <span key={w} style={{ fontSize: 9, background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171', padding: '2px 6px', borderRadius: 4 }}>{w}</span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 11. SANDBOX PREVIEW */}
                {activeTab === 'preview' && (
                  <div>
                    <h2 style={{ fontFamily: 'Outfit', fontSize: 20, color: '#C5A028', margin: '0 0 8px 0' }}>11. Live Product Preview Sandbox</h2>
                    <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, margin: '0 0 20px 0' }}>
                      Review how active design models render over front-facing portrait faces instantly.
                    </p>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: 24 }}>
                      {/* Left: preview container */}
                      <div style={{ display: 'flex', justifyContent: 'center' }}>
                        <div style={{ position: 'relative', width: 340, height: 420, borderRadius: 16, overflow: 'hidden', border: '1px solid rgba(197,160,40,0.2)', boxShadow: '0 8px 30px rgba(0,0,0,0.6)' }}>
                          <img src={sandboxFace} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          
                          {/* Overlay glasses */}
                          {sandboxGlasses && (
                            <img
                              src={sandboxGlasses} alt=""
                              style={{
                                position: 'absolute',
                                left: '50%',
                                top: `${38 + sandboxY}%`,
                                width: `${72 * sandboxScale}%`,
                                transform: 'translate(-50%, -50%)',
                                filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.45))',
                                pointerEvents: 'none'
                              }}
                            />
                          )}
                        </div>
                      </div>

                      {/* Right options */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                        {/* Choose Face */}
                        <div>
                          <label style={{ display: 'block', fontSize: 11, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', marginBottom: 8 }}>Choose Model Portrait</label>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }}>
                            {[
                              'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=90&w=300&h=350&crop=faces',
                              'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=90&w=300&h=350&crop=faces',
                              'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&q=90&w=300&h=350&crop=faces'
                            ].map((url, i) => (
                              <button
                                key={i} onClick={() => setSandboxFace(url)}
                                style={{ 
                                  padding: 0, border: '2px solid', borderRadius: 8, overflow: 'hidden', cursor: 'pointer',
                                  borderColor: sandboxFace === url ? '#C5A028' : 'transparent',
                                }}
                              >
                                <img src={url} alt="" style={{ width: '100%', height: 60, objectFit: 'cover' }} />
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Choose Glasses */}
                        <div>
                          <label style={{ display: 'block', fontSize: 11, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', marginBottom: 8 }}>Select Product Frame</label>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8, maxHeight: 150, overflowY: 'auto' }} className="scrollbar-custom">
                            {products.map(p => (
                              <button
                                key={p.id} onClick={() => setSandboxGlasses(getProductImgUrl(p))}
                                style={{ 
                                  padding: 8, border: '1px solid', borderRadius: 6, background: '#111', cursor: 'pointer', fontSize: 10, color: '#fff',
                                  borderColor: sandboxGlasses === getProductImgUrl(p) ? '#C5A028' : 'rgba(255,255,255,0.08)'
                                }}
                              >
                                {p.name}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Sliders */}
                        <div style={{ background: 'rgba(255,255,255,0.02)', padding: 14, borderRadius: 10, border: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', gap: 10 }}>
                          <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'rgba(255,255,255,0.4)', marginBottom: 4 }}>
                              <span>Frame Scale</span>
                              <span style={{ color: '#C5A028', fontFamily: 'monospace' }}>{Math.round(sandboxScale * 100)}%</span>
                            </div>
                            <input type="range" className="range-slider" min="0.6" max="1.5" step="0.05" value={sandboxScale} onChange={e => setSandboxScale(parseFloat(e.target.value))} />
                          </div>

                          <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'rgba(255,255,255,0.4)', marginBottom: 4 }}>
                              <span>Vertical Shift</span>
                              <span style={{ color: '#C5A028', fontFamily: 'monospace' }}>{sandboxY}%</span>
                            </div>
                            <input type="range" className="range-slider" min="-20" max="20" step="1" value={sandboxY} onChange={e => setSandboxY(parseInt(e.target.value))} />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}

          </div>

        </div>
      </div>
    </>
  );
}
