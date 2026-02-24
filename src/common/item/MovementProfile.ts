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

/**
 * # MovementProfile
 *
 * A MovementProfile models one form of movement across a variety of terrains.
 * For instance, a creature may be able to walk, swim, fly, or burrow. Each of
 * these would be represented by a separate movement profile.
 *
 * ## Movement Types
 *
 * Each movement profile tracks movement in two ways:
 *
 * ### Tactical Movement
 * Short-term movement, round to round, as normally determined during combat.
 * The movement profile tracks the speed of such movement as a single number:
 * the meters per round. This is the base movement speed, the normal speed of
 * movement for the indicated mode.
 *
 * ### Strategic Movement (Trekking)
 * Long-distance movement accounted in meters per watch. This is an array of
 * numbers, one for each terrain type. The terrain types are mode-specific,
 * as different movement modes encounter fundamentally different environments.
 */

import type { SohlActionContext } from "@common/SohlActionContext";

import {
    SohlItem,
    SohlItemBaseLogic,
    SohlItemData,
    SohlItemDataModel,
    SohlItemLogic,
    SohlItemSheetBase,
} from "@common/item/SohlItem";
import {
    ITEM_KIND,
    MOVEMENT_MEDIUM,
    MovementFactorModes,
    MovementMedium,
    MovementMediums,
} from "@utils/constants";
const { StringField, NumberField, BooleanField, ArrayField, SchemaField } =
    foundry.data.fields;

/* -----------------------------------------------------------------------------
 * The MovementProfile classes represent various forms of movement for actors.
 * Each profile indicates a movement medium (land, swimming, flying, etc.) and
 * tracks both tactical (meters per round) and strategic (meters per watch by
 * terrain type) movement rates.
 *
 * For a given medium, there may be various factors that modify movement rates.
 * For example, movement on a paved road may be at full movement speed, while
 * movement through a dense forest may be at half speed. These factors are
 * represented as an array of modifiers, each tied to a specific scope and key.
 * Only those modifiers that apply to the current terrain and conditions are
 * used to adjust the base movement rates.
 * -----------------------------------------------------------------------------
 */

export class MovementProfileLogic<
    TData extends MovementProfileData = MovementProfileData,
> extends SohlItemBaseLogic<TData> {
    /* --------------------------------------------- */
    /* Common Lifecycle Actions                      */
    /* --------------------------------------------- */

    /** @inheritdoc */
    override initialize(context: SohlActionContext): void {
        super.initialize(context);
    }

    /** @inheritdoc */
    override evaluate(context: SohlActionContext): void {
        super.evaluate(context);
    }

    /** @inheritdoc */
    override finalize(context: SohlActionContext): void {
        super.finalize(context);
    }
}

export interface MovementProfileData<
    TLogic extends SohlItemLogic<MovementProfileData> = SohlItemLogic<any>,
> extends SohlItemData<TLogic> {
    medium: MovementMedium;

    /** Tactical movement: meters per round (not terrain-specific) */
    metersPerRound: number;

    /** Overland movement: meters per watch per terrain type */
    metersPerWatch: number[];

    disabled: boolean;
}

function defineMovementProfileDataSchema(): foundry.data.fields.DataSchema {
    return {
        ...SohlItemDataModel.defineSchema(),
        medium: new StringField({
            required: true,
            choices: MovementMediums,
            initial: MOVEMENT_MEDIUM.TERRESTRIAL,
        }),
        metersPerRound: new NumberField({
            integer: true,
            min: 0,
            initial: 0,
        }),
        metersPerWatch: new NumberField({
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
                mode: new NumberField({
                    choices: MovementFactorModes,
                }),
                textValue: new StringField({
                    blank: false,
                }),
            }),
        ),
        disabled: new BooleanField({ initial: false }),
    };
}

type SohlMovementProfileDataSchema = ReturnType<
    typeof defineMovementProfileDataSchema
>;

export class MovementProfileDataModel<
        TSchema extends
            foundry.data.fields.DataSchema = SohlMovementProfileDataSchema,
        TLogic extends
            MovementProfileLogic<MovementProfileData> = MovementProfileLogic<MovementProfileData>,
    >
    extends SohlItemDataModel<TSchema, TLogic>
    implements MovementProfileData<TLogic>
{
    static override readonly LOCALIZATION_PREFIXES = [
        "SOHL.MovementProfile.DATA",
    ];
    static override readonly kind = ITEM_KIND.MOVEMENTPROFILE;
    medium!: MovementMedium;
    metersPerRound!: number;
    metersPerWatch!: number[];
    disabled!: boolean;

    static override defineSchema(): foundry.data.fields.DataSchema {
        return defineMovementProfileDataSchema();
    }
}

export class MovementProfileSheet extends SohlItemSheetBase {
    protected async _preparePropertiesContext(
        context: foundry.applications.api.DocumentSheetV2.RenderContext<SohlItem>,
        options: foundry.applications.api.DocumentSheetV2.RenderOptions,
    ): Promise<
        foundry.applications.api.DocumentSheetV2.RenderContext<SohlItem>
    > {
        return context;
    }
}
