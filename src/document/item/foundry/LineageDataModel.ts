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

import { SohlItemDataModel } from "@src/document/item/foundry/SohlItemDataModel";
import {
    LineageLogic,
    LineageData,
} from "@src/document/item/logic/LineageLogic";
import { BodyStructure } from "@src/entity/body/BodyStructure";
import type { MoveBaseDict } from "@src/entity/movement/move-helpers";
import {
    Amputabilities,
    AMPUTABILITY,
    BleedingSusceptibilities,
    BLEEDING_SUSCEPTIBILITY,
    BodyRoles,
    ITEM_KIND,
    MOVEMENT_MEDIUM,
    MovementMedium,
    MovementMediums,
    BodyRoleChoices,
    BleedingSusceptibilityChoices,
    AmputabilityChoices,
    MovementMediumChoices,
} from "@src/utils/constants";
const {
    StringField,
    NumberField,
    BooleanField,
    DocumentIdField,
    SchemaField,
    ArrayField,
} = foundry.data.fields;

/**
 * Builds the data schema for a lineage item, extending the base item schema
 * with body structure, movement, encumbrance, body weight, and reach fields.
 * @returns The lineage item data schema.
 */
function defineLineageDataSchema(): foundry.data.fields.DataSchema {
    return {
        ...SohlItemDataModel.defineSchema(),
        bodyStructure: new SchemaField({
            parts: new ArrayField(
                new SchemaField({
                    shortcode: new StringField({ blank: false }),
                    name: new StringField({ blank: false }),
                    /**
                     * Functional roles this part fulfills. Skills and attributes
                     * declare which roles impair them; injury at this part
                     * impairs every skill/attribute that lists any of these
                     * roles. Mishap behavior is also role-driven: VITAL/CORE
                     * trigger fumble + stumble checks on Serious injury (auto
                     * on Grievous); MANIPULATOR triggers fumble; LOCOMOTOR
                     * triggers stumble. See BodyRole in constants.
                     */
                    roles: new ArrayField(
                        new StringField({
                            blank: false,
                            choices: BodyRoleChoices,
                        }),
                        { initial: [] },
                    ),
                    /** Indicates if this part is favored for certain actions */
                    favoredFlag: new BooleanField({ initial: false }),
                    /** Indicates if this part can hold an item */
                    canHoldItem: new BooleanField({ initial: false }),
                    /** The ID of the item held by this part, if any */
                    heldItemId: new DocumentIdField({
                        nullable: true,
                        initial: null,
                    }),
                    /**
                     * Target area of this part for hit-spread mechanics, in
                     * square feet. Doubles as the weight used when picking
                     * a random part for unaimed attacks (volley fire,
                     * blind swings): probability of hitting a given part
                     * is its combatArea divided by the sum of combatArea
                     * across all parts.
                     */
                    combatArea: new NumberField({
                        integer: false,
                        initial: 0,
                        min: 0,
                    }),
                    /** A list of the locations on this part */
                    locations: new ArrayField(
                        new SchemaField({
                            shortcode: new StringField({ blank: false }),
                            name: new StringField({ blank: false }),
                            /**
                             * Bleeding susceptibility tier. The rulebook's
                             * shaded circle (none / white / grey / black).
                             * Combines with injury severity and weapon
                             * aspect via BleedingDefaults to determine
                             * whether a wound is a Bleeder.
                             */
                            bleedingSusceptibility: new StringField({
                                blank: false,
                                choices: BleedingSusceptibilityChoices,
                                initial: BLEEDING_SUSCEPTIBILITY.NONE,
                            }),
                            /**
                             * Amputability tier. The rulebook's shaded
                             * triangle (none / white / grey / black).
                             * Determines the Strength test modifier when
                             * a G5 Edge injury occurs at this location;
                             * see AmputationDefaults.
                             */
                            amputability: new StringField({
                                blank: false,
                                choices: AmputabilityChoices,
                                initial: AMPUTABILITY.NONE,
                            }),
                            shockValue: new NumberField({
                                integer: true,
                                initial: 0,
                                min: 0,
                            }),
                            /**
                             * A Serious injury here forces a stumble roll; a
                             * Grievous injury stumbles automatically.
                             */
                            isStumble: new BooleanField({ initial: false }),
                            /**
                             * A Serious injury here forces a fumble roll; a
                             * Grievous injury fumbles automatically.
                             */
                            isFumble: new BooleanField({ initial: false }),
                            probWeight: new NumberField({
                                integer: true,
                                initial: 0,
                                min: 0,
                            }),
                            protectionBase: new SchemaField({
                                blunt: new NumberField({
                                    integer: true,
                                    initial: 0,
                                    min: 0,
                                }),
                                edged: new NumberField({
                                    integer: true,
                                    initial: 0,
                                    min: 0,
                                }),
                                piercing: new NumberField({
                                    integer: true,
                                    initial: 0,
                                    min: 0,
                                }),
                                fire: new NumberField({
                                    integer: true,
                                    initial: 0,
                                    min: 0,
                                }),
                            }),
                        }),
                        { initial: [] },
                    ),
                }),
                { initial: [] },
            ),
            /** A list of the parts adjacent to each part */
            adjacent: new ArrayField(
                new ArrayField(new StringField({ blank: false }), {
                    initial: [],
                }),
                { initial: [] },
            ),
        }),
        /**
         * Per-medium base tactical move in feet per combat round.
         * A value of 0 means the creature cannot move in that medium.
         * Active Effects can target individual entries (e.g.
         * `system.moveBase.terrestrial`) to apply haste, encumbrance, etc.
         */
        moveBase: new SchemaField({
            terrestrial: new NumberField({
                integer: true,
                min: 0,
                initial: 0,
            }),
            aquatic: new NumberField({
                integer: true,
                min: 0,
                initial: 0,
            }),
            aerial: new NumberField({
                integer: true,
                min: 0,
                initial: 0,
            }),
            burrowing: new NumberField({
                integer: true,
                min: 0,
                initial: 0,
            }),
            astral: new NumberField({
                integer: true,
                min: 0,
                initial: 0,
            }),
        }),
        /**
         * The medium that should be shown in the combat tracker by default
         * for creatures of this lineage. Seeded onto each new combatant at
         * combatant creation time.
         */
        defaultMoveMedium: new StringField({
            required: true,
            choices: MovementMediumChoices,
            initial: MOVEMENT_MEDIUM.TERRESTRIAL,
        }),
        /** Represents the number of pounds of gear that equates to 1 unit of encumbrance */
        encumbranceRate: new NumberField({
            integer: false,
            initial: 0,
            min: 0,
        }),
        /** The weight of the being's body not including any gear */
        bodyWeightBase: new NumberField({
            integer: true,
            initial: 0,
            min: 0,
        }),
        /**
         * Base melee reach (feet) for creatures of this lineage, reflecting
         * body size. Medium creatures (e.g. humans) are 0; larger creatures
         * (e.g. a dragon with a large token) are positive — this is how token
         * size is accounted for in melee reach, since combat distance is
         * measured center-to-center (see `SohlCombatant.reaches`). Combined
         * with a melee strike mode's effective length to produce that mode's
         * actual reach. Active Effects can target `system.reachBase` to model
         * size-changing effects.
         */
        reachBase: new NumberField({
            integer: false,
            initial: 0,
        }),
    };
}

type SohlLineageDataSchema = ReturnType<typeof defineLineageDataSchema>;

/** @internal */
export class LineageDataModel<
    TSchema extends foundry.data.fields.DataSchema = SohlLineageDataSchema,
    TLogic extends LineageLogic<LineageData> = LineageLogic<LineageData>,
>
    extends SohlItemDataModel<TSchema, TLogic>
    implements LineageData<TLogic>
{
    static override readonly LOCALIZATION_PREFIXES = [
        "SOHL.Lineage",
        "SOHL.Item",
    ];
    static override readonly kind = ITEM_KIND.LINEAGE;
    bodyStructure!: BodyStructure.Data;
    moveBase!: MoveBaseDict;
    defaultMoveMedium!: MovementMedium;
    encumbranceRate!: number;
    bodyWeightBase!: number;
    reachBase!: number;

    /**
     * Defines the data schema for the lineage item.
     * @returns The lineage item data schema.
     */
    static override defineSchema(): foundry.data.fields.DataSchema {
        return defineLineageDataSchema();
    }
}
