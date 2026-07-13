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
import { CorpusLogic, CorpusData } from "@src/document/item/logic/CorpusLogic";
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
    JavaScriptField,
} = foundry.data.fields;

/**
 * Builds the data schema for a corpus item, extending the base item schema
 * with body structure, movement, encumbrance, body weight, and reach fields.
 * @returns The corpus item data schema.
 */
function defineCorpusDataSchema(): foundry.data.fields.DataSchema {
    return {
        ...SohlItemDataModel.defineSchema(),
        structure: new SchemaField({
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
         * for creatures of this corpus. Seeded onto each new combatant at
         * combatant creation time.
         */
        defaultMoveMedium: new StringField({
            required: true,
            choices: MovementMediumChoices,
            initial: MOVEMENT_MEDIUM.TERRESTRIAL,
        }),
        /**
         * Personal fatigue as a {@link sohl.entity.expr.SafeExpression} of the being's current
         * encumbrance (`enc`). Evaluated after encumbrance is known to yield the
         * fatigue penalty the being suffers from the weight it carries.
         */
        personalFatigue: new JavaScriptField({
            blank: false,
            initial: "enc",
        }),
        /**
         * Per-medium movement profiles. Each entry describes how the being moves
         * in one {@link MovementMedium}: its tactical and travel speeds, and the
         * {@link sohl.entity.expr.SafeExpression}s that turn carried weight into encumbrance
         * (`encumbrance`, of `wt`) and shift it by strength (`strMod`, of `str`).
         * `moveBase[medium]` mirrors the matching entry's `feetPerRound` so Active
         * Effects and the movement system keep a stable per-medium scalar to read.
         */
        movementProfiles: new ArrayField(
            new SchemaField({
                /** The movement medium this profile describes. */
                medium: new StringField({
                    required: true,
                    choices: MovementMediumChoices,
                    initial: MOVEMENT_MEDIUM.TERRESTRIAL,
                }),
                /** Tactical move (feet per combat round) in this medium. */
                feetPerRound: new NumberField({
                    integer: true,
                    min: 0,
                    initial: 0,
                }),
                /** Overland travel speed (leagues per watch) in this medium. */
                leaguesPerWatch: new NumberField({
                    integer: false,
                    min: 0,
                    initial: 0,
                }),
                /**
                 * A {@link sohl.entity.expr.SafeExpression} of the being's carried weight (`wt`)
                 * giving the encumbrance units it costs in this medium.
                 */
                encumbrance: new JavaScriptField({
                    blank: false,
                    initial: "0",
                }),
                /**
                 * Strength modifier — a {@link sohl.entity.expr.SafeExpression} of the being's
                 * strength (`str`) that shifts its encumbrance in this medium.
                 */
                strMod: new JavaScriptField({
                    blank: false,
                    initial: "0",
                }),
                /** Whether this movement profile is disabled. */
                disabled: new BooleanField({ initial: false }),
            }),
            { initial: [] },
        ),
        /**
         * The being's body weight (not including gear). Either a fixed `base`
         * (pounds) or, when `base` is null, a {@link sohl.entity.expr.SafeExpression} `calc` of the
         * being's strength (`str`). Seeds {@link sohl.document.item.logic.CorpusLogic.weight}.
         */
        weight: new SchemaField({
            /** Fixed body weight in pounds; null to compute from `calc`. */
            base: new NumberField({
                integer: true,
                min: 0,
                nullable: true,
                initial: null,
            }),
            /** A {@link sohl.entity.expr.SafeExpression} of `str` giving body weight when `base` is null. */
            calc: new JavaScriptField({
                blank: false,
                initial: "0",
            }),
        }),
        /**
         * Base melee reach (feet) for creatures of this corpus, reflecting
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

type SohlCorpusDataSchema = ReturnType<typeof defineCorpusDataSchema>;

/** @internal */
export class CorpusDataModel<
    TSchema extends foundry.data.fields.DataSchema = SohlCorpusDataSchema,
    TLogic extends CorpusLogic<CorpusData> = CorpusLogic<CorpusData>,
>
    extends SohlItemDataModel<TSchema, TLogic>
    implements CorpusData<TLogic>
{
    /** @inheritDoc */
    static override readonly LOCALIZATION_PREFIXES = [
        "SOHL.Corpus",
        "SOHL.Item",
    ];
    /** @inheritDoc */
    static override readonly kind = ITEM_KIND.CORPUS;
    structure!: BodyStructure.Data;
    moveBase!: MoveBaseDict;
    defaultMoveMedium!: MovementMedium;
    personalFatigue!: string;
    movementProfiles!: CorpusData["movementProfiles"];
    weight!: CorpusData["weight"];
    reachBase!: number;

    /**
     * Defines the data schema for the corpus item.
     * @returns The corpus item data schema.
     */
    static override defineSchema(): foundry.data.fields.DataSchema {
        return defineCorpusDataSchema();
    }

    /**
     * Enforce the Corpus singleton: refuse to create a corpus on an actor that
     * already has one. (Zero corpora — the degenerate no-body case — is allowed;
     * more than one never is.) Covers every embed path — drag-drop, paste, and
     * `createEmbeddedDocuments` — since the document's `_preCreate` runs for all
     * of them. A non-embedded (world/compendium) corpus has no owning actor and
     * is unaffected.
     *
     * @param data - The creation source data.
     * @param options - The creation options.
     * @param user - The requesting user.
     * @returns `false` to veto the creation, otherwise void.
     */
    protected override async _preCreate(
        data: PlainObject,
        options: PlainObject,
        user: User,
    ): Promise<boolean | void> {
        const allowed = await super._preCreate(
            data as any,
            options as any,
            user as any,
        );
        if (allowed === false) return false;
        const actor = (this.parent as any)?.actor;
        if (actor && (actor.itemTypes?.[ITEM_KIND.CORPUS]?.length ?? 0) > 0) {
            (globalThis as any).ui?.notifications?.warn(
                "This being already has a corpus; delete the current one first.",
            );
            return false;
        }
        return undefined;
    }
}
