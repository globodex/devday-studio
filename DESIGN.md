---
name: DevDay Studio
description: Sistema visual del editor de piezas digitales DevDay Community.
colors:
  error-surface: "#fff1e9"
  destructive: "#873d1e"
  destructive-hover: "#6f3017"
  action: "#16633d"
  action-hover: "#104d2f"
  app-background: "#f8f9f7"
  surface: "#fff"
  canvas-surround: "#eef0eb"
  text: "#1d241f"
  muted: "#697269"
  supporting-text: "#64705c"
  border: "#e2e6df"
  field-border: "#dfe4db"
  field-text: "#253026"
  field-focus: "#568264"
  focus-ring: "#66ae87"
  secondary-border: "#d8dfd4"
  secondary-hover: "#f2f5ef"
  selected-surface: "#f6faf2"
  format-surface: "#e5e9e1"
  artwork-dark: "#131410"
  artwork-light: "#f7f7f2"
  artwork-text-light: "#151710"
  artwork-muted-dark: "#b0b2a8"
  artwork-muted-light: "#62675d"
  artwork-footer-dark: "#25271f"
  artwork-footer-light: "#e9ece4"
  agent-green: "#00b647"
  agent-purple: "#9146ff"
  agent-blue: "#0668ff"
  agent-orange: "#ff7900"
  agent-white: "#e7e7e1"
  agent-face: "#11130f"
  badge-text: "#10140e"
typography:
  display:
    fontFamily: "'OpenAI Sans', sans-serif"
    fontSize: "150px"
    fontWeight: 700
  headline:
    fontFamily: "'OpenAI Sans', sans-serif"
    fontSize: "19px"
    fontWeight: 600
    letterSpacing: "-.5px"
  title:
    fontFamily: "'OpenAI Sans', sans-serif"
    fontSize: "13px"
    fontWeight: 600
    letterSpacing: "-.15px"
  body:
    fontFamily: "'OpenAI Sans', sans-serif"
    fontSize: "14px"
    fontWeight: 400
  label:
    fontFamily: "'OpenAI Sans', sans-serif"
    fontSize: "11px"
    fontWeight: 400
  control:
    fontFamily: "'OpenAI Sans', sans-serif"
    fontSize: "13px"
    fontWeight: 600
  wordmark:
    fontFamily: "'OpenAI Wordmark', 'OpenAI Sans', sans-serif"
    fontSize: "53px"
    fontWeight: 400
rounded:
  thumbnail: "4px"
  segment: "6px"
  field: "7px"
  control: "8px"
  option: "9px"
  toast: "10px"
  panel: "12px"
  dialog: "16px"
  badge: "24px"
  circle: "50%"
spacing:
  compact: "4px"
  field-gap: "7px"
  small: "8px"
  control-gap: "9px"
  medium: "12px"
  large: "16px"
  section: "24px"
  inspector: "26px"
  dialog: "28px"
  header: "32px"
components:
  button-primary:
    backgroundColor: "{colors.action}"
    textColor: "{colors.surface}"
    typography: "{typography.control}"
    rounded: "{rounded.control}"
    padding: "0 17px"
    height: "40px"
  button-primary-hover:
    backgroundColor: "{colors.action-hover}"
  button-secondary:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text}"
    typography: "{typography.control}"
    rounded: "{rounded.control}"
    padding: "0 17px"
    height: "40px"
  button-secondary-hover:
    backgroundColor: "{colors.secondary-hover}"
  button-icon:
    backgroundColor: "transparent"
    textColor: "#687366"
    rounded: "{rounded.field}"
    height: "34px"
    width: "34px"
  field:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.field-text}"
    rounded: "{rounded.field}"
    padding: "0 11px"
    height: "40px"
    width: "100%"
  tabs:
    padding: "0 19px"
  format-selector:
    backgroundColor: "{colors.format-surface}"
    rounded: "{rounded.option}"
    padding: "4px"
  template-card:
    backgroundColor: "transparent"
    rounded: "{rounded.control}"
    padding: "5px"
  photo-uploader:
    backgroundColor: "#f8faf6"
    textColor: "#354631"
    rounded: "{rounded.option}"
    padding: "13px 12px"
    width: "100%"
  artwork-badge:
    backgroundColor: "{colors.agent-green}"
    textColor: "{colors.badge-text}"
    rounded: "{rounded.badge}"
    height: "48px"
