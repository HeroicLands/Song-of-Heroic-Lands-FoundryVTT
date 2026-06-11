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

/**
 * A safe, sandboxed evaluator for the small JS-like expression language used
 * by data-driven predicates (e.g. an Active Effect's `test` field).
 *
 * Expressions are parsed with {@link https://github.com/EricSmekens/jsep | jsep}
 * into an AST, statically validated, then evaluated by walking that AST. The
 * language is a strict **allowlist**: there is no way to reach `eval`, the
 * `Function` constructor, the prototype chain, or any method — the only
 * callable values are the named helpers supplied to the constructor.
 *
 * Supported: literals, array literals, identifiers (resolved from the
 * evaluation context), property access (dot and bracket — getters included),
 * the operators `=== !== < > <= >= + - * / %`, the short-circuiting `&&`/`||`,
 * the unary operators `! - +`, ternary conditionals, and calls to registered
 * helpers. Everything else — assignment, bitwise/loose-equality operators,
 * `typeof`/`new`/`delete`/`instanceof`, statements, template/regex literals,
 * method calls — is rejected at parse or validation time.
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

/** Upper bound on a `matches()` regular-expression pattern, as a ReDoS guard. */
const MAX_PATTERN_LENGTH = 200;

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
 * Error raised when an expression cannot be parsed, fails validation, or
 * throws during evaluation. Every failure surfaced by {@link SafeExpression}
 * is an instance of this class.
 */
export class SafeExpressionError extends Error {
    /**
     * Create a SafeExpressionError.
     * @param message Human-readable description of the failure.
     * @param options Optional error options, e.g. the underlying `cause`.
     * @param options.cause The underlying error that triggered this failure.
     */
    constructor(message: string, options?: { cause?: unknown }) {
        super(message, options);
        this.name = "SafeExpressionError";
    }
}

/** A helper function callable from an expression; receives evaluated args. */
export type ExpressionHelper = (...args: unknown[]) => unknown;

/** A read-only map of helper name to implementation. */
export type HelperRegistry = Readonly<Record<string, ExpressionHelper>>;

/**
 * A parsed, validated, reusable safe expression.
 *
 * Construction parses and validates the expression once; {@link evaluate} may
 * then be called any number of times against different contexts.
 */
export class SafeExpression {
    /** The original expression source string. */
    readonly source: string;

    /** The parsed and validated abstract syntax tree. */
    private readonly ast: jsep.Expression;

    /** The helper functions callable from this expression. */
    private readonly helpers: HelperRegistry;

    /**
     * Parse and statically validate an expression.
     * @param source The expression text.
     * @param helpers Helper functions callable from the expression.
     * @throws {SafeExpressionError} If the expression cannot be parsed or
     *   contains unsupported or unsafe syntax.
     */
    constructor(source: string, helpers: HelperRegistry = {}) {
        this.source = source;
        this.helpers = helpers;
        try {
            this.ast = jsep(source);
        } catch (err) {
            throw new SafeExpressionError(
                `Could not parse expression: ${errorMessage(err)}`,
                { cause: err },
            );
        }
        this.validate(this.ast);
    }

