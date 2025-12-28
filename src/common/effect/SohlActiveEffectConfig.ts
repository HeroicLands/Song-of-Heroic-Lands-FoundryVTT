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

import { SohlActor } from "@common/actor/SohlActor";
import { SohlItem } from "@common/item/SohlItem";
import { ITEM_METADATA } from "@utils/constants";

const BaseAEConfig = foundry.applications.sheets.ActiveEffectConfig;
export class SohlActiveEffectConfig extends BaseAEConfig {
    static PARTS = {
        header: { template: "templates/sheets/active-effect/header.hbs" },
        tabs: { template: "templates/generic/tab-navigation.hbs" },
        details: {
            template: "systems/sohl/templates/effects/details.hbs",
            scrollable: [""],
        },
        duration: { template: "templates/sheets/active-effect/duration.hbs" },
        changes: {
            template: "systems/sohl/templates/effects/changes.hbs",
            scrollable: ["ol[data-changes]"],
        },
        footer: { template: "templates/generic/form-footer.hbs" },
    };

    /** @inheritDoc */
    async _preparePartContext(
        partId: string,
        context: PlainObject,
    ): Promise<foundry.applications.api.ApplicationV2.RenderContextOf<this>> {
        const partContext: PlainObject = await super._preparePartContext(
            partId,
            context as any,
            {},
        );
        if (partContext.tabs?.partId)
            partContext.tab = partContext.tabs[partId];
        const document: SohlItem | SohlActor = (this as any).object;
        switch (partId) {
            case "details":
                partContext.targetTypes = {};
                if (partContext.isActorEffect) {
                    partContext.targetTypes["this"] =
                        sohl.i18n.localize("EFFECT.ThisActor");
                } else {
                    partContext.targetTypes["this"] = sohl.i18n.format(
                        "EFFECT.ThisItem",
                        {
                            itemType: (document.parent?.system as any)
                                ?.typeLabel,
                        },
                    );
                    partContext.targetTypes["actor"] =
                        sohl.i18n.localize("EFFECT.Actor");
                }
                // Add all of the item types
                Object.entries(sohl.CONFIG.Item.dataModels).reduce(
                    (obj: PlainObject, [key, clazz]: [string, any]) => {
                        obj[key] = clazz.typeLabel;
                        return obj;
                    },
                    context.targetTypes,
                );
                break;

            case "duration":
                // partContext.startTimeTemporal = new SohlTemporal(
                //     partContext.startTime,
                // );
                // partContext.endTimeTemporal = new SohlTemporal(
                //     partContext.endTime,
                // );
                break;

            case "changes":
                partContext.modes = Object.entries(
                    CONST.ACTIVE_EFFECT_MODES,
                ).reduce((modes: StrictObject<string>, [key, value]) => {
                    modes[value] = sohl.i18n.localize(`EFFECT.MODE_${key}`);
                    return modes;
                }, {});
                // @ts-expect-error - All Actor and Item types have a type property
                const itemData = ITEM_METADATA[document.type];
                partContext.keyChoices = itemData?.KeyChoices || [];
        }
        return partContext as foundry.applications.api.ApplicationV2.RenderContextOf<this>;
    }
}
