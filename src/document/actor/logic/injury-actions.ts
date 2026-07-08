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

import type { BodyStructure } from "@src/entity/body/BodyStructure";
import {
    resolveInjury,
    buildTraumaData,
    type ResolvedInjury,
} from "@src/entity/body/injury-resolution";
import {
    IMPACT_ASPECT,
    ITEM_KIND,
    isImpactAspect,
    type ImpactAspect,
} from "@src/utils/constants";

/**
 * The forward-carried payload of a chat-card `createInjury` button
 * (`data-test-result-json`). Both combat modes serialize an injury request
 * here; the presence of {@link InjuryRequest.targetPart} + `spread`
 * discriminates an automated request (resolve with no dialog) from an
 * assisted one (open the Add Injury dialog).
 */
export interface InjuryRequest {
    /** Raw impact total delivered by the blow. */
    impact: number;
    /** Weapon damage aspect. */
    aspect: ImpactAspect;
    /** Aimed body-part shortcode (automated combat only). */
    targetPart?: string;
    /** Strike spread governing scatter (automated combat only). */
    spread?: number;
    /** Explicit hit-location shortcode override. */
    location?: string;
    /** Manual armor reduction. */
    armorReduction?: number;
    /** Force the wound to bleed. */
    extraBleedRisk?: boolean;
}

/** The normalized result of reading the Add Injury dialog form. */
export interface InjuryDialogForm {
    /** Shortcode of the chosen hit location. */
    locationCode: string;
    /** Weapon damage aspect. */
    aspect: ImpactAspect;
    /** Raw impact total. */
    impact: number;
    /** Manual armor reduction. */
    armorReduction: number;
    /** Force the wound to bleed. */
    extraBleedRisk: boolean;
    /** Whether to record the resulting Trauma on the character sheet. */
    addToCharSheet: boolean;
}

/**
 * Coerce an arbitrary value to a non-negative integer (0 on failure).
 * @param value - The value to coerce.
 * @returns The parsed integer, or 0 if it is not finite.
 */
function toInt(value: unknown): number {
    const n = parseInt(String(value), 10);
    return Number.isFinite(n) ? n : 0;
}

/**
 * Coerce a value to a valid {@link ImpactAspect}, defaulting to Blunt.
 * @param value - The value to coerce.
 * @returns A valid impact aspect.
 */
function toAspect(value: unknown): ImpactAspect {
    const s = String(value);
    return isImpactAspect(s) ? (s as ImpactAspect) : IMPACT_ASPECT.BLUNT;
}

/**
 * Parse a chat-card `data-scope` payload into an {@link InjuryRequest}.
 * Accepts an already-revived scope object or a raw JSON string; returns `null`
 * when the payload is missing or not valid. Pure and Foundry-free.
 * @param input - The revived `data-scope` object, or a raw JSON string.
 * @returns The parsed request, or `null` if missing or invalid.
 */
export function parseInjuryRequest(input: unknown): InjuryRequest | null {
    // Accept either an already-parsed scope object (the `data-scope` payload,
    // revived by the dispatch handler) or a raw JSON string.
    let raw: Record<string, unknown>;
    if (typeof input === "string") {
        if (!input.trim()) return null;
        try {
            raw = JSON.parse(input);
        } catch {
            return null;
        }
    } else if (input && typeof input === "object") {
        raw = input as Record<string, unknown>;
    } else {
        return null;
    }
    if (!raw || typeof raw !== "object") return null;
    const req: InjuryRequest = {
        impact: toInt(raw.impact),
        aspect: toAspect(raw.aspect),
    };
    if (typeof raw.targetPart === "string" && raw.targetPart)
        req.targetPart = raw.targetPart;
    if (raw.spread != null && Number.isFinite(Number(raw.spread)))
        req.spread = Number(raw.spread);
    if (typeof raw.location === "string" && raw.location)
        req.location = raw.location;
    if (raw.armorReduction != null)
        req.armorReduction = toInt(raw.armorReduction);
    if (raw.extraBleedRisk != null) req.extraBleedRisk = !!raw.extraBleedRisk;
    return req;
}

/**
 * Whether an injury request should be resolved automatically (no dialog).
 * Automated combat forwards both an aimed `targetPart` and an `spread`,
 * letting the hit location be rolled with no player input.
 * @param req - The injury request to inspect.
 * @returns True if the request can be resolved without a dialog.
 */
export function isAutomatedRequest(req: InjuryRequest): boolean {
    return !!req.targetPart && req.spread != null;
}

/**
 * Read the Add Injury dialog form into a normalized {@link InjuryDialogForm}.
 * Pure and Foundry-free; takes the plain object produced by `FormDataExtended`.
 * @param formData - The plain object produced by `FormDataExtended`.
 * @returns The normalized dialog form values.
 */
