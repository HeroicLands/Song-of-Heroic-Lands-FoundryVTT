/*
 * This file is part of the Song of Heroic Lands (SoHL) system for Foundry VTT.
 * Copyright (c) 2024-2026 Tom Rodriguez ("Toasty") — <toasty@heroiclands.org>
 *
 * This work is licensed under the GNU General Public License v3.0 (GPLv3).
 * You may copy, modify, and distribute it under the terms of that license.
 *
 * For full terms, see the LICENSE.md file in the project root or visit:
 * https://www.gnu.org/licenses/gpl-3.0.html
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import type { MasteryLevelModifier } from "@src/entity/modifier/MasteryLevelModifier";
// Side-effect import so MasteryLevelModifier self-registers — see the header
// note on why this base class reaches the registry by import, not the global.
import "@src/entity/modifier/MasteryLevelModifier";
import { entity, registerEntity } from "@src/entity/entityRegistry";
import { registerKind } from "@src/utils/kindRegistry";
import type { SohlTokenDocument } from "@src/document/token/foundry/SohlTokenDocument";
import type { SohlContextMenu } from "@src/apps/foundry/SohlContextMenu";
import type { SohlItem } from "@src/document/item/foundry/SohlItem";
import type { SohlItemLogic } from "@src/document/item/logic/SohlItemBaseLogic";
import { SohlSpeaker } from "@src/core/logic/SohlSpeaker";
// `action-card` touches Foundry only through the `FoundryHelpers` shims; the
// path-based boundary rule can't tell it apart from the Foundry-coupled files
// under `document/chat/`, so allow the button-normalizer import.
// eslint-disable-next-line @typescript-eslint/no-restricted-imports
import { toRenderableButtons } from "@src/document/chat/action-card";
import type { ActionCardButton } from "@src/document/chat/action-card";
import { SimpleRoll } from "@src/entity/roll/SimpleRoll";
import { TestResult } from "@src/entity/result/TestResult";
import { SohlEntity } from "@src/entity/SohlEntity";
import { SafeExpression } from "@src/entity/expr/SafeExpression";
import { expressionScopes } from "@src/entity/expr/ExpressionScopeRegistry";
import type { SohlLogic } from "@src/core/logic/SohlLogic";
import { toFilePath, defaultFromJSON, defaultToJSON } from "@src/utils/helpers";
import {
    dialog,
    fvttMergeObject,
    fvttToFoundryRoll,
    fvttLogicFromUuid,
    fvttLogicFromUuidSync,
} from "@src/core/FoundryHelpers";
import {
    MARGINAL_FAILURE,
    CRITICAL_FAILURE,
    MARGINAL_SUCCESS,
    CRITICAL_SUCCESS,
    VALUE_DELTA_INFO,
    SOHL_SPEAKER_SOUND,
    SOHL_SPEAKER_ROLL_MODE,
    SUCCESS_TEST_RESULT_MOVEMENT,
    TEST_TYPE,
    SuccessTestResultMovement,
    SuccessTestResultMovements,
    SuccessTestResultMishaps,
    SohlSpeakerRollModes,
    isSohlSpeakerRollMode,
    isSuccessTestResultMovement,
    speakerRollModeOptions,
    SohlSpeakerRollMode,
    TestType,
} from "@src/utils/constants";
import { SohlTokenDocumentLogic } from "@src/document/token/logic/SohlTokenDocumentLogic";

/*
 * ── Construction indirection: base class (#83) ───────────────────────────────
 * Registered entity classes are constructed through the registry so a variant
 * module can override them. Inside SoHL that means `import { entity }` then
 * `new entity.X(...)`; outside SoHL it is `new sohl.entity.X(...)`.
 *
 * SuccessTestResult is a BASE class of other registered classes (AttackResult,
 * DefendResult), so it imports the registry from the cycle-free leaf
 * `@src/entity/entityRegistry` (never the `registry.ts` barrel, which eagerly
 * loads the subclass tree and would evaluate a subclass's
 * `extends SuccessTestResult` mid-load → `TypeError: Class extends value
 * undefined`). The bare side-effect import above guarantees MasteryLevelModifier
 * self-registers so `entity.MasteryLevelModifier` resolves even in a bare unit
 * test. See the "Entity class registry" section of
 * kb/dev-docs/reference/runtime-contracts.md.
 * ────────────────────────────────────────────────────────────────────────────
 */

/**
 * The fixed ceiling of the **Value Diamond** scale — the quality grade of a
 * Success Value test runs 0-5, so the card draws five diamonds and fills the
 * earned ones (see {@link SuccessTestResult.valueDiamondMarks}).
 */
export const VALUE_DIAMOND_SCALE = 5;

/**
 * Spread an earned Value Diamond count across the fixed
 * {@link VALUE_DIAMOND_SCALE | 0-5 scale} as one entry per diamond — `true`
 * where the diamond was earned. A count outside the scale is clamped rather
 * than overflowing (or truncating) the row.
 *
 * @param earned - The graded count, as resolved from the result-description table.
 * @returns One boolean per diamond on the scale.
 */
export function toValueDiamondMarks(earned: number): boolean[] {
    const n = Math.max(0, Math.min(VALUE_DIAMOND_SCALE, Math.trunc(earned)));
    return Array.from({ length: VALUE_DIAMOND_SCALE }, (_, i) => i < n);
}

/**
 * The result of a **d100 roll-under mastery level test** — the most common
 * resolution mechanic in SoHL.
 *
 * A success test rolls 1d100 against a constrained effective mastery level.
 * The roll determines the **success level** (how far above or below the
 * target), which maps to descriptive outcomes via the test description
 * table.
 *
 * ## Key properties
 *
 * - {@link roll} — the d100 {@link SimpleRoll} (can be pre-set for fate)
 * - {@link masteryLevelModifier} — the ML modifier used for this test
 * - {@link successLevel} — how many points the roll beat/missed the target
 * - {@link isSuccess} / {@link isCritical} — outcome flags
 * - {@link mishaps} — fumble/stumble flags triggered by critical failures
 * - {@link movement} — tactical movement state after the test
 *
 * ## Evaluation flow
 *
 * 1. If no prior roll exists, a new d100 is rolled via {@link SimpleRoll}.
 * 2. Success level = constrained ML − roll result.
 * 3. Critical success/failure checked against last-digit lists.
 *
 * Result text and value diamonds are then derived on read from the description
 * table (see {@link valueDiamonds}); they are not stored on the result.
 *
 * ## Chat output
 *
 * {@link toChat} renders the result using
 * `templates/chat/standard-test-card.hbs` and posts it via the speaker.
 *
 * ## Subclasses
 *
 * - {@link AttackResult} — attacker's roll, with impact dice and aim
 * - {@link DefendResult} — defender's roll with situational modifiers
 */
