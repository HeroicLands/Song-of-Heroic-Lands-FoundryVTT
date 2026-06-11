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
 * TypeDoc plugin: resolve `{@link}`s (and type references) to Foundry VTT
 * symbols against the official Foundry API site, so e.g. `{@link Scene}`
 * becomes a link to `foundryvtt.com/api/classes/foundry.documents.Scene.html`
 * instead of an unresolved reference.
 *
 * Foundry symbols come from the `fvtt-types` package (the resolver receives
 * `moduleSource === "fvtt-types"`). Bare global names (`Scene`, `Combat`, …)
 * carry no namespace, so they are mapped through {@link FOUNDRY_QUALIFIED};
 * already-qualified references (`foundry.dice.Roll`) are used as-is. Unknown
 * Foundry symbols are left unlinked rather than guessed.
 *
 * @param {import("typedoc").Application} app
 */
export function load(app) {
    app.converter.addUnknownSymbolResolver((ref, _refl, _part, symbolId) => {
        const parts = ref?.symbolReference?.path;
        if (!parts?.length) return;
        const name = parts.map((p) => p.path).join(".");

        let qualified;
        if (name.startsWith("foundry.")) {
            // Already namespace-qualified. Truncate any nested member to its
            // class (e.g. `foundry.data.CalendarData.TimeComponents` →
            // `foundry.data.CalendarData`) since only classes have API pages.
            qualified = toClassPath(name);
        } else if (
            ref.moduleSource === "fvtt-types" ||
            symbolId?.fileName?.includes("fvtt-types")
        ) {
            // Bare Foundry global. Map the top-level name to its API path;
            // nested members (e.g. `Combat.SubType`) link to the parent class.
            const base = name.split(".")[0];
            qualified = FOUNDRY_QUALIFIED[base];
            if (!qualified) return; // unknown Foundry symbol — leave unlinked
        } else {
            return; // not a Foundry symbol
        }

        return `${API_BASE}/classes/${qualified}.html`;
    });
}

/**
 * Reduce a qualified Foundry path to its class: keep the lowercase namespace
 * segments and the first PascalCase segment (the class), dropping any nested
 * members after it. Only classes have their own Foundry API page.
 *
 * @param qualified - A dotted Foundry path (e.g. `foundry.data.CalendarData.TimeComponents`).
 * @returns The class-level path (e.g. `foundry.data.CalendarData`).
 */
function toClassPath(qualified) {
    const segments = qualified.split(".");
    const classIndex = segments.findIndex((s) => /^[A-Z]/.test(s));
    if (classIndex === -1) return qualified;
    return segments.slice(0, classIndex + 1).join(".");
}

/** Base URL of the Foundry VTT API reference. */
const API_BASE = "https://foundryvtt.com/api";

/**
 * Bare Foundry global name → fully-qualified Foundry API path. Needed because
 * the source references these globals unqualified (`Scene`, not
 * `foundry.documents.Scene`), and `canvas`/`data` have sub-namespaces a path
 * heuristic can't infer (`Token` → `canvas.placeables`, `StringField` →
 * `data.fields`). Extend as new Foundry types are referenced.
 */
const FOUNDRY_QUALIFIED = {
    // Documents
    Actor: "foundry.documents.Actor",
    Item: "foundry.documents.Item",
    Scene: "foundry.documents.Scene",
    Combat: "foundry.documents.Combat",
    Combatant: "foundry.documents.Combatant",
    CombatantGroup: "foundry.documents.CombatantGroup",
    User: "foundry.documents.User",
    ChatMessage: "foundry.documents.ChatMessage",
    ActiveEffect: "foundry.documents.ActiveEffect",
    TokenDocument: "foundry.documents.TokenDocument",
    // Canvas
    Canvas: "foundry.canvas.Canvas",
    Token: "foundry.canvas.placeables.Token",
    // Dice
    Roll: "foundry.dice.Roll",
    // Data
    CalendarData: "foundry.data.CalendarData",
    StringField: "foundry.data.fields.StringField",
    // Abstract bases
    DataModel: "foundry.abstract.DataModel",
    TypeDataModel: "foundry.abstract.TypeDataModel",
    Document: "foundry.abstract.Document",
    // Globals
    Game: "foundry.Game",
};
