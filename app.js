// ==================== DADOS ====================
let veiculosNoPatio = [];
let historico = [];
let clienteAtual = null;

// ==================== VERIFICAR AUTENTICAÇÃO ====================

function verificarAutenticacao() {
  const usuarioSalvo = localStorage.getItem('usuarioAtual');
  const clienteSelecionado = localStorage.getItem('clienteSelecionado');
  
  if (!usuarioSalvo) {
    window.location.href = 'login.html';
    return null;
  }
  
  if (!clienteSelecionado) {
    // Se não há cliente selecionado, redireciona para login
    window.location.href = 'login.html';
    return null;
  }
  
  try {
    clienteAtual = JSON.parse(clienteSelecionado);
  } catch (e) {
    console.error('Erro ao ler cliente:', e);
    window.location.href = 'login.html';
    return null;
  }
  
  return usuarioSalvo;
}

// ==================== INICIALIZAÇÃO ====================

async function inicializarSistema() {
  const usuario = verificarAutenticacao();
  if (!usuario) return;

  // Exibir nome do usuário e cliente
  const usuarioNome = localStorage.getItem('usuarioNome') || usuario;
  document.getElementById('usuarioLogado').innerText = usuarioNome;
  
  // Exibir nome do cliente no header
  if (clienteAtual) {
    const headerTitulo = document.querySelector('.sidebar h2');
    if (headerTitulo) {
      headerTitulo.innerText = '🅿️ ' + (clienteAtual.nome_fantasia || clienteAtual.razao_social || 'Estacionamento');
    }
  }

  // Inicializar Supabase e definir cliente
  const supabaseConectado = await window.supabaseFunctions?.initSupabase();

  if (supabaseConectado) {
    // Definir cliente atual no Supabase
    if (clienteAtual?.id) {
      window.supabaseFunctions?.setClienteAtual(clienteAtual.id);
    }
    
    const sincronizado = await window.supabaseFunctions.syncFromSupabase();
    if (sincronizado) {
      carregarDadosLocais();
      console.log('📊 Dados carregados do Supabase');
    }
  } else {
    carregarDadosLocais();
    console.log('📊 Dados carregados do localStorage');
  }

  renderAll();
}

function carregarDadosLocais() {
  veiculosNoPatio = JSON.parse(localStorage.getItem("veiculosNoPatio")) || [];
  historico = JSON.parse(localStorage.getItem("historico")) || [];
}

// ==================== LOGOUT ====================

