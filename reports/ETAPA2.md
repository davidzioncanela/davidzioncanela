# ETAPA 2 - Canvas principal e sistema de física base
**Commit 2:** Componente principal do Canvas do jogo e sistema de física base (gravidade, colisão de chão e movimentação do Dávid/Yohann).

## Implementado
- Sistema de input global (keydown/keyup) para David/Yohann
- Detecção de chão via raycast Rapier (grounded) para pulo correto
- Movimentação 3D (X/Z) com impulsos, velocidade 6 (boost 10 com super-speed)
- Pulo (impulso Y) e agachamento com timer 2s (prepara Super Pulo)
- Câmera estilo Metal Slug: follow lateral, look-ahead, zoom em duel/dialog
- GameCanvas rastreia posição/velocidade do jogador para câmera
- Level1 integrado com callbacks de posição
- Física: Rapier com gravidade -9.81, colliders, lockRotations

## Arquivos modificados
- src/components/game/characters/David.tsx
- src/components/game/characters/Yohann.tsx
- src/components/game/CameraController.tsx
- src/components/game/GameCanvas.tsx
- src/components/game/levels/Level1.tsx

## Comandos Git
```bash
git add .
git commit -m "feat: ETAPA 2 - Canvas + física base (movimentação, colisões, gravidade, câmera Metal Slug style)"
git push origin main
```
