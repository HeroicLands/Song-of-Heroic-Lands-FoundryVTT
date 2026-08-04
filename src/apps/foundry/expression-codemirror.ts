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

import { EditorState } from "@codemirror/state";
import {
    EditorView,
    keymap,
    drawSelection,
    highlightSpecialChars,
} from "@codemirror/view";
import {
    StreamLanguage,
    HighlightStyle,
    syntaxHighlighting,
    bracketMatching,
} from "@codemirror/language";
import {
    autocompletion,
    completionKeymap,
    closeBrackets,
    closeBracketsKeymap,
} from "@codemirror/autocomplete";
import { tags } from "@lezer/highlight";
import { expressionHelpers } from "@src/entity/expr/ExpressionHelperRegistry";
import { makeExpressionCompletionSource } from "./expression-completions";

/**
 * A mounted CodeMirror editor handle. The dialog reads the live value at Save
 * time via {@link getValue}, focuses it after the popup is shown, and destroys
 * it on close.
 */
export interface MountedExpressionEditor {
    /** The current editor text. */
    getValue(): string;
    /**
     * Replace the entire editor text (fires the change handler). Used by tests to
     * set content deterministically without simulating keystrokes.
     * @param text - The new editor text.
     */
    setValue(text: string): void;
    /** Focus the editor and force a re-measure (paints correctly in a popup). */
    focus(): void;
    /**
     * Insert `text` at the caret (replacing any selection) and re-focus. For a
     * helper call like `abs()` the caret lands between the parentheses.
     * @param text - The text to insert.
     */
    insertText(text: string): void;
    /** Tear down the CodeMirror view. */
    destroy(): void;
}

/** Options controlling {@link mountExpressionEditor}. */
export interface ExpressionEditorOptions {
    /** Called with the full text on every edit (drives live validation). */
    onChange: (value: string) => void;
    /**
     * Context-identifier names to offer in autocomplete alongside the helper
     * functions (e.g. the namespaces the field's call site binds: `attr`,
     * `birthsigns`, `actorLogic`). Helper names come from the registry.
     */
    contextNames?: string[];
}

/** Identifiers that read as a bound namespace rather than a plain variable. */
const NAMESPACE_WORDS = new Set([
    "attr",
    "birthsigns",
    "actorLogic",
    "itemLogic",
    "sm",
    "item",
]);

/** Literal keywords the grammar allows. */
const ATOM_WORDS = new Set(["true", "false", "null"]);

/**
 * A CodeMirror {@link StreamLanguage} that tokenizes the SafeExpression grammar
 * (not JavaScript): registered helper names read as functions, the bound
 * namespaces as namespaces, and only the operators the evaluator implements are
 * recognized. Highlighting therefore matches what the runtime actually accepts.
 */
