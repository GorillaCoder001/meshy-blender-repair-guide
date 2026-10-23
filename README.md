# Mesh Repair Lab · Created3D

A practical, interactive guide for inspecting, diagnosing, repairing and refining Meshy AI-generated models in Blender for FDM printing.

**Meshy → Blender inspection → targeted repair → print checks → export → Bambu Studio layer preview.**

Target users: beginners who need to know what is wrong, how to confirm it, which tool to use, where it is located, what starting procedure to try, and how to verify the result.

- Hosting: **GitHub Pages only**.
- Repository: `GorillaCoder001/meshy-blender-repair-guide`.
- Project path: `/meshy-blender-repair-guide/`.
- Site: https://gorillacoder001.github.io/meshy-blender-repair-guide/
- Research baseline: **Blender 5.2 LTS**, English UI, default keymap.
- Extension baseline: **3D Print Toolbox 1.4.1**.
- Last research review: **2026-10-16**.

## What is included

- Local model advisor: open STL / 3MF / triangulated OBJ, preview it, inspect basic mesh health and follow screenshot arrows.
- Three-step manual diagnosis wizard with symptom-specific follow-up questions.
- Context inputs for model type, X/Y/Z size, nozzle, material, intended load, smallest preserved detail, detail priority, severity and actual precision requirements.
- Requirement-based Blender / regenerate / CAD assessment; decorative bookmarks, coasters and bottle covers are not automatically routed to CAD.
- Deterministic settings advisor with explicit heuristic formulas, suggested trial ranges, assumptions, higher/lower risks, confidence and source references.
- 26 tool guides with Blender paths, controls, steps, destructive-operation notices and result checks.
- Six Meshy-specific workflows plus a master sequence and interactive repair decision tree.
- Seven 3D Print Toolbox check explanations and a native-export / Bambu Studio handoff guide.
- Ten original interactive SVG concept diagrams.
- Search across problems, tools, workflows, glossary and sources.
- Browser-local checklist, learning-mode preference and collapsible navigation.
- Beginner / intermediate / advanced instruction presentation.
- Responsive mobile navigation, keyboard controls, skip link and reduced-motion support.

The application is client-side. It needs no backend, database, login, API key, paid API or external AI service. Local files are parsed and inspected on the device in a Web Worker; they are never transmitted to a server. There is no automatic mesh repair or analytics. Outbound source links are user-initiated.

## Supported problems

Unexpected holes, hollow-looking models, open surfaces, intentional cavities, non-manifold geometry, floating parts, disconnected hair/limbs, intersections, internal faces, excess density, rough surfaces, thin walls, reversed normals, distorted shapes, invented backs, fragile details, hands, clothing, dimensional requirements and slicer warnings. Missing/low-resolution detail is explained as a reconstruction limitation, not something decimation can restore.

## Research and confidence

Read the [research matrix](docs/research-matrix.md) first. It was committed before numerical implementation; qualitative diagnosis was committed next. The [architecture](docs/architecture.md) describes the phase order. The [implementation report](docs/implementation-report.md) records validation and limitations.

Two evidence classes remain separate:

| Class | What it supports |
|---|---|
| OFFICIAL / DOCUMENTED | Tool behavior, UI names, parameter meaning and feature availability. |
| HEURISTIC / PRACTICAL STARTING POINT | Authored numerical trials, scale-dependent formulas and suggested trial ranges. |

A Blender manual citation does **not** endorse the guide's numerical coefficients. These numbers are uncalibrated practical trials, not experimentally validated defaults or safety limits. Some operators correctly have no universal numerical starting value.

Every source stores a title, URL, source type, access date, version, documentary confidence and verification method. Every recommendation stores source IDs, evidence class, formula, assumptions, numerical confidence, reviewed date and version. Tests reject unresolved references and duplicate IDs.

High documentary confidence means a source clearly supports a documented claim. It does not mean safe numerical settings. Numerical confidence is lower because the actual geometry and print process have not been inspected or tested. Material affects warnings and suitability; the guide deliberately does not invent universal material-specific strength or clearance coefficients.

Meshy documentation was retrieved in full. Blender manual research used indexed official Blender 5.2 excerpts because full-page retrieval was blocked. Extension history and format availability were cross-checked. Live Blender UI verification remains outstanding. Links using `latest` were titled Blender 5.2 LTS when reviewed and may change; reverify before supporting another version. Educational/community links are supplementary reading, not rule authority.

