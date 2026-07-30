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
 * `BeingLogic.resolveInjury` is the single entry point behind the sheet's Add
 * Injury action, the intrinsic action, and the combat cards' injury buttons. It
 * seeds its parameters from the action `scope`, derives the hit location (an
 * explicit `bodyLocationCode`, else Zone-Number + Zone-Die aiming — Target ZN
 * plus a `zoneDie` roll, defaulting to a whole-body draw), resolves the blow
 * through the pure `resolveInjury` pipeline, rolls the amputation Strength test
 * for a G5 edged
 * wound, posts the Resolve Injury card, and — for a wound of level ≥ 1 with
 * `autoAddInjury` — records a `trauma` item. Unless `skipDialog`, it first opens
 * the Resolve Injury dialog so a human can confirm/tune the parameters.
 *
 * These cases drive both the headless path (`skipDialog: true`) and the dialog
 * end to end (open → submit via `cy.submitDialog`) and assert the recorded
 * trauma. The pure resolution *math* — level bands (M1/S2/S3/G4/G5), shock index,
 * the glancing-blow rule, and bleeder/amputation flags — is exhaustively covered
 * by the unit suite (`tests/domain/body/InjuryResolution.test.ts`,
 * `tests/document/actor/injury-actions.test.ts`) and is asserted there.
 *
 * The combat case additionally dispatches the `resolveInjury` action through the
 * **document's** chat-card handler (`SohlActor.onChatCardButton` →
 * `dispatchChatCardAction` → `BeingLogic.resolveInjury`), exercising the
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

    it("resolveInjury records a trauma for a level ≥ 1 blow (headless)", () => {
        cy.importActor().then((actor) => {
            cy.prepare(actor);
            cy.foundry((win) => {
                const a = win.game.actors.get(actor.id);
                const loc =
                    a.logic.body.structure.getAllLocations()[0].shortcode;
                // Headless resolve (skipDialog) → no dialog opens. `schedule:
                // false` pre-answers the healing-check offer (issue #579) so the
                // flow stays dialog-free; `autoAddInjury` defaults from the world
                // "record trauma" setting (enable) → the wound is recorded.
                win.__injury = a.logic.resolveInjury({
                    skipDialog: true,
                    scope: {
                        bodyLocationCode: loc,
                        aspect: "blunt",
                        impact: 20,
                        schedule: false,
                    },
                });
                return null;
            });
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

    it("resolveInjury records no trauma for a level-0 blow (headless)", () => {
        cy.importActor().then((actor) => {
            cy.prepare(actor);
            cy.foundry((win) => {
                const a = win.game.actors.get(actor.id);
                const loc =
                    a.logic.body.structure.getAllLocations()[0].shortcode;
                // A zero-impact blow resolves to no injury (band: ≤0 → none):
                // the card posts but no trauma is recorded.
                win.__injury = a.logic.resolveInjury({
                    skipDialog: true,
                    scope: {
                        bodyLocationCode: loc,
                        aspect: "blunt",
                        impact: 0,
                        schedule: false,
                    },
                });
                return null;
            });
            cy.foundry((win) =>
                win.__injury.then(
                    () => win.game.actors.get(actor.id).itemTypes.trauma.length,
                ),
            ).should("eq", 0);
        });
    });

    it("Resolve Injury dialog records a trauma when submitted", () => {
        cy.importActor().then((actor) => {
            cy.prepare(actor);
            cy.foundry((win) => {
                const a = win.game.actors.get(actor.id);
                const loc =
                    a.logic.body.structure.getAllLocations()[0].shortcode;
                // Drive the real Resolve Injury dialog (skipDialog off). The
                // scope seeds its fields; `schedule: false` pre-answers the
                // healing-check offer so only the resolve dialog needs a click.
                win.__injury = a.logic.resolveInjury({
                    skipDialog: false,
                    scope: {
                        bodyLocationCode: loc,
                        aspect: "blunt",
                        impact: 20,
                        schedule: false,
                    },
                });
                return null;
            });
            cy.submitDialog("ok");
            cy.foundry((win) =>
                win.__injury.then(
                    () => win.game.actors.get(actor.id).itemTypes.trauma.length,
                ),
            ).should("eq", 1);
        });
    });

    it("combat injury button opens the Resolve Injury dialog and records on submit", () => {
        cy.importActor().then((actor) => {
            cy.prepare(actor);
            cy.foundry((win) => {
                const a = win.game.actors.get(actor.id);
                const structure = a.logic.body.structure;
                // Real body-part + location shortcodes (production forwards an
                // aimed part that exists; the action errors on an unknown one). A
                // non-amputable location keeps a G5 edged wound to the single
                // Resolve Injury dialog (no follow-up amputation prompt).
                const part = structure.parts[0].shortcode;
                const locs = structure.getAllLocations();
                const loc = (
                    locs.find((l) => l.amputability === "none") || locs[0]
                ).shortcode;
                // The combat injury button forwards impact/aspect + an aimed
                // zone (targetZoneNumber/zoneDie) as data-scope; here an explicit
                // location pins a non-amputable hit so the flow stays a single
                // Resolve Injury dialog. Under the unified action it opens that
                // dialog (a human confirms) rather than resolving silently.
                // `schedule: false` pre-answers the healing-check offer.
                const zn = structure.getPartByCode(part)?.zone.zoneNumbers[0];
                const btn = win.document.createElement("button");
                btn.dataset.action = "resolveInjury";
                btn.dataset.scope = JSON.stringify({
                    impact: 20,
                    aspect: "edged",
                    targetZoneNumber: zn,
                    zoneDie: 1,
                    location: loc,
                    schedule: false,
                });
                // Dispatch through the *document's* chat-card handler — the real
                // click path — exercising SohlActor.onChatCardButton →
                // dispatchChatCardAction → BeingLogic.resolveInjury (issue #572).
                win.__injury = a.onChatCardButton(btn);
                return null;
            });
            cy.submitDialog("ok");
            cy.foundry((win) =>
                win.__injury.then(
                    () => win.game.actors.get(actor.id).itemTypes.trauma.length,
                ),
            ).should("eq", 1);
        });
    });

    // RED — blocked by #186: the attacker's landing (non-counterstrike) blow
    // should emit a resolveInjury button, but buildCombatCardData hard-codes
    // `hasAttackInjury: false` (SohlCombatantLogic.ts:1501,1563) — only the
    // defend-side injury fields are live.
    it.skip("attacker's landing blow emits an injury button (#186)", () => {});
});
