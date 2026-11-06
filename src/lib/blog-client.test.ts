import { afterEach, describe, expect, it, vi } from 'vitest';
import { fetchLatestPosts } from './blog-client';

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('fetchLatestPosts', () => {
  it('trae los posteos del endpoint', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () =>
        new Response(
          JSON.stringify({
            posts: [
              {
                title: 'Un post',
                link: 'https://blog.fullware.com.ar/un-post/',
                date: '2026-11-05T18:15:06',
                excerpt: 'Resumen',
              },
            ],
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } },
        ),
      ),
    );

    const posts = await fetchLatestPosts(4);

    expect(posts).toHaveLength(1);
    expect(posts[0].title).toBe('Un post');
  });

  it('devuelve lista vacía si la respuesta no es válida', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response('no soy json', { status: 200 })),
    );

    expect(await fetchLatestPosts(4)).toEqual([]);
  });

  it('devuelve lista vacía si el endpoint falla', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response('error', { status: 500 })),
    );

    expect(await fetchLatestPosts(4)).toEqual([]);
  });

  it('devuelve lista vacía si la red falla', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => {
        throw new Error('sin red');
      }),
    );

    expect(await fetchLatestPosts(4)).toEqual([]);
  });

  it('respeta el limite pedido', async () => {
    const post = {
      title: 'Un post',
      link: 'https://blog.fullware.com.ar/un-post/',
      date: '2026-11-05T18:15:06',
      excerpt: 'Resumen',
    };

    vi.stubGlobal(
      'fetch',
      vi.fn(
        async () =>
          new Response(JSON.stringify({ posts: [post, post, post] }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          }),
      ),
    );

    expect(await fetchLatestPosts(2)).toHaveLength(2);
  });
});
