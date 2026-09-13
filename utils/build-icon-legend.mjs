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

/*
 * Generates the user guide's "Icon Legend" page from the code that actually
 * defines the icons, so the page cannot drift from the interface it documents.
 *
 * Sources of truth (all read straight from `src/`):
 *   - ITEM_METADATA / ACTOR_METADATA in src/utils/constants.ts  -> document-type icons
 *   - the Being sheet's static TABS                             -> tab-strip icons
 *   - every `iconFAClass` in a `defineIntrinsicActions()` body  -> action icons
 *
 * Human-readable names come from lang/en.json, so the legend reads the way the
 * interface does rather than exposing shortcodes.
 *
 * Output: assets/content/User_Guide/Icon_Legend.md — single-sourced to the
 * in-Foundry journal (markdown-it, `html: true`) and to the knowledgebase
 * (goldmark, `unsafe = true`). Both pass raw HTML through, so each row renders
 * the real glyph via `<i class="…">` rather than naming a CSS class.
 *
 * Run: npm run build:icon-legend
 */

import { readFileSync, writeFileSync } from "fs";
import { emitDiagnostic } from "@heroiclands/package-build/engine/diagnostics";
import { formatGenerated } from "./format-generated.mjs";
import { globSync } from "glob";
import YAML from "yaml";

const LANG_PATH = "lang/en.json";
const CONSTANTS_PATH = "src/utils/constants.ts";
const BEING_SHEET_PATH = "src/document/actor/foundry/BeingSheet.ts";
const OUT_PATH = "assets/content/User_Guide/Icon_Legend.md";
const REGISTRY_PATH = "assets/icon-registry.yaml";

/**
 * The pack folder this page routes into, by path rather than by folder id
 *: folders are notes, and a note names the folder it belongs to the
 * same way every other note does.
 */
const PAGE_PACK_FOLDER = "userguide";

/**
 * The note's logical identity — `(type, shortcode)`.
 *
 * **No top-level `aliases` block.** A link names an address,
 * `[[type-shortcode|Text]]`, which both resolvers reach through
 * `readQualifier` → `type/shortcode` without consulting any alias. The field is
 * refused outright, so a generator emitting one would fail the build
 * on the next run.
 *
 * See kb/dev-docs/reference/content-links.md.
 */
const PAGE_TYPE = "doc";
const PAGE_SHORTCODE = "iconlgndug";

/** Flatten lang/en.json into dotted keys so `SOHL.A.B` resolves in one lookup. */
function flattenLang(obj, prefix = "", out = {}) {
    for (const [k, v] of Object.entries(obj)) {
        const key = prefix ? `${prefix}.${k}` : k;
        if (v && typeof v === "object") flattenLang(v, key, out);
        else out[key] = v;
    }
    return out;
}

/**
 * Slice the balanced `{ … }` block that starts at or after `from`.
 * Brace counting is enough here: these are plain object literals with no
 * braces inside string values.
 */
function braceBlock(text, from) {
    const start = text.indexOf("{", from);
    if (start < 0) return "";
    let depth = 0;
    for (let i = start; i < text.length; i++) {
        if (text[i] === "{") depth++;
        else if (text[i] === "}" && --depth === 0) return text.slice(start, i + 1);
    }
    return "";
}

