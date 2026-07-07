export const VERSAO_SCHEMA = 1;

export type TipoCampoExtra = "barra_numerica" | "nota_1_a_5" | "texto_curto";

export interface CampoExtra {
  id: string;
  tipo: TipoCampoExtra;
  nome: string; // ex: "Páginas lidas", "Energia do dia"
  unidade?: string; // ex: "páginas", "km" (só para barra_numerica)
}

export interface Habito {
  id: string;
  nome: string;
  emoji: string;
  meta_mensal: number; // dias que quero cumprir no mês
  cor_destaque?: string; // opcional, sobrescreve o verde neon padrão
  ordem: number; // para reordenação manual
  campos_extras: CampoExtra[];
  ativo: boolean; // permite "arquivar" sem apagar histórico
}

export interface ConclusaoHabito {
  habito_id: string;
  concluido: boolean;
}

export interface ValorCampoExtra {
  habito_id: string;
  campo_extra_id: string;
  valor: number | string;
}

export interface RegistroDiario {
  data: string; // formato YYYY-MM-DD
  habitos_concluidos: ConclusaoHabito[];
  valores_campos_extras: ValorCampoExtra[];
  humor?: number; // 1 a 5, opcional
  motivacao?: number; // 1 a 5, opcional
  observacao?: string; // nota livre do dia
}

/** Registros indexados por data (YYYY-MM-DD) para acesso rápido no dia a dia. */
export type MapaRegistros = Record<string, RegistroDiario>;

export interface BlocoAvaliacao {
  ativo: boolean;
  nome: string;
}

export interface ConfiguracaoGeral {
  humor: BlocoAvaliacao;
  motivacao: BlocoAvaliacao;
}

export type StatusBackup = "sincronizado" | "pendente" | "erro" | "nunca_sincronizado";

export interface ConfiguracaoBackup {
  github_token: string | null; // salvo só localmente
  gist_id: string | null;
  ultimo_backup: string | null; // timestamp ISO
  status: StatusBackup;
}

/** Conteúdo do arquivo dados.json guardado no Gist. */
export interface DadosBackup {
  versao_schema: number;
  habitos: Habito[];
  registros_diarios: RegistroDiario[];
  configuracao_geral?: ConfiguracaoGeral;
}

export function uid(): string {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}
