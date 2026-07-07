import { useMemo } from "react";
import { useApp } from "../store/AppContext";
import { NOMES_MESES, hojeISO } from "../lib/datas";
import { diasConcluidosNoMes, habitosAtivosOrdenados } from "../lib/registros";
import { BarraProgresso } from "../components/BarraProgresso";

export function ProgressoScreen() {
  const { habitos, registros } = useApp();
  const agora = new Date();
  const prefixoMes = hojeISO().slice(0, 7); // YYYY-MM

  const linhas = useMemo(() => {
    const ativos = habitosAtivosOrdenados(habitos);
    return ativos
      .map((habito) => {
        const feitos = diasConcluidosNoMes(registros, prefixoMes, habito.id);
        const fracao = habito.meta_mensal > 0 ? feitos / habito.meta_mensal : 0;
        return { habito, feitos, fracao, bateuMeta: feitos >= habito.meta_mensal };
      })
      .sort((a, b) => b.fracao - a.fracao);
  }, [habitos, registros, prefixoMes]);

  const progressoGeral =
    linhas.length > 0
      ? Math.round((linhas.reduce((soma, l) => soma + Math.min(1, l.fracao), 0) / linhas.length) * 100)
      : 0;

  const metasBatidas = linhas.filter((l) => l.bateuMeta).length;

  return (
    <div className="px-4 pb-6">
      <header className="sticky top-0 z-20 -mx-4 border-b border-borda bg-fundo/95 px-4 py-3 backdrop-blur">
        <h1 className="text-2xl font-extrabold tracking-wide text-ciano">Progresso</h1>
        <p className="text-xs font-semibold text-texto-fraco">
          {NOMES_MESES[agora.getMonth()]} de {agora.getFullYear()}
        </p>
      </header>

      <div className="mt-4 rounded-3xl border border-borda bg-superficie p-6 text-center">
        <p className="text-sm font-bold uppercase tracking-wider text-texto-fraco">
          Progresso geral do mês
        </p>
        <p className="mt-2 text-6xl font-extrabold text-ciano">{progressoGeral}%</p>
        <p className="mt-2 text-sm text-texto-fraco">
          média de conclusão das metas dos seus hábitos ativos
        </p>
        {metasBatidas > 0 && (
          <p className="mt-3 inline-block rounded-full border border-dourado/60 bg-dourado/10 px-4 py-1.5 text-sm font-bold text-dourado">
            🏆 {metasBatidas} {metasBatidas === 1 ? "meta batida" : "metas batidas"}
          </p>
        )}
      </div>

      {linhas.length === 0 ? (
        <p className="mt-8 text-center text-sm text-texto-fraco">
          Crie hábitos na aba Hoje pra acompanhar o progresso aqui.
        </p>
      ) : (
        <div className="mt-4 flex flex-col gap-3">
          {linhas.map(({ habito, feitos, fracao, bateuMeta }) => (
            <div
              key={habito.id}
              className={`rounded-2xl border bg-superficie p-4 ${
                bateuMeta ? "border-dourado/70 shadow-[0_0_12px_rgba(250,204,21,0.15)]" : "border-borda"
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <p className="min-w-0 truncate font-bold">
                  <span className="mr-1.5">{habito.emoji}</span>
                  {habito.nome}
                </p>
                {bateuMeta && <span className="shrink-0 text-xl">🏆</span>}
              </div>
              <p className="mt-1 text-sm text-texto-fraco">
                Meta: {habito.meta_mensal} dias · Progresso: {feitos}{" "}
                {feitos === 1 ? "dia" : "dias"} ({Math.round(fracao * 100)}%)
              </p>
              <div className="mt-2">
                <BarraProgresso
                  fracao={fracao}
                  cor={bateuMeta ? "var(--color-dourado)" : habito.cor_destaque}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
