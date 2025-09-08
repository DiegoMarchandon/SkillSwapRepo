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
├── frontend/               # Proyecto Next.js (con React dentro)
│   ├── app/                # Nuevo sistema de rutas de Next 13+
│   │   ├── (public-pages)/ # páginas públicas
│   │   ├── dashboard/      # área privada del usuario
│   │   ├── profile/        # perfiles de usuarios
│   │   └── ...
│   ├── src/         # 
│   │   ├── components/         # componentes reutilizables (botones, forms, cards, etc.)
│   │   │   ├── layout/         # componentes relacionados con la estructura y diseño general (header, container, footer, etc.)
│   │   │   ├── ui/             # componentes relacionados con la interfaz de usuario (Button, input, Modal, Select, etc.)
│   │   │   ├── forms/          # componentes relacionados con formularios (LoginForm,RegisterForm,ContactForm, etc.)
│   │   ├── lib/            # funciones helpers (fetch API, validaciones)
│   │   ├── styles/         # Tailwind o CSS modules
│   │   ├── public/         # imágenes, íconos
│   │   └── ...
│
├── docs/                   # Documentación del proyecto
├── docker/                 # Configuración para contenedores (si los usas)
└── README.md
