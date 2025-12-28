/*
 * This file is part of the Song of Heroic Lands (SoHL) system for Foundry VTT.
 * Copyright (c) 2024-2025 Tom Rodriguez ("Toasty") — <toasty@heroiclands.com>
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
    DialogButtonCallback,
    inputDialog,
    okDialog,
} from "@common/FoundryProxy";
import type { SohlActor } from "@common/actor/SohlActor";
import type { SohlItem } from "@common/item/SohlItem";
import {
    ActorKinds,
    EFFECT_KIND,
    EFFECT_METADATA,
    KIND_KEY,
    SOHL_CONTEXT_MENU_SORT_GROUP,
} from "@utils/constants";
import {
    defaultFromJSON,
    FilePath,
    HTMLString,
    toFilePath,
    toHTMLString,
} from "@utils/helpers";
import { SohlContextMenu } from "@utils/SohlContextMenu";
import type { SohlActiveEffect } from "@common/effect/SohlActiveEffect";
import { SohlMap } from "@utils/collection/SohlMap";
import type { SohlLogic } from "@common/SohlLogic";
import {
    COMBATANT_LOGIC,
    COMMON_ACTOR_LOGIC,
    COMMON_ITEM_LOGIC,
    EFFECT_LOGIC,
} from "@common/SohlSystem";
const { HandlebarsApplicationMixin } = foundry.applications.api;

export abstract class SohlDataModel<
        TSchema extends foundry.data.fields.DataSchema,
        TDocument extends SohlDocument,
        TLogic extends SohlLogic<any> = SohlLogic<any>,
    >
    extends foundry.abstract.TypeDataModel<TSchema, TDocument>
    implements SohlDataModel.Data<TDocument>
{
    declare parent: TDocument;

    /**
     * The localization prefixes used to look up the translation keys for this
     * data model. This is used to localize the data model's fields and
     * properties.
     *
     * This is actually defined in the superclass (TypeDataModel), but TypeScript
     * doesn't recognize that, so we have to define it here as well.
     * @see {@link foundry.abstract.TypeDataModel.LOCALIZATION_PREFIXES}
     */
    static override readonly LOCALIZATION_PREFIXES: string[];
    static readonly kind: string = "" as const;

    _logic!: TLogic;

    constructor(data: PlainObject = {}, options: PlainObject = {}) {
        super(data as any, options as any);
    }

    static create<L extends SohlLogic<any>>(
        data: PlainObject,
        options: PlainObject,
    ): L {
        const kind: string = this.kind;
        let logicCtor: Constructor<SohlLogic<any>> | undefined =
            COMMON_ACTOR_LOGIC[kind];
        logicCtor ??= COMMON_ITEM_LOGIC[kind];
        //logicCtor ??= EFFECT_LOGIC[kind];
        //logicCtor ??= COMBATANT_LOGIC[kind];
        if (!logicCtor) {
            throw new Error(`No logic constructor found for kind "${kind}"`);
        }
        return new logicCtor(data, options) as L;
    }

    get logic(): TLogic {
        if (!this._logic) {
            this._logic = (this.constructor as any).create(
                {},
                { parent: this },
            );
        }
        return this._logic;
    }

    get kind(): string {
        const kind: string = (this.constructor as any).kind;
        if (!kind) {
            throw new Error("kind must be defined");
        }
        return kind;
    }

    static fromData<TDataModel extends Constructor<SohlDataModel<any, any>>>(
        data: any,
        options: PlainObject = {},
    ): InstanceType<TDataModel> {
        const kind = data[KIND_KEY];

        if (!kind) {
            throw new Error(
                `Data does not contain a "${KIND_KEY}" key: ${JSON.stringify(
                    data,
                )}`,
            );
        }
        let dataModel: Constructor<SohlDataModel<any, any>> | undefined;
        for (const docType of ["Item", "Actor", "ActiveEffect"]) {
            dataModel = sohl.CONFIG[docType].dataModels[kind];
            if (dataModel) break;
        }
        if (!dataModel) {
            throw new Error(
                `No data model found for kind "${kind}" in sohl.CONFIG`,
            );
        }

        if (typeof data === "string") {
            data = JSON.parse(data);
        }

        // Convert the data (which may be in JSON normalized form)
        // back to the original form, dropping the kind key.
        const newData: PlainObject = {};
        for (const [key, value] of Object.entries(data)) {
            if (key === KIND_KEY) continue;
            newData[key] = defaultFromJSON(value);
        }

        return new dataModel(newData, options) as InstanceType<TDataModel>;
    }
}

