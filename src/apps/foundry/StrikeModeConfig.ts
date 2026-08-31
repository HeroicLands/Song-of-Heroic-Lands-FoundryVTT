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
import { actorItemRefOptions } from "@src/document/item/logic/refOptions";
import {
    ImpactAspectChoices,
    ITEM_KIND,
    STRIKE_MODE_TYPE,
    StrikeModeTypeChoices,
    type StrikeModeType,
} from "@src/utils/constants";
import type { StrikeModeBase } from "@src/entity/strikemode/StrikeModeBase";

const StrikeModeConfig_Base: any = foundry.applications.api.HandlebarsApplicationMixin(
    foundry.applications.api.ApplicationV2,
);

/**
 * A small, sheet-like editor for a single embedded strike mode.
 *
 * A strike mode is embedded data, not a document, so it has no document sheet.
 * This ApplicationV2 form edits one strike mode on the parent item — an element
 * of a weapon's `system.strikeModes` array (identified by its shortcode) or a
 * combat technique's single `system.strikeMode` — and persists via
 * `item.update()`.
 *
 * The form **auto-saves**: every field change submits (`submitOnChange`) and
 * writes back immediately, so there is no Save button and the window stays open.
 *
 * The strike-mode **type is fixed** at creation and shown read-only here — to
 * change type, delete the mode and create a new one. A weapon strike mode's
 * shortcode is editable and must stay unique among the weapon's modes; a combat
 * technique's single mode has no shortcode of its own, so that field is
 * read-only too.
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
    /**
     * The shortcode (row key) the strike mode is currently stored under. Tracked
     * so an auto-save after a shortcode edit targets the renamed element.
     */
    #key: string;

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
            // Annotated so declaration emit does not have to name the
            // private static `#onSubmit`, which it can only spell with a
            // synthetic `__#N@#onSubmit` that no downstream `.d.ts`
            // consumer can parse (issue #1613).
            handler: StrikeModeConfig
                .#onSubmit as foundry.applications.api.ApplicationV2.FormSubmission,
            closeOnSubmit: false,
            submitOnChange: true,
        },
    };

    static PARTS: Record<string, any> = {
        form: {
            template: "systems/sohl/templates/apps/strike-mode-config.hbs",
        },
    };

    /**
     * Open the editor bound to one embedded strike mode on an item.
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
    }

    /** The item being edited (read-only accessor for callers/tests). */
    get item(): SohlItem {
        return this.#item;
    }

    /** @inheritDoc */
    override get title(): string {
        return `${game.i18n.localize("SOHL.StrikeModeConfig.title")}: ${this.#item.name}`;
    }

    /**
     * The strike mode currently stored under {@link #key}, read live from the
     * item so each render reflects the persisted state.
     * @returns The strike-mode data, or `undefined` if not found.
     */
    #current(): StrikeModeBase.Data | undefined {
        const system = this.#item.system as any;
        if (this.#isMulti) {
            return (system.strikeModes as StrikeModeBase.Data[] | undefined)?.find(
                (m) => m.shortcode === this.#key,
            );
        }
        return (system.strikeMode as StrikeModeBase.Data | null | undefined) ?? undefined;
    }

    /**
     * Build the render context from the persisted strike mode: its fields, the
     * melee/missile flags the template branches on, the read-only type label, and
     * the Zone Die spread label.
     *
     * @param _options - The render options (unused).
     * @returns The template context describing the current strike mode.
     */
    protected override async _prepareContext(_options: any): Promise<any> {
        const sm = (this.#current() ??
            blankStrikeMode(STRIKE_MODE_TYPE.MELEE, this.#item.name)) as any;
        const smType = sm.type as StrikeModeType;
        const aspectOptions = Object.entries(ImpactAspectChoices).map(([value, label]) => ({
            value,
            label,
            selected: value === sm.impactBase?.aspect,
        }));
        return {
            sm,
            smType,
            typeLabel: game.i18n.localize(StrikeModeTypeChoices[smType] ?? smType),
            // For a weapon, the mode's own (editable) shortcode; for a combat
            // technique there is none, so fall back to the row key for display.
            shortcode: this.#isMulti ? (sm.shortcode ?? this.#key) : this.#key,
            isMulti: this.#isMulti,
            isMelee: smType === STRIKE_MODE_TYPE.MELEE,
            isMissile: smType === STRIKE_MODE_TYPE.MISSILE,
            // The melee attack scatter is always presented as a Zone Die.
            spreadLabel: "Zone Die",
            aspectOptions,
            // Associated-skill dropdown (#974): the owning actor's skills when the
            // weapon/technique is embedded; empty for a world item, so the field
            // falls back to free-text entry.
            embedded: this.#item.actor != null,
            assocSkillCodeOptions: actorItemRefOptions(
                this.#item.actor?.logic,
                ITEM_KIND.SKILL,
                sm.assocSkillCode,
            ),
        };
    }

    /**
     * Auto-save handler (`submitOnChange`): build a clean, schema-valid strike
     * mode from the submitted fields — preserving the fixed, read-only type — and
     * write it back to the item.
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
        // The type is read-only (not a form field), so preserve the stored
        // mode's type rather than reading it from the submission.
        const type: StrikeModeType = this.#current()?.type ?? STRIKE_MODE_TYPE.MELEE;
        // Start from a blank of that type so every subtype field is present and
        // valid, then overlay the submitted values.
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
     * whole `system.strikeModes` array is written back with this element
     * replaced. On a successful rename {@link #key} is updated so the next
     * auto-save targets the renamed element.
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
            (this.#item.system as any).strikeModes as StrikeModeBase.Data[] | undefined
        )
            ?.map((m) => m.shortcode)
            .filter((sc) => sc !== this.#key);
        const plan = planShortcodeSave(this.#key, String(clean.shortcode ?? ""), siblings ?? []);
        if (plan.error) sohl.log.uiWarn(plan.error);
        clean.shortcode = plan.shortcode;
        await this.#item.update(logic.replaceStrikeModeUpdate(this.#key, clean));
        this.#key = plan.shortcode;
    }
}
