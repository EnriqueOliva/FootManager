# Football Manager API

Este proyecto es una API RESTful construida con Node.js, Express y TypeScript para gestionar información sobre equipos de fútbol. Utiliza PostgreSQL para la base de datos e integra la API-Football para validar los equipos. El proyecto incluye pruebas unitarias, está documentado con Swagger y utiliza Git para el control de versiones.

## Tabla de Contenidos

1. [Requisitos](#requisitos)
2. [Instalación](#instalación)
3. [Configuración](#configuración)
4. [Ejecutar el Proyecto Localmente](#ejecutar-el-proyecto-localmente)
5. [Ejecutar las Pruebas](#ejecutar-las-pruebas)
6. [Interactuar con la API](#interactuar-con-la-api)
7. [Requisitos Funcionales y No Funcionales](#requisitos-funcionales-y-no-funcionales)
8. [Licencia](#licencia)

## Requisitos

- Node.js >= 18.0.0
- Docker (para la configuración de PostgreSQL)
- Clave de API-Football

## Instalación

1. Clonar el repositorio:
   ```
   git clone https://github.com/yourusername/footmanager.git
   cd footmanager
   ```
2. Instalar dependencias:
   ```
   npm install
   ```

## Configuración

Configurar las variables de entorno creando un archivo .env en el directorio raíz con el siguiente contenido:
 ```
DB_USER=postgres
DB_PASSWORD=8492
DB_HOST=localhost
DB_PORT=5432
DB_DATABASE=footmanager
API_FOOTBALL_KEY=<Clave de API-Football válida>
 ```

## Ejecutar el Proyecto Localmente

1. Correr Docker:
 ```
docker-compose up --build
```
El servidor estará corriendo en `http://localhost:3000`

## Ejecutar las pruebas

1. Ejecutar las pruebas unitarias (pruebas mock con Sinon/Mocha):
   ```
   npm test
   ```
2. Ejecutar custom script con pruebas unitarias de los endpoints:
   ```
   ts-node tests/testEndpoints
   ```
3. Ejecutar las pruebas End-to-End (Cypress):
   ```
   npm run test:e2e
   ```

## Interactuar con la API

La API está documentada usando Swagger. Para interactuar con la API:

* Abrir navegador y navegar a `http://localhost:3000/api-docs`

Swagger brinda documentación para todos los endpoints, incluyendo ejemplos de solicitudes y respuestas.

Nota: El servidor se ejecuta con `npm start`, pero en principio esto no es necesario si se utiliza `docker-compose up --build`

## Requisitos Funcionales y No Funcionales

### Requisitos Funcionales

- **Registro e inicio de sesión de usuarios:** La API soporta el registro e inicio de sesión de usuarios, permitiendo a los usuarios registrarse como una liga de fútbol o como un administrador.
- **Gestión de Ligas:** Dentro de una liga se puede:
  - Obtener una lista de todos los equipos.
  - Obtener información detallada de un equipo específico, con filtrado opcional por país.
  - Crear, actualizar y eliminar equipos.
  - Los administradores pueden crear y eliminar ligas.
- **Validación y manejo de errores:** La API incluye validación robusta y manejo de errores para todos los endpoints.

### Requisitos No Funcionales

- **Desempeño:** La API está diseñada para manejar múltiples solicitudes concurrentes de manera eficiente. Las consultas a la base de datos están optimizadas para un rendimiento rápido.
- **Escalabilidad:** La arquitectura de la API permite una fácil escalabilidad. Se consideran herramientas y prácticas que facilitan la escalabilidad horizontal.
- **Mantenibilidad:** El código es limpio y está bien documentado, siguiendo buenas prácticas de desarrollo, incluyendo la separación de responsabilidades y los principios SOLID.

## Licencia

Este proyecto está licenciado bajo la Licencia MIT - consultar el archivo [LICENSE](LICENSE) para más detalles.
















