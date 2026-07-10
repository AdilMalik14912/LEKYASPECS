const React = require('react');
const { useState, useEffect, useRef } = React;
const { useRouter } = require('next/router');
const { useAuth } = require('./_app');

const API_BASE = typeof window !== 'undefined'
  ? (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' ? 'http://localhost:5000' : '')
  : '';

const RIDER_COLORS = ['#f59e0b', '#3b82f6', '#10b981', '#8b5cf6', '#ef4444', '#f97316', '#06b6d4', '#84cc16'];

const geocodeAddress = async (address) => {
  const getCoords = async (query) => {
    try {
      await new Promise(r => setTimeout(r, 800));
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1&countrycodes=in`,
        { headers: { 'User-Agent': 'LekyaSpecs/1.0 admin-map' } }
      );
      if (!res.ok) return null;
      const data = await res.json();
      if (data && data.length > 0) {
        return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
      }
    } catch {}
    return null;
  };

  const addrObj = typeof address === 'object' ? address : null;

  // Try 1: Full address
  const fullParts = addrObj
    ? [addrObj.line1, addrObj.city, addrObj.state, addrObj.pincode, 'India'].filter(Boolean)
    : [address, 'India'];
  let coords = await getCoords(fullParts.join(', '));
  if (coords) return coords;

  if (addrObj) {
    // Try 2: Line2 + City + Pincode
    const parts2 = [addrObj.line2, addrObj.city, addrObj.pincode, 'India'].filter(Boolean);
    if (parts2.length > 1) {
      coords = await getCoords(parts2.join(', '));
      if (coords) return coords;
    }

    // Try 3: City + Pincode
    const parts3 = [addrObj.city, addrObj.pincode, 'India'].filter(Boolean);
    if (parts3.length > 1) {
      coords = await getCoords(parts3.join(', '));
      if (coords) return coords;
    }

    // Try 4: Pincode only
    if (addrObj.pincode) {
      coords = await getCoords(`${addrObj.pincode}, India`);
      if (coords) return coords;
    }

    // Try 5: City only
    if (addrObj.city) {
      coords = await getCoords(`${addrObj.city}, India`);
      if (coords) return coords;
    }
  } else {
    // String fallback: slice first token
    const strParts = address.split(',');
    if (strParts.length > 1) {
      coords = await getCoords(strParts.slice(1).join(', ') + ', India');
      if (coords) return coords;
    }
  }
  return null;
};

const timeAgo = (isoStr) => {
  if (!isoStr) return 'Never';
  const diff = (Date.now() - new Date(isoStr + ' UTC').getTime()) / 60000;
  if (diff < 1) return 'Just now';
  if (diff < 60) return `${Math.floor(diff)}m ago`;
  return `${Math.floor(diff/60)}h ago`;
};

export default function AdminMap() {
  const { user, token } = useAuth();
  const router = useRouter();
  const mapRef = useRef(null);
  const leafletMapRef = useRef(null);
  const markersRef = useRef([]);
  const linesRef = useRef([]);
  const initialBoundsSetRef = useRef(false);
  const [leafletReady, setLeafletReady] = useState(false);
  const [mapInitialized, setMapInitialized] = useState(false);
  const [riders, setRiders] = useState([]);
  const [selectedRider, setSelectedRider] = useState(null);
  const [geocacheRef] = useState({});
  const [lastPoll, setLastPoll] = useState(null);
  const [isPolling, setIsPolling] = useState(false);

  useEffect(() => {
    if (!user) { router.push('/account'); return; }
    const isAdmin = user.role === 'admin' || user.email === 'admin@specs.com';
    if (!isAdmin) router.push('/');
  }, [user]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    document.head.appendChild(link);
    if (window.L) { setLeafletReady(true); return; }
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    script.async = true;
    script.onload = () => setLeafletReady(true);
    document.head.appendChild(script);
  }, []);

  const fetchRiders = async () => {
    if (!token) return;
    setIsPolling(true);
    try {
      const res = await fetch(`${API_BASE}/api/admin/riders/live-map`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setRiders(data);
        setLastPoll(new Date());
        // Geocode order addresses that are not yet cached
        for (const rider of data) {
          for (const order of (rider.activeOrders || [])) {
            const key = JSON.stringify(order.shipping_address);
            if (!geocacheRef[key]) {
              geocacheRef[key] = geocodeAddress(order.shipping_address);
            }
          }
        }
      }
    } catch {}
    setIsPolling(false);
  };

  useEffect(() => {
    fetchRiders();
    const interval = setInterval(fetchRiders, 10000);
    return () => clearInterval(interval);
  }, [token]);

  useEffect(() => {
    if (!leafletReady || !mapRef.current || mapInitialized) return;
    const L = window.L;
    const map = L.map(mapRef.current, { center: [20.5937, 78.9629], zoom: 5, zoomControl: false });
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '', subdomains: 'abcd', maxZoom: 19
    }).addTo(map);
    L.control.zoom({ position: 'bottomright' }).addTo(map);
    leafletMapRef.current = map;
    setMapInitialized(true);
  }, [leafletReady]);

  useEffect(() => {
    if (!mapInitialized || !leafletMapRef.current) return;
    const L = window.L;
    const map = leafletMapRef.current;

    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];
    linesRef.current.forEach(l => l.remove());
    linesRef.current = [];

    const allPoints = [];

    riders.forEach((rider, rIdx) => {
      const color = RIDER_COLORS[rIdx % RIDER_COLORS.length];
      const statusDot = rider.onlineStatus === 'online' ? '#10b981' : rider.onlineStatus === 'idle' ? '#f59e0b' : '#6b7280';

      if (rider.rider_lat && rider.rider_lng) {
        const lat = parseFloat(rider.rider_lat);
        const lng = parseFloat(rider.rider_lng);
        allPoints.push([lat, lng]);

        const pulse = rider.onlineStatus === 'online'
          ? `<div style="position:absolute;inset:0;border-radius:50%;background:${color}33;animation:pr 2s infinite;"></div>` : '';

        const icon = L.divIcon({
          className: '',
          html: `<div style="position:relative;width:52px;height:52px;">${pulse}<div style="position:absolute;inset:${rider.onlineStatus==='online'?'6':'0'}px;border-radius:50%;background:${color}22;border:2.5px solid ${color};display:flex;align-items:center;justify-content:center;font-size:20px;box-shadow:0 0 20px ${color}66;">🚚</div><div style="position:absolute;bottom:-2px;right:-2px;width:12px;height:12px;border-radius:50%;background:${statusDot};border:2px solid #111;"></div></div>`,
          iconSize: [52, 52], iconAnchor: [26, 26],
        });

        const activeCount = (rider.activeOrders || []).length;
        const m = L.marker([lat, lng], { icon }).addTo(map)
          .bindPopup(`<div style="background:#111;color:white;padding:12px 16px;border-radius:12px;border:1px solid ${color};min-width:200px;font-family:sans-serif;"><b style="color:${color};font-size:13px;">🚚 ${rider.name}</b><div style="font-size:10px;color:#888;margin-top:4px;">${rider.email}</div><div style="margin-top:8px;display:flex;gap:8px;"><div style="background:${color}22;border:1px solid ${color}55;border-radius:8px;padding:5px 10px;text-align:center;"><b style="color:${color};font-size:14px;">${activeCount}</b><div style="color:#888;font-size:9px;text-transform:uppercase;">Active</div></div><div style="background:${statusDot}22;border:1px solid ${statusDot}55;border-radius:8px;padding:5px 10px;text-align:center;flex:1;"><b style="color:${statusDot};font-size:11px;">${rider.onlineStatus.toUpperCase()}</b><div style="color:#888;font-size:9px;">${timeAgo(rider.rider_last_seen)}</div></div></div></div>`)
          .on('click', () => setSelectedRider(rider));
        markersRef.current.push(m);

        // Draw lines to order addresses
        (rider.activeOrders || []).forEach(async (order) => {
          const key = JSON.stringify(order.shipping_address);
          const coords = await geocacheRef[key];
          if (!coords) return;
          allPoints.push([coords.lat, coords.lng]);

          const orderIcon = L.divIcon({
            className: '',
            html: `<div style="width:28px;height:28px;border-radius:50%;background:${color}22;border:2px solid ${color};display:flex;align-items:center;justify-content:center;font-size:11px;color:${color};">📦</div>`,
            iconSize: [28, 28], iconAnchor: [14, 14],
          });
          const om = L.marker([coords.lat, coords.lng], { icon: orderIcon }).addTo(map)
            .bindPopup(`<div style="background:#111;color:white;padding:10px 14px;border-radius:10px;border:1px solid ${color};font-family:sans-serif;"><b style="color:${color}">Order #${order.id}</b>${order.is_urgent ? '<span style="background:#ef4444;color:white;font-size:9px;padding:1px 5px;border-radius:3px;margin-left:5px;">⚡ URGENT</span>' : ''}<div style="font-size:10px;color:#ccc;margin-top:5px;">${order.customer_name || 'Guest'}</div><span style="background:${color}22;color:${color};font-size:9px;padding:2px 6px;border-radius:4px;font-weight:700;margin-top:5px;display:inline-block;">${order.status}</span></div>`);
          markersRef.current.push(om);

          const line = L.polyline([[lat, lng], [coords.lat, coords.lng]], {
            color, weight: 2, opacity: 0.5, dashArray: '6, 6'
          }).addTo(map);
          linesRef.current.push(line);
        });
      }
    });

    if (allPoints.length > 0 && !initialBoundsSetRef.current) {
      try {
        map.fitBounds(allPoints, { padding: [60, 60] });
        initialBoundsSetRef.current = true;
      } catch {}
    }
  }, [riders, mapInitialized]);

  const onlineCount = riders.filter(r => r.onlineStatus === 'online').length;
  const idleCount = riders.filter(r => r.onlineStatus === 'idle').length;
  const offlineCount = riders.filter(r => r.onlineStatus === 'offline').length;

  return (
    <div style={{ width: '100vw', height: '100vh', background: '#0a0a0a', overflow: 'hidden', position: 'relative', fontFamily: 'system-ui,sans-serif' }}>
      <div ref={mapRef} style={{ width: '100%', height: '100%' }} />

      {/* Top Bar */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 1000, background: 'linear-gradient(to bottom, rgba(10,10,10,0.97), transparent)', padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <a href="/admin" style={{ color: '#f59e0b', textDecoration: 'none', fontSize: 12, fontWeight: 700, background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.3)', padding: '6px 12px', borderRadius: 8 }}>← Admin</a>
          <div>
            <div style={{ color: 'white', fontWeight: 900, fontSize: 15, letterSpacing: '0.08em' }}>🛰 Live Rider Tracker</div>
            <div style={{ color: '#6b7280', fontSize: 10, letterSpacing: '0.15em', textTransform: 'uppercase' }}>Real-Time GPS Map · Admin</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', padding: '5px 10px', borderRadius: 20 }}>
            <div style={{ width: 7, height: 7, borderRadius: '50%', background: isPolling ? '#f59e0b' : '#10b981', boxShadow: `0 0 8px ${isPolling ? '#f59e0b' : '#10b981'}` }} />
            <span style={{ color: '#10b981', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>{isPolling ? 'Updating...' : 'Live'}</span>
          </div>
          {lastPoll && <span style={{ color: '#6b7280', fontSize: 10 }}>Updated {timeAgo(lastPoll.toISOString().replace('T',' ').slice(0,19))}</span>}
        </div>
      </div>

      {/* Left Sidebar - Riders List */}
      <div style={{ position: 'absolute', top: 70, left: 16, bottom: 16, zIndex: 1000, width: 260, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 8 }}>
        {/* Stats Row */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 4 }}>
          {[{ label: 'Online', count: onlineCount, color: '#10b981' }, { label: 'Idle', count: idleCount, color: '#f59e0b' }, { label: 'Offline', count: offlineCount, color: '#6b7280' }].map(s => (
            <div key={s.label} style={{ flex: 1, background: `${s.color}11`, border: `1px solid ${s.color}33`, borderRadius: 10, padding: '8px 6px', textAlign: 'center' }}>
              <div style={{ color: s.color, fontWeight: 900, fontSize: 18 }}>{s.count}</div>
              <div style={{ color: '#6b7280', fontSize: 8, textTransform: 'uppercase', letterSpacing: '0.1em' }}>{s.label}</div>
            </div>
          ))}
        </div>

        {riders.length === 0 ? (
          <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: 16, color: '#6b7280', fontSize: 11, textAlign: 'center' }}>
            No delivery agents found.<br />
            <span style={{ fontSize: 10, marginTop: 4, display: 'block' }}>Add agents in Admin → Team Management.</span>
          </div>
        ) : riders.map((rider, rIdx) => {
          const color = RIDER_COLORS[rIdx % RIDER_COLORS.length];
          const statusColor = rider.onlineStatus === 'online' ? '#10b981' : rider.onlineStatus === 'idle' ? '#f59e0b' : '#6b7280';
          const isSelected = selectedRider?.id === rider.id;
          return (
            <div key={rider.id}
              onClick={() => {
                setSelectedRider(isSelected ? null : rider);
                if (rider.rider_lat && rider.rider_lng && leafletMapRef.current) {
                  leafletMapRef.current.setView([parseFloat(rider.rider_lat), parseFloat(rider.rider_lng)], 14);
                }
              }}
              style={{ background: isSelected ? `${color}14` : 'rgba(255,255,255,0.04)', border: `1px solid ${isSelected ? color+'66' : 'rgba(255,255,255,0.08)'}`, borderRadius: 12, padding: '12px 14px', cursor: 'pointer', transition: 'all 0.2s' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 18 }}>🚚</span>
                  <div>
                    <div style={{ color: 'white', fontWeight: 700, fontSize: 12 }}>{rider.name}</div>
                    <div style={{ color: '#6b7280', fontSize: 9 }}>{rider.email}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 3 }}>
                  <span style={{ background: `${statusColor}22`, color: statusColor, border: `1px solid ${statusColor}44`, fontSize: 8, padding: '2px 6px', borderRadius: 20, fontWeight: 700, textTransform: 'uppercase' }}>{rider.onlineStatus}</span>
                  <span style={{ color: '#6b7280', fontSize: 8 }}>{timeAgo(rider.rider_last_seen)}</span>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                <div style={{ flex: 1, background: `${color}11`, border: `1px solid ${color}33`, borderRadius: 6, padding: '5px', textAlign: 'center' }}>
                  <div style={{ color, fontWeight: 900, fontSize: 14 }}>{(rider.activeOrders || []).length}</div>
                  <div style={{ color: '#6b7280', fontSize: 8, textTransform: 'uppercase' }}>Active</div>
                </div>
                {rider.rider_lat && (
                  <div style={{ flex: 1, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 6, padding: '5px', textAlign: 'center' }}>
                    <div style={{ color: '#9ca3af', fontSize: 9, lineHeight: 1.3 }}>
                      {parseFloat(rider.rider_lat).toFixed(3)},<br />{parseFloat(rider.rider_lng).toFixed(3)}
                    </div>
                  </div>
                )}
              </div>
              {isSelected && (rider.activeOrders || []).length > 0 && (
                <div style={{ marginTop: 8, borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 8 }}>
                  <div style={{ color: '#6b7280', fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 5 }}>Active Orders</div>
                  {rider.activeOrders.slice(0, 4).map(o => (
                    <div key={o.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                      <span style={{ color: '#ccc', fontSize: 10 }}>#{o.id} {o.is_urgent ? '⚡' : ''}</span>
                      <span style={{ background: `${color}22`, color, fontSize: 8, padding: '1px 5px', borderRadius: 4, fontWeight: 700 }}>{o.status}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Bottom Right: Legend */}
      <div style={{ position: 'absolute', bottom: 16, right: 16, zIndex: 1000, background: 'rgba(10,10,10,0.9)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: '12px 16px' }}>
        <div style={{ color: '#6b7280', fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: 8 }}>Legend</div>
        {[
          { icon: '🚚', label: 'Rider Location', color: '#3b82f6' },
          { icon: '📦', label: 'Delivery Stop', color: '#f59e0b' },
          { icon: '⚡', label: 'Urgent Order', color: '#ef4444' },
        ].map(l => (
          <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5 }}>
            <span style={{ fontSize: 13 }}>{l.icon}</span>
            <span style={{ color: l.color, fontSize: 10, fontWeight: 600 }}>{l.label}</span>
          </div>
        ))}
        <div style={{ marginTop: 8, borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 8 }}>
          <div style={{ color: '#6b7280', fontSize: 8, marginBottom: 4 }}>Auto-refreshes every 10s</div>
          <button onClick={fetchRiders}
            style={{ background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.3)', color: '#f59e0b', borderRadius: 8, padding: '5px 10px', fontSize: 10, cursor: 'pointer', fontWeight: 700 }}>
            🔄 Refresh Now
          </button>
        </div>
      </div>

      <style>{`
        @keyframes pr { 0%{transform:scale(0.85);opacity:1} 100%{transform:scale(2.4);opacity:0} }
        .leaflet-popup-content-wrapper,.leaflet-popup-tip { background:transparent!important; border:none!important; box-shadow:none!important; padding:0!important; }
        .leaflet-control-attribution { display:none!important; }
        .leaflet-bar a { background:#111!important; color:#f59e0b!important; border-color:rgba(255,255,255,0.1)!important; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 2px; }
      `}</style>
    </div>
  );
}
