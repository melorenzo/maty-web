# PLAN.md — matiaslorenzo.com.ar

> Sitio personal de Matías Lorenzo como proyecto tecnológico con entidad propia.
> Stack: Astro 7 + React 19 + TypeScript 6 + Tailwind 4, deploy en Cloudflare Workers.
> Plan original de Claude archivado en `docs/legacy/PLAN_claude_v1.md`.

## Índice

1. [Concepto](#1-concepto)
2. [Identidad y pilares](#2-identidad-y-pilares)
3. [Sistema de diseño](#3-sistema-de-diseño)
4. [Stack](#4-stack)
5. [Arquitectura](#5-arquitectura)
6. [Contenido](#6-contenido)
7. [Tareas](#7-tareas)
8. [Arcade y códigos promocionales](#8-arcade-y-códigos-promocionales)
9. [API](#9-api)
10. [Despliegue](#10-despliegue)
11. [Variables de entorno](#11-variables-de-entorno)
12. [Reglas](#12-reglas)
13. [Pendientes de Matías](#13-pendientes-de-matías)

---

## 1. Concepto

**Un escritorio que se explica solo.** El sitio es un escritorio Linux donde cada sección es una
ventana (barra de título, botones, estado) y la interacción principal es una terminal y una paleta
de comandos.

- Arranca con un **boot log estilo systemd** (`[ OK ] Started TeachOS v1.0`).
- Cada sección es una **ventana** con su servicio y su estado (`running`, `building`, `testing`).
- Abajo, un **dock** de aplicaciones que ancla la navegación.
- Una **terminal viva** responde comandos reales (`help`, `man matias`, `ls projects`, `whoami`).
- La **paleta de comandos** (`Ctrl+K` / `Cmd+K`) es el meta: `man matias`, `projects`, `aula`,
  `foss`, `theme dark`, `open blog`, `arcade`, `sudo hire-me`.
- Una **ventana ARCADE** con un juego propio estilo Space Invaders que, si lo ganás, te entrega un
  **código promocional** para una asesoría, un diseño web o una automatización.

Sin esto, el sitio es un portfolio. Con esto, es un producto.

## 2. Identidad y pilares

**Marca:** `MATY` — Matías Lorenzo, docente de tecnología, developer y software libre.

**Tres pilares, tres ventanas:**

| Pilar | Contenido |
|---|---|
| **En el aula** | Metodología (ABP, pensamiento computacional, IA con mirada ética), rutas de aprendizaje, materiales didácticos abiertos, charlas y talleres. |
| **Tecnología** | Proyectos reales con ficha, stack, estado, repos y demos. |
| **Software libre** | Manifiesto propio, herramientas que enseño, contribuciones a proyectos abiertos, **el código de este sitio** (repo público + licencia) y el blog como voz. |

**Voz:** español rioplatense, técnico-profesional y cercano. Nada de "soy un wearer que le passiona la tech".

**Servicios (comercio):** el juego genera códigos, así que el sitio necesita una sección
`/servicios` real con tres offerings: **asesoría técnica**, **diseño web** y **automatización**.
Sin precios públicos: se cotiza.

## 3. Sistema de diseño

**Tokens** (Tailwind 4, `@theme` en `src/styles/global.css`):

| Rol | Claro | Oscuro |
|---|---|---|
| Fondo | `#eef6fb` | `#07121f` |
| Superficie | `#ffffff` | `#0e2036` |
| Acento firma (CTA) | `#e95420` (Ubuntu orange) | `#ff7a4d` |
| Terminal / detalles | `#f5c518` (Tux yellow) | `#ffd84d` |
| Estado OK | `#12a37f` (menta) | `#2fd9a8` |
| Enlaces / selección | `#1d63ed` (Docker blue) | `#4d93ff` |
| Texto | `#0b1b2b` | `#e8f1f8` |

**Tipografía:** `system-ui` para texto, `ui-monospace` para etiquetas, terminal, dock y navegación.

**Tema:** claro y oscuro con `prefers-color-scheme` + toggle manual persistido en `localStorage`
(con `try/catch`).

**Movimiento:** todo con `prefers-reduced-motion` respetado. Sin flash ni shake.

## 4. Stack

Versiones verificadas al momento de escribir este plan.

```
astro 7.4.4            @astrojs/react 7.1.2      react 19.3.1
typescript 6.0.3       @astrojs/check 0.9.12     (TS 7 no: el peer de astro check es ^5 || ^6)
tailwindcss 4.3.3       @tailwindcss/vite 4.3.3
@astrojs/cloudflare 14.4.3   @astrojs/sitemap 3.7.4   @astrojs/mdx 8.1.2   @astrojs/rss 4.0.19
vitest 5.0.5            eslint 9 (flat)           prettier 3              wrangler ^4.125
```

**Node ≥ 22.23.4** (Astro 7 lo exige). El proyecto usa **Node 24 LTS**.

**Notas de Astro 7:** compilador Rust (el HTML mal cerrado o un `<div>` dentro de `<p>` **rompe el
build**), markdown con Sätteri por defecto, `compressHTML: 'jsx'` (los espacios entre elementos
inline hay que preservarlos con `{" "}`), `output: 'hybrid'` ya no existe (se usa `output: 'static'`
+ `prerender = false` por ruta).

## 5. Arquitectura

```
maty_web/
├── astro.config.mjs          # output:'static' + adapter cloudflare; react, tailwind, sitemap, mdx, rss
├── wrangler.jsonc            # assets + kv PROMO + ratelimits + compatibility flags
├── eslint.config.js  .prettierrc  tsconfig.json  .env.example
├── LICENSE  README.md  CODE_OF_CONDUCT.md  SECURITY.md  CONTRIBUTING.md
├── docs/
│   ├── legacy/PLAN_claude_v1.md
│   └── design/               # notas de marca y copy
├── src/
│   ├── components/
│   │   ├── astro/            # Window, Dock, BootSequence, StatusBar, ProjectCard, TimelineItem,
│   │   │                     # StackGrid, BlogList, Callout, Tag, Badge, SectionHeader, Seo, Footer
│   │   └── react/            # CommandPalette, Terminal, ContactForm, ThemeToggle, CopyEmail,
│   │                         # game/ArcadeGame, game/GameCanvas, game/GameHud, game/GameControls
│   ├── content/              # colecciones: proyectos/, materiales/, charlas/
│   ├── content.config.ts
│   ├── data/                 # profile.ts, links.ts, stack.ts, experiencia.ts, formacion.ts,
│   │                         # certificaciones.ts, aula.ts, servicios.ts, site.ts
│   ├── layouts/              # Base.astro, Page.astro, Desktop.astro
│   ├── lib/                  # commands.ts, terminal/commands.ts, blog.ts, schemas.ts,
│   │                         # promo.ts, game/engine.ts, game/sprites.ts, game/constants.ts
│   ├── pages/                # index, proyectos/[slug], aula, software-libre, servicios, arcade,
│   │                         # blog, cv, contacto, man, promo, privacidad, 404,
│   │                         # api/contact.ts, api/health.ts, api/promo/*.ts
│   ├── styles/               # global.css (tokens @theme), prose.css
│   └── assets/               # avatar, íconos, OG image
└── tests/                    # vitest
```

**Reglas de separación (obligatorias):**

- `.astro` → contenido y layout, **cero JS**.
- `.tsx` → solo interacción. Una isla por archivo, props tipadas, sin tocar el DOM global.
- `src/lib/*.ts` → lógica pura y testeable sin DOM.
- `src/data/*.ts` → única fuente de verdad de los datos de perfil. Nada hardcodeado en templates.
- Colecciones (Markdown + frontmatter validado por Zod) → agregar un proyecto es agregar un `.md`.

## 6. Contenido

**Fuente real:** `linkdn/CV-Matias-Lorenzo-2026.md` (CV 2026), GitHub `melorenzo`, blog
`blog.fullware.com.ar` (WordPress, API REST pública).

- **Perfil:** Matías Lorenzo, Buenos Aires. Docente de tecnología + analista de sistemas.
  Licenciatura en Tecnologías Digitales y Profesor Universitario (UNICABA), Técnico Superior en
  Análisis de Sistemas (IFTS 21).
- **Proyectos:** NotiBot, Zorwis, Financial AI Advisor, Trading Bot (demo Binance), Audiobook Bot,
  bot certificador de publicidad, sistema del lubricentro, Fullware.
- **Stack:** Python, JavaScript, TypeScript, PHP, SQL, React, Astro, Node, REST, MySQL, Docker,
  Linux, Nginx, Git, WordPress, IA/LLMs/agentes, web scraping.
- **Experiencia:** Facilitador Pedagógico Digital (Min. Educación GCBA, 2026–hoy), Docente de
  Tecnología (2020–hoy), Analista Responsable (2011–hoy), Técnico de Soporte (2008–2011),
  Data Entry (2006–2008).
- **Formación y certificaciones:** UNICABA, IFTS 21, React (Codo a Codo), Argentina Programa 4.0,
  Fullstack (Codo a Codo GCBA), SysAdmin Linux (Educación IT), Governance (South School), IA,
  blockchain/web3, seguridad informática.
- **Blog:** últimos posts leídos de la WP REST API en build time, con cache y fallback.
- **Contacto:** `melorenzo@fullware.com.ar` y `melorenzo@ymail.com`, LinkedIn, GitHub, blog.
  **El teléfono no se publica.**
- **Idiomas:** español nativo, inglés intermedio.

## 7. Tareas

Estado: `[x]` hecha · `[~]` parcial (falta una acción de Matías) · `[ ]` pendiente.

### T0 — Prerrequisitos y repo `[x]`

- Node 24.22.2 instalado y seteado como default (Astro 7 exige ≥22.23.4).
- `git init` propio en `maty_web/`, con `main` como rama.
- `.gitignore` (nodos, build, `.env`, secrets).
- Plan de Claude archivado en `docs/legacy/PLAN_claude_v1.md`.

**Aceptación:** `node -v` ≥ 22.23.4; repo con rama `main`; el plan viejo archivado y borrado de la raíz.

### T1 — Scaffold Astro 7 + React + Tailwind 4 `[x]`

`astro create` (minimal) + `astro add react tailwind sitemap mdx rss cloudflare`, `tsconfig` estricto,
ESLint 9 flat + Prettier, Vitest, `src/styles/global.css` con `@theme` y tokens completos.

**Aceptación:** `npm run build`, `astro check`, `eslint`, `vitest` en verde.

### T2 — Sistema de diseño `[x]`

`Window.astro`, `Dock.astro`, `StatusBar.astro`, `Tag/Badge/Callout/SectionHeader`, `Seo.astro`
(OG/Twitter/canonical), `global.css` con tokens.

**Aceptación:** ventana de prueba consistente en claro/oscuro y a 375px sin scroll horizontal.

### T3 — Datos y contenido `[x]`

`src/data/*.ts` tipado + `src/content.config.ts` con colecciones `proyectos`, `materiales`, `charlas`
(Zod + loader `glob`).

**Aceptación:** agregar un `.md` publica el proyecto sin tocar componentes.

### T4 — Home escritorio `[x]`

`BootSequence` (CSS, sin JS), dock, ventanas About / Stack / Proyectos / Experiencia (timeline tipo
git log) / Formación / Aula / Software libre / Blog / Contacto.

**Aceptación:** navegable por teclado, sin scroll horizontal a 375px, se lee completo sin JS.

### T5 — Terminal viva `[x]`

`Terminal.tsx` + `lib/terminal/commands.ts` puro y testeado: `help`, `whoami`, `man`, `ls`, `cat
about.txt`, `projects`, `aula`, `foss`, `theme`, `clear`, `contact`, `sudo hire-me`.

**Aceptación:** los comandos devuelven datos reales del sitio; tests del parser; usable con teclado.

### T6 — Paleta de comandos `[x]`

`CommandPalette.tsx` + `lib/commands.ts`: registro tipado, búsqueda, `Ctrl+K`/`Cmd+K`, foco
atrapado, `Esc`, `aria-*`, `client:idle`.

**Aceptación:** sitio usable sin JS; islas < 40 KB gzip; Lighthouse a11y 100.

### T7 — Páginas de sección `[x]`

`/proyectos` (+ detalle por slug), `/aula`, `/software-libre`, `/servicios`, `/arcade`, `/blog`,
`/cv`, `/contacto`, `/man`, `/promo`, `/privacidad`, `404`.

**Aceptación:** navegación completa desde dock y paleta; OG por página; sitemap correcto.

### T8 — Arcade `[x]`

Motor TS puro (`lib/game/engine.ts`) + tests, isla React, `/arcade` con la explicación técnica.

**Aceptación:** se gana jugando; el engine tiene tests; la isla no se carga en el render inicial.

### T9 — API promo + contacto `[x]`

`api/promo/challenge.ts`, `api/promo/redeem.ts`, `api/promo/validate.ts`, `api/contact.ts`,
`api/health.ts`. Zod, Turnstile server-side (fail closed, chequea `action` y `hostname`), honeypot,
rate limit por binding `ratelimits`, envío por Resend (email) y Telegram (opcional, en paralelo).

**Aceptación:** tests de validación, honeypot, Turnstile falso, rate limit, fallo parcial de canal.

### T10 — Formulario de contacto `[x]`

`ContactForm.tsx`: validación cliente, widget Turnstile, `fetch`, estados `[ OK ]` / `[FAILED]`
estilo terminal, `role="status"`, campo `codigo` opcional con validación de promo.

**Aceptación:** funciona con red caída, mensajes claros, navegable por teclado.

### T11 — Deploy `[~]`

Configuración lista y probada en local: `wrangler.jsonc` con assets, KV `PROMO`
(`dbadb4d19b8b4793aee7b99d34ed1de6`), rate limit `PROMO_RATE_LIMIT` y `nodejs_compat`; el
namespace KV ya existe en la cuenta. Falta que Matías ejecute `npx wrangler login`, cargue los tres
secretos y corra `npm run deploy`.

`wrangler.jsonc` (assets + `kv_namespaces` PROMO + `ratelimits` + `nodejs_compat` + observability),
`wrangler secret put`, deploy, DNS del dominio, `SITE_URL` por env.

**Aceptación:** el sitio sirve en el dominio, `/api/health` 200, el form manda mail de verdad.

### T12 — GitHub + CI + software libre `[x]`

Repo público, `LICENSE`, `CODE_OF_CONDUCT`, `SECURITY`, `CONTRIBUTING`, badge "software libre" en el
sitio, workflows de build/check/lint/test, deploy manual desde `main`.

**Aceptación:** badge verde; el sitio enlaza a su propio repo y licencia.

### T13 — Calidad final `[x]`

Lighthouse ≥95 (perf/a11y/BP/SEO), `prefers-reduced-motion`, foco visible, contraste AA, responsive
375/768/1440, OG image, `robots.txt`, sitemap, 404 estilo terminal, README completo.

**Aceptación:** checklist del README cumplido.

## 8. Arcade y códigos promocionales

### Reward (cerrado)

| Parámetro | Valor |
|---|---|
| Qué otorga | **10% de descuento en el primer proyecto + sesión inicial de 30 min sin cargo** |
| Servicios sorteados | `asesoría` \| `diseño-web` \| `automatización` (lo decide el servidor) |
| Vigencia | 30 días desde la emisión |
| Usos | **1 código por IP cada 24 h**, uso único por proyecto, **no acumulable** |
| Tope global | 15 códigos por día (configurable) |
| Formato | `MATE-AUTO-K7F3` (servicio + 4 caracteres aleatorios) |

Los términos viven en `/promo`, linkeados desde la pantalla de victoria, el footer y el formulario.

### Juego

- 1 oleada de 24 bugs en 4 filas × 6 columnas, 3 vidas, escudo, pausa (`P` / blur), highscore local.
- Score por fila: 30 / 20 / 10 / 10.
- Blips 8-bit con WebAudio (disparo, baja, impacto, victoria, game over) y **sonido prendido por
  defecto**: la música del juego es `public/audio/arcade-theme.mp3` (loop de 1 min, 728 KB) y arranca
  con la primera interacción (tecla o botón), que es lo que los navegadores exigen para reproducir
  audio. El botón `sonido` del marcador lo apaga en cualquier momento.
- Teclado (←/→, espacio) y táctil (botones + swipe).
- Accesible: `prefers-reduced-motion` sin shake ni flashes, `aria-live` en eventos, hitbox ampliada
  y ritmo lento en modo accesible, y **el código se puede pedir por email** si no se puede jugar.
- El motor es TypeScript puro sin dependencias (`lib/game/engine.ts`) → testeable con Vitest.
- La isla carga diferida con `import()` → **no afecta el LCP**. Objetivo: **< 25 KB gzip**.

### Anti-trampa

El cliente nunca decide el código, el servicio ni el descuento.

1. `POST /api/promo/challenge` → `{ token, seed, issuedAt }`, token = HMAC(`PROMO_SECRET`).
2. `POST /api/promo/redeem` → valida firma, TTL (10 min), score dentro del rango plausible según
   duración y cadencia de disparo, y vida plausible. Rate limit 1/IP/24h + tope global. Emite y
   persiste el código.
3. `POST /api/promo/validate` → valida un código existente (existe, no venció, no usado, no
   acumulable) y lo marca usado.

**KV `PROMO`:** `promo:code:<CODE>`, `promo:ip:<ip>:<yyyymmdd>`, `promo:global:<yyyymmdd>`,
`promo:usado:<sha256(email)>`.

## 9. API

| Endpoint | Descripción |
|---|---|
| `GET /api/health` | Healthcheck. |
| `POST /api/contact` | `{ name, email, reason, message, website, code }`. Zod, honeypot, Turnstile, promo opcional, Resend + Telegram en paralelo. 202 si al menos un canal sale, 502 si ambos fallan. |
| `POST /api/promo/challenge` | Token firmado para arrancar una partida. |
| `POST /api/promo/redeem` | Canjea la victoria por un código. |
| `POST /api/promo/validate` | Valida un código (usado por el formulario de contacto). |

Motivos de contacto: `asesoria`, `diseno-web`, `automatizacion`, `docencia`, `charla`, `otro`.

## 10. Despliegue

- **Cloudflare Workers** con `@astrojs/cloudflare`: `output: 'static'` + `prerender = false` en las
  rutas de API. Un solo despliegue: assets estáticos + endpoints.
- `wrangler.jsonc`: `assets` (binding `ASSETS`), `kv_namespaces` (PROMO), `ratelimits`,
  `compatibility_flags: ["nodejs_compat"]`, observability.
- Secrets: `wrangler secret put RESEND_API_KEY`, `TURNSTILE_SECRET`, `PROMO_SECRET`.
- DNS: `matiaslorenzo.com.ar` → zona en Cloudflare → nameservers → custom domain del Worker.
- `SITE_URL` por env: el dominio no bloquea el desarrollo.
- CI: `build` + `astro check` + `eslint` + `vitest` en cada PR; deploy manual desde `main`.

## 11. Variables de entorno

```
SITE_URL=https://matiaslorenzo.com.ar
PUBLIC_SITEKEY_TURNSTILE=
RESEND_API_KEY=
MAIL_TO=melorenzo@fullware.com.ar,melorenzo@ymail.com
MAIL_FROM="Maty <no-reply@matiaslorenzo.com.ar>"
TELEGRAM_BOT_TOKEN=
TELEGRAM_CHAT_ID=
PROMO_SECRET=
PROMO_DISCOUNT=10
PROMO_SESSION_MINUTES=30
PROMO_TTL_DAYS=30
PROMO_DAILY_CAP=15
ALLOWED_HOSTNAMES=matiaslorenzo.com.ar,localhost
```

## 12. Reglas

- Cero secretos en el repo. Solo `.env.example`.
- Un componente = una responsabilidad. `.astro` sin JS; `.tsx` solo si interactúa.
- El sitio se lee completo **sin JavaScript**. El arcade y el formulario son mejoras progresivas.
- Nunca loguear el contenido de los mensajes ni de los códigos.
- No publicar el teléfono ni datos privados.
- Datos reales: si algo no está confirmado, `TODO(matias)` y seguir — no inventar.
- Textos del sitio y comentarios en español; código e identificadores en inglés.
- Nada de JS donde no haga falta.

## 13. Pendientes de Matías

1. Registrar `matiaslorenzo.com.ar` (fallback: `matiaslorenzo.dev` o `maty.fullware.com.ar`).
2. Textos de los tres servicios de `/servicios` (o ideas para que los redacte).
3. Términos del promo y política de privacidad (estructura lista, falta su firma).
   **Hecho**: los términos del promo están redactados (14 puntos en `/promo`) y la política de
   privacidad ya nombra los datos que se guardan. Falta la revisión legal y los datos del responsable.
4. Confirmar: 10% de descuento, 30 min de sesión gratis, 30 días de vigencia, 15 códigos/día.
5. Avatar, logos de proyectos y OG image (placeholders SVG en el meantime).
   **Hecho**: avatar `public/avatar.webp` (512×512, 24 KB) y OG `public/og-maty.jpg`
   (1200×630, 78 KB) hechos con la foto `subir/ML.png`. Falta los logos de cada proyecto.
6. **Hecho**: CV descargable en PDF: `src/lib/cv-pdf.ts` arma el PDF a mano (sin dependencias) desde
   `src/data/`, y `src/pages/cv.pdf.ts` lo sirve como endpoint estático en `/cv.pdf`.
7. **Hecho**: README de GitHub con capturas (`docs/captura-home.png`, `docs/captura-arcade.png`),
   tabla de secciones y badges de CI.
