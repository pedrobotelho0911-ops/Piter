import { useState, type FormEvent } from "react";
import type { Conta } from "../../types";
import { formatCurrency } from "../../utils/finance";

interface Props {
  itens: Conta[];
  onAdd: (conta: Omit<Conta, "id">) => void;
  onUpdate: (conta: Conta) => void;
  onRemove: (id: string) => void;
}

export function ContaForm({ itens, onAdd, onUpdate, onRemove }: Props) {
  const [editId, setEditId] = useState<string | null>(null);
  const [nome, setNome] = useState("");
  const [saldo, setSaldo] = useState("");

  function limpar() {
    setEditId(null);
    setNome("");
    setSaldo("");
  }

  function editar(conta: Conta) {
    setEditId(conta.id);
    setNome(conta.nome);
    setSaldo(String(conta.saldo));
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const valorSaldo = Number(saldo.replace(",", "."));
    if (!nome.trim() || Number.isNaN(valorSaldo)) return;
    if (editId) {
      onUpdate({ id: editId, nome: nome.trim(), saldo: valorSaldo });
    } else {
      onAdd({ nome: nome.trim(), saldo: valorSaldo });
    }
    limpar();
  }

  return (
    <div className="form-block">
      <p className="form-intro">Onde seu dinheiro está guardado: conta corrente, carteira, poupança...</p>
      <form onSubmit={handleSubmit} className="stack-form">
        <label>
          Nome da conta
          <input value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Ex: Nubank" required />
        </label>
        <label>
          Saldo atual
          <input
            value={saldo}
            onChange={(e) => setSaldo(e.target.value)}
            placeholder="0,00"
            inputMode="decimal"
            required
          />
        </label>
        <div className="form-actions">
          <button type="submit" className="btn-primary">
            {editId ? "Salvar alterações" : "Adicionar conta"}
          </button>
          {editId && (
            <button type="button" className="btn-ghost" onClick={limpar}>
              Cancelar
            </button>
          )}
        </div>
      </form>

      <ul className="item-list">
        {itens.map((conta) => (
          <li key={conta.id}>
            <div>
              <strong>{conta.nome}</strong>
              <span>{formatCurrency(conta.saldo)}</span>
            </div>
            <div className="item-actions">
              <button type="button" onClick={() => editar(conta)} aria-label="Editar">
                ✎
              </button>
              <button type="button" onClick={() => onRemove(conta.id)} aria-label="Remover">
                ✕
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
