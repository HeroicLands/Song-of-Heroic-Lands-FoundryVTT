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

import type { SohlActionContext } from "@common/SohlActionContext";

import {
    SohlItem,
    SohlItemBaseLogic,
    SohlItemData,
    SohlItemDataModel,
    SohlItemLogic,
    SohlItemSheetBase,
} from "@common/item/SohlItem";
import { ITEM_KIND, ITEM_METADATA } from "@utils/constants";
const { StringField, NumberField } = foundry.data.fields;

/**
 * Logic for the **Affiliation** item type — membership in an organization
 * or faction.
 *
 * Affiliations represent a character's social and political ties: guild
 * membership, noble house allegiance, religious order, military unit, or
 * any other organizational relationship. Each affiliation tracks:
 *
 * - **society** — The name of the organization
 * - **office** — A specific position held (e.g., "Captain," "Acolyte")
 * - **title** — A formal title granted (e.g., "Sir," "Elder")
 * - **level** — Rank or standing within the organization
 *
 * Affiliations are lightweight identity records with no complex calculations.
 * They can be attached to Beings, Cohorts, Structures, or Vehicles.
 *
 * @typeParam TData - The Affiliation data interface.
 */
export class AffiliationLogic<
    TData extends AffiliationData = AffiliationData,
> extends SohlItemBaseLogic<TData> {
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

export interface AffiliationData<
    TLogic extends SohlItemLogic<AffiliationData> = SohlItemLogic<any>,
> extends SohlItemData<TLogic> {
    /** Subdivision of the organization or faction */
    society: string;
    /** Specific position held within the organization */
    office: string;
    /** Formal title granted by the organization */
    title: string;
    /** Rank or standing within the organization */
    level: number;
}

function defineAffiliationDataSchema(): foundry.data.fields.DataSchema {
    return {
        ...SohlItemDataModel.defineSchema(),
        society: new StringField({
            initial: "",
        }),
        office: new StringField({
            initial: "",
        }),
        title: new StringField({
            initial: "",
        }),
        level: new NumberField({
            integer: true,
            initial: 0,
            min: 0,
        }),
    };
}

type SohlAffiliationDataSchema = ReturnType<typeof defineAffiliationDataSchema>;

export class AffiliationDataModel<
        TSchema extends
            foundry.data.fields.DataSchema = SohlAffiliationDataSchema,
        TLogic extends
            AffiliationLogic<AffiliationData> = AffiliationLogic<AffiliationData>,
    >
    extends SohlItemDataModel<TSchema, TLogic>
    implements AffiliationData<TLogic>
{
    static override readonly LOCALIZATION_PREFIXES = ["SOHL.Affiliation", "SOHL.Item"];
    static override readonly kind = ITEM_KIND.AFFILIATION;
    society!: string;
    office!: string;
    title!: string;
    level!: number;

    static override defineSchema(): foundry.data.fields.DataSchema {
        return defineAffiliationDataSchema();
    }
}

export class AffiliationSheet extends SohlItemSheetBase {
    protected async _preparePropertiesContext(
        context: foundry.applications.api.DocumentSheetV2.RenderContext<SohlItem>,
        options: foundry.applications.api.DocumentSheetV2.RenderOptions,
    ): Promise<
        foundry.applications.api.DocumentSheetV2.RenderContext<SohlItem>
    > {
        await super._preparePropertiesContext(context, options);
        const system = this.document.system as any;
        return Object.assign(context, {
            society: system.society,
            office: system.office,
            title: system.title,
            level: system.level,
        });
    }
}
