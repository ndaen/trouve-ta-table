#!/bin/bash

echo "🔒 Configuration du firewall pour le VPS"

# Réinitialiser UFW
sudo ufw --force reset

# Politique par défaut
sudo ufw default deny incoming
sudo ufw default allow outgoing

# Autoriser SSH (port 22)
sudo ufw allow 22/tcp comment 'SSH'

# Autoriser HTTP (port 80) - Frontend
sudo ufw allow 80/tcp comment 'Frontend HTTP'

# Autoriser port 3333 - API
sudo ufw allow 3333/tcp comment 'API'

# Autoriser HTTPS si besoin plus tard
sudo ufw allow 443/tcp comment 'HTTPS'

# Activer le firewall
sudo ufw --force enable

# Afficher le statut
sudo ufw status numbered

echo "✅ Firewall configuré !"
echo "Ports ouverts:"
echo "  - 22 (SSH)"
echo "  - 80 (Frontend)"
echo "  - 3333 (API)"
echo "  - 443 (HTTPS - pour plus tard)"
