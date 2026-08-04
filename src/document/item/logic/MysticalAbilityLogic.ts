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
import type { ValueModifier } from "@src/entity/modifier/ValueModifier";
import type { MasteryLevelModifier } from "@src/entity/modifier/MasteryLevelModifier";
import type { SkillLogic } from "@src/document/item/logic/SkillLogic";
import type { AffiliationLogic } from "@src/document/item/logic/AffiliationLogic";
import { resolveAssocSkill } from "@src/document/item/logic/resolveAssocSkill";
import { resolveAssocAffiliation } from "@src/document/item/logic/resolveAssocAffiliation";
import type { SohlItem } from "@src/document/item/foundry/SohlItem";
import {
    SohlItemBaseLogic,
    type SohlItemData,
} from "@src/document/item/logic/SohlItemBaseLogic";
import {
    ACTION_SUBTYPE,
    ITEM_KIND,
    MYSTICALABILITY_SUBTYPE,
    MysticalAbilitySubType,
    SOHL_ACTION_SCOPE,
    SOHL_CONTEXT_MENU_SORT_GROUP,
} from "@src/utils/constants";
import type { MysteryLogic } from "./MysteryLogic";
import { SohlAction } from "@src/entity/action/SohlAction";
import type { SohlActionContext } from "@src/entity/action/SohlActionContext";
import type { SuccessTestResult } from "@src/entity/result/SuccessTestResult";

/**
 * An actively invoked supernatural power.
 *
 * Mystical Abilities represent spells, rites, invocations, and other powers
 * that a character actively uses. Unlike {@link MysteryLogic | Mysteries}
 * (which are often passive), mystical abilities must be deliberately activated
 * and their success is typically determined by a skill test.
 *
 * Each ability is linked to an **associated skill** (via shortcode) that
 * governs its activation test. Abilities track a **level** (power),
 * **charges** (uses remaining), and track mastery level progression via
 * {@link sohl.entity.modifier.MasteryLevelModifier}.
 *
 * Supported subtypes:
 * - Shamanic Rite: Perform a shamanic rite on target(s)
 * - Spirit Action: Spirit world interaction (Roaming, Sensing, Communing, etc.)
 * - Spirit Power: Channel spirit power (Ancestor, Totem, or Energy)
 * - Benediction: Bestow a blessing
 * - Ritual Action: Perform a prescribed ritual to earn a deity's favour
 * - Divine Incantation: Cast divine spells
 * - Arcane Incantation: Cast arcane spells
 * - Arcane Talent: Intrinsic spell-like arcane powers
 * - Spirit Talent: Intrinsic spell-like spirit powers
 * - Alchemy: Create alchemical elixirs or perform alchemical actions
 * - Divination: Foretell the future
 *
 * @typeParam TData - The MysticalAbility data interface.
 */
export class MysticalAbilityLogic<
    TData extends MysticalAbilityData = MysticalAbilityData,
