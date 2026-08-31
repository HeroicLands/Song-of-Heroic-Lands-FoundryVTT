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

import type { SohlActionContext } from "@src/entity/action/SohlActionContext";
import {
    ACTION_SUBTYPE,
    SOHL_ACTION_SCOPE,
    SOHL_CONTEXT_MENU_SORT_GROUP,
    VEHICLE_OCCUPANT_ROLE,
    VehicleOccupantRoleChoices,
    isVehicleOccupantRole,
    type VehicleOccupantRole,
} from "@src/utils/constants";
import { dialog, fvttActorByRef } from "@src/core/FoundryHelpers";
import { toHTMLString } from "@src/utils/helpers";
import type { SohlAction } from "@src/entity/action/SohlAction";
import {
    healthBand as healthBandFor,
    healthBandLabel as healthBandLabelFor,
    healthPercent,
    type HealthBand,
} from "@src/document/actor/logic/health";
import {
    SohlActorBaseLogic,
    type SohlActorData,
    type SohlActorLogic,
} from "@src/document/actor/logic/SohlActorBaseLogic";

/**
 * One actor occupying a vehicle, as `system.occupants` stores it.
 *
 * The handle may name a **Being** (a single individual) or a **Cohort** (which
 * stands for all of that cohort's members riding along).
 */
export interface VehicleOccupant {
    /**
     * How this occupant's actor is found: its `system.shortcode` (a world or
     * compendium actor) or a UUID (a Token Actor, which no shortcode can
     * reliably identify).
     */
    actorCodeOrUuid: string;
    /** This occupant's role aboard (crew, passenger, draft creature). */
    role: VehicleOccupantRole;
    /** An optional style aboard ("Bosun", "Helmsman"), or `null` for none. */
    title: string | null;
}

/**
 * One row of a vehicle's complement, as the Occupants tab lists it: the stored
 * entry joined to whatever its handle resolves to.
 *
 * A row is produced for **every** stored occupant, including one whose actor no
 * longer resolves — a vehicle must be able to show, and remove, someone it can
 * no longer see. Such a row is named by its raw handle and reports
 * `isResolved: false`.
 *
 * Deliberately has no leader flag. A vehicle's complement has roles but no
 * single head the way a {@link sohl.document.actor.logic.CohortLogic | Cohort}
 * has a leader — a ship's master is expressed as a `title`, not a rank the
 * system tracks.
 */
export interface VehicleOccupantRow {
    /** The stored handle: a `system.shortcode`, or a UUID for a Token Actor. */
    ref: string;
    /** This occupant's role aboard. */
    role: VehicleOccupantRole;
    /** Localization key for {@link role}. */
    roleLabel: string;
    /** The occupant's style aboard ("Bosun"), or `null`. */
    title: string | null;
    /** The resolved actor's name, falling back to the raw handle. */
    name: string;
    /** The resolved actor's portrait, or `""`. */
    img: string;
    /** The resolved actor's UUID, or `null` when it does not resolve. */
    uuid: string | null;
    /** Whether the handle resolved to an actor this client can see. */
    isResolved: boolean;
    /** Health as a whole percentage of maximum, or `undefined`. */
    healthPct: number | undefined;
    /** The band {@link healthPct} falls in, or `undefined`. */
    healthBand: HealthBand | undefined;
    /** Localization key for {@link healthBand}, or `undefined`. */
    healthBandLabel: string | undefined;
}

/**
 * A movable inanimate conveyance.
 *
 * A Vehicle represents a wagon, ship, cart, or any mobile platform that can
 * hold both **occupants** and embedded **items** (cargo, equipment, etc.).
 * Vehicles are not Beings — they have no anatomy, skills, or traits.
 *
 * Occupants are tracked as an array of actor shortcodes. Each shortcode may
 * reference either a **Being** (a single individual) or a **Cohort** (which
 * is shorthand for all of that Cohort's members being occupants).
 *
 * Vehicles can own Protection items (hull armor, reinforced sides), Injuries
 * (structural damage), Container Gear (cargo holds), and Actions.
 *
 * @typeParam TData - The Vehicle data interface.
 */
