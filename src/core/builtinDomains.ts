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

import type { DomainEntry } from "@src/core/SohlDomains";
import { DOMAIN_FAMILY } from "@src/utils/constants";

/**
 * The seven Hexhodai elements — the canonical schools of arcane magic in
 * the SoHL setting. Mystical-ability items reference these via their
 * `domainCode` field (e.g. `sohl.hexhodai.pyrethos` for fire spells).
 */
const HEXHODAI_DOMAINS: DomainEntry[] = [
    {
        shortcode: "sohl.hexhodai.pyrethos",
        label: "Pyréthos",
        family: DOMAIN_FAMILY.ARCANE,
        iconFAClass: "fas fa-fire",
        img: "",
        description:
            "<p>The magic of heat, light, energy, and transformation through destruction.</p>",
        sort: 0,
        source: "sohl",
    },
    {
        shortcode: "sohl.hexhodai.hydalis",
        label: "Hydälis",
        family: DOMAIN_FAMILY.ARCANE,
        iconFAClass: "fas fa-droplet",
        img: "",
        description:
            "<p>The magic of cold, flow, healing, and transformation through adaptation.</p>",
        sort: 1,
        source: "sohl",
    },
    {
        shortcode: "sohl.hexhodai.zepharis",
        label: "Zephäris",
        family: DOMAIN_FAMILY.ARCANE,
        iconFAClass: "fas fa-wind",
        img: "",
        description:
            "<p>The magic of wind, weather, sound, illusion, and the intangible.</p>",
        sort: 2,
        source: "sohl",
    },
    {
        shortcode: "sohl.hexhodai.physera",
        label: "Physéra",
        family: DOMAIN_FAMILY.ARCANE,
        iconFAClass: "fas fa-mountain",
        img: "",
        description:
            "<p>The magic of stone, growth, endurance, the body, and the solid and rooted.</p>",
        sort: 3,
        source: "sohl",
    },
    {
        shortcode: "sohl.hexhodai.sideros",
        label: "Sidéros",
        family: DOMAIN_FAMILY.ARCANE,
        iconFAClass: "fas fa-gear",
        img: "",
        description:
            "<p>The magic of craft, precision, binding, and the material world made orderly.</p>",
        sort: 4,
        source: "sohl",
    },
    {
        shortcode: "sohl.hexhodai.pneumenos",
        label: "Pneuménos",
        family: DOMAIN_FAMILY.ARCANE,
        iconFAClass: "fas fa-ghost",
        img: "",
        description:
            "<p>The magic of mind, soul, communion with otherworldly entities, and the immaterial.</p>",
        sort: 5,
        source: "sohl",
    },
    {
        shortcode: "sohl.hexhodai.kentra",
        label: "Kentra",
        family: DOMAIN_FAMILY.ARCANE,
        iconFAClass: "fas fa-circle",
        img: "",
        description:
            "<p>The foundations of magic available to all arcane practitioners.</p>",
        sort: 6,
        source: "sohl",
    },
];

/**
 * The 45 totem spirits used by Mystery items of subType `totem`. Each
 * Mystery `Bear.md`, `Wolf.md`, etc. links to its corresponding totem
 * domain via `domainCode: sohl.totem.<Name>`.
 */
