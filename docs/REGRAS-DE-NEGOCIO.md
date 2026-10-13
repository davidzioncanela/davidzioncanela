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

## 4. Fases e desafios (estilo Metal Slug)

- As fases são **progressivas**: começam na terra e vão subindo até as alturas; as hordas finais acontecem **nas nuvens**.
- Cada fase dá **ênfase a um elemento** e tem só pitadas dos outros:

| Fase | Nome | Ênfase | Pitadas |
|---|---|---|---|
| 1 | Da Terra às Nuvens | nuvens com física | uma corda |
| 2 | Floresta das Cordas | cordas com física | árvore de galhos |
| 3 | Lago e Trepa-trepa | natação e barras | uma corda, nuvens elásticas |
| 4 | Encanamento | labirintos de canos e portas | trepa-trepa curto |

- Ao vencer uma fase aparece **Próxima fase**; no online só o anfitrião avança e os outros acompanham.
- `?fase=N` na URL começa direto na fase N (para testes).

### 4.0 Nuvens com física
- Cada nuvem é presa por uma "mola" ao seu ponto de descanso: **afunda proporcionalmente ao peso** de quem está em cima e **se estabiliza**; quando todos saem, volta balançando.
- O peso de cada personagem depende do tamanho (Laura pesa mais que Lara).
- Tipos: **firme** (quase não afunda), **que afunda** (cede bastante), **elástica** (rosa, arremessa para cima) e **à deriva** (passeia para os lados; quem está em cima vai junto).

### 4.0.1 Monstros
- Inimigos são monstros 3D (KayKit Skeletons, CC0) com **cor sorteada** e **olhos brilhando na cor do poder**.
- **Durante a fase**: monstrinhos pequenos patrulham o caminho; perseguem quem chega perto; pular na cabeça derrota (estilo Mario).
- **Nos desafios (hordas)**: monstros maiores — magos (fogo/raio), ladinos (veloz/saltador) e o guerreiro **Gigante** (chefe).

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
- **Labirintos de canos** (sempre aleatórios, simples, diferentes a cada partida):
  - visão de **raio-X**: o cano aparece fatiado (metade de trás) e dá para ver quem está dentro;
  - entra agachando (↓) em cima da boca verde; lá dentro as setas escolhem o caminho em cada junção;
  - **escadas** sobem e descem; **escorregadores com água** (diagonais) descem sozinhos; **rampas molhadas** se sobem empurrando, mas quem solta escorrega de volta (física escorregadia);
  - cada ponto novo descoberto vale **10 pontos**; **becos sem saída** guardam prêmios (3 moedas, 300 pontos ou um power-up);
  - **minimapa** mostra só o que já foi descoberto (trechos vistos de relance aparecem tracejados), a entrada, a saída e os jogadores.
- **Natação** em alguns mapas: dentro da água a gravidade diminui, o pulo vira braçada e há fôlego limitado.
- **Galhos** e **barras horizontais**: o personagem se pendura e atravessa mão a mão.
- **Portas** de entrada e saída ao longo do mapa, ligando áreas como num labirinto.

## 4.5 Ações dos personagens
- Todos os personagens **colidem entre si** (dá para subir em cima do outro), inclusive com jogadores de outros aparelhos e com os monstros.

| Ação | Como | Para que serve | Disponível |
|---|---|---|---|
| Andar / correr | segurar a direção; depois de 0,4 s passa a correr | correndo o pulo alcança mais longe | desde o início |
| Pular | ↑ / W / Espaço | — | desde o início |
| Agachar | ↓ parado | tiros passam por cima; 2 s carregam o Super Pulo | desde o início |
| Engatinhar | ↓ + andar | passa pelos **atalhos baixos** (teto a 1,0); a Lara (2,5 anos) passa até em pé | prêmio: **10 moedas** |
| Deitar | Z (J2: `.`; toque: botão roxo) | **não recebe dano** por até 3 s; depois precisa levantar (4 s de espera) | prêmio: **800 pontos** |
| Dançar | V (J2: `,`; toque: botão rosa) | cada personagem tem **sua dança**; dançar **recarrega o poder de ajuda 3x mais rápido** | prêmio: **1500 pontos** |

- Pontos e moedas são **somados entre as partidas** neste aparelho; ao alcançar o valor, a ação é desbloqueada com um aviso na tela.
- O HUD mostra as ações liberadas e quanto falta para as bloqueadas.
- Cada fase tem um **atalho baixo** com moedas dentro.
- Danças: Dávid comemora, Yohann faz a dança do machado, Laura gira a varinha, Lara pula sem parar.

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

## 7. Mundo aberto (hub / menu principal)
- O menu principal é uma **cidade em mundo aberto**, vista de cima (estilo Ragnarok), montada com o KayKit City Builder Bits (CC0).
- Ao entrar, a pessoa informa o **nome** (2 a 20 letras) e escolhe o **personagem**; o aparelho lembra a escolha.
- No centro fica a **pracinha** (chafariz, bancos, árvores), o lugar onde as crianças querem brincar na história.
- Os personagens ficam parados (idle) ou andando; todos veem uns aos outros em tempo real, com o nome acima da cabeça.
- **Andar**: toque/clique rápido no chão leva o personagem até o ponto (prédios bloqueiam); no computador também dá para usar WASD/setas.
- **Câmera** (celular e computador):
  - arrastar (1 dedo / botão esquerdo) gira em volta do personagem;
  - pinça (2 dedos) / roda do mouse dá zoom;
  - arrastar com 2 dedos / botão direito move a câmera;
  - o botão **Centralizar** volta a câmera para o personagem.
- **Chat real** entre os jogadores: mensagens de até 200 caracteres aparecem no painel e num **balão** acima de quem falou por 5 segundos.
  - As últimas 50 mensagens ficam salvas (Turso) e aparecem para quem entra.
  - Sem conexão com o servidor, a cidade funciona mas o chat fica desativado ("Offline").
- **NPCs** moradores passeiam perto de casa e falam frases (dicas do jogo) quando alguém chega perto ou clica neles.
- O botão **Aventura** abre a escolha do modo: 1 jogador, 2 no teclado ou online.

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
