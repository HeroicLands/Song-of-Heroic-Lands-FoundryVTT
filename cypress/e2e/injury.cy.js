/*
 * This file is part of the Song of Heroic Lands (SoHL) system for Foundry VTT.
 * Copyright (c) 2024-2026 Tom Rodriguez ("Toasty") — <toasty@heroiclands.com>
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
 * The intended flow: the Add Injury dialog (`BeingLogic.addInjuryViaDialog`, from
 * the sheet's `addInjury` action or the assisted-combat `createInjury` path)
 * resolves a blow through the pure `resolveInjury` pipeline and records a `trauma`
 * item for a wound of level ≥ 1.
 *
 * **State today (verified against the live container):** the *creation* flow is
 * broken end-to-end and is RED, blocked by newly-filed bugs:
 *
 * - #268 — `getActorBodyStructure(this)` in `addInjuryViaDialog`/`onCreateInjury`
 *   receives the `BeingLogic` (which has no `itemTypes`), so it returns
 *   `undefined` and the flow aborts; and `BeingSheet._onAddInjury` calls
 *   `this.document.addInjuryViaDialog()`, which the actor does not define.
 * - #267 — the resulting "no body structure" `uiWarn` hits `SohlLogger.uiWarn`'s
 *   infinite recursion (stack overflow), crashing the tab.
 *
 * The pure resolution *math* — level bands (M1/S2/S3/G4/G5), shock index, the
 * glancing-blow rule, and bleeder/amputation flags — is exhaustively covered by
 * the unit suite (`tests/domain/body/InjuryResolution.test.ts`,
 * `tests/document/actor/injury-actions.test.ts`) and is not reachable from the
 * client, so it is asserted there rather than re-driven here.
 */

describe("impact → injury → trauma", () => {
    before(() => cy.login().then(() => cy.cleanupWorld()));
    beforeEach(() => cy.closeAllSheets());
    afterEach(() => cy.cleanupWorld());

    // The precondition the whole injury pipeline targets: the being's lineage
    // supplies a body structure with defined hit locations. (The resolution that
    // consumes it is RED below.)
    it("the being's lineage exposes a body structure with hit locations", () => {
        cy.importActor().then((actor) => {
            cy.prepare(actor);
            cy.foundry((win) => {
                const body = win.game.actors.get(actor.id).itemTypes.lineage[0]
                    .logic.bodyStructure;
                const locations = body?.getAllLocations?.() ?? [];
                return {
                    hasBody: !!body,
                    nLocations: locations.length,
                    hasShortcodes: locations.every((l) => !!l.shortcode),
                };
            }).should((r) => {
                expect(r.hasBody, "lineage exposes a body structure").to.be
                    .true;
                expect(r.nLocations, "hit locations defined").to.be.greaterThan(
                    0,
                );
                expect(r.hasShortcodes, "each location has a shortcode").to.be
                    .true;
            });
        });
    });

    // RED — blocked by #268 (Add Injury flow broken) + #267 (uiWarn recursion):
    // addInjuryViaDialog resolves the body via getActorBodyStructure(this), where
    // `this` is the BeingLogic (no `itemTypes`) → undefined → the flow warns and
    // aborts, and the warn hits the uiWarn stack overflow. Un-skip and assert a
    // level-≥1 blow records exactly one trauma once #268/#267 land.
    it.skip("Add Injury dialog records a trauma for a level ≥ 1 blow (#268, #267)", () => {});

    // RED — blocked by #268/#267: a level-0 (no-injury / glancing) blow should
    // post the injury card but record no trauma.
    it.skip("Add Injury dialog records no trauma for a level-0 blow (#268, #267)", () => {});

    // RED — blocked by #268/#267: an aimed landed blow (targetPart + spread)
    // should resolve automatically (no dialog) and record a trauma.
    it.skip("automated aimed blow records a trauma with no dialog (#268, #267)", () => {});

    // RED — blocked by #186: the attacker's landing (non-counterstrike) blow
    // should emit a createInjury button, but buildCombatCardData hard-codes
    // `hasAttackInjury: false` (SohlCombatantLogic.ts:1501,1563) — only the
    // defend-side injury fields are live.
    it.skip("attacker's landing blow emits an injury button (#186)", () => {});
});