---

# Design System: DevDay Studio

## Overview

**Creative North Star: "Los assets digitales DevDay en el centro"**

La identidad procede de los assets digitales DDE y las referencias de speakers suministradas. OpenAI Sans, los agentes circulares con expresiones y los colores saturados pertenecen a las piezas; el entorno de edición usa blancos y verdes suaves para mantener legibles los controles.

La densidad es compacta y la jerarquía depende de la tipografía, la separación y los estados seleccionados. Las superficies de formulario son planas; el lienzo tiene la profundidad necesaria para distinguir la pieza de su entorno.

**Key Characteristics:**

- OpenAI Sans local y wordmark propio.
- Entorno claro, acciones verdes y piezas con tema claro u oscuro.
- Agentes circulares expresivos como firma visual.
- Controles compactos, selección visible y foco de teclado.
- Composiciones propias para cuatro relaciones de aspecto.

Los tokens se extrajeron de src/styles.css y src/render.ts; los formatos y valores iniciales se contrastaron con src/model.ts. Son la descripción de la implementación actual.

## Colors

El verde de acción organiza la interfaz; verde, violeta, azul y naranja aportan la expresión de las piezas.

### Primary

Action y action-hover identifican la acción principal, las pestañas activas y los controles seleccionados. Focus-ring se reserva para el foco visible. El verde de los agentes es un acento de la pieza distinto del verde de acción.

### Secondary

Agent-purple, agent-blue y agent-orange acompañan a agent-green en los agentes y la elección de acento. Agent-white forma el agente pequeño neutro. Agent-face dibuja los ojos y expresiones.

### Neutral

App-background, surface y canvas-surround separan aplicación, formulario y área de trabajo. Text es el texto principal; muted acompaña títulos y supporting-text unifica ayudas, metadatos y descripciones. Border divide paneles y secciones; field-border delimita entradas.

Artwork-dark y artwork-light son los fondos del renderizador. La pieza oscura usa artwork-light como texto; la clara usa artwork-text-light. Cada tema tiene su texto secundario y su franja de pie propios.

**The Editorial Contrast Rule.** El titular editorial pasa por readableAccent: conserva el acento cuando alcanza 3:1 contra el fondo y, si no, acerca sus canales RGB al negro o al blanco hasta alcanzar ese contraste. El umbral corresponde a ese titular grande; no es una garantía general para textos pequeños ni se aplica automáticamente a insignias, agentes o fotografías.

## Typography

OpenAI Sans se carga desde archivos OTF locales: Regular para peso 400 y Bold para los pesos declarados 600–900. OpenAI Wordmark se usa exclusivamente en la marca del lienzo. La interfaz desactiva la síntesis de fuente.

El tamaño base de interfaz es el token body. Los títulos del inspector usan headline y las cabeceras de sección title. Las etiquetas de campo usan label; los campos muestran texto de 12px en escritorio y 14px en móvil. Las ayudas usan 10px y altura de línea 1.5; el contraste final de sus selectores usa supporting-text.

El token display describe el título community/speaker a su tamaño inicial en formatos verticales y cuadrado. En horizontal comienza en 180px. El título editorial comienza en 112px, o 140px en horizontal, y usa peso 400. El renderizador reduce el tamaño para ajustar el ancho disponible. Los bloques de dos líneas usan interlineado 1.3 y elipsis si exceden el máximo.

