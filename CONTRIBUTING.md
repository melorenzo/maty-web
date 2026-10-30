# Cómo colaborar

Gracias por querer sumar. El sitio es software libre (MIT) y la idea es que cualquiera pueda usarlo,
mejorarlo y reusarlo.

## Antes de empezar

- Leé el [código de conducta](CODE_OF_CONDUCT.md).
- Para cambios grandes, abrí un issue antes de escribir código, así coordinamos el enfoque.
- Los textos del sitio están en español rioplatense; mantené ese tono.

## Entorno

```bash
nvm use 24
npm install
cp .env.example .env
```

## Comandos

| Comando | Qué hace |
| --- | --- |
| `npm run dev` | Servidor de desarrollo con hot reload |
| `npm run check` | Chequeo de tipos de Astro y TypeScript |
| `npm run lint` | ESLint sobre `.astro`, `.ts` y `.tsx` |
| `npm run test` | Tests unitarios (Vitest) |
| `npm run build` | Build de producción |
| `npm run verify` | check + lint + test + build, en ese orden |

## Dónde tocar qué

- `src/pages/` — rutas. Cada sección es una página.
- `src/components/astro/` — piezas de diseño (ventanas, dock, tarjetas).
- `src/components/react/` — islas interactivas. Solo si hay interacción real.
- `src/lib/` — lógica pura y testeable (juego, promo, comandos, contacto).
- `src/data/` — contenido tipado del perfil.
- `src/content/proyectos/` — fichas de proyectos en Markdown.

## Reglas de estilo

- Código e identificadores en inglés, textos y comentarios en español.
- Sin comentarios innecesarios: el código se explica solo.
- Componentes de Astro sin JavaScript; React solo donde haya interacción.
- Nada de secretos en el repo. Las claves van en `.env` local o en secretos de Wrangler.
- Cero emojis en el código y en el contenido.

## Commits y pull requests

- Commits en inglés, estilo imperativo corto: `fix: correct promo daily counter`.
- Un pull request = un tema. Incluí `npm run verify` en verde antes de pedir revisión.
- Si tocás `src/lib/game/` o `src/lib/promo/`, agregá o actualizá los tests de `*.test.ts`.
