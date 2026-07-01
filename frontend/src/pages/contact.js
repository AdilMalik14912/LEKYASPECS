const React = require('react');
const { useState } = React;
const Head = require('next/head').default;
const Link = require('next/link').default;
const { Mail, Phone, MapPin, Send, CheckCircle, Clock, MessageSquare, Instagram, Twitter } = require('lucide-react');

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: '', message: '' });
  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSending(true);
    setError('');
    setSuccess('');
    try {
      const res = await fetch('http://localhost:5000/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to send');
      setSuccess(data.message);
      setForm({ name: '', email: '', phone: '', subject: '', message: '' });
    } catch (err) {
      setError(err.message);
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
        <div className="absolute inset-0 opacity-10" style={{ background: 'radial-gradient(ellipse at center, #C5A028 0%, transparent 70%)' }} />
        <span className="text-[10px] uppercase font-bold text-premium-accent tracking-widest mb-3 block">Get In Touch</span>
        <h1 className="font-serif text-4xl sm:text-5xl font-bold text-white mb-4">Contact Us</h1>
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
              lines: ['+91 98765 43210', 'Mon–Sat, 10am – 7pm IST'],
              color: 'text-green-600',
              bg: 'bg-green-50'
            },
            {
              icon: <MapPin className="w-5 h-5" />,
              title: 'Visit Us',
              lines: ['Karol Bagh, New Delhi', 'India – 110005'],
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
                    placeholder="+91 98765 43210"
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
