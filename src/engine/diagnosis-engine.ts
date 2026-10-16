import { problemById } from '../data/repair-problems';
import type { Answers, Context, Diagnosis } from '../types';
export function diagnose(problemId:string, context:Context, answers:Answers):Diagnosis {
  const p=problemById[problemId] ?? problemById.unknown;
  const result:Diagnosis={title:p.title,explanation:p.description,tools:[...p.tools],warnings:[],confirmations:[p.confirm],verification:p.verify,allowRemesh:false};
  if (context.requirements.length) result.warnings.push('Preserve the critical dimensions. Global smoothing, remeshing and decimation can alter the required fit.');
  if (context.load==='critical') result.warnings.push('This workflow does not establish structural capacity, temperature suitability or safety for the selected critical use.');
  if (p.id==='hollow') {
    if(answers.geometry==='unknown') {
      result.title='Identify the kind of “hollow” first';
      result.explanation='An empty-looking viewport is not enough to choose a repair. Confirm whether you have an open surface, a closed outer volume, or a cavity with walls.';
      result.tools=['face-orientation','non-manifold','toolbox'];
    } else if(answers.geometry==='closed') {
      result.title='A closed volume may already be correct';
      result.explanation=answers.wantHollow?'Decide whether you need a designed cavity or simply reduced infill. A closed volume can be printed with sparse infill; a designed cavity needs explicit walls.':'A valid closed mesh encloses a volume even when it looks empty in Blender. Choose infill, walls and top/bottom layers in Bambu Studio.';
      result.tools=['toolbox','export-stl'];
      result.warnings.push('Do not add Solidify merely because a closed model looks empty inside.');
    } else if(answers.geometry==='surface') {
      result.title='An open surface needs an intentional volume';
      result.explanation=answers.wantHollow?'Give the surface real wall thickness and close the rim while preserving the intended opening.':'Close unintended boundaries to enclose the intended solid volume. Use Solidify only if the design should be a wall-thickened shell.';
      result.tools=answers.wantHollow?['face-orientation','solidify','toolbox']:['non-manifold','fill-holes','grid-fill','normals','toolbox'];
    } else {
      result.title=answers.wantHollow?'Preserve the designed cavity':'Investigate the unwanted inner shell';
      result.explanation=answers.wantHollow?'A cavity bounded by connected inner and outer walls can be printable. Check the wall thickness and rim rather than capping the opening.':'On a duplicate, inspect which inner surfaces define the cavity. Rebuild or remove only the unwanted inner shell and close any remaining boundaries; do not indiscriminately delete interior faces.';
      result.tools=answers.wantHollow?['toolbox','export-stl']:['interior','linked-pieces','non-manifold','toolbox'];
    }
  }
  if(p.id==='holes' && answers.opening!=='unintended') {
    result.title=answers.opening==='intentional'?'Keep the intended opening':'Confirm an unintended boundary before filling';
    result.explanation=answers.opening==='intentional'?'A vessel opening is compatible with a watertight wall volume if its inner and outer surfaces connect at the rim. Preserve that design.':'Use boundary selection and normal inspection to tell a missing surface from an intended opening or viewing artifact.';
    result.tools=['face-orientation','non-manifold','toolbox'];
  }
  if(['floating','parts','hair'].includes(p.id)) {
    if(answers.pieces==='debris') {
      result.title='Remove only confirmed unwanted islands';
      result.explanation='Select the complete unwanted component and inspect it before deleting. Meshy Delete Small Pieces can help after previewing its threshold; Delete Loose is not a closed-island remover.';
      result.tools=['linked-pieces','meshy-cleanup','toolbox'];
    } else if(answers.pieces==='unknown') {
      result.title='Decide whether the detached piece belongs';
      result.tools=['linked-pieces','toolbox'];
      result.explanation='A small detached piece may be an important strand, limb or accessory. Isolate it and decide whether to keep, join, separately print or remove it.';
    } else if(answers.contact==='overlap') {
      result.title='Join the intentional overlapping volumes';
      result.tools=['boolean',...(p.id==='hair'?['inflate']:[]),'normals','toolbox'];
      result.explanation='Use a Boolean Union on clean overlapping volumes, then verify the contact and surfaces. Preserve important detail before considering a topology rebuild.';
    } else {
      result.title='Create a real attachment before union';
      result.tools=['linked-pieces','grab','boolean','toolbox'];
      result.explanation='Move or rebuild the attachment to create sufficient contact, or design an intentional separate assembly. A union cannot bridge a genuine gap by itself.';
      result.warnings.push('Touching at a point or edge is not a strong printable connection. Use measurable material overlap.');
    }
  }
  if(p.id==='clothing' && answers.geometry!=='surface') {
    result.tools=['toolbox','linked-pieces','boolean','sculpt-smooth'];
    result.warnings.push('Check existing garment thickness first. Adding Solidify to an already thickened garment may create nested or intersecting walls.');
  }
  if(p.id==='thin' && answers.geometry!=='surface') {
    result.tools=['toolbox','mask','inflate'];
    result.warnings.push('Use Solidify only for a true surface needing a new shell; thicken or rebuild existing walls locally.');
  }
  const remeshCandidate=['non-manifold','intersections','rough','distorted'].includes(p.id);
  result.allowRemesh=remeshCandidate && context.organic && !context.requirements.length && answers.geometry==='closed' && !answers.destroysDetail;
  if(remeshCandidate && !result.allowRemesh) {
    result.tools=result.tools.filter(t=>t!=='remesh'&&t!=='remesh-mod');
    result.warnings.push('A voxel trial is withheld until you confirm a closed organic volume, no critical fit requirements, and acceptable detail loss.');
  }
  if(result.allowRemesh && !result.tools.includes('remesh')) result.tools.push('remesh');
  if(answers.importantMissing) result.warnings.push('Cleanup cannot recreate missing anatomy or recover detail absent from the source. Rebuild that region or consider regeneration.');
  return result;
}