export class SuccessTestResult extends TestResult {
    private _successLevel: number;
    protected _tokenLogic?: SohlTokenDocumentLogic;
    protected _masteryLevelModifier: MasteryLevelModifier;
    protected _testType: TestType;
    protected _roll: SimpleRoll;
    /**
     * Whether a die was **explicitly supplied** at construction (`data.roll`).
     * When `false`, {@link evaluate} rolls a fresh d100; when `true`, it resolves
     * the supplied die untouched (fate, or the attacker's pre-rolled die
     * reconstructed on the defender's client). Keyed on caller intent, not the
     * die's state, so a fresh test can never be mistaken for a pre-rolled one.
     */
    protected _rollSupplied: boolean;
    /**
     * Whether this test **auto-Critically-Fails** because it requires a body part
     * the actor cannot use (#568). When `true`, {@link evaluate} still casts the
     * die (for display) but short-circuits the outcome to a Critical Failure, and
     * {@link isCritical} reports `true` regardless of the modifier's crit digits.
     */
    protected _autoCriticalFail: boolean;
    protected _movement: SuccessTestResultMovement;
    protected _mishaps: Set<string>;
    protected _canFate: boolean;
    /**
     * Whether this is a **Success Value test** (#848) — a success test whose
     * roll is graded into a Success Value (Index + Modifier) and Value Diamonds
     * via the `resultDescTable`. Drives the card's Success Value / Value Diamonds
     * display. Serialized so a reconstructed result keeps the distinction.
     */
    protected _isSuccessValue: boolean;
    protected _item: SohlItemLogic<any>;
    /** Foundry roll mode (public / private GM / blind / self) used when posting to chat. */
    rollMode: string;
    protected _targetValueFunc: (successLevel: number) => number;
    protected _resultDescTable: SuccessTestResult.LimitedDescription[];

    /**
     * Construct an empty success-test result owned by `parent` — shorthand for
     * `new SuccessTestResult({}, { parent })` (skips the `options.testResult`
     * merge).
     * @param parent - The owning {@link sohl.core.logic.SohlLogic}.
     */
    constructor(parent: SohlLogic<any>);
    /**
     * Constructs a success-test result, seeding state from the given data and
     * options (and from a prior serialized result when one is provided).
     *
     * @param data - Test data; all fields are optional and defaulted. When
     *   `options.testResult` is supplied, its serialized state is merged in
     *   first, so a result can be reconstructed from a prior one (e.g. an
     *   evaluated snapshot crossing clients).
     * @param options - Result options; `options.parent` is required (base
     *   {@link TestResult}). `options.testResult`, `options.mlMod`, and
     *   `options.chatSpeaker` seed the corresponding fields when present.
     */
    constructor(
        data: Partial<SuccessTestResult.Data>,
        options: Partial<SuccessTestResult.Options>,
    );
    /**
     * Implementation backing the constructor overloads: normalizes the
     * `(parent)` shorthand and requires a resolved parent.
     * @param dataOrParent - Test data, or the owning parent Logic (shorthand).
     * @param options - Result options; `options.parent` is required in the data
     *   form.
     * @throws If no `parent` resolves.
     */
    constructor(
        dataOrParent: SohlEntity.DataOrParent<SuccessTestResult.Data> = {},
        options: Partial<SuccessTestResult.Options> = {},
    ) {
        let data = SohlEntity.dataOf<SuccessTestResult.Data>(dataOrParent);
        if (options.testResult) {
            data = fvttMergeObject(options.testResult.toJSON(), data, {
                inplace: false,
            }) as Partial<SuccessTestResult.Data>;
        }
        super(
            data,
            SohlEntity.optionsOf<SuccessTestResult.Options>(
                dataOrParent,
                options,
            ),
        );
        if (options.mlMod)
            this._masteryLevelModifier =
                data.masteryLevelModifier ??
                new entity.MasteryLevelModifier(this.parent);
        // Restore a previously-evaluated success level so a result can cross to
        // another client as a read-only snapshot (e.g. the attacker's
        // AttackResult shown on the defender's card). A fresh test leaves this
        // at MARGINAL_FAILURE and computes it in evaluate(); a re-test on the
        // owning client re-evaluates and overwrites it regardless.
        this._successLevel = data.successLevel ?? MARGINAL_FAILURE;
        if (data.tokenUuid) {
            this._tokenLogic = fvttLogicFromUuidSync<SohlTokenDocumentLogic>(
                data.tokenUuid,
            );
        }
        this._masteryLevelModifier =
            data.masteryLevelModifier ??
            new entity.MasteryLevelModifier(
                {},
                {
                    parent: this.parent,
                },
            );
        // The table rides the wire as data; revive any serialized SafeExpression
        // rows into live expressions owned by this result's parent.
        this._resultDescTable =
            data.resultDescTable ?
                reviveLimitedDescriptionTable(data.resultDescTable, this.parent)
            :   [];
        this.rollMode = data.rollMode || SOHL_SPEAKER_ROLL_MODE.SYSTEM;
        this._testType = data.testType || TEST_TYPE.SUCCESSTEST.id;
        // A die supplied by the caller (`data.roll`) is authoritative and
        // resolved as-is; without one, the roll starts UNROLLED and evaluate()
        // casts it. This intent is recorded now so evaluate() never has to infer
        // "already rolled?" from the die's state (see `_rollSupplied`).
        this._rollSupplied = data.roll !== undefined;
        this._autoCriticalFail = data.autoCriticalFail ?? false;
        this._roll =
            data.roll ??
            new SimpleRoll(
                { numDice: 1, dieFaces: 100, modifier: 0, rolls: [] },
                { parent: this.parent },
            );
        this._movement =
            data.movement || SUCCESS_TEST_RESULT_MOVEMENT.STATIONARY;
        this._mishaps = new Set<string>(data.mishaps || []);
        this._item = this.parent;
        this._canFate =
            (this._item as any).availableFate?.length > 0 && !!data.canFate;
        this._isSuccessValue = !!data.isSuccessValue;
        if (options.chatSpeaker) {
            this._speaker = options.chatSpeaker;
        } else {
            this._speaker = new SohlSpeaker({
                token: this._tokenLogic?.id ?? undefined,
            });
        }
        // Only accept an actual function, supplied locally when this result is
        // built (never through serialization — functions are dropped on the
        // wire). A non-function value, e.g. a string smuggled in via untrusted
        // serialized data, falls back to identity so revived data can never turn
        // into a callable code payload.
        this._targetValueFunc =
            typeof data.targetValueFunc === "function" ?
                data.targetValueFunc
            :   (sl: number) => sl;
    }

