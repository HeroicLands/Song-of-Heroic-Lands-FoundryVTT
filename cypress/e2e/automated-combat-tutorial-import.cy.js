/*
 * This file is part of the Song of Heroic Lands (SoHL) system for Foundry VTT.
 * Copyright (c) 2024-2026 Tom Rodriguez ("Toasty") — <toasty@heroiclands.org>
 *
 * This work is licensed under the GNU General Public License v3.0 (GPLv3).
 * You may copy, modify, and distribute it under the terms of the license.
 *
 * For full terms, see the LICENSE.md file in the project root or visit:
 * https://www.gnu.org/licenses/gpl-3.0.html
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

/**
 * Import the authored Automated Combat Tutorial Adventure through Foundry's
 * real Adventure workflow. The preflight refuses any import that would update
 * world documents, because Adventure imports retain their source IDs.
 */

const PACK_ID = "sohl.tutorial-adventures";
const ADVENTURE_NAME = "Automated Combat Tutorial";
const FRAMING_JOURNAL = "The Ambush on the Path";
const MAP_JOURNAL = "Automated Combat Tutorial Path";
const BUILD_ONLY_PACKS = ["sohl.scenes", "sohl.adventures"];
const CLEANUP_ORDER = [
    "Combat",
    "Scene",
    "JournalEntry",
    "Actor",
    "Item",
    "Macro",
    "RollTable",
    "Cards",
    "Playlist",
    "Folder",
];

let importedAdventureUuid;
let importedIds = {};
let adventureImportWasAlreadyRecorded = false;

function idMap(groups) {
    return Object.fromEntries(
        Object.entries(groups ?? {})
            .map(([documentName, docs]) => [documentName, docs.map((doc) => doc.id ?? doc._id)])
            .filter(([, ids]) => ids.length),
    );
}

function countDocuments(groups) {
    return Object.values(groups ?? {}).reduce((sum, docs) => sum + docs.length, 0);
}

