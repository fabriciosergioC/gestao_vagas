# 🏢 Sistema Multi-Tenant - Controle de Estacionamento

Sistema atualizado para suportar **múltiplos clientes** com dados completamente isolados.

---

## 📋 Visão Geral

Cada cliente agora tem:
- ✅ **Seus próprios usuários** (login/senha)
- ✅ **Seus próprios veículos** no pátio
- ✅ **Seu próprio histórico** de saídas
- ✅ **Suas próprias configurações** (valores, vagas, etc.)
- ✅ **Dados completamente isolados** - um cliente não vê os dados do outro

---

## 🚀 Configuração Inicial

### Passo 1: Executar o Schema Multi-Tenant no Supabase

1. Acesse https://app.supabase.com
2. Entre no seu projeto
3. Vá para **SQL Editor** → **New query**
4. Copie e cole o conteúdo do arquivo `supabase_schema_multitenant.sql`
5. Clique em **Run**

Este script irá:
- Criar a tabela `clientes`
- Adicionar `cliente_id` em todas as tabelas
- Criar políticas de RLS para isolamento
- Criar funções utilitárias (`criar_cliente()`, `listar_clientes()`)

### Passo 2: Configurar credenciais no `supabase.js`

Edite o arquivo `supabase.js` e verifique se as credenciais estão corretas:

```javascript
const SUPABASE_URL = 'https://seu-projeto.supabase.co';
const SUPABASE_ANON_KEY = 'sua-chave-anon';
```

### Passo 3: Acessar o Sistema

1. Abra `login.html` no navegador
2. Selecione um cliente na lista OU cadastre um novo
3. Faça login com usuário e senha do cliente

---

## 📱 Fluxo do Usuário

```
┌─────────────────────────┐
│    login.html           │
│  - Selecionar cliente   │
│  - Cadastrar cliente    │
│  - Login/Senha          │
└───────────┬─────────────┘
            │
            ▼
┌─────────────────────────┐
│    index.html           │
│  - Sistema principal    │
│  - Dados do cliente     │
└───────────┬─────────────┘
            │
            ▼
┌─────────────────────────┐
│    logout → login       │
│  (volta para login)     │
└─────────────────────────┘
```

**Nota:** A tela de seleção de cliente foi integrada diretamente na tela de login, eliminando arquivos duplicados.

---

## 🗄️ Estrutura do Banco de Dados

### Tabela: `clientes`

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| id | BIGINT | ID único do cliente |
| cnpj | VARCHAR | CNPJ do estabelecimento |
| razao_social | VARCHAR | Razão social |
| nome_fantasia | VARCHAR | Nome fantasia |
| email | VARCHAR | E-mail |
| telefone | VARCHAR | Telefone |
| endereco | TEXT | Endereço |
| ativo | BOOLEAN | Se está ativo |

### Todas as Outras Tabelas

Todas as tabelas têm `cliente_id`:
- `usuarios.cliente_id`
- `veiculos.cliente_id`
- `historico.cliente_id`
- `configuracoes.cliente_id`

---

## 🔐 Isolamento de Dados

O isolamento é garantido por:

1. **Filtro nas Queries**: Todas as consultas no `supabase.js` filtram por `cliente_id`
2. **Row Level Security (RLS)**: Políticas no banco filtram automaticamente
3. **Cliente em Memória**: O cliente selecionado fica no localStorage

### Como Funciona

```javascript
// Todas as funções no supabase.js usam:
const clienteId = getClienteAtualId();

// Exemplo: buscar veículos
const { data } = await supabaseClient
  .from('veiculos')
  .select('*')
  .eq('cliente_id', clienteId)  // ← Filtra por cliente
  .is('saida', null);
```

---

## 🛠️ Funções Disponíveis

### No `supabase.js`

| Função | Descrição |
|--------|-----------|
| `setClienteAtual(id)` | Define o cliente atual |
| `getClienteAtualId()` | Obtém o ID do cliente atual |
| `fetchClientes()` | Lista todos clientes ativos |
| `createCliente(dados)` | Cria novo cliente |
| `validarUsuario(user, senha)` | Valida usuário no contexto do cliente |
| `fetchUsuarios()` | Lista usuários do cliente |
| `fetchVeiculosNoPatio()` | Lista veículos do cliente |
| `fetchHistorico()` | Lista histórico do cliente |
| `fetchConfiguracoes()` | Busca configurações do cliente |

