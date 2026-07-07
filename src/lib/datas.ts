export const NOMES_MESES = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];

// Letra do dia da semana indexada por Date.getDay() (0 = domingo).
export const LETRAS_DIAS = ["D", "S", "T", "Q", "Q", "S", "S"];

export interface DiaDoMes {
  numero: number;
  iso: string; // YYYY-MM-DD
  letra: string;
}

export interface SemanaDoMes {
  numero: number;
  dias: DiaDoMes[];
}

/** Data local no formato YYYY-MM-DD (sem o desvio de fuso do toISOString). */
export function paraISO(d: Date): string {
  const mes = String(d.getMonth() + 1).padStart(2, "0");
  const dia = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${mes}-${dia}`;
}

export function hojeISO(): string {
  return paraISO(new Date());
}

export function diasNoMes(ano: number, mes: number): number {
  return new Date(ano, mes + 1, 0).getDate();
}

/** Dias do mês agrupados em semanas que começam na segunda-feira. */
export function semanasDoMes(ano: number, mes: number): SemanaDoMes[] {
  const semanas: SemanaDoMes[] = [];
  let atual: DiaDoMes[] = [];
  const total = diasNoMes(ano, mes);
  for (let d = 1; d <= total; d++) {
    const data = new Date(ano, mes, d);
    if (data.getDay() === 1 && atual.length > 0) {
      semanas.push({ numero: semanas.length + 1, dias: atual });
      atual = [];
    }
    atual.push({ numero: d, iso: paraISO(data), letra: LETRAS_DIAS[data.getDay()] });
  }
  if (atual.length > 0) semanas.push({ numero: semanas.length + 1, dias: atual });
  return semanas;
}

/** Os últimos N dias (incluindo hoje), em ordem cronológica. */
export function ultimosDias(n: number): string[] {
  const hoje = new Date();
  const dias: string[] = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(hoje);
    d.setDate(hoje.getDate() - i);
    dias.push(paraISO(d));
  }
  return dias;
}

export function formatarCurto(iso: string): string {
  const [, mes, dia] = iso.split("-");
  return `${dia}/${mes}`;
}

export function formatarDataHora(timestampISO: string): string {
  return new Date(timestampISO).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
