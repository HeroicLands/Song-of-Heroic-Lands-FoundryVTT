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

import { ValueModifier } from "@src/domain/modifier/ValueModifier";
import type { SkillLogic } from "@src/document/item/logic/SkillLogic";
import type { SohlItem } from "@src/document/item/foundry/SohlItem";
import {
    SohlItemBaseLogic,
    type SohlItemData,
} from "@src/document/item/logic/SohlItemBaseLogic";
import {
    ACTION_SUBTYPE,
    ITEM_KIND,
    MysticalAbilitySubType,
    SOHL_ACTION_SCOPE,
    SOHL_CONTEXT_MENU_SORT_GROUP,
} from "@src/utils/constants";
import { MysteryLogic } from "./MysteryLogic";
import { SohlAction } from "@src/domain/action/SohlAction";

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
 * {@link MasteryLevelModifier}.
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
     * The mastery level as a {@link ValueModifier}. Seeded from
     * {@link MysticalAbilityData.masteryLevelBase} when there is no associated
     * skill; otherwise left empty until {@link finalize} merges in the
     * {@link assocSkill}'s mastery level.
     */
    masteryLevel!: ValueModifier;

    /**
     * The ability's power level as a {@link ValueModifier}, seeded from
     * {@link MysticalAbilityData.levelBase}.
     */
    level!: ValueModifier;

    /** The ability's charge tracking. */
    charges!: {
        /**
         * Current charges as a {@link ValueModifier}, seeded from
         * {@link MysticalAbilityData.charges | charges.value}.
         */
        value: ValueModifier;
        /**
         * Maximum charges as a {@link ValueModifier}, seeded from
         * {@link MysticalAbilityData.charges | charges.max}.
         */
        max: ValueModifier;
    };

    /**
     * Define and return all intrinsic actions for mystical ability logic,
     * adding the "perform" action to those inherited from the base logic.
     * @returns The intrinsic action definitions.
     */
    static override defineIntrinsicActions(): Partial<SohlAction.Data>[] {
        return [
            ...SohlItemBaseLogic.defineIntrinsicActions(),
            {
                shortcode: "perform",
                subType: ACTION_SUBTYPE.INTRINSIC,
                title: "SOHL.MysticalAbility.Action.perform.title",
                scope: SOHL_ACTION_SCOPE.SELF,
                iconFAClass: "sohl-sparkles",
                executor: "perform",
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
        this.charges = {
            value: new ValueModifier({}, { parent: this }).setBase(
                this.data.charges.value,
            ),
            max: new ValueModifier({}, { parent: this }).setBase(
                this.data.charges.max,
            ),
        };

        if (this.data.levelBase > 0) {
            this.level = new ValueModifier({}, { parent: this }).setBase(
                this.data.levelBase,
            );
        } else {
            this.level = new ValueModifier({}, { parent: this }).setDisabled(
                "This mystical ability doesn't have a level",
            );
        }

        if (!this.data.assocSkillCode) {
            // If there's no associated skill, this ability uses its own mastery level.
            this.masteryLevel = new ValueModifier({}, { parent: this }).setBase(
                this.data.masteryLevelBase,
            );
        } else {
            // If there is an associated skill, the mastery level will eventually be determined by that skill.
            // But we will need to wait until much later to merge that skill's mastery leel modifier into this one,
            // in case there are modifiers to that skill's mastery level that need to be applied first.
            // On the other hand, we may need to add our own modifiers to this Mystical Ability's mastery level before then,
            // so we need to initialize the masteryLevel modifier now, even though it will be effectively empty for a while.
            this.masteryLevel = new ValueModifier({}, { parent: this });
        }
        this.level = new ValueModifier({}, { parent: this }).setBase(
            this.data.levelBase,
        );
    }

    /** @inheritdoc */
    override evaluate(): void {
        super.evaluate();

        const actorLogic = this.actorLogic;
        if (!actorLogic) return;

        this.assocSkill = actorLogic.getItemLogic(
            this.data.assocSkillCode ?? "",
            ITEM_KIND.SKILL,
        ) as SkillLogic;
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
    assocSkillCode?: string;
    /** Shortcode of the mystery that determines this ability's tradition */
    assocMysteryCode?: string;
    /** Power level of this ability */
    levelBase: number;
    /** Mastery level of this mystical ability if assocSkillCode is blank */
    masteryLevelBase: number;
    /** Whether this item is flagged for mastery improvement via SDR */
    improveFlag: boolean;
    /** Usage tracking: current charges and maximum */
    charges: {
        /** Whether this ability consumes charges when used. */
        usesCharges: boolean;
        /** Current number of charges remaining. */
        value: number;
        /** Maximum number of charges. */
        max: number;
    };
}
