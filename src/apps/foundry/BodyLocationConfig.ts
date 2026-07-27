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

import type { SohlActor } from "@src/document/actor/foundry/SohlActor";
import type { BodyLocation } from "@src/entity/body/BodyLocation";
import type { BodyPart } from "@src/entity/body/BodyPart";
import type { BodyStructure } from "@src/entity/body/BodyStructure";
import { blankBodyLocation } from "@src/entity/body/blankBodyLocation";
import { planBodyShortcode } from "@src/entity/body/planBodyShortcode";
import { getActorBody } from "@src/document/actor/logic/BodyLogic";
import {
    AmputabilityChoices,
    BleedingSusceptibilityChoices,
    isAmputability,
    isBleedingSusceptibility,
} from "@src/utils/constants";

const BodyLocationConfig_Base: any =
    foundry.applications.api.HandlebarsApplicationMixin(
        foundry.applications.api.ApplicationV2,
    );

/**
 * A small, sheet-like editor for a single {@link BodyLocation} within a
 * {@link BodyPart} on a Being.
 *
 * A body location is embedded data (an element of a part's `locations` array,
 * identified by its shortcode within that part), not a document, so it has no
 * document sheet. This ApplicationV2 form edits one location and persists via
 * `actor.update()` by rewriting the owning part with its updated locations
 * array (a whole-array write; never by index — see #247).
 *
 * The form **auto-saves**: every field change submits (`submitOnChange`) and
 * writes back immediately, so there is no Save button and the window stays open.
 *
 * Patterned on {@link sohl.apps.foundry.StrikeModeConfig}.
 *
 * @internal Foundry UI binding; not part of the public API.
 */
export class BodyLocationConfig extends (BodyLocationConfig_Base as typeof foundry.applications.api.ApplicationV2) {
    /** The actor owning the body location being edited. */
    #actor: SohlActor;
    /** The shortcode of the part that owns the location. */
    #partKey: string;
    /**
     * The shortcode (row key) the location is currently stored under within its
     * part. Tracked so an auto-save after a shortcode edit targets the renamed
     * element.
     */
    #key: string;

    /** @inheritDoc */
    static override DEFAULT_OPTIONS = {
        classes: ["sohl", "body-location-config", "standard-form"],
        window: {
            title: "SOHL.BodyLocationConfig.title",
            icon: "fa-solid fa-crosshairs",
            contentClasses: ["standard-form"],
        },
        position: {
            width: 480,
            height: "auto" as const,
        },
        tag: "form" as const,
        form: {
            handler: BodyLocationConfig.#onSubmit,
            closeOnSubmit: false,
            submitOnChange: true,
        },
    };

    static PARTS: Record<string, any> = {
        form: {
            template: "systems/sohl/templates/apps/body-location-config.hbs",
        },
    };

    /**
     * Open the editor bound to one location on an actor.
     * @param actor - The being whose body location is edited.
     * @param partShortcode - The shortcode of the owning body part.
     * @param shortcode - The location's shortcode (its row key within the part).
     * @param options - Additional ApplicationV2 options.
     */
    constructor(
        actor: SohlActor,
        partShortcode: string,
        shortcode: string,
        options: PlainObject = {},
    ) {
        // Derive a stable, per-(actor, part, location) id so editing two
        // different locations opens two distinct windows.
        const idSuffix = `${partShortcode}-${shortcode}`.replace(
            /[^\w-]/g,
            "-",
        );
        super({
            id: `body-location-config-${actor.id}-${idSuffix}`,
            ...options,
        });
        this.#actor = actor;
        this.#partKey = partShortcode;
        this.#key = shortcode;
    }

    /** The actor being edited (read-only accessor for callers/tests). */
    get actor(): SohlActor {
        return this.#actor;
    }

    /** @inheritDoc */
    override get title(): string {
        const loc = this.#currentData();
        const label = loc?.name || loc?.shortcode || this.#key;
        return `${game.i18n.localize("SOHL.BodyLocationConfig.title")}: ${label}`;
    }

    /**
     * The actor's body structure.
     * @returns The structure, or `undefined` for an incorporeal being.
     */
    #structure(): BodyStructure | undefined {
        return getActorBody(this.#actor.logic)?.structure;
    }

