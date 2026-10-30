# PLAN.md — Sitio personal de Matías Lorenzo (Astro + microservicios)

> Para OpenCode. Ejecutar las tareas en orden. No avanzar a la siguiente hasta cumplir los criterios de aceptación de la actual. Referencia visual: `matias-lorenzo.html` (mockup aprobado, incluido en `/docs/mockup/`).

## 1. Concepto
Sitio personal con estética **docker compose + Linux**: cada sección es una "ventana" (barra con 3 puntos) que representa un servicio. La estructura del repo cuenta la historia del stack. Nada de plantilla típica de Astro.

**Paleta** (tokens CSS, modo claro y oscuro):
- Azul Docker `#1d63ed` / `#4d93ff` (oscuro)
- Verde menta `#12a37f` / `#2fd9a8` (oscuro)
- Naranja Ubuntu `#e95420` (infra y botón de envío)
- Amarillo Tux `#f5c518` (detalles en terminal)
- Fondo `#eef6fb` / `#07121f`, superficies `#fff` / `#0e2036`

**Tipografía:** system-ui para texto, `ui-monospace` para etiquetas, terminales y nav.

## 2. Arquitectura

```
fullware-site/
├── docker-compose.yml
├── .env.example
├── PLAN.md
├── docs/mockup/matias-lorenzo.html
├── services/
│   ├── web/                    # Astro (build estático) servido por nginx
│   │   ├── Dockerfile
│   │   ├── nginx.conf
│   │   ├── astro.config.mjs
│   │   ├── public/img/         # placeholders: avatar.svg, projects/*.svg
│   │   └── src/
│   │       ├── data/           # JSON por "servicio"
│   │       │   ├── profile.json
│   │       │   ├── stack.json
│   │       │   ├── projects.json
│   │       │   ├── experience.json
│   │       │   └── education.json
│   │       ├── components/
│   │       │   ├── Window.astro        # marco reutilizable (puntos + título)
│   │       │   ├── Nav.astro
│   │       │   ├── Hero.astro          # boot log systemd + avatar
│   │       │   ├── StackCard.astro
│   │       │   ├── ProjectCard.astro   # estado: running | building | testing
│   │       │   ├── TimelineItem.astro  # estilo git log (HEAD~n)
│   │       │   ├── ContactForm.astro
│   │       │   └── CommandPalette.tsx  # única isla con JS (React)
│   │       ├── layouts/Base.astro      # tokens, tema, meta
│   │       ├── styles/tokens.css
│   │       └── pages/index.astro
│   └── contact-api/            # microservicio de contacto
│       ├── Dockerfile
│       ├── requirements.txt
│       └── app/
│           ├── main.py         # FastAPI
│           ├── settings.py     # pydantic-settings (lee env)
│           ├── schemas.py
│           ├── notifiers/
│           │   ├── email.py
│           │   └── telegram.py
│           └── ratelimit.py
└── tests/
```

## 3. Contenido (datos reales)
Cargar en `src/data/*.json`. Todo el texto de las secciones sale de ahí, nunca hardcodeado en componentes.

- **Perfil:** Matías Lorenzo, desarrollador full stack y docente de tecnología, Buenos Aires. +18 años en tecnología.
- **Contacto:** `melorenzo@fullware.com.ar` (principal) y `melorenzo@ymail.com` (secundario, **se mantienen los dos**), LinkedIn `linkedin.com/in/matias-lorenzo33`, GitHub `github.com/melorenzo`, blog `blog.fullware.com.ar`. Teléfono: NO publicar en el sitio.
- **Disponibilidad:** 100 % remoto, full-time, L–V 9:00 a 18:00 hs.
- **Stack:** frontend (Angular, React, Astro, TypeScript, JavaScript, HTML/CSS), backend (Python, PHP, MySQL, REST APIs, web scraping), infra (Docker, WSL, Ubuntu Server, Linux, Git, backups), IA y automatización (LLMs, agentes, bots de Telegram, Claude, OpenCode), datos (Power BI, Grafana, WordPress).
- **Proyectos:** NotiBot (running), Zorwis (building), Financial AI Advisor (running), Trading Bot en demo de Binance (testing), Bot de certificación de publicidad (running), Blog técnico (running). Copiar descripciones de `docs/mockup/matias-lorenzo.html`.
- **Experiencia:** Facilitador Pedagógico Digital, Min. Educación GCBA (2026–hoy); Docente de Tecnología (2020–hoy); Analista Responsable, Dir. Gral. de Compras y Contrataciones (2011–hoy); Técnico de Soporte (2008–2011); Data Entry (2006–2008).
- **Formación:** Licenciatura en Tecnologías Digitales (UNICABA), Profesor Universitario (UNICABA), Técnico Superior en Análisis de Sistemas (IFTS 21).
- **Imágenes:** usar SVG placeholders con la misma proporción que el mockup (avatar 1:1 redondo, proyectos 16:9). Matías las reemplaza después sin tocar código.