describe("Automated Combat Tutorial Adventure import", () => {
    before(() => cy.login());

    after(() =>
        cy.foundry(async (win) => {
            // Foundry imports Adventures with keepId:true. Delete only ids this
            // test proved absent before import and then observed in its result.
            for (const documentName of CLEANUP_ORDER) {
                const ids = importedIds[documentName] ?? [];
                if (!ids.length) continue;

                const collection = win.game.collections.get(documentName);
                const presentIds = ids.filter((id) => collection?.has(id));
                if (!presentIds.length) continue;

                const documentClass = win.CONFIG[documentName]?.documentClass ?? win[documentName];
                if (!documentClass?.deleteDocuments) {
                    throw new Error(`Cannot clean imported ${documentName} documents`);
                }
                await documentClass.deleteDocuments(presentIds);
            }

            // Adventure.import records an import in core settings. Remove only
            // the marker added by this spec and preserve every other entry.
            if (importedAdventureUuid && !adventureImportWasAlreadyRecorded) {
                const records = win.game.settings.get("core", "adventureImports") ?? {};
                if (Object.hasOwn(records, importedAdventureUuid)) {
                    const next = { ...records };
                    delete next[importedAdventureUuid];
                    await win.game.settings.set("core", "adventureImports", next);
                }
            }
        }),
    );

    it("imports the populated actors, adjacent linked scene, and framing journal without combat", () => {
        cy.foundry(async (win) => {
            const buildOnlyPacks = BUILD_ONLY_PACKS.filter((packId) => win.game.packs.has(packId));
            const pack = win.game.packs.get(PACK_ID);
            if (!pack) throw new Error(`Missing Adventure compendium ${PACK_ID}`);

            const index = await pack.getIndex();
            const entry = index.find((document) => document.name === ADVENTURE_NAME);
            if (!entry) throw new Error(`Missing Adventure ${ADVENTURE_NAME}`);

            // Compendium document UUIDs include the document type between
            // the pack name and ID (Adventure for this pack).
            const uuid = pack.getUuid(entry._id);
            const adventure = await win.fromUuid(uuid);
            if (!adventure || adventure.uuid !== uuid) {
                throw new Error(`Could not resolve Adventure UUID ${uuid}`);
            }
            const parsedUuid = win.foundry.utils.parseUuid(uuid);
            if (
                parsedUuid?.collection?.collection !== PACK_ID ||
                parsedUuid?.type !== "Adventure" ||
                parsedUuid?.id !== entry._id
            ) {
                throw new Error(
                    `Resolved UUID does not identify ${PACK_ID} Adventure ${entry._id}`,
                );
            }

            const importRecords = win.game.settings.get("core", "adventureImports") ?? {};
            adventureImportWasAlreadyRecorded = Object.hasOwn(importRecords, uuid);
            if (adventureImportWasAlreadyRecorded) {
                throw new Error(
                    `${ADVENTURE_NAME} was imported previously; refusing to replace its world data`,
                );
            }
            importedAdventureUuid = uuid;

            const prepared = await adventure.prepareImport({ importFields: ["all"] });
            const collisions = Object.entries(prepared.toUpdate ?? {}).flatMap(
                ([documentName, docs]) => docs.map((doc) => `${documentName}:${doc._id}`),
            );
            if (collisions.length) {
                throw new Error(
                    `Adventure import would overwrite existing world documents: ${collisions.join(", ")}`,
                );
            }

            // Record the IDs found absent by the preflight so a partial import
            // failure can still remove only its own newly-created documents.
            const pendingIds = idMap(prepared.toCreate);
            const combatIdsBefore = win.game.combats.contents.map((combat) => combat.id).sort();

            let result;
            try {
                result = await adventure.import({ dialog: false, importFields: ["all"] });
            } catch (error) {
                // If Foundry fails partway through import, clean only candidate
                // IDs that were absent in preflight and now exist in this world.
                const partiallyCreatedIds = Object.fromEntries(
                    Object.entries(pendingIds)
                        .map(([documentName, ids]) => {
                            const collection = win.game.collections.get(documentName);
                            return [documentName, ids.filter((id) => collection?.has(id))];
                        })
                        .filter(([, ids]) => ids.length),
                );
                return { importError: error.message, createdIds: partiallyCreatedIds };
            }

            const created = result.created ?? {};
            const updated = result.updated ?? {};
            const actors = created.Actor ?? [];
            const scenes = created.Scene ?? [];
            const journals = created.JournalEntry ?? [];
            const scene = scenes.find(
                (document) => document.name === "Automated Combat Tutorial Path",
            );
            const tokens =
                scene?.tokens.contents.map((token) => ({
                    id: token.id,
                    name: token.name,
                    actorId: token.actorId,
                    actorLink: token.actorLink,
                    x: token.x,
                    y: token.y,
                })) ?? [];
            const actorSnapshots = actors.map((actor) => {
                const weapons = actor.items.filter((item) => item.type === "weapongear");
                const club = weapons.find((item) => item.name === "Club");
                const heldClubPart = actor.system.body?.structure?.parts?.find(
                    (part) => part.heldItemId === club?.id,
                );
                const heldClub =
                    heldClubPart ? actor.items.get(heldClubPart.heldItemId) : undefined;

                return {
                    id: actor.id,
                    name: actor.name,
                    type: actor.type,
                    documentValid: actor.validate({ strict: false }) && !actor.invalid,
                    systemValid: actor.system.validate({ strict: false }) && !actor.system.invalid,
                    itemSystemsValid: actor.items.contents.every(
                        (item) => item.system.validate({ strict: false }) && !item.system.invalid,
                    ),
                    bodyParts: actor.system.body?.structure?.parts?.length ?? 0,
                    attributes: actor.items.filter((item) => item.type === "attribute").length,
                    skills: actor.items.filter((item) => item.type === "skill").length,
                    weapons: weapons.length,
                    heldClubResolved: !!heldClub && heldClub.id === club?.id,
                    heldClubMeleeModes:
                        heldClub?.system.strikeModes?.filter((mode) => mode.type === "melee")
                            .length ?? 0,
                };
            });
            const framing = journals.find((document) => document.name === FRAMING_JOURNAL);
            const framingText =
                framing?.pages.contents.map((page) => page.text?.content ?? "").join("\n") ?? "";
            const combatIdsAfter = win.game.combats.contents.map((combat) => combat.id).sort();

            return {
                uuid,
                buildOnlyPacks,
                createdIds: idMap(created),
                createdCount: countDocuments(created),
                updatedCount: countDocuments(updated),
                createdCombatCount: created.Combat?.length ?? 0,
                updatedCombatCount: updated.Combat?.length ?? 0,
                adventureCombatCount: adventure.combats.size,
                combatIdsBefore,
                combatIdsAfter,
                actors: actorSnapshots,
                scene: scene && {
                    id: scene.id,
                    name: scene.name,
                    gridSize: scene.grid.size,
                    tokens,
                    combatsOnScene: win.game.combats.contents.filter(
                        (combat) => combat.sceneId === scene.id,
                    ).length,
                },
                journals: journals.map((document) => document.name),
                framingText,
            };
        }).then((result) => {
            importedIds = result.createdIds;
            if (result.importError)
                throw new Error(`Adventure import failed: ${result.importError}`);

            expect(result.uuid).to.match(
                /^Compendium\.sohl\.tutorial-adventures\.Adventure\.[a-zA-Z0-9]+$/,
            );
            expect(result.buildOnlyPacks, "map helper compendia stay build-only").to.deep.equal([]);
            expect(result.updatedCount, "no existing documents overwritten").to.eq(0);
            expect(result.createdCount, "Adventure content created").to.be.greaterThan(0);
            expect(result.createdCombatCount, "no combat imported").to.eq(0);
            expect(result.updatedCombatCount, "no existing combat changed").to.eq(0);
            expect(result.adventureCombatCount, "source Adventure has no combats").to.eq(0);
            expect(result.combatIdsAfter, "world combat collection is unchanged").to.deep.equal(
                result.combatIdsBefore,
            );

            expect(result.actors.map((actor) => actor.name).sort()).to.deep.equal([
                "Grukar-uk",
                "The Traveler",
            ]);
            for (const actor of result.actors) {
                expect(actor.type, `${actor.name} is a Being`).to.eq("being");
                expect(actor.documentValid, `${actor.name} validates against the current model`).to
                    .be.true;
                expect(actor.systemValid, `${actor.name}'s system model validates`).to.be.true;
                expect(actor.itemSystemsValid, `${actor.name}'s Items validate`).to.be.true;
                expect(actor.bodyParts, `${actor.name} has its combat body`).to.be.at.least(6);
                expect(actor.attributes, `${actor.name} has all Attributes`).to.eq(14);
                expect(actor.skills, `${actor.name} has combat Skills`).to.be.at.least(5);
                expect(actor.weapons, `${actor.name} has melee weapons`).to.be.at.least(2);
                expect(actor.heldClubResolved, `${actor.name} holds the imported Club`).to.be.true;
                expect(
                    actor.heldClubMeleeModes,
                    `${actor.name}'s Club has melee modes`,
                ).to.be.greaterThan(0);
            }

            expect(result.scene, "tutorial melee scene imported").to.exist;
            expect(result.scene.gridSize).to.eq(100);
            expect(result.scene.tokens, "two adjacent linked actors").to.have.length(2);
            const byName = Object.fromEntries(result.actors.map((actor) => [actor.name, actor.id]));
            const humanToken = result.scene.tokens.find(
                (token) => token.actorId === byName["The Traveler"],
            );
            const grukarToken = result.scene.tokens.find(
                (token) => token.actorId === byName["Grukar-uk"],
            );
            expect(humanToken, "traveler token links to imported Actor").to.exist;
            expect(grukarToken, "grukar-uk token links to imported Actor").to.exist;
            expect(humanToken.actorLink).to.be.true;
            expect(grukarToken.actorLink).to.be.true;
            expect(grukarToken.x - humanToken.x, "tokens are one grid cell apart").to.eq(
                result.scene.gridSize,
            );
            expect(grukarToken.y, "tokens share the same row").to.eq(humanToken.y);
            expect(result.scene.combatsOnScene, "no combat attached to the scene").to.eq(0);

            expect(result.journals.sort()).to.deep.equal([FRAMING_JOURNAL, MAP_JOURNAL].sort());
            expect(result.framingText).to.include("grukar-uk steps out to block the way");
            expect(result.framingText).to.include("ready for a referee to start combat");
        });
    });
});
