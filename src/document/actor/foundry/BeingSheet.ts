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
import { fvttCallHook, fvttGetSetting } from "@src/core/FoundryHelpers";
import {
    ITEM_KIND,
    MOVEMENT_MEDIUM,
    MovementMedium,
    movementMediumLabels,
    TraitSubTypes,
    TraitSubTypeChoices,
    TraitIntensityChoices,
    SKILL_SUBTYPE,
    SkillSubTypeChoices,
    AfflictionSubTypes,
    AfflictionSubTypeChoices,
} from "@src/utils/constants";
import { SohlItem } from "@src/document/item/foundry/SohlItem";
import type { BeingLogic } from "@src/document/actor/logic/BeingLogic";
import type { LineageLogic } from "@src/document/item/logic/LineageLogic";
import type { AttributeLogic } from "@src/document/item/logic/AttributeLogic";
import type { SkillLogic } from "@src/document/item/logic/SkillLogic";
import {
    groupBySubType,
    attributeDescriptor,
    buildTraitGroups,
    buildSkillGroups,
    buildTraumaRows,
    buildAfflictionGroups,
    buildAffiliationRows,
    buildHoldableGear,
    buildBodyLocationTree,
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

        // Held Items section: a `<select>` change assigns a body part's held
        // item (not a click action, so it is wired here).
        (this as any).element
            ?.querySelectorAll("select.held-item-select")
            .forEach((select: HTMLSelectElement) =>
                select.addEventListener("change", (event: Event) =>
                    this._onSetHeldItem(event),
                ),
            );
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
            toggleImproveFlag: BeingSheet._onToggleImproveFlag,
            toggleCarried: BeingSheet._onToggleCarried,
            toggleEquipped: BeingSheet._onToggleEquipped,
            editItem: BeingSheet._onEditItem,
            deleteItem: BeingSheet._onDeleteItem,
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
     * Toggle a skill's Skill Development (improve) flag from the Skills tab
     * star. Reads the row's `data-item-id`, resolves the embedded skill, and
     * flips `system.improveFlag`; the resulting item update re-renders the
     * sheet, so no manual re-render is needed.
     *
     * @param _event - The triggering pointer event (unused).
     * @param target - The clicked star, on or inside an element carrying
     *   `data-item-id`.
     */
    protected static async _onToggleImproveFlag(
        this: BeingSheet,
        _event: PointerEvent,
        target: HTMLElement,
    ): Promise<void> {
        const row = target.closest("[data-item-id]");
        const itemId = row?.getAttribute("data-item-id");
        if (!itemId) return;
        const item = this.document.items.get(itemId);
        if (!item) return;
        await item.update({
            "system.improveFlag": !(item.system as any).improveFlag,
        } as PlainObject);
    }

    /**
     * Resolve the embedded item for a row control from the nearest ancestor
     * carrying `data-item-id`.
     *
     * @param target - The clicked control.
     * @returns The item, or `undefined` when none resolves.
     */
    private _itemFromControl(target: HTMLElement): SohlItem | undefined {
        const itemId = target
            .closest("[data-item-id]")
            ?.getAttribute("data-item-id");
        return itemId ? this.document.items.get(itemId) : undefined;
    }

    /**
     * Open an embedded item's sheet — the Edit anchor (e.g. the Lineage row).
     *
     * @param _event - The triggering pointer event (unused).
     * @param target - The clicked control, within a `data-item-id` row.
     */
    protected static async _onEditItem(
        this: BeingSheet,
        _event: PointerEvent,
        target: HTMLElement,
    ): Promise<void> {
        void this._itemFromControl(target)?.sheet?.render(true);
    }

    /**
     * Delete an embedded item after confirmation — the Delete anchor (e.g. the
     * Lineage row; deleting the lineage returns the being to its no-body state).
     *
     * @param _event - The triggering pointer event (unused).
     * @param target - The clicked control, within a `data-item-id` row.
     */
    protected static async _onDeleteItem(
        this: BeingSheet,
        _event: PointerEvent,
        target: HTMLElement,
    ): Promise<void> {
        const item = this._itemFromControl(target);
        if (!item) return;
        await (item as any).deleteDialog();
    }

    /**
     * Toggle a gear item's **carried** state (on the character's person).
     *
     * @param _event - The triggering pointer event (unused).
     * @param target - The clicked control, within a `data-item-id` row.
     */
    protected static async _onToggleCarried(
        this: BeingSheet,
        _event: PointerEvent,
        target: HTMLElement,
    ): Promise<void> {
        const item = this._itemFromControl(target);
        if (!item) return;
        await item.update({
            "system.isCarried": !(item.system as any).isCarried,
        } as PlainObject);
    }

    /**
     * Toggle a gear item's **equipped** (worn/wielded) state — feeds worn-armor
     * protection totals for armor.
     *
     * @param _event - The triggering pointer event (unused).
     * @param target - The clicked control, within a `data-item-id` row.
     */
    protected static async _onToggleEquipped(
        this: BeingSheet,
        _event: PointerEvent,
        target: HTMLElement,
    ): Promise<void> {
        const item = this._itemFromControl(target);
        if (!item) return;
        await item.update({
            "system.isEquipped": !(item.system as any).isEquipped,
        } as PlainObject);
    }

    /**
     * Assign the item held by a hold-capable body part, from the Held Items
     * section's per-limb dropdown. Writes the chosen item's id (or `null` for
     * the blank option) to that part's `heldItemId` on the lineage's body
     * structure. A weapon held in two parts (two-handed) is expressed by
     * selecting it in both limbs' dropdowns.
     *
     * Bound as a `change` listener in {@link _onRender} (a `<select>` change,
     * not a click action).
     *
     * @param event - The select's change event.
     */
    private async _onSetHeldItem(event: Event): Promise<void> {
        const select = event.target as HTMLSelectElement;
        const partIndex = Number(select.dataset.partIndex);
        if (Number.isNaN(partIndex)) return;
        const itemId = select.value || null;
        const lineage = (this.document.logic as BeingLogic)?.logicTypes?.[
            ITEM_KIND.LINEAGE
        ]?.[0];
        if (!lineage) return;
        const payload = lineage.bodyStructure.setPartFieldsUpdate([
            { index: partIndex, changes: { heldItemId: itemId } },
        ]);
        if (Object.keys(payload).length) await lineage.data.update(payload);
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
        // Skills grouped by subtype, in the display subtype order, with
        // localized subtype legends. Reading each skill's `logic` here is fine —
        // the sheet is a Foundry-boundary class (the Attributes section reads
        // `attr.logic` the same way); the grouping stays in the pure helper.
        const skills = this.document.itemTypes[ITEM_KIND.SKILL] ?? [];
        const skillGroups = buildSkillGroups(
            skills.map((skill) => {
                const sys = skill.system as any;
                const skillLogic = skill.logic as SkillLogic | undefined;
                return {
                    id: skill.id ?? "",
                    uuid: skill.uuid,
                    name: skill.name,
                    subType: sys.subType,
                    sb: skillLogic?.skillBase ?? 0,
                    ml: skillLogic?.masteryLevel.base ?? 0,
                    index: skillLogic?.masteryLevel.index ?? 0,
                    eml: skillLogic?.masteryLevel.effective ?? 0,
                    fate: skillLogic?.fateMasteryLevel.effective ?? 0,
                    disabled: !!skillLogic?.masteryLevel.disabled,
                    canImprove: !!skillLogic?.canImprove,
                    improveFlag: !!sys.improveFlag,
                };
            }),
            [
                SKILL_SUBTYPE.SOCIAL,
                SKILL_SUBTYPE.NATURE,
                SKILL_SUBTYPE.CRAFT,
                SKILL_SUBTYPE.LORE,
                SKILL_SUBTYPE.LANGUAGE,
                SKILL_SUBTYPE.SCRIPT,
            ],
            (subType) =>
                game.i18n.localize(
                    (SkillSubTypeChoices as Record<string, string>)[subType] ??
                        subType,
                ),
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

        // Derived Strike Mode sections: aggregate strike modes from combat
        // techniques and held weapons, split into melee/missile and grouped by
        // their source item. Combat-technique skills are always available (they
        // belong to the being); weapons contribute only while held (gripped by a
        // body part). The shared `rollStrikeModeTest`/`Impact` handlers resolve
        // the source by `data-item-id`, so skill and weapon sources roll alike.
        const heldWeapons = filterHeldWeapons(
            actor.itemTypes[ITEM_KIND.WEAPONGEAR] ?? [],
            (weapon: SohlItem) => (weapon.logic as any)?.heldBy ?? [],
        );
        const techniqueSkills = (actor.itemTypes[ITEM_KIND.SKILL] ?? []).filter(
            (skill: SohlItem) => !!(skill.logic as any)?.strikeMode,
        );
        const {
            meleeWeapons: meleeStrikeModes,
            missileWeapons: missileStrikeModes,
        } = splitWeaponsByRange(
            [...techniqueSkills, ...heldWeapons],
            (source) => (source.logic as any)?.strikeModes ?? [],
        );

        // Body structure for anatomy display — sourced from the actor's Lineage
        // item. The Lineage is a singleton (0 or 1): `lineage` drives the Combat
        // tab's Lineage row (+ Add disabled when one exists; Edit/Delete anchors).
        const lineageItem = (actor.itemTypes as any)?.[ITEM_KIND.LINEAGE]?.[0];
        const lineageLogic = lineageItem?.logic as LineageLogic | undefined;
        const bodyStructure = lineageLogic?.bodyStructure;

        // HMK compatibility: the "Use Zone Die" world setting presents a strike
        // mode's spread as a Zone Die (`d{n}`, column "ZD") instead of a Spread
        // radius (`{n}`, column "Spr"). Same underlying `spread.effective` value.
        const useZoneDie = !!fvttGetSetting("sohl", "useZoneDie");

        // Held Items: one dropdown per hold-capable body part, each listing the
        // actor's holdable gear (weapons + misc gear not stowed in a container).
        // Selecting an item sets that part's `heldItemId`; a two-handed weapon is
        // held by selecting it in both limbs.
        const holdableItems = buildHoldableGear(
            [
                ...(actor.itemTypes[ITEM_KIND.WEAPONGEAR] ?? []),
                ...(actor.itemTypes[ITEM_KIND.MISCGEAR] ?? []),
            ].map((it) => ({
                id: it.id ?? "",
                name: it.name,
                kind: it.type,
                containerId: (it.system as any).containerId,
            })),
            (it) => it.kind,
            (it) => it.containerId,
            new Set<string>([ITEM_KIND.WEAPONGEAR, ITEM_KIND.MISCGEAR]),
        );
        const heldItemLimbs = (bodyStructure?.parts ?? [])
            .filter((part: any) => part.canHoldItem)
            .map((part: any) => ({
                index: part.index,
                label: part.shortcode,
                heldItemId: part.heldItem?.id ?? "",
            }));

        // Read-only Body Locations tree: each part with its locations' effective
        // protection (natural `protectionBase` + worn-armor `armorProtection`,
        // aggregated during the actor's evaluate phase), the covering material
        // layers, shock, and the held item on the part.
        const bodyParts = buildBodyLocationTree(
            (bodyStructure?.parts ?? []).map((part: any) => ({
                label: part.name ?? part.shortcode,
                held: part.heldItem?.name ?? "",
                locations: (part.locations ?? []).map((loc: any) => ({
                    name: loc.name,
                    layers: loc.armorType ?? "",
                    prob: loc.probWeight?.effective ?? 0,
                    base: {
                        blunt: loc.protectionBase.blunt.effective,
                        edged: loc.protectionBase.edged.effective,
                        piercing: loc.protectionBase.piercing.effective,
                        fire: loc.protectionBase.fire.effective,
                    },
                    armor: {
                        blunt: loc.armorProtection?.blunt ?? 0,
                        edged: loc.armorProtection?.edged ?? 0,
                        piercing: loc.armorProtection?.piercing ?? 0,
                        fire: loc.armorProtection?.fire ?? 0,
                    },
                    shock: loc.shockValue?.effective ?? 0,
                    impair: 0,
                })),
            })),
        );

        return Object.assign(context, {
            meleeStrikeModes,
            missileStrikeModes,
            lineage: lineageItem,
            bodyStructure,
            bodyParts,
            useZoneDie,
            spreadLabel: useZoneDie ? "ZD" : "Spr",
            holdableItems,
            heldItemLimbs,
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

        // Traumas (injuries): extract each item's display values from its logic
        // and system data, then format into compact rows for the list.
        const traumas = buildTraumaRows(
            (actor.itemTypes[ITEM_KIND.TRAUMA] ?? []).map((item) => {
                const tl = item.logic as any;
                const sys = item.system as any;
                return {
                    id: item.id!,
                    uuid: item.uuid,
                    name: item.name,
                    img: item.img ?? "",
                    level: tl?.level?.effective ?? 0,
                    healingRate: tl?.healingRate?.effective ?? 0,
                    healingRateDisabled: !!tl?.healingRate?.disabled,
                    isTreated: !!sys.isTreated,
                    isBleeding: !!sys.isBleeding,
                    aspect: sys.aspect,
                    area: tl?.bodyLocation?.name,
                    notes: sys.notes,
                };
            }),
            (aspect) =>
                sohl.i18n.localize(`SOHL.ImpactModifier.ASPECT.${aspect}`),
        );

        // Afflictions, grouped by subtype: extract each item's display values
        // from its logic (localized level/source labels) and system data.
        const afflictionGroups = buildAfflictionGroups(
            (actor.itemTypes[ITEM_KIND.AFFLICTION] ?? []).map((item) => {
                const al = item.logic as any;
                const sys = item.system as any;
                return {
                    id: item.id!,
                    uuid: item.uuid,
                    name: item.name,
                    img: item.img ?? "",
                    subType: sys.subType,
                    levelLabel:
                        al?.levelLabel ?? String(al?.level?.effective ?? 0),
                    healingRate: al?.healingRate?.effective ?? 0,
                    healingRateDisabled: !!al?.healingRate?.disabled,
                    source: al?.categoryLabel ?? "",
                    notes: sys.notes,
                };
            }),
            AfflictionSubTypes,
            (subType) =>
                game.i18n.localize(
                    (AfflictionSubTypeChoices as Record<string, string>)[
                        subType
                    ] ?? subType,
                ),
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
