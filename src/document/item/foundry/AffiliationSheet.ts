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

import { SohlItem } from "@src/document/item/foundry/SohlItem";
import { SohlItemSheetBase } from "@src/document/item/foundry/SohlItemSheetBase";
import { buildRelationRows } from "@src/document/item/logic/item-sheet-view";
import { actorItemRefOptions } from "@src/document/item/logic/refOptions";
import { dialog } from "@src/core/FoundryHelpers";
import { toHTMLString } from "@src/utils/helpers";
import {
    AFFILIATION_STANDING,
    AffiliationStandingChoices,
    ITEM_KIND,
    isAffiliationStanding,
} from "@src/utils/constants";

/**
 * The add-relation prompt: which affiliation, and the standing toward it. The
 * template is a fixed string and the data is passed separately — never
 * interpolated into the source — so authored values cannot become markup.
 */
const ADD_RELATION_FORM = `<form id="add-relation">
    <div class="form-group">
        <label>{{localize "SOHL.Dialog.AddRelation.affiliation"}}</label>
        <div class="form-fields">
        {{#if options.length}}
            <select name="code">{{selectOptions options valueAttr="value" labelAttr="label" selected=""}}</select>
        {{else}}
            <input type="text" name="code" value=""
                placeholder="{{localize "SOHL.Common.shortcode"}}" />
        {{/if}}
        </div>
        <p class="hint">{{localize "SOHL.Dialog.AddRelation.affiliationTip"}}</p>
    </div>
    <div class="form-group">
        <label>{{localize "SOHL.Dialog.AddRelation.standing"}}</label>
        <div class="form-fields">
            <select name="standing">{{selectOptions standingChoices selected=standing localize=true}}</select>
        </div>
    </div>
</form>`;

/** @internal */
export class AffiliationSheet extends SohlItemSheetBase {
    /** @inheritDoc */
    static override PARTS = {
        ...super.PARTS,
        properties: {
            container: { classes: ["tab-body"], id: "tabs" },
            template: "systems/sohl/templates/item/affiliation-properties.hbs",
            scrollable: [""],
        },
    };

    /** @inheritDoc */
    static override DEFAULT_OPTIONS = {
        actions: {
            addRelation: AffiliationSheet._onAddRelation,
            deleteRelation: AffiliationSheet._onDeleteRelation,
        },
    };

    /**
     * The affiliations this one can name a standing toward: the *other*
     * affiliations on the owning actor. Empty for a world or compendium item,
     * where the add prompt falls back to free-text shortcode entry.
     *
     * @returns The candidate options, sorted by label.
     */
    protected get relationCandidates(): ReturnType<typeof actorItemRefOptions> {
        return actorItemRefOptions(
            this.document.actor?.logic,
            ITEM_KIND.AFFILIATION,
            undefined,
            (this.document.system as any).shortcode,
        );
    }

    /**
     * `data-action="addRelation"`: prompt for another affiliation and the
     * standing toward it, then record it. Nothing is written unless the user
     * confirms the dialog — the sheet offers, the user decides.
     *
     * @param _event - The triggering pointer event (unused).
     * @param _target - The clicked control (unused).
     */
    protected static async _onAddRelation(
        this: AffiliationSheet,
        _event: PointerEvent,
        _target: HTMLElement,
    ): Promise<void> {
        const options = this.relationCandidates;
        const result = await dialog({
            title: sohl.i18n.localize("SOHL.Dialog.AddRelation.title"),
            content: toHTMLString(ADD_RELATION_FORM),
            data: {
                options,
                standingChoices: AffiliationStandingChoices,
                standing: AFFILIATION_STANDING.ALIGNED,
            },
            buttons: [
                {
                    action: "ok",
                    label: sohl.i18n.localize(
                        "SOHL.Affiliation.Action.addRelation",
                    ),
                    default: true,
                },
            ],
            callback: (formData: PlainObject) => ({
                code: String(formData.code ?? "").trim(),
                standing: String(formData.standing ?? ""),
            }),
            rejectClose: false,
        });
        if (!result?.code) return;
        // The key becomes a segment of a Foundry dot-path update, so a code
        // carrying a `.` (or the `-=` deletion marker) would write somewhere
        // other than where it reads.
        if (/[.\s]/.test(result.code) || result.code.startsWith("-=")) {
            sohl.log.uiWarn(
                sohl.i18n.format("SOHL.Dialog.AddRelation.invalidCode", {
                    code: result.code,
                }),
            );
            return;
        }
        const standing =
            isAffiliationStanding(result.standing) ?
                result.standing
            :   AFFILIATION_STANDING.UNALIGNED;
        await this.document.update({
            [`system.relation.${result.code}`]: standing,
        });
        void this.render();
    }

    /**
     * `data-action="deleteRelation"`: drop one recorded standing, returning this
     * affiliation to the neutral default toward it.
     *
     * @param _event - The triggering pointer event (unused).
     * @param target - The clicked control, carrying `data-code`.
     */
    protected static async _onDeleteRelation(
        this: AffiliationSheet,
        _event: PointerEvent,
        target: HTMLElement,
    ): Promise<void> {
        const code = target.dataset.code;
        if (!code) return;
        // `-=key` is Foundry's remove-this-key update; writing the whole map
        // back would instead re-add every key it still holds.
        await this.document.update({ [`system.relation.-=${code}`]: null });
        void this.render();
    }

    /**
     * Augments the render context for the affiliation properties tab with the
     * affiliation's system fields (subtype, society, office, title, level) and
     * the rows of its standing-toward-others table.
     * @param context - The sheet render context to extend.
     * @param options - The sheet render options.
     * @returns The render context augmented with affiliation property data.
     */
    protected override async _preparePropertiesContext(
        context: foundry.applications.api.DocumentSheetV2.RenderContext<SohlItem>,
        options: foundry.applications.api.DocumentSheetV2.RenderOptions,
    ): Promise<
        foundry.applications.api.DocumentSheetV2.RenderContext<SohlItem>
    > {
        await super._preparePropertiesContext(context, options);
        const system = this.document.system as any;
        return Object.assign(context, {
            subType: system.subType,
            society: system.society,
            office: system.office,
            title: system.title,
            level: system.level,
            // Standing table (#1404): one row per recorded relation, named from
            // the actor's other affiliations where they resolve.
            relationRows: buildRelationRows(
                system.relation,
                this.relationCandidates.map((o) => ({
                    shortcode: o.value,
                    name: o.label,
                })),
            ),
            standingChoices: AffiliationStandingChoices,
        });
    }
}