const TOTEMS: Array<{
    shortcode: string;
    label: string;
    img: string;
    iconFAClass: string;
}> = [
    {
        shortcode: "sohl.totem.badger",
        label: "Badger",
        img: "",
        iconFAClass: "fas fa-paw",
    },
    {
        shortcode: "sohl.totem.bear",
        label: "Bear",
        img: "",
        iconFAClass: "fas fa-paw",
    },
    {
        shortcode: "sohl.totem.bison",
        label: "Bison",
        img: "",
        iconFAClass: "fas fa-paw",
    },
    {
        shortcode: "sohl.totem.boar",
        label: "Boar",
        img: "",
        iconFAClass: "fas fa-paw",
    },
    {
        shortcode: "sohl.totem.bobcat",
        label: "Bobcat",
        img: "",
        iconFAClass: "fas fa-paw",
    },
    {
        shortcode: "sohl.totem.bull",
        label: "Bull",
        img: "",
        iconFAClass: "fas fa-paw",
    },
    {
        shortcode: "sohl.totem.catfish",
        label: "Catfish",
        img: "",
        iconFAClass: "fas fa-fish",
    },
    {
        shortcode: "sohl.totem.chicken",
        label: "Chicken",
        img: "",
        iconFAClass: "fas fa-dove",
    },
    {
        shortcode: "sohl.totem.cow",
        label: "Cow",
        img: "",
        iconFAClass: "fas fa-paw",
    },
    {
        shortcode: "sohl.totem.crow",
        label: "Crow",
        img: "",
        iconFAClass: "fas fa-feather",
    },
    {
        shortcode: "sohl.totem.deer",
        label: "Deer",
        img: "",
        iconFAClass: "fas fa-paw",
    },
    {
        shortcode: "sohl.totem.donkey",
        label: "Donkey",
        img: "",
        iconFAClass: "fas fa-paw",
    },
    {
        shortcode: "sohl.totem.dove",
        label: "Dove",
        img: "",
        iconFAClass: "fas fa-dove",
    },
    {
        shortcode: "sohl.totem.duck",
        label: "Duck",
        img: "",
        iconFAClass: "fas fa-dove",
    },
    {
        shortcode: "sohl.totem.eagle",
        label: "Eagle",
        img: "",
        iconFAClass: "fas fa-feather",
    },
    {
        shortcode: "sohl.totem.falcon",
        label: "Falcon",
        img: "",
        iconFAClass: "fas fa-feather",
    },
    {
        shortcode: "sohl.totem.fox",
        label: "Fox",
        img: "",
        iconFAClass: "fas fa-paw",
    },
    {
        shortcode: "sohl.totem.goat",
        label: "Goat",
        img: "",
        iconFAClass: "fas fa-paw",
    },
    {
        shortcode: "sohl.totem.goose",
        label: "Goose",
        img: "",
        iconFAClass: "fas fa-dove",
    },
    {
        shortcode: "sohl.totem.hamster",
        label: "Hamster",
        img: "",
        iconFAClass: "fas fa-paw",
    },
    {
        shortcode: "sohl.totem.hawk",
        label: "Hawk",
        img: "",
        iconFAClass: "fas fa-feather",
    },
    {
        shortcode: "sohl.totem.hedgehog",
        label: "Hedgehog",
        img: "",
        iconFAClass: "fas fa-paw",
    },
    {
        shortcode: "sohl.totem.horse",
        label: "Horse",
        img: "",
        iconFAClass: "fas fa-paw",
    },
    {
        shortcode: "sohl.totem.jaguar",
        label: "Jaguar",
        img: "",
        iconFAClass: "fas fa-paw",
    },
    {
        shortcode: "sohl.totem.leopard",
        label: "Leopard",
        img: "",
        iconFAClass: "fas fa-paw",
    },
    {
        shortcode: "sohl.totem.lion",
        label: "Lion",
        img: "",
        iconFAClass: "fas fa-paw",
    },
    {
        shortcode: "sohl.totem.lynx",
        label: "Lynx",
        img: "",
        iconFAClass: "fas fa-paw",
    },
    {
        shortcode: "sohl.totem.otter",
        label: "Otter",
        img: "",
        iconFAClass: "fas fa-paw",
    },
    {
        shortcode: "sohl.totem.owl",
        label: "Owl",
        img: "",
        iconFAClass: "fas fa-feather",
    },
    {
        shortcode: "sohl.totem.ox",
        label: "Ox",
        img: "",
        iconFAClass: "fas fa-paw",
    },
    {
        shortcode: "sohl.totem.parrot",
        label: "Parrot",
        img: "",
        iconFAClass: "fas fa-dove",
    },
    {
        shortcode: "sohl.totem.pigeon",
        label: "Pigeon",
        img: "",
        iconFAClass: "fas fa-dove",
    },
    {
        shortcode: "sohl.totem.premonition",
        label: "Premonition",
        img: "",
        iconFAClass: "fas fa-eye",
    },
    {
        shortcode: "sohl.totem.rabbit",
        label: "Rabbit",
        img: "",
        iconFAClass: "fas fa-paw",
    },
    {
        shortcode: "sohl.totem.sea_bass",
        label: "Sea Bass",
        img: "",
        iconFAClass: "fas fa-fish",
    },
    {
        shortcode: "sohl.totem.shark",
        label: "Shark",
        img: "",
        iconFAClass: "fas fa-fish",
    },
    {
        shortcode: "sohl.totem.sheep",
        label: "Sheep",
        img: "",
        iconFAClass: "fas fa-paw",
    },
    {
        shortcode: "sohl.totem.snake",
        label: "Snake",
        img: "",
        iconFAClass: "fas fa-paw",
    },
    {
        shortcode: "sohl.totem.stag",
        label: "Stag",
        img: "",
        iconFAClass: "fas fa-paw",
    },
    {
        shortcode: "sohl.totem.sturgeon",
        label: "Sturgeon",
        img: "",
        iconFAClass: "fas fa-fish",
    },
    {
        shortcode: "sohl.totem.trout",
        label: "Trout",
        img: "",
        iconFAClass: "fas fa-fish",
    },
    {
        shortcode: "sohl.totem.tuna",
        label: "Tuna",
        img: "",
        iconFAClass: "fas fa-fish",
    },
    {
        shortcode: "sohl.totem.turkey",
        label: "Turkey",
        img: "",
        iconFAClass: "fas fa-dove",
    },
    {
        shortcode: "sohl.totem.whale",
        label: "Whale",
        img: "",
        iconFAClass: "fas fa-fish",
    },
    {
        shortcode: "sohl.totem.wolf",
        label: "Wolf",
        img: "",
        iconFAClass: "fas fa-paw",
    },
];

