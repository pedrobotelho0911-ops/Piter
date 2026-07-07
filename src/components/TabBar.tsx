export type Aba = "hoje" | "progresso" | "ajustes";

const ABAS: { id: Aba; rotulo: string; icone: (ativa: boolean) => React.ReactNode }[] = [
  {
    id: "hoje",
    rotulo: "Hoje",
    icone: (ativa) => (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
        <rect x="3" y="5" width="18" height="16" rx="3" stroke="currentColor" strokeWidth="2" />
        <path d="M3 9h18" stroke="currentColor" strokeWidth="2" />
        <path d="M8 3v4M16 3v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        {ativa && (
          <path
            d="M9 14.5l2 2 4-4"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}
      </svg>
    ),
  },
  {
    id: "progresso",
    rotulo: "Progresso",
    icone: () => (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path
          d="M4 20V10M10 20V4M16 20v-6M22 20H2"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    id: "ajustes",
    rotulo: "Ajustes",
    icone: () => (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
        <circle cx="12" cy="12" r="3.5" stroke="currentColor" strokeWidth="2" />
        <path
          d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M19.1 4.9L17 7M7 17l-2.1 2.1"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
];

export function TabBar({ aba, onMudar }: { aba: Aba; onMudar: (aba: Aba) => void }) {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-borda bg-superficie/95 pb-[env(safe-area-inset-bottom)] backdrop-blur">
      <div className="mx-auto flex max-w-2xl">
        {ABAS.map((item) => {
          const ativa = aba === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onMudar(item.id)}
              aria-current={ativa ? "page" : undefined}
              className={`flex h-16 flex-1 flex-col items-center justify-center gap-1 text-[11px] font-semibold ${
                ativa ? "text-ciano" : "text-texto-fraco"
              }`}
            >
              {item.icone(ativa)}
              {item.rotulo}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
