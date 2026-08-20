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

import { entity } from "@src/entity/registry";
import type { MysteryLogic } from "./MysteryLogic";
import {
    SafeExpression,
    SafeExpressionError,
} from "@src/entity/expr/SafeExpression";
import { expressionScopes } from "@src/entity/expr/ExpressionScopeRegistry";
import { SohlActionContext } from "@src/entity/action/SohlActionContext";
import type { MasteryLevelModifier } from "@src/entity/modifier/MasteryLevelModifier";
import type { ValueModifier } from "@src/entity/modifier/ValueModifier";
import { StrikeModeBase } from "@src/entity/strikemode/StrikeModeBase";
import { MeleeStrikeMode } from "@src/entity/strikemode/MeleeStrikeMode";
import { applyProneMeleePenalty } from "@src/entity/strikemode/prone";
import { applyWielderStrengthImpact } from "@src/document/item/logic/wielderStrength";
import { applyGoverningMasteryLevel } from "@src/entity/strikemode/governing";
import { resolveAssocSkill } from "@src/document/item/logic/resolveAssocSkill";
import { calcMasteryBoost } from "@src/document/item/logic/masteryBoost";
import { skillAptitudeFor } from "@src/document/item/logic/skill-aptitudes";
import type { FateOutcome } from "@src/document/item/logic/fate";
import {
    AURA_SHORTCODE,
    availableFateFor,
    buildFateMasteryLevel,
    getFateDescTable,
    performFateTest,
    postFateResultCard,
    type FateHost,
} from "@src/document/item/logic/fate-host";
import { perceptionPenaltyApplies } from "@src/document/item/logic/worn-armour-effects";
import type { MissileStrikeMode } from "@src/entity/strikemode/MissileStrikeMode";
import { SuccessTestResult } from "@src/entity/result/SuccessTestResult";
import type { OpposedTestResult } from "@src/entity/result/OpposedTestResult";
import {
    ACTION_SUBTYPE,
    ITEM_KIND,
    SKILL_SUBTYPE,
    SOHL_ACTION_SCOPE,
    SOHL_CONTEXT_MENU_SORT_GROUP,
    STATUS_EFFECT,
    STRIKE_MODE_TYPE,
    VALUE_DELTA_ID,
    VALUE_DELTA_INFO,
    type SkillSubType,
} from "@src/utils/constants";
import { SimpleRoll } from "@src/entity/roll/SimpleRoll";
import { SohlItemBaseLogic, type SohlItemData } from "./SohlItemBaseLogic";
import {
    anyMeleeStrikeMode,
    runStrikeModeTest,
    type StrikeModeTestScope,
} from "./strikeModeTest";
import {
    defineImproveSdrActions,
    improveWithSDR,
    setImproveFlag,
    toggleImproveFlag,
    unsetImproveFlag,
} from "./improve-sdr";
import {
    fvttIsCurrentUserGM,
    fvttActiveTokenLogicForActor,
    fvttActorStatuses,
} from "@src/core/FoundryHelpers";
import { AttributeLogic } from "./AttributeLogic";
import { getActorBody } from "@src/document/actor/logic/BodyLogic";
import { SohlAction } from "@src/entity/action/SohlAction";

/**
 * A trained capability with a mastery level.
 *
 * Skills represent learned abilities that characters use to accomplish tasks:
 * combat techniques, social interactions, crafting, perception, and more.
 * Each skill has a **skill base formula** (typically derived from one or more
 * traits like Strength, Dexterity, or Aura) and a **mastery level** representing
 * training and experience.
 *
 * Skills are categorized by {@link SkillData.subType | subType} (e.g., combat,
 * social, physical) and may be associated with a **weapon group** or a
 * **mystery**. A skill can also reference a **base skill** from which
 * it derives or shares advancement.
 *
 * Skills are the primary mechanism for resolving actions in SoHL. When a
 * character attempts a task, the relevant skill's mastery level is tested
 * against a target number, with modifiers from traits, gear, conditions,
 * and situational factors.
 *
 * Mastery level progression, fate integration, and SDR improvement are built
 * on {@link sohl.entity.modifier.MasteryLevelModifier}.
 *
 * @typeParam TData - The Skill data interface.
 */
export class SkillLogic<
    TData extends SkillData = SkillData,
