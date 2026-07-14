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
import type { SkillLogic } from "@src/document/item/logic/SkillLogic";
import {
    SohlItemBaseLogic,
    type SohlItemData,
} from "@src/document/item/logic/SohlItemBaseLogic";
import {
    ACTION_SUBTYPE,
    ITEM_KIND,
    MysterySubType,
    SOHL_ACTION_SCOPE,
    SOHL_CONTEXT_MENU_SORT_GROUP,
} from "@src/utils/constants";
import { SohlAction } from "@src/entity/action/SohlAction";
import type { SohlActionContext } from "@src/entity/action/SohlActionContext";

/**
 * A passive or charge-based mystical power associated with a character or
 * object.
 *
 * Mysteries represent supernatural gifts, blessings, and connections that
 * influence a character's capabilities. Unlike {@link MysticalAbilityLogic | Mystical Abilities}
 * (which are actively cast), mysteries are often passive or limited-use
 * powers that enhance skills, grant re-rolls, or provide divine favor.
 *
 * Each mystery tracks a **level** and optional **charges** (value and max),
 * where charges of −1 indicate infinite uses. Mysteries link to a
 * a domain and/or specific {@link SkillLogic | Skills}
 * that they affect.
 *
 * Mysteries are organized by category:
 * - **Skill** — Enhance a character's success with specific skills
 * - **Creature** — Tied to a specific creature type
 * - **Divine** — Granted by a divine entity or force
 *
 * Supported subtypes:
 * - Grace (Divine): Divine favor manifesting as a granted wish
 * - Piety (Divine): Deep religious devotion
 * - Fate (Skill): Ability to influence random outcomes (re-rolls)
 * - FateBonus (Skill): Temporary bonus to fate rolls
 * - FatePointBonus: Increase in available fate points
 * - Blessing (Divine): Religious fervor boosting a skill's mastery level
 * - Ancestor Spirit Power (Skill): Ancestral connection boosting a skill
 * - Totem Spirit Power (Creature): Animal spirit connection granting skill bonuses
 *
 * @typeParam TData - The Mystery data interface.
 */
export class MysteryLogic<
    TData extends MysteryData = MysteryData,
