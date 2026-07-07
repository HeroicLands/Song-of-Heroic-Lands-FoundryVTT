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

/**
 * Scenario 4: create a scene and place two tokens (one per being) adjacent to
 * each other. Validates the scene/token seam the combat specs build on.
 */

describe("scene & adjacent tokens", () => {
    before(() => cy.login().then(() => cy.cleanupWorld()));
    afterEach(() => cy.cleanupWorld());

    it("creates a gridded scene", () => {
        cy.createScene({ name: "battlefield" }).then((scene) => {
            expect(scene).to.exist;
            cy.foundry((win) => {
                const s = win.game.scenes.get(scene.id);
                return { exists: !!s, size: s.grid?.size };
            }).should((r) => {
                expect(r.exists).to.be.true;
                expect(r.size).to.eq(100);
            });
        });
    });

    it("places two adjacent tokens, one per being", () => {
        cy.createActor("being", { name: "fighter A" }).as("a");
        cy.createActor("being", { name: "fighter B" }).as("b");
        cy.createScene({ name: "duel field" }).as("scene");

        cy.then(function () {
            cy.placeAdjacentTokens(this.scene, this.a, this.b).then(
                ([t1, t2]) => {
                    expect(t1, "token A").to.exist;
                    expect(t2, "token B").to.exist;
                    cy.foundry((win) => {
                        const s = win.game.scenes.get(this.scene.id);
                        const size = s.grid.size;
                        const a = s.tokens.get(t1.id);
                        const b = s.tokens.get(t2.id);
                        return {
                            count: s.tokens.size,
                            dx: b.x - a.x,
                            dy: b.y - a.y,
                            gridSize: size,
                            aActor: a.actorId,
                            bActor: b.actorId,
                        };
                    }).should((r) => {
                        expect(r.count, "two tokens").to.eq(2);
                        expect(r.dx, "one cell east").to.eq(r.gridSize);
                        expect(r.dy, "same row").to.eq(0);
                        expect(r.aActor).to.eq(this.a.id);
                        expect(r.bActor).to.eq(this.b.id);
                    });
                },
            );
        });
    });
});
