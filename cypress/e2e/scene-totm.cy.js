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
 * Theatre of the Mind (issue #1155). A Scene is not a typed document, so the
 * toggle lives in the `sohl.isTotm` scene flag and is read through
 * `scene.logic`. Only a live client can prove the flag round-trips — that the
 * logic accessor exists on a real Scene, and that the Scene config's SoHL tab
 * actually persists the checkbox.
 */
describe("scene: Theatre of the Mind", () => {
    before(() => cy.login().then(() => cy.cleanupWorld()));
    afterEach(() => {
        cy.closeAllSheets();
        cy.cleanupWorld();
    });

    it("exposes scene logic reporting isTotm = false by default", () => {
        cy.createScene({ name: "totm default" }).then((scene) => {
            cy.foundry((win) => {
                const s = win.game.scenes.get(scene.id);
                return { hasLogic: !!s.logic, isTotm: s.logic?.isTotm };
            }).should((r) => {
                expect(r.hasLogic, "scene.logic exists").to.be.true;
                expect(r.isTotm, "isTotm defaults off").to.be.false;
            });
        });
    });

    it("reports isTotm through scene.logic once the flag is set", () => {
        cy.createScene({ name: "totm on" }).then((scene) => {
            cy.foundry(async (win) => {
                const s = win.game.scenes.get(scene.id);
                await s.setTotm(true);
                return {
                    flag: s.getFlag("sohl", "isTotm"),
                    isTotm: s.logic.isTotm,
                };
            }).should((r) => {
                expect(r.flag, "persisted flag").to.be.true;
                expect(r.isTotm, "logic reads the flag").to.be.true;
            });
        });
    });

    it("persists the toggle from the Scene config's SoHL tab", () => {
        cy.createScene({ name: "totm sheet" }).as("scene");

        cy.then(function () {
            cy.openSheet(this.scene).within(() => {
                cy.get('[data-action="tab"][data-tab="sohl"]')
                    .first()
                    .click({ force: true });
                cy.get('input[name="flags.sohl.isTotm"]').check({
                    force: true,
                });
                cy.get('button[type="submit"]').first().click({ force: true });
            });

            // The submit is async; poll the document until the flag lands.
            cy.window().should((win) => {
                const s = win.game.scenes.get(this.scene.id);
                expect(s.getFlag("sohl", "isTotm"), "flag persisted").to.be
                    .true;
                expect(s.logic.isTotm, "logic reads it back").to.be.true;
            });
        });
    });
});
