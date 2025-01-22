/* eslint-disable no-unused-vars */
import * as sohl from "./sohl-common.js";

/* ====================================================================== */
/*          Constants                                                     */
/* ====================================================================== */

const ISLE = {
    CONST: {
        // Legendary init message with ASCII Artwork (Doom font)
        initVersionMessage: `___  ____     _           _____    _      
|  \\/  (_)   | |         |_   _|  | |     
| .  . |_ ___| |_ _   _    | | ___| | ___ 
| |\\/| | / __| __| | | |   | |/ __| |/ _ \\
| |  | | \\__ \\ |_| |_| |  _| |\\__ \\ |  __/
\\_|  |_/_|___/\\__|\\__, |  \\___/___/_|\\___|
                   __/ |                  
                  |___/                   
===========================================================`,

        VERSETTINGS: {},
    },
};

ISLE.allowedRanges = ["Short", "Medium", "Long", "Extreme"];

ISLE.ITEM_TYPE_LABEL = {
    skill: { singular: "Skill", plural: "Skills" },
    spell: { singular: "Spell", plural: "Spells" },
    weapongear: { singular: "Melee Weapon", plural: "Melee Weapons" },
    missilegear: { singular: "Missile", plural: "Missiles" },
    armorgear: { singular: "Armor", plural: "Armor" },
    miscgear: { singular: "Misc Item", plural: "Misc Items" },
    containergear: { singular: "Container", plural: "Containers" },
    injury: { singular: "Injury", plural: "Injuries" },
    armorlocation: { singular: "Armor Location", plural: "Armor Locations" },
    trait: { singular: "Trait", plural: "Traits" },
    psionic: { singular: "Psionic", plural: "Psionics" },
    incantation: {
        singular: "Ritual Incantation",
        plural: "Ritual Incantations",
    },
};

// ISLE.defaultCharacterSkills = [
//     'Climbing', 'Jumping', 'Stealth', 'Throwing', 'Awareness', 'Intrigue', 'Oratory', 'Rhetoric', 'Singing',
//     'Initiative', 'Unarmed', 'Dodge'];

// ISLE.defaultCreatureSkills = ['Awareness', 'Initiative', 'Unarmed', 'Dodge'];

ISLE.injuryLevels = ["NA", "M1", "S2", "S3", "G4", "G5", "K4", "K5"];

