---
"sohl": minor
---

**Document body zones, parts, locations, roles, hit location, impairment, and Shock**

The Rules described a body-structure model the system does not implement, and
omitted the concept that ties an injury to its consequences. Body parts were said
to carry an explicit list of "Affected Skills and Attributes", and hit location was
said to be a success-margin system ("Solid Hit" / "Barely Hit") driven by a weapon
"Strike Accuracy" measured in square feet. Neither exists. The humanoid reference
values were wrong as well, so the zone-number runs derived from them were wrong too.

**Body Part Roles** are now documented as the core mechanism they are. A part is
tagged with the roles it fulfills — _Vital_, _Core_, _Manipulator_, _Locomotor_ —
and skills and attributes name the roles whose injury impairs them, rather than
naming parts. That indirection is what lets one skill definition work on a human,
a serpent, and a dragon alike. A part may hold several roles, and a role several
parts. Mobility and health-criticality are derived from roles, not set separately.

**Hit location** is now documented as it actually resolves: Zone Number plus Zone
Die. The aimed part's zone supplies a target zone number, the strike mode's
**Spread** is rolled as a die, and `Hit ZN = (target ZN − 1) + roll`. Because the
walk is always upward, a loose strike drifts low and never high, and a blow that
resolves past the creature's highest zone number misses outright — which is why
small creatures are harder to place a loose blow on.

**Impairment** now states what it costs and how it is derived: grievous makes a part
_unusable_, serious is −10, and minor is −5 only while slow to heal. It is worst-of
and never additive. A test whose skill names a role held by an unusable part
**automatically Critically Fails**; otherwise it takes the worst penalty among the
parts holding its roles.

**Shock** is documented end to end, from the body location that produces it to the
state it lands the victim in: Shock Value → Shock Index → Shock State. The index
opens at the struck location's Shock Value plus the Injury Level (plus one for a
glancing blow); 4 or less never rolls, above 10 is death, and in between a Shock
test moves the index by +2 / +1 / 0 / −1, which then reads off the state table.
A glancing blow grants +10 on that roll and a marginal-success amputation −20.

The human reference tables — zone weights and numbers, part weights and roles, and
every location's weight, Shock Value, bleeding susceptibility, and amputability —
now match the shipped anatomy, with an explicit statement throughout that other
body structures carry different values and different parts entirely.

Also documents the bleeding-susceptibility and amputability tiers as the grids they
are, and threads the connection through the neighbouring pages: _Skills_ gains an
injury-and-skills section, _Injury_ and _Health_ now name the roles behind
impairment and the critical/limb split, and _Shock_ carries the worked example.
