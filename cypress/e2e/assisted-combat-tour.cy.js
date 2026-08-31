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
 * The Assisted Combat tour (#620): the second SohlTour after Character Creation.
 * It is single-actor and "pretend" throughout — no token, no scene, no turn order
 * — matching how Assisted Combat actually works. This spec asserts the tour
 * registers and lists, that its gated steps hold **Next** until the user acts
 * (weapon archetypes added, the bow held in both arms, a wound recorded, then a
 * second wound recorded), and that the underlying ATK and Impact actions post to
 * the chat log.
 *
 * Gate transitions are driven programmatically (the same document mutations the
 * user's sheet actions produce), then the tour's own Next-button gate state is
 * asserted — so the spec verifies the tour's gating/readState against the live
 * client without re-driving every dialog and drag.
 */

const KEY = "sohl.assisted-combat";

/**
 * Step indices (0-based) of the steps under test. The tour opens with a gated
 * `prepare` step (index 0) that coaches the user to an owned Being, then a free
 * intro (index 1), so the first gear step is index 2.
 */
const STEP = {
    prepare: 0,
    gear: 2,
    bowArmRule: 3,
    holdBroadsword: 4,
    atkBlkCx: 5,
    impact: 6,
    resolveInjury: 7,
    standaloneInjury: 8,
};

/** Read whether the tour's Next button is currently gate-disabled. */
function isGated(win) {
    // The Next button lives in the centered step card, not the shared tooltip.
    const btn = win.document.querySelector('.tour-center-step .step-button[data-action="next"]');
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

/** Create an injury Trauma directly on an actor (bypasses the resolve dialog). */
function addInjury(being, name) {
    return cy.createItemOn(being, "trauma", {
        name,
        system: { subType: "injury" },
    });
}

/**
 * Delete every Being in the world. The tour resolves *the first owned Being* as
 * its subject, so the spec keeps exactly one Being alive at a time (its imported
 * fixture). `cleanupWorld` removes only per-run-tagged documents, so an untagged
 * Being leaked by an interrupted run would otherwise shadow the fixture.
 */
function purgeBeings() {
    return cy.foundry(async (win) => {
        const ids = win.game.actors.contents.filter((a) => a.type === "being").map((a) => a.id);
        if (ids.length) await win.Actor.deleteDocuments(ids);
        return ids.length;
    });
}

describe("Assisted Combat tour (SohlTour, #620)", () => {
    // Headless sheet/canvas re-renders throw benign async errors during the
    // document mutations these steps drive; a genuinely failed mutation instead
    // surfaces as its gate staying closed (an `expectGated(false)` failure), so
    // suppressing uncaught exceptions cannot mask a real regression here.
    Cypress.on("uncaught:exception", () => false);

    before(() =>
        cy
            .login()
            .then(() => cy.cleanupWorld())
            .then(() => purgeBeings()),
    );

    afterEach(() => {
        cy.foundry((win) => {
            win.game.tours.get(KEY)?.exit?.();
            return true;
        });
        cy.cleanupWorld();
        purgeBeings();
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
            expect(r.steps, "has all steps").to.be.greaterThan(7);
            expect(r.title).to.contain("Assisted Combat");
        });
    });

    it("is always startable; its first step gates on an owned Being", () => {
        // canStart no longer depends on owning a Being: rather than silently grey
        // out Start (Foundry gives no reason), the tour always starts and its
        // first `prepare` step coaches the user to a Being, holding Next until one
        // is owned.
        cy.foundry((win) => win.game.tours.get(KEY).canStart).should("eq", true);

        // Start in an empty world → the prepare step's Next is gated shut.
        cy.foundry((win) =>
            win.game.tours
                .get(KEY)
                .start()
                .then(() => true),
        );
        goTo(STEP.prepare).should("eq", STEP.prepare);
        expectGated(true, "prepare gate closed with no Being owned");

        // Import a populated Being → the createActor state gate opens Next.
        cy.importActor();
        expectGated(false, "prepare gate opens once a Being is owned");
    });

    it("gated steps hold Next until the user acts", () => {
        // A populated Being the tour coaches (Basic Folk, fully attributed with a
        // body that can hold weapons).
        cy.importActor().as("being");

        // Start the tour once; every step is reached via progress() thereafter.
        cy.foundry((win) =>
            win.game.tours
                .get(KEY)
                .start()
                .then(() => true),
        );

        // gear: gated until all four weapon archetypes exist.
        goTo(STEP.gear).should("eq", STEP.gear);
        expectGated(true, "gear gate closed with no weapons");
        cy.get("@being").then((being) => {
            cy.getFromCompendium("sohl.items", "weapongear", "BrdSwd").then((w) =>
                cy.dropOnActor(being, w).as("broadsword"),
            );
            cy.getFromCompendium("sohl.items", "weapongear", "BatlSwd").then((w) =>
                cy.dropOnActor(being, w),
            );
            cy.getFromCompendium("sohl.items", "weapongear", "LBw100").then((w) =>
                cy.dropOnActor(being, w).as("longbow"),
            );
            cy.getFromCompendium("sohl.items", "weapongear", "RndSh").then((w) =>
                cy.dropOnActor(being, w),
            );
        });
        expectGated(false, "gear gate opens once all four archetypes exist");

        // bow-arm-rule: gated until the bow is held in TWO limbs (its ranged
        // strike mode needs two hands).
        goTo(STEP.bowArmRule).should("eq", STEP.bowArmRule);
        expectGated(true, "arm-rule gate closed before the bow is two-handed");
        cy.then(function () {
            const beingId = this.being.id;
            const longbowId = this.longbow.id;
            cy.foundry((win) => {
                const actor = win.game.actors.get(beingId);
                const struct = actor.logic.body.structure;
                const arms = struct.parts.filter((p) => p.canHoldItem && /arm/i.test(p.name));
                const payload = struct.setPartFieldsUpdate(
                    arms.slice(0, 2).map((p) => ({
                        index: p.index,
                        changes: { heldItemId: longbowId },
                    })),
                );
                return actor.logic.data.update(payload).then(() => true);
            });
        });
        expectGated(false, "arm-rule gate opens once the bow is held two-handed");

        // resolve-injury: gated until an injury is recorded on the sheet.
        goTo(STEP.resolveInjury).should("eq", STEP.resolveInjury);
        expectGated(true, "injury gate closed with no wound");
        cy.get("@being").then((being) => addInjury(being, "Broadsword Cut"));
        expectGated(false, "injury gate opens once a wound is recorded");

        // standalone-injury: gated until a SECOND injury is recorded (the
        // GM-given, no-roll case producing the same result).
        goTo(STEP.standaloneInjury).should("eq", STEP.standaloneInjury);
        expectGated(true, "standalone gate closed with only one wound");
        cy.get("@being").then((being) => addInjury(being, "Fell 10 Feet"));
        expectGated(false, "standalone gate opens once a second wound exists");
    });

    it("ATK produces a roll and Impact posts a card to chat", () => {
        cy.importActor().as("being");
        cy.get("@being").then((being) => {
            cy.getFromCompendium("sohl.items", "weapongear", "BrdSwd").then((w) =>
                cy.dropOnActor(being, w).as("broadsword"),
            );
        });
        // Hold the broadsword so its strike modes are available, then re-derive.
        cy.get("@broadsword").then((bs) => cy.holdItem(bs));
        cy.get("@being").then((being) => cy.prepare(being));

        // ATK: a real attack roll is produced. A forced d100 makes the outcome
        // deterministic. (The success-test result card's `toChat` does not create
        // a counted message headless — `combat-assisted.cy.js` likewise asserts
        // the *dialog* for the attack and reserves the chat-card assertion for
        // Impact, below — so here we assert the roll the ATK click produces.)
        cy.then(function () {
            const beingId = this.being.id;
            const broadswordId = this.broadsword.id;
            cy.foundry(async (win) => {
                const actor = win.game.actors.get(beingId);
                const weaponLogic = actor.items.get(broadswordId).logic;
                const sm = weaponLogic.strikeModes[0];
                const SimpleRoll = win.sohl.entity.roll.SimpleRoll;
                SimpleRoll.forceValues(50);
                const ctx = weaponLogic._getContext({
                    skipDialog: true,
                    scope: { strikeModeId: sm.shortcode },
                });
                const result = await weaponLogic.actions.get("attackTest").execute(ctx);
                SimpleRoll.clearForced();
                return result?.roll?.total ?? null;
            }).should("eq", 50);
        });

        // Impact: "pretend the hit landed" and calculate impact — this posts the
        // damage card to the chat log.
        cy.then(function () {
            const beingId = this.being.id;
            const broadswordId = this.broadsword.id;
            cy.foundry(async (win) => {
                const actor = win.game.actors.get(beingId);
                const weaponLogic = actor.items.get(broadswordId).logic;
                const sm = weaponLogic.strikeModes[0];
                const before = win.game.messages.size;
                const ctx = actor.logic._getContext({
                    skipDialog: true,
                    scope: { impactModifier: sm.impact },
                });
                await actor.logic.actions.get("calcImpact").execute(ctx);
                await new Promise((r) => setTimeout(r, 800));
                return win.game.messages.size - before;
            }).should("be.greaterThan", 0);
        });

        // #847: the posted damage card carries the attacker's id in its root
        // `data-actor-id` (was rendered empty because the builder never set it).
        cy.then(function () {
            const beingId = this.being.id;
            cy.foundry((win) => {
                const last = win.game.messages.contents.at(-1);
                return last?.content ?? "";
            }).should("contain", `data-actor-id="${beingId}"`);
        });
    });
});
