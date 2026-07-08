/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  uid,
  type CampoExtra,
  type ConfiguracaoBackup,
  type ConfiguracaoGeral,
  type DadosBackup,
  type Habito,
  type MapaRegistros,
} from "../types";
import {
  CONFIG_GERAL_PADRAO,
  gravarConfigBackup,
  gravarConfigGeral,
  gravarHabitos,
  gravarNotaFixa,
  gravarRegistros,
  lerConfigBackup,
  lerConfigGeral,
  lerHabitos,
  lerNotaFixa,
  lerRegistros,
  montarDadosBackup,
  registrosParaMapa,
} from "../lib/armazenamento";
import { atualizarGist, criarGist, lerGist, procurarGistDoApp } from "../lib/gist";
import { registroVazio } from "../lib/registros";

const ATRASO_SYNC_MS = 5000; // debounce pra não estourar a API do GitHub a cada toque

interface ValorApp {
  habitos: Habito[];
  registros: MapaRegistros;
  geral: ConfiguracaoGeral;
  backup: ConfiguracaoBackup;
  notaFixa: string;

  criarHabito: (nome: string, emoji: string, metaMensal: number) => void;
  editarHabito: (id: string, mudancas: Partial<Omit<Habito, "id">>) => void;
  definirAtivo: (id: string, ativo: boolean) => void;
  excluirHabito: (id: string) => void;
  reordenarHabitos: (idsNaNovaOrdem: string[]) => void;
  adicionarCampoExtra: (habitoId: string, campo: Omit<CampoExtra, "id">) => void;
  removerCampoExtra: (habitoId: string, campoId: string) => void;

  alternarConclusao: (data: string, habitoId: string) => void;
  definirValorCampoExtra: (
    data: string,
    habitoId: string,
    campoId: string,
    valor: number | string,
  ) => void;
  definirAvaliacao: (data: string, tipo: "humor" | "motivacao", valor: number | undefined) => void;
  definirObservacao: (data: string, texto: string) => void;

  atualizarGeral: (mudancas: Partial<ConfiguracaoGeral>) => void;
  definirNotaFixa: (texto: string) => void;

  conectarBackup: (token: string) => Promise<{ id: string; dados: DadosBackup } | null>;
  restaurarDeDados: (token: string, gistId: string, dados: DadosBackup) => void;
  adotarGistSobrescrevendo: (token: string, gistId: string) => Promise<void>;
  fazerBackupAgora: () => Promise<void>;
  baixarBackupAtual: () => Promise<DadosBackup>;
  desconectarBackup: () => void;
}

