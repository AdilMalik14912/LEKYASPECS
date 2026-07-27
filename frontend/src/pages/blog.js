const React = require('react');
const { useState } = React;
const Link = require('next/link').default;
const Head = require('next/head').default;
const { BookOpen, Clock, User, ArrowRight, Search } = require('lucide-react');

const BLOG_ARTICLES = [
  {
    id: '1',
    slug: 'face-shape-eyewear-guide-2026',
    title: 'The 2026 Eyewear Guide: How to Choose Frames Matched to Your Face Shape',
    category: 'Optical Guide',
    readTime: '5 min read',
    date: 'July 24, 2026',
    author: 'Dr. Aarav Mehta (Chief Optometrist)',
    image: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&w=800&q=80',
    summary: 'Discover precision fitting secrets for Oval, Square, Round, and Heart face shapes. Learn why frame proportions, bridge widths, and temple angles transform your posture and visual appeal.',
    featured: true
  },
  {
    id: '2',
    slug: 'blue-light-vs-anti-reflective-coating',
    title: 'Blue Light Shield vs. Anti-Reflective Coating: What Your Eyes Actually Need',
    category: 'Lens Tech',
    readTime: '4 min read',
    date: 'July 20, 2026',
    author: 'Priya Sharma (Optical Engineer)',
    image: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=800&q=80',
    summary: 'Spent 8+ hours in front of screens? Understand how 420nm blue wavelength filtering reduces digital eye strain, prevents circadian rhythm disruption, and eliminates screen glare.',
    featured: false
  },
  {
    id: '3',
    slug: 'titanium-vs-acetate-frame-materials',
    title: 'Titanium vs. Japanese Acetate: The Ultimate Frame Material Showdown',
    category: 'Material Science',
    readTime: '6 min read',
    date: 'July 15, 2026',
    author: 'Vikramaditya Roy (Head of Design)',
    image: 'https://images.unsplash.com/photo-1508296695146-257a814070b4?auto=format&fit=crop&w=800&q=80',
    summary: 'Compare aerospace-grade Japanese Beta Titanium against hand-polished Mazzucchelli acetate. Discover why ultra-lightweight frames offer unmatched all-day comfort.',
    featured: false
  },
  {
    id: '4',
    slug: 'sunglasses-uv400-polarization-explained',
    title: 'UV400 vs. Polarized Lenses: Protect Your Eyes From Glare & Sun Damage',
    category: 'Eye Care',
    readTime: '4 min read',
    date: 'July 10, 2026',
    author: 'Dr. Aarav Mehta',
    image: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=800&q=80',
    summary: 'Not all dark lenses protect your retinas. Learn how true 100% UV400 filtering blocks harmful UVA/UVB rays while TAC polarization neutralizes blinding glare from roads & water.',
    featured: false
  },
  {
    id: '5',
    slug: 'how-to-read-eye-prescription-sph-cyl-pd',
    title: 'How to Read Your Eye Prescription: Decoding SPH, CYL, AXIS & Pupillary Distance',
    category: 'Prescription Tips',
    readTime: '5 min read',
    date: 'July 05, 2026',
    author: 'Dr. Aarav Mehta',
    image: 'https://images.unsplash.com/photo-1591076482161-42ce6da69f67?auto=format&fit=crop&w=800&q=80',
    summary: 'Confused by numbers on your doctor’s slip? Master Sphere (SPH), Cylinder (CYL), Axis, and how to accurately measure your Pupillary Distance (PD) at home.',
    featured: false
  }
];

