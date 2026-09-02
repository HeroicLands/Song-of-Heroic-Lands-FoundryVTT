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

import { SohlItem } from "./SohlItem";
import type { SohlActor } from "@src/document/actor/foundry/SohlActor";
import { SohlDataModel } from "@src/core/foundry/SohlDataModel";
import { openDatePickerDialog } from "@src/apps/foundry/date-picker-dialog";
import { openExpressionEditorDialog } from "@src/apps/foundry/expression-editor-dialog";
import { expressionScopes } from "@src/entity/expr/ExpressionScopeRegistry";
import { hintsToLabelTooltips } from "@src/apps/foundry/sheet-hints";
import {
    buildActionRows,
    createAction,
    editAction,
    deleteAction,
    runAction,
} from "@src/core/foundry/sheet-actions";
import { canMarkArchetype } from "@src/entity/archetype/archetype";
import {
    fvttCallHook,
    fvttCleanHTML,
    fvttIsCurrentUserGM,
    fvttWorldActors,
} from "@src/core/FoundryHelpers";
import { ACTOR_KIND, GearKinds } from "@src/utils/constants";
import { localizeSubType, keyTransferredEffects } from "@src/document/item/logic/item-sheet-view";
import { resolveDescriptionHtml } from "@src/document/item/logic/SohlItemBaseLogic";
import { descriptionLinkTarget } from "@src/utils/description-link";
type RenderContext = foundry.applications.api.DocumentSheetV2.RenderContext<SohlItem>;
type RenderOptions = foundry.applications.api.DocumentSheetV2.RenderOptions;

/**
 * Return an event view whose `currentTarget` is `target`, forwarding every other
 * property and method to the real event. ApplicationV2's delegated action
 * dispatch reports the frame as `currentTarget` and passes the `[data-action]`
 * element separately, but the shared array-editor handlers on the
 * {@link SohlDataModel} sheet mixin read `event.currentTarget` for the control's
 * dataset; this re-points it without mutating the read-only native event.
 *
 * @param event - The real pointer event from the action dispatcher.
 * @param target - The `[data-action]` control to expose as `currentTarget`.
 * @returns A proxy that reads as `event` except for `currentTarget`.
 */
function withCurrentTarget(event: PointerEvent, target: HTMLElement): PointerEvent {
    return new Proxy(event, {
        get(evt, prop, receiver) {
            if (prop === "currentTarget") return target;
            const value = Reflect.get(evt, prop, receiver);
            return typeof value === "function" ? value.bind(evt) : value;
        },
    });
}

// Define the base type for the sheet
const SohlItemSheetBase_Base = SohlDataModel.SheetMixin<
    SohlItem,
    typeof foundry.applications.api.DocumentSheetV2<SohlItem>
>(foundry.applications.api.DocumentSheetV2<SohlItem>);

/** @internal */
export abstract class SohlItemSheetBase extends SohlItemSheetBase_Base {
    static PARTS = {
        header: {
            template: "systems/sohl/templates/item/parts/header.hbs",
            id: "header",
        },
        tabs: {
            id: "tabs",
            classes: ["tabs"],
            // Core template renders the <nav> from `context.tabs` (see BeingSheet).
            template: "templates/generic/tab-navigation.hbs",
        },
        description: {
            container: { classes: ["tab-body"], id: "tabs" },
            template: "systems/sohl/templates/item/parts/description.hbs",
            // No `scrollable`: the <prose-mirror> editor fills the tab and
            // scrolls its own content, so the tab itself never scrolls.
        },
        actions: {
            container: { classes: ["tab-body"], id: "tabs" },
            template: "systems/sohl/templates/item/parts/actions.hbs",
            scrollable: [""],
        },
        effects: {
            container: { classes: ["tab-body"], id: "tabs" },
            template: "systems/sohl/templates/item/parts/effects.hbs",
            scrollable: [""],
        },
    };

