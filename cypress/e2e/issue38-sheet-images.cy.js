/*
 * This file is part of the Song of Heroic Lands (SoHL) system for Foundry VTT.
 * Copyright (c) 2024-2026 Tom Rodriguez ("Toasty") — <toasty@heroiclands.org>
 *
 * This work is licensed under the GNU General Public License v3.0 (GPLv3).
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { actorFactory } from "../support/factories/actorFactory.js";
import { ITEM_KINDS, itemFactory } from "../support/factories/itemFactory.js";
import { toRealm } from "../support/resolve.js";

const ACTOR_KINDS = ["being", "cohort", "structure", "vehicle"];

const ITEM_SAMPLES = {
    affiliation: { name: "Northbank Fellowship" },
    affliction: { name: "River Fever" },
    armorgear: { name: "Riveted Jack" },
    attribute: { name: "Resolve" },
    concoctiongear: { name: "Bitter Tonic" },
    containergear: { name: "Travel Chest" },
    trauma: { name: "Bruised Shoulder" },
    miscgear: { name: "Lantern" },
    mystery: {
        name: "Quiet Step",
        system: { levelBase: 2, charges: { value: 2, max: 5 } },
    },
    mysticalability: { name: "Read the Wind" },
    projectilegear: { name: "Fletched Arrow" },
    skill: { name: "River Lore" },
    weapongear: { name: "Short Spear" },
};

// A small selection of the fields most useful to recognize on each Properties
// tab. The capture decorates these real rendered controls, then names each one
// in a DOM legend appended to that tab; it never paints or edits the screenshot.
const ITEM_CALLOUTS = {
    affiliation: ["subType", "society", "office"],
    affliction: ["category", "levelBase", "transmission", "onsetDurationFormula"],
    armorgear: ["quantity", "isCarried", "isWorn", "protectionBase.blunt"],
    attribute: ["scoreBase", "initDiceFormula"],
    concoctiongear: ["quantity", "potency", "strength"],
    containergear: ["quantity", "maxCapacityBase"],
    trauma: ["bodyLocationCode", "healingCheckDurationFormula", "bloodLossAdvanceDurationBase"],
    miscgear: ["quantity", "weightBase", "valueBase"],
    mystery: ["levelBase", "charges.value", "charges.max"],
    mysticalability: ["masteryLevelBase", "levelBase", "charges.value"],
    projectilegear: ["quantity", "impactBase.numDice"],
    skill: ["subType", "masteryLevelBase", "skillBaseFormula"],
    weapongear: ["quantity", "encumbranceBase", "heftBase"],
};

const createdActorIds = [];
const createdItemIds = [];

function fieldName(path) {
    return `system.${path}`;
}

function assertCaptureCoverage(win) {
    const actorKinds = Object.keys(win.CONFIG.Actor.dataModels).sort();
    const itemKinds = Object.keys(win.CONFIG.Item.dataModels).sort();
    const expectedActors = [...ACTOR_KINDS].sort();
    const expectedItems = [...ITEM_KINDS].sort();
    const sampleKinds = Object.keys(ITEM_SAMPLES).sort();
    const annotatedKinds = Object.keys(ITEM_CALLOUTS).sort();

    if (JSON.stringify(actorKinds) !== JSON.stringify(expectedActors)) {
        throw new Error(`Actor capture registry mismatch: ${actorKinds.join(", ")}`);
    }
    if (JSON.stringify(itemKinds) !== JSON.stringify(expectedItems)) {
        throw new Error(`Item capture registry mismatch: ${itemKinds.join(", ")}`);
    }
    if (JSON.stringify(sampleKinds) !== JSON.stringify(itemKinds)) {
        throw new Error(`Item sample map mismatch: ${sampleKinds.join(", ")}`);
    }
    if (JSON.stringify(annotatedKinds) !== JSON.stringify(itemKinds)) {
        throw new Error(`Item annotation map mismatch: ${annotatedKinds.join(", ")}`);
    }
}

function decorateActorSheet(sheet, kind) {
    const doc = sheet.ownerDocument;
    const style = doc.createElement("style");
    style.textContent = `
        .issue38-actor-mark { position: absolute; z-index: 100; right: 8px; top: 8px;
            padding: 3px 7px; border: 1px solid #743b1e; border-radius: 12px;
            background: #fff8e8; color: #4c2815; font: 600 12px/1.2 sans-serif;
            box-shadow: 0 1px 4px #0004; pointer-events: none; }
        .issue38-actor-part { position: relative !important; }
        .issue38-tab-callout-row { display: flex; justify-content: flex-end; padding: 2px 8px;
            min-height: 22px; background: #fff8e8; }
        .issue38-actor-key { margin: 8px 12px; padding: 6px 9px; border-left: 3px solid #743b1e;
            background: #fff8e8; color: #3f3028; font: 12px/1.35 sans-serif; }
    `;
    sheet.append(style);

    const tabBar = sheet.querySelector('[role="tablist"], nav.tabs, .sheet-tabs');
    const parts = [
        [sheet.querySelector(".sheet-header"), "Header"],
        [sheet.querySelector("section.tab.active"), "Tab body"],
    ];
    for (const [element, text] of parts) {
        if (!element) continue;
        element.classList.add("issue38-actor-part");
        const mark = doc.createElement("span");
        mark.className = "issue38-actor-mark";
        mark.textContent = text;
        if (text === "Header") {
            mark.style.right = "76px";
            mark.style.top = "12px";
        }
        element.append(mark);
    }

    if (tabBar) {
        const row = doc.createElement("div");
        row.className = "issue38-tab-callout-row";
        const mark = doc.createElement("span");
        mark.className = "issue38-actor-mark";
        mark.textContent = "Tabs";
        mark.style.position = "static";
        mark.style.boxShadow = "none";
        row.append(mark);
        tabBar.after(row);
    }

    const key = doc.createElement("div");
    key.className = "issue38-actor-key";
    key.textContent = `${kind[0].toUpperCase()}${kind.slice(1)} sheet · Header, tabs, and the active tab body are labelled.`;
    sheet.append(key);
}

function decorateItemProperties(sheet, kind) {
    const tab = sheet.querySelector('section.tab[data-tab="properties"]');
    if (!tab) throw new Error(`${kind}: Properties tab did not render`);

    const doc = sheet.ownerDocument;
    const style = doc.createElement("style");
    style.textContent = `
        .issue38-field-number { display: inline-block; min-width: 18px; margin-left: 5px;
            padding: 1px 4px; border-radius: 9px; background: #743b1e; color: white;
            text-align: center; font: 700 11px/1.25 sans-serif; vertical-align: 1px; }
        .issue38-field-key { margin: 10px 0 0; padding: 8px 10px; border: 1px solid #9c795f;
            border-radius: 4px; background: #fff8e8; color: #3f3028; font: 12px/1.5 sans-serif; }
        .issue38-field-key strong { display: block; margin-bottom: 3px; }
    `;
    sheet.append(style);

    const key = doc.createElement("div");
    key.className = "issue38-field-key";
    const heading = doc.createElement("strong");
    heading.textContent = "Field guide";
    key.append(heading);
    const labels = [];
    for (const path of ITEM_CALLOUTS[kind]) {
        const target = tab.querySelector(`[name="${fieldName(path)}"]`);
        if (!target) continue; // Some model fields are conditional by item subtype.
        const group = target.closest(".form-group") ?? target.parentElement;
        const label = group?.querySelector("label");
        const visibleName = label?.textContent?.trim().replace(/\s+/g, " ") || path;
        const number = labels.length + 1;
        const badge = doc.createElement("span");
        badge.className = "issue38-field-number";
        badge.textContent = String(number);
        badge.setAttribute("aria-label", `Field ${number}: ${visibleName}`);
        (label ?? group ?? target).append(badge);
        labels.push(`${number}. ${visibleName}`);
    }
    if (!labels.length) throw new Error(`${kind}: no registered callout fields are visible`);
    key.append(doc.createTextNode(labels.join(" · ")));
    tab.prepend(key);
}

function closeOwnSheet(docName, id) {
    return cy.foundry(async (win) => {
        const doc = win.game[docName === "Actor" ? "actors" : "items"].get(id);
        if (doc?.sheet?.rendered) await doc.sheet.close({ animate: false });
    });
}

function fitOwnSheet(docName, id) {
    return cy.foundry(async (win) => {
        const collection = docName === "Actor" ? win.game.actors : win.game.items;
        const doc = collection.get(id);
        // Keep the capture to a real, readable, user-resizable sheet window and
        // place it wholly inside the current game viewport before photographing.
        const width = Math.min(1100, win.innerWidth - 24);
        const height = Math.min(980, win.innerHeight - 24);
        await doc.sheet.setPosition({ left: 12, top: 12, width, height });
    });
}

describe("issue 38 sheet reference images", () => {
    before(() => {
        cy.login();
        cy.foundry((win) => {
            assertCaptureCoverage(win);
            return true;
        });
        cy.viewport(1600, 1200);
    });

    after(() =>
        cy.foundry(async (win) => {
            // Delete only documents this spec created. The test world is shared;
            // global cleanup would erase another session's fixtures.
            if (createdItemIds.length) await win.Item.deleteDocuments([...createdItemIds]);
            if (createdActorIds.length) await win.Actor.deleteDocuments([...createdActorIds]);
        }),
    );

    it("captures all registered actor sheets and item Properties tabs", () => {
        const captureOnly = Cypress.expose("issue38Only");
        const only = typeof captureOnly === "string" ? new Set(captureOnly.split(",")) : null;

        for (const kind of ITEM_KINDS) {
            if (only && !only.has(`item${kind}`)) continue;
            cy.foundry((win) => {
                const override = ITEM_SAMPLES[kind] ?? {};
                const system = {
                    ...(override.system ?? {}),
                    ...(kind === "armorgear" ? { isCarried: true, isWorn: true } : {}),
                };
                return win.Item.create(toRealm(win, itemFactory(kind, { ...override, system })));
            }).then((item) => {
                createdItemIds.push(item.id);
                return cy
                    .openSheet(item)
                    .then(() => fitOwnSheet("Item", item.id))
                    .then(() => cy.openSheet(item))
                    .then(($sheet) => {
                        decorateItemProperties($sheet[0], kind);
                        return cy.wrap($sheet).screenshot(`item-${kind}-properties`);
                    })
                    .then(() => closeOwnSheet("Item", item.id));
            });
        }

        for (const kind of ACTOR_KINDS) {
            if (only && !only.has(`actor${kind}`)) continue;
            cy.foundry((win) =>
                win.Actor.create(
                    toRealm(
                        win,
                        actorFactory(kind, {
                            name: `${kind[0].toUpperCase()}${kind.slice(1)} Example`,
                            system: {
                                appearance: "<p>Sample appearance for this sheet reference.</p>",
                            },
                        }),
                    ),
                ),
            ).then((actor) => {
                createdActorIds.push(actor.id);
                return cy
                    .openSheet(actor)
                    .then(() => fitOwnSheet("Actor", actor.id))
                    .then(() => cy.openSheet(actor))
                    .then(($sheet) => {
                        decorateActorSheet($sheet[0], kind);
                        return cy.wrap($sheet).screenshot(`actor-${kind}`);
                    })
                    .then(() => closeOwnSheet("Actor", actor.id));
            });
        }
    });
});
