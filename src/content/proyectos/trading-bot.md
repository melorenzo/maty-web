---
title: Trading Bot
summary: Sistema automatizado que procesa datos de mercado y aplica estrategias con gestión de riesgo, en cuenta demo de Binance.
status: testing
year: 2026
featured: false
order: 4
stack: ["Python", "Binance API", "Estrategias", "Backtesting"]
tags: ["Finanzas", "Automatización", "Datos"]
problem: Verificar una estrategia de trading en dinero real es arriesgado. La primera pregunta siempre es si funciona fuera de la teoría.
approach:
  - 'La estrategia corre en una cuenta demo de Binance: sin riesgo y con datos reales de mercado.'
  - 'El backtesting permite descartar ideas antes de conectarlas al mercado.'
  - 'La gestión de riesgo (tamaño de posición, stop y límites diarios) es parte del sistema, no un extra.'
learnings:
  - 'La mayoría de las estrategias que sobreviven al backtest no sobreviven al spread y al slippage.'
  - 'El logging de cada decisión es tan importante como la estrategia misma.'
---

## Qué es

Un bot que escucha el mercado, decide con una estrategia explícita y **se limita el riesgo por
construcción**. Sigue en etapa de pruebas sobre una cuenta demo.
