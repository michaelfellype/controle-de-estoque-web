import React from 'react';
import {
  Boxes,
  ShieldAlert,
  ShieldCheck,
  PlusCircle,
  FileSpreadsheet,
  ScanBarcode,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { useStock } from '../context/StockContext.tsx';

interface HeaderProps {
  onOpenNovaMovimentacao: () => void;
  onOpenScanner: () => void;
  onOpenExport: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenNovaMovimentacao,
  onOpenScanner,
  onOpenExport,
}) => {
  const { userRole, setUserRole, resetToOriginalSeed } = useStock();

  return (
    <header className="bg-[#12131a] border-b border-[#252836] px-4 lg:px-6 py-3 flex flex-wrap items-center justify-between gap-4 sticky top-0 z-30">
      {/* Brand & System Title */}
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-rose-600 to-rose-700 text-white shadow-lg shadow-rose-950/40">
          <Boxes className="w-6 h-6" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-base tracking-wider uppercase text-white font-mono">
              Controle de Estoque
            </span>
            <span className="bg-rose-500/20 text-rose-400 text-[10px] font-bold px-2 py-0.5 rounded border border-rose-500/30 uppercase tracking-widest">
              WMS Pro
            </span>
          </div>
          <p className="text-xs text-slate-400 hidden sm:block">
            Saldos, reposição e movimentação de materiais em nuvem
          </p>
        </div>
      </div>

      {/* Center / RBAC Profile Switcher */}
      <div className="flex items-center bg-[#1a1c26] border border-[#2d3142] p-1 rounded-xl shadow-inner">
        <button
          onClick={() => setUserRole('GESTOR')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            userRole === 'GESTOR'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
          title="Modo Gestão: Painel analítico e relatórios (somente leitura)"
        >
          <ShieldAlert className="w-3.5 h-3.5" />
          <span>Gestor / Gerência</span>
          {userRole === 'GESTOR' && (
            <span className="bg-amber-500/30 text-[9px] px-1.5 py-0.2 rounded font-mono uppercase">
              Leitura
            </span>
          )}
        </button>

        <button
          onClick={() => setUserRole('OPERADOR')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            userRole === 'OPERADOR'
              ? 'bg-rose-600 text-white shadow-md shadow-rose-950/50'
              : 'text-slate-400 hover:text-slate-200'
          }`}
          title="Modo Operador: Lançamentos, cadastros e controle de estoque completo"
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Operador Almoxarifado</span>
          {userRole === 'OPERADOR' && (
            <span className="bg-rose-800/60 text-[9px] px-1.5 py-0.2 rounded font-mono uppercase">
              Operacional
            </span>
          )}
        </button>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2">
        <button
          onClick={onOpenScanner}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1e202d] hover:bg-[#272a3b] text-slate-200 border border-[#31354a] rounded-lg text-xs font-medium transition-colors"
          title="Bipar código de barras do material"
        >
          <ScanBarcode className="w-3.5 h-3.5 text-rose-400" />
          <span className="hidden md:inline">Bipar Código</span>
        </button>

        <button
          onClick={onOpenExport}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1e202d] hover:bg-[#272a3b] text-emerald-400 border border-emerald-900/40 rounded-lg text-xs font-medium transition-colors"
          title="Exportar para Excel (CSV) ou Relatório Impresso"
        >
          <FileSpreadsheet className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Exportar Excel</span>
        </button>

        {userRole === 'OPERADOR' ? (
          <button
            onClick={onOpenNovaMovimentacao}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-bold transition-all shadow-md shadow-rose-950/50 cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Nova Movimentação</span>
          </button>
        ) : (
          <div
            className="flex items-center gap-1 px-3 py-1.5 bg-slate-800/80 text-slate-400 border border-slate-700/60 rounded-lg text-xs font-medium cursor-not-allowed"
            title="Ação desativada para perfil Gestor (Somente Leitura)"
          >
            <span className="text-[11px]">Modo Consulta</span>
          </div>
        )}

        <button
          onClick={() => {
            if (confirm('Deseja restaurar os dados originais fiéis à planilha Excel?')) {
              resetToOriginalSeed();
            }
          }}
          className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-[#1f2230] rounded-lg transition-colors"
          title="Restaurar dados originais da planilha"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
