# SkillSwapRepo

---

## 🚀 Puesta en marcha del Backend (Laravel)

### 1. Clonar el repositorio

```bash
git clone https://github.com/DiegoMarchandon/SkillSwapRepo.git
cd SkillSwapRepo/backend
```

### 2. Instalar dependencias

```bash
composer isntall
```

### 3. Configurar variables de entorno

```bash
cp .env.example .env
php artisan key:generate

```

### 4. Crear la base de datos MySQL

```bash
CREATE DATABASE skillswap;

Editar el archivo .env y asegurarse de configurar la BD:

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=skillswap
DB_USERNAME=root
DB_PASSWORD=


```

### 5. Migrar las tablas

```bash
php artisan migrate

```

### 5. Levantar el servidor

```bash
php artisan serve

```
