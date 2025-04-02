import fs from "fs";
import path from "path";
import yaml from "yaml";
import unidecode from "unidecode";
import log from "loglevel";
import prefix from "loglevel-plugin-prefix";

const stats = {
    systemId: "sohl",
    systemVersion: "0.5.6",
    coreVersion: "13",
    createdTime: 0,
    modifiedTime: 0,
    lastModifiedBy: "sohlbuilder00000",
};

export class Possessions {
    static id = "possessions";

    constructor(dataDir, outputDir) {
        Object.defineProperty(this, "dataDir", {
            value: dataDir,
            writable: false,
        });
        Object.defineProperty(this, "outputDir", {
            value: outputDir,
            writable: false,
        });
    }

    static mergeObject(obj1, obj2, depth = 0, maxDepth = 20) {
        if (depth > maxDepth) {
            throw new Error(
                `Recursion depth exceeded: Maximum allowed depth is ${maxDepth}`,
            );
        }

        if (typeof obj1 !== "object" || obj1 === null) return obj2;
        if (typeof obj2 !== "object" || obj2 === null) return obj1;

        const result = { ...obj1 };

        for (const key of Object.keys(obj2)) {
            if (
                obj2[key] &&
                typeof obj2[key] === "object" &&
                !Array.isArray(obj2[key])
            ) {
                result[key] = this.mergeObject(
                    obj1[key] || {},
                    obj2[key],
                    depth + 1,
                    maxDepth,
                );
            } else {
                result[key] = obj2[key];
            }
        }

        return result;
    }

    async processMiscGear() {
        const filePath = path.join(this.dataDir, "miscgear.yaml");
        const data = yaml.parse(fs.readFileSync(filePath, "utf8"));

        for (const miscgear of data) {
            log.debug(`Processing Misc Gear ${miscgear.name}`);
            let fname =
                `${unidecode(miscgear.name)}_${miscgear.id}`.replace(
                    /[^0-9a-zA-Z]+/g,
                    "_",
                ) + ".json";
            let outputPath = path.join(this.outputDir, fname);

            const outputData = {
                name: miscgear.name,
                type: "miscgear",
                img: miscgear.img,
                _id: miscgear.id,
                system: {
                    notes: "",
                    textReference: "",
                    description: miscgear.description,
                    macros: miscgear.macros,
                    nestedItems: [],
                    transfer: false,
                    abbrev: miscgear.abbrev,
                    quantity: 1,
                    weightBase: miscgear.weight,
                    valueBase: miscgear.value,
                    isCarried: true,
                    isEquipped: false,
                    qualityBase: miscgear.quality,
                    durabilityBase: miscgear.durability,
                },
                effects: miscgear.effects || [],
                flags: miscgear.flags || {},
                _stats: stats,
                ownership: { default: 0 },
                folder: miscgear.folderId || null,
                _key: `!items!${miscgear.id}`,
            };

            fs.writeFileSync(
                outputPath,
                JSON.stringify(outputData, null, 2),
                "utf8",
            );
        }
    }

    async processContainerGear() {
        const filePath = path.join(this.dataDir, "containergear.yaml");
        const data = yaml.parse(fs.readFileSync(filePath, "utf8"));

        for (const containergear of data) {
            log.debug(`Processing Container Gear ${containergear.name}`);
            let fname =
                `${unidecode(containergear.name)}_${containergear.id}`.replace(
                    /[^0-9a-zA-Z]+/g,
                    "_",
                ) + ".json";
            let outputPath = path.join(this.outputDir, fname);

            const outputData = {
                name: containergear.name,
                type: "containergear",
                img: containergear.img,
                _id: containergear.id,
                system: {
                    notes: "",
                    textReference: "",
                    description: containergear.description,
                    macros: containergear.macros,
                    nestedItems: [],
                    transfer: false,
                    abbrev: containergear.abbrev || "",
                    quantity: 1,
                    weightBase: containergear.weight,
                    valueBase: containergear.value,
                    isCarried: true,
                    isEquipped: false,
                    qualityBase: containergear.quality,
                    durabilityBase: containergear.durability,
                    maxCapacityBase: containergear.maxCapacity,
                },
                effects: containergear.effects || [],
                flags: containergear.flags || {},
                _stats: stats,
                ownership: { default: 0 },
                folder: containergear.folderId || null,
                _key: `!items!${containergear.id}`,
            };

            fs.writeFileSync(
                outputPath,
                JSON.stringify(outputData, null, 2),
                "utf8",
            );
        }
    }

