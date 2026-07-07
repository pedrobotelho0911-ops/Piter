import { useState } from "react";

export interface PontoSparkline {
  rotulo: string; // ex: "23/06"
  valor: number; // 0 a 100
}

const LARGURA = 300;
const ALTURA = 72;
const MARGEM = 6;

/**
 * Gráfico de linha simples (implementação própria, sem biblioteca) da % de
 * conclusão. Arrastar o dedo sobre ele mostra o dia e o valor exato.
 */
export function Sparkline({ pontos }: { pontos: PontoSparkline[] }) {
  const [ativo, setAtivo] = useState<number | null>(null);

  if (pontos.length < 2) {
    return <p className="text-sm text-texto-fraco">Marque hábitos por alguns dias pra ver o gráfico.</p>;
  }

  const x = (i: number) => MARGEM + (i / (pontos.length - 1)) * (LARGURA - 2 * MARGEM);
  const y = (v: number) => ALTURA - MARGEM - (v / 100) * (ALTURA - 2 * MARGEM);
  const caminho = pontos.map((p, i) => `${i === 0 ? "M" : "L"}${x(i)},${y(p.valor)}`).join(" ");
  const area = `${caminho} L${x(pontos.length - 1)},${ALTURA - MARGEM} L${x(0)},${ALTURA - MARGEM} Z`;

  function aoMover(evento: React.PointerEvent<SVGSVGElement>) {
    const caixa = evento.currentTarget.getBoundingClientRect();
    const fracao = (evento.clientX - caixa.left) / caixa.width;
    const indice = Math.round(fracao * (pontos.length - 1));
    setAtivo(Math.max(0, Math.min(pontos.length - 1, indice)));
  }

  const ponto = ativo !== null ? pontos[ativo] : null;

  return (
    <div className="relative">
      <div className="mb-1 h-5 text-xs font-semibold text-ciano">
        {ponto ? `${ponto.rotulo} · ${ponto.valor}%` : ""}
      </div>
      <svg
        viewBox={`0 0 ${LARGURA} ${ALTURA}`}
        className="w-full touch-none select-none"
        role="img"
        aria-label={`Conclusão dos últimos ${pontos.length} dias, de ${pontos[0].rotulo} a ${pontos[pontos.length - 1].rotulo}`}
        onPointerMove={aoMover}
        onPointerDown={aoMover}
        onPointerLeave={() => setAtivo(null)}
      >
        <defs>
          <linearGradient id="area-sparkline" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--color-ciano)" stopOpacity="0.3" />
            <stop offset="100%" stopColor="var(--color-ciano)" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={area} fill="url(#area-sparkline)" />
        <path
          d={caminho}
          fill="none"
          stroke="var(--color-ciano)"
          strokeWidth="2"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        {ativo !== null && (
          <line
            x1={x(ativo)}
            x2={x(ativo)}
            y1={MARGEM}
            y2={ALTURA - MARGEM}
            stroke="var(--color-borda)"
            strokeWidth="1"
          />
        )}
        <circle
          cx={x(ativo ?? pontos.length - 1)}
          cy={y(pontos[ativo ?? pontos.length - 1].valor)}
          r="4"
          fill="var(--color-ciano)"
          stroke="var(--color-superficie)"
          strokeWidth="2"
        />
      </svg>
    </div>
  );
}
