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
  const [data, setData] = useState("");

  function limpar() {
    setEditId(null);
    setDescricao("");
    setValor("");
    setData("");
  }

  function editar(receita: Receita) {
    setEditId(receita.id);
    setDescricao(receita.descricao);
    setValor(String(receita.valor));
    setData(receita.data ?? "");
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const valorNum = Number(valor.replace(",", "."));
    if (!descricao.trim() || Number.isNaN(valorNum)) return;
    const payload = { descricao: descricao.trim(), valor: valorNum, data: data || undefined };
    if (editId) {
      onUpdate({ id: editId, ...payload });
    } else {
      onAdd(payload);
    }
    limpar();
  }

  const itensOrdenados = [...itens].sort((a, b) => (b.data ?? "").localeCompare(a.data ?? ""));

  return (
    <div className="form-block">
      <p className="form-intro">
        Salário, freelas, entregas, bicos. Se a renda entra em datas e valores diferentes,
        preencha a data — ela só conta no mês certo. Deixe a data em branco para uma renda fixa
        que se repete todo mês (como um salário).
      </p>
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
          Data (opcional — deixe em branco se for renda fixa mensal)
          <input type="date" value={data} onChange={(e) => setData(e.target.value)} />
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
        {itensOrdenados.map((receita) => (
          <li key={receita.id}>
            <div>
              <strong>{receita.descricao}</strong>
              <span>
                {formatCurrency(receita.valor)}
                {receita.data
                  ? ` · ${new Date(receita.data + "T00:00:00").toLocaleDateString("pt-PT")}`
                  : " · fixa todo mês"}
              </span>
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
