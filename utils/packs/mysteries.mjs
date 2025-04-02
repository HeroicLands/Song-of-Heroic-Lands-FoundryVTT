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

export class Mysteries {
    static id = "mysteries";

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

    async processPhilosophies() {
        const filePath = path.join(this.dataDir, "philosophies.yaml");
        const data = yaml.parse(fs.readFileSync(filePath, "utf8"));

        for (const phil of data) {
            log.debug(`Processing Philosophy ${phil.name}`);
            let fname =
                `${unidecode(phil.name)}_${phil.id}`.replace(
                    /[^0-9a-zA-Z]+/g,
                    "_",
                ) + ".json";
            let outputPath = path.join(this.outputDir, fname);

            const outputData = {
                name: phil.name,
                type: "philosophy",
                img: phil.img,
                _id: phil.id,
                system: {
                    notes: "",
                    textReference: "",
                    description: phil.description,
                    macros: phil.macros,
                    nestedItems: [],
                    transfer: false,
                    category: phil.category,
                },
                effects: phil.effects || [],
                flags: phil.flags || {},
                _stats: stats,
                ownership: { default: 0 },
                folder: phil.folderId || null,
                _key: `!items!${phil.id}`,
            };

            for (const ni of phil.nestedItems) {
                const nestedItem = {
                    name: ni.name,
                    type: "domain",
                    img: ni.img,
                    _id: ni.id,
                    system: {
                        notes: "",
                        textReference: "",
                        description: ni.description,
                        macros: ni.macros,
                        nestedItems: [],
                        transfer: true,
                        abbrev: ni.abbrev,
                    },
                    effects: ni.effects || [],
                    flags: ni.flags || {},
                    ownership: { default: 0 },
                };
                outputData.system.nestedItems.push(nestedItem);
            }

            fs.writeFileSync(
                outputPath,
                JSON.stringify(outputData, null, 2),
                "utf8",
            );
        }
    }

    async processMysticalAbilities() {
        const filePath = path.join(this.dataDir, "mysticalabilities.yaml");
        const data = yaml.parse(fs.readFileSync(filePath, "utf8"));

        for (const mysticalability of data) {
            log.debug(`Processing Mystical Ability ${mysticalability.name}`);
            let fname =
                `${unidecode(mysticalability.name)}_${mysticalability.id}`.replace(
                    /[^0-9a-zA-Z]+/g,
                    "_",
                ) + ".json";
            let outputPath = path.join(this.outputDir, fname);

            const outputData = {
                name: mysticalability.name,
                type: "mysticalability",
                img: mysticalability.img,
                _id: mysticalability.id,
                system: {
                    subType: mysticalability.subType,
                    notes: "",
                    textReference: "",
                    description: mysticalability.description,
                    macros: mysticalability.macros,
                    nestedItems: [],
                    transfer: false,
                    abbrev: mysticalability.abbrev,
                    skillBaseFormula: mysticalability.skillBaseFormula,
                    masteryLevelBase: 0,
                    improveFlag: false,
                    domain: mysticalability.domain,
                    levelBase: mysticalability.level,
                    charges: {
                        usesCharges: mysticalability.usesCharges,
                        value: mysticalability.chargesValue,
                        max: mysticalability.chargesMax,
                    },
                },
                effects: mysticalability.effects || [],
                flags: mysticalability.flags || {},
                _stats: stats,
                ownership: { default: 0 },
                folder: mysticalability.folderId || null,
                _key: `!items!${mysticalability.id}`,
            };

            fs.writeFileSync(
                outputPath,
                JSON.stringify(outputData, null, 2),
                "utf8",
            );
        }
    }

    async processMysteries() {
        const filePath = path.join(this.dataDir, "mysteries.yaml");
        const data = yaml.parse(fs.readFileSync(filePath, "utf8"));

        for (const mystery of data) {
            log.debug(`Processing Mystery ${mystery.name}`);
            let fname =
                `${unidecode(mystery.name)}_${mystery.id}`.replace(
                    /[^0-9a-zA-Z]+/g,
                    "_",
                ) + ".json";
            let outputPath = path.join(this.outputDir, fname);

            Mysteries.mergeObject(mystery["flags"], {
                sohl: {
                    legendary: {
                        initSkillMult: mystery.initSM,
                        expertiseParentSkill:
                            mystery.expertiseParentSkill || "",
                    },
                },
            });
            const outputData = {
                name: mystery.name,
                type: "mystery",
                img: mystery.img,
                _id: mystery.id,
                system: {
                    subType: mystery.subType,
                    notes: "",
                    textReference: "",
                    description: mystery.description,
                    macros: mystery.macros,
                    nestedItems: [],
                    transfer: false,
                    domain: mystery.domain,
                    skills: mystery.skills,
                    levelBase: mystery.level,
                    charges: {
                        usesCharges: mystery.usesCharges,
                        value: mystery.chargesValue,
                        max: mystery.chargesMax,
                    },
                },
                effects: mystery.effects || [],
                flags: mystery.flags || {},
                _stats: stats,
                ownership: { default: 0 },
                folder: mystery.folderId || null,
                _key: `!items!${mystery.id}`,
            };

            fs.writeFileSync(
                outputPath,
                JSON.stringify(outputData, null, 2),
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
        await this.processPhilosophies();
        await this.processMysticalAbilities();
        await this.processMysteries();
        await this.processFolders();
    }
}
