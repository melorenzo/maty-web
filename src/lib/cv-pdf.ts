import { experiencia } from '../data/experiencia';
import { certificaciones, formacion } from '../data/formacion';
import { stack } from '../data/stack';
import { AUTHOR } from '../data/site';

const ANCHO = 595;
const ALTO = 842;
const MARGEN = 54;
const MARGEN_INFERIOR = 52;
const ANCHO_UTIL = ANCHO - MARGEN * 2;

const COLOR_TEXTO: [number, number, number] = [0.04, 0.11, 0.17];
const COLOR_SUAVE: [number, number, number] = [0.29, 0.39, 0.47];
const COLOR_ACENTO: [number, number, number] = [0.72, 0.26, 0.06];

const ANCHOS_BASE = [
  278, 278, 355, 556, 556, 889, 667, 191, 333, 333, 389, 584, 278, 333, 278, 278, 556, 556, 556,
  556, 556, 556, 556, 556, 556, 556, 278, 278, 584, 584, 584, 556, 1015, 667, 667, 722, 722, 667,
  611, 778, 722, 278, 500, 667, 556, 833, 722, 778, 667, 778, 722, 667, 611, 722, 667, 944, 667,
  667, 611, 278, 278, 278, 469, 556, 333, 556, 556, 500, 556, 556, 278, 556, 556, 222, 222, 500,
  222, 833, 556, 556, 556, 556, 333, 500, 278, 556, 500, 722, 500, 500, 500, 334, 260, 334, 584,
];

const ANCHOS_ESPECIALES: Record<string, number> = {
  '•': 350,
  '…': 1000,
  '–': 556,
  '—': 1000,
  '’': 222,
  '‘': 222,
  '“': 333,
  '”': 333,
};

const WIN_ANSI: Record<string, number> = {
  '€': 0x80,
  '…': 0x85,
  '‘': 0x91,
  '’': 0x92,
  '“': 0x93,
  '”': 0x94,
  '•': 0x95,
  '–': 0x96,
  '—': 0x97,
  '→': 0x96,
  '←': 0x96,
  '♥': 0x2a,
  '×': 0x78,
};

function anchoDeCaracter(caracter: string): number {
  const especial = ANCHOS_ESPECIALES[caracter];
  if (especial !== undefined) return especial;
  const codigo = caracter.charCodeAt(0);
  if (codigo >= 32 && codigo <= 126) return ANCHOS_BASE[codigo - 32] ?? 556;
  if (codigo >= 0xc0 && codigo <= 0xda) return ANCHOS_BASE[codigo - 0xc0 + 65] ?? 667;
  if (codigo >= 0xe0 && codigo <= 0xfa) return ANCHOS_BASE[codigo - 0xe0 + 97] ?? 556;
  return 556;
}

function anchoDeTexto(texto: string, size: number): number {
  let total = 0;
  for (const caracter of texto) total += anchoDeCaracter(caracter);
  return (total / 1000) * size;
}

function aWinAnsi(texto: string): string {
  let salida = '';
  for (const caracter of texto) {
    const codigo = caracter.charCodeAt(0);
    const especial = WIN_ANSI[caracter];
    if (especial !== undefined) {
      salida += String.fromCharCode(especial);
      continue;
    }
    if (codigo >= 32 && codigo < 127) {
      salida += caracter;
      continue;
    }
    if (codigo >= 160 && codigo <= 255) {
      salida += caracter;
      continue;
    }
    salida += '?';
  }
  return salida;
}

function escapar(texto: string): string {
  return texto.replace(/([\\()])/g, '\\$1');
}

function envolver(texto: string, size: number, ancho: number): string[] {
  const palabras = texto.split(/\s+/).filter(Boolean);
  const lineas: string[] = [];
  let actual = '';

  for (const palabra of palabras) {
    const tentativa = actual ? `${actual} ${palabra}` : palabra;
    if (anchoDeTexto(tentativa, size) <= ancho || !actual) {
      actual = tentativa;
      continue;
    }
    lineas.push(actual);
    actual = palabra;
  }

  if (actual) lineas.push(actual);
  return lineas.length > 0 ? lineas : [''];
}

