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

import type { SohlActor } from "./SohlActor";
import { SohlItem } from "@src/document/item/foundry/SohlItem";
import { applySearchFilter } from "@src/document/actor/logic/display-filter";
import { resolveActorSheetParts, buildMovementRows } from "@src/document/actor/logic/sheet-parts";
import {
    buildContainerTree,
    htmlToPlainText,
    attributeDescriptor,
    buildAffiliationRows,
    groupBySubType,
    mysticalAbilityColumns,
    mysticalAbilityLedgerCols,
} from "@src/document/actor/logic/being-sheet-view";
import { SohlDataModel } from "@src/core/foundry/SohlDataModel";
import type { SohlAction } from "@src/entity/action/SohlAction";
import { SohlActionContext } from "@src/entity/action/SohlActionContext";
import {
    buildActionRows,
    createAction,
    editAction,
    deleteAction,
    runAction,
} from "@src/core/foundry/sheet-actions";
import {
    fvttCallHook,
    fvttIsCurrentUserGM,
    fvttRenderSheet,
    dialog,
} from "@src/core/FoundryHelpers";
import {
    ITEM_KIND,
    GearKinds,
    isFencedType,
    MOVEMENT_MEDIUM,
    MovementMediumChoices,
    MysterySubTypes,
    MysterySubTypeChoices,
    MysticalAbilitySubTypes,
    MysticalAbilitySubTypeChoices,
    type MovementMedium,
} from "@src/utils/constants";
import { toHTMLString } from "@src/utils/helpers";
import { canMarkArchetype, clearArchetypeMarker } from "@src/entity/archetype/archetype";
import { hintsToLabelTooltips } from "@src/apps/foundry/sheet-hints";

// Define the base type for the sheet
const SohlActorSheetBase_Base = SohlDataModel.SheetMixin<
    SohlActor,
    typeof foundry.applications.api.DocumentSheetV2<SohlActor>
>(foundry.applications.api.DocumentSheetV2<SohlActor>);

type RenderContext = foundry.applications.api.DocumentSheetV2.RenderContext<SohlActor>;
type RenderOptions = foundry.applications.api.DocumentSheetV2.RenderOptions;

/**
 * The capacity readout banding a Gear-tab section. A container reports what it
 * holds against what it can hold; a being's "On Body" section reports its total
 * carried weight and the resulting encumbrance instead — see the actor sheet's
 * `_gearOnBodyCapacity` hook, which a concrete sheet overrides to choose.
 */
export interface GearCapacity {
    /** Whether the readout is an encumbrance summary rather than used/max. */
    isEncumbrance?: boolean;
    /** Total weight of the section's contents. */
    used: number;
    /** The section's capacity, when it has one. */
    max?: number;
    /** The encumbrance level, for an encumbrance readout. */
    encumbrance?: number;
}

/**
 * Base application sheet for all actor types. Provides the shared render parts
 * (header, tabs, facade), the per-part context hooks, and list filtering.
 * Concrete actor sheets extend this and override the `_prepare*Context` hooks.
 * @internal
 */
export abstract class SohlActorSheetBase extends SohlActorSheetBase_Base {
    /**
     * ApplicationV2 auto-merges `DEFAULT_OPTIONS` up the prototype chain, so this
     * level only contributes what it adds (no `...super` spread). Registers the
     * general `clearField` action used by the `clearableNumberInput` helper, plus
     * the controls carried by the shared Gear / Actions / Effects tab templates —
     * those tabs render on every actor type, so their handlers belong here rather
     * than on any one concrete sheet (issue #1088).
     */
    static override DEFAULT_OPTIONS: PlainObject = {
        actions: {
            clearField: SohlActorSheetBase._onClearField,
            dismissFenceNotice: SohlActorSheetBase._onDismissFenceNotice,
            createItem: SohlActorSheetBase._onCreateItem,
            makeDefaultMedium: SohlActorSheetBase._onMakeDefaultMedium,
            addMovementProfile: SohlActorSheetBase._onAddMovementProfile,
            editItem: SohlActorSheetBase._onEditItem,
            deleteItem: SohlActorSheetBase._onDeleteItem,
            toggleCarried: SohlActorSheetBase._onToggleCarried,
            toggleWorn: SohlActorSheetBase._onToggleWorn,
            runAction: SohlActorSheetBase._onRunAction,
            createAction: SohlActorSheetBase._onCreateAction,
            editAction: SohlActorSheetBase._onEditAction,
            deleteAction: SohlActorSheetBase._onDeleteAction,
        },
    };

