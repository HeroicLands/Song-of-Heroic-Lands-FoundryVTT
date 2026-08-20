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
 * **Frontmatter readers** — the pure functions that read a content note's
 * `sohl:` block and normalize what they find.
 *
 * Split out of `helpers.mjs` as a **leaf module**: its only import is a frozen
 * list of constants, so the
 * item-type registry (`item-builders.mjs`) can build on it without dragging in
 * `helpers.mjs`, which reaches wikilinks — and through them back to
 * `item-docs.mjs`, the very module that derives `ITEM_TYPES` from the registry
 * (#1504). Keeping these readers dependency-free is what makes that one-way.
 *
 * `helpers.mjs` re-exports everything here, so existing importers are
 * unaffected: there is still one name for each reader.
 */

// The affiliation standings an authored `relation` map may use. Read from the
// build package rather than restated here, so the pipeline and the runtime
// enum cannot drift apart (#1510) — a value absent from the list is a build
// error, never a silent ship.
import { AFFILIATION_STANDINGS } from "../sohl/affiliation-standings.mjs";

/**
 * Resolves a dotted frontmatter key (e.g., "name.full") into the nested
 * value. Returns `defaultValue` if any path segment is missing.
 */
export function getFrontmatter(fm, key, defaultValue = undefined) {
    if (fm == null || typeof fm !== "object") return defaultValue;
    if (key in fm) return fm[key];
    const parts = key.split(".");
    let current = fm;
    for (const part of parts) {
        if (current == null || typeof current !== "object") return defaultValue;
        current = current[part];
    }
    return current !== undefined ? current : defaultValue;
}

/**
 * Reads a key from `fm.sohl` (the vault's nested system-fields block).
 * Supports dotted notation, e.g. sohlField(fm, "charges.value", 0).
 * Falls back to top-level `fm[key]` if `sohl` doesn't carry the key.
 */
export function sohlField(fm, key, defaultValue = undefined) {
    if (fm == null || typeof fm !== "object") return defaultValue;
    const sohl = fm.sohl;
    if (sohl && typeof sohl === "object") {
        if (key in sohl) return sohl[key] ?? defaultValue;
        const fromNested = getFrontmatter(sohl, key, undefined);
        if (fromNested !== undefined) return fromNested;
    }
    return getFrontmatter(fm, key, defaultValue);
}

/**
 * Resolve the `charges` block shared by Mystery and Mystical Ability items.
 *
 * Charge usage is carried by the **maximum** alone (#1129): a `null` max means
 * the item does not use charges at all, `0` means it is counted but uncapped,
 * and a positive number is a real cap. `value` is the current count, with
 * `null` meaning "infinite remaining". Both persist as nullable NumberFields,
 * so absent frontmatter must resolve to `null` — coercing it to `0` would ship
 * every item as an uncapped charge-user.
 *
 * A legacy `usesCharges` flag in authored frontmatter is ignored: it was inert
 * and has been dropped from the schema.
 *
 * @param {object} fm - The item frontmatter.
 * @returns {{value: number|null, max: number|null}} The persisted charges block.
 */
export function resolveCharges(fm) {
    const toCount = (raw) => {
        if (raw == null || raw === "") return null;
        const num = Number(raw);
        return Number.isFinite(num) ? Math.trunc(num) : null;
    };
    const max = toCount(sohlField(fm, "charges.max", null));
    // A blank maximum means "does not use charges" — a stray current count
    // cannot outlive it, since the logic layer disables both modifiers.
    return {
        value:
            max === null ? null : toCount(sohlField(fm, "charges.value", null)),
        max,
    };
}

/**
 * Resolve an item's `skillAptitudes` map — selector → mastery-level modifier,
 * where a selector is a skill shortcode or `subType:<value>`.
 *
 * Authored values must be whole numbers: the persisted field is an integer
 * `NumberField`, and a fractional or non-numeric entry would be silently
 * coerced at load, shipping an aptitude nobody authored. A malformed entry is a
 * build error rather than a rounded surprise. A `0` is legitimate and must be
 * kept — an element a sign leaves untouched still beats one another sign
 * hinders, so it carries real weight when maps merge.
 *
 * @param {object} fm - The item frontmatter.
 * @param {string} [ctx] - Label for the error (defaults to "item").
 * @returns {Record<string, number>} The persisted aptitude map (empty when
 *   the item authors none).
 * @throws {Error} When a value is not an integer.
 */
export function resolveSkillAptitudes(fm, ctx = "item") {
    const raw = sohlField(fm, "skillAptitudes", undefined);
    if (raw == null) return {};
    if (typeof raw !== "object" || Array.isArray(raw)) {
        throw new Error(
            `${ctx}: skillAptitudes must be a map of selector → number`,
        );
    }
    const out = {};
    for (const [selector, value] of Object.entries(raw)) {
        const num = Number(value);
        if (!Number.isInteger(num)) {
            throw new Error(
                `${ctx}: skillAptitudes["${selector}"] must be a whole number, got "${value}"`,
            );
        }
        out[selector] = num;
    }
    return out;
}

/**
 * Resolve an affiliation's `relation` map — the shortcode of another
 * affiliation → this one's standing toward it (#1404).
 *
 * An unrecognized standing would fail the schema's `choices` validation at load
 * and be dropped silently, shipping an affiliation whose authored hostility had
 * quietly become neutrality — so it is a build error instead.
 *
 * @param {object} fm - The item frontmatter.
 * @param {string} [ctx] - Label for the error (defaults to "item").
 * @returns {Record<string, string>} The persisted relation map (empty when the
 *   affiliation authors none — neutral toward everyone).
 * @throws {Error} When the map is malformed or names an unknown standing.
 */
export function resolveRelation(fm, ctx = "item") {
    const raw = sohlField(fm, "relation", undefined);
    if (raw == null) return {};
    if (typeof raw !== "object" || Array.isArray(raw)) {
        throw new Error(
            `${ctx}: relation must be a map of shortcode → standing`,
        );
    }
    const out = {};
    for (const [code, value] of Object.entries(raw)) {
        const standing = String(value);
        if (!AFFILIATION_STANDINGS.includes(standing)) {
            throw new Error(
                `${ctx}: relation["${code}"] must be one of ${AFFILIATION_STANDINGS.join(", ")}, got "${value}"`,
            );
        }
        out[code] = standing;
    }
    return out;
}

/**
 * Read the mandatory `subType` from an item's frontmatter, throwing when it is
 * absent or blank.
 *
 * Every subType-bearing item type declares `subType` as `required` with **no**
 * default in its DataModel — a subtype must always be specified, and it is an
 * error to omit it. The builder therefore substitutes no fallback: a content
 * file missing `subType` is a build error, surfaced here rather than shipped as
 * an invalid (typeless-fallback) item.
 *
 * @param {object} fm - The item frontmatter.
 * @param {string} [ctx] - Optional label for the error (defaults to the item's
 *   title/name, else "item").
 * @returns {string} The declared subType.
 * @throws {Error} When `subType` is missing or blank.
 */
export function requireSubType(fm, ctx) {
    const subType = sohlField(fm, "subType", undefined);
    if (subType == null || subType === "") {
        const label = ctx || fm?.title || fm?.name || "item";
        throw new Error(
            `${label}: missing required 'subType' — every subType-bearing item must declare its kind (the builder substitutes no default).`,
        );
    }
    return String(subType);
}

/**
 * Parses the valueDesc / threshold array format. Accepts either:
 *   - Array of "Label:MaxValue" strings, e.g. ["Ugly:4", "Plain:12"]
 *   - Array of objects, e.g. [{ label, maxValue }]
 * Returns a normalized array of `{ label, maxValue: number }`.
 */
export function parseValueDesc(raw) {
    if (!raw || !Array.isArray(raw)) return [];
    return raw.map((entry) => {
        if (typeof entry === "string") {
            const [label, maxStr] = entry.split(":");
            return {
                label: (label ?? "").trim(),
                maxValue: parseInt(maxStr, 10) || 0,
            };
        }
        if (typeof entry === "object" && entry?.label !== undefined) {
            return {
                label: String(entry.label),
                maxValue: Number(entry.maxValue) || 0,
            };
        }
        return { label: String(entry), maxValue: 0 };
    });
}
