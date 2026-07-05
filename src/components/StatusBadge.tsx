import { STATUS_META } from "../utils/finance";
import type { StatusFinanceiro } from "../types";

export function StatusBadge({ status, score }: { status: StatusFinanceiro; score: number }) {
  const meta = STATUS_META[status];
  return (
    <div className="status-badge" style={{ background: meta.corSuave, color: meta.cor }}>
      <span className="status-dot" style={{ background: meta.cor }} />
      <div>
        <strong>{meta.label}</strong>
        <p>{meta.descricao}</p>
      </div>
      <span className="status-score">{score}</span>
    </div>
  );
}
