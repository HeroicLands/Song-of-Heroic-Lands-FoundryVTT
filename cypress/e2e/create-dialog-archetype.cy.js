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
 * Create-dialog archetype picker (issue #604), on `system.archetype` (#1780).
 * The dialog seeds a new Being from a populated archetype, or a blank one for
 * **(none)**. The marker is cleared to `null` when an archetype is
 * _instantiated_ (dialog seed, drop-to-embed) and preserved when copied verbatim
 * (Import, Duplicate).
 *
 * **These specs seed their own world-tier archetype** rather than relying on the
 * shipped compendium being marked. That is deliberate, and it is not merely
 * hygiene: which documents the built packs carry a marker on depends on
 * `@heroiclands/package-build`'s builders, and the emission target moves to
 * `system.archetype` in HeroicLands/package-build#126 — the follow-on to this
 * change. A spec that presented its own archetype is evidence about SoHL's
 * discovery rules either side of that, instead of evidence about which build
 * produced the packs.
 *
 * A world copy is the highest tier (world &lt; system &lt; module), so the seeded
 * archetype is the picker's default whatever the packs carry.
 */

import { tagName } from "../support/factories/ids.js";
import { BASIC_FOLK } from "../support/factories/basicFolk.js";
import { resolveDocId } from "../support/commands/import.js";
import { toRealm } from "../support/resolve.js";

/** The stable descriptor for Basic Folk (id-independent; survives pack rebuilds). */
const BASIC_FOLK_REF = {
    shortcode: BASIC_FOLK.shortcode,
    name: BASIC_FOLK.name,
};

/**
 * Import Basic Folk into the world and mark it as an archetype at `priority`,
 * yielding `{ id, name, shortcode, priority }`. The import run-tags the name and
 * bumps the shortcode, so `cleanupWorld` sweeps it.
 *
 * @param {number} priority - the `system.archetype` value to set (default `0`,
 *   the priority SoHL's own archetypes ship at).
 */
function seedWorldArchetype(priority = 0) {
    return cy.importActor().then((actor) =>
        cy.foundry(async (win) => {
            const a = win.game.actors.get(actor.id);
            // Cross-realm: an update payload built in the spec bundle is
            // rejected by Foundry ("must be constructed with a DataModel or
            // Object") — clone it into the game window first.
            await a.update(toRealm(win, { "system.archetype": priority }));
            return {
                id: a.id,
                name: a.name,
                shortcode: a.system.shortcode,
                priority: a.system.archetype,
            };
        }),
    );
}

describe("Create dialog: archetype seeding (#604, #1780)", () => {
    before(() => cy.login().then(() => cy.cleanupWorld()));
    afterEach(() => cy.cleanupWorld());

    it("a priority-0 marker round-trips as 0, never as null (the falsy trap)", () => {
        // SoHL's own archetypes ship at priority 0. `0` and `null` are both
        // empty-looking and are NOT interchangeable: `0` is an archetype at
        // priority 0, `null` is not an archetype at all. Any truthiness test
        // anywhere in the write path would silently turn the first into the
        // second.
        seedWorldArchetype(0).should((a) => {
            expect(a.priority, "0 persisted as 0").to.eq(0);
            expect(a.priority, "…and not as null").to.not.be.null;
        });
        cy.foundry((win) => {
            const doc = win.game.actors.find((x) => x.system?.archetype === 0);
            return { found: !!doc, value: doc?.system?.archetype };
        }).should((r) => {
            expect(r.found, "re-read from the collection").to.be.true;
            expect(r.value).to.eq(0);
        });
    });

    it("Create → Being with the default archetype yields a populated being; blank Shortcode defaults to the archetype's (#643)", () => {
        seedWorldArchetype(0).then((arch) => {
            cy.foundry((win) => {
                // A typed Name overrides the archetype's; Shortcode is left at
                // its archetype default.
                win.__created = win.CONFIG.Actor.documentClass.createDialog(
                    { name: tagName("Archetype Being") },
                    {},
                    {},
                );
                return null;
            });
            // The Archetype select defaults to the seeded archetype; just confirm.
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
                    attributes: doc.items.filter((i) => i.type === "attribute").length,
                    movementProfiles: (doc.system?.movementProfiles || []).length,
                    archetype: doc.system?.archetype,
                    shortcode: doc.system?.shortcode,
                })),
            ).should((r) => {
                expect(r.bodyParts, "body parts").to.be.greaterThan(0);
                expect(r.attributes, "attribute items").to.be.greaterThan(0);
                expect(r.movementProfiles, "movement profiles").to.be.greaterThan(0);
                // Instantiation clears the marker — to `null`, not to a falsy 0.
                expect(r.archetype, "archetype cleared on instantiation").to.be.null;
                // The typed Name wins…
                expect(r.name, "typed name overrides").to.eq(tagName("Archetype Being"));
                // …but a blank Shortcode now defaults to the archetype's own (#643),
                // subject only to uniqueness bumping.
                expect(r.shortcode, "archetype shortcode default").to.match(
                    new RegExp(`^${arch.shortcode}\\d*$`),
                );
            });
        });
    });

    it("archetype-first: the default archetype pre-fills Name and Shortcode (#643)", () => {
        seedWorldArchetype(0).then((arch) => {
            cy.foundry((win) => {
                win.__prefill = win.CONFIG.Actor.documentClass.createDialog({}, {}, {});
                return null;
            });
            // With no pre-seeded name, the fields default to the chosen
            // archetype's own name / shortcode. Read them off the *rendered*
            // dialog, then override the Name with a tagged one so cleanupWorld
            // can sweep the created document.
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
                ).to.eq(arch.name);
                expect(
                    el.querySelector('input[name="shortcode"]').value,
                    "Shortcode pre-filled from archetype",
                ).to.match(new RegExp(`^${arch.shortcode}\\d*$`));
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
                expect(r.name, "renamed to tagged").to.eq(tagName("Prefilled Being"));
                // Shortcode was left at the archetype default.
                expect(r.shortcode, "archetype shortcode default").to.match(
                    new RegExp(`^${arch.shortcode}\\d*$`),
                );
            });
        });
    });

    it("Create → Being with (none) yields a blank being", () => {
        seedWorldArchetype(0);
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

    it("Import preserves system.archetype (copy-verbatim)", () => {
        cy.foundry(async (win) => {
            const pack = win.game.packs.get(BASIC_FOLK.pack);
            const src = await pack.getDocument(await resolveDocId(pack, BASIC_FOLK_REF));
            // Import = toObject → create (no clear). Present the marker on the
            // payload so the assertion is about what create preserves, not about
            // what the packs happen to carry.
            const data = src.toObject();
            data.name = tagName("Imported Folk");
            // Alphanumeric only — the create guard rejects anything else (#1397).
            data.system.shortcode = `imp${Date.now()}`;
            data.system.archetype = 3;
            const created = await win.Actor.create(data);
            return {
                archetype: created.system?.archetype,
                populated: (created.system?.body?.structure?.parts?.length ?? 0) > 0,
            };
        }).should((r) => {
            expect(r.archetype, "marker preserved on import").to.eq(3);
            expect(r.populated).to.be.true;
        });
    });

    it("Duplicate preserves system.archetype (copy-verbatim), including priority 0", () => {
        // Seed a marked world archetype at priority 0 — the falsy value — then
        // duplicate it: a truthiness test in the copy path would drop it.
        seedWorldArchetype(0).then((arch) => {
            cy.foundry(async (win) => {
                const world = win.game.actors.get(arch.id);
                // A directory Duplicate is a verbatim copy stamped with
                // `_stats.duplicateSource`; replicate that faithfully.
                const dup = world.toObject();
                delete dup._id;
                dup.name = tagName("Dup Copy");
                dup.system.shortcode = `dupc${Date.now()}`;
                dup._stats = { ...(dup._stats || {}), duplicateSource: world.uuid };
                const copy = await win.Actor.create(dup);
                return { archetype: copy.system?.archetype, srcArchetype: world.system?.archetype };
            }).should((r) => {
                expect(r.srcArchetype, "source is an archetype at 0").to.eq(0);
                expect(r.archetype, "marker preserved on duplicate").to.eq(0);
            });
        });
    });

    it("Drop-to-embed clears system.archetype", () => {
        cy.importActor().then((actor) => {
            // A marked world skill item — dropping it clones an embedded child,
            // which must NOT carry the archetype marker.
            cy.createWorldItem("skill", {
                name: tagName("Marked Skill"),
                system: { archetype: 2 },
            }).then((skill) => {
                cy.openSheet(actor);
                cy.foundry(async (win) => {
                    const a = win.game.actors.get(actor.id);
                    const root = a.sheet.element;
                    const src = win.game.items.get(skill.id);
                    const dt = new win.DataTransfer();
                    dt.setData("text/plain", JSON.stringify({ type: "Item", uuid: src.uuid }));
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
                                srcArchetype: src.system?.archetype,
                                archetype: child.system?.archetype,
                            };
                        await new Promise((r) => setTimeout(r, 20));
                    }
                    return { found: false };
                }).should((r) => {
                    expect(r.found, "embedded child created").to.be.true;
                    expect(r.srcArchetype, "source is an archetype").to.eq(2);
                    expect(r.archetype, "marker cleared on drop-embed").to.be.null;
                });
            });
        });
    });

    it("the sheet control sets and clears system.archetype without editing JSON (#1780)", () => {
        // The point of moving the marker into the schema: a GM marks a document
        // from its sheet, instead of export → hand-edit JSON → re-import.
        cy.createWorldItem("skill", { name: tagName("Sheet Marked Skill") }).then((skill) => {
            cy.openSheet(skill);
            cy.foundry((win) => win.game.items.get(skill.id).system.archetype).should("be.null");

            // Set it to 0 — the priority SoHL's own archetypes ship at, and the
            // value a truthiness bug would swallow.
            cy.editSheetField(skill, "system.archetype", 0);
            cy.foundry((win) => win.game.items.get(skill.id).system.archetype).should("eq", 0);

            // …and clearing the box un-marks it: FormDataExtended casts an empty
            // number input to `null`, the field's "not an archetype" state.
            cy.editSheetField(skill, "system.archetype", "");
            cy.foundry((win) => win.game.items.get(skill.id).system.archetype).should("be.null");
        });
    });
});
