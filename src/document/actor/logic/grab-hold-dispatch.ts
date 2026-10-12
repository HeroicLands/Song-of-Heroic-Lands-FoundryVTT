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

import { fvttCurrentUser, fvttWorldActors, getActiveCombat } from "@src/core/FoundryHelpers";
import type { SohlActor } from "@src/document/actor/foundry/SohlActor";
import type { BeingLogic } from "@src/document/actor/logic/BeingLogic";
import type { GrabTrialOffer } from "./grab-actions";
import type { GrabHoldState } from "@src/entity/body/grabHold";
import { releaseGrabHold } from "./grab-hold";

type HoldOffer = GrabTrialOffer & { hold?: GrabHoldState };
interface FlagReader {
    getFlag(scope: string, key: string): unknown;
}
const MAINTENANCE_ACTIONS = new Set([
    "beginMaintainGrabHold",
    "answerMaintainGrabHold",
    "releaseGrabHold",
    "editDocument",
    "answerGrabTrial",
    "automatedBlockResume",
    "automatedCounterstrikeResume",
    "automatedDodgeResume",
    "automatedIgnoreResume",
    "blockTest",
    "counterstrikeTest",
    "dodgeTest",
]);

/**
 * Enumerate world and combat token actors without conflating synthetic identities.
 * @returns Unique live Being actors.
 */
export function grabHoldActors(): SohlActor[] {
    const candidates = [
        ...fvttWorldActors(),
        ...[...(getActiveCombat()?.combatants ?? [])].map((c) => c.actor),
    ];
    return [
        ...new Map(
            candidates
                .filter((actor) => actor?.type === "being" && actor.documentName === "Actor")
                .map((actor) => [actor.uuid, actor as SohlActor]),
        ).values(),
    ];
}
/**
 * Read canonical target-owned Hold offers.
 * @returns Active offers owned by this target.
 * @param actor
 */
export function activeGrabHoldOffers(actor: SohlActor): HoldOffer[] {
    return Object.values(
        ((actor as unknown as FlagReader).getFlag("sohl", "grabOffers") as Record<
            string,
            HoldOffer
        >) ?? {},
    ).filter(
        (offer) => offer.id && offer.targetUuid === actor.uuid && offer.hold?.status === "active",
    );
}
/**
 * Await this at the action dispatch seam before executing a non-maintenance action.
 * @param actor
 * @param actionCode
 */
export async function beforeGrabHoldAction(
    actor: SohlActor | undefined,
    actionCode: string,
): Promise<void> {
    if (!actor?.isOwner || MAINTENANCE_ACTIONS.has(actionCode)) return;
    for (const target of grabHoldActors()) {
        for (const offer of activeGrabHoldOffers(target)) {
            if (
                offer.initiatorUuid !== actor.uuid ||
                offer.initiatorUserId !== fvttCurrentUser().id
            )
                continue;
            await releaseGrabHold(
                actor.logic as BeingLogic,
                { scope: { offerId: offer.id, targetUuid: target.uuid } } as any,
            );
        }
    }
}
