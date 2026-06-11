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

/*
 * Builds the "SoHL Icons" webfont from every SVG in assets/icons/.
 *
 * Pipeline: SVG files -> SVG font (svgicons2svgfont) -> TTF (svg2ttf)
 * -> WOFF2 (ttf2woff2). Emits three committed artifacts:
 *   - assets/fonts/sohl-icons.woff2       (the font)
 *   - scss/utils/_icons.scss              (@font-face + .sohl-<name> rules)
 *   - assets/icons/icon-codepoints.json   (stable name -> codepoint map)
 *
 * The codepoint map is persisted so each icon keeps the same Private Use Area
 * glyph across regenerations — adding or removing an icon never shifts the
 * codepoints of the others, so existing `<i class="sohl-...">` references stay
 * valid.
 *
 * After editing icons, run `npm run build:icons` and commit the artifacts.
 */

import { Buffer } from "buffer";
import {
    readFileSync,
    readdirSync,
    writeFileSync,
    mkdirSync,
    existsSync,
} from "fs";
import { basename, join } from "path";
import { Readable } from "stream";
import { SVGIcons2SVGFontStream } from "svgicons2svgfont";
import svg2ttf from "svg2ttf";
import ttf2woff2 from "ttf2woff2";
import { optimize } from "svgo";

const ICONS_DIR = "assets/icons";
const TEMPLATES_DIR = "templates";
const CODEPOINTS_PATH = join(ICONS_DIR, "icon-codepoints.json");
const WOFF2_PATH = "assets/fonts/sohl-icons.woff2";
const SCSS_PATH = "scss/utils/_icons.scss";
const CLASS_PREFIX = "sohl-";
const FONT_NAME = "SoHL Icons";
const FONT_HEIGHT = 1000;
const PUA_START = 0xe001; // first Private Use Area codepoint

/** Collect `{ name, path }` for every icon SVG, sorted by name. */
function readIcons() {
    return readdirSync(ICONS_DIR)
        .filter((f) => f.toLowerCase().endsWith(".svg"))
        .map((f) => ({ name: basename(f, ".svg"), path: join(ICONS_DIR, f) }))
        .sort((a, b) => a.name.localeCompare(b.name));
}

/**
 * Load the persisted name -> codepoint map and extend it with any new icons,
 * assigning each new icon the next free PUA codepoint (deterministically, in
 * sorted-name order). Returns the merged map. Stale entries (icons that no
 * longer exist) are kept so a deleted-then-restored icon reclaims its code.
 */
function resolveCodepoints(icons) {
    const map = existsSync(CODEPOINTS_PATH)
        ? JSON.parse(readFileSync(CODEPOINTS_PATH, "utf8"))
        : {};
    const used = new Set(Object.values(map));
    let next = PUA_START;
    const nextFree = () => {
        while (used.has(next)) next++;
        used.add(next);
        return next;
    };
    for (const { name } of icons) {
        if (map[name] == null) map[name] = nextFree();
    }
    return map;
}

/** Does a fill/style declaration explicitly set `fill: none`? */
function declaresNoFill(decl) {
    return /fill\s*:\s*none/i.test(decl);
}

/**
 * Decide whether a single drawable element resolves to a real fill (i.e. shows
 * a solid region) or to `fill: none` (stroke-only outline). Resolution order
 * follows CSS: inline `style` > `fill` attribute > class rule > default (black).
 */
function elementIsFilled(attrs, noneClasses) {
    const style = attrs.match(/style\s*=\s*"([^"]*)"/i)?.[1];
    if (style && /fill\s*:/i.test(style)) return !declaresNoFill(style);

    const fillAttr = attrs.match(/\bfill\s*=\s*["']?([^"'\s>]+)/i)?.[1];
    if (fillAttr) return fillAttr.toLowerCase() !== "none";

    const classes = attrs.match(/\bclass\s*=\s*"([^"]*)"/i)?.[1];
    if (classes)
        return !classes.split(/\s+/).some((c) => noneClasses.has(c));

    return true; // no fill specified anywhere => default black => filled
}

