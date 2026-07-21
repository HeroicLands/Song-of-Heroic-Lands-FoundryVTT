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
 * Impact → injury → trauma.
 *
 * `BeingLogic.addInjuryViaDialog` (the sheet's `addInjury` action and the
 * assisted-combat `createInjury` path) opens the Add Injury dialog, resolves the
 * blow through the pure `resolveInjury` pipeline, posts an injury card, and — for
 * a wound of level ≥ 1 with "add to character sheet" — records a `trauma` item.
 * The automated combat path (`onCreateInjury` with an aimed `targetPart` +
 * `spread`) resolves and records with no dialog.
 *
 * These cases drive the dialog end to end (open → submit via `cy.submitDialog`)
 * and assert the recorded trauma. The pure resolution *math* — level bands
 * (M1/S2/S3/G4/G5), shock index, the glancing-blow rule, and bleeder/amputation
 * flags — is exhaustively covered by the unit suite
 * (`tests/domain/body/InjuryResolution.test.ts`,
 * `tests/document/actor/injury-actions.test.ts`) and is asserted there.
 *
 * The automated case additionally dispatches the `createInjury` action through
 * the **document's** chat-card handler (`SohlActor.onChatCardButton` →
 * `dispatchChatCardAction` → `BeingLogic.createInjury`), exercising the
 * actor-addressed chat-card dispatch path (issue #572).
 */

describe("impact → injury → trauma", () => {
    before(() => cy.login().then(() => cy.cleanupWorld()));
    beforeEach(() => {
        cy.closeAllSheets();
        // closeAllSheets skips DialogV2s (no `.document`); close any lingering
        // dialog so a prior test's window can't shadow this test's.
        cy.foundry(async (win) => {
            for (const app of Array.from(
                win.foundry.applications.instances.values(),
            )) {
                if (/dialog/i.test(app.constructor.name)) {
                    try {
                        await app.close({ animate: false });
                    } catch {
                        /* already closing */
                    }
                }
            }
            return true;
        });
    });
    afterEach(() => cy.cleanupWorld());

    // The precondition the whole injury pipeline targets: the being's body
    // supplies a body structure with defined hit locations.
    it("the being's body exposes a body structure with hit locations", () => {
        cy.importActor().then((actor) => {
            cy.prepare(actor);
            cy.foundry((win) => {
                const body = win.game.actors.get(actor.id).logic.body.structure;
                const locations = body?.getAllLocations?.() ?? [];
                return {
                    hasBody: !!body,
                    nLocations: locations.length,
                    hasShortcodes: locations.every((l) => !!l.shortcode),
                };
            }).should((r) => {
                expect(r.hasBody, "body exposes a body structure").to.be.true;
                expect(r.nLocations, "hit locations defined").to.be.greaterThan(
                    0,
                );
                expect(r.hasShortcodes, "each location has a shortcode").to.be
                    .true;
            });
        });
    });

    it("Add Injury dialog records a trauma for a level ≥ 1 blow", () => {
        cy.importActor().then((actor) => {
            cy.prepare(actor);
            cy.foundry((win) => {
                const a = win.game.actors.get(actor.id);
                const loc =
                    a.logic.body.structure.getAllLocations()[0].shortcode;
                // Fire the dialog and stash its promise so we can await the whole
                // flow (dialog → resolve → post card → record trauma).
                win.__injury = a.logic.addInjuryViaDialog({
                    location: loc,
                    aspect: "blunt",
                    impact: 20,
                });
                return null;
            });
            cy.submitDialog("ok");
            cy.foundry((win) =>
                win.__injury.then(() =>
                    win.game.actors
                        .get(actor.id)
                        .itemTypes.trauma.map((t) => t.name),
                ),
            ).should((names) => {
                expect(names, "one trauma recorded").to.have.length(1);
            });
        });
    });

    it("Add Injury dialog records no trauma for a level-0 blow", () => {
        cy.importActor().then((actor) => {
            cy.prepare(actor);
            cy.foundry((win) => {
                const a = win.game.actors.get(actor.id);
                const loc =
                    a.logic.body.structure.getAllLocations()[0].shortcode;
                // A zero-impact blow resolves to no injury (band: ≤0 → none):
                // the card posts but no trauma is recorded.
                win.__injury = a.logic.addInjuryViaDialog({
                    location: loc,
                    aspect: "blunt",
                    impact: 0,
                });
                return null;
            });
            cy.submitDialog("ok");
            cy.foundry((win) =>
                win.__injury.then(
                    () => win.game.actors.get(actor.id).itemTypes.trauma.length,
                ),
            ).should("eq", 0);
        });
    });

    it("automated aimed blow records a trauma with no dialog (via actor chat-card dispatch)", () => {
        cy.importActor().then((actor) => {
            cy.prepare(actor);
            cy.foundry((win) => {
                const a = win.game.actors.get(actor.id);
                const loc =
                    a.logic.body.structure.getAllLocations()[0].shortcode;
                // An aimed request (targetPart + spread) resolves automatically;
                // the explicit location override keeps it deterministic (no
                // scatter roll). The createInjury button carries it as data-scope.
                const btn = win.document.createElement("button");
                btn.dataset.action = "createInjury";
                btn.dataset.scope = JSON.stringify({
                    impact: 20,
                    aspect: "edged",
                    targetPart: "head",
                    spread: 0,
                    location: loc,
                });
                // Dispatch through the *document's* chat-card handler — the real
                // click path — exercising SohlActor.onChatCardButton →
                // dispatchChatCardAction → BeingLogic.createInjury (issue #572).
                return a.onChatCardButton(btn).then(() => ({
                    dialogs: Array.from(
                        win.foundry.applications.instances.values(),
                    ).filter((x) => /dialog/i.test(x.constructor.name)).length,
                    traumaCount: a.itemTypes.trauma.length,
                }));
            }).should((r) => {
                expect(r.dialogs, "no dialog opened").to.eq(0);
                expect(r.traumaCount, "one trauma recorded").to.eq(1);
            });
        });
    });

    // RED — blocked by #186: the attacker's landing (non-counterstrike) blow
    // should emit a createInjury button, but buildCombatCardData hard-codes
    // `hasAttackInjury: false` (SohlCombatantLogic.ts:1501,1563) — only the
    // defend-side injury fields are live.
    it.skip("attacker's landing blow emits an injury button (#186)", () => {});
});
