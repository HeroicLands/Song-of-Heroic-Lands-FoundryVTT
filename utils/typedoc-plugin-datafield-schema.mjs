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
