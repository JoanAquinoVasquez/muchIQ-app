#!/bin/bash

# ============================================================
# deploy-web.sh — MuchIQ Web Deploy a Vercel
# Uso: bash deploy-web.sh
# ============================================================

set -e  # Detener si cualquier comando falla

echo "🚀 Iniciando build y deploy de MuchIQ Web..."

# 1. Compilar el bundle web
echo ""
echo "📦 Compilando para web con Expo..."
npx expo export --platform web

# 2. Forzar que dist/.vercel/project.json apunte a muchiq-mobile
echo ""
echo "🔧 Asegurando configuración correcta de Vercel (proyecto: muchiq-mobile)..."
mkdir -p dist/.vercel
echo '{"projectId":"prj_DDsWYDN6noiKrREUmPkLl8UEASJG","orgId":"team_iOkSmc9Acq0CytfQFZ7asmGv","projectName":"muchiq-mobile"}' > dist/.vercel/project.json

# 3. Desplegar a producción
echo ""
echo "🌐 Desplegando en Vercel → muchiq-mobile.vercel.app ..."
npx vercel deploy dist --prod --yes

echo ""
echo "✅ ¡Deploy completado! App disponible en:"
echo "   https://muchiq-mobile.vercel.app"
