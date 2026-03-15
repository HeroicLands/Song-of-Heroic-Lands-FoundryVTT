# Contributing to Song of Heroic Lands (SoHL)

Thank you for your interest in contributing to SoHL, a Foundry VTT game system. Stability, architectural coherence, and long-term maintainability are critical to this project. Please read this document carefully before submitting changes.

## Governance

- The project is maintained by the repository owner. Architectural decisions remain under maintainer authority.
- All changes must be submitted via Pull Request — no direct commits to protected branches.
- Contributions are welcome, but maintainers reserve the right to decline changes that do not align with the long-term direction of the system.

## License Agreement

By submitting a contribution (code, documentation, or creative content), you certify that:

- You have the legal right to contribute the material.
- You agree that your contribution is licensed under the project's dual-license structure:
    - **GPL-3.0-or-later** for software code
    - **CC-BY-SA-4.0** for documentation and creative content
- Your contribution may be redistributed under those licenses.

Contributors retain copyright to their contributions.

## Prohibited Content

Under no circumstances may copyrighted material from other projects or systems be placed in this repository. This includes, but is not limited to:

- Copyrighted text, verbatim rule descriptions, or tables from any third-party publisher's rulebooks or supplements
- Names, trademarks, or trade dress of **Kelestia Productions Ltd.** or **Columbia Games**
- Art, maps, illustrations, or other creative assets owned by third parties
- Any content whose inclusion would infringe on the intellectual property rights of others

Game mechanics themselves are not copyrightable and may be implemented, but the specific creative expression used to describe them (rulebook text, proprietary terminology, etc.) may not be reproduced.

If you are unsure whether material is permissible, ask before contributing it. Contributions found to contain prohibited content will be removed immediately.

## Getting Started

1. Fork the repository and create a feature branch from `main`.
2. Read `CLAUDE.md` for build commands, architecture overview, and project conventions.
3. Review `docs/concepts/` for architecture and lifecycle documentation.
4. Make your changes, ensuring `npm run build` and `npm run docs` both pass.
5. Submit a Pull Request with a clear description of what changed and why.

## Development Standards

### Small, Focused Changes

Each pull request should address one concern:

- One feature, one bug fix, or one documentation improvement.
- Do not mix refactors with feature changes, include "drive-by cleanups," or submit broad stylistic rewrites.

### Preserve Architecture

Before changing core systems, read `docs/concepts/` and `docs/how-to/extension-points.md`, and follow established patterns. Prefer:

- Subclassing over branching logic
- Adding new Result/Modifier types instead of modifying shared pipelines
- Extending via registries rather than altering base behavior

### Documentation

Pull requests that modify behavior must include corresponding documentation updates:

- Public APIs — update JSDoc comments (these feed TypeDoc generation)
- Extension points — update `docs/how-to/extension-points.md`
- User workflows — update the user guide in `assets/packs/journals/data/user-guide/`

### Backwards Compatibility

Backwards compatibility is critical. Many people use this system for long-running campaigns, and any change that affects the data model can prevent them from upgrading without damaging their worlds. Treat every data model change as high-risk.

**Prohibited without maintainer approval:**

- Renaming, removing, or restructuring existing data fields
- Changing the shape or type of stored data
- Altering the meaning or units of existing values
- Removing or renaming document types or subtypes

**If a data model change is unavoidable, it must:**

- Be discussed with the maintainer and approved before implementation
- Be clearly documented, explaining what changed and why
- Include automatic migration code that detects worlds on the old schema and patches them to the new schema seamlessly on upgrade
- Be tested against real world data to verify that existing campaigns survive the migration without data loss or corruption
- Never require manual intervention from users — migrations must be fully automatic

### Localization

- Never rename existing localization keys in `lang/en.json` — add new keys instead.
- Keep localization files consistent and organized.

### AI-Assisted Contributions

AI tools may be used to assist with contributions, but you are fully responsible for the result. Do not submit unreviewed AI-generated code. Ensure all output maintains architectural consistency and avoids introducing speculative abstractions or unnecessary complexity.

## Validation

Before submitting a PR, run:

```bash
npm run build
npm run docs
```

Both must complete without errors.

## Areas Requiring Maintainer Discussion

Open an issue before working on any of the following. Do not submit unsolicited PRs for these areas:

- Core data model changes
- Combat resolution pipeline changes
- System initialization or registration
- Class registry changes
- Migration logic
- Large refactors or cross-cutting changes

## Welcome Contributions

The following areas are especially welcome and generally safe to contribute to without prior discussion:

- Documentation improvements and clarifications
- JSDoc comment improvements
- User guide enhancements
- Bug fixes with minimal, well-scoped changes
- Isolated UI/UX improvements
- Additional test coverage
- Localization contributions
