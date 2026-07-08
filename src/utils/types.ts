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

import type { FilePath, HTMLString } from "@src/utils/helpers";

/**
 * Shared, Foundry-free type declarations.
 *
 * @remarks
 * This module holds free-standing pure types and interfaces that have no runtime
 * companion (unlike the branded types in `helpers.ts`, which are paired with
 * their guards/branders). Foundry-coupled modules — such as the dialog helpers
 * in `FoundryHelpers.ts` — re-import these; the dependency direction stays
 * coupled → pure so the util layer never imports the Foundry shim.
 *
 * @module types
 */

/**
 * A value permitted in a SoHL world/client setting: a JSON-like scalar
 * (string, number, boolean, bigint, null, or undefined) or an array thereof.
 */
export type SohlSettingValue =
    | string
    | number
    | boolean
    | bigint
    | null
    | undefined
    | SohlSettingValue[];

// ---------------------------------------------------------------------------
// Dialog types
// ---------------------------------------------------------------------------

/**
 * A button in the generic `dialog` primitive.
 *
 * Pure, Foundry-free description of a dialog button — the `dialog` boundary
 * function maps it onto the underlying Foundry dialog implementation.
 */
export interface DialogButtonSpec {
    /** Identifier returned as the `action` when this button is pressed. */
    action: string;
    /** Button label (defaults to `action`). */
    label?: string;
    /** Optional icon class (e.g. a Font Awesome class). */
    icon?: string;
    /** Whether this button is the default (activated on Enter). */
    default?: boolean;
}

/**
 * Result-builder for the generic `dialog` primitive.
 *
 * Invoked at the Foundry boundary when a button is pressed. Receives the parsed
 * form data as a **plain object** (the boundary owns `FormDataExtended` and the
 * DOM) and the pressed button's `action`; its return value becomes the dialog's
 * result. This keeps callers in the logic layer free of any Foundry/DOM code.
 */
export type DialogResultCallback = (
    formData: PlainObject,
    action: string,
) => unknown | Promise<unknown>;

/**
 * Configuration for the single generic `dialog` boundary function — the one
 * logic-level dialog primitive (supersedes the former per-shape helpers).
 */
export interface DialogSpec {
    /** Dialog window title. */
    title?: string;
    /** Handlebars template rendered for the body (takes precedence over `content`). */
    template?: FilePath;
    /** Inline HTML body used when no `template` is given. */
    content?: HTMLString;
    /** Data passed to the template/content during rendering. */
    data?: PlainObject;
    /** Buttons to show; defaults to a single confirming `ok` button. */
    buttons?: DialogButtonSpec[];
    /** Whether the dialog blocks interaction with the rest of the UI. */
    modal?: boolean;
    /** Whether dismissal rejects instead of resolving to `null`. */
    rejectClose?: boolean;
    /** Pure result-builder; see {@link DialogResultCallback}. */
    callback?: DialogResultCallback;
    /**
     * Invoked after the dialog renders and on every re-render; see
     * {@link DialogRenderCallback}. Use it to wire dynamic form behaviour, e.g.
     * recomputing dependent fields when a dropdown value changes.
     */
    render?: DialogRenderCallback;
}

/**
 * Handler invoked after a dialog's content is rendered — and again on every
 * re-render. Receives the dialog's root element so dynamic behaviour (for
 * example, updating dependent fields when a dropdown changes) can read and
 * modify the rendered form. This is the one dialog hook that is inherently a
 * DOM hook; everything else stays plain-object.
 *
 * @param element - The dialog's rendered root element.
 */
export type DialogRenderCallback = (
    element: HTMLElement,
) => void | Promise<void>;
