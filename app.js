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
  if (valor === undefined || valor === null) {
    return 'R$ 0,00';
  }
  return Number(valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
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

  if (!container) {
    console.error('❌ Container de vagas não encontrado!');
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
  console.log('🔄 renderAll() chamado');
  renderPatio();
  renderHistorico();
  renderVagas();
  console.log('✅ renderAll() concluído');
}

// ==================== RELATÓRIOS ====================

/**
 * Gera relatório de movimentação de veículos
 */
function gerarRelatorio() {
  const dataInicio = document.getElementById('relatorioDataInicio')?.value;
  const dataFim = document.getElementById('relatorioDataFim')?.value;
  const tbody = document.querySelector('#tabelaRelatorio tbody');
  const resumoRelatorio = document.getElementById('resumoRelatorio');

  if (!dataInicio || !dataFim) {
    alert('Selecione as datas de início e fim!');
    return;
  }

  // Filtrar histórico pelo período
  const inicio = new Date(dataInicio);
  inicio.setHours(0, 0, 0);
  
  const fim = new Date(dataFim);
  fim.setHours(23, 59, 59);

  const filtrados = historico.filter(h => {
    const dataSaida = new Date(h.saida);
    return dataSaida >= inicio && dataSaida <= fim;
  });

  // Ordenar por data de saída
  filtrados.sort((a, b) => new Date(b.saida) - new Date(a.saida));

  // Preencher tabela
  tbody.innerHTML = '';
  
  if (filtrados.length === 0) {
    tbody.innerHTML = '<tr><td colspan="8" style="text-align: center; padding: 40px; color: #95a5a6;">Nenhum veículo no período selecionado</td></tr>';
    resumoRelatorio.style.display = 'none';
    return;
  }

  filtrados.forEach(h => {
    const tr = document.createElement('tr');
    const tempo = calcularTempoPermanencia(h.entrada);
    const pagIcones = { 'dinheiro': '💵', 'pix': '📱', 'cartao': '💳' };
    const marcaModelo = h.marca ? `${h.marca} ${h.modelo}` : h.modelo;
    const tipoIcone = getTipoIcone(h.tipo);
    
    tr.innerHTML = `
      <td><strong>${h.placa}</strong></td>
      <td>${marcaModelo}</td>
      <td>${tipoIcone} ${h.tipo}</td>
      <td>${formatarData(h.entrada)}</td>
      <td>${formatarData(h.saida)}</td>
      <td>${tempo}</td>
      <td style="color: #27ae60; font-weight: 600;">${formatarMoeda(h.valorCobrado)}</td>
      <td>${pagIcones[h.formaPagamento] || h.formaPagamento}</td>
    `;
    tbody.appendChild(tr);
  });

  // Calcular resumo
  const totalVeiculos = filtrados.length;
  const faturamento = filtrados.reduce((acc, h) => acc + (h.valorCobrado || 0), 0);
  const ticketMedio = totalVeiculos > 0 ? faturamento / totalVeiculos : 0;
  
  // Calcular permanência média em horas
  const totalPermanenciaMs = filtrados.reduce((acc, h) => {
    const entrada = new Date(h.entrada);
    const saida = new Date(h.saida);
    return acc + (saida - entrada);
  }, 0);
  const permanenciaMediaHoras = totalVeiculos > 0 ? (totalPermanenciaMs / totalVeiculos) / (1000 * 60 * 60) : 0;

  // Exibir resumo
  document.getElementById('statTotalVeiculosRelatorio').innerText = totalVeiculos;
  document.getElementById('statFaturamentoRelatorio').innerText = formatarMoeda(faturamento);
  document.getElementById('statTicketMedioRelatorio').innerText = formatarMoeda(ticketMedio);
  document.getElementById('statPermanenciaMediaRelatorio').innerText = permanenciaMediaHoras.toFixed(1) + 'h';
  
  resumoRelatorio.style.display = 'grid';
}

/**
 * Imprime relatório
 */
function imprimirRelatorio() {
  const dataInicio = document.getElementById('relatorioDataInicio')?.value;
  const dataFim = document.getElementById('relatorioDataFim')?.value;
  
  if (!dataInicio || !dataFim) {
    alert('Gere o relatório primeiro!');
    return;
  }

  window.print();
}

/**
 * Exporta relatório para Excel (CSV)
 */
function exportarRelatorio() {
  const dataInicio = document.getElementById('relatorioDataInicio')?.value;
  const dataFim = document.getElementById('relatorioDataFim')?.value;
  
  if (!dataInicio || !dataFim) {
    alert('Gere o relatório primeiro!');
    return;
  }

  // Filtrar histórico
  const inicio = new Date(dataInicio);
  inicio.setHours(0, 0, 0);
  
  const fim = new Date(dataFim);
  fim.setHours(23, 59, 59);

  const filtrados = historico.filter(h => {
    const dataSaida = new Date(h.saida);
    return dataSaida >= inicio && dataSaida <= fim;
  });

  if (filtrados.length === 0) {
    alert('Nenhum dado para exportar!');
    return;
  }

  // Criar CSV
  let csv = 'PLACA;VEICULO;TIPO;ENTRADA;SAIDA;PERMANENCIA;VALOR;PAGAMENTO\n';
  
  filtrados.forEach(h => {
    const marcaModelo = h.marca ? `${h.marca} ${h.modelo}` : h.modelo;
    const tempo = calcularTempoPermanencia(h.entrada);
    const entrada = formatarData(h.entrada).replace(',', '.');
    const saida = formatarData(h.saida).replace(',', '.');
    
    csv += `${h.placa};${marcaModelo};${h.tipo};${entrada};${saida};${tempo};${h.valorCobrado};${h.formaPagamento}\n`;
  });

  // Criar blob e download
  const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `relatorio_movimentacao_${dataInicio}_${dataFim}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// ==================== RELATÓRIO DE FATURAMENTO ====================

/**
 * Mostra aba selecionada do relatório
 */
function mostrarAbaRelatorio(aba) {
  const abaMovimentacao = document.getElementById('abaMovimentacao');
  const abaFaturamento = document.getElementById('abaFaturamento');
  const btnMovimentacao = document.getElementById('btnMovimentacao');
  const btnFaturamento = document.getElementById('btnFaturamento');

  if (aba === 'movimentacao') {
    abaMovimentacao.style.display = 'block';
    abaFaturamento.style.display = 'none';
    btnMovimentacao.classList.add('active');
    btnFaturamento.classList.remove('active');
  } else {
    abaMovimentacao.style.display = 'none';
    abaFaturamento.style.display = 'block';
    btnMovimentacao.classList.remove('active');
    btnFaturamento.classList.add('active');
  }
}

/**
 * Atualiza campos de data conforme período selecionado
 */
function atualizarDatasFaturamento() {
  const periodo = document.getElementById('faturamentoPeriodo').value;
  const divInicio = document.getElementById('divDataInicioPersonalizado');
  const divFim = document.getElementById('divDataFimPersonalizado');

  if (periodo === 'personalizado') {
    divInicio.style.display = 'block';
    divFim.style.display = 'block';
  } else {
    divInicio.style.display = 'none';
    divFim.style.display = 'none';
  }
}

/**
 * Gera relatório de faturamento
 */
function gerarRelatorioFaturamento() {
  const periodo = document.getElementById('faturamentoPeriodo').value;
  let inicio, fim;

  const agora = new Date();
  const hoje = new Date(agora.getFullYear(), agora.getMonth(), agora.getDate());

  switch(periodo) {
    case 'hoje':
      inicio = hoje;
      fim = new Date(hoje);
      fim.setHours(23, 59, 59);
      break;
    case 'ontem':
      inicio = new Date(hoje);
      inicio.setDate(inicio.getDate() - 1);
      fim = new Date(hoje);
      fim.setMilliseconds(-1);
      break;
    case 'semana':
      const diaSemana = agora.getDay();
      const diffSegunda = agora.getDate() - diaSemana + (diaSemana === 0 ? -6 : 1);
      inicio = new Date(agora);
      inicio.setDate(diffSegunda);
      inicio.setHours(0, 0, 0);
      fim = new Date(agora);
      fim.setHours(23, 59, 59);
      break;
    case 'mes':
      inicio = new Date(agora.getFullYear(), agora.getMonth(), 1);
      fim = new Date(agora);
      fim.setHours(23, 59, 59);
      break;
    case 'personalizado':
      const dataInicio = document.getElementById('fatDataInicio')?.value;
      const dataFim = document.getElementById('fatDataFim')?.value;
      
      if (!dataInicio || !dataFim) {
        alert('Selecione as datas do período personalizado!');
        return;
      }
      
      inicio = new Date(dataInicio);
      inicio.setHours(0, 0, 0);
      fim = new Date(dataFim);
      fim.setHours(23, 59, 59);
      break;
  }

  // Filtrar histórico
  const filtrados = historico.filter(h => {
    const dataSaida = new Date(h.saida);
    return dataSaida >= inicio && dataSaida <= fim;
  });

  if (filtrados.length === 0) {
    alert('Nenhum veículo no período selecionado!');
    document.getElementById('resumoFaturamento').style.display = 'none';
    document.getElementById('graficoPagamento').innerHTML = '';
    document.getElementById('tabelaFaturamentoDiario').querySelector('tbody').innerHTML = 
      '<tr><td colspan="6" style="text-align: center; padding: 40px; color: #95a5a6;">Nenhum veículo no período</td></tr>';
    return;
  }

  // Calcular totais
  const totalVeiculos = filtrados.length;
  const totalPeriodo = filtrados.reduce((acc, h) => acc + (h.valorCobrado || 0), 0);
  const valorMedioVeiculo = totalPeriodo / totalVeiculos;

  // Calcular total do dia (hoje)
  const filtradosHoje = filtrados.filter(h => {
    const dataSaida = new Date(h.saida);
    return dataSaida >= hoje;
  });
  const totalDia = filtradosHoje.reduce((acc, h) => acc + (h.valorCobrado || 0), 0);

  // Calcular por forma de pagamento
  const porPagamento = {
    dinheiro: { total: 0, count: 0 },
    pix: { total: 0, count: 0 },
    cartao: { total: 0, count: 0 }
  };

  filtrados.forEach(h => {
    const forma = h.formaPagamento?.toLowerCase() || 'dinheiro';
    if (porPagamento[forma]) {
      porPagamento[forma].total += h.valorCobrado || 0;
      porPagamento[forma].count++;
    }
  });

  // Exibir resumo
  document.getElementById('fatTotalDia').innerText = formatarMoeda(totalDia);
  document.getElementById('fatTotalPeriodo').innerText = formatarMoeda(totalPeriodo);
  document.getElementById('fatValorMedioVeiculo').innerText = formatarMoeda(valorMedioVeiculo);
  document.getElementById('fatTotalVeiculos').innerText = totalVeiculos;
  document.getElementById('resumoFaturamento').style.display = 'grid';

  // Exibir gráfico de pagamento
  const graficoHtml = `
    <div class="stat-card" style="background: linear-gradient(135deg, #27ae60, #2ecc71);">
      <div class="stat-value" style="color: #fff;">💵 ${formatarMoeda(porPagamento.dinheiro.total)}</div>
      <div class="stat-label" style="color: #fff;">Dinheiro (${porPagamento.dinheiro.count})</div>
    </div>
    <div class="stat-card" style="background: linear-gradient(135deg, #8e44ad, #9b59b6);">
      <div class="stat-value" style="color: #fff;">📱 ${formatarMoeda(porPagamento.pix.total)}</div>
      <div class="stat-label" style="color: #fff;">Pix (${porPagamento.pix.count})</div>
    </div>
    <div class="stat-card" style="background: linear-gradient(135deg, #2980b9, #3498db);">
      <div class="stat-value" style="color: #fff;">💳 ${formatarMoeda(porPagamento.cartao.total)}</div>
      <div class="stat-label" style="color: #fff;">Cartão (${porPagamento.cartao.count})</div>
    </div>
  `;
  document.getElementById('graficoPagamento').innerHTML = graficoHtml;

  // Agrupar por dia
  const porDia = {};
  filtrados.forEach(h => {
    const dataSaida = new Date(h.saida);
    const dataStr = dataSaida.toLocaleDateString('pt-BR');
    
    if (!porDia[dataStr]) {
      porDia[dataStr] = {
        veiculos: 0,
        dinheiro: 0,
        pix: 0,
        cartao: 0,
        total: 0
      };
    }
    
    porDia[dataStr].veiculos++;
    const forma = h.formaPagamento?.toLowerCase() || 'dinheiro';
    if (porDia[dataStr][forma] !== undefined) {
      porDia[dataStr][forma] += h.valorCobrado || 0;
    }
    porDia[dataStr].total += h.valorCobrado || 0;
  });

  // Preencher tabela de faturamento por dia
  const tbody = document.getElementById('tabelaFaturamentoDiario').querySelector('tbody');
  tbody.innerHTML = '';
  
  Object.entries(porDia).sort((a, b) => {
    const [diaA, mesA, anoA] = a[0].split('/').map(Number);
    const [diaB, mesB, anoB] = b[0].split('/').map(Number);
    return new Date(anoB, mesB-1, diaB) - new Date(anoA, mesA-1, diaA);
  }).forEach(([data, dados]) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><strong>${data}</strong></td>
      <td>${dados.veiculos}</td>
      <td style="color: #27ae60;">${formatarMoeda(dados.dinheiro)}</td>
      <td style="color: #8e44ad;">${formatarMoeda(dados.pix)}</td>
      <td style="color: #2980b9;">${formatarMoeda(dados.cartao)}</td>
      <td style="color: #f39c12; font-weight: 600;">${formatarMoeda(dados.total)}</td>
    `;
    tbody.appendChild(tr);
  });
}

