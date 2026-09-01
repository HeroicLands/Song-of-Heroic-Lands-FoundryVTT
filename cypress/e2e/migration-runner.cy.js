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
 * forward (exercising the runner's plan → stamp path end to end through the live
 * lifecycle), plus the registered `0.9.0` step that strips `system.docUrl`.
 *
 * The `ready` hook fires `void migrateWorld()` (fire-and-forget), and the stamp
 * is a world-setting write that round-trips to the server — so `game.ready`
 * (what `cy.login()` waits on) can flip true *before* the migration's stamp
 * lands. Both specs therefore poll the setting with a retry-able
 * `cy.window().should(...)` rather than reading it once, letting the async
 * migration settle instead of racing it (#1032).
 */
describe("migration runner — systemMigrationVersion (#957)", () => {
    before(() => cy.login());

    it("stamps the stored migration version to the system version on boot", () => {
        cy.window({ timeout: 20000 }).should((win) => {
            const version = win.game.system.version;
            expect(version, "system version").to.be.a("string").and.not.equal("");
            expect(
                win.game.settings.get("sohl", "systemMigrationVersion"),
                "stored migration version",
            ).to.equal(version);
        });
    });

    it("re-stamps a rewound (legacy) stored version on the next load", () => {
        // Rewind the stored version to a pre-tracking value, then re-visit the
        // world (a fresh `cy.login()` re-fires the `ready` hook) so the real
        // migration path re-runs. Whatever the plan does to documents, the
        // runner must still advance the stamp back to the system version.
        cy.foundry((win) => win.game.settings.set("sohl", "systemMigrationVersion", "0.0.0"));
        cy.foundry((win) => win.game.settings.get("sohl", "systemMigrationVersion")).should(
            "equal",
            "0.0.0",
        );

        cy.login(); // fresh /game load → ready → migrateWorld → runWorldMigrations

        // migrateWorld is not awaited by the ready hook, so poll until the async
        // stamp catches up to the system version rather than reading it once.
        cy.window({ timeout: 20000 }).should((win) => {
            expect(
                win.game.settings.get("sohl", "systemMigrationVersion"),
                "stored migration version after reload",
            ).to.equal(win.game.system.version);
        });
    });
});

/**
 * The `0.9.0` step retires `system.docUrl` (#1394). Three things need a live
 * client: that the schema has really stopped accepting the field, that the
 * runner plans the registered step, and that the step's payload — a replacement
 * of the whole `system` object, which is what forces the stored record to be
 * rewritten from the pruned source — changes nothing else on the way through.
 *
 * The step is stamped at the release version, so on a pre-release build the
 * planner would skip it. These specs make the client report that version for the
 * duration of one run and drive the runner over the real registry, rather than
 * asserting that nothing happened; both the reported version and the stored one
 * are restored afterwards so the specs above keep their footing.
 */
describe("0.9.0 — system.docUrl is retired (#1394)", () => {
    before(() => cy.login().then(() => cy.cleanupWorld()));
    after(() => cy.cleanupWorld());

    it("no longer declares the field, and will not persist one offered at create", () => {
        cy.createWorldItem("skill", {
            name: "Doc URL Probe",
            system: { docUrl: "https://heroiclands.org/sohl/skill/probe/" },
        }).then((item) => {
            cy.foundry((win) => {
                const doc = win.game.items.get(item.id);
                return {
                    schema: "docUrl" in doc.system.schema.fields,
                    data: "docUrl" in doc.system,
                    source: "docUrl" in doc._source.system,
                };
            }).should("deep.equal", {
                schema: false,
                data: false,
                source: false,
            });
        });
    });

    it("rewrites every actor and item — embedded ones included — without changing their data", () => {
        cy.importActor().as("actor");
        cy.createWorldItem("weapongear", { name: "Doc URL Gear" }).as("item");

        cy.then(function () {
            const { actor, item } = this;

            // Snapshot as key-sorted JSON so nothing is compared across realms,
            // and so a forced replacement rebuilding `system` in schema order
            // rather than stored order does not read as a change.
            cy.foundry((win) => {
                win.__snap = (d) => {
                    const canonical = (v) =>
                        Array.isArray(v) ? v.map(canonical)
                        : v && typeof v === "object" ?
                            Object.fromEntries(
                                Object.keys(v)
                                    .sort()
                                    .map((k) => [k, canonical(v[k])]),
                            )
                        :   v;
                    return JSON.stringify(canonical(d.toObject().system));
                };
                const a = win.game.actors.get(actor.id);
                win.__before = {
                    actor: win.__snap(a),
                    item: win.__snap(win.game.items.get(item.id)),
                    embedded: a.items.map(win.__snap),
                };
                return win.__before.embedded.length;
            }).should("be.greaterThan", 0);

            cy.foundry(async (win) => {
                // Every actor, every item embedded on one, and every world item
                // — the kinds the step migrates. Effects are untouched by it.
                const expected =
                    win.game.actors.reduce((n, a) => n + 1 + a.items.size, 0) + win.game.items.size;
                const reported = win.game.system.version;
                const stored = win.game.settings.get("sohl", "systemMigrationVersion");
                win.game.system.version = "0.9.0";
                try {
                    await win.game.settings.set("sohl", "systemMigrationVersion", "0.8.2");
                    const summary = await win.sohl.core.foundry.runWorldMigrations(win.game);
                    return { ...summary, expected };
                } finally {
                    win.game.system.version = reported;
                    await win.game.settings.set("sohl", "systemMigrationVersion", stored);
                }
            }).then((r) => {
                // At least this step — 0.9.0 may carry more than one, and the
                // subject here is what the walk does, not how many steps
                // share the version.
                expect(r.planned, "steps planned").to.be.at.least(1);
                expect(r.errors, "documents that threw").to.equal(0);
                expect(r.applied, "documents rewritten").to.equal(r.expected);
            });

            cy.foundry((win) => {
                const a = win.game.actors.get(actor.id);
                const embedded = a.items.map(win.__snap);
                return {
                    actor: win.__snap(a) === win.__before.actor,
                    item: win.__snap(win.game.items.get(item.id)) === win.__before.item,
                    embedded:
                        embedded.length === win.__before.embedded.length &&
                        embedded.every((s, n) => s === win.__before.embedded[n]),
                };
            }).should("deep.equal", {
                actor: true,
                item: true,
                embedded: true,
            });
        });
    });
});
