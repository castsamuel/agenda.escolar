# Agenda Escolar

Agenda escolar pessoal com autenticaÃ§Ã£o, banco SQLite e calendÃ¡rio interativo para deveres, trabalhos, provas e eventos.

## Arquitetura

```
agenda-escolar/
â”œâ”€â”€ backend/
â”‚   â”œâ”€â”€ database/       # conexÃ£o e esquema relacional SQLite
â”‚   â”œâ”€â”€ middleware/     # proteÃ§Ã£o das rotas autenticadas
â”‚   â”œâ”€â”€ routes/         # autenticaÃ§Ã£o e API de dados
â”‚   â””â”€â”€ server.js       # servidor Express
â”œâ”€â”€ frontend/
â”‚   â”œâ”€â”€ css/style.css   # interface responsiva e temas
â”‚   â”œâ”€â”€ js/app.js       # calendÃ¡rio e interaÃ§Ãµes
â”‚   â””â”€â”€ index.html
â””â”€â”€ package.json
```

## Como executar

1. Instale o Node.js 20 ou mais recente.
2. Na pasta do projeto, rode `npm install`.
3. Rode `npm start`.
4. Abra `http://localhost:3000` no navegador.

No primeiro acesso, crie a conta. A senha Ã© armazenada com hash bcrypt. O SQLite Ã© criado automaticamente em `backend/database/agenda-escolar.db` e nÃ£o precisa de instalaÃ§Ã£o adicional.

## Recursos implementados

- Primeiro acesso, login, logout, sessÃ£o segura e senha com hash.
- Escolas e matÃ©rias persistentes vinculadas Ã  conta.
- Cadastro, ediÃ§Ã£o e exclusÃ£o de deveres, trabalhos, provas e eventos.
- CalendÃ¡rio mensal, semanal e diÃ¡rio; botÃµes anterior, prÃ³ximo e Hoje.
- Filtros por tipo e matÃ©ria; modal de detalhes e status/prioridade.
- PrÃ³ximos prazos atualizados a partir dos dados cadastrados.
- IdentificaÃ§Ã£o visual por tipo, concluÃ­dos e prazos atrasados.
- Tema claro/escuro e interface adaptada para celular.

