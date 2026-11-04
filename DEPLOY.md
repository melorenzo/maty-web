# Deploy

El sitio vive en tu server propio, servido con Docker, y se publica con el túnel de Cloudflare
que ya tenés configurado (`Mytunnel`). La regla de ingress ya existe:

```
matiaslorenzo.fullware.com.ar → http://192.168.0.94:8027
```

O sea: el contenedor tiene que publicar el puerto **8027** en el host y Cloudflare se encarga del
TLS y del DNS (el CNAME `matiaslorenzo.fullware.com.ar` ya apunta al túnel).

| Destino | Cuándo | Comando |
| --- | --- | --- |
| Docker + túnel | El sitio vive en tu server (lo que usamos) | `docker compose up -d --build` |
| Cloudflare Workers | Alternativa sin server: el mismo código como Worker, con KV y rate limiting reales | `npm run deploy` |

## Docker en el server

El paquete `maty-web-<fecha>.tar.gz` trae el código y los archivos de deploy. En el server:

```bash
tar -xzf maty-web-<fecha>.tar.gz
cd maty-web

# 1. Secretos del runtime (Turnstile, Resend, promo, Telegram)
mkdir -p secrets
cp secrets/.dev.vars.example secrets/.dev.vars
$EDITOR secrets/.dev.vars        # RESEND_API_KEY, TURNSTILE_SECRET, PROMO_SECRET

# 2. Variables públicas (se hornean en el build)
cp .env.example .env
$EDITOR .env                     # SITE_URL y PUBLIC_SITEKEY_TURNSTILE

# 3. Levantar
docker compose up -d --build
docker compose logs -f web
```

Comprobación local en el server, antes de tocar el túnel:

```bash
curl -I http://127.0.0.1:8027/
curl -I http://127.0.0.1:8027/cv.pdf
```

Y después, desde cualquier lado:

```bash
curl -I https://matiaslorenzo.fullware.com.ar/
```

### Qué corre dentro

- `web`: el build de Astro servido por `wrangler dev` en modo local (workerd), que expone el sitio
  estático **y** los endpoints `/api/*` (contacto, promo) en el puerto 4321 interno, publicado en el
  host como 8027.

El estado del KV del promo vive en el volumen `promo_state` (mapeado a `/data`): si se borra el
volumen, se pierden los códigos emitidos y los contadores anti-abuso.

### Advertencia

`wrangler dev` no es el runtime recomendado por Cloudflare para producción (es el modo local).
Para un sitio personal con tráfico bajo sirve. Si algún día querés la versión soportada, usá
`npm run deploy` contra Cloudflare Workers: es el mismo código con KV y rate limiting reales.

Si el server no tiene salida a internet para descargar la imagen, la alternativa es bajar la
imagen desde otra máquina:

```bash
docker save maty-web:server -o maty-web-server.tar
```

## Cloudflare Workers (alternativa)

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

`PROMO_SECRET` es un valor aleatorio largo: `openssl rand -hex 32`. Si cambia, los códigos ya
emitidos dejan de validarse.

## Chequeos antes de publicar

- [ ] `npm run verify` pasa (tipos, lint, tests, build).
- [ ] `RESEND_API_KEY` y `TURNSTILE_SECRET` están seteados (sin ellos el formulario devuelve error).
- [ ] `ALLOWED_HOSTNAMES` incluye `matiaslorenzo.fullware.com.ar`.
- [ ] `PUBLIC_SITEKEY_TURNSTILE` es la clave pública del widget de Turnstile.
- [ ] `MAIL_TO` tiene la dirección donde querés recibir los mensajes.
- [ ] `MAIL_FROM` usa un dominio verificado en Resend (`fullware.com.ar`).
- [ ] `PROMO_SECRET` es un valor aleatorio largo y distinto del de desarrollo.
- [ ] El contenedor responde en `http://127.0.0.1:8027/` y el túnel sirve el mismo contenido.
