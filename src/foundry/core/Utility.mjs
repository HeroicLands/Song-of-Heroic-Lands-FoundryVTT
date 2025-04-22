/*
 * This file is part of the Song of Heroic Lands (SoHL) system for Foundry VTT.
 * Copyright (c) 2024-2025 Tom Rodriguez ("Toasty") — <toasty@heroiclands.com>
 *
 * This work is licensed under the GNU General Public License v3.0 (GPLv3).
 * You may copy, modify, and distribute it under the terms of that license.
 *
 * For full terms, see the LICENSE.md file in the project root or visit:
 * https://www.gnu.org/licenses/gpl-3.0.html
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

/**
 * @typedef {Object} GetActorResult
 * @property {SohlItem|null} item
 * @property {SohlActor|null} actor
 * @property {Object} speaker
 */

/**
 * Utility class containing various helper methods for the SoHL system.
 */
export class Utility {
    /**
     * Determines the identity of the current token/actor that is in combat.
     * If token is specified, tries to use token (and will allow it regardless if user is GM.),
     * otherwise returned token will be the combatant whose turn it currently is.
     *
     * @param {Token|null} [token=null] - The token to check.
     * @param {boolean} [forceAllow=false] - Whether to force allow the token.
     * @returns {{ token: Token, actor: Actor }|null} The token and actor in combat, or null if not found.
     */
    static getTokenInCombat(token = null, forceAllow = false) {
        if (token && (game.user.isGM || forceAllow)) {
            return { token, actor: token.actor };
        }

        if (!game.combat?.started) {
            ui.notifications.warn("No active combat.");
            return null;
        }

        if (game.combat.combatants.size === 0) {
            ui.notifications.warn(`No combatants.`);
            return null;
        }

        const combatant = game.combat.combatant;

        if (combatant.isDefeated) {
            ui.notifications.warn(
                `Combatant ${combatant.token.name} has been defeated`,
            );
            return null;
        }

        if (token && token.id !== combatant.token.id) {
            ui.notifications.warn(
                `${combatant.token.name} is not the current combatant`,
            );
            return null;
        }

        if (!combatant.actor.isOwner) {
            ui.notifications.warn(
                `You do not have permissions to control the combatant ${combatant.token.name}.`,
            );
            return null;
        }

        token = canvas.tokens.get(combatant.token.id);
        if (!token) {
            throw new Error(`Token ${combatant.token.id} not found on canvas`);
        }

        return { token, actor: combatant.actor };
    }

    /**
     * Gets the user-targeted token.
     *
     * @param {Combatant} combatant - The combatant to check against.
     * @returns {TokenDocument|null} The targeted token document, or null if invalid.
     */
    static getUserTargetedToken(combatant) {
        const targets = game.user.targets;
        if (!targets?.size) {
            ui.notifications.warn(
                `No targets selected, you must select exactly one target, combat aborted.`,
            );
            return null;
        } else if (targets.size > 1) {
            ui.notifications.warn(
                `${targets} targets selected, you must select exactly one target, combat aborted.`,
            );
        }

        const targetTokens = Array.from(targets);
        if (!targetTokens.length) {
            return null;
        }
        const targetTokenDoc = targetTokens[0].document;

        if (combatant?.token && targetTokenDoc.id === combatant.token.id) {
            ui.notifications.warn(
                `You have targetted the combatant, they cannot attack themself, combat aborted.`,
            );
            return null;
        }

        return targetTokenDoc;
    }

    /**
     * Gets the actor based on the provided parameters.
     *
     * @param {Object} [params={}] - The parameters to use.
     * @param {SohlItem} [params.item] - The item to check.
     * @param {SohlActor} [params.actor] - The actor to check.
     * @param {Object} [params.speaker] - The speaker to check.
     * @returns {GetActorResult|null} The actor result, or null if not found.
     */
    static getActor(options = {}) {
        let item = options.item;
        let actor = options.actor;
        let speaker = options.speaker;

        const result = {
            item: null,
            actor: null,
            speaker: {},
        };
        if (item?.actor) {
            result.actor = item.actor;
            result.speaker = ChatMessage.getSpeaker({ actor: result.actor });
        } else {
            if (result.actor instanceof Actor) {
                result.speaker ||= ChatMessage.getSpeaker({
                    actor: result.actor,
                });
            } else {
                if (!result.actor) {
                    result.speaker = ChatMessage.getSpeaker();
                    if (result.speaker?.token) {
                        const token = canvas.tokens.get(result.speaker.token);
                        result.actor = token.actor;
                    } else {
                        result.actor = result.speaker?.actor;
                    }
                    if (!result.actor) {
                        ui.notifications.warn(
                            `No actor selected, roll ignored.`,
                        );
                        return null;
                    }
                } else {
                    result.actor = fromUuidSync(result.actor);
                    result.speaker = ChatMessage.getSpeaker({
                        actor: result.actor,
                    });
                }

                if (!result.actor) {
                    ui.notifications.warn(`No actor selected, roll ignored.`);
                    return null;
                }
            }
        }

        if (!cast(result.actor).isOwner) {
            ui.notifications.warn(
                `You do not have permissions to control ${cast(result.actor).name}.`,
            );
            return null;
        }

        return result;
    }

