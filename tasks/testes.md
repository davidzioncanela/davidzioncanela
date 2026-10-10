### Estratégia de Testes e Qualidade de Código:

Para garantir que o jogo continue performático (mantendo taxa estável de quadros por segundo) e bem estruturado a cada commit na branch 'main', adicione o seguinte aos ciclos de desenvolvimento:

1. Testes de Unidade e Lógica (Jest / Vitest):
   - Testar a lógica pura do jogo: sistema de colisões, cálculos de física (gravidade e pulo), gerenciamento de inventário de power-ups e gerador de nomes aleatórios dos NPCs.
   - Garantir cobertura nas funções que salvam e recuperam dados do Turso.

2. Testes de Componentes e Renderização (React Testing Library):
   - Validar se os diálogos interativos aparecem corretamente nas cenas e respondem aos inputs.
   - Verificar se a barra de vida dos NPCs e o sistema de zoom estilo Metal Slug ativam e desativam os travamentos de tela corretamente.

3. Testes de Performance e FPS (Lighthouse / Web Vitals / Ferramentas de Perfilamento):
   - Monitorar quedas de frames (jank) na renderização 3D/Canvas (Three.js/Fiber) na Fase 1 (Nuvens) e nos combates com zoom.
   - Garantir que o carregamento dos arquivos de áudio e modelos 3D externos não causem vazamentos de memória (memory leaks) ou travamentos no loop de animação do jogo (requestAnimationFrame).

Sempre que concluir uma etapa principal de código, inclua os testes correspondentes (especialmente unitários para a lógica e validações de performance) para subirmos tudo validado no commit.@