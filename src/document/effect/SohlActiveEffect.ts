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

import type { SohlActor } from "@src/document/actor/foundry/SohlActor";
import type { SohlItem } from "@src/document/item/foundry/SohlItem";
import type { SohlContextMenu } from "@src/utils/SohlContextMenu";
import {
    ACTIVE_EFFECT_SCOPE,
    ActiveEffectScopes,
    ITEM_METADATA,
    ItemKinds,
} from "@src/utils/constants";
import { textToFunction } from "@src/utils/helpers";
const { StringField, JavaScriptField } = foundry.data.fields;

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
     * Resolve the documents this effect applies to, based on `system.scope`
     * and (for the `test` scope) `system.test`.
     *
     * Scope resolution:
     * - `"this"`: the owning item if the effect is embedded in an item,
     *   otherwise the owning actor.
     * - `"actor"`: the owning actor (the actor of the parent item, or the
     *   parent itself if the parent is an actor).
     * - `"test"`: every embedded item on the owning actor for which the
     *   `system.test` JavaScript expression returns truthy. The expression is
     *   evaluated as a function body with a single parameter `doc` bound to
     *   each candidate item. Returns an empty array when there is no owning
     *   actor, when `system.test` is blank, or when the expression fails to
     *   compile.
     *
     * Errors thrown by the test expression for an individual item are caught
     * and logged; that item is skipped and evaluation continues.
     *
     * @returns Target documents as `SohlItem` and/or `SohlActor`.
     */
    get targets(): Array<SohlItem | SohlActor> {
        if (!this.actor) return [];

        if (this.system.scope === ACTIVE_EFFECT_SCOPE.THIS) {
            return (
                this.item ? [this.item]
                : this.actor ? [this.actor]
                : []
            );
        } else if (this.system.scope === ACTIVE_EFFECT_SCOPE.ACTOR) {
            return this.actor ? [this.actor] : [];
        } else if (this.system.scope === ACTIVE_EFFECT_SCOPE.TEST) {
            return this._resolveTestTargets();
        } else {
            sohl.log.warn("Unrecognized scope on Active Effect:", {
                scope: this.system.scope,
                effect: this,
            });
            return [];
        }
    }

    /**
     * Compile `system.test` as `(doc) => unknown` and run it against every
     * embedded item on the owning actor. See {@link targets} for scope rules.
     */
    protected _resolveTestTargets(): SohlItem[] {
        const script = this.system.test;
        if (!script || !this.actor) return [];

        let predicate: (doc: SohlItem) => unknown;
        try {
            predicate = textToFunction(script, ["doc"], {
                isAsync: false,
            }) as (doc: SohlItem) => unknown;
        } catch (err) {
            sohl.log.warn(
                "Failed to compile test script on Active Effect:",
                { test: script, effect: this, error: err },
            );
            return [];
        }

        const matched: SohlItem[] = [];
        for (const item of this.actor.items.values() as Iterable<SohlItem>) {
            try {
                if (predicate(item)) matched.push(item);
            } catch (err) {
                sohl.log.warn(
                    "Test script threw on Active Effect evaluation:",
                    { test: script, effect: this, item, error: err },
                );
            }
        }
        return matched;
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
        scope: new StringField({
            blank: false,
            initial: ACTIVE_EFFECT_SCOPE.THIS,
            choices: ActiveEffectScopes,
        }),
        test: new JavaScriptField({}),
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
    scope!: string;
    test!: string;

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
                    (
                        types: StrictObject<string>,
                        [key, config]: [string, any],
                    ) => {
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
