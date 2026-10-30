---
title: Hierro & Cruz
summary: Tienda online premium de escritorios artesanales, con monorepo de microservicios, frontend Astro SSR y pagos con Mercado Pago.
status: running
year: 2025
featured: false
order: 7
stack: ["Astro", "TypeScript", "Express", "NestJS", "PostgreSQL", "Prisma", "Mercado Pago", "Docker"]
tags: ["E-commerce", "Producto", "Microservicios"]
problem: Una marca de producto artesanal necesita vender online sin perder la identidad y sin convertir cada pedido en una tarea manual.
approach:
  - 'Monorepo con once microservicios y frontend Astro SSR sobre PostgreSQL.'
  - 'Mercado Pago para cobrar y Mercado Libre para publicar el catálogo.'
  - 'El stock y los pedidos viven en la base de datos: lo que se ve en la tienda es lo que hay.'
  - 'Docker para que el entorno local y el de producción sean el mismo.'
learnings:
  - 'El precio nunca se confía en el cliente: se calcula en el servidor.'
  - 'Un monorepo con límites claros evita que un cambio rompa tres cosas.'
---

## Qué es

El proyecto comercial más grande del portfolio: una tienda completa, con catálogo, personalization,
pagos y despliegue containerizado.
