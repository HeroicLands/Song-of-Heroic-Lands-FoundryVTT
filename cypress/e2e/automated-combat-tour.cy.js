/* global cy, describe, before, after, it, expect */
/*
 * This file is part of the Song of Heroic Lands (SoHL) system for Foundry VTT.
 * Copyright (c) 2024-2026 Tom Rodriguez ("Toasty") — <toasty@heroiclands.org>
 * SPDX-License-Identifier: GPL-3.0-or-later
 */
const KEY = "sohl.automated-combat";
let beforeIds, oldHotbar, rngState, oldAdventureImports, oldSceneId, importedMacroId;

function next() {
    // The click starts asynchronous Foundry preparation. A newly rendered step
    // marker appears only after its drives finish; document reads must wait.
    cy.get(".tour-center-step .progress")
        .invoke("text")
        .then((before) => {
            cy.get('.tour-center-step .step-button[data-action="next"]')
                .should("not.have.class", "sohl-tour-gate-disabled")
                .click();
            cy.get(".tour-center-step .progress", { timeout: 20000 }).should(($progress) => {
                // One retryable query must check the replacement node atomically;
                // separate successful assertions can retain the previous marker.
                expect($progress).to.have.length(1);
                expect($progress).to.be.visible;
                expect($progress.text()).not.to.equal(before);
            });
        });
}

function accept(selector) {
    cy.get(selector).last().closest(".dialog").find('button[data-action="ok"]').click();
}

