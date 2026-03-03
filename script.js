// ==================== DADOS ====================
let veiculosNoPatio = JSON.parse(localStorage.getItem("veiculosNoPatio")) || [];
let historico = JSON.parse(localStorage.getItem("historico")) || [];
let configuracoes = JSON.parse(localStorage.getItem("configuracoes")) || {
  valorHoraCarro: 10.00,
  valorHoraMoto: 5.00,
  valorHoraCaminhao: 20.00,
  totalVagas: 20,
  nomeEstacionamento: "Estacionamento Central"
};

function saveStorage() {
  localStorage.setItem("veiculosNoPatio", JSON.stringify(veiculosNoPatio));
  localStorage.setItem("historico", JSON.stringify(historico));
  localStorage.setItem("configuracoes", JSON.stringify(configuracoes));
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
  const selectVaga = document.getElementById('veiculoVaga');
  const vagasInfo = document.getElementById('vagasInfo');
  
  if (!selectVaga) {
    console.error('Select de vagas não encontrado!');
    return;
  }
  
  // Preencher o select
  const vagaAtual = selectVaga.value;
  selectVaga.innerHTML = '<option value="">Selecione uma vaga...</option>';
  
  const vagas = gerarVagas();
  
  vagas.forEach(vaga => {
    if (!vaga.ocupada) {
      const option = document.createElement('option');
      option.value = vaga.numero;
      option.innerText = `Vaga ${vaga.numero}`;
      selectVaga.appendChild(option);
    }
  });
  
  // Manter seleção atual se ainda válida
  if (vagaAtual && !vagas.find(v => v.numero === vagaAtual && v.ocupada)) {
    selectVaga.value = vagaAtual;
  }
  
  // Atualizar painel de informações
  if (vagasInfo) {
    vagasInfo.innerHTML = '';
    
    const vagasLivres = vagas.filter(v => !v.ocupada).length;
    const vagasOcupadas = vagas.filter(v => v.ocupada).length;
    
    // Cards resumo
    const cardLivres = document.createElement('div');
    cardLivres.className = 'vaga-info livre';
    cardLivres.innerHTML = `
      <div class="vaga-info-numero">${vagasLivres}</div>
      <div class="vaga-info-status">Vagas Livres</div>
    `;
    vagasInfo.appendChild(cardLivres);
    
    const cardOcupadas = document.createElement('div');
    cardOcupadas.className = 'vaga-info ocupada';
    cardOcupadas.innerHTML = `
      <div class="vaga-info-numero">${vagasOcupadas}</div>
      <div class="vaga-info-status">Vagas Ocupadas</div>
    `;
    vagasInfo.appendChild(cardOcupadas);
    
    // Lista de vagas ocupadas
    vagas.filter(v => v.ocupada).forEach(vaga => {
      const div = document.createElement('div');
      div.className = 'vaga-info ocupada';
      div.innerHTML = `
        <div class="vaga-info-numero">${vaga.numero}</div>
        <div class="vaga-info-status">Ocupada</div>
        <div class="vaga-info-placa">${vaga.veiculo.placa}</div>
      `;
      vagasInfo.appendChild(div);
    });
  }
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
      (h.marca && h.marca.toLowerCase().includes(busca))
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

// ==================== GERAL ====================
function renderAll() {
  renderVagas();
  renderPatio();
  renderHistorico();
  carregarConfiguracoes();
  
  // Atualizar nome do estacionamento
  document.querySelector('.sidebar h2').innerText = '🅿️ ' + configuracoes.nomeEstacionamento;
}

// Inicialização
renderAll();

// Atualizar tempo no pátio a cada minuto
setInterval(() => {
  renderPatio();
}, 60000);
