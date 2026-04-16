import React, { useState, PointerEvent, KeyboardEvent, useRef } from 'react';

export interface Movie {
  id: string;
  title: string;
  poster: string;
  year: number;
  rating: number;
}

export interface SwipeCardProps {
  movie: Movie;
  onSwipe: (direction: 'left' | 'right') => void;
}

const SWIPE_THRESHOLD = 80;

export const SwipeCard: React.FC<SwipeCardProps> = ({ movie, onSwipe }) => {
  // --- Estados de Lógica de Arrastre ---
  const [startX, setStartX] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  const cardRef = useRef<HTMLDivElement>(null);
  const likeIndicatorRef = useRef<HTMLSpanElement>(null);
  const nopeIndicatorRef = useRef<HTMLSpanElement>(null);
  const currentOffsetX = useRef<number>(0);

  // --- Manejo de Eventos Táctiles y de Mouse (Pointer Events) ---
  const handlePointerDown = (e: PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0 && e.pointerType === 'mouse') return;
    
    e.currentTarget.setPointerCapture(e.pointerId);
    setStartX(e.clientX);
    setIsDragging(true);
    
    // Quitar transiciones durante el arrastre para respuesta inmediata
    if (cardRef.current) {
      cardRef.current.style.transition = 'none';
    }
  };

  const handlePointerMove = (e: PointerEvent<HTMLDivElement>) => {
    if (!isDragging || startX === null || !cardRef.current) return;
    
    const deltaX = e.clientX - startX;
    currentOffsetX.current = deltaX;
    
    // Aplicar transformaciones directamente al DOM (Evita re-render de React)
    const rotation = deltaX * 0.05;
    cardRef.current.style.transform = `translateX(${deltaX}px) rotate(${rotation}deg)`;

    // Actualizar indicadores con umbral
    if (likeIndicatorRef.current) {
      likeIndicatorRef.current.style.opacity = deltaX > SWIPE_THRESHOLD ? '1' : '0';
    }
    if (nopeIndicatorRef.current) {
      nopeIndicatorRef.current.style.opacity = deltaX < -SWIPE_THRESHOLD ? '1' : '0';
    }
  };

  const handlePointerUp = (e: PointerEvent<HTMLDivElement>) => {
    if (!isDragging || !cardRef.current) return;

    e.currentTarget.releasePointerCapture(e.pointerId);
    setIsDragging(false);

    // Restaurar transición para el retorno o salida
    cardRef.current.style.transition = 'transform 0.4s cubic-bezier(0.2, 0.8, 0.2, 1), opacity 0.3s ease';

    if (currentOffsetX.current > SWIPE_THRESHOLD) {
      triggerSwipe('right');
    } else if (currentOffsetX.current < -SWIPE_THRESHOLD) {
      triggerSwipe('left');
    } else {
      currentOffsetX.current = 0;
      cardRef.current.style.transform = `translateX(0px) rotate(0deg)`;
      if (likeIndicatorRef.current) likeIndicatorRef.current.style.opacity = '0';
      if (nopeIndicatorRef.current) nopeIndicatorRef.current.style.opacity = '0';
    }
    setStartX(null);
  };

  const handlePointerCancel = (e: PointerEvent<HTMLDivElement>) => {
    e.currentTarget.releasePointerCapture(e.pointerId);
    setIsDragging(false);
    if (cardRef.current) {
      cardRef.current.style.transition = 'transform 0.3s ease-out';
      cardRef.current.style.transform = `translateX(0px) rotate(0deg)`;
    }
    currentOffsetX.current = 0;
    setStartX(null);
    if (likeIndicatorRef.current) likeIndicatorRef.current.style.opacity = '0';
    if (nopeIndicatorRef.current) nopeIndicatorRef.current.style.opacity = '0';
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'ArrowRight') {
      triggerSwipe('right');
    } else if (e.key === 'ArrowLeft') {
      triggerSwipe('left');
    }
  };

  const triggerSwipe = (direction: 'left' | 'right') => {
    const finalX = direction === 'right' ? window.innerWidth : -window.innerWidth;
    currentOffsetX.current = finalX;
    
    if (cardRef.current) {
      cardRef.current.style.transform = `translateX(${finalX}px) rotate(${finalX * 0.05}deg)`;
      cardRef.current.style.opacity = '0';
    }
    
    setTimeout(() => {
      onSwipe(direction);
    }, 300);
  };

  return (
    <div
      ref={cardRef}
      tabIndex={0}
      role="button"
      aria-label={`Película ${movie.title}, usa las flechas izquierda o derecha para dar like o dislike`}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerCancel}
      onKeyDown={handleKeyDown}
      className={`
        relative w-full max-w-sm h-[500px] rounded-2xl overflow-hidden shadow-2xl
        select-none touch-none outline-none focus:ring-4 focus:ring-blue-500/50
        bg-gray-800 border border-gray-700
      `}
    >
      {/* Fondo: Póster de la Película (Optimizado para LCP) */}
      <img
        src={movie.poster}
        alt={`Póster de la película: ${movie.title}`}
        className="absolute inset-0 w-full h-full object-cover pointer-events-none"
        draggable={false}
        {...({ fetchpriority: 'high' } as any)}
      />

      {/* Gradiente Oscuro Reforzado (Accesibilidad/Contraste) */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent pointer-events-none" />

      {/* Indicadores de Feedback Visual */}
      <div className="absolute top-8 left-0 right-0 flex justify-between px-8 pointer-events-none">
        <span
          ref={likeIndicatorRef}
          className="border-4 border-green-500 text-green-500 font-extrabold text-4xl uppercase tracking-widest px-4 py-1 rounded-md transform -rotate-12 opacity-0 transition-opacity duration-100"
        >
          Like
        </span>
        
        <span
          ref={nopeIndicatorRef}
          className="border-4 border-red-500 text-red-500 font-extrabold text-4xl uppercase tracking-widest px-4 py-1 rounded-md transform rotate-12 opacity-0 transition-opacity duration-100"
        >
          Nope
        </span>
      </div>

      {/* Detalles de la Película */}
      <div className="absolute bottom-6 left-6 right-6 text-white pointer-events-none">
        <h2 className="text-3xl font-bold mb-1 leading-tight">{movie.title}</h2>
        <div className="flex items-center space-x-2 text-sm font-bold mt-2">
          <span className="bg-black/80 backdrop-blur-md px-2 py-1 rounded-md border border-white/20">
            {movie.year}
          </span>
          <span className="flex items-center space-x-1 bg-black/80 backdrop-blur-md px-2 py-1 rounded-md border border-white/20">
            <span className="text-yellow-400">★</span>
            <span className="text-white">{movie.rating.toFixed(1)}</span>
          </span>
        </div>
      </div>
    </div>
  );
};
