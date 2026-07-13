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

import jsep from "jsep";
import { registerKind } from "@src/utils/kindRegistry";
import { SohlEntity } from "../SohlEntity";
import { expressionHelpers } from "./ExpressionHelperRegistry";
import { SafeExpressionError, errorMessage } from "./SafeExpressionError";

// Re-exported so callers can import the error type alongside the class.
export { SafeExpressionError } from "./SafeExpressionError";

/**
 * A safe, sandboxed evaluator for the small JS-like expression language used by
 * SoHL's data-driven predicates. The public entry point is {@link SafeExpression};
 * see its documentation for the supported grammar and usage examples.
 *
 * Expressions are parsed with {@link https://github.com/EricSmekens/jsep | jsep}
 * into an AST, statically validated against a strict allowlist, then evaluated by
 * walking that AST. Callable helpers come from the global
 * {@link expressionHelpers} registry (built-ins plus any world-loaded helpers).
 */

/** Binary operators the evaluator implements (jsep is narrowed to match). */
const BINARY_OPERATORS = new Set([
    "===",
    "!==",
    "<",
    ">",
    "<=",
    ">=",
    "+",
    "-",
    "*",
    "/",
    "%",
    "&&",
    "||",
]);

/** Unary operators the evaluator implements. */
const UNARY_OPERATORS = new Set(["!", "-", "+"]);

/** Property names that may never be used as member keys (prototype escapes). */
const DENIED_KEYS = new Set(["constructor", "__proto__", "prototype"]);

// Narrow jsep's default grammar to the safe subset. jsep is a process-wide
// singleton and an ES module's top level evaluates exactly once, so removing
// the bitwise and loose-equality operators here makes that syntax fail fast at
// parse time for every SafeExpression. `removeBinaryOp` on an absent operator
// is a harmless no-op, so this is also idempotent.
for (const operator of ["&", "|", "^", "<<", ">>", ">>>", "==", "!="]) {
    jsep.removeBinaryOp(operator);
}
jsep.removeUnaryOp("~");

/**
 * A parsed, validated, reusable safe expression — SoHL's way to evaluate a
 * condition that was written as a *string* (for example, a predicate a GM types
 * into an action's `trigger` field, or an Active Effect's `test`) without the
 * dangers of `eval`.
 *
 * It exists because such strings come from data, not source code: they must be
 * evaluated against live game objects, yet must never be able to run arbitrary
 * code, reach the DOM or network, or escape through the prototype chain.
 * `SafeExpression` parses the string into a syntax tree, **statically validates**
 * it against a strict allowlist, then evaluates that tree by hand. Anything
 * outside the allowed language is rejected — usually before it ever runs.
 *
 * It is a {@link SohlEntity}: only its {@link source} is persisted (via
 * {@link toJSON}); the parsed AST is rebuilt in the constructor on revival.
 *
 * For a hands-on authoring guide — the grammar, the full standard-helper
 * reference (exact signatures and return values), the bindings each call site
 * provides, and worked examples — see the
 * [Expressions and Scripts](../../../docs/concepts/expressions.md) concept doc.
 * The summary below covers the essentials.
 *
 * ## Using it
 *
 * Two steps: build once, then evaluate as often as you like.
 *
 * 1. **Construct** — `new SafeExpression({ source }, { parent })` parses and
 *    validates `source` immediately. If the string uses anything unsupported it
 *    throws a {@link SafeExpressionError} right here, so a bad predicate fails
 *    loudly at setup time instead of silently at use time. Construction is the
 *    costly step; keep the instance and reuse it.
 * 2. **Evaluate** — `expr.evaluate(context?)` runs the expression against
 *    `context`, a plain object of variable bindings. Every bare identifier in the
 *    expression is looked up by name in `context`. It returns whatever the
 *    expression computes (for a predicate, a boolean; for a computed field, a
 *    number or string).
 *
 * ```ts
 * // A simple predicate. `level` and `injured` are read from the context object.
 * const expr = new SafeExpression({ source: "level >= 3 && !injured" }, { parent });
 * expr.evaluate({ level: 5, injured: false }); // true
 * expr.evaluate({ level: 2, injured: false }); // false
 * expr.evaluate({ level: 9, injured: true });  // false
 * ```
 *
 * ## The language
 *
 * **Allowed:** literals (`3`, `"orc"`, `true`), array literals (`[1, 2]`),
 * identifiers resolved from the context, property access by dot or bracket
 * (`actor.name`, `tags["ranged"]`), the operators `=== !== < > <= >= + - * / %`,
 * the short-circuiting `&&` and `||`, the unary `! - +`, the ternary
 * `cond ? a : b`, and calls to **helpers** (below).
 *
 * **Rejected — at parse/validation time, before anything runs:** assignment
 * (`=`), bitwise and loose-equality operators (`& | == !=`), `typeof` / `new` /
 * `delete` / `instanceof`, statements (`;`, `if`, `for`), template and regex
 * literals, and — importantly — **method calls**. You cannot write `actor.die()`;
 * the only callable values are the registered helpers.
 *
 * ## Helpers
 *
 * Because method calls are banned, **helpers** are how you expose behavior to an
 * expression. They come from the global {@link expressionHelpers} registry — the
 * built-in library plus any world-loaded custom helpers — and are resolved by
 * name when the expression is validated and evaluated.
 *
 * ```ts
 * // `has` and `len` are built-in helpers; the expression may call them by name.
 * const expr = new SafeExpression(
 *     { source: "has('ranged', tags) && len(tags) <= 3" },
 *     { parent },
 * );
 * expr.evaluate({ tags: ["ranged", "magic"] }); // true
 * ```
 *
 * ## Errors
 *
 * Every failure — a parse error, an unsupported node, an unknown identifier at
 * evaluation, or an attempt to extract a method — surfaces as a
 * {@link SafeExpressionError}. Syntax and validation failures throw from the
 * constructor; runtime failures throw from {@link evaluate}.
 *
 * @see {@link SafeExpressionError} — the single error type every failure uses.
 * @see {@link expressionHelpers} — the global helper registry.
 */
