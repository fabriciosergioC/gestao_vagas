// ==================== LOGIN ====================

let clientes = [];

/**
 * Inicializa a tela de login
 */
async function inicializarLogin() {
  await carregarClientes();
  verificarSessao();
}

/**
 * Verifica se usuário já está logado
 * Se sim, redireciona para o sistema
 */
function verificarSessao() {
  const usuarioSalvo = localStorage.getItem('usuarioAtual');
  const clienteSelecionado = localStorage.getItem('clienteSelecionado');
  
  if (usuarioSalvo && clienteSelecionado) {
    window.location.href = 'index.html';
  }
}

/**
 * Carrega lista de clientes do Supabase
 */
async function carregarClientes() {
  const loadingEl = document.getElementById('loadingClientes');
  const selectEl = document.getElementById('clienteSelect');

  loadingEl.style.display = 'block';
  selectEl.innerHTML = '<option value="">Carregando...</option>';

  // Inicializar Supabase
  const supabaseConectado = await window.supabaseFunctions?.initSupabase();

  if (!supabaseConectado) {
    loadingEl.style.display = 'none';
    selectEl.innerHTML = '<option value="">Erro ao conectar</option>';
    return;
  }

  try {
    // Buscar clientes ativos
    const { data, error } = await window.supabaseClient
      .from('clientes')
      .select('*')
      .eq('ativo', true)
      .order('nome_fantasia');

    if (error) {
      throw error;
    }

    clientes = data || [];
    loadingEl.style.display = 'none';

    if (clientes.length === 0) {
      selectEl.innerHTML = '<option value="">Nenhum cliente cadastrado</option>';
      return;
    }

    // Preencher select
    selectEl.innerHTML = '<option value="">Selecione o cliente...</option>';
    clientes.forEach(cliente => {
      const option = document.createElement('option');
      option.value = cliente.id;
      option.innerText = cliente.nome_fantasia || cliente.razao_social;
      option.dataset.cliente = JSON.stringify(cliente);
      selectEl.appendChild(option);
    });

    // Restaurar cliente selecionado anteriormente
    const clienteSalvo = localStorage.getItem('clienteSelecionado');
    if (clienteSalvo) {
      try {
        const cliente = JSON.parse(clienteSalvo);
        selectEl.value = cliente.id;
      } catch (e) {
        console.error('Erro ao restaurar cliente:', e);
      }
    }

  } catch (err) {
    console.error('Erro ao carregar clientes:', err);
    loadingEl.style.display = 'none';
    
    // Se for erro de tabela não existir, mostrar mensagem amigável
    if (err.message.includes('relation') && err.message.includes('does not exist')) {
      selectEl.innerHTML = '<option value="">⚠️ Execute o schema multi-tenant</option>';
    } else {
      selectEl.innerHTML = '<option value="">Erro ao carregar</option>';
    }
  }
}

/**
 * Faz login do usuário
 */
async function fazerLogin(event) {
  event.preventDefault();

  const usuario = document.getElementById('loginUsuario')?.value || '';
  const senha = document.getElementById('loginSenha')?.value || '';
  const clienteSelect = document.getElementById('clienteSelect');
  const errorMessage = document.getElementById('errorMessage');
  const btnLogin = document.getElementById('btnLogin');
  const loadingMessage = document.getElementById('loadingClientes');

  // Validar cliente selecionado
  const clienteId = clienteSelect.value;
  if (!clienteId) {
    mostrarErro('Selecione um cliente!');
    return;
  }

  const cliente = clientes.find(c => c.id.toString() === clienteId);
  if (!cliente) {
    mostrarErro('Cliente inválido!');
    return;
  }

  if (!usuario || !senha) {
    mostrarErro('Digite usuário e senha!');
    return;
  }

  // Mostrar loading
  btnLogin.disabled = true;
  btnLogin.innerText = '⏳ Entrando...';
  loadingMessage.style.display = 'block';
  errorMessage.style.display = 'none';

  // Inicializar Supabase e definir cliente
  const supabaseConectado = await window.supabaseFunctions?.initSupabase();

  if (supabaseConectado) {
    // Definir cliente atual
    window.supabaseFunctions?.setClienteAtual(cliente.id);
    
    // Armazenar cliente selecionado
    localStorage.setItem('clienteSelecionado', JSON.stringify({
      id: cliente.id,
      nome_fantasia: cliente.nome_fantasia,
      razao_social: cliente.razao_social
    }));

    // Validar no Supabase (apenas no contexto do cliente)
    const usuarioValido = await window.supabaseFunctions.validarUsuario(usuario, senha);

    if (usuarioValido) {
      // Login bem-sucedido
      localStorage.setItem('usuarioAtual', usuario);
      localStorage.setItem('usuarioNome', usuarioValido.nome || usuario);
      localStorage.setItem('clienteAtualId', cliente.id.toString());

      // Carregar dados do sistema
      await window.supabaseFunctions.syncFromSupabase();

      // Redirecionar para o sistema
      window.location.href = 'index.html';
      return;
    }
  }

  // Login falhou
  btnLogin.disabled = false;
  btnLogin.innerText = '🔓 Entrar';
  loadingMessage.style.display = 'none';
  mostrarErro('Usuário ou senha incorretos!');
  document.getElementById('loginSenha').value = '';
  document.getElementById('loginSenha').focus();
}

