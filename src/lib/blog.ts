import { z } from 'astro/zod';
import { stripHtml, type BlogPost } from './blog-shared';

export { decodeEntities, formatDate, stripHtml, type BlogPost } from './blog-shared';

const rawPostSchema = z.object({
  title: z.object({ rendered: z.string() }),
  link: z.string(),
  date: z.string(),
  excerpt: z.object({ rendered: z.string() }),
});

const BLOG_API = 'https://blog.fullware.com.ar/wp-json/wp/v2/posts';

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
