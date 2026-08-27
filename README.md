# Nosso Chá de Panela

Site do nosso chá de panela: cada convidado entra com o código pessoal dele, confirma
presença e escolhe na lista o que vai levar — sem que duas pessoas levem a mesma coisa.
O casal acompanha tudo num painel com senha.

Projeto **pessoal**. Não tem relação com nenhuma empresa.

---

## O que o site faz

**Para o convidado** (qualquer um com o link):

- Abre a página inicial e vê as fotos do casal, a data, o horário, o endereço (com link
  do mapa) e a contagem regressiva.
- Entra com **nome + código** (`ANA-4821`) ou direto pelo **link pessoal**
  (`/convite/ANA-4821`), que já o reconhece.
- Diz se vai à festa e quantas pessoas leva.
- Escolhe presentes da lista. Vê o que **já foi escolhido**, mas **nunca por quem**.
- Pode cancelar e trocar até a data limite definida pelo casal.

**Para o casal** (`/painel`, uma senha só para os dois):

- **Convidados** — cadastrar (o código é gerado automático), lista com link pronto para
  copiar, e o relatório de presenças com o total de pessoas esperadas.
- **Presentes** — cadastrar com foto, categoria, faixa de preço, observação e quantidade;
  editar; e a tela **Quem leva o quê**.
- **Nosso site** — fotos do casal, dados da festa e configurações (senha e prazo de troca).

O site funciona bem no **celular**: as tabelas do painel viram cartões empilhados, o menu
lateral vira gaveta e nenhuma tela obriga a arrastar pro lado.

