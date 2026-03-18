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

import {
    SohlActor,
    SohlActorSheetBase,
} from "@src/common/actor/foundry/SohlActor";
import { callHook as fvttCallHook } from "@src/common/core/foundry-helpers";
import { ITEM_KIND, TRAIT_INTENSITY } from "@src/utils/constants";
import type { SohlItem } from "@src/common/item/foundry/SohlItem";
import { enrichHTML as fvttEnrichHTML } from "@src/common/core/foundry-helpers";
import type { BeingLogic } from "@src/common/actor/logic/BeingLogic";

type RenderContext =
    foundry.applications.api.DocumentSheetV2.RenderContext<SohlActor>;
type RenderOptions = foundry.applications.api.DocumentSheetV2.RenderOptions;

export abstract class BeingSheet extends SohlActorSheetBase {
    static override DEFAULT_OPTIONS = {
        classes: ["being"],
        window: {
            resizable: true,
        },
        position: { width: 900, height: 640 },
        dragDrop: [
            {
                dragSelector: ".item-list .item",
                dropSelector: null,
            },
        ],
    };

    /* -------------------------------------------- */
    /*  Part Context Dispatcher                     */
    /* -------------------------------------------- */

    async _preparePartContext(
        partId: string,
        context: RenderContext,
        options: RenderOptions,
    ): Promise<RenderContext> {
        const type = this.document.type;
        switch (partId) {
            case "header":
                context = await this._prepareHeaderContext(context, options);
                fvttCallHook(
                    `sohl.actor.${type}.prepareHeaderContext`,
                    this,
                    context,
                );
                return context;
            case "tabs":
                context = await this._prepareTabsContext(context, options);
                return context;
            case "facade":
                context = await this._prepareFacadeContext(context, options);
                fvttCallHook(
                    `sohl.actor.${type}.prepareFacadeContext`,
                    this,
                    context,
                );
                return context;
            case "profile":
                context = await this._prepareProfileContext(context, options);
                fvttCallHook(
                    `sohl.actor.${type}.prepareProfileContext`,
                    this,
                    context,
                );
                return context;
            case "skills":
                context = await this._prepareSkillsContext(context, options);
                fvttCallHook(
                    `sohl.actor.${type}.prepareSkillsContext`,
                    this,
                    context,
                );
                return context;
            case "combat":
                context = await this._prepareCombatContext(context, options);
                fvttCallHook(
                    `sohl.actor.${type}.prepareCombatContext`,
                    this,
                    context,
                );
                return context;
            case "trauma":
                context = await this._prepareTraumaContext(context, options);
                fvttCallHook(
                    `sohl.actor.${type}.prepareTraumaContext`,
                    this,
                    context,
                );
                return context;
            case "mysteries":
                context = await this._prepareMysteriesContext(context, options);
                fvttCallHook(
                    `sohl.actor.${type}.prepareMysteriesContext`,
                    this,
                    context,
                );
                return context;
            case "gear":
                context = await this._prepareGearContext(context, options);
                fvttCallHook(
                    `sohl.actor.${type}.prepareGearContext`,
                    this,
                    context,
                );
                return context;
            case "actions":
                context = await this._prepareActionsContext(context, options);
                fvttCallHook(
                    `sohl.actor.${type}.prepareActionsContext`,
                    this,
                    context,
                );
                return context;
            case "effects":
                context = await this._prepareEffectsContext(context, options);
                fvttCallHook(
                    `sohl.actor.${type}.prepareEffectsContext`,
                    this,
                    context,
                );
                return context;
            default:
                return context;
        }
    }

    /* -------------------------------------------- */
    /*  Context Preparation Methods                 */
    /* -------------------------------------------- */

    /** Prepare context for the sheet header: name, image, health, status effects, body parts. */
    async _prepareHeaderContext(
        context: RenderContext,
        _options: RenderOptions,
    ): Promise<RenderContext> {
        const actor = this.document;
        const logic = actor.logic as BeingLogic;

        // Status effects: check which ones are active
        const statuses = (actor as any).statuses ?? new Set<string>();
        const statusEffects = {
            auralShock: statuses.has("auralShock"),
            sleep: statuses.has("sleep"),
            prone: statuses.has("prone"),
            stunned: statuses.has("stunned"),
            incapacitated: statuses.has("incapacitated"),
            unconscious: statuses.has("unconscious"),
            dead: statuses.has("dead"),
        };

        // Body parts with injury state
        const bodyParts = (actor.allItemTypes[ITEM_KIND.BODYPART] ?? []).map(
            (item: SohlItem) => ({
                id: item.id,
                name: item.name,
                item,
            }),
        );

        return Object.assign(context, {
            actorName: actor.name,
            actorImg: actor.img,
            health: logic?.health,
            shockState: logic?.shockState,
            statusEffects,
            bodyParts,
        });
    }

    /** Prepare context for the Tabs navigation. */
    async _prepareTabsContext(
        context: RenderContext,
        _options: RenderOptions,
    ): Promise<RenderContext> {
        return context;
    }

