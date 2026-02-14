Original prompt: Eu quero que este projeto seja uma aplicacao para mobile e web. Renderiza, melhroa e optimiza para melhor experiencia mobile.

## 2026-02-12
- Objetivo: melhorar UX mobile e preparar como PWA (instalável) sem quebrar a experiência web.
- Layout: criei `appShell/appMain` (flex) para evitar scroll extra do TopBar + `100vh` nas páginas.
- Mobile UX: padding responsivo via `--page-pad`, safe-area bottom, hover só em dispositivos com hover, e touch-action nos botões/área do jogo.
- PWA: adicionei `public/manifest.webmanifest`, `public/sw.js` e `public/icon.svg` + registro do service worker em `src/main.jsx` (somente em produção).
- Test/automação: `Game` agora expõe `window.render_game_to_text` + inclui um `canvas` transparente (âncora para screenshots/cliques no client do Playwright).
- Test/automação: modo determinístico via `?e2e=1` (spawna 1 coração fixo no centro para cliques repetíveis).
- Playwright: rodei o client em `http://127.0.0.1:5173/game?e2e=1` com `scripts/playwright-actions-e2e.json` e gerou `output/web-game/shot-0.png` + `output/web-game/state-0.json` (status `won`, score `3`).
- Qualidade: `npm run lint` passa (ajuste pontual no `ContentContext` + `render_game_to_text` sem mutar refs no render).
- PWA: gerei ícones PNG (`public/icons/*`) a partir do `public/icon.svg` para compatibilidade melhor em Android/iOS.
- Android: adicionei Capacitor (`capacitor.config.json`) + platform `android/` e scripts (`npm run android`, `npm run cap:sync`).
- Galeria mobile: modal com swipe (esq/dir), ESC/←/→ no teclado, e scroll-lock enquanto o modal está aberto.
- Fotos reais: movidas para `private-photos/` (gitignored) para não irem para o GitHub/deploy.
- Galeria: em DEMO usa placeholders em `public/demo-photos/01.svg` … `09.svg`; em produção (privado) usa `/api/photo?id=...`; em DEV pode usar `/__local_photos__/{n}.jpg`.
- Login (web dev): se `/api/login` / `/api/private` derem 404 em `npm run dev`, faz fallback local para desbloquear as fotos (útil para testar sem backend).
- Login (prod): backend aceita `PRIVATE_USERNAME`/`PRIVATE_PASSWORD` (env no host) e cria sessão por cookie httpOnly.
- Android (backend): adicionei `capacitor.config.ts` com `CAPACITOR_SERVER_URL` para a app carregar o mesmo deploy/`/api/*`.
- Android (anti‑cópia): FLAG_SECURE em release + watermark no modal da Galeria (não é 100%).
- Conteúdo real (texto): `private-content.json` (gitignored) com timeline + quiz privados; em DEV é servido por Vite em `/__local_private_content__/content.json`.
- Tema: atualizei a paleta para tons “fofos” com Matcha (`--matcha`) + Sofia (`--sofia` = `#FFB6B9`) e apliquei gradientes em background/cards/botões.

## 2026-02-14
- Connections (privado): alterei o grupo roxo (deixou de ser “Viagens” com Porto/Apúlia) para “Primeiro date” com `METRO, SUPERBOCK, DOLIVA, PRAIA` em `private-content.json`.
- Strands: puzzle agora é “fechado” — todas as letras do tabuleiro pertencem a palavras (sem letras aleatórias) e nenhuma célula pode ser usada em mais do que uma palavra.
- Strands: adicionei `spangram` (palavra amarela) e destaque amarelo (`strandCell--spangram`); privado usa `spangram: "primeirodate"`.
- Strands: o número de colunas do tabuleiro ajusta automaticamente para caber exatamente no total de letras (ex.: privado fica 7x9 porque são 63 letras).
- Strands (privado): ajustei `theme`/`hint` para "Primeiro date" para bater com o spangram `primeirodate`.
