import React from 'react';
import { MovieHistoryProvider } from './context/movies/MovieContext';
import { SwipeDeck } from './components/movies/SwipeDeck';

function App() {
  return (
    <MovieHistoryProvider>
      <main className="w-full h-full flex flex-col items-center justify-center p-4">
        <h1 className="text-4xl font-black mb-8 bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">
          CineSwipe
        </h1>
        <SwipeDeck />
      </main>
    </MovieHistoryProvider>
  );
}

export default App;
