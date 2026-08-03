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
 * SoHL's **pure** (Foundry-free) Handlebars template helpers.
 *
 * These are the helpers whose behavior is self-contained — string/array/JSON
 * shaping and option-list building — with no dependency on the Foundry runtime,
 * the DOM, or the `sohl` surface. They are registered here through an **injected**
 * Handlebars instance so the exact same code runs in two places with no drift:
 *
 * - **Production** — {@link sohl} system init passes Foundry's global `Handlebars`.
 * - **Tests** — the Node render harness (`tests/mocks/hbs-helpers.ts`) passes the
 *   `handlebars` package, letting card/dialog templates render (and their emitted
 *   HTML be asserted) without a running Foundry.
 *
 * The Foundry-coupled helpers (form-field builders, the calendar date picker,
 * `getProperty`) remain registered in {@link sohl} and are stubbed in the harness.
 */

/**
 * The minimal Handlebars surface the pure helpers use — satisfied by both
 * Foundry's global `Handlebars` and the `handlebars` npm package.
 */
export interface HandlebarsLike {
    /** Register a named helper. */
    registerHelper(name: string, fn: (...args: any[]) => unknown): void;
    /** HTML-escape a value for safe interpolation. */
    escapeExpression(value: unknown): string;
    /** Wrapper marking a string as already-safe HTML. */
    SafeString: new (str: string) => unknown;
    /** Register a named partial from its template source. */
    registerPartial(name: string, template: string): void;
}

/** Name of the shared shortcode-reference field partial ({@link SHORTCODE_REF_PARTIAL}). */
export const SHORTCODE_REF_PARTIAL_NAME = "shortcodeRefField";

/**
 * The reusable shortcode-reference field widget (#974), registered as the named
 * partial `shortcodeRefField`. It renders a reference to another document by its
 * shortcode either as a **dropdown** (when the referencing item is embedded on an
 * actor, so a candidate list exists) or as the current **free-text input** (for a
 * world/pack item, where no candidate list exists).
 *
 * Invocation context (all optional unless noted):
 * - `embedded` — dropdown when truthy, free-text fallback otherwise.
 * - `name` (required) — the form field path (e.g. `"system.parentSkillCode"`).
 * - `value` — the currently-stored shortcode.
 * - `options` — `{value,label,unresolved?}[]` from `buildRefOptions`
 *   (`sohl.document.item.logic.buildRefOptions`).
 * - `label` / `hint` — localization keys for the control's label and tooltip.
 * - `blankLabel` — when present, a leading blank `<option>` with this (already
 *   localized) label, letting the author clear the reference.
 * - `field` / `rootId` — the DataModel field and its id for the free-text
 *   fallback via `formGroup`; when `field` is absent the fallback is a plain
 *   labeled text input (for app-config dialogs that hand-roll their inputs).
 *
 * The stored value is unchanged in either mode — always the shortcode string —
 * so no data-model change or migration is involved.
 */
export const SHORTCODE_REF_PARTIAL = `{{#if embedded}}
<div class="form-group stacked">
    <label>{{localize label}}</label>
    <select name="{{name}}"{{#if hint}} data-tooltip="{{localize hint}}"{{/if}}>
        {{selectOptions options selected=value valueAttr="value" labelAttr="label" blank=blankLabel}}
    </select>
</div>
{{else}}{{#if field}}{{formGroup field rootId=rootId classes="text-field" stacked=true value=value}}{{else}}<label class="form-group stacked"><span>{{localize label}}</span>
    <input type="text" name="{{name}}" value="{{value}}"{{#if hint}} data-tooltip="{{localize hint}}"{{/if}} /></label>{{/if}}{{/if}}`;

/**
 * Register SoHL's pure Handlebars helpers on the given Handlebars instance.
 *
 * Behavior-preserving extraction of the pure helpers formerly inlined in system
 * init — call it once during setup (production) or before rendering (tests).
 *
 * Registers: `selectArray`, `endswith`, `optionalString`, `setHas`, `contains`,
 * `toJSON`, `toLowerCase`, `arrayToString`, `injurySeverity`, `array`, and the
 * `shortcodeRefField` partial ({@link SHORTCODE_REF_PARTIAL}).
 *
 * @param H - The Handlebars instance to register onto (Foundry's global, or the
 *   `handlebars` package in tests).
 */
