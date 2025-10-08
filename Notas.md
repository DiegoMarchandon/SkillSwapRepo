## Estructura 
skillSwap/
│
├── backend/                # Proyecto Laravel
│   ├── app/
│   ├── routes/
│   ├── database/
│   ├── public/
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


## sobre carpeta coturn
no forma parte del código de mi aplicación, sino que es un servicio de red independiente, como una base de datos.
servidor TURN/STUN. 
- Debe correr en su propio servidor o contenedor.
- O en la máquina local (si estamos probando).