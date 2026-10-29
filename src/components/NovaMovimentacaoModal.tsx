import React, { useState, useEffect } from 'react';
import {
  X,
  TrendingDown,
  TrendingUp,
  SlidersHorizontal,
  Package,
  User,
  AlertTriangle,
  CheckCircle,
  FileText,
  DollarSign,
  ScanBarcode,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useStock } from '../context/StockContext.tsx';
import { formatCurrencyBRL } from '../utils/stockCalculations.ts';

interface NovaMovimentacaoModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialProdutoId?: string;
  initialTipo?: 'ENTRADA' | 'SAIDA' | 'AJUSTE';
}

export const NovaMovimentacaoModal: React.FC<NovaMovimentacaoModalProps> = ({
  isOpen,
  onClose,
  initialProdutoId = '',
  initialTipo = 'SAIDA',
}) => {
  const { produtos, solicitantes, addMovimentacao } = useStock();

  const [tipo, setTipo] = useState<'ENTRADA' | 'SAIDA' | 'AJUSTE'>(initialTipo);
  const [selectedProdutoId, setSelectedProdutoId] = useState<string>(initialProdutoId);
  const [quantidade, setQuantidade] = useState<string>('1');
  const [matricula, setMatricula] = useState<string>('');
  const [nomeReceptor, setNomeReceptor] = useState<string>('');
  const [area, setArea] = useState<string>('');
  const [numeroNf, setNumeroNf] = useState<string>('');
  const [observacao, setObservacao] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (initialProdutoId) {
      setSelectedProdutoId(initialProdutoId);
    }
    if (initialTipo) {
      setTipo(initialTipo);
    }
  }, [initialProdutoId, initialTipo, isOpen]);

  // Encontra o produto selecionado
  const produtoSelecionado = produtos.find(
    (p) => p.id === selectedProdutoId || p.codigo === selectedProdutoId
  );

  // Auto-preenchimento ao digitar ou selecionar matrícula
  const handleMatriculaChange = (mat: string) => {
    setMatricula(mat);
    const trimmed = mat.trim().toUpperCase();
    const found = solicitantes.find((s) => s.matricula.trim().toUpperCase() === trimmed);
    if (found) {
      setNomeReceptor(found.nome);
      setArea(found.area_departamento);
      setErrorMessage(null);
    } else {
      setNomeReceptor('');
      setArea('');
    }
  };

  const qtdNum = parseFloat(quantidade) || 0;
  const saldoAtual = produtoSelecionado?.estoque_atual ?? 0;
  const saldoInsuficiente = tipo === 'SAIDA' && qtdNum > saldoAtual;

  const valorTotalMov = produtoSelecionado
    ? Number((qtdNum * produtoSelecionado.valor_unitario).toFixed(2))
    : 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!selectedProdutoId) {
      setErrorMessage('Por favor, selecione um produto.');
      return;
    }

    if (qtdNum <= 0) {
      setErrorMessage('A quantidade deve ser maior que zero.');
      return;
    }

    if (tipo === 'SAIDA') {
      if (saldoInsuficiente) {
        setErrorMessage(`Saldo insuficiente! Estoque disponível: ${saldoAtual}`);
        return;
      }
      if (!matricula.trim()) {
        setErrorMessage('Para saídas, a matrícula do solicitante é obrigatória.');
        return;
      }
    }

    const res = addMovimentacao({
      tipo_movimentacao: tipo,
      produto_id: selectedProdutoId,
      quantidade: qtdNum,
      matricula_solicitante: matricula,
      numero_nf: numeroNf,
      observacao,
    });

    if (res.success) {
      // Dispara efeito visual de sucesso
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.8 },
        });
      } catch (err) {
        // no-op
      }

      onClose();
    } else {
      setErrorMessage(res.message || 'Erro ao registrar movimentação.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-[#141624] border border-[#2d3248] rounded-2xl max-w-xl w-full p-6 shadow-2xl overflow-y-auto max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#25293d]">
          <div className="flex items-center gap-2">
            <span
              className={`p-2 rounded-lg ${
                tipo === 'SAIDA'
                  ? 'bg-rose-500/20 text-rose-400'
                  : tipo === 'ENTRADA'
                  ? 'bg-emerald-500/20 text-emerald-400'
                  : 'bg-blue-500/20 text-blue-400'
              }`}
            >
              {tipo === 'SAIDA' ? (
                <TrendingDown className="w-5 h-5" />
              ) : tipo === 'ENTRADA' ? (
                <TrendingUp className="w-5 h-5" />
              ) : (
                <SlidersHorizontal className="w-5 h-5" />
              )}
            </span>
            <div>
              <h2 className="text-base font-bold text-white tracking-wide">
                Lançamento Rápido de Movimentação
              </h2>
              <p className="text-xs text-slate-400">
                Almoxarifado & Controle Operacional de Estoque
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-[#202436] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Type Toggle Selector */}
        <div className="grid grid-cols-3 gap-2 my-4">
          <button
            type="button"
            onClick={() => {
              setTipo('SAIDA');
              setErrorMessage(null);
            }}
            className={`py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              tipo === 'SAIDA'
                ? 'bg-rose-600 text-white shadow-lg shadow-rose-950/50'
                : 'bg-[#1b1e2e] text-slate-400 hover:text-white border border-[#2b3046]'
            }`}
          >
            <TrendingDown className="w-4 h-4" />
            <span>SAÍDA (Consumo)</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setTipo('ENTRADA');
              setErrorMessage(null);
            }}
            className={`py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              tipo === 'ENTRADA'
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-950/50'
                : 'bg-[#1b1e2e] text-slate-400 hover:text-white border border-[#2b3046]'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>ENTRADA (Receb.)</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setTipo('AJUSTE');
              setErrorMessage(null);
            }}
            className={`py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              tipo === 'AJUSTE'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-950/50'
                : 'bg-[#1b1e2e] text-slate-400 hover:text-white border border-[#2b3046]'
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>AJUSTE (Inventário)</span>
          </button>
        </div>

        {errorMessage && (
          <div className="bg-rose-950/80 border border-rose-700/80 rounded-xl p-3 mb-4 flex items-center gap-2 text-rose-200 text-xs">
            <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Material Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center justify-between">
              <span>Material / Produto *</span>
              <span className="text-[10px] text-slate-400">Pesquise por código ou nome</span>
            </label>
            <select
              value={selectedProdutoId}
              onChange={(e) => {
                setSelectedProdutoId(e.target.value);
                setErrorMessage(null);
              }}
              required
              className="w-full bg-[#1b1e2e] border border-[#2d3249] rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-rose-500 font-mono"
            >
              <option value="">Selecione o produto...</option>
              {produtos.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.codigo} — {p.descricao_produto} (Saldo: {p.estoque_atual} {p.unidade_medida} • Loc: {p.localizacao_fisica})
                </option>
              ))}
            </select>
          </div>

          {/* Product Live Overview Card */}
          {produtoSelecionado && (
            <div className="bg-[#191c2b] border border-[#282d42] rounded-xl p-3.5 space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-mono font-bold text-rose-400">
                    {produtoSelecionado.codigo}
                  </span>
                  <div className="text-xs font-bold text-white">
                    {produtoSelecionado.descricao_produto}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] text-slate-400">Saldo Atual</div>
                  <div
                    className={`text-base font-mono font-black ${
                      produtoSelecionado.estoque_atual <= 0
                        ? 'text-rose-400'
                        : produtoSelecionado.estoque_atual <= produtoSelecionado.estoque_minimo
                        ? 'text-amber-400'
                        : 'text-emerald-400'
                    }`}
                  >
                    {produtoSelecionado.estoque_atual} {produtoSelecionado.unidade_medida}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-[#23283c] text-[11px] text-slate-400">
                <div>
                  Localização:{' '}
                  <strong className="text-slate-200 font-mono">
                    {produtoSelecionado.localizacao_fisica}
                  </strong>
                </div>
                <div>
                  Custo Unit.:{' '}
                  <strong className="text-slate-200 font-mono">
                    {formatCurrencyBRL(produtoSelecionado.valor_unitario)}
                  </strong>
                </div>
                <div>
                  Est. Mínimo:{' '}
                  <strong className="text-slate-200 font-mono">
                    {produtoSelecionado.estoque_minimo}
                  </strong>
                </div>
              </div>
            </div>
          )}

          {/* Quantity & Value Calculation */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Quantidade {tipo === 'AJUSTE' ? 'Nova (Saldo)' : 'a Movimentar'} *
              </label>
              <input
                type="number"
                step="any"
                min="0.01"
                value={quantidade}
                onChange={(e) => {
                  setQuantidade(e.target.value);
                  setErrorMessage(null);
                }}
                required
                className={`w-full bg-[#1b1e2e] border rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none ${
                  saldoInsuficiente
                    ? 'border-rose-500 focus:border-rose-400'
                    : 'border-[#2d3249] focus:border-rose-500'
                }`}
              />
              {saldoInsuficiente && (
                <span className="text-[10px] text-rose-400 font-bold block mt-1">
                  Saldo insuficiente! Saldo atual é {saldoAtual}.
                </span>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Valor Total da Movimentação
              </label>
              <div className="w-full bg-[#171926] border border-[#272b3e] rounded-xl px-3 py-2 text-xs font-mono font-bold text-white flex items-center justify-between">
                <span>{formatCurrencyBRL(valorTotalMov)}</span>
                <span className="text-[10px] text-slate-400 font-normal">calculado</span>
              </div>
            </div>
          </div>

          {/* Solicitante Section (Mandatory for SAIDA) */}
          {tipo === 'SAIDA' && (
            <div className="border-t border-[#25293d] pt-3 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <User className="w-4 h-4 text-rose-400" />
                  Identificação do Solicitante / Receptor *
                </span>
                <span className="text-[10px] text-slate-400">
                  Preenche nome e área automaticamente
                </span>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    Matrícula *
                  </label>
                  <input
                    type="text"
                    list="solicitantes-list"
                    placeholder="Ex: YSP115"
                    value={matricula}
                    onChange={(e) => handleMatriculaChange(e.target.value)}
                    required
                    className="w-full bg-[#1b1e2e] border border-[#2d3249] rounded-xl px-3 py-2 text-xs text-white font-mono uppercase focus:outline-none focus:border-rose-500"
                  />
                  <datalist id="solicitantes-list">
                    {solicitantes.map((s) => (
                      <option key={s.id} value={s.matricula}>
                        {s.nome} - {s.area_departamento}
                      </option>
                    ))}
                  </datalist>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    Nome do Receptor
                  </label>
                  <input
                    type="text"
                    value={nomeReceptor}
                    onChange={(e) => setNomeReceptor(e.target.value)}
                    placeholder="Nome automático"
                    className="w-full bg-[#171926] border border-[#282d40] rounded-xl px-3 py-2 text-xs text-slate-300 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    Área / Setor
                  </label>
                  <input
                    type="text"
                    value={area}
                    onChange={(e) => setArea(e.target.value)}
                    placeholder="Área automática"
                    className="w-full bg-[#171926] border border-[#282d40] rounded-xl px-3 py-2 text-xs text-slate-300 font-mono"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Nota Fiscal (para Entradas) */}
          {tipo === 'ENTRADA' && (
            <div className="border-t border-[#25293d] pt-3">
              <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-emerald-400" />
                Número da Nota Fiscal (NF-e)
              </label>
              <input
                type="text"
                placeholder="Ex: NF-0049182 / Série 1"
                value={numeroNf}
                onChange={(e) => setNumeroNf(e.target.value)}
                className="w-full bg-[#1b1e2e] border border-[#2d3249] rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
              />
            </div>
          )}

          {/* Observação */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Observação / Motivo (Opcional)
            </label>
            <input
              type="text"
              placeholder="Ex: Reposição de linha, O.S. 4029, Troca de turno..."
              value={observacao}
              onChange={(e) => setObservacao(e.target.value)}
              className="w-full bg-[#1b1e2e] border border-[#2d3249] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-500"
            />
          </div>

          {/* Submit and Cancel Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t border-[#25293d]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-[#1f2233] hover:bg-[#282c42] text-slate-300 rounded-xl text-xs font-semibold transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saldoInsuficiente}
              className={`px-5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-lg ${
                saldoInsuficiente
                  ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                  : tipo === 'SAIDA'
                  ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-950/60'
                  : tipo === 'ENTRADA'
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-950/60'
                  : 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-950/60'
              }`}
            >
              <CheckCircle className="w-4 h-4" />
              <span>Confirmar Lançamento</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
