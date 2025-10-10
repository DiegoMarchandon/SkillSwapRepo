## Estructura 
skillSwap/
│
├── backend/                # Proyecto Laravel
│   ├── app/
│   ├── routes/
│   ├── database/
│   ├── public/
│   └── server.js               # Archivo Node.js para manejar el signaling de WebRTC
│   └── ...
│
├── frontend/               # Proyecto Next.js 15 (con React dentro)
│   ├── src/                
│   │   ├── app/                # App Router
│   │   │   ├── globals.css     # CSS global
│   │   │   ├── layout.js       # Layout global (envuelve todas las páginas)
│   │   │   ├── page.js         # página principal (/)
│   │   │   ├── profile/        # perfiles de usuarios
│   │   │   └── ...
│   │   ├── components/         # componentes reutilizables (botones, forms, cards, etc.)
│   │   │       ├── layout/     # componentes relacionados con estructura y diseño gral (header, container, footer, etc.)
│   │   │       ├── ui/         # componentes relacionados con la interfaz de usuario (Button, input, Modal, Select, etc.)
│   │   │       ├── forms/      # componentes relacionados con formularios (LoginForm,RegisterForm,ContactForm, etc.)
│   │   │       └── ...
│   │   ├── context/            # contextos creados para compartir datos entre componentes 
│   │   ├── hooks/              # funciones personalizadas de React (useState, useEffect, etc.)
│   │   ├── lib/                # funciones helpers (fetch API, validaciones)
│   │   ├── styles/             # Tailwind o CSS modules
│   │   ├── public/             # assets públicos (imágenes, íconos, favicon, etc.)
│   │   ├── utils/             # funciones que manejan lógica relacionada a los componentes.
│   │   └── ...
│   └── ...
├── docs/                   # Documentación del proyecto
└── README.md

## Incorporaciones sobre la marcha

### frame motion para animaciones 3D
librería de animaciones para react que nos ahorra tener que usar CSS puro para animaciones complejas keyframes, escribir JS para listeners de eventos y los problemas con la sincronización de frames cuando se calculan mal. Todo queda declarativo (se describe lo que se quiere hacer sin tener que detallarlo) y dentro del mismo componente.

### axios para solicitudes HTTP en JS
librería de JS que simplifica el trabajo con solicitudes HTTP.
Ya convierte las respuestas a objetos JSON.
Podemos crear un archivo exportable (axios.js) con headers, interceptores de autenticación, etc. Y usarlo en lugar de repetir configuración por cada request.

### hot toast para notificaciones atractivas al usuario
librería liviana para mostrar notificaciones de tipo flotantes y temporales en pantalla. 

### date-fns para trabajar con fechas en Javascript. 
Librería moderna y modular para manipular fechas en JavaScript, tanto en navegador como en Node.js. Con el objetivo de ofrecer funciones simples, puras y predecibles sin modificar el objeto Date nativo. 

### date-fns-tz 
extensión de date-fns que agrega soporte para zonas horarias, usando la API `Intl` del navegador o Node.js.

# servicio de videollamadas.
Objetivo: tener control total del monitoreo y auto-hosting.

## dependencias para WebRTC
WebRTC permite la comunicación P2P entre navegadores, pero no define cómo los clientes se descubren ni cómo intercambian la información necesaria para conectarse(SDP,ICE candidates, Etc.) para eso necesitamos Socket.io

### métricas de WebRTC
en webrtc/page.js, además de ver las cámaras y conectarnos al servidor de signaling, vamos a ver las métricas. Tanto para el análisis técnico como para evidencia objetiva frente a incidencias. 


### carpeta coturn
no forma parte del código de mi aplicación, sino que es un servicio de red independiente, como una base de datos.
servidor TURN/STUN. 
- Debe correr en su propio servidor o contenedor.
- O en la máquina local (si estamos probando).

### demás tependencias 
- WSL2: instala Ubuntu por defecto. Es necesario debido a que Docker Desktop no ejecuta contenedores directamente sobre Windows, sino dentro de un entorno Linux ligero. (Docker usa tecnologías propias de Linux y corre contenedores Linux).
- Docker Desktop: es la forma moderna y recomendada de desplegar coturn y servicios relacionados con WebRTC.
- Socket.io: servidor de signaling. Ejemplo:

[Cliente A] ──> Socket.IO ──┐   
&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; │   
[Cliente B] <── Socket.IO ──┘

1. Cliente A crea una oferta (SDP)
2. La envía al servidor vía Socket.IO
3. El servidor la reenvía a Cliente B
4. Cliente B responde con su SDP
5. Ambos intercambian ICE candidates
6. Se establece la conexión P2P

> instalación: `npm install socket.io` --> en /backend 

- Socket.io-client: librería que se conecta al servidor socket.io (que creamos antes en Laravel) desde el navegador.
> instalación: `npm install socket.io-client` --> en /frontend

### backend/server.js
Servidor Socket.io independiente que escuchará en el puerto 4000.

### frontend/webrtc/page.js
- Se conecta al servidor de signaling que levantaste en Laravel (localhost:4000).
- Usa navigator.mediaDevices.getUserMedia para mostrar el video local.
- Envía y recibe offer, answer y ICE candidates por Socket.io.
- Si abrís dos pestañas de localhost:3000/webrtc:
- En una hacé clic en “Iniciar llamada”.
- En la otra no toques nada: se va a conectar automáticamente.
- Vas a ver tu cámara local y el video remoto.

**pendiente:** 
- pedir diagrama visual simple de cómo interactúan webRTC, Docker Desktop, WSL2, socket.io y mi contenedor coturn de PC.
- "Una vez que pueda montar por completo mi servicio de videollamadas, debo de convencer a mi compañero de proyecto de que elegí la opción más viable, "fácil" de entre todas las que había, y que implica descargar menos cosas para poder montar un servicio de videollamadas del que tengamos control absoluto. Pero al descargar tantas cosas (WSL2, Docker Desktop, socket.io, etc) posiblemente desconfíe Podrías ayudarme a explicarle  la importancia de cada una de las tecnologías que instalamos, cómo se relacionan y porqué resultó la alternativa más viable y liviana de entre las opciones que me presentaste para montar todo de cero?"

- mi idea con las métricas en cuestión es que queden almacenadas una vez que la videollamada finalice para, en caso de que haya habido alguna eventualidad en medio ( se le corte la llamada a la persona que dicta la clase) la persona estudiante pueda "reclamar" por esa desconexión y haya una forma de verificar la causa y el culpable de esa interrupción. 