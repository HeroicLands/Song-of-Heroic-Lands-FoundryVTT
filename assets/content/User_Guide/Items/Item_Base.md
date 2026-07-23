---
aliases:
    - Base Item
id: JL8TYJAooOLjNK1i
type: doc
package: sohl
category: user-guide
name:
    full: Base Item
slug: "item-base"
folder: QtOgPodi8X6gDWL0
---

In Foundry VTT, one of the main document types is the Item. Items represent things that are associated with an actor: skills, gear, etc. In _Song of Heroic Lands_, there are a large number of items.

# Standard Sheet Tabs

The Item sheet displays information about the individual item. There are generally four tabs: **Properties**, **Description**, **Actions**, and **Events**.

## Properties Tab

Although each type of Item has different properties, some properties are common among all Items. These properties include:

- **Shortcode:** A relatively short alphanumeric text string that uniquely identifies this item within similarly-typed items. The shortcode is often used in code to identify an item, since name can change through localization (shortcodes are never localized).
- **Notes:** A single-line note associated with an item that is normally displayed on the character sheet next to the item. This differs from the Description, which is a rich text multi-line block of text.

## Documentation Tab

- **Doc URL:** URL to the detailed documentation for this item. Normally points to the `www.heroiclands.org` site, but might also point elsewhere if applicable. Normally only one of **Doc URL** or **Documentation** are specified, not both.
- **Documentation:** A multi-line documentation property containing text describing the item in detail. Normally used with an inline editor providing rich text (including tables) in HTML format.

## Actions Tab

Actions represent specific behaviors that can be triggered. Some of these are predefined, others can be custom made.

## Effects Tab

Various active effects can be applied to an item that either effect the item, the actor the item is located on, or other items on the same parent actor.
