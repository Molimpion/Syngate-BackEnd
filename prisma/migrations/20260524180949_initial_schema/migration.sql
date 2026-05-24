-- Migration: initial_schema
-- Schema completo do Syngate — tabelas, enums, índices e extensões numa migration só

-- ─── Extensões ───────────────────────────────────────────────────────────────

CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- ─── Enums ───────────────────────────────────────────────────────────────────

CREATE TYPE "PapelUsuario" AS ENUM (
  'ALUNO',
  'PROFESSOR',
  'FUNCIONARIO',
  'COORDENADOR',
  'GESTOR',
  'VISITANTE'
);

CREATE TYPE "TipoDispositivo" AS ENUM (
  'CATRACA',
  'LEITOR_CARTAO'
);

CREATE TYPE "StatusAcesso" AS ENUM (
  'CONCEDIDO',
  'NEGADO'
);

CREATE TYPE "FinalidadeLog" AS ENUM (
  'ENTRADA_PREDIO',
  'PRESENCA_SALA'
);

CREATE TYPE "DirecaoAcesso" AS ENUM (
  'ENTRADA',
  'SAIDA'
);

CREATE TYPE "StatusDispositivo" AS ENUM (
  'ATIVO',
  'INATIVO',
  'MANUTENCAO'
);

CREATE TYPE "TipoToken" AS ENUM (
  'CHAVE_API',
  'REFRESH',
  'APP'
);

-- ─── Tabelas ─────────────────────────────────────────────────────────────────

CREATE TABLE "turnos" (
  "id"         TEXT NOT NULL,
  "nome"       TEXT NOT NULL,
  "horaInicio" INTEGER NOT NULL,
  "horaFim"    INTEGER NOT NULL,
  "diasSemana" INTEGER[],
  CONSTRAINT "turnos_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "usuarios" (
  "id"               TEXT NOT NULL,
  "nome"             TEXT NOT NULL,
  "email"            TEXT NOT NULL,
  "hashSenha"        TEXT NOT NULL,
  "matricula"        TEXT,
  "cartaoId"         TEXT,
  "curso"            TEXT,
  "papel"            "PapelUsuario" NOT NULL DEFAULT 'ALUNO',
  "ativo"            BOOLEAN NOT NULL DEFAULT true,
  "dataExpiracao"    TIMESTAMP(3),
  "emailVerificado"  BOOLEAN NOT NULL DEFAULT false,
  "tokenVerificacao" TEXT,
  "turnoId"          TEXT,
  "criadoEm"         TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "atualizadoEm"     TIMESTAMP(3) NOT NULL,
  CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "tokens" (
  "id"            TEXT NOT NULL,
  "tipo"          "TipoToken" NOT NULL,
  "hash"          TEXT NOT NULL,
  "dataExpiracao" TIMESTAMP(3),
  "revogado"      BOOLEAN NOT NULL DEFAULT false,
  "usuarioId"     TEXT NOT NULL,
  "criadoEm"      TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "tokens_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "salas" (
  "id"    TEXT NOT NULL,
  "nome"  TEXT NOT NULL,
  "bloco" TEXT,
  CONSTRAINT "salas_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "dispositivos" (
  "id"                 TEXT NOT NULL,
  "nome"               TEXT NOT NULL,
  "tipo"               "TipoDispositivo"   NOT NULL DEFAULT 'LEITOR_CARTAO',
  "status"             "StatusDispositivo" NOT NULL DEFAULT 'ATIVO',
  "enderecoMac"        TEXT,
  "hashChaveSeguranca" TEXT,
  "ipLocal"            TEXT,
  "salaId"             TEXT NOT NULL,
  CONSTRAINT "dispositivos_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "logs_acesso" (
  "id"            TEXT NOT NULL,
  "dataHora"      TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "status"        "StatusAcesso" NOT NULL,
  "finalidade"    "FinalidadeLog"   NOT NULL DEFAULT 'ENTRADA_PREDIO',
  "direcao"       "DirecaoAcesso"   NOT NULL DEFAULT 'ENTRADA',
  "motivo"        TEXT,
  "usuarioId"     TEXT,
  "uidCartao"     TEXT,
  "dispositivoId" TEXT NOT NULL,
  CONSTRAINT "logs_acesso_pkey" PRIMARY KEY ("id")
);

-- ─── Unique Constraints ───────────────────────────────────────────────────────

CREATE UNIQUE INDEX "usuarios_email_key"            ON "usuarios"("email");
CREATE UNIQUE INDEX "usuarios_matricula_key"         ON "usuarios"("matricula");
CREATE UNIQUE INDEX "usuarios_cartaoId_key"          ON "usuarios"("cartaoId");
CREATE UNIQUE INDEX "usuarios_tokenVerificacao_key"  ON "usuarios"("tokenVerificacao");
CREATE UNIQUE INDEX "tokens_hash_key"                ON "tokens"("hash");
CREATE UNIQUE INDEX "salas_nome_bloco_key"           ON "salas"("nome", "bloco");
CREATE UNIQUE INDEX "dispositivos_enderecoMac_key"   ON "dispositivos"("enderecoMac");

-- ─── Índices B-Tree (performance em filtros comuns) ───────────────────────────

CREATE INDEX "tokens_usuarioId_idx"                    ON "tokens"("usuarioId");
CREATE INDEX "logs_acesso_dataHora_idx"                ON "logs_acesso"("dataHora");
CREATE INDEX "logs_acesso_usuarioId_dataHora_idx"      ON "logs_acesso"("usuarioId", "dataHora");
CREATE INDEX "logs_acesso_dispositivoId_dataHora_idx"  ON "logs_acesso"("dispositivoId", "dataHora");
CREATE INDEX "logs_acesso_usuarioId_status_idx"        ON "logs_acesso"("usuarioId", "status");

-- ─── Índices GIN pg_trgm (buscas ILIKE performáticas) ────────────────────────

CREATE INDEX "idx_usuarios_nome_trgm"  ON "usuarios" USING GIN ("nome"  gin_trgm_ops);
CREATE INDEX "idx_usuarios_email_trgm" ON "usuarios" USING GIN ("email" gin_trgm_ops);

-- ─── Foreign Keys ─────────────────────────────────────────────────────────────

ALTER TABLE "usuarios" ADD CONSTRAINT "usuarios_turnoId_fkey"
  FOREIGN KEY ("turnoId") REFERENCES "turnos"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "tokens" ADD CONSTRAINT "tokens_usuarioId_fkey"
  FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "dispositivos" ADD CONSTRAINT "dispositivos_salaId_fkey"
  FOREIGN KEY ("salaId") REFERENCES "salas"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "logs_acesso" ADD CONSTRAINT "logs_acesso_usuarioId_fkey"
  FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "logs_acesso" ADD CONSTRAINT "logs_acesso_dispositivoId_fkey"
  FOREIGN KEY ("dispositivoId") REFERENCES "dispositivos"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;