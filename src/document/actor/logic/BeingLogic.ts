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

import { entity } from "@src/entity/registry";
import type { ValueModifier } from "@src/entity/modifier/ValueModifier";
import type { SuccessTestResult } from "@src/entity/result/SuccessTestResult";
import { SohlActionContext } from "@src/entity/action/SohlActionContext";
import { CombatResult } from "@src/entity/result/CombatResult";
import {
    SohlActorBaseLogic,
    type SohlActorData,
    type SohlActorLogic,
} from "@src/document/actor/logic/SohlActorBaseLogic";
import type { LineageLogic } from "@src/document/item/logic/LineageLogic";
import type { WeaponGearLogic } from "@src/document/item/logic/WeaponGearLogic";
import type { CombatTechniqueLogic } from "@src/document/item/logic/CombatTechniqueLogic";
import { MeleeStrikeMode } from "@src/entity/strikemode/MeleeStrikeMode";
import type { ArmorGearLogic } from "@src/document/item/logic/ArmorGearLogic";
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
    inputDialog,
    DialogButtonCallback,
} from "@src/core/FoundryHelpers";
import type { SohlTokenDocument } from "@src/document/token/foundry/SohlTokenDocument";
import type { SohlCombatant } from "@src/document/combatant/foundry/SohlCombatant";
import { readBaseMove } from "@src/entity/movement/move-helpers";
import {
    ACTION_SUBTYPE,
    defineType,
    IMPACT_ASPECT,
    ITEM_KIND,
    MovementMedium,
    SOHL_ACTION_SCOPE,
    SOHL_CONTEXT_MENU_SORT_GROUP,
    TEST_TYPE,
} from "@src/utils/constants";
import { SohlAction } from "@src/entity/action/SohlAction";
import { SimpleRoll } from "@src/entity/roll/SimpleRoll";
import { SohlLogic } from "@src/core/logic/SohlLogic";
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
    toFilePath,
    defaultToJSON,
    buildActionScope,
} from "@src/utils/helpers";
// `chat-card-dispatch` is a pure, Foundry-free module (no `foundry.*`/`game.*`);
// the logic layer may depend on it. The path-based boundary rule can't tell it
// apart from the Foundry-coupled files under `document/chat/`, so allow this one.
// eslint-disable-next-line @typescript-eslint/no-restricted-imports
import { dispatchChatCardAction } from "@src/document/chat/chat-card-dispatch";
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
 * @typeParam TData - The Being data interface.
 */
export class BeingLogic<
    TData extends BeingData = BeingData,
