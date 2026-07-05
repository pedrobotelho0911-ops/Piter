export type CategoriaDespesa =
  | "moradia"
  | "alimentacao"
  | "transporte"
  | "lazer"
  | "dividas"
  | "outros";

export interface Conta {
  id: string;
  nome: string;
  saldo: number;
}

export interface Receita {
  id: string;
  descricao: string;
  valor: number;
}

export interface Despesa {
  id: string;
  descricao: string;
  categoria: CategoriaDespesa;
  valor: number;
}

export interface Divida {
  id: string;
  descricao: string;
  valorTotal: number;
  valorPago: number;
}

export interface Investimento {
  id: string;
  descricao: string;
  valor: number;
  tipo?: string;
}

export interface HistoricoMensal {
  mes: string; // YYYY-MM
  saldo: number;
}

export interface FinanceData {
  contas: Conta[];
  receitas: Receita[];
  despesas: Despesa[];
  dividas: Divida[];
  investimentos: Investimento[];
  historico: HistoricoMensal[];
}

export const emptyFinanceData: FinanceData = {
  contas: [],
  receitas: [],
  despesas: [],
  dividas: [],
  investimentos: [],
  historico: [],
};

export type StatusFinanceiro = "vermelho" | "amarelo" | "verde";

export const CATEGORIAS_DESPESA: { valor: CategoriaDespesa; label: string }[] = [
  { valor: "moradia", label: "Moradia" },
  { valor: "alimentacao", label: "Alimentação" },
  { valor: "transporte", label: "Transporte" },
  { valor: "lazer", label: "Lazer" },
  { valor: "dividas", label: "Dívidas" },
  { valor: "outros", label: "Outros" },
];
