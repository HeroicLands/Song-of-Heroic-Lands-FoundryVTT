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

import { dialog, fvttCurrentUser, fvttRandomId, fvttResolveUuid } from "@src/core/FoundryHelpers";
import type { SohlItem } from "@src/document/item/foundry/SohlItem";
import type { SohlActor } from "@src/document/actor/foundry/SohlActor";
import type { BeingLogic } from "@src/document/actor/logic/BeingLogic";
import type { CombatResult } from "@src/entity/result/CombatResult";
import type { SohlActionContext } from "@src/entity/action/SohlActionContext";
import type { SohlSpeaker } from "@src/core/logic/SohlSpeaker";
import { SimpleRoll } from "@src/entity/roll/SimpleRoll";
import { StrikeModeBase } from "@src/entity/strikemode/StrikeModeBase";
import { planGrabTake } from "@src/entity/body/grabTake";
import { bodyPartSide } from "@src/entity/body/laterality";
import {
    answerGrabTrial,
    isGrabTrialMode,
    prepareGrabTrial,
    type GrabTrialChoice,
    type PendingGrabTrial,
    type SettledGrabTrial,
} from "@src/entity/strikemode/grabTrial";
import { toFilePath } from "@src/utils/helpers";
// eslint-disable-next-line @typescript-eslint/no-restricted-imports
import { postActionCard } from "@src/document/chat/action-card";

/** Canonical target-owned offer; button scopes carry only its id and actor UUID. */
export interface GrabTrialOffer {
    /** Fresh request id, shared by the two owner-controlled records. */
    id: string;
    /** Actor and controller who initiated the successful melee attack. */
    initiatorUuid: string;
    initiatorUserId: string;
    /** Actor and controller who answered the melee attack. */
    targetUuid: string;
    targetUserId: string;
    /** Actual initiating mode, resolved afresh before rolling. */
    mode: StrikeModeBase.PointerData;
    /** Actual struck part, resolved before any trial choices. */
    targetPartCode: string;
    /** Earned Impact TAs available for the owner to spend. */
    availableTA: number;
    /** Offer stays live until the target answers or dismisses it. */
    status: "offered" | "settled";
    /** Once settled, the immutable target-owned trial outcome. */
    settled?: SettledGrabTrial;
    /** Target-owned escrow survives interrupted inventory handoffs. */
    take?: {
        status: "prepared" | "released";
        sourceIds: string[];
        /** Original source documents, retained to refuse replacement or modified-item retries. */
        sourceItems: Record<string, PlainObject>;
        rootId: string;
        items: PlainObject[];
        carriedIds: string[];
    };
}

/** Only lookup keys cross the card boundary; all other fields are read from flags. */
export interface GrabTrialScope {
    offerId: string;
    targetUuid: string;
}

/** Lookup keys for an offer awaiting the affected actor's owner. */
export interface GrabTrialActivationScope extends GrabTrialScope {
    initiatorUuid: string;
}

/** Source-owned exchange snapshot, before the target accepts their offer. */
type GrabTrialActivation = Omit<GrabTrialOffer, "status" | "settled" | "take">;

/** Foundry's extensible flags port; upstream typings only enumerate core flags. */
interface GrabFlagDocument {
    getFlag(scope: string, key: string): unknown;
    setFlag(scope: string, key: string, value: unknown): Promise<unknown>;
}

/**
 * Typed boundary for participant-owned flags.
 * @param actor - Actor or item carrying extensible system flags.
 * @returns The document flag port.
 */
function flags(actor: SohlActor | SohlItem): GrabFlagDocument {
    return actor as unknown as GrabFlagDocument;
}

const active = new Set<string>();

/**
 * Revalidate owner and bound controller before any dialog, roll or write.
 * @param actor - Live participant actor.
 * @param userId - Controller bound to this request.
 * @returns Whether this client may act for that participant.
 */
function authorized(actor: SohlActor, userId: string): boolean {
    return actor.isOwner && fvttCurrentUser().id === userId;
}

