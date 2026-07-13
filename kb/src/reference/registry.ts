import { z } from "zod";

/** One infobox row: a label and its already-formatted value. */
export type Row = [label: string, value: string];

/** A registered reference type: how its entries route, validate, and render. */
export interface RefType {
    /** Frontmatter `type` this entry matches. */
    type: string;
    /** URL segment / grouping key (`/reference/<category>/`). */
    category: string;
    /** Sidebar + index label. */
    label: string;
    /** Index-page heading. */
    title: string;
    /** One-line index-page intro. */
    blurb: string;
    /** Infobox heading on entry pages. */
    infoboxTitle: string;
    /** Validates the entry's `sohl` block; a malformed entry fails the build. */
    schema: z.ZodTypeAny;
    /** Infobox rows for one entry, from its validated `sohl` data. */
    rows: (sohl: Record<string, unknown>) => Row[];
}

/* --- formatting helpers ------------------------------------------------- */

const price = (v: unknown): string => (typeof v === "number" ? `${v}d` : "—");
const lbs = (w: unknown): string => (typeof w === "number" ? `${w} lbs` : "—");
const cap = (s: unknown): string =>
    typeof s === "string" && s ? s[0].toUpperCase() + s.slice(1) : "—";
const str = (v: unknown): string =>
    v === undefined || v === null || v === "" ? "—" : String(v);

/** `{ die, modifier, aspect }` → e.g. `d4-1 piercing`. */
function impact(i: unknown): string {
    if (!i || typeof i !== "object") return "—";
    const { die, modifier, aspect } = i as Record<string, unknown>;
    const d = typeof die === "number" && die > 0 ? `d${die}` : "";
    const m =
        typeof modifier === "number" && modifier !== 0
            ? `${modifier > 0 ? "+" : ""}${modifier}`
            : "";
    return `${d}${m}${aspect ? ` ${aspect}` : ""}`.trim() || "—";
}

/* --- shared schema fragments -------------------------------------------- */

const num = z.number();
const gear = { value: num, weight: num, durability: num };

/**
 * The registered reference types. `weapongear` is the exemplar established by
 * the KB scaffold (#422); the rest generalize it. Actors are a separate
 * follow-up. Each schema `.passthrough()`es the fields it does not surface.
 */
