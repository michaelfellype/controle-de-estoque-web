/**
 * Regras de Negócio e Cálculos Matemáticos de Estoque
 */

import { Produto, Movimentacao, StatusEstoque, DashboardMetrics, TopConsumoItem } from '../types/index.ts';

/**
 * Calcula o saldo atual de estoque
 * Estoque Atual = Estoque Inicial + Total Entradas - Total Saídas
 */
export function calculateStockLevel(
  estoqueInicial: number,
  totalEntradas: number,
  totalSaidas: number
): number {
  const saldo = Number(estoqueInicial || 0) + Number(totalEntradas || 0) - Number(totalSaidas || 0);
  return Number(saldo.toFixed(2));
}

/**
 * Calcula o valor financeiro do estoque de um item
 * Valor em Estoque = Saldo Atual * Valor Unitário
 */
export function calculateStockValue(
  estoqueAtual: number,
  valorUnitario: number
): number {
  if (estoqueAtual <= 0) return 0;
  return Number((estoqueAtual * (valorUnitario || 0)).toFixed(2));
}

/**
 * Determina o status do produto com base no estoque atual e mínimo
 * - SEM_ESTOQUE: saldo <= 0
 * - COMPRAR_CRITICO: saldo > 0 e saldo <= estoqueMinimo
 * - REGULAR: saldo > estoqueMinimo
 */
export function getStockStatus(
  estoqueAtual: number,
  estoqueMinimo: number
): StatusEstoque {
  if (estoqueAtual <= 0) {
    return 'SEM_ESTOQUE';
  }
  if (estoqueAtual <= estoqueMinimo) {
    return 'COMPRAR_CRITICO';
  }
  return 'REGULAR';
}

/**
 * Validação de lançamento de movimentação de saída
 * Bloqueia saídas quando quantidade for inválida ou superior ao saldo
 */
export function validateExitMovement(
  estoqueAtual: number,
  quantidadeSolicitada: number
): { isValid: boolean; message?: string } {
  if (quantidadeSolicitada <= 0 || isNaN(quantidadeSolicitada)) {
    return {
      isValid: false,
      message: 'A quantidade a retirar deve ser maior que zero.',
    };
  }

  if (quantidadeSolicitada > estoqueAtual) {
    return {
      isValid: false,
      message: `Saldo insuficiente em estoque! Saldo disponível: ${estoqueAtual}.`,
    };
  }

  return { isValid: true };
}

/**
 * Formata moeda para padrão brasileiro BRL (R$ 3.319,25)
 */
export function formatCurrencyBRL(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value || 0);
}

/**
 * Formata número com decimais brasileiras (ex: 5,00)
 */
export function formatNumberBR(value: number, decimals: number = 2): string {
  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value || 0);
}

/**
 * Calcula as métricas consolidadas do Dashboard
 */
export function calculateDashboardKPIs(
  produtos: Produto[],
  movimentacoes: Movimentacao[],
  filtroMes?: string,
  filtroAno?: string | number
): DashboardMetrics {
  const itensCadastrados = produtos.length;

  let patrimonioEstoque = 0;
  let alertasParaCompra = 0;
  let itensSemEstoque = 0;
  let itensRegulares = 0;

  for (const p of produtos) {
    patrimonioEstoque += p.valor_em_estoque || 0;
    if (p.status === 'SEM_ESTOQUE') {
      itensSemEstoque++;
      alertasParaCompra++; // Críticos + sem estoque
    } else if (p.status === 'COMPRAR_CRITICO') {
      alertasParaCompra++;
    } else if (p.status === 'REGULAR') {
      itensRegulares++;
    }
  }

  // Filtragem de movimentações para cálculo de volume de saídas
  const filteredMovs = movimentacoes.filter((m) => {
    if (filtroAno && filtroAno !== 'TODOS' && String(m.ano) !== String(filtroAno)) {
      return false;
    }
    if (filtroMes && filtroMes !== 'TODOS' && m.mes.toLowerCase() !== filtroMes.toLowerCase()) {
      return false;
    }
    return true;
  });

  const volumeSaidas = filteredMovs
    .filter((m) => m.tipo_movimentacao === 'SAIDA')
    .reduce((acc, m) => acc + (m.quantidade || 0), 0);

  return {
    patrimonioEstoque: Number(patrimonioEstoque.toFixed(2)),
    itensCadastrados,
    alertasParaCompra,
    itensSemEstoque,
    volumeSaidas: Number(volumeSaidas.toFixed(2)),
    itensRegulares,
    totalMovimentacoes: filteredMovs.length,
  };
}

/**
 * Calcula os Top Materiais com Maior Saída
 */
export function getTopMateriaisSaida(
  movimentacoes: Movimentacao[],
  limit: number = 5
): TopConsumoItem[] {
  const saidasMap = new Map<string, { codigo: string; descricao: string; quantidade: number; unidade: any; valorTotal: number }>();

  for (const m of movimentacoes) {
    if (m.tipo_movimentacao === 'SAIDA') {
      const existing = saidasMap.get(m.codigo_produto);
      if (existing) {
        existing.quantidade += m.quantidade;
        existing.valorTotal += m.valor_total;
      } else {
        saidasMap.set(m.codigo_produto, {
          codigo: m.codigo_produto,
          descricao: m.descricao_produto,
          quantidade: m.quantidade,
          unidade: m.unidade_medida,
          valorTotal: m.valor_total,
        });
      }
    }
  }

  return Array.from(saidasMap.values())
    .sort((a, b) => b.quantidade - a.quantidade)
    .slice(0, limit);
}
