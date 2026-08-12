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
 * neither able to see the other's output (`utils/packs/item-docs.mjs`), and it
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
                        // The doc records its item's folder id verbatim. Read
                        // the stored value, not the resolved `.folder`: the
                        // Folder documents themselves are declared in the
                        // items pack, so until the journals pack declares them
                        // too the id resolves to nothing.
                        docFolder: page?.parent?._source?.folder ?? null,
                        itemFolder: doc._source?.folder ?? null,
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
                    expect(
                        r.docFolder,
                        "the doc records its item's folder id",
                    ).to.eq(r.itemFolder);
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
