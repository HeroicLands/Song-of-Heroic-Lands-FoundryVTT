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

/**
 * Parse one integer/dice group with an optional affine integer scale.
 * Legacy metadata recognition preserves the structured fields of existing callers.
 * Full arithmetic parsing and content validation use parseSimpleRollExpression.
 * @param {string} formula - Numeric seconds, NdM±K, (NdM±K)*scale or NdM*scale.
 * @returns {Readonly<{numDice:number,dieFaces:number,modifier:number,scale:number}>} Immutable structured roll fields.
 * @throws {Error} For malformed expressions or unsafe integer metadata.
 */
export function parseSimpleRollFormula(formula) {
    if (typeof formula !== "string") throw new Error("A roll formula must be a string");
    let group = formula.trim();
    let scale = 1;
    const scaled =
        group.match(/^\(\s*([^()]*)\s*\)\s*\*\s*([+-]?\s*\d+)$/i) ??
        group.match(/^(\d*d\d+)\s*\*\s*([+-]?\s*\d+)$/i);
    if (scaled) {
        group = scaled[1].trim();
        scale = integer(scaled[2]);
    }
    if (group === "") {
        if (scaled) throw new Error(`Invalid formula: ${formula}`);
        return Object.freeze({ numDice: 0, dieFaces: 0, modifier: 0, scale: 1 });
    }
    if (/^[+-]?\s*\d+$/.test(group))
        return Object.freeze({ numDice: 0, dieFaces: 0, modifier: integer(group), scale });
    const dice = group.match(/^(\d*)d(\d+)(?:\s*([+-]\s*\d+))?$/i);
    if (!dice) throw new Error(`Invalid formula: ${formula}`);
    const numDice = dice[1] === "" ? 1 : integer(dice[1]);
    const dieFaces = integer(dice[2]);
    const modifier = dice[3] ? integer(dice[3]) : 0;
    if (dieFaces <= 0) throw new Error(`Invalid die faces: ${formula}`);
    return Object.freeze({ numDice, dieFaces, modifier, scale });
}
/**
 * Read exact integer metadata without silently rounding an oversized literal.
 * @param {string} value - Signed integer token, possibly containing sign whitespace.
 * @returns {number} The safely represented integer.
 * @throws {Error} When the token exceeds finite safe integer precision.
 */
function integer(value) {
    const parsed = Number(value.replace(/\s+/g, ""));
    if (!Number.isSafeInteger(parsed)) throw new Error(`Unsafe integer in roll formula: ${value}`);
    return parsed;
}

/** Parse arithmetic without evaluation or runtime dependencies. */
export function parseSimpleRollExpression(formula) {
    const input = String(formula ?? "").trim() || "0";
    const tokens = input.match(/(?:\d+(?:\.\d*)?|\.\d+)|[dD()+*/-]/g) ?? [];
    if (tokens.join("") !== input.replace(/\s/g, "")) throw new Error("Invalid formula");
    let pos = 0;
    const freeze = (node) => Object.freeze(node);
    function primary() {
        if (tokens[pos] === "(") {
            pos++;
            const node = sum();
            if (tokens[pos++] !== ")") throw new Error("Missing closing parenthesis");
            return node;
        }
        if (/^[dD]$/.test(tokens[pos] ?? "")) return freeze({ kind: "number", value: 1 });
        const value = Number(tokens[pos++]);
        if (!Number.isFinite(value) || Math.abs(value) > Number.MAX_SAFE_INTEGER)
            throw new Error("Invalid numeric term");
        return freeze({ kind: "number", value });
    }
    function dice() {
        let node = primary();
        if (/^[dD]$/.test(tokens[pos] ?? "")) {
            pos++;
            const faces = primary();
            const deterministic = (operand) =>
                evaluateSimpleRollExpression(operand, () => {
                    throw new Error("Dice count and faces must be deterministic arithmetic");
                });
            const count = deterministic(node),
                faceCount = deterministic(faces);
            if (
                !Number.isSafeInteger(count) ||
                count < 0 ||
                !Number.isSafeInteger(faceCount) ||
                faceCount < 1
            )
                throw new Error(
                    "Dice require nonnegative integer count and positive integer faces",
                );
            node = freeze({ kind: "dice", count, faces: faceCount });
        }
        return node;
    }
    function unary() {
        if (tokens[pos] === "+" || tokens[pos] === "-") {
            const op = tokens[pos++];
            return freeze({ kind: "unary", op, operand: unary() });
        }
        return dice();
    }
    function product() {
        let node = unary();
        while (tokens[pos] === "*" || tokens[pos] === "/") {
            const op = tokens[pos++];
            node = freeze({ kind: "binary", op, left: node, right: unary() });
        }
        return node;
    }
    function sum() {
        let node = product();
        while (tokens[pos] === "+" || tokens[pos] === "-") {
            const op = tokens[pos++];
            node = freeze({ kind: "binary", op, left: node, right: product() });
        }
        return node;
    }
    const ast = sum();
    if (pos !== tokens.length) throw new Error("Unexpected formula term");
    return ast;
}