/** Split an object-literal body into its top-level `key: { … }` entries. */
function topLevelEntries(block) {
    const body = block.slice(1, -1);
    const out = [];
    const re = /(^|\n)\s{0,8}([A-Za-z_][\w]*)\s*:\s*\{/g;
    let m;
    while ((m = re.exec(body))) {
        const inner = braceBlock(body, m.index + m[0].length - 1);
        if (inner) out.push([m[2], inner]);
    }
    return out;
}

/**
 * How much larger than body text a legend glyph renders, in the icon role's own
 * size vocabulary. At inline size an icon is legible in context but too small
 * to *study*, which is what this page is for — a reader is learning the shape
 * so they recognise it later on a sheet.
 *
 * The role's size classes scale the element rather than applying a per-family
 * rule, which keeps the two families matched: `ginf-` glyphs carry their own
 * `font-size` compensation on ::before, so a uniform element scale preserves
 * the Font Awesome parity the icon metrics were tuned for.
 */
const GLYPH_DISPLAY_SIZE = "2x";

/**
 * The icon fonts this package ships, as `package-build` wants them declared.
 *
 * Both are ours to promise: Font Awesome because Foundry serves it to a sheet
 * and this repository's own knowledgebase theme links it, and the Game-Icons
 * webfont because `utils/build-icon-font.mjs` builds it here from the SVGs.
 * The toolchain ships neither, which is why it asks.
 *
 * `styles` are the weights a font carries. Game-Icons has none, so an entry
 * drawn from it names no style and gets no weight class.
 */
const FAMILIES = {
    fontawesome: {
        class: "fa",
        styles: ["solid", "regular", "brands"],
        describe: "Font Awesome Free",
    },
    "game-icons": {
        class: "ginf",
        styles: [],
        describe: "the Game-Icons.net webfont this package builds",
    },
};

/**
 * Names the User Guide's prose reaches for, which the legend has no row for.
 *
 * The legend documents *controls* — a thing on a sheet, in a menu, on a card —
 * and each of its rows says where you see it. These name a glyph in a sentence
 * instead: "the :icon-menu: opens it", "worth :icon-star: :icon-star:". There
 * is no single control to point at, so there is no row to write, but a note
 * still has to be able to say them.
 *
 * They are the same glyphs the legend's own rows draw, under the shorter names
 * a writer types mid-sentence. Where one is really a synonym for a control the
 * legend documents, the two entries agree by construction: both are read from
 * the class the interface renders.
 *
 * @type {Record<string, {style: string, icon: string, label: string}>}
 */
const PROSE_ICONS = {
    star: { style: "solid", icon: "star", label: "star" },
    gem: { style: "solid", icon: "gem", label: "value gem" },
    // One glyph, three sentences. A `✕` means "not applicable" in a Healing
    // Rate column, "close" on a dialog's corner, and neither is the other for
    // a reader who cannot see it.
    close: { style: "solid", icon: "xmark", label: "close" },
    "not-applicable": { style: "solid", icon: "xmark", label: "not applicable" },
    menu: { style: "solid", icon: "ellipsis-vertical", fixedWidth: true, label: "actions menu" },
    run: { style: "solid", icon: "play", label: "run this action" },
    shield: { style: "solid", icon: "shield-halved", label: "armour" },
    compass: { style: "solid", icon: "compass", label: "guided tour" },
    flask: { style: "solid", icon: "flask", label: "under construction" },
};

/**
 * Presentational Font Awesome classes that are not the glyph.
 *
 * `fa-fw` is the one the interface uses, and it is **not** decoration: without
 * it a vertical ellipsis is too narrow to sit in a column of controls. It
 * survives as a registry property rather than a class, so this list is what
 * keeps it from being mistaken for the icon's name — an entry called `fw` would
 * draw nothing and say nothing about why.
 */
const MODIFIERS = new Set(["fa-fw", "fa-xs", "fa-sm", "fa-lg", "fa-xl", "fa-2x", "fa-3x"]);

/** Font Awesome's weight classes, in both the modern and the legacy spelling. */
const STYLE_CLASS = {
    "fa-solid": "solid",
    fas: "solid",
    "fa-regular": "regular",
    far: "regular",
    "fa-brands": "brands",
    fab: "brands",
};

/**
 * A registry entry, read off the class the interface actually draws with.
 *
 * The class is the source of truth because it is what the sheet renders; a
 * table typed out beside it would be a second place to be wrong. A legacy alias
 * (`fas` beside `fa-solid`) and a size class are both normalised away — the
 * registry owns the spelling, so the page stops carrying either.
 */
function entryFor(cls) {
    const tokens = cls.split(/\s+/).filter(Boolean);
    const parts = tokens.filter((t) => !MODIFIERS.has(t));

    const ginf = parts.find((t) => t.startsWith("ginf-"));
    if (ginf) return { family: "game-icons", icon: ginf.slice("ginf-".length) };

    let style;
    let icon;
    for (const t of parts) {
        if (STYLE_CLASS[t]) style ??= STYLE_CLASS[t];
        // The **first** glyph token: a second would be a second icon, which one
        // element cannot draw.
        else if (t.startsWith("fa-")) icon ??= t.slice("fa-".length);
    }
    if (!icon) throw new Error(`build-icon-legend: class "${cls}" names no glyph`);

    const entry = { style: style ?? "solid", icon };
    if (tokens.includes("fa-fw")) entry.fixedWidth = true;
    return entry;
}

/**
 * The name a note writes between the colons, from the name a reader sees.
 *
 * The registry is keyed by **meaning**, not by glyph, which is why several
 * names share one: `attack`, `combat` and `weapon` are all a broadsword, and a
 * reader who cannot see it gets the sentence rather than the picture.
 */
function iconName(name) {
    return (
        name
            .toLowerCase()
            .replace(/&/g, " and ")
            // A possessive is not part of the name: "Victory Star (target's)" is
            // the target's victory star, and `victory-star-target-s` reads as a typo.
            .replace(/'s\b/g, "")
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-|-$/g, "")
    );
}

/** Pull `defineType("<id>", { … })` and return its top-level entries. */
function defineTypeEntries(src, id) {
    const at = src.indexOf(`defineType("${id}"`);
    if (at < 0) return [];
    return topLevelEntries(braceBlock(src, at));
}

/** Document-type icons: one row per item/actor subtype. */
function collectTypeIcons(constants, lang) {
    const rows = [];
    for (const [id, langPrefix, group] of [
        ["SOHL.Actor.METADATA", "TYPES.Actor", "Actors"],
        ["SOHL.Item.METADATA", "TYPES.Item", "Items"],
    ]) {
        for (const [kind, body] of defineTypeEntries(constants, id)) {
            const m = body.match(/IconCssClass:\s*"([^"]+)"/);
            if (!m) continue;
            rows.push({
                group,
                cls: m[1],
                name: lang[`${langPrefix}.${kind}`] ?? kind,
                note: `${group === "Actors" ? "Actor" : "Item"} sheet, sidebar, and compendium`,
            });
        }
    }
    return rows;
}

