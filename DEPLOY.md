# Deploy

Dos caminos, según dónde quieras que viva el sitio.

| Destino | Cuándo | Comando |
| --- | --- | --- |
| Cloudflare Workers | Recomendado: es el destino natural del proyecto (KV + rate limiting + Turnstile sin proxies) | `npm run deploy` |
| Docker (servidor propio) | Si el sitio tiene que vivir en un server tuyo | `docker compose up -d --build` |

## Cloudflare Workers

```bash
nvm use 24
npm install
npx wrangler login

# Secretos (una vez por Worker)
npx wrangler secret put RESEND_API_KEY
npx wrangler secret put TURNSTILE_SECRET
npx wrangler secret put PROMO_SECRET

npm run deploy
```

El Worker queda en `maty-web.<subdominio>.workers.dev` hasta que le agregues el dominio
personalizado desde el dashboard (o con un `route` en `wrangler.jsonc`).

`PROMO_SECRET` es un valor aleatorio largo: `openssl rand -hex 32`. Si cambia, los códigos ya
emitidos dejan de validarse.

## Docker en un servidor propio

El paquete `maty-web-<fecha>.tar.gz` trae el código y los archivos de deploy. En el server:

```bash
tar -xzf maty-web-<fecha>.tar.gz
cd maty-web

# 1. Secretos del runtime (Turnstile, Resend, promo, Telegram)
mkdir -p secrets
cp secrets/.dev.vars.example secrets/.dev.vars
$EDITOR secrets/.dev.vars        # completar RESEND_API_KEY, TURNSTILE_SECRET, PROMO_SECRET

# 2. Variables públicas (se hornean en el build)
cp .env.example .env
$EDITOR .env                     # SITE_URL y PUBLIC_SITEKEY_TURNSTILE

# 3. Levantar
docker compose up -d --build
docker compose logs -f web
```

Caddy se encarga del HTTPS: el dominio tiene que apuntar al server (A o CNAME) y los puertos
80/443 tienen que estar abiertos. Caddy pide el certificado solo.

### Qué corre dentro

- `web`: el build de Astro servido por `wrangler dev` en modo local (workerd), que expone el sitio
  estático **y** los endpoints `/api/*` (contacto, promo) en el puerto 4321 interno.
- `caddy`: reverse proxy con TLS automático.

El estado del KV del promo vive en el volumen `promo_state` (mapeado a `/data`): si se borra el
volumen, se pierden los códigos emitidos y los contadores anti-abuso.

### Advertencia

`wrangler dev` no es el runtime recomendado por Cloudflare para producción (es el modo local).
Para un sitio personal con tráfico bajo sirve, pero si querés la versión soportada, usá
`npm run deploy` contra Cloudflare Workers: es el mismo código con KV y rate limiting reales.

Si el server no tiene salida a internet para descargar la imagen, la alternativa es bajar la
imagen desde otra máquina:

```bash
docker save maty-web:server -o maty-web-server.tar
```

## Chequeos antes de publicar

- [ ] `npm run verify` pasa (tipos, lint, tests, build).
- [ ] `RESEND_API_KEY` y `TURNSTILE_SECRET` están seteados (sin ellos el formulario devuelve error).
- [ ] `ALLOWED_HOSTNAMES` incluye el dominio real.
- [ ] `PUBLIC_SITEKEY_TURNSTILE` es la clave pública del widget de Turnstile.
- [ ] `MAIL_TO` tiene la dirección donde querés recibir los mensajes.
- [ ] `PROMO_SECRET` es un valor aleatorio largo y distinto del de desarrollo.
- [ ] El dominio resuelve al server y Caddy emite el certificado.
