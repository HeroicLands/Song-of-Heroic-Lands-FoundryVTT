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

import type { SuccessTestResult } from "@src/entity/result/SuccessTestResult";
// Side-effect import so SuccessTestResult self-registers — see the header note
// on why this base class reaches the registry by import, not the runtime global.
import "@src/entity/result/SuccessTestResult";
import { entity, registerEntity } from "@src/entity/entityRegistry";
import { defaultToJSON } from "@src/utils/helpers";
import { registerKind } from "@src/utils/kindRegistry";
import { TestResult } from "@src/entity/result/TestResult";
import { SimpleRoll } from "@src/entity/roll/SimpleRoll";
import type { SohlTokenDocument } from "@src/document/token/foundry/SohlTokenDocument";
import {
    isOpposedTestResultTieBreak,
    OPPOSED_TEST_RESULT_TIEBREAK,
    TestType,
} from "@src/utils/constants";

/**
 * How many d10 roll-offs a tie-break attempts before giving up and leaving the
 * contest tied. Only reachable when every roll comes back level, which fair dice
 * make vanishingly unlikely — the bound exists so a caller feeding identical
 * forced values cannot spin forever.
 */
const ROLL_OFF_ATTEMPTS = 20;

/**
 * Localization key naming the rule that settled a broken tie, for the result
 * card. Spelled out per reason (rather than built from the reason) so the keys
 * stay greppable and the coverage check can see them.
 */
const TIE_BREAK_LABEL: Record<OpposedTestResult.TieBreakReason, string> = {
    "": "",
    roll: "SOHL.OpposedTestResult.toChat.tieBreak.roll",
    ml: "SOHL.OpposedTestResult.toChat.tieBreak.ml",
    rolloff: "SOHL.OpposedTestResult.toChat.tieBreak.rolloff",
};

/*
 * ── Construction indirection: base class (#83) ───────────────────────────────
 * Registered entity classes are constructed through the registry so a variant
 * module can override them. Inside SoHL that means `import { entity }` then
 * `new entity.X(...)`; outside SoHL it is `new sohl.entity.X(...)`.
 *
 * OpposedTestResult is a BASE class of another registered class (CombatResult),
 * so it imports the registry from the cycle-free leaf `@src/entity/entityRegistry`
 * (never the `registry.ts` barrel, which eagerly loads the subclass tree and
 * would evaluate `class CombatResult extends OpposedTestResult` mid-load →
 * `TypeError: Class extends value undefined`). The bare side-effect import above
 * guarantees SuccessTestResult self-registers so `entity.SuccessTestResult`
 * resolves even in a bare unit test. See the "Entity class registry" section of
 * kb/dev-docs/reference/runtime-contracts.md.
 * ────────────────────────────────────────────────────────────────────────────
 */
/**
 * The result of an **opposed test** — two actors directly competing via
 * their respective {@link SuccessTestResult | success tests}.
 *
 * Opposed tests are used for contested actions: grappling, stealth vs.
 * perception, persuasion vs. will, and similar skill-vs-skill situations.
 * Each side performs a success test independently, and the results are
 * compared to determine the winner.
 *
 * ## Resolution
 *
 * - {@link sourceTestResult} — the initiating actor's success test
 * - {@link targetTestResult} — the responding actor's success test
 * - Winner determined by comparing success levels, with configurable
 *   tie-breaking rules ({@link tieBreak}, {@link breakTies}).
 *
 * ## Key properties
 *
 * - {@link sourceWins} / {@link targetWins} — outcome flags
 * - {@link isTied} — both sides achieved the same success level
 * - {@link bothFail} — neither side succeeded
 *
 * ## Two-phase execution
 *
 * Opposed tests are executed in two phases:
 * 1. {@link sohl.entity.modifier.MasteryLevelModifier.opposedTestStart} — source rolls and
 *    result is posted to chat with a "respond" button.
 * 2. {@link sohl.entity.modifier.MasteryLevelModifier.opposedTestResume} — target rolls and
 *    the opposed outcome is evaluated and posted.
 *
 * ## Subclass
 *
 * {@link CombatResult} extends this for full combat resolution (attack
 * vs. defense with damage calculation).
 */
