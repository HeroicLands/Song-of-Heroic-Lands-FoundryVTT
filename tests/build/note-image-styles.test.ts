/*
 * This file is part of the Song of Heroic Lands (SoHL) system for Foundry VTT.
 * Copyright (c) 2026 Tom Rodriguez ("Toasty") — <toasty@heroiclands.org>
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { describe, expect, it } from "vitest";
import { compile } from "sass";
import {
    IMAGE_CLASSES,
    IMAGE_FIGURE_CLASS,
    IMAGE_FLOATS,
    IMAGE_SIZES,
} from "@heroiclands/package-build/engine/content-images";

describe("journal image styling", () => {
    it("covers every class the content renderer emits", () => {
        const css = compile("scss/sohl.scss", { loadPaths: ["scss"] }).css;
        const classes = [
            IMAGE_FIGURE_CLASS,
            ...Object.values(IMAGE_CLASSES).map(({ class: name }) => name),
            ...Object.values(IMAGE_FLOATS).map(({ class: name }) => name),
            ...IMAGE_SIZES.filter((size) => size !== "auto").map(
                (size) => `note-image-size-${size}`,
            ),
        ];

        for (const name of classes) expect(css.includes(`.${name}`), name).toBe(true);
    });
});
