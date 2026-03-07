// ==================== DADOS ====================
let veiculosNoPatio = [];
let historico = [];
let configuracoes = {
  valorHoraCarro: 10.00,
  valorHoraMoto: 5.00,
  valorHoraCaminhao: 20.00,
  totalVagas: 20,
  nomeEstacionamento: "Estacionamento Central"
};

// ==================== INICIALIZAÇÃO DO SISTEMA ====================

/**
 * Inicializa o sistema carregando dados do Supabase ou localStorage
 */
async function inicializarSistema() {
  // Tentar conectar no Supabase primeiro
  const supabaseConectado = await window.supabaseFunctions?.initSupabase();
  
  if (supabaseConectado) {
    // Verificar se já existe cliente selecionado
    const clienteSalvo = localStorage.getItem('clienteAtual');
    if (clienteSalvo) {
      const cliente = JSON.parse(clienteSalvo);
      window.supabaseFunctions?.setClienteAtual(cliente);
      console.log(`🏢 Cliente selecionado: ${cliente.nome_fantasia}`);
    }
    
    // Sincronizar dados do Supabase
    const sincronizado = await window.supabaseFunctions.syncFromSupabase();
    if (sincronizado) {
      carregarDadosLocais();
      console.log('📊 Dados carregados do Supabase');
    } else {
      carregarDadosLocais();
      console.log('⚠️ Usando dados locais (fallback)');
    }
  } else {
    // Fallback para localStorage
    carregarDadosLocais();
    console.log('📊 Dados carregados do localStorage');
  }
  
  // Iniciar sistema de login
  verificarLogin();
}

/**
 * Carrega dados do localStorage
 */
function carregarDadosLocais() {
  veiculosNoPatio = JSON.parse(localStorage.getItem("veiculosNoPatio")) || [];
  historico = JSON.parse(localStorage.getItem("historico")) || [];
  configuracoes = JSON.parse(localStorage.getItem("configuracoes")) || {
    valorHoraCarro: 10.00,
    valorHoraMoto: 5.00,
    valorHoraCaminhao: 20.00,
    totalVagas: 20,
    nomeEstacionamento: "Estacionamento Central"
  };
}

// ==================== SISTEMA DE LOGIN ====================
let usuarioAtual = localStorage.getItem("usuarioAtual") || null;
const SENHA_PADRAO = "admin";

function getUsuarios() {
  return JSON.parse(localStorage.getItem("usuarios")) || [];
}

function saveUsuarios(usuarios) {
  localStorage.setItem("usuarios", JSON.stringify(usuarios));
}

/**
 * Verifica o estado do login e exibe a tela apropriada
 */
async function verificarLogin() {
  // Se já estiver logado, mostra o sistema
  if (usuarioAtual) {
    mostrarSistema();
    return;
  }
  
  // Se tiver Supabase conectado, mostra seleção de clientes
  if (window.supabaseFunctions?.isSupabaseAvailable()) {
    mostrarSelecaoCliente();
  } else {
    // Sem Supabase, login direto
    mostrarLogin();
  }
}

/**
 * Mostra a tela de seleção de clientes
 */
async function mostrarSelecaoCliente() {
  document.getElementById('clienteScreen').style.display = 'flex';
  document.getElementById('loginScreen').style.display = 'none';
  document.getElementById('sidebar').style.display = 'none';
  document.getElementById('mainContent').style.display = 'none';
  
  // Carregar lista de clientes
  carregarListaClientes();
}

/**
 * Carrega a lista de clientes do Supabase
 */
async function carregarListaClientes() {
  const listaDiv = document.getElementById('listaClientes');
  
  try {
    const clientes = await window.supabaseFunctions?.fetchClientes();
    
    if (clientes && clientes.length > 0) {
      listaDiv.innerHTML = clientes.map(cliente => `
        <div class="cliente-item" onclick="selecionarCliente(${cliente.id}, '${cliente.nome_fantasia}')" 
             style="background: #3498db; padding: 15px; margin-bottom: 10px; border-radius: 8px; cursor: pointer; color: #fff; transition: transform 0.2s;"
             onmouseover="this.style.transform='scale(1.02)'" 
             onmouseout="this.style.transform='scale(1)'">
          <h3 style="margin: 0 0 5px 0;">🏢 ${cliente.nome_fantasia || cliente.razao_social}</h3>
          <p style="margin: 0; font-size: 12px; opacity: 0.9;">${cliente.cnpj || ''} | ${cliente.email || ''}</p>
        </div>
      `).join('');
    } else {
      listaDiv.innerHTML = '<p style="color: #fff; text-align: center;">Nenhum cliente cadastrado</p>';
    }
  } catch (err) {
    listaDiv.innerHTML = '<p style="color: #fff; text-align: center;">Erro ao carregar clientes</p>';
    console.error('Erro ao carregar clientes:', err);
  }
}

/**
 * Seleciona um cliente e vai para o login
 */
function selecionarCliente(clienteId, clienteNome) {
  const cliente = { id: clienteId, nome_fantasia: clienteNome };
  window.supabaseFunctions?.setClienteAtual(cliente);
  localStorage.setItem('clienteAtual', JSON.stringify(cliente));
  
  document.getElementById('nomeClienteLogin').innerText = `🏢 ${clienteNome}`;
  document.getElementById('clienteScreen').style.display = 'none';
  mostrarLogin();
}

/**
 * Mostra a tela de cadastro de cliente
 */
function mostrarCadastroCliente() {
  document.getElementById('modalCadastroCliente').style.display = 'flex';
}

/**
 * Fecha a tela de cadastro de cliente
 */
function fecharCadastroCliente() {
  document.getElementById('modalCadastroCliente').style.display = 'none';
}

/**
 * Cadastra um novo cliente
 */
async function cadastrarCliente(event) {
  event.preventDefault();
  
  const cliente = {
    razao_social: document.getElementById('cadastroRazaoSocial').value,
    nome_fantasia: document.getElementById('cadastroNomeFantasia').value || document.getElementById('cadastroRazaoSocial').value,
    cnpj: document.getElementById('cadastroCNPJ').value,
    email: document.getElementById('cadastroEmail').value,
    telefone: document.getElementById('cadastroTelefone').value,
    usuario_admin: document.getElementById('cadastroUsuario').value,
    senha_admin: document.getElementById('cadastroSenha').value
  };
  
  const resultado = await window.supabaseFunctions?.createCliente(cliente);
  
  if (resultado) {
    alert('✅ Cliente cadastrado com sucesso!');
    fecharCadastroCliente();
    document.getElementById('cadastroClienteForm').reset();
    carregarListaClientes();
  } else {
    alert('❌ Erro ao cadastrar cliente. Verifique o console.');
  }
}

function mostrarLogin() {
  document.getElementById('loginScreen').style.display = 'flex';
  document.getElementById('clienteScreen').style.display = 'none';
  document.getElementById('sidebar').style.display = 'none';
  document.getElementById('mainContent').style.display = 'none';
  document.getElementById('loginSenha').value = '';
  document.getElementById('loginSenha').focus();
  
  // Atualizar nome do cliente se existir
  const clienteAtual = window.supabaseFunctions?.getClienteAtual();
  if (clienteAtual) {
    document.getElementById('nomeClienteLogin').innerText = `🏢 ${clienteAtual.nome_fantasia}`;
  }
}

function mostrarSistema() {
  document.getElementById('loginScreen').style.display = 'none';
  document.getElementById('sidebar').style.display = 'block';
  document.getElementById('mainContent').style.display = 'block';
  document.getElementById('usuarioLogado').innerText = "Administrador";
  renderAll();
}

/**
 * Faz login do usuário
 */
async function fazerLogin(event) {
  event.preventDefault();

  const usuario = document.getElementById('loginUsuario')?.value || 'admin';
  const senha = document.getElementById('loginSenha').value;

  if (!senha) {
    alert('Digite a senha!');
    return;
  }

  // Se tiver Supabase, valida usuário no banco
  if (window.supabaseFunctions?.isSupabaseAvailable()) {
    try {
      const usuarios = await window.supabaseFunctions.fetchUsuarios();
      const usuarioValido = usuarios?.find(u => u.usuario === usuario && u.senha === senha && u.ativo !== false);
      
      if (usuarioValido) {
        usuarioAtual = usuario;
        localStorage.setItem("usuarioAtual", usuarioAtual);
        mostrarSistema();
        return;
      }
    } catch (err) {
      console.error('Erro ao validar usuário:', err);
    }
  }

  // Fallback: senha padrão admin
  if (usuario === 'admin' && senha === SENHA_PADRAO) {
    usuarioAtual = 'admin';
    localStorage.setItem("usuarioAtual", usuarioAtual);
    mostrarSistema();
    return;
  }

  alert('Usuário ou senha incorretos!');
  document.getElementById('loginSenha').value = '';
  document.getElementById('loginSenha').focus();
}

