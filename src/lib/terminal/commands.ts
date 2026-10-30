import type { Theme } from '../theme';

export type LineTone = 'default' | 'ok' | 'muted' | 'accent' | 'error' | 'terminal';

export interface TerminalLine {
  text: string;
  tone?: LineTone;
}

export interface TerminalProject {
  title: string;
  status: string;
  summary: string;
}

export interface TerminalService {
  id: string;
  name: string;
  tagline: string;
}

export interface TerminalContext {
  name: string;
  role: string;
  city: string;
  email: string;
  years: string;
  projects: TerminalProject[];
  services: TerminalService[];
  classroom: string[];
  manifesto: string[];
}

export interface CommandResult {
  lines: TerminalLine[];
  clear?: boolean;
  theme?: Theme;
}

export const terminalCommands = [
  'help',
  'whoami',
  'man',
  'ls',
  'cat about.txt',
  'projects',
  'services',
  'aula',
  'foss',
  'contact',
  'theme',
  'clear',
  'sudo hire-me',
] as const;

const ok = (text: string): TerminalLine => ({ text, tone: 'ok' });
const muted = (text: string): TerminalLine => ({ text, tone: 'muted' });
const accent = (text: string): TerminalLine => ({ text, tone: 'accent' });
const error = (text: string): TerminalLine => ({ text, tone: 'error' });

export function executeCommand(rawInput: string, ctx: TerminalContext): CommandResult {
  const input = rawInput.trim();
  if (!input) return { lines: [] };

  const [name, ...args] = input.split(/\s+/);
  const arg = args.join(' ');

  switch (name) {
    case 'help':
      return {
        lines: [
          muted('Comandos disponibles:'),
          ...terminalCommands.map((command) => accent(`  ${command}`)),
          muted('Probá `man`, `ls` o `cat about.txt`.'),
        ],
      };

    case 'whoami':
      return {
        lines: [
          ok(ctx.name),
          muted(ctx.role),
          muted(`${ctx.city} · ${ctx.years} en tecnología`),
        ],
      };

    case 'man':
      if (arg) {
        const topic = ctx.services.find((service) => service.id === arg);
        if (topic) {
          return { lines: [accent(topic.name), muted(topic.tagline)] };
        }
        return { lines: [error(`No hay manual para "${arg}".`), muted('Probá `man servicios`.')] };
      }
      return {
        lines: [
          accent('MATY(1)'),
          muted('Docente de tecnología, analista de sistemas y constructor de software libre.'),
          muted('Secciones: about, proyectos, aula, foss, servicios, contacto.'),
          muted('Para el detalle de un servicio: `man asesoria`.'),
        ],
      };

    case 'ls':
      return {
        lines: [
          muted('/home/maty'),
          accent('  about.txt'),
          accent('  proyectos/'),
          accent('  aula/'),
          accent('  software-libre/'),
          accent('  servicios/'),
          accent('  blog/'),
          accent('  arcade/'),
        ],
      };

    case 'cat':
      if (arg === 'about.txt') {
        return {
          lines: [
            { text: `${ctx.name} — ${ctx.role}` },
            muted(ctx.city),
            { text: '' },
            { text: 'Enseño tecnología y construyo software. Trabajo con herramientas libres,' },
            { text: 'automatizo procesos que se repiten y documento lo que aprendo en el blog.' },
            { text: '' },
            { text: `Contacto: ${ctx.email}`, tone: 'accent' },
          ],
        };
      }
      return { lines: [error(`cat: ${arg || '(vacío)'}: archivo inexistente`)] };

    case 'projects': {
      const lines: TerminalLine[] = [muted(`${ctx.projects.length} proyectos en el taller:`)];
      for (const project of ctx.projects) {
        lines.push({ text: `  ${project.title.padEnd(22)} [${project.status}]`, tone: 'accent' });
      }
      lines.push(muted('Detalle en /proyectos'));
      return { lines };
    }

    case 'services':
      return {
        lines: [
          muted('Servicios (se cotizan a medida):'),
          ...ctx.services.map((service) => accent(`  ${service.name} — ${service.tagline}`)),
          muted('Detalle en /servicios'),
        ],
      };

    case 'aula':
      return {
        lines: [
          muted('En el aula:'),
          ...ctx.classroom.map((item) => accent(`  ${item}`)),
          muted('Detalle en /aula'),
        ],
      };

    case 'foss':
      return {
        lines: [
          muted('Software libre:'),
          ...ctx.manifesto.map((item, index) => ({
            text: `  ${index + 1}. ${item}`,
            tone: 'default' as const,
          })),
          muted('Detalle en /software-libre'),
        ],
      };

    case 'contact':
      return {
        lines: [
          muted('Escribime:'),
          accent(`  ${ctx.email}`),
          muted('Formulario con protección anti-bot en /contacto'),
        ],
      };

    case 'theme':
      if (arg === 'light' || arg === 'dark') {
        return { lines: [ok(`Tema ${arg} aplicado.`)], theme: arg };
      }
      return { lines: [error('Uso: theme light | theme dark')] };

    case 'clear':
      return { lines: [], clear: true };

    case 'sudo':
      if (arg === 'hire-me') {
        return {
          lines: [
            error('[sudo] password for maty: ********'),
            muted('No hace falta contraseña: escribime y lo charlamos.'),
            muted(ctx.email),
          ],
        };
      }
      return { lines: [error('sudo: comando desconocido. Probá `sudo hire-me`.')] };

    case 'status':
      return {
        lines: [
          ok('[ OK ] sitio operativo'),
          ok(`[ OK ] ${ctx.projects.length} proyectos publicados`),
          muted('[INFO] Buenos Aires, Argentina'),
        ],
      };

    default:
      return {
        lines: [
          error(`${name}: comando no encontrado.`),
          muted('Escribí `help` para ver la lista.'),
        ],
      };
  }
}

export function autocomplete(input: string): string | null {
  const trimmed = input.trim();
  if (!trimmed || trimmed.includes(' ')) return null;
  const match = terminalCommands.find((command) => command.startsWith(trimmed));
  return match ?? null;
}
