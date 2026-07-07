import type { Habito, MapaRegistros, RegistroDiario } from "../types";

export function registroVazio(data: string): RegistroDiario {
  return { data, habitos_concluidos: [], valores_campos_extras: [] };
}

export function concluidoEm(registros: MapaRegistros, data: string, habitoId: string): boolean {
  const registro = registros[data];
  if (!registro) return false;
  return registro.habitos_concluidos.some((c) => c.habito_id === habitoId && c.concluido);
}

export function valorCampoExtra(
  registros: MapaRegistros,
  data: string,
  habitoId: string,
  campoId: string,
): number | string | undefined {
  return registros[data]?.valores_campos_extras.find(
    (v) => v.habito_id === habitoId && v.campo_extra_id === campoId,
  )?.valor;
}

/** Quantos dias do mês (prefixo YYYY-MM) o hábito foi concluído. */
export function diasConcluidosNoMes(
  registros: MapaRegistros,
  prefixoMes: string,
  habitoId: string,
): number {
  let total = 0;
  for (const data of Object.keys(registros)) {
    if (data.startsWith(prefixoMes) && concluidoEm(registros, data, habitoId)) total++;
  }
  return total;
}

/** % de conclusão de um dia: hábitos ativos concluídos / total de ativos. */
export function percentualDoDia(
  registros: MapaRegistros,
  data: string,
  habitosAtivos: Habito[],
): number {
  if (habitosAtivos.length === 0) return 0;
  const feitos = habitosAtivos.filter((h) => concluidoEm(registros, data, h.id)).length;
  return Math.round((feitos / habitosAtivos.length) * 100);
}

export function habitosAtivosOrdenados(habitos: Habito[]): Habito[] {
  return habitos.filter((h) => h.ativo).sort((a, b) => a.ordem - b.ordem);
}
