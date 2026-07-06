const { verifyCaptchaToken } = require('../utils/captcha');

// --- 1. MEMORY-BASED RATE LIMITER ---
// Restricts brute force abuse on sensitive routes
const rateLimits = new Map(); // Store format: IP -> { hits, resetTime }

const createRateLimiter = (maxHits = 15, windowMs = 60 * 1000) => {
  // Run background cleaner every minute to keep memory footprint clean
  setInterval(() => {
    const now = Date.now();
    for (const [ip, record] of rateLimits.entries()) {
      if (now > record.resetTime) {
        rateLimits.delete(ip);
      }
    }
  }, 60 * 1000).unref(); // prevent keeping the node process alive unnecessarily

  return (req, res, next) => {
    const ip = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
    const now = Date.now();

    let record = rateLimits.get(ip);
    if (!record || now > record.resetTime) {
      record = { hits: 1, resetTime: now + windowMs };
      rateLimits.set(ip, record);
      return next();
    }

    record.hits += 1;
    if (record.hits > maxHits) {
      return res.status(429).json({
        message: 'Too many requests. Please try again after one minute for security reasons.'
      });
    }

    next();
  };
};

// Rate limiter instances for different classes of endpoints
const strictLimiter = createRateLimiter(15, 60 * 1000); // 15 requests/min for Auth/Contact
const generalLimiter = createRateLimiter(100, 60 * 1000); // 100 requests/min for general API browsing

// --- 2. USER-AGENT BOT SHIELD ---
// Disallows basic scraper command lines or headless clients
const userAgentShield = (req, res, next) => {
  const userAgent = req.headers['user-agent'] || '';

  if (!userAgent) {
    return res.status(403).json({ message: 'Access denied: Browser validation failed.' });
  }

  // Common headless crawler and bot agent identifiers
  const botKeywords = [
    'curl', 'wget', 'python-requests', 'phantomjs', 'selenium', 
    'playwright', 'headlesschrome', 'crawler', 'scrapy', 'postman'
  ];

  const lowerAgent = userAgent.toLowerCase();
  for (const keyword of botKeywords) {
    if (lowerAgent.includes(keyword)) {
      return res.status(403).json({
        message: 'Access denied: Automated requests are blocked by security policy.'
      });
    }
  }

  next();
};

// --- 3. HONEYPOT PROTECTION ---
// Blocks automated spam bots that fill all input fields automatically
const validateHoneypot = (req, res, next) => {
  // Honeypot field name matches verify labels but is styled hidden on frontend
  const honeypotField = req.body.website_verify;

  if (honeypotField !== undefined && honeypotField !== '') {
    console.warn(`[Security Alert] Honeypot field triggered by IP: ${req.ip}`);
    // Respond with success to trick the bot into thinking it succeeded, preventing retry
    return res.status(200).json({
      message: 'Operation processed successfully.',
      botProtection: true
    });
  }

  next();
};

// --- 4. CAPTCHA VALIDATION MIDDLEWARE ---
const validateCaptcha = (req, res, next) => {
  const { captchaToken, captchaValue } = req.body;

  if (!captchaToken || !captchaValue) {
    return res.status(400).json({
      message: 'Security Verification (Captcha) is required.'
    });
  }

  const isValid = verifyCaptchaToken(captchaToken, captchaValue);
  if (!isValid) {
    return res.status(400).json({
      message: 'Security Verification code (Captcha) is incorrect or expired.'
    });
  }

  next();
};

module.exports = {
  strictLimiter,
  generalLimiter,
  userAgentShield,
  validateHoneypot,
  validateCaptcha
};
