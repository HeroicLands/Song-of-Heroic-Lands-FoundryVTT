# Testing

See also: [Architecture Overview](../concepts/architecture.md), [Extension Points](./extension-points.md)

SoHL uses **test-driven development (TDD)**. Tests are written before the code they verify, so every feature, bug fix, or refactor starts with a clear specification and regressions are caught immediately.

## Two kinds of tests

SoHL has two complementary test suites with very different scope and cadence:

|                  | **Unit tests (vitest)**                                                                                           | **Integration tests (Cypress)**                                                                                   |
| ---------------- | ----------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| **Scope**        | The Foundry-free **logic layer** — Logic classes and domain objects, in Node                                      | The **running system** in a real Foundry instance — sheets, hooks, documents, the full client                     |
| **Needs**        | Just `npm` (no Foundry, no browser)                                                                               | Foundry (Docker/felddy container) **+ a Foundry license**                                                         |
| **When it runs** | **Every CI build** — unit tests (plus the purity smoke test) are part of the build pipeline and gate every change | **On demand only** — run locally with `npm run test:e2e`; not part of standard CI (it needs a licensed container) |
| **Speed**        | Seconds                                                                                                           | Minutes (seeds a world, serves it, drives a browser)                                                              |
| **Guide**        | [Running tests](#running-tests) and below                                                                         | [Browser end-to-end tests (Cypress)](#browser-end-to-end-tests-cypress) (near the end)                            |

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
    { skillBaseFormula: "@str", masteryLevelBase: 30 },
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
            shortcode: "TST",
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
npm run test:e2e        # headless: seed → serve → cypress run → tear down
npm run test:e2e:open   # interactive: seed → serve → cypress open (leaves it up)
```

Both assume you have already built (`npm run build`). The harness is fully
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

`FOUNDRYVTT_TEST_DATA` must be a **separate, empty** dir — not your dev/qa root.
If it points at a dir with an existing `Config/license.json`, felddy reuses that
file and ignores the key (the seed also errors out on this to prevent
world/license clobbering).

If instead you **share** one license, stop your `dev`/`qa` container before the
run (single-seat); the harness warns when another `sohl-foundry-*` container is
up. See
[Build & Deployment §6 — running a build in a container](build-and-deployment.md#6-deploying-to-a-foundry-instance)
for the container details and download cache.

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

### Fast iteration: the build → deploy cycle

`npm run test:e2e` recreates the container every run (~a minute of setup). While
authoring specs, keep the container up and re-run Cypress directly against it:

```bash
# one-time: bring the container up
FOUNDRY_WORLD=sohl-e2e node utils/foundry-container.mjs test recreate
# wait until the world is active, then re-run at will:
env -u ELECTRON_RUN_AS_NODE npx cypress run --spec cypress/e2e/<name>.cy.js
```

**`env -u ELECTRON_RUN_AS_NODE` is mandatory for a direct `npx cypress` run** if
your shell exports that variable — VS Code's integrated terminal and many
agent/CI shells do. With it set, Cypress's bundled Electron launches as plain
Node, rejects its own flags (`bad option: --no-sandbox`), and dies with a cryptic
`MODULE_NOT_FOUND`. `npm run test:e2e` already strips it in `utils/e2e-run.mjs`,
so only direct `npx cypress` runs need the prefix.

The container serves the **built** system from `FOUNDRYVTT_TEST_DATA`, not your
`src/` — so a source change is only visible after a rebuild **and** `push:test`:

| You changed…                              | Rebuild with           | Then                                             |
| ----------------------------------------- | ---------------------- | ------------------------------------------------ |
| TypeScript (`src/**`)                     | `npm run build:code`   | `npm run push:test`                              |
| Handlebars template (`templates/**`)      | `npm run build:assets` | `npm run push:test`                              |
| `system.json` (`documentTypes`, packs, …) | `npm run build:system` | `npm run push:test` **+ recreate the container** |

`system.json` is read only at world launch, so a `documentTypes` change needs a
recreate: `docker rm -f sohl-foundry-test`, delete any `*.lock` under
`FOUNDRYVTT_TEST_DATA` (a killed container leaves one and the next start refuses
with "directory is already locked"), then `node utils/foundry-container.mjs test
recreate`. After deploying, the next `cy.login()` (which re-visits `/game`) picks
up new code — there is no browser cache to clear.

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
        win.__perf = wound.logic.executeAction("healingCheck", {});
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
   [prefer-dialog rule](https://kb.heroiclands.org/dev/concepts/action-cards/)) —
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
