---
title: "System Settings"
slug: "settings"
category: "User Guide"
sort: 5
tags:
    - settings
    - gm
    - calendar
foundry:
    folderId: 9s8n7Xo2h5l1v3a
    ownership:
        default: 0
---

# System Settings Overview {#SettingsOverview}

Song of Heroic Lands provides several configurable settings accessible from
**Settings > Configure Settings > System Settings** in Foundry VTT.

Settings are divided into two categories:

- **World settings** are configured by the GM and apply to all players.
- **Player settings** are configured independently by each user.

This guide documents all available settings. For a quick start, see
[Quickstart](user-guide/quickstart.md).

# World Settings {#WorldSettings}

World settings are configured by the GM and apply to all players in the world.

## Calendar

**Default:** Turning Wheel

SoHL includes a built-in calendar called the Turning Wheel for tracking
in-world time. It uses a 360-day year with 12 months of 30 days each, 10-day
weeks, and an era system for dating. GMs can select from registered calendars
or import custom ones from JSON files.

### Choosing a Calendar

1. Open **Settings > Configure Settings > System Settings**.
2. Click the **Configure Calendar** button.
3. In the dropdown, select the calendar you want to use.
4. Click **Save Changes**.
5. When prompted, reload the world to apply the new calendar.

The dropdown shows all registered calendars, including the built-in default
and any calendars you have imported or that were added by modules.

### Importing a Custom Calendar

You can import custom calendars from JSON files stored in your Foundry data
directory.

1. Open the **Configure Calendar** settings menu.
2. Click the **Choose JSON File** button in the Import Calendar section.
3. Browse to a `.json` file containing a valid calendar definition.
4. The calendar will be validated, registered, and appear in the dropdown.
5. Select it from the dropdown and save to make it active.

Imported calendars are persisted in the world data and will survive server
restarts. They appear in the "Imported Calendars" section of the settings
menu, where they can be deleted if no longer needed.

For the JSON file format specification and an example, see
[Calendar JSON Format](user-guide/calendar-format.md).

### Deleting an Imported Calendar

1. Open the **Configure Calendar** settings menu.
2. In the **Imported Calendars** section, click the trash icon next to the
   calendar you want to remove.
3. Confirm the deletion.

If the deleted calendar was the active calendar, the system automatically
switches back to the Turning Wheel. Built-in calendars (provided by the system
or by modules) cannot be deleted.

## Healing Interval

**Default:** 432000 seconds (5 days)

The number of in-world seconds between automatic healing checks. When world
time advances past this interval, characters with injuries or afflictions
will have their healing tests triggered automatically.

Set to **0** to disable automatic healing entirely. When disabled, the GM
must trigger healing checks manually.

Common values:
- 86400 = 1 day
- 432000 = 5 days (default)
- 864000 = 10 days

## Fate Rules

**Default:** PC only

Fate allows characters to spend fate points to re-roll failed tests, providing
a safety net against critical failures. This setting controls who can use fate.

- **Disabled** — No one can use fate. Removes the fate system entirely. Use
  this for a grittier, more dangerous campaign.
- **PC only** — Only player characters can use fate. NPCs and creatures
  cannot. This is the recommended setting for most campaigns.
- **Everyone** — All characters (including NPCs and creatures) can use fate.
  This makes combat more unpredictable since enemies can also re-roll.

## Track Projectiles

**Default:** Disabled

When enabled, firing a missile weapon reduces the quantity of the appropriate
projectile gear (arrows, bolts, etc.) by one. When the quantity reaches zero,
the character cannot make further missile attacks with that weapon until they
acquire more ammunition.

When disabled, ammunition is treated as unlimited. Enable this for campaigns
where resource management and logistics matter.

## Gear Damage

**Default:** Disabled

When enabled, a successful block in melee combat may damage the blocking
weapon or shield. Gear that takes enough damage may eventually break and
become unusable.

This is an optional rule that adds realism and tactical depth. Disable it
for simpler combat or if you don't want to track equipment wear.

## Tactical Distance Unit

**Default:** Meters

The unit used for measuring distance in combat (weapon reach, movement per
round, spell ranges). All distances are stored internally in meters and
converted for display.

- **Meters** — Standard metric (1m)
- **Feet** — Imperial (0.3048m)
- **Yards** — Imperial (0.9144m)
- **Cubits** — Historical unit (0.4572m), suitable for ancient or biblical settings

Change this to match the conventions your group is most comfortable with.
The choice is purely cosmetic — it does not affect game mechanics.

## Trek Distance Unit

**Default:** Kilometers

The unit used for measuring overland travel distance (trekking, marching,
sailing). Used in movement profile calculations and travel time estimates.

- **Kilometers** — Standard metric (1000m)
- **Miles** — Imperial (1609m)
- **Nautical Miles** — Maritime (1852m), useful for seafaring campaigns
- **Leagues** — Historical (4828m), suitable for fantasy settings
- **Li** — Chinese historical unit (500m)
- **Parsangs** — Persian historical unit (5500m)

As with tactical distance, this is a display preference and does not affect
the underlying mechanics.

# Player Settings {#PlayerSettings}

Player settings are configured independently by each user and only affect
that user's client. They are found under **Settings > Configure Settings >
System Settings**.

## Record Trauma

**Default:** Record automatically

Controls whether injuries, afflictions, and other trauma are automatically
created on characters when they take damage or are affected by conditions.

- **Record automatically** — Injuries and afflictions are created on the
  character as soon as they occur. This is the standard mode and keeps the
  game flowing without extra prompts.
- **Prompt each time** — You are asked to confirm each time an injury or
  affliction would be created. Useful if you want to narrate trauma before
  it appears on the sheet, or if you sometimes override the mechanical result.
- **Don't record automatically** — Trauma is never created automatically.
  Injuries and afflictions must be added manually. Use this for a fully
  narrative approach to damage.

## Combat Sounds

**Default:** Enabled

When enabled, combat actions (attacks, blocks, impacts) play flavor sound
effects. Disable this if you prefer a quieter experience or are using your
own ambient audio.

## Show Welcome Dialog

**Default:** Enabled

When enabled, a welcome dialog is displayed each time you log in to the
world. The dialog provides quick links and version information. Disable it
once you are familiar with the system.

## Log Level

**Default:** Info

Controls the verbosity of SoHL's system log messages in the browser console.
This is primarily a debugging tool.

- **Error** — Only errors. Use this during normal play.
- **Warn** — Errors and warnings. Useful if something seems wrong.
- **Info** — General informational messages (default).
- **Debug** — Verbose output including lifecycle details. Use this when
  diagnosing bugs or developing modules.
