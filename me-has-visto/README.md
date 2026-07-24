# ¿ME HAS VISTO?

## Descripción del proyecto

**¿ME HAS VISTO?** es una aplicación móvil desarrollada con React Native y Expo, orientada a ayudar en la búsqueda de mascotas perdidas o encontradas.

La app permite que los usuarios puedan registrar sus datos, crear reportes de mascotas, visualizar reportes en un mapa visual, contactar a otros usuarios mediante un chat simulado, reportar avistamientos y administrar su perfil.

Este proyecto forma parte del desarrollo de una aplicación móvil híbrida enfocada en resolver una problemática real de la comunidad: la pérdida de mascotas y la necesidad de conectar rápidamente a dueños, vecinos y personas que puedan aportar información.

---

## Tecnologías utilizadas hasta ahora

- React Native
- Expo
- Expo Go
- React Navigation
- AsyncStorage
- Expo Image Picker
- Expo Location
- Expo Vector Icons
- JavaScript

---

## Funcionalidades implementadas hasta ahora

### 1. Pantalla de bienvenida

La aplicación inicia con una pantalla de bienvenida donde se muestra el nombre de la app y una breve descripción de su propósito.

Desde esta pantalla el usuario puede ingresar a la aplicación.

---

### 2. Inicio de sesión local

La app cuenta con una pantalla de inicio de sesión donde el usuario debe ingresar sus datos principales:

- Nombre completo
- Teléfono
- Correo opcional

También se pueden marcar redes sociales opcionales:

- Facebook
- Instagram

Estas redes sociales funcionan actualmente como simulación local, ya que la autenticación real se implementará más adelante con el backend.

Los datos del usuario se guardan de forma local usando AsyncStorage, por lo que no se pierden al cerrar y volver a abrir la app.

---

### 3. Navegación principal

La app cuenta con una barra inferior de navegación con las siguientes secciones:

- Inicio
- Actividad
- Mis reportes
- Perfil

Cada sección tiene su propio icono y está organizada para que el usuario pueda moverse fácilmente dentro de la aplicación.

---

### 4. Pantalla de Inicio

En la pantalla de Inicio se muestra un mapa visual de Ecuador con marcadores en forma de patitas.

Cada patita representa un reporte de mascota perdida o encontrada.

Al tocar una patita, el usuario puede ver el detalle del reporte.

También se cuenta con un botón flotante de `+`, ubicado en la parte inferior derecha, que permite crear un nuevo reporte de mascota.

---

### 5. Crear reporte de mascota

La app permite crear reportes de mascotas perdidas o encontradas.

El formulario solicita los siguientes datos:

- Foto de la mascota
- Nombre de la mascota
- Tipo de mascota
- Color
- Raza
- Descripción
- Ciudad
- Sector
- Teléfono de contacto
- Ubicación GPS opcional

El usuario puede seleccionar una imagen desde la galería y también puede usar la ubicación GPS del dispositivo.

Los reportes se guardan localmente usando AsyncStorage.

---

### 6. Mis reportes

En la pantalla de Mis reportes se muestran únicamente los reportes creados por el usuario.

Desde esta sección el usuario puede revisar sus reportes y eliminarlos si es necesario.

Esta pantalla no muestra reportes ajenos, solo los propios.

---

### 7. Detalle del reporte

Cada reporte tiene una pantalla de detalle donde se muestra la información completa de la mascota:

- Imagen
- Nombre
- Estado
- Tipo
- Raza
- Color
- Descripción
- Ubicación
- Teléfono de contacto
- Fecha
- Coordenadas GPS, si fueron registradas

Desde esta pantalla el usuario puede:

- Contactar al dueño mediante chat
- Reportar un avistamiento

---

### 8. Chat

La app cuenta con una pantalla de chat asociada a cada reporte.

El chat permite enviar mensajes de forma local. Los mensajes quedan guardados dentro del reporte, por lo que al volver a entrar a la conversación se mantiene el historial.

El chat incluye:

