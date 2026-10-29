/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { StockProvider, useStock } from './context/StockContext.tsx';
import { Header } from './components/Header.tsx';
import { Sidebar } from './components/Sidebar.tsx';
import { DashboardView } from './components/DashboardView.tsx';
import { MateriaisView } from './components/MateriaisView.tsx';
import { MovimentacoesView } from './components/MovimentacoesView.tsx';
import { SolicitantesView } from './components/SolicitantesView.tsx';
import { CurvaABCView } from './components/CurvaABCView.tsx';
import { NovaMovimentacaoModal } from './components/NovaMovimentacaoModal.tsx';
import { NovoProdutoModal } from './components/NovoProdutoModal.tsx';
import { NovoSolicitanteModal } from './components/NovoSolicitanteModal.tsx';
import { BarcodeScannerModal } from './components/BarcodeScannerModal.tsx';
import { ExportModal } from './components/ExportModal.tsx';
import { BottomTabBar } from './components/BottomTabBar.tsx';
import { Menu } from 'lucide-react';

function StockApp() {
  const { activeTab, setActiveTab } = useStock();

  // Modals state
  const [isMovimentacaoOpen, setIsMovimentacaoOpen] = useState(false);
  const [movimentacaoInitialProd, setMovimentacaoInitialProd] = useState<string>('');
  const [movimentacaoInitialTipo, setMovimentacaoInitialTipo] = useState<'ENTRADA' | 'SAIDA'>('SAIDA');

  const [isNovoProdutoOpen, setIsNovoProdutoOpen] = useState(false);
  const [isNovoSolicitanteOpen, setIsNovoSolicitanteOpen] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const handleOpenMovimentacaoComProduto = (prodId: string, tipo: 'ENTRADA' | 'SAIDA') => {
    setMovimentacaoInitialProd(prodId);
    setMovimentacaoInitialTipo(tipo);
    setIsMovimentacaoOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#090a0f] text-slate-100 flex flex-col font-sans selection:bg-rose-500 selection:text-white">
      {/* Top Header */}
      <Header
        onOpenNovaMovimentacao={() => {
          setMovimentacaoInitialProd('');
          setMovimentacaoInitialTipo('SAIDA');
          setIsMovimentacaoOpen(true);
        }}
        onOpenScanner={() => setIsScannerOpen(true)}
        onOpenExport={() => setIsExportOpen(true)}
      />

      {/* Mobile Top Navbar Bar with Menu Toggle */}
      <div className="md:hidden bg-[#10121b] border-b border-[#212433] px-4 py-2 flex items-center justify-between">
        <button
          onClick={() => setIsMobileSidebarOpen(true)}
          className="flex items-center gap-2 text-xs font-semibold text-slate-300 hover:text-white"
        >
          <Menu className="w-4 h-4 text-rose-400" />
          <span>Menu & Filtros</span>
        </button>
        <span className="text-xs font-mono text-rose-400 font-bold uppercase">
          {activeTab.replace('_', ' ')}
        </span>
      </div>

      {/* Main Workspace: Sidebar + Dynamic Content View */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Navigation & Filter Sidebar */}
        <Sidebar
          isOpenMobile={isMobileSidebarOpen}
          onCloseMobile={() => setIsMobileSidebarOpen(false)}
        />

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto bg-[#0a0b11]">
          {activeTab === 'dashboard' && (
            <DashboardView
              onNavigateToCadastro={() => setActiveTab('materiais')}
              onNavigateToMovimentacoes={() => setActiveTab('movimentacoes')}
              onOpenNovaMovimentacao={() => {
                setMovimentacaoInitialProd('');
                setMovimentacaoInitialTipo('SAIDA');
                setIsMovimentacaoOpen(true);
              }}
            />
          )}

          {activeTab === 'materiais' && (
            <MateriaisView
              onOpenNovoProduto={() => setIsNovoProdutoOpen(true)}
              onOpenMovimentacaoParaProduto={handleOpenMovimentacaoComProduto}
            />
          )}

          {activeTab === 'movimentacoes' && (
            <MovimentacoesView
              onOpenNovaMovimentacao={() => {
                setMovimentacaoInitialProd('');
                setMovimentacaoInitialTipo('SAIDA');
                setIsMovimentacaoOpen(true);
              }}
            />
          )}

          {activeTab === 'solicitantes' && (
            <SolicitantesView
              onOpenNovoSolicitante={() => setIsNovoSolicitanteOpen(true)}
            />
          )}

          {activeTab === 'curva_abc' && <CurvaABCView />}
        </main>
      </div>

      {/* Bottom Sheet Switcher Bar (Excel Style) */}
      <BottomTabBar
        onOpenNovoProduto={() => setIsNovoProdutoOpen(true)}
      />

      {/* All System Modals */}
      <NovaMovimentacaoModal
        isOpen={isMovimentacaoOpen}
        onClose={() => setIsMovimentacaoOpen(false)}
        initialProdutoId={movimentacaoInitialProd}
        initialTipo={movimentacaoInitialTipo}
      />

      <NovoProdutoModal
        isOpen={isNovoProdutoOpen}
        onClose={() => setIsNovoProdutoOpen(false)}
      />

      <NovoSolicitanteModal
        isOpen={isNovoSolicitanteOpen}
        onClose={() => setIsNovoSolicitanteOpen(false)}
      />

      <BarcodeScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onSelectProductForMovement={handleOpenMovimentacaoComProduto}
      />

      <ExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <StockProvider>
      <StockApp />
    </StockProvider>
  );
}
