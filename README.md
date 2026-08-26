# Agenda Escolar

Agenda escolar pessoal com autenticação, banco SQLite e calendário interativo para deveres, trabalhos, provas e eventos.

## Arquitetura

```
agenda-escolar/
├── backend/
│   ├── database/       # conexão e esquema relacional SQLite
│   ├── middleware/     # proteção das rotas autenticadas
│   ├── routes/         # autenticação e API de dados
│   └── server.js       # servidor Express
├── frontend/
│   ├── css/style.css   # interface responsiva e temas
│   ├── js/app.js       # calendário e interações
│   └── index.html
└── package.json
```

## Como executar

1. Instale o Node.js 20 ou mais recente.
2. Na pasta do projeto, rode `npm install`.
3. Rode `npm start`.
4. Abra `http://localhost:3000` no navegador.

No primeiro acesso, crie a conta. A senha é armazenada com hash bcrypt. O SQLite é criado automaticamente em `backend/database/agenda-escolar.db` e não precisa de instalação adicional.

## Recursos implementados

- Primeiro acesso, login, logout, sessão segura e senha com hash.
- Escolas e matérias persistentes vinculadas à conta.
- Cadastro, edição e exclusão de deveres, trabalhos, provas e eventos.
- Calendário mensal, semanal e diário; botões anterior, próximo e Hoje.
- Filtros por tipo e matéria; modal de detalhes e status/prioridade.
- Próximos prazos atualizados a partir dos dados cadastrados.
- Identificação visual por tipo, concluídos e prazos atrasados.
- Tema claro/escuro e interface adaptada para celular.

