interface Props {
  rotulo: string;
  icones: string[]; // 5 emojis, do pior pro melhor
  valor: number | undefined; // 1 a 5
  onMudar: (valor: number | undefined) => void;
}

/** Seletor visual de 1 a 5 (tocar de novo na nota atual limpa a escolha). */
export function SeletorNota({ rotulo, icones, valor, onMudar }: Props) {
  return (
    <div>
      <p className="mb-2 text-sm font-semibold text-texto-fraco">{rotulo}</p>
      <div className="flex gap-2">
        {icones.map((icone, i) => {
          const nota = i + 1;
          const selecionado = valor === nota;
          return (
            <button
              key={nota}
              onClick={() => onMudar(selecionado ? undefined : nota)}
              aria-label={`${rotulo}: nota ${nota} de 5`}
              aria-pressed={selecionado}
              className={`flex h-11 w-11 items-center justify-center rounded-xl border text-xl transition-transform ${
                selecionado
                  ? "scale-110 border-ciano bg-card"
                  : "border-borda bg-fundo opacity-60 active:scale-95"
              }`}
            >
              {icone}
            </button>
          );
        })}
      </div>
    </div>
  );
}
