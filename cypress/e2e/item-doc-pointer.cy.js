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
 * **Item docs** (#1348) — a shipped item's prose lives in the journals pack, and
 * the item carries only a `@UUID` pointer to it.
 *
 * The pointer is built by one pack pass and the page it addresses by another,
 * neither able to see the other's output (`@heroiclands/package-build/engine/item-docs`), and it
 * is followed at runtime by `resolveDescription`. Unit tests cover each half:
 * that the two passes derive the same ids, and that a pointer description
 * resolves to its target. Only a real Foundry can prove the join — that the
 * UUID the build wrote addresses a document that is actually in the shipped
 * compendium, across packs.
 *
 * So this spec uses **no fixtures**: it reads a real item out of `sohl.items`
 * and asserts its description card shows prose that exists nowhere in the item.
 */

/** A shipped item whose description is a paragraph of ordinary prose. */
const ITEM = { type: "armorgear", shortcode: "MHbk" };

describe("Item docs — a shipped description is a pointer (#1348)", () => {
    before(() => cy.login().then(() => cy.cleanupWorld()));
    afterEach(() => cy.cleanupWorld());

    it("ships the description as a link, not as prose", () => {
        cy.getFromCompendium("sohl.items", ITEM.type, ITEM.shortcode).then(
            (item) => {
                cy.foundry((win) => {
                    const doc = win.fromUuidSync(item.uuid);
                    return doc.system.docHtml;
                }).should((html) => {
                    expect(html, "description is a bare @UUID link").to.match(
                        /^@UUID\[Compendium\.sohl\.journals\.JournalEntry\.[A-Za-z0-9]+\.JournalEntryPage\.[A-Za-z0-9]+\]\{[^}]*\}$/,
                    );
                });
            },
        );
    });

    it("resolves that link to a real page in the journals pack", () => {
        cy.getFromCompendium("sohl.items", ITEM.type, ITEM.shortcode).then(
            (item) => {
                cy.foundry(async (win) => {
                    const doc = win.fromUuidSync(item.uuid);
                    const uuid = doc.system.docHtml.slice(
                        "@UUID[".length,
                        doc.system.docHtml.indexOf("]"),
                    );
                    const page = await win.fromUuid(uuid);
                    return {
                        name: page?.name ?? null,
                        itemName: doc.name,
                        content: page?.text?.content ?? "",
                        // The doc is filed with its item: the journals pack
                        // declares the same folder tree the items pack does
                        // (#1358), so the id resolves to a real Folder on both
                        // sides rather than dropping the entry at the root.
                        docFolder: page?.parent?.folder?.id ?? null,
                        itemFolder: doc.folder?.id ?? null,
                    };
                }).should((r) => {
                    expect(r.name, "the page exists").to.eq(r.itemName);
                    expect(r.content, "and holds rendered prose").to.contain(
                        "<p>",
                    );
                    expect(
                        r.content.length,
                        "of a paragraph's worth, not a link",
                    ).to.be.greaterThan(100);
                    expect(r.docFolder, "the doc is filed with its item").to.eq(
                        r.itemFolder,
                    );
                });
            },
        );
    });

    it("posts the target's prose on the description card, never the link", () => {
        cy.createActor("being", { name: "doc-pointer-owner" }).then((actor) => {
            cy.getFromCompendium("sohl.items", ITEM.type, ITEM.shortcode)
                .then((src) => cy.dropOnActor(actor, src))
                .then((item) => {
                    cy.foundry(async (win) => {
                        const it = win.game.actors
                            .get(actor.id)
                            .items.get(item.id);
                        // The embedded copy carries the pointer, not the prose —
                        // which is the whole point: the actor is 60 bytes, not
                        // 2 KB, and shows the item's current description.
                        const stored = it.system.docHtml;
                        const uuid = stored.slice(
                            "@UUID[".length,
                            stored.indexOf("]"),
                        );
                        const page = await win.fromUuid(uuid);
                        await it.logic.outputDescription(
                            it.logic._getContext(),
                        );
                        return {
                            stored,
                            content:
                                [...win.game.messages].at(-1)?.content ?? "",
                            // A distinctive phrase from the page itself.
                            phrase: (page.text.content.match(/>([^<]{40,})</) ??
                                [])[1]?.trim(),
                        };
                    }).should((r) => {
                        expect(
                            r.stored,
                            "embedded item stores the pointer",
                        ).to.contain("@UUID[Compendium.sohl.journals");
                        expect(r.phrase, "page prose was found").to.be.a(
                            "string",
                        );
                        expect(
                            r.content,
                            "the card shows the target's prose",
                        ).to.contain(r.phrase);
                        expect(
                            r.content,
                            "and not the raw pointer",
                        ).to.not.contain("@UUID[");
                    });
                });
        });
    });
});

