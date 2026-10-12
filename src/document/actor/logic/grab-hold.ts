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

import {
    dialog,
    fvttCurrentUser,
    fvttRandomId,
    fvttResolveUuid,
    getActiveCombat,
} from "@src/core/FoundryHelpers";
import type { SohlActor } from "@src/document/actor/foundry/SohlActor";
import type { BeingLogic } from "@src/document/actor/logic/BeingLogic";
import type { SohlActionContext } from "@src/entity/action/SohlActionContext";
import type { GrabTrialOffer, GrabTrialScope } from "./grab-actions";
import {
    canAnswerHold,
    holdLocation,
    holdExpired,
    nextHoldMaintenanceRound,
    type GrabHoldState,
} from "@src/entity/body/grabHold";
import { StrikeModeBase } from "@src/entity/strikemode/StrikeModeBase";
import { IMMOBILIZED_CODE } from "@src/entity/body/impairment";
import { SimpleRoll } from "@src/entity/roll/SimpleRoll";
import { resolveStrengthTrial, type StrengthTrialSide } from "@src/entity/strikemode/strengthTrial";
import { toFilePath } from "@src/utils/helpers";
// eslint-disable-next-line @typescript-eslint/no-restricted-imports
import { postActionCard } from "@src/document/chat/action-card";

interface FlagPort {
    getFlag(scope: string, key: string): unknown;
    setFlag(scope: string, key: string, value: unknown): Promise<unknown>;
}
type HoldOffer = GrabTrialOffer & { hold?: GrabHoldState };
interface Maintenance {
    revision: number;
    turnKey: string;
    initiator: StrengthTrialSide;
}
const busy = new Set<string>();
const endings = new Map<string, Promise<void>>();
const port = (actor: SohlActor): FlagPort => actor as unknown as FlagPort;
const owned = (actor: SohlActor, user: string) => actor.isOwner && fvttCurrentUser().id === user;
/**
 * Resolve only a live Being actor.
 * @returns The addressed Being, when it still exists.
 * @param uuid
 */
function actorAt(uuid: string): SohlActor | undefined {
    const actor = fvttResolveUuid(uuid) as SohlActor | undefined;
    return actor?.documentName === "Actor" && actor.type === "being" ? actor : undefined;
}
/**
 * Read a target-owned offer with matching identity.
 * @returns The canonical offer, when its identity matches.
 * @param actor
 * @param id
 */
function offerAt(actor: SohlActor, id: string): HoldOffer | undefined {
    const offer = port(actor).getFlag("sohl", `grabOffers.${id}`) as HoldOffer | undefined;
    return offer?.id === id && offer.targetUuid === actor.uuid ? offer : undefined;
}
/**
 * Committed grabbing limbs must remain free and usable throughout the hold.
 * @returns Whether every committed limb remains available.
 * @param source
 * @param offer
 */
function limbsLive(source: SohlActor, offer: HoldOffer): boolean {
    const codes = offer.settled?.choice.partCodes;
    const parts = (source.logic as BeingLogic).body?.structure.parts ?? [];
    const mode = StrikeModeBase.fromPointerData(offer.mode);
    if (!mode || mode.parent.actor?.uuid !== source.uuid) return false;
    const roles = (mode.parent.data as { impairedByRoles?: string[] }).impairedByRoles ?? [];
    const weaponId = (mode.parent as { item?: { id: string } }).item?.id;
    return (
        !!codes?.length &&
        codes.every((code) =>
            parts.some((part) => {
                if (part.shortcode !== code || part.immobilized || part.isUnusable) return false;
                if (mode.shortcode === "grab") return part.canHoldItem && !part.heldItemId;
                if (roles.length) return part.roles.some((role) => roles.includes(role));
                return part.canHoldItem && (!part.heldItemId || part.heldItemId === weaponId);
            }),
        )
    );
}

/**
 * Current grabber turn, bound to the combat identity as well as round and turn.
 * @returns A live grabber turn key, or undefined on another actor’s turn.
 * @param actorUuid
 */
