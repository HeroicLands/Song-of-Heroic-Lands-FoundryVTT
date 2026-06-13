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

import { MasteryLevelModifier } from "@src/domain/modifier/MasteryLevelModifier";
import { registerKind } from "@src/utils/kindRegistry";
import type { SohlTokenDocument } from "@src/document/token/foundry/SohlTokenDocument";
import type { SohlContextMenu } from "@src/utils/SohlContextMenu";
import type { SohlItem } from "@src/document/item/foundry/SohlItem";
import { SohlSpeaker } from "@src/core/SohlSpeaker";
import { SimpleRoll } from "@src/utils/SimpleRoll";
import { TestResult } from "@src/domain/result/TestResult";
import { toFilePath } from "@src/utils/helpers";
import {
    inputDialog,
    DialogButtonCallback,
    fvttMergeObject,
    fvttToFoundryRoll,
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
    SohlSpeakerRollMode,
    TestType,
} from "@src/utils/constants";

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
 * 4. Success stars computed from the description table.
 * 5. Result text and description populated for chat display.
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
    /** Short result label resolved from the description table, shown on the chat card. */
    resultText: string;
    /** Longer result description resolved from the description table, shown on the chat card. */
    resultDesc: string;
    private _successLevel: number;
    protected _token: SohlTokenDocument | null;
    protected _masteryLevelModifier: MasteryLevelModifier;
    protected _successStars: number;
    protected _testType: TestType;
    protected _roll: SimpleRoll;
    protected _movement: SuccessTestResultMovement;
    protected _mishaps: Set<string>;
    protected _canFate: boolean;
    protected _item: SohlItem;
    /** Foundry roll mode (public / private GM / blind / self) used when posting to chat. */
    rollMode: string;
    protected _targetValueFunc: (successLevel: number) => number;
    protected _successStarTable: SuccessTestResult.LimitedDescription[];

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
     * @throws If no `parent` is provided.
     */
    constructor(
        data: Partial<SuccessTestResult.Data> = {},
        options: Partial<SuccessTestResult.Options> = {},
    ) {
        if (options.testResult) {
            data = fvttMergeObject(options.testResult.toJSON(), data, {
                inplace: false,
            }) as Partial<SuccessTestResult.Data>;
        }
        super(data, options);
        if (options.mlMod)
            this._masteryLevelModifier =
                data.masteryLevelModifier ??
                new MasteryLevelModifier({}, { parent: this.parent });
        this.resultText = data.resultText ?? "";
        this.resultDesc = data.resultDesc ?? "";
        // Restore a previously-evaluated success level so a result can cross to
        // another client as a read-only snapshot (e.g. the attacker's
        // AttackResult shown on the defender's card). A fresh test leaves this
        // at MARGINAL_FAILURE and computes it in evaluate(); a re-test on the
        // owning client re-evaluates and overwrites it regardless.
        this._successLevel = data.successLevel ?? MARGINAL_FAILURE;
        this._token = data.token ?? null;
        this._masteryLevelModifier =
            data.masteryLevelModifier ??
            new MasteryLevelModifier(
                {},
                {
                    parent: this.parent,
                },
            );
        this._successStars = data.successStars ?? 0;
        this._successStarTable = data.successStarTable || [];
        this.rollMode = data.rollMode || SOHL_SPEAKER_ROLL_MODE.SYSTEM;
        this._testType = data.testType || TEST_TYPE.SUCCESSTEST.id;
        this._roll =
            data.roll ??
            new SimpleRoll(SuccessTestResult.StandardRollData.MARGINAL_FAILURE);
        this._movement =
            data.movement || SUCCESS_TEST_RESULT_MOVEMENT.STATIONARY;
        this._mishaps = new Set<string>(data.mishaps || []);
        this._item = this.parent.item;
        this._canFate =
            (this._item.logic as any).availableFate?.length > 0 &&
            !!data.canFate;
        if (options.chatSpeaker) {
            this._speaker = options.chatSpeaker;
        } else {
            this._speaker = new SohlSpeaker({ token: this._token?.id });
        }
        this._targetValueFunc = data.targetValueFunc || ((sl: number) => sl);
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
    get token(): SohlTokenDocument | null {
        return this._token;
    }

    /**
     * The mastery-level modifier rolled against; its
     * {@link MasteryLevelModifier.constrainedEffective | constrainedEffective}
     * value is the roll-under target for this test.
     */
    get masteryLevelModifier(): MasteryLevelModifier {
        return this._masteryLevelModifier;
    }

    /** Number of success "stars" (quality grade) resolved from the description table in {@link evaluate}. */
    get successStars(): number {
        return this._successStars;
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
        return await inputDialog({
            title: "SOHL.SuccessTestResult.testDialog.title",
            template: testData.template,
            data,
            callback: ((fd: PlainObject) => {
                const formData = fd.object;
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

                // FIXME
                // if (isMovement(data.targetMovement)) {
                //     this.targetMovement = data.targetMovement;
                // } else {
                //     throw new Error(
                //         `Invalid target movement "${data.targetMovement}"`,
                //     );
                // }

                if (callback) callback.call(this, formData);
                return Promise.resolve(true);
            }) as DialogButtonCallback,
        });
    }

    /**
     * Roll the d100 and resolve the outcome against the modifier's
     * {@link MasteryLevelModifier.constrainedEffective | constrained effective}
     * mastery level (roll-under: rolling at or below it succeeds).
     *
     * @remarks
     * Sets the success level from the roll, promoting it to a critical when the
     * last digit appears in the modifier's critical-success/-failure digit
     * lists. It then applies `successLevelMod` and — when criticals are
     * disallowed — clamps the level to marginal failure/success, selects the
     * localized description, and resolves the success-star count from the
     * description table.
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

        this._successStars = handleLimitedDescription(
            this,
            this._successStarTable,
        );
        return allowed;
    }

    /**
     * Render this result with the standard test chat card
     * (`templates/chat/standard-test-card.hbs`) and post it via the
     * {@link speaker}, attaching the Foundry roll and the dice sound.
     *
     * @param data - Extra template data merged into the card.
     */
    async toChat(data: PlainObject = {}): Promise<void> {
        let chatData = fvttMergeObject(this.toJSON() as PlainObject, {
            ...data,
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
        this._speaker.toChat(chatData.template, chatData, options);
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
        /** Short result label (see {@link SuccessTestResult.resultText}). */
        resultText: string;
        /** Longer result description (see {@link SuccessTestResult.resultDesc}). */
        resultDesc: string;
        /** A previously-evaluated success level to restore (e.g. a cross-client snapshot). */
        successLevel: number;
        /** The token the test is associated with. */
        token: SohlTokenDocument;
        /** The mastery-level modifier to test against. */
        masteryLevelModifier: MasteryLevelModifier;
        /** Pre-computed success-star count. */
        successStars: number;
        /** The description table used to resolve {@link SuccessTestResult.resultText | text} and stars. */
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
    export interface LimitedDescription {
        /** Upper bound (inclusive) of target values this row matches. */
        maxValue: number;
        /** Roll last-digits this row applies to; an empty list matches any. */
        lastDigits: number[];
        /** Result label, or a function computing it from the chat data. */
        label: string | ((chatData: PlainObject) => string);
        /** Result description, or a function computing it from the chat data. */
        description: string | ((chatData: PlainObject) => string);
        /** Whether this row represents a success. */
        success: boolean;
        /** Numeric result/quality (e.g. star count), or a function computing it. */
        result: number | ((chatData: PlainObject) => number);
    }
}

/**
 * Resolves a limited-description table against a test result: finds the entry
 * matching the target value and last digit, writes its label/description into
 * `chatData`, and returns the associated numeric result.
 * @param chatData - The test result providing the target value and last digit,
 *   and receiving the resolved `resultText`/`resultDesc`.
 * @param testDescTable - The candidate description entries, sorted by max value.
 * @returns The numeric result of the matching entry, or 0 if none matches.
 */
function handleLimitedDescription(
    chatData: SuccessTestResult,
    testDescTable: SuccessTestResult.LimitedDescription[],
): number {
    if (testDescTable.length === 0) return 0;

    let result: number = 0;
    const targetValue = chatData.targetValue;
    testDescTable.sort((a, b) => a.maxValue - b.maxValue);
    const testDesc: SuccessTestResult.LimitedDescription | undefined =
        testDescTable.find(
            (entry) =>
                entry.maxValue >= targetValue &&
                (entry.lastDigits.length === 0 ||
                    entry.lastDigits.includes(chatData.lastDigit)),
        );
    if (testDesc) {
        const label =
            testDesc.label instanceof Function ?
                testDesc.label(chatData)
            :   testDesc.label;
        const desc =
            testDesc.description instanceof Function ?
                testDesc.description(chatData)
            :   testDesc.description;
        chatData.resultText = label || "";
        chatData.resultDesc = desc || "";
        result =
            typeof testDesc.result === "function" ?
                testDesc.result(chatData)
            :   testDesc.result;
    }

    return result;
}

registerKind(SuccessTestResult.Kind, SuccessTestResult);
