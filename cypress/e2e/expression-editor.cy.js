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
 * SafeExpression editor (Phase 1) — the code-editor popup for formula fields,
 * piloted on the Skill sheet's Skill Base field (#1031).
 *
 * Drives the real seam: the edit button opens the editor dialog; live validation
 * against the SafeExpression grammar toggles the status line and the Save button's
 * enabled state; Save persists the expression to `system.skillBaseFormula`.
 */

/** Set the open editor's textarea value and fire the live-revalidate (`input`). */
function setEditor(source) {
    return cy.foundry((win) => {
        const field = win.document.querySelector(
            "textarea.expression-editor__code",
        );
        if (!field) throw new Error("expression editor textarea not found");
        field.value = source;
        field.dispatchEvent(new win.Event("input"));
        return field.value;
    });
}

describe("SafeExpression editor (Skill Base pilot)", () => {
    before(() => cy.login().then(() => cy.cleanupWorld()));
    afterEach(() => {
        // testIsolation is off, so a still-open editor dialog (a modal) would
        // cover the next test's sheet — close every open app before cleanup.
        cy.foundry((win) => {
            for (const app of Array.from(
                win.foundry.applications.instances.values(),
            )) {
                if (app.rendered) app.close();
            }
        });
        cy.cleanupWorld();
    });

    /** Open a fresh skill's sheet on the Properties tab. Yields the skill doc. */
    function openSkillProperties(formula) {
        return cy
            .createWorldItem("skill", {
                name: "Editor Skill",
                system: { subType: "lore", skillBaseFormula: formula ?? null },
            })
            .then((skill) => {
                cy.openSheet(skill);
                cy.switchTab("properties", "sheet");
                return cy.wrap(skill);
            });
    }

    it("shows an edit button beside Skill Base and opens the code editor", () => {
        openSkillProperties().then(() => {
            cy.get(
                'section.tab[data-tab="properties"] button[data-action="editExpression"][data-field-path="system.skillBaseFormula"]',
            )
                .should("exist")
                .click();
            // The editor dialog renders with the monospace editing surface.
            cy.get("textarea.expression-editor__code").should("exist");
            cy.get('button[data-action="save"]').should("exist");
        });
    });

    it("disables Save and flags the error for an invalid expression", () => {
        openSkillProperties().then(() => {
            cy.get('button[data-action="editExpression"]').click();
            cy.get("textarea.expression-editor__code").should("exist");
            setEditor("a == b"); // `==` is a removed operator → parse error
            cy.get(".expression-editor__status").should(
                "have.class",
                "is-error",
            );
            cy.get('button[data-action="save"]').should("be.disabled");
        });
    });

    it("enables Save for a valid expression and persists it", () => {
        openSkillProperties().then((skill) => {
            cy.get('button[data-action="editExpression"]').click();
            cy.get("textarea.expression-editor__code").should("exist");
            // Assert the value actually stuck (empty would also read "valid").
            setEditor("sb(attr.str)").should("eq", "sb(attr.str)");
            cy.get(".expression-editor__status").should(
                "have.class",
                "is-valid",
            );
            cy.get('button[data-action="save"]').should("not.be.disabled");
            cy.submitDialog("save");
            // The action's `document.update` is async and the click doesn't await
            // it; give it a beat, then poll the persisted field until it settles.
            cy.wait(500);
            cy.foundry(
                (win) => win.game.items.get(skill.id).system.skillBaseFormula,
            ).should("eq", "sb(attr.str)");
        });
    });

    it("helper palette inserts a helper call at the cursor", () => {
        openSkillProperties().then(() => {
            cy.get('button[data-action="editExpression"]').click();
            cy.get("textarea.expression-editor__code").should("exist");
            // Expand the palette and click the `abs` helper chip.
            cy.get(".expression-editor__helpers summary").click();
            cy.get('.expression-editor__chip[data-helper="abs"]').click();
            cy.foundry(
                (win) =>
                    win.document.querySelector(
                        "textarea.expression-editor__code",
                    ).value,
            ).should("contain", "abs()");
        });
    });
});
