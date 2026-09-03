# 📔 Agenda Escolar

Uma agenda escolar digital, moderna e responsiva, para organizar escolas, séries,
matérias, deveres, trabalhos, notas por bimestre e desempenho acadêmico —
funcionando inteiramente no navegador, sem servidor/backend, pronta para o
**GitHub Pages**.

## Funcionalidades

- **Escolas e séries**: cadastre várias escolas, cada uma com suas séries. Os
  dados de matérias, notas, deveres e trabalhos ficam sempre isolados por
  escola/série.
- **Matérias**: nome, professor (opcional) e cor de identificação.
- **Deveres de casa**: título, descrição, prazo e status (Pendente / Concluído /
  Atrasado, com detecção automática de atraso). Busca, filtros por matéria e
  status, ordenação por prazo.
- **Trabalhos**: mesma ideia dos deveres, com data de início, prazo e 4 status
  (Não iniciado / Em andamento / Concluído / Atrasado).
- **Notas por bimestre**: AV1 (até 3 pontos), AV2 (até 5 pontos) e AV3 (até
  2 pontos). O total do bimestre é a **soma direta** dos pontos obtidos —
  `AV1 + AV2 + AV3`, até 10 pontos — e **não** uma média ponderada. Clique
  numa nota para editá-la direto na tabela. Veja o histórico de cada matéria
  nos 4 bimestres num gráfico.
- **Nota mínima configurável**, usada para calcular a situação acadêmica
  (🟢 Aprovado / 🟡 Recuperação / 🔴 Reprovado).
- **Desempenho**: comparação entre os 4 bimestres, evolução da média geral,
  comparação entre matérias, melhor/pior bimestre e quais matérias
  melhoraram ou pioraram.
- **Calendário escolar**: mostra deveres, trabalhos e eventos manuais; clique
  num dia para ver os detalhes.
- **Notificações de prazo**: avisa 1 dia antes de um dever ou trabalho
  vencer (ative em Configurações). Veja as limitações reais na seção
  "Notificações" abaixo.
- **Diário pessoal**: registre acontecimentos com data, sua versão dos
  fatos e o tipo de consequência (ida à coordenação, ocorrência,
  advertência, suspensão...), com anexos (fotos, documentos, prints). Fica
  só no seu aparelho — veja "Privacidade do Diário" abaixo.
- **Dashboard**: resumo do dia a dia — média geral, situação, próximos prazos
  e pendências.
- **Exportar / importar dados** em JSON, para fazer backup ou levar seus dados
  para outro navegador/computador.
- **Responsivo**: barra lateral no computador, navegação inferior no celular.

## Tecnologias

- HTML, CSS e JavaScript puros (ES Modules) — sem framework e sem etapa de
  build, o que torna a publicação no GitHub Pages direta.
