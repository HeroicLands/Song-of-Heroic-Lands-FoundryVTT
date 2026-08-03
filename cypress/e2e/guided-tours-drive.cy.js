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
 * The driven-tour capabilities (#624): seeded-RNG mode and the drive-step
 * pipeline, driven against the live client.
 *
 * The headline is the **all-exit-paths RNG restore matrix** — the acceptance
 * criterion that a seeded tour returns `sohl.random` to normal no matter how it
 * ends (completion, abort, Escape, navigation, mid-step error). Restore rewinds
 * the shared stream to its exact pre-tour position, so "back to normal" is proven
 * by asserting the generator resumes the continuation it would have produced had
 * the tour never seeded it.
 *
 * No canvas is needed for the RNG matrix (it reads `sohl.random` directly), so it
 * is deterministic in headless runs.
 */

const SEED = "e2e-driven-tour";

/** Build an unregistered seeded SohlTour of centered (selector-less) free steps. */
function buildSeededTour(win, id) {
    const { SohlTour } = win.sohl.apps.foundry;
    return new SohlTour({
        namespace: "sohl",
        id,
        title: "E2E Seeded Tour",
        display: false,
        seedRng: SEED,
        steps: [
            { id: "a", title: "Step A", content: "A" },
            { id: "b", title: "Step B", content: "B" },
            { id: "c", title: "Step C", content: "C" },
        ],
    });
}

/** Draw three d6 values from `sohl.random`. */
function draw3(rng) {
    return [rng.die(6), rng.die(6), rng.die(6)];
}

describe("driven-tour: seeded RNG (SohlTour #624)", () => {
    before(() => cy.login());

    afterEach(() => {
        // Never leave a tour active (it would block the next test's start), and
        // never leave the shared RNG seeded.
        cy.foundry((win) => {
            win.foundry.nue.Tour.activeTour?.exit?.();
            return true;
        });
    });

    // The exit-path matrix. Each case: capture the pre-tour continuation, start
    // the seeded tour (which snapshots and seeds), end it via one exit path, then
    // assert the RNG resumes the captured continuation — i.e. it is back to normal.
    const EXIT_PATHS = {
        completion: (win, tour) => tour.complete(),
        abort: (win, tour) => tour.exit(),
        escape: (win) => win.foundry.nue.Tour.activeTour.exit(),
        navigation: (win) => win.dispatchEvent(new win.Event("pagehide")),
        "mid-step error": (win, tour) => {
            // Force _renderStep to throw so the base progress() catch calls
            // exit(), exercising the error exit path (the lease is already
            // established by _preStep before _renderStep runs).
            tour._renderStep = () => Promise.reject(new Error("boom"));
            return Promise.resolve();
        },
    };

    for (const [name, forceExit] of Object.entries(EXIT_PATHS)) {
        it(`restores sohl.random after ending via ${name}`, () => {
            const tourId = `e2e-seeded-${name.replace(/\s+/g, "-")}`;

            // For the error path the tour must be started with the throwing
            // _renderStep already in place, so we set it before start().
            const isErrorPath = name === "mid-step error";

            cy.foundry((win) => {
                const rng = win.sohl.random;
                const s0 = rng.getState();
                const expected = draw3(rng); // the pre-tour continuation
                rng.setState(s0); // rewind so seeding snapshots exactly s0
                win.__expected = expected;

                const tour = buildSeededTour(win, tourId);
                win.__tour = tour;
                if (isErrorPath) {
                    tour._renderStep = () => Promise.reject(new Error("boom"));
                    // start() will reject via the base progress() catch → exit().
                    return tour.start().then(
                        () => "started",
                        () => "threw-as-expected",
                    );
                }
                return tour.start();
            });

            if (!isErrorPath) {
                // End via this path, then let its promise (if any) settle.
                cy.foundry((win) =>
                    Promise.resolve(forceExit(win, win.__tour)).then(
                        () => true,
                    ),
                );
            }

            // The RNG is back to normal: it resumes the captured continuation.
            cy.foundry((win) => draw3(win.sohl.random)).then(function (drawn) {
                cy.foundry((win) => win.__expected).then((expected) => {
                    expect(drawn).to.deep.equal(expected);
                });
            });
        });
    }

    it("produces the same scripted sequence on every run (reproducible)", () => {
        // Run the seeded tour twice; the draws taken while seeded must match,
        // proving the seed makes rolls reproducible across runs.
        const runOnce = (win, id) => {
            const tour = buildSeededTour(win, id);
            return tour.start().then(() => {
                const seq = draw3(win.sohl.random);
                tour.exit(); // restores
                return seq;
            });
        };
        cy.foundry((win) => runOnce(win, "repro-1")).then((first) => {
            cy.foundry((win) => runOnce(win, "repro-2")).then((second) => {
                expect(second).to.deep.equal(first);
            });
        });
    });

    it("seeded draws differ from the un-seeded continuation (the seed took effect)", () => {
        cy.foundry((win) => {
            const rng = win.sohl.random;
            const s0 = rng.getState();
            const unseeded = draw3(rng);
            rng.setState(s0);
            const tour = buildSeededTour(win, "seeded-vs-unseeded");
            return tour.start().then(() => {
                const seeded = draw3(rng);
                tour.exit();
                return { seeded, unseeded };
            });
        }).then(({ seeded, unseeded }) => {
            // Astronomically unlikely to coincide across three d6 if the seed
            // genuinely reset the stream away from s0's continuation.
            expect(seeded).to.not.deep.equal(unseeded);
        });
    });

    it("exiting while start() is mid-flight leaves no ghost step card (#679)", () => {
        // Regression: a tour launched but not awaited (e.g. a button-launch) whose
        // owner exits before the async `_preStep()` settles must not strand an
        // orphan `.tour-center-step`. Base `exit()` clears `Tour.activeTour` but
        // leaves `stepIndex` (so `status` stays IN_PROGRESS), so the in-flight
        // `progress()` still reaches `_renderStep` — which must refuse to paint a
        // card once this tour is no longer the active tour. Otherwise the ghost
        // card is read by a later test's Next-button gate probe as "open",
        // spuriously failing the character-creation gate assertions in full-suite
        // runs. Interleaving `start()` and `exit()` in one synchronous frame lands
        // the exit before any render await resolves.
        cy.foundry((win) => {
            for (const el of win.document.querySelectorAll(
                ".tour-center-step",
            )) {
                el.remove();
            }
            const tour = buildSeededTour(win, "e2e-ghost-679");
            const p = tour.start().catch(() => {}); // do NOT await the render
            tour.exit(); // exit before the in-flight _preStep/_renderStep settles
            return p.then(() => true);
        });
        // Give any stranded in-flight render a frame to (not) paint, then assert
        // the DOM holds no orphaned centered step card.
        cy.foundry(
            (win) => win.document.querySelectorAll(".tour-center-step").length,
        ).should("eq", 0);
    });

    it("exit interleaved with the render await leaves no ghost, and a residual ghost is swept by the next start (#737)", () => {
        // The #679 guard only covers an `exit()` landing BEFORE the render begins.
        // #737 is the residual race: `_renderStep` yields at `super._renderStep()`,
        // and an `exit()` interleaving THAT await tears down before the card is
        // tracked, so the card painted afterward strands as a ghost that a later
        // gate probe (character-creation) reads as "open" in full-suite runs.

        // (a) Source prevention. Start the tour, yield a frame so `_preStep`
        // settles and the render reaches its `super._renderStep()` await, THEN
        // exit — landing the exit inside the render window. No ghost may remain.
        cy.foundry((win) => {
            for (const el of win.document.querySelectorAll(
                ".tour-center-step",
            )) {
                el.remove();
            }
            const tour = buildSeededTour(win, "e2e-ghost-737a");
            const p = tour.start().catch(() => {}); // do NOT await the render
            return new Promise((resolve) =>
                win.requestAnimationFrame(() => {
                    tour.exit(); // exit while the render await is in flight
                    p.then(() => resolve(true));
                }),
            );
        });
        cy.foundry(
            (win) => win.document.querySelectorAll(".tour-center-step").length,
        ).should("eq", 0);

        // (b) Safety net. Plant a residual ghost card (as an exit-interleaved
        // render would leave), then fully start a fresh tour: its first
        // `_renderStep` teardown must sweep the ghost, leaving exactly its own
        // one card. This is what reclaims a ghost before the gate probe reads it.
        cy.foundry((win) => {
            const ghost = win.document.createElement("aside");
            ghost.className = "tour-center-step";
            ghost.innerHTML =
                '<button class="step-button" data-action="next">Next</button>';
            win.document.body.appendChild(ghost);
            return buildSeededTour(win, "e2e-ghost-737b")
                .start()
                .then(() => true);
        });
        cy.foundry(
            (win) => win.document.querySelectorAll(".tour-center-step").length,
        ).should("eq", 1);
        // Tear it back down so the shared world/DOM is clean for the next test.
        cy.foundry((win) => {
            win.foundry.nue.Tour.activeTour?.exit?.();
            return true;
        });
        cy.foundry(
            (win) => win.document.querySelectorAll(".tour-center-step").length,
        ).should("eq", 0);
    });
});

describe("driven-tour: drive steps (SohlTour #624)", () => {
    before(() => cy.login().then(() => cy.cleanupWorld()));

    afterEach(() => {
        cy.foundry((win) => {
            win.foundry.nue.Tour.activeTour?.exit?.();
            return true;
        });
        cy.cleanupWorld();
    });

    it("runs a step's activate-scene drive before showing the step", () => {
        // A driven `activate-scene` step must reach Foundry and await: after the
        // step is shown, the target scene is the active scene. This proves the
        // drive pipeline is wired (runDrive → executor) without depending on
        // canvas pixels — `scene.activate()` flips the document's `active` flag.
        cy.createScene().then((scene) => {
            cy.foundry((win) => {
                const { SohlTour } = win.sohl.apps.foundry;
                const uuid = win.game.scenes.get(scene.id).uuid;
                const tour = new SohlTour({
                    namespace: "sohl",
                    id: "e2e-drive-activate",
                    title: "Drive: activate scene",
                    display: false,
                    steps: [
                        {
                            id: "go",
                            title: "Go",
                            content: "activating",
                            drive: [{ kind: "activate-scene", uuid }],
                        },
                    ],
                });
                win.__tour = tour;
                return tour
                    .start()
                    .then(() => win.game.scenes.get(scene.id).active);
            }).should("eq", true);
        });
    });

    // The remaining drive primitives (import-adventure, start-combat +
    // roll-initiative + advance-turn, set-target/clear-target) are exercised
    // end-to-end by the forthcoming Automated Combat tour, which ships the
    // adventure + scene + token fixtures they need. Headless runs suppress the
    // placeable-Token canvas draw (see kb/dev-docs/how-to/testing.md), so combat/target
    // primitives can't be proven on pixels here.
    it.skip("imports an adventure, starts combat, and sets a target (#620)", () => {
        // RED — blocked by #620: needs the Automated Combat tour's fixtures and a
        // drawn canvas (headless suppresses placeable-Token rendering).
    });
});
