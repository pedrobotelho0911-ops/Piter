import { useEffect, useState } from "react";
import type { Despesa } from "../types";

const STORAGE_KEY = "piter-financas:lembrete-visto-em";

function hojeKey(): string {
  const hoje = new Date();
  return `${hoje.getFullYear()}-${hoje.getMonth() + 1}-${hoje.getDate()}`;
}

export function useLembreteVencimento(despesas: Despesa[]) {
  const [visivel, setVisivel] = useState(false);

  useEffect(() => {
    const diaHoje = new Date().getDate();
    const vencendoHoje = despesas.some((d) => d.diaVencimento === diaHoje);
    const jaVisto = localStorage.getItem(STORAGE_KEY) === hojeKey();
    if (vencendoHoje && !jaVisto) {
      setVisivel(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const diaHoje = new Date().getDate();
  const despesasVencendoHoje = despesas.filter((d) => d.diaVencimento === diaHoje);

  function dispensar() {
    localStorage.setItem(STORAGE_KEY, hojeKey());
    setVisivel(false);
  }

  return {
    mostrarLembrete: visivel && despesasVencendoHoje.length > 0,
    despesasVencendoHoje,
    dispensar,
  };
}
