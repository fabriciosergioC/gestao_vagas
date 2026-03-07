// ==================== CONFIGURAÇÃO DO SUPABASE ====================

// ⚠️ SUBSTITUA PELAS SUAS CREDENCIAIS DO SUPABASE
// Obtenha em: https://app.supabase.com/project/_/settings/api
const SUPABASE_URL = 'https://jmzksixxfzblpkgbssnv.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImptemtzaXh4ZnpibHBrZ2Jzc252Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI5MDY0ODUsImV4cCI6MjA4ODQ4MjQ4NX0.awePn-pMz3cE2CCBDgnLQttAvvwpMSytLtSvUdhpcSw';

// Variável global para o cliente Supabase
let supabaseClient = null;
let isSupabaseConnected = false;

// ==================== INICIALIZAÇÃO ====================

/**
 * Inicializa a conexão com o Supabase
 * Retorna true se conectado, false caso contrário
 */
async function initSupabase() {
  // Verificar se as credenciais foram alteradas do padrão
  if (!SUPABASE_URL || SUPABASE_URL === 'SUA_URL_SUPABASE_AQUI' || 
      !SUPABASE_ANON_KEY || SUPABASE_ANON_KEY === 'SUA_CHAVE_ANON_AQUI') {
    console.warn('⚠️ Supabase não configurado. Editar supabase.js com suas credenciais.');
    console.warn('📖 Acesse https://app.supabase.com para obter URL e API Key');
    return false;
  }

  try {
    supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    
    // Testar conexão
    const { data, error } = await supabaseClient.from('veiculos').select('count').limit(1);
    
    if (error) {
      console.error('❌ Erro ao conectar no Supabase:', error.message);
      return false;
    }
    
    isSupabaseConnected = true;
    console.log('✅ Supabase conectado com sucesso!');
    return true;
  } catch (err) {
    console.error('❌ Erro ao inicializar Supabase:', err.message);
    return false;
  }
}

/**
 * Verifica se o Supabase está conectado e disponível
 */
function isSupabaseAvailable() {
  return isSupabaseConnected && supabaseClient !== null;
}

// ==================== VEÍCULOS NO PÁTIO ====================

/**
 * Busca todos os veículos no pátio do Supabase
 */
