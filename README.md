# ¿ME HAS VISTO? 🐾

Aplicación móvil híbrida desarrollada con **React Native / Expo**, conectada a una **API REST en Laravel** con base de datos **PostgreSQL**.

El objetivo de la aplicación es ayudar a reportar, visualizar y compartir información sobre mascotas perdidas o encontradas. Los usuarios pueden crear reportes, enviar avistamientos, contactar al dueño de una mascota y recibir avisos. Además, el sistema cuenta con un módulo administrativo para gestionar usuarios y reportes.

---

## Tecnologías utilizadas

### Frontend

- React Native
- Expo
- JavaScript
- AsyncStorage
- React Navigation
- Expo Image Picker
- Expo Location
- React Native Maps

### Backend

- Laravel
- PHP 8.2+
- Laravel Sanctum
- PostgreSQL
- API REST

---

## Estructura general del proyecto

```txt
PROYECTO_HIBRIDAS/
│
├── me-has-visto/              # Frontend Expo / React Native
│   ├── App.js
│   ├── package.json
│   ├── app.json
│   ├── assets/
│   └── src/
│
└── me-has-visto-api/          # Backend Laravel
    ├── app/
    ├── database/
    ├── routes/
    ├── .env
    └── composer.json
```

---

## Cómo clonar el repositorio

```bash
git clone URL_DEL_REPOSITORIO
cd PROYECTO_HIBRIDAS
```

Ejemplo:

```bash
git clone https://github.com/usuario/me-has-visto.git
cd PROYECTO_HIBRIDAS
```

---

# Configuración del backend Laravel

## 1. Entrar a la carpeta del backend

```bash
cd me-has-visto-api
```

## 2. Instalar dependencias de PHP

```bash
composer install
```

## 3. Crear el archivo `.env`

En Windows:

```bash
copy .env.example .env
```

En Linux/Mac:

```bash
cp .env.example .env
```

## 4. Generar la clave de Laravel

```bash
php artisan key:generate
```

## 5. Configurar PostgreSQL

Crear una base de datos en PostgreSQL con el nombre:

```txt
me_has_visto
```

Luego configurar el archivo `.env` con los datos de conexión:

```env
DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=me_has_visto
DB_USERNAME=postgres
DB_PASSWORD=TU_CONTRASEÑA
```

La contraseña debe ser la que se configuró al instalar PostgreSQL.

## 6. Ejecutar migraciones y seeders

```bash
php artisan migrate:fresh --seed
```

Este comando crea las tablas necesarias y registra el usuario administrador inicial.

Credenciales del administrador:

```txt
Correo: admin@mehasvisto.com
Contraseña: Admin@123
```

## 7. Crear enlace de almacenamiento

```bash
php artisan storage:link
```

## 8. Ejecutar el servidor Laravel

Para ejecutar la API únicamente desde la computadora:

```bash
php artisan serve
```

Para ejecutar la API y permitir conexión desde Expo Go en un celular conectado a la misma red WiFi:

```bash
php artisan serve --host=0.0.0.0 --port=8000
```

Ejemplo de URL local usando la IP de la computadora:

```txt
http://192.168.100.8:8000/api
```

La IP puede cambiar dependiendo de la red. En Windows se puede consultar con:

```bash
ipconfig
```

Buscar la línea:

```txt
Dirección IPv4
```

---

# Configuración del frontend Expo

## 1. Entrar a la carpeta del frontend

```bash
cd me-has-visto
```

## 2. Instalar dependencias

```bash
npm install
```

## 3. Configurar la URL de la API

Abrir el archivo:

```txt
src/servicios/api.js
```

Verificar que la URL base coincida con la IP donde se está ejecutando Laravel:

```js
const API_URL = "http://192.168.100.8:8000/api";
```

Si el frontend se ejecuta únicamente en la computadora, se puede usar:

```js
const API_URL = "http://127.0.0.1:8000/api";
```

Si se usa Expo Go desde un celular, se debe usar la IP local de la computadora, por ejemplo:

```js
const API_URL = "http://192.168.100.8:8000/api";
```

## 4. Ejecutar Expo

```bash
npx expo start -c
```

Luego escanear el código QR con Expo Go desde el celular.

---

# Cómo funciona la aplicación

## Usuario normal

El usuario puede:

- Registrarse con nombre completo, teléfono, correo, contraseña y pregunta de recuperación.
- Iniciar sesión.
- Recuperar su contraseña usando la respuesta de seguridad.
- Editar su perfil.
- Cambiar o tomar foto de perfil.
- Crear reportes de mascotas perdidas o encontradas.
- Agregar imagen al reporte.
- Seleccionar ubicación del reporte.
- Ver reportes en el mapa.
- Ver el detalle de un reporte.
- Editar sus propios reportes.
- Marcar un reporte como encontrado.
- Eliminar sus propios reportes.
- Enviar avistamientos sobre reportes de otros usuarios.
- Agregar imagen y ubicación al avistamiento.
- Contactar por WhatsApp o llamada.
- Ver actividad relacionada con sus reportes y avistamientos.

---

## Administrador

El administrador puede:

- Iniciar sesión con una cuenta especial.
- Ver usuarios registrados.
- Inactivar usuarios.
- Reactivar usuarios.
- Eliminar usuarios.
- Ver reportes registrados.
- Ver el detalle de cada reporte.
- Ver quién realizó el reporte.
- Ocultar reportes con una observación administrativa.
- Revisar estadísticas generales del sistema.

Cuenta de administrador por defecto:

```txt
Correo: admin@mehasvisto.com
Contraseña: Admin@123
```

---

# Funcionalidades principales

## Autenticación

La autenticación se realiza mediante Laravel Sanctum y tokens de acceso.

