# Decisiones de la web

| Decisión | Por qué |
|---|---|
| Páginas genéricas por KPI | Organizativa y Capacidades son iguales salvo textos y rutas |
| Token en memoria | En `localStorage` lo leería cualquier script |
| La sesión va por el dominio de la web | Una cookie de terceros se bloquea en Safari, Firefox estricto y Brave |
| Las pestañas se turnan para renovar | Mandaban la misma cookie y el servidor lo tomaba por robo |
| Al vencer la sesión se pide la clave encima | Volver al acceso perdía lo no guardado |
| La caché se vacía al entrar | En un equipo compartido se veían datos de la persona anterior |
| Borradores locales | Recuperan lo escrito si se cierra la pestaña |
| Cola sin conexión solo para errores de red | Reintentar un rechazo no lo arregla |
| Guardado automático a los segundos | Se pidió en el piloto |
| Si otra persona califica, se recarga | Salvo con cambios sin guardar: entonces solo avisa |
| Se ignora el aviso de uno mismo | Recargaba todo tras cada guardado |
| No se avanza con KPI pendientes | Evita llegar al final con huecos; guardar a medias sí se puede |
| Completar revisa contradicciones con IA | Es una ayuda: si falla, no impide completar |
| Fechas sin hora | En Ecuador se mostraba un día menos |
| Pesos con `Number()` | Llegan como texto y se concatenaban: el promedio daba 0 |
| Variación sobre lo redondeado | «7.0 → 7.1» con «=» no cuadraba |
| Seis cortes en el historial | Más no caben sin desplazarse |
| Velocímetros y cronograma propios | Se adaptan al ancho y no suman dependencias |
| Ámbar propio del velocímetro | El amarillo del diseño no contrasta en textos |
| Encabezado con el color pleno | A 10 % el azul y el verde no se distinguían |
| Pantalla explicativa sin rol | El servidor respondía 403 y todo salía vacío |
| Identificador de proyecto fijo | Va en las direcciones guardadas |
| Rutas como texto literal | Lo exige el complemento del enrutador |
| Sin comentarios en el código | La documentación vive en un solo lugar y el pipeline lo vigila |
