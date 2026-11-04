export const SITE_URL = (
  import.meta.env.PUBLIC_SITE_URL ??
  import.meta.env.SITE_URL ??
  'https://matiaslorenzo.fullware.com.ar'
).replace(/\/$/, '');

export const SITE_NAME = 'Maty';

export const SITE_TITLE = 'Matías Lorenzo — docente de tecnología, developer y software libre';

export const SITE_DESCRIPTION =
  'Docente de tecnología y analista de sistemas en Buenos Aires. Construyo software, enseño a pensar con tecnología y trabajo con herramientas libres.';

export const SITE_LOCALE = 'es_AR';

export const AUTHOR = {
  name: 'Matías Lorenzo',
  email: 'melorenzo@fullware.com.ar',
  secondaryEmail: 'melorenzo@ymail.com',
  city: 'Buenos Aires, Argentina',
  role: 'Docente de Tecnología · Analista de Sistemas',
} as const;
