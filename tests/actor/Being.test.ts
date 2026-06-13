import { describe, it, expect, vi, afterEach } from "vitest";
import { BeingLogic } from "@src/document/actor/logic/BeingLogic";
import { SohlActorBaseLogic } from "@src/document/actor/logic/SohlActorBaseLogic";
import { CombatTechniqueLogic } from "@src/document/item/logic/CombatTechniqueLogic";
import { MeleeStrikeMode } from "@src/domain/strikemode/MeleeStrikeMode";
import { ValueModifier } from "@src/domain/modifier/ValueModifier";
import {
    ACTOR_KIND,
    IMPACT_ASPECT,
    ITEM_KIND,
    MOVEMENT_MEDIUM,
} from "@src/utils/constants";
import * as FoundryHelpersMock from "@src/core/FoundryHelpers";
import { makeActorLogic, makeItemLogic } from "@tests/mocks/logicHarness";

/** Construct a BeingLogic against a plain-object BeingData. */
function makeBeing(
    fields: Record<string, unknown> = {},
    opts: Record<string, unknown> = {},
) {
    return makeActorLogic(BeingLogic, ACTOR_KIND.BEING, fields, opts);
}

/** A persisted melee strike-mode payload (same shape the item logic builds from). */
function meleeModeData(overrides: Record<string, unknown> = {}) {
    return {
        type: "melee",
        name: "Punch",
        minParts: 1,
        assocSkillCode: "unarmed",
        lengthBase: 1,
        attack: { disabled: false, spread: 2, modifier: 5 },
        impactBase: {
            numDice: 1,
            die: 6,
            modifier: 0,
            aspect: IMPACT_ASPECT.BLUNT,
        },
        traits: {},
        defense: { block: { modifier: 3 }, counterstrike: { modifier: -2 } },
        ...overrides,
    };
}

/** Build a real MeleeStrikeMode (BeingLogic.reach checks `instanceof`). */
function makeMeleeMode(
    parentLogic: any,
    overrides: Record<string, unknown> = {},
    id = "sm1",
): MeleeStrikeMode {
    return new MeleeStrikeMode(
        meleeModeData(overrides) as any,
        parentLogic,
        id,
    );
}

/**
 * Embed a real CombatTechniqueLogic on the actor and return its item doc
 * (BeingLogic reads strike modes through `actor.itemTypes`).
 */
function makeTechniqueItem(
    actor: any,
    strikeModeOverrides: Record<string, unknown> = {},
    opts: Record<string, unknown> = {},
): any {
    const logic = makeItemLogic(
        CombatTechniqueLogic,
        ITEM_KIND.COMBATTECHNIQUE,
        { group: "Pugilism", strikeMode: meleeModeData(strikeModeOverrides) },
        { actor, ...opts },
    );
    logic.initialize();
    return logic.item;
}

/** A linked-token stub matching the TokenActorRef contract. */
function makeToken(id: string, actorId: string | null, actorLink = true): any {
    return { id, actorId, actorLink, name: `token-${id}` };
}

/** A fresh body-location object as the lineage rebuilds them each cycle. */
function makeLocation(shortcode: string): any {
    return {
        shortcode,
        armorProtection: { blunt: 0, edged: 0, piercing: 0, fire: 0 },
        isRigid: false,
        armorType: "",
    };
}

/** An ArmorGear item stub exposing what aggregateArmorProtection reads. */
function makeArmorItem(
    material: string,
    protection: {
        blunt: number;
        edged: number;
        piercing: number;
        fire: number;
    },
    locations: { flexible?: string[]; rigid?: string[] },
): any {
    return {
        logic: {
            data: {
                material,
                locations: {
                    flexible: locations.flexible ?? [],
                    rigid: locations.rigid ?? [],
                },
            },
            protection: {
                blunt: { effective: protection.blunt },
                edged: { effective: protection.edged },
                piercing: { effective: protection.piercing },
                fire: { effective: protection.fire },
            },
        },
    };
}

afterEach(() => {
    vi.restoreAllMocks();
});

