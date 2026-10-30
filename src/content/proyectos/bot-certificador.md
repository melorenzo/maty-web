---
title: Bot Certificador
summary: Automatiza la certificación mensual de publicidad web del Sistema de Procesamiento de Órdenes Publicitarias del GCBA.
status: running
year: 2026
featured: false
order: 6
stack: ["Python", "Gmail API", "Scraping", "Screenshots"]
tags: ["Automatización", "Scraping", "Procesos"]
problem: Todos los meses hay que tomar el último mail oficial, leer un código y subir la certificación de un sitio. Es un trámite manual, repetitivo y con fecha de vencimiento.
approach:
  - 'Un planificador corre el último día del mes a las 9:00 y busca el mail oficial unread.'
  - 'Se extraen el número IF y la fecha del asunto, sin intervención humana.'
  - 'El bot toma la captura de pantalla del sitio y arma el expediente de certificación.'
learnings:
  - 'Los trámites con fecha y un único mail de origen son automatizables de punta a punta.'
  - 'Las capturas automáticas sirven de evidencia del estado del sitio ese día.'
---

## Qué es

Un proceso administrativo real, repetido todos los meses, ejecutado por código y documentado para
que cualquiera pueda auditarlo.