    /**
     * Serialize to a plain object satisfying {@link SuccessTestResult.Data}: the
     * inherited {@link TestResult} fields plus the roll, mastery-level modifier,
     * evaluated (raw) success level, and the test's descriptive/config state.
     *
     * @remarks
     * The associated token is persisted by `tokenUuid` (the owning `_item`
     * Logic is re-supplied via `options.parent`, not carried in the payload).
     * The raw `_successLevel` is emitted so an evaluated snapshot survives the
     * trip; the `successLevel` getter normalizes it on read. `_targetValueFunc`
     * is a live function and is not serializable — it defaults back to identity
     * on reconstruction. The derived outcome data (`resultText`, `resultDesc`,
     * `valueDiamonds`) is deliberately **not** emitted — it recomputes on read
     * from the serialized table
     * plus the success level (see the getters and issue #205).
     *
     * Two fields are carried in full as a deliberate exception to the
     * "store only the minimum" corollary of the reference-on-wire rule
     * (see issue #202):
     * - `masteryLevelModifier` carries its complete delta breakdown across the
     *   wire because the receiver renders it verbatim for combat transparency —
     *   `mlMod.chatHtml` (the per-delta name/adjustment breakdown) is shown on
     *   the reconstructed result in `standard-test-card.hbs` and
     *   `opposed-result-card.hbs`. A summarized form would lose that breakdown,
     *   so the full modifier is intentionally serialized.
     * - `resultDescTable` is serialized as data (not a table reference)
     *   because custom, per-result tables are a supported design goal; the
     *   table is the datum the receiver renders against, so it travels with the
     *   result rather than through a registry (see issue #206).
     * @returns The plain-object representation.
     */
    override toJSON(): PlainObject {
        return {
            ...super.toJSON(),
            successLevel: this._successLevel,
            tokenUuid: this._tokenLogic?.uuid,
            masteryLevelModifier: this._masteryLevelModifier.toJSON(),
            resultDescTable: serializeLimitedDescriptionTable(
                this._resultDescTable,
            ),
            rollMode: this.rollMode,
            testType: this._testType,
            roll: this._roll.toJSON(),
            movement: this._movement,
            mishaps: [...this._mishaps],
            canFate: this._canFate,
            isSuccessValue: this._isSuccessValue,
        };
    }

    /**
     * The test's target value — `targetValueFunc(successLevel)`. For a plain
     * success test this is just the success level; success-value tests map it to
     * a quality/quantity outcome used to index the
     * {@link SuccessTestResult.LimitedDescription | description table}.
     */
    get targetValue(): number {
        return this._targetValueFunc(this.successLevel);
    }

    /**
     * Success level clamped to the four-point scale: critical failure (−1),
     * marginal failure (0), marginal success (1), or critical success (2). The
     * raw internal level (which `successLevelMod` can push beyond this range) is
     * normalized here.
     */
    get successLevel(): number {
        const level = this._successLevel;
        if (level <= CRITICAL_FAILURE) {
            return CRITICAL_FAILURE;
        } else if (level >= CRITICAL_SUCCESS) {
            return CRITICAL_SUCCESS;
        } else if (level === MARGINAL_SUCCESS) {
            return MARGINAL_SUCCESS;
        } else {
            return MARGINAL_FAILURE;
        }
    }

    /**
     * Success level **before** the four-point clamp — the stored level with every
     * `successLevelMod` folded in, so it can sit outside −1…2 (a Critical Failure
     * pushed down by −1 reads −2).
     *
     * @remarks
     * Opposed resolution compares this rather than {@link successLevel} because a
     * contest's victory margin has no ceiling: each step between the two levels is
     * one Victory Star, and a modifier that shifts a level widens the margin
     * accordingly. Everything that asks "did it succeed, and how well?" wants the
     * clamped {@link successLevel} / {@link normSuccessLevel} instead.
     */
    get rawSuccessLevel(): number {
        return this._successLevel;
    }

    /**
     * Raise this result's stored success level by `delta` — the **post-roll Fate
     * bump** (#854). This mutates the already-settled outcome: it does **not**
     * re-roll and does **not** re-evaluate. Because the outcome text/stars are
     * derived on read (see {@link resultText} / {@link valueDiamonds}), re-posting
     * the card after a bump re-resolves the description table against the new
     * level automatically.
     *
     * Fate is defined as `successLevel += delta` on the original result's stored
     * level; the {@link successLevel} getter re-clamps to the four-point scale on
     * read (e.g. a marginal failure bumped by +2 reads as a critical success).
     *
     * @param delta - Success levels to add (Fate contributes +1 or +2).
     * @returns This result, for chaining.
     */
    bumpSuccessLevel(delta: number): this {
        this._successLevel += delta;
        return this;
    }

    /** The token this test is associated with, if any. */
    get token(): SohlTokenDocumentLogic | undefined {
        return this._tokenLogic;
    }

    /** The item logic this test was rolled from (its skill/attribute/weapon). */
    get item(): SohlItemLogic<any> {
        return this._item;
    }

    /**
     * The mastery-level modifier rolled against; its
     * {@link sohl.entity.modifier.MasteryLevelModifier.constrainedEffective | constrainedEffective}
     * value is the roll-under target for this test.
     */
    get masteryLevelModifier(): MasteryLevelModifier {
        return this._masteryLevelModifier;
    }

    /**
     * Number of **Value Diamonds** (quality grade), **derived on read** from the
     * description table. Never
     * stored (issue #205) — recomputed from the table plus the evaluated
     * success level / target value / roll last-digit.
     */
    get valueDiamonds(): number {
        return this.resolveDescription().result;
    }

    /**
     * {@link valueDiamonds} as one entry per diamond on the fixed
     * {@link VALUE_DIAMOND_SCALE | 0-5 scale} for the card to draw — `true` where
     * the diamond was **earned** (drawn filled) and `false` where it was not
     * (drawn hollow), so the line reads as a rating rather than a bare tally.
     *
     * @remarks
     * Marks, not markup: the card turns each entry into a Font Awesome diamond
     * (`fa-solid` / `fa-regular`), the same way
     * {@link sohl.entity.result.OpposedTestResult.victoryStarMarks} is drawn as
     * stars. Unlike a contest margin — which is unbounded, so it can only be
     * shown as a count of filled stars — the grade has a fixed ceiling, so the
     * unearned diamonds are worth drawing. A table that grades outside the scale
     * is clamped rather than overflowing the row.
     */
    get valueDiamondMarks(): boolean[] {
        return toValueDiamondMarks(this.valueDiamonds);
    }

    /**
     * Short result label for the chat card, **derived on read** from the
     * description table (empty when
     * no table is supplied). Never stored — see {@link valueDiamonds}.
     */
    get resultText(): string {
        return this.resolveDescription().label;
    }

    /**
     * Longer result description for the chat card, **derived on read** from the
     * description table (empty when
     * no table is supplied). Never stored — see {@link valueDiamonds}.
     */
    get resultDesc(): string {
        return this.resolveDescription().description;
    }

