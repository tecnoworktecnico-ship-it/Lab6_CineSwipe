# 🎬 CineSwipe

![Lighthouse Score](https://img.shields.io/badge/Lighthouse-100%2F100-success?style=for-the-badge&logoColor=white)
![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Vite](https://img.shields.io/badge/vite-%23646CFF.svg?style=for-the-badge&logo=vite&logoColor=white)

CineSwipe es una aplicación web interactiva (Single Page Application) que reinventa la forma en la que descubres películas. Simulando la popular interacción de arrastre ("swipe" de Tinder), te permite calificar películas interactivamente: arrastra hacia la derecha si te interesa, o hacia la izquierda si prefieres saltarla.

Este proyecto destaca por ser un **hito de extrema optimización**, diseñado estructuralmente para lograr un puntaje de **Performance de 100/100 en Google Lighthouse** pese a depender de microservicios externos y de la API dinámica de TMDB.

## ✨ Características Principales
- **Swipe Físico Manual:** Interacción geométrica diseñada en React puro, calculando la inercia del ratón o el dedo táctil.
- **Historial de Decisiones:** Contexto y gestor de estado puro con `useReducer` sin ensuciar dependencias de React (`Zustand`, `Redux` inexistentes).
- **Rendimiento Máximo ("Tier 1"):** Optimización quirúrgica usando inyección de `<link rel="preload">` saltando del V8 JS Engine directamente al renderizador en C++ del navegador. 
- **Conectado a TMDB v3:** API The Movie Database integrada dinámicamente con paginación inteligente de mercado hispanohablante verdadero.
- **Estabilidad Absoluta:** Control de "Cumulative Layout Shift" (CLS = 0.00) protegiendo el enrutamiento ante cuellos de re-renderizado asíncrono.

## 🚀 Arquitectura Híbrida (Desempeño Extremo)
A lo largo de este laboratorio, la estructura de la app fue llevada al extremo:
- Pre-carga del DOM vía codificaciones de Base64 inyectadas físicamente (`LCP HTML nativo`).
- Degradación controlada de Payloads asíncronos para CDN (`w342` -> `w185`).
- Compresión GZIP/Brotli activa usando Vite.
*(Consulta todos los secretos de la integración técnica en el archivo [DECISIONS.md](./DECISIONS.md)).*

## 📦 Instalación y Configuración

1. Clona el repositorio:
```bash
git clone https://github.com/tecnoworktecnico-ship-it/Lab6_CineSwipe.git
cd Lab6_CineSwipe
```

2. Instala las dependencias ultraligeras:
```bash
npm install
```

3. Crea el archivo de variables del marco estructural:
Copia el archivo `.env.example` interno y renómbralo a `.env.local`. Escribe ahí tu `Bearer Token` de prueba gratuito de [TheMovieDetails (TMDB)](https://developer.themoviedb.org/docs).
```env
VITE_TMDB_KEY=tu_api_key_publica
VITE_TMDB_ACCESS_TOKEN=tu_bearer_token_supersecreto
```

4. Corre el desarrollo o la producción:
```bash
npm run dev # Servidor en caliente
npm run build && npm run preview # Visualiza el majestuoso entorno 100/100
```
## 📜 Autores y Documentación
Desarrollado para el **Lab 6 (Capstone)** enfocado en interacciones modernas, escalabilidad en el Frontend y Arquitectura de Optimización de lado Cliente. Revisa nuestra bitácora de iteraciones completa en los `*.md` centrales de este repositorio.
