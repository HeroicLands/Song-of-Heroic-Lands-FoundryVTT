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
    ACTOR_KIND,
    ITEM_KIND,
    MYSTICALABILITY_SUBTYPE,
} from "@src/utils/constants";
import { getActorBody } from "@src/document/actor/logic/BodyLogic";
import { TourGate } from "@src/entity/tour";
import { SohlTour, type SohlTourConfig, type SohlTourStep } from "../SohlTour";

/** The namespaced identity of the Character Creation tour. */
export const CHARACTER_CREATION_TOUR = Object.freeze({
    namespace: "sohl",
    id: "character-creation",
});

/**
 * The archetype shortcodes the tour's gated steps recognize. These are the
 * `system.shortcode` values the create-dialog stamps onto an instance seeded
 * from each content archetype (#643 makes an archetype-seeded instance inherit
 * the archetype's own shortcode, even when the document is renamed), reduced to
 * their {@link shortcodeBase | uniqueness-stripped base}. Matching on shortcode —
 * not name — is what lets a gate confirm the user picked the *correct archetype*
 * while still allowing them to rename their character or gear.
 */
const ARCHETYPE_SHORTCODE = Object.freeze({
    basicFolk: "basicfolk",
    broadsword: "brdswd",
    roundshield: "rndsh",
    leatherTunic: "lttunic",
    backpack: "backpk",
    tinderbox: "tndrbx",
});

/**
 * Reduce a `system.shortcode` to its archetype base: lower-cased, non-alphanumerics
 * stripped (mirroring {@link sohl.utils.slugifyShortcode}), and a trailing
 * uniqueness suffix removed so a second `brdswd2` still matches `brdswd`.
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
 * The Being the tour is building: the owned Being seeded from the *Basic Folk*
 * archetype (recognized by its inherited shortcode), or — as a fallback before
 * that shortcode resolves — the first owned Being. The tour builds one character
 * at a time, so a fresh world resolves this unambiguously.
 * @returns The owned Being actor being built, or `undefined`.
 */
function currentBeing(): any {
    const owned = ((game as any).actors?.contents ?? []).filter(
        (a: any) => a.type === ACTOR_KIND.BEING && a.isOwner,
    );
    return (
        owned.find(
            (a: any) =>
                shortcodeBase((a.system as any)?.shortcode) ===
                ARCHETYPE_SHORTCODE.basicFolk,
        ) ?? owned[0]
    );
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
        (it: any) =>
            it.type === kind &&
            shortcodeBase((it.system as any)?.shortcode) === base,
    );
}

/**
 * The current Being's first gear item of `kind`/`base`, or `undefined` — used by
 * the container steps to read a specific item's `system.containerId`.
 * @param kind - The gear item type (an {@link ITEM_KIND} gear value).
 * @param base - The expected {@link shortcodeBase} (an {@link ARCHETYPE_SHORTCODE}).
 * @returns The matching gear item, or `undefined`.
 */
function findGear(kind: string, base: string): any {
    const being = currentBeing();
    return being?.items?.find(
        (it: any) =>
            it.type === kind &&
            shortcodeBase((it.system as any)?.shortcode) === base,
    );
}

/**
 * A snapshot of which hold-capable limb holds which archetype, keyed by the
 * limb's readable name ("Right Arm" / "Left Arm"). Read by the held-weapon state
 * gate; the pure predicate then checks the right/left assignment.
 * @returns Map of limb name → held item's base shortcode (`""` when empty).
 */
function heldByLimb(): Record<string, string> {
    const being = currentBeing();
    const parts = getActorBody(being?.logic)?.structure?.parts ?? [];
    const out: Record<string, string> = {};
    for (const part of parts as any[]) {
        if (!part.canHoldItem) continue;
        out[part.name] = shortcodeBase(part.heldItem?.system?.shortcode);
    }
    return out;
}

/**
 * The base shortcode held by the limb whose name matches every pattern (e.g. a
 * "Right Arm" via `/right/i, /arm/i`), or `""` when no such limb holds anything.
 * @param state - The {@link heldByLimb} snapshot (limb name → held base shortcode).
 * @param patterns - Patterns the limb's name must all match.
 * @returns The matching limb's held base shortcode, or `""`.
 */
