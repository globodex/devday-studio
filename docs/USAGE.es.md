# Guía de uso de DevDay Studio

[Volver al README en español](../README.es.md)

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

## Cuenta y enlace público

En el sitio publicado puedes entrar con tu cuenta de ChatGPT y salir desde **Cuenta → Cerrar sesión**. Los borradores permanecen en este navegador; iniciar sesión en otro dispositivo no los sincroniza. Para transferirlos, exporta e importa un respaldo JSON.

El enlace público tiene una bienvenida disponible sin sesión y una portada social propia. La raíz respeta el idioma del navegador y `/?lang=en` permite compartir la versión en inglés. Las plataformas pueden conservar vistas previas anteriores en caché.