    /**
     * Calculates the distance from sourceToken to targetToken in "scene" units (e.g., feet).
     *
     * @param {Token|TokenDocument} sourceToken - The source token.
     * @param {Token|TokenDocument} targetToken - The target token.
     * @param {boolean} [gridUnits=false] - Whether to return in grid units.
     * @returns {number|null} The distance, or null if not calculable.
     */
    static rangeToTarget(sourceToken, targetToken, gridUnits = false) {
        sourceToken =
            sourceToken instanceof Token ? sourceToken.document : sourceToken;
        targetToken =
            targetToken instanceof Token ? targetToken.document : targetToken;
        if (!canvas.scene?.grid) {
            ui.notifications.warn(`No scene active`);
            return null;
        }
        if (!gridUnits && !["feet", "ft"].includes(canvas.scene.grid.units)) {
            ui.notifications.warn(
                `Scene uses units of ${canvas.scene.grid.units} but only feet are supported, distance calculation not possible`,
            );
            return 0;
        }

        if (canvas.scene.getFlag("sohl", "isTotm")) return 0;

        const result = canvas.grid.measurePath([
            sourceToken.object.center,
            targetToken.object.center,
        ]);

        return gridUnits ? result.spaces : result.distance;
    }

    /**
     * Returns the single selected token if there is exactly one token selected
     * on the canvas, otherwise issue a warning.
     *
     * @param {Object} [options]
     * @param {boolean} [options.quiet=false] - Suppress warning messages.
     * @returns {TokenDocument|null} The currently selected token, or null if not exactly one selected.
     */
    static getSingleSelectedToken(options = {}) {
        let quiet = options.quiet ?? false;
        const numTargets = canvas.tokens?.controlled?.length;
        if (!numTargets) {
            if (!quiet)
                ui.notifications.warn(`No selected tokens on the canvas.`);
            return null;
        }

        if (numTargets > 1) {
            if (!quiet)
                ui.notifications.warn(
                    `There are ${numTargets} selected tokens on the canvas, please select only one`,
                );
            return null;
        }

        return canvas.tokens.controlled[0].document;
    }

    /**
     * Retrieves documents from specified packs based on document name and type.
     *
     * @param {string[]} packNames - The names of the packs to search.
     * @param {Object} [options]
     * @param {string} [options.documentName="Item"] - The document name to search for.
     * @param {string} [options.docType] - The document type to filter by.
     * @returns {Promise<any[]>} A promise resolving to an array of documents.
     */
    static async getDocsFromPacks(packNames, options = {}) {
        let documentName = options.documentName ?? "Item";
        let docType = options.docType;

        let allDocs = [];
        for (let packName of packNames) {
            const pack = game.packs.get(packName);
            if (!pack) continue;
            if (pack.documentName !== documentName) continue;
            const query = {};
            if (docType) {
                query.type = docType;
            }
            const items = await pack.getDocuments(query);
            allDocs.push(...items.map((it) => it.toObject()));
        }
        return allDocs;
    }

    /**
     * Retrieves a document from specified packs based on name and optional type.
     *
     * @param {string} docName - The name of the document to retrieve.
     * @param {string[]} packNames - The names of the packs to search.
     * @param {Object} [options]
     * @param {string} [options.documentName="Item"] - The document name to search for.
     * @param {string} [options.docType] - The document type to filter by.
     * @param {boolean} [options.keepId=false] - Whether to keep the original ID.
     * @returns {Promise<Object|null>} A promise resolving to the document data, or null if not found.
     */
    static async getDocumentFromPacks(docName, packNames, options = {}) {
        let documentName = options.documentName ?? "Item";
        let docType = options.docType;
        let keepId = options.keepId ?? false;

        let data = null;
        const allDocs = await Utility.getDocsFromPacks(packNames, {
            documentName,
            docType,
        });
        const doc = allDocs?.find((it) => it.name === docName);
        if (doc) {
            data = doc.toObject();
            if (!keepId) data._id = foundry.utils.randomID();
            delete data.folder;
            delete data.sort;
            if (doc.pack)
                foundry.utils.setProperty(
                    data,
                    "_stats.compendiumSource",
                    doc.uuid,
                );
            if ("ownership" in data) {
                data.ownership = {
                    default: CONST.DOCUMENT_OWNERSHIP_LEVELS.OWNER,
                    [game.user.id]: CONST.DOCUMENT_OWNERSHIP_LEVELS.OWNER,
                };
            }
            if (doc.effects) {
                data.effects = doc.effects.contents.map((e) => e.toObject());
            }
        }

        return data;
    }
}