function fazerLogout() {
  if (confirm('Deseja realmente sair do sistema?')) {
    usuarioAtual = null;
    localStorage.removeItem("usuarioAtual");
    // Manter cliente selecionado para próximo login
    mostrarLogin();
  }
}

function mostrarTrocaSenha() {
  document.getElementById('modalTrocaSenha').style.display = 'flex';
  document.getElementById('novaSenha').value = '';
  document.getElementById('confirmarNovaSenha').value = '';
  document.getElementById('novaSenha').focus();
}

function fecharTrocaSenha() {
  // Não permite fechar sem trocar a senha
  alert('É necessário trocar a senha para continuar!');
}

function abrirTrocaSenha() {
  document.getElementById('modalTrocaSenha').style.display = 'flex';
  document.getElementById('novaSenha').value = '';
  document.getElementById('confirmarNovaSenha').value = '';
  document.getElementById('novaSenha').focus();
}

function trocarSenha(event) {
  event.preventDefault();
  
  const novaSenha = document.getElementById('novaSenha').value;
  const confirmarSenha = document.getElementById('confirmarNovaSenha').value;
  
  if (!novaSenha || !confirmarSenha) {
    alert('Preencha todos os campos!');
    return;
  }
  
  if (novaSenha.length < 4) {
    alert('A senha deve ter pelo menos 4 caracteres!');
    return;
  }
  
  if (novaSenha === SENHA_PADRAO) {
    alert('A nova senha não pode ser igual à senha padrão!');
    return;
  }
  
  if (novaSenha !== confirmarSenha) {
    alert('As senhas não coincidem!');
    return;
  }
  
  // Atualizar senha do usuário atual
  const usuarios = getUsuarios();
  const index = usuarios.findIndex(u => u.usuario === usuarioAtual);
  
  if (index !== -1) {
    usuarios[index].senha = novaSenha;
    saveUsuarios(usuarios);
    
    alert('Senha trocada com sucesso!');
    document.getElementById('modalTrocaSenha').style.display = 'none';
    mostrarSistema();
  } else {
    alert('Erro ao trocar senha. Tente novamente.');
  }
}

/**
 * Salva dados no localStorage e sincroniza com Supabase (se disponível)
 */
async function saveStorage() {
  localStorage.setItem("veiculosNoPatio", JSON.stringify(veiculosNoPatio));
  localStorage.setItem("historico", JSON.stringify(historico));
  localStorage.setItem("configuracoes", JSON.stringify(configuracoes));
  
  // Sincronizar com Supabase em background (não bloqueante)
  if (window.supabaseFunctions?.isSupabaseAvailable()) {
    // Usar setTimeout para não bloquear a UI
    setTimeout(async () => {
      try {
        const sucesso = await window.supabaseFunctions.syncToSupabase();
        if (sucesso) {
          console.log('✅ Dados salvos no Supabase');
        }
      } catch (err) {
        console.error('Erro ao sincronizar com Supabase:', err);
      }
    }, 100);
  }
}

// ==================== NAVEGAÇÃO ====================
function showSection(sectionId) {
  document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.menu-btn').forEach(b => b.classList.remove('active'));

  document.getElementById(sectionId).classList.add('active');

  const btn = document.querySelector(`.menu-btn[onclick="showSection('${sectionId}')"]`);
  if (btn) {
    btn.classList.add('active');
  }

  renderAll();

  if (sectionId === 'entrada') {
    document.getElementById('veiculoPlaca')?.focus();
  }
}

// ==================== UTILITÁRIOS ====================
function formatarPlaca(placa) {
  return placa.toUpperCase().replace(/[^A-Z0-9]/g, '');
}

