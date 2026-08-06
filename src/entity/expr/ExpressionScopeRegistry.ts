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

import { EXPRESSION_SCOPES } from "./expression-scopes.mjs";

/**
 * The declaration behind one {@link ExpressionScope}, as authored in the
 * plain-ESM catalog `src/entity/expr/expression-scopes.mjs`.
 */
export interface ExpressionScopeData {
    /** Short human name, used as the generated docs-table row title. */
    label: string;
    /** Where the expression is authored — for the generated docs table. */
    site: string;
    /** The data field(s) this scope applies to — for the generated docs table. */
    field: string;
    /** What the expression is expected to evaluate to. */
    result: string;
    /** One sentence on when this scope applies. */
    summary: string;
    /**
     * When `true`, identifiers beyond the declared bindings are permitted (the
     * declarations are documentation and autocomplete only). Reserved for
     * genuinely dynamic contexts — see the `event.predicate` scope.
     */
    open?: boolean;
    /** The legal identifiers, each mapped to its authoring description. */
    bindings: Readonly<Record<string, string>>;
}

/**
 * The set of identifiers a {@link sohl.entity.expr.SafeExpression} may use at
 * one call site — SoHL's answer to "what is actually in scope here?".
 *
 * Before scopes existed, every call site built an ad-hoc object literal and
 * handed it to `evaluate()`; nothing connected the identifiers an author could
 * write to the identifiers that site actually bound, so an out-of-scope name
 * (say `actorLogic` where only `itemLogic` is bound) parsed cleanly, threw at
 * evaluation, was caught by the caller, and silently disabled the feature. A
 * scope makes that contract a declared, checkable object:
 *
 * - **Construction rejects** an undeclared identifier, so the mistake surfaces
 *   once, where the expression is authored — not as a warning per render.
 * - **{@link bind}** checks the other direction: that the call site supplies
 *   exactly what it promised.
 * - **{@link names} and {@link describe}** drive the editor's autocomplete and
 *   the generated documentation, so neither can drift from the code.
 *
 * Scopes are declared in `expression-scopes.mjs` and reached through the
 * {@link expressionScopes} registry; they are never constructed ad hoc.
 *
 * @see {@link expressionScopes} — the registry of every declared scope.
 */
export class ExpressionScope {
    /** Stable dotted id, e.g. `"action.visible"`. */
    readonly id: string;

    /** The declaration this scope wraps. */
    private readonly data: ExpressionScopeData;

    /**
     * Signatures already reported by {@link bind}, so a mismatched call site
     * logs once per shape rather than on every render.
     */
    private readonly reported = new Set<string>();

    /**
     * Wrap a catalog declaration. Called only by the registry — obtain scopes
     * via {@link expressionScopes}, never by constructing one.
     * @param id - The scope's stable id.
     * @param data - The catalog declaration.
     */
    constructor(id: string, data: ExpressionScopeData) {
        this.id = id;
        this.data = data;
    }

    /** Short human name for this scope. */
    get label(): string {
        return this.data.label;
    }

    /** One sentence on when this scope applies. */
    get summary(): string {
        return this.data.summary;
    }

    /** Where the expression is authored (for generated documentation). */
    get site(): string {
        return this.data.site;
    }

    /** The data field(s) this scope applies to (for generated documentation). */
    get field(): string {
        return this.data.field;
    }

    /** What the expression is expected to evaluate to. */
    get result(): string {
        return this.data.result;
    }

    /**
     * Whether undeclared identifiers are permitted. `true` only for genuinely
     * dynamic contexts, where the declared bindings serve as documentation and
     * autocomplete rather than as a gate.
     */
    get open(): boolean {
        return this.data.open === true;
    }

    /** The declared identifier names, in declaration order. */
    get names(): string[] {
        return Object.keys(this.data.bindings);
    }

    /**
     * Whether an identifier is declared by this scope. Note this asks about the
     * *declaration*, not about a runtime context — a declared binding may still
     * evaluate to `undefined` (an unresolved item's `itemLogic`, say), which is
     * an absent value, not an out-of-scope identifier.
     * @param name - The identifier to look up.
     * @returns Whether the identifier is declared.
     */
    has(name: string): boolean {
        return Object.prototype.hasOwnProperty.call(this.data.bindings, name);
    }

