import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Produto,
  Solicitante,
  Movimentacao,
  UserRole,
  DashboardMetrics,
  TopConsumoItem,
} from '../types/index.ts';
import {
  initialProdutos,
  initialSolicitantes,
  initialMovimentacoes,
} from '../data/seedData.ts';
import {
  calculateStockLevel,
  calculateStockValue,
  getStockStatus,
  validateExitMovement,
  calculateDashboardKPIs,
  getTopMateriaisSaida,
} from '../utils/stockCalculations.ts';

interface StockContextType {
  produtos: Produto[];
  solicitantes: Solicitante[];
  movimentacoes: Movimentacao[];
  userRole: UserRole;
  activeTab: string;
  filtroAno: string;
  filtroMes: string;
  filtroTipo: string;
  filtroStatus: string;
  searchQuery: string;
  metrics: DashboardMetrics;
  topSaidas: TopConsumoItem[];
  setUserRole: (role: UserRole) => void;
  setActiveTab: (tab: string) => void;
  setFiltroAno: (ano: string) => void;
  setFiltroMes: (mes: string) => void;
  setFiltroTipo: (tipo: string) => void;
  setFiltroStatus: (status: string) => void;
  setSearchQuery: (query: string) => void;
  addMovimentacao: (
    data: {
      tipo_movimentacao: 'ENTRADA' | 'SAIDA' | 'AJUSTE';
      produto_id: string;
      quantidade: number;
      data_movimentacao?: string;
      matricula_solicitante?: string;
      numero_nf?: string;
      observacao?: string;
    }
  ) => { success: boolean; message?: string };
  addProduto: (data: Partial<Produto>) => { success: boolean; message?: string };
  updateProduto: (id: string, updates: Partial<Produto>) => { success: boolean; message?: string };
  deleteProduto: (id: string) => { success: boolean; message?: string };
  addSolicitante: (data: { matricula: string; nome: string; area_departamento: string }) => { success: boolean; message?: string };
  updateSolicitante: (id: string, updates: Partial<Solicitante>) => void;
  toggleSolicitanteAtivo: (id: string) => void;
  resetToOriginalSeed: () => void;
}

const StockContext = createContext<StockContextType | undefined>(undefined);

const STORAGE_KEYS = {
  PRODUTOS: 'wms_produtos_v1',
  SOLICITANTES: 'wms_solicitantes_v1',
  MOVIMENTACOES: 'wms_movimentacoes_v1',
  USER_ROLE: 'wms_user_role_v1',
};

