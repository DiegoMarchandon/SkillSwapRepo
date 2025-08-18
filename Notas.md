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
│   ├── components/         # componentes reutilizables (botones, forms, cards, etc.)
│   ├── lib/                # funciones helpers (fetch API, validaciones)
│   ├── styles/             # Tailwind o CSS modules
│   ├── public/             # imágenes, íconos
│   └── ...
│
├── docs/                   # Documentación del proyecto
├── docker/                 # Configuración para contenedores (si los usas)
└── README.md
