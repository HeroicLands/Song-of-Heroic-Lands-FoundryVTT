/* eslint-disable no-unused-vars */
import * as sohl from "./sohl-common.js";

/* ====================================================================== */
/*          Constants                                                     */
/* ====================================================================== */

const fields = foundry.data.fields;

const ISLE = {
    CONST: {
        // Legendary init message with ASCII Artwork (Doom font)
        initVersionMessage: `|_   _|  | |               | |
  | | ___| | __ _ _ __   __| |
  | |/ __| |/ _\` | '_ \\ / _\` |
 _| |\\__ \\ | (_| | | | | (_| |
 \\___/___/_|\\__,_|_| |_|\\__,_|
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
    $healingBase;
    $totalInjuryLevels;
    $totalFatigue;
    $univPenalty;
    $physPenalty;
    $encumbrance;

    get univPenalty() {
        return (
            (this.$totalInjuryLevels.effective || 0) +
            (this.$totalFatigue.effective || 0)
        );
    }

    get physPenalty() {
        return this.univPenalty + this.encumbrance;
    }

    get encumbrance() {
        const end = this.actor.getTraitByAbbrev("end");
        return Math.floor(
            end?.system.$score.effective
                ? this.$gearWeight.effective / end.system.$score.effective
                : 0,
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
        this.$healingBase = new sohl.ValueModifier(this);
        this.$encumbrance = new sohl.ValueModifier(this, {
            total: (thisVM) => {
                const encDiv = game.settings.get(
                    "sohl",
                    ISLE.CONST.VERSETTINGS.encIncr.key,
                );
                let result = Math.round(
                    Math.floor((thisVM.effective + Number.EPSILON) * encDiv) /
                        encDiv,
                );
                return result;
            },
        });
        this.$encumbrance.floor("Min Zero", "Min0", 0);
    }
}

function IsleStrikeModeItemDataMixin(BaseMLID) {
    return class IsleStrikeModeItemData extends BaseMLID {
        $reach;
        $heft;

        get heftBase() {
            return this.item.getFlag("sohl", "legendary.heftBase") || 0;
        }

        get zoneDie() {
            return this.item.getFlag("sohl", "legendary.zoneDie") || 0;
        }

        static get effectKeys() {
            return sohl.Utility.simpleMerge(super.effectKeys, {
                "mod:system.$impact.armorReduction": {
                    label: "Armor Reduction",
                    abbrev: "AR",
                },
                "system.$defense.block.successLevelMod": {
                    label: "Block Success Level",
                    abbrev: "BlkSL",
                },
                "system.$defense.counterstrike.successLevelMod": {
                    label: "Counterstrike Success Level",
                    abbrev: "CXSL",
                },
                "system.$traits.opponentDef": {
                    label: "Opponent Defense",
                    abbrev: "OppDef",
                },
                "system.$traits.entangle": {
                    label: "Entangle",
                    abbrev: "Entangle",
                },
                "system.$traits.envelop": {
                    label: "Envelop",
                    abbrev: "Envlp",
                },
                "system.$traits.lowAim": {
                    label: "High Strike",
                    abbrev: "HiStrike",
                },
                "system.$traits.impactTA": {
                    label: "Impact Tac Adv",
                    abbrev: "ImpTA",
                },
                "system.$traits.notInClose": {
                    label: "Not In Close",
                    abbrev: "NotInCls",
                },
                "system.$traits.onlyInClose": {
                    label: "Only In Close",
                    abbrev: "OnlyInCls",
                },
                "system.$traits.lowStrike": {
                    label: "Low Strike",
                    abbrev: "LoStrike",
                },
                "system.$traits.deflectTN": {
                    label: "Deflect TN",
                    abbrev: "DeflTN",
                },
                "system.$traits.shieldMod": {
                    label: "Shield Mod",
                    abbrev: "ShldMod",
                },
                "system.$traits.extraBleedRisk": {
                    label: "Extra Bleed Risk",
                    abbrev: "XBldRsk",
                },
                "system.$traits.noStrMod": {
                    label: "No STR Mod",
                    abbrev: "NoStrMod",
                },
                "system.$traits.halfImpact": {
                    label: "Half Impact",
                    abbrev: "HlfImp",
                },
            });
        }

        prepareBaseData() {
            super.prepareBaseData();
            this.$reach = new sohl.ValueModifier(this);
            this.$heft = new sohl.ValueModifier(this);
            foundry.utils.mergeObject(this.$traits, {
                armorReduction: 0,
                blockSLMod: 0,
                cxSLMod: 0,
                opponentDef: 0,
                entangle: false,
                envelop: false,
                lowAim: false,
                impactTA: 0,
                notInClose: false,
                onlyInClose: false,
                deflectTN: 0,
                shieldMod: 0,
                extraBleedRisk: false,
                noStrMod: false,
                halfImpact: false,
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
            if (this.$traits.blockSLMod)
                this.$defense.block.successLevelMod.add(
                    "SL Modifier",
                    "SLMod",
                    this.$traits.blockSLMod,
                );

            if (this.$traits.cxSLMod)
                this.$defense.counterstrike.successLevelMod.add(
                    "SL Modifier",
                    "SLMod",
                    this.$traits.cxSLMod,
                );

            const weapon = this.item.nestedIn;
            const strength = this.actor.getTraitByAbbrev("str");

            if (weapon?.system instanceof sohl.WeaponGearItemData) {
                this.$heft.addVM(weapon.system.$heft, {
                    includeBase: true,
                });
                this.$length.addVM(weapon.system.$length, {
                    includeBase: true,
                });

                // If held in a non-favored part, attack/block/CX are at -5
                if (!weapon.system.$heldByFavoredPart) {
                    this.$heft.add("Held by non-favored limb", "NonFavLimb", 5);
                }

                // If held in two hands (for a weapon that only requires one hand)
                // reduce the HFT by 5
                if (weapon.system.$heldBy.length > this.minParts) {
                    this.$heft.add("Multi-Limb Bonus", "MultLimb", -5);

                    if (strength) {
                        // If swung and STR is greater than base unmodified heft, impact
                        // increases by 1
                        if (
                            this.$traits.swung &&
                            strength.system.$score?.base >= this.heftBase
                        ) {
                            this.$impact.add(
                                "Swung Strength Bonus",
                                "SwgStr",
                                1,
                            );
                        }
                    }
                }
            } else {
                this.$length.setBase(this.lengthBase);
                this.$heft.setBase(this.heftBase);
            }

            if (strength) {
                const strValue = strength.system.$score?.effective || 0;

                const heftPenalty =
                    Math.max(0, this.$heft.effective - strValue) * -5;

                if (heftPenalty) {
                    this.$attack.add(
                        "Heft Strength Penalty",
                        "HeftStr",
                        heftPenalty,
                    );
                    this.$defense.block.add(
                        "Heft Strength Penalty",
                        "HeftStr",
                        heftPenalty,
                    );
                    this.$defense.counterstrike.add(
                        "Heft Strength Penalty",
                        "HeftStr",
                        heftPenalty,
                    );
                }
            }

            this.$reach.floor("Min Reach", "Min", 0);
            this.$reach.addVM(this.$length, {
                includeBase: true,
            });

            const size = this.actor.getTraitByAbbrev("siz");
            if (size) {
                const sizeReachMod = size.system.$params?.reachMod || 0;
                this.$reach.add("Size Modifier", "Siz", sizeReachMod);
            }
        }
    };
}

class IsleMeleeWeaponStrikeModeItemData extends IsleStrikeModeItemDataMixin(
    sohl.MeleeWeaponStrikeModeItemData,
) {
    static get effectKeys() {
        return sohl.Utility.simpleMerge(super.effectKeys, {
            "mod:system.$heft": { label: "Heft", abbrev: "Hft" },
            "system.$traits.couched": { label: "Couched", abbrev: "Couched" },
            "system.$traits.slow": { label: "Slow", abbrev: "Slow" },
            "system.$traits.thrust": { label: "Thrust", abbrev: "Thst" },
            "system.$traits.swung": { label: "Swung", abbrev: "Swng" },
            "system.$traits.halfSword": {
                label: "Half Sword",
                abbrev: "HlfSwd",
            },
            "system.$traits.twoPartLen": {
                label: "2H Length",
                abbrev: "2HLen",
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
            couched: false,
            noAttack: false,
            noBlock: false,
            slow: false,
            thrust: false,
            swung: false,
            halfSword: false,
            twoPartLen: 0,
        });
    }

    processSiblings() {
        super.processSiblings();

        const strength = this.actor.getTraitByAbbrev("str");
        if (strength) {
            const strValue = strength.system.$score?.effective || 0;
            const strImpactMod = IsleUtility.strImpactMod(strValue);
            if (strImpactMod && !this.$traits.noStrMod) {
                this.$impact.add(
                    "Strength Impact Modifier",
                    "StrImpMod",
                    strImpactMod,
                );
            }
        }

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
    $baseRange;
    $draw;
    $canDraw;
    $pull;

    get maxVolleyMult() {
        return this.item.getFlag("sohl", "legendary.maxVolleyMult") || 0;
    }

    get baseRangeBase() {
        return this.item.getFlag("sohl", "legendary.baseRangeBase") || 0;
    }

    get drawBase() {
        return this.item.getFlag("sohl", "legendary.drawBase") || 0;
    }

    get zoneDie() {
        return (
            this.item.nestedIn?.getFlag("sohl", "legendary.zoneDie") ||
            this.item.getFlag("sohl", "legendary.zoneDie") ||
            0
        );
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
                functionName: "directAttackTest",
                name: "Direct Attack Test",
                contextIconClass: "fas fa-location-arrow-up fa-rotate-90",
                contextCondition: (header) => {
                    header = header instanceof HTMLElement ? header : header[0];
                    const li = header.closest(".item");
                    const item = fromUuidSync(li.dataset.uuid);
                    return item && !item.system.$attack.disabled;
                },
                contextGroup: sohl.SohlContextMenu.sortGroups.Primary,
            },
            {
                functionName: "volleyAttackTest",
                name: "Volley Attack Test",
                contextIconClass: "fas fa-location-arrow",
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

    volleyAttack(
        speaker = null,
        actor = null,
        token = null,
        character = null,
        {
            skipDialog = false,
            noChat = false,
            type = `${this.type}-${this.name}-volley-attack`,
            title = `${this.item.label} Volley Attack`,
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

        // TODO - Missile Volley Attack
        ui.notifications.warn("Missile Volley Attack Not Implemented");
    }

    directAttack(
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

    /** @override */
    prepareBaseData() {
        super.prepareBaseData();
        foundry.utils.mergeObject(this.$traits, {
            armorReduction: 0,
            bleed: false,
        });
        this.$maxVolleyMult = new sohl.ValueModifier(this).setBase(
            this.maxVolleyMult,
        );
        this.$baseRange = new sohl.ValueModifier(this).setBase(
            this.baseRangeBase,
        );
        this.$draw = new sohl.ValueModifier(this).setBase(this.drawBase);
        this.$pull = new sohl.ValueModifier(this);
    }

    postProcess() {
        super.postProcess();
        const strength = this.actor.getTraitByAbbrev("str");
        if (strength) {
            const strML = strength.system.$masteryLevel?.effective || 0;
            this.$pull.add("Strength ML", "StrML", strML);
        }
        if (this.$assocSkill) {
            this.$pull.add(
                `${this.$assocSkill.name}`,
                "AssocSkill",
                this.$assocSkill.system.$masteryLevel.effective,
            );
        }

        this.$canDraw =
            !this.$pull.disabled &&
            this.$pull.effective >= this.$draw.effective;
        this.$attack.disabled ||= !this.$canDraw;
    }
}

class IsleCombatTechniqueStrikeModeItemData extends IsleStrikeModeItemDataMixin(
    sohl.CombatTechniqueStrikeModeItemData,
) {
    static get effectKeys() {
        return sohl.Utility.simpleMerge(super.effectKeys, {
            "system.$traits.strRoll": {
                label: "Strength Roll",
                abbrev: "StrRoll",
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

    /** @override */
    prepareBaseData() {
        super.prepareBaseData();
        foundry.utils.mergeObject(this.$traits, {
            strRoll: false,
        });
    }

    processSiblings() {
        super.processSiblings();
        const strength = this.actor.getTraitByAbbrev("str");
        if (strength) {
            const strValue = strength.system.$score?.effective || 0;
            const strImpactMod = IsleUtility.strImpactMod(strValue);
            if (strImpactMod && !this.$traits.noStrMod) {
                this.$impact.add(
                    "Strength Impact Modifier",
                    "StrImpMod",
                    strImpactMod,
                );
            }
        }
    }
}

/*===============================================================*/
/*      Legendary Data Model Classes                                   */
/*===============================================================*/

function IsleMasteryLevelItemDataMixin(BaseMLID) {
    return class IsleMasteryLevelItemData extends BaseMLID {
        get isFateAllowed() {
            return (
                super.isFateAllowed &&
                !this.actor.system.$hasAuralShock &&
                !this.skillBaseFormula?.includes("@aur")
            );
        }

        /** @override */
        applyPenalties() {
            // Apply Encumbrance Penalty to Mastery Level
            const sbAttrs = this.skillBase.attributes;
            if (sbAttrs.at(0) === "Agility") {
                const enc = this.actor.system.$encumbrance.total;
                if (enc) this.$masteryLevel.add("Encumbrance", "Enc", -enc);
            }
        }
    };
}

class IsleDomainItemData extends sohl.DomainItemData {}

class IsleInjuryItemData extends sohl.InjuryItemData {
    $injuryDef;

    static get aspectTypes() {
        return {
            blunt: "Blunt",
            edged: "Edged",
            piercing: "Piercing",
            fire: "Fire",
            frost: "Frost",
            projectile: "Projectile",
        };
    }

    prepareBaseData() {
        super.prepareBaseData();
        this.$injury = new sohl.ValueModifier(this, {
            severity: (thisVM) => {
                const injuryTable = this.$bodyLocation?.injuryTable;
                let result = "NA";
                if (injuryTable?.length) {
                    let injuryIndex;
                    if (thisVM.effective <= 0) {
                        injuryIndex = 0;
                    } else if (thisVM.effective < 5) {
                        injuryIndex = 1;
                    } else if (thisVM.effective < 9) {
                        injuryIndex = 2;
                    } else if (thisVM.effective < 13) {
                        injuryIndex = 3;
                    } else if (thisVM.effective < 17) {
                        injuryIndex = 4;
                    } else {
                        injuryIndex = 5;
                    }

                    result = injuryTable.at(injuryIndex)?.sev || "NA";
                }

                return result;
            },
            level: (thisVM) => {
                const injuryTable = this.$bodyLocation?.injuryTable;
                let result = 0;
                if (injuryTable?.length) {
                    let injuryIndex;
                    if (thisVM.effective <= 0) {
                        injuryIndex = 0;
                    } else if (thisVM.effective < 5) {
                        injuryIndex = 1;
                    } else if (thisVM.effective < 9) {
                        injuryIndex = 2;
                    } else if (thisVM.effective < 13) {
                        injuryIndex = 3;
                    } else if (thisVM.effective < 17) {
                        injuryIndex = 4;
                    } else {
                        injuryIndex = 5;
                    }

                    result = injuryTable.at(injuryIndex)?.level || 0;
                }

                return result;
            },
        });
    }
}

class IsleMysticalAbilityItemData extends IsleMasteryLevelItemDataMixin(
    sohl.MysticalAbilityItemData,
) {}

class IsleTraitItemData extends sohl.TraitItemData {
    get actionBodyParts() {
        return this.item.getFlag("sohl", "legendary.actionBodyParts") || [];
    }

    get diceFormula() {
        return this.item.getFlag("sohl", "legendary.diceFormula");
    }

    prepareBaseData() {
        super.prepareBaseData();
        if (this.abbrev === "fate") {
            this.$masteryLevel.setBase(this.$score.base);
        }
    }

    processSiblings() {
        super.processSiblings();
        if (this.isNumeric) {
            this.actionBodyParts.forEach((bp) => {
                const bodyPart = sohl.IterWrap.create(
                    this.actor.allItems(),
                ).find(
                    (it) =>
                        it.system instanceof sohl.BodyPartItemData &&
                        it.name === bp,
                );
                if (bodyPart) {
                    if (bodyPart.system.$impairment.unusable) {
                        this.$masteryLevel.set(
                            `${this.item.name} Unusable`,
                            `${this.abbrev}Unusable`,
                            0,
                        );
                    } else if (bodyPart.system.$impairment.value) {
                        this.$masteryLevel.add(
                            `${this.item.name} Impairment`,
                            `${this.abbrev}Imp`,
                            bodyPart.system.$impairment.value,
                        );
                    }
                }
            });
        }

        if (this.intensity === "attribute" && this.subType === "physique") {
            sohl.IterWrap.create(this.actor.allItems()).forEach((it) => {
                if (
                    it.system instanceof sohl.AfflictionItemData &&
                    it.system.subType === "fatigue"
                ) {
                    this.$masteryLevel.add(
                        it.name,
                        it.system.constructor.subTypeAbbreviation[
                            it.system.subType
                        ],
                        -it.system.$level.effective,
                    );
                }
            });
        }

        if (this.abbrev === "fate") {
            const aura = this.actor.getTraitByAbbrev("aur");
            if (aura) {
                this.$masteryLevel.add(
                    "Aura Secondary Modifier",
                    "AuraSM",
                    aura.system.$masteryLevel.secMod,
                );
            }
        }
    }
}

class IsleSkillItemData extends IsleMasteryLevelItemDataMixin(
    sohl.SkillItemData,
) {
    get actionBodyParts() {
        return this.item.getFlag("sohl", "legendary.actionBodyParts") || [];
    }

    get initSM() {
        return this.item.getFlag("sohl", "legendary.initSM") || 0;
    }

    static get sunsignTypes() {
        return {
            social: "water",
            nature: "earth",
            craft: "metal",
            lore: "aura",
            language: "aura",
            script: "aura",
            ritual: "aura",
            physical: "air",
            combat: "fire",
            esoteric: null,
        };
    }

    processSiblings() {
        super.processSiblings();
        this.actionBodyParts.forEach((bp) => {
            const bodyPart = sohl.IterWrap.create(this.actor.allItems()).find(
                (it) =>
                    it.system instanceof sohl.BodyPartItemData &&
                    it.name === bp,
            );
            if (bodyPart) {
                if (bodyPart.system.$impairment.unusable) {
                    this.$masteryLevel.set(
                        `${this.item.name} Unusable`,
                        `${this.abbrev}Unusable`,
                        0,
                    );
                } else if (bodyPart.system.$impairment.value) {
                    this.$masteryLevel.add(
                        `${this.item.name} Impairment`,
                        `${this.abbrev}Imp`,
                        bodyPart.system.$impairment.value,
                    );
                }
            }
        });

        if (["craft", "combat", "physical"].includes(this.subType)) {
            sohl.IterWrap.create(this.actor.allItems()).forEach((it) => {
                if (
                    it.system instanceof sohl.AfflictionItemData &&
                    it.system.subType === "fatigue"
                ) {
                    this.$masteryLevel.add(
                        it.name,
                        it.system.constructor.subTypeAbbreviation[
                            it.system.subType
                        ],
                        -it.system.$level.effective,
                    );
                }
            });
        }
    }
}

class IsleAfflictionItemData extends sohl.AfflictionItemData {
    /** @override */
    setupVirtualItems() {
        super.setupVirtualItems();
        if (["privation", "infection"].includes(this.subType)) {
            let weakness = 0;
            if (this.$healingRate.effective <= 2) {
                weakness = 10;
            } else if (this.$healingRate.effective <= 4) {
                weakness = 5;
            }
            if (weakness) {
                this.item.constructor.create(
                    {
                        name: `${this.item.name} Fatigue`,
                        type: sohl.AfflictionItemData.typeName,
                        "system.subType": "weakness",
                        "system.fatigueBase": weakness,
                    },
                    { cause: this.item, parent: this.actor },
                );
            }
        }
    }
}

class IsleBodyZoneItemData extends sohl.BodyZoneItemData {
    // List of possible dice for Zone Dice.
    static get dice() {
        return {
            0: "None",
            1: "d1",
            2: "d2",
            3: "d3",
            4: "d4",
            5: "d5",
            6: "d6",
            8: "d8",
            10: "d10",
            12: "d12",
            16: "d16",
            20: "d20",
            24: "d24",
            32: "d32",
            40: "d40",
            48: "d48",
        };
    }

    get zoneNumbers() {
        return this.item.getFlag("sohl", "legendary.zones") || [];
    }

    set zoneNumbers(zones) {
        let result = [];
        if (Array.isArray(zones)) {
            result = zones;
        } else if (typeof zones === "string") {
            result = zones.split(/.*,.*/).reduce((ary, zone) => {
                const num = Number.parseInt(zone, 10);
                if (!Number.isNaN(num) && !ary.includes(num)) ary.push(num);
            }, result);
        } else {
            throw new Error(`Invalid zones '${zones}'`);
        }
        result.sort((a, b) => a - b);
        this.item.setFlag("sohl", "legendary.zones", result);
    }

    get zoneNumbersLabel() {
        return this.zoneNumbers.join(",");
    }

    get affectsMobility() {
        return !!this.item.getFlag("sohl", "legendary.affectsMobility");
    }

    get affectedSkills() {
        return this.item.getFlag("sohl", "legendary.affectedSkills") || [];
    }

    get affectedAttributes() {
        return this.item.getFlag("sohl", "legendary.affectedAttributes") || [];
    }

    static get maxZoneDie() {
        return Object.values(this.dice).at(-1);
    }

    /** @override */
    processSiblings() {
        super.processSiblings();
        this.actor.maxZones = Math.max(
            this.actor.system.maxZones,
            ...this.zoneNumbers,
        );
    }
}

class IsleBodyPartItemData extends sohl.BodyPartItemData {
    /**
     * Represents body part impairment based on injuries.
     * If body part is injured, impairment will be less than
     * zero.  Values greater than zero are treated as zero
     * impairment.
     *
     * @type {ValueModifier}
     */
    $impairment;

    /** @override */
    prepareBaseData() {
        super.prepareBaseData();
        this.$impairment = new sohl.ValueModifier(this, {
            unusable: false,
            value: (thisVM) => {
                Math.min(thisVM.effective, 0);
            },
        });
    }

    /** @override */
    processSiblings() {
        super.processSiblings();
        this.actor.system.$health.max += this.$health.effective;

        // Add this body part's health to overall actor health.
        // If this body part is unusable, or impairment is < -10,
        // then none of the body part health is added to the
        // actor health.
        if (!this.$impairment.unusable) {
            if (!this.$impairment.value) {
                // If no impairment, then add full body part health
                this.actor.system.$health.add(
                    `${this.item.name} Impairment`,
                    "Impair",
                    this.$health.effective,
                );
            } else if (this.$impairment.effective >= -5) {
                // If minor impairment, then add half body part health
                this.actor.system.$health.add(
                    `${this.item.name} Impairment`,
                    "Impair",
                    Math.floor(this.$health.effective / 2),
                );
            } else if (this.$impairment.value >= -10) {
                // If major impairment, then add 1/4 body part health
                this.actor.system.$health.add(
                    `${this.item.name} Impairment`,
                    "Impair",
                    Math.floor(this.$health.effective / 4),
                );
            }
        } else {
            // Body parts marked "unusable" can never hold anything.
            if (this.heldItem?.system instanceof sohl.GearItemData) {
                if (this.heldItem.system.isHeldBy.includes(this.item.id)) {
                    ui.notifications.warn(
                        `${this.item.name} is unusable, so dropping everything being held in the body part`,
                    );
                    this.update({ "system.heldItem": "" });
                }
            }
        }
    }
}

class IsleBodyLocationItemData extends sohl.BodyLocationItemData {
    get injuryTable() {
        return this.item.getFlags("sohl", "island.injuryTable") || {};
    }
}

class IsleArmorGearItemData extends sohl.ArmorGearItemData {
    $encumbrance;

    static get effectKeys() {
        return sohl.Utility.simpleMerge(super.effectKeys, super.effectKeys, {
            "system.$encumbrance": {
                label: "Encumbrance",
                abbrev: "Enc",
            },
        });
    }

    get encumbrance() {
        return this.item.getFlag("sohl", "legendary.encumbrance") || 0;
    }

    /** @override */
    prepareBaseData() {
        super.prepareBaseData();

        this.$encumbrance = new sohl.ValueModifier(this);
        this.$encumbrance.setBase(this.encumbrance);

        // Armor, when equipped, is weightless
        if (this.isEquipped) {
            this.$weight.setBase(0);
        }
    }

    /** @override */
    processSiblings() {
        super.processSiblings();

        if (this.$encumbrance && this.isEquipped) {
            // Armor, when worn, may have an encumbrance effect.  If present, use it.
            this.actor.system.$encumbrance.add(
                `this.item.name Encumbrance`,
                "Enc",
                this.$encumbrance,
            );
        }
    }
}
class IsleWeaponGearItemData extends sohl.WeaponGearItemData {
    $length;
    $heft;

    get lengthBase() {
        return this.item.getFlag("sohl", "legendary.lengthBase") || 0;
    }

    get heftBase() {
        return this.item.getFlag("sohl", "legendary.heftBase") || 0;
    }

    prepareBaseData() {
        super.prepareBaseData();

        this.$length = new sohl.ValueModifier(this);
        this.$length.setBase(this.lengthBase);

        this.$heft = new sohl.ValueModifier(this);
        this.$heft.setBase(this.heftBase);
    }

    setupVirtualItems() {
        super.setupVirtualItems();
        this.items.forEach((it) => {
            if (
                !it.system.transfer &&
                it.system instanceof sohl.MissileWeaponStrikeModeItemData
            ) {
                const missileSM = it;
                if (
                    missileSM.system.projectileType &&
                    missileSM.system.projectileType !== "none"
                ) {
                    this.actor.itemTypes.projectilegear.forEach((proj, idx) => {
                        if (
                            proj.system.quantity > 0 &&
                            proj.system.subType ===
                                missileSM.system.projectileType
                        ) {
                            const itemData = missileSM.toObject();
                            itemData._id = foundry.utils.randomID();
                            itemData.sort += idx;
                            if (proj.system.impactBase.die >= 0) {
                                itemData.system.impactBase.die =
                                    proj.system.impactBase.die;
                            }
                            if (proj.system.impactBase.aspect) {
                                itemData.system.impactBase.aspect =
                                    proj.system.impactBase.aspect;
                            }
                            if (proj.system.impactBase.modifier >= 0) {
                                itemData.system.impactBase.modifier =
                                    proj.system.impactBase.modifier;
                            }
                            itemData.name = proj.name;

                            itemData.effects.push(
                                ...proj.effects.contents.map((e) =>
                                    e.toObject(),
                                ),
                            );
                            const item = new sohl.SohlItem(itemData, {
                                parent: this.item.actor,
                            });
                            item.cause = this.item;
                        }
                    });
                }
            }
        });
    }
}

export class IsleUtility extends sohl.Utility {
    static strImpactMod(str) {
        if (typeof str !== "number") return -10;
        return str > 5
            ? Math.trunc(str / 2) - 5
            : [-10, -10, -8, -6, -4, -3].at(Math.max(str, 0));
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
        [sohl.MysticalAbilityItemData.typeName]: IsleMysticalAbilityItemData,
        [sohl.TraitItemData.typeName]: IsleTraitItemData,
        [sohl.SkillItemData.typeName]: IsleSkillItemData,
        [sohl.InjuryItemData.typeName]: IsleInjuryItemData,
        [sohl.DomainItemData.typeName]: IsleDomainItemData,
        [sohl.AfflictionItemData.typeName]: IsleAfflictionItemData,
        [sohl.BodyZoneItemData.typeName]: IsleBodyZoneItemData,
        [sohl.BodyPartItemData.typeName]: IsleBodyPartItemData,
        [sohl.BodyLocationItemData.typeName]: IsleBodyLocationItemData,
        [sohl.MeleeWeaponStrikeModeItemData.typeName]:
            IsleMeleeWeaponStrikeModeItemData,
        [sohl.MissileWeaponStrikeModeItemData.typeName]:
            IsleMissileWeaponStrikeModeItemData,
        [sohl.CombatTechniqueStrikeModeItemData.typeName]:
            IsleCombatTechniqueStrikeModeItemData,
        [sohl.ArmorGearItemData.typeName]: IsleArmorGearItemData,
        [sohl.WeaponGearItemData.typeName]: IsleWeaponGearItemData,
    },
    { inplace: false },
);

export const verData = {
    id: "island",
    label: "Song of Heroic Lands: Island Edition",
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
        Macro: {
            documentClass: sohl.SohlMacro,
            documentSheet: sohl.SohlMacroConfig,
        },
    },
    CONST: foundry.utils.mergeObject(sohl.SOHL.CONST, ISLE.CONST, {
        inplace: false,
    }),
};