export class OpposedTestResult extends TestResult {
    /** The initiating (source) actor's success test. */
    sourceTestResult!: SuccessTestResult;
    /** The responding (target) actor's success test. */
    targetTestResult!: SuccessTestResult;
    /** Foundry roll mode for chat output. */
    rollMode!: string;
    /**
     * Which side a tied contest is awarded to (an
     * {@link OPPOSED_TEST_RESULT_TIEBREAK} value) — `NONE` while the tie stands.
     * Set by `resolveTieBreak`, or supplied up front by a rule that dictates
     * the victor.
     */
    tieBreak!: number;
    /** Whether a tie should be broken (see `resolveTieBreak`) rather than reported as a tie. */
    breakTies!: boolean;
    /** Which rule settled a broken tie, for the card to report; empty while the tie stands. */
    tieBreakReason!: OpposedTestResult.TieBreakReason;

    /**
     * Constructs an opposed test result from a source success test plus either
     * a target success test or a target token (from which a fresh target test
     * is created).
     * @param data - Must provide `sourceTestResult`, and either
     *   `targetTestResult` or `targetToken` (a fresh target success test is
     *   created from the token when only the latter is given).
     * @param options - Result options; `options.parent` is required (base
     *   {@link TestResult}).
     * @throws If `sourceTestResult` is missing, or if neither `targetTestResult`
     *   nor `targetToken` is provided.
     */
    constructor(
        data: Partial<OpposedTestResult.Data> = {},
        options: Partial<OpposedTestResult.Options> = {},
    ) {
        if (!data.sourceTestResult) {
            throw new Error("sourceTestResult must be provided");
        }
        if (!data.targetTestResult && !data.targetToken) {
            throw new Error("Target token or targetTestResult must be provided");
        }
        super(data, options);
        this.sourceTestResult = data.sourceTestResult;

        this.targetTestResult =
            data.targetTestResult ??
            new entity.SuccessTestResult(
                {
                    tokenUuid: data.targetToken?.uuid ?? undefined,
                },
                options,
            );
        this.rollMode = data.rollMode || "roll";
        this.tieBreak =
            isOpposedTestResultTieBreak(data.tieBreak) ?
                data.tieBreak
            :   OPPOSED_TEST_RESULT_TIEBREAK.NONE;
        this.breakTies = !!data.breakTies;
        this.tieBreakReason = data.tieBreakReason ?? "";
    }

    /**
     * Serialize to a plain object satisfying {@link OpposedTestResult.Data}: the
     * inherited {@link TestResult} fields plus both contestants' success tests
     * and the tie-break configuration.
     * @returns The plain-object representation.
     */
    override toJSON(): PlainObject {
        return {
            ...super.toJSON(),
            sourceTestResult: this.sourceTestResult.toJSON(),
            targetTestResult: this.targetTestResult.toJSON(),
            rollMode: this.rollMode,
            tieBreak: this.tieBreak,
            breakTies: this.breakTies,
            tieBreakReason: this.tieBreakReason,
        };
    }

    /** Whether both sides reached the same success level (and at least one succeeded — cf. {@link bothFail}). */
    get isTied(): boolean {
        if (!this.targetTestResult) return false;
        return (
            !this.bothFail &&
            this.sourceTestResult.rawSuccessLevel === this.targetTestResult.rawSuccessLevel
        );
    }

    /** Whether neither side succeeded. */
    get bothFail(): boolean {
        return !this.sourceTestResult?.isSuccess && !this.targetTestResult?.isSuccess;
    }

    /** The active tie-break offset — {@link tieBreak} unless both sides failed, in which case `0`. */
    get tieBreakOffset(): number {
        return !this.bothFail ? this.tieBreak : 0;
    }

    /**
     * Whether this contest was a tie that the tie-break rule then settled — the
     * two sides reached the same success level, but {@link tieBreak} awarded the
     * contest to one of them (see `resolveTieBreak`).
     */
    get isTieBroken(): boolean {
        return this.isTied && this.tieBreakOffset !== OPPOSED_TEST_RESULT_TIEBREAK.NONE;
    }

