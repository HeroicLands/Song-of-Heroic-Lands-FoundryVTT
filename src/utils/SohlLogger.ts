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

import { LOGLEVEL, isLogLevel, LogLevel } from "@utils/constants";
import { SourceMapConsumer } from "source-map";

interface LogCallerInfo {
    className: string;
    methodName: string;
    filePath: string;
    line: number;
    column: number;
    label: string;
    labelDetail: string;
}

interface LogOptions {
    logLevel: LogLevel;
    notifyLevel: LogLevel | null;
    error: Error;
    location: string;
    useHooks: boolean;
    [key: string]: unknown;
}

export class SohlLogger {
    private static _instance: SohlLogger;
    private static _sourceMapConsumer: SourceMapConsumer | null;
    private static _sourceMapLoading: boolean;
    private static _threshold: LogLevel; // configurable?

    private constructor(threshold: LogLevel = LOGLEVEL.INFO) {
        const sourceMapUrl = "systems/sohl/sohl.js.map";

        SohlLogger._threshold = threshold;
        SohlLogger._sourceMapConsumer = null;
        if (!SohlLogger._sourceMapLoading) {
            SohlLogger._sourceMapLoading = true;
            void SohlLogger.loadSourceMap(sourceMapUrl);
        }
    }

    private static async loadSourceMap(sourceMapUrl: string): Promise<void> {
        try {
            const response = await fetch(sourceMapUrl);
            if (!response.ok)
                throw new Error(`Failed to load source map ${sourceMapUrl}`);

            const rawMap = await response.json();
            SohlLogger._sourceMapConsumer = await new SourceMapConsumer(rawMap);

            console.info("✅ Source map loaded for SohlLogger.");
        } catch (error) {
            console.warn("⚠️ Could not load source map for logging:", error);
        }
    }

    public static getInstance(threshold: LogLevel = LOGLEVEL.INFO): SohlLogger {
        if (!SohlLogger._instance) {
            SohlLogger._instance = new SohlLogger(threshold);
        }
        return SohlLogger._instance;
    }

    setLogThreshold(level: LogLevel | string) {
        if (isLogLevel(level)) {
            SohlLogger._threshold = level;
        } else {
            console.warn(
                `⚠️ Invalid log level "${level}". Valid levels are: ${Object.values(
                    LOGLEVEL,
                ).join(", ")}`,
            );
        }
    }

    get logThreshold(): LogLevel {
        return SohlLogger._threshold;
    }

    private static shouldLog(level: LogLevel): boolean {
        const levels = [
            LOGLEVEL.DEBUG,
            LOGLEVEL.INFO,
            LOGLEVEL.WARN,
            LOGLEVEL.ERROR,
        ];
        return levels.indexOf(level) >= levels.indexOf(SohlLogger._threshold);
    }

    private static mapToOriginalPosition(
        file: string,
        line: number,
        column: number,
    ): { source: string; line: number; column: number } | null {
        if (!SohlLogger._sourceMapConsumer) return null;
        const pos = SohlLogger._sourceMapConsumer.originalPositionFor({
            line,
            column,
        });
        if (pos.source && pos.line != null && pos.column != null) {
            return {
                source: pos.source,
                line: pos.line,
                column: pos.column,
            };
        }
        return null;
    }

    getCallerInfo(): LogCallerInfo {
        const error = new Error();
        const stackLines = error.stack?.split("\n") || [];
        const callerLine =
            stackLines.find((line) => !line.includes("SohlLogger"))?.trim() ??
            "(anonymous)";

        const match = callerLine.match(
            /at (?:(\w+)\.)?(\w+)\s?\(?(.*?)(?:\/|\\)?(\w+\.(?:ts|js)):(\d+):(\d+)\)?/,
        );

        const result: LogCallerInfo = {
            className: "",
            methodName: "",
            filePath: "",
            line: 0,
            column: 0,
            label: "(anonymous)",
            labelDetail: "(unknown location)",
        };

        if (match) {
            const [, className, methodName, path, file, lineStr, columnStr] =
                match;
            const fullPath = `${path}/${file}`;
            const line = parseInt(lineStr, 10);
            const column = parseInt(columnStr, 10);

            result.className = className || "";
            result.methodName = methodName || "";
            result.filePath = fullPath;
            result.line = line;
            result.column = column;
            result.label = `${className}#${methodName}`;
            const mapped = SohlLogger.mapToOriginalPosition(
                fullPath,
                line,
                column,
            );
            result.labelDetail =
                mapped ?
                    `(${mapped.source}:${mapped.line}:${mapped.column})`
                :   `(${fullPath}:${line}:${column})`;
        }

        return result;
    }