/**
 * Imprime relatório de faturamento
 */
function imprimirRelatorioFaturamento() {
  const resumo = document.getElementById('resumoFaturamento');
  if (resumo.style.display === 'none') {
    alert('Gere o relatório primeiro!');
    return;
  }
  window.print();
}

/**
 * Exporta relatório de faturamento para Excel (CSV)
 */
function exportarRelatorioFaturamento() {
  const resumo = document.getElementById('resumoFaturamento');
  if (resumo.style.display === 'none') {
    alert('Gere o relatório primeiro!');
    return;
  }

  const periodo = document.getElementById('faturamentoPeriodo').value;
  
  // Criar CSV
  let csv = 'RELATÓRIO DE FATURAMENTO\n\n';
  csv += `Período: ${periodo}\n`;
  csv += `Gerado em: ${new Date().toLocaleString('pt-BR')}\n\n`;
  
  csv += 'RESUMO\n';
  csv += `Total do Dia;${document.getElementById('fatTotalDia').innerText}\n`;
  csv += `Total do Período;${document.getElementById('fatTotalPeriodo').innerText}\n`;
  csv += `Valor Médio por Veículo;${document.getElementById('fatValorMedioVeiculo').innerText}\n`;
  csv += `Veículos Atendidos;${document.getElementById('fatTotalVeiculos').innerText}\n\n`;
  
  csv += 'FORMA DE PAGAMENTO\n';
  const filtrados = historico.filter(h => {
    const dataSaida = new Date(h.saida);
    return dataSaida >= new Date(document.getElementById('fatDataInicio')?.value || 0) && 
           dataSaida <= new Date(document.getElementById('fatDataFim')?.value || Date.now());
  });
  
  const porPagamento = { dinheiro: 0, pix: 0, cartao: 0 };
  filtrados.forEach(h => {
    const forma = h.formaPagamento?.toLowerCase() || 'dinheiro';
    if (porPagamento[forma] !== undefined) {
      porPagamento[forma] += h.valorCobrado || 0;
    }
  });
  
  csv += `Dinheiro;${formatarMoeda(porPagamento.dinheiro)}\n`;
  csv += `Pix;${formatarMoeda(porPagamento.pix)}\n`;
  csv += `Cartão;${formatarMoeda(porPagamento.cartao)}\n`;

  // Criar blob e download
  const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `relatorio_faturamento_${periodo}_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// ==================== RELATÓRIO DE OCUPAÇÃO ====================

/**
 * Gera relatório de ocupação de vagas
 */
function gerarRelatorioOcupacao() {
  const totalVagas = TOTAL_VAGAS;
  const ocupadas = veiculosNoPatio.length;
  const livres = totalVagas - ocupadas;
  const porcentagemOcupacao = totalVagas > 0 ? (ocupadas / totalVagas) * 100 : 0;

  // Exibir resumo geral
  document.getElementById('ocupTotalVagas').innerText = totalVagas;
  document.getElementById('ocupOcupadas').innerText = ocupadas;
  document.getElementById('ocupLivres').innerText = livres;
  document.getElementById('ocupOcupacaoPorcento').innerText = porcentagemOcupacao.toFixed(1) + '%';
  document.getElementById('resumoOcupacaoGeral').style.display = 'grid';

  // Relatório por categoria
  const porCategoria = {
    carro: { ocupadas: 0, valorHora: VALOR_HORA_CARRO, totalArrecadado: 0 },
    moto: { ocupadas: 0, valorHora: VALOR_HORA_MOTO, totalArrecadado: 0 },
    caminhao: { ocupadas: 0, valorHora: VALOR_HORA_CAMINHAO, totalArrecadado: 0 }
  };

  const iconesCategoria = {
    carro: '🚗',
    moto: '🏍️',
    caminhao: '🚚'
  };

  const nomesCategoria = {
    carro: 'Carros',
    moto: 'Motos',
    caminhao: 'Caminhões'
  };

  // Calcular por categoria
  veiculosNoPatio.forEach(v => {
    if (porCategoria[v.tipo]) {
      porCategoria[v.tipo].ocupadas++;
      
      // Calcular valor arrecadado (estimativa baseada no tempo)
      const entrada = new Date(v.entrada);
      const agora = new Date();
      const horas = Math.ceil((agora - entrada) / (1000 * 60 * 60));
      const valorArrecadado = horas * porCategoria[v.tipo].valorHora;
      porCategoria[v.tipo].totalArrecadado += valorArrecadado;
    }
  });

  // Gerar cards por categoria
  let htmlCategoria = '<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px;">';
  
  Object.entries(porCategoria).forEach(([tipo, dados]) => {
    const livresCategoria = dados.ocupadas > 0 ? Math.max(0, Math.floor(totalVagas / 3) - dados.ocupadas) : Math.floor(totalVagas / 3);
    htmlCategoria += `
      <div class="stat-card" style="background: linear-gradient(135deg, ${tipo === 'carro' ? '#3498db' : tipo === 'moto' ? '#27ae60' : '#e67e22'}, ${tipo === 'carro' ? '#2980b9' : tipo === 'moto' ? '#229954' : '#d35400'});">
        <div class="stat-value" style="color: #fff; font-size: 36px;">
          ${iconesCategoria[tipo]} ${dados.ocupadas}
        </div>
        <div class="stat-label" style="color: #fff; font-size: 14px;">
          ${nomesCategoria[tipo]}
        </div>
        <div style="color: #fff; font-size: 12px; margin-top: 5px;">
          Valor/hora: ${formatarMoeda(dados.valorHora)}<br>
          Arrecadado: ${formatarMoeda(dados.totalArrecadado)}
        </div>
      </div>
    `;
  });
  
  htmlCategoria += '</div>';
  document.getElementById('relatorioPorCategoria').innerHTML = htmlCategoria;

  // Preencher tabela de vagas
  const tbody = document.getElementById('tabelaVagasOcupacao').querySelector('tbody');
  tbody.innerHTML = '';

  const vagas = gerarVagas();
  
  if (vagas.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 40px; color: #95a5a6;">Nenhuma vaga configurada</td></tr>';
  } else {
    vagas.forEach(vaga => {
      const tr = document.createElement('tr');
      const statusClass = vaga.ocupada ? 'ocupada' : 'livre';
      const statusIcon = vaga.ocupada ? '🔴' : '🟢';
      const statusTexto = vaga.ocupada ? 'Ocupada' : 'Livre';
      
      if (vaga.ocupada) {
        const tempo = calcularTempoPermanencia(vaga.veiculo.entrada);
        const marcaModelo = vaga.veiculo.marca ? `${vaga.veiculo.marca} ${vaga.veiculo.modelo}` : vaga.veiculo.modelo;
        
        tr.innerHTML = `
          <td><strong style="color: #3498db; font-size: 18px;">${vaga.numero}</strong></td>
          <td><span style="color: #e74c3c;">${statusIcon} ${statusTexto}</span></td>
          <td>${marcaModelo}</td>
          <td><strong>${vaga.veiculo.placa}</strong></td>
          <td>${formatarData(vaga.veiculo.entrada)}</td>
          <td>${tempo}</td>
        `;
      } else {
        tr.innerHTML = `
          <td><strong style="color: #27ae60; font-size: 18px;">${vaga.numero}</strong></td>
          <td><span style="color: #27ae60;">${statusIcon} ${statusTexto}</span></td>
          <td style="color: #95a5a6;">-</td>
          <td style="color: #95a5a6;">-</td>
          <td style="color: #95a5a6;">-</td>
          <td style="color: #95a5a6;">-</td>
        `;
      }
      tbody.appendChild(tr);
    });
  }

  // Atualizar gráfico visual
  document.getElementById('graficoOcupadas').innerText = ocupadas;
  document.getElementById('graficoLivres').innerText = livres;
  document.getElementById('graficoPorcento').innerText = porcentagemOcupacao.toFixed(1) + '%';
}

/**
 * Imprime relatório de ocupação
 */
function imprimirRelatorioOcupacao() {
  const resumo = document.getElementById('resumoOcupacaoGeral');
  if (resumo.style.display === 'none') {
    alert('Gere o relatório primeiro!');
    return;
  }
  window.print();
}

/**
 * Exporta relatório de ocupação para Excel (CSV)
 */
function exportarRelatorioOcupacao() {
  const resumo = document.getElementById('resumoOcupacaoGeral');
  if (resumo.style.display === 'none') {
    alert('Gere o relatório primeiro!');
    return;
  }

  const totalVagas = TOTAL_VAGAS;
  const ocupadas = veiculosNoPatio.length;
  const livres = totalVagas - ocupadas;

  // Criar CSV
  let csv = 'RELATÓRIO DE OCUPAÇÃO DE VAGAS\n\n';
  csv += `Gerado em: ${new Date().toLocaleString('pt-BR')}\n\n`;
  
  csv += 'RESUMO GERAL\n';
  csv += `Total de Vagas;${totalVagas}\n`;
  csv += `Vagas Ocupadas;${ocupadas}\n`;
  csv += `Vagas Livres;${livres}\n`;
  csv += `Taxa de Ocupação;${((ocupadas / totalVagas) * 100).toFixed(1)}%\n\n`;
  
  csv += 'POR CATEGORIA\n';
  csv += 'Categoria;Ocupadas;Valor Hora;Total Arrecadado\n';
  
  const categorias = [
    { tipo: 'carro', nome: 'Carros', valor: VALOR_HORA_CARRO },
    { tipo: 'moto', nome: 'Motos', valor: VALOR_HORA_MOTO },
    { tipo: 'caminhao', nome: 'Caminhões', valor: VALOR_HORA_CAMINHAO }
  ];
  
  categorias.forEach(cat => {
    const ocupadasCat = veiculosNoPatio.filter(v => v.tipo === cat.tipo).length;
    let arrecadado = 0;
    
    veiculosNoPatio.filter(v => v.tipo === cat.tipo).forEach(v => {
      const entrada = new Date(v.entrada);
      const agora = new Date();
      const horas = Math.ceil((agora - entrada) / (1000 * 60 * 60));
      arrecadado += horas * cat.valor;
    });
    
    csv += `${cat.nome};${ocupadasCat};${formatarMoeda(cat.valor)};${formatarMoeda(arrecadado)}\n`;
  });
  
  csv += '\nSTATUS DAS VAGAS\n';
  csv += 'Vaga;Status;Veículo;Placa;Entrada;Permanência\n';
  
  gerarVagas().forEach(vaga => {
    if (vaga.ocupada) {
      const marcaModelo = vaga.veiculo.marca ? `${vaga.veiculo.marca} ${vaga.veiculo.modelo}` : vaga.veiculo.modelo;
      const tempo = calcularTempoPermanencia(vaga.veiculo.entrada);
      const entrada = formatarData(vaga.veiculo.entrada).replace(',', '.');
      csv += `${vaga.numero};Ocupada;${marcaModelo};${vaga.veiculo.placa};${entrada};${tempo}\n`;
    } else {
      csv += `${vaga.numero};Livre;-;-;-\n`;
    }
  });

  // Criar blob e download
  const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `relatorio_ocupacao_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// ==================== INICIALIZAR ====================

document.addEventListener('DOMContentLoaded', async () => {
  console.log('📄 DOM carregado, inicializando sistema...');
  
  // Forçar renderização das vagas mesmo se houver erro na autenticação
  setTimeout(() => {
    const container = document.getElementById('vagasContainer');
    if (container && container.children.length === 0) {
      console.log('⚠️ Vagas não renderizadas, forçando renderização...');
      renderVagas();
    }
  }, 1000);
  
  await inicializarSistema();
});
