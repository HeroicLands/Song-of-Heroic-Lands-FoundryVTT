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

The rule of thumb: **push as much logic as possible into the Foundry-free layer so it can be unit-tested**, and reserve the integration suite for what only a live client can prove (rendering, persistence, cross-document flows). Both suites are written test-first; the Cypress suite doubles as an executable specification (see below).

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

Unit tests are scoped to the **logic layer** — Logic classes and domain objects. They do not test the Foundry layer (DataModels, Sheets, documents). This is possible because the logic layer is **Foundry-isolated**: it touches Foundry only through the `FoundryHelpers` shim and the `*Data` interfaces on `logic.data` — see [Architecture → Logic layer](../concepts/architecture.md#logic-layer) for the boundary and why it holds.

Tests run in Node via vitest (no browser, no Foundry server) by supplying test doubles for exactly those two channels, plus the `sohl` surface:

- **The `FoundryHelpers` shim is mock-swapped.** vitest aliases `@src/core/FoundryHelpers` to `tests/mocks/foundry/core/FoundryHelpers.ts` (see `vitest.config.ts`). Spy on that mock to stub or assert shim calls — e.g. `vi.spyOn(FoundryHelpersMock, "fvttGetSetting").mockReturnValue("everyone")`. When production needs a new global, add the `fvtt`-prefixed wrapper and its mock counterpart (see [Adding new shim functions](#adding-new-shim-functions)).
- **The Data interfaces are supplied as plain objects.** `tests/mocks/logicHarness.ts` builds a Logic instance from a plain `*Data` object exactly as `SohlDataModel.create()` does — no Foundry required (see [Writing tests for Logic classes](#writing-tests-for-logic-classes)).
- **The `sohl` surface is set up directly, not shimmed.** `globalThis.sohl` (a {@link SohlSystem} instance — `sohl.i18n`, `sohl.log`, `sohl.CONFIG`) is SoHL's own, so `tests/setup.ts` installs a minimal one rather than wrapping it. Rule of thumb: **if SoHL owns it, set it up directly; if Foundry provides it, shim it.**

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
- **Dice** — `vi.spyOn(SimpleRoll, "fromFormula")` returning a stub roll.
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
    data: { bodyStructure: SAMPLE_DATA },
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
const parts = update["system.bodyStructure.parts"];
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
- **Viewport-dependent accessors are empty headless.** `game.combat` and
  `sohl.currentCombatCombatantLogics` read the _viewed_ combat, which needs a
  canvas — assert on the combat document and each combatant's `.logic` directly.
- **Benign core render errors.** Foundry's sidebar `CombatTracker` throws an async
  render error in headless runs; `support/e2e.js` keeps a narrow, exact-message
  `uncaught:exception` allowlist for it. Extend that list only for _known_
  environment-specific core errors — never to mask a real failure.

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
  stores flat as `{ type, …fields }`. `formField` resolves its sub-fields under
  the type segment (`system.strikeMode.melee.name`), which does not match storage
  (`system.strikeMode.name`) — those edits silently drop. Edit at the flat
  `system.<field>.<sub>` path, with a hidden `type` input so the discriminated
  update validates.
