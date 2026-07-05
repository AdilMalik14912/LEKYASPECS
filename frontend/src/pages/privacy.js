const React = require('react');
const Link = require('next/link').default;
const Head = require('next/head').default;
const { ArrowLeft, ShieldCheck, Lock, Eye, FileText, CheckCircle, ScrollText } = require('lucide-react');

export default function PrivacyPolicy() {
  return (
    <>
      <Head>
        <title>Privacy Policy — Lekya Specs Eyewear</title>
        <meta name="description" content="Read Lekya Specs Privacy Policy. We are committed to protecting your personal information and browser privacy." />
      </Head>

      <div className="bg-premium-light min-h-screen py-16 px-4 sm:px-6 lg:px-8 text-premium-dark font-sans">
        <div className="max-w-3xl mx-auto">
          
          {/* Back button */}
          <div className="mb-10">
            <Link href="/" className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-premium-accent font-bold hover:text-premium-black transition-colors" style={{ textDecoration: 'none' }}>
              <ArrowLeft className="w-4 h-4" /> Back to Home
            </Link>
          </div>

          {/* Heading */}
          <div className="border-b border-premium-accent/20 pb-8 mb-12">
            <div className="flex items-center gap-3 mb-4">
              <ShieldCheck className="w-8 h-8 text-premium-accent" />
              <span className="text-xs uppercase tracking-widest text-premium-gray font-bold">Lekya Trust Agreement</span>
            </div>
            <h1 className="font-serif text-4xl sm:text-5xl font-bold text-premium-black tracking-tight">
              Privacy Policy &amp; Data Disclosures
            </h1>
            <p className="text-xs text-premium-gray font-medium mt-3">
              Last Updated: July 05, 2026
            </p>
          </div>

          {/* Quick summary cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-12">
            <div className="border border-premium-accent/20 bg-white/40 backdrop-blur p-5 rounded-lg shadow-sm">
              <Eye className="w-5 h-5 text-premium-accent mb-3" />
              <h4 className="font-serif font-bold text-sm text-premium-black mb-1">Local Processing</h4>
              <p className="text-[11px] text-premium-gray leading-relaxed font-light">
                Facial landmarks for the try-on scan are computed locally in your browser. Biometrics never leave your device.
              </p>
            </div>
            <div className="border border-premium-accent/20 bg-white/40 backdrop-blur p-5 rounded-lg shadow-sm">
              <Lock className="w-5 h-5 text-premium-accent mb-3" />
              <h4 className="font-serif font-bold text-sm text-premium-black mb-1">Secure Transactions</h4>
              <p className="text-[11px] text-premium-gray leading-relaxed font-light">
                Payments are processed through PCI-compliant gateways (Razorpay). Card details are never stored on our database.
              </p>
            </div>
            <div className="border border-premium-accent/20 bg-white/40 backdrop-blur p-5 rounded-lg shadow-sm">
              <FileText className="w-5 h-5 text-premium-accent mb-3" />
              <h4 className="font-serif font-bold text-sm text-premium-black mb-1">Zero Spam Policy</h4>
              <p className="text-[11px] text-premium-gray leading-relaxed font-light">
                We only send emails for order confirmations, reward loyalty updates, or optional promotion broadcasts.
              </p>
            </div>
          </div>

          {/* Text body content */}
          <div className="space-y-10 text-sm leading-relaxed text-premium-gray font-light">
            
            <section>
              <h3 className="font-serif text-lg font-bold text-premium-black mb-3">1. Information We Collect</h3>
              <p className="mb-3">
                Lekya Specs collects only the minimum personal data required to manage your account, verify your identity, and fulfill order shipments. This data collection process spans three primary categories:
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li><strong>Account Credentials</strong>: Name, verified email address, phone number, and encrypted password hashes created during phone/email OTP validation.</li>
                <li><strong>Transactional Details</strong>: Shipping address coordinates, billing information, purchase history, and custom prescription indices (sphere, cylinder, axis, and pupillary distance).</li>
                <li><strong>Style Customization</strong>: Face shape identifiers calculated during scanner modules to provide tailored frame model recommendations.</li>
              </ul>
            </section>

            <section>
              <h3 className="font-serif text-lg font-bold text-premium-black mb-3">2. Biometric Privacy &amp; Live Web Camera Processing</h3>
              <p className="mb-3">
                Our Virtual Try-On Studio utilizes browser camera elements and the <code className="bg-white border px-1.5 py-0.5 rounded text-xs font-mono">face-api.js</code> detection model to locate facial coordinates and overlay transparent SVG frame designs.
              </p>
              <div className="border-l-2 border-premium-accent pl-4 my-4 font-normal text-premium-black italic bg-amber-50/30 py-3 pr-3 rounded-r space-y-2">
                <p>📢 <strong>Biometric Verification Standard:</strong></p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>No camera video feeds or captured photos are uploaded, stored, or processed on Lekya Specs servers.</li>
                  <li>All landmarks detection and background removal canvas computations run client-side in your active browser instance.</li>
                  <li>Images are converted to localized URL paths temporarily to render styling frames, and are purged instantly when you reload the window or change pages.</li>
                </ul>
              </div>
            </section>

            <section>
              <h3 className="font-serif text-lg font-bold text-premium-black mb-3">3. Cookies &amp; Browser Cache Storage</h3>
              <p className="mb-3">
                We use localized browser storage cookies to remember your state and improve page loading performance:
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li><strong>specs_token</strong>: Secure JSON Web Token (JWT) identifying your active authentication session.</li>
                <li><strong>specs_cart</strong>: Temporary storage of chosen frame models before checkout.</li>
                <li><strong>specs_wishlist</strong>: Caching products you marked as favorites.</li>
              </ul>
            </section>

            <section>
              <h3 className="font-serif text-lg font-bold text-premium-black mb-3">4. Security Measures &amp; Data Retention</h3>
              <p className="mb-3">
                We employ robust safety parameters to guarantee transaction integrity:
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li>Passwords are salted and securely encrypted using bcrypt libraries.</li>
                <li>API calls require JWT headers to prevent administrative privilege escalations.</li>
                <li>Customer database records (orders, profiles) are stored on encrypted cloud nodes managed by Turso.</li>
                <li>We retain transactional information for compliance audit guidelines, but user account records can be wiped upon explicit request.</li>
              </ul>
            </section>

            <section>
              <h3 className="font-serif text-lg font-bold text-premium-black mb-3">5. Third-Party Data Integrations</h3>
              <p className="mb-2">
                We do not sell, rent, or lease your profile coordinates to third-party ad networks. We share details only with essential processors to complete store operations:
              </p>
              <ul className="list-disc pl-5 space-y-1.5">
                <li><strong>Razorpay</strong>: Handles debit/credit and UPI processing using encrypted PCI-compliant interfaces.</li>
                <li><strong>Nodemailer/Google SMTP</strong>: Delivers transactional OTP codes, helpdesk replies, and loyalty updates.</li>
                <li><strong>Turso DB</strong>: Distributes database storage globally for fast page renders.</li>
              </ul>
            </section>

            <section>
              <h3 className="font-serif text-lg font-bold text-premium-black mb-3">6. Customer Rights &amp; Access Controls</h3>
              <p>
                You hold absolute rights to inspect, update, or purge your profile logs. You can change profile details directly from the Account Dashboard or contact our privacy team at <a href="mailto:support@lekyaspecs.com" className="text-premium-accent font-semibold hover:underline">support@lekyaspecs.com</a> to request absolute record deletion.
              </p>
            </section>

            <div className="bg-premium-light border border-premium-accent/20 rounded-lg p-6 text-center mt-12">
              <CheckCircle className="w-8 h-8 text-premium-accent mx-auto mb-3" />
              <h4 className="font-serif font-bold text-premium-black mb-1">Your privacy is safe with us</h4>
              <p className="text-xs text-premium-gray max-w-md mx-auto">
                Thank you for placing your trust in Lekya Specs. We strive to provide a premium, transparent, and completely private eyewear styling experience.
              </p>
            </div>

          </div>

        </div>
      </div>
    </>
  );
}