    /**
     * Resolve this result's derived display outcome from the description table:
     * the label, description, and numeric star count of the row matching the
     * evaluated {@link targetValue} and roll {@link lastDigit}, evaluating any
     * {@link sohl.entity.expr.SafeExpression} row against the test bindings.
     *
     * Purely computed — the source of {@link resultText}, {@link resultDesc},
     * and {@link valueDiamonds}, none of which are stored (issue #205; the
     * table itself rides the wire as data, #206). Returns empty text and a zero
     * star count when the table is empty or no row matches.
     *
     * @returns The resolved label, description, and star count.
     */
    private resolveDescription(): {
        label: string;
        description: string;
        result: number;
        success: boolean;
    } {
        const empty = {
            label: "",
            description: "",
            result: 0,
            success: false,
        };
        const table = this._resultDescTable;
        if (table.length === 0) return empty;
        const targetValue = this.targetValue;
        const lastDigit = this.lastDigit;
        const row = [...table]
            .sort((a, b) => a.maxValue - b.maxValue)
            .find(
                (entry) =>
                    entry.maxValue >= targetValue &&
                    (entry.lastDigits.length === 0 ||
                        entry.lastDigits.includes(lastDigit)),
            );
        if (!row) return empty;
        // Bindings a row's SafeExpression may reference.
        const bindings = expressionScopes.require("test.resultRow").bind({
            successLevel: this.successLevel,
            targetValue,
            lastDigit,
        });
        const label =
            row.label instanceof SafeExpression ?
                String(row.label.evaluate(bindings))
            :   row.label;
        const description =
            row.description instanceof SafeExpression ?
                String(row.description.evaluate(bindings))
            :   row.description;
        const result =
            row.result instanceof SafeExpression ?
                Number(row.result.evaluate(bindings))
            :   row.result;
        return {
            label: label || "",
            description: description || "",
            result,
            success: row.success ?? true,
        };
    }

    /** Which kind of test this is — a {@link TEST_TYPE} id (e.g. success test, attack, block). */
    get testType(): TestType {
        return this._testType;
    }

    /**
     * The d100 {@link SimpleRoll}. May be pre-seeded before {@link evaluate}
     * (e.g. for fate or a deterministic outcome).
     */
    get roll(): SimpleRoll {
        return this._roll;
    }

    /** Tactical movement state recorded for this test (stationary, etc.). */
    get movement(): SuccessTestResultMovement {
        return this._movement;
    }

    /** Set of mishap codes flagged for this result (e.g. fumble, stumble); lazily initialized. */
    get mishaps(): Set<string> {
        if (!this._mishaps) this._mishaps = new Set<string>();
        return this._mishaps;
    }

    /**
     * Context-menu responses available as follow-ups to this result — e.g.
     * resuming an opposed test when this is the opening roll.
     */
    get availResponses() {
        const result: SohlContextMenu.Entry[] = [];
        if (this.testType === TEST_TYPE.OPPOSEDTESTSTART.id) {
            result.push(TEST_TYPE.OPPOSEDTESTRESUME);
        }

        return result;
    }

    /**
     * Success level normalized to the canonical four-point scale (−1/0/1/2) from
     * {@link isSuccess} and {@link isCritical}. Opposed and combat resolution
     * compare two results by this value.
     */
    get normSuccessLevel() {
        let result;
        if (this.isSuccess) {
            if (this.isCritical) {
                result = CRITICAL_SUCCESS;
            } else {
                result = MARGINAL_SUCCESS;
            }
        } else {
            if (this.isCritical) {
                result = CRITICAL_FAILURE;
            } else {
                result = MARGINAL_FAILURE;
            }
        }
        return result;
    }

    /** The ones digit of the roll total, tested against the modifier's critical digit lists. */
    get lastDigit() {
        return (this.roll?.total ?? 0) % 10;
    }

    /** Whether the effective mastery level was constrained (capped) below its raw effective value. */
    get isCapped() {
        return this.masteryLevelModifier ?
                this.masteryLevelModifier.effective !==
                    this.masteryLevelModifier.constrainedEffective
            :   false;
    }

    /** Whether criticals are possible — i.e. the modifier defines any critical success or failure digits. */
    get critAllowed() {
        return !!(
            this.masteryLevelModifier?.critSuccessDigits.length ||
            this.masteryLevelModifier?.critFailureDigits.length
        );
    }

    /**
     * Whether this result is a critical (success or failure). Always `false` when
     * {@link critAllowed} is `false` — except a forced auto-Critical-Failure
     * (#568), which is always critical.
     */
    get isCritical() {
        return (
            this._autoCriticalFail ||
            (this.critAllowed &&
                (this.successLevel <= CRITICAL_FAILURE ||
                    this.successLevel >= CRITICAL_SUCCESS))
        );
    }

    /** Whether the test succeeded (success level at marginal success or better). */
    get isSuccess() {
        return this.successLevel >= MARGINAL_SUCCESS;
    }

    /**
     * Whether a Fate Point may be spent on this test — true only when the owning
     * item has an eligible, charged Fate Mystery (`availableFate`) and the test
     * permits it. Fate is a **post-roll success-level bump**, never a re-roll: a
     * spend raises this result's stored {@link successLevel} (#854).
     */
    get canFate() {
        return this._canFate;
    }

    /**
     * Whether this is a Success Value test (#848) — its roll is graded into a
     * Success Value and Value Diamonds rather than a plain pass/fail. Drives the
     * card's Success Value / Value Diamonds rows.
     */
    get isSuccessValue(): boolean {
        return this._isSuccessValue;
    }

    /**
     * Open the pre-roll dialog and fold its inputs into this result.
     *
     * @remarks
     * The dialog collects a situational modifier and a success-level modifier
     * (both applied to {@link masteryLevelModifier}), the {@link rollMode}, and
     * movement/mishap options. After the user submits, the supplied `callback`
     * is chained with the form data. This does not roll — call {@link evaluate}
     * afterward.
     *
     * @param data - Extra template data merged into the dialog.
     * @param callback - Invoked with the submitted form data once the dialog
     *   inputs have been applied.
     * @returns The dialog render/submit result.
     */
    async testDialog(
        data: PlainObject = {},
        callback: (formData: StrictObject<string | number>) => void,
    ): Promise<any> {
        const ctor = this.constructor as typeof SuccessTestResult;
        let testData: PlainObject = {
            ...this.toJSON(),
            template: toFilePath(
                "systems/sohl/templates/dialog/standard-test-dialog.hbs",
            ),
            title: sohl.i18n.format("SOHL.SuccessTestResult.testDialog.title", {
                name: this._speaker.name,
                title: this._title,
            }),
            movementOptions: SuccessTestResultMovements.map((val) => [
                val,
                `SOHL.${ctor.name}.Movement.${val}`,
            ]),
            mishapOptions: SuccessTestResultMishaps.map((val) => [
                val,
                `SOHL.${ctor.name}.Mishap.${val}`,
            ]),
            rollModes: SohlSpeakerRollModes.map(([k, v]) => ({
                group: "CHAT.RollDefault",
                value: k,
                label: v,
            })),
        };
        fvttMergeObject(testData, data);

        // Create the dialog window
        return await dialog({
            title: "SOHL.SuccessTestResult.testDialog.title",
            template: testData.template,
            data,
            callback: (formData: PlainObject) => {
                const formSituationalModifier = formData.situationalModifier;
                if (formSituationalModifier) {
                    this.masteryLevelModifier.add(
                        VALUE_DELTA_INFO.PLAYER,
                        formSituationalModifier,
                    );
                }

                this.masteryLevelModifier.successLevelMod =
                    Number.parseInt(String(formData.successLevelMod), 10) || 0;

                if (isSohlSpeakerRollMode(String(formData.rollMode))) {
                    this.rollMode = String(formData.rollMode);
                } else {
                    throw new Error(`Invalid roll mode "${formData.rollMode}"`);
                }

                const rawMovement = String(formData.targetMovement);
                if (isSuccessTestResultMovement(rawMovement)) {
                    this._movement = rawMovement;
                } else {
                    throw new Error(`Invalid target movement "${rawMovement}"`);
                }

                if (callback) callback.call(this, formData);
                return true;
            },
        });
    }

