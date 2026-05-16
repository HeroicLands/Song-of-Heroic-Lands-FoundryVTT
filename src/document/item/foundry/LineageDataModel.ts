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

import { SohlItemDataModel } from "@src/document/item/foundry/SohlItem";
import {
    LineageLogic,
    LineageData,
} from "@src/document/item/logic/LineageLogic";
import { BodyStructure } from "@src/domain/body/BodyStructure";
import { MovementProfile } from "@src/domain/movement/MovementProfile";
import {
    Amputabilities,
    AMPUTABILITY,
    BleedingSusceptibilities,
    BLEEDING_SUSCEPTIBILITY,
    BodyZones,
    ITEM_KIND,
    MOVEMENT_MEDIUM,
    MovementFactorModes,
    MovementMediums,
} from "@src/utils/constants";
const {
    StringField,
    NumberField,
    BooleanField,
    DocumentIdField,
    SchemaField,
    ArrayField,
} = foundry.data.fields;

function defineLineageDataSchema(): foundry.data.fields.DataSchema {
    return {
        ...SohlItemDataModel.defineSchema(),
        bodyStructure: new SchemaField({
            parts: new ArrayField(
                new SchemaField({
                    shortcode: new StringField({ blank: false }),
                    name: new StringField({ blank: false }),
                    /**
                     * Functional zones this part fulfills. Skills and attributes
                     * declare which zones impair them; injury at this part
                     * impairs every skill/attribute that lists any of these
                     * zones. Mishap behavior is also zone-driven: VITAL/CORE
                     * trigger fumble + stumble checks on Serious injury (auto
                     * on Grievous); MANIPULATOR triggers fumble; LOCOMOTOR
                     * triggers stumble. See BodyZone in constants.
                     */
                    zones: new ArrayField(
                        new StringField({
                            blank: false,
                            choices: BodyZones,
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
                                choices: BleedingSusceptibilities,
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
                                choices: Amputabilities,
                                initial: AMPUTABILITY.NONE,
                            }),
                            shockValue: new NumberField({
                                integer: true,
                                initial: 0,
                                min: 0,
                            }),
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
        movementProfiles: new ArrayField(
            new SchemaField({
                medium: new StringField({
                    required: true,
                    choices: MovementMediums,
                    initial: MOVEMENT_MEDIUM.TERRESTRIAL,
                }),
                /** Tactical speed in feet per combat round. */
                feetPerRound: new NumberField({
                    integer: true,
                    min: 0,
                    initial: 0,
                }),
                /** Strategic speed in leagues per 4-hour watch (1 league ≈ 3 miles). */
                leaguesPerWatch: new NumberField({
                    integer: true,
                    min: 0,
                    initial: 0,
                }),
                factors: new ArrayField(
                    new SchemaField({
                        scope: new StringField({
                            blank: false,
                        }),
                        key: new StringField({
                            blank: false,
                        }),
                        mode: new StringField({
                            choices: MovementFactorModes,
                        }),
                        textValue: new StringField({
                            blank: false,
                        }),
                    }),
                ),
                disabled: new BooleanField({ initial: false }),
            }),
            { initial: [] },
        ),
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
    };
}

type SohlLineageDataSchema = ReturnType<typeof defineLineageDataSchema>;

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
    movementProfiles!: MovementProfile.Data[];
    encumbranceRate!: number;
    bodyWeightBase!: number;

    static override defineSchema(): foundry.data.fields.DataSchema {
        return defineLineageDataSchema();
    }
}