    /** Prepare context for the Facade tab: bio image and description. */
    async _prepareFacadeContext(
        context: RenderContext,
        _options: RenderOptions,
    ): Promise<RenderContext> {
        const system = this.document.system as any;
        return Object.assign(context, {
            bioImage: system.bioImage,
            descriptionHTML: await fvttEnrichHTML(system.description ?? ""),
        });
    }

    /** Prepare context for the Profile tab: attributes, traits, affiliations, biography. */
    async _prepareProfileContext(
        context: RenderContext,
        _options: RenderOptions,
    ): Promise<RenderContext> {
        const actor = this.document;
        const traits = actor.allItemTypes[ITEM_KIND.TRAIT] ?? [];

        // Separate attributes (intensity === "attribute") from other traits
        const attributes: SohlItem[] = [];
        const traitGroups: StrictObject<SohlItem[]> = {};

        for (const trait of traits) {
            const data = trait.system as any;
            if (data.intensity === TRAIT_INTENSITY.ATTRIBUTE) {
                attributes.push(trait);
            } else {
                const subType = data.subType ?? "other";
                (traitGroups[subType] ??= []).push(trait);
            }
        }

        const affiliations = actor.allItemTypes[ITEM_KIND.AFFILIATION] ?? [];

        const system = this.document.system as any;
        return Object.assign(context, {
            attributes,
            traitGroups,
            affiliations,
            biographyHTML: await fvttEnrichHTML(system.biography ?? ""),
        });
    }

    /** Prepare context for the Skills tab: skills grouped by subType. */
    async _prepareSkillsContext(
        context: RenderContext,
        _options: RenderOptions,
    ): Promise<RenderContext> {
        const skills = this.document.allItemTypes[ITEM_KIND.SKILL] ?? [];
        const skillGroups: StrictObject<SohlItem[]> = {};

        for (const skill of skills) {
            const subType = (skill.system as any).subType ?? "other";
            (skillGroups[subType] ??= []).push(skill);
        }

        // Sort skills within each group by name
        for (const group of Object.values(skillGroups)) {
            group.sort((a: SohlItem, b: SohlItem) =>
                a.name.localeCompare(b.name),
            );
        }

        return Object.assign(context, { skillGroups });
    }

    /**
     * Prepare context for the Combat tab: weapons with strike modes,
     * combat techniques, and the full body anatomy structure.
     */
    async _prepareCombatContext(
        context: RenderContext,
        _options: RenderOptions,
    ): Promise<RenderContext> {
        const actor = this.document;

        // Equipped weapons with their nested strike modes
        const weapons = actor.allItemTypes[ITEM_KIND.WEAPONGEAR] ?? [];
        const meleeWeapons: any[] = [];
        const missileWeapons: any[] = [];

        for (const weapon of weapons) {
            if (!(weapon.system as any).isEquipped) continue;

            const meleeStrikeModes: SohlItem[] = [];
            const missileStrikeModes: SohlItem[] = [];

            // Find nested strike modes
            for (const item of actor.allItems.values()) {
                if ((item.system as any).nestedIn !== weapon.id) continue;
                if (item.type === ITEM_KIND.MELEEWEAPONSTRIKEMODE) {
                    meleeStrikeModes.push(item);
                } else if (item.type === ITEM_KIND.MISSILEWEAPONSTRIKEMODE) {
                    missileStrikeModes.push(item);
                }
            }

            if (meleeStrikeModes.length > 0) {
                meleeWeapons.push({
                    weapon,
                    strikeModes: meleeStrikeModes,
                });
            }
            if (missileStrikeModes.length > 0) {
                missileWeapons.push({
                    weapon,
                    strikeModes: missileStrikeModes,
                });
            }
        }

        // Combat techniques
        const combatTechniques =
            actor.allItemTypes[ITEM_KIND.COMBATTECHNIQUESTRIKEMODE] ?? [];

        // Body anatomy hierarchy: zones → parts → locations
        const bodyZones = (actor.allItemTypes[ITEM_KIND.BODYZONE] ?? []).map(
            (zone: SohlItem) => {
                const parts = (
                    actor.allItemTypes[ITEM_KIND.BODYPART] ?? []
                ).filter(
                    (part: SohlItem) =>
                        (part.system as any).nestedIn === zone.id,
                );

                return {
                    zone,
                    parts: parts.map((part: SohlItem) => {
                        const locations = (
                            actor.allItemTypes[ITEM_KIND.BODYLOCATION] ?? []
                        ).filter(
                            (loc: SohlItem) =>
                                (loc.system as any).nestedIn === part.id,
                        );
                        return { part, locations };
                    }),
                };
            },
        );

        return Object.assign(context, {
            meleeWeapons,
            missileWeapons,
            combatTechniques,
            bodyZones,
        });
    }

