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

import { SohlActor } from "@src/document/actor/foundry/SohlActor";
import { SohlActorSheetBase } from "@src/document/actor/foundry/SohlActorSheetBase";
import { fvttCallHook } from "@src/core/FoundryHelpers";
import {
    ITEM_KIND,
    MOVEMENT_MEDIUM,
    MovementMedium,
    movementMediumLabels,
    TraitSubTypes,
    TraitSubTypeChoices,
    TraitIntensityChoices,
} from "@src/utils/constants";
import { SohlItem } from "@src/document/item/foundry/SohlItem";
import type { BeingLogic } from "@src/document/actor/logic/BeingLogic";
import type { LineageLogic } from "@src/document/item/logic/LineageLogic";
import type { AttributeLogic } from "@src/document/item/logic/AttributeLogic";
import {
    groupBySubType,
    attributeDescriptor,
    buildTraitGroups,
    buildAffiliationRows,
    buildContainerTree,
    buildStatusPills,
    buildBodyPartLozenges,
    clampHealthPct,
    filterHeldWeapons,
    splitWeaponsByRange,
    selectStrikeModeModifier,
} from "@src/document/actor/logic/being-sheet-view";
import { SohlActionContext } from "@src/entity/action/SohlActionContext";
import { StrikeModeBase } from "@src/entity/strikemode/StrikeModeBase";

type RenderContext =
    foundry.applications.api.DocumentSheetV2.RenderContext<SohlActor>;
type RenderOptions = foundry.applications.api.DocumentSheetV2.RenderOptions;

const TextEditor = foundry.applications.ux.TextEditor.implementation;