    /**
     * Render-part id and template for the dismissible experimental-schema banner
     * shown on fenced (experimental) actor sheets. The fenced concrete sheets add
     * this entry to their `PARTS`; the base prepends it to the render list when the
     * document type is fenced (see {@link _configureRenderOptions}).
     * @internal
     */
    static readonly FENCED_BANNER_PART = {
        fencedBanner: {
            template: "systems/sohl/templates/actor/parts/fenced-banner.hbs",
        },
    } as const;

    /**
     * `data-action="dismissFenceNotice"`: hide the experimental-schema banner for
     * the current view. Dismissal is intentionally per-view (not persisted) — the
     * caution re-appears next time the sheet is opened, since the schema really is
     * not final. Removes the banner element so the sheet reflows.
     *
     * @param _event - The triggering pointer event (unused).
     * @param target - The clicked dismiss control, inside the banner.
     */
    protected static _onDismissFenceNotice(
        this: SohlActorSheetBase,
        _event: PointerEvent,
        target: HTMLElement,
    ): void {
        target.closest<HTMLElement>(".fence-banner")?.remove();
    }

    /**
     * `data-action="clearField"`: reset a nullable field to `null`. Reads the
     * update path from the control's `data-field-path` and writes `null`
     * explicitly via `document.update`, sidestepping the unreliable
     * empty-number-input serialization. Paired with the `clearableNumberInput`
     * Handlebars helper.
     *
     * @param _event - The triggering pointer event (unused).
     * @param target - The clicked control, carrying `data-field-path`.
     */
    protected static async _onClearField(
        this: SohlActorSheetBase,
        _event: PointerEvent,
        target: HTMLElement,
    ): Promise<void> {
        const path = target.dataset.fieldPath;
        if (!path) return;
        await this.document.update({ [path]: null });
    }

    /** The {@link SohlActor} this sheet renders (narrowed from the base type). */
    override get document(): SohlActor {
        return super.document as SohlActor;
    }

    /** The {@link SohlActor} this sheet renders, or `null`. */
    get actor(): SohlActor | null {
        return (this.document as any).actor;
    }

    /**
     * Handle an Item dropped onto the actor sheet. The base mixin's `_onDrop`
     * resolves the drag payload and routes `Item` documents here (the mixin's
     * own `_onDropItem` is a no-op; the item sheet overrides it for container
     * drops, and the actor sheet overrides it here).
     *
     * Semantics by source:
     * - **Compendium / world** item → created as an embedded **clone** (all kinds).
     * - **Another actor** → **moved** here (created, then removed from the
     *   source). Non-gear moves the instance; physical **gear** moves with
     *   quantity — a "How Many?" prompt for stacks > 1, skipped for a single item
     *   or a shift-drag (which moves the whole stack). Moving needs source
     *   ownership.
     * - **Already on this actor** → ignored (no self-duplicate).
     *
     * @param event - The originating drop event (its `shiftKey` selects move-all).
     * @param droppedItem - The resolved dropped item.
     */
    protected async _onDropItem(event: DragEvent, droppedItem: SohlItem): Promise<void> {
        const actor = this.document;
        if (!actor.isOwner || !droppedItem) return;

        const sourceActor = droppedItem.actor;

        // Already embedded on this actor: don't duplicate it onto itself.
        if (sourceActor?.id === actor.id) return;

        // Source discriminates the semantics: an item embedded on another actor
        // is **moved** (created here, removed there); a compendium/world item is
        // **cloned**. Moving requires owning the source (to delete/decrement it).
        const isMove = !!sourceActor;
        if (isMove && !droppedItem.isOwner) {
            (globalThis as any).ui?.notifications?.warn(
                "You don't own the source item, so it can't be moved.",
            );
            return;
        }

        const data = droppedItem.toObject();
        delete (data as any)._id;
        // Drop-to-embed instantiates a live in-play item — never a template.
        // Clear the archetype marker (`system.archetype = null`) so it can't
        // ride onto the owner and pollute discovery (or be re-instantiated as
        // if it were a template). Import and Duplicate deliberately keep the
        // marker; the clear lives here and in the Create dialog, never in the
        // universal `_preCreate` (issues #604 / #1780).
        clearArchetypeMarker(data as any);

        if (isMove && GearKinds.includes(droppedItem.type as any)) {
            // Physical gear between actors: move with quantity. The "How Many?"
            // dialog fires only when there's more than one and the drag is not
            // shift-held; shift-drag (or a single item) moves the whole stack.
            const qty = Math.max(1, (droppedItem.system as any).quantity ?? 1);
            let moveQty = qty;
            if (qty > 1 && !event.shiftKey) {
                const chosen = await this._promptMoveQuantity(droppedItem.name, qty);
                if (chosen === undefined) return; // cancelled
                moveQty = chosen;
            }
            (data.system as any).quantity = moveQty;
            await actor.createEmbeddedDocuments("Item", [data], {
                shortcodeDedupe: true,
            } as any);
            if (moveQty >= qty) await droppedItem.delete();
            else
                await droppedItem.update({
                    "system.quantity": qty - moveQty,
                } as any);
            return;
        }

        // Non-gear move between actors: recreate here, remove from the source.
        // Compendium/world (no source actor): plain clone.
        await actor.createEmbeddedDocuments("Item", [data], {
            shortcodeDedupe: true,
        } as any);
        if (isMove) await droppedItem.delete();
    }

