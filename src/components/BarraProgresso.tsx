interface Props {
  fracao: number; // 0 a 1 (valores acima de 1 são tratados como cheio)
  cor?: string; // sobrescreve o verde neon padrão
}

export function BarraProgresso({ fracao, cor }: Props) {
  const largura = Math.min(1, Math.max(0, fracao)) * 100;
  return (
    <div className="h-3 w-full overflow-hidden rounded-full bg-fundo">
      <div
        className="h-full rounded-full transition-[width] duration-300"
        style={{ width: `${largura}%`, backgroundColor: cor ?? "var(--color-verde)" }}
      />
    </div>
  );
}
