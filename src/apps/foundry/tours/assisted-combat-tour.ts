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

import { ACTOR_KIND, ITEM_KIND, TRAUMA_SUBTYPE } from "@src/utils/constants";
import { getActorBody } from "@src/document/actor/logic/BodyLogic";
import { TourGate } from "@src/entity/tour";
import { SohlTour, type SohlTourConfig, type SohlTourStep } from "../SohlTour";

/** The namespaced identity of the Assisted Combat tour. */
export const ASSISTED_COMBAT_TOUR = Object.freeze({
    namespace: "sohl",
    id: "assisted-combat",
});

/**
 * The archetype shortcodes the tour's gated gear steps recognize — the
 * `system.shortcode` values (reduced to their {@link shortcodeBase | base}) that
 * the create-dialog stamps onto an instance seeded from each content archetype.
 * Matching on shortcode — not name — lets a gate confirm the user picked the
 * *correct archetype* while still letting them rename their gear.
 *
 * The four cover the shapes the arm rule needs: a **one-handed** weapon (the star
 * of the attack/impact demo), a **two-handed** weapon, a **bow** (whose ranged
 * strike mode needs two limbs — the arm-rule teacher), and a **shield**.
 */
const ARCHETYPE_SHORTCODE = Object.freeze({
    broadsword: "brdswd",
    battlesword: "batlswd",
    longbow: "lbw",
    roundshield: "rndsh",
});

/**
 * Reduce a `system.shortcode` to its archetype base: lower-cased, non-alphanumerics
 * stripped (mirroring {@link sohl.utils.slugifyShortcode}), and a trailing
 * uniqueness/size suffix removed so a second `brdswd2` — or any `LBw###` longbow —
 * still matches its base.
 * @param shortcode - The raw `system.shortcode` (may be undefined).
 * @returns The comparable base token.
 */
function shortcodeBase(shortcode: unknown): string {
    return String(shortcode ?? "")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "")
        .replace(/[0-9]+$/, "");
}

/**
 * The Being the tour coaches: the first Being the current user owns. Unlike the
 * Character Creation tour, Assisted Combat does **not** create the character — it
 * *assumes a populated Being already exists* (Basic Folk, a compendium character
 * like Áldrik Hárvenar, or one built by the Character Creation tour). The tour is
 * single-actor; its first `prepare` step gates on this returning a Being, so the
 * later sheet steps always have a subject.
 * @returns The first owned Being actor, or `undefined`.
 */
function currentBeing(): any {
    const actors = (game as any).actors?.contents ?? [];
    return actors.find((a: any) => a.type === ACTOR_KIND.BEING && a.isOwner);
}

/**
 * Whether the current Being carries at least one gear item of `kind` whose
 * archetype base shortcode is `base` — the proxy a gated gear step uses to
 * confirm the user created the right archetype.
 * @param kind - The gear item type (an {@link ITEM_KIND} gear value).
 * @param base - The expected {@link shortcodeBase} (an {@link ARCHETYPE_SHORTCODE}).
 * @returns `true` when such an item exists on the current Being.
 */
function hasGear(kind: string, base: string): boolean {
    const being = currentBeing();
    return !!being?.items?.some(
        (it: any) => it.type === kind && shortcodeBase((it.system as any)?.shortcode) === base,
    );
}

/**
 * The current Being's first gear item of `kind`/`base`, or `undefined` — used by
 * the arm-rule step to read the bow's holding limbs.
 * @param kind - The gear item type (an {@link ITEM_KIND} gear value).
 * @param base - The expected {@link shortcodeBase} (an {@link ARCHETYPE_SHORTCODE}).
 * @returns The matching gear item, or `undefined`.
 */
function findGear(kind: string, base: string): any {
    const being = currentBeing();
    return being?.items?.find(
        (it: any) => it.type === kind && shortcodeBase((it.system as any)?.shortcode) === base,
    );
}

/**
 * How many hold-capable limbs currently hold the Being's bow. A bow's **Ranged**
 * strike mode has `minParts: 2`, so it appears only when the bow is held in **two**
 * limbs — the exact transition the arm-rule step gates on.
 * @returns The number of limbs holding the bow (0 when there is no bow).
 */
function bowLimbsHeld(): number {
    const bow = findGear(ITEM_KIND.WEAPONGEAR, ARCHETYPE_SHORTCODE.longbow);
    if (!bow) return 0;
    const structure = getActorBody(currentBeing()?.logic)?.structure;
    return structure?.limbsHolding?.(bow.id) ?? 0;
}

