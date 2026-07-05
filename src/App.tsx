import { useState } from "react";
import { useFinanceData } from "./hooks/useFinanceData";
import { Dashboard } from "./components/Dashboard";
import { CadastroScreen } from "./components/CadastroScreen";

type Aba = "dashboard" | "cadastro";

export function App() {
  const [aba, setAba] = useState<Aba>("dashboard");
  const finance = useFinanceData();

  return (
    <div className="app-shell">
      <header className="app-header">
        <h1>Piter Finanças</h1>
      </header>

      <main className="app-content">
        {aba === "dashboard" ? (
          <Dashboard
            data={finance.data}
            totals={finance.totals}
            score={finance.score}
            status={finance.status}
          />
        ) : (
          <CadastroScreen {...finance} />
        )}
      </main>

      <nav className="bottom-nav">
        <button
          className={aba === "dashboard" ? "active" : ""}
          onClick={() => setAba("dashboard")}
        >
          <span className="nav-icon">🏠</span>
          Painel
        </button>
        <button
          className={aba === "cadastro" ? "active" : ""}
          onClick={() => setAba("cadastro")}
        >
          <span className="nav-icon">➕</span>
          Cadastrar
        </button>
      </nav>
    </div>
  );
}
