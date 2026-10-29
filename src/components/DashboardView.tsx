import React from 'react';
import {
  DollarSign,
  Package,
  AlertOctagon,
  AlertTriangle,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  ExternalLink,
  Info,
  ShoppingCart,
  Calendar,
} from 'lucide-react';
import { useStock } from '../context/StockContext.tsx';
import { formatCurrencyBRL, formatNumberBR } from '../utils/stockCalculations.ts';

interface DashboardViewProps {
  onNavigateToCadastro: () => void;
  onNavigateToMovimentacoes: () => void;
  onOpenNovaMovimentacao: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onNavigateToCadastro,
  onNavigateToMovimentacoes,
  onOpenNovaMovimentacao,
}) => {
  const { metrics, topSaidas, produtos, movimentacoes, filtroMes, filtroAno, userRole } = useStock();

  // Dados mensais para o gráfico de Entradas vs Saídas
  const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
  
  // Agrega valores em R$ por mês
  const monthlyData = meses.map((mesNome, index) => {
    const abrev = mesNome.toLowerCase();
    const movsDoMes = movimentacoes.filter((m) => {
      const matchMes = m.mes.toLowerCase().includes(abrev);
      const matchAno = filtroAno === 'TODOS' || String(m.ano) === String(filtroAno);
      return matchMes && matchAno;
    });

    const entradasR$ = movsDoMes
      .filter((m) => m.tipo_movimentacao === 'ENTRADA')
      .reduce((sum, m) => sum + m.valor_total, 0);

    const saidasR$ = movsDoMes
      .filter((m) => m.tipo_movimentacao === 'SAIDA')
      .reduce((sum, m) => sum + m.valor_total, 0);

    return {
      mes: mesNome,
      entradas: entradasR$,
      saidas: saidasR$,
    };
  });

  const maxMonthlyVal = Math.max(
    ...monthlyData.map((d) => Math.max(d.entradas, d.saidas)),
    20 // fallback minimum scale
  );

  // Produtos mais críticos (estoque <= estoque_minimo)
  const produtosCriticos = produtos
    .filter((p) => p.status === 'COMPRAR_CRITICO' || p.status === 'SEM_ESTOQUE')
    .slice(0, 5);

  // Cálculos para o Donut Chart da Saúde do Estoque
  const totalItens = metrics.itensCadastrados || 110;
  const pctSemEstoque = (metrics.itensSemEstoque / totalItens) * 100;
  const pctCritico = ((metrics.alertasParaCompra - metrics.itensSemEstoque) / totalItens) * 100;
  const pctRegular = (metrics.itensRegulares / totalItens) * 100;

  // Parâmetros do SVG Donut
  const radius = 38;
  const circumference = 2 * Math.PI * radius; // ~238.76
  const strokeSemEstoque = (pctSemEstoque / 100) * circumference;
  const strokeCritico = (pctCritico / 100) * circumference;
  const strokeRegular = (pctRegular / 100) * circumference;

  return (
    <div className="p-4 lg:p-6 space-y-6 max-w-[1600px] mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#212433] pb-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            Painel de controle de estoque
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Saldos, reposição e movimentação de materiais
          </p>
        </div>
        <div className="flex items-center gap-3 text-xs text-slate-400">
          <div className="flex items-center gap-1.5 bg-[#141620] px-3 py-1.5 rounded-lg border border-[#252837]">
            <Calendar className="w-3.5 h-3.5 text-rose-400" />
            <span>Atualizado em 24/09/2026</span>
          </div>
        </div>
      </div>

      {/* 5 KPI Metric Cards Row - Exactly matching Excel screenshot */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5">
        {/* Card 1: Patrimônio em Estoque */}
        <div className="bg-[#13151f] border border-[#262939] rounded-xl p-4 flex flex-col justify-between hover:border-rose-500/40 transition-all shadow-sm">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
            <span>Patrimônio em Estoque</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="my-2">
            <span className="text-xl sm:text-2xl font-black text-white tracking-tight font-mono">
              {formatCurrencyBRL(metrics.patrimonioEstoque)}
            </span>
          </div>
          <div className="text-[11px] text-slate-400">Valor ao custo cadastrado</div>
        </div>

        {/* Card 2: Itens Cadastrados */}
        <div className="bg-[#13151f] border border-[#262939] rounded-xl p-4 flex flex-col justify-between hover:border-rose-500/40 transition-all shadow-sm">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
            <span>Itens Cadastrados</span>
            <Package className="w-4 h-4 text-blue-400" />
          </div>
          <div className="my-2">
            <span className="text-xl sm:text-2xl font-black text-white tracking-tight font-mono">
              {metrics.itensCadastrados}
            </span>
          </div>
          <div className="text-[11px] text-slate-400">Materiais no catálogo</div>
        </div>

        {/* Card 3: Alertas para Compra */}
        <div className="bg-[#13151f] border border-[#262939] rounded-xl p-4 flex flex-col justify-between hover:border-rose-500/40 transition-all shadow-sm">
          <div className="text-[11px] font-bold uppercase tracking-wider text-rose-400 flex items-center justify-between">
            <span>Alertas para Compra</span>
            <AlertTriangle className="w-4 h-4 text-rose-400" />
          </div>
          <div className="my-2">
            <span className="text-xl sm:text-2xl font-black text-rose-400 tracking-tight font-mono">
              {metrics.alertasParaCompra}
            </span>
          </div>
          <div className="text-[11px] text-slate-400">Críticos + sem estoque</div>
        </div>

        {/* Card 4: Itens Sem Estoque */}
        <div className="bg-[#13151f] border border-[#262939] rounded-xl p-4 flex flex-col justify-between hover:border-rose-500/40 transition-all shadow-sm">
          <div className="text-[11px] font-bold uppercase tracking-wider text-rose-300 flex items-center justify-between">
            <span>Itens Sem Estoque</span>
            <AlertOctagon className="w-4 h-4 text-rose-500" />
          </div>
          <div className="my-2">
            <span className="text-xl sm:text-2xl font-black text-white tracking-tight font-mono">
              {metrics.itensSemEstoque}
            </span>
          </div>
          <div className="text-[11px] text-slate-400">Saldo igual ou abaixo de zero</div>
        </div>

        {/* Card 5: Volume de Saídas */}
        <div className="bg-[#13151f] border border-[#262939] rounded-xl p-4 flex flex-col justify-between hover:border-rose-500/40 transition-all shadow-sm col-span-2 md:col-span-1">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
            <span>Volume de Saídas</span>
            <TrendingDown className="w-4 h-4 text-rose-400" />
          </div>
          <div className="my-2">
            <span className="text-xl sm:text-2xl font-black text-white tracking-tight font-mono">
              {formatNumberBR(metrics.volumeSaidas, 2)}
            </span>
          </div>
          <div className="text-[11px] text-slate-400">Soma das quantidades filtradas</div>
        </div>
      </div>

      {/* Explanatory notification bar matching Excel */}
      <div className="flex items-center gap-2 bg-[#141620] border border-[#242738] px-3.5 py-2 rounded-lg text-xs text-slate-400">
        <Info className="w-4 h-4 text-rose-400 flex-shrink-0" />
        <span>
          Os filtros afetam os gráficos de movimentação e o volume de saídas. Os saldos do cadastro são acumulados.
        </span>
      </div>

      {/* Charts Section: Top Saídas & Saúde do Estoque */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Materiais com maior saída */}
        <div className="bg-[#13151f] border border-[#262939] rounded-xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-sm font-bold text-white tracking-wide">
                Materiais com maior saída
              </h2>
              <button
                onClick={onNavigateToMovimentacoes}
                className="text-[11px] text-rose-400 hover:text-rose-300 flex items-center gap-1"
              >
                <span>Ver histórico</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            </div>
            <p className="text-[11px] text-slate-400 mb-6">
              Top 5 por quantidade, na unidade de cada material.
            </p>

            {/* List of top consumed materials */}
            <div className="space-y-4">
              {topSaidas.length > 0 ? (
                topSaidas.map((item, idx) => (
                  <div key={item.codigo} className="space-y-1.5">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-semibold text-slate-200 truncate max-w-[280px]">
                        {item.descricao}
                      </span>
                      <span className="font-mono font-bold text-white ml-2">
                        {item.quantidade} <span className="text-[10px] text-slate-400">{item.unidade}</span>
                      </span>
                    </div>
                    <div className="w-full bg-[#1e2130] h-4 rounded-full overflow-hidden flex">
                      <div
                        className="bg-gradient-to-r from-rose-600 to-rose-500 h-full rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(100, (item.quantidade / (topSaidas[0].quantidade || 1)) * 100)}%` }}
                      />
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-8 text-center text-xs text-slate-400">
                  Nenhuma saída registrada para os filtros selecionados.
                </div>
              )}

              {/* Empty placeholder rows to match the 5 rows shown in the spreadsheet image */}
              {Array.from({ length: Math.max(0, 5 - topSaidas.length) }).map((_, i) => (
                <div key={`empty-${i}`} className="space-y-1.5 opacity-40">
                  <div className="flex justify-between items-center text-xs text-slate-400">
                    <span>—</span>
                    <span className="font-mono">0</span>
                  </div>
                  <div className="w-full bg-[#1b1d28] h-3.5 rounded-full" />
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-[#1e2130] flex items-center justify-between text-xs text-slate-400">
            <span>Filtro ativo: {filtroMes === 'TODOS' ? 'Ano todo' : filtroMes}</span>
            <span className="font-mono font-bold text-slate-200">
              Total Saídas: {metrics.volumeSaidas} un
            </span>
          </div>
        </div>

        {/* Chart 2: Saúde do estoque (Donut Chart) */}
        <div className="bg-[#13151f] border border-[#262939] rounded-xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-sm font-bold text-white tracking-wide">
                Saúde do estoque
              </h2>
              <button
                onClick={onNavigateToCadastro}
                className="text-[11px] text-rose-400 hover:text-rose-300 flex items-center gap-1"
              >
                <span>Ver cadastro</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            </div>
            <p className="text-[11px] text-slate-400 mb-4">
              Saldos calculados a partir dos lançamentos completos.
            </p>

            {/* SVG Donut Visual Representation */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-8 py-2">
              <div className="relative w-44 h-44 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  {/* Background track */}
                  <circle
                    cx="50"
                    cy="50"
                    r={radius}
                    fill="transparent"
                    stroke="#1e2130"
                    strokeWidth="14"
                  />

                  {/* Segment: Sem estoque (Vermelho / Rose) */}
                  <circle
                    cx="50"
                    cy="50"
                    r={radius}
                    fill="transparent"
                    stroke="#e11d48"
                    strokeWidth="14"
                    strokeDasharray={`${strokeSemEstoque} ${circumference}`}
                    strokeDashoffset={0}
                    className="transition-all duration-700"
                  />

                  {/* Segment: Crítico (Slate escuro) */}
                  <circle
                    cx="50"
                    cy="50"
                    r={radius}
                    fill="transparent"
                    stroke="#64748b"
                    strokeWidth="14"
                    strokeDasharray={`${strokeCritico} ${circumference}`}
                    strokeDashoffset={-strokeSemEstoque}
                    className="transition-all duration-700"
                  />

                  {/* Segment: Regular (Slate claro / Verde) */}
                  <circle
                    cx="50"
                    cy="50"
                    r={radius}
                    fill="transparent"
                    stroke="#cbd5e1"
                    strokeWidth="14"
                    strokeDasharray={`${strokeRegular} ${circumference}`}
                    strokeDashoffset={-(strokeSemEstoque + strokeCritico)}
                    className="transition-all duration-700"
                  />
                </svg>

                {/* Donut Center Display */}
                <div className="absolute flex flex-col items-center justify-center text-center">
                  <span className="text-2xl font-black text-white font-mono">
                    {metrics.itensCadastrados}
                  </span>
                  <span className="text-[10px] uppercase tracking-wider text-slate-400">
                    Materiais
                  </span>
                </div>
              </div>

              {/* Legend with exact numbers from spreadsheet */}
              <div className="space-y-3 min-w-[140px]">
                <div className="flex items-center justify-between gap-4 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-[#cbd5e1]" />
                    <span className="text-slate-300">Regular</span>
                  </div>
                  <span className="font-mono font-bold text-white">
                    {metrics.itensRegulares}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-4 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-[#64748b]" />
                    <span className="text-slate-300">Crítico</span>
                  </div>
                  <span className="font-mono font-bold text-white">
                    {metrics.alertasParaCompra - metrics.itensSemEstoque}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-4 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-rose-600" />
                    <span className="text-rose-400 font-semibold">Sem estoque</span>
                  </div>
                  <span className="font-mono font-bold text-rose-400">
                    {metrics.itensSemEstoque}
                  </span>
                </div>

                <div className="pt-2 border-t border-[#232637] text-[11px] text-slate-400">
                  <span className="text-rose-400 font-bold">
                    {((metrics.alertasParaCompra / metrics.itensCadastrados) * 100).toFixed(0)}%
                  </span>{' '}
                  dos itens requerem reposição
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-[#1e2130] flex items-center justify-between text-xs text-slate-400">
            <span>Alerta geral</span>
            <span className="text-rose-400 font-semibold">104 materiais para compra</span>
          </div>
        </div>
      </div>

      {/* Chart 3: Entradas e saídas por mês */}
      <div className="bg-[#13151f] border border-[#262939] rounded-xl p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
          <div>
            <h2 className="text-sm font-bold text-white tracking-wide">
              Entradas e saídas por mês
            </h2>
            <p className="text-[11px] text-slate-400">
              Histórico financeiro mensal de movimentações
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 font-mono">
              VALORES EM R$
            </span>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded bg-slate-400" />
                <span className="text-slate-300">Entradas</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded bg-rose-600" />
                <span className="text-rose-400">Saídas</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bar chart grid */}
        <div className="h-44 w-full flex items-end gap-1 sm:gap-3 pt-6 pb-2 border-b border-[#212433]">
          {monthlyData.map((d) => {
            const hSaidasPct = (d.saidas / maxMonthlyVal) * 100;
            const hEntradasPct = (d.entradas / maxMonthlyVal) * 100;

            return (
              <div key={d.mes} className="flex-1 flex flex-col items-center h-full justify-end group">
                {/* Popover tooltip on hover or if value exists */}
                {d.saidas > 0 && (
                  <span className="text-[10px] font-mono text-rose-400 font-bold mb-1 opacity-90">
                    R$ {d.saidas.toFixed(2)}
                  </span>
                )}
                {d.entradas > 0 && (
                  <span className="text-[10px] font-mono text-slate-300 font-bold mb-1 opacity-90">
                    R$ {d.entradas.toFixed(2)}
                  </span>
                )}

                <div className="w-full flex items-end justify-center gap-1 h-32">
                  {/* Entradas Bar */}
                  <div
                    className="w-2 sm:w-3 bg-slate-500 rounded-t transition-all duration-300"
                    style={{ height: `${Math.max(2, hEntradasPct)}%` }}
                    title={`Entradas ${d.mes}: R$ ${d.entradas.toFixed(2)}`}
                  />
                  {/* Saídas Bar */}
                  <div
                    className="w-2 sm:w-3 bg-rose-600 rounded-t transition-all duration-300"
                    style={{ height: `${Math.max(2, hSaidasPct)}%` }}
                    title={`Saídas ${d.mes}: R$ ${d.saidas.toFixed(2)}`}
                  />
                </div>
                <span className="text-[10px] text-slate-400 mt-2 font-medium">
                  {d.mes}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Quick Action / Critical Materials Carousel */}
      <div className="bg-[#13151f] border border-[#262939] rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <ShoppingCart className="w-4 h-4 text-rose-400" />
            <h2 className="text-sm font-bold text-white tracking-wide">
              Itens com Reposição Urgente (Estoque Crítico ou Zerado)
            </h2>
          </div>
          <button
            onClick={onNavigateToCadastro}
            className="text-xs text-rose-400 hover:text-rose-300 font-semibold"
          >
            Ver todos ({metrics.alertasParaCompra}) →
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {produtosCriticos.map((prod) => (
            <div
              key={prod.id}
              className="bg-[#181a26] border border-[#272b3c] hover:border-rose-500/50 rounded-lg p-3 flex items-center justify-between transition-all"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-mono font-bold text-rose-400">
                    {prod.codigo}
                  </span>
                  <span
                    className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase ${
                      prod.status === 'SEM_ESTOQUE'
                        ? 'bg-rose-950/80 text-rose-300 border border-rose-800'
                        : 'bg-amber-950/80 text-amber-300 border border-amber-800'
                    }`}
                  >
                    {prod.status === 'SEM_ESTOQUE' ? 'Sem Estoque' : 'Crítico'}
                  </span>
                </div>
                <div className="text-xs font-semibold text-white mt-1 truncate max-w-[200px]">
                  {prod.descricao_produto}
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">
                  Saldo: <span className="font-mono text-white font-bold">{prod.estoque_atual}</span> / Mín: {prod.estoque_minimo} {prod.unidade_medida} • Loc: {prod.localizacao_fisica}
                </div>
              </div>

              {userRole === 'OPERADOR' && (
                <button
                  onClick={onOpenNovaMovimentacao}
                  className="px-2.5 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded text-[11px] font-bold shadow-xs transition-colors flex-shrink-0"
                  title="Registrar recebimento/entrada"
                >
                  Repor
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
