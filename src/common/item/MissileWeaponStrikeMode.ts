/*
 * This file is part of the Song of Heroic Lands (SoHL) system for Foundry VTT.
 * Copyright (c) 2024-2025 Tom Rodriguez ("Toasty") — <toasty@heroiclands.com>
 *
 * This work is licensed under the GNU General Public License v3.0 (GPLv3).
 * You may copy, modify, and distribute it under the terms of that license.
 *
 * For full terms, see the LICENSE.md file in the project root or visit:
 * https://www.gnu.org/licenses/gpl-3.0.html
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import type { SohlAction } from "@common/event/SohlAction";
import { SohlItem } from "@common/item/SohlItem";
import {
    kStrikeModeMixin,
    kStrikeModeMixinData,
    StrikeModeMixin,
} from "@common/item/StrikeModeMixin";
import {
    ImpactAspect,
    PROJECTILEGEAR_SUBTYPE,
    ProjectileGearSubType,
    ProjectileGearSubTypes,
    Variant,
} from "@utils/constants";
import { kSubTypeMixinData } from "@common/item/SubTypeMixin";

const kMissileWeaponStrikeMode = Symbol("MissileWeaponStrikeMode");
const kData = Symbol("MissileWeaponStrikeMode.Data");
const { StringField } = foundry.data.fields;

export class MissileWeaponStrikeMode
    extends StrikeModeMixin(SohlItem.BaseLogic)
    implements MissileWeaponStrikeMode.Logic
{
    declare readonly [kStrikeModeMixin]: true;
    declare readonly parent: MissileWeaponStrikeMode.Data;
    readonly [kMissileWeaponStrikeMode] = true;

    static isA(obj: unknown): obj is MissileWeaponStrikeMode {
        return (
            typeof obj === "object" &&
            obj !== null &&
            kMissileWeaponStrikeMode in obj
        );
    }
    /** @inheritdoc */
    override initialize(context: SohlAction.Context): void {
        super.initialize(context);
    }

    /** @inheritdoc */
    override evaluate(context: SohlAction.Context): void {
        super.evaluate(context);
    }

    /** @inheritdoc */
    override finalize(context: SohlAction.Context): void {
        super.finalize(context);
    }
}

export namespace MissileWeaponStrikeMode {
    export interface Logic extends StrikeModeMixin.Logic {
        readonly parent: MissileWeaponStrikeMode.Data;
        readonly [kMissileWeaponStrikeMode]: true;
    }

    export interface Data extends StrikeModeMixin.Data {
        readonly [kData]: true;
        projectileType: ProjectileGearSubType;
    }

    export namespace Data {
        export function isA(obj: unknown): obj is Data {
            return typeof obj === "object" && obj !== null && kData in obj;
        }
    }

    export class DataModel
        extends StrikeModeMixin.DataModel(SohlItem.DataModel)
        implements Data
    {
        declare readonly [kStrikeModeMixinData]: true;
        declare readonly [kSubTypeMixinData]: true;
        static readonly LOCALIZATION_PREFIXES = ["MissileWeaponStrikeMode"];
        declare mode: string;
        declare minParts: number;
        declare assocSkillName: string;
        declare impactBase: {
            numDice: number;
            die: number;
            modifier: number;
            aspect: ImpactAspect;
        };
        declare subType: Variant;
        declare projectileType: ProjectileGearSubType;
        readonly [kData] = true;

        static isA(obj: unknown): obj is DataModel {
            return typeof obj === "object" && obj !== null && kData in obj;
        }

        static defineSchema(): foundry.data.fields.DataSchema {
            return {
                ...super.defineSchema(),
                projectileType: new StringField({
                    initial: PROJECTILEGEAR_SUBTYPE.NONE,
                    required: true,
                    choices: ProjectileGearSubTypes,
                }),
            };
        }
    }
}