/** Tab-strip icons from the Being sheet's static TABS declaration. */
function collectTabIcons(sheet, lang) {
    const decl = /static\s+(?:override\s+)?TABS\s*=/.exec(sheet);
    if (!decl) return [];
    const block = braceBlock(sheet, decl.index);
    const rows = [];
    const re = /id:\s*"([^"]+)",\s*label:\s*"([^"]+)",\s*icon:\s*"([^"]+)"/g;
    let m;
    while ((m = re.exec(block))) {
        rows.push({
            group: "Being sheet tabs",
            cls: m[3],
            name: lang[m[2]] ?? m[1],
            note: "Tab on the Being sheet",
        });
    }
    return rows;
}

/**
 * Logic classes whose name is not a document subtype, so `TYPES.*` cannot name
 * them. These are the shared bases and the non-Item/Actor documents; spelled
 * the way a player would describe where the action appears.
 */
const OWNER_LABELS = {
    SohlItemBase: "Any item",
    SohlActorBase: "Any actor",
    SohlCombatant: "A combatant in the tracker",
    SohlTokenDocument: "A token on the canvas",
    SohlActiveEffect: "An active effect",
};

/** Name the thing an action hangs off, as the player would recognise it. */
function ownerLabel(file, lang) {
    const base = file
        .split("/")
        .pop()
        .replace(/Logic\.ts$|\.ts$/, "");
    if (OWNER_LABELS[base]) return OWNER_LABELS[base];
    const kind = base.toLowerCase();
    const typed = lang[`TYPES.Item.${kind}`] ?? lang[`TYPES.Actor.${kind}`];
    if (typed) return typed;
    return base.replace(/^Sohl/, "").replace(/([a-z])([A-Z])/g, "$1 $2");
}

/**
 * Action icons: every `iconFAClass` inside a `defineIntrinsicActions()` body.
 * Each entry's `title` gives the name the player sees in the context menu.
 */
function collectActionIcons(lang) {
    const rows = [];
    const seen = new Set();
    for (const file of globSync("src/**/*.ts")) {
        const src = readFileSync(file, "utf8");
        let at = src.indexOf("defineIntrinsicActions");
        while (at >= 0) {
            const block = braceBlock(src, at);
            for (const entry of block.split(/\},\s*\{/)) {
                const icon = entry.match(/iconFAClass:\s*"([^"]+)"/);
                const title = entry.match(/title:\s*"([^"]+)"/);
                if (!icon || !title) continue;
                const name = lang[title[1]] ?? lang[`${title[1]}.title`];
                if (!name) continue;
                const key = `${icon[1]}|${name}`;
                if (seen.has(key)) continue;
                seen.add(key);
                rows.push({
                    group: "Actions",
                    cls: icon[1],
                    name,
                    note: ownerLabel(file, lang),
                });
            }
            at = src.indexOf("defineIntrinsicActions", at + 1);
        }
    }
    return rows;
}