const TOTEM_DOMAINS: DomainEntry[] = TOTEMS.map(
    ({ shortcode, label, img, iconFAClass }, index) => ({
        shortcode,
        label: label,
        family: DOMAIN_FAMILY.SPIRIT,
        iconFAClass: iconFAClass,
        img: img,
        description: `<p>The ${label} totem spirit.</p>`,
        sort: index,
        source: "sohl",
    }),
);

/**
 * The Asguardian pantheon — Norse-inspired deities used by Mystery items
 * of divine subTypes (Grace, Piety, Blessing).
 */
const ASGUARDIAN_DEITIES: Array<{ shortcode: string; label: string }> = [
    { shortcode: "sohl.asguardian.hel", label: "Hél" },
    { shortcode: "sohl.asguardian.baldr", label: "Baldr" },
    { shortcode: "sohl.asguardian.freyr", label: "Fréyr" },
    { shortcode: "sohl.asguardian.freyja", label: "Fréyja" },
    { shortcode: "sohl.asguardian.loki", label: "Lôki" },
    { shortcode: "sohl.asguardian.odinn", label: "Óðinn" },
    { shortcode: "sohl.asguardian.surtr", label: "Súrtr" },
    { shortcode: "sohl.asguardian.thorr", label: "Thórr" },
    { shortcode: "sohl.asguardian.tyr", label: "Týr" },
    { shortcode: "sohl.asguardian.ymir", label: "Ymir" },
];

const ASGUARDIAN_RELIGIONS: Array<{
    shortcode: string;
    label: string;
    parentDomain?: string;
    img: string;
    iconFAClass: string;
}> = [
    {
        shortcode: "sohl.asguardian.faithhel",
        label: "Faith of Hél",
        parentDomain: "sohl.asguardian.hel",
        img: "",
        iconFAClass: "fas fa-place-of-worship",
    },
    {
        shortcode: "sohl.asguardian.faithbaldr",
        label: "Faith of Baldr",
        parentDomain: "sohl.asguardian.baldr",
        img: "",
        iconFAClass: "fas fa-place-of-worship",
    },
    {
        shortcode: "sohl.asguardian.faithfreyr",
        label: "Faith of Fréyr",
        parentDomain: "sohl.asguardian.freyr",
        img: "",
        iconFAClass: "fas fa-place-of-worship",
    },
    {
        shortcode: "sohl.asguardian.faithfreyja",
        label: "Faith of Fréyja",
        parentDomain: "sohl.asguardian.freyja",
        img: "",
        iconFAClass: "fas fa-place-of-worship",
    },
    {
        shortcode: "sohl.asguardian.faithloki",
        label: "Faith of Lôki",
        parentDomain: "sohl.asguardian.loki",
        img: "",
        iconFAClass: "fas fa-place-of-worship",
    },
    {
        shortcode: "sohl.asguardian.faithodinn",
        label: "Faith of Óðinn",
        parentDomain: "sohl.asguardian.odinn",
        img: "",
        iconFAClass: "fas fa-place-of-worship",
    },
    {
        shortcode: "sohl.asguardian.faithsurtr",
        label: "Faith of Súrtr",
        parentDomain: "sohl.asguardian.surtr",
        img: "",
        iconFAClass: "fas fa-place-of-worship",
    },
    {
        shortcode: "sohl.asguardian.faiththorr",
        label: "Faith of Thórr",
        parentDomain: "sohl.asguardian.thorr",
        img: "",
        iconFAClass: "fas fa-place-of-worship",
    },
    {
        shortcode: "sohl.asguardian.faithtyr",
        label: "Faith of Týr",
        parentDomain: "sohl.asguardian.tyr",
        img: "",
        iconFAClass: "fas fa-place-of-worship",
    },
    {
        shortcode: "sohl.asguardian.faithymir",
        label: "Faith of Ymir",
        parentDomain: "sohl.asguardian.ymir",
        img: "",
        iconFAClass: "fas fa-place-of-worship",
    },
];

