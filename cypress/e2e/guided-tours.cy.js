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
 * The guided-tour framework (#613): the SohlTour demo tour registers, its
 * `canStart` gates on an owned Being, and its value- and action-gated steps hold
 * **Next** disabled until the user acts — driven against the live client.
 *
 * The steps are driven through the tour's own `targetElement` (the element it is
 * highlighting) so the assertions never depend on *which* Being the demo tour
 * happened to open.
 */

const TOUR_KEY = "sohl.framework-demo";

/** Read the current gate state of the tour's Next button. */
function gateState(win) {
    const tour = win.game.tours.get(TOUR_KEY);
    const btn = win.game.tooltip?.tooltip?.querySelector(
        '.step-button[data-action="next"]',
    );
    return {
        stepIndex: tour?.stepIndex ?? null,
        hasButton: !!btn,
        gated: !!btn && btn.classList.contains("sohl-tour-gate-disabled"),
    };
}

/** Delete every Being actor so `canStart`/`firstOwnedBeing` are deterministic. */
function deleteAllBeings(win) {
    const ids = win.game.actors.contents
        .filter((a) => a.type === "being")
        .map((a) => a.id);
    return win.Actor.deleteDocuments(ids).then(() => ids.length);
}

describe("guided-tour framework (SohlTour)", () => {
    before(() => cy.login().then(() => cy.cleanupWorld()));

    afterEach(() => {
        // Ensure no tour stays active across tests, then clean the world.
        cy.foundry((win) => {
            win.game.tours.get(TOUR_KEY)?.exit?.();
            return true;
        });
        cy.cleanupWorld();
    });

    it("registers the demo tour in Tour Management", () => {
        cy.foundry((win) => {
            const tour = win.game.tours.get(TOUR_KEY);
            return {
                exists: !!tour,
                display: !!tour?.config?.display,
                steps: tour?.config?.steps?.length ?? 0,
                title: tour?.title ?? "",
            };
        }).should((r) => {
            expect(r.exists, "tour registered").to.be.true;
            expect(r.display, "listed in Tour Management").to.be.true;
            expect(r.steps, "has all five steps").to.eq(5);
            expect(r.title).to.contain("Framework Demo");
        });
    });

    it("canStart gates on owning a Being actor", () => {
        // No Being at all → not startable.
        cy.foundry(deleteAllBeings);
        cy.foundry((win) => win.game.tours.get(TOUR_KEY).canStart).should(
            "eq",
            false,
        );
        // Import a Basic Folk (a Being) → now startable.
        cy.importActor();
        cy.foundry((win) => win.game.tours.get(TOUR_KEY).canStart).should(
            "eq",
            true,
        );
    });

    it("value- and action-gated steps hold Next until the user acts", () => {
        cy.importActor();

        // Start the tour and jump to the value-gate step (index 2). Its
        // navigation opens a Being sheet on the Skills tab.
        cy.foundry(async (win) => {
            const tour = win.game.tours.get(TOUR_KEY);
            await tour.start();
            await tour.progress(2);
            return tour.stepIndex;
        }).should("eq", 2);

        // The search field is empty → the value gate is unsatisfied → Next is
        // disabled. (The highlighted target IS the search input.)
        cy.window().should((win) => {
            const s = gateState(win);
            expect(s.stepIndex, "at value-gate step").to.eq(2);
            expect(s.hasButton, "Next button rendered").to.be.true;
            expect(s.gated, "Next disabled while search empty").to.be.true;
        });

        // Type into the (transient) skills search box → the gate is satisfied.
        cy.foundry((win) => {
            const el = win.game.tours.get(TOUR_KEY).targetElement;
            el.value = "dagger";
            el.dispatchEvent(new win.Event("input", { bubbles: true }));
            return true;
        });
        cy.window().should((win) => {
            expect(gateState(win).gated, "Next enabled after typing").to.be
                .false;
        });

        // Click the real tooltip Next button → advances to the action-gate step.
        cy.foundry((win) => {
            win.game.tooltip.tooltip
                .querySelector('.step-button[data-action="next"]')
                .click();
            return true;
        });
        cy.window().should((win) => {
            expect(gateState(win).stepIndex, "advanced to action-gate").to.eq(
                3,
            );
        });

        // The action gate wants the Combat tab active; the sheet is still on
        // Skills → Next disabled.
        cy.window().should((win) => {
            expect(gateState(win).gated, "Next disabled before combat tab").to
                .be.true;
        });

        // The user switches to the Combat tab themselves (the highlighted tab
        // control) → the sheet re-renders, the highlight re-anchors, and the
        // gate passes.
        cy.foundry((win) => {
            win.game.tours.get(TOUR_KEY).targetElement.click();
            return true;
        });
        cy.window().should((win) => {
            expect(gateState(win).gated, "Next enabled after combat tab").to.be
                .false;
        });

        // Finish: Next → the free wrap-up step (index 4).
        cy.foundry((win) => {
            win.game.tooltip.tooltip
                .querySelector('.step-button[data-action="next"]')
                .click();
            return true;
        });
        cy.window().should((win) => {
            expect(gateState(win).stepIndex, "reached wrap-up step").to.eq(4);
        });
    });
});