export default function BlogJournal() {
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const categories = ['All', 'Optical Guide', 'Lens Tech', 'Material Science', 'Eye Care', 'Prescription Tips'];

  const filteredArticles = BLOG_ARTICLES.filter(art => {
    const matchesCat = activeCategory === 'All' || art.category === activeCategory;
    const matchesSearch = art.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          art.summary.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const featured = BLOG_ARTICLES.find(art => art.featured) || BLOG_ARTICLES[0];

  return (
    <>
      <Head>
        <title>Optical Journal & Eyewear Style Guides | lekya.in</title>
        <meta name="description" content="Explore expert optical articles, prescription guides, face shape fitting tips, and lens technology breakthroughs from lekya.in." />
      </Head>

      <div className="bg-[#0D0016] text-white min-h-screen pt-24 pb-20 relative overflow-hidden font-sans">
        
        {/* Background Ambient Glow Orbs */}
        <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-[#FAAE62]/10 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute bottom-10 left-10 w-[450px] h-[450px] bg-[#7B22A8]/15 rounded-full blur-[120px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

          {/* PAGE HEADER */}
          <div className="text-center space-y-4 mb-14">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest text-[#FAAE62]" style={{background: 'rgba(250,174,98,0.12)', border: '1px solid rgba(250,174,98,0.3)'}}>
              <BookOpen className="w-3.5 h-3.5" /> lekya.in Journal
            </div>
            <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold text-white tracking-tight">
              Optical Insight & Style Journal
            </h1>
            <p className="text-[#D4C8DC] text-base sm:text-lg max-w-2xl mx-auto font-light leading-relaxed">
              Curated articles on prescription optics, frame geometry, lens coatings, and modern eyewear trends.
            </p>
          </div>

          {/* FEATURED HERO ARTICLE (NAVIGATES TO FULL PAGE ROUTE /blog/[slug]) */}
          {featured && (
            <Link
              href={`/blog/${featured.slug}`}
              className="mb-14 liquid-glass rounded-3xl p-6 sm:p-10 border border-white/15 shadow-2xl backdrop-blur-xl group hover:border-[#FAAE62]/40 transition-all block text-left"
            >
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <span className="px-3 py-1 rounded-full text-xs font-bold uppercase text-[#FAAE62]" style={{background: 'rgba(250,174,98,0.15)', border: '1px solid rgba(250,174,98,0.3)'}}>
                      Featured Story
                    </span>
                    <span className="text-xs text-[#9B7EA8] flex items-center gap-1"><Clock size={13} /> {featured.readTime}</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-serif font-bold text-white group-hover:text-[#FAAE62] transition-colors leading-tight">
                    {featured.title}
                  </h2>
                  <p className="text-white/80 text-sm leading-relaxed font-light">
                    {featured.summary}
                  </p>
                  <div className="flex items-center gap-4 text-xs text-[#9B7EA8] pt-2">
                    <span className="flex items-center gap-1.5 font-semibold text-white"><User size={14} className="text-[#FAAE62]" /> {featured.author}</span>
                    <span>•</span>
                    <span>{featured.date}</span>
                  </div>
                  <div className="pt-2">
                    <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#FAAE62] group-hover:translate-x-1 transition-transform">
                      Read Full Article <ArrowRight size={14} />
                    </span>
                  </div>
                </div>
                <div className="h-64 sm:h-80 rounded-2xl overflow-hidden relative border border-white/15">
                  <img src={featured.image} alt={featured.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                </div>
              </div>
            </Link>
          )}

          {/* SEARCH & CATEGORY FILTER BAR */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-12">
            
            {/* Category Pills */}
            <div className="flex flex-wrap items-center gap-2">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all ${
                    activeCategory === cat
                      ? 'bg-gradient-to-r from-[#D4893F] to-[#FAAE62] text-[#0D0016] shadow-lg'
                      : 'liquid-glass text-white/80 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Search Bar */}
            <div className="relative max-w-xs w-full">
              <input
                type="text"
                placeholder="Search articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-full py-2 pl-4 pr-10 text-xs text-white placeholder-[#9B7EA8] focus:outline-none transition-all"
                style={{background: 'rgba(30,0,48,0.8)', border: '1px solid rgba(74,18,104,0.7)'}}
              />
              <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9B7EA8]" />
            </div>

          </div>

          {/* ARTICLES GRID — ALL LINK DIRECTLY TO FULL PAGE ROUTE /blog/[slug] */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredArticles.map(article => (
              <Link
                key={article.id}
                href={`/blog/${article.slug}`}
                className="liquid-glass rounded-3xl overflow-hidden border border-white/15 shadow-xl hover:border-[#FAAE62]/40 transition-all group flex flex-col justify-between block text-left"
              >
                <div>
                  <div className="h-48 overflow-hidden relative">
                    <img src={article.image} alt={article.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    <span className="absolute top-3 left-3 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider text-black bg-[#FAAE62] shadow-md">
                      {article.category}
                    </span>
                  </div>
                  <div className="p-6 space-y-3">
                    <div className="flex items-center justify-between text-[11px] text-[#9B7EA8]">
                      <span className="flex items-center gap-1"><Clock size={12} /> {article.readTime}</span>
                      <span>{article.date}</span>
                    </div>
                    <h3 className="font-serif text-lg font-bold text-white group-hover:text-[#FAAE62] transition-colors leading-snug line-clamp-2">
                      {article.title}
                    </h3>
                    <p className="text-xs text-white/70 leading-relaxed line-clamp-3 font-light">
                      {article.summary}
                    </p>
                  </div>
                </div>

                <div className="px-6 pb-6 pt-2 flex items-center justify-between border-t border-white/10 text-xs">
                  <span className="text-[#9B7EA8] font-semibold flex items-center gap-1"><User size={13} className="text-[#FAAE62]" /> {article.author.split(' ')[0]}</span>
                  <span className="text-[#FAAE62] font-bold uppercase tracking-wider flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    Read Story <ArrowRight size={13} />
                  </span>
                </div>
              </Link>
            ))}
          </div>

        </div>
      </div>
    </>
  );
}
