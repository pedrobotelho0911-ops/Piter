import {
  VERSAO_SCHEMA,
  type ConfiguracaoBackup,
  type ConfiguracaoGeral,
  type DadosBackup,
  type Habito,
  type MapaRegistros,
  type RegistroDiario,
} from "../types";

const CHAVES = {
  versao: "rotina:versao_schema",
  habitos: "rotina:habitos",
  registros: "rotina:registros_diarios",
  geral: "rotina:configuracao_geral",
  backup: "rotina:configuracao_backup",
} as const;

function ler<T>(chave: string, padrao: T): T {
  try {
    const bruto = localStorage.getItem(chave);
    if (bruto === null) return padrao;
    return JSON.parse(bruto) as T;
  } catch {
    return padrao;
  }
}

function gravar(chave: string, valor: unknown): void {
  try {
    localStorage.setItem(chave, JSON.stringify(valor));
  } catch {
    // localStorage cheio ou indisponível: o app segue funcionando em memória.
  }
}

export const CONFIG_GERAL_PADRAO: ConfiguracaoGeral = {
  humor: { ativo: true, nome: "Humor" },
  motivacao: { ativo: true, nome: "Motivação" },
};

export const CONFIG_BACKUP_PADRAO: ConfiguracaoBackup = {
  github_token: null,
  gist_id: null,
  ultimo_backup: null,
  status: "nunca_sincronizado",
};

export function lerHabitos(): Habito[] {
  return ler<Habito[]>(CHAVES.habitos, []);
}

export function gravarHabitos(habitos: Habito[]): void {
  gravar(CHAVES.habitos, habitos);
  gravar(CHAVES.versao, VERSAO_SCHEMA);
}

export function lerRegistros(): MapaRegistros {
  return ler<MapaRegistros>(CHAVES.registros, {});
}

export function gravarRegistros(registros: MapaRegistros): void {
  gravar(CHAVES.registros, registros);
}

export function lerConfigGeral(): ConfiguracaoGeral {
  const salvo = ler<Partial<ConfiguracaoGeral>>(CHAVES.geral, {});
  return {
    humor: { ...CONFIG_GERAL_PADRAO.humor, ...salvo.humor },
    motivacao: { ...CONFIG_GERAL_PADRAO.motivacao, ...salvo.motivacao },
  };
}

export function gravarConfigGeral(config: ConfiguracaoGeral): void {
  gravar(CHAVES.geral, config);
}

export function lerConfigBackup(): ConfiguracaoBackup {
  return { ...CONFIG_BACKUP_PADRAO, ...ler<Partial<ConfiguracaoBackup>>(CHAVES.backup, {}) };
}

export function gravarConfigBackup(config: ConfiguracaoBackup): void {
  gravar(CHAVES.backup, config);
}

export function montarDadosBackup(
  habitos: Habito[],
  registros: MapaRegistros,
  geral: ConfiguracaoGeral,
): DadosBackup {
  return {
    versao_schema: VERSAO_SCHEMA,
    habitos,
    registros_diarios: Object.values(registros).sort((a, b) => a.data.localeCompare(b.data)),
    configuracao_geral: geral,
  };
}

export function registrosParaMapa(registros: RegistroDiario[]): MapaRegistros {
  const mapa: MapaRegistros = {};
  for (const registro of registros) mapa[registro.data] = registro;
  return mapa;
}
