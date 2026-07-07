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

import { buildActionScope } from "@src/utils/helpers";
import type { SohlActor } from "@src/document/actor/foundry/SohlActor";
import type { SohlActiveEffect } from "@src/document/effect/foundry/SohlActiveEffect";
import type { SohlContextMenu } from "@src/apps/foundry/SohlContextMenu";
import type { HTMLString } from "@src/utils/helpers";
import { SohlActionContext } from "@src/entity/action/SohlActionContext";
import {
    SohlDataModel,
    defineSohlDataSchema,
} from "@src/core/foundry/SohlDataModel";
import { SohlLogic, SohlLogicData } from "@src/core/logic/SohlLogic";
import { fvttCallHook } from "@src/core/FoundryHelpers";
import type { SohlTriggerContext } from "@src/entity/event/event-trigger";
import { isScriptActionMutationAllowed } from "@src/entity/action/SohlAction";
import { GearLogic } from "../logic/GearLogic";
import {
    localizeSubType,
    keyTransferredEffects,
    findSimilarItem,
    type ItemMatchKey,
} from "@src/document/item/logic/item-sheet-view";
const { HTMLField } = foundry.data.fields;
const TextEditor = foundry.applications.ux.TextEditor.implementation;
type RenderContext =
    foundry.applications.api.DocumentSheetV2.RenderContext<SohlItem>;
type RenderOptions = foundry.applications.api.DocumentSheetV2.RenderOptions;

// NOTE: The Foundry-free contracts (SohlItemLogic, SohlItemData, SohlItemBaseLogic)
// now live in src/document/item/logic/SohlItemBaseLogic.ts and are re-exported here.
// TODO(#77): The remaining Foundry-coupled contents (SohlItem Document, SohlItemDataModel,
// SohlItemSheetBase) could still be split into separate files per concern.
/**
 * Base class for all Item documents in the SoHL system — affiliations,
 * afflictions, gear (armor, weapons, containers, misc, projectiles,
 * concoctions), combat techniques, mysteries, mystical abilities, skills,
 * traits, and traumas.
 *
 * Like {@link SohlActor}, the typed game-rules surface lives on the item's
 * logic object: prefer `item.logic` (equivalently `item.system.logic`) and the
 * typed `item.logic.data` ({@link SohlItemData}) over reaching into
 * `item.system` directly.
 */
export class SohlItem extends Item {
    /**
     * Get the logic object for this item.
     * @remarks
     * This is a convenience accessor to avoid having to access `this.system.logic`
     */
    get logic(): SohlItemLogic<any> {
        return (this.system as any).logic as SohlItemLogic<any>;
    }

    /**
     * Get the context menu options for a specific SohlItem document.
     * @param doc The SohlItem document to get context options for.
     * @returns The context menu options for the specified SohlItem document.
     */
    protected static _getContextOptions(
        doc: SohlItem,
    ): SohlContextMenu.Entry[] {
        return doc.getContextOptions();
    }

    /**
     * The context-menu options — the actions currently available — for this
     * item.
     *
     * @remarks
     * One entry per action whose `visible` predicate currently passes (an
     * action's `trigger` / domain preconditions can hide it); `SCRIPT` actions
     * are additionally permission-gated when executed. Use this to discover
     * which actions can be performed on the item.
     *
     * @returns The available context-menu entries.
     */
    getContextOptions(): SohlContextMenu.Entry[] {
        return this.logic.getContextOptions();
    }

