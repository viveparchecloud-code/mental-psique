# Guía de Despliegue en Producción
## MentalPsique v1.0 — Item 10 del Checklist SENA

---

## Opción A — Railway (Recomendada, gratuita)

Railway permite desplegar Node.js + MySQL en minutos sin configuración de servidor.

### Paso 1 — Preparar el repositorio en GitHub

```bash
# En la carpeta del proyecto
git init
git add .
git commit -m "feat: MentalPsique v1.0 completo"

# Crear repositorio en github.com y conectar
git remote add origin https://github.com/TU_USUARIO/mentalpsique.git
git push -u origin main
```

Asegúrate de que `.gitignore` tenga:
```
node_modules/
.env
```

### Paso 2 — Crear proyecto en Railway

1. Ve a [railway.app](https://railway.app) y crea cuenta con GitHub
2. Clic en **New Project** → **Deploy from GitHub repo**
3. Selecciona tu repositorio `mentalpsique`
4. Railway detecta automáticamente que es Node.js

### Paso 3 — Agregar MySQL en Railway

1. En tu proyecto Railway, clic en **New** → **Database** → **MySQL**
2. Railway crea la base de datos y te da las variables de conexión
3. Ve a **Variables** de tu servicio MySQL y copia:
   - `MYSQL_HOST`
   - `MYSQL_PORT`
   - `MYSQL_USER`
   - `MYSQL_PASSWORD`
   - `MYSQL_DATABASE`

### Paso 4 — Configurar variables de entorno

En tu servicio Node.js en Railway, ve a **Variables** y agrega:

```
DB_HOST=       → valor de MYSQL_HOST
DB_PORT=       → valor de MYSQL_PORT (normalmente 3306)
DB_USER=       → valor de MYSQL_USER
DB_PASSWORD=   → valor de MYSQL_PASSWORD
DB_NAME=       → valor de MYSQL_DATABASE
JWT_SECRET=    → una cadena larga y aleatoria (mínimo 32 chars)
JWT_EXPIRES_IN=8h
BCRYPT_ROUNDS=10
NODE_ENV=production
PORT=3000
```

### Paso 5 — Crear las tablas en la BD de Railway

Railway tiene una consola MySQL integrada. Ve a tu servicio MySQL → **Query**
y pega el contenido completo de `mentalpsique_db.sql`.

### Paso 6 — Configurar el start command

En Railway → tu servicio → **Settings** → **Start Command**:
```
node src/app.js
```

### Paso 7 — Generar dominio público

En Railway → tu servicio → **Settings** → **Networking** → **Generate Domain**

Tu app quedará disponible en algo como:
```
https://mentalpsique-production.up.railway.app
```

---

## Opción B — Render (alternativa gratuita)

### Paso 1 — Preparar el repositorio
Igual que Railway (GitHub).

### Paso 2 — Crear Web Service en Render

1. Ve a [render.com](https://render.com) y crea cuenta
2. **New** → **Web Service** → conecta tu repo de GitHub
3. Configura:
   - **Build Command:** `npm install`
   - **Start Command:** `node src/app.js`
   - **Environment:** Node

### Paso 3 — Crear base de datos MySQL en Render

1. **New** → **PostgreSQL** (Render no tiene MySQL gratuito, usa PostgreSQL)
2. O usa [PlanetScale](https://planetscale.com) que sí tiene MySQL gratuito

### Configurar PlanetScale (MySQL gratuito en la nube)

1. Crea cuenta en [planetscale.com](https://planetscale.com)
2. **Create database** → nombre: `mentalpsique`
3. Ve a **Connect** → **Node.js** → copia las variables
4. Ejecuta el SQL desde la consola web de PlanetScale

---

## Opción C — VPS propio (DigitalOcean / Hostinger)

### Requisitos mínimos
- Ubuntu 22.04 LTS
- 1 GB RAM, 25 GB disco
- Node.js 18+, MySQL 8.0, Nginx

### Instalación en Ubuntu

```bash
# Actualizar sistema
sudo apt update && sudo apt upgrade -y

# Instalar Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Instalar MySQL
sudo apt install mysql-server -y
sudo mysql_secure_installation

# Instalar PM2 (gestor de procesos)
sudo npm install -g pm2

# Clonar proyecto
git clone https://github.com/TU_USUARIO/mentalpsique.git
cd mentalpsique
npm install

# Configurar .env
cp .env.example .env
nano .env  # editar con datos de producción

# Crear la BD
mysql -u root -p < mentalpsique_db.sql

# Iniciar con PM2
pm2 start src/app.js --name mentalpsique
pm2 startup  # para que inicie al reiniciar el servidor
pm2 save
```

### Configurar Nginx como proxy reverso

```nginx
server {
    listen 80;
    server_name tudominio.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### Agregar HTTPS con Let's Encrypt

```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d tudominio.com
```

---

## Variables de entorno para producción

```env
NODE_ENV=production
PORT=3000

# BD (reemplazar con valores reales)
DB_HOST=tu-host-produccion
DB_PORT=3306
DB_USER=tu-usuario
DB_PASSWORD=password-muy-seguro
DB_NAME=mentalpsique

# JWT — usar una cadena de al menos 64 caracteres aleatorios
JWT_SECRET=cambia_esto_por_una_cadena_muy_larga_y_aleatoria_en_produccion_2025
JWT_EXPIRES_IN=8h

# Seguridad más estricta en producción
BCRYPT_ROUNDS=12
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=50
```

---

## Checklist de despliegue

- [ ] `.env` con valores de producción (nunca el de desarrollo)
- [ ] `JWT_SECRET` cambiado por una cadena aleatoria fuerte
- [ ] Base de datos creada y tablas ejecutadas
- [ ] `npm start` funciona sin errores
- [ ] Endpoint `/api/v1/health` responde `{"status":"ok"}`
- [ ] Swagger accesible en `/api/v1/docs`
- [ ] Login funciona con usuario de prueba
- [ ] HTTPS configurado (obligatorio en producción)
- [ ] Variables sensibles NUNCA en el repositorio de código

---

*Guía de despliegue — MentalPsique v1.0*
*Ítem 10 del checklist DO-F-012 V08 SENA — Implementación del software*