## Local development

Requirements: Node.js **22.12+**, npm.

```bash
npm ci
npm run dev
```

Open the local Vite URL including `/meshy-blender-repair-guide/`.

```bash
npm test
npm run check
npm run build
npm run preview
```

If the host environment cannot enumerate network interfaces, run `npm run dev -- --host 127.0.0.1`.

## GitHub Pages deployment

1. In repository **Settings → Pages → Build and deployment**, select **GitHub Actions** as Source.
2. Merge the verified feature branch into `main`, or manually run **Verify and deploy GitHub Pages** on `main`.
3. The workflow uses `npm ci`, the complete test suite, TypeScript checks and the Vite production build. It uploads `dist` and deploys with `actions/deploy-pages`.
4. Verify both workflow jobs and open the Pages URL above.

Pull requests run verification and upload a build artifact; they do not publish. Deployment has only the Pages and OIDC permissions it needs. No other hosting service is configured. Vite emits assets under `/meshy-blender-repair-guide/assets/`. Hash routes such as `/#tools/solidify` remain inside that project path and survive direct navigation/reload without server rewrites.

## Code structure

```text
src/
  data/         sources, tools, problems, model types, glossary, workflows
  engine/       diagnosis, settings, workflow ordering, CAD escalation, search
  components/   context form, tool guide, evidence, diagrams, decision tree
  pages/        overview, diagnosis, advisor and knowledge sections
  types.ts      explicit evidence and versionable data contracts
tests/          scenario, provenance, search and UI integration tests
docs/           research matrix, architecture and implementation report
```

## Extending the guide

**New tool:** add a stable ID in `src/data/blender-tools.ts`, a verified UI path, purpose, controls, practical procedure, risks, avoid conditions, verification steps, version and source IDs. Update the research matrix before adding numbers.

**New problem:** add a record in `repair-problems.ts`, extend symptom-specific observation questions if needed, and implement/test the qualitative branch in `diagnosis-engine.ts`.

**New source:** add a record in `sources.ts`. Record what was actually verified, including limitations. Never turn an indexed excerpt into a claim of live UI testing.

**New numerical rule:** research it first; add the rationale and classification to the matrix; implement a pure rule in `settings-engine.ts`; include formula, assumptions, trial range, tradeoffs and source metadata. Add scenario and integrity tests.

**Local-file analysis:** `src/model/` contains parsers, worker-based basic geometry checks, findings and a local controller. `src/pages/ModelAdvisor.tsx` combines measured results with screenshot guidance. Measurements and user interpretations remain distinct. See [the advisor release notes](docs/local-advisor-release.md).

## Limitations

- Local basic geometry inspection is available. No slicing, automatic repair, print-time simulation or guaranteed print success.
- Edge/component checks are skipped above 200,000 triangles and clearly shown as not checked. Self-intersections and local wall thickness are not measured.
- No model-specific topology, strength, thermal or fit certification.
- Voxel workload screening uses bounding-box cells, not actual RAM or triangle prediction.
- Critical use withholds wall-strength numbers and requires separate design validation.
- Small features can disappear despite a watertight mesh; inspect real layer paths and test print.
- Native STL/OBJ are covered. Native Blender 3MF export is not promised; save a 3MF project in Bambu Studio after importing repaired geometry.
- Native STL, Toolbox Export Units, and Meshy Scene Scale are different controls. The guide's mm export recipe must be verified by reimporting and measuring.
- Visual browser QA and live Blender validation may require a developer workstation; see the report.

## Licence

MIT. Original repository licence and history are preserved. This guide is independent of Blender, Meshy and Bambu Lab. Original diagrams and explanatory prose are authored for this project; linked documentation remains with its respective owners. Bundled Blender manual screenshots retain CC BY-SA 4.0 attribution and are not relicensed as MIT. See [screenshot attribution](docs/screenshot-attribution.md).

## Visual repair advisor update (2026-10-23)

Open **Model advisor · upload**, choose a local model, then use **Show me** beside a finding. Screenshot arrows are clickable step targets; Previous/Next buttons are available below the image. Make the actual edit in your own Blender window. Your supplied 5.2.2 workspace image is exact; modifier-panel screenshots from the 4.5 manual are explicitly marked reference layouts. Open-menu captures that are unavailable are identified in the step caption. No text callout boxes are drawn on the image.
