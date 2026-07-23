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
 * Create-dialog archetype picker (issue #604). The dialog seeds a new Being from
 * a populated archetype (shipped "Basic Folk"), or a blank one for **(none)**.
 * The `flags.sohl.docArchetype` marker is stripped when an archetype is
 * _instantiated_ (dialog seed, drop-to-embed) and preserved when copied verbatim
 * (Import, Duplicate).
 */

import { tagName } from "../support/factories/ids.js";
import { BASIC_FOLK } from "../support/factories/basicFolk.js";

describe("Create dialog: archetype seeding (#604)", () => {
    before(() => cy.login().then(() => cy.cleanupWorld()));
    afterEach(() => cy.cleanupWorld());

    it("Create → Being with the default archetype yields a populated being; blank Shortcode defaults to the archetype's (#643)", () => {
        cy.foundry((win) => {
            // A typed Name overrides the archetype's; Shortcode is left at its
            // archetype default.
            win.__created = win.CONFIG.Actor.documentClass.createDialog(
                { name: tagName("Archetype Being") },
                {},
                {},
            );
            return null;
        });
        // The Archetype select defaults to Basic Folk; just confirm.
        cy.get("#archetype-select")
            .should("exist")
            .find("option")
            .should("have.length.greaterThan", 1); // at least one archetype + (none)
        cy.submitDialog("create");
        cy.foundry((win) =>
            win.__created.then((doc) => ({
                id: doc.id,
                name: doc.name,
                bodyParts: doc.system?.body?.structure?.parts?.length ?? 0,
                attributes: doc.items.filter((i) => i.type === "attribute")
                    .length,
                movementProfiles: (doc.system?.movementProfiles || []).length,
                archetypeFlag: doc.getFlag("sohl", "docArchetype"),
                shortcode: doc.system?.shortcode,
            })),
        ).should((r) => {
            expect(r.bodyParts, "body parts").to.be.greaterThan(0);
            expect(r.attributes, "attribute items").to.be.greaterThan(0);
            expect(r.movementProfiles, "movement profiles").to.be.greaterThan(
                0,
            );
            // Instantiation strips the archetype marker.
            expect(r.archetypeFlag, "docArchetype stripped").to.be.undefined;
            // The typed Name wins…
            expect(r.name, "typed name overrides").to.eq(
                tagName("Archetype Being"),
            );
            // …but a blank Shortcode now defaults to the archetype's own (#643),
            // subject only to uniqueness bumping.
            expect(r.shortcode, "archetype shortcode default").to.match(
                /^basicfolk\d*$/,
            );
        });
    });

    it("archetype-first: the default archetype pre-fills Name and Shortcode (#643)", () => {
        cy.foundry((win) => {
            win.__prefill = win.CONFIG.Actor.documentClass.createDialog(
                {},
                {},
                {},
            );
            return null;
        });
        // With no pre-seeded name, the fields default to the chosen archetype's
        // own name / shortcode (Basic Folk). Read them off the *rendered* dialog,
        // then override the Name with a tagged one so cleanupWorld can sweep the
        // created document.
        cy.window({ log: false }).should((win) => {
            const dlg = Array.from(win.foundry.applications.instances.values())
                .reverse()
                .find(
                    (app) =>
                        /dialog/i.test(app.constructor.name) &&
                        app.rendered &&
                        app.element &&
                        app.element.querySelector("#archetype-select"),
                );
            expect(dlg, "open create dialog").to.exist;
            const el = dlg.element;
            expect(
                el.querySelector('input[name="name"]').value,
                "Name pre-filled from archetype",
            ).to.eq("Basic Folk");
            expect(
                el.querySelector('input[name="shortcode"]').value,
                "Shortcode pre-filled from archetype",
            ).to.match(/^basicfolk\d*$/);
            // Rename so the artifact is tagged; a native input event marks the
            // field edited so the default no longer clobbers it.
            const nameInput = el.querySelector('input[name="name"]');
            nameInput.value = tagName("Prefilled Being");
            nameInput.dispatchEvent(new win.Event("input", { bubbles: true }));
        });
        cy.submitDialog("create");
        cy.foundry((win) =>
            win.__prefill.then((doc) => ({
                name: doc.name,
                shortcode: doc.system?.shortcode,
            })),
        ).should((r) => {
            expect(r.name, "renamed to tagged").to.eq(
                tagName("Prefilled Being"),
            );
            // Shortcode was left at the archetype default.
            expect(r.shortcode, "archetype shortcode default").to.match(
                /^basicfolk\d*$/,
            );
        });
    });

    it("Create → Being with (none) yields a blank being", () => {
        cy.foundry((win) => {
            win.__blank = win.CONFIG.Actor.documentClass.createDialog(
                { name: tagName("Blank Being") },
                {},
                {},
            );
            return null;
        });
        // Choose (none) — set the value directly on the live element of the
        // *rendered* dialog (instances retain closed dialogs whose stale
        // #archetype-select would otherwise be matched), and confirm it took
        // before submitting so the form serializes "".
        // Set the value on the *rendered* dialog's select, retrying until the
        // dialog has registered (cy.foundry alone isn't retriable, and closed
        // dialogs retain stale #archetype-select elements).
        cy.window({ log: false }).should((win) => {
            const dlg = Array.from(win.foundry.applications.instances.values())
                .reverse()
                .find(
                    (app) =>
                        /dialog/i.test(app.constructor.name) &&
                        app.rendered &&
                        app.element &&
                        app.element.querySelector("#archetype-select"),
                );
            expect(dlg, "open create dialog").to.exist;
            const sel = dlg.element.querySelector("#archetype-select");
            sel.value = "";
            expect(sel.value, "archetype set to (none)").to.eq("");
        });
        cy.submitDialog("create");
        cy.foundry((win) =>
            win.__blank.then((doc) => ({
                items: doc.items.size,
                bodyParts: doc.system?.body?.structure?.parts?.length ?? 0,
            })),
        ).should((r) => {
            expect(r.items, "no embedded items").to.eq(0);
            expect(r.bodyParts, "no body parts").to.eq(0);
        });
    });

    it("Import preserves the docArchetype flag (copy-verbatim)", () => {
        cy.foundry(async (win) => {
            const pack = win.game.packs.get(BASIC_FOLK.pack);
            const src = await pack.getDocument(BASIC_FOLK.id);
            const data = src.toObject();
            // Import = toObject → create (no strip). Retag so cleanupWorld sweeps it.
            data.name = tagName("Imported Folk");
            data.system.shortcode = `imp_${Date.now()}`;
            const created = await win.Actor.create(data);
            return {
                flag: created.getFlag("sohl", "docArchetype"),
                populated:
                    (created.system?.body?.structure?.parts?.length ?? 0) > 0,
            };
        }).should((r) => {
            expect(r.flag, "flag preserved on import").to.eq(0);
            expect(r.populated).to.be.true;
        });
    });

    it("Duplicate preserves the docArchetype flag (copy-verbatim)", () => {
        // Seed a flagged world archetype, then duplicate it.
        cy.foundry(async (win) => {
            const pack = win.game.packs.get(BASIC_FOLK.pack);
            const src = await pack.getDocument(BASIC_FOLK.id);
            const data = src.toObject();
            data.name = tagName("Dup Source");
            data.system.shortcode = `dup_${Date.now()}`;
            const world = await win.Actor.create(data);
            // A directory Duplicate is a verbatim copy stamped with
            // `_stats.duplicateSource`; replicate that faithfully.
            const dup = world.toObject();
            delete dup._id;
            dup.name = tagName("Dup Copy");
            dup.system.shortcode = `dupc_${Date.now()}`;
            dup._stats = { ...(dup._stats || {}), duplicateSource: world.uuid };
            const copy = await win.Actor.create(dup);
            return copy.getFlag("sohl", "docArchetype");
        }).should("eq", 0);
    });

    it("Drop-to-embed strips the docArchetype flag", () => {
        cy.importActor().then((actor) => {
            // A flagged world skill item — dropping it clones an embedded child,
            // which must NOT carry the archetype marker.
            cy.createWorldItem("skill", {
                name: tagName("Flagged Skill"),
                flags: { sohl: { docArchetype: 2 } },
            }).then((skill) => {
                cy.openSheet(actor);
                cy.foundry(async (win) => {
                    const a = win.game.actors.get(actor.id);
                    const root = a.sheet.element;
                    const src = win.game.items.get(skill.id);
                    const dt = new win.DataTransfer();
                    dt.setData(
                        "text/plain",
                        JSON.stringify({ type: "Item", uuid: src.uuid }),
                    );
                    root.dispatchEvent(
                        new win.DragEvent("drop", {
                            bubbles: true,
                            cancelable: true,
                            dataTransfer: dt,
                        }),
                    );
                    // The embed create is async; poll for the new child by name.
                    for (let i = 0; i < 100; i++) {
                        const child = a.items.find(
                            (it) => it.name === src.name && it.id !== src.id,
                        );
                        if (child)
                            return {
                                found: true,
                                flag: child.getFlag("sohl", "docArchetype"),
                            };
                        await new Promise((r) => setTimeout(r, 20));
                    }
                    return { found: false };
                }).should((r) => {
                    expect(r.found, "embedded child created").to.be.true;
                    expect(r.flag, "flag stripped on drop-embed").to.be
                        .undefined;
                });
            });
        });
    });
});
