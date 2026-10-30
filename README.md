# maty-web

Sitio personal de **Matías Lorenzo**: docente de tecnología, developer y divulgador de software
libre. El concepto es un **escritorio Linux**: cada sección del perfil es una ventana, la barra
lateral es un dock y hay una terminal jugable con comandos reales del sitio.

 Incluye un **arcade propio** (Space Invaders) que, al completarse con un score legítimo, libera un
**código promocional** para un primer servicio de 30 minutos sin cargo.

## Stack

- [Astro 7](https://astro.build) con `output: 'static'` y rutas API renderizadas en el servidor.
- React 19 + TypeScript 6 para las islas interactivas (terminal, paleta de comandos, arcade, formulario).
- Tailwind CSS 4 vía `@tailwindcss/vite`, con tokens CSS y tema claro/oscuro.
- Cloudflare Workers (`@astrojs/cloudflare`) + KV + Rate Limiting + Turnstile + Resend.
- Vitest para los tests de lógica pura.

## Arranque rápido

```bash
nvm use 24
npm install
cp .env.example .env
npm run dev
```

El sitio corre en `http://localhost:4321`. La terminal y la paleta de comandos se prueban con la
tecla `/` o la tecla `` ` ``.

## Comandos

| Comando | Qué hace |
| --- | --- |
| `npm run dev` | Servidor de desarrollo |
| `npm run check` | Chequeo de tipos |
| `npm run lint` | ESLint |
| `npm run test` | Tests unitarios |
| `npm run build` | Build de producción |
| `npm run verify` | check + lint + test + build |
| `npm run deploy` | Build + `wrangler deploy` |
| `npm run deploy:dry` | Build + dry run de Wrangler |
| `npm run cf:kv:create PROMO` | Crear el namespace KV del promo |

## Estructura

```
src/
  components/astro/   ventanas, dock, tarjetas, SEO
  components/react/   islas: terminal, paleta, tema, arcade, formulario
  content/proyectos/  fichas de proyectos en Markdown
  data/               contenido tipado del perfil
  layouts/            Base.astro y Page.astro
  lib/                lógica pura: game, promo, contact, terminal, blog
  pages/              rutas y endpoints /api
  styles/global.css   tokens y tema
```

## Variables de entorno

Copiá `.env.example` a `.env`. Las tres claves sensibles (Turnstile, Resend y `PROMO_SECRET`) van
como secretos de Wrangler en producción:

```bash
npx wrangler secret put RESEND_API_KEY
npx wrangler secret put TURNSTILE_SECRET
npx wrangler secret put PROMO_SECRET
```

Sin `TURNSTILE_SECRET`, el formulario omite la verificación (solo para desarrollo local).

## Deploy

1. `npm run build` genera `dist/client` (estáticos) y `dist/server` (Worker).
2. `npm run deploy` sube el Worker con los bindings de `wrangler.jsonc`:
   - `PROMO`: KV con los contadores y los códigos emitidos.
   - `PROMO_RATE_LIMIT`: rate limiting anti-abuso (10 req/min por IP).
   - `ASSETS`: assets estáticos.
3. En Cloudflare Dashboard se agrega el dominio personalizado y el `workers.dev` queda como
   respaldo mientras tanto.

El dominio canónico se define con `SITE_URL` al construir:

```bash
SITE_URL=https://matiaslorenzo.com.ar npm run build
```

## Arcade y códigos promocionales

- El juego vive en `src/lib/game/` (motor puro, sin DOM) y la isla React solo dibuja.
- Una partida legítima exige: 24 impactos, al menos 24 disparos y un score exacto de **420**.
- El servidor no confía en el cliente: recalcula el resultado y valida el reto HMAC
  (`POST /api/promo/challenge` → `POST /api/promo/redeem`).
- Reglas del código: 10% de descuento, sesión inicial de 30 minutos sin cargo, 1 código por IP
  cada 24 h, uso único, no acumulable, 30 días de vigencia y tope global de 50 códigos por día.
- Formato: `MATE-<ASES|DISE|AUTO>-XXXX`.

## Privacidad

Sin cookies de seguimiento ni analítica de terceros. Los datos del formulario se usan solo para
responder. Detalle en `/privacidad`.

## Licencia

MIT. Ver [LICENSE](LICENSE) y [CONTRIBUTING.md](CONTRIBUTING.md).
