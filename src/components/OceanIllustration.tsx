import { useEffect, useMemo, useRef } from "react";
import { STATUS_META } from "../utils/finance";
import type { StatusFinanceiro } from "../types";

interface OceanIllustrationProps {
  score: number; // 0-100
  status: StatusFinanceiro;
}

const WIDTH = 320;
const HEIGHT = 220;
const SEGMENTS = 8;
const BONECO_X = WIDTH / 2;
const HEAD_TOP_Y = 74;
const HEAD_R = 12;

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

function lerpHsl(stops: [number, [number, number, number]][], t: number): string {
  for (let i = 0; i < stops.length - 1; i++) {
    const [p0, c0] = stops[i];
    const [p1, c1] = stops[i + 1];
    if (t >= p0 && t <= p1) {
      const localT = (t - p0) / (p1 - p0 || 1);
      const h = lerp(c0[0], c1[0], localT);
      const s = lerp(c0[1], c1[1], localT);
      const l = lerp(c0[2], c1[2], localT);
      return `hsl(${h.toFixed(0)}, ${s.toFixed(0)}%, ${l.toFixed(0)}%)`;
    }
  }
  const [, last] = stops[stops.length - 1];
  return `hsl(${last[0]}, ${last[1]}%, ${last[2]}%)`;
}

const WATER_STOPS: [number, [number, number, number]][] = [
  [0, [5, 55, 28]],
  [0.5, [42, 70, 42]],
  [1, [178, 55, 52]],
];

// Hues escolhidos para crescer sem cruzar o ponto de wraparound (0/360deg);
// hue negativo é equivalente a (360 + hue) e mantém a interpolação linear correta.
const SKY_TOP_STOPS: [number, [number, number, number]][] = [
  [0, [-5, 45, 16]],
  [0.5, [35, 55, 55]],
  [1, [200, 70, 82]],
];

const SKY_BOTTOM_STOPS: [number, [number, number, number]][] = [
  [0, [-20, 35, 30]],
  [0.5, [40, 60, 75]],
  [1, [195, 60, 94]],
];

function buildPaths(points: [number, number][]) {
  let line = `M ${points[0][0].toFixed(1)} ${points[0][1].toFixed(1)}`;
  for (let i = 1; i < points.length - 1; i++) {
    const [cx, cy] = points[i];
    const [nx, ny] = points[i + 1];
    const mx = (cx + nx) / 2;
    const my = (cy + ny) / 2;
    line += ` Q ${cx.toFixed(1)} ${cy.toFixed(1)} ${mx.toFixed(1)} ${my.toFixed(1)}`;
  }
  const last = points[points.length - 1];
  line += ` L ${last[0].toFixed(1)} ${last[1].toFixed(1)}`;
  const fill = `${line} L ${WIDTH} ${HEIGHT} L 0 ${HEIGHT} Z`;
  return { line, fill };
}

