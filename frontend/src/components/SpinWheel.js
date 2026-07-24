import React, { useState, useRef, useEffect } from 'react';
import { Gift, X, Sparkles, Check, Copy, Zap, Clock, Trophy } from 'lucide-react';

const REWARDS = [
  { label: '20% OFF', code: 'LEKYASPIN20', color: '#7B22A8', desc: 'Get 20% discount on any frame' },
  { label: 'Free Blue Coating', code: 'FREEBLUE', color: '#FAAE62', desc: 'Free anti-glare blue shield' },
  { label: 'Free Shipping', code: 'FREESHIP', color: '#3E0856', desc: 'Free Express Courier delivery' },
  { label: '₹500 OFF', code: 'CASH500', color: '#D4893F', desc: 'Flat ₹500 discount on cart' },
  { label: 'VIP Gold Access', code: 'VIPGOLD', color: '#2A0440', desc: '1-Year VIP Gold membership' },
  { label: '15% Extra OFF', code: 'SPIN15', color: '#FCC48A', desc: 'Extra 15% discount code' }
];

const SPIN_STORAGE_KEY = 'lekya_last_spin';
const COOLDOWN_MS = 24 * 60 * 60 * 1000;

function getTimeUntilNextSpin() {
  if (typeof window === 'undefined') return 0;
  const last = localStorage.getItem(SPIN_STORAGE_KEY);
  if (!last) return 0;
  const diff = Date.now() - parseInt(last, 10);
  return Math.max(0, COOLDOWN_MS - diff);
}

