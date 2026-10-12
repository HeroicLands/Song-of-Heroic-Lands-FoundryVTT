/*
 * This file is part of the Song of Heroic Lands (SoHL) system for Foundry VTT.
 * Copyright (c) 2024-2026 Tom Rodriguez ("Toasty") — <toasty@heroiclands.org>
 *
 * This work is licensed under the GNU General Public License v3.0 (GPLv3).
 * You may copy, modify, and distribute it under the terms of that license.
 *
 * For full terms, see the LICENSE.md file in the project root or visit:
 * https://www.gnu.org/licenses/gpl-3.0.html
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { fvttCurrentUser, getActiveCombat, fvttHookOnError } from "@src/core/FoundryHelpers";
import {
    beforeGrabHoldAction,
    grabHoldActors,
    activeGrabHoldOffers,
} from "../logic/grab-hold-dispatch";
import type { SohlActor } from "@src/document/actor/foundry/SohlActor";
import type { BeingLogic } from "@src/document/actor/logic/BeingLogic";
import { reconcileGrabHolds, grabHoldTurnKey } from "../logic/grab-hold";
import { postActionCard } from "@src/document/chat/action-card";

const reminded = new Set<string>();
const pending = new Set<string>();
let reconciling: Promise<void> | undefined;
let reconcileDirty = false;
/**
 * Owner clients reconcile only their own affected target, even on another client's source update.
 * @returns A coalesced run that replays updates arriving during reconciliation.
 */
export function reconcileOwnedGrabHolds(): Promise<void> {
    reconcileDirty = true;
    if (!reconciling) {
        reconciling = Promise.resolve().then(async () => {
            try {
                do {
                    reconcileDirty = false;
                    for (const actor of grabHoldActors())
                        await reconcileGrabHolds(actor.logic as BeingLogic);
                } while (reconcileDirty);
            } finally {
                reconciling = undefined;
            }
        });
    }
    return reconciling;
}

/** Post only reminders and owner-addressed maintenance choices; never spend either turn. */
export async function offerGrabHoldTurn(): Promise<void> {
    const combat = getActiveCombat(),
        active = combat?.combatant?.actor;
    if (!combat || !active) return;
    const turn = `${combat.uuid}:${combat.round}:${combat.turn}`;
    for (const target of grabHoldActors()) {
        for (const offer of activeGrabHoldOffers(target)) {
            const targetTurn =
                active.uuid === target.uuid &&
                target.isOwner &&
                offer.targetUserId === fvttCurrentUser().id;
            const sourceTurn =
                active.uuid === offer.initiatorUuid &&
                active.isOwner &&
                offer.initiatorUserId === fvttCurrentUser().id &&
                grabHoldTurnKey(active.uuid) === turn;
            if (!targetTurn && !sourceTurn) continue;
            const key = `${offer.id}:${turn}:${targetTurn ? "pass" : "maintain"}:${fvttCurrentUser().id}`;
            if (reminded.has(key) || pending.has(key)) continue;
            pending.add(key);
            try {
                await postActionCard((active.logic as BeingLogic).speaker, {
                    content: "<p>{{localize message initiator=initiator target=target}}</p>",
                    data: {
                        initiator: active.name,
                        target: target.name,
                        message:
                            targetTurn ? "SOHL.Grab.holdPassReminder" : "SOHL.Grab.holdMaintenance",
                    },
                    buttons:
                        sourceTurn ?
                            [
                                {
                                    action: "beginMaintainGrabHold",
                                    handlerUuid: active.uuid,
                                    scope: { offerId: offer.id, targetUuid: target.uuid },
                                    label: sohl.i18n.localize("SOHL.Grab.maintainHold"),
                                    skipDialog: false,
                                },
                                {
                                    action: "releaseGrabHold",
                                    handlerUuid: active.uuid,
                                    scope: { offerId: offer.id, targetUuid: target.uuid },
                                    label: sohl.i18n.localize("SOHL.Grab.releaseHold"),
                                    skipDialog: true,
                                },
                            ]
                        :   undefined,
                });
                reminded.add(key);
            } finally {
                pending.delete(key);
            }
        }
    }
}
/** Observe actual token displacement, actor replication, and combat turn changes. */
export function registerGrabHoldHooks(): void {
    const run = (task: Promise<void>) =>
        task.catch((error) =>
            fvttHookOnError(
                "SoHL.GrabHold",
                error instanceof Error ? error : new Error(String(error)),
            ),
        );
    (Hooks as any).on(
        "updateToken",
        (token: { actor?: SohlActor }, changed: Record<string, unknown>) => {
            if (["x", "y", "elevation"].some((key) => key in changed))
                void run(
                    beforeGrabHoldAction(token.actor, "movement").then(reconcileOwnedGrabHolds),
                );
        },
    );
    (Hooks as any).on("updateActor", () => void run(reconcileOwnedGrabHolds()));
    (Hooks as any).on("updateItem", (item: { actor?: SohlActor }) => {
        if (item.actor) void run(reconcileOwnedGrabHolds());
    });
    (Hooks as any).on("updateCombat", (_combat: unknown, changed: Record<string, unknown>) => {
        if ("turn" in changed || "round" in changed)
            void run(reconcileOwnedGrabHolds().then(offerGrabHoldTurn));
    });
    (Hooks as any).on("deleteCombat", () => void run(reconcileOwnedGrabHolds()));
    // This registration runs inside ready itself; replay persisted holds now.
    void run(reconcileOwnedGrabHolds().then(offerGrabHoldTurn));
}

// Register at startup after Foundry has initialized document collections.
Hooks.once("ready", registerGrabHoldHooks);
