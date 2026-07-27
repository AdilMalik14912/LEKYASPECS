const React = require('react');
const { useEffect, useRef } = React;
const Link = require('next/link').default;
const Head = require('next/head').default;
const { ArrowLeft, Landmark, Scale, FileText, ClipboardList, RefreshCw, Star } = require('lucide-react');

function useSectionHighlight() {
  const containerRef = useRef(null);
  useEffect(() => {
    if (!containerRef.current) return;
    const sections = containerRef.current.querySelectorAll('[data-policy-section]');
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.target.classList.toggle('in-view', e.isIntersecting)),
      { threshold: 0.2, rootMargin: '-60px 0px' }
    );
    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, []);
  return containerRef;
}

export default function TermsOfService() {
  const containerRef = useSectionHighlight();
  return (
    <>
      <Head>
        <title>Terms of Service — lekya.in</title>
        <meta name="description" content="Read Lekya Specs Terms of Service. Learn about order cancellations, shipping timelines, prescription configurations, and return policies." />
      </Head>

      <div className="bg-premium-black min-h-screen py-16 px-4 sm:px-6 lg:px-8 text-premium-dark font-sans">
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
              <Scale className="w-8 h-8 text-premium-accent" />
              <span className="text-xs uppercase tracking-widest text-premium-gray font-bold">Lekya Agreement Guidelines</span>
            </div>
            <h1 className="font-serif text-4xl sm:text-5xl font-bold text-premium-black tracking-tight">
              Terms of Service
            </h1>
            <p className="text-xs text-premium-gray font-medium mt-3">
              Effective Date: July 05, 2026
            </p>
          </div>

          {/* Quick summary grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-12">
            <div className="border border-premium-accent/20 bg-white/40 backdrop-blur p-5 rounded-lg shadow-sm">
              <ClipboardList className="w-5 h-5 text-premium-accent mb-3" />
              <h4 className="font-serif font-bold text-sm text-premium-black mb-1">Prescription Orders</h4>
              <p className="text-[11px] text-premium-gray leading-relaxed font-light">
                Prescription specs are customized to individual metrics. Please verify values before completing checkout.
              </p>
            </div>
            <div className="border border-premium-accent/20 bg-white/40 backdrop-blur p-5 rounded-lg shadow-sm">
              <RefreshCw className="w-5 h-5 text-premium-accent mb-3" />
              <h4 className="font-serif font-bold text-sm text-premium-black mb-1">Cancellations</h4>
              <p className="text-[11px] text-premium-gray leading-relaxed font-light">
                Custom lens prescriptions cannot be cancelled once customization starts. Frame-only orders can be cancelled within 2 hours.
              </p>
            </div>
            <div className="border border-premium-accent/20 bg-white/40 backdrop-blur p-5 rounded-lg shadow-sm">
              <Star className="w-5 h-5 text-premium-accent mb-3" />
              <h4 className="font-serif font-bold text-sm text-premium-black mb-1">Rewards Rules</h4>
              <p className="text-[11px] text-premium-gray leading-relaxed font-light">
                Rewards and referral points can be redeemed up to 30% of order totals. Referral points vest after order dispatch.
              </p>
            </div>
          </div>

          {/* Detailed sections */}
          <div ref={containerRef} className="space-y-10 text-sm leading-relaxed text-premium-gray font-light">
            
            <section className="policy-section" data-policy-section>
              <h3 className="font-serif text-lg font-bold text-premium-black mb-3">1. Acceptance of Terms</h3>
              <p>
                By creating an account, browsing our eyewear catalog, or completing purchases at Lekya Specs, you agree to be bound by these Terms of Service. If you do not accept these rules, please discontinue use.
              </p>
            </section>

            <section className="policy-section" data-policy-section>
              <h3 className="font-serif text-lg font-bold text-premium-black mb-3">2. Account Registration & Verifications</h3>
              <p>
                To complete orders or join the Specs Rewards Club, you must verify your account using our one-time OTP codes sent via email or SMS. You are responsible for safeguarding your session authentication tokens.
              </p>
            </section>

            <section className="policy-section" data-policy-section>
              <h3 className="font-serif text-lg font-bold text-premium-black mb-3">3. Prescription Eyewear Customization</h3>
              <p className="mb-2">
                Lekya Specs crafts high-quality prescription lenses tailored strictly to parameters inputted during purchase (sphere, cylinder, axis, index index, coatings). 
              </p>
              <ul className="list-disc pl-5 space-y-1.5">
                <li>You warrant that all submitted numeric values match a current, valid prescription issued by a licensed optician.</li>
                <li>Lekya Specs is not liable for vision discomfort caused by incorrect manual entries.</li>
              </ul>
            </section>

            <section className="policy-section" data-policy-section>
              <h3 className="font-serif text-lg font-bold text-premium-black mb-3">4. Pricing, Payments & Razorpay Transaction Rules</h3>
              <p>
                All pricing listed on the storefront is in Indian Rupees (INR) and inclusive of taxes where indicated. Payments are processed securely via Razorpay PCI-compliant gateways. We authorize payments at checkout, and orders are confirmed once payment captures successfully.
              </p>
            </section>

            <section className="policy-section" data-policy-section>
              <h3 className="font-serif text-lg font-bold text-premium-black mb-3">5. Delivery, Dispatch and Logistics Timelines</h3>
              <p className="mb-2">
                We strive to fulfill and dispatch frames swiftly. The following timelines apply:
              </p>
              <ul className="list-disc pl-5 space-y-1.5">
                <li><strong>Non-prescription/Frame-only orders</strong>: Dispatched within 24–48 working hours.</li>
                <li><strong>Custom Prescription orders</strong>: Lens cutting and coating parameters require 3–5 processing days prior to shipping.</li>
                <li>Live dispatch airway bill updates and tracking comments will be logged in your Account Dashboard profile as updates occur.</li>
              </ul>
            </section>

            <section className="policy-section" data-policy-section>
              <h3 className="font-serif text-lg font-bold text-premium-black mb-3">6. Returns, Replacements & Refund Policy</h3>
              <p className="mb-2">
                Your satisfaction is paramount. Our return terms are structured as follows:
              </p>
              <ul className="list-disc pl-5 space-y-1.5">
                <li><strong>Frames</strong>: Eligible for exchange or refund within 7 days of delivery, provided they are in brand-new, unworn condition with original packaging.</li>
                <li><strong>Lenses</strong>: Custom-cut prescription lenses are not eligible for refunds. If there is a manufacturing defect, we will replace the lenses free of charge.</li>
              </ul>
            </section>

            <section className="policy-section" data-policy-section>
              <h3 className="font-serif text-lg font-bold text-premium-black mb-3">7. Specs Rewards Club & Referral Rules</h3>
              <p>
                Loyalty points are granted upon order confirmation and vest following order dispatch. Points can be redeemed for promotional discounts up to 30% of total cart amounts. Exploiting referral verification pipelines (e.g. self-referral checks) will result in immediate termination of points and account suspensions.
              </p>
            </section>

            <section className="policy-section" data-policy-section>
              <h3 className="font-serif text-lg font-bold text-premium-black mb-3">8. AI Studio webcam consent</h3>
              <p>
                Use of the Virtual Try-On Studio requires browser camera permissions. Webcam video frames are processed strictly client-side to overlay SVG eyewear shapes. No image records are saved globally or on servers unless you explicitly click the "Download PNG" button to export a try-on file.
              </p>
            </section>

            <section className="policy-section" data-policy-section>
              <h3 className="font-serif text-lg font-bold text-premium-black mb-3">9. Intellectual Property & Brand Rights</h3>
              <p>
                Lekya Specs, including its typography patterns, custom interactive try-on modules, lookbooks, design shapes, and stylesheets, remains the exclusive property of Lekya Specs. Unauthorized scraping or distribution is prohibited.
              </p>
            </section>

            <section className="policy-section" data-policy-section>
              <h3 className="font-serif text-lg font-bold text-premium-black mb-3">10. Contact Information</h3>
              <p>
                For questions regarding prescription compliance, shipping delays, or system policies, please open a contact query or email us at <a href="mailto:support@lekyaspecs.in" className="text-premium-accent font-semibold hover:underline">support@lekyaspecs.in</a>.
              </p>
            </section>

          </div>

        </div>
      </div>
    </>
  );
}
