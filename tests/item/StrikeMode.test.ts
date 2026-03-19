import { describe, it } from "vitest";

describe("StrikeModeLogic", () => {
    describe("properties", () => {
        it.todo("traits - has noAttack and noBlock flags after initialize");
        it.todo("assocSkill - resolves associated skill item from actor");
        it.todo("impact - is an ImpactModifier after initialize");
        it.todo("attack - is a CombatModifier after initialize");
        it.todo("durability - is a ValueModifier after initialize");
    });

    describe("attackTest", () => {
        it.todo("delegates to attack.successTest with the provided context");
        it.todo("returns null when successTest returns falsy");
    });

    describe("initialize", () => {
        it.todo("sets traits.noAttack to false");
        it.todo("sets traits.noBlock to false");
        it.todo("creates ImpactModifier and sets base from data.impactBase");
        it.todo("creates CombatModifier");
        it.todo("creates durability ValueModifier");
        it.todo("resolves associated skill from actor by name");
        it.todo("adds skill mastery level to attack modifier when skill found");
        it.todo("logs warning when associated skill is not found");
    });

    describe("evaluate", () => {
        it.todo("adds parent gear durability to strike mode durability when nested in gear");
    });

    describe("finalize", () => {
        it.todo("calls super.finalize");
    });
});

describe("StrikeModeDataModel", () => {
    describe("defineSchema", () => {
        it.todo("includes SohlItemDataModel base schema fields");
        it.todo("defines mode as a StringField");
        it.todo("defines zoneDie as integer NumberField with min 0, initial 0");
        it.todo("defines minParts as integer NumberField with min 0, initial 1");
        it.todo("defines assocSkillName as a StringField");
        it.todo("defines impactBase as SchemaField with numDice, die, modifier, and aspect");
    });
});
