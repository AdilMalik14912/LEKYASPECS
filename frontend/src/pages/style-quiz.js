const React = require('react');
const { useState } = React;
const Link = require('next/link').default;
const { useRouter } = require('next/router');
const { Sparkles, ArrowRight, ArrowLeft, CheckCircle2, Glasses, Sun, Briefcase, Heart, Zap, Mountain } = require('lucide-react');

const QUIZ_STEPS = [
  {
    id: 'lifestyle',
    question: "What best describes your daily lifestyle?",
    subtitle: "This helps us find frames that match your everyday needs.",
    options: [
      { value: 'professional', label: 'Corporate & Professional', desc: 'Office meetings, client presentations', icon: '💼' },
      { value: 'creative', label: 'Creative & Artistic', desc: 'Studio work, design, expression', icon: '🎨' },
      { value: 'active', label: 'Active & Outdoorsy', desc: 'Sports, travel, adventures', icon: '🏔️' },
      { value: 'casual', label: 'Casual & Relaxed', desc: 'Day-to-day comfort, social hangouts', icon: '☕' },
    ]
  },
  {
    id: 'style_vibe',
    question: "Choose your style personality:",
    subtitle: "Your aesthetic preference guides our frame curation.",
    options: [
      { value: 'classic', label: 'Classic & Timeless', desc: 'Never go out of style', icon: '🎩' },
      { value: 'bold', label: 'Bold & Statement', desc: 'Stand out in every room', icon: '✨' },
      { value: 'minimal', label: 'Minimal & Clean', desc: 'Less is more', icon: '⬜' },
      { value: 'trendy', label: 'Trendy & Fashion-forward', desc: 'Always on the latest wave', icon: '🔥' },
    ]
  },
  {
    id: 'frame_material',
    question: "What material appeals to you most?",
    subtitle: "Materials affect comfort, weight, and durability.",
    options: [
      { value: 'acetate', label: 'Acetate Plastic', desc: 'Rich colors, lightweight, bold patterns', icon: '🌈' },
      { value: 'metal', label: 'Metal / Titanium', desc: 'Sleek, strong, ultra-thin profiles', icon: '⚙️' },
      { value: 'mixed', label: 'Mixed Materials', desc: 'Best of both worlds', icon: '🔗' },
      { value: 'flexible', label: 'Flexible / Sporty', desc: 'Rubber tips, active use', icon: '💪' },
    ]
  },
  {
    id: 'priority',
    question: "What matters most when choosing specs?",
    subtitle: "We prioritize recommendations based on what's important to you.",
    options: [
      { value: 'comfort', label: 'Comfort above all', desc: 'Lightweight, fits perfectly all day', icon: '😌' },
      { value: 'style', label: 'Style & aesthetics', desc: 'It has to look absolutely stunning', icon: '💅' },
      { value: 'durability', label: 'Durability & value', desc: 'Built to last, worth every rupee', icon: '🛡️' },
      { value: 'versatility', label: 'Versatility', desc: 'Works for office, gym, and evenings', icon: '🔄' },
    ]
  },
  {
    id: 'budget',
    question: "What's your comfortable budget range?",
    subtitle: "We have premium options across all price points.",
    options: [
      { value: 'budget', label: 'Under ₹2,000', desc: 'Smart value picks', icon: '💚' },
      { value: 'mid', label: '₹2,000 – ₹5,000', desc: 'Premium quality mid-range', icon: '💛' },
      { value: 'premium', label: '₹5,000 – ₹10,000', desc: 'Luxury craftsmanship', icon: '🧡' },
      { value: 'luxury', label: 'No limit — best only', desc: 'The finest we carry', icon: '💎' },
    ]
  }
];

