import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { getLatestPosts } from '../lib/blog';

export const prerender = false;

export async function GET(context: APIContext) {
  const posts = await getLatestPosts(20);

  return rss({
    title: 'Maty — notas sobre tecnología y software libre',
    description:
      'Artículos sobre automatización, IA, infraestructura y software libre, con foco en educación.',
    site: context.site ?? 'https://matiaslorenzo.fullware.com.ar',
    items: posts.map((post) => ({
      title: post.title,
      description: post.excerpt,
      link: post.link,
      pubDate: new Date(post.date),
    })),
    customData: '<language>es-ar</language>',
  });
}
