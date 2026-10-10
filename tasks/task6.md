# ETAPA 6 - Power-ups (Laser, Super velocidade, Flutuar, Bolas de fogo, Super pulo agachado 2s)
**Commit 6:** Implementar power-ups alternáveis espalhados pelas fases: Laser, Super velocidade, Flutuar, Bolas de fogo, Super pulo (ativado ao ficar agachado por 2 segundos).

## Implementar
- Sistema de coleta e ativação de power-ups (alternáveis - um por vez ou trocar?)
- Efeitos visuais e HUD
- Laser: disparo com raycast/partículas
- Super velocidade: boost movimento
- Flutuar: gravidade reduzida temporária
- Bolas de fogo: projéteis
- Super pulo: já temos timer 2s (melhorar feedback)
- Coleta ao tocar PowerUpBox

## Arquivos
- src/components/game/powerups/PowerUpBox.tsx (coleta)
- src/components/game/powerups/PowerUpManager.tsx (novo)
- src/components/game/powerups/Projectile.tsx (bolas fogo)
- src/components/game/ui/PowerUpHUD.tsx (novo)
- src/store/gameStore.ts (expandir)
- src/components/game/characters/David.tsx (integra powerups)
- tasks/task6.md, reports/ETAPA6.md