async function fetchVeiculosNoPatio() {
  if (!isSupabaseAvailable()) {
    return null;
  }

  try {
    const { data, error } = await supabaseClient
      .from('veiculos')
      .select('*')
      .is('saida', null) // Apenas veículos sem saída (no pátio)
      .order('entrada', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error('Erro ao buscar veículos:', err.message);
    return null;
  }
}

/**
 * Insere um novo veículo no Supabase
 */
async function insertVeiculo(veiculo) {
  if (!isSupabaseAvailable()) {
    return null;
  }

  try {
    const { data, error } = await supabaseClient
      .from('veiculos')
      .insert([{
        id: veiculo.id,
        placa: veiculo.placa,
        marca: veiculo.marca,
        modelo: veiculo.modelo,
        cor: veiculo.cor,
        tipo: veiculo.tipo,
        proprietario: veiculo.proprietario || null,
        telefone: veiculo.telefone || null,
        vaga: veiculo.vaga,
        entrada: veiculo.entrada
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (err) {
    console.error('Erro ao inserir veículo:', err.message);
    return null;
  }
}

/**
 * Atualiza um veículo no Supabase
 */
async function updateVeiculo(id, updates) {
  if (!isSupabaseAvailable()) {
    return null;
  }

  try {
    const { data, error } = await supabaseClient
      .from('veiculos')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (err) {
    console.error('Erro ao atualizar veículo:', err.message);
    return null;
  }
}

/**
 * Remove um veículo do pátio (apenas marca como removido, não deleta)
 */
async function deleteVeiculo(id) {
  if (!isSupabaseAvailable()) {
    return null;
  }

  try {
    const { data, error } = await supabaseClient
      .from('veiculos')
      .delete()
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (err) {
    console.error('Erro ao deletar veículo:', err.message);
    return null;
  }
}

// ==================== HISTÓRICO ====================

/**
 * Busca todo o histórico do Supabase
 */
async function fetchHistorico() {
  if (!isSupabaseAvailable()) {
    return null;
  }

  try {
    const { data, error } = await supabaseClient
      .from('historico')
      .select('*')
      .order('saida', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error('Erro ao buscar histórico:', err.message);
    return null;
  }
}

/**
 * Insere um registro no histórico
 */
async function insertHistorico(registro) {
  if (!isSupabaseAvailable()) {
    return null;
  }

  try {
    const { data, error } = await supabaseClient
      .from('historico')
      .insert([{
        id: registro.id,
        veiculo_id: registro.id,
        placa: registro.placa,
        marca: registro.marca,
        modelo: registro.modelo,
        cor: registro.cor,
        tipo: registro.tipo,
        proprietario: registro.proprietario || null,
        telefone: registro.telefone || null,
        vaga: registro.vaga,
        entrada: registro.entrada,
        saida: registro.saida,
        tempo_permanencia: registro.tempoPermanencia || null,
        valor_cobrado: registro.valorCobrado,
        forma_pagamento: registro.formaPagamento
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (err) {
    console.error('Erro ao inserir histórico:', err.message);
    return null;
  }
}

/**
 * Limpa todo o histórico
 */
async function clearHistorico() {
  if (!isSupabaseAvailable()) {
    return false;
  }

  try {
    const { error } = await supabaseClient
      .from('historico')
      .delete()
      .neq('id', 0); // Deleta tudo

    if (error) throw error;
    return true;
  } catch (err) {
    console.error('Erro ao limpar histórico:', err.message);
    return false;
  }
}

// ==================== CONFIGURAÇÕES ====================

/**
 * Busca configurações do Supabase
 */
async function fetchConfiguracoes() {
  if (!isSupabaseAvailable()) {
    return null;
  }

  try {
    const { data, error } = await supabaseClient
      .from('configuracoes')
      .select('*')
      .eq('id', 1)
      .single();

    if (error && error.code !== 'PGRST116') throw error; // PGRST116 = not found
    return data;
  } catch (err) {
    console.error('Erro ao buscar configurações:', err.message);
    return null;
  }
}

/**
 * Salva/atualiza configurações no Supabase
 */
async function saveConfiguracoes(config) {
  if (!isSupabaseAvailable()) {
    return null;
  }

  try {
    // Verifica se já existe
    const { data: existing } = await supabaseClient
      .from('configuracoes')
      .select('id')
      .eq('id', 1)
      .single();

    let data, error;

    if (existing) {
      // Update
      ({ data, error } = await supabaseClient
        .from('configuracoes')
        .update({
          valor_hora_carro: config.valorHoraCarro,
          valor_hora_moto: config.valorHoraMoto,
          valor_hora_caminhao: config.valorHoraCaminhao,
          total_vagas: config.totalVagas,
          nome_estacionamento: config.nomeEstacionamento,
          updated_at: new Date().toISOString()
        })
        .eq('id', 1)
        .select()
        .single());
    } else {
      // Insert
      ({ data, error } = await supabaseClient
        .from('configuracoes')
        .insert([{
          id: 1,
          valor_hora_carro: config.valorHoraCarro,
          valor_hora_moto: config.valorHoraMoto,
          valor_hora_caminhao: config.valorHoraCaminhao,
          total_vagas: config.totalVagas,
          nome_estacionamento: config.nomeEstacionamento
        }])
        .select()
        .single());
    }

    if (error) throw error;
    return data;
  } catch (err) {
    console.error('Erro ao salvar configurações:', err.message);
    return null;
  }
}

// ==================== USUÁRIOS ====================

/**
 * Busca usuários do Supabase
 */
async function fetchUsuarios() {
  if (!isSupabaseAvailable()) {
    return null;
  }

  try {
    const { data, error } = await supabaseClient
      .from('usuarios')
      .select('*')
      .order('usuario');

    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error('Erro ao buscar usuários:', err.message);
    return null;
  }
}

/**
 * Salva usuários no Supabase
 */
async function saveUsuarios(usuarios) {
  if (!isSupabaseAvailable()) {
    return false;
  }

  try {
    // Upsert para cada usuário
    for (const usuario of usuarios) {
      const { error } = await supabaseClient
        .from('usuarios')
        .upsert({
          usuario: usuario.usuario,
          senha: usuario.senha,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'usuario'
        });

      if (error) throw error;
    }
    return true;
  } catch (err) {
    console.error('Erro ao salvar usuários:', err.message);
    return false;
  }
}

// ==================== SINCRONIZAÇÃO ====================

/**
 * Sincroniza dados do Supabase para o localStorage (fallback)
 */
async function syncFromSupabase() {
  if (!isSupabaseAvailable()) {
    return false;
  }

  try {
    // Buscar veículos
    const veiculos = await fetchVeiculosNoPatio();
    if (veiculos !== null) {
      localStorage.setItem('veiculosNoPatio', JSON.stringify(veiculos));
    }

    // Buscar histórico
    const historico = await fetchHistorico();
    if (historico !== null) {
      localStorage.setItem('historico', JSON.stringify(historico));
    }

    // Buscar configurações
    const config = await fetchConfiguracoes();
    if (config !== null) {
      const configFormatada = {
        valorHoraCarro: config.valor_hora_carro,
        valorHoraMoto: config.valor_hora_moto,
        valorHoraCaminhao: config.valor_hora_caminhao,
        totalVagas: config.total_vagas,
        nomeEstacionamento: config.nome_estacionamento
      };
      localStorage.setItem('configuracoes', JSON.stringify(configFormatada));
    }

    // Buscar usuários
    const usuarios = await fetchUsuarios();
    if (usuarios !== null) {
      localStorage.setItem('usuarios', JSON.stringify(usuarios));
    }

    console.log('✅ Dados sincronizados do Supabase');
    return true;
  } catch (err) {
    console.error('Erro na sincronização:', err.message);
    return false;
  }
}

/**
 * Sincroniza dados do localStorage para o Supabase
 */
async function syncToSupabase() {
  if (!isSupabaseAvailable()) {
    return false;
  }

  try {
    const veiculosNoPatio = JSON.parse(localStorage.getItem('veiculosNoPatio')) || [];
    const historico = JSON.parse(localStorage.getItem('historico')) || [];
    const configuracoes = JSON.parse(localStorage.getItem('configuracoes')) || {};
    const usuarios = JSON.parse(localStorage.getItem('usuarios')) || [];

    // Salvar configurações
    await saveConfiguracoes(configuracoes);

    // Salvar usuários
    await saveUsuarios(usuarios);

    // Salvar veículos no pátio (upsert para evitar duplicação)
    for (const veiculo of veiculosNoPatio) {
      await supabaseClient
        .from('veiculos')
        .upsert({
          id: veiculo.id,
          placa: veiculo.placa,
          marca: veiculo.marca,
          modelo: veiculo.modelo,
          cor: veiculo.cor,
          tipo: veiculo.tipo,
          proprietario: veiculo.proprietario || null,
          telefone: veiculo.telefone || null,
          vaga: veiculo.vaga,
          entrada: veiculo.entrada,
          saida: null
        }, {
          onConflict: 'id'
        });
    }

    // Salvar histórico (upsert para evitar duplicação)
    for (const registro of historico) {
      await supabaseClient
        .from('historico')
        .upsert({
          id: registro.id,
          veiculo_id: registro.id,
          placa: registro.placa,
          marca: registro.marca,
          modelo: registro.modelo,
          cor: registro.cor,
          tipo: registro.tipo,
          proprietario: registro.proprietario || null,
          telefone: registro.telefone || null,
          vaga: registro.vaga,
          entrada: registro.entrada,
          saida: registro.saida,
          tempo_permanencia: registro.tempoPermanencia || null,
          valor_cobrado: registro.valorCobrado,
          forma_pagamento: registro.formaPagamento
        }, {
          onConflict: 'id'
        });
    }

    console.log('✅ Dados sincronizados para o Supabase');
    console.log(`   - ${veiculosNoPatio.length} veículo(s) no pátio`);
    console.log(`   - ${historico.length} registro(s) no histórico`);
    return true;
  } catch (err) {
    console.error('Erro na sincronização:', err.message);
    return false;
  }
}

// ==================== EXPORTS GLOBAIS ====================
// Torna as funções disponíveis globalmente
window.supabaseFunctions = {
  initSupabase,
  isSupabaseAvailable,
  syncFromSupabase,
  syncToSupabase,
  fetchVeiculosNoPatio,
  insertVeiculo,
  updateVeiculo,
  deleteVeiculo,
  fetchHistorico,
  insertHistorico,
  clearHistorico,
  fetchConfiguracoes,
  saveConfiguracoes,
  fetchUsuarios,
  saveUsuarios
};