    /**
     * Re-open the standard test dialog on this **already-settled** result,
     * pre-filled with its current situational and success-level modifiers, and
     * fold the submitted values back into {@link masteryLevelModifier}.
     *
     * @remarks
     * This is the shared core of the GM result-edit: the single-test pencil
     * ({@link sohl.document.item.logic.SohlItemBaseLogic.resultEdit}, #856) and
     * the opposed-contest pencil
     * ({@link sohl.document.actor.logic.SohlActorBaseLogic.opposedResultEdit},
     * #1082) both fold their sides through it. It **never rolls** — the die
     * stays frozen and the caller re-evaluates on it.
     *
     * A situational modifier of `0` *removes* the delta rather than recording a
     * zero, so an edited target is never left carrying a stale modifier.
     *
     * @param opts - How to collect the new modifiers; see
     *   {@link SuccessTestResult.ModifierEditOptions}.
     * @returns `{ changed }` — whether either modifier actually moved — or
     *   `undefined` when the dialog was dismissed, which cancels the edit.
     */
    async editModifiers(
        opts: SuccessTestResult.ModifierEditOptions = {},
    ): Promise<SuccessTestResult.ModifierEdit | undefined> {
        const mlMod = this._masteryLevelModifier;
        const priorSit = mlMod.get(VALUE_DELTA_INFO.PLAYER)?.numValue ?? 0;
        const priorSLM = mlMod.successLevelMod;
        const priorRollMode = this.rollMode;

        // New modifiers come from the pre-filled dialog, or — when skipDialog
        // bypasses it (headless / scripted) — straight from the caller.
        let newSit: number;
        let newSLM: number;
        // The dialog also carries the roll visibility (#1099). A value it does
        // not offer is ignored rather than thrown on: this is an edit of a
        // settled result, and an unrecognized mode must not cancel it.
        let newRollMode: string =
            isSohlSpeakerRollMode(String(opts.rollMode)) ?
                String(opts.rollMode)
            :   priorRollMode;
        if (opts.skipDialog) {
            newSit = opts.situationalModifier ?? priorSit;
            newSLM = opts.successLevelMod ?? priorSLM;
        } else {
            const dlgResult = await dialog({
                title:
                    opts.title ??
                    sohl.i18n.localize("SOHL.ResultEdit.dialogTitle"),
                template: toFilePath(
                    "systems/sohl/templates/dialog/standard-test-dialog.hbs",
                ),
                data: {
                    type: this._testType,
                    mlMod,
                    situationalModifier: priorSit,
                    rollMode: this.rollMode,
                    rollModes: speakerRollModeOptions(),
                },
                callback: (formData: PlainObject) => ({
                    situationalModifier:
                        parseInt(String(formData.situationalModifier), 10) || 0,
                    successLevelMod:
                        parseInt(String(formData.successLevelMod), 10) || 0,
                    rollMode: String(formData.rollMode ?? ""),
                }),
                rejectClose: false,
            });
            // A dismissed dialog cancels the edit; nothing changes.
            if (!dlgResult) return undefined;
            newSit = dlgResult.situationalModifier;
            newSLM = dlgResult.successLevelMod;
            if (isSohlSpeakerRollMode(dlgResult.rollMode))
                newRollMode = dlgResult.rollMode;
        }

        // OK-without-change is a no-op: the caller re-evaluates nothing. A
        // visibility change alone still counts — the corrected card has to be
        // reposted for it to take effect.
        if (
            newSit === priorSit &&
            newSLM === priorSLM &&
            newRollMode === priorRollMode
        )
            return { changed: false };

        // Replace (or clear) the situational delta — a 0 removes it so the
        // target is not left carrying a stale modifier — then set the
        // success-level mod.
        if (newSit) mlMod.add(VALUE_DELTA_INFO.PLAYER, newSit);
        else mlMod.delete(VALUE_DELTA_INFO.PLAYER);
        mlMod.successLevelMod = newSLM;
        this.rollMode = newRollMode;
        return { changed: true };
    }