    log(message: string = "", options: Partial<LogOptions> = {}): void {
        let {
            logLevel = LOGLEVEL.INFO,
            notifyLevel = null,
            error = null,
            location = null,
            useHooks = false,
            ...data
        } = options;
        const now = new Date();
        const hours = String(now.getHours()).padStart(2, "0");
        const minutes = String(now.getMinutes()).padStart(2, "0");
        const seconds = String(now.getSeconds()).padStart(2, "0");
        const milliseconds = String(now.getMilliseconds()).padStart(3, "0");
        const timeLabel = `${hours}:${minutes}:${seconds}.${milliseconds}`;

        try {
            message = sohl.i18n?.format(message, data) || message;
        } catch (_err) {
            // Ignore errors in i18n formatting
        }
        const callerInfo = this.getCallerInfo();
        const fallbackMessage = sohl.i18n.format(message, {
            ...data,
            useFallback: true,
        });

        let logMessage;
        switch (logLevel) {
            case LOGLEVEL.WARN:
                logMessage = `WARN|${timeLabel}|${callerInfo.label} ${fallbackMessage}`;
                break;

            case LOGLEVEL.ERROR:
                logMessage = `ERROR|${timeLabel}|${callerInfo.label} ${fallbackMessage} @ ${callerInfo.labelDetail}`;
                break;

            case LOGLEVEL.DEBUG:
                logMessage = `DEBUG|${timeLabel}|${callerInfo.label} ${fallbackMessage}`;
                break;

            case LOGLEVEL.INFO:
            default:
                logMessage = `INFO|${timeLabel} ${fallbackMessage}`;
                break;
        }

        if (error) {
            const newError = new Error(logMessage, { cause: error });
            if (useHooks) {
                Hooks.onError(callerInfo.label, newError, {
                    message,
                    log: logLevel,
                    notify: notifyLevel as any,
                });
            } else {
                console.error(newError);
                if (newError.cause) {
                    console.error("Caused by:", newError.cause);
                }
            }
        }

        if (!SohlLogger.shouldLog(logLevel)) return;

        const localMessage = sohl.i18n.format(message, data);

        if (notifyLevel && message) {
            switch (notifyLevel) {
                case LOGLEVEL.INFO:
                    this.uiInfo(localMessage);
                    break;
                case LOGLEVEL.WARN:
                    this.uiWarn(localMessage);
                    break;
                case LOGLEVEL.ERROR:
                    this.uiError(localMessage);
                    break;
            }
        }
    }

    info(message: string, data?: PlainObject): void {
        this.log(message, { ...data, logLevel: LOGLEVEL.INFO });
    }

    warn(message: string, data?: PlainObject): void {
        this.log(message, { ...data, logLevel: LOGLEVEL.WARN });
    }

    error(message: string, data?: PlainObject): void {
        this.log(message, { ...data, logLevel: LOGLEVEL.ERROR });
    }

    debug(message: string, data?: PlainObject): void {
        this.log(message, { ...data, logLevel: LOGLEVEL.DEBUG });
    }

    uiInfo(message: string, data?: PlainObject): void {
        this.log(message, {
            ...data,
            logLevel: LOGLEVEL.INFO,
            notifyLevel: LOGLEVEL.INFO,
        });
    }

    uiWarn(message: string, data?: PlainObject): void {
        this.log(message, {
            ...data,
            logLevel: LOGLEVEL.WARN,
            notifyLevel: LOGLEVEL.WARN,
        });
    }
    uiError(message: string, data?: PlainObject): void {
        this.log(message, {
            ...data,
            logLevel: LOGLEVEL.ERROR,
            notifyLevel: LOGLEVEL.ERROR,
        });
    }
    uiDebug(message: string, data?: PlainObject): void {
        this.log(message, {
            ...data,
            logLevel: LOGLEVEL.DEBUG,
            notifyLevel: LOGLEVEL.DEBUG,
        });
    }
}

export const log = SohlLogger.getInstance();
