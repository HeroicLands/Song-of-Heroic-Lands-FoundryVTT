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
import type { SkillLogic } from "@src/document/item/logic/SkillLogic";
import { resolveAssocSkill } from "@src/document/item/logic/resolveAssocSkill";
import { computeBoostContribution } from "@src/document/item/logic/masteryBoost";
import {
    SohlItemBaseLogic,
    type SohlItemData,
} from "@src/document/item/logic/SohlItemBaseLogic";
import {
    ACTION_SUBTYPE,
    MYSTERY_SUBTYPE,
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
 * Each mystery tracks a **level** and optional **charges** (value and max); a
 * `null` charge value denotes infinite uses. A mystery may name an associated
 * {@link SkillLogic | Skill} (e.g. the skill a boon or boost affects).
 *
 * Subtypes ({@link MysterySubType}):
 * - **Birthsign** — a passive influence conferred by the celestial sign the being was born under; contributes to associated skills' Skill Base (matched by shortcode).
 * - **Boon** — a flat `±N` modifier to an associated skill's mastery level, from any source.
 * - **Boost** — one or more temporary Mastery Boosts to an associated skill (the Mastery Boost table).
 * - **Fate** — quantifies the ability to alter destiny or fate (the stored fate pool). The "Fate" *invocation* is a Divination {@link MysticalAbilityLogic | Mystical Ability}; a per-skill fate bonus is modelled with Active Effects, and a fate-point bonus is not yet modelled.
 * - **Grace** — quantifies the ability to call effectually on divine favour.
 * - **Other** — does not fit the other predefined categories.
 * - **Piety** — quantifies devotion to a religion.
 *
 * A **Boon** or **Boost** mystery names its target skill via
 * {@link MysteryData.assocSkillCode} and, while active (a present, non-zero
 * {@link level}), contributes a live delta onto that skill's mastery level in
 * {@link finalize}. The mystery's {@link level | level} carries the effect's
 * magnitude — `±N` for a Boon, the boost count `N` for a Boost.
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
                iconFAClass: "fa-solid fa-sparkles",
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
            this.level.setDisabled("SOHL.Mystery.NoLevel");
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
            this.charges.value.setDisabled("SOHL.Mystery.DoesNotUseCharges");
            this.charges.max.setDisabled("SOHL.Mystery.DoesNotUseCharges");
        } else {
            this.charges.max.setBase(this.data.charges.max);
            if (this.data.charges.value === null) {
                this.charges.value.setDisabled("SOHL.Mystery.InfiniteCharges");
            } else {
                this.charges.value.setBase(this.data.charges.value);
            }
        }
    }

    /** @inheritdoc */
    override evaluate(): void {
        super.evaluate();

        // Resolve the associated skill (e.g. the skill a boon/boost affects or a
        // fate success-level bump applies to) from its shortcode, when the actor is known.
        const actorLogic = this.actorLogic;
        if (!actorLogic) return;
        this.assocSkill = resolveAssocSkill(
            actorLogic,
            this.data.assocSkillCode,
        );
    }

    /** @inheritdoc */
    override finalize(): void {
        super.finalize();
        this.contributeSkillEffect();
    }

    /**
     * Push this mystery's skill-affecting effect (a `boon` or `boost`) onto its
     * associated skill's mastery-level modifier as a live delta.
     *
     * Both effects are **derived state**: the delta is recomputed every prepare
     * cycle and added to the real skill's {@link SkillLogic.masteryLevel}, which
     * is read at roll time. So the effect applies only while the mystery is
     * active (a present, non-zero {@link level}) and reverts automatically when
     * it lapses — nothing is persisted to unwind.
     *
     * - **Boon:** a flat `±N` modifier, where `N` is the mystery's
     *   {@link level | level.effective}.
     * - **Boost:** `N` temporary Mastery Boosts (see
     *   {@link computeBoostContribution}) compounded off the skill's seeded
     *   mastery level, contributed as the resulting EML delta.
     *
     * The absent-skill Boost path (conferring a skill the character lacks as a
     * transient, rollable skill) is deferred to a later phase; here a `boost`
     * with no resolvable skill simply contributes nothing.
     */
    protected contributeSkillEffect(): void {
        const skill = this.assocSkill;
        if (!skill) return;

        // Active gate: a mystery with no level (disabled) or a zero level is
        // inactive and contributes nothing.
        if (this.level.disabled) return;
        const n = this.level.effective;
        if (n === 0) return;

        if (this.data.subType === MYSTERY_SUBTYPE.BOON) {
            skill.masteryLevel.add("SOHL.Mystery.BoonMod", "Boon", n);
        } else if (this.data.subType === MYSTERY_SUBTYPE.BOOST) {
            const { delta } = computeBoostContribution({
                hasSkill: true,
                seedML: skill.masteryLevelSeed,
                count: n,
            });
            if (delta !== 0) {
                skill.masteryLevel.add("SOHL.Mystery.BoostMod", "Boost", delta);
            }
        }
    }
}

/**
 * @remarks The shape of `system` on a `mystery` item — i.e. `item.system` (equivalently `item.logic.data`) when `item.type === "mystery"`. The backing DataModel implements this interface.
 */
export interface MysteryData<
    TLogic extends MysteryLogic<MysteryData> = MysteryLogic<any>,
> extends SohlItemData<TLogic> {
    /**
     * The mystery's subtype. `birthsign` marks a birthsign (matched by
     * {@link SohlItemData.shortcode | shortcode} in skill-base formulas);
     * `boon` / `boost` name a skill-affecting mystery.
     */
    subType: MysterySubType;
    /**
     * Shortcode of the skill this mystery is associated with (the skill a boon
     * or boost affects, a fate success-level bump applies to, etc.); blank for
     * mysteries that name no skill (e.g. a birthsign).
     */
    assocSkillCode?: string | null;
    /**
     * The base level of the mystery, or null if not applicable. For a `boon` it
     * is the flat `±N` modifier magnitude; for a `boost` it is the boost count
     * `N` applied to the associated skill.
     */
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
