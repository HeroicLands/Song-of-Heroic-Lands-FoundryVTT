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
} from "@src/document/actor/foundry/SohlActor";
import { fvttCallHook, fvttEnrichHTML } from "@src/core/FoundryHelpers";
import { ITEM_KIND, TRAIT_INTENSITY } from "@src/utils/constants";
import type { SohlItem } from "@src/document/item/foundry/SohlItem";
import type { BeingLogic } from "@src/document/actor/logic/BeingLogic";

type RenderContext =
    foundry.applications.api.DocumentSheetV2.RenderContext<SohlActor>;
type RenderOptions = foundry.applications.api.DocumentSheetV2.RenderOptions;

export class BeingSheet extends SohlActorSheetBase {
    static PARTS = {
        header: {
            id: "header",
            template: "systems/sohl/templates/actor/being/header.hbs",
        },
        tabs: {
            id: "tabs",
            template: "systems/sohl/templates/actor/being/tabs.hbs",
        },
        facade: {
            id: "facade",
            template: "systems/sohl/templates/actor/parts/facade.hbs",
        },
        profile: {
            id: "profile",
            template: "systems/sohl/templates/actor/being/profile.hbs",
        },
        skills: {
            id: "skills",
            template: "systems/sohl/templates/actor/being/skills.hbs",
        },
        combat: {
            id: "combat",
            template: "systems/sohl/templates/actor/being/combat.hbs",
        },
        trauma: {
            id: "trauma",
            template: "systems/sohl/templates/actor/being/trauma.hbs",
        },
        mysteries: {
            id: "mysteries",
            template: "systems/sohl/templates/actor/being/mysteries.hbs",
        },
        gear: {
            id: "gear",
            template: "systems/sohl/templates/actor/parts/gear.hbs",
        },
        actions: {
            id: "actions",
            template: "systems/sohl/templates/actor/parts/actions.hbs",
        },
        effects: {
            id: "effects",
            template: "systems/sohl/templates/actor/parts/effects.hbs",
        },
    } as const;

    static TABS = {
        primary: {
            initial: "facade",
            tabs: [
                {
                    id: "facade",
                    label: "SOHL.Actor.SHEET.tab.facade.label",
                    tooltip: "SOHL.Actor.SHEET.tab.facade.tooltip",
                    icon: "fas fa-masks-theater",
                },
                {
                    id: "profile",
                    label: "SOHL.Actor.SHEET.tab.profile.label",
                    tooltip: "SOHL.Actor.SHEET.tab.profile.tooltip",
                    icon: "fas fa-user",
                },
                {
                    id: "skills",
                    label: "SOHL.Actor.SHEET.tab.skills.label",
                    tooltip: "SOHL.Actor.SHEET.tab.skills.tooltip",
                    icon: "fas fa-book",
                },
                {
                    id: "combat",
                    label: "SOHL.Actor.SHEET.tab.combat.label",
                    tooltip: "SOHL.Actor.SHEET.tab.combat.tooltip",
                    icon: "fas fa-sword",
                },
                {
                    id: "trauma",
                    label: "SOHL.Actor.SHEET.tab.trauma.label",
                    tooltip: "SOHL.Actor.SHEET.tab.trauma.tooltip",
                    icon: "fas fa-heartbeat",
                },
                {
                    id: "mysteries",
                    label: "SOHL.Actor.SHEET.tab.mysteries.label",
                    tooltip: "SOHL.Actor.SHEET.tab.mysteries.tooltip",
                    icon: "fas fa-sparkles",
                },
                {
                    id: "gear",
                    label: "SOHL.Actor.SHEET.tab.gear.label",
                    tooltip: "SOHL.Actor.SHEET.tab.gear.tooltip",
                    icon: "fas fa-briefcase",
                },
                {
                    id: "actions",
                    label: "SOHL.Actor.SHEET.tab.actions.label",
                    tooltip: "SOHL.Actor.SHEET.tab.actions.tooltip",
                    icon: "fas fa-cogs",
                },
                {
                    id: "effects",
                    label: "SOHL.Actor.SHEET.tab.effects.label",
                    tooltip: "SOHL.Actor.SHEET.tab.effects.tooltip",
                    icon: "fas fa-bolt",
                },
            ],
        },
    };

    override _configureRenderOptions(
        options: Partial<foundry.applications.api.HandlebarsApplicationMixin.RenderOptions>,
    ): void {
        super._configureRenderOptions(options);

        options.parts = ["header", "tabs", "facade"];

        // Don't show the other tabs if only limited view
        if ((this.document as any).limited) return;

        options.parts.push(
            "profile",
            "skills",
            "combat",
            "trauma",
            "mysteries",
            "gear",
            "actions",
            "effects",
        );
    }

