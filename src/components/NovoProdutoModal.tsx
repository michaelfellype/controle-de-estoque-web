import React, { useState } from 'react';
import { X, Package, Plus, AlertTriangle } from 'lucide-react';
import { useStock } from '../context/StockContext.tsx';
import { UnidadeMedida } from '../types/index.ts';

interface NovoProdutoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NovoProdutoModal: React.FC<NovoProdutoModalProps> = ({ isOpen, onClose }) => {
  const { addProduto, produtos } = useStock();

  // Sugere próximo código sequencial: MAT-xxxx
  const nextNum = produtos.length + 1;
  const defaultCodigo = `MAT-${String(nextNum).padStart(4, '0')}`;

  const [codigo, setCodigo] = useState(defaultCodigo);
  const [descricao, setDescricao] = useState('');
  const [localizacao, setLocalizacao] = useState('A-01');
  const [fornecedor, setFornecedor] = useState('');
  const [unidade, setUnidade] = useState<UnidadeMedida>('UND');
  const [valorUnitario, setValorUnitario] = useState('10.00');
  const [estoqueMinimo, setEstoqueMinimo] = useState('10');
  const [estoqueInicial, setEstoqueInicial] = useState('0');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const res = addProduto({
      codigo,
      descricao_produto: descricao,
      localizacao_fisica: localizacao,
      fornecedor,
      unidade_medida: unidade,
      valor_unitario: parseFloat(valorUnitario) || 0,
      estoque_minimo: parseInt(estoqueMinimo, 10) || 0,
      estoque_inicial: parseInt(estoqueInicial, 10) || 0,
    });

    if (res.success) {
      onClose();
    } else {
      setError(res.message || 'Erro ao cadastrar material.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-[#141624] border border-[#2d3248] rounded-2xl max-w-lg w-full p-6 shadow-2xl">
        <div className="flex items-center justify-between pb-4 border-b border-[#25293d]">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-lg bg-rose-500/20 text-rose-400">
              <Package className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-base font-bold text-white tracking-wide">
                Cadastrar Novo Material
              </h2>
              <p className="text-xs text-slate-400">
                Adicione um novo item ao catálogo do almoxarifado
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-[#202436]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="bg-rose-950/80 border border-rose-700/80 rounded-xl p-3 my-3 flex items-center gap-2 text-rose-200 text-xs">
            <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-1">
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Código *
              </label>
              <input
                type="text"
                value={codigo}
                onChange={(e) => setCodigo(e.target.value.toUpperCase())}
                required
                className="w-full bg-[#1b1e2e] border border-[#2d3249] rounded-xl px-3 py-2 text-xs text-white font-mono uppercase focus:outline-none focus:border-rose-500"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Descrição do Material *
              </label>
              <input
                type="text"
                placeholder="Ex: LUVA CIRURGICA OU RIBBON"
                value={descricao}
                onChange={(e) => setDescricao(e.target.value.toUpperCase())}
                required
                className="w-full bg-[#1b1e2e] border border-[#2d3249] rounded-xl px-3 py-2 text-xs text-white uppercase focus:outline-none focus:border-rose-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Localização Física
              </label>
              <input
                type="text"
                placeholder="Ex: A-02"
                value={localizacao}
                onChange={(e) => setLocalizacao(e.target.value.toUpperCase())}
                className="w-full bg-[#1b1e2e] border border-[#2d3249] rounded-xl px-3 py-2 text-xs text-white font-mono uppercase focus:outline-none focus:border-rose-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Fornecedor
              </label>
              <input
                type="text"
                placeholder="Ex: NEW HORIZON"
                value={fornecedor}
                onChange={(e) => setFornecedor(e.target.value.toUpperCase())}
                className="w-full bg-[#1b1e2e] border border-[#2d3249] rounded-xl px-3 py-2 text-xs text-white uppercase focus:outline-none focus:border-rose-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Unidade
              </label>
              <select
                value={unidade}
                onChange={(e) => setUnidade(e.target.value as UnidadeMedida)}
                className="w-full bg-[#1b1e2e] border border-[#2d3249] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-500"
              >
                <option value="UND">UND</option>
                <option value="PAR">PAR</option>
                <option value="RL">RL</option>
                <option value="CX">CX</option>
                <option value="PCT">PCT</option>
                <option value="KG">KG</option>
                <option value="L">L</option>
                <option value="M">M</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Valor Unit. (R$) *
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={valorUnitario}
                onChange={(e) => setValorUnitario(e.target.value)}
                required
                className="w-full bg-[#1b1e2e] border border-[#2d3249] rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-rose-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Estoque Mínimo *
              </label>
              <input
                type="number"
                min="0"
                value={estoqueMinimo}
                onChange={(e) => setEstoqueMinimo(e.target.value)}
                required
                className="w-full bg-[#1b1e2e] border border-[#2d3249] rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-rose-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Estoque Inicial
              </label>
              <input
                type="number"
                min="0"
                value={estoqueInicial}
                onChange={(e) => setEstoqueInicial(e.target.value)}
                className="w-full bg-[#1b1e2e] border border-[#2d3249] rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-rose-500"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-[#25293d]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-[#1f2233] hover:bg-[#282c42] text-slate-300 rounded-xl text-xs font-semibold"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-rose-950/60"
            >
              Cadastrar Produto
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
