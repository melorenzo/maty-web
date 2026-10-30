import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const proyectos = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/proyectos' }),
  schema: z.object({
    title: z.string(),
    summary: z.string(),
    status: z.enum(['running', 'building', 'testing', 'archived']),
    year: z.number(),
    featured: z.boolean().default(false),
    order: z.number().default(0),
    stack: z.array(z.string()).default([]),
    tags: z.array(z.string()).default([]),
    repo: z.url().optional(),
    demo: z.url().optional(),
    problem: z.string().optional(),
    approach: z.array(z.string()).default([]),
    learnings: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
  }),
});

const materiales = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/materiales' }),
  schema: z.object({
    title: z.string(),
    summary: z.string(),
    type: z.enum(['guia', 'consigna', 'repo', 'video', 'plantilla']),
    area: z.string(),
    level: z.enum(['inicial', 'intermedio', 'avanzado']),
    language: z.string().default('es'),
    repo: z.url().optional(),
    order: z.number().default(0),
    draft: z.boolean().default(false),
  }),
});

const charlas = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/charlas' }),
  schema: z.object({
    title: z.string(),
    summary: z.string(),
    event: z.string(),
    date: z.string(),
    audience: z.string(),
    order: z.number().default(0),
    draft: z.boolean().default(false),
  }),
});

export const collections = { proyectos, materiales, charlas };
