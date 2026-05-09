# Storybook GenUI 🧩

**Server Generated UI framework** — mobile-first, offline-first, AI-first.

Monorepo integrando Storybook + GraphQL + PWA + GenUI para gerar interfaces a partir de descrições (schemas), não de código fixo.

## Estrutura

```
packages/
├── core/          # Núcleo: providers, hooks, utils
├── ui/            # Shared primitives (Timer, Card, Gauge, etc)
├── gen-ui/        # LLM orchestrator (intenção → schema)
├── server-ui/     # SGUI resolvers + generators
├── graphql/       # Schema GraphQL unificado
├── pwa/           # Service Worker + IndexedDB + Sync
└── emacs-bridge/  # Emacs → SGUI adapter (experimental)
```

## Comece por aqui

```bash
pnpm install
pnpm dev
```

Veja [PLANO_ENGENHARIA_PROMPTS.md](./PLANO_ENGENHARIA_PROMPTS.md) para o plano completo.
