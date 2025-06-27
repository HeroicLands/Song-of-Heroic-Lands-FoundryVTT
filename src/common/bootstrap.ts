import { SohlSystem } from "@common";

function setupVariant() {
    const variantId = (game as any).settings?.get("sohl", "variant");
    globalThis.sohl = SohlSystem.selectVariant(variantId);
    foundry.utils.mergeObject(CONFIG, sohl.game.CONFIG);
    console.log(sohl.game.initMessage);
}

export const fvtt = globalThis.foundry as unknown as FoundryGlobal;
globalThis.fvtt = fvtt;

if (!globalThis.sohl) setupVariant();
export const sohl = globalThis.sohl as SohlSystem;