    /**
     * Authoring gate: block non-GM users from adding, removing, or
     * modifying SCRIPT entries in `system.actionDefs`. SCRIPT actions
     * run unsandboxed JavaScript, so authorship is restricted to the GM.
     * INTRINSIC actions and non-actionDefs updates are unaffected.
     * @param changes - The changes about to be applied.
     * @param options - Foundry update options.
     * @param user - The user attempting the update.
     * @returns `false` to cancel the update, otherwise delegates to super.
     */
    protected override async _preUpdate(
        changes: PlainObject,
        options: PlainObject,
        user: User,
    ): Promise<boolean | void> {
        const allowed = await super._preUpdate(
            changes as any,
            options as any,
            user as any,
        );
        if (allowed === false) return false;
        const newActionDefs = (changes as any)?.system?.actionDefs;
        if (newActionDefs !== undefined) {
            const oldActionDefs = (this.system as any)?.actionDefs;
            if (
                !isScriptActionMutationAllowed(
                    oldActionDefs,
                    newActionDefs,
                    user,
                )
            ) {
                sohl.log.warn(
                    `Refusing actionDefs update on "${this.name}": only the GM may modify SCRIPT action entries.`,
                    { item: this.id, user: (user as any)?.id },
                );
                (globalThis as any).ui?.notifications?.warn?.(
                    "Only the GM can modify scripted actions on this item.",
                );
                return false;
            }
        }
    }

    /**
     * Set of phases for which `applyActiveEffects` has already run in the
     * current data-preparation cycle. Cleared at the top of the actor's
     * `prepareBaseData()`. Mirrors Foundry's `Actor#_completedActiveEffectPhases`.
     */
    protected _completedActiveEffectPhases?: Set<string>;

    /**
     * Effects living elsewhere whose `targets` include this item. Walks
     * sibling items and the owning actor. Phaseless; the caller filters by
     * `change.phase` when iterating changes.
     * @returns The effects on siblings and the actor that target this item.
     */
    transferredActiveEffects(): SohlActiveEffect[] {
        const out: SohlActiveEffect[] = [];
        const actor = this.actor;
        if (!actor) return out;

        for (const sibling of actor.items.values() as Iterable<SohlItem>) {
            if (sibling === this) continue;
            for (const effect of sibling.effects.values() as Iterable<SohlActiveEffect>) {
                if (effect.targets.includes(this)) out.push(effect);
            }
        }
        for (const effect of actor.effects.values() as Iterable<SohlActiveEffect>) {
            if (effect.targets.includes(this)) out.push(effect);
        }
        return out;
    }

    /**
     * All effects applicable to this item: own self-targeting effects plus
     * those transferred from siblings / the actor via scope. Mirrors the
     * shape of Foundry's `Actor#allApplicableEffects` generator so the same
     * dispatch loop can consume both.
     */
    *allApplicableEffects(): Generator<SohlActiveEffect> {
        for (const effect of this.effects.values() as Iterable<SohlActiveEffect>) {
            if (effect.targets.includes(this)) yield effect;
        }
        for (const effect of this.transferredActiveEffects()) yield effect;
    }

    /**
     * Walk `allApplicableEffects()`, filter changes by `phase`, sort by
     * priority, and dispatch each to the static `applyChange` path
     * (which routes through `SohlActiveEffect._applyChangeUnguided` for
     * SoHL-prefixed keys). Mirrors Foundry's `Actor#applyActiveEffects`.
     * @param phase - The change phase whose effect changes to apply this pass.
     */
    applyActiveEffects(phase: string): void {
        const AEClass = foundry.documents.ActiveEffect as any;
        if (typeof phase !== "string") return;
        if (!(phase in (AEClass.CHANGE_PHASES ?? {}))) {
            sohl.log.warn(
                `Unknown phase "${phase}" passed to SohlItem.applyActiveEffects`,
            );
            return;
        }
        this._completedActiveEffectPhases ??= new Set<string>();
        if (this._completedActiveEffectPhases.has(phase)) return;
        this._completedActiveEffectPhases.add(phase);

        interface Pending {
            effect: SohlActiveEffect;
            change: any;
        }
        const pending: Pending[] = [];

        for (const effect of this.allApplicableEffects()) {
            if (!(effect as any).active) continue;
            const effectChanges =
                ((effect as any).system?.changes as any[]) ?? [];
            for (const change of effectChanges) {
                if (!change.key || change.phase !== phase) continue;
                pending.push({ effect, change });
            }
        }
        pending.sort(
            (a, b) =>
                ((a.change.priority as number) ?? 0) -
                ((b.change.priority as number) ?? 0),
        );

        for (const { effect, change } of pending) {
            try {
                const copy = foundry.utils.deepClone(change);
                (copy as any).effect = effect;
                (effect.constructor as any).applyChange(this, copy, {});
            } catch (err) {
                sohl.log.warn(
                    `Effect "${(effect as any).name}" change "${change.key}" failed on ${this.uuid}:`,
                    err as PlainObject,
                );
            }
        }
    }

