import { describe, it, expect, vi, afterEach } from "vitest";
import {
    SkillLogic,
    getFateDescTable,
} from "@src/document/item/logic/SkillLogic";
import { MasteryLevelModifier } from "@src/entity/modifier/MasteryLevelModifier";
import { SafeExpression } from "@src/entity/expr/SafeExpression";
import { MeleeStrikeMode } from "@src/entity/strikemode/MeleeStrikeMode";
import { SimpleRoll } from "@src/entity/roll/SimpleRoll";
import { SohlActionContext } from "@src/entity/action/SohlActionContext";
import { SohlSpeaker } from "@src/core/logic/SohlSpeaker";
import { IMPACT_ASPECT, ITEM_KIND } from "@src/utils/constants";
import * as FoundryHelpersMock from "@src/core/FoundryHelpers";
import {
    makeItemLogic,
    makeMockActor,
    makeAttributeStub,
} from "@tests/mocks/logicHarness";

/** Default SkillData fields; override per test. */
function skillFields(overrides: Record<string, unknown> = {}) {
    return {
        subType: "social",
        skillBaseFormula: "",
        masteryLevelBase: 30,
        improveFlag: false,
        combatCategory: "none",
        parentSkillCode: "",
        initSkillMult: 1,
        ...overrides,
    };
}

function makeSkill(
    overrides: Record<string, unknown> = {},
    opts: Record<string, unknown> = {},
) {
    return makeItemLogic(SkillLogic, ITEM_KIND.SKILL, skillFields(overrides), {
        name: "Test Skill",
        ...opts,
    });
}

afterEach(() => {
    vi.restoreAllMocks();
});

