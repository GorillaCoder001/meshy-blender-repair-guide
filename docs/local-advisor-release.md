# Local model advisor and visual navigation release

2026-10-23 · `feat/local-model-visual-advisor` · GitHub Pages only.

The initial release intentionally had no file input. The user's new request changes that scope: the application now opens model files locally and presents measured checks, repair choices and clickable screenshot guidance.

## Delivered changes

- Prominent **Upload a model** entry from the overview and a dedicated **Model advisor · upload** navigation item.
- Local drag/drop or chooser for binary/ASCII STL, core/build-component 3MF and triangulated OBJ. Original files stay in memory on the device; no form submission, network model transfer or persistent file storage is used.
- Worker-based parsing and analysis so the interface stays responsive, with progress, cancellation, replacement-file handling and a built-in demo.
- 3MF units, build transforms, mirrored winding, nested components and internal model resources preserved. External file references, unsafe ZIP paths and XML entities rejected. OBJ external materials/textures are not loaded. Non-triangular OBJ faces require triangulation before import.
- Complete-model dimensions, triangle count and area; approximate welded-edge boundaries, non-manifold junctions, winding conflicts, duplicate triangles and connected-shell checks up to 200,000 triangles.
- Large-model topology is shown as **Not checked**, not zero or passed. Maximum parsed geometry is 2,000,000 triangles, file limit 256 MB, and 3MF expanded geometry has its own limit. Preview samples large meshes and says so.
- Findings offer **Show me** repair buttons, with interpretation cautions for intentional cavities and separately printable components.
- Screenshot guides use arrows only inside the image, transparent clickable targets, Previous/Next buttons, workspace zoom and explicit review completion. No text callout boxes are drawn on screenshots.
- Your actual Blender 5.2.2 screenshot supplies workspace locators. Six authentic modifier-panel images are labelled as 4.5 manual references. Source/licence attribution is recorded separately. Unavailable menu states are not fabricated.
- Every existing tool guide gains **Show me where to click**. Numerical trial logic remains separate and explicitly heuristic.
- Select-based print context on the local advisor; dimensions are taken from the file, with unit controls for STL/OBJ.

## Automated validation

**62 tests pass**: existing 43 scenarios plus 19 new parser, geometry, screenshot metadata, arrow navigation and file-input checks. Strict TypeScript and production Vite build pass. The build emits a dedicated analysis worker and lazy-loads the 3D advisor/renderer. All assets are served under the existing Pages project path.

The new tests verify closed/open cubes, detached tetrahedra, flipped/duplicate/degenerate triangles, skipped large-model checks, ASCII/binary STL, negative OBJ indices, unsupported polygons, 3MF units/mirroring/transforms, bad ZIP/XML input, screenshot coordinate bounds, version labels and annotation-free image overlays.

## Limits

This is an advisor, not an automatic mesh repair or a remote control for Blender. Geometry checks do not prove absence of self-intersection, correct wall thickness, structural capacity, design intent or printability. Users perform the guided edits in Blender and re-export for rechecking. Screenshot coverage is version-labelled; full 5.2.2 menu/panel capture remains incomplete. See `screenshot-attribution.md`.

Browser verification is performed against the deployed release after the automated GitHub checks and deployment succeed. The original implementation report remains a historical record of the first release; this document supersedes its no-upload scope.