> extends SohlItemBaseLogic<TData> {
    /**
     * The parent (base) skill this skill specializes, resolved during
     * {@link evaluate} from {@link SkillData.parentSkillCode}, or `null` if
     * this skill has no parent.
     */
    parentSkill!: SkillLogic | null;

    /**
     * The number of mastery-level boosts applied to this skill. Each boost
     * raises the base mastery level by an amount that diminishes at higher
     * levels (see `calcMasteryBoost`).
     */
    boosts!: number;

    /**
     * The computed skill base value, derived from
     * {@link SkillData.skillBaseFormula} — a value-returning
     * {@link sohl.entity.expr.SafeExpression} — evaluated against the actor's
     * attribute **values** (the `attr.<shortcode>` namespace).
     * `0` when the formula is blank, invalid, or off an actor.
     */
    skillBase!: number;

    /**
     * The parsed Skill-Base {@link sohl.entity.expr.SafeExpression}, or `null`
     * when the formula is blank or failed to compile/evaluate. Retained so
     * attribute-dependency predicates (e.g. the Aura → no-fate gate) can walk the
     * AST via {@link sohl.entity.expr.SafeExpression.attrRefs} rather than a regex.
     */
    skillBaseExpr!: SafeExpression | null;

    /**
     * The Skill-Base error message when the formula failed to compile or
     * evaluate (a {@link sohl.entity.expr.SafeExpressionError} message, or a
     * "did not return a number" message), otherwise `undefined`. A non-blank
     * value flags the skill invalid (see {@link skillBaseValid}); the sheet
     * surfaces it and the internal {@link skillBase} falls back to `0`.
     */
    skillBaseError?: string;

    /**
     * The seeded mastery-level base — the value {@link masteryLevel} was seeded
     * with in {@link initialize} (a stored {@link SkillData.masteryLevelBase},
     * or an on-actor skill's opening `Skill Base × initSkillMult`), captured
     * **before** {@link evaluate} folds in this skill's own {@link boosts} and
     * clamp. Cross-item effects that boost this skill (a `boost` Mystery) compute
     * their contribution from this baseline rather than the mutated
     * {@link masteryLevel | masteryLevel.base}.
     */
    masteryLevelSeed!: number;

    /**
     * The mastery level as a {@link sohl.entity.modifier.MasteryLevelModifier}, seeded from
     * {@link SkillData.masteryLevelBase}.
     */
    masteryLevel!: MasteryLevelModifier;

    /**
     * The fate mastery level as a {@link sohl.entity.modifier.MasteryLevelModifier}, used to resolve
     * {@link fateTest | fate tests}. Seeded from the actor's Aura attribute and
     * the `optionFate` setting; disabled when fate does not apply.
     */
    fateMasteryLevel!: MasteryLevelModifier;

    /**
     * The runtime strike-mode instance for a `combattechnique` skill, built in
     * {@link initialize} from {@link SkillData.strikeMode}. `undefined` for every
     * other skill subtype. Its attack/defense modifiers are driven by the
     * governing mastery level in {@link finalize} (this skill's own by default,
     * or an override skill named by the strike mode's `assocSkillCode`).
     */
    strikeMode?: StrikeModeBase;

    /**
     * The runtime strike modes for this skill: the single {@link strikeMode}
     * when this is a `combattechnique` skill, otherwise empty. Lets combat code
     * aggregate technique strike modes uniformly with weapon strike modes.
     * @returns The strike-mode instances (zero or one).
     */
    get strikeModes(): StrikeModeBase[] {
        return this.strikeMode ? [this.strikeMode] : [];
    }

    /**
     * Whether this skill exposes a melee strike mode — the gate the block and
     * counterstrike actions hang their visibility on (#1137). A missile combat
     * technique (a flung quill, spat venom) can never block or counterstrike,
     * so it must not offer those actions.
     */
    get hasMeleeStrikeMode(): boolean {
        return anyMeleeStrikeMode(this);
    }

    /**
     * The skill's display label. When this skill specializes another (its
     * {@link SkillData.parentSkillCode} resolves to a {@link parentSkill}), the
     * parent skill's name is appended in parentheses after the base label —
     * e.g. `Sword (Combat)`. The parenthetical is built from the localizable
     * `SOHL.Skill.labelWithParent` format string so the convention can be
     * adapted per language. Falls back to the inherited label when the skill
     * has no resolvable parent.
     */
    override get label(): string {
        const base = super.label;
        if (!this.parentSkill) return base;
        return sohl.i18n.format("SOHL.Skill.labelWithParent", {
            skill: base,
            parent: this.parentSkill.name,
        });
    }

    /* --------------------------------------------- */
    /* Strike mode helpers                           */
    /* --------------------------------------------- */

    /**
     * Build an `update()` payload that replaces this combat technique's single
     * strike mode. A `combattechnique` skill stores exactly one strike mode at
     * `system.strikeMode` (a discriminated melee/missile field), so the whole
     * value is written rather than the id-keyed dict a weapon uses.
     *
     * @param strikeMode - The strike-mode data to store.
     * @returns An `update()` payload writing `system.strikeMode`.
     */
    setStrikeModeUpdate(strikeMode: StrikeModeBase.Data): PlainObject {
        return { "system.strikeMode": strikeMode };
    }

    /**
     * Build an `update()` payload that clears this combat technique's strike
     * mode, setting the nullable `system.strikeMode` field to `null`.
     *
     * @returns An `update()` payload nulling `system.strikeMode`.
     */
    removeStrikeModeUpdate(): PlainObject {
        return { "system.strikeMode": null };
    }

    /**
     * Spend Fate on this skill's test — the shared post-roll bump flow
     * ({@link sohl.document.item.logic.performFateTest}); the die is never
     * re-rolled (#854).
     *
     * Triggered at the player's behest by the test card's Fate button or the
     * Being sheet's fate cell.
     *
     * @param context - The action context; `context.scope.priorTestResult` is the
     *   original {@link sohl.entity.result.SuccessTestResult} being fated (absent
     *   when invoked with no card to amend — then only the Fate test is rolled).
     * @returns Resolves once the Fate test, any consumption, and the re-post
     *   complete. A no-op (with a warning) when Fate is unavailable, and a silent
     *   return when the player dismisses the Fate roll or a required choice.
     */
    async fateTest(
        context: SohlActionContext<Partial<SuccessTestResult.ContextScope>>,
    ): Promise<void> {
        return performFateTest(this as unknown as FateHost, context);
    }

    /**
     * Post the Fate result card for this skill. Delegates to the shared
     * implementation; defined here so the card post is spy-able per logic type.
     *
     * @param fateResult - The evaluated Fate test result.
     * @param outcome - The resolved fate outcome.
     * @param spentSource - The Fate Mystery a point was consumed from, if any.
     * @returns Resolves once the card has been handed to the speaker.
     */
    async postFateResultCard(
        fateResult: SuccessTestResult,
        outcome: FateOutcome,
        spentSource: MysteryLogic | undefined,
    ): Promise<void> {
        return postFateResultCard(
            this as unknown as FateHost,
            fateResult,
            outcome,
            spentSource,
        );
    }

    /**
     * Recalculates the mastery level base using the roll formula stored in
     * `flags.sohl.rollFormula`. The formula is a standard Foundry VTT roll
     * expression where the variable `sb` is replaced with the skill base
     * value (always 0 for traits).
     *
     * If no roll formula flag is set, this method does nothing.
     */
    async recalculate(): Promise<void> {
        const rollFormula = this.data.getFlag("sohl", "rollFormula") as
            string | undefined;
        if (!rollFormula) return;

        const sb = this._skillBaseForRoll;
        const resolved = rollFormula.replace(/\bsb\b/gi, String(sb));
        const roll = SimpleRoll.fromFormula(resolved, this);
        roll.roll();

        const updateData: PlainObject = {
            "system.masteryLevelBase": roll.total,
        };
        await this.data.update(updateData);
    }

    /**
     * The skill base value to substitute for `sb` in a roll formula.
     * Override in subclasses to provide a different value (e.g., traits
     * always return 0).
     */
    protected get _skillBaseForRoll(): number {
        return this.skillBase ?? 0;
    }

    /**
     * The magic modifier applied to this skill's fate mastery level. The base
     * implementation returns 0; subclasses may override to contribute a bonus.
     */
    get magicMod(): number {
        return 0;
    }

    /**
     * The Fate Mysteries on the actor that may be spent on this skill's tests:
     * every `fate`-subtype Mystery whose scope matches (a **general** point with
     * no `assocSkillCode`, or one **specific** to this skill's shortcode) that
     * still has a charge available (infinite, or `charges.value > 0`).
     *
     * This is the eligibility set the Fate action is gated on (available iff ≥1)
     * and the source list a spend is drawn from. Fate Points are not a scalar —
     * they live as charges distributed across these Mystery items (#854).
     *
     * @returns The eligible-and-charged Fate {@link MysteryLogic} instances
     *   (empty off an actor).
     */
    get availableFate(): MysteryLogic[] {
        return availableFateFor(this as unknown as FateHost);
    }

    /**
     * Whether the skill may be improved: true when the current user is a GM or
     * owns the item and the mastery level is not disabled.
     */
    get canImprove() {
        return (
            (fvttIsCurrentUserGM() || this.data.isOwner) &&
            // `masteryLevel` is seeded in initialize(); guard against reading it
            // on a not-yet-initialized skill (e.g. the sheet rendering before the
            // actor's prepare completes) so this getter can't throw (#511 class).
            !this.masteryLevel?.disabled
        );
    }

    /**
     * Whether the Skill-Base formula compiled and evaluated to a number. `true`
     * for a blank formula (blank ≠ invalid — it simply yields SB 0); `false` only
     * when a non-blank formula failed to compile or did not return a number
     * ({@link skillBaseError} carries the reason).
     */
    get skillBaseValid(): boolean {
        return this.skillBaseError == null;
    }

    /**
     * The attribute shortcodes this skill's Skill Base is **based on**, ordered
     * **primary first** — the answer to "which attributes does this skill use?"
     * without a caller having to parse the formula itself (#1175).
     *
     * Read off the parsed formula, so it can never drift from the formula the way
     * a separately-stored list would:
     *
     * - When the formula calls `sb(...)` — every skill shipped with the system —
     *   the arguments of that call *are* the basis, in the order they were
     *   written: `sb(attr.rea, attr.per)` yields `["rea", "per"]`. An attribute
     *   referenced elsewhere in the formula is excluded, because it adjusts the
     *   result rather than forming the basis: `sb(attr.str, attr.dex) +
     *   attr.aur / 10` yields `["str", "dex"]`.
     * - When the formula computes a Skill Base without `sb()` (e.g.
     *   `(attr.str + attr.agl) / 2`), every referenced attribute is the basis.
     * - A blank or invalid formula has no basis and yields `[]`.
     *
     * Consumers include the Aura → no-Fate rule (see {@link evaluate}); sheet
     * display and character-build tooling can read the same list.
     */
    get skillBaseAttrs(): string[] {
        if (!this.skillBaseExpr) return [];
        const basis = this.skillBaseExpr.callArgMemberRefs("sb");
        return basis.length ? basis : this.skillBaseExpr.attrRefs();
    }

    /**
     * Whether the skill's base formula is valid (an alias of
     * {@link skillBaseValid}). A blank formula is valid; a malformed expression or
     * one that does not return a number is not.
     */
    get valid() {
        return this.skillBaseValid;
    }

    /** The amount by which {@link improveWithSDR} raises the base mastery level on success. */
    get sdrIncr() {
        return 1;
    }

    /**
     * The Skill Base added to the SDR's `1d100` — a skill improves off its own
     * computed {@link skillBase}, so natural aptitude speeds development.
     * Satisfies {@link sohl.document.item.logic.SdrImprovable}.
     */
    get sdrSkillBase(): number {
        return this.skillBase;
    }

    /* --------------------------------------------- */
    /* Intrinsic Actions                             */
    /* --------------------------------------------- */

    /**
     * Performs a success test against this skill's mastery level.
     *
     * Intrinsic-action executor for the `successTest` action; delegates to
     * {@link sohl.entity.modifier.MasteryLevelModifier.successTest}.
     *
     * @param context - The action context (speaker, scope) for the test.
     * @returns The test result, `null` if cancelled, or `false` on error.
     */
    async successTest(
        context: SohlActionContext,
    ): Promise<SuccessTestResult | undefined | false> {
        return this.masteryLevel.successTest(context);
    }

    /**
     * Performs a **Success Value test** against this skill's mastery level — a
     * success test graded into a Success Value (Index + Modifier) and Success
     * Stars via the skill's `svTable`, for resolving sustained work (crafting,
     * sailing, research) in a single roll instead of many (#848).
     *
     * Intrinsic-action executor for the `successValueTest` action; delegates to
     * {@link sohl.entity.modifier.MasteryLevelModifier.successValueTest}, which
     * drives the one generic success-test path with the svTable and grading
     * `targetValueFunc` supplied as data — no bespoke test code.
     *
     * @param context - The action context (speaker, scope) for the test.
     * @returns The graded test result, `undefined` if cancelled, or `false` on error.
     */
    async successValueTest(
        context: SohlActionContext,
    ): Promise<SuccessTestResult | undefined | false> {
        return this.masteryLevel.successValueTest(context);
    }

    /**
     * Perform an assisted attack with this combat technique's strike mode.
     *
     * Intrinsic-action executor for the `attackTest` action (combat techniques
     * only). Delegates to the shared {@link runStrikeModeTest}, which weapons use
     * too — a technique always has exactly one strike mode ({@link strikeModes}),
     * so it is auto-selected and never prompts.
     * @param context - The action context; `scope.strikeModeId` selects the mode.
     * @returns The test result, `undefined` if the roll was cancelled, or `false`
     *   when no strike mode could be resolved.
     */
    async attackTest(
        context: SohlActionContext<Partial<StrikeModeTestScope>>,
    ): Promise<SuccessTestResult | undefined | false> {
        return runStrikeModeTest(this, "attack", context);
    }

    /**
     * Perform an assisted block with this combat technique's strike mode.
     *
     * Intrinsic-action executor for the `blockTest` action (combat techniques
     * only). A block requested on a non-melee mode resolves to `false` (see
     * {@link runStrikeModeTest}).
     * @param context - The action context; `scope.strikeModeId` selects the mode.
     * @returns The test result, `undefined` if the roll was cancelled, or `false`
     *   when no melee strike mode could be resolved.
     */
    async blockTest(
        context: SohlActionContext<Partial<StrikeModeTestScope>>,
    ): Promise<SuccessTestResult | undefined | false> {
        return runStrikeModeTest(this, "block", context);
    }

    /**
     * Perform an assisted counterstrike with this combat technique's strike mode.
     *
     * Intrinsic-action executor for the `counterstrikeTest` action (combat
     * techniques only). A counterstrike requested on a non-melee mode resolves to
     * `false` (see {@link runStrikeModeTest}).
     * @param context - The action context; `scope.strikeModeId` selects the mode.
     * @returns The test result, `undefined` if the roll was cancelled, or `false`
     *   when no melee strike mode could be resolved.
     */
    async counterstrikeTest(
        context: SohlActionContext<Partial<StrikeModeTestScope>>,
    ): Promise<SuccessTestResult | undefined | false> {
        return runStrikeModeTest(this, "counterstrike", context);
    }

    /**
     * Begins an opposed test backed by this skill's mastery level.
     *
     * Intrinsic-action executor for the `opposedTestStart` action. Opposed tests
     * are token-based: this delegates into the actor's token logic
     * {@link sohl.document.token.logic.SohlTokenDocumentLogic.opposedTestStart}, passing this skill's
     * `logicUuid` as the source — exactly as the weapon/technique combat actions
     * delegate into the combatant.
     *
     * @param context - The action context (speaker, scope) for the test.
     * @returns The opposed test result, or `null` if cancelled or unavailable.
     */
    async opposedTestStart(
        context: SohlActionContext,
    ): Promise<OpposedTestResult | null> {
        const tokenLogic = fvttActiveTokenLogicForActor(this.actor);
        if (!tokenLogic) {
            sohl.log.uiWarn(
                `${this.name} cannot start an opposed test: its actor has no token on the canvas.`,
            );
            return null;
        }
        (context.scope as PlainObject).logicUuid = this.uuid;
        return tokenLogic.opposedTestStart(context);
    }

    /**
     * Flags this skill for improvement via a Skill Development Roll.
     *
     * Intrinsic-action executor for the `setImproveFlag` action.
     *
     * @param _context - The action context (unused).
     * @returns Resolves once the item update completes.
     */
    async setImproveFlag(_context: SohlActionContext): Promise<void> {
        return setImproveFlag(this);
    }

    /**
     * Clears this skill's improvement flag.
     *
     * Intrinsic-action executor for the `unsetImproveFlag` action.
     *
     * @param _context - The action context (unused).
     * @returns Resolves once the item update completes.
     */
    async unsetImproveFlag(_context: SohlActionContext): Promise<void> {
        return unsetImproveFlag(this);
    }

    /**
     * Toggles this skill's improvement flag.
     *
     * Intrinsic-action executor for the `toggleImproveFlag` action.
     *
     * @param _context - The action context (unused).
     * @returns Resolves once the item update completes.
     */
    async toggleImproveFlag(_context: SohlActionContext): Promise<void> {
        return toggleImproveFlag(this);
    }

    /**
     * Attempts to improve the skill via a Skill Development Roll (SDR): rolls
     * `1d100 + skillBase` against the current base mastery level, and on a
     * success raises {@link SkillData.masteryLevelBase} by {@link sdrIncr}. The
     * outcome is persisted — the improve flag is cleared and, on success, the
     * raised base mastery level is written back — and then posted to chat.
     *
     * @param context - The action context whose speaker receives the chat card.
     * @returns Resolves once the roll is evaluated, persisted, and the chat card
     *   is posted.
     */
    async improveWithSDR(context: SohlActionContext): Promise<void> {
        return improveWithSDR(this, context);
    }

    /**
     * Define and return all intrinsic actions for skill logic.
     *
     * @returns The intrinsic action definitions, including those inherited from the base logic.
     */
    static override defineIntrinsicActions(): Partial<SohlAction.Data>[] {
        return [
            ...SohlItemBaseLogic.defineIntrinsicActions(),
            {
                shortcode: "successTest",
                subType: ACTION_SUBTYPE.INTRINSIC,
                title: "SOHL.Skill.Action.successTest",
                scope: SOHL_ACTION_SCOPE.SELF,
                iconFAClass: "fa-solid fa-bullseye",
                executor: "successTest",
                visible: "true",
                group: SOHL_CONTEXT_MENU_SORT_GROUP.ESSENTIAL,
            },
            {
                shortcode: "successValueTest",
                subType: ACTION_SUBTYPE.INTRINSIC,
                title: "SOHL.Skill.Action.successValueTest",
                scope: SOHL_ACTION_SCOPE.SELF,
                iconFAClass: "fa-solid fa-ranking-star",
                executor: "successValueTest",
                visible: "true",
                group: SOHL_CONTEXT_MENU_SORT_GROUP.ESSENTIAL,
            },
            // The improvement-flag / SDR quartet, shared verbatim with
            // every other improvable kind (see defineImproveSdrActions).
            ...defineImproveSdrActions("SOHL.Skill.Action"),
            {
                shortcode: "opposedTestStart",
                subType: ACTION_SUBTYPE.INTRINSIC,
                title: "SOHL.Skill.Action.opposedTestStart",
                scope: SOHL_ACTION_SCOPE.SELF,
                iconFAClass: "fa-solid fa-arrows-to-dot",
                executor: "opposedTestStart",
                visible: "true",
                group: SOHL_CONTEXT_MENU_SORT_GROUP.GENERAL,
            },
            // Combat-technique strike-mode tests. A combat technique is a skill
            // that carries its own single strike mode, so it exposes the same
            // attack/block/counterstrike actions as a weapon (shared executor via
            // runStrikeModeTest); gated to the combattechnique subtype. Block
            // and counterstrike additionally require a melee strike mode — a
            // missile technique cannot defend, so they are not offered (#1137).
            {
                shortcode: "attackTest",
                subType: ACTION_SUBTYPE.INTRINSIC,
                title: "SOHL.Skill.Action.attackTest",
                scope: SOHL_ACTION_SCOPE.SELF,
                iconFAClass: "ginf-broadsword",
                executor: "attackTest",
                visible: "itemLogic.data.subType === 'combattechnique'",
                group: SOHL_CONTEXT_MENU_SORT_GROUP.ESSENTIAL,
            },
            {
                shortcode: "blockTest",
                subType: ACTION_SUBTYPE.INTRINSIC,
                title: "SOHL.Skill.Action.blockTest",
                scope: SOHL_ACTION_SCOPE.SELF,
                iconFAClass: "fa-solid fa-shield",
                executor: "blockTest",
                visible:
                    "itemLogic.data.subType === 'combattechnique' && itemLogic.hasMeleeStrikeMode",
                group: SOHL_CONTEXT_MENU_SORT_GROUP.GENERAL,
            },
            {
                shortcode: "counterstrikeTest",
                subType: ACTION_SUBTYPE.INTRINSIC,
                title: "SOHL.Skill.Action.counterstrikeTest",
                scope: SOHL_ACTION_SCOPE.SELF,
                iconFAClass: "fa-solid fa-circle-half-stroke",
                executor: "counterstrikeTest",
                visible:
                    "itemLogic.data.subType === 'combattechnique' && itemLogic.hasMeleeStrikeMode",
                group: SOHL_CONTEXT_MENU_SORT_GROUP.GENERAL,
            },
        ];
    }

    /* --------------------------------------------- */
    /* Skill Base computation                        */
    /* --------------------------------------------- */

    /**
     * Compute the Skill Base from a raw formula source by evaluating it as a
     * value-returning {@link sohl.entity.expr.SafeExpression} against a
     * Foundry-free context of attribute **values** (`attr.<shortcode>`).
     * The raw string is compiled here at evaluation time, never at
     * author time (rule #10) — a world-item skill (no actor) simply evaluates
     * against an empty context where every `attr.*` is `0`.
     *
     * - A blank/absent source yields `{ value: 0, expr: null }` — blank is not
     *   invalid.
     * - A syntax error, unknown helper, or a result that is not a finite number
     *   yields `{ value: 0, error, expr: null }` — SB stays a safe `0` internally
     *   while the skill is flagged invalid.
     * - Otherwise the numeric result is clamped to ≥ 0 and returned with the
     *   parsed expression (retained for {@link sohl.entity.expr.SafeExpression.attrRefs}).
     *
     * @param source - The skill's `skillBaseFormula` (raw expression source).
     * @returns The clamped value, the parsed expression (or `null`), and an error
     *   message when the formula is invalid.
     */
    private computeSkillBase(source: string | null): {
        value: number;
        expr: SafeExpression | null;
        error?: string;
    } {
        if (!source) return { value: 0, expr: null };
        try {
            const scope = expressionScopes.require("skill.base");
            const expr = new SafeExpression(
                { source },
                { parent: this, scope },
            );
            const raw = expr.evaluate(
                scope.bind({ attr: this.buildAttrContext() }),
            );
            const n = Number(raw);
            if (!Number.isFinite(n)) {
                return {
                    value: 0,
                    expr: null,
                    error: `Skill Base expression did not return a number (got ${String(raw)})`,
                };
            }
            return { value: Math.max(0, n), expr };
        } catch (err) {
            if (err instanceof SafeExpressionError) {
                return { value: 0, expr: null, error: err.message };
            }
            throw err;
        }
    }

    /**
     * Build the zero-defaulting `attr` context: a map of the actor's attribute
     * shortcodes (lowercased) to their `.score.effective`, wrapped in a Proxy so
     * that any absent reference resolves to `0` (case-insensitively) instead of
     * throwing. Off an actor the map is empty, so every `attr.*` is `0` — the
     * legacy `?? 0` semantics, preserved as an intentional non-error.
     *
     * @returns The `attr` namespace object for expression evaluation.
     */
    private buildAttrContext(): Record<string, number> {
        const scores: Record<string, number> = {};
        const attributes =
            this.actorLogic?.logicTypes?.[ITEM_KIND.ATTRIBUTE] ?? [];
        for (const a of attributes) {
            const code = a.data.shortcode?.toLowerCase();
            if (code) scores[code] = a.score.effective ?? 0;
        }
        return new Proxy(scores, {
            get(target, prop) {
                if (typeof prop === "string") {
                    const key = prop.toLowerCase();
                    return Object.prototype.hasOwnProperty.call(target, key) ?
                            target[key]
                        :   0;
                }
                return Reflect.get(target, prop);
            },
        });
    }

    /* --------------------------------------------- */
    /* Common Lifecycle Actions                      */
    /* --------------------------------------------- */

    /** @inheritdoc */
    override initialize(): void {
        super.initialize();
        this.parentSkill = null;
        this.boosts = 0;

        // Calculate the Skill Base first — the opening mastery level may derive
        // from it (see below). The formula is a value-returning SafeExpression;
        // an invalid one flags the skill (skillBaseError) and falls back to 0.
        const sb = this.computeSkillBase(this.data.skillBaseFormula);
        this.skillBase = sb.value;
        this.skillBaseExpr = sb.expr;
        this.skillBaseError = sb.error;

        // Seed the mastery level base. When masteryLevelBase is unset (null)
        // and the skill is on an actor, open the skill from its skill base:
        // opening ML = Skill Base × initSkillMult (deterministic, no roll). A
        // stored masteryLevelBase always takes precedence, and off an actor
        // there is no skill base to open from, so the base is 0.
        const masteryLevelBase =
            this.data.masteryLevelBase == null && this.actorLogic ?
                (this.skillBase ?? 0) * this.data.initSkillMult
            :   (this.data.masteryLevelBase ?? 0);
        // Capture the pre-boost seed for cross-item boost effects (see the field
        // docs); evaluate() will fold this skill's own boosts into masteryLevel.
        this.masteryLevelSeed = masteryLevelBase;
        this.masteryLevel = new entity.MasteryLevelModifier(
            {},
            { parent: this },
        ).setBase(masteryLevelBase);

        // The fate mastery level is built in finalize(), not here: it derives
        // from the actor's Aura attribute, whose own mastery level is not
        // settled until the evaluate barrier has passed. Seed a provisional one
        // so the field is never undefined for a caller reading it mid-lifecycle.
        this.fateMasteryLevel = buildFateMasteryLevel(
            this as unknown as FateHost,
            false,
        );

        // A combat-technique skill carries an embedded strike mode (a trained
        // maneuver such as an unarmed strike or grapple). Build the runtime
        // instance from the persisted data; its Atk/Blk/CX are wired to the
        // governing mastery level in `finalize`.
        const smData = this.data.strikeMode;
        if (this.data.subType === SKILL_SUBTYPE.COMBATTECHNIQUE && smData) {
            // A combat technique has a single strike mode with no shortcode of
            // its own, so it is keyed by the skill's own id.
            const shortcode = smData.shortcode || this.id;
            this.strikeMode =
                smData.type === STRIKE_MODE_TYPE.MELEE ?
                    new entity.MeleeStrikeMode(
                        smData as MeleeStrikeMode.Data,
                        this,
                        shortcode,
                    )
                :   new entity.MissileStrikeMode(
                        smData as MissileStrikeMode.Data,
                        this,
                        shortcode,
                    );
        }
    }

    /** @inheritdoc */
    override evaluate(): void {
        super.evaluate();
        if (this.data.parentSkillCode) {
            // If this skill references a parent skill, find it and link it here so we can pull in its properties as needed
            const parentLogic = this.actorLogic?.getItemLogic(
                this.data.parentSkillCode,
                ITEM_KIND.SKILL,
            );
            if (parentLogic) {
                this.parentSkill = parentLogic;
                // A specialization configured to track its parent adopts the
                // parent skill's mastery-level base as its own before this
                // skill's own boosts and maxTarget clamp apply on top. The
                // static `masteryLevelBase` data field is read (not the parent's
                // computed mastery level) so adoption is independent of
                // cross-item evaluate() ordering; an unopened parent (null base)
                // contributes 0.
                if (this.data.adoptParentMasteryLevel) {
                    this.masteryLevel.setBase(
                        parentLogic.data.masteryLevelBase ?? 0,
                    );
                }
            }
        }
        if (this.masteryLevel.base > 0) {
            let newML = this.masteryLevel.base;
            for (let i = 0; i < this.boosts; i++) {
                newML += calcMasteryBoost(newML);
            }
            this.masteryLevel.setBase(newML);
        }
        // Ensure base ML is not greater than MaxML
        if (this.masteryLevel.base > this.masteryLevel.maxTarget) {
            this.masteryLevel.setBase(this.masteryLevel.maxTarget);
        }
        // A melee technique's reach is its base length plus the wielder's body
        // reach (0 for a non-Being or incorporeal being) — mirrors weapon and
        // combat-technique reach handling.
        if (this.strikeMode instanceof MeleeStrikeMode) {
            const bodyReach =
                getActorBody(this.actorLogic)?.reach.effective ?? 0;
            this.strikeMode.reach.add("SOHL.INFO.Reach", "Size", bodyReach);
        }

        // Worn headgear that obstructs the senses penalizes anything *built on*
        // Perception — read off the parsed basis, so a formula that merely
        // adjusts its result by Perception is unaffected, exactly as for the
        // Aura → no-Fate rule below. The worst worn penalty applies, never the
        // sum: a great helm subsumes what a cowl does rather than compounding
        // it.
        if (perceptionPenaltyApplies(this.skillBaseAttrs)) {
            // Structural read: only a Being wears armour, and the logic layer
            // does not narrow the actor type here (cf. `unusableRoles` in
            // MasteryLevelModifier).
            const penalty =
                (
                    this.actorLogic as
                        { wornPerceptionPenalty?: number } | null | undefined
                )?.wornPerceptionPenalty ?? 0;
            if (penalty) {
                this.masteryLevel.add(
                    "SOHL.ArmorGear.perceptionPenalty",
                    "Headgear",
                    penalty,
                );
            }
        }
    }

    /**
     * Apply the being's innate **aptitude** for this skill to its mastery level,
     * as a single labeled delta.
     *
     * The being's accumulator is merged during the evaluate phase, so by
     * `finalize` it holds every aptitude-bearing item's contribution, already
     * reduced to the greatest value per selector. This skill takes its own entry
     * — the greater of a match on its shortcode and a match on its subtype (see
     * {@link sohl.document.item.logic.skillAptitudeFor}) — and adds it once.
     *
     * A selector matched at `0` adds no delta: the aptitude is real and mattered
     * during the merge (an untouched element beats a hindered one), but it
     * changes nothing here and would only clutter the derivation.
     */
    protected applySkillAptitude(): void {
        const aptitude = skillAptitudeFor(
            (this.actorLogic as any)?.skillAptitudes,
            this.data.shortcode,
            this.data.subType,
        );
        if (!aptitude) return;
        this.masteryLevel.add(VALUE_DELTA_INFO.APTITUDE, aptitude);
    }

    /** @inheritdoc */
    override finalize(): void {
        super.finalize();

        this.applySkillAptitude();

        // Rebuild the fate mastery level now that every sibling has evaluated:
        // it derives from the actor's Aura attribute, whose mastery level is not
        // settled during initialize(). A skill whose Skill Base is *based on*
        // Aura cannot be fated at all — read off the parsed basis, so a formula
        // that merely adjusts its result by Aura keeps fate (#1175).
        this.fateMasteryLevel = buildFateMasteryLevel(
            this as unknown as FateHost,
            this.skillBaseAttrs.includes(AURA_SHORTCODE),
        );

        if (this.masteryLevel.disabled) {
            this.fateMasteryLevel.disabled =
                VALUE_DELTA_ID[VALUE_DELTA_INFO.MLDSBL].name;
        }
        if (!this.fateMasteryLevel.disabled) {
            // Apply magic modifiers
            if (this.magicMod) {
                this.fateMasteryLevel.add(
                    VALUE_DELTA_INFO.MAGICMOD,
                    this.magicMod,
                );
            }
            if (!this.availableFate.length) {
                this.fateMasteryLevel.disabled =
                    "SOHL.MasteryLevel.NoFateAvailable";
            }
        }

        // Drive a combat-technique strike mode's Atk/Blk/CX from its governing
        // mastery level: this skill's own by default, or an override skill named
        // by the strike mode's `assocSkillCode` (falling back to self if that
        // code resolves to nothing). `addVM({ includeBase: true })` folds in the
        // governing ML's base and its labeled deltas, so the technique's own
        // attack/defense modifiers layer on top with the full derivation intact.
        // A disabled governing ML disables the derived rolls (rendered as ✕).
        if (this.strikeMode) {
            // A combat technique's strike mode is governed by an override skill
            // named in `assocSkillCode` when present, else by this skill's own
            // mastery level.
            const governing =
                resolveAssocSkill(
                    this.actorLogic,
                    this.strikeMode.assocSkillCode,
                )?.masteryLevel ?? this.masteryLevel;

            applyGoverningMasteryLevel(this.strikeMode, governing);
            // A prone wielder suffers −20 to all melee attacks and defenses
            // (#562) — a combat technique carries its own strike mode, so apply
            // it here as WeaponGearLogic does for weapon strike modes.
            if (
                this.strikeMode instanceof MeleeStrikeMode &&
                !!this.actor &&
                fvttActorStatuses(this.actor).has(STATUS_EFFECT.PRONE)
            ) {
                applyProneMeleePenalty(this.strikeMode);
            }
            // Fold the wielder's Strength into the technique's impact (#1253),
            // as WeaponGearLogic does for weapon strike modes. A technique is
            // gripped by no limb, so it is never off-hand.
            applyWielderStrengthImpact(this);
        }
    }
}

