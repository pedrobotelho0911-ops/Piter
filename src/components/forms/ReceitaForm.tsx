import { useState, type FormEvent } from "react";
import type { Receita } from "../../types";
import { formatCurrency } from "../../utils/finance";

interface Props {
  itens: Receita[];
  onAdd: (receita: Omit<Receita, "id">) => void;
  onUpdate: (receita: Receita) => void;
  onRemove: (id: string) => void;
}

export function ReceitaForm({ itens, onAdd, onUpdate, onRemove }: Props) {
  const [editId, setEditId] = useState<string | null>(null);
  const [descricao, setDescricao] = useState("");
  const [valor, setValor] = useState("");

  function limpar() {
    setEditId(null);
    setDescricao("");
    setValor("");
  }

  function editar(receita: Receita) {
    setEditId(receita.id);
    setDescricao(receita.descricao);
    setValor(String(receita.valor));
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const valorNum = Number(valor.replace(",", "."));
    if (!descricao.trim() || Number.isNaN(valorNum)) return;
    if (editId) {
      onUpdate({ id: editId, descricao: descricao.trim(), valor: valorNum });
    } else {
      onAdd({ descricao: descricao.trim(), valor: valorNum });
    }
    limpar();
  }

  return (
    <div className="form-block">
      <p className="form-intro">Salário, freelas, entregas, bicos — tudo que entra por mês.</p>
      <form onSubmit={handleSubmit} className="stack-form">
        <label>
          Descrição
          <input
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
            placeholder="Ex: Salário"
            required
          />
        </label>
        <label>
          Valor mensal
          <input
            value={valor}
            onChange={(e) => setValor(e.target.value)}
            placeholder="0,00"
            inputMode="decimal"
            required
          />
        </label>
        <div className="form-actions">
          <button type="submit" className="btn-primary">
            {editId ? "Salvar alterações" : "Adicionar receita"}
          </button>
          {editId && (
            <button type="button" className="btn-ghost" onClick={limpar}>
              Cancelar
            </button>
          )}
        </div>
      </form>

      <ul className="item-list">
        {itens.map((receita) => (
          <li key={receita.id}>
            <div>
              <strong>{receita.descricao}</strong>
              <span>{formatCurrency(receita.valor)}</span>
            </div>
            <div className="item-actions">
              <button type="button" onClick={() => editar(receita)} aria-label="Editar">
                ✎
              </button>
              <button type="button" onClick={() => onRemove(receita.id)} aria-label="Remover">
                ✕
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