/**
 * Resolve the live actor addressed by a persisted record.
 * @param uuid - Canonical actor identity.
 * @returns A live Being actor, if present.
 */
function actorAt(uuid: string): SohlActor | undefined {
    const actor = fvttResolveUuid(uuid) as SohlActor | undefined;
    return actor?.documentName === "Actor" && actor.type === "being" ? actor : undefined;
}

/**
 * Read the target-owned canonical offer.
 * @param target - Actor owning the request.
 * @param id - Request identifier.
 * @returns A matching offer, if present.
 */
function readOffer(target: SohlActor, id: string): GrabTrialOffer | undefined {
    const offer = flags(target).getFlag("sohl", `grabOffers.${id}`) as GrabTrialOffer | undefined;
    return offer?.id === id && offer.targetUuid === target.uuid ? offer : undefined;
}

/**
 * Offer a Grab trial after a successful attack or winning counterstrike.
 * The affected owner creates the canonical offer; a winning counterstriker can
 * record an activation on their own actor and invite the affected owner first.
 * This creates no injury and rolls no trial dice.
 * @param result - Evaluated exchange with live mode/participant pointers.
 * @param speaker - Current client's posting speaker.
 */
export async function offerGrabTrial(result: CombatResult, speaker: SohlSpeaker): Promise<void> {
    const counterstrike = result.targetWins && result.defenderLandsBlow;
    const attack =
        counterstrike ? (result.defendResult as typeof result.attackResult) : result.attackResult;
    if ((!counterstrike && !result.attackerLandsBlow) || !isGrabTrialMode(attack.mode)) return;
    const initiator = attack.token?.actor;
    const target = (counterstrike ? result.attackResult : result.defendResult).token?.actor;
    const mode = attack.mode;
    if (!initiator?.uuid || !target?.uuid || !mode) return;
    const body = (target.logic as BeingLogic).body?.structure;
    if (!body) return;
    const aimedCode = attack.aimBodyPartCode;
    const aimedPart =
        aimedCode ? body.parts.find((part) => part.shortcode === aimedCode) : undefined;
    const redirected = !counterstrike && result.limbBlockStrikesLimb;
    if (!redirected && aimedCode && !aimedPart) return;
    const hit =
        redirected ? undefined : (
            body.aimZone({
                targetZoneNumber: aimedPart?.zone.zoneNumbers[0] ?? 1,
                zoneDie: aimedPart ? Math.max(1, attack.spread) : body.maxZoneNumber,
            })
        );
    const struckPart =
        redirected ?
            body.getLocationByCode(result.blockingLimbLocationCode)?.bodyPart
        :   hit && !hit.isMiss && hit.location?.bodyPart;
    if (!struckPart) return;
    const targetUserId = counterstrike ? result.attackResult.speaker?.userId : fvttCurrentUser().id;
    if (!targetUserId) return;
    const activation: GrabTrialActivation = {
        id: fvttRandomId(),
        initiatorUuid: initiator.uuid,
        initiatorUserId: attack.speaker.userId ?? fvttCurrentUser().id,
        targetUuid: target.uuid,
        targetUserId,
        mode: mode.pointerData,
        targetPartCode: struckPart.shortcode,
        availableTA:
            result.tacticalAdvantages.side === (counterstrike ? "defender" : "attacker") ?
                result.tacticalAdvantages.count
            :   0,
    };
    if (!authorized(target, targetUserId)) {
        if (!authorized(initiator, activation.initiatorUserId)) return;
        await flags(initiator).setFlag("sohl", `grabActivations.${activation.id}`, activation);
        await postActionCard(speaker, {
            template: toFilePath("systems/sohl/templates/chat/grab-trial-offer.hbs"),
            data: { initiator: initiator.name, target: target.name },
            buttons: [
                {
                    action: "activateGrabTrial",
                    handlerUuid: target.uuid,
                    scope: {
                        offerId: activation.id,
                        initiatorUuid: initiator.uuid,
                        targetUuid: target.uuid,
                    },
                    label: sohl.i18n.localize("SOHL.Grab.answer"),
                    skipDialog: false,
                },
            ],
        });
        return;
    }
    await createGrabOffer(target, activation, speaker);
}

