import { useCallback, useEffect, useState } from "react";
import type { ConfiguracaoBackup, DadosBackup, FinanceData } from "../types";
import {
  VERSAO_SCHEMA_ATUAL,
  atualizarGist,
  criarGist,
  encontrarGistExistente,
  lerGist,
} from "../lib/gist";

const STORAGE_KEY = "piter-financas:backup";

const CONFIGURACAO_PADRAO: ConfiguracaoBackup = {
  github_token: "",
  gist_id: null,
  ultimo_backup: null,
  status: "nunca_sincronizado",
};

function carregarConfig(): ConfiguracaoBackup {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return CONFIGURACAO_PADRAO;
    return { ...CONFIGURACAO_PADRAO, ...JSON.parse(raw) };
  } catch {
    return CONFIGURACAO_PADRAO;
  }
}

export type ResultadoConexao =
  | { tipo: "novo" }
  | { tipo: "existente"; gistId: string; atualizadoEm: string };

export function useBackup(financeData: FinanceData, onRestaurar: (dados: FinanceData) => void) {
  const [config, setConfig] = useState<ConfiguracaoBackup>(carregarConfig);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  }, [config]);

  const conectar = useCallback(
    async (token: string): Promise<ResultadoConexao> => {
      const existente = await encontrarGistExistente(token);
      if (existente) {
        setConfig((c) => ({ ...c, github_token: token }));
        return { tipo: "existente", gistId: existente.gistId, atualizadoEm: existente.atualizadoEm };
      }
      const dados: DadosBackup = { versao_schema: VERSAO_SCHEMA_ATUAL, dados: financeData };
      const gistId = await criarGist(token, dados);
      setConfig({
        github_token: token,
        gist_id: gistId,
        ultimo_backup: new Date().toISOString(),
        status: "sincronizado",
      });
      return { tipo: "novo" };
    },
    [financeData],
  );

  const restaurarDeDados = useCallback(
    async (gistId: string) => {
      const backup = await lerGist(config.github_token, gistId);
      onRestaurar(backup.dados);
      setConfig((c) => ({
        ...c,
        gist_id: gistId,
        ultimo_backup: new Date().toISOString(),
        status: "sincronizado",
      }));
    },
    [config.github_token, onRestaurar],
  );

  const baixarBackupAtual = useCallback(async () => {
    if (!config.gist_id) return;
    await restaurarDeDados(config.gist_id);
  }, [config.gist_id, restaurarDeDados]);

  const adotarGistSobrescrevendo = useCallback(
    async (gistId: string) => {
      const dados: DadosBackup = { versao_schema: VERSAO_SCHEMA_ATUAL, dados: financeData };
      await atualizarGist(config.github_token, gistId, dados);
      setConfig((c) => ({
        ...c,
        gist_id: gistId,
        status: "sincronizado",
        ultimo_backup: new Date().toISOString(),
      }));
    },
    [config.github_token, financeData],
  );

  const fazerBackupAgora = useCallback(async () => {
    if (!config.github_token) return;
    setConfig((c) => ({ ...c, status: "pendente" }));
    try {
      const dados: DadosBackup = { versao_schema: VERSAO_SCHEMA_ATUAL, dados: financeData };
      if (config.gist_id) {
        await atualizarGist(config.github_token, config.gist_id, dados);
        setConfig((c) => ({ ...c, status: "sincronizado", ultimo_backup: new Date().toISOString() }));
      } else {
        const novoId = await criarGist(config.github_token, dados);
        setConfig((c) => ({
          ...c,
          gist_id: novoId,
          status: "sincronizado",
          ultimo_backup: new Date().toISOString(),
        }));
      }
    } catch {
      setConfig((c) => ({ ...c, status: "erro" }));
    }
  }, [config.github_token, config.gist_id, financeData]);

  const desconectar = useCallback(() => {
    setConfig(CONFIGURACAO_PADRAO);
  }, []);

  // Backup automático com debounce de 5s a cada mudança nos dados, só quando já conectado.
  useEffect(() => {
    if (!config.github_token || !config.gist_id) return;
    const timer = setTimeout(() => {
      fazerBackupAgora();
    }, 5000);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [financeData]);

  // Se um backup falhou, tenta de novo ao voltar a conexão e periodicamente enquanto durar o erro.
  useEffect(() => {
    if (config.status !== "erro" || !config.github_token || !config.gist_id) return;
    const aoReconectar = () => fazerBackupAgora();
    window.addEventListener("online", aoReconectar);
    const intervalo = setInterval(aoReconectar, 60000);
    return () => {
      window.removeEventListener("online", aoReconectar);
      clearInterval(intervalo);
    };
  }, [config.status, config.github_token, config.gist_id, fazerBackupAgora]);

  return {
    config,
    conectado: Boolean(config.github_token && config.gist_id),
    conectar,
    restaurarDeDados,
    adotarGistSobrescrevendo,
    fazerBackupAgora,
    baixarBackupAtual,
    desconectar,
  };
}
