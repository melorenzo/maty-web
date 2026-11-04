# syntax=docker/dockerfile:1

FROM node:24-slim AS build
WORKDIR /app

COPY package.json package-lock.json .npmrc ./
RUN npm ci --include=optional

COPY . .

ARG SITE_URL=https://matiaslorenzo.com.ar
ARG PUBLIC_SITEKEY_TURNSTILE=
ENV SITE_URL=$SITE_URL \
    PUBLIC_SITEKEY_TURNSTILE=$PUBLIC_SITEKEY_TURNSTILE

RUN npm run build

FROM node:24-slim AS runtime
WORKDIR /app

# CA: sin esto workerd no puede salir a internet (Resend, Turnstile, Telegram)
RUN apt-get update \
    && apt-get install -y --no-install-recommends ca-certificates \
    && rm -rf /var/lib/apt/lists/*

ENV NODE_ENV=production \
    WRANGLER_SEND_METRICS=false \
    CI=true

COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/wrangler.jsonc ./wrangler.jsonc
COPY --from=build /app/package.json ./package.json

# wrangler/miniflare crean carpetas en el dir de la config y en node_modules:
# alcanza con permiso de escritura en esas dos carpetas, sin tocar todo el árbol.
RUN mkdir -p /data /app/.wrangler \
    && chmod a+w /app/node_modules /app/dist/server \
    && chown -R node:node /data /app/.wrangler
USER node

EXPOSE 4321

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:4321/').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["npx", "wrangler", "dev", "--config", "dist/server/wrangler.json", "--ip", "0.0.0.0", "--port", "4321", "--persist-to", "/data"]
