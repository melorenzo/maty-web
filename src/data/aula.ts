import type { ClassroomItem, LearningPathItem } from './types';

export const metodologia: ClassroomItem[] = [
  {
    id: 'abp',
    title: 'Aprendizaje basado en proyectos',
    summary:
      'Cada estudiante construye algo que funciona y puede mostrar. El error es parte del plan, no un castigo.',
    topics: ['Consignas abiertas', 'Entregas parciales', 'Evaluación formativa', 'Exposición'],
  },
  {
    id: 'pensamiento-computacional',
    title: 'Pensamiento computacional',
    summary:
      'Descomponer problemas, reconocer patrones, abstraer y crear algoritmos antes de escribir código.',
    topics: ['Descomposición', 'Patrones', 'Abstracción', 'Algoritmos'],
  },
  {
    id: 'ia-pedagogica',
    title: 'IA con mirada ética',
    summary:
      'Usar modelos como copilotos sin delegar el criterio: qué se puede pedir, qué hay que verificar y por qué.',
    topics: ['Pensamiento crítico', 'Verificación', 'Sesgos', 'Autoría'],
  },
  {
    id: 'software-libre-aula',
    title: 'Software libre en el aula',
    summary:
      'Enseñar con herramientas que se pueden auditar, modificar y compartir. La licencia también es una lección.',
    topics: ['Licencias', 'Código abierto', 'Comunidad', 'Autonomía'],
  },
];

export const rutas: LearningPathItem[] = [
  {
    id: 'python',
    title: 'Python desde cero',
    level: 'Inicial',
    duration: '8 semanas',
    outcome: 'Terminar con un proyecto propio en GitHub y saber explicarlo.',
    topics: ['Sintaxis', 'Estructuras de control', 'Funciones', 'Archivos', 'Git'],
  },
  {
    id: 'web',
    title: 'Web moderna',
    level: 'Inicial',
    duration: '10 semanas',
    outcome: 'Publicar un sitio propio con Astro, entendiendo HTML, CSS y el modelo cliente-servidor.',
    topics: ['HTML', 'CSS', 'JavaScript', 'Astro', 'Git'],
  },
  {
    id: 'linux',
    title: 'Linux y terminal',
    level: 'Intermedio',
    duration: '6 semanas',
    outcome: 'Administrar un servidor propio: usuarios, permisos, servicios y backups.',
    topics: ['Shell', 'Permisos', 'systemd', 'Docker', 'Backups'],
  },
  {
    id: 'ia',
    title: 'IA aplicada',
    level: 'Intermedio',
    duration: '6 semanas',
    outcome: 'Construir un agente o bot que resuelva una tarea real de forma verificable.',
    topics: ['LLMs', 'Agentes', 'RAG', 'Automatización', 'Evaluación'],
  },
];

export const materias = [
  'Programación',
  'Desarrollo web',
  'Inteligencia artificial',
  'Hardware',
  'Redes',
  'Sistemas operativos',
  'Seguridad informática',
  'Bases de datos',
  'Diseño',
];
