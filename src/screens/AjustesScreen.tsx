import { useMemo, useRef, useState } from "react";
import type { Habito } from "../types";
import { useApp } from "../store/AppContext";
import { Modal, estiloBotaoPrimario, estiloBotaoSecundario, estiloCampo } from "../components/Modal";
import { FormularioHabito } from "../components/FormularioHabito";
import { PainelBackup } from "../components/PainelBackup";

// Altura de cada linha da lista (h-14 = 56px) + espaçamento (8px), usada
// pra converter o deslocamento do dedo em posições durante o arrasto.
const PASSO_ARRASTO = 64;

export function AjustesScreen() {
  const { habitos, geral, atualizarGeral, definirAtivo, excluirHabito, reordenarHabitos } = useApp();

  const [abaLista, setAbaLista] = useState<"ativos" | "arquivados">("ativos");
  const [criando, setCriando] = useState(false);
  const [editando, setEditando] = useState<Habito | null>(null);
  const [excluindo, setExcluindo] = useState<Habito | null>(null);

  const ativos = useMemo(
    () => habitos.filter((h) => h.ativo).sort((a, b) => a.ordem - b.ordem),
    [habitos],
  );
  const arquivados = useMemo(
    () => habitos.filter((h) => !h.ativo).sort((a, b) => a.ordem - b.ordem),
    [habitos],
  );
  const lista = abaLista === "ativos" ? ativos : arquivados;

  // ---- Arrastar pra reordenar (só na aba de ativos) ----
  const [previa, setPrevia] = useState<string[] | null>(null);
  const [idArrastado, setIdArrastado] = useState<string | null>(null);
  const arrasto = useRef<{ id: string; indiceInicial: number; y0: number; base: string[] } | null>(null);

  function iniciarArrasto(evento: React.PointerEvent, id: string) {
    evento.preventDefault();
    (evento.currentTarget as HTMLElement).setPointerCapture(evento.pointerId);
    const base = ativos.map((h) => h.id);
    arrasto.current = { id, indiceInicial: base.indexOf(id), y0: evento.clientY, base };
    setPrevia(base);
    setIdArrastado(id);
  }

  function moverArrasto(evento: React.PointerEvent) {
    const atual = arrasto.current;
    if (!atual) return;
    const passos = Math.round((evento.clientY - atual.y0) / PASSO_ARRASTO);
    const destino = Math.max(0, Math.min(atual.base.length - 1, atual.indiceInicial + passos));
    const nova = atual.base.filter((id) => id !== atual.id);
    nova.splice(destino, 0, atual.id);
    setPrevia(nova);
  }

  function soltarArrasto() {
    if (arrasto.current && previa) reordenarHabitos(previa);
    arrasto.current = null;
    setPrevia(null);
    setIdArrastado(null);
  }

  const idsOrdenados = previa ?? lista.map((h) => h.id);
  const porId = useMemo(() => new Map(habitos.map((h) => [h.id, h])), [habitos]);
  const listaExibida =
    abaLista === "ativos"
      ? (idsOrdenados.map((id) => porId.get(id)).filter(Boolean) as Habito[])
      : lista;

  return (
    <div className="px-4 pb-6">
      <header className="sticky top-0 z-20 -mx-4 border-b border-borda bg-fundo/95 px-4 py-3 backdrop-blur">
        <h1 className="text-2xl font-extrabold tracking-wide text-ciano">Ajustes</h1>
        <p className="text-xs font-semibold text-texto-fraco">hábitos, preferências e backup</p>
      </header>

      {/* ---- Hábitos ---- */}
      <section className="mt-4 rounded-3xl border border-borda bg-superficie p-5">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-sm font-bold uppercase tracking-wider text-texto-fraco">Hábitos</h2>
          <button
            onClick={() => setCriando(true)}
            className="min-h-11 rounded-xl bg-azul px-4 font-bold text-white active:scale-[0.98]"
          >
            + Novo
          </button>
        </div>

        <div className="mt-3 flex gap-2">
          {(["ativos", "arquivados"] as const).map((aba) => (
            <button
              key={aba}
              onClick={() => setAbaLista(aba)}
              className={`min-h-11 flex-1 rounded-xl border px-3 text-sm font-bold capitalize ${
                abaLista === aba
                  ? "border-ciano text-ciano"
                  : "border-borda text-texto-fraco active:bg-card"
              }`}
            >
              {aba} ({aba === "ativos" ? ativos.length : arquivados.length})
            </button>
          ))}
        </div>

        {listaExibida.length === 0 && (
          <p className="mt-4 text-sm text-texto-fraco">
            {abaLista === "ativos"
              ? "Nenhum hábito ativo. Crie um no botão acima."
              : "Nenhum hábito arquivado."}
          </p>
        )}

        <div className="mt-3 space-y-2">
          {listaExibida.map((habito) => (
            <div
              key={habito.id}
              className={`flex h-14 items-center gap-1 rounded-2xl border bg-card px-2 ${
                idArrastado === habito.id ? "border-ciano shadow-lg" : "border-transparent"
              }`}
            >
              {abaLista === "ativos" && (
                <button
                  aria-label={`Arrastar pra reordenar ${habito.nome}`}
                  onPointerDown={(e) => iniciarArrasto(e, habito.id)}
                  onPointerMove={moverArrasto}
                  onPointerUp={soltarArrasto}
                  onPointerCancel={soltarArrasto}
                  className="flex h-11 w-9 shrink-0 cursor-grab touch-none items-center justify-center text-texto-fraco"
                >
                  ☰
                </button>
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold">
                  <span className="mr-1">{habito.emoji}</span>
                  {habito.nome}
                </p>
                <p className="text-xs text-texto-fraco">
                  meta {habito.meta_mensal} dias
                  {habito.campos_extras.length > 0 &&
                    ` · ${habito.campos_extras.length} ${habito.campos_extras.length === 1 ? "campo extra" : "campos extras"}`}
                </p>
              </div>
              <button
                onClick={() => setEditando(habito)}
                aria-label={`Editar ${habito.nome}`}
                className="flex h-11 w-10 shrink-0 items-center justify-center rounded-xl active:bg-fundo"
              >
                ✏️
              </button>
              <button
                onClick={() => definirAtivo(habito.id, !habito.ativo)}
                aria-label={habito.ativo ? `Arquivar ${habito.nome}` : `Reativar ${habito.nome}`}
                className="flex h-11 w-10 shrink-0 items-center justify-center rounded-xl active:bg-fundo"
              >
                {habito.ativo ? "📦" : "♻️"}
              </button>
              <button
                onClick={() => setExcluindo(habito)}
                aria-label={`Excluir ${habito.nome}`}
                className="flex h-11 w-10 shrink-0 items-center justify-center rounded-xl active:bg-fundo"
              >
                🗑️
              </button>
            </div>
          ))}
        </div>

        {abaLista === "ativos" && ativos.length > 1 && (
          <p className="mt-3 text-xs text-texto-fraco">
            Segure o ☰ e arraste pra mudar a ordem dos hábitos na tela principal.
          </p>
        )}
      </section>

      {/* ---- Resumo diário ---- */}
      <section className="mt-4 rounded-3xl border border-borda bg-superficie p-5">
        <h2 className="text-sm font-bold uppercase tracking-wider text-texto-fraco">
          Blocos do resumo diário
        </h2>
        {(["humor", "motivacao"] as const).map((chave) => {
          const bloco = geral[chave];
          return (
            <div key={chave} className="mt-3 flex items-center gap-2">
              <input
                value={bloco.nome}
                onChange={(e) =>
                  atualizarGeral({ [chave]: { ...bloco, nome: e.target.value } })
                }
                aria-label={`Nome do bloco ${chave}`}
                className={estiloCampo}
              />
              <button
                role="switch"
                aria-checked={bloco.ativo}
                aria-label={`${bloco.ativo ? "Desativar" : "Ativar"} bloco ${bloco.nome}`}
                onClick={() => atualizarGeral({ [chave]: { ...bloco, ativo: !bloco.ativo } })}
                className={`relative h-11 w-16 shrink-0 rounded-full border transition-colors ${
                  bloco.ativo ? "border-ciano bg-ciano/25" : "border-borda bg-fundo"
                }`}
              >
                <span
                  className={`absolute top-1.5 h-7 w-7 rounded-full transition-all ${
                    bloco.ativo ? "left-8 bg-ciano" : "left-1.5 bg-texto-fraco"
                  }`}
                />
              </button>
            </div>
          );
        })}
        <p className="mt-3 text-xs text-texto-fraco">
          Você pode renomear os blocos (ex: "Energia") ou desativar os que não usa.
        </p>
      </section>

      {/* ---- Backup ---- */}
      <div className="mt-4">
        <PainelBackup />
      </div>

      {/* ---- Sobre ---- */}
      <section className="mt-4 rounded-3xl border border-borda bg-superficie p-5">
        <h2 className="text-sm font-bold uppercase tracking-wider text-texto-fraco">Sobre</h2>
        <p className="mt-2 text-sm leading-relaxed text-texto-fraco">
          O Rotina funciona 100% offline: tudo fica salvo neste aparelho. No celular, use "Adicionar
          à tela inicial" no navegador pra instalar como app.
        </p>
      </section>

      {criando && <FormularioHabito onFechar={() => setCriando(false)} />}
      {editando && <FormularioHabito habito={editando} onFechar={() => setEditando(null)} />}

      {excluindo && (
        <Modal titulo="Excluir hábito" onFechar={() => setExcluindo(null)}>
          <p className="mb-4 text-sm leading-relaxed text-texto-fraco">
            Excluir <strong className="text-texto">{excluindo.emoji} {excluindo.nome}</strong> apaga
            também <strong className="text-texto">todo o histórico</strong> desse hábito. Se você só
            quer tirá-lo da tela principal, prefira arquivar.
          </p>
          <div className="flex flex-col gap-2">
            <button
              onClick={() => {
                definirAtivo(excluindo.id, false);
                setExcluindo(null);
              }}
              className={estiloBotaoPrimario}
            >
              📦 Arquivar (mantém o histórico)
            </button>
            <button
              onClick={() => {
                excluirHabito(excluindo.id);
                setExcluindo(null);
              }}
              className="min-h-11 w-full rounded-xl border border-red-400/50 bg-red-400/10 px-4 py-3 font-bold text-red-300 active:scale-[0.98]"
            >
              Excluir definitivamente
            </button>
            <button onClick={() => setExcluindo(null)} className={estiloBotaoSecundario}>
              Cancelar
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
