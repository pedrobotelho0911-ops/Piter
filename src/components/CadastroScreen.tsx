import { useState } from "react";
import type { useFinanceData } from "../hooks/useFinanceData";
import { ContaForm } from "./forms/ContaForm";
import { ReceitaForm } from "./forms/ReceitaForm";
import { DespesaForm } from "./forms/DespesaForm";
import { DividaForm } from "./forms/DividaForm";
import { InvestimentoForm } from "./forms/InvestimentoForm";

type Secao = "contas" | "receitas" | "despesas" | "dividas" | "investimentos";

const SECOES: { chave: Secao; label: string }[] = [
  { chave: "contas", label: "Contas" },
  { chave: "receitas", label: "Receitas" },
  { chave: "despesas", label: "Despesas" },
  { chave: "dividas", label: "Dívidas" },
  { chave: "investimentos", label: "Investimentos" },
];

type FinanceApi = ReturnType<typeof useFinanceData>;

export function CadastroScreen(props: FinanceApi) {
  const [secao, setSecao] = useState<Secao>("contas");
  const indiceAtual = SECOES.findIndex((s) => s.chave === secao);

  return (
    <div className="cadastro-screen">
      <div className="step-tabs" role="tablist">
        {SECOES.map((s, i) => (
          <button
            key={s.chave}
            role="tab"
            aria-selected={secao === s.chave}
            className={`step-tab ${secao === s.chave ? "active" : ""} ${i < indiceAtual ? "done" : ""}`}
            onClick={() => setSecao(s.chave)}
          >
            {s.label}
          </button>
        ))}
      </div>

      {secao === "contas" && (
        <ContaForm
          itens={props.data.contas}
          onAdd={props.addConta}
          onUpdate={props.updateConta}
          onRemove={props.removeConta}
        />
      )}
      {secao === "receitas" && (
        <ReceitaForm
          itens={props.data.receitas}
          onAdd={props.addReceita}
          onUpdate={props.updateReceita}
          onRemove={props.removeReceita}
        />
      )}
      {secao === "despesas" && (
        <DespesaForm
          itens={props.data.despesas}
          onAdd={props.addDespesa}
          onUpdate={props.updateDespesa}
          onRemove={props.removeDespesa}
        />
      )}
      {secao === "dividas" && (
        <DividaForm
          itens={props.data.dividas}
          onAdd={props.addDivida}
          onUpdate={props.updateDivida}
          onRemove={props.removeDivida}
        />
      )}
      {secao === "investimentos" && (
        <InvestimentoForm
          itens={props.data.investimentos}
          onAdd={props.addInvestimento}
          onUpdate={props.updateInvestimento}
          onRemove={props.removeInvestimento}
        />
      )}

      <div className="step-nav">
        <button
          type="button"
          className="btn-ghost"
          disabled={indiceAtual === 0}
          onClick={() => setSecao(SECOES[indiceAtual - 1].chave)}
        >
          ← Voltar
        </button>
        <button
          type="button"
          className="btn-primary"
          disabled={indiceAtual === SECOES.length - 1}
          onClick={() => setSecao(SECOES[indiceAtual + 1].chave)}
        >
          Próximo →
        </button>
      </div>
    </div>
  );
}
