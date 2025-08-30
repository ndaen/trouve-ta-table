#!/bin/bash

echo "🔒 Configuration HTTPS avec certificat auto-signé"
echo "==============================================="

mkdir -p ssl

echo "🔑 Génération de la clé privée..."
openssl genrsa -out ssl/private.key 2048

echo "📜 Génération du certificat..."
openssl req -new -x509 -key ssl/private.key -out ssl/certificate.crt -days 365 -subj "/C=FR/ST=Paris/L=Paris/O=TrouveTaTable/CN=31.97.155.246"

echo "📝 Configuration Nginx SSL..."
cat > packages/ttt-web/nginx.conf << 'EOF'
user nginx;
worker_processes auto;
error_log /var/log/nginx/error.log notice;
pid /var/run/nginx.pid;

events {
    worker_connections 1024;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    # Redirection HTTP vers HTTPS
    server {
        listen 80;
        server_name _;
        return 301 https://$host$request_uri;
    }

    # Configuration HTTPS
    server {
        listen 443 ssl http2;
        server_name _;

        ssl_certificate /etc/ssl/certificate.crt;
        ssl_certificate_key /etc/ssl/private.key;

        ssl_protocols TLSv1.2 TLSv1.3;
        ssl_ciphers ECDHE-RSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-GCM-SHA384;
        ssl_prefer_server_ciphers off;

        root /usr/share/nginx/html;
        index index.html;

        location / {
            try_files $uri $uri/ /index.html;
        }

        location /api {
            proxy_pass http://api:3333;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }
    }
}
EOF

echo "💾 Sauvegarde de docker-compose.yml..."
cp docker-compose.yml docker-compose.yml.backup

echo "🐳 Mise à jour docker-compose..."
echo ""
echo "⚠️  ATTENTION : Tu dois manuellement ajouter ces lignes au service 'web' :"
echo "     ports:"
echo "       - \"80:80\""
echo "       - \"443:443\""
echo "     volumes:"
echo "       - ./ssl:/etc/ssl:ro"
echo ""

echo "✅ Certificat auto-signé configuré !"
echo "⚠️ Attention : Les navigateurs afficheront un avertissement de sécurité"
echo "🌐 Accès: https://31.97.155.246 (accepter l'avertissement)"
echo ""
echo "📝 Mets à jour tes variables :"
echo "   FRONTEND_URL=https://31.97.155.246"
echo "   VITE_API_URL=https://31.97.155.246/api"