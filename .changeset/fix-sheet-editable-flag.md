---
"sohl": patch
---

**Fix always-read-only rich-text editors on document sheets (#453, #452)**

Every SoHL sheet computed its `editable` render-context flag from
`this.document.editable` — but a Foundry _document_ has no `editable` property
(that is a _sheet_ property), so the value was always `!!undefined` → `false`.
The base `DocumentSheetV2._prepareContext` had already set `editable:
this.isEditable` correctly; the override clobbered it.

As a result every `{{editor … editable=editable}}` field (the Being sheet's
Profile _dossier_ and Facade _appearance_ ProseMirror editors) rendered
read-only for everyone, including a GM who owns the actor — the editor never
became editable, so those descriptions could not be edited on the sheet. The
flag now reads `this.isEditable`, so ownership/permission correctly drives
editability. Verified by the previously-red `profile-section` and
`facade-section` e2e specs, which now pass.
