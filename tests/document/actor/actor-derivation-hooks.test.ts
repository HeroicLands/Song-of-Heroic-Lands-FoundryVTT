import { beforeEach, afterEach, describe, expect, it, vi } from "vitest";
const mock = vi.hoisted(() => ({ actors: [] as any[], handlers: new Map<string, Function>() }));
vi.mock("@src/core/FoundryHelpers", () => ({ fvttWorldActors: () => mock.actors }));
import {
    refreshActorDerivations,
    registerActorDerivationHooks,
} from "@src/document/actor/foundry/actor-derivation-hooks";
const actor = (id: string, members: string[] = []) => ({
    documentName: "Actor",
    id,
    uuid: `Actor.${id}`,
    system: { shortcode: id, members: members.map((shortcodeOrUuid) => ({ shortcodeOrUuid })) },
    logic: { deriveMembershipState: vi.fn() },
    apps: { sheet: { rendered: true, render: vi.fn() } },
});
beforeEach(() => {
    mock.actors = [];
    mock.handlers.clear();
    vi.stubGlobal("game", { scenes: [] });
    vi.stubGlobal("Hooks", {
        on: (name: string, callback: Function) => mock.handlers.set(name, callback),
        once: vi.fn(),
    });
});
afterEach(() => vi.unstubAllGlobals());
describe("actor derivation dependency observers", () => {
    it("refreshes transitive references once and leaves unrelated actors alone", () => {
        const member = actor("member"),
            cohort = actor("cohort", ["member"]),
            outer = actor("outer", ["cohort"]),
            unrelated = actor("other");
        mock.actors = [member, cohort, outer, unrelated];
        refreshActorDerivations(member);
        expect(cohort.logic.deriveMembershipState).toHaveBeenCalledOnce();
        expect(outer.logic.deriveMembershipState).toHaveBeenCalledOnce();
        expect(unrelated.logic.deriveMembershipState).not.toHaveBeenCalled();
        expect(cohort.apps.sheet.render).toHaveBeenCalledOnce();
    });
    it("retains old shortcode dependencies across rename and refreshes embedded changes", () => {
        const member = actor("old"),
            cohort = actor("cohort", ["old"]);
        mock.actors = [member, cohort];
        registerActorDerivationHooks();
        vi.clearAllMocks();
        mock.handlers.get("preUpdateActor")!(member);
        member.system.shortcode = "new";
        mock.handlers.get("updateActor")!(member);
        expect(cohort.logic.deriveMembershipState).toHaveBeenCalledOnce();
        mock.handlers.get("updateItem")!({ parent: member });
        expect(cohort.logic.deriveMembershipState).toHaveBeenCalledTimes(2);
    });
    it("includes synthetic actors at ready and never opens a closed sheet", () => {
        const synthetic = actor("token"),
            world = actor("world");
        synthetic.apps.sheet.rendered = false;
        mock.actors = [world];
        vi.stubGlobal("game", { scenes: [{ tokens: [{ actor: synthetic }] }] });
        registerActorDerivationHooks();
        expect(synthetic.logic.deriveMembershipState).toHaveBeenCalledOnce();
        expect(synthetic.apps.sheet.render).not.toHaveBeenCalled();
    });
    it("refreshes deleted members and nested effect owners without recursive preparation", () => {
        const member = actor("member"),
            cohort = actor("cohort", ["Actor.member"]);
        mock.actors = [member, cohort];
        registerActorDerivationHooks();
        vi.clearAllMocks();
        mock.handlers.get("deleteActiveEffect")!({
            parent: { documentName: "Item", parent: member },
        });
        expect(cohort.logic.deriveMembershipState).toHaveBeenCalledOnce();
        mock.handlers.get("preDeleteActor")!(member);
        mock.actors = [cohort];
        mock.handlers.get("deleteActor")!(member);
        expect(cohort.logic.deriveMembershipState).toHaveBeenCalledTimes(2);
    });

    it("terminates cyclic roster dependencies and refreshes vehicle and structure methods", () => {
        const one = actor("one", ["two"]),
            two = actor("two", ["one"]);
        const vehicle = {
            ...actor("vehicle"),
            system: { occupants: [{ actorCodeOrUuid: "two" }] },
            logic: { deriveVehicleState: vi.fn() },
        };
        const structure = {
            ...actor("structure"),
            system: { occupants: [{ actorCodeOrUuid: "two" }] },
            logic: { deriveStructureState: vi.fn() },
        };
        mock.actors = [one, two, vehicle, structure];
        refreshActorDerivations(one);
        expect(one.logic.deriveMembershipState).toHaveBeenCalledOnce();
        expect(two.logic.deriveMembershipState).toHaveBeenCalledOnce();
        expect(vehicle.logic.deriveVehicleState).toHaveBeenCalledOnce();
        expect(structure.logic.deriveStructureState).toHaveBeenCalledOnce();
    });
    it("refreshes old and new references when a token changes actor, and retains the old actor for deletion", () => {
        const old = actor("old"),
            replacement = actor("new");
        const oldRoster = actor("oldRoster", ["Actor.old"]),
            newRoster = actor("newRoster", ["Actor.new"]);
        mock.actors = [oldRoster, newRoster];
        const token: { actor?: typeof old } = { actor: old };
        vi.stubGlobal("game", { scenes: [{ tokens: [token] }] });
        registerActorDerivationHooks();
        vi.clearAllMocks();
        mock.handlers.get("preUpdateToken")!(token);
        token.actor = replacement;
        mock.handlers.get("updateToken")!(token);
        expect(oldRoster.logic.deriveMembershipState).toHaveBeenCalledOnce();
        expect(newRoster.logic.deriveMembershipState).toHaveBeenCalledOnce();
        vi.clearAllMocks();
        mock.handlers.get("preDeleteToken")!(token);
        token.actor = undefined;
        mock.handlers.get("deleteToken")!(token);
        expect(newRoster.logic.deriveMembershipState).toHaveBeenCalledOnce();
    });
});
