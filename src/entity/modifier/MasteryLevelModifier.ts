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

import { dialog, fvttGetTargetedTokens } from "@src/core/FoundryHelpers";
import { registerKind } from "@src/utils/kindRegistry";
import { entity, registerEntity } from "@src/entity/entityRegistry";
import { ValueModifier } from "@src/entity/modifier/ValueModifier";
import { SafeExpression } from "@src/entity/expr/SafeExpression";
import {
    reviveLimitedDescriptionTable,
    serializeLimitedDescriptionTable,
    type SuccessTestResult,
} from "@src/entity/result/SuccessTestResult";
import type { OpposedTestResult } from "@src/entity/result/OpposedTestResult";
// Side-effect imports so the result classes self-register — this base class
// reaches the registry by import, not the runtime global (see header note).
import "@src/entity/result/SuccessTestResult";
import "@src/entity/result/OpposedTestResult";
import { FilePath, toFilePath } from "@src/utils/helpers";
import {
    SOHL_SPEAKER_ROLL_MODE,
    TestType,
    VALUE_DELTA_INFO,
} from "@src/utils/constants";
import { SohlActionContext } from "@src/entity/action/SohlActionContext";
import { SohlEntity } from "../SohlEntity";
import type { SohlLogic } from "@src/core/logic/SohlLogic";

/**
 * Returns the standard success-value table with labels/descriptions resolved from i18n.
 *
 * @returns Array of {@link sohl.entity.result.SuccessTestResult.LimitedDescription} entries covering
 *   every success level from "no value" through "critical success".
 */
export function getStandardSuccessValueTable(): SuccessTestResult.LimitedDescription[] {
    const loc = (key: string) => sohl.i18n.localize(key);
    return [
        {
            maxValue: 0,
            label: loc("SOHL.MasteryLevel.SvTable.noValue.label"),
            description: loc("SOHL.MasteryLevel.SvTable.noValue.description"),
            lastDigits: [],
            success: false,
            result: 0,
        },
        {
            maxValue: 2,
            label: loc("SOHL.MasteryLevel.SvTable.littleValue.label"),
            description: loc(
                "SOHL.MasteryLevel.SvTable.littleValue.description",
            ),
            lastDigits: [],
            success: true,
            result: 0,
        },
        {
            maxValue: 4,
            label: loc("SOHL.MasteryLevel.SvTable.baseValue.label"),
            description: loc("SOHL.MasteryLevel.SvTable.baseValue.description"),
            lastDigits: [],
            success: true,
            result: 0,
        },
        {
            maxValue: 5,
            label: loc("SOHL.MasteryLevel.SvTable.bonus1.label"),
            description: loc("SOHL.MasteryLevel.SvTable.bonus1.description"),
            lastDigits: [],
            success: true,
            result: 1,
        },
        {
            maxValue: 6,
            label: loc("SOHL.MasteryLevel.SvTable.bonus2.label"),
            description: loc("SOHL.MasteryLevel.SvTable.bonus2.description"),
            lastDigits: [],
            success: true,
            result: 2,
        },
        {
            maxValue: 7,
            label: loc("SOHL.MasteryLevel.SvTable.bonus3.label"),
            description: loc("SOHL.MasteryLevel.SvTable.bonus3.description"),
            lastDigits: [],
            success: true,
            result: 3,
        },
        {
            maxValue: 8,
            label: loc("SOHL.MasteryLevel.SvTable.bonus4.label"),
            description: loc("SOHL.MasteryLevel.SvTable.bonus4.description"),
            lastDigits: [],
            success: true,
            result: 4,
        },
        {
            maxValue: Number.MAX_SAFE_INTEGER,
            label: loc("SOHL.MasteryLevel.SvTable.bonus5.label"),
            description: loc("SOHL.MasteryLevel.SvTable.bonus5.description"),
            lastDigits: [],
            success: true,
            result: 5,
        },
    ];
}

/**
 * The standard success-level description table, owned by `parent`.
 *
 * A builder (not a shared const) because two rows compute their star count with a
 * {@link sohl.entity.expr.SafeExpression} — data that serializes across clients,
 * unlike the raw functions this replaced — and a `SafeExpression` needs an owning
 * `parent` logic. Built fresh per modifier so the expressions are parented
 * correctly.
 *
 * @param parent - The logic owning the table's expressions.
 * @returns The standard success-level description table.
 */
