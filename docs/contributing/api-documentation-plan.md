# API Documentation Coverage Plan — Result, Modifier, and SohlActor

Working plan for adding TSDoc coverage to a high-value subset of the public API so external developers (people writing code _against_ SoHL, not SoHL maintainers) get complete, accurate reference docs.

`excludeNotDocumented` stays **off** for the entire effort — usable API must remain visible while coverage is incomplete. Turning it on is explicitly out of scope here and is a later decision once coverage is high.

## Scope

Twelve in-scope files (the combat result types, the modifier types, and the actor document), plus one file triaged to `@internal`. The "undocumented" column is TypeDoc's own `validation.notDocumented` count per file — the real surface (methods, properties, accessors, and type members), and the number each batch drives to zero.

| Area | File | undocumented | priority |
|---|---|---:|---|
| Modifier | `domain/modifier/ValueModifier.ts` | 141 | **severe** |
| Result | `domain/result/SuccessTestResult.ts` | 135 | **severe** |
| Actor | `document/actor/foundry/SohlActor.ts` | 108 | **large** |
| Result | `domain/result/TestResult.ts` | 84 | high (base class) |
| Result | `domain/result/OpposedTestResult.ts` | 47 | high |
| Modifier | `domain/modifier/MasteryLevelModifier.ts` | 45 | high |
| Modifier | `domain/modifier/ImpactModifier.ts` | 11 | medium |
| Result | `domain/result/AttackResult.ts` | 10 | medium |
| Result | `domain/result/CombatResult.ts` | 9 | low (extend) |
| Result | `domain/result/ImpactResult.ts` | 8 | low (extend) |
| Result | `domain/result/DefendResult.ts` | 7 | medium |
| Modifier | `domain/modifier/CombatModifier.ts` | 3 | low |

Triaged out (not public API): `utils/ai/AIExecutionResult.ts` → add an `@internal` tag so it drops from the docs and the backlog rather than receiving fabricated public docs.

**In-scope total: 623 undocumented symbols** (result 300, modifier 200, SohlActor 108). Note `TestResult` is a base type, so documenting it also benefits its subclasses — worth doing early. (For reference, the whole codebase reports 4,282, of which ~1,811 are noise from TypeDoc expanding anonymous config-object literals — `DEFAULT_OPTIONS.__type.*` — in `apps/`; the in-scope files have none of that inflation, so their counts are all real API.) _Re-measured 2026-06-07 and unchanged from the original baseline — adding the `override` markers did not affect the undocumented counts._

## Principles

- **House style.** Match the existing TSDoc conventions already in the codebase: `@param`, `@returns`, `@remarks`, `@typeParam`, `@throws`, `@example`. Normalize the one stray singular `@return` to `@returns` when encountered.
- **Accuracy over filler.** Read the implementation (and its tests) before documenting. A confidently wrong comment is worse than none for a consumer who will trust it. Where intent is genuinely unclear, flag it for Tom with a `// TODO(doc):` note rather than guessing.
- **Public vs internal triage.** For each undocumented exported symbol, decide _public_ (document it) or _internal_ (tag `@internal`). Internal-but-exported plumbing should be tagged, not described.
- **Comments only — no logic changes.** This effort adds/extends doc comments. It must not touch runtime behavior, signatures, or data fields. Preserve existing docs; extend rather than rewrite.
- **Type-level `@remarks`.** Each class/type gets a short `@remarks` explaining its role and where it sits in the lifecycle / who consumes it, not just a one-line summary.
- **Cross-links.** Use `{@link}` between related types (e.g. `CombatResult` ↔ `AttackResult` ↔ `DefendResult`). Resolving some of the existing 236 unresolved-link warnings is a welcome side effect.

## Override methods

The `override` keyword is **already in place** across the codebase and enforced by `noImplicitOverride` (now enabled in `tsconfig.json`). There is no `override` work left in this effort — it is purely comments-only. The remaining guidance is only about how to _document_ overrides:

