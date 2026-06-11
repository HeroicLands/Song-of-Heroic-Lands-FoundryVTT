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

/**
 * The bypass-relevant shape of a `SohlActionContext`. Kept structural (rather
 * than importing `SohlActionContext`) so this stays a dependency-free leaf
 * module usable from any layer without import cycles.
 */
export interface DialogBypassContext {
    /** When `true`, the dialog is bypassed and inputs come from {@link scope}. */
    skipDialog: boolean;
    /** The action's scope bag — the alternate source for dialog inputs. */
    scope: unknown;
}

/** How to obtain an action's dialog inputs from each source. */
export interface ResolveActionInputOptions<T> {
    /**
     * Derive the inputs from the action's `scope` (used when `skipDialog` is
     * set). MUST be total — supply sensible defaults for any field the scope
     * omits — so a bypassed action behaves like the dialog's defaults.
     */
    fromScope: (scope: any) => T;
    /**
     * Show the dialog and resolve to the inputs the user chose, or `null` if
     * the dialog was dismissed/cancelled. The callback MUST be side-effect-free:
     * it only reads the form and returns data. The caller applies that data.
     */
    dialog: () => Promise<T | null>;
}

/**
 * Resolve an intrinsic action's dialog inputs from a single, uniform place.
 *
 * - `skipDialog` (e.g. shift-click, or a headless/test invocation) → take the
 *   inputs from `scope` via {@link ResolveActionInputOptions.fromScope}.
 * - otherwise → show the dialog and take the inputs it returns.
 *
 * Either way the action receives the same `T` (or `null` when the dialog was
 * dismissed) and applies it at one site. This makes any such action callable
 * headlessly by setting `context.skipDialog = true` and providing the values in
 * `context.scope`.
 *
 * @param ctx - The dialog-bypass context carrying `skipDialog` and `scope`.
 * @param opts - The source callbacks for resolving inputs from scope or dialog.
 * @returns The resolved inputs, or `null` if the dialog was dismissed.
 */
export async function resolveActionInput<T>(
    ctx: DialogBypassContext,
    opts: ResolveActionInputOptions<T>,
): Promise<T | null> {
    return ctx.skipDialog ? opts.fromScope(ctx.scope) : await opts.dialog();
}