    /**
     * Evaluate the expression against a set of variable bindings.
     * @param context Variable bindings available to the expression.
     * @returns The value the expression evaluates to.
     * @throws {SafeExpressionError} If evaluation references an unknown
     *   identifier, extracts a method, or otherwise fails.
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
     * @param node The AST node to check.
     * @throws {SafeExpressionError} If the node is unsupported or unsafe.
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
                if (!Object.prototype.hasOwnProperty.call(this.helpers, name)) {
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
     * @param node The node to evaluate.
     * @param context Variable bindings available to the expression.
     * @returns The node's value.
     * @throws {SafeExpressionError} If the node cannot be evaluated safely.
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
     * @param name The identifier name.
     * @param context Variable bindings available to the expression.
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
        if (Object.prototype.hasOwnProperty.call(this.helpers, name)) {
            throw new SafeExpressionError(
                `Helper "${name}" can only be called, not referenced`,
            );
        }
        throw new SafeExpressionError(`Unknown identifier: ${name}`);
    }

    /**
     * Evaluate a unary expression.
     * @param node The unary expression node.
     * @param context Variable bindings available to the expression.
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
     * @param node The binary expression node.
     * @param context Variable bindings available to the expression.
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
     * @param node The member expression node.
     * @param context Variable bindings available to the expression.
     * @returns The property value.
     * @throws {SafeExpressionError} If the access is unsafe.
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
     * @param node The call expression node.
     * @param context Variable bindings available to the expression.
     * @returns The helper's return value.
     * @throws {SafeExpressionError} If the helper throws.
     */
    private evalCall(
        node: jsep.CallExpression,
        context: Record<string, unknown>,
    ): unknown {
        // validate() has already guaranteed the callee is a known helper.
        const name = (node.callee as jsep.Identifier).name;
        const helper = this.helpers[name];
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

/**
 * Extract a readable message from an unknown thrown value.
 * @param err The caught value.
 * @returns A human-readable message.
 */
function errorMessage(err: unknown): string {
    return err instanceof Error ? err.message : String(err);
}

/**
 * Count the elements of an array/string or the own keys of an object.
 * @param value The collection to measure.
 * @returns The element/key count; 0 for `null`, `undefined`, or non-collections.
 */
function collectionSize(value: unknown): number {
    if (value === null || value === undefined) return 0;
    if (Array.isArray(value) || typeof value === "string") {
        return value.length;
    }
    if (typeof value === "object") return Object.keys(value).length;
    return 0;
}

/**
 * The default helper registry — pure, null-tolerant utility functions for
 * collection membership, string and numeric operations, and type checks.
 *
 * Helpers are the only callable values in the expression language; extend the
 * language by passing a registry that includes additional entries.
 */
export const STANDARD_HELPERS: HelperRegistry = Object.freeze({
    /**
     * Test membership: array element, or own key of an object.
     * @param value The value (or key) to look for.
     * @param collection The array or object to search.
     * @returns Whether `value` is in `collection`.
     */
    has(value: unknown, collection: unknown): boolean {
        if (Array.isArray(collection)) return collection.includes(value);
        if (collection !== null && typeof collection === "object") {
            return Object.prototype.hasOwnProperty.call(
                collection,
                value as PropertyKey,
            );
        }
        return false;
    },

    /**
     * Element/key count of a collection.
     * @param collection An array, string, or object.
     * @returns The count, or 0 for nullish/non-collection values.
     */
    len(collection: unknown): number {
        return collectionSize(collection);
    },

    /**
     * Whether a collection has no elements/keys.
     * @param collection An array, string, or object.
     * @returns `true` when empty or nullish.
     */
    empty(collection: unknown): boolean {
        return collectionSize(collection) === 0;
    },

    /**
     * Lowercase a value's string form.
     * @param value The value to lowercase.
     * @returns The lowercased string.
     */
    lower(value: unknown): string {
        return String(value).toLowerCase();
    },

    /**
     * Uppercase a value's string form.
     * @param value The value to uppercase.
     * @returns The uppercased string.
     */
    upper(value: unknown): string {
        return String(value).toUpperCase();
    },

    /**
     * Whether a string starts with a prefix.
     * @param value The string to test.
     * @param prefix The prefix to look for.
     * @returns Whether `value` starts with `prefix`.
     */
    startsWith(value: unknown, prefix: unknown): boolean {
        return String(value).startsWith(String(prefix));
    },

    /**
     * Whether a string ends with a suffix.
     * @param value The string to test.
     * @param suffix The suffix to look for.
     * @returns Whether `value` ends with `suffix`.
     */
    endsWith(value: unknown, suffix: unknown): boolean {
        return String(value).endsWith(String(suffix));
    },

    /**
     * Whether a string contains a substring.
     * @param value The string to search.
     * @param sub The substring to look for.
     * @returns Whether `value` contains `sub`.
     */
    contains(value: unknown, sub: unknown): boolean {
        return String(value).includes(String(sub));
    },

    /**
     * Test a string against a regular expression supplied as a string.
     * @param value The string to test.
     * @param pattern The regular-expression pattern (a string).
     * @param flags Optional regular-expression flags.
     * @returns Whether the pattern matches.
     * @throws {SafeExpressionError} If the pattern is too long or invalid.
     */
    matches(value: unknown, pattern: unknown, flags?: unknown): boolean {
        const source = String(pattern);
        if (source.length > MAX_PATTERN_LENGTH) {
            throw new SafeExpressionError(
                "matches(): regular-expression pattern is too long",
            );
        }
        let regex: RegExp;
        try {
            regex = new RegExp(
                source,
                flags === undefined || flags === null ? "" : String(flags),
            );
        } catch (err) {
            throw new SafeExpressionError(
                "matches(): invalid regular expression",
                { cause: err },
            );
        }
        return regex.test(String(value));
    },

    /**
     * Smallest of the given numbers.
     * @param values The numbers to compare.
     * @returns The minimum value.
     */
    min(...values: unknown[]): number {
        return Math.min(...(values as number[]));
    },

    /**
     * Largest of the given numbers.
     * @param values The numbers to compare.
     * @returns The maximum value.
     */
    max(...values: unknown[]): number {
        return Math.max(...(values as number[]));
    },

    /**
     * Round a number to the nearest integer.
     * @param value The number to round.
     * @returns The rounded value.
     */
    round(value: unknown): number {
        return Math.round(value as number);
    },

    /**
     * Round a number down to an integer.
     * @param value The number to floor.
     * @returns The floored value.
     */
    floor(value: unknown): number {
        return Math.floor(value as number);
    },

    /**
     * Round a number up to an integer.
     * @param value The number to ceil.
     * @returns The ceiled value.
     */
    ceil(value: unknown): number {
        return Math.ceil(value as number);
    },

    /**
     * Absolute value of a number.
     * @param value The number.
     * @returns The absolute value.
     */
    abs(value: unknown): number {
        return Math.abs(value as number);
    },

    /**
     * Whether a value is a real number (not `NaN`).
     * @param value The value to test.
     * @returns Whether `value` is a number.
     */
    isNumber(value: unknown): boolean {
        return typeof value === "number" && !Number.isNaN(value);
    },

    /**
     * Whether a value is a string.
     * @param value The value to test.
     * @returns Whether `value` is a string.
     */
    isString(value: unknown): boolean {
        return typeof value === "string";
    },

    /**
     * Whether a value is an array.
     * @param value The value to test.
     * @returns Whether `value` is an array.
     */
    isArray(value: unknown): boolean {
        return Array.isArray(value);
    },

    /**
     * Whether a value is neither `undefined` nor `null`.
     * @param value The value to test.
     * @returns Whether `value` is defined.
     */
    defined(value: unknown): boolean {
        return value !== undefined && value !== null;
    },
});
