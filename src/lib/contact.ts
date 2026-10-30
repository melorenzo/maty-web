import { z } from 'astro/zod';

export const contactReasons = [
  'asesoria',
  'diseno-web',
  'automatizacion',
  'docencia',
  'charla',
  'otro',
] as const;

export type ContactReason = (typeof contactReasons)[number];

export const contactReasonLabels: Record<ContactReason, string> = {
  asesoria: 'Asesoría técnica',
  'diseno-web': 'Diseño web',
  automatizacion: 'Automatización',
  docencia: 'Docencia o capacitación',
  charla: 'Charla o taller',
  otro: 'Otro motivo',
};

export const contactSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'El nombre es demasiado corto')
    .max(80, 'El nombre es demasiado largo'),
  email: z.email('El email no parece válido'),
  reason: z.enum(contactReasons, { message: 'Elegí un motivo' }),
  message: z
    .string()
    .trim()
    .min(10, 'Contame un poco más: mínimo 10 caracteres')
    .max(2000, 'El mensaje es demasiado largo'),
  website: z.string().max(200).optional().default(''),
  code: z.string().trim().max(32).optional().default(''),
  turnstileToken: z.string().max(2048).optional().default(''),
});

export type ContactPayload = z.infer<typeof contactSchema>;