interface Anotacion {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  uri: string;
}

interface Pagina {
  ops: string[];
  anotaciones: Anotacion[];
}

function aBytes(texto: string): Uint8Array<ArrayBuffer> {
  const salida = new Uint8Array(texto.length);
  for (let indice = 0; indice < texto.length; indice += 1) {
    salida[indice] = texto.charCodeAt(indice) & 0xff;
  }
  return salida;
}

export function buildCvPdf(): Uint8Array<ArrayBuffer> {
  const paginas: Pagina[] = [];
  let ops: string[] = [];
  let anotaciones: Anotacion[] = [];
  let y = ALTO - MARGEN;

  const nuevaPagina = () => {
    if (ops.length === 0) return;
    paginas.push({ ops, anotaciones });
    ops = [];
    anotaciones = [];
    y = ALTO - MARGEN;
  };

  const asegurarEspacio = (alto: number) => {
    if (y - alto < MARGEN_INFERIOR) nuevaPagina();
  };

  const color = (valor: [number, number, number]) =>
    `${valor[0].toFixed(3)} ${valor[1].toFixed(3)} ${valor[2].toFixed(3)}`;

  const linea = (
    texto: string,
    opciones: {
      fuente?: 'F1' | 'F2' | 'F3';
      size?: number;
      color?: [number, number, number];
      x?: number;
      sangria?: number;
      leading?: number;
      espaciado?: number;
    } = {},
  ) => {
    const fuente = opciones.fuente ?? 'F1';
    const size = opciones.size ?? 9.3;
    const tono = opciones.color ?? COLOR_TEXTO;
    const x = (opciones.x ?? MARGEN) + (opciones.sangria ?? 0);
    const leading = opciones.leading ?? size * 1.38;
    const espaciado = opciones.espaciado ?? 0;
    const lineas = envolver(texto, size, ANCHO_UTIL - (opciones.sangria ?? 0));

    for (const item of lineas) {
      asegurarEspacio(leading);
      ops.push(
        `BT ${color(tono)} rg /${fuente} ${size} Tf ${espaciado} Tc 1 0 0 1 ${x.toFixed(2)} ${y.toFixed(
          2,
        )} Tm (${escapar(aWinAnsi(item))}) Tj ET`,
      );
      y -= leading;
    }
  };

  const vinculoIzquierdo = (texto: string, uri: string, x: number, size = 9) => {
    const ancho = anchoDeTexto(texto, size);
    ops.push(
      `BT ${color(COLOR_SUAVE)} rg /F1 ${size} Tf 0 Tc 1 0 0 1 ${x.toFixed(2)} ${y.toFixed(
        2,
      )} Tm (${escapar(aWinAnsi(texto))}) Tj ET`,
    );
    anotaciones.push({ x1: x, y1: y - 2, x2: x + ancho, y2: y + size, uri });
    return x + ancho;
  };

  const regla = (grosor = 1.2, tono = COLOR_ACENTO) => {
    ops.push(
      `q ${color(tono)} RG ${grosor} w ${MARGEN} ${y.toFixed(2)} m ${(ANCHO - MARGEN).toFixed(
        2,
      )} ${y.toFixed(2)} l S Q`,
    );
  };

  const seccion = (titulo: string) => {
    asegurarEspacio(46);
    y -= 12;
    regla(1.1);
    y -= 12;
    ops.push(
      `BT ${color(COLOR_ACENTO)} rg /F2 10.5 Tf 0.9 Tc 1 0 0 1 ${MARGEN} ${y.toFixed(
        2,
      )} Tm (${escapar(aWinAnsi(titulo.toUpperCase()))}) Tj ET`,
    );
    y -= 20;
  };

  const vineta = (texto: string) => {
    const size = 9.1;
    const leading = 12.4;
    const lineas = envolver(texto, size, ANCHO_UTIL - 14);
    lineas.forEach((item, indice) => {
      asegurarEspacio(leading);
      if (indice === 0) {
        ops.push(
          `BT ${color(COLOR_SUAVE)} rg /F1 ${size} Tf 0 Tc 1 0 0 1 ${MARGEN.toFixed(
            2,
          )} ${y.toFixed(2)} Tm (${escapar(aWinAnsi('•'))}) Tj ET`,
        );
      }
      ops.push(
        `BT ${color(COLOR_TEXTO)} rg /F1 ${size} Tf 0 Tc 1 0 0 1 ${(MARGEN + 14).toFixed(
          2,
        )} ${y.toFixed(2)} Tm (${escapar(aWinAnsi(item))}) Tj ET`,
      );
      y -= leading;
    });
  };

  const parrafo = (texto: string, opciones: Parameters<typeof linea>[1] = {}) => {
    linea(texto, { leading: 12.6, ...opciones });
  };

  const tituloConPeriodo = (titulo: string, periodo: string, size = 10.3) => {
    const anchoPeriodo = anchoDeTexto(periodo, 8.8);
    ops.push(
      `BT ${color(COLOR_TEXTO)} rg /F2 ${size} Tf 0 Tc 1 0 0 1 ${MARGEN.toFixed(2)} ${y.toFixed(
        2,
      )} Tm (${escapar(aWinAnsi(titulo))}) Tj ET`,
    );
    ops.push(
      `BT ${color(COLOR_SUAVE)} rg /F1 8.8 Tf 0 Tc 1 0 0 1 ${(ANCHO - MARGEN - anchoPeriodo).toFixed(
        2,
      )} ${y.toFixed(2)} Tm (${escapar(aWinAnsi(periodo))}) Tj ET`,
    );
    y -= 13.4;
  };

  // Encabezado
  ops.push(
    `BT ${color(COLOR_TEXTO)} rg /F2 22 Tf 0 Tc 1 0 0 1 ${MARGEN} ${y.toFixed(
      2,
    )} Tm (${escapar(aWinAnsi(AUTHOR.name))}) Tj ET`,
  );
  y -= 15;
  ops.push(
    `BT ${color(COLOR_ACENTO)} rg /F2 10.2 Tf 0 Tc 1 0 0 1 ${MARGEN} ${y.toFixed(
      2,
    )} Tm (${escapar(aWinAnsi(AUTHOR.role))}) Tj ET`,
  );
  y -= 15;

  const contacto: Array<[string, string | null]> = [
    [AUTHOR.email, `mailto:${AUTHOR.email}`],
    [AUTHOR.city, null],
    ['matiaslorenzo.fullware.com.ar', 'https://matiaslorenzo.fullware.com.ar'],
    ['github.com/melorenzo', 'https://github.com/melorenzo'],
    ['linkedin.com/in/matias-lorenzo33', 'https://www.linkedin.com/in/matias-lorenzo33'],
  ];

  let cursor = MARGEN;
  const anchoContacto = contacto.reduce(
    (total, [texto]) => total + anchoDeTexto(texto, 8.8) + 14,
    -14,
  );

  if (anchoContacto <= ANCHO_UTIL) {
    for (const [texto, uri] of contacto) {
      if (!uri) {
        const ancho = anchoDeTexto(texto, 8.8);
        ops.push(
          `BT ${color(COLOR_SUAVE)} rg /F1 8.8 Tf 0 Tc 1 0 0 1 ${cursor.toFixed(2)} ${y.toFixed(
            2,
          )} Tm (${escapar(aWinAnsi(texto))}) Tj ET`,
        );
        cursor += ancho;
      } else {
        cursor = vinculoIzquierdo(texto, uri, cursor, 8.8);
      }
      cursor += 14;
    }
    y -= 12;
  } else {
    for (const [texto, uri] of contacto) {
      if (!uri) {
        parrafo(texto, { size: 8.8, color: COLOR_SUAVE, leading: 11.5 });
      } else {
        const ancho = anchoDeTexto(texto, 8.8);
        ops.push(
          `BT ${color(COLOR_SUAVE)} rg /F1 8.8 Tf 0 Tc 1 0 0 1 ${MARGEN} ${y.toFixed(
            2,
          )} Tm (${escapar(aWinAnsi(texto))}) Tj ET`,
        );
        anotaciones.push({
          x1: MARGEN,
          y1: y - 2,
          x2: MARGEN + ancho,
          y2: y + 8.8,
          uri,
        });
        y -= 11.5;
      }
    }
  }

  y -= 6;
  regla(1.6);

  // Perfil
  seccion('Perfil');
  parrafo(
    'Más de 18 años en tecnología, desde soporte e infraestructura hasta automatización con IA y docencia en secundario, terciario y universidad. Un perfil híbrido: sistemas que hay que sostener, procesos que se pueden automatizar y personas que aprenden a usarlos.',
    { leading: 12.8 },
  );

  // Experiencia
  seccion('Experiencia');
  for (const item of experiencia) {
    asegurarEspacio(64);
    tituloConPeriodo(item.role, item.period);
    linea(item.org, { size: 9.2, color: COLOR_SUAVE, leading: 12.2 });
    parrafo(item.summary);
    for (const punto of item.highlights) vineta(punto);
    if (item.tags.length > 0) {
      linea(item.tags.join(' · '), {
        size: 8.6,
        color: COLOR_ACENTO,
        leading: 11.4,
      });
    }
    y -= 7;
  }

  // Formación
  seccion('Formación');
  for (const item of formacion) {
    asegurarEspacio(50);
    tituloConPeriodo(item.title, item.period, 9.8);
    linea(item.org, { size: 9, color: COLOR_SUAVE, leading: 12 });
    parrafo(item.detail, { color: COLOR_SUAVE, leading: 12.2 });
    y -= 5;
  }

  // Certificaciones
  seccion('Certificaciones');
  const certificacionesTexto = certificaciones
    .map((item) => `${item.title} — ${item.org} (${item.year})`)
    .join('   ·   ');
  parrafo(certificacionesTexto, { leading: 12.6 });

  // Stack
  seccion('Stack');
  for (const grupo of stack) {
    asegurarEspacio(30);
    linea(grupo.title, { fuente: 'F2', size: 9.4, color: COLOR_ACENTO, leading: 12 });
    parrafo(
      grupo.items.map((item) => item.name).join(' · '),
      { leading: 12.4 },
    );
    y -= 3;
  }

  nuevaPagina();

  // Pie de página
  const totalPaginas = paginas.length;
  paginas.forEach((pagina, indice) => {
    const opsPagina = pagina.ops;
    const yPie = MARGEN_INFERIOR - 14;
    opsPagina.push(
      `q 0.78 0.84 0.89 RG 0.7 w ${MARGEN} ${yPie + 12} m ${(ANCHO - MARGEN).toFixed(
        2,
      )} ${(yPie + 12).toFixed(2)} l S Q`,
    );
    opsPagina.push(
      `BT ${color(COLOR_SUAVE)} rg /F1 8 Tf 0 Tc 1 0 0 1 ${MARGEN} ${yPie.toFixed(
        2,
      )} Tm (${escapar(aWinAnsi('matiaslorenzo.fullware.com.ar'))}) Tj ET`,
    );
    const pie = `Página ${indice + 1} de ${totalPaginas}`;
    const anchoPie = anchoDeTexto(pie, 8);
    opsPagina.push(
      `BT ${color(COLOR_SUAVE)} rg /F1 8 Tf 0 Tc 1 0 0 1 ${(ANCHO - MARGEN - anchoPie).toFixed(
        2,
      )} ${yPie.toFixed(2)} Tm (${escapar(aWinAnsi(pie))}) Tj ET`,
    );
  });

  return ensamblarPdf(paginas);
}

