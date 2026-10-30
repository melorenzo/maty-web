import type { CertificationItem, EducationItem } from './types';

export const formacion: EducationItem[] = [
  {
    id: 'licenciatura-tecnologias-digitales',
    title: 'Licenciatura en Tecnologías Digitales',
    org: 'Universidad de la Ciudad de Buenos Aires (UNICABA)',
    period: '2021 → 2025',
    detail:
      'Enfoque en innovación educativa, tecnologías emergentes e integración de herramientas digitales.',
  },
  {
    id: 'profesor-universitario',
    title: 'Profesor Universitario',
    org: 'Universidad de la Ciudad de Buenos Aires (UNICABA)',
    period: '2025',
    detail: 'Habilitación docente para el nivel universitario.',
  },
  {
    id: 'tecnico-superior-analisis-sistemas',
    title: 'Técnico Superior en Análisis de Sistemas',
    org: 'IFTS N.º 21 — GCBA',
    period: '2006 → 2008',
    detail: 'Formación técnica en análisis, diseño y mantenimiento de sistemas.',
  },
];

export const certificaciones: CertificationItem[] = [
  { id: 'react', title: 'Especialización en React', org: 'Codo a Codo', year: '2023' },
  { id: 'ap4', title: 'Desarrollo Frontend', org: 'Argentina Programa 4.0', year: '2023' },
  {
    id: 'fullstack',
    title: 'Desarrollo Web Fullstack',
    org: 'Codo a Codo — GCBA',
    year: '2022',
  },
  { id: 'governance', title: 'Beca Governance', org: 'South School on Internet', year: '2023' },
  { id: 'sysadmin', title: 'SysAdmin Linux I y II', org: 'Educación IT', year: '2018 — 2019' },
  { id: 'cripto', title: 'Introducción a las Criptomonedas', org: 'Solow', year: '2023' },
  { id: 'web3', title: 'Blockchain y Web3', org: 'Lemon Cash', year: '2022' },
  { id: 'seguridad', title: 'Seguridad Informática', org: 'CFP 22 / Educación IT', year: '2016 — 2020' },
  { id: 'java', title: 'Programación en Java', org: 'Codo a Codo — GCBA', year: '2017' },
  { id: 'redes', title: 'Curso de Redes', org: 'Hardware Institute', year: '2007 — 2008' },
];
