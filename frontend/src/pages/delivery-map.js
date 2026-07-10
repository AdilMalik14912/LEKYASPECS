const React = require('react');
const { useState, useEffect, useRef } = React;
const { useRouter } = require('next/router');
const { useAuth } = require('./_app');
const Link = require('next/link').default;

const API_BASE = typeof window !== 'undefined'
  ? (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' ? 'http://localhost:5000' : '')
  : '';

const STATUS_COLORS = {
  'Shipped': '#f59e0b',
  'Out for Delivery': '#3b82f6',
  'Processing': '#8b5cf6',
  'Paid': '#10b981',
};

const geocodeAddress = async (address) => {
  const getCoords = async (query) => {
    try {
      await new Promise(r => setTimeout(r, 1100));
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1&countrycodes=in`,
        { headers: { 'User-Agent': 'LekyaSpecs/1.0 delivery-map' } }
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

const calcDistance = (lat1, lng1, lat2, lng2) => {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat/2)**2 + Math.cos(lat1*Math.PI/180) * Math.cos(lat2*Math.PI/180) * Math.sin(dLon/2)**2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
};

export default function DeliveryMap() {
  const { user, token } = useAuth();
  const router = useRouter();
  const mapRef = useRef(null);
  const leafletMapRef = useRef(null);
  const markersRef = useRef([]);
  const routeRef = useRef(null);
  const watchIdRef = useRef(null);
  const locationIntervalRef = useRef(null);
  const initialBoundsSetRef = useRef(false);

  const [locationStatus, setLocationStatus] = useState('requesting');
  const [riderLocation, setRiderLocation] = useState(null);
  const [orders, setOrders] = useState([]);
  const [geocodedOrders, setGeocodedOrders] = useState([]);
  const [geocodingProgress, setGeocodingProgress] = useState(0);
  const [totalDistance, setTotalDistance] = useState(0);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [leafletReady, setLeafletReady] = useState(false);
  const [mapInitialized, setMapInitialized] = useState(false);
  const [statusMsg, setStatusMsg] = useState('Initializing map...');

  const authHeaders = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    if (!user) { router.push('/account'); return; }
    const allowed = ['delivery', 'admin', 'seller'];
    if (!allowed.includes(user.role) && user.email !== 'admin@specs.com') router.push('/');
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

  useEffect(() => {
    if (!token) return;
    fetch(`${API_BASE}/api/delivery/map-orders`, { headers: authHeaders })
      .then(r => r.ok ? r.json() : []).then(setOrders).catch(() => {});
  }, [token]);

  useEffect(() => {
    if (!navigator.geolocation) { setLocationStatus('denied'); return; }
    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        setRiderLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLocationStatus('granted');
      },
      () => setLocationStatus('denied'),
      { enableHighAccuracy: true, maximumAge: 10000, timeout: 15000 }
    );
    return () => { if (watchIdRef.current) navigator.geolocation.clearWatch(watchIdRef.current); };
  }, []);

  useEffect(() => {
    if (!riderLocation || !token) return;
    const send = () => fetch(`${API_BASE}/api/delivery/location`, {
      method: 'PUT',
      headers: { ...authHeaders, 'Content-Type': 'application/json' },
      body: JSON.stringify({ lat: riderLocation.lat, lng: riderLocation.lng })
    }).catch(() => {});
    send();
    locationIntervalRef.current = setInterval(send, 30000);
    return () => clearInterval(locationIntervalRef.current);
  }, [riderLocation && riderLocation.lat, riderLocation && riderLocation.lng]);

  useEffect(() => {
    if (orders.length === 0) { setStatusMsg('Map ready!'); return; }
    let cancelled = false;
    (async () => {
      const results = [];
      for (let i = 0; i < orders.length; i++) {
        if (cancelled) break;
        setStatusMsg(`Geocoding address ${i+1} of ${orders.length}...`);
        const coords = await geocodeAddress(orders[i].shipping_address);
        results.push({ ...orders[i], coords });
        setGeocodingProgress(((i + 1) / orders.length) * 100);
      }
      if (!cancelled) { setGeocodedOrders(results); setStatusMsg('Map ready!'); }
    })();
    return () => { cancelled = true; };
  }, [orders.length]);

  useEffect(() => {
    if (!leafletReady || !mapRef.current || mapInitialized) return;
    const L = window.L;
    const center = riderLocation ? [riderLocation.lat, riderLocation.lng] : [28.6139, 77.2090];
    const map = L.map(mapRef.current, { center, zoom: 13, zoomControl: false });
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '', subdomains: 'abcd', maxZoom: 19
    }).addTo(map);
    L.control.zoom({ position: 'bottomright' }).addTo(map);
    leafletMapRef.current = map;
    setMapInitialized(true);
  }, [leafletReady]);

  useEffect(() => {
    if (!leafletMapRef.current || !mapInitialized) return;
    const L = window.L;
    const map = leafletMapRef.current;
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];
    if (routeRef.current) { routeRef.current.remove(); routeRef.current = null; }
    const routePoints = [];

    if (riderLocation) {
      const icon = L.divIcon({
        className: '',
        html: `<div style="position:relative;width:48px;height:48px;"><div style="position:absolute;inset:0;border-radius:50%;background:rgba(59,130,246,0.2);animation:pr 2s infinite;"></div><div style="position:absolute;inset:6px;border-radius:50%;background:#1d4ed8;display:flex;align-items:center;justify-content:center;font-size:18px;border:2px solid #3b82f6;box-shadow:0 0 20px rgba(59,130,246,0.7);">🚚</div></div>`,
        iconSize: [48, 48], iconAnchor: [24, 24],
      });
      const m = L.marker([riderLocation.lat, riderLocation.lng], { icon }).addTo(map)
        .bindPopup(`<div style="background:#111;color:white;padding:10px 14px;border-radius:10px;border:1px solid #3b82f6;font-family:sans-serif;"><b style="color:#3b82f6">📍 Your Location</b><br><small style="color:#888">${riderLocation.lat.toFixed(5)}, ${riderLocation.lng.toFixed(5)}</small></div>`);
      markersRef.current.push(m);
      routePoints.push([riderLocation.lat, riderLocation.lng]);
    }

    let totalDist = 0;
    let prev = riderLocation ? [riderLocation.lat, riderLocation.lng] : null;
    geocodedOrders.forEach((order, idx) => {
      if (!order.coords) return;
      const { lat, lng } = order.coords;
      const color = STATUS_COLORS[order.status] || '#f59e0b';
      const icon = L.divIcon({
        className: '',
        html: `<div style="width:36px;height:36px;border-radius:50%;background:${color}22;border:2.5px solid ${color};display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:900;color:${color};box-shadow:0 0 16px ${color}55;font-family:monospace;">${idx+1}</div>`,
        iconSize: [36, 36], iconAnchor: [18, 18],
      });
      const addr = typeof order.shipping_address === 'object'
        ? [order.shipping_address.line1, order.shipping_address.city].filter(Boolean).join(', ')
        : order.shipping_address || '';
      const m = L.marker([lat, lng], { icon }).addTo(map)
        .bindPopup(`<div style="background:#111;color:white;padding:10px 14px;border-radius:10px;border:1px solid #3b82f6;font-family:sans-serif;"><b style="color:${color}">Order #${order.id}</b>${order.is_urgent ? '<span style="background:#ef4444;color:white;font-size:9px;padding:1px 5px;border-radius:3px;margin-left:6px;">⚡ URGENT</span>' : ''}<div style="font-size:11px;color:#ccc;margin-top:6px;">${order.customer_name || 'Guest'}</div><div style="font-size:10px;color:#888;">📍 ${addr}</div><span style="display:inline-block;margin-top:6px;background:${color}22;color:${color};font-size:9px;padding:2px 6px;border-radius:4px;font-weight:700;">${order.status}</span><br><a href="https://www.google.com/maps?q=${lat},${lng}" target="_blank" style="display:inline-block;margin-top:8px;background:#1d4ed8;color:white;font-size:9px;padding:4px 8px;border-radius:5px;text-decoration:none;font-weight:700;">🗺 Navigate</a></div>`);
      markersRef.current.push(m);
      routePoints.push([lat, lng]);
      if (prev) totalDist += calcDistance(prev[0], prev[1], lat, lng);
      prev = [lat, lng];
    });
    setTotalDistance(totalDist);
    if (routePoints.length > 1) {
      routeRef.current = L.polyline(routePoints, { color: '#f59e0b', weight: 3, opacity: 0.85, dashArray: '10, 8' }).addTo(map);
      if (!initialBoundsSetRef.current) {
        map.fitBounds(routeRef.current.getBounds(), { padding: [60, 60] });
        initialBoundsSetRef.current = true;
      }
    } else if (riderLocation) {
      if (!initialBoundsSetRef.current) {
        map.setView([riderLocation.lat, riderLocation.lng], 14);
        initialBoundsSetRef.current = true;
      }
    }
  }, [riderLocation, geocodedOrders, mapInitialized]);

  const openGoogleMaps = () => {
    if (!riderLocation) return;
    const wp = geocodedOrders.filter(o => o.coords).map(o => `${o.coords.lat},${o.coords.lng}`).join('/');
    const url = wp
      ? `https://www.google.com/maps/dir/${riderLocation.lat},${riderLocation.lng}/${wp}`
      : `https://www.google.com/maps?q=${riderLocation.lat},${riderLocation.lng}`;
    window.open(url, '_blank');
  };

  const eta = totalDistance > 0 ? Math.round(totalDistance / 30 * 60) : 0;

  return (
    <div style={{ width: '100vw', height: '100vh', background: '#0a0a0a', overflow: 'hidden', position: 'relative', fontFamily: 'system-ui,sans-serif' }}>
      <div ref={mapRef} style={{ width: '100%', height: '100%' }} />

      {/* Top Bar */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 1000, background: 'linear-gradient(to bottom, rgba(10,10,10,0.95), transparent)', padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <a href="/delivery" style={{ color: '#f59e0b', textDecoration: 'none', fontSize: 12, fontWeight: 700, background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.3)', padding: '6px 12px', borderRadius: 8 }}>← Back</a>
          <div>
            <div style={{ color: 'white', fontWeight: 900, fontSize: 15 }}>🗺 Route Map</div>
            <div style={{ color: '#6b7280', fontSize: 10, letterSpacing: '0.15em', textTransform: 'uppercase' }}>{user?.name?.split(' ')[0]} · Delivery Agent</div>
          </div>
        </div>
        {locationStatus === 'granted'
          ? <div style={{ display:'flex', alignItems:'center', gap:6, background:'rgba(16,185,129,0.12)', border:'1px solid rgba(16,185,129,0.4)', padding:'5px 10px', borderRadius:20 }}><div style={{ width:7, height:7, borderRadius:'50%', background:'#10b981', boxShadow:'0 0 8px #10b981' }} /><span style={{ color:'#10b981', fontSize:10, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.1em' }}>GPS Live</span></div>
          : locationStatus === 'denied'
            ? <div style={{ background:'rgba(239,68,68,0.12)', border:'1px solid rgba(239,68,68,0.4)', padding:'5px 10px', borderRadius:20, color:'#ef4444', fontSize:10, fontWeight:700 }}>⚠ GPS Denied</div>
            : <div style={{ color:'#6b7280', fontSize:10 }}>Requesting GPS...</div>
        }
      </div>

      {/* Bottom Panel */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 1000, background: 'linear-gradient(to top, rgba(10,10,10,0.98) 85%, transparent)', padding: '24px 16px 20px' }}>
        {geocodingProgress < 100 && orders.length > 0 && (
          <div style={{ marginBottom: 12 }}>
            <div style={{ color: '#6b7280', fontSize: 10, marginBottom: 4, letterSpacing: '0.12em', textTransform: 'uppercase' }}>{statusMsg}</div>
            <div style={{ background: 'rgba(255,255,255,0.08)', borderRadius: 99, height: 4 }}>
              <div style={{ height: 4, borderRadius: 99, background: 'linear-gradient(to right, #f59e0b, #fbbf24)', width: `${geocodingProgress}%`, transition: 'width 0.4s' }} />
            </div>
          </div>
        )}

        <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
          {[
            { label: 'Stops', value: geocodedOrders.filter(o => o.coords).length, color: '#f59e0b' },
            { label: 'Distance', value: `${totalDistance.toFixed(1)} km`, color: '#3b82f6' },
            { label: 'Est. Time', value: eta > 0 ? `~${eta}m` : '—', color: '#8b5cf6' },
            { label: 'Urgent', value: geocodedOrders.filter(o => o.is_urgent).length, color: '#ef4444' },
          ].map(s => (
            <div key={s.label} style={{ flex: 1, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: '10px 4px', textAlign: 'center' }}>
              <div style={{ color: s.color, fontWeight: 900, fontSize: 16 }}>{s.value}</div>
              <div style={{ color: '#6b7280', fontSize: 8, textTransform: 'uppercase', letterSpacing: '0.12em', marginTop: 2 }}>{s.label}</div>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4, marginBottom: 12 }}>
          {geocodedOrders.length === 0 && orders.length === 0 && (
            <div style={{ color: '#6b7280', fontSize: 12, padding: '8px 0' }}>No active deliveries.</div>
          )}
          {geocodedOrders.map((order, idx) => {
            const color = STATUS_COLORS[order.status] || '#f59e0b';
            const city = typeof order.shipping_address === 'object' ? order.shipping_address.city || 'Address' : 'Address';
            return (
              <div key={order.id} onClick={() => {
                setSelectedOrder(order);
                if (order.coords && leafletMapRef.current) leafletMapRef.current.setView([order.coords.lat, order.coords.lng], 16);
              }} style={{ minWidth: 100, background: `${color}11`, border: `1px solid ${selectedOrder?.id === order.id ? color : color + '44'}`, borderRadius: 10, padding: '8px 10px', cursor: 'pointer', flexShrink: 0 }}>
                <div style={{ color, fontWeight: 900, fontSize: 11, display: 'flex', alignItems: 'center', gap: 3 }}>
                  <span style={{ background: color, color: '#000', borderRadius: '50%', width: 16, height: 16, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 8, fontWeight: 900 }}>{idx+1}</span>
                  #{order.id} {order.is_urgent && '⚡'}
                </div>
                <div style={{ color: '#9ca3af', fontSize: 9, marginTop: 3 }}>{city}</div>
                <div style={{ color, fontSize: 8, marginTop: 2, textTransform: 'uppercase' }}>{order.status}</div>
              </div>
            );
          })}
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={openGoogleMaps} disabled={!riderLocation}
            style={{ flex: 1, background: riderLocation ? 'linear-gradient(135deg, #1d4ed8, #3b82f6)' : 'rgba(255,255,255,0.05)', color: riderLocation ? 'white' : '#6b7280', border: 'none', borderRadius: 12, padding: '13px', fontSize: 12, fontWeight: 700, cursor: riderLocation ? 'pointer' : 'not-allowed' }}>
            🗺 Open in Google Maps
          </button>
          <button onClick={() => leafletMapRef.current && riderLocation && leafletMapRef.current.setView([riderLocation.lat, riderLocation.lng], 15)}
            style={{ background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.3)', color: '#f59e0b', borderRadius: 12, padding: '13px 16px', fontSize: 18, cursor: 'pointer' }}>
            📍
          </button>
        </div>
      </div>

      <style>{`
        @keyframes pr { 0%{transform:scale(0.8);opacity:1} 100%{transform:scale(2.2);opacity:0} }
        .leaflet-popup-content-wrapper,.leaflet-popup-tip { background:transparent!important; border:none!important; box-shadow:none!important; padding:0!important; }
        .leaflet-control-attribution { display:none!important; }
        .leaflet-bar a { background:#111!important; color:#f59e0b!important; border-color:rgba(255,255,255,0.1)!important; }
      `}</style>
    </div>
  );
}
