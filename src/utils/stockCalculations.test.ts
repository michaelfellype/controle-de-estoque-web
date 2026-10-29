import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateStockLevel,
  calculateStockValue,
  getStockStatus,
  validateExitMovement,
  calculateDashboardKPIs,
} from './stockCalculations.ts';
import { Produto, Movimentacao } from '../types/index.ts';

test('calculateStockLevel calcula saldo corretamente (inicial + entradas - saidas)', () => {
  assert.equal(calculateStockLevel(100, 0, 0), 100);
  assert.equal(calculateStockLevel(50, 0, 5), 45);
  assert.equal(calculateStockLevel(10, 20, 5), 25);
  assert.equal(calculateStockLevel(0, 0, 0), 0);
});

test('calculateStockValue multiplica saldo por valor unitario com precisao', () => {
  assert.equal(calculateStockValue(100, 2.95), 295.00);
  assert.equal(calculateStockValue(45, 2.95), 132.75);
  assert.equal(calculateStockValue(5, 195.00), 975.00);
  assert.equal(calculateStockValue(0, 45.00), 0);
});

test('getStockStatus classifica corretamente entre SEM_ESTOQUE, COMPRAR_CRITICO e REGULAR', () => {
  // Saldo 0 ou negativo -> SEM_ESTOQUE
  assert.equal(getStockStatus(0, 100), 'SEM_ESTOQUE');
  assert.equal(getStockStatus(-1, 10), 'SEM_ESTOQUE');

  // Saldo > 0 mas <= estoqueMinimo -> COMPRAR_CRITICO
  assert.equal(getStockStatus(45, 100), 'COMPRAR_CRITICO');
  assert.equal(getStockStatus(100, 100), 'COMPRAR_CRITICO');
  assert.equal(getStockStatus(4, 7), 'COMPRAR_CRITICO');

  // Saldo > estoqueMinimo -> REGULAR
  assert.equal(getStockStatus(7, 5), 'REGULAR');
  assert.equal(getStockStatus(8, 3), 'REGULAR');
  assert.equal(getStockStatus(9, 3), 'REGULAR');
});

test('validateExitMovement bloqueia saidas maiores que o saldo em estoque', () => {
  // Saldo 45, tenta retirar 5 -> OK
  const okResult = validateExitMovement(45, 5);
  assert.equal(okResult.isValid, true);

  // Saldo 45, tenta retirar 45 -> OK (zera)
  const exactResult = validateExitMovement(45, 45);
  assert.equal(exactResult.isValid, true);

  // Saldo 45, tenta retirar 46 -> Bloqueia!
  const blockResult = validateExitMovement(45, 46);
  assert.equal(blockResult.isValid, false);
  assert.match(blockResult.message || '', /Saldo insuficiente/);

  // Quantidade zero ou negativa -> Bloqueia!
  const zeroResult = validateExitMovement(45, 0);
  assert.equal(zeroResult.isValid, false);
});

test('calculateDashboardKPIs consolida métricas batendo com planilha do usuário', () => {
  const dummyProdutos: Produto[] = [
    {
      id: '1',
      codigo: 'MAT-0001',
      descricao_produto: 'LUVA P',
      localizacao_fisica: 'A-02',
      fornecedor: 'NEW',
      unidade_medida: 'PAR',
      valor_unitario: 2.95,
      estoque_minimo: 100,
      estoque_inicial: 100,
      total_entradas: 0,
      total_saidas: 0,
      estoque_atual: 100,
      valor_em_estoque: 295.0,
      status: 'COMPRAR_CRITICO',
      validacao: 'OK',
      criado_em: '2026-09-20',
    },
    {
      id: '2',
      codigo: 'MAT-0002',
      descricao_produto: 'LUVA M',
      localizacao_fisica: 'A-02',
      fornecedor: 'NEW',
      unidade_medida: 'PAR',
      valor_unitario: 2.95,
      estoque_minimo: 100,
      estoque_inicial: 50,
      total_entradas: 0,
      total_saidas: 5,
      estoque_atual: 45,
      valor_em_estoque: 132.75,
      status: 'COMPRAR_CRITICO',
      validacao: 'OK',
      criado_em: '2026-09-20',
    },
    {
      id: '3',
      codigo: 'MAT-0016',
      descricao_produto: 'SANDALIA',
      localizacao_fisica: 'B-01',
      fornecedor: 'AMZ',
      unidade_medida: 'UND',
      valor_unitario: 45.0,
      estoque_minimo: 3,
      estoque_inicial: 0,
      total_entradas: 0,
      total_saidas: 0,
      estoque_atual: 0,
      valor_em_estoque: 0,
      status: 'SEM_ESTOQUE',
      validacao: 'OK',
      criado_em: '2026-09-20',
    },
  ];

  const dummyMovs: Movimentacao[] = [
    {
      id: 'm1',
      codigo_movimentacao: 'MOV-000001',
      data_movimentacao: '2026-09-20',
      ano: 2026,
      mes: 'set/26',
      tipo_movimentacao: 'SAIDA',
      produto_id: '2',
      codigo_produto: 'MAT-0002',
      descricao_produto: 'LUVA M',
      unidade_medida: 'PAR',
      quantidade: 5,
      valor_unitario_momento: 2.95,
      valor_total: 14.75,
      criado_por: 'Operador',
    },
  ];

  const kpis = calculateDashboardKPIs(dummyProdutos, dummyMovs);
  assert.equal(kpis.itensCadastrados, 3);
  assert.equal(kpis.patrimonioEstoque, 427.75);
  assert.equal(kpis.alertasParaCompra, 3); // 2 criticos + 1 sem estoque
  assert.equal(kpis.itensSemEstoque, 1);
  assert.equal(kpis.volumeSaidas, 5);
});

test('initialProdutos e initialMovimentacoes batem 100% com os números do Excel do usuário', async () => {
  const { initialProdutos, initialMovimentacoes } = await import('../data/seedData.ts');
  const kpis = calculateDashboardKPIs(initialProdutos, initialMovimentacoes, 'set/26', 2026);

  assert.equal(kpis.itensCadastrados, 110, 'Total de itens cadastrados deve ser 110');
  assert.equal(kpis.patrimonioEstoque, 3319.25, 'Patrimônio em estoque deve ser R$ 3.319,25');
  assert.equal(kpis.alertasParaCompra, 104, 'Alertas para compra deve ser 104');
  assert.equal(kpis.itensSemEstoque, 95, 'Itens sem estoque deve ser 95');
  assert.equal(kpis.volumeSaidas, 5, 'Volume de saídas deve ser 5,00');
  assert.equal(kpis.itensRegulares, 6, 'Itens regulares deve ser 6');
});
