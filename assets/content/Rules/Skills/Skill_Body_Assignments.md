---
aliases:
    - Skill Body Assignments
id: cL5j8XD4fBEqWioE
type: doc
package: sohl
category: rules
name:
    full: Skill Body Assignments
    aliases: []
folder: e0HEIHw9qUVWqyzJ
shortcode: skillbodyasign
---

[[Body Roles]] specify which of the body roles each body part enables. Every
skill specifies which body roles it needs. If the given role is impaired or
disabled, then the associated skills become impaired or unusable. For example,
Climbing might list both Manipulator and Locomotor, in which case impairment of
those body parts would impair the skill as well.

When you test a skill, every body part holding one of the roles that skill lists
is consulted:

- If any of those parts is **unusable** — a grievous wound, or a limb lost
  outright — the test **automatically Critically Fails**. No roll is made.
- Otherwise the test suffers the **worst** impairment penalty among those parts:
  **−5** or **−10** or worse. Penalties do not stack across parts; the single
  worst applies.

A skill that lists no roles is never impaired by injury, however badly hurt the
character is.

See [[Body Structure]] for the roles in full, how parts become impaired or
unusable, and how a human's parts are tagged.