    // v13 ApplicationTabsConfiguration (mirrors BeingSheet). The v1-style
    // `navSelector`/`contentSelector` keys are not read by ApplicationV2 and left
    // `context.tabs` unpopulated, so the `tabs` part rendered nothing.
    /** @inheritDoc */
    static override TABS = {
        sheet: {
            initial: "properties",
            tabs: [
                {
                    id: "properties",
                    label: "SOHL.Item.tab.properties",
                    icon: "fa-solid fa-sliders",
                },
                {
                    id: "description",
                    label: "SOHL.Item.tab.description",
                    icon: "fa-solid fa-scroll",
                },
                {
                    id: "actions",
                    label: "SOHL.Item.tab.actions",
                    icon: "fa-solid fa-gears",
                },
                {
                    id: "effects",
                    label: "SOHL.Item.tab.effects",
                    icon: "fa-solid fa-plus-minus",
                },
            ],
        },
    };

    /**
     * ApplicationV2 auto-merges `DEFAULT_OPTIONS` up the prototype chain, so this
     * level only contributes what it adds (no `...super` spread). Registers the
     * general `clearField` action (for the `clearableNumberInput` helper) and
     * the `pickDate` action (for the `datePicker` helper).
     */
    static override DEFAULT_OPTIONS: PlainObject = {
        // Per-type frame class. ApplicationV2 auto-merges (concatenates) the
        // `classes` arrays up the chain, so the frame ends up `sohl sheet item`
        // (`sohl` from the SheetMixin, `sheet` from DocumentSheetV2). The compound
        // `.sohl.item` header/apps rules match only once this `item` class is present.
        classes: ["item"],
        // Give item sheets a fixed initial size. Without it the sheet has no
        // definite height, so ApplicationV2 re-fits it to each tab's content and
        // the window jumps size when switching tabs (and grows very wide).
        position: { width: 600, height: 500 },
        actions: {
            clearField: SohlItemSheetBase._onClearField,
            pickDate: SohlItemSheetBase._onPickDate,
            editExpression: SohlItemSheetBase._onEditExpression,
            createAction: SohlItemSheetBase._onCreateAction,
            editAction: SohlItemSheetBase._onEditAction,
            deleteAction: SohlItemSheetBase._onDeleteAction,
            runAction: SohlItemSheetBase._onRunAction,
            addArrayItem: SohlItemSheetBase._onAddArrayItem,
            deleteArrayItem: SohlItemSheetBase._onDeleteArrayItem,
            toggleDescriptionEdit: SohlItemSheetBase._onToggleDescriptionEdit,
        },
    };

    /**
     * Whether the Description tab is showing the editor for a **pointer**
     * description rather than the text it points at (#1357). Per open sheet and
     * deliberately not persisted: a pointer reads as its target every time the
     * sheet is opened, and an author asks for the editor when they want it.
     */
    protected _descriptionEditing = false;

    /**
     * `data-action="toggleDescriptionEdit"`: swap the Description tab between
     * the pointer's resolved text and the editor holding the link. Only the
     * Description part is re-rendered, so switching costs no other tab's state.
     *
     * @param _event - The triggering pointer event (unused).
     * @param _target - The clicked toggle control (unused).
     */
    protected static async _onToggleDescriptionEdit(
        this: SohlItemSheetBase,
        _event: PointerEvent,
        _target: HTMLElement,
    ): Promise<void> {
        this._descriptionEditing = !this._descriptionEditing;
        await this.render({ parts: ["description"] } as RenderOptions);
    }

    /**
     * `data-action="createAction"`: author a new custom (SCRIPT) action on this
     * item, delegating to the shared {@link createAction} sheet helper.
     * @param _event - The triggering pointer event (unused).
     * @param _target - The clicked create control (unused).
     */
    protected static async _onCreateAction(
        this: SohlItemSheetBase,
        _event: PointerEvent,
        _target: HTMLElement,
    ): Promise<void> {
        await createAction(this.document);
    }

