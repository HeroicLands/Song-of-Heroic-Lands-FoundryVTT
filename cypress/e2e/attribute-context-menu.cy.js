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
 * Attribute context menu on the Being Profile tab.
 *
 * Two regressions, both reported together:
 *
 *  - #924 — opening a card's ⋮ context menu used to force `position: relative`
 *    onto the trigger element (a leftover in `SohlContextMenu._setPosition`),
 *    dropping the absolutely-positioned corner ⋮ back into flow and shifting the
 *    card's text. Nothing cleared the inline style on close, so the shift was
 *    permanent. The menu is positioned within the `.application` container, so
 *    the trigger's own position must be left untouched.
 *
 *  - #925 — every attribute has a Target Level (its mastery level, score × 5)
 *    and must be rollable as a Success Test against it, exactly like a skill.
 *    The `successTest` intrinsic action was missing from `AttributeLogic`.
 */
describe("attribute context menu (#924, #925)", () => {
    before(() => cy.login().then(() => cy.cleanupWorld()));
    afterEach(() => cy.cleanupWorld());

    it("exposes a visible successTest action on every attribute (#925)", () => {
        cy.importActor().then((actor) => {
            cy.foundry((win) => {
                const a = win.game.actors.get(actor.id);
                const attrs = a.items.filter((i) => i.type === "attribute");
                return {
                    count: attrs.length,
                    allHave: attrs.every((attr) =>
                        attr.logic.actions.has("successTest"),
                    ),
                    allVisible: attrs.every((attr) => {
                        const action = attr.logic.actions.get("successTest");
                        // The trigger row carries the attribute's id, the way
                        // the rendered card does (data-item-id on .item).
                        const el = {
                            closest: (sel) =>
                                sel === "[data-item-id]" ?
                                    { dataset: { itemId: attr.id } }
                                : sel === "[data-actor-id]" ?
                                    { dataset: { actorId: a.id } }
                                :   null,
                        };
                        return !!action && action.visible(el);
                    }),
                };
            }).should((s) => {
                expect(s.count, "actor has attributes").to.be.greaterThan(0);
                expect(s.allHave, "every attribute has successTest").to.be.true;
                expect(s.allVisible, "successTest is visible").to.be.true;
            });
        });
    });

    it("runs a success test against the attribute's mastery level (#925)", () => {
        cy.importActor().then((actor) => {
            // prepare() resolves the actor's speaker (owner) so the success test
            // is allowed to roll — see the ownership guard in
            // SuccessTestResult.evaluate.
            cy.prepare(actor);
            cy.foundry((win) => {
                const a = win.game.actors.get(actor.id);
                const attr = a.items.find((i) => i.type === "attribute");
                // The mastery level the test rolls against is the "TL" shown on
                // the card: effective score × 5.
                return attr.logic
                    .executeAction("successTest", {
                        skipDialog: true,
                        scope: {},
                    })
                    .then((res) => ({
                        ml: attr.logic.masteryLevel.effective,
                        // executeAction returns the real SuccessTestResult; its
                        // testType names the attribute's success test.
                        ctorName: res?.constructor?.name ?? null,
                        hasResult: !!res,
                    }));
            }).should((s) => {
                expect(s.ml, "mastery level = score × 5").to.be.greaterThan(0);
                expect(s.hasResult, "successTest produced a result").to.be.true;
                expect(s.ctorName, "result is a SuccessTestResult").to.eq(
                    "SuccessTestResult",
                );
            });
        });
    });

    it("leaves the corner ⋮ trigger and card layout untouched when the menu opens (#924)", () => {
        cy.importActor().then((actor) => {
            cy.openSheet(actor);
            cy.switchTab("profile", "primary");

            const triggerSel =
                'section.tab[data-tab="profile"] .attribute-score .item-contextmenu';

            // Record the trigger's position *relative to its card* (its
            // offsetParent, the position:relative `.attribute-score`). Unlike a
            // viewport rect, these offsets are immune to Cypress auto-scrolling
            // the element into view before the click.
            cy.get(triggerSel)
                .first()
                .then(($t) => {
                    const el = $t[0];
                    const before = { top: el.offsetTop, left: el.offsetLeft };

                    cy.wrap($t).click();

                    // The menu is open: the trigger must not have gained an
                    // inline position override, must stay absolutely positioned,
                    // and must not have moved within its card.
                    cy.wrap($t).should(($el) => {
                        const t = $el[0];
                        expect(
                            t.style.position,
                            "no inline position forced on the trigger",
                        ).to.equal("");
                        expect(
                            getComputedStyle(t).position,
                            "trigger stays absolutely positioned",
                        ).to.equal("absolute");
                        expect(
                            t.offsetTop,
                            "trigger's top within its card unchanged",
                        ).to.be.closeTo(before.top, 1);
                        expect(
                            t.offsetLeft,
                            "trigger's left within its card unchanged",
                        ).to.be.closeTo(before.left, 1);
                    });

                    // Close the menu (Escape) and confirm the layout still holds.
                    cy.get("body").type("{esc}");
                    cy.wrap($t).should(($el) => {
                        const t = $el[0];
                        expect(t.style.position).to.equal("");
                        expect(t.offsetTop).to.be.closeTo(before.top, 1);
                        expect(t.offsetLeft).to.be.closeTo(before.left, 1);
                    });
                });
        });
    });
});
