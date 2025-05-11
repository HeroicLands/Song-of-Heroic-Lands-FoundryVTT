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

import { foundryHelpers, SohlContextMenu } from "@utils";

function SohlSheetMixin<
    TBase extends Constructor<
        foundry.applications.api.DocumentSheetV2<any, any, any, any>
    >,
>(Base: TBase) {
    return class SohlSheet extends Base {
        /** @override */
        static override DEFAULT_OPTIONS = {
            ...super.DEFAULT_OPTIONS,
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
        };

        get template() {
            return (this.document as any).system.constructor.sheet;
        }

        _prepareContext(options = {}) {
            const data = super._prepareContext(options);
            data.variant = CONFIG.SOHL.id;
            data.const = SOHL;
            data.config = CONFIG.SOHL;
            data.owner = this.document.isOwner;
            data.limited = this.document.limited;
            data.options = this.options;
            data.editable = this.isEditable;
            data.cssClass = data.owner ? "editable" : "locked";
            data.variant = CONFIG.SOHL.id;
            data.isAnimateEntity =
                this.document.system instanceof AnimateEntityActorData;
            data.isInanimateObject =
                this.document.system instanceof InanimateObjectActorData;
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

        /** @override */
        protected override _onSearchFilter(
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
                jQuery: false,
            });
            new SohlContextMenu(element, ".item-contextmenu", [], {
                eventName: "click",
                onOpen: this._onItemContextMenuOpen.bind(this),
                jQuery: false,
            });
            new SohlContextMenu(element, ".effect", [], {
                onOpen: this._onEffectContextMenuOpen.bind(this),
                jQuery: false,
            });
            new SohlContextMenu(element, ".effect-contextmenu", [], {
                eventName: "click",
                onOpen: this._onEffectContextMenuOpen.bind(this),
                jQuery: false,
            });
        }

        _onItemContextMenuOpen(element: HTMLElement) {
            let ele = element.closest("[data-item-id]") as HTMLElement;
            if (!ele) return;
            const actionName = ele?.dataset.actionName;
            const docId = ele?.dataset.itemId;
            let doc;
            if (actionName) {
                doc = (this.document as SohlDocument).system.actions.get(docId);
            } else {
                doc =
                    this.document instanceof SohlItem ?
                        this.document.getNestedItemById(docId)
                    : this.document instanceof SohlActor ?
                        this.document.getItem(docId)
                    :   null;
            }
            ui.context.menuItems =
                doc ? this.constructor._getContextOptions(doc) : [];
        }

        _onEffectContextMenuOpen(element) {
            let ele = element.closest("[data-effect-id]");
            if (!ele) return;
            const effectId = ele?.dataset.effectId;
            const effect = this.document.effects.get(effectId);
            ui.context.menuItems =
                effect ? this.constructor._getContextOptions(effect) : [];
        }

        /**
         * Retrieve the context options for the given item. Sort the menu items based on groups, with items having no group at the top, items in the 'primary' group in the middle, and items in the 'secondary' group at the bottom.
         *
         * @static
         * @param {*} doc
         * @returns {*}
         */
        static _getContextOptions(doc) {
            let result =
                doc.system instanceof SohlBaseData ?
                    doc.system._getContextOptions()
                :   doc._getContextOptions();

            result = result.filter(
                (co) => co.group !== SohlContextMenu.SORT_GROUPS.HIDDEN,
            );

            // Sort the menu items according to group.  Expect items with no group
            // at the top, items in the "primary" group next, and items in the
            // "secondary" group last.
            Utility.sortStrings(result);
            return result;
        }

        async _onEffectToggle(event) {
            const li = event.currentTarget.closest(".effect");
            const effect = this.document.effects.get(li.dataset.effectId);
            return await effect.toggleEnabledState();
        }

        async _onEffectCreate() {
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

            return SohlActiveEffect.create(aeData, {
                parent: this.document,
            });
        }

        /** @inheritdoc */
        _onDragStart(event) {
            const li = event.currentTarget;
            if ("link" in event.target.dataset) return;

            // Create drag data
            let dragData;

            // Owned Items
            if (li.dataset.uuid) {
                const item = foundryHelpers.fromUuidSync(li.dataset.uuid);
                dragData = item.toDragData();
            }

            // Active Effect
            else if (li.dataset.effectId) {
                const effect = this.actor.effects.get(li.dataset.effectId);
                dragData = effect.toDragData();
            }

            // Action
            else if (li.dataset.actionName) {
                const action = this.actor.system.actions.getName(
                    li.dataset.actionName,
                );
                dragData = action.toDragData();
            }

            if (!dragData) return;

            // Set data transfer
            event.dataTransfer.setData("text/plain", JSON.stringify(dragData));
        }

        /** @override */
        async _onDropItem(event, data) {
            if (!this.document.isOwner) return false;

            const droppedItem = await SohlItem.fromDropData(data);
            if (!droppedItem) return false;

            if (droppedItem.system instanceof GearItemData) {
                return this._onDropGear(event, droppedItem);
            } else {
                return this._onDropNonGear(event, droppedItem);
            }
        }

        /** @override */
        async _onDropItemCreate(data, event) {
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

        async _onDropGear(event, droppedItem) {
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

        async _onDropNonGear(event, droppedItem) {
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

        async _addPrimitiveArrayItem(event, { allowDuplicates = false } = {}) {
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
                        const fd = new FormDataExtended(form);
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

        async _addChoiceArrayItem(event) {
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
                    const fd = new FormDataExtended(form);
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

        async _addAimArrayItem(event) {
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
                    const fd = new FormDataExtended(form);
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

        async _addValueDescArrayItem(event) {
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
                    const fd = new FormDataExtended(form);
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

        async _addArrayItem(event) {
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

        async _deleteArrayItem(event) {
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
            return result;
        }

        async _addObjectKey(event) {
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
                callback: (element) => {
                    const form = element.querySelector("form");
                    const fd = new FormDataExtended(form);
                    const formData = foundryHelpers.expandObject(fd.object);
                    let formKey = formData.newKey;
                    let formValue = formData.newValue;
                    let value = Number.parseFloat(formValue);
                    if (Number.isNaN(value)) {
                        if (formValue === "true") value = true;
                        else if (formValue === "false") value = false;
                        else if (formValue === "null") value = null;
                        else value = formValue;
                    }
                    return { key: formKey, value: value };
                },
                rejectClose: false,
                options: { jQuery: false },
            });

            // if dialog was closed, or key is empty, do nothing
            if (!dlgResult || !dlgResult.key) return null;

            object[dlgResult.key] = dlgResult.value;
            const updateData = { [dataset.object]: object };
            const result = await this.item.update(updateData);
            if (result) this.render();
            return result;
        }

        /**
         * Asynchronously deletes a key from an object. Retrieves the dataset from the current event, submits any unsaved changes, gets the object using the dataset, deletes the specified key from the object, and updates the list on the server with the modified object.
         *
         * @async
         * @param {*} event
         * @returns {unknown}
         */
        async _deleteObjectKey(event) {
            const dataset = event.currentTarget.dataset;
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
            return result;
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
    };
}