describe("SkillLogic", () => {
    describe("construction", () => {
        it("constructs against a plain-object SkillData (no Foundry)", () => {
            const logic = makeSkill();
            expect(logic).toBeInstanceOf(SkillLogic);
        });

        it("defines the skill intrinsic actions", () => {
            const logic = makeSkill();
            for (const shortcode of [
                "editDocument",
                "deleteDocument",
                "successTest",
                "setImproveFlag",
                "unsetImproveFlag",
                "improveWithSDR",
                "opposedTestStart",
            ]) {
                expect(logic.actions.has(shortcode), shortcode).toBe(true);
            }
        });

        it("canImprove does not throw before initialize() — masteryLevel unset (#511)", () => {
            // The Skills tab reads `skillLogic.canImprove` while rendering; a skill
            // whose logic hasn't been initialized yet (masteryLevel not seeded)
            // must not throw and brick the whole sheet.
            const logic = makeSkill();
            // deliberately NOT calling logic.initialize()
            expect(() => logic.canImprove).not.toThrow();
        });
    });

    describe("initialize", () => {
        it("seeds masteryLevel from masteryLevelBase", () => {
            const logic = makeSkill({ masteryLevelBase: 45 });
            logic.initialize();
            expect(logic.masteryLevel).toBeInstanceOf(MasteryLevelModifier);
            expect(logic.masteryLevel.base).toBe(45);
            expect(logic.masteryLevel.effective).toBe(45);
        });

        it("resets parentSkill and boosts", () => {
            const logic = makeSkill();
            logic.initialize();
            expect(logic.parentSkill).toBeNull();
            expect(logic.boosts).toBe(0);
        });

        it("builds skillBase from the formula and the actor's attribute items", () => {
            const actor = makeMockActor();
            actor.items.set("str1", makeAttributeStub("str", 12));
            actor.items.set("int1", makeAttributeStub("int", 14));
            const logic = makeSkill(
                { skillBaseFormula: "@str, @int" },
                { actor },
            );
            logic.initialize();
            expect(logic.valid).toBe(true);
            // calcSkillBase averages the referenced attribute scores: (12+14)/2
            expect(logic.skillBase).toBe(13);
        });

        it("disables fate when the actor has no Aura attribute", () => {
            const actor = makeMockActor();
            const logic = makeSkill({}, { actor });
            logic.initialize();
            expect(logic.fateMasteryLevel.disabled).toBe(
                "SOHL.MasteryLevel.FateNotSupported",
            );
        });

        it("disables fate when the optionFate setting does not apply", () => {
            // mock fvttGetSetting returns undefined → neither "everyone" nor "pconly"
            const actor = makeMockActor();
            actor.items.set("aur1", makeAttributeStub("aur", 12));
            const logic = makeSkill({}, { actor });
            logic.initialize();
            expect(logic.fateMasteryLevel.disabled).toBe(
                "SOHL.MasteryLevel.FateDisabled",
            );
        });

        it("seeds fate at 50 + half the Aura mastery level when optionFate is 'everyone'", () => {
            vi.spyOn(FoundryHelpersMock, "fvttGetSetting").mockReturnValue(
                "everyone",
            );
            const actor = makeMockActor();
            actor.items.set(
                "aur1",
                makeAttributeStub("aur", 14, { masteryLevel: 70 }),
            );
            const logic = makeSkill({}, { actor });
            logic.initialize();
            expect(logic.fateMasteryLevel.disabled).toBeFalsy();
            expect(logic.fateMasteryLevel.base).toBe(50);
            expect(logic.fateMasteryLevel.effective).toBe(50 + 35);
        });

        it("applies fate for 'pconly' only when the actor has a player owner", () => {
            vi.spyOn(FoundryHelpersMock, "fvttGetSetting").mockReturnValue(
                "pconly",
            );
            const pcActor = makeMockActor({ hasPlayerOwner: true });
            pcActor.items.set("aur1", makeAttributeStub("aur", 12));
            const pcSkill = makeSkill({}, { actor: pcActor });
            pcSkill.initialize();
            expect(pcSkill.fateMasteryLevel.disabled).toBeFalsy();

            const npcActor = makeMockActor({ hasPlayerOwner: false });
            npcActor.items.set("aur1", makeAttributeStub("aur", 12));
            const npcSkill = makeSkill({}, { actor: npcActor });
            npcSkill.initialize();
            expect(npcSkill.fateMasteryLevel.disabled).toBe(
                "SOHL.MasteryLevel.FateDisabled",
            );
        });
    });

    describe("evaluate", () => {
        it("links parentSkill from parentSkillCode on the owning actor", () => {
            const actor = makeMockActor();
            const parentLogic = makeSkill(
                {},
                { actor, shortcode: "lang", id: "parentskill00001" },
            );
            const logic = makeSkill({ parentSkillCode: "lang" }, { actor });
            logic.initialize();
            logic.evaluate();
            expect(logic.parentSkill).toBe(parentLogic);
        });

        it("applies mastery boosts with diminishing returns", () => {
            const logic = makeSkill({ masteryLevelBase: 30 });
            logic.initialize();
            logic.boosts = 2;
            logic.evaluate();
            // 30 → +10 (≤39) → 40 → +9 (≤44) → 49
            expect(logic.masteryLevel.base).toBe(49);
        });

        it("does not boost a zero mastery level", () => {
            const logic = makeSkill({ masteryLevelBase: 0 });
            logic.initialize();
            logic.boosts = 3;
            logic.evaluate();
            expect(logic.masteryLevel.base).toBe(0);
        });

        it("disables fate for skills with Aura in the skill base formula", () => {
            vi.spyOn(FoundryHelpersMock, "fvttGetSetting").mockReturnValue(
                "everyone",
            );
            const actor = makeMockActor();
            actor.items.set("aur1", makeAttributeStub("aur", 14));
            const logic = makeSkill({ skillBaseFormula: "@aur" }, { actor });
            logic.initialize();
            expect(logic.fateMasteryLevel.disabled).toBeFalsy();
            logic.evaluate();
            expect(logic.fateMasteryLevel.disabled).toBe(
                "SOHL.MasteryLevel.AuraBasedNoFate",
            );
        });
    });

    describe("finalize", () => {
        it("disables fate when the mastery level is disabled", () => {
            const logic = makeSkill();
            logic.initialize();
            logic.masteryLevel.setDisabled("test reason");
            logic.finalize();
            expect(logic.fateMasteryLevel.disabled).toBeTruthy();
        });

        it("disables fate when no fate items are available", () => {
            vi.spyOn(FoundryHelpersMock, "fvttGetSetting").mockReturnValue(
                "everyone",
            );
            const actor = makeMockActor();
            actor.items.set("aur1", makeAttributeStub("aur", 14));
            const logic = makeSkill({}, { actor });
            logic.initialize();
            logic.evaluate();
            expect(logic.fateMasteryLevel.disabled).toBeFalsy();
            // availableFate is currently always [] (T2-2 roadmap)
            logic.finalize();
            expect(logic.fateMasteryLevel.disabled).toBe(
                "SOHL.MasteryLevel.NoFateAvailable",
            );
        });
    });

    describe("intrinsic executors", () => {
        it("setImproveFlag - updates system.improveFlag to true", async () => {
            const logic = makeSkill();
            await logic.setImproveFlag({} as any);
            expect(logic.item.update).toHaveBeenCalledWith({
                "system.improveFlag": true,
            });
        });

        it("unsetImproveFlag - updates system.improveFlag to false", async () => {
            const logic = makeSkill({ improveFlag: true });
            await logic.unsetImproveFlag({} as any);
            expect(logic.item.update).toHaveBeenCalledWith({
                "system.improveFlag": false,
            });
        });

        it("successTest - delegates to masteryLevel.successTest", async () => {
            const logic = makeSkill();
            logic.initialize();
            const result = { isSuccess: true } as any;
            const spy = vi
                .spyOn(logic.masteryLevel, "successTest")
                .mockResolvedValue(result);
            const ctx = { scope: {} } as any;
            await expect(logic.successTest(ctx)).resolves.toBe(result);
            expect(spy).toHaveBeenCalledWith(ctx);
        });

        it("opposedTestStart - delegates to the actor's token logic with this skill's uuid in scope", async () => {
            const result = { isOpposed: true } as any;
            const opposedTestStart = vi.fn().mockResolvedValue(result);
            vi.spyOn(
                FoundryHelpersMock,
                "fvttActiveTokenLogicForActor",
            ).mockReturnValue({ opposedTestStart } as any);
            const logic = makeSkill();
            logic.initialize();
            const ctx = { scope: {} } as any;
            await expect(logic.opposedTestStart(ctx)).resolves.toBe(result);
            expect(opposedTestStart).toHaveBeenCalledWith(ctx);
            expect(ctx.scope.logicUuid).toBe(logic.uuid);
        });

        it("opposedTestStart - warns and returns null when the actor has no token", async () => {
            vi.spyOn(
                FoundryHelpersMock,
                "fvttActiveTokenLogicForActor",
            ).mockReturnValue(undefined);
            const logic = makeSkill();
            logic.initialize();
            const ctx = { scope: {} } as any;
            await expect(logic.opposedTestStart(ctx)).resolves.toBeNull();
            expect(ctx.scope.logicUuid).toBeUndefined();
        });
    });

    describe("improveWithSDR", () => {
        function mockRoll(total: number) {
            return {
                roll: vi.fn(),
                total,
                result: String(total),
            } as any;
        }

        it("reports success when the roll beats the base mastery level", async () => {
            vi.spyOn(SimpleRoll, "fromFormula").mockReturnValue(mockRoll(95));
            const logic = makeSkill({ masteryLevelBase: 40 });
            logic.initialize();
            const speaker = { toChat: vi.fn() };
            await logic.improveWithSDR({ speaker } as any);
            expect(speaker.toChat).toHaveBeenCalledTimes(1);
            const [, chatData] = speaker.toChat.mock.calls[0];
            expect(chatData.isSuccess).toBe(true);
            expect(chatData.sdrIncr).toBe(1);
        });

        it("reports failure when the roll does not beat the base", async () => {
            vi.spyOn(SimpleRoll, "fromFormula").mockReturnValue(mockRoll(10));
            const logic = makeSkill({ masteryLevelBase: 40 });
            logic.initialize();
            const speaker = { toChat: vi.fn() };
            await logic.improveWithSDR({ speaker } as any);
            const [, chatData] = speaker.toChat.mock.calls[0];
            expect(chatData.isSuccess).toBe(false);
        });

        it("includes the skill base value in the roll formula", async () => {
            const fromFormula = vi
                .spyOn(SimpleRoll, "fromFormula")
                .mockReturnValue(mockRoll(50));
            const actor = makeMockActor();
            actor.items.set("str1", makeAttributeStub("str", 12));
            const logic = makeSkill({ skillBaseFormula: "@str" }, { actor });
            logic.initialize();
            await logic.improveWithSDR({
                speaker: { toChat: vi.fn() },
            } as any);
            expect(fromFormula).toHaveBeenCalledWith(
                `1d100+${logic.skillBase}`,
                logic,
            );
        });
    });

    describe("improveWithSDR visibility predicate", () => {
        // The action's `visible` predicate is evaluated against the logic layer
        // (`itemLogic`), not the raw document, since #459. It must read live
        // logic state; the pre-#459 `item.system.*` document paths (#458) are
        // always falsy — the Improve entry would never appear.
        function visibleSource(): string {
            const action = makeSkill().actions.get("improveWithSDR");
            return (action as any).data.visible;
        }
        function evalVisible(context: Record<string, unknown>): boolean {
            return !!new SafeExpression(
                { source: visibleSource() },
                { parent: { id: "test" } as any },
            ).evaluate(context);
        }

        it("shows when the skill can improve and is not already flagged", () => {
            const itemLogic = {
                canImprove: true,
                data: { improveFlag: false },
            };
            expect(evalVisible({ itemLogic })).toBe(true);
        });

        it("hides when the skill cannot improve", () => {
            const itemLogic = {
                canImprove: false,
                data: { improveFlag: false },
            };
            expect(evalVisible({ itemLogic })).toBe(false);
        });

        it("hides when the improve flag is already set", () => {
            const itemLogic = { canImprove: true, data: { improveFlag: true } };
            expect(evalVisible({ itemLogic })).toBe(false);
        });

        it("hides when no item row resolves (itemLogic undefined)", () => {
            expect(evalVisible({ itemLogic: undefined })).toBe(false);
        });
    });

    describe("recalculate", () => {
        it("does nothing when no rollFormula flag is set", async () => {
            const logic = makeSkill();
            logic.initialize();
            await logic.recalculate();
            expect(logic.item.update).not.toHaveBeenCalled();
        });

        it("substitutes sb and updates masteryLevelBase from the roll", async () => {
            const fromFormula = vi
                .spyOn(SimpleRoll, "fromFormula")
                .mockReturnValue({
                    roll: vi.fn(),
                    total: 42,
                    result: "42",
                } as any);
            const actor = makeMockActor();
            // A valid skill base averages two or more attributes; @str,@dex both
            // at 10 gives a skill base of 10.
            actor.items.set("str1", makeAttributeStub("str", 10));
            actor.items.set("dex1", makeAttributeStub("dex", 10));
            const logic = makeSkill(
                { skillBaseFormula: "@str,@dex" },
                { actor, flags: { "sohl.rollFormula": "2d6+sb" } },
            );
            logic.initialize();
            await logic.recalculate();
            expect(fromFormula).toHaveBeenCalledWith("2d6+10", logic);
            expect(logic.item.update).toHaveBeenCalledWith({
                "system.masteryLevelBase": 42,
            });
        });
    });

    describe("derived properties", () => {
        it("sdrIncr is 1 and magicMod is 0", () => {
            const logic = makeSkill();
            expect(logic.sdrIncr).toBe(1);
            expect(logic.magicMod).toBe(0);
        });

        it("availableFate is [] (full lookup is roadmap T2-2)", () => {
            const logic = makeSkill();
            logic.initialize();
            expect(logic.availableFate).toEqual([]);
        });

        it("valid is false when the formula references fewer than two attributes", () => {
            const actor = makeMockActor();
            actor.items.set("str1", makeAttributeStub("str", 12));
            const logic = makeSkill({ skillBaseFormula: "@str" }, { actor });
            logic.initialize();
            expect(logic.valid).toBe(false);
        });

        it("canImprove requires ownership/GM and an enabled mastery level", () => {
            const logic = makeSkill();
            logic.initialize();
            // mock item isOwner=true by default
            expect(logic.canImprove).toBe(true);
            logic.masteryLevel.setDisabled("nope");
            expect(logic.canImprove).toBe(false);
        });
    });

    describe("combattechnique strike mode", () => {
        /** A persisted melee strike-mode payload for a technique skill. */
        function meleeSM(overrides: Record<string, unknown> = {}) {
            return {
                type: "melee",
                name: "Punch",
                minParts: 1,
                assocSkillCode: "",
                lengthBase: 1,
                attack: { disabled: false, spread: 2, modifier: 5 },
                impactBase: {
                    numDice: 1,
                    die: 6,
                    modifier: 0,
                    aspect: IMPACT_ASPECT.BLUNT,
                },
                traits: {},
                defense: {
                    block: { modifier: 3 },
                    counterstrike: { modifier: -2 },
                },
                ...overrides,
            };
        }

        it("builds a strike mode for the combattechnique subtype", () => {
            const logic = makeSkill({
                subType: "combattechnique",
                strikeMode: meleeSM(),
            });
            logic.initialize();
            expect(logic.strikeMode).toBeInstanceOf(MeleeStrikeMode);
            expect(logic.strikeModes).toHaveLength(1);
        });

        it("builds no strike mode for a non-technique subtype", () => {
            const logic = makeSkill({
                subType: "social",
                strikeMode: meleeSM(),
            });
            logic.initialize();
            expect(logic.strikeMode).toBeUndefined();
            expect(logic.strikeModes).toEqual([]);
        });

        it("drives Atk/Blk/CX from the skill's own mastery level by default", () => {
            const logic = makeSkill({
                subType: "combattechnique",
                masteryLevelBase: 40,
                strikeMode: meleeSM(),
            });
            logic.initialize();
            logic.evaluate();
            logic.finalize();
            const sm = logic.strikeMode as MeleeStrikeMode;
            expect(sm.attack.base).toBe(40); // adopted from the skill ML
            expect(sm.attack.effective).toBe(45); // 40 ML + 5 AtkMod
            expect(sm.defense.block.effective).toBe(43); // 40 + 3
            expect(sm.defense.counterstrike.effective).toBe(38); // 40 - 2
        });

        describe("prone wielder (#562)", () => {
            afterEach(() => vi.restoreAllMocks());

            it("subtracts 20 from the technique's attack and defenses when prone", () => {
                const actor = makeMockActor();
                vi.spyOn(
                    FoundryHelpersMock,
                    "fvttActorStatuses",
                ).mockReturnValue(new Set(["prone"]));
                const logic = makeSkill(
                    {
                        subType: "combattechnique",
                        masteryLevelBase: 40,
                        strikeMode: meleeSM(),
                    },
                    { actor },
                );
                logic.initialize();
                logic.evaluate();
                logic.finalize();
                const sm = logic.strikeMode as MeleeStrikeMode;
                expect(sm.attack.effective).toBe(45 - 20); // 40 ML + 5 AtkMod − 20
                expect(sm.defense.block.effective).toBe(43 - 20); // 40 + 3 − 20
                expect(sm.defense.counterstrike.effective).toBe(38 - 20); // 40 − 2 − 20
            });

            it("leaves the technique unchanged when the wielder is not prone", () => {
                const actor = makeMockActor();
                vi.spyOn(
                    FoundryHelpersMock,
                    "fvttActorStatuses",
                ).mockReturnValue(new Set());
                const logic = makeSkill(
                    {
                        subType: "combattechnique",
                        masteryLevelBase: 40,
                        strikeMode: meleeSM(),
                    },
                    { actor },
                );
                logic.initialize();
                logic.evaluate();
                logic.finalize();
                const sm = logic.strikeMode as MeleeStrikeMode;
                expect(sm.attack.effective).toBe(45);
                expect(sm.defense.block.effective).toBe(43);
            });
        });

        it("keeps the technique's own attack modifier in the derivation", () => {
            const logic = makeSkill({
                subType: "combattechnique",
                masteryLevelBase: 40,
                strikeMode: meleeSM(),
            });
            logic.initialize();
            logic.evaluate();
            logic.finalize();
            expect(
                (logic.strikeMode as MeleeStrikeMode).attack.has("AtkMod"),
            ).toBe(true);
        });

        it("uses an override skill's mastery level when assocSkillCode is set", () => {
            const actor = makeMockActor();
            const logic = makeSkill(
                {
                    subType: "combattechnique",
                    masteryLevelBase: 40,
                    strikeMode: meleeSM({ assocSkillCode: "sword" }),
                },
                { actor },
            );
            const overrideML = new MasteryLevelModifier(
                {},
                { parent: logic },
            ).setBase(60);
            vi.spyOn(actor.logic, "getItemLogic").mockReturnValue({
                masteryLevel: overrideML,
            } as any);
            logic.initialize();
            logic.evaluate();
            logic.finalize();
            const sm = logic.strikeMode as MeleeStrikeMode;
            expect(sm.attack.base).toBe(60);
            expect(sm.attack.effective).toBe(65); // 60 + 5 AtkMod
        });

        it("disables the derived rolls when the governing ML is disabled", () => {
            const logic = makeSkill({
                subType: "combattechnique",
                masteryLevelBase: 40,
                strikeMode: meleeSM(),
            });
            logic.initialize();
            logic.evaluate();
            logic.masteryLevel.setDisabled("SOHL.Test.disabled");
            logic.finalize();
            const sm = logic.strikeMode as MeleeStrikeMode;
            expect(sm.attack.disabled).toBeTruthy();
            expect(sm.attack.effective).toBe(0);
        });

        it("adds body reach to the technique's melee strike mode", () => {
            const actor = makeMockActor();
            (actor.logic as any).body = { reach: { effective: 2 } };
            const logic = makeSkill(
                {
                    subType: "combattechnique",
                    strikeMode: meleeSM({ lengthBase: 1 }),
                },
                { actor },
            );
            logic.initialize();
            logic.evaluate();
            expect((logic.strikeMode as MeleeStrikeMode).reach.effective).toBe(
                3,
            );
        });

        describe("combat actions (attack/block/counterstrike)", () => {
            afterEach(() => vi.restoreAllMocks());

            function makeTechnique() {
                const logic = makeSkill({
                    subType: "combattechnique",
                    masteryLevelBase: 40,
                    strikeMode: meleeSM(),
                });
                logic.initialize();
                logic.evaluate();
                logic.finalize();
                return logic;
            }
            const ctx = () =>
                new SohlActionContext({
                    speaker: new SohlSpeaker({ alias: "T" }),
                });

            it("defines attackTest/blockTest/counterstrikeTest intrinsic actions", () => {
                const shortcodes = SkillLogic.defineIntrinsicActions().map(
                    (a) => a.shortcode,
                );
                expect(shortcodes).toContain("attackTest");
                expect(shortcodes).toContain("blockTest");
                expect(shortcodes).toContain("counterstrikeTest");
            });

            it("wires those actions onto a combattechnique instance", () => {
                const logic = makeTechnique();
                expect(logic.actions.has("attackTest")).toBe(true);
                expect(logic.actions.has("blockTest")).toBe(true);
                expect(logic.actions.has("counterstrikeTest")).toBe(true);
            });

            it("attackTest rolls the single strike mode's attack (auto-selected, no dialog)", async () => {
                const logic = makeTechnique();
                const spy = vi
                    .spyOn(
                        (logic.strikeMode as MeleeStrikeMode).attack,
                        "successTest",
                    )
                    .mockResolvedValue(undefined);
                const c = ctx();
                await logic.attackTest(c);
                // The passed context flows straight through to the roll.
                expect(spy).toHaveBeenCalledWith(c);
            });

            it("blockTest rolls the melee mode's defense.block", async () => {
                const logic = makeTechnique();
                const spy = vi
                    .spyOn(
                        (logic.strikeMode as MeleeStrikeMode).defense.block,
                        "successTest",
                    )
                    .mockResolvedValue(undefined);
                await logic.blockTest(ctx());
                expect(spy).toHaveBeenCalledTimes(1);
            });

            it("counterstrikeTest rolls the melee mode's defense.counterstrike", async () => {
                const logic = makeTechnique();
                const spy = vi
                    .spyOn(
                        (logic.strikeMode as MeleeStrikeMode).defense
                            .counterstrike,
                        "successTest",
                    )
                    .mockResolvedValue(undefined);
                await logic.counterstrikeTest(ctx());
                expect(spy).toHaveBeenCalledTimes(1);
            });
        });
    });
});

