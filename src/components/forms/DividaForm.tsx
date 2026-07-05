import { useState, type FormEvent } from "react";
import type { Divida } from "../../types";
import { formatCurrency } from "../../utils/finance";

interface Props {
  itens: Divida[];
  onAdd: (divida: Omit<Divida, "id">) => void;
  onUpdate: (divida: Divida) => void;
  onRemove: (id: string) => void;
}

export function DividaForm({ itens, onAdd, onUpdate, onRemove }: Props) {
  const [editId, setEditId] = useState<string | null>(null);
  const [descricao, setDescricao] = useState("");
  const [valorTotal, setValorTotal] = useState("");
  const [valorPago, setValorPago] = useState("");

  function limpar() {
    setEditId(null);
    setDescricao("");
    setValorTotal("");
    setValorPago("");
  }

  function editar(divida: Divida) {
    setEditId(divida.id);
    setDescricao(divida.descricao);
    setValorTotal(String(divida.valorTotal));
    setValorPago(String(divida.valorPago));
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const total = Number(valorTotal.replace(",", "."));
    const pago = Number((valorPago || "0").replace(",", "."));
    if (!descricao.trim() || Number.isNaN(total) || Number.isNaN(pago)) return;
    if (editId) {
      onUpdate({ id: editId, descricao: descricao.trim(), valorTotal: total, valorPago: pago });
    } else {
      onAdd({ descricao: descricao.trim(), valorTotal: total, valorPago: pago });
    }
    limpar();
  }

  return (
    <div className="form-block">
      <p className="form-intro">Financiamentos, empréstimos, cartão parcelado — se não tiver, pule.</p>
      <form onSubmit={handleSubmit} className="stack-form">
        <label>
          Descrição
          <input
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
            placeholder="Ex: Financiamento do carro"
            required
          />
        </label>
        <label>
          Valor total da dívida
          <input
            value={valorTotal}
            onChange={(e) => setValorTotal(e.target.value)}
            placeholder="0,00"
            inputMode="decimal"
            required
          />
        </label>
        <label>
          Valor já pago
          <input
            value={valorPago}
            onChange={(e) => setValorPago(e.target.value)}
            placeholder="0,00"
            inputMode="decimal"
          />
        </label>
        <div className="form-actions">
          <button type="submit" className="btn-primary">
            {editId ? "Salvar alterações" : "Adicionar dívida"}
          </button>
          {editId && (
            <button type="button" className="btn-ghost" onClick={limpar}>
              Cancelar
            </button>
          )}
        </div>
      </form>

      <ul className="item-list">
        {itens.map((divida) => (
          <li key={divida.id}>
            <div>
              <strong>{divida.descricao}</strong>
              <span>
                {formatCurrency(divida.valorPago)} pago de {formatCurrency(divida.valorTotal)}
              </span>
            </div>
            <div className="item-actions">
              <button type="button" onClick={() => editar(divida)} aria-label="Editar">
                ✎
              </button>
              <button type="button" onClick={() => onRemove(divida.id)} aria-label="Remover">
                ✕
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
