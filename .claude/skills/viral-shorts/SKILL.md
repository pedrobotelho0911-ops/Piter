---
name: viral-shorts
description: Skill premium para criar conteúdo short-form viral (TikTok, Reels, YouTube Shorts) e maximizar alcance. Usar quando o pedido envolver shorts, reels, TikTok, vídeo viral, hook, retenção, engajamento, clipes, cortes ou análise de viralidade. Combina estratégia de conteúdo com as ferramentas Higgsfield (Shorts Studio, Virality Predictor, Clipper) e Remotion.
---

# Viral Shorts — Fábrica de conteúdo short-form

## Pipeline premium (sempre nesta ordem)
1. **Ângulo antes de produção** — definir: público-alvo, emoção dominante (curiosidade, choque, desejo, humor), e a promessa do vídeo em 1 frase.
2. **Hook (0–2s)** — decide 80% da retenção. Padrões que funcionam:
   - Afirmação polêmica/contraintuitiva ("Você está usando X errado")
   - Resultado antes do processo (mostrar o final primeiro)
   - Pergunta aberta + movimento visual imediato
   - Número específico ("3 erros que...", "R$ 12.400 em 7 dias com...")
3. **Estrutura de retenção** — loop aberto no início, payoff só no final; corte a cada 1.5–3s; nunca mais de 3s sem mudança visual ou de áudio.
4. **Produção** — via Higgsfield Shorts Studio (`shorts_studio_create`) para geração completa, ou Remotion (skill `remotion-pro`) para controle total de tipografia/marca.
5. **Validação ANTES de publicar** — rodar `virality_predictor` no vídeo pronto: analisa hook strength, retenção, atenção. Se score fraco, iterar no hook primeiro.
6. **Variações** — nunca publicar 1 versão só. Gerar 2–3 hooks diferentes para o mesmo corpo e testar.

## Ferramentas Higgsfield para este fluxo
| Ferramenta | Uso |
|---|---|
| `shorts_studio_create` / `shorts_studio_list_presets` | Gerar shorts completos a partir de brief |
| `virality_predictor` | Prever viralidade, força do hook, risco de queda de retenção |
| `personal_clipper_create` | Cortar vídeo longo em clipes virais |
| `get_workflow_instructions` | Workflows prontos (explainer, UGC, ad) — SEMPRE consultar o catálogo antes de montar fluxo manual |
| `generate_video` / `generate_audio` | B-roll e narração sob medida |

## Regras técnicas (short-form)
- 1080×1920 vertical, 30fps, 15–45s (sweet spot: 21–34s).
- Legendas queimadas SEMPRE (85% assiste sem som) — palavras destacadas uma a uma performam melhor que blocos.
- Safe-areas: nada importante nos ~220px do topo e ~320px do rodapé.
- Áudio: música em alta + narração clara; picos de energia sincronizados com cortes.
- CTA: um só, nos últimos 2–3s, específico ("comenta X", "segue pra parte 2") — nunca genérico.

## Checklist de publicação
- [ ] Hook nos primeiros 2s com movimento visual
- [ ] Virality Predictor rodado e score revisado
- [ ] Legendas queimadas e dentro da safe-area
- [ ] Loop/payoff que segura até o fim
- [ ] 2–3 variações de hook geradas
- [ ] CTA único e específico

## Métricas que importam (nesta ordem)
1. Retenção nos 3 primeiros segundos (hook)
2. Tempo médio de visualização / % assistido
3. Compartilhamentos e salvamentos (sinal mais forte para o algoritmo)
4. Comentários (fazer pergunta que provoque resposta)