ISLE.meleeCombatTable = {
    block: {
        "cf:cf": {
            atkFumble: true,
            defFumble: true,
            atkStumble: false,
            defStumble: false,
            dta: false,
            block: false,
            miss: false,
            atkDice: 0,
            defDice: 0,
        },
        "mf:cf": {
            atkFumble: false,
            defFumble: true,
            atkStumble: false,
            defStumble: false,
            dta: false,
            block: false,
            miss: false,
            atkDice: 0,
            defDice: 0,
        },
        "ms:cf": {
            atkFumble: false,
            defFumble: false,
            atkStumble: false,
            defStumble: false,
            dta: false,
            block: false,
            miss: false,
            atkDice: 2,
            defDice: 0,
        },
        "cs:cf": {
            atkFumble: false,
            defFumble: false,
            atkStumble: false,
            defStumble: false,
            dta: false,
            block: false,
            miss: false,
            atkDice: 3,
            defDice: 0,
        },

        "cf:mf": {
            atkFumble: true,
            defFumble: false,
            atkStumble: false,
            defStumble: false,
            dta: false,
            block: false,
            miss: false,
            atkDice: 0,
            defDice: 0,
        },
        "mf:mf": {
            atkFumble: false,
            defFumble: false,
            atkStumble: false,
            defStumble: false,
            dta: false,
            block: true,
            atkDice: 0,
            defDice: 0,
        },
        "ms:mf": {
            atkFumble: false,
            defFumble: false,
            atkStumble: false,
            defStumble: false,
            dta: false,
            block: false,
            miss: false,
            atkDice: 1,
            defDice: 0,
        },
        "cs:mf": {
            atkFumble: false,
            defFumble: false,
            atkStumble: false,
            defStumble: false,
            dta: false,
            block: false,
            miss: false,
            atkDice: 2,
            defDice: 0,
        },

        "cf:ms": {
            atkFumble: false,
            defFumble: false,
            atkStumble: false,
            defStumble: false,
            dta: true,
            block: false,
            miss: false,
            atkDice: 0,
            defDice: 0,
        },
        "mf:ms": {
            atkFumble: false,
            defFumble: false,
            atkStumble: false,
            defStumble: false,
            dta: true,
            block: false,
            miss: false,
            atkDice: 0,
            defDice: 0,
        },
        "ms:ms": {
            atkFumble: false,
            defFumble: false,
            atkStumble: false,
            defStumble: false,
            dta: false,
            block: true,
            atkDice: 0,
            defDice: 0,
        },
        "cs:ms": {
            atkFumble: false,
            defFumble: false,
            atkStumble: false,
            defStumble: false,
            dta: false,
            block: false,
            miss: false,
            atkDice: 1,
            defDice: 0,
        },

        "cf:cs": {
            atkFumble: false,
            defFumble: false,
            atkStumble: false,
            defStumble: false,
            dta: true,
            block: false,
            miss: false,
            atkDice: 0,
            defDice: 0,
        },
        "mf:cs": {
            atkFumble: false,
            defFumble: false,
            atkStumble: false,
            defStumble: false,
            dta: true,
            block: false,
            miss: false,
            atkDice: 0,
            defDice: 0,
        },
        "ms:cs": {
            atkFumble: false,
            defFumble: false,
            atkStumble: false,
            defStumble: false,
            dta: true,
            block: false,
            miss: false,
            atkDice: 0,
            defDice: 0,
        },
        "cs:cs": {
            atkFumble: false,
            defFumble: false,
            atkStumble: false,
            defStumble: false,
            dta: false,
            block: true,
            atkDice: 0,
            defDice: 0,
        },
    },
    counterstrike: {
        "cf:cf": {
            atkFumble: true,
            defFumble: true,
            atkStumble: false,
            defStumble: false,
            dta: false,
            block: false,
            miss: false,
            atkDice: 0,
            defDice: 0,
        },
        "mf:cf": {
            atkFumble: false,
            defFumble: true,
            atkStumble: false,
            defStumble: false,
            dta: false,
            block: false,
            miss: false,
            atkDice: 0,
            defDice: 0,
        },
        "ms:cf": {
            atkFumble: false,
            defFumble: false,
            atkStumble: false,
            defStumble: false,
            dta: false,
            block: false,
            miss: false,
            atkDice: 3,
            defDice: 0,
        },
        "cs:cf": {
            atkFumble: false,
            defFumble: false,
            atkStumble: false,
            defStumble: false,
            dta: false,
            block: false,
            miss: false,
            atkDice: 4,
            defDice: 0,
        },

        "cf:mf": {
            atkFumble: true,
            defFumble: false,
            atkStumble: false,
            defStumble: false,
            dta: false,
            block: false,
            miss: false,
            atkDice: 0,
            defDice: 0,
        },
        "mf:mf": {
            atkFumble: false,
            defFumble: false,
            atkStumble: false,
            defStumble: false,
            dta: false,
            block: true,
            atkDice: 0,
            defDice: 0,
        },
        "ms:mf": {
            atkFumble: false,
            defFumble: false,
            atkStumble: false,
            defStumble: false,
            dta: false,
            block: false,
            miss: false,
            atkDice: 2,
            defDice: 0,
        },
        "cs:mf": {
            atkFumble: false,
            defFumble: false,
            atkStumble: false,
            defStumble: false,
            dta: false,
            block: false,
            miss: false,
            atkDice: 3,
            defDice: 0,
        },

        "cf:ms": {
            atkFumble: false,
            defFumble: false,
            atkStumble: false,
            defStumble: false,
            dta: false,
            block: false,
            miss: false,
            atkDice: 0,
            defDice: 2,
        },
        "mf:ms": {
            atkFumble: false,
            defFumble: false,
            atkStumble: false,
            defStumble: false,
            dta: false,
            block: false,
            miss: false,
            atkDice: 0,
            defDice: 1,
        },
        "ms:ms": {
            atkFumble: false,
            defFumble: false,
            atkStumble: false,
            defStumble: false,
            dta: false,
            block: false,
            miss: false,
            atkDice: 1,
            defDice: 1,
        },
        "cs:ms": {
            atkFumble: false,
            defFumble: false,
            atkStumble: false,
            defStumble: false,
            dta: false,
            block: false,
            miss: false,
            atkDice: 1,
            defDice: 0,
        },

        "cf:cs": {
            atkFumble: false,
            defFumble: false,
            atkStumble: false,
            defStumble: false,
            dta: false,
            block: false,
            miss: false,
            atkDice: 0,
            defDice: 3,
        },
        "mf:cs": {
            atkFumble: false,
            defFumble: false,
            atkStumble: false,
            defStumble: false,
            dta: false,
            block: false,
            miss: false,
            atkDice: 0,
            defDice: 2,
        },
        "ms:cs": {
            atkFumble: false,
            defFumble: false,
            atkStumble: false,
            defStumble: false,
            dta: false,
            block: false,
            miss: false,
            atkDice: 0,
            defDice: 1,
        },
        "cs:cs": {
            atkFumble: false,
            defFumble: false,
            atkStumble: false,
            defStumble: false,
            dta: false,
            block: false,
            miss: false,
            atkDice: 2,
            defDice: 2,
        },
    },
    dodge: {
        "cf:cf": {
            atkFumble: false,
            defFumble: false,
            atkStumble: true,
            defStumble: true,
            dta: false,
            block: false,
            miss: false,
            atkDice: 0,
            defDice: 0,
        },
        "mf:cf": {
            atkFumble: false,
            defFumble: false,
            atkStumble: false,
            defStumble: true,
            dta: false,
            block: false,
            miss: false,
            atkDice: 0,
            defDice: 0,
        },
        "ms:cf": {
            atkFumble: false,
            defFumble: false,
            atkStumble: false,
            defStumble: false,
            dta: false,
            block: false,
            miss: false,
            atkDice: 2,
            defDice: 0,
        },
        "cs:cf": {
            atkFumble: false,
            defFumble: false,
            atkStumble: false,
            defStumble: false,
            dta: false,
            block: false,
            miss: false,
            atkDice: 3,
            defDice: 0,
        },

        "cf:mf": {
            atkFumble: false,
            defFumble: false,
            atkStumble: true,
            defStumble: false,
            dta: false,
            block: false,
            miss: false,
            atkDice: 0,
            defDice: 0,
        },
        "mf:mf": {
            atkFumble: false,
            defFumble: false,
            atkStumble: false,
            defStumble: false,
            dta: false,
            block: false,
            miss: true,
            atkDice: 0,
            defDice: 0,
        },
        "ms:mf": {
            atkFumble: false,
            defFumble: false,
            atkStumble: false,
            defStumble: false,
            dta: false,
            block: false,
            miss: false,
            atkDice: 1,
            defDice: 0,
        },
        "cs:mf": {
            atkFumble: false,
            defFumble: false,
            atkStumble: false,
            defStumble: false,
            dta: false,
            block: false,
            miss: false,
            atkDice: 2,
            defDice: 0,
        },

        "cf:ms": {
            atkFumble: false,
            defFumble: false,
            atkStumble: false,
            defStumble: false,
            dta: true,
            block: false,
            miss: false,
            atkDice: 0,
            defDice: 0,
        },
        "mf:ms": {
            atkFumble: false,
            defFumble: false,
            atkStumble: false,
            defStumble: false,
            dta: false,
            block: false,
            miss: true,
            atkDice: 0,
            defDice: 0,
        },
        "ms:ms": {
            atkFumble: false,
            defFumble: false,
            atkStumble: false,
            defStumble: false,
            dta: false,
            block: false,
            miss: true,
            atkDice: 0,
            defDice: 0,
        },
        "cs:ms": {
            atkFumble: false,
            defFumble: false,
            atkStumble: false,
            defStumble: false,
            dta: false,
            block: false,
            miss: false,
            atkDice: 1,
            defDice: 0,
        },

        "cf:cs": {
            atkFumble: false,
            defFumble: false,
            atkStumble: false,
            defStumble: false,
            dta: true,
            block: false,
            miss: false,
            atkDice: 0,
            defDice: 0,
        },
        "mf:cs": {
            atkFumble: false,
            defFumble: false,
            atkStumble: false,
            defStumble: false,
            dta: true,
            block: false,
            miss: false,
            atkDice: 0,
            defDice: 0,
        },
        "ms:cs": {
            atkFumble: false,
            defFumble: false,
            atkStumble: false,
            defStumble: false,
            dta: false,
            block: false,
            miss: true,
            atkDice: 0,
            defDice: 0,
        },
        "cs:cs": {
            atkFumble: false,
            defFumble: false,
            atkStumble: false,
            defStumble: false,
            dta: false,
            block: false,
            miss: true,
            atkDice: 0,
            defDice: 0,
        },
    },
    ignore: {
        cf: {
            atkFumble: false,
            defFumble: false,
            atkStumble: false,
            defStumble: false,
            dta: true,
            block: false,
            miss: false,
            atkDice: 0,
            defDice: 0,
        },
        mf: {
            atkFumble: false,
            defFumble: false,
            atkStumble: false,
            defStumble: false,
            dta: false,
            block: false,
            miss: false,
            atkDice: 1,
            defDice: 0,
        },
        ms: {
            atkFumble: false,
            defFumble: false,
            atkStumble: false,
            defStumble: false,
            dta: false,
            block: false,
            miss: false,
            atkDice: 3,
            defDice: 0,
        },
        cs: {
            atkFumble: false,
            defFumble: false,
            atkStumble: false,
            defStumble: false,
            dta: false,
            block: false,
            miss: false,
            atkDice: 4,
            defDice: 0,
        },
    },
};