export function OceanIllustration({ score, status }: OceanIllustrationProps) {
  const wavePathRef = useRef<SVGPathElement>(null);
  const foamPathRef = useRef<SVGPathElement>(null);
  const bonecoGroupRef = useRef<SVGGElement>(null);
  const scoreRef = useRef(score);
  scoreRef.current = score;

  useEffect(() => {
    let raf = 0;
    const start = performance.now();

    const tick = (now: number) => {
      const t = (now - start) / 1000;
      const s = clamp01(scoreRef.current / 100);

      const baseline = lerp(58, 198, s);
      const amplitude = lerp(20, 5, s);
      const speed = lerp(2.0, 0.7, s);

      const points: [number, number][] = [];
      for (let i = 0; i <= SEGMENTS; i++) {
        const x = (WIDTH * i) / SEGMENTS;
        const y =
          baseline -
          amplitude * Math.sin(t * speed + i * 0.9) -
          amplitude * 0.3 * Math.sin(t * speed * 2.3 + i * 1.7);
        points.push([x, y]);
      }

      const { line, fill } = buildPaths(points);
      wavePathRef.current?.setAttribute("d", fill);
      foamPathRef.current?.setAttribute("d", line);

      const bob = Math.sin(t * speed * 1.3) * 2.2;
      bonecoGroupRef.current?.setAttribute("transform", `translate(0, ${bob.toFixed(2)})`);

      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  const s = clamp01(score / 100);
  const waterColor = useMemo(() => lerpHsl(WATER_STOPS, s), [s]);
  const skyTop = useMemo(() => lerpHsl(SKY_TOP_STOPS, s), [s]);
  const skyBottom = useMemo(() => lerpHsl(SKY_BOTTOM_STOPS, s), [s]);
  const waterOpacity = lerp(0.93, 0.8, s);
  const beachOpacity = clamp01((score - 78) / 22);
  const andando = score >= 85;
  const meta = STATUS_META[status];

  return (
    <div className="ocean-illustration" role="img" aria-label={`Ilustração: ${meta.descricao}`}>
      <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} width="100%" height="100%">
        <defs>
          <linearGradient id="sky-gradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={skyTop} />
            <stop offset="100%" stopColor={skyBottom} />
          </linearGradient>
        </defs>

        <rect x={0} y={0} width={WIDTH} height={HEIGHT} fill="url(#sky-gradient)" />

        {/* sol / lua: mais alto e brilhante quanto melhor o score */}
        <circle
          cx={WIDTH - 46}
          cy={lerp(48, 30, s)}
          r={lerp(12, 16, s)}
          fill={s > 0.5 ? "#fff7d6" : "#e2e8f0"}
          opacity={lerp(0.55, 0.95, s)}
        />

        {/* nuvens de tempestade, somem conforme o score sobe */}
        <g opacity={clamp01(1 - s * 1.3)} fill="#1f2937">
          <ellipse cx={70} cy={38} rx={34} ry={12} />
          <ellipse cx={110} cy={30} rx={26} ry={10} />
          <ellipse cx={200} cy={50} rx={30} ry={11} />
        </g>

        {/* boneco: cabeça (74-98), tronco (98-145), braços (~105-130), pernas (145-180) */}
        <g ref={bonecoGroupRef}>
          <g transform={`translate(${BONECO_X}, 0)`}>
            <path
              d="M 0 98 L 0 145"
              stroke="#1e293b"
              strokeWidth={8}
              strokeLinecap="round"
              fill="none"
            />
            {andando ? (
              <path
                d="M 0 105 L -18 130 M 0 105 L 18 130"
                stroke="#1e293b"
                strokeWidth={6}
                strokeLinecap="round"
                fill="none"
              />
            ) : (
              <path
                d="M 0 105 C -14 108, -22 118, -26 130 M 0 105 C 14 108, 22 118, 26 130"
                stroke="#1e293b"
                strokeWidth={6}
                strokeLinecap="round"
                fill="none"
              />
            )}
            {andando ? (
              <path
                d="M 0 145 L -14 180 M 0 145 L 16 178"
                stroke="#1e293b"
                strokeWidth={7}
                strokeLinecap="round"
                fill="none"
              />
            ) : (
              <path
                d="M 0 145 C -10 152, -18 162, -14 178 M 0 145 C 10 152, 18 162, 14 178"
                stroke="#1e293b"
                strokeWidth={7}
                strokeLinecap="round"
                fill="none"
              />
            )}
            <circle cx={0} cy={HEAD_TOP_Y + HEAD_R} r={HEAD_R} fill="#1e293b" />
          </g>
        </g>

        {/* praia, aparece só quando a situação está muito boa */}
        <path
          d={`M 0 ${HEIGHT} L 0 ${HEIGHT - 14} Q ${WIDTH / 2} ${HEIGHT - 30} ${WIDTH} ${HEIGHT - 12} L ${WIDTH} ${HEIGHT} Z`}
          fill="#e6c78b"
          opacity={beachOpacity * 0.9}
        />

        {/* água */}
        <path ref={wavePathRef} fill={waterColor} opacity={waterOpacity} />
        <path
          ref={foamPathRef}
          fill="none"
          stroke="rgba(255,255,255,0.75)"
          strokeWidth={2}
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}
