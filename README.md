# 🍽️ CookLab - Francisco Pozo Romero

**CookLab** es una aplicación web desarrollada como proyecto de fin de ciclo del Grado Superior en Desarrollo de Aplicaciones Web. Permite a los usuarios compartir, buscar y gestionar recetas de cocina, así como valorarlas, comentarlas y guardarlas como favoritas. Incluye una sección de administración para moderar usuarios y contenidos.

## 🛠️ Tecnologías utilizadas

### Frontend (Angular)
- Angular 17 con Standalone Components
- Angular Material (componentes puntuales)
- Bootstrap 5
- Angular Signals
- CSS Grid
- Compodoc (documentación)
- RxJS

### Backend (NestJS)
- NestJS
- MongoDB con Mongoose
- JWT para autenticación
- Bcrypt para hash de contraseñas
- Swagger (documentación)
- CORS y seguridad con Helmet

---

## 📁 Estructura del repositorio

PFC-Frontend/
├── src/app/
│ ├── core/
│ ├── shared/
│ ├── pages/
│ │ ├── home-page/
│ │ ├── search-page/
│ │ ├── profile-page/
│ │ ├── dashboard-page/
│ │ └── create-update-recipe-page/
│ └── app.config.ts
└── angular.json

PFC-Backend/
├── src/
│ ├── auth/
│ ├── comments/
│ ├── favorites/
│ ├── ratings/
│ ├── recipes/
│ ├── users/
│ └── main.ts
└── package.json