/**
 * The number of **injury** Traumas recorded on the current Being — the state the
 * two Resolve-Injury steps gate on (a resolved wound records a `trauma` item of
 * the `injury` subtype).
 * @returns The count of injury Traumas on the current Being.
 */
function injuryCount(): number {
    const being = currentBeing();
    return (
        being?.items?.filter(
            (it: any) =>
                it.type === ITEM_KIND.TRAUMA &&
                (it.system as any)?.subType === TRAUMA_SUBTYPE.INJURY,
        )?.length ?? 0
    );
}

/**
 * Build the **Assisted Combat** tour — the second content story on the
 * {@link SohlTour} framework (#620), after Character Creation (#614). It coaches
 * one Being, single-actor and "pretend" throughout, from a weapon on the sheet to
 * a swing, to an impact, to a recorded injury — while making three things explicit
 * that new players routinely miss:
 *
 * 1. **Assisted Combat is unopinionated.** No token, no scene, no initiative, no
 *    fixed order. ATK / BLK / CX / Impact / Resolve-Injury are each *independent*
 *    and runnable at any time, in or out of combat, in any order — the coherent
 *    path shown here is just *one* route through independent pieces.
 * 2. **The system rolls; it does not adjudicate.** After the rolls, the *players*
 *    read the opposed outcome off the **rulebook**. The tour's "pretend the
 *    broadsword hit" stands in for that human step — the deliberate opposite of
 *    the future Automated Combat tour, which automates the adjudication.
 * 3. **Consequences flow from the rolls without ceremony.** Impact derives from
 *    the attack roll; an injury can be created from an impact card — or from
 *    GM-given aspect + impact with no roll at all.
 *
 * Per the framework's step kinds, each step is **free** (advise/illustrate, advance
 * on Next) or **gated** (refuse to advance until the user has actually done the
 * thing). Gating is applied *only where a wrong choice would break the lesson*: the
 * weapon Gear archetypes, the bow-into-both-arms transition, and that a wound was
 * actually recorded. Everything else — the roll values, the manual adjudication,
 * the injury detail fields — is free. Nothing is ever performed on the user's
 * behalf beyond scene-setting navigation (PRIME DIRECTIVE — assist, don't play the
 * game).
 * @returns A ready-to-register {@link SohlTour} instance.
 */
