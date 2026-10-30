import type { StackGroup } from './types';

export const stack: StackGroup[] = [
  {
    id: 'frontend',
    title: 'Frontend',
    description: 'Interfaces que se entienden rápido y funcionan en cualquier pantalla.',
    items: [
      { name: 'TypeScript', note: 'tipos primero' },
      { name: 'React', note: 'componentes' },
      { name: 'Astro', note: 'sitios estáticos' },
      { name: 'JavaScript' },
      { name: 'HTML / CSS', note: 'accesibilidad' },
      { name: 'Tailwind CSS' },
    ],
  },
  {
    id: 'backend',
    title: 'Backend y datos',
    description: 'APIs, datos y procesos que no se caen cuando se cae internet.',
    items: [
      { name: 'Python' },
      { name: 'PHP' },
      { name: 'Node.js' },
      { name: 'REST APIs' },
      { name: 'SQL / MySQL' },
      { name: 'Web scraping' },
    ],
  },
  {
    id: 'ia',
    title: 'IA y automatización',
    description: 'Agentes, bots y modelos trabajando en procesos reales.',
    items: [
      { name: 'LLMs', note: 'Claude, OpenCode' },
      { name: 'Agentes de IA' },
      { name: 'Bots de Telegram' },
      { name: 'Automatización de procesos' },
      { name: 'Prompt engineering' },
    ],
  },
  {
    id: 'infra',
    title: 'Infraestructura',
    description: 'Servidores, contenedores y backups que se sostienen en el tiempo.',
    items: [
      { name: 'Docker' },
      { name: 'Linux', note: 'Ubuntu Server' },
      { name: 'Nginx / Apache' },
      { name: 'WSL' },
      { name: 'Git' },
      { name: 'Backups' },
      { name: 'DNS / SSL' },
      { name: 'WordPress' },
    ],
  },
  {
    id: 'datos',
    title: 'Datos',
    description: 'Del dato crudo a la decisión: reportes y tableros que se leen.',
    items: [
      { name: 'Power BI' },
      { name: 'Grafana' },
      { name: 'Excel / Sheets' },
    ],
  },
];
