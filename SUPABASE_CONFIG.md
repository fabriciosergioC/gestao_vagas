# 📚 Configuração do Supabase - Controle de Estacionamento

Este documento explica como configurar o banco de dados Supabase para o sistema de controle de estacionamento.

## 🚀 Passo a Passo

### 1. Criar Projeto no Supabase

1. Acesse https://supabase.com
2. Clique em **"Start your project"** ou **"New Project"**
3. Preencha as informações:
   - **Organization**: Selecione ou crie uma
   - **Project name**: `controle-estacionamento` (ou outro nome)
   - **Database password**: Crie uma senha forte
   - **Region**: Escolha a mais próxima (us-east-1 é recomendada)
4. Clique em **"Create new project"**

### 2. Executar o Script SQL

1. No painel do Supabase, vá para **SQL Editor** (menu lateral)
2. Clique em **"New query"**
3. Copie o conteúdo do arquivo `supabase_schema.sql` e cole no editor
4. Clique em **"Run"** para executar o script

O script criará:
- ✅ Tabela `veiculos` - Veículos no pátio
- ✅ Tabela `historico` - Histórico de saídas
- ✅ Tabela `configuracoes` - Configurações do sistema
- ✅ Tabela `usuarios` - Usuários do sistema
- ✅ Índices para performance
- ✅ Triggers para atualização automática
- ✅ Row Level Security (RLS) com políticas de acesso

### 3. Obter Credenciais da API

1. No painel do Supabase, vá para **Settings** (ícone de engrenagem)
2. Clique em **API**
3. Copie as seguintes informações:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon/public key**: `eyJhbG...` (chave longa)

### 4. Configurar o Arquivo `supabase.js`

1. Abra o arquivo `supabase.js` no editor de código
2. Substitua as variáveis pelas suas credenciais:

```javascript
const SUPABASE_URL = 'https://xxxxx.supabase.co'; // Sua URL
const SUPABASE_ANON_KEY = 'eyJhbG...'; // Sua chave anon
```

3. Salve o arquivo

### 5. Testar a Conexão

1. Abra o `index.html` no navegador
2. Abra o Console do Desenvolvedor (F12)
3. Verifique as mensagens:
   - ✅ `Supabase conectado com sucesso!` = Conexão estabelecida
   - ⚠️ `Supabase não configurado` = Edite o supabase.js
   - ❌ `Erro ao conectar no Supabase` = Verifique URL e chave

## 🔄 Funcionamento

### Sincronização Automática

O sistema funciona de forma **híbrida**:

1. **Ao iniciar**: Tenta conectar no Supabase e baixar os dados
2. **Ao salvar**: Salva no localStorage e sincroniza com Supabase em background
3. **Sem internet**: Usa localStorage como fallback
4. **Com Supabase**: Dados persistem na nuvem e podem ser acessados de qualquer dispositivo

### Vantagens do Supabase

- ✅ Dados na nuvem (não perde se limpar o navegador)
- ✅ Acesso multi-dispositivo
- ✅ Backup automático
- ✅ Histórico completo de movimentações

## 🛠️ Estrutura do Banco de Dados

### Tabela: `veiculos`

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| id | BIGINT | ID único do veículo |
| placa | VARCHAR | Placa do veículo |
| marca | VARCHAR | Marca do veículo |
| modelo | VARCHAR | Modelo do veículo |
| cor | VARCHAR | Cor do veículo |
| tipo | VARCHAR | carro/moto/caminhao |
| proprietario | VARCHAR | Nome do proprietário |
| telefone | VARCHAR | Telefone de contato |
| vaga | VARCHAR | Número da vaga |
| entrada | TIMESTAMP | Data/hora da entrada |
| saida | TIMESTAMP | Data/hora da saída (NULL = no pátio) |

### Tabela: `historico`

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| id | BIGINT | ID único do registro |
| veiculo_id | BIGINT | ID do veículo original |
| placa | VARCHAR | Placa do veículo |
| marca | VARCHAR | Marca do veículo |
| modelo | VARCHAR | Modelo do veículo |
| cor | VARCHAR | Cor do veículo |
| tipo | VARCHAR | carro/moto/caminhao |
| proprietario | VARCHAR | Nome do proprietário |
| telefone | VARCHAR | Telefone de contato |
| vaga | VARCHAR | Número da vaga |
| entrada | TIMESTAMP | Data/hora da entrada |
| saida | TIMESTAMP | Data/hora da saída |
| tempo_permanencia | VARCHAR | Tempo formatado (ex: 2h 30min) |
| valor_cobrado | DECIMAL | Valor pago |
| forma_pagamento | VARCHAR | dinheiro/pix/cartao |

### Tabela: `configuracoes`

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| id | INTEGER | ID fixo (sempre 1) |
| valor_hora_carro | DECIMAL | Valor por hora para carros |
| valor_hora_moto | DECIMAL | Valor por hora para motos |
| valor_hora_caminhao | DECIMAL | Valor por hora para caminhões |
| total_vagas | INTEGER | Total de vagas do estacionamento |
| nome_estacionamento | VARCHAR | Nome do estabelecimento |

### Tabela: `usuarios`

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| id | BIGINT | ID único do usuário |
| usuario | VARCHAR | Nome de usuário (login) |
| senha | VARCHAR | Senha do usuário |

## 🔧 Comandos Úteis no SQL Editor

### Limpar todo o histórico
```sql
DELETE FROM historico;
```

### Limpar veículos no pátio
```sql
DELETE FROM veiculos WHERE saida IS NULL;
```

### Resetar configurações
```sql
UPDATE configuracoes SET 
  valor_hora_carro = 10.00,
  valor_hora_moto = 5.00,
  valor_hora_caminhao = 20.00,
  total_vagas = 20,
  nome_estacionamento = 'Estacionamento Central';
```

### Ver total de veículos no pátio
```sql
SELECT COUNT(*) as total FROM veiculos WHERE saida IS NULL;
```

### Ver faturamento do mês
```sql
SELECT 
  SUM(valor_cobrado) as total,
  COUNT(*) as saidas
FROM historico
WHERE saida >= DATE_TRUNC('month', NOW());
```

## 🐛 Troubleshooting

### Erro: "Supabase não configurado"
- Verifique se preencheu `SUPABASE_URL` e `SUPABASE_ANON_KEY` no `supabase.js`

### Erro: "relation does not exist"
- Execute o script SQL no Supabase SQL Editor

### Erro: "permission denied"
- Verifique se as políticas de RLS estão configuradas
- Execute novamente o script SQL para recriar as políticas

### Dados não sincronizam
- Verifique o console do navegador (F12) para erros
- Teste a conexão em: https://xxxxx.supabase.co/rest/v1/veiculos?limit=1
  - Adicione o header: `apikey: SUA_CHAVE_ANON`

## 📞 Suporte

- Documentação Supabase: https://supabase.com/docs
- Dashboard: https://app.supabase.com

---

**✅ Pronto!** Seu sistema agora está com banco de dados na nuvem!