export function buildAssistedCombatTour(): SohlTour {
    const being = () => currentBeing();

    const steps: SohlTourStep[] = [
        {
            // 1 — Prerequisite (state gate): Assisted Combat coaches an existing,
            // populated Being — it never builds one. If the user already owns a
            // ready character this gate is satisfied at once and they click Next;
            // otherwise it coaches importing the Áldrik Hárvenar pregen (Actors
            // compendium → Pregens folder → right-click → Import Entry), or any
            // populated Being. Next stays disabled until an owned Being exists.
            // No sheet nav: the sheet steps that follow resolve currentBeing(),
            // which — thanks to this gate — is guaranteed to exist by then.
            id: "prepare",
            title: "SOHL.Tour.AssistedCombat.prepare.title",
            content: "SOHL.Tour.AssistedCombat.prepare.content",
            gate: TourGate.state((ctx) => ctx.state === true),
            readState: () => Boolean(currentBeing()),
        },
        {
            // 2 — Free: the mental model + independence call-out. No sheet yet;
            // centered card.
            id: "intro",
            title: "SOHL.Tour.AssistedCombat.intro.title",
            content: "SOHL.Tour.AssistedCombat.intro.content",
        },
        {
            // 3 — Gated (archetypes): add the four gear shapes the arm rule needs —
            // a one-handed weapon, a two-handed weapon, a bow, and a shield — each
            // via Create Gear + the correct Gear archetype.
            id: "gear",
            title: "SOHL.Tour.AssistedCombat.gear.title",
            content: "SOHL.Tour.AssistedCombat.gear.content",
            selector: ".gear-list:not([data-container-id]) .item-create",
            resolveDocument: being,
            nav: { tab: "gear", group: "primary" },
            gate: TourGate.state((ctx) => ctx.state === true),
            readState: () =>
                hasGear(ITEM_KIND.WEAPONGEAR, ARCHETYPE_SHORTCODE.broadsword) &&
                hasGear(ITEM_KIND.WEAPONGEAR, ARCHETYPE_SHORTCODE.battlesword) &&
                hasGear(ITEM_KIND.WEAPONGEAR, ARCHETYPE_SHORTCODE.longbow) &&
                hasGear(ITEM_KIND.WEAPONGEAR, ARCHETYPE_SHORTCODE.roundshield),
        },
        {
            // 4 — Gated (arm rule): a bow needs TWO hands. Held in a single arm its
            // Ranged strike mode does not appear; add it to the second arm and it
            // appears. The gate opens only when the bow is held in ≥2 limbs.
            id: "bow-arm-rule",
            title: "SOHL.Tour.AssistedCombat.bowArmRule.title",
            content: "SOHL.Tour.AssistedCombat.bowArmRule.content",
            selector: ".held-items",
            resolveDocument: being,
            nav: { tab: "combat", group: "primary" },
            gate: TourGate.state((ctx) => (ctx.state as number) >= 2),
            readState: () => bowLimbsHeld(),
        },
        {
            // 5 — Free: switch to a one-handed weapon so its melee strike modes are
            // available for the next steps. A 1H weapon needs only one hand, so its
            // strike modes appear the moment it is held. Not gated (per the "gate
            // only where a wrong choice breaks the lesson" rule).
            id: "hold-broadsword",
            title: "SOHL.Tour.AssistedCombat.holdBroadsword.title",
            content: "SOHL.Tour.AssistedCombat.holdBroadsword.content",
            selector: ".held-items",
            resolveDocument: being,
            nav: { tab: "combat", group: "primary" },
        },
        {
            // 6 — Free/advisory: click ATK / BLK / CX to roll. Point out the
            // hover-tooltip calculation, the chat-log result, and that each roll is
            // independent and runnable anytime — no target required.
            id: "atk-blk-cx",
            title: "SOHL.Tour.AssistedCombat.atkBlkCx.title",
            content: "SOHL.Tour.AssistedCombat.atkBlkCx.content",
            selector: '[data-action="rollStrikeModeTest"][data-test-kind="attack"]',
            resolveDocument: being,
            nav: { tab: "combat", group: "primary" },
        },
        {
            // 7 — Free/advisory: adjudicate manually (rulebook), then PRETEND the
            // broadsword hit and click Impact. The impact calculation card appears
            // in chat. Computing impact is optional and equally independent.
            id: "impact",
            title: "SOHL.Tour.AssistedCombat.impact.title",
            content: "SOHL.Tour.AssistedCombat.impact.content",
            selector: '[data-action="rollStrikeModeImpact"]',
            resolveDocument: being,
            nav: { tab: "combat", group: "primary" },
        },
        {
            // 8 — Gated (a wound is recorded): on the Actions tab, run the Resolve
            // Injury intrinsic action; fill aspect + impact from the impact card and
            // let it derive a random location. The gate opens once an injury Trauma
            // exists on the Being.
            id: "resolve-injury",
            title: "SOHL.Tour.AssistedCombat.resolveInjury.title",
            content: "SOHL.Tour.AssistedCombat.resolveInjury.content",
            selector: '.tab.actions [data-action-name="resolveInjury"] [data-action="runAction"]',
            resolveDocument: being,
            nav: { tab: "actions", group: "primary" },
            gate: TourGate.state((ctx) => (ctx.state as number) >= 1),
            readState: () => injuryCount(),
        },
        {
            // 9 — Gated (a second wound): the SAME action needs no roll and no card.
            // Given only GM-supplied numbers ("you fell 10 feet: blunt, impact 10"),
            // run Resolve Injury again and type them in — the injury is created just
            // the same. The gate opens once a second injury Trauma exists.
            id: "standalone-injury",
            title: "SOHL.Tour.AssistedCombat.standaloneInjury.title",
            content: "SOHL.Tour.AssistedCombat.standaloneInjury.content",
            selector: '.tab.actions [data-action-name="resolveInjury"] [data-action="runAction"]',
            resolveDocument: being,
            nav: { tab: "actions", group: "primary" },
            gate: TourGate.state((ctx) => (ctx.state as number) >= 2),
            readState: () => injuryCount(),
        },
        {
            // 10 — Free wrap-up.
            id: "done",
            title: "SOHL.Tour.AssistedCombat.done.title",
            content: "SOHL.Tour.AssistedCombat.done.content",
        },
    ];

    const config: SohlTourConfig = {
        namespace: ASSISTED_COMBAT_TOUR.namespace,
        id: ASSISTED_COMBAT_TOUR.id,
        title: "SOHL.Tour.AssistedCombat.title",
        description: "SOHL.Tour.AssistedCombat.description",
        display: true,
        canBeResumed: true,
        // No canStart Being-guard: rather than silently grey out the Start button
        // when no Being exists (Foundry shows no reason), the tour is always
        // startable and its first "prepare" step *coaches* the user to a populated
        // Being, gating Next until one is owned. Guiding the prerequisite beats
        // refusing without explanation (and matches Character Creation, which is
        // likewise always startable).
        steps,
    };
    return new SohlTour(config);
}
