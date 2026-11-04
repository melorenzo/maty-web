import { describe, expect, it } from 'vitest';
import { buildCvPdf } from './cv-pdf';

const comoTexto = (bytes: Uint8Array) => new TextDecoder('latin1').decode(bytes);

describe('buildCvPdf', () => {
  const pdf = buildCvPdf();
  const texto = comoTexto(pdf);

  it('genera un PDF con encabezado y trailer', () => {
    expect(texto.startsWith('%PDF-1.4')).toBe(true);
    expect(texto).toContain('%%EOF');
    expect(texto).toContain('/Type /Catalog');
    expect(texto).toContain('/Type /Pages');
  });

  it('incluye los datos del CV', () => {
    expect(texto).toContain('Matías Lorenzo');
    expect(texto).toContain('Facilitador Pedagógico Digital');
    expect(texto).toContain('Licenciatura en Tecnologías Digitales');
    expect(texto).toContain('Especialización en React');
    expect(texto).toContain('melorenzo@fullware.com.ar');
  });

  it('declara la tabla xref y los objetos referenciados', () => {
    expect(texto).toContain('xref');
    expect(texto).toContain('startxref');
    const paginas = texto.match(/\/Type \/Page[^s]/g) ?? [];
    expect(paginas.length).toBeGreaterThanOrEqual(1);
  });

  it('agrega enlaces clicables a los datos de contacto', () => {
    expect(texto).toContain('/Subtype /Link');
    expect(texto).toContain('https://github.com/melorenzo');
  });
});
