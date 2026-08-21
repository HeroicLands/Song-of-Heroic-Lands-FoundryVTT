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
 * Map notes compiled to Scenes (#1525), against the shipped packs.
 *
 * The unit suite proves the markdown → document translation; this proves the
 * result is a real Foundry Scene in a real client: the synthesised Level
 * survives packing, an Adventure import resolves a map pin and a cross-scene
 * teleport address, re-importing updates rather than duplicates, and a token
 * moved into an authored region reaches the SoHL trigger behaviour.
 *
 * The fixture is `assets/content/Maps/Wayfarers_Rest_*.md` — two floors of one
 * place, so the Adventure holds two scenes and the stairs address each other.
 */

const ADVENTURE = "Wayfarer's Rest";
const GROUND = "Wayfarer's Rest, Ground Floor";
const LOFT = "Wayfarer's Rest, Loft";

/** Import the adventure's content, without the sheet or its overwrite dialog. */
async function importAdventure(win) {
    const pack = win.game.packs.get("sohl.adventures");
    if (!pack) throw new Error("No compendium pack 'sohl.adventures'");
    const index = await pack.getIndex();
    const entry = index.find((e) => e.name === ADVENTURE);
    if (!entry) throw new Error(`No adventure named "${ADVENTURE}"`);
    const adventure = await pack.getDocument(entry._id);
    // `prepareImport` + `importContent` is `Adventure#import` without the sheet
    // hooks, the sidebar re-render, and the overwrite-confirm DialogV2 that
    // would hang a headless run.
    const data = await adventure.prepareImport({ importFields: [] });
    const result = await adventure.importContent(data);
    return { adventure, data, result };
}

describe("Map notes → Scenes (#1525)", () => {
    before(() => cy.login().then(() => cy.cleanupWorld()));

    after(() => {
        // The imported documents keep their authored names and ids, so the
        // tag-based sweep cannot see them — remove them by name.
        cy.foundry(async (win) => {
            const scenes = win.game.scenes.filter((s) =>
                [GROUND, LOFT].includes(s.name),
            );
            const journals = win.game.journal.filter((j) =>
                [GROUND, LOFT].includes(j.name),
            );
            if (scenes.length)
                await win.Scene.deleteDocuments(scenes.map((s) => s.id));
            if (journals.length)
                await win.JournalEntry.deleteDocuments(
                    journals.map((j) => j.id),
                );
            return true;
        });
        cy.cleanupWorld();
    });

    it("ships each map as a Scene carrying its synthesised Level", () => {
        cy.foundry(async (win) => {
            const pack = win.game.packs.get("sohl.scenes");
            const index = await pack.getIndex();
            const entry = index.find((e) => e.name === GROUND);
            const scene = entry && (await pack.getDocument(entry._id));
            const level = scene?.levels.contents[0];
            return {
                found: !!scene,
                width: scene?.width,
                grid: { size: scene?.grid.size, units: scene?.grid.units },
                levelCount: scene?.levels.size,
                levelId: level?.id,
                initialLevel: scene?._source.initialLevel,
                background: level?.background.src,
                levelName: level?.name,
                walls: scene?.walls.size,
                regions: scene?.regions.size,
                notes: scene?.notes.size,
                sounds: scene?.sounds.size,
                tiles: scene?.tiles.size,
                lights: scene?.lights.size,
            };
        }).should((s) => {
            expect(s.found, "the map compiled into sohl.scenes").to.be.true;
            expect(s.width).to.eq(512);
            expect(s.grid).to.deep.eq({ size: 64, units: "ft" });
            // Exactly one Level, and it is the scene's initial one — the map
            // image lives on it, not on the Scene.
            expect(s.levelCount).to.eq(1);
            expect(s.levelId).to.eq("defaultLevel0000");
            expect(s.initialLevel).to.eq("defaultLevel0000");
            // A scene stamped older than core 14.353 has its authored Level
            // silently replaced by `migrateLevels` with one named after the
            // scene and carrying no image, so both facts are asserted.
            expect(s.levelName, "the authored Level, not a migrated one").to.eq(
                "Ground",
            );
            expect(s.background).to.eq("systems/sohl/assets/ui/parchment.jpg");
            expect(s.walls, "walls and doors").to.eq(7);
            expect(s.regions).to.eq(3);
            expect(s.notes, "map pins").to.eq(3);
            expect(s.sounds).to.eq(1);
            expect(s.tiles).to.eq(1);
            expect(s.lights).to.eq(1);
        });
    });

    it("compiles authored region behaviours, including the SoHL trigger", () => {
        cy.foundry(async (win) => {
            const pack = win.game.packs.get("sohl.scenes");
            const index = await pack.getIndex();
            const scene = await pack.getDocument(
                index.find((e) => e.name === GROUND)._id,
            );
            const byName = (n) => scene.regions.find((r) => r.name === n);
            const common = byName("Common Room");
            const trigger = common.behaviors.contents[0];
            const smoke = byName("Smoke Bay");
            return {
                behaviorType: trigger.type,
                events: [...(trigger.system.events ?? [])],
                actionName: trigger.system.actionName,
                shapeType: common.shapes[0].type,
                // Derived, never authored: a hashed colour keeps the build
                // reproducible where Foundry's default is random.
                color: String(common.color),
                // A restricted region must belong to exactly one level.
                restriction: smoke._source.restriction,
                smokeLevels: [...smoke.levels],
            };
        }).should((r) => {
            expect(r.behaviorType).to.eq("trigger");
            expect(r.events).to.include("tokenEnter");
            expect(r.actionName).to.eq("reactionTest");
            expect(r.shapeType).to.eq("polygon");
            expect(r.color).to.match(/^#[0-9a-f]{6}$/);
            expect(r.restriction).to.include({ enabled: true, type: "light" });
            expect(r.smokeLevels).to.deep.eq(["defaultLevel0000"]);
        });
    });

    it("imports as an Adventure whose pins and teleport address resolve", () => {
        cy.foundry(async (win) => {
            const { result } = await importAdventure(win);
            const ground = win.game.scenes.find((s) => s.name === GROUND);
            const loft = win.game.scenes.find((s) => s.name === LOFT);

            // A pin points at a journal page by bare id — which only resolves
            // because the Adventure import kept ids (`keepId: true`).
            const note = ground.notes.find((n) => !!n.pageId);
            const entry = win.game.journal.get(note.entryId);
            const page = entry?.pages.get(note.pageId);

            // The stair addresses the other floor's region as a UUID the
            // builder resolved from `{map, region}`.
            const teleport = ground.regions
                .find((r) => r.name === "Stair Foot")
                .behaviors.find((b) => b.type === "teleportToken");
            const [destination] = [...teleport.system.destinations];
            const target = await win.fromUuid(destination);

            return {
                createdScenes: (result.created.Scene ?? []).length,
                groundId: ground?.id,
                pinEntry: entry?.name,
                pinPage: page?.name,
                destination,
                targetName: target?.name,
                targetParent: target?.parent?.name,
            };
        }).should((r) => {
            expect(r.createdScenes, "both floors imported").to.eq(2);
            expect(r.groundId).to.eq("Xwo4dsmey2A3Rvrn");
            expect(r.pinEntry, "the pin's journal came with the map").to.eq(
                GROUND,
            );
            expect(r.pinPage, "and the page it addresses exists").to.be.a(
                "string",
            );
            expect(r.destination).to.match(/^Scene\..+\.Region\..+$/);
            expect(r.targetName).to.eq("Stair Head");
            expect(r.targetParent).to.eq(LOFT);
        });
    });

    it("re-importing updates the existing documents rather than duplicating", () => {
        cy.foundry(async (win) => {
            const before = win.game.scenes.filter((s) =>
                [GROUND, LOFT].includes(s.name),
            ).length;
            const { data, result } = await importAdventure(win);
            return {
                before,
                // Everything already present is routed to `toUpdate`.
                toCreate: Object.keys(data.toCreate),
                updatedScenes: (result.updated.Scene ?? []).length,
                after: win.game.scenes.filter((s) =>
                    [GROUND, LOFT].includes(s.name),
                ).length,
            };
        }).should((r) => {
            expect(r.before).to.eq(2);
            expect(r.toCreate, "nothing left to create").to.be.empty;
            expect(r.updatedScenes).to.eq(2);
            expect(r.after, "still two, not four").to.eq(2);
        });
    });

    it("flagging a restricted region's shape constraints is inert headless (#1535)", () => {
        cy.foundry(async (win) => {
            await importAdventure(win);
            const ground = win.game.scenes.find((s) => s.name === GROUND);
            // Record every embedded write the flag provokes, without
            // suppressing it — if the scheduled pass runs at all it lands here
            // as a "Region" write, empty update list or not.
            const written = [];
            const real = ground.updateEmbeddedDocuments;
            ground.updateEmbeddedDocuments = function (type, ...rest) {
                written.push(type);
                return real.call(this, type, ...rest);
            };
            ground.updateRegionShapeConstraints();
            // Core throttles the flag by 250ms and then defers the pass to a
            // PIXI ticker callback; give both room to fire inside this test, so
            // an unguarded throw fails *here* rather than in an unrelated spec.
            await new Promise((res) => win.setTimeout(res, 1500));
            delete ground.updateEmbeddedDocuments;
            return {
                viewedScene: win.canvas?.scene ?? null,
                restricted: ground.regions.filter((r) => r.restriction.enabled)
                    .length,
                regionWrites: written.filter((t) => t === "Region").length,
            };
        }).should((r) => {
            expect(r.viewedScene, "no scene is viewed headless").to.be.null;
            expect(
                r.restricted,
                "the fixture ships a restricted region",
            ).to.be.gte(1);
            expect(
                r.regionWrites,
                "no shape-constraint pass is attempted with no scene viewed",
            ).to.eq(0);
        });
    });

    it("a token moved into an authored region reaches the SoHL trigger", () => {
        cy.importActor().then((actor) => {
            cy.foundry(async (win) => {
                const ground = win.game.scenes.find((s) => s.name === GROUND);
                const region = ground.regions.find(
                    (r) => r.name === "Common Room",
                );
                const a = win.game.actors.get(actor.id);
                // Start outside the Common Room polygon (96,96 → 416,416):
                // a 1x1 token at (0, 0) centres on (32, 32).
                const td = await a.getTokenDocument(
                    win.structuredClone({ x: 0, y: 0, actorLink: true }),
                    { parent: ground },
                );
                const obj = td.toObject();
                obj.actorLink = true;
                const [token] = await td.constructor.createDocuments([obj], {
                    parent: ground,
                });

                const outside = region.tokens.size;
                const before = win.game.messages.size;
                // Region containment is geometry, not rendering: it resolves
                // with no canvas, so a plain update delivers `tokenEnter`.
                //
                // `animate: false` is load-bearing headless. An animated move
                // drives Foundry's movement animation from the PIXI ticker,
                // and that ticker callback reaches into `game.users` and the
                // canvas on a viewport that never finishes initializing —
                // throwing `reading 'id'` / `reading 'OBJECTS'` out of
                // application code, which fails the test for reasons that have
                // nothing to do with regions. Nothing here is about animation.
                await token.update(win.structuredClone({ x: 192, y: 192 }), {
                    animate: false,
                });
                await new Promise((res) => win.setTimeout(res, 200));

                const div = win.document.createElement("div");
                div.innerHTML =
                    win.game.messages.contents.at(-1)?.content ?? "";
                const button = div.querySelector(
                    'button.action-card-button[data-action="reactionTest"]',
                );
                const result = {
                    outside,
                    inside: region.tokens.size,
                    contains: region.testPoint({
                        x: 224,
                        y: 224,
                        elevation: 0,
                    }),
                    cardsPosted: win.game.messages.size - before,
                    hasPerformButton: !!button,
                    handlerUuid: button?.dataset.handlerUuid,
                    actorUuid: a.uuid,
                };
                await token.delete();
                return result;
            }).should((r) => {
                expect(r.outside, "started outside the region").to.eq(0);
                expect(r.inside, "and ended inside it").to.eq(1);
                expect(r.contains, "geometry resolves headless").to.be.true;
                expect(
                    r.cardsPosted,
                    "the trigger offered its action",
                ).to.be.gte(1);
                expect(r.hasPerformButton).to.be.true;
                // Offered to the entering token's actor — its owner performs.
                expect(r.handlerUuid).to.eq(r.actorUuid);
            });
        });
    });
});