function getStandardSuccessDescriptionTable(
    parent: SohlLogic<any>,
): SuccessTestResult.LimitedDescription[] {
    return [
        {
            maxValue: -1,
            label: "",
            description: "",
            lastDigits: [],
            success: false,
            result: new SafeExpression(
                { source: "successLevel + 1" },
                { parent },
            ),
        },
        {
            maxValue: 0,
            label: "",
            description: "",
            lastDigits: [],
            success: false,
            result: 0,
        },
        {
            maxValue: 1,
            label: "",
            description: "",
            lastDigits: [],
            success: true,
            result: 0,
        },
        {
            maxValue: Number.MAX_SAFE_INTEGER,
            label: "",
            description: "",
            lastDigits: [],
            success: true,
            result: new SafeExpression(
                { source: "successLevel - 1" },
                { parent },
            ),
        },
    ];
}

/*
 * ── Construction indirection: base class (#83) ───────────────────────────────
 * Registered entity classes are constructed through the registry so a variant
 * module can override them. Inside SoHL that means `import { entity }` then
 * `new entity.X(...)`; outside SoHL it is `new sohl.entity.X(...)`.
 *
 * MasteryLevelModifier is a BASE class of another registered class
 * (CombatModifier) and extends the registered ValueModifier, so it imports the
 * registry from the cycle-free leaf `@src/entity/entityRegistry` (never the
 * `registry.ts` barrel, which eagerly loads the subclass tree and would evaluate
 * a subclass's `extends` mid-load → `TypeError: Class extends value undefined`).
 * The bare side-effect imports above guarantee the result classes self-register
 * so `entity.SuccessTestResult` / `entity.OpposedTestResult` resolve even in a
 * bare unit test. See the "Entity class registry" section of
 * docs/reference/runtime-contracts.md.
 * ────────────────────────────────────────────────────────────────────────────
 */
/**
 * A {@link ValueModifier} specialized for mastery level tests — the primary
 * resolution mechanic in SoHL.
 *
 * Extends ValueModifier with test-specific state and the ability to
 * execute success tests, success value tests, and opposed tests.
 *
 * ## Test-specific properties
 *
 * - **minTarget / maxTarget** — clamp the effective mastery level to a
 *   valid range. `constrainedEffective` returns the clamped value.
 * - **successLevelMod** — flat offset to the success level after the
 *   roll (e.g., fate bonuses).
 * - **critFailureDigits / critSuccessDigits** — last-digit lists that
 *   trigger critical results (e.g., `[0, 5]` means rolls ending in 0
 *   or 5 are critical).
 * - **testDescTable** — maps success levels to descriptive labels and
 *   star ratings for chat output.
 * - **svTable** — maps success levels to success value results for
 *   value-producing tests.
 *
 * ## Test methods
 *
 * - {@link successTest} — standard d100 test against the constrained
 *   effective mastery level. Displays a dialog (unless suppressed) to
 *   collect situational modifiers, rolls, evaluates, and posts to chat.
 * - {@link successValueTest} — like successTest but produces a success
 *   value (quality of result) rather than just pass/fail.
 * - {@link opposedTestStart} — initiates an opposed test by performing
 *   the source actor's success test and creating an
 *   {@link OpposedTestResult} awaiting the target's response.
 * - {@link opposedTestResume} — completes an opposed test by performing
 *   the target actor's success test and evaluating the opposed outcome.
 *
 * ## Lifecycle
 *
 * Created during the owning logic's `initialize` phase with a base from
 * the persisted mastery level. Deltas are added during evaluate/finalize
 * (e.g., injury penalties, equipment bonuses, situational modifiers from
 * the test dialog). Rebuilt each preparation cycle like all ValueModifiers.
 */
