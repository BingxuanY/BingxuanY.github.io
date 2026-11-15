# Liquid Templates Instructions (v1.x)

Scope: `**/*.liquid`

## Ownership

- Starter templates in this repo should orchestrate plugin tags/includes.
- Runtime feature logic belongs in owning plugin repos.

## Guidance

- Prefer plugin wrappers/includes over embedding feature runtime logic in starter.
- Keep markup/config expectations consistent with the plugin contracts and repository configuration.
- Avoid reintroducing bootstrap-specific assumptions in starter templates.

## Validation

Use the validated command set in `AGENTS.md`.
