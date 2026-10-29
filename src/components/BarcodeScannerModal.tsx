import React, { useState } from 'react';
import { X, ScanBarcode, Search, CheckCircle, Package, ArrowRight, CornerDownLeft } from 'lucide-react';
import { useStock } from '../context/StockContext.tsx';
import { formatCurrencyBRL } from '../utils/stockCalculations.ts';

interface BarcodeScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectProductForMovement: (produtoId: string, tipo: 'ENTRADA' | 'SAIDA') => void;
}

export const BarcodeScannerModal: React.FC<BarcodeScannerModalProps> = ({
  isOpen,
  onClose,
  onSelectProductForMovement,
}) => {
  const { produtos } = useStock();
  const [barcodeInput, setBarcodeInput] = useState('');
  const [scannedProduct, setScannedProduct] = useState<any | null>(null);

  const handleScan = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = barcodeInput.trim().toUpperCase();
    if (!clean) return;

    const found = produtos.find(
      (p) => p.codigo.toUpperCase() === clean || p.id.toUpperCase() === clean
    );

    if (found) {
      setScannedProduct(found);
    } else {
      alert(`Código "${clean}" não encontrado no catálogo de materiais.`);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-[#141624] border border-[#2d3248] rounded-2xl max-w-lg w-full p-6 shadow-2xl">
        <div className="flex items-center justify-between pb-4 border-b border-[#25293d]">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-lg bg-rose-500/20 text-rose-400">
              <ScanBarcode className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-base font-bold text-white tracking-wide">
                Leitor / Bipador de Código de Barras
              </h2>
              <p className="text-xs text-slate-400">
                Identificação instantânea de materiais no almoxarifado
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

        {/* Barcode scanner laser visual simulation */}
        <div className="my-5 bg-[#0e101a] border border-[#262a3f] rounded-xl p-5 text-center relative overflow-hidden">
          <div className="absolute inset-x-0 top-1/2 h-0.5 bg-rose-500/80 shadow-[0_0_12px_#f43f5e] animate-pulse" />
          <ScanBarcode className="w-16 h-16 mx-auto text-slate-600 mb-2" />
          <div className="text-xs font-mono text-slate-400">
            Aponte o leitor óptico ou digite o código do produto
          </div>
        </div>

        <form onSubmit={handleScan} className="space-y-4">
          <div className="relative">
            <input
              type="text"
              autoFocus
              placeholder="Digite ou bipe o código (ex: MAT-0002)..."
              value={barcodeInput}
              onChange={(e) => setBarcodeInput(e.target.value.toUpperCase())}
              className="w-full bg-[#1b1e2e] border border-rose-500/50 rounded-xl pl-4 pr-12 py-3 text-sm text-white font-mono uppercase focus:outline-none focus:border-rose-400 shadow-inner"
            />
            <button
              type="submit"
              className="absolute right-2 top-2 px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1"
            >
              <span>Bipar</span>
              <CornerDownLeft className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Quick test buttons */}
          <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-slate-400">
            <span>Atalhos rápidos:</span>
            {['MAT-0001', 'MAT-0002', 'MAT-0005', 'MAT-0010'].map((code) => (
              <button
                key={code}
                type="button"
                onClick={() => {
                  setBarcodeInput(code);
                  const found = produtos.find((p) => p.codigo === code);
                  if (found) setScannedProduct(found);
                }}
                className="bg-[#1b1e2e] hover:bg-[#252a3f] text-slate-300 font-mono px-2 py-0.5 rounded border border-[#2d3249]"
              >
                {code}
              </button>
            ))}
          </div>

          {/* Scanned Material Found Details Card */}
          {scannedProduct && (
            <div className="mt-4 bg-[#191c2b] border border-rose-500/40 rounded-xl p-4 space-y-3 animate-in fade-in duration-200">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-mono font-bold text-rose-400">
                    {scannedProduct.codigo}
                  </span>
                  <div className="text-sm font-bold text-white">
                    {scannedProduct.descricao_produto}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] text-slate-400">Localização Física</div>
                  <div className="text-sm font-mono font-black text-rose-300 bg-rose-950/60 px-2 py-0.5 rounded border border-rose-800/80 inline-block mt-0.5">
                    {scannedProduct.localizacao_fisica}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-[#25293d] text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px]">Saldo Disponível</span>
                  <span className="font-mono font-bold text-white">
                    {scannedProduct.estoque_atual} {scannedProduct.unidade_medida}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Est. Mínimo</span>
                  <span className="font-mono font-bold text-slate-300">
                    {scannedProduct.estoque_minimo}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Custo Unitário</span>
                  <span className="font-mono font-bold text-emerald-400">
                    {formatCurrencyBRL(scannedProduct.valor_unitario)}
                  </span>
                </div>
              </div>

              <div className="flex gap-2 pt-2 border-t border-[#25293d]">
                <button
                  type="button"
                  onClick={() => {
                    onSelectProductForMovement(scannedProduct.id, 'SAIDA');
                    onClose();
                  }}
                  className="flex-1 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-bold transition-all text-center shadow-sm"
                >
                  Registrar Saída (Consumo)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onSelectProductForMovement(scannedProduct.id, 'ENTRADA');
                    onClose();
                  }}
                  className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition-all text-center shadow-sm"
                >
                  Registrar Entrada (Receber)
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};