    /**
     * `data-action="editAction"`: open the clicked action's bound Macro sheet,
     * delegating to the shared {@link editAction} sheet helper.
     * @param _event - The triggering pointer event (unused).
     * @param target - The clicked control inside a `data-action-name` row.
     */
    protected static async _onEditAction(
        this: SohlItemSheetBase,
        _event: PointerEvent,
        target: HTMLElement,
    ): Promise<void> {
        await editAction(this.document, target);
    }

    /**
     * `data-action="deleteAction"`: remove the clicked custom action from this
     * item, delegating to the shared {@link deleteAction} sheet helper.
     * @param _event - The triggering pointer event (unused).
     * @param target - The clicked control inside a `data-action-name` row.
     */
    protected static async _onDeleteAction(
        this: SohlItemSheetBase,
        _event: PointerEvent,
        target: HTMLElement,
    ): Promise<void> {
        await deleteAction(this.document, target);
    }

    /**
     * `data-action="runAction"`: execute the clicked action (shift-click skips
     * its dialog), delegating to the shared {@link runAction} sheet helper.
     * @param event - The triggering pointer event (shift skips the dialog).
     * @param target - The clicked control inside a `data-action-name` row.
     */
    protected static async _onRunAction(
        this: SohlItemSheetBase,
        event: PointerEvent,
        target: HTMLElement,
    ): Promise<void> {
        await runAction(this.document, target, event);
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
        this: SohlItemSheetBase,
        _event: PointerEvent,
        target: HTMLElement,
    ): Promise<void> {
        const path = target.dataset.fieldPath;
        if (!path) return;
        await this.document.update({ [path]: null });
    }

    /**
     * `data-action="pickDate"`: open the calendar-aware date picker for a
     * worldTime field (see the `datePicker` helper). The dialog returns the
     * chosen worldTime number, `null` to clear, or `undefined` when cancelled;
     * only a definite choice is written via `document.update`.
     *
     * @param _event - The triggering pointer event (unused).
     * @param target - The clicked control, carrying `data-field-path`.
     */
    protected static async _onPickDate(
        this: SohlItemSheetBase,
        _event: PointerEvent,
        target: HTMLElement,
    ): Promise<void> {
        const path = target.dataset.fieldPath;
        if (!path) return;
        const current = foundry.utils.getProperty(this.document, path) as number | null | undefined;
        const result = await openDatePickerDialog(current);
        if (result === undefined) return;
        await this.document.update({ [path]: result });
    }

    /**
     * `data-action="editExpression"`: open the SafeExpression code editor for a
     * formula field (a {@link SafeExpressionField}). Reads the update path from
     * the control's `data-field-path`, opens the editor on the field's current
     * source, and writes the result via `document.update`. The dialog returns the
     * edited string (Save), `null` (Clear), or `undefined` (Cancel); only a
     * definite choice is persisted.
     *
     * @param _event - The triggering pointer event (unused).
     * @param target - The clicked control, carrying `data-field-path`.
     */
    protected static async _onEditExpression(
        this: SohlItemSheetBase,
        _event: PointerEvent,
        target: HTMLElement,
    ): Promise<void> {
        const path = target.dataset.fieldPath;
        if (!path) return;
        const current = foundry.utils.getProperty(this.document, path) as string | null | undefined;
        // `data-expr-scope` carries the id the SafeExpressionField declared, so
        // the editor's autocomplete and live validation come from the same
        // declaration the runtime validates against (#1142).
        const scope = expressionScopes.get(target.dataset.exprScope);
        const result = await openExpressionEditorDialog(current, { scope });
        if (result === undefined) return;
        await this.document.update({ [path]: result });
    }

    /**
     * `data-action="addArrayItem"`: append a value to an array field via the
     * shared array-editor handler on the {@link SohlDataModel} sheet mixin,
     * routed by the control's dataset (aim, value-descriptor, choice, or
     * primitive). The mixin methods read `event.currentTarget` for that dataset,
     * but ApplicationV2's delegated action dispatch sets `currentTarget` to the
     * frame; `withCurrentTarget` re-points it at the `[data-action]` control.
     *
     * @param event - The triggering pointer event.
     * @param target - The clicked control, carrying the array/object dataset.
     */
    protected static async _onAddArrayItem(
        this: SohlItemSheetBase,
        event: PointerEvent,
        target: HTMLElement,
    ): Promise<void> {
        await (this as any)._addArrayItem(withCurrentTarget(event, target));
    }

