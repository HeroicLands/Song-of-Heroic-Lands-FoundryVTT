---
aliases: []
name:
  full: Testing
  aliases: []
id: N9XBbIadREP4tBDs
slug: testing
type: doc
package: sohl
category: dev-docs
folder: null
---

# Testing

See also: [Architecture Overview](../concepts/architecture.md), [Extension Points](./extension-points.md)

SoHL uses **test-driven development (TDD)**. Tests are written before the code they verify, so every feature, bug fix, or refactor starts with a clear specification and regressions are caught immediately.

## Two kinds of tests

SoHL has two complementary test suites with very different scope and cadence:

|                  | **Unit tests (vitest)**                                                                                           | **Integration tests (Cypress)**                                                                                                              |
| ---------------- | ----------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| **Scope**        | The Foundry-free **logic layer** — Logic classes and domain objects, in Node                                      | The **running system** in a real Foundry instance — sheets, hooks, documents, the full client                                                |
| **Needs**        | Just `npm` (no Foundry, no browser)                                                                               | Foundry (Docker/felddy container) **+ a Foundry license**                                                                                    |
| **When it runs** | **Every CI build** — unit tests (plus the purity smoke test) are part of the build pipeline and gate every change | **On demand only** — `npm run e2e:full` from scratch, `npm run e2e:fast` to iterate; not part of standard CI (it needs a licensed container) |
| **Speed**        | Seconds                                                                                                           | Minutes (seeds a world, serves it, drives a browser)                                                                                         |
| **Guide**        | [Running tests](#running-tests) and below                                                                         | [Browser end-to-end tests (Cypress)](#browser-end-to-end-tests-cypress) (near the end)                                                       |

The rule of thumb: **push as much logic as possible into the Foundry-free layer so it can be unit-tested**, and reserve the integration suite for what only a live client can prove (sheet and canvas rendering, persistence, cross-document flows). Card and dialog **HTML** is an exception — it renders in Node and is asserted in the unit suite (see [Asserting rendered HTML in unit tests](#asserting-rendered-html-in-unit-tests)). Both suites are written test-first; the Cypress suite doubles as an executable specification (see below).

Everything from here down to _Browser end-to-end tests_ is about the **vitest unit suite**; the Cypress integration suite is documented in its own section at the end.

## Running tests

```bash
npm run test           # Run vitest once
npm run test:watch     # Watch mode (re-runs on file changes)
npm run test:coverage  # Generate coverage report
npm run test:purity    # Logic-layer purity smoke test (see below)
```

Tests live in `tests/` mirroring the `src/` directory structure:

```
tests/
  setup.ts                          # Global test setup (runs before all tests)
  mocks/
    foundry/core/FoundryHelpers.ts  # Mock of the Foundry runtime shim
    logicHarness.ts                 # Builders for Logic instances (no Foundry)
  utils/
    helpers.test.ts                 # Tests for src/utils/helpers.ts
    SimpleRoll.test.ts              # Tests for src/entity/roll/SimpleRoll.ts
  domain/                           # Pure entity/domain objects (src/entity/*)
    modifier/ValueModifier.test.ts
    result/SuccessTestResult.test.ts
    body/BodyPart.test.ts
  item/                             # Item Logic classes (src/document/item/logic/*)
    Action.test.ts
    Skill.test.ts
  actor/Being.test.ts               # Actor Logic classes
  core/                             # Foundry-free core (src/core/logic/*)
    SohlLogic.test.ts
    SohlActionContext.test.ts
  document/                         # Per-document logic (actor, combat, effect, …)
  entity/expr/                      # SafeExpression / expression subsystem
  purity/                           # Logic-layer purity smoke test (see below)
```

> The tree mirrors the source it exercises, but not one-to-one: `tests/domain/`
> holds the pure `src/entity/*` object tests, `tests/item/` and `tests/actor/`
> hold Logic-class tests, and `tests/core/` holds the Foundry-free core tests.

### Where the pack-pipeline tests live

They are **not in this repository**. `@heroiclands/content-build` is developed in
[HeroicLands/content-build](https://github.com/HeroicLands/content-build) and
arrives here as a `devDependency` resolved from the registry — the same way
`sohl-thalorna` and `sohl-kethira-basic` resolve it. Its suite runs in its own
repository, against fixtures it owns.

`vitest.config.ts` therefore declares one project:

| Project  | Suite                | Harness                                   |
| -------- | -------------------- | ----------------------------------------- |
| `system` | `tests/**/*.test.ts` | `tests/setup.ts`, `@src`/`@tests` aliases |

What stays here is `tests/build/`, which asserts the **agreements between this
repository and that package** — the facts neither side can check alone:

- `src-import-severance.test.ts` walks the _installed_ package under
  `node_modules/` and fails if any module imports out of `src/`. Checking what
  npm actually delivered is stronger than checking a working copy: it is the
  only form a consumer ever sees, so a module that is clean in its own
  repository but ships broken is still caught.
- `manifest-package-id.test.ts` checks this repository's shipped manifest
  declares the package id the build addresses every document by (#1503).

Both used to live in the package's own suite, reaching this repository through a
hardcoded `../../..`. That resolved only because the package was vendored under
`packages/`, and it made the package's suite claim a self-containment it did not
have — see HeroicLands/content-build#1.

## TDD workflow

1. **Write the test first.** Define what the code should do via test cases before writing any implementation.
2. **Run the test — it should fail.** This confirms the test is actually checking something.
3. **Write the minimum code** to make the test pass.
4. **Refactor** if needed, keeping tests green.
5. **Repeat** for the next behavior.

For placeholder tests, use `it.todo("description")` to document intended behavior that hasn't been implemented yet. These appear in test output as skipped items, serving as a backlog of work.

## Scope: the logic layer

Unit tests are scoped to the **logic layer** — Logic classes and domain objects. They do not test the Foundry layer (DataModels, Sheets, documents) — with one narrow exception: **chat-card and dialog templates** can be rendered and their HTML asserted in Node (see [Asserting rendered HTML in unit tests](#asserting-rendered-html-in-unit-tests)), since that rendering is plain Handlebars. This is possible because the logic layer is **Foundry-isolated**: it touches Foundry only through the `FoundryHelpers` shim and the `*Data` interfaces on `logic.data` — see [Architecture → Logic layer](../concepts/architecture.md#logic-layer) for the boundary and why it holds.

Tests run in Node via vitest (no browser, no Foundry server) by supplying test doubles for exactly those two channels, plus the `sohl` surface:

- **The `FoundryHelpers` shim is mock-swapped.** vitest aliases `@src/core/FoundryHelpers` to `tests/mocks/foundry/core/FoundryHelpers.ts` (see `vitest.config.ts`). Spy on that mock to stub or assert shim calls — e.g. `vi.spyOn(FoundryHelpersMock, "fvttGetSetting").mockReturnValue("everyone")`. When production needs a new global, add the `fvtt`-prefixed wrapper and its mock counterpart (see [Adding new shim functions](#adding-new-shim-functions)).
- **The Data interfaces are supplied as plain objects.** `tests/mocks/logicHarness.ts` builds a Logic instance from a plain `*Data` object exactly as `SohlDataModel.create()` does — no Foundry required (see [Writing tests for Logic classes](#writing-tests-for-logic-classes)).
- **The `sohl` surface is set up directly, not shimmed.** `globalThis.sohl` (a {@link sohl.core.logic.SohlSystem} instance — `sohl.i18n`, `sohl.log`, `sohl.CONFIG`) is SoHL's own, so `tests/setup.ts` installs a minimal one rather than wrapping it. Rule of thumb: **if SoHL owns it, set it up directly; if Foundry provides it, shim it.**

`tests/setup.ts` also installs **runtime** stubs for the Foundry globals that the _Foundry layer_ builds on at load — notably `foundry.data.fields.*` (DataModels instantiate these schema-field classes in `defineSchema()`) and `game` — so a test can import a Foundry-coupled module without a running Foundry. These are not shimmed because the **logic layer never touches them directly**; only its enclosing Foundry layer does, and that layer uses Foundry directly by design (and isn't unit-tested).

## Adding new shim functions

When production code needs a new Foundry global:

1. Add the wrapper function to `src/core/FoundryHelpers.ts` (use the `fvtt` prefix for the export name, e.g., `fvttGetSetting`)
2. Add the corresponding mock to `tests/mocks/foundry/core/FoundryHelpers.ts`
3. Import directly in the consuming file (e.g., `import { fvttGetSetting } from "@src/core/FoundryHelpers"`)
4. Do NOT shim `sohl.*` access — use it directly (e.g., `sohl.log.uiWarn` instead of wrapping `ui.notifications.warn`)

## Writing tests for Logic classes

Logic classes operate on Data **interfaces** (`SohlItemData` / `SohlActorData`) that Foundry DataModels implement in production. In tests, the harness at `tests/mocks/logicHarness.ts` supplies plain-object implementations of those interfaces, so a Logic instance is constructed exactly the way `SohlDataModel.create()` does — no Foundry required:

```typescript
import {
  makeItemLogic,
  makeMockActor,
  makeAttributeStub,
} from "@tests/mocks/logicHarness";
import { SkillLogic } from "@src/document/item/logic/SkillLogic";

const actor = makeMockActor();
actor.items.set("str1", makeAttributeStub("str", 12));
const logic = makeItemLogic(
  SkillLogic,
  "skill",
  { skillBaseFormula: "sb(attr.str)", masteryLevelBase: 30 },
  { actor },
);
logic.initialize(); // lifecycle is NOT auto-run
expect(logic.masteryLevel.base).toBe(30);
```

Key builders: `makeItemLogic` / `makeActorLogic` (construct logic + wire back-references), `makeMockItem` / `makeMockActor` (mock documents; `update`/`getFlag` are `vi.fn()`s), `makeAttributeStub` (actor-embedded attribute satisfying both `SkillBase` and fate lookups), `MockCollection` (Foundry-Collection-like Map). See `tests/item/Skill.test.ts`, `tests/item/Gear.test.ts`, and `tests/core/SohlLogic.test.ts` for worked examples.

Additional patterns:

- **Pure computation** (e.g., `ValueDelta.apply()`, `SimpleRoll.median`) can be tested directly.
- **Shim behavior** — spy on the mock module: `import * as FoundryHelpersMock from "@src/core/FoundryHelpers"; vi.spyOn(FoundryHelpersMock, "fvttGetSetting").mockReturnValue("everyone");`
- **Dice** — three levels, cheapest first. For a roll you can reach, pre-seed the
  instance (`new SimpleRoll({ …, rolls: [5] })` or `.setRolls([5])`), or spy
  `vi.spyOn(SimpleRoll, "fromFormula")` returning a stub. For a roll **buried deep
  in the logic** (a success test's d100, an affliction's critical-failure→infection,
  the combat exchange) that a test can't reach, use the process-wide **forced-value
  queue**: `SimpleRoll.forceValues(5, 100)` seeds die values that `roll()` consumes
  one per die (FIFO) instead of drawing from the seedable generator;
  `SimpleRoll.clearForced()` empties it and `SimpleRoll.forcedRemaining` inspects
  it. Force the **die values**, not a
  total, so `total` / `result` / the Foundry-`Roll` display all derive correctly —
  and because almost every SoHL roll is a single die, that's effectively "one value
  per roll." **A leftover forced value leaks into the next roll**, so always
  `clearForced()` in an `afterEach`. This is the same seam e2e uses (via
  `sohl.entity.roll.SimpleRoll`) to drive RNG-gated outcomes — see
  `cypress/e2e/deterministic-dice.cy.js`.
- **Whole-stream reproducibility** — for reproducing a _sequence_ of draws (dice
  **and** non-dice: hit location, `weightedRandom`, `rand()`) rather than forcing
  one value, seed a {@link sohl.entity.random.Rng}. In vitest, inject a per-test
  instance (`roll.roll(createRng("test-name"))`, `getRandomLocation(target,
createRng(...))`) — isolated and order-independent. In e2e, re-seed the shared
  singleton through the window (`win.sohl.random.seed("suite-01")`). Forced values
  still win over a seeded generator. See [Randomness](../reference/randomness.md),
  `tests/domain/random/Rng.test.ts`, and `cypress/e2e/seedable-random.cy.js`.
- **Unimplemented intrinsic executors** — `SohlAction` throws at construction when an INTRINSIC executor names a missing method; while an executor is pending, filter it from `defineIntrinsicActions` with a spy and leave an `it.todo` naming it.
- **Complex integration tests** — use `it.todo()` placeholders to document what should be tested once more infrastructure is available.

## Logic-layer purity smoke test

`npm run test:purity` (part of `build:noci`) runs `tests/purity/logic-imports.purity.ts` under `vitest.purity.config.ts` — a config with **no** `tests/setup.ts`, so no Foundry global stubs exist. It dynamically imports every module in the Foundry-free zones (`src/document/*/logic/`, `src/entity/`, the pure core files, `src/apps/logic/ContextMenuEntry.ts`); any module-level `foundry.*`/`game.*` access throws and fails the suite. This is one of the two boundary guards — see [Architecture → Logic layer](../concepts/architecture.md#logic-layer) for what they enforce and the complementary ESLint rule.

## End-to-end example: testing a domain object

Here's a complete example of testing a domain object following the TDD workflow.

### 1. Write the test first

```typescript
// tests/domain/modifier/ValueModifier.test.ts
import { describe, it, expect } from "vitest";
import { ValueModifier } from "@src/entity/modifier/ValueModifier";
import { VALUE_DELTA_OPERATOR } from "@src/utils/constants";

// Minimal mock parent — ValueModifier only checks truthiness
const mockParent = { id: "test", name: "Test" } as any;

function createVM(data: Partial<ValueModifier.Data> = {}): ValueModifier {
  return new ValueModifier(data, { parent: mockParent });
}

describe("ValueModifier", () => {
  it("effective equals base when no deltas", () => {
    const vm = createVM();
    vm.setBase(50);
    expect(vm.effective).toBe(50);
  });

  it("add deltas increase effective", () => {
    const vm = createVM();
    vm.setBase(50);
    // Push a delta manually (the add() method has naming requirements)
    vm.deltas.push({
      name: "SOHL.MOD.test",
      abbrev: "TST",
      op: VALUE_DELTA_OPERATOR.ADD,
      value: "10",
      numValue: 10,
    } as any);
    expect(vm.effective).toBe(60);
  });
});
```

### 2. Run the test — it should fail (or pass if code exists)

```bash
npm run test -- tests/domain/modifier/ValueModifier.test.ts
```

### 3. Key patterns for mocking

**Domain objects with a `beingLogic` parent** (e.g. body structure):

```typescript
const MOCK_BEING_LOGIC = {
  actor: null,
  data: { structure: SAMPLE_DATA },
} as any;

const body = new BodyStructure(SAMPLE_DATA, MOCK_BEING_LOGIC);
```

**Domain objects with a `parent` Logic** (ValueModifier, results):

```typescript
const mockParent = { id: "test", name: "Test" } as any;
const vm = new ValueModifier({}, { parent: mockParent });
```

**Testing randomness** (weighted random, dice):

```typescript
// Statistical approach: run many iterations, check distribution
const counts: Record<string, number> = {};
for (let i = 0; i < 1000; i++) {
  const result = body.getRandomPart();
  counts[result.shortcode] = (counts[result.shortcode] ?? 0) + 1;
}
expect(counts["thorax"]).toBeGreaterThan(counts["head"]); // thorax has higher weight
```

**Testing update payloads** (array helpers):

```typescript
const update = body.addPartUpdate(newPartData);
const parts = update["system.structure.parts"];
expect(parts).toHaveLength(3);
expect(parts[2].shortcode).toBe("larm");
```

### 4. Test file organization

Mirror the `src/` structure in `tests/`:

```
src/entity/body/BodyStructure.ts  →  tests/domain/body/BodyStructure.test.ts
src/entity/modifier/ValueModifier.ts  →  tests/domain/modifier/ValueModifier.test.ts
src/document/item/logic/SkillLogic.ts  →  tests/item/Skill.test.ts
```

## Asserting rendered HTML in unit tests

Unit tests can render real **chat-card and dialog** templates in Node and assert
the emitted **HTML** — so the output of a card- or dialog-building action is
verified for correctness, not just the data handed to a stubbed renderer. This
means much of what used to require the Cypress suite (does the card show the right
buttons? does the dialog build the right `<option>` list?) is now a fast unit
test.

**Why it works without Foundry.** Foundry's `renderTemplate` is a file-loading
wrapper around Handlebars, and SoHL's cards **and** dialogs both render through the
same `toHTMLWithTemplate` / `toHTMLWithContent` shims. So a test can read a `.hbs`
off disk and compile it with the same Handlebars, once the helpers it uses are
registered.

**The harness** — `renderTemplateReal(foundryPath, data)` in
`tests/mocks/hbs-helpers.ts`. It registers, on first use:

- SoHL's **pure** helpers from the shared, Foundry-free
  {@link sohl.utils.registerPureHandlebarsHelpers} — _the exact code system init
  uses_, so rendering never drifts from production;
- Foundry's **logic** helpers (`eq` / `or` / `gt` / `ifThen` / `localize` / …)
  copied faithfully (`localize` reads the real `lang/en.json`); and the pure
  **option-list** builders `selectOptions` / `selectArray`, also faithful;
- **placeholder stubs** for Foundry's DOM/form builders (`formGroup` + `formField`,
  `formInput`, `numberInput`, `editor`, `filePicker`, `radioBoxes`, `rangePicker`)
  and the impure SoHL helpers (`textInput`, `datePicker`, …).

**Two usage patterns:**

```typescript
import { renderTemplateReal } from "@tests/mocks/hbs-helpers";

// (a) Render a template directly and assert its HTML.
const html = renderTemplateReal(
  "systems/sohl/templates/chat/treatment-request-card.hbs",
  { patientName: "Aldric", woundName: "gash", aspect: "edged", severity: 4 },
);
expect(html).toContain("Aldric");

// (b) Drive an action and let its render go through the harness — spy the shim.
import * as FoundryHelpersMock from "@src/core/FoundryHelpers";
vi.spyOn(FoundryHelpersMock, "toHTMLWithTemplate").mockImplementation(((
  tpl: any,
  d: any,
) => Promise.resolve(renderTemplateReal(String(tpl), d))) as any);
const cardHtml = await buildActionCard(spec); // the action's real output
expect(cardHtml).toContain('data-action="performTreatmentTest"');
```

See `tests/document/chat/template-render.test.ts` (direct renders of the
treatment / shock / attack-result cards and the injury / treat-injury dialogs) and
`tests/document/combatant/attack-card.test.ts` (an action rendered through the
harness).

**Fidelity — what to assert:**

- **Cards and dialogs render fully** — text, conditionals, and real `<option>`
  lists. Assert the concrete HTML: button `data-*` attributes, bound values, the
  serialized `data-scope`, escaping.
- **Sheet form builders** (`formGroup` and friends) render as a **binding
  placeholder** (`<span data-helper data-field data-value data-disabled>`), not
  Foundry's real form markup. Assert the _binding_ (field name / value / disabled),
  not the markup — exact form rendering stays an e2e concern.

This does not replace the logic-layer focus above: prefer pushing logic into the
Foundry-free layer. But when an action's job **is** to produce a card or dialog,
assert the HTML it produces here rather than deferring to e2e.

## Browser end-to-end tests (Cypress)

The vitest suites above cover the Foundry-free logic layer. To exercise the
_running_ system in a real Foundry instance — sheets, hooks, documents, the full
client — there is a Cypress suite that seeds a throwaway world, serves it in
Docker, logs in as a GM, and drives the browser. It doubles as an **executable
specification** (integration TDD): specs describe the desired behavior and mark
not-yet-implemented capabilities as skipped RED, so the skip list is a backlog.
See [Writing specs](#writing-specs) and [Gotchas](#gotchas-non-obvious) below
once you can run it.

```bash
npm run e2e:full        # headless: seed → serve → cypress run → tear down
npm run e2e:full:open   # interactive: seed → serve → cypress open (leaves it up)
npm run e2e:fast -- --spec cypress/e2e/<name>.cy.js   # iterate: rebuild → redeploy → run
```

The first two are the **from-scratch** path: they reseed the world and recreate
the container every run, and assume you have already built (`npm run build`).
Once a container is up, reach for `npm run e2e:fast` instead — it rebuilds, redeploys,
cycles the world, waits for it to serve, and runs the specs you name, which is
the loop you actually want while writing a spec or chasing a failure. See
[Fast iteration](#fast-iteration-npm-run-e2efast). Do not hand-roll that sequence:
every step of it has a quiet failure mode, catalogued there. The harness is fully
isolated from your dev/qa worlds:

| Piece                             | Role                                                                                                                              |
| --------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| `FOUNDRYVTT_TEST_DATA`            | A **fresh, empty** data root for tests (set in `.env.local`).                                                                     |
| `utils/seed-test-world.mjs`       | Writes `Data/worlds/sohl-e2e/` — `world.json` + a `users` LevelDB with a GM whose password is known. Idempotent (wiped each run). |
| `container:test` (port 30003)     | Runs the seeded world with `FOUNDRY_WORLD=sohl-e2e` (the `test` stage of the container script).                                   |
| `utils/e2e-run.mjs`               | Recreates the container, waits for the world to **activate**, runs Cypress, tears down.                                           |
| `cypress/` + `cypress.config.mjs` | `cy.login()` authenticates via `/join` with the seeded GM; `cypress/e2e/smoke.cy.js` asserts the world + `sohl` system loaded.    |

Override the seed via `.env.local` (`SOHL_E2E_WORLD_ID`, `SOHL_E2E_GM_NAME`,
`SOHL_E2E_GM_PASSWORD`, …); `cypress.config.mjs` reads the same values so
`cy.login()` stays in sync — a spec just calls `cy.login()`.

🔧 **Foundry license (required).** The `test` container needs its own Foundry
license. A license signed for one installation does **not** transfer to another
(a copied `license.json` won't verify), and each license is **single-seat** (one
running instance at a time). So **dedicate a spare license to the test stage** —
then `dev` and `test` can run at once with no churn:

```bash
# .env.local
FOUNDRYVTT_TEST_DATA=/Users/you/Games/fvtt/data-e2e   # separate, EMPTY dir
FOUNDRYVTT_TEST_LICENSE_KEY=XXXXX-XXXXX-XXXXX-XXXXX-XXXXX-XXXXX  # different key than dev
FOUNDRY_USERNAME=your-foundry-account     # account-wide; lets felddy SIGN the key
FOUNDRY_PASSWORD=your-foundry-password    # (a bare key stays unsigned)
```

`FOUNDRYVTT_<STAGE>_LICENSE_KEY` overrides the license for that stage's
container. A bare key is _applied but unsigned_ ("license requires signature");
`FOUNDRY_USERNAME`/`FOUNDRY_PASSWORD` (account-wide) let felddy fetch a **signed**
license — or sign once in a browser at `http://localhost:30003/setup`. Foundry
binds the signed license to the **container hostname**, so the container script
pins a stable one (`sohl-foundry-<stage>`); the signed `license.json` then
persists across recreates (the seed wipes only the world, not `Config`). Without
that pin Foundry would revert to "requires signature" on every run.

🔧 **The test container's Foundry build is pinned by the repository.**
`DEFAULT_STAGE_VERSIONS` in `utils/foundry-container.mjs` pins the `test` stage,
and the container script passes it to felddy as `FOUNDRY_VERSION`, so a fresh
checkout runs the suite on that exact build with no local configuration. This is
deliberate: the suite is evidence, and left to the floating `:14` tag it would
silently drift to whatever the registry served that week — so "the suite passes"
would name no particular Foundry, and `system.json`'s `compatibility.verified`
would be a claim nobody could re-run.

`FOUNDRYVTT_TEST_DATA` must be a **separate, empty** dir — not your dev/qa root.
If it points at a dir with an existing `Config/license.json`, felddy reuses that
file and ignores the key (the seed also errors out on this to prevent
world/license clobbering).

If instead you **share** one license, stop your `dev`/`qa` container before the
run (single-seat); the harness warns when another `sohl-foundry-*` container is
up. See
[Build & Deployment §6 — running a build in a container](build-and-deployment.md#6-deploying-to-a-foundry-instance)
for the container details and download cache.

### Which build the suite runs on — the two tracks

Foundry is a moving target in both directions, so the suite is run on two, and
they answer different questions.

| Track       | Build                                          | When                                       | Question it answers                                                     |
| ----------- | ---------------------------------------------- | ------------------------------------------ | ----------------------------------------------------------------------- |
| **Default** | `compatibility.minimum` — currently **14.359** | Every routine run; the committed default   | Does the system still work on the oldest Foundry we _claim_ to support? |
| **Sweep**   | The newest Foundry release                     | Roughly weekly, and always before shipping | Has a new Foundry release broken us?                                    |

**The default is the floor, and that is the whole point.** `compatibility.minimum`
is a promise made to every user reading the manifest, and a promise is only
defended if something exercises it. Testing above the floor tests a configuration
no user is promised while leaving the promised one unverified — a regression that
breaks 14.359 but works on the newer build would pass the suite in silence. So
the committed pin tracks the floor, and the newest release is swept instead of
being the default.

**Raising the pin is a decision to raise the supported floor**, not a test-config
tweak. If the floor genuinely cannot be made to work, bump `compatibility.minimum`
in `assets/templates/system.template.json` and move the pin with it, so the claim
and the evidence stay the same number. Do not quietly test on something newer than
the manifest claims.

**Running the sweep:**

```bash
npm run e2e:sweep -- 14.367     # full suite against the newest release
```

That is `FOUNDRYVTT_TEST_VERSION=<build> npm run e2e:full` with the traps removed.
It must be `e2e:full`, not `e2e:fast`: the seeded world is stamped with the build
that created it, and Foundry refuses to auto-launch a world stamped by a different
one (`The requested World … is not available to auto-launch`), so changing build
requires the reseed only the from-scratch path does. The sweep takes the build as
an argument and has **no default** — "the newest release" is not a constant this
repository can hold without rotting, and the product of a sweep is a citable
result ("the full suite passed on 14.367"), which requires naming the build.

A green sweep is what licenses moving `compatibility.verified` to that build. A
red one is the early warning the sweep exists to produce: file it, don't silence
it, and leave `verified` where it was.

**`.env.local` wins over the committed default.** Setting
`FOUNDRYVTT_TEST_VERSION` there overrides the pin for every run, which is how you
sit on a build you are trialling without touching committed configuration.
`resolveVersion()` resolves environment → committed default → `null` (float on
the major tag).

The full precedence is **`e2e:sweep`'s argument → `.env.local` → the committed
default**: the sweep exports `FOUNDRYVTT_TEST_VERSION` into the child process, and
`dotenv` does not overwrite a variable already set, so a sweep still runs on the
build you named even when `.env.local` pins a different one.

**`compatibility.verified` names the newest build the full suite has actually
passed** — never an aspiration, and never a build a run has not completed. It is a
statement of evidence, so it moves only after a green run on that build.

Every spec builds on `cy.login()` (in `cypress/support/commands.js`), which logs
in as the GM and waits for `game.ready`. From there, see [Writing
specs](#writing-specs). Cypress run artifacts (`cypress/videos`,
`cypress/screenshots`) are gitignored; the config, support, and specs are
committed.

🔧 **Cypress version matters.** Foundry v14's client uses ES2024 `Set`
methods (`Set.prototype.difference`), so Cypress must bundle **Chromium ≥ 122**
— otherwise the app throws `.difference is not a function` on load and every
spec fails. Cypress 15 (Electron 37 / Chromium 138) is fine; do not downgrade
below the pinned major. If specs suddenly fail with a `foundry.mjs`
`<static_initializer>` error, suspect an out-of-date bundled browser first.

### Fast iteration: `npm run e2e:fast`

`npm run e2e:full` reseeds the world and recreates the container every run (~a
minute before the first assertion). While iterating, keep the container up and
use the fast loop, which rebuilds, redeploys, cycles the world, waits for it to
serve, and runs Cypress — in that order, as one command:

```bash
npm run e2e:fast -- --spec cypress/e2e/<name>.cy.js   # rebuild everything, run one spec
npm run e2e:fast -- --build=code --spec 'cypress/e2e/skill-*.cy.js'
npm run e2e:fast -- --build=none                      # skip the build; redeploy + re-run
npm run e2e:fast -- --no-run                          # only make the environment current
```

**Flags.** `--build` takes a comma-separated list of `assets`, `code`, `db`,
`system`, `all` (default), or `none`; an unrecognized target fails fast rather
than half-deploying. `--recreate` forces a container recreate, `--no-run` stops
once the environment is current, and `--spec` is a convenience for the Cypress
flag. Anything after a bare `--` passes through to Cypress verbatim, so its own
options (`--browser`, `--headed`, `--reporter`, …) all work.

**What it does, in order** (`utils/e2e-redeploy.mjs`):

1. **Build** the selected targets, always running `code` first. `vite` empties
   `build/stage`, so a later `build:code` would discard whatever the asset and
   pack passes had just written into it.
2. **Deploy** with `push:test`, mirroring `build/stage` into the test data root.
   The mirror is destructive — it deletes anything not in the stage — which is
   why step 1 must leave the stage complete.
3. **Cycle the world**: `recreate` when no container exists or `--recreate` was
   asked for (which naming `system` in `--build` implies), otherwise `restart`.
   Both sweep a stale data-root lock on the way through.
4. **Wait** for `/join` to answer 200, polling every 2s up to 3 minutes, then
   fail with a pointer at the container logs rather than handing Cypress a dead
   port.
5. **Run Cypress** with `ELECTRON_RUN_AS_NODE` stripped from the environment.

The exit code is Cypress's own, so it composes in a script. Steps 1–3 abort the
run on the first failure instead of continuing with a half-built stage.

The loop exists because each step has a quiet failure mode, and hand-rolling it
means meeting them one at a time:

| Step                   | What goes wrong by hand                                                                                                                                                                                                                                                                                                                                                                                                          |
| ---------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Build                  | The container serves the **built** system from `FOUNDRYVTT_TEST_DATA`, not `src/`. Templates need `build:assets`, TypeScript `build:code`, content `build:db`.                                                                                                                                                                                                                                                                   |
| Order                  | `vite` (`build:code`) **empties `build/stage`**, so building it after the asset/pack passes silently discards them, and `push:test` — a destructive mirror — then deletes them from the target.                                                                                                                                                                                                                                  |
| `system.json`          | Read only at world launch, so it needs a container **recreate**, not a restart. Naming `system` in `--build` implies `--recreate`.                                                                                                                                                                                                                                                                                               |
| Restart                | A running Foundry holds the old packs open, so a content change is invisible until the world reopens them.                                                                                                                                                                                                                                                                                                                       |
| Stale lock             | A container that died holding the data-root lock (`docker kill`, a crash, an OOM) leaves `Config/options.json.lock` behind, and Foundry then refuses to boot with "already locked by another process" — naming no owner, so it reads like corruption. Every boot path in `utils/foundry-container.mjs` (`start`, `restart`, `recreate`) now sweeps it, which is safe precisely because each does so while the container is down. |
| Readiness              | `docker start` returns long before Foundry serves; Cypress opens on a dead port and every spec fails for no visible reason. The loop polls `/join` until it answers.                                                                                                                                                                                                                                                             |
| `ELECTRON_RUN_AS_NODE` | VS Code's integrated terminal and most agent/CI shells export it. With it set, Cypress's bundled Electron launches as plain Node, rejects its own flags (`bad option: --no-sandbox`), and dies with a cryptic `MODULE_NOT_FOUND`. The loop strips it, as `npm run e2e:full` already does.                                                                                                                                        |

A direct `npx cypress run` still works when the environment is already current —
just remember the `env -u ELECTRON_RUN_AS_NODE` prefix that the loop applies for
you. After deploying, the next `cy.login()` (which re-visits `/game`) picks up new
code; there is no browser cache to clear.

### Test layout

```
cypress/
  support/
    e2e.js               # loads commands; scoped uncaught:exception allowlist
    commands.js          # cy.login()
    commands/
      documents.js       # createActor/createWorldItem/createItemOn/cleanupWorld/foundry
                         #   + getFromCompendium/dropOnActor/dropOnItem (reuse compendium content)
      import.js          # importActor (Basic Folk), importItem, findPackEntry
      sheets.js          # openSheet/switchTab/closeAllSheets/editSheetField
      scene.js           # createScene/placeToken/placeAdjacentTokens
      combat.js          # createCombatWith/advanceTurn/advanceRound
    logic.js             # actorLogic/itemLogic/hasAction/runAction/prepare
    resolve.js           # resolveDoc(win, ref), toRealm(win, data)
    factories/
      ids.js             # RUN_TAG, tagName, isE2EArtifact (per-run tag isolation)
      actorFactory.js    # ACTOR_KINDS + minimal create payloads
      itemFactory.js     # ITEM_KINDS + payloads (valid required-subType defaults)
      basicFolk.js       # BASIC_FOLK — the starter being in the sohl.actors pack
    itemSheetSuite.js    # parameterized suite shared by every item-sheet spec
  e2e/
    smoke.cy.js, actor-crud.cy.js, being-import.cy.js, scene-tokens.cy.js,
    being-sheet.cy.js, item-sheet-<kind>.cy.js (×16), combat-setup.cy.js,
    effects.cy.js, datamodel-choices.cy.js, …
```

Specs `import` factories/helpers from `../support/**` and call the custom `cy.*`
commands. Repeated shapes (all 16 item sheets) are parameterized — e.g.
`item-sheet-weapongear.cy.js` is one line: `itemSheetSuite("weapongear")`.

### Writing specs

A spec `cy.login()`s once (in `before`), then drives the live client through two
seams:

- **The programmatic surface** via `cy.foundry(fn)` — run any code against the
  game window and get the result back through the command queue. Standard Foundry
  APIs (`Actor.create`, `createEmbeddedDocuments`, `game.packs`) plus each SoHL
  document's Foundry-free `.logic` (computed state, `.actions`). Prefer this for
  setup and state assertions; it reaches what the DOM can't.
- **The DOM** — render a sheet with `cy.openSheet` and assert what only the DOM
  proves: a row renders, a tab activates, a field persists on blur.

```js
describe("gear on a being", () => {
  before(() => cy.login().then(() => cy.cleanupWorld()));
  afterEach(() => cy.cleanupWorld());

  it("adds a weapon and shows it on the combat tab", () => {
    cy.importActor().as("actor"); // Basic Folk, fully populated
    cy.then(function () {
      cy.createItemOn(this.actor, "weapongear", { name: "Dagger" });
      cy.openSheet(this.actor);
      cy.switchTab("combat", "primary");
      cy.get('section.tab[data-tab="combat"]').contains("Dagger");
    });
  });
});
```

Isolation is by **run tag**, not by page reset: `cy.createActor` /
`createWorldItem` / `createScene` prefix each name with a per-run tag, and
`cy.cleanupWorld()` deletes exactly the tagged documents (plus all
combats/messages). Call it in `afterEach`. The seeded world holds only a GM, so
nothing you create leaks between specs.

**Integration-TDD convention.** Where a capability isn't implemented yet, still
write the test and `it.skip(...)` / `describe.skip(...)` it with a
`// RED — blocked by #NN: <gap>` comment (or `itemSheetSuite`'s `persistRed` /
`red` options). CI stays green; the skip list is the capability backlog. Flip it
to `it(...)` when the gap closes.

**Frozen-subset gate (`npm run lint:e2e-red`).** For the Being-centric beta the
whole `cypress/e2e` suite is **in scope** — every spec must pass on the frozen
path — so a RED skip is permitted **only** for a fenced (out-of-beta) feature or
explicitly post-freeze behavior. `utils/check-e2e-red.mjs` (wired into
`npm run lint`, so it gates every build) enforces this: every `it.skip` /
`describe.skip` must **cite its blocking issue as `(#NN)` in the test title**
(or in the `red` / `persistRed` option value), and that issue must appear in the
script's `FENCED_RED_ALLOWLIST`. A skip citing an unlisted issue — or none — fails
the build as an in-scope spec gone RED; the fix is to make it green, not to
silence it. Fencing a feature is a maintainer decision: add its issue to the
allowlist with a one-line justification. When a fenced feature lands, un-skip its
spec(s) and remove the entry (an unused entry is warned about, keeping the
allowlist honest).

### Consent dialogs are landmines — press the button, or pre-answer it

The [consent model](../concepts/action-cards.md) means SoHL constantly surfaces
**offer / confirm dialogs** ("Set a reminder to perform the healing check in 5
days?", "Delete this container?"). In a headless Cypress run a `dialog()` /
`DialogV2` that nobody clicks **blocks the spec** — the flow never resolves and the
test hangs until timeout. This is the single most common way adding a new offer
breaks the suite: any spec that drives a seam which now pops a dialog will stop
dead. **Whenever you add an offer dialog behind a human trigger, grep
`cypress/e2e` for the specs that hit that seam and make each one answer it.**

There are two ways to answer, and the choice should model intent:

1. **Press the button — for a spec whose subject _is_ the offer.**
   `cy.submitDialog("<action>")` clicks the open dialog's button by its stable
   `data-action` (`"yes"` / `"no"` / `"ok"` / …), through the app instance so it
   works across the modal `<dialog>`. Every SoHL dialog button already carries
   `data-action` (that _is_ the well-known handle — no markup change needed), so
   this is the unambiguous, UI-faithful way to answer, and it exercises the real
   consent flow exactly as a player would.

   Fire the action **without** `skipDialog` so the dialog opens, stash its
   promise, press the button, then **await that promise** before asserting — and
   assert on the **persisted store entry**, not a bare post-create `isScheduled`
   (see the async-armed-queue gotcha below):

   ```js
   cy.foundry((win) => {
     // Perform without skipDialog → the offer dialog opens; stash the promise.
     // Note it is the `*Test` that offers the next occurrence — the `*Check`
     // only posts the card inviting it (see the Check/Test split, #1181).
     win.__perf = wound.logic.executeAction("healingtest", {});
     return null;
   });
   cy.submitDialog("yes"); // model the user: press button[data-action="yes"]
   cy.foundry((win) =>
     win.__perf.then(() => {
       const sys = win.game.actors.get(actorId).items.get(woundId).system;
       // The persisted entry is the reliable fact; isScheduled is safe here
       // too, because executeAction (and its finalize) has now resolved.
       return (sys.scheduledActions || []).filter(
         (e) => e.actionName === "healingCheck",
       ).length;
     }),
   ).should("eq", 1);
   ```

2. **Pre-answer / suppress — for setup, when the dialog is _incidental_.** When you
   just need the effect to exist (a fixture wound), hand the action a context that
   pre-answers the offer so no dialog opens: `skipDialog: true` plus the answer in
   `scope` (e.g. `{ skipDialog: true, scope: { schedule: false } }`), or inline the
   answer in a chat-card button's `data-scope` (`{ …req, schedule: false }`).
   Reserve `skipDialog` for exactly this certain/scripted case (see the
   [prefer-dialog rule](https://www.heroiclands.org/sohl/kb/dev-docs/concepts/action-cards/)) —
   don't reach for it just to skip a click.

Rule of thumb: a spec **about** a consent flow presses the button (so the test
_models what the user now expects_); a spec that merely needs the effect to exist
pre-answers it. Creating a document directly with `createEmbeddedDocuments`
bypasses the action — and its offer — entirely, which is why fixture-style creation
never triggers the dialog.

**Several identical offers in a row — target by content, not "topmost."** One
action can fire more than one offer back-to-back (inflicting a bleeder wound
offers the healing check _then_ the blood-loss advance). Give such offers distinct,
player-meaningful **titles** ("Set a Blood Loss Advance Reminder?"), and in the
spec answer a specific one with `cy.submitDialogMatching(text, action)` — it waits
for the _open_ dialog whose rendered text matches, so it can't press the wrong
twin. Two traps make the naive "topmost open dialog" approach flaky, and both
commands guard against them: `foundry.applications.instances` **retains closed
dialogs** (`rendered === false`) whose stale `.element` still matches by text or
button — so always filter on `app.rendered`; and a raw `cy.get('button[...]')`
DOM wait can match a **leaked button from a prior test** before this test's dialog
renders — so poll `cy.window().should(...)` for a _rendered_ instance instead.

### Gotchas (non-obvious)

These cost real debugging time; they are not apparent from the code.

- **Cross-realm objects.** A plain object literal built in a spec belongs to the
  Cypress bundle's JS realm, not the game window's, so Foundry rejects it
  (`must be constructed with a DataModel or Object`; `mergeObject` throws
  `One of original or other are not Objects`). **Clone any payload into the game
  realm before handing it to Foundry** — `toRealm(win, data)` (a `win.JSON`
  round-trip). The `cy.create*` commands already do this; do it yourself in raw
  `cy.foundry` calls. Likewise never test `x instanceof Map` across the boundary
  — it is always false; duck-type (`typeof x.values === "function"`).
- **`testIsolation` is off** (`cypress.config.mjs`). Specs keep the login and the
  loaded world across their tests; reset _state_ with `cy.cleanupWorld()`, not a
  page reload. Log in once in `before`.
- **Sheet field edits persist via `submitOnChange`, not a save button** —
  Cypress `.type().blur()` is unreliable for it. Use
  `cy.editSheetField(doc, name, value)`, which sets the value and dispatches a
  native `change` on the element **inside the sheet's own element** (a
  document-level `cy.get` can match a detached or duplicated node).
- **Group seeding is async.** `SohlCombat` seeds combatant groups in a
  fire-and-forget hook, so a combatant's `groupId` is not set the instant
  `createEmbeddedDocuments` resolves — poll for it before asserting.
- **Simulating gear drag-and-drop.** To exercise the Being sheet's gear
  drop/sort path (`gear-dragdrop.cy.js`), dispatch a real `drop` on the target
  element inside the live sheet (`actor.sheet.element`), carrying a
  `DataTransfer` built in the game realm (`new win.DataTransfer()`) whose
  `text/plain` payload is the source item's drag data (`{ type: "Item", uuid }`).
  The handler updates asynchronously and the synthetic event does not await it,
  so **poll the item's `system.containerId` / `sort` until it settles** rather
  than asserting immediately.
- **Viewport-dependent accessors are empty headless.** `game.combat` and
  `sohl.currentCombatCombatantLogics` read the _viewed_ combat, which needs a
  canvas — assert on the combat document and each combatant's `.logic` directly.
- **The event queue arms asynchronously — assert the store, not `isScheduled`,
  right after create.** A scheduled action becomes _live_ in the in-memory event
  queue only when the owning document's `finalize()` (or the `ready`-hook net)
  re-arms it from `system.scheduledActions` — which does **not** happen the instant
  `createEmbeddedDocuments` resolves. So `sohl.events.isScheduled(uuid, name)`
  immediately after a create is a race and reads `false` intermittently. The
  **persisted store entry is written synchronously**, so assert on
  `system.scheduledActions.filter(e => e.actionName === name)` for the "arrived
  scheduled" fact, and reserve `isScheduled` for _after_ an awaited action whose own
  `finalize` has run (e.g. right after `executeAction` resolves, where it is
  reliable). Same shape as the drag-drop and group-seeding races: the write is
  synchronous; the derived/in-memory view lags.
- **Benign core render errors.** Foundry's sidebar `CombatTracker` throws an async
  render error in headless runs; `support/e2e.js` keeps a narrow, exact-message
  `uncaught:exception` allowlist for it. Extend that list only for _known_
  environment-specific core errors — never to mask a real failure.
- **Placeable-`Token` rendering is suppressed headless — don't assert on token
  pixels.** Placing a Token used to fire core's canvas render chain
  (`Token.draw` → `TokenRuler.draw`, and the per-tick `_refreshState` refresh)
  against a viewport that never finishes initializing, throwing unhandled
  rejections (`reading 'addChild'`, `reading 'OBJECTS'`) that failed token-placing
  specs nondeterministically (#611). `cy.login()` therefore no-ops the placeable
  `Token`'s `draw` / `applyRenderFlags` after login (`guardHeadlessTokenDraw`) — the
  `TokenDocument` and its `.object` still exist, only the PIXI rendering is skipped.
  Assert on the token **document** and each combatant's `.logic`, never on a
  placeable's rendered state (which is viewport-dependent and empty here anyway).
  This is a source-level guard, deliberately not an `uncaught:exception` allowlist
  entry, so it can't mask a real `addChild` / `OBJECTS` error elsewhere.
- **Region shape constraints are suppressed when no scene is viewed.** A
  **restricted** Region (`restriction.enabled`) makes core flag its scene's shape
  constraints, and the deferred pass picks a designated User with a predicate
  reading `canvas.scene.id` — so wherever nothing is viewed and `canvas.scene` is
  `null`, it throws `reading 'id'` out of a PIXI ticker and fails whichever spec
  is running (#1535). Core defect, not a SoHL one, fixed upstream in 14.367
  (`this.id`); the guard stays while the committed default pins the 14.359 floor.
  `cy.login()` therefore makes both entry points inert when `canvas.scene` is
  nullish (`guardHeadlessRegionShapeConstraints`). Shape constraints are
  perception state for a _viewed_ scene, so nothing here loses coverage — but it
  does mean a spec cannot assert on a Region's `_shapeConstraints`. Again a
  source-level guard, not an allowlist entry: `reading 'id'` is too generic a
  message to allowlist safely, even qualified by a stack frame.
- **Headless does not mean scene-less — the seeded world views one.**
  `utils/seed-test-world.mjs` seeds an **active** default scene (#451, so the
  canvas is ready and the new-user tour never overlays a sheet), and the client
  views it at load, so `canvas.scene` is normally a live Scene. Nor does
  importing content change that: core auto-activates a created scene only when
  the world has no active one, and an Adventure's scenes carry `active: false`
  anyway. So a spec must never assert `canvas.scene` is `null` as a standing
  fact — a #1535 spec did, immediately after importing an adventure, and failed
  on every build (#1661). A spec that needs the no-scene-viewed state has to
  present it, by shadowing `canvas.scene` with an own property for the duration
  (`withNoSceneViewed` in `map-notes.cy.js`, `withViewedScene` in
  `scene-nonpersisted.cy.js`) rather than by relying on the environment.
- **A scene deleted mid-draw throws on 14.367 — the same guard makes it inert.**
  `Canvas##draw` calls `scene.updateRegionShapeConstraints()` as its last step,
  after a long run of awaits, and 14.367 opened that method by throwing
  _"A nonpersisted Document cannot be updated."_ unless `this.persisted`. Since
  `cy.cleanupWorld()` deletes the scenes a spec creates, a draw begun on a tagged
  scene routinely finishes after that scene has left `game.scenes` — the throw
  then escapes as an unhandled rejection and fails whichever spec is running,
  with no SoHL frame on the stack (#1550). A second, independent defect in the
  same method: that scene is live and truthy, merely no longer in its collection,
  so the `canvas.scene` clause above does not catch it. The guard adds
  `persisted === false` to the public entry point, and patches `Level` too — it
  has its own copy of the method (new in 14.367) and throws before delegating to
  the scene. Strict `=== false`, so a build without the getter runs core
  untouched and the pinned floor is unaffected.
- **Don't expect that one to reproduce from the specs a sweep blames.** The
  throw escapes asynchronously and lands on whichever spec runs next, so the
  failing spec names are an artifact of ordering and load: all three the #1550
  sweep named pass when run alone on 14.367 with the guard removed.
  `scene-nonpersisted.cy.js` therefore asserts the condition directly — delete a
  scene, invoke the entry points the draw path uses, require each one the build
  defines to be inert — rather than waiting on the race.
- **Placed tokens are linked — a combatant's `.actor` is the world actor.**
  `cy.placeToken` / `cy.placeAdjacentTokens` create `actorLink: true` tokens, so a
  combatant reads the same world actor a spec prepared with `cy.prepare`, not an
  unprepared synthetic (delta) actor. An unlinked token's synthetic actor is only
  populated as a side-effect of the canvas draw — which is suppressed headless — so
  reading actor-derived combatant state (`computedMove`, `reach`) off it yields
  `null`. Linking keeps those reads deterministic and canvas-independent.

The following are system-authoring facts the suite surfaced — you'll meet them
when a spec touches these areas:

- **A subtype must be declared in `system.json` `documentTypes`, not just
  `CONFIG`.** A data model registered in `CONFIG` under a subtype that
  `documentTypes` doesn't declare is rejected at create (`… is not a valid type`),
  and the document silently falls back to the typeless `base` model with no system
  data. Single-model documents (Scene, Combatant) register their model under
  `base`; multi-subtype documents (Item, ActiveEffect) declare each subtype in
  `documentTypes`.
- **`StringField({ choices })` must be a value-keyed object, not the enum values
  array.** Foundry builds `<option>` values from `Object.entries(choices)`, so an
  array yields index option values (`0,1,2,…`); the select then submits an invalid
  choice and the whole form update is rejected. Enums built with `defineType`
  expose a value-keyed `choices` map for exactly this.
- **A discriminated `TypedSchemaField`** (e.g. a combat technique's `strikeMode`)
  stores flat as `{ type, …fields }`. `formGroup` resolves its sub-fields under
  the type segment (`system.strikeMode.melee.name`), which does not match storage
  (`system.strikeMode.name`) — those edits silently drop. Edit at the flat
  `system.<field>.<sub>` path, with a hidden `type` input so the discriminated
  update validates.
- **Updating one element of an array field by index corrupts the whole array.**
  `update({ "system.…parts.2.field": value })` makes Foundry rebuild the array
  from a sparse map, truncating and default-filling every other element. Write
  the _complete_ array back instead (see
  [Runtime Contracts → Updating array fields](../reference/runtime-contracts.md#updating-array-fields-write-the-whole-array-never-an-element-by-index)).
  Note a valid field value is needed to trigger it — an invalid one is dropped and
  the update no-ops, so placeholder-id tests hide the bug.
