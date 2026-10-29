import React from 'react';
import {
  LayoutDashboard,
  Boxes,
  ArrowLeftRight,
  Users,
  TrendingUp,
  Filter,
  Calendar,
  Layers,
  CheckCircle2,
  AlertTriangle,
  XCircle,
} from 'lucide-react';
import { useStock } from '../context/StockContext.tsx';

interface SidebarProps {
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpenMobile = false,
  onCloseMobile,
}) => {
  const {
    activeTab,
    setActiveTab,
    filtroAno,
    setFiltroAno,
    filtroMes,
    setFiltroMes,
    filtroTipo,
    setFiltroTipo,
    filtroStatus,
    setFiltroStatus,
  } = useStock();

  const meses = [
    { label: 'Jan', val: 'jan' },
    { label: 'Fev', val: 'fev' },
    { label: 'Mar', val: 'mar' },
    { label: 'Abr', val: 'abr' },
    { label: 'Mai', val: 'mai' },
    { label: 'Jun', val: 'jun' },
    { label: 'Jul', val: 'jul' },
    { label: 'Ago', val: 'ago' },
    { label: 'Set', val: 'set' },
    { label: 'Out', val: 'out' },
    { label: 'Nov', val: 'nov' },
    { label: 'Dez', val: 'dez' },
  ];

  const navItems = [
    { id: 'dashboard', label: 'Visão geral', icon: LayoutDashboard },
    { id: 'materiais', label: 'Materiais', icon: Boxes },
    { id: 'movimentacoes', label: 'Movimentações', icon: ArrowLeftRight },
    { id: 'solicitantes', label: 'Solicitantes', icon: Users },
    { id: 'curva_abc', label: 'Curva ABC / Giro', icon: TrendingUp },
  ];

  return (
    <aside
      className={`bg-[#0d0e14] border-r border-[#212433] w-64 flex-shrink-0 flex flex-col justify-between overflow-y-auto text-slate-300 transition-all duration-200 z-20 ${
        isOpenMobile ? 'fixed inset-y-0 left-0 shadow-2xl' : 'hidden md:flex'
      }`}
    >
      <div className="p-4 space-y-6">
        {/* Navigation Section */}
        <div>
          <div className="text-[11px] font-bold tracking-wider uppercase text-slate-400 mb-2 px-2 flex items-center justify-between">
            <span>Módulos</span>
            {isOpenMobile && (
              <button
                onClick={onCloseMobile}
                className="text-slate-400 hover:text-white md:hidden"
              >
                ✕
              </button>
            )}
          </div>
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    if (onCloseMobile) onCloseMobile();
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold tracking-wide transition-all ${
                    isActive
                      ? 'bg-rose-600 text-white shadow-lg shadow-rose-950/40 font-bold'
                      : 'text-slate-300 hover:bg-[#181a25] hover:text-white'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Filters Panel (Identical in functionality to spreadsheet side filters) */}
        <div className="border-t border-[#1e2130] pt-4 space-y-4">
          <div className="flex items-center justify-between px-2 text-[11px] font-bold tracking-wider uppercase text-slate-400">
            <span className="flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5 text-rose-400" />
              Filtros Rápidos
            </span>
            <button
              onClick={() => {
                setFiltroAno('2026');
                setFiltroMes('TODOS');
                setFiltroTipo('TODOS');
                setFiltroStatus('TODOS');
              }}
              className="text-[10px] text-slate-400 hover:text-rose-400 underline lowercase"
            >
              limpar
            </button>
          </div>

          {/* Filtro: ANO */}
          <div className="bg-[#141620] border border-[#252837] rounded-lg p-2.5">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 flex items-center justify-between">
              <span>Ano</span>
              <Calendar className="w-3 h-3 text-slate-400" />
            </div>
            <div className="grid grid-cols-2 gap-1">
              <button
                onClick={() => setFiltroAno('2026')}
                className={`px-2 py-1 text-[11px] rounded font-medium transition-colors ${
                  filtroAno === '2026'
                    ? 'bg-rose-900/50 text-rose-300 border border-rose-500/40'
                    : 'bg-[#1a1c29] text-slate-400 hover:text-white'
                }`}
              >
                2026
              </button>
              <button
                onClick={() => setFiltroAno('TODOS')}
                className={`px-2 py-1 text-[11px] rounded font-medium transition-colors ${
                  filtroAno === 'TODOS'
                    ? 'bg-rose-900/50 text-rose-300 border border-rose-500/40'
                    : 'bg-[#1a1c29] text-slate-400 hover:text-white'
                }`}
              >
                (todos)
              </button>
            </div>
          </div>

          {/* Filtro: MÊS */}
          <div className="bg-[#141620] border border-[#252837] rounded-lg p-2.5">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 flex items-center justify-between">
              <span>Mês</span>
              <span className="text-[9px] text-slate-400">
                {filtroMes === 'TODOS' ? 'Todos' : filtroMes}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-1">
              {meses.map((m) => {
                const isSelected = filtroMes.toLowerCase().includes(m.val);
                return (
                  <button
                    key={m.val}
                    onClick={() => setFiltroMes(isSelected ? 'TODOS' : m.val)}
                    className={`py-1 text-[10px] rounded text-center transition-all ${
                      isSelected
                        ? 'bg-rose-600 text-white font-bold shadow-xs'
                        : 'bg-[#1a1c29] text-slate-400 hover:text-white hover:bg-[#232637]'
                    }`}
                  >
                    {m.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Filtro: TIPO */}
          <div className="bg-[#141620] border border-[#252837] rounded-lg p-2.5">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 flex items-center justify-between">
              <span>Tipo Movimentação</span>
              <Layers className="w-3 h-3 text-slate-400" />
            </div>
            <div className="space-y-1">
              {[
                { id: 'TODOS', label: '(todos os tipos)' },
                { id: 'SAIDA', label: 'SAÍDA' },
                { id: 'ENTRADA', label: 'ENTRADA' },
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => setFiltroTipo(t.id)}
                  className={`w-full text-left px-2 py-1 text-[11px] rounded font-medium transition-colors ${
                    filtroTipo === t.id
                      ? 'bg-rose-900/60 text-rose-200 border border-rose-500/50'
                      : 'bg-[#1a1c29] text-slate-400 hover:text-white'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Filtro: STATUS DE ESTOQUE */}
          <div className="bg-[#141620] border border-[#252837] rounded-lg p-2.5">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 flex items-center justify-between">
              <span>Status do Estoque</span>
            </div>
            <div className="space-y-1">
              {[
                { id: 'TODOS', label: 'Todos os Status', icon: Layers, color: 'text-slate-400' },
                { id: 'COMPRAR_CRITICO', label: 'Crítico / Comprar', icon: AlertTriangle, color: 'text-amber-400' },
                { id: 'SEM_ESTOQUE', label: 'Sem Estoque (Zero)', icon: XCircle, color: 'text-rose-400' },
                { id: 'REGULAR', label: 'Estoque Regular', icon: CheckCircle2, color: 'text-emerald-400' },
              ].map((s) => {
                const Icon = s.icon;
                return (
                  <button
                    key={s.id}
                    onClick={() => setFiltroStatus(s.id)}
                    className={`w-full flex items-center gap-1.5 px-2 py-1 text-[11px] rounded font-medium transition-colors ${
                      filtroStatus === s.id
                        ? 'bg-rose-900/60 text-white border border-rose-500/50'
                        : 'bg-[#1a1c29] text-slate-400 hover:text-white'
                    }`}
                  >
                    <Icon className={`w-3 h-3 ${s.color}`} />
                    <span className="truncate">{s.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="p-3 border-t border-[#1e2130] text-[10px] text-slate-400 text-center">
        <span>WMS Almoxarifado • v2.4</span>
      </div>
    </aside>
  );
};
