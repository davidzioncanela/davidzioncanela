# Super Zion Brothers — Regras de negócio

Documento vivo com as regras do jogo. Atualize sempre que uma regra mudar.

## 1. Personagens

| Personagem | Idade | Família | Modelo 3D (KayKit, CC0) | Altura no jogo |
|---|---|---|---|---|
| Laura | 10 anos | irmã mais velha da Lara | Mage | 1,45 |
| Dávid | 7 anos | irmão mais velho do Yohann | Knight | 1,25 |
| Yohann | 3 anos e meio | irmão do Dávid | Barbarian | 1,00 |
| Lara | 2 anos e meio | irmã da Laura | Rogue | 0,85 |

- A altura de cada personagem é proporcional à idade.
- Cada personagem tem um **poder próprio** usado para ajudar os outros (ver §5).

## 2. História e objetivo

- Bowser Jr. prendeu numa gaiola, no fim da fase, os personagens que **não** estão jogando.
- Quem joga precisa atravessar a fase, vencer todas as ondas de inimigos e abrir a gaiola.
- A gaiola só abre depois que a última onda (com o chefe Gigante) for derrotada.
- Vitória: um jogador encosta na gaiola aberta. Todos vão brincar juntos na pracinha.
- Se os quatro estiverem jogando, a gaiola guarda a chave da pracinha (não há ninguém para resgatar).

## 3. Modos de jogo

### 3.1 Desktop (mesmo computador)
- 1 ou 2 jogadores ao mesmo tempo, no mesmo teclado.
- Jogador 1: **W A S D** (andar/pular/agachar) + **F** (atacar) + **G** (poder de ajuda).
- Jogador 2: **setas** (andar/pular/agachar) + **K** ou **Enter** (atacar) + **L** (poder de ajuda).
- Com 1 jogador, as duas configurações de teclas controlam o mesmo personagem e o parceiro vira companheiro automático.

### 3.1.1 Tela dividida
- Os jogadores podem se afastar livremente.
- Quando se afastam muito (mais de 15 unidades), a tela **se divide** automaticamente: 2 jogadores ficam lado a lado e 3 ou 4 ficam em quadrantes.
- Quando voltam a ficar perto (menos de 10 unidades), a tela volta a ser uma só.
- Durante uma horda não há divisão: todos ficam na arena e quem ficou para trás é puxado para dentro dela.

### 3.2 Celular
- No celular cada aparelho controla **apenas 1 personagem** (jogo individual por aparelho).
- Vários celulares podem jogar juntos na mesma sessão online (até **4 jogadores**, um por personagem).
- Quem cria a sessão recebe:
  - um **código curto de 4 caracteres** (letras e números sem ambiguidade, ex.: `K7QF`);
  - um **link compartilhável** (`/?sala=K7QF`) que já abre o jogo dentro da sessão.
- Cada personagem só pode ser escolhido por um jogador por sessão.
- O servidor de tempo real é Socket.io (hospedado no Render ou Railway); o jogo fica na Vercel.
- Quem cria a sala é o **anfitrião (host)**: só ele pode começar a partida, depois que todos escolherem personagem.
- Se o anfitrião sair, o próximo da lista vira anfitrião. Salas abandonadas somem depois de 6 horas.
- Não é possível entrar numa sala cuja partida já começou.
- Durante a partida:
  - o host simula as hordas e é a fonte da verdade de vidas, pontos, moedas, trava de tela e vitória;
  - cada aparelho controla o próprio personagem e envia a posição ~15 vezes por segundo;
  - golpes nos inimigos são enviados ao host, que aplica o dano;
  - moedas e caixas pegas por alguém somem para todos;
  - poderes de ajuda valem para os jogadores próximos em qualquer aparelho.
- Cada aparelho mostra só o cartão do próprio jogador no HUD.

## 4. Fase e desafios (estilo Metal Slug)

- A fase é percorrida da esquerda para a direita: nuvens que descem para a Terra e depois chão de grama.
- Os desafios acontecem **durante a jornada**: ao passar por pontos da fase surge uma **onda de inimigos**.
- Durante uma onda a **tela trava** (ninguém avança) até todos os inimigos da onda serem derrotados.
- Cada inimigo tem **nome aleatório** (ex.: "Boom Cruel") e **um poder próprio**:

| Poder | Comportamento | Vida base |
|---|---|---|
| Bola de fogo | mantém distância e lança bolas de fogo que quicam | 40 |
| Raio laser | mantém distância e atira raios | 35 |
| Super veloz | corre até o jogador e golpeia | 30 |
| Saltador | pula em cima do jogador | 35 |
| Gigante (chefe) | grande, lento e resistente; guarda a gaiola | 120 |