function formatarMoeda(valor) {
  return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function formatarData(dataISO) {
  const data = new Date(dataISO);
  return data.toLocaleDateString('pt-BR') + ' ' + data.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

function calcularTempoPermanencia(entradaISO) {
  const entrada = new Date(entradaISO);
  const agora = new Date();
  const diffMs = agora - entrada;
  const diffHoras = Math.floor(diffMs / (1000 * 60 * 60));
  const diffMinutos = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  
  if (diffHoras > 0) {
    return `${diffHoras}h ${diffMinutos}min`;
  }
  return `${diffMinutos}min`;
}

function getTipoIcone(tipo) {
  const icones = {
    'carro': '🚗',
    'moto': '🏍️',
    'caminhao': '🚚'
  };
  return icones[tipo] || '🚗';
}

// ==================== MARCAS E MODELOS ====================
const marcasModelos = {
  'Chevrolet': ['Onix', 'Prisma', 'Cruze', 'Tracker', 'Equinox', 'S10', 'Trailblazer', 'Spin', 'Cobalt', 'Joy', 'Montana', 'Blazer'],
  'Volkswagen': ['Gol', 'Polo', 'Virtus', 'T-Cross', 'Nivus', 'Taos', 'Tiguan', 'Amarok', 'Saveiro', 'Voyage', 'Fox', 'Up!'],
  'Fiat': ['Uno', 'Mobi', 'Argo', 'Cronos', 'Pulse', 'Fastback', 'Toro', 'Strada', 'Fiorino', 'Ducato', '500'],
  'Ford': ['Ka', 'Focus', 'Fusion', 'EcoSport', 'Edge', 'Ranger', 'F-150', 'Mustang', 'Bronco'],
  'Toyota': ['Yaris', 'Corolla', 'Corolla Cross', 'RAV4', 'SW4', 'Hilux', 'Land Cruiser', 'Prius'],
  'Honda': ['Fit', 'City', 'Civic', 'HR-V', 'WR-V', 'CR-V', 'Accord', 'Pilot'],
  'Hyundai': ['HB20', 'Creta', 'Azera', 'Sonata', 'Santa Fe', 'Tucson', 'ix35', 'Elantra'],
  'Nissan': ['March', 'Versa', 'Kicks', 'Sentra', 'Altima', 'Frontier', 'X-Trail'],
  'Renault': ['Kwid', 'Sandero', 'Logan', 'Duster', 'Captur', 'Oroch', 'Koleos', 'Megane'],
  'Peugeot': ['208', '2008', '3008', '408', '508', 'Partner', 'Expert'],
  'Citroën': ['C3', 'C4 Cactus', 'C4 Lounge', 'C5 Aircross', 'Berlingo', 'Jumpy'],
  'Jeep': ['Renegade', 'Compass', 'Commander', 'Cherokee', 'Grand Cherokee', 'Wrangler'],
  'BMW': ['Série 1', 'Série 3', 'Série 5', 'X1', 'X3', 'X5', 'X6', 'Z4'],
  'Mercedes': ['Classe A', 'Classe C', 'Classe E', 'GLA', 'GLC', 'GLE', 'GLS'],
  'Audi': ['A3', 'A4', 'A5', 'A6', 'Q3', 'Q5', 'Q7', 'Q8', 'TT'],
  'Mitsubishi': ['Lancer', 'Outlander', 'Pajero', 'ASX', 'L200'],
  'Kia': ['Rio', 'Cerato', 'Sportage', 'Sorento', 'Picanto', 'Seltos']
};

function atualizarModelos() {
  const marca = document.getElementById('veiculoMarca').value;
  const selectModelo = document.getElementById('veiculoModelo');
  const inputOutro = document.getElementById('veiculoModeloOutro');
  
  selectModelo.innerHTML = '<option value="">Selecione o modelo...</option>';
  
  if (marca === 'Outra') {
    selectModelo.style.display = 'none';
    inputOutro.style.display = 'block';
    inputOutro.focus();
    return;
  }
  
  selectModelo.style.display = 'block';
  inputOutro.style.display = 'none';
  inputOutro.value = '';
  
  if (marca && marcasModelos[marca]) {
    marcasModelos[marca].forEach(modelo => {
      const option = document.createElement('option');
      option.value = modelo;
      option.innerText = modelo;
      selectModelo.appendChild(option);
    });
  }
}

function preencherModeloOutro() {
  const modelo = document.getElementById('veiculoModelo').value;
  const inputOutro = document.getElementById('veiculoModeloOutro');
  
  if (modelo !== 'Outro') {
    inputOutro.style.display = 'none';
    inputOutro.value = '';
  }
}

function getModeloSelecionado() {
  const marca = document.getElementById('veiculoMarca').value;
  
  if (marca === 'Outra') {
    return document.getElementById('veiculoModeloOutro').value.trim() || 'Outra';
  }
  
  return document.getElementById('veiculoModelo').value;
}

// ==================== VAGAS ====================
function gerarVagas() {
  const vagas = [];
  for (let i = 1; i <= configuracoes.totalVagas; i++) {
    const veiculo = veiculosNoPatio.find(v => v.vaga === i.toString());
    vagas.push({
      numero: i.toString(),
      ocupada: !!veiculo,
      veiculo: veiculo
    });
  }
  return vagas;
}

function renderVagas() {
  const container = document.getElementById('vagasContainer');
  const vagaSelecionada = document.getElementById('veiculoVaga')?.value;
  
  if (!container) {
    console.error('Container de vagas não encontrado!');
    return;
  }

  container.innerHTML = '';
  const vagas = gerarVagas();

  if (vagas.length === 0) {
    container.innerHTML = '<p style="color: #fff; grid-column: 1/-1; text-align: center;">Nenhuma vaga configurada!</p>';
    return;
  }

  vagas.forEach(vaga => {
    const div = document.createElement('div');
    div.className = `vaga-card ${vaga.ocupada ? 'ocupada' : 'livre'} ${vaga.numero === vagaSelecionada ? 'selecionada' : ''}`;
    
    if (vaga.ocupada) {
      div.title = `Ocupada por ${vaga.veiculo.placa}`;
    } else {
      div.title = `Vaga ${vaga.numero} - Livre`;
      div.onclick = () => selecionarVaga(vaga.numero);
    }
    
    div.innerHTML = `
      <div class="vaga-numero">${vaga.numero}</div>
      <div class="vaga-status">${vaga.ocupada ? 'Ocupada' : 'Livre'}</div>
      ${vaga.ocupada ? `<div class="vaga-placa">${vaga.veiculo.placa}</div>` : ''}
    `;
    container.appendChild(div);
  });
}

function selecionarVaga(numero) {
  const vagaElement = document.getElementById('veiculoVaga');
  const vagaAtual = vagaElement?.value;
  
  // Se clicar na mesma vaga, desseleciona
  if (vagaAtual === numero) {
    vagaElement.value = '';
  } else {
    vagaElement.value = numero;
  }
  
  renderVagas();
}

// ==================== ENTRADA ====================
function registrarEntrada() {
  const placa = formatarPlaca(document.getElementById('veiculoPlaca').value);
  const marca = document.getElementById('veiculoMarca').value;
  const modelo = getModeloSelecionado();
  const cor = document.getElementById('veiculoCor').value.trim();
  const tipo = document.getElementById('veiculoTipo').value;
  const proprietario = document.getElementById('veiculoProprietario').value.trim();
  const telefone = document.getElementById('veiculoTelefone').value.trim();
  const vagaElement = document.getElementById('veiculoVaga');
  const vaga = vagaElement ? vagaElement.value.trim() : '';

  if (!placa) {
    alert("Informe a placa do veículo!");
    return;
  }

  if (!marca) {
    alert("Selecione a marca do veículo!");
    return;
  }

  if (!modelo) {
    alert("Selecione o modelo do veículo!");
    return;
  }

  if (!vaga) {
    alert("Selecione uma vaga!");
    return;
  }

  // Verificar se placa já está no pátio (se foi preenchida)
  if (placa) {
    const existente = veiculosNoPatio.find(v => v.placa === placa);
    if (existente) {
      alert(`Veículo ${placa} já está estacionado na vaga ${existente.vaga}!`);
      return;
    }
  }

  // Verificar se vaga está ocupada
  const vagaOcupada = veiculosNoPatio.find(v => v.vaga === vaga);
  if (vagaOcupada) {
    alert(`Vaga ${vaga} já está ocupada por ${vagaOcupada.placa}!`);
    return;
  }

  const veiculo = {
    id: Date.now(),
    placa: placa || 'N/A',
    marca: marca || 'N/A',
    modelo: modelo || 'N/A',
    cor,
    tipo,
    proprietario,
    telefone,
    vaga,
    entrada: new Date().toISOString()
  };

  veiculosNoPatio.push(veiculo);
  saveStorage();
  
  limparFormEntrada();
  renderAll();
  
  const veiculoInfo = placa ? `${marca} ${modelo} - ${placa}` : `${marca} ${modelo}`;
  alert(`Entrada registrada com sucesso!\nVeículo: ${veiculoInfo}\nVaga: ${vaga}`);
}

function limparFormEntrada() {
  document.getElementById('veiculoPlaca').value = '';
  document.getElementById('veiculoMarca').value = '';
  document.getElementById('veiculoModelo').innerHTML = '<option value="">Selecione a marca primeiro...</option>';
  document.getElementById('veiculoModelo').style.display = 'block';
  document.getElementById('veiculoModeloOutro').value = '';
  document.getElementById('veiculoModeloOutro').style.display = 'none';
  document.getElementById('veiculoCor').value = '';
  document.getElementById('veiculoProprietario').value = '';
  document.getElementById('veiculoTelefone').value = '';
  document.getElementById('veiculoVaga').value = '';
}

// ==================== PÁTIO ====================
function renderPatio() {
  const tbody = document.getElementById('tabelaPatio')?.querySelector('tbody');
  if (!tbody) return;
  
  tbody.innerHTML = '';
  
  const busca = document.getElementById('buscaPatio')?.value.toLowerCase() || '';
  const filtroTipo = document.getElementById('filtroTipoPatio')?.value || '';
  
  const filtrados = veiculosNoPatio.filter(v => {
    const matchBusca = v.placa.toLowerCase().includes(busca) || 
                       v.modelo.toLowerCase().includes(busca) ||
                       (v.marca && v.marca.toLowerCase().includes(busca));
    const matchTipo = !filtroTipo || v.tipo === filtroTipo;
    return matchBusca && matchTipo;
  });
  
  filtrados.forEach(v => {
    const tr = document.createElement('tr');
    const tempo = calcularTempoPermanencia(v.entrada);
    const marcaModelo = v.marca ? `${v.marca} ${v.modelo}` : v.modelo;
    tr.innerHTML = `
      <td><strong>${v.placa}</strong></td>
      <td>${marcaModelo}</td>
      <td>${v.cor}</td>
      <td>${getTipoIcone(v.tipo)} ${v.tipo}</td>
      <td>${v.vaga}</td>
      <td>${formatarData(v.entrada)}</td>
      <td>${tempo}</td>
      <td>
        <button class="btn-info" onclick="iniciarSaida('${v.placa}')" style="padding:4px 8px;font-size:11px;">💰 Saída</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
  
  // Atualizar stats
  document.getElementById('statTotalVeiculos').innerText = veiculosNoPatio.length;
  document.getElementById('statVagasOcupadas').innerText = veiculosNoPatio.length;
  document.getElementById('statVagasLivres').innerText = configuracoes.totalVagas - veiculosNoPatio.length;
}

// ==================== SAÍDA ====================
let veiculoSaida = null;

function buscarVeiculoSaida() {
  const busca = document.getElementById('buscaSaida')?.value.trim() || '';
  const resultado = document.getElementById('resultadoBusca');
  const areaPagamento = document.getElementById('areaPagamento');
  
  if (busca.length < 1) {
    resultado.innerHTML = '';
    areaPagamento.style.display = 'none';
    return;
  }
  
  const buscaUpper = busca.toUpperCase();
  const veiculo = veiculosNoPatio.find(v => 
    v.placa.includes(buscaUpper) || 
    v.modelo.toLowerCase().includes(busca.toLowerCase()) ||
    (v.marca && v.marca.toLowerCase().includes(busca.toLowerCase()))
  );
  
  if (!veiculo) {
    resultado.innerHTML = '<div class="card" style="background: #fff5f5; border-left-color: #e74c3c;">Veículo não encontrado no pátio!</div>';
    areaPagamento.style.display = 'none';
    return;
  }
  
  veiculoSaida = veiculo;
  resultado.innerHTML = '';
  areaPagamento.style.display = 'block';
  
  const marcaModelo = veiculo.marca ? `${veiculo.marca} ${veiculo.modelo}` : veiculo.modelo;
  
  // Preencher dados
  document.getElementById('infoPlaca').innerText = veiculo.placa;
  document.getElementById('infoModelo').innerText = marcaModelo;
  document.getElementById('infoCor').innerText = veiculo.cor;
  document.getElementById('infoTipo').innerText = getTipoIcone(veiculo.tipo) + ' ' + veiculo.tipo;
  document.getElementById('infoVaga').innerText = veiculo.vaga;
  
  // Calcular valor
  calcularValorSaida(veiculo);
}

function calcularValorSaida(veiculo) {
  const entrada = new Date(veiculo.entrada);
  const saida = new Date();
  
  // Calcular diferença em horas (mínimo 1 hora)
  let diffHoras = (saida - entrada) / (1000 * 60 * 60);
  if (diffHoras < 1) diffHoras = 1;
  diffHoras = Math.ceil(diffHoras);
  
  // Pegar valor por hora baseado no tipo
  let valorHora;
  switch(veiculo.tipo) {
    case 'moto': valorHora = configuracoes.valorHoraMoto; break;
    case 'caminhao': valorHora = configuracoes.valorHoraCaminhao; break;
    default: valorHora = configuracoes.valorHoraCarro;
  }
  
  const total = diffHoras * valorHora;
  
  document.getElementById('calcEntrada').innerText = formatarData(veiculo.entrada);
  document.getElementById('calcSaida').innerText = formatarData(new Date().toISOString());
  document.getElementById('calcTempo').innerText = calcularTempoPermanencia(veiculo.entrada);
  document.getElementById('calcValorHora').innerText = formatarMoeda(valorHora) + '/hora';
  document.getElementById('calcTotal').innerText = formatarMoeda(total);
  
  veiculoSaida.valorTotal = total;
  veiculoSaida.valorHora = valorHora;
  veiculoSaida.horasCobradas = diffHoras;
}

function confirmarSaida() {
  if (!veiculoSaida) return;
  
  const formaPagamento = document.getElementById('formaPagamento').value;
  
  // Adicionar ao histórico
  const registro = {
    ...veiculoSaida,
    saida: new Date().toISOString(),
    formaPagamento,
    valorCobrado: veiculoSaida.valorTotal
  };
  
  historico.push(registro);
  
  // Remover do pátio
  veiculosNoPatio = veiculosNoPatio.filter(v => v.id !== veiculoSaida.id);
  
  saveStorage();
  
  alert(`Saída confirmada!\nValor recebido: ${formatarMoeda(veiculoSaida.valorTotal)}\nForma de pagamento: ${formaPagamento}`);
  
  cancelarSaida();
  renderAll();
}

function cancelarSaida() {
  veiculoSaida = null;
  document.getElementById('buscaSaida').value = '';
  document.getElementById('resultadoBusca').innerHTML = '';
  document.getElementById('areaPagamento').style.display = 'none';
}

function iniciarSaida(placa) {
  showSection('saida');
  document.getElementById('buscaSaida').value = placa;
  buscarVeiculoSaida();
}

// ==================== HISTÓRICO ====================
function renderHistorico() {
  const tbody = document.getElementById('tabelaHistorico')?.querySelector('tbody');
  if (!tbody) return;
  
  tbody.innerHTML = '';
  
  const dataInicio = document.getElementById('dataInicio')?.value;
  const dataFim = document.getElementById('dataFim')?.value;
  const busca = document.getElementById('buscaHistorico')?.value.toLowerCase() || '';
  
  let filtrados = historico;
  
  if (dataInicio) {
    filtrados = filtrados.filter(h => new Date(h.saida) >= new Date(dataInicio));
  }
  if (dataFim) {
    filtrados = filtrados.filter(h => new Date(h.saida) <= new Date(new Date(dataFim).setHours(23, 59, 59)));
  }
  if (busca) {
    filtrados = filtrados.filter(h => 
      h.placa.toLowerCase().includes(busca) ||
      h.modelo.toLowerCase().includes(busca) ||
      (h.marca && h.marca.toLowerCase().includes(busca)) ||
      (h.proprietario && h.proprietario.toLowerCase().includes(busca)) ||
      (h.telefone && h.telefone.includes(busca))
    );
  }
  
  // Ordenar por data de saída (mais recente primeiro)
  filtrados.sort((a, b) => new Date(b.saida) - new Date(a.saida));
  
  filtrados.forEach(h => {
    const tr = document.createElement('tr');
    const tempo = calcularTempoPermanencia(h.entrada);
    const pagIcones = {
      'dinheiro': '💵',
      'pix': '📱',
      'cartao': '💳'
    };
    const marcaModelo = h.marca ? `${h.marca} ${h.modelo}` : h.modelo;
    tr.innerHTML = `
      <td><strong>${h.placa}</strong></td>
      <td>${marcaModelo}</td>
      <td>${h.proprietario || '-'}</td>
      <td>${h.telefone || '-'}</td>
      <td>${getTipoIcone(h.tipo)}</td>
      <td>${formatarData(h.entrada)}</td>
      <td>${formatarData(h.saida)}</td>
      <td>${tempo}</td>
      <td>${formatarMoeda(h.valorCobrado)}</td>
      <td>${pagIcones[h.formaPagamento] || h.formaPagamento}</td>
    `;
    tbody.appendChild(tr);
  });
  
  // Atualizar stats
  const totalSaidas = filtrados.length;
  const faturamento = filtrados.reduce((acc, h) => acc + (h.valorCobrado || 0), 0);
  const ticketMedio = totalSaidas > 0 ? faturamento / totalSaidas : 0;
  
  document.getElementById('statTotalSaidas').innerText = totalSaidas;
  document.getElementById('statFaturamento').innerText = formatarMoeda(faturamento);
  document.getElementById('statTicketMedio').innerText = formatarMoeda(ticketMedio);
}

// ==================== CONFIGURAÇÕES ====================
function carregarConfiguracoes() {
  document.getElementById('valorHoraCarro').value = configuracoes.valorHoraCarro;
  document.getElementById('valorHoraMoto').value = configuracoes.valorHoraMoto;
  document.getElementById('valorHoraCaminhao').value = configuracoes.valorHoraCaminhao;
  document.getElementById('totalVagas').value = configuracoes.totalVagas;
  document.getElementById('nomeEstacionamento').value = configuracoes.nomeEstacionamento;
}

function salvarValores() {
  configuracoes.valorHoraCarro = parseFloat(document.getElementById('valorHoraCarro').value) || 10;
  configuracoes.valorHoraMoto = parseFloat(document.getElementById('valorHoraMoto').value) || 5;
  configuracoes.valorHoraCaminhao = parseFloat(document.getElementById('valorHoraCaminhao').value) || 20;
  
  saveStorage();
  alert('Valores salvos com sucesso!');
}

function salvarVagas() {
  configuracoes.totalVagas = parseInt(document.getElementById('totalVagas').value) || 20;
  
  saveStorage();
  alert('Quantidade de vagas salva com sucesso!');
  renderVagas();
}

function salvarNomeEstacionamento() {
  configuracoes.nomeEstacionamento = document.getElementById('nomeEstacionamento').value.trim() || 'Estacionamento Central';
  
  saveStorage();
  document.querySelector('.sidebar h2').innerText = '🅿️ ' + configuracoes.nomeEstacionamento;
  alert('Nome salvo com sucesso!');
}

function limparHistorico() {
  if (confirm('Tem certeza que deseja limpar todo o histórico?')) {
    historico = [];
    saveStorage();
    renderHistorico();
    alert('Histórico limpo com sucesso!');
  }
}

function resetarSistema() {
  if (confirm('ATENÇÃO: Isso apagará TODOS os dados do sistema!\n\nVeículos no pátio e histórico serão perdidos.\n\nTem certeza?')) {
    veiculosNoPatio = [];
    historico = [];
    saveStorage();
    renderAll();
    alert('Sistema resetado com sucesso!');
  }
}

function exportarDados() {
  const dados = {
    veiculosNoPatio,
    historico,
    configuracoes,
    dataExportacao: new Date().toISOString()
  };
  
  const blob = new Blob([JSON.stringify(dados, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `backup-estacionamento-${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

function importarDados(input) {
  const file = input.files[0];
  if (!file) return;
  
  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const dados = JSON.parse(e.target.result);
      
      if (confirm('Isso substituirá todos os dados atuais. Continuar?')) {
        veiculosNoPatio = dados.veiculosNoPatio || [];
        historico = dados.historico || [];
        if (dados.configuracoes) {
          configuracoes = dados.configuracoes;
        }
        saveStorage();
        renderAll();
        alert('Dados importados com sucesso!');
      }
    } catch (err) {
      alert('Erro ao importar dados. Verifique o arquivo.');
    }
  };
  reader.readAsText(file);
}

// ==================== RELATÓRIOS ====================
let relatorioEntradas = [];
let relatorioEntradasSaidas = [];

function mostrarSubRelatorio(tipo) {
  const subEntradas = document.getElementById('subRelatorioEntradas');
  const subEntradasSaidas = document.getElementById('subRelatorioEntradasSaidas');
  const subFaturamento = document.getElementById('subRelatorioFaturamento');
  const subVagas = document.getElementById('subRelatorioVagas');
  const btnEntradas = document.getElementById('btnRelatorioEntradas');
  const btnEntradasSaidas = document.getElementById('btnRelatorioEntradasSaidas');
  const btnFaturamento = document.getElementById('btnRelatorioFaturamento');
  const btnVagas = document.getElementById('btnRelatorioVagas');

  // Resetar todos os botões
  btnEntradas.classList.remove('btn-primary');
  btnEntradas.classList.add('btn-info');
  btnEntradasSaidas.classList.remove('btn-primary');
  btnEntradasSaidas.classList.add('btn-info');
  btnFaturamento.classList.remove('btn-primary');
  btnFaturamento.classList.add('btn-info');
  btnVagas.classList.remove('btn-primary');
  btnVagas.classList.add('btn-info');

  // Esconder todas as seções
  subEntradas.style.display = 'none';
  subEntradasSaidas.style.display = 'none';
  subFaturamento.style.display = 'none';
  subVagas.style.display = 'none';

  // Mostrar seção selecionada e ativar botão
  if (tipo === 'entradas') {
    subEntradas.style.display = 'block';
    btnEntradas.classList.remove('btn-info');
    btnEntradas.classList.add('btn-primary');
  } else if (tipo === 'entradas-saidas') {
    subEntradasSaidas.style.display = 'block';
    btnEntradasSaidas.classList.remove('btn-info');
    btnEntradasSaidas.classList.add('btn-primary');
  } else if (tipo === 'faturamento') {
    subFaturamento.style.display = 'block';
    btnFaturamento.classList.remove('btn-info');
    btnFaturamento.classList.add('btn-primary');
  } else if (tipo === 'vagas') {
    subVagas.style.display = 'block';
    btnVagas.classList.remove('btn-info');
    btnVagas.classList.add('btn-primary');
    renderRelatorioVagas();
  }
}

function gerarRelatorioEntradas() {
  const dataInicio = document.getElementById('relDataInicio')?.value;
  const dataFim = document.getElementById('relDataFim')?.value;
  const tipoVeiculo = document.getElementById('relTipoVeiculo')?.value || '';
  const busca = document.getElementById('relBusca')?.value.toLowerCase() || '';

  // Combinar veículos no pátio e histórico para ter todas as entradas
  const todasEntradas = [...veiculosNoPatio, ...historico];

  // Filtrar entradas
  relatorioEntradas = todasEntradas.filter(v => {
    // Filtro por data
    if (dataInicio && new Date(v.entrada) < new Date(dataInicio)) {
      return false;
    }
    if (dataFim && new Date(v.entrada) > new Date(new Date(dataFim).setHours(23, 59, 59))) {
      return false;
    }
    // Filtro por tipo
    if (tipoVeiculo && v.tipo !== tipoVeiculo) {
      return false;
    }
    // Filtro por busca
    if (busca) {
      const matchPlaca = v.placa.toLowerCase().includes(busca);
      const matchModelo = v.modelo.toLowerCase().includes(busca);
      const matchMarca = v.marca && v.marca.toLowerCase().includes(busca);
      if (!matchPlaca && !matchModelo && !matchMarca) {
        return false;
      }
    }
    return true;
  });

  // Ordenar por data de entrada (mais recente primeiro)
  relatorioEntradas.sort((a, b) => new Date(b.entrada) - new Date(a.entrada));

  renderRelatorio();
}

function renderRelatorio() {
  const tbody = document.getElementById('tabelaRelatorio')?.querySelector('tbody');
  if (!tbody) return;

  tbody.innerHTML = '';

  relatorioEntradas.forEach(v => {
    const tr = document.createElement('tr');
    const marcaModelo = v.marca ? `${v.marca} ${v.modelo}` : v.modelo;
    
    // Verificar se está no pátio ou já saiu
    const noPatio = veiculosNoPatio.some(veic => veic.id === v.id);
    const status = noPatio ? '🟢 No Pátio' : '🔴 Finalizado';
    
    tr.innerHTML = `
      <td><strong>${v.placa}</strong></td>
      <td>${marcaModelo}</td>
      <td>${v.cor}</td>
      <td>${getTipoIcone(v.tipo)} ${v.tipo}</td>
      <td>${v.proprietario || '-'}</td>
      <td>${v.telefone || '-'}</td>
      <td>${v.vaga}</td>
      <td>${formatarData(v.entrada)}</td>
      <td>${status}</td>
    `;
    tbody.appendChild(tr);
  });

  // Atualizar stats
  const totalEntradas = relatorioEntradas.length;
  const totalCarros = relatorioEntradas.filter(v => v.tipo === 'carro').length;
  const totalMotos = relatorioEntradas.filter(v => v.tipo === 'moto').length;
  const totalCaminhoes = relatorioEntradas.filter(v => v.tipo === 'caminhao').length;

  document.getElementById('relTotalEntradas').innerText = totalEntradas;
  document.getElementById('relTotalCarros').innerText = totalCarros;
  document.getElementById('relTotalMotos').innerText = totalMotos;
  document.getElementById('relTotalCaminhoes').innerText = totalCaminhoes;
}

function limparFiltrosRelatorio() {
  document.getElementById('relDataInicio').value = '';
  document.getElementById('relDataFim').value = '';
  document.getElementById('relTipoVeiculo').value = '';
  document.getElementById('relBusca').value = '';
  relatorioEntradas = [];
  renderRelatorio();
}

function imprimirRelatorioEntradasPDF() {
  if (relatorioEntradas.length === 0) {
    alert('Gere um relatório primeiro antes de imprimir!');
    return;
  }

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF('l', 'mm', 'a4'); // Paisagem

  // Título
  doc.setFontSize(16);
  doc.setTextColor(40, 40, 40);
  doc.text('Relatório de Entradas de Veículos', 14, 15);

  // Informações do estacionamento
  doc.setFontSize(10);
  doc.text(`Estacionamento: ${configuracoes.nomeEstacionamento}`, 14, 22);
  
  const dataGeracao = new Date().toLocaleDateString('pt-BR') + ' ' + new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  doc.text(`Gerado em: ${dataGeracao}`, 14, 27);

  // Filtros aplicados
  const dataInicio = document.getElementById('relDataInicio')?.value;
  const dataFim = document.getElementById('relDataFim')?.value;
  const tipoVeiculo = document.getElementById('relTipoVeiculo')?.value || '';
  
  let filtros = 'Filtros: ';
  if (dataInicio) filtros += `De ${new Date(dataInicio).toLocaleDateString('pt-BR')} `;
  if (dataFim) filtros += `Até ${new Date(dataFim).toLocaleDateString('pt-BR')} `;
  if (tipoVeiculo) filtros += `| Tipo: ${tipoVeiculo} `;
  if (filtros === 'Filtros: ') filtros += 'Nenhum filtro aplicado';
  
  doc.text(filtros, 14, 32);

  // Estatísticas
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  const stats = `Total: ${relatorioEntradas.length} | Carros: ${relatorioEntradas.filter(v => v.tipo === 'carro').length} | Motos: ${relatorioEntradas.filter(v => v.tipo === 'moto').length} | Caminhões: ${relatorioEntradas.filter(v => v.tipo === 'caminhao').length}`;
  doc.text(stats, 14, 38);

  // Preparar dados para a tabela
  const dadosTabela = relatorioEntradas.map(v => {
    const marcaModelo = v.marca ? `${v.marca} ${v.modelo}` : v.modelo;
    const noPatio = veiculosNoPatio.some(veic => veic.id === v.id);
    const status = noPatio ? 'No Pátio' : 'Finalizado';
    const dataEntrada = new Date(v.entrada).toLocaleDateString('pt-BR') + ' ' + new Date(v.entrada).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    
    return [
      v.placa,
      marcaModelo,
      v.cor,
      v.tipo,
      v.proprietario || '-',
      v.telefone || '-',
      v.vaga,
      dataEntrada,
      status
    ];
  });

  // Gerar tabela
  doc.autoTable({
    startY: 42,
    head: [['Placa', 'Marca/Modelo', 'Cor', 'Tipo', 'Proprietário', 'Telefone', 'Vaga', 'Entrada', 'Status']],
    body: dadosTabela,
    theme: 'striped',
    headStyles: { fillColor: [52, 152, 219], textColor: 255, fontSize: 8 },
    bodyStyles: { fontSize: 7 },
    columnStyles: {
      0: { cellWidth: 20 },
      1: { cellWidth: 35 },
      2: { cellWidth: 20 },
      3: { cellWidth: 18 },
      4: { cellWidth: 30 },
      5: { cellWidth: 25 },
      6: { cellWidth: 12 },
      7: { cellWidth: 35 },
      8: { cellWidth: 20 }
    },
    margin: { top: 42, left: 14, right: 14 },
  });

  // Salvar PDF
  const nomeArquivo = `relatorio-entradas-${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(nomeArquivo);
}

// ==================== RELATÓRIO DE ENTRADAS E SAÍDAS ====================
function gerarRelatorioEntradasSaidas() {
  const dataInicio = document.getElementById('relESDataInicio')?.value;
  const dataFim = document.getElementById('relESDataFim')?.value;
  const tipoVeiculo = document.getElementById('relESTipoVeiculo')?.value || '';
  const busca = document.getElementById('relESBusca')?.value.toLowerCase() || '';

  // Combinar veículos no pátio e histórico
  const todasEntradas = [...veiculosNoPatio, ...historico];

  // Filtrar
  relatorioEntradasSaidas = todasEntradas.filter(v => {
    // Filtro por data de entrada
    if (dataInicio && new Date(v.entrada) < new Date(dataInicio)) {
      return false;
    }
    if (dataFim && new Date(v.entrada) > new Date(new Date(dataFim).setHours(23, 59, 59))) {
      return false;
    }
    // Filtro por tipo
    if (tipoVeiculo && v.tipo !== tipoVeiculo) {
      return false;
    }
    // Filtro por busca
    if (busca) {
      const matchPlaca = v.placa.toLowerCase().includes(busca);
      const matchModelo = v.modelo.toLowerCase().includes(busca);
      const matchMarca = v.marca && v.marca.toLowerCase().includes(busca);
      if (!matchPlaca && !matchModelo && !matchMarca) {
        return false;
      }
    }
    return true;
  });

  // Ordenar por data de entrada (mais recente primeiro)
  relatorioEntradasSaidas.sort((a, b) => new Date(b.entrada) - new Date(a.entrada));

  renderRelatorioEntradasSaidas();
}

function renderRelatorioEntradasSaidas() {
  const tbody = document.getElementById('tabelaRelatorioES')?.querySelector('tbody');
  if (!tbody) return;

  tbody.innerHTML = '';

  let totalMinutosPermanencia = 0;
  let countComSaida = 0;

  relatorioEntradasSaidas.forEach(v => {
    const tr = document.createElement('tr');
    const marcaModelo = v.marca ? `${v.marca} ${v.modelo}` : v.modelo;
    
    // Verificar se está no pátio ou já saiu
    const noPatio = veiculosNoPatio.some(veic => veic.id === v.id);
    const status = noPatio ? '🟢 No Pátio' : '🔴 Finalizado';
    
    // Data e hora de saída
    let dataSaida = '-';
    if (v.saida) {
      dataSaida = formatarData(v.saida);
      // Calcular tempo de permanência para veículos que já saíram
      const entrada = new Date(v.entrada);
      const saida = new Date(v.saida);
      const diffMinutos = Math.floor((saida - entrada) / (1000 * 60));
      totalMinutosPermanencia += diffMinutos;
      countComSaida++;
    }
    
    // Tempo de permanência
    let tempoPermanencia = calcularTempoPermanencia(v.entrada);
    if (v.saida) {
      const entrada = new Date(v.entrada);
      const saida = new Date(v.saida);
      const diffHoras = Math.floor((saida - entrada) / (1000 * 60 * 60));
      const diffMinutos = Math.floor(((saida - entrada) % (1000 * 60 * 60)) / (1000 * 60));
      if (diffHoras > 0) {
        tempoPermanencia = `${diffHoras}h ${diffMinutos}min`;
      } else {
        tempoPermanencia = `${diffMinutos}min`;
      }
    }
    
    tr.innerHTML = `
      <td><strong>${v.placa}</strong></td>
      <td>${marcaModelo}</td>
      <td>${getTipoIcone(v.tipo)} ${v.tipo}</td>
      <td>${formatarData(v.entrada)}</td>
      <td>${dataSaida}</td>
      <td>${tempoPermanencia}</td>
      <td>${status}</td>
    `;
    tbody.appendChild(tr);
  });

  // Atualizar stats
  const totalRegistros = relatorioEntradasSaidas.length;
  const totalNoPatio = relatorioEntradasSaidas.filter(v => veiculosNoPatio.some(veic => veic.id === v.id)).length;
  const totalSaidas = relatorioEntradasSaidas.filter(v => v.saida).length;
  const tempoMedioMinutos = countComSaida > 0 ? Math.round(totalMinutosPermanencia / countComSaida) : 0;
  const tempoMedioHoras = Math.floor(tempoMedioMinutos / 60);
  const tempoMedioMinutosRestante = tempoMedioMinutos % 60;
  const tempoMedioTexto = tempoMedioHoras > 0 ? `${tempoMedioHoras}h ${tempoMedioMinutosRestante}min` : `${tempoMedioMinutos}min`;

  document.getElementById('relESTotalRegistros').innerText = totalRegistros;
  document.getElementById('relESTotalNoPatio').innerText = totalNoPatio;
  document.getElementById('relESTotalSaidas').innerText = totalSaidas;
  document.getElementById('relESTempoMedio').innerText = tempoMedioTexto;
}

function limparFiltrosRelatorioES() {
  document.getElementById('relESDataInicio').value = '';
  document.getElementById('relESDataFim').value = '';
  document.getElementById('relESTipoVeiculo').value = '';
  document.getElementById('relESBusca').value = '';
  relatorioEntradasSaidas = [];
  renderRelatorioEntradasSaidas();
}

function imprimirRelatorioEntradasSaidasPDF() {
  if (relatorioEntradasSaidas.length === 0) {
    alert('Gere um relatório primeiro antes de imprimir!');
    return;
  }

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF('l', 'mm', 'a4'); // Paisagem

  // Título
  doc.setFontSize(16);
  doc.setTextColor(40, 40, 40);
  doc.text('Relatório de Entradas e Saídas', 14, 15);

  // Informações do estacionamento
  doc.setFontSize(10);
  doc.text(`Estacionamento: ${configuracoes.nomeEstacionamento}`, 14, 22);
  
  const dataGeracao = new Date().toLocaleDateString('pt-BR') + ' ' + new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  doc.text(`Gerado em: ${dataGeracao}`, 14, 27);

  // Filtros aplicados
  const dataInicio = document.getElementById('relESDataInicio')?.value;
  const dataFim = document.getElementById('relESDataFim')?.value;
  const tipoVeiculo = document.getElementById('relESTipoVeiculo')?.value || '';
  
  let filtros = 'Filtros: ';
  if (dataInicio) filtros += `De ${new Date(dataInicio).toLocaleDateString('pt-BR')} `;
  if (dataFim) filtros += `Até ${new Date(dataFim).toLocaleDateString('pt-BR')} `;
  if (tipoVeiculo) filtros += `| Tipo: ${tipoVeiculo} `;
  if (filtros === 'Filtros: ') filtros += 'Nenhum filtro aplicado';
  
  doc.text(filtros, 14, 32);

  // Estatísticas
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  const totalNoPatio = relatorioEntradasSaidas.filter(v => veiculosNoPatio.some(veic => veic.id === v.id)).length;
  const totalSaidas = relatorioEntradasSaidas.filter(v => v.saida).length;
  const stats = `Total: ${relatorioEntradasSaidas.length} | No Pátio: ${totalNoPatio} | Saídas: ${totalSaidas}`;
  doc.text(stats, 14, 38);

  // Preparar dados para a tabela
  const dadosTabela = relatorioEntradasSaidas.map(v => {
    const marcaModelo = v.marca ? `${v.marca} ${v.modelo}` : v.modelo;
    const noPatio = veiculosNoPatio.some(veic => veic.id === v.id);
    const status = noPatio ? 'No Pátio' : 'Finalizado';
    const dataEntrada = new Date(v.entrada).toLocaleDateString('pt-BR') + ' ' + new Date(v.entrada).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    const dataSaida = v.saida ? new Date(v.saida).toLocaleDateString('pt-BR') + ' ' + new Date(v.saida).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : '-';
    
    // Calcular tempo de permanência
    let tempoPermanencia = '-';
    if (v.saida) {
      const entrada = new Date(v.entrada);
      const saida = new Date(v.saida);
      const diffHoras = Math.floor((saida - entrada) / (1000 * 60 * 60));
      const diffMinutos = Math.floor(((saida - entrada) % (1000 * 60 * 60)) / (1000 * 60));
      tempoPermanencia = diffHoras > 0 ? `${diffHoras}h ${diffMinutos}min` : `${diffMinutos}min`;
    } else {
      tempoPermanencia = calcularTempoPermanencia(v.entrada);
    }
    
    return [
      v.placa,
      marcaModelo,
      v.tipo,
      dataEntrada,
      dataSaida,
      tempoPermanencia,
      status
    ];
  });

  // Gerar tabela
  doc.autoTable({
    startY: 42,
    head: [['Placa', 'Marca/Modelo', 'Tipo', 'Entrada', 'Saída', 'Permanência', 'Status']],
    body: dadosTabela,
    theme: 'striped',
    headStyles: { fillColor: [52, 152, 219], textColor: 255, fontSize: 8 },
    bodyStyles: { fontSize: 7 },
    columnStyles: {
      0: { cellWidth: 20 },
      1: { cellWidth: 35 },
      2: { cellWidth: 18 },
      3: { cellWidth: 32 },
      4: { cellWidth: 32 },
      5: { cellWidth: 25 },
      6: { cellWidth: 20 }
    },
    margin: { top: 42, left: 14, right: 14 },
  });

  // Salvar PDF
  const nomeArquivo = `relatorio-entradas-saidas-${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(nomeArquivo);
}

// ==================== RELATÓRIO DE FATURAMENTO ====================
let relatorioFaturamento = [];

function gerarRelatorioFaturamento() {
  const dataInicio = document.getElementById('relFatDataInicio')?.value;
  const dataFim = document.getElementById('relFatDataFim')?.value;
  const formaPagamento = document.getElementById('relFatFormaPagamento')?.value || '';
  const tipoVeiculo = document.getElementById('relFatTipoVeiculo')?.value || '';

  // Filtrar apenas histórico (veículos que já saíram e tiveram pagamento)
  relatorioFaturamento = historico.filter(v => {
    // Filtro por data de saída
    if (dataInicio && new Date(v.saida) < new Date(dataInicio)) {
      return false;
    }
    if (dataFim && new Date(v.saida) > new Date(new Date(dataFim).setHours(23, 59, 59))) {
      return false;
    }
    // Filtro por forma de pagamento
    if (formaPagamento && v.formaPagamento !== formaPagamento) {
      return false;
    }
    // Filtro por tipo de veículo
    if (tipoVeiculo && v.tipo !== tipoVeiculo) {
      return false;
    }
    return true;
  });

  // Ordenar por data de saída (mais recente primeiro)
  relatorioFaturamento.sort((a, b) => new Date(b.saida) - new Date(a.saida));

  renderRelatorioFaturamento();
}

function renderRelatorioFaturamento() {
  const tbody = document.getElementById('tabelaRelatorioFaturamento')?.querySelector('tbody');
  const tbodyDiario = document.getElementById('tabelaResumoDiario')?.querySelector('tbody');
  if (!tbody || !tbodyDiario) return;

  tbody.innerHTML = '';
  tbodyDiario.innerHTML = '';

  // Totais gerais
  let totalArrecadado = 0;
  let totalDinheiro = 0;
  let totalPix = 0;
  let totalCartao = 0;
  let totalCarros = 0;
  let totalMotos = 0;
  let totalCaminhoes = 0;

  // Resumo por dia
  const resumoPorDia = {};

  relatorioFaturamento.forEach(v => {
    const tr = document.createElement('tr');
    const marcaModelo = v.marca ? `${v.marca} ${v.modelo}` : v.modelo;
    const tempo = calcularTempoPermanencia(v.entrada);
    const pagIcones = {
      'dinheiro': '💵',
      'pix': '📱',
      'cartao': '💳'
    };

    tr.innerHTML = `
      <td><strong>${v.placa}</strong></td>
      <td>${marcaModelo}</td>
      <td>${getTipoIcone(v.tipo)} ${v.tipo}</td>
      <td>${formatarData(v.entrada)}</td>
      <td>${formatarData(v.saida)}</td>
      <td>${tempo}</td>
      <td>${formatarMoeda(v.valorCobrado)}</td>
      <td>${pagIcones[v.formaPagamento] || v.formaPagamento}</td>
    `;
    tbody.appendChild(tr);

    // Acumular totais
    totalArrecadado += v.valorCobrado || 0;

    if (v.formaPagamento === 'dinheiro') totalDinheiro += v.valorCobrado || 0;
    else if (v.formaPagamento === 'pix') totalPix += v.valorCobrado || 0;
    else if (v.formaPagamento === 'cartao') totalCartao += v.valorCobrado || 0;

    if (v.tipo === 'carro') totalCarros += v.valorCobrado || 0;
    else if (v.tipo === 'moto') totalMotos += v.valorCobrado || 0;
    else if (v.tipo === 'caminhao') totalCaminhoes += v.valorCobrado || 0;

    // Agrupar por dia
    const dataSaida = new Date(v.saida).toLocaleDateString('pt-BR');
    if (!resumoPorDia[dataSaida]) {
      resumoPorDia[dataSaida] = {
        data: dataSaida,
        totalSaídas: 0,
        dinheiro: 0,
        pix: 0,
        cartao: 0,
        totalDia: 0
      };
    }
    resumoPorDia[dataSaida].totalSaídas++;
    resumoPorDia[dataSaida].totalDia += v.valorCobrado || 0;
    if (v.formaPagamento === 'dinheiro') resumoPorDia[dataSaida].dinheiro += v.valorCobrado || 0;
    else if (v.formaPagamento === 'pix') resumoPorDia[dataSaida].pix += v.valorCobrado || 0;
    else if (v.formaPagamento === 'cartao') resumoPorDia[dataSaida].cartao += v.valorCobrado || 0;
  });

  // Preencher resumo por dia
  const diasOrdenados = Object.keys(resumoPorDia).sort((a, b) => {
    const [diaA, mesA, anoA] = a.split('/');
    const [diaB, mesB, anoB] = b.split('/');
    return new Date(anoB, mesB - 1, diaB) - new Date(anoA, mesA - 1, diaA);
  });

  diasOrdenados.forEach(dia => {
    const resumo = resumoPorDia[dia];
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><strong>${resumo.data}</strong></td>
      <td>${resumo.totalSaídas}</td>
      <td>${formatarMoeda(resumo.dinheiro)}</td>
      <td>${formatarMoeda(resumo.pix)}</td>
      <td>${formatarMoeda(resumo.cartao)}</td>
      <td><strong>${formatarMoeda(resumo.totalDia)}</strong></td>
    `;
    tbodyDiario.appendChild(tr);
  });

  // Atualizar stats
  const totalSaidas = relatorioFaturamento.length;
  const ticketMedio = totalSaidas > 0 ? totalArrecadado / totalSaidas : 0;

  // Valor total do dia (hoje)
  const hoje = new Date().toLocaleDateString('pt-BR');
  const valorHoje = resumoPorDia[hoje] ? resumoPorDia[hoje].totalDia : 0;

  document.getElementById('relFatTotalArrecadado').innerText = formatarMoeda(totalArrecadado);
  document.getElementById('relFatTotalSaidas').innerText = totalSaidas;
  document.getElementById('relFatTicketMedio').innerText = formatarMoeda(ticketMedio);
  document.getElementById('relFatValorDia').innerText = formatarMoeda(valorHoje);

  document.getElementById('relFatDinheiro').innerText = formatarMoeda(totalDinheiro);
  document.getElementById('relFatPix').innerText = formatarMoeda(totalPix);
  document.getElementById('relFatCartao').innerText = formatarMoeda(totalCartao);
  document.getElementById('relFatValorCarros').innerText = formatarMoeda(totalCarros);
  document.getElementById('relFatValorMotos').innerText = formatarMoeda(totalMotos);
  document.getElementById('relFatValorCaminhoes').innerText = formatarMoeda(totalCaminhoes);
}

function limparFiltrosRelatorioFat() {
  document.getElementById('relFatDataInicio').value = '';
  document.getElementById('relFatDataFim').value = '';
  document.getElementById('relFatFormaPagamento').value = '';
  document.getElementById('relFatTipoVeiculo').value = '';
  relatorioFaturamento = [];
  renderRelatorioFaturamento();
}

function imprimirRelatorioFaturamentoPDF() {
  if (relatorioFaturamento.length === 0) {
    alert('Gere um relatório primeiro antes de imprimir!');
    return;
  }

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF('l', 'mm', 'a4'); // Paisagem

  // Título
  doc.setFontSize(16);
  doc.setTextColor(40, 40, 40);
  doc.text('Relatório de Faturamento', 14, 15);

  // Informações do estacionamento
  doc.setFontSize(10);
  doc.text(`Estacionamento: ${configuracoes.nomeEstacionamento}`, 14, 22);
  
  const dataGeracao = new Date().toLocaleDateString('pt-BR') + ' ' + new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  doc.text(`Gerado em: ${dataGeracao}`, 14, 27);

  // Filtros aplicados
  const dataInicio = document.getElementById('relFatDataInicio')?.value;
  const dataFim = document.getElementById('relFatDataFim')?.value;
  const formaPagamento = document.getElementById('relFatFormaPagamento')?.value || '';
  const tipoVeiculo = document.getElementById('relFatTipoVeiculo')?.value || '';
  
  let filtros = 'Filtros: ';
  if (dataInicio) filtros += `De ${new Date(dataInicio).toLocaleDateString('pt-BR')} `;
  if (dataFim) filtros += `Até ${new Date(dataFim).toLocaleDateString('pt-BR')} `;
  if (formaPagamento) {
    const nomesPag = { 'dinheiro': 'Dinheiro', 'pix': 'PIX', 'cartao': 'Cartão' };
    filtros += `| Pagamento: ${nomesPag[formaPagamento] || formaPagamento} `;
  }
  if (tipoVeiculo) {
    const nomesTipo = { 'carro': 'Carros', 'moto': 'Motos', 'caminhao': 'Caminhões' };
    filtros += `| Tipo: ${nomesTipo[tipoVeiculo] || tipoVeiculo} `;
  }
  if (filtros === 'Filtros: ') filtros += 'Nenhum filtro aplicado';
  
  doc.text(filtros, 14, 32);

  // Estatísticas
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  
  let totalArrecadado = 0;
  let totalDinheiro = 0, totalPix = 0, totalCartao = 0;
  relatorioFaturamento.forEach(v => {
    totalArrecadado += v.valorCobrado || 0;
    if (v.formaPagamento === 'dinheiro') totalDinheiro += v.valorCobrado || 0;
    else if (v.formaPagamento === 'pix') totalPix += v.valorCobrado || 0;
    else if (v.formaPagamento === 'cartao') totalCartao += v.valorCobrado || 0;
  });

  const stats = `Total: ${formatarMoeda(totalArrecadado)} | Dinheiro: ${formatarMoeda(totalDinheiro)} | PIX: ${formatarMoeda(totalPix)} | Cartão: ${formatarMoeda(totalCartao)}`;
  doc.text(stats, 14, 38);

  // Preparar dados para a tabela
  const dadosTabela = relatorioFaturamento.map(v => {
    const marcaModelo = v.marca ? `${v.marca} ${v.modelo}` : v.modelo;
    const tempo = calcularTempoPermanencia(v.entrada);
    const pagIcones = { 'dinheiro': 'Dinheiro', 'pix': 'PIX', 'cartao': 'Cartão' };
    const dataEntrada = new Date(v.entrada).toLocaleDateString('pt-BR') + ' ' + new Date(v.entrada).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    const dataSaida = new Date(v.saida).toLocaleDateString('pt-BR') + ' ' + new Date(v.saida).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    
    return [
      v.placa,
      marcaModelo,
      v.tipo,
      dataEntrada,
      dataSaida,
      tempo,
      formatarMoeda(v.valorCobrado),
      pagIcones[v.formaPagamento] || v.formaPagamento
    ];
  });

  // Gerar tabela
  doc.autoTable({
    startY: 42,
    head: [['Placa', 'Marca/Modelo', 'Tipo', 'Entrada', 'Saída', 'Tempo', 'Valor', 'Pagamento']],
    body: dadosTabela,
    theme: 'striped',
    headStyles: { fillColor: [39, 174, 96], textColor: 255, fontSize: 8 },
    bodyStyles: { fontSize: 7 },
    columnStyles: {
      0: { cellWidth: 20 },
      1: { cellWidth: 35 },
      2: { cellWidth: 18 },
      3: { cellWidth: 30 },
      4: { cellWidth: 30 },
      5: { cellWidth: 20 },
      6: { cellWidth: 22 },
      7: { cellWidth: 20 }
    },
    margin: { top: 42, left: 14, right: 14 },
  });

  // Salvar PDF
  const nomeArquivo = `relatorio-faturamento-${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(nomeArquivo);
}

// ==================== RELATÓRIO DE VAGAS ====================
function renderRelatorioVagas() {
  const container = document.getElementById('relVagasContainer');
  const tbody = document.getElementById('tabelaVagasOcupadas')?.querySelector('tbody');
  if (!container || !tbody) return;

  container.innerHTML = '';
  tbody.innerHTML = '';

  const totalVagas = configuracoes.totalVagas;
  const vagasOcupadas = veiculosNoPatio.length;
  const vagasLivres = totalVagas - vagasOcupadas;
  const taxaOcupacao = totalVagas > 0 ? Math.round((vagasOcupadas / totalVagas) * 100) : 0;

  // Atualizar stats
  document.getElementById('relVagasTotal').innerText = totalVagas;
  document.getElementById('relVagasOcupadas').innerText = vagasOcupadas;
  document.getElementById('relVagasLivres').innerText = vagasLivres;
  document.getElementById('relVagasOcupacao').innerText = taxaOcupacao + '%';

  // Gerar mapa de vagas
  for (let i = 1; i <= totalVagas; i++) {
    const veiculo = veiculosNoPatio.find(v => v.vaga === i.toString());
    const div = document.createElement('div');
    
    if (veiculo) {
      div.className = 'vaga-card ocupada';
      div.title = `Ocupada por ${veiculo.placa}`;
      const marcaModelo = veiculo.marca ? `${veiculo.marca} ${veiculo.modelo}` : veiculo.modelo;
      div.innerHTML = `
        <div class="vaga-numero">${i}</div>
        <div class="vaga-status">Ocupada</div>
        <div class="vaga-placa">${veiculo.placa}</div>
        <div class="vaga-modelo" style="font-size: 8px; opacity: 0.8;">${marcaModelo}</div>
      `;
    } else {
      div.className = 'vaga-card livre';
      div.title = `Vaga ${i} - Livre`;
      div.innerHTML = `
        <div class="vaga-numero">${i}</div>
        <div class="vaga-status">Livre</div>
      `;
    }
    
    container.appendChild(div);
  }

  // Preencher tabela de veículos estacionados
  veiculosNoPatio.forEach(v => {
    const tr = document.createElement('tr');
    const marcaModelo = v.marca ? `${v.marca} ${v.modelo}` : v.modelo;
    const tempo = calcularTempoPermanencia(v.entrada);
    
    tr.innerHTML = `
      <td><strong>${v.vaga}</strong></td>
      <td>${v.placa}</td>
      <td>${marcaModelo}</td>
      <td>${v.cor}</td>
      <td>${getTipoIcone(v.tipo)} ${v.tipo}</td>
      <td>${formatarData(v.entrada)}</td>
      <td>${tempo}</td>
    `;
    tbody.appendChild(tr);
  });
}

function imprimirRelatorioVagasPDF() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF('l', 'mm', 'a4'); // Paisagem

  const totalVagas = configuracoes.totalVagas;
  const vagasOcupadas = veiculosNoPatio.length;
  const vagasLivres = totalVagas - vagasOcupadas;
  const taxaOcupacao = totalVagas > 0 ? Math.round((vagasOcupadas / totalVagas) * 100) : 0;

  // Título
  doc.setFontSize(16);
  doc.setTextColor(40, 40, 40);
  doc.text('Relatório de Vagas', 14, 15);

  // Informações do estacionamento
  doc.setFontSize(10);
  doc.text(`Estacionamento: ${configuracoes.nomeEstacionamento}`, 14, 22);
  
  const dataGeracao = new Date().toLocaleDateString('pt-BR') + ' ' + new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  doc.text(`Gerado em: ${dataGeracao}`, 14, 27);

  // Estatísticas
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  const stats = `Total: ${totalVagas} | Ocupadas: ${vagasOcupadas} | Livres: ${vagasLivres} | Ocupação: ${taxaOcupacao}%`;
  doc.text(stats, 14, 33);

  // Preparar dados para a tabela
  const dadosTabela = veiculosNoPatio.map(v => {
    const marcaModelo = v.marca ? `${v.marca} ${v.modelo}` : v.modelo;
    const tempo = calcularTempoPermanencia(v.entrada);
    const dataEntrada = new Date(v.entrada).toLocaleDateString('pt-BR') + ' ' + new Date(v.entrada).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    
    return [
      v.vaga,
      v.placa,
      marcaModelo,
      v.cor,
      v.tipo,
      dataEntrada,
      tempo
    ];
  });

  // Gerar tabela
  doc.autoTable({
    startY: 38,
    head: [['Vaga', 'Placa', 'Marca/Modelo', 'Cor', 'Tipo', 'Entrada', 'Tempo']],
    body: dadosTabela,
    theme: 'striped',
    headStyles: { fillColor: [231, 76, 60], textColor: 255, fontSize: 8 },
    bodyStyles: { fontSize: 7 },
    columnStyles: {
      0: { cellWidth: 15 },
      1: { cellWidth: 20 },
      2: { cellWidth: 40 },
      3: { cellWidth: 25 },
      4: { cellWidth: 20 },
      5: { cellWidth: 35 },
      6: { cellWidth: 25 }
    },
    margin: { top: 38, left: 14, right: 14 },
  });

  // Salvar PDF
  const nomeArquivo = `relatorio-vagas-${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(nomeArquivo);
}

// ==================== GERAL ====================
function renderAll() {
  renderVagas();
  renderPatio();
  renderHistorico();
  renderRelatorio();
  renderRelatorioEntradasSaidas();
  renderRelatorioFaturamento();
  renderRelatorioVagas();
  carregarConfiguracoes();

  // Atualizar nome do estacionamento
  document.querySelector('.sidebar h2').innerText = '🅿️ ' + configuracoes.nomeEstacionamento;
}

// Inicialização
document.addEventListener('DOMContentLoaded', function() {
  inicializarSistema();
});

// Atualizar tempo no pátio a cada minuto
setInterval(() => {
  renderPatio();
}, 60000);
