import type { Despesa } from "../types";
import { formatCurrency } from "../utils/finance";

interface ReminderModalProps {
  despesas: Despesa[];
  onClose: () => void;
}

export function ReminderModal({ despesas, onClose }: ReminderModalProps) {
  const total = despesas.reduce((acc, d) => acc + d.valor, 0);

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true">
      <div className="modal-card">
        <h2>Contas vencendo hoje</h2>
        <ul className="reminder-list">
          {despesas.map((d) => (
            <li key={d.id}>
              <span>{d.descricao}</span>
              <strong>{formatCurrency(d.valor)}</strong>
            </li>
          ))}
        </ul>
        <p className="reminder-total">Total: {formatCurrency(total)}</p>
        <button type="button" className="btn-primary" onClick={onClose}>
          Ok, entendi
        </button>
      </div>
    </div>
  );
}
