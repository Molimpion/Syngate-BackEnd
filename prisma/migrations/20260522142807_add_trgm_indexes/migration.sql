CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE INDEX idx_usuarios_nome_trgm  ON usuarios USING GIN (nome  gin_trgm_ops);
CREATE INDEX idx_usuarios_email_trgm ON usuarios USING GIN (email gin_trgm_ops);