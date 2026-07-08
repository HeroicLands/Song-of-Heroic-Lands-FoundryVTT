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

import { buildActionScope } from "@src/utils/helpers";
import { dispatchChatCardAction } from "@src/document/chat/chat-card-dispatch";
import type { SohlActor } from "@src/document/actor/foundry/SohlActor";
import type { SohlActiveEffect } from "@src/document/effect/foundry/SohlActiveEffect";
import type { SohlContextMenu } from "@src/apps/foundry/SohlContextMenu";
import { SohlActionContext } from "@src/entity/action/SohlActionContext";
import type { SohlTriggerContext } from "@src/entity/event/event-trigger";
import { isScriptActionMutationAllowed } from "@src/entity/action/SohlAction";

// NOTE: The Foundry-free contracts (SohlItemLogic, SohlItemData, SohlItemBaseLogic)
// now live in src/document/item/logic/SohlItemBaseLogic.ts and are re-exported here.
/**
 * Base class for all Item documents in the SoHL system — affiliations,
 * afflictions, gear (armor, weapons, containers, misc, projectiles,
 * concoctions), combat techniques, mysteries, mystical abilities, skills,
 * traits, and traumas.
 *
 * Like {@link SohlActor}, the typed game-rules surface lives on the item's
 * logic object: prefer `item.logic` (equivalently `item.system.logic`) and the
 * typed `item.logic.data` ({@link SohlItemData}) over reaching into
 * `item.system` directly.
 */
export class SohlItem extends Item {
    /**
     * Get the logic object for this item.
     * @remarks
     * This is a convenience accessor to avoid having to access `this.system.logic`
     */
    get logic(): SohlItemLogic<any> {
        return (this.system as any).logic as SohlItemLogic<any>;
    }

    /**
     * Get the context menu options for a specific SohlItem document.
     * @param doc The SohlItem document to get context options for.
     * @returns The context menu options for the specified SohlItem document.
     */
    protected static _getContextOptions(
        doc: SohlItem,
    ): SohlContextMenu.Entry[] {
        return doc.getContextOptions();
    }

    /**
     * The context-menu options — the actions currently available — for this
     * item.
     *
     * @remarks
     * One entry per action whose `visible` predicate currently passes (an
     * action's `trigger` / domain preconditions can hide it); `SCRIPT` actions
     * are additionally permission-gated when executed. Use this to discover
     * which actions can be performed on the item.
     *
     * @returns The available context-menu entries.
     */
    getContextOptions(): SohlContextMenu.Entry[] {
        return this.logic.getContextOptions();
    }

    /**
     * Authoring gate: block non-GM users from adding, removing, or
     * modifying SCRIPT entries in `system.actionDefs`. SCRIPT actions
     * run unsandboxed JavaScript, so authorship is restricted to the GM.
     * INTRINSIC actions and non-actionDefs updates are unaffected.
     * @param changes - The changes about to be applied.
     * @param options - Foundry update options.
     * @param user - The user attempting the update.
     * @returns `false` to cancel the update, otherwise delegates to super.
     */
    protected override async _preUpdate(
        changes: PlainObject,
        options: PlainObject,
        user: User,
    ): Promise<boolean | void> {
        const allowed = await super._preUpdate(
            changes as any,
            options as any,
            user as any,
        );
        if (allowed === false) return false;
        const newActionDefs = (changes as any)?.system?.actionDefs;
        if (newActionDefs !== undefined) {
            const oldActionDefs = (this.system as any)?.actionDefs;
            if (
                !isScriptActionMutationAllowed(
                    oldActionDefs,
                    newActionDefs,
                    user,
                )
            ) {
                sohl.log.warn(
                    `Refusing actionDefs update on "${this.name}": only the GM may modify SCRIPT action entries.`,
                    { item: this.id, user: (user as any)?.id },
                );
                (globalThis as any).ui?.notifications?.warn?.(
                    "Only the GM can modify scripted actions on this item.",
                );
                return false;
            }
        }
        return undefined;
    }

    /**
     * Set of phases for which `applyActiveEffects` has already run in the
     * current data-preparation cycle. Cleared at the top of the actor's
     * `prepareBaseData()`. Mirrors Foundry's `Actor#_completedActiveEffectPhases`.
     */
    protected _completedActiveEffectPhases?: Set<string>;

    /**
     * Effects living elsewhere whose `targets` include this item. Walks
     * sibling items and the owning actor. Phaseless; the caller filters by
     * `change.phase` when iterating changes.
     * @returns The effects on siblings and the actor that target this item.
     */
    transferredActiveEffects(): SohlActiveEffect[] {
        const out: SohlActiveEffect[] = [];
        const actor = this.actor;
        if (!actor) return out;

        for (const sibling of actor.items.values() as Iterable<SohlItem>) {
            if (sibling === this) continue;
            for (const effect of sibling.effects.values() as Iterable<SohlActiveEffect>) {
                if (effect.targets.includes(this)) out.push(effect);
            }
        }
        for (const effect of actor.effects.values() as Iterable<SohlActiveEffect>) {
            if (effect.targets.includes(this)) out.push(effect);
        }
        return out;
    }

