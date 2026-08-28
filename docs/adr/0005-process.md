# ADR 0005: Spec-Driven Development + TDD + GitHub Flow

## Status

Accepted

## Context

Money software needs explicit behavior and regression safety.

## Decision

- Specs in `specs/` before implementation
- TDD for domain/application
- Playwright for acceptance
- GitHub Flow with CI on PRs (Spec 116); production deploy is path-filtered Actions → Cloud Run (Spec 118), not Pages/Cloudflare as the target

## Consequences

- Slightly slower start per feature; fewer ambiguous bugs
- Scaffold exception: initial landing on `main` allowed once
