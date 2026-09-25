# Terra360 — Frontend

Frontend de la plataforma de evaluación organizacional (React + Vite + TanStack Router).

Arquitectura por módulos con clean architecture (domain / application / infrastructure / presentation).

## Desarrollo

```bash
npm install
npm run dev
```

API en `http://localhost:5173` (proxy a `/api` hacia el backend en `http://localhost:3100`). Variables de entorno: ver `.env.example`.

## Despliegue (Vercel)

El repo incluye `vercel.json` (build `npm run build`, output `dist`, rewrite SPA a `index.html`).

1. Importa el repo en Vercel (framework: Vite, detectado automáticamente).
2. Define la variable de entorno `VITE_API_URL` con la URL del backend en Heroku (ej. `https://tu-backend.herokuapp.com`).
3. En el backend, agrega la URL que asigne Vercel (ej. `https://tu-app.vercel.app`) a `CORS_ORIGIN`.

Si usas Google OAuth, define también `VITE_GOOGLE_OAUTH_CLIENT_ID` (debe coincidir con `GOOGLE_OAUTH_CLIENT_ID` del backend).