> extends SohlItemBaseLogic<TData> {
    /**
     * The associated skill (a {@link SkillLogic}) resolved during
     * {@link evaluate} from {@link MysticalAbilityData.assocSkillCode}, or
     * `undefined` if the ability uses its own mastery level. Only the
     * skill-governed subtypes resolve a skill; the {@link usesSpiritPower |
     * spirit-power subtypes} resolve {@link assocSpiritPower} instead.
     */
    assocSkill?: SkillLogic;

    /**
     * The associated **Spirit Power** (a SPIRITPOWER-subtype
     * {@link MysticalAbilityLogic}) resolved during {@link evaluate} for the
     * {@link usesSpiritPower | spirit-power subtypes} (`shamanicrite` /
     * `spiritaction`), from {@link MysticalAbilityData.assocSkillCode} — for
     * these subtypes the shortcode names a Spirit Power on the same actor rather
     * than a skill. `undefined` when the reference is blank or unresolved (which
     * leaves the ability {@link isDisabled | disabled}).
     */
    assocSpiritPower?: MysticalAbilityLogic;

    /**
     * The faction/**Affiliation** (an {@link AffiliationLogic}) this ability
     * draws its standing from, resolved during {@link evaluate} from
     * {@link MysticalAbilityData.assocAffiliationCode}, or `undefined` when the
     * ability names no Affiliation, the item is not on an actor, or the
     * shortcode matches none. This is separate from the activating
     * {@link assocSkill | skill}: a religion, arcane or alchemical school, or
     * ancestor/totem/spirit whose membership confers an available area, level,
     * or capability. Surfaced as the Being sheet's Affiliation column and (via
     * its shortcode) available to capability derivations.
     */
    assocAffiliation?: AffiliationLogic;

    /**
     * Whether this ability's activation test is governed by a **Spirit Power**
     * rather than a skill — true for the `shamanicrite` and `spiritaction`
     * subtypes. For these, the association shortcode names a Spirit Power (a
     * SPIRITPOWER Mystical Ability) on the actor, the sheet shows a "Spirit
     * Power" column, and the ability is disabled unless a valid one resolves.
     */
    get usesSpiritPower(): boolean {
        return (
            this.data.subType === MYSTICALABILITY_SUBTYPE.SHAMANICRITE ||
            this.data.subType === MYSTICALABILITY_SUBTYPE.SPIRITACTION
        );
    }

    /**
     * Whether a valid Spirit Power is associated — the reference resolved and is
     * itself a SPIRITPOWER-subtype ability. Only meaningful for the
     * {@link usesSpiritPower | spirit-power subtypes}; a spirit-power ability
     * with no valid Spirit Power is {@link isDisabled | disabled}.
     */
    get hasValidSpiritPower(): boolean {
        return (
            !!this.assocSpiritPower &&
            this.assocSpiritPower.data.subType ===
                MYSTICALABILITY_SUBTYPE.SPIRITPOWER
        );
    }

    /**
     * The association shown in the sheet's assoc column — the Spirit Power for
     * the {@link usesSpiritPower | spirit-power subtypes}, otherwise the
     * {@link assocSkill}. `undefined` renders an `✕` in that column.
     */
    get assocRef(): SkillLogic | MysticalAbilityLogic | undefined {
        return this.usesSpiritPower ? this.assocSpiritPower : this.assocSkill;
    }

    /**
     * Whether the ability cannot currently be invoked (its Being-sheet row is
     * greyed out and its EML roll is blocked): either it is
     * {@link isExhausted | out of charges}, or it is a
     * {@link usesSpiritPower | spirit-power subtype} without a
     * {@link hasValidSpiritPower | valid Spirit Power}.
     */
    get isDisabled(): boolean {
        return (
            this.isExhausted ||
            (this.usesSpiritPower && !this.hasValidSpiritPower)
        );
    }

    /**
     * The mastery level as a {@link sohl.entity.modifier.MasteryLevelModifier}. When the ability has
     * no associated skill (blank {@link MysticalAbilityData.assocSkillCode}) it
     * is seeded from {@link MysticalAbilityData.masteryLevelBase} — the ability's
     * *internal* mastery level. When a skill is associated, the base is left
     * empty until {@link finalize} copies the {@link assocSkill}'s mastery level
     * in via {@link sohl.entity.modifier.ValueModifier.addVM | addVM} (so the ability's own custom
     * modifiers still stack on top of the skill's).
     *
     * For `arcaneincantation` and `divineincantation` subtypes, {@link evaluate}
     * adds a **Level × 2** casting penalty as an auditable delta (higher-level
     * incantations are harder to cast); other subtypes carry no such penalty.
     */
    masteryLevel!: MasteryLevelModifier;

    /**
     * The ability's power level as a {@link sohl.entity.modifier.ValueModifier}, seeded from
     * {@link MysticalAbilityData.levelBase}. Disabled when `levelBase` is `null`
     * (shown as "×").
     */
    level!: ValueModifier;

    /**
     * The ability's charge tracking. Both `value` and `max` are always
     * {@link sohl.entity.modifier.ValueModifier}s; a `null` source value leaves the corresponding
     * modifier **disabled**, driving the ×/∞ display (see the identical rules on
     * {@link MysteryLogic.charges}).
     */
    charges!: {
        /** Current charges; disabled when charges are infinite (`value === null`). */
        value: ValueModifier;
        /** Maximum charges; disabled when the ability does not use charges (`max === null`). */
        max: ValueModifier;
    };

    /**
     * Whether the ability uses finite, capped charges and none remain (#990).
     * An exhausted ability's Being-sheet row is greyed out and its EML roll is
     * blocked until it is recharged. This is distinct from an ability that does
     * not use charges (`max` disabled), one with infinite remaining charges
     * (`value` disabled), or one with no maximum cap (`max` effective `0`, shown
     * as `∞`) — none of which is ever exhausted.
     */
    get isExhausted(): boolean {
        return (
            !this.charges.max.disabled &&
            !this.charges.value.disabled &&
            this.charges.max.effective > 0 &&
            this.charges.value.effective <= 0
        );
    }

    /* --------------------------------------------- */
    /* Intrinsic Actions                             */
    /* --------------------------------------------- */

    /**
     * Performs a success test against this ability's mastery level (EML) —
     * invoking the ability is the same roll-for-success-or-failure a skill
     * makes, so this shares the skill's exact seam.
     *
     * Intrinsic-action executor for the `successTest` action; delegates to
     * {@link sohl.entity.modifier.MasteryLevelModifier.successTest}. The system
     * rolls but does not adjudicate the ability's effect — the outcome is read
     * off the rulebook and applied by the player. Bespoke activation behavior is
     * left to author-supplied Script Actions rather than a built-in executor.
     *
     * When the ability uses finite charges, invoking it consumes one: after a
     * completed roll (a real result, not a cancel or error) the persisted charge
     * count is decremented by one (#990). A {@link isDisabled | disabled}
     * ability — one that is exhausted, or a spirit-power subtype without a valid
     * Spirit Power — cannot be invoked at all: the roll is refused with a notice.
     * Consumption is a direct consequence of the player's own roll, so it needs
     * no separate consent.
     *
     * @param context - The action context (speaker, scope) for the test.
     * @returns The test result, `undefined` if cancelled/blocked, or `false` on error.
     */
    async successTest(
        context: SohlActionContext,
    ): Promise<SuccessTestResult | undefined | false> {
        if (this.isDisabled) {
            sohl.log.uiWarn(
                this.isExhausted ?
                    "SOHL.MysticalAbility.NoChargesRemaining"
                :   "SOHL.MysticalAbility.NoSpiritPower",
                { name: this.name },
            );
            return undefined;
        }

        const result = await this.masteryLevel.successTest(context);

        // Consume a charge only when the roll actually happened (a real result,
        // not a cancel/undefined or error/false) and the ability uses finite
        // charges (max enabled, value not infinite). Decrement the persisted
        // base; Active-Effect deltas still stack on top of the stored value.
        if (
            result &&
            !this.charges.max.disabled &&
            !this.charges.value.disabled
        ) {
            const remaining = this.data.charges.value;
            if (typeof remaining === "number" && remaining > 0) {
                await this.item.update({
                    "system.charges.value": remaining - 1,
                } as PlainObject);
            }
        }

        return result;
    }

    /**
     * Define and return all intrinsic actions for mystical ability logic,
     * adding the `successTest` action to those inherited from the base logic.
     * @returns The intrinsic action definitions.
     */
    static override defineIntrinsicActions(): Partial<SohlAction.Data>[] {
        return [
            ...SohlItemBaseLogic.defineIntrinsicActions(),
            {
                shortcode: "successTest",
                subType: ACTION_SUBTYPE.INTRINSIC,
                title: "SOHL.MysticalAbility.Action.successTest",
                scope: SOHL_ACTION_SCOPE.SELF,
                iconFAClass: "fa-solid fa-bullseye-arrow",
                executor: "successTest",
                visible: "true",
                group: SOHL_CONTEXT_MENU_SORT_GROUP.ESSENTIAL,
            },
        ];
    }

    /* --------------------------------------------- */
    /* Common Lifecycle Actions                      */
    /* --------------------------------------------- */

    /** @inheritdoc */
    override initialize(): void {
        super.initialize();

        /*
         * Charges: `value` and `max` are always ValueModifiers; a null source
         * value leaves the modifier disabled so the sheet can pick the ×/∞
         * display. A null `max` means the ability does not use charges at all,
         * so both modifiers are disabled. (Same rules as MysteryLogic.)
         */
        this.charges = {
            value: new entity.ValueModifier(this),
            max: new entity.ValueModifier(this),
        };
        if (this.data.charges.max === null) {
            this.charges.value.setDisabled(
                "SOHL.MysticalAbility.DoesNotUseCharges",
            );
            this.charges.max.setDisabled(
                "SOHL.MysticalAbility.DoesNotUseCharges",
            );
        } else {
            this.charges.max.setBase(this.data.charges.max);
            if (this.data.charges.value === null) {
                this.charges.value.setDisabled(
                    "SOHL.MysticalAbility.InfiniteCharges",
                );
            } else {
                this.charges.value.setBase(this.data.charges.value);
            }
        }

        // Level: a null base means "no level" and leaves the modifier disabled
        // (shown as "×"); 0 is a real level and stays enabled.
        this.level = new entity.ValueModifier(this);
        if (this.data.levelBase === null) {
            this.level.setDisabled("SOHL.MysticalAbility.NoLevel");
        } else {
            this.level.setBase(this.data.levelBase);
        }

        // Mastery level. With no associated skill, the ability uses its own
        // internal mastery level (seeded from masteryLevelBase). With a skill,
        // the base is deferred to finalize(), which copies the skill's mastery
        // level in via addVM so the ability's own modifiers still stack on top.
        this.masteryLevel = new entity.MasteryLevelModifier(
            {},
            { parent: this },
        );
        if (!this.data.assocSkillCode) {
            this.masteryLevel.setBase(this.data.masteryLevelBase);
        }
    }

    /** @inheritdoc */
    override evaluate(): void {
        super.evaluate();

        // Incantations become harder to cast the higher their level: an Arcane
        // or Divine Incantation takes a Level x 2 penalty to its EML. The level
        // is read here, during evaluate(), so any Active Effect on it has
        // already been applied. The penalty is intrinsic to the spell, so it is
        // added regardless of actor context; for skill-associated abilities it
        // survives the finalize() skill merge, because addVM sets the base and
        // replays the skill's deltas without clearing this modifier's own.
        // Other subtypes carry no level-based penalty.
        if (
            this.data.subType === MYSTICALABILITY_SUBTYPE.ARCANEINCANTATION ||
            this.data.subType === MYSTICALABILITY_SUBTYPE.DIVINEINCANTATION
        ) {
            const levelPenalty = this.level.effective * 2;
            if (levelPenalty > 0) {
                this.masteryLevel.add(
                    "SOHL.MysticalAbility.LevelPenalty",
                    "LvlPen",
                    -levelPenalty,
                );
            }
        }

        const actorLogic = this.actorLogic;
        if (!actorLogic) return;

        if (this.usesSpiritPower) {
            // Spirit-power subtypes resolve a SPIRITPOWER ability by shortcode
            // instead of a skill; validity is checked via hasValidSpiritPower.
            this.assocSpiritPower = actorLogic.getItemLogic(
                this.data.assocSkillCode ?? "",
                ITEM_KIND.MYSTICALABILITY,
            ) as MysticalAbilityLogic | undefined;
        } else {
            this.assocSkill = resolveAssocSkill(
                actorLogic,
                this.data.assocSkillCode,
            );
        }

        // The associated Affiliation is independent of the activating skill /
        // spirit power: it records the faction (religion, arcane/alchemical
        // school, ancestor/totem/spirit) whose standing this ability draws on.
        // Resolved for every subtype that names one; undefined when blank or
        // unmatched.
        this.assocAffiliation = resolveAssocAffiliation(
            actorLogic,
            this.data.assocAffiliationCode,
        );
    }

    /** @inheritdoc */
    override finalize(): void {
        super.finalize();

        // Merge the governing mastery level into this ability's EML: a valid
        // Spirit Power for the spirit-power subtypes, otherwise the associated
        // skill. addVM keeps the ability's own modifiers stacked on top.
        let source: SkillLogic | MysticalAbilityLogic | undefined =
            this.usesSpiritPower ?
                this.hasValidSpiritPower ?
                    this.assocSpiritPower
                :   undefined
            :   this.assocSkill;

        // A Ritual Action only pulls its ritual skill's mastery level when that
        // skill actually has one — an unlearned ritual's mastery level is
        // disabled, and must not seed the ability's EML.
        if (
            source &&
            this.data.subType === MYSTICALABILITY_SUBTYPE.RITUALACTION &&
            source.masteryLevel.disabled
        ) {
            source = undefined;
        }

        if (source) {
            this.masteryLevel.addVM(source.masteryLevel, {
                includeBase: true,
            });
        }
    }
}