- **Inherit the documentation.** For a pure override that does not change the contract, **leave no doc comment** — TypeDoc automatically inherits the superclass's documentation, and (verified) such a member is _not_ flagged by `validation.notDocumented`. So inheriting satisfies the coverage metric without writing anything redundant.
- **Prefer implicit inheritance over `{@inheritDoc}`.** The explicit `{@inheritDoc Target}` tag resolves fragilely across files (it emits "Failed to find … to inherit" warnings when the reference path is off). Default to no comment; only reach for the tag if a specific case needs it.
- **Document only genuine overriding behavior.** When an override _changes or extends_ the base contract (different return semantics, added side effects, narrowed/widened behavior), write a doc comment describing _only what differs_ from the base. In that case the comment is the override-specific documentation, not a restatement of the inherited contract.

## Phases

Each phase is an independently reviewable batch. Pilot first to lock voice and the public/internal line before scaling.

**Phase 0 — Pilot (calibration).** `CombatResult.ts` + `AttackResult.ts`. Both are already partly documented, so this extends rather than invents and lets Tom react to style/depth on a small surface. Stop and review before continuing.

**Phase 1 — Remaining Result types.** `SuccessTestResult.ts` (largest gap, do first), then `OpposedTestResult.ts`, `TestResult.ts`, `DefendResult.ts`, `ImpactResult.ts`.

**Phase 2 — Modifier types.** `ValueModifier.ts` (largest gap), then `MasteryLevelModifier.ts`, `ImpactModifier.ts`, `CombatModifier.ts`.

**Phase 3 — `SohlActor.ts`.** Largest single file (97 members); split into sub-batches by concern (e.g. lifecycle/prepare methods, computed getters, chat-card handlers, embedded-document hooks) so each diff stays reviewable.

Also in Phase 0 or 1: tag `AIExecutionResult.ts` `@internal`.

## Per-batch workflow

1. Read the target file and its test(s) to confirm behavior.
2. Leave pure overrides undocumented so they inherit the base doc (the `override` keyword is already present and enforced); document only overrides that change the contract.
3. Add/extend TSDoc on the remaining public members; tag clearly-internal exports `@internal`.
4. `npm run build:types` — confirms nothing broke (and, with `noImplicitOverride` on, that any newly added overriding members carry the keyword).
5. `npm run docs:prepare && npm run docs:html` — confirm the file's classes render with descriptions and members.
6. Re-run the coverage probe (below) and confirm the count for the touched files trends toward 0.
7. Tom reviews the batch diff; fold corrections back before moving on.

## Verification & tracking

- **Coverage metric.** Undocumented-symbol count from TypeDoc validation (note the warning text is "does not have any documentation", and the file appears in a "defined in ./src/..." clause):

  ```bash
  npx typedoc --options typedoc-html.json --validation.notDocumented \
    --out /tmp/docs-val > /tmp/val.log 2>&1
  grep "does not have any documentation" /tmp/val.log \
    | grep -E 'src/domain/result/|src/domain/modifier/|src/document/actor/foundry/SohlActor\.ts' \
    | grep -v '__type' | wc -l
  ```

  Baseline: **623** (re-measured 2026-06-07; unchanged). Target: **0** for the twelve in-scope files. (`--excludeProtected` is already set in the config, so the probe inherits it.)
- **Build stays green.** `npm run build:types` and `npm run test` must pass after every batch.
- **Rendered spot-check.** Open the generated class pages for the batch and confirm summaries, params, and returns read correctly.
- `excludeNotDocumented` remains **off** throughout.

## Definition of done

- Every public member in the twelve in-scope files has accurate TSDoc with `@param`/`@returns`/`@throws` as applicable.
- Each in-scope class page renders a class-level `@remarks` plus documented members.
- `AIExecutionResult.ts` is tagged `@internal` and absent from the docs.
- The `notDocumented` validation count for the in-scope files is 0.
- Tom has reviewed each phase's diff.