const safeExpressionLanguage = StreamLanguage.define<{ afterDot: boolean }>({
    name: "safeexpr",
    startState: () => ({ afterDot: false }),
    token(stream, state) {
        if (stream.eatSpace()) return null;

        // Strings (single or double quoted, with escapes).
        if (stream.match(/^'(?:[^'\\]|\\.)*'?/)) return "string";
        if (stream.match(/^"(?:[^"\\]|\\.)*"?/)) return "string";

        // Numbers.
        if (stream.match(/^\d+(?:\.\d+)?/)) return "number";

        // Identifiers.
        if (stream.match(/^[A-Za-z_]\w*/)) {
            const word = stream.current();
            const afterDot = state.afterDot;
            state.afterDot = false;
            if (afterDot) return "property"; // member access: obj.PROP
            if (ATOM_WORDS.has(word)) return "atom";
            if (NAMESPACE_WORDS.has(word)) return "namespace";
            // A call to a registered helper — the callee is followed by `(`.
            const rest = stream.string.slice(stream.pos);
            if (/^\s*\(/.test(rest) && expressionHelpers.has(word)) {
                return "function";
            }
            return "variable";
        }

        state.afterDot = false;

        // Operators the evaluator implements (jsep is narrowed to match).
        if (stream.match(/^(?:===|!==|<=|>=|&&|\|\||[+\-*/%<>!?:])/)) {
            return "operator";
        }

        if (stream.match(/^[.]/)) {
            state.afterDot = true;
            return "punctuation";
        }
        if (stream.match(/^[()[\],]/)) return "punctuation";

        stream.next();
        return null;
    },
    tokenTable: {
        function: tags.function(tags.variableName),
        namespace: tags.namespace,
        property: tags.propertyName,
        punctuation: tags.punctuation,
    },
});

/** Dark syntax palette matching the editor surface in `_expression-editor.scss`. */
const highlightStyle = HighlightStyle.define([
    { tag: tags.function(tags.variableName), color: "#82aaff" },
    { tag: tags.namespace, color: "#c792ea" },
    { tag: tags.propertyName, color: "#b2ccd6" },
    { tag: tags.variableName, color: "#e6e6e6" },
    { tag: tags.string, color: "#c3e88d" },
    { tag: tags.number, color: "#f78c6c" },
    { tag: tags.atom, color: "#ff9cac" },
    { tag: tags.operator, color: "#89ddff" },
    { tag: tags.punctuation, color: "#a6accd" },
]);

/** Editor chrome theme (dark, sized to match the popup surface). */
const editorTheme = EditorView.theme(
    {
        "&": {
            fontSize: "14px",
            border: "1px solid var(--color-border-dark-tertiary, #444)",
            borderRadius: "3px",
            backgroundColor: "#1e1e2a",
            color: "#e6e6e6",
        },
        "&.cm-focused": { outline: "none" },
        ".cm-scroller": {
            fontFamily: "var(--font-mono, ui-monospace, monospace)",
            lineHeight: "1.5",
            minHeight: "6rem",
            maxHeight: "20rem",
        },
        ".cm-content": { padding: "6px 8px", caretColor: "#e6e6e6" },
        "&.cm-editor .cm-cursor": { borderLeftColor: "#e6e6e6" },
        ".cm-tooltip": {
            backgroundColor: "#26263a",
            border: "1px solid #444",
            color: "#e6e6e6",
        },
        ".cm-tooltip-autocomplete ul li[aria-selected]": {
            backgroundColor: "#3a3a55",
        },
    },
    { dark: true },
);

/**
 * Create and mount a CodeMirror editor for a SafeExpression, with grammar-aware
 * syntax highlighting and helper/identifier autocomplete.
 *
 * We construct the CodeMirror `EditorView` ourselves (rather than reusing
 * Foundry's `<code-mirror>` element, which paints blank inside a DialogV2 popup)
 * so we can force a re-measure via `focus()` once the dialog is visible.
 *
 * @param parent - The container element to mount the editor into.
 * @param doc - The initial expression text.
 * @param options - Change handler and autocomplete context (see
 *   {@link ExpressionEditorOptions}).
 * @returns A handle to read the value, focus/measure, and destroy the editor.
 */
export function mountExpressionEditor(
    parent: HTMLElement,
    doc: string,
    options: ExpressionEditorOptions,
): MountedExpressionEditor {
    const view = new EditorView({
        parent,
        state: EditorState.create({
            doc,
            extensions: [
                // `@codemirror/commands` is deliberately not bundled: it exports
                // a top-level `history` binding that, once bundled into the
                // single unminified `sohl.js`, shadows the global `history` for
                // the whole system (breaking `history.pushState`). Core CM still
                // handles typing/selection/arrows without its keymaps; we forgo
                // only undo/redo, acceptable for a short formula editor.
                drawSelection(),
                highlightSpecialChars(),
                bracketMatching(),
                closeBrackets(),
                syntaxHighlighting(highlightStyle),
                safeExpressionLanguage,
                autocompletion({
                    override: [
                        makeExpressionCompletionSource(
                            options.contextNames ?? [],
                        ),
                    ],
                    icons: false,
                }),
                EditorView.lineWrapping,
                editorTheme,
                keymap.of([...closeBracketsKeymap, ...completionKeymap]),
                EditorView.updateListener.of((update) => {
                    if (update.docChanged) {
                        options.onChange(update.state.doc.toString());
                    }
                }),
            ],
        }),
    });

    return {
        getValue: () => view.state.doc.toString(),
        setValue: (text: string) => {
            view.dispatch({
                changes: { from: 0, to: view.state.doc.length, insert: text },
            });
        },
        focus: () => {
            view.requestMeasure();
            view.focus();
        },
        insertText: (text: string) => {
            const { from, to } = view.state.selection.main;
            // Drop the caret inside a trailing `()` so the user can type args.
            const caret = from + text.length - (text.endsWith("()") ? 1 : 0);
            view.dispatch({
                changes: { from, to, insert: text },
                selection: { anchor: caret },
                // Keep the editor focused so the caret stays where we placed it.
                // (`view.focus()` is avoided here — programmatic focus trips a
                // DOM-selection read that throws in headless test browsers.)
                userEvent: "input.complete",
            });
        },
        destroy: () => view.destroy(),
    };
}
