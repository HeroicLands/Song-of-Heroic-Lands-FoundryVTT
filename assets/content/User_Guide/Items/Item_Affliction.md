---
aliases:
    - Affliction
id: MoyrkIfKbklVs8Pn
type: doc
package: sohl
category: user-guide
name:
    full: "Affliction"
slug: "item-affliction"
folder: QtOgPodi8X6gDWL0
---

# What Is an Affliction?

An Affliction represents an ongoing condition affecting a Being — diseases, poisons, curses, magical maladies, or other persistent effects that have a course and potentially a cure. Unlike injuries (which are specific wounds), afflictions model conditions that progress over time, may be transmitted to others, and require specific treatments to resolve.

# Where It Appears

Afflictions appear on the **Trauma** tab of the Being sheet and track the condition's progression. Afflictions can be added when a character is exposed to disease, poisoned, cursed, or otherwise affected by a lasting condition. They are typically sourced from compendium packs that define specific diseases and poisons.

# Additional Properties

Along with the [[Item_Base|Standard Item Properties]], the following properties also appear in the **Properties** tab:

- **SubType:** Classifies the affliction by the _nature of the agent_ afflicting the Being. (Conditions that a character _carries_ — fatigue, fear, morale, infection, aural shock, and the like — are **[[Item_Trauma|Traumas]]**, not afflictions. See [[Afflictions|the Afflictions rules]] for the full distinction.)
    - **Poison/Toxin**: A _chemical_ affliction — a toxic substance or venom that impairs or kills the host.
    - **Disease**: A _biological_ affliction — an illness or parasite that infects the body or mind.
    - **Maladiction**: A _supernatural_ affliction — a curse, hex, or divine/spiritual blight, transmitted by arcane, divine, or spirit means.
    - **Other**: A catch-all for afflictions not covered above.
- **Category:** An optional free sub-classification for a given SubType. Not applicable to all afflictions.
- **Is Dormant:** Whether the affliction is currently present but inactive.
- **Is Treated:** Whether the affliction has had treatment applied.
- **Diagnosis Bonus Base:** Bonus applied to diagnosis rolls.
- **Lavel Base:** Numeric level of severity of the affliction, low numbers are less severe
- **Healing Rate Base:** A numeric code from 1-6 indicating how well the affliction heals. 6 is the highest level (meaning the affliction has been defeated) and 0 is the lowest level (patient is dead). A rate of -1 indicates there is no healing rate.
- **Contagion Index Base:** How contagious the affliction is. Values range from 1 to 5; the lower the index, the more contagious the disease.
- **Transmission** — how the affliction spreads. Values are:
    - **None:** Not transmissible.
    - **Airborne:** Transmits through the air.
    - **Contact:** Transmits via skin contact.
    - **Body Fluid:** Transmits when body fluid is transmitted either through an orifice or wound.
    - **Injested:** Transmits by eating or drinking.
    - **Proximity:** Transmitted by being near the source. Note that this is different from airborne; for instance, it could represent a force such as electromagnetism or radiation or similar.
    - **Vector:** Injection via stinger, piercing, cut, or other break to the skin.
    - **Perception:** Transmitted by simply perceiving the source visually, audibly, or via some other mechanism.
    - **Arcane:** Transmitted by spell or other arcane mechanism.
    - **Divine:** Transmitted by divine attunement (such as belonging or not belonging to a particular religion or sect).
    - **Spirit:** Transmitted via the Aura of one spirit or soul to another.

<!-- TODO: Expand with details on affliction progression mechanics,
     how transmission checks work, treatment skill tests, and
     interaction with the injury/healing system -->