export namespace SohlDataModel {
    export type Any = SohlDataModel<SohlDocument, any>;

    export interface Data<
        TParent extends SohlDocument,
        TLogic extends SohlLogic<any> = SohlLogic<any>,
    > {
        readonly parent: TParent | null;
        readonly logic: TLogic;
        readonly kind: string;
    }

    export namespace DataModel {
        export interface Statics {
            readonly LOCALIZATION_PREFIXES: string[];
            readonly kind: string;
            create<L extends SohlLogic<any>>(
                data: PlainObject,
                options: PlainObject,
            ): L;
        }

        export const Shape: WithStatics<
            AnyConstructor<SohlDataModel<any, any>>,
            Statics
        > = SohlDataModel;
    }

    export function SheetMixin<
        TDocument extends SohlDocument,
        TBase extends foundry.applications.api.DocumentSheetV2.AnyConstructor,
    >(Base: TBase): TBase {
        return class SMix extends HandlebarsApplicationMixin(Base) {
            _dragDrop: DragDrop[];

            constructor(document: TDocument, options: PlainObject = {}) {
                // The HandlebarsApplicationMixin constructor typing is incompatible with
                // our generic signature; suppress the type-check here and forward args.
                // @ts-ignore
                super(document, options);
                this._dragDrop = this._createDragDropHandlers();
            }

            override get document(): TDocument {
                return super.document as TDocument;
            }

            _configureRenderOptions(
                options: Partial<foundry.applications.api.HandlebarsApplicationMixin.RenderOptions>,
            ): void {
                super._configureRenderOptions(options);
            }

            _createDragDropHandlers(): DragDrop[] {
                return (
                    (this.options as any).dragDrop?.map((d: PlainObject) => {
                        d.permissions = {
                            dragStart: this._canDragStart.bind(this),
                            drop: this._canDragDrop.bind(this),
                        };
                        d.callbacks = {
                            dragstart: this._onDragStart.bind(this),
                            dragover: this._onDragOver.bind(this),
                            drop: this._onDrop.bind(this),
                        };
                        return new foundry.applications.ux.DragDrop(
                            d,
                        ) as DragDrop;
                    }) ?? []
                );
            }

            /**
             * Define whether a user is able to begin a dragstart workflow for a given drag selector
             * @param selector       The candidate HTML selector for dragging
             * @returns Can the current user drag this selector?
             */
            _canDragStart(selector: string): boolean {
                return this.isEditable;
            }

            /**
             * Define whether a user is able to conclude a drag-and-drop workflow for a given drop selector
             * @param selector       The candidate HTML selector for the drop target
             * @returns  Can the current user drop on this selector?
             */
            _canDragDrop(selector: string): boolean {
                return this.isEditable;
            }

            get actor(): SohlActor | null {
                return ActorKinds.includes(this.document.type) ?
                        (this.document as SohlActor)
                    :   this.document.actor || null;
            }

            override async _prepareContext(options: any): Promise<PlainObject> {
                const data: PlainObject = await super._prepareContext(options);
                data.variant = sohl.id as string;
                data.const = sohl.CONST;
                data.config = sohl.CONFIG;
                data.owner = !!this.document.isOwner;
                data.limited = !!this.document.limited;
                data.options = this.document.options;
                data.editable = !!this.document.editable;
                data.cssClass = data.owner ? "editable" : "locked";
                data.isBeing = this.document.type === "being";
                data.isAssembly = this.document.type === "assembly";
                data.actor =
                    ActorKinds.includes(this.document.type) ?
                        (this.document as SohlActor)
                    :   this.document.actor || null;
                data.flags = this.document.flags;
                data.system = this.document.system;
                data.isGM = game.user.isGM;
                data.fields = this.document.system.schema.fields;
                data.effects = this.document.effects;

                // Collect all effects from other Items/Actors that are affecting this item
                data.trxEffects = {};
                this.document.transferredEffects?.forEach(
                    (effect: SohlActiveEffect) => {
                        if (effect.id && !effect.disabled) {
                            data.trxEffects[effect.id] = effect;
                        }
                    },
                );

                return data;
            }

            /**
             * Actions performed after any render of the Application.
             * Post-render steps are not awaited by the render process.
             * @param {ApplicationRenderContext} context      Prepared context data
             * @param {RenderOptions} options                 Provided render options
             */
            override async _onRender(
                context: PlainObject,
                options: PlainObject,
            ): Promise<void> {
                super._onRender(context, options);
                this._dragDrop.forEach((d: DragDrop) => d.bind(this.element));
            }

            _onSearchFilter(
                event: KeyboardEvent,
                query: string,
                rgx: RegExp,
                element: HTMLElement,
            ): void {
                if (!element) return;
                const visibleCategories = new Set<string>();

                for (const entry of Array.from(
                    element.querySelectorAll<HTMLElement>(".item"),
                )) {
                    if (!query) {
                        entry.classList.remove("hidden");
                        continue;
                    }

                    const name = entry.dataset.itemName;
                    const match = name && rgx.test(name.trim());
                    entry.classList.toggle("hidden", !match);
                    if (match) {
                        const cat = entry.closest<HTMLElement>(".category");
                        if (cat?.dataset.category)
                            visibleCategories.add(cat.dataset.category);
                    }
                }

                for (const category of Array.from(
                    element.querySelectorAll<HTMLElement>(".category"),
                )) {
                    const catName = category.dataset.category;
                    if (!catName) continue;
                    const visible = query && visibleCategories.has(catName);
                    category.classList.toggle("hidden", !!query && !visible);
                }
            }

            _contextMenu(element: HTMLElement): void {
                new SohlContextMenu(element, ".item", [], {
                    onOpen: this._onItemContextMenuOpen.bind(this),
                });
                new SohlContextMenu(element, ".item-contextmenu", [], {
                    eventName: "click",
                    onOpen: this._onItemContextMenuOpen.bind(this),
                });
                new SohlContextMenu(element, ".effect", [], {
                    onOpen: this._onEffectContextMenuOpen.bind(this),
                });
                new SohlContextMenu(element, ".effect-contextmenu", [], {
                    eventName: "click",
                    onOpen: this._onEffectContextMenuOpen.bind(this),
                });
            }

            _onItemContextMenuOpen(
                element: HTMLElement,
            ): SohlContextMenu.Entry[] {
                const anyDoc = this.document as any;
                let ele = element.closest("[data-item-id]") as HTMLElement;
                if (!ele) return [];
                const actionName = ele?.dataset.actionName;
                const docId = ele?.dataset.itemId;
                if (!docId) return [];
                let doc;
                if (actionName) {
                    doc = anyDoc.system.actions.get(docId);
                } else {
                    let actor: SohlActor | null =
                        ActorKinds.includes(anyDoc.type) ?
                            (anyDoc as SohlActor)
                        :   anyDoc.actor;
                    if (!actor) return [];
                    doc = actor.allItems.get(docId);
                }
                if (doc) {
                    const uiContext = (foundry as any).ui.context;
                    if (uiContext) {
                        uiContext.menuItems = doc._getContextOptions();
                    }
                }
                return [];
            }

            _onEffectContextMenuOpen(element: HTMLElement): void {
                let ele = element.closest("[data-effect-id]") as HTMLElement;
                if (!ele) return;
                const effectId = ele.dataset.effectId;
                const effect = (this.document as any).effects.get(effectId);
                const uiContext = (foundry as any).ui.context;
                if (uiContext) {
                    uiContext.menuItems =
                        effect ? effect._getContextOptions(effect) : [];
                }
            }

            /**
             * Retrieve the context options for the given item. Sort the menu items based on groups, with items having no group at the top, items in the 'primary' group in the middle, and items in the 'secondary' group at the bottom.
             *
             * @static
             * @param {*} doc
             * @returns {*}
             */
            static _getContextOptions(
                doc: SohlDocument,
            ): SohlContextMenu.Entry[] {
                let result =
                    doc._getContextOptions() as SohlContextMenu.Entry[];
                if (!result || !result.length) return [];

                result = result.filter(
                    (co) => co.group !== SOHL_CONTEXT_MENU_SORT_GROUP.HIDDEN,
                );

                // Sort the menu items according to group.  Expect items with no group
                // at the top, items in the "primary" group next, and items in the
                // "secondary" group last.
                const collator = new Intl.Collator(sohl.i18n.lang);
                result.sort(
                    (a: SohlContextMenu.Entry, b: SohlContextMenu.Entry) =>
                        collator.compare(a.group || "", b.group || ""),
                );
                return result;
            }

            static _onEffectToggle(
                event: PointerEvent,
                target: HTMLElement,
            ): void {
                const li = target.closest(".effect") as HTMLElement;
                if (!li?.dataset.effectId) return;
                const effect = (this as any).document.effects.get(
                    li.dataset.effectId,
                );
                effect?.toggleEnabledState();
            }

            async _onEffectCreate(): Promise<void> {
                const createEffect = (this.document as any)
                    .createEffect as Function;
                if (!createEffect) {
                    throw new Error(
                        "SohlDataModel.Sheet._onEffectCreate: createEffect not found",
                    );
                }
                let name = "New Effect";
                let i = 0;
                while (
                    (this.document as any).effects.some(
                        (e: SohlActiveEffect) => e.name === name,
                    )
                ) {
                    name = `New Effect ${++i}`;
                }
                const aeData = {
                    name,
                    type: EFFECT_KIND.EFFECTDATA,
                    icon: EFFECT_METADATA[EFFECT_KIND.EFFECTDATA].Image,
                    origin: this.document.uuid,
                };

                createEffect(aeData, {
                    parent: this.document,
                });
            }

            /**
             * Callback actions which occur at the beginning of a drag start workflow.
             * @param event       The originating DragEvent
             */
            _onDragStart(event: DragEvent): void {
                const li = event.currentTarget as HTMLElement;
                if ("link" in li?.dataset) return;

                // Create drag data
                let dragData: PlainObject | null = null;

                // Owned Items
                if (li.dataset.uuid) {
                    const item = fromUuidSync(li.dataset.uuid) as any;
                    dragData = item?.toDragData() || null;
                }

                // Active Effect
                else if (li.dataset.effectId && this.actor) {
                    const effect = (this.actor as any).effects.get(
                        li.dataset.effectId,
                    );
                    dragData = effect?.toDragData() || null;
                }

                if (!dragData) return;

                // Set data transfer
                event.dataTransfer?.setData(
                    "text/plain",
                    JSON.stringify(dragData),
                );
            }

            /**
             * Callback actions which occur when a dragged element is over a drop target.
             * @param event       The originating DragEvent
             */
            _onDragOver(event: DragEvent): void {}

            /**
             * Callback actions which occur when a dragged element is dropped on a target.
             * @param event       The originating DragEvent
             */
            async _onDrop(event: DragEvent): Promise<void> {
                const data = JSON.parse(
                    event.dataTransfer?.getData("text/plain") || "{}",
                );
                const documentClass = foundry.utils.getDocumentClass(data.type);
                if (documentClass) {
                    const document = await documentClass.fromDropData(data);
                    switch (document.documentName) {
                        case "ActiveEffect":
                            this._onDropActiveEffect(event, document);
                            break;

                        case "Actor":
                            this._onDropActor(event, document);
                            break;

                        case "Item":
                            this._onDropItem(event, document);
                            break;
                        case "Folder":
                            this._onDropFolder(event, document);
                            break;
                    }
                }
            }

            async _onDropActiveEffect(
                event: DragEvent,
                droppedEffect: SohlActiveEffect,
            ): Promise<void> {}

            async _onDropActor(
                event: DragEvent,
                droppedActor: SohlActor,
            ): Promise<void> {}

            async _onDropFolder(
                event: DragEvent,
                droppedFolder: Folder,
            ): Promise<void> {}

            async _onDropItem(
                event: DragEvent,
                droppedItem: SohlItem,
            ): Promise<void> {}

            async _addPrimitiveArrayItem(
                event: PointerEvent,
                { allowDuplicates = false } = {},
            ): Promise<void> {
                const dataset = (event.currentTarget as HTMLElement)?.dataset;
                if (!dataset?.array) return;
                let oldArray: any[] = foundry.utils.getProperty(
                    this.document,
                    dataset.array,
                ) as any[];
                let newArray: any[] = foundry.utils.deepClone(oldArray);
                const datatype = dataset.dtype;
                const choices = dataset.choices;
                const defaultValue =
                    dataset.dtype === "Number" ?
                        String(
                            Number.parseFloat(dataset.defaultValue || "0") || 0,
                        )
                    :   String(dataset.defaultValue);

                const dialogData = {
                    valueName: dataset.title,
                    newValue: defaultValue,
                    choices,
                };

                const dlgHtml: HTMLString = toHTMLString(`<form id="value">
                <div class="form-group">
                    <label>{{valueName}}</label>
                    {{#if choices}}
                    <select name="newValue">
                        {{selectOptions choices selected=newValue}}
                    </select>
                    {{else}}
                    <input
                        type="{{#if (eq type 'Number')}}number{{else}}text{{/if}}"
                        name="newValue"
                        value="{{newValue}}" />
                    {{/if}}
                </div>
                </form>`);

                const dlgResult = await okDialog({
                    title: dataset.title,
                    content: dlgHtml,
                    data: dialogData,
                    ok: {
                        label: `Add ${dataset.title}`,
                        callback: (_event: any, button: HTMLButtonElement) => {
                            const form = button.querySelector("form");
                            const fd = new (
                                foundry.applications as any
                            ).ux.FormDataExtended(form);
                            const formData = foundry.utils.expandObject(
                                fd.object,
                            ) as PlainObject;
                            let formValue = formData.newValue;
                            if (datatype === "Number") {
                                formValue = Number.parseFloat(formValue);
                                if (Number.isNaN(formValue))
                                    formValue = dataset.defaultValue;
                            }
                            return formValue;
                        },
                    },
                    rejectClose: false,
                });

                // if dialog was closed, do nothing
                if (!dlgResult) return;

                if (!allowDuplicates && newArray.includes(dlgResult)) return;

                newArray.push(dlgResult);
                const updateData = { [dataset.array]: newArray };
                const result = await (this.document as SohlDocument).update(
                    updateData,
                );
                if (result) this.render();
            }

            async _addChoiceArrayItem(event: PointerEvent): Promise<void> {
                const dataset = (event.currentTarget as HTMLElement).dataset;
                if (!dataset.choices || !dataset.array) return;
                let array: string[] = (
                    (foundry.utils.getProperty(this.document, dataset.array) ||
                        []) as any[]
                ).concat();
                const choices: string[] = dataset.choices.split(";");
                let formTemplate =
                    '<form id="get-choice"><div class="form-group"><select name="choice">';
                choices.forEach((c) => {
                    let [label, val] = c.split(":").map((v) => v.trim());
                    formTemplate += `<option name="${val}">${label}</option>`;
                });
                formTemplate += `</select></div></form>`;
                const compiled = Handlebars.compile(formTemplate);
                const dlgHtml = compiled(
                    {},
                    {
                        allowProtoMethodsByDefault: true,
                        allowProtoPropertiesByDefault: true,
                    },
                );

                const dlgResult = await Dialog.prompt({
                    title: dataset.title,
                    content: dlgHtml.trim(),
                    label: `Add ${dataset.title}`,
                    callback: (element) => {
                        const form = element.querySelector("form");
                        const fd = new (
                            foundry.applications as any
                        ).ux.FormDataExtended(form);
                        const formData = foundry.utils.expandObject(
                            fd.object,
                        ) as PlainObject;
                        return formData.choice;
                    },
                    rejectClose: false,
                    options: { jQuery: false },
                });

                // if dialog was closed, do nothing
                if (!dlgResult) return;

                if (array.some((a: string) => a === dlgResult)) {
                    ui.notifications.warn(
                        `Choice with value "${dlgResult} already exists, ignoring`,
                    );
                    return;
                }

                array.push(dlgResult);
                const updateData = { [dataset.array]: array };
                await (this.document as SohlDocument).update(updateData);
            }

            async _addAimArrayItem(event: PointerEvent): Promise<void> {
                const dataset = (event.currentTarget as HTMLElement).dataset;
                if (!dataset.aim || !dataset.array) return;
                let array: { name: string; probWeightBase: number }[] = (
                    (foundry.utils.getProperty(this.document, dataset.array) ||
                        []) as Array<{ name: string; probWeightBase: number }>
                ).concat();
                const compiled = Handlebars.compile(`<form id="aim">
        <div class="form-group flexrow">
            <div class="flexcol">
                <label>Name</label>
                <input type="text" name="name" />
            </div><div class="flexcol">
                <label>Prob Weight Base</label>
                {{numberInput 0 name="probWeightBase" min=0 step=1}}
            </div></div></form>`);
                const dlgHtml = compiled(
                    {},
                    {
                        allowProtoMethodsByDefault: true,
                        allowProtoPropertiesByDefault: true,
                    },
                );

                const dlgResult = await Dialog.prompt({
                    title: dataset.title,
                    content: dlgHtml.trim(),
                    label: `Add ${dataset.title}`,
                    callback: (element) => {
                        const form = element.querySelector("form");
                        const fd = new (
                            foundry.applications as any
                        ).ux.FormDataExtended(form);
                        const formData = foundry.utils.expandObject(
                            fd.object,
                        ) as PlainObject;
                        const result = {
                            name: formData.name,
                            probWeightBase:
                                Number.parseInt(formData.probWeightBase, 10) ||
                                0,
                        };
                        return result;
                    },
                    rejectClose: false,
                    options: { jQuery: false },
                });

                // if dialog was closed, do nothing
                if (!dlgResult) return;

                if (
                    array.some(
                        (a: { name: string; probWeightBase: number }) =>
                            a.name === dlgResult.name,
                    )
                ) {
                    ui.notifications.warn(
                        `Aim with name "${dlgResult.name} already exists, ignoring`,
                    );
                    return;
                }

                array.push(dlgResult);
                const updateData = { [dataset.array]: array };
                await (this.document as SohlDocument).update(updateData);
            }

            async _addValueDescArrayItem(event: PointerEvent): Promise<void> {
                const dataset = (event.currentTarget as HTMLElement).dataset;
                if (!dataset.valueDesc || !dataset.array) return;
                let array: { label: string; maxValue: number }[] = (
                    (foundry.utils.getProperty(this.document, dataset.array) ||
                        []) as Array<{ label: string; maxValue: number }>
                ).concat();
                const compiled = Handlebars.compile(`<form id="aim">
                <div class="form-group flexrow">
                    <div class="flexcol">
                        <label>Label</label>
                        <input type="text" name="label" />
                    </div><div class="flexcol">
                        <label>Max Value</label>
                        {{numberInput 0 name="maxValue" min=0 step=1}}
                    </div></div></form>`);
                const dlgHtml = compiled(
                    {},
                    {
                        allowProtoMethodsByDefault: true,
                        allowProtoPropertiesByDefault: true,
                    },
                );

                const dlgResult = await Dialog.prompt({
                    title: dataset.title,
                    content: dlgHtml.trim(),
                    label: `Add ${dataset.title}`,
                    callback: (element) => {
                        const form = element.querySelector("form");
                        const fd = new (
                            foundry.applications as any
                        ).ux.FormDataExtended(form);
                        const formData = foundry.utils.expandObject(
                            fd.object,
                        ) as PlainObject;
                        const result = {
                            label: formData.label,
                            maxValue:
                                Number.parseInt(formData.maxValue, 10) || 0,
                        };
                        return result;
                    },
                    rejectClose: false,
                    options: { jQuery: false },
                });

                // if dialog was closed, do nothing
                if (!dlgResult) return;

                if (
                    array.some(
                        (a: { label: string; maxValue: number }) =>
                            a.label === dlgResult.label,
                    )
                ) {
                    ui.notifications.warn(
                        `Aim with name "${dlgResult.label} already exists, ignoring`,
                    );
                    return;
                }

                array.push(dlgResult);
                array.sort(
                    (
                        a: { label: string; maxValue: number },
                        b: { label: string; maxValue: number },
                    ) => a.maxValue - b.maxValue,
                );
                const updateData = { [dataset.array]: array };
                await (this.document as SohlDocument).update(updateData);
                this.render();
            }

            async _addArrayItem(event: PointerEvent): Promise<void> {
                const dataset = (event.currentTarget as HTMLElement).dataset;
                await (this as any)._onSubmit(event); // Submit any unsaved changes

                if (dataset.objectType === "Aim") {
                    await this._addAimArrayItem(event);
                } else if (dataset.objectType === "ValueDesc") {
                    await this._addValueDescArrayItem(event);
                } else if (dataset.choices) {
                    await this._addChoiceArrayItem(event);
                } else if (
                    ["Number", "String"].includes(dataset.dtype || "String")
                ) {
                    await this._addPrimitiveArrayItem(event, {
                        allowDuplicates: dataset.allowDuplicates === "true",
                    });
                }
                this.render();
            }

            async _deleteArrayItem(event: PointerEvent): Promise<void> {
                const dataset = (event.currentTarget as HTMLElement).dataset;
                if (!dataset.array) return;
                await (this as any)._onSubmit(event); // Submit any unsaved changes
                let array: any[] = foundry.utils.getProperty(
                    this.document,
                    dataset.array,
                ) as any[];
                array = array.filter((a: any) => a !== dataset.value);
                const result = await (this.document as SohlDocument).update({
                    [dataset.array]: array,
                });
                if (result) this.render();
            }

            async _addObjectKey(event: PointerEvent): Promise<void> {
                const dataset = (event.currentTarget as HTMLElement).dataset;
                if (!dataset.object) return;
                if (!dataset.title) dataset.title = "Add Key";

                await (this as any)._onSubmit(event); // Submit any unsaved changes

                let object = foundry.utils.getProperty(
                    this.document,
                    dataset.object,
                ) as any;

                const dialogData = {
                    variant: sohl.id,
                    newKey: "",
                    newValue: "",
                };

                let dlgTemplate: FilePath = toFilePath(
                    "systems/sohl/templates/dialog/keyvalue-dialog.html",
                );

                const dlgResult = await inputDialog({
                    title: dataset.title,
                    template: dlgTemplate,
                    data: dialogData,
                    callback: ((
                        _event: PointerEvent | SubmitEvent,
                        _button: HTMLButtonElement,
                        dialog: HTMLDialogElement,
                    ): Promise<any> => {
                        const form = dialog.querySelector(
                            "form",
                        ) as HTMLFormElement;
                        const fd = new (
                            foundry.applications as any
                        ).ux.FormDataExtended(form);
                        const formData = foundry.utils.expandObject(
                            fd.object,
                        ) as PlainObject;
                        let formKey = formData.newKey;
                        let formValue = formData.newValue;
                        let value: number = Number.parseFloat(formValue);
                        if (Number.isNaN(value)) {
                            if (formValue === "true") value = 1;
                            else if (formValue === "false") value = 0;
                            else if (formValue === "null") value = 0;
                            else value = formValue;
                        }
                        return Promise.resolve({ key: formKey, value: value });
                    }) as DialogButtonCallback,
                    rejectClose: false,
                });

                // if dialog was closed, or key is empty, do nothing
                if (!dlgResult || !dlgResult.key) return;

                object[dlgResult.key] = dlgResult.value;
                const updateData = { [dataset.object]: object };
                const result = await (this.document as SohlDocument).update(
                    updateData,
                );
                if (result) this.render();
            }

            //     activateListeners(element: HTMLElement): void {
            //         super.activateListeners(element);

            //         // Everything below here is only needed if the sheet is editable
            //         if (!this.options.editable) return;

            //         // Ensure all text is selected when entering text input field
            //         this.form
            //             .querySelector("input[type='text']")
            //             ?.addEventListener("click", (ev) => {
            //                 const target = ev.target;
            //                 if (!target.dataset?.type) {
            //                     target.select();
            //                 }
            //             });

            //         this.form
            //             .querySelector(".effect-create")
            //             ?.addEventListener("click", this._onEffectCreate.bind(this));

            //         this.form
            //             .querySelector(".effect-toggle")
            //             ?.addEventListener("click", this._onEffectToggle.bind(this));

            //         this.form
            //             .querySelector(".alter-time")
            //             ?.addEventListener("click", (ev) => {
            //                 const property = ev.currentTarget.dataset.property;
            //                 let time = Number.parseInt(
            //                     ev.currentTarget.dataset.time,
            //                     10,
            //                 );
            //                 if (Number.isNaN(time)) time = 0;
            //                 Utility.onAlterTime(time).then((result) => {
            //                     if (result !== null) {
            //                         const updateData = { [property]: result };
            //                         this.item.update(updateData);
            //                     }
            //                 });
            //             });

            //         // Add/delete Object Key
            //         this.form
            //             .querySelector(".add-array-item")
            //             ?.addEventListener("click", this._addArrayItem.bind(this));
            //         this.form
            //             .querySelector(".delete-array-item")
            //             ?.addEventListener("click", this._deleteArrayItem.bind(this));

            //         // Add/delete Object Key
            //         this.form
            //             .querySelector(".add-object-key")
            //             ?.addEventListener("click", this._addObjectKey.bind(this));
            //         this.form
            //             .querySelector(".delete-object-key")
            //             ?.addEventListener("click", this._deleteObjectKey.bind(this));

            //         this.form
            //             .querySelector(".action-create")
            //             ?.addEventListener("click", (ev) => {
            //                 return Utility.createAction(ev, this.document);
            //             });

            //         this.form
            //             .querySelector(".action-execute")
            //             ?.addEventListener("click", (ev) => {
            //                 const li = ev.currentTarget.closest(".action-item");
            //                 const itemId = li.dataset.itemId;
            //                 const action = this.document.system.actions.get(itemId);
            //                 action.execute({ event: ev, dataset: li.dataset });
            //             });

            //         this.form
            //             .querySelector(".action-edit")
            //             ?.addEventListener("click", (ev) => {
            //                 const li = ev.currentTarget.closest(".action-item");
            //                 const itemId = li.dataset.itemId;
            //                 const action = this.document.system.actions.get(itemId);
            //                 if (!action) {
            //                     throw new Error(
            //                         `Action ${itemId} not found on ${this.document.name}.`,
            //                     );
            //                 }
            //                 action.sheet.render(true);
            //             });

            //         this.form
            //             .querySelector(".action-delete")
            //             ?.addEventListener("click", (ev) => {
            //                 const li = ev.currentTarget.closest(".action-item");
            //                 const itemId = li.dataset.itemId;
            //                 const action = this.document.system.actions.get(itemId);
            //                 if (!action) {
            //                     throw new Error(
            //                         `Action ${itemId} not found on ${this.document.name}.`,
            //                     );
            //                 }
            //                 return Utility.deleteAction(ev, action);
            //             });

            //         this.form
            //             .querySelector(".default-action")
            //             ?.addEventListener("click", (ev) => {
            //                 const li = ev.currentTarget.closest(".item");
            //                 const itemId = li.dataset.itemId;
            //                 let item;
            //                 if (this.document instanceof SohlActor) {
            //                     item = this.actor.getItem(itemId);
            //                 } else {
            //                     item = this.item.system.allItems.get(itemId);
            //                 }
            //                 if (item) {
            //                     const defaultAction = item.system.getDefaultAction(li);
            //                     if (defaultAction?.callback instanceof Function) {
            //                         defaultAction.callback();
            //                     } else {
            //                         ui.notifications.warn(
            //                             `${item.label} has no available default action`,
            //                         );
            //                     }
            //                 }
            //             });

            //         // Activate context menu
            //         this._contextMenu(element);
            //     }
        } as unknown as TBase;
    }
}
