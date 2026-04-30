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

import { SohlItemBaseLogic, SohlItemData } from "../foundry/SohlItem";
import {
    ImpactAspect,
    STRIKE_MODE_TYPE,
    StrikeModeType,
} from "@src/utils/constants";
import { ValueModifier } from "@src/domain/modifier/ValueModifier";
import { StrikeModeBase } from "@src/domain/strikemode/StrikeModeBase";
import { MeleeStrikeMode } from "@src/domain/strikemode/MeleeStrikeMode";
import { MissileStrikeMode } from "@src/domain/strikemode/MissileStrikeMode";
import type { SkillLogic } from "./SkillLogic";
import { ImpactModifier } from "@src/domain/modifier/ImpactModifier";

/**
 * Logic for the **Combat Technique** item type — a specialized combat
 * maneuver or fighting style not tied to a specific weapon.
 *
 * Combat techniques represent trained maneuvers: grappling, disarming,
 * tripping, shield bashing, unarmed strikes, and other specialized
 * techniques. Unlike weapon-based strike modes, these belong directly
 * to a Being rather than being nested inside a weapon.
 *
 * Each combat technique has one or more {@link StrikeModeBase | strike modes}
 * (typically melee, but possibly missile for creature abilities like
 * tail-flung quills). Each strike mode carries its own attack, impact,
 * and defense modifiers.
 *
 * @typeParam TData - The CombatTechnique data interface.
 */
export class CombatTechniqueLogic<
    TData extends CombatTechniqueData = CombatTechniqueData,
> extends SohlItemBaseLogic<TData> {
    /** Effective range of this combat technique. */
    length!: ValueModifier;
    assocSkill!: SkillLogic;
    baseRange!: ValueModifier;
    impact!: ImpactModifier;

    /* --------------------------------------------- */
    /* Common Lifecycle Actions                      */
    /* --------------------------------------------- */

    /** @inheritdoc */
    override initialize(): void {
        super.initialize();
        this.length = new ValueModifier({}, { parent: this }).setBase(
            this.data.lengthBase,
        );
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

export interface CombatTechniqueData<
    TLogic extends CombatTechniqueLogic<CombatTechniqueData> =
        CombatTechniqueLogic<any>,
> extends SohlItemData<TLogic> {
    group: string;
    method: StrikeModeType;
    assocSkillCode: string;
    strikeAccuracy: number;
    lengthBase: number;
    maxVolleyMult: number;
    baseRangeBase: number;
    impactBase: {
        numDice: number;
        die: number;
        modifier: number;
        aspect: ImpactAspect;
    };
    traits: PlainObject;
}
