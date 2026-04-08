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

import type { SohlLogic } from "@src/core/SohlLogic";
import {
    STRIKE_MODE_TYPE,
    type ImpactAspect,
    type StrikeModeType,
} from "@src/utils/constants";
import { CombatModifier } from "@src/domain/modifier/CombatModifier";
import { ImpactModifier } from "@src/domain/modifier/ImpactModifier";

/**
 * Base class for all strike modes — a specific way a weapon or combat
 * technique can be used in combat.
 *
 * A single weapon can have multiple strike modes (e.g., a broadsword has
 * "Cut", "Thrust", and "Pommel" melee modes; a throwing axe has a melee
 * "Chop" mode and a missile "Throw" mode).
 *
 * Strike modes carry the modifiers and test methods needed for combat
 * resolution: attack rolls, impact calculation, and (for melee) defense
 * rolls.
 *
 * **Lifecycle:** Rebuilt from persisted schema data on every preparation
 * cycle. Modifiers may be mutated during the lifecycle (e.g., injury
 * penalties, weapon quality bonuses), but mutations are not persisted.
 */
export abstract class StrikeModeBase {
    /** The strike mode type discriminator: "melee" or "missile". */
    readonly type: StrikeModeType;
    /** Descriptive name of this mode (e.g., "Cut", "Thrust", "Shoot"). */
    readonly mode: string;
    /** Minimum body parts needed to wield the weapon in this mode. */
    readonly minParts: number;
    /** Shortcode of the associated skill (resolved to SkillLogic at runtime). */
    readonly assocSkillCode: string;
    /** Attack roll mastery level modifier. */
    readonly attack: CombatModifier;
    /** Impact (damage) modifier with dice and aspect. */
    readonly impact: ImpactModifier;
    /** Miscellaneous traits/flags for this strike mode. */
    readonly traits: PlainObject;
    /** The parent Logic class that owns this strike mode. */
    readonly parentLogic: SohlLogic;
    /** Zero-based index within the parent's strikeModes array. */
    readonly index: number;

    constructor(
        data: StrikeModeBase.Data,
        parentLogic: SohlLogic,
        index: number,
    ) {
        this.type = data.type;
        this.mode = data.mode;
        this.minParts = data.minParts;
        this.assocSkillCode = data.assocSkillCode;
        this.attack = new CombatModifier({}, { parent: parentLogic });
        this.impact = new ImpactModifier(
            {
                roll: {
                    numDice: data.impactBase.numDice,
                    dieFaces: data.impactBase.die,
                    modifier: data.impactBase.modifier,
                    rolls: [],
                } as any,
                aspect: data.impactBase.aspect,
            },
            { parent: parentLogic },
        );
        this.traits = { ...(data.traits ?? {}) };
        this.parentLogic = parentLogic;
        this.index = index;
    }

    /**
     * The dot-notation path prefix for Foundry `update()` calls targeting
     * this strike mode's persisted fields, e.g. `"system.strikeModes.2"`.
     */
    get updatePath(): string {
        return `system.strikeModes.${this.index}`;
    }

    /** Whether this is a melee strike mode. */
    get isMelee(): boolean {
        return this.type === STRIKE_MODE_TYPE.MELEE;
    }

    /** Whether this is a missile strike mode. */
    get isMissile(): boolean {
        return this.type === STRIKE_MODE_TYPE.MISSILE;
    }
}

export namespace StrikeModeBase {
    /** Common persisted fields shared by all strike mode types. */
    export interface Data {
        type: StrikeModeType;
        mode: string;
        minParts: number;
        assocSkillCode: string;
        impactBase: {
            numDice: number;
            die: number;
            modifier: number;
            aspect: ImpactAspect;
        };
        traits: PlainObject;
    }
}