ISLE.missileCombatTable = {
    block: {
        "cf:cf": { wild: true, block: false, miss: false, atkDice: 0 },
        "mf:cf": { wild: false, block: false, miss: true, atkDice: 0 },
        "ms:cf": { wild: false, block: false, miss: false, atkDice: 2 },
        "cs:cf": { wild: false, block: false, miss: false, atkDice: 3 },

        "cf:mf": { wild: true, block: false, miss: false, atkDice: 0 },
        "mf:mf": { wild: false, block: false, miss: true, atkDice: 0 },
        "ms:mf": { wild: false, block: false, miss: false, atkDice: 1 },
        "cs:mf": { wild: false, block: false, miss: false, atkDice: 2 },

        "cf:ms": { wild: true, block: false, miss: false, atkDice: 0 },
        "mf:ms": { wild: false, block: false, miss: true, atkDice: 0 },
        "ms:ms": { wild: false, block: true, miss: false, atkDice: 0 },
        "cs:ms": { wild: false, block: false, miss: false, atkDice: 1 },

        "cf:cs": { wild: true, block: false, miss: false, atkDice: 0 },
        "mf:cs": { wild: false, block: false, miss: true, atkDice: 0 },
        "ms:cs": { wild: false, block: true, miss: false, atkDice: 0 },
        "cs:cs": { wild: false, block: true, miss: false, atkDice: 0 },
    },
    dodge: {
        "cf:cf": { wild: true, block: false, miss: false, atkDice: 0 },
        "mf:cf": { wild: false, block: false, miss: true, atkDice: 0 },
        "ms:cf": { wild: false, block: false, miss: false, atkDice: 2 },
        "cs:cf": { wild: false, block: false, miss: false, atkDice: 3 },

        "cf:mf": { wild: true, block: false, miss: false, atkDice: 0 },
        "mf:mf": { wild: false, block: false, miss: true, atkDice: 0 },
        "ms:mf": { wild: false, block: false, miss: false, atkDice: 1 },
        "cs:mf": { wild: false, block: false, miss: false, atkDice: 2 },

        "cf:ms": { wild: true, block: false, miss: false, atkDice: 0 },
        "mf:ms": { wild: false, block: false, miss: true, atkDice: 0 },
        "ms:ms": { wild: false, block: false, miss: true, atkDice: 0 },
        "cs:ms": { wild: false, block: false, miss: false, atkDice: 1 },

        "cf:cs": { wild: true, block: false, miss: false, atkDice: 0 },
        "mf:cs": { wild: false, block: false, miss: true, atkDice: 0 },
        "ms:cs": { wild: false, block: false, miss: true, atkDice: 0 },
        "cs:cs": { wild: false, block: false, miss: true, atkDice: 0 },
    },
    ignore: {
        cf: { wild: true, block: false, miss: false, atkDice: 0 },
        mf: { wild: false, block: false, miss: true, atkDice: 0 },
        ms: { wild: false, block: false, miss: false, atkDice: 2 },
        cs: { wild: false, block: false, miss: false, atkDice: 3 },
    },
};

