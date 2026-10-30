---
title: Zorwis — AnimalOS
summary: 'Identidad digital para figuras físicas impresas en 3D: escaneás un QR, registrás la figura y recibís una mascota virtual que vive en la nube.'
status: building
year: 2026
featured: true
order: 2
stack: ["NestJS", "Prisma", "PostgreSQL", "Next.js", "React Native", "Expo"]
tags: ["Producto", "Web", "App", "Monorepo"]
problem: Una figura impresa en 3D es un objeto físico que se pierde, se roba o se duplica. Queríamos que cada figura tenga una identidad digital única que no se pueda clonar.
approach:
  - 'La figura es la llave física: el QR apunta a una identidad que ya existe en el servidor.'
  - 'Toda la lógica vive en el backend para evitar fraude y duplicados.'
  - 'Monorepo con pnpm workspaces y Turborepo: API, web, app y paquetes compartidos.'
  - 'La app móvil escanea el QR, reclama la figura y muestra la mascota que crece en la nube.'
learnings:
  - 'Crear la identidad digital antes de imprimir el físico evitó tarjetas huérfanas.'
  - 'Separar API, cliente y backoffice en el mismo monorepo agiliza los cambios de contrato.'
---

## Qué es

Zorwis vincula figuras físicas impresas en 3D con una identidad digital única. La decisión más
importante es que **la figura es solo la llave**: la mascota vive en el servidor.

## Variante Dino-Zorwis

La misma arquitectura aplicada a dinosaurios coleccionables, con su propio backoffice y su flujo de
reclamación.
