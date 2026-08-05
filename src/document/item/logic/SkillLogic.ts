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
import { SohlActionContext } from "@src/entity/action/SohlActionContext";
import type { MasteryLevelModifier } from "@src/entity/modifier/MasteryLevelModifier";
import type { ValueModifier } from "@src/entity/modifier/ValueModifier";
import { StrikeModeBase } from "@src/entity/strikemode/StrikeModeBase";
import { MeleeStrikeMode } from "@src/entity/strikemode/MeleeStrikeMode";
import { applyProneMeleePenalty } from "@src/entity/strikemode/prone";
import { applyGoverningMasteryLevel } from "@src/entity/strikemode/governing";
import { resolveAssocSkill } from "@src/document/item/logic/resolveAssocSkill";
import { calcMasteryBoost } from "@src/document/item/logic/masteryBoost";
import {
    eligibleFateSources,
    preferredFateSource,
    resolveFateOutcome,
    type FateCritChoice,
} from "@src/document/item/logic/fate";
import type { MissileStrikeMode } from "@src/entity/strikemode/MissileStrikeMode";
import { SuccessTestResult } from "@src/entity/result/SuccessTestResult";
import type { OpposedTestResult } from "@src/entity/result/OpposedTestResult";
import {
    ACTION_SUBTYPE,
    CRITICAL_SUCCESS,
    ITEM_KIND,
    MYSTERY_SUBTYPE,
    SKILL_SUBTYPE,
    SOHL_ACTION_SCOPE,
    SOHL_CONTEXT_MENU_SORT_GROUP,
    SOHL_SPEAKER_SOUND,
    STATUS_EFFECT,
    STRIKE_MODE_TYPE,
    VALUE_DELTA_ID,
    VALUE_DELTA_INFO,
    type SkillSubType,
} from "@src/utils/constants";
import { FilePath, toFilePath, toHTMLString } from "@src/utils/helpers";
import { SimpleRoll } from "@src/entity/roll/SimpleRoll";
import { SohlItemBaseLogic, type SohlItemData } from "./SohlItemBaseLogic";
import { runStrikeModeTest, type StrikeModeTestScope } from "./strikeModeTest";
import {
    dialog,
    fvttGetSetting,
    fvttIsCurrentUserGM,
    fvttActiveTokenLogicForActor,
    fvttActorStatuses,
    fvttToFoundryRoll,
} from "@src/core/FoundryHelpers";
import { AttributeLogic } from "./AttributeLogic";
import { getActorBody } from "@src/document/actor/logic/BodyLogic";
import { SohlAction } from "@src/entity/action/SohlAction";

/**
 * Returns the fate-test description table with labels/descriptions resolved from i18n.
 *
 * @returns Array of {@link sohl.entity.result.SuccessTestResult.LimitedDescription} entries covering
 *   all fate outcomes from "lose fate — no effect" through "permanent gain".
 */
