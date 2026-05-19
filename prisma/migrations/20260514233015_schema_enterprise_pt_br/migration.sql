-- CreateEnum
CREATE TYPE "PapelUsuario" AS ENUM ('ALUNO', 'PROFESSOR', 'FUNCIONARIO', 'COORDENADOR', 'GESTOR', 'VISITANTE');

-- CreateEnum
CREATE TYPE "TipoDispositivo" AS ENUM ('CATRACA', 'LEITOR_CARTAO');

-- CreateEnum
CREATE TYPE "StatusAcesso" AS ENUM ('CONCEDIDO', 'NEGADO');

-- CreateEnum
CREATE TYPE "FinalidadeLog" AS ENUM ('ENTRADA_PREDIO', 'PRESENCA_SALA');

-- CreateEnum
CREATE TYPE "DirecaoAcesso" AS ENUM ('ENTRADA', 'SAIDA');

-- CreateEnum
CREATE TYPE "StatusDispositivo" AS ENUM ('ATIVO', 'INATIVO', 'MANUTENCAO');

-- CreateEnum
CREATE TYPE "TipoToken" AS ENUM ('CHAVE_API', 'REFRESH', 'APP');

-- CreateTable
CREATE TABLE "usuarios" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "hashSenha" TEXT NOT NULL,
    "matricula" TEXT,
    "cartaoId" TEXT,
    "curso" TEXT,
    "papel" "PapelUsuario" NOT NULL DEFAULT 'ALUNO',
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "dataExpiracao" TIMESTAMP(3),
    "turnoId" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tokens" (
    "id" TEXT NOT NULL,
    "tipo" "TipoToken" NOT NULL,
    "hash" TEXT NOT NULL,
    "dataExpiracao" TIMESTAMP(3),
    "revogado" BOOLEAN NOT NULL DEFAULT false,
    "usuarioId" TEXT NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "turnos" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "horaInicio" INTEGER NOT NULL,
    "horaFim" INTEGER NOT NULL,
    "diasSemana" INTEGER[],

    CONSTRAINT "turnos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "salas" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "bloco" TEXT,

    CONSTRAINT "salas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dispositivos" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "tipo" "TipoDispositivo" NOT NULL DEFAULT 'LEITOR_CARTAO',
    "status" "StatusDispositivo" NOT NULL DEFAULT 'ATIVO',
    "enderecoMac" TEXT,
    "hashChaveSeguranca" TEXT,
    "ipLocal" TEXT,
    "salaId" TEXT NOT NULL,

    CONSTRAINT "dispositivos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "logs_acesso" (
    "id" TEXT NOT NULL,
    "dataHora" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "StatusAcesso" NOT NULL,
    "finalidade" "FinalidadeLog" NOT NULL DEFAULT 'ENTRADA_PREDIO',
    "direcao" "DirecaoAcesso" NOT NULL DEFAULT 'ENTRADA',
    "motivo" TEXT,
    "usuarioId" TEXT,
    "uidCartao" TEXT,
    "dispositivoId" TEXT NOT NULL,

    CONSTRAINT "logs_acesso_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_email_key" ON "usuarios"("email");

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_matricula_key" ON "usuarios"("matricula");

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_cartaoId_key" ON "usuarios"("cartaoId");

-- CreateIndex
CREATE UNIQUE INDEX "tokens_hash_key" ON "tokens"("hash");

-- CreateIndex
CREATE INDEX "tokens_usuarioId_idx" ON "tokens"("usuarioId");

-- CreateIndex
CREATE UNIQUE INDEX "salas_nome_bloco_key" ON "salas"("nome", "bloco");

-- CreateIndex
CREATE UNIQUE INDEX "dispositivos_enderecoMac_key" ON "dispositivos"("enderecoMac");

-- CreateIndex
CREATE INDEX "logs_acesso_dataHora_idx" ON "logs_acesso"("dataHora");

-- CreateIndex
CREATE INDEX "logs_acesso_usuarioId_dataHora_idx" ON "logs_acesso"("usuarioId", "dataHora");

-- CreateIndex
CREATE INDEX "logs_acesso_dispositivoId_dataHora_idx" ON "logs_acesso"("dispositivoId", "dataHora");

-- CreateIndex
CREATE INDEX "logs_acesso_usuarioId_status_idx" ON "logs_acesso"("usuarioId", "status");

-- AddForeignKey
ALTER TABLE "usuarios" ADD CONSTRAINT "usuarios_turnoId_fkey" FOREIGN KEY ("turnoId") REFERENCES "turnos"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tokens" ADD CONSTRAINT "tokens_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dispositivos" ADD CONSTRAINT "dispositivos_salaId_fkey" FOREIGN KEY ("salaId") REFERENCES "salas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "logs_acesso" ADD CONSTRAINT "logs_acesso_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "logs_acesso" ADD CONSTRAINT "logs_acesso_dispositivoId_fkey" FOREIGN KEY ("dispositivoId") REFERENCES "dispositivos"("id") ON DELETE CASCADE ON UPDATE CASCADE;
