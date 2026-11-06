export interface BlogPost {
  title: string;
  link: string;
  date: string;
  excerpt: string;
}

const namedEntities: Record<string, string> = {
  ntilde: 'ñ',
  aacute: 'á',
  eacute: 'é',
  iacute: 'í',
  oacute: 'ó',
  uacute: 'ú',
  Aacute: 'Á',
  Eacute: 'É',
  Iacute: 'Í',
  Oacute: 'Ó',
  Uacute: 'Ú',
  Ntilde: 'Ñ',
  laquo: '«',
  raquo: '»',
  hellip: '…',
  ldquo: '“',
  rdquo: '”',
  lsquo: '‘',
  rsquo: '’',
  mdash: '—',
  ndash: '–',
  copy: '©',
  reg: '®',
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
    .replace(/\x26lt;/g, '<')
    .replace(/\x26gt;/g, '>')
    .replace(/\x26quot;/g, '"')
    .replace(/\x26amp;/g, '\x26')
    .replace(/\s+/g, ' ')
    .trim();
}

export function formatDate(date: string): string {
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return date;
  return parsed.toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' });
}
