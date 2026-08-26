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

O site precisa de um endereço público (é assim que os convidados entram). Com Docker:

```bash
docker compose up --build
```

A porta publicada vem do `.env` (copie de `.env.example`). Os dados — banco **e** as fotos
enviadas — ficam na pasta apontada por `DATA_PATH`, fora do container: é só essa pasta que
precisa de backup.

---

## Onde ficam as coisas

```
backend/          servidor (Express) + banco (SQLite via Prisma)
  src/routes/       caminhos da API
  src/controllers/  recebem o pedido e validam
  src/services/     único lugar que fala com o banco
  prisma/           modelo de dados e migrations
frontend/         o site (React + Vite)
  src/pages/        telas dos convidados
  src/pages/painel/ telas do casal
  src/components/   moldura do site e do painel
  src/lib/api.js    único ponto que fala com a API
data/             banco (app.db) e fotos enviadas — NÃO vai para o Git
```

---

## Cuidados

- O site fica **aberto na internet**: use senha forte no painel e não algo óbvio como a
  data do casamento.
- Ele guarda **nome e telefone dos convidados**. Nada de CPF, senha ou pagamento.
- Faça backup da pasta `data/` — é lá que estão o banco e as fotos.

---

## O que ficou de fora (pode vir depois)

Aviso por e-mail/WhatsApp a cada escolha · página "nossa história" · convidado sugerir
presente fora da lista · cota/Pix/link de compra · recado do convidado para o casal ·
login separado para cada um do casal · envio automático dos convites.
