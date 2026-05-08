# Zendesk Ticket Reader

Extensión de Chrome que extrae y muestra los datos clave de un ticket de Zendesk: asunto, prioridad y fecha de vencimiento, con opción de copiarlo al portapapeles en formato de texto listo para pegar en Slack o cualquier chat.

## Funcionalidades

- Muestra asunto, prioridad y fecha de vencimiento del ticket activo
- Traduce la prioridad al español (Urgente, Alta, Normal, Baja)
- Formatea la fecha de vencimiento en español
- Copia los datos al portapapeles con un placeholder `ASIGNADO: @` para mencionar manualmente al responsable
- Se actualiza automáticamente al navegar entre tickets

## Instalación (modo desarrollador)

1. Clona o descarga este repositorio
2. Abre Chrome y ve a `chrome://extensions`
3. Activa **Modo desarrollador** (esquina superior derecha)
4. Haz clic en **Cargar descomprimida** y selecciona la carpeta del proyecto

## Uso

1. Abre un ticket en Zendesk (`https://*.zendesk.com/agent/tickets/*`)
2. Haz clic en el ícono de la extensión
3. Los datos del ticket aparecen automáticamente
4. Usa **Copiar** para copiar el resumen al portapapeles

## Formato de copia

```
TICKET #12345: Nombre del asunto
ASIGNADO: @
VENCIMIENTO: 8 de mayo de 2026, 19:47:15
PRIORIDAD: Normal
```

## Compatibilidad

Probado en Zendesk Agent Workspace (versión moderna). No compatible con Zendesk Classic.
