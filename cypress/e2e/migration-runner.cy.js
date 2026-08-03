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
 * The version-keyed migration runner (#957) runs on `ready` for the active GM
 * and stamps `systemMigrationVersion` forward to the running system version.
 * These specs prove the runtime surface: the boot stamp, and that rewinding the
 * stored version and reloading re-runs the real `ready` path and re-stamps
 * forward (the registry is empty, so no documents change — this exercises the
 * runner's plan → stamp path end to end through the live lifecycle).
 */
describe("migration runner — systemMigrationVersion (#957)", () => {
    before(() => cy.login());

    it("stamps the stored migration version to the system version on boot", () => {
        cy.foundry((win) => ({
            stored: win.game.settings.get("sohl", "systemMigrationVersion"),
            version: win.game.system.version,
        })).then(({ stored, version }) => {
            expect(version, "system version")
                .to.be.a("string")
                .and.not.equal("");
            expect(stored, "stored migration version").to.equal(version);
        });
    });

    it("re-stamps a rewound (legacy) stored version on the next load", () => {
        // Rewind the stored version to a pre-tracking value, then re-visit the
        // world (a fresh `cy.login()` re-fires the `ready` hook) so the real
        // migration path re-runs. The empty registry means no documents change;
        // the runner must still advance the stamp back to the system version.
        cy.foundry((win) =>
            win.game.settings.set("sohl", "systemMigrationVersion", "0.0.0"),
        );
        cy.foundry((win) =>
            win.game.settings.get("sohl", "systemMigrationVersion"),
        ).should("equal", "0.0.0");

        cy.login(); // fresh /game load → ready → migrateWorld → runWorldMigrations

        cy.foundry((win) => ({
            stored: win.game.settings.get("sohl", "systemMigrationVersion"),
            version: win.game.system.version,
        })).then(({ stored, version }) => {
            expect(stored, "stored migration version after reload").to.equal(
                version,
            );
        });
    });
});
