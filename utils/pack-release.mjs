import fs from "fs";
import fsp from "fs/promises";
import archiver from "archiver";
import { mkdirSync } from "fs";
import { join, relative, resolve } from "path";

export async function packStage() {
    const STAGE_DIR = resolve("./build/stage");
    const RELEASE_DIR = resolve("./build/release");
    mkdirSync(RELEASE_DIR, { recursive: true });

    const system = JSON.parse(await fsp.readFile("system.json", "utf8"));
    const version = system.version;
    const zipPath = join(RELEASE_DIR, `system-${version}.zip`);
    const output = fs.createWriteStream(zipPath);
    const archive = archiver("zip", { zlib: { level: 9 } });

    archive.pipe(output);
    archive.directory(STAGE_DIR, false);
    await archive.finalize();

    await fsp.copyFile(
        "system.json",
        join(RELEASE_DIR, `system-${version}.json`),
    );

    console.log("✅ Packaging for release complete:", relative(".", zipPath));
}

// CLI support
if (process.argv[1] === resolve("./utils/pack-release.mjs")) {
    packStage().catch((err) => {
        console.error("❌ Packaging for release failed:", err);
        process.exit(1);
    });
}
