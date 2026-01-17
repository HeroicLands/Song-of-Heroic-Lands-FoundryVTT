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
    DOMAIN_ELEMENT_CATEGORY,
    DOMAIN_EMBODIMENT_CATEGORY,
    DomainElementCategories,
    DomainElementCategory,
    DomainEmbodimentCategories,
    DomainEmbodimentCategory,
    ITEM_KIND,
    ITEM_METADATA,
} from "@utils/constants";
import type { SohlActionContext } from "@common/SohlActionContext";
import {
    SohlItem,
    SohlItemBaseLogic,
    SohlItemData,
    SohlItemDataModel,
    SohlItemSheetBase,
} from "@common/item/SohlItem";
import { PhilosophyLogic } from "@common/item/Philosophy";
const { ArrayField, StringField } = foundry.data.fields;

export class DomainLogic<TData extends DomainData = DomainData>
    extends SohlItemBaseLogic<TData>
    implements DomainLogic<TData>
{
    philosophy?: SohlItem;
    category?: string;

    /* --------------------------------------------- */
    /* Common Lifecycle Actions                      */
    /* --------------------------------------------- */

    /** @inheritdoc */
    override initialize(context: SohlActionContext): void {
        super.initialize(context);
        if (this.item?.nestedIn?.type === ITEM_KIND.PHILOSOPHY) {
            this.category = this.item?.nestedIn?.system.subType;
        }
    }

    /** @inheritdoc */
    override evaluate(context: SohlActionContext): void {
        super.evaluate(context);
    }

    /** @inheritdoc */
    override finalize(context: SohlActionContext): void {
        super.finalize(context);
    }
}

export interface DomainData<TLogic extends DomainLogic<any> = DomainLogic<any>>
    extends SohlItemData<TLogic> {
    philosophy: string;
    abbrev: string;
    cusp: string;
    magicMod: DomainElementCategory[];
    embodiments: DomainEmbodimentCategory[];
}

function defineDomainSchema(): foundry.data.fields.DataSchema {
    return {
        ...SohlItemDataModel.defineSchema(),
        abbrev: new StringField(),
        cusp: new StringField(),
        philosophy: new StringField(),
        magicMod: new ArrayField(
            new StringField({
                initial: DOMAIN_ELEMENT_CATEGORY.ARCANA,
                required: true,
                choices: DomainElementCategories,
            }),
        ),
        embodiments: new ArrayField(
            new StringField({
                initial: DOMAIN_EMBODIMENT_CATEGORY.DREAMS,
                required: true,
                choices: DomainEmbodimentCategories,
            }),
        ),
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
    abbrev!: string;
    cusp!: string;
    philosophy!: string;
    magicMod!: DomainElementCategory[];
    embodiments!: DomainEmbodimentCategory[];

    static defineSchema(): foundry.data.fields.DataSchema {
        return defineDomainSchema();
    }
}

export class DomainSheet extends SohlItemSheetBase {
    override async _preparePropertiesContext(
        context: PlainObject,
        options: PlainObject,
    ): Promise<PlainObject> {
        return context;
    }
}