/**
 * @remarks The shape of `system` on a `skill` item — i.e. `item.system` (equivalently `item.logic.data`) when `item.type === "skill"`. The backing DataModel implements this interface.
 */
export interface SkillData<
    TLogic extends SkillLogic<SkillData> = SkillLogic<any>,
> extends SohlItemData<TLogic> {
    /** Skill category (Combat, Social, Physical, etc.) */
    subType: SkillSubType;
    /** Formula for calculating the skill base from referenced traits */
    skillBaseFormula: string | null;
    /**
     * Base mastery level representing training and experience. `null` means the
     * skill has not been opened yet: when the skill is on an actor it opens
     * automatically at Skill Base × {@link SkillData.initSkillMult}.
     */
    masteryLevelBase: number | null;
    /** Whether this item is flagged for mastery improvement via SDR */
    improveFlag: boolean;
    /** Combat category this skill applies to, if any */
    combatCategory: string;
    /**
     * Shortcode of the parent (base) skill this skill specializes, or `null`
     * when it is not a specialization. Resolved to {@link SkillLogic.parentSkill}
     * during {@link SkillLogic.evaluate}.
     */
    parentSkillCode: string | null;
    /**
     * When `true` and {@link parentSkillCode} resolves to a parent skill, this
     * skill adopts the parent's {@link masteryLevelBase} as its own mastery-level
     * base during {@link SkillLogic.evaluate}, before this skill's own boosts and
     * clamp apply. Ignored when there is no resolvable parent.
     */
    adoptParentMasteryLevel: boolean;
    /** Multiplier applied to skill base when initializing a new character */
    initSkillMult: number;
    /**
     * Optional embedded strike mode, present only for the `combattechnique`
     * subtype; `null` for all other skills.
     */
    strikeMode?: MeleeStrikeMode.Data | MissileStrikeMode.Data | null;
}
