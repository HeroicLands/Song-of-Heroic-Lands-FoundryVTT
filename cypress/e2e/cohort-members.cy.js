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
 * The Cohort sheet's **Members** tab (#1151), in a live client.
 *
 * The tab used to render its section and list nothing at all: the template bound
 * fields the schema never carried, and the sheet built no context for the part.
 * These specs drive the real roster — rows resolved from each member's
 * `shortcodeOrUuid` handle, the chess-king leader toggle, the row trashcan, and
 * the add control — through the three intrinsic actions that back them.
 *
 * Every control click is followed by a `cy.window().should(...)` poll rather than
 * a `cy.foundry(...).should(...)`: an action's update settles asynchronously, and
 * only `cy.window().should` genuinely re-runs its callback until it holds (the
 * same reason `cy.submitDialog` polls for a rendered dialog).
 */

/** Update a document's `system` with a realm-cloned patch; resolves after settle. */
function patchSystem(win, id, patch) {
    return win.game.actors
        .get(id)
        .update(win.JSON.parse(JSON.stringify(patch)));
}

/** The cohort's persisted membership + leader. */
function roster(win, id) {
    const s = win.game.actors.get(id).system;
    return {
        refs: s.members.map((m) => m.shortcodeOrUuid),
        roles: s.members.map((m) => m.role),
        leaderCode: s.leaderCode,
    };
}

/** The Members tab's rendered rows, in order. */
function rows(win, id) {
    const el = win.game.actors.get(id).sheet.element;
    return Array.from(
        el.querySelectorAll('section.tab[data-tab="members"] .ledger__row'),
    ).map((r) => ({
        ref: r.dataset.memberRef,
        // The name cell may also carry the NOT FOUND flag for an unresolved
        // member, so read only its leading text node — not the whole cell.
        name: r.querySelector(".ledger__name")?.firstChild?.textContent.trim(),
        role: r.querySelector(".ledger__cell--text")?.textContent.trim(),
        isLeader: !!r.querySelector('[data-action="setCohortLeader"].is-on'),
        isDisabled: r.classList.contains("ledger__row--disabled"),
        hasImg: !!r.querySelector(".ledger__icon img"),
        missingFlag: r
            .querySelector(".member-missing__label")
            ?.textContent.trim(),
    }));
}

/** Poll the cohort's persisted roster (and rendered rows) until `fn` holds. */
function shouldSettle(id, fn) {
    return cy.window({ log: false }).should((win) => {
        fn(roster(win, id), rows(win, id), win);
    });
}

/** Click a member row's control (`setCohortLeader` / `removeCohortMember`). */
function clickRowControl(id, ref, action) {
    return cy.foundry((win) => {
        const el = win.game.actors.get(id).sheet.element;
        el.querySelector(
            `section.tab[data-tab="members"] .ledger__row[data-member-ref="${ref}"] [data-action="${action}"]`,
        ).click();
        return null;
    });
}

/** Open the add-member dialog, type a handle into it, and press Add. */
function addMember(id, handle) {
    cy.foundry((win) => {
        win.game.actors
            .get(id)
            .sheet.element.querySelector('[data-action="addCohortMember"]')
            .click();
        return null;
    });
    // The dialog renders asynchronously — poll for its input before filling it.
    cy.window({ log: false }).should((win) => {
        expect(
            win.document.querySelector('dialog input[name="shortcodeOrUuid"]'),
            "add-member dialog open",
        ).to.exist;
    });
    cy.foundry((win) => {
        win.document.querySelector(
            'dialog input[name="shortcodeOrUuid"]',
        ).value = handle;
        return null;
    });
    return cy.submitDialog("add");
}

