import { useApp } from "../store/AppContext";

/**
 * Bloco de notas persistente, independente de data — diferente da observação
 * diária, o texto aqui não muda quando vira o dia (ex: treino da semana).
 */
export function NotaFixa() {
  const { notaFixa, definirNotaFixa } = useApp();

  return (
    <section className="mx-4 mt-4 rounded-3xl border border-roxo/40 bg-superficie p-5">
      <div className="mb-2 flex items-center gap-2">
        <span className="text-lg">📌</span>
        <h2 className="text-sm font-bold uppercase tracking-wider text-texto-fraco">
          Bloco de notas
        </h2>
      </div>
      <textarea
        value={notaFixa}
        onChange={(e) => definirNotaFixa(e.target.value)}
        placeholder="Anote algo que quer sempre à mão (ex: treino da semana)"
        rows={3}
        className="w-full resize-y rounded-xl border border-borda bg-fundo px-4 py-3 text-texto placeholder:text-texto-fraco/60 focus:border-ciano focus:outline-none"
      />
      <p className="mt-2 text-xs text-texto-fraco">
        Fica sempre visível aqui, independente do dia.
      </p>
    </section>
  );
}
