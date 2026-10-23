# DevDay Studio

Editor web de promociones DevDay Community, construido con React, TypeScript strict y Vite. Sigue los assets digitales DDE y las referencias de publicaciones de speakers proporcionadas.

## Iniciar

Requiere Node.js 22 o superior y npm.

```powershell
npm install
npm run dev
```

```powershell
npm test
npm run build
npm run preview:auth -- --mock-auth
```

`build` ejecuta TypeScript y Vite, e integra los recursos en `dist/server/index.js`, un Worker ESM de Sites. La autenticación está gestionada por Sites; no necesita API keys, Supabase ni una base de datos. `npm run dev` sirve el editor sin sesión para desarrollo. `preview:auth -- --mock-auth` prueba el Worker compilado con identidad simulada únicamente en loopback. El simulador no forma parte del artefacto publicado.

## Uso

1. En **Tus eventos** selecciona uno existente, usa **Nuevo evento** o **Editar evento**. Guarda nombre, ciudad, fecha, horario, lugar, enlace y notas internas. Puedes eliminarlo con confirmación; la pieza actual se conserva. Si cambias datos directamente en el diseño, usa **Guardar datos en el evento** para actualizar la lista.
2. En Diseño elige Community, Speaker o Editorial, el fondo claro/oscuro y el color de acento.
3. Añade una foto JPG, PNG o WebP (hasta 20 MB). Ajusta zoom y posición dentro del recorte circular.
4. Selecciona Cuadrado (1080 × 1080), Retrato (1080 × 1350), Historia (1080 × 1920) u Horizontal (1920 × 1080).
5. En Animación elige órbita, rebote, ondas, flotación, expresiones o composición estática. Ajusta duración entre 2 y 12 segundos. Pausa o mueve la línea de tiempo para elegir el fotograma de una imagen fija.
6. Exporta la pieza. Desde el menú de tres puntos puedes guardar o abrir un archivo JSON editable con **el diseño y toda la lista de eventos**, o empezar de nuevo sin borrar tus eventos. Los archivos anteriores que solo incluyen el diseño siguen funcionando.
7. Cambia la interfaz entre español e inglés con **ES/EN**, arriba a la derecha. En **Diseño → Idioma de la promoción** elige el idioma de fechas y textos automáticos de la pieza. Los textos que escribiste se conservan; puedes traducirlos en Contenido. La primera visita toma el idioma del navegador y después recuerda tu elección.

## Exportaciones

- PNG: resolución completa, sin pérdida.
- JPG: resolución completa y calidad 95 %.
- GIF: lado mayor de 720 px, 12 fotogramas por segundo, paleta de 256 colores por fotograma y bucle infinito. La codificación corre en un Web Worker para mantener la interfaz disponible. Los tiempos GIF alternan intervalos de 80/90 ms para conservar la duración total.
- Video: resolución completa, captura de 30 fps y objetivo de 8 Mbps. Se ofrece MP4/H.264 si MediaRecorder lo admite; de lo contrario, WebM/VP9 o VP8. La duración y tasa efectiva dependen del navegador y del rendimiento del dispositivo. Mantén la pestaña visible durante la grabación. No lleva audio.

La misma función Canvas dibuja la vista previa y todos los fotogramas exportados. La descarga incluye un ciclo de animación y puede cancelarse. Si un navegador no permite video, la opción se desactiva y se puede usar GIF.

## Datos y privacidad

El contenido se guarda con debounce de 450 ms en `localStorage`: las claves `devday-studio:design:v1` y `devday-studio:events:v1` llevan el identificador de la cuenta en el Site; `devday-studio:locale:v1` conserva el idioma del navegador. El borrador anterior se migra una sola vez a la primera cuenta que inicia sesión en ese navegador. Otras cuentas comienzan con sus propias claves. Esto no es almacenamiento en la nube ni cifrado del almacenamiento local. Los eventos validan fecha real, horario de fin posterior al inicio y enlaces HTTP/HTTPS. Las horas siguen siendo de Ecuador, UTC−5. Las fotos se redimensionan en el navegador a un máximo de 1600 px y se incorporan al borrador. No se envían a un servidor. El borrador es específico del navegador y origen; no se sincroniza entre dispositivos. Si no hay espacio, la interfaz avisa y permite guardar un archivo editable.

Los archivos importados se validan y los valores numéricos se acotan. Los enlaces externos solo admiten HTTP/HTTPS. Se respetan las preferencias de movimiento reducido para la reproducción inicial. No hay telemetría.

## Eventos precargados

Datos principales de Luma consultados el 21 de octubre de 2026, hora de Ecuador (UTC−5):

