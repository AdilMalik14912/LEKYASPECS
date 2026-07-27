const React = require('react');
const Link = require('next/link').default;
const Head = require('next/head').default;
const { useRouter } = require('next/router');
const { ArrowLeft, Clock, User, Calendar, Sparkles, ArrowRight } = require('lucide-react');

const BLOG_ARTICLES_DATA = {
  'lekya-group-companies-vision': {
    slug: 'lekya-group-companies-vision',
    title: 'The Lekya Group Vision: Pioneering Healthcare, Solar Energy, Eyewear & Media Innovation',
    category: 'Group Companies',
    readTime: '6 min read',
    date: 'July 22, 2026',
    author: 'Lekya Corporate Board',
    image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80',
    summary: 'Explore the multi-industry legacy of Lekya Group across sustainable solar power (Lekya Energy), advanced optical care (Lekya Specs & Lekya Vision), health innovations (Lekya Health), and creative media (Lekya Media).',
    contentSections: [
      {
        heading: 'An Empire Built on Purpose, Innovation & Quality',
        text: 'Lekya Group represents a modern Indian conglomerate founded on the conviction that high-technology and uncompromising quality should be accessible to all. Operating across sustainable infrastructure, optical healthcare, digital media, and healthtech, Lekya Group shapes the future of everyday living.'
      },
      {
        heading: '1. Lekya Specs & Lekya Vision (Optical Excellence)',
        text: 'Lekya Specs is redefining how India experiences eyewear. By integrating 3D/2D Virtual Try-On, AI face shape matching, aerospace-grade Beta Titanium, and Italian Mazzucchelli acetate, Lekya Specs brings optical precision directly to customers without traditional retail markups.'
      },
      {
        heading: '2. Lekya Energy (Clean Power & Solar Parks)',
        text: 'Lekya Energy engineers commercial and industrial solar power installations. From rooftop solar plants to mega megawatt solar parks, Lekya Energy leads India’s transition toward zero-carbon sustainable energy.'
      },
      {
        heading: '3. Lekya Health & Lekya Media (Wellness & Creative Tech)',
        text: 'Lekya Health focuses on accessible digital wellness solutions and diagnostic innovation, while Lekya Media crafts high-impact creative storytelling, branding, and multimedia productions.'
      }
    ]
  },
  'behind-the-frames-lekya-team-craftsmanship': {
    slug: 'behind-the-frames-lekya-team-craftsmanship',
    title: 'Behind the Frames: Meet the Master Craftsmen, Optometrists & Design Engineers of Lekya Specs',
    category: 'Lekya Team',
    readTime: '5 min read',
    date: 'July 18, 2026',
    author: 'Vikramaditya Roy (Head of Design)',
    image: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=1200&q=80',
    summary: 'Meet the optometrists, optical designers, and master frame artisans behind every pair of Lekya Specs glasses. From 72-hour acetate polishing to precision custom lens edging.',
    contentSections: [
      {
        heading: 'Craftsmanship Meets High Optical Science',
        text: 'Every pair of glasses crafted at Lekya Specs undergoes a 48-step precision assembly process. Our optical engineers and master frame artisans combine traditional Japanese hand-beveling with computer-guided CNC lens cutting.'
      },
      {
        heading: 'Our Dedicated Optometry Team',
        text: 'Led by senior optometrists, our team ensures every prescription lens is double-verified for pupil alignment (PD), focal accuracy, and zero-distortion peripheral clarity before final dispatch.'
      },
      {
        heading: 'Customer Concierge & Doorstep Care',
        text: 'From personalized frame consultation via WhatsApp to self-service order tracking and doorstep returns, our customer care team works 6 days a week to provide VIP optical support.'
      }
    ]
  },
  'face-shape-eyewear-guide-2026': {
    slug: 'face-shape-eyewear-guide-2026',
    title: 'The 2026 Eyewear Guide: How to Choose Frames Matched to Your Face Shape',
    category: 'Optical Guide',
    readTime: '5 min read',
    date: 'July 24, 2026',
    author: 'Dr. Aarav Mehta (Chief Optometrist)',
    image: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&w=1200&q=80',
    summary: 'Discover precision fitting secrets for Oval, Square, Round, and Heart face shapes. Learn why frame proportions, bridge widths, and temple angles transform your posture and visual appeal.',
    contentSections: [
      {
        heading: 'Why Face Geometry Matters for Prescription & Style',
        text: 'Choosing glasses isn’t just about picking a design you like on a shelf. The shape, width, and bridge height of your frames directly determine where your eyes sit relative to the lens optical center. When frames align perfectly with your facial contours, you experience optimal peripheral clarity and effortless all-day comfort.'
      },
      {
        heading: '1. Oval Face Profiles',
        text: 'Oval faces possess balanced proportions with a soft jawline. Virtually any frame style flatters an oval shape. Bold geometric titanium rectangles, oversized aviators, or retro cat-eye silhouettes add striking artistic contrast without overwhelming your features.'
      },
      {
        heading: '2. Square & Strong Jawlines',
        text: 'To complement angular jawlines and broad foreheads, look for soft round, oval, or teardrop frames. Deep rimmed frames soften facial angles, while ultra-light Japanese Beta Titanium construction eliminates pressure on the nasal bridge.'
      },
      {
        heading: '3. Round Face Profiles',
        text: 'Round facial structures benefit from sharp, angular lines that create visual definition. Rectangular frames, wayfarers, and geometric cat-eyes draw attention upward and make the facial profile appear longer and sleeker.'
      },
      {
        heading: '4. Heart & Diamond Faces',
        text: 'If your forehead is broader than your jawline, rimless or light-colored frames keep the lower facial half balanced. Bottom-heavy aviators and oval acetate frames harmonize wide cheekbones with delicate chin structures.'
      }
    ]
  },
  'blue-light-vs-anti-reflective-coating': {
    slug: 'blue-light-vs-anti-reflective-coating',
    title: 'Blue Light Shield vs. Anti-Reflective Coating: What Your Eyes Actually Need',
    category: 'Lens Tech',
    readTime: '4 min read',
    date: 'July 20, 2026',
    author: 'Priya Sharma (Optical Engineer)',
    image: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=1200&q=80',
    summary: 'Spent 8+ hours in front of screens? Understand how 420nm blue wavelength filtering reduces digital eye strain, prevents circadian rhythm disruption, and eliminates screen glare.',
    contentSections: [
      {
        heading: 'Understanding High-Energy Visible (HEV) Blue Light',
        text: 'Laptops, smartphones, and LED office lighting emit artificial blue light in the 400nm to 450nm spectrum. Extended exposure suppresses natural melatonin production, leading to insomnia, dry eyes, and chronic visual fatigue.'
      },
      {
        heading: 'How Lekya Vision BlueShield Works',
        text: 'Unlike cheap yellow-tinted screen glasses, Lekya Vision BlueShield lenses utilize dual-layer hydrophobic nano-coatings. They selectively filter out 98% of harmful 420nm HEV wavelengths while allowing essential green and amber light to pass through naturally.'
      },
      {
        heading: 'Do You Need Anti-Reflective (AR) Coating?',
        text: 'Anti-Reflective coating eliminates surface reflections caused by overhead office lights and nighttime headlights. Combining AR coating with BlueShield technology creates the ultimate screen and driving lens solution.'
      }
    ]
  },
  'titanium-vs-acetate-frame-materials': {
    slug: 'titanium-vs-acetate-frame-materials',
    title: 'Titanium vs. Japanese Acetate: The Ultimate Frame Material Showdown',
    category: 'Material Science',
    readTime: '6 min read',
    date: 'July 15, 2026',
    author: 'Vikramaditya Roy (Head of Design)',
    image: 'https://images.unsplash.com/photo-1508296695146-257a814070b4?auto=format&fit=crop&w=1200&q=80',
    summary: 'Compare aerospace-grade Japanese Beta Titanium against hand-polished Mazzucchelli acetate. Discover why ultra-lightweight frames offer unmatched all-day comfort.',
    contentSections: [
      {
        heading: 'The Engineering Behind Japanese Beta Titanium',
        text: 'Titanium is celebrated in aerospace engineering for its extraordinary strength-to-weight ratio. Lekya Beta Titanium frames weigh under 12 grams. They are hypoallergenic, flexible, and completely resistant to corrosion from sweat or humidity.'
      },
      {
        heading: 'The Art of Italian & Japanese Acetate',
        text: 'Unlike mass-produced petroleum plastics, Mazzucchelli cotton-based acetate is hand-polished over 72 hours. It delivers deep organic colors, rich tortoiseshell patterns, and warm tactile feeling against the skin.'
      },
      {
        heading: 'Which Material Is Right For You?',
        text: 'If you prioritize invisible lightness and minimalist executive elegance, choose Beta Titanium. If you love bold fashion statements, vibrant colors, and vintage thickness, choose Handcrafted Acetate.'
      }
    ]
  },
  'sunglasses-uv400-polarization-explained': {
    slug: 'sunglasses-uv400-polarization-explained',
    title: 'UV400 vs. Polarized Lenses: Protect Your Eyes From Glare & Sun Damage',
    category: 'Eye Care',
    readTime: '4 min read',
    date: 'July 10, 2026',
    author: 'Dr. Aarav Mehta',
    image: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=1200&q=80',
    summary: 'Not all dark lenses protect your retinas. Learn how true 100% UV400 filtering blocks harmful UVA/UVB rays while TAC polarization neutralizes blinding glare from roads & water.',
    contentSections: [
      {
        heading: 'Why Dark Lenses Without UV Protection Are Dangerous',
        text: 'Dark sunglasses cause your pupils to dilate. If those lenses lack certified UV protection, harmful ultraviolet rays penetrate deeper into your crystalline lens and retina, accelerating risk of cataracts.'
      },
      {
        heading: 'The Polarized TAC Advantage',
        text: 'Polarized TAC lenses contain a special vertical filter that blocks horizontal reflected light glare from asphalt, snow, and water surfaces. The result is crystal-clear color contrast and zero squinting.'
      }
    ]
  },
  'how-to-read-eye-prescription-sph-cyl-pd': {
    slug: 'how-to-read-eye-prescription-sph-cyl-pd',
    title: 'How to Read Your Eye Prescription: Decoding SPH, CYL, AXIS & Pupillary Distance',
    category: 'Prescription Tips',
    readTime: '5 min read',
    date: 'July 05, 2026',
    author: 'Dr. Aarav Mehta',
    image: 'https://images.unsplash.com/photo-1591076482161-42ce6da69f67?auto=format&fit=crop&w=1200&q=80',
    summary: 'Confused by numbers on your doctor’s slip? Master Sphere (SPH), Cylinder (CYL), Axis, and how to accurately measure your Pupillary Distance (PD) at home.',
    contentSections: [
      {
        heading: 'Understanding Your Prescription Card (OD vs OS)',
        text: 'OD stands for Oculus Dexter (Right Eye) and OS stands for Oculus Sinister (Left Eye). SPH (Sphere) indicates nearsightedness (minus sign -) or farsightedness (plus sign +).'
      },
      {
        heading: 'What Is Cylinder (CYL) & AXIS for Astigmatism?',
        text: 'CYL measures the amount of lens power needed to correct astigmatism (irregularly curved cornea). AXIS (from 1 to 180 degrees) specifies the exact angle orientation where the astigmatism correction is placed.'
      },
      {
        heading: 'Why Pupillary Distance (PD) Is Crucial for Online Ordering',
        text: 'Pupillary Distance (PD) is the distance in millimeters between the centers of your two pupils. Accurate PD ensures the optical center of your custom prescription lenses lines up exactly with your pupil line for zero distortion.'
      }
    ]
  }
};

