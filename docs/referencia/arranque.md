# arranque

### main.tsx

`src/main.tsx`

### vite.config.ts

`vite.config.ts`

Notas:

- Cada ruta se carga bajo demanda (chunk por pantalla).
- Librerías pesadas en chunks propios y cacheables.
- En desarrollo el frontend habla con el backend en el mismo origen vía proxy; VITE_API_URL vacío usa este proxy.
- La cookie de refresh se emite con Path=/auth; detrás del proxy el navegador la necesita en /api/auth para enviarla al renovar.
- Mínimos actuales: solo pueden subir. La cobertura de la web es baja (las páginas no tienen pruebas); subirlos a medida que se agreguen. Vitest 4 ya cuenta las ramas y funciones de los archivos sin pruebas (antes salían casi al 100 %): con las mismas pruebas, 45 y 25 pasaron a 5,8 y 5,9.