    /**
     * `data-action="deleteArrayItem"`: remove a row from an array field via the
     * shared array-editor handler on the {@link SohlDataModel} sheet mixin
     * (delete-by-index for object rows, delete-by-value for primitives). See
     * {@link _onAddArrayItem} for why `currentTarget` is re-pointed.
     *
     * @param event - The triggering pointer event.
     * @param target - The clicked control, carrying the array/value dataset.
     */
    protected static async _onDeleteArrayItem(
        this: SohlItemSheetBase,
        event: PointerEvent,
        target: HTMLElement,
    ): Promise<void> {
        await (this as any)._deleteArrayItem(withCurrentTarget(event, target));
    }

    /** The {@link SohlItem} document this sheet edits. */
    override get document(): SohlItem {
        return super.document as SohlItem;
    }

    /** The {@link SohlItem} document this sheet edits. */
    get item(): SohlItem {
        return this.document;
    }

    /** The actor owning this item, or null if the item is unowned. */
    get actor(): SohlActor | null {
        return this.item.actor;
    }

    /**
     * After each render, convert field hints into label tooltips and bind the
     * effect/action context menus.
     *
     * The array-field editor controls (`.add-array-item` / `.delete-array-item`)
     * are wired declaratively via `data-action` (see `DEFAULT_OPTIONS.actions`),
     * not bound here: ApplicationV2 delegates `data-action` clicks from a single
     * listener on the frame that survives every part re-render, whereas
     * per-node `addEventListener` calls made here bound to controls that a
     * subsequent part swap detached, so the clicks never reached the handler
     * (#734).
     *
     * @param context - The render context.
     * @param options - The render options.
     */
    protected override async _onRender(context: PlainObject, options: PlainObject): Promise<void> {
        await super._onRender(context, options);

        const el = (this as any).element as HTMLElement | undefined;
        // Convert each field's always-on hint into a "?" tooltip on its label, so
        // the guidance no longer competes with the field value (read-only view
        // benefits too, so this runs before the editable-only bindings below).
        if (el) hintsToLabelTooltips(el);

        // Mark an owned item's sheet root with its owning actor, the same
        // marker the actor sheets emit, so context-menu predicates opened from
        // within this sheet can resolve their `actorLogic` binding by the
        // documented `[data-actor-id]` walk rather than by luck (#1132).
        const ownerId = (this.document as any).actor?.id;
        if (el && ownerId) el.dataset.actorId = ownerId;

        if (!this.isEditable) return;

        // Bind the effect/action context menus (right-click on an effect row
        // and click on a `⋮` control). `_contextMenu` is provided by the
        // SohlDataModel sheet mixin (#501).
        if (el) (this as any)._contextMenu?.(el);
    }

    /**
     * On close, forget that the Description tab was showing a pointer's editor
     * (#1357), so reopening the sheet reads as the target's text again — the
     * state is a momentary "let me edit this", not a preference.
     *
     * @param options - The close options, forwarded to the base implementation.
     */
    protected override _onClose(options: PlainObject): void {
        this._descriptionEditing = false;
        super._onClose(options as any);
    }

    /**
     * Selects which sheet parts to render: always the header and tabs, plus
     * the remaining tabs unless the document is in limited-view mode.
     *
     * @param options - Render options whose `parts` array is populated in place.
     * @param options.parts - Populated with the list of sheet part ids to render.
     */
    protected override _configureRenderOptions(
        options: Partial<foundry.applications.api.HandlebarsApplicationMixin.RenderOptions>,
    ): void {
        super._configureRenderOptions(options);
        // By default, we only show the header and tabs
        // This is the default behavior for all data model sheets
        options.parts = ["header", "tabs"];
        // Don't show the other tabs if only limited view
        if ((this.document as any).limited) return;
        // If the document is not limited, we show all parts
        options.parts.push("properties", "description", "actions", "effects");
    }

