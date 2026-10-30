---
title: NotiBot
summary: Plataforma de automatización periodística con agentes especializados, procesamiento de noticias y publicación multicanal.
status: running
year: 2026
featured: true
order: 1
stack: ["Python", "FastAPI", "PostgreSQL", "APScheduler", "Cloudinary", "Docker"]
tags: ["IA", "Automatización", "Datos", "Medios"]
problem: Un equipo editorial pierde horas rastreando noticias, limpiando notas y copiandolas a cada canal, con el riesgo de que cada copia termine contando algo distinto.
approach:
  - 'Un data lake con PostgreSQL normaliza cada noticia una sola vez y la sirve por API REST.'
  - 'Agentes especializados se encargan de detectar, resumir y clasificar cada nota.'
  - 'APScheduler dispara la recolección de forma autónoma y Cloudinary guarda el material multimedia.'
  - 'La publicación multicanal consume esa misma fuente, así que todos los medios cuentan lo mismo.'
learnings:
  - 'Normalizar una vez y distribuir después evitó tres implementaciones distintas del mismo scraping.'
  - 'Los agentes rinden mucho mejor con una fuente de datos limpia que con un prompt mejor.'
---

## Qué es

NotiBot es la parte de automatización de [Fullware](https://blog.fullware.com.ar): un servicio que
reúne la información, la procesa y la publica en varios canales sin intervención manual.

## Estado

`running` — el servicio de scraping expone su API y la base de datos se actualiza de forma autónoma.
