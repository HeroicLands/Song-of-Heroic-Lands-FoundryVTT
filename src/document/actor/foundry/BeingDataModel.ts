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

import { SohlActorDataModel } from "@src/document/actor/foundry/SohlActorDataModel";
import {
    ACTOR_KIND,
    AMPUTABILITY,
    BLEEDING_SUSCEPTIBILITY,
    BodyRoleChoices,
    BleedingSusceptibilityChoices,
    AmputabilityChoices,
} from "@src/utils/constants";
import type { BeingData } from "@src/document/actor/logic/BeingLogic";
import { BeingLogic } from "@src/document/actor/logic/BeingLogic";
const {
    StringField,
    NumberField,
    BooleanField,
    DocumentIdField,
    SchemaField,
    ArrayField,
    JavaScriptField,
} = foundry.data.fields;
/**
 * Builds the Being data schema, inheriting the base actor schema unchanged.
 *
 * @returns The Being data schema.
 */
function defineBeingDataSchema(): foundry.data.fields.DataSchema {
    return {
        ...SohlActorDataModel.defineSchema(),
        /**
         * The {@link CombatantGroup} name this Being's combatants are auto-
         * assigned to when they enter combat (unset → the default group). Read
         * by `SohlCombat.seedCombatantGroups` at combatant creation. Lives on the
         * actor (not the token) because tokens cannot carry typed system data.
         */
        defaultCombatGroup: new StringField({
            required: false,
            blank: false,
            nullable: true,
            initial: null,
        }),
        /**
         * The being's **physical body** — its anatomy, weight, reach, and
         * body-scale. Dissolved from the former Corpus item into the Being
         * (#535). An **incorporeal** being (a spirit) is modeled as an empty
         * {@link body.structure} (`parts: []`), not an absent item. Movement,
         * once part of the corpus, is now a universal actor capability on
         * {@link SohlActorDataModel} (`currentMoveMedium` / `movementProfiles`).
         */
        body: new SchemaField({
            /** The anatomical structure — body parts, hit locations, adjacency. */
            structure: new SchemaField({
                parts: new ArrayField(
                    new SchemaField({
                        shortcode: new StringField({ blank: false }),
                        name: new StringField({ blank: false }),
                        /**
                         * Functional roles this part fulfills. Skills and
                         * attributes declare which roles impair them; injury at
                         * this part impairs every skill/attribute that lists any
                         * of these roles. Mishap behavior is also role-driven:
                         * VITAL/CORE trigger fumble + stumble checks on Serious
                         * injury (auto on Grievous); MANIPULATOR triggers fumble;
                         * LOCOMOTOR triggers stumble. See BodyRole in constants.
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
                         * Permanent impairment for this part — a manually-set,
                         * non-positive floor (e.g. an old maiming) that the
                         * part's derived impairment can never be milder than.
                         * `0` means no permanent impairment.
                         */
                        permanentImpairment: new NumberField({
                            integer: true,
                            initial: 0,
                            max: 0,
                        }),
                        /**
                         * Manually-set flag marking this part permanently
                         * unusable (a withered or fully-amputated limb). Unlike
                         * permanent impairment, it makes the part unusable
                         * regardless of tier.
                         */
                        permanentlyUnusable: new BooleanField({
                            initial: false,
                        }),
                        /**
                         * Target area of this part for hit-spread mechanics, in
                         * square feet. Doubles as the weight used when picking a
                         * random part for unaimed attacks.
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
                                 * Bleeding susceptibility tier (none / low / mid
                                 * / high). Combines with injury severity and
                                 * weapon aspect to determine whether a wound is a
                                 * Bleeder.
                                 */
                                bleedingSusceptibility: new StringField({
                                    blank: false,
                                    choices: BleedingSusceptibilityChoices,
                                    initial: BLEEDING_SUSCEPTIBILITY.NONE,
                                }),
                                /**
                                 * Amputability tier. Determines the Strength test
                                 * modifier when a G5 Edge injury occurs at this
                                 * location.
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
             * The being's body weight (not including gear). Either a fixed
             * `base` (pounds) or, when `base` is null, a `SafeExpression` `calc`
             * of the being's strength (`str`).
             */
            weight: new SchemaField({
                /** Fixed body weight in pounds; null to compute from `calc`. */
                base: new NumberField({
                    integer: true,
                    min: 0,
                    nullable: true,
                    initial: null,
                }),
                /** A `SafeExpression` of `str` giving body weight when `base` is null. */
                calc: new JavaScriptField({ blank: false, initial: "0" }),
            }),
            /**
             * Base melee reach (feet) for this being, reflecting body size.
             * Medium creatures (e.g. humans) are 0; larger creatures are
             * positive. Combined with a melee strike mode's effective length to
             * produce that mode's actual reach.
             */
            reachBase: new NumberField({ integer: false, initial: 0 }),
            /**
             * Per-creature body-scale factor (larger = tougher/bigger body).
             * Scales the injury-level thresholds so an absolute impact reads
             * size-correct: seed from `(typical species STR) / 11`, so a human
             * is `1.0`.
             */
            bodyScaleBase: new NumberField({
                integer: false,
                initial: 1.0,
                min: 0.01,
            }),
            /**
             * Personal fatigue as a `SafeExpression` of the being's current
             * encumbrance (`enc`).
             */
            personalFatigue: new JavaScriptField({
                blank: false,
                initial: "enc",
            }),
        }),
    };
}

type BeingDataSchema = ReturnType<typeof defineBeingDataSchema>;

/**
 * The Foundry VTT data model for the Being actor.
 * @internal
 */
export class BeingDataModel<
    TSchema extends foundry.data.fields.DataSchema = BeingDataSchema,
    TLogic extends BeingLogic<BeingData> = BeingLogic<BeingData>,
>
    extends SohlActorDataModel<TSchema, TLogic>
    implements BeingData<TLogic>
{
    /** @inheritDoc */
    static override readonly LOCALIZATION_PREFIXES = [
        "SOHL.Being",
        "SOHL.Actor",
    ];
    /** @inheritDoc */
    static override readonly kind = ACTOR_KIND.BEING;

    /**
     * The {@link CombatantGroup} name this Being's combatants are auto-assigned
     * to on entering combat; unset (`null`) uses the default group.
     */
    defaultCombatGroup!: string | null;

    /**
     * The being's physical body (anatomy, weight, reach, body-scale). An
     * incorporeal being has an empty `body.structure.parts`.
     */
    body!: BeingData["body"];

    /**
     * Returns the Being data schema.
     *
     * @returns The Being data schema.
     */
    static override defineSchema(): foundry.data.fields.DataSchema {
        return defineBeingDataSchema();
    }
}
