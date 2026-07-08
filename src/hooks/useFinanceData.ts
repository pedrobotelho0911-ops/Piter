import { useCallback, useEffect, useMemo, useState } from "react";
import {
  emptyFinanceData,
  type Conta,
  type Despesa,
  type Divida,
  type FinanceData,
  type Gasto,
  type Investimento,
  type Receita,
} from "../types";
import {
  computeScore,
  computeStatus,
  computeTotals,
  currentMonthKey,
  estaDespesaPagaNoMes,
} from "../utils/finance";

const STORAGE_KEY = "piter-financas:dados";

function loadData(): FinanceData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyFinanceData;
    const parsed = JSON.parse(raw);
    return { ...emptyFinanceData, ...parsed };
  } catch {
    return emptyFinanceData;
  }
}

function makeId(): string {
  return crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2);
}

export function useFinanceData() {
  const [data, setData] = useState<FinanceData>(loadData);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [data]);

  const totals = useMemo(() => computeTotals(data), [data]);
  const score = useMemo(() => computeScore(totals), [totals]);
  const status = useMemo(() => computeStatus(score), [score]);

  // Registra automaticamente um snapshot do saldo do mês atual sempre que os dados mudam.
  useEffect(() => {
    const mes = currentMonthKey();
    setData((prev) => {
      const existente = prev.historico.find((h) => h.mes === mes);
      if (existente && existente.saldo === totals.patrimonioLiquido) return prev;
      const historico = existente
        ? prev.historico.map((h) =>
            h.mes === mes ? { ...h, saldo: totals.patrimonioLiquido } : h,
          )
        : [...prev.historico, { mes, saldo: totals.patrimonioLiquido }];
      historico.sort((a, b) => a.mes.localeCompare(b.mes));
      return { ...prev, historico };
    });
  }, [totals.patrimonioLiquido]);

  const substituirDados = useCallback((novosDados: FinanceData) => {
    setData(novosDados);
  }, []);

  const addConta = useCallback((conta: Omit<Conta, "id">) => {
    setData((prev) => ({ ...prev, contas: [...prev.contas, { ...conta, id: makeId() }] }));
  }, []);
  const updateConta = useCallback((conta: Conta) => {
    setData((prev) => ({
      ...prev,
      contas: prev.contas.map((c) => (c.id === conta.id ? conta : c)),
    }));
  }, []);
  const removeConta = useCallback((id: string) => {
    setData((prev) => ({ ...prev, contas: prev.contas.filter((c) => c.id !== id) }));
  }, []);

  const addReceita = useCallback((receita: Omit<Receita, "id">) => {
    setData((prev) => ({ ...prev, receitas: [...prev.receitas, { ...receita, id: makeId() }] }));
  }, []);
  const updateReceita = useCallback((receita: Receita) => {
    setData((prev) => ({
      ...prev,
      receitas: prev.receitas.map((r) => (r.id === receita.id ? receita : r)),
    }));
  }, []);
  const removeReceita = useCallback((id: string) => {
    setData((prev) => ({ ...prev, receitas: prev.receitas.filter((r) => r.id !== id) }));
  }, []);

  const addDespesa = useCallback((despesa: Omit<Despesa, "id">) => {
    setData((prev) => ({ ...prev, despesas: [...prev.despesas, { ...despesa, id: makeId() }] }));
  }, []);
  const updateDespesa = useCallback((despesa: Despesa) => {
    setData((prev) => ({
      ...prev,
      despesas: prev.despesas.map((d) => (d.id === despesa.id ? despesa : d)),
    }));
  }, []);
  const removeDespesa = useCallback((id: string) => {
    setData((prev) => ({ ...prev, despesas: prev.despesas.filter((d) => d.id !== id) }));
  }, []);
  const toggleDespesaPaga = useCallback((id: string) => {
    setData((prev) => ({
      ...prev,
      despesas: prev.despesas.map((d) =>
        d.id === id
          ? { ...d, pagoEm: estaDespesaPagaNoMes(d) ? undefined : currentMonthKey() }
          : d,
      ),
    }));
  }, []);

  const addGasto = useCallback((gasto: Omit<Gasto, "id">) => {
    setData((prev) => ({ ...prev, gastos: [...prev.gastos, { ...gasto, id: makeId() }] }));
  }, []);
  const updateGasto = useCallback((gasto: Gasto) => {
    setData((prev) => ({
      ...prev,
      gastos: prev.gastos.map((g) => (g.id === gasto.id ? gasto : g)),
    }));
  }, []);
  const removeGasto = useCallback((id: string) => {
    setData((prev) => ({ ...prev, gastos: prev.gastos.filter((g) => g.id !== id) }));
  }, []);

  const addDivida = useCallback((divida: Omit<Divida, "id">) => {
    setData((prev) => ({ ...prev, dividas: [...prev.dividas, { ...divida, id: makeId() }] }));
  }, []);
  const updateDivida = useCallback((divida: Divida) => {
    setData((prev) => ({
      ...prev,
      dividas: prev.dividas.map((d) => (d.id === divida.id ? divida : d)),
    }));
  }, []);
  const removeDivida = useCallback((id: string) => {
    setData((prev) => ({ ...prev, dividas: prev.dividas.filter((d) => d.id !== id) }));
  }, []);

  const addInvestimento = useCallback((investimento: Omit<Investimento, "id">) => {
    setData((prev) => ({
      ...prev,
      investimentos: [...prev.investimentos, { ...investimento, id: makeId() }],
    }));
  }, []);
  const updateInvestimento = useCallback((investimento: Investimento) => {
    setData((prev) => ({
      ...prev,
      investimentos: prev.investimentos.map((i) =>
        i.id === investimento.id ? investimento : i,
      ),
    }));
  }, []);
  const removeInvestimento = useCallback((id: string) => {
    setData((prev) => ({
      ...prev,
      investimentos: prev.investimentos.filter((i) => i.id !== id),
    }));
  }, []);

  return {
    data,
    totals,
    score,
    status,
    substituirDados,
    addConta,
    updateConta,
    removeConta,
    addReceita,
    updateReceita,
    removeReceita,
    addDespesa,
    updateDespesa,
    removeDespesa,
    toggleDespesaPaga,
    addGasto,
    updateGasto,
    removeGasto,
    addDivida,
    updateDivida,
    removeDivida,
    addInvestimento,
    updateInvestimento,
    removeInvestimento,
  };
}
