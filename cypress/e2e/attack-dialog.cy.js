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
 * The automated-combat attack dialog (#1080).
 *
 * The dialog is where the attacker picks their **strike mode** — but the
 * template rendered only Aim and Additional Modifier while the result callback
 * read a `modeIdx` field that never existed, so confirming it threw.
 *
 * This spec drives `showAttackDialog` directly through the deployed system
 * (`sohl.document.combatant.logic`), which exercises exactly the seam that was
 * broken: the real `.hbs` rendered by Foundry, the real `DialogV2`, and the real
 * `FormDataExtended` parse feeding the pure result callback. Driving it from a
 * live *attack* instead is not reachable headless — `startAutomatedAttack`'s
 * turn gate reads `game.combat`, which needs a canvas (see the RED case in
 * `combat-turn-gate.cy.js`, #177).
 */

/** The open dialog carrying the strike-mode select, or `undefined`. */
function attackDialog(win) {
    return Array.from(win.foundry.applications.instances.values())
        .reverse()
        .find(
            (app) =>
                app.rendered &&
                app.element?.querySelector('select[name="modeIdx"]'),
        );
}

describe("automated attack dialog (#1080)", () => {
    before(() => cy.login());

    it("offers the strike modes and resolves to the one the attacker picks", () => {
        // Open the dialog with two modes, the second pre-selected. The stashed
        // promise is awaited after the button press.
        cy.foundry((win) => {
            const modes = [
                {
                    name: "Arming Sword Swing",
                    pointerData: { itemUuid: "Item.sword", smId: "swing" },
                },
                {
                    name: "Arming Sword Thrust",
                    pointerData: { itemUuid: "Item.sword", smId: "thrust" },
                },
            ].map((m) => win.JSON.parse(win.JSON.stringify(m)));
            win.__attackDlg =
                win.sohl.document.combatant.logic.showAttackDialog(
                    "Aldric vs. Brynn — Attack",
                    win.JSON.parse(
                        win.JSON.stringify({ th: "Thorax", hd: "Head" }),
                    ),
                    "th",
                    modes,
                    1,
                );
            return null;
        });

        // The strike-mode select renders, listing every offered mode, with the
        // caller's default pre-selected.
        cy.window().should((win) => {
            expect(attackDialog(win), "dialog with a strike-mode select").to
                .exist;
        });
        cy.window().then((win) => {
            const select = attackDialog(win).element.querySelector(
                'select[name="modeIdx"]',
            );
            expect(
                Array.from(select.options).map((o) => o.textContent.trim()),
                "both modes offered",
            ).to.deep.eq(["Arming Sword Swing", "Arming Sword Thrust"]);
            expect(select.value, "pre-selected to the default mode").to.eq("1");
            // The attacker changes their mind and swings instead.
            select.value = "0";
        });

        cy.submitDialog("ok");

        cy.foundry((win) => win.__attackDlg).should((result) => {
            expect(result, "the chosen mode comes back").to.exist;
            expect(result.mode).to.deep.eq({
                itemUuid: "Item.sword",
                smId: "swing",
            });
            expect(result.aim).to.eq("th");
            expect(result.situationalModifier).to.eq(0);
        });
    });
});
