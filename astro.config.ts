import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import mdx from '@astrojs/mdx';
import tailwindcss from '@tailwindcss/vite';
import cloudflare from '@astrojs/cloudflare';

const site = process.env.PUBLIC_SITE_URL ?? process.env.SITE_URL ?? 'https://matiaslorenzo.fullware.com.ar';

export default defineConfig({
  site,
  output: 'static',
  adapter: cloudflare({ prerenderEnvironment: 'node', imageService: 'passthrough' }),
  integrations: [react(), sitemap(), mdx()],
  vite: {
    plugins: [tailwindcss()],
  },
  compressHTML: true,
  session: false,
  build: {
    inlineStylesheets: 'auto',
  },
});
