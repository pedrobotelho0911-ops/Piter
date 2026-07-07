import type { DadosBackup } from "../types";

// Identificador fixo usado para reencontrar o backup do app na conta do usuário.
export const DESCRICAO_GIST = "rotina-app-backup";
export const ARQUIVO_GIST = "dados.json";

const API = "https://api.github.com";

export class ErroBackup extends Error {}

async function requisicao(token: string, caminho: string, init?: RequestInit): Promise<Response> {
  let resposta: Response;
  try {
    resposta = await fetch(`${API}${caminho}`, {
      ...init,
      headers: {
        Accept: "application/vnd.github+json",
        Authorization: `Bearer ${token}`,
        ...init?.headers,
      },
    });
  } catch {
    throw new ErroBackup("Sem conexão com a internet. O backup fica pendente e tenta de novo depois.");
  }
  if (resposta.status === 401) {
    throw new ErroBackup("Token inválido ou expirado. Confira se ele tem a permissão \"gist\".");
  }
  if (resposta.status === 403 || resposta.status === 429) {
    throw new ErroBackup("Limite de uso da API do GitHub atingido. Tente de novo em alguns minutos.");
  }
  if (!resposta.ok) {
    throw new ErroBackup(`A API do GitHub respondeu com erro (${resposta.status}).`);
  }
  return resposta;
}

function corpoGist(dados: DadosBackup): string {
  return JSON.stringify({
    description: DESCRICAO_GIST,
    public: false, // o backup é sempre um Gist privado
    files: { [ARQUIVO_GIST]: { content: JSON.stringify(dados, null, 2) } },
  });
}

export async function criarGist(token: string, dados: DadosBackup): Promise<string> {
  const resposta = await requisicao(token, "/gists", { method: "POST", body: corpoGist(dados) });
  const json = (await resposta.json()) as { id: string };
  return json.id;
}

export async function atualizarGist(token: string, gistId: string, dados: DadosBackup): Promise<void> {
  await requisicao(token, `/gists/${gistId}`, { method: "PATCH", body: corpoGist(dados) });
}

interface GistResumo {
  id: string;
  description: string | null;
  files: Record<string, { filename: string }>;
}

/** Procura na conta o Gist de backup do app (pela descrição fixa). */
export async function procurarGistDoApp(
  token: string,
): Promise<{ id: string; dados: DadosBackup } | null> {
  const resposta = await requisicao(token, "/gists?per_page=100");
  const lista = (await resposta.json()) as GistResumo[];
  const achado = lista.find((g) => g.description === DESCRICAO_GIST && ARQUIVO_GIST in g.files);
  if (!achado) return null;
  const dados = await lerGist(token, achado.id);
  return { id: achado.id, dados };
}

export async function lerGist(token: string, gistId: string): Promise<DadosBackup> {
  const resposta = await requisicao(token, `/gists/${gistId}`);
  const json = (await resposta.json()) as {
    files: Record<string, { content: string; truncated: boolean; raw_url: string }>;
  };
  const arquivo = json.files[ARQUIVO_GIST];
  if (!arquivo) throw new ErroBackup("O Gist encontrado não tem o arquivo dados.json.");

  let conteudo = arquivo.content;
  if (arquivo.truncated) {
    const bruta = await fetch(arquivo.raw_url, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!bruta.ok) throw new ErroBackup("Não foi possível baixar o conteúdo completo do backup.");
    conteudo = await bruta.text();
  }

  let dados: DadosBackup;
  try {
    dados = JSON.parse(conteudo) as DadosBackup;
  } catch {
    throw new ErroBackup("O backup encontrado está ilegível (JSON inválido).");
  }
  if (!Array.isArray(dados.habitos) || !Array.isArray(dados.registros_diarios)) {
    throw new ErroBackup("O backup encontrado não tem o formato esperado do app Rotina.");
  }
  return dados;
}
