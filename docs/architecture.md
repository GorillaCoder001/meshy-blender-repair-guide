# Architecture and phased implementation

Target: `GorillaCoder001/meshy-blender-repair-guide` only. React / TypeScript / Vite / Tailwind CSS. Static files only; Vite base `/meshy-blender-repair-guide/`. Hash navigation avoids Pages reload errors. The initial release had no model input. The 2026-10-23 update adds local-only file parsing and a Web Worker; model bytes are not transmitted. No telemetry, accounts, backend or external runtime APIs.

1. **Research and shell:** complete research matrix; preserve repository history and licence; implement GitHub Actions Pages build; accessible responsive navigation.
2. **Knowledge foundation:** version-aware tool records, source metadata, model types, glossary. Separate documented semantics from heuristic recipes.
3. **Diagnosis:** pure deterministic branching functions; self-reported answers remain explicitly unverified. Generate tool steps, verification, and conditional CAD/regenerate decisions. No numerical settings in this phase.
4. **Settings:** implement only matrix-approved heuristics using final mm size, nozzle, material, intended load and smallest preserved feature. Retain formula, basis, assumptions, confidence and source IDs for every returned rule. Invalid context produces errors rather than fabricated recommendations.
5. **Interaction:** advisor, fix/regenerate/CAD tool, saved checklist, search across content types, shareable hash routes, expandable source panels and teaching modes.
6. **Visuals and verification:** original SVG diagrams; keyboard/mobile checks; tests for all required scenarios and provenance integrity. Build and Pages artifact validation.

## Modules

- `src/data/`: sources, tools, problems, model types, glossary, workflows, print checks.
- `src/engine/`: diagnosis, workflow ordering, settings, CAD escalation, search. Pure logic, no UI dependencies.
- `src/components/`: path breadcrumbs, evidence panels, tool guides, diagrams, sidebar, context form.
- `src/pages/`: home, diagnose, workflows, tools, print check, learn, sources.
- `src/types.ts`: versionable contracts, explicit evidence classes, stable IDs.
- `tests/`: deterministic scenario/integrity tests plus UI interaction tests.
- `docs/`: research matrix, evidence limitations, implementation/test report.

The local analyzer is now implemented in `src/model/` with explicit measured-result types, resource limits and skipped-check states. `ModelAdvisor` and `VisualRepairGuide` add local geometry findings and version-labelled screenshot navigation. The manual diagnosis remains separate. See `docs/local-advisor-release.md`.

## Release policy

Work on `feat/research-backed-repair-guide` from initial main commit `dc76791bbe38ae76eaae39ac1ef74b68c159c6a2`. Commit research before numerical implementation. Build/test on PR and main. Pages deploys through GitHub Actions with the project base path. No other hosting integration. Preserve the MIT licence. Required site configuration: repository Settings → Pages → Source → GitHub Actions. Deployment remains unverified until a successful Pages workflow result exists.
