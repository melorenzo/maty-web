---
title: Financial AI Advisor
summary: Plataforma financiera con arquitectura multiagente que analiza información, evalúa riesgos y consolida resultados.
status: running
year: 2026
featured: true
order: 3
stack: ["Python", "LLMs", "Agentes", "APIs"]
tags: ["IA", "Finanzas", "Agentes"]
problem: Un análisis financiero exige leer mucho, contrastar fuentes y sostener un criterio. Hacerlo a mano, todos los días, no escala.
approach:
  - 'Cada agente tiene una tarea acotada: leer, contrastar, evaluar riesgo, consolidar.'
  - 'Los resultados intermedios quedan explícitos, así que se puede auditar de dónde salió cada conclusión.'
  - 'La consolidación final produce un informe, no una respuesta suelta.'
learnings:
  - 'Un agente por tarea con entradas y salidas explícitas es más confiable que un agente que hace todo.'
  - 'La trazabilidad de las fuentes importa tanto como la respuesta.'
---

## Qué es

Un asesor financiero construido como sistema de agentes: cada uno hace una parte del análisis y el
sistema consolida. Todo el flujo es reproducible y auditable.