    /**
     * All effects applicable to this item: own self-targeting effects plus
     * those transferred from siblings / the actor via scope. Mirrors the
     * shape of Foundry's `Actor#allApplicableEffects` generator so the same
     * dispatch loop can consume both.
     */
    *allApplicableEffects(): Generator<SohlActiveEffect> {
        for (const effect of this.effects.values() as Iterable<SohlActiveEffect>) {
            if (effect.targets.includes(this)) yield effect;
        }
        for (const effect of this.transferredActiveEffects()) yield effect;
    }

    /**
     * Walk `allApplicableEffects()`, filter changes by `phase`, sort by
     * priority, and dispatch each to the static `applyChange` path
     * (which routes through `SohlActiveEffect._applyChangeUnguided` for
     * SoHL-prefixed keys). Mirrors Foundry's `Actor#applyActiveEffects`.
     * @param phase - The change phase whose effect changes to apply this pass.
     */
    applyActiveEffects(phase: string): void {
        const AEClass = foundry.documents.ActiveEffect as any;
        if (typeof phase !== "string") return;
        if (!(phase in (AEClass.CHANGE_PHASES ?? {}))) {
            sohl.log.warn(
                `Unknown phase "${phase}" passed to SohlItem.applyActiveEffects`,
            );
            return;
        }
        this._completedActiveEffectPhases ??= new Set<string>();
        if (this._completedActiveEffectPhases.has(phase)) return;
        this._completedActiveEffectPhases.add(phase);

        interface Pending {
            effect: SohlActiveEffect;
            change: any;
        }
        const pending: Pending[] = [];

        for (const effect of this.allApplicableEffects()) {
            if (!(effect as any).active) continue;
            const effectChanges =
                ((effect as any).system?.changes as any[]) ?? [];
            for (const change of effectChanges) {
                if (!change.key || change.phase !== phase) continue;
                pending.push({ effect, change });
            }
        }
        pending.sort(
            (a, b) =>
                ((a.change.priority as number) ?? 0) -
                ((b.change.priority as number) ?? 0),
        );

        for (const { effect, change } of pending) {
            try {
                const copy = foundry.utils.deepClone(change);
                (copy as any).effect = effect;
                (effect.constructor as any).applyChange(this, copy, {});
            } catch (err) {
                sohl.log.warn(
                    `Effect "${(effect as any).name}" change "${change.key}" failed on ${this.uuid}:`,
                    err as PlainObject,
                );
            }
        }
    }

    /**
     * Helper method to handle chat card button clicks.
     * @param btn The button element that was clicked.
     */
    async onChatCardButton(btn: HTMLElement): Promise<void> {
        const actionName = btn.dataset.action;
        if (!actionName) return;

        const context = new SohlActionContext({
            speaker: this.logic.speaker,
            type: actionName,
            title: btn.textContent?.trim() ?? actionName,
            scope: buildActionScope(
                btn.dataset,
                (this.logic as any).actorLogic ?? this.logic,
            ),
        });
        const action =
            this.logic.actions.get(actionName) ??
            [...this.logic.actions.values()].find(
                (act) =>
                    act.data.executor === actionName ||
                    act.data.title === actionName,
            );

        if (action) {
            await action.execute(context);
            return;
        }

        const fn = (this.logic as any)[actionName];
        if (typeof fn === "function") {
            await fn.call(this.logic, context);
        } else {
            sohl.log.warn(
                `Chat card action "${actionName}" not found on item "${this.name}".`,
            );
        }
    }

    /**
     * Helper method to handle chat card edit actions.
     * @param btn The button element that was clicked.
     */
    async onChatCardEditAction(btn: HTMLElement): Promise<void> {
        if (!this.isOwner) return;
        await dispatchChatCardAction(this.logic, btn);
    }

    /**
     * Handle a trigger dispatched by the SoHL event queue.
     * Override in subclasses to implement item-specific trigger handling.
     * @param kind - Subscription kind identifier
     * @param _context - Trigger context (discriminated by `context.name`)
     * @param _payload - Optional context data attached when subscribing
     */
    async handleSohlEvent(
        kind: string,
        _context: SohlTriggerContext,
        _payload?: Record<string, unknown>,
    ): Promise<void> {
        console.warn(
            `SoHL | ${this.name} (Item) received unhandled event "${kind}"`,
        );
    }

    /**
     * The SohlActor that owns this item, or null if it is unowned.
     */
    override get actor(): SohlActor | null {
        return this.parent;
    }
}

/*
 * The Foundry-free logic-layer contracts (SohlItemLogic, SohlItemData,
 * SohlItemBaseLogic) live in the logic layer; they are re-exported here so
 * Foundry-side consumers can keep importing them from this module.
 */
export {
    SohlItemBaseLogic,
    type SohlItemLogic,
    type SohlItemData,
} from "@src/document/item/logic/SohlItemBaseLogic";
import type { SohlItemLogic } from "@src/document/item/logic/SohlItemBaseLogic";
