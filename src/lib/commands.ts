export type CommandGroup = 'navegar' | 'perfil' | 'apariencia' | 'externos' | 'diversion';

export interface Command {
  id: string;
  title: string;
  group: CommandGroup;
  keywords?: string[];
  shortcut?: string;
  href?: string;
  external?: boolean;
  action?: 'theme-light' | 'theme-dark' | 'copy-email' | 'open-arcade' | 'scroll-top';
}

export const commands: Command[] = [
  {
    id: 'goto-inicio',
    title: 'Ir al inicio',
    group: 'navegar',
    keywords: ['home', 'inicio'],
    href: '/',
  },
  {
    id: 'goto-proyectos',
    title: 'Ir a proyectos',
    group: 'navegar',
    keywords: ['projects', 'codigo'],
    href: '/proyectos',
  },
  {
    id: 'goto-aula',
    title: 'Ir al aula',
    group: 'navegar',
    keywords: ['docencia', 'enseñar', 'educacion'],
    href: '/aula',
  },
  {
    id: 'goto-foss',
    title: 'Ir a software libre',
    group: 'navegar',
    keywords: ['foss', 'open source', 'linux'],
    href: '/software-libre',
  },
  {
    id: 'goto-servicios',
    title: 'Ir a servicios',
    group: 'navegar',
    keywords: ['asesoria', 'diseno', 'automatizacion', 'trabajo'],
    href: '/servicios',
  },
  {
    id: 'goto-arcade',
    title: 'Abrir el arcade',
    group: 'diversion',
    keywords: ['juego', 'invaders', 'spaces', 'promo', 'codigo'],
    href: '/arcade',
  },
  {
    id: 'goto-blog',
    title: 'Ir al blog',
    group: 'navegar',
    keywords: ['escribo', 'articulos'],
    href: '/blog',
  },
  {
    id: 'goto-cv',
    title: 'Ir al CV',
    group: 'navegar',
    keywords: ['curriculum', 'trayectoria'],
    href: '/cv',
  },
  {
    id: 'goto-contacto',
    title: 'Ir a contacto',
    group: 'navegar',
    keywords: ['escribir', 'mail', 'formulario'],
    href: '/contacto',
  },
  {
    id: 'goto-man',
    title: 'Abrir el manual',
    group: 'navegar',
    keywords: ['ayuda', 'comandos', 'man'],
    href: '/man',
  },
  {
    id: 'man-matias',
    title: 'man matias',
    group: 'perfil',
    keywords: ['quien soy', 'bio', 'perfil'],
    href: '/man#matias',
  },
  {
    id: 'theme-light',
    title: 'Tema claro',
    group: 'apariencia',
    keywords: ['theme', 'light', 'claro'],
    action: 'theme-light',
  },
  {
    id: 'theme-dark',
    title: 'Tema oscuro',
    group: 'apariencia',
    keywords: ['theme', 'dark', 'oscuro'],
    action: 'theme-dark',
  },
  {
    id: 'copy-email',
    title: 'Copiar mi email',
    group: 'perfil',
    keywords: ['mail', 'correo', 'contacto'],
    action: 'copy-email',
  },
  {
    id: 'open-github',
    title: 'Abrir GitHub',
    group: 'externos',
    keywords: ['codigo', 'repositorios'],
    href: 'https://github.com/melorenzo',
    external: true,
  },
  {
    id: 'open-linkedin',
    title: 'Abrir LinkedIn',
    group: 'externos',
    keywords: ['perfil', 'cv'],
    href: 'https://www.linkedin.com/in/matias-lorenzo33',
    external: true,
  },
  {
    id: 'open-blog',
    title: 'Abrir el blog en una pestaña nueva',
    group: 'externos',
    keywords: ['fullware', 'articulos'],
    href: 'https://blog.fullware.com.ar',
    external: true,
  },
];

export const groupLabels: Record<CommandGroup, string> = {
  navegar: 'Navegar',
  perfil: 'Perfil',
  apariencia: 'Apariencia',
  externos: 'Externos',
  diversion: 'Diversión',
};

export function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

export function filterCommands(query: string, list: Command[] = commands): Command[] {
  const q = normalize(query.trim());
  if (!q) return list;

  return list
    .map((command) => {
      const haystack = normalize(
        [command.title, command.group, ...(command.keywords ?? [])].join(' '),
      );
      const title = normalize(command.title);

      if (title.startsWith(q)) return { command, score: 0 };
      if (haystack.includes(q)) return { command, score: 1 };
      return null;
    })
    .filter((entry): entry is { command: Command; score: number } => entry !== null)
    .sort((a, b) => a.score - b.score)
    .map((entry) => entry.command);
}

export function isMac(): boolean {
  if (typeof navigator === 'undefined') return false;
  return /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent);
}
