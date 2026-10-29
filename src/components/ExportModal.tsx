import React from 'react';
import { X, FileSpreadsheet, Printer, Download, CheckCircle, FileText } from 'lucide-react';
import { useStock } from '../context/StockContext.tsx';
import { formatCurrencyBRL } from '../utils/stockCalculations.ts';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({ isOpen, onClose }) => {
  const { produtos, movimentacoes, solicitantes, metrics } = useStock();

  // Função para baixar arquivo CSV compatível com Excel (UTF-8 BOM + delimitador ponto e vírgula)
  const downloadCSV = (content: string, filename: string) => {
    const bom = '\uFEFF';
    const blob = new Blob([bom + content], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportCadastroMateriais = () => {
    const headers = [
      'Código',
      'Produto',
      'Localização Física',
      'Fornecedor',
      'Unidade',
      'Valor Unitário (R$)',
      'Estoque Mínimo',
      'Estoque Inicial',
      'Total Entradas',
      'Total Saídas',
      'Estoque Atual',
      'Valor em Estoque (R$)',
      'Status',
      'Validação',
    ];

    const rows = produtos.map((p) => [
      p.codigo,
      `"${p.descricao_produto.replace(/"/g, '""')}"`,
      p.localizacao_fisica,
      `"${p.fornecedor.replace(/"/g, '""')}"`,
      p.unidade_medida,
      p.valor_unitario.toFixed(2).replace('.', ','),
      p.estoque_minimo,
      p.estoque_inicial,
      p.total_entradas,
      p.total_saidas,
      p.estoque_atual,
      p.valor_em_estoque.toFixed(2).replace('.', ','),
      p.status,
      p.validacao,
    ]);

    const csvContent = [headers.join(';'), ...rows.map((r) => r.join(';'))].join('\r\n');
    downloadCSV(csvContent, `WMS_Cadastro_Materiais_${new Date().toISOString().slice(0, 10)}.csv`);
  };

  const exportMovimentacoes = () => {
    const headers = [
      'Código Movimentação',
      'Data',
      'Ano',
      'Mês',
      'Tipo',
      'Código Produto',
      'Descrição Produto',
      'Unidade',
      'Quantidade',
      'Valor Unitário (R$)',
      'Valor Total (R$)',
      'Fornecedor',
      'Matrícula Solicitante',
      'Nome Receptor',
      'Área Solicitante',
      'Nº NF',
      'Observação',
    ];

    const rows = movimentacoes.map((m) => [
      m.codigo_movimentacao,
      m.data_movimentacao,
      m.ano,
      m.mes,
      m.tipo_movimentacao,
      m.codigo_produto,
      `"${m.descricao_produto.replace(/"/g, '""')}"`,
      m.unidade_medida,
      m.quantidade,
      m.valor_unitario_momento.toFixed(2).replace('.', ','),
      m.valor_total.toFixed(2).replace('.', ','),
      `"${(m.fornecedor || '').replace(/"/g, '""')}"`,
      m.matricula_solicitante || '',
      `"${(m.nome_receptor || '').replace(/"/g, '""')}"`,
      `"${(m.area_solicitante || '').replace(/"/g, '""')}"`,
      m.numero_nf || '',
      `"${(m.observacao || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = [headers.join(';'), ...rows.map((r) => r.join(';'))].join('\r\n');
    downloadCSV(csvContent, `WMS_Historico_Movimentacoes_${new Date().toISOString().slice(0, 10)}.csv`);
  };

  const handlePrintReport = () => {
    window.print();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-[#141624] border border-[#2d3248] rounded-2xl max-w-lg w-full p-6 shadow-2xl">
        <div className="flex items-center justify-between pb-4 border-b border-[#25293d]">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400">
              <FileSpreadsheet className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-base font-bold text-white tracking-wide">
                Exportação de Dados & Relatórios
              </h2>
              <p className="text-xs text-slate-400">
                Compatível com Microsoft Excel, LibreOffice e PDF
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

        <div className="my-5 space-y-3">
          {/* Card 1: Cadastro de Materiais */}
          <div className="bg-[#1b1e2e] border border-[#2b3046] p-4 rounded-xl flex items-center justify-between hover:border-emerald-500/50 transition-colors">
            <div>
              <div className="text-xs font-bold text-white">
                Planilha de Cadastro de Materiais (Estoque Atual)
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">
                {produtos.length} itens cadastrados • Patrimônio: {formatCurrencyBRL(metrics.patrimonioEstoque)}
              </div>
            </div>
            <button
              onClick={exportCadastroMateriais}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition-all shadow-sm"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Baixar Excel</span>
            </button>
          </div>

          {/* Card 2: Movimentações */}
          <div className="bg-[#1b1e2e] border border-[#2b3046] p-4 rounded-xl flex items-center justify-between hover:border-rose-500/50 transition-colors">
            <div>
              <div className="text-xs font-bold text-white">
                Histórico Completo de Movimentações
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">
                {movimentacoes.length} lançamentos de entradas e saídas
              </div>
            </div>
            <button
              onClick={exportMovimentacoes}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-bold transition-all shadow-sm"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Baixar Excel</span>
            </button>
          </div>

          {/* Card 3: Imprimir Relatório / PDF */}
          <div className="bg-[#1b1e2e] border border-[#2b3046] p-4 rounded-xl flex items-center justify-between hover:border-blue-500/50 transition-colors">
            <div>
              <div className="text-xs font-bold text-white">
                Relatório Gerencial para Impressão / Salvar em PDF
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">
                Visão consolidada executiva para auditoria e gerência
              </div>
            </div>
            <button
              onClick={handlePrintReport}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold transition-all shadow-sm"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Imprimir / PDF</span>
            </button>
          </div>
        </div>

        <div className="flex justify-end pt-3 border-t border-[#25293d]">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#1f2233] hover:bg-[#282c42] text-slate-300 rounded-xl text-xs font-semibold"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
