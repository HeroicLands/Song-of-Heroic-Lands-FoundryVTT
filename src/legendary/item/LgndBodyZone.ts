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
    BodyZoneData,
    BodyZoneLogic,
    BodyZoneSheet,
} from "@common/item/BodyZone";
import { SohlItem } from "@common/item/SohlItem";
import { SohlActionContext } from "@common/SohlActionContext";
import { TRAIT_INTENSITY } from "@utils/constants";

export class LgndBodyZoneLogic extends BodyZoneLogic<BodyZoneData> {
    get affectedSkills(): SohlItem[] {
        const raw = this.item.getFlag("sohl", "legendary.affectedSkills");
        let result: SohlItem[] = [];
        if (Array.isArray(raw)) {
            raw.reduce((ary: SohlItem[], name: string) => {
                const item = this.actor?.allItemTypes.skills.find(
                    (i) => i.name === name,
                ) as SohlItem | undefined;
                if (item) ary.push(item);
                return ary;
            }, result);
        }
        return result;
    }

    get affectedAttributes(): SohlItem[] {
        const raw = this.item.getFlag("sohl", "legendary.affectedAttributes");
        let result: SohlItem[] = [];
        if (Array.isArray(raw)) {
            raw.reduce((ary: SohlItem[], name: string) => {
                const item = this.actor?.allItemTypes.traits.find(
                    (i) =>
                        i.system.intensity === TRAIT_INTENSITY.ATTRIBUTE &&
                        i.name === name,
                ) as SohlItem | undefined;
                if (item) ary.push(item);
                return ary;
            }, result);
        }
        return result;
    }

    get affectsMobility(): boolean {
        const raw = this.item.getFlag("sohl", "legendary.affectedAttributes");
        return raw === true || raw === "true" || raw === 1 || raw === "1";
    }

    get zones(): number[] {
        const raw = this.item.getFlag("sohl", "legendary.zones");
        let result: number[] = [];
        if (Array.isArray(raw)) {
            raw.reduce((ary: number[], x: any) => {
                const num = Number(x);
                if (Number.isInteger(num)) ary.push(num);
                return ary;
            }, result);
        }
        return result;
    }

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
    }

    /** @inheritdoc */
    override finalize(context: SohlActionContext): void {
        super.finalize(context);
    }
}

export class LgndBodyZoneSheet extends BodyZoneSheet {
    static override PARTS = {
        ...super.PARTS,
        properties: {
            container: { classes: ["tab-body"], id: "tabs" },
            template:
                "systems/sohl/templates/item/legendary/skill-properties.hbs",
            scrollable: [""],
        },
    };
}
