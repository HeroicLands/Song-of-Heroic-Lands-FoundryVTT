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
import {
    expressionScopes,
    type ExpressionScope,
} from "@src/entity/expr/ExpressionScopeRegistry";

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
 * ## Using it
 *
 * Declare it in `defineSchema()` like any other field, naming the
 * {@link sohl.entity.expr.ExpressionScope} its value will be evaluated against:
 *
 * ```ts
 * static override defineSchema(): PlainObject {
 *     return {
 *         ...super.defineSchema(),
 *         // Evaluated by SkillLogic.computeSkillBase against `attr`.
 *         skillBaseFormula: new SafeExpressionField({ scope: "skill.base" }),
 *     };
 * }
 * ```
 *
 * Render it with the shared `expressionField` Handlebars partial, which draws
 * the `formGroup` plus the editor button and forwards the declared scope as
 * `data-expr-scope` — the sheet needs no per-field wiring:
 *
 * ```hbs
 * {{> expressionField field=fields.skillBaseFormula
 *     rootId="skill-sbf" name="system.skillBaseFormula"
 *     value=system.skillBaseFormula}}
 * ```
 *
 * Then evaluate the stored source against the *same* scope, so what the editor
 * accepted is exactly what the runtime allows:
 *
 * ```ts
 * const scope = expressionScopes.require("skill.base");
 * const expr = new SafeExpression({ source }, { parent: this, scope });
 * const value = expr.evaluate(scope.bind({ attr: this.buildAttrContext() }));
 * ```
 *
 * ## Options
 *
 * Every {@link foundry.data.fields.StringField} option is accepted (see
 * {@link SafeExpressionField.Options}); `scope` is the only one this class adds.
 *
 * | Option | Default here | Notes |
 * | ------ | ------------ | ----- |
 * | `scope` | _none_ | Id of the {@link sohl.entity.expr.ExpressionScope} the value is evaluated against. Optional, but omitting it means no identifier checking and no editor autocomplete — declare it unless the field genuinely has no fixed call site. Resolved eagerly, so an unknown id throws at schema construction. |
 * | `nullable` | `true` | Changed from `StringField`'s `false`: "unset" is `null`, per the null-at-the-edges convention. |
 * | `blank` | `false` | Changed from `StringField`'s `true`, so a cleared editor or form input cleans to `null` rather than leaving a second "empty" spelling (`""`). |
 * | `initial` | `null` | Unset by default; set it explicitly if a field ships with a formula. |
 * | `trim` | `true` | Same as `StringField` — restated because surrounding whitespace is never meaningful in an expression. |
 *
 * Only `nullable`, `blank`, and `initial` actually differ from `StringField`;
 * everything else (`required`, `label`, `hint`, `choices`, `validate`, …)
 * behaves exactly as it does there. Override any of them per field — but think
 * twice before reverting `nullable`/`blank`, since that pair is what keeps "no
 * formula" a single value instead of two. Both shipped fields
 * (`SkillDataModel.skillBaseFormula`, `AfflictionDataModel.outcomeTrauma`) pass
 * nothing but `scope`.
 *
 * The scope is what lets the *schema* tell the sheet which identifiers a formula
 * may use, so the editor's autocomplete and live validation match the call site
 * that actually evaluates it. Before scopes, the sheet template carried a
 * hand-typed `data-context="attr"` string with nothing tying it to the
 * evaluating code (issue #1142).
 */
export class SafeExpressionField extends foundry.data.fields.StringField {
    /**
     * Id of the {@link ExpressionScope} this field's expression is evaluated
     * against, or `undefined` when the field declares none.
     */
    readonly scope: string | undefined;

    /**
     * Construct the field, resolving any declared expression scope eagerly.
     *
     * @param options - `StringField` options, plus `scope`: the id of the
     *   expression scope this field's value is evaluated against.
     * @param context - Standard Foundry `DataField` context.
     * @throws {Error} If `scope` names a scope that is not declared in the
     *   expression-scope catalog.
     */
    constructor(
        options: SafeExpressionField.Options = {},
        context: object = {},
    ) {
        super(options as never, context as never);
        // Resolved eagerly so an unknown id is a startup error rather than a
        // field that silently validates nothing.
        if (options.scope !== undefined) {
            expressionScopes.require(options.scope);
        }
        this.scope = options.scope;
    }

    /** Optional, non-blank, nullable, unset-as-`null`, trimmed. */
    protected static override get _defaults(): foundry.data.fields.StringField.Options<unknown> {
        return foundry.utils.mergeObject(super._defaults, {
            nullable: true,
            blank: false,
            trim: true,
            initial: null,
        });
    }

    /**
     * The resolved {@link ExpressionScope} this field declares, if any. The
     * sheet hands it to the expression editor.
     */
    get expressionScope(): ExpressionScope | undefined {
        return expressionScopes.get(this.scope);
    }
}

export namespace SafeExpressionField {
    /**
     * Construction options: **every** {@link foundry.data.fields.StringField}
     * option — `required`, `nullable`, `blank`, `trim`, `initial`, `choices`,
     * `label`, `hint`, `validate`, `readonly`, … — plus `scope`, the only one
     * this field adds.
     *
     * The options are inherited by intersection rather than re-declared, so the
     * base set never drifts from Foundry's. Four of them carry different
     * defaults here (`nullable`, `blank`, `trim`, `initial`); see the table on
     * {@link SafeExpressionField} for those and when overriding is reasonable.
     */
    export type Options = ConstructorParameters<
        typeof foundry.data.fields.StringField
    >[0] & {
        /**
         * Id of the {@link sohl.entity.expr.ExpressionScope} declaring which
         * identifiers this field's expression may use (e.g. `"skill.base"`) —
         * the scope the value will be evaluated against at its call site.
         *
         * Drives the editor's autocomplete and its live out-of-scope check, and
         * reaches the sheet as `data-expr-scope` via the `expressionField`
         * partial. Resolved eagerly at construction, so an unknown or renamed id
         * throws while the schema is being built rather than yielding a field
         * that silently validates nothing.
         *
         * Optional: omit it only when the field has no single fixed call site —
         * an expression stored without a scope accepts any identifier.
         */
        scope?: string;
    };
}