    /**
     * Prompt for how many of a stacked gear item to move (1..max). Yields the
     * chosen count, or `undefined` if the dialog was cancelled or dismissed.
     *
     * @param name - The item's name, shown in the dialog title.
     * @param max - The source stack size (the upper bound and default).
     * @returns The chosen quantity, or `undefined` when cancelled.
     */
    private async _promptMoveQuantity(name: string, max: number): Promise<number | undefined> {
        const result = await dialog({
            title: `Move ${name}`,
            content: toHTMLString(
                `<div class="form-group">
                <label>How many to move? (1–${max})</label>
                <input type="number" name="qty" value="${max}" min="1" max="${max}" step="1" autofocus />
            </div>`,
            ),
            buttons: [
                { action: "move", label: "Move", default: true },
                { action: "cancel", label: "Cancel" },
            ],
            callback: (formData: any, action: string) => {
                if (action !== "move") return undefined;
                const n = Math.trunc(Number(formData?.qty));
                return Number.isFinite(n) ? Math.min(max, Math.max(1, n)) : undefined;
            },
        });
        return typeof result === "number" ? result : undefined;
    }

    /**
     * After render, convert each field's always-on hint into a "?" tooltip on its
     * label (shared with the item sheets), so the guidance no longer competes with
     * the field value, and bind the item/effect context menus.
     * @param context - The render context.
     * @param options - The render options.
     */
    protected override async _onRender(
        // Typed `any` to sidestep the fvtt-types deep-comparison blowup on the
        // heavy `RenderContext<SohlActor>` type (see BeingSheet#_onRender).
        context: any,
        options: foundry.applications.api.DocumentSheetV2.RenderOptions,
    ): Promise<void> {
        await super._onRender(context, options);
        const el = (this as any).element as HTMLElement | undefined;
        if (el) hintsToLabelTooltips(el);

        // Mark the sheet root with the actor it renders. Context-menu
        // visibility predicates resolve their `itemLogic` / `actorLogic`
        // bindings by walking up from the clicked row to the nearest
        // `[data-actor-id]` ancestor; without this marker no actor sheet
        // provided one, so `itemLogic` was always undefined and *every*
        // action whose `visible`/`trigger` names it stayed hidden from the
        // row ⋮ menus — armour's Toggle Worn, a weapon's Attack/Block/
        // Counterstrike, a combat technique's Improve with SDR (#1132).
        if (el && this.document.id) el.dataset.actorId = this.document.id;

        // Bind the item/effect context menus (right-click on a `.item` row and
        // click on its `.item-contextmenu` ⋮ control). Without this a sheet has
        // no way to edit or delete any created item (#517). `_contextMenu` is
        // provided by the SohlDataModel sheet mixin. Bound here rather than on a
        // concrete sheet because the ledgers that carry those controls are the
        // shared Gear / Effects tab templates (#1088).
        (this as any)._contextMenu?.(el);
    }

    /**
     * Register the sheet's render parts, derived from its declared `PARTS` in
     * declaration order: the experimental-schema banner (fenced types only,
     * issue #959), the header, the tab navigation, the Facade tab, and every
     * content tab the concrete sheet declares — the last of which are withheld
     * when the viewer has only limited permission.
     *
     * Deriving the list means a sheet gets its tab bodies by declaring them,
     * rather than by also restating them here. Hard-coding it was what left the
     * Vehicle, Structure, and Cohort sheets rendering an empty panel for every
     * tab but Facade (issue #1088).
     *
     * @param options - The render options to populate with the sheet parts.
     * @param options.parts - Populated in place with the registered part ids.
     */
    protected override _configureRenderOptions(
        options: Partial<foundry.applications.api.HandlebarsApplicationMixin.RenderOptions>,
    ): void {
        super._configureRenderOptions(options);

        const declared = Object.keys(
            (
                this.constructor as typeof SohlActorSheetBase & {
                    PARTS?: PlainObject;
                }
            ).PARTS ?? {},
        );
        options.parts = resolveActorSheetParts(declared, {
            isFenced: isFencedType("Actor", this.document.type),
            isLimited: !!(this.document as any).limited,
        });
    }

