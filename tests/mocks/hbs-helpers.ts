/*
 * This file is part of the Song of Heroic Lands (SoHL) system for Foundry VTT.
 * Copyright (c) 2024-2026 Tom Rodriguez ("Toasty") — <toasty@heroiclands.org>
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

/**
 * Test-side Handlebars helper registry for rendering real SoHL templates in Node.
 *
 * Foundry's `renderTemplate` is a file-loading wrapper around Handlebars, so a
 * test can render any SoHL `.hbs` for real in Node once the helpers the template
 * uses are available. Helpers fall into three buckets:
 *
 * 1. **Foundry logic helpers** (`eq` / `or` / `gt` / `ifThen` / `localize` / …) —
 *    pure and trivial; reimplemented faithfully here. `localize` reads the real
 *    `lang/en.json` so rendered output shows real labels. Foundry's `concat` /
 *    `object` are supplied here too (Node has no Foundry global).
 * 2. **Pure SoHL helpers** (`toJSON` / `selectArray` / `injurySeverity` / …) —
 *    registered from the **shared** Foundry-free module
 *    {@link sohl.utils.registerPureHandlebarsHelpers}, the exact code system init
 *    uses, so rendering here never drifts from production.
 * 3. **Foundry DOM/form builders + impure SoHL helpers** (`formGroup` /
 *    `formInput` / `textInput` / `datePicker` / …) — these build DOM via Foundry,
 *    so they are **stubbed to a param-bearing placeholder** that surfaces the
 *    field name / value / disabled state. Enough to assert "field X renders bound
 *    to value Y"; exact Foundry form markup stays an e2e concern. The pure
 *    option-list builders `selectOptions` (Foundry) and `selectArray` (SoHL) are
 *    the exception — they build option HTML from data with no DOM, so they are
 *    reimplemented **faithfully** (dialogs lean on them, and the option list is
 *    the content worth reviewing).
 *
 * The render path is the SAME shim (`toHTMLWithTemplate` / `toHTMLWithContent`)
 * for chat **cards** and **dialogs**, so this works for both. Chat cards use only
 * bucket 1 (+ `toJSON`); dialogs add the option-list builders and plain inputs;
 * `formGroup` and the heavier builders appear almost only in sheet templates.
 */

import Handlebars from "handlebars";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import {
    registerPureHandlebarsHelpers,
    type HandlebarsLike,
} from "@src/utils/handlebars-helpers";

/** Drop Handlebars' trailing `options` arg from a variadic helper's arguments. */
function variadic(args: IArguments): unknown[] {
    return Array.prototype.slice.call(args, 0, -1);
}

let LANG: Record<string, string> | undefined;
/** Localize against the real `lang/en.json`, falling back to the key. */
function localize(key: unknown): string {
    if (!LANG)
        LANG = JSON.parse(
            readFileSync(resolve(process.cwd(), "lang/en.json"), "utf8"),
        );
    const k = String(key);
    return LANG![k] ?? k;
}

/** A stub Foundry form-builder: emit a placeholder carrying the binding. */
function fieldPlaceholder(name: string) {
    return function (fieldOrValue: any, options: any): Handlebars.SafeString {
        const hash = options?.hash ?? {};
        const fieldName =
            hash.name ?? fieldOrValue?.fieldPath ?? fieldOrValue?.name ?? "";
        const value = hash.value ?? "";
        const esc = Handlebars.escapeExpression;
        const attrs = [
            `data-helper="${name}"`,
            fieldName ? `data-field="${esc(String(fieldName))}"` : "",
            `data-value="${esc(String(value))}"`,
            hash.disabled ? "data-disabled" : "",
        ]
            .filter(Boolean)
            .join(" ");
        return new Handlebars.SafeString(`<span ${attrs}></span>`);
    };
}

let registered = false;

/**
 * Register the test helper registry on the shared Handlebars instance (idempotent).
 * Call once before rendering a template via {@link renderTemplateReal}.
 */
