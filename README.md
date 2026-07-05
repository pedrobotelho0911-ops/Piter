# Piter Finanças

Aplicativo web de organização financeira pessoal: cadastro rápido de contas, receitas,
despesas, dívidas e investimentos, com um dashboard visual e uma ilustração animada
("boneco nas ondas") que reflete a saúde financeira do usuário em tempo real.

Tudo roda 100% no navegador — os dados ficam salvos no `localStorage`, sem backend.

## Comandos

```console
npm install
npm run dev       # ambiente de desenvolvimento
npm run build     # build de produção (dist/)
npm run preview   # servir o build de produção
npm run lint      # eslint
```

## Stack

- React + TypeScript + Vite
- Recharts (gráficos de pizza, barra e linha)
- SVG + `requestAnimationFrame` para a animação das ondas (sem bibliotecas de animação)
- Persistência local via `localStorage`

## Como o score funciona

O "score financeiro" (0 a 100) combina o fluxo de caixa mensal (receitas − despesas)
com o quanto as dívidas comprometem o patrimônio (contas + investimentos). O status
(vermelho/amarelo/verde) e a ilustração das ondas — amplitude, velocidade, cor da água
e proporção de tempo submerso do boneco — são derivados automaticamente desse score.
