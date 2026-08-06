---
"sohl": minor
---

**Cohort Members tab: a working roster, with add, remove, and a leader**

The Cohort sheet's **Members** tab rendered its section and listed nothing at all,
however many members the cohort had. The template bound fields the schema does not
carry (`member.name`, `member.shortcode`, and a `moveRepName` that exists nowhere),
and the sheet built no context for the part, so there was nothing to list. The tab
is now a real roster, and membership is managed from it.

- **Every member is listed**, resolved from the one handle its entry carries —
  a **shortcode** for a world or compendium actor, or a **UUID** for a token actor
  (a band of orcs are each unlinked tokens of one common actor, which no shortcode
  can tell apart). Each row shows the member actor's portrait, name, and role.
- **A member whose actor no longer resolves still gets a row**, named by its raw
  handle and greyed. A cohort must be able to see — and remove — a member it can no
  longer reach.
- **The leader is one of the members.** A chess-king on each row toggles it:
  clicking a member's king makes them the leader (displacing whoever led before),
  and clicking the lit king on the leader's own row stands them down, leaving the
  cohort with no leader. A leader code naming nobody in the list reads as _no
  leader_ rather than as a stale name.
- **Add and remove from the tab.** **+ Add Member** asks for a shortcode or UUID
  and a role, and refuses anything that does not name an actor you can see, or that
  is already a member. A row's trashcan removes that member after confirming —
  only the membership goes, never the actor. Removing the leader clears the leader.
- **Membership is managed by three intrinsic actions** — `addMember`,
  `removeMember`, and `toggleLeader` — so the row controls, the Actions tab, the
  context menu, and any macro drive one implementation. Nothing happens except at a
  human's invitation; invoked with no member named, the actions ask which one.
- **Spawning a cohort's members onto a scene resolves through the same seam**, so
  members named by shortcode _or_ UUID are found. Previously every member was
  reported missing, because the spawn read a `shortcode` field that does not exist.

_Schema:_ the cohort's `leaderName` (a free-text name) becomes **`leaderCode`**,
holding one of the members' handles. Cohort is a fenced, pre-beta type and this is
an explicit clean break, with no migration; re-pick the leader on any cohort that
had one. `moveRepName` is removed from the tab — it was never a field.

Documentation updated: the Cohort user-guide page documents the tab, its two handle
forms, the leader toggle, and the three actions; the common-tabs reference points
at it.

Closes #1151
