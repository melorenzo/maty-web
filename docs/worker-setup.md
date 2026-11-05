# Guía: deploy en Cloudflare Workers (reutilizable en otro proyecto)

Guía escrita a partir del deploy de `maty-web` para copiar la configuración a otro proyecto.
Los secretos **no** van en el repo: van en `wrangler secret put` (producción) o en
`secrets/.dev.vars` (local, gitignored).

## 1. Requisitos

- Node 22.23.4 o superior (probado con Node 24).
- Cuenta de Cloudflare con el dominio en la zona y un subdominio `workers.dev`.
- `npx wrangler login` (si el login por callback falla en WSL: `npx wrangler login --device`).

## 2. Dependencias y scripts

```bash
npm i @astrojs/cloudflare @astrojs/workers-types --save-dev
npm i -D wrangler
```

Scripts útiles en `package.json`:

```json
{
  "scripts": {
    "build": "astro build",
    "deploy": "npm run build && wrangler deploy",
    "deploy:dry": "npm run build && wrangler deploy --dry-run",
    "cf:kv:create": "wrangler kv namespace create PROMO",
    "cf:secret": "wrangler secret put"
  }
}
```

## 3. `astro.config.ts`

```ts
import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';

// PUBLIC_SITE_URL es la que llega al HTML estatico (canonical, OG, sitemap).
// SITE_URL sirve de fallback para el build del Worker.
const site =
  process.env.PUBLIC_SITE_URL ??
  process.env.SITE_URL ??
  'https://mi-dominio.com';

export default defineConfig({
  site,
  output: 'static',
  adapter: cloudflare({ prerenderEnvironment: 'node', imageService: 'passthrough' }),
});
```

**Trampa importante**: con `output: 'static'`, las variables de build que se leen desde
`import.meta.env.SITE_URL` en un módulo `.ts` **no llegan al HTML** (Vite solo-inlinea las
`PUBLIC_*`). Por eso el canonical usaba el dominio viejo: hay que usar `PUBLIC_SITE_URL`.

## 4. Endpoints que necesitan runtime

Con `output: 'static'` cada endpoint que reciba requests tiene que declararse no prerenderizado:

```ts
export const prerender = false;
```

Y leer las variables con el módulo de Cloudflare:

```ts
import { env } from 'cloudflare:workers';
```

## 5. `wrangler.jsonc`

```jsonc
{
  "$schema": "./node_modules/wrangler/config-schema.json",
  "name": "nombre-del-worker",
  "main": "@astrojs/cloudflare/entrypoints/server",
  "compatibility_date": "2026-10-30",
  "compatibility_flags": ["nodejs_compat"],
  "assets": {
    "binding": "ASSETS",
    "directory": "./dist"
  },
  "kv_namespaces": [
    {
      "binding": "PROMO",
      "id": "ID_DEL_NAMESPACE"
    }
  ],
  "vars": {
    "MAIL_TO": "destinatario@ejemplo.com",
    "MAIL_FROM": "Maty <no-reply@ejemplo.com>",
    "ALLOWED_HOSTNAMES": "mi-dominio.com,mi-worker.<subdominio>.workers.dev",
    "PROMO_DISCOUNT": "10",
    "PROMO_SESSION_MINUTES": "30",
    "PROMO_TTL_DAYS": "30",
    "PROMO_DAILY_CAP": "15"
  },
  "ratelimits": [
    {
      "name": "PROMO_RATE_LIMIT",
      "namespace_id": "1001",
      "simple": {
        "limit": 10,
        "period": 60
      }
    }
  ],
  "observability": {
    "enabled": true
  }
}
```

Los `vars` son públicos (se pueden leer en el bundle). **Los secretos van aparte** ✗.

## 6. Crear los bindings y secretos

```bash
# KV (contadores anti-abuso, códigos emitidos)
npx wrangler kv namespace create PROMO          # devuelve el id para wrangler.jsonc

# Secretos: los escribe el prompt, no quedan en el historial
npx wrangler secret put RESEND_API_KEY
npx wrangler secret put TURNSTILE_SECRET
npx wrangler secret put PROMO_SECRET

# Deploy
npm run deploy
```

Los tres secretos:

| Secreto | Para qué | Cómo se obtiene |
| --- | --- | --- |
| `RESEND_API_KEY` | enviar el email del formulario | dashboard de Resend → API keys |
| `TURNSTILE_SECRET` | verificar el token anti-bot | dashboard de Cloudflare → Turnstile → el widget |
| `PROMO_SECRET` | firmar los retos del promo | `openssl rand -hex 32` (si cambia, los códigos viejos dejan de validar) |

**Ojo**: la clave `0x4AAAAAA...` que aparece en el widget de Turnstile es la **site key pública**
(va en el build como `PUBLIC_SITEKEY_TURNSTILE`); el **secret** es otro valor, distinto, que solo
usa el servidor.

## 7. Turnstile

1. Crear el widget en el dashboard (o por API) con los dominios donde va a vivir el sitio:
   `mi-dominio.com`, `mi-worker.<subdominio>.workers.dev`, y el subdominio del túnel si aplica.
2. Poner la site key en el build: `PUBLIC_SITEKEY_TURNSTILE=0x4AAAAAA...`.
3. Poner el secret en el Worker: `npx wrangler secret put TURNSTILE_SECRET`.
4. En el servidor, el hostname que devuelve Turnstile se compara contra `ALLOWED_HOSTNAMES`
   (enviar el dominio **exacto**, sin `https://` ni path).

## 8. Resend (email)