    /**
     * Helper method to handle chat card button clicks.
     * @param btn The button element that was clicked.
     */
    async onChatCardButton(btn: HTMLElement): Promise<void> {
        const actionName = btn.dataset.action;
        if (!actionName) return;

        const context = new SohlActionContext({
            speaker: this.logic.speaker,
            type: actionName,
            title: btn.textContent?.trim() ?? actionName,
            scope: buildActionScope(
                btn.dataset,
                (this.logic as any).actorLogic ?? this.logic,
            ),
        });
        const action =
            this.logic.actions.get(actionName) ??
            [...this.logic.actions.values()].find(
                (act) =>
                    act.data.executor === actionName ||
                    act.data.title === actionName,
            );

        if (action) {
            await action.execute(context);
            return;
        }

        const fn = (this.logic as any)[actionName];
        if (typeof fn === "function") {
            await fn.call(this.logic, context);
        } else {
            sohl.log.warn(
                `Chat card action "${actionName}" not found on item "${this.name}".`,
            );
        }
    }

    /**
     * Helper method to handle chat card edit actions.
     * @param btn The button element that was clicked.
     */
    async onChatCardEditAction(btn: HTMLElement): Promise<void> {
        // TODO(#66): Handle chat card edit actions here
        console.log("Edit action clicked:", btn);
    }

    /**
     * Handle a trigger dispatched by the SoHL event queue.
     * Override in subclasses to implement item-specific trigger handling.
     * @param kind - Subscription kind identifier
     * @param _context - Trigger context (discriminated by `context.name`)
     * @param _payload - Optional context data attached when subscribing
     */
    async handleSohlEvent(
        kind: string,
        _context: SohlTriggerContext,
        _payload?: Record<string, unknown>,
    ): Promise<void> {
        console.warn(
            `SoHL | ${this.name} (Item) received unhandled event "${kind}"`,
        );
    }

    /**
     * The SohlActor that owns this item, or null if it is unowned.
     */
    override get actor(): SohlActor | null {
        return this.parent;
    }
}

/*
 * The Foundry-free logic-layer contracts (SohlItemLogic, SohlItemData,
 * SohlItemBaseLogic) live in the logic layer; they are re-exported here so
 * Foundry-side consumers can keep importing them from this module.
 */
export {
    SohlItemBaseLogic,
    type SohlItemLogic,
    type SohlItemData,
} from "@src/document/item/logic/SohlItemBaseLogic";
import type {
    SohlItemLogic,
    SohlItemData,
} from "@src/document/item/logic/SohlItemBaseLogic";

/**
 * Builds the base data schema shared by all SoHL items (the notes and
 * generated documentation HTML fields).
 * @returns The Foundry data schema common to every item kind.
 */
function defineSohlItemDataSchema(): foundry.data.fields.DataSchema {
    return {
        ...defineSohlDataSchema(),
        notes: new HTMLField(),
        docHtml: new HTMLField(),
    };
}

type SohlItemDataSchema = ReturnType<typeof defineSohlItemDataSchema>;

/**
 * The `SohlItemDataModel` class extends the Foundry VTT `TypeDataModel` to provide
 * a structured data model for items in the "Song of Heroic Lands" system. It
 * encapsulates logic and behavior associated with items, offering a schema
 * definition and initialization logic.
 * @internal
 */
export abstract class SohlItemDataModel<
    TSchema extends foundry.data.fields.DataSchema = SohlItemDataSchema,
    TLogic extends SohlItemLogic<SohlItemData> = SohlItemLogic<SohlItemData>,
