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
import type { BodyZone } from "@src/entity/body/BodyZone";
import type { BodyStructure } from "@src/entity/body/BodyStructure";
import { blankBodyZone } from "@src/entity/body/blankBodyZone";
import { planBodyShortcode } from "@src/entity/body/planBodyShortcode";
import { getActorBody } from "@src/document/actor/logic/BodyLogic";
import { formatZoneRange } from "@src/document/actor/logic/being-sheet-view";

const BodyZoneConfig_Base: any =
    foundry.applications.api.HandlebarsApplicationMixin(
        foundry.applications.api.ApplicationV2,
    );

/**
 * A small, sheet-like editor for a single {@link BodyZone} on a Being.
 *
 * A body zone is embedded data (an element of the being's
 * `system.body.structure.zones` array, identified by its shortcode), not a
 * document, so it has no document sheet. This ApplicationV2 form edits one zone
 * and persists via `actor.update()`.
 *
 * The form **auto-saves**: every field change submits (`submitOnChange`) and
 * writes back immediately, so there is no Save button and the window stays open.
 *
 * It edits only the zone's own fields (name, shortcode, weight); the zone's
 * child **parts** are managed from the Combat-tab tree and edited by
 * {@link sohl.apps.foundry.BodyPartConfig}, and are preserved untouched here —
 * including across a shortcode rename, which re-points them (#780).
 *
 * @internal Foundry UI binding; not part of the public API.
 */
export class BodyZoneConfig extends (BodyZoneConfig_Base as typeof foundry.applications.api.ApplicationV2) {
    /** The actor owning the body zone being edited. */
    #actor: SohlActor;
    /**
     * The shortcode (row key) the zone is currently stored under. Tracked so an
     * auto-save after a shortcode edit targets the renamed element.
     */
    #key: string;

    /** @inheritDoc */
    static override DEFAULT_OPTIONS = {
        classes: ["sohl", "body-zone-config", "standard-form"],
        window: {
            title: "SOHL.BodyZoneConfig.title",
            icon: "fa-solid fa-diagram-project",
            contentClasses: ["standard-form"],
        },
        position: {
            width: 420,
            height: "auto" as const,
        },
        tag: "form" as const,
        form: {
            handler: BodyZoneConfig.#onSubmit,
            closeOnSubmit: false,
            submitOnChange: true,
        },
    };

    static PARTS: Record<string, any> = {
        form: {
            template: "systems/sohl/templates/apps/body-zone-config.hbs",
        },
    };

    /**
     * Open the editor bound to one body zone on an actor.
     * @param actor - The being whose body zone is edited.
     * @param shortcode - The zone's shortcode (its row key within the structure).
     * @param options - Additional ApplicationV2 options.
     */
    constructor(
        actor: SohlActor,
        shortcode: string,
        options: PlainObject = {},
    ) {
        // Derive a stable, per-(actor, shortcode) id so editing two different
        // zones on the same being opens two distinct windows.
        const idSuffix = shortcode.replace(/[^\w-]/g, "-");
        super({ id: `body-zone-config-${actor.id}-${idSuffix}`, ...options });
        this.#actor = actor;
        this.#key = shortcode;
    }

    /** The actor being edited (read-only accessor for callers/tests). */
    get actor(): SohlActor {
        return this.#actor;
    }

    /** @inheritDoc */
    override get title(): string {
        const zone = this.#currentData();
        const label = zone?.name || zone?.shortcode || this.#key;
        return `${game.i18n.localize("SOHL.BodyZoneConfig.title")}: ${label}`;
    }

    /**
     * The actor's body structure.
     * @returns The structure, or `undefined` for an incorporeal being.
     */
    #structure(): BodyStructure | undefined {
        return getActorBody(this.#actor.logic)?.structure;
    }

    /**
     * The persisted zone data currently stored under {@link #key}, read live
     * from the actor's DataModel so each render reflects the persisted state.
     * @returns The zone data, or `undefined` if not found.
     */
    #currentData(): BodyZone.Data | undefined {
        const structure = this.#structure();
        const index = structure?.getZoneByCode(this.#key)?.index;
        if (structure === undefined || index === undefined) return undefined;
        return (structure.parent as any).data.body.structure.zones[index] as
            BodyZone.Data | undefined;
    }

    /**
     * Build the render context from the persisted zone: its fields, the run of
     * zone numbers its weight currently buys, and how many parts it holds.
     * @param _options - The render options (unused).
     * @returns The template context describing the current zone.
     */
    protected override async _prepareContext(_options: any): Promise<any> {
        const zone =
            this.#currentData() ?? blankBodyZone(this.#actor.name, this.#key);
        const live = this.#structure()?.getZoneByCode(this.#key);
        return {
            zone,
            shortcode: zone.shortcode || this.#key,
            zoneRange: formatZoneRange(live?.zoneNumbers ?? []),
            partCount: live?.parts.length ?? 0,
        };
    }

    /**
     * Auto-save handler (`submitOnChange`): overlay the submitted fields onto
     * the stored zone and write it back as a whole-array replacement. A changed
     * shortcode is validated for uniqueness among the being's *other* zones; a
     * rejected shortcode keeps the current one (warning the user). An accepted
     * rename also re-points the zone's parts, which link to it by shortcode
     * ({@link BodyStructure.repointPartsUpdate}).
     *
     * @param this - The bound {@link BodyZoneConfig} instance.
     * @param _event - The submit event (unused).
     * @param _form - The form element (unused).
     * @param formData - The submitted form data.
     */
    static async #onSubmit(
        this: BodyZoneConfig,
        _event: Event,
        _form: HTMLFormElement,
        formData: any,
    ): Promise<void> {
        const submitted = foundry.utils.expandObject(formData.object) as any;
        const structure = this.#structure();
        const zone = structure?.getZoneByCode(this.#key);
        if (!structure || !zone) return;

        const siblings = structure.zones
            .filter((z) => z.shortcode !== this.#key)
            .map((z) => z.shortcode);
        const plan = planBodyShortcode(
            this.#key,
            String(submitted.shortcode ?? ""),
            siblings,
            "body zone",
            "this body",
        );
        if (plan.error) sohl.log.uiWarn(plan.error);

        const changes: Partial<BodyZone.Data> = {
            name: String(submitted.name ?? "").trim() || zone.name,
            shortcode: plan.shortcode,
            probWeight: Math.max(
                0,
                Math.round(Number(submitted.probWeight) || 0),
            ),
        };
        // The field write and the part re-point touch different arrays
        // (`zones` / `parts`), so they merge into one payload by spread.
        await this.#actor.update({
            ...structure.setZoneFieldsUpdate([{ index: zone.index, changes }]),
            ...structure.repointPartsUpdate(this.#key, plan.shortcode),
        });
        this.#key = plan.shortcode;
    }
}