- Pontos: inimigo comum 200, chefe 500, moeda 100.

### 4.1 Dificuldade por quantidade de jogadores
- A dificuldade cresce com o número de jogadores na sessão (1 a 4):
  - vida dos inimigos × (1 + 0,5 × (jogadores − 1));
  - +1 inimigo extra por onda para cada jogador além do primeiro;
  - inimigos atacam 10% mais rápido para cada jogador além do primeiro.

### 4.2 Hordas (estilo Metal Slug)
- Em pontos fixos da fase a tela **trava numa arena** e ninguém pode avançar até a horda acabar.
- A horda chega em **levas** ao longo do tempo, muito maior que um encontro comum.
- Os inimigos chegam por quatro lugares: **pela esquerda**, **pela direita**, **caindo do céu** e **saindo do chão**.
- Quem sai do chão emerge devagar e só ataca quando está totalmente fora.
- A última horda da fase traz o **chefe Gigante**; vencê-la abre a gaiola.

### 4.3 Elementos de travessia dos mapas
- **Cordas** com física: o personagem pula, se pendura e balança junto com a corda; pula de uma corda para outra.
- **Canos para rastejar**: labirintos de encanamento gerados aleatoriamente, com subidas, descidas e escorregadores em diagonal (declive).
- **Natação** em alguns mapas: dentro da água a gravidade diminui, o pulo vira braçada e há fôlego limitado.
- **Galhos** e **barras horizontais**: o personagem se pendura e atravessa mão a mão.
- **Portas** de entrada e saída ao longo do mapa, ligando áreas como num labirinto.

## 5. Poderes

### 5.1 Power-ups (caixas coloridas na fase)
- Tocar numa caixa ativa o power-up por **15 segundos** (substitui o anterior).
- Laser (atirar com o botão de ataque), Bolas de fogo, Super velocidade, Flutuar (segurar pulo enquanto cai) e Super pulo.

### 5.2 Poderes próprios de cada personagem (colaborativos)
| Personagem | Poder de ajuda |
|---|---|
| Laura | **Escudo mágico**: protege os outros jogadores próximos de 1 golpe |
| Dávid | **Grito de coragem**: aumenta o dano de todos por alguns segundos |
| Yohann | **Pulo duplo em equipe**: lança um aliado próximo para o alto |
| Lara | **Abraço que cura**: devolve 1 vida a um aliado próximo |

- Cada poder de ajuda tem tempo de recarga.

### 5.3 Super pulo agachado
- Segurar **↓/S por 2 segundos** e soltar dá um pulo muito alto. Um indicador sobre a cabeça fica amarelo quando carregado.

## 6. Vidas
- O time começa com **5 vidas**.
- Cair da fase ou levar um golpe tira 1 vida; depois de um golpe o personagem fica **2,5 s invencível** (pisca).
- Quem cai reaparece no último chão firme.
- Vidas zeradas: Game Over (reiniciar ou trocar personagens).

## 7. Mundo aberto (menu principal)
- O menu principal é uma **cidade em mundo aberto**, vista de cima (estilo Ragnarok).
- Os personagens ficam parados (idle) ou andando pela cidade e conversam entre si por **chat real**.
- A cidade tem NPCs.
- O chat usa o servidor Socket.io; o histórico fica salvo no Turso.

## 8. Visual
- Botões no estilo Duolingo: cantos bem arredondados, cores vivas, borda inferior grossa que "afunda" ao clicar.
- Fontes: Fredoka (títulos) e Nunito (textos).
- HUD em "pílulas" brancas: vidas, moedas, pontos, fase; um cartão por jogador com o poder de ajuda (tecla e recarga) e o power-up ativo.
- Cenário lúdico em camadas, com peças prontas do KayKit Medieval Hexagon (CC0): céu em degradê, sol com raios, arco-íris, montanhas, colinas com árvores, moinhos, o castelo do Bowser Jr. ao fundo, nuvens passeando e poeira mágica.
- Power-ups com efeitos exagerados:
  - na fase: caixa brilhante girando, com faíscas e luz colorida;
  - ao coletar: explosão de luz (onda de choque e faíscas);
  - enquanto ativo (efeito permanente): aura brilhante, anéis girando, faíscas e luz na cor do power-up;
  - escudo da Laura: bolha azul ao redor de quem está protegido.
- Bloom (brilho) na imagem final, desligado quando a tela está dividida.
