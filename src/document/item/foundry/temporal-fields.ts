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

const { StringField, NumberField } = foundry.data.fields;

/**
 * Compile-time schema helpers for the temporal fields shared by timed item
 * processes (injury healing / blood-loss, affliction phases).
 *
 * These stamp the repeating `{ …DurationFormula, …DurationBase, …Date }` field
 * triplet with consistent nullability, so every stored temporal fact follows the
 * same shape. They are ordinary DataModel fields — **not** a runtime store.
 *
 * Convention (see the Event Queue reference doc): store **facts, not
 * expectations**. Persist the rolled `DurationBase` and the crystallized `Date`
 * (once a phase fires); derive the future/expected dates on demand.
 *
 * @module temporalFields
 */

/**
 * A nullable world-time field. `null` = not-yet-determined; `0` is a valid
 * world-time, so "unset" must be `null` rather than a sentinel.
 *
 * @returns A `NumberField` configured for an optional world-time.
 */
export function worldTimeDateField(): foundry.data.fields.DataField.Any {
    return new NumberField({
        integer: true,
        required: false,
        nullable: true,
        initial: null,
    });
}

/**
 * A nullable duration-base field (seconds). Holds the rolled duration once
 * determined; `null` until then. Non-negative.
 *
 * @returns A `NumberField` configured for an optional duration in seconds.
 */
export function durationBaseField(): foundry.data.fields.DataField.Any {
    return new NumberField({
        integer: true,
        required: false,
        nullable: true,
        initial: null,
        min: 0,
    });
}

/**
 * A duration-formula field: the dice/expression string rolled to seed the
 * duration base by default (rolling is a default, not a requirement — the base
 * may be overridden or modified at any time). Blank when not applicable.
 *
 * @returns A `StringField` configured for an optional duration formula.
 */
export function durationFormulaField(): foundry.data.fields.DataField.Any {
    return new StringField({ initial: "" });
}

/**
 * The field triplet for a **one-shot** timed phase: `{name}DurationFormula`,
 * `{name}DurationBase`, and `{name}Date` (the crystallized actual, `null` until
 * the phase fires).
 *
 * @param name - The phase name (e.g. `"onset"`, `"resolution"`).
 * @returns A partial `DataSchema` to spread into a DataModel schema.
 */
export function phaseFields(name: string): foundry.data.fields.DataSchema {
    return {
        [`${name}DurationFormula`]: durationFormulaField(),
        [`${name}DurationBase`]: durationBaseField(),
        [`${name}Date`]: worldTimeDateField(),
    };
}

/**
 * The field triplet for a **recurring** timed process: `{name}DurationFormula`,
 * `{name}DurationBase` (the interval), and `last{Name}Date` — the anchor / high-
 * water mark of the last applied occurrence.
 *
 * @param name - The process name (e.g. `"healingCheck"`, `"bloodLossAdvance"`).
 * @returns A partial `DataSchema` to spread into a DataModel schema.
 */
export function recurringPhaseFields(
    name: string,
): foundry.data.fields.DataSchema {
    const cap = name.charAt(0).toUpperCase() + name.slice(1);
    return {
        [`${name}DurationFormula`]: durationFormulaField(),
        [`${name}DurationBase`]: durationBaseField(),
        [`last${cap}Date`]: worldTimeDateField(),
    };
}
