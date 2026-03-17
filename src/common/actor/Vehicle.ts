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

import type { SohlActionContext } from "@common/SohlActionContext";
import {
    SohlActor,
    SohlActorBaseLogic,
    SohlActorData,
    SohlActorDataModel,
    SohlActorLogic,
    SohlActorSheetBase,
} from "@common/actor/SohlActor";
import { ACTOR_KIND, ACTOR_METADATA } from "@utils/constants";
const { ArrayField, SchemaField, StringField, NumberField, DocumentIdField } =
    foundry.data.fields;

/**
 * Logic for the **Vehicle** actor type — a movable inanimate conveyance.
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
 * (structural damage), Container Gear (cargo holds), and Actions. They are
 * often composed into an {@link AssemblyLogic | Assembly} alongside crew
 * Cohorts and mounted weapon Structures.
 *
 * @typeParam TData - The Vehicle data interface.
 */
export class VehicleLogic<
    TData extends VehicleData = VehicleData,
> extends SohlActorBaseLogic<TData> {
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
    }

    /** @inheritdoc */
    override finalize(): void {
        super.finalize();
    }
}

export interface VehicleData<
    TLogic extends SohlActorLogic<VehicleData> = SohlActorLogic<any>,
> extends SohlActorData<TLogic> {
    /**
     * Shortcodes of actors occupying this vehicle.
     * Each entry may reference a Being (individual) or a Cohort
     * (shorthand for all of that Cohort's members).
     */
    occupants: string[];
}

/**
 * Defines the data schema for the Vehicle actor.
 *
 * @returns The data schema for the Vehicle actor.
 */
function defineVehicleDataSchema(): foundry.data.fields.DataSchema {
    return {
        ...SohlActorDataModel.defineSchema(),
        occupants: new ArrayField(
            // The occupants may be either individual Being actors, or
            // Cohort actors representing groups of occupants.
            new StringField({
                blank: false,
                required: true,
            }),
            {
                initial: [],
            },
        ),
    };
}

type VehicleDataSchema = ReturnType<typeof defineVehicleDataSchema>;

/**
 * The Foundry VTT data model for the Vehicle actor.
 */
export class VehicleDataModel<
    TSchema extends foundry.data.fields.DataSchema = VehicleDataSchema,
    TLogic extends VehicleLogic<VehicleData> = VehicleLogic<VehicleData>,
> extends SohlActorDataModel<TSchema, TLogic> {
    static override readonly LOCALIZATION_PREFIXES = [
        "SOHL.Vehicle",
        "SOHL.Actor",
    ];
    static override readonly kind = ACTOR_KIND.VEHICLE;
    occupants!: string[];

    static defineSchema(): foundry.data.fields.DataSchema {
        return defineVehicleDataSchema();
    }
}

export class VehicleSheet extends SohlActorSheetBase {
    static DEFAULT_OPTIONS: PlainObject = {
        id: "vehicle-sheet",
        tag: "form",
        position: { width: 900, height: 640 },
        classes: ["sohl", "sheet", "actor", "vehicle"],
        dragDrop: [{ dragSelector: ".item-list .item", dropSelector: null }],
    };

    static PARTS = {
        header: { template: "systems/sohl/templates/actor/vehicle/header.hbs" },
        tabs: { template: "templates/generic/tab-navigation.hbs" },
        facade: { template: "systems/sohl/templates/actor/parts/facade.hbs" },
        gear: { template: "systems/sohl/templates/actor/parts/gear.hbs" },
        actions: { template: "systems/sohl/templates/actor/parts/actions.hbs" },
        effects: { template: "systems/sohl/templates/actor/parts/effects.hbs" },
    } as const;

    static TABS = {
        primary: {
            initial: "facade",
            tabs: [
                { id: "facade", label: "SOHL.Actor.SHEET.tab.facade.label", icon: "fas fa-masks-theater" },
                { id: "gear", label: "SOHL.Actor.SHEET.tab.gear.label", icon: "fas fa-briefcase" },
                { id: "actions", label: "SOHL.Actor.SHEET.tab.actions.label", icon: "fas fa-cogs" },
                { id: "effects", label: "SOHL.Actor.SHEET.tab.effects.label", icon: "fas fa-bolt" },
            ],
        },
    };
}