    /** Whether the source prevails — its success level exceeds the target's, or a tie was broken its way (and not {@link bothFail}). */
    get sourceWins(): boolean {
        let result = false;
        if (
            typeof this.sourceTestResult === "object" &&
            typeof this.targetTestResult === "object"
        ) {
            result =
                !this.bothFail &&
                (this.sourceTestResult.rawSuccessLevel > this.targetTestResult.rawSuccessLevel ||
                    (this.isTieBroken &&
                        this.tieBreakOffset === OPPOSED_TEST_RESULT_TIEBREAK.SOURCE));
        }
        return result;
    }

    /** Whether the target prevails — its success level exceeds the source's, or a tie was broken its way (and not {@link bothFail}). */
    get targetWins(): boolean {
        let result = false;
        if (
            typeof this.sourceTestResult === "object" &&
            typeof this.targetTestResult === "object"
        ) {
            result =
                !this.bothFail &&
                (this.sourceTestResult.rawSuccessLevel < this.targetTestResult.rawSuccessLevel ||
                    (this.isTieBroken &&
                        this.tieBreakOffset === OPPOSED_TEST_RESULT_TIEBREAK.TARGET));
        }
        return result;
    }

    /**
     * **Victory Stars** — how decisively the contest was won: one star per step
     * between the two success levels, or exactly one for a tie settled by the
     * tie-break rule.
     *
     * @remarks
     * The margin has no ceiling. It is measured on the raw
     * ({@link sohl.entity.result.SuccessTestResult.rawSuccessLevel | unclamped})
     * levels, so a modifier that pushes a level past the four-point scale widens
     * the margin with it — a Marginal Success against a Critical Failure worsened
     * by −1 is three stars, not two. An unbroken tie and a mutual failure are both
     * worth none.
     */
    get victoryStars(): number {
        if (this.bothFail) return 0;
        if (this.isTied) return this.isTieBroken ? 1 : 0;
        return Math.abs(
            this.sourceTestResult.rawSuccessLevel - this.targetTestResult.rawSuccessLevel,
        );
    }

    /**
     * {@link victoryStars} as one entry per star for the card to draw — `true`
     * where the star is the **tester's** (drawn filled) and `false` where it is
     * the **target's** (drawn hollow), so a glance at the line says who won as
     * well as by how much. Empty when nobody won.
     *
     * @remarks
     * Marks, not markup: the card turns each entry into a Font Awesome star
     * (`fa-solid` / `fa-regular`), matching how the sheets already draw a filled
     * or hollow flag. Building the `<i>` elements here would put HTML in the
     * Foundry-free layer for no gain.
     */
    get victoryStarMarks(): boolean[] {
        return Array.from({ length: this.victoryStars }, () => !this.targetWins);
    }

    /**
     * Settle a tie when the contest was run with {@link breakTies}, recording the
     * victor in {@link tieBreak} and the deciding rule in {@link tieBreakReason}.
     *
     * @remarks
     * Only a tie in which at least one side *succeeded* can be broken — a mutual
     * failure has no victor to award. The rule is applied in order: the higher
     * d100 takes it; failing that the higher mastery level; failing that both
     * sides roll a d10 until one is higher. Called from {@link evaluate}, and a
     * no-op once a victor is recorded, so re-evaluating never re-rolls a settled
     * contest.
     */
    protected resolveTieBreak(): void {
        if (
            !this.breakTies ||
            !this.isTied ||
            this.tieBreak !== OPPOSED_TEST_RESULT_TIEBREAK.NONE
        ) {
            return;
        }

        const source = this.sourceTestResult;
        const target = this.targetTestResult;

        const award = (
            sourceValue: number,
            targetValue: number,
            reason: OpposedTestResult.TieBreakReason,
        ): boolean => {
            if (sourceValue === targetValue) return false;
            this.tieBreak =
                sourceValue > targetValue ?
                    OPPOSED_TEST_RESULT_TIEBREAK.SOURCE
                :   OPPOSED_TEST_RESULT_TIEBREAK.TARGET;
            this.tieBreakReason = reason;
            return true;
        };

        // The higher d100 takes a broken tie, then the higher mastery level.
        if (award(source.roll.total, target.roll.total, "roll")) return;
        if (
            award(
                source.masteryLevelModifier?.effective ?? 0,
                target.masteryLevelModifier?.effective ?? 0,
                "ml",
            )
        ) {
            return;
        }

        // Still level: a d10 roll-off, repeated until it separates them. Bounded
        // so a caller feeding identical forced values cannot spin forever.
        const d10 = (): number =>
            new SimpleRoll(
                { numDice: 1, dieFaces: 10, modifier: 0 },
                { parent: this.parent },
            ).roll();
        for (let attempt = 0; attempt < ROLL_OFF_ATTEMPTS; attempt++) {
            if (award(d10(), d10(), "rolloff")) return;
        }
    }

