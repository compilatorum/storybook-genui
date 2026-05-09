# 🧩 PLANO DE ENGENHARIA DE PROMPTS — Storybook GenUI

> **Meta:** Framework genérico de integração frontend via Storybook + Node.js + GraphQL + PWA,
> mobile-first, offline-first, AI-first, com Server Generated UI e GenUI.
> Abordagem que generaliza o `ecosystem_workflow.PDF` para QUALQUER ecossistema de projetos.

---

## 📍 0. FILOSOFEMA FUNDANTE

> *« O framework que não se descola dos projetos não é framework — é amarração. O componente que só serve a um contexto não é componente — é resíduo. »*

**Mobile-first** como navalha de Occam do layout: 360px → infinito.
**Offline-first** como primazia do local sobre a rede: SW + IndexedDB + Sync.
**AI-first** como camada de intenção sobre a interface: GenUI gera UI de onde não há.

**Server Generated UI (SGUI):** Backend envia *descrições* de UI (JSON Schema / DSL), frontend *interpreta* e renderiza. Não há código JSX no backend — apenas dados.
**GenUI:** Camada LLM que, dada uma intenção do usuário, gera a descrição SGUI dinamicamente.

---

## ⚠️ 0.1. METACRÍTICA DO PARADIGMA ORIGINAL

| Crítica | Alternativa Melhor |
|---|---|
| Storybook monolítico para N projetos gera conflito de versões | **Module Federation** ou **NPM Workspaces** com pacotes independentes |
| F₁→F₆ sequencial engessa o workflow | **Paralelismo por domínio**: shared + projetos em paralelo, integration ao final |
| 13 Cs é checklist grande demais para manter | **5 Cs essenciais** (Coesão, Conexão, Consistência, Completude, Parcimônia); o resto emerge |
| Steering prompts muito prescritivos | **Prompt constitucional**: define princípios (constituição), não regras; LLM infere a ação correta |
| Projetos fixos (APEX, ONESEED, etc) | **Meta-projeto**: o plano deve servir *qualquer projeto*, com plugin-discovery automático |
| PDF estático | **Documentação viva**: Storybook Docs + auto-extracão de JSDoc |

---

## 🏗️ 1. ARQUITETURA GERAL — TRÊS CAMADAS

```
┌─────────────────────────────────────────────────────┐
│  🧠 CAMADA DE INTENÇÃO (GenUI / LLM)               │
│  Prompt → Intenção → Schema de UI → SGUI            │
├─────────────────────────────────────────────────────┤
│  ⚙️  CAMADA DE GERAÇÃO (Server Generated UI)        │
│  Node.js / GraphQL → JSON Schema → Render Adaptativo │
├─────────────────────────────────────────────────────┤
│  📱  CAMADA DE APRESENTAÇÃO (PWA / Any Framework)    │
│  React / Preact / Lit / Emacs UI → Renderizar Schema │
└─────────────────────────────────────────────────────┘
```

### 🔁 Fluxo Transversal
**AI-first:** Toda UI pode ser descrita → toda UI pode ser gerada por LLM
**Offline-first:** Service Worker cacheia schemas → PWA roda sem rede
**Mobile-first:** Toda renderização testa em 360px antes de qualquer breakpoint

---

## 🧱 2. MONOREPO — ESTRUTURA DE PACOTES

```
storybook-genui/
├── packages/
│   ├── core/                  # Núcleo: decorators, providers, hooks
│   ├── ui/                    # Componentes base (shared primitives)
│   ├── gen-ui/                # Camada GenUI (LLM → schema)
│   ├── server-ui/             # Server Generated UI (GraphQL resolvers)
│   ├── graphql/               # Schema GraphQL unificado
│   ├── pwa/                   # Service Worker, manifest, offline
│   ├── emacs-bridge/          # Bridge Emacs → SGUI (opcional)
│   └── storybook-host/        # Storybook central com Module Federation
├── apps/
│   ├── demo/                  # App demo consumindo todos os pacotes
│   └── playground/            # Sandbox para experimentação
├── tools/
│   ├── cli/                   # CLI para scaffold de componentes
│   └── codemod/               # Codemods para refatoração
├── .storybook/                # Config raiz do Storybook
├── package.json               # Workspaces raiz
└── turbo.json                 # Turborepo (paralelismo)
```

### 📦 Gerenciamento de Estado Geral