export class MasteryLevelModifier extends ValueModifier {
    /** Lower clamp on the effective mastery level — the roll-under target can't go below this. */
    minTarget: number;
    /** Upper clamp on the effective mastery level — the roll-under target can't exceed this. */
    maxTarget: number;
    /** Flat offset applied to the success level after the roll (e.g. a fate bonus). */
    successLevelMod: number;
    /** Roll last-digits that make a failure critical (e.g. `[0]`). */
    critFailureDigits: number[];
    /** Roll last-digits that make a success critical (e.g. `[5]`). */
    critSuccessDigits: number[];
    /** Description table mapping success levels to labels and star ratings for chat output. */
    testDescTable: SuccessTestResult.LimitedDescription[];
    /** Success-value table mapping success levels to graded results for value-producing tests. */
    svTable: SuccessTestResult.LimitedDescription[];
    /** Identifier for the kind of test (used in dialogs and chat). */
    type: string;
    /** Display title for the test. */
    title: string;

    /**
     * The effective mastery level clamped to [{@link minTarget},
     * {@link maxTarget}] — the actual roll-under target a success test uses.
     */
    get constrainedEffective(): number {
        return Math.min(
            this.maxTarget,
            Math.max(this.minTarget, this.effective),
        );
    }

    /**
     * Construct an empty mastery level modifier owned by `parent` — shorthand
     * for `new MasteryLevelModifier({}, { parent })`.
     * @param parent - The owning {@link sohl.core.logic.SohlLogic}.
     */
    constructor(parent: SohlLogic<any>);
    /**
     * Builds a mastery level modifier, applying defaults for target bounds,
     * crit-digit lists, success/value tables, and the test type and title.
     *
     * @param data - Test data; targets default to unbounded, crit-digit lists to
     *   empty, and the description/value tables to the standard ones.
     * @param options - Must provide `options.parent` (base {@link ValueModifier}).
     */
    constructor(
        data: Partial<MasteryLevelModifier.Data>,
        options: Partial<MasteryLevelModifier.Options>,
    );
    /**
     * Implementation backing the constructor overloads: normalizes the
     * `(parent)` shorthand and requires a resolved parent.
     * @param dataOrParent - Test data, or the owning parent Logic (shorthand).
     * @param options - Construction options; `options.parent` is required in the
     *   data form.
     * @throws If no `parent` resolves.
     */
    constructor(
        dataOrParent: SohlEntity.DataOrParent<MasteryLevelModifier.Data> = {},
        options: Partial<MasteryLevelModifier.Options> = {},
    ) {
        super(
            SohlEntity.dataOf<MasteryLevelModifier.Data>(dataOrParent),
            SohlEntity.optionsOf<MasteryLevelModifier.Options>(
                dataOrParent,
                options,
            ),
        );
        const data = SohlEntity.dataOf<MasteryLevelModifier.Data>(dataOrParent);
        this.minTarget = data.minTarget ?? Number.MIN_SAFE_INTEGER;
        this.maxTarget = data.maxTarget ?? Number.MAX_SAFE_INTEGER;
        this.successLevelMod = data.successLevelMod ?? 0;
        this.critFailureDigits = data.critFailureDigits ?? [];
        this.critSuccessDigits = data.critSuccessDigits ?? [];
        // Tables ride the wire as data; revive any serialized SafeExpression rows
        // into live expressions owned by this modifier's parent.
        this.testDescTable =
            data.testDescTable ?
                reviveLimitedDescriptionTable(data.testDescTable, this.parent)
            :   getStandardSuccessDescriptionTable(this.parent);
        this.svTable =
            data.svTable ?
                reviveLimitedDescriptionTable(data.svTable, this.parent)
            :   getStandardSuccessValueTable();
        this.type =
            data.type ?? `${this.parent.data.kind}-${this.parent.name}-test`;
        this.title =
            data.title ??
            sohl.i18n.format("SOHL.MasteryLevelModifier.successTest", {
                label: this.parent.label,
            });
    }

    /**
     * Serialize to a plain object satisfying {@link MasteryLevelModifier.Data}:
     * the inherited {@link ValueModifier} fields plus the test-resolution
     * parameters (target clamps, crit digits, tables, type, title).
     * @returns The plain-object representation.
     */
    override toJSON(): PlainObject {
        return {
            ...super.toJSON(),
            minTarget: this.minTarget,
            maxTarget: this.maxTarget,
            successLevelMod: this.successLevelMod,
            critFailureDigits: [...this.critFailureDigits],
            critSuccessDigits: [...this.critSuccessDigits],
            testDescTable: serializeLimitedDescriptionTable(this.testDescTable),
            svTable: serializeLimitedDescriptionTable(this.svTable),
            type: this.type,
            title: this.title,
        };
    }

