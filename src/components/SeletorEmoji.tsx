const EMOJIS = [
  "💪", "🏃", "🏋️", "🚴", "🧘", "🚶", "⚽", "🏊",
  "📚", "✍️", "🧠", "🎯", "💻", "🎨", "🎸", "🌱",
  "💧", "🥗", "🍎", "💊", "😴", "🌅", "🚿", "🦷",
  "🧹", "💰", "📝", "🙏", "📵", "☀️", "🌙", "🔥",
];

interface Props {
  valor: string;
  onMudar: (emoji: string) => void;
}

export function SeletorEmoji({ valor, onMudar }: Props) {
  return (
    <div>
      <div className="grid grid-cols-8 gap-1">
        {EMOJIS.map((emoji) => (
          <button
            key={emoji}
            type="button"
            onClick={() => onMudar(emoji)}
            aria-label={`Escolher emoji ${emoji}`}
            className={`flex h-10 w-full items-center justify-center rounded-lg text-xl ${
              valor === emoji ? "bg-card ring-2 ring-ciano" : "active:bg-card"
            }`}
          >
            {emoji}
          </button>
        ))}
      </div>
      <input
        value={valor}
        onChange={(e) => onMudar(e.target.value)}
        maxLength={4}
        aria-label="Emoji personalizado"
        placeholder="Ou digite outro emoji"
        className="mt-2 w-full rounded-xl border border-borda bg-fundo px-4 py-2 text-center text-xl focus:border-ciano focus:outline-none"
      />
    </div>
  );
}