> extends SohlActorBaseLogic<TData> {
    /**
     * Overall health state, derived from injury levels across body roles
     *
     * @type {ValueModifier}
     */
    health!: ValueModifier;

    /**
     * Base healing rate, ultimately influenced by traits and treatment
     */
    healingBase!: ValueModifier;

    /**
     * Current shock state, derived from accumulated injuries and other factors.
     *
     * @type {number}
     */
    shockState!: number;

    /**
     * The being's pull score, determining whether it can draw certain bow weapons.
     *
     * @type {ValueModifier}
     */
    pull!: ValueModifier;

    /**
     * The effective base move (feet per combat round) for this being in
     * the given medium, exposed as a `ValueModifier` so additional runtime
     * modifiers (injury impairment, encumbrance overlays from items, etc.)
     * can layer on through the standard channel.
     *
     * The base is sourced from the actor's `Lineage` item — specifically
     * `lineage.system.moveBase[medium]`. Foundry has already applied any
     * Active Effects targeting that persisted path by the time this is
     * called, so a haste AE multiplying `system.moveBase.terrestrial` × 2
     * is reflected in the base value transparently.
     *
     * Returns a ValueModifier with base 0 if the actor has no lineage or
     * the lineage has no value for this medium.
     *
     * @param medium - The movement medium (e.g. terrestrial, aquatic) to read.
     * @returns A `ValueModifier` seeded with the lineage's base move for the medium.
     */
    effectiveBaseMove(medium: MovementMedium): ValueModifier {
        const lineageLogic = this.logicTypes[ITEM_KIND.LINEAGE][0];
        const base = readBaseMove(lineageLogic?.moveBase, medium);
        return new entity.ValueModifier({}, { parent: this }).setBase(base);
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
        const bodyStructure = lt[ITEM_KIND.LINEAGE][0]?.bodyStructure;

        const options: MeleeReachOption[] = [];

        // Combat techniques: intrinsic, always available.
        for (const ct of lt[ITEM_KIND.COMBATTECHNIQUE]) {
            const sm = ct.strikeMode;
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
            const heldLimbs = bodyStructure?.limbsHolding(weapon.id) ?? 0;
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
     * @param options.distanceToTarget if specified, the distance from the weapon holder
     * to the target, used to consider reach and/or range.
     * @param options.volleyAllowed if `true`, volley strike modes are allowed, otherwise not.
     * @param options.directAllowed if `true`, direct strike modes are allowed, otherwise not.
     * @param options.meleeAllowed if `true`, melee strike modes are allowed, otherwise not.
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
        const bodyStructure =
            this.logicTypes[ITEM_KIND.LINEAGE][0]?.bodyStructure;

        let resultStrikeModes: StrikeModeBase[] = [];

        // Add Combat Technique strike modes
        for (const ct of this.logicTypes[ITEM_KIND.COMBATTECHNIQUE]) {
            resultStrikeModes.push(ct.strikeMode);
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
     * Roll the being's morale test, used to resist breaking, fleeing, or
     * surrendering under pressure. Tests the being's Initiative skill.
     *
     * @param context - The action context for the test.
     * @returns The success test result, or `null` if the test could not be run.
     * @remarks Not yet implemented; currently returns `null`.
     */
    async moraleTest(
        context: SohlActionContext<EmptyObject>,
    ): Promise<SuccessTestResult | null> {
        // if (!options.testResult) {
        //     const initSkill = this.actor.getItem("init", { types: ["skill"] });
        //     if (!initSkill) return null;
        //     options.testResult = new CONFIG.SOHL.class.SuccessTestResult(
        //         {
        //             speaker,
        //             testType: SuccessTestResult.TEST_TYPE.MORALE,
        //             mlMod: Utility.deepClone(initSkill.system.$masteryLevel),
        //         },
        //         { parent: initSkill.system },
        //     );
        // }
        // options.testResult =
        //     options.testResult.item.system.successTest(options);
        // return this._createTestItem(options);
        return null;
    }

    /**
     * Roll the being's fear test, used to resist a frightening stimulus. Tests
     * the being's Initiative skill.
     *
     * @param context - The action context for the test.
     * @returns The success test result, or `null` if the test could not be run.
     * @remarks Not yet implemented; currently returns `null`.
     */
    async fearTest(
        context: SohlActionContext<EmptyObject>,
    ): Promise<SuccessTestResult | null> {
        // if (!options.testResult) {
        //     const initSkill = this.actor.getItem("init", { types: ["skill"] });
        //     if (!initSkill) return null;
        //     options.testResult = new CONFIG.SOHL.class.SuccessTestResult(
        //         {
        //             speaker,
        //             testType: SuccessTestResult.TEST_TYPE.FEAR,
        //             mlMod: Utility.deepClone(initSkill.system.$masteryLevel),
        //         },
        //         { parent: initSkill.system },
        //     );
        // }
        // options.testResult =
        //     options.testResult.item.system.successTest(options);
        // return this._createTestItem(options);
        return null;
    }

    /**
     * Roll the test that determines whether this being contracts an affliction
     * it has been exposed to. The candidate affliction is supplied through the
     * action context.
     *
     * @param context - The action context for the test.
     * @returns The success test result, or `null` if the test could not be run.
     * @remarks Not yet implemented; currently returns `null`.
     */
    async contractAfflictionTest(
        context: SohlActionContext<EmptyObject>,
    ): Promise<SuccessTestResult | null> {
        // let { afflictionObj } = options;
        // if (!options.testResult) {
        //     if (!afflictionObj) return null;
        //     const item = new SohlItem(afflictionObj);
        //     if (!item) return null;
        //     options.testResult = new CONFIG.SOHL.class.SuccessTestResult(
        //         {
        //             speaker,
        //             testType: SuccessTestResult.TEST_TYPE.AFFLICTIONCONTRACT,
        //             mlMod: Utility.deepClone(item.system.$masteryLevel),
        //         },
        //         { parent: item.system },
        //     );
        // }
        // options.testResult =
        //     options.testResult.item.system.successTest(options);
        // return this._createTestItem(options);
        return null;
    }

    /**
     * Define and return all intrinsic actions for this logic type.
     * @returns A map of action shortcodes to their definitions
     */
    static override defineIntrinsicActions(): Partial<SohlAction.Data>[] {
        return [
            ...SohlActorBaseLogic.defineIntrinsicActions(),
            {
                shortcode: "shockTest",
                subType: ACTION_SUBTYPE.INTRINSIC,
                title: "SOHL.Being.Action.shockTest",
                scope: SOHL_ACTION_SCOPE.SELF,
                iconFAClass: "sohl-rear-aura",
                executor: "shockTest",
                visible: "true",
                group: SOHL_CONTEXT_MENU_SORT_GROUP.GENERAL,
            },
            {
                shortcode: "stumbleTest",
                subType: ACTION_SUBTYPE.INTRINSIC,
                title: "SOHL.Being.Action.stumbleTest",
                scope: SOHL_ACTION_SCOPE.SELF,
                iconFAClass: "sohl-falling",
                executor: "stumbleTest",
                visible: "true",
                group: SOHL_CONTEXT_MENU_SORT_GROUP.GENERAL,
            },
            {
                shortcode: "fumbleTest",
                subType: ACTION_SUBTYPE.INTRINSIC,
                title: "SOHL.Being.Action.fumbleTest",
                scope: SOHL_ACTION_SCOPE.SELF,
                iconFAClass: "sohl-drop-weapon",
                executor: "fumbleTest",
                visible: "true",
                group: SOHL_CONTEXT_MENU_SORT_GROUP.GENERAL,
            },
            {
                shortcode: "moraleTest",
                subType: ACTION_SUBTYPE.INTRINSIC,
                title: "SOHL.Being.Action.moraleTest",
                scope: SOHL_ACTION_SCOPE.SELF,
                iconFAClass: "sohl-rally-the-troops",
                executor: "moraleTest",
                visible: "true",
                group: SOHL_CONTEXT_MENU_SORT_GROUP.GENERAL,
            },
            {
                shortcode: "fearTest",
                subType: ACTION_SUBTYPE.INTRINSIC,
                title: "SOHL.Being.Action.fearTest",
                scope: SOHL_ACTION_SCOPE.SELF,
                iconFAClass: "sohl-terror",
                executor: "fearTest",
                visible: "true",
                group: SOHL_CONTEXT_MENU_SORT_GROUP.GENERAL,
            },
            {
                shortcode: "calcImpact",
                subType: ACTION_SUBTYPE.INTRINSIC,
                title: "SOHL.Being.Action.calcImpact",
                scope: SOHL_ACTION_SCOPE.SELF,
                iconFAClass: "sohl-pierced-body",
                executor: "calcImpact",
                visible: "true",
                group: SOHL_CONTEXT_MENU_SORT_GROUP.GENERAL,
            },
            {
                shortcode: "contractAfflictionTest",
                subType: ACTION_SUBTYPE.INTRINSIC,
                title: "SOHL.Being.Action.contractAfflictionTest",
                scope: SOHL_ACTION_SCOPE.SELF,
                iconFAClass: "sohl-vomiting",
                executor: "contractAfflictionTest",
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
        super.initialize();
    }

    /** @inheritdoc */
    override evaluate(): void {
        super.evaluate();
        this.aggregateArmorProtection();
    }

    /**
     * Fold every worn ArmorGear's protection onto the lineage body locations
     * it covers, so each location knows its summed armor, whether it is rigid,
     * and the list of covering materials. Runs after `super.evaluate()` so the
     * armor items' protection modifiers are already prepared. No-op when the
     * being has no lineage (hence no body structure).
     */
    private aggregateArmorProtection(): void {
        const lt = this.logicTypes;
        const bodyStructure = lt[ITEM_KIND.LINEAGE][0]?.bodyStructure;
        if (!bodyStructure) return;

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

        aggregateArmor(bodyStructure, layers);
    }

    /** @inheritdoc */
    override finalize(): void {
        super.finalize();

        // A being really has to have a lineage — it supplies body structure,
        // movement, weight, and reach. Lacking one is not a hard error (we do
        // not throw), but the being cannot participate in most being actions
        // (it cannot wield weapons, move, etc.) and should be treated as
        // unusable. Surface that as a warning so it gets noticed and fixed.
        const hasLineage = this.logicTypes[ITEM_KIND.LINEAGE].length > 0;
        if (!hasLineage) {
            sohl.log.warn(
                `Being "${this.name}" has no Lineage item; it cannot participate in most being actions (movement, weapons, reach, etc.) and should be considered unusable until a Lineage is added.`,
            );
        }
    }

    /**
     * Resolve and post an injury from a chat-card `createInjury` click. The
     * button's `data-scope` payload (a plain injury request) discriminates the
     * two modes: an automated request (aimed `targetPart` + `spread`) resolves
     * with no player input; an assisted request opens the Add Injury dialog so
     * the GM can pick the location and tune armor reduction.
     * @param btn - The clicked chat-card button carrying the injury request.
     */
    private async onCreateInjury(btn: HTMLElement): Promise<void> {
        const body = getActorBodyStructure(this);
        if (!body) {
            sohl.log.uiWarn(
                `${this.name} has no Lineage body structure; cannot resolve an injury.`,
            );
            return;
        }

        const req = parseInjuryRequest(
            buildActionScope(btn.dataset, (this as any).actorLogic ?? this),
        );
        if (!req) {
            sohl.log.uiWarn(
                `SoHL | createInjury button on ${this.name} carried no valid injury request.`,
            );
            return;
        }

        // Automated: aim was forwarded, so resolve and record with no dialog.
        if (isAutomatedRequest(req)) {
            const injury = resolveAutomatedInjury(req, body);
            await this.postInjury(injury, injury.level >= 1);
            if (injury.level >= 1) await createTraumaFromInjury(this, injury);
            return;
        }

        // Assisted: let the player confirm location, aspect, impact, and armor.
        await this.addInjuryViaDialog({
            location: req.location ?? "",
            aspect: req.aspect,
            impact: req.impact,
            armorReduction: req.armorReduction ?? 0,
            extraBleedRisk: !!req.extraBleedRisk,
        });
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
     */
    async addInjuryViaDialog(
        prefill: {
            location?: string;
            aspect?: string;
            impact?: number;
            armorReduction?: number;
            extraBleedRisk?: boolean;
        } = {},
    ): Promise<void> {
        const body = getActorBodyStructure(this);
        if (!body) {
            sohl.log.uiWarn(
                `${this.name} has no Lineage body structure; cannot add an injury.`,
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

        const result = await inputDialog({
            title: `${this.name}: Add Injury`,
            template: toFilePath(
                "systems/sohl/templates/dialog/injury-dialog.hbs",
            ),
            data: dialogData,
            callback: ((
                _event: PointerEvent | SubmitEvent,
                button: HTMLButtonElement,
            ): Promise<InjuryDialogForm | null> => {
                const form = button.querySelector("form");
                if (!form) return Promise.resolve(null);
                const fd = new FormDataExtended(form);
                return Promise.resolve(readInjuryDialogForm(fd.object));
            }) as DialogButtonCallback,
            rejectClose: false,
        });
        if (!result) return;

        const form = result as InjuryDialogForm;
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
            await createTraumaFromInjury(this, injury);
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

    /**
     * Helper method to handle chat card button clicks.
     * @param btn The button element that was clicked.
     * @param logic The action logic to use
     */
    static async onChatCardButton(
        btn: HTMLElement,
        logic: BeingLogic,
    ): Promise<void> {
        const actionName = btn.dataset.action;
        if (!actionName) return;

        // `createInjury` is handled directly (it posts an injury rather than
        // running an intrinsic action).
        if (actionName === "createInjury") {
            await logic.onCreateInjury(btn);
            return;
        }

        // Otherwise dispatch generically to the actor's logic — the same shape
        // SohlItem uses — so defender chat-card actions (e.g. the automated
        // combat defenses) reach their intrinsic-action methods. The button's
        // dataset becomes the action's `scope`.
        const context = new SohlActionContext({
            speaker: logic.speaker,
            type: actionName,
            title: btn.textContent?.trim() ?? actionName,
            scope: buildActionScope(
                btn.dataset,
                (logic as any).actorLogic ?? logic,
            ),
        });

        const action =
            logic.actions.get(actionName) ??
            [...logic.actions.values()].find(
                (act) =>
                    act.data.executor === actionName ||
                    act.data.title === actionName,
            );

        if (action) {
            await action.execute(context);
            return;
        }

        const fn = (logic as any)[actionName];
        if (typeof fn === "function") {
            await fn.call(logic, context);
        } else {
            sohl.log.warn(
                `SoHL | ${this.name} (Actor) received unhandled chat-card action "${actionName}".`,
            );
        }
    }

    /**
     * Helper method to handle chat card edit actions.
     * @param btn The button element that was clicked.
     */
    async onChatCardEditAction(btn: HTMLElement): Promise<void> {
        if (!this.actor?.isOwner) return;
        await dispatchChatCardAction(this, btn);
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
> extends SohlActorData<TLogic> {}

/** A weapon (or combat technique) paired with its usable strike modes for a combat encounter. */
export interface BeingCombatMode {
    /** The available strike modes for this weapon entry. */
    strikeMode: StrikeModeBase[];
    /** The weapon gear or combat technique that owns these strike modes. */
    weapon: WeaponGearLogic | CombatTechniqueLogic;
}
