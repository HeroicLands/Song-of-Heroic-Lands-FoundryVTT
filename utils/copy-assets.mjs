import { copyFileSync, mkdirSync, readdirSync, statSync } from "fs";
import { join, dirname } from "path";

function copyFolder(src, dest) {
    mkdirSync(dest, { recursive: true });
    for (const file of readdirSync(src)) {
        const srcPath = join(src, file);
        const destPath = join(dest, file);
        if (statSync(srcPath).isDirectory()) copyFolder(srcPath, destPath);
        else {
            mkdirSync(dirname(destPath), { recursive: true });
            copyFileSync(srcPath, destPath);
        }
    }
}

function copyFile(src, dest) {
    mkdirSync(dirname(dest), { recursive: true });
    copyFileSync(src, dest);
}

// Copy custom documentation markdown to doc directory
copyFolder("assets/docs", "build/docs");

// Copy static assets to build/stage
copyFolder("assets/audio", "build/stage/assets/audio");
copyFolder("assets/icons", "build/stage/assets/icons");
copyFolder("assets/silhouette", "build/stage/assets/silhouette");
copyFolder("assets/ui", "build/stage/assets/ui");
copyFolder("fonts", "build/stage/fonts");
copyFolder("lang", "build/stage/lang");
copyFolder("templates", "build/stage/templates");
copyFile("LICENSE.md", "build/stage/LICENSE.md");
copyFile("README.md", "build/stage/README.md");

console.log("✅ Static assets copied.");