export class VehicleLogic<
    TData extends VehicleData = VehicleData,
> extends SohlActorBaseLogic<TData> {
    /* --------------------------------------------- */
    /* Common Lifecycle Actions                      */
    /* --------------------------------------------- */

    /* --------------------------------------------- */
    /* Occupants                                     */
    /* --------------------------------------------- */

    /**
     * The logic of every occupant whose handle resolves, in stored order.
     * Entries that no longer resolve are simply absent; a vehicle with a stale
     * occupant still lists the rest.
     *
     * @returns One logic per resolvable occupant.
     */
    get occupantLogics(): SohlActorLogic<any>[] {
        const logics: SohlActorLogic<any>[] = [];
        for (const occupant of this.data.occupants) {
            const actor = fvttActorByRef(occupant.actorCodeOrUuid);
            const logic = actor?.logic as SohlActorLogic<any> | undefined;
            if (logic) logics.push(logic);
        }
        return logics;
    }

    /**
     * The vehicle's complement as display rows — one per stored entry, in
     * order, each joined to the actor its handle resolves to.
     *
     * The single seam the Occupants tab reads: an occupant is named by its
     * actor where that actor resolves, and by its raw handle where it does not
     * (see {@link VehicleOccupantRow}).
     *
     * @returns One row per occupant entry.
     */
    get occupantRows(): VehicleOccupantRow[] {
        return this.data.occupants.map((occupant) => {
            const ref = occupant.actorCodeOrUuid;
            const actor = fvttActorByRef(ref);
            const healthPct = healthPercent(actor?.logic?.data?.health);
            const band = healthPct === undefined ? undefined : healthBandFor(healthPct);
            return {
                ref,
                role: occupant.role,
                roleLabel:
                    (VehicleOccupantRoleChoices as Record<string, string>)[occupant.role] ?? "",
                title: occupant.title ?? null,
                name: actor?.name ?? ref,
                img: actor?.img ?? "",
                uuid: actor?.uuid ?? null,
                isResolved: !!actor,
                healthPct,
                healthBand: band,
                healthBandLabel: band === undefined ? undefined : healthBandLabelFor(band),
            };
        });
    }

    /* --------------------------------------------- */
    /* Array update helpers                          */
    /* --------------------------------------------- */

    /**
     * Build an `update()` payload appending an occupant to
     * {@link VehicleData.occupants}. The whole array is written back — never an
     * element by index (#247).
     *
     * @param occupant - The occupant entry to add.
     * @returns An update payload (does not itself persist the change).
     */
    addOccupantUpdate(occupant: VehicleOccupant): PlainObject {
        return { "system.occupants": [...this.data.occupants, occupant] };
    }

    /**
     * Build an `update()` payload removing the occupant with the given handle.
     *
     * Unlike a cohort, there is no leader to clear alongside it — a vehicle's
     * complement has roles but no single head.
     *
     * @param actorCodeOrUuid - The handle of the occupant to remove.
     * @returns An update payload (does not itself persist the change).
     */
    removeOccupantUpdate(actorCodeOrUuid: string): PlainObject {
        return {
            "system.occupants": this.data.occupants.filter(
                (o) => o.actorCodeOrUuid !== actorCodeOrUuid,
            ),
        };
    }

    /* --------------------------------------------- */
    /* Intrinsic Actions                             */
    /* --------------------------------------------- */

    /**
     * A vehicle's own actions: the two that manage its complement.
     *
     * They are actions rather than sheet-only handlers so the Occupants-tab
     * controls, the Actions tab, and any macro drive one implementation — the
     * same seam the cohort's membership actions use. Each acts only when a
     * human invokes it.
     *
     * @returns The vehicle's intrinsic action definitions.
     */
    static override defineIntrinsicActions(): Partial<SohlAction.Data>[] {
        return [
            ...SohlActorBaseLogic.defineIntrinsicActions(),
            {
                shortcode: "addOccupant",
                subType: ACTION_SUBTYPE.INTRINSIC,
                title: "SOHL.Vehicle.Action.addOccupant",
                scope: SOHL_ACTION_SCOPE.SELF,
                iconFAClass: "fa-solid fa-user-plus",
                executor: "addOccupant",
                visible: "true",
                group: SOHL_CONTEXT_MENU_SORT_GROUP.GENERAL,
            },
            {
                shortcode: "removeOccupant",
                subType: ACTION_SUBTYPE.INTRINSIC,
                title: "SOHL.Vehicle.Action.removeOccupant",
                scope: SOHL_ACTION_SCOPE.SELF,
                iconFAClass: "fa-solid fa-user-minus",
                executor: "removeOccupant",
                visible: "true",
                group: SOHL_CONTEXT_MENU_SORT_GROUP.GENERAL,
            },
        ];
    }

    /**
     * Add an occupant, asking for the handle, role, and optional title.
     *
     * The handle is checked before anything is written: it must name an actor
     * this client can see, and one that is not already aboard.
     *
     * @param context - The action context; `scope` may pre-fill the answers.
     * @returns Resolves once the occupant is added, or immediately if not.
     */
    async addOccupant(context: SohlActionContext): Promise<void> {
        const scope = (context.scope ?? {}) as PlainObject;
        let ref = String(scope.actorCodeOrUuid ?? "").trim();
        let role: VehicleOccupantRole =
            isVehicleOccupantRole(scope.role) ? scope.role : VEHICLE_OCCUPANT_ROLE.PASSENGER;
        let title = String(scope.title ?? "").trim();

        if (!context.skipDialog || !ref) {
            const answer = (await dialog({
                title: sohl.i18n.localize("SOHL.Vehicle.Occupants.add.title"),
                content: toHTMLString(
                    `<div class="form-group">` +
                        `<label>{{refLabel}}</label>` +
                        `<input type="text" name="actorCodeOrUuid" value="{{ref}}" autofocus />` +
                        `</div>` +
                        `<p class="hint">{{refHint}}</p>` +
                        `<div class="form-group">` +
                        `<label>{{roleLabel}}</label>` +
                        `<select name="role">` +
                        `{{#each roles}}<option value="{{value}}" {{#if selected}}selected{{/if}}>{{label}}</option>{{/each}}` +
                        `</select>` +
                        `</div>` +
                        `<div class="form-group">` +
                        `<label>{{titleLabel}}</label>` +
                        `<input type="text" name="title" value="{{title}}" />` +
                        `</div>`,
                ),
                data: {
                    ref,
                    title,
                    refLabel: sohl.i18n.localize("SOHL.Vehicle.Occupants.add.refLabel"),
                    refHint: sohl.i18n.localize("SOHL.Vehicle.Occupants.add.refHint"),
                    roleLabel: sohl.i18n.localize("SOHL.Vehicle.FIELDS.occupants.role.label"),
                    titleLabel: sohl.i18n.localize("SOHL.Vehicle.FIELDS.occupants.title.label"),
                    roles: Object.entries(VehicleOccupantRoleChoices).map(([value, key]) => ({
                        value,
                        label: sohl.i18n.localize(key as string),
                        selected: value === role,
                    })),
                },
                buttons: [
                    {
                        action: "add",
                        label: sohl.i18n.localize("SOHL.Vehicle.Occupants.add.confirm"),
                        icon: "fa-solid fa-user-plus",
                        default: true,
                    },
                    {
                        action: "cancel",
                        label: sohl.i18n.localize("SOHL.Vehicle.Occupants.add.cancel"),
                    },
                ],
                callback: (formData: PlainObject, action: string) =>
                    action === "add" ? formData : undefined,
                rejectClose: false,
            })) as PlainObject | undefined | null;
            if (!answer) return;
            ref = String(answer.actorCodeOrUuid ?? "").trim();
            role =
                isVehicleOccupantRole(answer.role) ? answer.role : VEHICLE_OCCUPANT_ROLE.PASSENGER;
            title = String(answer.title ?? "").trim();
        }

        if (!ref) return;
        if (this.data.occupants.some((o) => o.actorCodeOrUuid === ref)) {
            sohl.log.uiWarn(
                sohl.i18n.format("SOHL.Vehicle.Occupants.add.duplicate", {
                    ref,
                }),
            );
            return;
        }
        // `fvttActorByRef` yields an Actor or nothing, so this one check covers
        // both "no such document" and "that is not an actor".
        if (!fvttActorByRef(ref)) {
            sohl.log.uiWarn(
                sohl.i18n.format("SOHL.Vehicle.Occupants.add.notAnActor", {
                    ref,
                }),
            );
            return;
        }

        await this.data.update(
            this.addOccupantUpdate({
                actorCodeOrUuid: ref,
                role,
                title: title || null,
            }),
        );
    }

    /**
     * Remove an occupant, after confirming. Only the entry goes: the actor, and
     * everything on it, is untouched.
     *
     * @param context - The action context; `scope.actorCodeOrUuid` names the
     *   occupant, otherwise the first is offered.
     * @returns Resolves once the occupant is removed, or immediately if not.
     */
    async removeOccupant(context: SohlActionContext): Promise<void> {
        const scope = (context.scope ?? {}) as PlainObject;
        const ref = String(
            scope.actorCodeOrUuid ?? this.data.occupants[0]?.actorCodeOrUuid ?? "",
        ).trim();
        if (!ref) return;
        const row = this.occupantRows.find((r) => r.ref === ref);
        if (!row) return;

        if (!context.skipDialog) {
            const confirmed = await dialog({
                title: sohl.i18n.localize("SOHL.Vehicle.Occupants.remove.title"),
                content: toHTMLString(`<p>{{warning}}</p>`),
                data: {
                    warning: sohl.i18n.format("SOHL.Vehicle.Occupants.remove.warning", {
                        name: row.name,
                    }),
                },
                buttons: [
                    {
                        action: "yes",
                        label: sohl.i18n.localize("SOHL.Vehicle.Occupants.remove.confirm"),
                        icon: "fa-solid fa-trash",
                    },
                    {
                        action: "no",
                        label: sohl.i18n.localize("SOHL.Vehicle.Occupants.remove.cancel"),
                        default: true,
                    },
                ],
                callback: (_formData: PlainObject, action: string) => action === "yes",
                rejectClose: false,
            });
            if (confirmed !== true) return;
        }

        await this.data.update(this.removeOccupantUpdate(ref));
    }

    /** @inheritdoc */
    override initialize(): void {
        super.initialize();
    }

    /** @inheritdoc */
    override evaluate(): void {
        super.evaluate();
    }

    /** @inheritdoc */
    override finalize(): void {
        super.finalize();
    }
}

/**
 * Persisted data model for a {@link VehicleLogic | Vehicle} actor.
 *
 * @typeParam TLogic - The logic class bound to this data.
 * @remarks The shape of `system` on a `vehicle` actor — i.e. `actor.system` (equivalently `actor.logic.data`) when `actor.type === "vehicle"`. The backing DataModel implements this interface.
 */
export interface VehicleData<
    TLogic extends SohlActorLogic<VehicleData> = SohlActorLogic<any>,
> extends SohlActorData<TLogic> {
    /**
     * The actors occupying this vehicle, one entry each.
     * @see {@link VehicleOccupant}
     */
    occupants: VehicleOccupant[];
}
