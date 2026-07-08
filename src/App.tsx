import { useState } from "react";
import { useFinanceData } from "./hooks/useFinanceData";
import { useLembreteVencimento } from "./hooks/useLembreteVencimento";
import { useBackup } from "./hooks/useBackup";
import { Dashboard } from "./components/Dashboard";
import { CadastroScreen } from "./components/CadastroScreen";
import { ReminderModal } from "./components/ReminderModal";
import { AjustesScreen } from "./components/AjustesScreen";

type Aba = "dashboard" | "cadastro" | "ajustes";

export function App() {
  const [aba, setAba] = useState<Aba>("dashboard");
  const finance = useFinanceData();
  const lembrete = useLembreteVencimento(finance.data.despesas);
  const backup = useBackup(finance.data, finance.substituirDados);

  return (
    <div className="app-shell">
      {lembrete.mostrarLembrete && (
        <ReminderModal
          despesas={lembrete.despesasVencendoHoje}
          onClose={lembrete.dispensar}
          onTogglePaga={finance.toggleDespesaPaga}
        />
      )}

      <header className="app-header">
        <h1>Piter Finanças</h1>
      </header>

      <main className="app-content">
        {aba === "dashboard" && (
          <Dashboard
            data={finance.data}
            totals={finance.totals}
            score={finance.score}
            status={finance.status}
          />
        )}
        {aba === "cadastro" && <CadastroScreen {...finance} />}
        {aba === "ajustes" && <AjustesScreen backup={backup} />}
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
        <button
          className={aba === "ajustes" ? "active" : ""}
          onClick={() => setAba("ajustes")}
        >
          <span className="nav-icon">⚙️</span>
          Ajustes
        </button>
      </nav>
    </div>
  );
}
