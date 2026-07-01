const React = require('react');
const { useState } = React;
const Link = require('next/link').default;
const { Eye, Info, ChevronRight, Sparkles, CheckCircle2, AlertTriangle } = require('lucide-react');

const LENS_TYPES = [
  {
    id: 'sv_distance',
    name: 'Single Vision — Distance',
    desc: 'For myopia (nearsightedness). Used for driving, watching TV, everyday distance vision.',
    icon: '🔭',
    bestFor: 'SPH between -0.25 to -20.00',
    coatings: ['Anti-Reflection', 'UV400 Protection', 'Blue-light filter'],
    thickness: 'Standard 1.56 or ultra-thin 1.74 for high powers',
  },
  {
    id: 'sv_reading',
    name: 'Single Vision — Reading',
    desc: 'For hyperopia (farsightedness) or presbyopia. Clear close-up vision for reading.',
    icon: '📖',
    bestFor: 'SPH between +0.25 to +8.00',
    coatings: ['Anti-Reflection', 'Blue-light filter (for screens)'],
    thickness: 'Standard lenses for most prescriptions',
  },
  {
    id: 'bifocal',
    name: 'Bifocal Lenses',
    desc: 'Two optical zones — distance on top, reading at bottom. Visible line separates zones.',
    icon: '👓',
    bestFor: 'Presbyopia with both near and far correction needed',
    coatings: ['Anti-Reflection', 'Hard Coat', 'UV Protection'],
    thickness: 'Varies by prescription power',
  },
  {
    id: 'progressive',
    name: 'Progressive (No-Line Bifocal)',
    desc: 'Modern replacement for bifocals. Seamless transition from distance to intermediate to near.',
    icon: '🌊',
    bestFor: 'Presbyopia, ages 40+, professional use',
    coatings: ['Premium Anti-Reflection', 'Oleophobic Coat', 'UV400'],
    thickness: 'Premium 1.60 or 1.74 recommended',
  },
  {
    id: 'bluelight',
    name: 'Blue-Light Blocking',
    desc: 'Filters harmful blue light from screens. Reduces digital eye strain, headaches, and sleep disruption.',
    icon: '💻',
    bestFor: '6+ hours of screen time daily. Can be added to any prescription.',
    coatings: ['Blue-light filter', 'Anti-Reflection', 'Anti-Glare'],
    thickness: 'Available in all index options',
  },
  {
    id: 'photochromic',
    name: 'Photochromic (Transitions)',
    desc: 'Automatically darken in sunlight and clear indoors. One pair for all lighting conditions.',
    icon: '☀️',
    bestFor: 'Outdoor use, driving, frequent transitions between indoors and outdoors',
    coatings: ['UV400', 'Anti-Reflection', 'Scratch Resistant'],
    thickness: 'Standard and thin index options',
  },
];

const POWER_GUIDE = [
  { range: '0 to -2.00', label: 'Mild', color: 'green', rec: 'Standard 1.56 index — affordable and lightweight.' },
  { range: '-2.25 to -4.00', label: 'Moderate', color: 'yellow', rec: '1.60 index recommended for thinner, lighter lenses.' },
  { range: '-4.25 to -6.00', label: 'High', color: 'orange', rec: '1.67 index for noticeably thinner lenses.' },
  { range: '-6.25 and above', label: 'Very High', color: 'red', rec: '1.74 ultra-thin index strongly recommended.' },
];