export function grabHoldTurnKey(actorUuid: string | null): string | undefined {
    const combat = getActiveCombat();
    if (!actorUuid || combat?.combatant?.actor?.uuid !== actorUuid) return undefined;
    return `${combat.uuid}:${combat.round}:${combat.turn}`;
}
const released = (source: SohlActor, id: string) =>
    !!port(source).getFlag("sohl", `grabHoldReleased.${id}`);
/**
 * Persist the target-owned lifecycle record.
 * @param target
 * @param offer
 */
async function save(target: SohlActor, offer: HoldOffer): Promise<void> {
    await port(target).setFlag("sohl", `grabOffers.${offer.id}`, offer);
}
/**
 * Delete only the marked Hold condition and record terminal state.
 * @param target
 * @param offer
 * @returns Completion of the shared condition cleanup.
 */
async function end(target: SohlActor, offer: HoldOffer): Promise<void> {
    const hold = offer.hold;
    if (!hold || hold.status === "ended") return;
    const key = `${target.uuid}:${hold.traumaId}`;
    const current = endings.get(key);
    if (current) {
        await current;
        return;
    }
    const task = Promise.resolve().then(async () => {
        if (hold.status !== "ending")
            await save(target, { ...offer, hold: { ...hold, status: "ending" } });
        const trauma = target.items.get(hold.traumaId);
        const identity = trauma && port(trauma as unknown as SohlActor).getFlag("sohl", "grabHold");
        if (identity === offer.id) await target.deleteEmbeddedDocuments("Item", [hold.traumaId]);
        await save(target, { ...offer, hold: { ...hold, status: "ended" } });
    });
    endings.set(key, task);
    try {
        await task;
    } finally {
        if (endings.get(key) === task) endings.delete(key);
    }
}

/**
 * Target owner confirms the Immobilized condition. Grip fields are never touched.
 * @param logic
 * @param context
 */
export async function applyGrabHold(
    logic: BeingLogic,
    context: SohlActionContext<Partial<GrabTrialScope>>,
): Promise<void> {
    const target = logic.actor;
    const id = context.scope.offerId;
    if (!target?.uuid || !id || context.scope.targetUuid !== target.uuid) return;
    let offer = offerAt(target, id);
    if (!offer?.settled || !owned(target, offer.targetUserId)) return;
    const source = actorAt(offer.initiatorUuid);
    if (
        !source ||
        !limbsLive(source, offer) ||
        released(source, id) ||
        offer.hold?.status === "ended"
    )
        return;
    const key = `${target.uuid}:${id}`;
    if (busy.has(key)) return;
    busy.add(key);
    try {
        if (!offer.hold) {
            const location = holdLocation(offer.settled, logic.body?.structure.parts ?? []);
            if (!location) return;
            const confirmed = await dialog({
                title: sohl.i18n.localize("SOHL.Grab.applyHold"),
                template: toFilePath("systems/sohl/templates/dialog/grab-hold-confirm.hbs"),
                data: { initiator: source.name, target: target.name },
            });
            if (
                !confirmed ||
                !owned(target, offer.targetUserId) ||
                !limbsLive(source, offer) ||
                released(source, id)
            )
                return;
            const live = offerAt(target, id);
            if (
                !live?.settled ||
                live.hold ||
                holdLocation(live.settled, logic.body.structure.parts) !== location
            )
                return;
            const combat = getActiveCombat();
            offer = {
                ...live,
                hold: {
                    traumaId: fvttRandomId(),
                    bodyLocationCode: location,
                    status: "prepared",
                    revision: 0,
                    combatUuid: combat?.uuid ?? undefined,
                    dueRound:
                        combat ?
                            nextHoldMaintenanceRound(
                                combat.round ?? 0,
                                combat.turn ?? 0,
                                combat.turns.findIndex((c) => c.actor?.uuid === source.uuid),
                            )
                        :   undefined,
                },
            };
            await save(target, offer);
        }
        const hold = offer.hold!;
        if (hold.status === "active") return;
        if (hold.status !== "prepared") {
            await end(target, offer);
            return;
        }
        const existing = target.items.get(hold.traumaId);
        if (existing && port(existing as unknown as SohlActor).getFlag("sohl", "grabHold") !== id)
            return;
        if (!existing)
            await target.createEmbeddedDocuments(
                "Item",
                [
                    {
                        _id: hold.traumaId,
                        name: sohl.i18n.localize("SOHL.Grab.immobilized"),
                        type: "trauma",
                        system: {
                            subType: "physcond",
                            shortcode: IMMOBILIZED_CODE,
                            bodyLocationCode: hold.bodyLocationCode,
                        },
                        flags: { sohl: { grabHold: id } },
                    },
                ],
                { keepId: true },
            );
        await save(target, { ...offer, hold: { ...hold, status: "active" } });
    } finally {
        busy.delete(key);
    }
}
/**
 * Commit only the grabber's maintenance die, once per live turn and revision.
 * @param logic
 * @param context
 */
