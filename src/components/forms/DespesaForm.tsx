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
  const [diaVencimento, setDiaVencimento] = useState("");

  function limpar() {
    setEditId(null);
    setDescricao("");
    setCategoria("moradia");
    setValor("");
    setDiaVencimento("");
  }

  function editar(despesa: Despesa) {
    setEditId(despesa.id);
    setDescricao(despesa.descricao);
    setCategoria(despesa.categoria);
    setValor(String(despesa.valor));
    setDiaVencimento(despesa.diaVencimento ? String(despesa.diaVencimento) : "");
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const valorNum = Number(valor.replace(",", "."));
    if (!descricao.trim() || Number.isNaN(valorNum)) return;
    const dia = diaVencimento.trim() ? Number(diaVencimento) : undefined;
    const diaVencimentoValido =
      dia !== undefined && Number.isInteger(dia) && dia >= 1 && dia <= 31 ? dia : undefined;
    if (editId) {
      onUpdate({
        id: editId,
        descricao: descricao.trim(),
        categoria,
        valor: valorNum,
        diaVencimento: diaVencimentoValido,
      });
    } else {
      onAdd({
        descricao: descricao.trim(),
        categoria,
        valor: valorNum,
        diaVencimento: diaVencimentoValido,
      });
    }
    limpar();
  }

  const labelCategoria = (c: CategoriaDespesa) =>
    CATEGORIAS_DESPESA.find((item) => item.valor === c)?.label ?? c;

  return (
    <div className="form-block">
      <p className="form-intro">
        Contas fixas que se repetem todo mês: aluguel, internet, assinaturas. Para gastos do
        dia a dia (almoço, uber, compras), use a aba "Gastos".
      </p>
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
        <label>
          Dia do vencimento (opcional)
          <input
            value={diaVencimento}
            onChange={(e) => setDiaVencimento(e.target.value)}
            placeholder="Ex: 10"
            inputMode="numeric"
            type="number"
            min={1}
            max={31}
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
                {despesa.diaVencimento ? ` · vence dia ${despesa.diaVencimento}` : ""}
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
