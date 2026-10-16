import type { Diagnosis } from '../types';
export const masterWorkflow = [
  'Save the original Meshy export and a separate Blender file.',
  'Duplicate the object; keep the original hidden in a backup collection.',
  'Import, establish units and explicitly set final dimensions.',
  'Apply Scale to the working duplicate; measure the resulting dimensions.',
  'Inspect topology, face orientation, boundaries and linked islands.',
  'Inspect internal faces and collisions before deleting or filling anything.',
  'Repair the observed defect with the least disruptive suitable tool.',
  'Rebuild topology only when local repair is inadequate and detail loss is acceptable.',
  'Refine locally, then simplify only if the actual face count causes a problem.',
  'Measure thickness, inspect attachments and review 3D Print Toolbox results.',
  'Export the selected working object; reimport to check the exact exported mesh.',
  'In Bambu Studio verify dimensions, orientation, sliced walls, gaps, islands and supports.',
];
export function workflowFor(diagnosis:Diagnosis) {
  return ['apply-scale',...diagnosis.tools,'toolbox','export-stl'].filter((id,i,a)=>a.indexOf(id)===i);
}