// Maps quiz answers to product recommendations
const getRecommendationQuery = (answers) => {
  const params = new URLSearchParams();
  
  // Map lifestyle to category preference
  if (answers.lifestyle === 'active') params.set('category', 'Sunglasses');
  else params.set('category', 'Eyeglasses');
  
  // Map style vibe to frame shape
  if (answers.style_vibe === 'classic') params.set('shape', 'Rectangle');
  else if (answers.style_vibe === 'bold') params.set('shape', 'Square');
  else if (answers.style_vibe === 'minimal') params.set('shape', 'Oval');
  else if (answers.style_vibe === 'trendy') params.set('shape', 'Round');
  
  // Budget mapping
  if (answers.budget === 'budget') { params.set('minPrice', '0'); params.set('maxPrice', '2000'); }
  else if (answers.budget === 'mid') { params.set('minPrice', '2000'); params.set('maxPrice', '5000'); }
  else if (answers.budget === 'premium') { params.set('minPrice', '5000'); params.set('maxPrice', '10000'); }
  
  return params.toString();
};

export default function StyleQuiz() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [selectedOption, setSelectedOption] = useState(null);
  const [completed, setCompleted] = useState(false);

  const step = QUIZ_STEPS[currentStep];
  const progress = ((currentStep) / QUIZ_STEPS.length) * 100;

  const handleSelect = (value) => {
    setSelectedOption(value);
  };

  const handleNext = () => {
    if (!selectedOption) return;
    const newAnswers = { ...answers, [step.id]: selectedOption };
    setAnswers(newAnswers);
    setSelectedOption(null);

    if (currentStep < QUIZ_STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      setCompleted(true);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
      setSelectedOption(answers[QUIZ_STEPS[currentStep - 1].id] || null);
    }
  };

  const handleViewResults = () => {
    const query = getRecommendationQuery(answers);
    router.push(`/shop?${query}`);
  };

  // Result personality profile
  const getPersonalityProfile = () => {
    const { style_vibe, lifestyle, priority } = answers;
    if (style_vibe === 'classic' && lifestyle === 'professional') return { name: 'The Executive', emoji: '👔', desc: 'Refined, authoritative, timeless. You value precision and craft.' };
    if (style_vibe === 'bold') return { name: 'The Icon', emoji: '✨', desc: 'Fearless, expressive, magnetic. You wear specs as art.' };
    if (style_vibe === 'minimal') return { name: 'The Purist', emoji: '⬜', desc: 'Quietly confident, uncluttered, intentional. Quality over quantity.' };
    if (lifestyle === 'active') return { name: 'The Explorer', emoji: '🏔️', desc: 'Adventurous, outdoorsy, always in motion.' };
    if (style_vibe === 'trendy') return { name: 'The Trendsetter', emoji: '🔥', desc: 'Fashion-forward, culturally tuned, first to discover new styles.' };
    return { name: 'The Connoisseur', emoji: '💎', desc: 'Discerning, well-rounded, appreciates fine craftsmanship.' };
  };

  return (
    <div className="bg-premium-black min-h-screen py-12">
      <div className="max-w-2xl mx-auto px-4 sm:px-6">
        
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-1.5 bg-premium-accent/15 border border-premium-accent/40 text-premium-golddark px-3 py-1 rounded text-xs font-bold uppercase tracking-wider mb-4">
            <Sparkles className="w-3.5 h-3.5" /> Eyewear Style Quiz
          </div>
          <h1 className="font-serif text-3xl sm:text-5xl font-bold text-premium-black tracking-tight mb-2">
            Discover Your<br/>Perfect Frame
          </h1>
          <p className="text-sm text-premium-gray font-light">
            5 quick questions · Personalized recommendations · 60 seconds
          </p>
        </div>

        {!completed ? (
          <div className="bg-white border border-premium-border rounded-lg shadow-sm p-6 sm:p-10">
            
            {/* Progress Bar */}
            <div className="mb-8">
              <div className="flex justify-between text-[10px] text-premium-gray font-bold uppercase tracking-wider mb-2">
                <span>Question {currentStep + 1} of {QUIZ_STEPS.length}</span>
                <span>{Math.round(progress)}% complete</span>
              </div>
              <div className="h-1.5 bg-premium-light rounded-full overflow-hidden">
                <div 
                  className="h-full bg-premium-black rounded-full transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            {/* Question */}
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-premium-black mb-1">
              {step.question}
            </h2>
            <p className="text-xs text-premium-gray mb-7 font-light">{step.subtitle}</p>

            {/* Options Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
              {step.options.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => handleSelect(opt.value)}
                  className={`text-left p-4 border-2 rounded-lg transition-all hover:border-premium-accent/60 ${
                    selectedOption === opt.value
                      ? 'border-premium-black bg-premium-black text-white'
                      : 'border-premium-border bg-white hover:bg-premium-light/50'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">{opt.icon}</span>
                    <div>
                      <p className={`font-bold text-sm ${selectedOption === opt.value ? 'text-white' : 'text-premium-black'}`}>
                        {opt.label}
                      </p>
                      <p className={`text-xs mt-0.5 ${selectedOption === opt.value ? 'text-white/70' : 'text-premium-gray'}`}>
                        {opt.desc}
                      </p>
                    </div>
                    {selectedOption === opt.value && (
                      <CheckCircle2 className="w-5 h-5 text-premium-accent ml-auto shrink-0 mt-0.5" />
                    )}
                  </div>
                </button>
              ))}
            </div>

            {/* Navigation */}
            <div className="flex justify-between items-center">
              <button
                onClick={handleBack}
                disabled={currentStep === 0}
                className="flex items-center gap-1.5 text-xs font-semibold text-premium-gray hover:text-premium-black transition-colors disabled:opacity-30 disabled:cursor-not-allowed uppercase tracking-wider"
              >
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
              <button
                onClick={handleNext}
                disabled={!selectedOption}
                className="flex items-center gap-2 bg-premium-black text-white hover:bg-premium-accent hover:text-premium-black font-bold text-xs tracking-widest uppercase px-8 py-3 rounded transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {currentStep === QUIZ_STEPS.length - 1 ? 'See My Results' : 'Next'}
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          /* Results Screen */
          <div className="space-y-6">
            <div className="bg-premium-black rounded-lg p-8 sm:p-10 text-center border border-premium-accent/20">
              <div className="text-6xl mb-4">{getPersonalityProfile().emoji}</div>
              <div className="inline-block bg-premium-accent/20 border border-premium-accent/40 text-premium-accent px-3 py-1 rounded text-xs font-bold uppercase tracking-wider mb-3">
                Your Style Profile
              </div>
              <h2 className="font-serif text-3xl sm:text-4xl font-bold text-white mb-3">
                {getPersonalityProfile().name}
              </h2>
              <p className="text-gray-300 text-sm font-light leading-relaxed max-w-sm mx-auto mb-8">
                {getPersonalityProfile().desc}
              </p>

              {/* Summary Chips */}
              <div className="flex flex-wrap justify-center gap-2 mb-8">
                {Object.entries(answers).map(([key, val]) => (
                  <span key={key} className="bg-white/10 text-white/80 text-[10px] px-3 py-1 rounded-full font-semibold uppercase tracking-wide border border-white/10">
                    {val.replace(/_/g, ' ')}
                  </span>
                ))}
              </div>

              <button
                onClick={handleViewResults}
                className="bg-premium-accent hover:bg-premium-golddark text-premium-black font-bold text-sm tracking-widest uppercase px-10 py-4 rounded transition-all flex items-center gap-2 mx-auto"
              >
                <Sparkles className="w-5 h-5" />
                View My Personalized Picks
              </button>
            </div>

            <div className="bg-white border border-premium-border rounded-lg p-6 text-center">
              <p className="text-xs text-premium-gray mb-4">Want even more accuracy?</p>
              <Link
                href="/face-shape"
                className="inline-flex items-center gap-2 border border-premium-border hover:border-premium-accent text-premium-dark hover:text-premium-accent font-semibold text-xs tracking-widest uppercase px-6 py-3 rounded transition-all"
              >
                Try the Face Shape Analyzer →
              </Link>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
