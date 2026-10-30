import type { LinkItem } from './types';

export const links: LinkItem[] = [
  { label: 'GitHub', href: 'https://github.com/melorenzo', kind: 'github', external: true },
  {
    label: 'LinkedIn',
    href: 'https://www.linkedin.com/in/matias-lorenzo33',
    kind: 'linkedin',
    external: true,
  },
  { label: 'Blog', href: 'https://blog.fullware.com.ar', kind: 'blog', external: true },
  { label: 'RSS del blog', href: '/rss.xml', kind: 'rss' },
];

export const emails = ['melorenzo@fullware.com.ar', 'melorenzo@ymail.com'] as const;

export const primaryEmail = emails[0];