/**
 * The affected owner accepts an exchange recorded on its initiating owner's actor.
 * Only lookup keys cross the card boundary; the canonical snapshot stays source-owned.
 * @param logic - Affected actor's owner-controlled logic.
 * @param context - Source activation and affected actor lookup keys.
 */
export async function activateGrabTrial(
    logic: BeingLogic,
    context: SohlActionContext<Partial<GrabTrialActivationScope>>,
): Promise<void> {
    const { offerId, initiatorUuid, targetUuid } = context.scope;
    const target = logic.actor;
    const source = initiatorUuid && actorAt(initiatorUuid);
    if (!target?.isOwner || !offerId || !source || target.uuid !== targetUuid) return;
    const activation = flags(source).getFlag("sohl", `grabActivations.${offerId}`) as
        GrabTrialActivation | undefined;
    if (
        !activation ||
        activation.id !== offerId ||
        activation.initiatorUuid !== source.uuid ||
        activation.targetUuid !== target.uuid
    )
        return;
    const mode = StrikeModeBase.fromPointerData(activation.mode);
    if (
        !isGrabTrialMode(mode) ||
        mode?.parent.actor?.uuid !== source.uuid ||
        !logic.body?.structure.parts.some((part) => part.shortcode === activation.targetPartCode)
    )
        return;
    await createGrabOffer(target, activation, logic.speaker);
}

/**
 * Persist an offer once on its affected owner's actor, then offer the initiator's choices.
 * @param target - Owner-controlled affected actor.
 * @param activation - Canonical exchange snapshot.
 * @param speaker - Client's posting speaker.
 */
async function createGrabOffer(
    target: SohlActor,
    activation: GrabTrialActivation,
    speaker: SohlSpeaker,
): Promise<void> {
    if (!authorized(target, activation.targetUserId)) return;
    const initiator = actorAt(activation.initiatorUuid);
    if (!initiator) return;
    const existing = readOffer(target, activation.id);
    const offer: GrabTrialOffer = existing ?? {
        ...activation,
        status: "offered",
    };
    if (offer.initiatorUuid !== initiator.uuid || offer.status !== "offered") return;
    if (existing && !authorized(target, existing.targetUserId)) return;
    if (!existing) await flags(target).setFlag("sohl", `grabOffers.${offer.id}`, offer);
    await postActionCard(speaker, {
        template: toFilePath("systems/sohl/templates/chat/grab-trial-offer.hbs"),
        data: { initiator: initiator.name, target: target.name },
        buttons: [
            {
                action: "beginGrabTrial",
                handlerUuid: initiator.uuid,
                scope: { offerId: offer.id, targetUuid: target.uuid },
                label: sohl.i18n.localize("SOHL.Grab.choose"),
                skipDialog: false,
            },
        ],
    });
}

/**
 * Choose manoeuvre, participating hands and TA spend, then roll only the initiator.
 * Persist the committed die before inviting the target, so retries cannot reroll.
 * @param logic - Initiator's owner-controlled Being Logic.
 * @param context - Card lookup keys; other button data is ignored.
 * @returns The committed initiator trial, or undefined when declined or stale.
 */
