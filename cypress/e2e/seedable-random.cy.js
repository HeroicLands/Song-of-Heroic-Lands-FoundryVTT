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
 * Seedable PRNG (#599) + non-dice randomness routed through it (#601).
 *
 * The shared `sohl.random` singleton is the ambient generator behind
 * `SimpleRoll`, hit-location selection, and the `rand()` expression helper. In
 * the running app a spec can't inject an `Rng`, so it re-seeds the singleton
 * through the window at a known point (`win.sohl.random.seed(...)`) to make an
 * RNG-gated flow reproducible — the e2e counterpart to unit-test injection.
 *
 * This is the ready-signal contract: `sohl.random` is present from system
 * construction, so seeding here always precedes any roll under test.
 */

describe("Seedable sohl.random (#599 / #601)", () => {
    before(() => cy.login().then(() => cy.cleanupWorld()));
    afterEach(() => cy.cleanupWorld());

    it("exposes sohl.random with the full Rng surface", () => {
        cy.foundry((win) => {
            const r = win.sohl.random;
            return {
                present: !!r,
                methods: [
                    "float",
                    "uint32",
                    "int",
                    "die",
                    "seed",
                    "getState",
                    "setState",
                ].every((m) => typeof r[m] === "function"),
            };
        }).should((r) => {
            expect(r.present, "sohl.random singleton exists").to.be.true;
            expect(r.methods, "full Rng surface present").to.be.true;
        });
    });

    it("re-seeding produces a reproducible stream (same seed ⇒ same sequence)", () => {
        cy.foundry((win) => {
            const r = win.sohl.random;
            r.seed("e2e-repro-01");
            const a = Array.from({ length: 16 }, () => r.uint32(1 << 30));
            r.seed("e2e-repro-01");
            const b = Array.from({ length: 16 }, () => r.uint32(1 << 30));
            return { a, b };
        }).should((r) => {
            expect(r.a, "same seed replays the exact sequence").to.deep.eq(r.b);
        });
    });

    it("getState/setState snapshots and replays the stream", () => {
        cy.foundry((win) => {
            const r = win.sohl.random;
            r.seed("e2e-state");
            for (let i = 0; i < 5; i++) r.uint32(1000);
            const snap = r.getState();
            const before = Array.from({ length: 8 }, () => r.uint32(1 << 30));
            r.setState(snap);
            const after = Array.from({ length: 8 }, () => r.uint32(1 << 30));
            return { before, after };
        }).should((r) => {
            expect(r.after, "restored state replays identically").to.deep.eq(
                r.before,
            );
        });
    });

    it("a seeded singleton drives a real skill success test reproducibly", () => {
        cy.importActor().then((actor) => {
            cy.createItemOn(actor, "skill", {
                name: "Sword",
                system: { shortcode: "swo", masteryLevelBase: 50 },
            }).then((skill) => {
                cy.prepare(actor);
                cy.foundry(async (win) => {
                    const s = win.game.actors.get(actor.id).items.get(skill.id);
                    const runOnce = async () => {
                        // Re-seed to a fixed value, then run the RNG-gated test.
                        // Same seed ⇒ same d100 ⇒ same total, no forcing.
                        win.sohl.random.seed("skill-test-seed");
                        const result = await s.logic.executeAction(
                            "successTest",
                            { skipDialog: true, scope: {} },
                        );
                        return result?.roll?.total ?? null;
                    };
                    return { first: await runOnce(), second: await runOnce() };
                }).should((r) => {
                    expect(r.first, "a real d100 in range").to.be.within(
                        1,
                        100,
                    );
                    expect(
                        r.second,
                        "same seed reproduces the same d100",
                    ).to.eq(r.first);
                });
            });
        });
    });

    it("the rand() expression helper draws from the seeded singleton", () => {
        cy.foundry((win) => {
            const SafeExpression = win.sohl.entity.expr.SafeExpression;
            // A parent Logic is needed to construct a SafeExpression; any
            // document's logic serves (rand() ignores the parent).
            const parent = { id: "x", name: "x" };
            const evalRand = () =>
                new SafeExpression({ source: "rand()" }, { parent }).evaluate(
                    {},
                );
            win.sohl.random.seed("rand-helper-seed");
            const a = Array.from({ length: 8 }, evalRand);
            win.sohl.random.seed("rand-helper-seed");
            const b = Array.from({ length: 8 }, evalRand);
            return { a, b };
        }).should((r) => {
            expect(
                r.a.every((n) => n >= 0 && n < 1),
                "rand() in [0,1)",
            ).to.be.true;
            expect(r.b, "rand() is reproducible under a fixed seed").to.deep.eq(
                r.a,
            );
        });
    });
});