/**
 * The affordance icons the sheets draw — a disabled marker, a drag handle, the
 * control that adds a row — and the second set of hand-maintained rows here.
 *
 * **These cannot be generated, and the reason is worth stating plainly.** The
 * three sources this file reads are `ITEM_METADATA`/`ACTOR_METADATA`, the Being
 * sheet's `TABS`, and `iconFAClass` in `defineIntrinsicActions()` — all of them
 * places where an icon is declared *with a name beside it*. These glyphs are
 * written in Handlebars templates instead, which this generator does not scan.
 *
 * Scanning the templates would not be enough either. A template holds
 * `<i class="fa-solid fa-grip-vertical">` and nothing that says it means
 * **Drag Handle**, or that a hollow star on the Skills tab means an improvement
 * flag that is *not* set. That meaning is a design decision, and it exists in
 * the designer's head and in this table. Nowhere else.
 *
 * So this is not duplication to be tidied away later. Deleting it does not move
 * the knowledge somewhere better; it loses it. The rows arrived by hand-editing
 * the generated page, which the `--check` mode then correctly refused —
 * moving them here is what makes both the page and the check right.
 */
const INDICATOR_ROWS = [
    {
        cls: "fa-solid fa-xmark fa-lg",
        name: "Disabled",
        note: "Sheets",
    },
    // The improve flag changes **shape** between its states, where the star and
    // gem scales change weight. That is the difference between a thing you read
    // and a thing you count: a scale is filled and hollow copies of one glyph
    // so the eye can total them, and a toggle is two glyphs so the eye can tell
    // which one it is looking at. It also stops the flag being a second
    // filled/hollow star pair beside the Victory Stars, which is what it was.
    {
        cls: "fa-solid fa-circle-up",
        name: "Improve Flag Set",
        note: "Skills and Mysteries tabs on the Being sheet",
    },
    {
        cls: "fa-regular fa-circle",
        name: "Improve Flag Unset",
        note: "Skills and Mysteries tabs on the Being sheet",
    },
    {
        cls: "fa-solid fa-ellipsis-vertical fa-fw",
        name: "Context Menu",
        note: "Sheets",
    },
    {
        cls: "fa-solid fa-plus",
        name: "Add",
        note: "Sheets",
    },
    {
        cls: "fa-solid fa-grip-vertical",
        name: "Drag Handle",
        note: "Sheets",
    },
    {
        cls: "fa-solid fa-heart-circle-plus",
        name: "Injury Healed",
        note: "Trauma Tab on Actor Sheet",
    },
    {
        cls: "fa-solid fa-file-circle-plus",
        name: "Create Item",
        note: "Sheets",
    },
    // "Edit Item" is drawn with `fa-file-pen`, below, not `fa-pen-to-square`.
    // The latter is the intrinsic **Edit** action, which the Actions section
    // already emits from `iconFAClass` — a row here would have been the same
    // glyph under a second name for the same thing.
    {
        cls: "fa-solid fa-globe",
        name: "Visit HeroicLands Site",
        note: "Sheets",
    },
    {
        cls: "fa-solid fa-play",
        name: "Start Tour",
        note: "Sheets",
    },
    {
        cls: "fa-regular fa-square-plus",
        name: "Add Effect Change",
        note: "Active Effect Sheet",
    },
    {
        cls: "fa-solid fa-trash",
        name: "Remove Effect Change",
        note: "Active Effect Sheet",
    },
    {
        cls: "fa-solid fa-gears",
        name: "Execute Macro",
        note: "Sheets",
    },
    {
        cls: "fa-solid fa-play",
        name: "Perform Action",
        note: "Actions Tab on Item and Actor Sheets",
    },
    // Three controls edit something, and the glyphs say which kind of thing:
    // `fa-pen-to-square` a document or field — the intrinsic Edit action, which
    // the Actions section emits and so is not repeated here — `fa-code` an
    // expression, and `fa-file-code` a Macro document. Snippet against
    // document is the distinction the "file" carries.
    {
        cls: "fa-solid fa-file-code",
        name: "Edit Macro",
        note: "Actions Tab on Item and Actor Sheets",
    },
    {
        cls: "fa-solid fa-code",
        name: "Edit Expression",
        note: "Beside any Safe Expression field",
    },
    {
        cls: "fa-solid fa-folder-plus",
        name: "Create Folder",
        note: "Sheets",
    },
    {
        cls: "fa-solid fa-folder-minus",
        name: "Delete Folder",
        note: "Sheets",
    },
    {
        cls: "fa-solid fa-clone",
        name: "Clone",
        note: "Sheets",
    },
    {
        cls: "fa-solid fa-file-import",
        name: "Import",
        note: "Sheets",
    },
    // No "Add Occupant" row: it is a declared intrinsic action, so the Actions
    // section already emits it from `iconFAClass` under that exact name. A hand
    // row here would print the same glyph and the same name twice.
    // The chosen-one-of-a-set pair, drawn the way the improve flag is: a shape
    // change rather than a weight change, because it is a toggle and not a
    // scale. A filled/hollow `fa-star` here would be a second star pair beside
    // the Victory Stars with an unrelated meaning.
    {
        cls: "fa-solid fa-circle-check",
        name: "Default Movement Medium",
        note: "Movement rows on the Being sheet's Profile tab",
    },
    {
        cls: "fa-regular fa-circle",
        name: "Not the Default Medium",
        note: "Movement rows on the Being sheet's Profile tab — click to make it the default",
    },
    {
        cls: "fa-solid fa-triangle-exclamation fa-fw",
        name: "Warning",
        note: "Sheets",
    },
    {
        cls: "fa-solid fa-circle-question",
        name: "Help",
        note: "Sheets",
    },
];

