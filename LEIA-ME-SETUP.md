# ⚠️ IMPORTANTE: Execute o Setup no Supabase

O erro "Could not find the function public.criar_cliente" ocorre porque o schema multi-tenant ainda não foi executado no seu banco de dados.

---

## 🔧 Como Resolver (Passo a Passo)

### 1. Acesse o Supabase
- URL: https://app.supabase.com
- Faça login na sua conta
- Selecione seu projeto

### 2. Abra o SQL Editor
- No menu lateral, clique em **SQL Editor**
- Clique em **+ New query**

### 3. Execute o Script de Setup
1. Abra o arquivo `setup_multitenant.sql` (está na pasta do projeto)
2. Copie TODO o conteúdo do arquivo
3. Cole no SQL Editor do Supabase
4. Clique em **Run** (ou pressione Ctrl+Enter)

### 4. Verifique o Resultado
Você deve ver uma mensagem assim no rodapé:
```
✅ Setup multi-tenant concluído!
📊 Tabela clientes criada
🔗 cliente_id adicionado em todas as tabelas
🔐 RLS habilitado
👤 Cliente padrão (ID 1) criado
```

---

## ✅ Depois do Setup

Agora você pode:

1. **Acessar o sistema** (`login.html`)
2. **Fazer login** com:
   - Usuário: `admin`
   - Senha: `admin`
   - Cliente: `Cliente Padrão` (já vem cadastrado)

3. **Cadastrar novos clientes**:
   - Clique em **"➕ Novo Cliente"**
   - Preencha apenas:
     - Razão Social
     - Nome Fantasia
     - Usuário Admin
     - Senha Admin

---

## 📋 O Que o Script Faz

| Ação | Descrição |
|------|-----------|
| ✅ Cria tabela `clientes` | Armazena os clientes do sistema |
| ✅ Adiciona `cliente_id` | Em: usuarios, veiculos, historico, configuracoes |
| ✅ Cria índices | Para melhor performance |
| ✅ Habilita RLS | Row Level Security para isolamento |
| ✅ Cria cliente padrão | ID 1 com usuário `admin`/`admin` |

---

## 🐛 Problemas Comuns

### "relation 'clientes' does not exist"
- **Solução**: O script `setup_multitenant.sql` não foi executado
- Execute o script conforme instruções acima

### "duplicate key value violates unique constraint"
- **Solução**: O script já foi executado antes
- Isso é normal, os dados já estão criados

### "permission denied for table"
- **Solução**: As políticas RLS estão bloqueando
- O script já cria políticas de acesso total

---

## 📞 Precisa de Ajuda?

1. Verifique se está no projeto correto do Supabase
2. Confira se o script foi executado sem erros
3. Tente fazer logout e login novamente

---

**Após executar o script, recarregue a página `login.html` e tente cadastrar um cliente novamente!**
