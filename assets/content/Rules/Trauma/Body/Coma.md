---
aliases:
  - Coma
  - Coma Course Test
  - Coma Healing Rate
  - doc-coma
id: bqBGHYIwbqvqaZ5I
type: doc
package: sohl
category: rules
name:
  full: Coma
  aliases: []
folder: edGOkxiCotuMzc1O
shortcode: coma
---

A **coma** is a state of deep unconsciousness in which the victim is near death — unaware and wholly unable to act, communicate, or care for themselves. Unlike the [[doc-shock#shock-state-index|shock states]], which are read off a running index and can improve or worsen from one turn to the next, a coma is a condition in its own right: the victim is out of the fight, out of the story's reach, and stays that way for as long as it lasts.

A coma is reached only one way. An **Unconscious** victim who Critically Fails a [[doc-shock#shock-re-test|Shock Re-Test]] does not merely fail to surface; they sink. A victim who comes out of [[doc-shock#extended-shock|Extended Shock]] while also comatose remains in the coma — the two are recorded separately, and each runs its own course.

A coma is recorded as a **new injury** with Injury Level and Aspect marked "X" (not applicable), and a Healing Rate of

**`Coma HR = 12 − Location Shock Value − Injury Level`**

using the [[doc-character#shock|Shock Value]] of the body location that induced the coma and the [[doc-injrylvl|Injury Level]] of the wound there. A blow that was barely survivable leaves the deepest coma: a skull wound (Shock Value 5) at Injury Level 3 opens the coma at HR 4, where the same level of wound to a calf (Shock Value 1) would open it at HR 8 — a coma to sleep off rather than to die in.

## Coma Course Test {#coma-course-test}

Every **d10 days** the victim may make a Course Roll — a test of **`Healing Base × Coma Healing Rate`**:

| Success Level | Change to Coma HR |
| ------------- | ----------------- |
| CF (−1)       | −2                |
| MF (0)        | −1                |
| MS (1)        | +1                |
| CS (2)        | +2                |

If HR falls to **0 or below** the victim dies. If HR rises to **6 or greater** the victim comes out of the coma, but carries **weariness fatigue equal to the number of days spent in the coma**.

Because the interval is d10 days and each roll moves the rate by one or two, a coma is a matter of weeks, not turns. Nothing about it is decided at the table in a hurry, and a comatose character is cared for or abandoned by the people around them long before the last Course Roll is made.

## See also {#see-also}

- [[doc-shock|Shock]] — the spiral a coma is the worst end of, and the Shock Re-Test that leads into it
- [[doc-hlngbs|Healing Base]] — the rating each Course Roll is made against
- [[doc-fatigue|Fatigue]] — the weariness a survivor carries out
- [[doc-character#shock|Body Structure]] — the Shock Value each location carries
