#!/usr/bin/env bash

set -e

# Diretório raiz da extensão (por padrão, o diretório atual)
ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"

# Arquivo manifest
MANIFEST="$ROOT_DIR/manifest.json"

if [ ! -f "$MANIFEST" ]; then
  echo "Erro: manifest.json não encontrado em $ROOT_DIR"
  exit 1
fi

# Extrair versão do manifest.json (assumindo que tem a chave "version": "x.y.z")
VERSION=$(grep -o '"version"[[:space:]]*:[[:space:]]*"[^"]*"' "$MANIFEST" | sed 's/.*"version"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/')

if [ -z "$VERSION" ]; then
  echo "Erro: não foi possível extrair a versão do manifest.json"
  exit 1
fi

# Nome do arquivo final
DIST_DIR="$ROOT_DIR/dist"
ZIP_NAME="auto-cupons-$VERSION.zip"
ZIP_PATH="$DIST_DIR/$ZIP_NAME"

# Limpar/criar dist
mkdir -p "$DIST_DIR"

# Diretório temporário
TMP_DIR="$(mktemp -d)"

echo "Gerando pacote da extensão versão $VERSION..."
echo "Diretório temporário: $TMP_DIR"

# Lista de arquivos/pastas que devem ir pro zip
# Ajuste aqui se adicionar novos arquivos importantes
FILES_TO_COPY=(
  "manifest.json"
  "background.js"
  "content.js"
  "popup.html"
  "popup.js"
  "icon.png"
)

# Copiar arquivos
for ITEM in "${FILES_TO_COPY[@]}"; do
  if [ -e "$ROOT_DIR/$ITEM" ]; then
    # Criar diretório se necessário
    mkdir -p "$TMP_DIR/$(dirname "$ITEM")"
    cp -R "$ROOT_DIR/$ITEM" "$TMP_DIR/$ITEM"
  else
    echo "Aviso: '$ITEM' não existe, ignorando."
  fi
done

# Criar o zip (sem incluir a pasta temporária em si)
cd "$TMP_DIR"
zip -r "$ZIP_PATH" ./* >/dev/null

# Voltar pro diretório original
cd "$ROOT_DIR"

# Remover diretório temporário
rm -rf "$TMP_DIR"

echo "===================================="
echo "Pacote gerado com sucesso:"
echo "$ZIP_PATH"
echo "===================================="
