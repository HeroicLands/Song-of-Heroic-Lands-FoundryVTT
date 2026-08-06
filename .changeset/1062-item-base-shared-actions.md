---
"sohl": patch
---

**Docs: the shared document actions and shared dialogs, documented once on Base Item**

Four actions belong to every document rather than to any one item type, and three
dialogs turn up attached to actions all across the system. None of them were
documented, so every page in the Intrinsic Action epic had something to link to that
did not yet exist. `User_Guide/Items/Item_Base.md` now carries all of them, and the
per-type pages link here instead of restating them.

- **The shared actions** — **Edit** (`editDocument`), **Delete** (`deleteDocument`),
  **Output Description to Chat** (`outputDescription`, every item), and **Make Default
  Medium** (`makeDefaultMedium`, every actor) — each with its shortcode, icon, API
  link, how it is invoked, and what it changes. Delete's confirmation dialog is
  documented button by button, including that **Cancel** is the default, and the
  Container override that deletes a container's contents along with it. The
  description card is described row by row.
- **The standard test dialog** — the pre-roll window nearly every d100 in SoHL opens
  first: **Target**, the modifier breakdown, **Situational Modifier**, **Success Level
  Modifier**, and **Roll Visibility** (all five visibility options and who sees what),
  plus what each modifier is actually for, that cancelling abandons the test, and why
  a few tests skip the dialog entirely.
- **The strike-mode picker** — its title, prompt, **Use**/**Cancel** buttons, and the
  two common cases where it does not appear at all (a single strike mode; a mode
  clicked on the combat tab).
- **The offer-schedule dialog** — the per-effect title, the prompt with its rolled
  cadence, **Schedule It** (the default) and **Not Now**, that declining is safe, and
  the _offer → remind → perform → offer the next_ loop the reminder card continues.
- **GM result edit** (`resultEdit`) — the GM-only pencil on a posted test card: what
  it re-opens, that it re-evaluates on the same frozen roll and never re-rolls, that
  an unchanged submit is a no-op, and that non-GMs are refused at click time as well
  as having the pencil hidden.

The **Actions Tab** section gains pointers to the new material and to `Actions` for
the action mechanism itself.

Three defects found while writing the page are noted in place and filed: the delete
confirmation's title bar renders `Delete undefined}: {name}` (#1095), `makeDefaultMedium`
silently does nothing when invoked without a medium in scope (#1098), and the GM
result-edit dialog shows a **Roll Visibility** field that is discarded (#1099).

Closes #1062
