import { describe, expect, it } from 'vitest';
import { formatDate, stripHtml } from './blog';

describe('stripHtml', () => {
  it('quita etiquetas y entidades', () => {
    expect(stripHtml('<p>Hola <strong>mundo</strong></p>')).toBe('Hola mundo');
    expect(stripHtml('Dise&ntilde;o')).toBe('Diseño');
    expect(stripHtml('a & b')).toBe('a & b');
  });

  it('colapsa espacios', () => {
    expect(stripHtml('  uno   dos  ')).toBe('uno dos');
  });
});

describe('formatDate', () => {
  it('formatea una fecha ISO', () => {
    expect(formatDate('2026-06-08T10:00:00')).toMatch(/2026/);
  });

  it('devuelve el valor original si no es fecha', () => {
    expect(formatDate('no-es-fecha')).toBe('no-es-fecha');
  });
});
