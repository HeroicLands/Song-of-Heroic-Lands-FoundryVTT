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
import type { BodyPart } from "@src/entity/body/BodyPart";
import type { BodyStructure } from "@src/entity/body/BodyStructure";
import { blankBodyPart } from "@src/entity/body/blankBodyPart";
import { planBodyShortcode } from "@src/entity/body/planBodyShortcode";
import { getActorBody } from "@src/document/actor/logic/BodyLogic";
import { BodyRoleChoices, isBodyRole } from "@src/utils/constants";

const BodyPartConfig_Base: any =
    foundry.applications.api.HandlebarsApplicationMixin(
        foundry.applications.api.ApplicationV2,
    );

/**
 * A small, sheet-like editor for a single {@link BodyPart} on a Being.
 *
 * A body part is embedded data (an element of the being's
 * `system.body.structure.parts` array, identified by its shortcode), not a
 * document, so it has no document sheet. This ApplicationV2 form edits one part
 * and persists via `actor.update()`.
 *
 * The form **auto-saves**: every field change submits (`submitOnChange`) and
 * writes back immediately, so there is no Save button and the window stays open.
 *
 * Patterned on {@link sohl.apps.foundry.StrikeModeConfig}. It edits only the
 * part's own scalar fields (name, shortcode, roles, flags, weight); the
 * part's child **locations** are managed from the Combat-tab tree and edited by
 * {@link sohl.apps.foundry.BodyLocationConfig}, and are preserved untouched here.
 *
 * @internal Foundry UI binding; not part of the public API.
 */
export class BodyPartConfig extends (BodyPartConfig_Base as typeof foundry.applications.api.ApplicationV2) {
    /** The actor owning the body part being edited. */
    #actor: SohlActor;
    /**
     * The shortcode (row key) the part is currently stored under. Tracked so an
     * auto-save after a shortcode edit targets the renamed element.
     */
    #key: string;

    /** @inheritDoc */
    static override DEFAULT_OPTIONS = {
        classes: ["sohl", "body-part-config", "standard-form"],
        window: {
            title: "SOHL.BodyPartConfig.title",
            icon: "fa-solid fa-person",
            contentClasses: ["standard-form"],
        },
        position: {
            width: 480,
            height: "auto" as const,
        },
        tag: "form" as const,
        form: {
            handler: BodyPartConfig.#onSubmit,
            closeOnSubmit: false,
            submitOnChange: true,
        },
    };

    static PARTS: Record<string, any> = {
        form: {
            template: "systems/sohl/templates/apps/body-part-config.hbs",
        },
    };

    /**
     * Open the editor bound to one body part on an actor.
     * @param actor - The being whose body part is edited.
     * @param shortcode - The part's shortcode (its row key within the structure).
     * @param options - Additional ApplicationV2 options.
     */
    constructor(
        actor: SohlActor,
        shortcode: string,
        options: PlainObject = {},
    ) {
        // Derive a stable, per-(actor, shortcode) id so editing two different
        // parts on the same being opens two distinct windows.
        const idSuffix = shortcode.replace(/[^\w-]/g, "-");
        super({ id: `body-part-config-${actor.id}-${idSuffix}`, ...options });
        this.#actor = actor;
        this.#key = shortcode;
    }

    /** The actor being edited (read-only accessor for callers/tests). */
    get actor(): SohlActor {
        return this.#actor;
    }

    /** @inheritDoc */
    override get title(): string {
        const part = this.#currentData();
        const label = part?.name || part?.shortcode || this.#key;
        return `${game.i18n.localize("SOHL.BodyPartConfig.title")}: ${label}`;
    }

    /**
     * The actor's body structure.
     * @returns The structure, or `undefined` for an incorporeal being.
     */
    #structure(): BodyStructure | undefined {
        return getActorBody(this.#actor.logic)?.structure;
    }

    /**
     * The persisted part data currently stored under {@link #key}, read live
     * from the actor's DataModel so each render reflects the persisted state
     * (including the raw `probWeight`, which the {@link BodyPart} entity exposes only as a derived modifier).
     * @returns The part data, or `undefined` if not found.
     */
    #currentData(): BodyPart.Data | undefined {
        const structure = this.#structure();
        const index = structure?.getPartByCode(this.#key)?.index;
        if (structure === undefined || index === undefined) return undefined;
        return (structure.parent as any).data.body.structure.parts[index] as
            | BodyPart.Data
            | undefined;
    }

    /**
     * Build the render context from the persisted part: its fields and the
     * roles multi-select options with the part's current roles pre-selected.
     * @param _options - The render options (unused).
     * @returns The template context describing the current part.
     */
    protected override async _prepareContext(_options: any): Promise<any> {
        const part =
            this.#currentData() ?? blankBodyPart(this.#actor.name, this.#key);
        const roles = part.roles ?? [];
        return {
            part,
            shortcode: part.shortcode || this.#key,
            roleOptions: Object.entries(BodyRoleChoices).map(
                ([value, label]) => ({
                    value,
                    label,
                    selected: roles.includes(value),
                }),
            ),
        };
    }

    /**
     * Auto-save handler (`submitOnChange`): overlay the submitted scalar fields
     * onto the stored part and write it back. The part's held item and legacy
     * flags are preserved (a
     * {@link BodyStructure.setPartFieldsUpdate | whole-array field merge}). A
     * changed shortcode is validated for uniqueness among the being's *other*
     * parts; a rejected shortcode keeps the current one (warning the user). An
     * accepted rename also re-points the part's hit locations, which link to it
     * by shortcode ({@link BodyStructure.repointLocationsUpdate}).
     *
     * @param this - The bound {@link BodyPartConfig} instance.
     * @param _event - The submit event (unused).
     * @param _form - The form element (unused).
     * @param formData - The submitted form data.
     */
    static async #onSubmit(
        this: BodyPartConfig,
        _event: Event,
        _form: HTMLFormElement,
        formData: any,
    ): Promise<void> {
        const submitted = foundry.utils.expandObject(formData.object) as any;
        const structure = this.#structure();
        const part = structure?.getPartByCode(this.#key);
        if (!structure || !part) return;

        const siblings = structure.parts
            .filter((p) => p.shortcode !== this.#key)
            .map((p) => p.shortcode);
        const plan = planBodyShortcode(
            this.#key,
            String(submitted.shortcode ?? ""),
            siblings,
            "body part",
            "this body",
        );
        if (plan.error) sohl.log.uiWarn(plan.error);

        // A multi-select yields an array, a single string, or nothing; keep only
        // valid role values.
        const rawRoles = submitted.roles;
        const roles = (
            Array.isArray(rawRoles) ? rawRoles
            : rawRoles ? [rawRoles]
            : []).filter((r: unknown): r is string => isBodyRole(r));

        const changes: Partial<BodyPart.Data> = {
            name: String(submitted.name ?? "").trim() || part.name,
            shortcode: plan.shortcode,
            roles,
            probWeight: Math.max(0, Number(submitted.probWeight) || 0),
            permanentImpairment: Math.min(
                0,
                Math.round(Number(submitted.permanentImpairment) || 0),
            ),
            canHoldItem: !!submitted.canHoldItem,
            permanentlyUnusable: !!submitted.permanentlyUnusable,
        };
        // The field write and the location re-point touch different arrays
        // (`parts` / `locations`), so they merge into one payload by spread.
        await this.#actor.update({
            ...structure.setPartFieldsUpdate([{ index: part.index, changes }]),
            ...structure.repointLocationsUpdate(this.#key, plan.shortcode),
        });
        this.#key = plan.shortcode;
    }
}
