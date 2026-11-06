import type { APIRoute } from 'astro';
import { getLatestPosts } from '../../lib/blog';

export const prerender = false;

const LIMITE_MAXIMO = 20;

export const GET: APIRoute = async ({ request }) => {
  const url = new URL(request.url);
  const pedido = Number(url.searchParams.get('limit'));
  const limit = Number.isFinite(pedido)
    ? Math.min(Math.max(Math.trunc(pedido), 1), LIMITE_MAXIMO)
    : LIMITE_MAXIMO;

  const posts = await getLatestPosts(limit);

  return new Response(JSON.stringify({ posts }), {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=300',
    },
  });
};
