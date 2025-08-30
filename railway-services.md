# 🚂 Configuration Railway - 2 Services

## Service 1 : API (Backend)
- **Root Directory**: `/packages/ttt-api`
- **Build Command**: `npm run build`
- **Start Command**: `node build/bin/server.js`
- **Variables**:
  - `APP_KEY=ton_app_key`
  - `JWT_SECRET=ton_jwt_secret`
  - `NODE_ENV=production`

## Service 2 : Frontend (Static Site)
- **Root Directory**: `/packages/ttt-web`
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Variables**:
  - `VITE_API_URL=https://ton-api.railway.app/api`

## Ou Service unique avec Dockerfile root
- Utilise le Dockerfile à la racine
- Build API seulement
- Frontend déployé séparément sur Netlify/Vercel
