-- CreateTable
CREATE TABLE "Convidado" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nome" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "telefone" TEXT,
    "presenca" TEXT NOT NULL DEFAULT 'sem_resposta',
    "acompanhantes" INTEGER NOT NULL DEFAULT 0,
    "respondidoEm" DATETIME,
    "criadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Presente" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nome" TEXT NOT NULL,
    "fotoUrl" TEXT,
    "categoria" TEXT,
    "faixaPreco" TEXT,
    "observacao" TEXT,
    "quantidade" INTEGER NOT NULL DEFAULT 1,
    "criadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Reserva" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "presenteId" INTEGER NOT NULL,
    "convidadoId" INTEGER NOT NULL,
    "quantidade" INTEGER NOT NULL DEFAULT 1,
    "criadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Reserva_presenteId_fkey" FOREIGN KEY ("presenteId") REFERENCES "Presente" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Reserva_convidadoId_fkey" FOREIGN KEY ("convidadoId") REFERENCES "Convidado" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Config" (
    "id" INTEGER NOT NULL PRIMARY KEY DEFAULT 1,
    "nomeCasal" TEXT NOT NULL DEFAULT 'Nós dois',
    "dataFesta" DATETIME,
    "horaFesta" TEXT,
    "endereco" TEXT,
    "linkMapa" TEXT,
    "limiteTroca" DATETIME,
    "recado" TEXT,
    "senhaPainel" TEXT NOT NULL DEFAULT 'chadepanela',
    "atualizadoEm" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Foto" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "url" TEXT NOT NULL,
    "legenda" TEXT,
    "ordem" INTEGER NOT NULL DEFAULT 0,
    "criadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "Convidado_codigo_key" ON "Convidado"("codigo");
