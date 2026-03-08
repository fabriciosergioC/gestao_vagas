-- ==================== CONSTRAINTS MULTI-TENANT ====================
-- Execute este script para adicionar as restrições de unicidade no banco de dados
-- Isso evita cadastro duplicado de nome fantasia e usuario

-- ==================== CLIENTES: Nome Fantasia Unico ====================
-- Adiciona constraint UNIQUE para nome_fantasia (nao permite repeticao)
ALTER TABLE clientes DROP CONSTRAINT IF EXISTS clientes_nome_fantasia_unique;

ALTER TABLE clientes ADD CONSTRAINT clientes_nome_fantasia_unique UNIQUE (nome_fantasia);

-- ==================== USUARIOS: Usuario Unico por Cliente ====================
-- Adiciona constraint UNIQUE para (cliente_id, usuario)
-- Isso permite o mesmo usuario em clientes diferentes, mas nao no mesmo cliente
ALTER TABLE usuarios DROP CONSTRAINT IF EXISTS usuarios_cliente_usuario_unique;

ALTER TABLE usuarios ADD CONSTRAINT usuarios_cliente_usuario_unique UNIQUE (cliente_id, usuario);
