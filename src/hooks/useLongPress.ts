import { useRef } from "react";

const DURACAO_MS = 450;
const TOLERANCIA_PX = 12;

/**
 * Detecta toque longo (long-press) sem disparar o clique normal junto.
 * Uso: <button {...useLongPress(abrirMenu)} onClick={acaoNormal} />
 */
export function useLongPress(aoSegurar: () => void) {
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const origem = useRef({ x: 0, y: 0 });
  const disparou = useRef(false);

  function limpar() {
    if (timer.current) {
      clearTimeout(timer.current);
      timer.current = null;
    }
  }

  return {
    onPointerDown(evento: React.PointerEvent) {
      disparou.current = false;
      origem.current = { x: evento.clientX, y: evento.clientY };
      limpar();
      timer.current = setTimeout(() => {
        disparou.current = true;
        aoSegurar();
      }, DURACAO_MS);
    },
    onPointerMove(evento: React.PointerEvent) {
      // Se o dedo deslizar (rolagem), cancela o toque longo.
      const dx = evento.clientX - origem.current.x;
      const dy = evento.clientY - origem.current.y;
      if (Math.hypot(dx, dy) > TOLERANCIA_PX) limpar();
    },
    onPointerUp: limpar,
    onPointerLeave: limpar,
    onContextMenu(evento: React.MouseEvent) {
      evento.preventDefault();
    },
    onClickCapture(evento: React.MouseEvent) {
      // Depois de um toque longo, engole o clique que viria em seguida.
      if (disparou.current) {
        evento.preventDefault();
        evento.stopPropagation();
        disparou.current = false;
      }
    },
  };
}