| Ciudad | Fecha | Horario | Fuente |
| --- | --- | --- | --- |
| Guayaquil | 24 octubre 2026 | 10:00–12:00 | https://luma.com/kqtwlegj |
| Manta | 7 noviembre 2026 | 11:00–13:00 | https://luma.com/kbp80p3l |
| Machala | 11 noviembre 2026 | 10:00–12:00 | https://luma.com/d6x6ojiv |
| Quito | 26 noviembre 2026 | 10:00–12:00 | https://luma.com/z8wr54j3 |

Manta tiene datos contradictorios: la descripción menciona 24 de octubre a las 10:00. La aplicación utiliza el horario principal estructurado y muestra una advertencia para confirmarlo. Los eventos son presets editables, no una sincronización en vivo. Las direcciones privadas no se infieren: se muestra “Ubicación al registrarte”. Quito sí tiene una sede pública, Universidad Tecnológica Indoamérica.

## Archivos principales

- `src/model.ts`: tipos, formatos, presets y validación del borrador.
- `src/render.ts`: composición, tipografía, recorte fotográfico y agentes.
- `src/motion.ts`: órbitas, rebotes y ondas con ciclos continuos y control de intensidad.
- `src/EventEditor.tsx`: formulario de alta/edición de eventos; conserva cambios al alternar pestañas.
- `src/i18n.ts`: diccionario tipado ES/EN, contexto y preferencia de idioma.
- `scripts/check-model.mjs`: 11 pruebas del dominio, migración y continuidad de animaciones.
- `src/Preview.tsx`: renderizado animado y carga de recursos.
- `src/export.ts`: imágenes, video, cancelación y descarga.
- `src/gif.worker.ts`: codificación GIF fuera del hilo de la interfaz.
- `src/App.tsx`, `src/styles.css`: editor, formulario y diseño adaptable.
- `ASSETS.md`: procedencia de los recursos.
- `worker/index.js`: puerta de acceso, identidad verificada por Sites y recursos visuales.
- `src/AccountMenu.tsx`, `src/session.ts`: cuenta, salida y borradores por cuenta.
- `scripts/build-worker.mjs`: artefacto ESM con assets integrados.
- `scripts/auth.test.mjs`: pruebas de acceso, caché e identidad.
- `.openai/hosting.json`: identidad del Site; usa Worker y ya no declara hosting estático.

## Validación realizada

Build de producción y TypeScript strict sin errores ni warnings. Interacciones verificadas en navegador: edición en vivo, presets, guardado al recargar, cambio de plantillas, temas y formatos. Capturas revisadas en escritorio y móvil sin desbordamiento horizontal. Descarga PNG y GIF; GIF decodificado con 24 fotogramas, 720 × 720, 2000 ms y cambios reales entre fotogramas. MP4 exportado y reproducido con dimensiones 1080 × 1080. La revisión mecánica actual señala diferencias consultivas entre tokens preexistentes y su documentación; las nuevas superficies de error y acciones destructivas están documentadas en DESIGN.md.

### Ampliación de octubre de 2026

Verificados en Chromium: crear y editar un evento de 2027, validación del horario, guardar cambios desde el diseño, persistencia al recargar, cancelar/eliminar, importar respaldo con eventos, idiomas ES/EN, fechas localizadas y vistas de 1440 × 1000 y 390 × 844 sin desbordamiento. El GIF de ondas exportado tiene 24 fotogramas, 720 × 720, 2000 ms y bucle infinito. Video MP4 comprobado mediante metadatos del navegador, 1080 × 1080. `npm test` verifica 11 casos: migración, datos de eventos, fechas, continuidad de los seis modos y movimiento con intensidad cero. No se probó en dispositivos físicos ni en Safari.

## Acceso con ChatGPT

El enlace se puede compartir con cualquier persona que tenga una cuenta de ChatGPT; no existe una lista exclusiva de embajadores. El modo de acceso de Sites admite visitantes por enlace y el Worker exige identidad para servir el editor y `/api/session`. La bienvenida y los recursos visuales son públicos. Las rutas `/signin-with-chatgpt`, `/signout-with-chatgpt` y `/callback` pertenecen a Sites; el proyecto no administra contraseñas, tokens OAuth ni cookies.

En el editor, **Cuenta → Cerrar sesión** guarda de inmediato el borrador y navega a la salida oficial de Sites. Regresa a la bienvenida. Esta acción cierra la sesión del Site, no pretende cerrar la sesión global de ChatGPT. Las respuestas con identidad usan `private, no-store`; al volver a una pestaña o recuperar una página desde el historial se comprueba la sesión.

Verificación local: 19 pruebas automáticas (12 de dominio/persistencia y 7 de acceso), entrada y salida simuladas, bloqueo del editor sin sesión, recuperación del borrador al volver a entrar, y capturas en 1440 × 1000 y 390 × 844. La prueba con identidad simulada no equivale a completar OAuth con una cuenta real de un embajador.