    /**
     * Whether an identifier may appear in an expression using this scope —
     * {@link has}, or anything at all when the scope is {@link open}.
     * @param name - The identifier to check.
     * @returns Whether the identifier is permitted.
     */
    allows(name: string): boolean {
        return this.open || this.has(name);
    }

    /**
     * The authoring description of one declared identifier.
     * @param name - The identifier to describe.
     * @returns Its description, or `undefined` if not declared.
     */
    describe(name: string): string | undefined {
        return this.has(name) ? this.data.bindings[name] : undefined;
    }

    /**
     * Check a call site's evaluation context against this declaration and
     * return it, ready to hand to `evaluate()`.
     *
     * This guards the direction construction-time validation cannot: a call
     * site that quietly stops binding something the scope promises (or invents
     * a key the scope never declared) would otherwise leave every expression
     * using that identifier silently reading `undefined`. A mismatch is logged
     * once per distinct shape and the context is passed through unchanged —
     * a binding bug must not take the sheet down with it.
     *
     * An {@link open} scope accepts any keys and is passed straight through.
     * @param context - The bindings the call site is supplying.
     * @returns `context`, unchanged.
     */
    bind(context: Record<string, unknown>): Record<string, unknown> {
        if (this.open) return context;
        const supplied = Object.keys(context);
        const missing = this.names.filter((n) => !(n in context));
        const extra = supplied.filter((n) => !this.has(n));
        if (missing.length || extra.length) {
            const signature = `${missing.join(",")}|${extra.join(",")}`;
            if (!this.reported.has(signature)) {
                this.reported.add(signature);
                sohl.log.warn(
                    `Expression scope "${this.id}" was bound with a context that does not match its declaration:`,
                    { scope: this.id, missing, undeclared: extra },
                );
            }
        }
        return context;
    }
}

/** Every declared scope, wrapped and keyed by id. Built once at module load. */
const registry: ReadonlyMap<string, ExpressionScope> = new Map(
    Object.entries(EXPRESSION_SCOPES).map(([id, data]) => [
        id,
        new ExpressionScope(id, data as ExpressionScopeData),
    ]),
);

/**
 * The catalog of every place SoHL evaluates a
 * {@link sohl.entity.expr.SafeExpression}, and what is in scope there.
 *
 * Unlike {@link sohl.entity.expr.expressionHelpers}, this registry is **closed**:
 * scopes describe SoHL's own call sites, so they are declared in the source
 * catalog (`src/entity/expr/expression-scopes.mjs`) and never registered at
 * runtime. A world extends the expression *language* by adding helpers, not by
 * inventing call sites.
 *
 * @see {@link ExpressionScope} — what a single scope provides.
 */
export const expressionScopes = {
    /**
     * Look up a scope by id.
     * @param id - The scope id (e.g. `"skill.base"`), or nullish for none.
     * @returns The scope, or `undefined` when the id is unknown or nullish.
     */
    get(id: string | null | undefined): ExpressionScope | undefined {
        return id == null ? undefined : registry.get(id);
    },

    /**
     * Look up a scope by id, failing loudly when it does not exist. Use at
     * call sites that name a scope literally, so a typo or a renamed scope is
     * a startup error rather than a silently unvalidated expression.
     * @param id - The scope id.
     * @returns The scope.
     * @throws {Error} If no scope with that id is declared.
     */
    require(id: string): ExpressionScope {
        const scope = registry.get(id);
        if (!scope) {
            throw new Error(
                `Unknown expression scope "${id}" — declare it in src/entity/expr/expression-scopes.mjs`,
            );
        }
        return scope;
    },

    /**
     * Whether a scope with the given id is declared.
     * @param id - The scope id.
     * @returns `true` when the scope exists.
     */
    has(id: string): boolean {
        return registry.has(id);
    },

    /**
     * Every declared scope id, in catalog order.
     * @returns The scope ids.
     */
    ids(): string[] {
        return [...registry.keys()];
    },

    /**
     * Every declared scope, in catalog order.
     * @returns The scopes.
     */
    all(): ExpressionScope[] {
        return [...registry.values()];
    },
};
