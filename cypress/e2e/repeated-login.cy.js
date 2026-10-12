/* SPDX-License-Identifier: GPL-3.0-or-later */
describe("Repeated login", () => {
    it("waits for a ready client on both visits", () => {
        cy.login();
        cy.login();
        cy.foundry((win) => win.game.ready).should("eq", true);
    });
});
