# Política de Privacidad

**Última actualización:** 12 de junio de 2026

Esta Política de Privacidad describe cómo **Ticket Reader for Zendesk** (la "Extensión") trata la información de los usuarios.

### 1. Recopilación de Datos y Privacidad
**Ticket Reader for Zendesk no recopila, almacena, comparte ni transmite ningún tipo de información personal, sensible o de navegación del usuario.**
*   **Procesamiento local:** Todos los datos de los tickets de Zendesk (asunto, prioridad, fecha de vencimiento y URL) se procesan estrictamente de manera local en el navegador del dispositivo del usuario.
*   **Sin servidores externos:** La Extensión no cuenta con un servidor web ni base de datos externa. No hay telemetría ni envío de datos a terceros.

### 2. Uso de Permisos
La Extensión solicita únicamente los permisos estrictamente necesarios para su funcionamiento:
*   `activeTab` y `scripting`: Se utilizan exclusivamente para leer de forma temporal la información del ticket de Zendesk abierto en la pestaña activa cuando el usuario interactúa con la Extensión.
*   `clipboardWrite`: Se utiliza únicamente para permitir al usuario copiar la información formateada del ticket al portapapeles al presionar el botón correspondiente.
*   `host_permissions` (`https://*.zendesk.com/*`): Limita la ejecución de la extensión únicamente a los portales de Zendesk del usuario, garantizando que no acceda a otros sitios web.

### 3. Cambios en esta Política
Esta política de privacidad puede actualizarse ocasionalmente. Cualquier cambio se publicará directamente en esta página.

### 4. Contacto
Si tiene alguna pregunta sobre esta Política de Privacidad, puede ponerse en contacto a través de la página del proyecto en GitHub: [boghus/zendesk-ticket-reader](https://github.com/boghus/zendesk-ticket-reader).
