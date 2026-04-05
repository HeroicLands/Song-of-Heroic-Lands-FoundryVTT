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

import type { SohlActionContext } from "@src/core/SohlActionContext";
import type { SohlTokenDocument } from "@src/document/token/SohlTokenDocument";
import type { SkillLogic } from "@src/document/item/logic/SkillLogic";
import type { SuccessTestResult } from "@src/result/SuccessTestResult";
import { CombatModifier } from "@src/modifier/CombatModifier";
import type { ValueModifier } from "@src/modifier/ValueModifier";
import {
    ImpactAspect,
    VALUE_DELTA_ID,
    VALUE_DELTA_INFO,
} from "@src/utils/constants";
import {
    SohlItemBaseLogic,
    SohlItemData,
    SohlItemLogic,
} from "../foundry/SohlItem";

/**
 * Logic for the **Combat Technique Strike Mode** item type — a specialized
 * combat maneuver or fighting style.
 *
 * Combat technique strike modes represent trained maneuvers that go beyond
 * basic weapon attacks: grappling, disarming, tripping, shield bashing,
 * and other specialized fighting techniques. Unlike weapon-based strike modes,
 * these are tied to a combat technique skill rather than a specific weapon.
 *
 * Like weapon strike modes, combat techniques provide:
 *
 * - **defense.block** — Modifier for defensive use of the technique
 * - **defense.counterstrike** — Modifier for counterattacking
 * - **length** — Effective range of the technique
 *
 * Defense modifiers incorporate the associated skill's mastery level and
 * the outnumbered penalty during evaluation.
 *
 * @typeParam TData - The CombatTechniqueStrikeMode data interface.
 */
export class CombatTechniqueLogic<
    TData extends CombatTechniqueData = CombatTechniqueData,
> extends SohlItemBaseLogic<TData> {
    length!: ValueModifier;
    defense!: {
        block: CombatModifier;
        counterstrike: CombatModifier;
    };

    async blockTest(
        context: SohlActionContext,
    ): Promise<SuccessTestResult | null> {
        return (await this.defense.block.successTest(context)) || null;
    }

    async counterstrikeTest(
        context: SohlActionContext,
    ): Promise<SuccessTestResult | null> {
        return (await this.defense.counterstrike.successTest(context)) || null;
    }

    /* --------------------------------------------- */
    /* Common Lifecycle Actions                      */
    /* --------------------------------------------- */

    /** @inheritdoc */
    override initialize(): void {
        super.initialize();
        this.defense = {
            block: new CombatModifier({}, { parent: this }),
            counterstrike: new CombatModifier({}, { parent: this }),
        };
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

export interface CombatTechniqueStrikeMode {
    mode: string;
    strikeAccuracy: number;
    assocSkillCode: string;
    lengthBase: number;
    impactBase: {
        numDice: number;
        die: number;
        modifier: number;
        aspect: ImpactAspect;
    };
}

export interface CombatTechniqueData<
    TLogic extends CombatTechniqueLogic<CombatTechniqueData> =
        CombatTechniqueLogic<any>,
> extends SohlItemData<TLogic> {
    /** Effective range of this combat technique */
    lengthBase: number;
    /** Strike modes available for this combat technique */
    strikeModes: CombatTechniqueStrikeMode[];
}
