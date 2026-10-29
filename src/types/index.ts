/**
 * Modelos de dados e tipos para o WMS Almoxarifado Pro
 */

export type UnidadeMedida = 'PAR' | 'UN' | 'UND' | 'KG' | 'CX' | 'PCT' | 'L' | 'M' | 'RL';

export type TipoMovimentacao = 'ENTRADA' | 'SAIDA' | 'AJUSTE';

export type StatusEstoque = 'REGULAR' | 'COMPRAR_CRITICO' | 'SEM_ESTOQUE';

export type UserRole = 'GESTOR' | 'OPERADOR';

export interface Produto {
  id: string;
  codigo: string; // Ex: MAT-0001
  descricao_produto: string;
  localizacao_fisica: string; // Ex: A-02
  fornecedor: string;
  unidade_medida: UnidadeMedida;
  valor_unitario: number;
  estoque_minimo: number;
  estoque_inicial: number;
  total_entradas: number;
  total_saidas: number;
  estoque_atual: number;
  valor_em_estoque: number;
  status: StatusEstoque;
  validacao: 'OK' | 'Complete o cadastro';
  criado_em: string;
}

export interface Solicitante {
  id: string;
  matricula: string;
  nome: string;
  area_departamento: string;
  ativo: boolean;
  total_requisicoes?: number;
}

export interface Movimentacao {
  id: string;
  codigo_movimentacao: string; // Ex: MOV-000001
  data_movimentacao: string; // Formato YYYY-MM-DD ou DD/MM/YYYY
  ano: number;
  mes: string; // Ex: set/26 ou Jan
  tipo_movimentacao: TipoMovimentacao;
  produto_id: string;
  codigo_produto: string;
  descricao_produto: string;
  unidade_medida: UnidadeMedida;
  quantidade: number;
  valor_unitario_momento: number;
  valor_total: number;
  fornecedor?: string;
  solicitante_id?: string;
  matricula_solicitante?: string;
  nome_receptor?: string;
  area_solicitante?: string;
  numero_nf?: string;
  observacao?: string;
  criado_por: string;
}

export interface DashboardMetrics {
  patrimonioEstoque: number;
  itensCadastrados: number;
  alertasParaCompra: number;
  itensSemEstoque: number;
  volumeSaidas: number;
  itensRegulares: number;
  totalMovimentacoes: number;
}

export interface TopConsumoItem {
  codigo: string;
  descricao: string;
  quantidade: number;
  unidade: UnidadeMedida;
  valorTotal: number;
}
