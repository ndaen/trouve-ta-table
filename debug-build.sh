#!/bin/bash

echo "🔍 Debug du problème de build"
echo "============================="

# Vérifier la structure des fichiers
echo "📁 Structure du projet:"
ls -la
echo ""

echo "📁 Structure packages:"
ls -la packages/
echo ""

echo "📁 Structure ttt-web:"
ls -la packages/ttt-web/
echo ""

# Vérifier package.json
echo "📄 Root package.json:"
cat package.json
echo ""

echo "📄 Web package.json:"
cat packages/ttt-web/package.json
echo ""

# Tester le build local
echo "🧪 Test build local du frontend:"
cd packages/ttt-web
echo "📍 Dans: $(pwd)"

# Installer les dépendances si nécessaire
if [ ! -d "node_modules" ]; then
    echo "📦 Installation des dépendances web..."
    npm install
fi

# Variables d'environnement pour le build
export VITE_API_URL=http://31.97.155.246:3333/api

echo "🏗️ Tentative de build..."
npm run build

# Vérifier le résultat
if [ $? -eq 0 ]; then
    echo "✅ Build local réussi !"
    echo "📁 Contenu du dossier dist:"
    ls -la dist/
else
    echo "❌ Build local échoué"
    echo "📋 Logs d'erreur ci-dessus"
fi