    /** Prepare context for the Trauma tab: injuries and afflictions. */
    async _prepareTraumaContext(
        context: RenderContext,
        _options: RenderOptions,
    ): Promise<RenderContext> {
        const actor = this.document;
        const logic = actor.logic as BeingLogic;

        const injuries = actor.allItemTypes[ITEM_KIND.INJURY] ?? [];
        const afflictions = actor.allItemTypes[ITEM_KIND.AFFLICTION] ?? [];

        // Group afflictions by subType
        const afflictionGroups: StrictObject<SohlItem[]> = {};
        for (const affliction of afflictions) {
            const subType = (affliction.system as any).subType ?? "other";
            (afflictionGroups[subType] ??= []).push(affliction);
        }

        return Object.assign(context, {
            injuries,
            afflictionGroups,
            shockState: logic?.shockState,
        });
    }

    /**
     * Prepare context for the Mysteries tab: mysteries, mystical abilities,
     * philosophies, and domains.
     */
    async _prepareMysteriesContext(
        context: RenderContext,
        _options: RenderOptions,
    ): Promise<RenderContext> {
        const actor = this.document;

        // Mysteries grouped by subType
        const mysteries = actor.allItemTypes[ITEM_KIND.MYSTERY] ?? [];
        const mysteryGroups: StrictObject<SohlItem[]> = {};
        for (const mystery of mysteries) {
            const subType = (mystery.system as any).subType ?? "other";
            (mysteryGroups[subType] ??= []).push(mystery);
        }

        // Mystical abilities grouped by subType
        const abilities = actor.allItemTypes[ITEM_KIND.MYSTICALABILITY] ?? [];
        const abilityGroups: StrictObject<SohlItem[]> = {};
        for (const ability of abilities) {
            const subType = (ability.system as any).subType ?? "other";
            (abilityGroups[subType] ??= []).push(ability);
        }

        // Philosophies with their associated domains
        const philosophies = actor.allItemTypes[ITEM_KIND.PHILOSOPHY] ?? [];
        const domains = actor.allItemTypes[ITEM_KIND.DOMAIN] ?? [];

        const philosophyEntries = philosophies.map((philosophy: SohlItem) => {
            const assocDomains = domains.filter(
                (d: SohlItem) =>
                    (d.system as any).philosophyCode ===
                    (philosophy.system as any).shortcode,
            );
            return { philosophy, domains: assocDomains };
        });

        // Mystical devices
        const mysticalDevices =
            actor.allItemTypes[ITEM_KIND.MYSTICALDEVICE] ?? [];

        return Object.assign(context, {
            mysteryGroups,
            abilityGroups,
            philosophyEntries,
            mysticalDevices,
        });
    }

    /**
     * Prepare context for the Gear tab: containers with nested items
     * and encumbrance totals.
     */
    async _prepareGearContext(
        context: RenderContext,
        _options: RenderOptions,
    ): Promise<RenderContext> {
        const actor = this.document;

        // Build container hierarchy
        const containers: any[] = [];
        const containerGear = actor.allItemTypes[ITEM_KIND.CONTAINERGEAR] ?? [];

        // Virtual "On Body" container for ungrouped gear
        const onBodyItems: SohlItem[] = [];

        // Collect all gear items
        const gearTypes = [
            ITEM_KIND.ARMORGEAR,
            ITEM_KIND.WEAPONGEAR,
            ITEM_KIND.MISCGEAR,
            ITEM_KIND.CONCOCTIONGEAR,
            ITEM_KIND.PROJECTILEGEAR,
            ITEM_KIND.CONTAINERGEAR,
        ];
        const allGear: SohlItem[] = [];
        for (const type of gearTypes) {
            allGear.push(...(actor.allItemTypes[type] ?? []));
        }

        // Sort gear into containers
        const containerIds = new Set(containerGear.map((c: SohlItem) => c.id));
        for (const gear of allGear) {
            const nestedIn = (gear.system as any).nestedIn;
            if (nestedIn && containerIds.has(nestedIn)) continue; // handled by container
            if (!nestedIn || !containerIds.has(nestedIn)) {
                onBodyItems.push(gear);
            }
        }

        // Build each container's content list
        for (const container of containerGear) {
            const items = allGear.filter(
                (g: SohlItem) => (g.system as any).nestedIn === container.id,
            );
            items.sort((a: SohlItem, b: SohlItem) =>
                a.name.localeCompare(b.name),
            );
            containers.push({ container, items });
        }

        onBodyItems.sort((a: SohlItem, b: SohlItem) =>
            a.name.localeCompare(b.name),
        );

        return Object.assign(context, {
            containers,
            onBodyItems,
        });
    }

    /** Prepare context for the Actions tab: actor-level actions. */
    async _prepareActionsContext(
        context: RenderContext,
        _options: RenderOptions,
    ): Promise<RenderContext> {
        const actions = this.document.logic?.actions ?? [];
        return Object.assign(context, { actions });
    }

    /** Prepare context for the Effects tab: own and transferred effects. */
    async _prepareEffectsContext(
        context: RenderContext,
        _options: RenderOptions,
    ): Promise<RenderContext> {
        const effects = (this.document as any).effects?.contents ?? [];
        const trxEffects: PlainObject = {};
        const transferredEffects = (this.document as any).transferredEffects;
        if (transferredEffects) {
            for (const effect of transferredEffects) {
                if (!effect.disabled) {
                    trxEffects[effect.id] = effect;
                }
            }
        }
        return Object.assign(context, { effects, trxEffects });
    }
}
