/* SPDX-License-Identifier: GPL-3.0-or-later */
import { dialog, fvttCurrentUser, fvttRandomId, fvttResolveUuid } from "@src/core/FoundryHelpers";
import type { SohlActor } from "@src/document/actor/foundry/SohlActor";
import type { BeingLogic } from "@src/document/actor/logic/BeingLogic";
import type { CombatResult } from "@src/entity/result/CombatResult";
import type { SohlActionContext } from "@src/entity/action/SohlActionContext";
import type { SohlSpeaker } from "@src/core/logic/SohlSpeaker";
import { ENVELOPED_CODE } from "@src/document/item/logic/enveloped";
import { toFilePath } from "@src/utils/helpers";
// eslint-disable-next-line @typescript-eslint/no-restricted-imports
import { postActionCard } from "@src/document/chat/action-card";

/** Canonical snapshot stored only on the current controller's participant. */
interface EnvelopOffer {
    id: string;
    traumaId: string;
    initiatorUuid: string;
    targetUuid: string;
    targetUserId: string;
}
/** Lookup keys carried by the target's owner-addressed action button. */
export interface EnvelopScope {
    offerId: string;
    recordOwnerUuid: string;
    targetUuid: string;
}
interface FlagPort {
    getFlag(scope: string, key: string): unknown;
    setFlag(scope: string, key: string, value: unknown): Promise<unknown>;
}
const flags = (actor: SohlActor): FlagPort => actor as unknown as FlagPort;
const busy = new Set<string>();
/**
 * Resolve a live Being without accepting arbitrary scope documents.
 * @param uuid - Participant identity.
 * @returns The addressed Being, if still present.
 */
function actorAt(uuid: string): SohlActor | undefined {
    const actor = fvttResolveUuid(uuid) as SohlActor | undefined;
    return actor?.documentName === "Actor" && actor.type === "being" ? actor : undefined;
}

/**
 * Offer the struck target's owner an Enveloped condition after a landed attack.
 * The initial defence is unchanged. No injury, condition or target roll is automatic.
 * @param result - Evaluated combat exchange.
 * @param speaker - Current controller's posting speaker.
 */
export async function offerEnveloped(result: CombatResult, speaker: SohlSpeaker): Promise<void> {
    const attacks: Array<[typeof result.attackResult, typeof result.defendResult]> = [];
    if (result.attackerLandsBlow) attacks.push([result.attackResult, result.defendResult]);
    if (result.defenderLandsBlow)
        attacks.push([result.defendResult as typeof result.attackResult, result.attackResult]);
    for (const [attack, opponent] of attacks) {
        if (!attack.mode?.traits.envelop) continue;
        const initiator = attack.token?.actor;
        const target = opponent.token?.actor;
        if (!initiator?.uuid || !target?.uuid) continue;
        const userId = fvttCurrentUser().id;
        const initiatorUserId = attack.speaker.userId ?? userId;
        const targetUserId = opponent.speaker.userId ?? userId;
        // GM ownership alone does not transfer another player's controller binding.
        const recordOwner =
            initiator.isOwner && initiatorUserId === userId ? initiator
            : target.isOwner && targetUserId === userId ? target
            : undefined;
        if (!recordOwner) continue;
        const offer: EnvelopOffer = {
            id: fvttRandomId(),
            traumaId: fvttRandomId(),
            initiatorUuid: initiator.uuid,
            targetUuid: target.uuid,
            targetUserId,
        };
        await flags(recordOwner).setFlag("sohl", `envelopOffers.${offer.id}`, offer);
        await postActionCard(speaker, {
            content: "<p>{{localize 'SOHL.Enveloped.hit' initiator=initiator target=target}}</p>",
            data: { initiator: initiator.name, target: target.name },
            buttons: [
                {
                    action: "applyEnveloped",
                    handlerUuid: target.uuid,
                    scope: {
                        offerId: offer.id,
                        recordOwnerUuid: recordOwner.uuid,
                        targetUuid: target.uuid,
                    },
                    label: sohl.i18n.localize("SOHL.Enveloped.apply"),
                    skipDialog: false,
                },
            ],
        });
    }
}

/**
 * The addressed target controller confirms and creates one persistent physcond Trauma.
 * Fixed identity and item markers allow retries without overwriting another document.
 * @param logic - Affected actor's owner-controlled Being logic.
 * @param context - Canonical participant record lookup keys.
 */
export async function applyEnveloped(
    logic: BeingLogic,
    context: SohlActionContext<Partial<EnvelopScope>>,
): Promise<void> {
    const { offerId, recordOwnerUuid, targetUuid } = context.scope;
    const target = logic.actor;
    const owner = recordOwnerUuid && actorAt(recordOwnerUuid);
    if (!target?.isOwner || target.uuid !== targetUuid || !owner || !owner.uuid || !offerId) return;
    const offer = flags(owner).getFlag("sohl", `envelopOffers.${offerId}`) as
        EnvelopOffer | undefined;
    if (
        !offer ||
        offer.id !== offerId ||
        offer.targetUuid !== target.uuid ||
        ![offer.initiatorUuid, offer.targetUuid].includes(owner.uuid) ||
        fvttCurrentUser().id !== offer.targetUserId
    )
        return;
    const key = `${target.uuid}:${offerId}`;
    if (busy.has(key) || flags(target).getFlag("sohl", `envelopAccepted.${offerId}`)) return;
    busy.add(key);
    try {
        const confirmed = await dialog({
            title: sohl.i18n.localize("SOHL.Enveloped.apply"),
            template: toFilePath("systems/sohl/templates/dialog/enveloped-confirm.hbs"),
            data: { target: target.name },
        });
        if (
            !confirmed ||
            !target.isOwner ||
            fvttCurrentUser().id !== offer.targetUserId ||
            JSON.stringify(flags(owner).getFlag("sohl", `envelopOffers.${offerId}`)) !==
                JSON.stringify(offer) ||
            flags(target).getFlag("sohl", `envelopAccepted.${offerId}`)
        )
            return;
        const present = target.items.find(
            (item) =>
                item.type === "trauma" &&
                item.system.shortcode === ENVELOPED_CODE &&
                (item.system as { subType?: string }).subType === "physcond",
        );
        const collision = target.items.get(offer.traumaId);
        if (
            collision &&
            (collision as unknown as FlagPort).getFlag("sohl", "envelopOffer") !== offer.id
        )
            throw new Error("Enveloped condition id belongs to another item");
        if (!present)
            await target.createEmbeddedDocuments(
                "Item",
                [
                    {
                        _id: offer.traumaId,
                        type: "trauma",
                        name: sohl.i18n.localize("SOHL.Enveloped.condition"),
                        system: { shortcode: ENVELOPED_CODE, subType: "physcond" },
                        flags: { sohl: { envelopOffer: offer.id } },
                    },
                ],
                { keepId: true },
            );
        await flags(target).setFlag("sohl", `envelopAccepted.${offerId}`, {
            traumaId: present?.id ?? offer.traumaId,
        });
    } finally {
        busy.delete(key);
    }
}
