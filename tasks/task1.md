# ETAPA 1 - Setup inicial do Next.js + Turso
**Commit 1**: Setup inicial do Next.js (App Router), Tailwind CSS, Lucide React e configuração do cliente Turso.

## O que foi implementado

### Estrutura do projeto Next.js
- ✅ Configuração do Next.js 14.2.15 com App Router (TypeScript)
- ✅ Tailwind CSS configurado (tailwind.config.ts, postcss.config.mjs)
- ✅ ESLint e TypeScript configurados
- ✅ Estrutura de pastas organizada:
  - `src/app/` - Páginas e layout (App Router)
  - `src/components/game/` - Componentes do jogo 3D (Canvas, personagens, níveis, UI, inimigos, power-ups, diálogos)
  - `src/components/ui/` - Componentes de UI reutilizáveis
  - `src/lib/` - Utilitários e configurações (Turso)
  - `src/store/` - Gerenciamento de estado (Zustand)
  - `src/data/` - Dados do jogo
  - `public/assets/` - Assets (áudio, modelos 3D, texturas)

### Dependências instaladas
- ✅ Next.js, React, TypeScript
- ✅ Tailwind CSS + PostCSS + Autoprefixer
- ✅ Three.js + @react-three/fiber (React Three Fiber) + @react-three/drei
- ✅ @react-three/rapier - Física 3D
- ✅ @libsql/client - Cliente Turso Database
- ✅ lucide-react - Ícones (em vez de emojis)
- ✅ zustand - Gerenciamento de estado global
- ✅ clsx + tailwind-merge - Utilitários para classes

### Componentes base do jogo
- ✅ `src/app/layout.tsx` - Layout principal com metadados
- ✅ `src/app/page.tsx` - Página inicial com GameCanvas (client-side)
- ✅ `src/app/globals.css` - Estilos globais com gradiente céu-terra
- ✅ `GameCanvas.tsx` - Canvas Three.js com Physics (Rapier), iluminação e HUD
- ✅ `CameraController.tsx` - Controlador de câmera base (preparado para Metal Slug zoom)
- ✅ `David.tsx` - Personagem principal 1 (Dávid) - modelo 3D, movimentação base, sistema de crouch
- ✅ `Yohann.tsx` - Personagem principal 2 (Yohann) - modelo 3D
- ✅ Plataformas: `CloudPlatform.tsx` (nuvens - Fase 1) e `GrassPlatform.tsx` (grama/terra)
- ✅ `NPC.tsx` - Inimigos com nomes, barra de vida e sistema de duelo
- ✅ `PowerUpBox.tsx` - Power-ups alternáveis (laser, super-speed, float, fire-ball, super-jump)
- ✅ `TextBoxTrigger.tsx` - Caixas de texto interativas para narrativa
- ✅ UI: `DialogBox.tsx`, `GameHUD.tsx`, `GameOverScreen.tsx`, `VictoryScreen.tsx`

### Integração com Turso Database
- ✅ `src/lib/turso.ts` - Cliente Turso configurado
- ✅ Schema: `game_progress` (progresso por jogador: nível, score, vidas, moedas, power-ups)
- ✅ Schema: `high_scores` (ranking de pontuações)
- ✅ Funções: `initializeDatabase()`, `saveProgress()`, `getProgress()`, `saveHighScore()`, `getHighScores()`
- ✅ `.env.example` - Variáveis de ambiente para Turso (TURSO_DATABASE_URL, TURSO_AUTH_TOKEN)

### Estado global
- ✅ `src/store/gameStore.ts` - Zustand store com score, vidas, nível, power-ups, estado de duelo, NPC atual

### Story & Objetivo
- ✅ História definida: Dávid e Yohann precisam resgatar a Laura das garras do Bowser Jr. para brincarem na pracinha
- ✅ Fase 1 (Nas Nuvens): Início nas nuvens com diálogos narrativos

## Arquivos criados/modificados
**Criados (36 arquivos):**
- `package.json`, `tsconfig.json`, `next.config.mjs`, `tailwind.config.ts`, `postcss.config.mjs`, `.env.example`
- `src/app/globals.css`, `src/app/layout.tsx`, `src/app/page.tsx`, `src/app/manifest.ts` (opcional)
- `src/components/game/GameCanvas.tsx`, `src/components/game/CameraController.tsx`
- `src/components/game/characters/David.tsx`, `src/components/game/characters/Yohann.tsx`
- `src/components/game/platforms/CloudPlatform.tsx`, `src/components/game/platforms/GrassPlatform.tsx`
- `src/components/game/levels/Level1.tsx`
- `src/components/game/enemies/NPC.tsx`
- `src/components/game/powerups/PowerUpBox.tsx`
- `src/components/game/dialogs/TextBoxTrigger.tsx`
- `src/components/game/ui/DialogBox.tsx`, `src/components/game/ui/GameHUD.tsx`, `src/components/game/ui/GameOverScreen.tsx`, `src/components/game/ui/VictoryScreen.tsx`
- `src/lib/turso.ts`, `src/store/gameStore.ts`, `src/lib/utils.ts`
- Diretórios: `src/components/game/{characters,platforms,levels,enemies,powerups,dialogs,ui}`, `public/assets/{audio,models,textures}`

## Comandos Git (ETAPA 1)
```bash
git add .
git commit -m "feat: ETAPA 1 - Setup Next.js + Tailwind + R3F + Rapier + Turso + estrutura base do jogo (Dávid, Yohann, Laura, Fase 1)"
git push origin main
```

**Status:** ETAPA 1 CONCLUÍDA ✓  
**Próxima etapa:** ETAPA 2 - Canvas principal e sistema de física base (movimentação, colisões, gravidade)
