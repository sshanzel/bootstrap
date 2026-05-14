---
name: test-writing
description: Guidelines for writing thorough tests. Use when creating or modifying test files.
user-invocable: false
---

# Test Writing Guidelines

## Core principle

Verify end behavior, not only that an intermediate mock fired.

## Requirements

- cover the main success path and the meaningful edge cases
- verify final state for write-heavy paths
- assert negative behavior when it matters
- use realistic values
- use literal expectations for URLs, cookie names, and route paths when those values are what the test is proving

## Common edge cases

- malformed input
- missing optional fields
- duplicate delivery / replay
- unauthorized access
- empty or null values
- boundary-value behavior

## Bug fixes

Every bug fix should land with a regression test.
