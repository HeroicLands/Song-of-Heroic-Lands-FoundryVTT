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
import type { SohlContextMenu } from "@src/apps/foundry/SohlContextMenu";
import {
    ACTIVE_EFFECT_SCOPE,
    ITEM_KIND,
    isItemKind,
    type ItemKind,
    ItemKinds,
} from "@src/utils/constants";
import { SafeExpression } from "@src/entity/expr/SafeExpression";
import { ValueModifier } from "@src/entity/modifier/ValueModifier";
import { pushDeltaToValueModifier } from "@src/document/effect/logic/effect-logic";

/**
 * SoHL's Active Effect document. Resolves its owning item/actor and applies
 * effect changes through the system's modifier pipeline.
 */
export class SohlActiveEffect extends ActiveEffect {
    /** The owning {@link SohlItem} when the effect is on an item, else `null`. */
    get item(): SohlItem | null {
        return ItemKinds.includes(this.parent?.type as any) ?
                (this.parent as SohlItem)
            :   null;
    }

    /** The owning {@link SohlActor} (the item's actor, or the actor parent). */
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
     *
     * @param itemKind - The item kind to filter the actor's items by.
     * @returns The matching items (all of the kind when no test is set).
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
            expression = new SafeExpression(
                { source: script },
                { parent: this.actor.logic },
            );
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
     *
     * @param targetDoc - The document the change is being applied to.
     * @param change - The effect change being applied.
     * @param changes - Accumulator of applied changes (passed through to stock
     *   Foundry handling for non-SoHL keys).
     * @param opts - Foundry change-application options.
     * @param opts.replacementData - Optional replacement data forwarded to the
     *   stock handler.
     * @param opts.modifyTarget - Whether the target document should be modified.
     * @returns The result of the routed handler, or `undefined` when no SoHL
     *   handler applies.
     */
    protected static _applyChangeUnguided(
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
     * Get the context menu options for a specific SohlActiveEffect document.
     * @param doc - The active-effect document to get context options for.
     * @returns The context menu options for the specified document.
     */
    protected static _getContextOptions(
        doc: SohlActiveEffect,
    ): SohlContextMenu.Entry[] {
        return doc.getContextOptions();
    }

    /**
     * The context-menu options — the actions currently available — for this
     * Active Effect.
     *
     * @remarks
     * One entry per action whose `visible` predicate currently passes (an
     * action's `trigger` / domain preconditions can hide it); `SCRIPT` actions
     * are additionally permission-gated when executed. Use this to discover
     * which actions can be performed on the effect.
     *
     * @returns The available context-menu entries.
     */
    getContextOptions(): SohlContextMenu.Entry[] {
        return [];
    }
}

/**
 * Apply a `mod:<path>` change: locate the ValueModifier at `path` on the
 * target document (paths are doc-rooted, so e.g. `logic.score` resolves
 * to `targetDoc.logic.score`) and push a delta onto it.
 *
 * @param targetDoc - The document whose modifier is being changed.
 * @param change - The effect change to apply.
 * @param path - The doc-rooted property path to the target ValueModifier.
 * @returns Always `undefined`; the modifier is mutated in place.
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
 *
 * @param targetDoc - The target weapon document (must be `WEAPONGEAR`).
 * @param change - The effect change to apply, carrying the strike-mode predicate.
 * @param path - The strike-mode-rooted property path to set or modify.
 * @param useMod - When `true`, push a delta; otherwise assign the value directly.
 * @returns Always `undefined`; strike modes are mutated in place.
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
            predicate = new SafeExpression(
                { source: predicateSrc },
                { parent: targetDoc.logic },
            );
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
