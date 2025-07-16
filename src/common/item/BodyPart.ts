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

import { SohlDataModel, SohlLogic } from "@common";
import { RegisterClass } from "@utils/decorators";
import { SohlItem } from "@common/item";
import { SohlAction } from "@common/event";

const { BooleanField, StringField, DocumentIdField } = (foundry.data as any)
    .fields;

@RegisterClass(
    new SohlLogic.Element({
        kind: "BodyPartLogic",
    }),
)
export class BodyPart extends SohlLogic implements BodyPart.Logic {
    declare readonly parent: BodyPart.Data;

    get bodyLocations(): SohlItem[] {
        return this.actor?.itemTypes.bodylocation || [];
    }

    get heldItem(): SohlItem | null {
        return (
            (this.parent.heldItemId &&
                this.item?.actor?.items.get(this.parent.heldItemId)) ||
            null
        );
    }

    /** @inheritdoc */
    override initialize(context: SohlAction.Context): void {}

    /** @inheritdoc */
    override evaluate(context: SohlAction.Context): void {}

    /** @inheritdoc */
    override finalize(context: SohlAction.Context): void {}
}

export namespace BodyPart {
    /**
     * The type moniker for the BodyPart item.
     */
    export const Kind = "bodypart";

    /**
     * The FontAwesome icon class for the BodyPart item.
     */
    export const IconCssClass = "fa-duotone fa-skeleton-ribs";

    /**
     * The image path for the BodyPart item.
     */
    export const Image = "systems/sohl/assets/icons/ribcage.svg";

    export interface Logic extends SohlLogic.Logic {}

    export interface Data extends SohlItem.Data {
        abbrev: string;
        canHoldItem: boolean;
        heldItemId: string | null;
    }

    @RegisterClass(
        new SohlDataModel.Element({
            kind: Kind,
            logicClass: BodyPart,
            iconCssClass: IconCssClass,
            img: Image,
            sheet: "systems/sohl/templates/item/bodypart-sheet.hbs",
            schemaVersion: "0.6.0",
        }),
    )
    export class DataModel extends SohlItem.DataModel implements Data {
        static override readonly LOCALIZATION_PREFIXES = ["BodyPart"];
        declare readonly parent: SohlItem<BodyPart>;
        abbrev!: string;
        canHoldItem!: boolean;
        heldItemId!: string | null;

        static defineSchema(): foundry.data.fields.DataSchema {
            return {
                abbrev: new StringField(),
                canHoldItem: new BooleanField({ initial: false }),
                heldItemId: new DocumentIdField({ nullable: true }),
            };
        }
    }

    export class Sheet extends SohlItem.Sheet {
        static override readonly PARTS = {
            header: {
                template: "systems/sohl/templates/item/bodypart.hbs",
            },
        };
    }
}
