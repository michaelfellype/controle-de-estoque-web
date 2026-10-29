import React from 'react';
import {
  TrendingUp,
  Award,
  PieChart,
  Layers,
  ArrowRight,
  Info,
  PackageCheck,
  Percent,
} from 'lucide-react';
import { useStock } from '../context/StockContext.tsx';
import { formatCurrencyBRL } from '../utils/stockCalculations.ts';

export const CurvaABCView: React.FC = () => {
  const { produtos, movimentacoes } = useStock();

  // Calcula o consumo acumulado de cada produto a partir das movimentações de saída
  const consumoPorProduto = produtos.map((prod) => {
    const saidasDoItem = movimentacoes.filter(
      (m) => m.produto_id === prod.id && m.tipo_movimentacao === 'SAIDA'
    );
    const qtdTotalSaida = saidasDoItem.reduce((acc, m) => acc + m.quantidade, 0);
    const valorTotalSaida = saidasDoItem.reduce((acc, m) => acc + m.valor_total, 0);

    return {
      produto: prod,
      qtdSaida: qtdTotalSaida,
      valorSaida: valorTotalSaida,
      valorEstoqueAtual: prod.valor_em_estoque,
      saldoAtual: prod.estoque_atual,
    };
  });

  // Ordena por maior valor de saída
  const ordenadosPorValor = [...consumoPorProduto].sort(
    (a, b) => b.valorSaida - a.valorSaida || b.qtdSaida - a.qtdSaida
  );

  const valorTotalGeral = ordenadosPorValor.reduce((acc, item) => acc + item.valorSaida, 0);

  // Calcula percentual acumulado e classificação ABC
  let acumulado = 0;
  const itensComClasse = ordenadosPorValor.map((item) => {
    const pctIndividual = valorTotalGeral > 0 ? (item.valorSaida / valorTotalGeral) * 100 : 0;
    acumulado += pctIndividual;

    let classe: 'A' | 'B' | 'C' = 'C';
    if (acumulado <= 80 || item.valorSaida > 0) {
      classe = 'A';
    } else if (acumulado <= 95) {
      classe = 'B';
    } else {
      classe = 'C';
    }

    return {
      ...item,
      pctIndividual,
      pctAcumulado: acumulado,
      classe,
    };
  });

  const itensClasseA = itensComClasse.filter((i) => i.classe === 'A' && i.valorSaida > 0);
  const itensClasseB = itensComClasse.filter((i) => i.classe === 'B');
  const itensClasseC = itensComClasse.filter((i) => i.classe === 'C' || i.valorSaida === 0);

  return (
    <div className="p-4 lg:p-6 space-y-6 max-w-[1600px] mx-auto">
      {/* Header Banner */}
      <div className="bg-[#12141e] border border-[#232637] rounded-xl p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider bg-rose-500/20 text-rose-400 px-2 py-0.5 rounded border border-rose-500/30">
            Inteligência de Suprimentos
          </span>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Análise de Giro de Estoque (Curva ABC)
          </h1>
        </div>
        <p className="text-xs text-slate-400 mt-1 max-w-3xl leading-relaxed">
          Classificação dos materiais de maior impacto operacional e financeiro baseada no princípio de Pareto (80/20).
          Itens de <strong>Classe A</strong> respondem pela maior movimentação e exigem atenção redobrada no ponto de reposição para evitar paralisações de linha.
        </p>

        {/* 3 Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-5 pt-4 border-t border-[#1e2130]">
          <div className="bg-[#171926] border border-[#2a2d3e] p-4 rounded-xl flex items-center justify-between">
            <div>
              <div className="text-[10px] font-bold uppercase text-rose-400 tracking-wider">
                Classe A (Alto Giro)
              </div>
              <div className="text-xl font-black text-white mt-1 font-mono">
                {itensClasseA.length} <span className="text-xs text-slate-400 font-sans">itens</span>
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">Até 80% do valor movimentado</div>
            </div>
            <div className="w-10 h-10 rounded-lg bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-rose-400 font-bold">
              A
            </div>
          </div>

          <div className="bg-[#171926] border border-[#2a2d3e] p-4 rounded-xl flex items-center justify-between">
            <div>
              <div className="text-[10px] font-bold uppercase text-amber-400 tracking-wider">
                Classe B (Médio Giro)
              </div>
              <div className="text-xl font-black text-white mt-1 font-mono">
                {itensClasseB.length} <span className="text-xs text-slate-400 font-sans">itens</span>
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">Próximos 15% do valor</div>
            </div>
            <div className="w-10 h-10 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 font-bold">
              B
            </div>
          </div>

          <div className="bg-[#171926] border border-[#2a2d3e] p-4 rounded-xl flex items-center justify-between">
            <div>
              <div className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">
                Classe C (Baixo Giro / Reserva)
              </div>
              <div className="text-xl font-black text-white mt-1 font-mono">
                {itensClasseC.length} <span className="text-xs text-slate-400 font-sans">itens</span>
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">Itens de suporte e reposição</div>
            </div>
            <div className="w-10 h-10 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400 font-bold">
              C
            </div>
          </div>
        </div>
      </div>

      {/* Ranking Table */}
      <div className="bg-[#12141e] border border-[#232637] rounded-xl overflow-hidden shadow-xl">
        <div className="p-4 border-b border-[#232637] flex items-center justify-between">
          <h2 className="text-sm font-bold text-white tracking-wide">
            Ranking de Giro & Consumo de Materiais
          </h2>
          <span className="text-xs text-slate-400">
            Base: Histórico completo de saídas
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#0b0c12] border-b border-[#232637] text-[11px] font-bold uppercase tracking-wider text-slate-400">
                <th className="py-3 px-4 text-center">Classe</th>
                <th className="py-3 px-4">Código</th>
                <th className="py-3 px-4">Descrição do Material</th>
                <th className="py-3 px-4">Localização</th>
                <th className="py-3 px-4 text-right">Qtd Consumida</th>
                <th className="py-3 px-4 text-right">Valor Consumido</th>
                <th className="py-3 px-4 text-right">Saldo Atual</th>
                <th className="py-3 px-4 text-center">Status Estoque</th>
                <th className="py-3 px-4 text-right">Patrimônio Atual</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1e2130]">
              {itensComClasse.slice(0, 20).map((row) => (
                <tr key={row.produto.id} className="hover:bg-[#181a27] transition-colors">
                  <td className="py-3 px-4 text-center">
                    <span
                      className={`w-6 h-6 inline-flex items-center justify-center rounded-full text-xs font-black ${
                        row.classe === 'A' && row.valorSaida > 0
                          ? 'bg-rose-600 text-white shadow-sm'
                          : row.classe === 'B'
                          ? 'bg-amber-600 text-white'
                          : 'bg-slate-700 text-slate-300'
                      }`}
                    >
                      {row.valorSaida > 0 ? row.classe : 'C'}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono font-bold text-white">
                    {row.produto.codigo}
                  </td>
                  <td className="py-3 px-4 font-medium text-slate-200">
                    {row.produto.descricao_produto}
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-400">
                    {row.produto.localizacao_fisica}
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-rose-400">
                    {row.qtdSaida} {row.produto.unidade_medida}
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-white">
                    {formatCurrencyBRL(row.valorSaida)}
                  </td>
                  <td className="py-3 px-4 text-right font-mono text-slate-200">
                    {row.saldoAtual}
                  </td>
                  <td className="py-3 px-4 text-center">
                    {row.produto.status === 'COMPRAR_CRITICO' && (
                      <span className="bg-[#4c0519] text-rose-200 border border-rose-700/60 text-[10px] font-bold px-2 py-0.5 rounded">
                        CRÍTICO
                      </span>
                    )}
                    {row.produto.status === 'SEM_ESTOQUE' && (
                      <span className="bg-[#3b0d18] text-rose-300 border border-rose-800/80 text-[10px] font-bold px-2 py-0.5 rounded">
                        SEM SALDO
                      </span>
                    )}
                    {row.produto.status === 'REGULAR' && (
                      <span className="bg-[#12281e] text-emerald-300 border border-emerald-800/60 text-[10px] font-bold px-2 py-0.5 rounded">
                        REGULAR
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-right font-mono text-slate-300">
                    {formatCurrencyBRL(row.valorEstoqueAtual)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
