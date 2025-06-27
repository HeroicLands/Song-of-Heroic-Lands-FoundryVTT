import {
    DialogButtonCallback,
    inputDialog,
    InternalClientDocument,
    okDialog,
    SohlLogic,
} from "@common";
import { Entity, Assembly, SohlActor } from "@common/actor";
import { SohlItem } from "@common/item";
import {
    FilePath,
    HTMLString,
    SohlClassRegistry,
    SohlContextMenu,
    toFilePath,
    toHTMLString,
} from "@utils";
import { SohlActiveEffect } from "./effect";
const { ArrayField, ObjectField } = fvtt.data.fields;
type HandlebarsTemplatePart =
    foundry.applications.api.HandlebarsApplicationMixin.HandlebarsTemplatePart;
const { DocumentSheetV2, HandlebarsApplicationMixin } =
    foundry.applications.api;

export abstract class SohlDataModel<TParent extends SohlActor | SohlItem>
    extends foundry.abstract.TypeDataModel<foundry.data.fields.DataSchema, any>
    implements SohlDataModel.Data<TParent>
{
    declare parent: TParent;

    protected _logic!: SohlLogic.Logic;

    /**
     * The localization prefixes used to look up the translation keys for this
     * data model. This is used to localize the data model's fields and
     * properties.
     *
     * This is actually defined in the superclass (TypeDataModel), but TypeScript
     * doesn't recognize that, so we have to define it here as well.
     * @override
     * @see {@link foundry.abstract.TypeDataModel.LOCALIZATION_PREFIXES}
     */
    static readonly LOCALIZATION_PREFIXES: string[];
    static readonly _metadata: SohlDataModel.Metadata;
    actionList!: PlainObject[];
    eventList!: PlainObject[];

    get logicClass(): SohlLogic.Constructor {
        return (this as any)._metadata.logicClass as SohlLogic.Constructor;
    }

    get label() {
        return sohl.i18n.format(
            `${(this.constructor as any).LOCALIZATION_PREFIXES}.label`,
            {
                name: this.parent.name,
            },
        );
    }

    static get kind(): string {
        return this._metadata.kind;
    }

    static get iconCssClass(): string {
        return this._metadata.iconCssClass;
    }

    static get img(): string {
        return this._metadata.img;
    }

    static get schemaVersion(): string {
        return this._metadata.schemaVersion;
    }

    static get sheet(): string {
        return this._metadata.sheetPath;
    }

    static defineSchema(): foundry.data.fields.DataSchema {
        return {
            actionList: new ArrayField(new ObjectField()),
            eventList: new ArrayField(new ObjectField()),
        };
    }

    get kind(): string {
        return (this.constructor as any).kind;
    }

    get logic(): SohlLogic.Logic {
        if (!this._logic) {
            this._logic = new this.logicClass(this);
        }
        return this._logic;
    }
}

export namespace SohlDataModel {
    export type Any = SohlDataModel<SohlActor | SohlItem>;

    export type Constructor<TParent extends SohlActor | SohlItem> =
        AnyConstructor<Data<TParent>> & TypeDataModelStatics;

    export interface TypeDataModelStatics {
        readonly LOCALIZATION_PREFIXES: string[];
        defineSchema(): foundry.data.fields.DataSchema;
    }

    export interface Data<TParent extends SohlActor | SohlItem> {
        readonly parent: TParent | null;
        actionList: PlainObject[];
        eventList: PlainObject[];
    }

    export interface Metadata extends SohlClassRegistry.Metadata {
        iconCssClass: string;
        img: string;
        sheet: string;
        schemaVersion: string;
        subTypes: string[];
        logicClass: AnyConstructor;
        sheetPath: string;
    }

    export class Element extends SohlClassRegistry.Element implements Metadata {
        iconCssClass: string;
        img: string;
        sheet: string;
        schemaVersion: string;
        subTypes: string[];
        logicClass: AnyConstructor;
        sheetPath: string;

        constructor(data: Partial<Metadata> = {}) {
            if (!data.kind) {
                throw new Error("SohlDataModel.Element must have a kind");
            }
            if (!data.logicClass) {
                throw new Error("SohlDataModel.Element must have a logicClass");
            }
            super(data.kind, data.ctor);
            this.iconCssClass = data.iconCssClass ?? "";
            this.img = data.img ?? "";
            this.sheet = data.sheet ?? "";
            this.schemaVersion = data.schemaVersion ?? "0.0.0";
            this.subTypes = data.subTypes ?? [];
            this.logicClass = data.logicClass;
            this.sheetPath = data.sheet ?? "";
        }
    }

