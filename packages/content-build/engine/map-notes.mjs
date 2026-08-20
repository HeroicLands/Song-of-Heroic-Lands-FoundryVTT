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
 * **Map notes** — the markdown → Foundry `Scene` translation (issue #1525).
 *
 * A map note carries an *essence*: a curated, hand-owned subset of what a Scene
 * record holds, exactly as a weapon note carries a weapon's essence rather than
 * an Item's schema. Everything a Scene needs and nobody should have to author —
 * the canvas defaults, the embedded `Level`, every derived region field — is
 * synthesised here.
 *
 * Three note types compile through this module and differ only in derived
 * defaults: `battlemap` (tactical), `localmap` (~1 km) and `regionalmap` (large
 * scale). An unknown type fails the build rather than silently defaulting.
 *
 * **Two unit conventions, deliberately.** Geometry — walls, doors, lights,
 * tiles, sounds, region shapes — is authored in **pixels**, Foundry's native
 * storage, because a traced battlemap's walls do not lie on grid intersections
 * (measured: 97.8% do not). Map pins (`locations:`) are authored in **grid
 * squares**, commonly half-integers, because that is how a human reads a
 * position off the map. The two are told apart by their key: `position:` and
 * segment/shape coordinates are pixels, `at:` is grid squares. Mixing them
 * fails silently and visually in Foundry — a grid-valued wall lands in a tiny
 * clump at the top-left — so both directions are linted here against the map's
 * own `dimensions` and `pxPerGrid`.
 *
 * **What this module refuses.** Foundry accepts several authoring mistakes
 * without complaint, producing a valid document that simply never does
 * anything: a region event outside SoHL's curated set, a region with no shapes,
 * a degenerate two-point polygon, `restrict:` with no level. Each is an error
 * here. So is any `executeScript` behaviour: its `source` is a
 * `JavaScriptField`, and a note carrying one would be data compiled into code —
 * the system's top security constraint. It is not representable in this schema
 * and there is no escape hatch.
 *
 * Plain ESM with no Foundry and no filesystem access, so it is unit-testable
 * and usable from the bare-`node` pack scripts. The compiler that walks the
 * content tree and drives it is `scenes.mjs`.
 */

import crypto from "crypto";

import { compendiumUuid, makeId, MAP_TYPES } from "./ids.mjs";
// The curated region-event vocabulary is shared verbatim with the runtime
// bridge (`SohlRegionTriggerBehavior`), so an event this build accepts is
// exactly one the bridge forwards.
import {
    CURATED_REGION_EVENTS,
    EXCLUDED_REGION_EVENTS,
} from "./region-events.mjs";

/* -------------------------------------------------------------------- */
/*  Note types and their canvas profiles                                */
/* -------------------------------------------------------------------- */

// The set itself lives in `ids.mjs`, a leaf both this module and the
// doc-carrying type set in `item-docs.mjs` can depend on without a cycle.
export { MAP_TYPES };

/**
 * Whether a content note's type compiles into a Scene.
 *
 * @param {string} [type] - The note's `type` frontmatter.
 * @returns {boolean} True for a map type.
 */
export function isMapType(type) {
    return MAP_TYPES.has(String(type));
}

/**
 * Per-type canvas defaults, emitted **explicitly** on every scene.
 *
 * This is not a convenience. `grid.type`, `grid.distance` and `grid.units` all
 * declare `initial: () => game.system.grid.*`, and there is no `game` at build
 * time — left to their initial they would throw or ship undefined. The numeric
 * values are `CONST.GRID_TYPES` and `CONST.FOG_EXPLORATION_MODES`, spelled out
 * here because the constants module is Foundry's, not ours.
 *
 * @type {Readonly<Record<string, object>>}
 */
export const MAP_TYPE_PROFILES = Object.freeze({
    battlemap: Object.freeze({
        grid: { type: 1 /* SQUARE */, distance: 5, units: "ft" },
        tokenVision: true,
        fog: { mode: 1 /* INDIVIDUAL */ },
        padding: 0.25,
    }),
    localmap: Object.freeze({
        grid: { type: 1 /* SQUARE */, distance: 10, units: "m" },
        tokenVision: false,
        fog: { mode: 0 /* DISABLED */ },
        padding: 0.1,
    }),
    regionalmap: Object.freeze({
        grid: { type: 0 /* GRIDLESS */, distance: 5, units: "km" },
        tokenVision: false,
        fog: { mode: 0 /* DISABLED */ },
        padding: 0,
    }),
});

/**
 * The canvas profile for a map type.
 *
 * @param {string} type - The note's `type`.
 * @returns {object} The profile from {@link MAP_TYPE_PROFILES}.
 * @throws {Error} When the type is not a map type — the build's fail-fast
 *   contract, so a typo never ships a scene with Foundry's own defaults.
 */
export function mapProfile(type) {
    const profile = MAP_TYPE_PROFILES[String(type)];
    if (!profile) {
        throw new Error(
            `unknown map type "${type}" — expected one of ${[...MAP_TYPES].join(", ")}`,
        );
    }
    return profile;
}

/**
 * Foundry's own id for the level a scene is created with
 * (`Scene.metadata.defaultLevelId`). Adopting it makes every reference to the
 * synthesised level derivable, and matches what Foundry would have produced.
 */
export const DEFAULT_LEVEL_ID = "defaultLevel0000";

/* -------------------------------------------------------------------- */
/*  Derived ids and colours                                             */
/* -------------------------------------------------------------------- */

/**
 * The id of one region within its scene.
 *
 * Derived rather than stored so a cross-reference (`teleportToken`,
 * `toggleBehavior`) can be resolved to a UUID before the target scene has been
 * compiled. An authored `_id` always wins — the converter pins ids on
 * write-back exactly as it does for items and actors.
 *
 * @param {string} sceneId - The owning scene's `_id`.
 * @param {string} key - The region's authored key.
 * @param {string} [pinned] - An authored `_id`, if any.
 * @returns {string} A 16-character Foundry id.
 */
export function regionDocId(sceneId, key, pinned) {
    return pinned || makeId("scene-region", `${sceneId}:${key}`);
}

/**
 * The id of one behaviour within its region.
 *
 * @param {string} regionId - The owning region's `_id`.
 * @param {string} key - The behaviour's authored key.
 * @param {string} [pinned] - An authored `_id`, if any.
 * @returns {string} A 16-character Foundry id.
 */
export function behaviorDocId(regionId, key, pinned) {
    return pinned || makeId("region-behavior", `${regionId}:${key}`);
}

/**
 * A region's highlight colour, derived from its key.
 *
 * Foundry's default is `Color.fromHSV([Math.random(), 0.8, 0.8])` — a different
 * value on every create, which would make each build's output differ from the
 * last for no reason anyone could see. Hashing the key keeps builds
 * reproducible and diffs quiet, in the same hue/saturation family Foundry
 * itself would have chosen, and keeps the value out of the note entirely.
 *
 * @param {string} key - The region's authored key.
 * @returns {string} A CSS hex colour.
 */
export function regionColor(key) {
    const digest = crypto.createHash("sha1").update(`region:${key}`).digest();
    const hue = digest.readUInt32BE(0) / 0x100000000;
    return hsvToHex(hue, 0.8, 0.8);
}

/**
 * HSV → `#rrggbb`, matching Foundry's `Color.fromHSV`.
 *
 * @param {number} h - Hue, 0–1.
 * @param {number} s - Saturation, 0–1.
 * @param {number} v - Value, 0–1.
 * @returns {string} A CSS hex colour.
 */
function hsvToHex(h, s, v) {
    const i = Math.floor(h * 6);
    const f = h * 6 - i;
    const p = v * (1 - s);
    const q = v * (1 - f * s);
    const t = v * (1 - (1 - f) * s);
    const [r, g, b] = [
        [v, t, p],
        [q, v, p],
        [p, v, t],
        [p, q, v],
        [t, p, v],
        [v, p, q],
    ][i % 6];
    const byte = (c) =>
        Math.round(c * 255)
            .toString(16)
            .padStart(2, "0");
    return `#${byte(r)}${byte(g)}${byte(b)}`;
}

/* -------------------------------------------------------------------- */
/*  Unit-mix lints                                                      */
/* -------------------------------------------------------------------- */

/**
 * The map's own measurements, from which both unit lints are derived.
 *
 * @typedef {object} MapGeometry
 * @property {string} label - The authored key, for error messages.
 * @property {number} pxPerGrid - Pixels per grid square.
 * @property {number[]} dimensions - `[width, height]` in pixels.
 */

/**
 * Reject geometry authored in grid squares where pixels belong.
 *
 * A grid-valued wall or region is not rejected by Foundry: it becomes a
 * 12x11-pixel feature in the top-left corner, invisible on the map and
 * impossible to notice in a diff. The test is derived from the map itself
 * rather than a magic number — when every coordinate of one feature is smaller
 * than a single grid square, on a map several squares across, the author
 * counted squares.
 *
 * @param {number[]} coords - The feature's coordinates, in pixels.
 * @param {MapGeometry} geom - The map's measurements.
 * @throws {Error} When the coordinates read as grid units.
 */
export function assertPixelGeometry(coords, geom) {
    const values = coords.filter((c) => Number.isFinite(c)).map(Math.abs);
    if (!values.length) return;
    const gridSpan = Math.max(...geom.dimensions) / geom.pxPerGrid;
    const largest = Math.max(...values);
    if (gridSpan >= 4 && largest > 0 && largest < geom.pxPerGrid) {
        throw new Error(
            `${geom.label}: every coordinate is smaller than one grid square ` +
                `(${geom.pxPerGrid}px) on a map ${Math.round(gridSpan)} squares ` +
                `across — this geometry looks authored in grid units. Wall, door, ` +
                `light, tile, sound and region-shape coordinates are pixels; only ` +
                `\`locations:\` are grid squares.`,
        );
    }
}

/**
 * Reject a map pin authored in pixels where grid squares belong.
 *
 * @param {number[]} at - The pin's `[x, y]`, in grid squares.
 * @param {MapGeometry} geom - The map's measurements.
 * @throws {Error} When the coordinates read as pixels.
 */
export function assertGridLocation(at, geom) {
    const [gx, gy] = [
        geom.dimensions[0] / geom.pxPerGrid,
        geom.dimensions[1] / geom.pxPerGrid,
    ];
    if (at[0] > gx || at[1] > gy) {
        throw new Error(
            `${geom.label}: [${at.join(", ")}] lies outside the map's ` +
                `${Math.round(gx)}x${Math.round(gy)} grid — a location looks ` +
                `authored in pixels. \`locations:\` are grid squares (commonly ` +
                `half-integers, a pin centred in its square).`,
        );
    }
}

/* -------------------------------------------------------------------- */
/*  Walls and doors                                                     */
/* -------------------------------------------------------------------- */

/** Authored sense names → the Wall field each restricts. */
const SENSE_FIELDS = Object.freeze({
    movement: "move",
    sight: "sight",
    light: "light",
    sound: "sound",
});

/** `CONST.EDGE_SENSE_TYPES`. `WALL_SENSE_TYPES` is deprecated in v14. */
const EDGE_SENSE = Object.freeze({ NONE: 0, LIMITED: 10, NORMAL: 20 });

/**
 * Compile a wall's `blocks:` / `limits:` lists into Foundry's four numeric
 * restriction fields.
 *
 * The authored vocabulary is deliberately not Foundry's.
 * `WALL_MOVEMENT_TYPES.NONE` means movement does **not** collide — i.e.
 * passable — so `movement: none` reads as the exact opposite of what it does.
 * `blocks:` says what the wall stops and `limits:` what it merely attenuates;
 * anything unnamed is passable.
 *
 * @param {{blocks?: string[], limits?: string[]}} spec - The authored lists.
 * @param {string} label - The authored key, for error messages.
 * @returns {{move: number, sight: number, light: number, sound: number}} The
 *   Wall restriction fields.
 * @throws {Error} On an unknown sense, a sense in both lists, or a *limited*
 *   movement restriction (movement is binary — it has no LIMITED value).
 */
export function wallRestrictions(spec, label) {
    const out = { move: 0, sight: 0, light: 0, sound: 0 };
    const blocks = toList(spec?.blocks);
    const limits = toList(spec?.limits);

    const check = (name, list) => {
        if (!(name in SENSE_FIELDS)) {
            throw new Error(
                `${label}: unknown restriction "${name}" in ${list} — expected ` +
                    `one of ${Object.keys(SENSE_FIELDS).join(", ")}`,
            );
        }
    };
    for (const name of blocks) check(name, "blocks");
    for (const name of limits) check(name, "limits");

    const both = blocks.filter((n) => limits.includes(n));
    if (both.length) {
        throw new Error(
            `${label}: "${both[0]}" is named in both blocks and limits — a ` +
                `restriction is one or the other`,
        );
    }
    if (limits.includes("movement")) {
        throw new Error(
            `${label}: movement cannot be limited — a wall either blocks ` +
                `movement or does not. Name it in blocks, or leave it out.`,
        );
    }

    for (const name of blocks) out[SENSE_FIELDS[name]] = EDGE_SENSE.NORMAL;
    for (const name of limits) out[SENSE_FIELDS[name]] = EDGE_SENSE.LIMITED;
    return out;
}

/** `CONST.WALL_DOOR_TYPES` by authored name. */
const DOOR_KINDS = Object.freeze({ door: 1, secret: 2 });

/** `CONST.WALL_DOOR_STATES` by authored name. */
const DOOR_STATES = Object.freeze({ closed: 0, open: 1, locked: 2 });

/**
 * Compile one wall segment into a Wall document.
 *
 * @param {number[]} segment - `[x1, y1, x2, y2]` in pixels.
 * @param {object} spec - The authored wall or door entry.
 * @param {MapGeometry} geom - The map's measurements.
 * @param {{sceneId: string, id: string}} ids - The scene id and this wall's id.
 * @returns {object} The Wall document, keyed for the pack.
 */
function buildWall(segment, spec, geom, { sceneId, id }) {
    if (!Array.isArray(segment) || segment.length !== 4) {
        throw new Error(
            `${geom.label}: a wall segment is [x1, y1, x2, y2] in pixels; got ` +
                `${JSON.stringify(segment)}`,
        );
    }
    assertPixelGeometry(segment, geom);
    const doc = {
        _id: id,
        c: segment.map((n) => Math.round(n)),
        ...wallRestrictions(spec, geom.label),
        dir: 0,
        door: 0,
        ds: 0,
        _key: `!scenes.walls!${sceneId}.${id}`,
    };
    if (spec.kind) {
        const door = DOOR_KINDS[spec.kind];
        if (door === undefined) {
            throw new Error(
                `${geom.label}: unknown door kind "${spec.kind}" — expected ` +
                    `${Object.keys(DOOR_KINDS).join(" or ")}`,
            );
        }
        doc.door = door;
        const state = DOOR_STATES[spec.state ?? "closed"];
        if (state === undefined) {
            throw new Error(
                `${geom.label}: unknown door state "${spec.state}" — expected ` +
                    `one of ${Object.keys(DOOR_STATES).join(", ")}`,
            );
        }
        doc.ds = state;
    }
    return doc;
}

/* -------------------------------------------------------------------- */
/*  Region shapes                                                       */
/* -------------------------------------------------------------------- */

/**
 * The shape forms a map note may author. `rect` is the short spelling of
 * `rectangle`, as the design's own examples use.
 */
const SHAPE_FORMS = Object.freeze(
    new Set(["rect", "rectangle", "circle", "ellipse", "polygon"]),
);

/**
 * Compile one authored shape into a Foundry shape record.
 *
 * Four forms only — `rectangle` (`rect` is accepted as its short spelling),
 * `circle`, `ellipse` and `polygon`. The remaining six Foundry shapes are
 * template and token-attached forms with no place in an authored map, and
 * `gridBased` is deliberately not exposed: it re-interprets a shape metrically,
 * and one unit convention per note is the whole point.
 *
 * @param {object} spec - The authored shape entry.
 * @param {MapGeometry} geom - The map's measurements.
 * @returns {object} The Foundry shape record.
 * @throws {Error} On an unknown form, a degenerate polygon, or grid-unit
 *   coordinates.
 */
export function buildShape(spec, geom) {
    if (!spec || typeof spec !== "object") {
        throw new Error(`${geom.label}: a shape must be a mapping`);
    }
    const hole = Boolean(spec.hole);
    const forms = Object.keys(spec).filter((k) => k !== "hole");
    if (forms.length !== 1) {
        throw new Error(
            `${geom.label}: a shape names exactly one of rectangle, circle, ` +
                `ellipse, polygon; got ${forms.length ? forms.join(" + ") : "none"}`,
        );
    }
    const [form] = forms;
    if (!SHAPE_FORMS.has(form)) {
        throw new Error(
            `${geom.label}: unsupported shape "${form}" — a map note may use ` +
                `rectangle, circle, ellipse or polygon`,
        );
    }
    const raw = spec[form];
    if (!Array.isArray(raw) || raw.some((n) => !Number.isFinite(n))) {
        throw new Error(
            `${geom.label}: ${form} takes a flat list of numbers in pixels`,
        );
    }
    assertPixelGeometry(raw, geom);

    switch (form) {
        case "rect":
        case "rectangle":
            expectLength(
                raw,
                4,
                `${geom.label}: rectangle is [x, y, width, height]`,
            );
            return {
                type: "rectangle",
                x: raw[0],
                y: raw[1],
                width: raw[2],
                height: raw[3],
                hole,
            };
        case "circle":
            expectLength(raw, 3, `${geom.label}: circle is [x, y, radius]`);
            return {
                type: "circle",
                x: raw[0],
                y: raw[1],
                radius: raw[2],
                hole,
            };
        case "ellipse":
            if (raw.length !== 4 && raw.length !== 5) {
                throw new Error(
                    `${geom.label}: ellipse is [x, y, radiusX, radiusY] with an ` +
                        `optional rotation`,
                );
            }
            return {
                type: "ellipse",
                x: raw[0],
                y: raw[1],
                radiusX: raw[2],
                radiusY: raw[3],
                rotation: raw[4] ?? 0,
                hole,
            };
        case "polygon":
            if (raw.length % 2 !== 0) {
                throw new Error(
                    `${geom.label}: a polygon takes x/y pairs, so an even count; ` +
                        `got ${raw.length}`,
                );
            }
            // The schema's floor of 4 numbers admits a two-point "polygon",
            // which is a line segment and encloses nothing.
            if (raw.length < 6) {
                throw new Error(
                    `${geom.label}: a polygon needs at least 3 points; got ` +
                        `${raw.length / 2}`,
                );
            }
            return { type: "polygon", points: [...raw], hole };
        default:
            throw new Error(
                `${geom.label}: unsupported shape "${form}" — a map note may use ` +
                    `rectangle, circle, ellipse or polygon`,
            );
    }
}

/* -------------------------------------------------------------------- */
/*  Region behaviours                                                   */
/* -------------------------------------------------------------------- */

/**
 * The events `toggleBehavior` itself accepts — Foundry's own list, which is
 * wider than SoHL's curated set.
 */
const TOGGLE_BEHAVIOR_EVENTS = Object.freeze([
    "tokenEnter",
    "tokenExit",
    "tokenMoveIn",
    "tokenMoveOut",
    "tokenTurnStart",
    "tokenTurnEnd",
    "tokenRoundStart",
    "tokenRoundEnd",
]);

/** `AdjustDarknessLevelRegionBehaviorType.MODES`, authored by name. */
const DARKNESS_MODES = Object.freeze({ override: 0, brighten: 1, darken: 2 });

/** The events `displayScrollingText` accepts. */
const SCROLLING_TEXT_EVENTS = Object.freeze([
    "tokenAnimateIn",
    "tokenAnimateOut",
    "tokenTurnStart",
    "tokenTurnEnd",
    "tokenRoundStart",
    "tokenRoundEnd",
]);

/**
 * The region behaviours a map note may carry, and the fields each accepts.
 *
 * An allow-list rather than a pass-through: an unlisted field would be dropped
 * by Foundry without a word, and an unlisted *type* fails Foundry's own create
 * with an unrelated message (`Cannot read properties of undefined (reading
 * 'regions')`), so both are checked here where the note and the key can be
 * named.
 *
 * @type {Readonly<Record<string, {fields: string[], events?: readonly string[]}>>}
 */
const BEHAVIOR_SPECS = Object.freeze({
    // The SoHL bridge (#593).
    trigger: { fields: ["events", "action"], events: CURATED_REGION_EVENTS },
    adjustDarknessLevel: { fields: ["mode", "modifier"] },
    applyActiveEffect: { fields: ["effects"] },
    changeLevel: { fields: ["movementActions"] },
    defineSurface: {
        fields: [
            "placement",
            "light",
            "move",
            "sight",
            "sound",
            "occlusion",
            "exposure",
            "culling",
        ],
    },
    displayScrollingText: {
        fields: ["events", "text", "color", "visibility", "once"],
        events: SCROLLING_TEXT_EVENTS,
    },
    modifyMovementCost: { fields: ["difficulties"] },
    pauseGame: { fields: ["once"] },
    suppressWeather: { fields: [] },
    teleportToken: {
        fields: ["to", "placement", "snap", "choice", "revealed"],
    },
    toggleBehavior: {
        fields: ["events", "enable", "disable"],
        events: TOGGLE_BEHAVIOR_EVENTS,
    },
});

/**
 * The behaviour types a map note may carry (issue #1525, v1).
 *
 * @type {ReadonlySet<string>}
 */
export const REGION_BEHAVIOR_TYPES = Object.freeze(
    new Set(Object.keys(BEHAVIOR_SPECS)),
);

/**
 * Behaviour types a map note may **never** carry, and why.
 *
 * `executeScript` is banned outright: its `source` is a `JavaScriptField`, so a
 * note carrying one would compile data into code — the system's top security
 * constraint (non-negotiable rule 10). There is no escape hatch and no
 * configuration that re-enables it. `executeMacro` is merely deferred: its
 * target Macro has to ship in the same Adventure to resolve, and
 * Adventure-bundled macros are not built yet.
 *
 * @type {ReadonlyMap<string, string>}
 */
export const BANNED_REGION_BEHAVIOR_TYPES = Object.freeze(
    new Map([
        [
            "executeScript",
            "its `source` is a JavaScriptField, so a note carrying one would " +
                "compile data into code (non-negotiable rule 10). It is not " +
                "representable in a map note and has no escape hatch.",
        ],
        [
            "executeMacro",
            "its target Macro must ship in the same Adventure to resolve, and " +
                "Adventure-bundled macros are not built yet (deferred from #1525).",
        ],
    ]),
);

/**
 * Compile one authored behaviour entry into a RegionBehavior document.
 *
 * @param {string} key - The behaviour's authored key.
 * @param {object} spec - The authored entry.
 * @param {object} ctx - The compile context (resolvers, warnings, ids).
 * @returns {object} The RegionBehavior document, keyed for the pack.
 */
function buildBehavior(key, spec, ctx) {
    const label = `${ctx.regionLabel}.behaviors.${key}`;
    if (!spec || typeof spec !== "object") {
        throw new Error(`${label}: a behaviour must be a mapping`);
    }
    const reserved = new Set(["_id", "name", "disabled"]);
    const types = Object.keys(spec).filter((k) => !reserved.has(k));
    if (types.length !== 1) {
        throw new Error(
            `${label}: a behaviour names exactly one behaviour type; got ` +
                `${types.length ? types.join(" + ") : "none"}`,
        );
    }
    const [type] = types;

    const banned = BANNED_REGION_BEHAVIOR_TYPES.get(type);
    if (banned)
        throw new Error(`${label}: "${type}" is not permitted — ${banned}`);
    const behaviorSpec = BEHAVIOR_SPECS[type];
    if (!behaviorSpec) {
        throw new Error(
            `${label}: unknown behaviour type "${type}" — a map note may carry ` +
                `${[...REGION_BEHAVIOR_TYPES].sort().join(", ")}`,
        );
    }

    const authored = spec[type] ?? {};
    if (typeof authored !== "object" || Array.isArray(authored)) {
        throw new Error(`${label}: ${type} takes a mapping of its fields`);
    }
    for (const field of Object.keys(authored)) {
        if (!behaviorSpec.fields.includes(field)) {
            throw new Error(
                `${label}: ${type} has no field "${field}" — it accepts ` +
                    `${behaviorSpec.fields.join(", ") || "no fields"}`,
            );
        }
    }

    const system = compileBehaviorSystem(
        type,
        authored,
        behaviorSpec,
        label,
        ctx,
    );
    const id = behaviorDocId(ctx.regionId, key, spec._id);
    const doc = {
        _id: id,
        name: spec.name ?? "",
        type,
        system,
        _key: `!scenes.regions.behaviors!${ctx.sceneId}.${ctx.regionId}.${id}`,
    };
    if (spec.disabled) doc.disabled = true;
    return doc;
}

/**
 * Translate one behaviour's authored fields into its `system` data.
 *
 * @param {string} type - The behaviour type.
 * @param {object} authored - The authored fields.
 * @param {object} behaviorSpec - Its entry in {@link BEHAVIOR_SPECS}.
 * @param {string} label - The authored path, for error messages.
 * @param {object} ctx - The compile context.
 * @returns {object} The behaviour's `system` data.
 */
function compileBehaviorSystem(type, authored, behaviorSpec, label, ctx) {
    if (behaviorSpec.events) {
        assertEvents(authored.events, behaviorSpec.events, label, type);
    }
    switch (type) {
        case "trigger": {
            if (authored.action && !ctx.knownActions?.has(authored.action)) {
                ctx.warn(
                    `${label}: action "${authored.action}" matches no known SoHL ` +
                        `action — the region will forward the event but offer nothing`,
                );
            }
            return {
                events: [...authored.events],
                actionName: authored.action ?? null,
            };
        }
        case "teleportToken": {
            const { to, ...rest } = authored;
            return {
                ...rest,
                destinations: toList(to).map((addr) =>
                    ctx.resolveRegionRef(addr, label),
                ),
            };
        }
        case "toggleBehavior": {
            const { enable, disable, ...rest } = authored;
            const out = { ...rest, events: [...authored.events] };
            if (enable) {
                out.enable = toList(enable).map((a) =>
                    ctx.resolveBehaviorRef(a, label),
                );
            }
            if (disable) {
                out.disable = toList(disable).map((a) =>
                    ctx.resolveBehaviorRef(a, label),
                );
            }
            return out;
        }
        case "adjustDarknessLevel": {
            // Authored by name: `AdjustDarknessLevelRegionBehaviorType.MODES`
            // is a numeric enum nobody should have to remember.
            const mode = authored.mode ?? "override";
            const value = DARKNESS_MODES[mode];
            if (value === undefined) {
                throw new Error(
                    `${label}: unknown darkness mode "${mode}" — expected one of ` +
                        `${Object.keys(DARKNESS_MODES).join(", ")}`,
                );
            }
            return { mode: value, modifier: authored.modifier ?? 0 };
        }
        case "applyActiveEffect": {
            return {
                effects: toList(authored.effects).map((a) =>
                    ctx.resolveEffectRef(a, label),
                ),
            };
        }
        default:
            return { ...authored };
    }
}

/**
 * Reject a region event Foundry would store verbatim and never fire.
 *
 * The excluded names are listed in the error because reaching for one — most
 * plausibly `tokenMoveWithin` — is the mistake this lint exists for, and
 * Foundry gives no sign of it: a bogus name never matches a dispatched event,
 * and an excluded one is dispatched and then dropped by the bridge. No error,
 * no log, no automation.
 *
 * @param {string[]} events - The authored events.
 * @param {readonly string[]} allowed - The events this behaviour accepts.
 * @param {string} label - The authored path, for error messages.
 * @param {string} type - The behaviour type.
 * @throws {Error} When an event is not accepted.
 */
function assertEvents(events, allowed, label, type) {
    const list = toList(events);
    if (!list.length) {
        throw new Error(`${label}: ${type} needs at least one event`);
    }
    for (const event of list) {
        if (allowed.includes(event)) continue;
        const excluded = EXCLUDED_REGION_EVENTS.includes(event);
        throw new Error(
            `${label}: "${event}" is ${excluded ? "deliberately excluded" : "not a region event"} ` +
                `for ${type}. Accepted: ${allowed.join(", ")}. Excluded (stored ` +
                `verbatim by Foundry and never acted on): ` +
                `${EXCLUDED_REGION_EVENTS.join(", ")}.`,
        );
    }
}

/* -------------------------------------------------------------------- */
/*  Regions                                                             */
/* -------------------------------------------------------------------- */

/** `CONST.REGION_VISIBILITY`, authored by name because the order is arbitrary. */
const REGION_VISIBILITY = Object.freeze({
    layer: 0,
    gamemaster: 1,
    always: 2,
    observer: 3,
    layerUnlocked: 4,
});

/** `CONST.EDGE_RESTRICTION_TYPES`. */
const RESTRICTION_TYPES = Object.freeze([
    "light",
    "darkness",
    "sight",
    "sound",
    "move",
]);

/**
 * Compile one authored region into a Region document with its behaviours.
 *
 * @param {string} key - The region's authored key.
 * @param {object} spec - The authored entry.
 * @param {MapGeometry} geom - The map's measurements.
 * @param {object} ctx - The compile context.
 * @returns {object} The Region document, keyed for the pack.
 */
function buildRegion(key, spec, geom, ctx) {
    const label = `regions.${key}`;
    const shapeGeom = { ...geom, label };
    const shapes = toList(spec.shapes).map((s) => buildShape(s, shapeGeom));
    if (!shapes.length) {
        throw new Error(
            `${label}: a region needs at least one shape — Foundry accepts one ` +
                `with none, and it simply never triggers`,
        );
    }

    const id = regionDocId(ctx.sceneId, key, spec._id);
    const visibilityName = spec.visibility ?? "layerUnlocked";
    const visibility = REGION_VISIBILITY[visibilityName];
    if (visibility === undefined) {
        throw new Error(
            `${label}: unknown visibility "${visibilityName}" — expected one of ` +
                `${Object.keys(REGION_VISIBILITY).join(", ")}`,
        );
    }

    const [bottom = null, top = null] = toList(spec.elevation);
    const doc = {
        _id: id,
        name: spec.name ?? key,
        color: regionColor(key),
        shapes,
        elevation: { bottom: bottom ?? null, top: top ?? null },
        visibility,
        behaviors: [],
        _key: `!scenes.regions!${ctx.sceneId}.${id}`,
    };

    if (spec.restrict != null) {
        if (!RESTRICTION_TYPES.includes(spec.restrict)) {
            throw new Error(
                `${label}: unknown restrict "${spec.restrict}" — expected one of ` +
                    `${RESTRICTION_TYPES.join(", ")}`,
            );
        }
        doc.restriction = { enabled: true, type: spec.restrict, priority: 0 };
        // A restricted region must belong to exactly one level, or the shape
        // constraint silently never computes. `levels` is otherwise never
        // emitted: the empty set means "all levels", which is right for the
        // one-scene-per-floor rule.
        doc.levels = [DEFAULT_LEVEL_ID];
    }

    const behaviorCtx = { ...ctx, regionId: id, regionLabel: label };
    for (const [bKey, bSpec] of Object.entries(spec.behaviors ?? {})) {
        doc.behaviors.push(buildBehavior(bKey, bSpec, behaviorCtx));
    }
    return doc;
}

/* -------------------------------------------------------------------- */
/*  The scene                                                           */
/* -------------------------------------------------------------------- */

/**
 * Compile a map note into a Scene document, embedded documents and all.
 *
 * Every embedded document carries its own `_key`. This is not decoration: the
 * compendium CLI writes each one straight to its sublevel by that key, and a
 * missing one fails the compile with `Key cannot be null or undefined`.
 *
 * @param {object} fm - The note's frontmatter.
 * @param {object} ctx - The compile context:
 *   `packageId`, `journalEntryId`, `journalPack` (the pack the note's derived
 *   JournalEntry landed in), `pageIds` (heading key → page id),
 *   `resolveRegionRef` / `resolveBehaviorRef` / `resolveEffectRef` (address →
 *   UUID), `knownActions`, `warnings`, and optionally `folder` and `stats`.
 * @returns {object} The Scene document, keyed for the pack.
 * @throws {Error} On any authoring mistake Foundry would accept silently.
 */
export function buildScene(fm, ctx) {
    const sohl = fm.sohl ?? {};
    const sceneId = fm.id;
    if (!sceneId) throw new Error("a map note needs an `id`");
    const profile = mapProfile(fm.type);

    const dimensions = sohl.dimensions;
    if (
        !Array.isArray(dimensions) ||
        dimensions.length !== 2 ||
        !dimensions.every((n) => Number.isInteger(n) && n > 0)
    ) {
        throw new Error(
            "`dimensions` is [width, height] in whole pixels — the map's own size",
        );
    }
    const pxPerGrid = sohl.pxPerGrid;
    if (!Number.isInteger(pxPerGrid) || pxPerGrid <= 0) {
        throw new Error(
            "`pxPerGrid` is the whole number of pixels per grid square, and must " +
                "match the art",
        );
    }
    if (!sohl.image) throw new Error("a map note needs an `image`");

    const warn = (message) => {
        if (ctx.warnings) ctx.warnings.push(message);
    };
    const inner = { ...ctx, sceneId, warn };
    const geom = { label: "", pxPerGrid, dimensions };

    const scene = {
        name: ctx.name ?? fm.name?.full ?? "Unnamed Map",
        _id: sceneId,
        navigation: true,
        navOrder: 0,
        width: dimensions[0],
        height: dimensions[1],
        padding: profile.padding,
        grid: {
            type: profile.grid.type,
            size: pxPerGrid,
            distance: profile.grid.distance,
            units: profile.grid.units,
        },
        tokenVision: profile.tokenVision,
        fog: { mode: profile.fog.mode },
        initialLevel: DEFAULT_LEVEL_ID,
        levels: [buildLevel(sohl, sceneId)],
        drawings: [],
        tokens: [],
        lights: buildLights(sohl, geom, inner),
        notes: buildLocations(sohl, geom, inner),
        sounds: buildSounds(sohl, geom, inner),
        tiles: buildTiles(sohl, geom, inner),
        walls: buildWalls(sohl, geom, inner),
        regions: buildRegions(sohl, geom, inner),
        folder: ctx.folder ?? null,
        sort: 0,
        ownership: { default: 0 },
        flags: {},
        _key: `!scenes!${sceneId}`,
    };
    if (sohl.navName) scene.navName = sohl.navName;
    if (ctx.stats) scene._stats = ctx.stats;

    if (ctx.journalEntryId) {
        if (!ctx.packageId) {
            throw new Error(
                "a map note with a journal needs `packageId` in its compile context",
            );
        }
        // `Scene.journal` is a plain ForeignDocumentField, which
        // `ForeignDocumentField#initialize` unconditionally nulls inside a
        // compendium. The source id survives (and resolves after an Adventure
        // import, which reads source data and keeps ids), but a bare `scenes`
        // pack needs the flag to find the entry at all.
        scene.journal = ctx.journalEntryId;
        scene.flags[ctx.packageId] = {
            docUuid: compendiumUuid(
                ctx.packageId,
                "doc",
                ctx.journalEntryId,
                ctx.journalPack,
            ),
        };
    }
    return scene;
}

/**
 * Synthesise the scene's single embedded Level from `image:` / `overlay:`.
 *
 * Authors never write `levels:`. A scene must ship at least one Level — the
 * client-side `_preCreate` net that would create one does not run for offline
 * pack compilation, and the server-side migration shim is version-gated on
 * `_stats.coreVersion`, so a pack stamped 14.x+ skips it and ships a scene with
 * no Level and no map.
 *
 * @param {object} sohl - The note's `sohl:` block.
 * @param {string} sceneId - The owning scene's `_id`.
 * @returns {object} The Level document, keyed for the pack.
 */
export function buildLevel(sohl, sceneId) {
    const level = {
        _id: DEFAULT_LEVEL_ID,
        name: sohl.levelName ?? "Ground",
        elevation: { bottom: 0, top: 20 },
        background: {
            color: sohl.backgroundColor ?? "#999999",
            src: sohl.image,
        },
        foreground: { src: sohl.overlay ?? null },
        sort: 0,
        _key: `!scenes.levels!${sceneId}.${DEFAULT_LEVEL_ID}`,
    };
    return level;
}

/**
 * Compile the `walls:` and `doors:` blocks into Wall documents.
 *
 * Walls are keyed by **feature** rather than by restriction signature, so a
 * diff reads "the hayloft walls changed" instead of "line 143 changed", and a
 * human can find the one wall they meant to move.
 *
 * @param {object} sohl - The note's `sohl:` block.
 * @param {MapGeometry} geom - The map's measurements.
 * @param {object} ctx - The compile context.
 * @returns {object[]} The Wall documents.
 */
export function buildWalls(sohl, geom, ctx) {
    const out = [];
    for (const [key, spec] of Object.entries(sohl.walls ?? {})) {
        const label = `walls.${key}`;
        const segments = toList(spec.segments);
        if (!segments.length) {
            throw new Error(
                `${label}: a wall group needs at least one segment`,
            );
        }
        segments.forEach((segment, i) => {
            const id = makeId("scene-wall", `${ctx.sceneId}:${key}:${i}`);
            out.push(
                buildWall(
                    segment,
                    spec,
                    { ...geom, label },
                    {
                        sceneId: ctx.sceneId,
                        id,
                    },
                ),
            );
        });
    }
    for (const [key, spec] of Object.entries(sohl.doors ?? {})) {
        const label = `doors.${key}`;
        const id = spec._id || makeId("scene-door", `${ctx.sceneId}:${key}`);
        out.push(
            buildWall(
                spec.segment,
                { kind: "door", ...spec },
                { ...geom, label },
                {
                    sceneId: ctx.sceneId,
                    id,
                },
            ),
        );
    }
    return out;
}

/**
 * Compile the `lights:` block into AmbientLight documents.
 *
 * `dim` and `bright` are radii in the scene's **distance units** (Foundry's own
 * meaning), not pixels; only `position:` is pixels.
 *
 * @param {object} sohl - The note's `sohl:` block.
 * @param {MapGeometry} geom - The map's measurements.
 * @param {object} ctx - The compile context.
 * @returns {object[]} The AmbientLight documents.
 */
export function buildLights(sohl, geom, ctx) {
    return Object.entries(sohl.lights ?? {}).map(([key, spec]) => {
        const label = `lights.${key}`;
        const [x, y] = requirePosition(spec.position, { ...geom, label });
        const id = spec._id || makeId("scene-light", `${ctx.sceneId}:${key}`);
        const config = {
            dim: spec.dim ?? 0,
            bright: spec.bright ?? 0,
            angle: spec.angle ?? 360,
        };
        if (spec.color) config.color = spec.color;
        if (spec.animation) config.animation = spec.animation;
        return {
            _id: id,
            x,
            y,
            rotation: spec.rotation ?? 0,
            walls: spec.walls ?? true,
            vision: spec.vision ?? false,
            config,
            _key: `!scenes.lights!${ctx.sceneId}.${id}`,
        };
    });
}

/**
 * Compile the `tiles:` block into Tile documents.
 *
 * @param {object} sohl - The note's `sohl:` block.
 * @param {MapGeometry} geom - The map's measurements.
 * @param {object} ctx - The compile context.
 * @returns {object[]} The Tile documents.
 */
export function buildTiles(sohl, geom, ctx) {
    return Object.entries(sohl.tiles ?? {}).map(([key, spec]) => {
        const label = `tiles.${key}`;
        const [x, y] = requirePosition(spec.position, { ...geom, label });
        const size = toList(spec.size);
        expectLength(size, 2, `${label}: size is [width, height] in pixels`);
        assertPixelGeometry(size, { ...geom, label });
        if (!spec.image) throw new Error(`${label}: a tile needs an image`);
        const id = spec._id || makeId("scene-tile", `${ctx.sceneId}:${key}`);
        return {
            _id: id,
            x,
            y,
            width: size[0],
            height: size[1],
            elevation: spec.elevation ?? 0,
            rotation: spec.rotation ?? 0,
            alpha: spec.alpha ?? 1,
            sort: 0,
            texture: { src: spec.image },
            _key: `!scenes.tiles!${ctx.sceneId}.${id}`,
        };
    });
}

/**
 * Compile the `sounds:` block into AmbientSound documents.
 *
 * Positional audio is the one audio mechanism that packages cleanly: `path` is
 * a plain `FilePathField` with no document reference behind it.
 *
 * @param {object} sohl - The note's `sohl:` block.
 * @param {MapGeometry} geom - The map's measurements.
 * @param {object} ctx - The compile context.
 * @returns {object[]} The AmbientSound documents.
 */
export function buildSounds(sohl, geom, ctx) {
    return Object.entries(sohl.sounds ?? {}).map(([key, spec]) => {
        const label = `sounds.${key}`;
        const [x, y] = requirePosition(spec.position, { ...geom, label });
        if (!spec.path)
            throw new Error(`${label}: an ambient sound needs a path`);
        const id = spec._id || makeId("scene-sound", `${ctx.sceneId}:${key}`);
        return {
            _id: id,
            name: spec.name ?? key,
            x,
            y,
            radius: spec.radius ?? 0,
            path: spec.path,
            repeat: spec.repeat ?? true,
            volume: spec.volume ?? 0.5,
            walls: spec.walls ?? true,
            easing: spec.easing ?? true,
            _key: `!scenes.sounds!${ctx.sceneId}.${id}`,
        };
    });
}

/**
 * Compile the `locations:` block into Note documents — the map pins.
 *
 * A location's key names a heading in the note's body, and the pin points at
 * the journal page that heading compiled into. `Note.entryId` / `pageId` are
 * `{idOnly: true}` fields, which return before the compendium guard, so pin
 * targets survive packing intact — but `Note#entry` resolves by bare id against
 * the **world** collection, which is why a map with pins ships inside an
 * Adventure (`keepId: true`).
 *
 * @param {object} sohl - The note's `sohl:` block.
 * @param {MapGeometry} geom - The map's measurements.
 * @param {object} ctx - The compile context.
 * @returns {object[]} The Note documents.
 */
export function buildLocations(sohl, geom, ctx) {
    const locations = Object.entries(sohl.locations ?? {});
    if (!locations.length) return [];
    if (!ctx.journalEntryId) {
        throw new Error(
            "`locations:` need a journal to point at — give the note a body with " +
                "a heading per location",
        );
    }
    return locations.map(([key, spec]) => {
        const label = `locations.${key}`;
        const at = toList(spec.at);
        expectLength(at, 2, `${label}: at is [x, y] in grid squares`);
        if (!at.every((n) => Number.isFinite(n))) {
            throw new Error(`${label}: at is [x, y] in grid squares`);
        }
        assertGridLocation(at, { ...geom, label });
        const pageId = ctx.pageIds.get(key);
        if (!pageId) {
            throw new Error(
                `${label}: no body heading matches "${key}" — a location pin points ` +
                    `at the page its heading compiled into. Headings available: ` +
                    `${[...ctx.pageIds.keys()].join(", ") || "(none)"}`,
            );
        }
        const id = spec._id || makeId("scene-note", `${ctx.sceneId}:${key}`);
        return {
            _id: id,
            entryId: ctx.journalEntryId,
            pageId,
            x: Math.round(at[0] * geom.pxPerGrid),
            y: Math.round(at[1] * geom.pxPerGrid),
            text: spec.label ?? "",
            iconSize: spec.iconSize ?? 40,
            _key: `!scenes.notes!${ctx.sceneId}.${id}`,
        };
    });
}

/**
 * Compile the `regions:` block into Region documents with their behaviours.
 *
 * @param {object} sohl - The note's `sohl:` block.
 * @param {MapGeometry} geom - The map's measurements.
 * @param {object} ctx - The compile context.
 * @returns {object[]} The Region documents.
 */
export function buildRegions(sohl, geom, ctx) {
    return Object.entries(sohl.regions ?? {}).map(([key, spec]) =>
        buildRegion(key, spec, geom, ctx),
    );
}

/* -------------------------------------------------------------------- */
/*  Small shared helpers                                                */
/* -------------------------------------------------------------------- */

/**
 * A value as a list: absent → empty, scalar → single, list → itself.
 *
 * @param {*} value - The authored value.
 * @returns {Array} The list form.
 */
function toList(value) {
    if (value == null) return [];
    return Array.isArray(value) ? value : [value];
}

/**
 * Assert a list's length, with the authored form named in the message.
 *
 * @param {Array} list - The list.
 * @param {number} length - The expected length.
 * @param {string} message - The error to throw.
 */
function expectLength(list, length, message) {
    if (list.length !== length) throw new Error(message);
}

/**
 * Read a `position:` (pixels) and lint its units.
 *
 * @param {*} position - The authored `[x, y]`.
 * @param {MapGeometry} geom - The map's measurements.
 * @returns {number[]} The rounded pixel coordinates.
 */
function requirePosition(position, geom) {
    const at = toList(position);
    expectLength(at, 2, `${geom.label}: position is [x, y] in pixels`);
    if (!at.every((n) => Number.isFinite(n))) {
        throw new Error(`${geom.label}: position is [x, y] in pixels`);
    }
    assertPixelGeometry(at, geom);
    return at.map((n) => Math.round(n));
}
