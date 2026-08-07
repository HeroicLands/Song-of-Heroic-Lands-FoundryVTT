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

import {
    SohlActorBaseLogic,
    type SohlActorData,
    type SohlActorLogic,
} from "@src/document/actor/logic/SohlActorBaseLogic";
import {
    collectSharedGear,
    type SharedGearEntry,
} from "@src/document/actor/logic/cohort-shared-gear";
import {
    healthBand as healthBandFor,
    healthBandLabel as healthBandLabelFor,
    healthPercent,
    type HealthBand,
} from "@src/document/actor/logic/health";
import type { GearLogic } from "@src/document/item/logic/GearLogic";
import { dialog, fvttActorByRef } from "@src/core/FoundryHelpers";
import { toHTMLString } from "@src/utils/helpers";
import type { SohlAction } from "@src/entity/action/SohlAction";
import type { SohlActionContext } from "@src/entity/action/SohlActionContext";
import {
    ACTION_SUBTYPE,
    COHORT_MEMBER_ROLE,
    CohortMemberRoleChoices,
    SOHL_ACTION_SCOPE,
    SOHL_CONTEXT_MENU_SORT_GROUP,
    isCohortMemberRole,
    isGearKind,
    type CohortMemberRole,
} from "@src/utils/constants";

/**
 * One row of a cohort's membership, as the Members tab lists it: the stored
 * entry (its `shortcodeOrUuid` handle and role) joined to whatever the handle
 * resolves to.
 *
 * A row is produced for **every** stored member, including one whose actor no
 * longer resolves — a cohort must be able to show, and remove, a member it can
 * no longer see. Such a row is named by its raw handle and reports
 * `isResolved: false`.
 */
export interface CohortMemberRow {
    /** The stored handle: a `system.shortcode`, or a UUID for a Token Actor. */
    ref: string;
    /** The member's role within the cohort. */
    role: string;
    /** Localization key for {@link role}. */
    roleLabel: string;
    /** The resolved actor's name, falling back to the raw handle. */
    name: string;
    /** The resolved actor's portrait, or `""`. */
    img: string;
    /** The resolved actor's UUID, or `null` when it does not resolve. */
    uuid: string | null;
    /** Whether the handle resolved to an actor this client can see. */
    isResolved: boolean;
    /** Whether this member leads the cohort. */
    isLeader: boolean;
    /**
     * The member's health as a whole percentage of its maximum (`0…100`), or
     * `undefined` when the handle does not resolve or the actor exposes no
     * health.
     */
    healthPct: number | undefined;
    /**
     * The qualitative band for {@link healthPct} (Excellent…Dead), or
     * `undefined` when there is no health to band. An internal token — display
     * {@link healthBandLabel} instead.
     */
    healthBand: HealthBand | undefined;
    /**
     * Localization key for {@link healthBand}, or `undefined` when there is no
     * band. Localized at render, as {@link CohortMemberRow.roleLabel} is.
     */
    healthBandLabel: string | undefined;
}

/**
 * A group of individuals acting as a unit.
 *
 * A Cohort represents multiple actors treated as a single entity for movement,
 * combat, and other mechanics. Examples include a party of adventurers, a squad
 * of soldiers, a pack of animals, or a ship's crew section.
 *
 * Each member names its actor by a single handle — a `shortcode` for a world or
 * compendium actor, or a **UUID** for a Token Actor (several wolves sharing one
 * base actor but tracked separately cannot be told apart by shortcode). Members
 * also have a {@link sohl.utils.COHORT_MEMBER_ROLE | role} within the cohort.
 *
 * One member may be the cohort's **leader**, named by
 * {@link CohortData.leaderCode}.
 *
 * When placed on a scene, a Cohort can appear as either a single group token
 * or individual tokens per member. Single-token cohorts cannot participate
 * in combat but are useful for representing group movement on large-scale maps.
 *
 * @typeParam TData - The Cohort data interface.
 */
export class CohortLogic<
    TData extends CohortData = CohortData,