/**
 * @remarks The shape of `system` on a `mysticalability` item — i.e. `item.system` (equivalently `item.logic.data`) when `item.type === "mysticalability"`. The backing DataModel implements this interface.
 */
export interface MysticalAbilityData<
    TLogic extends MysticalAbilityLogic<MysticalAbilityData> =
        MysticalAbilityLogic<any>,
> extends SohlItemData<TLogic> {
    /** Ability type (Incantation, Rite, Talent, etc.) */
    subType: MysticalAbilitySubType;
    /** Shortcode of the skill used to activate this ability */
    assocSkillCode?: string | null;
    /**
     * Shortcode of the faction/Affiliation whose standing this ability draws on
     * (a religion, arcane/alchemical school, or ancestor/totem/spirit), or
     * `null` when the ability is not affiliation-associated. Resolved to
     * {@link MysticalAbilityLogic.assocAffiliation} during
     * {@link MysticalAbilityLogic.evaluate}.
     */
    assocAffiliationCode?: string | null;
    /** Power level of this ability, or `null` when it has no level. */
    levelBase: number | null;
    /** Mastery level of this mystical ability if assocSkillCode is blank */
    masteryLevelBase: number;
    /** Whether this item is flagged for mastery improvement via SDR */
    improveFlag: boolean;
    /** Usage tracking: current charges and maximum */
    charges: {
        /** Whether this ability consumes charges when used. */
        usesCharges: boolean;
        /** Current number of charges remaining. `null` means infinite. */
        value: number | null;
        /**
         * Maximum number of charges. `0` means no maximum; `null` means the
         * ability does not use charges.
         */
        max: number | null;
    };
}