const ASGUARDIAN_DOMAINS: DomainEntry[] = ASGUARDIAN_DEITIES.map(
    ({ shortcode, label }, index) => ({
        shortcode,
        label,
        family: DOMAIN_FAMILY.DIVINE,
        iconFAClass: "fas fa-hammer",
        img: "",
        description: `<p>${label} of the Asguardian pantheon.</p>`,
        sort: index,
        source: "sohl",
    }),
);

/**
 * One faith per Asguardian deity. The mechanical link between a cleric
 * and their divine powers runs through the faith, not the deity itself
 * — multiple faiths can worship the same deity, and a faith with a
 * dangling parent (a non-existent or doubted deity) still grants its
 * blessings via the power of belief alone.
 */
const ASGUARDIAN_FAITHS: DomainEntry[] = ASGUARDIAN_RELIGIONS.map(
    ({ shortcode, label, parentDomain, img, iconFAClass }, index) => ({
        shortcode,
        label,
        family: DOMAIN_FAMILY.RELIGION,
        iconFAClass,
        img,
        description: `<p>The ${label} of the Asguardian pantheon.</p>`,
        sort: index,
        source: "sohl",
        parentShortcode: parentDomain,
    }),
);

/**
 * The Aureldian pantheon — Greco-Roman-inspired deities used by Mystery
 * items of divine subTypes.
 */
const AURELDIAN_DEITIES: Array<{ shortcode: string; label: string }> = [
    { shortcode: "sohl.aureldian.aetheria", label: "Æthería" },
    { shortcode: "sohl.aureldian.thanatos", label: "Thánatos" },
    { shortcode: "sohl.aureldian.taranon", label: "Táranon" },
    { shortcode: "sohl.aureldian.janus", label: "Jánus" },
    { shortcode: "sohl.aureldian.menerva", label: "Ménérva" },
    { shortcode: "sohl.aureldian.venusia", label: "Vénusia" },
    { shortcode: "sohl.aureldian.vulcan", label: "Vúlcan" },
    { shortcode: "sohl.aureldian.lusinia", label: "Lúsinía" },
    { shortcode: "sohl.aureldian.karnavos", label: "Karnavos" },
    { shortcode: "sohl.aureldian.murkir", label: "Múrkír" },
    { shortcode: "sohl.aureldian.morvana", label: "Mórváná" },
    { shortcode: "sohl.aureldian.florania", label: "Flórania" },
];