/**
 * Warn about genuinely stroke-only (line-art) icons: every drawable shape is
 * `fill: none` + stroke, so there is no solid region. svgo strips the stroke
 * styling, leaving the bare path to fill SOLID — a filled silhouette that
 * rarely matches the intended outline drawing. Icons that have at least one
 * real filled shape (a `fill: none` inner contour alongside a filled body) are
 * NOT flagged — they render correctly.
 *
 * Fix per icon: outline the strokes ("stroke to path") or swap in a filled
 * variant, then re-run this command.
 */
function reportStrokeOnly(icons) {
    const strokeOnly = icons.filter((icon) => {
        const svg = readFileSync(icon.path, "utf8");
        // CSS classes that set fill:none (Inkscape exports line art this way).
        const noneClasses = new Set();
        for (const block of svg.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/gi))
            for (const rule of block[1].matchAll(/\.([\w-]+)\s*\{([^}]*)\}/g))
                if (declaresNoFill(rule[2])) noneClasses.add(rule[1]);

        const shapes = [
            ...svg.matchAll(/<(?:path|polygon|circle|rect|ellipse)\b([^>]*)>/gi),
        ];
        // Stroke-only ⇔ at least one shape, and none of them is filled.
        return (
            shapes.length > 0 &&
            !shapes.some((m) => elementIsFilled(m[1], noneClasses))
        );
    });
    if (strokeOnly.length) {
        console.warn(
            `⚠️  ${strokeOnly.length} stroke-only line-art icon(s) have no solid shape; they will`,
        );
        console.warn(
            `    fill SOLID and likely look wrong. Outline the strokes or use a filled variant:`,
        );
        for (const { name } of strokeOnly) console.warn(`     • ${name}`);
    }
    return strokeOnly.length;
}

/**
 * Normalize a raw (often Inkscape-authored) SVG into clean, single-form path
 * geometry the strict font parser accepts: basic shapes -> paths, canonical
 * path data, namespaces/metadata stripped. viewBox is preserved for scaling.
 */
function normalizeSvg(rawSvg, name) {
    const { data } = optimize(rawSvg, {
        path: name,
        multipass: true,
        plugins: [
            // Drop stroke/style noise: these are flat fill glyphs, and a stray
            // `style`/`vector-effect` blocks svgo from baking transforms.
            {
                name: "removeAttrs",
                params: { attrs: ["vector-effect", "style", "stroke.*"] },
            },
            {
                name: "preset-default",
                params: {
                    overrides: {
                        // Turn polygon/polyline/circle/rect/etc. into <path>.
                        convertShapeToPath: { convertArcs: true },
                    },
                },
            },
        ],
    });
    // svgicons2svgfont applies transforms via `transformation-matrix`, whose
    // parser rejects concatenated functions like `translate(..)scale(..)`
    // (Inkscape's export style). Re-insert a separator between functions.
    // Safe globally: path data never contains ')'.
    return data.replace(/\)\s*([a-zA-Z])/g, ") $1");
}

/** Stream the SVGs through svgicons2svgfont and resolve with the SVG-font string. */
function buildSvgFont(icons, codepoints) {
    return new Promise((resolve, reject) => {
        const fontStream = new SVGIcons2SVGFontStream({
            fontName: FONT_NAME,
            fontHeight: FONT_HEIGHT,
            normalize: true,
            centerHorizontally: true,
            log: () => {}, // silence per-glyph chatter
        });
        let svgFont = "";
        fontStream
            .on("data", (chunk) => (svgFont += chunk))
            .on("end", () => resolve(svgFont))
            .on("error", reject);

        for (const icon of icons) {
            const svg = normalizeSvg(readFileSync(icon.path, "utf8"), icon.name);
            const glyph = Readable.from(svg);
            glyph.metadata = {
                unicode: [String.fromCodePoint(codepoints[icon.name])],
                name: icon.name,
            };
            fontStream.write(glyph);
        }
        fontStream.end();
    });
}

