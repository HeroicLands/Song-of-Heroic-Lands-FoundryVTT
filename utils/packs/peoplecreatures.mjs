/*
 * This file is part of the Song of Heroic Lands (SoHL) system for Foundry VTT.
 * Copyright (c) 2024-2026 Tom Rodriguez ("Toasty") — <toasty@heroiclands.com>
 *
 * This work is licensed under the GNU General Public License v3.0 (GPLv3).
 * You may copy, modify, and distribute it under the terms of that license.
 *
 * For full terms, see the LICENSE.md file in the project root or visit:
 * https://www.gnu.org/licenses/gpl-3.0.html
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

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

export class PeopleCreatures {
    static items = [];
    static id = "characters";

    constructor(dataDir, outputDir) {
        Object.defineProperty(this, "dataDir", {
            value: dataDir,
            writable: false,
        });
        Object.defineProperty(this, "outputDir", {
            value: outputDir,
            writable: false,
        });

        Object.defineProperty(this, "items", {
            value: PeopleCreatures.loadItems(),
            writable: false,
        });
    }

    static loadItems() {
        const baseDir = "packs";
        const packs = ["characteristics", "mysteries", "possessions"];

        for (const pack of packs) {
            const dirPath = path.join(baseDir, pack, "_source");
            try {
                const files = fs.readdirSync(dirPath);
                for (const file of files) {
                    const filePath = path.join(dirPath, file);
                    if (file.endsWith(".json")) {
                        try {
                            const data = fs.readFileSync(filePath, "utf8");
                            const json = JSON.parse(data);
                            if (json.shortcode && json.type) {
                                
                            }
                            this.items.push(json);
                        } catch (err) {
                            log.error(
                                `Error reading or parsing ${filePath}:`,
                                err.message,
                            );
                        }
                    }
                }
            } catch (err) {
                log.error(`Error reading directory ${dirPath}:`, err.message);
            }
        }

        return this.items;
    }

    getItem(name, type) {
        return this.items.find(
            (item) => item.name === name && item.type === type,
        );
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

    async processCharacters() {
        const filePath = path.join(this.dataDir, "characters.yaml");
        if (!fs.existsSync(filePath)) {
            log.warn(`File does not exist, skipping characters: ${filePath}`);
            return;
        }
        const data = yaml.parse(fs.readFileSync(filePath, "utf8"));

        for (const character of data) {
            log.debug(`Processing Character ${character.name}`);
            let fname =
                `${unidecode(character.name)}_${character.id}`.replace(
                    /[^0-9a-zA-Z]+/g,
                    "_",
                ) + ".json";
            let outputPath = path.join(this.outputDir, fname);

            const outputData = PeopleCreatures.mergeObject(character, {
                system: {
                },
                items: [],
                _stats: stats,
                ownership: { default: 0 },
                _key: `!items!${character.id}`,
            });
            for (const item of character.items) {
                const itemData = this.getItem(item.name, item.type);
                if (itemData) {
                    itemData._key = `!actors.items!{character.id}.{itemData.id}`;
                    outputData.items.push(itemData);
                }
            }

            fs.writeFileSync(
                outputPath,
                JSON.stringify(outputData, null, 2),
                "utf8",
            );
        }
    }

    async processCreatures() {
        const filePath = path.join(this.dataDir, "creatures.yaml");
        if (!fs.existsSync(filePath)) {
            log.warn(`File does not exist, skipping creatures: ${filePath}`);
            return;
        }
        const data = yaml.parse(fs.readFileSync(filePath, "utf8"));

        for (const creature of data) {
            log.debug(`Processing Creature ${creature.name}`);
            let fname =
                `${unidecode(creature.name)}_${creature.id}`.replace(
                    /[^0-9a-zA-Z]+/g,
                    "_",
                ) + ".json";
            let outputPath = path.join(this.outputDir, fname);

            const outputData = PeopleCreatures.mergeObject(creature, {
                system: {
                },
                items: [],
                _stats: stats,
                ownership: { default: 0 },
                _key: `!items!${creature.id}`,
            });
            for (const item of creature.items) {
                const itemData = this.getItem(item.name, item.type);
                if (itemData) {
                    itemData._key = `!actors.items!{creature.id}.{itemData.id}`;
                    outputData.items.push(itemData);
                }
            }

            fs.writeFileSync(
                outputPath,
                JSON.stringify(outputData, null, 2),
                "utf8",
            );
        }
    }

    async processCohorts() {
        const filePath = path.join(this.dataDir, "cohorts.yaml");
        if (!fs.existsSync(filePath)) {
            log.warn(`File does not exist, skipping cohorts: ${filePath}`);
            return;
        }
        const data = yaml.parse(fs.readFileSync(filePath, "utf8"));

        for (const cohort of data) {
            log.debug(`Processing Cohort ${cohort.name}`);
            let fname =
                `${unidecode(cohort.name)}_${cohort.id}`.replace(
                    /[^0-9a-zA-Z]+/g,
                    "_",
                ) + ".json";
            let outputPath = path.join(this.outputDir, fname);

            const outputData = {
                name: cohort.name,
                type: "cohort",
                img: cohort.img,
                _id: cohort.id,
                system: {
                    bioImage: cohort.bioImage,
                    description: cohort.description,
                    biography: cohort.biography,
                    textReference: cohort.textReference,
                    leader: cohort.leader,
                    moveRep: cohort.moveRep,
                    members: cohort.members,
                    defaultReaction: cohort.defaultReaction,
                    reactions: cohort.reactions,
                },
                items: [],
                effects: [],
                flags: cohort.flags || {},
                _stats: stats,
                ownership: { default: 0 },
                folder: cohort.folderId || null,
                _key: `!actors!${cohort.id}`,
            };

            for (const item of cohort.items) {
                const itemData = this.getItem(item.name, item.type);
                if (itemData) {
                    itemData._key = `!actors.items!{cohort.id}.{itemData.id}`;
                    outputData.items.push(itemData);
                }
            }

            fs.writeFileSync(
                outputPath,
                JSON.stringify(outputData, null, 2),
                "utf8",
            );
        }
    }

    async processFolders() {
        const filePath = path.join(this.dataDir, "folders.yaml");
        if (!fs.existsSync(filePath)) {
            log.warn(`File does not exist, skipping folders: ${filePath}`);
            return;
        }
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
        await this.processCreatures();
        await this.processCohorts();
        await this.processCharacters();
        await this.processFolders();
    }
}
