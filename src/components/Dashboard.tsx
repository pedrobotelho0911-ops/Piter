import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { FinanceData, StatusFinanceiro } from "../types";
import { CATEGORIAS_DESPESA } from "../types";
import { formatCurrency, monthLabel, type FinanceTotals } from "../utils/finance";
import { OceanIllustration } from "./OceanIllustration";
import { StatusBadge } from "./StatusBadge";

const CATEGORY_COLORS: Record<string, string> = {
  moradia: "#6366f1",
  alimentacao: "#f97316",
  transporte: "#0ea5e9",
  lazer: "#ec4899",
  dividas: "#ef4444",
  outros: "#94a3b8",
};

interface DashboardProps {
  data: FinanceData;
  totals: FinanceTotals;
  score: number;
  status: StatusFinanceiro;
}

export function Dashboard({ data, totals, score, status }: DashboardProps) {
  const despesasPorCategoria = CATEGORIAS_DESPESA.map(({ valor, label }) => ({
    categoria: valor,
    label,
    total: data.despesas
      .filter((d) => d.categoria === valor)
      .reduce((acc, d) => acc + d.valor, 0),
  })).filter((c) => c.total > 0);

  const historico = data.historico.map((h) => ({
    mes: monthLabel(h.mes),
    saldo: Math.round(h.saldo * 100) / 100,
  }));

  const comparativo = [
    { nome: "Entrou", valor: totals.totalReceitas, cor: "#22c55e" },
    { nome: "Saiu", valor: totals.totalDespesas, cor: "#ef4444" },
  ];

  return (
    <div className="dashboard">
      <div className="ocean-card">
        <OceanIllustration score={score} status={status} />
      </div>

      <StatusBadge status={status} score={score} />

      <div className="cards-grid">
        <div className="card">
          <span className="card-label">Saldo líquido</span>
          <span
            className={`card-value ${totals.saldoLiquido < 0 ? "negativo" : "positivo"}`}
          >
            {formatCurrency(totals.saldoLiquido)}
          </span>
          <span className="card-hint">Receitas − despesas − dívidas</span>
        </div>
        <div className="card">
          <span className="card-label">Patrimônio</span>
          <span className={totals.patrimonioLiquido < 0 ? "card-value negativo" : "card-value positivo"}>
            {formatCurrency(totals.patrimonioLiquido)}
          </span>
          <span className="card-hint">Contas + investimentos − dívidas</span>
        </div>
      </div>

      <section className="panel">
        <h2>Quanto entrou vs quanto saiu</h2>
        {totals.totalReceitas === 0 && totals.totalDespesas === 0 ? (
          <p className="empty-hint">Cadastre receitas e despesas para ver o comparativo.</p>
        ) : (
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={comparativo} layout="vertical" margin={{ left: 8, right: 24 }}>
              <XAxis type="number" hide />
              <YAxis type="category" dataKey="nome" width={60} tickLine={false} axisLine={false} />
              <Tooltip formatter={(value) => formatCurrency(Number(value))} />
              <Bar dataKey="valor" radius={[0, 6, 6, 0]} barSize={28}>
                {comparativo.map((entry) => (
                  <Cell key={entry.nome} fill={entry.cor} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </section>

      <section className="panel">
        <h2>Despesas por categoria</h2>
        {despesasPorCategoria.length === 0 ? (
          <p className="empty-hint">Cadastre despesas para ver a distribuição.</p>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={despesasPorCategoria}
                dataKey="total"
                nameKey="label"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={2}
              >
                {despesasPorCategoria.map((entry) => (
                  <Cell key={entry.categoria} fill={CATEGORY_COLORS[entry.categoria]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => formatCurrency(Number(value))} />
            </PieChart>
          </ResponsiveContainer>
        )}
        <ul className="legend">
          {despesasPorCategoria.map((c) => (
            <li key={c.categoria}>
              <span className="legend-dot" style={{ background: CATEGORY_COLORS[c.categoria] }} />
              {c.label} · {formatCurrency(c.total)}
            </li>
          ))}
        </ul>
      </section>

      <section className="panel">
        <h2>Evolução do saldo</h2>
        {historico.length < 2 ? (
          <p className="empty-hint">
            Continue usando o app para acompanhar a evolução mês a mês.
          </p>
        ) : (
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={historico} margin={{ left: -16, right: 12 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="mes" tickLine={false} />
              <YAxis tickLine={false} width={64} tickFormatter={(v) => formatCurrency(v)} />
              <Tooltip formatter={(value) => formatCurrency(Number(value))} />
              <Line type="monotone" dataKey="saldo" stroke="#6366f1" strokeWidth={2.5} dot />
            </LineChart>
          </ResponsiveContainer>
        )}
      </section>
    </div>
  );
}