1. Crear el dominio en Resend y copiar los registros DNS que pide:

   | Tipo | Nombre | Valor |
   | --- | --- | --- |
   | TXT | `resend._domainkey` | la clave DKIM que da Resend |
   | MX | `send` | `feedback-smtp.us-east-1.amazonses.com` (prioridad 10) |
   | TXT | `send` | `v=spf1 include:amazonses.com ~all` |
   | CNAME | `rsend` | `send.forge.rmta.net` |

2. El dominio queda *verified* ✓ (puede tardar unos minutos).
3. `MAIL_FROM` tiene que usar ese dominio: `Maty <no-reply@ejemplo.com>`.

**Trampa**: si el dominio usa Zoho para el correo, el SPF del apex tiene que incluir
`amazonses.com` o Resend no lo valida y el mail rebota. Con `include:amazonses.com` conviven los
dos sistemas:

```
v=spf1 include:zohomail.com include:amazonses.com ~all
```

Además, Resend mete en su lista de supresión a los destinatarios que rebotaron duro (un
`550 SPF check failed` los mete). Con la dirección suprimida, **todos** los envíos que la
incluyen quedan `suppressed` y el endpoint responde 502. Se borra con:

```bash
curl -X DELETE https://api.resend.com/suppressions/destinatario@ejemplo.com \
  -H "Authorization: Bearer re_..."
```

## 9. DNS y túnel (si el sitio vive en un server propio)

- CNAME `mi-dominio.com` → `TUNNEL_ID.cfargotunnel.com` (proxied).
- En la config del túnel (Zero Trust → Networks → Tunnels → Public Hostname):

  | Hostname | Service |
  | --- | --- |
  | `mi-dominio.com` | `http://192.168.0.94:8027` |

- El contenedor tiene que publicar ese puerto (`ports: - '8027:4321'` en `docker-compose.yml`).
- La TLS la termina Cloudflare en el borde: no hace falta Caddy ni puertos 80/443 abiertos.

**Trampa**: no crear rutas de Worker del tipo `*.ejemplo.com/*` si el sitio va por el túnel: la
ruta se come **todas** las subdominios (y los que no son del Worker devuelven "Hello World!").

## 10. Deploy con Docker (server propio)

```dockerfile
# Dockerfile (resumen)
FROM node:24-slim AS build
WORKDIR /app
COPY package.json package-lock.json .npmrc ./
RUN npm ci --include=optional
COPY . .
ARG PUBLIC_SITE_URL=https://mi-dominio.com
ARG PUBLIC_SITEKEY_TURNSTILE=
ENV PUBLIC_SITE_URL=$PUBLIC_SITE_URL PUBLIC_SITEKEY_TURNSTILE=$PUBLIC_SITEKEY_TURNSTILE
RUN npm run build

FROM node:24-slim AS runtime
WORKDIR /app
RUN apt-get update && apt-get install -y --no-install-recommends ca-certificates \
    && rm -rf /var/lib/apt/lists/*
ENV NODE_ENV=production WRANGLER_SEND_METRICS=false CI=true
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/wrangler.jsonc ./wrangler.jsonc
COPY --from=build /app/package.json ./package.json
RUN mkdir -p /data /app/.wrangler \
    && chmod a+w /app/node_modules /app/dist/server \
    && chown -R node:node /data /app/.wrangler
USER node
EXPOSE 4321
CMD ["npx", "wrangler", "dev", "--config", "dist/server/wrangler.json", "--ip", "0.0.0.0", "--port", "4321", "--persist-to", "/data"]
```

`docker-compose.yml`:

```yaml
services:
  web:
    build:
      context: .
      args:
        PUBLIC_SITE_URL: ${PUBLIC_SITE_URL:-https://mi-dominio.com}
        PUBLIC_SITEKEY_TURNSTILE: ${PUBLIC_SITEKEY_TURNSTILE:-}
    restart: unless-stopped
    dns:
      - 1.1.1.1
      - 8.8.8.8
    volumes:
      - ./secrets/.dev.vars:/app/dist/server/.dev.vars:ro
      - promo_state:/data
    ports:
      - '8027:4321'
volumes:
  promo_state:
```

### Trampas de Docker (las que costaron tiempo)

| Síntoma | Causa | Solución |
| --- | --- | --- |
| `getaddrinfo EAI_AGAIN` | el host usa el stub de systemd (`127.0.0.53`), que no existe dentro del contenedor | `dns:` explícito en el compose |
| `workerd` no sale a internet | falta la CA | `ca-certificates` en la imagen |
| `npm ci` falla con peers | `.npmrc` con `legacy-peer-deps` | copiar `.npmrc` al build |
| El Worker no encuentra los secretos | wrangler busca `.dev.vars` junto al config generado | montarlo en `/app/dist/server/.dev.vars` |
| `Bind for 0.0.0.0:8027 failed` | quedó un contenedor viejo con el puerto | `docker rm -f $(docker ps -q --filter publish=8027)` |
| El contenedor no publica el puerto | quedó creado en un intento fallido | `docker compose down && docker compose up -d --build` |

`secrets/.dev.vars` (gitignored) lleva los secretos y las vars de runtime; `.env` lleva solo lo que
se hornea en el build (`PUBLIC_SITE_URL` y `PUBLIC_SITEKEY_TURNSTILE`).

## 11. Checklist de publicación

- [ ] `npm run verify` pasa (check, lint, tests, build).
- [ ] `npx wrangler secret list` muestra los tres secretos.
- [ ] `PUBLIC_SITEKEY_TURNSTILE` está en el build y el widget acepta el hostname.
- [ ] `ALLOWED_HOSTNAMES` incluye el dominio exacto del sitio.
- [ ] `MAIL_FROM` usa un dominio verificado en Resend.
- [ ] `curl -X POST https://<sitio>/api/<endpoint>` responde con el JSON esperado.
- [ ] El formulario manda un mail real (mirá el evento en Resend: `delivered`, no `suppressed`).