export default function LensGuide() {
  const [sph, setSph] = useState('');
  const [cyl, setCyl] = useState('');
  const [add, setAdd] = useState('');
  const [selectedLens, setSelectedLens] = useState(null);
  const [recommendation, setRecommendation] = useState(null);

  const getPowerLevel = (sphereVal) => {
    const val = Math.abs(parseFloat(sphereVal) || 0);
    if (val <= 2.00) return POWER_GUIDE[0];
    if (val <= 4.00) return POWER_GUIDE[1];
    if (val <= 6.00) return POWER_GUIDE[2];
    return POWER_GUIDE[3];
  };

  const getAutoRecommendation = () => {
    const sphereVal = parseFloat(sph) || 0;
    const addVal = parseFloat(add) || 0;

    if (addVal >= 0.75) return 'progressive'; // Has ADD power = needs progressives
    if (sphereVal > 0) return 'sv_reading';   // Positive sphere = hyperopia/reading
    if (sphereVal < 0) return 'sv_distance';  // Negative sphere = myopia/distance
    return 'bluelight';                        // No prescription = blue-light only
  };

  const handleAnalyze = () => {
    const autoRec = getAutoRecommendation();
    setRecommendation(autoRec);
    setSelectedLens(autoRec);
  };

  const powerLevel = sph ? getPowerLevel(sph) : null;
  const powerColors = {
    green: 'bg-green-100 text-green-700 border-green-200',
    yellow: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    orange: 'bg-orange-100 text-orange-700 border-orange-200',
    red: 'bg-red-100 text-red-700 border-red-200',
  };

  return (
    <div className="bg-premium-light min-h-screen py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-1.5 bg-premium-accent/15 border border-premium-accent/40 text-premium-golddark px-3 py-1 rounded text-xs font-bold uppercase tracking-wider mb-4">
            <Eye className="w-3.5 h-3.5" /> Prescription Guide
          </div>
          <h1 className="font-serif text-3xl sm:text-5xl font-bold text-premium-black tracking-tight mb-2">
            Find Your Perfect Lens
          </h1>
          <p className="text-sm text-premium-gray font-light max-w-lg mx-auto">
            Enter your prescription details below and we'll recommend the right lens type and index for your eyes.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">

          {/* Left: Prescription Input */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white border border-premium-border rounded-lg p-6 shadow-sm">
              <h2 className="font-serif text-lg font-bold text-premium-black mb-4 flex items-center gap-2">
                <Eye className="w-5 h-5 text-premium-accent" /> Enter Prescription
              </h2>

              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-premium-gray font-semibold mb-1.5">
                    SPH (Sphere) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.25"
                    value={sph}
                    onChange={e => setSph(e.target.value)}
                    placeholder="e.g. -2.50 or +1.75"
                    className="w-full bg-premium-light border border-premium-border rounded p-3 text-sm focus:outline-none focus:border-premium-accent text-premium-dark font-medium"
                  />
                  <p className="text-[10px] text-premium-gray mt-1">Negative = nearsighted, Positive = farsighted</p>
                </div>

                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-premium-gray font-semibold mb-1.5">
                    CYL (Cylinder) — Astigmatism
                  </label>
                  <input
                    type="number"
                    step="0.25"
                    value={cyl}
                    onChange={e => setCyl(e.target.value)}
                    placeholder="e.g. -0.75 (leave blank if none)"
                    className="w-full bg-premium-light border border-premium-border rounded p-3 text-sm focus:outline-none focus:border-premium-accent text-premium-dark font-medium"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-premium-gray font-semibold mb-1.5">
                    ADD Power (Reading Addition)
                  </label>
                  <input
                    type="number"
                    step="0.25"
                    min="0"
                    value={add}
                    onChange={e => setAdd(e.target.value)}
                    placeholder="e.g. +2.00 (presbyopia only)"
                    className="w-full bg-premium-light border border-premium-border rounded p-3 text-sm focus:outline-none focus:border-premium-accent text-premium-dark font-medium"
                  />
                </div>
              </div>

              {/* Power Level Indicator */}
              {powerLevel && (
                <div className={`border rounded p-3 mb-5 text-xs font-semibold ${powerColors[powerLevel.color]}`}>
                  <div className="font-bold mb-0.5">Power Level: {powerLevel.label} ({powerLevel.range})</div>
                  <div className="font-normal opacity-80">{powerLevel.rec}</div>
                </div>
              )}

              <button
                onClick={handleAnalyze}
                disabled={!sph}
                className="w-full bg-premium-black text-white hover:bg-premium-accent hover:text-premium-black font-bold text-xs tracking-widest uppercase py-3.5 rounded transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4" /> Analyze My Prescription
              </button>
            </div>

            {/* Disclaimer */}
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-amber-800 mb-1">Always consult your optometrist</p>
                <p className="text-[10px] text-amber-700 leading-relaxed">This guide provides general educational information only. For accurate lens prescriptions, always get examined by a licensed eye care professional.</p>
              </div>
            </div>
          </div>

          {/* Right: Lens Type Cards */}
          <div className="lg:col-span-3">
            <h2 className="font-serif text-xl font-bold text-premium-black mb-5">
              {recommendation ? '✓ Recommended for You' : 'Explore Lens Types'}
            </h2>
            <div className="space-y-4">
              {LENS_TYPES.map((lens) => {
                const isRecommended = recommendation === lens.id;
                const isSelected = selectedLens === lens.id;

                return (
                  <button
                    key={lens.id}
                    onClick={() => setSelectedLens(isSelected ? null : lens.id)}
                    className={`w-full text-left border-2 rounded-lg p-5 transition-all ${
                      isRecommended
                        ? 'border-premium-black bg-premium-black text-white shadow-lg'
                        : isSelected
                        ? 'border-premium-accent bg-premium-accent/10'
                        : 'border-premium-border bg-white hover:border-premium-accent/50'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 flex-grow">
                        <span className="text-2xl">{lens.icon}</span>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className={`font-bold text-sm ${isRecommended ? 'text-white' : 'text-premium-black'}`}>
                              {lens.name}
                            </h3>
                            {isRecommended && (
                              <span className="bg-premium-accent text-premium-black text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded">
                                Recommended
                              </span>
                            )}
                          </div>
                          <p className={`text-xs leading-relaxed ${isRecommended ? 'text-white/80' : 'text-premium-gray'}`}>
                            {lens.desc}
                          </p>
                        </div>
                      </div>
                      {isRecommended ? <CheckCircle2 className="w-5 h-5 text-premium-accent shrink-0" /> : <ChevronRight className="w-4 h-4 text-premium-gray shrink-0 mt-1" />}
                    </div>

                    {isSelected && (
                      <div className={`mt-4 pt-4 border-t ${isRecommended ? 'border-white/20' : 'border-premium-border'} space-y-2`}>
                        <div>
                          <p className={`text-[10px] uppercase tracking-wider font-bold mb-1 ${isRecommended ? 'text-white/60' : 'text-premium-gray'}`}>Best For</p>
                          <p className={`text-xs ${isRecommended ? 'text-white/90' : 'text-premium-dark'}`}>{lens.bestFor}</p>
                        </div>
                        <div>
                          <p className={`text-[10px] uppercase tracking-wider font-bold mb-1 ${isRecommended ? 'text-white/60' : 'text-premium-gray'}`}>Recommended Coatings</p>
                          <div className="flex flex-wrap gap-1.5">
                            {lens.coatings.map(c => (
                              <span key={c} className={`text-[10px] px-2 py-0.5 rounded font-semibold ${isRecommended ? 'bg-white/15 text-white' : 'bg-premium-light border border-premium-border text-premium-dark'}`}>
                                {c}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div>
                          <p className={`text-[10px] uppercase tracking-wider font-bold mb-1 ${isRecommended ? 'text-white/60' : 'text-premium-gray'}`}>Lens Thickness</p>
                          <p className={`text-xs ${isRecommended ? 'text-white/90' : 'text-premium-dark'}`}>{lens.thickness}</p>
                        </div>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {recommendation && (
              <div className="mt-6 p-5 bg-premium-accent/10 border border-premium-accent/30 rounded-lg text-center">
                <p className="text-sm font-semibold text-premium-black mb-3">
                  Ready to order with the right lenses?
                </p>
                <Link
                  href="/shop"
                  className="inline-flex items-center gap-2 bg-premium-black text-white hover:bg-premium-accent hover:text-premium-black font-bold text-xs tracking-widest uppercase px-8 py-3 rounded transition-all"
                >
                  Browse Compatible Frames <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