export function registerTestHbsHelpers(): void {
    if (registered) return;
    registered = true;
    const H = Handlebars;

    // 1. Foundry LOGIC helpers — pure; copied verbatim from Foundry's
    //    registration so behavior is identical.
    H.registerHelper("eq", (v1, v2) => v1 === v2);
    H.registerHelper("ne", (v1, v2) => v1 !== v2);
    H.registerHelper("lt", (v1, v2) => v1 < v2);
    H.registerHelper("gt", (v1, v2) => v1 > v2);
    H.registerHelper("lte", (v1, v2) => v1 <= v2);
    H.registerHelper("gte", (v1, v2) => v1 >= v2);
    H.registerHelper("not", (pred) => !pred);
    H.registerHelper("and", function () {
        return Array.prototype.every.call(arguments, Boolean);
    });
    H.registerHelper("or", function () {
        return Array.prototype.slice.call(arguments, 0, -1).some(Boolean);
    });
    H.registerHelper("ifThen", (criteria, ifTrue, ifFalse) =>
        criteria ? ifTrue : ifFalse,
    );
    H.registerHelper("checked", (v) => (v ? "checked" : ""));
    H.registerHelper("disabled", (v) => (v ? "disabled" : ""));
    H.registerHelper("numberFormat", (n) => String(n)); // simplified
    H.registerHelper("localize", localize); // reads real lang/en.json
    // Foundry also provides these two; SoHL no longer redefines them (#583), so
    // the harness supplies Foundry's (no such global exists in Node).
    H.registerHelper("object", (opts: any) => opts?.hash ?? {});
    H.registerHelper("concat", function () {
        return variadic(arguments)
            .filter((a) => typeof a !== "object")
            .join("");
    });

    // 2. SoHL's PURE helpers — register the SAME code production uses (the shared
    //    Foundry-free module), so rendering here never drifts from the system.
    //    Provides: selectArray, endswith, optionalString, setHas, contains,
    //    toJSON, toLowerCase, arrayToString, injurySeverity, array.
    registerPureHandlebarsHelpers(H as unknown as HandlebarsLike);

    // 2b. `selectOptions` (Foundry) — faithful pure reimplementation; the option
    //     list is the dialog content worth reviewing. (`selectArray` is SoHL's,
    //     from the shared module above.)
    H.registerHelper("selectOptions", selectOptions);

    // 3. Foundry DOM/form builders + impure SoHL helpers → param placeholders.
    //    `formField` is Foundry's alias for `formGroup`. These build DOM through
    //    Foundry, so the stub surfaces the binding (name/value/disabled) instead.
    for (const name of [
        "formGroup",
        "formField",
        "formInput",
        "numberInput",
        "radioBoxes",
        "rangePicker",
        "filePicker",
        "editor",
        "textInput",
        "clearableNumberInput",
        "datePicker",
        "displayWorldTime",
    ]) {
        H.registerHelper(name, fieldPlaceholder(name));
    }
}

/** Foundry's `selectOptions` — faithful pure reimplementation of the option-list build. */
function selectOptions(choices: any, options: any): Handlebars.SafeString {
    const hash = options?.hash ?? {};
    const { selected, blank, valueAttr, labelAttr, sort } = hash;
    const localizeLabels = hash.localize;
    const sel =
        selected == null ? []
        : Array.isArray(selected) ? selected.map(String)
        : [String(selected)];
    let entries: { value: string; label: string }[] = [];
    if (Array.isArray(choices)) {
        entries = choices.map((c: any) =>
            valueAttr || labelAttr ?
                { value: String(c[valueAttr]), label: String(c[labelAttr]) }
            :   { value: String(c), label: String(c) },
        );
    } else if (choices && typeof choices === "object") {
        entries = Object.entries(choices).map(([k, v]: [string, any]) =>
            valueAttr || labelAttr ?
                {
                    value: String(v[valueAttr] ?? k),
                    label: String(v[labelAttr] ?? v),
                }
            :   { value: k, label: String(v) },
        );
    }
    if (localizeLabels)
        entries = entries.map((e) => ({
            value: e.value,
            label: localize(e.label),
        }));
    if (sort) entries.sort((a, b) => a.label.localeCompare(b.label));
    if (blank != null) entries.unshift({ value: "", label: String(blank) });
    const esc = Handlebars.escapeExpression;
    const html = entries
        .map(
            (e) =>
                `<option value="${esc(e.value)}"${sel.includes(e.value) ? " selected" : ""}>${esc(e.label)}</option>`,
        )
        .join("");
    return new Handlebars.SafeString(html);
}

const cache = new Map<string, ReturnType<typeof Handlebars.compile>>();

/**
 * Render a real SoHL `.hbs` (Foundry path) with real Handlebars + the test
 * registry. Registers helpers on first use.
 * @param foundryPath - `systems/sohl/templates/...` path.
 * @param data - Render context.
 * @returns Rendered HTML.
 */
export function renderTemplateReal(
    foundryPath: string,
    data: Record<string, unknown> = {},
): string {
    registerTestHbsHelpers();
    let tpl = cache.get(foundryPath);
    if (!tpl) {
        const rel = foundryPath.replace(/^systems\/sohl\//, "");
        const src = readFileSync(resolve(process.cwd(), rel), "utf8");
        tpl = Handlebars.compile(src);
        cache.set(foundryPath, tpl);
    }
    return tpl(data);
}
