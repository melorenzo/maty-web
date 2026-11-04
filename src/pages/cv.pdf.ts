import type { APIRoute } from 'astro';
import { buildCvPdf } from '../lib/cv-pdf';

export const prerender = true;

export const GET: APIRoute = () =>
  new Response(buildCvPdf(), {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'inline; filename="CV-Matias-Lorenzo.pdf"',
      'Cache-Control': 'public, max-age=3600',
    },
  });
