import { Suspense, lazy } from 'react';
import { MovieHistoryProvider } from './context/movies/MovieContext';

const SwipeDeck = lazy(() => import('./components/movies/SwipeDeck').then(m => ({ default: m.SwipeDeck })));

function App() {
  return (
    <MovieHistoryProvider>
      <main className="w-full min-h-screen flex flex-col items-center pt-16 p-4 bg-gray-950">
        <h1 className="text-4xl font-black mb-8 bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">
          CineSwipe
        </h1>
        
        <Suspense fallback={<div className="h-[600px] flex items-center justify-center text-gray-400 animate-pulse">Cargando aplicación...</div>}>
          <SwipeDeck />
        </Suspense>
      </main>
    </MovieHistoryProvider>
  );
}

export default App;
