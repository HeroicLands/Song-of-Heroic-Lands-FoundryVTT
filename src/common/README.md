# Core Logic Module

## Overview

The Core Logic module provides foundational classes and utilities for the Song of Heroic Lands system.

It includes:

- Base classes for all logic-related entities.
- Serialization and deserialization utilities.
- A centralized registry for dynamic subclass registration.

## Key Classes

- {@link SohlBase} Base class for most of the Logic classes as well as metadata constructs.
- {@link BaseSystem} Basic system data, this abstract class is subclassed by the vairants to hold
  data specific to each variant.
- {@link SohlAction} Base class for all Actions, which are events with an activity that occurs
  when the event is active.
- {@link SohlEvent} Base class for all SohlEvents, which are entities that have a time when they
  begin and end, and an activation state (`active` and `inactive`) based on the current time.
- {@link SohlTemporal} Utility class that represents a point in time in the (game as any).
- {@link SohlEffect} Base class for all Effects, which are events that modify data, such as
  increasing the mastery level of a skill by a certain amount.
- {@link ValueModifier} Base class for all modifiers, which represent a numeric value and all
  of the named modifiers to that value.

## Relationships

- **Actions Module**: Core Logic provides the base {@link Action} class for all Actions
- **Effects Module**: Core Logic provides the base {@linkEffect} class for all Effects