## 4. Tareas

### T1 — Scaffold y tokens
Crear `services/web` con Astro (output `static`). Definir `tokens.css` con la paleta, claro/oscuro por `prefers-color-scheme` y `data-theme`, con toggle persistido en `localStorage` (con try/catch).
**Aceptación:** `npm run build` pasa; el toggle cambia el tema y lo recuerda; sin errores de consola.

### T2 — Componentes base y datos
Implementar `Window`, `Nav`, `StackCard`, `ProjectCard`, `TimelineItem` y los JSON de datos. `index.astro` solo compone y mapea datos.
**Aceptación:** agregar un proyecto en `projects.json` lo muestra sin tocar componentes; cero texto de contenido en `.astro`.

### T3 — Hero y secciones
`Hero` con boot log estilo systemd (`[ OK ] Started …`), avatar placeholder y CTAs. Secciones: about, stack, proyectos, experiencia (git log), formación, contacto.
**Aceptación:** fiel al mockup en escritorio y en móvil (375 px) sin scroll horizontal.

### T4 — Paleta de comandos (única isla React)
`Ctrl+K` / `Cmd+K` abre un modal con comandos: `goto <sección>`, `theme light|dark`, `man matias`, `open github|linkedin|blog`. Cargar con `client:idle`. Accesible: foco atrapado, `Esc` cierra, `aria-*` correctos.
**Aceptación:** todo el sitio sigue funcionando sin JS; el bundle de la isla queda por debajo de 40 KB gzip.

### T5 — contact-api (FastAPI)
Endpoint `POST /api/contact` con `{name, email, reason, message, website}`.
- Validar con pydantic: nombre 2–80, email válido, motivo en lista cerrada, mensaje 10–2000.
- `website` es honeypot: si viene con contenido, responder 202 sin enviar nada.
- Rate limit por IP: 5 solicitudes por 10 minutos (en memoria; documentar el límite).
- Enviar **en paralelo** por Telegram y por email. Si un canal falla, el otro igual se entrega. Responder 202 si al menos uno salió; 502 si ambos fallaron. Registrar el fallo sin loguear el contenido del mensaje.
- `GET /api/health` para el healthcheck.
**Aceptación:** tests con pytest cubren validación, honeypot, rate limit y fallo parcial de un canal (notifiers mockeados).

### T6 — Notificadores
- **Email** (`smtplib`/`aiosmtplib`, STARTTLS): enviar a **ambas** direcciones, `melorenzo@fullware.com.ar` y `melorenzo@ymail.com`. Remitente = cuenta SMTP configurada; `Reply-To` = email de quien escribe. Asunto: `[Sitio] {motivo} — {nombre}`.
- **Telegram** (Bot API `sendMessage`): mensaje con nombre, email, motivo y mensaje, escapando el texto. Token y chat id por env.
**Aceptación:** con credenciales reales de prueba llegan los mensajes a los dos correos y al chat; el texto con caracteres especiales no rompe el formato.

### T7 — Formulario real
`ContactForm.astro` con script mínimo: valida en cliente, hace `fetch('/api/contact')`, estados `[ OK ]` / `[FAILED]` en estilo terminal, botón deshabilitado mientras envía. Incluir campo honeypot oculto (`website`). Mantener el diseño del mockup.
**Aceptación:** funciona con y sin errores de red; mensajes de error claros; accesible con teclado y lector de pantalla (`role="status"`).

### T8 — Docker y despliegue
`docker-compose.yml` con dos servicios: `web` (nginx) y `contact-api`. nginx sirve estáticos y hace proxy de `/api/` a `contact-api`. Healthchecks en ambos, `restart: unless-stopped`, red interna, solo `web` expone puerto.
**Aceptación:** `docker compose up -d --build` levanta todo; `curl /api/health` responde 200 desde `web`.

### T9 — Calidad
Lighthouse ≥ 95 en rendimiento, accesibilidad y buenas prácticas. `README.md` con arranque, variables y cómo cambiar contenido e imágenes.
**Aceptación:** checklist en el README, todo cumplido.

## 5. Variables de entorno (`.env.example`)
```
SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASSWORD=
MAIL_FROM=
MAIL_TO=melorenzo@fullware.com.ar,melorenzo@ymail.com
TELEGRAM_BOT_TOKEN=
TELEGRAM_CHAT_ID=
ALLOWED_ORIGIN=https://TU-DOMINIO
```

## 6. Reglas
- Nunca commitear secretos. Solo `.env.example`.
- Componentes chicos y con una sola responsabilidad.
- JavaScript solo donde hace falta (T4 y T7).
- No publicar el teléfono ni datos privados.
- Comentarios y textos del sitio en español.
- Si algo del plan es ambiguo, dejar un `TODO(matias)` y seguir; no inventar datos.