**The Shared Typography Rule.** Vista previa y exportaciones usan las mismas fuentes locales y el mismo renderizador; las dimensiones tipográficas de la pieza se expresan en coordenadas del formato de salida, no en píxeles CSS de la vista previa.

## Layout

El editor ocupa el viewport. La cabecera mide 76px y el área de trabajo usa una columna de formulario de 368px junto a una columna flexible para el lienzo; su alto es calc(100dvh - 76px), con mínimo de 660px. El inspector desplaza su contenido internamente y usa 26px de margen interior. Las secciones tienen separación vertical de 24px.

El área de vista previa usa padding 20px 42px 16px. Su escenario centra la pieza y emplea unidades de contenedor para encajar ancho y alto sin distorsión: cuadrado 100cqh, retrato 80cqh, historia 56.25cqh y horizontal 177.777cqh, siempre limitados a 100cqw. Los metadatos tienen máximo de 626px y los controles de reproducción de 660px.

| Condición CSS | Adaptación implementada |
| --- | --- |
| min-width: 1650px | Inspector de 390px, márgenes laterales de vista previa de 80px, metadatos hasta 760px y reproducción hasta 800px. |
| max-width: 1150px | Inspector de 330px, vista previa con 24px laterales, controles de formato compactos y sin etiquetas de relación de aspecto. |
| max-width: 800px | Cabecera de 64px; vista previa antes del formulario; desplazamiento de página; campos de 44px; escenario de 430px. |
| max-width: 420px | Vista previa con 14px laterales y escenario de 350px; cabecera y controles de formato más compactos. |

El modo de vista ampliada oculta el inspector y deja una sola columna. En móvil mantiene una altura mínima de escenario de 430px dentro de ese modo.

Los formatos de salida son cuadrado 1080 × 1080, retrato 1080 × 1350, historia 1080 × 1920 y horizontal 1920 × 1080. El renderizador cambia posiciones, tamaños y columnas: la historia mueve al organizador a una línea inferior; el horizontal abre el bloque de texto y desplaza el protagonista hacia la derecha. El margen de composición es 64px, o 90px en horizontal. No se obtiene cada formato mediante el recorte del cuadrado.

## Elevation & Depth

El formulario y sus controles se delimitan con tonos y bordes. Las sombras separan la pieza y las superficies flotantes; no se aplican indiscriminadamente a cada sección.

| Uso | Sombra CSS |
| --- | --- |
| Pieza | 0 12px 38px #1b2b1621 |
| Segmento de formato seleccionado | 0 2px 5px #253b1c0b |
| Menú | 0 10px 35px #172c1921 |
| Aviso temporal | 0 6px 24px #183d2326 |
| Confirmación | 0 8px 30px #19361520 |
| Ayuda | 0 8px 38px #183d2326 |
| Diálogo de exportación | 0 30px 90px #111b2030 |

El diálogo usa un fondo superpuesto #18201bc2 con desenfoque de 3px. Su ancho es 460px, limitado a calc(100vw - 32px); su altura máxima es calc(100dvh - 40px) y permite desplazamiento interno.

## Shapes

Los controles usan esquinas suaves: field para entradas, control para botones y tarjetas de plantilla, option para opciones de selección y carga de foto. Panel se utiliza en reproducción, menú y ayuda; dialog en exportación. El lienzo conserva esquinas rectas.

El círculo es la forma de agentes, retratos, muestras de color y reproducción. Los retratos se recortan mediante un círculo y admiten zoom y desplazamiento dentro del recorte. Las insignias de las piezas community y speaker usan badge; la variante editorial reduce el radio a 5px.

## Components

### Buttons

La acción principal tiene texto blanco y verde de acción. La secundaria es blanca con borde secondary-border. Ambas usan el token de altura y padding documentado en frontmatter. El botón de exportación de cabecera ajusta padding a 0 18px; en móvil mide 37px y usa 0 12px. La descarga del diálogo ocupa todo el ancho y mide 46px.

