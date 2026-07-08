# Rotina

Rastreador de hábitos e rotina diária, gamificado, em tema escuro neon. Construído como PWA
instalável no celular, 100% offline, sem backend próprio — na mesma arquitetura do Piter
(Vite + React + TypeScript + TailwindCSS + localStorage).

## Telas

- **Hoje** — rastreador do mês em grade (hábitos × dias, agrupados por semana), com marcação em
  1 toque, navegação entre meses (meses passados são só leitura), resumo do dia com sparkline dos
  últimos 14 dias, humor, motivação e observação livre.
- **Progresso** — painel mensal de gamificação: % geral do mês, ranking de hábitos por conclusão
  da meta e destaque dourado + troféu pra meta batida.
- **Ajustes** — CRUD completo de hábitos (emoji, meta mensal, cor de destaque, campos extras,
  reordenação por arrastar, arquivar/excluir), preferências dos blocos de humor/motivação e
  configuração do backup.

## Backup (GitHub Gist)

O localStorage é a fonte da verdade; o Gist é só cópia de segurança:

- Backup automático com debounce de 5 s após qualquer mudança relevante.
- Um único Gist **privado** com o arquivo `dados.json` (`versao_schema` incluída pra migrações).
- O token (permissão só de `gist`) fica salvo apenas no aparelho e só fala com `api.github.com`.
- Em outro aparelho, colar o mesmo token reencontra o backup (descrição fixa `rotina-app-backup`)
  e oferece restaurar. Não é sincronização em tempo real — é backup/restauração sob demanda.
- Sem internet ou com erro de API o app segue funcionando e marca o status como pendente/erro.

## Desenvolvimento

```bash
npm install
npm run dev      # desenvolvimento
npm run build    # typecheck + build de produção em dist/
npm run preview  # serve o build (em /Piter/rotina/)
npm run lint     # eslint
npm run icons    # regenera os ícones PNG do PWA (scripts/generate-icons.mjs)
```

## Deploy

O GitHub Pages publica um site só por repositório, então o Rotina convive com o Piter Finanças
no mesmo domínio, em pastas diferentes:

- `pedrobotelho0911-ops.github.io/Piter/` → Piter Finanças
- `pedrobotelho0911-ops.github.io/Piter/rotina/` → Rotina (base `/Piter/rotina/` no `vite.config.ts`)

O workflow `deploy-pages.yml` faz checkout dos dois branches, builda os dois apps e publica
os dois juntos — dispara automaticamente a cada push em qualquer um dos dois branches, ou
manualmente (Actions → "Deploy Piter apps to GitHub Pages" → Run workflow). Ele existe como uma
cópia idêntica nas duas branches (o GitHub só dispara o gatilho `push` usando a versão do
workflow presente na branch que recebeu o push) — ao editar o workflow, replique a mudança na
outra branch também.

## Estrutura

```
src/
  types.ts               # modelo de dados (Habito, RegistroDiario, backup, uid)
  lib/
    datas.ts             # datas locais, semanas do mês, últimos N dias
    armazenamento.ts     # camada de leitura/escrita do localStorage
    registros.ts         # consultas (concluído no dia, % do dia, dias no mês)
    gist.ts              # cliente da API de Gists (criar, atualizar, procurar, ler)
  store/AppContext.tsx   # estado global + persistência + sync automático do backup
  screens/               # Hoje, Progresso, Ajustes
  components/            # Modal, TabBar, Sparkline, seletores, formulários, backup
  hooks/useLongPress.ts  # menu rápido por toque longo
public/                  # manifest, service worker e ícones do PWA
scripts/generate-icons.mjs
```
