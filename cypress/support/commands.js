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
 * Log in to the seeded test world and wait until the game client is ready.
 *
 * Authenticates directly against Foundry's `/join` endpoint (the same POST the
 * join screen makes) with the seeded GM's id + known password, which sets the
 * session cookie; then loads `/game` and waits for `game.ready`. Defaults come
 * from Cypress.env (populated by cypress.config.mjs from the seed contract), so
 * a spec just calls `cy.login()`.
 *
 * @param {object} [opts]
 * @param {string} [opts.userId]   - user `_id` to log in as (default: seeded GM).
 * @param {string} [opts.password] - that user's password (default: seeded GM's).
 */
Cypress.Commands.add("login", (opts = {}) => {
    const userId = opts.userId ?? Cypress.env("gmId");
    const password = opts.password ?? Cypress.env("gmPassword");

    cy.request({
        method: "POST",
        url: "/join",
        body: { action: "join", userid: userId, password },
    }).then((res) => {
        // A successful join returns JSON `{status:"success", …}`. When the world
        // is not active Foundry answers 200 with an HTML error page instead, so
        // assert on the payload rather than the status code.
        expect(res.body, "join response").to.have.property("status", "success");
    });

    cy.visit("/game");
    cy.window({ timeout: 60000 }).its("game").its("ready").should("eq", true);
    cy.window({ log: false }).then((win) => guardHeadlessTokenDraw(win));
});

/**
 * Neutralize placeable-`Token` canvas rendering in the headless test browser.
 *
 * Placing a Token on the auto-viewed scene makes core create a placeable `Token`
 * and render it — an initial `_draw`, then per-tick `applyRenderFlags` refreshes
 * driven by the PIXI ticker — but the headless test browser never initializes a
 * real viewport. Core's render chain then reaches for canvas infrastructure that
 * is absent and throws unhandled promise rejections at several points:
 * `TokenRuler.draw` → `GridLayer.addHighlightLayer` (`reading 'addChild'`) from
 * `_draw`, `_refreshState` → `RenderFlags.set` (`reading 'OBJECTS'`) from the
 * ticker refresh, and `_onAnimationUpdate` → `RenderFlags.set` (the same
 * `'OBJECTS'`) from any token **movement**. These land on whatever spec is
 * running, failing token-placing and token-moving specs nondeterministically
 * (#611). Gating on `canvas.ready` is not enough — it can read `true` while the
 * token layer is still incomplete, so the refresh throws anyway.
 *
 * This suite never asserts on rendered token pixels — specs read the TokenDocument
 * and each combatant's Foundry-free `.logic` (and sheets via the DOM), never a
 * placeable's PIXI state (a viewport-dependent read is empty headless anyway; see
 * the testing docs). So we no-op the placeable's draw and render-flag flush
 * outright: the `Token` document and its `.object` still exist, only the PIXI
 * rendering (which has no test value here) is skipped. This is a narrower, safer
 * guard than allow-listing the generic `addChild`/`OBJECTS` messages globally,
 * which could mask a real error elsewhere, and it only patches core rendering that
 * this harness deliberately does not exercise. Installed once per page load
 * (idempotent); `testIsolation` is off, so one install per spec file covers all
 * its tests.
 *
 * @param {Window} win - the game client window.
 */
function guardHeadlessTokenDraw(win) {
    // Give `RenderFlags.set` the queue it appends to. Its last line is
    // `canvas.pendingRenderFlags[this.priority].add(this.object)`, and headless
    // the canvas never initializes that map — so *flagging* a refresh throws
    // `reading 'OBJECTS'` before anything is even rendered. Any token
    // **movement** reaches it (`_onUpdate` → `renderFlags.set`), which no
    // amount of no-oping `draw` can prevent. Supplying the empty sets makes
    // flagging harmless rather than fatal: nothing flushes them, because
    // `applyRenderFlags` below is a no-op and the ticker is not drawing.
    if (win.canvas && !win.canvas.pendingRenderFlags) {
        // A Proxy rather than a fixed `{OBJECTS, PERCEPTION}` map, so every
        // ticker priority core asks for resolves to a real Set — the queue is
        // meant to be opaque, and enumerating its keys here would be one more
        // core detail to keep in step.
        const queues = new win.Map();
        const stub = new win.Proxy(
            {},
            {
                get(_target, key) {
                    if (!queues.has(key)) queues.set(key, new win.Set());
                    return queues.get(key);
                },
            },
        );
        // `defineProperty`, not assignment: on a Canvas that has begun
        // initializing, `pendingRenderFlags` is read-only, and a plain
        // assignment throws — inside `cy.login()`, which would fail every
        // spec's `before` hook rather than the one test it was meant to help.
        // If the property refuses redefinition, leave it: a canvas that far
        // along supplies its own queue anyway.
        try {
            Object.defineProperty(win.canvas, "pendingRenderFlags", {
                configurable: true,
                get: () => stub,
            });
        } catch {
            /* core owns it — nothing to guard */
        }
    }

    const proto = win.CONFIG?.Token?.objectClass?.prototype;
    if (!proto || proto.__sohlHeadlessGuarded) return;
    // `draw()` is the render entry point the token layer awaits; no-op it so
    // neither the initial `_draw` nor its trailing `renderFlags.set({refresh})`
    // runs. `applyRenderFlags` is the per-tick refresh funnel; no-op it so the
    // PIXI ticker never refreshes the (undrawn) placeable either.
    proto.draw = function () {
        return Promise.resolve(this);
    };
    proto.applyRenderFlags = function () {};
    proto.__sohlHeadlessGuarded = true;
}
