import { readFile, writeFile } from "fs/promises";
import { resolve } from "path";

const packageJsonPath = resolve(
    "node_modules/@league-of-foundry-developers/foundry-vtt-types/package.json",
);

try {
    const packageJsonContent = await readFile(packageJsonPath, "utf8");
    const packageJson = JSON.parse(packageJsonContent);

    if (packageJson.types === "./index.d.mts") {
        packageJson.types = "./src/index.d.mts";
        await writeFile(packageJsonPath, JSON.stringify(packageJson, null, 2));
        console.log(
            "Fixed @league-of-foundry-developers/foundry-vtt-types package.json",
        );
    } else {
        console.log(
            "No changes needed for @league-of-foundry-developers/foundry-vtt-types package.json",
        );
    }
} catch (error) {
    console.error(
        "Error fixing @league-of-foundry-developers/foundry-vtt-types package.json:",
        error,
    );
}
