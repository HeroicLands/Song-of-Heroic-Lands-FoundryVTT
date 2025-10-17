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

import {
    DOMAIN_ELEMENT_CATEGORY,
    DOMAIN_EMBODIMENT_CATEGORY,
    DomainElementCategories,
    DomainElementCategory,
    DomainEmbodimentCategories,
    DomainEmbodimentCategory,
    ITEM_KIND,
} from "@utils/constants";
import type { SohlEventContext } from "@common/event/SohlEventContext";
import {
    SohlItem,
    SohlItemDataModel,
    SohlItemSheetBase,
} from "@common/item/SohlItem";
import { Philosophy } from "@common/item/Philosophy";
const { ArrayField, StringField } = foundry.data.fields;

export class Domain<TData extends Domain.Data = Domain.Data>
    extends SohlItem.BaseLogic<TData>
    implements Domain.Logic<TData>
{
    philosophy?: SohlItem;
    category?: string;

    /** @inheritdoc */
    override initialize(context: SohlEventContext): void {
        super.initialize(context);
        if (this.item?.nestedIn?.type === ITEM_KIND.PHILOSOPHY) {
            this.category = this.item?.nestedIn?.system.subType;
        }
    }

    /** @inheritdoc */
    override evaluate(context: SohlEventContext): void {
        super.evaluate(context);
    }

    /** @inheritdoc */
    override finalize(context: SohlEventContext): void {
        super.finalize(context);
    }
}

export namespace Domain {
    export interface Logic<TData extends Domain.Data<any> = Domain.Data<any>>
        extends SohlItem.Logic<TData> {
        philosophy?: SohlItem;
    }

    export interface Data<TLogic extends Domain.Logic<any> = Domain.Logic<any>>
        extends SohlItem.Data<TLogic> {
        philosophy: string;
        abbrev: string;
        cusp: string;
        magicMod: DomainElementCategory[];
        embodiments: DomainEmbodimentCategory[];
    }
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
        TLogic extends Domain.Logic<Domain.Data> = Domain.Logic<Domain.Data>,
    >
    extends SohlItemDataModel<TSchema, TLogic>
    implements Domain.Data<TLogic>
{
    static readonly LOCALIZATION_PREFIXES = ["Domain"];
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
    static override PARTS = {
        ...super.PARTS,
        properties: {
            template: "systems/sohl/templates/item/domain.hbs",
        },
    };

    override async _preparePropertiesContext(
        context: PlainObject,
        options: PlainObject,
    ): Promise<PlainObject> {
        return context;
    }
}