Los botones transicionan fondo, borde y transformación en .15s. Al presionar se desplazan 1px; deshabilitados muestran opacidad .5. El foco de teclado usa un contorno de 3px y separación de 3px.

### Inputs / Fields

Los campos usan borde de 1px, texto field-text y etiquetas externas. Al pasar el puntero el borde cambia a #adbca6 y al enfocar a field-focus. Las ayudas se colocan debajo del control. Las fechas y horas comparten una fila de tres columnas con proporciones adaptadas por breakpoint.

### Navigation

Tres pestañas organizan el inspector. La activa usa verde, peso 600 y subrayado de 2px; el fondo permanece abierto. El selector de formatos reúne segmentos dentro de format-surface: el seleccionado es blanco con sombra suave y estado aria-pressed.

### Cards / Containers

Las tarjetas de plantilla muestran una miniatura y su nombre. La seleccionada usa borde verde y fondo #f4f8f0. Las opciones de tema, movimiento y exportación combinan borde verde y selected-surface para distinguir selección. El cargador de foto usa borde discontinuo y miniatura circular cuando existe una fotografía.

### Artwork badge

La insignia del lienzo mide 48px de alto y utiliza el acento elegido, texto badge-text de 23px y peso 700. El ancho se calcula según la medida del texto más 40px, limitado por el ancho del bloque. Esta insignia es parte de la pieza, no un control.

### Expressive agents

Cinco expresiones —redonda, cruz, chevrón, raya y estrella— se dibujan en círculos con ojos proporcionales al radio. El parpadeo depende de la fase del ciclo; el modo de flotación añade desplazamiento sinusoidal proporcional a la intensidad. El modo sin movimiento fija la fase en .25. Órbita añade desplazamientos elípticos locales y arcos alrededor del protagonista; Rebote coordina saltos con compresión y giro; Ondas expande anillos de color. La intensidad regula desplazamiento, escala y opacidad. Todos comparten ciclos periódicos en motion.ts para que vista previa, GIF y video coincidan. La vista previa suspende sus fotogramas cuando la pestaña está oculta.

La demostración de interfaz usa ciclos de 4s ease-in-out. La preferencia de movimiento reducido desactiva animaciones y transiciones CSS e inicia la reproducción pausada. La reproducción sigue siendo una acción explícita disponible.

## Do's and Don'ts

### Do:

- Do mantener las fuentes locales y los assets digitales como autoridad visual.
- Do separar el verde de acción de los acentos saturados de las piezas.
- Do conservar el foco visible, la selección explícita y el color final de los textos de ayuda.
- Do comprobar cada composición en su propio formato y conservar la vista previa antes del formulario en móvil.
- Do usar readableAccent para el titular editorial y el mismo renderizador para vista previa y descarga.

### Don't:

- Don't sustituir las composiciones digitales por las de impresión.
- Don't recortar el formato cuadrado para simular historia, retrato u horizontal.
- Don't atribuir el ajuste de contraste editorial a todos los elementos del lienzo.
- Don't añadir navegación ficticia ni controles que no tengan una acción.
- Don't activar automáticamente la reproducción cuando el navegador solicita movimiento reducido.

## Eventos e idiomas

La gestión de eventos vive al principio de Contenido: selector, acción Nuevo evento y controles de editar/eliminar. El formulario se expande en el inspector, sin interrumpir el lienzo. Conserva el borrador al cambiar de pestaña. Eliminar requiere confirmación inline y conserva la pieza. Los errores usan fondo #fff1e9 y texto #873d1e. El botón destructivo usa ese mismo tono.

El selector ES/EN está en cabecera, con icono Languages en escritorio y abreviatura compacta en móvil. El idioma de la promoción se elige por separado en Diseño. Las etiquetas, ayudas, estados, errores y accesibilidad usan el diccionario tipado; los valores introducidos por la persona no se traducen automáticamente.
