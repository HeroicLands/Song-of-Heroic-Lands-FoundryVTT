---
"sohl": patch
---

**Refactor: split the Foundry-coupled item/actor foundations into per-concern files**

`SohlItem.ts` and `SohlActor.ts` each bundled three concerns — the Document, the
DataModel, and the SheetBase. Each is now its own file:

- `SohlItem.ts` → `SohlItem` (Document) + new `SohlItemDataModel.ts` + `SohlItemSheetBase.ts`
- `SohlActor.ts` → `SohlActor` (Document) + new `SohlActorDataModel.ts` + `SohlActorSheetBase.ts`

Every importer now pulls each class from its own module (no barrel re-exports).
The pre-existing re-export of the Foundry-free logic contracts
(`SohlItemBaseLogic` / `SohlActorBaseLogic` and their types) is unchanged.
Pure reorganization — no behavior change.

Closes #77
