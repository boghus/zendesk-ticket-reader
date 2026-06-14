# Changelog
## [1.2.1] - 2026-06-14

### Added
- Se agrega politica de privacidad para publicar en Chrome Store
- Se agregar compatibilidad en codigo para una extension firefox
- Se empaqueta el .zip para una extension para publicar en firefox
- Incorporar los recursos visuales para chrome store

## [1.2.0] - 2026-05-20

### Added
- Sincronización automática de la versión en `manifest.json` tomando como fuente de verdad el `package.json` durante el proceso de build.
- Incorporación de adaptador WebExtension para compatibilidad nativa con Chrome y Firefox (#37). Se normaliza el uso de APIs `chrome.*` (callbacks) y `browser.*` (promesas) para asegurar el flujo de mensajes entre el popup y el content script.

## [1.1.0] - 2026-05-19

### Added
- Mejora en la copia del mensaje del ticket con formato en negritas en el título
- Workflow de GitHub Actions para ejecución de tests en CI

### Changed
- Ajustes en el proceso de sincronización entre ramas main y develop

### Fixed
- Corrección de dependencias en ESLint (eslint-plugin-yml incluido en lockfile)

### Tests
- Incorporación de pruebas de integración en el proyecto

### Chore
- Eliminación de archivo innecesario del repositorio

## [1.0.0] - 2026-05-08

### Added
- Extracción de asunto, prioridad y fecha de vencimiento del ticket activo
- Popup con visualización de los campos y badges de prioridad con colores
- Botón para copiar resumen del ticket al portapapeles
- Detección automática de navegación entre tickets
- Espera estabilización del DOM antes de extraer datos (evita lecturas en blanco tras navegación)
- Soporte solo para Zendesk Agent Workspace moderno
