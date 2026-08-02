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
 * Follow-up action buttons on the standard test result card (#853), end to end.
 *
 * `SuccessTestResult.toChat` can now carry arbitrary follow-up consent buttons —
 * the same shape the action-card framework posts — folded through the shared
 * `toRenderableButtons` normalizer. Here a real success-test result (the exact
 * production object from `successTest`) posts the standard card with a follow-up
 * button, and we assert the *real Foundry render* emits it with the well-known
 * `action-card-button` handles the dispatcher/gater read (`data-action` /
 * `data-handler-uuid` / `data-scope` / `data-skip-dialog`), alongside the
 * always-present edit pencil. Nothing auto-fires — the button is offered.
 */

describe("Standard test card — follow-up buttons (#853)", () => {
    before(() => cy.login().then(() => cy.cleanupWorld()));
    afterEach(() => cy.cleanupWorld());

    it("SuccessTestResult.toChat renders caller-supplied buttons with the shared action-card handles", () => {
        cy.importActor().then((actor) => {
            cy.createItemOn(actor, "skill", {
                name: "Sword",
                system: { shortcode: "swo", masteryLevelBase: 50 },
            }).then((skill) => {
                cy.prepare(actor);
                cy.foundry(async (win) => {
                    const a = win.game.actors.get(actor.id);
                    const s = a.items.get(skill.id);

                    // A real success-test result — the exact production type.
                    // (The action posts its own standard card asynchronously; we
                    // locate our card by its unique follow-up button, not by
                    // order/count, so that background card is irrelevant.)
                    const result = await s.logic.executeAction("successTest", {
                        skipDialog: true,
                        scope: {},
                    });

                    // Post the standard card carrying a follow-up consent button
                    // targeted to the actor (its owner may click it).
                    await result.toChat({
                        buttons: {
                            action: "followUpProbe",
                            handlerUuid: a.uuid,
                            scope: { probe: 42 },
                            label: "Follow Up",
                            iconFAClass: "fa-solid fa-star",
                        },
                    });

                    // toChat fires the speaker fire-and-forget (`void`), so the
                    // ChatMessage is created asynchronously — poll for the card
                    // carrying OUR button (found by its unique data-action).
                    const findOurButton = async () => {
                        for (let i = 0; i < 60; i++) {
                            for (const m of win.game.messages.contents) {
                                const div = win.document.createElement("div");
                                div.innerHTML = m.content;
                                const b = div.querySelector(
                                    'button.action-card-button[data-action="followUpProbe"]',
                                );
                                if (b) return { div, b };
                            }
                            await new Promise((r) => win.setTimeout(r, 50));
                        }
                        return null;
                    };
                    const found = await findOurButton();
                    if (!found) return { hasButton: false };
                    const { div, b: btn } = found;
                    return {
                        hasButton: true,
                        handlerUuid: btn.dataset.handlerUuid ?? null,
                        // Read back through dataset → browser un-escapes the
                        // attribute, so the round-tripped scope must parse.
                        scope: JSON.parse(btn.dataset.scope),
                        skipDialog: btn.dataset.skipDialog ?? null,
                        label: btn.textContent.trim(),
                        // The always-present edit pencil still renders on the
                        // same card. #856 gave it its own action
                        // (`resultEdit`); it is a GM-only control, and the e2e
                        // user is a GM, so it renders here.
                        hasEditPencil: !!div.querySelector(
                            '[data-action="resultEdit"]',
                        ),
                    };
                }).should((r) => {
                    expect(r.hasButton, "the follow-up button rendered").to.be
                        .true;
                    expect(
                        r.handlerUuid,
                        "targeted to the supplied handler",
                    ).to.eq(`Actor.${actor.id}`);
                    expect(
                        r.scope,
                        "scope survived JSON round-trip through the attribute",
                    ).to.deep.eq({ probe: 42 });
                    expect(r.skipDialog, "skipDialog defaulted to true").to.eq(
                        "true",
                    );
                    expect(r.label, "the label rendered").to.contain(
                        "Follow Up",
                    );
                    expect(r.hasEditPencil, "edit pencil still present").to.be
                        .true;
                });
            });
        });
    });
});
