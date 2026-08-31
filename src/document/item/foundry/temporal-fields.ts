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
    return new StringField({ nullable: true, blank: false, initial: null });
}

/*
 * `phaseFields(name)` and `durationFields(name)` used to live here, building
 * `{name}DurationFormula`, `{name}DurationBase` and `{name}Date` from a
 * template literal. They are gone, and deliberately not replaced.
 *
 * A schema whose keys are assembled from an argument has field names that exist
 * only after the argument is applied — so they are not in the source, and
 * `package-build schema`, which reads this file as data rather than running it,
 * could not name them. All fourteen fields were missing from the published
 * schema, and content authoring `system.onsetDate` would have been told no
 * DataModel declares it.
 *
 * The two callers now spell the names out and call the field helpers above
 * directly. The saving was three lines per phase; the cost was a schema that
 * could not describe a third of what `affliction` and `trauma` actually store.
 *
 * The recurrence *anchor* is not among them: it lives in the generic
 * `system.scheduledActions` store (issue #588), whose entry's
 * `anchor + interval` is the next fire time.
 */
