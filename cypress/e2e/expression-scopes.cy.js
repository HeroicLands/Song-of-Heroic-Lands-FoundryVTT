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
 * Expression scopes (#1142) — every SafeExpression call site declares the
 * identifiers legal there, and that one declaration drives validation, the
 * editor, and the docs.
 *
 * The live client is what proves the two ends actually meet: that a schema
 * field's declared scope reaches the editor, and that an action's `visible`
 * expression is evaluated against a context matching its scope. The unit suite
 * covers the grammar and the registry.
 *
 * Also covers #1090, the defect that motivated the scope work: `shockReTest`
 * binds `actorLogic`, which the action-visible scope did not supply, so the
 * action was hidden in every state.
 */

/** Shock states, mirroring `SHOCK_STATE` (the visible expression uses 2 / 3). */
const SHOCK = { NONE: 0, STUNNED: 1, INCAPACITATED: 2, UNCONSCIOUS: 3 };

/** Whether the being currently offers `shockReTest` among its context options. */
function offersShockReTest(actorId) {
    return cy.foundry((win) => {
        const actor = win.game.actors.get(actorId);
        // `getContextOptions` runs each action's real `visible` predicate. The
        // sheet element is the natural target; the actor's own sheet may not be
        // rendered, so a bare element stands in for the menu's DOM anchor —
        // which is exactly the case #1090 broke (no `data-actor-id` ancestor).
        const target = win.document.createElement("div");
        return actor.logic
            .getContextOptions()
            .filter((entry) => entry.condition(target))
            .map((entry) => entry.name);
    });
}

describe("expression scopes — action visibility (#1142, #1090)", () => {
    before(() => cy.login().then(() => cy.cleanupWorld()));
    afterEach(() => cy.cleanupWorld());

    it("offers Shock Re-Test when Incapacitated", () => {
        cy.createActor("being", { name: "scope-incap" }).then((actor) => {
            cy.foundry(async (win) => {
                await win.game.actors
                    .get(actor.id)
                    .logic.setShockState(SHOCK.INCAPACITATED);
                return null;
            });
            offersShockReTest(actor.id).should(
                "include",
                "SOHL.Being.Action.shockReTest",
            );
        });
    });

    it("offers Shock Re-Test when Unconscious", () => {
        cy.createActor("being", { name: "scope-unconscious" }).then((actor) => {
            cy.foundry(async (win) => {
                await win.game.actors
                    .get(actor.id)
                    .logic.setShockState(SHOCK.UNCONSCIOUS);
                return null;
            });
            offersShockReTest(actor.id).should(
                "include",
                "SOHL.Being.Action.shockReTest",
            );
        });
    });

    it("does not offer Shock Re-Test in any other state", () => {
        cy.createActor("being", { name: "scope-none" }).then((actor) => {
            // Unshocked.
            offersShockReTest(actor.id).should(
                "not.include",
                "SOHL.Being.Action.shockReTest",
            );
            cy.foundry(async (win) => {
                await win.game.actors
                    .get(actor.id)
                    .logic.setShockState(SHOCK.STUNNED);
                return null;
            });
            offersShockReTest(actor.id).should(
                "not.include",
                "SOHL.Being.Action.shockReTest",
            );
        });
    });

    it("logs no visibility-expression warning while evaluating actions", () => {
        cy.createActor("being", { name: "scope-quiet" }).then((actor) => {
            cy.foundry((win) => {
                win.__scopeWarnings = [];
                win.__scopeWarnOriginal = win.sohl.log.warn;
                win.sohl.log.warn = (...args) => {
                    win.__scopeWarnings.push(String(args[0]));
                    return win.__scopeWarnOriginal.apply(win.sohl.log, args);
                };
                return null;
            });
            offersShockReTest(actor.id);
            cy.foundry((win) => {
                const warnings = win.__scopeWarnings.filter((message) =>
                    /visibility expression|scope .* does not match/i.test(
                        message,
                    ),
                );
                win.sohl.log.warn = win.__scopeWarnOriginal;
                return warnings;
            }).should("deep.eq", []);
        });
    });
});

describe("expression scopes — the editor is driven by the schema (#1142)", () => {
    before(() => cy.login().then(() => cy.cleanupWorld()));
    afterEach(() => {
        // testIsolation is off: an open modal editor would cover the next test.
        cy.foundry((win) => {
            for (const app of Array.from(
                win.foundry.applications.instances.values(),
            )) {
                if (app.rendered) app.close();
            }
            return null;
        });
        cy.cleanupWorld();
    });

    /** Open a fresh skill's Properties tab. */
    function openSkillProperties() {
        return cy
            .createWorldItem("skill", {
                name: "Scoped Skill",
                system: { subType: "lore" },
            })
            .then((skill) => {
                cy.openSheet(skill);
                cy.switchTab("properties", "sheet");
                return cy.wrap(skill);
            });
    }

    it("carries the field's declared scope on the edit control", () => {
        // The scope reaches the sheet from `SkillDataModel`'s field, not from a
        // hand-typed template attribute.
        openSkillProperties().then(() => {
            cy.get(
                'button[data-action="editExpression"][data-field-path="system.skillBaseFormula"]',
            ).should("have.attr", "data-expr-scope", "skill.base");
        });
    });

    it("rejects an out-of-scope identifier while typing, disabling Save", () => {
        openSkillProperties().then(() => {
            cy.get('button[data-action="editExpression"]').click();
            cy.get(".expression-editor .cm-editor").should("exist");
            cy.foundry((win) => {
                const node = win.document.querySelector(
                    ".expression-editor [data-editor]",
                );
                // Grammatically valid, but `strength` is not bound by skill.base.
                node._expressionEditor.setValue("strength + 1");
                return node._expressionEditor.getValue();
            }).should("eq", "strength + 1");
            cy.get(".expression-editor__status")
                .should("have.class", "is-error")
                .and("contain.text", "strength");
            cy.get('button[data-action="save"]').should("be.disabled");
        });
    });

    it("accepts the scope's declared identifier", () => {
        openSkillProperties().then(() => {
            cy.get('button[data-action="editExpression"]').click();
            cy.get(".expression-editor .cm-editor").should("exist");
            cy.foundry((win) => {
                const node = win.document.querySelector(
                    ".expression-editor [data-editor]",
                );
                node._expressionEditor.setValue("sb(attr.str, attr.dex)");
                return null;
            });
            cy.get(".expression-editor__status").should(
                "have.class",
                "is-valid",
            );
            cy.get('button[data-action="save"]').should("not.be.disabled");
        });
    });
});
