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
import { dialog, fvttCurrentUser, fvttLogicFromUuidSync } from "@src/core/FoundryHelpers";
import type { SohlActionContext } from "@src/entity/action/SohlActionContext";
import type { ImpactResult } from "@src/entity/result/ImpactResult";
import { StrikeModeBase } from "@src/entity/strikemode/StrikeModeBase";
import {
    applyImpactTacticalAdvantages,
    impactTacticalAdvantageValue,
} from "@src/entity/strikemode/impactTacticalAdvantage";
import { toFilePath, defaultToJSON } from "@src/utils/helpers";
import type { SohlTokenDocumentLogic } from "@src/document/token/logic/SohlTokenDocumentLogic";
import type { DamageCardInput, SohlCombatantLogic } from "./SohlCombatantLogic";

/** Recorded damage and participant identities carried by the source-owned action. */
export interface ImpactTAScope {
    sourceCombatantUuid: string;
    mode: StrikeModeBase.PointerData;
    impactResult: ImpactResult;
    targetTokenUuid: string;
    available: number;
    injuryScope: PlainObject;
}
const busy = new Set<string>();
/**
 * Offer source-controller arithmetic without rerolling or mutating the affected actor.
 * @param logic - Combatant that delivered the recorded impact.
 * @param context - Immutable damage snapshot and target injury context.
 * @returns The posted adjusted damage context, or undefined on refusal/cancellation.
 */
export async function spendImpactTAs(
    logic: SohlCombatantLogic,
    context: SohlActionContext<Partial<ImpactTAScope>>,
): Promise<DamageCardInput | undefined> {
    const scope = context.scope;
    const impact = scope.impactResult;
    const sourceActorUuid = logic.actorLogic?.uuid ?? logic.actor?.uuid;
    // Chat-card revival supplies the addressed combatant's actor as the nested
    // entity parent. Accept only that exact source actor or the source combatant.
    const sourceParent =
        impact &&
        (impact.parent.uuid === logic.uuid ||
            (sourceActorUuid != null && impact.parent.uuid === sourceActorUuid));
    const authorized = () =>
        logic.actor?.isOwner && impact?.speaker.userId === fvttCurrentUser().id;
    if (
        !impact ||
        !scope.mode ||
        !scope.targetTokenUuid ||
        scope.sourceCombatantUuid !== logic.uuid ||
        !sourceParent ||
        !authorized() ||
        context.skipDialog
    )
        return undefined;
    const mode = StrikeModeBase.fromPointerData(scope.mode);
    const target = fvttLogicFromUuidSync<SohlTokenDocumentLogic>(scope.targetTokenUuid);
    if (
        !mode ||
        mode.parent.actor?.uuid !== logic.actor?.uuid ||
        target?.kind !== "token" ||
        !target.actorLogic?.uuid ||
        busy.has(logic.uuid)
    )
        return undefined;
    const targetActorUuid = target.actorLogic.uuid;
    // Keep the recorded dice/aspect while restoring the canonical combatant
    // parent required by the derived result, without mutating the card snapshot.
    const canonicalImpact = impact.parent.uuid === logic.uuid ? impact : impact.clone(logic);
    busy.add(logic.uuid);
    try {
        const value = impactTacticalAdvantageValue(mode) ?? 0;
        const response = await dialog({
            title: sohl.i18n.localize("SOHL.ImpactTA.spend"),
            template: toFilePath("systems/sohl/templates/dialog/impact-ta-spend.hbs"),
            data: { spent: 0, value, available: scope.available ?? 0 },
        });
        const liveMode = StrikeModeBase.fromPointerData(scope.mode);
        if (
            !response ||
            !authorized() ||
            !liveMode ||
            liveMode.parent.actor?.uuid !== logic.actor?.uuid ||
            (impactTacticalAdvantageValue(liveMode) ?? 0) !== value
        )
            return undefined;
        const liveTarget = fvttLogicFromUuidSync<SohlTokenDocumentLogic>(scope.targetTokenUuid);
        if (liveTarget?.kind !== "token" || liveTarget.actorLogic?.uuid !== targetActorUuid)
            return undefined;
        const spent = Number(response.data.spent ?? 0);
        if (!Number.isSafeInteger(spent) || spent < 0) return undefined;
        const adjusted = applyImpactTacticalAdvantages(canonicalImpact, liveMode, spent);
        const card: DamageCardInput = {
            actorId: logic.actor!.id!,
            title: liveMode.fullLabel,
            notes: "",
            impactLabel: adjusted.impactModifier.label,
            rollResult: adjusted.roll.result,
            impact: adjusted.total,
            aspect: adjusted.aspect,
            hasTarget: true,
            targetName: liveTarget.name,
            handlerUuid: targetActorUuid,
            sourceActorUuid: logic.actor!.uuid!,
            scopeData: defaultToJSON({
                ...scope.injuryScope,
                impact: adjusted.total,
                aspect: adjusted.aspect,
            }) as PlainObject,
        };
        await context.speaker.toChat(
            toFilePath("systems/sohl/templates/chat/damage-card.hbs"),
            card,
        );
        return card;
    } finally {
        busy.delete(logic.uuid);
    }
}
