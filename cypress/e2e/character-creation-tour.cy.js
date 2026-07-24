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
 * The flagship Character Creation tour (#614): the SohlTour registers and is
 * listed in Tour Management, is offered once per user as a non-blocking whisper
 * card, and its gated steps hold **Next** disabled until the user has done the
 * thing — producing, along the happy path, a fully-populated, equipped, armoured
 * Being with an Arcane Talent and a packed backpack.
 *
 * Gate transitions are driven programmatically (the same document mutations the
 * user's sheet actions produce), then the tour's own Next-button gate state is
 * asserted — so the spec verifies the tour's gating/readState against the live
 * client without re-driving every dialog and drag.
 */

const KEY = "sohl.character-creation";

/**
 * Step indices (0-based) of the gated steps under test. The tour opens with a
 * free create-actor step (selects the Actors tab, spotlights the Create Actor
 * button) then the archetype step, so the first gated step (`populated`) is
 * index 2.
 */
const STEP = {
    populated: 2,
    gearWeapons: 8,
    combatHold: 9,
    strikeModes: 10,
    gearTunic: 11,
    mysteryAdd: 13,
    backpack: 15,
    tinderbox: 16,
    dragIn: 17,
    dragOut: 18,
};

/** Read whether the tour's Next button is currently gate-disabled. */
function isGated(win) {
    const btn = win.game.tooltip?.tooltip?.querySelector(
        '.step-button[data-action="next"]',
    );
    return !!btn && btn.classList.contains("sohl-tour-gate-disabled");
}

/** Progress the (already-started) tour to a step and return the resulting index. */
function goTo(index) {
    return cy.foundry(async (win) => {
        const tour = win.game.tours.get(KEY);
        await tour.progress(index);
        return tour.stepIndex;
    });
}

/** Assert the tour's Next button is gated (`true`) or open (`false`). */
function expectGated(shouldBeGated, msg) {
    cy.window().should((win) => expect(isGated(win), msg).to.eq(shouldBeGated));
}

describe("Character Creation tour (SohlTour, #614)", () => {
    // Headless sheet/canvas re-renders throw benign async errors during the
    // document mutations these steps drive; a genuinely failed mutation instead
    // surfaces as its gate staying closed (an `expectGated(false)` failure), so
    // suppressing uncaught exceptions cannot mask a real regression here.
    Cypress.on("uncaught:exception", () => false);

    before(() => cy.login().then(() => cy.cleanupWorld()));

    afterEach(() => {
        cy.foundry((win) => {
            win.game.tours.get(KEY)?.exit?.();
            return true;
        });
        cy.cleanupWorld();
    });

    it("registers and is listed in Tour Management", () => {
        cy.foundry((win) => {
            const tour = win.game.tours.get(KEY);
            return {
                exists: !!tour,
                display: !!tour?.config?.display,
                steps: tour?.config?.steps?.length ?? 0,
                title: tour?.title ?? "",
            };
        }).should((r) => {
            expect(r.exists, "tour registered").to.be.true;
            expect(r.display, "listed in Tour Management").to.be.true;
            expect(r.steps, "has all steps").to.be.greaterThan(15);
            expect(r.title).to.contain("Create a Character");
        });
    });

    it("is offered once per user and its Start button launches the tour", () => {
        // The first-run offer fires on ready (in `before`), recorded by a per-user
        // flag so it is never re-offered — the tour stays launchable on demand.
        cy.foundry(
            (win) =>
                !!win.game.user.getFlag("sohl", "characterCreationTourOffered"),
        ).should("eq", true);

        // The offer surface is a chat card whose Start button launches the tour
        // through the delegated `renderChatMessageHTML` handler.
        cy.foundry((win) =>
            win.ChatMessage.create(
                win.JSON.parse(
                    JSON.stringify({
                        content:
                            '<div class="card-buttons">' +
                            '<button data-sohl-tour-start="sohl.character-creation">Start the tour</button>' +
                            "</div>",
                        whisper: [win.game.user.id],
                    }),
                ),
            ).then(() => true),
        );
        cy.get('[data-sohl-tour-start="sohl.character-creation"]', {
            timeout: 8000,
        })
            .first()
            // force: the whisper card can sit off-screen in the headless chat log;
            // this test exercises the button wiring, not its visibility.
            .click({ force: true });
        cy.foundry((win) => win.game.tours.get(KEY).status).should(
            "eq",
            "in-progress",
        );
    });

    it("opens by selecting the Actors tab and spotlighting Create Actor", () => {
        // The create-actor step selects the Actors tab (scene-setting nav) and
        // spotlights the Create Actor button — a fade ring on the button while the
        // step card stays centered/stable. The overlay must pass clicks through so
        // the spotlighted control is actionable.
        cy.foundry((win) =>
            win.game.tours
                .get(KEY)
                .start()
                .then(() => true),
        );

        cy.window().should((win) => {
            const tour = win.game.tours.get(KEY);
            expect(tour.stepIndex, "on the create-actor step").to.eq(0);
            // The Actors directory was auto-selected.
            expect(
                win.ui.sidebar?.tabGroups?.primary,
                "Actors tab selected",
            ).to.eq("actors");
            // The spotlight targets the Actors directory's Create Actor button.
            const spot = tour.spotlightTarget;
            expect(spot, "has a spotlight target").to.exist;
            expect(
                spot.classList.contains("create-entry"),
                "the Create Actor button",
            ).to.be.true;
            expect(spot.closest("#actors"), "scoped to the actors directory").to
                .exist;
            // The step card is NOT anchored to the button (stable/centered), so a
            // sidebar hover can't hijack Foundry's shared tooltip and lose it.
            expect(
                tour.targetElement?.classList.contains("tour-center-step"),
                "card is the centered step, not a tooltip",
            ).to.be.true;
            // Coach-and-wait: the overlay never blocks the spotlighted control.
            expect(
                tour.overlayElement?.style.pointerEvents,
                "overlay lets the click through",
            ).to.eq("none");
        });
    });

    it("lifts an open dialog above the tour fade so it is not shadowed", () => {
        // A dialog the user must type in must not be dimmed by the tour fade.
        cy.foundry((win) =>
            win.game.tours
                .get(KEY)
                .start()
                .then(() => true),
        );
        // Open a dialog (the same DialogV2 class the Create Actor dialog uses)
        // while the tour is active.
        cy.foundry((win) => {
            const dlg = new win.foundry.applications.api.DialogV2({
                window: { title: "Tour Dialog Test" },
                content: "<p>x</p>",
                buttons: [{ action: "ok", label: "OK" }],
            });
            return dlg.render({ force: true }).then(() => true);
        });
        cy.window().should((win) => {
            const dialog = win.document.querySelector("dialog.application");
            expect(dialog, "a dialog is open").to.exist;
            const dz = parseInt(win.getComputedStyle(dialog).zIndex, 10);
            const fz = parseInt(
                win.getComputedStyle(win.game.tours.get(KEY).fadeElement)
                    .zIndex,
                10,
            );
            expect(dz, "dialog sits above the tour fade").to.be.greaterThan(fz);
        });
        // Dismiss the dialog so it doesn't leak into later specs.
        cy.foundry((win) => {
            win.document
                .querySelectorAll("dialog.application")
                .forEach((d) => d.remove());
            return true;
        });
    });

    it("gated steps hold Next until the user acts, building a full character", () => {
        // Basic Folk — a populated Being carrying the `basicfolk` archetype
        // shortcode, which is what the step-3 "populated" gate recognizes.
        cy.importActor().as("being");

        // Start the tour once; every step is reached via progress() thereafter.
        cy.foundry((win) =>
            win.game.tours
                .get(KEY)
                .start()
                .then(() => true),
        );

        // populated: the imported Basic Folk satisfies it immediately.
        goTo(STEP.populated).should("eq", STEP.populated);
        expectGated(false, "populated gate open for Basic Folk");

        // gear-weapons: gated until a Broadsword AND a Roundshield exist.
        goTo(STEP.gearWeapons).should("eq", STEP.gearWeapons);
        expectGated(true, "weapons gate closed with no weapons");
        cy.get("@being").then((being) => {
            cy.getFromCompendium("sohl.items", "weapongear", "BrdSwd").then(
                (bs) => cy.dropOnActor(being, bs).as("broadsword"),
            );
            cy.getFromCompendium("sohl.items", "weapongear", "RndSh").then(
                (rs) => cy.dropOnActor(being, rs).as("roundshield"),
            );
        });
        expectGated(false, "weapons gate opens once both exist");

        // combat-hold: gated until Broadsword→right arm, Roundshield→left.
        goTo(STEP.combatHold).should("eq", STEP.combatHold);
        expectGated(true, "hold gate closed before holding");
        cy.then(function () {
            const beingId = this.being.id;
            const broadswordId = this.broadsword.id;
            const roundshieldId = this.roundshield.id;
            cy.foundry((win) => {
                const actor = win.game.actors.get(beingId);
                const struct = actor.logic.body.structure;
                const findArm = (side) =>
                    struct.parts.find(
                        (p) =>
                            p.canHoldItem &&
                            side.test(p.name) &&
                            /arm/i.test(p.name),
                    );
                const right = findArm(/right/i);
                const left = findArm(/left/i);
                const payload = struct.setPartFieldsUpdate([
                    {
                        index: right.index,
                        changes: { heldItemId: broadswordId },
                    },
                    {
                        index: left.index,
                        changes: { heldItemId: roundshieldId },
                    },
                ]);
                return actor.logic.data.update(payload).then(() => true);
            });
        });
        expectGated(
            false,
            "hold gate opens once weapons are in the right arms",
        );

        // strike-modes: a held weapon means the strike modes appear;
        // the gate is satisfied (and pointer pass-through makes ATK/BLK/CX live).
        goTo(STEP.strikeModes).should("eq", STEP.strikeModes);
        expectGated(false, "strike-modes gate open once a weapon is held");

        // gear-tunic: gated until a Leather Tunic exists AND is equipped.
        goTo(STEP.gearTunic).should("eq", STEP.gearTunic);
        expectGated(true, "tunic gate closed with no tunic");
        cy.get("@being").then((being) => {
            cy.getFromCompendium("sohl.items", "armorgear", "LtTunic").then(
                (t) => cy.dropOnActor(being, t).as("tunic"),
            );
        });
        expectGated(true, "tunic gate still closed until it is equipped");
        cy.then(function () {
            const tunicId = this.tunic.id;
            const beingId = this.being.id;
            cy.foundry((win) =>
                win.game.actors
                    .get(beingId)
                    .items.get(tunicId)
                    // Re-realm the payload into the game window (cross-realm literals
                    // are rejected by Foundry — "must be constructed with a … Object").
                    .update(win.JSON.parse('{"system.isEquipped":true}'))
                    .then(() => true),
            );
        });
        expectGated(false, "tunic gate opens once equipped");

        // mystery-add: gated until an Arcane Talent mystical ability exists.
        goTo(STEP.mysteryAdd).should("eq", STEP.mysteryAdd);
        expectGated(true, "arcane-talent gate closed");
        cy.get("@being").then((being) => {
            cy.createItemOn(being, "mysticalability", {
                name: "Telepathy",
                system: { subType: "arcanetalent" },
            });
        });
        expectGated(false, "arcane-talent gate opens once the talent exists");

        // backpack: gated until a Backpack container exists.
        goTo(STEP.backpack).should("eq", STEP.backpack);
        expectGated(true, "backpack gate closed");
        cy.get("@being").then((being) => {
            cy.getFromCompendium("sohl.items", "containergear", "backpk").then(
                (b) => cy.dropOnActor(being, b).as("backpack"),
            );
        });
        expectGated(false, "backpack gate opens once it exists");

        // tinderbox: gated until a Tinderbox exists.
        goTo(STEP.tinderbox).should("eq", STEP.tinderbox);
        expectGated(true, "tinderbox gate closed");
        cy.get("@being").then((being) => {
            cy.getFromCompendium("sohl.items", "miscgear", "tndrbx").then((t) =>
                cy.dropOnActor(being, t).as("tinderbox"),
            );
        });
        expectGated(false, "tinderbox gate opens once it exists");

        // drag-in: gated until the Tinderbox is inside the Backpack.
        goTo(STEP.dragIn).should("eq", STEP.dragIn);
        expectGated(true, "drag-in gate closed while loose");
        cy.then(function () {
            const beingId = this.being.id;
            const tinderboxId = this.tinderbox.id;
            const backpackId = this.backpack.id;
            cy.foundry((win) =>
                win.game.actors
                    .get(beingId)
                    .items.get(tinderboxId)
                    .update(
                        win.JSON.parse(
                            JSON.stringify({
                                "system.containerId": backpackId,
                            }),
                        ),
                    )
                    .then(() => true),
            );
        });
        expectGated(false, "drag-in gate opens once the tinderbox is packed");

        // drag-out: gated until the Tinderbox is back on the person.
        goTo(STEP.dragOut).should("eq", STEP.dragOut);
        expectGated(true, "drag-out gate closed while packed");
        cy.then(function () {
            const beingId = this.being.id;
            const tinderboxId = this.tinderbox.id;
            cy.foundry((win) =>
                win.game.actors
                    .get(beingId)
                    .items.get(tinderboxId)
                    // Clearing a DocumentIdField uses null (the sheet's drop-out
                    // path writes null; "" fails id validation and no-ops).
                    .update(win.JSON.parse('{"system.containerId":null}'))
                    .then(() => true),
            );
        });
        expectGated(false, "drag-out gate opens once back on the person");

        // The happy path leaves a fully-populated, equipped, armoured Being.
        cy.then(function () {
            const beingId = this.being.id;
            cy.foundry((win) => {
                const a = win.game.actors.get(beingId);
                const scBase = (sc) =>
                    String(sc ?? "")
                        .toLowerCase()
                        .replace(/[^a-z0-9]+/g, "")
                        .replace(/[0-9]+$/, "");
                const has = (type, base) =>
                    a.items.some(
                        (it) =>
                            it.type === type &&
                            scBase(it.system?.shortcode) === base,
                    );
                const tunic = a.items.find(
                    (it) =>
                        it.type === "armorgear" &&
                        scBase(it.system?.shortcode) === "lttunic",
                );
                return {
                    broadsword: has("weapongear", "brdswd"),
                    roundshield: has("weapongear", "rndsh"),
                    tunicEquipped: !!tunic?.system?.isEquipped,
                    arcaneTalent: a.items.some(
                        (it) =>
                            it.type === "mysticalability" &&
                            it.system?.subType === "arcanetalent",
                    ),
                    backpack: has("containergear", "backpk"),
                    tinderboxOnBody: a.items.some(
                        (it) =>
                            it.type === "miscgear" &&
                            scBase(it.system?.shortcode) === "tndrbx" &&
                            !it.system?.containerId,
                    ),
                };
            }).should((r) => {
                expect(r.broadsword, "has a Broadsword").to.be.true;
                expect(r.roundshield, "has a Roundshield").to.be.true;
                expect(r.tunicEquipped, "Leather Tunic equipped").to.be.true;
                expect(r.arcaneTalent, "has an Arcane Talent").to.be.true;
                expect(r.backpack, "has a Backpack").to.be.true;
                expect(r.tinderboxOnBody, "Tinderbox back on the person").to.be
                    .true;
            });
        });
    });
});
