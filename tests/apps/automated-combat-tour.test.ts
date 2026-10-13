/*
 * This file is part of the Song of Heroic Lands (SoHL) system for Foundry VTT.
 * Copyright (c) 2024-2026 Tom Rodriguez ("Toasty") — <toasty@heroiclands.org>
 * SPDX-License-Identifier: GPL-3.0-or-later
 */
import { readFileSync } from "node:fs";
import { afterEach, describe, expect, it, vi } from "vitest";
const mocked = vi.hoisted(() => ({
    combat: undefined as any,
    preStep: undefined as (() => Promise<void>) | undefined,
    exit: vi.fn(),
}));
vi.mock("@src/entity/action/SohlActionContext", () => ({
    SohlActionContext: class {
        constructor(data: any) {
            Object.assign(this, data);
        }
    },
}));
vi.mock("@src/core/FoundryHelpers", () => ({ getActiveCombat: () => mocked.combat }));
vi.mock("@src/apps/foundry/SohlTour", () => ({
    SohlTour: class {
        constructor(public config: any) {}
        currentSohlStep: any;
        async _preStep() {
            await mocked.preStep?.();
        }
        exit() {
            mocked.exit();
        }
    },
}));
import { buildAutomatedCombatTour } from "@src/apps/foundry/tours/automated-combat-tour";
afterEach(() => {
    mocked.preStep = undefined;
    vi.unstubAllGlobals();
});
describe("Automated Combat tour", () => {
    it("is GM-only, seeded, restart-only and retains both exchanges and owned-injury gate", () => {
        vi.stubGlobal("game", { user: { isGM: true } });
        const tour = buildAutomatedCombatTour() as any;
        expect(tour.config.restricted).toBe(true);
        expect(tour.config.canBeResumed).toBe(false);
        expect(tour.config.seedRng).toBeDefined();
        expect(tour.config.canStart()).toBe(true);
        const ids = tour.config.steps.map((step: any) => step.id);
        expect(ids).toEqual([
            "intro",
            "import",
            "macro",
            "start",
            "human-target",
            "human-attack",
            "human-block",
            "blocked",
            "orc-turn",
            "orc-attack",
            "orc-block",
            "hit",
            "injury",
            "created",
            "done",
        ]);
        expect(tour.config.steps.find((step: any) => step.id === "macro").gate).toBeDefined();
        expect(tour.config.steps.find((step: any) => step.id === "created").gate).toBeDefined();
        vi.stubGlobal("game", { user: { isGM: false } });
        expect(tour.config.canStart()).toBe(false);
    });
    it("teaches automatic impact and defender injury without an obsolete impact action", () => {
        const config = (buildAutomatedCombatTour() as any).config;
        const prose = Object.values(config.localization).join(" ");
        expect(prose).toContain("automatically");
        expect(prose).toContain("Calculate Injury");
        expect(prose).not.toContain("Calculate Impact");
        expect(prose).toContain("playing both");
    });
    it("prepares defaults only on the tutorial encounter through ordinary record methods", async () => {
        const mode = { shortcode: "crush", parent: { data: { shortcode: "clb" } } };
        const human = {
            uuid: "Scene.tutorial.Token.human",
            actor: { system: { shortcode: "tutorialhuman" } },
        };
        const orc = {
            uuid: "Scene.tutorial.Token.orc",
            actor: { system: { shortcode: "tutorialgrukaruk" } },
        };
        const tutorialScene = {
            id: "owned",
            name: "Automated Combat Tutorial Path",
            tokens: [human, orc],
        };
        const recordAttackMode = vi.fn(),
            recordBlockMode = vi.fn();
        const combat: any = {
            id: "tutorial",
            scene: { id: "owned" },
            flags: {},
            combatants: [
                {
                    actor: { logic: { getUsableStrikeModes: () => [mode] } },
                    logic: { recordAttackMode, recordBlockMode },
                },
            ],
            updateSource: (update: any) => {
                combat.flags.sohl = {
                    automatedCombatTutorial: update["flags.sohl.automatedCombatTutorial"],
                    automatedCombatTutorialRun: update["flags.sohl.automatedCombatTutorialRun"],
                };
            },
        };
        mocked.combat = combat;
        const handlers = new Map<string, Function>();
        vi.stubGlobal("Hooks", {
            on: (name: string, callback: Function) => {
                handlers.set(name, callback);
                return 1;
            },
            off: vi.fn(),
        });
        mocked.preStep = async () => {
            combat.flags = tour.currentSohlStep.drive[0].combatFlags;
            handlers.get("createCombat")?.(combat, {}, "gm");
        };
        vi.stubGlobal("game", { user: { id: "gm" }, scenes: [tutorialScene] });
        vi.stubGlobal("ui", { combat: { render: vi.fn() } });
        const tour = buildAutomatedCombatTour() as any;
        tour.tutorialAdventureUuid = "Compendium.sohl.tutorial-adventures.Adventure.lesson";
        tour.tutorialSceneId = "owned";
        vi.stubGlobal("foundry", { nue: { Tour: { activeTour: tour } } });
        tour.currentSohlStep = tour.config.steps.find((step: any) => step.id === "start");
        await tour._preStep();
        expect(tour.currentSohlStep.drive[0]).toMatchObject({
            kind: "start-combat",
            tokenUuids: [human.uuid, orc.uuid],
            rollInitiative: true,
        });
        expect(recordAttackMode).toHaveBeenCalledWith(mode);
        expect(recordBlockMode).toHaveBeenCalledWith(mode);
    });
    it("rejects unrelated exchange cards and commented or augmented macro scripts", () => {
        const unrelated = {
            id: "new",
            content:
                '<div data-actor-id="foreign"><button data-action="automatedBlockResume"></button></div>',
        };
        vi.stubGlobal("game", {
            messages: { contents: [unrelated] },
            user: { hotbar: { 1: "macro" } },
            macros: new Map([
                [
                    "macro",
                    {
                        type: "script",
                        command: "// CONFIG.SOHL.class.Utility.currentCombatantAttack()",
                    },
                ],
            ]),
        });
        const tour = buildAutomatedCombatTour() as any;
        tour.exchangeActorId = "human";
        tour.exchangeDefenderUuid = "Combat.tutorial.Combatant.orc";
        expect(
            tour.config.steps.find((step: any) => step.id === "human-attack").readState(tour),
        ).toBe(false);
        expect(tour.config.steps.find((step: any) => step.id === "macro").readState(tour)).toBe(
            false,
        );
    });

    it("does not seed or open an attack after an exit during awaited preparation", async () => {
        let release!: () => void;
        mocked.preStep = () =>
            new Promise<void>((resolve) => {
                release = resolve;
            });
        const seed = vi.fn();
        vi.stubGlobal("sohl", { random: { seed } });
        vi.stubGlobal("game", { messages: { contents: [] } });
        const tour = buildAutomatedCombatTour() as any;
        vi.stubGlobal("foundry", { nue: { Tour: { activeTour: tour } } });
        tour.currentSohlStep = tour.config.steps.find((step: any) => step.id === "human-attack");
        mocked.combat = { id: "tutorial" };
        tour.tutorialCombatId = "tutorial";
        const preparing = tour._preStep();
        await Promise.resolve();
        (globalThis as any).foundry.nue.Tour.activeTour = null;
        tour.exit();
        release();
        await preparing.catch(() => undefined);
        expect(seed).not.toHaveBeenCalled();
        mocked.preStep = undefined;
    });

    it("uses the captured import scene identity instead of an unrelated same-name scene", async () => {
        const unrelated = { id: "foreign", name: "Automated Combat Tutorial Path", tokens: [] };
        const human = {
            uuid: "Scene.owned.Token.human",
            actor: { system: { shortcode: "tutorialhuman" } },
        };
        const orc = {
            uuid: "Scene.owned.Token.orc",
            actor: { system: { shortcode: "tutorialgrukaruk" } },
        };
        const owned = {
            id: "owned",
            uuid: "Scene.owned",
            name: unrelated.name,
            tokens: [human, orc],
        };
        const scenes: any = [unrelated, owned];
        scenes.get = (id: string) => scenes.find((scene: any) => scene.id === id);
        vi.stubGlobal("game", { scenes });
        vi.stubGlobal("ui", { combat: { render: vi.fn() } });
        mocked.combat = { combatants: [] };
        const tour = buildAutomatedCombatTour() as any;
        vi.stubGlobal("foundry", { nue: { Tour: { activeTour: tour } } });
        tour.tutorialSceneId = "owned";
        tour.currentSohlStep = tour.config.steps.find((step: any) => step.id === "macro");
        await expect(tour._preStep()).resolves.toBeUndefined();
        expect(tour.currentSohlStep.drive[0].uuid).toBe("Scene.owned");
    });
    it("reimports only verified tour-owned fixtures and rejects foreign collisions", async () => {
        const uuid = "Compendium.sohl.tutorial-adventures.Adventure.lesson";
        const source = { _id: "owned", name: "Automated Combat Tutorial Path" };
        const existing = { flags: { sohl: { automatedCombatTutorial: uuid } }, setFlag: vi.fn() };
        const adventure = {
            prepareImport: async () => ({ toCreate: {}, toUpdate: { Scene: [source] } }),
        };
        const pack = {
            getIndex: async () => [{ _id: "lesson", name: "Automated Combat Tutorial" }],
            getDocument: async () => adventure,
            getUuid: () => uuid,
        };
        vi.stubGlobal("game", {
            packs: new Map([["sohl.tutorial-adventures", pack]]),
            collections: new Map([["Scene", new Map([["owned", existing]])]]),
            combats: [],
        });
        vi.stubGlobal("Hooks", { on: vi.fn(() => 1), off: vi.fn() });
        const tour = buildAutomatedCombatTour() as any;
        vi.stubGlobal("foundry", { nue: { Tour: { activeTour: tour } } });
        tour.currentSohlStep = tour.config.steps.find((step: any) => step.id === "import");
        await expect(tour._preStep()).resolves.toBeUndefined();
        expect(tour.tutorialSceneId).toBe("owned");
        existing.flags.sohl.automatedCombatTutorial = "foreign";
        await expect(tour._preStep()).rejects.toThrow(/overwrite|owned|world documents/);
    });
    it("tags the native prepared import payload before writes even when the tour exits", async () => {
        const uuid = "Compendium.sohl.tutorial-adventures.Adventure.lesson";
        const source: any = { _id: "owned", name: "Automated Combat Tutorial Path" };
        const create = { Scene: [source] };
        const pack = {
            getIndex: async () => [{ _id: "lesson", name: "Automated Combat Tutorial" }],
            getDocument: async () => ({
                prepareImport: async () => ({ toCreate: create, toUpdate: {} }),
            }),
            getUuid: () => uuid,
        };
        const handlers = new Map<string, Function>();
        const off = vi.fn();
        vi.stubGlobal("Hooks", {
            on: (name: string, callback: Function) => {
                handlers.set(name, callback);
                return 1;
            },
            off,
        });
        vi.stubGlobal("game", {
            packs: new Map([["sohl.tutorial-adventures", pack]]),
            collections: new Map(),
            combats: [],
        });
        let release: (() => void) | undefined;
        mocked.preStep = async () => {
            handlers.get("preImportAdventure")?.({ uuid }, {}, create, {});
            await new Promise<void>((resolve) => {
                release = resolve;
            });
        };
        const tour = buildAutomatedCombatTour() as any;
        vi.stubGlobal("foundry", { nue: { Tour: { activeTour: tour } } });
        tour.currentSohlStep = tour.config.steps.find((step: any) => step.id === "import");
        const preparing = tour._preStep();
        for (let i = 0; i < 20 && !release; i++) await Promise.resolve();
        expect(release).toBeDefined();
        (globalThis as any).foundry.nue.Tour.activeTour = null;
        tour.exit();
        release!();
        await preparing;
        expect(source.flags?.sohl?.automatedCombatTutorial).toBe(uuid);
        expect(off).toHaveBeenCalled();
    });

    it("captures only the tutorial-created combat instead of marking an unrelated active encounter", async () => {
        const uuid = "Compendium.sohl.tutorial-adventures.Adventure.lesson";
        const human = {
            id: "human",
            uuid: "Scene.owned.Token.human",
            actor: { system: { shortcode: "tutorialhuman" } },
        };
        const orc = {
            id: "orc",
            uuid: "Scene.owned.Token.orc",
            actor: { system: { shortcode: "tutorialgrukaruk" } },
        };
        const tutorialScene = {
            id: "owned",
            name: "Automated Combat Tutorial Path",
            tokens: [human, orc],
        };
        const foreign = {
            id: "foreign",
            scene: { id: "foreign" },
            setFlag: vi.fn(),
            combatants: [],
        };
        const owned: any = {
            id: "tutorial",
            uuid: "Combat.tutorial",
            scene: { id: "owned" },
            flags: {},
            combatants: [],
            updateSource: vi.fn((update: any) => {
                owned.flags.sohl = {
                    automatedCombatTutorial: update["flags.sohl.automatedCombatTutorial"],
                    automatedCombatTutorialRun: update["flags.sohl.automatedCombatTutorialRun"],
                };
            }),
        };
        mocked.combat = foreign;
        const handlers = new Map<string, Function>();
        vi.stubGlobal("Hooks", {
            on: (name: string, callback: Function) => {
                handlers.set(name, callback);
                return 1;
            },
            off: vi.fn(),
        });
        vi.stubGlobal("game", {
            user: { id: "gm" },
            scenes: [tutorialScene],
            combats: new Map([["tutorial", owned]]),
        });
        vi.stubGlobal("ui", { combat: { render: vi.fn() } });
        mocked.preStep = async () => {
            owned.flags = tour.currentSohlStep.drive[0].combatFlags;
            handlers.get("createCombat")?.(owned, {}, "gm");
        };
        const tour = buildAutomatedCombatTour() as any;
        tour.tutorialSceneId = "owned";
        tour.tutorialAdventureUuid = uuid;
        vi.stubGlobal("foundry", { nue: { Tour: { activeTour: tour } } });
        tour.currentSohlStep = tour.config.steps.find((step: any) => step.id === "start");
        await tour._preStep().catch(() => undefined);
        expect(foreign.setFlag).not.toHaveBeenCalled();
        expect(owned.flags.sohl?.automatedCombatTutorial).toBe(uuid);
        expect(tour.tutorialCombatId).toBe("tutorial");
    });
    it("does not claim a competing same-scene creation while stock preparation awaits", async () => {
        const handlers = new Map<string, Function>();
        vi.stubGlobal("Hooks", {
            on: (name: string, callback: Function) => {
                handlers.set(name, callback);
                return 1;
            },
            off: vi.fn(),
        });
        const human = {
            uuid: "Scene.owned.Token.human",
            actor: { system: { shortcode: "tutorialhuman" } },
        };
        const orc = {
            uuid: "Scene.owned.Token.orc",
            actor: { system: { shortcode: "tutorialgrukaruk" } },
        };
        vi.stubGlobal("game", {
            user: { id: "gm" },
            scenes: [{ id: "owned", tokens: [human, orc] }],
        });
        vi.stubGlobal("ui", { combat: { render: vi.fn() } });
        const foreign: any = {
            id: "foreign",
            scene: { id: "owned" },
            flags: {},
            updateSource: vi.fn((source: any) => {
                foreign.flags.sohl = {
                    automatedCombatTutorialRun: source["flags.sohl.automatedCombatTutorialRun"],
                };
            }),
        };
        const own: any = { id: "tutorial", scene: { id: "owned" }, flags: {}, combatants: [] };
        const tour = buildAutomatedCombatTour() as any;
        tour.tutorialSceneId = "owned";
        tour.tutorialAdventureUuid = "Adventure.lesson";
        tour.currentSohlStep = tour.config.steps.find((step: any) => step.id === "start");
        vi.stubGlobal("foundry", { nue: { Tour: { activeTour: tour } } });
        mocked.preStep = async () => {
            handlers.get("preCreateCombat")?.(foreign, { scene: "owned" }, {}, "gm");
            handlers.get("createCombat")?.(foreign, {}, "gm");
            own.flags = tour.currentSohlStep.drive[0].combatFlags ?? {};
            handlers.get("createCombat")?.(own, {}, "gm");
        };
        await tour._preStep().catch(() => undefined);
        expect(foreign.updateSource).not.toHaveBeenCalled();
        expect(foreign.flags).toEqual({});
        expect(tour.tutorialCombatId).toBe("tutorial");
    });

    it("ships a stock macro that executes the current combatant action dispatcher", async () => {
        const note = readFileSync("assets/content/Macros/Automated_Attack.md", "utf8");
        const script = note.match(/```js\n([\s\S]*?)```/)![1];
        const executeAction = vi.fn();
        const run = new Function("game", `return (async () => {${script}})();`);
        await run({ combat: { combatant: { logic: { executeAction } } } });
        expect(executeAction).toHaveBeenCalledWith("automatedCombatStart");
    });

    it("opens the attack on the captured encounter with its exact defender context", async () => {
        const executeAction = vi.fn();
        const human = {
            id: "human",
            uuid: "Scene.owned.Token.human",
            actor: { id: "actor-human", system: { shortcode: "tutorialhuman" } },
        };
        const orc = {
            id: "orc",
            uuid: "Scene.owned.Token.orc",
            logic: { actorLogic: {} },
            actor: { system: { shortcode: "tutorialgrukaruk" } },
        };
        const combat = {
            id: "tutorial",
            combatant: { logic: { executeAction, speaker: "human-speaker" } },
            combatants: [{ tokenId: "orc", uuid: "Combat.tutorial.Combatant.orc" }],
        };
        mocked.combat = combat;
        vi.stubGlobal("game", {
            scenes: [{ id: "owned", tokens: [human, orc] }],
            combats: new Map([["tutorial", combat]]),
            messages: { contents: [] },
        });
        vi.stubGlobal("sohl", { random: { seed: vi.fn() } });
        vi.stubGlobal("document", { body: {}, querySelector: () => ({}) });
        vi.stubGlobal(
            "MutationObserver",
            class {
                observe() {}
                disconnect() {}
            },
        );
        const tour = buildAutomatedCombatTour() as any;
        tour.tutorialSceneId = "owned";
        tour.tutorialCombatId = "tutorial";
        tour.currentSohlStep = tour.config.steps.find((step: any) => step.id === "human-attack");
        vi.stubGlobal("foundry", { nue: { Tour: { activeTour: tour } } });
        await tour._preStep();
        expect(executeAction).toHaveBeenCalledWith(
            "automatedCombatStart",
            expect.objectContaining({ speaker: "human-speaker", target: orc.logic }),
        );
        expect(tour.exchangeDefenderUuid).toBe("Combat.tutorial.Combatant.orc");
    });
    it("opens Chat while coaching attack and defense card controls", () => {
        const tour = buildAutomatedCombatTour() as any;
        for (const id of ["human-attack", "orc-attack"])
            expect(tour.config.steps.find((step: any) => step.id === id).nav?.sidebarTab).toBe(
                "chat",
            );
    });
});