describe("Automated Combat guided walkthrough", () => {
    before(() => cy.login());
    after(() =>
        cy.foundry(async (win) => {
            await win.game.tours.get(KEY)?.exit();
            if (!beforeIds) return;
            if (oldHotbar) {
                await win.game.user.update(win.structuredClone({ "hotbar.-=1": null }));
                await win.game.user.update(win.structuredClone({ hotbar: oldHotbar }));
            }
            if (oldAdventureImports)
                await win.game.settings.set(
                    "core",
                    "adventureImports",
                    win.structuredClone(oldAdventureImports),
                );
            const ownedActors = new Set(
                win.game.actors
                    .filter(
                        (actor) =>
                            !beforeIds.Actor.includes(actor.id) &&
                            actor.getFlag("sohl", "automatedCombatTutorial"),
                    )
                    .map((actor) => actor.id),
            );
            const messages = win.game.messages
                .filter(
                    (message) =>
                        !beforeIds.ChatMessage.includes(message.id) &&
                        ownedActors.has(message.speaker.actor),
                )
                .map((message) => message.id);
            if (messages.length) await win.ChatMessage.deleteDocuments(messages);
            for (const name of ["Combat", "Scene", "JournalEntry", "Actor", "Macro", "Folder"]) {
                const collection = win.game.collections.get(name);
                const ids = collection.contents
                    .filter(
                        (document) =>
                            !beforeIds[name].includes(document.id) &&
                            (document.getFlag("sohl", "automatedCombatTutorial") ||
                                (name === "Macro" && document.id === importedMacroId)),
                    )
                    .map((document) => document.id);
                if (ids.length) await win.CONFIG[name].documentClass.deleteDocuments(ids);
            }
            if (oldSceneId && win.game.scenes.has(oldSceneId))
                await win.game.scenes.get(oldSceneId).activate();
        }),
    );

    it("imports, performs both real exchanges, records S2, and restores RNG", () => {
        cy.window().then((win) => {
            // Call-through spies preserve native warnings in the Cypress trace
            // when a guarded attack declines before opening its dialog.
            cy.spy(win.sohl.log, "uiWarn").as("tourWarnings");
            cy.spy(win.sohl.log, "uiError").as("tourErrors");
            cy.spy(win.console, "warn").as("tourConsoleWarnings");
        });
        cy.foundry(async (win) => {
            if (win.game.scenes.some((scene) => scene.getFlag("sohl", "automatedCombatTutorial")))
                throw new Error("Use a clean test world without existing tutorial fixtures");
            beforeIds = Object.fromEntries(
                ["Combat", "Scene", "JournalEntry", "Actor", "Macro", "Folder"].map((name) => [
                    name,
                    win.game.collections.get(name).contents.map((document) => document.id),
                ]),
            );
            beforeIds.ChatMessage = win.game.messages.contents.map((message) => message.id);
            oldHotbar = win.structuredClone(win.game.user.hotbar);
            await win.game.user.update(win.structuredClone({ "hotbar.-=1": null }));
            oldAdventureImports = win.structuredClone(
                win.game.settings.get("core", "adventureImports"),
            );
            oldSceneId = win.game.scenes.active?.id;
            rngState = win.sohl.random.getState();
            const tour = win.game.tours.get(KEY);
            if (!tour) throw new Error("Automated Combat tour was not registered");
            await tour.start();
        });
        next(); // Adventure import
        next(); // Activate tutorial scene and macro gate
        cy.get('.tour-center-step .step-button[data-action="next"]').should(
            "have.class",
            "sohl-tour-gate-disabled",
        );
        cy.foundry(async (win) => {
            const pack = win.game.packs.get("sohl.macros");
            const index = await pack.getIndex();
            const entry = index.find((document) => document.name === "Automated Attack");
            const document = await pack.getDocument(entry._id);
            const macro = await win.Macro.create(win.structuredClone(document.toObject()));
            importedMacroId = macro.id;
            await win.game.user.assignHotbarMacro(macro, 1);
        });
        next(); // Start combat
        cy.foundry((win) => win.game.combats.active.combatant.actor.system.shortcode).should(
            "eq",
            "tutorialhuman",
        );
        next(); // Human targets the orc
        next(); // Opens the real attack dialog
        accept('select[name="modeIdx"]');
        next(); // Choose Block
        cy.get('[data-action="automatedBlockResume"]')
            .last()
            .closest(".card-buttons")
            .find("button")
            .should("have.length", 4);
        cy.get('[data-action="automatedBlockResume"]').last().click();
        next(); // Defended result
        cy.foundry((win) => win.game.tours.get(KEY).currentSohlStep.id).should("eq", "blocked");
        cy.get(".chat-card .result-desc").last().should("contain.text", "Attack misses");
        next(); // Orc turn, target swap
        cy.foundry((win) => win.game.combats.active.combatant.actor.system.shortcode).should(
            "eq",
            "tutorialgrukaruk",
        );
        next(); // Orc attack
        accept('select[name="modeIdx"]');
        next(); // Human Block
        cy.get('[data-action="automatedBlockResume"]')
            .last()
            .closest(".card-buttons")
            .find("button")
            .should("have.length", 4);
        cy.get('[data-action="automatedBlockResume"]').last().click();
        next(); // Automatic impact callout
        cy.get(".chat-card .result-desc")
            .last()
            .closest(".chat-card")
            .find(".grid .critical-failure-block")
            .should("have.length", 1);
        cy.get('.chat-card [data-action="resolveInjury"]').last().should("be.visible");
        next(); // Injury step snapshots existing trauma IDs
        cy.get('.chat-card [data-action="resolveInjury"]').last().click();
        cy.get('input[name="autoAddInjury"]').check();
        accept('input[name="autoAddInjury"]');
        next(); // Owned S2 gate
        cy.get('.tour-center-step .step-button[data-action="next"]').should(
            "not.have.class",
            "sohl-tour-gate-disabled",
        );
        cy.foundry((win) => {
            const scene = win.game.scenes.get(win.game.tours.get(KEY).tutorialSceneId);
            const human = scene.tokens.find(
                (token) => token.actor.system.shortcode === "tutorialhuman",
            ).actor;
            return human.items
                .filter((item) => item.type === "trauma" && item.system.subType === "injury")
                .map((item) => item.system.levelBase);
        }).should("include", 2);
        next(); // Wrap-up
        cy.get('.tour-center-step .step-button[data-action="next"]').click();
        cy.get(".tour-center-step").should("not.exist");
        cy.window().should((win) => {
            expect(win.sohl.random.getState()).to.deep.equal(rngState);
        });
    });
});
