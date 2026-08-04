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
 * Body Part (#721) and Body Location (#722) editors, opened from the Profile-tab
 * Body Structure tree's per-row ⋮ menu (the editable tree moved to Profile in
 * the Manuscript redesign; Combat keeps a read-only armor table). Each editor is
 * a small ApplicationV2 that auto-saves (submitOnChange, no Save button) and
 * writes back to the being's flat `system.body.structure.{zones,parts,locations}`
 * arrays via a whole-array update (#780).
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
                        a.id?.startsWith("body-zone-config-") ||
                        a.id?.startsWith("body-part-config-") ||
                        a.id?.startsWith("body-location-config-"),
                )
                .map((a) => a.close()),
        ).then(() => null),
    );
}

describe("Body Structure editors (Profile tab)", () => {
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
                cy.switchTab("profile", "primary");
                // The tree is collapsed by default — expand it so the part row
                // and its ⋮ menu are visible, then open ⋮ → Edit Body Part.
                cy.get(
                    'section[data-tab="profile"] [data-action="toggleBodyStructureAll"]',
                ).click();
                cy.get(
                    `section[data-tab="profile"] .body-structure__part[data-part-shortcode="${ref.code}"] .bodypart-contextmenu`,
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
                // Edit probWeight + name + a flag; the editor auto-saves.
                cy.foundry((win) => {
                    const form = findEditor(win, "body-part-config-").element;
                    form.querySelector('input[name="name"]').value =
                        "Edited Part";
                    form.querySelector('input[name="probWeight"]').value = "7";
                    form.querySelector('input[name="canHoldItem"]').checked =
                        true;
                    form.requestSubmit();
                    return null;
                });
                cy.window().should((win) => {
                    const part = win.game.actors.get(actor.id).system.body
                        .structure.parts[ref.index];
                    expect(part.name).to.eq("Edited Part");
                    expect(part.probWeight).to.eq(7);
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
                cy.switchTab("profile", "primary");
                cy.get(
                    'section[data-tab="profile"] [data-action="toggleBodyStructureAll"]',
                ).click();
                cy.get(
                    `section[data-tab="profile"] .body-structure__location[data-part-shortcode="${ref.partCode}"][data-location-shortcode="${ref.locCode}"] .bodylocation-contextmenu`,
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
                        .system.body.structure.locations.find(
                            (l) => l.shortcode === ref.locCode,
                        );
                    expect(loc.shockValue).to.eq(9);
                    expect(loc.protectionBase.blunt).to.eq(4);
                    expect(loc.bleedingSusceptibility).to.eq("high");
                });
            });
        });
    });

    it("re-parents a body part to another zone via the zone dropdown (#982)", () => {
        cy.importActor().then((actor) => {
            cy.prepare(actor);
            cy.foundry((win) => {
                const structure = win.game.actors.get(actor.id).logic.body
                    .structure;
                const part = structure.parts[0];
                // A different zone to move the part into.
                const destZone = structure.zones.find(
                    (z) => z.shortcode !== part.zone.shortcode,
                );
                return {
                    code: part.shortcode,
                    index: part.index,
                    fromZone: part.zone.shortcode,
                    toZone: destZone.shortcode,
                };
            }).then((ref) => {
                cy.openSheet(actor);
                cy.wait(500);
                cy.switchTab("profile", "primary");
                cy.get(
                    'section[data-tab="profile"] [data-action="toggleBodyStructureAll"]',
                ).click();
                cy.get(
                    `section[data-tab="profile"] .body-structure__part[data-part-shortcode="${ref.code}"] .bodypart-contextmenu`,
                ).click({ force: true });
                cy.get("#context-menu")
                    .contains(".context-item", "Edit Body Part")
                    .click();
                // The zone dropdown renders, pre-selected to the current zone.
                cy.window().should((win) => {
                    const sel = findEditor(
                        win,
                        "body-part-config-",
                    ).element.querySelector('select[name="bodyZoneCode"]');
                    expect(sel, "zone dropdown present").to.exist;
                    expect(sel.value).to.eq(ref.fromZone);
                });
                // Pick the other zone; the editor auto-saves and re-parents.
                cy.foundry((win) => {
                    const form = findEditor(win, "body-part-config-").element;
                    form.querySelector('select[name="bodyZoneCode"]').value =
                        ref.toZone;
                    form.requestSubmit();
                    return null;
                });
                cy.window().should((win) => {
                    const part = win.game.actors.get(actor.id).system.body
                        .structure.parts[ref.index];
                    expect(part.bodyZoneCode).to.eq(ref.toZone);
                });
            });
        });
    });

    it("re-parents a hit location to another part via the part dropdown (#982)", () => {
        cy.importActor().then((actor) => {
            cy.prepare(actor);
            cy.foundry((win) => {
                const structure = win.game.actors.get(actor.id).logic.body
                    .structure;
                const part = structure.parts.find(
                    (p) => p.locations.length > 0,
                );
                const loc = part.locations[0];
                const destPart = structure.parts.find(
                    (p) => p.shortcode !== part.shortcode,
                );
                return {
                    partCode: part.shortcode,
                    locCode: loc.shortcode,
                    toPart: destPart.shortcode,
                };
            }).then((ref) => {
                cy.openSheet(actor);
                cy.wait(500);
                cy.switchTab("profile", "primary");
                cy.get(
                    'section[data-tab="profile"] [data-action="toggleBodyStructureAll"]',
                ).click();
                cy.get(
                    `section[data-tab="profile"] .body-structure__location[data-part-shortcode="${ref.partCode}"][data-location-shortcode="${ref.locCode}"] .bodylocation-contextmenu`,
                ).click({ force: true });
                cy.get("#context-menu")
                    .contains(".context-item", "Edit Location")
                    .click();
                cy.window().should((win) => {
                    const sel = findEditor(
                        win,
                        "body-location-config-",
                    ).element.querySelector('select[name="bodyPartCode"]');
                    expect(sel, "part dropdown present").to.exist;
                    expect(sel.value).to.eq(ref.partCode);
                });
                cy.foundry((win) => {
                    const form = findEditor(
                        win,
                        "body-location-config-",
                    ).element;
                    form.querySelector('select[name="bodyPartCode"]').value =
                        ref.toPart;
                    form.requestSubmit();
                    return null;
                });
                cy.window().should((win) => {
                    const loc = win.game.actors
                        .get(actor.id)
                        .system.body.structure.locations.find(
                            (l) => l.shortcode === ref.locCode,
                        );
                    expect(loc.bodyPartCode).to.eq(ref.toPart);
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
                cy.switchTab("profile", "primary");
                cy.get(
                    'section[data-tab="profile"] [data-action="toggleBodyStructureAll"]',
                ).click();
                cy.get(
                    `section[data-tab="profile"] .body-structure__part[data-part-shortcode="${ref.code}"] .bodypart-contextmenu`,
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
        win.game.actors.get(actorId).system.body.structure.locations.length;

    const locationsOfPart = (win, actorId, partCode) =>
        win.game.actors
            .get(actorId)
            .system.body.structure.locations.filter(
                (l) => l.bodyPartCode === partCode,
            );

    it("renders add / drag / context-menu controls for an owner", () => {
        cy.importActor().then((actor) => {
            cy.prepare(actor);
            cy.openSheet(actor);
            cy.wait(500);
            cy.switchTab("profile", "primary");
            cy.foundry((win) => {
                const el = win.game.actors
                    .get(actor.id)
                    .sheet.element.querySelector('section[data-tab="profile"]');
                const list = el.querySelector(".body-structure");
                const zoneHeader = list.querySelector(
                    ".body-structure__zone[data-zone-shortcode]",
                );
                const header = list.querySelector(
                    ".body-structure__part[data-part-shortcode]",
                );
                const locRow = list.querySelector(
                    ".body-structure__location[data-part-shortcode][data-location-shortcode]",
                );
                return {
                    // Add-Zone lives in the section-legend beside the tree,
                    // not inside `.body-structure` — scope it to the whole tab.
                    addZone: !!el.querySelector('[data-action="addBodyZone"]'),
                    addPart: !!list.querySelector(
                        '[data-action="addBodyPart"]',
                    ),
                    addLoc: !!list.querySelector(
                        '[data-action="addBodyLocation"]',
                    ),
                    zoneDraggable: zoneHeader?.getAttribute("draggable"),
                    zoneMenu: !!zoneHeader?.querySelector(
                        ".bodyzone-contextmenu",
                    ),
                    partDraggable: header?.getAttribute("draggable"),
                    partMenu: !!header?.querySelector(".bodypart-contextmenu"),
                    locDraggable: locRow?.getAttribute("draggable"),
                    locMenu: !!locRow?.querySelector(
                        ".bodylocation-contextmenu",
                    ),
                };
            }).should((r) => {
                expect(r.addZone, "add-zone control").to.be.true;
                expect(r.addPart, "add-part control").to.be.true;
                expect(r.addLoc, "add-location control").to.be.true;
                expect(r.zoneDraggable, "zone draggable").to.equal("true");
                expect(r.zoneMenu, "zone context menu").to.be.true;
                expect(r.partDraggable, "part draggable").to.equal("true");
                expect(r.locDraggable, "location draggable").to.equal("true");
                expect(r.partMenu, "part context menu").to.be.true;
                expect(r.locMenu, "location context menu").to.be.true;
            });
        });
    });

    it("re-parents a body part to another zone with a whole-array write", () => {
        cy.importActor().then((actor) => {
            cy.foundry((win) => {
                const doc = win.game.actors.get(actor.id);
                const structure = doc.logic.body.structure;
                const before = partCodes(win, actor.id);
                const totBefore = totalLocations(win, actor.id);
                const moved = structure.parts[0];
                // Send the first part to the last zone, at its end.
                const destZone = structure.zones[structure.zones.length - 1];
                const payload = structure.movePartUpdate(
                    moved.index,
                    destZone.shortcode,
                    destZone.parts.length,
                );
                return doc.update(payload).then(() => ({
                    before,
                    movedCode: moved.shortcode,
                    destZoneCode: destZone.shortcode,
                    after: partCodes(win, actor.id),
                    movedZone: doc.system.body.structure.parts.find(
                        (p) => p.shortcode === moved.shortcode,
                    ).bodyZoneCode,
                    totBefore,
                    totAfter: totalLocations(win, actor.id),
                }));
            }).should((r) => {
                // The part now belongs to the destination zone...
                expect(r.movedZone).to.equal(r.destZoneCode);
                // ...and lands at the end of the flat array (its zone's end).
                expect(r.after[r.after.length - 1]).to.equal(r.movedCode);
                expect(r.after).to.have.length(r.before.length);
                // No location was lost to the array-rewrite (#247 guard).
                expect(r.totAfter).to.equal(r.totBefore);
            });
        });
    });

    it("reorders body zones with a whole-array write", () => {
        cy.importActor().then((actor) => {
            cy.foundry((win) => {
                const doc = win.game.actors.get(actor.id);
                const zoneCodes = () =>
                    doc.system.body.structure.zones.map((z) => z.shortcode);
                const before = zoneCodes();
                const payload = doc.logic.body.structure.moveZoneUpdate(
                    0,
                    before.length - 1,
                );
                return doc.update(payload).then(() => ({
                    before,
                    after: zoneCodes(),
                    partCount: partCodes(win, actor.id).length,
                }));
            }).should((r) => {
                expect(r.after[r.after.length - 1]).to.equal(r.before[0]);
                expect(r.after).to.have.length(r.before.length);
                // Re-ordering zones never disturbs their parts.
                expect(r.partCount).to.be.greaterThan(0);
            });
        });
    });

    it("moves a hit location to another part", () => {
        cy.importActor().then((actor) => {
            cy.foundry((win) => {
                const doc = win.game.actors.get(actor.id);
                const structure = doc.logic.body.structure;
                const moved = structure.locations[0];
                const srcCode = moved.bodyPart.shortcode;
                const destPart = structure.parts.find(
                    (p) => p.shortcode !== srcCode,
                );
                const totBefore = totalLocations(win, actor.id);
                const payload = structure.moveLocationUpdate(
                    moved.index,
                    destPart.shortcode,
                    destPart.locations.length,
                );
                return doc.update(payload).then(() => ({
                    inSource: locationsOfPart(win, actor.id, srcCode).some(
                        (l) => l.shortcode === moved.shortcode,
                    ),
                    inDest: locationsOfPart(
                        win,
                        actor.id,
                        destPart.shortcode,
                    ).some((l) => l.shortcode === moved.shortcode),
                    totBefore,
                    totAfter: totalLocations(win, actor.id),
                }));
            }).should((r) => {
                expect(r.inSource, "removed from source part").to.be.false;
                expect(r.inDest, "added to destination part").to.be.true;
                expect(r.totAfter, "no location lost").to.equal(r.totBefore);
            });
        });
    });

    it("adds then removes a body part, cascading to its locations", () => {
        cy.importActor().then((actor) => {
            cy.foundry((win) => {
                const doc = win.game.actors.get(actor.id);
                const structure = doc.logic.body.structure;
                const countBefore = partCodes(win, actor.id).length;
                const locsBefore = totalLocations(win, actor.id);
                const zoneCode = structure.zones[0].shortcode;
                // Re-realm the new part into the game window before update.
                const newPart = win.structuredClone({
                    shortcode: "e2etail",
                    name: "E2E Tail",
                    bodyZoneCode: zoneCode,
                    roles: [],
                    favoredFlag: false,
                    canHoldItem: false,
                    heldItemId: null,
                    permanentImpairment: 0,
                    permanentlyUnusable: false,
                    probWeight: 0,
                });
                const newLoc = win.structuredClone({
                    shortcode: "e2etailtip",
                    name: "E2E Tail Tip",
                    bodyPartCode: "e2etail",
                    bleedingSusceptibility: "none",
                    amputability: "none",
                    isStumble: false,
                    isFumble: false,
                    shockValue: 0,
                    probWeight: 1,
                    protectionBase: {
                        blunt: 0,
                        edged: 0,
                        piercing: 0,
                        fire: 0,
                    },
                });
                return doc
                    .update(structure.addPartUpdate(newPart))
                    .then(() =>
                        doc.update(
                            doc.logic.body.structure.addLocationUpdate(newLoc),
                        ),
                    )
                    .then(() => {
                        const added = partCodes(win, actor.id);
                        const addedLocs = totalLocations(win, actor.id);
                        return doc
                            .update(
                                doc.logic.body.structure.removePartUpdate(
                                    "e2etail",
                                ),
                            )
                            .then(() => ({
                                countBefore,
                                locsBefore,
                                addedHas: added.includes("e2etail"),
                                addedLen: added.length,
                                addedLocs,
                                finalHas: partCodes(win, actor.id).includes(
                                    "e2etail",
                                ),
                                finalLen: partCodes(win, actor.id).length,
                                finalLocs: totalLocations(win, actor.id),
                            }));
                    });
            }).should((r) => {
                expect(r.addedHas, "part added").to.be.true;
                expect(r.addedLen).to.equal(r.countBefore + 1);
                expect(r.addedLocs).to.equal(r.locsBefore + 1);
                expect(r.finalHas, "part removed").to.be.false;
                expect(r.finalLen).to.equal(r.countBefore);
                // The part's location went with it (cascade delete, #780).
                expect(r.finalLocs, "location cascaded").to.equal(r.locsBefore);
            });
        });
    });

    it("removes a body zone, cascading to its parts and their locations", () => {
        cy.importActor().then((actor) => {
            cy.foundry((win) => {
                const doc = win.game.actors.get(actor.id);
                const structure = doc.logic.body.structure;
                // Pick a zone that actually owns parts with locations.
                const zone = structure.zones.find(
                    (z) => z.parts.length > 0 && z.locations.length > 0,
                );
                const doomedParts = zone.parts.map((p) => p.shortcode);
                const doomedLocs = zone.locations.map((l) => l.shortcode);
                return doc
                    .update(structure.removeZoneUpdate(zone.shortcode))
                    .then(() => {
                        const sys = doc.system.body.structure;
                        return {
                            zoneGone: !sys.zones.some(
                                (z) => z.shortcode === zone.shortcode,
                            ),
                            partsGone: doomedParts.every(
                                (c) =>
                                    !sys.parts.some((p) => p.shortcode === c),
                            ),
                            locsGone: doomedLocs.every(
                                (c) =>
                                    !sys.locations.some(
                                        (l) => l.shortcode === c,
                                    ),
                            ),
                            // Nothing orphaned: every surviving location still
                            // names a surviving part.
                            noOrphans: sys.locations.every((l) =>
                                sys.parts.some(
                                    (p) => p.shortcode === l.bodyPartCode,
                                ),
                            ),
                        };
                    });
            }).should((r) => {
                expect(r.zoneGone, "zone removed").to.be.true;
                expect(r.partsGone, "zone's parts removed").to.be.true;
                expect(r.locsGone, "those parts' locations removed").to.be.true;
                expect(r.noOrphans, "no orphaned locations").to.be.true;
            });
        });
    });
});
