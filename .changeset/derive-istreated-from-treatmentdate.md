---
"sohl": minor
---

**Derive `isTreated` from a treatment date**

Trauma and Affliction no longer store a separate `isTreated` boolean. Each now
persists a nullable `treatmentDate` (world-time, via the temporal-field helper),
and `isTreated` is a derived getter on the logic (`treatmentDate != null`). The
item sheets replace the "Treated" checkbox with an editable treatment-date field
(using the new `clearableNumberInput` control, so it can be cleared back to
untreated). Context-menu predicates that gated on treatment now read
`itemLogic.isTreated`.

Closes #484.
