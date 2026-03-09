# GitForge AI

> Generate complete, production-ready GitHub repositories from natural language descriptions using Cloudflare Workers AI.

## Architecture

Single Cloudflare Pages deployment with:
- **Frontend**: React 18 + TypeScript + Vite + Tailwind CSS
- **Backend**: Pages Functions (TypeScript)
- **AI**: Workers AI — `@cf/zai-org/glm-4.7-flash`
- **Storage**: R2 (temporary, auto-cleaned)
- **Deploy target**: GitHub via API

## Quick Start

```bash
npm install
npm run dev          # Vite dev server (UI only)
npm run pages:dev    # Full local dev with wrangler
```

## Deployment

```bash
# 1. Create R2 bucket
wrangler r2 bucket create gitforge-temp-projects

# 2. Build and deploy
npm run pages:deploy
```

## wrangler.toml bindings

| Binding          | Type     | Purpose                          |
|------------------|----------|----------------------------------|
| `AI`             | AI       | Workers AI model inference       |
| `PROJECTS_BUCKET`| R2       | Temporary project storage        |

## API Routes

| Method | Path              | Description                  |
|--------|-------------------|------------------------------|
| POST   | /api/generate     | Generate project with AI     |
| GET    | /api/project/:id  | Retrieve stored project      |
| POST   | /api/deploy       | Deploy to GitHub, clean R2   |
