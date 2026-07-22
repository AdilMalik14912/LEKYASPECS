const React = require('react');
const { useState, useEffect } = React;
const Head = require('next/head').default;
const Link = require('next/link').default;
const { Mail, Phone, MapPin, Send, CheckCircle, Clock, MessageSquare, Instagram, Twitter, RefreshCw } = require('lucide-react');
const API_BASE = typeof window !== 'undefined'
  ? (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' ? 'http://localhost:5000' : '')
  : '';

const CONTACT_HEADING = 'We\'d Love to Hear From You';

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: '', message: '' });
  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [typedText, setTypedText] = useState('');

  // Captcha & Honeypot states
  const [captchaToken, setCaptchaToken] = useState('');
  const [captchaSvg, setCaptchaSvg] = useState('');
  const [captchaInput, setCaptchaInput] = useState('');
  const [websiteVerify, setWebsiteVerify] = useState('');
  const [captchaLoading, setCaptchaLoading] = useState(false);
  const [captchaError, setCaptchaError] = useState(false);

  const fetchCaptcha = (attempt = 1) => {
    setCaptchaLoading(true);
    setCaptchaError(false);
    fetch(`${API_BASE}/api/auth/captcha`)
      .then(res => { if (!res.ok) throw new Error('non-ok'); return res.json(); })
      .then(data => {
        if (data.token && data.svg) {
          setCaptchaToken(data.token);
          setCaptchaSvg(data.svg);
          setCaptchaInput('');
          setCaptchaLoading(false);
          setCaptchaError(false);
        } else throw new Error('bad payload');
      })
      .catch(() => {
        if (attempt < 3) {
          setTimeout(() => fetchCaptcha(attempt + 1), attempt * 1200);
        } else {
          setCaptchaLoading(false);
          setCaptchaError(true);
        }
      });
  };

  // Typewriter effect & Captcha fetch on mount
  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      i++;
      setTypedText(CONTACT_HEADING.slice(0, i));
      if (i >= CONTACT_HEADING.length) clearInterval(interval);
    }, 55);

    fetchCaptcha();

    return () => clearInterval(interval);
  }, []);

  const handleChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSending(true);
    setError('');
    setSuccess('');
    try {
      const res = await fetch(`${API_BASE}/api/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          captchaToken,
          captchaValue: captchaInput,
          website_verify: websiteVerify
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to send');
      setSuccess(data.message);
      setForm({ name: '', email: '', phone: '', subject: '', message: '' });
      fetchCaptcha(); // Load fresh captcha on success
    } catch (err) {
      setError(err.message);
      fetchCaptcha(); // Refresh captcha on failure
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      <Head>
        <title>Contact Us — Lekya Specs</title>
        <meta name="description" content="Get in touch with Lekya Specs. We're here to help with your eyewear needs, orders, and queries." />
      </Head>

      {/* Hero Banner */}
      <div className="bg-premium-black pt-32 pb-16 px-4 text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ background: 'radial-gradient(ellipse at center, #FAAE62 0%, transparent 70%)' }} />
        <span className="text-[10px] uppercase font-bold text-premium-accent tracking-widest mb-3 block">Get In Touch</span>
        <h1 className="font-serif text-4xl sm:text-5xl font-bold text-white mb-4">
          {typedText}<span className="typewriter-cursor text-premium-accent" style={{ opacity: typedText.length < CONTACT_HEADING.length ? 1 : 0 }} />
        </h1>
        <p className="text-gray-400 max-w-lg mx-auto text-sm leading-relaxed">
          Have a question about frames, lenses, or your order? Our team is ready to help.
        </p>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-16 grid grid-cols-1 lg:grid-cols-3 gap-10">

        {/* ── Left: Info Cards ───────────────────────────────────── */}
        <div className="space-y-5">

          {[
            {
              icon: <Mail className="w-5 h-5" />,
              title: 'Email Us',
              lines: ['support@lekyaspecs.com', 'We reply within 24 hours'],
              color: 'text-blue-500',
              bg: 'bg-blue-50'
            },
            {
              icon: <Phone className="w-5 h-5" />,
              title: 'Call Us',
              lines: ['+91 96541 19262', 'Mon–Sat, 10am – 7pm IST'],
              color: 'text-green-600',
              bg: 'bg-green-50'
            },
            {
              icon: <MapPin className="w-5 h-5" />,
              title: 'Visit Us',
              lines: ['102-J (part of 102), Hari Nagar Ashram', 'South Delhi, New Delhi - 110014'],
              color: 'text-red-500',
              bg: 'bg-red-50'
            },
            {
              icon: <Clock className="w-5 h-5" />,
              title: 'Working Hours',
              lines: ['Mon – Sat: 10:00 AM – 7:00 PM', 'Sunday: Closed'],
              color: 'text-premium-accent',
              bg: 'bg-amber-50'
            },
          ].map(card => (
            <div key={card.title} className="bg-white border border-premium-border rounded-lg p-5 flex gap-4 items-start shadow-sm hover:shadow-md transition-shadow">
              <div className={`w-10 h-10 rounded-lg ${card.bg} ${card.color} flex items-center justify-center shrink-0`}>
                {card.icon}
              </div>
              <div>
                <p className="font-bold text-sm text-premium-black mb-1">{card.title}</p>
                {card.lines.map((l, i) => (
                  <p key={i} className={`text-xs ${i === 0 ? 'text-premium-dark font-medium' : 'text-premium-gray'}`}>{l}</p>
                ))}
              </div>
            </div>
          ))}

          {/* Social Links */}
          <div className="bg-premium-black rounded-lg p-5 text-center">
            <p className="text-xs font-bold text-premium-accent uppercase tracking-widest mb-4">Follow Us</p>
            <div className="flex justify-center gap-4">
              {[
                { icon: <Instagram className="w-5 h-5" />, label: 'Instagram' },
                { icon: <Twitter className="w-5 h-5" />, label: 'Twitter' },
                { icon: <MessageSquare className="w-5 h-5" />, label: 'WhatsApp' },
              ].map(s => (
                <button key={s.label} className="w-10 h-10 rounded-full border border-white/20 text-white hover:bg-premium-accent hover:border-premium-accent hover:text-premium-black transition-all flex items-center justify-center" title={s.label}>
                  {s.icon}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── Right: Contact Form ────────────────────────────────── */}
        <div className="lg:col-span-2">
          <div className="bg-white border border-premium-border rounded-xl p-8 shadow-sm">
            <h2 className="font-serif text-2xl font-bold text-premium-black mb-1">Send Us a Message</h2>
            <p className="text-xs text-premium-gray mb-8">Fill in the form below and we'll get back to you within 24 hours.</p>

            {/* Success */}
            {success && (
              <div className="mb-6 flex items-center gap-3 bg-green-50 border border-green-200 rounded-lg p-4">
                <CheckCircle className="w-5 h-5 text-green-600 shrink-0" />
                <p className="text-sm text-green-700 font-medium">{success}</p>
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Name + Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-premium-gray mb-1.5">Full Name *</label>
                  <input
                    name="name" value={form.name} onChange={handleChange} required
                    placeholder="Your name"
                    className="w-full border border-premium-border rounded-lg px-4 py-3 text-sm text-premium-black focus:outline-none focus:border-premium-accent transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-premium-gray mb-1.5">Email Address *</label>
                  <input
                    name="email" type="email" value={form.email} onChange={handleChange} required
                    placeholder="your@email.com"
                    className="w-full border border-premium-border rounded-lg px-4 py-3 text-sm text-premium-black focus:outline-none focus:border-premium-accent transition-colors"
                  />
                </div>
              </div>

              {/* Phone + Subject */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-premium-gray mb-1.5">Phone Number</label>
                  <input
                    name="phone" value={form.phone} onChange={handleChange}
                    placeholder="+91 96541 19262"
                    className="w-full border border-premium-border rounded-lg px-4 py-3 text-sm text-premium-black focus:outline-none focus:border-premium-accent transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-premium-gray mb-1.5">Subject *</label>
                  <select
                    name="subject" value={form.subject} onChange={handleChange} required
                    className="w-full border border-premium-border rounded-lg px-4 py-3 text-sm text-premium-black focus:outline-none focus:border-premium-accent transition-colors bg-white"
                  >
                    <option value="">Select a subject</option>
                    <option value="Order Inquiry">Order Inquiry</option>
                    <option value="Return & Exchange">Return & Exchange</option>
                    <option value="Product Question">Product Question</option>
                    <option value="Prescription Help">Prescription Help</option>
                    <option value="Bulk Order">Bulk Order / Business</option>
                    <option value="Feedback">Feedback</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              {/* Message */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-premium-gray mb-1.5">Message *</label>
                <textarea
                  name="message" value={form.message} onChange={handleChange} required
                  rows={5}
                  placeholder="Tell us how we can help you..."
                  className="w-full border border-premium-border rounded-lg px-4 py-3 text-sm text-premium-black focus:outline-none focus:border-premium-accent transition-colors resize-none"
                />
              </div>

              {/* Honeypot field (hidden from view, bot trap) */}
              <div style={{ position: 'absolute', left: '-9999px', top: '-9999px', opacity: 0, zIndex: -1 }}>
                <input
                  type="text"
                  name="website_verify"
                  value={websiteVerify}
                  onChange={(e) => setWebsiteVerify(e.target.value)}
                  tabIndex="-1"
                  autoComplete="off"
                  placeholder="Do not fill this"
                />
              </div>

              {/* Captcha Verification Widget */}
              <div className="space-y-2 bg-premium-light border border-premium-border rounded-xl p-4">
                <label className="block text-[10px] uppercase tracking-wider text-premium-accent font-bold">
                  Security Verification
                </label>
                <div className="flex flex-col sm:flex-row items-center gap-3">
                  <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-start">
                    {captchaSvg ? (
                      <div 
                        dangerouslySetInnerHTML={{ __html: captchaSvg }} 
                        className="flex-shrink-0 cursor-pointer"
                        title="Click to refresh"
                        onClick={fetchCaptcha}
                      />
                    ) : (
                      <div
                        onClick={fetchCaptcha}
                        className="w-[160px] h-[50px] bg-premium-black rounded flex items-center justify-center text-xs font-mono cursor-pointer select-none border border-dashed border-premium-border hover:border-premium-accent transition-colors"
                        title="Click to load captcha"
                      >
                        {captchaError ? (
                          <span className="text-red-400 text-center px-2">⚠ Tap to retry</span>
                        ) : captchaLoading ? (
                          <span className="text-premium-gray animate-pulse">Loading...</span>
                        ) : (
                          <span className="text-premium-gray">Click to load</span>
                        )}
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={fetchCaptcha}
                      className="p-3 border border-premium-border text-premium-accent hover:border-premium-accent rounded bg-white transition-colors flex items-center justify-center shrink-0"
                      title="Refresh Security Code"
                    >
                      <RefreshCw className="w-4 h-4" />
                    </button>
                  </div>
                  <input
                    type="text"
                    required
                    value={captchaInput}
                    onChange={(e) => setCaptchaInput(e.target.value)}
                    placeholder="ENTER CODE"
                    className="w-full sm:flex-grow bg-white text-sm border border-premium-border rounded px-3 py-3 focus:outline-none focus:border-premium-accent text-premium-dark font-mono font-bold uppercase text-center"
                    maxLength="5"
                    autoComplete="off"
                  />
                </div>
                <p className="text-[9px] text-premium-gray font-light">
                  Please enter the 5-character visual captcha code above to send your message.
                </p>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={sending}
                className="w-full sm:w-auto bg-premium-black text-white hover:bg-premium-accent hover:text-premium-black font-semibold text-xs tracking-widest uppercase py-4 px-10 rounded-lg transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {sending ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Send Message
                  </>
                )}
              </button>
            </form>
          </div>

          {/* FAQ Quick Links */}
          <div className="mt-6 bg-premium-light border border-premium-border rounded-xl p-6">
            <p className="text-xs font-bold uppercase tracking-widest text-premium-gray mb-4">Quick Answers</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { q: 'How long does delivery take?', a: '3–5 business days across India' },
                { q: 'Can I return my order?', a: '7-day easy returns, no questions asked' },
                { q: 'Do you offer prescription lenses?', a: 'Yes! Upload your Rx during checkout' },
                { q: 'Is COD available?', a: 'Yes, Cash on Delivery available India-wide' },
              ].map(faq => (
                <div key={faq.q} className="p-3 bg-white rounded-lg border border-premium-border">
                  <p className="text-xs font-bold text-premium-black mb-1">{faq.q}</p>
                  <p className="text-xs text-premium-gray">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
