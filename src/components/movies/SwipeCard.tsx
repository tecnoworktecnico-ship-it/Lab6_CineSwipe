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
  const [currentOffsetX, setCurrentOffsetX] = useState<number>(0);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [exitDirection, setExitDirection] = useState<'left' | 'right' | null>(null);

  const cardRef = useRef<HTMLDivElement>(null);

  // --- Manejo de Eventos Táctiles y de Mouse (Pointer Events) ---
  const handlePointerDown = (e: PointerEvent<HTMLDivElement>) => {
    // Solo permitir touch o clic izquierdo
    if (e.button !== 0 && e.pointerType === 'mouse') return;
    
    // Captura el puntero para que los eventos move sigan fluidos aunque salgan del DOM del componente
    e.currentTarget.setPointerCapture(e.pointerId);
    setStartX(e.clientX);
    setIsDragging(true);
  };

  const handlePointerMove = (e: PointerEvent<HTMLDivElement>) => {
    if (!isDragging || startX === null) return;
    
    // Calcula la distancia arrastrada
    const deltaX = e.clientX - startX;
    setCurrentOffsetX(deltaX);
  };

  const handlePointerUp = (e: PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;

    e.currentTarget.releasePointerCapture(e.pointerId);
    setIsDragging(false);

    // Evaluar si superó el umbral de Swipe
    if (currentOffsetX > SWIPE_THRESHOLD) {
      triggerSwipe('right');
    } else if (currentOffsetX < -SWIPE_THRESHOLD) {
      triggerSwipe('left');
    } else {
      // Retornar la tarjeta a la posición original (no superó el umbral)
      setCurrentOffsetX(0);
    }
    setStartX(null);
  };

  const handlePointerCancel = (e: PointerEvent<HTMLDivElement>) => {
    // Interrupción abrupta (e.g., rotoscopio en el teléfono)
    e.currentTarget.releasePointerCapture(e.pointerId);
    setIsDragging(false);
    setCurrentOffsetX(0);
    setStartX(null);
  };

  // --- Fallback de Accesibilidad (Teclado) ---
  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'ArrowRight') {
      triggerSwipe('right');
    } else if (e.key === 'ArrowLeft') {
      triggerSwipe('left');
    }
  };

  // --- Lógica Auxiliar de Despacho de Evento ---
  const triggerSwipe = (direction: 'left' | 'right') => {
    setExitDirection(direction);
    // Anima la salida inyectando un offset masivo
    setCurrentOffsetX(direction === 'right' ? window.innerWidth : -window.innerWidth);
    
    // Retrasar el `onSwipe` para permitir que el CSS complete la animación de salida (300ms)
    setTimeout(() => {
      onSwipe(direction);
    }, 300);
  };

  // --- Cálculos de Renderezado Dinámico ---
  const rotation = currentOffsetX * 0.05; // Gira 0.05deg por cada píxel arrastrado
  const isLikeThresholdMet = currentOffsetX > SWIPE_THRESHOLD;
  const isDislikeThresholdMet = currentOffsetX < -SWIPE_THRESHOLD;

  // Renderizamos los styles inline *solamente* para los transforms
  const dynamicStyle = {
    transform: `translateX(${currentOffsetX}px) rotate(${rotation}deg)`,
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
      style={dynamicStyle}
      className={`
        relative w-full max-w-sm h-[500px] rounded-2xl overflow-hidden shadow-2xl
        select-none touch-none outline-none focus:ring-4 focus:ring-blue-500/50
        ${!isDragging ? 'transition-transform duration-300 ease-out' : ''}
        ${exitDirection ? 'opacity-0 transition-opacity duration-300' : 'opacity-100'}
        bg-gray-800 border border-gray-700
      `}
    >
      {/* Fondo: Póster de la Película */}
      <img
        src={movie.poster}
        alt={movie.title}
        className="absolute inset-0 w-full h-full object-cover pointer-events-none"
        draggable={false}
      />

      {/* Gradiente Oscuro en la base para facilitar la lectura */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />

      {/* Indicadores de Feedback Visual (Like / Nope) */}
      <div className="absolute top-8 left-0 right-0 flex justify-between px-8 pointer-events-none">
        <span
          className={`
            border-4 border-green-500 text-green-500 font-extrabold text-4xl uppercase tracking-widest px-4 py-1 rounded-md transform -rotate-12
            transition-opacity duration-200
            ${isLikeThresholdMet ? 'opacity-100' : 'opacity-0'}
          `}
        >
          Like
        </span>
        
        <span
          className={`
            border-4 border-red-500 text-red-500 font-extrabold text-4xl uppercase tracking-widest px-4 py-1 rounded-md transform rotate-12
            transition-opacity duration-200
            ${isDislikeThresholdMet ? 'opacity-100' : 'opacity-0'}
          `}
        >
          Nope
        </span>
      </div>

      {/* Detalles de la Película */}
      <div className="absolute bottom-6 left-6 right-6 text-white pointer-events-none">
        <h2 className="text-3xl font-bold mb-1 leading-tight">{movie.title}</h2>
        <div className="flex items-center space-x-2 text-sm font-medium opacity-90 mt-2">
          <span className="bg-white/30 backdrop-blur-md px-2 py-1 rounded-md">{movie.year}</span>
          <span className="flex items-center space-x-1 bg-black/40 backdrop-blur-md px-2 py-1 rounded-md">
            <span className="text-yellow-400">★</span>
            <span>{movie.rating.toFixed(1)}</span>
          </span>
        </div>
      </div>
    </div>
  );
};

/*
// ==========================================
// EJEMPLO DE USO / INTEGRACIÓN
// ==========================================

import React, { useState } from 'react';
import { SwipeCard, Movie } from './SwipeCard';

export const DeckViewer = () => {
  const [movies, setMovies] = useState<Movie[]>([
    {
      id: '1',
      title: 'Inception',
      poster: 'https://image.tmdb.org/t/p/w500/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg',
      year: 2010,
      rating: 8.8
    },
    {
      id: '2',
      title: 'The Dark Knight',
      poster: 'https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg',
      year: 2008,
      rating: 9.0
    }
  ]);

  const handleSwipe = (direction: 'left' | 'right') => {
    console.log(`El usuario ha dado ${direction === 'right' ? 'LIKE' : 'DISLIKE'} a ${movies[0].title}`);
    
    // Removemos la carta que está encima
    setMovies(prev => prev.slice(1));
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900 p-4">
      <div className="relative w-full max-w-sm h-[500px]">
        {movies.length > 0 ? (
          <SwipeCard
            key={movies[0].id}
            movie={movies[0]}
            onSwipe={handleSwipe}
          />
        ) : (
          <div className="text-white text-center flex items-center justify-center h-full border-2 border-dashed border-gray-600 rounded-2xl">
            ¡No hay más películas para evaluar!
          </div>
        )}
      </div>
    </div>
  );
};
*/
