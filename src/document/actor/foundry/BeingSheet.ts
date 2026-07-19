/*
 * This file is part of the Song of Heroic Lands (SoHL) system for Foundry VTT.
 * Copyright (c) 2024-2026 Tom Rodriguez ("Toasty") — <toasty@heroiclands.org>
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
import {
    fvttCallHook,
    fvttGetSetting,
    fvttRenderSheet,
} from "@src/core/FoundryHelpers";
import {
    ACTION_SUBTYPE,
    SOHL_ACTION_SCOPE,
    SOHL_CONTEXT_MENU_SORT_GROUP,
    ITEM_KIND,
    GearKinds,
    MovementMedium,
    MovementMediumChoices,
    MysterySubTypes,
    MysterySubTypeChoices,
    MysticalAbilitySubTypes,
    MysticalAbilitySubTypeChoices,
    TraitSubTypes,
    TraitSubTypeChoices,
    TraitIntensityChoices,
    SKILL_SUBTYPE,
    SkillSubTypeChoices,
    AfflictionSubTypes,
    AfflictionSubTypeChoices,
    TraumaSubTypeChoices,
} from "@src/utils/constants";
import { SohlItem } from "@src/document/item/foundry/SohlItem";
import type { BeingLogic } from "@src/document/actor/logic/BeingLogic";
import type { CorpusLogic } from "@src/document/item/logic/CorpusLogic";
import type { LocationInjury } from "@src/entity/body/impairment";
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
    resolveGearContainerMove,
    htmlToPlainText,
    buildStatusPills,
    buildBodyPartLozenges,
    clampHealthPct,
    filterHeldWeapons,
    splitWeaponsByRange,
} from "@src/document/actor/logic/being-sheet-view";
import { SohlActionContext } from "@src/entity/action/SohlActionContext";
import { SohlAction } from "@src/entity/action/SohlAction";
import { StrikeModeBase } from "@src/entity/strikemode/StrikeModeBase";

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
            template: "templates/generic/tab-navigation.hbs",
        },
        facade: {
            id: "facade",
            template: "systems/sohl/templates/actor/parts/facade.hbs",
        },
        profile: {
            id: "profile",
            template: "systems/sohl/templates/actor/being/profile.hbs",
            scrollable: [""],
        },
        skills: {
            id: "skills",
            template: "systems/sohl/templates/actor/being/skills.hbs",
            scrollable: [""],
        },
        combat: {
            id: "combat",
            template: "systems/sohl/templates/actor/being/combat.hbs",
            scrollable: [""],
        },
        trauma: {
            id: "trauma",
            template: "systems/sohl/templates/actor/being/trauma.hbs",
            scrollable: [""],
        },
        mysteries: {
            id: "mysteries",
            template: "systems/sohl/templates/actor/being/mysteries.hbs",
            scrollable: [""],
        },
        gear: {
            id: "gear",
            template: "systems/sohl/templates/actor/parts/gear.hbs",
            scrollable: [""],
        },
        actions: {
            id: "actions",
            template: "systems/sohl/templates/actor/parts/actions.hbs",
            scrollable: [""],
        },
        effects: {
            id: "effects",
            template: "systems/sohl/templates/actor/parts/effects.hbs",
            scrollable: [""],
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
                    icon: "fa-solid fa-masks-theater",
                },
                {
                    id: "profile",
                    label: "SOHL.Actor.SHEET.tab.profile.label",
                    icon: "fa-solid fa-user",
                },
                {
                    id: "skills",
                    label: "SOHL.Actor.SHEET.tab.skills.label",
                    icon: "fa-solid fa-head-side-gear",
                },
                {
                    id: "combat",
                    label: "SOHL.Actor.SHEET.tab.combat.label",
                    icon: "fa-solid fa-sword",
                },
                {
                    id: "trauma",
                    label: "SOHL.Actor.SHEET.tab.trauma.label",
                    icon: "fa-solid fa-heartbeat",
                },
                {
                    id: "mysteries",
                    label: "SOHL.Actor.SHEET.tab.mysteries.label",
                    icon: "fa-solid fa-sparkles",
                },
                {
                    id: "gear",
                    label: "SOHL.Actor.SHEET.tab.gear.label",
                    icon: "fa-solid fa-briefcase",
                },
                {
                    id: "actions",
                    label: "SOHL.Actor.SHEET.tab.actions.label",
                    icon: "fa-solid fa-cogs",
                },
                {
                    id: "effects",
                    label: "SOHL.Actor.SHEET.tab.effects.label",
                    icon: "fa-solid fa-plus-minus",
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

        // Bind the item/effect context menus (right-click on a `.item` row and
        // click on its `.item-contextmenu` ⋮ control). Without this the sheet
        // has no way to edit or delete any created item (#517). `_contextMenu`
        // is provided by the SohlDataModel sheet mixin.
        (this as any)._contextMenu?.((this as any).element);
    }

    /**
     * Handle an Item dropped onto the being sheet. A **gear item already on this
     * actor** is handled here — the drop is a container reassignment and/or a
     * reorder (see {@link _onDropGearOnActor}). Every other case (a cross-actor
     * move, or a compendium/world clone) falls through to
     * {@link SohlActorSheetBase._onDropItem}.
     *
     * @param event - The originating drop event (its target locates the destination).
     * @param droppedItem - The resolved dropped item.
     */
    protected override async _onDropItem(
        event: DragEvent,
        droppedItem: SohlItem,
    ): Promise<void> {
        const actor = this.document;
        const isSameActor = droppedItem?.actor?.id === actor.id;
        const isGear = GearKinds.includes(droppedItem?.type as any);
        if (actor.isOwner && isSameActor && isGear) {
            await this._onDropGearOnActor(event, droppedItem);
            return;
        }
        await super._onDropItem(event, droppedItem);
    }

    /**
     * Reassign and/or reorder a gear item already on this actor. The destination
     * container is read from the drop target's `data-container-id` ancestor
     * (absent → the virtual "On Body" list), and the position from the
     * `data-item-id` row it was dropped onto. Both the `system.containerId`
     * change and the `sort` reordering are applied in a single
     * `updateEmbeddedDocuments` call.
     *
     * @param event - The originating drop event.
     * @param droppedItem - The gear item being moved (already embedded on this actor).
     */
    protected async _onDropGearOnActor(
        event: DragEvent,
        droppedItem: SohlItem,
    ): Promise<void> {
        const actor = this.document;
        const droppedId = droppedItem.id;
        if (!droppedId) return;

        // Destination container from the drop target's DOM; the On Body section
        // carries no `data-container-id`, so a null match means "On Body".
        const containerEl = (event.target as HTMLElement)?.closest?.(
            "[data-container-id]",
        ) as HTMLElement | null;
        const destContainerId = containerEl?.dataset.containerId;

        // Snapshot the actor's gear for the pure move planner (self/cycle guard).
        const gear = (
            Array.from(actor.items as Iterable<SohlItem>) as SohlItem[]
        )
            .filter((it) => GearKinds.includes(it.type as any))
            .map((it) => ({
                id: it.id ?? "",
                containerId: (it.system as any).containerId as
                    | string
                    | null
                    | undefined,
            }));

        const move = resolveGearContainerMove(droppedId, destContainerId, gear);
        if (!move.allowed) {
            sohl.log.uiWarn(
                "Can't move a container into itself or its contents.",
            );
            return;
        }

        // Merge the container reassignment and the reorder into one update per
        // affected item so a cross-section drag both re-homes and re-sorts.
        const updates = new Map<string, PlainObject>();
        if (move.changed) {
            updates.set(droppedId, {
                _id: droppedId,
                "system.containerId": move.containerId ?? null,
            });
        }
        for (const u of this._planGearSort(event, droppedItem)) {
            updates.set(u._id, { ...(updates.get(u._id) ?? {}), ...u });
        }

        if (updates.size === 0) return;
        await actor.updateEmbeddedDocuments(
            "Item",
            Array.from(updates.values()) as any,
        );
    }

    /**
     * Compute the `sort` updates to place the dragged gear item at the drop
     * target's position among the siblings rendered in that section, using
     * Foundry's integer-sort utility. Returns an empty list when the drop was
     * not onto a distinct sibling row (e.g. onto a section header).
     *
     * @param event - The originating drop event.
     * @param source - The gear item being moved.
     * @returns One `{ _id, sort }` update per re-sorted sibling.
     */
    protected _planGearSort(
        event: DragEvent,
        source: SohlItem,
    ): { _id: string; sort: number }[] {
        const sourceId = source.id;
        if (!sourceId) return [];

        const targetEl = (event.target as HTMLElement)?.closest?.(
            "[data-item-id]",
        ) as HTMLElement | null;
        const targetId = targetEl?.dataset.itemId;
        if (!targetId || targetId === sourceId) return [];

        const items = this.document.items;
        const target = items.get(targetId) as SohlItem | undefined;
        if (!target) return [];

        // Siblings are the other rows in the drop target's list (its section),
        // so a cross-section drop sorts within the destination section.
        const children: Element[] = Array.from(
            targetEl?.parentElement?.children ?? [],
        );
        const siblings: SohlItem[] = children.reduce((acc: SohlItem[], el) => {
            const itemId = (el as HTMLElement).dataset.itemId || "";
            const item = items.get(itemId) as SohlItem | undefined;
            if (item && item.id !== sourceId) acc.push(item);
            return acc;
        }, []);

        const sorted = foundry.utils.performIntegerSort(source, {
            target,
            siblings,
        });
        return sorted.map(({ target, update }) => ({
            _id: target.id as string,
            sort: (update as any).sort,
        }));
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
                dragSelector: ".gear-list .item",
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
            runAction: BeingSheet._onRunAction,
            createAction: BeingSheet._onCreateAction,
            editAction: BeingSheet._onEditAction,
            deleteAction: BeingSheet._onDeleteAction,
            makeDefaultMedium: BeingSheet._onMakeDefaultMedium,
        },
    };

    /**
     * Handle clicks on an item-create control (class `item-create`,
     * `data-action="createItem"`). Reads the control's `data-type` and
     * `data-sub-type` (or `data-subtype`) to pre-seed the create dialog, then
     * opens `SohlItem.createDialog` parented to this being.
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
     * Resolve the {@link sohl.entity.action.SohlAction} for the clicked Actions-tab row from its
     * `data-action-name` (the action shortcode).
     * @param target - An element on or inside the action row.
     * @returns The action, or `undefined` if the row/shortcode can't be resolved.
     */
    protected _actionFromRow(target: HTMLElement): SohlAction | undefined {
        const shortcode = target
            .closest("[data-action-name]")
            ?.getAttribute("data-action-name");
        if (!shortcode) return undefined;
        return this.document.logic?.actions.get(shortcode) as
            | SohlAction
            | undefined;
    }

    /**
     * Run the action for the clicked Actions-tab row (shift-click skips its
     * configuration dialog). Script actions invoke their bound Macro.
     *
     * @param event - The triggering pointer event (shift skips the dialog).
     * @param target - The clicked control, inside a `data-action-name` row.
     */
    protected static async _onRunAction(
        this: BeingSheet,
        event: PointerEvent,
        target: HTMLElement,
    ): Promise<void> {
        const action = this._actionFromRow(target);
        if (!action) return;
        const context = new SohlActionContext({
            speaker: (this.document as any).getSpeaker(),
            type: (action.data as any).shortcode,
            title: (action.data as any).title,
            skipDialog: event.shiftKey,
        });
        await action.execute(context);
    }

    /**
     * Make the clicked movement medium the being's corpus's current (default)
     * one. Invokes the corpus's `makeDefaultMedium` intrinsic action with the
     * medium carried in the action scope; that executor persists
     * `system.currentMoveMedium`.
     * @param _event - The triggering pointer event (unused).
     * @param target - The clicked star, inside a `data-medium` row.
     */
    protected static async _onMakeDefaultMedium(
        this: BeingSheet,
        _event: PointerEvent,
        target: HTMLElement,
    ): Promise<void> {
        const medium = target
            .closest("[data-medium]")
            ?.getAttribute("data-medium");
        if (!medium) return;
        const corpus = (this.document.logic as BeingLogic | undefined)?.corpus;
        const action = corpus?.actions.get("makeDefaultMedium") as
            | SohlAction
            | undefined;
        if (!corpus || !action) return;
        const context = new SohlActionContext({
            speaker: (this.document as any).getSpeaker(),
            type: "makeDefaultMedium",
            title: (action.data as any).title,
            scope: { medium },
        });
        await action.execute(context);
    }

    /**
     * Create a custom (script) action. Prompts for an existing world Macro to
     * bind — or `<New Macro…>`, which opens Foundry's Macro-create dialog — then
     * appends a SCRIPT action def (bound by the Macro's UUID) to
     * `system.actionDefs`. Macro authoring is left entirely to Foundry's own UI.
     *
     * @param _event - The triggering pointer event (unused).
     * @param _target - The clicked create control (unused).
     */
    protected static async _onCreateAction(
        this: BeingSheet,
        _event: PointerEvent,
        _target: HTMLElement,
    ): Promise<void> {
        const esc = (v: unknown): string =>
            String(v ?? "").replace(
                /[&<>"']/g,
                (c) =>
                    (
                        ({
                            "&": "&amp;",
                            "<": "&lt;",
                            ">": "&gt;",
                            '"': "&quot;",
                            "'": "&#39;",
                        }) as Record<string, string>
                    )[c],
            );
        const options = (game as any).macros.contents
            .map(
                (m: any) =>
                    `<option value="${esc(m.uuid)}">${esc(m.name)}</option>`,
            )
            .join("");
        const content = `<form><div class="form-group"><label>${esc(
            game.i18n.localize("SOHL.Actions.name.label"),
        )}</label><input type="text" name="title" autofocus /></div><div class="form-group"><label>${esc(
            game.i18n.localize("SOHL.Actions.macro.label"),
        )}</label><select name="macro"><option value="__new__">${esc(
            game.i18n.localize("SOHL.Actions.newMacro"),
        )}</option>${options}</select></div></form>`;

        const result = (await (foundry.applications.api.DialogV2 as any).prompt(
            {
                window: { title: game.i18n.localize("SOHL.Actions.create") },
                content,
                ok: {
                    label: game.i18n.localize("SOHL.Actions.create"),
                    callback: (_e: Event, button: any) =>
                        new (foundry.applications.ux as any).FormDataExtended(
                            button.form,
                        ).object,
                },
            },
        )) as { title?: string; macro?: string } | null;
        if (!result?.macro) return;
        const title = String(result.title ?? "").trim();
        if (!title) {
            sohl.log.uiWarn(game.i18n.localize("SOHL.Actions.nameRequired"));
            return;
        }

        let macro: any;
        if (result.macro === "__new__") {
            // Create the Macro ourselves (never via the default create dialog)
            // so it is guaranteed to be a SCRIPT macro. Name it after the
            // owner and action, disambiguated against existing Macro names;
            // the folder is intentionally left to the user's own organization.
            const base = `${this.document.name} ${title}`;
            const existing = new Set(
                (game as any).macros.map((m: any) => m.name),
            );
            let name = base;
            for (let n = 2; existing.has(name); n++) name = `${base} (${n})`;
            macro = await (Macro as any).create({
                name,
                type: "script",
                command: "",
            });
            // Defer authoring the Macro body to Foundry's own Macro sheet.
            void fvttRenderSheet(macro);
        } else {
            macro = await fromUuid(result.macro);
        }
        if (!macro) return;

        const def = {
            shortcode: foundry.utils.randomID(),
            subType: ACTION_SUBTYPE.SCRIPT,
            title,
            scope: SOHL_ACTION_SCOPE.SELF,
            executor: macro.uuid,
            trigger: "true",
            visible: "true",
            iconFAClass: "fa-solid fa-bolt",
            group: SOHL_CONTEXT_MENU_SORT_GROUP.GENERAL,
        };
        const actionDefs = [
            ...(((this.document.system as any).actionDefs as any[]) ?? []),
            def,
        ];
        await this.document.update({ "system.actionDefs": actionDefs } as any);
    }

    /**
     * Open the bound Macro's own sheet for the clicked custom action, deferring
     * all macro editing to Foundry's Macro UI.
     *
     * @param _event - The triggering pointer event (unused).
     * @param target - The clicked control, inside a `data-action-name` row.
     */
    protected static async _onEditAction(
        this: BeingSheet,
        _event: PointerEvent,
        target: HTMLElement,
    ): Promise<void> {
        const action = this._actionFromRow(target);
        const uuid = (action?.data as any)?.executor;
        if (!uuid) return;
        const macro: any = await fromUuid(uuid);
        void fvttRenderSheet(macro);
    }

    /**
     * Remove the clicked custom action from `system.actionDefs`. This only
     * disassociates the action — the bound Macro document is left untouched.
     *
     * @param _event - The triggering pointer event (unused).
     * @param target - The clicked control, inside a `data-action-name` row.
     */
    protected static async _onDeleteAction(
        this: BeingSheet,
        _event: PointerEvent,
        target: HTMLElement,
    ): Promise<void> {
        const shortcode = target
            .closest("[data-action-name]")
            ?.getAttribute("data-action-name");
        if (!shortcode) return;
        const current =
            ((this.document.system as any).actionDefs as any[]) ?? [];
        const actionDefs = current.filter((d) => d.shortcode !== shortcode);
        if (actionDefs.length === current.length) return;
        const confirmed = await foundry.applications.api.DialogV2.confirm({
            window: { title: game.i18n.localize("SOHL.Actions.remove") },
            content: `<p>${game.i18n.localize("SOHL.Actions.removeHint")}</p>`,
        } as any);
        if (!confirmed) return;
        await this.document.update({ "system.actionDefs": actionDefs } as any);
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
     * Open an embedded item's sheet — the Edit anchor (e.g. the Corpus row).
     *
     * @param _event - The triggering pointer event (unused).
     * @param target - The clicked control, within a `data-item-id` row.
     */
    protected static async _onEditItem(
        this: BeingSheet,
        _event: PointerEvent,
        target: HTMLElement,
    ): Promise<void> {
        void fvttRenderSheet(this._itemFromControl(target));
    }

    /**
     * Delete an embedded item after confirmation — the Delete anchor (e.g. the
     * Corpus row; deleting the corpus returns the being to its no-body state).
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
     * the blank option) to that part's `heldItemId` on the corpus's body
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
        const corpus = (this.document.logic as BeingLogic)?.logicTypes?.[
            ITEM_KIND.CORPUS
        ]?.[0];
        if (!corpus) return;
        const payload = corpus.structure.setPartFieldsUpdate([
            { index: partIndex, changes: { heldItemId: itemId } },
        ]);
        if (Object.keys(payload).length) await corpus.data.update(payload);
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

        const item = this.document.items.get(itemId);
        const itemLogic = item?.logic as any;
        if (!item || !itemLogic) return;

        // Dispatch through the owning item's intrinsic action (attack →
        // attackTest, etc.), passing the row's strike-mode id in scope so the
        // action acts on the clicked mode. Weapons and combat techniques both
        // carry these actions, so the same anchor handler serves both.
        const action = itemLogic.actions?.get(`${testKind}Test`) as
            | SohlAction
            | undefined;
        if (!action) return;

        const sm = itemLogic.strikeModes?.find(
            (m: StrikeModeBase) => m.id === smId,
        ) as StrikeModeBase | undefined;
        const context = new SohlActionContext({
            speaker: (this.document as any).getSpeaker(),
            type: `strike-${testKind}`,
            title: sm ? `${item.name} – ${sm.name} (${testKind})` : item.name,
            skipDialog: event.shiftKey,
            scope: { strikeModeId: smId },
        });

        await action.execute(context);
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

        // Aural-Shock and Fatigue are read-only indicators lit from the actor's
        // active afflictions of that subtype (the prototype drove them from
        // afflictions, not toggleable statuses; Fatigue is not a status) — #306.
        const activeAfflictionSubTypes = new Set<string>();
        for (const item of ((actor.itemTypes as any)?.[ITEM_KIND.AFFLICTION] ??
            []) as Iterable<any>) {
            const al = item?.logic;
            if (al?.data?.subType && (al.level?.effective ?? 0) > 0) {
                activeAfflictionSubTypes.add(al.data.subType);
            }
        }
        const statusEffects = buildStatusPills(
            statuses,
            activeAfflictionSubTypes,
        );

        // Body-part lozenges, sourced from the actor's Corpus body structure
        // (dynamic — varies by corpus), each colored by its derived impairment
        // status (#464). Impairment comes from the actor's active injuries,
        // grouped onto parts by the injured location's shortcode.
        const corpusItem = (actor.itemTypes as any)?.[ITEM_KIND.CORPUS]?.[0];
        const structure = (corpusItem?.logic as CorpusLogic | undefined)
            ?.structure;
        const injuries: LocationInjury[] = [];
        for (const item of ((actor.itemTypes as any)?.[ITEM_KIND.TRAUMA] ??
            []) as Iterable<any>) {
            const tl = item?.logic;
            const code = tl?.data?.bodyLocationCode;
            const level = tl?.level?.effective ?? 0;
            if (code && level > 0) {
                injuries.push({
                    locationShortcode: code,
                    level,
                    healingRate: tl?.healingRate?.effective ?? 0,
                });
            }
        }
        const bodyParts = buildBodyPartLozenges(structure, injuries);

        // Health bar: the banded impairment value against a fixed max of 100
        // (#470). `healthBand` is the qualitative label shown to the player.
        const health = logic?.data?.health;
        const healthMax = health?.max ?? 0;
        const healthPct =
            healthMax > 0 ?
                clampHealthPct((health!.value / healthMax) * 100)
            :   0;

        return Object.assign(context, {
            actorName: actor.name,
            actorImg: actor.img,
            health,
            healthPct,
            healthBand: logic?.healthBand,
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
     * Prepare context for the Facade tab: the bio image (`system.portrait`) and
     * the rich-text physical-appearance description (`system.appearance`).
     *
     * @param context - The render context to augment.
     * @param _options - The render options (unused).
     * @returns The augmented render context.
     */
    protected override async _prepareFacadeContext(
        context: RenderContext,
        _options: RenderOptions,
    ): Promise<RenderContext> {
        // Appearance is edited by a <prose-mirror> element (see facade.hbs),
        // which enriches its own content — no pre-enriched `appearanceHTML`.
        const system = this.document.system as any;
        return Object.assign(context, {
            portrait: system.portrait,
        });
    }

    /**
     * Prepare context for the Profile tab: attributes, traits, affiliations, dossier.
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
            const score = attrLogic?.score?.effective ?? 0;
            const bands = (attr.system as any).valueDesc ?? [];
            return {
                id: attr.id,
                uuid: attr.uuid,
                name: attr.name,
                score,
                descriptor: attributeDescriptor(score, bands),
                tl: attrLogic?.masteryLevel?.effective ?? 0,
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
            isCurrent: boolean;
        }[] = [];
        // A being has 0 or 1 corpus. List every movement profile it carries with
        // its tactical move (feet/round); the one matching the corpus's
        // `currentMoveMedium` is the active (starred) default.
        const corpus = logic?.corpus;
        if (corpus) {
            const current = corpus.data.currentMoveMedium;
            for (const profile of corpus.data.movementProfiles ?? []) {
                movement.push({
                    medium: profile.medium,
                    label: MovementMediumChoices[profile.medium],
                    value: profile.feetPerRound,
                    isCurrent: profile.medium === current,
                });
            }
        }

        return Object.assign(context, {
            attributes,
            traitGroups,
            affiliations,
            movement,
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
                    img: skill.img ?? "",
                    subType: sys.subType,
                    sb: skillLogic?.skillBase ?? 0,
                    ml: skillLogic?.masteryLevel?.base ?? 0,
                    index: skillLogic?.masteryLevel?.index ?? 0,
                    eml: skillLogic?.masteryLevel?.effective ?? 0,
                    fate: skillLogic?.fateMasteryLevel?.effective ?? 0,
                    disabled: !!skillLogic?.masteryLevel?.disabled,
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

        // Body structure for anatomy display — sourced from the actor's Corpus
        // item. The Corpus is a singleton (0 or 1): `corpus` drives the Combat
        // tab's Corpus row (+ Add disabled when one exists; Edit/Delete anchors).
        const corpusItem = (actor.itemTypes as any)?.[ITEM_KIND.CORPUS]?.[0];
        const corpusLogic = corpusItem?.logic as CorpusLogic | undefined;
        const structure = corpusLogic?.structure;

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
        const heldItemLimbs = (structure?.parts ?? [])
            .filter((part: any) => part.canHoldItem)
            .map((part: any) => ({
                index: part.index,
                // Readable limb name ("Right Arm"), not the raw part code
                // ("RARMPART") — the code is only a fallback (#509).
                label: part.name ?? part.shortcode,
                heldItemId: part.heldItem?.id ?? "",
            }));

        // Read-only Body Locations tree: each part with its locations' effective
        // protection (natural `protectionBase` + worn-armor `armorProtection`,
        // aggregated during the actor's evaluate phase), the covering material
        // layers, and shock. Held items are shown via the Held Items dropdowns,
        // not here; hit probability and zones are no longer modeled (#509).
        const bodyParts = buildBodyLocationTree(
            (structure?.parts ?? []).map((part: any) => ({
                label: part.name ?? part.shortcode,
                locations: (part.locations ?? []).map((loc: any) => ({
                    name: loc.name,
                    layers: loc.armorType ?? "",
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
            corpus: corpusItem,
            structure,
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
                    subType: sys.subType,
                    subTypeLabel: game.i18n.localize(
                        (TraumaSubTypeChoices as Record<string, string>)[
                            sys.subType
                        ] ?? sys.subType,
                    ),
                    level: tl?.level?.effective ?? 0,
                    healingRate: tl?.healingRate?.effective ?? 0,
                    healingRateDisabled: !!tl?.healingRate?.disabled,
                    isTreated: !!tl?.isTreated,
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
                    subTypeLabel: game.i18n.localize(
                        (AfflictionSubTypeChoices as Record<string, string>)[
                            sys.subType
                        ] ?? sys.subType,
                    ),
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

        // Mysteries: one section per subType, always shown (even when empty)
        // and in declared order, so every mystery category has a header.
        const mysteries = actor.itemTypes[ITEM_KIND.MYSTERY] ?? [];
        const mysteryBuckets = groupBySubType(
            mysteries,
            (mystery) => (mystery.system as any).subType,
        );
        const mysterySections = MysterySubTypes.map((subType) => ({
            subType,
            label: game.i18n.localize(
                (MysterySubTypeChoices as Record<string, string>)[subType] ??
                    subType,
            ),
            items: mysteryBuckets[subType] ?? [],
        }));

        // Mystical abilities: one section per subType, always shown (even when
        // empty) and in declared order, so every ability category has a header.
        const abilities = actor.itemTypes[ITEM_KIND.MYSTICALABILITY] ?? [];
        const abilityBuckets = groupBySubType(
            abilities,
            (ability) => (ability.system as any).subType,
        );
        const abilitySections = MysticalAbilitySubTypes.map((subType) => ({
            subType,
            label: game.i18n.localize(
                (MysticalAbilitySubTypeChoices as Record<string, string>)[
                    subType
                ] ?? subType,
            ),
            items: abilityBuckets[subType] ?? [],
        }));

        return Object.assign(context, {
            mysterySections,
            abilitySections,
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
        const logic = actor.logic as BeingLogic;

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

        const tree = buildContainerTree(
            containerGear,
            allGear,
            (item) => item.id,
            (item) => (item.system as any).containerId,
        );

        // Map a gear item to a compact display row.
        const toRow = (item: SohlItem) => {
            const gl = item.logic as any;
            const sys = item.system as any;
            const q = sys.qualityBase ?? 0;
            return {
                id: item.id,
                uuid: item.uuid,
                name: item.name,
                img: item.img ?? "",
                type: item.type,
                typeLabel: game.i18n.localize(`TYPES.Item.${item.type}`),
                quantity: sys.quantity ?? 1,
                weight: gl?.weight?.effective ?? sys.weightBase ?? 0,
                quality: `${q >= 0 ? "+" : ""}${q}`,
                durability: sys.durabilityBase ?? 0,
                notes: htmlToPlainText(sys.notes ?? ""),
                isCarried: !!sys.isCarried,
                isEquipped: !!sys.isEquipped,
                isArmor: item.type === ITEM_KIND.ARMORGEAR,
            };
        };
        // Total weight of a set of gear items (per-unit effective weight × qty).
        const round1 = (n: number) => Math.round(n * 10) / 10;
        const usedWeight = (items: SohlItem[]) =>
            round1(
                items.reduce((total, it) => {
                    const gl = it.logic as any;
                    const sys = it.system as any;
                    const w = gl?.weight?.effective ?? sys.weightBase ?? 0;
                    return total + w * (sys.quantity ?? 1);
                }, 0),
            );

        // On Body has no hard capacity cap; it summarizes the being's overall
        // load — its total carried-gear weight (accumulated ground-up on
        // `BeingLogic.carriedWeight`) and the resulting encumbrance for its active
        // movement medium (`corpus.encumbrance`, 0 when the being has no corpus,
        // e.g. an incorporeal being).
        const onBody = {
            items: tree.onBodyItems.map(toRow),
            capacity: {
                isEncumbrance: true,
                used: round1(logic.carriedWeight?.effective ?? 0),
                encumbrance: logic.corpus?.encumbrance?.effective ?? 0,
            },
        };
        const containers = tree.containers.map((node) => ({
            id: node.container.id,
            name: node.container.name,
            items: node.items.map(toRow),
            capacity: {
                used: usedWeight(node.items),
                max: (node.container.logic as any)?.maxCapacity?.effective ?? 0,
            },
        }));

        return Object.assign(context, { onBody, containers });
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
        const logic = this.document.logic;
        // Hidden-group actions are internal (lifecycle hooks) and never shown.
        const all = (logic ? [...logic.actions.values()] : []).filter(
            (a) =>
                (a.data as any).group !== SOHL_CONTEXT_MENU_SORT_GROUP.HIDDEN,
        );
        // Custom (script) actions are GM-authored and editable; intrinsic
        // actions are code-defined and read-only. Split them into their own
        // sections.
        const customActions = all.filter(
            (a) => (a.data as any).subType === ACTION_SUBTYPE.SCRIPT,
        );
        const intrinsicActions = all.filter(
            (a) => (a.data as any).subType === ACTION_SUBTYPE.INTRINSIC,
        );
        return Object.assign(context, { customActions, intrinsicActions });
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