export class SafeExpression extends SohlEntity {
    /** The original expression source string. */
    readonly source: string;

    /** The parsed and validated abstract syntax tree (not serialized). */
    private readonly ast: jsep.Expression;

    /**
     * Parse and statically validate an expression.
     * @param data - The expression data.
     * @param data.source - The expression text.
     * @param options - Entity options, including the owning `parent` logic.
     * @throws {SafeExpressionError} If `data.source` is not a string, if jsep
     *   cannot parse it, or if static validation rejects it — a disallowed
     *   operator, a denied property key, a method or non-helper call, or an
     *   unsupported node type (see `validate`).
     */
    constructor(
        data: Partial<SafeExpression.Data> = {},
        options: Partial<SafeExpression.Options> = {},
    ) {
        super(data, options);
        if (typeof data.source !== "string") {
            throw new SafeExpressionError(
                "SafeExpression requires a source string",
            );
        }
        this.source = data.source;
        try {
            this.ast = jsep(this.source);
        } catch (err) {
            throw new SafeExpressionError(
                `Could not parse expression: ${errorMessage(err)}`,
                { cause: err },
            );
        }
        this.validate(this.ast);
    }

    /**
     * Serialize to a plain object — only the {@link source} is persisted; the
     * AST is rebuilt from it on reconstruction.
     * @returns The serialized expression data.
     */
    override toJSON(): PlainObject {
        return {
            ...super.toJSON(),
            source: this.source,
        };
    }

    /**
     * Evaluate the expression against a set of variable bindings.
     * @param context - Variable bindings available to the expression.
     * @returns The value the expression evaluates to.
     * @throws {SafeExpressionError} If evaluation references an unknown
     *   identifier, references a helper without calling it, accesses a denied
     *   key, reads a method (function-valued property), or a called helper
     *   throws. Any non-`SafeExpressionError` is wrapped as one.
     */
    evaluate(context: Record<string, unknown> = {}): unknown {
        try {
            return this.evalNode(this.ast, context);
        } catch (err) {
            if (err instanceof SafeExpressionError) throw err;
            throw new SafeExpressionError(
                `Expression evaluation failed: ${errorMessage(err)}`,
                { cause: err },
            );
        }
    }

