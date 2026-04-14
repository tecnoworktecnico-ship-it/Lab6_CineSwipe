import React, { createContext, useReducer, useEffect, useMemo, useContext } from 'react';
import { TMDBMovie } from '../../types/tmdb.types';

// ==========================================
// TIPOS E INTERFACES
// ==========================================

export interface HistoryItem {
  movie: TMDBMovie;
  action: 'LIKE' | 'DISLIKE';
  timestamp: number;
}

export interface MovieHistoryState {
  history: HistoryItem[];
}

export type MovieHistoryAction =
  | { type: 'SWIPE_RIGHT'; payload: TMDBMovie } // Equivalente a LIKE
  | { type: 'SWIPE_LEFT'; payload: TMDBMovie }  // Equivalente a DISLIKE
  | { type: 'UNDO_LAST' }
  | { type: 'CLEAR_HISTORY' };

const MAX_HISTORY_ITEMS = 50;
const STORAGE_KEY = 'cineswipe_user_history';

// ==========================================
// ESTADO INICIAL Y REDUCER PURO
// ==========================================

const initialState: MovieHistoryState = {
  history: []
};

// Lazy initializer para evitar flash de hidratación (flicker) al cargar el provider
const initHistoryState = (fallbackState: MovieHistoryState): MovieHistoryState => {
  if (typeof window === 'undefined') return fallbackState;
  try {
    const cached = localStorage.getItem(STORAGE_KEY);
    return cached ? JSON.parse(cached) : fallbackState;
  } catch (err) {
    console.error("Error leyendo historial guardado:", err);
    return fallbackState;
  }
};

/**
 * Función Reducer pura.
 * Computa el estado entrante y saliente sin ejecutar "Side-Effects" (no llama APIs ni Storage).
 */
function movieHistoryReducer(state: MovieHistoryState, action: MovieHistoryAction): MovieHistoryState {
  switch (action.type) {
    case 'SWIPE_RIGHT':
    case 'SWIPE_LEFT': {
      const newItem: HistoryItem = {
        movie: action.payload,
        action: action.type === 'SWIPE_RIGHT' ? 'LIKE' : 'DISLIKE',
        timestamp: Date.now()
      };

      // Apilamos primero (última acción en el index 0)
      const newHistory = [newItem, ...state.history];

      // Limitamos aplicando FIFO (remover el más antiguo al sobrepasar el umbral)
      if (newHistory.length > MAX_HISTORY_ITEMS) {
        newHistory.pop();
      }

      return { ...state, history: newHistory };
    }

    case 'UNDO_LAST': {
      if (state.history.length === 0) return state;
      // Remueve el primer elemento (la acción más reciente)
      const newHistory = [...state.history];
      newHistory.shift(); 
      return { ...state, history: newHistory };
    }

    case 'CLEAR_HISTORY': {
      return { ...state, history: [] };
    }

    default:
      return state;
  }
}

// ==========================================
// SEPARACIÓN DE CONTEXTOS (Lectura vs Escritura)
// ==========================================

const MovieHistoryStateContext = createContext<MovieHistoryState | undefined>(undefined);
const MovieHistoryDispatchContext = createContext<React.Dispatch<MovieHistoryAction> | undefined>(undefined);

// ==========================================
// PROVIDER COMPONENT
// ==========================================

export const MovieHistoryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(movieHistoryReducer, initialState, initHistoryState);

  // Efecto Secundario (Side-Effect): Sincronizamos con localStorage cuando el estado cambia.
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (err) {
      console.error("Error guardando el historial:", err);
    }
  }, [state]);

  // Memoizar el valor del state para proteger componentes hijos de re-renderizados forzados
  const stateContextValue = useMemo(() => state, [state]);

  return (
    <MovieHistoryStateContext.Provider value={stateContextValue}>
      {/* Contexto W (Escritura/Dispatch) no cambia su ref, pasamos directamente el dispatch */}
      <MovieHistoryDispatchContext.Provider value={dispatch}>
        {children}
      </MovieHistoryDispatchContext.Provider>
    </MovieHistoryStateContext.Provider>
  );
};

// ==========================================
// CUSTOM HOOKS DE CONSUMO
// ==========================================

/**
 * Hook para leer la lista histórica (solo lectura).
 */
export const useMovieHistory = () => {
  const context = useContext(MovieHistoryStateContext);
  if (context === undefined) {
    throw new Error('useMovieHistory debe ser utilizado dentro de un MovieHistoryProvider');
  }
  return context;
};

/**
 * Hook estricto para despachar eventos (no triggerea renders al leer estado).
 */
export const useMovieActions = () => {
  const context = useContext(MovieHistoryDispatchContext);
  if (context === undefined) {
    throw new Error('useMovieActions debe ser utilizado dentro de un MovieHistoryProvider');
  }
  return context;
};