    /**
     * Evaluate both sides of the contest, then settle a tie if the contest was
     * run with {@link breakTies}. The winner is otherwise derived on demand from
     * the two success levels ({@link sourceWins} / {@link targetWins} /
     * {@link isTied}).
     *
     * @returns `false` if a test is missing or either side's evaluation is
     *   disallowed (e.g. a permission gate); otherwise `true`.
     */
    override async evaluate(): Promise<boolean> {
        if (this.sourceTestResult && this.targetTestResult) {
            let allowed = await super.evaluate();
            allowed &&= !!(await this.sourceTestResult.evaluate());
            allowed &&= !!(await this.targetTestResult.evaluate());
            if (allowed) this.resolveTieBreak();
            return allowed;
        } else {
            return false;
        }
    }

    /**
     * Post the opposed-test card via the source's speaker — the **request** card
     * (`opposed-request-card.hbs`, with the Respond button) by default, or the
     * **result** card (`opposed-result-card.hbs`) when the caller supplies that
     * `template` (as {@link sohl.entity.modifier.MasteryLevelModifier.opposedTestResume} does).
     *
     * Both sides are shaped into **plain** `sourceTestResult` / `targetTestResult`
     * data (title, token, item, mlMod display fields, roll, outcome flags) rather
     * than the live results, because the delegated
     * {@link sohl.entity.result.SuccessTestResult.toChat} folds this through
     * `fvttMergeObject`, which deep-copies and would strip a live instance's
     * getters. That delegation also honors the caller's `template` now (#845), so
     * the opposed card is no longer overridden by the standard test card.
     *
     * @param data - Extra template data; `template` / `title` select and label
     *   the card (request vs. result).
     */
    async toChat(data: PlainObject = {}): Promise<void> {
        const shape = (r: SuccessTestResult) => ({
            title: r.title,
            description: r.description,
            testType: r.testType,
            isSuccess: r.isSuccess,
            isCritical: r.isCritical,
            targetMovement: r.movement,
            roll: { total: r.roll.total },
            mlMod: {
                chatHtml: r.masteryLevelModifier.chatHtml,
                effective: r.masteryLevelModifier.effective,
                successLevelMod: r.masteryLevelModifier.successLevelMod,
            },
            token: {
                name: r.token?.name ?? "",
                uuid: r.token?.uuid ?? "",
                actor: { uuid: r.item?.actor?.uuid ?? "" },
            },
            item: { name: r.item?.name ?? "", uuid: r.item?.uuid ?? "" },
            actor: { uuid: r.item?.actor?.uuid ?? "" },
        });

        const msgData: PlainObject = {
            // The contest's own visibility, applied by the delegate below. The
            // default (`"roll"`) means "the client's configured mode", so this
            // changes nothing until someone sets a mode — as the GM edit pencil
            // does from its Roll Visibility field (#1099).
            rollMode: this.rollMode,
            template:
                (data.template as string | undefined) ??
                "systems/sohl/templates/chat/opposed-request-card.hbs",
            // Localized here, not handed to the card as a bare key: the template
            // prints `{{title}}` verbatim, so the raw key would show up in the
            // header of every request card (#1161).
            title:
                (data.title as string | undefined) ??
                sohl.i18n.localize("SOHL.OpposedTestResult.toChat.title"),
            sourceTestResult: shape(this.sourceTestResult),
            targetTestResult: shape(this.targetTestResult),
            sourceWins: this.sourceWins,
            targetWins: this.targetWins,
            // A contest with no winner is either a tie or a mutual failure; the
            // card must tell them apart rather than calling both "Both Fail!"
            // (#1081).
            isTied: this.isTied,
            bothFail: this.bothFail,
            // A tie the tie-break rule settled reports the winner plus which rule
            // decided it, so the players can see why (#1160).
            isTieBroken: this.isTieBroken,
            tieBreakKey: TIE_BREAK_LABEL[this.tieBreakReason],
            vsStars: this.victoryStarMarks,
            vsCount: this.victoryStars,
            // The Respond button's `scope` payload: the whole opposed test,
            // serialized as one `data-scope` blob and revived as a live
            // `OpposedTestResult` by the dispatch handler.
            scopeData: defaultToJSON({ opposedTestResult: this }),
            // The opposed test is token-addressed: the Respond button resolves on
            // the TARGET token (`SohlTokenDocument.onChatCardButton` →
            // `SohlTokenDocumentLogic.opposedTestResume`).
            targetToken: {
                name: this.targetTestResult.token?.name ?? "",
                uuid: this.targetTestResult.token?.uuid ?? "",
            },
            opposedTests: [
                {
                    action: "opposedTestResume",
                    icon: "fa-solid fa-reply",
                    label: sohl.i18n.localize("SOHL.OpposedTestResult.toChat.respond"),
                },
            ],
            description: sohl.i18n.format("SOHL.OpposedTestResult.toChat.description", {
                targetActorName: this.targetTestResult.token?.name,
            }),
        };

        // Deliberately no `rolls` here. Whatever this passes along becomes part of
        // the ChatMessage payload, and a SoHL `SimpleRoll` is not a Foundry `Roll`:
        // handing the two contestants' dice over under `rolls` failed the
        // document's validation, so `ChatMessage.create` returned nothing and
        // **no opposed card was ever posted**. The delegate below attaches the
        // source's die properly (converted, as the message's roll); both totals are
        // shaped into the card data above, which is what the card actually reads.
        await this.sourceTestResult.toChat(msgData);
    }
}