    /**
     * Builds the shared render context delegated to all sheet parts.
     * @param options - Sheet render options.
     * @returns The base render context shared across parts.
     */
    protected override async _prepareContext(options: RenderOptions): Promise<RenderContext> {
        const context = await super._prepareContext(options);

        // Add any shared data needed across all parts here
        // options.parts contains array of partIds being rendered
        // e.g., ["header", "tabs", "properties", "description", ...]

        return context;
    }

    /**
     * Augments the render context for a specific part and fires the matching
     * `sohl.<type>.prepare*Context` hook so subscribers can extend it.
     * @param partId - The identifier of the part being rendered.
     * @param context - The render context to augment.
     * @param options - Sheet render options.
     * @returns The context extended with part-specific data.
     */
    protected async _preparePartContext(
        partId: string,
        context: RenderContext,
        options: RenderOptions,
    ): Promise<RenderContext> {
        // _preparePartContext is called for each part with the specific partId
        // This is where you prepare part-specific data
        const logic = this.document.logic as any;
        const type = logic.type;

        Object.assign(context, {
            logic,
        });

        // Expose the prepared tab descriptor for this part so content sections
        // can resolve their `active` state and tab group (see BeingSheet).
        (context as any).tab = (context as any).tabs?.[partId];
        switch (partId) {
            case "properties":
                context = await this._preparePropertiesContext(context, options);
                fvttCallHook(`sohl.${type}.preparePropertiesContext`, this, context);
                return context;
            case "description":
                context = await this._prepareDescriptionContext(context, options);
                fvttCallHook(`sohl.${type}.prepareDescriptionContext`, this, context);
                return context;
            case "actions":
                context = await this._prepareActionsContext(context, options);
                fvttCallHook(`sohl.${type}.prepareActionsContext`, this, context);
                return context;
            case "effects":
                context = await this._prepareEffectsTabContext(context, options);
                fvttCallHook(`sohl.${type}.prepareEffectsContext`, this, context);
                return context;
            case "header":
                context = await this._prepareHeaderContext(context, options);
                fvttCallHook(`sohl.${type}.prepareHeaderContext`, this, context);
                return context;
            case "tabs":
                context = await this._prepareTabsContext(context, options);
                return context;
            default:
                return context;
        }
    }

    /**
     * Prepare context for the tabs navigation part.
     * @param context - The render context to augment.
     * @param options - Sheet render options.
     * @returns The context, unchanged by the base implementation.
     */
    protected async _prepareTabsContext(
        context: RenderContext,
        options: RenderOptions,
    ): Promise<RenderContext> {
        return context;
    }

    /**
     * Prepare context for the sheet header.
     * Provides the item name, image, type label, and the archetype-marker
     * control's binding (issue #1780).
     * @param context - The render context to augment.
     * @param _options - Sheet render options (unused).
     * @returns The context extended with header fields.
     */
    protected async _prepareHeaderContext(
        context: RenderContext,
        _options: RenderOptions,
    ): Promise<RenderContext> {
        return Object.assign(context, {
            logic: this.document.logic as any,
            itemName: this.document.name,
            itemImg: this.document.img,
            typeLabel: this.document.logic?.typeLabel,
            archetype: (this.document.system as any)?.archetype ?? null,
            canMarkArchetype: canMarkArchetype(fvttIsCurrentUserGM(), this.document.isEmbedded),
        });
    }

    /**
     * Prepare context for the Properties tab.
     *
     * The base implementation provides the common item properties
     * (notes, textReference) plus, for **gear**, the world's cohorts as the
     * choices behind the `sharedWithCohortsField` control (issue #76).
     * Subclasses override this to add type-specific properties.
     * @param context - The render context to augment.
     * @param _options - Sheet render options (unused).
     * @returns The context extended with common item properties.
     */
    protected async _preparePropertiesContext(
        context: RenderContext,
        _options: RenderOptions,
    ): Promise<RenderContext> {
        const system = this.document.system as any;
        return Object.assign(context, {
            notes: system.notes ?? "",
            textReference: system.textReference ?? "",
            cohortChoices: this._cohortChoices(),
        });
    }

