/* eslint-disable no-unused-vars */
import * as sohl from "./sohl-common.js";

/* ====================================================================== */
/*          Constants                                                     */
/* ====================================================================== */

const fields = foundry.data.fields;

const LGND = {
    CONST: {
        // Legendary init message with ASCII Artwork (Doom font)
        initVersionMessage: ` _                               _
| |                             | |
| |     ___  __ _  ___ _ __   __| | __ _ _ __ _   _
| |    / _ \\/ _\` |/ _ \\ '_ \\ / _\` |/ _\` | '__| | | |
| |___|  __/ (_| |  __/ | | | (_| | (_| | |  | |_| |
\\_____/\\___|\\__, |\\___|_| |_|\\__,_|\\__,_|_|   \\__, |
             __/ |                             __/ |
            |___/                             |___/
===========================================================`,

        VERSETTINGS: {
            encIncr: {
                key: "encIncr",
                data: {
                    name: "Encumbrance tracking increment",
                    hint: "Calculate encumbrance by specified steps",
                    scope: "world",
                    config: true,
                    type: new fields.NumberField({
                        required: true,
                        nullable: false,
                        initial: 5,
                        min: 1,
                    }),
                },
            },
            attrSecModIncr: {
                key: "attrSecModIncr",
                data: {
                    name: "Attribute secondary modifier increment",
                    hint: "Calculate attribute secondary modifier by specified steps",
                    scope: "world",
                    config: true,
                    type: new fields.NumberField({
                        required: true,
                        nullable: false,
                        initial: 5,
                        min: 1,
                    }),
                },
            },
            optionGearDamage: {
                key: "optionGearDamage",
                data: {
                    name: "Gear Damage",
                    hint: "Enable combat rule that allows gear (weapons and armor) to be damaged or destroyed on successful block",
                    scope: "world",
                    config: true,
                    type: new fields.BooleanField({ initial: false }),
                },
            },
            animateActorPacks: {
                key: "animateActorPacks",
                data: {
                    name: "Animate Actor Compendiums",
                    hint: "list of Compendiums containing Animate Actors that will be searched for template actors, comma separated, in order",
                    scope: "world",
                    config: true,
                    type: new fields.StringField({
                        nullable: false,
                        initial: "sohl.leg-characters",
                    }),
                },
            },
        },
    },
};

class LgndImpactModifier extends sohl.ImpactModifier {
    // List of possible dice for impact dice.
    static get dice() {
        return {
            0: "None",
            4: "d4",
            6: "d6",
            8: "d8",
            10: "d10",
            12: "d12",
        };
    }

    static get maxImpactDie() {
        return Object.values(this.dice).at(-1);
    }

    get impactTA() {
        switch (this.aspect) {
            case "blunt":
                return 3;
            case "edged":
                return 5;
            case "piercing":
                return 4;
            case "fire":
                return 2;
            default:
                return 0;
        }
    }

    // biome-ignore lint/correctness/noUnusedVariables: <explanation>
    calcStrikeImpact(numImpactTAs = 0, { impactTA = null } = {}) {
        // TODO - Implement Impact Calculation
        return 0;
    }
}

class LgndMasteryLevelModifier extends sohl.MasteryLevelModifier {
    constructor(parent, initProperties = {}) {
        super(
            parent,
            foundry.utils.mergeObject(
                initProperties,
                {
                    secMod: (thisVM) => {
                        const secModIncr = game.settings.get(
                            "sohl",
                            "attrSecModIncr",
                        );
                        return Math.min(
                            25,
                            Math.max(
                                -25,
                                Math.trunc(
                                    ((thisVM.base ?? 0) / 2 - 25) / secModIncr,
                                ) * secModIncr,
                            ),
                        );
                    },
                },
                { inplace: false, recursive: false },
            ),
        );
    }
}

class LgndAnimateEntityActorData extends sohl.AnimateEntityActorData {
    $combatReach;
    $hasAuralShock;
    $maxZones;
    $healingBase;
    $encumbrance;
    $sunsign;