/**
 * The star and gem icons the result cards draw, which nothing in the source
 * declares as a set — one of the two hand-maintained tables on this page.
 *
 * Both are **scales**, which is why each is one glyph in two weights: a reader
 * totals them, so filled and hollow copies of the same shape is what lets the
 * eye do that. Toggles get two different glyphs instead, for the opposite
 * reason — see INDICATOR_ROWS.
 *
 * The gems are not `fa-diamond`. That glyph is Font Awesome's
 * playing-card suit and ships in **solid only**, so the hollow half of the
 * scale was asking the shipped font for something it does not contain. `fa-gem`
 * has both weights and is a gemstone, which is what a quality scale means; the
 * rules term "Value Diamond" survives it, Font Awesome listing "diamond" as the
 * gem's own first search term.
 */
const MARK_ROWS = [
    {
        cls: "fa-solid fa-star",
        name: "Victory Star (tester's)",
        note:
            "Opposed and attack result cards \u2014 one filled star per step of" +
            " success level, when the side that started the contest won it",
    },
    {
        cls: "fa-regular fa-star",
        name: "Victory Star (target's)",
        note:
            "The same margin drawn hollow, when the side that answered the" +
            " contest won it \u2014 so the line says who won as well as by how much",
    },
    {
        cls: "fa-solid fa-gem",
        name: "Value Diamond (earned)",
        note:
            "Success Value test cards \u2014 one filled diamond per point of" +
            " quality earned above Base Value, out of the five on the scale",
    },
    {
        cls: "fa-regular fa-gem",
        name: "Value Diamond (unearned)",
        note:
            "The remainder of the five-diamond scale, drawn hollow \u2014 so the" +
            " row reads as a rating rather than a bare tally",
    },
];

/**
 * Trailing prose for a section, where the table alone would leave a distinction
 * unsaid. Keyed by section name.
 */
const SECTION_NOTES = {
    "Stars & Diamonds":
        "**Victory Stars** are the margin of a contest \u2014 how far the" +
        " winner's success level exceeded the loser's \u2014 drawn filled for the" +
        " tester and hollow for the target, and worth one star when a tiebreak" +
        " settles a tie. The margin has no ceiling, so only the earned stars are" +
        " drawn. **Value Diamonds** are an unrelated measure: the quality of a" +
        " single Success Value test (see [[doc-sklltestug|Skill Tests]]). That scale" +
        " does have a ceiling \u2014 five \u2014 so the whole scale is drawn and the" +
        " earned diamonds are filled. The same filled/hollow star pair marks a" +
        " skill flagged for improvement on the Skills tab.",
};