- [Chart.js](https://www.chartjs.org/) (via CDN) para os gráficos.
- `localStorage` do navegador para persistência dos dados.
- GitHub Actions para publicar automaticamente no GitHub Pages a cada push.

## Estrutura do projeto

```text
agenda-escolar/
├── index.html                 # ponto de entrada
├── package.json                # apenas script opcional de servidor local
├── src/
│   ├── styles/
│   │   └── main.css            # design system (tema "caderno")
│   └── js/
│       ├── app.js              # shell da aplicação e roteador (hash routing)
│       ├── db.js                # camada de persistência (localStorage)
│       ├── selectors.js         # leituras derivadas do estado (médias, filtros)
│       ├── utils.js             # formatação, validação, toasts, confirmações
│       ├── components/
│       │   ├── modal.js
│       │   ├── charts.js
│       │   └── emptyGuards.js
│       └── pages/
│           ├── dashboard.js
│           ├── schools.js
│           ├── subjects.js
│           ├── homework.js
│           ├── works.js
│           ├── grades.js
│           ├── performance.js
│           ├── calendar.js
│           └── settings.js
└── .github/workflows/deploy.yml  # publica no GitHub Pages a cada push na main
```

## Como executar localmente

Basta abrir o arquivo `index.html` duas vezes (clique duplo) — ele carrega
`src/js/app.bundle.js`, um script único e comum (não é um ES Module), então
funciona direto pelo `file://`, sem precisar de servidor.

Se preferir servir por HTTP mesmo assim (opcional, precisa de
[Node.js](https://nodejs.org)):

```bash
npm start
```

Isso abre o site em `http://localhost:5173`.

### Sobre o `app.bundle.js`

Os arquivos em `src/js/*.js` e `src/js/pages/*.js` e `src/js/components/*.js`
são a versão "fonte", organizada em módulos, para facilitar leitura e
manutenção. O `index.html` carrega, na prática, o `src/js/app.bundle.js`,
que reúne todo esse código num único arquivo sem `import`/`export`. Isso
evita o problema de módulos ES bloqueados por CORS quando o site é aberto
direto do disco (`file://`) e também remove qualquer risco de arquivo
"faltando" ao publicar — é um só arquivo de JavaScript. Se você editar os
arquivos-fonte, peça para eu regenerar o `app.bundle.js` a partir deles.

## Se o site abrir em branco

- Confira no console do navegador (F12 → Console) se aparece algum erro.
- Confirme que a pasta `src/` inteira foi enviada junto — o `index.html`
  sozinho não funciona.
- Se você editou algo e quebrou o `app.bundle.js`, restaure a partir dos
  arquivos-fonte em `src/js/`.

## Como publicar no GitHub Pages

1. Crie um repositório no GitHub (por exemplo, `agenda-escolar`) e envie todo
   este projeto para ele:
   ```bash
   git init
   git add .
   git commit -m "Primeira versão da Agenda Escolar"
   git branch -M main
   git remote add origin https://github.com/SEU-USUARIO/agenda-escolar.git
   git push -u origin main
   ```
2. No GitHub, abra o repositório e vá em **Settings → Pages**.
3. Em **Build and deployment → Source**, selecione **GitHub Actions**.
4. Pronto. O workflow em `.github/workflows/deploy.yml` já está configurado:
   a cada `push` na branch `main`, o GitHub Actions publica o site
   automaticamente. Acompanhe o progresso na aba **Actions** do repositório.
5. Quando o workflow terminar, o link do site aparece em **Settings → Pages**
   (algo como `https://SEU-USUARIO.github.io/agenda-escolar/`).

## Como transformar em APK (app do Android)

O app agora é um **PWA (Progressive Web App)** — tem manifest, ícone e
funciona offline. Duas formas de colocar no celular, da mais simples pra
mais completa:

### Opção 1 — Instalar direto (sem gerar arquivo nenhum)

Depois de publicar no GitHub Pages, abra o link no Chrome do Android e toque
em **⋮ → Adicionar à tela inicial / Instalar app**. Isso cria um ícone na
tela, abre em tela cheia (sem barra do navegador) e funciona offline. Pra
quem só quer usar no seu próprio celular, isso já resolve e não exige nada
técnico.

### Opção 2 — Gerar um arquivo `.apk` de verdade

Eu não consigo compilar um `.apk` aqui neste ambiente (geração de APK exige
o Android SDK + ferramentas de build, e este ambiente não tem acesso à
internet para baixá-las). O caminho mais simples e gratuito, sem escrever
nenhuma linha de código Android, é o **PWABuilder**:

1. Publique o site no GitHub Pages (veja a seção acima).
2. Acesse **pwabuilder.com**, cole a URL do seu site publicado.
3. Ele valida o manifest/ícones (já estão prontos aqui) e gera um pacote
   Android (`.apk` ou `.aab`) pra você baixar.
4. Instale o `.apk` no celular (pode precisar permitir "instalar de fontes
   desconhecidas" nas configurações do Android) ou publique o `.aab` na
   Play Store, se quiser.

Se no futuro você quiser recursos 100% nativos (ex: notificações que
disparam mesmo com o app fechado há dias), o passo seguinte seria embrulhar
o projeto com **Capacitor** — mas isso exige Android Studio instalado no
seu computador; me avise se quiser esse caminho que eu preparo os arquivos
de configuração.

## Notificações de prazo — o que esperar de verdade

O app avisa 1 dia antes de um dever/trabalho vencer, mas com uma limitação
honesta: como não existe nenhum servidor rodando por trás (o app é só
arquivos estáticos), o aviso só dispara enquanto o app está **aberto, ou
foi aberto/usado recentemente** (a checagem roda a cada 30 min com o app
aberto, e também toda vez que você volta pra ele). Não há como garantir,
num site puramente estático, um aviso "às 8h da manhã" com o app fechado há
dias — isso exigiria um serviço rodando na nuvem o tempo todo.

Na prática: abra o app pelo menos uma vez por dia (o ícone na tela inicial
ajuda nisso) e ative as notificações em **Configurações**. Cada aviso só é
enviado uma vez por prazo — se você mudar a data de entrega, um novo aviso
volta a valer pra nova data.

## Diário pessoal — como funciona e privacidade

- Cada registro tem data, título, sua versão dos fatos e o tipo de
  consequência.
- Os anexos (fotos, PDFs, prints) ficam guardados no **IndexedDB** do seu
  navegador — um armazenamento separado do `localStorage`, com mais espaço,
  pensado justamente pra arquivos. Limite de 15MB por arquivo anexado.
- **Nada do Diário é enviado pra qualquer servidor.** Tudo fica só no
  aparelho onde você está usando o app.
- Justamente por ficar só no aparelho: se você trocar de celular, formatar,
  ou limpar os dados do navegador, o Diário (e os anexos) somem — a menos
  que você tenha exportado um backup antes. O botão **Exportar backup
  completo** em Configurações já inclui o Diário e os anexos (convertidos
  para dentro do próprio arquivo `.json`); guarde esse arquivo em lugar
  seguro.

Basta enviar novos commits para a branch `main` (`git push`). O GitHub
Actions detecta o push e publica a nova versão automaticamente — não é
necessário nenhum passo manual adicional.

## Como funciona o armazenamento dos dados

Todos os dados (escolas, séries, matérias, notas, deveres, trabalhos e
eventos) ficam salvos no `localStorage` do seu navegador, no dispositivo em
que você está usando a agenda. Isso significa que:

- Os dados continuam lá mesmo depois de fechar o navegador ou desligar o
  computador.
- Os dados **não são sincronizados automaticamente** entre navegadores ou
  dispositivos diferentes (não há servidor/backend).
- Limpar o cache/dados de navegação do navegador apaga os dados da agenda.

## Como fazer backup dos dados

Vá em **Configurações**:

- **Exportar dados**: baixa um arquivo `.json` com tudo que está salvo.
- **Importar dados**: escolhe um arquivo `.json` exportado anteriormente e
  restaura os dados (substituindo os dados atuais do navegador).

Recomenda-se exportar um backup regularmente e sempre que for trocar de
navegador ou computador.

## Licença

MIT — sinta-se livre para adaptar.