    /**
     * Build the render context shared across all sheet parts.
     * @param options - Sheet render options.
     * @returns The shared render context.
     */
    protected override async _prepareContext(
        options: foundry.applications.api.DocumentSheetV2.RenderOptions,
    ): Promise<foundry.applications.api.DocumentSheetV2.RenderContext<SohlActor>> {
        const context = await super._prepareContext(options);

        // Add any shared data needed across all parts here
        // options.parts contains array of partIds being rendered
        // e.g., ["header", "tabs", "facade"]

        // Gate the experimental-schema banner (issue #959). The fenced-banner
        // part reads this flag; setting it on the shared context makes it
        // available to every part.
        (context as any).isFenced = isFencedType("Actor", this.document.type);

        return context;
    }

    /**
     * Dispatch to the per-part context builder (`header` / `tabs` / `facade`)
     * and fire the matching `sohl.actor.<type>.prepare*Context` hooks.
     *
     * @param partId - The render part being prepared.
     * @param context - The in-progress render context.
     * @param options - Foundry render options.
     * @returns The render context for the given part.
     */
    protected async _preparePartContext(
        partId: string,
        context: foundry.applications.api.DocumentSheetV2.RenderContext<SohlActor>,
        options: foundry.applications.api.DocumentSheetV2.RenderOptions,
    ): Promise<foundry.applications.api.DocumentSheetV2.RenderContext<SohlActor>> {
        const type = this.document.type;
        // Expose the prepared tab descriptor for this part so content
        // sections can resolve their `active` state and tab group. The
        // navigation part itself iterates the full `tabs` record instead.
        (context as any).tab = (context as any).tabs?.[partId];
        switch (partId) {
            case "header":
                context = await this._prepareHeaderContext(context, options);
                fvttCallHook(`sohl.actor.${type}.prepareHeaderContext`, this, context);
                return context;
            case "tabs":
                context = await this._prepareTabsContext(context, options);
                return context;
            case "facade":
                context = await this._prepareFacadeContext(context, options);
                fvttCallHook(`sohl.actor.${type}.prepareFacadeContext`, this, context);
                return context;
            case "profile":
                context = await this._prepareSharedProfileContext(context, options);
                fvttCallHook(`sohl.actor.${type}.prepareProfileContext`, this, context);
                return context;
            case "mysteries":
                context = await this._prepareMysteriesContext(context, options);
                fvttCallHook(`sohl.actor.${type}.prepareMysteriesContext`, this, context);
                return context;
            case "gear":
                context = await this._prepareGearContext(context, options);
                fvttCallHook(`sohl.actor.${type}.prepareGearContext`, this, context);
                return context;
            case "actions":
                context = await this._prepareActionsContext(context, options);
                fvttCallHook(`sohl.actor.${type}.prepareActionsContext`, this, context);
                return context;
            case "effects":
                context = await this._prepareEffectsContext(context, options);
                fvttCallHook(`sohl.actor.${type}.prepareEffectsContext`, this, context);
                return context;
            default:
                return context;
        }
    }

    /**
     * Build the `header` part's render context: the actor's name, portrait,
     * localized type label, and the archetype-marker control's binding (issue
     * #1780), which every actor header template binds. Subclasses override to
     * add their own header content (a being's health bar, status pills, and
     * body-part lozenges, for instance).
     * @param context - The in-progress render context.
     * @param options - Sheet render options.
     * @returns The header part context.
     */
    protected async _prepareHeaderContext(
        context: foundry.applications.api.DocumentSheetV2.RenderContext<SohlActor>,
        options: foundry.applications.api.DocumentSheetV2.RenderOptions,
    ): Promise<foundry.applications.api.DocumentSheetV2.RenderContext<SohlActor>> {
        const actor = this.document;
        return Object.assign(context, {
            actorName: actor.name,
            actorImg: actor.img,
            typeLabel: sohl.i18n.localize(`TYPES.Actor.${actor.type}`),
            archetype: (actor.system as any)?.archetype ?? null,
            canMarkArchetype: canMarkArchetype(fvttIsCurrentUserGM(), actor.isEmbedded),
        });
    }

