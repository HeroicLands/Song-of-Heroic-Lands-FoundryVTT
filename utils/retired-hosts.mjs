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
 * The hostnames this project has withdrawn, and what replaced each one.
 *
 * A link to a retired host is worse than a dated one: the DNS record is gone,
 * so it fails at resolution with no redirect to follow. Nothing in the build
 * notices — an absolute URL is opaque to the wikilink checks, compiles cleanly
 * into the Foundry journals, and publishes to the knowledgebase looking exactly
 * like a working link. That is how 71 of them shipped (#1485).
 *
 * This module is the single list, so a guard and its test share one definition
 * of "retired" rather than two copies that can disagree.
 */

/**
 * Retired hostname → the address that replaced it.
 *
 * Both were withdrawn when the site consolidated everything under one `/sohl/`
 * deploy (#1455, #1456): the API documentation is published once, unversioned,
 * at `/sohl/api/`, and the knowledgebase at `/sohl/kb/`.
 *
 * @type {Map<string, string>}
 */
export const RETIRED_HOSTS = new Map([
    ["api.heroiclands.org", "https://www.heroiclands.org/sohl/api/"],
    ["kb.heroiclands.org", "https://www.heroiclands.org/sohl/kb/"],
]);

/**
 * The version segments the API site used to publish under.
 *
 * It now publishes **one unversioned tree** at its root, so a link keeping one
 * of these was already 404ing before the host went away — repointing the host
 * alone would move a dead link rather than fix it.
 */
const API_VERSION_SEGMENTS = /^(?:main|latest|v?\d+(?:\.\d+)*)$/;

/**
 * Matches a retired host wherever it appears — in a full URL, or bare in prose
 * or a config value, since the rot shows up both ways.
 *
 * The leading boundary is what keeps `myapi.heroiclands.org` (a different host)
 * from being reported: a hostname ends at a `.` or the start of the authority,
 * never mid-label.
 */
const hostPattern = () =>
    new RegExp(
        String.raw`(?:https?://)?(?<![\w.-])(` +
            [...RETIRED_HOSTS.keys()]
                .map((h) => h.replace(/\./g, String.raw`\.`))
                .join("|") +
            String.raw`)(?:[^\s)\]"'<>|]*)`,
        "g",
    );

/**
 * Every occurrence of a retired hostname in `text`.
 *
 * @param {string} text - File contents, or any block of markdown or prose.
 * @returns {Array<{url: string, host: string, line: number, hint: string | undefined}>}
 *   One entry per occurrence, in reading order. `url` is the whole matched
 *   address (including any `#fragment`), `line` is 1-based, and `hint` is the
 *   rewritten address when one can be derived — see {@link rewriteHint}.
 */
export function findRetiredLinks(text) {
    const out = [];
    const lines = String(text).split("\n");
    for (let i = 0; i < lines.length; i++) {
        for (const m of lines[i].matchAll(hostPattern())) {
            out.push({
                url: m[0],
                host: m[1],
                line: i + 1,
                hint: rewriteHint(m[0]),
            });
        }
    }
    return out;
}

/**
 * The working address a retired URL should become, or `undefined` if the host
 * is not one this project retired.
 *
 * Two drifts landed on the API links and the second hid the first, so both are
 * undone here: the version segment the API site stopped publishing is dropped,
 * and the `.html` suffix with it — TypeDoc's extensionless page is a direct 200
 * where `.html` costs a 308 hop, and the `#fragment` survives either way.
 *
 * @param {string} url - An absolute or scheme-less URL.
 * @returns {string | undefined} The replacement address.
 */
export function rewriteHint(url) {
    const host = [...RETIRED_HOSTS.keys()].find((h) =>
        new RegExp(
            String.raw`(?<![\w.-])${h.replace(/\./g, String.raw`\.`)}`,
        ).test(String(url)),
    );
    if (!host) return undefined;

    const base = RETIRED_HOSTS.get(host);
    // Everything the old host carried after its authority — the path, and any
    // query or fragment, which come across untouched.
    let rest = String(url).replace(
        new RegExp(String.raw`^.*?${host.replace(/\./g, String.raw`\.`)}/?`),
        "",
    );
    if (host === "api.heroiclands.org") {
        const [first, ...tail] = rest.split("/");
        if (tail.length && API_VERSION_SEGMENTS.test(first)) {
            rest = tail.join("/");
        }
        rest = rest.replace(/\.html(?=$|[#?])/, "");
    }
    return base + rest;
}
