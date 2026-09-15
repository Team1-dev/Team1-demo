gates: npm test
human-approvals: 0
auto-merge: true

# Todo

A small Vue 3 todo list, built entirely by Team1 from the issues in this repo. It exists to show the factory working on something anyone can read.

## House style

Vue 3 single-file components with `<script setup>`, plain JavaScript, no TypeScript. Every feature ships with a test that would fail without it.

## Invariants

- `npm test` passes on every commit.
- No network calls. State lives in the browser only.
- No new runtime dependencies beyond Vue without saying why in the pull request.
