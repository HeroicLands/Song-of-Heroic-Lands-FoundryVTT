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

/**
 * The editor body. **Author-static** Handlebars source (Rule #10): the current
 * expression rides in `data.source` (escaped by `{{source}}` into the textarea's
 * text content) and the helper palette is built from `data.helpers` (each name
 * escaped). No data is ever concatenated into the template source.
 *
 * Phase 1 uses a plain monospace `<textarea>` for the editing surface: it renders
 * reliably (Foundry's bundled `<code-mirror>` element paints blank inside a
 * DialogV2 popup) and supports the seeded value and free typing. Syntax
 * highlighting is deferred to Phase 2 (a bundled CodeMirror instance). The
 * **authoritative** validity check is SafeExpression's own grammar, run live in
 * {@link wireEditor} and shown in the status line below the editor.
 */
const EDITOR_CONTENT = toHTMLString(
    `<div class="sohl expression-editor">
        <textarea name="source" class="expression-editor__code" rows="5" spellcheck="false" autocomplete="off" autocapitalize="off" wrap="soft">{{source}}</textarea>
        <div class="expression-editor__status" data-status role="status" aria-live="polite"></div>
        <details class="expression-editor__helpers">
            <summary>{{localize "SOHL.ExpressionEditor.helpers"}}</summary>
            <div class="expression-editor__palette">
                {{#each helpers}}<button type="button" class="expression-editor__chip" data-helper="{{this}}" data-tooltip="{{localize "SOHL.ExpressionEditor.insertHelper"}}">{{this}}</button>{{/each}}
            </div>
        </details>
    </div>`,
);

/**
 * Open the SafeExpression editor for a formula-field value.
 *
 * A popup with a monospace editor, **live validation against the real
 * SafeExpression grammar** (the same jsep parse + allowlist the runtime uses —
 * see {@link SafeExpression.validateSource}), and a click-to-insert palette of the
 * registered helper functions ({@link expressionHelpers}). **Save** is disabled
 * while the expression is invalid, so the dialog can only ever return a valid
 * expression. **Clear** returns the empty value; **Cancel** returns nothing.
 *
 * @param current - The field's current expression source, or `null`/`undefined`
 *   when unset (the editor opens empty).
 * @returns The edited expression string on Save, `null` to clear the field, or
 *   `undefined` if the dialog was cancelled or dismissed.
 */
export async function openExpressionEditorDialog(
    current: string | null | undefined,
): Promise<string | null | undefined> {
    // Shared state between the render hook, the button callback, and the code
    // below. We record the chosen `action` and the live editor value in `state`
    // rather than reading the dialog's resolved value: a `<dialog>` whose Save
    // button submits can resolve the wait-promise via its native close before the
    // button callback's value propagates, so the returned value is unreliable.
    // `state` is set synchronously in the callback (which runs on any button
    // press) and read here after the dialog has fully closed. `field` is the
    // textarea — the authoritative value source at press time.
    const state: {
        source: string;
        field: HTMLTextAreaElement | null;
        action: string | undefined;
    } = { source: current ?? "", field: null, action: undefined };

    await dialog({
        title: sohl.i18n.localize("SOHL.ExpressionEditor.title"),
        content: EDITOR_CONTENT,
        modal: true,
        data: {
            source: state.source,
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
        render: (element: HTMLElement) => wireEditor(element, state),
        callback: (_formData, action) => {
            state.action = action;
            if (action === "save" && state.field) {
                state.source = state.field.value;
            }
            return { action };
        },
        rejectClose: false,
    });

    // A button press ran the callback and set `state.action`; a dismissal
    // (Escape / close) left it undefined — treat that as cancel.
    if (state.action === "save") return state.source;
    if (state.action === "clear") return null;
    return undefined;
}

/**
 * Wire the editor's live behaviour: revalidate on every edit (updating the shared
 * `state.source`, the status line, and the Save button's enabled state), and make
 * each helper chip insert `name()` at the cursor.
 * @param element - The dialog's rendered root element.
 * @param state - Shared mutable holder for the live editor value and element.
 * @param state.source - The current editor text (updated on every edit).
 * @param state.field - The textarea (captured so the Save callback can read it).
 */
function wireEditor(
    element: HTMLElement,
    state: { source: string; field: HTMLTextAreaElement | null },
): void {
    const field = element.querySelector<HTMLTextAreaElement>(
        "textarea.expression-editor__code",
    );
    const status = element.querySelector<HTMLElement>("[data-status]");
    state.field = field;
    const saveBtn =
        element
            .closest(".application")
            ?.querySelector<HTMLButtonElement>('button[data-action="save"]') ??
        null;
    if (!field) return;

    const revalidate = (): void => {
        const value = field.value ?? "";
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

    field.addEventListener("input", revalidate);

    element.querySelectorAll<HTMLElement>("[data-helper]").forEach((chip) => {
        chip.addEventListener("click", () => {
            const name = chip.dataset.helper;
            if (!name) return;
            const insert = `${name}()`;
            const value = field.value ?? "";
            const start = field.selectionStart ?? value.length;
            const end = field.selectionEnd ?? value.length;
            field.value = value.slice(0, start) + insert + value.slice(end);
            // Drop the caret inside the inserted call's parentheses.
            const caret = start + insert.length - 1;
            field.focus();
            field.setSelectionRange(caret, caret);
            revalidate();
        });
    });

    revalidate();
}
