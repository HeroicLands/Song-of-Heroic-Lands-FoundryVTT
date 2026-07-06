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

import { ValueModifier } from "@src/entity/modifier/ValueModifier";
import type { SkillLogic } from "@src/document/item/logic/SkillLogic";
import {
    SohlItemBaseLogic,
    type SohlItemData,
} from "@src/document/item/logic/SohlItemBaseLogic";
import {
    ACTION_SUBTYPE,
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
     * The mystery's level as a {@link ValueModifier}, seeded from
     * {@link MysteryData.levelBase}. Disabled when the mystery has no level.
     */
    level!: ValueModifier;

    /** The mystery's charge tracking, present only when it uses charges. */
    charges!: {
        /**
         * Current charges as a {@link ValueModifier}, seeded from
         * {@link MysteryData.charges | charges.value}. Disabled when charges
         * are not used.
         */
        value: ValueModifier;
        /**
         * Maximum charges as a {@link ValueModifier}, seeded from
         * {@link MysteryData.charges | charges.max}. Disabled when charges are
         * not used.
         */
        max: ValueModifier;
    };

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
        // TODO(#72) - Use Mystery
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

        if (this.data.levelBase !== null) {
            this.level = new ValueModifier({}, { parent: this }).setBase(
                this.data.levelBase,
            );
        } else {
            this.level = new ValueModifier({}, { parent: this }).setDisabled(
                "This mystery doesn't have a level",
            );
        }
        if (this.data.charges.max !== null) {
            this.charges = {
                // `charges.value === null` means infinite charges remaining;
                // normalize to `undefined` (no base) for the ValueModifier,
                // which rejects `null`.
                value: new ValueModifier({}, { parent: this }).setBase(
                    this.data.charges.value ?? undefined,
                ),
                max: new ValueModifier({}, { parent: this }).setBase(
                    this.data.charges.max,
                ),
            };
        } else {
            this.charges = {
                value: new ValueModifier({}, { parent: this }).setDisabled(
                    "This mystery doesn't use charges",
                ),
                max: new ValueModifier({}, { parent: this }).setDisabled(
                    "This mystery doesn't use charges",
                ),
            };
        }
    }

    /** @inheritdoc */
    override evaluate(): void {
        super.evaluate();
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
