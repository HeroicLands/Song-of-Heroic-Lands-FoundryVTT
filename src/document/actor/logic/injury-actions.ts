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

import type { BodyStructure } from "@src/entity/body/BodyStructure";
import { getActorBody } from "@src/document/actor/logic/BodyLogic";
import { buildTraumaData, type ResolvedInjury } from "@src/entity/body/injury-resolution";
import { IMPACT_ASPECT, ITEM_KIND, isImpactAspect, type ImpactAspect } from "@src/utils/constants";
import { GRIEVOUS_MIN } from "@src/entity/body/impairment";
import { fvttCreateEmbeddedItems } from "@src/core/FoundryHelpers";
import { offerSchedule, type OfferContext } from "@src/document/item/logic/offer-schedule";

/**
 * The parameter bag driving the **Resolve Injury** flow — the single vocabulary
 * shared by the action's scope payload, its configuration dialog, and its result
 * card. A chat-card injury button serializes the blow into this shape
 * (`impact`/`aspect` plus an aimed `targetZoneNumber` + `zoneDie`); the manual
 * Actions-tab path starts from defaults; either way the dialog reads and rewrites
 * it before resolution.
 */
export interface ResolveInjuryData {
    /**
     * The struck hit-location shortcode. Empty when unspecified — the flow then
     * derives it from {@link targetZoneNumber} + {@link zoneDie} via
     * {@link sohl.entity.body.BodyStructure.aimZone | Zone-Die aiming}.
     */
    bodyLocationCode: string;
    /**
     * The Zone Number aimed at (`1`-based; default 1). The zone-die roll offsets
     * it: `Hit ZN = (targetZoneNumber - 1) + roll(1..zoneDie)`.
     */
    targetZoneNumber: number;
    /**
     * The Zone Die rolled to scatter the hit (uniform `1..zoneDie`). `0` is the
     * "unset" sentinel — the executor fills it with the body's max zone number
     * so an unaimed derive covers the whole body.
     */
    zoneDie: number;
    /** Raw impact total delivered by the blow, before armor (default 0). */
    impact: number;
    /** Weapon damage aspect (default Blunt). */
    aspect: ImpactAspect;
    /** Armor reduction, applied to the location's armor **only for a piercing
     *  aspect** (default 0). */
    armorReduction: number;
    /** Treatment modifier to seed on the resulting Trauma (default 0). */
    treatmentModifier: number;
    /** Extra impact added when determining whether the wound bleeds (default 0). */
    bleedImpactPenalty: number;
    /** Whether to record the resulting Trauma on the character sheet. Seeded
     *  from the world's "record trauma" setting; the dialog may override it. */
    autoAddInjury: boolean;
    /** Set true when the dialog changed {@link bodyLocationCode} away from the
     *  derived/aimed location (a manual GM override). */
    bodyLocationOverriden: boolean;
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

/** Default Target Zone Number when the caller supplies none. */
export const DEFAULT_TARGET_ZONE_NUMBER = 1;

/**
 * Seed a {@link ResolveInjuryData} from an action `scope` payload and the
 * world's auto-record default. Accepts an already-revived scope object or a raw
 * JSON string (a chat-card `data-scope`); unknown/blank fields fall back to the
 * spec defaults. Reads the zone-die vocabulary
 * (`bodyLocationCode`/`targetZoneNumber`/`zoneDie`), with `location` accepted as
 * an alias for `bodyLocationCode`, so a combat injury button and the manual path
 * feed the same shape. Pure and Foundry-free.
 *
 * `zoneDie` defaults to `0`, the "unset" sentinel — the executor fills it with
 * the body's max zone number so an unaimed derive covers the whole body.
 *
 * @param input - The revived scope object, a raw JSON string, or nothing.
 * @param autoAddInjury - The world default for recording the Trauma (from the
 *   "record trauma" setting); the dialog may still override it.
 * @returns The seeded resolve-injury parameters (never `bodyLocationOverriden`).
 */
export function buildResolveInjuryData(input: unknown, autoAddInjury: boolean): ResolveInjuryData {
    let raw: Record<string, unknown> = {};
    if (typeof input === "string") {
        if (input.trim()) {
            try {
                raw = JSON.parse(input);
            } catch {
                raw = {};
            }
        }
    } else if (input && typeof input === "object") {
        raw = input as Record<string, unknown>;
    }

    const str = (v: unknown): string => (typeof v === "string" && v ? v : "");
    return {
        bodyLocationCode: str(raw.bodyLocationCode ?? raw.location),
        targetZoneNumber:
            raw.targetZoneNumber != null ? toInt(raw.targetZoneNumber) : DEFAULT_TARGET_ZONE_NUMBER,
        zoneDie: toInt(raw.zoneDie),
        impact: toInt(raw.impact),
        aspect: toAspect(raw.aspect),
        armorReduction: toInt(raw.armorReduction),
        treatmentModifier: toInt(raw.treatmentModifier),
        bleedImpactPenalty: toInt(raw.bleedImpactPenalty),
        autoAddInjury,
        bodyLocationOverriden: false,
    };
}

/**
 * Read the Resolve Injury dialog form back into {@link ResolveInjuryData}. Pure
 * and Foundry-free; takes the plain object produced by `FormDataExtended`.
 * `bodyLocationOverriden` is not a form field — the action sets it by comparing
 * the returned `bodyLocationCode` against the pre-dialog value.
 *
 * @param formData - The plain object produced by `FormDataExtended`.
 * @returns The normalized dialog values.
 */
export function readResolveInjuryForm(formData: Record<string, unknown>): ResolveInjuryData {
    return {
        bodyLocationCode: String(formData.bodyLocationCode ?? ""),
        targetZoneNumber:
            formData.targetZoneNumber != null && String(formData.targetZoneNumber) !== "" ?
                toInt(formData.targetZoneNumber)
            :   DEFAULT_TARGET_ZONE_NUMBER,
        zoneDie: toInt(formData.zoneDie),
        impact: toInt(formData.impact),
        aspect: toAspect(formData.aspect),
        armorReduction: toInt(formData.armorReduction),
        treatmentModifier: toInt(formData.treatmentModifier),
        bleedImpactPenalty: toInt(formData.bleedImpactPenalty),
        autoAddInjury: !!formData.autoAddInjury,
        bodyLocationOverriden: false,
    };
}

/** The outcome of a performed amputation Strength test, for the result card. */
export interface AmputationCardInfo {
    /** Whether the struck location was severed. */
    severed: boolean;
    /** Whether the victim died (a severed vital location). */
    died: boolean;
    /** Additional Shock Roll modifier from the test (−20 on a marginal success). */
    shockPenalty: number;
}

/**
 * The Zone-Number + Zone-Die aim trace echoed onto the result card when the hit
 * location was **derived** (not manually chosen). Sourced from
 * {@link sohl.entity.body.BodyStructure.aimZone}; `zoneName` is absent on a miss.
 */
export interface InjuryAimTrace {
    /** The Zone Number aimed at. */
    targetZoneNumber: number;
    /** The Zone Die rolled (die size). */
    zoneDie: number;
    /** The rolled die value, `1..zoneDie`. */
    zoneDieResult: number;
    /** `(targetZoneNumber - 1) + zoneDieResult`. */
    hitZoneNumber: number;
    /** The struck zone's name; absent when the blow missed. */
    zoneName?: string;
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
    /** Final bleeder disposition, overriding the injury's own when an
     *  amputation result makes an otherwise-non-bleeding wound bleed. */
    isBleeder?: boolean;
    /** Treatment modifier recorded on the wound (echoed onto the card). */
    treatmentModifier?: number;
    /** The performed amputation test's outcome, when the wound triggered one. */
    amputation?: AmputationCardInfo;
    /** The zone-die aim trace, present only when the location was **derived**;
     *  the card shows it in place of the "location overridden" notice. */
    aim?: InjuryAimTrace;
    /** True when the player specified the hit location by hand rather than
     *  deriving it; the card then shows a "Location overridden by player" note. */
    locationOverridden?: boolean;
}

/**
 * Build the render context for `injury-card.hbs` from a resolved injury.
 * Pure and Foundry-free so it can be unit-tested; the Foundry layer supplies
 * the {@link InjuryCardContext} and posts the result via {@link sohl.core.logic.SohlSpeaker}.
 * @param injury - The resolved injury to render.
 * @param ctx - Foundry-supplied context the card needs beyond the injury.
 * @param ctx.actorId - The Foundry id of the actor that received the injury.
 * @param ctx.handlerActorUuid - UUID of the actor responsible for handling the
 *   injury (may differ from the injured actor in assisted-combat scenarios).
 * @param ctx.name - Display name shown in the injury card header.
 * @param ctx.addToCharSheet - When true the injury should be written to the
 *   character sheet as a persistent trauma entry.
 * @param ctx.isBleeder - Final bleeder disposition (overrides the injury's own).
 * @param ctx.treatmentModifier - Treatment modifier recorded on the wound.
 * @param ctx.amputation - The performed amputation test's outcome, if any.
 * @returns The render context for `injury-card.hbs`.
 */
export function buildInjuryCardData(
    injury: ResolvedInjury,
    ctx: InjuryCardContext,
): Record<string, unknown> {
    // An amputation marginal-success worsens the Shock Roll by −20; fold it into
    // the shock bonus so the card's Shock Roll button carries the real penalty.
    const shockBonus = injury.shockRollBonus + (ctx.amputation?.shockPenalty ?? 0);
    return {
        actorId: ctx.actorId,
        handlerActorUuid: ctx.handlerActorUuid,
        name: ctx.name,
        bodyZoneName: injury.location.name,
        // Zone and Location are shown by their human-readable names (never a
        // shortcode). The Body Part is deliberately omitted from the card — it
        // is inferable from the location.
        zoneName: injury.location.bodyPart.zone.name,
        locationName: injury.location.name,
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
        shockRollBonus: shockBonus,
        // Scope payload for the card's Shock Roll button (#555): the wound's
        // precomputed shock contribution + glancing-blow roll bonus (and any
        // amputation shock penalty), which the being's `injuryShock` handler
        // resolves into a shock-state change.
        shockScope: {
            shockIndex: injury.shockIndex,
            shockBonus,
        },
        isBleeder: ctx.isBleeder ?? injury.isBleeder,
        stumble: injury.stumble,
        fumble: injury.fumble,
        // The wound could trigger an amputation test. When one was performed,
        // the card shows its outcome (severed / died / not severed) rather than
        // the "roll manually" note.
        canAmputate: injury.canAmputate,
        amputationModifier: injury.amputationModifier,
        amputationTested: !!ctx.amputation,
        amputationSevered: !!ctx.amputation?.severed,
        amputationDied: !!ctx.amputation?.died,
        treatmentModifier: ctx.treatmentModifier ?? 0,
        addToCharSheet: ctx.addToCharSheet,
        // A resolved injury is never a miss; the miss card is built separately.
        isMiss: false,
        // How the location was determined: the zone-die aim trace (derived) or a
        // player override notice — mutually exclusive on the card.
        locationDerived: !!ctx.aim,
        locationOverridden: !!ctx.locationOverridden,
        ...(ctx.aim ? aimTraceCardFields(ctx.aim) : {}),
    };
}

/**
 * Flatten an {@link InjuryAimTrace} into the card fields the template reads,
 * including the `d<zoneDie>` display label.
 * @param aim - The zone-die aim trace.
 * @returns The card render fields for the aim trace.
 */
function aimTraceCardFields(aim: InjuryAimTrace): Record<string, unknown> {
    return {
        targetZoneNumber: aim.targetZoneNumber,
        zoneDie: aim.zoneDie,
        zoneDieLabel: `d${aim.zoneDie}`,
        zoneDieResult: aim.zoneDieResult,
        hitZoneNumber: aim.hitZoneNumber,
        hitZoneName: aim.zoneName ?? "",
    };
}

/**
 * Build the render context for `injury-card.hbs` in its **miss** state — a
 * zone-die aim whose Hit ZN found no zone, so the blow finds no target. There is
 * no injury: no location, level, or Trauma. Pure and Foundry-free.
 * @param aim - The zone-die aim trace that missed.
 * @param ctx - Foundry-supplied card context.
 * @param ctx.actorId - The Foundry id of the actor that was aimed at.
 * @param ctx.handlerActorUuid - UUID of the actor handling the card.
 * @param ctx.name - Display name shown in the card header.
 * @returns The render context for `injury-card.hbs`.
 */
export function buildMissCardData(
    aim: InjuryAimTrace,
    ctx: { actorId: string | null; handlerActorUuid: string; name: string },
): Record<string, unknown> {
    return {
        actorId: ctx.actorId,
        handlerActorUuid: ctx.handlerActorUuid,
        name: ctx.name,
        isMiss: true,
        isInjured: false,
        locationDerived: true,
        locationOverridden: false,
        addToCharSheet: false,
        ...aimTraceCardFields(aim),
    };
}

/**
 * The body structure of an actor, or `undefined` when the actor is incorporeal
 * (empty body structure) or is not a Being. Resolved through the being's
 * {@link sohl.document.actor.logic.BodyLogic | body} sub-object.
 * @param logic - The actor logic whose body structure to retrieve.
 * @returns The body structure, or `undefined` if the actor has no body.
 */
export function getActorBodyStructure(logic: any): BodyStructure | undefined {
    return getActorBody(logic)?.structure;
}

/**
 * Create a human-readable name for a resolved injury.
 * @param injury - The resolved injury.
 * @returns The injury name.
 */
function createInjuryName(injury: ResolvedInjury): string {
    const injuryDesc = {
        blunt: { M: "Bruise", S: "Fracture", G: "Crush" },
        edged: { M: "Cut", S: "Slash", G: "Gash" },
        piercing: { M: "Poke", S: "Stab", G: "Impale" },
        fire: { M: "Singe", S: "Burn", G: "Scorch" },
    } as const;
    const severity = injury.levelCode[0] as "M" | "S" | "G";
    const aspect = injury.aspect;
    const desc = injuryDesc[aspect]?.[severity] ?? "Injury";
    return `${injury.location.name} ${desc}`;
}

/**
 * Create a physical Trauma item on the actor from a resolved injury, then
 * **offer** to schedule its first healing check (issue #579 — nothing
 * auto-schedules). Only call this for an actual wound (`injury.level >= 1`); a
 * glancing blow or no-injury result must not create a Trauma.
 *
 * The offer is a dialog (default **Schedule**) shown to the human who is present
 * on this client — they just took the wound, so they decide whether to track its
 * healing. It honors `context.skipDialog` only for a certain/scripted caller;
 * with no context it prompts (the interactive manual/assisted path).
 *
 * @param logic - The actor's logic (its `.actor` receives the Trauma item).
 * @param injury - The resolved injury to record.
 * @param context - The creating action's context, forwarded to the schedule
 *   offer so a scripted caller can pre-answer or suppress it; omit to prompt.
 * @param options - Overrides from the resolving action.
 * @param options.treatmentModifier - Treatment modifier to seed on the wound.
 * @param options.isBleeder - Final bleeder disposition (overrides the injury's
 *   own — e.g. when an amputation makes an otherwise-dry wound bleed).
 * @returns A promise that resolves once the Trauma is created and the offer resolved.
 */
export async function createTraumaFromInjury(
    logic: any,
    injury: ResolvedInjury,
    context: OfferContext = {},
    options: { treatmentModifier?: number; isBleeder?: boolean } = {},
): Promise<void> {
    let name = createInjuryName(injury);
    const created = await fvttCreateEmbeddedItems(logic, [
        {
            type: ITEM_KIND.TRAUMA,
            name,
            system: buildTraumaData(injury, options),
        },
    ]);
    const trauma = created?.[0];
    if (!trauma) return;
    // A **grievous** wound puts the limb out of action, and it drops what it was
    // holding (#1269). This is the one-time injury *event*, so the write happens
    // here and exactly once — never as a lifecycle side effect that would fight a
    // player who picks the item back up. Losing the *ability* to hold needs no
    // write: it derives from the part's `isUnusable`.
    if (injury.level >= GRIEVOUS_MIN) {
        await logic.dropHeldItemAt?.(injury.location.shortcode);
    }
    const healInterval = Number(trauma.system?.healingCheckDurationBase) || 0;
    await offerSchedule(context, trauma, "healingCheck", healInterval);
    // A wound that bleeds on infliction (a non-null blood-loss base) also offers
    // its blood-loss advance (issue #579) rather than auto-arming it.
    if (trauma.system?.bloodLossAdvanceDurationBase != null) {
        const bloodInterval = Number(trauma.system.bloodLossAdvanceDurationBase) || 0;
        await offerSchedule(context, trauma, "bloodLossAdvanceCheck", bloodInterval);
    }
}