describe("SkillDataModel", () => {
    // The DataModel is Foundry-layer (implements SkillData via Foundry's
    // schema system); its schema is exercised in Foundry integration, not
    // in unit tests.
    describe("defineSchema", () => {
        it.todo("includes MasteryLevelDataModel base schema fields");
        it.todo(
            "defines subType with SkillSubTypes choices defaulting to SOCIAL",
        );
        it.todo(
            "defines weaponGroup with SkillCombatCategories choices defaulting to NONE",
        );
        it.todo("defines baseSkill as a StringField");
        it.todo("defines domain as a StringField");
    });

    it.todo("has kind set to ITEM_KIND.SKILL");
    it.todo(
        "has correct LOCALIZATION_PREFIXES including Skill, MasteryLevel, and Item",
    );
});

describe("getFateDescTable (#70)", () => {
    afterEach(() => vi.restoreAllMocks());

    it("calls sohl.i18n.localize with SOHL.Skill.FateDesc.* keys", () => {
        const localize = vi.spyOn(sohl.i18n, "localize").mockReturnValue("loc");
        getFateDescTable();
        expect(localize).toHaveBeenCalledWith(
            expect.stringMatching(/^SOHL\.Skill\.FateDesc\./),
        );
    });

    it("returns table entries whose label and description come from i18n", () => {
        vi.spyOn(sohl.i18n, "localize").mockReturnValue("translated");
        const table = getFateDescTable();
        expect(table.length).toBeGreaterThan(0);
        expect(table.every((e) => e.label === "translated")).toBe(true);
        expect(table.every((e) => e.description === "translated")).toBe(true);
    });

    it("returns entries with required LimitedDescription shape", () => {
        const table = getFateDescTable();
        for (const entry of table) {
            expect(typeof entry.maxValue).toBe("number");
            expect(Array.isArray(entry.lastDigits)).toBe(true);
            expect(typeof entry.success).toBe("boolean");
            expect(typeof entry.result).toBe("number");
        }
    });
});
