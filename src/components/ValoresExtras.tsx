import type { Habito } from "../types";
import { useApp } from "../store/AppContext";
import { valorCampoExtra } from "../lib/registros";
import { formatarCurto } from "../lib/datas";
import { Modal, estiloBotaoSecundario, estiloCampo } from "./Modal";
import { SeletorNota } from "./SeletorNota";

const NOTAS = ["1️⃣", "2️⃣", "3️⃣", "4️⃣", "5️⃣"];

interface Props {
  habito: Habito;
  data: string; // YYYY-MM-DD
  onFechar: () => void;
}

/** Preenchimento dos campos extras de um hábito num dia (salva a cada mudança). */
export function ValoresExtras({ habito, data, onFechar }: Props) {
  const { registros, definirValorCampoExtra } = useApp();

  return (
    <Modal titulo={`${habito.emoji} ${habito.nome} · ${formatarCurto(data)}`} onFechar={onFechar}>
      <div className="flex flex-col gap-5">
        {habito.campos_extras.map((campo) => {
          const valor = valorCampoExtra(registros, data, habito.id, campo.id);
          if (campo.tipo === "nota_1_a_5") {
            return (
              <SeletorNota
                key={campo.id}
                rotulo={campo.nome}
                icones={NOTAS}
                valor={typeof valor === "number" ? valor : undefined}
                onMudar={(nota) => definirValorCampoExtra(data, habito.id, campo.id, nota ?? "")}
              />
            );
          }
          if (campo.tipo === "barra_numerica") {
            return (
              <label key={campo.id} className="flex flex-col gap-1.5">
                <span className="text-sm font-semibold text-texto-fraco">
                  {campo.nome}
                  {campo.unidade ? ` (${campo.unidade})` : ""}
                </span>
                <input
                  type="number"
                  inputMode="decimal"
                  value={valor ?? ""}
                  onChange={(e) =>
                    definirValorCampoExtra(
                      data,
                      habito.id,
                      campo.id,
                      e.target.value === "" ? "" : Number(e.target.value),
                    )
                  }
                  placeholder="0"
                  className={estiloCampo}
                />
              </label>
            );
          }
          return (
            <label key={campo.id} className="flex flex-col gap-1.5">
              <span className="text-sm font-semibold text-texto-fraco">{campo.nome}</span>
              <input
                value={typeof valor === "string" ? valor : ""}
                onChange={(e) => definirValorCampoExtra(data, habito.id, campo.id, e.target.value)}
                placeholder="Anotação curta"
                className={estiloCampo}
              />
            </label>
          );
        })}
        <button onClick={onFechar} className={estiloBotaoSecundario}>
          Concluir
        </button>
      </div>
    </Modal>
  );
}