| Camada | Tecnologia | Função |
|---|---|---|
| GraphQL Cache | Apollo/Urql Client | Estado de servidor, queries, mutations |
| Estado local | Zustand (atomic) | UI state, modals, toasts (não vamos usar Redux) |
| Estado persistente | Dexie (IndexedDB) | Offline-first: cache local, sync queue |
| Estado de schema | custom store | Schemas SGUI recebidos do servidor |
| Estado de intenção | Zustand + GenUI | Intenção do usuário → ações pendentes |

> **Metacrítica:** Zustand vs Jotai vs Signals (Preact). Zustand vence por simplicidade e DevTools. Alternativa: `nanostores` (menor bundle, sem providers).

### 🔗 Bibliotecas Comuns (Agregadoras)

| Pacote | Função |
|---|---|
| `@storybook-genui/core` | Decorators, providers, hooks genéricos |
| `@storybook-genui/ui` | Shared primitives (Botão, Card, Gauge, Timer, Badge, TagCloud, Timeline) |
| `@storybook-genui/gen-ui` | LLM orchestrator (OpenAI/Anthropic API + fallback local) |
| `@storybook-genui/server-ui` | Resolvers GraphQL que produzem schemas de UI |
| `@storybook-genui/graphql` | Schema SDL unificado |
| `@storybook-genui/pwa` | Service Worker + IndexedDB + Sync Manager |
| `@storybook-genui/emacs-bridge` | Adaptador Emacs → SGUI |

---

## 🎯 3. CAMADA DE INTENÇÃO (GenUI / AI-first)

### Fluxo
```
Usuário → "quero ver o dashboard do time AZUL"
  → LLM parseia intenção
  → Gera { intent: "dashboard", filters: { team: "AZUL" }, target: { role: "coach" } }
  → GraphQL query com intenção
  → Server gera schema SGUI: { type: "Dashboard", children: [...] }
  → PWA renderiza schema
```

### Prompt Constitucional do GenUI
```
CONSTITUTION:
1. Gere UI schema APENAS se a intenção for clara (confiança > 0.7)
2. Prefira componentes existentes do pacote `@storybook-genui/ui`
3. Mobile-first: schema deve ter `layout: "column"` e `breakpoints`
4. Offline-safe: toda ação tem `optimisticUpdate: true`
5. Se não souber gerar, retorne `null` + `reason` — nunca alucine UI
```

---

## ⚙️ 4. CAMADA DE GERAÇÃO (SGUI Server)

### GraphQL Schema (núcleo)

```graphql
type Component {
  id: ID!
  type: String!           # "Card", "Dashboard", "Gauge", "Timer"
  props: JSON!            # Props específicos do componente
  children: [Component!]
  layout: LayoutInput
  context: ContextInput
  offline: OfflinePolicy  # cache, sync, stale-while-revalidate
}

type Query {
  render(intent: IntentInput!): Component!
  schema(componentType: String!): JSON!
}

type Mutation {
  act(intent: IntentInput!, action: ActionInput!): Component!
}
```

### Server Generated UI Flow
1. Cliente envia `intent` via GraphQL
2. Servidor interpreta intenção → mapeia para tipo de componente
3. Servidor retorna `Component` schema (NÃO HTML, NÃO JSX — apenas dados)
4. Cliente renderiza via resolvedor de componentes
5. Offline: SW cacheia schema, replay de mutations na reconexão

### Render Adaptativo (cliente)
```typescript
// Renderizador universal de schema SGUI
function SGUIRenderer({ schema }: { schema: Component }) {
  const ComponentClass = registry.get(schema.type)
  return <ComponentClass {...schema.props}>
    {schema.children?.map(child => <SGUIRenderer schema={child} />)}
  </ComponentClass>
}
```

---

## 📱 5. CAMADA DE APRESENTAÇÃO (PWA)

### Requisitos Offline-first
- **Service Worker** com estratégia stale-while-revalidate para schemas
- **IndexedDB** (via Dexie) para cache de schemas + fila de mutations offline
- **Sync Manager** que reenvia mutations quando online
- **Manifest** PWA com icons 192/512, theme_color, display: standalone

### Viewport Contract
| Breakpoint | Largura | Alvo |
|---|---|---|
| Mobile S | 360px | Obrigatório |
| Mobile L | 414px | Obrigatório |
| Tablet | 768px | Desejável |
| Desktop | 1280px | Opcional |

### PWA Stack
- **Vite** (build) + `vite-plugin-pwa`
- **Workbox** (SW estratégias)
- **Dexie** (IndexedDB wrapper)
- **Apollo Client** com `offware` link

---

## 🧪 6. STORYBOOK HOST — INTEGRAÇÃO DE FRAMEWORKS