ISLE.actorLabels = {
    character: "Character",
    creature: "Creature",
    container: "Container",
};

class IsleAnimateEntityActorData extends sohl.AnimateEntityActorData {
    $totalInjuryLevels;
    $totalFatigue;
    $univPenalty;
    $physPenalty;

    get encPenalty() {
        const endTrait = this.actor.getTraitByAbbrev("end");
        const endScore = endTrait?.system.$score.effective || 0;
        return -Math.floor(
            endScore ? this.$gearWeight.effective / endScore : 0,
        );
    }

    get intrinsicActions() {
        let actions = super.intrinsicActions.map((a) => {
            if (a.contextGroup === sohl.SohlContextMenu.sortGroups.Default) {
                a.contextGroup = sohl.SohlContextMenu.sortGroups.Primary;
            }
            return a;
        });

        actions.push(
            // TODO - Add Isle Actor Actions
        );

        actions.sort((a, b) => a.contextGroup.localeCompare(b.contextGroup));
        return actions;
    }

    async damageRoll({
        targetToken,
        impactMod,
        bodyLocationUuid,
        skipDialog = false,
        ...options
    } = {}) {
        return super.damageRoll({
            targetToken,
            impactMod,
            bodyLocationUuid,
            skipDialog,
            ...options,
        });
    }

    async _damageDialog({
        type,
        label,
        strikeMode,
        impactMod,
        numImpactTAs = 0,
        ...options
    }) {
        return super._damageDialog({
            type,
            label,
            strikeMode,
            impactMod,
            numImpactTAs,
            ...options,
        });
    }

    async _damageDialogCallback(html, { type, impactMod, strikeMode }) {
        const form = html[0].querySelector("form");
        const formNumImpactTAs =
            Number.parseInt(form.numImpactTAs.value, 10) || 0;
        const newImpact = impactMod
            ? this.constructor.create(impactMod)
            : {
                  die: Number.parseInt(form.impactDie.value, 10) || 0,
                  modifier: Number.parseInt(form.impactModifier.value, 10) || 0,
                  aspect: form.impactAspect.value,
              };
        if (formNumImpactTAs) {
            const impactAdd =
                (strikeMode?.system.$traits.impactTA || newImpact.impactTA) *
                formNumImpactTAs;
            newImpact.add(`${formNumImpactTAs} Impact TAs`, "ImpTA", impactAdd);
        }

        return super._damageDialogCallback(html, {
            type,
            impactMod,
            strikeMode,
        });
    }

    prepareBaseData() {
        super.prepareBaseData();
        this.$physPenalty = new sohl.ValueModifier(this);
        this.$univPenalty = new sohl.ValueModifier(this);
        this.$totalInjuryLevels = new sohl.ValueModifier(this);
        this.$totalFatigue = new sohl.ValueModifier(this);
    }
}