function formatCountdown(ms) {
  const totalSeconds = Math.ceil(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return `${String(hours).padStart(2, '0')}h ${String(minutes).padStart(2, '0')}m ${String(seconds).padStart(2, '0')}s`;
}

export default function SpinWheel({ isOpen, onClose, onApplyCoupon }) {
  const [spinning, setSpinning] = useState(false);
  const [wonReward, setWonReward] = useState(null);
  const [copied, setCopied] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [cooldownMs, setCooldownMs] = useState(0);
  const [savedReward, setSavedReward] = useState(null);
  const canvasRef = useRef(null);
  const timerRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;
    const remaining = getTimeUntilNextSpin();
    setCooldownMs(remaining);
    const saved = localStorage.getItem('lekya_won_reward');
    if (saved) { try { setSavedReward(JSON.parse(saved)); } catch (_) {} }
    drawWheel(rotation);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || cooldownMs <= 0) return;
    timerRef.current = setInterval(() => {
      const remaining = getTimeUntilNextSpin();
      setCooldownMs(remaining);
      if (remaining <= 0) clearInterval(timerRef.current);
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [isOpen, cooldownMs]);

  useEffect(() => {
    if (!isOpen) return;
    drawWheel(rotation);
  }, [rotation]);

  const drawWheel = (deg) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width, height = canvas.height;
    const centerX = width / 2, centerY = height / 2;
    const radius = Math.min(centerX, centerY) - 10;
    const sliceAngle = (2 * Math.PI) / REWARDS.length;

    ctx.clearRect(0, 0, width, height);

    REWARDS.forEach((reward, i) => {
      const startAngle = i * sliceAngle + (deg * Math.PI) / 180;
      const endAngle = startAngle + sliceAngle;
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, startAngle, endAngle);
      ctx.fillStyle = reward.color;
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#FAAE62';
      ctx.stroke();
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(startAngle + sliceAngle / 2);
      ctx.textAlign = 'right';
      ctx.fillStyle = i === 1 || i === 5 ? '#0D0016' : '#FEF6EE';
      ctx.font = 'bold 12px Inter, sans-serif';
      ctx.fillText(reward.label, radius - 20, 4);
      ctx.restore();
    });

    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
    ctx.lineWidth = 4; ctx.strokeStyle = '#FAAE62'; ctx.stroke();
    ctx.beginPath();
    ctx.arc(centerX, centerY, 24, 0, 2 * Math.PI);
    ctx.fillStyle = '#0D0016'; ctx.fill();
    ctx.lineWidth = 3; ctx.strokeStyle = '#FAAE62'; ctx.stroke();
    ctx.fillStyle = '#FAAE62'; ctx.font = 'bold 16px sans-serif';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText('★', centerX, centerY);
  };

  const handleSpin = () => {
    if (spinning || wonReward) return;
    const remaining = getTimeUntilNextSpin();
    if (remaining > 0) { setCooldownMs(remaining); return; }
    setSpinning(true);

    const winningIndex = Math.floor(Math.random() * REWARDS.length);
    const sliceDeg = 360 / REWARDS.length;
    const targetDeg = 360 * 5 + (360 - winningIndex * sliceDeg - sliceDeg / 2);
    let start = null;
    const duration = 4000;

    const animate = (timestamp) => {
      if (!start) start = timestamp;
      const progress = timestamp - start;
      const easeOut = (t) => 1 - Math.pow(1 - t, 3);
      const currentDeg = easeOut(Math.min(progress / duration, 1)) * targetDeg;
      setRotation(currentDeg % 360);
      if (progress < duration) {
        requestAnimationFrame(animate);
      } else {
        setSpinning(false);
        const winner = REWARDS[winningIndex];
        setWonReward(winner);
        localStorage.setItem(SPIN_STORAGE_KEY, Date.now().toString());
        localStorage.setItem('lekya_won_reward', JSON.stringify(winner));
        setCooldownMs(COOLDOWN_MS);
        if (onApplyCoupon) onApplyCoupon(winner.code);
      }
    };
    requestAnimationFrame(animate);
  };

  const copyCode = (reward) => {
    if (!reward) return;
    navigator.clipboard.writeText(reward.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isOpen) return null;

  const isOnCooldown = cooldownMs > 0 && !wonReward;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-md bg-[#1A0024] border border-[#FAAE62]/40 rounded-3xl p-6 shadow-2xl text-center overflow-hidden">
        <div className="absolute -top-20 -left-20 w-48 h-48 bg-[#7B22A8]/30 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-20 -right-20 w-48 h-48 bg-[#FAAE62]/20 rounded-full blur-3xl"></div>

        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white p-1 rounded-full bg-white/5 border border-white/10 transition-colors">
          <X className="w-5 h-5" />
        </button>

        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FAAE62]/10 border border-[#FAAE62]/30 text-[#FAAE62] text-xs font-bold uppercase tracking-wider mb-2">
          <Sparkles className="w-3.5 h-3.5" /> Spin & Win — Once Daily
        </div>
        <h3 className="text-2xl font-serif font-bold text-white mb-1">Lucky Reward Wheel</h3>
        <p className="text-xs text-[#9B7EA8] mb-5">Spin once every 24 hours to unlock exclusive perks!</p>

        <div className="relative mx-auto w-64 h-64 mb-5" style={{ filter: isOnCooldown ? 'brightness(0.4) grayscale(0.5)' : 'none', transition: 'filter 0.5s' }}>
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10 w-0 h-0 border-l-8 border-r-8 border-t-[16px] border-l-transparent border-r-transparent border-t-[#FAAE62]"></div>
          <canvas ref={canvasRef} width={256} height={256} className="w-full h-full rounded-full shadow-2xl cursor-pointer" onClick={handleSpin} />
        </div>

        {isOnCooldown && (
          <div className="mb-4 bg-[#2A0440]/80 border border-[#FAAE62]/20 rounded-2xl p-4">
            <div className="flex items-center justify-center gap-2 text-[#FAAE62] font-bold text-sm mb-1">
              <Clock className="w-4 h-4" /> Next Spin Available In:
            </div>
            <div className="font-mono text-2xl font-black text-white tracking-widest">{formatCountdown(cooldownMs)}</div>
            <p className="text-xs text-[#9B7EA8] mt-1">Come back tomorrow for another chance!</p>
          </div>
        )}

        {isOnCooldown && savedReward && (
          <div className="bg-[#2A0440] border border-[#FAAE62]/50 rounded-2xl p-3 mb-3">
            <div className="text-[#FAAE62] font-bold text-xs uppercase tracking-widest mb-1 flex items-center justify-center gap-1">
              <Trophy className="w-4 h-4" /> Your Active Reward: {savedReward.label}
            </div>
            <div className="flex items-center justify-between bg-[#0D0016] border border-white/10 rounded-xl p-2 px-3">
              <span className="font-mono font-bold text-sm text-white tracking-widest">{savedReward.code}</span>
              <button onClick={() => copyCode(savedReward)} className="flex items-center gap-1 text-xs bg-[#FAAE62] text-[#0D0016] font-bold px-3 py-1.5 rounded-lg hover:bg-[#FCC48A] transition-colors">
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copied' : 'Copy'}
              </button>
            </div>
          </div>
        )}

        {wonReward && (
          <div className="bg-[#2A0440] border border-[#FAAE62]/50 rounded-2xl p-4">
            <div className="text-[#FAAE62] font-bold text-xs uppercase tracking-widest mb-1 flex items-center justify-center gap-1">
              <Gift className="w-4 h-4" /> 🎉 You Won: {wonReward.label}!
            </div>
            <p className="text-xs text-[#9B7EA8] mb-3">{wonReward.desc}</p>
            <div className="flex items-center justify-between bg-[#0D0016] border border-white/10 rounded-xl p-2 px-3">
              <span className="font-mono font-bold text-sm text-white tracking-widest">{wonReward.code}</span>
              <button onClick={() => copyCode(wonReward)} className="flex items-center gap-1 text-xs bg-[#FAAE62] text-[#0D0016] font-bold px-3 py-1.5 rounded-lg hover:bg-[#FCC48A] transition-colors">
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copied' : 'Copy'}
              </button>
            </div>
          </div>
        )}

        {!wonReward && !isOnCooldown && (
          <button onClick={handleSpin} disabled={spinning} className="w-full bg-gradient-to-r from-[#D4893F] to-[#FAAE62] hover:scale-105 active:scale-95 text-[#0D0016] font-black text-sm uppercase tracking-widest py-3 rounded-xl shadow-lg shadow-[#FAAE62]/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50">
            <Zap className="w-4 h-4 fill-current" />
            {spinning ? 'Spinning...' : 'Spin the Wheel Now'}
          </button>
        )}
      </div>
    </div>
  );
}