    /**
     * Roll the d100 (unless a die was supplied) and resolve the outcome against
     * the modifier's
     * {@link sohl.entity.modifier.MasteryLevelModifier.constrainedEffective | constrained effective}
     * mastery level (roll-under: rolling at or below it succeeds).
     *
     * @remarks
     * The die is cast here **only when the caller did not supply one** (see
     * `_rollSupplied`): a fresh test rolls a new d100, while a supplied die
     * — fate replaying a prior roll, or the attacker's die reconstructed on the
     * defender's client — is resolved untouched. It then sets the success level
     * from the roll, promoting it to a critical when the last digit appears in
     * the modifier's critical-success/-failure digit lists, applies
     * `successLevelMod`, and — when criticals are disallowed — clamps the level
     * to marginal failure/success and selects the localized description. The
     * result text and Value Diamond count are not set here: they derive on read
     * from the description table (see {@link valueDiamonds}).
     *
     * @returns `false` if the base evaluation disallows the result, or if the
     *   current user does not own the speaker (it cannot roll on their behalf);
     *   otherwise `true`.
     */
    override async evaluate() {
        let allowed = await super.evaluate();
        if (allowed === false) return false;
        if (!this._speaker.isOwner) {
            sohl.log.uiWarn(
                sohl.i18n.format("SOHL.SuccessTestResult.evaluate.NoPerm", {
                    name: this._speaker.name,
                }),
            );
            return false;
        }

        // Cast the d100 for a fresh test; a caller-supplied die is left as-is.
        if (!this._rollSupplied) {
            this._roll.roll();
        }

        // A test that requires an unusable body part auto-Critically-Fails (#568):
        // the die is cast for display, but the outcome is forced to a Critical
        // Failure regardless of the roll.
        if (this._autoCriticalFail) {
            this._successLevel = CRITICAL_FAILURE;
            this._description = "SOHL.SuccessTestResult.CriticalFailure";
            return allowed;
        }

        if (this.critAllowed) {
            if (
                this.roll.total <=
                this.masteryLevelModifier.constrainedEffective
            ) {
                if (
                    this.masteryLevelModifier.critSuccessDigits.includes(
                        this.lastDigit,
                    )
                ) {
                    this._successLevel = CRITICAL_SUCCESS;
                } else {
                    this._successLevel = MARGINAL_SUCCESS;
                }
            } else {
                if (
                    this.masteryLevelModifier.critFailureDigits.includes(
                        this.lastDigit,
                    )
                ) {
                    this._successLevel = CRITICAL_FAILURE;
                } else {
                    this._successLevel = MARGINAL_FAILURE;
                }
            }
        } else {
            if (
                this.roll.total <=
                this.masteryLevelModifier.constrainedEffective
            ) {
                this._successLevel = MARGINAL_SUCCESS;
            } else {
                this._successLevel = MARGINAL_FAILURE;
            }
        }

        this._successLevel += this.masteryLevelModifier.successLevelMod;
        if (!this.critAllowed) {
            this._successLevel = Math.min(
                Math.max(this._successLevel, MARGINAL_FAILURE),
                MARGINAL_SUCCESS,
            );
        }

        if (this.critAllowed) {
            if (this.isCritical) {
                this._description =
                    this.isSuccess ?
                        "SOHL.SuccessTestResult.CriticalSuccess"
                    :   "SOHL.SuccessTestResult.CriticalFailure";
            } else {
                this._description =
                    this.isSuccess ?
                        "SOHL.SuccessTestResult.MarginalSuccess"
                    :   "SOHL.SuccessTestResult.MarginalFailure";
            }
        } else {
            this._description =
                this.isSuccess ?
                    "SOHL.SuccessTestResult.Success"
                :   "SOHL.SuccessTestResult.Failure";
        }

        return allowed;
    }

    /**
     * Render this result with the standard test chat card
     * (`templates/chat/standard-test-card.hbs`) and post it via the
     * {@link speaker}, attaching the Foundry roll and the dice sound.
     *
     * @remarks
     * The derived display outcome (`resultText`, `resultDesc`, `valueDiamonds`)
     * is not carried by {@link toJSON} — it is folded into the card data here,
     * rendered once by the sender with a live `targetValueFunc` (issue #205).
     *
     * An optional `buttons` entry in `data` (one {@link ActionCardButton} or an
     * array) is folded through {@link toRenderableButtons} — the same normalizer
     * the action-card framework uses — so the standard card can carry arbitrary
     * follow-up consent buttons (a graded test = `resultDescTable` mapping +
     * `buttons` follow-ups), dispatched through the shared chat-card chokepoint
     * exactly like an action card. Nothing auto-fires (#853).
     * @param data - Extra template data merged into the card. A `buttons` key
     *   ({@link ActionCardButton} or `ActionCardButton[]`) becomes follow-up
     *   action buttons on the card.
     */
    async toChat(data: PlainObject = {}): Promise<void> {
        // Pull `buttons` out of the passthrough data: it is an ActionCardButton
        // spec, not raw template data, and must be normalized (scope
        // pre-serialized) before it reaches the card.
        const { buttons, ...rest } = data;
        const { label, description, result, success } =
            this.resolveDescription();
        // Serialize this result once under `priorTestResult` — the reconstruction
        // seam a card control revives to act on *this* result without re-rolling.
        // The GM edit pencil (`editScopeJSON`, #856) carries it on every card; the
        // Fate button (`fateScopeJSON`, #854) carries it only when Fate is offered.
        // (The item/actor uuids these controls dispatch against are folded into
        // the card data below.)
        const priorResultScopeJSON = JSON.stringify(
            defaultToJSON({ priorTestResult: this }),
        );
        const editScopeJSON = priorResultScopeJSON;
        const fateScopeJSON =
            this._canFate && data.canFate !== false ? priorResultScopeJSON : "";
        let chatData = fvttMergeObject(this.toJSON() as PlainObject, {
            ...rest,
            editScopeJSON,
            fateScopeJSON,
            resultText: label,
            resultDesc: description,
            valueDiamonds: result,
            // Spread from the count resolved just above, not re-derived, so the
            // icons and the count can never disagree.
            vdMarks: toValueDiamondMarks(result),
            // Success Value test (#848): the card shows the Success Value (the
            // graded target value = Index + Modifier) and the Value Diamonds
            // (`valueDiamonds` above). `svSuccess` styles the graded outcome the
            // way `isSuccess` styles a plain one.
            isSuccessValue: this._isSuccessValue,
            successValue: this.targetValue,
            svSuccess: success,
            // Derived display fields the card template reads. These are folded in
            // as plain values because `fvttMergeObject` deep-copies its arguments,
            // which would strip a live class instance's prototype getters. `mlMod`
            // carries the modifier's display fields (its constrained target, the
            // per-delta `chatHtml` breakdown, `empty`, and `successLevelMod`); the
            // roll gains its `total` (a getter absent from `SimpleRoll.toJSON`);
            // and the outcome booleans drive the styling and localized footer.
            mlMod: {
                constrainedEffective:
                    this._masteryLevelModifier.constrainedEffective,
                effective: this._masteryLevelModifier.effective,
                chatHtml: this._masteryLevelModifier.chatHtml,
                empty: this._masteryLevelModifier.empty,
                successLevelMod: this._masteryLevelModifier.successLevelMod,
            },
            roll: { ...this._roll.toJSON(), total: this._roll.total },
            isSuccess: this.isSuccess,
            isCritical: this.isCritical,
            // The card's root element and its edit-pencil / fate-test buttons
            // dispatch against the owning item (and reference the actor), so both
            // uuids must reach the template.
            item: { uuid: this._item.uuid },
            actor: { uuid: this._item.actor?.uuid },
            // Default to the standard card, but let a caller render a different
            // one (e.g. OpposedTestResult delegates its shaped data here to render
            // the opposed request/result cards). Placed after `...rest` so the
            // caller's `template` is honored, not clobbered (#845).
            template:
                (rest.template as string | undefined) ??
                "systems/sohl/templates/chat/standard-test-card.hbs",
            movementOptions: SuccessTestResultMovements.map((val) => [
                val,
                `SOHL.SuccessTestResult.Movement.${val}`,
            ]),
            rollModes: SohlSpeakerRollModes.map(([k, v]) => ({
                group: "CHAT.RollDefault",
                value: k,
                label: v,
            })),
        }) as PlainObject;

        if (buttons) {
            chatData.buttons = toRenderableButtons(
                buttons as ActionCardButton | ActionCardButton[],
            );
        }

        const options: PlainObject = {};
        options.roll = await fvttToFoundryRoll(this.roll);
        options.sound = SOHL_SPEAKER_SOUND.DICE;
        // A caller that names a visibility gets it (the GM result-edit reposts
        // with the mode chosen in the edit dialog, #1099). Without one the
        // speaker resolves the mode as it always has, so the ordinary pre-roll
        // post is unchanged.
        if (isSohlSpeakerRollMode(String(rest.rollMode)))
            options.rollMode = String(rest.rollMode);
        void this._speaker.toChat(chatData.template, chatData, options);
    }
}