/**
 * Render one markdown table per group.
 *
 * The glyph cell **names** its icon rather than drawing one. Raw `<i>` markup
 * renders on the two HTML surfaces and reaches a book as nothing at all, since
 * Typst is handed markdown and knows no HTML — and this page, being nothing but
 * icons, is the whole of that problem in one file.
 *
 * The size rides on the token because it is this page's business: at inline
 * size an icon is legible in context but too small to *study*, which is what a
 * legend is for.
 */
function renderTable(rows) {
    const out = ["| Glyph | Name | Where you see it |", "| :---: | --- | --- |"];
    for (const r of rows.sort((a, b) => a.name.localeCompare(b.name)))
        out.push(
            `| :icon-${iconName(r.name)}:{size: ${GLYPH_DISPLAY_SIZE}} | **${r.name}** | ${r.note} |`,
        );
    return out.join("\n");
}

/**
 * The registry the configuration points at, as YAML.
 *
 * Generated from the same scan that writes the page, so the two cannot
 * disagree about what the interface draws — which is the whole reason the page
 * can stop carrying markup.
 */
async function renderRegistry(sections) {
    const icons = {};
    for (const [, rows] of sections) {
        for (const r of rows) {
            const name = iconName(r.name);
            // The label is what a reader who cannot see the glyph is told, so
            // it is the row's own name rather than the glyph's — "value diamond
            // (earned)", not "gem".
            const entry = { ...entryFor(r.cls), label: r.name.toLowerCase() };
            const seen = icons[name];
            if (seen && JSON.stringify(seen) !== JSON.stringify(entry)) {
                throw new Error(
                    `build-icon-legend: "${r.name}" is drawn two different ways — ` +
                        `${JSON.stringify(seen)} and ${JSON.stringify(entry)}`,
                );
            }
            icons[name] = entry;
        }
    }

    for (const [name, entry] of Object.entries(PROSE_ICONS)) {
        const row = icons[name];
        if (row && JSON.stringify(row) !== JSON.stringify(entry)) {
            throw new Error(
                `build-icon-legend: "${name}" is both a legend row and a prose name, ` +
                    `drawn two different ways — ${JSON.stringify(row)} and ` +
                    `${JSON.stringify(entry)}`,
            );
        }
        icons[name] = entry;
    }

    const ordered = {};
    for (const name of Object.keys(icons).sort()) ordered[name] = icons[name];

    return formatGenerated(
        "# Generated by utils/build-icon-legend.mjs — do not edit by hand.\n" +
            "#\n" +
            "# The fonts this package ships and the names its notes draw from them,\n" +
            "# read off the classes the interface actually renders. `package-build.config.yaml`\n" +
            "# points at this file; regenerate with `npm run build:icon-legend`.\n" +
            YAML.stringify({ families: FAMILIES, defaultFamily: "fontawesome", icons: ordered }),
        REGISTRY_PATH,
    );
}

/** Render the whole page, exactly as it should appear on disk. */
async function renderPage() {
    const lang = flattenLang(JSON.parse(readFileSync(LANG_PATH, "utf8")));
    const constants = readFileSync(CONSTANTS_PATH, "utf8");
    const sheet = readFileSync(BEING_SHEET_PATH, "utf8");

    const sections = [
        ["Actors", collectTypeIcons(constants, lang).filter((r) => r.group === "Actors")],
        ["Items", collectTypeIcons(constants, lang).filter((r) => r.group === "Items")],
        ["Being sheet tabs", collectTabIcons(sheet, lang)],
        ["Actions", collectActionIcons(lang)],
        ["Stars & Diamonds", MARK_ROWS],
        ["Indicators", INDICATOR_ROWS],
    ];

    // A silently empty section would publish a legend that looks complete but
    // documents nothing — fail the build instead.
    for (const [name, rows] of sections)
        if (!rows.length)
            throw new Error(
                `build-icon-legend: section "${name}" matched no icons — ` +
                    `the source shape it parses has probably changed.`,
            );

    const body = sections
        .map(([name, rows]) => {
            const note = SECTION_NOTES[name];
            return `## ${name}\n\n${renderTable(rows)}` + (note ? `\n\n${note}` : "");
        })
        .join("\n\n");

    const page = `---
type: ${PAGE_TYPE}
subType: userguide
name:
    full: "Icon Legend"
shortcode: ${PAGE_SHORTCODE}
packFolder: ${PAGE_PACK_FOLDER}
---

# Icon Legend

Song of Heroic Lands uses a small, consistent set of icons. The same glyph always means the same thing, whether it appears on a sheet tab, beside a row, or in a right-click menu. This page shows every one of them.

Icons come from two families: [Font Awesome](https://fontawesome.com) (its free set) and [Game-Icons.net](https://game-icons.net) for the arms, gear, and condition glyphs that Font Awesome does not cover.

${body}

## See also

- [[doc-undrstndsheetug|Understanding Sheets]] — the tabs and rows these glyphs label.
- [[doc-actionsug|Actions]] — the mechanism behind every action icon above.
- [[doc-baseitemug|Base Item]] — the four actions that belong to every document.
- [[doc-sklltestug|Skill Tests and Opposed Tests]] — the stars and diamonds in context, on a result card.
- [[doc-userguide|User Guide]] — back to the index.

<!-- Generated by utils/build-icon-legend.mjs — do not edit by hand. -->
`;

    const total = sections.reduce((n, [, rows]) => n + rows.length, 0);
    return { text: await formatGenerated(page, OUT_PATH), total, sections };
}

