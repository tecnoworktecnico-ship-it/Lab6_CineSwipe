# Propuestas de mejora para CineSwipe

Después de ver cómo quedó la fase 1, anoté varias cosas que se podrían mejorar para la segunda etapa del proyecto. Trate de ordenarlas de mas a menos urgentes.

Cosas urgentes de Interfaz y Usabilidad:
- En la UI no hay forma de cambiar visualmente los filtros de género o año. El hook que armamos (useMovies) ya lo soporta por detrás, pero nos falta agregar unos botoncitos o selects arriba del mazo.
- Estaría súper bien tener un panel lateral que muestre el historial de las pelis que nos gustaron y las que no. El Context ya está guardando toda esta data pero el usuario no tiene forma de verla.
- Faltaría agregar botones tradicionales (la típica cruz o corazón) debajo de la tarjeta, porque en mobile a veces la gente simplemente prefiere hacer tap en vez de arrastrar el dedo.
- Al soltar la tarjeta antes del límite necesario, regresa al centro un poco rígida. Se puede arreglar rapidísimo ajustando la curva en el transition del CSS.

Detalles visuales y de fluidez:
- Cuando pasas de carta a veces parpadea blanco. Podemos hacer una pre-carga de las siguientes dos imágenes en javascript usando new Image().
- Estaría bueno poner un modal clarito de bienvenida explicando cómo se swipea para los que no cazan la onda de Tinder.
- Sería un buen toque agregar transiciones de modo oscuro / claro al fondo.

Deuda técnica a limpiar:
- En SwipeDeck metimos un objeto con parche de tipos ("as any") que fue temporal porque las props de SwipeCard no cuadraban 100% con la respuesta de TMDB que devuelve ids numericos en vez de strings. Hay que arreglar bien esa interfaz.
- El guardado en localStorage pasa a cada rato cuando swipeamos. Estaría bueno meterle un debounce de medio segundo para no golpear tanto al navegador.
- Escribir aunque sea un par de tests básicos con Vitest para asegurarnos de que la cola del historial (reducer) no se rompa mas adelante.

Ideas a futuro:
- Usar la suma de los "genre_ids" que el usuario le va dando like para calcular su género favorito y pegarle de nuevo a TMDB recomendando películas más parecidas a sus gustos en el momento.
- Capacidad para instalarla en Android/iOS como PWA con un par de configuraciones en Vite.
