import { useState } from "react";
import { useFinanceData } from "./hooks/useFinanceData";
import { useLembreteVencimento } from "./hooks/useLembreteVencimento";
import { Dashboard } from "./components/Dashboard";
import { CadastroScreen } from "./components/CadastroScreen";
import { ReminderModal } from "./components/ReminderModal";

type Aba = "dashboard" | "cadastro";

export function App() {
  const [aba, setAba] = useState<Aba>("dashboard");
  const finance = useFinanceData();
  const lembrete = useLembreteVencimento(finance.data.despesas);

  return (
    <div className="app-shell">
      {lembrete.mostrarLembrete && (
        <ReminderModal despesas={lembrete.despesasVencendoHoje} onClose={lembrete.dispensar} />
      )}

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