const AURELDIAN_RELIGIONS: Array<{
    shortcode: string;
    label: string;
    parentDomain?: string;
    img: string;
    iconFAClass: string;
}> = [
    {
        shortcode: "sohl.aureldian.faithaetheria",
        label: "Faith of Æthería",
        parentDomain: "sohl.aureldian.aetheria",
        img: "",
        iconFAClass: "fas fa-place-of-worship",
    },
    {
        shortcode: "sohl.aureldian.faiththanatos",
        label: "Faith of Thánatos",
        parentDomain: "sohl.aureldian.thanatos",
        img: "",
        iconFAClass: "fas fa-place-of-worship",
    },
    {
        shortcode: "sohl.aureldian.faithtaranon",
        label: "Faith of Táranon",
        parentDomain: "sohl.aureldian.taranon",
        img: "",
        iconFAClass: "fas fa-place-of-worship",
    },
    {
        shortcode: "sohl.aureldian.faithjanus",
        label: "Faith of Jánus",
        parentDomain: "sohl.aureldian.janus",
        img: "",
        iconFAClass: "fas fa-place-of-worship",
    },
    {
        shortcode: "sohl.aureldian.faithmenerva",
        label: "Faith of Ménérva",
        parentDomain: "sohl.aureldian.menerva",
        img: "",
        iconFAClass: "fas fa-place-of-worship",
    },
    {
        shortcode: "sohl.aureldian.faithvenusia",
        label: "Faith of Vénusia",
        parentDomain: "sohl.aureldian.venusia",
        img: "",
        iconFAClass: "fas fa-place-of-worship",
    },
    {
        shortcode: "sohl.aureldian.faithblackflame",
        label: "Faith of the Black Flame",
        parentDomain: "sohl.aureldian.vulcan",
        img: "",
        iconFAClass: "fas fa-place-of-worship",
    },
    {
        shortcode: "sohl.aureldian.faithsacredforge",
        label: "Faith of the Sacred Forge",
        parentDomain: "sohl.aureldian.vulcan",
        img: "",
        iconFAClass: "fas fa-place-of-worship",
    },
    {
        shortcode: "sohl.aureldian.faithlusinia",
        label: "Faith of Lúsinía",
        parentDomain: "sohl.aureldian.lusinia",
        img: "",
        iconFAClass: "fas fa-place-of-worship",
    },
    {
        shortcode: "sohl.aureldian.faithkarnavos",
        label: "Faith of Karnavos",
        parentDomain: "sohl.aureldian.karnavos",
        img: "",
        iconFAClass: "fas fa-place-of-worship",
    },
    {
        shortcode: "sohl.aureldian.faithmurkir",
        label: "Faith of Múrkír",
        parentDomain: "sohl.aureldian.murkir",
        img: "",
        iconFAClass: "fas fa-place-of-worship",
    },
    {
        shortcode: "sohl.aureldian.faithmorvana",
        label: "Faith of Mórváná",
        parentDomain: "sohl.aureldian.morvana",
        img: "",
        iconFAClass: "fas fa-place-of-worship",
    },
    {
        shortcode: "sohl.aureldian.faithflorania",
        label: "Faith of Flórania",
        parentDomain: "sohl.aureldian.florania",
        img: "",
        iconFAClass: "fas fa-place-of-worship",
    },
];

const AURELDIAN_DOMAINS: DomainEntry[] = AURELDIAN_DEITIES.map(
    ({ shortcode, label }, index) => ({
        shortcode,
        label,
        family: DOMAIN_FAMILY.DIVINE,
        iconFAClass: "fas fa-sun",
        img: "",
        description: `<p>${label} of the Aureldian pantheon.</p>`,
        sort: 100 + index,
        source: "sohl",
    }),
);

/** One faith per Aureldian deity; mirrors the Asguardian pattern. */
const AURELDIAN_FAITHS: DomainEntry[] = AURELDIAN_RELIGIONS.map(
    ({ shortcode, label, parentDomain, img, iconFAClass }, index) => ({
        shortcode,
        label,
        family: DOMAIN_FAMILY.RELIGION,
        iconFAClass,
        img,
        description: `<p>The ${label} of the Aureldian pantheon.</p>`,
        sort: 100 + index,
        source: "sohl",
        parentShortcode: parentDomain,
    }),
);

/**
 * All built-in default Domain entries seeded by the system at init time.
 * 7 Hexhodai elements + 45 totems + 10 Asguardian deities + 12 Aureldian
 * deities + 10 Asguardian faiths + 12 Aureldian faiths = 96 entries total.
 */
export const BUILTIN_DOMAINS: DomainEntry[] = [
    ...HEXHODAI_DOMAINS,
    ...TOTEM_DOMAINS,
    ...ASGUARDIAN_DOMAINS,
    ...AURELDIAN_DOMAINS,
    ...ASGUARDIAN_FAITHS,
    ...AURELDIAN_FAITHS,
];