export async function beginGrabTrial(
    logic: BeingLogic,
    context: SohlActionContext<Partial<GrabTrialScope>>,
): Promise<PendingGrabTrial | undefined> {
    const { offerId, targetUuid } = context.scope;
    if (!offerId || !targetUuid) return undefined;
    const target = actorAt(targetUuid);
    const actor = logic.actor;
    const offer = target && readOffer(target, offerId);
    if (
        !actor?.uuid ||
        !target ||
        !offer ||
        offer.status !== "offered" ||
        offer.initiatorUuid !== actor.uuid ||
        !authorized(actor, offer.initiatorUserId)
    )
        return undefined;
    const key = `${actor.uuid}:${offerId}`;
    if (active.has(key)) return undefined;
    active.add(key);
    try {
        let pending = flags(actor).getFlag("sohl", `grabTrials.${offerId}`) as
            PendingGrabTrial | undefined;
        if (!pending) {
            const mode = StrikeModeBase.fromPointerData(offer.mode);
            if (!isGrabTrialMode(mode) || !mode || mode.parent.actor?.uuid !== actor.uuid)
                return undefined;
            const roles =
                (mode.parent.data as { impairedByRoles?: string[] }).impairedByRoles ?? [];
            const freeParts = () =>
                logic.body?.structure.parts.filter(
                    (p) =>
                        !p.immobilized &&
                        (mode.traits.take || mode.traits.hold ?
                            roles.length ?
                                p.roles.some((role) => roles.includes(role))
                            :   p.canHoldItem &&
                                (!p.heldItemId || p.heldItemId === mode.parent.item?.id)
                        :   p.canHoldItem &&
                            !p.heldItemId &&
                            p.roles.some((role) => roles.includes(role))),
                ) ?? [];
            const parts = freeParts();
            const targetParts = (target.logic as BeingLogic).body?.structure.parts ?? [];
            const response = await dialog({
                title: sohl.i18n.localize("SOHL.Grab.choose"),
                template: toFilePath("systems/sohl/templates/dialog/grab-trial-dialog.hbs"),
                data: {
                    parts: parts.map((p) => ({ code: p.shortcode, name: p.name })),
                    targetParts: targetParts
                        .filter(
                            (p) => !offer.targetPartCode || p.shortcode === offer.targetPartCode,
                        )
                        .map((p) => ({ code: p.shortcode, name: p.name })),
                    availableTA: offer.availableTA,
                    holdOnly: !!mode.traits.hold,
                    takeOnly: !!mode.traits.take && !mode.traits.hold,
                },
            });
            if (!response) return undefined;
            const liveOffer = readOffer(target, offerId);
            if (
                !liveOffer ||
                liveOffer.status !== "offered" ||
                JSON.stringify(liveOffer) !== JSON.stringify(offer) ||
                !authorized(actor, offer.initiatorUserId)
            )
                return undefined;
            const data = response.data;
            const choice: GrabTrialChoice = {
                manoeuvre: mode.traits.hold && mode.traits.take ? "hold" : data.manoeuvre,
                partCodes: [data.firstHand, data.secondHand].filter(Boolean),
                impactTacticalAdvantages: Number(data.impactTA ?? 0),
            };
            const liveParts = freeParts();
            const modifiers = prepareGrabTrial(mode, choice, {
                partCodes: liveParts.map((p) => p.shortcode),
                offSidePartCodes: liveParts
                    .filter((p) => logic.dominantSide && bodyPartSide(p) !== logic.dominantSide)
                    .map((p) => p.shortcode),
                impactTacticalAdvantages: offer.availableTA,
            });
            if (
                !targetParts.some((p) => p.shortcode === data.targetPart) ||
                (offer.targetPartCode && data.targetPart !== offer.targetPartCode)
            )
                return undefined;
            const strength = logic.getItemLogic("str", "attribute")?.score?.effective;
            if (strength == null) return undefined;
            pending = {
                id: offer.id,
                initiatorUuid: actor.uuid,
                targetUuid: offer.targetUuid,
                targetPartCode: data.targetPart,
                choice,
                status: "awaiting-target",
                initiator: {
                    strength,
                    die: new SimpleRoll({ numDice: 1, dieFaces: 6 }, { parent: logic }).roll(),
                    modifiers,
                },
            };
            await flags(actor).setFlag("sohl", `grabTrials.${offer.id}`, pending);
        }
        await postActionCard(logic.speaker, {
            template: toFilePath("systems/sohl/templates/chat/grab-trial-request.hbs"),
            data: { initiator: actor.name, target: target.name, trial: pending },
            buttons: [
                {
                    action: "answerGrabTrial",
                    handlerUuid: offer.targetUuid,
                    scope: { offerId, targetUuid: target.uuid },
                    label: sohl.i18n.localize("SOHL.Grab.answer"),
                    skipDialog: false,
                },
            ],
        });
        return pending;
    } finally {
        active.delete(key);
    }
}