- Nombre de la mascota en el encabezado
- Botón para llamar al contacto
- Botón con patita para ver el reporte
- Caja de texto tipo mensajería
- Botón de emojis
- Botón de enviar mensaje

También se ajustó el diseño para que la caja de texto no quede tapada por el teclado del celular.

---

### 9. Actividad

En la pantalla de Actividad se guardan las conversaciones o interacciones que el usuario haya iniciado.

Cuando el usuario envía un mensaje en un chat, ese reporte pasa a mostrarse en Actividad.

Al tocar una tarjeta en Actividad, se abre directamente el chat correspondiente.

---

### 10. Reportar avistamiento

La app permite reportar un avistamiento de una mascota.

El usuario puede enviar:

- Observación
- Teléfono de contacto
- Imagen opcional
- Ubicación GPS opcional

Esta función registra la actividad relacionada con el reporte.

---

### 11. Perfil

La pantalla de Perfil muestra los datos del usuario logueado.

Actualmente permite:

- Ver nombre
- Ver teléfono
- Ver correo
- Ver redes sociales conectadas
- Editar datos personales
- Cambiar foto de perfil
- Cerrar sesión

Los datos actualizados se guardan localmente con AsyncStorage.

---

## Persistencia local

La app utiliza AsyncStorage para guardar datos en el dispositivo.

Actualmente se guardan localmente:

- Datos del usuario
- Reportes de mascotas
- Mensajes del chat
- Actividad iniciada por el usuario

Esto permite que la información no se pierda al cerrar y volver a abrir la app.

---

## Funcionalidades nativas utilizadas

La aplicación utiliza funcionalidades propias del dispositivo móvil.

### Galería

Se usa `expo-image-picker` para seleccionar imágenes desde la galería.

Se aplica en:

- Foto de mascota
- Foto de perfil
- Imagen de avistamiento

### Ubicación GPS

Se usa `expo-location` para obtener la ubicación del dispositivo.

Se aplica en:

- Reporte de mascota
- Reporte de avistamiento

---

## Instalación del proyecto

Para ejecutar el proyecto se debe tener instalado Node.js y Expo.

Primero se debe clonar o abrir la carpeta del proyecto.

Luego, desde la terminal, ingresar a la carpeta:

```bash
cd me-has-visto
```

Instalar las dependencias:

```bash
npm install
```

Instalar dependencias necesarias de Expo:

```bash
npx expo install @react-native-async-storage/async-storage
npx expo install expo-image-picker
npx expo install expo-location
npx expo install react-native-safe-area-context
npx expo install @expo/vector-icons
```

Instalar navegación:

```bash
npm install @react-navigation/native @react-navigation/native-stack @react-navigation/bottom-tabs --legacy-peer-deps
npx expo install react-native-screens react-native-safe-area-context
```

---

## Ejecución del proyecto

Para ejecutar la app:

```bash
npx expo start -c
```

Luego se debe escanear el código QR con la aplicación Expo Go desde el celular.

Es recomendable usar el celular físico para probar correctamente:

- GPS
- Galería
- Teclado
- Navegación
- Ajustes de pantalla

---

## Configuración importante de Expo

El archivo `app.json` debe estar en la raíz del proyecto, al mismo nivel que `App.js` y `package.json`.

Ejemplo de estructura:

```txt
me-has-visto/
├── App.js
├── app.json
├── index.js
├── package.json
├── package-lock.json
├── assets/
├── node_modules/
└── src/
```

El archivo `app.json` debe incluir la configuración del teclado para Android:

```json
{
  "expo": {
    "name": "me-has-visto",
    "slug": "me-has-visto",
    "version": "1.0.0",
    "orientation": "portrait",
    "userInterfaceStyle": "light",
    "newArchEnabled": true,
    "android": {
      "softwareKeyboardLayoutMode": "resize",
      "edgeToEdgeEnabled": false,
      "adaptiveIcon": {
        "backgroundColor": "#ffffff"
      }
    },
    "ios": {
      "supportsTablet": true
    },
    "web": {},
    "plugins": []
  }
}
```

