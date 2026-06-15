# Contributing to Song of Heroic Lands (SoHL)

Thank you for your interest in contributing to SoHL, a Foundry VTT game system.
Stability, architectural coherence, and long-term maintainability are critical to
this project — many people run long campaigns on it. All changes are submitted via
Pull Request; architectural decisions remain under maintainer authority.

This page is the **entry point**. It covers what you agree to by contributing, then
points you, in order, to everything you need to make a correct change.

## Before you contribute

### License Agreement

By submitting a contribution (code, documentation, or creative content), you certify
that:

- You have the legal right to contribute the material.
- You agree that your contribution is licensed under the project's dual-license
  structure:
    - **GPL-3.0-or-later** for software code
    - **CC-BY-SA-4.0** for documentation and creative content
- Your contribution may be redistributed under those licenses.

Contributors retain copyright to their contributions.

### Prohibited Content

Under no circumstances may copyrighted material from other projects or systems be
placed in this repository. This includes, but is not limited to:

- Copyrighted text, verbatim rule descriptions, or tables from any third-party
  publisher's rulebooks or supplements
- Names, trademarks, or trade dress of **Kelestia Productions Ltd.** or
  **Columbia Games**
- Art, maps, illustrations, or other creative assets owned by third parties
- Any content whose inclusion would infringe on the intellectual property rights of
  others

Game mechanics themselves are not copyrightable and may be implemented, but the
specific creative expression used to describe them (rulebook text, proprietary
terminology, etc.) may not be reproduced. If you are unsure whether material is
permissible, ask before contributing it. Contributions found to contain prohibited
content will be removed immediately.

## Prerequisites

- **Node.js** (see `engines` in [`package.json`](package.json) for supported
  versions) and **Git**.
- All other tooling (TypeScript, Vite, Sass, Prettier, ESLint, vitest) installs via
  `npm ci` and runs from `node_modules`.
- Optional, for specific workflows: **rsync** (deploying to remote Foundry instances
  via `npm run push:dev` / `push:prod`) and a `GITHUB_TOKEN` in `.env.local` (for
  `npm run deploy:release`).

## Start here

Follow these steps in order — each links the canonical document for that stage:

1. **Set up your environment** — [Getting Started](docs/how-to/getting-started.md):
   fork the repo, create a feature branch from `main`, run `npm ci`, and copy
   `.env.local.example` to `.env.local` (gitignored; one per developer).
2. **Learn the mental model** — [Architecture Overview](docs/concepts/architecture.md):
   the three-layer design and a map of the `src/` tree. Read this before changing
   anything.
3. **Read the standards and workflow** — the **Contributing guide**, which holds the
   rules of development (no cosmetic refactors, the issue-first workflow, branch
   naming, test-driven development, changesets, format-before-commit, what needs
   maintainer discussion, and what's welcome). It is published on the website and
   mirrored in-repo:
    - Website: <https://api.heroiclands.org/latest/documents/Documentation.Contributing.html>
    - In-repo: [docs/contributing/contributing.md](docs/contributing/contributing.md)
    - Maintainer infrastructure: [API Docs Hosting](docs/contributing/api-docs-hosting.md)
4. **Browse the API** — [API Reference](https://api.heroiclands.org/latest):
   generated TypeDoc, grouped to mirror the source (Core / Documents / Domain /
   Utility).
5. **Make your change and open a Pull Request** — keep it small and focused (one
   feature, bug fix, or doc improvement), and ensure both `npm run build` and
   `npm run docs` pass before submitting.