/**
 * The target confirms and rolls their own d6; ties/losses apply no manoeuvre.
 * Persist the terminal result before posting so a repeated click cannot reroll.
 * @param logic - Addressed target's owner-controlled Being Logic.
 * @param context - Lookup keys for the canonical participant records.
 * @returns The persisted outcome, or undefined when declined or stale.
 */
export async function respondGrabTrial(
    logic: BeingLogic,
    context: SohlActionContext<Partial<GrabTrialScope>>,
): Promise<SettledGrabTrial | undefined> {
    const { offerId, targetUuid } = context.scope;
    const actor = logic.actor;
    if (!actor?.uuid || !offerId || actor.uuid !== targetUuid) return undefined;
    const offer = readOffer(actor, offerId);
    if (!offer || !authorized(actor, offer.targetUserId)) return undefined;
    if (offer.status === "settled") {
        if (offer.settled) await postGrabResult(logic, offer, offer.settled);
        return offer.settled;
    }
    const key = `${actor.uuid}:${offerId}`;
    if (active.has(key)) return undefined;
    active.add(key);
    try {
        const initiator = actorAt(offer.initiatorUuid);
        const pending =
            initiator &&
            (flags(initiator).getFlag("sohl", `grabTrials.${offerId}`) as
                PendingGrabTrial | undefined);
        if (
            !pending ||
            pending.id !== offerId ||
            pending.initiatorUuid !== initiator?.uuid ||
            pending.targetUuid !== actor.uuid
        )
            return undefined;
        const confirmed = await dialog({
            title: sohl.i18n.localize("SOHL.Grab.answer"),
            template: toFilePath("systems/sohl/templates/dialog/grab-answer-dialog.hbs"),
            data: { initiator: initiator.name, manoeuvre: pending.choice.manoeuvre },
        });
        if (!confirmed) return undefined;
        const liveOffer = readOffer(actor, offerId);
        const livePending = flags(initiator).getFlag("sohl", `grabTrials.${offerId}`);
        if (
            !authorized(actor, offer.targetUserId) ||
            liveOffer?.status !== "offered" ||
            JSON.stringify(livePending) !== JSON.stringify(pending)
        )
            return undefined;
        const strength = logic.getItemLogic("str", "attribute")?.score?.effective;
        if (strength == null) return undefined;
        const settled = answerGrabTrial(pending, {
            targetUuid: actor.uuid,
            strength,
            die: new SimpleRoll({ numDice: 1, dieFaces: 6 }, { parent: logic }).roll(),
        });
        await flags(actor).setFlag("sohl", `grabOffers.${offerId}`, {
            ...offer,
            status: "settled",
            settled,
        });
        await postGrabResult(logic, offer, settled);
        return settled;
    } finally {
        active.delete(key);
    }
}

/**
 * Confirm a won Take on the losing owner's client and release every target grip.
 * Save the complete item subtree before removing it, then offer an owner-bound
 * acceptance to the taker. An interrupted release can resume without resnapshotting.
 * @param logic - The addressed target's Being Logic.
 * @param context - Canonical trial lookup keys.
 */
