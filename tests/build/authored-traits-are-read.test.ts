/*
 * This file is part of the Song of Heroic Lands (SoHL) system for Foundry VTT.
 * Copyright (c) 2024-2026 Tom Rodriguez ("Toasty") — <toasty@heroiclands.org>
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

/**
 * Every strike-mode trait a note authors is either read by `src/` or declared
 * here as awaiting a rule.
 *
 * `traits` is an `ObjectField`, so Foundry keeps whatever a note writes and no
 * schema prunes it. That is what `tests/content/strike-mode-shape.test.ts`
 * deliberately stops at: it checks every *declared* strike-mode key and leaves
 * the trait bag alone, because the bag declares nothing. The consequence is a
 * value that compiles into the pack, renders on a sheet, and reaches no reader —
 * a weapon property a player can see and the engine ignores.
 *
 * This guard closes that seam by deriving **both** sides at runtime:
 *
 * - **Authored** — the union of every key under every `traits:` map in every
 *   strike mode in `assets/content/`, weapons and combat techniques alike.
 * - **Read** — every trait name `src/` dereferences off a `traits` bag, found by
 *   scanning the TypeScript sources for `traits.<name>`, `traits?.<name>` and
 *   the bracketed spellings.
 *
 * Neither list is written down, so adding a trait to content or giving one a
 * reader in code is noticed without anyone remembering to update a test.
 *
 * {@link AWAITING_A_RULE} is the one hand-maintained part, and it is a ratchet
 * rather than a second copy of either source of truth: a trait authored with no
 * reader and no entry here fails the guard, and a trait that gains a reader
 * while still listed here fails it too. Each entry names the mechanic the trait
 * is waiting on, so the set shrinks as the rules land and can only shrink.
 */

import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { describe, it, expect } from "vitest";
import { parse as parseYaml } from "yaml";

const ROOT = path.resolve(__dirname, "../..");
const CONTENT = path.join(ROOT, "assets/content");
const SRC = path.join(ROOT, "src");

/**
 * Traits content authors that the engine does not read, each waiting on a rule
 * that is designed but unwritten. A trait leaves this set when its rule lands;
 * nothing may join it without the mechanic being described somewhere a reader
 * can find it.
 */
const AWAITING_A_RULE: Record<string, string> = {
    AR: "Armour Reduction — how far the blow cuts through the struck location's protection",
    ARvalue: "a projectile's Armour Reduction, spelled apart from a strike mode's `AR`",
    armorReduction: "a creature strike mode's Armour Reduction, spelled apart from `AR` again",
    bleed: "the bleed-prone strike's raised bleeding severity",
    blockSLMod: "the success-level adjustment on a block",
    clench: "the creature bite that keeps hold of what it has bitten",
    constrict: "the creature coil that compresses round after round",
    couched: "the couched lance, a mounted-combat rule",
    cxSLMod: "the success-level adjustment on a counterstrike",
    durabilityMod: "the weapon-breakage check",
    entangle: "Entangle — a hold offered in place of a damaging strike",
    envelop: "Envelop — the Enveloped condition and its penalty to every defence",
    halfImpact: "the strike that lands at half impact",
    halfSword: "the half-sword grip",
    long: "weapon length as an engagement-zone rule",
    lowAim: "the low-aimed strike's shift of hit location",
    meleeMod: "the melee-test modifier, distinct from the attack modifier",
    onlyInClose: "the mode usable only in close combat",
    oppDef: "the modifier this mode imposes on the opponent's defence",
    poison: "the venomous creature strike",
    pommel: "the pommel strike",
    shaft: "the shaft strike",
    slow: "the slow weapon's cost in initiative",
    strRoll: "the Strength Trial a manoeuvre resolves through",
    swung: "the swung-two-handed impact bonus, part of Heft",
    thrust: "the thrusting mode set against a charge",
    twoHndLen: "the reach a two-handed grip adds",
};

/** Every `.md` note under a directory, recursively. */
function notes(dir: string): string[] {
    return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) return notes(full);
        return entry.isFile() && entry.name.endsWith(".md") ? [full] : [];
    });
}

/** Every `.ts` source under a directory, recursively. */
function sources(dir: string): string[] {
    return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) return sources(full);
        return entry.isFile() && entry.name.endsWith(".ts") ? [full] : [];
    });
}