export async function beginMaintainGrabHold(
    logic: BeingLogic,
    context: SohlActionContext<Partial<GrabTrialScope>>,
): Promise<void> {
    const source = logic.actor,
        id = context.scope.offerId;
    const target = context.scope.targetUuid ? actorAt(context.scope.targetUuid) : undefined;
    const offer = target && id ? offerAt(target, id) : undefined;
    if (
        !source?.uuid ||
        !id ||
        !target ||
        !offer?.hold ||
        offer.hold.status !== "active" ||
        offer.initiatorUuid !== source.uuid ||
        !owned(source, offer.initiatorUserId) ||
        released(source, id) ||
        !limbsLive(source, offer)
    )
        return;
    const turnKey = grabHoldTurnKey(source.uuid);
    if (!turnKey || offer.hold.lastTurnKey === turnKey) return;
    const key = `${source.uuid}:${id}`;
    if (busy.has(key)) return;
    busy.add(key);
    try {
        const flagKey = `grabHoldMaintenance.${id}`;
        let request = port(source).getFlag("sohl", flagKey) as Maintenance | undefined;
        if (request?.revision !== offer.hold.revision || request.turnKey !== turnKey) {
            const confirmed = await dialog({
                title: sohl.i18n.localize("SOHL.Grab.maintainHold"),
                template: toFilePath("systems/sohl/templates/dialog/grab-hold-confirm.hbs"),
                data: { initiator: source.name, target: target.name },
            });
            if (
                !confirmed ||
                !owned(source, offer.initiatorUserId) ||
                !limbsLive(source, offer) ||
                offerAt(target, id)?.hold?.revision !== offer.hold.revision ||
                grabHoldTurnKey(source.uuid) !== turnKey ||
                released(source, id)
            )
                return;
            const strength = logic.getItemLogic("str", "attribute")?.score?.effective;
            if (strength == null) return;
            request = {
                revision: offer.hold.revision,
                turnKey,
                initiator: {
                    strength,
                    die: new SimpleRoll({ numDice: 1, dieFaces: 6 }, { parent: logic }).roll(),
                    modifiers: offer.settled!.initiator.modifiers,
                },
            };
            await port(source).setFlag("sohl", flagKey, request);
        }
        await postActionCard(logic.speaker, {
            template: toFilePath("systems/sohl/templates/chat/grab-hold-maintain.hbs"),
            data: { initiator: source.name, target: target.name },
            buttons: [
                {
                    action: "answerMaintainGrabHold",
                    handlerUuid: offer.targetUuid,
                    scope: { offerId: id, targetUuid: target.uuid },
                    label: sohl.i18n.localize("SOHL.Grab.answer"),
                    skipDialog: false,
                },
            ],
        });
    } finally {
        busy.delete(key);
    }
}
/**
 * Target owner answers maintenance; loss removes only this Hold's marked condition.
 * @param logic
 * @param context
 */