    /**
     * Recursively reject any node type, operator, callee, or property name
     * that is not part of the safe expression language.
     * @param node - The AST node to check.
     * @throws {SafeExpressionError} If the node uses a unary or binary operator
     *   outside the allowlist, accesses a denied key (`constructor`,
     *   `__proto__`, `prototype`) by dot or computed access, calls anything but a
     *   registered helper referenced by bare name, or is an unsupported node type.
     */
    private validate(node: jsep.Expression): void {
        switch (node.type) {
            case "Literal":
            case "Identifier":
                return;

            case "ArrayExpression": {
                for (const element of (node as jsep.ArrayExpression).elements) {
                    if (element) this.validate(element);
                }
                return;
            }

            case "UnaryExpression": {
                const unary = node as jsep.UnaryExpression;
                if (!UNARY_OPERATORS.has(unary.operator)) {
                    throw new SafeExpressionError(
                        `Operator not allowed: ${unary.operator}`,
                    );
                }
                this.validate(unary.argument);
                return;
            }

            case "BinaryExpression": {
                const binary = node as jsep.BinaryExpression;
                if (!BINARY_OPERATORS.has(binary.operator)) {
                    throw new SafeExpressionError(
                        `Operator not allowed: ${binary.operator}`,
                    );
                }
                this.validate(binary.left);
                this.validate(binary.right);
                return;
            }

            case "ConditionalExpression": {
                const conditional = node as jsep.ConditionalExpression;
                this.validate(conditional.test);
                this.validate(conditional.consequent);
                this.validate(conditional.alternate);
                return;
            }

            case "MemberExpression": {
                const member = node as jsep.MemberExpression;
                this.validate(member.object);
                if (member.computed) {
                    this.validate(member.property);
                    const literal = member.property as jsep.Literal;
                    if (
                        literal.type === "Literal" &&
                        typeof literal.value === "string" &&
                        DENIED_KEYS.has(literal.value)
                    ) {
                        throw new SafeExpressionError(
                            `Property access not allowed: ${literal.value}`,
                        );
                    }
                } else {
                    const name = (member.property as jsep.Identifier).name;
                    if (DENIED_KEYS.has(name)) {
                        throw new SafeExpressionError(
                            `Property access not allowed: ${name}`,
                        );
                    }
                }
                return;
            }

            case "CallExpression": {
                const call = node as jsep.CallExpression;
                if (call.callee.type !== "Identifier") {
                    throw new SafeExpressionError(
                        "Only direct helper calls are allowed; methods " +
                            "cannot be called",
                    );
                }
                const name = (call.callee as jsep.Identifier).name;
                if (!expressionHelpers.has(name)) {
                    throw new SafeExpressionError(`Unknown helper: ${name}`);
                }
                for (const arg of call.arguments) {
                    this.validate(arg);
                }
                return;
            }

            default:
                throw new SafeExpressionError(
                    `Unsupported syntax: ${node.type}`,
                );
        }
    }

    /**
     * Evaluate a single AST node.
     * @param node - The node to evaluate.
     * @param context - Variable bindings available to the expression.
     * @returns The node's value.
     * @throws {SafeExpressionError} If the node type is unsupported (unreachable
     *   after `validate`) or a delegated evaluator rejects the node.
     */
    private evalNode(
        node: jsep.Expression,
        context: Record<string, unknown>,
    ): unknown {
        switch (node.type) {
            case "Literal":
                return (node as jsep.Literal).value;

            case "Identifier":
                return this.evalIdentifier(
                    (node as jsep.Identifier).name,
                    context,
                );

            case "ArrayExpression":
                return (node as jsep.ArrayExpression).elements.map((element) =>
                    element ? this.evalNode(element, context) : undefined,
                );

            case "UnaryExpression":
                return this.evalUnary(node as jsep.UnaryExpression, context);

            case "BinaryExpression":
                return this.evalBinary(node as jsep.BinaryExpression, context);

            case "ConditionalExpression": {
                const conditional = node as jsep.ConditionalExpression;
                return this.evalNode(conditional.test, context) ?
                        this.evalNode(conditional.consequent, context)
                    :   this.evalNode(conditional.alternate, context);
            }

            case "MemberExpression":
                return this.evalMember(node as jsep.MemberExpression, context);

            case "CallExpression":
                return this.evalCall(node as jsep.CallExpression, context);

            default:
                throw new SafeExpressionError(
                    `Unsupported syntax: ${node.type}`,
                );
        }
    }

    /**
     * Resolve an identifier from the evaluation context.
     * @param name - The identifier name.
     * @param context - Variable bindings available to the expression.
     * @returns The bound value.
     * @throws {SafeExpressionError} If the name is unknown, or names a helper
     *   used without being called.
     */
    private evalIdentifier(
        name: string,
        context: Record<string, unknown>,
    ): unknown {
        if (Object.prototype.hasOwnProperty.call(context, name)) {
            return context[name];
        }
        if (expressionHelpers.has(name)) {
            throw new SafeExpressionError(
                `Helper "${name}" can only be called, not referenced`,
            );
        }
        throw new SafeExpressionError(`Unknown identifier: ${name}`);
    }

    /**
     * Evaluate a unary expression.
     * @param node - The unary expression node.
     * @param context - Variable bindings available to the expression.
     * @returns The operator applied to its operand.
     * @throws {SafeExpressionError} If the operator is not allowed.
     */
    private evalUnary(
        node: jsep.UnaryExpression,
        context: Record<string, unknown>,
    ): unknown {
        const value = this.evalNode(node.argument, context) as never;
        switch (node.operator) {
            case "!":
                return !value;
            case "-":
                return -value;
            case "+":
                return +value;
            default:
                throw new SafeExpressionError(
                    `Operator not allowed: ${node.operator}`,
                );
        }
    }

