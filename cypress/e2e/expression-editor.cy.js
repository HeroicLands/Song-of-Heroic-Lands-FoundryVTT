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
 * SafeExpression editor — the CodeMirror popup for formula fields (#1031 Phase 1,
 * #1035 Phase 2: highlighting, autocomplete, rollout). Piloted on the Skill
 * sheet's Skill Base field.
 *
 * Drives the real seam: the edit button opens the CodeMirror dialog; live
 * validation toggles the status line and the Save button; grammar highlighting
 * and helper autocomplete work; Save persists to `system.skillBaseFormula`.
 */

/** The `[data-editor]` mount node's exposed editor handle (a test seam). */
function editorHandle(win) {
    const node = win.document.querySelector(".expression-editor [data-editor]");
    if (!node || !node._expressionEditor) {
        throw new Error("expression editor handle not found");
    }
    return node._expressionEditor;
}

/** Set the open editor's value via its handle; yields the resulting value. */
function setEditor(source) {
    return cy.foundry((win) => {
        const handle = editorHandle(win);
        handle.setValue(source);
        return handle.getValue();
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

    it("shows an edit button beside Skill Base and opens the CodeMirror editor", () => {
        openSkillProperties().then(() => {
            cy.get(
                'section.tab[data-tab="properties"] button[data-action="editExpression"][data-field-path="system.skillBaseFormula"]',
            )
                .should("exist")
                .click();
            cy.get(".expression-editor .cm-editor").should("exist");
            cy.get('button[data-action="save"]').should("exist");
        });
    });

    it("disables Save and flags the error for an invalid expression", () => {
        openSkillProperties().then(() => {
            cy.get('button[data-action="editExpression"]').click();
            cy.get(".expression-editor .cm-editor").should("exist");
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
            cy.get(".expression-editor .cm-editor").should("exist");
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

    it("highlights the grammar: helper names render as function tokens", () => {
        openSkillProperties("sb(attr.str)").then(() => {
            cy.get('button[data-action="editExpression"]').click();
            cy.get(".expression-editor .cm-editor").should("exist");
            // The custom StreamLanguage tags the helper callee `sb` as a
            // function; CodeMirror emits it in its own highlight span, so the
            // rendered line is split into multiple token elements.
            cy.get(".expression-editor .cm-line")
                .first()
                .find("span")
                .its("length")
                .should("be.greaterThan", 1);
            cy.get(".expression-editor .cm-line")
                .first()
                .should("contain.text", "sb");
        });
    });

    it("helper palette inserts a helper call at the cursor", () => {
        openSkillProperties().then(() => {
            cy.get('button[data-action="editExpression"]').click();
            cy.get(".expression-editor .cm-editor").should("exist");
            cy.get(".expression-editor__helpers summary").click();
            cy.get('.expression-editor__chip[data-helper="abs"]').click();
            cy.foundry((win) => editorHandle(win).getValue()).should(
                "contain",
                "abs()",
            );
        });
    });
});

describe("SafeExpression editor rollout (Affliction outcomeTrauma)", () => {
    before(() => cy.login().then(() => cy.cleanupWorld()));
    afterEach(() => {
        cy.foundry((win) => {
            for (const app of Array.from(
                win.foundry.applications.instances.values(),
            )) {
                if (app.rendered) app.close();
            }
        });
        cy.cleanupWorld();
    });

    it("shows the editor on the outcomeTrauma field and persists a valid value", () => {
        cy.createWorldItem("affliction", { name: "Editor Affliction" }).then(
            (affliction) => {
                cy.openSheet(affliction);
                cy.switchTab("properties", "sheet");
                cy.get(
                    'button[data-action="editExpression"][data-field-path="system.outcomeTrauma"]',
                )
                    .should("exist")
                    .click();
                cy.get(".expression-editor .cm-editor").should("exist");
                cy.foundry((win) => {
                    const node = win.document.querySelector(
                        ".expression-editor [data-editor]",
                    );
                    node._expressionEditor.setValue("'psy'");
                    return node._expressionEditor.getValue();
                }).should("eq", "'psy'");
                cy.get(".expression-editor__status").should(
                    "have.class",
                    "is-valid",
                );
                cy.submitDialog("save");
                cy.wait(500);
                cy.foundry(
                    (win) =>
                        win.game.items.get(affliction.id).system.outcomeTrauma,
                ).should("eq", "'psy'");
            },
        );
    });
});
