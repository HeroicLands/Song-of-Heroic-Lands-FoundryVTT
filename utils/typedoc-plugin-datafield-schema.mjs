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

import { Converter, ReflectionKind, Comment } from "typedoc";

/**
 * @param {import("typedoc").Application} app
 */
export function load(app) {
    const schemaMap = new Map();

    app.converter.on(
        Converter.EVENT_CREATE_DECLARATION,
        (ctx, reflection, node) => {
            if (
                reflection.kind === ReflectionKind.Property &&
                node?.decorators
            ) {
                const className = reflection.parent?.name ?? "Unknown";
                let schema = schemaMap.get(className) ?? "";

                const dataField = node.decorators.find(
                    (d) => d.expression.expression.getText() === "DataField",
                );

                if (dataField) {
                    const objLiteral = dataField.expression.arguments[0];
                    if (!objLiteral?.properties) return;

                    const getProp = (name) =>
                        objLiteral.properties.find(
                            (p) => p.name?.getText() === name,
                        )?.initializer;

                    const dataName =
                        stripQuotes(getProp("dataName")?.getText()) ||
                        reflection.name;
                    const type =
                        stripQuotes(getProp("type")?.getText()) || "unknown";
                    const required =
                        getProp("required")?.getText() === "true" ?
                            "yes"
                        :   "no";

                    let initial = getProp("initial")?.getText();
                    if (
                        initial?.startsWith("()") ||
                        initial?.startsWith("function") ||
                        initial?.includes("=>")
                    ) {
                        initial = "<function>";
                    } else if (initial) {
                        initial = stripQuotes(initial);
                    } else {
                        initial = "";
                    }

                    schema += `| \`${dataName}\` | \`${type}\` | \`${required}\` | \`${initial}\` |\n`;

                    schemaMap.set(className, schema);
                }
            }
        },
    );

    app.converter.on(Converter.EVENT_RESOLVE_END, (ctx) => {
        const project = ctx.project;

        for (const reflection of project.getReflectionsByKind(
            ReflectionKind.Class,
        )) {
            const schema = schemaMap.get(reflection.name);
            if (!schema) continue;

            const table = [
                "## Schema",
                "",
                "| Data Name | Type | Required | Initial |",
                "|-----------|------|----------|---------|",
                schema.trimEnd(),
                "",
            ].join("\n");

            if (!reflection.comment) {
                reflection.comment = new Comment("");
            }

            reflection.comment.text =
                `${reflection.comment.text ?? ""}\n\n${table}`.trim();
        }
    });

    function stripQuotes(text) {
        return text?.replace(/^['"`]|['"`]$/g, "") ?? "";
    }
}
