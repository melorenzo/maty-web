# Seguridad

## Qué reportar

Si encontrás una vulnerabilidad en este sitio, avisame por email a `melorenzo@fullware.com.ar` con:

- Qué falla y cómo se reproduce.
- Qué impacto tiene.
- Opcionalmente, una propuesta de arreglo.

No abras un issue público hasta que haya una solución o un plazo acordado.

## Alcance

Este proyecto expone un formulario de contacto y un emisor de códigos promocionales. Todo lo demás es
contenido estático.

## Datos que maneja el sitio

- El formulario de contacto guarda nombre, email, motivo y mensaje, y los envía por email.
- Los códigos promocionales se guardan en Cloudflare KV con una huella cifrada del email.
- No hay cookies de seguimiento ni analítica de terceros.

Los detalles están en la página `/privacidad` del sitio.

## Versiones soportadas

Solo la rama `main` recibe correcciones.
