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
import { formatCurrency, isDataNoMesAtual, monthLabel, type FinanceTotals } from "../utils/finance";
import { OceanIllustration } from "./OceanIllustration";
import { StatusBadge } from "./StatusBadge";

const CATEGORY_COLORS: Record<string, string> = {
  moradia: "#6366f1",
  alimentacao: "#f97316",
  transporte: "#0ea5e9",
  lazer: "#ec4899",
  trabalho: "#14b8a6",
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
  const gastosDoMes = data.gastos
    .filter((g) => isDataNoMesAtual(g.data))
    .sort((a, b) => b.data.localeCompare(a.data));

  const despesasPorCategoria = CATEGORIAS_DESPESA.map(({ valor, label }) => ({
    categoria: valor,
    label,
    total:
      data.despesas.filter((d) => d.categoria === valor).reduce((acc, d) => acc + d.valor, 0) +
      gastosDoMes.filter((g) => g.categoria === valor).reduce((acc, g) => acc + g.valor, 0),
  })).filter((c) => c.total > 0);

  const historico = data.historico.map((h) => ({
    mes: monthLabel(h.mes),
    saldo: Math.round(h.saldo * 100) / 100,
  }));

  // Usa exatamente os mesmos números do "Saldo líquido" (despesas vencidas, não todas, e sem
  // a dívida — ela é mostrada separada), pra "Entrou − Saiu" sempre bater com o saldo ali em cima.
  const totalSaida = totals.totalDespesasVencidas + totals.totalGastosMes;
  const comparativo = [
    { nome: "Entrou", valor: totals.totalReceitas, cor: "#22c55e" },
    { nome: "Saiu", valor: totalSaida, cor: "#ef4444" },
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
          <span className="card-hint">Receitas − despesas vencidas − gastos</span>
        </div>
        <div className="card">
          <span className="card-label">Em contas e investimentos</span>
          <span className={totals.totalReservas < 0 ? "card-value negativo" : "card-value positivo"}>
            {formatCurrency(totals.totalReservas)}
          </span>
          <span className="card-hint">O que você tem agora, sem a dívida</span>
        </div>
        <div className={`card ${totals.totalDividaRestante > 0 ? "card-divida" : ""}`}>
          <span className="card-label">Dívida pendente</span>
          <span
            className={totals.totalDividaRestante > 0 ? "card-value negativo" : "card-value positivo"}
          >
            {formatCurrency(totals.totalDividaRestante)}
          </span>
          <span className="card-hint">
            {totals.totalDividaRestante > 0
              ? "À parte do seu saldo do dia a dia — vá abatendo aos poucos"
              : "Nenhuma dívida em aberto"}
          </span>
        </div>
        <div className="card">
          <span className="card-label">Gastos este mês</span>
          <span className="card-value negativo">{formatCurrency(totals.totalGastosMes)}</span>
          <span className="card-hint">Soma dos gastos do dia a dia</span>
        </div>
      </div>

      <section className="panel">
        <h2>Quanto entrou vs quanto saiu</h2>
        <p className="panel-subtitle">Mesma base do saldo líquido: só despesas já vencidas</p>
        {totals.totalReceitas === 0 && totalSaida === 0 ? (
          <p className="empty-hint">Cadastre receitas, despesas e gastos para ver o comparativo.</p>
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
        <h2>Para onde vai o dinheiro</h2>
        <p className="panel-subtitle">Despesas fixas + gastos deste mês, por categoria</p>
        {despesasPorCategoria.length === 0 ? (
          <p className="empty-hint">Cadastre despesas ou gastos para ver a distribuição.</p>
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
        <h2>Gastos recentes</h2>
        {gastosDoMes.length === 0 ? (
          <p className="empty-hint">Nenhum gasto lançado este mês ainda.</p>
        ) : (
          <ul className="item-list">
            {gastosDoMes.slice(0, 8).map((g) => (
              <li key={g.id}>
                <div>
                  <strong>{g.descricao}</strong>
                  <span>{new Date(g.data + "T00:00:00").toLocaleDateString("pt-PT")}</span>
                </div>
                <strong>{formatCurrency(g.valor)}</strong>
              </li>
            ))}
          </ul>
        )}
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
