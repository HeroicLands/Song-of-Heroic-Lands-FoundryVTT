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
    createAction,
    editAction,
    deleteAction,
    runAction,
} from "@src/core/foundry/sheet-actions";
import {
    fvttCallHook,
    fvttEnrichHTML,
    fvttRenderSheet,
} from "@src/core/FoundryHelpers";
import {
    ACTION_SUBTYPE,
    SOHL_CONTEXT_MENU_SORT_GROUP,
    ITEM_KIND,
    MOVEMENT_MEDIUM,
    GearKinds,
    MovementMedium,
    MovementMediumChoices,
    MysterySubTypes,
    MysterySubTypeChoices,
    MysticalAbilitySubTypes,
    MysticalAbilitySubTypeChoices,
    SkillSubTypeChoices,
    AfflictionSubTypes,
    AfflictionSubTypeChoices,
    TraumaSubTypes,
    TraumaSubTypeChoices,
    BodyRoleChoices,
} from "@src/utils/constants";
import { SohlItem } from "@src/document/item/foundry/SohlItem";
import type { BeingLogic } from "@src/document/actor/logic/BeingLogic";
import { getActorBody } from "@src/document/actor/logic/BodyLogic";
import {
    addBodyZone,
    addBodyPart,
    addBodyLocation,
    bindBodyStructureContextMenu,
} from "@src/document/actor/foundry/body-structure-sheet";
import { NONE_MOVE_PROFILE } from "@src/document/actor/logic/movement";
import type { LocationInjury } from "@src/entity/body/impairment";
import type { AttributeLogic } from "@src/document/item/logic/AttributeLogic";
import type { SkillLogic } from "@src/document/item/logic/SkillLogic";
import {
    groupBySubType,
    attributeDescriptor,
    buildSkillGroups,
    SKILL_DISPLAY_SUBTYPE_ORDER,
    buildInjurySections,
    buildAfflictionGroups,
    buildAffiliationRows,
    buildHoldableGear,
    buildBodyLocationTree,
    type BodyZoneLike,
    buildContainerTree,
    resolveGearContainerMove,
    htmlToPlainText,
    buildStatusPills,
    buildBodyPartLozenges,
    clampHealthPct,
    filterHeldWeapons,
    splitWeaponsByRange,
    usableHeldStrikeModes,
    mysticalAbilityColumns,
    mysticalAbilityLedgerCols,
} from "@src/document/actor/logic/being-sheet-view";
import {
    formatPrintHealthLine,
    summarizeActiveStatuses,
    summarizeInjuredParts,
    formatPrintChargesDisplay,
    formatPrintLevel,
    PRINT_EM_DASH,
} from "@src/document/actor/logic/being-print-view";
import type { BodyPartStatus } from "@src/entity/body/impairment";
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

        // Profile tab Body Structure tree: click the per-row ⋮ to Edit a body
        // zone, part, or location in its own auto-saving editor (#721 / #722).
        // The tree moved from Combat to Profile in #782; the menu binds at the
        // sheet root, matching whichever tab carries the `*-contextmenu` hooks.
        if ((this as any).isEditable && (this as any).element) {
            bindBodyStructureContextMenu(this.document, (this as any).element);
        }
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

    /**
     * Begin a drag. A Body Structure row (a zone header, a part header, or a
     * hit-location row — marked `draggable` with `data-zone-shortcode` /
     * `data-part-shortcode` / `data-location-shortcode`) carries a private
     * `sohlBodyDrag` payload so {@link _onDrop} can reorder or re-parent it;
     * every other draggable (owned items, effects) defers to the base handler.
     *
     * @param event - The originating drag event.
     */
    protected _onDragStart(event: DragEvent): void {
        const li = event.currentTarget as HTMLElement;
        if (
            li?.dataset?.partShortcode != null ||
            li?.dataset?.zoneShortcode != null
        ) {
            const isLocation = li.dataset.locationShortcode != null;
            const isPart = !isLocation && li.dataset.partShortcode != null;
            const dragData = {
                sohlBodyDrag: {
                    kind:
                        isLocation ? "bodylocation"
                        : isPart ? "bodypart"
                        : "bodyzone",
                    zoneShortcode: li.dataset.zoneShortcode ?? null,
                    partShortcode: li.dataset.partShortcode ?? null,
                    locationShortcode:
                        isLocation ? li.dataset.locationShortcode : null,
                },
            };
            event.dataTransfer?.setData("text/plain", JSON.stringify(dragData));
            return;
        }
        // The base drag handler lives on the SohlDataModel sheet mixin, which
        // the static types don't surface here; reach it via the prototype chain.
        (Object.getPrototypeOf(BeingSheet.prototype) as any)._onDragStart.call(
            this,
            event,
        );
    }

    /**
     * Conclude a drop. A `sohlBodyDrag` payload reorders a body part or moves a
     * hit location (dropping a location onto a part header appends it to that
     * part); anything else defers to the base handler. Source and destination are
     * addressed by shortcode and resolved to indices against the live structure,
     * then written through the structure's #247-safe whole-array update builders.
     *
     * @param event - The originating drop event.
     */
    protected async _onDrop(event: DragEvent): Promise<void> {
        let data: any = {};
        try {
            data = JSON.parse(
                event.dataTransfer?.getData("text/plain") || "{}",
            );
        } catch {
            data = {};
        }
        const drag = data?.sohlBodyDrag;
        if (!drag) {
            // Defer to the base drop handler (item/effect/actor/folder), reached
            // via the prototype chain since the static types don't surface it.
            await (
                Object.getPrototypeOf(BeingSheet.prototype) as any
            )._onDrop.call(this, event);
            return;
        }

        const structure = getActorBody(this.document.logic)?.structure;
        if (!structure) return;
        const targetEl = event.target as HTMLElement | null;

        if (drag.kind === "bodyzone") {
            const fromZone = structure.getZoneByCode(drag.zoneShortcode);
            const toEl = targetEl?.closest(
                "[data-zone-shortcode]",
            ) as HTMLElement | null;
            const toZone =
                toEl ?
                    structure.getZoneByCode(toEl.dataset.zoneShortcode ?? "")
                :   undefined;
            if (!fromZone || !toZone || toZone.index === fromZone.index) return;
            await this.document.update(
                structure.moveZoneUpdate(fromZone.index, toZone.index),
            );
            return;
        }

        if (drag.kind === "bodypart") {
            const fromPart = structure.getPartByCode(drag.partShortcode);
            if (!fromPart) return;
            // Dropping on a part inserts at that part's position within its
            // zone; dropping on a bare zone header appends to that zone's end.
            const partEl = targetEl?.closest(
                "[data-part-shortcode]",
            ) as HTMLElement | null;
            const toPart =
                partEl ?
                    structure.getPartByCode(partEl.dataset.partShortcode ?? "")
                :   undefined;
            const zoneEl = targetEl?.closest(
                "[data-zone-shortcode]",
            ) as HTMLElement | null;
            const toZone =
                toPart?.zone ??
                (zoneEl ?
                    structure.getZoneByCode(zoneEl.dataset.zoneShortcode ?? "")
                :   undefined);
            if (!toZone) return;
            const toPosition = toPart?.position ?? toZone.parts.length;
            if (toPart?.index === fromPart.index) return;
            await this.document.update(
                structure.movePartUpdate(
                    fromPart.index,
                    toZone.shortcode,
                    toPosition,
                ),
            );
            return;
        }

        // A location drop: resolve the source location, then the destination —
        // a specific location row (insert at its position) or a part
        // group/header (append to that part's end).
        const fromLoc = structure.getLocationByCode(drag.locationShortcode);
        if (!fromLoc) return;
        const partEl = targetEl?.closest(
            "[data-part-shortcode]",
        ) as HTMLElement | null;
        const toPart =
            partEl ?
                structure.getPartByCode(partEl.dataset.partShortcode ?? "")
            :   undefined;
        if (!toPart) return;
        const locEl = targetEl?.closest(
            "[data-location-shortcode]",
        ) as HTMLElement | null;
        const toLoc =
            locEl ?
                (toPart.getLocationByCode(locEl.dataset.locationShortcode ?? "")
                    ?.position ?? toPart.locations.length)
            :   toPart.locations.length;
        if (
            toPart.shortcode === fromLoc.bodyPart.shortcode &&
            toLoc === fromLoc.position
        ) {
            return;
        }
        await this.document.update(
            structure.moveLocationUpdate(
                fromLoc.index,
                toPart.shortcode,
                toLoc,
            ),
        );
    }

    /**
     * `data-action="addBodyZone"`: prompt for a new body zone and append it to
     * this being's body structure (#780).
     *
     * @param _event - The triggering pointer event (unused).
     * @param _target - The clicked add control (unused).
     */
    protected static async _onAddBodyZone(
        this: BeingSheet,
        _event: PointerEvent,
        _target: HTMLElement,
    ): Promise<void> {
        await addBodyZone(this.document);
    }

    /**
     * `data-action="addBodyPart"`: prompt for a new body part and append it to
     * the zone named by the control's `data-zone-shortcode`, opening its editor
     * (#720/#780).
     *
     * @param _event - The triggering pointer event (unused).
     * @param target - The clicked add control, inside a `data-zone-shortcode` row.
     */
    protected static async _onAddBodyPart(
        this: BeingSheet,
        _event: PointerEvent,
        target: HTMLElement,
    ): Promise<void> {
        const code = target
            .closest("[data-zone-shortcode]")
            ?.getAttribute("data-zone-shortcode");
        if (!code) return;
        await addBodyPart(this.document, code);
    }

    /**
     * `data-action="addBodyLocation"`: prompt for a new hit location and append
     * it to the body part named by the control's `data-part-shortcode` (#720).
     *
     * @param _event - The triggering pointer event (unused).
     * @param target - The clicked add control, inside a `data-part-shortcode` row.
     */
    protected static async _onAddBodyLocation(
        this: BeingSheet,
        _event: PointerEvent,
        target: HTMLElement,
    ): Promise<void> {
        const code = target
            .closest("[data-part-shortcode]")
            ?.getAttribute("data-part-shortcode");
        if (!code) return;
        await addBodyLocation(this.document, code);
    }

    /**
     * `data-action="editIdentity"`: open a dialog to edit the being's `name` and
     * `system.shortcode` together (the header identity pencil). Both are applied
     * in a single `actor.update`; the document's update-path guard enforces the
     * unique `(type, shortcode)` key and warns on a duplicate (#766). A blank
     * name is refused; only changed fields are written. The dialog content is
     * static markup with the current values HTML-escaped into value attributes —
     * never interpolated as markup.
     *
     * @param _event - The triggering pointer event (unused).
     * @param _target - The clicked pencil (unused).
     */
    protected static async _onEditIdentity(
        this: BeingSheet,
        _event: PointerEvent,
        _target: HTMLElement,
    ): Promise<void> {
        const actor = this.document;
        const currentName = actor.name ?? "";
        const currentCode = (actor.system as any).shortcode ?? "";
        const esc = foundry.utils.escapeHTML;
        const content = `
            <form class="edit-identity standard-form">
                <div class="form-group">
                    <label>Name</label>
                    <input type="text" name="name" value="${esc(currentName)}" autofocus />
                </div>
                <div class="form-group">
                    <label>Shortcode</label>
                    <input type="text" name="shortcode" value="${esc(currentCode)}" />
                </div>
            </form>`;
        let fd: PlainObject | undefined;
        try {
            fd = (await foundry.applications.api.DialogV2.prompt({
                window: {
                    title: game.i18n.localize("SOHL.Being.EditIdentity"),
                    icon: "fa-solid fa-pen",
                },
                content,
                ok: {
                    label: "Save",
                    icon: "fa-solid fa-save",
                    callback: (_event: Event, button: any) =>
                        new foundry.applications.ux.FormDataExtended(
                            button.form,
                        ).object,
                },
            } as any)) as PlainObject | undefined;
        } catch {
            return;
        }
        if (!fd) return;
        const name = String(fd.name ?? "").trim();
        const shortcode = String(fd.shortcode ?? "").trim();
        if (!name) {
            sohl.log.uiWarn("Name cannot be blank.");
            return;
        }
        const update: PlainObject = {};
        if (name !== currentName) update.name = name;
        if (shortcode !== currentCode) update["system.shortcode"] = shortcode;
        if (Object.keys(update).length) await actor.update(update);
    }

    /**
     * `data-action="addMovementProfile"`: prompt for a movement medium (limited
     * to media the being does not yet have a profile for) and a tactical move
     * (feet/round), then append the new profile to `system.movementProfiles`.
     * The whole array is written back (never an element-by-index update — #247).
     * The option list is built from the trusted, localized `MovementMediumChoices`
     * enum labels, never from persisted user data.
     *
     * @param _event - The triggering pointer event (unused).
     * @param _target - The clicked add control (unused).
     */
    protected static async _onAddMovementProfile(
        this: BeingSheet,
        _event: PointerEvent,
        _target: HTMLElement,
    ): Promise<void> {
        const actor = this.document;
        const logic = actor.logic as BeingLogic | undefined;
        const profiles = logic?.data.movementProfiles ?? [];
        const used = new Set(profiles.map((p) => p.medium));
        const available = (
            Object.entries(MovementMediumChoices) as [MovementMedium, string][]
        ).filter(
            ([value]) => value !== MOVEMENT_MEDIUM.NONE && !used.has(value),
        );
        if (!available.length) {
            sohl.log.uiWarn(
                "Every movement medium already has a movement profile.",
            );
            return;
        }
        const options = available
            .map(
                ([value, label]) =>
                    `<option value="${value}">${foundry.utils.escapeHTML(
                        game.i18n.localize(label),
                    )}</option>`,
            )
            .join("");
        const content = `
            <form class="add-movement-profile standard-form">
                <div class="form-group">
                    <label>${game.i18n.localize("SOHL.Actor.SHEET.tab.movement.label")}</label>
                    <select name="medium">${options}</select>
                </div>
                <div class="form-group">
                    <label>${game.i18n.localize("SOHL.Being.movement.unit")}</label>
                    <input type="number" name="feetPerRound" value="0" min="0" step="1" />
                </div>
            </form>`;
        let fd: PlainObject | undefined;
        try {
            fd = (await foundry.applications.api.DialogV2.prompt({
                window: {
                    title: "Add Movement Profile",
                    icon: "fa-solid fa-person-running",
                },
                content,
                ok: {
                    label: "Create",
                    icon: "fa-solid fa-plus",
                    callback: (_event: Event, button: any) =>
                        new foundry.applications.ux.FormDataExtended(
                            button.form,
                        ).object,
                },
            } as any)) as PlainObject | undefined;
        } catch {
            return;
        }
        if (!fd) return;
        const medium = String(fd.medium ?? "") as MovementMedium;
        if (!medium || used.has(medium)) return;
        const feetPerRound = Math.max(
            0,
            Math.round(Number(fd.feetPerRound) || 0),
        );
        const next = [
            ...profiles,
            {
                medium,
                feetPerRound,
                leaguesPerWatch: 0,
                encumbrance: "0",
                strMod: "0",
                disabled: false,
            },
        ];
        await actor.update({ "system.movementProfiles": next } as PlainObject);
    }

    /**
     * Set a Profile body-structure disclosure row's open state: toggle its
     * `is-open` class and swap its chevron icon (right ↔ down). Pure DOM — no
     * document mutation.
     *
     * @param el - The zone or part row element.
     * @param open - Whether the row should render as expanded.
     */
    private static _setDisclosureState(el: Element, open: boolean): void {
        el.classList.toggle("is-open", open);
        const icon = el.querySelector(":scope > .disclosure i");
        if (icon) {
            icon.classList.toggle("fa-chevron-down", open);
            icon.classList.toggle("fa-chevron-right", !open);
        }
    }

    /**
     * `data-action="toggleBodyStructureAll"`: expand or collapse the entire
     * Profile body-structure tree at once, swapping the toggle button's state,
     * icon, and label. Pure DOM disclosure — no document mutation.
     *
     * @param _event - The triggering pointer event (unused).
     * @param target - The clicked toggle-all button.
     */
    protected static _onToggleBodyStructureAll(
        this: BeingSheet,
        _event: PointerEvent,
        target: HTMLElement,
    ): void {
        const btn = target.closest(
            ".body-structure__toggle-all",
        ) as HTMLElement | null;
        if (!btn) return;
        const expandAll = btn.dataset.state !== "expanded";
        const section =
            btn.closest("section.tab") ?? ((this as any).element as Element);
        const container = section?.querySelector(".body-structure");
        if (!container) return;

        container
            .querySelectorAll(".body-structure__part")
            .forEach((el) =>
                el.classList.toggle(
                    "body-structure__part--collapsed",
                    !expandAll,
                ),
            );
        container
            .querySelectorAll(".body-structure__location")
            .forEach((el) =>
                el.classList.toggle(
                    "body-structure__location--collapsed",
                    !expandAll,
                ),
            );
        container
            .querySelectorAll(".body-structure__zone, .body-structure__part")
            .forEach((el) => BeingSheet._setDisclosureState(el, expandAll));

        btn.dataset.state = expandAll ? "expanded" : "collapsed";
        const icon = btn.querySelector("i");
        if (icon) {
            icon.classList.toggle("fa-angles-up", expandAll);
            icon.classList.toggle("fa-angles-down", !expandAll);
        }
        const label = btn.querySelector("span");
        if (label)
            label.textContent = expandAll ? "Collapse All" : "Expand All";
    }

    /**
     * `data-action="toggleZone"`: expand or collapse one body zone's parts (and,
     * for its expanded parts, their locations). Parts and locations are flat DOM
     * siblings following the zone header, so they are gathered by sibling-walking
     * up to the next zone. Pure DOM disclosure — no document mutation.
     *
     * @param _event - The triggering pointer event (unused).
     * @param target - The clicked zone disclosure control.
     */
    protected static _onToggleZone(
        this: BeingSheet,
        _event: PointerEvent,
        target: HTMLElement,
    ): void {
        const zoneEl = target.closest(
            ".body-structure__zone",
        ) as HTMLElement | null;
        if (!zoneEl) return;
        const open = !zoneEl.classList.contains("is-open");
        BeingSheet._setDisclosureState(zoneEl, open);

        const parts: HTMLElement[] = [];
        const locs: HTMLElement[] = [];
        let sib = zoneEl.nextElementSibling as HTMLElement | null;
        while (sib && !sib.classList.contains("body-structure__zone")) {
            if (sib.classList.contains("body-structure__part")) parts.push(sib);
            else if (sib.classList.contains("body-structure__location"))
                locs.push(sib);
            sib = sib.nextElementSibling as HTMLElement | null;
        }

        for (const part of parts) {
            part.classList.toggle("body-structure__part--collapsed", !open);
        }
        for (const loc of locs) {
            const code = loc.dataset.partShortcode;
            const partEl = parts.find((p) => p.dataset.partShortcode === code);
            const visible = open && !!partEl?.classList.contains("is-open");
            loc.classList.toggle(
                "body-structure__location--collapsed",
                !visible,
            );
        }
    }

    /**
     * `data-action="togglePart"`: expand or collapse one body part's hit
     * locations. Locations carry the owning part's shortcode
     * (`data-part-shortcode`), so they are matched directly. Pure DOM
     * disclosure — no document mutation.
     *
     * @param _event - The triggering pointer event (unused).
     * @param target - The clicked part disclosure control.
     */
    protected static _onTogglePart(
        this: BeingSheet,
        _event: PointerEvent,
        target: HTMLElement,
    ): void {
        const partEl = target.closest(
            ".body-structure__part",
        ) as HTMLElement | null;
        if (!partEl) return;
        const code = partEl.dataset.partShortcode;
        if (!code) return;
        const open = !partEl.classList.contains("is-open");
        BeingSheet._setDisclosureState(partEl, open);

        const container = partEl.closest(".body-structure");
        container
            ?.querySelectorAll(
                `.body-structure__location[data-part-shortcode="${CSS.escape(
                    code,
                )}"]`,
            )
            .forEach((loc) =>
                loc.classList.toggle(
                    "body-structure__location--collapsed",
                    !open,
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
                dragSelector: ".gear-list .item",
                dropSelector: null,
            },
            {
                // Body Structure editor: drag a zone header, part header, or
                // location row to reorder/move it within the Profile tab tree
                // (#720; the tree lives on Profile now — Combat is read-only).
                dragSelector: ".body-structure [draggable]",
                dropSelector: ".body-structure",
            },
        ],
        actions: {
            addBodyZone: BeingSheet._onAddBodyZone,
            addBodyPart: BeingSheet._onAddBodyPart,
            addBodyLocation: BeingSheet._onAddBodyLocation,
            editIdentity: BeingSheet._onEditIdentity,
            addMovementProfile: BeingSheet._onAddMovementProfile,
            toggleBodyStructureAll: BeingSheet._onToggleBodyStructureAll,
            toggleZone: BeingSheet._onToggleZone,
            togglePart: BeingSheet._onTogglePart,
            rollStrikeModeTest: BeingSheet._onRollStrikeModeTest,
            rollStrikeModeImpact: BeingSheet._onRollStrikeModeImpact,
            successTest: BeingSheet._onRollSkillTest,
            fateTest: BeingSheet._onRollFateTest,
            addInjury: BeingSheet._onAddInjury,
            toggleStatus: BeingSheet._onToggleStatus,
            toggleImproveFlag: BeingSheet._onToggleImproveFlag,
            toggleCarried: BeingSheet._onToggleCarried,
            toggleWorn: BeingSheet._onToggleWorn,
            editItem: BeingSheet._onEditItem,
            deleteItem: BeingSheet._onDeleteItem,
            createItem: BeingSheet._onCreateItem,
            runAction: BeingSheet._onRunAction,
            createAction: BeingSheet._onCreateAction,
            editAction: BeingSheet._onEditAction,
            deleteAction: BeingSheet._onDeleteAction,
            makeDefaultMedium: BeingSheet._onMakeDefaultMedium,
            printSheet: BeingSheet._onPrintSheet,
        },
    };

    /**
     * Add the window-header **print** control (#795). Clicking it renders the
     * dedicated, document-first print/export view (all sections at once, static
     * text) into a new browser window and opens that window's print dialog — from
     * which the viewer chooses print-to-printer, save-as-PDF, or (cancel and)
     * save-HTML, all native browser behavior. The control is available to any
     * viewer of the sheet (no GM gating), matching the read-only nature of a
     * character record.
     *
     * @returns The header-control entries, with the print control appended.
     */
    protected override _getHeaderControls(): foundry.applications.api.ApplicationV2.HeaderControlsEntry[] {
        const controls = super._getHeaderControls();
        controls.push({
            icon: "fa-solid fa-print",
            label: "SOHL.Print.control",
            action: "printSheet",
        });
        return controls;
    }

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

    /* -------------------------------------------- */
    /*  Print / Export (#795)                       */
    /* -------------------------------------------- */

    /**
     * `data-action="printSheet"` (window-header print control): render the
     * being's dedicated print/export view — the same view-models the tabs use,
     * re-presented as one static, paginated character record — into a **new
     * browser window** and open that window's print dialog. The viewer then
     * chooses printer / PDF / (cancel and) save-HTML natively; SoHL adds no
     * further UI.
     *
     * The header-control click is a user gesture, so `window.open` is not
     * popup-blocked. Reference assets (portrait, fonts, the system stylesheet)
     * load by **absolute URL** so they resolve in the detached window, and
     * `print()` fires only after the window's `load` (and a fonts-ready tick) so
     * styles and web fonts are applied first.
     *
     * @param _event - The triggering pointer event (unused).
     * @param _target - The clicked print control (unused).
     */
    protected static async _onPrintSheet(
        this: BeingSheet,
        _event: PointerEvent,
        _target: HTMLElement,
    ): Promise<void> {
        const doc = await this._renderPrintDocument();

        // The header-control click is a user gesture, so this is not blocked.
        const win = window.open("", "_blank", "width=880,height=1100");
        if (!win) {
            sohl.log.uiWarn(
                "Could not open a print window — please allow pop-ups for this site.",
            );
            return;
        }
        win.document.open();
        win.document.write(doc);
        win.document.close();

        // Fire print() only after styles + web fonts have loaded, so the record
        // is laid out before the dialog snapshots it. `load` covers the linked
        // stylesheet and images; `document.fonts.ready` covers the web fonts.
        const fire = (): void => {
            try {
                win.focus();
                win.print();
            } catch {
                /* the viewer closed the window before it could print */
            }
        };
        const gate = (): void => {
            const fonts = (
                win.document as { fonts?: { ready?: Promise<unknown> } }
            ).fonts;
            if (fonts?.ready) void fonts.ready.then(fire);
            else fire();
        };
        if (win.document.readyState === "complete") gate();
        else win.addEventListener("load", gate, { once: true });
    }

    /**
     * Assemble the full standalone HTML document for the print/export window:
     * the rendered print view wrapped in a minimal page that links the system
     * stylesheet by **absolute URL** (so it resolves in the detached window) and
     * carries the `@page` margins and body reset the print form needs. The print
     * view itself is trusted, system-authored markup, so it is rendered
     * **unsanitized** (`renderTemplate`, not the card sanitizer) — only the two
     * enriched rich-text fields carry user content, and those are enriched
     * through Foundry's own pipeline in {@link _buildPrintContext}.
     *
     * @returns The complete `<!doctype html>` document string.
     */
    protected async _renderPrintDocument(): Promise<string> {
        const context = await this._buildPrintContext();
        const body = await foundry.applications.handlebars.renderTemplate(
            "systems/sohl/templates/actor/being/print.hbs",
            context,
        );
        const cssHref = `${window.location.origin}/systems/sohl/css/sohl.css`;
        const title = `${this.document.name ?? "Character"} — ${game.i18n.localize(
            "SOHL.Print.masthead",
        )}`;
        // `@page` and the body reset are inlined (a fixed literal, no data) so
        // they apply only to this detached window and never to Foundry's own
        // print path; all visual styling lives in the linked stylesheet.
        // Force the light theme: the Manuscript light palette IS the print form,
        // and it must not flip to the dark token swap when the viewer's browser
        // prefers dark (`prefers-color-scheme`), which would waste ink and read
        // wrong on paper (#782 — light-first / print-native).
        return `<!doctype html>
<html lang="en" data-theme="light">
<head>
<meta charset="utf-8" />
<title>${foundry.utils.escapeHTML(title)}</title>
<link rel="stylesheet" href="${cssHref}" />
<style>
@page { margin: 16mm 14mm; }
html, body { margin: 0; padding: 0; background: #fff; }
</style>
</head>
<body class="sohl">${body}</body>
</html>`;
    }

    /**
     * Build the render context for the print/export view (#795) by reusing the
     * interactive sheet's own `_prepare*Context` builders — the **same** data
     * layer — and re-presenting it for a static record: the letterhead's
     * health/status/injury summary lines (the color-coded header pills and
     * lozenges have no meaning in grayscale print), the two rich-text fields
     * enriched to static HTML, and the combat strike modes / mysteries / gear
     * flattened from interactive (icon + tooltip) cells to plain text.
     *
     * @returns The print-view render context.
     */
    protected async _buildPrintContext(): Promise<PlainObject> {
        const opts = {} as RenderOptions;
        const rc = (): RenderContext => ({}) as RenderContext;
        const h = (await this._prepareHeaderContext(rc(), opts)) as PlainObject;
        const profile = (await this._prepareProfileContext(
            rc(),
            opts,
        )) as PlainObject;
        const skills = (await this._prepareSkillsContext(
            rc(),
            opts,
        )) as PlainObject;
        const combat = (await this._prepareCombatContext(
            rc(),
            opts,
        )) as PlainObject;
        const trauma = (await this._prepareTraumaContext(
            rc(),
            opts,
        )) as PlainObject;
        const mysteries = (await this._prepareMysteriesContext(
            rc(),
            opts,
        )) as PlainObject;
        const gear = (await this._prepareGearContext(
            rc(),
            opts,
        )) as PlainObject;
        const system = this.document.system as PlainObject;

        // Letterhead summaries — the print-safe re-expression of the header's
        // color-coded status pills and body-part lozenges (#464 print rule).
        const healthLine =
            (h.health as unknown) ?
                formatPrintHealthLine(
                    h.healthBand as string | undefined,
                    (h.healthPct as number) ?? 0,
                )
            :   "";
        const statusSummary = summarizeActiveStatuses(
            (h.statusEffects as Parameters<
                typeof summarizeActiveStatuses
            >[0]) ?? [],
            (key) => game.i18n.localize(key),
        );
        const injurySummary = summarizeInjuredParts(
            (h.bodyParts as Parameters<typeof summarizeInjuredParts>[0]) ?? [],
            (status: BodyPartStatus) =>
                game.i18n.localize(`SOHL.Print.impair.${status}`),
        );

        // Enrich the two rich-text fields to static HTML (a detached window has
        // no <prose-mirror> element to hydrate them).
        const appearanceHTML = await fvttEnrichHTML(
            (system.appearance as string) ?? "",
        );
        const dossierHTML = await fvttEnrichHTML(
            (system.dossier as string) ?? "",
        );

        // Flatten combat strike modes to static cells (disabled → em dash).
        const cell = (mod: PlainObject | undefined): string =>
            !mod || mod.disabled ? PRINT_EM_DASH : String(mod.effective ?? "");
        const impactCell = (mod: PlainObject | undefined): string =>
            !mod || mod.disabled ?
                PRINT_EM_DASH
            :   String(mod.label ?? mod.effective ?? "");
        // The strike-mode spread is presented as a Zone Die (column "ZD"): the
        // effective value in `d`-notation (e.g. `d6`), never a bare radius.
        const zoneDieCell = (mod: PlainObject | undefined): string => {
            const n = mod?.effective;
            return n == null ? PRINT_EM_DASH : `d${n}`;
        };
        const flattenMelee = (groups: PlainObject[] = []): PlainObject[] =>
            groups.map((g) => ({
                weaponName: (g.weapon as PlainObject)?.name ?? "",
                modes: ((g.strikeModes as PlainObject[]) ?? []).map((sm) => ({
                    name: sm.name,
                    heft: cell(sm.heft as PlainObject),
                    reach: cell(sm.reach as PlainObject),
                    spread: zoneDieCell(sm.spread as PlainObject),
                    impact: impactCell(sm.impact as PlainObject),
                    attack: cell(sm.attack as PlainObject),
                    block: cell(
                        (sm.defense as PlainObject)?.block as PlainObject,
                    ),
                    counterstrike: cell(
                        (sm.defense as PlainObject)
                            ?.counterstrike as PlainObject,
                    ),
                })),
            }));
        const flattenMissile = (groups: PlainObject[] = []): PlainObject[] =>
            groups.map((g) => ({
                weaponName: (g.weapon as PlainObject)?.name ?? "",
                modes: ((g.strikeModes as PlainObject[]) ?? []).map((sm) => ({
                    name: sm.name,
                    draw: cell(sm.draw as PlainObject),
                    baseRange: cell(sm.baseRange as PlainObject),
                    maxVolley: String(sm.maxVolleyMult ?? PRINT_EM_DASH),
                    impact: impactCell(sm.impact as PlainObject),
                    attack: cell(sm.attack as PlainObject),
                })),
            }));
        const meleeStrikeModes = flattenMelee(
            combat.meleeStrikeModes as PlainObject[],
        );
        const missileStrikeModes = flattenMissile(
            combat.missileStrikeModes as PlainObject[],
        );

        // Flatten mysteries / mystical abilities to static rows.
        const mysteryRows: PlainObject[] = [];
        for (const section of (mysteries.mysterySections as PlainObject[]) ??
            []) {
            for (const item of (section.items as SohlItem[]) ?? []) {
                const ml = item.logic as PlainObject | undefined;
                mysteryRows.push(
                    this._mysticalRow(item, ml, {
                        signed: true,
                        withMl: false,
                    }),
                );
            }
        }
        const abilityRows: PlainObject[] = [];
        for (const section of (mysteries.abilitySections as PlainObject[]) ??
            []) {
            for (const item of (section.items as SohlItem[]) ?? []) {
                const ml = item.logic as PlainObject | undefined;
                abilityRows.push(
                    this._mysticalRow(item, ml, {
                        signed: false,
                        withMl: true,
                    }),
                );
            }
        }

        // Flatten gear (On Body + each container) into printable sections.
        const onBody = gear.onBody as PlainObject;
        const containers = (gear.containers as PlainObject[]) ?? [];
        const gearSections: PlainObject[] = [
            {
                title: game.i18n.localize("SOHL.Print.onBody"),
                capacityText: `${game.i18n.localize("SOHL.Print.carriedLabel")} ${
                    (onBody.capacity as PlainObject)?.used ?? 0
                } lb · ${game.i18n.localize("SOHL.Print.encLabel")} ${
                    (onBody.capacity as PlainObject)?.encumbrance ?? 0
                }`,
                items: onBody.items,
            },
            ...containers.map((c) => ({
                title: c.name,
                capacityText: `${game.i18n.localize("SOHL.Print.capacityLabel")} ${
                    (c.capacity as PlainObject)?.used ?? 0
                }/${(c.capacity as PlainObject)?.max ?? 0}`,
                items: c.items,
            })),
        ];

        // Movement rows for print carry the strategic pace (leagues/watch)
        // beside the tactical one (feet/round); the interactive profile view
        // only surfaces feet/round, so the leagues are zipped in by medium here.
        const leaguesByMedium = new Map<string, number>();
        for (const p of (this.document.logic as BeingLogic | undefined)?.data
            .movementProfiles ?? []) {
            leaguesByMedium.set(p.medium, p.leaguesPerWatch ?? 0);
        }
        const movement = ((profile.movement as PlainObject[]) ?? []).map(
            (row) => ({
                ...row,
                leagues: leaguesByMedium.get(row.medium as string) ?? 0,
            }),
        );

        const skillGroups = (skills.skillGroups as PlainObject[]) ?? [];
        const injurySections = (trauma.injurySections as PlainObject[]) ?? [];
        const afflictionGroups =
            (trauma.afflictionGroups as PlainObject[]) ?? [];

        return {
            emDash: PRINT_EM_DASH,
            printedOn: new Date().toLocaleDateString(),
            actorName: this.document.name,
            shortcode: system.shortcode ?? "",
            actorImg: (system.portrait as string) || this.document.img,
            healthLine,
            statusSummary,
            injurySummary,
            appearanceHTML,
            dossierHTML,
            attributes: profile.attributes,
            affiliations: profile.affiliations,
            movement,
            bodyZones: profile.bodyZones,
            skillGroups,
            hasSkills: skillGroups.some(
                (g) => ((g.skills as unknown[]) ?? []).length > 0,
            ),
            meleeStrikeModes,
            missileStrikeModes,
            hasCombat:
                meleeStrikeModes.length > 0 || missileStrikeModes.length > 0,
            injurySections,
            hasInjuries: injurySections.some(
                (s) => ((s.injuries as unknown[]) ?? []).length > 0,
            ),
            afflictionGroups,
            hasAfflictions: afflictionGroups.some(
                (g) => ((g.afflictions as unknown[]) ?? []).length > 0,
            ),
            mysteryRows,
            abilityRows,
            gearSections,
            hasGear:
                ((onBody.items as unknown[]) ?? []).length > 0 ||
                containers.length > 0,
        };
    }

    /**
     * Shape one mystery / mystical-ability item into a static print row, reading
     * its logic for the associated skill, level, optional mastery level, and
     * charge pool and formatting each through the Foundry-free print formatters.
     *
     * @param item - The mystery or mystical-ability item.
     * @param ml - The item's logic (read for computed level/charges).
     * @param options - Row-shape options.
     * @param options.signed - Whether the level is rendered signed (mysteries).
     * @param options.withMl - Whether to include a mastery-level cell (abilities).
     * @returns The flattened print row.
     */
    private _mysticalRow(
        item: SohlItem,
        ml: PlainObject | undefined,
        options: { signed: boolean; withMl: boolean },
    ): PlainObject {
        const level = ml?.level as PlainObject | undefined;
        const charges = ml?.charges as PlainObject | undefined;
        const chargeValue = charges?.value as PlainObject | undefined;
        const chargeMax = charges?.max as PlainObject | undefined;
        const masteryLevel = ml?.masteryLevel as PlainObject | undefined;
        const row: PlainObject = {
            name: item.name,
            skill: (ml?.assocSkill as PlainObject | undefined)?.name ?? "",
            level: formatPrintLevel(
                !!level?.disabled,
                (level?.effective as number) ?? 0,
                { signed: options.signed },
            ),
            charges: formatPrintChargesDisplay({
                valueDisabled: !!chargeValue?.disabled,
                maxDisabled: !!chargeMax?.disabled,
                value: (chargeValue?.effective as number) ?? 0,
                max: (chargeMax?.effective as number) ?? 0,
            }),
            notes: htmlToPlainText(
                (item.system as PlainObject).notes as string,
            ),
        };
        if (options.withMl) {
            row.ml =
                masteryLevel?.disabled ? PRINT_EM_DASH : (
                    String((masteryLevel?.effective as number) ?? "")
                );
        }
        return row;
    }

    /**
     * Run the action for the clicked Actions-tab row (shift-click skips its
     * configuration dialog), delegating to the shared {@link runAction} sheet
     * helper. Script actions invoke their bound Macro.
     *
     * @param event - The triggering pointer event (shift skips the dialog).
     * @param target - The clicked control, inside a `data-action-name` row.
     */
    protected static async _onRunAction(
        this: BeingSheet,
        event: PointerEvent,
        target: HTMLElement,
    ): Promise<void> {
        await runAction(this.document, target, event);
    }

    /**
     * Make the clicked movement medium the being's current (default) one.
     * Invokes the actor's `makeDefaultMedium` intrinsic action with the medium
     * carried in the action scope; that executor persists
     * `system.currentMoveMedium`. Movement is a universal actor capability, so
     * the action lives on the actor logic.
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
        const logic = this.document.logic as BeingLogic | undefined;
        const action = logic?.actions.get("makeDefaultMedium") as
            | SohlAction
            | undefined;
        if (!logic || !action) return;
        const context = new SohlActionContext({
            speaker: (this.document as any).getSpeaker(),
            type: "makeDefaultMedium",
            title: (action.data as any).title,
            scope: { medium },
        });
        await action.execute(context);
    }

    /**
     * Create a custom (script) action, delegating to the shared
     * {@link createAction} sheet helper. Prompts for an existing world Macro to
     * bind — or `<New Macro…>`, which opens Foundry's Macro-create dialog — then
     * appends a SCRIPT action def (bound by the Macro's UUID) to
     * `system.actionDefs`.
     *
     * @param _event - The triggering pointer event (unused).
     * @param _target - The clicked create control (unused).
     */
    protected static async _onCreateAction(
        this: BeingSheet,
        _event: PointerEvent,
        _target: HTMLElement,
    ): Promise<void> {
        await createAction(this.document);
    }

    /**
     * Open the bound Macro's own sheet for the clicked custom action, deferring
     * all macro editing to Foundry's Macro UI (shared {@link editAction} helper).
     *
     * @param _event - The triggering pointer event (unused).
     * @param target - The clicked control, inside a `data-action-name` row.
     */
    protected static async _onEditAction(
        this: BeingSheet,
        _event: PointerEvent,
        target: HTMLElement,
    ): Promise<void> {
        await editAction(this.document, target);
    }

    /**
     * Remove the clicked custom action from `system.actionDefs`, delegating to
     * the shared {@link deleteAction} helper. Only the action def is removed —
     * the bound Macro document is left untouched.
     *
     * @param _event - The triggering pointer event (unused).
     * @param target - The clicked control, inside a `data-action-name` row.
     */
    protected static async _onDeleteAction(
        this: BeingSheet,
        _event: PointerEvent,
        target: HTMLElement,
    ): Promise<void> {
        await deleteAction(this.document, target);
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
     * Open an embedded item's sheet — the Edit anchor on an item row.
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
     * Delete an embedded item after confirmation — the Delete anchor on an
     * item row.
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
     * Toggle an armor item's **worn** state — only worn armor feeds a being's
     * armor-protection totals.
     *
     * @param _event - The triggering pointer event (unused).
     * @param target - The clicked control, within a `data-item-id` row.
     */
    protected static async _onToggleWorn(
        this: BeingSheet,
        _event: PointerEvent,
        target: HTMLElement,
    ): Promise<void> {
        const item = this._itemFromControl(target);
        if (!item) return;
        await item.update({
            "system.isWorn": !(item.system as any).isWorn,
        } as PlainObject);
    }

    /**
     * Assign the item held by a hold-capable body part, from the Held Items
     * section's per-limb dropdown. Writes the chosen item's id (or `null` for
     * the blank option) to that part's `heldItemId` on the being's body
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
        const logic = this.document.logic as BeingLogic | undefined;
        const body = getActorBody(logic);
        if (!body) return;
        const payload = body.structure.setPartFieldsUpdate([
            { index: partIndex, changes: { heldItemId: itemId } },
        ]);
        if (Object.keys(payload).length) await logic?.data.update(payload);
    }

    /**
     * Handle the "Add Injury" button on the Trauma tab: run the being's
     * **Resolve Injury** action, opening its dialog for manual entry of a wound.
     *
     * @param _event - The triggering pointer event (unused).
     * @param _target - The clicked element (unused).
     */
    protected static async _onAddInjury(
        this: BeingSheet,
        _event: PointerEvent,
        _target: HTMLElement,
    ): Promise<void> {
        // `resolveInjury` lives on the actor's BeingLogic, not the actor
        // document itself — dispatch it with an empty-scope context so the
        // dialog gathers the wound from scratch (#268).
        const actorLogic = this.document.logic as BeingLogic;
        const context = new SohlActionContext({
            speaker: actorLogic.speaker,
        });
        await actorLogic.executeAction("resolveInjury", context);
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
            (m: StrikeModeBase) => m.shortcode === smId,
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
            (m: StrikeModeBase) => m.shortcode === smId,
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
     * Handle clicks on an EML cell that rolls a success test against its item's
     * mastery level — the Skills tab (skills, combat techniques) and the
     * Mysteries tab (mystical abilities), which share the same `successTest`
     * action because both back their EML with a `MasteryLevelModifier`. Posts
     * the result to chat. Hold Shift to skip the dialog.
     *
     * @param event - The triggering pointer event.
     * @param target - The clicked EML cell, on or inside an element carrying
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

    /**
     * Handle clicks on a skill's Fate cell in the Skills tab. Runs a fate test
     * against that skill (consuming an applicable Fate charge on success) and
     * posts the result to chat. Hold Shift to skip the dialog.
     *
     * @param event - The triggering pointer event.
     * @param target - The clicked Fate cell, on or inside an element carrying
     *   `data-item-id`.
     */
    protected static async _onRollFateTest(
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
        if (typeof skillLogic?.fateTest !== "function") return;

        const context = new SohlActionContext({
            speaker: (actor as any).getSpeaker(),
            type: `skill-${item!.name}-fate-test`,
            title: `${item!.name} – Fate`,
            skipDialog: event.shiftKey,
        });
        await skillLogic.fateTest(context);
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
        // active traumas of that subtype (they are modeled as traumas, not
        // toggleable statuses; Fatigue is not a status) — #306.
        const activeTraumaSubTypes = new Set<string>();
        for (const item of ((actor.itemTypes as any)?.[ITEM_KIND.TRAUMA] ??
            []) as Iterable<any>) {
            const tl = item?.logic;
            if (tl?.data?.subType && (tl.level?.effective ?? 0) > 0) {
                activeTraumaSubTypes.add(tl.data.subType);
            }
        }
        const statusEffects = buildStatusPills(statuses, activeTraumaSubTypes);

        // Body-part lozenges, sourced from the being's body structure
        // (dynamic — varies by being), each colored by its derived impairment
        // status (#464). Impairment comes from the actor's active injuries,
        // grouped onto parts by the injured location's shortcode.
        const structure = getActorBody(actor.logic)?.structure;
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
     * Shape a being's body structure into the Foundry-free
     * {@link BodyZoneLike}[] input consumed by {@link buildBodyLocationTree}.
     * Shared by the Profile tab's editable body-structure tree and the Combat
     * tab's read-only Body Locations reference table so both render identical
     * zone/part/location data. Per-part functional roles are pre-localized into
     * a compact badge string for the Profile tree's `chip--role`.
     *
     * @param structure - The being's body structure, or `undefined`.
     * @returns The zone/part/location input array (empty when no structure).
     */
    private _buildBodyZoneInput(structure: any): BodyZoneLike[] {
        return ((structure?.zones ?? []) as any[]).map((zone: any) => ({
            shortcode: zone.shortcode,
            index: zone.index,
            label: zone.name ?? zone.shortcode,
            zoneNumbers: zone.zoneNumbers ?? [],
            parts: (zone.parts ?? []).map((part: any) => ({
                shortcode: part.shortcode,
                index: part.index,
                label: part.name ?? part.shortcode,
                role: (part.roles ?? [])
                    .map((r: string) =>
                        game.i18n.localize(
                            (BodyRoleChoices as Record<string, string>)[r] ?? r,
                        ),
                    )
                    .join(", "),
                locations: (part.locations ?? []).map((loc: any) => ({
                    shortcode: loc.shortcode,
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
        }));
    }

    /**
     * Prepare context for the Profile tab: attributes, affiliations, movement,
     * the editable body-structure tree, and the biography.
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
                // Derivation summaries for the score / TL hover tooltips (#769).
                scoreDeltaLabel: attrLogic?.score?.deltaLabel ?? "",
                tlDeltaLabel: attrLogic?.masteryLevel?.deltaLabel ?? "",
            };
        });

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
        // Movement is a universal actor capability. List every authored movement
        // profile with its tactical move (feet/round); the one matching the
        // actor's `currentMoveMedium` is the active (starred) default. Every
        // actor also gets the constant NONE "no movement" row first, so a being
        // can be made immobile even if it authors no NONE profile itself.
        const current = logic?.data.currentMoveMedium ?? MOVEMENT_MEDIUM.NONE;
        const rows = [
            NONE_MOVE_PROFILE,
            ...(logic?.data.movementProfiles ?? []),
        ];
        for (const profile of rows) {
            movement.push({
                medium: profile.medium,
                label: MovementMediumChoices[profile.medium],
                value: profile.feetPerRound,
                isCurrent: profile.medium === current,
            });
        }

        // Body structure editor: the editable Zone → Part → Location tree lives
        // on the Profile tab (#782). `structure` gates the whole section;
        // `bodyZones` is the same tree Combat renders read-only; `canEditBody`
        // gates the add / drag-sort / ⋮ authoring affordances (owner/GM only).
        const structure = getActorBody(actor.logic)?.structure;
        const bodyZones = buildBodyLocationTree(
            this._buildBodyZoneInput(structure),
        );

        return Object.assign(context, {
            attributes,
            affiliations,
            movement,
            structure,
            bodyZones,
            canEditBody: this.isEditable,
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
                    sbValid: skillLogic?.skillBaseValid ?? true,
                    ml: skillLogic?.masteryLevel?.base ?? 0,
                    index: skillLogic?.masteryLevel?.index ?? 0,
                    eml: skillLogic?.masteryLevel?.effective ?? 0,
                    fate: skillLogic?.fateMasteryLevel?.effective ?? 0,
                    emlDeltaLabel: skillLogic?.masteryLevel?.deltaLabel ?? "",
                    fateDeltaLabel:
                        skillLogic?.fateMasteryLevel?.deltaLabel ?? "",
                    disabled: !!skillLogic?.masteryLevel?.disabled,
                    canImprove: !!skillLogic?.canImprove,
                    improveFlag: !!sys.improveFlag,
                    notes: htmlToPlainText(sys.notes ?? ""),
                };
            }),
            SKILL_DISPLAY_SUBTYPE_ORDER,
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
            (source) => {
                const modes = (source.logic as any)?.strikeModes ?? [];
                // Weapons expose the limbs gripping them (`heldBy`); a mode is
                // usable only when enough limbs hold the weapon to satisfy its
                // `minParts` (a longbow's missile mode needs two hands to draw).
                // Combat-technique skills have no `heldBy` — they are intrinsic
                // and always available (`null`). Mirrors
                // `BeingLogic.availableStrikeModes` (#836).
                const heldBy = (source.logic as any)?.heldBy;
                return usableHeldStrikeModes(
                    modes,
                    heldBy ? heldBy.length : null,
                );
            },
        );

        // Body structure for anatomy display — the being's own body (empty for
        // an incorporeal being).
        const structure = getActorBody(actor.logic)?.structure;

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

        // Read-only Body Locations tree: Zone → Part → Location (#509/#780),
        // each location showing effective protection (natural `protectionBase` +
        // worn-armor `armorProtection`, aggregated during the actor's evaluate
        // phase), the covering material layers, and shock. Held items are shown
        // via the Held Items dropdowns, not here.
        const bodyZones = buildBodyLocationTree(
            this._buildBodyZoneInput(structure),
        );

        return Object.assign(context, {
            meleeStrikeModes,
            missileStrikeModes,
            structure,
            bodyZones,
            // The strike-mode scatter is always presented as a Zone Die (`d{n}`,
            // column "ZD"); its underlying value is `spread.effective`.
            spreadLabel: "ZD",
            holdableItems,
            heldItemLimbs,
            defaultCombatGroup: (actor.system as any).defaultCombatGroup ?? "",
            isGM: !!(game as any).user?.isGM,
            // Body Structure add / drag-sort controls are shown only to a user
            // who can edit this actor (owner/GM) — #720.
            canEditBody: this.isEditable,
        });
    }

    /**
     * Prepare context for the Trauma tab: traumas and afflictions.
     *
     * @param context - The render context to augment.
     * @param _options - The render options (unused).
     * @returns The augmented render context.
     */
    /**
     * Format a trauma's next recovery/heal/course test world time as a compact
     * relative label ("in 5 days") for the Trauma tab, or an em-dash when no
     * test is scheduled (#939). The schedule is the source of truth — nothing is
     * auto-armed (consent model, #579).
     *
     * @param at - The next-test world time (seconds), or `undefined`.
     * @returns A relative date label, or `"—"`.
     */
    private formatTraumaNextTest(at: number | undefined): string {
        const cal = sohl.calendar;
        if (at == null || !Number.isFinite(at) || !cal) return "—";
        // fvtt-types omits the named-formatter (+ options) overload of
        // CalendarData.format; call it the way `displayWorldTime` does at runtime.
        const format = cal.format as (
            time: number,
            formatter: string,
            opts?: { short?: boolean; maxTerms?: number },
        ) => string;
        try {
            return (
                format.call(cal, at, "sohl.relative", {
                    short: true,
                    maxTerms: 2,
                }) || "—"
            );
        } catch {
            return "—";
        }
    }

    protected async _prepareTraumaContext(
        context: RenderContext,
        _options: RenderOptions,
    ): Promise<RenderContext> {
        const actor = this.document;
        const logic = actor.logic as BeingLogic;

        // Injuries (traumas), grouped into present-only subtype sections
        // (mirroring afflictions): extract each item's display values from its
        // logic and system data, then group + format for the injuries list.
        const injurySections = buildInjurySections(
            (actor.itemTypes[ITEM_KIND.TRAUMA] ?? []).map((item) => {
                const tl = item.logic as any;
                const sys = item.system as any;
                // The "Category" column shows the localized sub-category for every
                // category-bearing sub-type — FATIGUE / PSYCOND / PHYSCOND and the
                // named severity state (Afraid, Routed, …) for FEAR / MORALE, all of
                // which now live in the `category` field (#961).
                const categoryDisplay = tl?.categoryLabel ?? "";
                return {
                    id: item.id!,
                    uuid: item.uuid,
                    name: item.name,
                    img: item.img ?? "",
                    subType: sys.subType,
                    level: tl?.level?.effective ?? 0,
                    severityDeltaLabel: tl?.level?.deltaLabel ?? "",
                    healingRate: tl?.healingRate?.effective ?? 0,
                    healingRateDisabled: !!tl?.healingRate?.disabled,
                    healingRateDeltaLabel: tl?.healingRate?.deltaLabel ?? "",
                    isTreated: !!tl?.isTreated,
                    isBleeding: !!tl?.isBleeding,
                    aspect: sys.aspect,
                    area: tl?.bodyLocation?.name,
                    categoryDisplay,
                    nextTest: this.formatTraumaNextTest(tl?.nextRecoveryTestAt),
                    notes: sys.notes,
                };
            }),
            TraumaSubTypes,
            (subType) =>
                game.i18n.localize(
                    (TraumaSubTypeChoices as Record<string, string>)[subType] ??
                        subType,
                ),
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
                    levelDeltaLabel: al?.level?.deltaLabel ?? "",
                    healingRate: al?.healingRate?.effective ?? 0,
                    healingRateDisabled: !!al?.healingRate?.disabled,
                    healingRateDeltaLabel: al?.healingRate?.deltaLabel ?? "",
                    source: al?.categoryLabel ?? "",
                    nextHealTest: al?.nextHealTest ?? null,
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
            injurySections,
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
        const abilitySections = MysticalAbilitySubTypes.map((subType) => {
            const columns = mysticalAbilityColumns(subType);
            return {
                subType,
                label: game.i18n.localize(
                    (MysticalAbilitySubTypeChoices as Record<string, string>)[
                        subType
                    ] ?? subType,
                ),
                items: abilityBuckets[subType] ?? [],
                columns,
                ledgerCols: mysticalAbilityLedgerCols(columns),
            };
        });

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
                // Derivation summaries for the weight/quality/durability
                // hover tooltips (#769).
                weightDeltaLabel: gl?.weight?.deltaLabel ?? "",
                qualityDeltaLabel: gl?.quality?.deltaLabel ?? "",
                durabilityDeltaLabel: gl?.durability?.deltaLabel ?? "",
                notes: htmlToPlainText(sys.notes ?? ""),
                isCarried: !!sys.isCarried,
                isWorn: !!sys.isWorn,
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
        // `BeingLogic.carriedWeight`) and the resulting encumbrance for its
        // active movement medium (`BeingLogic.encumbrance`).
        const onBody = {
            items: tree.onBodyItems.map(toRow),
            capacity: {
                isEncumbrance: true,
                used: round1(logic.carriedWeight?.effective ?? 0),
                encumbrance: logic.encumbrance?.effective ?? 0,
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