class IsleProtectionItemData extends sohl.ProtectionItemData {}

function IsleStrikeModeItemDataMixin(BaseMLID) {
    return class IsleStrikeModeItemData extends BaseMLID {
        static get effectKeys() {
            return sohl.Utility.simpleMerge(super.effectKeys, {});
        }

        prepareBaseData() {
            super.prepareBaseData();
            foundry.utils.mergeObject(this.$traits, {
                noBlock: false,
                noAttack: false,
            });
        }

        processSiblings() {
            super.processSiblings();
            if (this.$traits.noBlock) this.$defense.block.disabled = true;
            if (this.$traits.noAttack) {
                this.$attack.disabled = true;
                this.$defense.counterstrike.disabled = true;
            }
        }
    };
}

class IsleMeleeWeaponStrikeModeItemData extends IsleStrikeModeItemDataMixin(
    sohl.MeleeWeaponStrikeModeItemData,
) {
    static get effectKeys() {
        return sohl.Utility.simpleMerge(super.effectKeys, {
            "system.$traits.oneHandPenalty": {
                label: "One Handed Penalty",
                abbrev: "OneHand",
            },
        });
    }

    get intrinsicActions() {
        let actions = super.intrinsicActions
            .filter((a) => a.name !== "attack")
            .map((a) => {
                if (
                    a.contextGroup === sohl.SohlContextMenu.sortGroups.Default
                ) {
                    a.contextGroup = sohl.SohlContextMenu.sortGroups.Primary;
                }
                return a;
            });

        actions.push({
            functionName: "automatedAttack",
            name: "Automated Attack",
            contextIconClass: "fas fa-sword",
            contextCondition: (header) => {
                header = header instanceof HTMLElement ? header : header[0];
                const li = header.closest(".item");
                const item = fromUuidSync(li.dataset.uuid);
                return item && !item.system.$attack.disabled;
            },
            contextGroup: sohl.SohlContextMenu.sortGroups.Default,
        });

        actions.sort((a, b) => a.contextGroup.localeCompare(b.contextGroup));
        return actions;
    }

    async automatedAttack(
        speaker = null,
        actor = null,
        token = null,
        character = null,
        {
            skipDialog = false,
            noChat = false,
            type = `${this.type}-${this.name}-bleed-stop-test`,
            title = `${this.item.label} Bleeding Stoppage Test`,
            // biome-ignore lint/correctness/noUnusedVariables: <explanation>
            ...scope
        },
    ) {
        ({ speaker, actor, token, character } =
            sohl.SohlMacro.getExecuteDefaults({
                speaker,
                actor,
                token,
                character,
            }));

        // TODO - Melee Automated Attack
        ui.notifications.warn("Melee Automated Attack Not Implemented");
    }

    /** @override */
    prepareBaseData() {
        super.prepareBaseData();
        foundry.utils.mergeObject(this.$traits, {
            noAttack: false,
            noBlock: false,
            oneHandPenalty: 0,
        });
    }

    processSiblings() {
        super.processSiblings();

        if (this.actor.system.$engagedOpponents.effective > 1) {
            const outnumberedPenalty =
                this.actor.system.$engagedOpponents.effective * -10;
            this.$defense.block.add("Outnumbered", "Outn", outnumberedPenalty);
            this.$defense.counterstrike.add(
                "Outnumbered",
                "Outn",
                outnumberedPenalty,
            );
        }
    }
}

