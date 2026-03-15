const BASEDIR = "packs";

export function loadItemPack(packName, list) {
    if (!Array.isArray(list)) {
        throw new Error("List must be an array");
    }
    const dirPath = path.join(BASEDIR, packName, "_source");
    try {
        const files = fs.readdirSync(dirPath);
        for (const file of files) {
            const filePath = path.join(dirPath, file);
            if (file.endsWith(".json")) {
                try {
                    const data = fs.readFileSync(filePath, "utf8");
                    const json = JSON.parse(data);
                    list.push(json);
                } catch (err) {
                    log.error(
                        `Error reading or parsing ${filePath}:`,
                        err.message,
                    );
                }
            }
        }
    } catch (err) {
        log.error(`Error reading directory ${dirPath}:`, err.message);
    }
}

export function loadAssemblyPack(packName, list) {
    if (!Array.isArray(list)) {
        throw new Error("List must be an array");
    }
    const dirPath = path.join(BASEDIR, packName, "_source");
    try {
        const files = fs.readdirSync(dirPath);
        for (const file of files) {
            const filePath = path.join(dirPath, file);
            if (file.endsWith(".json")) {
                try {
                    const data = fs.readFileSync(filePath, "utf8");
                    const json = JSON.parse(data);
                    list.push(json);
                } catch (err) {
                    log.error(
                        `Error reading or parsing ${filePath}:`,
                        err.message,
                    );
                }
            }
        }
    } catch (err) {
        log.error(`Error reading directory ${dirPath}:`, err.message);
    }
}