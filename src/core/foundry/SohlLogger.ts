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

import { LOGLEVEL, isLogLevel, LogLevel } from "@src/utils/constants";
import { SourceMapConsumer } from "source-map";

/**
 * Resolved information about the call site of a log statement, derived from a
 * captured stack trace and (when available) the system's source map.
 * @internal
 */
interface LogCallerInfo {
    /** The calling class name, or `""` if it could not be parsed. */
    className: string;
    /** The calling method/function name, or `""` if it could not be parsed. */
    methodName: string;
    /** The full file path parsed from the stack frame. */
    filePath: string;
    /** The line number of the call site (in the transpiled bundle). */
    line: number;
    /** The column number of the call site (in the transpiled bundle). */
    column: number;
    /** A short `Class#method` label for log prefixes. */
    label: string;
    /** A `(source:line:column)` detail string, source-mapped when possible. */
    labelDetail: string;
}

/**
 * Options accepted by {@link SohlLogger.log}. Any extra keys are treated as
 * interpolation data passed to the localizer.
 * @internal
 */
interface LogOptions {
    /** Severity at which the message is emitted to the console. */
    logLevel: LogLevel;
    /** If set, also surface the message as a Foundry UI notification at this level. */
    notifyLevel: LogLevel | null;
    /** An associated error to report (and chain as `cause`). */
    error: Error;
    /** Optional explicit location string. */
    location: string;
    /** When `true`, route errors through Foundry's `Hooks.onError`. */
    useHooks: boolean;
    /** Additional interpolation values for the localized message. */
    [key: string]: unknown;
}

/**
 * Singleton logger for the SoHL system.
 *
 * Wraps the console with severity levels ({@link info}, {@link warn},
 * {@link error}, {@link debug}), threshold filtering, localized and
 * timestamped message prefixes including the source-mapped call site, optional
 * Foundry UI notifications (the `ui*` methods), and error chaining via
 * `Hooks.onError`.
 */
export class SohlLogger {
    /** The lazily-created singleton instance. @internal */
    private static instance: SohlLogger;
    /** Loaded source-map consumer used to map stack frames to source positions. @internal */
    private static sourceMapConsumer: SourceMapConsumer | null;
    /** Guards against loading the source map more than once. @internal */
    private static sourceMapLoading: boolean;
    /** The current minimum severity that will be emitted. @internal */
    private static threshold: LogLevel; // configurable?

    /**
     * Private to enforce singleton access via {@link getInstance}. Kicks off
     * asynchronous source-map loading on first construction.
     * @param threshold The initial log threshold; defaults to `INFO`.
     * @internal
     */
    private constructor(threshold: LogLevel = LOGLEVEL.INFO) {
        const sourceMapUrl = "systems/sohl/sohl.js.map";

        SohlLogger.threshold = threshold;
        SohlLogger.sourceMapConsumer = null;
        if (!SohlLogger.sourceMapLoading) {
            SohlLogger.sourceMapLoading = true;
            void SohlLogger.loadSourceMap(sourceMapUrl);
        }
    }

    /**
     * Fetch and parse the system's source map so log call sites can be mapped
     * back to original source positions. Failures are logged and ignored.
     * @param sourceMapUrl URL of the `.js.map` source map to load.
     * @internal
     */
    private static async loadSourceMap(sourceMapUrl: string): Promise<void> {
        try {
            const response = await fetch(sourceMapUrl);
            if (!response.ok)
                throw new Error(`Failed to load source map ${sourceMapUrl}`);

            const rawMap = await response.json();
            SohlLogger.sourceMapConsumer = new SourceMapConsumer(rawMap);

            console.info("✅ Source map loaded for SohlLogger.");
        } catch (error) {
            console.warn("⚠️ Could not load source map for logging:", error);
        }
    }

    /**
     * Return the shared singleton logger, creating it on first access.
     * @param threshold The initial threshold used only when first creating the
     *   instance; defaults to `INFO`.
     * @returns The {@link SohlLogger} singleton.
     */
    public static getInstance(threshold: LogLevel = LOGLEVEL.INFO): SohlLogger {
        if (!SohlLogger.instance) {
            SohlLogger.instance = new SohlLogger(threshold);
        }
        return SohlLogger.instance;
    }

    /**
     * Set the minimum severity to emit. Invalid levels are rejected with a
     * console warning and leave the current threshold unchanged.
     * @param level The desired log level (or its string value).
     */
    setLogThreshold(level: LogLevel | string) {
        if (isLogLevel(level)) {
            SohlLogger.threshold = level;
        } else {
            console.warn(
                `⚠️ Invalid log level "${level}". Valid levels are: ${Object.values(
                    LOGLEVEL,
                ).join(", ")}`,
            );
        }
    }