/** @internal */
export class BeingSheet extends SohlActorSheetBase {
    static PARTS = {
        header: {
            id: "header",
            template: "systems/sohl/templates/actor/being/header.hbs",
        },
        tabs: {
            id: "tabs",
            template: "templates/generic/tab-navigation.hbs",
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

    /** @inheritDoc */
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
     * @param options.parts - Populated with the list of sheet part ids to render.
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
            contentSelector: ".effects__list",
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
        // Typed `any` to avoid an fvtt-types deep-comparison / stack-depth blowup
        // when matching this override against the base sheet's `_onRender`; the
        // heavy `RenderContext<SohlActor>` type is what trips it.
        context: any,
        options: foundry.applications.api.DocumentSheetV2.RenderOptions,
    ): Promise<void> {
        await super._onRender(context, options);

        // Rebind all search filters
        this._filters.forEach((filter) => filter.bind((this as any).element));
    }

    /** @inheritDoc */
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
            rollSkillTest: BeingSheet._onRollSkillTest,
            addInjury: BeingSheet._onAddInjury,
            toggleStatus: BeingSheet._onToggleStatus,
            createItem: BeingSheet._onCreateItem,
        },
    };

    /**
     * Handle clicks on an item-create control (class `item-create`,
     * `data-action="createItem"`). Reads the control's `data-type` and
     * `data-sub-type` (or `data-subtype`) to pre-seed the create dialog, then
     * opens {@link SohlItem.createDialog} parented to this being.
     *
     * @param _event - The triggering pointer event (unused).
     * @param target - The clicked control, carrying `data-type` / `data-sub-type`.
     */
    protected static async _onCreateItem(
        this: BeingSheet,
        _event: PointerEvent,
        target: HTMLElement,
    ): Promise<void> {
        const type = target.dataset.type;
        const subType = target.dataset.subType ?? target.dataset.subtype;
        const data: PlainObject = {};
        if (type) data.type = type;
        if (subType) data.system = { subType };
        await SohlItem.createDialog(data, { parent: this.document });
    }

    /**
     * Toggle a status effect from the header status pills. Creates the active
     * effect if absent, deletes it if present, keyed by the pill's
     * `data-status-id`.
     *
     * @param _event - The triggering pointer event (unused).
     * @param target - The clicked pill, carrying `data-status-id`.
     */
    protected static async _onToggleStatus(
        this: BeingSheet,
        _event: PointerEvent,
        target: HTMLElement,
    ): Promise<void> {
        const statusId = target.getAttribute("data-status-id");
        if (!statusId) return;
        await this.document.toggleStatusEffect(statusId);
        // Re-render so the pill's `active` highlight reflects the new state —
        // the embedded ActiveEffect change does not reliably re-render the
        // header part on its own.
        void this.render();
    }

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
        // `addInjuryViaDialog` lives on the actor's BeingLogic, not the actor
        // document itself — route through `.logic` (#268).
        await (this.document as any).logic.addInjuryViaDialog();
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
        const testKind = target.getAttribute("data-test-kind") as string | null;
        if (!smId || !itemId || !testKind) return;

        const actor = this.document;
        const item = actor.items.get(itemId);
        const sm = (item?.logic as any)?.strikeModes?.find(
            (m: any) => m.id === smId,
        ) as StrikeModeBase | undefined;
        if (!item || !sm) return;
        const mlMod = selectStrikeModeModifier(sm, testKind);
        if (!mlMod) return;
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

        const actorLogic = this.document.logic as BeingLogic;
        const itemLogic = this.document.items.get(itemId)?.logic;
        const sm = (itemLogic as any)?.strikeModes?.find(
            (m: StrikeModeBase) => m.id === smId,
        );
        if (!sm) return;
        const impactMod = sm.impact;

        const calcImpactContext = new SohlActionContext({
            speaker: actorLogic.speaker,
            scope: {
                impactModifier: impactMod,
            },
        });
        void actorLogic.executeAction("calcImpact", calcImpactContext);
    }

    /**
     * Handle clicks on a skill's ML cell in the Skills tab. Runs a success
     * test against that skill's mastery level and posts the result to chat.
     * Hold Shift to skip the dialog.
     *
     * @param event - The triggering pointer event.
     * @param target - The clicked ML cell, on or inside an element carrying
     *   `data-item-id`.
     */
    protected static async _onRollSkillTest(
        this: BeingSheet,
        event: PointerEvent,
        target: HTMLElement,
    ): Promise<void> {
        const row = target.closest("[data-item-id]");
        if (!row) return;
        const itemId = row.getAttribute("data-item-id");
        if (!itemId) return;

        const actor = this.document;
        const item = actor.items.get(itemId);
        const skillLogic = item?.logic as any;
        if (!skillLogic?.masteryLevel) return;

        const context = new SohlActionContext({
            speaker: (actor as any).getSpeaker(),
            type: `skill-${item!.name}-test`,
            title: `${item!.name} – Test`,
            skipDialog: event.shiftKey,
        });
        await skillLogic.successTest(context);
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
        // Expose the prepared tab descriptor for this part so content
        // sections can resolve their `active` state and tab group. The
        // navigation part itself iterates the full `tabs` record instead.
        (context as any).tab = (context as any).tabs?.[partId];
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
        //
        // SoHL's custom data-prep lifecycle does not populate the core
        // `actor.statuses` set, so derive the active status ids from the actor's
        // active effects directly. Iterate the raw `effects` collection (not
        // `appliedEffects`, which SoHL may filter via suppression) — a status
        // effect's mere presence means the status is on; it carries the id in
        // its core `statuses` field.
        const statuses = new Set<string>();
        for (const effect of ((actor as any).effects ?? []) as Iterable<any>) {
            for (const sid of (effect.statuses ?? []) as Iterable<string>) {
                statuses.add(sid);
            }
            const legacyId = effect?.flags?.core?.statusId;
            if (legacyId) statuses.add(legacyId);
        }
        const statusEffects = buildStatusPills(statuses);

        // Read-only body-location lozenges, sourced from the actor's Lineage body
        // structure (dynamic — varies by lineage).
        const lineageItem = (actor.itemTypes as any)?.[ITEM_KIND.LINEAGE]?.[0];
        const bodyStructure = (lineageItem?.logic as LineageLogic | undefined)
            ?.bodyStructure;
        const bodyParts = buildBodyPartLozenges(bodyStructure);

        return Object.assign(context, {
            actorName: actor.name,
            actorImg: actor.img,
            health: logic?.health,
            healthPct: clampHealthPct(logic?.health?.effective),
            shockState: logic?.shockState,
            statusEffects,
            bodyParts,
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
            descriptionHTML: await TextEditor.enrichHTML(
                system.description ?? "",
            ),
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

        // Attribute score boxes. Sort stably by the Foundry `sort` field,
        // falling back to name. Read each attribute's `logic` (permitted here —
        // the sheet is a Foundry-boundary class) for the effective score and
        // mastery level, and compute the descriptor band from `valueDesc`.
        const attributeItems = [
            ...(actor.itemTypes[ITEM_KIND.ATTRIBUTE] ?? []),
        ].sort(
            (a, b) =>
                ((a as any).sort ?? 0) - ((b as any).sort ?? 0) ||
                a.name.localeCompare(b.name),
        );
        const attributes = attributeItems.map((attr) => {
            const attrLogic = attr.logic as AttributeLogic | undefined;
            const score = attrLogic?.score.effective ?? 0;
            const bands = (attr.system as any).valueDesc ?? [];
            return {
                id: attr.id,
                uuid: attr.uuid,
                name: attr.name,
                score,
                descriptor: attributeDescriptor(score, bands),
                tl: attrLogic?.masteryLevel.effective ?? 0,
            };
        });

        // Traits grouped by subtype, in the subtype definition order, with
        // localized subtype legends and per-trait intensity labels. Reading
        // `system` and `game.i18n` here is fine — the sheet is a
        // Foundry-boundary class; the shaping stays in the pure helper.
        const traits = actor.itemTypes[ITEM_KIND.TRAIT] ?? [];
        const traitGroups = buildTraitGroups(
            traits.map((trait) => {
                const sys = trait.system as any;
                return {
                    id: trait.id ?? "",
                    uuid: trait.uuid,
                    name: trait.name,
                    subType: sys.subType,
                    isNumeric: !!sys.isNumeric,
                    masteryLevelBase: sys.masteryLevelBase ?? 0,
                    textValue: sys.textValue ?? "",
                    intensity: sys.intensity,
                    notes: sys.notes ?? "",
                };
            }),
            TraitSubTypes,
            (subType) =>
                game.i18n.localize(
                    (TraitSubTypeChoices as Record<string, string>)[subType] ??
                        subType,
                ),
            (intensity) =>
                game.i18n.localize(
                    (TraitIntensityChoices as Record<string, string>)[
                        intensity
                    ] ?? intensity,
                ),
        );

        const affiliations = buildAffiliationRows(
            (actor.itemTypes[ITEM_KIND.AFFILIATION] ?? []).map((aff) => {
                const sys = aff.system as any;
                return {
                    id: aff.id ?? "",
                    uuid: aff.uuid,
                    name: aff.name,
                    level: sys.level ?? 0,
                    society: sys.society ?? "",
                    office: sys.office ?? "",
                    title: sys.title ?? "",
                    notes: sys.notes ?? "",
                };
            }),
        );

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
            biographyHTML: await TextEditor.enrichHTML(system.biography ?? ""),
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
        const skillGroups = groupBySubType(
            skills,
            (skill) => (skill.system as any).subType,
            (a, b) => a.name.localeCompare(b.name),
        );

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

        // Weapons split into melee/missile by their strike mode domain objects;
        // only weapons currently held (gripped by a body part) appear in combat.
        const allWeapons = actor.itemTypes[ITEM_KIND.WEAPONGEAR] ?? [];
        const weapons = filterHeldWeapons(
            allWeapons,
            (weapon: SohlItem) => (weapon.logic as any)?.heldBy ?? [],
        );
        const { meleeWeapons, missileWeapons } = splitWeaponsByRange(
            weapons,
            (weapon) => (weapon.logic as any)?.strikeModes ?? [],
        );

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
            defaultCombatGroup: (actor.system as any).defaultCombatGroup ?? "",
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
        const afflictionGroups = groupBySubType(
            afflictions,
            (affliction) => (affliction.system as any).subType,
        );

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
        const mysteryGroups = groupBySubType(
            mysteries,
            (mystery) => (mystery.system as any).subType,
        );

        // Mystical abilities grouped by subType
        const abilities = actor.itemTypes[ITEM_KIND.MYSTICALABILITY] ?? [];
        const abilityGroups = groupBySubType(
            abilities,
            (ability) => (ability.system as any).subType,
        );

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

        const containerGear = actor.itemTypes[ITEM_KIND.CONTAINERGEAR] ?? [];

        // Collect all gear items (containers themselves included, so a
        // top-level container appears both as a node and under "On Body").
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

        const { containers, onBodyItems } = buildContainerTree(
            containerGear,
            allGear,
            (item) => item.id,
            (item) => (item.system as any).containerId,
        );

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