    /**
     * Performs a Mastery Level success test.
     * @remarks
     * If no `priorTestResult` is provided, this method creates a new test result
     * from the mastery level of the current item, collects situational modifiers,
     * and evaluates the outcome — which rolls the d100 (see
     * {@link sohl.entity.result.SuccessTestResult.evaluate}).
     *
     * If a `priorTestResult` is provided, this method collects modifiers but
     * applies them to the prior test's roll (without rolling again), generating a
     * new test result from the modifiers and the prior roll. This is what lets
     * modifiers be changed without disturbing the random roll — e.g. when fate is
     * applied to an already-rolled test.
     *
     * **Interactive vs. headless.** By default the modifiers are collected from a
     * pre-roll dialog. When `context.skipDialog` is set — the path timed and
     * automated effects use, since they run on the active GM with no user present
     * — the dialog is bypassed and the situational modifier is read from
     * `context.scope.situationalModifier` instead. Set `context.noChat` to
     * suppress the result chat card (e.g. to avoid spamming a card per checkpoint
     * when a timed handler catches up many elapsed occurrences).
     *
     * The result is attributed to `context.speaker` (falling back to the owning
     * document's speaker); evaluation is refused — returning `false` — if that
     * speaker is not owned by the running user (a GM-fired event owns every
     * actor).
     *
     * @param context - The context in which to perform the test.
     * @returns A Promise resolving to `undefined` if the test was cancelled, `false`
     * if there was an error during the test (including an unowned speaker), or the
     * result of the success test.
     * @throws {Error} If `SuccessTestResult` construction fails (internal error).
     */
    async successTest(
        context: SohlActionContext<Partial<SuccessTestResult.ContextScope>>,
    ): Promise<SuccessTestResult | undefined | false> {
        context.scope ??= {} as Partial<SuccessTestResult.ContextScope>;
        context.scope.targetValueFunc ??= (sl: number) => sl;
        context.scope.successStarTable ??= this.testDescTable;

        const testResult: SuccessTestResult =
            context.scope.priorTestResult ??
            new entity.SuccessTestResult(
                {
                    speaker: this.parent.speaker,
                    testType: (context.type ?? this.type) as TestType,
                    title: context.title ?? this.title,
                    masteryLevelModifier: this.clone(
                        this.parent,
                    ) as MasteryLevelModifier,
                    targetValueFunc: context.scope.targetValueFunc,
                    successStarTable: context.scope.successStarTable,
                },
                {
                    parent: this.parent,
                    // Attribute the result to the acting speaker so evaluate()
                    // may resolve it — it refuses to roll on behalf of a speaker
                    // the running user does not own. A GM-fired timed event
                    // satisfies this for any actor.
                    chatSpeaker: context.speaker ?? this.parent.speaker,
                },
            );
        if (!testResult) {
            throw new Error("Failed to create SuccessTestResult.");
        }

        // Situational inputs come from the pre-roll dialog interactively, or —
        // when context.skipDialog bypasses it (headless / automated / GM-fired
        // timed effects) — straight from the action scope (see
        // SohlActionContext.skipDialog).
        let dlgResult:
            | {
                  situationalModifier: number;
                  successLevelMod: number;
                  rollMode: string;
              }
            | undefined;
        if (context.skipDialog) {
            dlgResult = {
                situationalModifier: context.scope.situationalModifier ?? 0,
                successLevelMod: 0,
                rollMode: testResult.rollMode,
            };
        } else {
            const dlgTemplate: FilePath = toFilePath(
                "systems/sohl/templates/dialog/standard-test-dialog.hbs",
            );
            const dialogData: PlainObject = {
                type: testResult.testType,
                title: sohl.i18n.format(
                    "SOHL.MasteryLevelModifier.successTest.dialogTitle",
                    {
                        name: testResult.speaker.name,
                        title: testResult.testType,
                    },
                ),
                mlMod: testResult.masteryLevelModifier,
                situationalModifier: context.scope.situationalModifier ?? 0,
                rollMode: testResult.rollMode,
                rollModes: Object.entries(SOHL_SPEAKER_ROLL_MODE).map(
                    ([k, v]) => ({
                        group: "CHAT.RollDefault",
                        value: k,
                        label: v,
                    }),
                ),
            };
            dlgResult = await dialog({
                title: sohl.i18n.format(
                    "SOHL.MasteryLevelModifier.successTest.dialogLabel",
                ),
                template: dlgTemplate,
                data: dialogData,
                callback: (formData: PlainObject) => ({
                    situationalModifier:
                        parseInt(String(formData.situationalModifier), 10) || 0,
                    successLevelMod:
                        parseInt(String(formData.successLevelMod), 10) || 0,
                    rollMode: String(formData.rollMode),
                }),
                rejectClose: false,
            });
        }

        // A dismissed dialog cancels the test; a bypass always yields values.
        if (!dlgResult) return undefined;

        if (dlgResult.situationalModifier) {
            testResult.masteryLevelModifier.add(
                VALUE_DELTA_INFO.PLAYER,
                dlgResult.situationalModifier,
            );
        }
        testResult.masteryLevelModifier.successLevelMod =
            dlgResult.successLevelMod;
        testResult.rollMode = dlgResult.rollMode;

        let allowed: boolean = await testResult.evaluate();

        if (allowed && !context.noChat) {
            await testResult.toChat(this.parent.speaker);
        }
        return allowed ? testResult : false;
    }