export function registerPureHandlebarsHelpers(H: HandlebarsLike): void {
    /**
     * Build a set of `<option>` elements from an array, for single- or
     * multi-select fields.
     * @throws {Error} If `choices` is not an Array.
     */
    H.registerHelper("selectArray", function (choices: any, options: any) {
        let selected = options.hash.selected ?? null;
        const blank = options.hash.blank ?? null;
        const sort = options.hash.sort ?? false;

        selected =
            selected instanceof Array ?
                selected.map(String)
            :   [String(selected)];

        // Prepare the choices as an array of objects
        const selectOptions: { value: string; label: string }[] = [];
        if (choices instanceof Array) {
            for (const choice of choices) {
                const label = String(choice);
                selectOptions.push({ value: label, label });
            }
        } else {
            throw new Error("You must specify an array to selectArray");
        }

        // Sort the array of options
        if (sort) selectOptions.sort((a, b) => a.label.localeCompare(b.label));

        // Prepend a blank option
        if (blank !== null) {
            selectOptions.unshift({ value: "", label: blank });
        }

        // Create the HTML
        let fragHtml = "";
        for (const option of selectOptions) {
            const label = H.escapeExpression(option.label);
            const value = H.escapeExpression(option.value);
            const isSelected = selected.includes(option.value);
            fragHtml += `<option value="${value}" ${isSelected ? "selected" : ""}>${label}</option>`;
        }
        return new H.SafeString(fragHtml);
    });

    H.registerHelper("endswith", function (op1: any, op2: any) {
        return op1.endsWith(op2);
    });

    H.registerHelper(
        "optionalString",
        function (cond: any, strTrue = "", strFalse = "") {
            if (cond) return strTrue;
            return strFalse;
        },
    );

    H.registerHelper("setHas", function (set: any, value: any) {
        return set.has(value);
    });

    H.registerHelper(
        "contains",
        function (container: any, value: any, options: any) {
            return container.includes(value) ?
                    options.fn(container)
                :   options.inverse(container);
        },
    );

    H.registerHelper("toJSON", function (obj: any) {
        return JSON.stringify(obj);
    });

    H.registerHelper("toLowerCase", function (str: any) {
        return str.toLowerCase();
    });

    H.registerHelper("arrayToString", function (ary: any) {
        return ary.join(",");
    });

    /**
     * Format a trauma severity level for display, dispatching on subType.
     *   - physical: 0 → "NA", 1 → "M1", 2 → "S2", 3 → "S3", 4 → "G4",
     *               5 → "G5", >5 → "G{val}".
     *   - mental:   0 → "—", N → "PSY {N}".
     *   - spiritual: 0 → "—", N → "AS {N}".
     *   - shadow:   0 → "—", N → "SL {N}".
     * Unknown subType falls back to the bare number.
     */
    H.registerHelper(
        "injurySeverity",
        function (val: unknown, subType: unknown) {
            const n = Number(val) || 0;
            switch (subType) {
                case "physical":
                    if (n <= 0) return "NA";
                    return n <= 5 ?
                            ["NA", "M1", "S2", "S3", "G4", "G5"][n]
                        :   `G${n}`;
                case "mental":
                    return n <= 0 ? "—" : `PSY ${n}`;
                case "spiritual":
                    return n <= 0 ? "—" : `AS ${n}`;
                case "shadow":
                    return n <= 0 ? "—" : `SL ${n}`;
                default:
                    return String(n);
            }
        },
    );

    H.registerHelper("array", function (...args: unknown[]) {
        // Drop Handlebars' trailing options object.
        return args.slice(0, args.length - 1);
    });

    // The shared shortcode-reference field widget (#974). Registered here — the
    // one seam both production init and the Node render harness call — so the
    // two register it identically and template rendering never drifts.
    H.registerPartial(SHORTCODE_REF_PARTIAL_NAME, SHORTCODE_REF_PARTIAL);
}
