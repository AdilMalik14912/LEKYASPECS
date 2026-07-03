// Central API configuration
// During local development, points to backend on http://localhost:5000
// On production (Vercel), uses relative path since frontend and backend share the same domain.
const API_BASE = typeof window !== 'undefined'
  ? (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
      ? 'http://localhost:5000'
      : '')
  : '';

export default API_BASE;
export { API_BASE };