    /**
     * Perform a **success value** test — a success test whose outcome is graded
     * into a quality/quantity result (a "success value") via {@link svTable},
     * rather than reported as a simple pass/fail.
     *
     * @param context - The action context for the test.
     * @returns The evaluated {@link sohl.entity.result.SuccessTestResult}, `null` if cancelled, or
     *   `false` on error.
     */
    async successValueTest(
        context: SohlActionContext,
    ): Promise<SuccessTestResult | undefined | false> {
        const callerScope =
            context.scope as Partial<SuccessTestResult.ContextScope>;
        const svTestContext = new SohlActionContext({
            speaker: context.speaker,
            type: `${this.parent.data.kind}-${this.parent.name}-success-value-test`,
            title: sohl.i18n.format(
                "SOHL.MasteryLevelModifier.successValueTest",
                {
                    name: this.parent.label,
                },
            ),
            noChat: true,
            scope: {
                ...callerScope,
                situationalModifier: callerScope.situationalModifier ?? 0,
                targetValueFunc: (successLevel: number) =>
                    this.index + successLevel - 1,
                successStarTable: this.svTable,
            },
        });

        return this.successTest(svTestContext);
    }

    /**
     * Perform an opposed test
     *
     * @remarks
     * This method handles both starting a new opposed test and resuming
     * an existing one. If `context.priorTestResult` is not provided, a new
     * opposed test is started by creating a new `OpposedTestResult` with
     * the current `SuccessTestResult` as the source test. If
     * `context.priorTestResult` is provided, it is assumed to be an existing
     * `OpposedTestResult` that needs to be completed by performing the target
     * test.
     * @param context - The action context; `context.scope.priorTestResult`
     *   resumes an existing opposed test, otherwise a new one is started.
     * @returns The resulting opposed test, or `null` when no target is available.
     */
    async opposedTestStart(
        context: SohlActionContext,
    ): Promise<OpposedTestResult | null> {
        const scope: Partial<OpposedTestResult.ContextScope> =
            context.scope || {};

        let sourceTestResult: SuccessTestResult | false | null | undefined =
            scope.priorTestResult?.sourceTestResult;

        if (!sourceTestResult) {
            // No prior test result, so we are starting a new opposed test.
            // Setup the context for the source test.
            scope.targetToken ??= fvttGetTargetedTokens(true)?.[0];
            if (!scope.targetToken) return null;
            scope.situationalModifier ??= 0;
            scope.type ??= `${this.parent.kind}-${this.parent.name}-opposedtest`;
            scope.title ??= sohl.i18n.format("{label} Opposed Test", {
                label: this.parent.label,
            });

            if (!scope.targetToken.isOwner) {
                sohl.log.uiWarn(
                    sohl.i18n.format(
                        "You do not have permissions to perform this operation on {name}",
                        { name: scope.targetToken.name },
                    ),
                );
                return null;
            }
        }

        foundry.utils.mergeObject(
            context,
            {
                scope: {
                    priorTestResult: {
                        sourceTestResult,
                    },
                },
            },
            { inplace: true },
        );

        // Perform the success test for the source actor.
        sourceTestResult = await this.successTest(context);

        if (!sourceTestResult) return null;

        const result: OpposedTestResult = new entity.OpposedTestResult(
            {
                sourceTestResult,
                targetTestResult: undefined,
                targetToken: scope.targetToken,
            },
            {
                ...context,
                parent: this.parent,
            },
        );

        await result.toChat();
        return result;
    }

