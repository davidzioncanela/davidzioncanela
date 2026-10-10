# ETAPA 5 - NPCs nomes aleatórios + barra de vida + duelo por proximidade
**Commit 5:** Sistema de NPCs com nomes gerados aleatoriamente, detecção de proximidade, ativação de duelo estilo Metal Slug, HUD de duelo e barra de vida.

## Implementado
- npcNames.ts - gerador aleatório de nomes
- NPC aprimorado: detecção proximidade (5m), ativa duelo, passa nome/vida p/ store
- DuelHUD - mostra nome NPC + barra vida durante duelo
- GameCanvas integra DuelHUD
- Level1 passa playerPosition para NPC

## Arquivos
- src/lib/npcNames.ts (novo)
- src/components/game/ui/DuelHUD.tsx (novo)
- src/components/game/enemies/NPC.tsx (mod)
- src/components/game/GameCanvas.tsx (mod)
- src/components/game/levels/Level1.tsx (mod)
- tasks/task5.md, reports/ETAPA5.md

## Comandos Git
```bash
git add .
git commit -m "feat: ETAPA 5 - NPCs nomes aleatórios, proximidade p/ duelo, HUD de duelo + barra vida"
git push origin main
```
