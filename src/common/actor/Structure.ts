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
 * Logic for the **Structure** actor type — a fixed installation or location.
 *
 * A Structure represents a building, fortification, bridge, ship hull, or any
 * other immovable (or semi-permanent) physical entity that can be targeted,
 * damaged, and repaired. Structures can own items such as Protection entries
 * (representing walls, doors, or barriers), Injuries (structural damage),
 * Domains (jurisdiction), and Affiliations (ownership).
 *
 * Structures do not have anatomy, skills, or movement profiles. Their primary
 * mechanical role is as targets in siege or environmental encounters and as
 * containers for location-based items and effects.
 *
 * @typeParam TData - The Structure data interface.
 */
export class StructureLogic<
    TData extends StructureData = StructureData,
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

export interface StructureData<
    TLogic extends SohlActorLogic<StructureData> = SohlActorLogic<any>,
> extends SohlActorData<TLogic> {}

/**
 * Defines the data schema for the Structure actor.
 *
 * @remarks
 *
 * @returns The data schema for the Structure actor.
 */
function defineStructureDataSchema(): foundry.data.fields.DataSchema {
    return {
        ...SohlActorDataModel.defineSchema(),
    };
}

type StructureDataSchema = ReturnType<typeof defineStructureDataSchema>;

/**
 * The Foundry VTT data model for the Structure actor.
 */
export class StructureDataModel<
    TSchema extends foundry.data.fields.DataSchema = StructureDataSchema,
    TLogic extends
        StructureLogic<StructureData> = StructureLogic<StructureData>,
> extends SohlActorDataModel<TSchema, TLogic> {
    static override readonly LOCALIZATION_PREFIXES = ["SOHL.Structure", "SOHL.Actor"];
    static override readonly kind = ACTOR_KIND.STRUCTURE;

    static defineSchema(): foundry.data.fields.DataSchema {
        return defineStructureDataSchema();
    }
}

export class StructureSheet extends SohlActorSheetBase {
    static DEFAULT_OPTIONS: PlainObject = {
        id: "structure-sheet",
        tag: "form",
        position: { width: 900, height: 640 },
        classes: ["sohl", "sheet", "actor", "structure"],
        dragDrop: [{ dragSelector: ".item-list .item", dropSelector: null }],
    };

    static PARTS = {
        header: { template: "systems/sohl/templates/actor/structure/header.hbs" },
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