---

## 📝 Cadastrando um Novo Cliente

### Pela Interface (login.html)

1. Em `login.html`, clique em **"➕ Novo Cliente"**
2. Preencha os dados:
   - Razão Social
   - Nome Fantasia
   - CNPJ, E-mail, Telefone
   - Usuário Admin e Senha
3. Clique em **"✅ Cadastrar"**

O sistema automaticamente:
- Cria o cliente
- Cria configurações padrão (20 vagas, valores padrão)
- Cria o usuário admin
- Recarrega a lista de clientes

### Via SQL

```sql
SELECT criar_cliente(
  '00.000.000/0001-00',           -- CNPJ
  'Estacionamento XYZ Ltda',      -- Razão Social
  'Estacionamento XYZ',           -- Nome Fantasia
  'contato@xyz.com',              -- E-mail
  '(11) 99999-9999',              -- Telefone
  'Rua Exemplo, 123',             -- Endereço
  'admin_xyz',                    -- Usuário Admin
  'senha123'                      -- Senha Admin
);
```

---

## 🔄 Trocar de Cliente

### No Login
- Selecione outro cliente na lista dropdown

### Após o Login
- Clique em **"Sair"** no menu
- Você será redirecionado para `login.html`
- Selecione outro cliente e faça login

---

## 📊 Consultas Úteis

### Ver Todos os Clientes

```sql
SELECT * FROM listar_clientes();
```

### Ver Resumo Multi-Cliente

```sql
SELECT * FROM resumo_multi_cliente;
```

Retorna:
- Cliente ID
- Nome fantasia
- Veículos no pátio
- Vagas ocupadas/livres
- Saídas no mês
- Faturamento no mês

### Ver Dados de um Cliente

```sql
-- Veículos no pátio
SELECT COUNT(*) FROM veiculos 
WHERE cliente_id = X AND saida IS NULL;

-- Faturamento do mês
SELECT SUM(valor_cobrado) FROM historico
WHERE cliente_id = X 
  AND saida >= DATE_TRUNC('month', NOW());

-- Configurações
SELECT * FROM configuracoes 
WHERE cliente_id = X;

-- Usuários
SELECT * FROM usuarios 
WHERE cliente_id = X;
```

---

## ⚠️ Importante

### Primeiro Acesso

Se nenhum cliente estiver cadastrado:
1. Execute o schema multi-tenant
2. Acesse `login.html`
3. Clique em **"➕ Novo Cliente"** e cadastre

### Cliente Padrão (ID = 1)

O script cria um cliente padrão com:
- ID: 1
- Nome: "Cliente Padrão"
- Usuário: `admin` / Senha: `admin`

### Migração de Dados Existentes

Se você já tinha dados antes do multi-tenant:
1. Execute o `supabase_schema_multitenant.sql`
2. Os dados existentes serão vinculados ao cliente padrão (ID 1)
3. Crie novos clientes normalmente

---

## 🔒 Segurança

### Boas Práticas

1. **RLS (Row Level Security)**: Mantenha habilitado em produção
2. **Senhas**: Em produção, use hash (bcrypt, argon2)
3. **HTTPS**: Sempre use em produção
4. **Logs**: A tabela `logs_acesso` registra atividades

### Políticas RLS

O script já cria políticas que filtram por `cliente_id`. Em produção, você pode reforçar usando JWT:

```sql
CREATE POLICY "Acesso por cliente" ON veiculos
  FOR ALL USING (
    cliente_id = (auth.jwt() ->> 'cliente_id')::bigint
  );
```

---

## 🧪 Testes

### Testar Isolamento

1. Crie dois clientes (A e B)
2. Faça login no cliente A
3. Cadastre veículos
4. Faça logout
5. Faça login no cliente B
6. **Resultado**: Nenhum veículo do cliente A aparece

---

## 📞 Suporte

- Documentação Supabase: https://supabase.com/docs
- Dashboard: https://app.supabase.com

---

**✅ Pronto!** Seu sistema agora atende múltiplos clientes com dados isolados!