    /**
     * Evaluate a binary expression, short-circuiting `&&` and `||`.
     * @param node - The binary expression node.
     * @param context - Variable bindings available to the expression.
     * @returns The result of the operation.
     * @throws {SafeExpressionError} If the operator is not allowed.
     */
    private evalBinary(
        node: jsep.BinaryExpression,
        context: Record<string, unknown>,
    ): unknown {
        const operator = node.operator;

        // Logical operators short-circuit: the right side is only evaluated
        // when the left side does not already determine the result.
        if (operator === "&&" || operator === "||") {
            const left = this.evalNode(node.left, context);
            if (operator === "&&") {
                return left ? this.evalNode(node.right, context) : left;
            }
            return left ? left : this.evalNode(node.right, context);
        }

        const left = this.evalNode(node.left, context) as never;
        const right = this.evalNode(node.right, context) as never;
        switch (operator) {
            case "===":
                return left === right;
            case "!==":
                return left !== right;
            case "<":
                return left < right;
            case ">":
                return left > right;
            case "<=":
                return left <= right;
            case ">=":
                return left >= right;
            case "+":
                return (left as number) + (right as number);
            case "-":
                return (left as number) - (right as number);
            case "*":
                return (left as number) * (right as number);
            case "/":
                return (left as number) / (right as number);
            case "%":
                return (left as number) % (right as number);
            default:
                throw new SafeExpressionError(
                    `Operator not allowed: ${operator}`,
                );
        }
    }

    /**
     * Evaluate a member-access expression.
     *
     * Access onto a nullish object yields `undefined` (a stand-in for
     * optional chaining). Reading a property runs any getter transparently;
     * reading a method (a function-valued property) is rejected.
     * @param node - The member expression node.
     * @param context - Variable bindings available to the expression.
     * @returns The property value.
     * @throws {SafeExpressionError} If the property key is denied (`constructor`,
     *   `__proto__`, `prototype`), the object being accessed is itself a
     *   function, or the resolved property is a method (function-valued).
     */
    private evalMember(
        node: jsep.MemberExpression,
        context: Record<string, unknown>,
    ): unknown {
        const object = this.evalNode(node.object, context);
        if (object === null || object === undefined) return undefined;

        const key =
            node.computed ?
                this.evalNode(node.property, context)
            :   (node.property as jsep.Identifier).name;
        const keyStr = typeof key === "string" ? key : String(key);
        if (DENIED_KEYS.has(keyStr)) {
            throw new SafeExpressionError(
                `Property access not allowed: ${keyStr}`,
            );
        }
        if (typeof object === "function") {
            throw new SafeExpressionError(
                "Member access on a function is not allowed",
            );
        }

        const value = (object as Record<string, unknown>)[keyStr];
        if (typeof value === "function") {
            throw new SafeExpressionError(
                `"${keyStr}" is a method; methods are not supported`,
            );
        }
        return value;
    }

    /**
     * Evaluate a helper-function call.
     * @param node - The call expression node.
     * @param context - Variable bindings available to the expression.
     * @returns The helper's return value.
     * @throws {SafeExpressionError} If the helper is unknown or throws.
     */
    private evalCall(
        node: jsep.CallExpression,
        context: Record<string, unknown>,
    ): unknown {
        // validate() guaranteed the callee was a known helper at construction;
        // re-check here in case the registry changed between build and use.
        const name = (node.callee as jsep.Identifier).name;
        const helper = expressionHelpers.get(name);
        if (!helper) {
            throw new SafeExpressionError(`Unknown helper: ${name}`);
        }
        const args = node.arguments.map((arg) => this.evalNode(arg, context));
        try {
            return helper(...args);
        } catch (err) {
            if (err instanceof SafeExpressionError) throw err;
            throw new SafeExpressionError(
                `Helper "${name}" failed: ${errorMessage(err)}`,
                { cause: err },
            );
        }
    }
}

export namespace SafeExpression {
    /** Kind tag used by the kind registry and serialization. */
    export const Kind: string = "SafeExpression";

    /** Persisted data shape for a safe expression. */
    export interface Data extends SohlEntity.Data {
        /** The expression source string — the only persisted field. */
        source: string;
    }

    export interface Options extends SohlEntity.Options {}
}

registerKind(SafeExpression.Kind, SafeExpression);
