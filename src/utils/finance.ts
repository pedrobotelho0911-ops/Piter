import type { FinanceData, StatusFinanceiro } from "../types";

export function formatCurrency(value: number): string {
  return value.toLocaleString("pt-PT", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 2,
  });
}

export interface FinanceTotals {
  totalContas: number;
  totalReceitas: number;
  totalDespesas: number;
  totalGastosMes: number;
  totalDividaTotal: number;
  totalDividaPaga: number;
  totalDividaRestante: number;
  totalInvestimentos: number;
  fluxoMensal: number;
  patrimonioLiquido: number;
  saldoLiquido: number;
}

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

export function isDataNoMesAtual(dataISO: string, referencia = new Date()): boolean {
  return dataISO.slice(0, 7) === currentMonthKey(referencia);
}

export function computeTotals(data: FinanceData): FinanceTotals {
  const totalContas = sum(data.contas, (c) => c.saldo);
  const totalReceitas = sum(data.receitas, (r) => r.valor);
  const totalDespesas = sum(data.despesas, (d) => d.valor);
  const totalGastosMes = sum(
    data.gastos.filter((g) => isDataNoMesAtual(g.data)),
    (g) => g.valor,
  );
  const totalDividaTotal = sum(data.dividas, (d) => d.valorTotal);
  const totalDividaPaga = sum(data.dividas, (d) => d.valorPago);
  const totalDividaRestante = Math.max(0, totalDividaTotal - totalDividaPaga);
  const totalInvestimentos = sum(data.investimentos, (i) => i.valor);

  const fluxoMensal = totalReceitas - totalDespesas - totalGastosMes;
  const patrimonioLiquido = totalContas + totalInvestimentos - totalDividaRestante;
  const saldoLiquido = totalReceitas - totalDespesas - totalGastosMes - totalDividaRestante;

  return {
    totalContas,
    totalReceitas,
    totalDespesas,
    totalGastosMes,
    totalDividaTotal,
    totalDividaPaga,
    totalDividaRestante,
    totalInvestimentos,
    fluxoMensal,
    patrimonioLiquido,
    saldoLiquido,
  };
}

function sum<T>(items: T[], pick: (item: T) => number): number {
  return items.reduce((acc, item) => acc + (pick(item) || 0), 0);
}

/**
 * Score financeiro de 0 (afogado em dívidas) a 100 (nadando de boa).
 * Combina fluxo de caixa mensal com o quanto as dívidas comprometem o patrimônio.
 */
export function computeScore(totals: FinanceTotals): number {
  const {
    totalReceitas,
    fluxoMensal,
    totalDividaRestante,
    totalContas,
    totalInvestimentos,
    patrimonioLiquido,
  } = totals;

  const cashFlowRatio =
    totalReceitas > 0
      ? clamp(fluxoMensal / totalReceitas, -1, 1)
      : clamp(Math.sign(fluxoMensal), -1, 0);
  const scoreFromFlow = ((cashFlowRatio + 1) / 2) * 100;

  const patrimonioBruto = totalContas + totalInvestimentos + totalDividaRestante;
  const debtRatio = patrimonioBruto > 0 ? totalDividaRestante / patrimonioBruto : 0;
  const scoreFromDebt = (1 - debtRatio) * 100;

  let score = 0.6 * scoreFromFlow + 0.4 * scoreFromDebt;

  const dividaMaiorQueReservas = totalDividaRestante > totalContas + totalInvestimentos;
  if (patrimonioLiquido < 0 || dividaMaiorQueReservas) {
    score = Math.min(score, 28);
  }

  return Math.round(clamp(score, 0, 100));
}

export function computeStatus(score: number): StatusFinanceiro {
  if (score < 40) return "vermelho";
  if (score < 70) return "amarelo";
  return "verde";
}

export const STATUS_META: Record<
  StatusFinanceiro,
  { label: string; cor: string; corSuave: string; descricao: string }
> = {
  vermelho: {
    label: "Atenção",
    cor: "#ef4444",
    corSuave: "#fee2e2",
    descricao: "Saldo negativo ou dívidas maiores que suas reservas.",
  },
  amarelo: {
    label: "Margem apertada",
    cor: "#eab308",
    corSuave: "#fef9c3",
    descricao: "Saldo positivo, mas com pouca folga.",
  },
  verde: {
    label: "Saudável",
    cor: "#22c55e",
    corSuave: "#dcfce7",
    descricao: "Saldo saudável e dívidas sob controle.",
  },
};

export function currentMonthKey(date = new Date()): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

export function monthLabel(mes: string): string {
  const [ano, mesNum] = mes.split("-").map(Number);
  const date = new Date(ano, mesNum - 1, 1);
  return date.toLocaleDateString("pt-BR", { month: "short", year: "2-digit" });
}
