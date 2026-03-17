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

import type { SohlActor } from "@common/actor/foundry/SohlActor";
import type { SohlItem } from "@common/item/foundry/SohlItem";
import type { SohlContextMenu } from "@utils/SohlContextMenu";
import { ITEM_METADATA, ItemKinds } from "@utils/constants";
const { StringField } = foundry.data.fields;

export class SohlActiveEffect extends ActiveEffect {
    get item(): SohlItem | null {
        return ItemKinds.includes(this.parent?.type as any) ?
                (this.parent as SohlItem)
            :   null;
    }

    get actor(): SohlActor {
        return (this.item?.actor || this.parent) as unknown as SohlActor;
    }

    /**
     * Resolve the targets of this effect from `targetType` and `targetName`.
     *
     * Resolution rules:
     * - `targetType === "this"`: returns the owning item if present, otherwise the owning actor.
     * - `targetType === "actor"`: returns the owning actor.
     * - Otherwise: inspects actor items of type `targetType`.
     *
     * Name matching rules for item targets:
     * - Default mode: match against `item.system.shortcode`.
     * - Attribute mode (`targetName` starts with `"attr:"`): match against each
     *   attribute shortcode on the item's Skill Base,
     *   i.e. `item.logic.skillBase.attributes[*].data.shortcode`.
     * - In both modes, if match value is non-blank, matching attempts exact
     *   match first; if none are found, the value is treated as a regular
     *   expression.
     * - If the match value is blank:
     *   - default mode returns all items of `targetType`;
     *   - attribute mode returns only items that expose at least one Skill Base attribute shortcode.
     *
     * @returns Target documents as `SohlItem` and/or `SohlActor`.
     */
    get targets(): Array<SohlItem | SohlActor> {
        function getItemAttributeShortcodes(item: SohlItem): string[] {
            const attrs = (item.logic as any).skillBase?.attributes;
            if (!Array.isArray(attrs)) return [];
            return attrs
                .map((attr: any) => attr?.data?.shortcode)
                .filter(
                    (shortcode: unknown): shortcode is string =>
                        typeof shortcode === "string" && shortcode.length > 0,
                );
        }

        const { targetType, targetName } = this
            .system as SohlActiveEffectDataModel;

        if (!this.actor) return [];

        if (targetType === "this") {
            return (
                this.item ? [this.item]
                : this.actor ? [this.actor]
                : []
            );
        }

        if (targetType === "actor") {
            return this.actor ? [this.actor] : [];
        }

        const trimmedTargetName = targetName?.trim() ?? "";
        const isAttributeTarget = trimmedTargetName.startsWith("attr:");
        const matchName =
            isAttributeTarget ?
                trimmedTargetName.slice(5).trim()
            :   trimmedTargetName;

        const typeItems: SohlItem[] = this.actor.allItemTypes[targetType] ?? [];
        if (!matchName) {
            return isAttributeTarget ?
                    typeItems.filter(
                        (item: SohlItem) =>
                            getItemAttributeShortcodes(item).length > 0,
                    )
                :   typeItems;
        }

        const exactMatches = typeItems.filter((item: SohlItem) => {
            if (isAttributeTarget) {
                return getItemAttributeShortcodes(item).includes(matchName);
            }
            return item.system.shortcode === matchName;
        });
        if (exactMatches.length) return exactMatches;

        let regex: RegExp;
        try {
            regex = new RegExp(matchName);
        } catch {
            return [];
        }

        return typeItems.filter((item: SohlItem) => {
            if (isAttributeTarget) {
                return getItemAttributeShortcodes(item).some(
                    (shortcode: string) => regex.test(shortcode),
                );
            }
            return regex.test(item.system.shortcode);
        });
    }

    /**
     * Get the context menu options for a specific SohlItem document.
     * @param doc The SohlItem document to get context options for.
     * @returns The context menu options for the specified SohlItem document.
     */
    static _getContextOptions(doc: SohlActiveEffect): SohlContextMenu.Entry[] {
        return doc._getContextOptions();
    }

    /**
     * Get the context menu options for this item.
     * @returns The context menu options for this item.
     */
    _getContextOptions(): SohlContextMenu.Entry[] {
        return [];
    }
}

function defineActiveEffectDataSchema(): foundry.data.fields.DataSchema {
    return {
        targetType: new StringField({}),
        targetName: new StringField({}),
    };
}

type SohlActiveEffectDataSchema = ReturnType<
    typeof defineActiveEffectDataSchema
>;

export class SohlActiveEffectDataModel<
    TSchema extends foundry.data.fields.DataSchema = SohlActiveEffectDataSchema,
> extends foundry.abstract.TypeDataModel<TSchema, SohlActiveEffect> {
    static override readonly LOCALIZATION_PREFIXES = ["SOHL.ActiveEffect"];
    static readonly kind = "sohleffectdata";
    targetType!: string;
    targetName!: string;

    static defineSchema(): foundry.data.fields.DataSchema {
        return defineActiveEffectDataSchema();
    }
}

const BaseAEConfig = foundry.applications.sheets.ActiveEffectConfig;
export class SohlActiveEffectSheet extends BaseAEConfig {
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
                // v14: Use ActiveEffect.CHANGE_TYPES (string-keyed registry)
                // instead of deprecated CONST.ACTIVE_EFFECT_MODES (numeric)
                partContext.changeTypes = Object.entries(
                    (ActiveEffect as any).CHANGE_TYPES ?? {},
                ).reduce(
                    (types: StrictObject<string>, [key, config]: [string, any]) => {
                        types[key] = sohl.i18n.localize(config.label ?? key);
                        return types;
                    },
                    {},
                );
                const itemData =
                    document.type in ITEM_METADATA ?
                        ITEM_METADATA[
                            document.type as keyof typeof ITEM_METADATA
                        ]
                    :   undefined;
                partContext.keyChoices = itemData?.KeyChoices || [];
        }
        return partContext as foundry.applications.api.ApplicationV2.RenderContextOf<this>;
    }
}
