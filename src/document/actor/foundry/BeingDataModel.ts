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
import { ACTOR_KIND } from "@src/utils/constants";
import type { BeingData } from "@src/document/actor/logic/BeingLogic";
import { BeingLogic } from "@src/document/actor/logic/BeingLogic";
const { StringField } = foundry.data.fields;
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
     * Returns the Being data schema.
     *
     * @returns The Being data schema.
     */
    static override defineSchema(): foundry.data.fields.DataSchema {
        return defineBeingDataSchema();
    }
}
