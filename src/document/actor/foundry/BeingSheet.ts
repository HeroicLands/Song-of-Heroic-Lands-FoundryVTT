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
import {
    ITEM_KIND,
    MOVEMENT_MEDIUM,
    MovementMedium,
    movementMediumLabels,
    STATUS_EFFECT,
    TRAIT_INTENSITY,
} from "@src/utils/constants";
import type { SohlItem } from "@src/document/item/foundry/SohlItem";
import type { BeingLogic } from "@src/document/actor/logic/BeingLogic";
import type { LineageLogic } from "@src/document/item/logic/LineageLogic";
import {
    resolveStrikeModeML,
    resolveStrikeModeImpact,
    buildDamageCardData,
    type StrikeModeTestKind,
} from "@src/document/actor/logic/combat-actions";
import { SohlActionContext } from "@src/core/SohlActionContext";
import { SimpleRoll } from "@src/utils/SimpleRoll";
import { toFilePath } from "@src/utils/helpers";
import { SohlTokenDocument } from "@src/document/token/foundry/SohlTokenDocument";

type RenderContext =
    foundry.applications.api.DocumentSheetV2.RenderContext<SohlActor>;
type RenderOptions = foundry.applications.api.DocumentSheetV2.RenderOptions;

/** @internal */
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

    static override TABS = {
        primary: {
            initial: "facade",
            tabs: [
                {
                    id: "facade",
                    label: "SOHL.Actor.SHEET.tab.facade.label",
                    tooltip: "SOHL.Actor.SHEET.tab.facade.tooltip",
                    icon: "sohl-drama-masks",
                },
                {
                    id: "profile",
                    label: "SOHL.Actor.SHEET.tab.profile.label",
                    tooltip: "SOHL.Actor.SHEET.tab.profile.tooltip",
                    icon: "sohl-person",
                },
                {
                    id: "skills",
                    label: "SOHL.Actor.SHEET.tab.skills.label",
                    tooltip: "SOHL.Actor.SHEET.tab.skills.tooltip",
                    icon: "sohl-head-gear",
                },
                {
                    id: "combat",
                    label: "SOHL.Actor.SHEET.tab.combat.label",
                    tooltip: "SOHL.Actor.SHEET.tab.combat.tooltip",
                    icon: "sohl-sword",
                },
                {
                    id: "trauma",
                    label: "SOHL.Actor.SHEET.tab.trauma.label",
                    tooltip: "SOHL.Actor.SHEET.tab.trauma.tooltip",
                    icon: "sohl-internal-injury",
                },
                {
                    id: "mysteries",
                    label: "SOHL.Actor.SHEET.tab.mysteries.label",
                    tooltip: "SOHL.Actor.SHEET.tab.mysteries.tooltip",
                    icon: "sohl-sparkles",
                },
                {
                    id: "gear",
                    label: "SOHL.Actor.SHEET.tab.gear.label",
                    tooltip: "SOHL.Actor.SHEET.tab.gear.tooltip",
                    icon: "sohl-basket",
                },
                {
                    id: "actions",
                    label: "SOHL.Actor.SHEET.tab.actions.label",
                    tooltip: "SOHL.Actor.SHEET.tab.actions.tooltip",
                    icon: "sohl-gears",
                },
                {
                    id: "effects",
                    label: "SOHL.Actor.SHEET.tab.effects.label",
                    tooltip: "SOHL.Actor.SHEET.tab.effects.tooltip",
                    icon: "sohl-plus-or-minus",
                },
            ],
        },
    };

    /**
     * Choose which sheet parts to render, omitting the detail tabs when the
     * actor is only viewable with limited permission.
     *
     * @param options - The render options whose `parts` list is populated.
     */
    protected override _configureRenderOptions(
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

    /**
     * Rebind the search filters to the freshly rendered element after each render.
     *
     * @param context - The render context.
     * @param options - The render options.
     */
    protected override async _onRender(
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
        actions: {
            rollStrikeModeTest: BeingSheet._onRollStrikeModeTest,
            rollStrikeModeImpact: BeingSheet._onRollStrikeModeImpact,
            addInjury: BeingSheet._onAddInjury,
        },
    };

    /**
     * Handle the "Add Injury" button on the Trauma tab: open the Add Injury
     * dialog for manual entry of a wound on this being.
     *
     * @param _event - The triggering pointer event (unused).
     * @param _target - The clicked element (unused).
     */
    protected static async _onAddInjury(
        this: BeingSheet,
        _event: PointerEvent,
        _target: HTMLElement,
    ): Promise<void> {
        await (this.document as any).addInjuryViaDialog();
    }

    /**
     * Handle clicks on the Atk/Blk/CX cells in the Combat tab. Resolves the
     * underlying MasteryLevelModifier from the row's data attributes and
     * runs a success test. Shift-click skips the modifier dialog.
     *
     * @param event - The triggering pointer event; shift-click skips the dialog.
     * @param target - The clicked cell, carrying the strike-mode data attributes.
     */
    protected static async _onRollStrikeModeTest(
        this: BeingSheet,
        event: PointerEvent,
        target: HTMLElement,
    ): Promise<void> {
        const row = target.closest("[data-sm-id]");
        if (!row) return;
        const smId = row.getAttribute("data-sm-id");
        const itemId = row.getAttribute("data-item-id");
        const testKind = target.getAttribute(
            "data-test-kind",
        ) as StrikeModeTestKind | null;
        if (!smId || !itemId || !testKind) return;

        const actor = this.document;
        const mlMod = resolveStrikeModeML(actor, itemId, smId, testKind);
        if (!mlMod) return;

        const item = actor.items.get(itemId);
        const sm = (item?.logic as any)?.strikeModes?.find(
            (m: any) => m.id === smId,
        );
        if (!item || !sm) return;

        const context = new SohlActionContext({
            speaker: (actor as any).getSpeaker(),
            type: `strike-${testKind}`,
            title: `${item.name} – ${sm.name} (${testKind})`,
            skipDialog: event.shiftKey,
        });

        await mlMod.successTest(context);
    }

    /**
     * Handle clicks on the Impact cell in the Combat tab. Rolls the strike
     * mode's impact dice and posts a damage card. When a single token is
     * targeted, the card offers a Calculate Injury button carrying the rolled
     * impact and aspect, opening the assisted Add Injury flow on the target.
     *
     * @param _event - The triggering pointer event (unused).
     * @param target - The clicked cell, carrying the strike-mode data attributes.
     */
    protected static async _onRollStrikeModeImpact(
        this: BeingSheet,
        _event: PointerEvent,
        target: HTMLElement,
    ): Promise<void> {
        const row = target.closest("[data-sm-id]");
        if (!row) return;
        const smId = row.getAttribute("data-sm-id");
        const itemId = row.getAttribute("data-item-id");
        if (!smId || !itemId) return;

        const actor = this.document;
        const impactMod = resolveStrikeModeImpact(actor, itemId, smId);
        if (!impactMod) return;

        const item = actor.items.get(itemId);
        const sm = (item?.logic as any)?.strikeModes?.find(
            (m: any) => m.id === smId,
        );
        if (!item || !sm) return;

        // Roll the impact fresh from the formula so repeated clicks re-roll.
        const roll = SimpleRoll.fromFormula(impactMod.diceFormula);
        roll.roll();

        const targetTokens = SohlTokenDocument.getTargetedTokens(true);
        const targetToken = targetTokens?.[0];
        const targetActorUuid = (targetToken?.actor as any)?.uuid as
            | string
            | undefined;

        const data = buildDamageCardData({
            title: `${item.name} – ${sm.name}`,
            actorId: actor.id,
            sourceActorUuid: actor.uuid,
            impactLabel: impactMod.label,
            rollResult: roll.result,
            impact: roll.total,
            aspect: impactMod.aspectType,
            target:
                targetToken && targetActorUuid ?
                    { name: targetToken.name ?? "", actorUuid: targetActorUuid }
                :   null,
        });

        await (actor as any)
            .getSpeaker()
            .toChat(
                toFilePath("systems/sohl/templates/chat/damage-card.hbs"),
                data,
            );
    }

    /* -------------------------------------------- */
    /*  Part Context Dispatcher                     */
    /* -------------------------------------------- */

    /**
     * Dispatch context preparation to the matching per-part handler and fire
     * the corresponding `sohl.actor.<type>.prepare*Context` hook for each part.
     *
     * @param partId - The identifier of the sheet part being rendered.
     * @param context - The render context to augment.
     * @param options - The render options.
     * @returns The augmented render context for the part.
     */
    protected override async _preparePartContext(
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

    /**
     * Prepare context for the sheet header: name, image, health, status effects, body parts.
     *
     * @param context - The render context to augment.
     * @param _options - The render options (unused).
     * @returns The augmented render context.
     */
    protected override async _prepareHeaderContext(
        context: RenderContext,
        _options: RenderOptions,
    ): Promise<RenderContext> {
        const actor = this.document;
        const logic = actor.logic as BeingLogic;

        // Status effects shown in the header. `id` must match a registered
        // status (Foundry's id is `stun`, not `stunned`); `abbr` is the short
        // label rendered, `label` is the tooltip.
        const statuses = (actor as any).statuses ?? new Set<string>();
        const statusEffects = [
            { id: STATUS_EFFECT.SLEEP, abbr: "SLP", label: "Sleep" },
            { id: STATUS_EFFECT.PRONE, abbr: "PRN", label: "Prone" },
            { id: STATUS_EFFECT.STUN, abbr: "STN", label: "Stun" },
            {
                id: STATUS_EFFECT.AURAL_SHOCK,
                abbr: "ASHK",
                label: "Aural Shock",
            },
            {
                id: STATUS_EFFECT.INCAPACITATED,
                abbr: "INC",
                label: "Incapacitated",
            },
            {
                id: STATUS_EFFECT.UNCONSCIOUS,
                abbr: "UNC",
                label: "Unconscious",
            },
            { id: STATUS_EFFECT.DEAD, abbr: "DED", label: "Dead" },
        ].map((s) => ({ ...s, active: statuses.has(s.id) }));

        return Object.assign(context, {
            actorName: actor.name,
            actorImg: actor.img,
            health: logic?.health,
            shockState: logic?.shockState,
            statusEffects,
        });
    }

    /**
     * Prepare context for the Tabs navigation.
     *
     * @param context - The render context to augment.
     * @param _options - The render options (unused).
     * @returns The augmented render context.
     */
    protected override async _prepareTabsContext(
        context: RenderContext,
        _options: RenderOptions,
    ): Promise<RenderContext> {
        return context;
    }

    /**
     * Prepare context for the Facade tab: bio image and description.
     *
     * @param context - The render context to augment.
     * @param _options - The render options (unused).
     * @returns The augmented render context.
     */
    protected override async _prepareFacadeContext(
        context: RenderContext,
        _options: RenderOptions,
    ): Promise<RenderContext> {
        const system = this.document.system as any;
        return Object.assign(context, {
            bioImage: system.bioImage,
            descriptionHTML: await fvttEnrichHTML(system.description ?? ""),
        });
    }

    /**
     * Prepare context for the Profile tab: attributes, traits, affiliations, biography.
     *
     * @param context - The render context to augment.
     * @param _options - The render options (unused).
     * @returns The augmented render context.
     */
    protected async _prepareProfileContext(
        context: RenderContext,
        _options: RenderOptions,
    ): Promise<RenderContext> {
        const actor = this.document;

        const attributes: SohlItem[] = [];
        for (const attr of attributes) {
            attributes.push(attr);
        }

        const traits = actor.itemTypes[ITEM_KIND.TRAIT] ?? [];
        const traitGroups: StrictObject<SohlItem[]> = {};
        for (const trait of traits) {
            const subType = (trait.system as any).subType ?? "other";
            (traitGroups[subType] ??= []).push(trait);
        }

        const affiliations = actor.itemTypes[ITEM_KIND.AFFILIATION] ?? [];

        const logic = actor.logic as BeingLogic | undefined;
        const movement: {
            medium: MovementMedium;
            label: string;
            value: number;
        }[] = [];
        if (logic?.effectiveBaseMove) {
            const mediumKeys: (keyof typeof MOVEMENT_MEDIUM)[] = [
                "TERRESTRIAL",
                "AQUATIC",
                "AERIAL",
                "BURROWING",
                "ASTRAL",
            ];
            for (const key of mediumKeys) {
                const medium = MOVEMENT_MEDIUM[key];
                const value = logic.effectiveBaseMove(medium).effective;
                if (value > 0) {
                    movement.push({
                        medium,
                        label: movementMediumLabels[key],
                        value,
                    });
                }
            }
        }

        const system = this.document.system as any;
        return Object.assign(context, {
            attributes,
            traitGroups,
            affiliations,
            movement,
            biographyHTML: await fvttEnrichHTML(system.biography ?? ""),
        });
    }

    /**
     * Prepare context for the Skills tab: skills grouped by subType.
     *
     * @param context - The render context to augment.
     * @param _options - The render options (unused).
     * @returns The augmented render context.
     */
    protected async _prepareSkillsContext(
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
     *
     * @param context - The render context to augment.
     * @param _options - The render options (unused).
     * @returns The augmented render context.
     */
    protected async _prepareCombatContext(
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

        // Body structure for anatomy display — sourced from the actor's Lineage item
        const lineageItem = (actor.itemTypes as any)?.[ITEM_KIND.LINEAGE]?.[0];
        const lineageLogic = lineageItem?.logic as LineageLogic | undefined;
        const bodyStructure = lineageLogic?.bodyStructure;

        return Object.assign(context, {
            meleeWeapons,
            missileWeapons,
            combatTechniques,
            bodyStructure,
            defaultCombatGroup:
                (actor.system as any).defaultCombatGroup ?? "",
            isGM: !!(game as any).user?.isGM,
        });
    }

    /**
     * Prepare context for the Trauma tab: traumas and afflictions.
     *
     * @param context - The render context to augment.
     * @param _options - The render options (unused).
     * @returns The augmented render context.
     */
    protected async _prepareTraumaContext(
        context: RenderContext,
        _options: RenderOptions,
    ): Promise<RenderContext> {
        const actor = this.document;
        const logic = actor.logic as BeingLogic;

        const traumas = actor.itemTypes[ITEM_KIND.TRAUMA] ?? [];
        const afflictions = actor.itemTypes[ITEM_KIND.AFFLICTION] ?? [];

        // Group afflictions by subType
        const afflictionGroups: StrictObject<SohlItem[]> = {};
        for (const affliction of afflictions) {
            const subType = (affliction.system as any).subType ?? "other";
            (afflictionGroups[subType] ??= []).push(affliction);
        }

        return Object.assign(context, {
            traumas,
            afflictionGroups,
            shockState: logic?.shockState,
        });
    }

    /**
     * Prepare context for the Mysteries tab: mysteries, mystical abilities.
     *
     * @param context - The render context to augment.
     * @param _options - The render options (unused).
     * @returns The augmented render context.
     */
    protected async _prepareMysteriesContext(
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
     *
     * @param context - The render context to augment.
     * @param _options - The render options (unused).
     * @returns The augmented render context.
     */
    protected async _prepareGearContext(
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

        const containerIds = new Set(containerGear.map((c: SohlItem) => c.id));

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

    /**
     * Prepare context for the Actions tab: actor-level actions.
     *
     * @param context - The render context to augment.
     * @param _options - The render options (unused).
     * @returns The augmented render context.
     */
    protected async _prepareActionsContext(
        context: RenderContext,
        _options: RenderOptions,
    ): Promise<RenderContext> {
        const actions = this.document.logic?.actions ?? [];
        return Object.assign(context, { actions });
    }

    /**
     * Prepare context for the Effects tab: own and transferred effects.
     *
     * @param context - The render context to augment.
     * @param _options - The render options (unused).
     * @returns The augmented render context.
     */
    protected async _prepareEffectsContext(
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
