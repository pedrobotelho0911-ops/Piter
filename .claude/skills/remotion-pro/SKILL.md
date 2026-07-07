---
name: remotion-pro
description: Skill premium para criar vídeos programáticos de alto nível com Remotion neste repositório. Usar SEMPRE que a tarefa envolver criar/editar composições, animações, cenas, legendas, motion graphics, renderização ou qualquer arquivo em src/. Gatilhos - vídeo, animação, composição, cena, intro, outro, motion, render, Remotion.
---

# Remotion Pro — Vídeo programático de nível premium

## Setup deste repo
- Remotion 4.0.477, React 19, TypeScript 5, Tailwind v4, Zod para props tipadas.
- `npm run dev` abre o Remotion Studio; `npm run lint` roda ESLint + tsc (obrigatório antes de commit).
- Composições são registradas em `src/Root.tsx` com `<Composition>`. Cada vídeo vive em sua própria pasta `src/NomeDoVideo/`.

## Padrões de qualidade premium (não negociáveis)
1. **Nada de animação linear.** Sempre usar `spring()` ou `interpolate()` com easing (`Easing.out(Easing.cubic)` como padrão). Movimento linear parece amador.
2. **Sempre `extrapolateLeft/Right: "clamp"`** em `interpolate()` — evita valores estourados fora do range.
3. **Tudo dirigido por `useCurrentFrame()`**. Nunca usar `useState`/`setTimeout`/CSS transitions para animar — quebra a renderização determinística.
4. **Props tipadas com Zod** (`@remotion/zod-types`) em toda composição — permite editar no Studio e reusar a composição como template.
5. **Hierarquia de cena**: composição → `<Sequence>` por cena → componentes. Usar `<Series>` para cenas consecutivas e `premountFor` em cenas pesadas.
6. **Áudio e mídia**: `<Audio>`, `<OffthreadVideo>` (nunca `<Video>` para render), `staticFile()` para assets em `public/`.

## Receitas prontas

### Entrada com spring (padrão da casa)
```tsx
const frame = useCurrentFrame();
const { fps } = useVideoConfig();
const enter = spring({ frame, fps, config: { damping: 200 } });
const y = interpolate(enter, [0, 1], [40, 0]);
const opacity = enter;
```

### Stagger de elementos (listas, palavras, cards)
```tsx
items.map((item, i) => {
  const delay = i * 5; // 5 frames entre itens
  const s = spring({ frame: frame - delay, fps, config: { damping: 200 } });
  ...
});
```

### Formatos padrão
| Destino | Dimensões | fps | Duração alvo |
|---|---|---|---|
| TikTok/Reels/Shorts | 1080×1920 | 30 | 15–45 s |
| YouTube | 1920×1080 | 30 | livre |
| Feed/quadrado | 1080×1080 | 30 | 15–30 s |

### Renderização
- Preview: Studio (`npm run dev`).
- Render final: `npx remotion render <CompositionId> out/<nome>.mp4`.
- Ativar `--gl=angle` se houver WebGL; `--concurrency` conforme CPU.

## Checklist antes de entregar um vídeo
- [ ] Todas as animações usam spring/easing (zero movimento linear)
- [ ] Texto legível em tela pequena (mínimo ~64px de fonte em 1080×1920)
- [ ] Contraste forte e safe-areas respeitadas (UI do TikTok/Reels cobre bordas: ~220px topo, ~320px rodapé em 1920)
- [ ] Primeiro 1s tem movimento/hook visual (não abrir com tela parada)
- [ ] `npm run lint` passa
- [ ] Composição registrada em `Root.tsx` com `defaultProps` completos

## Integração com Higgsfield
Assets de IA (b-roll, imagens de fundo, narração TTS, música) podem ser gerados via Higgsfield (ver skill `ai-media-studio`), baixados para `public/` e usados com `staticFile()`. Fluxo típico premium: narração TTS → b-roll IA → montagem e tipografia no Remotion → render.
