# Servidor de tempo real — Super Zion Brothers

Servidor Socket.io usado pelo modo online (salas com código de 4 caracteres) e pelo chat da cidade.
O jogo (Next.js) fica na Vercel; este servidor roda separado, no **Render** ou no **Railway**.

## Rodar localmente

```bash
cd server
npm install
npm run dev        # porta 3002
```

O jogo em `npm run dev` (porta 3000) procura o servidor em `http://<mesmo host>:3002` quando
`NEXT_PUBLIC_SOCKET_URL` não está definido.

## Variáveis de ambiente

| Variável | Obrigatória | Descrição |
|---|---|---|
| `PORT` | não | Porta HTTP (Render/Railway definem sozinhos). Padrão 3002. |
| `CORS_ORIGIN` | recomendado | Domínios do jogo separados por vírgula, ex.: `https://super-zion.vercel.app`. Vazio libera qualquer origem. |
| `TURSO_DATABASE_URL` | não | Banco Turso para guardar o histórico do chat. Sem ele, o histórico fica só em memória. |
| `TURSO_AUTH_TOKEN` | não | Token do Turso. |

No projeto da Vercel, defina `NEXT_PUBLIC_SOCKET_URL` com a URL pública deste servidor
(ex.: `https://super-zion-server.onrender.com`).

## Deploy

**Render** (Web Service): Root Directory `server`, Build Command `npm install && npm run build`,
Start Command `npm start`.

**Railway**: novo serviço a partir do repositório, Root Directory `server`; o Railway usa os scripts
`build` e `start` do `package.json`.

> O servidor compila também `../src/lib/protocol.ts` (tipos compartilhados com o jogo), então o
> repositório inteiro precisa estar disponível no build — não copie só a pasta `server`.
