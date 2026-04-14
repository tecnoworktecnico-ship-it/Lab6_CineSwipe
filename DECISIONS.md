# Decisiones Arquitectónicas (ADRs) - CineSwipe

Este documento registra las decisiones técnicas clave (Architecture Decision Records) adoptadas durante la **Fase 1** del desarrollo de CineSwipe para futuras referencias, onboarding de equipo y evaluación del Capstone.

## Tabla de Resumen de Decisiones

| ID | Área / Módulo | Decisión Tomada | Justificación Principal |
|----|---------------|-----------------|-------------------------|
| [ADR-001](#adr-001-gestión-de-estado-react-context-vs-librerías-externas) | Manejo de Estado | React Context + useReducer | Minimiza dependencias externas y mantiene la simplicidad en la fase MVP. |
| [ADR-002](#adr-002-eventos-de-desplazamiento-pointer-events-vs-librerías-de-gestos) | UI / Gestos | Pointer Events Nativos | Evita el sobrepeso en el bundle size (overhead), requiriendo matemática manual para el drag. |
| [ADR-003](#adr-003-proveedor-de-datos-tmdb-vs-otras-apis-de-películas) | Origen de Datos | The Movie Database (TMDB) v3 | Gratuitidad generosa, amplia riqueza de metadatos e imágenes, soporte avanzado de paginación e idiomas. |
| [ADR-004](#adr-004-desarrollo-delegación-a-ia-vs-código-manual) | Workflow de Código | Agente IA (Antigravity) Híbrido | Velocidad de prototipado para componentes pesados y documentación, con el desarrollador como director de orquesta. |

---

## ADR-001: Gestión de Estado (React Context vs Librerías Externas)

**Contexto:**
La aplicación requiere persistir una lista histórica de películas interactuadas (likes/dislikes) entre navegaciones independientes y el gestor de UI del Swipe. Se debe elegir si usar las utilidades incluidas en React o importar librerías focalizadas e instalables (`Zustand`, `Redux`, `Jotai`).

**Decisión:**
Se optó por generar la arquitectura de estado estrictamente funcional y nativa empleando únicamente `useReducer` sumado a `React Context API` con múltiples contextos (separando Lectura y Escritura).

**Consecuencias Positivas:**
* Carga de dependencias nula (zero dependencies) protegiendo el *bundle size*.
* Demuestra entendimiento puro de los flujos unidireccionales de React y memorización (`useMemo`, contextos partidos) ideal para evaluaciones técnicas (Capstone).
* No hay fricción en versiones futuras del Core de React.

**Consecuencias Negativas (Limitaciones Honorables):**
* Propagación en cadena: todo el árbol de componentes suscrito a `useMovieHistory` se re-renderizará ante un solo Swipe si no se aplican micro-optimizaciones pesadas (`React.memo`).
* No escala bien si el objeto global llega a tener más de 5 sub-nodos o almacenes diferentes.

**Alternativas Consideradas:**
* *Zustand:* Hubiera sido la siguiente solución natural por su atomicidad y simplicidad extrema, pero agregaba dependencia de terceros incensaría para la fase 1.
* *Redux Toolkit:* Demasiado *boilerplate* para una aplicación que no es Enterprise aún.

---

## ADR-002: Eventos de Desplazamiento (Pointer Events vs Librerías de Gestos)

**Contexto:**
El motor principal del producto emula la interacción "swipeable" estilo *Tinder*. Exigía captura de gestos y resolución de físicas (rotación y retrocesos condicionales según el threshold arrastrado).

**Decisión:**
Se implementó matemática geométrica completamente manual e inyectada mediante llamadas genéricas a `onPointerDown`, `onPointerMove` y `onPointerUp`, enlazando un valor de `Transform: translate()` a una variable de estado de React.

**Consecuencias Positivas:**
* Pleno control a nivel microscópico del DOM y los flujos CSS.
* Complejidad reducida para los desarrolladores de mantención (baste con leer el componente aislado, no es necesario documentarse o certificarse en el uso de librerías exóticas).
* Sumamente ligero y un excelente ejercicio demostrativo de accesibilidad por haber habilitado "fallbacks" nativas con teclado sobre el mismo handler.

**Consecuencias Negativas (Limitaciones Honorables):**
* Falta de "Físicas de Resorte" reales (*Spring Physics*). Las cartas simplemente saltan de forma rígida y lineal combinando solo CSS (`transition-transform ease-out`).
* Incompleto soporte intermedio ante bugs complejos nativos (arrastre accidentado a dos dedos o *scroll bounce* en iOS de Apple).

**Alternativas Consideradas:**
* *Framer Motion* o *React-Use-Gesture*: Ambas resolverían el 100% de las limitantes descritas (inercia elástica para tirar las cartas), al costo de empaquetar megabytes adicionales en el sitio sumado a la alta curba de aprendizaje requerida.

---

## ADR-003: Proveedor de Datos (TMDB vs Otras APIs de Películas)

**Contexto:**
Requeríamos una base de datos estandarizada remotamente para obtener posters limpios, clasificaciones genuinas con años separados y un punto de acceso (endpoint) para realizar minería con filtrado flexible (Discovery).

**Decisión:**
Emplear la The Movie Database (TMDB v3 API) atacando el endpoint general `/discover/movie`.

**Consecuencias Positivas:**
* Altamente madura. Entrega resoluciones de variadas calidades para portadas (`poster_path`) lo que optimiza el mobile vs desktop.
* Cuota de Rate-Limit increíblemente alta para aplicaciones incipientes en etapa académica / early-access.
* Proporcionó directamente variables de localización permitiendo configurar la aplicación para mercado hispanoablante puro (`es-MX`/`es-ES`).

**Consecuencias Negativas (Limitaciones Honorables):**
* Obliga al front-end a hacer limpieza de datos (ej. los generos llegan en IDs numéricos como `[12, 14]` en lugar de strings), forzándolo en un punto a reatacar otra API global para hacer el mapeo.
* Exiliados temporalmente de funciones si se caen las redes de caché de imagen de los CDNs que TMDB opera por separadao. 

**Alternativas Consideradas:**
* *OMDB API / IMDB Scraping*: Limitado a una única petición por requerimiento directo de título, no poseía el nivel técnico y riqueza de la estructura del endpoint "Discovery" para traer bloques de 20 películas por género.

---

## ADR-004: Desarrollo (Delegación a IA vs Código Manual)

**Contexto:**
Para la producción de este Capstone y el acotado tiempo de iteración disponible, debíamos optimizar qué áreas merecían inversión manual versus delegación arquitectónica total.

**Decisión:**
Se desarrolló como un ecosistema híbrido **"Agente-Director"**. Se delegó a un Agente de IA el armado en masa (Boilerplates), redacciones técnicas complejas y la matemática geométrica de rotaciones; mientras que el creador humano limitó intervenciones puntuales al diseño de arquitectura por constraints, manipulación sensible de credenciales (`.env`), dictamen estricto de accesibilidad y definición meticulosa de reglas del producto.

**Consecuencias Positivas:**
* Avance de prototipo en tiempo exponencial (`10x`).
* Implementación rigurosa de control de errores aburridos del HTTP, de forma predeterminada sin que se le escape nada (Aborts en llamadas, validación Typscript Guardiana, Rate Limits preventivos).
* Autogeneración de un hilo robusto de trazabilidad y documentación que normalmente un solodev esquiva.

**Consecuencias Negativas (Limitaciones Honorables):**
* Posible sobreringenería en archivos periféricos, lo que puede elevar las curvas cognitivas cuando en 6 meses el humano intente recodificar partes automatizadas previamente. 
* Un mal prompt sin validación final de control puede disparar mutaciones arquitectónicas no pedidas en código frágil. 

**Alternativas Consideradas:**
* *Coding 100% Humano:* Fricción elevada, tiempo agotado para cumplir con el deadline académico.
* *Automatización Directa por Auto-agentes locales:* Pérdida de soberanía en el modelado del proyecto, riesgo de ignorancia técnica para las sustentaciones verbales posteriores.

---

## Próximas Decisiones Pendientes (Fase 2)

A medida que el proyecto migre hacia sus iteraciones completas y finales, los siguientes ADRs deberán evaluarse y firmarse:

1. **Orquestación de la UI:** Decisión sobre la unificación de las cartas en el componente central contenedor (`SwipeDeck.tsx`), lidiando con cómo enmascarar o cachear en base-64 imágenes pasadas antes de renderizarlas para que los usuarios no experimenten parpadeos de conexión mala (offline-ready).
2. **Animaciones Fluidas Interactivas (Lista de Historial):** ¿Incorporar framer-motion o AutoAnimate solo para renderizar las transiciones de las películas que ya han entrado al historial (Lista lateral) o mantener el puro CSS?
3. **Persistencia Avanzada:** Estudiar limitantes de memoria y saltar de la API `localStorage` cruda a una base temporal `IndexedDB` si el límite de 50 ítems en la cola de historial es expandido a ilimitado.
4. **Mapeo Real de Metadatos de Autocompletado:** Cómo gestionar mapeos para los `genre_ids` sin machacar la carga de primer render con una solicitud forzada al server de configuraciones preestablecidas de TMDB. 
