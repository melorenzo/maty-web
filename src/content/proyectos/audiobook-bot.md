---
title: Audiobook Bot
summary: Bot de Telegram que transforma documentos PDF en audiolibros, con una PWA para ordenar y escuchar los fragmentos con cola continua y descarga offline.
status: running
year: 2026
featured: false
order: 5
stack: ["Python", "Telegram Bot API", "TTS", "PWA"]
tags: ["IA", "Producto", "Bot", "Accesibilidad"]
problem: 'Convertir un libro a audio es un proceso largo: hay que extraer el texto, dividirlo, sintetizarlo y después poder escucharlo en el viaje en el colectivo.'
approach:
  - 'El bot recibe el PDF, extrae el texto y lo divide en fragmentos manejables.'
  - 'La síntesis de voz genera el audio de cada fragmento.'
  - 'Una PWA instalable ordena la biblioteca, reproduce en cola continua, recuerda la posición y permite descargar para escuchar offline.'
learnings:
  - 'Fragmentar bien el texto es la mitad del trabajo: un capítulo por archivo hace la biblioteca usable.'
  - 'Una PWA instalable evita depender de la app store para una herramienta simple.'
---

## Qué es

Del PDF al audio y del audio a una biblioteca que se puede escuchar en el colectivo, sin conexión y
sin instalar nada pesado.
