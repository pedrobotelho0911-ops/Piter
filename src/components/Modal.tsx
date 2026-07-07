import type { ReactNode } from "react";

interface Props {
  titulo: string;
  onFechar: () => void;
  children: ReactNode;
}

/** Modal em folha (mobile) ou centralizado (telas maiores). */
export function Modal({ titulo, onFechar, children }: Props) {
  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center sm:items-center">
      <button
        aria-label="Fechar"
        className="absolute inset-0 bg-black/60"
        onClick={onFechar}
      />
      <div className="relative max-h-[85dvh] w-full overflow-y-auto rounded-t-3xl border border-borda bg-superficie p-5 pb-8 sm:max-w-md sm:rounded-3xl sm:pb-5">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-lg font-bold text-ciano">{titulo}</h2>
          <button
            onClick={onFechar}
            aria-label="Fechar"
            className="flex h-11 w-11 items-center justify-center rounded-xl text-texto-fraco hover:bg-card"
          >
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export const estiloCampo =
  "w-full rounded-xl border border-borda bg-fundo px-4 py-3 text-texto placeholder:text-texto-fraco/60 focus:border-ciano focus:outline-none";

export const estiloBotaoPrimario =
  "min-h-11 w-full rounded-xl bg-azul px-4 py-3 font-bold text-white active:scale-[0.98] disabled:opacity-40";

export const estiloBotaoSecundario =
  "min-h-11 w-full rounded-xl border border-borda bg-card px-4 py-3 font-semibold text-texto active:scale-[0.98] disabled:opacity-40";
