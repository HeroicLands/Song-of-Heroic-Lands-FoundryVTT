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
 * Being Skills tab drag-and-drop (#1528).
 *
 * A skill's group is its subType, so **a drag never re-parents**: dropping onto
 * another group clamps the skill to the near edge of its own — bottom when
 * dropped lower, top when dropped higher. The drop is driven as a real DOM
 * `drop` on the live sheet (in the game realm) so the actual
 * `_onDragStart` / `_onDrop` / `_onDropSkill` path runs, not a direct call.
 *
 * The four cases below are the rule; a passing "reorder within a group" alone
 * would not catch a regression that re-parents on a cross-group drop.
 */
describe("Being Skills tab: drag to reorder (#1528)", () => {
    before(() => cy.login().then(() => cy.cleanupWorld()));
    afterEach(() => {
        cy.closeAllSheets();
        cy.cleanupWorld();
    });

    /** Two skills in one group and one in a later group, in a known order. */
    function seed() {
        return cy.importActor().then((actor) => {
            cy.prepare(actor);
            cy.openSheet(actor);
            cy.switchTab("skills");
            return cy.wrap(actor, { log: false });
        });
    }

    /**
     * Read the rendered order of skill ids, per group, from the live sheet —
     * the same source the drop handler reads, so a mismatch is a real defect
     * rather than a test artefact.
     */
    function readGroups(actorId) {
        return cy.foundry((win) => {
            const root = win.game.actors.get(actorId).sheet.element;
            return Array.from(root.querySelectorAll(".skills-ledger")).map(
                (el) => ({
                    subType: el.dataset.subType,
                    ids: Array.from(el.querySelectorAll(".ledger__row")).map(
                        (r) => r.dataset.itemId,
                    ),
                }),
            );
        });
    }

    /**
     * Dispatch a real drop of `sourceId` onto `targetSelector`, then poll until
     * the rendered order changes or the attempt times out. Yields the groups as
     * rendered afterwards.
     */
    function dropSkill(actorId, sourceId, targetSelector) {
        return cy.foundry(async (win) => {
            const actor = win.game.actors.get(actorId);
            const root = actor.sheet.element;
            const snapshot = () =>
                Array.from(root.querySelectorAll(".skills-ledger")).map((el) =>
                    Array.from(el.querySelectorAll(".ledger__row"))
                        .map((r) => r.dataset.itemId)
                        .join(","),
                );
            const before = snapshot().join("|");

            const dt = new win.DataTransfer();
            dt.setData(
                "text/plain",
                JSON.stringify({ sohlSkillDrag: { skillId: sourceId } }),
            );
            const target = root.querySelector(targetSelector);
            if (!target)
                throw new Error(`drop target not found: ${targetSelector}`);
            target.dispatchEvent(
                new win.DragEvent("drop", {
                    bubbles: true,
                    cancelable: true,
                    dataTransfer: dt,
                }),
            );

            // The update and its re-render are async; poll for the DOM to settle.
            for (let i = 0; i < 100; i++) {
                if (snapshot().join("|") !== before) break;
                await new Promise((r) => setTimeout(r, 20));
            }
            const live = win.game.actors.get(actorId).sheet.element;
            return Array.from(live.querySelectorAll(".skills-ledger")).map(
                (el) => ({
                    subType: el.dataset.subType,
                    ids: Array.from(el.querySelectorAll(".ledger__row")).map(
                        (r) => r.dataset.itemId,
                    ),
                }),
            );
        });
    }

    it("renders a draggable handle on every skill row", () => {
        seed().then((actor) => {
            cy.foundry((win) => {
                const root = win.game.actors.get(actor.id).sheet.element;
                const rows = Array.from(
                    root.querySelectorAll(".skills-ledger .ledger__row"),
                );
                return {
                    rows: rows.length,
                    draggable: rows.filter(
                        (r) => r.getAttribute("draggable") === "true",
                    ).length,
                    grips: root.querySelectorAll(".skills-ledger .ledger__grip")
                        .length,
                };
            }).should((r) => {
                expect(r.rows, "skill rows").to.be.greaterThan(1);
                // The handle must not advertise an interaction the row lacks —
                // that inertness was the original bug.
                expect(r.draggable, "draggable rows").to.eq(r.rows);
                expect(r.grips, "grip handles").to.eq(r.rows);
            });
        });
    });

    it("reorders within a group when dropped on another row", () => {
        seed().then((actor) => {
            readGroups(actor.id).then((groups) => {
                const g = groups.find((x) => x.ids.length >= 3);
                const source = g.ids[g.ids.length - 1];
                const firstId = g.ids[0];
                dropSkill(
                    actor.id,
                    source,
                    `.skills-ledger .ledger__row[data-item-id="${firstId}"]`,
                ).should((after) => {
                    const now = after.find((x) => x.subType === g.subType);
                    expect(now.ids[0], "dropped before the first row").to.eq(
                        source,
                    );
                    expect(now.ids, "no skill lost").to.have.length(
                        g.ids.length,
                    );
                });
            });
        });
    });

    it("clamps to the BOTTOM of its own group when dropped on a later group", () => {
        seed().then((actor) => {
            readGroups(actor.id).then((groups) => {
                const src = groups[0];
                const later = groups[1];
                expect(later, "a later group to drop into").to.exist;
                const source = src.ids[0];
                dropSkill(
                    actor.id,
                    source,
                    `.skills-ledger[data-sub-type="${later.subType}"]`,
                ).should((after) => {
                    const own = after.find((x) => x.subType === src.subType);
                    expect(own.ids[own.ids.length - 1]).to.eq(source);
                    // It stayed in its own group — never re-parented.
                    const dest = after.find((x) => x.subType === later.subType);
                    expect(dest.ids).to.not.include(source);
                });
            });
        });
    });

    it("clamps to the TOP of its own group when dropped on an earlier group", () => {
        seed().then((actor) => {
            readGroups(actor.id).then((groups) => {
                const earlier = groups[0];
                const src = groups.slice(1).find((g) => g.ids.length >= 2);
                expect(src, "a later group with two skills").to.exist;
                const source = src.ids[src.ids.length - 1];
                dropSkill(
                    actor.id,
                    source,
                    `.skills-ledger[data-sub-type="${earlier.subType}"]`,
                ).should((after) => {
                    const own = after.find((x) => x.subType === src.subType);
                    expect(own.ids[0]).to.eq(source);
                    const dest = after.find(
                        (x) => x.subType === earlier.subType,
                    );
                    expect(dest.ids).to.not.include(source);
                });
            });
        });
    });

    it("never changes a skill's subType, however far it is dragged", () => {
        seed().then((actor) => {
            readGroups(actor.id).then((groups) => {
                const src = groups[0];
                const last = groups[groups.length - 1];
                const source = src.ids[0];
                cy.foundry(
                    (win) =>
                        win.game.actors.get(actor.id).items.get(source).system
                            .subType,
                ).then((before) => {
                    dropSkill(
                        actor.id,
                        source,
                        `.skills-ledger[data-sub-type="${last.subType}"]`,
                    ).then(() => {
                        cy.foundry(
                            (win) =>
                                win.game.actors.get(actor.id).items.get(source)
                                    .system.subType,
                        ).should("eq", before);
                    });
                });
            });
        });
    });
});