Rutas principales:

```txt
POST /api/registro
POST /api/login
POST /api/logout
GET  /api/perfil
PUT  /api/perfil
```

---

## Recuperación de contraseña

El usuario puede recuperar su contraseña usando su correo y la respuesta de seguridad relacionada con su mascota favorita.

Rutas:

```txt
POST /api/recuperacion/verificar
POST /api/recuperacion/restablecer
```

---

## Reportes de mascotas

El sistema permite crear, listar, editar, eliminar y marcar reportes como encontrados.

Rutas:

```txt
GET    /api/reportes
POST   /api/reportes
GET    /api/reportes/{id}
PUT    /api/reportes/{id}
DELETE /api/reportes/{id}
PATCH  /api/reportes/{id}/encontrada
GET    /api/mis-reportes
```

---

## Avistamientos

Los usuarios pueden enviar avistamientos sobre reportes de otros usuarios.

Rutas:

```txt
POST /api/reportes/{id}/avistamientos
GET  /api/reportes/{id}/avistamientos
GET  /api/mis-avistamientos/enviados
GET  /api/mis-avistamientos/recibidos
```

---

## Contactos

Cuando un usuario contacta por WhatsApp o llamada, el sistema puede registrar esa acción.

Ruta:

```txt
POST /api/reportes/{id}/contactos
```

---

## Administración

Rutas protegidas para el administrador:

```txt
GET    /api/admin/panel
GET    /api/admin/usuarios
PATCH  /api/admin/usuarios/{id}/estado
DELETE /api/admin/usuarios/{id}
GET    /api/admin/reportes
PATCH  /api/admin/reportes/{id}/eliminar
```

---

# Permisos usados por la app

La aplicación solicita permisos para:

```txt
Cámara
Galería
Ubicación
```

Estos permisos se usan para:

- Tomar foto de perfil.
- Subir foto del reporte.
- Subir foto del avistamiento.
- Obtener ubicación actual.
- Seleccionar ubicación del reporte o avistamiento.

---

# Flujo general de uso

## Flujo de usuario

```txt
1. El usuario se registra.
2. Inicia sesión.
3. Crea un reporte de mascota.
4. Agrega foto, descripción, ubicación y contacto.
5. Otro usuario puede ver el reporte.
6. Otro usuario puede enviar un avistamiento.
7. El dueño del reporte recibe el avistamiento en su actividad.
8. El reporte puede marcarse como encontrado.
```

## Flujo de administrador

```txt
1. El administrador inicia sesión.
2. Revisa usuarios registrados.
3. Puede inactivar, reactivar o eliminar usuarios.
4. Revisa reportes.
5. Puede ocultar reportes con una observación administrativa.
6. Visualiza estadísticas generales.
```

---

# Comandos útiles

## Backend

Ejecutar Laravel para red local:

```bash
php artisan serve --host=0.0.0.0 --port=8000
```

Limpiar caché:

```bash
php artisan optimize:clear
```

Ver rutas:

```bash
php artisan route:list
```

Reiniciar base de datos:

```bash
php artisan migrate:fresh --seed
```

## Frontend

Ejecutar Expo:

```bash
npx expo start -c
```

Instalar dependencias:

```bash
npm install
```

---

# Pruebas recomendadas de la API

Se recomienda validar la API con Postman usando las siguientes rutas:

## Login

```txt
POST http://IP_LOCAL:8000/api/login
```

Body:

```json
{
  "correo": "admin@mehasvisto.com",
  "password": "Admin@123"
}
```

## Perfil protegido

```txt
GET http://IP_LOCAL:8000/api/perfil
```

Headers:

```txt
Authorization: Bearer TOKEN
Accept: application/json
```

## Crear reporte

```txt
POST http://IP_LOCAL:8000/api/reportes
```

Headers:

```txt
Authorization: Bearer TOKEN_USUARIO
Accept: application/json
Content-Type: application/json
```

Body:

```json
{
  "nombre_mascota": "Max",
  "tipo_mascota": "Perro",
  "estado": "perdida",
  "raza": "Mestizo",
  "color": "Blanco",
  "descripcion": "Se perdió cerca del parque.",
  "provincia": "Manabí",
  "ciudad": "Manta",
  "sector": "Centro",
  "telefono_contacto": "0991234567",
  "latitud": -0.9677,
  "longitud": -80.7089
}
```

## Crear avistamiento

```txt
POST http://IP_LOCAL:8000/api/reportes/{id}/avistamientos
```

Body:

```json
{
  "observacion": "Vi una mascota parecida cerca de la avenida principal.",
  "telefono": "0987654321",
  "latitud": -0.965,
  "longitud": -80.71
}
```

## Panel administrador

```txt
GET http://IP_LOCAL:8000/api/admin/panel
```

Headers:

```txt
Authorization: Bearer TOKEN_ADMIN
Accept: application/json
```

---

# Evidencias recomendadas para el informe

Para documentar el proyecto se recomienda tomar capturas de:

- Login de usuario.
- Registro.
- Recuperación de contraseña.
- Inicio con mapa.
- Crear reporte.
- Detalle del reporte.
- Enviar avistamiento.
- Actividad del usuario.
- Perfil.
- Login administrador.
- Gestión de usuarios.
- Gestión de reportes.
- API probada en Postman.
- Base de datos PostgreSQL.
- Laravel corriendo.
- Expo corriendo.

---

# Estado del proyecto

El sistema cuenta con:

```txt
Frontend móvil funcional
Backend Laravel conectado
Base de datos PostgreSQL
API REST
Autenticación con tokens
Roles usuario y administrador
CRUD de reportes
Gestión de avistamientos
Gestión administrativa
Uso de cámara, galería y ubicación
Ejecución en Expo Go
```