> As fotos que estão no site agora são **de exemplo** — fotos de casais em licença CC0
> (domínio público) do [Wikimedia Commons](https://commons.wikimedia.org). Troque pelas
> suas em **Nosso site → Fotos**.

---

## Como rodar no seu computador

Precisa apenas do **Node** instalado. Não precisa de Docker.

```bash
powershell -ExecutionPolicy Bypass -File .\scripts\rodar-local.ps1
```

No macOS/Linux:

```bash
bash scripts/rodar-local.sh
```

O script instala o que falta, prepara o banco, sobe tudo e abre o navegador em
`http://localhost:5173`.

**Primeiro acesso ao painel:** a senha inicial é `chadepanela`. Troque em
**Nosso site → Configurações** antes de mandar o site para alguém.

> Se a porta 3000 já estiver ocupada por outro programa, suba o backend em outra porta e
> exporte `BACKEND_PORT` com o mesmo número antes de subir a tela — senão o site abre mas
> não carrega dado nenhum.

---

## Como colocar no ar

O site precisa de um endereço público (é assim que os convidados entram).

> **GitHub Pages não serve para este site.** Ele hospeda só páginas prontas — não roda
> Node nem banco de dados. Como aqui o convidado *grava* coisas (confirma presença,
> reserva presente) e o painel tem senha, não há como funcionar lá. O caminho gratuito
> equivalente é o **Vercel**, logo abaixo.

### No Vercel (gratuito — caminho mais curto)

O Vercel roda o site e a API de graça, mas **apaga o disco a cada publicação**. Por isso o
banco não pode ser um arquivo: ele fica no **Turso** (SQLite hospedado, também gratuito).
É o mesmo SQLite e o mesmo modelo de dados — só mora fora do servidor.

As fotos acompanham: elas são reduzidas no navegador e guardadas **dentro do banco**, então
não existe pasta de arquivos para sumir.

**1. Crie o banco no Turso** — [turso.tech](https://turso.tech), entre com a conta do
GitHub e crie um banco. Guarde os dois valores que ele mostra: o endereço
(`libsql://...`) e o token.

**2. Crie as tabelas** (uma vez só). Na pasta do projeto, ponha os dois valores num arquivo
`.env` na raiz:

```
TURSO_DATABASE_URL="libsql://...turso.io"
TURSO_AUTH_TOKEN="ey..."
```

e rode:

```bash
npm run preparar-turso
```

Ele cria as tabelas e a configuração inicial. Pode rodar de novo sem medo — se já estiver
pronto, ele não mexe em nada.

**3. Publique no Vercel** — [vercel.com](https://vercel.com), **Add New → Project**, aponte
para este repositório. O `vercel.json` já diz o que instalar e compilar; não mude nada na
tela de build. Antes de clicar em **Deploy**, abra **Environment Variables** e coloque as
mesmas duas: `TURSO_DATABASE_URL` e `TURSO_AUTH_TOKEN`.

Pronto. A cada `git push` o site se atualiza sozinho, e o banco continua onde está.

> **Depois de publicar, troque a senha do painel** em *Nosso site → Configurações*. Ela
> começa como `chadepanela`.

> O plano gratuito do Vercel é para uso **pessoal** — que é exatamente o caso aqui.

### Num servidor seu, com Docker

```bash
docker compose up --build
```

A porta publicada vem do `.env` (copie de `.env.example`). Os dados ficam na pasta apontada
por `DATA_PATH`, fora do container: é só essa pasta que precisa de backup. As fotos vão
dentro do próprio banco, então o arquivo `app.db` já leva tudo.

### No Render

O arquivo `render.yaml` já descreve tudo. No painel do Render: **New → Blueprint** e aponte
para este repositório — ele lê o `render.yaml` e cria o serviço sozinho.

É a **mesma imagem** do Dockerfile acima, então nada no código muda. O que não pode faltar:

- **Disco persistente** montado em `/app/data` (já está no `render.yaml`). Sem ele o Render
  apaga o banco a cada publicação — o disco padrão do container é descartável.
- **Plano pago.** O plano gratuito do Render não aceita disco persistente.
- As variáveis `DATABASE_URL=file:/app/data/app.db` e `DATA_DIR=/app/data` (também já estão
  no `render.yaml`). A porta o próprio Render define, e o servidor já a respeita.

As migrations rodam sozinhas a cada publicação (é o `CMD` do Dockerfile), então o banco
começa vazio e pronto — **sem os dados de exemplo** que existem na sua máquina.

> Serviço com disco não tem publicação sem queda: o Render para a versão antiga antes de
> subir a nova. São alguns segundos fora do ar a cada deploy.

**Backup:** o Render tira uma foto (snapshot) diária do disco, guardada por pelo menos sete
dias. Para uma cópia sua, baixe a pasta `/app/data` pelo shell do serviço.

> O Render cobra pelo disco. Se a ideia era não pagar nada, use o **Vercel + Turso** acima.

---

## Onde ficam as coisas

```
backend/          servidor (Express) + banco (SQLite via Prisma)
  src/routes/       caminhos da API
  src/controllers/  recebem o pedido e validam
  src/services/     único lugar que fala com o banco
  src/db.js         escolhe entre o arquivo local e o Turso
  prisma/           modelo de dados e migrations
  scripts/          preparar-turso.js (cria as tabelas no Turso)
frontend/         o site (React + Vite)
  src/pages/        telas dos convidados
  src/pages/painel/ telas do casal
  src/components/   moldura do site e do painel
  src/lib/api.js    único ponto que fala com a API
  src/lib/imagem.js reduz a foto antes de guardar
api/index.js      ponto de entrada SÓ no Vercel (usa o mesmo Express)
vercel.json       o que o Vercel instala, compila e por onde encaminha
data/             banco (app.db) — NÃO vai para o Git
```

---

## Cuidados

- O site fica **aberto na internet**: use senha forte no painel e não algo óbvio como a
  data do casamento.
- Ele guarda **nome e telefone dos convidados**. Nada de CPF, senha ou pagamento.
- Faça backup do banco — no seu computador/Docker é a pasta `data/`; no Vercel é o próprio
  Turso, que tem backup automático no painel dele. As fotos vão dentro do banco, então uma
  cópia dele já leva tudo.

---

## O que ficou de fora (pode vir depois)

Aviso por e-mail/WhatsApp a cada escolha · página "nossa história" · convidado sugerir
presente fora da lista · cota/Pix/link de compra · recado do convidado para o casal ·
login separado para cada um do casal · envio automático dos convites.
