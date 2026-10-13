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
} from "@src/document/actor/logic/health";
import type { VehicleOccupant, VehicleOccupantRow } from "@src/document/actor/logic/VehicleLogic";
import { ITEM_KIND, TRAUMA_SUBTYPE } from "@src/utils/constants";
import { resolvedPeople, cargoWeightOf } from "./occupancy-state";
import {
    SohlActorBaseLogic,
    type SohlActorData,
    type SohlActorLogic,
} from "@src/document/actor/logic/SohlActorBaseLogic";

/**
 * A fixed installation or location.
 *
 * A Structure records occupants and owns cargo, items, actions and effects.
 * Authored maximum Health is reduced by embedded Injury severity. Occupant
 * and cargo capacities produce advisory warnings. Protection and siege
 * resolution are unspecified; no protection rating is derived.
 *
 * @typeParam TData - The Structure data interface.
 */
export class StructureLogic<
    TData extends StructureData = StructureData,
> extends SohlActorBaseLogic<TData> {
    /**
     * The logic of every occupant whose handle resolves, in stored order.
     * Entries that no longer resolve are simply absent; a structure with a stale
     * occupant still lists the rest.
     *
     * @returns One logic per resolvable occupant.
     */
    get occupantLogics(): SohlActorLogic<any>[] {
        const logics: SohlActorLogic<any>[] = [];
        for (const occupant of this.data.occupants ?? []) {
            const actor = fvttActorByRef(occupant.actorCodeOrUuid);
            const logic = actor?.logic as SohlActorLogic<any> | undefined;
            if (logic) logics.push(logic);
        }
        return logics;
    }

    /**
     * The structure's complement as display rows — one per stored entry, in
     * order, each joined to the actor its handle resolves to.
     *
     * The single seam the Occupants tab reads: an occupant is named by its
     * actor where that actor resolves, and by its raw handle where it does not
     * (see {@link StructureOccupantRow}).
     *
     * @returns One row per occupant entry.
     */
    get occupantRows(): StructureOccupantRow[] {
        return (this.data.occupants ?? []).map((occupant) => {
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
     * element by index.
     *
     * @param occupant - The occupant entry to add.
     * @returns An update payload (does not itself persist the change).
     */
    addOccupantUpdate(occupant: StructureOccupant): PlainObject {
        return { "system.occupants": [...this.data.occupants, occupant] };
    }

    /**
     * Build an `update()` payload removing the occupant with the given handle.
     *
     * Unlike a cohort, there is no leader to clear alongside it — a structure's
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
     * A structure's own actions: the two that manage its complement.
     *
     * They are actions rather than sheet-only handlers so the Occupants-tab
     * controls, the Actions tab, and any macro drive one implementation — the
     * same seam the cohort's membership actions use. Each acts only when a
     * human invokes it.
     *
     * @returns The structure's intrinsic action definitions.
     */
    static override defineIntrinsicActions(): Partial<SohlAction.Data>[] {
        return [
            ...SohlActorBaseLogic.defineIntrinsicActions(),
            {
                shortcode: "addOccupant",
                subType: ACTION_SUBTYPE.INTRINSIC,
                title: "SOHL.Structure.Action.addOccupant",
                scope: SOHL_ACTION_SCOPE.SELF,
                iconFAClass: "fa-solid fa-user-plus",
                executor: "addOccupant",
                visible: "true",
                group: SOHL_CONTEXT_MENU_SORT_GROUP.GENERAL,
            },
            {
                shortcode: "removeOccupant",
                subType: ACTION_SUBTYPE.INTRINSIC,
                title: "SOHL.Structure.Action.removeOccupant",
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
                title: sohl.i18n.localize("SOHL.Structure.Occupants.add.title"),
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
                    refLabel: sohl.i18n.localize("SOHL.Structure.Occupants.add.refLabel"),
                    refHint: sohl.i18n.localize("SOHL.Structure.Occupants.add.refHint"),
                    roleLabel: sohl.i18n.localize("SOHL.Structure.FIELDS.occupants.role.label"),
                    titleLabel: sohl.i18n.localize("SOHL.Structure.FIELDS.occupants.title.label"),
                    roles: Object.entries(VehicleOccupantRoleChoices).map(([value, key]) => ({
                        value,
                        label: sohl.i18n.localize(key as string),
                        selected: value === role,
                    })),
                },
                buttons: [
                    {
                        action: "add",
                        label: sohl.i18n.localize("SOHL.Structure.Occupants.add.confirm"),
                        icon: "fa-solid fa-user-plus",
                        default: true,
                    },
                    {
                        action: "cancel",
                        label: sohl.i18n.localize("SOHL.Structure.Occupants.add.cancel"),
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
                sohl.i18n.format("SOHL.Structure.Occupants.add.duplicate", {
                    ref,
                }),
            );
            return;
        }
        // `fvttActorByRef` yields an Actor or nothing, so this one check covers
        // both "no such document" and "that is not an actor".
        if (!fvttActorByRef(ref)) {
            sohl.log.uiWarn(
                sohl.i18n.format("SOHL.Structure.Occupants.add.notAnActor", {
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
                title: sohl.i18n.localize("SOHL.Structure.Occupants.remove.title"),
                content: toHTMLString(`<p>{{warning}}</p>`),
                data: {
                    warning: sohl.i18n.format("SOHL.Structure.Occupants.remove.warning", {
                        name: row.name,
                    }),
                },
                buttons: [
                    {
                        action: "yes",
                        label: sohl.i18n.localize("SOHL.Structure.Occupants.remove.confirm"),
                        icon: "fa-solid fa-trash",
                    },
                    {
                        action: "no",
                        label: sohl.i18n.localize("SOHL.Structure.Occupants.remove.cancel"),
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

    /** Sum of effective physical Injury severities. */
    structuralDamage = 0;
    /** Effective embedded cargo weight in pounds, including quantities. */
    cargoWeight = 0;
    /** Number of resolved people inside the structure. */
    occupantCount = 0;
    /** Advisory occupancy state. */
    occupantsOverCapacity = false;
    /** Advisory capacity state; never blocks an edit or action. */
    cargoOverCapacity = false;

    /**
     * Recompute structural Health and cargo after embedded items finalize.
     * This changes derived in-memory state only, never the authored source.
     */
    deriveStructureState(): void {
        this.occupantCount = resolvedPeople(this.occupantLogics).length;
        this.occupantsOverCapacity = this.occupantCount > (this.data.occupantCapacity ?? 0);
        this.structuralDamage = this.logicTypes[ITEM_KIND.TRAUMA].reduce(
            (sum, injury) =>
                injury.data.subType === TRAUMA_SUBTYPE.INJURY ?
                    sum + Math.max(0, injury.level?.effective ?? injury.data.levelBase ?? 0)
                :   sum,
            0,
        );
        const max = this.data.maxHealth ?? 0;
        this.data.health = { max, value: Math.max(0, max - this.structuralDamage) };
        this.cargoWeight = cargoWeightOf(this.allLogics);
        this.cargoOverCapacity = this.cargoWeight > (this.data.cargoCapacity ?? 0);
    }

    /* --------------------------------------------- */
    /* Common Lifecycle Actions                      */
    /* --------------------------------------------- */

    /** @inheritdoc */
    override initialize(): void {
        super.initialize();
    }

    /** @inheritdoc */
    override evaluate(): void {
        super.evaluate();
        this.deriveStructureState();
    }

    /** @inheritdoc */
    override finalize(): void {
        super.finalize();
        this.deriveStructureState();
    }
}

/**
 * Persisted data model for a {@link StructureLogic | Structure} actor. Carries
 * authored Health and capacity limits alongside the common actor fields.
 *
 * @typeParam TLogic - The logic class bound to this data.
 * @remarks The shape of `system` on a `structure` actor — i.e. `actor.system` (equivalently `actor.logic.data`) when `actor.type === "structure"`. The backing DataModel implements this interface.
 */
export interface StructureData<
    TLogic extends SohlActorLogic<StructureData> = SohlActorLogic<any>,
> extends SohlActorData<TLogic> {
    /** Stored occupant actor references, using the established occupant shape. */
    occupants: StructureOccupant[];
    /** Authored maximum Health; zero means no Health has been assigned. */
    maxHealth: number;
    /** Authored number of people the structure accommodates. */
    occupantCapacity: number;
    /** Authored cargo weight limit in pounds. */
    cargoCapacity: number;
}

/** Structure occupants use the existing actor-reference, role and title shape. */
export type StructureOccupant = VehicleOccupant;
/** Read-only sheet rows for stored Structure occupants. */
export type StructureOccupantRow = VehicleOccupantRow;
