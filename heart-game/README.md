# LoveCard (HeartGame)

Aplicação React + Vite com um “cartão” interativo e um mini‑jogo de apanhar corações.

Feita para **web e mobile**, com layout responsivo, safe-area (notch/home indicator) e PWA instalável.

## Demo vs Privado (proteção de fotos/dados)

- **DEMO**: conteúdo público + placeholders (`public/demo-photos/*`).
- **PRIVADO**: conteúdo real vem do **backend** (`/api/*`) após login.

Importante:
- Se as fotos reais estiverem no repositório (ou em `public/`), **não há como proteger** — qualquer pessoa consegue aceder.
- Mesmo com login, **não existe “impossível de copiar”**: quem tiver acesso ao modo privado pode sempre guardar/screenshot das fotos. O objetivo aqui é impedir **acesso público** sem credenciais.

### Não commitar fotos reais

- Coloca as fotos reais em `private-photos/` (esta pasta é ignorada pelo git).
- Para DEV, o Vite serve essas fotos apenas localmente em `/__local_photos__/`.
- Coloca o conteúdo real (timeline/quiz/etc) em `private-content.json` (também ignorado pelo git). Em DEV é servido em `/__local_private_content__/content.json`.

### Backend (Vercel Functions) + Fotos protegidas

As rotas em `api/*` exigem sessão (cookie httpOnly) e servem:
- `/api/private` — devolve o conteúdo privado (`PRIVATE_CONTENT_JSON`)
- `/api/photo?id=...` — devolve fotos via proxy (`PRIVATE_PHOTO_MAP_JSON`)

Para configurares:
1. Define env vars no host (ex.: Vercel): `AUTH_SECRET`, `PRIVATE_USERNAME`, `PRIVATE_PASSWORD`, `PRIVATE_CONTENT_JSON`, `PRIVATE_PHOTO_MAP_JSON`
2. Gera o JSON do conteúdo privado (a partir de `private-content.json`):
   ```bash
   node scripts/print-private-content.mjs
   ```
3. Faz upload das fotos para o Blob e gera o mapa:
   ```bash
   node scripts/upload-private-photos.mjs
   ```
   O script imprime o JSON para copiares para as env vars.

## Rodar localmente

```bash
npm install
npm run dev
```

## Testar no telemóvel (mesma rede)

```bash
npm run dev -- --host
```

O Vite vai mostrar um URL `http://<ip-da-maquina>:5173/` — abre esse link no telemóvel.

## Build / Preview (produção)

```bash
npm run build
npm run preview
```

## PWA (instalar como app)

Em **produção** (build/preview/deploy), no browser mobile escolhe “Add to Home Screen / Adicionar ao ecrã principal”.

## Android (Capacitor)

Pré‑requisitos: Android Studio + Android SDK.

### Usar o mesmo backend (privado) no Android

Para o login/fotos privadas funcionarem no Android com o **mesmo backend** (ex.: Vercel), define o URL do deploy:

```powershell
$env:CAPACITOR_SERVER_URL="https://<teu-deploy>.vercel.app"
npm run cap:sync
npx cap open android
```

Sem `CAPACITOR_SERVER_URL`, a app abre em DEMO (assets locais) e o backend `/api/*` não existe.

Nota: em builds **release**, o Android bloqueia screenshots/recents (FLAG_SECURE) como medida “anti‑cópia” (não é 100%).

### Abrir o projeto Android

```bash
npm install
npm run android
```

O comando faz `build`, sincroniza os assets e abre o projeto Android em Android Studio.
