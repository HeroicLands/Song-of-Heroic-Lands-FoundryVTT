/*
 * This file is part of the Song of Heroic Lands (SoHL) system for Foundry VTT.
 * Copyright (c) 2024-2026 Tom Rodriguez ("Toasty") — <toasty@heroiclands.com>
 *
 * This work is licensed under the GNU General Public License v3.0 (GPLv3).
 * You may copy, modify, and distribute it under the terms of that license.
 *
 * For full terms, see the LICENSE.md file in the project root or visit:
 * https://www.gnu.org/licenses/gpl-3.0.html
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

/**
 * Public API **type declarations** for the Song of Heroic Lands (SoHL) Foundry
 * VTT system.
 *
 * This package is **types-only**: it declares no runtime values. A module never
 * imports SoHL's runtime — Foundry loads the system, and every value is reached
 * through the live `sohl` global (`new sohl.entity.ValueModifier(...)`,
 * `sohl.document.effect.foundry.SohlActiveEffect`, …).
 *
 * > **Bootstrap release.** This `0.0.x` is a placeholder that establishes the
 * > package and its Trusted-Publishing setup. The full, generated declarations —
 * > the Logic/Data interfaces, the domain class types, and the `sohl.*` namespace
 * > tree — arrive in a later version (see the namespace-tree epic,
 * > https://github.com/HeroicLands/Song-of-Heroic-Lands-FoundryVTT/issues/407).
 */

export {};