export namespace SuccessTestResult {
    /** Registry key identifying this result kind for serialization. */
    export const Kind: string = "SuccessTestResult";

    /** How {@link SuccessTestResult.editModifiers} collects the new modifiers. */
    export interface ModifierEditOptions {
        /**
         * Take the new values from this bag instead of opening the dialog —
         * for headless or scripted callers.
         */
        skipDialog?: boolean;
        /**
         * The new situational modifier (`skipDialog` only); defaults to the
         * value already on the result.
         */
        situationalModifier?: number;
        /**
         * The new success-level modifier (`skipDialog` only); defaults to the
         * value already on the result.
         */
        successLevelMod?: number;
        /**
         * The new roll visibility (`skipDialog` only); defaults to the mode
         * already on the result. A value that is not a
         * {@link sohl.utils.SohlSpeakerRollMode} is ignored (#1099).
         */
        rollMode?: string;
        /**
         * Dialog heading override (localized text, not a key) — used to name
         * the side being edited in a two-sided contest.
         */
        title?: string;
    }

    /** Outcome of a {@link SuccessTestResult.editModifiers} pass. */
    export interface ModifierEdit {
        /**
         * Whether either modifier actually moved. `false` means the editor was
         * confirmed without a change, so there is nothing to re-evaluate.
         */
        changed: boolean;
    }

    /** Construction options for a {@link SuccessTestResult}. */
    export interface Options {
        /** A prior result whose serialized state seeds this one (reconstruct/clone). */
        testResult: SuccessTestResult;
        /** Speaker to use for chat output, overriding the token-derived default. */
        chatSpeaker: SohlSpeaker;
        /** The mastery-level modifier to test against. */
        mlMod: MasteryLevelModifier;
        /** When `true`, skip the pre-roll {@link SuccessTestResult.testDialog | dialog}. */
        skipDialog: boolean;
    }

    /**
     * Preset {@link SimpleRoll.Data} that force each canonical outcome (a
     * guaranteed critical failure, marginal failure, critical success, or
     * marginal success). Used to seed deterministic rolls — e.g. the default
     * unevaluated roll and fate presets.
     */
    export const StandardRollData: StrictObject<SimpleRoll.Data> = {
        CRITICAL_FAILURE: {
            numDice: 1,
            dieFaces: 100,
            modifier: 0,
            rolls: [100],
        },
        MARGINAL_FAILURE: {
            numDice: 1,
            dieFaces: 100,
            modifier: 0,
            rolls: [99],
        },
        CRITICAL_SUCCESS: {
            numDice: 1,
            dieFaces: 100,
            modifier: 0,
            rolls: [5],
        },
        MARGINAL_SUCCESS: {
            numDice: 1,
            dieFaces: 100,
            modifier: 0,
            rolls: [1],
        },
    } as const;

    /** Construction data for a {@link SuccessTestResult}. */
    export interface Data extends TestResult.Data {
        /** A previously-evaluated success level to restore (e.g. a cross-client snapshot). */
        successLevel: number;
        /** The token the test is associated with. */
        tokenUuid: string;
        /** The mastery-level modifier to test against. */
        masteryLevelModifier: MasteryLevelModifier;
        /**
         * The description table used to derive result text and stars. Rides the
         * wire as data (#206); the display outcome ({@link SuccessTestResult.resultText | text},
         * {@link SuccessTestResult.valueDiamonds | stars}) is computed from it on
         * read, never stored (#205).
         */
        resultDescTable: LimitedDescription[];
        /** Foundry roll mode for chat output. */
        rollMode: SohlSpeakerRollMode;
        /** Which kind of test this is (a {@link TEST_TYPE} id). */
        testType: TestType;
        /** A pre-seeded d100 roll (omit to roll fresh in {@link SuccessTestResult.evaluate}). */
        roll: SimpleRoll;
        /**
         * Force an auto-Critical-Failure (#568) — the test requires a body part
         * the actor cannot use. Defaults `false`.
         */
        autoCriticalFail?: boolean;
        /** Tactical movement state for the test. */
        movement: SuccessTestResultMovement;
        /** Mishap codes to seed (e.g. fumble, stumble). */
        mishaps: string[];
        /** Whether fate may be spent on this test. */
        canFate: boolean;
        /**
         * Whether this is a Success Value test (#848) — graded into a Success
         * Value and Value Diamonds via {@link resultDescTable}. Defaults `false`.
         */
        isSuccessValue?: boolean;
        /** Maps a success level to the test's target value (identity for a plain success test). */
        targetValueFunc: (sl: number) => number;
    }

    export interface Options extends TestResult.Options {}

