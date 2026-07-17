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
 * Error raised when an expression cannot be parsed, fails validation, or throws
 * during evaluation — and when a helper rejects its input. Every failure
 * surfaced by {@link SafeExpression} (and the built-in helpers) is an instance
 * of this class.
 *
 * It lives in its own module so that both {@link SafeExpression} and the
 * `ExpressionHelperRegistry` can throw it without forming an import cycle
 * (the registry is consulted by `SafeExpression`, so it must not import back
 * from it).
 */
export class SafeExpressionError extends Error {
    /**
     * Create a SafeExpressionError.
     * @param message - Human-readable description of the failure.
     * @param options - Optional error options, e.g. the underlying `cause`.
     * @param options.cause - The underlying error that triggered this failure.
     */
    constructor(message: string, options?: { cause?: unknown }) {
        super(message, options);
        this.name = "SafeExpressionError";
    }
}

/**
 * Extract a readable message from an unknown thrown value.
 * @param err - The caught value.
 * @returns A human-readable message.
 */
export function errorMessage(err: unknown): string {
    return err instanceof Error ? err.message : String(err);
}
