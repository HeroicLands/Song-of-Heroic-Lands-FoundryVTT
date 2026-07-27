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
 * Body Part (#721) and Body Location (#722) editors, opened from the Combat-tab
 * Body Structure tree's per-row ⋮ menu. Each editor is a small ApplicationV2
 * that auto-saves (submitOnChange, no Save button) and writes back to the
 * being's `system.body.structure.parts` via a whole-array update.
 */

/** Find the open Body Part / Location editor by its id prefix (minifier-safe). */
function findEditor(win, prefix) {
    const inst = win.foundry?.applications?.instances;
    const apps =
        inst && typeof inst.values === "function" ?
            Array.from(inst.values())
        :   Object.values(inst ?? {});
    return apps.find((a) => a.id?.startsWith(prefix) && a.rendered);
}

/** Close any open body-structure editors (they auto-save, so stay open). */
function closeEditors() {
    cy.foundry((win) =>
        Promise.all(
            Array.from(win.foundry.applications.instances.values())
                .filter(
                    (a) =>
                        a.id?.startsWith("body-part-config-") ||
                        a.id?.startsWith("body-location-config-"),
                )
                .map((a) => a.close()),
        ).then(() => null),
    );
}

describe("Body Structure editors (Combat tab)", () => {
    before(() => cy.login().then(() => cy.cleanupWorld()));
    afterEach(() => {
        closeEditors();
        cy.closeAllSheets();
        cy.cleanupWorld();
    });
    Cypress.on("uncaught:exception", () => false);

    it("edits a body part via its ⋮ menu and auto-saves", () => {
        cy.importActor().then((actor) => {
            cy.prepare(actor);
            // Discover a real part shortcode from the being's structure.
            cy.foundry((win) => {
                const parts = win.game.actors.get(actor.id).logic.body.structure
                    .parts;
                return { code: parts[0].shortcode, index: parts[0].index };
            }).then((ref) => {
                cy.openSheet(actor);
                cy.wait(500); // let post-open re-renders settle before switching
                cy.switchTab("combat", "primary");
                // Open the part's ⋮ → Edit Body Part.
                cy.get(
                    `section[data-tab="combat"] .bodypart__header[data-part-shortcode="${ref.code}"] .bodypart-contextmenu`,
                ).click({ force: true });
                cy.get("#context-menu")
                    .contains(".context-item", "Edit Body Part")
                    .click();
                cy.window().should((win) => {
                    const ed = findEditor(win, "body-part-config-");
                    expect(ed, "part editor open").to.exist;
                    // Identity header + no Save button (auto-saves).
                    expect(
                        ed.element.querySelector(".body-part-config__header"),
                        "header present",
                    ).to.exist;
                    expect(
                        ed.element.querySelector('button[type="submit"]'),
                        "no Save button",
                    ).to.not.exist;
                });
                // Edit combatArea + name + a flag; the editor auto-saves.
                cy.foundry((win) => {
                    const form = findEditor(win, "body-part-config-").element;
                    form.querySelector('input[name="name"]').value =
                        "Edited Part";
                    form.querySelector('input[name="combatArea"]').value = "7";
                    form.querySelector('input[name="canHoldItem"]').checked =
                        true;
                    form.requestSubmit();
                    return null;
                });
                cy.window().should((win) => {
                    const part = win.game.actors.get(actor.id).system.body
                        .structure.parts[ref.index];
                    expect(part.name).to.eq("Edited Part");
                    expect(part.combatArea).to.eq(7);
                    expect(part.canHoldItem).to.eq(true);
                });
            });
        });
    });

    it("edits a body location via its ⋮ menu and auto-saves", () => {
        cy.importActor().then((actor) => {
            cy.prepare(actor);
            cy.foundry((win) => {
                const parts = win.game.actors.get(actor.id).logic.body.structure
                    .parts;
                const part = parts.find((p) => p.locations.length > 0);
                return {
                    partCode: part.shortcode,
                    partIndex: part.index,
                    locCode: part.locations[0].shortcode,
                };
            }).then((ref) => {
                cy.openSheet(actor);
                cy.wait(500); // let post-open re-renders settle before switching
                cy.switchTab("combat", "primary");
                cy.get(
                    `section[data-tab="combat"] li.bodylocation[data-part-shortcode="${ref.partCode}"][data-location-shortcode="${ref.locCode}"] .bodylocation-contextmenu`,
                ).click({ force: true });
                cy.get("#context-menu")
                    .contains(".context-item", "Edit Location")
                    .click();
                cy.window().should((win) => {
                    const ed = findEditor(win, "body-location-config-");
                    expect(ed, "location editor open").to.exist;
                    expect(
                        ed.element.querySelector('button[type="submit"]'),
                        "no Save button",
                    ).to.not.exist;
                });
                // Edit shock + a protection aspect + a tier; auto-saves.
                cy.foundry((win) => {
                    const form = findEditor(
                        win,
                        "body-location-config-",
                    ).element;
                    form.querySelector('input[name="shockValue"]').value = "9";
                    form.querySelector(
                        'input[name="protectionBase.blunt"]',
                    ).value = "4";
                    form.querySelector(
                        'select[name="bleedingSusceptibility"]',
                    ).value = "high";
                    form.requestSubmit();
                    return null;
                });
                cy.window().should((win) => {
                    const loc = win.game.actors
                        .get(actor.id)
                        .system.body.structure.parts[
                            ref.partIndex
                        ].locations.find((l) => l.shortcode === ref.locCode);
                    expect(loc.shockValue).to.eq(9);
                    expect(loc.protectionBase.blunt).to.eq(4);
                    expect(loc.bleedingSusceptibility).to.eq("high");
                });
            });
        });
    });

    it("refuses a duplicate part shortcode, keeping the original", () => {
        cy.importActor().then((actor) => {
            cy.prepare(actor);
            cy.foundry((win) => {
                const parts = win.game.actors.get(actor.id).logic.body.structure
                    .parts;
                return {
                    code: parts[0].shortcode,
                    index: parts[0].index,
                    other: parts[1].shortcode,
                };
            }).then((ref) => {
                cy.openSheet(actor);
                cy.wait(500); // let post-open re-renders settle before switching
                cy.switchTab("combat", "primary");
                cy.get(
                    `section[data-tab="combat"] .bodypart__header[data-part-shortcode="${ref.code}"] .bodypart-contextmenu`,
                ).click({ force: true });
                cy.get("#context-menu")
                    .contains(".context-item", "Edit Body Part")
                    .click();
                // Rename the first part's shortcode to collide with the second.
                cy.foundry((win) => {
                    const form = findEditor(win, "body-part-config-").element;
                    form.querySelector('input[name="shortcode"]').value =
                        ref.other;
                    form.requestSubmit();
                    return null;
                });
                // Rejected: the first part keeps its original shortcode.
                cy.window().should((win) => {
                    const codes = win.game.actors
                        .get(actor.id)
                        .system.body.structure.parts.map((p) => p.shortcode);
                    expect(codes[ref.index]).to.eq(ref.code);
                    // No duplicate introduced.
                    expect(codes.filter((c) => c === ref.other)).to.have.length(
                        1,
                    );
                });
            });
        });
    });
});

/**
 * Body Structure add / drag-sort / delete (#720) — layered on the #721/#722
 * editors. Proves the Combat tab renders the add / drag / ⋮ controls for an
 * owner, and that the #247-safe whole-array update builders (reorder / move /
 * add / remove) persist correctly against a live actor. The add dialog, the
 * shortcode validators, and the delete-guard are covered by the unit suite and
 * the Node template-render tests.
 */
describe("Body Structure editing — add / sort / delete (#720)", () => {
    before(() => cy.login().then(() => cy.cleanupWorld()));
    afterEach(() => cy.cleanupWorld());
    Cypress.on("uncaught:exception", () => false);

    const partCodes = (win, actorId) =>
        win.game.actors
            .get(actorId)
            .system.body.structure.parts.map((p) => p.shortcode);

    const totalLocations = (win, actorId) =>
        win.game.actors
            .get(actorId)
            .system.body.structure.parts.reduce(
                (n, p) => n + p.locations.length,
                0,
            );

    it("renders add / drag / context-menu controls for an owner", () => {
        cy.importActor().then((actor) => {
            cy.prepare(actor);
            cy.openSheet(actor);
            cy.wait(500);
            cy.switchTab("combat", "primary");
            cy.foundry((win) => {
                const el = win.game.actors
                    .get(actor.id)
                    .sheet.element.querySelector('section[data-tab="combat"]');
                const list = el.querySelector(".bodylocations-list");
                const header = list.querySelector(
                    "header.bodypart__header[data-part-shortcode]",
                );
                const locRow = list.querySelector(
                    "li.bodylocation[data-part-shortcode][data-location-shortcode]",
                );
                return {
                    addPart: !!list.querySelector(
                        '[data-action="addBodyPart"]',
                    ),
                    addLoc: !!list.querySelector(
                        '[data-action="addBodyLocation"]',
                    ),
                    partDraggable: header?.getAttribute("draggable"),
                    partMenu: !!header?.querySelector(".bodypart-contextmenu"),
                    locDraggable: locRow?.getAttribute("draggable"),
                    locMenu: !!locRow?.querySelector(
                        ".bodylocation-contextmenu",
                    ),
                };
            }).should((r) => {
                expect(r.addPart, "add-part control").to.be.true;
                expect(r.addLoc, "add-location control").to.be.true;
                expect(r.partDraggable, "part draggable").to.equal("true");
                expect(r.locDraggable, "location draggable").to.equal("true");
                expect(r.partMenu, "part context menu").to.be.true;
                expect(r.locMenu, "location context menu").to.be.true;
            });
        });
    });

    it("reorders body parts with a whole-array write", () => {
        cy.importActor().then((actor) => {
            cy.foundry((win) => {
                const doc = win.game.actors.get(actor.id);
                const before = partCodes(win, actor.id);
                const totBefore = totalLocations(win, actor.id);
                const payload = doc.logic.body.structure.movePartUpdate(
                    0,
                    before.length - 1,
                );
                return doc.update(payload).then(() => ({
                    before,
                    after: partCodes(win, actor.id),
                    totBefore,
                    totAfter: totalLocations(win, actor.id),
                }));
            }).should((r) => {
                // First part moved to the end; the rest shift up by one.
                expect(r.after[r.after.length - 1]).to.equal(r.before[0]);
                expect(r.after).to.have.length(r.before.length);
                // No location was lost to the array-rewrite (#247 guard).
                expect(r.totAfter).to.equal(r.totBefore);
            });
        });
    });

    it("moves a hit location to another part", () => {
        cy.importActor().then((actor) => {
            cy.foundry((win) => {
                const doc = win.game.actors.get(actor.id);
                const parts = doc.system.body.structure.parts;
                const movedCode = parts[0].locations[0].shortcode;
                const destLen = parts[1].locations.length;
                const totBefore = totalLocations(win, actor.id);
                const payload = doc.logic.body.structure.moveLocationUpdate(
                    0,
                    0,
                    1,
                    destLen,
                );
                return doc.update(payload).then(() => {
                    const after = doc.system.body.structure.parts;
                    return {
                        inSource: after[0].locations.some(
                            (l) => l.shortcode === movedCode,
                        ),
                        inDest: after[1].locations.some(
                            (l) => l.shortcode === movedCode,
                        ),
                        totBefore,
                        totAfter: totalLocations(win, actor.id),
                    };
                });
            }).should((r) => {
                expect(r.inSource, "removed from source part").to.be.false;
                expect(r.inDest, "added to destination part").to.be.true;
                expect(r.totAfter, "no location lost").to.equal(r.totBefore);
            });
        });
    });

    it("adds then removes a body part (whole-array writes)", () => {
        cy.importActor().then((actor) => {
            cy.foundry((win) => {
                const doc = win.game.actors.get(actor.id);
                const structure = doc.logic.body.structure;
                const countBefore = partCodes(win, actor.id).length;
                // Re-realm the new part into the game window before update.
                const newPart = win.structuredClone({
                    shortcode: "e2etail",
                    name: "E2E Tail",
                    roles: [],
                    favoredFlag: false,
                    canHoldItem: false,
                    heldItemId: null,
                    permanentImpairment: 0,
                    permanentlyUnusable: false,
                    combatArea: 0,
                    probWeight: 0,
                    locations: [],
                });
                return doc.update(structure.addPartUpdate(newPart)).then(() => {
                    const added = partCodes(win, actor.id);
                    return doc
                        .update(
                            doc.logic.body.structure.removePartUpdate(
                                "e2etail",
                            ),
                        )
                        .then(() => ({
                            countBefore,
                            addedHas: added.includes("e2etail"),
                            addedLen: added.length,
                            finalHas: partCodes(win, actor.id).includes(
                                "e2etail",
                            ),
                            finalLen: partCodes(win, actor.id).length,
                        }));
                });
            }).should((r) => {
                expect(r.addedHas, "part added").to.be.true;
                expect(r.addedLen).to.equal(r.countBefore + 1);
                expect(r.finalHas, "part removed").to.be.false;
                expect(r.finalLen).to.equal(r.countBefore);
            });
        });
    });
});
