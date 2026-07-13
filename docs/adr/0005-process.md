# ADR 0005: Spec-Driven Development + TDD + GitHub Flow

## Status

Accepted

## Context

Money software needs explicit behavior and regression safety.

## Decision

- Specs in `specs/` before implementation
- TDD for domain/application
- Playwright for acceptance
- GitHub Flow with CI on PRs; Pages deploy from `main`

## Consequences

- Slightly slower start per feature; fewer ambiguous bugs
- Scaffold exception: initial landing on `main` allowed once