>
    extends SohlDataModel<TSchema, SohlItem, TLogic>
    implements SohlItemData<TLogic>
{
    notes!: HTMLString;
    docHtml!: HTMLString;

    /**
     * Builds the item data model, enforcing that its parent document is a
     * {@link SohlItem}.
     * @param data - Source data for the data model.
     * @param options - Data model options; `parent` must be a `SohlItem`.
     * @throws If the supplied parent is not a `SohlItem`.
     */
    constructor(data: PlainObject = {}, options: PlainObject = {}) {
        if (!(options.parent?.documentName === "Item")) {
            throw new Error("Parent must be of type SohlItem");
        }
        super(data, options);
    }

    /** The owning {@link SohlItem} document. */
    get item(): SohlItem {
        return this.parent;
    }

    /** Localization key prefix for this item kind, e.g. `"SOHL.Item.skill"`. */
    get i18nPrefix(): string {
        return `SOHL.Item.${this.kind}`;
    }

    /**
     * Get the full label for this item, optionally including name and subtype.
     * @remarks
     * The item name and item subtype are both optional, although shown by default.
     * In English, the format will be:
     *    `[<item name>] [<item subtype>] <item type>`
     *
     * @example
     * EN: `Melee Combat Skill`
     * ES: `Habilidad de Combate Cuerpo a Cuerpo`
     * RU: `Навык боя Ближний бой`
     * DE: `Nahkampf Kampffertigkeit`
     *
     * @param options - Controls which parts of the label are included.
     * @param options.withName - Whether to prefix the label with the item name.
     * @param options.withSubType - Whether to include the item subtype in the label.
     * @returns The fully localized string in the appropriate language based on the
     * user's settings.
     */
    label(
        options: { withName: boolean; withSubType: boolean } = {
            withName: true,
            withSubType: true,
        },
    ): string {
        let typeText: string;
        if (options.withSubType && (this as any).subType) {
            typeText = `SOHL.${this.kind}.typelabel.${(this as any).subType}`;
        } else {
            typeText = `SOHL.${this.kind}.typelabel`;
        }

        let result = sohl.i18n.localize(typeText);
        if (options.withName) {
            result = sohl.i18n.format("SOHL.SohlItem.labelWithName", {
                name: this.parent.name,
                type: result,
            });
        }
        return result;
    }

    /**
     * Returns the Foundry data schema common to all SoHL items.
     * @returns The base item data schema.
     */
    static override defineSchema(): foundry.data.fields.DataSchema {
        return defineSohlItemDataSchema();
    }
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
            scrollable: [""],
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
    static override TABS = {
        sheet: {
            initial: "properties",
            tabs: [
                { id: "properties", label: "SOHL.Item.tab.properties" },
                { id: "description", label: "SOHL.Item.tab.description" },
                { id: "actions", label: "SOHL.Item.tab.actions" },
                { id: "effects", label: "SOHL.Item.tab.effects" },
            ],
        },
    };

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
     * Selects which sheet parts to render: always the header and tabs, plus
     * the remaining tabs unless the document is in limited-view mode.
     * @param options - Render options whose `parts` array is populated in place.
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
    protected override async _prepareContext(
        options: RenderOptions,
    ): Promise<RenderContext> {
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
        const type = this.document.type;
        // Expose the prepared tab descriptor for this part so content sections
        // can resolve their `active` state and tab group (see BeingSheet).
        (context as any).tab = (context as any).tabs?.[partId];
        switch (partId) {
            case "properties":
                context = await this._preparePropertiesContext(
                    context,
                    options,
                );
                fvttCallHook(
                    `sohl.${type}.preparePropertiesContext`,
                    this,
                    context,
                );
                return context;
            case "description":
                context = await this._prepareDescriptionContext(
                    context,
                    options,
                );
                fvttCallHook(
                    `sohl.${type}.prepareDescriptionContext`,
                    this,
                    context,
                );
                return context;
            case "actions":
                context = await this._prepareActionsContext(context, options);
                fvttCallHook(
                    `sohl.${type}.prepareActionsContext`,
                    this,
                    context,
                );
                return context;
            case "effects":
                context = await this._prepareEffectsTabContext(
                    context,
                    options,
                );
                fvttCallHook(
                    `sohl.${type}.prepareEffectsContext`,
                    this,
                    context,
                );
                return context;
            case "header":
                context = await this._prepareHeaderContext(context, options);
                fvttCallHook(
                    `sohl.${type}.prepareHeaderContext`,
                    this,
                    context,
                );
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
     * Provides the item name, image, and type label.
     * @param context - The render context to augment.
     * @param _options - Sheet render options (unused).
     * @returns The context extended with header fields.
     */
    protected async _prepareHeaderContext(
        context: RenderContext,
        _options: RenderOptions,
    ): Promise<RenderContext> {
        const system = this.document.system as any;
        const subType = system.subType ?? "";
        const kind = system.constructor?.kind ?? this.document.type;
        const subTypeLabel = localizeSubType(subType, kind);
        return Object.assign(context, {
            itemName: this.document.name,
            itemImg: this.document.img,
            typeLabel: this.document.logic?.typeLabel ?? this.document.type,
            subTypeLabel,
        });
    }

    /**
     * Prepare context for the Properties tab.
     *
     * The base implementation provides the common item properties
     * (notes, textReference). Subclasses override
     * this to add type-specific properties.
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
        });
    }

    /**
     * Prepare context for the Description tab.
     * Provides enriched HTML for the full-page ProseMirror description editor.
     * @param context - The render context to augment.
     * @param _options - Sheet render options (unused).
     * @returns The context extended with the enriched description HTML.
     */
    protected async _prepareDescriptionContext(
        context: RenderContext,
        _options: RenderOptions,
    ): Promise<RenderContext> {
        const system = this.document.system as any;
        return Object.assign(context, {
            descriptionHTML: await TextEditor.enrichHTML(
                system.description ?? "",
            ),
        });
    }

    /**
     * Prepare context for the Actions tab.
     * Provides the list of action items associated with this item.
     * @param context - The render context to augment.
     * @param _options - Sheet render options (unused).
     * @returns The context extended with the item's actions.
     */
    protected async _prepareActionsContext(
        context: RenderContext,
        _options: RenderOptions,
    ): Promise<RenderContext> {
        const actions = this.document.logic?.actions ?? [];
        return Object.assign(context, { actions });
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
        const trxEffects = keyTransferredEffects(
            (this.document as any).transferredEffects,
        );
        return Object.assign(context, { effects, trxEffects });
    }

    /**
     * Route a dropped item to the gear or non-gear drop handler based on
     * whether it carries the `isCarried` property.
     * @param event - The originating drop event.
     * @param droppedItem - The item that was dropped onto this sheet.
     */
    protected async _onDropItem(
        event: DragEvent,
        droppedItem: SohlItem,
    ): Promise<void> {
        if (!this.document.isOwner) return;

        // If the item has the "isCarried" property, it is gear
        // otherwise it is not gear
        if (Object.hasOwn(droppedItem.system, "isCarried")) {
            this._onDropGear(event, droppedItem);
        } else {
            this._onDropNonGear(event, droppedItem);
        }
    }

    /**
     * Create one or more embedded items on the owning actor from dropped data,
     * prompting to overwrite any pre-existing similar item.
     * @param data - The dropped item data, or an array of item data.
     * @param event - The originating drop event (unused).
     * @returns The created items, or `false` if creation was not performed.
     */
    protected async _onDropItemCreate(
        data: PlainObject,
        event: DragEvent,
    ): Promise<SohlItem[] | undefined | boolean> {
        void event;
        if (!this.actor || !this.item.isOwner) return false;
        const itemList = data instanceof Array ? data : [data];
        const toCreate = [];
        for (let itemData of itemList) {
            // Determine if a similar item exists
            const similarItem = findSimilarItem(
                itemData as ItemMatchKey,
                this.actor.items as any,
            ) as SohlItem | undefined;

            if (similarItem) {
                const confirm = await Dialog.confirm({
                    title: `Confirm Overwrite: ${(similarItem.system as any).label}`,
                    content: `<p>Are You Sure?</p><p>This item will be overwritten and cannot be recovered.</p>`,
                    options: { jQuery: false },
                });
                if (confirm) {
                    delete itemData._id;
                    delete itemData.pack;
                    let result: SohlItem | undefined =
                        await similarItem.delete();
                    if (result) {
                        [result] = (await this.actor.createEmbeddedDocuments(
                            "Item",
                            [itemData],
                        )) as SohlItem[];
                    } else {
                        sohl.log.uiWarn("Overwrite failed");
                        continue;
                    }
                    toCreate.push(itemData);
                }
            } else {
                toCreate.push(itemData);
            }
        }

        const result = (await this.actor.createEmbeddedDocuments(
            "Item",
            toCreate,
        )) as SohlItem[] | undefined;
        return result || false;
    }

    /**
     * Prompt the user for how many units of a stacked item to move into a
     * destination container.
     * @param item - The stacked item being moved.
     * @param destContainer - The container the item is being moved into.
     * @returns The quantity the user chose to move (0 if cancelled or invalid).
     */
    protected async _moveQtyDialog(
        item: SohlItem,
        destContainer: SohlItem,
    ): Promise<number> {
        if (!item?.actor || !destContainer) {
            sohl.log.uiError("Invalid item or destination container");
            return 0;
        }
        // Render modal dialog
        let dlgData = {
            itemName: item.name,
            targetName: destContainer.name || item.actor.name,
            maxItems: (item.system as any).quantity,
            sourceName: "",
        };

        const compiled = Handlebars.compile(`<form id="items-to-move">
            <p>Moving ${dlgData.itemName} from ${dlgData.sourceName} to ${dlgData.targetName}</p>
            <div class="form-group">
                <label>How many (0-${dlgData.maxItems})?</label>
                {{numberInput ${dlgData.maxItems} name="itemstomove" step=1 min=0 max=${dlgData.maxItems}}}
            </div>
            </form>`);
        const dlgHtml = compiled(dlgData, {
            allowProtoMethodsByDefault: true,
            allowProtoPropertiesByDefault: true,
        });

        // Create the dialog window
        const result = await Dialog.prompt({
            title: "Move Items",
            content: dlgHtml,
            label: "OK",
            callback: async (element) => {
                const form = element.querySelector("form");
                if (!form) {
                    sohl.log.uiError("Form not found in dialog");
                    return 0;
                }
                const fd: FormDataExtended = new FormDataExtended(form);
                const formdata: PlainObject = foundry.utils.expandObject(
                    fd.object,
                );
                let formQtyToMove = Number.parseInt(formdata.itemstomove) || 0;

                return formQtyToMove;
            },
            options: { jQuery: false },
            rejectClose: false,
        });

        return result || 0;
    }

    /**
     * Handle dropping a gear item, either sorting it within its current
     * container or moving (and optionally splitting the stack) into a new one.
     * @param event - The originating drop event.
     * @param droppedItem - The gear item that was dropped.
     * @returns The created/moved item, `true` if merely re-sorted, or `false` on a rejected move.
     */
    protected async _onDropGear(
        event: DragEvent,
        droppedItem: SohlItem,
    ): Promise<SohlItem | boolean> {
        const target: HTMLElement | null = (
            event.target as HTMLElement
        )?.closest("[data-container-id]");
        const destContainerId = target?.dataset.containerId;

        // If no other container is specified, use this item
        let destContainer: SohlItem | null = null;
        if (destContainerId) {
            destContainer = (this.document.actor as any)?.allItems.get(
                destContainerId,
            );
        }

        if (droppedItem.id === destContainer?.id) {
            // Prohibit moving a container into itself
            sohl.log.uiWarn("Can't move a container into itself");
            return false;
        }

        if (
            !destContainer ||
            destContainer.id ===
                (droppedItem.logic as GearLogic).containedIn?.id
        ) {
            // If dropped item source and dest containers are the same,
            // then we are simply rearranging
            await this._onSortItem(event, droppedItem);
            return true;
        }

        const similarItem: SohlItem | undefined = (destContainer as any).find(
            (it: SohlItem) =>
                droppedItem.id === it.id ||
                (droppedItem.name === it.name && droppedItem.type === it.type),
        );

        if (similarItem) {
            sohl.log.uiError(`Similar item exists in ${destContainer.name}`);
            return false;
        }

        let quantity = (droppedItem.system as any).quantity;
        if (quantity > 1 && !droppedItem.parent) {
            // Ask how many to move
            quantity = await this._moveQtyDialog(droppedItem, destContainer);
        }

        const itemData = droppedItem.toObject() as any;
        delete itemData._id; // Remove ID to create a new item
        itemData.system.quantity = quantity;
        return (
            ((await SohlItem.create(itemData, {
                parent: destContainer,
            } as any)) as SohlItem) || false
        );
    }

    /**
     * Handle dropping a non-gear item, sorting it among siblings if it already
     * belongs to this document or creating it on the actor otherwise.
     * @param event - The originating drop event.
     * @param droppedItem - The non-gear item that was dropped.
     * @returns `true` if the item was sorted or created, `false` otherwise.
     */
    protected async _onDropNonGear(
        event: DragEvent,
        droppedItem: SohlItem,
    ): Promise<boolean> {
        if (droppedItem.parent?.id === this.document.id) {
            // Sort items
            const result = await this._onSortItem(event, droppedItem);
            return !!result?.length;
        } else {
            const result = await this._onDropItemCreate(droppedItem, event);
            return !!result;
        }
    }

    /**
     * Handle a drop event for an existing embedded Item to sort that Item relative to its siblings.
     * @param event - The initiating drop event
     * @param item - The dropped Item document
     * @returns A Promise which resolves to the sorted list of sibling items, or undefined if sorting was not possible.
     */
    protected _onSortItem(
        event: DragEvent,
        item: SohlItem,
    ): Promise<SohlItem[] | undefined> {
        if (!this.actor || !this.actor.isOwner)
            return Promise.resolve(undefined);
        const items = this.actor.items;
        const sourceId = item.id;
        if (!sourceId) return Promise.resolve(undefined);
        const source = items.get(sourceId);
        if (!source) return Promise.resolve(undefined);

        // Find drop target item
        const targetElement = (event.target as HTMLElement)?.closest(
            "[data-item-id]",
        ) as HTMLElement | null;
        if (!targetElement) return Promise.resolve(undefined);

        const targetId = targetElement.dataset.itemId;
        if (!targetId || targetId === sourceId)
            return Promise.resolve(undefined);

        const target: SohlItem | undefined = items.get(targetId);
        if (!target) return Promise.resolve(undefined);

        // Build ordered list of sibling items excluding the source item
        const children: Element[] = Array.from(
            targetElement.parentElement?.children || [],
        );
        const siblings: SohlItem[] = children.reduce((acc: SohlItem[], el) => {
            const ele = el as HTMLElement;
            const itemId = ele.dataset.itemId || "";
            const item = items.get(itemId);
            if (item && item.id !== sourceId) {
                acc.push(item);
            }
            return acc;
        }, []);

        // Sort the item using Foundry's utility
        const sorted: { target: SohlItem; update: PlainObject }[] =
            foundry.utils.performIntegerSort(source, {
                target,
                siblings,
            });

        // Prepare update data
        const updateData = sorted.map(({ target, update }) => {
            return {
                _id: target.id,
                ...update,
            };
        });

        // Apply the sort updates
        return this.actor.updateEmbeddedDocuments(
            "Item",
            updateData as any,
        ) as Promise<SohlItem[] | undefined>;
    }
}
