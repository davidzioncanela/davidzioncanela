# ETAPA 7 - Mecânica de plataforma, modelos 3D e times alternáveis

## Implementado
- Modelos 3D animados KayKit Adventurers (CC0, Kay Lousberg) em `public/assets/models`:
  Dávid = Knight, Yohann = Barbarian, Laura = Mage, Lara = Rogue, capanga = Rogue encapuzado
- Altura de cada personagem proporcional à idade: Laura (10), Dávid (7), Yohann (3,5), Lara (2,5)
- Times alternáveis: Irmãos Dávid & Yohann resgatam Laura e Lara, ou Irmãs Laura & Lara resgatam Dávid e Yohann
  (tela inicial + botão "Trocar time" no HUD, Game Over e Vitória)
- Mecânica 2.5D: movimento travado no eixo X/Y, aceleração rápida, coyote time, buffer de pulo, altura de pulo variável
- Super pulo agachado: segurar ↓ por 2s e soltar (indicador sobre a cabeça fica amarelo quando carregado)
- Power-ups com 15s: Laser e Bolas de fogo (projéteis com F), Super velocidade, Flutuar (segurar Espaço caindo), Super pulo
- Duelo: capanga patrulha, entra em duelo por proximidade, persegue e ataca; barra de vida no HUD; derrotá-lo libera a gaiola
- Vidas: queda ou golpe tira 1 vida (com invencibilidade de 1,5s); reaparece no último chão firme
- Moedas coletáveis e pontuação no HUD
- Companheiro segue o líder, pula buracos e reaparece ao lado se ficar para trás
- Câmera lateral estilo Metal Slug com limites da fase e zoom em diálogo/duelo

## Controles
← → / A D andar · Espaço / ↑ pular · F / J atacar · ↓ / S segurar 2s para Super Pulo