> extends SohlItemBaseLogic<TData> {
    /**
     * The mystery's level as a {@link sohl.entity.modifier.ValueModifier}, seeded from
     * {@link MysteryData.levelBase}. Disabled when the mystery has no level
     * (`levelBase === null`).
     */
    level!: ValueModifier;

    /**
     * The mystery's charge tracking. Both `value` and `max` are always
     * {@link sohl.entity.modifier.ValueModifier}s; a `null` source value leaves the corresponding
     * modifier **disabled**, which the sheet reads to pick the ×/∞ display:
     *
     * - `max` disabled (source `max === null`) → mystery does not use charges,
     *   shown as "×".
     * - `value` disabled (source `value === null`) → infinite charges
     *   remaining, shown as "∞".
     * - `max.effective === 0` → infinite charges available, shown as
     *   "`value`/∞".
     * - otherwise → "`value`/`max`".
     */
    charges!: {
        /** Current charges; disabled when charges are infinite (`value === null`). */
        value: ValueModifier;
        /** Maximum charges; disabled when the mystery does not use charges (`max === null`). */
        max: ValueModifier;
    };

    /**
     * The associated skill (a {@link SkillLogic}) resolved during
     * {@link evaluate} from {@link MysteryData.assocSkillCode}, or `undefined`
     * when the mystery names no skill (e.g. a birthsign).
     */
    assocSkill?: SkillLogic;

    /* --------------------------------------------- */
    /* Intrinsic Actions                             */
    /* --------------------------------------------- */

    /**
     * Invoke this mystery's power (spend a charge, request the boon, etc.).
     *
     * Intrinsic-action executor for the `useMystery` action.
     *
     * @param _context - The action context (speaker, scope) for the invocation.
     * @remarks Not yet implemented; warns and returns.
     */
    async useMystery(_context: SohlActionContext): Promise<void> {
        sohl.log.uiWarn(`Using "${this.name}" is not yet implemented.`);
    }

    /**
     * Define and return all intrinsic actions for mystery logic.
     * @returns The intrinsic action definitions, including those inherited from the base logic.
     */
    static override defineIntrinsicActions(): Partial<SohlAction.Data>[] {
        return [
            ...SohlItemBaseLogic.defineIntrinsicActions(),
            {
                shortcode: "useMystery",
                subType: ACTION_SUBTYPE.INTRINSIC,
                title: "SOHL.Mystery.Action.useMystery.title",
                scope: SOHL_ACTION_SCOPE.SELF,
                iconFAClass: "sohl-sparkles",
                executor: "useMystery",
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

        // Level: a null base means "no level" and leaves the modifier
        // disabled (shown as "×"); 0 is a real level and stays enabled.
        this.level = new entity.ValueModifier(this);
        if (this.data.levelBase === null) {
            this.level.setDisabled("This mystery doesn't have a level");
        } else {
            this.level.setBase(this.data.levelBase);
        }

        /*
         * Charges: `value` and `max` are always ValueModifiers; a null source
         * value leaves the modifier disabled so the sheet can pick the ×/∞
         * display (see the `charges` field docs). A null `max` means the
         * mystery does not use charges at all, so both modifiers are disabled.
         */
        this.charges = {
            value: new entity.ValueModifier(this),
            max: new entity.ValueModifier(this),
        };
        if (this.data.charges.max === null) {
            this.charges.value.setDisabled("This mystery doesn't use charges");
            this.charges.max.setDisabled("This mystery doesn't use charges");
        } else {
            this.charges.max.setBase(this.data.charges.max);
            if (this.data.charges.value === null) {
                this.charges.value.setDisabled("Infinite charges remaining");
            } else {
                this.charges.value.setBase(this.data.charges.value);
            }
        }
    }

    /** @inheritdoc */
    override evaluate(): void {
        super.evaluate();

        // Resolve the associated skill (e.g. the skill a blessing boosts or a
        // fate re-roll applies to) from its shortcode, when the actor is known.
        const actorLogic = this.actorLogic;
        if (!actorLogic) return;
        this.assocSkill =
            this.data.assocSkillCode ?
                (actorLogic.getItemLogic(
                    this.data.assocSkillCode,
                    ITEM_KIND.SKILL,
                ) as SkillLogic)
            :   undefined;
    }

    /** @inheritdoc */
    override finalize(): void {
        super.finalize();
    }
}

/**
 * @remarks The shape of `system` on a `mystery` item — i.e. `item.system` (equivalently `item.logic.data`) when `item.type === "mystery"`. The backing DataModel implements this interface.
 */
export interface MysteryData<
    TLogic extends MysteryLogic<MysteryData> = MysteryLogic<any>,
> extends SohlItemData<TLogic> {
    /**
     * The mystery's subtype. `buff` marks a birthsign (matched by
     * {@link SohlItemData.shortcode | shortcode} in skill-base formulas).
     */
    subType: MysterySubType;
    /**
     * Shortcode of the skill this mystery is associated with (the skill a
     * blessing boosts, a fate re-roll applies to, etc.); blank for mysteries
     * that name no skill (e.g. a birthsign).
     */
    assocSkillCode?: string;
    /** The base level of the mystery, or null if not applicable */
    levelBase: number | null;
    /** Usage tracking: current charges and maximum */
    charges: {
        /** Whether this mystery consumes charges when used. */
        usesCharges: boolean;
        /** Current number of charges remaining. `null` means infinite. */
        value: number | null;
        /**
         * Maximum number of charges. `0` means no maximum; `null` means the
         * mystery does not use charges.
         */
        max: number | null;
    };
}
