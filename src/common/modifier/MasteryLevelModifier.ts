/*
 * This file is part of the Song of Heroic Lands (SoHL) system for Foundry VTT.
 * Copyright (c) 2024-2025 Tom Rodriguez ("Toasty") — <toasty@heroiclands.com>
 *
 * This work is licensed under the GNU General Public License v3.0 (GPLv3).
 * You may copy, modify, and distribute it under the terms of that license.
 *
 * For full terms, see the LICENSE.md file in the project root or visit:
 * https://www.gnu.org/licenses/gpl-3.0.html
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { DialogButtonCallback, getSystemSetting, getTargetedTokens, inputDialog } from "@common/FoundryProxy";
import { SohlLogic, SohlSpeaker } from "@common";
import { ValueDelta, ValueModifier } from "@common/modifier";
import { OpposedTestResult, SuccessTestResult } from "@common/result";
import { FilePath, toFilePath, toHTMLWithTemplate } from "@utils";
import { SohlArray } from "@utils/collection";
import { SohlAction } from "@common/event";

export class MasteryLevelModifier extends ValueModifier {
    minTarget!: number;
    maxTarget!: number;
    successLevelMod!: number;
    critFailureDigits!: number[];
    critSuccessDigits!: number[];
    testDescTable!: MasteryLevelModifier.DetailedDescription[];

    get constrainedEffective(): number {
        return Math.min(
            this.maxTarget,
            Math.max(this.minTarget, this.effective),
        );
    }

    constructor(
        data: Partial<MasteryLevelModifier.Data> = {},
        options: Partial<MasteryLevelModifier.Options> = {},
    ) {
        super(data, options);
        this.minTarget = data.minTarget ?? Number.MIN_SAFE_INTEGER;
        this.maxTarget = data.maxTarget ?? Number.MAX_SAFE_INTEGER;
        this.successLevelMod = data.successLevelMod ?? 0;
        this.critFailureDigits = data.critFailureDigits ?? [];
        this.critSuccessDigits = data.critSuccessDigits ?? [];
        this.testDescTable = data.testDescTable ?? [];
    }

    /**
     * Performs a Mastery Level success test.
     * @remarks
     * If no `priorTestResult` is provided, this method will create a new
     * test result based on the mastery level of the current item, displaying a
     * dialog (unless inhibited) to collect modifiers to the test and then
     * rolling dice to determine test outcome.
     *
     * If a `priorTestResult` is provided, this method will display a dialog
     * (unless inhibited) to collect modifiers but will then apply those
     * modifiers to the prior test roll (without rolling again), generating
     * a new test result based on the modifiers and the prior roll.
     *
     * The purpose of the `priorTestResult` is to allow modifiers to be changed
     * without modifying the random dice roll itself, such as when fate is applied
     * to an already rolled test.
     *
     * @param context - The context in which to perform the test.
     * @returns A Promise resolving to `null` if the test was cancelled, `false`
     * if there was an error during the test, or the result of the success test.
     */
    async successTest(
        context: SuccessTestResult.Context,
    ): Promise<SuccessTestResult | null | false> {
        const testResult: SuccessTestResult =
            sohl.game.CONFIG.SuccessTestResult(
                context.priorTestResult ?? {
                    chat: context.speaker,
                    type: context.type,
                    title: context.title,
                    mlMod: this.clone(),
                },
                {
                    parent: this.parent,
                },
            );
        if (!testResult) {
            throw new Error("Failed to create SuccessTestResult.");
        }

        if (!context.skipDialog) {
            // Render modal dialog
            let dlgTemplate: FilePath = toFilePath(
                "systems/sohl/templates/dialog/standard-test-dialog.html",
            );

            let dialogData: PlainObject = {
                variant: sohl.game.id,
                type: testResult.testType,
                title: sohl.i18n.format(
                    "SOHL.MasteryLevelModifier.successTest.dialogTitle",
                    {
                        name: testResult.speaker.name,
                        title: testResult.testType,
                    },
                ),
                mlMod: testResult.masteryLevelModifier,
                situationalModifier: 0,
                rollMode: testResult.rollMode,
                rollModes: Object.entries(SohlSpeaker.ROLL_MODE).map(
                    ([k, v]) => ({
                        group: "CHAT.RollDefault",
                        value: k,
                        label: v,
                    }),
                ),
            };

            // Create the dialog window
            const result: PlainObject | null = await inputDialog({
                title: sohl.i18n.format(
                    "SOHL.MasteryLevelModifier.successTest.dialogLabel",
                ),
                template: dlgTemplate,
                data: dialogData,
                callback: ((
                    _event: PointerEvent | SubmitEvent,
                    button: HTMLButtonElement,
                    _dialog: HTMLDialogElement,
                ): Promise<any> => {
                    const form = button.querySelector("form");
                    if (!form || !testResult) return Promise.resolve(null);
                    const fd = new fvtt.applications.ux.FormDataExtended(form);
                    const formData = fd.object;
                    if (formData.situationalModifier) {
                        testResult.masteryLevelModifier.add(
                            ValueDelta.ID.PLAYER,
                            formData.situationalModifier,
                        );
                    }
                    testResult.masteryLevelModifier.successLevelMod =
                        formData.successLevelMod;
                    testResult.rollMode = formData.rollMode;
                    return Promise.resolve(true);
                }) as DialogButtonCallback,
                rejectClose: false,
            });

            if (!result) return null;
        }

        let allowed: boolean = await testResult.evaluate();

        if (allowed && context.speaker) {
            await testResult.toChat(context.speaker);
        }
        return allowed ? testResult : false;
    }

    /**
     * Perform an opposed test
     * @param {object} options
     * @returns {SuccessTestChatData}
     */
    async opposedTestStart(
        context: OpposedTestResult.Context,
    ): Promise<SuccessTestResult | null> {
        if (!context.speaker) {
            context.speaker = new SohlSpeaker();
        }
        if (!context.scope) context.scope = {};
        context.scope.targetToken ||=
            getTargetedTokens(true)?.[0] ?? undefined;
        if (!context.scope.targetToken) return null;
        context.type ||= `${this.item?.type}-${this.item?.name}-opposedtest`;
        context.title ||= sohl.i18n.format("{label} Opposed Test", {
            label: this.item?.label,
        });
        if (!context.token) {
            ui.notifications.warn(
                sohl.i18n.format("No attacker token identified."),
            );
            return null;
        }

        if (!context.token.isOwner) {
            ui.notifications.warn(
                sohl.i18n.format(
                    "You do not have permissions to perform this operation on {name}",
                    { name: context.token.name },
                ),
            );
            return null;
        }
        let sourceTestContext: SuccessTestResult.Context;
        if (context.priorTestResult) {
            const srcTestRes = context.priorTestResult.sourceTestResult;
            sourceTestContext = new sohl.game.CONFIG.SuccessTestResult.Context({
                speaker: srcTestRes.speaker.toJSON() as SohlSpeaker.Data,
                item: this.item,
                title: srcTestRes.title,
                mlMod: srcTestRes.masteryLevelModifier,
            });
        } else {
            context.priorTestResult = new sohl.game.CONFIG.SuccessTestResult({
                    speaker: context.speaker,
                    item: this.item,
                    rollMode: getSystemSetting("rollMode", "core"),
                    type: SuccessTestResult.TEST_TYPE.SKILL,
                    title:
                        context.title ||
                        sohl.i18n.format("{name} {label} Test", {
                            name:
                                context.token.name ||
                                context.speaker.actor?.name,
                            label: this.item?.label,
                        }),
                    situationalModifier: 0,
                    mlMod: fvtt.utils.deepClone(this._masteryLevel),
                },
                { parent: this },
            );
        }
        let sourceTestContext: SuccessTestResult.Context =
            new SuccessTestResult.Context({
                speaker: context.priorTestResult.speaker.toJSON() as SohlSpeaker.Data,
                item: this.item,
                rollMode: getSystemSetting("rollMode", "core"),
                title: context.title,
                situationalModifier: context.situationalModifier || 0,
                mlMod: fvtt.utils.deepClone(this._masteryLevel),
            });
        let sourceTestResult =
            context.priorTestResult?.sourceTestResult ??
            new sohl.game.CONFIG.SuccessTestResult(
                {
                    speaker: context.speaker,
                    item: this.item,
                    rollMode: getSystemSetting("rollMode", "core"),
                    title:
                        context.title ||
                        sohl.i18n.format("{name} {label} Test", {
                            name:
                                context.token.name ||
                                context.speaker.actor?.name,
                            label: this.item?.label,
                        }),
                    situationalModifier: 0,
                    mlMod: fvtt.utils.deepClone(this._masteryLevel),
                },
                { parent: this },
            );

        const sourceTestContext: SuccessTestResult.Context =
            new SuccessTestResult.Context({
                speaker: context.speaker.toJSON() as SohlSpeaker.Data,
                item: this.item,
                rollMode: getSystemSetting("rollMode", "core"),
                title: context.title,
                situationalModifier: context..sourceTestResult.situationalModifier || 0,
                mlMod: fvtt.utils.deepClone(this._masteryLevel),
            });
        const targetTestResult =
            await this._masteryLevel.successTest(sourceTestContext);

        const opposedTest = new sohl.CONFIG.OpposedTestResult(
            {
                speaker: context.speaker,
                targetToken: context.scope.targetToken,
                sourceTestResult,
                targetTestResult,
            },
            { parent: this },
        );

        return opposedTest.toRequestChat();
    }

    async opposedTestResume(
        context: OpposedTestResult.Context,
    ): Promise<OpposedTestResult | false | null> {
        let { noChat = false, priorTestResult } = context;

        if (!priorTestResult) {
            throw new Error("Must supply priorTestResult");
        }

        let opposedTestResult: OpposedTestResult = priorTestResult;
        if (!priorTestResult.targetTestResult) {
            priorTestResult.targetTestResult =
                new sohl.CONFIG.SuccessTestResult(
                    {
                        speaker: context.speaker || new SohlSpeaker(),
                        item: this.item,
                        rollMode: getSystemSetting("rollMode", "core"),
                        type: SuccessTestResult.TEST_TYPE.SKILL,
                        title: sohl.i18n.format("Opposed {label} Test", {
                            label: this.item?.label,
                        }),
                        situationalModifier: 0,
                        mlMod: fvtt.utils.deepClone(
                            this.item?.system._masteryLevel,
                        ),
                    },
                    { parent: this },
                );

            const targetTestResult = await this.successTest(new SuccessTestResult.Context({
                noChat: true,
                rollMode:
                    getSystemSetting("rollMode", "core") ||
                    SohlSpeaker.ROLL_MODE.SYSTEM,
                title:
                    context.title ||
                    sohl.i18n.format("{name} {label} Test", {
                        name:
                            context.token?.name ||
                            context.speaker.actor?.name,
                        label: this.item?.label,
                    }),
                situationalModifier: 0,
            }));
            if (!targetTestResult) return targetTestResult;
            priorTestResult.targetTestResult = targetTestResult;
        } else {
            // In this situation, where the targetTestResult is provided,
            // the GM is modifying the result of a prior opposedTest.
            // Therefore, we re-display the dialog for each of the prior
            // successTests.
            opposedTestResult.sourceTestResult =
                opposedTestResult.sourceTestResult..item.successTest({
                    noChat: true,
                    successTestResult: opposedTestResult.sourceTestResult,
                });
            opposedTestResult.targetTestResult =
                opposedTestResult.targetTestResult.item.successTest({
                    noChat: true,
                    successTestResult: opposedTestResult.targetTestResult,
                });
        }

        let allowed = await opposedTestResult.evaluate();

        if (allowed && !noChat) {
            opposedTestResult.toChat({
                template:
                    "systems/sohl/templates/chat/opposed-result-card.html",
                title: sohl.i18n.format("Opposed Action Result"),
            });
        }

        return allowed ? opposedTestResult : false;
    }

    async improveWithSDR(context: SohlAction.Context): Promise<void> {
        const updateData: PlainObject = { "system.improveFlag": false };
        let roll = await Roll.create(`1d100 + ${this.skillBase.value}`);
        const isSuccess = (roll.total ?? 0) > this._masteryLevel.base;

        if (isSuccess) {
            updateData["system.masteryLevelBase"] =
                this.parent.masteryLevelBase + this.sdrIncr;
        }
        let prefix = sohl.i18n.format("{subType} {label}", {
            subType: this.constructor.subTypes[this.subType],
            label: sohl.i18n.format(this.constructor.metadata.label),
        });
        const chatTemplate: FilePath = toFilePath(
            "systems/sohl/templates/chat/standard-test-card.html",
        );
        const chatTemplateData = {
            variant: CONFIG.SOHL.id,
            type: `${this.type}-${this.name}-improve-sdr`,
            title: sohl.i18n.format("{label} Development Roll", {
                label: this.item.label,
            }),
            effTarget: this._masteryLevel.base,
            isSuccess: isSuccess,
            rollValue: roll.total,
            rollResult: roll.result,
            showResult: true,
            resultText:
                isSuccess ?
                    sohl.i18n.format("{prefix} Increase", { prefix })
                :   sohl.i18n.format("No {prefix} Increase", { prefix }),
            resultDesc:
                isSuccess ?
                    sohl.i18n.format(
                        "{label} increased by {incr} to {final}",
                        {
                            label: this.item.label,
                            incr: this.sdrIncr,
                            final: this._masteryLevel.base + this.sdrIncr,
                        },
                    )
                :   "",
            description:
                isSuccess ?
                    sohl.i18n.format("SOHL.TestResult.SUCCESS")
                :   sohl.i18n.format("SOHL.TestResult.FAILURE"),
            notes: "",
            sdrIncr: this.sdrIncr,
        };

        const chatHtml = await toHTMLWithTemplate(
            chatTemplate,
            chatTemplateData,
        );

        const messageData = {
            user: game.user.id,
            speaker,
            content: chatHtml.trim(),
            sound: CONFIG.sounds.dice,
        };

        ChatMessage.applyRollMode(messageData, ChatMessageRollMode.SYSTEM);

        // Create a chat message
        await ChatMessageClass.create(messageData);
    }

            get fateSkills(): string[] {
                return (
                    (fvtt.utils.getProperty(
                        this.item,
                        "sohl.fateSkills",
                    ) as string[]) || []
                );
            }
    
            get magicMod(): number {
                return 0;
            }
    
            get boosts(): number {
                return this._boosts;
            }
    
            /**
             * Searches through all of the Fate mysteries on the actor, gathering any that
             * are applicable to this skill, and returns them.
             *
             * @readonly
             * @type {SohlItem[]} An array of Mystery fate items that apply to this skill.
             */
            get availableFate() {
                let result: SohlItem[] = [];
                if (!this._masteryLevel.disabled && this.actor) {
                    this.actor.items.values().forEach((it: SohlItem) => {
                        if (Mystery.Data.isA(it.system, Mystery.SUBTYPE.FATE)) {
                            const logic = it.system.logic;
                            const fateSkills = this.fateSkills;
                            // If a fate item has a list of fate skills, then that fate
                            // item is only applicable to those skills.  If the fate item
                            // has no list of skills, then the fate item is applicable
                            // to all skills.
                            if (
                                !fateSkills.length ||
                                fateSkills.includes(this.item?.name || "")
                            ) {
                                if (logic.level.effective > 0) result.push(it);
                            }
                        }
                    });
                }
                return result;
            }
    
            // get fateBonusItems() {
            //     let result: SohlItem[] = [];
            //     if (this.actor) {
            //         this.actor.items.forEach((it: SohlItem) => {
            //             if (
            //                 Mystery.Data.isA(it.system, Mystery.SUBTYPE.FATEBONUS)) {
            //                 const skills:  = it.fateSkills;
            //                 if (!skills || skills.includes(this.item?.name || "")) {
            //                     if (
            //                         !it.system.$charges.disabled ||
            //                         it.system.$charges.effective > 0
            //                     ) {
            //                         result.push(it);
            //                     }
            //                 }
            //             }
            //         }
            //     }
            //     return result;
            // }
    
            // get canImprove() {
            //     return (
            //         ((fvtt.game.user as any)?.isGM || this.item?.isOwner) &&
            //         !this._masteryLevel.disabled
            //     );
            // }
    
            get valid() {
                return this.skillBase.valid;
            }
    
            get skillBase() {
                return this._skillBase;
            }
    
            get sdrIncr() {
                return 1;
            }
    
    
    static _handleDetailedDescription(
        chatData: PlainObject,
        target: number,
        testDescTable: MasteryLevelModifier.DetailedDescription[],
    ): number | undefined {
        let result: Optional<number | ((chatData: PlainObject) => number)>;
        testDescTable.sort((a, b) => a.maxValue - b.maxValue);
        const testDesc: Optional<MasteryLevelModifier.DetailedDescription> =
            testDescTable.find((entry) => entry.maxValue >= target);
        if (testDesc) {
            // If the test description has a limitation based on
            // the last digit, find the one that applies.
            if (testDesc.limited?.length) {
                const limitedDesc: Optional<MasteryLevelModifier.LimitedDescription> =
                    testDesc.limited
                        .values()
                        .find((d) => d.lastDigits.includes(chatData.lastDigit));
                if (limitedDesc) {
                    const label: string =
                        limitedDesc.label instanceof Function ?
                            limitedDesc.label(chatData)
                        :   limitedDesc.label;
                    const desc: string =
                        limitedDesc.description instanceof Function ?
                            limitedDesc.description(chatData)
                        :   limitedDesc.description;
                    chatData.resultText = label || "";
                    chatData.resultDesc = desc || "";
                    chatData.svSuccess = limitedDesc.success;
                    result = limitedDesc.result;
                }
            } else {
                const label =
                    testDesc.label instanceof Function ?
                        testDesc.label(chatData)
                    :   testDesc.label;
                const desc =
                    testDesc.description instanceof Function ?
                        testDesc.description(chatData)
                    :   testDesc.description;
                chatData.resultText = label || "";
                chatData.resultDesc = desc || "";
                chatData.svSuccess = testDesc.success;
                result = testDesc.result;
            }
        }

        if (typeof result === "function") result = result(chatData);

        return result;
    }

            initialize(context: SohlAction.Context): void {
                this._boosts = 0;
                // this._masteryLevel = new CONFIG.SOHL.class.MasteryLevelModifier(
                //     {
                //         properties: {
                //             fate: new CONFIG.SOHL.class.MasteryLevelModifier(
                //                 {},
                //                 { parent: this },
                //             ),
                //         },
                //     },
                //     { parent: this },
                // );
                // this._masteryLevel.setBase(this.masteryLevelBase);
                // if (this.actor) {
                //     const fateSetting = game.settings.get("sohl", "optionFate");
    
                //     if (fateSetting === "everyone") {
                //         this._masteryLevel.fate.setBase(50);
                //     } else if (fateSetting === "pconly") {
                //         if (this.actor.hasPlayerOwner) {
                //             this._masteryLevel.fate.setBase(50);
                //         } else {
                //             this._masteryLevel.fate.setDisabled(
                //                 sohl.i18n.format("Non-Player Character/Creature"),
                //                 "NPC",
                //             );
                //         }
                //     } else {
                //         this._masteryLevel.fate.setDisabled(
                //             sohl.i18n.format("Fate Disabled in Settings"),
                //             "NoFate",
                //         );
                //     }
                // }
                // this._skillBase ||= new SkillBase(this.skillBaseFormula, {
                //     items: this.actor?.items,
                // });
            }
    
            evaluate(context: SohlAction.Context): void {
                // this._skillBase.setAttributes(this.actor.allItems());
    
                // if (this._masteryLevel.base > 0) {
                //     let newML = this._masteryLevel.base;
    
                //     for (let i = 0; i < this.boosts; i++) {
                //         newML += this.constructor.calcMasteryBoost(newML);
                //     }
    
                //     this._masteryLevel.setBase(newML);
                // }
    
                // // Ensure base ML is not greater than MaxML
                // if (this._masteryLevel.base > this._masteryLevel.max) {
                //     this._masteryLevel.setBase(this._masteryLevel.max);
                // }
    
                // if (this.skillBase.attributes.includes("Aura")) {
                //     // Any skill that has Aura in its SB formula cannot use fate
                //     this._masteryLevel.fate.setDisabled(
                //         sohl.i18n.format("Aura-Based, No Fate"),
                //         "AurBsd",
                //     );
                // }
            }

            finalize(context: SohlAction.Context): void {
                // if (this._masteryLevel.disabled) {
                //     this._masteryLevel.fate.setDisabled(
                //         CONFIG.SOHL.MOD.MLDSBL.name,
                //         CONFIG.SOHL.MOD.MLDSBL.abbrev,
                //     );
                // }
                // if (!this._masteryLevel.fate.disabled) {
                //     const fate = this.actor.getTraitByAbbrev("fate");
                //     if (fate) {
                //         this._masteryLevel.fate.addVM(fate.system.$score, {
                //             includeBase: true,
                //         });
                //     } else {
                //         this._masteryLevel.fate.setBase(50);
                //     }
    
                //     // Apply magic modifiers
                //     if (this.magicMod) {
                //         this._masteryLevel.fate.add(
                //             CONFIG.SOHL.MOD.MAGICMOD,
                //             this.magicMod,
                //         );
                //     }
    
                //     this.fateBonusItems.forEach((it) => {
                //         this._masteryLevel.fate.add(
                //             CONFIG.SOHL.MOD.FATEBNS,
                //             it.system.$level.effective,
                //             { skill: it.label },
                //         );
                //     });
                //     if (!this.availableFate.length) {
                //         this._masteryLevel.fate.setDisabled(CONFIG.SOHL.MOD.NOFATE);
                //     }
                // }
            }
    
}

export namespace MasteryLevelModifier {
    export interface Data extends ValueModifier.Data {
        minTarget: number;
        maxTarget: number;
        successLevelMod: number;
        critFailureDigits: number[];
        critSuccessDigits: number[];
        testDescTable: DetailedDescription[];
    }

    export interface Options extends ValueModifier.Options {}

    export interface LimitedDescription {
        lastDigits: number[];
        label: string | ((chatData: PlainObject) => string);
        description: string | ((chatData: PlainObject) => string);
        success: boolean;
        result: number | ((chatData: PlainObject) => number);
    }

    export interface DetailedDescription extends LimitedDescription {
        maxValue: number;
        limited: SohlArray<LimitedDescription>;
    }
}
