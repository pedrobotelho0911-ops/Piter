import { useState } from "react";
import type { DadosBackup, StatusBackup } from "../types";
import { useApp } from "../store/AppContext";
import { formatarDataHora } from "../lib/datas";
import { Modal, estiloBotaoPrimario, estiloBotaoSecundario, estiloCampo } from "./Modal";

const ROTULOS_STATUS: Record<StatusBackup, { icone: string; texto: string; cor: string }> = {
  sincronizado: { icone: "✅", texto: "Sincronizado", cor: "text-verde" },
  pendente: { icone: "⚠️", texto: "Backup pendente", cor: "text-dourado" },
  erro: { icone: "❌", texto: "Erro no último envio", cor: "text-red-400" },
  nunca_sincronizado: { icone: "💤", texto: "Nunca sincronizado", cor: "text-texto-fraco" },
};

const LINK_TOKEN =
  "https://github.com/settings/tokens/new?scopes=gist&description=Backup%20do%20app%20Rotina";

interface Decisao {
  token: string;
  gistId: string;
  dados: DadosBackup;
}

export function PainelBackup() {
  const {
    backup,
    conectarBackup,
    restaurarDeDados,
    adotarGistSobrescrevendo,
    fazerBackupAgora,
    baixarBackupAtual,
    desconectarBackup,
  } = useApp();

  const [token, setToken] = useState("");
  const [ocupado, setOcupado] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [decisao, setDecisao] = useState<Decisao | null>(null);
  const [restauracao, setRestauracao] = useState<DadosBackup | null>(null);
  const [confirmandoDesconexao, setConfirmandoDesconexao] = useState(false);

  const conectado = Boolean(backup.github_token && backup.gist_id);
  const status = ROTULOS_STATUS[backup.status];

  async function executar(acao: () => Promise<void>) {
    setErro(null);
    setOcupado(true);
    try {
      await acao();
    } catch (excecao) {
      setErro(excecao instanceof Error ? excecao.message : "Algo deu errado. Tente de novo.");
    } finally {
      setOcupado(false);
    }
  }

  function conectar() {
    const tokenLimpo = token.trim();
    if (!tokenLimpo) return;
    void executar(async () => {
      const existente = await conectarBackup(tokenLimpo);
      if (existente) {
        // Já existe um backup nessa conta: o usuário decide o que fazer.
        setDecisao({ token: tokenLimpo, gistId: existente.id, dados: existente.dados });
      } else {
        setToken("");
      }
    });
  }

  return (
    <div className="rounded-3xl border border-borda bg-superficie p-5">
      <h2 className="text-sm font-bold uppercase tracking-wider text-texto-fraco">
        Backup no GitHub
      </h2>

      {/* Status sempre visível */}
      <div className="mt-3 rounded-2xl bg-fundo p-3">
        <p className={`font-bold ${status.cor}`}>
          {status.icone} {status.texto}
        </p>
        <p className="mt-0.5 text-sm text-texto-fraco">
          Último backup: {backup.ultimo_backup ? formatarDataHora(backup.ultimo_backup) : "nunca"}
        </p>
      </div>

      {erro && (
        <p className="mt-3 rounded-xl border border-red-400/40 bg-red-400/10 p-3 text-sm text-red-300">
          {erro}
        </p>
      )}

      {!conectado ? (
        <div className="mt-4 flex flex-col gap-3">
          <p className="text-sm leading-relaxed text-texto-fraco">
            Seus dados ficam salvos neste aparelho. Pra não perder nada se trocar de celular, o app
            guarda uma cópia de segurança num arquivo privado da sua conta do GitHub (um "Gist").
            Você só precisa colar aqui um token de acesso — ele fica salvo apenas neste aparelho e
            só é usado pra falar com o GitHub.
          </p>
          <a
            href={LINK_TOKEN}
            target="_blank"
            rel="noreferrer"
            className="text-sm font-semibold text-ciano underline underline-offset-2"
          >
            Gerar um token no GitHub (marque só a permissão "gist") →
          </a>
          <input
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="Cole o token aqui (ghp_...)"
            type="password"
            autoComplete="off"
            className={estiloCampo}
          />
          <button onClick={conectar} disabled={ocupado || !token.trim()} className={estiloBotaoPrimario}>
            {ocupado ? "Conectando..." : "Conectar backup"}
          </button>
          <p className="text-xs leading-relaxed text-texto-fraco">
            Trocou de aparelho? Cole o mesmo token de sempre: o app encontra seu backup e oferece
            restaurar os dados aqui.
          </p>
        </div>
      ) : (
        <div className="mt-4 flex flex-col gap-2">
          <button
            onClick={() => void executar(() => fazerBackupAgora())}
            disabled={ocupado}
            className={estiloBotaoPrimario}
          >
            {ocupado ? "Enviando..." : "Fazer backup agora"}
          </button>
          <button
            onClick={() =>
              void executar(async () => {
                setRestauracao(await baixarBackupAtual());
              })
            }
            disabled={ocupado}
            className={estiloBotaoSecundario}
          >
            Restaurar do backup
          </button>
          <button
            onClick={() => setConfirmandoDesconexao(true)}
            disabled={ocupado}
            className="min-h-11 w-full rounded-xl px-4 py-3 font-semibold text-texto-fraco active:bg-card"
          >
            Desconectar backup
          </button>
        </div>
      )}

      <p className="mt-4 text-xs leading-relaxed text-texto-fraco">
        O backup é automático alguns segundos depois de cada mudança. Ele não é uma sincronização em
        tempo real entre dois aparelhos usados ao mesmo tempo — é uma cópia de segurança com
        restauração sob demanda.
      </p>

      {decisao && (
        <Modal titulo="Backup encontrado" onFechar={() => setDecisao(null)}>
          <p className="mb-4 text-sm leading-relaxed text-texto-fraco">
            Essa conta do GitHub já tem um backup do Rotina com{" "}
            <strong className="text-texto">{decisao.dados.habitos.length} hábitos</strong> e{" "}
            <strong className="text-texto">{decisao.dados.registros_diarios.length} dias registrados</strong>.
            O que você quer fazer?
          </p>
          <div className="flex flex-col gap-2">
            <button
              onClick={() => {
                restaurarDeDados(decisao.token, decisao.gistId, decisao.dados);
                setDecisao(null);
                setToken("");
              }}
              className={estiloBotaoPrimario}
            >
              Restaurar o backup (substitui os dados deste aparelho)
            </button>
            <button
              onClick={() =>
                void executar(async () => {
                  await adotarGistSobrescrevendo(decisao.token, decisao.gistId);
                  setDecisao(null);
                  setToken("");
                })
              }
              disabled={ocupado}
              className={estiloBotaoSecundario}
            >
              Manter os dados locais (sobrescreve o backup)
            </button>
          </div>
        </Modal>
      )}

      {restauracao && backup.github_token && backup.gist_id && (
        <Modal titulo="Restaurar do backup" onFechar={() => setRestauracao(null)}>
          <p className="mb-4 text-sm leading-relaxed text-texto-fraco">
            O backup tem <strong className="text-texto">{restauracao.habitos.length} hábitos</strong> e{" "}
            <strong className="text-texto">{restauracao.registros_diarios.length} dias registrados</strong>.
            Restaurar vai <strong className="text-texto">substituir todos os dados deste aparelho</strong>.
          </p>
          <div className="flex flex-col gap-2">
            <button
              onClick={() => {
                restaurarDeDados(backup.github_token!, backup.gist_id!, restauracao);
                setRestauracao(null);
              }}
              className={estiloBotaoPrimario}
            >
              Substituir meus dados pelos do backup
            </button>
            <button onClick={() => setRestauracao(null)} className={estiloBotaoSecundario}>
              Cancelar
            </button>
          </div>
        </Modal>
      )}

      {confirmandoDesconexao && (
        <Modal titulo="Desconectar backup" onFechar={() => setConfirmandoDesconexao(false)}>
          <p className="mb-4 text-sm leading-relaxed text-texto-fraco">
            O token será removido deste aparelho e o backup automático para. O arquivo de backup
            continua intacto na sua conta do GitHub.
          </p>
          <div className="flex flex-col gap-2">
            <button
              onClick={() => {
                desconectarBackup();
                setConfirmandoDesconexao(false);
              }}
              className={estiloBotaoPrimario}
            >
              Desconectar
            </button>
            <button onClick={() => setConfirmandoDesconexao(false)} className={estiloBotaoSecundario}>
              Cancelar
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
