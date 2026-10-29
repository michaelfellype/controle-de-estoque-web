import React, { useState } from 'react';
import {
  Search,
  Plus,
  ArrowUpDown,
  Filter,
  DollarSign,
  AlertCircle,
  Package,
  Edit2,
  Trash2,
  CheckCircle,
  ArrowRight,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';
import { useStock } from '../context/StockContext.tsx';
import { Produto } from '../types/index.ts';
import { formatCurrencyBRL } from '../utils/stockCalculations.ts';

interface MateriaisViewProps {
  onOpenNovoProduto: () => void;
  onOpenMovimentacaoParaProduto: (produtoId: string, tipo: 'ENTRADA' | 'SAIDA') => void;
}

export const MateriaisView: React.FC<MateriaisViewProps> = ({
  onOpenNovoProduto,
  onOpenMovimentacaoParaProduto,
}) => {
  const { produtos, userRole, deleteProduto, updateProduto, filtroStatus, setFiltroStatus } = useStock();
  const [searchTerm, setSearchTerm] = useState('');
  const [editingProduto, setEditingProduto] = useState<Produto | null>(null);

  // Filtros aplicados
  const filteredProdutos = produtos.filter((p) => {
    // Busca por texto
    const term = searchTerm.toLowerCase();
    const matchSearch =
      !term ||
      p.codigo.toLowerCase().includes(term) ||
      p.descricao_produto.toLowerCase().includes(term) ||
      p.fornecedor.toLowerCase().includes(term) ||
      p.localizacao_fisica.toLowerCase().includes(term);

    // Filtro por status
    const matchStatus =
      filtroStatus === 'TODOS' ||
      (filtroStatus === 'COMPRAR_CRITICO' && p.status === 'COMPRAR_CRITICO') ||
      (filtroStatus === 'SEM_ESTOQUE' && p.status === 'SEM_ESTOQUE') ||
      (filtroStatus === 'REGULAR' && p.status === 'REGULAR');

    return matchSearch && matchStatus;
  });

  const totalPatrimonio = produtos.reduce((acc, p) => acc + (p.valor_em_estoque || 0), 0);
  const totalItens = produtos.length;

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduto) return;

    updateProduto(editingProduto.id, {
      descricao_produto: editingProduto.descricao_produto,
      localizacao_fisica: editingProduto.localizacao_fisica,
      fornecedor: editingProduto.fornecedor,
      valor_unitario: Number(editingProduto.valor_unitario),
      estoque_minimo: Number(editingProduto.estoque_minimo),
      estoque_inicial: Number(editingProduto.estoque_inicial),
    });

    setEditingProduto(null);
  };

  return (
    <div className="p-4 lg:p-6 space-y-5 max-w-[1700px] mx-auto">
      {/* Top Banner / Excel Spreadsheet Header */}
      <div className="bg-[#12141e] border border-[#232637] rounded-xl p-5 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider bg-rose-500/20 text-rose-400 px-2 py-0.5 rounded border border-rose-500/30">
                Aba Cadastro
              </span>
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                Cadastro de materiais
              </h1>
            </div>
            <p className="text-xs text-slate-400 mt-1 max-w-3xl leading-relaxed">
              Preencha os dados de E.I. (Estoque Inicial). Entradas e saídas acumulam automaticamente o saldo atual e o valor do estoque. Validações inteligentes controlam os alertas de compra.
            </p>
          </div>

          <div className="flex items-center gap-4 bg-[#181a26] border border-[#2a2e40] px-4 py-2.5 rounded-xl self-start md:self-auto">
            <div className="text-right">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                Patrimônio em Estoque
              </span>
              <span className="text-xl font-black text-emerald-400 font-mono">
                {formatCurrencyBRL(totalPatrimonio)}
              </span>
            </div>
            <div className="h-8 w-px bg-[#2f3347]" />
            <div className="text-right">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                Itens Ativos
              </span>
              <span className="text-xl font-black text-white font-mono">
                {totalItens}
              </span>
            </div>
          </div>
        </div>

        {/* Controls, Filters & Actions */}
        <div className="mt-5 pt-4 border-t border-[#1e2130] flex flex-wrap items-center justify-between gap-3">
          {/* Search Bar */}
          <div className="relative flex-1 min-w-[260px] max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por código MAT-xxxx, produto, fornecedor ou prateleira..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#181a26] border border-[#2b2f42] rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-400 focus:outline-none focus:border-rose-500 transition-colors"
            />
          </div>

          {/* Quick Status Filters */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {[
              { id: 'TODOS', label: 'Todos' },
              { id: 'COMPRAR_CRITICO', label: 'Comprar / Crítico' },
              { id: 'SEM_ESTOQUE', label: 'Sem Estoque' },
              { id: 'REGULAR', label: 'Regular' },
            ].map((s) => (
              <button
                key={s.id}
                onClick={() => setFiltroStatus(s.id)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  filtroStatus === s.id
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'bg-[#181a26] text-slate-400 hover:text-white hover:bg-[#202334] border border-[#2a2d3e]'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>

          {/* New Product Button */}
          {userRole === 'OPERADOR' ? (
            <button
              onClick={onOpenNovoProduto}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-bold transition-all shadow-md shadow-rose-950/40"
            >
              <Plus className="w-4 h-4" />
              <span>Novo Produto</span>
            </button>
          ) : (
            <div
              className="text-xs text-slate-400 italic bg-[#171924] px-3 py-1.5 rounded-lg border border-[#262939]"
              title="Apenas operadores podem cadastrar novos produtos"
            >
              Modo Leitura (Gestor)
            </div>
          )}
        </div>
      </div>

      {/* Main Interactive Table matching user spreadsheet */}
      <div className="bg-[#12141e] border border-[#232637] rounded-xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#0b0c12] border-b border-[#232637] text-[11px] font-bold uppercase tracking-wider text-slate-400">
                <th className="py-3 px-3">Código</th>
                <th className="py-3 px-3">Produto</th>
                <th className="py-3 px-3">Localização</th>
                <th className="py-3 px-3">Fornecedor</th>
                <th className="py-3 px-3">Unid</th>
                <th className="py-3 px-3 text-right">Valor Unit.</th>
                <th className="py-3 px-3 text-right">Est. Mín</th>
                <th className="py-3 px-3 text-right">Est. Inicial</th>
                <th className="py-3 px-3 text-right">Entradas</th>
                <th className="py-3 px-3 text-right">Saídas</th>
                <th className="py-3 px-3 text-right">Estoque Atual</th>
                <th className="py-3 px-3 text-right">Valor Total</th>
                <th className="py-3 px-3 text-center">Status</th>
                <th className="py-3 px-3 text-center">Validação</th>
                <th className="py-3 px-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1e2130]">
              {filteredProdutos.length > 0 ? (
                filteredProdutos.map((p) => {
                  return (
                    <tr
                      key={p.id}
                      className="hover:bg-[#181a27] transition-colors group"
                    >
                      {/* Código */}
                      <td className="py-2.5 px-3 font-mono font-bold text-white whitespace-nowrap">
                        {p.codigo}
                      </td>

                      {/* Descrição do Produto */}
                      <td className="py-2.5 px-3 font-medium text-slate-200 min-w-[200px]">
                        {p.descricao_produto}
                      </td>

                      {/* Localização Física */}
                      <td className="py-2.5 px-3 font-mono text-slate-300 whitespace-nowrap">
                        <span className="bg-[#1b1e2b] px-2 py-0.5 rounded border border-[#2e3347] text-[11px]">
                          {p.localizacao_fisica}
                        </span>
                      </td>

                      {/* Fornecedor */}
                      <td className="py-2.5 px-3 text-slate-400 truncate max-w-[130px]">
                        {p.fornecedor}
                      </td>

                      {/* Unidade */}
                      <td className="py-2.5 px-3 text-slate-400 font-mono">
                        {p.unidade_medida}
                      </td>

                      {/* Valor Unitário */}
                      <td className="py-2.5 px-3 text-right font-mono text-slate-300">
                        {formatCurrencyBRL(p.valor_unitario)}
                      </td>

                      {/* Estoque Mínimo */}
                      <td className="py-2.5 px-3 text-right font-mono text-slate-400">
                        {p.estoque_minimo}
                      </td>

                      {/* Estoque Inicial */}
                      <td className="py-2.5 px-3 text-right font-mono text-slate-400">
                        {p.estoque_inicial}
                      </td>

                      {/* Total Entradas */}
                      <td className="py-2.5 px-3 text-right font-mono text-slate-400">
                        {p.total_entradas}
                      </td>

                      {/* Total Saídas */}
                      <td className="py-2.5 px-3 text-right font-mono text-rose-400 font-semibold">
                        {p.total_saidas}
                      </td>

                      {/* Estoque Atual */}
                      <td className="py-2.5 px-3 text-right font-mono font-bold whitespace-nowrap">
                        <span
                          className={`px-2 py-0.5 rounded ${
                            p.estoque_atual <= 0
                              ? 'bg-rose-950/80 text-rose-300 border border-rose-800'
                              : p.estoque_atual <= p.estoque_minimo
                              ? 'bg-amber-950/80 text-amber-300 border border-amber-800'
                              : 'bg-emerald-950/80 text-emerald-300 border border-emerald-800'
                          }`}
                        >
                          {p.estoque_atual}
                        </span>
                      </td>

                      {/* Valor em Estoque */}
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-white whitespace-nowrap">
                        {formatCurrencyBRL(p.valor_em_estoque)}
                      </td>

                      {/* Status */}
                      <td className="py-2.5 px-3 text-center whitespace-nowrap">
                        {p.status === 'COMPRAR_CRITICO' && (
                          <span className="bg-[#4c0519] text-rose-200 border border-rose-700/60 text-[10px] font-bold px-2 py-0.5 rounded tracking-tight">
                            COMPRAR / CRÍTICO
                          </span>
                        )}
                        {p.status === 'SEM_ESTOQUE' && (
                          <span className="bg-[#3b0d18] text-rose-300 border border-rose-800/80 text-[10px] font-bold px-2 py-0.5 rounded tracking-tight">
                            SEM ESTOQUE
                          </span>
                        )}
                        {p.status === 'REGULAR' && (
                          <span className="bg-[#12281e] text-emerald-300 border border-emerald-800/60 text-[10px] font-bold px-2 py-0.5 rounded tracking-tight">
                            REGULAR
                          </span>
                        )}
                      </td>

                      {/* Validação */}
                      <td className="py-2.5 px-3 text-center whitespace-nowrap">
                        {p.validacao === 'OK' ? (
                          <span className="text-emerald-400 font-bold text-[11px] flex items-center justify-center gap-1">
                            <CheckCircle className="w-3 h-3" />
                            OK
                          </span>
                        ) : (
                          <span className="text-slate-400 text-[10px] italic">
                            Complete o cadastro
                          </span>
                        )}
                      </td>

                      {/* Ações */}
                      <td className="py-2.5 px-3 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          {userRole === 'OPERADOR' ? (
                            <>
                              <button
                                onClick={() => onOpenMovimentacaoParaProduto(p.id, 'SAIDA')}
                                disabled={p.estoque_atual <= 0}
                                className={`p-1.5 rounded transition-colors ${
                                  p.estoque_atual <= 0
                                    ? 'text-slate-400 cursor-not-allowed opacity-40'
                                    : 'text-rose-400 hover:bg-rose-950/60 hover:text-rose-300'
                                }`}
                                title="Lançar Saída de Material"
                              >
                                <TrendingDown className="w-3.5 h-3.5" />
                              </button>

                              <button
                                onClick={() => onOpenMovimentacaoParaProduto(p.id, 'ENTRADA')}
                                className="p-1.5 text-emerald-400 hover:bg-emerald-950/60 hover:text-emerald-300 rounded transition-colors"
                                title="Lançar Entrada / Recebimento"
                              >
                                <TrendingUp className="w-3.5 h-3.5" />
                              </button>

                              <button
                                onClick={() => setEditingProduto(p)}
                                className="p-1.5 text-slate-400 hover:text-white hover:bg-[#242738] rounded transition-colors"
                                title="Editar dados do produto"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>

                              <button
                                onClick={() => {
                                  if (confirm(`Deseja excluir o produto ${p.codigo}?`)) {
                                    const res = deleteProduto(p.id);
                                    if (!res.success) alert(res.message);
                                  }
                                }}
                                className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 rounded transition-colors"
                                title="Excluir produto"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </>
                          ) : (
                            <span className="text-[10px] text-slate-400">Leitura</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={15} className="py-12 text-center text-slate-400 text-xs">
                    Nenhum produto encontrado com os filtros aplicados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer info bar */}
        <div className="bg-[#0d0e14] border-t border-[#232637] px-4 py-2.5 flex flex-wrap items-center justify-between text-xs text-slate-400">
          <span>
            Exibindo <strong className="text-white">{filteredProdutos.length}</strong> de{' '}
            <strong className="text-white">{produtos.length}</strong> materiais
          </span>
          <div className="flex items-center gap-4">
            <span>
              Patrimônio filtrado:{' '}
              <strong className="text-emerald-400 font-mono">
                {formatCurrencyBRL(
                  filteredProdutos.reduce((acc, p) => acc + (p.valor_em_estoque || 0), 0)
                )}
              </strong>
            </span>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {editingProduto && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#141622] border border-[#2d3144] rounded-xl max-w-lg w-full p-6 shadow-2xl">
            <h2 className="text-base font-bold text-white mb-1">
              Editar Material: {editingProduto.codigo}
            </h2>
            <p className="text-xs text-slate-400 mb-4">
              Atualize localização, fornecedor, valor unitário ou estoque mínimo.
            </p>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Descrição do Produto
                </label>
                <input
                  type="text"
                  value={editingProduto.descricao_produto}
                  onChange={(e) =>
                    setEditingProduto({ ...editingProduto, descricao_produto: e.target.value })
                  }
                  required
                  className="w-full bg-[#1b1e2c] border border-[#2d3247] rounded-lg px-3 py-2 text-xs text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Localização Física (Rua/Prateleira)
                  </label>
                  <input
                    type="text"
                    value={editingProduto.localizacao_fisica}
                    onChange={(e) =>
                      setEditingProduto({ ...editingProduto, localizacao_fisica: e.target.value })
                    }
                    className="w-full bg-[#1b1e2c] border border-[#2d3247] rounded-lg px-3 py-2 text-xs text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Fornecedor
                  </label>
                  <input
                    type="text"
                    value={editingProduto.fornecedor}
                    onChange={(e) =>
                      setEditingProduto({ ...editingProduto, fornecedor: e.target.value })
                    }
                    className="w-full bg-[#1b1e2c] border border-[#2d3247] rounded-lg px-3 py-2 text-xs text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Valor Unit. (R$)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={editingProduto.valor_unitario}
                    onChange={(e) =>
                      setEditingProduto({
                        ...editingProduto,
                        valor_unitario: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="w-full bg-[#1b1e2c] border border-[#2d3247] rounded-lg px-3 py-2 text-xs text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Estoque Mínimo
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={editingProduto.estoque_minimo}
                    onChange={(e) =>
                      setEditingProduto({
                        ...editingProduto,
                        estoque_minimo: parseInt(e.target.value, 10) || 0,
                      })
                    }
                    className="w-full bg-[#1b1e2c] border border-[#2d3247] rounded-lg px-3 py-2 text-xs text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Estoque Inicial
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={editingProduto.estoque_inicial}
                    onChange={(e) =>
                      setEditingProduto({
                        ...editingProduto,
                        estoque_inicial: parseInt(e.target.value, 10) || 0,
                      })
                    }
                    className="w-full bg-[#1b1e2c] border border-[#2d3247] rounded-lg px-3 py-2 text-xs text-white font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#262939]">
                <button
                  type="button"
                  onClick={() => setEditingProduto(null)}
                  className="px-4 py-2 bg-[#202334] hover:bg-[#2b2f44] text-slate-300 rounded-lg text-xs font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-bold shadow-md shadow-rose-950/50"
                >
                  Salvar Alterações
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