export const REFERENCE_TYPES: RefType[] = [
    {
        type: "weapongear",
        category: "weapons",
        label: "Weapons",
        title: "Weapons",
        blurb: "Arms used in combat.",
        infoboxTitle: "Weapon Profile",
        schema: z.object({ ...gear, heft: num }).passthrough(),
        rows: (s) => [
            ["Price", price(s.value)],
            ["Weight", lbs(s.weight)],
            ["Durability", str(s.durability)],
            ["Heft", str(s.heft)],
        ],
    },
    {
        type: "armorgear",
        category: "armor",
        label: "Armor",
        title: "Armor",
        blurb: "Defensive gear — mail, plate, shields, and more.",
        infoboxTitle: "Armor Profile",
        schema: z
            .object({
                ...gear,
                material: z.string(),
                protection: z
                    .object({
                        blunt: num,
                        edged: num,
                        piercing: num,
                        fire: num,
                    })
                    .passthrough(),
            })
            .passthrough(),
        rows: (s) => {
            const p = (s.protection ?? {}) as Record<string, unknown>;
            return [
                ["Material", str(s.detailMaterial ?? s.material)],
                ["Type", str(s.armorType)],
                ["Blunt", str(p.blunt)],
                ["Edged", str(p.edged)],
                ["Piercing", str(p.piercing)],
                ["Fire", str(p.fire)],
                ["Durability", str(s.durability)],
                ["Weight", lbs(s.weight)],
                ["Price", price(s.value)],
            ];
        },
    },
    {
        type: "miscgear",
        category: "gear",
        label: "Gear",
        title: "Miscellaneous Gear",
        blurb: "Everyday equipment and sundry goods.",
        infoboxTitle: "Item Profile",
        schema: z.object({ ...gear }).passthrough(),
        rows: (s) => [
            ["Durability", str(s.durability)],
            ["Weight", lbs(s.weight)],
            ["Price", price(s.value)],
        ],
    },
    {
        type: "containergear",
        category: "containers",
        label: "Containers",
        title: "Containers",
        blurb: "Sacks, packs, pouches, and other carriers.",
        infoboxTitle: "Container Profile",
        schema: z.object({ ...gear, maxCapacity: num }).passthrough(),
        rows: (s) => [
            ["Capacity", str(s.maxCapacity)],
            ["Durability", str(s.durability)],
            ["Weight", lbs(s.weight)],
            ["Price", price(s.value)],
        ],
    },
    {
        type: "projectilegear",
        category: "projectiles",
        label: "Projectiles",
        title: "Projectiles",
        blurb: "Arrows, bolts, stones, and other missiles.",
        infoboxTitle: "Projectile Profile",
        schema: z.object({ ...gear, subType: z.string() }).passthrough(),
        rows: (s) => [
            ["Kind", cap(s.subType)],
            ["Impact", impact(s.impact)],
            ["Durability", str(s.durability)],
            ["Weight", lbs(s.weight)],
            ["Price", price(s.value)],
        ],
    },
    {
        type: "skill",
        category: "skills",
        label: "Skills",
        title: "Skills",
        blurb:
            "Learned abilities and proficiencies — the trained competences a character can call on.",
        infoboxTitle: "Skill Profile",
        schema: z
            .object({ subType: z.string(), skillBaseFormula: z.string() })
            .passthrough(),
        rows: (s) => {
            const rows: Row[] = [
                ["Kind", cap(s.subType)],
                ["Skill base", str(s.skillBaseFormula)],
            ];
            if (s.combatCategory && s.combatCategory !== "none")
                rows.push(["Combat", cap(s.combatCategory)]);
            return rows;
        },
    },
    {
        type: "mysticalability",
        category: "mystical-abilities",
        label: "Mystical Abilities",
        title: "Mystical Abilities",
        blurb: "Arcane and divine powers drawn from the mysteries.",
        infoboxTitle: "Ability Profile",
        schema: z.object({ subType: z.string(), levelBase: num }).passthrough(),
        rows: (s) => [
            ["Kind", cap(s.subType)],
            ["Level", str(s.levelBase)],
        ],
    },
    {
        type: "trait",
        category: "traits",
        label: "Traits",
        title: "Traits",
        blurb: "Innate qualities of body and personality.",
        infoboxTitle: "Trait Profile",
        schema: z
            .object({ subType: z.string(), intensity: z.string() })
            .passthrough(),
        rows: (s) => [
            ["Kind", cap(s.subType)],
            ["Intensity", cap(s.intensity)],
        ],
    },
    {
        type: "affliction",
        category: "afflictions",
        label: "Afflictions",
        title: "Afflictions",
        blurb: "Diseases, curses, poisons, and other ailments.",
        infoboxTitle: "Affliction Profile",
        schema: z
            .object({ subType: z.string(), levelBase: num })
            .passthrough(),
        rows: (s) => {
            const rows: Row[] = [
                ["Kind", cap(s.subType)],
                ["Level", str(s.levelBase)],
            ];
            if (s.category) rows.push(["Category", cap(s.category)]);
            if (s.transmission && s.transmission !== "none")
                rows.push(["Transmission", cap(s.transmission)]);
            return rows;
        },
    },
    {
        type: "attribute",
        category: "attributes",
        label: "Attributes",
        title: "Attributes",
        blurb: "The innate scores that define a being's raw capabilities.",
        infoboxTitle: "Attribute Profile",
        schema: z.object({ initDiceFormula: z.string() }).passthrough(),
        rows: (s) => [["Initial roll", str(s.initDiceFormula)]],
    },
    {
        type: "corpus",
        category: "corpora",
        label: "Corpora",
        title: "Corpora",
        blurb: "Body structures — the anatomy of a being.",
        infoboxTitle: "Body Structure",
        schema: z
            .object({
                structure: z
                    .object({ parts: z.array(z.unknown()) })
                    .passthrough(),
            })
            .passthrough(),
        rows: (s) => {
            const parts = (s.structure as { parts?: unknown[] })?.parts ?? [];
            return [["Body parts", str(parts.length)]];
        },
    },
];

/** Registry lookups. */
export const byType = new Map(REFERENCE_TYPES.map((t) => [t.type, t]));
export const byCategory = new Map(REFERENCE_TYPES.map((t) => [t.category, t]));
