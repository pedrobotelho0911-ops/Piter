import { useState, type FormEvent } from "react";
import type { Investimento } from "../../types";
import { formatCurrency } from "../../utils/finance";

interface Props {
  itens: Investimento[];
  onAdd: (investimento: Omit<Investimento, "id">) => void;
  onUpdate: (investimento: Investimento) => void;
  onRemove: (id: string) => void;
}

export function InvestimentoForm({ itens, onAdd, onUpdate, onRemove }: Props) {
  const [editId, setEditId] = useState<string | null>(null);
  const [descricao, setDescricao] = useState("");
  const [valor, setValor] = useState("");
  const [tipo, setTipo] = useState("");

  function limpar() {
    setEditId(null);
    setDescricao("");
    setValor("");
    setTipo("");
  }

  function editar(investimento: Investimento) {
    setEditId(investimento.id);
    setDescricao(investimento.descricao);
    setValor(String(investimento.valor));
    setTipo(investimento.tipo ?? "");
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const valorNum = Number(valor.replace(",", "."));
    if (!descricao.trim() || Number.isNaN(valorNum)) return;
    const payload = { descricao: descricao.trim(), valor: valorNum, tipo: tipo.trim() || undefined };
    if (editId) {
      onUpdate({ id: editId, ...payload });
    } else {
      onAdd(payload);
    }
    limpar();
  }

  return (
    <div className="form-block">
      <p className="form-intro">Reserva de emergência, investimentos, poupança guardada.</p>
      <form onSubmit={handleSubmit} className="stack-form">
        <label>
          Descrição
          <input
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
            placeholder="Ex: Reserva de emergência"
            required
          />
        </label>
        <label>
          Valor
          <input
            value={valor}
            onChange={(e) => setValor(e.target.value)}
            placeholder="0,00"
            inputMode="decimal"
            required
          />
        </label>
        <label>
          Tipo (opcional)
          <input value={tipo} onChange={(e) => setTipo(e.target.value)} placeholder="Ex: Tesouro Selic" />
        </label>
        <div className="form-actions">
          <button type="submit" className="btn-primary">
            {editId ? "Salvar alterações" : "Adicionar investimento"}
          </button>
          {editId && (
            <button type="button" className="btn-ghost" onClick={limpar}>
              Cancelar
            </button>
          )}
        </div>
      </form>

      <ul className="item-list">
        {itens.map((investimento) => (
          <li key={investimento.id}>
            <div>
              <strong>{investimento.descricao}</strong>
              <span>
                {investimento.tipo ? `${investimento.tipo} · ` : ""}
                {formatCurrency(investimento.valor)}
              </span>
            </div>
            <div className="item-actions">
              <button type="button" onClick={() => editar(investimento)} aria-label="Editar">
                ✎
              </button>
              <button type="button" onClick={() => onRemove(investimento.id)} aria-label="Remover">
                ✕
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