const AppContext = createContext<ValorApp | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [habitos, setHabitos] = useState<Habito[]>(lerHabitos);
  const [registros, setRegistros] = useState<MapaRegistros>(lerRegistros);
  const [geral, setGeral] = useState<ConfiguracaoGeral>(lerConfigGeral);
  const [backup, setBackup] = useState<ConfiguracaoBackup>(lerConfigBackup);
  const [notaFixa, setNotaFixa] = useState<string>(lerNotaFixa);

  // Refs com o estado mais recente, para o envio adiado (debounce) do backup.
  const dadosRef = useRef({ habitos, registros, geral, notaFixa });
  dadosRef.current = { habitos, registros, geral, notaFixa };
  const backupRef = useRef(backup);
  backupRef.current = backup;
  const timerSyncRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const primeiraRenderizacao = useRef(true);

  const executarBackup = useCallback(async () => {
    const config = backupRef.current;
    if (!config.github_token || !config.gist_id) return;
    const { habitos, registros, geral, notaFixa } = dadosRef.current;
    try {
      await atualizarGist(
        config.github_token,
        config.gist_id,
        montarDadosBackup(habitos, registros, geral, notaFixa),
      );
      setBackup((atual) => ({
        ...atual,
        ultimo_backup: new Date().toISOString(),
        status: "sincronizado",
      }));
    } catch {
      // Sem internet ou API indisponível: o app continua normal, só marca o erro.
      setBackup((atual) => ({ ...atual, status: "erro" }));
    }
  }, []);

  const agendarBackup = useCallback(() => {
    if (!backupRef.current.github_token || !backupRef.current.gist_id) return;
    setBackup((atual) => (atual.status === "pendente" ? atual : { ...atual, status: "pendente" }));
    if (timerSyncRef.current) clearTimeout(timerSyncRef.current);
    timerSyncRef.current = setTimeout(() => void executarBackup(), ATRASO_SYNC_MS);
  }, [executarBackup]);

  // Persistência local: o localStorage é sempre a fonte da verdade no dia a dia.
  useEffect(() => gravarHabitos(habitos), [habitos]);
  useEffect(() => gravarRegistros(registros), [registros]);
  useEffect(() => gravarConfigGeral(geral), [geral]);
  useEffect(() => gravarConfigBackup(backup), [backup]);
  useEffect(() => gravarNotaFixa(notaFixa), [notaFixa]);

  // Qualquer alteração relevante nos dados agenda um backup automático.
  useEffect(() => {
    if (primeiraRenderizacao.current) {
      primeiraRenderizacao.current = false;
      return;
    }
    agendarBackup();
  }, [habitos, registros, geral, notaFixa, agendarBackup]);

  // Voltou a internet? Tenta de novo o que ficou pendente ou com erro.
  useEffect(() => {
    const aoVoltarOnline = () => {
      const { status, gist_id } = backupRef.current;
      if (gist_id && (status === "pendente" || status === "erro")) void executarBackup();
    };
    window.addEventListener("online", aoVoltarOnline);
    return () => window.removeEventListener("online", aoVoltarOnline);
  }, [executarBackup]);

  // ---- Hábitos ----

  const criarHabito = useCallback((nome: string, emoji: string, metaMensal: number) => {
    setHabitos((atuais) => [
      ...atuais,
      {
        id: uid(),
        nome: nome.trim(),
        emoji,
        meta_mensal: metaMensal,
        ordem: atuais.length > 0 ? Math.max(...atuais.map((h) => h.ordem)) + 1 : 0,
        campos_extras: [],
        ativo: true,
      },
    ]);
  }, []);

  const editarHabito = useCallback((id: string, mudancas: Partial<Omit<Habito, "id">>) => {
    setHabitos((atuais) => atuais.map((h) => (h.id === id ? { ...h, ...mudancas } : h)));
  }, []);

  const definirAtivo = useCallback(
    (id: string, ativo: boolean) => editarHabito(id, { ativo }),
    [editarHabito],
  );

  const excluirHabito = useCallback((id: string) => {
    setHabitos((atuais) => atuais.filter((h) => h.id !== id));
    // Excluir de verdade apaga também o histórico daquele hábito.
    setRegistros((atuais) => {
      const novos: MapaRegistros = {};
      for (const [data, registro] of Object.entries(atuais)) {
        novos[data] = {
          ...registro,
          habitos_concluidos: registro.habitos_concluidos.filter((c) => c.habito_id !== id),
          valores_campos_extras: registro.valores_campos_extras.filter((v) => v.habito_id !== id),
        };
      }
      return novos;
    });
  }, []);

  const reordenarHabitos = useCallback((idsNaNovaOrdem: string[]) => {
    setHabitos((atuais) =>
      atuais.map((h) => {
        const indice = idsNaNovaOrdem.indexOf(h.id);
        return indice === -1 ? h : { ...h, ordem: indice };
      }),
    );
  }, []);

  const adicionarCampoExtra = useCallback((habitoId: string, campo: Omit<CampoExtra, "id">) => {
    setHabitos((atuais) =>
      atuais.map((h) =>
        h.id === habitoId ? { ...h, campos_extras: [...h.campos_extras, { ...campo, id: uid() }] } : h,
      ),
    );
  }, []);

  const removerCampoExtra = useCallback((habitoId: string, campoId: string) => {
    setHabitos((atuais) =>
      atuais.map((h) =>
        h.id === habitoId
          ? { ...h, campos_extras: h.campos_extras.filter((c) => c.id !== campoId) }
          : h,
      ),
    );
  }, []);

  // ---- Registros diários ----

  const alternarConclusao = useCallback((data: string, habitoId: string) => {
    setRegistros((atuais) => {
      const registro = atuais[data] ?? registroVazio(data);
      const existente = registro.habitos_concluidos.find((c) => c.habito_id === habitoId);
      const habitos_concluidos = existente
        ? registro.habitos_concluidos.map((c) =>
            c.habito_id === habitoId ? { ...c, concluido: !c.concluido } : c,
          )
        : [...registro.habitos_concluidos, { habito_id: habitoId, concluido: true }];
      return { ...atuais, [data]: { ...registro, habitos_concluidos } };
    });
  }, []);

  const definirValorCampoExtra = useCallback(
    (data: string, habitoId: string, campoId: string, valor: number | string) => {
      setRegistros((atuais) => {
        const registro = atuais[data] ?? registroVazio(data);
        const restantes = registro.valores_campos_extras.filter(
          (v) => !(v.habito_id === habitoId && v.campo_extra_id === campoId),
        );
        const valores_campos_extras =
          valor === ""
            ? restantes
            : [...restantes, { habito_id: habitoId, campo_extra_id: campoId, valor }];
        return { ...atuais, [data]: { ...registro, valores_campos_extras } };
      });
    },
    [],
  );

  const definirAvaliacao = useCallback(
    (data: string, tipo: "humor" | "motivacao", valor: number | undefined) => {
      setRegistros((atuais) => {
        const registro = atuais[data] ?? registroVazio(data);
        return { ...atuais, [data]: { ...registro, [tipo]: valor } };
      });
    },
    [],
  );

  const definirObservacao = useCallback((data: string, texto: string) => {
    setRegistros((atuais) => {
      const registro = atuais[data] ?? registroVazio(data);
      return { ...atuais, [data]: { ...registro, observacao: texto || undefined } };
    });
  }, []);

  // ---- Configuração geral ----

  const atualizarGeral = useCallback((mudancas: Partial<ConfiguracaoGeral>) => {
    setGeral((atual) => ({ ...CONFIG_GERAL_PADRAO, ...atual, ...mudancas }));
  }, []);

  const definirNotaFixa = useCallback((texto: string) => {
    setNotaFixa(texto);
  }, []);

  // ---- Backup (GitHub Gist) ----

  const conectarBackup = useCallback(
    async (token: string) => {
      const existente = await procurarGistDoApp(token);
      if (existente) return existente; // a decisão (restaurar x manter) fica com a interface

      const { habitos, registros, geral, notaFixa } = dadosRef.current;
      const gistId = await criarGist(token, montarDadosBackup(habitos, registros, geral, notaFixa));
      setBackup({
        github_token: token,
        gist_id: gistId,
        ultimo_backup: new Date().toISOString(),
        status: "sincronizado",
      });
      return null;
    },
    [],
  );

  const restaurarDeDados = useCallback((token: string, gistId: string, dados: DadosBackup) => {
    setHabitos(dados.habitos);
    setRegistros(registrosParaMapa(dados.registros_diarios));
    if (dados.configuracao_geral) setGeral(dados.configuracao_geral);
    setNotaFixa(dados.nota_fixa ?? "");
    setBackup({
      github_token: token,
      gist_id: gistId,
      ultimo_backup: new Date().toISOString(),
      status: "sincronizado",
    });
  }, []);

  const adotarGistSobrescrevendo = useCallback(async (token: string, gistId: string) => {
    const { habitos, registros, geral, notaFixa } = dadosRef.current;
    await atualizarGist(token, gistId, montarDadosBackup(habitos, registros, geral, notaFixa));
    setBackup({
      github_token: token,
      gist_id: gistId,
      ultimo_backup: new Date().toISOString(),
      status: "sincronizado",
    });
  }, []);

  const fazerBackupAgora = useCallback(async () => {
    const config = backupRef.current;
    if (!config.github_token || !config.gist_id) return;
    if (timerSyncRef.current) clearTimeout(timerSyncRef.current);
    const { habitos, registros, geral, notaFixa } = dadosRef.current;
    try {
      await atualizarGist(
        config.github_token,
        config.gist_id,
        montarDadosBackup(habitos, registros, geral, notaFixa),
      );
      setBackup((atual) => ({
        ...atual,
        ultimo_backup: new Date().toISOString(),
        status: "sincronizado",
      }));
    } catch (erro) {
      setBackup((atual) => ({ ...atual, status: "erro" }));
      throw erro;
    }
  }, []);

  const baixarBackupAtual = useCallback(async () => {
    const config = backupRef.current;
    if (!config.github_token || !config.gist_id) throw new Error("Backup não conectado.");
    return lerGist(config.github_token, config.gist_id);
  }, []);

  const desconectarBackup = useCallback(() => {
    // Remove só o token local; o Gist continua intacto na conta do GitHub.
    setBackup((atual) => ({
      github_token: null,
      gist_id: null,
      ultimo_backup: atual.ultimo_backup,
      status: "nunca_sincronizado",
    }));
  }, []);

  const valor = useMemo<ValorApp>(
    () => ({
      habitos,
      registros,
      geral,
      backup,
      notaFixa,
      criarHabito,
      editarHabito,
      definirAtivo,
      excluirHabito,
      reordenarHabitos,
      adicionarCampoExtra,
      removerCampoExtra,
      alternarConclusao,
      definirValorCampoExtra,
      definirAvaliacao,
      definirObservacao,
      atualizarGeral,
      definirNotaFixa,
      conectarBackup,
      restaurarDeDados,
      adotarGistSobrescrevendo,
      fazerBackupAgora,
      baixarBackupAtual,
      desconectarBackup,
    }),
    [
      habitos,
      registros,
      geral,
      backup,
      notaFixa,
      criarHabito,
      editarHabito,
      definirAtivo,
      excluirHabito,
      reordenarHabitos,
      adicionarCampoExtra,
      removerCampoExtra,
      alternarConclusao,
      definirValorCampoExtra,
      definirAvaliacao,
      definirObservacao,
      atualizarGeral,
      definirNotaFixa,
      conectarBackup,
      restaurarDeDados,
      adotarGistSobrescrevendo,
      fazerBackupAgora,
      baixarBackupAtual,
      desconectarBackup,
    ],
  );

  return <AppContext.Provider value={valor}>{children}</AppContext.Provider>;
}

export function useApp(): ValorApp {
  const contexto = useContext(AppContext);
  if (!contexto) throw new Error("useApp precisa estar dentro de <AppProvider>.");
  return contexto;
}