export function getFateDescTable(): SuccessTestResult.LimitedDescription[] {
    const loc = (key: string) => sohl.i18n.localize(key);
    return [
        {
            maxValue: -1,
            label: loc("SOHL.Skill.FateDesc.loseFateNoEffect.label"),
            description: loc(
                "SOHL.Skill.FateDesc.loseFateNoEffect.description",
            ),
            lastDigits: [],
            success: false,
            result: 0,
        },
        {
            maxValue: 0,
            label: loc("SOHL.Skill.FateDesc.noLossNoEffect.label"),
            description: loc("SOHL.Skill.FateDesc.noLossNoEffect.description"),
            lastDigits: [],
            success: false,
            result: 0,
        },
        {
            maxValue: 1,
            label: loc("SOHL.Skill.FateDesc.success.label"),
            description: loc("SOHL.Skill.FateDesc.success.description"),
            lastDigits: [],
            success: true,
            result: 0,
        },
        {
            maxValue: 999,
            label: loc("SOHL.Skill.FateDesc.critSuccess.label"),
            description: loc("SOHL.Skill.FateDesc.critSuccess.description"),
            lastDigits: [],
            success: true,
            result: 0,
        },
    ];
}

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
     * Spend Fate on a test: roll a Fate test and apply its **post-roll
     * success-level bump** to the original test — the die is never re-rolled
     * (#854).
     *
     * The flow, all at the player's behest (the card's Fate button or the sheet
     * cell is the human trigger):
     * 1. **Gate** on an eligible, charged Fate Point ({@link availableFate}); no
     *    point ⇒ a warning and no-op.
     * 2. **Roll** the Fate test against {@link fateMasteryLevel} (its own success
     *    test, resolved by {@link getFateDescTable}); its result posts nothing
     *    here — this method posts a single Fate card describing the resolved path.
     * 3. **Resolve the rung** via {@link resolveFateOutcome} — consumption and the
     *    level delta are driven by the matched rung, never `isSuccess`. A critical
     *    success prompts the player's **spend (+2) / keep (+1)** choice.
     * 4. **Consume a point** when the rung requires it, decrementing one eligible
     *    Fate Mystery — chosen by the player when more than one is eligible
     *    (auto-picked otherwise).
     * 5. **Bump the original** result's stored success level by the delta and
     *    **re-post** its card, which re-resolves its description table against the
     *    new level. The original result rides in `context.scope.priorTestResult`
     *    (serialized on the Fate button, revived on click).
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
        if (this.fateMasteryLevel.disabled) return;

        const eligible = this.availableFate;
        if (!eligible.length) {
            sohl.log.uiWarn(
                sohl.i18n.format("SOHL.Skill.Fate.noPoints", {
                    label: this.label,
                }),
            );
            return;
        }

        const original = context.scope?.priorTestResult;

        // Roll the Fate test — its own fresh success test (never the original's
        // die). `noChat` suppresses the generic card; this method posts a Fate
        // card that names the resolved path instead.
        const fateContext = new SohlActionContext({
            speaker: context.speaker,
            type: `${this.data.kind}-${this.name}-fate-test`,
            title: sohl.i18n.format("SOHL.Skill.Fate.testTitle", {
                label: this.label,
            }),
            skipDialog: context.skipDialog,
            noChat: true,
            scope: {
                situationalModifier: 0,
                targetValueFunc: (successLevel: number) => successLevel,
                successStarTable: getFateDescTable(),
                // A Fate roll cannot itself be fated.
                canFate: false,
            },
        });
        const fateResult = await this.fateMasteryLevel.successTest(fateContext);
        if (!fateResult) return; // dismissed / not owned

        // A critical success is the one branching outcome — ask the player.
        let critChoice: FateCritChoice | undefined;
        if (fateResult.successLevel >= CRITICAL_SUCCESS) {
            critChoice = await this._promptFateCritChoice();
            if (!critChoice) return; // dismissed → cancel the whole spend
        }

        const outcome = resolveFateOutcome(fateResult.successLevel, critChoice);

        // Consume a Fate Point when the rung requires it; the player picks the
        // source when more than one is eligible.
        let spentSource: MysteryLogic | undefined;
        if (outcome.consumesPoint) {
            spentSource = await this._chooseFateSource(eligible);
            if (!spentSource) return; // dismissed → cancel
            await this._consumeFateCharge(spentSource);
        }

        // Apply the bump to the original test and re-post its card.
        if (original && outcome.levelDelta) {
            original.bumpSuccessLevel(outcome.levelDelta);
            // Re-post with Fate disabled: this result has now been fated, so the
            // amended card should not re-offer the same spend. The card re-derives
            // its outcome text/stars from the bumped level. (The revived original
            // carries the identity `targetValueFunc` a plain success test needs; a
            // bespoke non-identity test would have to re-supply it here — #854.)
            await original.toChat({ canFate: false });
        }

        await this._postFateResultCard(fateResult, outcome, spentSource);
    }

    /**
     * Prompt the player's choice on a **critical-success** Fate test: spend the
     * point for +2 success levels, or keep it for +1 (consent model — the one
     * branching outcome is asked, never auto-picked).
     *
     * @returns The chosen branch, or `undefined` if the dialog was dismissed.
     */
    private async _promptFateCritChoice(): Promise<FateCritChoice | undefined> {
        const result = await dialog({
            title: sohl.i18n.localize("SOHL.Skill.Fate.critChoice.title"),
            content: toHTMLString(`<p>{{prompt}}</p>`),
            data: {
                prompt: sohl.i18n.localize("SOHL.Skill.Fate.critChoice.prompt"),
            },
            buttons: [
                {
                    action: "spend",
                    label: sohl.i18n.localize(
                        "SOHL.Skill.Fate.critChoice.spend",
                    ),
                    icon: "fa-solid fa-star",
                    default: true,
                },
                {
                    action: "keep",
                    label: sohl.i18n.localize(
                        "SOHL.Skill.Fate.critChoice.keep",
                    ),
                    icon: "fa-solid fa-hand-holding",
                },
            ],
        });
        const action = result?.action;
        return action === "spend" || action === "keep" ? action : undefined;
    }

    /**
     * Resolve which eligible Fate Mystery to spend a point from: auto-pick when
     * exactly one is eligible, otherwise ask the player (pre-selecting the
     * most-restricted point via {@link preferredFateSource} so flexible general
     * points are preserved).
     *
     * @param eligible - The eligible Fate Mystery logics ({@link availableFate}).
     * @returns The chosen mystery, or `undefined` if the dialog was dismissed.
     */
    private async _chooseFateSource(
        eligible: MysteryLogic[],
    ): Promise<MysteryLogic | undefined> {
        if (eligible.length === 1) return eligible[0];

        const preferred = preferredFateSource(
            eligible.map((m) => ({
                ref: m,
                subType: m.data.subType,
                assocSkillCode: m.data.assocSkillCode ?? null,
                infinite: !!m.charges?.value.disabled,
                remaining: m.charges?.value.effective ?? 0,
            })),
        )?.ref;

        const options = eligible.map((m) => ({
            id: m.id,
            name: m.name,
            scope:
                m.data.assocSkillCode ?
                    sohl.i18n.format("SOHL.Skill.Fate.source.specific", {
                        skill: m.data.assocSkillCode,
                    })
                :   sohl.i18n.localize("SOHL.Skill.Fate.source.general"),
            remaining:
                m.charges?.value.disabled ?
                    "∞"
                :   String(m.charges?.value.effective ?? 0),
            selected: m.id === preferred?.id,
        }));

        const result = await dialog({
            title: sohl.i18n.localize("SOHL.Skill.Fate.source.title"),
            content: toHTMLString(`<form>
                <div class="form-group">
                    <label>{{label}}</label>
                    <select name="mysteryId">
                        {{#each options}}
                        <option value="{{this.id}}" {{#if this.selected}}selected{{/if}}>{{this.name}} — {{this.scope}} ({{this.remaining}})</option>
                        {{/each}}
                    </select>
                </div>
            </form>`),
            data: {
                label: sohl.i18n.localize("SOHL.Skill.Fate.source.label"),
                options,
            },
        });
        if (!result) return undefined; // dismissed
        const chosenId = result.data?.mysteryId;
        return (
            eligible.find((m) => m.id === chosenId) ?? preferred ?? eligible[0]
        );
    }

    /**
     * Decrement one charge on the chosen Fate Mystery, unless its charges are
     * infinite (a disabled `charges.value`), in which case nothing is written.
     *
     * @param mystery - The Fate Mystery to spend a point from.
     */
    private async _consumeFateCharge(mystery: MysteryLogic): Promise<void> {
        if (mystery.charges?.value.disabled) return; // infinite — never decrement
        const remaining = mystery.charges?.value.effective ?? 0;
        await mystery.data.update({
            "system.charges.value": Math.max(remaining - 1, 0),
        });
    }

    /**
     * Post the Fate result card naming the resolved path (CF "point lost" / MF
     * "no effect" / MS "+1" / CS the chosen "+2" or "retained +1") and the Fate
     * Mystery a point was spent from, attaching the Fate roll for display.
     *
     * @param fateResult - The evaluated Fate test result.
     * @param outcome - The resolved {@link resolveFateOutcome} outcome.
     * @param spentSource - The Fate Mystery a point was consumed from, if any.
     */
    private async _postFateResultCard(
        fateResult: SuccessTestResult,
        outcome: ReturnType<typeof resolveFateOutcome>,
        spentSource: MysteryLogic | undefined,
    ): Promise<void> {
        const cardData: PlainObject = {
            actorUuid: this.actorLogic?.uuid,
            title: sohl.i18n.format("SOHL.Skill.Fate.testTitle", {
                label: this.label,
            }),
            mlModHtml: fateResult.masteryLevelModifier.chatHtml,
            target: fateResult.masteryLevelModifier.effective,
            rollTotal: fateResult.roll.total,
            isSuccess: fateResult.isSuccess,
            isCritical: fateResult.isCritical,
            outcomeLabel: fateResult.resultText,
            pathText: sohl.i18n.localize(
                `SOHL.Skill.Fate.path.${outcome.path}`,
            ),
            sourceText:
                spentSource ?
                    sohl.i18n.format("SOHL.Skill.Fate.path.source", {
                        name: spentSource.name,
                    })
                :   "",
        };
        const options: PlainObject = {
            roll: await fvttToFoundryRoll(fateResult.roll),
            sound: SOHL_SPEAKER_SOUND.DICE,
        };
        void this.speaker.toChat(
            toFilePath("systems/sohl/templates/chat/fate-roll-card.hbs"),
            cardData,
            options,
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
            | string
            | undefined;
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
        const actorLogic = this.actorLogic;
        if (!actorLogic) return [];
        const mysteries = (actorLogic.logicTypes?.[ITEM_KIND.MYSTERY] ??
            []) as MysteryLogic[];
        return eligibleFateSources(
            mysteries.map((m) => ({
                ref: m,
                subType: m.data.subType,
                assocSkillCode: m.data.assocSkillCode ?? null,
                // A disabled `charges.value` means infinite charges (or a
                // mystery that does not track charges at all) — always available,
                // never decremented.
                infinite: !!m.charges?.value.disabled,
                remaining: m.charges?.value.effective ?? 0,
            })),
            MYSTERY_SUBTYPE.FATE,
            this.data.shortcode,
        ).map((p) => p.ref);
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
        if (!this.canImprove) return;
        const updateData: PlainObject = { "system.improveFlag": true };
        await this.data.update(updateData);
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
        if (!this.canImprove) return;
        const updateData: PlainObject = { "system.improveFlag": false };
        await this.data.update(updateData);
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
        if (!this.canImprove) return;
        if (this.data.improveFlag) {
            await this.unsetImproveFlag(_context);
        } else {
            await this.setImproveFlag(_context);
        }
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
        const updateData: PlainObject = { "system.improveFlag": false };
        const roll = SimpleRoll.fromFormula(`1d100+${this.skillBase}`, this);
        roll.roll();
        const isSuccess = roll.total > this.masteryLevel.base;

        if (isSuccess) {
            // Raise from the effective opening base (which may be derived from
            // initSkillMult when masteryLevelBase is unset), never from the
            // now-nullable stored field.
            updateData["system.masteryLevelBase"] =
                this.masteryLevel.base + this.sdrIncr;
        }
        const chatTemplate: FilePath = toFilePath(
            "systems/sohl/templates/chat/standard-test-card.hbs",
        );
        const chatTemplateData = {
            type: `${this.data.kind}-${this.name}-improve-sdr`,
            title: sohl.i18n.format("SOHL.MasteryLevel.improveSDR.title", {
                label: this.label,
            }),
            effTarget: this.masteryLevel.base,
            isSuccess: isSuccess,
            rollValue: roll.total,
            rollResult: roll.result,
            showResult: true,
            resultText:
                isSuccess ?
                    sohl.i18n.format(
                        "SOHL.MasteryLevel.improveSDR.increase.title",
                        {
                            label: this.label,
                        },
                    )
                :   sohl.i18n.format(
                        "SOHL.MasteryLevel.improveSDR.noIncrease.title",
                        {
                            label: this.label,
                        },
                    ),
            resultDesc:
                isSuccess ?
                    sohl.i18n.format(
                        "SOHL.MasteryLevel.improveSDR.increase.desc",
                        {
                            label: this.label,
                            incr: this.sdrIncr,
                            final: this.masteryLevel.base + this.sdrIncr,
                        },
                    )
                :   sohl.i18n.format(
                        "SOHL.MasteryLevel.improveSDR.noIncrease.desc",
                        {
                            label: this.label,
                            incr: this.sdrIncr,
                            final: this.masteryLevel.base + this.sdrIncr,
                        },
                    ),
            description:
                isSuccess ?
                    sohl.i18n.format("SOHL.SuccessTestResult.Success")
                :   sohl.i18n.format("SOHL.SuccessTestResult.Failure"),
            notes: "",
            sdrIncr: this.sdrIncr,
        };

        // Persist the outcome: clear the improve flag and, on success, raise the
        // stored base mastery level so the gain the chat card announces is real.
        await this.data.update(updateData);

        void context.speaker.toChat(chatTemplate, chatTemplateData);
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
                iconFAClass: "fa-solid fa-bullseye-arrow",
                executor: "successTest",
                visible: "true",
                group: SOHL_CONTEXT_MENU_SORT_GROUP.ESSENTIAL,
            },
            {
                shortcode: "successValueTest",
                subType: ACTION_SUBTYPE.INTRINSIC,
                title: "SOHL.Skill.Action.successValueTest",
                scope: SOHL_ACTION_SCOPE.SELF,
                iconFAClass: "fa-solid fa-stars",
                executor: "successValueTest",
                visible: "true",
                group: SOHL_CONTEXT_MENU_SORT_GROUP.ESSENTIAL,
            },
            {
                shortcode: "setImproveFlag",
                subType: ACTION_SUBTYPE.INTRINSIC,
                title: "SOHL.Skill.Action.setImproveFlag",
                scope: SOHL_ACTION_SCOPE.SELF,
                iconFAClass: "fa-solid fa-star",
                executor: "setImproveFlag",
                // Superseded by the single `toggleImproveFlag` entry; kept as an
                // executor but hidden from the context menu.
                visible: "false",
                group: SOHL_CONTEXT_MENU_SORT_GROUP.HIDDEN,
            },
            {
                shortcode: "unsetImproveFlag",
                subType: ACTION_SUBTYPE.INTRINSIC,
                title: "SOHL.Skill.Action.unsetImproveFlag",
                scope: SOHL_ACTION_SCOPE.SELF,
                iconFAClass: "fa-regular fa-star",
                executor: "unsetImproveFlag",
                // Superseded by the single `toggleImproveFlag` entry; kept as an
                // executor but hidden from the context menu.
                visible: "false",
                group: SOHL_CONTEXT_MENU_SORT_GROUP.HIDDEN,
            },
            {
                shortcode: "toggleImproveFlag",
                subType: ACTION_SUBTYPE.INTRINSIC,
                title: "SOHL.Skill.Action.toggleImproveFlag",
                scope: SOHL_ACTION_SCOPE.SELF,
                iconFAClass: "fa-solid fa-star-half-stroke",
                executor: "toggleImproveFlag",
                visible: "true",
                group: SOHL_CONTEXT_MENU_SORT_GROUP.GENERAL,
            },
            {
                shortcode: "improveWithSDR",
                subType: ACTION_SUBTYPE.INTRINSIC,
                title: "SOHL.Skill.Action.improveWithSDR",
                scope: SOHL_ACTION_SCOPE.SELF,
                iconFAClass: "fa-solid fa-star",
                executor: "improveWithSDR",
                visible: "itemLogic.canImprove && !itemLogic.data.improveFlag",
                group: SOHL_CONTEXT_MENU_SORT_GROUP.GENERAL,
            },
            {
                shortcode: "opposedTestStart",
                subType: ACTION_SUBTYPE.INTRINSIC,
                title: "SOHL.Skill.Action.opposedTestStart",
                scope: SOHL_ACTION_SCOPE.SELF,
                iconFAClass:
                    "fa-solid fa-arrow-down-left-and-arrow-up-right-to-center",
                executor: "opposedTestStart",
                visible: "true",
                group: SOHL_CONTEXT_MENU_SORT_GROUP.GENERAL,
            },
            // Combat-technique strike-mode tests. A combat technique is a skill
            // that carries its own single strike mode, so it exposes the same
            // attack/block/counterstrike actions as a weapon (shared executor via
            // runStrikeModeTest); gated to the combattechnique subtype. Block and
            // counterstrike no-op on a missile mode at runtime.
            {
                shortcode: "attackTest",
                subType: ACTION_SUBTYPE.INTRINSIC,
                title: "SOHL.Skill.Action.attackTest",
                scope: SOHL_ACTION_SCOPE.SELF,
                iconFAClass: "fa-solid fa-sword",
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
                visible: "itemLogic.data.subType === 'combattechnique'",
                group: SOHL_CONTEXT_MENU_SORT_GROUP.GENERAL,
            },
            {
                shortcode: "counterstrikeTest",
                subType: ACTION_SUBTYPE.INTRINSIC,
                title: "SOHL.Skill.Action.counterstrikeTest",
                scope: SOHL_ACTION_SCOPE.SELF,
                iconFAClass: "fa-solid fa-circle-half-stroke",
                executor: "counterstrikeTest",
                visible: "itemLogic.data.subType === 'combattechnique'",
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
            const expr = new SafeExpression({ source }, { parent: this });
            const raw = expr.evaluate({
                attr: this.buildAttrContext(),
            });
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

        this.fateMasteryLevel = new entity.MasteryLevelModifier(
            {
                testDescTable: getFateDescTable(),
                type: `${this.data.kind}-${this.name}-fate-test`,
                title: `${this.label} Fate Test`,
            },
            { parent: this },
        );

        // Calculate Fate Mastery Level
        const actorLogic = this.actorLogic;
        if (actorLogic) {
            const fateSetting = fvttGetSetting("sohl", "optionFate");

            const auraLogic = actorLogic.getItemLogic(
                "aur",
                ITEM_KIND.ATTRIBUTE,
            );
            if (auraLogic && !auraLogic.masteryLevel.disabled) {
                if (
                    fateSetting === "everyone" ||
                    (fateSetting === "pconly" && actorLogic.hasPlayerOwner)
                ) {
                    this.fateMasteryLevel.setBase(50);
                    this.fateMasteryLevel.add(
                        VALUE_DELTA_INFO.FATEBNS,
                        Math.trunc(auraLogic.masteryLevel.effective / 2),
                    );
                } else {
                    this.fateMasteryLevel.disabled =
                        "SOHL.MasteryLevel.FateDisabled";
                }
            } else {
                this.fateMasteryLevel.disabled =
                    "SOHL.MasteryLevel.FateNotSupported";
            }
        }

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
        if (this.skillBaseExpr?.attrRefs().includes("aur")) {
            // Any skill that reads Aura (attr.aur) in its SB formula cannot use
            // fate. The dependency is read off the parsed AST, not a regex.
            this.fateMasteryLevel.disabled =
                "SOHL.MasteryLevel.AuraBasedNoFate";
        }

        // A melee technique's reach is its base length plus the wielder's body
        // reach (0 for a non-Being or incorporeal being) — mirrors weapon and
        // combat-technique reach handling.
        if (this.strikeMode instanceof MeleeStrikeMode) {
            const bodyReach =
                getActorBody(this.actorLogic)?.reach.effective ?? 0;
            this.strikeMode.reach.add("SOHL.INFO.Reach", "Size", bodyReach);
        }
    }

    /** @inheritdoc */
    override finalize(): void {
        super.finalize();

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
