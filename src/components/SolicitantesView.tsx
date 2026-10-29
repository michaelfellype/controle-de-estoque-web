import React, { useState } from 'react';
import {
  Users,
  Search,
  Plus,
  CheckCircle,
  XCircle,
  Building2,
  BadgeAlert,
  ArrowRight,
  Shield,
  Edit2,
} from 'lucide-react';
import { useStock } from '../context/StockContext.tsx';
import { Solicitante } from '../types/index.ts';

interface SolicitantesViewProps {
  onOpenNovoSolicitante: () => void;
}

export const SolicitantesView: React.FC<SolicitantesViewProps> = ({
  onOpenNovoSolicitante,
}) => {
  const { solicitantes, userRole, toggleSolicitanteAtivo, updateSolicitante } = useStock();
  const [searchTerm, setSearchTerm] = useState('');
  const [editingSolicitante, setEditingSolicitante] = useState<Solicitante | null>(null);

  const filteredSolicitantes = solicitantes.filter((s) => {
    const term = searchTerm.toLowerCase();
    return (
      !term ||
      s.matricula.toLowerCase().includes(term) ||
      s.nome.toLowerCase().includes(term) ||
      s.area_departamento.toLowerCase().includes(term)
    );
  });

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSolicitante) return;

    updateSolicitante(editingSolicitante.id, {
      nome: editingSolicitante.nome.toUpperCase(),
      area_departamento: editingSolicitante.area_departamento.toUpperCase(),
    });

    setEditingSolicitante(null);
  };

  return (
    <div className="p-4 lg:p-6 space-y-5 max-w-[1500px] mx-auto">
      {/* Header Banner matching image 4 */}
      <div className="bg-[#12141e] border border-[#232637] rounded-xl p-5 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider bg-rose-500/20 text-rose-400 px-2 py-0.5 rounded border border-rose-500/30">
                Aba Solicitantes
              </span>
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                Cadastro de solicitantes
              </h1>
            </div>
            <p className="text-xs text-slate-400 mt-1 max-w-3xl leading-relaxed">
              Cadastre matrícula, nome e área. Ao lançar uma saída de material no almoxarifado, a matrícula preenche automaticamente o receptor e o departamento responsável.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {userRole === 'OPERADOR' ? (
              <button
                onClick={onOpenNovoSolicitante}
                className="flex items-center gap-1.5 px-3.5 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-bold transition-all shadow-md shadow-rose-950/40"
              >
                <Plus className="w-4 h-4" />
                <span>Novo Solicitante</span>
              </button>
            ) : (
              <div className="text-xs text-slate-400 italic bg-[#171924] px-3 py-1.5 rounded-lg border border-[#262939]">
                Modo Leitura (Gestor)
              </div>
            )}
          </div>
        </div>

        {/* Search bar */}
        <div className="mt-5 pt-4 border-t border-[#1e2130] flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por matrícula (ex: YSP115), nome ou departamento..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#181a26] border border-[#2b2f42] rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-400 focus:outline-none focus:border-rose-500 transition-colors"
            />
          </div>

          <div className="text-xs text-slate-400">
            Total de solicitantes ativos:{' '}
            <strong className="text-emerald-400 font-mono">
              {solicitantes.filter((s) => s.ativo).length}
            </strong>
          </div>
        </div>
      </div>

      {/* Table matching image 4 */}
      <div className="bg-[#12141e] border border-[#232637] rounded-xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#0b0c12] border-b border-[#232637] text-[11px] font-bold uppercase tracking-wider text-slate-400">
                <th className="py-3 px-4">Matrícula</th>
                <th className="py-3 px-4">Nome do Solicitante</th>
                <th className="py-3 px-4">Área / Departamento</th>
                <th className="py-3 px-4 text-center">Requisições</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-center">Validação</th>
                <th className="py-3 px-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1e2130]">
              {filteredSolicitantes.length > 0 ? (
                filteredSolicitantes.map((s) => {
                  return (
                    <tr
                      key={s.id}
                      className="hover:bg-[#181a27] transition-colors"
                    >
                      {/* Matrícula */}
                      <td className="py-3 px-4 font-mono font-bold text-rose-300 whitespace-nowrap text-sm">
                        {s.matricula}
                      </td>

                      {/* Nome */}
                      <td className="py-3 px-4 font-semibold text-white">
                        {s.nome}
                      </td>

                      {/* Área */}
                      <td className="py-3 px-4 text-slate-300">
                        <span className="bg-[#1a1d2b] px-2.5 py-1 rounded-md border border-[#2d3247] text-xs font-mono">
                          {s.area_departamento}
                        </span>
                      </td>

                      {/* Total Requisições */}
                      <td className="py-3 px-4 text-center font-mono font-bold text-slate-300">
                        {s.total_requisicoes || 0}
                      </td>

                      {/* Ativo / Inativo */}
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            s.ativo
                              ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800'
                              : 'bg-slate-800 text-slate-400 border border-slate-700'
                          }`}
                        >
                          {s.ativo ? 'Ativo' : 'Inativo'}
                        </span>
                      </td>

                      {/* Validação (OK conforme imagem) */}
                      <td className="py-3 px-4 text-center">
                        <span className="text-emerald-400 font-bold text-xs flex items-center justify-center gap-1">
                          <CheckCircle className="w-3.5 h-3.5" />
                          OK
                        </span>
                      </td>

                      {/* Ações */}
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        {userRole === 'OPERADOR' ? (
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => setEditingSolicitante(s)}
                              className="p-1.5 text-slate-400 hover:text-white hover:bg-[#202334] rounded"
                              title="Editar solicitante"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => toggleSolicitanteAtivo(s.id)}
                              className={`text-[10px] px-2 py-1 rounded font-medium transition-colors ${
                                s.ativo
                                  ? 'bg-slate-800 text-slate-400 hover:text-rose-400'
                                  : 'bg-emerald-900/60 text-emerald-300 hover:bg-emerald-800'
                              }`}
                            >
                              {s.ativo ? 'Desativar' : 'Ativar'}
                            </button>
                          </div>
                        ) : (
                          <span className="text-[10px] text-slate-400">Leitura</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400 text-xs">
                    Nenhum solicitante encontrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Solicitante Modal */}
      {editingSolicitante && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#141622] border border-[#2d3144] rounded-xl max-w-md w-full p-6 shadow-2xl">
            <h2 className="text-base font-bold text-white mb-1">
              Editar Solicitante: {editingSolicitante.matricula}
            </h2>
            <p className="text-xs text-slate-400 mb-4">
              Atualize o nome ou departamento autorizado.
            </p>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Nome Completo
                </label>
                <input
                  type="text"
                  value={editingSolicitante.nome}
                  onChange={(e) =>
                    setEditingSolicitante({ ...editingSolicitante, nome: e.target.value })
                  }
                  required
                  className="w-full bg-[#1b1e2c] border border-[#2d3247] rounded-lg px-3 py-2 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Área / Departamento
                </label>
                <input
                  type="text"
                  value={editingSolicitante.area_departamento}
                  onChange={(e) =>
                    setEditingSolicitante({
                      ...editingSolicitante,
                      area_departamento: e.target.value,
                    })
                  }
                  required
                  className="w-full bg-[#1b1e2c] border border-[#2d3247] rounded-lg px-3 py-2 text-xs text-white uppercase font-mono"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#262939]">
                <button
                  type="button"
                  onClick={() => setEditingSolicitante(null)}
                  className="px-4 py-2 bg-[#202334] hover:bg-[#2b2f44] text-slate-300 rounded-lg text-xs font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-bold"
                >
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
