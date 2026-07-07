import { useState, type FormEvent } from "react";
import { CATEGORIAS_DESPESA, type CategoriaDespesa, type Gasto } from "../../types";
import { formatCurrency } from "../../utils/finance";

interface Props {
  itens: Gasto[];
  onAdd: (gasto: Omit<Gasto, "id">) => void;
  onUpdate: (gasto: Gasto) => void;
  onRemove: (id: string) => void;
}

function hoje(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function GastoForm({ itens, onAdd, onUpdate, onRemove }: Props) {
  const [editId, setEditId] = useState<string | null>(null);
  const [descricao, setDescricao] = useState("");
  const [categoria, setCategoria] = useState<CategoriaDespesa>("alimentacao");
  const [valor, setValor] = useState("");
  const [data, setData] = useState(hoje());

  function limpar() {
    setEditId(null);
    setDescricao("");
    setCategoria("alimentacao");
    setValor("");
    setData(hoje());
  }

  function editar(gasto: Gasto) {
    setEditId(gasto.id);
    setDescricao(gasto.descricao);
    setCategoria(gasto.categoria);
    setValor(String(gasto.valor));
    setData(gasto.data);
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const valorNum = Number(valor.replace(",", "."));
    if (!descricao.trim() || Number.isNaN(valorNum) || !data) return;
    if (editId) {
      onUpdate({ id: editId, descricao: descricao.trim(), categoria, valor: valorNum, data });
    } else {
      onAdd({ descricao: descricao.trim(), categoria, valor: valorNum, data });
    }
    limpar();
  }

  const labelCategoria = (c: CategoriaDespesa) =>
    CATEGORIAS_DESPESA.find((item) => item.valor === c)?.label ?? c;

  const itensOrdenados = [...itens].sort((a, b) => b.data.localeCompare(a.data));

  return (
    <div className="form-block">
      <p className="form-intro">
        Gastos do dia a dia: almoço, café, uber, uma compra qualquer — anote com o que foi.
      </p>
      <form onSubmit={handleSubmit} className="stack-form">
        <label>
          Com o que foi esse gasto?
          <input
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
            placeholder="Ex: Almoço no trabalho"
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
          Data
          <input type="date" value={data} onChange={(e) => setData(e.target.value)} required />
        </label>
        <div className="form-actions">
          <button type="submit" className="btn-primary">
            {editId ? "Salvar alterações" : "Adicionar gasto"}
          </button>
          {editId && (
            <button type="button" className="btn-ghost" onClick={limpar}>
              Cancelar
            </button>
          )}
        </div>
      </form>

      <ul className="item-list">
        {itensOrdenados.map((gasto) => (
          <li key={gasto.id}>
            <div>
              <strong>{gasto.descricao}</strong>
              <span>
                {labelCategoria(gasto.categoria)} · {formatCurrency(gasto.valor)} ·{" "}
                {new Date(gasto.data + "T00:00:00").toLocaleDateString("pt-PT")}
              </span>
            </div>
            <div className="item-actions">
              <button type="button" onClick={() => editar(gasto)} aria-label="Editar">
                ✎
              </button>
              <button type="button" onClick={() => onRemove(gasto.id)} aria-label="Remover">
                ✕
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