    /**
     * The recognized `context.scope` fields for a
     * {@link sohl.entity.modifier.MasteryLevelModifier.successTest} — **not** only
     * for resuming one. All are optional (the method reads them as a
     * `Partial<ContextScope>`); together they turn the single generic success test
     * into any bespoke graded test as **data**, with no subclass. `resultDescTable`
     * carries the outcome mapping and `targetValueFunc` the grading value; follow-up
     * consent buttons are passed separately to
     * {@link SuccessTestResult.toChat}. See the
     * [pass-data pattern](https://www.heroiclands.org/sohl/kb/dev-docs/how-to/extension-points/).
     */
    export interface ContextScope {
        /**
         * Reuse an already-evaluated success test instead of rolling fresh (Fate,
         * a GM edit, an opposed resume) — the die is **not** re-rolled. Omit to
         * roll a new test.
         */
        priorTestResult: SuccessTestResult;
        /** A situational modifier to apply to the mastery level. */
        situationalModifier: number;
        /**
         * A pre-seeded die to resolve instead of casting one (#1148). Unlike
         * {@link priorTestResult}, which reuses a whole evaluated result, this
         * supplies only the die: the test is built and evaluated normally, but
         * `evaluate()` resolves the supplied roll untouched. Used where the
         * outcome is fixed by rule and there is nothing to test — an untreated
         * wound has no Healing Rate, so its Healing Test resolves against
         * {@link sohl.document.item.logic.UNTREATED | UNTREATED.roll}.
         */
        roll?: SimpleRoll;
        /**
         * The token this test is made **as**, when the caller knows it and the
         * owning item does not. Seeds the result's
         * {@link SuccessTestResult.token}, which chat cards read the
         * combatant's name from. Set by the responding side of an opposed test
         * (#1164); omitted by an ordinary item-menu test.
         */
        tokenUuid?: string;
        /** Maps a success level to the test's target value. */
        targetValueFunc: (sl: number) => number;
        /** The description table used to resolve result text and stars. */
        resultDescTable: LimitedDescription[];
        /**
         * Whether the resulting card may offer a Fate spend (gated further by the
         * item's `availableFate`). Defaults `true`; the Fate test itself passes
         * `false` so a Fate roll cannot in turn be fated (#854).
         */
        canFate?: boolean;
        /**
         * Mark the test as a **Success Value test** (#848), so its card shows the
         * Success Value and Value Diamonds. Set by
         * {@link sohl.entity.modifier.MasteryLevelModifier.successValueTest}
         * alongside the svTable and grading `targetValueFunc`.
         */
        isSuccessValue?: boolean;
        /**
         * Show the **Break Ties** checkbox on the pre-roll dialog — set by
         * {@link sohl.entity.modifier.MasteryLevelModifier.opposedTestStart},
         * since only an opposed test can end in a tie.
         */
        askBreakTies?: boolean;
        /**
         * Whether a tie should be broken. Read back from the dialog (or supplied
         * with `skipDialog`) and handed to the
         * {@link sohl.entity.result.OpposedTestResult} the contest builds.
         */
        breakTies?: boolean;
    }

    /**
     * A row in a success-value description table: maps a test's
     * {@link SuccessTestResult.targetValue | target value} (optionally filtered
     * by the roll's last digit) to a label, description, success flag, and a
     * numeric result/quality. Each text/numeric field may be a literal or a
     * function computed from the chat data.
     */
    /**
     * A row of a **result-description table**, mapping a test outcome to a
     * descriptive label (e.g. "You go screaming down the halls in terror" rather
     * than a bare "Critical Failure"). `label` / `description` / `result` may be a
     * literal or a {@link sohl.entity.expr.SafeExpression} computed from the test
     * bindings (`successLevel`, `targetValue`, `lastDigit`) — data, so the whole
     * table serializes across clients. See the
     * [Result-description Tables](https://www.heroiclands.org/sohl/kb/dev-docs/reference/result-description-tables/)
     * guide.
     */
    export interface LimitedDescription {
        /** Upper bound (inclusive) of target values this row matches. */
        maxValue: number;
        /** Roll last-digits this row applies to; an empty list matches any. */
        lastDigits: number[];
        /**
         * Result label — a literal string, or a {@link sohl.entity.expr.SafeExpression}
         * computing it from the test bindings (`successLevel`, `targetValue`,
         * `lastDigit`). A `SafeExpression` is data (a source string), so the row —
         * unlike a raw function — survives serialization across clients.
         */
        label: string | SafeExpression;
        /** Result description — a literal string or a {@link sohl.entity.expr.SafeExpression}. */
        description: string | SafeExpression;
        /** Whether this row represents a success. */
        success: boolean;
        /**
         * Numeric result/quality (e.g. star count) — a literal number or a
         * {@link sohl.entity.expr.SafeExpression} computing it from the test bindings.
         */
        result: number | SafeExpression;
    }
}

/**
 * Revive a limited-description table's computed fields into live SafeExpressions.
 *
 * A table rides the serialization wire as pure data — each computed
 * `label`/`description`/`result` that is an expression becomes a `__kind`-tagged
 * {@link sohl.entity.expr.SafeExpression} payload (its source string). On
 * reconstruction those payloads are rehydrated into live `SafeExpression`
 * instances owned by `parent`; literals and already-live expressions pass through
 * unchanged. This is the reference-on-wire / live-object-in-memory rule the
 * result subsystem follows — the reason a table can carry computed rows at all
 * (a raw function would be silently dropped by `JSON.stringify`).
 *
 * @param table - The table as supplied to a constructor (wire data or live).
 * @param parent - The logic to own any revived SafeExpression.
 * @returns A table whose expression fields are live SafeExpressions.
 */
/**
 * Reduce a limited-description table to plain, serializable data.
 *
 * Each computed `label`/`description`/`result` that is a live
 * {@link sohl.entity.expr.SafeExpression} is replaced with its serialized form (a
 * `__kind`-tagged source string); literals pass through. A `toJSON` must emit
 * this — not the raw table — because a live SafeExpression holds a back-reference
 * to its parent logic, and the deep `undefined→null` pass over a `toJSON` result
 * would recurse into that cycle. {@link reviveLimitedDescriptionTable} is the
 * inverse.
 *
 * @param table - The live table (as held in memory).
 * @returns The table with expression fields reduced to serialized data.
 */
export function serializeLimitedDescriptionTable(
    table: SuccessTestResult.LimitedDescription[],
): PlainObject[] {
    const ser = (v: unknown): unknown =>
        v instanceof SafeExpression ? v.toJSON() : v;
    return table.map((row) => ({
        ...row,
        label: ser(row.label),
        description: ser(row.description),
        result: ser(row.result),
    })) as PlainObject[];
}

/**
 *  Revive a limited-description table's computed fields into live SafeExpressions.
 *
 * A table rides the serialization wire as pure data — each computed
 * `label`/`description`/`result` that is an expression becomes a `__kind`-tagged
 * {@link sohl.entity.expr.SafeExpression} payload (its source string). On
 * reconstruction those payloads are rehydrated into live `SafeExpression`
 * instances owned by `parent`; literals and already-live expressions pass through
 * unchanged. This is the reference-on-wire / live-object-in-memory rule the
 * result subsystem follows — the reason a table can carry computed rows at all
 * (a raw function would be silently dropped by `JSON.stringify`).
 * @param table - The serialized limited-description table.
 * @param parent - The parent object to associate with revived SafeExpressions.
 * @returns The table with expression fields revived into live SafeExpressions.
 */
export function reviveLimitedDescriptionTable(
    table: SuccessTestResult.LimitedDescription[],
    parent: unknown,
): SuccessTestResult.LimitedDescription[] {
    const revive = (v: unknown): unknown => {
        if (v instanceof SafeExpression) return v;
        if (v && typeof v === "object" && "__kind" in (v as object)) {
            return defaultFromJSON(v as PlainObject, { parent });
        }
        return v;
    };
    return table.map((row) => ({
        ...row,
        label: revive(row.label) as string | SafeExpression,
        description: revive(row.description) as string | SafeExpression,
        result: revive(row.result) as number | SafeExpression,
    }));
}

registerKind(SuccessTestResult.Kind, SuccessTestResult);
registerEntity("SuccessTestResult", SuccessTestResult);
