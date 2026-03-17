---
title: "Calendar JSON Format"
slug: "calendar-format"
category: "User Guide"
sort: 6
tags:
    - calendar
    - reference
    - gm
foundry:
    folderId: 9s8n7Xo2h5l1v3a
    ownership:
        default: 0
---

# Calendar JSON Format {#CalendarFormat}

This reference describes the JSON format used for custom calendar files in
Song of Heroic Lands. For instructions on importing calendars, see
[System Settings](user-guide/settings.md).

A calendar JSON file must contain a single JSON object with the structure
described below. All fields are required unless marked as optional.

# Example: Minimal Calendar {#CalendarExample}

```json
{
    "name": "My Campaign Calendar",
    "description": "A custom calendar for my campaign world.",
    "years": {
        "yearZero": 0,
        "firstWeekday": 0
    },
    "months": {
        "values": [
            {
                "name": "First Month",
                "abbreviation": "1st",
                "ordinal": 1,
                "days": 30
            },
            {
                "name": "Second Month",
                "abbreviation": "2nd",
                "ordinal": 2,
                "days": 30
            }
        ]
    },
    "days": {
        "values": [
            { "name": "Day One", "abbreviation": "D1", "ordinal": 1 },
            { "name": "Day Two", "abbreviation": "D2", "ordinal": 2 },
            { "name": "Day Three", "abbreviation": "D3", "ordinal": 3 },
            { "name": "Day Four", "abbreviation": "D4", "ordinal": 4 },
            { "name": "Day Five", "abbreviation": "D5", "ordinal": 5 },
            { "name": "Day Six", "abbreviation": "D6", "ordinal": 6 },
            { "name": "Day Seven", "abbreviation": "D7", "ordinal": 7 }
        ],
        "daysPerYear": 60,
        "hoursPerDay": 24,
        "minutesPerHour": 60,
        "secondsPerMinute": 60
    },
    "seasons": {
        "values": [
            { "name": "Warm Season", "monthStart": 1, "monthEnd": 1 },
            { "name": "Cold Season", "monthStart": 2, "monthEnd": 2 }
        ]
    },
    "era": {
        "hasYearZero": false,
        "name": "CE",
        "abbrev": "CE",
        "beforeName": "Before Common Era",
        "beforeAbbrev": "BCE",
        "description": ""
    }
}
```

# Field Reference {#CalendarFields}

## Top Level

| Field | Type | Description |
|-------|------|-------------|
| `name` | string | **Required.** Display name of the calendar. Also used to generate a unique ID when importing. |
| `description` | string | A short description of the calendar. |

## Years

| Field | Type | Description |
|-------|------|-------------|
| `yearZero` | integer | The year that corresponds to time zero in Foundry's world clock. For example, if your campaign starts in year 720, set this to 720. |
| `firstWeekday` | integer | Index into the `days.values` array for the weekday at time zero (0-based). |

## Months

The `months.values` array contains one entry per month in the calendar year.

| Field | Type | Description |
|-------|------|-------------|
| `name` | string | Full name of the month (e.g., "Springtide"). |
| `abbreviation` | string | Short abbreviation (e.g., "Spr"). |
| `ordinal` | integer | The month's position in the year (1-based). |
| `days` | integer | Number of days in this month. |
| `leapDays` | integer | *(Optional)* Extra days added in a leap year. |

## Days

The `days` object configures the structure of a day and the names of weekdays.

| Field | Type | Description |
|-------|------|-------------|
| `daysPerYear` | integer | Total days in a non-leap year. Must equal the sum of all month `days` values. |
| `hoursPerDay` | integer | Hours in a day (typically 24). |
| `minutesPerHour` | integer | Minutes in an hour (typically 60). |
| `secondsPerMinute` | integer | Seconds in a minute (typically 60). |

The `days.values` array contains one entry per weekday. The number of entries
defines the length of a week.

| Field | Type | Description |
|-------|------|-------------|
| `name` | string | Full name of the weekday (e.g., "Monday"). |
| `abbreviation` | string | Short abbreviation (e.g., "Mon"). |
| `ordinal` | integer | The weekday's position in the week (1-based). |

## Seasons

The `seasons.values` array contains one entry per season.

| Field | Type | Description |
|-------|------|-------------|
| `name` | string | Name of the season (e.g., "Spring"). |
| `monthStart` | integer | Ordinal of the first month in this season. |
| `monthEnd` | integer | Ordinal of the last month in this season. |

## Era (SoHL Extension)

The `era` object is a SoHL-specific extension that adds era-based dating
(e.g., "720 CE" or "51 BCE"). This section is optional; if omitted, dates
display as plain year numbers.

| Field | Type | Description |
|-------|------|-------------|
| `hasYearZero` | boolean | Whether year zero exists between the eras. If false, the calendar goes from 1 BCE directly to 1 CE. |
| `name` | string | Name of the current era (e.g., "Common Era"). |
| `abbrev` | string | Abbreviation appended to dates (e.g., "CE"). |
| `beforeName` | string | Name of the era before year zero. |
| `beforeAbbrev` | string | Abbreviation for the before-era (e.g., "BCE"). |
| `description` | string | Optional description of the era system. |
