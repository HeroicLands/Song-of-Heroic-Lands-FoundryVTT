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

import {
    CombatTechniqueLogic,
    CombatTechniqueData,
} from "@src/document/item/logic/CombatTechniqueLogic";
import { ITEM_KIND, STRIKE_MODE_TYPE } from "@src/utils/constants";
import { SohlItemDataModel } from "@src/document/item/foundry/SohlItem";
import { StrikeModeBase } from "@src/domain/strikemode/StrikeModeBase";
import { MeleeStrikeMode } from "@src/domain/strikemode/MeleeStrikeMode";
import { MissileStrikeMode } from "@src/domain/strikemode/MissileStrikeMode";

const { StringField, SchemaField, TypedSchemaField } = foundry.data.fields;

function defineCombatTechniqueSchema(): foundry.data.fields.DataSchema {
    return {
        ...SohlItemDataModel.defineSchema(),
        group: new StringField({}),
        strikeMode: new TypedSchemaField({
            [STRIKE_MODE_TYPE.MELEE]: new SchemaField(
                MeleeStrikeMode.schemaFields(),
            ),
            [STRIKE_MODE_TYPE.MISSILE]: new SchemaField(
                MissileStrikeMode.schemaFields(),
            ),
        }),
    };
}

type CombatTechniqueSchema = ReturnType<typeof defineCombatTechniqueSchema>;

/**
 * Foundry DataModel backing a CombatTechnique item.
 *
 * The persisted `strikeMode` field is a discriminated union (TypedSchemaField)
 * over melee/missile strike mode shapes — only the raw plain-data form is
 * stored. Use {@link strikeModeInstance} to obtain a fully constructed
 * `StrikeModeBase` (i.e. {@link MeleeStrikeMode} or {@link MissileStrikeMode})
 * with the runtime modifier wrappers attached.
 * @internal
 */
export class CombatTechniqueDataModel<
    TSchema extends foundry.data.fields.DataSchema = CombatTechniqueSchema,
    TLogic extends CombatTechniqueLogic<CombatTechniqueData> =
        CombatTechniqueLogic<CombatTechniqueData<CombatTechniqueLogic<any>>>,
>
    extends SohlItemDataModel<TSchema, TLogic>
    implements CombatTechniqueData<TLogic>
{
    static override readonly LOCALIZATION_PREFIXES = [
        "SOHL.CombatTechnique",
        "SOHL.StrikeMode",
        "SOHL.Item",
    ];
    static override readonly kind = ITEM_KIND.COMBATTECHNIQUE;
    group!: string;
    strikeMode!: MeleeStrikeMode.Data | MissileStrikeMode.Data;

    static override defineSchema(): foundry.data.fields.DataSchema {
        return defineCombatTechniqueSchema();
    }

    /**
     * The domain-layer strike mode instance — carrying the runtime
     * ValueModifier / CombatModifier / ImpactModifier wrappers — that
     * gameplay code should interact with. Built and evaluated by
     * {@link CombatTechniqueLogic} during the lifecycle (so its reach
     * reflects the wielder's lineage), not constructed fresh here.
     */
    get strikeModeInstance(): StrikeModeBase {
        return (this.logic as CombatTechniqueLogic).strikeMode;
    }
}
