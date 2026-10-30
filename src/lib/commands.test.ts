import { describe, expect, it } from 'vitest';
import { filterCommands, normalize, commands } from './commands';

describe('normalize', () => {
  it('pasa a minúsculas y quita acentos', () => {
    expect(normalize('Diseño Web')).toBe('diseno web');
    expect(normalize('ÁREA')).toBe('area');
  });
});

describe('filterCommands', () => {
  it('devuelve todos los comandos sin consulta', () => {
    expect(filterCommands('')).toHaveLength(commands.length);
  });

  it('encuentra por título', () => {
    const results = filterCommands('servicios');
    expect(results.some((command) => command.id === 'goto-servicios')).toBe(true);
  });

  it('encuentra por keyword sin acentos', () => {
    const results = filterCommands('diseno');
    expect(results.some((command) => command.id === 'goto-servicios')).toBe(true);
  });

  it('prioriza coincidencias que empiezan por el término', () => {
    const results = filterCommands('tema');
    expect(results[0]?.id).toBe('theme-light');

    const porKeyword = filterCommands('theme');
    expect(porKeyword.some((command) => command.id === 'theme-dark')).toBe(true);
  });

  it('devuelve vacío si no hay coincidencias', () => {
    expect(filterCommands('xyzabc')).toHaveLength(0);
  });

  it('todos los comandos tienen id, título y grupo válido', () => {
    for (const command of commands) {
      expect(command.id).toBeTruthy();
      expect(command.title).toBeTruthy();
      expect(['navegar', 'perfil', 'apariencia', 'externos', 'diversion']).toContain(command.group);
    }
  });
});
