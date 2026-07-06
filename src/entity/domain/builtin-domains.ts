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

import type { DomainEntry } from "@src/entity/domain/DomainRegistry";
import { DOMAIN_FAMILY } from "@src/utils/constants";

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
        img: "systems/sohl/assets/icons/badger.svg",
        iconFAClass: "sohl-badger",
    },
    {
        shortcode: "sohl.totem.bear",
        label: "Bear",
        img: "systems/sohl/assets/icons/bear.svg",
        iconFAClass: "sohl-bear-head",
    },
    {
        shortcode: "sohl.totem.bison",
        label: "Bison",
        img: "systems/sohl/assets/icons/bison.svg",
        iconFAClass: "sohl-bison",
    },
    {
        shortcode: "sohl.totem.boar",
        label: "Boar",
        img: "systems/sohl/assets/icons/boar.svg",
        iconFAClass: "sohl-boar",
    },
    {
        shortcode: "sohl.totem.bobcat",
        label: "Bobcat",
        img: "systems/sohl/assets/icons/bobcat.svg",
        iconFAClass: "sohl-bobcat",
    },
    {
        shortcode: "sohl.totem.bull",
        label: "Bull",
        img: "systems/sohl/assets/icons/bull.svg",
        iconFAClass: "sohl-bull",
    },
    {
        shortcode: "sohl.totem.catfish",
        label: "Catfish",
        img: "systems/sohl/assets/icons/catfish.svg",
        iconFAClass: "sohl-catfish",
    },
    {
        shortcode: "sohl.totem.chicken",
        label: "Chicken",
        img: "systems/sohl/assets/icons/chicken.svg",
        iconFAClass: "sohl-chicken",
    },
    {
        shortcode: "sohl.totem.cow",
        label: "Cow",
        img: "systems/sohl/assets/icons/cow.svg",
        iconFAClass: "sohl-cow",
    },
    {
        shortcode: "sohl.totem.crow",
        label: "Crow",
        img: "systems/sohl/assets/icons/crow.svg",
        iconFAClass: "sohl-crow",
    },
    {
        shortcode: "sohl.totem.deer",
        label: "Deer",
        img: "systems/sohl/assets/icons/deer.svg",
        iconFAClass: "sohl-deer",
    },
    {
        shortcode: "sohl.totem.donkey",
        label: "Donkey",
        img: "systems/sohl/assets/icons/donkey.svg",
        iconFAClass: "sohl-donkey",
    },
    {
        shortcode: "sohl.totem.dove",
        label: "Dove",
        img: "systems/sohl/assets/icons/peace-dove.svg",
        iconFAClass: "sohl-peace-dove",
    },
    {
        shortcode: "sohl.totem.duck",
        label: "Duck",
        img: "systems/sohl/assets/icons/duck.svg",
        iconFAClass: "sohl-duck",
    },
    {
        shortcode: "sohl.totem.eagle",
        label: "Eagle",
        img: "systems/sohl/assets/icons/eagle-head.svg",
        iconFAClass: "sohl-eagle-head",
    },
    {
        shortcode: "sohl.totem.falcon",
        label: "Falcon",
        img: "systems/sohl/assets/icons/falcon.svg",
        iconFAClass: "sohl-falcon",
    },
    {
        shortcode: "sohl.totem.fox",
        label: "Fox",
        img: "systems/sohl/assets/icons/fox.svg",
        iconFAClass: "sohl-fox",
    },
    {
        shortcode: "sohl.totem.goat",
        label: "Goat",
        img: "systems/sohl/assets/icons/goat.svg",
        iconFAClass: "sohl-goat",
    },
    {
        shortcode: "sohl.totem.goose",
        label: "Goose",
        img: "systems/sohl/assets/icons/goose.svg",
        iconFAClass: "sohl-goose",
    },
    {
        shortcode: "sohl.totem.hamster",
        label: "Hamster",
        img: "systems/sohl/assets/icons/hamster.svg",
        iconFAClass: "sohl-hamster",
    },
    {
        shortcode: "sohl.totem.hawk",
        label: "Hawk",
        img: "systems/sohl/assets/icons/hawk.svg",
        iconFAClass: "sohl-hawk",
    },
    {
        shortcode: "sohl.totem.hedgehog",
        label: "Hedgehog",
        img: "systems/sohl/assets/icons/hedgehog.svg",
        iconFAClass: "sohl-hedgehog",
    },
    {
        shortcode: "sohl.totem.horse",
        label: "Horse",
        img: "systems/sohl/assets/icons/horse.svg",
        iconFAClass: "sohl-horse",
    },
    {
        shortcode: "sohl.totem.jaguar",
        label: "Jaguar",
        img: "systems/sohl/assets/icons/jaguar.svg",
        iconFAClass: "sohl-jaguar",
    },
    {
        shortcode: "sohl.totem.leopard",
        label: "Leopard",
        img: "systems/sohl/assets/icons/leopard.svg",
        iconFAClass: "sohl-leopard",
    },
    {
        shortcode: "sohl.totem.lion",
        label: "Lion",
        img: "systems/sohl/assets/icons/lion.svg",
        iconFAClass: "sohl-lion",
    },
    {
        shortcode: "sohl.totem.lynx",
        label: "Lynx",
        img: "systems/sohl/assets/icons/lynx.svg",
        iconFAClass: "sohl-lynx",
    },
    {
        shortcode: "sohl.totem.otter",
        label: "Otter",
        img: "systems/sohl/assets/icons/otter.svg",
        iconFAClass: "sohl-otter",
    },
    {
        shortcode: "sohl.totem.owl",
        label: "Owl",
        img: "systems/sohl/assets/icons/owl.svg",
        iconFAClass: "sohl-owl",
    },
    {
        shortcode: "sohl.totem.ox",
        label: "Ox",
        img: "systems/sohl/assets/icons/ox.svg",
        iconFAClass: "sohl-ox",
    },
    {
        shortcode: "sohl.totem.parrot",
        label: "Parrot",
        img: "systems/sohl/assets/icons/parrot.svg",
        iconFAClass: "sohl-parrot",
    },
    {
        shortcode: "sohl.totem.pigeon",
        label: "Pigeon",
        img: "systems/sohl/assets/icons/pigeon.svg",
        iconFAClass: "sohl-pigeon",
    },
    {
        shortcode: "sohl.totem.premonition",
        label: "Premonition",
        img: "systems/sohl/assets/icons/head-with-eye.svg",
        iconFAClass: "sohl-head-with-eye",
    },
    {
        shortcode: "sohl.totem.rabbit",
        label: "Rabbit",
        img: "systems/sohl/assets/icons/rabbit.svg",
        iconFAClass: "sohl-rabbit",
    },
    {
        shortcode: "sohl.totem.sea_bass",
        label: "Sea Bass",
        img: "systems/sohl/assets/icons/sea-bass.svg",
        iconFAClass: "sohl-sea-bass",
    },
    {
        shortcode: "sohl.totem.shark",
        label: "Shark",
        img: "systems/sohl/assets/icons/shark.svg",
        iconFAClass: "sohl-shark",
    },
    {
        shortcode: "sohl.totem.sheep",
        label: "Sheep",
        img: "systems/sohl/assets/icons/sheep.svg",
        iconFAClass: "sohl-sheep",
    },
    {
        shortcode: "sohl.totem.snake",
        label: "Snake",
        img: "systems/sohl/assets/icons/snake.svg",
        iconFAClass: "sohl-snake",
    },
    {
        shortcode: "sohl.totem.stag",
        label: "Stag",
        img: "systems/sohl/assets/icons/stag.svg",
        iconFAClass: "sohl-stag",
    },
    {
        shortcode: "sohl.totem.sturgeon",
        label: "Sturgeon",
        img: "systems/sohl/assets/icons/sturgeon.svg",
        iconFAClass: "sohl-sturgeon",
    },
    {
        shortcode: "sohl.totem.trout",
        label: "Trout",
        img: "systems/sohl/assets/icons/trout.svg",
        iconFAClass: "sohl-trout",
    },
    {
        shortcode: "sohl.totem.tuna",
        label: "Tuna",
        img: "systems/sohl/assets/icons/tuna.svg",
        iconFAClass: "sohl-tuna",
    },
    {
        shortcode: "sohl.totem.turkey",
        label: "Turkey",
        img: "systems/sohl/assets/icons/turkey.svg",
        iconFAClass: "sohl-turkey",
    },
    {
        shortcode: "sohl.totem.whale",
        label: "Whale",
        img: "systems/sohl/assets/icons/whale.svg",
        iconFAClass: "sohl-whale",
    },
    {
        shortcode: "sohl.totem.wolf",
        label: "Wolf",
        img: "systems/sohl/assets/icons/wolf.svg",
        iconFAClass: "sohl-wolf",
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
 * All built-in default Domain entries seeded by the system at init time.
 */
export const BUILTIN_DOMAINS: DomainEntry[] = [...TOTEM_DOMAINS];
