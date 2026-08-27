# pessoal-cha-de-panela

## O que é

Site do chá de panela de um casal. Os convidados são cadastrados pelo casal, entram com um
código pessoal, confirmam presença e reservam presentes de uma lista — sem repetição. O
casal acompanha tudo num painel protegido por senha.

**Projeto pessoal.** Não tem relação com nenhuma empresa, e o visual é próprio (rosa claro,
creme e sálvia) — não segue identidade corporativa nenhuma.

## Arquitetura

Só web.

- Frontend: React + Vite (JavaScript)
- Backend: Node + Express (serve a API e o site — 1 container só)
- Banco: SQLite via Prisma. Em **dois destinos, mesmo schema**: arquivo (`data/app.db`) na
  máquina/Docker/Render, e **Turso** (SQLite hospedado, por HTTP) no Vercel. Quem escolhe é
  `backend/src/db.js`, olhando `TURSO_DATABASE_URL`.
- Fotos: **guardadas dentro do banco**, como texto (`data:image/jpeg;base64,...`). São
  reduzidas no navegador antes (`frontend/src/lib/imagem.js`). Não existe mais upload de
  arquivo nem multer.
- App mobile: não. Programa desktop: não.

## Como rodar (dois modos diferentes — não confunda)

**Na máquina de quem constrói: NATIVO, sem Docker.**

- `scripts/rodar-local.ps1` (Windows) ou `scripts/rodar-local.sh` (macOS/Linux).
- Backend na **3000**, tela (Vite) na **5173**. Abra `http://localhost:5173`.
- O Vite encaminha `/api` **e `/uploads`** pro backend. A porta do backend vem de
  `BACKEND_PORT` (padrão 3000) — se divergir, a tela abre mas não carrega dado.
- `DATABASE_URL=file:../../data/app.db` — o Prisma resolve `file:` a partir de
  `backend/prisma/`, então isso cai em `data/app.db` na raiz do projeto.
- `DATA_DIR` aponta pra pasta `data/` na raiz. É onde ficam o banco e as fotos.

**No Vercel: FUNÇÃO + CDN (é o caminho gratuito).**

- `api/index.js` é o ponto de entrada lá: monta o MESMO `backend/src/app.js` e o exporta,
  sem `listen`. As telas vêm da CDN, direto de `frontend/dist`.
- `vercel.json` manda `/api/*` pra função e todo o resto pro `index.html` (SPA).
- **`"framework": null` no `vercel.json` é obrigatório.** Sem ele a Vercel vê `frontend/`
  e `backend/` e classifica o projeto como **Services** (o modo multi-serviço dela); nesse
  modo ela exige uma chave `services` no arquivo e **o botão Deploy fica travado**. O
  `framework: null` devolve a detecção normal. Não tire essa linha.
- Nada de comentário no `vercel.json`: o schema tem `additionalProperties: false`, então
  até uma chave `"//"` reprova o arquivo. Explicações vão aqui.
- **O disco do Vercel é descartável.** Por isso o banco é o Turso, e as fotos vão no banco.
  Não reintroduza gravação em arquivo — sumiria a cada publicação.
- Tabelas no Turso: `npm run preparar-turso` (o `prisma migrate` não funciona por HTTP).
- `app.js` só serve `public/` e `/uploads` **se as pastas existirem** — no Vercel não
  existem, e sem essa checagem todo endereço desconhecido daria 500.

**No servidor: CONTAINER.**

- 1 serviço só (`app`): o Express serve `/api/*`, `/uploads/*` **e** os arquivos estáticos
  do React (build do Vite).
- `docker compose up --build`; a porta publicada é a `PORT` do `.env` (padrão 4000).
- **Não remova o `Dockerfile` nem o `docker-compose.yml`** — é como o site sobe no servidor.
- **Render**: `render.yaml` (blueprint) sobe a MESMA imagem do `Dockerfile`, com disco
  persistente em `/app/data`. O disco é obrigatório — sem ele o banco e as fotos somem a
  cada deploy — e exige plano pago. `DATABASE_URL=file:/app/data/app.db`, `DATA_DIR=/app/data`;
  a porta vem do `PORT` que o Render injeta.

## Dados

- `DATA_PATH` (compose) / `DATA_DIR` (aplicação): `./data` no notebook; no servidor, um
  caminho fora do container.
- Banco: `app.db`. A pasta `uploads/` só guarda fotos ANTIGAS (de antes da mudança); fotos
  novas vão no banco.
- Backup = copiar `app.db` (as fotos estão dentro dele). No Vercel, o backup é o do Turso.

## Modelo de dados

- **Convidado** — nome, código único (`ANA-4821`), telefone (opcional), presença
  (`confirmado` / `nao_vai` / `sem_resposta`), acompanhantes, respondidoEm.
- **Presente** — nome, foto, categoria, faixa de preço, observação, quantidade.
- **Reserva** — liga Convidado ↔ Presente com uma quantidade.
- **Config** — linha única (id = 1): nome do casal, data/hora/endereço/mapa da festa,
  recado, `limiteTroca` e `senhaPainel`.
- **Foto** — galeria do casal (url, legenda, ordem).

## Regras que o sistema garante (não quebrar)

- **Nunca expor quem reservou o quê para outro convidado.** A lista pública
  (`GET /api/presentes`) devolve só `reservado` / `disponivel` — jamais nomes. Nomes só no
  painel, atrás da senha.
