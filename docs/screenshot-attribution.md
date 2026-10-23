# Screenshot assets and arrow overlays

Added 2026-10-23. Images are kept unchanged; the web application draws SVG arrows and transparent keyboard-focusable step buttons above them. No generated Blender menus or fabricated screenshots are used.

## Exact workspace reference

`public/blender/workspace-5.2.2.webp`: screenshot supplied by the user on 2026-10-23, losslessly encoded as WebP with an identical-pixel check against the original. Visible title identifies Blender **5.2.2 LTS**. It shows the Layout workspace, Object Mode, default cube, Outliner and Object Properties. Only controls visible in this capture receive locator arrows. Closed menus, Edit Mode menus, F3 search and extension panels are not represented as if they were open; those transitions are described outside the image.

## Manual reference panels

Blender Manual contributors, **CC BY-SA 4.0**: https://creativecommons.org/licenses/by-sa/4.0/

These are real images from the **4.5 manual**, retrieved through the public `wlk-r-dev/blender-manual-4.5` mirror because direct Blender image retrieval was blocked. They are labelled as 4.5 reference layouts in the UI and are not claimed to be new captures of Blender 5.2.2. The Boolean reference uses the older Fast label; its caption explains the current Float name. Pixel values already visible in screenshots are illustrative, not recommended settings.

| Local asset | Manual page | Original image in mirror |
|---|---|---|
| solidify-manual-4.5.png | https://docs.blender.org/manual/en/4.5/modeling/modifiers/generate/solidify.html | https://raw.githubusercontent.com/wlk-r-dev/blender-manual-4.5/main/_images/modeling_modifiers_generate_solidify_panel-simple.png |
| decimate-manual-4.5.png | https://docs.blender.org/manual/en/4.5/modeling/modifiers/generate/decimate.html | https://raw.githubusercontent.com/wlk-r-dev/blender-manual-4.5/main/_images/modeling_modifiers_generate_decimate_panel-collapse.png |
| boolean-manual-4.5.png | https://docs.blender.org/manual/en/4.5/modeling/modifiers/generate/booleans.html | https://raw.githubusercontent.com/wlk-r-dev/blender-manual-4.5/main/_images/modeling_modifiers_generate_booleans_panel.png |
| remesh-manual-4.5.png | https://docs.blender.org/manual/en/4.5/modeling/modifiers/generate/remesh.html | https://raw.githubusercontent.com/wlk-r-dev/blender-manual-4.5/main/_images/modeling_modifiers_generate_remesh_panel.png |
| smooth-manual-4.5.png | https://docs.blender.org/manual/en/4.5/modeling/modifiers/deform/smooth.html | https://raw.githubusercontent.com/wlk-r-dev/blender-manual-4.5/main/_images/modeling_modifiers_deform_smooth_panel.png |
| laplacian-manual-4.5.png | https://docs.blender.org/manual/en/4.5/modeling/modifiers/deform/laplacian_smooth.html | https://raw.githubusercontent.com/wlk-r-dev/blender-manual-4.5/main/_images/modeling_modifiers_deform_laplacian-smooth_panel.png |

The existing repository MIT licence covers project code. It does not relicense these manual images. Arrow overlays use the project implementation; when distributing a composite derived from a manual image, retain attribution and the applicable CC BY-SA terms.

## Remaining capture work

Replace reference panels with version-matched captures as they become available. Capture actual Edit Mode menus, open Overlays/Remesh popovers, F3 search, and Toolbox Analyze panels before claiming a complete screenshot for every click in Blender 5.2.2. Current guides clearly identify workspace locators versus actual visible setting panels.
