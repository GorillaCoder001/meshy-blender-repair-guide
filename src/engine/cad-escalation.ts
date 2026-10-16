import type { Answers, Context } from '../types';
export function chooseApproach(context:Context, answers:Answers) {
  if (context.requirements.length) return {
    choice:'REBUILD PART IN CAD',tone:'amber',
    reason:'Your selected dimensional or interface requirements need controlled geometry and measured tolerances. Rebuild the critical region in CAD; keep usable decorative surfaces in Blender.',
    next:'Use Fusion / Shapr3D / Onshape for the specified interface. Validate fit on a test coupon, then combine the decorative mesh if appropriate.',
    sources:['prusa-design','retopology'],
  };
  if ((!answers.faceUsable && ['chibi','realistic','anime'].includes(context.modelType)) ||
    (context.severity==='severe' && (answers.importantMissing || answers.backInvented || answers.destroysDetail))) return {
    choice:'REGENERATE IN MESHY',tone:'amber',
    reason:'Critical shape is unusable or rebuilding it is likely to destroy the details you want. A cleaner generation or a manual reconstruction is a better starting point than repeated global cleanup.',
    next:'Improve the reference, inspect all sides of a new result, and keep the original version. Regeneration does not guarantee correct anatomy or topology.',
    sources:['meshy-intro','retopology'],
  };
  return {
    choice:'FIX IN BLENDER',tone:'green',
    reason:'No precision interface requirement or severe missing-shape condition is selected. Start with targeted mesh inspection and local repairs; the product category alone is not a reason to switch tools.',
    next:context.load==='critical'?'Get independent engineering review for the intended load; a mesh repair guide cannot validate structural safety.':'Protect the original, repair locally, and compare the final export in the slicer.',
    sources:['retopology','prusa-design'],
  };
}