class IsleMissileWeaponStrikeModeItemData extends IsleStrikeModeItemDataMixin(
    sohl.MissileWeaponStrikeModeItemData,
) {
    get range() {
        const shortRange = this.getFlag("mistyisle.range.short") || 0;
        const mediumRange = this.getFlag("mistyisle.range.medium") || 0;
        const longRange = this.getFlag("mistyisle.range.long") || 0;
        const extremeRange = this.getFlag("mistyisle.range.extreme") || 0;
        return {
            short: shortRange,
            medium: mediumRange,
            long: longRange,
            extreme: extremeRange,
        };
    }

    get impact() {
        const shortImpact = this.getFlag("mistyisle.impact.short") || 0;
        const mediumImpact = this.getFlag("mistyisle.impact.medium") || 0;
        const longImpact = this.getFlag("mistyisle.impact.long") || 0;
        const extremeImpact = this.getFlag("mistyisle.impact.extreme") || 0;
        return {
            short: shortImpact,
            medium: mediumImpact,
            long: longImpact,
            extreme: extremeImpact,
        };
    }

    get intrinsicActions() {
        let actions = super.intrinsicActions
            .filter((a) => a.name !== "attack")
            .map((a) => {
                if (
                    a.contextGroup === sohl.SohlContextMenu.sortGroups.Default
                ) {
                    a.contextGroup = sohl.SohlContextMenu.sortGroups.Primary;
                }
                return a;
            });

        actions.push(
            {
                functionName: "automatedAttack",
                name: "Automated Attack",
                contextIconClass: "fas fa-bow-arrow",
                contextCondition: (header) => {
                    header = header instanceof HTMLElement ? header : header[0];
                    const li = header.closest(".item");
                    const item = fromUuidSync(li.dataset.uuid);
                    return item && !item.system.$attack.disabled;
                },
                contextGroup: sohl.SohlContextMenu.sortGroups.Default,
            },
            {
                functionName: "missileAttackTest",
                name: "Missile Attack Test",
                contextIconClass: "fas fa-location-arrow-up fa-rotate-90",
                contextCondition: (header) => {
                    header = header instanceof HTMLElement ? header : header[0];
                    const li = header.closest(".item");
                    const item = fromUuidSync(li.dataset.uuid);
                    return item && !item.system.$attack.disabled;
                },
                contextGroup: sohl.SohlContextMenu.sortGroups.Primary,
            },
        );

        actions.sort((a, b) => a.contextGroup.localeCompare(b.contextGroup));
        return actions;
    }

    async automatedAttack(
        speaker = null,
        actor = null,
        token = null,
        character = null,
        {
            skipDialog = false,
            noChat = false,
            type = `${this.type}-${this.name}-bleed-stop-test`,
            title = `${this.item.label} Bleeding Stoppage Test`,
            // biome-ignore lint/correctness/noUnusedVariables: <explanation>
            ...scope
        },
    ) {
        ({ speaker, actor, token, character } =
            sohl.SohlMacro.getExecuteDefaults({
                speaker,
                actor,
                token,
                character,
            }));

        // TODO - Missile Automated Attack
        ui.notifications.warn("Missile Automated Attack Not Implemented");
    }

    missileAttackTest(
        speaker = null,
        actor = null,
        token = null,
        character = null,
        {
            skipDialog = false,
            noChat = false,
            type = `${this.type}-${this.name}-direct-missile-attack`,
            title = `${this.item.label} Direct Missile Attack`,
            // biome-ignore lint/correctness/noUnusedVariables: <explanation>
            ...scope
        },
    ) {
        ({ speaker, actor, token, character } =
            sohl.SohlMacro.getExecuteDefaults({
                speaker,
                actor,
                token,
                character,
            }));

        // TODO - Missile Direct Attack
        ui.notifications.warn("Missile Direct Attack Not Implemented");
    }
}

class IsleCombatTechniqueStrikeModeItemData extends IsleStrikeModeItemDataMixin(
    sohl.CombatTechniqueStrikeModeItemData,
) {
    static get effectKeys() {
        return sohl.Utility.simpleMerge(super.effectKeys, {});
    }

    get intrinsicActions() {
        let actions = super.intrinsicActions
            .filter((a) => a.name !== "attack")
            .map((a) => {
                if (
                    a.contextGroup === sohl.SohlContextMenu.sortGroups.Default
                ) {
                    a.contextGroup = sohl.SohlContextMenu.sortGroups.Primary;
                }
                return a;
            });

        actions.push({
            functionName: "assistedAttack",
            name: "Automated Attack",
            contextIconClass: "fas fa-hand-fist fa-rotate-90",
            contextCondition: (header) => {
                header = header instanceof HTMLElement ? header : header[0];
                const li = header.closest(".item");
                const item = fromUuidSync(li.dataset.uuid);
                return item && !item.system.$attack.disabled;
            },
            contextGroup: sohl.SohlContextMenu.sortGroups.Default,
        });

        actions.sort((a, b) => a.contextGroup.localeCompare(b.contextGroup));
        return actions;
    }

    async automatedAttack(
        speaker = null,
        actor = null,
        token = null,
        character = null,
        {
            skipDialog = false,
            noChat = false,
            type = `${this.type}-${this.name}-bleed-stop-test`,
            title = `${this.item.label} Bleeding Stoppage Test`,
            // biome-ignore lint/correctness/noUnusedVariables: <explanation>
            ...scope
        },
    ) {
        ({ speaker, actor, token, character } =
            sohl.SohlMacro.getExecuteDefaults({
                speaker,
                actor,
                token,
                character,
            }));

        // TODO - Combat Technique Automated Attack
        ui.notifications.warn(
            "Combat Technique Automated Attack Not Implemented",
        );
    }
}

/*===============================================================*/
/*      Legendary Data Model Classes                                   */
/*===============================================================*/

class IsleSkillItemData extends sohl.SkillItemData {
    postProcess() {
        super.postProcess();
        if (["physical", "combat"].includes(this.subType)) {
            if (this.actor.system.$physPenalty.effective) {
                this.$masteryLevel.add(
                    "Physical Penalty",
                    "PP",
                    this.actor.system.$physPenalty.effective,
                );
            }
        } else if (this.actor.system.$univPenalty.effective) {
            this.$masteryLevel.add(
                "Universal Penalty",
                "UP",
                this.actor.system.$univPenalty.effective,
            );
        }
    }
}