    /** The current minimum severity that will be emitted. */
    get logThreshold(): LogLevel {
        return SohlLogger.threshold;
    }

    /**
     * Whether a message at `level` passes the current threshold.
     * @param level The severity to test.
     * @returns `true` if the message should be emitted.
     * @internal
     */
    private static shouldLog(level: LogLevel): boolean {
        const levels = [
            LOGLEVEL.DEBUG,
            LOGLEVEL.INFO,
            LOGLEVEL.WARN,
            LOGLEVEL.ERROR,
        ];
        return levels.indexOf(level) >= levels.indexOf(SohlLogger.threshold);
    }

    /**
     * Map a bundled `(file, line, column)` position to its original source
     * position using the loaded source map.
     * @param file The bundled file path.
     * @param line The line number in the bundle.
     * @param column The column number in the bundle.
     * @returns The original `{ source, line, column }`, or `null` if no source
     *   map is loaded or the position cannot be mapped.
     * @internal
     */
    private static mapToOriginalPosition(
        file: string,
        line: number,
        column: number,
    ): { source: string; line: number; column: number } | null {
        if (!SohlLogger.sourceMapConsumer) return null;
        const pos = SohlLogger.sourceMapConsumer.originalPositionFor({
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

    /**
     * Inspect the current stack trace to identify the caller of the logging
     * API (the first frame outside `SohlLogger`) and resolve it, source-mapping
     * the location when possible.
     * @returns Parsed `LogCallerInfo`; falls back to anonymous/unknown
     *   placeholders if the frame cannot be parsed.
     */
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

    /**
     * Core logging routine used by all the convenience methods.
     *
     * Localizes and interpolates `message`, builds a level/timestamp/caller
     * prefix, optionally reports an associated error (directly or via
     * `Hooks.onError`), then — if the message passes the threshold and a
     * `notifyLevel` is set — surfaces a Foundry UI notification.
     * @param message The message key or text (localized and interpolated with
     *   any extra `options` keys).
     * @param options Logging options; see `LogOptions`. Defaults to an
     *   `INFO`-level console-only message.
     */
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

    /**
     * Log a message at `INFO` severity.
     * @param message The message key or text.
     * @param data Optional interpolation values.
     */
    info(message: string, data?: PlainObject): void {
        this.log(message, { ...data, logLevel: LOGLEVEL.INFO });
    }

    /**
     * Log a message at `WARN` severity.
     * @param message The message key or text.
     * @param data Optional interpolation values.
     */
    warn(message: string, data?: PlainObject): void {
        this.log(message, { ...data, logLevel: LOGLEVEL.WARN });
    }

    /**
     * Log a message at `ERROR` severity.
     * @param message The message key or text.
     * @param data Optional interpolation values.
     */
    error(message: string, data?: PlainObject): void {
        this.log(message, { ...data, logLevel: LOGLEVEL.ERROR });
    }

    /**
     * Log a message at `DEBUG` severity.
     * @param message The message key or text.
     * @param data Optional interpolation values.
     */
    debug(message: string, data?: PlainObject): void {
        this.log(message, { ...data, logLevel: LOGLEVEL.DEBUG });
    }

    /**
     * Log at `INFO` severity and also show an `INFO` Foundry UI notification.
     * @param message The message key or text.
     * @param data Optional interpolation values.
     */
    uiInfo(message: string, data?: PlainObject): void {
        this.log(message, {
            ...data,
            logLevel: LOGLEVEL.INFO,
            notifyLevel: LOGLEVEL.INFO,
        });
    }

    /**
     * Log at `WARN` severity and also show a `WARN` Foundry UI notification.
     * @param message The message key or text.
     * @param data Optional interpolation values.
     */
    uiWarn(message: string, data?: PlainObject): void {
        this.log(message, {
            ...data,
            logLevel: LOGLEVEL.WARN,
            notifyLevel: LOGLEVEL.WARN,
        });
    }
    /**
     * Log at `ERROR` severity and also show an `ERROR` Foundry UI notification.
     * @param message The message key or text.
     * @param data Optional interpolation values.
     */
    uiError(message: string, data?: PlainObject): void {
        this.log(message, {
            ...data,
            logLevel: LOGLEVEL.ERROR,
            notifyLevel: LOGLEVEL.ERROR,
        });
    }
    /**
     * Log at `DEBUG` severity and also request a `DEBUG` UI notification.
     * @param message The message key or text.
     * @param data Optional interpolation values.
     */
    uiDebug(message: string, data?: PlainObject): void {
        this.log(message, {
            ...data,
            logLevel: LOGLEVEL.DEBUG,
            notifyLevel: LOGLEVEL.DEBUG,
        });
    }
}

/** Shared {@link SohlLogger} singleton for logging throughout the system. */
export const log = SohlLogger.getInstance();
