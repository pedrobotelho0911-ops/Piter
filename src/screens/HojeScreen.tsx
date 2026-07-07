import { useEffect, useMemo, useRef, useState } from "react";
import type { Habito } from "../types";
import { useApp } from "../store/AppContext";
import { NOMES_MESES, hojeISO, semanasDoMes } from "../lib/datas";
import { concluidoEm, habitosAtivosOrdenados } from "../lib/registros";
import { useLongPress } from "../hooks/useLongPress";
import { Modal } from "../components/Modal";
import { FormularioHabito } from "../components/FormularioHabito";
import { ValoresExtras } from "../components/ValoresExtras";
import { ResumoDiario } from "../components/ResumoDiario";

export function HojeScreen() {
  const agora = new Date();
  const [ano, setAno] = useState(agora.getFullYear());
  const [mes, setMes] = useState(agora.getMonth()); // 0 a 11
  const [criando, setCriando] = useState(false);
  const [menuHabito, setMenuHabito] = useState<Habito | null>(null);
  const [editando, setEditando] = useState<Habito | null>(null);
  const [preenchendoExtras, setPreenchendoExtras] = useState<Habito | null>(null);

  const { habitos, registros, alternarConclusao, definirAtivo } = useApp();
  const ativos = useMemo(() => habitosAtivosOrdenados(habitos), [habitos]);

  const hoje = hojeISO();
  const ehMesAtual = ano === agora.getFullYear() && mes === agora.getMonth();
  const semanas = useMemo(() => semanasDoMes(ano, mes), [ano, mes]);

  const rolagemRef = useRef<HTMLDivElement>(null);

  // Ao abrir o mês atual, rola a grade até a coluna de hoje; noutros meses, volta ao início.
  useEffect(() => {
    const container = rolagemRef.current;
    if (!ehMesAtual) {
      if (container) container.scrollLeft = 0;
      return;
    }
    const celula = container?.querySelector<HTMLElement>("[data-hoje]");
    if (!container || !celula) return;
    const deslocamento =
      celula.getBoundingClientRect().left -
      container.getBoundingClientRect().left +
      container.scrollLeft;
    container.scrollLeft = Math.max(0, deslocamento - 160);
  }, [ehMesAtual, ano, mes, ativos.length]);

  function navegarMes(direcao: -1 | 1) {
    const data = new Date(ano, mes + direcao, 1);
    setAno(data.getFullYear());
    setMes(data.getMonth());
  }

  return (
    <div className="pb-6">
      <header className="sticky top-0 z-20 flex items-center justify-between gap-2 border-b border-borda bg-fundo/95 px-4 py-3 backdrop-blur">
        <button
          onClick={() => navegarMes(-1)}
          aria-label="Mês anterior"
          className="flex h-11 w-11 items-center justify-center rounded-xl border border-borda text-xl text-texto-fraco active:bg-card"
        >
          ‹
        </button>
        <div className="text-center">
          <h1 className="text-2xl font-extrabold tracking-wide text-ciano">{NOMES_MESES[mes]}</h1>
          <p className="text-xs font-semibold text-texto-fraco">
            {ano}
            {!ehMesAtual && " · só leitura"}
          </p>
        </div>
        <button
          onClick={() => navegarMes(1)}
          aria-label="Próximo mês"
          className="flex h-11 w-11 items-center justify-center rounded-xl border border-borda text-xl text-texto-fraco active:bg-card"
        >
          ›
        </button>
      </header>

      {ativos.length === 0 ? (
        <div className="mx-4 mt-8 rounded-3xl border border-borda bg-superficie p-8 text-center">
          <p className="text-4xl">🌱</p>
          <p className="mt-3 text-lg font-bold">Nenhum hábito ainda</p>
          <p className="mt-1 text-sm text-texto-fraco">
            Crie o primeiro hábito da sua rotina pra começar a marcar os dias.
          </p>
          <button
            onClick={() => setCriando(true)}
            className="mt-5 min-h-11 rounded-xl bg-azul px-6 py-3 font-bold text-white active:scale-[0.98]"
          >
            Criar meu primeiro hábito
          </button>
        </div>
      ) : (
        <div ref={rolagemRef} className="sem-scrollbar overflow-x-auto pt-4">
          <div className="min-w-max pb-2 pr-4">
            {/* Cabeçalho das semanas */}
            <div className="flex">
              <div className="sticky left-0 z-10 w-40 shrink-0 bg-fundo" />
              {semanas.map((semana) => (
                <div
                  key={semana.numero}
                  style={{ width: semana.dias.length * 44 + (semana.dias.length - 1) * 4 }}
                  className="ml-3 rounded-lg bg-superficie py-1 text-center text-[11px] font-bold uppercase tracking-wider text-roxo first:ml-0"
                >
                  Semana {semana.numero}
                </div>
              ))}
            </div>

            {/* Cabeçalho dos dias */}
            <div className="mt-2 flex">
              <div className="sticky left-0 z-10 w-40 shrink-0 bg-fundo" />
              {semanas.map((semana) => (
                <div key={semana.numero} className="ml-3 flex gap-1 first:ml-0">
                  {semana.dias.map((dia) => {
                    const ehHoje = ehMesAtual && dia.iso === hoje;
                    return (
                      <div
                        key={dia.iso}
                        data-hoje={ehHoje || undefined}
                        className={`w-11 rounded-lg py-1 text-center ${ehHoje ? "bg-ciano/15" : ""}`}
                      >
                        <p className="text-[10px] font-semibold text-texto-fraco">{dia.letra}</p>
                        <p className={`text-sm font-bold ${ehHoje ? "text-ciano" : ""}`}>
                          {dia.numero}
                        </p>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>

            {/* Uma linha por hábito */}
            {ativos.map((habito) => (
              <LinhaHabito
                key={habito.id}
                habito={habito}
                semanas={semanas}
                hoje={hoje}
                ehMesAtual={ehMesAtual}
                concluidoNoDia={(iso) => concluidoEm(registros, iso, habito.id)}
                aoAlternar={(iso) => alternarConclusao(iso, habito.id)}
                aoAbrirMenu={() => setMenuHabito(habito)}
                aoAbrirExtras={() => setPreenchendoExtras(habito)}
              />
            ))}
          </div>
        </div>
      )}

      <ResumoDiario />

      {/* Botão flutuante de criação rápida */}
      <button
        onClick={() => setCriando(true)}
        aria-label="Criar novo hábito"
        className="fixed bottom-24 right-4 z-30 flex h-14 w-14 items-center justify-center rounded-2xl bg-azul text-3xl font-bold text-white shadow-lg shadow-azul/40 active:scale-95"
      >
        +
      </button>

      {criando && <FormularioHabito onFechar={() => setCriando(false)} />}
      {editando && <FormularioHabito habito={editando} onFechar={() => setEditando(null)} />}
      {preenchendoExtras && (
        <ValoresExtras
          habito={preenchendoExtras}
          data={hoje}
          onFechar={() => setPreenchendoExtras(null)}
        />
      )}

      {menuHabito && (
        <Modal titulo={`${menuHabito.emoji} ${menuHabito.nome}`} onFechar={() => setMenuHabito(null)}>
          <div className="flex flex-col gap-2">
            {menuHabito.campos_extras.length > 0 && (
              <button
                onClick={() => {
                  setPreenchendoExtras(menuHabito);
                  setMenuHabito(null);
                }}
                className="min-h-11 rounded-xl bg-card px-4 py-3 text-left font-semibold active:scale-[0.99]"
              >
                📝 Preencher campos de hoje
              </button>
            )}
            <button
              onClick={() => {
                setEditando(menuHabito);
                setMenuHabito(null);
              }}
              className="min-h-11 rounded-xl bg-card px-4 py-3 text-left font-semibold active:scale-[0.99]"
            >
              ✏️ Editar / campos extras
            </button>
            <button
              onClick={() => {
                definirAtivo(menuHabito.id, false);
                setMenuHabito(null);
              }}
              className="min-h-11 rounded-xl bg-card px-4 py-3 text-left font-semibold text-texto-fraco active:scale-[0.99]"
            >
              📦 Arquivar (o histórico fica guardado)
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}

interface PropsLinha {
  habito: Habito;
  semanas: ReturnType<typeof semanasDoMes>;
  hoje: string;
  ehMesAtual: boolean;
  concluidoNoDia: (iso: string) => boolean;
  aoAlternar: (iso: string) => void;
  aoAbrirMenu: () => void;
  aoAbrirExtras: () => void;
}

function LinhaHabito({
  habito,
  semanas,
  hoje,
  ehMesAtual,
  concluidoNoDia,
  aoAlternar,
  aoAbrirMenu,
  aoAbrirExtras,
}: PropsLinha) {
  const pressaoLonga = useLongPress(aoAbrirMenu);

  return (
    <div className="mt-1 flex items-center">
      <div className="sticky left-0 z-10 flex w-40 shrink-0 items-center bg-fundo pl-4 pr-1">
        <button
          {...pressaoLonga}
          onClick={aoAbrirMenu}
          className="flex h-11 min-w-0 flex-1 items-center gap-1.5 rounded-xl px-1.5 text-left active:bg-card"
          aria-label={`Opções do hábito ${habito.nome}`}
        >
          <span className="text-lg">{habito.emoji}</span>
          <span className="truncate text-sm font-semibold">{habito.nome}</span>
        </button>
        {habito.campos_extras.length > 0 && (
          <button
            onClick={aoAbrirExtras}
            aria-label={`Preencher campos extras de ${habito.nome}`}
            className="flex h-11 w-8 shrink-0 items-center justify-center rounded-lg text-sm text-roxo active:bg-card"
          >
            📝
          </button>
        )}
      </div>

      {semanas.map((semana) => (
        <div key={semana.numero} className="ml-3 flex gap-1 first:ml-0">
          {semana.dias.map((dia) => {
            const feito = concluidoNoDia(dia.iso);
            const futuro = ehMesAtual && dia.iso > hoje;
            const editavel = ehMesAtual && !futuro;
            const ehHoje = ehMesAtual && dia.iso === hoje;
            return (
              <button
                key={dia.iso}
                disabled={!editavel}
                onClick={() => aoAlternar(dia.iso)}
                aria-label={`${habito.nome}, dia ${dia.numero}: ${feito ? "concluído" : "não concluído"}`}
                aria-pressed={feito}
                className={`flex h-11 w-11 items-center justify-center rounded-xl border-2 transition-colors ${
                  feito
                    ? "border-azul bg-azul text-white"
                    : ehHoje
                      ? "border-ciano/70 bg-superficie"
                      : "border-roxo/35 bg-superficie/50"
                } ${futuro ? "opacity-25" : ""} ${!ehMesAtual ? "opacity-60" : ""}`}
              >
                {feito && (
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
                    <path
                      d="M4 9.5l3.2 3.2L14 6"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
}
