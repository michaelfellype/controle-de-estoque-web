import React from 'react';
import { ChevronLeft, ChevronRight, Plus, MoreHorizontal } from 'lucide-react';
import { useStock } from '../context/StockContext.tsx';

interface BottomTabBarProps {
  onOpenNovoProduto: () => void;
}

export const BottomTabBar: React.FC<BottomTabBarProps> = ({ onOpenNovoProduto }) => {
  const { activeTab, setActiveTab, userRole } = useStock();

  const tabs = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'materiais', label: 'Cadastro' },
    { id: 'movimentacoes', label: 'Movimentações' },
    { id: 'solicitantes', label: 'Solicitantes' },
    { id: 'curva_abc', label: 'Curva ABC' },
  ];

  return (
    <div className="bg-[#0b0c12] border-t border-[#202230] px-2 py-1.5 flex items-center justify-between z-30 select-none">
      {/* Excel Sheet Switcher Arrows and Tabs */}
      <div className="flex items-center gap-1 overflow-x-auto scrollbar-none py-0.5">
        <div className="flex items-center text-slate-400 gap-0.5 mr-1 flex-shrink-0">
          <button
            onClick={() => {
              const idx = tabs.findIndex((t) => t.id === activeTab);
              if (idx > 0) setActiveTab(tabs[idx - 1].id);
            }}
            className="p-1 hover:text-white hover:bg-[#1a1c29] rounded transition-colors"
            title="Aba anterior"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => {
              const idx = tabs.findIndex((t) => t.id === activeTab);
              if (idx < tabs.length - 1) setActiveTab(tabs[idx + 1].id);
            }}
            className="p-1 hover:text-white hover:bg-[#1a1c29] rounded transition-colors"
            title="Próxima aba"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Tab Buttons matching Excel aesthetic */}
        <div className="flex items-center gap-1.5 flex-nowrap">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3.5 py-1 rounded-md text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-rose-600 text-white shadow-md shadow-rose-950/60 border border-rose-500'
                    : 'bg-[#151722] text-slate-300 hover:text-white hover:bg-[#1f2233] border border-[#272b3c]'
                }`}
              >
                {tab.label}
              </button>
            );
          })}

          {userRole === 'OPERADOR' && (
            <button
              onClick={onOpenNovoProduto}
              className="p-1 text-slate-400 hover:text-white hover:bg-[#1a1c29] rounded transition-colors ml-0.5"
              title="Adicionar novo material (nova linha)"
            >
              <Plus className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Right controls */}
      <div className="hidden sm:flex items-center gap-2 text-slate-400 text-[11px] pr-2 flex-shrink-0 font-mono">
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        <span>Nuvem Conectada • WMS v2.4</span>
      </div>
    </div>
  );
};