    protected _filters: foundry.applications.ux.SearchFilter[] = [
        new foundry.applications.ux.SearchFilter({
            inputSelector: 'input[name="search-traits"]',
            contentSelector: ".traits",
            callback: this._displayFilteredResults.bind(this),
        }),
        new foundry.applications.ux.SearchFilter({
            inputSelector: 'input[name="search-skills"]',
            contentSelector: ".skills",
            callback: this._displayFilteredResults.bind(this),
        }),
        new foundry.applications.ux.SearchFilter({
            inputSelector: 'input[name="search-bodylocations"]',
            contentSelector: ".bodylocations-list",
            callback: this._displayFilteredResults.bind(this),
        }),
        new foundry.applications.ux.SearchFilter({
            inputSelector: 'input[name="search-afflictions"]',
            contentSelector: ".afflictions-list",
            callback: this._displayFilteredResults.bind(this),
        }),
        new foundry.applications.ux.SearchFilter({
            inputSelector: 'input[name="search-mysteries"]',
            contentSelector: ".mysteries-list",
            callback: this._displayFilteredResults.bind(this),
        }),
        new foundry.applications.ux.SearchFilter({
            inputSelector: 'input[name="search-mysticalabilities"]',
            contentSelector: ".mysticalabilities-list",
            callback: this._displayFilteredResults.bind(this),
        }),
        new foundry.applications.ux.SearchFilter({
            inputSelector: 'input[name="search-gear"]',
            contentSelector: ".gear-list",
            callback: this._displayFilteredResults.bind(this),
        }),
        new foundry.applications.ux.SearchFilter({
            inputSelector: 'input[name="search-effects"]',
            contentSelector: ".effects-list",
            callback: this._displayFilteredResults.bind(this),
        }),
    ];

    async _onRender(
        context: foundry.applications.api.DocumentSheetV2.RenderContext<SohlActor>,
        options: foundry.applications.api.DocumentSheetV2.RenderOptions,
    ): Promise<void> {
        super._onRender(context, options);

        // Rebind all search filters
        this._filters.forEach((filter) => filter.bind((this as any).element));
    }

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

        return Object.assign(context, {
            actorName: actor.name,
            actorImg: actor.img,
            health: logic?.health,
            shockState: logic?.shockState,
            statusEffects,
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
        const traits = actor.itemTypes[ITEM_KIND.TRAIT] ?? [];

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

        const affiliations = actor.itemTypes[ITEM_KIND.AFFILIATION] ?? [];

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
        const skills = this.document.itemTypes[ITEM_KIND.SKILL] ?? [];
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
        const logic = actor.logic as BeingLogic;

        // Weapons with their strike mode domain objects
        const weapons = actor.itemTypes[ITEM_KIND.WEAPONGEAR] ?? [];
        const meleeWeapons: any[] = [];
        const missileWeapons: any[] = [];

        for (const weapon of weapons) {
            const weaponLogic = weapon.logic as any;
            const allModes = weaponLogic?.strikeModes ?? [];
            const melee = allModes.filter((sm: any) => sm.isMelee);
            const missile = allModes.filter((sm: any) => sm.isMissile);
            if (melee.length > 0) {
                meleeWeapons.push({ weapon, strikeModes: melee });
            }
            if (missile.length > 0) {
                missileWeapons.push({ weapon, strikeModes: missile });
            }
        }

        // Combat techniques with their strike mode domain objects
        const combatTechniques = (
            actor.itemTypes[ITEM_KIND.COMBATTECHNIQUE] ?? []
        ).map((ct: SohlItem) => ({
            item: ct,
            strikeModes: (ct.logic as any)?.strikeModes ?? [],
        }));

        // Body structure for anatomy display
        const bodyStructure = logic?.bodyStructure;

        return Object.assign(context, {
            meleeWeapons,
            missileWeapons,
            combatTechniques,
            bodyStructure,
        });
    }

    /** Prepare context for the Trauma tab: injuries and afflictions. */
    async _prepareTraumaContext(
        context: RenderContext,
        _options: RenderOptions,
    ): Promise<RenderContext> {
        const actor = this.document;
        const logic = actor.logic as BeingLogic;

        const injuries = actor.itemTypes[ITEM_KIND.INJURY] ?? [];
        const afflictions = actor.itemTypes[ITEM_KIND.AFFLICTION] ?? [];

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
     * Prepare context for the Mysteries tab: mysteries, mystical abilities.
     */
    async _prepareMysteriesContext(
        context: RenderContext,
        _options: RenderOptions,
    ): Promise<RenderContext> {
        const actor = this.document;

        // Mysteries grouped by subType
        const mysteries = actor.itemTypes[ITEM_KIND.MYSTERY] ?? [];
        const mysteryGroups: StrictObject<SohlItem[]> = {};
        for (const mystery of mysteries) {
            const subType = (mystery.system as any).subType ?? "other";
            (mysteryGroups[subType] ??= []).push(mystery);
        }

        // Mystical abilities grouped by subType
        const abilities = actor.itemTypes[ITEM_KIND.MYSTICALABILITY] ?? [];
        const abilityGroups: StrictObject<SohlItem[]> = {};
        for (const ability of abilities) {
            const subType = (ability.system as any).subType ?? "other";
            (abilityGroups[subType] ??= []).push(ability);
        }

        return Object.assign(context, {
            mysteryGroups,
            abilityGroups,
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
        const containerGear = actor.itemTypes[ITEM_KIND.CONTAINERGEAR] ?? [];

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
            allGear.push(...(actor.itemTypes[type] ?? []));
        }

        const containerIds = new Set(
            containerGear.map((c: SohlItem) => c.id),
        );

        // Build a map of containerId → items inside that container
        const containerContents = new Map<string, SohlItem[]>();
        for (const item of allGear) {
            const containerId = (item.system as any).containerId;
            if (containerId && containerIds.has(containerId)) {
                const list = containerContents.get(containerId) ?? [];
                list.push(item);
                containerContents.set(containerId, list);
            } else {
                // Not in any container — goes to "On Body"
                onBodyItems.push(item);
            }
        }

        // Build container entries with their contents
        for (const container of containerGear) {
            containers.push({
                container,
                items: containerContents.get(container.id!) ?? [],
            });
        }

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
