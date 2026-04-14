import React, { useEffect, useRef, useState } from 'react';
import { SwipeCard } from './SwipeCard';
import { useMovies } from '../../hooks/movies/useMovies';
import { useMovieActions, useMovieHistory } from '../../context/movies/MovieContext';
import { TMDBMovie } from '../../types/tmdb.types';

export const SwipeDeck: React.FC = () => {
  const { movies, loading, error, loadMore, hasMore } = useMovies();
  const dispatch = useMovieActions();
  const { history } = useMovieHistory();

  const [deck, setDeck] = useState<TMDBMovie[]>([]);
  const deckRef = useRef<TMDBMovie[]>([]);  // ref siempre fresco del deck
  const [feedback, setFeedback] = useState<'like' | 'dislike' | null>(null);

  // Mantener la ref sincronizada con el state
  useEffect(() => {
    deckRef.current = deck;
  }, [deck]);

  useEffect(() => {
    if (movies.length > 0) {
      setDeck(prevDeck => {
        const existingIds = new Set(prevDeck.map(m => m.id));
        const newItems = movies.filter(m => !existingIds.has(m.id));
        const updated = [...prevDeck, ...newItems];
        deckRef.current = updated;
        return updated;
      });
    }
  }, [movies]);

  const handleSwipe = (direction: 'left' | 'right') => {
    // Usamos la ref para leer siempre el valor más fresco del deck
    const currentMovie = deckRef.current[0];
    if (!currentMovie) {
      console.warn('[SwipeDeck] handleSwipe llamado pero deck vacío');
      return;
    }

    console.log('[SwipeDeck] Swipe:', direction, currentMovie.title);

    // Feedback visual
    setFeedback(direction === 'right' ? 'like' : 'dislike');
    setTimeout(() => setFeedback(null), 600);

    // Despachar al Context (esto dispara el guardado en localStorage)
    dispatch({
      type: direction === 'right' ? 'SWIPE_RIGHT' : 'SWIPE_LEFT',
      payload: currentMovie
    });

    console.log('[SwipeDeck] dispatch enviado. Historial actual (antes del render):', history.length);

    // Avanzar mazo
    setDeck(prevDeck => {
      const newDeck = prevDeck.slice(1);
      deckRef.current = newDeck;
      if (newDeck.length <= 2 && hasMore && !loading) {
        loadMore();
      }
      return newDeck;
    });
  };

  const likesCount = history.filter(h => h.action === 'LIKE').length;
  const dislikesCount = history.filter(h => h.action === 'DISLIKE').length;

  if (error) {
    return (
      <div className="flex items-center justify-center h-[500px] w-full max-w-sm rounded-2xl bg-red-900/50 border border-red-500 p-8 shadow-2xl">
        <p className="text-red-200 text-center font-bold">{error}</p>
      </div>
    );
  }

  if (loading && deck.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[500px] w-full max-w-sm rounded-2xl bg-gray-800 border-2 border-gray-700 shadow-xl shadow-black animate-pulse">
        <div className="w-12 h-12 border-4 border-t-red-500 border-b-red-500 border-transparent rounded-full animate-spin"></div>
        <p className="text-gray-400 mt-4 font-semibold tracking-widest uppercase">Buscando...</p>
      </div>
    );
  }

  if (deck.length === 0) {
    return (
      <div className="flex items-center justify-center h-[500px] w-full max-w-sm rounded-2xl border-2 border-dashed border-gray-600 bg-gray-800/50">
        <p className="text-gray-400 font-medium">No hay más películas por descubrir.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-6">

      {/* Contadores de historial en vivo */}
      <div className="flex gap-6 text-sm font-semibold">
        <span className="text-green-400">❤ {likesCount} likes</span>
        <span className="text-red-400">✕ {dislikesCount} no me gusta</span>
      </div>

      {/* Mazo de tarjetas */}
      <div className="relative w-full max-w-sm" style={{ height: '500px' }}>
        {deck.map((movie, index) => {
          if (index > 2) return null;
          const isTopCard = index === 0;

          return (
            <div
              key={movie.id}
              className="absolute top-0 left-0 w-full"
              style={{
                zIndex: 10 - index,
                transform: `scale(${1 - index * 0.05}) translateY(${index * 20}px)`,
                transition: 'transform 0.4s cubic-bezier(0.2, 0.8, 0.2, 1)',
                pointerEvents: isTopCard ? 'auto' : 'none'
              }}
            >
              {isTopCard ? (
                <SwipeCard
                  movie={{
                    ...movie,
                    id: movie.id.toString(),
                    poster: movie.poster_path
                      ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
                      : 'https://via.placeholder.com/500x750?text=No+Poster',
                    rating: movie.vote_average,
                    year: parseInt(movie.release_date?.split('-')[0] || '0')
                  } as any}
                  onSwipe={handleSwipe}
                />
              ) : (
                <div className="w-full rounded-2xl overflow-hidden bg-gray-800 border border-gray-700 shadow-xl opacity-70" style={{ height: '500px' }}>
                  {movie.poster_path && (
                    <img
                      src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                      className="w-full h-full object-cover brightness-75 blur-sm"
                      draggable="false"
                    />
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Botones de acción */}
      <div className="flex items-center gap-8 z-20">
        <button
          onClick={() => handleSwipe('left')}
          className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl shadow-lg border-2 transition-all duration-200 ${
            feedback === 'dislike'
              ? 'bg-red-500 border-red-400 scale-110'
              : 'bg-gray-800 border-red-500 hover:bg-red-500 hover:scale-110'
          }`}
          title="No me gusta"
        >
          ✕
        </button>

        <button
          onClick={() => dispatch({ type: 'UNDO_LAST' })}
          className="w-10 h-10 rounded-full flex items-center justify-center text-base shadow-md border border-gray-600 bg-gray-800 hover:bg-gray-700 hover:scale-110 transition-all duration-200"
          title="Deshacer último"
        >
          ↩
        </button>

        <button
          onClick={() => handleSwipe('right')}
          className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl shadow-lg border-2 transition-all duration-200 ${
            feedback === 'like'
              ? 'bg-green-500 border-green-400 scale-110'
              : 'bg-gray-800 border-green-500 hover:bg-green-500 hover:scale-110'
          }`}
          title="Me gusta"
        >
          ♥
        </button>
      </div>

      <p className="text-gray-500 text-xs tracking-wide">
        {deck.length} película{deck.length !== 1 ? 's' : ''} por descubrir
      </p>
    </div>
  );
};
