---
name: content-to-commerce
description: Skill premium que liga conteúdo a vendas - criar anúncios em vídeo, criativos de produto, UGC, campanhas e funis de conteúdo que convertem para a loja Shopify. Usar quando o pedido envolver anúncio, ad, criativo, campanha, vídeo de produto, UGC, divulgar produto, vender mais, ou transformar conteúdo em receita.
---

# Content-to-Commerce — Conteúdo que vende

## O fluxo completo (produto → criativo → venda medida)
1. **Selecionar o produto certo**: via skill `shopify-growth`, escolher por dados — maior margem, maior conversão ou maior estoque parado (objetivos diferentes, criativos diferentes).
2. **Extrair o ângulo de venda**: do produto real (`get-product`) tirar 1 dor + 1 transformação + 1 prova. O criativo vende a transformação, não o produto.
3. **Produzir o criativo**: 
   - Ads/UGC/explainer → workflows Higgsfield (`get_workflow_instructions` — consultar catálogo)
   - Criativo com marca/tipografia precisa → Remotion (skill `remotion-pro`)
   - Assets (b-roll do produto, avatar, narração) → skill `ai-media-studio`
4. **Validar**: `virality_predictor` no criativo antes de publicar.
5. **Medir e iterar**: código de desconto exclusivo por criativo (`create-discount`) = atribuição de vendas por vídeo. Depois, ShopifyQL para comparar receita por código.

## Estruturas de criativo que convertem (escolher pelo objetivo)
### UGC / prova social (frio → descoberta)
Hook com dor real → "eu achava que X..." → demonstração no uso → resultado → CTA suave. Tom autêntico, câmera "na mão", sem cara de anúncio.

### Demonstração direta (quente → conversão)
Produto em ação nos primeiros 2s → 3 benefícios visuais rápidos → oferta com urgência real → CTA único ("link na bio", código de desconto).

### Antes/Depois (dor visual)
Estado "antes" desconfortável (2–3s) → transição satisfatória → estado "depois" → produto como causa → oferta.

## Regras de ouro
- **1 criativo = 1 produto = 1 ângulo = 1 CTA.** Criativo que vende tudo não vende nada.
- **3 variações de hook por criativo**, mesmo corpo — o hook é a variável de maior alavancagem.
- **Oferta explícita**: preço, desconto ou benefício concreto aparece no vídeo; "confira nossa loja" não é oferta.
- **Coerência visual**: o criativo deve parecer com a página do produto que recebe o clique (mesmas cores/fotos), senão a conversão cai no pouso.
- **Formato**: 1080×1920, 15–30s para ads; legendas queimadas; regras de safe-area e retenção da skill `viral-shorts` se aplicam integralmente.

## Ciclo semanal sugerido
1. Segunda: ShopifyQL — receita por código de desconto da semana anterior
2. Matar criativos com atribuição zero; dobrar orçamento/variações nos vencedores
3. Produzir 2–3 criativos novos (produtos ou ângulos novos)
4. Validar com Virality Predictor → publicar → repetir