export function readInjuryDialogForm(
    formData: Record<string, unknown>,
): InjuryDialogForm {
    return {
        locationCode: String(formData.location ?? ""),
        aspect: toAspect(formData.aspect),
        impact: toInt(formData.impactVal),
        armorReduction: toInt(formData.armorReduction),
        extraBleedRisk: !!formData.extraBleedRisk,
        addToCharSheet: !!formData.addToCharSheet,
    };
}

/** Extra context the chat card needs beyond the resolved injury itself. */
export interface InjuryCardContext {
    /** The injured actor's id (for the card's `data-actor-id`). */
    actorId: string | null;
    /** UUID of the actor that handles the card's buttons (e.g. Shock Roll). */
    handlerActorUuid: string;
    /** Card subtitle, e.g. the attacking weapon or a generic label. */
    name: string;
    /** Whether the injury was recorded on the character sheet. */
    addToCharSheet: boolean;
}

/**
 * Build the render context for `injury-card.hbs` from a resolved injury.
 * Pure and Foundry-free so it can be unit-tested; the Foundry layer supplies
 * the {@link InjuryCardContext} and posts the result via {@link SohlSpeaker}.
 * @param injury - The resolved injury to render.
 * @param ctx - Foundry-supplied context the card needs beyond the injury.
 * @param ctx.actorId - The Foundry id of the actor that received the injury.
 * @param ctx.handlerActorUuid - UUID of the actor responsible for handling the
 *   injury (may differ from the injured actor in assisted-combat scenarios).
 * @param ctx.name - Display name shown in the injury card header.
 * @param ctx.addToCharSheet - When true the injury should be written to the
 *   character sheet as a persistent trauma entry.
 * @returns The render context for `injury-card.hbs`.
 */
export function buildInjuryCardData(
    injury: ResolvedInjury,
    ctx: InjuryCardContext,
): Record<string, unknown> {
    return {
        actorId: ctx.actorId,
        handlerActorUuid: ctx.handlerActorUuid,
        name: ctx.name,
        bodyZoneName: injury.location.name,
        bodyPartName: injury.location.bodyPart.shortcode,
        aspect: injury.aspect,
        armorType: injury.armorType,
        armorValue: injury.armorValue,
        armorReduction: injury.armorReduction,
        impactVal: injury.effectiveImpact,
        isInjured: injury.level >= 1,
        injuryLevelText: injury.levelCode,
        isGlancingBlow: injury.isGlancingBlow,
        shockIndex: injury.shockIndex,
        needsShockRoll: injury.needsShockRoll,
        shockRollBonus: injury.shockRollBonus,
        isBleeder: injury.isBleeder,
        stumble: injury.stumble,
        fumble: injury.fumble,
        canAmputate: injury.canAmputate,
        amputationModifier: injury.amputationModifier,
        addToCharSheet: ctx.addToCharSheet,
    };
}

/**
 * Resolve an automated {@link InjuryRequest} against a body structure with no
 * player input: the aimed `targetPart` + `spread` roll the hit location, and
 * an explicit `location` shortcode (if present) overrides it. Pure and
 * Foundry-free.
 * @param req - The automated injury request.
 * @param body - The target actor's body structure.
 * @returns The resolved injury.
 */
export function resolveAutomatedInjury(
    req: InjuryRequest,
    body: BodyStructure,
): ResolvedInjury {
    const targetPart =
        req.targetPart ? body.getPartByCode(req.targetPart) : undefined;
    const location =
        req.location ?
            body.getAllLocations().find((l) => l.shortcode === req.location)
        :   undefined;
    return resolveInjury({
        impact: req.impact,
        aspect: req.aspect,
        body,
        targetPart,
        spread: req.spread,
        location,
        armorReduction: req.armorReduction,
        extraBleedRisk: req.extraBleedRisk,
    });
}

/**
 * The body structure of an actor's Lineage, or `undefined` when the actor has
 * no Lineage (and therefore no anatomy to injure). Resolved through the actor
 * *logic*'s `logicTypes` — the callers pass the `BeingLogic` (`this`), which
 * exposes `logicTypes` rather than the Foundry actor's `itemTypes`.
 * @param logic - The actor logic whose body structure to retrieve.
 * @returns The body structure, or `undefined` if the actor has no Lineage.
 */
export function getActorBodyStructure(logic: any): BodyStructure | undefined {
    const lineageLogic = logic?.logicTypes?.[ITEM_KIND.LINEAGE]?.[0];
    return lineageLogic?.bodyStructure as BodyStructure | undefined;
}

/**
 * Create a physical Trauma item on the actor from a resolved injury. Only
 * call this for an actual wound (`injury.level >= 1`); a glancing blow or
 * no-injury result must not create a Trauma. Foundry-facing.
 * @param actor - The actor to receive the Trauma item.
 * @param injury - The resolved injury to record.
 */
export async function createTraumaFromInjury(
    actor: any,
    injury: ResolvedInjury,
): Promise<void> {
    await actor.createEmbeddedDocuments("Item", [
        {
            type: ITEM_KIND.TRAUMA,
            name: `${injury.levelCode} ${injury.location.name}`,
            system: buildTraumaData(injury),
        },
    ]);
}
