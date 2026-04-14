import { useState, useCallback, useEffect, useRef } from 'react';
import { TMDBResponse, TMDBMovie } from '../../types/tmdb.types';

// Opciones de configuración
const RAW_URL = 'https://api.themoviedb.org/3';
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutos de tiempo de vida

export interface UseMoviesOptions {
  genre?: number;
  year?: number;
}

// Type Guard para validar la estructura de la respuesta en tiempo de ejecución
function isTMDBResponse(data: unknown): data is TMDBResponse {
  return (
    data !== null &&
    typeof data === 'object' &&
    'page' in data && typeof (data as any).page === 'number' &&
    'results' in data && Array.isArray((data as any).results)
  );
}

/**
 * Hook personalizado para obtener el listado de películas desde TMDB.
 *
 * - Integra caché temporal local con TTL (sessionStorage).
 * - Control de aborto explícito al desmontar (cleanup).
 * - Paginación por demandas (loadMore).
 *
 * @param {UseMoviesOptions} [options] - Parámetros limpios de búsqueda, como género o año.
 * @returns {Object} Data, estado de carga, errores posibles y función repetidor de carga.
 */
export const useMovies = (options?: UseMoviesOptions) => {
  const [movies, setMovies] = useState<TMDBMovie[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  const [page, setPage] = useState<number>(1);
  const [hasMore, setHasMore] = useState<boolean>(true);

  const abortControllerRef = useRef<AbortController | null>(null);

  // La función usa useCallback para independizarse y regenerarse solo si cambian los filtros
  const fetchPage = useCallback(async (currentPage: number, resetMovies: boolean = false) => {
    // Si hay una request activa anterior, abórtala para evitar sobreescritura/memory leaks.
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    const apiKey = import.meta.env.VITE_TMDB_KEY;
    if (!apiKey) {
      setError("VITE_TMDB_KEY no está configurada en las variables de entorno.");
      return;
    }

    const queryParams = new URLSearchParams({
      api_key: apiKey,
      page: currentPage.toString(),
      sort_by: 'popularity.desc',
      language: 'es-MX'
    });

    if (options?.genre) queryParams.append('with_genres', options.genre.toString());
    if (options?.year) queryParams.append('primary_release_year', options.year.toString());

    const url = `${RAW_URL}/discover/movie?${queryParams.toString()}`;
    const cacheKey = `cineswipe_cache_${queryParams.toString()}`;

    // Estrategia Stale/Cache: Verifica sessionStorage primero
    const cachedRecordStr = sessionStorage.getItem(cacheKey);
    if (cachedRecordStr) {
      try {
        const cachedRecord = JSON.parse(cachedRecordStr);
        if (Date.now() - cachedRecord.timestamp < CACHE_TTL_MS) {
          if (isTMDBResponse(cachedRecord.data)) {
            setMovies(prev => resetMovies ? cachedRecord.data.results : [...prev, ...cachedRecord.data.results]);
            setHasMore(cachedRecord.data.page < cachedRecord.data.total_pages);
            return; // Exit here if valid cache hits
          }
        }
      } catch (e) {
        // Caché corrupto / inválido; lo ignoramos silenciosamente para volver a fecthear.
      }
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(url, { signal: abortController.signal });

      if (!response.ok) {
        // Manejarlos individualmente asegura un buen debugging
        if (response.status === 401) throw new Error("Error 401: Llave API de TMDB inválida o suspendida.");
        if (response.status === 404) throw new Error("Error 404: Endpoint o Recurso de TMDB no encontrado.");
        if (response.status === 429) throw new Error("Error 429: Too Many Requests. Límite de carga excedido en TMDB.");
        
        throw new Error(`Error en la comunicación con TMDB: ${response.statusText}`);
      }

      const data = await response.json();

      // Validación Typescript vía Type Guard estricto
      if (!isTMDBResponse(data)) {
        throw new Error("Estructura de payload de TMDB corrompida o inesperada.");
      }

      // Escribir a Caché
      sessionStorage.setItem(cacheKey, JSON.stringify({
        timestamp: Date.now(),
        data: data
      }));

      // Setear Estado de UI
      setMovies(prev => resetMovies ? data.results : [...prev, ...data.results]);
      setHasMore(data.page < data.total_pages);

    } catch (err: any) {
      if (err.name === 'AbortError') {
        // Ignorar el log si fue cancelado a nuestro propio mandato
        console.count('Limpiando o redirigiendo request fallida.'); 
      } else {
        setError(err.message || 'Error Desconocido');
      }
    } finally {
      if (!abortController.signal.aborted) {
        setLoading(false);
      }
    }
  }, [options?.genre, options?.year]);

  // Observer de inicialización. Reacciona a los cambios en los filtros y monta primer call.
  useEffect(() => {
    setPage(1);
    fetchPage(1, true);

    return () => {
      // Limpieza (Cleanup): Romper solicitudes HTTP abiertas si sacamos o recargamos componente a la fuerza
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchPage]); 

  const loadMore = () => {
    if (!loading && hasMore && !error) {
      const next = page + 1;
      setPage(next);
      fetchPage(next, false);
    }
  };

  return { movies, loading, error, loadMore, hasMore };
};