    /**
     * Build the `tabs` part's render context. Override in subclasses; the base returns it unchanged.
     * @param context - The in-progress render context.
     * @param options - Sheet render options.
     * @returns The tabs part context.
     */
    protected async _prepareTabsContext(
        context: foundry.applications.api.DocumentSheetV2.RenderContext<SohlActor>,
        options: foundry.applications.api.DocumentSheetV2.RenderOptions,
    ): Promise<foundry.applications.api.DocumentSheetV2.RenderContext<SohlActor>> {
        return context;
    }

    /**
     * Build the `facade` part's render context: the bio image
     * (`system.portrait`) and the actor's name. The rich-text appearance field is
     * edited by a `<prose-mirror>` element, which enriches its own content.
     * @param context - The in-progress render context.
     * @param options - Sheet render options.
     * @returns The facade part context.
     */
    protected async _prepareFacadeContext(
        context: foundry.applications.api.DocumentSheetV2.RenderContext<SohlActor>,
        options: foundry.applications.api.DocumentSheetV2.RenderOptions,
    ): Promise<foundry.applications.api.DocumentSheetV2.RenderContext<SohlActor>> {
        return Object.assign(context, {
            actorName: this.document.name,
            portrait: (this.document.system as any).portrait,
        });
    }

    /* -------------------------------------------- */
    /*  Shared tab contexts (Gear / Actions / Effects) */
    /* -------------------------------------------- */

    /**
     * Build the `gear` part's render context: the actor's carried gear as an
     * "On Body" section plus one section per container, each a ledger of rows
     * with a capacity readout. Shared by every actor type that carries
     * things — a being's possessions, a vehicle's cargo, a structure's stores.
     *
     * @param context - The in-progress render context.
     * @param _options - Sheet render options (unused).
     * @returns The gear part context.
     */
    protected async _prepareGearContext(
        context: RenderContext,
        _options: RenderOptions,
    ): Promise<RenderContext> {
        const actor = this.document;

        const containerGear = actor.itemTypes[ITEM_KIND.CONTAINERGEAR] ?? [];

        // Collect all gear items (containers themselves included, so a
        // top-level container appears both as a node and under "On Body").
        // Row order follows this kind order, so it is fixed here rather than
        // taken from `GearKinds`, whose order is the enum's.
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
            allGear.push(...((actor.itemTypes as any)[type] ?? []));
        }

        const tree = buildContainerTree(
            containerGear,
            allGear,
            (item: SohlItem) => item.id,
            (item: SohlItem) => (item.system as any).containerId,
        );

        const toRow = SohlActorSheetBase._gearRow;

        const onBody = {
            items: tree.onBodyItems.map(toRow),
            capacity: this._gearOnBodyCapacity(tree.onBodyItems),
        };
        const containers = tree.containers.map((node: any) => ({
            id: node.container.id,
            name: node.container.name,
            items: node.items.map(toRow),
            capacity: {
                used: SohlActorSheetBase._totalGearWeight(node.items),
                max: (node.container.logic as any)?.maxCapacity?.effective ?? 0,
            },
        }));

