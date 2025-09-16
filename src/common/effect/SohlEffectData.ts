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

const kSohlEffectData = Symbol("SohlEffectData");
const kData = Symbol("SohlEffectData.Data");

export class SohlEffectData extends SohlLogic implements SohlEffectData.Logic {
    declare readonly _parent: SohlEffectData.Data;
    readonly [kSohlEffectData] = true;

    /** @inheritdoc */
    override initialize(context: SohlEventContext): void {}

    /** @inheritdoc */
    override evaluate(context: SohlEventContext): void {}

    /** @inheritdoc */
    override finalize(context: SohlEventContext): void {}
}

export namespace SohlEffectData {
    /**
     * The FontAwesome icon class for the Affliction item.
     */
    export const IconCssClass = "fa-duotone fa-people-group";

    /**
     * The image path for the Affliction item.
     */
    export const Image = "systems/sohl/assets/icons/people-group.svg";

    export interface Data extends SohlLogic.Data {
        readonly [kData]: true;
    }

    export namespace Data {
        export function isA(obj: unknown): obj is Data {
            return typeof obj === "object" && obj !== null && kData in obj;
        }
    }

    export interface Logic extends SohlLogic {
        readonly [kSohlEffectData]: true;
    }

    export class DataModel
        extends SohlDataModel<SohlActiveEffect>
        implements Data
    {
        static override readonly LOCALIZATION_PREFIXES = ["SohlEffectData"];
        readonly [kData] = true;

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
    }
}
