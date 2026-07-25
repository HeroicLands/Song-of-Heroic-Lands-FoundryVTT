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

import type { SohlItem } from "@src/document/item/foundry/SohlItem";
import { blankStrikeMode } from "@src/entity/strikemode/blankStrikeMode";
import { planShortcodeSave } from "@src/entity/strikemode/planShortcodeSave";
import {
    ImpactAspectChoices,
    ITEM_KIND,
    STRIKE_MODE_TYPE,
    isStrikeModeType,
    type StrikeModeType,
} from "@src/utils/constants";
import type { StrikeModeBase } from "@src/entity/strikemode/StrikeModeBase";

const StrikeModeConfig_Base: any =
    foundry.applications.api.HandlebarsApplicationMixin(
        foundry.applications.api.ApplicationV2,
    );

/**
 * A small, sheet-like editor for a single embedded strike mode.
 *
 * A strike mode is embedded data, not a document, so it has no document sheet.
 * This ApplicationV2 form edits one strike mode on the parent item — an element
 * of a weapon's `system.strikeModes` array (identified by its shortcode) or a
 * combat technique's single `system.strikeMode` — and persists via
 * `item.update()` on submit, writing the whole array back for a weapon.
 *
 * A weapon strike mode's shortcode is editable and must stay unique among the
 * weapon's modes; a combat technique's single mode has no shortcode of its own,
 * so the field is shown read-only.
 *
 * The melee/missile discriminated union is handled by a type `<select>`: when
 * the type changes the form re-renders with that subtype's fields, carrying the
 * common fields (name, min parts, attack, impact) across the switch and seeding
 * the new subtype-specific fields from {@link blankStrikeMode}.
 *
 * @internal Foundry UI binding; not part of the public API.
 */
export class StrikeModeConfig extends (StrikeModeConfig_Base as typeof foundry.applications.api.ApplicationV2) {
    /** The item owning the strike mode being edited. */
    #item: SohlItem;
    /**
     * Whether the parent stores many strike modes in an array (a weapon) versus
     * a single one (a combat technique). Only a weapon's strike mode has an
     * editable shortcode.
     */
    #isMulti: boolean;
    /** The shortcode (row key) the strike mode is currently stored under. */
    #key: string;
    /** The working copy of the strike mode, re-seeded on a type switch. */
    #draft: StrikeModeBase.Data;

    /** @inheritDoc */
    static override DEFAULT_OPTIONS = {
        classes: ["sohl", "strike-mode-config", "standard-form"],
        window: {
            title: "SOHL.StrikeModeConfig.title",
            icon: "fa-solid fa-hand-fist",
            contentClasses: ["standard-form"],
        },
        position: {
            width: 480,
            height: "auto" as const,
        },
        tag: "form" as const,
        form: {
            handler: StrikeModeConfig.#onSubmit,
            closeOnSubmit: true,
            submitOnChange: false,
        },
    };

    static PARTS: Record<string, any> = {
        form: {
            template: "systems/sohl/templates/apps/strike-mode-config.hbs",
        },
    };

    /**
     * Open the editor bound to one embedded strike mode on an item, seeding the
     * working draft from the value currently stored under `key` (or a blank
     * melee mode when nothing is found there yet).
     * @param item - The parent item whose strike mode is edited.
     * @param key - The strike mode's row key: its shortcode for a weapon, or any
     *   sentinel for a combat technique's single `system.strikeMode`.
     * @param options - Additional ApplicationV2 options.
     */
    constructor(item: SohlItem, key: string, options: PlainObject = {}) {
        // Derive a stable, per-(item, key) id so editing two different modes on
        // the same weapon opens two distinct windows rather than reusing one.
        const idSuffix = key.replace(/[^\w-]/g, "-");
        super({ id: `strike-mode-config-${item.id}-${idSuffix}`, ...options });
        this.#item = item;
        this.#isMulti = item.type === ITEM_KIND.WEAPONGEAR;
        this.#key = key;
        const system = item.system as any;
        const existing: StrikeModeBase.Data | undefined =
            this.#isMulti ?
                (system.strikeModes as StrikeModeBase.Data[] | undefined)?.find(
                    (m) => m.shortcode === key,
                )
            :   ((system.strikeMode as
                    | StrikeModeBase.Data
                    | null
                    | undefined) ?? undefined);
        this.#draft =
            existing ?
                (foundry.utils.deepClone(existing) as StrikeModeBase.Data)
            :   blankStrikeMode(STRIKE_MODE_TYPE.MELEE, item.name);
    }

    /** The item being edited (read-only accessor for callers/tests). */
    get item(): SohlItem {
        return this.#item;
    }

    /** @inheritDoc */
    override get title(): string {
        return `${game.i18n.localize("SOHL.StrikeModeConfig.title")}: ${
            this.#item.name
        }`;
    }

    /**
     * Build the render context from the working draft: the strike-mode fields
     * plus the melee/missile flags the template branches on.
     *
     * @param _options - The render options (unused).
     * @returns The template context describing the current draft.
     */
    protected override async _prepareContext(_options: any): Promise<any> {
        const sm = this.#draft as any;
        const smType = sm.type as StrikeModeType;
        const aspectOptions = Object.entries(ImpactAspectChoices).map(
            ([value, label]) => ({
                value,
                label,
                selected: value === sm.impactBase?.aspect,
            }),
        );
        return {
            sm,
            smType,
            // For a weapon, the mode's own (editable) shortcode; for a combat
            // technique there is none, so fall back to the row key for display.
            shortcode: this.#isMulti ? (sm.shortcode ?? this.#key) : this.#key,
            isMulti: this.#isMulti,
            isMelee: smType === STRIKE_MODE_TYPE.MELEE,
            isMissile: smType === STRIKE_MODE_TYPE.MISSILE,
            aspectOptions,
            buttons: [
                {
                    type: "submit",
                    icon: "fa-solid fa-floppy-disk",
                    label: "SOHL.StrikeModeConfig.save",
                },
            ],
        };
    }

