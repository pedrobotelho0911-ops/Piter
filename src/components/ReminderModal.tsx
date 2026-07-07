import type { Despesa } from "../types";
import { estaDespesaPagaNoMes, formatCurrency } from "../utils/finance";

interface ReminderModalProps {
  despesas: Despesa[];
  onClose: () => void;
  onTogglePaga: (id: string) => void;
}

export function ReminderModal({ despesas, onClose, onTogglePaga }: ReminderModalProps) {
  const totalPendente = despesas
    .filter((d) => !estaDespesaPagaNoMes(d))
    .reduce((acc, d) => acc + d.valor, 0);

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true">
      <div className="modal-card">
        <h2>Contas vencendo hoje</h2>
        <ul className="reminder-list">
          {despesas.map((d) => {
            const paga = estaDespesaPagaNoMes(d);
            return (
              <li key={d.id}>
                <div>
                  <span>{d.descricao}</span>
                  <strong>{formatCurrency(d.valor)}</strong>
                </div>
                <button
                  type="button"
                  className={`chip-toggle ${paga ? "paga" : "pendente"}`}
                  onClick={() => onTogglePaga(d.id)}
                >
                  {paga ? "✓ Pago" : "Marcar como pago"}
                </button>
              </li>
            );
          })}
        </ul>
        <p className="reminder-total">Ainda falta pagar: {formatCurrency(totalPendente)}</p>
        <button type="button" className="btn-primary" onClick={onClose}>
          Ok, entendi
        </button>
      </div>
    </div>
  );
}
