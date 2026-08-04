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

import { dialog } from "@src/core/FoundryHelpers";
import { toHTMLString } from "@src/utils/helpers";
import { SafeExpression } from "@src/entity/expr/SafeExpression";
import { expressionHelpers } from "@src/entity/expr/ExpressionHelperRegistry";
import {
    mountExpressionEditor,
    type MountedExpressionEditor,
} from "./expression-codemirror";

/**
 * The editor body. **Author-static** Handlebars source (Rule #10): only the
 * helper palette rides in `data.helpers` (each name escaped). The editable
 * expression is **not** interpolated into the template — it is passed to the
 * CodeMirror editor programmatically in {@link wireEditor}, which mounts into the
 * `[data-editor]` container. No data is ever concatenated into template source.
 *
 * The editor is a CodeMirror instance we own (see `expression-codemirror.ts`)
 * with grammar-aware highlighting and helper/identifier autocomplete. The
 * **authoritative** validity check is SafeExpression's own grammar, run live on
 * every edit and shown in the status line below the editor.
 */
const EDITOR_CONTENT = toHTMLString(
    `<div class="sohl expression-editor">
        <div class="expression-editor__code" data-editor></div>
        <div class="expression-editor__status" data-status role="status" aria-live="polite"></div>
        <details class="expression-editor__helpers">
            <summary>{{localize "SOHL.ExpressionEditor.helpers"}}</summary>
            <div class="expression-editor__palette">
                {{#each helpers}}<button type="button" class="expression-editor__chip" data-helper="{{this}}" data-tooltip="{{localize "SOHL.ExpressionEditor.insertHelper"}}">{{this}}</button>{{/each}}
            </div>
        </details>
    </div>`,
);

/** Options for {@link openExpressionEditorDialog}. */
export interface ExpressionEditorDialogOptions {
    /**
     * Context-identifier names the field's call site binds (e.g. `attr`,
     * `birthsigns`), offered in autocomplete alongside the helper functions.
     */
    contextNames?: string[];
}

/**
 * Open the SafeExpression editor for a formula-field value.
 *
 * A popup with a CodeMirror editor — **grammar-aware syntax highlighting** and
 * **helper/identifier autocomplete** — plus **live validation against the real
 * SafeExpression grammar** (the same jsep parse + allowlist the runtime uses —
 * see {@link SafeExpression.validateSource}) and a click-to-insert palette of the
 * registered helper functions ({@link expressionHelpers}). **Save** is disabled
 * while the expression is invalid, so the dialog can only ever return a valid
 * expression. **Clear** returns the empty value; **Cancel** returns nothing.
 *
 * @param current - The field's current expression source, or `null`/`undefined`
 *   when unset (the editor opens empty).
 * @param options - Autocomplete context (see {@link ExpressionEditorDialogOptions}).
 * @returns The edited expression string on Save, `null` to clear the field, or
 *   `undefined` if the dialog was cancelled or dismissed.
 */
export async function openExpressionEditorDialog(
    current: string | null | undefined,
    options: ExpressionEditorDialogOptions = {},
): Promise<string | null | undefined> {
    // Shared state between the render hook, the button callback, and the code
    // below. We record the chosen `action` and the live editor value in `state`
    // rather than reading the dialog's resolved value: a `<dialog>` whose Save
    // button submits can resolve the wait-promise via its native close before the
    // button callback's value propagates, so the returned value is unreliable.
    // `state` is set synchronously in the callback (which runs on any button
    // press) and read here after the dialog has fully closed. `editor` is the
    // CodeMirror handle — the authoritative value source at press time.
    const state: {
        source: string;
        editor: MountedExpressionEditor | null;
        action: string | undefined;
    } = { source: current ?? "", editor: null, action: undefined };

    await dialog({
        title: sohl.i18n.localize("SOHL.ExpressionEditor.title"),
        content: EDITOR_CONTENT,
        modal: true,
        data: {
            helpers: expressionHelpers.names().sort(),
        },
        buttons: [
            {
                action: "save",
                label: sohl.i18n.localize("SOHL.ExpressionEditor.save"),
                icon: "fa-solid fa-check",
                default: true,
            },
            {
                action: "clear",
                label: sohl.i18n.localize("SOHL.ExpressionEditor.clear"),
                icon: "fa-solid fa-xmark",
            },
            {
                action: "cancel",
                label: sohl.i18n.localize("SOHL.ExpressionEditor.cancel"),
            },
        ],
        render: (element: HTMLElement) =>
            wireEditor(element, state, options.contextNames ?? []),
        callback: (_formData, action) => {
            state.action = action;
            if (action === "save" && state.editor) {
                state.source = state.editor.getValue();
            }
            return { action };
        },
        rejectClose: false,
    });

    state.editor?.destroy();

    // A button press ran the callback and set `state.action`; a dismissal
    // (Escape / close) left it undefined — treat that as cancel.
    if (state.action === "save") return state.source;
    if (state.action === "clear") return null;
    return undefined;
}

/**
 * Wire the editor's live behaviour: mount the CodeMirror editor, revalidate on
 * every edit (updating the shared `state.source`, the status line, and the Save
 * button's enabled state), and make each helper chip insert `name()` at the
 * cursor.
 * @param element - The dialog's rendered root element.
 * @param state - Shared mutable holder for the live editor value and handle.
 * @param state.source - The current editor text (updated on every edit).
 * @param state.editor - The mounted CodeMirror handle (captured for Save/destroy).
 * @param contextNames - Context-identifier names offered in autocomplete.
 */
function wireEditor(
    element: HTMLElement,
    state: { source: string; editor: MountedExpressionEditor | null },
    contextNames: string[],
): void {
    const container = element.querySelector<HTMLElement>("[data-editor]");
    const status = element.querySelector<HTMLElement>("[data-status]");
    const saveBtn =
        element
            .closest(".application")
            ?.querySelector<HTMLButtonElement>('button[data-action="save"]') ??
        null;
    if (!container) return;

    const revalidate = (value: string): void => {
        state.source = value;
        const error = SafeExpression.validateSource(value);
        if (status) {
            status.textContent =
                error ?? sohl.i18n.localize("SOHL.ExpressionEditor.valid");
            status.classList.toggle("is-error", Boolean(error));
            status.classList.toggle("is-valid", !error);
        }
        if (saveBtn) saveBtn.disabled = Boolean(error);
    };

    const editor = mountExpressionEditor(container, state.source, {
        onChange: revalidate,
        contextNames,
    });
    state.editor = editor;
    // Expose the handle on the mount node so integration tests can drive the
    // editor deterministically (get/set the value) without simulating keystrokes.
    (
        container as unknown as { _expressionEditor: typeof editor }
    )._expressionEditor = editor;
    // Focus after the popup is shown so the view measures and paints correctly.
    editor.focus();

    element.querySelectorAll<HTMLElement>("[data-helper]").forEach((chip) => {
        chip.addEventListener("click", () => {
            const name = chip.dataset.helper;
            if (name) editor.insertText(`${name}()`);
        });
    });

    revalidate(state.source);
}