export default function ArticleDetail() {
  const router = useRouter();
  const { slug } = router.query;

  const article = BLOG_ARTICLES_DATA[slug] || BLOG_ARTICLES_DATA['face-shape-eyewear-guide-2026'];

  return (
    <>
      <Head>
        <title>{article.title} | lekya.in Journal</title>
        <meta name="description" content={article.summary} />
        <link rel="canonical" href={`https://lekya.in/blog/${article.slug}`} />
        <meta property="og:title" content={article.title} />
        <meta property="og:description" content={article.summary} />
        <meta property="og:image" content={article.image} />
        <meta property="og:type" content="article" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "BlogPosting",
              "headline": article.title,
              "image": [article.image],
              "datePublished": "2026-07-24T08:00:00+05:30",
              "dateModified": "2026-07-27T08:00:00+05:30",
              "author": [{
                "@type": "Person",
                "name": article.author,
                "url": "https://lekya.in/about"
              }],
              "publisher": {
                "@type": "Organization",
                "name": "Lekya Specs",
                "logo": {
                  "@type": "ImageObject",
                  "url": "https://lekya.in/lekya_logo.png"
                }
              },
              "description": article.summary
            })
          }}
        />
      </Head>

      <div className="bg-[#0D0016] text-white min-h-screen pt-24 pb-24 relative overflow-hidden font-sans">
        
        {/* Background Ambient Glow Orbs */}
        <div className="absolute top-0 left-1/3 w-[600px] h-[600px] bg-[#FAAE62]/10 rounded-full blur-[160px] pointer-events-none" />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

          {/* BACK TO ALL ARTICLES BUTTON */}
          <div className="mb-8">
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full liquid-glass text-xs font-bold uppercase tracking-wider text-white hover:text-[#FAAE62] border border-white/15 shadow-lg transition-all hover:bg-white/10"
            >
              <ArrowLeft className="w-4 h-4 text-[#FAAE62]" /> Back to All Articles
            </Link>
          </div>

          {/* ARTICLE METADATA HEADER */}
          <div className="space-y-6 mb-10">
            <div className="flex flex-wrap items-center gap-3">
              <span className="px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-widest text-[#FAAE62]" style={{background: 'rgba(250,174,98,0.15)', border: '1px solid rgba(250,174,98,0.3)'}}>
                {article.category}
              </span>
              <span className="text-xs text-[#9B7EA8] flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-[#FAAE62]" /> {article.readTime}
              </span>
            </div>

            <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-[1.18] tracking-tight">
              {article.title}
            </h1>

            <div className="flex items-center gap-3 text-xs text-[#9B7EA8] pt-2 border-b border-white/15 pb-6">
              <span className="flex items-center gap-2 font-semibold text-white">
                <User className="w-4 h-4 text-[#FAAE62]" /> {article.author}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-[#FAAE62]" /> {article.date}
              </span>
            </div>
          </div>

          {/* FEATURED HERO IMAGE */}
          <div className="mb-12 rounded-3xl overflow-hidden border border-white/15 shadow-2xl relative h-72 sm:h-96 lg:h-[450px]">
            <img src={article.image} alt={article.title} className="w-full h-full object-cover" />
          </div>

          {/* ARTICLE SUMMARY HIGHLIGHT BOX */}
          <div className="liquid-glass rounded-2xl p-6 sm:p-8 mb-12 border border-[#FAAE62]/30 backdrop-blur-xl shadow-xl" style={{background: 'rgba(30,0,48,0.6)'}}>
            <p className="text-base sm:text-lg text-[#FEF6EE] font-serif italic leading-relaxed">
              "{article.summary}"
            </p>
          </div>

          {/* ARTICLE CONTENT SECTIONS */}
          <div className="space-y-10 text-white/90 leading-relaxed font-light text-base">
            {article.contentSections.map((sec, idx) => (
              <div key={idx} className="space-y-4">
                <h2 className="font-serif text-2xl font-bold text-white text-left pt-2 border-l-2 border-[#FAAE62] pl-4">
                  {sec.heading}
                </h2>
                <p className="text-white/85 text-sm sm:text-base leading-relaxed">
                  {sec.text}
                </p>
              </div>
            ))}
          </div>

          {/* EXPLORE COLLECTION CTA BOX */}
          <div className="mt-16 liquid-glass rounded-3xl p-8 sm:p-10 text-center border border-white/15 shadow-2xl backdrop-blur-xl relative overflow-hidden" style={{background: 'rgba(30,0,48,0.7)'}}>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest text-[#FAAE62] mb-4" style={{background: 'rgba(250,174,98,0.12)', border: '1px solid rgba(250,174,98,0.3)'}}>
              <Sparkles className="w-3.5 h-3.5" /> Experience Optical Excellence
            </div>
            <h3 className="font-serif text-2xl sm:text-3xl font-bold text-white mb-3">
              Ready to Upgrade Your Eyewear Experience?
            </h3>
            <p className="text-xs sm:text-sm text-[#D4C8DC] max-w-lg mx-auto mb-6 font-light">
              Explore our handcrafted Titanium & Italian Acetate collection with custom prescription lenses and virtual 2D Try-On Studio.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/shop"
                className="bg-gradient-to-r from-[#D4893F] to-[#FAAE62] text-[#0D0016] text-xs font-extrabold uppercase tracking-widest px-8 py-3.5 rounded-full hover:scale-105 transition-all shadow-xl flex items-center gap-2"
              >
                Shop Collection <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/tryon"
                className="liquid-glass text-white text-xs font-bold uppercase tracking-widest px-8 py-3.5 rounded-full border border-white/15 hover:bg-white/15 transition-all"
              >
                Launch Virtual Studio
              </Link>
            </div>
          </div>

          {/* BACK TO BLOG BOTTOM BAR */}
          <div className="mt-12 text-center pt-8 border-t border-white/15">
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#FAAE62] hover:underline"
            >
              <ArrowLeft className="w-4 h-4" /> View All Journal Articles
            </Link>
          </div>

        </div>
      </div>
    </>
  );
}