    async processConcoctionGear() {
        const filePath = path.join(this.dataDir, "concoctiongear.yaml");
        const data = yaml.parse(fs.readFileSync(filePath, "utf8"));

        for (const concoctiongear of data) {
            log.debug(`Processing Concoction Gear ${concoctiongear.name}`);
            let fname =
                `${unidecode(concoctiongear.name)}_${concoctiongear.id}`.replace(
                    /[^0-9a-zA-Z]+/g,
                    "_",
                ) + ".json";
            let outputPath = path.join(this.outputDir, fname);

            const outputData = {
                name: concoctiongear.name,
                type: "concoctiongear",
                img: concoctiongear.img,
                _id: concoctiongear.id,
                system: {
                    notes: "",
                    textReference: "",
                    description: concoctiongear.description,
                    macros: concoctiongear.macros,
                    nestedItems: [],
                    transfer: false,
                    abbrev: concoctiongear.abbrev || "",
                    quantity: 1,
                    weightBase: concoctiongear.weight,
                    valueBase: concoctiongear.value,
                    isCarried: true,
                    isEquipped: false,
                    qualityBase: concoctiongear.quality,
                    durabilityBase: concoctiongear.durability,
                    potency: concoctiongear.potency,
                    strength: concoctiongear.strength,
                },
                effects: concoctiongear.effects || [],
                flags: concoctiongear.flags || {},
                _stats: stats,
                ownership: { default: 0 },
                folder: concoctiongear.folderId || null,
                _key: `!items!${concoctiongear.id}`,
            };

            fs.writeFileSync(
                outputPath,
                JSON.stringify(outputData, null, 2),
                "utf8",
            );
        }
    }

    async processProjectileGear() {
        const filePath = path.join(this.dataDir, "projectilegear.yaml");
        const data = yaml.parse(fs.readFileSync(filePath, "utf8"));

        for (const projectilegear of data) {
            log.debug(`Processing Projectile Gear ${projectilegear.name}`);
            let fname =
                `${unidecode(projectilegear.name)}_${projectilegear.id}`.replace(
                    /[^0-9a-zA-Z]+/g,
                    "_",
                ) + ".json";
            let outputPath = path.join(this.outputDir, fname);

            const outputData = {
                name: projectilegear.name,
                type: "projectilegear",
                img: projectilegear.img,
                _id: projectilegear.id,
                system: {
                    notes: "",
                    textReference: "",
                    description: projectilegear.description,
                    macros: projectilegear.macros,
                    nestedItems: [],
                    transfer: false,
                    abbrev: projectilegear.abbrev || "",
                    quantity: 1,
                    weightBase: projectilegear.weight,
                    valueBase: projectilegear.value,
                    isCarried: true,
                    isEquipped: false,
                    qualityBase: projectilegear.quality,
                    durabilityBase: projectilegear.durability,
                    shortName: projectilegear.easyname,
                    impactBase: {
                        numDice: projectilegear.impactDie > 0 ? 1 : 0,
                        die: projectilegear.impactDie,
                        modifier: projectilegear.impactMod,
                        aspect: projectilegear.aspect,
                    },
                },
                effects: projectilegear.effects || [],
                flags: projectilegear.flags || {},
                _stats: stats,
                ownership: { default: 0 },
                folder: projectilegear.folderId || null,
                _key: `!items!${projectilegear.id}`,
            };

            if (projectilegear.AEID) {
                const effect = {
                    name: `${projectilegear.easyname} ${projectilegear.type} Traits`,
                    icon: "icons/svg/aura.svg",
                    type: "sohlactiveeffect",
                    _id: projectilegear.AEID,
                    disabled: false,
                    system: {
                        targetType: "this",
                        targetName: "",
                    },
                    changes: [],
                    duration: {
                        startTime: null,
                        seconds: null,
                        combat: null,
                        rounds: null,
                        turns: null,
                        startRound: null,
                        startTurn: null,
                    },
                    origin: "",
                    tint: null,
                    transfer: false,
                    description: "",
                    statuses: [],
                    flags: {},
                    _key: `!items.effects!${projectilegear.id}.${projectilegear.AEID}`,
                };

                if (projectilegear.ARvalue) {
                    effect.changes.push({
                        key: "mod:system.$impact.armorReduction",
                        mode: 2,
                        value: projectilegear.ARvalue.toString(),
                        priority: null,
                    });
                }

                if (projectilegear.bleed) {
                    effect.changes.push({
                        key: "mod:system.$traits.bleed",
                        mode: 5,
                        value: "true",
                        priority: null,
                    });
                }
                outputData.effects.push(effect);
            }

            fs.writeFileSync(
                outputPath,
                JSON.stringify(outputData, null, 2),
                "utf8",
            );
        }
    }