export namespace OpposedTestResult {
    /** Registry key identifying this result kind for serialization. */
    export const Kind: string = "OpposedTestResult";

    /**
     * Which rule settled a broken tie: the higher d100 (`"roll"`), the higher
     * mastery level (`"ml"`), or a d10 roll-off (`"rolloff"`). Empty when no tie
     * was broken.
     */
    export type TieBreakReason = "" | "roll" | "ml" | "rolloff";

    /** Construction data for an {@link OpposedTestResult}. */
    export interface Data extends TestResult.Data {
        /** The initiating actor's success test. */
        sourceTestResult: SuccessTestResult;
        /** The responding actor's success test (or built from {@link targetToken}). */
        targetTestResult: SuccessTestResult;
        /** Foundry roll mode for chat output. */
        rollMode: string;
        /** The side a tie is awarded to (an {@link OPPOSED_TEST_RESULT_TIEBREAK} value). */
        tieBreak: number;
        /** Whether a tie should be broken rather than reported as a tie. */
        breakTies: boolean;
        /** Which rule settled a broken tie. */
        tieBreakReason: TieBreakReason;
        /** The target's token, used to build a target test when one isn't supplied. */
        targetToken: SohlTokenDocument | null;
    }

    export interface Options extends TestResult.Options {}

    /** Scope passed to actions that start or resume an opposed test. */
    export interface ContextScope {
        /** The opposed test being resumed, if any. */
        priorTestResult?: OpposedTestResult | null;
        /** Suppress chat output when set. */
        noChat?: boolean;
        /** The test type to run. */
        type?: TestType;
        /** Skip the pre-roll dialog when set. */
        skipDialog?: boolean;
        /** Override the result title. */
        title?: string;
        /** The contest's target token. */
        targetToken?: SohlTokenDocument;
        /** A situational modifier to apply to the source's test. */
        situationalModifier?: number;
        /** A pre-rolled source success test to reuse. */
        sourceSuccessTestResult?: SuccessTestResult;
        /** Show the **Break Ties** checkbox on the initiator's pre-roll dialog. */
        askBreakTies?: boolean;
        /** Whether a tie in this contest should be broken (the dialog's answer). */
        breakTies?: boolean;
    }
}

registerKind(OpposedTestResult.Kind, OpposedTestResult);
registerEntity("OpposedTestResult", OpposedTestResult);