/**
 * **The Description tab** (#1357) — the sheet half of the same convention. A
 * pointer must read as its target on the tab, not as the link that addresses it,
 * with an edit control that hands the author the editor when they ask for it.
 */
describe("Item docs — the Description tab follows a pointer (#1357)", () => {
    before(() => cy.login().then(() => cy.cleanupWorld()));
    afterEach(() => cy.closeAllSheets().then(() => cy.cleanupWorld()));

    /** The pointer a shipped item carries, reused so no fixture journal is needed. */
    function shippedPointer() {
        return cy
            .getFromCompendium("sohl.items", ITEM.type, ITEM.shortcode)
            .then((item) =>
                cy.foundry((win) => win.fromUuidSync(item.uuid).system.docHtml),
            );
    }

    /** Open an item's sheet on its Description tab and yield the tab section. */
    function openDescriptionTab(item) {
        cy.openSheet(item);
        cy.switchTab("description", "sheet");
        return cy.get('section.tab[data-tab="description"]');
    }

    it("shows the target's text read-only, with an edit control", () => {
        shippedPointer().then((pointer) => {
            cy.createWorldItem("miscgear", { system: { docHtml: pointer } })
                .then((item) => {
                    // A distinctive phrase from the page the pointer addresses.
                    cy.foundry(async (win) => {
                        const uuid = pointer.slice(
                            "@UUID[".length,
                            pointer.indexOf("]"),
                        );
                        const page = await win.fromUuid(uuid);
                        return (page.text.content.match(/>([^<]{40,})</) ??
                            [])[1]?.trim();
                    }).as("phrase");
                    openDescriptionTab(item);
                })
                .then(function () {
                    cy.get('section.tab[data-tab="description"]')
                        .find(".prose-panel__rendered")
                        .should("contain.text", this.phrase);
                    // The editor is not rendered at all until asked for.
                    cy.get('section.tab[data-tab="description"]')
                        .find("prose-mirror")
                        .should("not.exist");
                    cy.get('section.tab[data-tab="description"]')
                        .find('[data-action="toggleDescriptionEdit"]')
                        .should("be.visible");
                });
        });
    });

    it("reveals the editor holding the link, and switches back", () => {
        shippedPointer().then((pointer) => {
            cy.createWorldItem("miscgear", {
                system: { docHtml: pointer },
            }).then((item) => {
                openDescriptionTab(item);
                cy.get('[data-action="toggleDescriptionEdit"]').click();

                // The element consumes its `value` attribute on hydration, so
                // the link is read off the property it kept.
                cy.get('section.tab[data-tab="description"]')
                    .find('prose-mirror[name="system.docHtml"]')
                    .should(($el) => {
                        expect(
                            $el[0].value,
                            "the editor holds the link",
                        ).to.contain("@UUID[Compendium.sohl.journals");
                    });

                // And back: the control is a toggle, not a one-way door.
                cy.get('[data-action="toggleDescriptionEdit"]').click();
                cy.get('section.tab[data-tab="description"]')
                    .find(".prose-panel__rendered")
                    .should("exist");
            });
        });
    });

    it("gives an ordinary description the editor directly, with no toggle", () => {
        cy.createWorldItem("miscgear", {
            system: { docHtml: "<p>A wide flat blade.</p>" },
        }).then((item) => {
            openDescriptionTab(item);
            cy.get('section.tab[data-tab="description"]')
                .find('prose-mirror[name="system.docHtml"]')
                .should("exist");
            cy.get('section.tab[data-tab="description"]')
                .find('[data-action="toggleDescriptionEdit"]')
                .should("not.exist");
        });
    });

    it("shows the broken link, not an empty tab, when the target is gone", () => {
        cy.createWorldItem("miscgear", {
            system: {
                docHtml:
                    "@UUID[JournalEntry.zzzzzzzzzzzzzzzz.JournalEntryPage.zzzzzzzzzzzzzzzz]{Missing Page}",
            },
        }).then((item) => {
            openDescriptionTab(item);
            cy.get('section.tab[data-tab="description"]')
                .find(".prose-panel__rendered")
                .should("contain.text", "Missing Page");
        });
    });
});
