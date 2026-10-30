import { describe, expect, it } from 'vitest';
import {
  autocomplete,
  executeCommand,
  terminalCommands,
  type TerminalContext,
} from './commands';

const contexto: TerminalContext = {
  name: 'Matías Lorenzo',
  role: 'Docente de Tecnología',
  city: 'Buenos Aires',
  email: 'melorenzo@fullware.com.ar',
  years: '+18',
  projects: [
    { title: 'NotiBot', status: 'running', summary: 'Automatización periodística' },
    { title: 'Zorwis', status: 'building', summary: 'Identidad digital' },
  ],
  services: [
    { id: 'asesoria', name: 'Asesoría técnica', tagline: 'Revisar antes de construir' },
    { id: 'diseno-web', name: 'Diseño web', tagline: 'Sitios rápidos y claros' },
    { id: 'automatizacion', name: 'Automatización', tagline: 'Lo repetitivo, a la máquina' },
  ],
  classroom: ['Aprendizaje basado en proyectos'],
  manifesto: ['El software libre se comparte'],
};

describe('executeCommand', () => {
  it('ignora entradas vacías', () => {
    expect(executeCommand('   ', contexto).lines).toHaveLength(0);
  });

  it('help lista los comandos', () => {
    const result = executeCommand('help', contexto);
    expect(result.lines.length).toBeGreaterThan(terminalCommands.length - 1);
  });

  it('whoami devuelve el nombre', () => {
    const result = executeCommand('whoami', contexto);
    expect(result.lines[0]?.text).toBe('Matías Lorenzo');
  });

  it('man sin argumento describe el sitio', () => {
    const result = executeCommand('man', contexto);
    expect(result.lines[0]?.text).toBe('MATY(1)');
  });

  it('man con un servicio devuelve el tagline', () => {
    const result = executeCommand('man asesoria', contexto);
    expect(result.lines[0]?.text).toBe('Asesoría técnica');
  });

  it('man con un tema inexistente avisa', () => {
    const result = executeCommand('man xyz', contexto);
    expect(result.lines[0]?.tone).toBe('error');
  });

  it('ls lista los directorios', () => {
    const result = executeCommand('ls', contexto);
    expect(result.lines.some((line) => line.text.includes('proyectos/'))).toBe(true);
  });

  it('cat about.txt devuelve la bio', () => {
    const result = executeCommand('cat about.txt', contexto);
    expect(result.lines[0]?.text).toContain('Matías Lorenzo');
  });

  it('cat de un archivo inexistente falla', () => {
    const result = executeCommand('cat nope.txt', contexto);
    expect(result.lines[0]?.tone).toBe('error');
  });

  it('projects lista los proyectos', () => {
    const result = executeCommand('projects', contexto);
    expect(result.lines.some((line) => line.text.includes('NotiBot'))).toBe(true);
  });

  it('services lista los tres servicios', () => {
    const result = executeCommand('services', contexto);
    expect(result.lines.filter((line) => line.tone === 'accent')).toHaveLength(3);
  });

  it('theme light devuelve la acción de tema', () => {
    const result = executeCommand('theme light', contexto);
    expect(result.theme).toBe('light');
  });

  it('theme sin argumento indica el uso', () => {
    const result = executeCommand('theme', contexto);
    expect(result.lines[0]?.tone).toBe('error');
  });

  it('clear marca limpiar', () => {
    expect(executeCommand('clear', contexto).clear).toBe(true);
  });

  it('sudo hire-me responde con el contacto', () => {
    const result = executeCommand('sudo hire-me', contexto);
    expect(result.lines.some((line) => line.text.includes('melorenzo@fullware.com.ar'))).toBe(true);
  });

  it('un comando desconocido da error', () => {
    const result = executeCommand('xyzabc', contexto);
    expect(result.lines[0]?.tone).toBe('error');
  });
});

describe('autocomplete', () => {
  it('completa prefijos', () => {
    expect(autocomplete('who')).toBe('whoami');
    expect(autocomplete('proj')).toBe('projects');
  });

  it('no completa con espacios ni sin coincidencia', () => {
    expect(autocomplete('cat about')).toBeNull();
    expect(autocomplete('zzz')).toBeNull();
    expect(autocomplete('')).toBeNull();
  });
});