### Module Federation + Storybook
```typescript
// .storybook/main.ts
module.exports = {
  stories: ['../packages/*/src/**/*.stories.@(ts|tsx)'],
  addons: [
    '@storybook/addon-viewport',   // mobile-first testing
    '@storybook/addon-designs',     // link schemas
    'storybook-addon-genui',        // preview SGUI schemas
  ],
  framework: { name: '@storybook/react-vite', options: {} },
  refs: {                            // Module Federation para projetos remotos
    'ui': { title: 'UI', url: 'http://localhost:6007' },
    'gen-ui': { title: 'GenUI', url: 'http://localhost:6008' },
  },
}
```

### Por que Module Federation?
- Cada pacote do monorepo pode ter seu próprio Storybook e versão
- O Storybook host agrega todos via `refs`
- Time pode desenvolver um pacote sem impactar os outros
- CI/CD: publica pacotes individualmente

---

## 🧠 7. EMACS COMO SERVER (ALTERNATIVA RADICAL)

### Premissa
> Node.js gera apenas o bundle/dist. **Emacs é o servidor de UI em tempo real.**
> UIs Emacs (tui.el, vui.el, ansi-term, etc) são *transpiladas* para SGUI schemas.

### Arquitetura Emacs → SGUI
```
Emacs (server)                         Node.js (proxy/bridge)              Cliente PWA
┌─────────────────┐    HTTP/Elfeed    ┌──────────────────────┐    GraphQL   ┌──────────┐
│ tui.el frames   │ ────────────────→ │ emacs-bridge         │ ──────────→ │ PWA      │
│ vui.el buffers  │                   │ - parse Emacs output │             │ render   │
│ ansi-term UI    │                   │ - converte para      │             │ SGUI     │
│ org-mode views  │                   │   SGUI schema JSON   │             │ schemas  │
│     ...         │ ←──────────────── │ - actions → Emacs    │ ←────────── │          │
└─────────────────┘   actions/keys    └──────────────────────┘             └──────────┘
```

### Como Funciona
1. **Emacs atende em localhost (porta 8088)** via `make-network-process` ou `elquery`
2. **Frame/Buffer Emacs é serializado** como árvore de propriedades (text, face, keymap, window)
3. **Bridge Node.js** converte essa árvore para SGUI schema (Component type system)
4. **PWA renderiza** a UI Emacs como componentes React (text → `<span>`, face → className, keymap → onClick)
5. **Ações do usuário** no PWA são enviadas de volta → bridge tecla/click → Emacs processa

### Prós ✅
- Toda UI que existe no Emacs (org-mode, magit, dired, etc) vira web app
- Aproveita configuração Emacs existente
- GenUI pode ser Emacs Lisp também (LLM via `llm.el`)
- Zero lógica de negócio no Node — apenas transpilação

### Contras ⚠️ & Mitigações
| Contra | Mitigação |
|---|---|
| Latência: cada ação vai ao Emacs | Cache de schemas comuns no bridge |
| Emacs não escala horizontalmente | Múltiplos Emacs servers em round-robin |
| Dependência de Emacs rodando 24/7 | Docker container ou systemd service |
| Comunicação serial/textual | Protocol buffers no lugar de JSON |
| Complexidade de parsing de text-properties | `vui.el` (Virtual UI) já estrutura em árvore |

### Metacrítica
**Alternativa:** Usar Node.js puro com `react-dom/server` para SSR. Emacs-server é mais *fiel ao espírito do ecossistema* (tudo no Emacs), mas adiciona complexidade de parsing que Node.js não teria. **Recomendação:** implementar Node.js SGUI primeiro, depois adicionar Emacs bridge como camada opcional de integração.

### VUI.el como ponte natural
```
vui.el → JSON tree → Bridge → SGUI → PWA
```
Se `vui.el` (Virtual UI for Emacs) estrutura buffers como árvore de componentes, a conversão é direta:
```
vui `(vbox ((id . "main")
            (child . (button ((id . "btn-1")
                             (text . "Clique aqui")
                             (action . (lambda () (message "oi"))))))))
