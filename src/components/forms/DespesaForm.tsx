import { useState, type FormEvent } from "react";
import { CATEGORIAS_DESPESA, type CategoriaDespesa, type Despesa } from "../../types";
import { formatCurrency } from "../../utils/finance";

interface Props {
  itens: Despesa[];
  onAdd: (despesa: Omit<Despesa, "id">) => void;
  onUpdate: (despesa: Despesa) => void;
  onRemove: (id: string) => void;
}

export function DespesaForm({ itens, onAdd, onUpdate, onRemove }: Props) {
  const [editId, setEditId] = useState<string | null>(null);
  const [descricao, setDescricao] = useState("");
  const [categoria, setCategoria] = useState<CategoriaDespesa>("moradia");
  const [valor, setValor] = useState("");

  function limpar() {
    setEditId(null);
    setDescricao("");
    setCategoria("moradia");
    setValor("");
  }

  function editar(despesa: Despesa) {
    setEditId(despesa.id);
    setDescricao(despesa.descricao);
    setCategoria(despesa.categoria);
    setValor(String(despesa.valor));
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const valorNum = Number(valor.replace(",", "."));
    if (!descricao.trim() || Number.isNaN(valorNum)) return;
    if (editId) {
      onUpdate({ id: editId, descricao: descricao.trim(), categoria, valor: valorNum });
    } else {
      onAdd({ descricao: descricao.trim(), categoria, valor: valorNum });
    }
    limpar();
  }

  const labelCategoria = (c: CategoriaDespesa) =>
    CATEGORIAS_DESPESA.find((item) => item.valor === c)?.label ?? c;

  return (
    <div className="form-block">
      <p className="form-intro">Moradia, alimentação, transporte, lazer, dívidas ou outros.</p>
      <form onSubmit={handleSubmit} className="stack-form">
        <label>
          Descrição
          <input
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
            placeholder="Ex: Aluguel"
            required
          />
        </label>
        <label>
          Categoria
          <select value={categoria} onChange={(e) => setCategoria(e.target.value as CategoriaDespesa)}>
            {CATEGORIAS_DESPESA.map((c) => (
              <option key={c.valor} value={c.valor}>
                {c.label}
              </option>
            ))}
          </select>
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
            {editId ? "Salvar alterações" : "Adicionar despesa"}
          </button>
          {editId && (
            <button type="button" className="btn-ghost" onClick={limpar}>
              Cancelar
            </button>
          )}
        </div>
      </form>

      <ul className="item-list">
        {itens.map((despesa) => (
          <li key={despesa.id}>
            <div>
              <strong>{despesa.descricao}</strong>
              <span>
                {labelCategoria(despesa.categoria)} · {formatCurrency(despesa.valor)}
              </span>
            </div>
            <div className="item-actions">
              <button type="button" onClick={() => editar(despesa)} aria-label="Editar">
                ✎
              </button>
              <button type="button" onClick={() => onRemove(despesa.id)} aria-label="Remover">
                ✕
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
