#!/usr/bin/env bash
# Empaqueta el repo en un tar.gz para llevar a un server y deployar con Docker.
# Usa `git archive`, así que lo que viaja es exactamente lo commiteado.

set -euo pipefail

RAIZ="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$RAIZ"

FECHA="$(date +%Y%m%d)"
DESTINO="dist-deploy"
NOMBRE="maty-web-${FECHA}.tar.gz"

if ! git diff --quiet || ! git diff --cached --quiet || [ -n "$(git ls-files --others --exclude-standard)" ]; then
  echo "Aviso: hay cambios sin commitear; el paquete sale con el último commit."
fi

mkdir -p "$DESTINO"
# El prefijo deja todo dentro de una carpeta maty-web/ al descomprimir.
git archive --format=tar.gz --prefix=maty-web/ --output="${DESTINO}/${NOMBRE}" HEAD

echo "Paquete: ${DESTINO}/${NOMBRE}"
echo "En el server: tar -xzf ${NOMBRE} && cd maty-web && docker compose up -d --build"
