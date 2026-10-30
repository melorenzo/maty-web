import { z } from 'astro/zod';

export interface BlogPost {
  title: string;
  link: string;
  date: string;
  excerpt: string;
}

const rawPostSchema = z.object({
  title: z.object({ rendered: z.string() }),
  link: z.string(),
  date: z.string(),
  excerpt: z.object({ rendered: z.string() }),
});

const BLOG_API = 'https://blog.fullware.com.ar/wp-json/wp/v2/posts';

const namedEntities: Record<string, string> = {
  ntilde: '\u00f1',
  aacute: '\u00e1',
  eacute: '\u00e9',
  iacute: '\u00ed',
  oacute: '\u00f3',
  uacute: '\u00fa',
  Aacute: '\u00c1',
  Eacute: '\u00c9',
  Iacute: '\u00cd',
  Oacute: '\u00d3',
  Uacute: '\u00da',
  Ntilde: '\u00d1',
  laquo: '\u00ab',
  raquo: '\u00bb',
  hellip: '\u2026',
  ldquo: '\u201c',
  rdquo: '\u201d',
  lsquo: '\u2018',
  rsquo: '\u2019',
  mdash: '\u2014',
  ndash: '\u2013',
  copy: '\u00a9',
  reg: '\u00ae',
};

export function decodeEntities(text: string): string {
  return text.replace(/&([a-zA-Z]+);/g, (match, name: string) => namedEntities[name] ?? match);
}

export function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, '')
    .replace(/&#(\d+);/g, (_, code: string) => String.fromCharCode(Number(code)))
    .replace(/&nbsp;/g, ' ')
    .replace(/&([a-zA-Z]+);/g, (match, name: string) => namedEntities[name] ?? match)
    .replace(/\u0026lt;/g, '<')
    .replace(/\u0026gt;/g, '>')
    .replace(/\u0026quot;/g, '"')
    .replace(/\u0026amp;/g, '\u0026')
    .replace(/\s+/g, ' ')
    .trim();
}

export function formatDate(date: string): string {
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return date;
  return parsed.toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' });
}

export async function getLatestPosts(limit = 4): Promise<BlogPost[]> {
  try {
    const response = await fetch(
      `${BLOG_API}?per_page=${limit}&_fields=title,link,date,excerpt`,
      { headers: { Accept: 'application/json' } },
    );

    if (!response.ok) return [];

    const payload: unknown = await response.json();
    const posts = z.array(rawPostSchema).safeParse(payload);
    if (!posts.success) return [];

    return posts.data.map((post) => ({
      title: stripHtml(post.title.rendered),
      link: post.link,
      date: post.date,
      excerpt: stripHtml(post.excerpt.rendered).slice(0, 180),
    }));
  } catch {
    return [];
  }
}