export async function releaseGrabTake(
    logic: BeingLogic,
    context: SohlActionContext<Partial<GrabTrialScope>>,
): Promise<void> {
    const { offerId, targetUuid } = context.scope;
    const actor = logic.actor;
    if (!actor?.uuid || !offerId || actor.uuid !== targetUuid) return;
    let offer = readOffer(actor, offerId);
    if (
        !offer?.settled?.outcome.initiatorWins ||
        offer.settled.choice.manoeuvre !== "take" ||
        !authorized(actor, offer.targetUserId)
    )
        return;
    const key = `${actor.uuid}:${offerId}:take`;
    if (active.has(key)) return;
    active.add(key);
    try {
        if (!offer.take) {
            const parts = logic.body?.structure.parts ?? [];
            const plan = planGrabTake(offer.settled.targetPartCode, parts, []);
            const root = plan && actor.items.get(plan.itemId);
            if (!plan || !root) return;
            const confirmed = await dialog({
                title: sohl.i18n.localize("SOHL.Grab.releaseTake"),
                template: toFilePath("systems/sohl/templates/dialog/grab-take-confirm.hbs"),
                data: { itemName: root.name },
            });
            if (!confirmed) return;
            if (
                !authorized(actor, offer.targetUserId) ||
                JSON.stringify(readOffer(actor, offerId)) !== JSON.stringify(offer)
            )
                return;
            // The owner can rearrange gear while the confirmation is open.
            const current = planGrabTake(
                offer.settled.targetPartCode,
                logic.body.structure.parts,
                [],
            );
            if (current?.itemId !== root.id) return;
            const sourceIds = new Set([root.id]);
            let changed = true;
            while (changed) {
                changed = false;
                for (const item of actor.items) {
                    const parent = (item.system as { containerId?: string }).containerId;
                    if (parent && sourceIds.has(parent) && !sourceIds.has(item.id)) {
                        sourceIds.add(item.id);
                        changed = true;
                    }
                }
            }
            const idMap = new Map([...sourceIds].map((id) => [id, fvttRandomId()]));
            const carriedIds: string[] = [];
            const sourceItems: Record<string, PlainObject> = {};
            const items = [...sourceIds].map((id) => {
                const data = actor.items.get(id)!.toObject() as unknown as PlainObject;
                sourceItems[id] = structuredClone(data);
                const system = data.system as PlainObject;
                const parent = system.containerId as string | undefined;
                data._id = idMap.get(id);
                data.folder = null;
                delete data._stats;
                const itemFlags = (data.flags ?? {}) as PlainObject;
                data.flags = {
                    ...itemFlags,
                    sohl: {
                        ...((itemFlags.sohl ?? {}) as PlainObject),
                        grabTake: { offerId, sourceUuid: actor.uuid, sourceItemId: id },
                    },
                };
                system.containerId = parent && idMap.has(parent) ? idMap.get(parent) : null;
                if (system.isCarried) carriedIds.push(idMap.get(id)!);
                system.isCarried = false;
                return data;
            });
            offer = {
                ...offer,
                take: {
                    status: "prepared",
                    sourceIds: [...sourceIds],
                    sourceItems,
                    rootId: idMap.get(root.id)!,
                    items,
                    carriedIds,
                },
            };
            await flags(actor).setFlag("sohl", `grabOffers.${offerId}`, offer);
        }
        const take = offer.take!;
        if (take.status === "prepared") {
            // Validate the complete remaining subtree before clearing any grip or
            // deleting gear. A reused source id alone never proves an original.
            const remaining = take.sourceIds.filter((id) => actor.items.has(id));
            for (const id of remaining) {
                const snapshot = take.sourceItems?.[id];
                const current = actor.items.get(id)!.toObject();
                if (!snapshot || !sameSourceItem(snapshot, current))
                    throw new Error(
                        "Take source item changed or was replaced after escrow preparation",
                    );
            }
            const parts = logic.body.structure.parts.filter(
                (part) => !!part.heldItemId && take.sourceIds.includes(part.heldItemId),
            );
            if (parts.length)
                await logic.data.update(
                    logic.body.structure.setPartFieldsUpdate(
                        parts.map((part) => ({ index: part.index, changes: { heldItemId: null } })),
                    ),
                );
            if (remaining.length) await actor.deleteEmbeddedDocuments("Item", remaining);
            offer = { ...offer, take: { ...take, status: "released" } };
            await flags(actor).setFlag("sohl", `grabOffers.${offerId}`, offer);
        }
        await postActionCard(logic.speaker, {
            template: toFilePath("systems/sohl/templates/chat/grab-take-released.hbs"),
            data: { itemName: take.items.find((item) => item._id === take.rootId)?.name },
            buttons: [
                {
                    action: "acceptGrabTake",
                    handlerUuid: offer.initiatorUuid,
                    scope: { offerId, targetUuid: actor.uuid },
                    label: sohl.i18n.localize("SOHL.Grab.acceptTake"),
                    skipDialog: false,
                },
            ],
        });
    } finally {
        active.delete(key);
    }
}

