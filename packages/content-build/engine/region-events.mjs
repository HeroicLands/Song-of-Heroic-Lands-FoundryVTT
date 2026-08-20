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
 * The curated Foundry region-event vocabulary, as plain data.
 *
 * Deliberately **plain ESM** — no TypeScript, no `@src` aliases, no Foundry —
 * for the same reason `../sohl/default-item-art.mjs` is: the map-note pack
 * compiler runs under bare `node`, outside the bundler that resolves `@src` and
 * strips types, and it must reject an authored region event that the runtime
 * would silently drop. One list here is what keeps the build-time lint and the
 * runtime bridge from drifting apart.
 *
 * It sits in this package rather than in the system's `src/` tree because the
 * map-note compiler that reads it is installed as a dependency (#1501), and a
 * relative path out of the package would resolve to garbage from
 * `node_modules`. The runtime reaches it back through the package's
 * `./engine/region-events` entry point (#1510). It is engine-side, not
 * SoHL-side, because any content module that authors a scene region — an
 * adventure module included — needs this vocabulary.
 *
 * The prose explaining *why* each event is curated or excluded lives with the
 * typed re-exports in `src/entity/event/region-triggers.ts`, which is the
 * documented surface.
 */

/**
 * The curated Foundry region-event → SoHL trigger-name map. The keys are the
 * `CONST.REGION_EVENTS` string values SoHL forwards.
 *
 * @type {Readonly<Record<string, string>>}
 */
export const REGION_EVENT_TO_TRIGGER = Object.freeze({
    tokenEnter: "regionTokenEnter",
    tokenExit: "regionTokenExit",
    tokenTurnStart: "regionTokenTurnStart",
    tokenTurnEnd: "regionTokenTurnEnd",
    tokenRoundStart: "regionTokenRoundStart",
    tokenRoundEnd: "regionTokenRoundEnd",
});

/**
 * The Foundry region-event names SoHL forwards (the keys of the map).
 *
 * @type {readonly string[]}
 */
export const CURATED_REGION_EVENTS = Object.freeze(
    Object.keys(REGION_EVENT_TO_TRIGGER),
);

/**
 * Region events SoHL deliberately does **not** forward: the continuous
 * (`tokenMove*`), view-dependent (`tokenAnimate*`) and lifecycle
 * (`behavior*`, `regionBoundary`) streams.
 *
 * @type {readonly string[]}
 */
export const EXCLUDED_REGION_EVENTS = Object.freeze([
    "tokenMoveIn",
    "tokenMoveOut",
    "tokenMoveWithin",
    "tokenAnimateIn",
    "tokenAnimateOut",
    "regionBoundary",
    "behaviorActivated",
    "behaviorDeactivated",
    "behaviorViewed",
    "behaviorUnviewed",
]);
