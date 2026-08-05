---
"sohl": patch
---

**User Guide: Intrinsic Actions on the nine inherit-only pages**

Nine document types define no intrinsic action of their own — they carry only the
shared document actions, plus `toggleCarried` for gear. Each of their User-Guide
pages gains a short **Intrinsic Actions** section that names the inherited set
(action, shortcode) and **links** to the canonical write-up rather than restating
it (#1074, part of the intrinsic-action documentation epic #1061):

| Pages                                                         | Inherited set                                                           |
| ------------------------------------------------------------- | ----------------------------------------------------------------------- |
| _Container_, _Concoction_, _Miscellaneous Gear_, _Projectile_ | `editDocument`, `deleteDocument`, `outputDescription` + `toggleCarried` |
| _Mystery_, _Affiliation_                                      | `editDocument`, `deleteDocument`, `outputDescription`                   |
| _Vehicle_, _Structure_, _Cohort_                              | `editDocument`, `deleteDocument`, `makeDefaultMedium`                   |

Each section also answers the question a reader is left with once they know the
type adds nothing: a concoction has no _use_ action (drinking one stays a table
decision), a projectile is spent by attacking with the ranged weapon that names
it, an affiliation is a credential that is never rolled, a Mystery's effect is
carried by its Active Effects, and the three non-Being actors inherit **Make
Default Medium** without a movement table to drive it.