function ensamblarPdf(paginas: Pagina[]): Uint8Array<ArrayBuffer> {
  const objetos: string[] = [];

  objetos.push('<< /Type /Catalog /Pages 2 0 R >>');
  objetos.push('');
  objetos.push('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>');
  objetos.push(
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>',
  );
  objetos.push(
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Oblique /Encoding /WinAnsiEncoding >>',
  );

  const refsPaginas: string[] = [];
  const indicesAnotaciones: number[] = [];

  for (const pagina of paginas) {
    const refsAnotaciones: string[] = [];
    for (let indice = 0; indice < pagina.anotaciones.length; indice += 1) {
      objetos.push('');
      indicesAnotaciones.push(objetos.length - 1);
      refsAnotaciones.push(`${objetos.length} 0 R`);
    }

    const numeroPagina = objetos.length + 1;
    const numeroContenido = objetos.length + 2;
    const contenido = pagina.ops.join('\n');

    objetos.push(
      `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${ANCHO} ${ALTO}] /Resources << /Font << /F1 3 0 R /F2 4 0 R /F3 5 0 R >> >> /Contents ${numeroContenido} 0 R${
        refsAnotaciones.length > 0 ? ` /Annots [${refsAnotaciones.join(' ')}]` : ''
      } >>`,
    );
    objetos.push(`<< /Length ${aBytes(contenido).length} >>\nstream\n${contenido}\nendstream`);

    refsPaginas.push(`${numeroPagina} 0 R`);
  }

  objetos[1] = `<< /Type /Pages /Kids [${refsPaginas.join(' ')}] /Count ${refsPaginas.length} >>`;

  const ahora = new Date();
  const fecha = `D:${ahora.toISOString().replace(/[-:]/g, '').slice(0, 15)}Z`;
  objetos.push(
    `<< /Title (${escapar(aWinAnsi(`CV - ${AUTHOR.name}`))}) /Author (${escapar(
      aWinAnsi(AUTHOR.name),
    )}) /Subject (${escapar(aWinAnsi(AUTHOR.role))}) /Creator (maty_web) /Producer (maty_web) /CreationDate (${fecha}) >>`,
  );

  let indice = 0;
  for (const pagina of paginas) {
    for (const anotacion of pagina.anotaciones) {
      const posicion = indicesAnotaciones[indice];
      objetos[posicion] = `<< /Type /Annot /Subtype /Link /Rect [${anotacion.x1.toFixed(
        2,
      )} ${anotacion.y1.toFixed(2)} ${anotacion.x2.toFixed(2)} ${anotacion.y2.toFixed(
        2,
      )}] /Border [0 0 0] /A << /Type /Action /S /URI /URI (${escapar(aWinAnsi(anotacion.uri))}) >> >>`;
      indice += 1;
    }
  }

  const partes: Uint8Array<ArrayBuffer>[] = [];
  let largo = 0;
  const agregar = (contenido: Uint8Array<ArrayBuffer>) => {
    partes.push(contenido);
    largo += contenido.length;
  };

  agregar(aBytes('%PDF-1.4\n'));
  agregar(new Uint8Array([0x25, 0xe2, 0xe3, 0xcf, 0xd3, 0x0a]));

  const offsets: number[] = [];

  for (const [posicion, objeto] of objetos.entries()) {
    offsets.push(largo);
    const bloque = aBytes(`${posicion + 1} 0 obj\n${objeto}\nendobj\n`);
    agregar(bloque);
  }

  const xref =
    `xref\n0 ${objetos.length + 1}\n0000000000 65535 f \n` +
    offsets.map((offset) => `${String(offset).padStart(10, '0')} 00000 n \n`).join('');

  const inicioXref = largo;
  agregar(aBytes(xref));
  agregar(
    aBytes(
      `trailer\n<< /Size ${objetos.length + 1} /Root 1 0 R /Info ${objetos.length} 0 R >>\nstartxref\n${inicioXref}\n%%EOF\n`,
    ),
  );

  const buffer = new ArrayBuffer(largo);
  const salida = new Uint8Array(buffer);
  let posicion = 0;
  for (const parte of partes) {
    salida.set(parte, posicion);
    posicion += parte.length;
  }
  return salida;
}
