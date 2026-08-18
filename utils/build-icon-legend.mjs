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
import { globSync } from "glob";

const LANG_PATH = "lang/en.json";
const CONSTANTS_PATH = "src/utils/constants.ts";
const BEING_SHEET_PATH = "src/document/actor/foundry/BeingSheet.ts";
const OUT_PATH = "assets/content/User_Guide/Icon_Legend.md";

/**
 * Foundry document id for the generated page. This MUST stay fixed: the journal
 * compiler keys entries by id, so changing it would orphan the existing page and
 * break every link to it. Chosen once, collision-checked against the pack.
 */
const PAGE_ID = "GU59i07VkICWsT2l";
/** The "User Guide" folder in assets/content/journal-folders.yaml. */
const USER_GUIDE_FOLDER_ID = "IgwaG8rAUUO9vrtz";

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
        else if (text[i] === "}" && --depth === 0)
            return text.slice(start, i + 1);
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
 * How much larger than body text a legend glyph renders. At inline size an icon
 * is legible in context but too small to *study*, which is what this page is
 * for — a reader is learning the shape so they recognise it later on a sheet.
 *
 * Scaling the element (rather than any per-family rule) keeps the two families
 * matched: `ginf-` glyphs carry their own `font-size` compensation on ::before,
 * so a uniform element scale preserves the Font Awesome parity the icon metrics
 * were tuned for, and the em-based baseline shift scales with it.
 */
const GLYPH_DISPLAY_SIZE = "2em";

/**
 * The `<i>` markup for an icon class, ready to drop into a markdown table.
 *
 * The size is inlined rather than shipped as a class because this page renders
 * in two places — the Foundry journal and the Hugo knowledgebase — whose
 * stylesheets live in different repositories. An inline style needs neither,
 * and it is confined to this generated page.
 */
function glyph(cls) {
    return (
        `<i class="${cls}" style="font-size:${GLYPH_DISPLAY_SIZE}"` +
        ` aria-hidden="true"></i>`
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
 * The star and diamond icons the result cards draw, which nothing in the source
 * declares as a set \u2014 the only hand-maintained rows on this page. Font
 * Awesome's solid and regular weights are the same shape filled and hollow, which
 * is what carries both the "whose stars are these" distinction and the earned /
 * unearned split on the diamond scale; a Game-Icons glyph has no hollow twin.
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
        cls: "fa-solid fa-diamond",
        name: "Value Diamond (earned)",
        note:
            "Success Value test cards \u2014 one filled diamond per point of" +
            " quality earned above Base Value, out of the five on the scale",
    },
    {
        cls: "fa-regular fa-diamond",
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
        " single Success Value test (see [[doc/sklltsts|Skill Tests]]). That scale" +
        " does have a ceiling \u2014 five \u2014 so the whole scale is drawn and the" +
        " earned diamonds are filled. The same filled/hollow star pair marks a" +
        " skill flagged for improvement on the Skills tab.",
};

/** Render one markdown table per group. */
function renderTable(rows) {
    const out = [
        "| Glyph | Name | Where you see it |",
        "| :---: | --- | --- |",
    ];
    for (const r of rows.sort((a, b) => a.name.localeCompare(b.name)))
        out.push(`| ${r.symbol ?? glyph(r.cls)} | **${r.name}** | ${r.note} |`);
    return out.join("\n");
}

function main() {
    const lang = flattenLang(JSON.parse(readFileSync(LANG_PATH, "utf8")));
    const constants = readFileSync(CONSTANTS_PATH, "utf8");
    const sheet = readFileSync(BEING_SHEET_PATH, "utf8");

    const sections = [
        [
            "Actors",
            collectTypeIcons(constants, lang).filter(
                (r) => r.group === "Actors",
            ),
        ],
        [
            "Items",
            collectTypeIcons(constants, lang).filter(
                (r) => r.group === "Items",
            ),
        ],
        ["Being sheet tabs", collectTabIcons(sheet, lang)],
        ["Actions", collectActionIcons(lang)],
        ["Stars & Diamonds", MARK_ROWS],
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
            return (
                `## ${name}\n\n${renderTable(rows)}` +
                (note ? `\n\n${note}` : "")
            );
        })
        .join("\n\n");

    const page = `---
aliases:
    - Icon Legend
    - Icons
    - Glyphs
id: ${PAGE_ID}
type: doc
package: sohl
category: user-guide
name:
    full: "Icon Legend"
slug: "icon-legend"
shortcode: iconlgnd
folder: ${USER_GUIDE_FOLDER_ID}
---

# Icon Legend

Song of Heroic Lands uses a small, consistent set of icons. The same glyph always
means the same thing, whether it appears on a sheet tab, beside a row, or in a
right-click menu. This page shows every one of them.

Icons come from two families: [Font Awesome](https://fontawesome.com) (its free
set) and [Game-Icons.net](https://game-icons.net) for the arms, gear, and
condition glyphs that Font Awesome does not cover.

${body}

## See also

- [[doc/undrstnd|Understanding Sheets]] — the tabs and rows these glyphs label.
- [[doc/actions|Actions]] — the mechanism behind every action icon above.
- [[doc/baseitem|Base Item]] — the four actions that belong to every document.
- [[doc/sklltsts|Skill Tests and Opposed Tests]] — the stars and diamonds in
  context, on a result card.
- [[doc/userguide|User Guide]] — back to the index.

<!-- Generated by utils/build-icon-legend.mjs — do not edit by hand. -->
`;

    writeFileSync(OUT_PATH, page);
    const total = sections.reduce((n, [, rows]) => n + rows.length, 0);
    console.log(
        `✅ Icon legend: ${total} icons across ${sections.length} sections → ${OUT_PATH}`,
    );
}

main();
