// Central API configuration — reads from environment or falls back to local dev
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export default API_BASE;
