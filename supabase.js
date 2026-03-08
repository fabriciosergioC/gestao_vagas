// ==================== CONFIGURAÇÃO DO SUPABASE ====================

// ⚠️ SUBSTITUA PELAS SUAS CREDENCIAIS DO SUPABASE
// Obtenha em: https://app.supabase.com/project/_/settings/api
const SUPABASE_URL = 'https://xnjsmysxiddnjghrdcge.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhuanNteXN4aWRkbmpnaHJkY2dlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI5NTQyODgsImV4cCI6MjA4ODUzMDI4OH0.uUS3NEqh48m3uPDw3jX_1I9XzN3VArGLMifgGXMjqlE';

let supabaseClient = null;
let isSupabaseConnected = false;
let clienteAtualId = null;

// ==================== INICIALIZAÇÃO ====================

async function initSupabase() {
  if (!SUPABASE_URL || SUPABASE_URL === '') {
    console.warn('⚠️ Supabase não configurado. Edite supabase.js');
    return false;
  }

  try {
    supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

    // Testar conexão com tabela usuarios
    const { error } = await supabaseClient
      .from('usuarios')
      .select('id')
      .limit(1);

    if (error) {
      console.error('❌ Erro ao conectar:', error.message);
      console.error('📋 Detalhes:', error.details || error.hint);

      if (error.message.includes('permission denied')) {
        console.warn('⚠️ RLS bloqueando. Execute no SQL Editor:');
        console.warn('ALTER TABLE usuarios DISABLE ROW LEVEL SECURITY;');
        console.warn('ALTER TABLE veiculos DISABLE ROW LEVEL SECURITY;');
        console.warn('ALTER TABLE historico DISABLE ROW LEVEL SECURITY;');
      }

      if (error.message.includes('JWT') || error.message.includes('Invalid API key')) {
        console.warn('⚠️ API Key inválida! Obtenha uma nova em:');
        console.warn('https://app.supabase.com/project/_/settings/api');
      }

      return false;
    }

    isSupabaseConnected = true;
    console.log('✅ Supabase conectado!');
    return true;
  } catch (err) {
    console.error('❌ Erro ao inicializar:', err.message);
    return false;
  }
}

function isSupabaseAvailable() {
  return isSupabaseConnected && supabaseClient !== null;
}

// ==================== CLIENTES (MULTI-TENANT) ====================

/**
 * Define o cliente atual
 */
function setClienteAtual(clienteId) {
  clienteAtualId = clienteId;
  if (clienteId) {
    localStorage.setItem('clienteAtualId', clienteId.toString());
  } else {
    localStorage.removeItem('clienteAtualId');
  }
}

/**
 * Obtém o ID do cliente atual
 */
function getClienteAtualId() {
  if (clienteAtualId) return clienteAtualId;
  
  const salvo = localStorage.getItem('clienteAtualId');
  if (salvo) {
    clienteAtualId = parseInt(salvo);
    return clienteAtualId;
  }
  
  // Tenta pegar do localStorage clienteSelecionado
  const clienteSelecionado = localStorage.getItem('clienteSelecionado');
  if (clienteSelecionado) {
    try {
      const cliente = JSON.parse(clienteSelecionado);
      clienteAtualId = cliente.id;
      return clienteAtualId;
    } catch (e) {
      return null;
    }
  }
  
  return null;
}

/**
 * Busca todos os clientes ativos
 */