/**
 * Write the page, or — with `--check` — verify the committed copy already equals
 * what this generator would write.
 *
 * The check exists because the generator's output and the file it owns had
 * silently diverged: the page's own header says "do not edit by hand",
 * and nothing said so when someone did. Drift here is not cosmetic — the copy on
 * disk had gained the `doc-iconlgndug` address alias the generator never emitted,
 * so the *next* run of `npm run build:icon-legend` would have deleted it and
 * taken every `[[doc-iconlgndug]]` link down with it.
 *
 * The alias has since been removed from the whole tree and from this generator,
 * and the gate earned its keep a second time in doing so: the sweep edited this
 * page like any other and the check caught the generator still emitting the
 * line, rather than letting the next regeneration quietly restore it.
 *
 * Same shape as `lint:expr-scopes` and `lint:type-catalog`: the generator is the
 * authority, and the gate is the generator asked whether it agrees with the tree.
 */
async function main() {
    const check = process.argv.includes("--check");
    const { text, total, sections } = await renderPage();
    const registry = await renderRegistry(sections);

    // Two files, one scan. The page names its icons and the registry says what
    // each one is, so a name the page writes and a name the registry declares
    // cannot disagree — which is what lets the page carry no markup.
    const outputs = [
        { path: OUT_PATH, text },
        { path: REGISTRY_PATH, text: registry },
    ];

    if (!check) {
        for (const out of outputs) writeFileSync(out.path, out.text);
        console.log(
            `✅ Icon legend: ${total} icons across ${sections.length} sections → ${OUT_PATH}`,
        );
        console.log(`✅ Icon registry → ${REGISTRY_PATH}`);
        return;
    }

    let stale = false;
    for (const out of outputs) {
        const onDisk = readFileSync(out.path, "utf8");
        if (onDisk === out.text) continue;
        stale = true;
        emitDiagnostic({
            file: out.path,
            severity: "error",
            message:
                "does not match what utils/build-icon-legend.mjs would write — " +
                "it is generated from src/ and lang/en.json, so edit the " +
                "generator, not the file; regenerate with `npm run build:icon-legend`",
        });
        for (const line of firstDifference(onDisk, out.text)) console.error(`  ${line}`);
    }
    if (stale) {
        process.exitCode = 1;
        return;
    }
    console.log(
        `check-icon-legend: ${OUT_PATH} and ${REGISTRY_PATH} are up to date (${total} icons).`,
    );
}

/**
 * A few lines of context around the first line that differs, so the failure
 * names what changed instead of only that something did.
 *
 * @param {string} onDisk Committed file contents.
 * @param {string} generated What the generator would write.
 * @returns {string[]} Display lines, already prefixed with `-`/`+`.
 */
function firstDifference(onDisk, generated) {
    const a = onDisk.split("\n");
    const b = generated.split("\n");
    const at = a.findIndex((line, i) => line !== b[i]);
    if (at < 0) return [`(identical for ${a.length} lines; lengths differ at the end)`];
    return [
        `first difference at line ${at + 1}:`,
        `- ${a[at] ?? "(end of file)"}`,
        `+ ${b[at] ?? "(end of file)"}`,
    ];
}

await main();