/**
 * Cadastra novo cliente
 */
async function cadastrarCliente(event) {
  event.preventDefault();

  const errorEl = document.getElementById('modalErrorMessage');
  const successEl = document.getElementById('modalSuccessMessage');
  const btnCadastrar = document.getElementById('btnCadastrar');

  errorEl.style.display = 'none';
  successEl.style.display = 'none';

  const razaoSocial = document.getElementById('razaoSocial').value.trim();
  const nomeFantasia = document.getElementById('nomeFantasia').value.trim();
  const adminUsuario = document.getElementById('adminUsuario').value.trim();
  const adminSenha = document.getElementById('adminSenha').value;

  if (!razaoSocial || !nomeFantasia) {
    errorEl.innerText = '❌ Preencha a razão social e nome fantasia!';
    errorEl.style.display = 'block';
    return;
  }

  if (!adminUsuario || !adminSenha) {
    errorEl.innerText = '❌ Preencha usuário e senha do admin!';
    errorEl.style.display = 'block';
    return;
  }

  // Mostrar loading
  btnCadastrar.disabled = true;
  btnCadastrar.innerText = '⏳ Cadastrando...';

  try {
    // 1. Inserir cliente
    const { data: cliente, error: errorCliente } = await window.supabaseClient
      .from('clientes')
      .insert([{
        razao_social: razaoSocial,
        nome_fantasia: nomeFantasia,
        ativo: true
      }])
      .select()
      .single();

    if (errorCliente) {
      throw errorCliente;
    }

    // 2. Inserir usuário admin
    const { error: errorUsuario } = await window.supabaseClient
      .from('usuarios')
      .insert([{
        cliente_id: cliente.id,
        usuario: adminUsuario,
        senha: adminSenha,
        nome: 'Administrador',
        ativo: true
      }]);

    if (errorUsuario) {
      throw errorUsuario;
    }

    // Sucesso
    successEl.innerHTML = `
      <strong>✅ Cliente cadastrado!</strong><br>
      Redirecionando...
    `;
    successEl.style.display = 'block';

    // Aguardar e recarregar
    setTimeout(() => {
      fecharModalCadastro();
      carregarClientes();
      mostrarSucesso('Cliente cadastrado com sucesso!');
    }, 1500);

  } catch (err) {
    console.error('Erro ao cadastrar cliente:', err);
    errorEl.innerText = '❌ Erro ao cadastrar: ' + err.message;
    errorEl.style.display = 'block';
  } finally {
    btnCadastrar.disabled = false;
    btnCadastrar.innerText = '✅ Cadastrar Cliente';
  }
}

/**
 * Mostra mensagem de erro
 */
function mostrarErro(mensagem) {
  const errorMessage = document.getElementById('errorMessage');
  errorMessage.innerText = '❌ ' + mensagem;
  errorMessage.style.display = 'block';

  setTimeout(() => {
    errorMessage.style.display = 'none';
  }, 5000);
}

/**
 * Mostra mensagem de sucesso
 */
function mostrarSucesso(mensagem) {
  const successMessage = document.getElementById('successMessage');
  successMessage.innerText = '✅ ' + mensagem;
  successMessage.style.display = 'block';

  setTimeout(() => {
    successMessage.style.display = 'none';
  }, 5000);
}

/**
 * Fazer logout (se chamado de outra página)
 */
function fazerLogout() {
  if (confirm('Deseja realmente sair?')) {
    localStorage.removeItem('usuarioAtual');
    localStorage.removeItem('usuarioNome');
    localStorage.removeItem('clienteSelecionado');
    localStorage.removeItem('clienteAtualId');
    window.location.href = 'login.html';
  }
}

// ==================== INICIALIZAÇÃO ====================

document.addEventListener('DOMContentLoaded', () => {
  inicializarLogin();
});