    /**
     * After render, wire the type `<select>` so switching melee↔missile
     * re-seeds the draft's subtype-specific fields (preserving the common
     * fields the user has already entered) and re-renders the form.
     *
     * @param context - The render context.
     * @param options - The render options.
     */
    protected override async _onRender(
        context: any,
        options: any,
    ): Promise<void> {
        await super._onRender(context, options);
        const el = this.element as HTMLElement;
        const typeSelect = el?.querySelector<HTMLSelectElement>(
            'select[name="type"]',
        );
        typeSelect?.addEventListener("change", () => {
            const newType = typeSelect.value;
            if (!isStrikeModeType(newType)) return;
            this.#draft = this.#reseedForType(newType);
            void this.render();
        });
    }

    /**
     * Merge the current form values into a fresh strike mode of `newType`.
     * Common fields (name, minParts, assocSkillCode, attack, impact, traits)
     * are carried across the type switch; subtype-specific fields reset to the
     * {@link blankStrikeMode} defaults for the new type.
     *
     * @param newType - The strike-mode type to switch to.
     * @returns A schema-valid strike mode of the requested type.
     */
    #reseedForType(newType: StrikeModeType): StrikeModeBase.Data {
        const current = this.#gatherForm();
        const seeded = blankStrikeMode(
            newType,
            String(current.name || this.#item.name),
        ) as any;
        return {
            ...seeded,
            shortcode: current.shortcode ?? seeded.shortcode,
            name: current.name ?? seeded.name,
            minParts: current.minParts ?? seeded.minParts,
            assocSkillCode: current.assocSkillCode ?? seeded.assocSkillCode,
            attack: { ...seeded.attack, ...(current.attack ?? {}) },
            impactBase: { ...seeded.impactBase, ...(current.impactBase ?? {}) },
            type: newType,
        } as StrikeModeBase.Data;
    }

    /**
     * Read the live form into a nested plain object (via `FormDataExtended` +
     * `expandObject`), so an in-flight edit survives a type-switch re-render.
     *
     * @returns The expanded form values, or an empty object before first render.
     */
    #gatherForm(): PlainObject {
        const form = this.element as HTMLFormElement | undefined;
        if (!form) return {};
        const fd = new foundry.applications.ux.FormDataExtended(form);
        return foundry.utils.expandObject(fd.object) as PlainObject;
    }

    /**
     * Form submit handler: build a clean, schema-valid strike mode of the
     * selected type from the submitted fields and write it back to the item.
     * Writing the whole value (rather than a field-by-field merge) guarantees a
     * clean type switch — no stale melee fields survive on a mode that is now
     * missile, and vice versa.
     *
     * @param this - The bound {@link StrikeModeConfig} instance.
     * @param _event - The submit event (unused).
     * @param _form - The form element (unused).
     * @param formData - The submitted form data.
     */
    static async #onSubmit(
        this: StrikeModeConfig,
        _event: Event,
        _form: HTMLFormElement,
        formData: any,
    ): Promise<void> {
        const submitted = foundry.utils.expandObject(formData.object) as any;
        const type: StrikeModeType =
            isStrikeModeType(submitted.type) ?
                submitted.type
            :   this.#draft.type;
        // Start from a blank of the target type so every subtype field is
        // present and valid, then overlay the submitted values.
        const clean = foundry.utils.mergeObject(
            blankStrikeMode(type, String(submitted.name || this.#item.name)),
            { ...submitted, type },
            { inplace: false },
        ) as StrikeModeBase.Data;
        await this.#persist(clean);
    }

    /**
     * Write the cleaned strike mode back to the item.
     *
     * For a combat technique the mode has no shortcode of its own, so the field
     * is cleared and the single `system.strikeMode` is overwritten. For a weapon
     * the submitted shortcode is validated for uniqueness among the weapon's
     * *other* modes via {@link planShortcodeSave}: an unchanged or rejected
     * shortcode keeps the current one (warning the user on rejection), and the
     * whole `system.strikeModes` array is written back with this element replaced.
     *
     * @param clean - The schema-valid strike-mode value to persist.
     */
    async #persist(clean: StrikeModeBase.Data): Promise<void> {
        const logic = this.#item.logic as any;
        if (!this.#isMulti) {
            clean.shortcode = "";
            await this.#item.update(logic.setStrikeModeUpdate(clean));
            return;
        }
        const siblings = (
            (this.#item.system as any).strikeModes as
                | StrikeModeBase.Data[]
                | undefined
        )
            ?.map((m) => m.shortcode)
            .filter((sc) => sc !== this.#key);
        const plan = planShortcodeSave(
            this.#key,
            String(clean.shortcode ?? ""),
            siblings ?? [],
        );
        if (plan.error) sohl.log.uiWarn(plan.error);
        clean.shortcode = plan.shortcode;
        await this.#item.update(
            logic.replaceStrikeModeUpdate(this.#key, clean),
        );
    }
}