function limbHolding(
    state: Record<string, string>,
    ...patterns: RegExp[]
): string {
    const entry = Object.entries(state ?? {}).find(([name]) =>
        patterns.every((p) => p.test(name)),
    );
    return entry?.[1] ?? "";
}

/**
 * Build the flagship **Character Creation** tour — the first content story on the
 * {@link SohlTour} framework (#614). It *coaches and waits* the user from an
 * empty sidebar to a combat-ready Being: create from the *Basic Folk* archetype,
 * flesh out the Facade / Profile / Skills, arm and armour the character on the
 * Gear and Combat tabs, add an Arcane Talent, and pack a container — teaching most
 * of the Being sheet along the way.
 *
 * Per the framework's step kinds, each step is **free** (advise an example, advance
 * on Next) or **gated** (refuse to advance until the user has actually done the
 * thing). Gated archetype steps key off the instance's inherited **shortcode**
 * (#643), so the gate confirms the *right archetype* was chosen without forcing a
 * particular name. Nothing is ever performed on the user's behalf beyond
 * scene-setting navigation (PRIME DIRECTIVE — assist, don't play the game).
 * @returns A ready-to-register {@link SohlTour} instance.
 */
export function buildCharacterCreationTour(): SohlTour {
    const being = () => currentBeing();

    const steps: SohlTourStep[] = [
        {
            // 1 — Free intro: create the actor. (none) is mentioned, not shown.
            id: "create-actor",
            title: "SOHL.Tour.CharCreation.createActor.title",
            content: "SOHL.Tour.CharCreation.createActor.content",
        },
        {
            // 2 — Free: pick the Basic Folk archetype and confirm. The transient
            // create dialog can't be reliably gated, so the archetype is enforced
            // by the next (state-gated) step instead.
            id: "archetype",
            title: "SOHL.Tour.CharCreation.archetype.title",
            content: "SOHL.Tour.CharCreation.archetype.content",
        },
        {
            // 3 — State gate: refuse to advance until a Basic-Folk Being exists.
            // Re-evaluates on `createActor` (framework state hook). This is the
            // real "Basic Folk archetype" gate — a blank (none) actor never
            // satisfies it.
            id: "populated",
            title: "SOHL.Tour.CharCreation.populated.title",
            content: "SOHL.Tour.CharCreation.populated.content",
            gate: TourGate.state((ctx) => ctx.state === true),
            readState: () =>
                shortcodeBase((being()?.system as any)?.shortcode) ===
                ARCHETYPE_SHORTCODE.basicFolk,
        },
        {
            // 4 — Free: Facade tab — portrait + public description.
            id: "facade",
            title: "SOHL.Tour.CharCreation.facade.title",
            content: "SOHL.Tour.CharCreation.facade.content",
            selector: ".facade__image",
            resolveDocument: being,
            nav: { tab: "facade", group: "primary" },
        },
        {
            // 5 — Free: Profile tab — edit one attribute via the ⋮ menu, then the rest.
            id: "attributes",
            title: "SOHL.Tour.CharCreation.attributes.title",
            content: "SOHL.Tour.CharCreation.attributes.content",
            selector: ".attribute-score.item .item-contextmenu",
            resolveDocument: being,
            nav: { tab: "profile", group: "primary" },
        },
        {
            // 6 — Free: Profile tab — the Dossier.
            id: "dossier",
            title: "SOHL.Tour.CharCreation.dossier.title",
            content: "SOHL.Tour.CharCreation.dossier.content",
            selector: '[name="system.dossier"]',
            resolveDocument: being,
            nav: { tab: "profile", group: "primary" },
        },
        {
            // 7 — Free: Skills tab — edit the Melee skill (right-click the row, or
            // the ⋮ menu), then close the item sheet.
            id: "skills-melee",
            title: "SOHL.Tour.CharCreation.skillsMelee.title",
            content: "SOHL.Tour.CharCreation.skillsMelee.content",
            selector:
                '.skills li.item[data-item-name="Melee"] .item-contextmenu',
            resolveDocument: being,
            nav: { tab: "skills", group: "primary" },
        },
        {
            // 8 — Free: fill out the rest of the skills.
            id: "skills-rest",
            title: "SOHL.Tour.CharCreation.skillsRest.title",
            content: "SOHL.Tour.CharCreation.skillsRest.content",
            selector: '.skills input[name="search-skills"]',
            resolveDocument: being,
            nav: { tab: "skills", group: "primary" },
        },
        {
            // 9 — Gated (archetypes): create a Broadsword and a Roundshield via
            // Create Gear, picking the correct Gear archetype for each.
            id: "gear-weapons",
            title: "SOHL.Tour.CharCreation.gearWeapons.title",
            content: "SOHL.Tour.CharCreation.gearWeapons.content",
            selector: ".gear-list:not([data-container-id]) .item-create",
            resolveDocument: being,
            nav: { tab: "gear", group: "primary" },
            gate: TourGate.state((ctx) => ctx.state === true),
            readState: () =>
                hasGear(ITEM_KIND.WEAPONGEAR, ARCHETYPE_SHORTCODE.broadsword) &&
                hasGear(ITEM_KIND.WEAPONGEAR, ARCHETYPE_SHORTCODE.roundshield),
        },
        {
            // 10 — Gated (slots): hold the Broadsword in the right arm and the
            // Roundshield in the left arm.
            id: "combat-hold",
            title: "SOHL.Tour.CharCreation.combatHold.title",
            content: "SOHL.Tour.CharCreation.combatHold.content",
            selector: ".held-items",
            resolveDocument: being,
            nav: { tab: "combat", group: "primary" },
            gate: TourGate.state(
                (ctx) =>
                    limbHolding(
                        ctx.state as Record<string, string>,
                        /right/i,
                        /arm/i,
                    ) === ARCHETYPE_SHORTCODE.broadsword &&
                    limbHolding(
                        ctx.state as Record<string, string>,
                        /left/i,
                        /arm/i,
                    ) === ARCHETYPE_SHORTCODE.roundshield,
            ),
            readState: () => heldByLimb(),
        },
        {
            // 11 — Gated (state, already satisfied): the strike modes now appear.
            // Gating enables pointer pass-through so the highlighted ATK/BLK/CX
            // cells are rollable from within the tour; Next is enabled at once.
            id: "strike-modes",
            title: "SOHL.Tour.CharCreation.strikeModes.title",
            content: "SOHL.Tour.CharCreation.strikeModes.content",
            selector:
                '[data-action="rollStrikeModeTest"][data-test-kind="attack"]',
            resolveDocument: being,
            nav: { tab: "combat", group: "primary" },
            gate: TourGate.state((ctx) => ctx.state === true),
            readState: () => {
                // A strike-mode row rendered on the Combat tab is the truest
                // signal; fall back to "a weapon is held" so a not-yet-painted
                // re-render can't strand the (already-satisfied) gate.
                if (
                    being()?.sheet?.element?.querySelector(
                        "li.item[data-sm-id]",
                    )
                ) {
                    return true;
                }
                return Object.values(heldByLimb()).some(
                    (base) =>
                        base === ARCHETYPE_SHORTCODE.broadsword ||
                        base === ARCHETYPE_SHORTCODE.roundshield,
                );
            },
        },
        {
            // 12 — Gated (archetype + equip): create a Leather Tunic and equip it.
            id: "gear-tunic",
            title: "SOHL.Tour.CharCreation.gearTunic.title",
            content: "SOHL.Tour.CharCreation.gearTunic.content",
            selector: ".gear-list:not([data-container-id]) .item-create",
            resolveDocument: being,
            nav: { tab: "gear", group: "primary" },
            gate: TourGate.state((ctx) => ctx.state === true),
            readState: () => {
                const tunic = findGear(
                    ITEM_KIND.ARMORGEAR,
                    ARCHETYPE_SHORTCODE.leatherTunic,
                );
                return !!tunic && !!(tunic.system as any)?.isEquipped;
            },
        },
        {
            // 13 — Free (display): the tunic's armour now protects the torso.
            id: "combat-armor",
            title: "SOHL.Tour.CharCreation.combatArmor.title",
            content: "SOHL.Tour.CharCreation.combatArmor.content",
            selector: ".bodylocations-list",
            resolveDocument: being,
            nav: { tab: "combat", group: "primary" },
        },
        {
            // 14a — Gated (kind = Arcane Talent): add a Mystical Ability of the
            // Arcane Talent kind (the specific talent, e.g. Telepathy, is free).
            id: "mystery-add",
            title: "SOHL.Tour.CharCreation.mysteryAdd.title",
            content: "SOHL.Tour.CharCreation.mysteryAdd.content",
            selector: '.item-create[data-type="mysticalability"]',
            resolveDocument: being,
            nav: { tab: "mysteries", group: "primary" },
            gate: TourGate.state((ctx) => ctx.state === true),
            readState: () =>
                !!being()?.items?.some(
                    (it: any) =>
                        it.type === ITEM_KIND.MYSTICALABILITY &&
                        (it.system as any)?.subType ===
                            MYSTICALABILITY_SUBTYPE.ARCANETALENT,
                ),
        },
        {
            // 14b — Free (action): open the talent, change its Mastery Level, and
            // return to see the row update.
            id: "mystery-edit",
            title: "SOHL.Tour.CharCreation.mysteryEdit.title",
            content: "SOHL.Tour.CharCreation.mysteryEdit.content",
            selector: ".mysticalabilities-list li.item[data-item-id]",
            resolveDocument: being,
            nav: { tab: "mysteries", group: "primary" },
        },
        {
            // 15a — Gated (archetype): create a Backpack container.
            id: "backpack",
            title: "SOHL.Tour.CharCreation.backpack.title",
            content: "SOHL.Tour.CharCreation.backpack.content",
            selector: ".gear-list:not([data-container-id]) .item-create",
            resolveDocument: being,
            nav: { tab: "gear", group: "primary" },
            gate: TourGate.state((ctx) => ctx.state === true),
            readState: () =>
                hasGear(ITEM_KIND.CONTAINERGEAR, ARCHETYPE_SHORTCODE.backpack),
        },
        {
            // 15b — Gated (archetype): add a Tinderbox.
            id: "tinderbox",
            title: "SOHL.Tour.CharCreation.tinderbox.title",
            content: "SOHL.Tour.CharCreation.tinderbox.content",
            selector: ".gear-list:not([data-container-id]) .item-create",
            resolveDocument: being,
            nav: { tab: "gear", group: "primary" },
            gate: TourGate.state((ctx) => ctx.state === true),
            readState: () =>
                hasGear(ITEM_KIND.MISCGEAR, ARCHETYPE_SHORTCODE.tinderbox),
        },
        {
            // 15c — Gated (action): drag the Tinderbox into the Backpack.
            id: "drag-in",
            title: "SOHL.Tour.CharCreation.dragIn.title",
            content: "SOHL.Tour.CharCreation.dragIn.content",
            selector: ".gear-list[data-container-id]",
            resolveDocument: being,
            nav: { tab: "gear", group: "primary" },
            gate: TourGate.state((ctx) => ctx.state === true),
            readState: () => {
                const tin = findGear(
                    ITEM_KIND.MISCGEAR,
                    ARCHETYPE_SHORTCODE.tinderbox,
                );
                const bag = findGear(
                    ITEM_KIND.CONTAINERGEAR,
                    ARCHETYPE_SHORTCODE.backpack,
                );
                return (
                    !!bag &&
                    !!tin &&
                    (tin.system as any)?.containerId === bag.id
                );
            },
        },
        {
            // 15d — Gated (action): drag the Tinderbox back out onto On Body.
            id: "drag-out",
            title: "SOHL.Tour.CharCreation.dragOut.title",
            content: "SOHL.Tour.CharCreation.dragOut.content",
            selector: ".gear-list:not([data-container-id])",
            resolveDocument: being,
            nav: { tab: "gear", group: "primary" },
            gate: TourGate.state((ctx) => ctx.state === true),
            readState: () => {
                const tin = findGear(
                    ITEM_KIND.MISCGEAR,
                    ARCHETYPE_SHORTCODE.tinderbox,
                );
                const cid = (tin?.system as any)?.containerId;
                return !!tin && (cid == null || cid === "");
            },
        },
        {
            // 16 — Free wrap-up.
            id: "done",
            title: "SOHL.Tour.CharCreation.done.title",
            content: "SOHL.Tour.CharCreation.done.content",
        },
    ];

    const config: SohlTourConfig = {
        namespace: CHARACTER_CREATION_TOUR.namespace,
        id: CHARACTER_CREATION_TOUR.id,
        title: "SOHL.Tour.CharCreation.title",
        description: "SOHL.Tour.CharCreation.description",
        display: true,
        canBeResumed: true,
        steps,
    };
    return new SohlTour(config);
}
