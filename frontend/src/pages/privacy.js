const React = require('react');
const Link = require('next/link').default;
const Head = require('next/head').default;
const { ArrowLeft, ShieldCheck, Lock, Eye, FileText, CheckCircle } = require('lucide-react');

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
              Privacy Policy
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
                Lekya Specs collects only the minimum personal data required to manage your account and fulfill order shipments. This includes:
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li><strong>Account Credentials</strong>: Name, verified email address, phone number, and password hashes created during verification.</li>
                <li><strong>Order Information</strong>: Shipping address, billing details, items bought, and optional prescription lens details.</li>
                <li><strong>Style Profiling</strong>: Face shapes (calculated by scanner) to customize eyewear recommendations.</li>
              </ul>
            </section>

            <section>
              <h3 className="font-serif text-lg font-bold text-premium-black mb-3">2. AI Try-On & Biometric Data Privacy</h3>
              <p className="mb-3">
                Our Virtual Try-On Studio uses the <code className="bg-white border px-1.5 py-0.5 rounded text-xs font-mono">face-api.js</code> framework to auto-align frame overlays onto your facial features.
              </p>
              <div className="border-l-2 border-premium-accent pl-4 my-4 font-normal text-premium-black italic bg-amber-50/30 py-3 pr-3 rounded-r">
                📢 <strong>Biometric Privacy Notice:</strong> No video or photo streams are uploaded, saved, or analysed on Lekya Specs servers. All eye alignment calculations and background removal algorithms run entirely client-side inside your browser engine. The only face shape tag stored is saved directly to your secure user profile settings.
              </div>
            </section>

            <section>
              <h3 className="font-serif text-lg font-bold text-premium-black mb-3">3. How We Protect Your Data</h3>
              <p>
                We use secure JSON Web Tokens (JWT) for user authentication and state protection. Password database storage is encrypted using bcrypt salting. All data transfers between the customer client and the Express.js server utilize TLS/SSL secure protocols.
              </p>
            </section>

            <section>
              <h3 className="font-serif text-lg font-bold text-premium-black mb-3">4. Third-Party Services</h3>
              <p className="mb-2">
                We partner with trusted external systems to power core ecommerce activities:
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li><strong>Turso DB</strong>: Our serverless SQL database client storing encrypted profile records.</li>
                <li><strong>Razorpay</strong>: Complete payment gateway handling credit cards and UPI verification.</li>
                <li><strong>Google SMTP</strong>: Safe delivery of otp verification mails and promotional broadcasts.</li>
              </ul>
            </section>

            <section>
              <h3 className="font-serif text-lg font-bold text-premium-black mb-3">5. Your Consent & Control Rights</h3>
              <p>
                You can review, modify, or delete your account records directly from your account page, or request assistance by contacting our customer care department at <a href="mailto:support@lekyaspecs.com" className="text-premium-accent font-semibold hover:underline">support@lekyaspecs.com</a>.
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