        return Object.assign(context, { onBody, containers });
    }

    /**
     * Map a gear item to the compact row the gear ledgers bind — the shared
     * shape behind the Gear tab's sections and the Cohort sheet's Shared Gear
     * tab (issue #76), so the two ledgers never drift apart column by column.
     *
     * @param item - The gear item to describe.
     * @returns The display row for one ledger line.
     */
    protected static _gearRow(item: SohlItem): PlainObject {
        const gl = item.logic as any;
        const sys = item.system as any;
        const q = sys.qualityBase ?? 0;
        return {
            id: item.id,
            uuid: item.uuid,
            name: item.name,
            img: item.img ?? "",
            type: item.type,
            typeLabel: sohl.i18n.localize(`TYPES.Item.${item.type}`),
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
    }

    /**
     * Total weight of a set of gear items — each item's per-unit effective
     * weight times its quantity, rounded to one decimal.
     *
     * @param items - The gear items to weigh.
     * @returns The summed weight.
     */
    protected static _totalGearWeight(items: SohlItem[]): number {
        const total = items.reduce((sum, item) => {
            const gl = item.logic as any;
            const sys = item.system as any;
            const w = gl?.weight?.effective ?? sys.weightBase ?? 0;
            return sum + w * (sys.quantity ?? 1);
        }, 0);
        return Math.round(total * 10) / 10;
    }

    /**
     * The capacity readout for the Gear tab's un-contained ("On Body") section.
     *
     * The base reports **none**. A vehicle's cargo and a structure's stores have
     * no maximum to be measured against — capacity is deliberately not modeled
     * for either (#200, #201) — and a bare total is not a fact anyone acts on:
     * nothing is encumbered by it and nothing refuses to accept more. So the
     * section legend simply carries no readout. {@link BeingSheet} overrides
     * this to report the being's carried weight and resulting encumbrance, which
     * *is* actionable.
     *
     * @param _items - The un-contained gear items (unused by the base).
     * @returns `undefined` — no readout.
     */
    protected _gearOnBodyCapacity(_items: SohlItem[]): GearCapacity | undefined {
        return undefined;
    }

    /**
     * Build the `actions` part's render context: the actor's actions, split into
     * the GM-authored custom (script) actions and the code-defined intrinsic
     * ones, each with the availability state its run control renders from.
     * Internal lifecycle actions (the hidden sort group) are never listed.
     *
     * @param context - The in-progress render context.
     * @param _options - Sheet render options (unused).
     * @returns The actions part context.
     */
    protected async _prepareActionsContext(
        context: RenderContext,
        _options: RenderOptions,
    ): Promise<RenderContext> {
        // Shared with the item sheet so both tabs list — and gate — actions
        // identically.
        return Object.assign(context, buildActionRows(this.document));
    }

    /**
     * Build the `effects` part's render context: the actor's own active effects
     * and the enabled effects transferred onto it from its items.
     *
     * @param context - The in-progress render context.
     * @param _options - Sheet render options (unused).
     * @returns The effects part context.
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

    /* -------------------------------------------- */
    /*  Shared tab controls                         */
    /* -------------------------------------------- */

    /**
     * Resolve the embedded item owning the clicked control, from the enclosing
     * row's `data-item-id`.
     *
     * @param target - The clicked control, within a `data-item-id` row.
     * @returns The embedded item, or `undefined` if the row carries no id.
     */
    protected _itemFromControl(target: HTMLElement): SohlItem | undefined {
        const itemId = target.closest<HTMLElement>("[data-item-id]")?.getAttribute("data-item-id");
        return itemId ? this.document.items.get(itemId) : undefined;
    }

    /**
     * `data-action="createItem"`: open the item-create dialog parented to this
     * actor, pre-seeded from the control's `data-type` and `data-sub-type`
     * (or `data-subtype`).
     *
     * @param _event - The triggering pointer event (unused).
     * @param target - The clicked control, carrying `data-type` / `data-sub-type`.
     */
    protected static async _onCreateItem(
        this: SohlActorSheetBase,
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
     * `data-action="editItem"`: open an embedded item's sheet.
     *
     * @param _event - The triggering pointer event (unused).
     * @param target - The clicked control, within a `data-item-id` row.
     */
    protected static async _onEditItem(
        this: SohlActorSheetBase,
        _event: PointerEvent,
        target: HTMLElement,
    ): Promise<void> {
        void fvttRenderSheet(this._itemFromControl(target));
    }

    /**
     * `data-action="deleteItem"`: delete an embedded item after confirmation.
     *
     * @param _event - The triggering pointer event (unused).
     * @param target - The clicked control, within a `data-item-id` row.
     */
    protected static async _onDeleteItem(
        this: SohlActorSheetBase,
        _event: PointerEvent,
        target: HTMLElement,
    ): Promise<void> {
        const item = this._itemFromControl(target);
        if (!item) return;
        await (item as any).deleteDialog();
    }

    /**
     * `data-action="toggleCarried"`: toggle a gear item's **carried** state (on
     * the owner's person, in the hold, in the storeroom).
     *
     * Dispatches the item's `toggleCarried` intrinsic action rather than writing
     * the field, so the ledger control and the Actions context menu share one
     * implementation — including the stow-time clearing of any "in use" state
     * (issue #1097).
     *
     * @param _event - The triggering pointer event (unused).
     * @param target - The clicked control, within a `data-item-id` row.
     */
    protected static async _onToggleCarried(
        this: SohlActorSheetBase,
        _event: PointerEvent,
        target: HTMLElement,
    ): Promise<void> {
        const item = this._itemFromControl(target);
        if (!item) return;
        await item.logic?.executeAction("toggleCarried");
    }

    /**
     * `data-action="toggleWorn"`: toggle an armor item's **worn** state — only
     * worn armor feeds its owner's armor-protection totals.
     *
     * Dispatches the item's `toggleWorn` intrinsic action rather than writing the
     * field, so the ledger control honors the same carried gate as the Actions
     * context menu: armor that is not carried cannot be worn (#1097).
     *
     * @param _event - The triggering pointer event (unused).
     * @param target - The clicked control, within a `data-item-id` row.
     */
    protected static async _onToggleWorn(
        this: SohlActorSheetBase,
        _event: PointerEvent,
        target: HTMLElement,
    ): Promise<void> {
        const item = this._itemFromControl(target);
        if (!item) return;
        await item.logic?.executeAction("toggleWorn");
    }

    /**
     * `data-action="runAction"`: run the action for the clicked Actions-tab row
     * (shift-click skips its configuration dialog), delegating to the shared
     * {@link runAction} sheet helper. Script actions invoke their bound Macro.
     *
     * @param event - The triggering pointer event (shift skips the dialog).
     * @param target - The clicked control, inside a `data-action-name` row.
     */
    protected static async _onRunAction(
        this: SohlActorSheetBase,
        event: PointerEvent,
        target: HTMLElement,
    ): Promise<void> {
        await runAction(this.document, target, event);
    }

    /**
     * `data-action="createAction"`: create a custom (script) action, delegating
     * to the shared {@link createAction} sheet helper. Prompts for an existing
     * world Macro to bind — or `<New Macro…>`, which opens Foundry's Macro-create
     * dialog — then appends a SCRIPT action def (bound by the Macro's UUID) to
     * `system.actionDefs`.
     *
     * @param _event - The triggering pointer event (unused).
     * @param _target - The clicked create control (unused).
     */
    protected static async _onCreateAction(
        this: SohlActorSheetBase,
        _event: PointerEvent,
        _target: HTMLElement,
    ): Promise<void> {
        await createAction(this.document);
    }

    /**
     * `data-action="editAction"`: open the bound Macro's own sheet for the
     * clicked custom action, deferring all macro editing to Foundry's Macro UI
     * (shared {@link editAction} helper).
     *
     * @param _event - The triggering pointer event (unused).
     * @param target - The clicked control, inside a `data-action-name` row.
     */
    protected static async _onEditAction(
        this: SohlActorSheetBase,
        _event: PointerEvent,
        target: HTMLElement,
    ): Promise<void> {
        await editAction(this.document, target);
    }

    /**
     * `data-action="deleteAction"`: remove the clicked custom action from
     * `system.actionDefs`, delegating to the shared {@link deleteAction} helper.
     * Only the action def is removed — the bound Macro document is untouched.
     *
     * @param _event - The triggering pointer event (unused).
     * @param target - The clicked control, inside a `data-action-name` row.
     */
    protected static async _onDeleteAction(
        this: SohlActorSheetBase,
        _event: PointerEvent,
        target: HTMLElement,
    ): Promise<void> {
        await deleteAction(this.document, target);
    }

    /**
     * Show or hide item rows in the sheet content based on a search query,
     * matching each row's normalized item name against the query or regex.
     * @param _event - The triggering keyboard event, if any.
     * @param query - The raw search query text.
     * @param rgx - The regular expression to match item names against.
     * @param content - The container element holding the item rows.
     */
    protected _displayFilteredResults(
        _event: KeyboardEvent | null,
        query: string,
        rgx: RegExp,
        content: HTMLElement | null,
    ): void {
        applySearchFilter(query, rgx, content);
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
        this: SohlActorSheetBase,
        _event: PointerEvent,
        _target: HTMLElement,
    ): Promise<void> {
        const actor = this.document;
        const logic = actor.logic as any;
        const profiles = logic?.data.movementProfiles ?? [];
        const used = new Set(profiles.map((p: any) => p.medium));
        const available = (
            Object.entries(MovementMediumChoices) as [MovementMedium, string][]
        ).filter(([value]) => value !== MOVEMENT_MEDIUM.NONE && !used.has(value));
        if (!available.length) {
            sohl.log.uiWarn("Every movement medium already has a movement profile.");
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
                        new foundry.applications.ux.FormDataExtended(button.form).object,
                },
            } as any)) as PlainObject | undefined;
        } catch {
            return;
        }
        if (!fd) return;
        const medium = String(fd.medium ?? "") as MovementMedium;
        if (!medium || used.has(medium)) return;
        const feetPerRound = Math.max(0, Math.round(Number(fd.feetPerRound) || 0));
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
     * Build the shared **Profile** tab's context: the actor's attribute scores,
     * its movement ledger, and (through the sheet's `fields` / `system`) the
     * dossier editor.
     *
     * Used by the Cohort, Vehicle, and Structure sheets. The Being has its own
     * richer Profile — affiliations and the body-structure editor besides — and
     * overrides `_preparePartContext` to build it, so it never reaches here.
     *
     * Attributes are included for **every** actor kind. A vehicle or structure
     * normally authors none, in which case the section renders empty; the tab
     * does not presume that a non-Being can never carry one.
     *
     * @param context - The in-progress render context.
     * @param _options - Sheet render options (unused).
     * @returns The profile part context.
     */
    protected async _prepareSharedProfileContext(
        context: foundry.applications.api.DocumentSheetV2.RenderContext<SohlActor>,
        _options: foundry.applications.api.DocumentSheetV2.RenderOptions,
    ): Promise<foundry.applications.api.DocumentSheetV2.RenderContext<SohlActor>> {
        const actor = this.document;
        const attributeItems = [...(actor.itemTypes[ITEM_KIND.ATTRIBUTE] ?? [])].sort(
            (a: any, b: any) =>
                (a.sort ?? 0) - (b.sort ?? 0) || String(a.name).localeCompare(String(b.name)),
        );
        const attributes = attributeItems.map((attr: any) => {
            const attrLogic = attr.logic as any;
            const score = attrLogic?.score?.effective ?? 0;
            return {
                id: attr.id,
                uuid: attr.uuid,
                name: attr.name,
                score,
                descriptor: attributeDescriptor(score, (attr.system as any).valueDesc ?? []),
                tl: attrLogic?.masteryLevel?.effective ?? 0,
                scoreDeltaLabel: attrLogic?.score?.deltaLabel ?? "",
                tlDeltaLabel: attrLogic?.masteryLevel?.deltaLabel ?? "",
            };
        });

        // Affiliations — a vehicle or structure answers to someone as much as a
        // character does (a ward laid by an order, a keep held for a house).
        const affiliations = buildAffiliationRows(
            (actor.itemTypes[ITEM_KIND.AFFILIATION] ?? []).map((aff: any) => {
                const sys = aff.system as any;
                const affLogic = aff.logic as any;
                return {
                    id: aff.id ?? "",
                    uuid: aff.uuid,
                    name: aff.name,
                    level: affLogic?.level?.effective ?? sys.level ?? 0,
                    society: sys.society ?? "",
                    office: sys.office ?? "",
                    title: sys.title ?? "",
                    notes: sys.notes ?? "",
                };
            }),
        );

        const logic = actor.logic as any;
        const movement = buildMovementRows(
            logic?.data?.movementProfiles ?? [],
            logic?.data?.currentMoveMedium ?? MOVEMENT_MEDIUM.NONE,
        );

        // The add controls are gated on this in the template; it is passed
        // explicitly rather than assumed to be in the render context (the Being
        // sheet passes `canEditBody` the same way).
        return Object.assign(context, {
            attributes,
            affiliations,
            movement,
            isEditable: this.isEditable,
        });
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
        this: SohlActorSheetBase,
        _event: PointerEvent,
        target: HTMLElement,
    ): Promise<void> {
        const medium = target.closest("[data-medium]")?.getAttribute("data-medium");
        if (!medium) return;
        const logic = this.document.logic as any;
        const action = logic?.actions.get("makeDefaultMedium") as SohlAction | undefined;
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
     * Prepare context for the Mysteries tab: mysteries, mystical abilities.
     *
     * @param context - The render context to augment.
     * @param _options - The render options (unused).
     * @returns The augmented render context.
     */
    protected async _prepareMysteriesContext(
        context: foundry.applications.api.DocumentSheetV2.RenderContext<SohlActor>,
        _options: foundry.applications.api.DocumentSheetV2.RenderOptions,
    ): Promise<foundry.applications.api.DocumentSheetV2.RenderContext<SohlActor>> {
        const actor = this.document;

        // Mysteries: one section per subType, always shown (even when empty)
        // and in declared order, so every mystery category has a header.
        const mysteries = actor.itemTypes[ITEM_KIND.MYSTERY] ?? [];
        const mysteryBuckets = groupBySubType(
            mysteries,
            (mystery: any) => (mystery.system as any).subType,
        );
        const mysterySections = MysterySubTypes.map((subType: any) => ({
            subType,
            label: game.i18n.localize(
                (MysterySubTypeChoices as Record<string, string>)[subType] ?? subType,
            ),
            items: mysteryBuckets[subType] ?? [],
        }));

        // Mystical abilities: one section per subType, always shown (even when
        // empty) and in declared order, so every ability category has a header.
        const abilities = actor.itemTypes[ITEM_KIND.MYSTICALABILITY] ?? [];
        const abilityBuckets = groupBySubType(
            abilities,
            (ability: any) => (ability.system as any).subType,
        );
        const abilitySections = MysticalAbilitySubTypes.map((subType: any) => {
            const columns = mysticalAbilityColumns(subType);
            return {
                subType,
                label: game.i18n.localize(
                    (MysticalAbilitySubTypeChoices as Record<string, string>)[subType] ?? subType,
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
}
