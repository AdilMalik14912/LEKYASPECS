import React, { useState, useRef } from 'react';
import { RotateCw, MoveHorizontal, Compass } from 'lucide-react';

export default function Product360Viewer({ imageUrls = [], productName = 'Product' }) {
  const [currentFrame, setCurrentFrame] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const containerRef = useRef(null);

  // If no multiple images, use single image with simulated rotation angle transform
  const framesCount = imageUrls.length >= 4 ? imageUrls.length : 36;
  const currentAngle = Math.round((currentFrame / framesCount) * 360);

  const handleMouseDown = (e) => {
    setIsDragging(true);
    setStartX(e.clientX || (e.touches && e.touches[0].clientX) || 0);
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    const clientX = e.clientX || (e.touches && e.touches[0].clientX) || 0;
    const deltaX = clientX - startX;

    if (Math.abs(deltaX) > 8) {
      const step = deltaX > 0 ? -1 : 1;
      setCurrentFrame((prev) => (prev + step + framesCount) % framesCount);
      setStartX(clientX);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Determine current image URL to display
  const displayImage = imageUrls.length > 0
    ? imageUrls[currentFrame % imageUrls.length]
    : 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=800&auto=format&fit=crop';

  return (
    <div className="relative w-full aspect-square bg-[#1A0024] border border-[#3E0856] rounded-3xl overflow-hidden shadow-2xl flex items-center justify-center select-none group">
      
      {/* 360 Badge */}
      <div className="absolute top-4 left-4 z-10 flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0D0016]/80 border border-[#FAAE62]/40 text-[#FAAE62] text-xs font-bold uppercase tracking-wider backdrop-blur-md">
        <RotateCw className="w-3.5 h-3.5 animate-spin-slow" /> 360° Interactive View
      </div>

      {/* Angle Gauge */}
      <div className="absolute top-4 right-4 z-10 flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#0D0016]/80 border border-white/10 text-white/80 font-mono text-xs backdrop-blur-md">
        <Compass className="w-3.5 h-3.5 text-[#FAAE62]" /> {currentAngle}°
      </div>

      {/* Main Image Container */}
      <div
        ref={containerRef}
        className="w-full h-full flex items-center justify-center p-8 cursor-grab active:cursor-grabbing transition-transform duration-100"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleMouseDown}
        onTouchMove={handleMouseMove}
        onTouchEnd={handleMouseUp}
        style={{
          transform: imageUrls.length < 4 ? `rotateY(${currentAngle}deg)` : 'none',
          perspective: '1000px'
        }}
      >
        <img
          src={displayImage}
          alt={`${productName} 360 View - ${currentAngle}°`}
          className="max-w-full max-h-full object-contain filter drop-shadow-[0_15px_25px_rgba(0,0,0,0.6)] pointer-events-none transition-all duration-75"
        />
      </div>

      {/* Drag Instruction Banner */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 px-4 py-1.5 rounded-full bg-[#0D0016]/90 border border-[#FAAE62]/30 text-white text-xs font-medium flex items-center gap-2 backdrop-blur-md opacity-80 group-hover:opacity-100 transition-opacity">
        <MoveHorizontal className="w-4 h-4 text-[#FAAE62] animate-pulse" />
        Drag or swipe to rotate 360°
      </div>

      {/* Rotation Slider Indicator */}
      <div className="absolute bottom-1 left-0 right-0 h-1 bg-[#2A0440]">
        <div
          className="h-full bg-gradient-to-r from-[#D4893F] to-[#FAAE62] transition-all duration-75"
          style={{ width: `${((currentFrame + 1) / framesCount) * 100}%` }}
        />
      </div>
    </div>
  );
}
