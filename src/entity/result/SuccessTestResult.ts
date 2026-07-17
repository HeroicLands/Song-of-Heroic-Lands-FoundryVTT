/*
 * This file is part of the Song of Heroic Lands (SoHL) system for Foundry VTT.
 * Copyright (c) 2024-2026 Tom Rodriguez ("Toasty") — <toasty@heroiclands.com>
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
import { SimpleRoll } from "@src/entity/roll/SimpleRoll";
import { TestResult } from "@src/entity/result/TestResult";
import { SohlEntity } from "@src/entity/SohlEntity";
import { SafeExpression } from "@src/entity/expr/SafeExpression";
import type { SohlLogic } from "@src/core/logic/SohlLogic";
import { toFilePath, defaultFromJSON } from "@src/utils/helpers";
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
 * docs/reference/runtime-contracts.md.
 * ────────────────────────────────────────────────────────────────────────────
 */
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
 * Result text and success stars are then derived on read from the description
 * table (see {@link successStars}); they are not stored on the result.
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
    protected _movement: SuccessTestResultMovement;
    protected _mishaps: Set<string>;
    protected _canFate: boolean;
    protected _item: SohlItemLogic<any>;
    /** Foundry roll mode (public / private GM / blind / self) used when posting to chat. */
    rollMode: string;
    protected _targetValueFunc: (successLevel: number) => number;
    protected _successStarTable: SuccessTestResult.LimitedDescription[];

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
        this._successStarTable =
            data.successStarTable ?
                reviveLimitedDescriptionTable(
                    data.successStarTable,
                    this.parent,
                )
            :   [];
        this.rollMode = data.rollMode || SOHL_SPEAKER_ROLL_MODE.SYSTEM;
        this._testType = data.testType || TEST_TYPE.SUCCESSTEST.id;
        this._roll =
            data.roll ??
            new SimpleRoll(
                SuccessTestResult.StandardRollData.MARGINAL_FAILURE,
                {
                    parent: this.parent,
                },
            );
        this._movement =
            data.movement || SUCCESS_TEST_RESULT_MOVEMENT.STATIONARY;
        this._mishaps = new Set<string>(data.mishaps || []);
        this._item = this.parent;
        this._canFate =
            (this._item as any).availableFate?.length > 0 && !!data.canFate;
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
     * `successStars`) is deliberately **not** emitted — it recomputes on read
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
     * - `successStarTable` is serialized as data (not a table reference)
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
            successStarTable: serializeLimitedDescriptionTable(
                this._successStarTable,
            ),
            rollMode: this.rollMode,
            testType: this._testType,
            roll: this._roll.toJSON(),
            movement: this._movement,
            mishaps: [...this._mishaps],
            canFate: this._canFate,
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

    /** The token this test is associated with, if any. */
    get token(): SohlTokenDocumentLogic | undefined {
        return this._tokenLogic;
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
     * Number of success "stars" (quality grade), **derived on read** from the
     * description table. Never
     * stored (issue #205) — recomputed from the table plus the evaluated
     * success level / target value / roll last-digit.
     */
    get successStars(): number {
        return this.resolveDescription().result;
    }

    /**
     * Short result label for the chat card, **derived on read** from the
     * description table (empty when
     * no table is supplied). Never stored — see {@link successStars}.
     */
    get resultText(): string {
        return this.resolveDescription().label;
    }

    /**
     * Longer result description for the chat card, **derived on read** from the
     * description table (empty when
     * no table is supplied). Never stored — see {@link successStars}.
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
     * and {@link successStars}, none of which are stored (issue #205; the
     * table itself rides the wire as data, #206). Returns empty text and a zero
     * star count when the table is empty or no row matches.
     *
     * @returns The resolved label, description, and star count.
     */
    private resolveDescription(): {
        label: string;
        description: string;
        result: number;
    } {
        const empty = { label: "", description: "", result: 0 };
        const table = this._successStarTable;
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
        const bindings = {
            successLevel: this.successLevel,
            targetValue,
            lastDigit,
        };
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
        return { label: label || "", description: description || "", result };
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

    /** Whether this result is a critical (success or failure). Always `false` when {@link critAllowed} is `false`. */
    get isCritical() {
        return (
            this.critAllowed &&
            (this.successLevel <= CRITICAL_FAILURE ||
                this.successLevel >= CRITICAL_SUCCESS)
        );
    }

    /** Whether the test succeeded (success level at marginal success or better). */
    get isSuccess() {
        return this.successLevel >= MARGINAL_SUCCESS;
    }

    /** Whether fate may be spent to re-roll — true only if the item has available fate and the test permits it. */
    get canFate() {
        return this._canFate;
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
     * Roll the d100 and resolve the outcome against the modifier's
     * {@link sohl.entity.modifier.MasteryLevelModifier.constrainedEffective | constrained effective}
     * mastery level (roll-under: rolling at or below it succeeds).
     *
     * @remarks
     * Sets the success level from the roll, promoting it to a critical when the
     * last digit appears in the modifier's critical-success/-failure digit
     * lists. It then applies `successLevelMod` and — when criticals are
     * disallowed — clamps the level to marginal failure/success and selects the
     * localized description. The result text and success-star count are not set
     * here: they derive on read from the description table (see
     * {@link successStars}).
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
                sohl.i18n.format("SOHL.SUCCESSTESTRESULT.evaluate.NoPerm", {
                    name: this._speaker.name,
                }),
            );
            return false;
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
     * The derived display outcome (`resultText`, `resultDesc`, `successStars`)
     * is not carried by {@link toJSON} — it is folded into the card data here,
     * rendered once by the sender with a live `targetValueFunc` (issue #205).
     * @param data - Extra template data merged into the card.
     */
    async toChat(data: PlainObject = {}): Promise<void> {
        const { label, description, result } = this.resolveDescription();
        let chatData = fvttMergeObject(this.toJSON() as PlainObject, {
            ...data,
            resultText: label,
            resultDesc: description,
            successStars: result,
            template: "systems/sohl/templates/chat/standard-test-card.hbs",
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

        const options: PlainObject = {};
        options.roll = await fvttToFoundryRoll(this.roll);
        options.sound = SOHL_SPEAKER_SOUND.DICE;
        void this._speaker.toChat(chatData.template, chatData, options);
    }
}

export namespace SuccessTestResult {
    /** Registry key identifying this result kind for serialization. */
    export const Kind: string = "SuccessTestResult";

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
         * {@link SuccessTestResult.successStars | stars}) is computed from it on
         * read, never stored (#205).
         */
        successStarTable: LimitedDescription[];
        /** Foundry roll mode for chat output. */
        rollMode: SohlSpeakerRollMode;
        /** Which kind of test this is (a {@link TEST_TYPE} id). */
        testType: TestType;
        /** A pre-seeded d100 roll (omit to roll fresh in {@link SuccessTestResult.evaluate}). */
        roll: SimpleRoll;
        /** Tactical movement state for the test. */
        movement: SuccessTestResultMovement;
        /** Mishap codes to seed (e.g. fumble, stumble). */
        mishaps: string[];
        /** Whether fate may be spent on this test. */
        canFate: boolean;
        /** Maps a success level to the test's target value (identity for a plain success test). */
        targetValueFunc: (sl: number) => number;
    }

    export interface Options extends TestResult.Options {}

    /** Scope passed to actions that resume a prior success test. */
    export interface ContextScope {
        /** The success test being resumed. */
        priorTestResult: SuccessTestResult;
        /** A situational modifier to apply to the mastery level. */
        situationalModifier: number;
        /** Maps a success level to the test's target value. */
        targetValueFunc: (sl: number) => number;
        /** The description table used to resolve result text and stars. */
        successStarTable: LimitedDescription[];
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
     * [Result-description Tables](https://kb.heroiclands.com/dev/reference/result-description-tables/)
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