- **Não deixar reservar além da quantidade.** A checagem é no `convite.controller`, com
  `somarReservado` do presente; devolve `SEM_DISPONIBILIDADE` (409).
- **Não reduzir a quantidade de um presente abaixo do já reservado** — senão a escolha de
  alguém desapareceria sem aviso (`presentes.controller`).
- **Depois de `limiteTroca` a lista trava**: não reserva nem cancela (`configService.listaAberta`).
  O prazo vale até o **fim** do dia escolhido.
- **Convidado só cancela a própria reserva** (confere `convidadoId`).
- **`PUT /api/painel/config` atualiza só os campos enviados.** Cada aba do painel manda os
  seus; se isso virar sobrescrita total, salvar as configurações apaga os dados da festa.
- **Datas escolhidas no calendário são guardadas ao meio-dia UTC** (e o limite de troca às
  23:59:59 UTC). Sem isso, "14/11" aparece como "13/11" pra quem está no Brasil.
- **Senha do painel** vive na tabela `Config`; chega em cada pedido no cabeçalho
  `x-painel-senha` (o front guarda no `sessionStorage`, que sai quando a aba fecha).
- **Nada de gravar arquivo em disco em tempo de execução.** No Vercel o disco é
  somente-leitura e descartável. Foto nova = texto no banco.
- **O limite do `express.json` é 6 MB** (`app.js`) por causa das fotos — o padrão de 100 KB
  barraria qualquer uma. O Vercel corta em 4,5 MB por pedido, e `imagem.js` mira ~700 KB.
- **`backend/src/db.js` é o único lugar que decide o destino do banco.** Services continuam
  usando `prisma.*` sem saber se é arquivo ou Turso.

## Padrões do código (não mudar sem motivo)

- Resposta da API sempre: `{ success, data }` (ok) ou `{ success, error: { message, code } }`.
- Backend em routes → controllers → services. **Banco só nos services.**
- Frontend fala com a API só pelo `src/lib/api.js` — nunca `fetch` solto nas telas.
- Mensagens de erro em português, escritas pra convidado leigo ler.
- Nomes de arquivos, funções e variáveis em português.

## Estado atual

Última atualização: 26/08/2026
Feito e validado rodando na máquina:

- Cadastro de convidados com código pessoal + link do convite
- Confirmação de presença com acompanhantes e relatório de presenças
- Presentes com foto, categoria, faixa de preço, observação e quantidade
- Reserva sem repetição, cancelamento e trava por data limite
- Painel "Quem leva o quê"
- Galeria de fotos do casal com envio de imagem
- Dados da festa + contagem regressiva
- **Responsivo no celular**, conferido em 375px, 768px e 1280px
- **NO AR no Vercel, com o banco no Turso** — publicado e conferido em produção:
  cadastro de convidado pelo painel grava e lista de volta, ou seja, a função do Vercel
  fala com o Turso de verdade (o motor do Prisma pro Linux está indo junto no pacote).
  Conferido antes, na máquina: os dois caminhos do `db.js` (arquivo e adaptador libSQL),
  o `preparar-turso` (cria as tabelas e é seguro repetir) e a API inteira pelo Turso.
  O que segue SEM conferência aqui: o build do Docker (não há Docker nesta máquina —
  quem confere é o GitHub Actions no PR).

Há dados de exemplo no banco local (casal "Clara & Fabrício", 3 convidados, 3 presentes e
4 fotos CC0 do Wikimedia Commons) — apagar antes de usar de verdade, ou apagar a pasta
`data/` e rodar `npx prisma migrate deploy` de novo.

## Responsivo (o que foi feito e por quê)

Ponto de virada em **768px** (`index.css`, no fim do arquivo):

- **Tabelas do painel viram cartões empilhados.** As três telas de tabela têm a classe
  `tabela-cartoes`, e cada `<td>` carrega um `data-rotulo` — no celular o cabeçalho some e
  o rótulo aparece ao lado do valor. Sem isso o casal teria que arrastar tabela pro lado no
  celular. **Ao adicionar coluna nova, ponha o `data-rotulo` nela também**, senão a célula
  aparece sem legenda.
- **Campos de formulário com 16px no celular.** Abaixo disso o iPhone dá zoom sozinho ao
  tocar no campo e o site fica torto.
- **Alvos de toque de 44px** (`.icone-botao`, botões pequenos, chips de filtro).
- **Menu lateral vira gaveta** com fundo escurecido; o botão de menu só aparece no celular.
- Nenhuma tela pode fazer a página rolar de lado — o que for largo rola dentro da própria
  caixa (`overflow-x: auto`).

## Pendências conhecidas

- **Senha inicial `chadepanela`** — trocar em Nosso site → Configurações antes de publicar.
- **Fotos antigas com endereço `/uploads/...`** continuam no banco apontando pra arquivo. No
  Vercel elas não aparecem: é preciso reenviar por Nosso site → Fotos.
- **`npm audit` acusa o CLI do Prisma** (deepmerge-ts). É ferramenta de build, não código
  que atende pedido; `audit fix --force` rebaixaria o Prisma e quebraria o adaptador.
- Fora de escopo (pode vir depois): aviso por e-mail/WhatsApp, página "nossa história",
  convidado sugerir presente, cota/Pix, recado do convidado, login separado por pessoa,
  envio automático dos convites.