function fazerLogout() {
  if (confirm('Deseja realmente sair?')) {
    localStorage.removeItem('usuarioAtual');
    localStorage.removeItem('usuarioNome');
    localStorage.removeItem('clienteSelecionado');
    localStorage.removeItem('clienteAtualId');
    window.location.href = 'login.html';
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
  const icones = { 'carro': '🚗', 'moto': '🏍️', 'caminhao': '🚚' };
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
  for (let i = 1; i <= TOTAL_VAGAS; i++) {
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

  if (!container) return;

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

  if (vagaAtual === numero) {
    vagaElement.value = '';
  } else {
    vagaElement.value = numero;
  }

  renderVagas();
}

// ==================== ENTRADA ====================

async function registrarEntrada() {
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

  const existente = veiculosNoPatio.find(v => v.placa === placa);
  if (existente) {
    alert(`Veículo ${placa} já está estacionado na vaga ${existente.vaga}!`);
    return;
  }

  const vagaOcupada = veiculosNoPatio.find(v => v.vaga === vaga);
  if (vagaOcupada) {
    alert(`Vaga ${vaga} já está ocupada por ${vagaOcupada.placa}!`);
    return;
  }

  const veiculo = {
    id: Date.now(),
    placa: placa,
    marca: marca,
    modelo: modelo,
    cor: cor,
    tipo: tipo,
    proprietario: proprietario,
    telefone: telefone,
    vaga: vaga,
    entrada: new Date().toISOString()
  };

  veiculosNoPatio.push(veiculo);
  localStorage.setItem("veiculosNoPatio", JSON.stringify(veiculosNoPatio));

  if (window.supabaseFunctions?.isSupabaseAvailable()) {
    const resultado = await window.supabaseFunctions.insertVeiculo(veiculo);
    if (resultado) {
      console.log('✅ Veículo salvo no Supabase');
    } else {
      console.warn('⚠️ Veículo salvo apenas no localStorage');
    }
  }

  limparFormEntrada();
  renderAll();

  alert(`Entrada registrada com sucesso!\nVeículo: ${marca} ${modelo} - ${placa}\nVaga: ${vaga}`);
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

  document.getElementById('statTotalVeiculos').innerText = veiculosNoPatio.length;
  document.getElementById('statVagasOcupadas').innerText = veiculosNoPatio.length;
  document.getElementById('statVagasLivres').innerText = TOTAL_VAGAS - veiculosNoPatio.length;
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
    resultado.innerHTML = '<div class="card" style="background: #fff5f5; border-left-color: #e74c3c;">Veículo não encontrado!</div>';
    areaPagamento.style.display = 'none';
    return;
  }

  veiculoSaida = veiculo;
  resultado.innerHTML = '';
  areaPagamento.style.display = 'block';

  const marcaModelo = veiculo.marca ? `${veiculo.marca} ${veiculo.modelo}` : veiculo.modelo;

  document.getElementById('infoPlaca').innerText = veiculo.placa;
  document.getElementById('infoModelo').innerText = marcaModelo;
  document.getElementById('infoCor').innerText = veiculo.cor;
  document.getElementById('infoTipo').innerText = getTipoIcone(veiculo.tipo) + ' ' + veiculo.tipo;
  document.getElementById('infoVaga').innerText = veiculo.vaga;

  calcularValorSaida(veiculo);
}

function calcularValorSaida(veiculo) {
  const entrada = new Date(veiculo.entrada);
  const saida = new Date();

  let diffHoras = (saida - entrada) / (1000 * 60 * 60);
  if (diffHoras < 1) diffHoras = 1;
  diffHoras = Math.ceil(diffHoras);

  let valorHora;
  switch(veiculo.tipo) {
    case 'moto': valorHora = VALOR_HORA_MOTO; break;
    case 'caminhao': valorHora = VALOR_HORA_CAMINHAO; break;
    default: valorHora = VALOR_HORA_CARRO;
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

async function confirmarSaida() {
  if (!veiculoSaida) return;

  const formaPagamento = document.getElementById('formaPagamento').value;

  const registro = {
    ...veiculoSaida,
    saida: new Date().toISOString(),
    formaPagamento,
    valorCobrado: veiculoSaida.valorTotal,
    tempoPermanencia: calcularTempoPermanencia(veiculoSaida.entrada)
  };

  historico.push(registro);
  veiculosNoPatio = veiculosNoPatio.filter(v => v.id !== veiculoSaida.id);

  localStorage.setItem("veiculosNoPatio", JSON.stringify(veiculosNoPatio));
  localStorage.setItem("historico", JSON.stringify(historico));

  if (window.supabaseFunctions?.isSupabaseAvailable()) {
    await window.supabaseFunctions.deleteVeiculo(veiculoSaida.id);
    await window.supabaseFunctions.insertHistorico(registro);
  }

  alert(`Saída confirmada!\nValor: ${formatarMoeda(veiculoSaida.valorTotal)}`);

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
      (h.marca && h.marca.toLowerCase().includes(busca))
    );
  }

  filtrados.sort((a, b) => new Date(b.saida) - new Date(a.saida));

  filtrados.forEach(h => {
    const tr = document.createElement('tr');
    const tempo = calcularTempoPermanencia(h.entrada);
    const pagIcones = { 'dinheiro': '💵', 'pix': '📱', 'cartao': '💳' };
    const marcaModelo = h.marca ? `${h.marca} ${h.modelo}` : h.modelo;
    tr.innerHTML = `
      <td><strong>${h.placa}</strong></td>
      <td>${marcaModelo}</td>
      <td>${getTipoIcone(h.tipo)}</td>
      <td>${formatarData(h.entrada)}</td>
      <td>${formatarData(h.saida)}</td>
      <td>${tempo}</td>
      <td>${formatarMoeda(h.valorCobrado)}</td>
      <td>${pagIcones[h.formaPagamento] || h.formaPagamento}</td>
    `;
    tbody.appendChild(tr);
  });

  const totalSaidas = filtrados.length;
  const faturamento = filtrados.reduce((acc, h) => acc + (h.valorCobrado || 0), 0);
  const ticketMedio = totalSaidas > 0 ? faturamento / totalSaidas : 0;

  document.getElementById('statTotalSaidas').innerText = totalSaidas;
  document.getElementById('statFaturamento').innerText = formatarMoeda(faturamento);
  document.getElementById('statTicketMedio').innerText = formatarMoeda(ticketMedio);
}

// ==================== CONFIGURAÇÕES (VALORES FIXOS) ====================

// Valores padrão (fixos, sem banco de dados)
const VALOR_HORA_CARRO = 10.00;
const VALOR_HORA_MOTO = 5.00;
const VALOR_HORA_CAMINHAO = 20.00;
const TOTAL_VAGAS = 20;
const NOME_ESTACIONAMENTO = "Estacionamento Central";

function limparHistorico() {
  if (confirm('Limpar todo o histórico?')) {
    historico = [];
    localStorage.setItem("historico", JSON.stringify(historico));
    renderHistorico();
    alert('Histórico limpo!');
  }
}

function resetarSistema() {
  if (confirm('ATENÇÃO: Isso apagará TODOS os dados!\n\nContinuar?')) {
    veiculosNoPatio = [];
    historico = [];
    localStorage.setItem("veiculosNoPatio", JSON.stringify(veiculosNoPatio));
    localStorage.setItem("historico", JSON.stringify(historico));
    renderAll();
    alert('Sistema resetado!');
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

function renderAll() {
  renderPatio();
  renderHistorico();
  renderVagas();
}

// ==================== INICIALIZAR ====================

document.addEventListener('DOMContentLoaded', inicializarSistema);
