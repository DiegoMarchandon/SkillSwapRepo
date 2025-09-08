Estructura 
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
│   │   │   │   ├── layout/     # componentes relacionados con estructura y diseño gral (header, container, footer, etc.)
│   │   │   │   ├── ui/         # componentes relacionados con la interfaz de usuario (Button, input, Modal, Select, etc.)
│   │   │   │   ├── forms/      # componentes relacionados con formularios (LoginForm,RegisterForm,ContactForm, etc.)
│   │   │   │   └── ...
│   │   ├── lib/                # funciones helpers (fetch API, validaciones)
│   │   ├── styles/             # Tailwind o CSS modules
│   │   ├── public/             # assets públicos (imágenes, íconos, favicon, etc.)
│   │   └── ...
│   └── ...
├── docs/                   # Documentación del proyecto
└── README.md
