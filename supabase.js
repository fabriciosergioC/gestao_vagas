// ==================== CONFIGURAÇÃO DO SUPABASE ====================

// ⚠️ SUBSTITUA PELAS SUAS CREDENCIAIS DO SUPABASE
// Obtenha em: https://app.supabase.com/project/_/settings/api
const SUPABASE_URL = 'https://jmzksixxfzblpkgbssnv.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImptemtzaXh4ZnpibHBrZ2Jzc252Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI5MDY0ODUsImV4cCI6MjA4ODQ4MjQ4NX0.awePn-pMz3cE2CCBDgnLQttAvvwpMSytLtSvUdhpcSw';

// Variável global para o cliente Supabase
let supabaseClient = null;
let isSupabaseConnected = false;

// Cliente atual selecionado
let clienteAtual = null;

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
 * Busca todos os veículos no pátio do Supabase (filtrado por cliente)
 */
async function fetchVeiculosNoPatio() {
  if (!isSupabaseAvailable()) {
    return null;
  }

  try {
    let query = supabaseClient
      .from('veiculos')
      .select('*')
      .is('saida', null); // Apenas veículos sem saída (no pátio)
    
    // Filtrar por cliente atual
    if (clienteAtual?.id) {
      query = query.eq('cliente_id', clienteAtual.id);
    }
    
    const { data, error } = await query.order('entrada', { ascending: false });

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
        cliente_id: clienteAtual?.id || null,
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
 * Busca todo o histórico do Supabase (filtrado por cliente)
 */
async function fetchHistorico() {
  if (!isSupabaseAvailable()) {
    return null;
  }

  try {
    let query = supabaseClient
      .from('historico')
      .select('*');
    
    // Filtrar por cliente atual
    if (clienteAtual?.id) {
      query = query.eq('cliente_id', clienteAtual.id);
    }
    
    const { data, error } = await query.order('saida', { ascending: false });

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
        cliente_id: clienteAtual?.id || null,
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
 * Busca configurações do Supabase (filtrado por cliente)
 */
async function fetchConfiguracoes() {
  if (!isSupabaseAvailable()) {
    return null;
  }

  try {
    let query = supabaseClient
      .from('configuracoes')
      .select('*');
    
    // Filtrar por cliente atual
    if (clienteAtual?.id) {
      query = query.eq('cliente_id', clienteAtual.id);
    }
    
    const { data, error } = await query.single();

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
    // Verifica se já existe para o cliente atual
    let query = supabaseClient
      .from('configuracoes')
      .select('id');
    
    if (clienteAtual?.id) {
      query = query.eq('cliente_id', clienteAtual.id);
    }
    
    const { data: existing } = await query.single();

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
        .eq('id', existing.id)
        .select()
        .single());
    } else {
      // Insert
      ({ data, error } = await supabaseClient
        .from('configuracoes')
        .insert([{
          cliente_id: clienteAtual?.id || 1,
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
 * Busca todos os clientes do Supabase
 */
async function fetchClientes() {
  if (!isSupabaseAvailable()) {
    return null;
  }

  try {
    const { data, error } = await supabaseClient
      .from('clientes')
      .select('*')
      .eq('ativo', true)
      .order('nome_fantasia');

    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error('Erro ao buscar clientes:', err.message);
    return null;
  }
}

/**
 * Cria um novo cliente
 */
async function createCliente(cliente) {
  if (!isSupabaseAvailable()) {
    return null;
  }

  try {
    const { data, error } = await supabaseClient
      .from('clientes')
      .insert([{
        cnpj: cliente.cnpj || null,
        razao_social: cliente.razao_social,
        nome_fantasia: cliente.nome_fantasia,
        email: cliente.email || null,
        telefone: cliente.telefone || null,
        endereco: cliente.endereco || null
      }])
      .select()
      .single();

    if (error) throw error;
    
    // Criar configurações padrão para o cliente
    if (data) {
      await supabaseClient
        .from('configuracoes')
        .insert([{
          cliente_id: data.id,
          valor_hora_carro: 10.00,
          valor_hora_moto: 5.00,
          valor_hora_caminhao: 20.00,
          total_vagas: 20,
          nome_estacionamento: cliente.nome_fantasia || cliente.razao_social
        }]);
      
      // Criar usuário admin
      if (cliente.usuario_admin && cliente.senha_admin) {
        await supabaseClient
          .from('usuarios')
          .insert([{
            cliente_id: data.id,
            usuario: cliente.usuario_admin,
            senha: cliente.senha_admin,
            nome: 'Administrador',
            email: cliente.email,
            ativo: true
          }]);
      }
    }
    
    return data;
  } catch (err) {
    console.error('Erro ao criar cliente:', err.message);
    return null;
  }
}

/**
 * Atualiza um cliente
 */
async function updateCliente(id, updates) {
  if (!isSupabaseAvailable()) {
    return null;
  }

  try {
    const { data, error } = await supabaseClient
      .from('clientes')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (err) {
    console.error('Erro ao atualizar cliente:', err.message);
    return null;
  }
}

/**
 * Busca usuários do Supabase (filtrado por cliente)
 */
async function fetchUsuarios(clienteId = null) {
  if (!isSupabaseAvailable()) {
    return null;
  }

  try {
    let query = supabaseClient.from('usuarios').select('*');
    
    if (clienteId || clienteAtual?.id) {
      query = query.eq('cliente_id', clienteId || clienteAtual.id);
    }
    
    const { data, error } = await query.order('usuario');

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
    // Upsert para cada usuário com cliente_id
    for (const usuario of usuarios) {
      const { error } = await supabaseClient
        .from('usuarios')
        .upsert({
          usuario: usuario.usuario,
          senha: usuario.senha,
          cliente_id: clienteAtual?.id || usuario.cliente_id,
          nome: usuario.nome,
          email: usuario.email,
          ativo: usuario.ativo !== false,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'usuario,cliente_id'
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
          cliente_id: clienteAtual?.id || veiculo.cliente_id,
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
          onConflict: 'id,cliente_id'
        });
    }

    // Salvar histórico (upsert para evitar duplicação)
    for (const registro of historico) {
      await supabaseClient
        .from('historico')
        .upsert({
          id: registro.id,
          cliente_id: clienteAtual?.id || registro.cliente_id,
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
          onConflict: 'id,cliente_id'
        });
    }

    console.log('✅ Dados sincronizados para o Supabase');
    console.log(`   - ${veiculosNoPatio.length} veículo(s) no pátio`);
    console.log(`   - ${historico.length} registro(s) no histórico`);
    console.log(`   - Cliente: ${clienteAtual?.nome_fantasia || 'N/A'}`);
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
  saveUsuarios,
  // Funções de clientes (multi-tenant)
  fetchClientes,
  createCliente,
  updateCliente,
  // Getter/Setter para cliente atual
  getClienteAtual: () => clienteAtual,
  setClienteAtual: (cliente) => { clienteAtual = cliente; }
};
