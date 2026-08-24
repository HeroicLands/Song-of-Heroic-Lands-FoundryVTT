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
        // Foundry renamed this body field from `userid` to `userId` in 14.367
        // (`sessions.authenticateUser` destructures one or the other, depending
        // on build). Send both: the handler destructures the name it wants and
        // ignores the other, so one request spans the whole supported range —
        // 14.359 (the pinned floor) through the newest release the sweep runs.
        // Sending only `userid` makes 14.367 read `undefined`, look up no user,
        // and answer 401 `JOIN.ErrorUserDoesNotExist` with the misleading log
        // line `no user with ID of undefined` — which blocked every spec (#1537).
        body: { action: "join", userid: userId, userId, password },
    }).then((res) => {
        // A successful join returns JSON `{status:"success", …}`. When the world
        // is not active Foundry answers 200 with an HTML error page instead, so
        // assert on the payload rather than the status code.
        expect(res.body, "join response").to.have.property("status", "success");
    });

    cy.visit("/game");
    cy.window({ timeout: 60000 }).its("game").its("ready").should("eq", true);
    cy.window({ log: false }).then((win) => {
        guardHeadlessTokenDraw(win);
        guardHeadlessRegionShapeConstraints(win);
    });
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

/**
 * Make a Region shape-constraint pass inert when it cannot do any work.
 *
 * Two separate core defects land in the same method, one build apart, and this
 * guard covers both. Neither predicate subsumes the other.
 *
 * **No scene is viewed (#1535).** A **restricted** Region
 * (`restriction.enabled`) makes core flag its scene's shape constraints for
 * recomputation, which it throttles and then defers to a PIXI ticker callback.
 * That callback picks the User designated to do the work with a predicate
 * reading `u.viewedScene === canvas.scene.id` — so wherever nothing is viewed
 * and `canvas.scene` is `null`, it throws `Cannot read properties of null
 * (reading 'id')` from the ticker, failing whichever spec happens to be running
 * at the time. Core fixed this in 14.367 by reading `this.id` instead, but the
 * guard stays: the suite's committed default is the `compatibility.minimum`
 * floor (14.359), which still carries the bug.
 *
 * Note that "headless" alone does **not** mean no scene is viewed: the seeded
 * world ships an **active** default scene (`package-build e2e seed`, #451),
 * which the client views at load, so `canvas.scene` is normally a live Scene.
 * It is `null` before that first draw completes, and in any run whose active
 * scene is absent or unviewed — which is the window this clause covers, and the
 * state `map-notes.cy.js` presents deliberately to test it (#1661).
 *
 * **The scene has been deleted (#1550).** 14.367 opened the public entry point
 * with `if ( !this.persisted ) throw new Error("A nonpersisted Document cannot
 * be updated.")`, and left callers that cannot honour it. The canvas's private
 * `#draw` calls it as the very last thing it does, after a long run of awaits
 * (`#initialize`, the `_onReady` manager event, the `canvasReady` hook, region
 * `BEHAVIOR_VIEWED` events). This suite deletes the scenes it creates —
 * `cy.cleanupWorld()` in `afterEach` — so a draw begun on a tagged scene
 * routinely finishes after that scene has left `game.scenes`. `persisted` is
 * false by then, the method throws, and since nothing awaits the tail of the
 * draw the rejection escapes unhandled onto a bystander spec. Note this scene
 * is *not* null — it is live, truthy and mid-draw, merely no longer in its
 * collection — which is why the `canvas.scene` clause above does not catch it.
 *
 * Both are **core** defects, not SoHL ones — nothing in the system's code is on
 * either stack. In both cases the call is made inert in exactly the situation
 * core cannot serve, which is what the caller assumed anyway: nothing here
 * asserts on shape constraints (they are canvas-perception state for a *viewed*
 * scene), and recomputing them for a document nobody can update has no work to
 * do. The `persisted` test is strict `=== false`, so on a build with no such
 * getter it reads `undefined` and the original runs untouched.
 *
 * **Coverage.** On `Scene`, both entry points are patched, because a Region
 * saving its shape reaches the private pass through
 * `_updateRegionShapeConstraints` (`Region#updateShapeConstraints({save: true})`
 * → `this.parent._updateRegionShapeConstraints(this)`) and never touches the
 * public flag — true on every supported build. Only the public one takes the
 * `persisted` clause: that is where core throws, and the private one has no such
 * check on any supported build.
 *
 * `Level` is patched separately, for #1550 only. It carries its own copy of the
 * public method — new in 14.367; the 14.359 floor has no such member at all —
 * and throws from it *before* delegating, so the callers that address a level
 * directly (the levels a moved token affects, and the equivalent light and wall
 * updates) would not reach `Scene`'s guard. It needs no `canvas.scene` clause:
 * everything below its throw delegates to `Scene#_updateRegionShapeConstraints`,
 * which is guarded above. The floor's missing method is a no-op rather than an
 * error, via the `typeof` check.
 *
 * A source-level guard rather than an `uncaught:exception` allowlist entry, for
 * the same reason as {@link guardHeadlessTokenDraw}: both messages are far too
 * generic to leave allowlisted. `reading 'id'` sits one refactor away from
 * swallowing a real null dereference in system code, and "A nonpersisted
 * Document cannot be updated." is core's message for updating *any* deleted
 * document — either could mask a real SoHL bug. Skipping calls that can do no
 * work masks nothing.
 *
 * Installed once per page load, idempotent per prototype via its own marker;
 * `testIsolation` is off, so one install per spec file covers all its tests.
 *
 * @param {Window} win - the game client window.
 */
function guardHeadlessRegionShapeConstraints(win) {
    const proto = win.CONFIG?.Scene?.documentClass?.prototype;
    if (proto && !proto.__sohlHeadlessRegionGuarded) {
        const flag = proto.updateRegionShapeConstraints;
        if (typeof flag === "function") {
            proto.updateRegionShapeConstraints = function (...args) {
                if (!win.canvas?.scene || this.persisted === false) return;
                return flag.apply(this, args);
            };
        }
        const flagOne = proto._updateRegionShapeConstraints;
        if (typeof flagOne === "function") {
            proto._updateRegionShapeConstraints = function (...args) {
                if (!win.canvas?.scene) return;
                return flagOne.apply(this, args);
            };
        }
        proto.__sohlHeadlessRegionGuarded = true;
    }
    // `Level` has no SoHL subclass, so its own prototype is the only handle.
    guardNonpersistedRegionShapeConstraints(
        win.CONFIG?.Level?.documentClass?.prototype,
    );
}

/**
 * Wrap one prototype's public `updateRegionShapeConstraints` so it returns early
 * for a nonpersisted document instead of throwing (#1550). See
 * {@link guardHeadlessRegionShapeConstraints} for why.
 *
 * @param {object|undefined} proto - the document prototype to patch, if present.
 */
function guardNonpersistedRegionShapeConstraints(proto) {
    // `hasOwn`, not a truthiness test: the marker must not be mistaken for set
    // because some ancestor prototype carries one. Its own name, too — sharing
    // one with the Scene patch above would let either install suppress the other.
    if (!proto || Object.hasOwn(proto, "__sohlNonpersistedGuarded")) return;
    const update = proto.updateRegionShapeConstraints;
    if (typeof update !== "function") return;
    proto.updateRegionShapeConstraints = function (...args) {
        if (this.persisted === false) return;
        return update.apply(this, args);
    };
    proto.__sohlNonpersistedGuarded = true;
}
