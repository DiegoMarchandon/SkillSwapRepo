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

/src/app/
├── api/                           # API Routes 
│   └── meeting/
│       └── [meetingId]/
│           ├── route.js           # GET /api/meeting/[meetingId]
│           ├── start/
│           │   └── route.js       # POST /api/meeting/[meetingId]/start
│           └── status/
│               └── route.js       # GET /api/meeting/[meetingId]/status
└── meeting/
    └── [meetingId]/
        └── page.js                # GET /meeting/[meetingId]


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

# Pasos para configurar WebRTC

## 1) Instalar WSL2 + Ubuntu (recomendado)

Abrir *PowerShell como Administrador* (preferible hacerlo desde la terminal de tu PC en lugar de la de visual studio) y ejecutar:
> wsl --install -d Ubuntu  

Seguir el asistente: espera la descarga, crea usuario/contraseña.
Verificar:

> wsl -l -v

Debe aparecer: **Ubuntu  Running  2**

**si te sale un error  como <font color="red">  "Subsistema de Windows para Linux no tiene distribuciones instaladas." </font> es porque se instaló exitosamente, pero no hay distribuciones Linux instaladas Para eso, instalamos Ubuntu:**
 

> wsl --install -d Ubuntu

Ahora sí, corriendo **wsl -l -v** deberías ver el "Ubuntu Running 2"

**si te sale un error  como <font color="red">  "/ProyectoFinal/backend$ wsl -l -v wsl: command not found"  </font> es porque WSL no quedó correctamente habilitado en tu Windows todavía. O que la terminal no tiene acceso al comando `wsl`. Para solucionarlo:**


1) Abrir *PowerShell como Administrador* y ejecutar: 

`dism.exe /online /enable-feature /featurename:Microsoft-Windows-Subsystem-Linux /all /norestart`

2) Ahora, necesitás habilitar la máquina virtual. Para eso ejecutar: 

`dism.exe /online /enable-feature /featurename:VirtualMachinePlatform /all /norestart`

Después, tenés que reiniciar la PC.

3) Una vez reiniciado, Abrir nuevamente *PowerShell como Administrador* y ejecutar:

> wsl --install

esto va a instalar la última versión de WSL2 y Ubuntu como distribución predeterminada.

#### Verificar instalación
> wsl -l -v

deberías ver ahora sí "Name: **Ubuntu** State:**running** version:**2**".


## 2) Instalar Docker Desktop (Windows)

Descargar e instalar desde: https://www.docker.com/products/docker-desktop

Durante la instalación: elegir usar WSL 2 si pregunta (a mi no me preguntó). 

Abrir Docker Desktop → Settings → Resources → WSL Integration → marcar Ubuntu → Apply & Restart (puede venir marcada ya por defecto).

Probar:

> docker run hello-world

debe mostrar **“Hello from Docker!”**. 

- Esto me devolvió a mí:

"Unable to find image 'hello-world:latest' locally latest: Pulling from library/hello-world 17eec7bbc9d7: Pull complete Digest: sha256:54e66cc1dd1fcb1c3c58bd8017914dbed8701e2d8c74d9262e26bd9cc1642d31 Status: Downloaded newer image for hello-world:latest Hello from Docker! This message shows that your installation appears to be working correctly. To generate this message, Docker took the following steps: 1. The Docker client contacted the Docker daemon. 2. The Docker daemon pulled the "hello-world" image from the Docker Hub. (amd64) 3. The Docker daemon created a new container from that image which runs the executable that produces the output you are currently reading. 4. The Docker daemon streamed that output to the Docker client, which sent it to your terminal. To try something more ambitious, you can run an Ubuntu container with: $ docker run -it ubuntu bash Share images, automate workflows, and more with a free Docker ID: https://hub.docker.com/ For more examples and ideas, visit: https://docs.docker.com/get-started/"

significa que ya está funcionando correctamente.

## <font color= "green">3)Creamos la carpeta de configuración (ya está creada)</font> 

Este paso quizás te lo podrías saltear, ya que acá lo que hice fue crear la carpeta /coturn/turnserver.conf para poder realizar las pruebas locales. Pero como seguro lo ves deste tu repo lo menciono como data.

Ese archivo levanra un servidor STUN/TURN en la máquian local, puerto 3478, con un usuario simple `admin/12345`

## 4) Instalar socket.io
WebRTC por sí solo no puede intercambiar datos (SDP e ICE) sin ayuda externa. Necesitamos algo que actúe de "mensajero" entre los dos navegadores. La forma más común es usar **Socket.io** porque simplifica todo el flujo.

### en el back
Parate dentro de /backend/ (`cd backend`) e instalá:

> `npm install socket.io`

### en el front
Parate dentro de /frontend/ (`cd frontend`) e instalá:

> `npm install socket.io-client`

## <font color= "green">5) creamos un servidor Node.js</font>

este paso también te lo podés saltear, ya que acá lo que hice fue crear un archivo `server.js` en mi backend, que usa Node.js (necesario para el signaling de WebRTC).

### **Lo importante** es que tenés que ejecutar el comando `node server.js` para correr el servidor de signaling (hecho con Node.js) encargado de las videollamadas. Es indistinto si corrés o no también el de Laravel (`php artisan serve`) ya que hasta ahora no hay relación entre las videollamadas y nuestro resto del back.

## <font color= "green">6) creamos Nuestro front de Next.js para mostrar las videollamadas</font>
Hasta ahora, nuestro código crea una conexión WebRTC local, pero no la "comparte" con nadie. Ahora lo integramos con Socket.io creando el archivo en la siguiente ruta:`(/app/webrtc/page.js)`

Explicación del o que hace el código en ese archivo:

- Se conecta al servidor de signaling que levantaste en Laravel (localhost:4000).
- Usa navigator.mediaDevices.getUserMedia para mostrar el video local.
- Envía y recibe offer, answer y ICE candidates por Socket.io.

## Para probar: 
- Corrés `npm run dev` y `node server.js` en el backend.
- Abrís dos pestañas con el enlace `localhost:3000/webrtc`:
- En una hacé clic en “Iniciar llamada”.
- En la otra no haces nada: se va a conectar automáticamente.
- Vas a ver tu cámara local y el video remoto.
