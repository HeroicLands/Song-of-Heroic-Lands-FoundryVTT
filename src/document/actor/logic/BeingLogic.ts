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
import { SafeExpression } from "@src/entity/expr/SafeExpression";
import type { ValueModifier } from "@src/entity/modifier/ValueModifier";
import type { SuccessTestResult } from "@src/entity/result/SuccessTestResult";
import { SohlActionContext } from "@src/entity/action/SohlActionContext";
import {
    SohlActorBaseLogic,
    type SohlActorData,
    type SohlActorLogic,
} from "@src/document/actor/logic/SohlActorBaseLogic";
import { BodyLogic } from "@src/document/actor/logic/BodyLogic";
import type { WeaponGearLogic } from "@src/document/item/logic/WeaponGearLogic";
import type { SkillLogic } from "@src/document/item/logic/SkillLogic";
import { MeleeStrikeMode } from "@src/entity/strikemode/MeleeStrikeMode";
import {
    aggregateArmor,
    type ArmorLayer,
} from "@src/entity/body/armor-aggregation";
import {
    computeActorReach,
    type MeleeReachOption,
} from "@src/document/actor/logic/reach-helpers";
import type { StrikeModeBase } from "@src/entity/strikemode/StrikeModeBase";
import {
    selectActorTokens,
    selectActorCombatant,
} from "@src/document/actor/logic/token-helpers";
import {
    getActiveScene,
    getActiveCombat,
    dialog,
    fvttCreateEmbeddedItems,
    fvttActorStatuses,
    fvttToggleActorStatus,
    fvttWorldTime,
    fvttLogicFromUuidSync,
} from "@src/core/FoundryHelpers";
import {
    TREATMENT_HEAL,
    injuryBand,
    requiredTreatment,
    treatmentHealingRate,
    type InjuryBand,
} from "@src/entity/body/injury-treatment";
import {
    SHOCK_STATE,
    SHOCK_STATUS_IDS,
    SHOCK_RETEST_MODIFIER,
    SHOCK_RETEST_UNCONSCIOUS_DELAY,
    SHOCK_RETEST_OWN_TURN_PREDICATE,
    shockStateFromStatuses,
    shockStatusForLevel,
    clampShockState,
    shockStateFromIndex,
    shockIndexAdjustment,
    shockReTestOutcome,
    comaHealingRate,
    type ShockReTestOutcome,
} from "@src/document/actor/logic/shock";
import { rollTimedTest } from "@src/document/item/logic/timed-test";
import {
    deriveHealth,
    healingBaseFor,
    healthBand as healthBandFor,
    type PartHealthInput,
    type HealthBand,
} from "@src/document/actor/logic/health";
import {
    bodyPartImpairment,
    type BodyPartImpairment,
    type LocationInjury,
} from "@src/entity/body/impairment";
import type { BodyPart } from "@src/entity/body/BodyPart";
import type { TraumaLogic } from "@src/document/item/logic/TraumaLogic";
import type { AttributeLogic } from "@src/document/item/logic/AttributeLogic";
import {
    buildContractedAfflictionData,
    contagionTarget,
    promptContractDisease,
} from "@src/document/actor/logic/affliction-contract";
import type { SohlTokenDocument } from "@src/document/token/foundry/SohlTokenDocument";
import type { SohlCombatant } from "@src/document/combatant/foundry/SohlCombatant";
import {
    ACTION_SUBTYPE,
    ATTRIBUTE_CODE,
    CRITICAL_FAILURE,
    STATUS_EFFECT,
    IMPACT_ASPECT,
    ImpactAspectChoices,
    isImpactAspect,
    type ImpactAspect,
    ITEM_KIND,
    SKILL_CODE,
    SOHL_ACTION_SCOPE,
    SOHL_CONTEXT_MENU_SORT_GROUP,
    TRAUMA_SUBTYPE,
    FEAR_LEVEL,
    FearLevelLabels,
    MORALE_LEVEL,
} from "@src/utils/constants";
import {
    fearStateFromTest,
    fearPsyGain,
    mostSevereFear,
    isFearfulState,
    fearDefenseRestricted,
    fearHelpless,
    fearMustFlee,
    fearLevelLabelKey,
    FEAR_BRAVE_BONUS,
    FEAR_BRAVE_DURATION,
} from "@src/document/actor/logic/fear";
import {
    moraleStateFromTest,
    moralePsyGain,
    mostSevereMorale,
    isShakenMorale,
    moraleHelpless,
    moraleRouts,
    moraleWithdraws,
    reactionOutcome,
    rallyOutcome,
    moraleLevelLabelKey,
    MORALE_BRAVE_BONUS,
} from "@src/document/actor/logic/morale";
import { inflictPsycheStress } from "@src/document/item/logic/psyche";
import {
    pallDepthPenalty,
    pallResistState,
    pallStressGain,
    isPallFailure,
    PALL_STATE,
} from "@src/document/actor/logic/pall";
import { bloodStoppageOutcome } from "@src/entity/body/blood-stoppage";
// `action-card` touches Foundry only through the `FoundryHelpers` shims; the
// path-based boundary rule can't tell it apart from the Foundry-coupled files
// under `document/chat/`, so allow it.
// eslint-disable-next-line @typescript-eslint/no-restricted-imports
import { postActionCard } from "@src/document/chat/action-card";
// `chat-card-dispatch` touches Foundry only through the `FoundryHelpers` shims;
// the path-based boundary rule can't tell it apart from the Foundry-coupled files
// under `document/chat/`, so allow the `SELF_HANDLER` sentinel import.
// eslint-disable-next-line @typescript-eslint/no-restricted-imports
import { SELF_HANDLER } from "@src/document/chat/chat-card-dispatch";
import { SohlAction } from "@src/entity/action/SohlAction";
import {
    buildInjuryCardData,
    createTraumaFromInjury,
    getActorBodyStructure,
    InjuryDialogForm,
    isAutomatedRequest,
    parseInjuryRequest,
    readInjuryDialogForm,
    resolveAutomatedInjury,
} from "@src/document/actor/logic/injury-actions";
import {
    offerSchedule,
    type OfferContext,
} from "@src/document/item/logic/offer-schedule";
import { armScheduledActions } from "@src/entity/event/scheduled-actions";
import { toFilePath, defaultToJSON } from "@src/utils/helpers";
import {
    ResolvedInjury,
    resolveInjury,
} from "@src/entity/body/injury-resolution";
import { MissileStrikeMode } from "@src/entity/strikemode/MissileStrikeMode";
import type { ImpactResult } from "@src/entity/result/ImpactResult";
import { DamageCardInput } from "@src/document/combatant/logic/SohlCombatantLogic";

/**
 * A single person, creature, or NPC.
 *
 * A Being is the most detailed actor type in SoHL, representing an individual
 * entity with a full anatomy model (body roles, body parts, body locations),
 * skills, traits, injuries, afflictions, gear, and mystical abilities. Beings
 * are the primary participants in combat, skill tests, and social interactions.
 *
 * The being's **physical body — anatomy, body weight, reach, body-scale —
 * lives on its own {@link body} sub-object** (`system.body`), dissolved from the
 * former Corpus item into the Being (#535). **Movement** (`feetPerRound` /
 * `leaguesPerWatch` / `moveProfile`) is a universal actor capability on
 * {@link sohl.document.actor.logic.SohlActorBaseLogic}. `BeingLogic` additionally
 * derives movement's {@link strengthModifier} / {@link encumbrance} from its
 * strength and carried weight, and being-owned state ({@link healthBand} plus the
 * numeric `system.health` it writes, {@link healingBase}, {@link shockState},
 * {@link pull}, {@link carriedWeight}). An **incorporeal** being is one with an
 * empty {@link body} structure (see {@link sohl.document.actor.logic.BodyLogic}).
 *
 * @typeParam TData - The Being data interface.
 */
export class BeingLogic<
    TData extends BeingData = BeingData,