/**
 * Compare persisted source snapshots independently of object-key ordering.
 * @param original - Owner-approved original item source.
 * @param current - Live source at the same id.
 * @returns Whether all persisted values still match.
 */
function sameSourceItem(original: unknown, current: unknown): boolean {
    if (original === current) return true;
    if (!original || !current || typeof original !== "object" || typeof current !== "object")
        return false;
    if (Array.isArray(original) || Array.isArray(current))
        return (
            Array.isArray(original) &&
            Array.isArray(current) &&
            original.length === current.length &&
            original.every((entry, index) => sameSourceItem(entry, current[index]))
        );
    const left = original as Record<string, unknown>;
    const right = current as Record<string, unknown>;
    const keys = Object.keys(left);
    return (
        keys.length === Object.keys(right).length &&
        keys.every((key) => Object.hasOwn(right, key) && sameSourceItem(left[key], right[key]))
    );
}

/**
 * Accept an escrowed Take on the taker's own client. Fixed destination ids make
 * resumed creation idempotent; the complete subtree moves together. A full-handed
 * taker receives it uncarried, the system's representation of an item on the ground.
 * @param logic - The taker's Being Logic.
 * @param context - Target-owned escrow lookup keys.
 */
export async function acceptGrabTake(
    logic: BeingLogic,
    context: SohlActionContext<Partial<GrabTrialScope>>,
): Promise<void> {
    const { offerId, targetUuid } = context.scope;
    const actor = logic.actor;
    const target = targetUuid && actorAt(targetUuid);
    const offer = target && offerId && readOffer(target, offerId);
    if (
        !actor?.uuid ||
        !target ||
        !offer ||
        offer.initiatorUuid !== actor.uuid ||
        !authorized(actor, offer.initiatorUserId) ||
        offer.take?.status !== "released" ||
        offer.take.sourceIds.some((id) => target.items.has(id))
    )
        return;
    const key = `${actor.uuid}:${offerId}:accept`;
    if (active.has(key)) return;
    active.add(key);
    try {
        const completed = flags(actor).getFlag("sohl", `grabTakeAccepted.${offerId}`);
        if (completed) return;
        const take = offer.take;
        const confirmed = await dialog({
            title: sohl.i18n.localize("SOHL.Grab.acceptTake"),
            template: toFilePath("systems/sohl/templates/dialog/grab-take-confirm.hbs"),
            data: { itemName: take.items.find((item) => item._id === take.rootId)?.name },
        });
        if (!confirmed) return;
        const liveOffer = readOffer(target, offerId!);
        if (
            !authorized(actor, offer.initiatorUserId) ||
            JSON.stringify(liveOffer?.take) !== JSON.stringify(take) ||
            take.sourceIds.some((id) => target.items.has(id)) ||
            flags(actor).getFlag("sohl", `grabTakeAccepted.${offerId}`)
        )
            return;
        // A fixed id proves a retry only together with its escrow identity.
        // Check every destination before creating or mutating any item.
        for (const data of take.items) {
            const marker = (
                (data.flags as PlainObject | undefined)?.sohl as PlainObject | undefined
            )?.grabTake as
                { offerId?: string; sourceUuid?: string; sourceItemId?: string } | undefined;
            if (
                !marker ||
                marker.offerId !== offerId ||
                marker.sourceUuid !== target.uuid ||
                !marker.sourceItemId ||
                !take.sourceIds.includes(marker.sourceItemId)
            )
                throw new Error("Take escrow item has no matching transfer identity");
            const existing = actor.items.get(data._id as string);
            if (existing) {
                const identity = flags(existing).getFlag("sohl", "grabTake") as typeof marker;
                if (
                    !identity ||
                    identity.offerId !== marker.offerId ||
                    identity.sourceUuid !== marker.sourceUuid ||
                    identity.sourceItemId !== marker.sourceItemId
                )
                    throw new Error("Take destination id belongs to another item");
            }
        }
        const missing = take.items.filter((data) => !actor.items.has(data._id as string));
        const creationOptions = { keepId: true, shortcodeDedupe: true };
        if (missing.length)
            await actor.createEmbeddedDocuments(
                "Item",
                missing as Parameters<SohlActor["createEmbeddedDocuments"]>[1],
                creationOptions,
            );
        const parts = logic.body.structure.parts;
        const free =
            parts.find(
                (part) => part.heldItemId === take.rootId && part.canHoldItem && !part.immobilized,
            ) ?? parts.find((part) => part.canHoldItem && !part.heldItemId && !part.immobilized);
        const root = actor.items.get(take.rootId);
        if (!root) throw new Error("Accepted Take has no root item");
        const staleGrips = parts.filter((part) => part.heldItemId === root.id && part !== free);
        if (staleGrips.length)
            await logic.data.update(
                logic.body.structure.setPartFieldsUpdate(
                    staleGrips.map((part) => ({
                        index: part.index,
                        changes: { heldItemId: null },
                    })),
                ),
            );
        if (!free) {
            await actor.updateEmbeddedDocuments(
                "Item",
                take.items
                    .filter((data) => actor.items.has(data._id as string))
                    .map((data) => ({ _id: data._id as string, "system.isCarried": false })),
            );
        }
        if (free) {
            await actor.updateEmbeddedDocuments(
                "Item",
                [...new Set([...take.carriedIds, take.rootId])]
                    .filter((id) => actor.items.has(id))
                    .map((id) => ({ _id: id, "system.isCarried": true })),
            );
            await logic.data.update(
                logic.body.structure.setPartFieldsUpdate([
                    { index: free.index, changes: { heldItemId: root.id } },
                ]),
            );
        }
        await flags(actor).setFlag("sohl", `grabTakeAccepted.${offerId}`, {
            itemId: root.id,
            held: !!free,
        });
    } finally {
        active.delete(key);
    }
}

