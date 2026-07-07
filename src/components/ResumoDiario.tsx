import { useMemo } from "react";
import { useApp } from "../store/AppContext";
import { formatarCurto, hojeISO, ultimosDias } from "../lib/datas";
import { concluidoEm, habitosAtivosOrdenados, percentualDoDia } from "../lib/registros";
import { Sparkline } from "./Sparkline";
import { SeletorNota } from "./SeletorNota";
import { BarraProgresso } from "./BarraProgresso";

const ICONES_HUMOR = ["😖", "🙁", "😐", "🙂", "😄"];
const ICONES_MOTIVACAO = ["🪫", "🥱", "😌", "💪", "🔥"];

export function ResumoDiario() {
  const { habitos, registros, geral, definirAvaliacao, definirObservacao } = useApp();
  const hoje = hojeISO();
  const ativos = useMemo(() => habitosAtivosOrdenados(habitos), [habitos]);

  const feitos = ativos.filter((h) => concluidoEm(registros, hoje, h.id)).length;
  const total = ativos.length;
  const percentual = total > 0 ? Math.round((feitos / total) * 100) : 0;

  const pontos = useMemo(
    () =>
      ultimosDias(14).map((iso) => ({
        rotulo: formatarCurto(iso),
        valor: percentualDoDia(registros, iso, ativos),
      })),
    [registros, ativos],
  );

  const registroHoje = registros[hoje];

  if (total === 0) return null;

  return (
    <section className="mx-4 mt-6 flex flex-col gap-4">
      <div className="rounded-3xl border border-borda bg-superficie p-5">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-texto-fraco">
              Resumo de hoje
            </h2>
            <p className="mt-1 text-4xl font-extrabold text-verde">{percentual}%</p>
            <p className="mt-1 text-sm text-texto-fraco">
              {feitos} {feitos === 1 ? "concluído" : "concluídos"}, {total - feitos} não{" "}
              {total - feitos === 1 ? "concluído" : "concluídos"}
            </p>
          </div>
          <p className="text-3xl">{percentual === 100 ? "🏆" : percentual >= 50 ? "🔥" : "🌱"}</p>
        </div>
        <div className="mt-3">
          <BarraProgresso fracao={total > 0 ? feitos / total : 0} />
        </div>
      </div>

      <div className="rounded-3xl border border-borda bg-superficie p-5">
        <h2 className="mb-2 text-sm font-bold uppercase tracking-wider text-texto-fraco">
          Últimos 14 dias
        </h2>
        <Sparkline pontos={pontos} />
      </div>

      {(geral.humor.ativo || geral.motivacao.ativo) && (
        <div className="flex flex-col gap-5 rounded-3xl border border-borda bg-superficie p-5">
          {geral.humor.ativo && (
            <SeletorNota
              rotulo={geral.humor.nome}
              icones={ICONES_HUMOR}
              valor={registroHoje?.humor}
              onMudar={(nota) => definirAvaliacao(hoje, "humor", nota)}
            />
          )}
          {geral.motivacao.ativo && (
            <SeletorNota
              rotulo={geral.motivacao.nome}
              icones={ICONES_MOTIVACAO}
              valor={registroHoje?.motivacao}
              onMudar={(nota) => definirAvaliacao(hoje, "motivacao", nota)}
            />
          )}
        </div>
      )}

      <div className="rounded-3xl border border-borda bg-superficie p-5">
        <label className="flex flex-col gap-2">
          <span className="text-sm font-bold uppercase tracking-wider text-texto-fraco">
            Observação do dia
          </span>
          <textarea
            value={registroHoje?.observacao ?? ""}
            onChange={(e) => definirObservacao(hoje, e.target.value)}
            placeholder="Como foi o dia? (opcional)"
            rows={2}
            className="w-full resize-none rounded-xl border border-borda bg-fundo px-4 py-3 text-texto placeholder:text-texto-fraco/60 focus:border-ciano focus:outline-none"
          />
        </label>
      </div>
    </section>
  );
}
