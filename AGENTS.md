# Guía del proyecto

Sitio personal de Matías Lorenzo. Astro 7 + React 19 + TypeScript 6 + Tailwind 4, deploy en
Cloudflare Workers.

## Reglas

- Textos y comentarios en español rioplatense; código e identificadores en inglés.
- Sin emojis en código ni contenido.
- Cero secretos en el repo: `.env` local y secretos de Wrangler en producción.
- Los componentes `.astro` no llevan JavaScript; `.tsx` solo donde hay interacción real.
- El sitio debe ser legible sin JavaScript.
- No loguear mensajes de contacto ni códigos promocionales.
- Ante una tarea incompleta, dejar `TODO(matias)` con el texto que falta.

## Comandos

```bash
nvm use 24
npm run verify   # check + lint + test + build
npm run dev      # servidor de desarrollo
npm run deploy   # build + wrangler deploy
```

El servidor de desarrollo se maneja en background: `astro dev --background`, con
`astro dev status` y `astro dev logs`.

## Trampas conocidas

- **Astro 7 renombra imports que coinciden con props de islas React.** Si un import se llama igual
  que una prop de isla (por ejemplo `manifiesto`), rolldown lo renombra a `manifiesto$1` y las
  referencias dentro de slots quedan sin definir. Solución: armar un objeto `const contenido = { ... }`
  en el frontmatter y referenciar `contenido.x` dentro de los slots.
- **El compilador de Astro 7 es Rust**: HTML mal cerrado rompe el build. Revisá las etiquetas.
- Los endpoints de API necesitan `export const prerender = false;` porque el output es `static`.
- `wrangler.jsonc` define el binding de KV `PROMO` y el rate limit `PROMO_RATE_LIMIT`; el namespace
  es `dbadb4d19b8b4793aee7b99d34ed1de6`.
- Cloudflare está habilitado en la cuenta; R2 no.

## Deploy

Wrangler no está autenticado en este entorno. El deploy lo ejecuta quien tenga credenciales:

```bash
npx wrangler login     # una vez, abre el navegador
npm run deploy
```

Secretos de producción: `RESEND_API_KEY`, `TURNSTILE_SECRET`, `PROMO_SECRET`.
