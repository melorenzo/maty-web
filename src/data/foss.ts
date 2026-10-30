import type { FossTool } from './types';

export const manifiesto = [
  'El software libre no es un detalle del proyecto: es la forma en que el conocimiento se comparte y se sostiene.',
  'Enseño con herramientas que se pueden auditar, copiar y modificar. Enseño mejor lo que puedo abrir y romper.',
  'Publico lo que hago. Si le sirve a un docente de otro lado del país, mejor.',
  'La privacidad también se diseña: los datos de quien escribe en este sitio no se usan para nada que no sea responderle.',
];

export const herramientas: FossTool[] = [
  {
    name: 'Linux',
    category: 'Sistema operativo',
    why: 'El aula entera se puede administrar desde una terminal: mismo entorno para todos.',
  },
  {
    name: 'Python',
    category: 'Lenguaje',
    why: 'El primer lenguaje de la mayoría: legible y útil desde la primera clase.',
  },
  {
    name: 'Git',
    category: 'Control de versiones',
    why: 'La herramienta que enseña a trabajar en equipo y a no perder el trabajo.',
  },
  {
    name: 'Docker',
    category: 'Infraestructura',
    why: 'Que el entorno de la clase sea el mismo que el de producción.',
  },
  {
    name: 'VS Code',
    category: 'Editor',
    why: 'Extensible, gratis y estándar en la industria.',
  },
  {
    name: 'Home Assistant',
    category: 'Automatización',
    why: 'Software libre para el hogar: pensar un problema y resolverlo en casa.',
  },
  {
    name: 'Blender',
    category: 'Diseño',
    why: 'Creación 3D libre para proyectos de arte y comunicación.',
  },
  {
    name: 'GIMP',
    category: 'Diseño',
    why: 'Edición de imágenes sin pagar licencias.',
  },
  {
    name: 'Astro',
    category: 'Web',
    why: 'Sitios estáticos, rápidos y sin dependencias innecesarias.',
  },
  {
    name: 'WordPress',
    category: 'Publicación',
    why: 'El blog de esta casa: abierto, ampliable y conocido.',
  },
];

export const compromisos = [
  'El código de este sitio es público y la licencia es libre.',
  'El motor del arcade está escrito en TypeScript, sin una sola librería de juego.',
  'Los materiales del aula se comparten como repositorios abiertos.',
  'Este sitio no usa cookies de seguimiento ni analítica de terceros.',
];

export const principios = [
  'Software libre por defecto, no por excepción.',
  'Privacidad por diseño.',
  'Documentación como parte del entregable.',
  'Enseñar es la mejor forma de mantener algo.',
];
