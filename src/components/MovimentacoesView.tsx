import React, { useState } from 'react';
import {
  Search,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  SlidersHorizontal,
  Calendar,
  UserCheck,
  FileText,
  Clock,
  ArrowLeftRight,
} from 'lucide-react';
import { useStock } from '../context/StockContext.tsx';
import { formatCurrencyBRL } from '../utils/stockCalculations.ts';

interface MovimentacoesViewProps {
  onOpenNovaMovimentacao: () => void;
}

export const MovimentacoesView: React.FC<MovimentacoesViewProps> = ({
  onOpenNovaMovimentacao,
}) => {
  const { movimentacoes, userRole, filtroTipo, setFiltroTipo, filtroMes, setFiltroMes } = useStock();
  const [searchTerm, setSearchTerm] = useState('');

  // Filtra as movimentações
  const filteredMovs = movimentacoes.filter((m) => {
    const term = searchTerm.toLowerCase();
    const matchSearch =
      !term ||
      m.codigo_movimentacao.toLowerCase().includes(term) ||
      m.codigo_produto.toLowerCase().includes(term) ||
      m.descricao_produto.toLowerCase().includes(term) ||
      (m.matricula_solicitante && m.matricula_solicitante.toLowerCase().includes(term)) ||
      (m.nome_receptor && m.nome_receptor.toLowerCase().includes(term)) ||
      (m.area_solicitante && m.area_solicitante.toLowerCase().includes(term)) ||
      (m.numero_nf && m.numero_nf.toLowerCase().includes(term));

    const matchTipo = filtroTipo === 'TODOS' || m.tipo_movimentacao === filtroTipo;
    const matchMes = filtroMes === 'TODOS' || m.mes.toLowerCase().includes(filtroMes.toLowerCase());

    return matchSearch && matchTipo && matchMes;
  });

  const totalSaidasQtd = filteredMovs
    .filter((m) => m.tipo_movimentacao === 'SAIDA')
    .reduce((sum, m) => sum + m.quantidade, 0);

  const totalSaidasValor = filteredMovs
    .filter((m) => m.tipo_movimentacao === 'SAIDA')
    .reduce((sum, m) => sum + m.valor_total, 0);

  const totalEntradasValor = filteredMovs
    .filter((m) => m.tipo_movimentacao === 'ENTRADA')
    .reduce((sum, m) => sum + m.valor_total, 0);

  return (
    <div className="p-4 lg:p-6 space-y-5 max-w-[1700px] mx-auto">
      {/* Excel Spreadsheet Header Banner */}
      <div className="bg-[#12141e] border border-[#232637] rounded-xl p-5 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider bg-rose-500/20 text-rose-400 px-2 py-0.5 rounded border border-rose-500/30">
                Aba Movimentações
              </span>
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                Movimentações de estoque
              </h1>
            </div>
            <p className="text-xs text-slate-400 mt-1 max-w-3xl leading-relaxed">
              Preencha Data, Tipo, Código e Quantidade. Use Matrícula e Nº NF quando disponíveis. Produto, unidade, valor e receptor são automáticos. Acompanhe entradas, saídas e ajustes de inventário.
            </p>
          </div>

          <div className="flex items-center gap-4 bg-[#181a26] border border-[#2a2e40] px-4 py-2.5 rounded-xl self-start md:self-auto">
            <div className="text-right">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                Total Saídas (Qtd)
              </span>
              <span className="text-xl font-black text-rose-400 font-mono">
                {totalSaidasQtd.toFixed(2)}
              </span>
            </div>
            <div className="h-8 w-px bg-[#2f3347]" />
            <div className="text-right">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                Valor Total Saídas
              </span>
              <span className="text-xl font-black text-white font-mono">
                {formatCurrencyBRL(totalSaidasValor)}
              </span>
            </div>
          </div>
        </div>

        {/* Action Controls & Filters */}
        <div className="mt-5 pt-4 border-t border-[#1e2130] flex flex-wrap items-center justify-between gap-3">
          {/* Search Bar */}
          <div className="relative flex-1 min-w-[260px] max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por código MOV, material, matrícula, receptor ou NF..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#181a26] border border-[#2b2f42] rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-400 focus:outline-none focus:border-rose-500 transition-colors"
            />
          </div>

          {/* Type Filters */}
          <div className="flex items-center gap-1.5">
            {[
              { id: 'TODOS', label: 'Todas' },
              { id: 'SAIDA', label: 'Saídas' },
              { id: 'ENTRADA', label: 'Entradas' },
              { id: 'AJUSTE', label: 'Ajustes' },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setFiltroTipo(t.id)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  filtroTipo === t.id
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'bg-[#181a26] text-slate-400 hover:text-white hover:bg-[#202334] border border-[#2a2d3e]'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* New Movement Button */}
          {userRole === 'OPERADOR' ? (
            <button
              onClick={onOpenNovaMovimentacao}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-bold transition-all shadow-md shadow-rose-950/40"
            >
              <Plus className="w-4 h-4" />
              <span>Registrar Movimentação</span>
            </button>
          ) : (
            <div className="text-xs text-slate-400 italic bg-[#171924] px-3 py-1.5 rounded-lg border border-[#262939]">
              Modo Leitura (Gestor)
            </div>
          )}
        </div>
      </div>

      {/* Movimentações Table matching image 3 */}
      <div className="bg-[#12141e] border border-[#232637] rounded-xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#0b0c12] border-b border-[#232637] text-[11px] font-bold uppercase tracking-wider text-slate-400">
                <th className="py-3 px-3">ID</th>
                <th className="py-3 px-3">Data</th>
                <th className="py-3 px-3">Ano</th>
                <th className="py-3 px-3">Mês</th>
                <th className="py-3 px-3 text-center">Tipo</th>
                <th className="py-3 px-3">Código</th>
                <th className="py-3 px-3">Produto</th>
                <th className="py-3 px-3">Unid</th>
                <th className="py-3 px-3 text-right">Quantidade</th>
                <th className="py-3 px-3 text-right">Valor Unit.</th>
                <th className="py-3 px-3 text-right">Valor Total</th>
                <th className="py-3 px-3">Fornecedor</th>
                <th className="py-3 px-3 font-mono">Matrícula</th>
                <th className="py-3 px-3">Nome Receptor</th>
                <th className="py-3 px-3">Área</th>
                <th className="py-3 px-3">Nº NF</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1e2130]">
              {filteredMovs.length > 0 ? (
                filteredMovs.map((m) => {
                  return (
                    <tr
                      key={m.id}
                      className="hover:bg-[#181a27] transition-colors"
                    >
                      {/* ID / Código Movimentação */}
                      <td className="py-2.5 px-3 font-mono font-bold text-white whitespace-nowrap">
                        {m.codigo_movimentacao}
                      </td>

                      {/* Data */}
                      <td className="py-2.5 px-3 text-slate-300 font-mono whitespace-nowrap">
                        {m.data_movimentacao}
                      </td>

                      {/* Ano */}
                      <td className="py-2.5 px-3 text-slate-400 font-mono">
                        {m.ano}
                      </td>

                      {/* Mês */}
                      <td className="py-2.5 px-3 text-slate-400 font-mono">
                        {m.mes}
                      </td>

                      {/* Tipo */}
                      <td className="py-2.5 px-3 text-center whitespace-nowrap">
                        <span
                          className={`px-2.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${
                            m.tipo_movimentacao === 'SAIDA'
                              ? 'bg-[#4c0519] text-rose-300 border border-rose-700/80'
                              : m.tipo_movimentacao === 'ENTRADA'
                              ? 'bg-[#064e3b] text-emerald-300 border border-emerald-600/80'
                              : 'bg-[#1e3a8a] text-blue-300 border border-blue-600/80'
                          }`}
                        >
                          {m.tipo_movimentacao}
                        </span>
                      </td>

                      {/* Código Produto */}
                      <td className="py-2.5 px-3 font-mono font-bold text-rose-300 whitespace-nowrap">
                        {m.codigo_produto}
                      </td>

                      {/* Produto Descrição */}
                      <td className="py-2.5 px-3 font-medium text-slate-200 min-w-[180px]">
                        {m.descricao_produto}
                      </td>

                      {/* Unidade */}
                      <td className="py-2.5 px-3 text-slate-400 font-mono">
                        {m.unidade_medida}
                      </td>

                      {/* Quantidade */}
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-white whitespace-nowrap">
                        {m.quantidade}
                      </td>

                      {/* Valor Unitário */}
                      <td className="py-2.5 px-3 text-right font-mono text-slate-300 whitespace-nowrap">
                        {formatCurrencyBRL(m.valor_unitario_momento)}
                      </td>

                      {/* Valor Total */}
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-white whitespace-nowrap">
                        {formatCurrencyBRL(m.valor_total)}
                      </td>

                      {/* Fornecedor */}
                      <td className="py-2.5 px-3 text-slate-400 truncate max-w-[120px]">
                        {m.fornecedor || '—'}
                      </td>

                      {/* Matrícula */}
                      <td className="py-2.5 px-3 font-mono text-slate-300 font-bold whitespace-nowrap">
                        {m.matricula_solicitante || '—'}
                      </td>

                      {/* Nome Receptor */}
                      <td className="py-2.5 px-3 text-slate-200 font-medium whitespace-nowrap">
                        {m.nome_receptor || '—'}
                      </td>

                      {/* Área */}
                      <td className="py-2.5 px-3 text-slate-400 whitespace-nowrap">
                        {m.area_solicitante || '—'}
                      </td>

                      {/* Nº NF */}
                      <td className="py-2.5 px-3 font-mono text-slate-400 whitespace-nowrap">
                        {m.numero_nf || '—'}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={16} className="py-12 text-center text-slate-400 text-xs">
                    Nenhuma movimentação encontrada com os filtros selecionados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer info bar */}
        <div className="bg-[#0d0e14] border-t border-[#232637] px-4 py-2.5 flex flex-wrap items-center justify-between text-xs text-slate-400">
          <span>
            Total de registros: <strong className="text-white">{filteredMovs.length}</strong>
          </span>
          <div className="flex items-center gap-4">
            <span>
              Saídas acumuladas:{' '}
              <strong className="text-rose-400 font-mono">
                {formatCurrencyBRL(totalSaidasValor)}
              </strong>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
