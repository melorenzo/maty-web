import type { ServiceItem } from './types';

export const servicios: ServiceItem[] = [
  {
    id: 'asesoria',
    name: 'Asesoría técnica',
    tagline: 'Revisar, entender y ordenar antes de construir.',
    forWho:
      'Equipos que tienen un sistema, un proceso o un proyecto de software y no saben por dónde seguir.',
    what: [
      'Revisión de código y arquitectura existente, con prioridades y no con subjetividad.',
      'Auditoría de infraestructura: servidores, contenedores, backups y accesos.',
      'Automatización de procesos administrativos que hoy dependen de planillas y mails.',
      'Mentoría técnica para equipos que están creciendo rápido.',
    ],
    process: [
      { title: '1. Conversación', description: 'Media hora para entender el problema real, no el síntoma.' },
      { title: '2. Diagnóstico', description: 'Revisión del código, la infraestructura o el proceso, con evidencia.' },
      { title: '3. Plan', description: 'Pasos concretos, ordenados por impacto y esfuerzo.' },
      { title: '4. Acompañamiento', description: 'Implementamos juntos lo que mejora el resultado.' },
    ],
    deliverables: [
      'Informe de diagnóstico con hallazgos priorizados',
      'Plan de acción con tareas y tiempos estimados',
      'Sesión de devolución para el equipo',
    ],
    cta: 'Escribime y contame qué tenés entre manos.',
  },
  {
    id: 'diseno-web',
    name: 'Diseño web',
    tagline: 'Sitios que cargan rápido, se leen bien y se entienden.',
    forWho:
      'Personas, proyectos y organizaciones que necesitan un sitio propio que no parezca una plantilla.',
    what: [
      'Sitios institucionales, landings y portfolios con identidad propia.',
      'Implementación en Astro y React, con foco en performance y accesibilidad.',
      'Sistemas de contenido simples para que el sitio se actualice sin depender del desarrollador.',
      'SEO técnico: metadatos, estructura, sitemap y datos estructurados.',
    ],
    process: [
      { title: '1. Diagnóstico', description: 'Qué necesitás del sitio, quién lo usa y qué tiene que lograr.' },
      { title: '2. Diseño', description: 'Estructura, contenido y una dirección visual con identidad propia.' },
      { title: '3. Construcción', description: 'Desarrollo con Astro, React yTypeScript, medido todo el tiempo.' },
      { title: '4. Publicación', description: 'Deploy, métricas, y un panel para entender qué pasa.' },
    ],
    deliverables: [
      'Sitio responsive, accesible y rápido',
      'Código fuente y documentación de despliegue',
      'Capacitación para actualizar el contenido',
    ],
    cta: 'Contame qué proyecto tenés en mente.',
  },
  {
    id: 'automatizacion',
    name: 'Automatización',
    tagline: 'Que el proceso repetitivo lo haga la máquina, y vos dedicarte a lo importante.',
    forWho:
      'Estudios,benius y áreas administrativas que pierden horas en tareas que se pueden automatizar.',
    what: [
      'Bots de Telegram y agentes que atienden consultas y disparan procesos.',
      'Integraciones entre sistemas que hoy se pasan datos a mano.',
      'Reportes automáticos y tableros con la información que se mira cada semana.',
      'Scraping y procesamiento de datos para informes que hoy se arman a mano.',
    ],
    process: [
      { title: '1. Mapa del proceso', description: 'Documentamos cómo se hace hoy, con tiempos y puntos de dolor.' },
      { title: '2. Diseño', description: 'Definimos qué se automatiza, qué se avisa y qué sigue siendo humano.' },
      { title: '3. Implementación', description: 'Construimos el bot o la integración, con despliegue y monitoreo.' },
      { title: '4. Mejora', description: 'Medimos el ahorro y ajustamos el proceso con uso real.' },
    ],
    deliverables: [
      'Bot o integración funcionando en producción',
      'Documentación de operación y mantenimiento',
      'Medición del tiempo ahorrado',
    ],
    cta: 'Contame qué tarea se te repite todos los días.',
  },
];
