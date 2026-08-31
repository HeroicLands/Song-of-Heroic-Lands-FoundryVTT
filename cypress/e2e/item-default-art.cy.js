// Runtime default-artwork: a freshly-created item with no explicit `img` gets
// its per-type themed default (SohlItem.getDefaultArtwork), not Foundry's white
// `icons/svg/item-bag.svg`. Regression for #932.

const BAG = "icons/svg/item-bag.svg";

describe("item default artwork (#932)", () => {
    before(() => cy.login().then(() => cy.cleanupWorld()));
    afterEach(() => cy.cleanupWorld());

    it("SohlItem.getDefaultArtwork maps known types and falls back for unknown", () => {
        cy.foundry((win) => {
            const Cls = win.CONFIG.Item.documentClass;
            return {
                trauma: Cls.getDefaultArtwork({ type: "trauma" }).img,
                affliction: Cls.getDefaultArtwork({ type: "affliction" }).img,
                weapongear: Cls.getDefaultArtwork({ type: "weapongear" }).img,
                unknown: Cls.getDefaultArtwork({ type: "base" }).img,
                noType: Cls.getDefaultArtwork({}).img,
            };
        }).should((art) => {
            expect(art.trauma).to.eq("systems/sohl/assets/icons/other/injury.svg");
            expect(art.affliction).to.eq("systems/sohl/assets/icons/other/sick.svg");
            expect(art.weapongear).to.eq("systems/sohl/assets/icons/other/sword.svg");
            // Unknown/`base`/typeless fall back to Foundry's default (no throw).
            expect(art.unknown).to.eq(BAG);
            expect(art.noType).to.eq(BAG);
        });
    });

    it("a trauma created without an img gets the wound icon, not the bag", () => {
        cy.importActor().as("actor");
        cy.then(function () {
            cy.createItemOn(this.actor, "trauma", { name: "Gash" }).should((item) => {
                expect(item.img).to.eq("systems/sohl/assets/icons/other/injury.svg");
                expect(item.img).to.not.eq(BAG);
            });
        });
    });

    it("an affliction created without an img gets the sick icon", () => {
        cy.importActor().as("actor");
        cy.then(function () {
            cy.createItemOn(this.actor, "affliction", {
                name: "Ague",
            }).should((item) => {
                expect(item.img).to.eq("systems/sohl/assets/icons/other/sick.svg");
                expect(item.img).to.not.eq(BAG);
            });
        });
    });

    it("a world (unowned) item created without an img gets its themed default", () => {
        cy.createWorldItem("weapongear", { name: "Blade" }).should((item) => {
            expect(item.img).to.eq("systems/sohl/assets/icons/other/sword.svg");
            expect(item.img).to.not.eq(BAG);
        });
    });
});
