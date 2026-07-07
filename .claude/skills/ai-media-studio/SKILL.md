---
name: ai-media-studio
description: Skill premium para geração e edição de mídia com IA via Higgsfield - imagens, vídeos, áudio, voz, música, 3D, upscale, remoção de fundo, reframe e dublagem. Usar quando o pedido envolver gerar/criar/editar qualquer mídia com IA, thumbnails, b-roll, avatares, narração, TTS, voice clone, ou melhorar qualidade de assets existentes.
---

# AI Media Studio — Geração de mídia com IA em nível profissional

## Regra número 1: usar a ferramenta certa, nunca regenerar
Antes de qualquer geração, verificar se existe ferramenta dedicada para a tarefa:
| Tarefa | Ferramenta correta |
|---|---|
| Melhorar/ampliar resolução (2K/4K) | `upscale_image` / `upscale_video` |
| Expandir/descropar imagem | `outpaint_image` |
| Mudar aspect ratio de vídeo | `reframe` |
| Remover fundo / cutout | `remove_background` |
| Transferir movimento / puppeteer | `motion_control` |
| Trocar voz de um áudio | `voice_change` |
| Dublar para outro idioma | `dubbing` |
| Imagem → mesh 3D GLB | `generate_3d` |

## Regra número 2: modelo certo para o objetivo
Quando houver dúvida sobre qual modelo usar, chamar `models_explore(action:'recommend')` com o objetivo e o contexto do input ANTES de `generate_*`. Nunca chutar modelo.

## Regra número 3: workflows prontos antes de fluxo manual
Para qualquer vídeo multi-etapas sob brief (explainer narrado, ad/comercial, UGC/talking-head, podcast), chamar `get_workflow_instructions` sem argumento para ver o catálogo, depois carregar o workflow correspondente. O catálogo muda — sempre consultar em vez de assumir.

## Engenharia de prompt para mídia (padrão premium)
- **Imagem**: assunto + ação + ambiente + iluminação + lente/estilo + mood. Ex.: "close-up de tênis branco flutuando, fundo gradiente azul-elétrico, iluminação de estúdio dramática, lente 85mm, estilo editorial de e-commerce premium".
- **Vídeo**: descrever movimento de câmera explicitamente (dolly-in, orbit, handheld) + o que muda durante o take. Takes curtos (3–6s) compõem melhor que um take longo.
- **Consistência de marca/personagem**: usar `show_characters` e `show_reference_elements` para reaproveitar personagens e elementos de referência entre gerações — nunca recriar do zero.
- **Voz**: `create_voice` para voz própria/clonada; `list_voices` antes de criar duplicata.

## Fluxos compostos de alto valor
1. **Thumbnail premium**: `generate_image` (prompt editorial) → `upscale_image` para 4K → `remove_background` se precisar compor.
2. **B-roll para Remotion**: gerar takes de 3–6s → baixar para `public/` do repo → montar com tipografia no Remotion (skill `remotion-pro`).
3. **Narração de vídeo**: `generate_audio` (TTS com voz do `list_voices`) → usar como trilha-guia para timing das cenas.
4. **Produto em 3D**: foto do produto → `remove_background` → `generate_3d` → usar em cenas giratórias.

## Higiene de custos e operação
- Conferir `balance` antes de lotes grandes de geração; gerar 1 amostra, validar direção com o usuário/objetivo, depois escalar o lote.
- Mídia local do usuário: usar `media_upload_widget` imediatamente (anexos do chat não são legíveis pelas tools remotas).
- Acompanhar jobs com `job_display`; revisar resultados com `show_generations` / `show_medias`.
