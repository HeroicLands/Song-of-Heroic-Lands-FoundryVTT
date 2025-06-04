import { SohlPerformer } from "@common";
import { SohlActor } from "@common/actor";
import { SohlItem } from "@common/item";
import {
    SohlClassRegistry,
    SohlContextMenu,
    SohlContextMenuEntry,
} from "@utils";
const { ArrayField, ObjectField } = fvtt.data.fields;
type HandlebarsTemplatePart =
    foundry.applications.api.HandlebarsApplicationMixin.HandlebarsTemplatePart;
const { DocumentSheetV2, HandlebarsApplicationMixin } =
    foundry.applications.api;

export abstract class SohlDataModel<
        P extends SohlActor | SohlItem,
        T extends SohlPerformer = SohlPerformer,
    >
    extends foundry.abstract.TypeDataModel<foundry.data.fields.DataSchema, any>
    implements SohlDataModel.Data<P>
{
    declare parent: P;

    protected _logic!: T;

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

    get logicClass(): SohlPerformer.Constructor {
        return (this as any)._metadata.logicClass as SohlPerformer.Constructor;
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

    get logic(): T {
        if (!this._logic) {
            this._logic = new this.logicClass(this) as T;
        }
        return this._logic;
    }
}

export namespace SohlDataModel {
    export type Any = SohlDataModel<SohlActor | SohlItem, SohlPerformer>;

    export type Constructor<TParent extends SohlActor | SohlItem> =
        AnyConstructor<Data<TParent>> & TypeDataModelStatics;

    export interface TypeDataModelStatics {
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
        P extends SohlActor | SohlItem,
    > extends HandlebarsApplicationMixin(DocumentSheetV2) {
        declare document: P;
        declare options: PlainObject;
        declare isEditable: boolean;
        _dragDrop: DragDrop[];

        constructor(
            document: P,
            options: Partial<foundry.applications.api.ApplicationV2.Options> = {},
        ) {
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
                effectToggle: SohlSheet._onEffectToggle,
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
            data.owner = this.document.isOwner;
            data.limited = this.document.limited;
            data.options = this.options;
            data.editable = this.isEditable;
            data.cssClass = data.owner ? "editable" : "locked";
            data.isAnimateEntity =
                this.document.system instanceof AnimateEntityDataModel;
            data.isInanimateObject =
                this.document.system instanceof InanimateObjectDataModel;
            data.actor =
                this.document instanceof SohlActor ?
                    this.document
                :   this.document.actor;
            data.flags = this.document.flags;
            data.system = this.document.system;
            data.isGM = game.user.isGM;
            data.fields = this.document.system.schema.fields;

            data.effects = this.document.effects;

            // Collect all effects from other Items/Actors that are affecting this item
            data.trxEffects = {};
            this.document.transferredEffects.forEach((effect) => {
                if (!effect.disabled) {
                    data.trxEffects[effect.id] = effect;
                }
            });

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

        _contextMenu(element: HTMLElement) {
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

        _onItemContextMenuOpen(element: HTMLElement) {
            let ele = element.closest("[data-item-id]") as HTMLElement;
            if (!ele) return;
            const actionName = ele?.dataset.actionName;
            const docId = ele?.dataset.itemId;
            let doc;
            if (actionName) {
                doc = this.document.system.actions.get(docId);
            } else {
                doc =
                    this.document instanceof SohlItem ?
                        this.document.getNestedItemById(docId)
                    : this.document instanceof SohlActor ?
                        this.document.getItem(docId)
                    :   null;
            }
            if (foundry.ui.context) {
                foundry.ui.context.menuItems =
                    doc ? SohlContextMenu._getContextOptions(doc) : [];
            }
        }

        _onEffectContextMenuOpen(element: HTMLElement) {
            let ele = element.closest("[data-effect-id]") as HTMLElement;
            if (!ele) return;
            const effectId = ele.dataset.effectId;
            const effect = this.document.effects.get(effectId);
            if (foundry.ui.context) {
                foundry.ui.context.menuItems =
                    effect ? SohlContextMenu._getContextOptions(effect) : [];
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
            doc: foundry.abstract.Document<"Item", any>,
        ): SohlContextMenuEntry[] {
            let result = doc.system.logic._getContextOptions();
            if (!result || !result.length) return [];

            result = result.filter(
                (co) => co.group !== SohlContextMenu.SORT_GROUPS.HIDDEN,
            );

            // Sort the menu items according to group.  Expect items with no group
            // at the top, items in the "primary" group next, and items in the
            // "secondary" group last.
            const collator = new Intl.Collator(sohl.i18n.lang);
            result.sort((a: SohlContextMenuEntry, b: SohlContextMenuEntry) =>
                collator.compare(a.group || "", b.group || ""),
            );
            return result;
        }

        static _onEffectToggle(event: PointerEvent, target: HTMLElement): void {
            const thisSheet = this as unknown as SohlSheet;
            const li = target.closest(".effect") as HTMLElement;
            if (!li?.dataset.effectId) return;
            const effect = thisSheet.document.effects.get(li.dataset.effectId);
            effect?.toggleEnabledState();
        }

        async _onEffectCreate(): Promise<void> {
            let name = "New Effect";
            let i = 0;
            while (this.document.effects.some((e) => e.name === name)) {
                name = `New Effect ${++i}`;
            }
            const aeData = {
                name,
                type: SohlActiveEffectData.TYPE_NAME,
                icon: SohlActiveEffectData.defaultImage,
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
                const item = foundryHelpers.fromUuidSync(li.dataset.uuid);
                dragData = item.toDragData();
            }

            // Active Effect
            else if (li.dataset.effectId && this.actor) {
                const effect = this.actor.effects.get(li.dataset.effectId);
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
            const documentClass = foundry.utils.getDocumentClass(
                data.type,
            ) as foundry.abstract.Document | null;
            if (documentClass) {
                const document = (await documentClass.fromDropData(
                    data,
                )) as foundry.abstract.Document;
                switch (document.documentName) {
                    case "ActiveEffect":
                        return this._onDropActiveEffect(
                            event,
                            document as SohlActiveEffect,
                        );
                    case "Actor":
                        return this._onDropActor(
                            event,
                            document as unknown as SohlActor,
                        );
                    case "Item":
                        return this._onDropItem(event, document as SohlItem);
                    case "Folder":
                        return this._onDropFolder(event, document as Folder);
                }
            }
        }

        /** @override */
        async _onDropItem(
            event: DragEvent,
            data: PlainObject,
        ): Promise<boolean> {
            if (!this.document.isOwner) return false;

            const droppedItem = (await SohlItem.fromDropData(
                data,
            )) as SohlItem | null;
            if (!droppedItem) return false;

            if (droppedItem.system instanceof GearDataModel) {
                return this._onDropGear(event, droppedItem);
            } else {
                return this._onDropNonGear(event, droppedItem);
            }
        }

        /** @override */
        async _onDropItemCreate(
            data: PlainObject,
            event: DragEvent,
        ): Promise<boolean> {
            if (!this.document.isOwner) return false;

            const isActor = this.document instanceof SohlActor;
            const items =
                isActor ? this.document.items : this.document.system.items;

            const itemList = data instanceof Array ? data : [data];
            const toCreate = [];
            for (let itemData of itemList) {
                // Body items cannot be placed directly on actor; these must always be
                // in an Anatomy object instead
                if (isActor && itemData.type.startsWith("body")) {
                    ui.notifications.warn(
                        _l("You may not drop a {itemType} onto an Actor", {
                            itemType: _l(`TYPES.Item.${itemData.type}.label`),
                        }),
                    );
                    return false;
                }

                // Determine if a similar item exists
                let similarItem;
                if (isActor && itemData.type === AnatomyItemData.TYPE_NAME) {
                    // Only one Anatomy item is allowed to be on an actor at any time,
                    // so any existing one will be considered "similar".
                    similarItem = items.find(
                        (it) => it.type === AnatomyItemData.TYPE_NAME,
                    );
                }

                if (!similarItem) {
                    similarItem = items.find(
                        (it) =>
                            it.name === itemData.name &&
                            it.type === itemData.type &&
                            it.system.subType === itemData.system.subType,
                    );
                }

                if (similarItem) {
                    const confirm = await Dialog.confirm({
                        title: `Confirm Overwrite: ${similarItem.label}`,
                        content: `<p>Are You Sure?</p><p>This item will be overwritten and cannot be recovered.</p>`,
                        options: { jQuery: false },
                    });
                    if (confirm) {
                        delete itemData._id;
                        delete itemData.pack;
                        let result = await similarItem.delete();
                        if (result) {
                            result = await this.document.constructor.create(
                                itemData,
                                {
                                    parent:
                                        isActor ?
                                            this.document
                                        :   this.document.actor,
                                    clean: true,
                                },
                            );
                        } else {
                            ui.notifications.warn("Overwrite failed");
                            continue;
                        }
                        toCreate.push(itemData);
                    }
                } else {
                    toCreate.push(itemData);
                }
            }

            return super._onDropItemCreate(toCreate, event);
        }

        async _onDropGear(
            event: DragEvent,
            droppedItem: SohlItem,
        ): Promise<boolean> {
            const destContainerId = event.target.closest("[data-container-id]")
                ?.dataset.containerId;

            // If no other container is specified, use this item
            let destContainer;
            if (this.document instanceof SohlItem) {
                destContainer =
                    !destContainerId ?
                        this.document
                    :   this.document.actor?.items.get(destContainerId) ||
                        this.document.getNestedItemById(destContainerId) ||
                        this.document;
            } else {
                destContainer =
                    !destContainerId ?
                        this.document
                    :   this.document.items.get(destContainerId);
            }

            if (
                (destContainer instanceof SohlItem &&
                    destContainer.id === droppedItem.nestedIn?.id) ||
                (destContainer instanceof SohlActor &&
                    destContainer.id === droppedItem.parent?.id)
            ) {
                // If dropped item is already in a container and
                // source and dest containers are the same,
                // then we are simply rearranging
                return await destContainer._onSortItem(
                    event,
                    droppedItem.toObject(),
                );
            }

            if (droppedItem.id === destContainer.id) {
                // Prohibit moving a container into itself
                ui.notifications.warn("Can't move a container into itself");
                return false;
            }

            const items =
                destContainer instanceof SohlItem ?
                    destContainer.system.items
                :   destContainer.items;
            const similarItem = items.find(
                (it) =>
                    droppedItem.id === it.id ||
                    (droppedItem.name === it.name &&
                        droppedItem.type === it.type),
            );

            if (similarItem) {
                ui.notifications.error(
                    `Similar item exists in ${destContainer.name}`,
                );
                return false;
            }

            let quantity = droppedItem.system.quantity;
            if (quantity > 1 && !droppedItem.parent) {
                // Ask how many to move
                quantity = await Utility.moveQtyDialog(
                    droppedItem,
                    destContainer,
                );
            }

            return await droppedItem.nestIn(destContainer, {
                quantity,
                destructive: true,
            });
        }

        async _onDropNonGear(
            event: DragEvent,
            droppedItem: SohlItem,
        ): Promise<boolean> {
            if (
                droppedItem.nestedIn?.id === this.document.id ||
                droppedItem.parent?.id === this.document.id
            ) {
                // Sort items
                return this.document._onSortItem(event, droppedItem.toObject());
            } else {
                if (this.document instanceof SohlActor) {
                    const newItem = await SohlItem.create(
                        droppedItem.toObject(),
                        {
                            parent: this.document,
                        },
                    );
                    if (!droppedItem.fromCompendiumOrWorld) {
                        await droppedItem.delete();
                    }
                    return newItem;
                } else {
                    const result = this._onDropItemCreate(
                        droppedItem.toObject(),
                        event,
                    );
                    return result;
                }
            }
        }

        async _addPrimitiveArrayItem(
            event: PointerEvent,
            { allowDuplicates = false } = {},
        ): Promise<void> {
            const dataset = event.currentTarget.dataset;
            let oldArray = foundryHelpers.getProperty(
                this.document,
                dataset.array,
            );
            let newArray = foundryHelpers.deepClone(oldArray);
            let defaultValue = dataset.defaultValue;
            const datatype = dataset.dtype;
            const choices = dataset.choices;
            if (["Number", "String"].includes(dataset.dtype)) {
                if (dataset.dtype === "Number")
                    defaultValue = Number.parseFloat(defaultValue) || 0;
                const dialogData = {
                    valueName: dataset.title,
                    newValue: defaultValue,
                    choices,
                };

                const compiled = Handlebars.compile(`<form id="value">
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
                const dlgHtml = compiled(dialogData, {
                    allowProtoMethodsByDefault: true,
                    allowProtoPropertiesByDefault: true,
                });

                const dlgResult = await Dialog.prompt({
                    title: dataset.title,
                    content: dlgHtml.trim(),
                    label: `Add ${dataset.title}`,
                    callback: (element) => {
                        const form = element.querySelector("form");
                        const fd = new fvtt.applications.ux.FormDataExtended(
                            form,
                        );
                        const formData = foundryHelpers.expandObject(fd.object);
                        let formValue = formData.newValue;
                        if (datatype === "Number") {
                            formValue = Number.parseFloat(formValue);
                            if (Number.isNaN(formValue))
                                formValue = dataset.defaultValue;
                        }
                        return formValue;
                    },
                    rejectClose: false,
                    options: { jQuery: false },
                });

                // if dialog was closed, do nothing
                if (!dlgResult) return;

                if (!allowDuplicates && newArray.includes(dlgResult)) return;

                newArray.push(dlgResult);
                const updateData = { [dataset.array]: newArray };
                const result = await this.item.update(updateData);
                if (result) this.render();
            }
        }

        async _addChoiceArrayItem(event: PointerEvent): Promise<void> {
            const dataset = event.currentTarget.dataset;
            let array = foundryHelpers
                .getProperty(this.document, dataset.array)
                .concat();
            const choices = dataset.choices.split(";");
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
                    const formData = foundryHelpers.expandObject(fd.object);
                    return formData.choice;
                },
                rejectClose: false,
                options: { jQuery: false },
            });

            // if dialog was closed, do nothing
            if (!dlgResult) return null;

            if (array.some((a) => a === dlgResult)) {
                ui.notifications.warn(
                    `Choice with value "${dlgResult} already exists, ignoring`,
                );
                return null;
            }

            array.push(dlgResult);
            const updateData = { [dataset.array]: array };
            const result = await this.item.update(updateData);
            return result;
        }

        async _addAimArrayItem(event: PointerEvent): Promise<void> {
            const dataset = event.currentTarget.dataset;
            let array = foundryHelpers
                .getProperty(this.document, dataset.array)
                .concat();
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
                    const formData = foundryHelpers.expandObject(fd.object);
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
            if (!dlgResult) return null;

            if (array.some((a) => a.name === dlgResult.name)) {
                ui.notifications.warn(
                    `Aim with name "${dlgResult.name} already exists, ignoring`,
                );
                return null;
            }

            array.push(dlgResult);
            const updateData = { [dataset.array]: array };
            const result = await this.item.update(updateData);
            return result;
        }

        async _addValueDescArrayItem(event: PointerEvent): Promise<void> {
            const dataset = event.currentTarget.dataset;
            let array = foundryHelpers
                .getProperty(this.document, dataset.array)
                .concat();
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
                    const formData = foundryHelpers.expandObject(fd.object);
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
            if (!dlgResult) return null;

            if (array.some((a) => a.label === dlgResult.label)) {
                ui.notifications.warn(
                    `Aim with name "${dlgResult.name} already exists, ignoring`,
                );
                return null;
            }

            array.push(dlgResult);
            array.sort((a, b) => a.maxValue - b.maxValue);
            const updateData = { [dataset.array]: array };
            const result = await this.item.update(updateData);
            if (result) this.render();
            return result;
        }

        async _addArrayItem(event: PointerEvent): Promise<void> {
            const dataset = event.currentTarget.dataset;
            await this._onSubmit(event); // Submit any unsaved changes

            let result;
            if (dataset.objectType === "Aim") {
                result = await this._addAimArrayItem(event);
            } else if (dataset.objectType === "ValueDesc") {
                result = await this._valueDescArrayItem(event);
            } else if (dataset.choices) {
                result = await this._addChoiceArrayItem(event);
            } else if (["Number", "String"].includes(dataset.dtype)) {
                result = await this._addPrimitiveArrayItem(event, {
                    allowDuplicates: dataset.allowDuplicates,
                });
            }
            if (result) this.render();
            return result;
        }

        async _deleteArrayItem(event: PointerEvent): Promise<void> {
            const dataset = event.currentTarget.dataset;
            if (!dataset.array) return null;
            await this._onSubmit(event); // Submit any unsaved changes
            let array = foundryHelpers.getProperty(
                this.document,
                dataset.array,
            );
            array = array.filter((a) => a !== dataset.value);
            const result = await this.document.update({
                [dataset.array]: array,
            });
            if (result) this.render();
        }

        async _addObjectKey(event: PointerEvent): Promise<void> {
            const dataset = event.currentTarget.dataset;

            await this._onSubmit(event); // Submit any unsaved changes

            let object = foundryHelpers.getProperty(
                this.document,
                dataset.object,
            );

            const dialogData = {
                variant: CONFIG.SOHL.id,
                newKey: "",
                newValue: "",
            };

            let dlgTemplate =
                "systems/sohl/templates/dialog/keyvalue-dialog.html";
            const dlgHtml = await renderTemplate(dlgTemplate, dialogData);

            const dlgResult = await Dialog.prompt({
                title: dataset.title,
                content: dlgHtml.trim(),
                label: `Add ${dataset.title}`,
                callback: (element: HTMLElement) => {
                    const form = element.querySelector(
                        "form",
                    ) as HTMLFormElement;
                    const fd = new fvtt.applications.ux.FormDataExtended(form);
                    const formData = foundryHelpers.expandObject(fd.object);
                    let formKey = formData.newKey;
                    let formValue = formData.newValue;
                    let value: number = Number.parseFloat(formValue);
                    if (Number.isNaN(value)) {
                        if (formValue === "true") value = 1;
                        else if (formValue === "false") value = 0;
                        else if (formValue === "null") value = 0;
                        else value = formValue;
                    }
                    return { key: formKey, value: value };
                },
                rejectClose: false,
                options: { jQuery: false },
            });

            // if dialog was closed, or key is empty, do nothing
            if (!dlgResult || !dlgResult.key) return;

            object[dlgResult.key] = dlgResult.value;
            const updateData = { [dataset.object]: object };
            const result = await this.item.update(updateData);
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
            await this._onSubmit(event); // Submit any unsaved changes
            // Update the list on the server
            const result = await this.item.update({
                [dataset.object]: {
                    [`-=${dataset.key}`]: null,
                },
            });

            if (result) {
                this.render();
            }
        }

        /** @override */
        activateListeners(html) {
            super.activateListeners(html);
            const element = html instanceof jQuery ? html[0] : html;

            // Everything below here is only needed if the sheet is editable
            if (!this.options.editable) return;

            // Ensure all text is selected when entering text input field
            this.form
                .querySelector("input[type='text']")
                ?.addEventListener("click", (ev) => {
                    const target = ev.target;
                    if (!target.dataset?.type) {
                        target.select();
                    }
                });

            this.form
                .querySelector(".effect-create")
                ?.addEventListener("click", this._onEffectCreate.bind(this));

            this.form
                .querySelector(".effect-toggle")
                ?.addEventListener("click", this._onEffectToggle.bind(this));

            this.form
                .querySelector(".alter-time")
                ?.addEventListener("click", (ev) => {
                    const property = ev.currentTarget.dataset.property;
                    let time = Number.parseInt(
                        ev.currentTarget.dataset.time,
                        10,
                    );
                    if (Number.isNaN(time)) time = 0;
                    Utility.onAlterTime(time).then((result) => {
                        if (result !== null) {
                            const updateData = { [property]: result };
                            this.item.update(updateData);
                        }
                    });
                });

            // Add/delete Object Key
            this.form
                .querySelector(".add-array-item")
                ?.addEventListener("click", this._addArrayItem.bind(this));
            this.form
                .querySelector(".delete-array-item")
                ?.addEventListener("click", this._deleteArrayItem.bind(this));

            // Add/delete Object Key
            this.form
                .querySelector(".add-object-key")
                ?.addEventListener("click", this._addObjectKey.bind(this));
            this.form
                .querySelector(".delete-object-key")
                ?.addEventListener("click", this._deleteObjectKey.bind(this));

            this.form
                .querySelector(".action-create")
                ?.addEventListener("click", (ev) => {
                    return Utility.createAction(ev, this.document);
                });

            this.form
                .querySelector(".action-execute")
                ?.addEventListener("click", (ev) => {
                    const li = ev.currentTarget.closest(".action-item");
                    const itemId = li.dataset.itemId;
                    const action = this.document.system.actions.get(itemId);
                    action.execute({ event: ev, dataset: li.dataset });
                });

            this.form
                .querySelector(".action-edit")
                ?.addEventListener("click", (ev) => {
                    const li = ev.currentTarget.closest(".action-item");
                    const itemId = li.dataset.itemId;
                    const action = this.document.system.actions.get(itemId);
                    if (!action) {
                        throw new Error(
                            `Action ${itemId} not found on ${this.document.name}.`,
                        );
                    }
                    action.sheet.render(true);
                });

            this.form
                .querySelector(".action-delete")
                ?.addEventListener("click", (ev) => {
                    const li = ev.currentTarget.closest(".action-item");
                    const itemId = li.dataset.itemId;
                    const action = this.document.system.actions.get(itemId);
                    if (!action) {
                        throw new Error(
                            `Action ${itemId} not found on ${this.document.name}.`,
                        );
                    }
                    return Utility.deleteAction(ev, action);
                });

            this.form
                .querySelector(".default-action")
                ?.addEventListener("click", (ev) => {
                    const li = ev.currentTarget.closest(".item");
                    const itemId = li.dataset.itemId;
                    let item;
                    if (this.document instanceof SohlActor) {
                        item = this.actor.getItem(itemId);
                    } else {
                        item = this.item.system.items.get(itemId);
                    }
                    if (item) {
                        const defaultAction = item.system.getDefaultAction(li);
                        if (defaultAction?.callback instanceof Function) {
                            defaultAction.callback();
                        } else {
                            ui.notifications.warn(
                                `${item.label} has no available default action`,
                            );
                        }
                    }
                });

            // Activate context menu
            this._contextMenu(element);
        }
    }
}
