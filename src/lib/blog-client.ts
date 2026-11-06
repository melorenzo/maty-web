import type { BlogPost } from './blog-shared';

function esPost(valor: unknown): valor is BlogPost {
  if (typeof valor !== 'object' || valor === null) return false;
  const post = valor as Record<string, unknown>;
  return (
    typeof post.title === 'string' &&
    typeof post.link === 'string' &&
    typeof post.date === 'string' &&
    typeof post.excerpt === 'string'
  );
}

/**
 * Trae los posteos frescos desde el endpoint /api/blog.
 * Si falla (sin red, API caída, respuesta inesperada) devuelve una lista vacía:
 * la isla conserva los posteos que ya venían horneados en el HTML.
 */
export async function fetchLatestPosts(limit = 20): Promise<BlogPost[]> {
  try {
    const response = await fetch(`/api/blog?limit=${limit}`, {
      headers: { Accept: 'application/json' },
    });

    if (!response.ok) return [];

    const payload: unknown = await response.json();
    if (typeof payload !== 'object' || payload === null) return [];

    const posts = (payload as { posts?: unknown }).posts;
    if (!Array.isArray(posts)) return [];

    return posts.filter(esPost).slice(0, limit);
  } catch {
    return [];
  }
}
