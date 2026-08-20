<img width="100%" src="https://raw.githubusercontent.com/ronaelmoura/ronaelmoura/main/assets/ronas-motion.svg" alt="Ronael Moura — Full Stack Developer" />

<p align="center">
  <a href="https://ronaelmoura.github.io/"><img src="https://img.shields.io/badge/portfólio-0B1626?style=for-the-badge&logo=googlechrome&logoColor=5FA8E0" alt="Portfólio" /></a>
  <a href="https://ronas-desk.onrender.com/"><img src="https://img.shields.io/badge/ronas_desk-0B1626?style=for-the-badge&logo=react&logoColor=5FA8E0" alt="Demonstração do Ronas Desk" /></a>
  <a href="https://www.ronastech.com.br/"><img src="https://img.shields.io/badge/ronas_tech-0B1626?style=for-the-badge&logo=googlechrome&logoColor=5FA8E0" alt="Ronas Tech" /></a>
  <a href="https://www.linkedin.com/in/ronael-moura"><img src="https://img.shields.io/badge/linkedin-0B1626?style=for-the-badge&logo=linkedin&logoColor=5FA8E0" alt="LinkedIn" /></a>
  <a href="https://raw.githubusercontent.com/ronaelmoura/ronaelmoura/main/assets/curriculo-ronael-moura.pdf"><img src="https://img.shields.io/badge/currículo-0B1626?style=for-the-badge&logo=readdotcv&logoColor=5FA8E0" alt="Currículo em PDF" /></a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/disponível_para_oportunidades-5FA8E0?style=flat-square&labelColor=0B1626" alt="Disponível para oportunidades" />
</p>

## Sobre

Desenvolvedor Full Stack formado pelo SENAI (670 horas) e fundador da Ronas Tech. Construo aplicações completas com React, Node.js, Express e MySQL — não só a interface: API, regras de negócio, banco, autenticação, testes e deploy.

Minha experiência em suporte de TI me ensinou a reproduzir o bug antes de sair reescrevendo tudo, comunicar com clareza e assumir a solução até ela funcionar de verdade — não só no `localhost`.

```javascript
const ronael = {
  stack: ['React', 'Node.js', 'Express', 'MySQL'],
  entrego: ['interface', 'API REST', 'regras de negócio', 'dados', 'testes', 'deploy'],
  agora: 'construindo produto de verdade na Ronas Tech',
  buscando: 'um time que constrói coisas com impacto real',
  bugsConhecidos: 0, // que eu saiba
}
```

## Stack

| Camada | Ferramentas | Uso na prática |
| --- | --- | --- |
| Interface | React 19, Vite, TypeScript | Dashboards e produtos com estado complexo, UI responsiva e modo escuro |
| Serviços | Node.js, Express 5, REST, JWT | APIs com regras de negócio, autenticação e autorização por perfil |
| Dados | MySQL, transações, Zod | Consistência transacional e integridade em operações concorrentes |
| Qualidade | Vitest, GitHub Actions | Testes automatizados e build validado antes de qualquer deploy |
| Entrega | Docker, Nginx, Render, Cloudflare Workers | Deploy containerizado, observável e em produção real |

## Ronas Desk

Plataforma Full Stack de Help Desk publicada em produção — meu case principal. Criei para simular a operação de uma equipe de suporte com segurança, rastreabilidade e indicadores reais de atendimento.

<img width="100%" src="https://raw.githubusercontent.com/ronaelmoura/ronaelmoura/main/assets/terminal-demo.svg" alt="Simulação ilustrativa do fluxo de build, testes e deploy do Ronas Desk" />

<p align="center"><sub>Simulação ilustrativa do fluxo de deploy — não é uma gravação de tela real.</sub></p>

| Funcionalidades | Engenharia | Qualidade |
| --- | --- | --- |
| Clientes, chamados, SLA, relatórios, auditoria, anexos e Portal do Cliente | React 19, Express 5, MySQL, JWT, Docker, Nginx, Render, Aiven TLS e Cloudinary | **122 testes automatizados**, Helmet, rate limit e permissões por perfil |

```mermaid
flowchart LR
  U["Equipe e clientes"] --> F["React 19"]
  F --> A["API REST · Express 5"]
  A --> S["Serviços e regras de negócio"]
  S --> D[("MySQL com TLS")]
  S --> C["Cloudinary · anexos privados"]
```