    /**
     * Complete an opposed test by rolling the **target's** side and evaluating
     * the contest.
     *
     * @remarks
     * If the target hasn't rolled yet, its success test is performed and stored
     * on the opposed result; if it already has (a GM editing a prior result),
     * both sides' dialogs are re-shown. The opposed outcome is then evaluated
     * and posted to chat unless `context.noChat` is set.
     *
     * @param context - The action context; must carry the in-progress opposed
     *   result in `scope.priorTestResult` (from {@link opposedTestStart}).
     * @returns The evaluated {@link OpposedTestResult}, `false` if a side's test
     *   was cancelled or failed, or `null`.
     * @throws If `scope.priorTestResult` is missing.
     */
    async opposedTestResume(
        context: SohlActionContext,
    ): Promise<OpposedTestResult | false | undefined> {
        const scope: Partial<OpposedTestResult.ContextScope> =
            context.scope || {};

        if (!scope.priorTestResult) {
            throw new Error("Must supply priorTestResult");
        }

        let opposedTestResult: OpposedTestResult = scope.priorTestResult;
        const successTestContext = context.clone();

        if (!opposedTestResult.targetTestResult) {
            successTestContext.scope = {
                situationalModifier: 0,
            };
            const targetTestResult = await this.successTest(successTestContext);
            if (!targetTestResult) return targetTestResult;
            opposedTestResult.targetTestResult = targetTestResult;
        } else {
            // In this situation, where the targetTestResult is provided,
            // the GM is modifying the result of a prior opposedTest.
            // Therefore, we re-display the dialog for each of the prior
            // successTests.
            successTestContext.scope = {
                priorTestResult: opposedTestResult.targetTestResult,
            };
            let maybeTestResult =
                await opposedTestResult.sourceTestResult.masteryLevelModifier.successTest(
                    successTestContext,
                );
            if (!maybeTestResult) return maybeTestResult;
            opposedTestResult.targetTestResult = maybeTestResult;
        }

        let allowed = await opposedTestResult.evaluate();

        if (allowed && !context.noChat) {
            void opposedTestResult.toChat({
                template: "systems/sohl/templates/chat/opposed-result-card.hbs",
                title: sohl.i18n.format("Opposed Action Result"),
            });
        }

        return allowed ? opposedTestResult : false;
    }
}

export namespace MasteryLevelModifier {
    /**
     * Registry key identifying this modifier kind for serialization. Typed as
     * `string` (not the literal) so subclasses can override it with their own
     * kind without breaking static-side inheritance.
     */
    export const Kind: string = "MasteryLevelModifier";

    /** Construction data for a {@link MasteryLevelModifier}. */
    export interface Data extends ValueModifier.Data {
        /** Lower clamp on the effective mastery level. */
        minTarget: number;
        /** Upper clamp on the effective mastery level. */
        maxTarget: number;
        /** Flat success-level offset applied after the roll. */
        successLevelMod: number;
        /** Roll last-digits that make a failure critical. */
        critFailureDigits: number[];
        /** Roll last-digits that make a success critical. */
        critSuccessDigits: number[];
        /** Description table for chat output. */
        testDescTable: SuccessTestResult.LimitedDescription[];
        /** Success-value table for value-producing tests. */
        svTable: SuccessTestResult.LimitedDescription[];
        /** Identifier for the kind of test. */
        type: string;
        /** Display title for the test. */
        title: string;
    }

    export interface Options extends ValueModifier.Options {}
}

registerKind(MasteryLevelModifier.Kind, MasteryLevelModifier);
registerEntity("MasteryLevelModifier", MasteryLevelModifier);
