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
    SohlItem,
    SohlItemBaseLogic,
    SohlItemData,
    SohlItemDataModel,
    SohlItemSheetBase,
} from "@common/item/SohlItem";
import type { SohlActionContext } from "@common/SohlActionContext";
import { ITEM_KIND, ITEM_METADATA } from "@utils/constants";
const { StringField } = foundry.data.fields;

/**
 * Logic for the **Body Zone** item type — a broad anatomical region grouping
 * body parts.
 *
 * Body Zones are the top level of the three-tier anatomy model:
 * **Zone → Part → Location**. They represent broad regions such as "Upper Body,"
 * "Lower Body," or "Head/Neck." Each zone contains one or more
 * {@link BodyPartLogic | Body Parts}, which in turn contain
 * {@link BodyLocationLogic | Body Locations}.
 *
 * Body Zones contribute to the Being's {@link BeingLogic.zoneSum | zoneSum},
 * which is used in hit location resolution to determine which zone is struck
 * during combat.
 *
 * @typeParam TData - The BodyZone data interface.
 */
export class BodyZoneLogic<
    TData extends BodyZoneData = BodyZoneData,
> extends SohlItemBaseLogic<TData> {
    get bodyParts(): SohlItem[] {
        return this.actor?.allItemTypes.bodypart || [];
    }

    /* --------------------------------------------- */
    /* Common Lifecycle Actions                      */
    /* --------------------------------------------- */

    /** @inheritdoc */
    override initialize(): void {
        super.initialize();
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

export interface BodyZoneData<
    TLogic extends BodyZoneLogic<BodyZoneData> = BodyZoneLogic<any>,
> extends SohlItemData<TLogic> {}

function defineBodyZoneDataSchema(): foundry.data.fields.DataSchema {
    return {
        ...SohlItemDataModel.defineSchema(),
    };
}

type BodyZoneDataSchema = ReturnType<typeof defineBodyZoneDataSchema>;

export class BodyZoneDataModel<
        TSchema extends foundry.data.fields.DataSchema = BodyZoneDataSchema,
        TLogic extends
            BodyZoneLogic<BodyZoneData> = BodyZoneLogic<BodyZoneData>,
    >
    extends SohlItemDataModel<TSchema, TLogic>
    implements BodyZoneData<TLogic>
{
    static override readonly LOCALIZATION_PREFIXES = ["SOHL.BodyZone", "SOHL.Item"];
    static override readonly kind = ITEM_KIND.BODYZONE;

    static override defineSchema(): foundry.data.fields.DataSchema {
        return defineBodyZoneDataSchema();
    }
}

export class BodyZoneSheet extends SohlItemSheetBase {
    protected override async _preparePropertiesContext(
        context: foundry.applications.api.DocumentSheetV2.RenderContext<SohlItem>,
        options: foundry.applications.api.DocumentSheetV2.RenderOptions,
    ): Promise<
        foundry.applications.api.DocumentSheetV2.RenderContext<SohlItem>
    > {
        return context;
    }
}