/** Evaluate the AST, invoking the dice callback in textual order. */
export function evaluateSimpleRollExpression(ast, dice) {
    if (ast.kind === "number") return ast.value;
    if (ast.kind === "dice") return dice(ast.count, ast.faces);
    if (ast.kind === "unary")
        return (ast.op === "-" ? -1 : 1) * evaluateSimpleRollExpression(ast.operand, dice);
    const left = evaluateSimpleRollExpression(ast.left, dice);
    const right = evaluateSimpleRollExpression(ast.right, dice);
    switch (ast.op) {
        case "+":
            return left + right;
        case "-":
            return left - right;
        case "*":
            return left * right;
        case "/":
            return left / right;
        default:
            throw new Error("Unknown operator");
    }
}

/** Return dice groups in the order their faces are consumed. */
export function simpleRollDiceGroups(ast) {
    if (ast.kind === "dice") return [ast];
    if (ast.kind === "unary") return simpleRollDiceGroups(ast.operand);
    if (ast.kind === "binary")
        return [...simpleRollDiceGroups(ast.left), ...simpleRollDiceGroups(ast.right)];
    return [];
}

/** Conservative possible result interval; division spanning zero is unbounded. */
export function simpleRollExpressionRange(ast) {
    if (ast.kind === "number") return { min: ast.value, max: ast.value };
    if (ast.kind === "dice") return { min: ast.count, max: ast.count * ast.faces };
    if (ast.kind === "unary") {
        const range = simpleRollExpressionRange(ast.operand);
        return ast.op === "-" ? { min: -range.max, max: -range.min } : range;
    }
    const a = simpleRollExpressionRange(ast.left),
        b = simpleRollExpressionRange(ast.right);
    if (ast.op === "+") return { min: a.min + b.min, max: a.max + b.max };
    if (ast.op === "-") return { min: a.min - b.max, max: a.max - b.min };
    if (ast.op === "/" && b.min <= 0 && b.max >= 0) return { min: -Infinity, max: Infinity };
    const values = [a.min * b.min, a.min * b.max, a.max * b.min, a.max * b.max];
    if (ast.op === "/")
        values.splice(0, 4, a.min / b.min, a.min / b.max, a.max / b.min, a.max / b.max);
    return { min: Math.min(...values), max: Math.max(...values) };
}

/** Render normalized arithmetic for native chat, with deterministic dice operands folded. */
export function formatSimpleRollExpression(ast) {
    if (ast.kind === "number") return String(ast.value);
    if (ast.kind === "dice") return `${ast.count}d${ast.faces}`;
    if (ast.kind === "unary") return `(${ast.op}${formatSimpleRollExpression(ast.operand)})`;
    return `(${formatSimpleRollExpression(ast.left)}${ast.op}${formatSimpleRollExpression(ast.right)})`;
}