/**
 * Repost a persisted outcome without rolling or applying its effect.
 * @param logic - Target owner logic.
 * @param offer - Canonical participant request.
 * @param settled - Persisted trial outcome.
 */
async function postGrabResult(
    logic: BeingLogic,
    offer: GrabTrialOffer,
    settled: SettledGrabTrial,
): Promise<void> {
    const actor = logic.actor;
    if (!actor?.uuid) return;
    await postActionCard(logic.speaker, {
        template: toFilePath("systems/sohl/templates/chat/grab-trial-result.hbs"),
        data: {
            initiator: actorAt(offer.initiatorUuid)?.name,
            target: actor.name,
            trial: settled,
        },
        buttons:
            settled.outcome.initiatorWins ?
                [
                    {
                        action:
                            settled.choice.manoeuvre === "take" ?
                                "releaseGrabTake"
                            :   "applyGrabHold",
                        handlerUuid: actor.uuid,
                        scope: { offerId: offer.id, targetUuid: actor.uuid },
                        label: sohl.i18n.localize(
                            settled.choice.manoeuvre === "take" ?
                                "SOHL.Grab.releaseTake"
                            :   "SOHL.Grab.applyHold",
                        ),
                        skipDialog: false,
                    },
                ]
            :   undefined,
    });
}
