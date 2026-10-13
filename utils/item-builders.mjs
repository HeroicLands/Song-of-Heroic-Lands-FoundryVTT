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

import { ITEM_BUILDERS as stockBuilders } from "@heroiclands/package-build/sohl/item-builders";
import { buildFromFields } from "@heroiclands/package-build/engine/field-spec";
import { resolveFieldValue } from "@heroiclands/package-build/engine/system-block";
import {
    parseSimpleRollExpression,
    simpleRollExpressionRange,
} from "../src/entity/roll/parseSimpleRollFormula.mjs";

const durationFields = new Set([
    "onsetDurationFormula",
    "healingCheckDurationFormula",
    "resolutionDurationFormula",
]);

/** Validate only Affliction's approved arithmetic dice grammar, without rolling dice. */
function durationRead(field) {
    return (raw, context) => {
        const value = field.read ? field.read(raw, context) : raw;
        if (value == null) return value;
        try {
            const ast = parseSimpleRollExpression(value);
            const { min, max } = simpleRollExpressionRange(ast);
            if (
                max < 0 ||
                !Number.isFinite(min) ||
                !Number.isFinite(max) ||
                Math.abs(min) > Number.MAX_SAFE_INTEGER ||
                Math.abs(max) > Number.MAX_SAFE_INTEGER ||
                (min === max && !Number.isSafeInteger(min))
            ) {
                throw new Error("Duration must have a possible nonnegative whole safe total");
            }
        } catch (cause) {
            const error = new Error(
                `Invalid affliction ${field.to}: ${JSON.stringify(value)} (${cause.message})`,
                { cause },
            );
            // The compiler resolves this key against the current note and emits
            // a source path/line finding. Reuse its canonical resolution order.
            const { from } = resolveFieldValue(field, context.fm);
            error.keyPath =
                from === "system" ? ["sohl", "system", field.to]
                : Object.hasOwn(context.fm, field.name) ? [field.name]
                : field.name.split(".");
            throw error;
        }
        return value;
    };
}

const fields = Object.freeze(
    stockBuilders.affliction.fields.map((field) =>
        durationFields.has(field.to) ?
            Object.freeze({
                ...field,
                shape: "dice and seconds with arithmetic operators and parentheses",
                read: durationRead(field),
            })
        :   field,
    ),
);

/** Preserve stock item types and metadata; only Affliction duration reads change. */
export const ITEM_BUILDERS = Object.freeze({
    ...stockBuilders,
    affliction: Object.freeze({
        ...stockBuilders.affliction,
        fields,
        system: buildFromFields(fields),
    }),
});