---

## Estructura actual del proyecto

```txt
me-has-visto/
├── App.js
├── app.json
├── index.js
├── package.json
├── package-lock.json
├── assets/
├── node_modules/
└── src/
    ├── componentes/
    │   ├── Boton.js
    │   ├── BotonFlotante.js
    │   ├── CampoTexto.js
    │   └── TarjetaReporte.js
    ├── datos/
    │   └── reportesIniciales.js
    ├── estilos/
    │   └── colores.js
    ├── navegacion/
    │   └── Navegacion.js
    ├── pantallas/
    │   ├── Actividad.js
    │   ├── Bienvenida.js
    │   ├── Chat.js
    │   ├── CrearReporte.js
    │   ├── DetalleReporte.js
    │   ├── Login.js
    │   ├── MapaReportes.js
    │   ├── MisReportes.js
    │   ├── Perfil.js
    │   └── ReportarAvistamiento.js
    └── servicios/
        ├── almacenamientoReportes.js
        └── almacenamientoUsuario.js
```

---

## Estado actual del proyecto

Hasta este punto, la aplicación ya cuenta con una versión funcional local.

La app permite:

- Registrar usuario local
- Guardar sesión local
- Crear reportes
- Seleccionar imágenes
- Usar GPS
- Visualizar reportes en mapa visual
- Ver detalle de reportes
- Contactar mediante chat
- Guardar mensajes
- Reportar avistamientos
- Ver actividad
- Administrar perfil
- Editar datos de usuario
- Cambiar foto de perfil
- Cerrar sesión

---

## Pendientes por implementar

### 1. Backend con Laravel

El siguiente paso importante es crear el backend usando Laravel y Composer.

El backend deberá manejar:

- Usuarios
- Reportes
- Avistamientos
- Chats
- Mensajes

---

### 2. Base de datos PostgreSQL

Se debe crear una base de datos en PostgreSQL para almacenar la información real de la aplicación.

Tablas sugeridas:

- usuarios
- reportes_mascotas
- avistamientos
- chats
- mensajes

---

### 3. API REST

Se debe crear una API REST en Laravel para conectar la app móvil con el backend.

Endpoints sugeridos:

```txt
POST /api/registro
POST /api/login
GET /api/reportes
POST /api/reportes
GET /api/reportes/{id}
PUT /api/reportes/{id}
DELETE /api/reportes/{id}
POST /api/reportes/{id}/avistamientos
GET /api/reportes/{id}/avistamientos
GET /api/chats
GET /api/chats/{id}/mensajes
POST /api/chats/{id}/mensajes
```

---

### 4. Conexión entre React Native y Laravel

Después de crear la API, la app deberá consumir los datos del backend usando `fetch`.

La arquitectura final será:

```txt
React Native / Expo
        ↓
API REST HTTP/JSON
        ↓
Laravel Backend
        ↓
PostgreSQL
```

---

### 5. Reemplazar datos locales por datos reales

Actualmente la app usa AsyncStorage.

Más adelante, AsyncStorage puede quedar como apoyo para modo offline, pero los datos principales deberán venir desde la API.

---

### 6. Autenticación real

El login actual es local.

Luego se debe implementar autenticación real con Laravel, usando usuarios registrados en la base de datos.

---

### 7. Mapa real

El mapa actual es visual y simulado.

Como mejora futura se puede implementar un mapa real con marcadores usando la ubicación GPS de los reportes.

---

### 8. Documentación y pruebas de API

La API debe ser probada con Postman o Insomnia.

Se deben documentar:

- Rutas
- Métodos HTTP
- Campos requeridos
- Respuestas esperadas
- Errores posibles

---

## Próximo paso recomendado

El siguiente paso recomendado es crear el backend en Laravel con PostgreSQL.

Primero se debe crear el proyecto Laravel, configurar la base de datos y crear las migraciones principales.

Después se deben crear los modelos, controladores y rutas API para reportes de mascotas.

Luego se conecta la app móvil con la API usando `fetch`.
