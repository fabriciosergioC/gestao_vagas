# 🅿️ Sistema de Controle de Estacionamento

Sistema completo para controle de estacionamento de veículos, desenvolvido com HTML, CSS e JavaScript puro.

## ✨ Funcionalidades

- **Entrada de Veículos** - Registro de placa, marca, modelo, cor e tipo do veículo
- **Controle de Vagas** - Gerenciamento visual de vagas disponíveis e ocupadas
- **Pátio** - Visualização de todos os veículos estacionados com busca e filtros
- **Saída/Pagamento** - Cálculo automático de valores baseado no tempo de permanência
- **Histórico** - Registro completo de todas as movimentações com relatórios
- **Configurações** - Personalização de valores, quantidade de vagas e backup dos dados

## 🚀 Tecnologias

- HTML5
- CSS3
- JavaScript (ES6+)
- LocalStorage (armazenamento local)

## 📁 Estrutura do Projeto

```
sistema_estacionamento/
├── index.html          # Página principal
├── style.css           # Estilização
├── script.js           # Lógica do sistema
└── .gitignore          # Arquivos ignorados
```

## 🛠️ Como Usar

1. Clone ou baixe este repositório
2. Abra o arquivo `index.html` em um navegador moderno
3. Configure as vagas e valores na seção **Configurações**
4. Comece a registrar entradas de veículos

## 📋 Funcionalidades Detalhadas

### Entrada de Veículos
- Cadastro de placa (obrigatório)
- Seleção de marca e modelo (obrigatório)
- 17 marcas populares com modelos pré-cadastrados
- Opção para marcas não listadas
- Seleção de vaga automática (apenas vagas livres)

### Pátio
- Visualização em tempo real de todos os veículos
- Busca por placa, marca ou modelo
- Filtro por tipo (carro, moto, caminhão)
- Tempo de permanência atualizado
- Indicador de status (OK/Baixo)

### Saída
- Cálculo automático baseado no tempo
- Valores configuráveis por tipo de veículo
- Múltiplas formas de pagamento (Dinheiro, PIX, Cartão)
- Registro automático no histórico

### Histórico
- Todas as movimentações registradas
- Filtro por período
- Faturamento total e ticket médio
- Busca por placa

### Configurações
- Valores por hora (Carro, Moto, Caminhão)
- Quantidade total de vagas
- Nome do estacionamento
- Exportar/Importar backup
- Limpar histórico / Resetar sistema

## 💾 Armazenamento

O sistema utiliza **LocalStorage** do navegador para armazenar todos os dados. Isso significa que:

- ✅ Os dados persistem mesmo após fechar o navegador
- ✅ Não requer servidor ou banco de dados
- ✅ Funciona offline
- ⚠️ Os dados ficam salvos apenas no navegador/local onde foi utilizado

## 📊 Backup

Para não perder seus dados:

1. Vá em **Configurações**
2. Clique em **📥 Exportar Dados**
3. Salve o arquivo JSON em local seguro

Para restaurar:

1. Vá em **Configurações**
2. Clique em **📤 Importar Dados**
3. Selecione o arquivo JSON de backup

## 👨‍💻 Autor

**Fabricio Sergio**
- GitHub: [@fabriciosergioC](https://github.com/fabriciosergioC)

## 📝 Licença

Este projeto é de uso livre para fins educacionais e comerciais.

---

<div align="center">

**Desenvolvido com ❤️**

</div>
