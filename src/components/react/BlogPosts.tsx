import { useEffect, useState } from 'react';
import { fetchLatestPosts } from '../../lib/blog-client';
import { formatDate, type BlogPost } from '../../lib/blog-shared';

interface Props {
  initialPosts: BlogPost[];
  limit?: number;
  variant?: 'home' | 'blog';
}

export default function BlogPosts({ initialPosts, limit = 20, variant = 'home' }: Props) {
  const [posts, setPosts] = useState<BlogPost[]>(initialPosts);

  useEffect(() => {
    let vigente = true;

    fetchLatestPosts(limit).then((frescos) => {
      if (vigente && frescos.length > 0) setPosts(frescos);
    });

    return () => {
      vigente = false;
    };
  }, [limit]);

  if (posts.length === 0) {
    return variant === 'blog' ? (
      <p className="text-sm text-text-muted">
        No pude leer el feed del blog. Podés entrar directo al blog:{' '}
        <a
          className="text-accent underline underline-offset-2"
          href="https://blog.fullware.com.ar"
        >
          blog.fullware.com.ar
        </a>
        .
      </p>
    ) : (
      <p className="text-sm text-text-muted">
        No pude leer el feed del blog.{' '}
        <a className="text-accent hover:underline" href="https://blog.fullware.com.ar">
          Ir directo al blog
        </a>
        .
      </p>
    );
  }

  if (variant === 'blog') {
    return (
      <ul className="space-y-4">
        {posts.map((post) => (
          <li key={post.link} className="border-b border-border pb-4 last:border-0 last:pb-0">
            <p className="font-mono text-xs text-text-muted">{formatDate(post.date)}</p>
            <a
              className="mt-1 block text-lg font-semibold hover:text-accent"
              href={post.link}
              target="_blank"
              rel="noreferrer noopener"
            >
              {post.title}
            </a>
            {post.excerpt && <p className="mt-1 text-sm text-text-muted">{post.excerpt}…</p>}
          </li>
        ))}
      </ul>
    );
  }

  return (
    <ul className="space-y-3">
      {posts.map((post) => (
        <li key={post.link} className="flex flex-wrap items-baseline gap-x-3">
          <span className="font-mono text-xs text-text-muted">{formatDate(post.date)}</span>
          <a
            className="font-semibold hover:text-accent"
            href={post.link}
            target="_blank"
            rel="noreferrer noopener"
          >
            {post.title}
          </a>
        </li>
      ))}
    </ul>
  );
}