export async function answerMaintainGrabHold(
    logic: BeingLogic,
    context: SohlActionContext<Partial<GrabTrialScope>>,
): Promise<void> {
    const target = logic.actor,
        id = context.scope.offerId;
    if (!target?.uuid || !id || target.uuid !== context.scope.targetUuid) return;
    const offer = offerAt(target, id),
        source = offer && actorAt(offer.initiatorUuid);
    if (!offer?.hold || !source || !owned(target, offer.targetUserId)) return;
    if (released(source, id) || offer.hold.status === "ending") {
        await end(target, offer);
        return;
    }
    const request = port(source).getFlag("sohl", `grabHoldMaintenance.${id}`) as
        Maintenance | undefined;
    if (!request || !canAnswerHold(offer.hold, request, grabHoldTurnKey(source.uuid))) return;
    const key = `${target.uuid}:${id}`;
    if (busy.has(key)) return;
    busy.add(key);
    try {
        const confirmed = await dialog({
            title: sohl.i18n.localize("SOHL.Grab.answer"),
            template: toFilePath("systems/sohl/templates/dialog/grab-hold-confirm.hbs"),
            data: { initiator: source.name, target: target.name },
        });
        const live = offerAt(target, id);
        const liveRequest = port(source).getFlag("sohl", `grabHoldMaintenance.${id}`);
        if (
            JSON.stringify(liveRequest) !== JSON.stringify(request) ||
            !confirmed ||
            !owned(target, offer.targetUserId) ||
            !limbsLive(source, offer) ||
            !live?.hold ||
            !canAnswerHold(live.hold, request, grabHoldTurnKey(source.uuid)) ||
            released(source, id)
        )
            return;
        const strength = logic.getItemLogic("str", "attribute")?.score?.effective;
        if (strength == null) return;
        const outcome = resolveStrengthTrial({
            initiator: request.initiator,
            target: {
                strength,
                die: new SimpleRoll({ numDice: 1, dieFaces: 6 }, { parent: logic }).roll(),
            },
        });
        // Persist the answer before condition cleanup, so interruption cannot reroll.
        const updated: HoldOffer = {
            ...live,
            hold: {
                ...live.hold,
                status: outcome.initiatorWins ? "active" : "ending",
                revision: live.hold.revision + 1,
                lastTurnKey: request.turnKey,
                dueRound: (getActiveCombat()?.round ?? 0) + 1,
            },
        };
        await save(target, updated);
        if (!outcome.initiatorWins) await end(target, updated);
    } finally {
        busy.delete(key);
    }
}
/**
 * Source owner relinquishes control; the target owner performs the actual cleanup.
 * @param logic
 * @param context
 */
export async function releaseGrabHold(
    logic: BeingLogic,
    context: SohlActionContext<Partial<GrabTrialScope>>,
): Promise<void> {
    const source = logic.actor,
        id = context.scope.offerId;
    const target = context.scope.targetUuid ? actorAt(context.scope.targetUuid) : undefined;
    const offer = target && id ? offerAt(target, id) : undefined;
    if (
        !source?.uuid ||
        !id ||
        !target ||
        !offer ||
        offer.initiatorUuid !== source.uuid ||
        !owned(source, offer.initiatorUserId)
    )
        return;
    await port(source).setFlag("sohl", `grabHoldReleased.${id}`, true);
    if (owned(target, offer.targetUserId)) await end(target, offer);
}
/**
 * Target-owner hooks reconcile released holds without mutating another owner's actor.
 * @param logic
 */
export async function reconcileGrabHolds(logic: BeingLogic): Promise<void> {
    const target = logic.actor;
    if (!target) return;
    const offers = port(target).getFlag("sohl", "grabOffers") as
        Record<string, HoldOffer> | undefined;
    for (const offer of Object.values(offers ?? {})) {
        if (!owned(target, offer.targetUserId) || !offer.hold || offer.hold.status === "ended")
            continue;
        const source = actorAt(offer.initiatorUuid);
        const combat = getActiveCombat();
        const expired = holdExpired(
            offer.hold,
            combat?.uuid ?
                {
                    uuid: combat.uuid,
                    round: combat.round ?? 0,
                    turn: combat.turn ?? 0,
                    sourceTurn: combat.turns.findIndex(
                        (c) => c.actor?.uuid === offer.initiatorUuid,
                    ),
                }
            :   undefined,
        );
        if (
            expired ||
            !source ||
            !limbsLive(source, offer) ||
            released(source, offer.id) ||
            offer.hold.status === "ending"
        )
            await end(target, offer);
    }
}
