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

import type { SafeExpression } from "@src/entity/expr/SafeExpression";

/**
 * A {@link foundry.data.fields.StringField} whose value is a
 * {@link SafeExpression} source string — a formula/predicate a GM authors (a
 * Skill's `skillBaseFormula`, an affliction's duration formula, and so on).
 *
 * It is a plain `StringField` on the wire — the value is still just the source
 * text. What it adds is a **semantic marker**: declaring a field as a
 * `SafeExpressionField` is how a sheet knows the field holds an expression and
 * warrants the SafeExpression **code editor** (an edit button that opens
 * `openExpressionEditorDialog`) rather than a bare text input.
 *
 * **It deliberately does _not_ reject an invalid expression at the schema
 * boundary.** By design a malformed formula is *stored* and *surfaced as a
 * warning* by the consuming logic (e.g. `SkillLogic.computeSkillBase` renders a
 * ✕ and an "Invalid expression" hint), so authors can save work-in-progress and
 * fix it later — hard schema rejection would discard it and break that flow. The
 * authoritative validity check ({@link SafeExpression.validateSource}) runs
 * **live in the editor**, where Save stays disabled until the expression is
 * valid.
 *
 * Defaults follow the null-at-the-edges convention for an optional "unset when
 * blank" string: `nullable`, non-`blank`, `initial: null` — a cleared editor or
 * form input cleans to `null`. Callers may override per field.
 */
export class SafeExpressionField extends foundry.data.fields.StringField {
    /** Optional, non-blank, nullable, unset-as-`null`, trimmed. */
    protected static override get _defaults(): foundry.data.fields.StringField.Options<unknown> {
        return foundry.utils.mergeObject(super._defaults, {
            nullable: true,
            blank: false,
            trim: true,
            initial: null,
        });
    }
}
