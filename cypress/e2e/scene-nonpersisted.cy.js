/*
 * This file is part of the Song of Heroic Lands (SoHL) system for Foundry VTT.
 * Copyright (c) 2024-2026 Tom Rodriguez ("Toasty") — <toasty@heroiclands.org>
 *
 * This work is licensed under the GNU General Public License v3.0 (GPLv3).
 * You may copy, modify, and distribute it under the terms of that license.
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

/**
 * A deleted Scene is inert on the region-constraint path (issue #1550).
 *
 * Foundry 14.367 made `updateRegionShapeConstraints` throw
 * "A nonpersisted Document cannot be updated." unless `this.persisted`, but the
 * canvas calls it as the last step of its private draw, after a long run of
 * awaits. Because this suite deletes the scenes it creates in `afterEach`, a
 * draw begun on a tagged scene can finish after that scene has left
 * `game.scenes` — and the throw then escapes as an unhandled rejection onto
 * whichever spec is running next.
 *
 * That race is timing-dependent and only shows up under the load of a full
 * suite, where it lands on a bystander rather than on the spec that caused it.
 * So this spec asserts the *condition* directly instead of waiting for the
 * race: delete a scene, then invoke the same entry point the draw path does and
 * require it to be inert. `cy.login()`'s `guardHeadlessRegionShapeConstraints`
 * is what makes it so.
 *
 * That guard covers a second, unrelated defect too (#1535: no scene viewed), and
 * its clause for that one is tested *first*. Were `canvas.scene` `null` it would
 * short-circuit every call here and this spec would pass with the #1550 fix
 * reverted — so `withViewedScene` below pins the precondition the draw path
 * actually presents: a live, truthy `canvas.scene` that is merely no longer
 * persisted.
 *
 * `Level` is checked alongside `Scene` because it carries its own copy of the
 * method and throws from it *before* delegating to the scene, so the callers
 * that address a level directly — the levels a moved token affects, and the
 * equivalent light and wall updates — do not reach the scene's guard.
 *
 * The suite runs on two tracks, so the assertions have to hold on both, and the
 * two builds differ here: `Level` only gained its own copy of the method in
 * 14.367, and on the pinned 14.359 floor there is nothing to call and nothing
 * to guard. Hence the shape below — every entry point that *exists* must be
 * inert, rather than a fixed expectation of which ones exist. `persisted`
 * itself needs no such hedge: it reports `false` for a deleted scene and its
 * level on both builds, which the first test pins down.
 */
describe("scene: a nonpersisted Scene is inert (#1550)", () => {
    before(() => cy.login().then(() => cy.cleanupWorld()));
    afterEach(() => cy.cleanupWorld());

    /**
     * Delete `scene` and hand back live references to the now-nonpersisted
     * documents, so the assertions run against exactly what the draw path holds
     * — a document object that still exists but is no longer in its collection.
     */
    function deleteAndKeep(win, sceneId) {
        const scene = win.game.scenes.get(sceneId);
        const level = scene.firstLevel;
        return Promise.resolve(scene.delete()).then(() => ({ scene, level }));
    }

    /**
     * Run `fn()` with `canvas.scene` reporting `scene`, then restore.
     *
     * The draw path holds the scene it is drawing, so when it makes this call
     * `canvas.scene` is live and truthy — it is only `persisted` that has gone
     * false, and it is the *deleted* scene, not whichever one the client happens
     * to view. Leave that to the environment and the guard's *other* clause (no
     * scene viewed, #1535) short-circuits first in any run with nothing viewed,
     * the nonpersisted clause is never reached, and this spec passes with the
     * #1550 fix reverted — which is worth nothing. Setting it pins the real
     * precondition rather than working around the guard.
     */
    function withViewedScene(win, scene, fn) {
        const prior = Object.getOwnPropertyDescriptor(win.canvas, "scene");
        // An own property shadowing the accessor `Canvas` defines on its
        // prototype; deleting it below hands the getter back to core.
        Object.defineProperty(win.canvas, "scene", {
            configurable: true,
            get: () => scene,
        });
        try {
            return fn();
        } finally {
            if (prior) Object.defineProperty(win.canvas, "scene", prior);
            else delete win.canvas.scene;
        }
    }

    it("reports the deleted scene and its level as nonpersisted", () => {
        cy.createScene({ name: "nonpersisted precondition" }).then((created) => {
            cy.foundry((win) =>
                deleteAndKeep(win, created.id).then(({ scene, level }) => ({
                    gone: !win.game.scenes.has(created.id),
                    scenePersisted: scene.persisted,
                    hasLevel: !!level,
                    levelPersisted: level?.persisted,
                })),
            ).should((r) => {
                expect(r.gone, "scene left game.scenes").to.be.true;
                expect(r.hasLevel, "scene had a level to check").to.be.true;
                // The precondition core keys on. Asserted rather than assumed:
                // if a future build stops reporting `false` here, the guard
                // below silently stops guarding anything, and this is the only
                // place that would notice.
                expect(r.scenePersisted, "scene.persisted").to.equal(false);
                expect(r.levelPersisted, "level.persisted").to.equal(false);
            });
        });
    });

    it("does not throw when the draw path recomputes region shape constraints", () => {
        cy.createScene({ name: "nonpersisted scene draw" }).then((created) => {
            cy.foundry((win) =>
                deleteAndKeep(win, created.id).then(({ scene, level }) =>
                    withViewedScene(win, scene, () => {
                        // Exactly what the canvas draw does with the scene it
                        // was drawing, and what a moved token does with each
                        // level it affects. Collect the entry points this build
                        // actually defines, and the message of any that threw —
                        // the message rather than the Error itself, which would
                        // not survive the realm boundary intact.
                        const present = [];
                        const threw = {};
                        for (const [label, doc] of [
                            ["scene", scene],
                            ["level", level],
                        ]) {
                            if (typeof doc?.updateRegionShapeConstraints !== "function") {
                                continue;
                            }
                            present.push(label);
                            try {
                                doc.updateRegionShapeConstraints();
                            } catch (err) {
                                threw[label] = err?.message ?? "a non-Error";
                            }
                        }
                        return { present, threw };
                    }),
                ),
            ).should((r) => {
                expect(r.present, "Scene defines the entry point").to.include("scene");
                // Names the offender and its message on failure, instead of
                // "expected 'A nonpersisted Document…' to equal null".
                expect(r.threw, "no entry point threw").to.deep.equal({});
            });
        });
    });
});