    async processArmorGear() {
        const filePath = path.join(this.dataDir, "armorgear.yaml");
        const data = yaml.parse(fs.readFileSync(filePath, "utf8"));

        for (const armorgear of data) {
            log.debug(`Processing Armor Gear ${armorgear.name}`);
            let fname =
                `${unidecode(armorgear.name)}_${armorgear.id}`.replace(
                    /[^0-9a-zA-Z]+/g,
                    "_",
                ) + ".json";
            let outputPath = path.join(this.outputDir, fname);

            Possessions.mergeObject(armorgear.flags, {
                sohl: {
                    legendary: {
                        encumbrance: armorgear.encumbrance,
                    },
                },
            });

            const outputData = {
                name: armorgear.name,
                type: "armorgear",
                img: armorgear.img,
                _id: armorgear.id,
                system: {
                    notes: "",
                    textReference: "",
                    description: armorgear.description,
                    macros: armorgear.macros,
                    nestedItems: [],
                    transfer: false,
                    abbrev: armorgear.abbrev || "",
                    quantity: 1,
                    weightBase: armorgear.weight,
                    valueBase: armorgear.value,
                    isCarried: true,
                    isEquipped: false,
                    qualityBase: armorgear.quality,
                    durabilityBase: armorgear.durability,
                    material: armorgear.material,
                    locations: {
                        flexible: armorgear.flexloc,
                        rigid: armorgear.rigidloc,
                    },
                },
                effects: armorgear.effects || [],
                flags: armorgear.flags || {},
                _stats: stats,
                ownership: { default: 0 },
                folder: armorgear.folderId || null,
                _key: `!items!${armorgear.id}`,
            };

            const legProt = {
                name: "Legendary Protection",
                type: "protection",
                img: armorgear.img,
                _id: armorgear.legendary.id,
                system: {
                    transfer: true,
                    subType: "legendary",
                    protectionBase: {
                        blunt: armorgear.legendary.blunt,
                        edged: armorgear.legendary.edged,
                        piercing: armorgear.legendary.piercing,
                        fire: armorgear.legendary.fire,
                    },
                },
                effects: [],
                ownership: { default: 0 },
            };
            if (armorgear.perception) {
                legProt.effects.push(
                    {
                        name: "Skills Using Perception",
                        icon: "icons/svg/aura.svg",
                        type: "sohlactiveeffect",
                        _id: armorgear.perceptionSkillEffectId,
                        disabled: false,
                        system: {
                            targetType: "skill",
                            targetName: "attr:Perception",
                        },
                        changes: [
                            {
                                key: "mod:system.$masteryLevel",
                                mode: 2,
                                value: armorgear.perception.toString(),
                                priority: null,
                            },
                        ],
                        duration: {
                            startTime: null,
                            seconds: null,
                            combat: null,
                            rounds: null,
                            turns: null,
                            startRound: null,
                            startTurn: null,
                        },
                        origin: "",
                        tint: null,
                        transfer: false,
                        description: "",
                        statuses: [],
                        flags: {},
                        _key: `!effects!${armorgear.id}.${armorgear.perceptionSkillEffectId}`,
                    },
                    {
                        name: "Perception Attribute",
                        icon: "icons/svg/aura.svg",
                        type: "sohlactiveeffect",
                        _id: armorgear.perceptionTraitEffectId,
                        disabled: false,
                        system: {
                            targetType: "trait",
                            targetName: "Perception",
                        },
                        changes: [
                            {
                                key: "mod:system.$masteryLevel",
                                mode: 2,
                                value: armorgear.perception.toString(),
                                priority: null,
                            },
                        ],
                        duration: {
                            startTime: null,
                            seconds: null,
                            combat: null,
                            rounds: null,
                            turns: null,
                            startRound: null,
                            startTurn: null,
                        },
                        origin: "",
                        tint: null,
                        transfer: false,
                        description: "",
                        statuses: [],
                        flags: {},
                        _key: `!effects!${armorgear.id}.${armorgear.perceptionTraitEffectId}`,
                    },
                );
            }
            outputData.system.nestedItems.push(legProt);

            fs.writeFileSync(
                outputPath,
                JSON.stringify(outputData, null, 2),
                "utf8",
            );
        }
    }

