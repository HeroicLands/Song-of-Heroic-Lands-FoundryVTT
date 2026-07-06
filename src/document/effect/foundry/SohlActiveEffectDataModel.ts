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

import {
    ACTIVE_EFFECT_SCOPE,
    ActiveEffectScopeChoices,
} from "@src/utils/constants";
import type { SohlActiveEffect } from "@src/document/effect/foundry/SohlActiveEffect";

const {
    StringField,
    JavaScriptField,
    ArrayField,
    SchemaField,
    NumberField,
    AnyField,
} = foundry.data.fields;

/**
 * Builds the SoHL active-effect data schema: scope, a `test` SafeExpression,
 * and a Foundry-compatible `changes` array extended with `strikeModePredicate`.
 *
 * @returns The active-effect data schema.
 */
function defineActiveEffectDataSchema(): foundry.data.fields.DataSchema {
    return {
        scope: new StringField({
            blank: false,
            initial: ACTIVE_EFFECT_SCOPE.THIS,
            // Dynamic so newly-registered item types are included automatically.
            choices: () => ActiveEffectScopeChoices(),
        }),
        test: new JavaScriptField({}),
        // SYNC: replicate of foundry-vtt-dev/common/data/active-effect.mjs
        // (v14). Keep key/type/value/phase/priority verbatim per the upstream
        // doc comment: "A system can override the changes SchemaField but
        // must preserve definitions for type, phase, and priority."
        // SoHL extension: strikeModePredicate (last field).
        changes: new ArrayField(
            new SchemaField({
                key: new StringField({ required: true }),
                type: new StringField({
                    required: true,
                    blank: false,
                    initial: "add",
                }),
                value: new AnyField({
                    required: true,
                    nullable: false,
                    initial: "",
                }),
                phase: new StringField({
                    required: true,
                    blank: false,
                    initial: "initial",
                }),
                priority: new NumberField(),
                // SoHL extension — only consulted when key matches ^(mod:)?sm:
                strikeModePredicate: new JavaScriptField({}),
            }),
        ),
    };
}

type SohlActiveEffectDataSchema = ReturnType<
    typeof defineActiveEffectDataSchema
>;

/** @internal */
export class SohlActiveEffectDataModel<
    TSchema extends foundry.data.fields.DataSchema = SohlActiveEffectDataSchema,
> extends foundry.abstract.TypeDataModel<TSchema, SohlActiveEffect> {
    static override readonly LOCALIZATION_PREFIXES = ["SOHL.ActiveEffect"];
    static readonly kind = "sohleffectdata";
    scope!: string;
    test!: string;
    changes!: Array<{
        key: string;
        type: string;
        value: unknown;
        phase: string;
        priority?: number | null;
        strikeModePredicate?: string;
    }>;

    /**
     * Returns the SoHL active-effect data schema.
     *
     * @returns The active-effect data schema.
     */
    static override defineSchema(): foundry.data.fields.DataSchema {
        return defineActiveEffectDataSchema();
    }
}