describe("cohort Members tab", () => {
    before(() => cy.login().then(() => cy.cleanupWorld()));
    afterEach(() => cy.cleanupWorld());

    /**
     * A cohort with two member beings (`aldric` / `brunjar`), its Members tab
     * open. Yields `{ cohort, aldric, brunjar }`.
     *
     * Actor names carry the suite's per-run tag (`cy.createActor` tags every
     * name for `cleanupWorld`), so specs assert that a row *contains* the actor's
     * distinguishing name rather than equals a bare literal.
     */
    function openRoster(extraMembers = []) {
        return cy
            .createActor("being", {
                name: "Aldric",
                system: { shortcode: "aldric" },
            })
            .then((aldric) =>
                cy
                    .createActor("being", {
                        name: "Brunjar",
                        system: { shortcode: "brunjar" },
                    })
                    .then((brunjar) =>
                        cy
                            .createActor("cohort", { name: "The Watch" })
                            .then((cohort) => {
                                cy.foundry((win) =>
                                    patchSystem(win, cohort.id, {
                                        "system.members": [
                                            {
                                                shortcodeOrUuid: "aldric",
                                                role: "director",
                                            },
                                            { shortcodeOrUuid: "brunjar" },
                                            ...extraMembers,
                                        ],
                                    }),
                                );
                                cy.openSheet(cohort);
                                cy.switchTab("members", "primary");
                                return cy.wrap(
                                    { cohort, aldric, brunjar },
                                    { log: false },
                                );
                            }),
                    ),
            );
    }

    it("lists every member, named from the actor its handle resolves to", () => {
        openRoster().then(({ cohort }) => {
            shouldSettle(cohort.id, (_persisted, r) => {
                expect(r, "one row per member").to.have.length(2);
                expect(r.map((x) => x.ref)).to.deep.eq(["aldric", "brunjar"]);
                expect(r[0].name, "named from its actor").to.contain("Aldric");
                expect(r[1].name).to.contain("Brunjar");
                expect(r.map((x) => x.role)).to.deep.eq(["Director", "Member"]);
                expect(
                    r.every((x) => x.hasImg),
                    "each row shows a portrait",
                ).to.be.true;
            });
        });
    });

    it("still lists a member whose actor does not resolve, named by its handle", () => {
        openRoster([{ shortcodeOrUuid: "departed" }]).then(({ cohort }) => {
            shouldSettle(cohort.id, (_persisted, r) => {
                expect(r).to.have.length(3);
                expect(r[2].name, "named by its raw handle").to.eq("departed");
                expect(r[2].isDisabled, "greyed as unresolved").to.be.true;
            });
        });
    });

    it("flags an unresolved member with a NOT FOUND warning (#199)", () => {
        openRoster([{ shortcodeOrUuid: "departed" }]).then(({ cohort }) => {
            shouldSettle(cohort.id, (_persisted, r) => {
                expect(r[2].ref).to.eq("departed");
                expect(r[2].missingFlag, "flagged as missing").to.eq(
                    "Not Found",
                );
                // A member that resolves carries no flag.
                expect(r[0].missingFlag, "resolved member unflagged").to.be
                    .undefined;
            });
        });
    });

    it("promotes, displaces, and stands down the leader from the king control", () => {
        openRoster().then(({ cohort }) => {
            // No leader to begin with.
            shouldSettle(cohort.id, (p, r) => {
                expect(p.leaderCode).to.be.null;
                expect(
                    r.some((x) => x.isLeader),
                    "no king lit",
                ).to.be.false;
            });

            // Click Brunjar's king → Brunjar leads.
            clickRowControl(cohort.id, "brunjar", "setCohortLeader");
            shouldSettle(cohort.id, (p, r) => {
                expect(p.leaderCode).to.eq("brunjar");
                expect(
                    r.filter((x) => x.isLeader).map((x) => x.ref),
                ).to.deep.eq(["brunjar"]);
            });

            // Click Aldric's king → leadership moves; exactly one king is lit.
            clickRowControl(cohort.id, "aldric", "setCohortLeader");
            shouldSettle(cohort.id, (p, r) => {
                expect(p.leaderCode).to.eq("aldric");
                expect(
                    r.filter((x) => x.isLeader).map((x) => x.ref),
                ).to.deep.eq(["aldric"]);
            });

            // Click the sitting leader's own king → no leader at all.
            clickRowControl(cohort.id, "aldric", "setCohortLeader");
            shouldSettle(cohort.id, (p, r) => {
                expect(p.leaderCode, "stood down").to.be.null;
                expect(
                    r.some((x) => x.isLeader),
                    "no king lit",
                ).to.be.false;
            });
        });
    });

    it("removes a member from its row, once confirmed, leaving the actor alone", () => {
        openRoster().then(({ cohort, brunjar }) => {
            clickRowControl(cohort.id, "brunjar", "removeCohortMember");
            cy.submitDialog("yes");

            shouldSettle(cohort.id, (p, _r, win) => {
                expect(p.refs).to.deep.eq(["aldric"]);
                // Only the membership went; the being is untouched.
                expect(win.game.actors.get(brunjar.id), "actor kept").to.exist;
            });
        });
    });

    it("keeps the member when the removal is declined", () => {
        openRoster().then(({ cohort }) => {
            clickRowControl(cohort.id, "brunjar", "removeCohortMember");
            cy.submitDialog("no");

            shouldSettle(cohort.id, (p) => {
                expect(p.refs).to.deep.eq(["aldric", "brunjar"]);
            });
        });
    });

    it("clears the leader when the leading member is removed", () => {
        openRoster().then(({ cohort }) => {
            cy.foundry((win) =>
                patchSystem(win, cohort.id, { "system.leaderCode": "brunjar" }),
            );
            clickRowControl(cohort.id, "brunjar", "removeCohortMember");
            cy.submitDialog("yes");

            shouldSettle(cohort.id, (p) => {
                expect(p.refs).to.deep.eq(["aldric"]);
                expect(p.leaderCode, "no leader left behind").to.be.null;
            });
        });
    });

    it("adds a member through the add dialog, by shortcode", () => {
        cy.createActor("being", {
            name: "Sergeant Vell",
            system: { shortcode: "vell" },
        });
        openRoster().then(({ cohort }) => {
            addMember(cohort.id, "vell");

            shouldSettle(cohort.id, (p, r) => {
                expect(p.refs).to.deep.eq(["aldric", "brunjar", "vell"]);
                expect(r).to.have.length(3);
                expect(r[2].name, "named from its actor").to.contain("Vell");
            });
        });
    });

    it("refuses a handle that names no actor", () => {
        openRoster().then(({ cohort }) => {
            addMember(cohort.id, "nobody-at-all");

            shouldSettle(cohort.id, (p) => {
                expect(p.refs).to.deep.eq(["aldric", "brunjar"]);
            });
        });
    });

    it("refuses a handle that is already a member", () => {
        openRoster().then(({ cohort }) => {
            addMember(cohort.id, "aldric");

            shouldSettle(cohort.id, (p) => {
                expect(p.refs).to.deep.eq(["aldric", "brunjar"]);
            });
        });
    });

    it("explains the empty state for a cohort with no members", () => {
        cy.createActor("cohort", { name: "Empty Watch" }).then((cohort) => {
            cy.openSheet(cohort);
            cy.switchTab("members", "primary");
            cy.window({ log: false }).should((win) => {
                const tab = win.game.actors
                    .get(cohort.id)
                    .sheet.element.querySelector(
                        'section.tab[data-tab="members"]',
                    );
                expect(tab.querySelector(".ledger__head"), "no empty ledger").to
                    .not.exist;
                expect(tab.textContent).to.contain("no members yet");
                expect(
                    tab.querySelector('[data-action="addCohortMember"]'),
                    "add control still reachable",
                ).to.exist;
            });
        });
    });
});