class IsleInjuryItemData extends sohl.InjuryItemData {
    processSiblings() {
        super.processSiblings();
        this.actor.system.$totalInjuryLevels.add(
            this.name,
            "Inj",
            this.$injuryLevel.effective,
        );
        this.actor.system.$univPenalty.add(
            `${this.name} Injury`,
            "Inj",
            -this.$injuryLevel.effective,
        );
    }
}

class IsleAfflictionItemData extends sohl.AfflictionItemData {
    processSiblings() {
        super.processSiblings();
        this.actor.system.$totalFatigue.add(
            this.name,
            "Fatg",
            this.$level.effective,
        );
        this.actor.system.$univPenalty.add(
            `${this.name} Fatigue`,
            "Fatg",
            -this.$level.effective,
        );
    }
}

class IsleAnatomyItemData extends sohl.AnatomyItemData {
    $aim;
    $aimTotal;

    prepareBaseData() {
        this.$aim = { low: {}, mid: {}, high: {} };
        this.$aimTotal = {
            low: 0,
            mid: 0,
            high: 0,
        };
    }
}
class IsleBodyLocationItemData extends sohl.BodyLocationItemData {
    get probWeight() {
        const high =
            this.item.getFlag("sohl", "mistyisle.probWeight.high") || 0;
        const mid = this.item.getFlag("sohl", "mistyisle.probWeight.mid") || 0;
        const low = this.item.getFlag("sohl", "mistyisle.probWeight.low") || 0;
        return { high, mid, low };
    }

    get isFumble() {
        return !!this.item.getFlag("sohl", "mistyisle.isFumble");
    }

    get isStumble() {
        return !!this.item.getFlag("sohl", "mistyisle.isStumble");
    }

    prepareBaseData() {
        super.prepareBaseData();
        this.$protection = foundry.utils.mergeObject(
            this.$protection,
            {
                blunt: new sohl.ValueModifier(this),
                edged: new sohl.ValueModifier(this),
                piercing: new sohl.ValueModifier(this),
                fire: new sohl.ValueModifier(this),
            },
            { inplace: true },
        );
    }

    processSiblings() {
        super.processSiblings();
        const probWeight = this.probWeight;
        const bodyPart = this.item.nestedIn;
        if (bodyPart.system instanceof sohl.BodyPartItemData) {
            const bodyZone = bodyPart.nestedIn;
            if (bodyZone.system instanceof sohl.BodyZoneItemData) {
                const anatomy = bodyZone.nestedIn;
                if (anatomy.system instanceof sohl.AnatomyItemData) {
                    anatomy.system.$aim["high"][this.name] = probWeight.high;
                    anatomy.system.$aimTotal["high"] += probWeight.high;
                    anatomy.system.$aim["mid"][this.name] = probWeight.mid;
                    anatomy.system.$aimTotal["mid"] += probWeight.mid;
                    anatomy.system.$aim["low"][this.name] = probWeight.low;
                    anatomy.system.$aimTotal["low"] += probWeight.low;
                }
            }
        }
    }
}

export class IsleTour extends Tour {
    actor;
    item;

    async _preStep() {
        await super._preStep();
        const currentStep = this.currentStep;

        if (currentStep.actor) {
            this.actor = await CONFIG.Actor.documentClass.create(
                currentStep.actor,
            );
            await this.actor.sheet?._render(true);
        }

        if (currentStep.itemName) {
            if (!this.actor) {
                console.warn("No actor found for step " + currentStep.title);
            }
            this.item = this.actor?.items.getName(currentStep.itemName);
            const app = this.item.sheet;
            if (!app.rendered) {
                await app._render(true);
            }
            currentStep.selector = currentStep.selector?.replace(
                "itemSheetID",
                app.id,
            );
        }

        if (currentStep.tab) {
            switch (currentStep.tab.parent) {
                case ISLE.CONST.TOUR_TAB_PARENTS.ACTOR: {
                    if (!this.actor) {
                        console.warn("No Actor Found");
                        break;
                    }
                    const app = this.actor.sheet;
                    app?.activateTab(currentStep.tab.id);
                    break;
                }

                case ISLE.CONST.TOUR_TAB_PARENTS.ITEM: {
                    if (!this.item) {
                        console.warn("No Item Found");
                        break;
                    }
                    const app = this.item.sheet;
                    app?.activateTab(currentStep.tab.id);
                    break;
                }
            }
        }
        currentStep.selector = currentStep.selector?.replace(
            "actorSheetID",
            this.actor?.sheet?.id,
        );
    }
}

