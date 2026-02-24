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
    ITEM_KIND,
    DomainSubTypes,
    DOMAIN_SUBTYPE,
    DomainSubType,
} from "@utils/constants";
import type { SohlActionContext } from "@common/SohlActionContext";
import {
    SohlItem,
    SohlItemBaseLogic,
    SohlItemData,
    SohlItemDataModel,
    SohlItemSheetBase,
} from "@common/item/SohlItem";
import { PhilosophyLogic } from "./Philosophy";
const { ArrayField, StringField, SchemaField, NumberField } =
    foundry.data.fields;

export class DomainLogic<TData extends DomainData = DomainData>
    extends SohlItemBaseLogic<TData>
    implements DomainLogic<TData>
{
    philosophy?: PhilosophyLogic;

    /* --------------------------------------------- */
    /* Common Lifecycle Actions                      */
    /* --------------------------------------------- */

    /** @inheritdoc */
    override initialize(context: SohlActionContext): void {
        super.initialize(context);
    }

    /** @inheritdoc */
    override evaluate(context: SohlActionContext): void {
        super.evaluate(context);
        let item: SohlItem = this.item.actor?.allItemTypes.philosophy.find(
            (p: SohlItem) =>
                (p as any).system.shortcode === this.data.philosophyCode,
        ) as SohlItem;
        this.philosophy = item?.logic as PhilosophyLogic;
    }

    /** @inheritdoc */
    override finalize(context: SohlActionContext): void {
        super.finalize(context);
    }
}

export interface DomainData<TLogic extends DomainLogic<any> = DomainLogic<any>>
    extends SohlItemData<TLogic> {
    subType: DomainSubType;
    philosophyCode: string;
}

function defineDomainSchema(): foundry.data.fields.DataSchema {
    return {
        ...SohlItemDataModel.defineSchema(),
        subType: new StringField({
            choices: DomainSubTypes,
            required: true,
            default: DOMAIN_SUBTYPE.ARCANE,
        }),
        philosophyCode: new StringField({
            blank: false,
            required: true,
        }),
    };
}

type DomainSchema = ReturnType<typeof defineDomainSchema>;

export class DomainDataModel<
        TSchema extends foundry.data.fields.DataSchema = DomainSchema,
        TLogic extends DomainLogic<DomainData> = DomainLogic<DomainData>,
    >
    extends SohlItemDataModel<TSchema, TLogic>
    implements DomainData<TLogic>
{
    static override readonly LOCALIZATION_PREFIXES = ["SOHL.Domain.DATA"];
    static override readonly kind = ITEM_KIND.DOMAIN;
    subType!: DomainSubType;
    philosophyCode!: string;

    static defineSchema(): foundry.data.fields.DataSchema {
        return defineDomainSchema();
    }
}

export class DomainSheet extends SohlItemSheetBase {
    protected async _preparePropertiesContext(
        context: foundry.applications.api.DocumentSheetV2.RenderContext<SohlItem>,
        options: foundry.applications.api.DocumentSheetV2.RenderOptions,
    ): Promise<
        foundry.applications.api.DocumentSheetV2.RenderContext<SohlItem>
    > {
        return context;
    }
}
