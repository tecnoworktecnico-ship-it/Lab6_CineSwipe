import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

interface Todo {
  id: number;
  name: string;
}

export const TodoTest: React.FC = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTodos = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase.from('todos').select();
        
        if (error) throw error;
        
        setTodos(data || []);
      } catch (err: any) {
        setError(err.message || 'Error al conectar con Supabase');
        console.error('Supabase error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTodos();
  }, []);

  if (loading) return <div className="p-4 text-gray-200 animate-pulse">Conectando con Supabase...</div>;
  if (error) return <div className="p-4 text-red-400">Error: {error}</div>;

  return (
    <div className="p-6 bg-gray-800 rounded-xl shadow-lg border border-gray-700 max-w-md mx-auto mt-8">
      <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
        <span className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></span>
        Supabase: Todos
      </h2>
      
      {todos.length === 0 ? (
        <p className="text-gray-300 italic text-sm">No hay tareas en la tabla 'todos'.</p>
      ) : (
        <ul className="space-y-2">
          {todos.map((todo) => (
            <li key={todo.id} className="flex items-center gap-3 text-gray-200 bg-gray-700/50 p-3 rounded-lg border border-gray-600">
              <span className="text-blue-400 font-mono text-xs">#{todo.id}</span>
              <span className="font-medium">{todo.name}</span>
            </li>
          ))}
        </ul>
      )}
      
      <div className="mt-4 pt-4 border-t border-gray-700 text-[10px] text-gray-300 uppercase tracking-widest font-bold">
        Conexión Verificada (Vite + Supabase-js)
      </div>
    </div>
  );
};