export class IsleCommands extends sohl.Commands {
    static async importActors(jsonFilename, folderName) {
        const response = await fetch(jsonFilename);
        const content = await response.json();

        let actorFolder = game.folders.find(
            (f) => f.name === folderName && f.type === "Actor",
        );
        if (actorFolder) {
            const msg = `Folder ${folderName} exists, delete it before proceeding`;
            console.error(msg);
            return;
        }

        actorFolder = await Folder.create({ type: "Actor", name: folderName });

        await sohl.Utility.asyncForEach(content.Actor, async (f) => {
            console.log("Processing Animate Entity ${f.name}");
            const actor = await sohl.SohlActor.create({ name: f.name });
            const updateData = [];
            const itemData = [];
            // Fill in attribute values
            Object.keys(f.system.attributes).forEach((attr) => {
                const attrItem = actor.items.find(
                    (it) =>
                        it.system instanceof sohl.TraitItemData &&
                        it.name.toLowerCase() === attr,
                );
                if (attrItem)
                    itemData.push({
                        _id: attrItem.id,
                        "system.textValue": f.system.attributes[attr].base,
                    });
            });

            updateData.push({
                "system.description": f.system.description,
                "system.bioImage": f.system.bioImage,
                "system.biography": f.system.biography,
                "prototypeToken.actorLink": f.prototypeToken.actorLink,
                "prototypeToken.name": f.prototypeToken.name,
                "prototypeToken.texture.src": f.prototypeToken.texture.src,
                folder: actorFolder.id,
                items: itemData,
            });

            await actor.update(updateData);
        });
    }
}
sohl.SOHL.cmds = IsleCommands;

const IsleActorDataModels = foundry.utils.mergeObject(
    sohl.SohlActorDataModels,
    {
        [sohl.AnimateEntityActorData.typeName]: IsleAnimateEntityActorData,
    },
    { inplace: false },
);

const IsleItemDataModels = foundry.utils.mergeObject(
    sohl.SohlItemDataModels,
    {
        [sohl.ProtectionItemData.typeName]: IsleProtectionItemData,
        [sohl.AnatomyItemData.typeName]: IsleAnatomyItemData,
        [sohl.BodyLocationItemData.typeName]: IsleBodyLocationItemData,
        [sohl.InjuryItemData.typeName]: IsleInjuryItemData,
        [sohl.AfflictionItemData.typeName]: IsleAfflictionItemData,
        [sohl.SkillItemData.typeName]: IsleSkillItemData,
        [sohl.MeleeWeaponStrikeModeItemData.typeName]:
            IsleMeleeWeaponStrikeModeItemData,
        [sohl.MissileWeaponStrikeModeItemData.typeName]:
            IsleMissileWeaponStrikeModeItemData,
        [sohl.CombatTechniqueStrikeModeItemData.typeName]:
            IsleCombatTechniqueStrikeModeItemData,
    },
    { inplace: false },
);

export const verData = {
    id: "mistyisle",
    label: "Song of Heroic Lands: Misty Island",
    CONFIG: {
        Helper: {
            modifiers: sohl.SohlModifiers,
            contextMenu: sohl.SohlContextMenu,
        },
        Actor: {
            documentClass: sohl.SohlActor,
            documentSheets: [
                {
                    cls: sohl.SohlActorSheet,
                    types: Object.keys(IsleActorDataModels),
                },
            ],
            dataModels: IsleActorDataModels,
            typeLabels: sohl.SohlActorTypeLabels,
            typeIcons: sohl.SohlActorTypeIcons,
            types: Object.keys(IsleActorDataModels),
            defaultType: sohl.AnimateEntityActorData.typeName,
            compendiums: ["sohl.leg-characters", "sohl.leg-creatures"],
        },
        Item: {
            documentClass: sohl.SohlItem,
            documentSheets: [
                {
                    cls: sohl.SohlItemSheet,
                    types: Object.keys(IsleItemDataModels).filter(
                        (t) => t !== sohl.ContainerGearItemData.typeName,
                    ),
                },
                {
                    cls: sohl.SohlContainerGearItemSheet,
                    types: [sohl.ContainerGearItemData.typeName],
                },
            ],
            dataModels: IsleItemDataModels,
            typeLabels: sohl.SohlItemTypeLabels,
            typeIcons: sohl.SohlItemTypeIcons,
            types: Object.keys(IsleItemDataModels),
            compendiums: [
                "sohl.leg-characteristics",
                "sohl.leg-possessions",
                "sohl.leg-mysteries",
            ],
        },
        ActiveEffect: {
            documentClass: sohl.SohlActiveEffect,
            dataModels: {
                [sohl.SohlActiveEffectData.typeName]: sohl.SohlActiveEffectData,
            },
            typeLabels: {
                [sohl.SohlActiveEffectData.typeName]:
                    sohl.SohlActiveEffectData.typeLabel.singular,
            },
            typeIcons: { [sohl.SohlActiveEffectData.typeName]: "fas fa-gears" },
            types: [sohl.SohlActiveEffectData.typeName],
            legacyTransferral: false,
        },
        Combatant: {
            documentClass: sohl.SohlCombatant,
        },
        Macro: {
            documentClass: sohl.SohlMacro,
            documentSheet: sohl.SohlMacroConfig,
        },
    },
    CONST: foundry.utils.mergeObject(sohl.SOHL.CONST, ISLE.CONST, {
        inplace: false,
    }),
};
