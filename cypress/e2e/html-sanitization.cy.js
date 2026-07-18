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
 * HTML sanitization (#161).
 *
 * SoHL's `FoundryHelpers.toSanitizedHTML` — the single sanitizer for all
 * chat-card and dialog content — delegates to Foundry's built-in allowlist
 * sanitizer `foundry.utils.cleanHTML` (which the shim reaches through a cast,
 * since it is absent from `fvtt-types`). That function only exists in the real
 * client, so this behavior is verified here rather than in the Node unit suite.
 *
 * This spec exercises `foundry.utils.cleanHTML` in the live browser to prove
 * (a) it is present in the runtime our shim assumes, (b) it neutralizes the
 * denylist-bypass vectors from #161, and (c) it preserves the benign chat-card
 * markup our dispatch relies on — most importantly the `data-*` attributes.
 */
describe("HTML sanitization (#161)", () => {
    before(() => cy.login());

    // Each vector is neutralized by Foundry's allowlist: a disallowed tag is
    // dropped, an `on*` handler is not an allowed attribute, and a URL-bearing
    // attribute whose scheme is not in ALLOWED_URL_SCHEMES is removed. `data:`
    // and inline `style` are deliberately NOT asserted here — Foundry permits
    // them system-wide, and we match that stance (see the shim's JSDoc).
    const VECTORS = [
        {
            name: "script tag",
            input: `<script>alert(1)</script>`,
            absent: ["<script"],
        },
        {
            name: "on* event handler",
            input: `<img src="x" onerror="alert(1)">`,
            absent: ["onerror"],
        },
        {
            name: "javascript: URL",
            input: `<a href="javascript:alert(1)">x</a>`,
            absent: ["javascript:"],
        },
        {
            name: "whitespace-obfuscated javascript: URL",
            input: `<a href="  javascript:alert(1)">x</a>`,
            absent: ["javascript:"],
        },
        {
            name: "entity-obfuscated javascript: URL",
            input: `<a href="java&#9;script:alert(1)">x</a>`,
            absent: ["javascript:"],
        },
        {
            name: "<base> tag",
            input: `<base href="//evil.example/">`,
            absent: ["<base"],
        },
        {
            name: "SVG foreign content / xlink:href",
            input: `<svg><a xlink:href="javascript:alert(1)"><text>x</text></a></svg>`,
            absent: ["<svg", "javascript:"],
        },
    ];

    it("neutralizes each denylist-bypass vector", () => {
        cy.foundry((win) =>
            VECTORS.map((v) => ({
                name: v.name,
                out: win.foundry.utils.cleanHTML(v.input),
                absent: v.absent,
            })),
        ).then((results) => {
            results.forEach(({ name, out, absent }) => {
                absent.forEach((fragment) => {
                    expect(
                        out.toLowerCase(),
                        `${name}: "${fragment}" should be stripped`,
                    ).to.not.include(fragment.toLowerCase());
                });
            });
        });
    });

    it("preserves benign chat-card markup and data-* dispatch attributes", () => {
        const input =
            `<div class="card-buttons">` +
            `<button data-action="createInjury" ` +
            `data-scope='{"attackResult":1}' ` +
            `data-handler-uuid="Actor.abc123">Calculate Injury</button>` +
            `<img src="icons/svg/aura.svg" alt="aura"></div>`;
        cy.foundry((win) => win.foundry.utils.cleanHTML(input)).then((out) => {
            expect(out).to.include("data-action");
            expect(out).to.include("createInjury");
            expect(out).to.include("data-scope");
            expect(out).to.include("data-handler-uuid");
            expect(out).to.include("<button");
            expect(out).to.include("<img");
        });
    });
});