export const StockProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [produtos, setProdutos] = useState<Produto[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PRODUTOS);
      return saved ? JSON.parse(saved) : initialProdutos;
    } catch {
      return initialProdutos;
    }
  });

  const [solicitantes, setSolicitantes] = useState<Solicitante[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SOLICITANTES);
      return saved ? JSON.parse(saved) : initialSolicitantes;
    } catch {
      return initialSolicitantes;
    }
  });

  const [movimentacoes, setMovimentacoes] = useState<Movimentacao[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.MOVIMENTACOES);
      return saved ? JSON.parse(saved) : initialMovimentacoes;
    } catch {
      return initialMovimentacoes;
    }
  });

  const [userRole, setUserRole] = useState<UserRole>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.USER_ROLE);
      return saved === 'GESTOR' ? 'GESTOR' : 'OPERADOR';
    } catch {
      return 'OPERADOR';
    }
  });

  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [filtroAno, setFiltroAno] = useState<string>('2026');
  const [filtroMes, setFiltroMes] = useState<string>('TODOS');
  const [filtroTipo, setFiltroTipo] = useState<string>('TODOS');
  const [filtroStatus, setFiltroStatus] = useState<string>('TODOS');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Persistência local
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.PRODUTOS, JSON.stringify(produtos));
    } catch (e) {
      console.warn('Storage error', e);
    }
  }, [produtos]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.SOLICITANTES, JSON.stringify(solicitantes));
    } catch (e) {
      console.warn('Storage error', e);
    }
  }, [solicitantes]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.MOVIMENTACOES, JSON.stringify(movimentacoes));
    } catch (e) {
      console.warn('Storage error', e);
    }
  }, [movimentacoes]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.USER_ROLE, userRole);
    } catch (e) {
      console.warn('Storage error', e);
    }
  }, [userRole]);

  // Recalcula KPIs e métricas do Dashboard
  const metrics = calculateDashboardKPIs(produtos, movimentacoes, filtroMes, filtroAno);
  const topSaidas = getTopMateriaisSaida(movimentacoes, 5);

  const addMovimentacao = (data: {
    tipo_movimentacao: 'ENTRADA' | 'SAIDA' | 'AJUSTE';
    produto_id: string;
    quantidade: number;
    data_movimentacao?: string;
    matricula_solicitante?: string;
    numero_nf?: string;
    observacao?: string;
  }) => {
    if (userRole === 'GESTOR') {
      return { success: false, message: 'Perfil Gestor possui apenas permissão de consulta (somente leitura).' };
    }

    const produto = produtos.find((p) => p.id === data.produto_id || p.codigo === data.produto_id);
    if (!produto) {
      return { success: false, message: 'Produto não encontrado.' };
    }

    const qtd = Number(data.quantidade);
    if (isNaN(qtd) || qtd <= 0) {
      return { success: false, message: 'A quantidade deve ser um número maior que zero.' };
    }

    // Regra de Validação de Saída
    if (data.tipo_movimentacao === 'SAIDA') {
      const validation = validateExitMovement(produto.estoque_atual, qtd);
      if (!validation.isValid) {
        return { success: false, message: validation.message };
      }

      if (!data.matricula_solicitante) {
        return { success: false, message: 'Para saídas de materiais, é obrigatório informar a matrícula do solicitante.' };
      }
    }

    let solicitanteMatch: Solicitante | undefined;
    if (data.matricula_solicitante) {
      solicitanteMatch = solicitantes.find(
        (s) => s.matricula.trim().toUpperCase() === data.matricula_solicitante?.trim().toUpperCase()
      );
    }

    // Cálculo dos novos saldos do produto
    let novasEntradas = produto.total_entradas;
    let novasSaidas = produto.total_saidas;
    let novoSaldo = produto.estoque_atual;

    if (data.tipo_movimentacao === 'ENTRADA') {
      novasEntradas += qtd;
      novoSaldo = calculateStockLevel(produto.estoque_inicial, novasEntradas, novasSaidas);
    } else if (data.tipo_movimentacao === 'SAIDA') {
      novasSaidas += qtd;
      novoSaldo = calculateStockLevel(produto.estoque_inicial, novasEntradas, novasSaidas);
    } else if (data.tipo_movimentacao === 'AJUSTE') {
      // Ajuste define saldo direto
      novoSaldo = qtd;
    }

    const novoValorTotal = calculateStockValue(novoSaldo, produto.valor_unitario);
    const novoStatus = getStockStatus(novoSaldo, produto.estoque_minimo);

    // Data de lançamento
    const dataMov = data.data_movimentacao || new Date().toISOString().split('T')[0];
    const dateObj = new Date(dataMov);
    const ano = dateObj.getFullYear() || 2026;
    const mesesAbrev = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
    const mesStr = `${mesesAbrev[dateObj.getMonth()] || 'set'}/${String(ano).slice(2)}`;

    const nextIdNum = movimentacoes.length + 1;
    const codigoMov = `MOV-${String(nextIdNum).padStart(6, '0')}`;

    const novaMov: Movimentacao = {
      id: `mov-${Date.now()}`,
      codigo_movimentacao: codigoMov,
      data_movimentacao: dataMov,
      ano,
      mes: mesStr,
      tipo_movimentacao: data.tipo_movimentacao,
      produto_id: produto.id,
      codigo_produto: produto.codigo,
      descricao_produto: produto.descricao_produto,
      unidade_medida: produto.unidade_medida,
      quantidade: qtd,
      valor_unitario_momento: produto.valor_unitario,
      valor_total: Number((qtd * produto.valor_unitario).toFixed(2)),
      fornecedor: produto.fornecedor,
      solicitante_id: solicitanteMatch?.id,
      matricula_solicitante: data.matricula_solicitante?.trim().toUpperCase(),
      nome_receptor: solicitanteMatch ? solicitanteMatch.nome : (data.matricula_solicitante ? 'SOLICITANTE REGISTRADO' : undefined),
      area_solicitante: solicitanteMatch?.area_departamento,
      numero_nf: data.numero_nf,
      observacao: data.observacao,
      criado_por: 'Operador Almoxarifado',
    };

    // Atualiza produto
    setProdutos((prev) =>
      prev.map((p) =>
        p.id === produto.id
          ? {
              ...p,
              total_entradas: novasEntradas,
              total_saidas: novasSaidas,
              estoque_atual: novoSaldo,
              valor_em_estoque: novoValorTotal,
              status: novoStatus,
              validacao: 'OK',
            }
          : p
      )
    );

    // Se houve saída com solicitante, incrementa total_requisicoes
    if (solicitanteMatch && data.tipo_movimentacao === 'SAIDA') {
      setSolicitantes((prev) =>
        prev.map((s) =>
          s.id === solicitanteMatch!.id
            ? { ...s, total_requisicoes: (s.total_requisicoes || 0) + 1 }
            : s
        )
      );
    }

    setMovimentacoes((prev) => [novaMov, ...prev]);

    return { success: true };
  };

  const addProduto = (data: Partial<Produto>) => {
    if (userRole === 'GESTOR') {
      return { success: false, message: 'Perfil Gestor possui apenas permissão de consulta.' };
    }

    if (!data.codigo || !data.descricao_produto) {
      return { success: false, message: 'Código e Descrição do Produto são obrigatórios.' };
    }

    // Verifica unicidade do código
    if (produtos.some((p) => p.codigo.trim().toUpperCase() === data.codigo?.trim().toUpperCase())) {
      return { success: false, message: `Já existe um produto com o código ${data.codigo}.` };
    }

    const estoqueInicial = Number(data.estoque_inicial || 0);
    const estoqueMinimo = Number(data.estoque_minimo || 0);
    const valorUnitario = Number(data.valor_unitario || 0);
    const estoqueAtual = estoqueInicial;
    const valorEstoque = calculateStockValue(estoqueAtual, valorUnitario);
    const status = getStockStatus(estoqueAtual, estoqueMinimo);

    const novoProduto: Produto = {
      id: `mat-${Date.now()}`,
      codigo: data.codigo.trim().toUpperCase(),
      descricao_produto: data.descricao_produto.trim().toUpperCase(),
      localizacao_fisica: (data.localizacao_fisica || 'A-01').trim().toUpperCase(),
      fornecedor: (data.fornecedor || 'FORNECEDOR PADRÃO').trim().toUpperCase(),
      unidade_medida: data.unidade_medida || 'UND',
      valor_unitario: valorUnitario,
      estoque_minimo: estoqueMinimo,
      estoque_inicial: estoqueInicial,
      total_entradas: 0,
      total_saidas: 0,
      estoque_atual: estoqueAtual,
      valor_em_estoque: valorEstoque,
      status,
      validacao: 'OK',
      criado_em: new Date().toISOString(),
    };

    setProdutos((prev) => [novoProduto, ...prev]);
    return { success: true };
  };

  const updateProduto = (id: string, updates: Partial<Produto>) => {
    if (userRole === 'GESTOR') {
      return { success: false, message: 'Perfil Gestor possui apenas permissão de consulta.' };
    }

    setProdutos((prev) =>
      prev.map((p) => {
        if (p.id !== id) return p;

        const updated = { ...p, ...updates };
        const saldo = calculateStockLevel(
          updated.estoque_inicial,
          updated.total_entradas,
          updated.total_saidas
        );
        const valor = calculateStockValue(saldo, updated.valor_unitario);
        const status = getStockStatus(saldo, updated.estoque_minimo);

        return {
          ...updated,
          estoque_atual: saldo,
          valor_em_estoque: valor,
          status,
        };
      })
    );

    return { success: true };
  };

  const deleteProduto = (id: string) => {
    if (userRole === 'GESTOR') {
      return { success: false, message: 'Perfil Gestor possui apenas permissão de consulta.' };
    }

    // Bloqueia exclusão de produtos que já possuem movimentações registradas
    const hasMov = movimentacoes.some((m) => m.produto_id === id);
    if (hasMov) {
      return { success: false, message: 'Este produto possui movimentações registradas no histórico e não pode ser excluído.' };
    }

    setProdutos((prev) => prev.filter((p) => p.id !== id));
    return { success: true };
  };

  const addSolicitante = (data: { matricula: string; nome: string; area_departamento: string }) => {
    if (userRole === 'GESTOR') {
      return { success: false, message: 'Perfil Gestor possui apenas permissão de consulta.' };
    }

    if (!data.matricula || !data.nome) {
      return { success: false, message: 'Matrícula e Nome são obrigatórios.' };
    }

    if (solicitantes.some((s) => s.matricula.trim().toUpperCase() === data.matricula.trim().toUpperCase())) {
      return { success: false, message: `A matrícula ${data.matricula} já está cadastrada.` };
    }

    const novo: Solicitante = {
      id: `sol-${Date.now()}`,
      matricula: data.matricula.trim().toUpperCase(),
      nome: data.nome.trim().toUpperCase(),
      area_departamento: (data.area_departamento || 'PRODUÇÃO').trim().toUpperCase(),
      ativo: true,
      total_requisicoes: 0,
    };

    setSolicitantes((prev) => [...prev, novo]);
    return { success: true };
  };

  const updateSolicitante = (id: string, updates: Partial<Solicitante>) => {
    if (userRole === 'GESTOR') return;
    setSolicitantes((prev) => prev.map((s) => (s.id === id ? { ...s, ...updates } : s)));
  };

  const toggleSolicitanteAtivo = (id: string) => {
    if (userRole === 'GESTOR') return;
    setSolicitantes((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ativo: !s.ativo } : s))
    );
  };

  const resetToOriginalSeed = () => {
    if (userRole === 'GESTOR') return;
    setProdutos(initialProdutos);
    setSolicitantes(initialSolicitantes);
    setMovimentacoes(initialMovimentacoes);
    localStorage.removeItem(STORAGE_KEYS.PRODUTOS);
    localStorage.removeItem(STORAGE_KEYS.SOLICITANTES);
    localStorage.removeItem(STORAGE_KEYS.MOVIMENTACOES);
  };

  return (
    <StockContext.Provider
      value={{
        produtos,
        solicitantes,
        movimentacoes,
        userRole,
        activeTab,
        filtroAno,
        filtroMes,
        filtroTipo,
        filtroStatus,
        searchQuery,
        metrics,
        topSaidas,
        setUserRole,
        setActiveTab,
        setFiltroAno,
        setFiltroMes,
        setFiltroTipo,
        setFiltroStatus,
        setSearchQuery,
        addMovimentacao,
        addProduto,
        updateProduto,
        deleteProduto,
        addSolicitante,
        updateSolicitante,
        toggleSolicitanteAtivo,
        resetToOriginalSeed,
      }}
    >
      {children}
    </StockContext.Provider>
  );
};

export const useStock = () => {
  const ctx = useContext(StockContext);
  if (!ctx) {
    throw new Error('useStock deve ser utilizado dentro de um StockProvider');
  }
  return ctx;
};
