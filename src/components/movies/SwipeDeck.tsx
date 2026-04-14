import React, { useEffect, useState } from 'react';
import { SwipeCard } from './SwipeCard';
import { useMovies } from '../../hooks/movies/useMovies';
import { useMovieActions } from '../../context/movies/MovieContext';
import { TMDBMovie } from '../../types/tmdb.types';

export const SwipeDeck: React.FC = () => {
  const { movies, loading, error, loadMore, hasMore } = useMovies();
  const dispatch = useMovieActions();
  
  // Lista visual de las películas pendientes
  const [deck, setDeck] = useState<TMDBMovie[]>([]);

  // Sincroniza el mazo visual cuando el hook de datos trae nuevas películas
  useEffect(() => {
    // Si reseteamos totalmente las pelis (ej. nuevo fetch), sobreescribimos
    // Para simplificar: sincronizamos cuando "movies" es más largo que "deck" o muy distinto
    if (movies.length > 0) {
      // Como el historial se guarda aparte, no sacamos los swipedos del array global "movies" del hook
      // pero si queremos que el mazo de acá sea interactivo:
      // Lo ideal es que `movies` cambie cada vez que se agrega una página
      setDeck(prevDeck => {
        // Encontraremos los elementos sumados nuevos.
        const existingIds = new Set(prevDeck.map(m => m.id));
        const newItems = movies.filter(m => !existingIds.has(m.id));
        return [...prevDeck, ...newItems];
      });
    }
  }, [movies]);

  const handleSwipe = (direction: 'left' | 'right') => {
    const currentMovie = deck[0];
    if (!currentMovie) return;
    
    // Impactar Action al Global MovieHistory Context
    if (direction === 'right') {
      dispatch({ type: 'SWIPE_RIGHT', payload: currentMovie });
    } else {
      dispatch({ type: 'SWIPE_LEFT', payload: currentMovie });
    }

    // Remueve tarjeta visual y pide paginación si se están agotando
    setDeck(prevDeck => {
      const newDeck = prevDeck.slice(1);
      if (newDeck.length <= 2 && hasMore && !loading) {
        loadMore();
      }
      return newDeck;
    });
  };

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
    <div className="relative w-full max-w-sm h-[500px] perspective-1000">
      {deck.map((movie, index) => {
        if (index > 2) return null; // Renderizar sólo 3 a la vez por performance JS
        
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
              // Adaptamos la tarjeta a la interface TMDBMovie (que tiene id typeof number, poster_path, etc)
              // Usar ANY temporalmente nos evita el refactor intensivo de interface de la carta por el momento,
              // pero lo ideal es pasar las propiedades completas.
              <SwipeCard 
                movie={{
                   ...movie,
                   id: movie.id.toString(),
                   poster: movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : 'https://via.placeholder.com/500x750?text=No+Poster',
                   rating: movie.vote_average,
                   year: parseInt(movie.release_date?.split('-')[0] || "0")
                } as any} 
                onSwipe={handleSwipe} 
              />
            ) : (
              // Cartas de fondo (fantasma) decorativas
              <div className="w-full h-[500px] rounded-2xl overflow-hidden bg-gray-800 border border-gray-700 shadow-xl opacity-70">
                 {movie.poster_path && (
                    <img src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`} className="w-full h-full object-cover filter brightness-75 blur-[1px]" draggable="false" />
                 )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