> extends SohlActorBaseLogic<TData> {
    /* --------------------------------------------- */
    /* Membership                                    */
    /* --------------------------------------------- */

    /**
     * The logic of every member actor this cohort can resolve.
     *
     * Each {@link CohortData.members} entry names its world actor by
     * `shortcodeOrUuid` — a `system.shortcode` for a world or compendium actor,
     * a UUID for an unlinked Token Actor — resolved through
     * {@link fvttActorByRef}. Entries that no longer
     * resolve (the actor was deleted, or this client cannot see it) are simply
     * absent; a cohort with a stale member still lists the rest.
     *
     * @returns One logic per resolvable member, in `members` order.
     */
    get memberLogics(): SohlActorLogic<any>[] {
        const logics: SohlActorLogic<any>[] = [];
        for (const member of this.data.members) {
            const actor = fvttActorByRef(member.shortcodeOrUuid);
            const logic = actor?.logic as SohlActorLogic<any> | undefined;
            if (logic) logics.push(logic);
        }
        return logics;
    }

    /**
     * The cohort's membership as display rows — one per stored entry, in
     * `members` order, each joined to the actor its handle resolves to.
     *
     * This is the single seam the Members tab, the leader readout, and the
     * member-management actions all read: a member is named by its actor where
     * that actor resolves, and by its raw handle where it does not (see
     * {@link CohortMemberRow}).
     *
     * @returns One row per member entry.
     */
    get memberRows(): CohortMemberRow[] {
        const leaderCode = this.leaderCode;
        return this.data.members.map((member) => {
            const ref = member.shortcodeOrUuid;
            const actor = fvttActorByRef(ref);
            const healthPct = healthPercent(actor?.logic?.data?.health);
            const band =
                healthPct === undefined ? undefined : healthBandFor(healthPct);
            return {
                ref,
                role: member.role,
                roleLabel:
                    (CohortMemberRoleChoices as Record<string, string>)[
                        member.role
                    ] ?? "",
                name: actor?.name ?? ref,
                img: actor?.img ?? "",
                uuid: actor?.uuid ?? null,
                isResolved: !!actor,
                isLeader: ref === leaderCode,
                healthPct,
                healthBand: band,
                healthBandLabel:
                    band === undefined ? undefined : healthBandLabelFor(band),
            };
        });
    }

    /**
     * The handle of the member leading this cohort, or `null` when it has no
     * leader.
     *
     * The leader is always **one of the members**: a stored
     * {@link CohortData.leaderCode} that names nobody in the current list —
     * the leader was removed, or the handle was never a member — reads as no
     * leader at all, rather than as a stale name the sheet would go on
     * displaying.
     *
     * @returns The leading member's handle, or `null`.
     */
    get leaderCode(): string | null {
        const code = this.data.leaderCode;
        if (!code) return null;
        return this.data.members.some((m) => m.shortcodeOrUuid === code) ?
                code
            :   null;
    }

    /**
     * The row of the member leading this cohort, or `undefined` when it has no
     * leader. See {@link leaderCode} for what "no leader" covers.
     *
     * @returns The leader's member row, or `undefined`.
     */
    get leader(): CohortMemberRow | undefined {
        return this.memberRows.find((row) => row.isLeader);
    }

    /* --------------------------------------------- */
    /* Shared gear                                   */
    /* --------------------------------------------- */

    /**
     * Every reference by which a gear item may name **this** cohort in its
     * `system.sharedWithCohortIds` — the cohort's `shortcode`, its document id,
     * and its UUID. The inverse of
     * {@link sohl.document.item.logic.GearLogic.sharedWithCohorts}.
     *
     * @returns The non-empty reference keys identifying this cohort.
     */
    get sharingRefs(): string[] {
        return [this.data.shortcode, this.data.id, this.data.uuid].filter(
            (ref): ref is string => !!ref,
        );
    }

    /**
     * The gear this cohort's members have shared with it (issue #76).
     *
     * A cohort carries nothing of its own: this walks each resolvable member and
     * collects the gear whose sharing list names this cohort, pairing every item
     * with the member that actually carries it. The result is **read-only** — the
     * item stays on its custodian, and it is edited there.
     *
     * @returns One entry per shared item, ordered by carrier then item name.
     */
    get sharedGear(): SharedGearEntry<GearLogic>[] {
        const carriers = this.memberLogics.map((logic) => ({
            name: logic.data.name,
            uuid: logic.data.uuid,
            gear: logic.allLogics.filter((item): item is GearLogic =>
                isGearKind(item.data.kind),
            ),
        }));
        return collectSharedGear(carriers, this.sharingRefs);
    }

    /* --------------------------------------------- */
    /* Array update helpers                          */
    /* --------------------------------------------- */

    /**
     * Build an `update()` payload that appends a member to {@link CohortData.members}.
     *
     * @param member - The member entry to add.
     * @returns An update payload (does not itself persist the change).
     */
    addMemberUpdate(member: CohortData["members"][number]): PlainObject {
        return {
            "system.members": [...this.data.members, member],
        };
    }

    /**
     * Build an `update()` payload that removes the member with the given shortcode or UUID
     * from {@link CohortData.members}.
     *
     * Removing the **leader** also clears {@link CohortData.leaderCode} in the
     * same payload: a leader who is no longer a member is not a leader, and
     * leaving the code behind would make the cohort silently re-acquire that
     * leader if the same handle were ever added back.
     *
     * @param shortcodeOrUuid - The shortcode or UUID of the member to remove.
     * @returns An update payload (does not itself persist the change).
     */
    removeMemberUpdate(shortcodeOrUuid: string): PlainObject {
        const update: PlainObject = {
            "system.members": this.data.members.filter(
                (m) => m.shortcodeOrUuid !== shortcodeOrUuid,
            ),
        };
        if (this.data.leaderCode === shortcodeOrUuid)
            update["system.leaderCode"] = null;
        return update;
    }

    /**
     * Build an `update()` payload that makes the named member this cohort's
     * leader — or clears the leader, when the given handle is already leading
     * (the control is a toggle) or is `null`.
     *
     * @param shortcodeOrUuid - The member to promote, or `null` to clear.
     * @returns An update payload, or `undefined` when the handle names nobody
     *   in the member list (nothing to promote).
     */
    setLeaderUpdate(shortcodeOrUuid: string | null): PlainObject | undefined {
        if (shortcodeOrUuid == null) return { "system.leaderCode": null };
        if (
            !this.data.members.some(
                (m) => m.shortcodeOrUuid === shortcodeOrUuid,
            )
        )
            return undefined;
        return {
            "system.leaderCode":
                this.leaderCode === shortcodeOrUuid ? null : shortcodeOrUuid,
        };
    }

    /* --------------------------------------------- */
    /* Intrinsic Actions                             */
    /* --------------------------------------------- */

    /**
     * Define and return all intrinsic actions for this logic type.
     *
     * Membership is managed by three actions rather than by sheet-only
     * handlers, so the Members-tab controls and the Actions tab (and any macro
     * or module) drive one implementation — the same seam gear's
     * `toggleCarried` uses. Each one acts only when a human invokes it.
     *
     * @returns The cohort's intrinsic action definitions.
     */
    static override defineIntrinsicActions(): Partial<SohlAction.Data>[] {
        return [
            ...SohlActorBaseLogic.defineIntrinsicActions(),
            {
                shortcode: "addMember",
                subType: ACTION_SUBTYPE.INTRINSIC,
                title: "SOHL.Cohort.Action.addMember",
                scope: SOHL_ACTION_SCOPE.SELF,
                iconFAClass: "fa-solid fa-user-plus",
                executor: "addMember",
                visible: "true",
                group: SOHL_CONTEXT_MENU_SORT_GROUP.GENERAL,
            },
            {
                shortcode: "removeMember",
                subType: ACTION_SUBTYPE.INTRINSIC,
                title: "SOHL.Cohort.Action.removeMember",
                scope: SOHL_ACTION_SCOPE.SELF,
                iconFAClass: "fa-solid fa-user-minus",
                executor: "removeMember",
                visible: "true",
                group: SOHL_CONTEXT_MENU_SORT_GROUP.GENERAL,
            },
            {
                shortcode: "toggleLeader",
                subType: ACTION_SUBTYPE.INTRINSIC,
                title: "SOHL.Cohort.Action.toggleLeader",
                scope: SOHL_ACTION_SCOPE.SELF,
                iconFAClass: "fa-solid fa-chess-king",
                executor: "toggleLeader",
                visible: "true",
                group: SOHL_CONTEXT_MENU_SORT_GROUP.GENERAL,
            },
        ];
    }

    /**
     * Add a member to this cohort.
     *
     * Intrinsic-action executor for the `addMember` action. Asks for the
     * member's handle — a **shortcode** (a world or compendium actor) or a
     * **UUID** (a Token Actor: a band of orcs are each unlinked actors of one
     * common orc world actor, which no shortcode can tell apart) — and the role
     * it takes in the cohort. Anything already in `context.scope` pre-fills the
     * dialog rather than replacing it.
     *
     * The handle must resolve to an **Actor** this client can see, and must not
     * already be a member; otherwise nothing is added and the user is told why.
     *
     * @param context - The action context; `context.scope.shortcodeOrUuid` and
     *   `context.scope.role` pre-fill the dialog, and `skipDialog` (with a
     *   handle already supplied) adds without asking.
     * @returns Resolves once the member is added, or immediately if not.
     */
    async addMember(context: SohlActionContext): Promise<void> {
        const scope = (context.scope ?? {}) as PlainObject;
        let ref = String(scope.shortcodeOrUuid ?? "").trim();
        let role: CohortMemberRole =
            isCohortMemberRole(scope.role) ?
                scope.role
            :   COHORT_MEMBER_ROLE.MEMBER;

        // Prefer asking: the handle is author-typed, so the dialog is where it
        // gets checked. Only a caller that already knows both — and says so —
        // skips it.
        if (!context.skipDialog || !ref) {
            const answer = (await dialog({
                title: sohl.i18n.localize("SOHL.Cohort.Members.add.title"),
                content: toHTMLString(
                    `<div class="form-group">` +
                        `<label>{{refLabel}}</label>` +
                        `<input type="text" name="shortcodeOrUuid" value="{{ref}}" autofocus />` +
                        `</div>` +
                        `<p class="hint">{{refHint}}</p>` +
                        `<div class="form-group">` +
                        `<label>{{roleLabel}}</label>` +
                        `<select name="role">` +
                        `{{#each roles}}<option value="{{value}}" {{#if selected}}selected{{/if}}>{{label}}</option>{{/each}}` +
                        `</select>` +
                        `</div>`,
                ),
                data: {
                    ref,
                    refLabel: sohl.i18n.localize(
                        "SOHL.Cohort.Members.add.refLabel",
                    ),
                    refHint: sohl.i18n.localize(
                        "SOHL.Cohort.Members.add.refHint",
                    ),
                    roleLabel: sohl.i18n.localize(
                        "SOHL.Cohort.FIELDS.members.role.label",
                    ),
                    roles: Object.entries(CohortMemberRoleChoices).map(
                        ([value, key]) => ({
                            value,
                            label: sohl.i18n.localize(key),
                            selected: value === role,
                        }),
                    ),
                },
                buttons: [
                    {
                        action: "add",
                        label: sohl.i18n.localize(
                            "SOHL.Cohort.Members.add.confirm",
                        ),
                        icon: "fa-solid fa-user-plus",
                        default: true,
                    },
                    {
                        action: "cancel",
                        label: sohl.i18n.localize(
                            "SOHL.Cohort.Members.add.cancel",
                        ),
                    },
                ],
                callback: (formData: PlainObject, action: string) =>
                    action === "add" ? formData : undefined,
                rejectClose: false,
            })) as PlainObject | undefined | null;
            if (!answer) return;
            ref = String(answer.shortcodeOrUuid ?? "").trim();
            role =
                isCohortMemberRole(answer.role) ?
                    answer.role
                :   COHORT_MEMBER_ROLE.MEMBER;
        }

        if (!ref) return;
        if (this.data.members.some((m) => m.shortcodeOrUuid === ref)) {
            sohl.log.uiWarn(
                sohl.i18n.format("SOHL.Cohort.Members.add.duplicate", { ref }),
            );
            return;
        }
        // `fvttActorByRef` yields an Actor or nothing — a UUID naming some
        // other document resolves to `undefined` — so this one check covers
        // both "no such document" and "that is not an actor".
        if (!fvttActorByRef(ref)) {
            sohl.log.uiWarn(
                sohl.i18n.format("SOHL.Cohort.Members.add.notAnActor", { ref }),
            );
            return;
        }

        await this.data.update(
            this.addMemberUpdate({ shortcodeOrUuid: ref, role }),
        );
    }

    /**
     * Remove a member from this cohort, after confirming.
     *
     * Intrinsic-action executor for the `removeMember` action. With no handle
     * in scope (invoked from the Actions tab rather than from a member's row)
     * it first asks which member to remove. Removing the leader also clears the
     * leader — see {@link removeMemberUpdate}.
     *
     * Only the cohort's membership entry is removed: the member's actor, and
     * everything on it, is untouched.
     *
     * @param context - The action context; `context.scope.shortcodeOrUuid`
     *   names the member to remove.
     * @returns Resolves once the member is removed, or immediately if not.
     */
    async removeMember(context: SohlActionContext): Promise<void> {
        const scope = (context.scope ?? {}) as PlainObject;
        let ref = String(scope.shortcodeOrUuid ?? "").trim();
        if (!ref) {
            const picked = await this._pickMember(
                "SOHL.Cohort.Members.remove.title",
                "SOHL.Cohort.Members.remove.prompt",
                "SOHL.Cohort.Members.remove.confirm",
            );
            if (!picked) return;
            ref = picked;
        }

        const row = this.memberRows.find((r) => r.ref === ref);
        if (!row) return;

        if (!context.skipDialog) {
            const confirmed = await dialog({
                title: sohl.i18n.localize("SOHL.Cohort.Members.remove.title"),
                content: toHTMLString(`<p>{{warning}}</p>`),
                data: {
                    warning: sohl.i18n.format(
                        "SOHL.Cohort.Members.remove.warning",
                        { name: row.name },
                    ),
                },
                buttons: [
                    {
                        action: "yes",
                        label: sohl.i18n.localize(
                            "SOHL.Cohort.Members.remove.confirm",
                        ),
                        icon: "fa-solid fa-trash",
                    },
                    {
                        action: "no",
                        label: sohl.i18n.localize(
                            "SOHL.Cohort.Members.remove.cancel",
                        ),
                        default: true,
                    },
                ],
                callback: (_formData: PlainObject, action: string) =>
                    action === "yes",
                rejectClose: false,
            });
            if (confirmed !== true) return;
        }

        await this.data.update(this.removeMemberUpdate(ref));
    }

    /**
     * Make a member this cohort's leader — or, when that member already leads
     * it, stand them down so the cohort has no leader.
     *
     * Intrinsic-action executor for the `toggleLeader` action. Invoked from a
     * member's row the handle rides in scope and the toggle is immediate: it is
     * an explicit, single-click, self-reversing choice by the cohort's owner,
     * so a confirmation would only be noise. Invoked from the Actions tab, with
     * no handle, it asks which member to promote.
     *
     * @param context - The action context; `context.scope.shortcodeOrUuid`
     *   names the member to promote or stand down.
     * @returns Resolves once the leader is set or cleared, or immediately if not.
     */
    async toggleLeader(context: SohlActionContext): Promise<void> {
        const scope = (context.scope ?? {}) as PlainObject;
        let ref = String(scope.shortcodeOrUuid ?? "").trim();
        if (!ref) {
            const picked = await this._pickMember(
                "SOHL.Cohort.Members.leader.title",
                "SOHL.Cohort.Members.leader.prompt",
                "SOHL.Cohort.Members.leader.confirm",
            );
            if (!picked) return;
            ref = picked;
        }

        const update = this.setLeaderUpdate(ref);
        if (!update) return;
        await this.data.update(update);
    }

    /**
     * Ask which member to act on, listing the cohort's membership by name.
     *
     * The member names ride in the template `data`, where Handlebars escapes
     * them — never interpolated into the template source (rule #10).
     *
     * @param titleKey - Localization key for the dialog title.
     * @param promptKey - Localization key for the prompt line.
     * @param confirmKey - Localization key for the confirming button.
     * @returns The chosen member's handle, or `undefined` if there is nothing
     *   to choose or the user dismissed the dialog.
     */
    private async _pickMember(
        titleKey: string,
        promptKey: string,
        confirmKey: string,
    ): Promise<string | undefined> {
        const rows = this.memberRows;
        if (!rows.length) {
            sohl.log.uiWarn(
                sohl.i18n.localize("SOHL.Cohort.Members.empty.warn"),
            );
            return undefined;
        }
        const picked = await dialog({
            title: sohl.i18n.localize(titleKey),
            content: toHTMLString(
                `<p>{{prompt}}</p>` +
                    `<select name="shortcodeOrUuid">` +
                    `{{#each members}}<option value="{{ref}}">{{name}}</option>{{/each}}` +
                    `</select>`,
            ),
            data: {
                prompt: sohl.i18n.localize(promptKey),
                members: rows.map((row) => ({ ref: row.ref, name: row.name })),
            },
            buttons: [
                {
                    action: "select",
                    label: sohl.i18n.localize(confirmKey),
                    icon: "fa-solid fa-check",
                    default: true,
                },
                {
                    action: "cancel",
                    label: sohl.i18n.localize(
                        "SOHL.Cohort.Members.picker.cancel",
                    ),
                },
            ],
            callback: (formData: PlainObject, action: string) =>
                action === "select" ?
                    String(formData?.shortcodeOrUuid ?? "")
                :   undefined,
            rejectClose: false,
        });
        return picked || undefined;
    }

    /* --------------------------------------------- */
    /* Common Lifecycle Actions                      */
    /* --------------------------------------------- */

    /** @inheritdoc */
    override initialize(): void {
        super.initialize();
    }

    /** @inheritdoc */
    override evaluate(): void {
        super.evaluate();
    }

    /** @inheritdoc */
    override finalize(): void {
        super.finalize();
    }
}

/**
 * Persisted data model for a {@link CohortLogic | Cohort} actor.
 *
 * @typeParam TLogic - The logic class bound to this data.
 * @remarks The shape of `system` on a `cohort` actor — i.e. `actor.system` (equivalently `actor.logic.data`) when `actor.type === "cohort"`. The backing DataModel implements this interface.
 */
export interface CohortData<
    TLogic extends SohlActorLogic<CohortData> = SohlActorLogic<any>,
> extends SohlActorData<TLogic> {
    /**
     * The `shortcodeOrUuid` of the member leading this cohort, or `null` for no
     * leader. A code naming nobody in {@link members} is no leader either — read
     * it through {@link CohortLogic.leaderCode}, never raw.
     */
    leaderCode: string | null;
    /** The individuals that make up this cohort */
    members: {
        /**
         * How this member's actor is found: its `system.shortcode` (a world or
         * compendium actor) or a UUID (a Token Actor, which no shortcode can
         * reliably identify). Resolved through {@link fvttActorByRef}.
         */
        shortcodeOrUuid: string;
        /** This member's role within the cohort (e.g. leader, follower). */
        role: string;
    }[];
}
