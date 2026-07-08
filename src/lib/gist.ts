import type { DadosBackup } from "../types";

const API_BASE = "https://api.github.com";
const DESCRICAO_GIST = "piter-financas-backup";
const NOME_ARQUIVO = "dados.json";
export const VERSAO_SCHEMA_ATUAL = 1;

export type TipoErroGist = "rede" | "autenticacao" | "limite" | "nao_encontrado" | "desconhecido";

export class GistError extends Error {
  tipo: TipoErroGist;

  constructor(tipo: TipoErroGist, mensagem: string) {
    super(mensagem);
    this.tipo = tipo;
  }
}

function headers(token: string): HeadersInit {
  return {
    Authorization: `Bearer ${token}`,
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
  };
}

async function requisitar(url: string, token: string, init?: RequestInit): Promise<Response> {
  let response: Response;
  try {
    response = await fetch(url, { ...init, headers: { ...headers(token), ...init?.headers } });
  } catch {
    throw new GistError(
      "rede",
      "Sem conexão com a internet no momento. O backup será tentado de novo automaticamente.",
    );
  }

  if (response.status === 401) {
    throw new GistError(
      "autenticacao",
      "O token informado é inválido ou expirou. Gere um novo token e conecte novamente.",
    );
  }
  if (response.status === 429) {
    throw new GistError(
      "limite",
      "O GitHub limitou temporariamente as requisições. Tentaremos de novo em alguns minutos.",
    );
  }
  if (response.status === 403) {
    // Não dá pra confiar em ler o cabeçalho de rate limit em chamadas entre origens
    // diferentes (o navegador pode bloquear o acesso a ele), então cobrimos as duas
    // causas mais comuns num único aviso.
    throw new GistError(
      "autenticacao",
      "O token não tem permissão suficiente (verifique o escopo \"gist\") ou o GitHub limitou as " +
        "requisições por agora. Gere um novo token ou tente de novo em alguns minutos.",
    );
  }
  if (response.status === 404) {
    throw new GistError("nao_encontrado", "Backup não encontrado no GitHub.");
  }
  if (!response.ok) {
    throw new GistError(
      "desconhecido",
      "Não foi possível falar com o GitHub agora. Tente novamente mais tarde.",
    );
  }

  return response;
}

interface GistResumo {
  id: string;
  description: string | null;
  updated_at: string;
}

/**
 * Também serve para validar o token: se o token não tiver o escopo "gist",
 * a chamada falha com autenticacao/permissão antes de procurar o gist.
 */
export async function encontrarGistExistente(
  token: string,
): Promise<{ gistId: string; atualizadoEm: string } | null> {
  let pagina = 1;
  while (pagina <= 5) {
    const response = await requisitar(
      `${API_BASE}/gists?per_page=100&page=${pagina}`,
      token,
    );
    const gists = (await response.json()) as GistResumo[];
    const encontrado = gists.find((g) => g.description === DESCRICAO_GIST);
    if (encontrado) {
      return { gistId: encontrado.id, atualizadoEm: encontrado.updated_at };
    }
    if (gists.length < 100) return null;
    pagina += 1;
  }
  return null;
}

export async function criarGist(token: string, dados: DadosBackup): Promise<string> {
  const response = await requisitar(`${API_BASE}/gists`, token, {
    method: "POST",
    body: JSON.stringify({
      description: DESCRICAO_GIST,
      public: false,
      files: { [NOME_ARQUIVO]: { content: JSON.stringify(dados) } },
    }),
  });
  const gist = (await response.json()) as { id: string };
  return gist.id;
}

export async function atualizarGist(
  token: string,
  gistId: string,
  dados: DadosBackup,
): Promise<void> {
  await requisitar(`${API_BASE}/gists/${gistId}`, token, {
    method: "PATCH",
    body: JSON.stringify({
      files: { [NOME_ARQUIVO]: { content: JSON.stringify(dados) } },
    }),
  });
}

interface GistArquivo {
  content?: string;
  truncated?: boolean;
  raw_url?: string;
}

export async function lerGist(token: string, gistId: string): Promise<DadosBackup> {
  const response = await requisitar(`${API_BASE}/gists/${gistId}`, token);
  const gist = (await response.json()) as { files: Record<string, GistArquivo> };
  const arquivo = gist.files[NOME_ARQUIVO];
  if (!arquivo) {
    throw new GistError("nao_encontrado", "O backup no GitHub está com um formato inesperado.");
  }

  let conteudo = arquivo.content ?? "";
  if (arquivo.truncated && arquivo.raw_url) {
    const bruto = await requisitar(arquivo.raw_url, token);
    conteudo = await bruto.text();
  }

  try {
    return JSON.parse(conteudo) as DadosBackup;
  } catch {
    throw new GistError("desconhecido", "O backup no GitHub está corrompido ou em formato inválido.");
  }
}
