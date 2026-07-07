import { useState } from "react";
import type { Habito, TipoCampoExtra } from "../types";
import { useApp } from "../store/AppContext";
import { Modal, estiloBotaoPrimario, estiloCampo } from "./Modal";
import { SeletorEmoji } from "./SeletorEmoji";

export const META_MENSAL_PADRAO = 20;

const CORES_DESTAQUE = ["#4ade80", "#22d3ee", "#a78bfa", "#f472b6", "#fb923c", "#facc15", "#4c7dff"];

const NOMES_TIPOS: Record<TipoCampoExtra, string> = {
  barra_numerica: "Barra numérica",
  nota_1_a_5: "Nota de 1 a 5",
  texto_curto: "Texto curto",
};

interface Props {
  habito?: Habito; // ausente = criação rápida
  onFechar: () => void;
}

export function FormularioHabito({ habito, onFechar }: Props) {
  const { criarHabito, editarHabito, adicionarCampoExtra, removerCampoExtra } = useApp();
  const [nome, setNome] = useState(habito?.nome ?? "");
  const [emoji, setEmoji] = useState(habito?.emoji ?? "💪");
  const [meta, setMeta] = useState(String(habito?.meta_mensal ?? META_MENSAL_PADRAO));
  const [cor, setCor] = useState<string | undefined>(habito?.cor_destaque);

  // Formulário de novo campo extra (só na edição).
  const [tipoCampo, setTipoCampo] = useState<TipoCampoExtra>("barra_numerica");
  const [nomeCampo, setNomeCampo] = useState("");
  const [unidadeCampo, setUnidadeCampo] = useState("");

  const metaNumero = Math.max(1, Math.min(31, Math.round(Number(meta) || META_MENSAL_PADRAO)));
  const podeSalvar = nome.trim().length > 0 && emoji.trim().length > 0;

  function salvar() {
    if (!podeSalvar) return;
    if (habito) {
      editarHabito(habito.id, {
        nome: nome.trim(),
        emoji: emoji.trim(),
        meta_mensal: metaNumero,
        cor_destaque: cor,
      });
    } else {
      criarHabito(nome, emoji.trim(), metaNumero);
    }
    onFechar();
  }

  function adicionarCampo() {
    if (!habito || nomeCampo.trim().length === 0) return;
    adicionarCampoExtra(habito.id, {
      tipo: tipoCampo,
      nome: nomeCampo.trim(),
      unidade: tipoCampo === "barra_numerica" && unidadeCampo.trim() ? unidadeCampo.trim() : undefined,
    });
    setNomeCampo("");
    setUnidadeCampo("");
  }

  return (
    <Modal titulo={habito ? "Editar hábito" : "Novo hábito"} onFechar={onFechar}>
      <div className="flex flex-col gap-4">
        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-semibold text-texto-fraco">Nome</span>
          <input
            autoFocus={!habito}
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            placeholder="Ex: Ler 10 páginas"
            className={estiloCampo}
          />
        </label>

        <div className="flex flex-col gap-1.5">
          <span className="text-sm font-semibold text-texto-fraco">Emoji</span>
          <SeletorEmoji valor={emoji} onMudar={setEmoji} />
        </div>

        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-semibold text-texto-fraco">Meta mensal (dias)</span>
          <input
            type="number"
            inputMode="numeric"
            min={1}
            max={31}
            value={meta}
            onChange={(e) => setMeta(e.target.value)}
            className={estiloCampo}
          />
        </label>

        {habito && (
          <div className="flex flex-col gap-1.5">
            <span className="text-sm font-semibold text-texto-fraco">Cor de destaque</span>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setCor(undefined)}
                className={`flex h-11 items-center rounded-xl border px-3 text-xs font-semibold ${
                  cor === undefined ? "border-ciano text-ciano" : "border-borda text-texto-fraco"
                }`}
              >
                Padrão
              </button>
              {CORES_DESTAQUE.map((opcao) => (
                <button
                  key={opcao}
                  type="button"
                  onClick={() => setCor(opcao)}
                  aria-label={`Cor ${opcao}`}
                  className={`h-11 w-11 rounded-xl border-2 ${
                    cor === opcao ? "border-white" : "border-transparent"
                  }`}
                  style={{ backgroundColor: opcao }}
                />
              ))}
            </div>
          </div>
        )}

        {habito && (
          <div className="rounded-2xl border border-borda bg-fundo p-4">
            <p className="mb-3 text-sm font-bold text-texto">Campos extras</p>
            {habito.campos_extras.length === 0 && (
              <p className="mb-3 text-sm text-texto-fraco">
                Nenhum campo extra ainda. Sirva pra anotar, por dia, coisas como "páginas lidas" ou
                "energia do treino".
              </p>
            )}
            {habito.campos_extras.map((campo) => (
              <div
                key={campo.id}
                className="mb-2 flex items-center justify-between gap-2 rounded-xl bg-card px-3 py-2"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">{campo.nome}</p>
                  <p className="text-xs text-texto-fraco">
                    {NOMES_TIPOS[campo.tipo]}
                    {campo.unidade ? ` · ${campo.unidade}` : ""}
                  </p>
                </div>
                <button
                  onClick={() => removerCampoExtra(habito.id, campo.id)}
                  aria-label={`Remover campo ${campo.nome}`}
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-texto-fraco active:bg-fundo"
                >
                  🗑️
                </button>
              </div>
            ))}

            <div className="mt-3 flex flex-col gap-2">
              <select
                value={tipoCampo}
                onChange={(e) => setTipoCampo(e.target.value as TipoCampoExtra)}
                className={estiloCampo}
                aria-label="Tipo do campo extra"
              >
                {(Object.keys(NOMES_TIPOS) as TipoCampoExtra[]).map((tipo) => (
                  <option key={tipo} value={tipo}>
                    {NOMES_TIPOS[tipo]}
                  </option>
                ))}
              </select>
              <input
                value={nomeCampo}
                onChange={(e) => setNomeCampo(e.target.value)}
                placeholder="Nome do campo (ex: Páginas lidas)"
                className={estiloCampo}
              />
              {tipoCampo === "barra_numerica" && (
                <input
                  value={unidadeCampo}
                  onChange={(e) => setUnidadeCampo(e.target.value)}
                  placeholder="Unidade (ex: páginas, km) — opcional"
                  className={estiloCampo}
                />
              )}
              <button
                onClick={adicionarCampo}
                disabled={nomeCampo.trim().length === 0}
                className="min-h-11 rounded-xl border border-roxo/60 px-4 py-2 font-semibold text-roxo active:scale-[0.98] disabled:opacity-40"
              >
                + Adicionar campo
              </button>
            </div>
          </div>
        )}

        <button onClick={salvar} disabled={!podeSalvar} className={estiloBotaoPrimario}>
          {habito ? "Salvar alterações" : "Criar hábito"}
        </button>
      </div>
    </Modal>
  );
}