→ SGUI { type: "VBox", children: [{ type: "Button", props: { text: "Clique aqui", actionId: "btn-1" } }] }
```

---

## 🧩 8. CICLO DE VIDA DO COMPONENTE — F₁→F₆ GENERALIZADO

### F₀ — Descoberta (novo)
- Varre projeto → detecta componentes existentes → classifica (shared vs específico)
- Prompt: `ANALYSE <path> → return: { components, sharedCandidates, redundancies }`

### F₁ — Shared Primitives
- Cria `@storybook-genui/ui` com 6+ primitivas genéricas:
  `Timer | Card | Gauge | Badge | TagCloud | Timeline | Button | Input | Modal | List`
- Cada primitiva: `< 6 props`, sem lógica de negócio, mobile-first

### F₂ — Wrappers de Framework
- Adaptadores para React, Preact, Lit, Svelte, Vue
- `@storybook-genui/bridge-react`, `@storybook-genui/bridge-preact`, etc

### F₃ — SGUI Renderer
- Registro de componentes, renderizador universal, cache de schemas

### F₄ — GenUI (LLM)
- Prompt constitucional, orchestrator, fallback

### F₅ — PWA + Offline
- Service Worker, IndexedDB, Sync, Manifest

### F₆ — Integration View
- Storybook host com Module Federation, demo app funcional

---

## 🔧 9. SETUP INICIAL (UBUNTU PROOT / TERMUX)

### Pré-requisitos
```bash
# Termux
pkg install proot-distro git
proot-distro install ubuntu
proot-distro login ubuntu

# Ubuntu proot
apt update && apt install curl git -y
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.4/install.sh | bash
nvm install 22  # LTS