/** A note's parsed frontmatter, or `undefined` when it carries none. */
function frontmatter(file: string): unknown {
    const text = readFileSync(file, "utf8");
    if (!text.startsWith("---")) return undefined;
    const close = text.indexOf("\n---", 3);
    if (close < 0) return undefined;
    try {
        return parseYaml(text.slice(3, close + 1));
    } catch {
        return undefined;
    }
}

/**
 * Collect every key under every `traits` map anywhere in a parsed note, into
 * `into` against the notes that author it.
 *
 * The walk is structural rather than path-driven: a weapon carries
 * `sohl.system.strikeModes[].traits` and a combat technique carries
 * `sohl.strikeMode.traits`, and a creature's innate modes sit elsewhere again,
 * so following a fixed path would quietly miss a carrier.
 *
 * @param node - The parsed frontmatter value being walked.
 * @param note - Repository-relative path of the note, recorded against each key.
 * @param into - Accumulator mapping a trait name to the notes authoring it.
 */
function collectTraitKeys(node: unknown, note: string, into: Map<string, Set<string>>): void {
    if (Array.isArray(node)) {
        for (const item of node) collectTraitKeys(item, note, into);
        return;
    }
    if (!node || typeof node !== "object") return;
    for (const [key, value] of Object.entries(node as Record<string, unknown>)) {
        if (key === "traits" && value && typeof value === "object" && !Array.isArray(value)) {
            for (const trait of Object.keys(value as Record<string, unknown>)) {
                if (!into.has(trait)) into.set(trait, new Set());
                into.get(trait)!.add(note);
            }
        }
        collectTraitKeys(value, note, into);
    }
}

/** The trait names authored anywhere in `assets/content/`, with their notes. */
function authoredTraits(): Map<string, Set<string>> {
    const found = new Map<string, Set<string>>();
    for (const file of notes(CONTENT)) {
        const fm = frontmatter(file);
        if (fm) collectTraitKeys(fm, path.relative(ROOT, file), found);
    }
    return found;
}

/**
 * The trait names `src/` dereferences off a `traits` bag, with the sources
 * reading each.
 *
 * Matches `traits.name`, `traits?.name` and the bracketed `traits["name"]`
 * spellings, so a reader is found however it is written. A trait read only
 * through a dynamically-built key would be missed — nothing in the system reads
 * one that way, and a guard that tried to would be guessing.
 */
function readTraits(): Map<string, Set<string>> {
    const found = new Map<string, Set<string>>();
    const direct = /\btraits\s*(?:\?\.|\.)\s*([A-Za-z_$][\w$]*)/g;
    const bracketed = /\btraits\s*(?:\?\.)?\s*\[\s*["']([^"']+)["']\s*\]/g;
    for (const file of sources(SRC)) {
        const text = readFileSync(file, "utf8");
        const where = path.relative(ROOT, file);
        for (const re of [direct, bracketed]) {
            re.lastIndex = 0;
            let match: RegExpExecArray | null;
            while ((match = re.exec(text)) !== null) {
                const trait = match[1]!;
                if (!found.has(trait)) found.set(trait, new Set());
                found.get(trait)!.add(where);
            }
        }
    }
    return found;
}

describe("strike-mode traits reach a reader", () => {
    const authored = authoredTraits();
    const read = readTraits();

    it("finds the content and the sources it is guarding", () => {
        // A walk that found nothing would make every case below vacuously pass.
        expect(authored.size).toBeGreaterThan(20);
        expect(read.size).toBeGreaterThan(3);
    });

    it("every authored trait is read by src/ or declared as awaiting a rule", () => {
        const silent: string[] = [];
        for (const [trait, inNotes] of authored) {
            if (read.has(trait) || trait in AWAITING_A_RULE) continue;
            const sample = [...inNotes].sort().slice(0, 3).join(", ");
            silent.push(`${trait} — authored in ${inNotes.size} note(s) (${sample}), read nowhere`);
        }
        expect(silent.sort()).toEqual([]);
    });

    it("no trait is listed as awaiting a rule once it has a reader", () => {
        const landed = [...Object.keys(AWAITING_A_RULE)]
            .filter((trait) => read.has(trait))
            .map((trait) => `${trait} — read by ${[...read.get(trait)!].sort().join(", ")}`);
        expect(landed.sort()).toEqual([]);
    });

    it("no trait is listed as awaiting a rule once content stops authoring it", () => {
        const gone = [...Object.keys(AWAITING_A_RULE)].filter((trait) => !authored.has(trait));
        expect(gone.sort()).toEqual([]);
    });
});