/** Generate the auto-managed SCSS partial (rules ordered by codepoint). */
function writeScss(icons, codepoints) {
    const ordered = [...icons].sort(
        (a, b) => codepoints[a.name] - codepoints[b.name],
    );
    const rules = ordered
        .map((icon) => {
            const hex = codepoints[icon.name].toString(16);
            return `.${CLASS_PREFIX}${icon.name}::before { content: "\\${hex}"; }`;
        })
        .join("\n");

    const scss = `/*
 * AUTO-GENERATED by \`npm run build:icons\` — do not edit by hand.
 * Source glyphs: ${ICONS_DIR}/*.svg   •   Codepoints: ${CODEPOINTS_PATH}
 *
 * Usage: <i class="${CLASS_PREFIX}<icon-name>"></i> (Font-Awesome style).
 * Glyphs inherit \`color\` and \`font-size\` like any text.
 */
@font-face {
    font-display: block;
    font-family: "${FONT_NAME}";
    font-style: normal;
    font-weight: 400;
    src: url("../assets/fonts/sohl-icons.woff2") format("woff2");
}

[class^="${CLASS_PREFIX}"]::before,
[class*=" ${CLASS_PREFIX}"]::before {
    font-family: "${FONT_NAME}" !important;
    font-style: normal;
    font-weight: normal;
    font-variant: normal;
    text-transform: none;
    line-height: 1;
    speak: never;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
}

${rules}
`;
    writeFileSync(SCSS_PATH, scss);
}

/** Recursively gather every `sohl-<name>` class token referenced in templates. */
function collectTemplateRefs(dir, refs = new Set()) {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
        const full = join(dir, entry.name);
        if (entry.isDirectory()) collectTemplateRefs(full, refs);
        else if (entry.name.endsWith(".hbs")) {
            const text = readFileSync(full, "utf8");
            for (const m of text.matchAll(/\bsohl-[a-z0-9-]+/g)) refs.add(m[0]);
        }
    }
    return refs;
}

/** Report template classes that have no matching glyph (visibility, not a failure). */
function reportCoverage(icons) {
    if (!existsSync(TEMPLATES_DIR)) return;
    const glyphClasses = new Set(
        icons.map((i) => `${CLASS_PREFIX}${i.name}`),
    );
    const refs = [...collectTemplateRefs(TEMPLATES_DIR)].sort();
    const missing = refs.filter((r) => !glyphClasses.has(r));
    if (missing.length) {
        console.warn(
            `\n⚠️  ${missing.length} \`sohl-*\` class(es) used in templates have NO matching glyph:`,
        );
        for (const r of missing) console.warn(`     • ${r}`);
        console.warn(
            "     (add an SVG to assets/icons/ or keep these on Font Awesome)",
        );
    }
}

async function main() {
    const icons = readIcons();
    if (!icons.length) {
        console.error(`No SVGs found in ${ICONS_DIR}/`);
        process.exit(1);
    }

    const codepoints = resolveCodepoints(icons);
    reportStrokeOnly(icons);

    const svgFont = await buildSvgFont(icons, codepoints);
    // Pin the font timestamp so regenerations are byte-identical (otherwise
    // svg2ttf stamps `head` with the current time, producing noisy diffs on a
    // committed binary even when no icon changed).
    const ttf = svg2ttf(svgFont, { description: FONT_NAME, ts: 0 });
    const woff2 = ttf2woff2(Buffer.from(ttf.buffer));

    mkdirSync("assets/fonts", { recursive: true });
    writeFileSync(WOFF2_PATH, woff2);
    writeScss(icons, codepoints);

    // Persist codepoints sorted by name for a stable, diff-friendly file.
    const sortedMap = Object.fromEntries(
        Object.entries(codepoints).sort(([a], [b]) => a.localeCompare(b)),
    );
    writeFileSync(CODEPOINTS_PATH, JSON.stringify(sortedMap, null, 4) + "\n");

    reportCoverage(icons);

    console.log(
        `\n✅ Generated ${icons.length} glyphs → ${WOFF2_PATH} (${(
            woff2.length / 1024
        ).toFixed(1)} KB), ${SCSS_PATH}, ${CODEPOINTS_PATH}`,
    );
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
