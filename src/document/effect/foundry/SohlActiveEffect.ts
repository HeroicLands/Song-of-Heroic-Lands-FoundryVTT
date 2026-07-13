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
    STRIKE_MODE_TYPE,
    isItemKind,
    type ItemKind,
    ItemKinds,
} from "@src/utils/constants";
import { SafeExpression } from "@src/entity/expr/SafeExpression";
import { ValueModifier } from "@src/entity/modifier/ValueModifier";
import type { StrikeModeBase } from "@src/entity/strikemode/StrikeModeBase";
import { pushDeltaToValueModifier } from "@src/document/effect/logic/effect-logic";

/** The two strike-mode scopes, mapped to their `STRIKE_MODE_TYPE`. */
const STRIKE_MODE_SCOPES: Record<string, string> = {
    [ACTIVE_EFFECT_SCOPE.MELEE_STRIKE_MODE]: STRIKE_MODE_TYPE.MELEE,
    [ACTIVE_EFFECT_SCOPE.MISSILE_STRIKE_MODE]: STRIKE_MODE_TYPE.MISSILE,
};

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
     *   evaluates truthy. The predicate is a SafeExpression with `itemLogic`
     *   bound to each candidate's logic.
     * - `"meleestrikemode"` / `"missilestrikemode"`: every owning-actor item
     *   that carries at least one strike mode of that type passing the
     *   `system.test` predicate (bound `itemLogic` + `sm`); the change is then
     *   applied to each matching strike mode at application time.
     *
     * An empty `system.test` matches all candidates. Errors compiling the
     * predicate produce a warning and no matches; errors evaluating it for an
     * individual candidate skip that candidate only.
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
        if (scope in STRIKE_MODE_SCOPES) {
            // The document targets are the items carrying a matching strike
            // mode; the strike modes themselves are re-selected at apply time.
            const matched: SohlItem[] = [];
            for (const item of this.actor.items.values() as Iterable<SohlItem>) {
                if (this.matchingStrikeModes(item).length > 0) {
                    matched.push(item);
                }
            }
            return matched;
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
     * Compile `system.test` into a SafeExpression, or `undefined` when the
     * test is empty (which matches every candidate). Returns `null` when the
     * source fails to compile (matches nothing), having logged a warning.
     *
     * @returns The compiled predicate, `undefined` (match all), or `null` (error).
     */
    protected _compileTest(): SafeExpression | undefined | null {
        const script = this.system.test;
        if (!script) return undefined;
        try {
            return new SafeExpression(
                { source: script },
                { parent: this.actor.logic },
            );
        } catch (err) {
            sohl.log.warn("Failed to compile test script on Active Effect:", {
                test: script,
                effect: this,
                error: err,
            });
            return null;
        }
    }

    /**
     * Walk the owning actor's items of the given kind and return those for
     * which `system.test` (a SafeExpression with `itemLogic` bound to the
     * item's logic) evaluates truthy. An empty `system.test` matches every
     * item of that kind.
     *
     * @param itemKind - The item kind to filter the actor's items by.
     * @returns The matching items (all of the kind when no test is set).
     */
    protected _resolveItemTypeTargets(itemKind: ItemKind): SohlItem[] {
        if (!this.actor) return [];
        const items = this.actor.items.values() as Iterable<SohlItem>;
        const expression = this._compileTest();
        if (expression === null) return [];
        const matched: SohlItem[] = [];

        for (const item of items) {
            if (item.type !== itemKind) continue;
            if (!expression) {
                matched.push(item);
                continue;
            }
            try {
                if (expression.evaluate({ itemLogic: item.logic }))
                    matched.push(item);
            } catch (err) {
                sohl.log.warn(
                    "Test script threw on Active Effect evaluation:",
                    { test: this.system.test, effect: this, item, error: err },
                );
            }
        }
        return matched;
    }

    /**
     * The strike modes on `item` that this effect targets: those of the
     * scope's type (`meleestrikemode` → melee, `missilestrikemode` → missile)
     * for which `system.test` evaluates truthy. The predicate is a
     * SafeExpression with `itemLogic` (the owning item's logic) and `sm` (the
     * strike mode) bound. An empty `system.test` matches every strike mode of
     * the type. Empty when the effect's scope is not a strike-mode scope.
     *
     * @param item - The item whose strike modes to filter.
     * @returns The matching strike modes.
     */
    matchingStrikeModes(item: SohlItem): StrikeModeBase[] {
        const smType = STRIKE_MODE_SCOPES[this.system.scope];
        if (!smType) return [];
        const strikeModes: StrikeModeBase[] =
            (item.logic as any)?.strikeModes ?? [];
        if (!strikeModes.length) return [];

        const expression = this._compileTest();
        if (expression === null) return [];
        const itemLogic = item.logic;
        const matched: StrikeModeBase[] = [];
        for (const sm of strikeModes) {
            if ((sm as any).type !== smType) continue;
            if (!expression) {
                matched.push(sm);
                continue;
            }
            try {
                if (expression.evaluate({ itemLogic, sm })) matched.push(sm);
            } catch (err) {
                sohl.log.warn(
                    "Test script threw on strike-mode Active Effect evaluation:",
                    { test: this.system.test, effect: this, sm, error: err },
                );
            }
        }
        return matched;
    }

    /**
     * SoHL-specific change dispatcher. Routes by the effect's scope and key:
     *
     * - **Strike-mode scope** (`meleestrikemode` / `missilestrikemode`): the
     *   change's `mod:<path>` is applied to each strike mode on `targetDoc`
     *   matching the effect (see {@link matchingStrikeModes}) — a `ValueDelta`
     *   pushed onto the `ValueModifier` at `<path>` on the strike mode.
     * - **`mod:<path>`**: push a `ValueDelta` onto the `ValueModifier` at
     *   `<path>` on `targetDoc` (paths are doc-rooted, e.g. `logic.score`).
     * - Any other key falls through to Foundry's stock implementation.
     *
     * @param targetDoc - The document the change is being applied to.
     * @param change - The effect change being applied (carries `change.effect`).
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
        const effect: SohlActiveEffect | undefined = change?.effect;
        const scope: string | undefined = effect?.system?.scope;

        // Strike-mode scope: apply the change to each matching strike mode on
        // the target item rather than to the item document itself.
        if (effect && scope && scope in STRIKE_MODE_SCOPES) {
            return applyStrikeModeChange(effect, targetDoc, change);
        }

        if (!rawKey.startsWith("mod:")) {
            return (ActiveEffect as any)._applyChangeUnguided.call(
                this,
                targetDoc,
                change,
                changes,
                opts,
            );
        }
        return dispatchModifierChange(targetDoc, change, rawKey.slice(4));
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
 * Apply a strike-mode-scoped `mod:<path>` change. For each strike mode on
 * `targetDoc` matching the effect (its scope's type plus the `system.test`
 * predicate — see {@link SohlActiveEffect.matchingStrikeModes}), push a
 * `ValueDelta` onto the `ValueModifier` at `<path>` on that strike mode.
 *
 * @param effect - The active effect (supplies the matching strike modes).
 * @param targetDoc - The target item document carrying the strike modes.
 * @param change - The effect change to apply; its key must be `mod:<path>`.
 * @returns Always `undefined`; strike modes are mutated in place.
 */
function applyStrikeModeChange(
    effect: SohlActiveEffect,
    targetDoc: any,
    change: any,
): unknown {
    const rawKey: string = change?.key ?? "";
    if (!rawKey.startsWith("mod:")) return undefined;
    const path = rawKey.slice(4);
    for (const sm of effect.matchingStrikeModes(targetDoc)) {
        const node = foundry.utils.getProperty(sm, path);
        if (node instanceof ValueModifier) {
            pushDeltaToValueModifier(node, change);
        } else {
            sohl.log.warn(
                `strike-mode change "${change.key}" did not resolve to a ValueModifier on a ${effect.system.scope} of ${targetDoc?.uuid ?? "<unknown>"}`,
            );
        }
    }
    return undefined;
}
