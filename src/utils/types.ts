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
 * Handler invoked when a {@link DialogButton} is clicked.
 *
 * @param event - The pointer or submit event that triggered the button.
 * @param button - The clicked button element.
 * @param dialog - The host dialog element.
 * @returns A promise resolving to the value the dialog should yield.
 */
export type DialogButtonCallback = (
    event: PointerEvent | SubmitEvent,
    button: HTMLButtonElement,
    dialog: HTMLDialogElement,
) => Promise<any>;

/** Definition of a single button rendered in a dialog. */
export interface DialogButton {
    /** Unique action identifier returned when this button is selected. */
    action: string;
    /** Human-readable label shown on the button. */
    label: string;
    /** Icon (e.g. a Font Awesome class) displayed on the button. */
    icon: string;
    /** CSS class(es) applied to the button. */
    class: string;
    /** Whether this button is the default (activated on Enter). */
    default?: boolean;
    /** Handler invoked when the button is clicked. */
    callback: DialogButtonCallback;
}

/**
 * Handler invoked after a dialog's content is rendered.
 *
 * @param event - The render event.
 * @param dialogElement - The rendered dialog element.
 */
export type DialogRenderCallback = (
    event: Event,
    dialogElement: HTMLDialogElement,
) => Promise<void>;

/**
 * Handler invoked when a dialog is closed.
 *
 * @param event - The close event.
 * @param dialog - The dialog instance being closed.
 */
export type DialogCloseCallback = (
    event: Event,
    dialog: Record<string, any>,
) => Promise<void>;

/**
 * Handler invoked when a dialog is submitted.
 *
 * @param result - The value produced by the dialog's selected action.
 */
export type DialogSubmitCallback = (result: any) => Promise<void>;

/** Configuration options shared by the dialog helper functions in `FoundryHelpers.ts`. */
export interface DialogConfig {
    /** Path to a Handlebars template rendered for the dialog body. Takes precedence over {@link DialogConfig.content}. */
    template?: FilePath;
    /** Title displayed in the dialog window header. */
    title?: string;
    /** Inline HTML used as the dialog body when no {@link DialogConfig.template} is given. */
    content?: HTMLString;
    /** Data passed to the template or inline content during rendering. */
    data?: PlainObject;
    /** Whether the dialog blocks interaction with the rest of the UI. */
    modal?: boolean;
    /** Whether dismissing the dialog rejects the promise instead of resolving to `null`. */
    rejectClose?: boolean;
    /** Handler invoked after the dialog content is rendered. */
    render?: DialogRenderCallback;
    /** Handler invoked when the dialog is closed. */
    close?: DialogCloseCallback;
    /** Handler invoked when the dialog is submitted. */
    submit?: DialogSubmitCallback;
    /** Overrides for the OK button (used by `okDialog`). */
    ok?: Partial<DialogButton>;
    /** Overrides for the Yes button (used by `yesNoDialog`). */
    yes?: Partial<DialogButton>;
    /** Overrides for the No button (used by `yesNoDialog`). */
    no?: Partial<DialogButton>;
    /** Custom set of buttons (used by `awaitDialog`). */
    buttons?: Partial<DialogButton>[];
}

/** Result returned from an awaited dialog interaction. */
export interface AwaitDialogResult {
    /** The value produced by the selected button's callback. */
    value: any;
    /** The action identifier of the selected button. */
    action: string;
}
