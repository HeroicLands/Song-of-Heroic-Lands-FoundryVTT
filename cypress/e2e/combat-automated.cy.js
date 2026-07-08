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
 * Automated combat.
 *
 * The defense side is implemented and GREEN: an attack card emits all four
 * defender-response buttons (Dodge / Counterstrike / Block / Ignore), and
 * `gateAutomatedDefenseButtons` (the `renderChatMessageHTML` hook) prunes them
 * per the *viewer's* ownership and the defender's capabilities when the card
 * renders. We exercise that gate directly by posting a card carrying the four
 * buttons addressed (via `data-handler-actor-uuid`) to a real defender combatant,
 * then asserting which buttons survive — this bypasses the stubbed attacker-start
 * (RED #177).
 *
 * The attacker-start flow itself aborts (RED #177): `commonAttack` →
 * `BeingLogic.getUsableStrikeModes()` returns `[]`, so no attack card is produced
 * and Counterstrike-resume (same path) aborts too.
 */

/** A melee weapongear whose single mode allows both block and counterstrike. */
function meleeWeapon(name = "Arming Sword") {
    return {
        name,
        system: {
            strikeModes: {
                strike: {
                    type: "melee",
                    name: "Strike",
                    assocSkillCode: "melee",
                    minParts: 1,
                    attack: { spread: 0, modifier: 0 },
                    impactBase: {
                        numDice: 1,
                        die: 6,
                        modifier: 0,
                        aspect: "edged",
                    },
                    traits: {},
                    lengthBase: 3,
                    defense: {
                        block: {
                            disabled: false,
                            modifier: 0,
                            successLevelMod: 0,
                        },
                        counterstrike: {
                            disabled: false,
                            modifier: 0,
                            successLevelMod: 0,
                        },
                    },
                },
            },
        },
    };
}

const DEFENSE_ACTIONS = [
    "automatedDodgeResume",
    "automatedCounterstrikeResume",
    "automatedBlockResume",
    "automatedIgnoreResume",
];

/** The combatant of `actorId` in `combatId`. */
function combatantOf(win, combatId, actorId) {
    return win.game.combats
        .get(combatId)
        .combatants.find((c) => c.actorId === actorId);
}

/**
 * Post a synthetic attack card carrying the four defense buttons addressed to
 * `defenderUuid`, wait for the render gate, and return the surviving buttons'
 * `data-action`s.
 */
async function survivingButtons(win, defenderUuid) {
    const btns = DEFENSE_ACTIONS.map(
        (a) =>
            `<button data-action="${a}" data-handler-actor-uuid="${defenderUuid}">${a}</button>`,
    ).join("");
    const content = `<div class="card-buttons">${btns}</div>`;
    const msg = await win.ChatMessage.create(
        win.JSON.parse(JSON.stringify({ content })),
    );
    await new Promise((r) => setTimeout(r, 400));
    const el = win.document.querySelector(`[data-message-id="${msg.id}"]`);
    return el ?
            Array.from(el.querySelectorAll("button[data-action]")).map(
                (b) => b.dataset.action,
            )
        :   [];
}

describe("automated combat", () => {
    before(() => cy.login().then(() => cy.cleanupWorld()));
    afterEach(() => cy.cleanupWorld());

    // The known logger recursion (#267) turns any stray `uiWarn` into a stack
    // overflow; don't let an unrelated background warning fail these gating
    // assertions.
    Cypress.on("uncaught:exception", () => false);

    // ------------------------------------------------------------ defense gating

    it("owner with no dodge skill or melee mode: only Ignore survives", () => {
        cy.createScene({ name: "arena" }).then((scene) => {
            cy.createActor("being", { name: "helpless" }).then((actor) => {
                cy.prepare(actor);
                cy.placeToken(scene, actor).then((token) => {
                    cy.createCombatWith([token]).then((combat) => {
                        cy.foundry((win) =>
                            survivingButtons(
                                win,
                                combatantOf(win, combat.id, actor.id).uuid,
                            ),
                        ).should((s) => {
                            expect(s, "capability-gated to Ignore").to.deep.eq([
                                "automatedIgnoreResume",
                            ]);
                        });
                    });
                });
            });
        });
    });

    it("owner with a dodge skill and a melee weapon: all four survive", () => {
        cy.createScene({ name: "arena" }).then((scene) => {
            cy.createActor("being", { name: "ready" }).then((actor) => {
                cy.createItemOn(actor, "skill", {
                    name: "Dodge",
                    system: { shortcode: "dge", masteryLevelBase: 50 },
                });
                cy.createItemOn(actor, "weapongear", meleeWeapon());
                cy.prepare(actor);
                cy.placeToken(scene, actor).then((token) => {
                    cy.createCombatWith([token]).then((combat) => {
                        cy.foundry((win) =>
                            survivingButtons(
                                win,
                                combatantOf(win, combat.id, actor.id).uuid,
                            ),
                        ).should((s) => {
                            expect(
                                s,
                                "dodge + block + counter + ignore",
                            ).to.include.members(DEFENSE_ACTIONS);
                        });
                    });
                });
            });
        });
    });

    it("incapacitated owner: only Ignore survives", () => {
        cy.createScene({ name: "arena" }).then((scene) => {
            cy.createActor("being", { name: "downed" }).then((actor) => {
                cy.createItemOn(actor, "skill", {
                    name: "Dodge",
                    system: { shortcode: "dge", masteryLevelBase: 50 },
                });
                cy.createItemOn(actor, "weapongear", meleeWeapon());
                cy.foundry(async (win) => {
                    // Unconscious is a DEFENSE_DISABLING_STATUS → Ignore only.
                    // SoHL effects apply only when their scope targets the actor
                    // (`allApplicableEffects` requires `targets.includes(this)`),
                    // so a bare `toggleStatusEffect` never reaches `actor.statuses`
                    // — create the effect with `system.scope: "actor"`.
                    await win.game.actors.get(actor.id).createEmbeddedDocuments(
                        "ActiveEffect",
                        win.JSON.parse(
                            JSON.stringify([
                                {
                                    name: "Unconscious",
                                    type: "sohleffectdata",
                                    statuses: ["unconscious"],
                                    system: { scope: "actor" },
                                },
                            ]),
                        ),
                    );
                });
                cy.prepare(actor);
                cy.placeToken(scene, actor).then((token) => {
                    cy.createCombatWith([token]).then((combat) => {
                        cy.foundry((win) =>
                            survivingButtons(
                                win,
                                combatantOf(win, combat.id, actor.id).uuid,
                            ),
                        ).should((s) => {
                            expect(s, "incapacitated → Ignore only").to.deep.eq(
                                ["automatedIgnoreResume"],
                            );
                        });
                    });
                });
            });
        });
    });

    // ---------------------------------------------------- actor-state sovereignty

    it("the gate addresses the defender via data-handler-actor-uuid", () => {
        // The gate resolves the responder from the button's own
        // `data-handler-actor-uuid` (the defender's combatant), so a card
        // addressed to a combatant the client owns keeps at least Ignore, while a
        // card addressed to an unresolvable handler keeps nothing.
        cy.createScene({ name: "arena" }).then((scene) => {
            cy.createActor("being", { name: "sovereign" }).then((actor) => {
                cy.prepare(actor);
                cy.placeToken(scene, actor).then((token) => {
                    cy.createCombatWith([token]).then((combat) => {
                        cy.foundry((win) => {
                            const owned = combatantOf(
                                win,
                                combat.id,
                                actor.id,
                            ).uuid;
                            return { owned };
                        }).then(({ owned }) => {
                            cy.foundry((win) =>
                                survivingButtons(win, owned),
                            ).should("include", "automatedIgnoreResume");
                            cy.foundry((win) =>
                                survivingButtons(
                                    win,
                                    "Combat.xxxxxxxx.Combatant.xxxxxxxx",
                                ),
                            ).should("be.empty");
                        });
                    });
                });
            });
        });
    });

    // ------------------------------------------------- defense-resume registration

    it("the combatant logic registers the four automated defense-resume actions", () => {
        cy.createScene({ name: "arena" }).then((scene) => {
            cy.createActor("being", { name: "responder" }).then((actor) => {
                cy.prepare(actor);
                cy.placeToken(scene, actor).then((token) => {
                    cy.createCombatWith([token]).then((combat) => {
                        cy.foundry((win) => {
                            const logic = combatantOf(
                                win,
                                combat.id,
                                actor.id,
                            ).logic;
                            return DEFENSE_ACTIONS.map((a) =>
                                logic.actions.has(a),
                            );
                        }).should((have) => {
                            expect(
                                have,
                                "all four resumes registered",
                            ).to.deep.eq([true, true, true, true]);
                        });
                    });
                });
            });
        });
    });

    // ------------------------------------------------------------------------ RED

    // RED — blocked by #177: automated attack start aborts. `commonAttack` →
    // BeingLogic.getUsableStrikeModes() returns [] (stub, BeingLogic.ts:234), so
    // it emits "no usable strike mode" and returns undefined. Two implemented
    // collectors (availableStrikeModes / collectAttackableStrikeModes) are
    // unwired. Un-skip and assert an attack card is produced once wired.
    it.skip("automated attack start produces an attack card (#177)", () => {});

    // RED — blocked by #177: Counterstrike resume routes through the same
    // getUsableStrikeModes stub → aborts.
    it.skip("counterstrike resume resolves an attack (#177)", () => {});

    // RED — blocked by #64: Dodge should no longer be skill-gated (FIXME) — today
    // the Dodge button requires a `dge` skill (see the capability-gate test
    // above). Un-skip and assert Dodge survives without a Dodge skill once #64
    // removes the gate.
    it.skip("Dodge is available without a Dodge skill (#64)", () => {});

    // NOTE: the Block / Dodge / Ignore resume *evaluation* is implemented, but
    // driving it requires synthesizing a full CombatResult scope on the defender;
    // the resume resolution math is covered by the unit suite. Registration and
    // gating (above) are the E2E-reachable GREEN surface for the defense side.
});