    async processWeaponGear() {
        let filePath = path.join(this.dataDir, "weapongear.yaml");
        let data = yaml.parse(fs.readFileSync(filePath, "utf8"));

        const weapons = new Map();
        for (const weapongear of data) {
            log.debug(`Processing Weapon Gear ${weapongear.name}`);

            Possessions.mergeObject(weapongear.flags, {
                sohl: {
                    legendary: {
                        encumbrance: weapongear.encumbrance,
                    },
                },
            });

            weapons.set(weapongear.id, {
                name: weapongear.name,
                type: "weapongear",
                img: weapongear.img,
                _id: weapongear.id,
                system: {
                    notes: "",
                    textReference: "",
                    description: weapongear.description,
                    macros: weapongear.macros,
                    nestedItems: [],
                    transfer: false,
                    abbrev: weapongear.abbrev || "",
                    quantity: 1,
                    weightBase: weapongear.weight,
                    valueBase: weapongear.value,
                    isCarried: true,
                    isEquipped: false,
                    qualityBase: weapongear.quality,
                    durabilityBase: weapongear.durability,
                },
                effects: weapongear.effects || [],
                flags: weapongear.flags || {},
                _stats: stats,
                ownership: { default: 0 },
                folder: "c0GXEU9oCZ1N3mSl",
                _key: `!items!${weapongear.id}`,
            });
        }

        filePath = path.join(this.dataDir, "weapons-strike-modes.yaml");
        data = yaml.parse(fs.readFileSync(filePath, "utf8"));
        for (const weaponsm of data) {
            const smname = `${weaponsm.name} (${weaponsm.subDesc})`;
            log.debug(`Processing StrikeMode ${smname}`);
            const weapon = weapons.get(weaponsm.weaponId);
            const traits = {
                armorReduction: weaponsm["AR"],
                blockMod: weaponsm["blockMod"],
                counterMod: weaponsm["counterMod"],
                meleeMod: weaponsm["meleeMod"],
                opponentDef: weaponsm["oppDef"],
                deflectTN: weaponsm["deflectTN"],
                entangle: weaponsm["entangle"],
                envelop: weaponsm["envelop"],
                couched: weaponsm["couched"],
                blockSLMod: weaponsm["blockSLMod"],
                cxSLMod: weaponsm["cxSLMod"],
                noAttack: weaponsm["noAttack"],
                noBlock: weaponsm["noBlock"],
                lowAim: weaponsm["lowAim"],
                impactTA: weaponsm["impTA"],
                long: weaponsm["long"],
                onlyInClose: weaponsm["onlyInClose"],
                shieldMod: weaponsm["shieldMod"],
                slow: weaponsm["slow"],
                thrust: weaponsm["thrust"],
                swung: weaponsm["swung"],
                halfSword: weaponsm["halfSword"],
                bleed: weaponsm["bleed"],
                twoHandLen: weaponsm["2hLength"],
                noStrMod: weaponsm["noStrMod"],
                halfImpact: weaponsm["halfImpact"],
                durMod: weaponsm["durabilityMod"],
            };
            if (weaponsm.subType === "legendary") {
                Possessions.mergeObject(weaponsm.flags, {
                    sohl: {
                        legendary: {
                            zoneDie: weaponsm.zoneDie,
                        },
                    },
                });
            } else if (weaponsm.subType === "mistyisle") {
                Possessions.mergeObject(weaponsm.flags, {
                    sohl: {
                        mistyisle: {
                            oneHandedPenalty:
                                weaponsm.mistyisle.oneHandedPenalty,
                        },
                    },
                });
            }

            const sm = {
                name: weaponsm.subDesc,
                type: "meleestrikemode",
                img: weapon.img,
                _id: weaponsm.smId,
                system: {
                    notes: "",
                    textReference: "",
                    description: "",
                    macros: weaponsm.macros,
                    nestedItems: [],
                    transfer: true,
                    subType: weaponsm.subType,
                    mode: weaponsm.subDesc,
                    minParts: weaponsm.minParts,
                    assocSkillName: weaponsm.assocSkill,
                    impactBase: {
                        numDice: weaponsm.impactDie > 0 ? 1 : 0,
                        die: Math.max(weaponsm.die, 0),
                        modifier: weaponsm.modifier,
                        aspect: weaponsm.aspect,
                    },
                },
                effects: weaponsm.effects || [],
                flags: weaponsm.flags || {},
                _stats: stats,
                ownership: { default: 0 },
                folder: null,
                _key: `!items!${weaponsm.id}`,
            };

            if (["Ranged", "Thrown"].includes(weaponsm.subDesc)) {
                switch (weaponsm.projtype) {
                    case "arrow":
                        sm.img = "systems/sohl/assets/icons/arrow.svg";
                        break;

                    case "bolt":
                        sm.img = "systems/sohl/assets/icons/arrow.svg";
                        break;

                    case "bullet":
                        sm.img = "systems/sohl/assets/icons/stones.svg";
                        break;

                    case "dart":
                        sm.img = "systems/sohl/assets/icons/arrow.svg";
                        break;

                    default:
                        sm.img = "systems/sohl/assets/icons/throw.svg";
                        break;
                }
                sm.type = "missilestrikemode";
                sm.system.projectileType = weaponsm.projtype;
                if (weaponsm.subType === "legendary") {
                    Possessions.mergeObject(sm.flags, {
                        sohl: {
                            legendary: {
                                maxVolleyMult: weaponsm.maxVM,
                                baseRangeBase: weaponsm.baseRange,
                                drawBase: weaponsm.draw,
                            },
                        },
                    });
                } else if (weaponsm.subType === "mistyisle") {
                    Possessions.mergeObject(sm.flags, {
                        sohl: {
                            mistyisle: {
                                range: weaponsm.mistyisle.range,
                                impact: weaponsm.mistyisle.impact,
                            },
                        },
                    });
                }
            }

            const effect = {
                name: `${weaponsm.subDesc} Traits`,
                icon: "icons/svg/aura.svg",
                type: "sohlactiveeffect",
                _id: weaponsm.AEID,
                disabled: false,
                system: {
                    targetType: "this",
                    targetName: "",
                },
                changes: [],
                duration: {
                    startTime: null,
                    seconds: null,
                    combat: null,
                    rounds: null,
                    turns: null,
                    startRound: null,
                    startTurn: null,
                },
                origin: "",
                tint: null,
                transfer: false,
                description: "",
                statuses: [],
                flags: {},
                _key: `!items.effects!${weaponsm.smId}.${weaponsm.AEID}`,
            };

            if (weaponsm.subType === "legendary") {
                if (weaponsm.shaft) {
                    Possessions.mergeObject(effect.flags, {
                        sohl: {
                            legendary: {
                                zoneDie: 8,
                            },
                        },
                    });
                    Possessions.mergeObject(sm.system.impactBase, {
                        die: 6,
                        modifier: 1,
                        aspect: "blunt",
                    });
                    traits.slow = false;
                    traits.thrust = false;
                    effect.changes.push({
                        key: "mod:system.$length",
                        mode: 2,
                        value: -2,
                        priority: null,
                    });
                }

                if (weaponsm.pommel) {
                    Possessions.mergeObject(effect.flags, {
                        sohl: {
                            legendary: {
                                zoneDie: 4,
                            },
                        },
                    });
                    Possessions.mergeObject(sm.system.impactBase, {
                        die: 6,
                        modifier: 0,
                        aspect: "blunt",
                    });
                    effect.changes.push({
                        key: "mod:system.$length",
                        mode: 5,
                        value: 1,
                        priority: null,
                    });
                }
            }

            if (weaponsm.halfSword) {
                if (sm.system.impactBase.aspect === "blunt") {
                    sm.system.impactBase.modifier = 0;
                    sm.system.impactBase.die = 6;
                }
                if (sm.flags?.sohl?.legendary?.zoneDie > 4) {
                    sm.flags.sohl.legendary.zoneDie =
                        sm.flags.sohl.legendary.zoneDie - 2;
                }
                traits.thrust = true;
                effect.changes.push(
                    {
                        key: "mod:system.$length",
                        mode: 2,
                        value: -2,
                        priority: null,
                    },
                    {
                        key: "mod:system.$length",
                        mode: 4,
                        value: 3,
                        priority: null,
                    },
                    {
                        key: "system.$traits.halfSword",
                        mode: 5,
                        value: "true",
                        priority: null,
                    },
                );
            }

            if (traits.armorReduction) {
                effect.changes.push({
                    key: "mod:system.$impact.armorReduction",
                    mode: 2,
                    value: traits.armorReduction.toString(),
                    priority: null,
                });
            }

            if (traits.blockMod) {
                effect.changes.push({
                    key: "mod:system.$defense.block",
                    mode: 2,
                    value: traits.blockMod.toString(),
                    priority: null,
                });
            }

            if (traits.counterMod) {
                effect.changes.push({
                    key: "mod:system.$defense.counterstrike",
                    mode: 2,
                    value: traits.counterMod.toString(),
                    priority: null,
                });
            }

            if (traits.meleeMod) {
                effect.changes.push({
                    key: "mod:system.$attack.block",
                    mode: 2,
                    value: traits.meleeMod.toString(),
                    priority: null,
                });
            }

            if (traits.opponentDef) {
                effect.changes.push({
                    key: "mod:system.$defense.opponentDef",
                    mode: 2,
                    value: traits.opponentDef.toString(),
                    priority: null,
                });
            }

            if (traits.deflectTN) {
                effect.changes.push({
                    key: "system.$traits.deflectTN",
                    mode: 2,
                    value: traits.deflectTN.toString(),
                    priority: null,
                });
            }

            if (traits.entangle) {
                effect.changes.push({
                    key: "system.$traits.entangle",
                    mode: 5,
                    value: "true",
                    priority: null,
                });
            }

            if (traits.envelop) {
                effect.changes.push({
                    key: "system.$traits.envelop",
                    mode: 5,
                    value: "true",
                    priority: null,
                });
            }

            if (traits.couched) {
                effect.changes.push({
                    key: "system.$traits.couched",
                    mode: 5,
                    value: "true",
                    priority: null,
                });
            }

            if (traits.impactTA) {
                effect.changes.push({
                    key: "system.$traits.impactTA",
                    mode: 5,
                    value: "true",
                    priority: null,
                });
            }

            if (traits.long) {
                effect.changes.push({
                    key: "system.$traits.long",
                    mode: 5,
                    value: "true",
                    priority: null,
                });
            }

            if (traits.onlyInClose) {
                effect.changes.push({
                    key: "system.$traits.onlyInClose",
                    mode: 5,
                    value: "true",
                    priority: null,
                });
            }

            if (traits.shieldMod) {
                effect.changes.push({
                    key: "system.$traits.shieldMod",
                    mode: 2,
                    value: traits.shieldMod.toString(),
                    priority: null,
                });
            }

            if (traits.slow) {
                effect.changes.push({
                    key: "system.$traits.slow",
                    mode: 5,
                    value: "true",
                    priority: null,
                });
            }

            if (traits.thrust) {
                effect.changes.push({
                    key: "system.$traits.thrust",
                    mode: 5,
                    value: "true",
                    priority: null,
                });
            }

            if (traits.swung) {
                effect.changes.push({
                    key: "system.$traits.swung",
                    mode: 5,
                    value: "true",
                    priority: null,
                });
            }

            if (traits.bleed) {
                effect.changes.push({
                    key: "system.$traits.extraBleedRisk",
                    mode: 5,
                    value: "true",
                    priority: null,
                });
            }

            if (traits.twoHandLen) {
                effect.changes.push({
                    key: "system.$traits.twoHandLen",
                    mode: 5,
                    value: "true",
                    priority: null,
                });
            }

            if (traits.noStrMod) {
                effect.changes.push({
                    key: "system.$traits.noStrMod",
                    mode: 5,
                    value: "true",
                    priority: null,
                });
            }

            if (traits.halfImpact) {
                effect.changes.push({
                    key: "system.$traits.halfImpact",
                    mode: 5,
                    value: "true",
                    priority: null,
                });
            }

            if (traits.durMod) {
                effect.changes.push({
                    key: "mod:system.$durability",
                    mode: 2,
                    value: traits.durMod.toString(),
                    priority: null,
                });
            }

            if (traits.blockSLMod) {
                effect.changes.push({
                    key: "system.$defense.block.successLevelMod",
                    mode: 2,
                    value: traits.blockSLMod.toString(),
                    priority: null,
                });
            }

            if (traits.cxSLMod) {
                effect.changes.push({
                    key: "system.$defense.counterstrike.successLevelMod",
                    mode: 2,
                    value: traits.cxSLMod.toString(),
                    priority: null,
                });
            }

            if (traits.noAttack) {
                effect.changes.push({
                    key: "system.$traits.noAttack",
                    mode: 5,
                    value: "true",
                    priority: null,
                });
            }
            if (traits.noBlock) {
                effect.changes.push({
                    key: "system.$traits.noBlock",
                    mode: 5,
                    value: "true",
                    priority: null,
                });
            }

            if (traits.lowAim) {
                effect.changes.push({
                    key: "system.$traits.lowAim",
                    mode: 5,
                    value: "true",
                    priority: null,
                });
            }
            sm.effects.push(effect);
            sm.sort = (weapon.system.nestedItems.length + 1) * 100000;
            weapon.system.nestedItems.push(sm);
        }

        for (const weaponid of weapons.keys()) {
            if (!weaponid) continue;
            const weapongear = weapons.get(weaponid);
            let fname =
                `${unidecode(weapongear.name)}_${weapongear.id}`.replace(
                    /[^0-9a-zA-Z]+/g,
                    "_",
                ) + ".json";
            let outputPath = path.join(this.outputDir, fname);

            fs.writeFileSync(
                outputPath,
                JSON.stringify(weapongear, null, 2),
                "utf8",
            );
        }
    }

    async processFolders() {
        const filePath = path.join(this.dataDir, "folders.yaml");
        const data = yaml.parse(fs.readFileSync(filePath, "utf8"));

        for (const folder of data) {
            log.debug(`Processing Folder ${folder.name}`);
            let fname =
                `folder_${unidecode(folder.name)}_${folder.id}`.replace(
                    /[^0-9a-zA-Z]+/g,
                    "_",
                ) + ".json";
            let outputPath = path.join(this.outputDir, fname);

            const outputData = {
                name: folder.name,
                sorting: "a",
                folder: folder.parentFolderId || null,
                type: "Item",
                _id: folder.id,
                sort: 0,
                color: folder.color,
                flags: folder.flags || {},
                _stats: stats,
                _key: `!folders!${folder.id}`,
            };

            fs.writeFileSync(
                outputPath,
                JSON.stringify(outputData, null, 2),
                "utf8",
            );
        }
    }

    async compile() {
        await this.processMiscGear();
        await this.processContainerGear();
        await this.processConcoctionGear();
        await this.processArmorGear();
        await this.processProjectileGear();
        await this.processWeaponGear();
        await this.processFolders();
    }
}