    /**
     * The world's Cohort actors as `{value,label}` choices for the gear
     * sharing control (issue #76), keyed by each cohort's `system.shortcode` —
     * the stable, human-written reference a sharing list records.
     *
     * Empty for a non-gear item, or when the world has no cohort (or none the
     * viewer can see); the control renders nothing in that case, so no sheet
     * carries a chooser with nothing to choose.
     *
     * @returns The cohort choices, ordered by name.
     */
    protected _cohortChoices(): { value: string; label: string }[] {
        if (!GearKinds.includes(this.document.type as any)) return [];
        return fvttWorldActors()
            .filter((actor: any) => actor.type === ACTOR_KIND.COHORT && !!actor.system?.shortcode)
            .map((actor: any) => ({
                value: actor.system.shortcode as string,
                label: actor.name as string,
            }))
            .sort((a, b) => a.label.localeCompare(b.label));
    }

    /**
     * Prepare context for the Description tab — the item's long-form
     * description, persisted in `system.docHtml`. (The short one-line `notes`
     * field shown beside item rows on the actor sheet is edited elsewhere.)
     *
     * An ordinary description is edited by a `<prose-mirror>` element bound to
     * `system.docHtml` (see `description.hbs`), which takes the raw value and
     * enriches for display itself — no pre-enriched HTML needed.
     *
     * A description that is *only* a link is a **pointer** (#1356): the item's
     * description lives at the target, so showing the link would hand a reader
     * machinery instead of content (#1357). The target's text is resolved and
     * shown read-only instead, and {@link _onToggleDescriptionEdit} swaps in the
     * editor — holding the link — for an author who wants to re-aim it.
     *
     * @param context - The render context to augment.
     * @param _options - Sheet render options (unused).
     * @returns The context extended with the description view state.
     */
    protected async _prepareDescriptionContext(
        context: RenderContext,
        _options: RenderOptions,
    ): Promise<RenderContext> {
        const docHtml = ((this.document.system as any).docHtml ?? "") as string;
        const isPointer = !!descriptionLinkTarget(docHtml);
        // A non-pointer description has nothing to show but the editor, so it
        // is always in "editing" mode and never grows a toggle.
        const editing = !isPointer || this._descriptionEditing;
        return Object.assign(context, {
            descriptionIsPointer: isPointer,
            descriptionEditing: editing,
            // Enriched (content links and inline rolls stay live) and passed
            // through Foundry's allowlist sanitizer, since the tab injects it
            // as markup rather than handing it to an element that enriches for
            // itself (issue #161).
            descriptionHtml: editing ? "" : fvttCleanHTML(await resolveDescriptionHtml(docHtml)),
        });
    }

    /**
     * Prepare context for the Actions tab.
     * Provides the list of action items associated with this item, each with
     * the availability state its run control renders from.
     * @param context - The render context to augment.
     * @param _options - Sheet render options (unused).
     * @returns The context extended with the item's actions.
     */
    protected async _prepareActionsContext(
        context: RenderContext,
        _options: RenderOptions,
    ): Promise<RenderContext> {
        // Shared with the actor sheet so both tabs list — and gate — actions
        // identically.
        return Object.assign(context, buildActionRows(this.document));
    }

    /**
     * Prepare context for the Effects tab.
     * Provides the item's own effects and any transferred effects.
     * @param context - The render context to augment.
     * @param _options - Sheet render options (unused).
     * @returns The context extended with own and transferred effects.
     */
    protected async _prepareEffectsTabContext(
        context: RenderContext,
        _options: RenderOptions,
    ): Promise<RenderContext> {
        const effects = (this.document as any).effects?.contents ?? [];
        const trxEffects = keyTransferredEffects((this.document as any).transferredEffects);
        return Object.assign(context, { effects, trxEffects });
    }
}
