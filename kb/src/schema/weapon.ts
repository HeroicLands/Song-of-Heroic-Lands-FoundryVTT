import { z } from "zod";

/**
 * The `sohl` fields a `type: weapongear` entry surfaces in its infobox.
 *
 * Mirrors the WeaponGear DataModel (the schema is the field spine); `.passthrough()`
 * keeps the rest of the block (strike modes, etc.) without asserting on it. Parsing
 * a weapon's `sohl` against this throws at build time if a weapon is malformed —
 * the single validation gate shared with the compendium DataModel.
 */
export const WeaponSohlSchema = z
    .object({
        value: z.number(),
        weight: z.number(),
        durability: z.number(),
        heft: z.number(),
        weaponType: z.string(),
    })
    .passthrough();

export type WeaponSohl = z.infer<typeof WeaponSohlSchema>;

/** Price in denarii, e.g. `3` → `"3d"`. */
export const formatPrice = (value: number): string => `${value}d`;

/** Weight in pounds, e.g. `0.25` → `"0.25 lbs"`. */
export const formatWeight = (weight: number): string => `${weight} lbs`;
