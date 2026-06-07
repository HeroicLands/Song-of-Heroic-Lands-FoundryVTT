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
    ActiveEffectScopeChoices,
    ITEM_KIND,
    ITEM_METADATA,
    isItemKind,
    type ItemKind,
    ItemKinds,
    VALUE_DELTA_OPERATOR,
} from "@src/utils/constants";
import { SafeExpression, STANDARD_HELPERS } from "@src/utils/SafeExpression";
import { ValueModifier } from "@src/domain/modifier/ValueModifier";
import { ValueDelta } from "@src/domain/modifier/ValueDelta";
const {
    StringField,
    JavaScriptField,
    ArrayField,
    SchemaField,
    NumberField,
    AnyField,
} = foundry.data.fields;

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
     * and (for item-type scopes) the `system.test` predicate.
     *
     * Scope resolution:
     * - `"this"`: the owning item (effect embedded in an item) or the owning
     *   actor (effect embedded directly in an actor).
     * - `"actor"`: the owning actor (the actor of the parent item, or the
     *   parent itself if the parent is an actor).
     * - `<itemKind>` (e.g. `"weapongear"`, `"skill"`): every item of that
     *   kind on the owning actor for which the `system.test` predicate
     *   evaluates truthy. An empty `system.test` matches all items of the
     *   type. The predicate is a SafeExpression with `item` bound to each
     *   candidate. Errors compiling the predicate produce a warning and
     *   no matches; errors evaluating it for an individual item skip that
     *   item only.
     *
     * @returns Target documents as `SohlItem` and/or `SohlActor`.
     */
    get targets(): Array<SohlItem | SohlActor> {
        if (!this.actor) return [];
        const scope = this.system.scope;

        if (scope === ACTIVE_EFFECT_SCOPE.THIS) {
            return this.item ? [this.item] : [this.actor];
        }
        if (scope === ACTIVE_EFFECT_SCOPE.ACTOR) {
            return [this.actor];
        }
        if (isItemKind(scope)) {
            return this._resolveItemTypeTargets(scope as ItemKind);
        }
        sohl.log.warn("Unrecognized scope on Active Effect:", {
            scope,
            effect: this,
        });
        return [];
    }

    /**
     * Walk the owning actor's items of the given kind and return those for
     * which `system.test` (a SafeExpression) evaluates truthy. An empty
     * `system.test` matches every item of that kind.
     */
    protected _resolveItemTypeTargets(itemKind: ItemKind): SohlItem[] {
        if (!this.actor) return [];
        const items = this.actor.items.values() as Iterable<SohlItem>;
        const script = this.system.test;
        const matched: SohlItem[] = [];

        if (!script) {
            for (const item of items) {
                if (item.type === itemKind) matched.push(item);
            }
            return matched;
        }

        let expression: SafeExpression;
        try {
            expression = new SafeExpression(script, STANDARD_HELPERS);
        } catch (err) {
            sohl.log.warn("Failed to compile test script on Active Effect:", {
                test: script,
                effect: this,
                error: err,
            });
            return [];
        }

        for (const item of items) {
            if (item.type !== itemKind) continue;
            try {
                if (expression.evaluate({ item })) matched.push(item);
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
     * SoHL-specific change dispatcher. Intercepts SoHL-prefixed change keys
     * (`mod:`, `sm:`, `mod:sm:`) and routes them to the appropriate handler.
     * Standard `system.*` keys fall through to Foundry's stock implementation.
     *
     * Prefixes are composable:
     * - `mod:<path>` — push a `ValueDelta` onto the `ValueModifier` at
     *   `<path>` on `targetDoc.logic`.
     * - `sm:<path>` — for each strike mode on the target weapon matching
     *   `change.strikeModePredicate`, set `<path>` on the strike mode using
     *   the change's mode (raw assignment).
     * - `mod:sm:<path>` — for each matching strike mode, push a `ValueDelta`
     *   onto the `ValueModifier` at `<path>` on the strike mode.
     *
     * `sm:` keys are only meaningful on `WEAPONGEAR` documents; on other
     * target types the change is silently skipped.
     */
    static _applyChangeUnguided(
        targetDoc: any,
        change: any,
        changes: Record<string, unknown>,
        opts: { replacementData?: object; modifyTarget?: boolean } = {},
    ): unknown {
        const rawKey: string = change?.key ?? "";
        if (!rawKey.startsWith("mod:") && !rawKey.startsWith("sm:")) {
            return (ActiveEffect as any)._applyChangeUnguided.call(
                this,
                targetDoc,
                change,
                changes,
                opts,
            );
        }

        let key = rawKey;
        const useMod = key.startsWith("mod:");
        if (useMod) key = key.slice(4);
        const useSm = key.startsWith("sm:");
        if (useSm) key = key.slice(3);

        if (useSm) {
            return dispatchStrikeModeChange(targetDoc, change, key, useMod);
        }
        if (useMod) {
            return dispatchModifierChange(targetDoc, change, key);
        }
        return undefined;
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

/**
 * Map a Foundry `change.type` string to a SoHL `VALUE_DELTA_OPERATOR`.
 * Unknown types fall back to `ADD`. CUSTOM is only valid when the
 * ValueModifier has a `customFunction`.
 */
function changeTypeToOperator(type: string): string {
    switch (type) {
        case "add":       return VALUE_DELTA_OPERATOR.ADD;
        case "multiply":  return VALUE_DELTA_OPERATOR.MULTIPLY;
        case "override":  return VALUE_DELTA_OPERATOR.OVERRIDE;
        case "upgrade":   return VALUE_DELTA_OPERATOR.UPGRADE;
        case "downgrade": return VALUE_DELTA_OPERATOR.DOWNGRADE;
        case "custom":    return VALUE_DELTA_OPERATOR.CUSTOM;
        default:          return VALUE_DELTA_OPERATOR.ADD;
    }
}

/**
 * Push a `ValueDelta` constructed from the change directly onto the
 * `ValueModifier.deltas` array. Bypasses the `add/multiply/...` API so we
 * can use a stable `"SOHL.INFO.ActiveEffect"` name (the user-facing label
 * still surfaces through `effect.name` via the shortcode).
 */
function pushDeltaToValueModifier(vm: ValueModifier, change: any): void {
    const effectName = change?.effect?.name ?? "Active Effect";
    const shortcode = effectName.slice(0, 16);
    try {
        const delta = new ValueDelta({
            name: "SOHL.INFO.ActiveEffect",
            shortcode,
            op: changeTypeToOperator(String(change.type ?? "add")),
            value: String(change.value ?? 0),
        });
        // Remove any existing delta from this same effect, then push fresh.
        vm.deltas = vm.deltas.filter((d) => d.shortcode !== shortcode);
        vm.deltas.push(delta);
        // Mark the modifier dirty so the next `effective` access recomputes.
        (vm as any)._dirty = true;
    } catch (err) {
        sohl.log.warn("ActiveEffect delta construction failed:", {
            effect: effectName,
            change,
            error: err,
        });
    }
}

/**
 * Apply a `mod:<path>` change: locate the ValueModifier at `path` on the
 * target document (paths are doc-rooted, so e.g. `logic.score` resolves
 * to `targetDoc.logic.score`) and push a delta onto it.
 */
function dispatchModifierChange(
    targetDoc: any,
    change: any,
    path: string,
): unknown {
    const node = foundry.utils.getProperty(targetDoc, path);
    if (!(node instanceof ValueModifier)) {
        sohl.log.warn(
            `mod: change "${change.key}" did not resolve to a ValueModifier on ${targetDoc?.uuid ?? "<unknown>"}`,
        );
        return undefined;
    }
    pushDeltaToValueModifier(node, change);
    return undefined;
}

/**
 * Apply an `sm:<path>` or `mod:sm:<path>` change. For each strike mode on
 * the target weapon matching `change.strikeModePredicate`, either push a
 * delta (`useMod`) or assign the value directly (raw set).
 *
 * Predicate is a SafeExpression with the variable `sm` bound to each
 * candidate strike mode. Empty predicate matches every strike mode.
 * Predicate errors on a single strike mode are logged and that strike mode
 * is skipped; other strike modes continue.
 */
function dispatchStrikeModeChange(
    targetDoc: any,
    change: any,
    path: string,
    useMod: boolean,
): unknown {
    if (targetDoc?.type !== ITEM_KIND.WEAPONGEAR) return undefined;

    const predicateSrc: string | undefined = change?.strikeModePredicate;
    let predicate: SafeExpression | undefined;
    if (predicateSrc) {
        try {
            predicate = new SafeExpression(predicateSrc, STANDARD_HELPERS);
        } catch (err) {
            sohl.log.warn("strikeModePredicate failed to compile:", {
                source: predicateSrc,
                effect: change?.effect,
                error: err,
            });
            return undefined;
        }
    }

    const strikeModes: any[] = targetDoc.logic?.strikeModes ?? [];
    for (const sm of strikeModes) {
        if (predicate) {
            try {
                if (!predicate.evaluate({ sm })) continue;
            } catch (err) {
                sohl.log.warn(
                    `strikeModePredicate threw on ${targetDoc.uuid}:`,
                    { source: predicateSrc, error: err },
                );
                continue;
            }
        }
        if (useMod) {
            const node = foundry.utils.getProperty(sm, path);
            if (node instanceof ValueModifier) {
                pushDeltaToValueModifier(node, change);
            }
        } else {
            foundry.utils.setProperty(sm, path, change.value);
        }
    }
    return undefined;
}

function defineActiveEffectDataSchema(): foundry.data.fields.DataSchema {
    return {
        scope: new StringField({
            blank: false,
            initial: ACTIVE_EFFECT_SCOPE.THIS,
            // Dynamic so newly-registered item types are included automatically.
            choices: () => ActiveEffectScopeChoices(),
        }),
        test: new JavaScriptField({}),
        // SYNC: replicate of foundry-vtt-dev/common/data/active-effect.mjs
        // (v14). Keep key/type/value/phase/priority verbatim per the upstream
        // doc comment: "A system can override the changes SchemaField but
        // must preserve definitions for type, phase, and priority."
        // SoHL extension: strikeModePredicate (last field).
        changes: new ArrayField(
            new SchemaField({
                key: new StringField({ required: true }),
                type: new StringField({
                    required: true,
                    blank: false,
                    initial: "add",
                }),
                value: new AnyField({
                    required: true,
                    nullable: true,
                    initial: "",
                }),
                phase: new StringField({
                    required: true,
                    blank: false,
                    initial: "initial",
                }),
                priority: new NumberField(),
                // SoHL extension — only consulted when key matches ^(mod:)?sm:
                strikeModePredicate: new JavaScriptField({}),
            }),
        ),
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
    changes!: Array<{
        key: string;
        type: string;
        value: unknown;
        phase: string;
        priority?: number | null;
        strikeModePredicate?: string;
    }>;

    static override defineSchema(): foundry.data.fields.DataSchema {
        return defineActiveEffectDataSchema();
    }
}

const BaseAEConfig = foundry.applications.sheets.ActiveEffectConfig;
export class SohlActiveEffectSheet extends BaseAEConfig {
    static override PARTS = {
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
    override async _preparePartContext(
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
            case "details": {
                partContext.targetTypes = {};
                if (partContext.isActorEffect) {
                    partContext.targetTypes[ACTIVE_EFFECT_SCOPE.THIS] =
                        sohl.i18n.localize("EFFECT.ThisActor");
                } else {
                    partContext.targetTypes[ACTIVE_EFFECT_SCOPE.THIS] =
                        sohl.i18n.format("EFFECT.ThisItem", {
                            itemType:
                                (document.parent?.system as any)?.typeLabel,
                        });
                    partContext.targetTypes[ACTIVE_EFFECT_SCOPE.ACTOR] =
                        sohl.i18n.localize("EFFECT.Actor");
                }
                // Add an entry for each registered item kind.
                for (const [key, clazz] of Object.entries(
                    sohl.CONFIG.Item.dataModels,
                )) {
                    partContext.targetTypes[key] = (clazz as any).typeLabel;
                }
                break;
            }

            case "duration":
                // partContext.startTimeTemporal = new SohlTemporal(
                //     partContext.startTime,
                // );
                // partContext.endTimeTemporal = new SohlTemporal(
                //     partContext.endTime,
                // );
                break;

            case "changes": {
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
                // The `key` dropdown should reflect the EFFECT_KEY namespace
                // determined by `system.scope`:
                //   - "this": the parent doc's own type
                //   - "actor": the owning actor's type
                //   - <itemKind>: that item kind's metadata
                const scope = (document as any).system?.scope;
                let metadataType: string;
                if (scope === ACTIVE_EFFECT_SCOPE.THIS) {
                    metadataType = document.parent?.type ?? document.type;
                } else if (scope === ACTIVE_EFFECT_SCOPE.ACTOR) {
                    metadataType = (document as any).actor?.type ?? "";
                } else {
                    metadataType = scope ?? "";
                }
                const itemData =
                    metadataType in ITEM_METADATA ?
                        ITEM_METADATA[
                            metadataType as keyof typeof ITEM_METADATA
                        ]
                    :   undefined;
                partContext.keyChoices = (itemData as any)?.KeyChoices || [];
                // Surface the scope to the template so the strikeModePredicate
                // row can conditionally render for weapongear scope + sm: keys.
                partContext.scope = scope;
                break;
            }
        }
        return partContext as foundry.applications.api.ApplicationV2.RenderContextOf<this>;
    }
}