describe("BeingLogic", () => {
    describe("construction", () => {
        it("constructs against a plain-object BeingData (no Foundry)", () => {
            const logic = makeBeing();
            expect(logic).toBeInstanceOf(BeingLogic);
            expect(logic).toBeInstanceOf(SohlActorBaseLogic);
            expect(logic.data.kind).toBe(ACTOR_KIND.BEING);
        });

        it("declares only intrinsic executors that exist on the logic", () => {
            // Regression: SohlAction's constructor throws when an INTRINSIC
            // executor names a method missing from the logic (case-sensitive).
            for (const def of BeingLogic.defineIntrinsicActions()) {
                if (!def.executor) continue;
                expect(
                    typeof (BeingLogic.prototype as any)[def.executor],
                    `executor "${def.executor}"`,
                ).toBe("function");
            }
            expect(() => makeBeing()).not.toThrow();
        });

        it("defines the being intrinsic actions", () => {
            const logic = makeBeing();
            for (const shortcode of [
                "postfinalize",
                "shockTest",
                "stumbleTest",
                "fumbleTest",
                "moraleTest",
                "fearTest",
                "calcImpact",
                "contractAfflictionTest",
            ]) {
                expect(logic.actions.has(shortcode), shortcode).toBe(true);
            }
        });
    });

    describe("effectiveBaseMove", () => {
        it("returns a ValueModifier with base 0 when the being has no lineage", () => {
            const logic = makeBeing();
            const move = logic.effectiveBaseMove(MOVEMENT_MEDIUM.TERRESTRIAL);
            expect(move).toBeInstanceOf(ValueModifier);
            expect(move.base).toBe(0);
            expect(move.effective).toBe(0);
        });

        it("reads the lineage's moveBase for the requested medium", () => {
            const logic = makeBeing();
            (logic.actor as any).itemTypes = {
                [ITEM_KIND.LINEAGE]: [
                    { logic: { moveBase: { terrestrial: 60, aquatic: 20 } } },
                ],
            };
            expect(
                logic.effectiveBaseMove(MOVEMENT_MEDIUM.TERRESTRIAL).effective,
            ).toBe(60);
            expect(
                logic.effectiveBaseMove(MOVEMENT_MEDIUM.AQUATIC).effective,
            ).toBe(20);
        });

        it("returns base 0 for a medium the lineage has no value for", () => {
            const logic = makeBeing();
            (logic.actor as any).itemTypes = {
                [ITEM_KIND.LINEAGE]: [
                    { logic: { moveBase: { terrestrial: 60 } } },
                ],
            };
            expect(
                logic.effectiveBaseMove(MOVEMENT_MEDIUM.AERIAL).effective,
            ).toBe(0);
        });
    });

    describe("reach", () => {
        it("is 0 when the being has no strike modes", () => {
            const logic = makeBeing();
            expect(logic.reach).toBe(0);
        });

        it("uses combat-technique modes, which are intrinsic and always available", () => {
            const logic = makeBeing();
            const actor: any = logic.actor;
            const ct = makeTechniqueItem(actor, { lengthBase: 4 });
            actor.itemTypes = { [ITEM_KIND.COMBATTECHNIQUE]: [ct] };
            expect(logic.reach).toBe(4);
        });

        it("takes the greatest reach among available modes, including held weapons", () => {
            const logic = makeBeing();
            const actor: any = logic.actor;
            const ct = makeTechniqueItem(actor, { lengthBase: 4 });
            const weaponMode = makeMeleeMode(logic, {
                lengthBase: 6,
                minParts: 2,
            });
            const limbsHolding = vi.fn(() => 2);
            actor.itemTypes = {
                [ITEM_KIND.LINEAGE]: [
                    { logic: { bodyStructure: { limbsHolding } } },
                ],
                [ITEM_KIND.COMBATTECHNIQUE]: [ct],
                [ITEM_KIND.WEAPONGEAR]: [
                    { id: "wpn1", logic: { strikeModes: [weaponMode] } },
                ],
            };
            expect(logic.reach).toBe(6);
            expect(limbsHolding).toHaveBeenCalledWith("wpn1");
        });

        it("ignores a weapon mode when the weapon is held in fewer than minParts limbs", () => {
            const logic = makeBeing();
            const actor: any = logic.actor;
            const ct = makeTechniqueItem(actor, { lengthBase: 4 });
            const weaponMode = makeMeleeMode(logic, {
                lengthBase: 6,
                minParts: 2,
            });
            actor.itemTypes = {
                [ITEM_KIND.LINEAGE]: [
                    { logic: { bodyStructure: { limbsHolding: () => 1 } } },
                ],
                [ITEM_KIND.COMBATTECHNIQUE]: [ct],
                [ITEM_KIND.WEAPONGEAR]: [
                    { id: "wpn1", logic: { strikeModes: [weaponMode] } },
                ],
            };
            expect(logic.reach).toBe(4);
        });
    });

    describe("availableStrikeModes", () => {
        it("is empty when the being has no strike modes", () => {
            const logic = makeBeing();
            expect(logic.availableStrikeModes).toEqual([]);
        });

        it("always includes technique modes, listed before weapon modes", () => {
            const logic = makeBeing();
            const actor: any = logic.actor;
            const ct = makeTechniqueItem(actor);
            const weaponMode = makeMeleeMode(logic, { minParts: 1 });
            actor.itemTypes = {
                [ITEM_KIND.LINEAGE]: [
                    { logic: { bodyStructure: { limbsHolding: () => 1 } } },
                ],
                [ITEM_KIND.COMBATTECHNIQUE]: [ct],
                [ITEM_KIND.WEAPONGEAR]: [
                    { id: "wpn1", logic: { strikeModes: [weaponMode] } },
                ],
            };
            const modes = logic.availableStrikeModes;
            expect(modes).toEqual([ct.logic.strikeMode, weaponMode]);
        });

        it("excludes weapon modes when there is no body structure to hold them", () => {
            const logic = makeBeing();
            const actor: any = logic.actor;
            const weaponMode = makeMeleeMode(logic, { minParts: 1 });
            actor.itemTypes = {
                [ITEM_KIND.WEAPONGEAR]: [
                    { id: "wpn1", logic: { strikeModes: [weaponMode] } },
                ],
            };
            expect(logic.availableStrikeModes).toEqual([]);
        });
    });

    describe("tokens", () => {
        it("is empty when there is no active scene", () => {
            const logic = makeBeing();
            expect(logic.tokens).toEqual([]);
        });

        it("returns the active scene's linked tokens for a world actor", () => {
            const logic = makeBeing();
            const actorId = logic.actor!.id!;
            const mine = makeToken("tok1", actorId);
            const unlinked = makeToken("tok2", actorId, false);
            const other = makeToken("tok3", "someoneelse0000");
            vi.spyOn(FoundryHelpersMock, "getActiveScene").mockReturnValue({
                tokens: [mine, unlinked, other],
            } as any);
            expect(logic.tokens).toEqual([mine]);
        });

        it("returns only the embedded token for a synthetic actor", () => {
            const logic = makeBeing();
            const actor: any = logic.actor;
            const embedded = makeToken("tok1", actor.id, false);
            actor.isToken = true;
            actor.token = embedded;
            vi.spyOn(FoundryHelpersMock, "getActiveScene").mockReturnValue({
                tokens: [embedded, makeToken("tok2", actor.id)],
            } as any);
            expect(logic.tokens).toEqual([embedded]);
        });

        it("is empty for a synthetic actor whose token is not on the active scene", () => {
            const logic = makeBeing();
            const actor: any = logic.actor;
            actor.isToken = true;
            actor.token = makeToken("tok1", actor.id, false);
            vi.spyOn(FoundryHelpersMock, "getActiveScene").mockReturnValue({
                tokens: [makeToken("tok2", actor.id)],
            } as any);
            expect(logic.tokens).toEqual([]);
        });
    });

    describe("combatant", () => {
        it("is null when there is no active combat", () => {
            const logic = makeBeing();
            expect(logic.combatant).toBeNull();
        });

        it("returns the first combatant whose token is one of the being's tokens", () => {
            const logic = makeBeing();
            const actorId = logic.actor!.id!;
            vi.spyOn(FoundryHelpersMock, "getActiveScene").mockReturnValue({
                tokens: [makeToken("tok1", actorId)],
            } as any);
            const mine = { tokenId: "tok1" };
            vi.spyOn(FoundryHelpersMock, "getActiveCombat").mockReturnValue({
                combatants: {
                    contents: [{ tokenId: "other" }, mine],
                },
            } as any);
            expect(logic.combatant).toBe(mine);
        });

        it("is null when no combatant matches the being's tokens", () => {
            const logic = makeBeing();
            const actorId = logic.actor!.id!;
            vi.spyOn(FoundryHelpersMock, "getActiveScene").mockReturnValue({
                tokens: [makeToken("tok1", actorId)],
            } as any);
            vi.spyOn(FoundryHelpersMock, "getActiveCombat").mockReturnValue({
                combatants: { contents: [{ tokenId: "other" }] },
            } as any);
            expect(logic.combatant).toBeNull();
        });
    });

    describe("unimplemented test methods", () => {
        it("resolve to null (not yet implemented)", async () => {
            const logic = makeBeing();
            const ctx = { scope: {} } as any;
            await expect(logic.calcImpact(ctx)).resolves.toBeNull();
            await expect(logic.shockTest(ctx)).resolves.toBeNull();
            await expect(logic.stumbleTest(ctx)).resolves.toBeNull();
            await expect(logic.fumbleTest(ctx)).resolves.toBeNull();
            await expect(logic.moraleTest(ctx)).resolves.toBeNull();
            await expect(logic.fearTest(ctx)).resolves.toBeNull();
            await expect(logic.contractAfflictionTest(ctx)).resolves.toBeNull();
        });

        it.todo("shockTest - rolls the Shock skill without impairment penalty");
        it.todo(
            "stumbleTest - uses the better of agility trait or acrobatics skill",
        );
        it.todo(
            "fumbleTest - uses the better of dexterity trait or legerdemain skill",
        );
        it.todo("moraleTest / fearTest - roll the Initiative skill");
        it.todo(
            "calcImpact - calculates location and damage from CombatResult",
        );
        it.todo("contractAfflictionTest - tests contraction of an affliction");
    });

    // Opposed-test resume moved off the actor onto SohlTokenDocumentLogic
    // (opposed tests are token-based). See SohlTokenDocumentLogic.test.ts.

    describe("lifecycle", () => {
        it("initialize/evaluate/finalize run without items present", () => {
            const logic = makeBeing();
            expect(() => {
                logic.initialize();
                logic.evaluate();
                logic.finalize();
            }).not.toThrow();
        });

        it("evaluate aggregates worn armor onto the body locations", () => {
            const logic = makeBeing();
            const thorax = makeLocation("thorax");
            const skull = makeLocation("skull");
            (logic.actor as any).itemTypes = {
                [ITEM_KIND.LINEAGE]: [
                    {
                        logic: {
                            bodyStructure: {
                                getAllLocations: () => [thorax, skull],
                            },
                        },
                    },
                ],
                [ITEM_KIND.ARMORGEAR]: [
                    makeArmorItem(
                        "Mail",
                        { blunt: 2, edged: 5, piercing: 4, fire: 1 },
                        { flexible: ["thorax"] },
                    ),
                    makeArmorItem(
                        "Plate",
                        { blunt: 4, edged: 6, piercing: 5, fire: 2 },
                        { rigid: ["thorax"] },
                    ),
                ],
            };
            logic.evaluate();
            expect(thorax.armorProtection).toEqual({
                blunt: 6,
                edged: 11,
                piercing: 9,
                fire: 3,
            });
            expect(thorax.isRigid).toBe(true);
            expect(thorax.armorType).toBe("Mail, Plate");
            // Uncovered location stays bare.
            expect(skull.armorProtection).toEqual({
                blunt: 0,
                edged: 0,
                piercing: 0,
                fire: 0,
            });
            expect(skull.isRigid).toBe(false);
            expect(skull.armorType).toBe("");
        });

        it("evaluate resets prior aggregation state before reapplying layers", () => {
            const logic = makeBeing();
            const thorax = makeLocation("thorax");
            const itemTypes: any = {
                [ITEM_KIND.LINEAGE]: [
                    {
                        logic: {
                            bodyStructure: {
                                getAllLocations: () => [thorax],
                            },
                        },
                    },
                ],
                [ITEM_KIND.ARMORGEAR]: [
                    makeArmorItem(
                        "Mail",
                        { blunt: 2, edged: 5, piercing: 4, fire: 1 },
                        { flexible: ["thorax"] },
                    ),
                ],
            };
            (logic.actor as any).itemTypes = itemTypes;
            logic.evaluate();
            logic.evaluate();
            // Idempotent: a second pass does not double the protection.
            expect(thorax.armorProtection.edged).toBe(5);
            expect(thorax.armorType).toBe("Mail");
        });

        it("finalize warns when the being has no Lineage item", () => {
            const logic = makeBeing();
            const warn = vi.spyOn(sohl.log, "warn");
            logic.finalize();
            expect(warn).toHaveBeenCalledWith(
                expect.stringMatching(/no Lineage item/),
            );
        });

        it("finalize does not warn when a Lineage item is present", () => {
            const logic = makeBeing();
            (logic.actor as any).itemTypes = {
                [ITEM_KIND.LINEAGE]: [{ logic: {} }],
            };
            const warn = vi.spyOn(sohl.log, "warn");
            logic.finalize();
            expect(warn).not.toHaveBeenCalled();
        });
    });

    describe("properties", () => {
        // health / healingBase / shockState are declared on BeingLogic but
        // never assigned by any lifecycle phase yet.
        it.todo("health - is a ValueModifier after initialize");
        it.todo("healingBase - is a ValueModifier after initialize");
        it.todo("shockState - tracks current shock state");
    });
});

describe("BeingDataModel", () => {
    describe("defineSchema", () => {
        it.todo("includes SohlActorDataModel base schema fields");
        it.todo("has no additional fields beyond base actor schema");
    });

    it.todo("has kind set to ACTOR_KIND.BEING");
    it.todo("has correct LOCALIZATION_PREFIXES");
});
