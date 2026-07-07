---
name: shopify-growth
description: Skill premium para operar e crescer a loja Shopify - produtos, coleções, estoque, pedidos, clientes, descontos e analytics. Usar quando o pedido envolver Shopify, loja, produto, venda, pedido, cliente, estoque, desconto, coleção, faturamento ou análise de vendas.
---

# Shopify Growth — Operação e crescimento de e-commerce

## Princípios de operação
1. **Dados antes de opinião.** Toda recomendação de crescimento começa com `run-analytics-query` (ShopifyQL): vendas por período, produtos top/flop, ticket médio, taxa de recompra. Nunca sugerir ação sem olhar os números primeiro.
2. **Tool dedicada primeiro, GraphQL depois.** Usar as tools nativas (`get-product`, `list-orders`, `create-discount`...) quando existirem; para qualquer recurso sem tool nativa (metafields, gift cards, páginas, blogs, markets, traduções), usar `graphql_query`/`graphql_mutation` — nunca dizer que "não dá".
3. **Validar antes de mutar.** Antes de `graphql_mutation`, conferir o schema com `graphql_schema`/`search_docs_chunks` e validar com `validate_graphql_codeblocks`. Mutações em massa (`bulk-update-product-status`) só com confirmação explícita do usuário.

## Padrão premium de produto (checklist ao criar/editar)
- [ ] Título orientado a busca: benefício + palavra-chave (não só o nome do modelo)
- [ ] Descrição em 3 camadas: gancho emocional (1–2 frases) → benefícios em bullets → especificações técnicas
- [ ] Mínimo 4 imagens: hero limpa, contexto de uso, detalhe/close, escala/dimensões (gerar via skill `ai-media-studio` quando faltar)
- [ ] Preço com âncora (compare-at price) quando houver margem
- [ ] Coleção(ões) corretas + tags consistentes
- [ ] SEO: handle limpo, meta title ≤ 60 chars, meta description ≤ 155 chars

## Rotinas de crescimento (executáveis sob demanda)
### Diagnóstico rápido da loja
1. `get-shop-info` → contexto geral
2. ShopifyQL: vendas últimos 30d vs 30d anteriores, top 10 produtos por receita, pedidos por dia
3. `get-inventory-levels` dos top sellers → risco de ruptura
4. Entregar: 3 números-chave + 3 ações priorizadas por impacto

### Campanha de desconto que não destrói margem
- Desconto segmentado > desconto geral: código específico por campanha (`create-discount`) para medir atribuição
- Sempre definir: objetivo (recuperar carrinho? liquidar estoque? primeira compra?), duração curta com prazo real, e produto-alvo
- Cruzar com estoque antes: nunca promover produto com estoque baixo

### Merchandising de coleções
- Coleções por intenção de compra (ex.: "Presentes até R$100", "Mais vendidos"), não só por categoria
- Ordenar produtos da coleção por conversão, não alfabeticamente

## Ponte com conteúdo
Produtos top de receita ou margem são os candidatos prioritários para criativos em vídeo — ver skill `content-to-commerce` para transformar produto em anúncio/short que vende.
