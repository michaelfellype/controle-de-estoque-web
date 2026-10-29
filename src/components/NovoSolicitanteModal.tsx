import React, { useState } from 'react';
import { X, UserPlus, AlertTriangle } from 'lucide-react';
import { useStock } from '../context/StockContext.tsx';

interface NovoSolicitanteModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NovoSolicitanteModal: React.FC<NovoSolicitanteModalProps> = ({ isOpen, onClose }) => {
  const { addSolicitante } = useStock();

  const [matricula, setMatricula] = useState('');
  const [nome, setNome] = useState('');
  const [area, setArea] = useState('PRODUÇÃO');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const res = addSolicitante({
      matricula,
      nome,
      area_departamento: area,
    });

    if (res.success) {
      onClose();
    } else {
      setError(res.message || 'Erro ao cadastrar solicitante.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-[#141624] border border-[#2d3248] rounded-2xl max-w-md w-full p-6 shadow-2xl">
        <div className="flex items-center justify-between pb-4 border-b border-[#25293d]">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-lg bg-rose-500/20 text-rose-400">
              <UserPlus className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-base font-bold text-white tracking-wide">
                Cadastrar Solicitante
              </h2>
              <p className="text-xs text-slate-400">
                Colaborador autorizado a retirar materiais
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
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Matrícula / ID Funcional *
            </label>
            <input
              type="text"
              placeholder="Ex: YSP115 ou MATR-042"
              value={matricula}
              onChange={(e) => setMatricula(e.target.value.toUpperCase())}
              required
              className="w-full bg-[#1b1e2e] border border-[#2d3249] rounded-xl px-3 py-2 text-xs text-white font-mono uppercase focus:outline-none focus:border-rose-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Nome Completo *
            </label>
            <input
              type="text"
              placeholder="Ex: JOÃO CARLOS DA SILVA"
              value={nome}
              onChange={(e) => setNome(e.target.value.toUpperCase())}
              required
              className="w-full bg-[#1b1e2e] border border-[#2d3249] rounded-xl px-3 py-2 text-xs text-white uppercase focus:outline-none focus:border-rose-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Área / Departamento *
            </label>
            <input
              type="text"
              placeholder="Ex: PRODUÇÃO, MANUTENÇÃO, LOGÍSTICA..."
              value={area}
              onChange={(e) => setArea(e.target.value.toUpperCase())}
              required
              className="w-full bg-[#1b1e2e] border border-[#2d3249] rounded-xl px-3 py-2 text-xs text-white uppercase font-mono focus:outline-none focus:border-rose-500"
            />
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
              Salvar Solicitante
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