    /**
     * The owning part entity.
     * @returns The part, or `undefined` if not found.
     */
    #part(): BodyPart | undefined {
        return this.#structure()?.getPartByCode(this.#partKey);
    }

    /**
     * The persisted location data currently stored under {@link #key} within
     * its part, read live from the actor's DataModel so each render reflects the
     * persisted state.
     * @returns The location data, or `undefined` if not found.
     */
    #currentData(): BodyLocation.Data | undefined {
        const part = this.#part();
        if (!part) return undefined;
        const locations: BodyLocation.Data[] = (
            this.#structure()!.parent as any
        ).data.body.structure.parts[part.index].locations;
        return locations.find((l) => l.shortcode === this.#key);
    }

    /**
     * Build the render context from the persisted location: its fields, the
     * owning-part label, and the tier-select options with the location's current
     * values pre-selected.
     * @param _options - The render options (unused).
     * @returns The template context describing the current location.
     */
    protected override async _prepareContext(_options: any): Promise<any> {
        const loc = this.#currentData() ?? blankBodyLocation("", this.#key);
        const part = this.#part();
        return {
            loc,
            shortcode: loc.shortcode || this.#key,
            partLabel: part?.name || part?.shortcode || this.#partKey,
            bleedingOptions: Object.entries(BleedingSusceptibilityChoices).map(
                ([value, label]) => ({
                    value,
                    label,
                    selected: value === loc.bleedingSusceptibility,
                }),
            ),
            amputabilityOptions: Object.entries(AmputabilityChoices).map(
                ([value, label]) => ({
                    value,
                    label,
                    selected: value === loc.amputability,
                }),
            ),
        };
    }

    /**
     * Auto-save handler (`submitOnChange`): overlay the submitted fields onto
     * the stored location and write the owning part's whole `locations` array
     * back. A changed shortcode is validated for uniqueness among the part's
     * *other* locations; a rejected shortcode keeps the current one (warning the
     * user).
     *
     * @param this - The bound {@link BodyLocationConfig} instance.
     * @param _event - The submit event (unused).
     * @param _form - The form element (unused).
     * @param formData - The submitted form data.
     */
    static async #onSubmit(
        this: BodyLocationConfig,
        _event: Event,
        _form: HTMLFormElement,
        formData: any,
    ): Promise<void> {
        const submitted = foundry.utils.expandObject(formData.object) as any;
        const structure = this.#structure();
        const part = this.#part();
        const current = this.#currentData();
        if (!structure || !part || !current) return;

        const canonical: BodyLocation.Data[] = (structure.parent as any).data
            .body.structure.parts[part.index].locations;
        const siblings = canonical
            .filter((l) => l.shortcode !== this.#key)
            .map((l) => l.shortcode);
        const plan = planBodyShortcode(
            this.#key,
            String(submitted.shortcode ?? ""),
            siblings,
            "body location",
            "this part",
        );
        if (plan.error) sohl.log.uiWarn(plan.error);

        const prot = submitted.protectionBase ?? {};
        const merged: BodyLocation.Data = {
            ...current,
            name: String(submitted.name ?? "").trim() || current.name,
            shortcode: plan.shortcode,
            bleedingSusceptibility:
                isBleedingSusceptibility(submitted.bleedingSusceptibility) ?
                    submitted.bleedingSusceptibility
                :   current.bleedingSusceptibility,
            amputability:
                isAmputability(submitted.amputability) ?
                    submitted.amputability
                :   current.amputability,
            shockValue: Math.max(
                0,
                Math.round(Number(submitted.shockValue) || 0),
            ),
            probWeight: Math.max(
                0,
                Math.round(Number(submitted.probWeight) || 0),
            ),
            isStumble: !!submitted.isStumble,
            isFumble: !!submitted.isFumble,
            protectionBase: {
                blunt: Math.max(0, Math.round(Number(prot.blunt) || 0)),
                edged: Math.max(0, Math.round(Number(prot.edged) || 0)),
                piercing: Math.max(0, Math.round(Number(prot.piercing) || 0)),
                fire: Math.max(0, Math.round(Number(prot.fire) || 0)),
            },
        };
        const locations = canonical.map((l) =>
            l.shortcode === this.#key ? merged : l,
        );
        await this.#actor.update(
            structure.setPartFieldsUpdate([
                {
                    index: part.index,
                    changes: { locations } as Partial<BodyPart.Data>,
                },
            ]),
        );
        this.#key = plan.shortcode;
    }
}
