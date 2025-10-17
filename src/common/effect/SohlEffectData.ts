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

import { SohlLogic } from "@common/SohlLogic";
import type { SohlEventContext } from "@common/event/SohlEventContext";

import { SohlActiveEffect } from "@common/effect/SohlActiveEffect";
import { SohlDataModel } from "@common/SohlDataModel";
import { SohlActor } from "@common/actor/SohlActor";
import { SohlItem } from "@common/item/SohlItem";
import { EFFECT_KIND } from "@utils/constants";
const { DocumentIdField } = foundry.data.fields;

export class SohlEffectData
    extends SohlLogic<SohlEffectData.Data>
    implements SohlEffectData.Logic
{
    /** @inheritdoc */
    override initialize(context: SohlEventContext): void {}

    /** @inheritdoc */
    override evaluate(context: SohlEventContext): void {}

    /** @inheritdoc */
    override finalize(context: SohlEventContext): void {}
}

export namespace SohlEffectData {
    export const Kind = EFFECT_KIND.EFFECTDATA;

    /**
     * The FontAwesome icon class for the SohlEffectData active effect.
     */
    export const IconCssClass = "fa-duotone fa-people-group";

    /**
     * The image path for the SohlEffectData active effect.
     */
    export const Image = "systems/sohl/assets/icons/people-group.svg";

    function defineActiveEffectDataSchema(): foundry.data.fields.DataSchema {
        return {
            ...SohlDataModel.defineSchema(),
        };
    }

    type SohlActiveEffectDataSchema = ReturnType<
        typeof defineActiveEffectDataSchema
    >;

    export interface Logic extends SohlLogic<Data> {}

    export interface Data extends SohlLogic.Data<SohlActiveEffect, any> {}

    export class DataModel
        extends SohlDataModel<
            SohlActiveEffectDataSchema,
            SohlActiveEffect,
            Logic
        >
        implements Data
    {
        static override readonly LOCALIZATION_PREFIXES = ["SohlEffectData"];
        static override readonly kind = Kind;

        get actor(): SohlActor {
            return this.parent.actor;
        }

        get item(): SohlItem | null {
            return this.parent.item;
        }

        get i18nPrefix(): string {
            return `SOHL.Effect.${this.kind}`;
        }

        constructor(data: PlainObject = {}, options: PlainObject = {}) {
            if (!(options.parent instanceof SohlActiveEffect)) {
                throw new Error("Parent must be of type SohlActiveEffect");
            }
            super(data, options);
        }

        static defineSchema(): foundry.data.fields.DataSchema {
            return defineActiveEffectDataSchema();
        }
    }
}