    get intrinsicActions() {
        let actions = super.intrinsicActions.map((a) => {
            if (a.contextGroup === "default") {
                a.contextGroup = "primary";
            }
            return a;
        });

        actions.push(
            // TODO - Add Lgnd Actor Actions
        );

        actions.sort((a, b) => a.contextGroup.localeCompare(b.contextGroup));
        return actions;
    }

    async damageRoll({
        targetToken,
        impactMod,
        numImpactTAs = 0,
        bodyLocationUuid,
        skipDialog = false,
        ...options
    } = {}) {
        return super.damageRoll({
            targetToken,
            impactMod,
            numImpactTAs,
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
        this.$maxZones = 0;
        this.$combatReach = -99;
        this.$hasAuralShock = false;
        this.$healingBase = new sohl.ValueModifier(this);
        this.$encumbrance = new sohl.ValueModifier(this, {
            total: (thisVM) => {
                const encDiv = game.settings.get(
                    "sohl",
                    LGND.CONST.VERSETTINGS.encIncr.key,
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

function LgndStrikeModeItemDataMixin(BaseMLID) {
    return class LgndStrikeModeItemData extends BaseMLID {
        $reach;
        $heft;

        get heftBase() {
            return this.item.getFlag("sohl", "legendary.heftBase") || 0;
        }

        get zoneDie() {
            return this.item.getFlag("sohl", "legendary.zoneDie") || 0;
        }

        static get tactialAdvantages() {
            return {
                action: "Action",
                impact: "Impact",
                precision: "Precision",
            };
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

class LgndMeleeWeaponStrikeModeItemData extends LgndStrikeModeItemDataMixin(
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

    static get tactialAdvantages() {
        return {
            action: "Action",
            impact: "Impact",
            precision: "Precision",
            setup: "Setup",
        };
    }

    static get combatTable() {
        return {
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
    }

    get intrinsicActions() {
        let actions = super.intrinsicActions
            .filter((a) => a.name !== "attack")
            .map((a) => {
                if (a.contextGroup === "default") {
                    a.contextGroup = "primary";
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
            contextGroup: "default",
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
            const strImpactMod = LgndUtility.strImpactMod(strValue);
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

class LgndMissileWeaponStrikeModeItemData extends LgndStrikeModeItemDataMixin(
    sohl.MissileWeaponStrikeModeItemData,
) {
    $baseRange;
    $draw;
    $canDraw;
    $pull;

    static get tactialAdvantages() {
        return foundry.utils.mergeObject(
            super.tacticalAdvantages,
            {
                setup: "Setup",
            },
            { inplace: false },
        );
    }

    static get ranges() {
        return {
            pb: "PB",
            direct: "Direct",
            v2: "V2",
            v3: "V3",
            v4: "V4",
        };
    }

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

    static get combatTable() {
        return {
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
    }

    get intrinsicActions() {
        let actions = super.intrinsicActions
            .filter((a) => a.name !== "attack")
            .map((a) => {
                if (a.contextGroup === "default") {
                    a.contextGroup = "primary";
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
                contextGroup: "default",
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
                contextGroup: "primary",
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
                contextGroup: "primary",
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

class LgndCombatTechniqueStrikeModeItemData extends LgndStrikeModeItemDataMixin(
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
                if (a.contextGroup === "default") {
                    a.contextGroup = "primary";
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
            contextGroup: "default",
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
            const strImpactMod = LgndUtility.strImpactMod(strValue);
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

function LgndMasteryLevelItemDataMixin(BaseMLID) {
    return class LgndMasteryLevelItemData extends BaseMLID {
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

        prepareBaseData() {
            super.prepareBaseData();
            this.$masteryLevel &&= LgndMasteryLevelModifier.create(
                this.$masteryLevel,
                { parent: this },
            );
        }
    };
}

class LgndDomainItemData extends sohl.DomainItemData {}

class LgndInjuryItemData extends sohl.InjuryItemData {
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

    get treatments() {
        return {
            blunt: {
                M: {
                    treatment: "Compress",
                    mod: {
                        name: "Treatment Bonus",
                        abbrev: "TrtBns",
                        value: 30,
                    },
                    useDexMod: false,
                    cf: {
                        hr: 4,
                        infect: false,
                        impair: false,
                        bleed: false,
                        newInj: -1,
                    },
                    mf: {
                        hr: 5,
                        infect: false,
                        impair: false,
                        bleed: false,
                        newInj: -1,
                    },
                    ms: {
                        hr: 6,
                        infect: false,
                        impair: false,
                        bleed: false,
                        newInj: -1,
                    },
                    cs: {
                        hr: -1,
                        infect: false,
                        impair: false,
                        bleed: false,
                        newInj: -1,
                    },
                },
                S: {
                    treatment: "Set & Splint",
                    mod: {
                        name: "Treatment Bonus",
                        abbrev: "TrtBns",
                        value: 10,
                    },
                    useDexMod: false,
                    cf: {
                        hr: 3,
                        infect: false,
                        impair: true,
                        bleed: false,
                        newInj: -1,
                    },
                    mf: {
                        hr: 4,
                        infect: false,
                        impair: true,
                        bleed: false,
                        newInj: -1,
                    },
                    ms: {
                        hr: 5,
                        infect: false,
                        impair: false,
                        bleed: false,
                        newInj: -1,
                    },
                    cs: {
                        hr: 6,
                        infect: false,
                        impair: false,
                        bleed: false,
                        newInj: -1,
                    },
                },
                G: {
                    treatment: "Clean, Dress & Surgery",
                    mod: null,
                    useDexMod: true,
                    cf: {
                        hr: 2,
                        infect: true,
                        impair: true,
                        bleed: false,
                        newInj: -1,
                    },
                    mf: {
                        hr: 3,
                        infect: false,
                        impair: true,
                        bleed: false,
                        newInj: -1,
                    },
                    ms: {
                        hr: 4,
                        infect: false,
                        impair: true,
                        bleed: false,
                        newInj: -1,
                    },
                    cs: {
                        hr: 5,
                        infect: false,
                        impair: false,
                        bleed: false,
                        newInj: -1,
                    },
                },
            },
            piercing: {
                M: {
                    treatment: "Clean & Dress",
                    mod: {
                        name: "Treatment Bonus",
                        abbrev: "TrtBns",
                        value: 10,
                    },
                    useDexMod: false,
                    cf: {
                        hr: 4,
                        infect: true,
                        impair: false,
                        bleed: false,
                        newInj: -1,
                    },
                    mf: {
                        hr: 5,
                        infect: false,
                        impair: false,
                        bleed: false,
                        newInj: -1,
                    },
                    ms: {
                        hr: 6,
                        infect: false,
                        impair: false,
                        bleed: false,
                        newInj: -1,
                    },
                    cs: {
                        hr: -1,
                        infect: false,
                        impair: false,
                        bleed: false,
                        newInj: -1,
                    },
                },
                S: {
                    treatment: "Clean & Dress",
                    mod: null,
                    useDexMod: false,
                    cf: {
                        hr: 3,
                        infect: true,
                        impair: true,
                        bleed: false,
                        newInj: -1,
                    },
                    mf: {
                        hr: 4,
                        infect: true,
                        impair: false,
                        bleed: false,
                        newInj: -1,
                    },
                    ms: {
                        hr: 5,
                        infect: false,
                        impair: false,
                        bleed: false,
                        newInj: -1,
                    },
                    cs: {
                        hr: 6,
                        infect: false,
                        impair: false,
                        bleed: false,
                        newInj: -1,
                    },
                },
                G: {
                    treatment: "Clean, Dress & Surgery",
                    mod: {
                        name: "Treatment Penalty",
                        abbrev: "TrtBns",
                        value: -10,
                    },
                    useDexMod: true,
                    cf: {
                        hr: 2,
                        infect: true,
                        impair: true,
                        bleed: false,
                        newInj: -1,
                    },
                    mf: {
                        hr: 3,
                        infect: true,
                        impair: true,
                        bleed: false,
                        newInj: -1,
                    },
                    ms: {
                        hr: 4,
                        infect: true,
                        impair: true,
                        bleed: false,
                        newInj: -1,
                    },
                    cs: {
                        hr: 5,
                        infect: false,
                        impair: false,
                        bleed: false,
                        newInj: -1,
                    },
                },
            },
            edged: {
                M: {
                    treatment: "Clean & Dress",
                    mod: {
                        name: "Treatment Bonus",
                        abbrev: "TrtBns",
                        value: 20,
                    },
                    useDexMod: false,
                    cf: {
                        hr: 4,
                        infect: true,
                        impair: false,
                        bleed: false,
                        newInj: -1,
                    },
                    mf: {
                        hr: 5,
                        infect: false,
                        impair: false,
                        bleed: false,
                        newInj: -1,
                    },
                    ms: {
                        hr: 6,
                        infect: false,
                        impair: false,
                        bleed: false,
                        newInj: -1,
                    },
                    cs: {
                        hr: -1,
                        infect: false,
                        impair: false,
                        bleed: false,
                        newInj: -1,
                    },
                },
                S: {
                    treatment: "Clean & Dress",
                    mod: {
                        name: "Treatment Bonus",
                        abbrev: "TrtBns",
                        value: 10,
                    },
                    useDexMod: false,
                    cf: {
                        hr: 3,
                        infect: true,
                        impair: true,
                        bleed: false,
                        newInj: -1,
                    },
                    mf: {
                        hr: 4,
                        infect: true,
                        impair: true,
                        bleed: false,
                        newInj: -1,
                    },
                    ms: {
                        hr: 5,
                        infect: false,
                        impair: true,
                        bleed: false,
                        newInj: -1,
                    },
                    cs: {
                        hr: 6,
                        infect: false,
                        impair: false,
                        bleed: false,
                        newInj: -1,
                    },
                },
                G: {
                    treatment: "Clean, Dress & Surgery",
                    mod: null,
                    useDexMod: true,
                    cf: {
                        hr: 2,
                        infect: true,
                        impair: true,
                        bleed: false,
                        newInj: -1,
                    },
                    mf: {
                        hr: 3,
                        infect: true,
                        impair: true,
                        bleed: false,
                        newInj: -1,
                    },
                    ms: {
                        hr: 4,
                        infect: true,
                        impair: true,
                        bleed: false,
                        newInj: -1,
                    },
                    cs: {
                        hr: 5,
                        infect: false,
                        impair: false,
                        bleed: false,
                        newInj: -1,
                    },
                },
            },
            projectile: {
                M: {
                    treatment: "Clean & Dress",
                    mod: {
                        name: "Treatment Bonus",
                        abbrev: "TrtBns",
                        value: 10,
                    },
                    useDexMod: false,
                    cf: {
                        hr: 4,
                        infect: true,
                        impair: false,
                        bleed: false,
                        newInj: -1,
                    },
                    mf: {
                        hr: 5,
                        infect: false,
                        impair: false,
                        bleed: false,
                    },
                    newInj: -1,
                    ms: {
                        hr: 6,
                        infect: false,
                        impair: false,
                        bleed: false,
                        newInj: -1,
                    },
                    cs: {
                        hr: -1,
                        infect: false,
                        impair: false,
                        bleed: false,
                        newInj: -1,
                    },
                },
                S: {
                    treatment: "Extract Projectile",
                    mod: null,
                    useDexMod: true,
                    cf: { hr: 3, infect: true, impair: true, bleed: false },
                    newInj: -1,
                    mf: {
                        hr: 4,
                        infect: true,
                        impair: true,
                        bleed: false,
                        newInj: -1,
                    },
                    ms: {
                        hr: 5,
                        infect: true,
                        impair: false,
                        bleed: false,
                        newInj: -1,
                    },
                    cs: {
                        hr: 6,
                        infect: false,
                        impair: false,
                        bleed: false,
                        newInj: -1,
                    },
                },
                G: {
                    treatment: "Extract Projectile",
                    mod: {
                        name: "Treatment Penalty",
                        abbrev: "TrtBns",
                        value: -10,
                    },
                    useDexMod: true,
                    cf: {
                        hr: 2,
                        infect: true,
                        impair: true,
                        bleed: false,
                        newInj: -1,
                    },
                    mf: {
                        hr: 3,
                        infect: true,
                        impair: true,
                        bleed: false,
                        newInj: -1,
                    },
                    ms: {
                        hr: 4,
                        infect: true,
                        impair: true,
                        bleed: false,
                        newInj: -1,
                    },
                    cs: {
                        hr: 5,
                        infect: true,
                        impair: false,
                        bleed: false,
                        newInj: -1,
                    },
                },
            },
            fire: {
                M: {
                    treatment: "Compress",
                    mod: {
                        name: "Treatment Bonus",
                        abbrev: "TrtBns",
                        value: 20,
                    },
                    useDexMod: false,
                    cf: {
                        hr: 4,
                        infect: false,
                        impair: false,
                        bleed: false,
                        newInj: -1,
                    },
                    mf: {
                        hr: 5,
                        infect: false,
                        impair: false,
                        bleed: false,
                        newInj: -1,
                    },
                    ms: {
                        hr: 6,
                        infect: false,
                        impair: false,
                        bleed: false,
                        newInj: -1,
                    },
                    cs: {
                        hr: -1,
                        infect: false,
                        impair: false,
                        bleed: false,
                        newInj: -1,
                    },
                },
                S: {
                    treatment: "Clean & Dress",
                    mod: {
                        name: "Treatment Bonus",
                        abbrev: "TrtBns",
                        value: 10,
                    },
                    useDexMod: false,
                    cf: {
                        hr: 3,
                        infect: true,
                        impair: false,
                        bleed: false,
                        newInj: -1,
                    },
                    mf: {
                        hr: 4,
                        infect: true,
                        impair: false,
                        bleed: false,
                        newInj: -1,
                    },
                    ms: {
                        hr: 5,
                        infect: false,
                        impair: false,
                        bleed: false,
                        newInj: -1,
                    },
                    cs: {
                        hr: 6,
                        infect: false,
                        impair: false,
                        bleed: false,
                        newInj: -1,
                    },
                },
                G: {
                    treatment: "Clean & Dress",
                    mod: null,
                    useDexMod: false,
                    cf: {
                        hr: 2,
                        infect: true,
                        impair: true,
                        bleed: false,
                        newInj: -1,
                    },
                    mf: {
                        hr: 3,
                        infect: true,
                        impair: true,
                        bleed: false,
                        newInj: -1,
                    },
                    ms: {
                        hr: 4,
                        infect: true,
                        impair: true,
                        bleed: false,
                        newInj: -1,
                    },
                    cs: {
                        hr: 5,
                        infect: false,
                        impair: false,
                        bleed: false,
                        newInj: -1,
                    },
                },
            },
            frost: {
                M: {
                    treatment: "Warm",
                    mod: {
                        name: "Treatment Bonus",
                        abbrev: "TrtBns",
                        value: 40,
                    },
                    useDexMod: false,
                    cf: {
                        hr: 4,
                        infect: false,
                        impair: false,
                        bleed: false,
                    },
                    mf: {
                        hr: 5,
                        infect: false,
                        impair: false,
                        bleed: false,
                    },
                    ms: {
                        hr: -1,
                        infect: false,
                        impair: false,
                        bleed: false,
                    },
                    cs: {
                        hr: -1,
                        infect: false,
                        impair: false,
                        bleed: false,
                    },
                },
                S: {
                    treatment: "Warm",
                    mod: {
                        name: "Treatment Bonus",
                        abbrev: "TrtBns",
                        value: 20,
                    },
                    useDexMod: false,
                    cf: {
                        hr: 3,
                        infect: false,
                        impair: true,
                        bleed: false,
                        newInj: -1,
                    },
                    mf: {
                        hr: 4,
                        infect: false,
                        impair: false,
                        bleed: false,
                        newInj: -1,
                    },
                    ms: {
                        hr: 5,
                        infect: false,
                        impair: false,
                        bleed: false,
                        newInj: -1,
                    },
                    cs: {
                        hr: 6,
                        infect: false,
                        impair: false,
                        bleed: false,
                        newInj: -1,
                    },
                },
                G: {
                    treatment: "Surgery & Amputate",
                    mod: null,
                    useDexMod: true,
                    cf: {
                        hr: -1,
                        infect: true,
                        impair: false,
                        bleed: true,
                        newInj: 5,
                    },
                    mf: {
                        hr: -1,
                        infect: false,
                        impair: false,
                        bleed: true,
                        newInj: 4,
                    },
                    ms: {
                        hr: -1,
                        infect: false,
                        impair: false,
                        bleed: true,
                        newInj: 3,
                    },
                    cs: {
                        hr: -1,
                        infect: false,
                        impair: false,
                        bleed: false,
                        newInj: 2,
                    },
                },
            },
        };
    }

    static calcZoneDieFormula(die, offset) {
        const result =
            (die ? "d" + die + (offset < 0 ? "" : "+") : "") + offset;
        return result;
    }

    get isBarbed() {
        return this.item.getFlag("sohl", "legendary.isBarbed");
    }

    set isBarbed(val) {
        this.item.setFlag("sohl", "legendary.isBarbed", !!val);
    }

    get isGlancing() {
        return this.item.getFlag("sohl", "legendary.isGlancing");
    }

    set isGlancing(val) {
        this.item.setFlag("sohl", "legendary.isGlancing", !!val);
    }

    get extraBleedRisk() {
        return this.item.getFlag("sohl", "legendary.extraBleedRisk");
    }

    set extraBleedRisk(val) {
        this.item.setFlag("sohl", "legendary.extraBleedRisk", !!val);
    }

    get permanentImpairment() {
        return this.item.getFlag("sohl", "legendary.permanentImpairment");
    }

    set permanentImpairment(val) {
        if (typeof val === "number") {
            val = Math.max(0, val);
            this.item.setFlag("sohl", "legendary.permanentImpairment", val);
        }
    }

    get untreatedHealing() {
        let treatmt = {
            hr: 5,
            infect: true,
            impair: false,
            bleed: false,
            newInj: -1,
        };

        const treatSev = this.$injuryLevel?.severity;
        if (treatSev) {
            if (treatSev !== "0") {
                const cf =
                    this.constructor.treatments[this.aspect]?.[treatSev]?.[
                        "cf"
                    ];
                if (typeof cf === "object") treatmt = cf;
            } else {
                treatmt = {
                    hr: 6,
                    infect: false,
                    impair: false,
                    bleed: false,
                    newInj: -1,
                };
            }
        }
        return treatmt;
    }

    prepareBaseData() {
        super.prepareBaseData();
        const newIL = new sohl.ValueModifier(this, {
            severity: (thisVM) => {
                let severity;
                if (thisVM.effective <= 0) {
                    severity = "0";
                } else if (thisVM.effective == 1) {
                    severity = "M1";
                } else if (thisVM.effective <= 3) {
                    severity = `S${thisVM.effective}`;
                } else {
                    severity = `G${thisVM.effective}`;
                }
                return severity;
            },
        });
        this.$injuryLevel = newIL.addVM(this.$injuryLevel, {
            includeBase: true,
        });
    }
    /** @override */
    postProcess() {
        super.postProcess();
        if (!this.isInEffect) return;

        // Apply this injury as impairment to bodylocations
        const blItem = this.actor.items.find(
            (it) =>
                it.system instanceof sohl.BodyLocationItemData &&
                it.name === this.bodyLocation,
        );
        if (blItem) {
            const blData = blItem.system;
            if (this.injuryLevel.effective > 3) {
                blData.impairment.setProperty("unusable", true);
                blData.impairment.set(
                    `${this.item.name} Grevious Injury: Unusable`,
                    "GInjUnusable",
                    0,
                );
            } else if (this.injuryLevel.effective > 1) {
                blData.impairment.add(
                    `${this.item.name} Serious Injury`,
                    "SInj",
                    -10,
                );
            } else if (
                this.injuryLevel.effective > 0 &&
                this.healingRate.effective < 6 &&
                this.isInEffect
            ) {
                blData.impairment.add(
                    `${this.item.name} Minor Injury`,
                    "MInj",
                    -5,
                );
            }
        }

        //        const injuryDurationDays = Math.trunc((game.time.worldTime - this.item.system.createdTime) / 86400);
        if (this.alData.mayBePermanent) {
            //const permanentImpairment = Math.min(25, Math.trunc(injuryDurationDays / 20) * 5);
            // TODO - Permanent Injury
        }
    }
}

class LgndMysticalAbilityItemData extends LgndMasteryLevelItemDataMixin(
    sohl.MysticalAbilityItemData,
) {}

class LgndTraitItemData extends sohl.TraitItemData {
    get actionBodyParts() {
        return this.item.getFlag("sohl", "legendary.actionBodyParts") || [];
    }

    get diceFormula() {
        return this.item.getFlag("sohl", "legendary.diceFormula");
    }

    prepareBaseData() {
        super.prepareBaseData();
        this.$masteryLevel &&= LgndMasteryLevelModifier.create(
            this.$masteryLevel,
            {
                parent: this,
            },
        );
        if (this.abbrev === "fate") {
            this.$masteryLevel.setBase(this.$score.base);
        }
    }

    processSiblings() {
        super.processSiblings();
        if (this.isNumeric) {
            this.actionBodyParts.forEach((bp) => {
                let it = null;
                for (const it in this.actor.allItems()) {
                    if (
                        it.system instanceof sohl.BodyPartItemData &&
                        it.name === bp
                    ) {
                        if (it.system.$impairment.unusable) {
                            this.$masteryLevel.set(
                                `${this.item.name} Unusable`,
                                `${this.abbrev}Unusable`,
                                0,
                            );
                        } else if (it.system.$impairment.value) {
                            this.$masteryLevel.add(
                                `${this.item.name} Impairment`,
                                `${this.abbrev}Imp`,
                                it.system.$impairment.value,
                            );
                        }
                        break;
                    }
                }
            });
        }

        if (this.intensity === "attribute" && this.subType === "physique") {
            for (const it of this.actor.allItems()) {
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
            }
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

class LgndSkillItemData extends LgndMasteryLevelItemDataMixin(
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
            for (const it of this.actor.allItems()) {
                if (
                    it.system instanceof sohl.BodyPartItemData &&
                    it.name === bp
                ) {
                    if (it.system.$impairment.unusable) {
                        this.$masteryLevel.set(
                            `${this.item.name} Unusable`,
                            `${this.abbrev}Unusable`,
                            0,
                        );
                    } else if (it.system.$impairment.value) {
                        this.$masteryLevel.add(
                            `${this.item.name} Impairment`,
                            `${this.abbrev}Imp`,
                            it.system.$impairment.value,
                        );
                    }
                    break;
                }
            }
        });

        if (["craft", "combat", "physical"].includes(this.subType)) {
            for (const it of this.actor.allItems()) {
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
            }
        }
    }
}

class LgndAfflictionItemData extends sohl.AfflictionItemData {
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

class LgndBodyZoneItemData extends sohl.BodyZoneItemData {
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

class LgndBodyPartItemData extends sohl.BodyPartItemData {
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

class LgndBodyLocationItemData extends sohl.BodyLocationItemData {
    $impairment;

    get isRigid() {
        return this.item.getFlag("sohl", "legendary.bleedingSevThreshold");
    }

    get bleedingSevThreshold() {
        return this.item.getFlag("sohl", "legendary.isRigid");
    }

    get amputatePenalty() {
        return this.item.getFlag("sohl", "legendary.amputatePenalty");
    }

    get shockValue() {
        return this.item.getFlag("sohl", "legendary.shockValue");
    }

    /** @override */
    prepareBaseData() {
        super.prepareBaseData();
        this.$impairment = new sohl.ValueModifier(this, { unusable: false });
    }

    prepareSiblings() {
        super.prepareSiblings();
        // biome-ignore lint/correctness/noUnusedVariables: <explanation>
        let thisIsUnusable = this.$impairment.unusable;

        const bpItem = this.item.nestedIn;
        if (bpItem) {
            const bpImp = bpItem.system.$impairment;
            if (this.$impairment.effective) {
                bpImp.addVM(this.$impairment);
            }

            if (this.$impairment.unusable) {
                bpImp.$impairment.unusable = true;
            }
        }
    }
}

class LgndArmorGearItemData extends sohl.ArmorGearItemData {
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
class LgndWeaponGearItemData extends sohl.WeaponGearItemData {
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

export class LgndUtility extends sohl.Utility {
    static strImpactMod(str) {
        if (typeof str !== "number") return -10;
        return str > 5
            ? Math.trunc(str / 2) - 5
            : [-10, -10, -8, -6, -4, -3].at(Math.max(str, 0));
    }
}

export class LgndTour extends Tour {
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
                case LGND.CONST.TOUR_TAB_PARENTS.ACTOR: {
                    if (!this.actor) {
                        console.warn("No Actor Found");
                        break;
                    }
                    const app = this.actor.sheet;
                    app?.activateTab(currentStep.tab.id);
                    break;
                }

                case LGND.CONST.TOUR_TAB_PARENTS.ITEM: {
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

export class LgndCommands extends sohl.Commands {
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
sohl.SOHL.cmds = LgndCommands;

const LgndActorDataModels = foundry.utils.mergeObject(
    sohl.SohlActorDataModels,
    {
        [sohl.AnimateEntityActorData.typeName]: LgndAnimateEntityActorData,
    },
    { inplace: false },
);

const LgndItemDataModels = foundry.utils.mergeObject(
    sohl.SohlItemDataModels,
    {
        [sohl.MysticalAbilityItemData.typeName]: LgndMysticalAbilityItemData,
        [sohl.TraitItemData.typeName]: LgndTraitItemData,
        [sohl.SkillItemData.typeName]: LgndSkillItemData,
        [sohl.InjuryItemData.typeName]: LgndInjuryItemData,
        [sohl.DomainItemData.typeName]: LgndDomainItemData,
        [sohl.AfflictionItemData.typeName]: LgndAfflictionItemData,
        [sohl.BodyZoneItemData.typeName]: LgndBodyZoneItemData,
        [sohl.BodyPartItemData.typeName]: LgndBodyPartItemData,
        [sohl.BodyLocationItemData.typeName]: LgndBodyLocationItemData,
        [sohl.MeleeWeaponStrikeModeItemData.typeName]:
            LgndMeleeWeaponStrikeModeItemData,
        [sohl.MissileWeaponStrikeModeItemData.typeName]:
            LgndMissileWeaponStrikeModeItemData,
        [sohl.CombatTechniqueStrikeModeItemData.typeName]:
            LgndCombatTechniqueStrikeModeItemData,
        [sohl.ArmorGearItemData.typeName]: LgndArmorGearItemData,
        [sohl.WeaponGearItemData.typeName]: LgndWeaponGearItemData,
    },
    { inplace: false },
);

const LgndModifiers = foundry.utils.mergeObject(
    sohl.SohlModifiers,
    {
        ImpactModifier: LgndImpactModifier,
        MasteryLevelModifier: LgndMasteryLevelModifier,
    },
    { inplace: false },
);

export const verData = {
    id: "legendary",
    label: "Song of Heroic Lands: Legendary Edition",
    CONFIG: {
        Helper: {
            modifiers: LgndModifiers,
            contextMenu: sohl.SohlContextMenu,
        },
        Actor: {
            documentClass: sohl.SohlActor,
            documentSheets: [
                {
                    cls: sohl.SohlActorSheet,
                    types: Object.keys(LgndActorDataModels),
                },
            ],
            dataModels: LgndActorDataModels,
            typeLabels: sohl.SohlActorTypeLabels,
            typeIcons: sohl.SohlActorTypeIcons,
            types: Object.keys(LgndActorDataModels),
            defaultType: sohl.AnimateEntityActorData.typeName,
            compendiums: ["sohl.leg-characters", "sohl.leg-creatures"],
        },
        Item: {
            documentClass: sohl.SohlItem,
            documentSheets: [
                {
                    cls: sohl.SohlItemSheet,
                    types: Object.keys(LgndItemDataModels).filter(
                        (t) => t !== sohl.ContainerGearItemData.typeName,
                    ),
                },
                {
                    cls: sohl.SohlContainerGearItemSheet,
                    types: [sohl.ContainerGearItemData.typeName],
                },
            ],
            dataModels: LgndItemDataModels,
            typeLabels: sohl.SohlItemTypeLabels,
            typeIcons: sohl.SohlItemTypeIcons,
            types: Object.keys(LgndItemDataModels),
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
    CONST: foundry.utils.mergeObject(sohl.SOHL.CONST, LGND.CONST, {
        inplace: false,
    }),
};