    export abstract class Sheet<
        TParent extends SohlActor | SohlItem,
    > extends HandlebarsApplicationMixin(DocumentSheetV2) {
        declare document: TParent & InternalClientDocument;
        declare options: PlainObject;
        declare isEditable: boolean;
        declare element: HTMLElement;
        declare render: (force?: boolean, options?: any) => void;

        _dragDrop: DragDrop[];

        constructor(document: TParent, options: PlainObject = {}) {
            super(document, options);
            this._dragDrop = this._createDragDropHandlers();
        }

        _configureRenderOptions(
            options: Partial<foundry.applications.api.HandlebarsApplicationMixin.RenderOptions>,
        ): void {
            super._configureRenderOptions(options);
        }

        static DEFAULT_OPTIONS: PlainObject = {
            window: {
                tabs: [
                    {
                        navSelector: ".sheet-tabs",
                        contentSelector: ".sheet-body",
                        initial: "properties",
                    },
                ],
            },
            dragDrop: [
                {
                    dragSelector: ".item-list .item",
                    dropSelector: null,
                },
            ],
            actions: {
                effectToggle: Sheet._onEffectToggle,
            },
        };

        _createDragDropHandlers(): DragDrop[] {
            return this.options.dragDrop.map((d: PlainObject) => {
                d.permissions = {
                    dragStart: this._canDragStart.bind(this),
                    drop: this._canDragDrop.bind(this),
                };
                d.callbacks = {
                    dragstart: this._onDragStart.bind(this),
                    dragover: this._onDragOver.bind(this),
                    drop: this._onDrop.bind(this),
                };
                return new fvtt.applications.ux.DragDrop(d) as DragDrop;
            });
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
            return this.document instanceof SohlActor ?
                    this.document
                :   this.document.actor || null;
        }

        async _prepareContext(
            options: Partial<foundry.applications.api.ApplicationV2.RenderOptions>,
        ): Promise<PlainObject> {
            const data = await super._prepareContext(options);
            data.variant = sohl.game.id;
            data.const = sohl.CONST;
            data.config = sohl.CONFIG;
            data.owner = (this.document as InternalClientDocument).isOwner;
            data.limited = this.document.limited;
            data.options = this.options;
            data.editable = this.isEditable;
            data.cssClass = data.owner ? "editable" : "locked";
            data.isEntity = Entity.isA(this.document.system);
            data.isAssembly = Assembly.isA(this.document.system);
            data.actor =
                this.document instanceof SohlActor ?
                    this.document
                :   this.document.actor;
            data.flags = this.document.flags;
            data.system = this.document.system;
            data.isGM = (fvtt.game.user as any).isGM;
            data.fields = this.document.system.schema.fields;

            data.effects = (this.document as any).effects;

            // Collect all effects from other Items/Actors that are affecting this item
            data.trxEffects = {};
            (this.document as any).transferredEffects.forEach(
                (effect: SohlActiveEffect) => {
                    if (!(effect as any).disabled) {
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
        _onRender(context: PlainObject, options: PlainObject): void {
            super._onRender(context, options);
            this._dragDrop.forEach((d: DragDrop) => d.bind(this.element));
        }

        /** @override */
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

        _onItemContextMenuOpen(element: HTMLElement): SohlContextMenu.Entry[] {
            let ele = element.closest("[data-item-id]") as HTMLElement;
            if (!ele) return [];
            const actionName = ele?.dataset.actionName;
            const docId = ele?.dataset.itemId;
            if (!docId) return [];
            let doc;
            if (actionName) {
                doc = this.document.system.actions.get(docId);
            } else {
                let actor: SohlActor | null;
                if (this.document instanceof SohlActor) {
                    actor = this.document;
                } else {
                    actor = this.document.actor;
                }
                if (!actor) return [];
                doc = actor.items.get(docId);
            }
            if (doc) {
                const uiContext = (fvtt.ui as any).context;
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
            const uiContext = (fvtt.ui as any).context;
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
            doc: SohlActor | SohlItem | SohlActiveEffect,
        ): SohlContextMenu.Entry[] {
            let result = doc._getContextOptions();
            if (!result || !result.length) return [];

            result = result.filter(
                (co) => co.group !== SohlContextMenu.SORT_GROUP.HIDDEN,
            );

            // Sort the menu items according to group.  Expect items with no group
            // at the top, items in the "primary" group next, and items in the
            // "secondary" group last.
            const collator = new Intl.Collator(sohl.i18n.lang);
            result.sort((a: SohlContextMenu.Entry, b: SohlContextMenu.Entry) =>
                collator.compare(a.group || "", b.group || ""),
            );
            return result;
        }

        static _onEffectToggle(event: PointerEvent, target: HTMLElement): void {
            const li = target.closest(".effect") as HTMLElement;
            if (!li?.dataset.effectId) return;
            const effect = (this as any).document.effects.get(
                li.dataset.effectId,
            );
            effect?.toggleEnabledState();
        }

        async _onEffectCreate(): Promise<void> {
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
                type: SohlActiveEffect.Kind,
                icon: SohlActiveEffect.Image,
                origin: this.document.uuid,
            };

            SohlActiveEffect.create(aeData, {
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
                const item = fromUuidSync(li.dataset.uuid);
                dragData = item.toDragData();
            }

            // Active Effect
            else if (li.dataset.effectId && this.actor) {
                const effect = (this.actor as any).effects.get(
                    li.dataset.effectId,
                );
                dragData = effect.toDragData();
            }

            // Action
            else if (li.dataset.actionName && this.actor) {
                const action = this.actor.system.actions.getName(
                    li.dataset.actionName,
                );
                dragData = action.toDragData();
            }

            if (!dragData) return;

            // Set data transfer
            event.dataTransfer?.setData("text/plain", JSON.stringify(dragData));
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
            const documentClass = fvtt.utils.getDocumentClass(data.type);
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
            let oldArray = fvtt.utils.getProperty(this.document, dataset.array);
            let newArray = fvtt.utils.deepClone(oldArray);
            const datatype = dataset.dtype;
            const choices = dataset.choices;
            const defaultValue =
                dataset.dtype === "Number" ?
                    String(Number.parseFloat(dataset.defaultValue || "0") || 0)
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
                        const fd = new fvtt.applications.ux.FormDataExtended(
                            form,
                        );
                        const formData = fvtt.utils.expandObject(fd.object);
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
            const result = await this.document.update(updateData);
            if (result) this.render();
        }

        async _addChoiceArrayItem(event: PointerEvent): Promise<void> {
            const dataset = (event.currentTarget as HTMLElement).dataset;
            if (!dataset.choices || !dataset.array) return;
            let array: string[] = (
                fvtt.utils.getProperty(this.document, dataset.array) || []
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
                    const fd = new fvtt.applications.ux.FormDataExtended(form);
                    const formData = fvtt.utils.expandObject(fd.object);
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
            await this.document.update(updateData);
        }

        async _addAimArrayItem(event: PointerEvent): Promise<void> {
            const dataset = (event.currentTarget as HTMLElement).dataset;
            if (!dataset.aim || !dataset.array) return;
            let array: { name: string; probWeightBase: number }[] = (
                fvtt.utils.getProperty(this.document, dataset.array) || []
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
                    const fd = new fvtt.applications.ux.FormDataExtended(form);
                    const formData = fvtt.utils.expandObject(fd.object);
                    const result = {
                        name: formData.name,
                        probWeightBase:
                            Number.parseInt(formData.probWeightBase, 10) || 0,
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
            await this.document.update(updateData);
        }

        async _addValueDescArrayItem(event: PointerEvent): Promise<void> {
            const dataset = (event.currentTarget as HTMLElement).dataset;
            if (!dataset.valueDesc || !dataset.array) return;
            let array: { label: string; maxValue: number }[] = (
                fvtt.utils.getProperty(this.document, dataset.array) || []
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
                    const fd = new fvtt.applications.ux.FormDataExtended(form);
                    const formData = fvtt.utils.expandObject(fd.object);
                    const result = {
                        label: formData.label,
                        maxValue: Number.parseInt(formData.maxValue, 10) || 0,
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
            await this.document.update(updateData);
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
            let array: any[] = fvtt.utils.getProperty(
                this.document,
                dataset.array,
            );
            array = array.filter((a: any) => a !== dataset.value);
            const result = await this.document.update({
                [dataset.array]: array,
            });
            if (result) this.render();
        }

        async _addObjectKey(event: PointerEvent): Promise<void> {
            const dataset = (event.currentTarget as HTMLElement).dataset;
            if (!dataset.object) return;
            if (!dataset.title) dataset.title = "Add Key";

            await (this as any)._onSubmit(event); // Submit any unsaved changes

            let object = fvtt.utils.getProperty(this.document, dataset.object);

            const dialogData = {
                variant: sohl.game.id,
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
                    const fd = new fvtt.applications.ux.FormDataExtended(form);
                    const formData = fvtt.utils.expandObject(fd.object);
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
            const result = await this.document.update(updateData);
            if (result) this.render();
        }

        /**
         * Asynchronously deletes a key from an object. Retrieves the dataset from the current event, submits any unsaved changes, gets the object using the dataset, deletes the specified key from the object, and updates the list on the server with the modified object.
         *
         * @async
         * @param {*} event
         * @returns {unknown}
         */
        async _deleteObjectKey(event: PointerEvent): Promise<void> {
            const dataset = (event.currentTarget as HTMLElement)?.dataset;
            if (!dataset.object) return;
            if (!dataset.key) return;
            await (this as any)._onSubmit(event); // Submit any unsaved changes
            // Update the list on the server
            const result = await this.document.update({
                [dataset.object]: {
                    [`-=${dataset.key}`]: null,
                },
            });

            if (result) {
                this.render();
            }
        }

        //     /** @override */
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
        //                     item = this.item.system.items.get(itemId);
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
    }
}