> extends SohlActorBaseLogic<TData> {
    /**
     * The qualitative health band (Excellent…Dead) for this being's current
     * {@link SohlActorData.health} value. Impairment-based — driven by impaired
     * body parts, not a points pool. Recomputed from the derived `health.value`
     * written in {@link finalize} via {@link deriveHealth}.
     */
    get healthBand(): HealthBand {
        return healthBandFor(this.data.health.value);
    }

    /**
     * The being's **Healing Base** as a {@link sohl.entity.modifier.ValueModifier}
     * — the mastery-level factor governing recovery, seeded in {@link evaluate}
     * to the average of the being's Endurance and Will scores (rounded up when
     * END > WIL, else down; see {@link healingBaseFor}) and open to trait and
     * treatment deltas on top. Multiplied by a Healing Rate, it is the target of
     * nearly every recovery test in the system. An empty modifier (base 0) when
     * the being lacks an Endurance or Will attribute (e.g. an incorporeal being).
     */
    healingBase!: ValueModifier;

    /**
     * The being's current **shock state** as an ascending severity level —
     * `NONE` (0), `STUNNED` (1), `INCAPACITATED` (2), `UNCONSCIOUS` (3), `DEAD`
     * (4) — derived from the active shock **status effects** (there is no
     * persisted field). Reports the highest active one (see
     * {@link sohl.document.actor.logic.SHOCK_STATE}); change it through
     * {@link setShockState} / {@link advanceShockState}, never by toggling the
     * statuses directly.
     */
    get shockState(): number {
        return shockStateFromStatuses(fvttActorStatuses(this.actor));
    }

    /**
     * Set the being's {@link shockState} to `level`, the single entry point for
     * shock transitions. Clears **every** shock status effect and then applies
     * only the one for `level` (none for `NONE`) — so transitions are clean in
     * both directions and any stray multi-status situation is repaired. Only the
     * statuses that actually change are toggled.
     *
     * @param level - The target shock-state level; clamped to `[NONE, DEAD]`.
     * @returns A promise that resolves once the statuses have been updated.
     */
    async setShockState(level: number): Promise<void> {
        const target = clampShockState(level);
        const targetStatus = shockStatusForLevel(target);
        const current = fvttActorStatuses(this.actor);
        for (const status of SHOCK_STATUS_IDS) {
            const shouldBeActive = status === targetStatus;
            if (shouldBeActive !== current.has(status)) {
                await fvttToggleActorStatus(this.actor, status, shouldBeActive);
            }
        }
    }

    /**
     * Advance (or, with a negative `steps`, improve) the being's
     * {@link shockState} by `steps` severity levels from its current state,
     * clamped to `[NONE, DEAD]`. A convenience over {@link setShockState} for
     * effects that read the current state and move it (blood loss, an injury
     * shock result, a shock re-test).
     *
     * @param steps - Levels to move (positive worsens, negative improves).
     * @returns A promise that resolves once the shock state has been updated.
     */
    async advanceShockState(steps: number): Promise<void> {
        await this.setShockState(this.shockState + steps);
    }

    /**
     * Record a **permanent impairment** (#554) on the body part containing
     * `locationShortcode`, worsening its persisted `permanentImpairment` to at
     * most `magnitude` (the worse — more negative — of the two). A no-op for a
     * non-negative `magnitude`, an unknown location, or when it would not worsen
     * the existing value. The whole `parts` array is rewritten (an element-by-
     * index write corrupts the array — see the Runtime Contracts).
     *
     * Called when an eligible injury heals to level 0 (see the Injury rules —
     * Permanent Impairment); the magnitude comes from
     * {@link sohl.entity.body.permanentImpairmentFor}.
     *
     * @param locationShortcode - The healed injury's body-location shortcode.
     * @param magnitude - The permanent impairment to apply (a non-positive number).
     * @returns A promise that resolves once the impairment is persisted.
     */
    async applyPermanentImpairment(
        locationShortcode: string,
        magnitude: number,
    ): Promise<void> {
        if (magnitude >= 0 || !locationShortcode || !this.actor) return;
        const structure = this.body?.structure;
        const parts = structure?.parts;
        if (!parts?.length) return;
        const index = parts.findIndex((p) =>
            p.locations.some((l) => l.shortcode === locationShortcode),
        );
        if (index < 0) return;
        const current = parts[index].permanentImpairment ?? 0;
        const next = Math.min(current, magnitude); // worst-of
        if (next === current) return; // no worsening
        const payload = structure.setPartFieldsUpdate([
            { index, changes: { permanentImpairment: next } },
        ]);
        if (!Object.keys(payload).length) return;
        await this.actor.update(payload as PlainObject);
    }

    /**
     * The being's pull score, determining whether it can draw certain bow weapons.
     */
    pull!: ValueModifier;

    /**
     * The being's **Fatigue Penalty** as a {@link sohl.entity.modifier.ValueModifier}
     * — the total Fatigue Levels across every `fatigue`-subtype
     * {@link sohl.document.item.logic.TraumaLogic | trauma} (windedness /
     * weariness / weakness are recorded as separate instances because each
     * recovers at its own rate). It penalizes all tests and Move rate. Seeded in
     * {@link finalize} once traumas are prepared; there is no persisted field.
     */
    fatiguePenalty!: ValueModifier;

    /**
     * Running total of carried-gear weight (pounds) as a {@link sohl.entity.modifier.ValueModifier},
     * accumulated ground-up: each carried gear item adds a delta of its
     * `weight × quantity` during its own `evaluate()` phase (see
     * {@link sohl.document.item.logic.GearLogic.evaluate}). Reset to an empty modifier at the start of
     * {@link initialize} and fully populated (read via `carriedWeight.effective`)
     * by the time the being's own `evaluate()`/`finalize()` and the sheet read it.
     */
    carriedWeight!: ValueModifier;

    /**
     * The being's {@link sohl.document.actor.logic.BodyLogic | body} — its
     * anatomy, weight, reach, and body-scale, derived from `system.body`.
     * Constructed directly in {@link initialize} (no embedded item, no
     * cross-document registration). An **incorporeal** being has an empty body
     * structure ({@link sohl.document.actor.logic.BodyLogic.isIncorporeal}).
     */
    body!: BodyLogic;

    /**
     * The being's strength modifier to encumbrance, as a
     * {@link sohl.entity.modifier.ValueModifier}. Derived in {@link evaluate}
     * from the active movement profile's `strMod` expression of the being's
     * strength.
     */
    strengthModifier!: ValueModifier;

    /**
     * The being's encumbrance, as a {@link sohl.entity.modifier.ValueModifier}.
     * Derived in {@link finalize} from the active movement profile's
     * `encumbrance` expression of the being's {@link carriedWeight}.
     */
    encumbrance!: ValueModifier;

    /**
     * This being's size-scaled injury-level thresholds — delegated to the
     * {@link body}. Read by {@link sohl.entity.body.BodyStructure.injuryTable}
     * (which reaches it through this being, the structure's parent).
     */
    get injuryTable(): number[] {
        return this.body.injuryTable;
    }

    /**
     * The being's melee reach (feet): the greatest reach among its currently
     * *available* melee strike modes.
     *
     * - **Combat techniques** are intrinsic and always available — every
     *   melee technique mode counts.
     * - A **weapon's** melee mode counts only when the weapon is currently
     *   held in at least the mode's `minParts` limbs (a body part that
     *   `canHoldItem`).
     *
     * Returns 0 when no melee mode is available (e.g. an unarmed being with
     * no combat techniques). Reads each strike mode's already-evaluated
     * `reach`, so it should be read after item preparation.
     */
    get reach(): number {
        const lt = this.logicTypes;
        const structure = this.body?.structure;

        const options: MeleeReachOption[] = [];

        // Combat techniques (combattechnique-subtype skills): intrinsic, always
        // available.
        for (const skill of lt[ITEM_KIND.SKILL]) {
            const sm = skill.strikeMode;
            if (sm instanceof MeleeStrikeMode) {
                options.push({
                    reach: sm.reach.effective,
                    minParts: sm.minParts,
                    heldLimbs: null,
                });
            }
        }

        // Weapons: a melee mode is available only if the weapon is held in at
        // least `minParts` limbs.
        for (const weapon of lt[ITEM_KIND.WEAPONGEAR]) {
            const heldLimbs = structure?.limbsHolding(weapon.id) ?? 0;
            for (const sm of weapon.strikeModes ?? []) {
                if (sm instanceof MeleeStrikeMode) {
                    options.push({
                        reach: sm.reach.effective,
                        minParts: sm.minParts,
                        heldLimbs,
                    });
                }
            }
        }

        return computeActorReach(options);
    }

    /**
     * Return the usable strike modes for this weapon.
     *
     * @remarks
     * This method returns the usable strike modes for a weapon, based on whether
     * the item is currently readied, how many body parts are holding the weapon,
     * and other conditions including heft, pull, and similar considerations.
     *
     * @param options - Filter criteria for the strike mode query.
     * @param options.distanceToTarget - if specified, the distance from the weapon holder
     * to the target, used to consider reach and/or range.
     * @param options.volleyAllowed - if `true`, volley strike modes are allowed, otherwise not.
     * @param options.directAllowed - if `true`, direct strike modes are allowed, otherwise not.
     * @param options.meleeAllowed - if `true`, melee strike modes are allowed, otherwise not.
     * @returns array of strike modes on this weapon that are currently usable that
     * meet the criteria.
     */
    getUsableStrikeModes(
        {
            distanceToTarget,
            volleyAllowed,
            directAllowed,
            meleeAllowed,
        }: {
            distanceToTarget: number;
            volleyAllowed: boolean;
            directAllowed: boolean;
            meleeAllowed: boolean;
        } = {
            distanceToTarget: 0,
            volleyAllowed: false,
            directAllowed: true,
            meleeAllowed: true,
        },
    ): StrikeModeBase[] {
        return this.availableStrikeModes.filter((sm) => {
            if (sm.attack?.disabled) return false;
            if (sm.isMelee) {
                if (!meleeAllowed) return false;
                return (
                    distanceToTarget <=
                    ((sm as MeleeStrikeMode).reach?.effective ?? 0)
                );
            }
            if (sm.isMissile) {
                const missile = sm as MissileStrikeMode;
                const inRange =
                    distanceToTarget <= (missile.baseRange?.effective ?? 0);
                if (!inRange) return false;
                const canDirect = directAllowed;
                const canVolley = volleyAllowed && missile.maxVolleyMult > 0;
                return canDirect || canVolley;
            }
            return false;
        });
    }

    /**
     * The strike modes currently available to this being:
     *
     * - every combat technique's strike mode (intrinsic, always available), and
     * - each weapon strike mode whose weapon is held in at least the mode's
     *   `minParts` limbs.
     * - If a missile weapon, the draw must be less then or equal to the being's
     *   pull.
     *
     * Reads each strike mode's already-prepared data, so it should be read
     * after item preparation. Returns an empty array when no mode is available.
     */
    get availableStrikeModes(): StrikeModeBase[] {
        let resultStrikeModes: StrikeModeBase[] = [];

        // Add Combat Technique strike modes (combattechnique-subtype skills)
        for (const skill of this.logicTypes[ITEM_KIND.SKILL]) {
            if (skill.strikeMode) resultStrikeModes.push(skill.strikeMode);
        }

        // Add all appropriate weapon strike modes
        this.logicTypes[ITEM_KIND.WEAPONGEAR].forEach((weapon) => {
            const numHeldLimbs = weapon.heldBy.length;
            if (numHeldLimbs) {
                const candidates = weapon.strikeModes.filter((sm) => {
                    if (sm.minParts > numHeldLimbs) return false;
                    if (!sm.isMissile) return true;
                    return (
                        (sm as MissileStrikeMode).draw.effective <=
                        this.pull.effective
                    );
                });
                resultStrikeModes.push(...candidates);
            }
        });

        return resultStrikeModes;
    }

    /**
     * This being's tokens on the world's active scene.
     *
     * - For a **synthetic** (token) actor, this is the single token the actor
     *   is embedded in, provided that token lives on the active scene.
     * - For a **world** (linked) actor, this is every linked token on the
     *   active scene that represents this actor.
     *
     * Returns an empty array when there is no active scene or no matching token.
     */
    get tokens(): SohlTokenDocument[] {
        const actor = this.actor;
        if (!actor) return [];

        const scene = getActiveScene();
        if (!scene) return [];

        const sceneTokens = [
            ...((scene.tokens ?? []) as Iterable<SohlTokenDocument>),
        ];
        const embedded =
            (actor as any).isToken ?
                ((actor as any).token as SohlTokenDocument | null)
            :   null;
        if (!embedded && !actor.id) return [];

        return selectActorTokens(sceneTokens, actor.id ?? "", embedded ?? null);
    }

    /**
     * This being's combatant in the active combat encounter.
     *
     * Returns the first combatant of `game.combat` whose token is one of this
     * being's {@link tokens} on the active scene, or `null` when there is no
     * active combat or no such combatant.
     */
    get combatant(): SohlCombatant | null {
        const combat = getActiveCombat();
        if (!combat) return null;

        const tokenIds = new Set(
            this.tokens.map((t) => t.id).filter((id): id is string => !!id),
        );
        if (tokenIds.size === 0) return null;

        return selectActorCombatant(
            combat.combatants.contents as SohlCombatant[],
            tokenIds,
        );
    }

    /* --------------------------------------------- */
    /* Intrinsic Actions                             */
    /* --------------------------------------------- */

    /**
     * Apply the impact of an attack or effect to this being, calculating the resulting
     * location and damage. If armor or other defenses are unable to fully mitigate the impact,
     * this will return the resulting damage and location so it can then be used
     * to apply damage to the being's body roles and parts.
     * @param context - Action context carrying the impact result in its scope
     *   (`scope.priorTestResult` / `scope.impactModifier`).
     * @returns The impact result, or null if no impact occurred.
     */
    async calcImpact(
        context: SohlActionContext<Partial<ImpactResult.ContextScope>>,
    ): Promise<PlainObject | undefined> {
        let impactResult: ImpactResult | undefined;
        if (!context.scope?.priorTestResult) {
            if (!context.scope?.impactModifier) {
                sohl.log.error(
                    "calcImpact requires an ImpactResult in the action context scope",
                );
                return undefined;
            }
            impactResult = new entity.ImpactResult(context.scope, {
                parent: this,
            });
            await impactResult.evaluate();
        } else {
            impactResult = context.scope.priorTestResult;
        }

        const cardData: DamageCardInput = {
            title:
                context.scope.mode ?
                    `${context.scope.mode.fullLabel}`
                :   "Impact",
            notes: "",
            impactLabel:
                impactResult.roll ?
                    `${impactResult.roll.formula}${impactResult.aspect}`
                :   "",
            rollResult: impactResult.roll?.result ?? "",
            impact: impactResult.roll.total ?? 0,
            aspect: impactResult.aspect ?? IMPACT_ASPECT.BLUNT,
            hasTarget: !!context.target?.name,
            targetName: context.target?.name ?? "",
            handlerUuid: context.target?.actorLogic?.uuid ?? "",
            sourceActorUuid: this.uuid,
            // The createInjury button's `scope` payload: a plain injury request
            // built from the impact (matching `injuryButton`), aimed hit-location
            // forwarded when present so the handler can resolve automatically.
            scopeData: defaultToJSON({
                impact: impactResult.total,
                aspect: impactResult.aspect,
                ...(impactResult.aimBodyPartCode ?
                    {
                        targetPart: impactResult.aimBodyPartCode,
                        spread: impactResult.spread,
                    }
                :   {}),
            }) as PlainObject,
        };
        await context.speaker.toChat(
            toFilePath("systems/sohl/templates/chat/damage-card.hbs"),
            cardData,
        );

        return cardData;
    }

    /**
     * Roll the being's shock test (Shock skill), used to resist losing
     * consciousness or capability after taking injury. The resulting success
     * level feeds the being's shock modifier.
     *
     * @param context - The action context for the test.
     * @returns The success test result, or `null` if the test could not be run.
     * @remarks Not yet implemented; currently returns `null`.
     */
    async shockTest(
        context: SohlActionContext<EmptyObject>,
    ): Promise<SuccessTestResult | null> {
        // let { testResult } = options;
        // if (!testResult) {
        //     const shockSkill = this.actor.getItem("shk", { types: ["skill"] });
        //     if (!shockSkill) return null;
        //     testResult = new CONFIG.SOHL.class.SuccessTestResult(
        //         {
        //             speaker,
        //             testType: SuccessTestResult.TEST_TYPE.SHOCK,
        //             mlMod: Utility.deepClone(shockSkill.system.$masteryLevel),
        //         },
        //         { parent: shockSkill.system },
        //     );
        //     // For the shock test, the test should not include the impairment penalty
        //     testResult.mlMod.delete("BPImp");
        // }
        // testResult = testResult.item.system.successTest(optionws);
        // testResult.shockMod = 1 - testResult.successLevel;
        // return testResult;
        return null;
    }

    /**
     * Resolve the **Injury Shock Test** (#555) for a wound just taken, worsening
     * the being's {@link shockState} accordingly.
     *
     * Intrinsic handler for the injury card's Shock Roll button. The card's
     * `scope` carries the wound's precomputed shock contribution
     * (`shockIndex` = body-location Shock Value + Injury Level, already including
     * the glancing-blow point) and a `shockBonus` (the +10 glancing-blow roll
     * bonus). A **Shock** skill test is rolled headlessly — the being's fatigue
     * penalty applies and the glancing bonus is added, but injury-impairment
     * penalties do not — and its result adjusts the **Shock State Index**
     * (CF +2 / MF +1 / MS 0 / CS −1). The resulting index maps to a shock state
     * ({@link shockStateFromIndex}); the being is then worsened to that state
     * (shock only ever worsens here — an improving Re-Test is #556).
     *
     * @param context - The action context; its `scope` carries `shockIndex` and
     *   an optional `shockBonus`.
     * @returns The Shock-test result, or `null` if the roll could not be run.
     */
    async injuryShock(
        context: SohlActionContext,
    ): Promise<SuccessTestResult | null> {
        const scope = (context.scope ?? {}) as {
            shockIndex?: number;
            shockBonus?: number;
        };
        const shockIndex = Number(scope.shockIndex ?? 0);
        const shockBonus = Number(scope.shockBonus ?? 0);

        const shockMl =
            (
                this.getItemLogic(SKILL_CODE.SHOCK, ITEM_KIND.SKILL) as
                    | SkillLogic
                    | undefined
            )?.masteryLevel?.effective ?? 0;
        // Fatigue penalty applies; injury-impairment penalties do not. The
        // glancing-blow bonus is added to the roll.
        const situationalModifier =
            shockBonus - (this.fatiguePenalty?.effective ?? 0);

        const result = await rollTimedTest(this, shockMl, {
            type: "injury-shock",
            title: sohl.i18n.localize("SOHL.Being.Action.shockTest"),
            situationalModifier,
        });
        if (!result) return null;

        const ssi = shockIndex + shockIndexAdjustment(result.normSuccessLevel);
        const target = shockStateFromIndex(ssi);
        // Worsen only — an injury never improves an already-worse shock state.
        await this.setShockState(Math.max(this.shockState, target));
        // Entering ordinary shock offers (never auto-arms) the Re-Test reminder
        // on the state's cadence — end of each turn / +10 min (#569).
        await this.offerShockReTest(context);
        return result;
    }

    /**
     * Resolve a **Shock Re-Test** (#556) for an Incapacitated or Unconscious
     * being, attempting to shake off ordinary shock.
     *
     * Rolls the being's **Shock** skill headlessly at −20 (the being's fatigue
     * penalty also applies; injury-impairment penalties do not) and applies the
     * result ({@link shockReTestOutcome}): a critical success recovers from all
     * shock, a marginal success improves to Stunned, and a failure drops the
     * victim into **Extended Shock** (a `shock`-subtype trauma at Healing Rate
     * 4/5) — or, for an Unconscious victim on a critical failure, a **Coma** (a
     * `coma`-subtype trauma whose Healing Rate is `12 − Location Shock Value −
     * Injury Level` of the worst active wound). Both lasting-shock traumas then
     * recover through their own Course Test (see
     * {@link sohl.document.item.logic.TraumaLogic.courseCheck}).
     *
     * A no-op (returns `null`) unless the being is Incapacitated or Unconscious.
     * The re-test is currently invoked manually / on demand; its automatic
     * scheduling (end of the next turn for Incapacitated, ten minutes later for
     * Unconscious) awaits a follow-up.
     *
     * @param context - The action context for the test; forwarded to the
     *   course-check schedule offer for any Extended Shock / Coma created.
     * @returns The Shock re-test result, or `null` when no re-test applies.
     */
    async shockReTest(
        context: SohlActionContext,
    ): Promise<SuccessTestResult | null> {
        const state = this.shockState;
        if (
            state !== SHOCK_STATE.INCAPACITATED &&
            state !== SHOCK_STATE.UNCONSCIOUS
        ) {
            sohl.log.uiWarn(
                sohl.i18n.localize("SOHL.Being.ShockReTest.NotApplicable"),
            );
            return null;
        }
        const shockMl =
            (
                this.getItemLogic(SKILL_CODE.SHOCK, ITEM_KIND.SKILL) as
                    | SkillLogic
                    | undefined
            )?.masteryLevel?.effective ?? 0;
        const result = await rollTimedTest(this, shockMl, {
            type: "shock-retest",
            title: sohl.i18n.localize("SOHL.Being.Action.shockReTest"),
            situationalModifier:
                SHOCK_RETEST_MODIFIER - (this.fatiguePenalty?.effective ?? 0),
        });
        if (!result) return null;
        await this.applyShockReTestOutcome(
            shockReTestOutcome(state, result.normSuccessLevel),
            context,
        );
        // A performed Re-Test always ends the ordinary-shock cycle — the victim
        // recovers/improves out of it, or falls into a lasting Extended Shock /
        // Coma that recovers through its own Course Test. Either way the ordinary
        // Re-Test reminder is done; clear it rather than auto-re-arming (#569).
        if (this.actor) await sohl.unschedule(this.actor, "shockReTest");
        return result;
    }

    /**
     * **Offer** to schedule (or, when it no longer applies, clear) the being's
     * Shock **Re-Test** reminder for its current state (#569) — the being-level
     * timing half of #556, routed through the shared {@link offerSchedule} consent
     * step so nothing auto-arms (Prime Directive: offer, remind, perform).
     *
     * While in **ordinary** shock the reminder rides the state's cadence: an
     * **Incapacitated** victim re-tests at the end of each combat turn (an
     * event-driven `turnEnd` schedule), an **Unconscious** one ten minutes later
     * (a time schedule). Any other state — recovered, merely Stunned, or already
     * in a lasting Extended Shock / Coma (whose recovery is a Course Test, not a
     * Re-Test) — clears the reminder. When due, the event queue posts an
     * owner-gated `[Perform]` card; the Re-Test runs only on the controller's
     * click.
     *
     * @param context - The action context; `scope.schedule` pre-answers the offer
     *   and `skipDialog` suppresses the prompt (scripted callers).
     * @returns A promise that resolves once the reminder is armed or cleared.
     */
    async offerShockReTest(context: OfferContext): Promise<void> {
        if (!this.actor) return;
        if (!this.isOrdinaryShock()) {
            await sohl.unschedule(this.actor, "shockReTest");
            return;
        }
        if (this.shockState === SHOCK_STATE.INCAPACITATED) {
            // End of the being's OWN turn — an event-driven cadence (#622), no
            // fixed delay, gated to this being's combatant so the reminder comes
            // once per round on its turn, not on every combatant's (#569).
            await offerSchedule(
                context,
                this.actor,
                "shockReTest",
                0,
                "turnEnd",
                SHOCK_RETEST_OWN_TURN_PREDICATE,
            );
        } else {
            // Unconscious → ten minutes later (a time schedule).
            await offerSchedule(
                context,
                this.actor,
                "shockReTest",
                SHOCK_RETEST_UNCONSCIOUS_DELAY,
            );
        }
    }

    /**
     * Whether the being is in **ordinary** (Re-Testable) shock — Incapacitated or
     * Unconscious, and **not** already in a lasting Extended Shock / Coma (a
     * `shock`- or `coma`-subtype trauma). Ordinary shock shakes off via the Shock
     * Re-Test; a lasting condition recovers through its own Course Test, so the
     * ordinary Re-Test reminder must not apply while one is present (#569).
     *
     * @returns True when the ordinary Shock Re-Test applies.
     */
    private isOrdinaryShock(): boolean {
        const state = this.shockState;
        if (
            state !== SHOCK_STATE.INCAPACITATED &&
            state !== SHOCK_STATE.UNCONSCIOUS
        ) {
            return false;
        }
        return !(this.logicTypes[ITEM_KIND.TRAUMA] as TraumaLogic[]).some(
            (t) =>
                t.data.subType === TRAUMA_SUBTYPE.SHOCK ||
                t.data.subType === TRAUMA_SUBTYPE.COMA,
        );
    }

    /**
     * Apply a resolved {@link shockReTestOutcome}: improve/recover the shock
     * state directly, or create the corresponding Extended Shock / Coma
     * lasting-shock trauma.
     *
     * @param outcome - The re-test outcome to apply.
     * @param context - The shock re-test action's context, forwarded to the
     *   course-check schedule offer for any Extended Shock / Coma created.
     * @returns A promise that resolves once the outcome is applied.
     */
    private async applyShockReTestOutcome(
        outcome: ShockReTestOutcome,
        context: OfferContext,
    ): Promise<void> {
        switch (outcome.kind) {
            case "recover":
                await this.setShockState(SHOCK_STATE.NONE);
                return;
            case "improve":
                await this.setShockState(outcome.state);
                return;
            case "extendedShock":
                await this.createLastingShock(
                    TRAUMA_SUBTYPE.SHOCK,
                    outcome.hr,
                    this.inducingInjury()?.code ?? "",
                    context,
                );
                return;
            case "coma": {
                const inducing = this.inducingInjury();
                // Coma Healing Rate = 12 − Location Shock Value − Injury Level.
                // With no inducing wound to key off, fall back to a mid Healing
                // Rate so the coma is neither instantly fatal nor instantly over.
                const hr =
                    inducing ?
                        comaHealingRate(inducing.shockValue, inducing.level)
                    :   3;
                await this.createLastingShock(
                    TRAUMA_SUBTYPE.COMA,
                    hr,
                    inducing?.code ?? "",
                    context,
                );
                await this.setShockState(SHOCK_STATE.UNCONSCIOUS);
                return;
            }
        }
    }

    /**
     * Create an Extended Shock / Coma lasting-shock trauma, then **offer** to
     * track its recovery Course Test (issue #579 — nothing auto-schedules; the
     * cadence config is seeded by the Trauma data model on creation).
     *
     * @param subType - `SHOCK` (Extended Shock) or `COMA`.
     * @param healingRate - The lasting-shock Healing Rate.
     * @param locationCode - The inducing body-location shortcode (may be empty).
     * @param context - The shock re-test context, forwarded to the course offer.
     * @returns A promise that resolves once the trauma is created and offered.
     */
    private async createLastingShock(
        subType: string,
        healingRate: number,
        locationCode: string,
        context: OfferContext,
    ): Promise<void> {
        const name = sohl.i18n.localize(
            subType === TRAUMA_SUBTYPE.COMA ?
                "SOHL.Trauma.Coma"
            :   "SOHL.Trauma.ExtendedShock",
        );
        const created = await fvttCreateEmbeddedItems(this, [
            {
                type: ITEM_KIND.TRAUMA,
                name,
                system: {
                    subType,
                    levelBase: 0,
                    healingRateBase: Math.max(1, healingRate),
                    aspect: IMPACT_ASPECT.BLUNT,
                    bodyLocationCode: locationCode,
                },
            },
        ]);
        const shock = created?.[0];
        if (!shock) return;
        const interval = Number(shock.system?.courseDurationBase) || 0;
        await offerSchedule(context, shock, "courseCheck", interval);
    }

    /**
     * The being's **worst active injury** — the highest Injury Level, breaking
     * ties by the location's Shock Value — with the data a Coma's Healing Rate
     * needs. `undefined` when the being has no active injuries.
     *
     * @returns The inducing injury's location code, level, and Shock Value.
     */
    private inducingInjury():
        | { code: string; level: number; shockValue: number }
        | undefined {
        const injuries = (
            this.logicTypes[ITEM_KIND.TRAUMA] as TraumaLogic[]
        ).filter(
            (t) =>
                t.data.subType === TRAUMA_SUBTYPE.INJURY &&
                (t.level?.effective ?? 0) > 0,
        );
        let best: TraumaLogic | undefined;
        let bestLevel = 0;
        let bestShock = 0;
        for (const t of injuries) {
            const level = t.level?.effective ?? 0;
            const shock = t.bodyLocation?.shockValue?.effective ?? 0;
            if (
                level > bestLevel ||
                (level === bestLevel && shock > bestShock)
            ) {
                best = t;
                bestLevel = level;
                bestShock = shock;
            }
        }
        if (!best) return undefined;
        return {
            code: best.data.bodyLocationCode,
            level: bestLevel,
            shockValue: bestShock,
        };
    }

    /**
     * Roll the being's stumble test, used to keep its footing. Tests the better
     * of the being's Agility trait and Acrobatics skill.
     *
     * @param context - The action context for the test.
     * @returns The success test result, or `null` if the test could not be run.
     * @remarks Not yet implemented; currently returns `null`.
     */
    async stumbleTest(
        context: SohlActionContext<EmptyObject>,
    ): Promise<SuccessTestResult | null> {
        // if (!options.testResult) {
        //     const agility = this.actor.getItem("agl", { types: ["trait"] });
        //     const acrobatics = this.actor.getItem("acro", { types: ["skill"] });
        //     const item =
        //         (
        //             agility?.system.$masteryLevel.effective >
        //             acrobatics?.system.$masteryLevel.effective
        //         ) ?
        //             agility
        //         :   acrobatics;
        //     if (!item) return null;
        //     options.testResult = new CONFIG.SOHL.class.SuccessTestResult(
        //         {
        //             speaker,
        //             testType: SuccessTestResult.TEST_TYPE.STUMBLE,
        //             mlMod: Utility.deepClone(item.system.$masteryLevel),
        //         },
        //         { parent: item.system },
        //     );
        // }
        // return options.testResult.item.system.successTest(options);
        return null;
    }

    /**
     * Roll the being's fumble test, used to avoid dropping or mishandling an
     * item. Tests the better of the being's Dexterity trait and Legerdemain
     * skill.
     *
     * @param context - The action context for the test.
     * @returns The success test result, or `null` if the test could not be run.
     * @remarks Not yet implemented; currently returns `null`.
     */
    async fumbleTest(
        context: SohlActionContext<EmptyObject>,
    ): Promise<SuccessTestResult | null> {
        // if (!options.testResult) {
        //     const dexterity = this.actor.getItem("dex", { types: ["trait"] });
        //     const legerdemain = this.actor.getItem("lgdm", {
        //         types: ["skill"],
        //     });
        //     const item =
        //         (
        //             dexterity?.system.$masteryLevel.effective >
        //             legerdemain?.system.$masteryLevel.effective
        //         ) ?
        //             dexterity
        //         :   legerdemain;
        //     if (!item) return null;
        //     options.testResult = new CONFIG.SOHL.class.SuccessTestResult(
        //         {
        //             speaker,
        //             testType: SuccessTestResult.TEST_TYPE.FUMBLE,
        //             mlMod: Utility.deepClone(item.system.$masteryLevel),
        //         },
        //         { parent: item.system },
        //     );
        // }
        // return options.testResult.item.system.successTest(options);
        return null;
    }

    /**
     * The being's current **morale state** (#559) — the most severe (most-failed)
     * {@link sohl.utils.MORALE_LEVEL} across its active morale-failure traumas, or
     * `NONE` when it carries none.
     */
    get moraleState(): number {
        return mostSevereMorale(
            this.activeMoraleTraumas().map((t) => t.data.levelBase),
        );
    }

    /**
     * The being's active shaken `morale`-subtype traumas — the recorded
     * morale-failure sources at Withdrawing or worse.
     *
     * @returns The active shaken morale traumas.
     */
    private activeMoraleTraumas(): TraumaLogic[] {
        return (this.logicTypes[ITEM_KIND.TRAUMA] as TraumaLogic[]).filter(
            (t) =>
                t.data.subType === TRAUMA_SUBTYPE.MORALE &&
                isShakenMorale(t.data.levelBase),
        );
    }

    /**
     * Resolve a **Morale Test** (#559) — a test of the **Initiative** skill —
     * against a morale-failure source, recording the resulting {@link moraleState}.
     *
     * A self-sufficient action on the affected being: it rolls Initiative
     * headlessly (adding the Brave bonus if active) and maps the result to a
     * {@link sohl.utils.MORALE_LEVEL} (the CF0/CF5 split decides Catatonic vs
     * Routed). A shaken result records or worsens a `morale`-subtype trauma and
     * inflicts any Psyche Stress; a success clears the source (Steady) or grants
     * the Brave bonus.
     *
     * @param context - The action context; `scope.sourceName` names the source.
     * @returns The Morale-test result, or `null` if the roll could not be run.
     */
    async moraleTest(
        context: SohlActionContext,
    ): Promise<SuccessTestResult | null> {
        const scope = (context.scope ?? {}) as { sourceName?: string };
        const sourceName =
            typeof scope.sourceName === "string" && scope.sourceName ?
                scope.sourceName
            :   sohl.i18n.localize("SOHL.Trauma.Morale.DefaultSource");
        const initMl =
            (
                this.getItemLogic(SKILL_CODE.INITIATIVE, ITEM_KIND.SKILL) as
                    | SkillLogic
                    | undefined
            )?.masteryLevel?.effective ?? 0;
        const braveBonus = this.hasBraveBonus() ? MORALE_BRAVE_BONUS : 0;
        const result = await rollTimedTest(this, initMl, {
            type: "morale-test",
            title: sohl.i18n.localize("SOHL.Being.Action.moraleTest"),
            situationalModifier: braveBonus,
        });
        if (!result) return null;
        await this.applyMoraleResult(
            moraleStateFromTest(result.normSuccessLevel, result.lastDigit),
            sourceName,
            result.isSuccess,
        );
        return result;
    }

    /**
     * Record the outcome of a {@link moraleTest} (or a rally/reaction transition):
     * upsert/clear the source's morale trauma, inflict incremental Psyche Stress,
     * and post the state card. Morale carries no status effect — the trauma items
     * are the record.
     *
     * @param level - The {@link sohl.utils.MORALE_LEVEL} produced.
     * @param sourceName - The morale source's display name.
     * @param isSuccess - Whether the test succeeded.
     * @returns A promise that resolves once the outcome is persisted.
     */
    private async applyMoraleResult(
        level: number,
        sourceName: string,
        isSuccess: boolean,
    ): Promise<void> {
        const psyGain = await this.recordLadderTrauma(
            TRAUMA_SUBTYPE.MORALE,
            level,
            sourceName,
            isShakenMorale,
            moralePsyGain,
            MORALE_LEVEL.BRAVE,
        );
        if (psyGain > 0) await inflictPsycheStress(this, psyGain, sourceName);

        const notes: string[] = [];
        if (isShakenMorale(level)) {
            if (moraleHelpless(level)) {
                notes.push(
                    sohl.i18n.localize("SOHL.Trauma.Morale.Note.Helpless"),
                );
            } else if (moraleRouts(level)) {
                notes.push(
                    sohl.i18n.localize("SOHL.Trauma.Morale.Note.Routed"),
                );
            } else if (moraleWithdraws(level)) {
                notes.push(
                    sohl.i18n.localize("SOHL.Trauma.Morale.Note.Withdrawing"),
                );
            }
        } else if (level === MORALE_LEVEL.BRAVE) {
            notes.push(sohl.i18n.localize("SOHL.Trauma.Morale.Note.Brave"));
        } else {
            notes.push(sohl.i18n.localize("SOHL.Trauma.Morale.Note.Steady"));
        }

        await this.postTraumaStateCard(
            sohl.i18n.localize("SOHL.Being.Action.moraleTest"),
            moraleLevelLabelKey(level),
            isSuccess,
            psyGain,
            notes,
        );
    }

    /**
     * Resolve a **Reaction Test** (#559) — an Initiative test a shaken combatant
     * makes to shake off a compromised morale state (or in response to an ally's
     * {@link rallyTest | Rally}). On success a Catatonic victim improves to Routed
     * and any other shaken victim snaps back to **Steady**
     * ({@link sohl.document.actor.logic.reactionOutcome}); on failure the state
     * persists. A no-op (returns `null`) when the being is not shaken.
     *
     * @param context - The action context for the test.
     * @returns The Reaction-test result, or `null` when no reaction applies.
     */
    async reactionTest(
        context: SohlActionContext,
    ): Promise<SuccessTestResult | null> {
        void context;
        const current = this.moraleState;
        if (!isShakenMorale(current)) {
            sohl.log.uiWarn(sohl.i18n.localize("SOHL.Trauma.Morale.NotShaken"));
            return null;
        }
        const initMl =
            (
                this.getItemLogic(SKILL_CODE.INITIATIVE, ITEM_KIND.SKILL) as
                    | SkillLogic
                    | undefined
            )?.masteryLevel?.effective ?? 0;
        const result = await rollTimedTest(this, initMl, {
            type: "reaction-test",
            title: sohl.i18n.localize("SOHL.Being.Action.reactionTest"),
        });
        if (!result) return null;
        await this.applyReaction(
            reactionOutcome(current, result.isSuccess),
            result.isSuccess,
        );
        return result;
    }

    /**
     * Apply a Reaction/Rally transition to the being's morale: Steady clears every
     * shaken morale trauma, otherwise the shaken sources are lowered to `target`.
     *
     * @param target - The {@link sohl.utils.MORALE_LEVEL} to move to.
     * @param isSuccess - Whether the reaction succeeded (colors the card).
     * @returns A promise that resolves once applied.
     */
    private async applyReaction(
        target: number,
        isSuccess: boolean,
    ): Promise<void> {
        const shaken = this.activeMoraleTraumas();
        if (target <= MORALE_LEVEL.STEADY) {
            for (const t of shaken) await t.item.delete();
        } else {
            for (const t of shaken) {
                if (t.data.levelBase > target) {
                    await t.item.update({
                        "system.levelBase": target,
                    } as PlainObject);
                }
            }
        }
        await this.postTraumaStateCard(
            sohl.i18n.localize("SOHL.Being.Action.reactionTest"),
            moraleLevelLabelKey(target),
            isSuccess,
            0,
            [],
        );
    }

    /**
     * Resolve a **Rally Test** (#559) — a leader's Command/Initiative test, made
     * once per round as a free action, that steadies Routed and Withdrawing allies
     * ({@link sohl.document.actor.logic.rallyOutcome}). Under the Prime Directive a
     * rally is **offered, not imposed**: on a success this posts an **open** action
     * card that any shaken ally's controller may accept to steady their own
     * character (CS) or make a Reaction Test (MS). A failure posts an
     * informational card noting the lockout.
     *
     * @param context - The action context for the test.
     * @returns The Rally-test result, or `null` if the roll could not be run.
     */
    async rallyTest(
        context: SohlActionContext,
    ): Promise<SuccessTestResult | null> {
        void context;
        const cmdMl =
            (
                this.getItemLogic(SKILL_CODE.COMMAND, ITEM_KIND.SKILL) as
                    | SkillLogic
                    | undefined
            )?.masteryLevel?.effective ??
            (
                this.getItemLogic(SKILL_CODE.INITIATIVE, ITEM_KIND.SKILL) as
                    | SkillLogic
                    | undefined
            )?.masteryLevel?.effective ??
            0;
        const result = await rollTimedTest(this, cmdMl, {
            type: "rally-test",
            title: sohl.i18n.localize("SOHL.Being.Action.rallyTest"),
        });
        if (!result) return null;
        const outcome = rallyOutcome(result.normSuccessLevel);
        if (outcome.kind === "unresponsive") {
            await this.postTraumaStateCard(
                sohl.i18n.localize("SOHL.Being.Action.rallyTest"),
                "",
                false,
                0,
                [sohl.i18n.localize("SOHL.Trauma.Rally.Unresponsive")],
            );
            return result;
        }
        // Success — offer the rally to any shaken ally (owner-accepted).
        await postActionCard(this.speaker, {
            template: "systems/sohl/templates/chat/rally-offer-card.hbs",
            data: {
                actorId: this.actor?.id ?? "",
                rallierName: this.actor?.name ?? "",
                steady: outcome.kind === "steady",
            },
            buttons: {
                action: "acceptRally",
                handlerUuid: SELF_HANDLER,
                scope: { mode: outcome.kind },
                label: sohl.i18n.localize("SOHL.Being.Action.acceptRally"),
                iconFAClass: "fa-solid fa-flag",
            },
        });
        return result;
    }

    /**
     * Accept an ally's {@link rallyTest | Rally} — the **open** Rally card's
     * button runs this on the accepting player's own character. Self-gates: only a
     * shaken (Withdrawing/Routed/Catatonic) character responds. A `steady` rally
     * (CS) makes them Steady immediately; a `reaction` rally (MS) triggers their
     * Reaction Test.
     *
     * @param context - The action context; `scope.mode` is `"steady"` or
     *   `"reaction"`.
     * @returns A promise that resolves once the rally is applied.
     */
    async acceptRally(context: SohlActionContext): Promise<void> {
        if (!isShakenMorale(this.moraleState)) {
            sohl.log.uiWarn(sohl.i18n.localize("SOHL.Trauma.Morale.NotShaken"));
            return;
        }
        const scope = (context.scope ?? {}) as { mode?: string };
        if (scope.mode === "steady") {
            await this.applyReaction(MORALE_LEVEL.STEADY, true);
        } else {
            await this.reactionTest(context);
        }
    }

    /**
     * The being's accrued **Pall Stress Levels (PSL)** (#561) — the level of its
     * single `pall`-subtype trauma (the Pall Cloud), or 0 when it carries none.
     */
    get pallStress(): number {
        return this.pallTrauma()?.data.levelBase ?? 0;
    }

    /**
     * The being's `pall`-subtype trauma (the Pall Cloud), or `undefined`.
     *
     * @returns The Pall trauma, or `undefined`.
     */
    private pallTrauma(): TraumaLogic | undefined {
        return (this.logicTypes[ITEM_KIND.TRAUMA] as TraumaLogic[]).find(
            (t) => t.data.subType === TRAUMA_SUBTYPE.PALL,
        );
    }

    /**
     * Resolve a **Resist the Pall** test (#561) — a **Spirit** test with a Pall
     * Depth penalty of `5 × total PAL` — at the start of the being's turn while in
     * an affected area.
     *
     * A self-sufficient action on the affected being: it rolls Spirit headlessly
     * (a `spirit` skill, falling back to the Aura attribute), applies the Pall
     * Depth penalty from `scope.totalPal`, and maps the result to a
     * {@link sohl.document.actor.logic.PALL_STATE}. A failure (Disturbed/Terrified/
     * Catatonic) accrues Pall Stress Levels on the being's Pall Cloud trauma; a
     * success (Resist/Immune) grants temporary immunity.
     *
     * @param context - The action context; `scope.totalPal` is the total Pall
     *   Strength affecting the being.
     * @returns The Spirit-test result, or `null` if the roll could not be run.
     */
    async pallResist(
        context: SohlActionContext,
    ): Promise<SuccessTestResult | null> {
        const scope = (context.scope ?? {}) as { totalPal?: number };
        const totalPal = Number(scope.totalPal ?? 0);
        // Spirit is not a base attribute: prefer a `spirit` skill, fall back to
        // the Aura attribute (the soul-facing attribute).
        const spiritMl =
            (
                this.getItemLogic("spirit", ITEM_KIND.SKILL) as
                    | SkillLogic
                    | undefined
            )?.masteryLevel?.effective ??
            (
                this.getItemLogic(ATTRIBUTE_CODE.AURA, ITEM_KIND.ATTRIBUTE) as
                    | AttributeLogic
                    | undefined
            )?.masteryLevel?.effective ??
            0;
        const result = await rollTimedTest(this, spiritMl, {
            type: "pall-resist",
            title: sohl.i18n.localize("SOHL.Being.Action.pallResist"),
            situationalModifier: -pallDepthPenalty(totalPal),
        });
        if (!result) return null;
        await this.applyPallResist(
            pallResistState(result.normSuccessLevel, result.lastDigit),
            result.isSuccess,
        );
        return result;
    }

    /**
     * Record the outcome of a {@link pallResist}: accrue Pall Stress Levels on the
     * Pall Cloud trauma for a failure, and post an informational state card.
     *
     * @param state - The {@link sohl.document.actor.logic.PALL_STATE} produced.
     * @param isSuccess - Whether the Spirit test succeeded.
     * @returns A promise that resolves once the outcome is persisted.
     */
    private async applyPallResist(
        state: number,
        isSuccess: boolean,
    ): Promise<void> {
        const notes: string[] = [];
        const psl = pallStressGain(state);
        if (isPallFailure(state) && psl > 0) {
            const existing = this.pallTrauma();
            if (existing) {
                await existing.item.update({
                    "system.levelBase": existing.data.levelBase + psl,
                } as PlainObject);
            } else {
                await fvttCreateEmbeddedItems(this, [
                    {
                        type: ITEM_KIND.TRAUMA,
                        name: sohl.i18n.localize("SOHL.Trauma.Pall"),
                        system: {
                            subType: TRAUMA_SUBTYPE.PALL,
                            levelBase: psl,
                        },
                    },
                ]);
            }
            if (state >= PALL_STATE.CATATONIC) {
                notes.push(
                    sohl.i18n.localize("SOHL.Trauma.Pall.Note.Catatonic"),
                );
            } else if (state === PALL_STATE.TERRIFIED) {
                notes.push(
                    sohl.i18n.localize("SOHL.Trauma.Pall.Note.Terrified"),
                );
            } else {
                notes.push(
                    sohl.i18n.localize("SOHL.Trauma.Pall.Note.Disturbed"),
                );
            }
        } else {
            notes.push(sohl.i18n.localize("SOHL.Trauma.Pall.Note.Resist"));
        }
        await this.postTraumaStateCard(
            sohl.i18n.localize("SOHL.Being.Action.pallResist"),
            "",
            isSuccess,
            0,
            notes,
        );
    }

    /**
     * The being's current **fear state** (#558) — the most severe (most-failed)
     * {@link sohl.utils.FEAR_LEVEL} across its active fear-source traumas, or
     * `NONE` when it carries none. "When several fear sources are present, only
     * the most severe state affects the victim" (Fear rules).
     */
    get fearState(): number {
        return mostSevereFear(
            this.activeFearTraumas().map((t) => t.data.levelBase),
        );
    }

    /**
     * The being's active fearful `fear`-subtype traumas — the recorded fear
     * sources at Afraid or worse (Brave markers and cleared sources excluded).
     *
     * @returns The active fearful fear traumas.
     */
    private activeFearTraumas(): TraumaLogic[] {
        return (this.logicTypes[ITEM_KIND.TRAUMA] as TraumaLogic[]).filter(
            (t) =>
                t.data.subType === TRAUMA_SUBTYPE.FEAR &&
                isFearfulState(t.data.levelBase),
        );
    }

    /**
     * The being's `subType`-subtype trauma for a given source, matched by name,
     * or `undefined` when none is recorded. Shared by the Fear/Morale state-ladder
     * tests to find the source's recorded trauma.
     *
     * @param subType - The trauma subtype (`fear` / `morale`).
     * @param sourceName - The source's display name.
     * @returns The matching trauma, or `undefined`.
     */
    private findTraumaBySource(
        subType: string,
        sourceName: string,
    ): TraumaLogic | undefined {
        return (this.logicTypes[ITEM_KIND.TRAUMA] as TraumaLogic[]).find(
            (t) => t.data.subType === subType && t.item?.name === sourceName,
        );
    }

    /**
     * Whether the being currently carries the **+20 Brave** Fear/Morale bonus — a
     * `BRAVE`-level fear **or** morale marker contracted within the last five
     * minutes ({@link FEAR_BRAVE_DURATION}). A Brave result on either a Fear or a
     * Morale test grants the same bonus to **both** tests.
     *
     * @returns `true` while the Brave bonus is in effect.
     */
    private hasBraveBonus(): boolean {
        const now = fvttWorldTime();
        return (this.logicTypes[ITEM_KIND.TRAUMA] as TraumaLogic[]).some(
            (t) =>
                (t.data.subType === TRAUMA_SUBTYPE.FEAR ||
                    t.data.subType === TRAUMA_SUBTYPE.MORALE) &&
                t.data.levelBase === FEAR_LEVEL.BRAVE &&
                t.data.contractDate != null &&
                now - t.data.contractDate < FEAR_BRAVE_DURATION,
        );
    }

    /**
     * Upsert or clear a Fear/Morale **state-ladder** trauma for `sourceName` to
     * `level`, returning the **incremental** Psyche Stress to inflict (the PSY for
     * the newly-reached severity, never re-charged at the same state). A shaken
     * `level` records or worsens the source trauma; a success clears it, recording
     * a Brave marker for a `braveLevel` result. Foundry-touching create/update/
     * delete only — the caller inflicts the returned PSY and posts the card.
     *
     * @param subType - The trauma subtype (`fear` / `morale`).
     * @param level - The state level just produced.
     * @param sourceName - The source's display name.
     * @param isShaken - Predicate: whether a level is a recorded (harmful) state.
     * @param psyGainFor - The PSY a level grants.
     * @param braveLevel - The subtype's Brave level (records a marker on success).
     * @returns The incremental Psyche Stress to inflict (0 for none).
     */
    private async recordLadderTrauma(
        subType: string,
        level: number,
        sourceName: string,
        isShaken: (l: number) => boolean,
        psyGainFor: (l: number) => number,
        braveLevel: number,
    ): Promise<number> {
        const existing = this.findTraumaBySource(subType, sourceName);
        const currentLevel =
            isShaken(existing?.data.levelBase ?? 0) ?
                (existing?.data.levelBase ?? 0)
            :   0;
        if (isShaken(level)) {
            if (existing) {
                await existing.item.update({
                    "system.levelBase": level,
                } as PlainObject);
            } else {
                await fvttCreateEmbeddedItems(this, [
                    {
                        type: ITEM_KIND.TRAUMA,
                        name: sourceName,
                        system: {
                            subType,
                            levelBase: level,
                            aspect: IMPACT_ASPECT.BLUNT,
                        },
                    },
                ]);
            }
            return Math.max(0, psyGainFor(level) - psyGainFor(currentLevel));
        }
        // A success clears the source; a Brave result records a short-lived marker.
        if (existing) await existing.item.delete();
        if (level === braveLevel) {
            await fvttCreateEmbeddedItems(this, [
                {
                    type: ITEM_KIND.TRAUMA,
                    name: sourceName,
                    system: { subType, levelBase: braveLevel },
                },
            ]);
        }
        return 0;
    }

    /**
     * Resolve a **Fear Test** (#558) — a test against **Will** — against a
     * frightening source, and record the resulting {@link fearState}.
     *
     * A self-sufficient action on the affected being: it rolls the being's Will
     * headlessly (adding the Brave bonus if active), maps
     * the result to a {@link sohl.utils.FEAR_LEVEL}
     * ({@link sohl.document.actor.logic.fearStateFromTest} — the CF0/CF5 split
     * decides Catatonic vs Terrified), and applies it: a fearful result records
     * (or worsens) a `fear`-subtype trauma for the source and inflicts any Psyche
     * Stress; a success clears the source (Steady) or grants the Brave bonus.
     *
     * @param context - The action context; `scope.sourceName` names the fear
     *   source (defaults to a generic label).
     * @returns The Fear-test result, or `null` if the roll could not be run.
     */
    async fearTest(
        context: SohlActionContext,
    ): Promise<SuccessTestResult | null> {
        const scope = (context.scope ?? {}) as { sourceName?: string };
        const sourceName =
            typeof scope.sourceName === "string" && scope.sourceName ?
                scope.sourceName
            :   sohl.i18n.localize("SOHL.Trauma.Fear.DefaultSource");
        const willMl =
            (
                this.getItemLogic(ATTRIBUTE_CODE.WILL, ITEM_KIND.ATTRIBUTE) as
                    | AttributeLogic
                    | undefined
            )?.masteryLevel?.effective ?? 0;
        const braveBonus = this.hasBraveBonus() ? FEAR_BRAVE_BONUS : 0;
        const result = await rollTimedTest(this, willMl, {
            type: "fear-test",
            title: sohl.i18n.localize("SOHL.Being.Action.fearTest"),
            situationalModifier: braveBonus,
        });
        if (!result) return null;
        await this.applyFearResult(
            fearStateFromTest(result.normSuccessLevel, result.lastDigit),
            sourceName,
            result.isSuccess,
        );
        return result;
    }

    /**
     * Record the outcome of a {@link fearTest}: create/worsen the source's fear
     * trauma and inflict incremental Psyche Stress on a fearful result, clear the
     * source on a success (Steady) or record a Brave marker, then sync the
     * `fear` status and post an informational state card.
     *
     * @param level - The {@link sohl.utils.FEAR_LEVEL} the test produced.
     * @param sourceName - The fear source's display name.
     * @param isSuccess - Whether the Fear Test succeeded.
     * @returns A promise that resolves once the outcome is persisted.
     */
    private async applyFearResult(
        level: number,
        sourceName: string,
        isSuccess: boolean,
    ): Promise<void> {
        const psyGain = await this.recordLadderTrauma(
            TRAUMA_SUBTYPE.FEAR,
            level,
            sourceName,
            isFearfulState,
            fearPsyGain,
            FEAR_LEVEL.BRAVE,
        );
        if (psyGain > 0) await inflictPsycheStress(this, psyGain, sourceName);

        const notes: string[] = [];
        if (isFearfulState(level)) {
            if (fearHelpless(level)) {
                notes.push(
                    sohl.i18n.localize("SOHL.Trauma.Fear.Note.Helpless"),
                );
            } else if (fearDefenseRestricted(level)) {
                notes.push(
                    sohl.i18n.localize(
                        "SOHL.Trauma.Fear.Note.DefenseRestricted",
                    ),
                );
            }
            if (fearMustFlee(level)) {
                notes.push(
                    sohl.i18n.localize("SOHL.Trauma.Fear.Note.MustFlee"),
                );
            }
        } else if (level === FEAR_LEVEL.BRAVE) {
            notes.push(sohl.i18n.localize("SOHL.Trauma.Fear.Note.Brave"));
        } else {
            notes.push(sohl.i18n.localize("SOHL.Trauma.Fear.Note.Immune"));
        }

        await this.syncFearStatus(sourceName, level);
        await this.postTraumaStateCard(
            sohl.i18n.localize("SOHL.Being.Action.fearTest"),
            fearLevelLabelKey(level),
            isSuccess,
            psyGain,
            notes,
        );
    }

    /**
     * Toggle the being's `fear` status effect to match its fear state after the
     * just-applied result for `sourceName` reached `level`. Computed from `level`
     * plus every **other** active fear source, so it is correct even before a
     * freshly-created/updated fear trauma is reflected in {@link fearState}.
     *
     * @param sourceName - The fear source just resolved (excluded from the scan).
     * @param level - The {@link sohl.utils.FEAR_LEVEL} just applied for it.
     * @returns A promise that resolves once the status is in sync.
     */
    private async syncFearStatus(
        sourceName: string,
        level: number,
    ): Promise<void> {
        const others = this.activeFearTraumas()
            .filter((t) => t.item?.name !== sourceName)
            .map((t) => t.data.levelBase);
        const shouldBeFearful =
            mostSevereFear([...others, level]) >= FEAR_LEVEL.AFRAID;
        const has = fvttActorStatuses(this.actor).has(STATUS_EFFECT.FEARFUL);
        if (shouldBeFearful !== has) {
            await fvttToggleActorStatus(
                this.actor,
                STATUS_EFFECT.FEARFUL,
                shouldBeFearful,
            );
        }
    }

    /**
     * Post an informational trauma-state card summarizing a trauma test's outcome
     * (the resulting state, any Psyche Stress gain, and effect notes). Shared by
     * the Fear / Morale / Pall tests.
     *
     * @param title - The test title.
     * @param labelKey - Localization key for the resulting state's name.
     * @param isSuccess - Whether the test succeeded (colors the state).
     * @param psyGain - Psyche Stress Levels gained (0 for none).
     * @param notes - Localized effect notes to list.
     * @returns A promise that resolves once the card is posted.
     */
    private async postTraumaStateCard(
        title: string,
        labelKey: string,
        isSuccess: boolean,
        psyGain: number,
        notes: string[],
    ): Promise<void> {
        await postActionCard(this.speaker, {
            template: "systems/sohl/templates/chat/trauma-state-card.hbs",
            data: {
                actorId: this.actor?.id ?? "",
                actorName: this.actor?.name ?? "",
                title,
                stateLabel: labelKey ? sohl.i18n.localize(labelKey) : "",
                isSuccess,
                psyGain,
                notes,
            },
        });
    }

    /**
     * Prompt for a disease — chosen from those found in the world and the Item
     * compendium packs, or described as a custom one — and roll the contagion
     * test that determines whether this being contracts it. Only diseases
     * (afflictions whose subtype is `disease`) can be contracted.
     *
     * The contagion roll is a d100 test against `CI × Endurance` (see
     * {@link contagionTarget}); *failing* it contracts the disease, which is
     * then created on the being: the chosen source affliction is copied
     * verbatim, or a fresh `affliction` item is built from the custom name/CI.
     *
     * @param context - The action context for the test.
     * @returns The success test result, or `null` if the being has no Endurance
     *   attribute or the dialog was dismissed.
     */
    async contractDisease(
        context: SohlActionContext<EmptyObject>,
    ): Promise<SuccessTestResult | null> {
        const endurance = this.getItemLogic(
            ATTRIBUTE_CODE.ENDURANCE,
            ITEM_KIND.ATTRIBUTE,
        ) as AttributeLogic | undefined;
        if (!endurance) {
            sohl.log.uiWarn(
                `${this.name} has no Endurance attribute; cannot run a Contract Disease test.`,
            );
            return null;
        }

        const choice = await promptContractDisease();
        if (!choice) return null;

        const mlMod = new entity.MasteryLevelModifier(
            {
                type: "contract-disease",
                title: `${this.name} – Contract ${choice.name}`,
            },
            { parent: this },
        );
        mlMod.setBase(
            contagionTarget(choice.contagionIndex, endurance.score.effective),
        );

        const result = await mlMod.successTest(context);
        // Failing the contagion roll means the being contracts the disease.
        if (result && !result.isSuccess) {
            const created = await fvttCreateEmbeddedItems(this, [
                buildContractedAfflictionData(choice),
            ]);
            sohl.log.uiInfo(`${this.name} contracted ${choice.name}.`);
            // Offer to track its onset (incubation → symptomatic) rather than
            // auto-arming it — the last creation-time auto-schedule (issue #579).
            // The onset *phase transition*, when performed, still auto-schedules
            // the resolution and recurring healing checks (a consequence of the
            // human-performed step, consent-gated by #587).
            const affliction = created?.[0];
            if (affliction) {
                const onsetInterval =
                    Number(affliction.system?.onsetDurationBase) || 0;
                await offerSchedule(
                    context,
                    affliction,
                    "onsetCheck",
                    onsetInterval,
                );
            }
        }
        return result || null;
    }

    /**
     * Define and return all intrinsic actions for this logic type.
     * @returns A map of action shortcodes to their definitions
     */
    static override defineIntrinsicActions(): Partial<SohlAction.Data>[] {
        return [
            ...SohlActorBaseLogic.defineIntrinsicActions(),
            {
                shortcode: "performTreatmentTest",
                subType: ACTION_SUBTYPE.INTRINSIC,
                title: "SOHL.Being.Action.performTreatmentTest",
                scope: SOHL_ACTION_SCOPE.SELF,
                iconFAClass: "fa-solid fa-staff-snake",
                executor: "performTreatmentTest",
                visible: "true",
                group: SOHL_CONTEXT_MENU_SORT_GROUP.GENERAL,
            },
            {
                shortcode: "performBloodStoppage",
                subType: ACTION_SUBTYPE.INTRINSIC,
                title: "SOHL.Being.Action.performBloodStoppage",
                scope: SOHL_ACTION_SCOPE.SELF,
                iconFAClass: "fa-solid fa-droplet-slash",
                executor: "performBloodStoppage",
                visible: "true",
                group: SOHL_CONTEXT_MENU_SORT_GROUP.GENERAL,
            },
            {
                shortcode: "shockTest",
                subType: ACTION_SUBTYPE.INTRINSIC,
                title: "SOHL.Being.Action.shockTest",
                scope: SOHL_ACTION_SCOPE.SELF,
                iconFAClass: "far fa-face-eyes-xmarks",
                executor: "shockTest",
                visible: "true",
                group: SOHL_CONTEXT_MENU_SORT_GROUP.GENERAL,
            },
            {
                shortcode: "shockReTest",
                subType: ACTION_SUBTYPE.INTRINSIC,
                title: "SOHL.Being.Action.shockReTest",
                scope: SOHL_ACTION_SCOPE.SELF,
                iconFAClass: "far fa-face-dizzy",
                executor: "shockReTest",
                visible:
                    "actorLogic.shockState === 2 || actorLogic.shockState === 3",
                group: SOHL_CONTEXT_MENU_SORT_GROUP.GENERAL,
            },
            {
                shortcode: "stumbleTest",
                subType: ACTION_SUBTYPE.INTRINSIC,
                title: "SOHL.Being.Action.stumbleTest",
                scope: SOHL_ACTION_SCOPE.SELF,
                iconFAClass: "fa-solid fa-person-falling",
                executor: "stumbleTest",
                visible: "true",
                group: SOHL_CONTEXT_MENU_SORT_GROUP.GENERAL,
            },
            {
                shortcode: "fumbleTest",
                subType: ACTION_SUBTYPE.INTRINSIC,
                title: "SOHL.Being.Action.fumbleTest",
                scope: SOHL_ACTION_SCOPE.SELF,
                iconFAClass: "fa-solid fa-arrow-down",
                executor: "fumbleTest",
                visible: "true",
                group: SOHL_CONTEXT_MENU_SORT_GROUP.GENERAL,
            },
            {
                shortcode: "moraleTest",
                subType: ACTION_SUBTYPE.INTRINSIC,
                title: "SOHL.Being.Action.moraleTest",
                scope: SOHL_ACTION_SCOPE.SELF,
                iconFAClass: "fa-solid fa-shield-heart",
                executor: "moraleTest",
                visible: "true",
                group: SOHL_CONTEXT_MENU_SORT_GROUP.GENERAL,
            },
            {
                shortcode: "reactionTest",
                subType: ACTION_SUBTYPE.INTRINSIC,
                title: "SOHL.Being.Action.reactionTest",
                scope: SOHL_ACTION_SCOPE.SELF,
                iconFAClass: "fa-solid fa-person-walking-arrow-loop-left",
                executor: "reactionTest",
                visible: "true",
                group: SOHL_CONTEXT_MENU_SORT_GROUP.GENERAL,
            },
            {
                shortcode: "rallyTest",
                subType: ACTION_SUBTYPE.INTRINSIC,
                title: "SOHL.Being.Action.rallyTest",
                scope: SOHL_ACTION_SCOPE.SELF,
                iconFAClass: "fa-solid fa-flag",
                executor: "rallyTest",
                visible: "true",
                group: SOHL_CONTEXT_MENU_SORT_GROUP.GENERAL,
            },
            {
                shortcode: "acceptRally",
                subType: ACTION_SUBTYPE.INTRINSIC,
                title: "SOHL.Being.Action.acceptRally",
                scope: SOHL_ACTION_SCOPE.SELF,
                iconFAClass: "fa-solid fa-flag",
                executor: "acceptRally",
                visible: "false",
                group: SOHL_CONTEXT_MENU_SORT_GROUP.GENERAL,
            },
            {
                shortcode: "fearTest",
                subType: ACTION_SUBTYPE.INTRINSIC,
                title: "SOHL.Being.Action.fearTest",
                scope: SOHL_ACTION_SCOPE.SELF,
                iconFAClass: "far fa-face-scream",
                executor: "fearTest",
                visible: "true",
                group: SOHL_CONTEXT_MENU_SORT_GROUP.GENERAL,
            },
            {
                shortcode: "pallResist",
                subType: ACTION_SUBTYPE.INTRINSIC,
                title: "SOHL.Being.Action.pallResist",
                scope: SOHL_ACTION_SCOPE.SELF,
                iconFAClass: "fa-solid fa-skull",
                executor: "pallResist",
                visible: "true",
                group: SOHL_CONTEXT_MENU_SORT_GROUP.GENERAL,
            },
            {
                shortcode: "calcImpact",
                subType: ACTION_SUBTYPE.INTRINSIC,
                title: "SOHL.Being.Action.calcImpact",
                scope: SOHL_ACTION_SCOPE.SELF,
                iconFAClass: "fa-solid fa-bullseye-arrow",
                executor: "calcImpact",
                visible: "true",
                group: SOHL_CONTEXT_MENU_SORT_GROUP.GENERAL,
            },
            {
                shortcode: "contractDisease",
                subType: ACTION_SUBTYPE.INTRINSIC,
                title: "SOHL.Being.Action.contractDisease",
                scope: SOHL_ACTION_SCOPE.SELF,
                iconFAClass: "fa-solid fa-face-vomit",
                executor: "contractDisease",
                visible: "true",
                group: SOHL_CONTEXT_MENU_SORT_GROUP.GENERAL,
            },
        ];
    }

    /* --------------------------------------------- */
    /* Common Lifecycle Actions                      */
    /* --------------------------------------------- */

    /** @inheritdoc */
    override initialize(): void {
        // Selects the active movement profile + seeds feetPerRound/leaguesPerWatch.
        super.initialize();
        // Reset the ground-up accumulator before any gear item's evaluate()
        // adds to it (all item initialize()/evaluate() run after this).
        this.carriedWeight = new entity.ValueModifier(this);
        this.strengthModifier = new entity.ValueModifier(this);
        this.encumbrance = new entity.ValueModifier(this);
        // An empty modifier now; its base is seeded from END/WIL in evaluate()
        // (attribute scores aren't prepared yet during the actor's initialize),
        // leaving it open to trait/treatment deltas in between.
        this.healingBase = new entity.ValueModifier(this);
        // An empty modifier now; its base is summed from the fatigue traumas in
        // finalize() (once the trauma items have prepared their levels).
        this.fatiguePenalty = new entity.ValueModifier(this);
        // Build the being's body directly from system.body — no embedded item,
        // no cross-document registration, no lifecycle-ordering hazard.
        this.body = new BodyLogic(this);
        this.body.initialize();
    }

    /** @inheritdoc */
    override evaluate(): void {
        super.evaluate();
        this.body.evaluate();
        // Movement strength modifier: the active profile's `strMod` expression
        // of the being's strength (0 when disabled / no strength attribute).
        const strModExpr = new SafeExpression(
            { source: this.moveProfile.strMod },
            { parent: this },
        );
        const str =
            this.getItemLogic("str", ITEM_KIND.ATTRIBUTE)?.score.effective ?? 0;
        this.strengthModifier.setBase(strModExpr.evaluate({ str }) as number);
        this.deriveHealingBase();
        this.aggregateArmorProtection();
    }

    /**
     * Seed {@link healingBase} from the being's Endurance and Will scores (see
     * {@link healingBaseFor}). Runs in {@link evaluate}, after the attribute
     * items have prepared their scores. When either attribute is absent (e.g. an
     * incorporeal being), the base is left unset — the modifier stays empty.
     */
    private deriveHealingBase(): void {
        const endurance = this.getItemLogic(
            ATTRIBUTE_CODE.ENDURANCE,
            ITEM_KIND.ATTRIBUTE,
        )?.score.effective;
        const will = this.getItemLogic(ATTRIBUTE_CODE.WILL, ITEM_KIND.ATTRIBUTE)
            ?.score.effective;
        if (endurance === undefined || will === undefined) return;
        this.healingBase.setBase(healingBaseFor(endurance, will));
    }

    /**
     * Fold every worn ArmorGear's protection onto the being's body locations
     * it covers, so each location knows its summed armor, whether it is rigid,
     * and the list of covering materials. Runs after `super.evaluate()` so the
     * armor items' protection modifiers are already prepared. No-op when the
     * being is incorporeal (empty body structure).
     */
    private aggregateArmorProtection(): void {
        const lt = this.logicTypes;
        if (this.body.isIncorporeal) return;
        const structure = this.body.structure;

        const layers: ArmorLayer[] = [];
        for (const logic of lt[ITEM_KIND.ARMORGEAR].filter(
            (a) => (a.data as any).isEquipped,
        )) {
            layers.push({
                material: (logic.data as any).material ?? "",
                protection: {
                    blunt: logic.protection.blunt.effective,
                    edged: logic.protection.edged.effective,
                    piercing: logic.protection.piercing.effective,
                    fire: logic.protection.fire.effective,
                },
                flexibleLocations:
                    (logic.data as any).locations?.flexible ?? [],
                rigidLocations: (logic.data as any).locations?.rigid ?? [],
            });
        }

        aggregateArmor(structure, layers);
    }

    /** @inheritdoc */
    override finalize(): void {
        super.finalize();

        // Re-arm any persisted schedules the being owns — notably the Shock
        // Re-Test reminder (#569). Runs on every client every prep, so it is the
        // load-side re-arm; `offerShockReTest` keeps the persisted store in step
        // with the shock state, and this only re-arms what is already there.
        if (this.actor?.uuid) {
            armScheduledActions(
                this.actor.uuid,
                this.data.scheduledActions,
                sohl.events,
                this,
            );
        }

        // Encumbrance: the active movement profile's `encumbrance` expression of
        // the being's carried weight, known now that all gear has evaluated.
        const encExpr = new SafeExpression(
            { source: this.moveProfile.encumbrance },
            { parent: this },
        );
        this.encumbrance.setBase(
            encExpr.evaluate({ wt: this.carriedWeight.effective }) as number,
        );

        // An **incorporeal** being (empty body structure, e.g. a spirit) is a
        // supported, first-class state: no body parts, so no reach, weight, or
        // carry capacity. The body reads degrade to their empty behavior; this
        // is not an error and is deliberately not warned about.

        this.deriveHealthState();
        this.deriveFatiguePenalty();
    }

    /**
     * Seed {@link fatiguePenalty} with the total Fatigue Levels across every
     * `fatigue`-subtype trauma. Runs in {@link finalize}, after the trauma items
     * have prepared their levels. Each fatigue instance (windedness / weariness /
     * weakness) is a separate trauma; their levels sum into the one penalty.
     */
    private deriveFatiguePenalty(): void {
        let total = 0;
        for (const trauma of this.logicTypes[
            ITEM_KIND.TRAUMA
        ] as TraumaLogic[]) {
            if (trauma.data.subType === TRAUMA_SUBTYPE.FATIGUE) {
                total += Math.max(0, trauma.level?.effective ?? 0);
            }
        }
        this.fatiguePenalty.setBase(total);
    }

    /**
     * A per-location view of the being's active injuries, for the body-part
     * impairment rollup (health, unusable-part detection).
     *
     * @returns One {@link LocationInjury} per injured location.
     */
    private locationInjuries(): LocationInjury[] {
        const injuries: LocationInjury[] = [];
        for (const trauma of this.logicTypes[
            ITEM_KIND.TRAUMA
        ] as TraumaLogic[]) {
            const level = trauma.level?.effective ?? 0;
            const code = trauma.data.bodyLocationCode;
            if (level > 0 && code) {
                injuries.push({
                    locationShortcode: code,
                    level,
                    healingRate: trauma.healingRate?.effective ?? 0,
                });
            }
        }
        return injuries;
    }

    /**
     * The set of body-part **roles** the being currently cannot use — the roles
     * of every body part that is {@link bodyPartImpairment | unusable} (a grievous
     * injury or a permanent-unusable flag). A test whose governing skill or
     * attribute lists any of these roles in its `impairedByRoles` automatically
     * Critically Fails (#568).
     *
     * @returns The roles of every unusable body part (empty for an incorporeal
     *   being).
     */
    unusableRoles(): Set<string> {
        const parts = this.body?.structure?.parts ?? [];
        if (parts.length === 0) return new Set();
        const injuries = this.locationInjuries();
        const roles = new Set<string>();
        for (const p of parts) {
            const imp = bodyPartImpairment(
                p.locations.map((l) => l.shortcode),
                injuries,
                p.permanentImpairment,
                p.permanentlyUnusable,
            );
            if (!imp.usable) for (const role of p.roles) roles.add(role);
        }
        return roles;
    }

    /**
     * Each body-part **role** the being can still use but is *impaired* in, mapped
     * to the worst (most negative) −5 (minor) / −10 (serious) indefinite-impairment
     * penalty among the usable parts carrying that role (#568). A test whose
     * governing skill or attribute lists any of these roles in its
     * `impairedByRoles` takes that penalty on its effective mastery level.
     *
     * Unusable parts are excluded — a grievous injury forces an automatic Critical
     * Failure (see {@link unusableRoles}) rather than a numeric penalty — so the
     * two views never both cover the same part.
     *
     * @returns Role → worst penalty (`≤ 0`); empty for an incorporeal being or one
     *   with no impaired parts.
     */
    impairedRolePenalties(): Map<string, number> {
        const parts = this.body?.structure?.parts ?? [];
        if (parts.length === 0) return new Map();
        const injuries = this.locationInjuries();
        const penalties = new Map<string, number>();
        for (const p of parts) {
            const imp = bodyPartImpairment(
                p.locations.map((l) => l.shortcode),
                injuries,
                p.permanentImpairment,
                p.permanentlyUnusable,
            );
            if (!imp.usable || imp.impairment === 0) continue;
            for (const role of p.roles) {
                const prev = penalties.get(role);
                penalties.set(
                    role,
                    prev === undefined ?
                        imp.impairment
                    :   Math.min(prev, imp.impairment),
                );
            }
        }
        return penalties;
    }

    /**
     * The derived {@link BodyPartImpairment} of each given body part — the
     * per-part view behind the held-limb gating for weapon
     * strike modes (#628), as opposed to the role-aggregated
     * {@link unusableRoles} / {@link impairedRolePenalties}. Each part is scored
     * against the being's active injuries (only its own locations match) plus its
     * permanent impairment/unusable flags, so a caller passes the being's own
     * parts — e.g. the limbs holding a weapon, from
     * {@link sohl.document.item.logic.GearLogic.heldBy}.
     *
     * @param parts - The body parts to derive impairment for.
     * @returns One impairment per input part, in order (empty when `parts` is empty).
     */
    bodyPartImpairments(parts: readonly BodyPart[]): BodyPartImpairment[] {
        if (parts.length === 0) return [];
        const injuries = this.locationInjuries();
        return parts.map((p) =>
            bodyPartImpairment(
                p.locations.map((l) => l.shortcode),
                injuries,
                p.permanentImpairment,
                p.permanentlyUnusable,
            ),
        );
    }

    /**
     * Populate the being's derived health (`system.health` and the qualitative
     * {@link healthBand}) from its Endurance, active injuries, body-part
     * impairment, and incapacitating statuses (#463). Runs in {@link finalize},
     * after all items (body, traumas) are prepared. The math lives in the pure
     * {@link deriveHealth}; this method only gathers the inputs and writes the
     * `{ value, max }` numbers back into `system.health`.
     */
    private deriveHealthState(): void {
        const injuries = this.locationInjuries();

        // Each part's impairment tier + usability + criticality (#470).
        const parts: PartHealthInput[] = this.body.structure.parts.map((p) => {
            const imp = bodyPartImpairment(
                p.locations.map((l) => l.shortcode),
                injuries,
                p.permanentImpairment,
                p.permanentlyUnusable,
            );
            return {
                tier: imp.tier,
                usable: imp.usable,
                critical: p.isCritical,
            };
        });

        const dead = fvttActorStatuses(this.actor).has(STATUS_EFFECT.DEAD);
        const { max, value } = deriveHealth({ parts, dead });

        // Write the derived bar back into the (never-persisted) data model so
        // the token resource bar can read `system.health`. `band` is derived
        // on demand from `value` via the {@link healthBand} getter.
        this.data.health.value = value;
        this.data.health.max = max;
    }

    /**
     * Resolve and post an injury from a chat-card `createInjury` action. The
     * action's `scope` payload (a plain injury request, revived from the button's
     * `data-scope`) discriminates the two modes: an automated request (aimed
     * `targetPart` + `spread`) resolves with no player input; an assisted request
     * opens the Add Injury dialog so the GM can pick the location and tune armor
     * reduction.
     *
     * Dispatched as a normal chat-card action through the shared
     * {@link sohl.document.chat.dispatchChatCardAction} chokepoint (issue #572).
     *
     * @param context - The action context; its `scope` carries the injury request.
     */
    async createInjury(context: SohlActionContext): Promise<void> {
        const body = getActorBodyStructure(this);
        if (!body) {
            sohl.log.uiWarn(
                `${this.name} is incorporeal (no body structure); cannot resolve an injury.`,
            );
            return;
        }

        const req = parseInjuryRequest(context.scope);
        if (!req) {
            sohl.log.uiWarn(
                `SoHL | createInjury action on ${this.name} carried no valid injury request.`,
            );
            return;
        }

        // Automated: aim was forwarded, so resolve and record with no dialog.
        if (isAutomatedRequest(req)) {
            const injury = resolveAutomatedInjury(req, body);
            await this.postInjury(injury, injury.level >= 1);
            if (injury.level >= 1)
                await createTraumaFromInjury(this, injury, context);
            return;
        }

        // Assisted: let the player confirm location, aspect, impact, and armor.
        await this.addInjuryViaDialog(
            {
                location: req.location ?? "",
                aspect: req.aspect,
                impact: req.impact,
                armorReduction: req.armorReduction ?? 0,
                extraBleedRisk: !!req.extraBleedRisk,
            },
            context,
        );
    }

    /* --------------------------------------------- */
    /* Perform Treatment Test (physician's action)   */
    /* --------------------------------------------- */

    /**
     * The **Perform Treatment Test** action — *this* being (the physician) rolls
     * **their own** Physician skill against a wound and posts the result. It is
     * fully self-sufficient, so it is the *same* action however it is triggered:
     *
     * - From a wound's *Treatment Requested* card, the open button pre-fills
     *   `scope.injuryUuid` with `skipDialog`; the responder is the clicking
     *   player's own `game.user.character`.
     * - From the Being's Actions tab (by hand), a dialog gathers the wound —
     *   either a pasted injury UUID (Foundry's "Copy Document UUID"), or a
     *   described severity/aspect for a GM-directed test.
     *
     * When a real wound is identified it posts a *Treatment Result* card whose
     * owner-gated **Accept** button records the proposed Healing Rate on that
     * wound (via {@link sohl.document.item.logic.TraumaLogic.treatInjury}) — the
     * physician never touches the patient's wound; the patient's own click does.
     * A GM-directed test with no target wound posts an informational result with
     * no button (someone runs Treat Injury by hand).
     *
     * **Self-gating:** with no Physician skill it aborts with a notice and returns
     * `undefined`, so an open request card stays live for a qualified physician.
     *
     * @param context - The action context; `scope.injuryUuid` names the wound when
     *   pre-filled, else the dialog gathers the target.
     * @returns The proposed `{ healingRate, physicianName }`, or `undefined` when
     *   the physician cannot perform it (no skill / unresolved / healed / cancel).
     */
    async performTreatmentTest(context: SohlActionContext): Promise<
        | {
              healingRate: number | typeof TREATMENT_HEAL;
              physicianName: string;
          }
        | undefined
    > {
        // Self-gate: only a physician may perform the test.
        const physicianSkill = this.getItemLogic(
            SKILL_CODE.PHYSICIAN,
            ITEM_KIND.SKILL,
        ) as SkillLogic | undefined;
        if (!physicianSkill) {
            sohl.log.uiWarn(
                sohl.i18n.localize("SOHL.Trauma.Treatment.NoPhysicianSkill"),
            );
            return undefined;
        }

        // Resolve the wound: pre-filled uuid (card), else gathered by hand.
        let injuryUuid = String(
            (context.scope as { injuryUuid?: unknown })?.injuryUuid ?? "",
        ).trim();
        let injury: TraumaLogic | undefined =
            injuryUuid ?
                fvttLogicFromUuidSync<TraumaLogic>(injuryUuid)
            :   undefined;
        if (injuryUuid && !injury) return undefined; // uuid did not resolve

        let aspect: ImpactAspect = IMPACT_ASPECT.BLUNT;
        let severity = 0;
        if (injury) {
            aspect = injury.data.aspect;
            severity = injury.data.levelBase;
        } else if (!context.skipDialog) {
            const form = (await dialog({
                title: `${this.name ?? ""}: ${sohl.i18n.localize("SOHL.Trauma.Action.treatmenttest.title")}`,
                template: toFilePath(
                    "systems/sohl/templates/dialog/treatment-test-dialog.hbs",
                ),
                data: { aspectChoices: ImpactAspectChoices },
                callback: (data: PlainObject) => data,
                rejectClose: false,
            })) as {
                injuryUuid?: unknown;
                severity?: unknown;
                aspect?: unknown;
            } | null;
            if (!form) return undefined;
            const pasted = String(form.injuryUuid ?? "").trim();
            if (pasted) {
                injury = fvttLogicFromUuidSync<TraumaLogic>(pasted);
                if (!injury) {
                    sohl.log.uiWarn(
                        sohl.i18n.localize("SOHL.Trauma.Treatment.NotAnInjury"),
                    );
                    return undefined;
                }
                injuryUuid = pasted;
                aspect = injury.data.aspect;
                severity = injury.data.levelBase;
            } else {
                severity = Number(form.severity) || 0;
                aspect =
                    isImpactAspect(form.aspect) ?
                        form.aspect
                    :   IMPACT_ASPECT.BLUNT;
            }
        }

        const band = injuryBand(severity);
        if (!band) {
            sohl.log.uiWarn(
                sohl.i18n.localize("SOHL.Trauma.Treatment.AlreadyHealed"),
            );
            return undefined;
        }

        // Roll THIS physician's own Physician skill at the wound's difficulty.
        const req = requiredTreatment(aspect, band);
        const physicianMl = physicianSkill.masteryLevel?.effective ?? 0;
        const result = await rollTimedTest(this, physicianMl, {
            type: "treatment-test",
            title: sohl.i18n.localize("SOHL.Trauma.Action.treatmenttest.title"),
            situationalModifier: req?.modifier ?? 0,
        });
        if (result === undefined) return undefined; // cancelled
        const sl = result ? result.normSuccessLevel : CRITICAL_FAILURE;
        const healingRate = treatmentHealingRate(sl, band);

        // Post the result. A real wound gets an owner-gated Accept button (the
        // patient records the rate); a GM-directed test posts an informational
        // result with no button.
        await postActionCard(this.speaker, {
            template: "systems/sohl/templates/chat/treatment-result-card.hbs",
            data: {
                physicianName: this.name ?? "",
                aspect,
                severity,
                treatment: req?.code ?? "",
                hr: healingRate === TREATMENT_HEAL ? -1 : healingRate,
            },
            buttons:
                injuryUuid ?
                    {
                        action: "treatInjury",
                        handlerUuid: injuryUuid,
                        scope: { healingRate },
                        label: sohl.i18n.localize(
                            "SOHL.Trauma.Action.treatInjury.accept",
                        ),
                        iconFAClass: "fa-solid fa-check",
                    }
                :   undefined,
        });

        return { healingRate, physicianName: this.name ?? "" };
    }

    /**
     * Perform a **Blood Stoppage Test** for a bleeding character (#547) — the
     * physician's step of the interactive flow, run from a *Request Blood
     * Stoppage* card's open `@self` button (or by hand). Self-gates: only a
     * Physician-skilled character answers. Rolls **this** physician's own
     * Physician skill (plus any +10 carried from a prior Marginal-Failure
     * stoppage) and posts a *Blood Stoppage Result* card whose owner-gated Accept
     * button relays the {@link sohl.entity.body.bloodStoppageOutcome | outcome}
     * back to the bleeding injury.
     *
     * @param context - The action context; `scope.injuryUuid` targets the
     *   bleeding injury and `scope.stoppageBonus` carries the +10 next-test bonus.
     * @returns The outcome kind and physician name, or `undefined` if it aborts.
     */
    async performBloodStoppage(
        context: SohlActionContext,
    ): Promise<{ kind: string; physicianName: string } | undefined> {
        const physicianSkill = this.getItemLogic(
            SKILL_CODE.PHYSICIAN,
            ITEM_KIND.SKILL,
        ) as SkillLogic | undefined;
        if (!physicianSkill) {
            sohl.log.uiWarn(
                sohl.i18n.localize("SOHL.Trauma.Treatment.NoPhysicianSkill"),
            );
            return undefined;
        }
        const scope = (context.scope ?? {}) as {
            injuryUuid?: unknown;
            stoppageBonus?: unknown;
        };
        const injuryUuid = String(scope.injuryUuid ?? "").trim();
        const injury =
            injuryUuid ?
                fvttLogicFromUuidSync<TraumaLogic>(injuryUuid)
            :   undefined;
        if (injuryUuid && !injury) return undefined; // uuid did not resolve

        const bonus = Number(scope.stoppageBonus ?? 0);
        const physicianMl = physicianSkill.masteryLevel?.effective ?? 0;
        const result = await rollTimedTest(this, physicianMl, {
            type: "blood-stoppage-test",
            title: sohl.i18n.localize("SOHL.Being.Action.performBloodStoppage"),
            situationalModifier: bonus,
        });
        if (result === undefined) return undefined; // cancelled
        const sl = result ? result.normSuccessLevel : CRITICAL_FAILURE;
        const outcome = bloodStoppageOutcome(sl);

        await postActionCard(this.speaker, {
            template:
                "systems/sohl/templates/chat/blood-stoppage-result-card.hbs",
            data: {
                physicianName: this.name ?? "",
                woundName: injury?.item?.name ?? "",
                outcomeLabel: sohl.i18n.localize(
                    `SOHL.Trauma.BloodStoppage.Outcome.${outcome.kind}`,
                ),
                stopped:
                    outcome.kind === "stopImmediately" ||
                    outcome.kind === "stopAfterNext",
            },
            buttons:
                injuryUuid ?
                    {
                        action: "acceptBloodStoppage",
                        handlerUuid: injuryUuid,
                        scope: {
                            kind: outcome.kind,
                            nextBonus: outcome.nextBonus,
                        },
                        label: sohl.i18n.localize(
                            "SOHL.Trauma.BloodStoppage.accept",
                        ),
                        iconFAClass: "fa-solid fa-check",
                    }
                :   undefined,
        });

        return { kind: outcome.kind, physicianName: this.name ?? "" };
    }

    /**
     * Open the Add Injury dialog, resolve the player's input into an injury,
     * post the injury card, and (when requested) record the Trauma. Shared by
     * the assisted-combat `createInjury` flow and the character sheet's manual
     * Add Injury action. Pre-fills the dialog from `prefill`; an empty prefill
     * yields a blank manual-entry dialog.
     * @param prefill - Initial values to pre-fill the dialog with.
     * @param prefill.location - The hit-location shortcode.
     * @param prefill.aspect - The weapon impact aspect.
     * @param prefill.impact - The raw impact total.
     * @param prefill.armorReduction - Manual armor reduction.
     * @param prefill.extraBleedRisk - Force the wound to bleed.
     * @param context - Forwarded to the schedule offer (issue #579) so a
     *   scripted caller can pre-answer or suppress it; the interactive path prompts.
     */
    async addInjuryViaDialog(
        prefill: {
            location?: string;
            aspect?: string;
            impact?: number;
            armorReduction?: number;
            extraBleedRisk?: boolean;
        } = {},
        context: OfferContext = {},
    ): Promise<void> {
        const body = getActorBodyStructure(this);
        if (!body) {
            sohl.log.uiWarn(
                `${this.name} is incorporeal (no body structure); cannot add an injury.`,
            );
            return;
        }

        const dialogData = {
            hitLocations: body
                .getAllLocations()
                .map((l) => ({ code: l.shortcode, name: l.name })),
            aspectChoices: Object.values(IMPACT_ASPECT),
            location: prefill.location ?? "",
            aspect: prefill.aspect ?? "",
            impactVal: prefill.impact ?? 0,
            armorReduction: prefill.armorReduction ?? 0,
            extraBleedRisk: !!prefill.extraBleedRisk,
            addToCharSheet: true,
            askRecordInjury: true,
        };

        const form = (await dialog({
            title: `${this.name}: Add Injury`,
            template: toFilePath(
                "systems/sohl/templates/dialog/injury-dialog.hbs",
            ),
            data: dialogData,
            callback: (data: PlainObject) => readInjuryDialogForm(data),
            rejectClose: false,
        })) as InjuryDialogForm | null;
        if (!form) return;
        const location = body
            .getAllLocations()
            .find((l) => l.shortcode === form.locationCode);
        const injury = resolveInjury({
            impact: form.impact,
            aspect: form.aspect,
            body,
            location,
            armorReduction: form.armorReduction,
            extraBleedRisk: form.extraBleedRisk,
        });
        await this.postInjury(injury, form.addToCharSheet);
        if (form.addToCharSheet && injury.level >= 1)
            await createTraumaFromInjury(this, injury, context);
    }

    /**
     * Post an `injury-card` to chat for a resolved injury on this actor.
     * @param injury - The resolved injury to render.
     * @param addToCharSheet - Whether the injury was recorded on the sheet.
     */
    private async postInjury(
        injury: ResolvedInjury,
        addToCharSheet: boolean,
    ): Promise<void> {
        const data = buildInjuryCardData(injury, {
            actorId: this.id,
            handlerActorUuid: this.uuid,
            name: this.name ?? "",
            addToCharSheet,
        });
        await this.speaker.toChat(
            toFilePath("systems/sohl/templates/chat/injury-card.hbs"),
            data,
        );
    }
}

/**
 * Persisted data model for a {@link BeingLogic | Being} actor. Carries no
 * fields of its own beyond the common {@link SohlActorData} base.
 *
 * @typeParam TLogic - The logic class bound to this data.
 * @remarks The shape of `system` on a `being` actor — i.e. `actor.system` (equivalently `actor.logic.data`) when `actor.type === "being"`. The backing DataModel implements this interface.
 */
export interface BeingData<
    TLogic extends SohlActorLogic<BeingData> = SohlActorLogic<any>,
> extends SohlActorData<TLogic> {
    /**
     * The being's physical body (anatomy, weight, reach, body-scale). An
     * incorporeal being has an empty `body.structure.parts`.
     */
    body: BodyLogic.Data;
}

/** A weapon (or combat-technique skill) paired with its usable strike modes for a combat encounter. */
export interface BeingCombatMode {
    /** The available strike modes for this weapon entry. */
    strikeMode: StrikeModeBase[];
    /** The weapon gear or combat-technique skill that owns these strike modes. */
    weapon: WeaponGearLogic | SkillLogic;
}
