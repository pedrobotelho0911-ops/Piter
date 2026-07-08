import { useState, type FormEvent } from "react";
import type { useBackup } from "../hooks/useBackup";
import type { StatusBackup } from "../types";
import { GistError } from "../lib/gist";

interface AjustesScreenProps {
  backup: ReturnType<typeof useBackup>;
}

const LINK_TOKEN =
  "https://github.com/settings/tokens/new?scopes=gist&description=Piter%20Finan%C3%A7as%20-%20Backup";

const STATUS_META: Record<StatusBackup, { icone: string; label: string }> = {
  sincronizado: { icone: "🟢", label: "Sincronizado" },
  pendente: { icone: "🟡", label: "Sincronizando…" },
  erro: { icone: "🔴", label: "Erro ao sincronizar" },
  nunca_sincronizado: { icone: "⚪", label: "Backup não configurado" },
};

function formatarData(iso: string | null): string {
  if (!iso) return "nunca";
  return new Date(iso).toLocaleString("pt-PT", { dateStyle: "short", timeStyle: "short" });
}

function mensagemErro(err: unknown): string {
  return err instanceof GistError ? err.message : "Algo deu errado. Tente novamente.";
}

export function AjustesScreen({ backup }: AjustesScreenProps) {
  const [token, setToken] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [escolha, setEscolha] = useState<{ gistId: string; atualizadoEm: string } | null>(null);

  async function handleConectar(e: FormEvent) {
    e.preventDefault();
    if (!token.trim()) return;
    setCarregando(true);
    setErro(null);
    try {
      const resultado = await backup.conectar(token.trim());
      if (resultado.tipo === "existente") {
        setEscolha({ gistId: resultado.gistId, atualizadoEm: resultado.atualizadoEm });
      } else {
        setToken("");
      }
    } catch (err) {
      setErro(mensagemErro(err));
    } finally {
      setCarregando(false);
    }
  }

  async function handleRestaurarEscolha() {
    if (!escolha) return;
    setCarregando(true);
    setErro(null);
    try {
      await backup.restaurarDeDados(escolha.gistId);
      setEscolha(null);
      setToken("");
    } catch (err) {
      setErro(mensagemErro(err));
    } finally {
      setCarregando(false);
    }
  }

  async function handleManterLocalEscolha() {
    if (!escolha) return;
    setCarregando(true);
    setErro(null);
    try {
      await backup.adotarGistSobrescrevendo(escolha.gistId);
      setEscolha(null);
      setToken("");
    } catch (err) {
      setErro(mensagemErro(err));
    } finally {
      setCarregando(false);
    }
  }

  async function handleBackupAgora() {
    setCarregando(true);
    setErro(null);
    await backup.fazerBackupAgora();
    setCarregando(false);
  }

  async function handleRestaurarAtual() {
    setCarregando(true);
    setErro(null);
    try {
      await backup.baixarBackupAtual();
    } catch (err) {
      setErro(mensagemErro(err));
    } finally {
      setCarregando(false);
    }
  }

  if (escolha) {
    return (
      <div className="ajustes-screen">
        <section className="panel">
          <h2>Já existe um backup salvo</h2>
          <p className="panel-subtitle">
            Encontramos um backup na sua conta do GitHub, atualizado em{" "}
            {formatarData(escolha.atualizadoEm)}. O que você quer fazer?
          </p>
          {erro && <p className="ajustes-erro">{erro}</p>}
          <div className="ajustes-actions">
            <button
              type="button"
              className="btn-primary"
              onClick={handleRestaurarEscolha}
              disabled={carregando}
            >
              Restaurar esse backup (substitui os dados daqui)
            </button>
            <button
              type="button"
              className="btn-ghost"
              onClick={handleManterLocalEscolha}
              disabled={carregando}
            >
              Manter os dados daqui (substitui o backup salvo)
            </button>
          </div>
        </section>
      </div>
    );
  }

  if (!backup.conectado) {
    return (
      <div className="ajustes-screen">
        <section className="panel">
          <h2>Backup na nuvem</h2>
          <p className="panel-subtitle">
            Guarde seus dados com segurança num Gist privado da sua conta do GitHub. Se trocar
            de celular ou usar o app em outro aparelho, é só conectar com o mesmo token que os
            dados voltam. Não é sincronização em tempo real entre dois aparelhos ao mesmo tempo
            — é um backup que você atualiza e restaura quando quiser.
          </p>
          <a className="btn-ghost ajustes-link-token" href={LINK_TOKEN} target="_blank" rel="noreferrer">
            1. Gerar token do GitHub (grátis) →
          </a>
          <form onSubmit={handleConectar} className="stack-form ajustes-form-token">
            <label>
              2. Cole o token aqui
              <input
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="ghp_..."
                type="password"
                autoComplete="off"
              />
            </label>
            {erro && <p className="ajustes-erro">{erro}</p>}
            <button type="submit" className="btn-primary" disabled={carregando || !token.trim()}>
              {carregando ? "Conectando…" : "Conectar backup"}
            </button>
          </form>
        </section>
      </div>
    );
  }

  const statusMeta = STATUS_META[backup.config.status];

  return (
    <div className="ajustes-screen">
      <section className="panel">
        <h2>Backup na nuvem</h2>
        <div className="ajustes-status">
          <span>{statusMeta.icone}</span>
          <div>
            <strong>{statusMeta.label}</strong>
            <p>Último backup: {formatarData(backup.config.ultimo_backup)}</p>
          </div>
        </div>
        {erro && <p className="ajustes-erro">{erro}</p>}
        <div className="ajustes-actions">
          <button type="button" className="btn-primary" onClick={handleBackupAgora} disabled={carregando}>
            Fazer backup agora
          </button>
          <button type="button" className="btn-ghost" onClick={handleRestaurarAtual} disabled={carregando}>
            Restaurar do backup
          </button>
          <button type="button" className="btn-ghost" onClick={backup.desconectar} disabled={carregando}>
            Desconectar backup
          </button>
        </div>
      </section>
    </div>
  );
}
