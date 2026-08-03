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
import { resolveAssocSkill } from "@src/document/item/logic/resolveAssocSkill";
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
import { MysteryLogic } from "./MysteryLogic";
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
 * governs its activation test, and to a mystery that
 * determines its mystical tradition. Abilities track a **level** (power),
 * **charges** (uses remaining), and track mastery level progression via
 * {@link sohl.entity.modifier.MasteryLevelModifier}.
 *
 * Supported subtypes:
 * - Shamanic Rite: Perform a shamanic rite on target(s)
 * - Spirit Action: Spirit world interaction (Roaming, Sensing, Communing, etc.)
 * - Spirit Power: Channel spirit power (Ancestor, Totem, or Energy)
 * - Benediction: Bestow a blessing
 * - Divine Devotion: Request blessing or miracle from a deity
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
     * `undefined` if the ability uses its own mastery level.
     */
    assocSkill?: SkillLogic;

    /**
     * The associated mystery (a {@link MysteryLogic}) resolved during
     * {@link evaluate} from {@link MysticalAbilityData.assocMysteryCode}, which
     * determines this ability's mystical tradition.
     */
    assocMystery?: MysteryLogic;

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
     * @param context - The action context (speaker, scope) for the test.
     * @returns The test result, `undefined` if cancelled, or `false` on error.
     */
    async successTest(
        context: SohlActionContext,
    ): Promise<SuccessTestResult | undefined | false> {
        return this.masteryLevel.successTest(context);
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

        this.assocSkill = resolveAssocSkill(
            actorLogic,
            this.data.assocSkillCode,
        );
        this.assocMystery = actorLogic.getItemLogic(
            this.data.assocMysteryCode ?? "",
            ITEM_KIND.MYSTERY,
        ) as MysteryLogic;
    }

    /** @inheritdoc */
    override finalize(): void {
        super.finalize();

        // Now, if we have an associated skill, merge that skill's mastery level into this ability's mastery level.
        if (this.assocSkill) {
            this.masteryLevel.addVM(this.assocSkill.masteryLevel, {
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
    /** Shortcode of the mystery that determines this ability's tradition */
    assocMysteryCode?: string | null;
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