<p align="center">
  <a href="https://ronas-desk.onrender.com/"><img src="https://img.shields.io/badge/testar_demonstração-5FA8E0?style=flat-square&labelColor=0B1626" alt="Testar demonstração" /></a>
  <a href="https://github.com/ronaelmoura/ronas-desk"><img src="https://img.shields.io/badge/ver_código-0B1626?style=flat-square&logo=github&logoColor=5FA8E0" alt="Ver código" /></a>
  <a href="https://github.com/ronaelmoura/ronas-desk/actions/workflows/ci.yml"><img src="https://img.shields.io/github/actions/workflow/status/ronaelmoura/ronas-desk/ci.yml?branch=main&label=ci&style=flat-square&color=5FA8E0&labelColor=0B1626" alt="Status do CI" /></a>
</p>

## Projetos

| | Projeto | Por que vale abrir |
| :---: | --- | --- |
| 🖥️ | [**Ronas Desk**](https://github.com/ronaelmoura/ronas-desk) · [demo](https://ronas-desk.onrender.com/) | Produto Full Stack em produção: regras de negócio, segurança, testes e deploy. |
| 💰 | [**Nexo — Dashboard Financeiro**](https://github.com/ronaelmoura/nexo-dashboard-financeiro) · [demo](https://ronaelmoura.github.io/nexo-dashboard-financeiro/) | React e TypeScript com gráficos, filtros, modo escuro e layout responsivo. |
| 📦 | [**StockFlow API**](https://github.com/ronaelmoura/stockflow-api) [![CI](https://img.shields.io/github/actions/workflow/status/ronaelmoura/stockflow-api/ci.yml?branch=main&label=ci&style=flat-square&color=5FA8E0&labelColor=0B1626)](https://github.com/ronaelmoura/stockflow-api/actions/workflows/ci.yml) | API de estoque e pedidos com Node.js, Express, MySQL, transações e OpenAPI. |
| ❄️ | [**ClimaZen**](https://github.com/ronaelmoura/climazen-landing-page) · [demo](https://ronaelmoura.github.io/climazen-landing-page/) | Landing page comercial responsiva com simulador de economia e foco em conversão. |
| 🧩 | [**Portfólio**](https://github.com/ronaelmoura/ronaelmoura.github.io) · [demo](https://ronaelmoura.github.io/) | Site autoral com storytelling, laboratório interativo e cases documentados. |

## Atividade

<p align="center">
  <img height="160" src="https://github-readme-stats-eight-theta.vercel.app/api?username=ronaelmoura&show_icons=true&count_private=true&hide_border=true&bg_color=0B1626&title_color=5FA8E0&icon_color=5FA8E0&text_color=C8D8EA&ring_color=5FA8E0" alt="Estatísticas do GitHub" />
  <img height="160" src="https://github-readme-stats-eight-theta.vercel.app/api/top-langs/?username=ronaelmoura&layout=compact&hide_border=true&bg_color=0B1626&title_color=5FA8E0&text_color=C8D8EA&langs_count=8" alt="Linguagens mais usadas" />
</p>

<p align="center">
  <img src="https://streak-stats.demolab.com/?user=ronaelmoura&hide_border=true&background=0B1626&stroke=1B2C42&ring=5FA8E0&fire=8FC4EF&currStreakLabel=5FA8E0&sideLabels=C8D8EA&currStreakNum=E7F1FF&sideNums=C8D8EA&dates=6B7F96" alt="Sequência de contribuições" />
</p>

<img width="100%" src="https://raw.githubusercontent.com/ronaelmoura/ronaelmoura/main/assets/black-pearl-sailing.svg" alt="Pérola Negra navegando" />

## Contato

Se você procura alguém com disposição para entender o problema, aprender rápido e entregar software que funciona de verdade — e não só no ambiente de dev —, vamos conversar.

<p align="center">
  <a href="mailto:ronaelmoura240@gmail.com"><img src="https://img.shields.io/badge/e--mail-5FA8E0?style=for-the-badge&logo=gmail&logoColor=0B1626" alt="Enviar e-mail" /></a>
  <a href="https://www.linkedin.com/in/ronael-moura"><img src="https://img.shields.io/badge/linkedin-0B1626?style=for-the-badge&logo=linkedin&logoColor=5FA8E0" alt="LinkedIn" /></a>
</p>

<img width="100%" src="https://capsule-render.vercel.app/api?type=waving&color=0:5FA8E0,55:0B1626,100:050B14&height=110&section=footer&text=Vamos+construir+algo+que+funciona.&fontSize=20&fontColor=E7F1FF&fontAlignY=68&animation=twinkling" alt="Vamos construir algo que funciona" />
