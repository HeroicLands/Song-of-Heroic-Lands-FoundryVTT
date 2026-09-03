---
"sohl": minor
---

Declare all eleven affiliation subtypes the content format declares, and derive
the picker partition from them (#1788).

`AFFILIATION_SUBTYPE` held four values — `arcane`, `divine`, `spirit`, `social` —
where the content format declares eleven for the same field. They were never
variants of one taxonomy: `social` was a residue bucket meaning _not magical_, so
a guild, a bank, a noble house and a legion all carried it and it distinguished
none of them.

**This is a defect rather than a difference**, because the format maps a note's
`subType` **straight onto** `system.subType`. Eight of the eleven were not valid
choices here, and the field is `required` with no `initial` — so a note authored
to the format compiled a document this system could not construct. The check that
verifies every `system.*` target the format names _exists_ cannot see that the
_values_ disagree, so it passed and failed at construction instead.

**The four-value partition survives, derived.** `AFFILIATION_CLASS` and
`affiliationClassOf()` classify the eleven: the three traditions by what they
face — arcane, divine, spirit — and every other kind of body as `social`, which
is what that value always meant. `AffiliationLogic.subTypeClass` reads it off a
document. The map is exhaustive by construction, so a subtype added without a
class is a compile error rather than a picker that silently drops it. The four
localization keys are borrowed rather than reminted: they labelled exactly this
partition already, and keys are permanent.

**A world on the old values migrates without intervention.** `arcane`, `divine`
and `spirit` become `arcanetradition`, `faithtradition` and `spirittradition` —
each named the tradition the new value names. `social` **cannot be resolved from
the stored value alone**, so it lands on `fellowship`, the one value defined by
the absence of the others' markers, and the migration's description says so: a GM
re-picking eight ways is work only a human can do. The stamping step that defaults
an unrecognized value now skips the four legacy ones, so the two steps cannot
clobber one another whichever runs first.

The corpus is entirely in the satellite repositories — this one authors no
affiliation notes at all.