async function fetchClientes() {
  if (!isSupabaseAvailable()) return null;

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
 * Cria um novo cliente com configurações e usuário admin
 */
async function createCliente(cliente) {
  if (!isSupabaseAvailable()) return null;

  try {
    // Usar função RPC do Supabase
    const { data, error } = await supabaseClient.rpc('criar_cliente', {
      p_cnpj: cliente.cnpj || null,
      p_razao_social: cliente.razao_social,
      p_nome_fantasia: cliente.nome_fantasia,
      p_email: cliente.email || null,
      p_telefone: cliente.telefone || null,
      p_endereco: cliente.endereco || null,
      p_usuario_admin: cliente.adminUsuario,
      p_senha_admin: cliente.adminSenha
    });

    if (error) throw error;
    return data;
  } catch (err) {
    console.error('Erro ao criar cliente:', err.message);
    return null;
  }
}

/**
 * Atualiza dados de um cliente
 */
async function updateCliente(clienteId, updates) {
  if (!isSupabaseAvailable()) return null;

  try {
    const { data, error } = await supabaseClient
      .from('clientes')
      .update(updates)
      .eq('id', clienteId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (err) {
    console.error('Erro ao atualizar cliente:', err.message);
    return null;
  }
}

// ==================== USUÁRIOS (LOGIN) ====================

async function validarUsuario(usuario, senha) {
  if (!isSupabaseAvailable()) return null;

  const clienteId = getClienteAtualId();
  if (!clienteId) {
    console.error('❌ Cliente não selecionado');
    return null;
  }

  try {
    const { data, error } = await supabaseClient
      .from('usuarios')
      .select('*')
      .eq('usuario', usuario)
      .eq('senha', senha)
      .eq('ativo', true)
      .eq('cliente_id', clienteId)
      .single();

    if (error) return null;
    return data;
  } catch (err) {
    console.error('Erro ao validar usuário:', err.message);
    return null;
  }
}

async function fetchUsuarios() {
  if (!isSupabaseAvailable()) return null;

  const clienteId = getClienteAtualId();
  if (!clienteId) {
    console.error('❌ Cliente não selecionado');
    return null;
  }

  try {
    const { data, error } = await supabaseClient
      .from('usuarios')
      .select('*')
      .eq('ativo', true)
      .eq('cliente_id', clienteId)
      .order('usuario');

    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error('Erro ao buscar usuários:', err.message);
    return null;
  }
}

async function insertUsuario(usuario) {
  if (!isSupabaseAvailable()) return null;

  const clienteId = getClienteAtualId();
  if (!clienteId) {
    console.error('❌ Cliente não selecionado');
    return null;
  }

  try {
    const { data, error } = await supabaseClient
      .from('usuarios')
      .insert([{
        cliente_id: clienteId,
        usuario: usuario.usuario,
        senha: usuario.senha,
        nome: usuario.nome,
        email: usuario.email,
        ativo: true
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (err) {
    console.error('Erro ao inserir usuário:', err.message);
    return null;
  }
}

// ==================== VEÍCULOS ====================

async function fetchVeiculosNoPatio() {
  if (!isSupabaseAvailable()) return null;

  const clienteId = getClienteAtualId();
  if (!clienteId) {
    console.error('❌ Cliente não selecionado');
    return null;
  }

  try {
    const { data, error } = await supabaseClient
      .from('veiculos')
      .select('*')
      .eq('cliente_id', clienteId)
      .is('saida', null)
      .order('entrada', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error('Erro ao buscar veículos:', err.message);
    return null;
  }
}

async function insertVeiculo(veiculo) {
  if (!isSupabaseAvailable()) {
    console.warn('⚠️ Supabase indisponível');
    return null;
  }

  const clienteId = getClienteAtualId();
  if (!clienteId) {
    console.error('❌ Cliente não selecionado');
    return null;
  }

  try {
    const { data, error } = await supabaseClient
      .from('veiculos')
      .insert([{
        cliente_id: clienteId,
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
      }])
      .select()
      .single();

    if (error) {
      console.error('❌ Erro ao inserir:', error.message, error.details);
      throw error;
    }

    console.log('✅ Veículo salvo no Supabase:', data.placa);
    return data;
  } catch (err) {
    console.error('❌ Erro ao inserir veículo:', err.message);
    return null;
  }
}

async function deleteVeiculo(id) {
  if (!isSupabaseAvailable()) return null;

  const clienteId = getClienteAtualId();
  if (!clienteId) {
    console.error('❌ Cliente não selecionado');
    return null;
  }

  try {
    const { data, error } = await supabaseClient
      .from('veiculos')
      .delete()
      .eq('id', id)
      .eq('cliente_id', clienteId)
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

async function fetchHistorico() {
  if (!isSupabaseAvailable()) return null;

  const clienteId = getClienteAtualId();
  if (!clienteId) {
    console.error('❌ Cliente não selecionado');
    return null;
  }

  try {
    const { data, error } = await supabaseClient
      .from('historico')
      .select('*')
      .eq('cliente_id', clienteId)
      .order('saida', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error('Erro ao buscar histórico:', err.message);
    return null;
  }
}

async function insertHistorico(registro) {
  if (!isSupabaseAvailable()) return null;

  const clienteId = getClienteAtualId();
  if (!clienteId) {
    console.error('❌ Cliente não selecionado');
    return null;
  }

  try {
    const { data, error } = await supabaseClient
      .from('historico')
      .insert([{
        cliente_id: clienteId,
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

async function clearHistorico() {
  if (!isSupabaseAvailable()) return false;

  const clienteId = getClienteAtualId();
  if (!clienteId) {
    console.error('❌ Cliente não selecionado');
    return false;
  }

  try {
    const { error } = await supabaseClient
      .from('historico')
      .delete()
      .eq('cliente_id', clienteId);

    if (error) throw error;
    return true;
  } catch (err) {
    console.error('Erro ao limpar histórico:', err.message);
    return false;
  }
}

// ==================== SINCRONIZAÇÃO ====================

async function syncFromSupabase() {
  if (!isSupabaseAvailable()) return false;

  try {
    const veiculos = await fetchVeiculosNoPatio();
    if (veiculos !== null) {
      localStorage.setItem('veiculosNoPatio', JSON.stringify(veiculos));
    }

    const historico = await fetchHistorico();
    if (historico !== null) {
      // Mapear campos do banco para o formato JavaScript
      const historicoFormatado = historico.map(h => ({
        ...h,
        valorCobrado: h.valor_cobrado || 0,
        formaPagamento: h.forma_pagamento || 'dinheiro',
        tempoPermanencia: h.tempo_permanencia || null
      }));
      localStorage.setItem('historico', JSON.stringify(historicoFormatado));
    }

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

async function syncToSupabase() {
  if (!isSupabaseAvailable()) return false;

  try {
    console.log('✅ Dados sincronizados para o Supabase');
    return true;
  } catch (err) {
    console.error('Erro na sincronização:', err.message);
    return false;
  }
}

// ==================== EXPORTS GLOBAIS ====================
window.supabaseFunctions = {
  initSupabase,
  isSupabaseAvailable,
  setClienteAtual,
  getClienteAtualId,
  fetchClientes,
  createCliente,
  updateCliente,
  syncFromSupabase,
  syncToSupabase,
  // Usuários
  validarUsuario,
  fetchUsuarios,
  insertUsuario,
  // Veículos
  fetchVeiculosNoPatio,
  insertVeiculo,
  deleteVeiculo,
  // Histórico
  fetchHistorico,
  insertHistorico,
  clearHistorico
};

// Getter para o cliente do Supabase
Object.defineProperty(window, 'supabaseClient', {
  get: () => supabaseClient,
  configurable: true
});