# Extras
npm install -g pnpm turbo  # monorepo tooling
```

### Criar Projeto
```bash
mkdir -p storybook-genui && cd storybook-genui
pnpm init
pnpm add -D typescript @storybook/cli vite turbo
npx storybook init --builder vite
```

### Estrutura de Workspaces
```json
// package.json raiz
{
  "name": "storybook-genui",
  "private": true,
  "workspaces": ["packages/*", "apps/*", "tools/*"],
  "scripts": {
    "dev": "turbo run dev",
    "build": "turbo run build",
    "storybook": "storybook dev -p 6006",
    "gen": "node tools/cli/scaffold.mjs",
    "lint": "turbo run lint"
  }
}
```

---

## 🧭 10. ROADMAP DE EXECUÇÃO

### Sprint 1 — Fundação 🏗️
- [ ] Monorepo + Turborepo configurado
- [ ] `@storybook-genui/core` com hooks base
- [ ] `@storybook-genui/ui` com 6 primitivas
- [ ] Storybook host com viewport mobile-first
- [ ] PWA scaffold (Vite + SW + Manifest)

### Sprint 2 — Server Generated UI ⚙️
- [ ] Schema GraphQL de componentes
- [ ] `@storybook-genui/server-ui` — resolvers que geram schemas
- [ ] `@storybook-genui/graphql` — schema SDL
- [ ] Renderizador adaptativo no cliente
- [ ] Testes mobile (360, 414, 768)

### Sprint 3 — GenUI + Offline 🧠
- [ ] `@storybook-genui/gen-ui` — orchestrator LLM
- [ ] Prompt constitucional implementado
- [ ] `@storybook-genui/pwa` — SW + IndexedDB + Sync
- [ ] Cache de schemas + mutations offline
- [ ] Demo: gerar dashboard via intenção textual

### Sprint 4 — Emacs Bridge + Integração 🧩
- [ ] `@storybook-genui/emacs-bridge` — parser de árvore Emacs
- [ ] VUI.el → SGUI schema (ou outro formato)
- [ ] Demo: org-mode como SGUI
- [ ] Module Federation funcional
- [ ] Playground interativo

### Sprint 5 — Polimento + Documentação 📖
- [ ] 13 Cs: auto-check via CI
- [ ] Steering prompts finais para OpenCode
- [ ] Documentação viva (Storybook Docs)
- [ ] Publicação NPM dos pacotes

---

## 🧪 11. CHECKLIST DE QUALIDADE (13 Cs GENERALIZADO)

| Critério | Definição | Verificação |
|---|---|---|
| 🎯 Coesão | Cada pacote faz uma coisa | `turbo.json` sem tarefas duplicadas |
| ✂️ Concisão | Schemas < 50 nós de profundidade | Teste de schema complexity |
| 🔗 Conexão | Cross-package mapeado | GraphQL schema tem `@requires` doc |
| 🎨 Coerência | UI tokens consistentes | Teste de regressão visual (Chromatic) |
| 📐 Consistência | Mesmo padrão entre pacotes | ESLint + Prettier + tsconfig base |
| ✅ Completude | mobile + tablet + desktop story | Teste de viewport CI |
| 🔒 Compliance | TypeScript estrito | `tsc --strict` no CI |
| 🪶 Parcimônia | Sem prop drilling | Zustand store < 5 slices |
| 🛠️ Pragmatismo | Roda no Termux/Android | Teste de build no proot |
| 🗂️ Organização | Estrutura de pastas seguida | `turbo.json` enforce |
| 📋 Ordem | Sprints respeitadas | Milestones no GitHub |
| 💫 Fluidez | 60fps em mobile | Lighthouse CI |
| 🧒 Simplicidade | ELI5: criança entende | README sem jargão |

---

## 🎬 12. COMANDO DE SCREEN (STEERING PROMPT MESTRE)

> Use este prompt no OpenCode para iniciar QUALQUER fase:

```
📌 GENUI-STORYBOOK | FASE: [F₀–F₆] | FOCO: [shared|graphql|genui|pwa|emacs|full]
OBJETIVO: [1 frase]
PROJETO ALVO: [qualquer — genérico]
INVARIANTES:
- Mobile-first: default 360px, touch targets 44px+
- Offline-first: SW cacheia schemas, mutations vão para IndexedDB
- AI-first: toda UI gerada passa pelo GenUI orchestrator
- SGUI: backend envia schema JSON, frontend renderiza
- Storybook: toda primitiva tem story com 3 viewports
- TypeScript estrito (strict: true)
- Turborepo: `turbo run dev` para desenvolvimento paralelo
ENTREGUE: código + story + schema (se aplicável) + CONEXOES
```

---

## 📚 A. APÊNDICE — FERRAMENTAS RECOMENDADAS

| Ferramenta | Função |
|---|---|
| Vite | Build tool (rápido, nativo ESM) |
| pnpm | Package manager (disk-efficient, strict) |
| Turborepo | Task orchestration (paralelismo) |
| Apollo Client | GraphQL client com cache |
| Dexie | IndexedDB wrapper (offline) |
| Workbox/Vite-PWA | Service Worker |
| Zustand | State management (atomic, sem boilerplate) |
| Storybook | Catálogo de componentes vivo |
| Chromatic | Visual regression testing |
| GraphQL Codegen | Types from schema |
| ESLint + Prettier | Code quality |

---

## ©️ B. APÊNDICE — ARQUITETURA DE PASTAS (TREE)

```
storybook-genui/
├── packages/
│   ├── core/
│   │   ├── src/
│   │   │   ├── providers/
│   │   │   ├── hooks/
│   │   │   └── utils/
│   │   ├── package.json
│   │   └── tsconfig.json
│   ├── ui/
│   │   ├── src/
│   │   │   ├── primitives/        # Timer, Card, Gauge, Badge, etc
│   │   │   ├── layout/            # VBox, HBox, ZStack, etc
│   │   │   └── index.ts
│   │   ├── package.json
│   │   └── tsconfig.json
│   ├── gen-ui/
│   │   ├── src/
│   │   │   ├── llm/              # OpenAI, Anthropic, local
│   │   │   ├── prompt/           # Prompt constitucional
│   │   │   └── orchestrator.ts
│   │   └── package.json
│   ├── server-ui/
│   │   ├── src/
│   │   │   ├── resolvers/        # GraphQL resolvers
│   │   │   └── generators/       # Component generators
│   │   └── package.json
│   ├── graphql/
│   │   ├── src/
│   │   │   └── schema.graphql    # Schema SDL unificado
│   │   └── package.json
│   ├── pwa/
│   │   ├── src/
│   │   │   ├── sw.ts             # Service Worker
│   │   │   ├── db.ts             # IndexedDB (Dexie)
│   │   │   ├── sync.ts           # Sync Manager
│   │   │   └── manifest.ts
│   │   └── package.json
│   └── emacs-bridge/
│       ├── src/
│       │   ├── parser.ts         # Emacs tree → JSON
│       │   ├── bridge.ts         # HTTP ↔ Emacs
│       │   └── actions.ts        # User actions → Emacs keys
│       └── package.json
├── apps/
│   ├── demo/
│   │   ├── src/
│   │   │   ├── pages/
│   │   │   ├── components/
│   │   │   └── App.tsx
│   │   └── package.json
│   └── playground/
│       ├── src/
│       └── package.json
├── tools/
│   └── cli/
│       └── scaffold.mjs
├── .storybook/
│   ├── main.ts
│   ├── preview.ts
│   └── manager.ts
├── turbo.json
├── package.json
└── pnpm-workspace.yaml
```

---

> **CODA:** O plano que não se curva ao ecossistema não é plano — é delírio.
> O componente que não se curva ao schema não é componente — é redundância.
> A UI que não se curva à intenção não é interface — é ruído.
>
> `Π(F₀→F₆) = SGUI + GenUI + PWA + (Emacs)? = UI que se descreve, se gera e se renderiza — sem amarras.`
