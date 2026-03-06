# LoveCard (HeartGame)

Aplicação React + Vite com um “cartão” interativo e um mini‑jogo de apanhar corações.

Feita para **web e mobile**, com layout responsivo.

## Demo vs Privado (proteção de fotos/dados)

- **DEMO**: conteúdo público + placeholders (`public/demo-photos/*`).
- **PRIVADO**: conteúdo real vem do **backend** (`/api/*`) após login.

Importante:
- As fotos reais estão protegidas com login, sendo que o objetivo é impedir **acesso público** sem credenciais.

### Backend (Vercel Functions) + Fotos protegidas

As rotas em `api/*` exigem sessão (cookie httpOnly) e servem:
- `/api/private` - devolve o conteúdo privado (`PRIVATE_CONTENT_URL` ou `PRIVATE_CONTENT_JSON`)
- `/api/photo?id=...` - devolve fotos via proxy (`PRIVATE_PHOTO_MAP_URL` ou `PRIVATE_PHOTO_MAP_JSON`)

Para configurares:
1. Define env vars no host (ex.: Vercel): `AUTH_SECRET`, `PRIVATE_USERNAME`, `PRIVATE_PASSWORD`
2. (Recomendado) Faz upload do conteúdo privado para o Blob e copia o URL:
   ```bash
   node scripts/upload-private-content.mjs
   ```
   Depois define `PRIVATE_CONTENT_URL` no host.
3. Faz upload das fotos para o Blob e gera o mapa:
   ```bash
   node scripts/upload-private-photos.mjs
   ```
   O script imprime `PRIVATE_PHOTO_MAP_URL` (recomendado) e também `PRIVATE_PHOTO_MAP_JSON` (fallback).

Nota: `PRIVATE_CONTENT_JSON` e `PRIVATE_PHOTO_MAP_JSON` podem não caber em env vars (limite das Functions). Usa `*_URL` quando possível.

## Rodar localmente

```bash
npm install
npm run dev
```

## Testar no telemóvel (mesma rede)

```bash
npm run dev -- --host
```

O Vite mostra um URL `http://<ip-da-maquina>:5173/` - link no telemóvel.

## Build / Preview (produção)

```bash
npm run build
npm run preview
```

## PWA (instalar como app)

Em **produção** (build/preview/deploy), no browser mobile escolhe “Add to Home Screen / Adicionar ao ecrã principal”. - IOS

## Android (Capacitor)

Pré‑requisitos: Android Studio + Android SDK.

### Usar o mesmo backend (privado) no Android

Para o login/fotos privadas funcionarem no Android com o **mesmo backend** é necessário definir o URL do deploy:

```powershell
$env:CAPACITOR_SERVER_URL="https://<teu-deploy>.vercel.app"
npm run cap:sync
npx cap open android
```

Sem `CAPACITOR_SERVER_URL`, a app abre em DEMO (assets locais) e o backend `/api/*` não existe.

Nota: em builds **release**, o Android bloqueia screenshots/recents (FLAG_SECURE) como medida “anti‑cópia” (não é 100% certo).

### Abrir o projeto Android

```bash
npm install
npm run android
```

O comando faz `build`, sincroniza os assets e abre o projeto Android em Android Studio.
