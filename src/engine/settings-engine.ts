import type { Answers, Context, Recommendation } from '../types';
import { BLENDER_VERSION, REVIEWED } from '../data/sources';
import { diagnose } from './diagnosis-engine';
export function validateContext(c:Context):string[] {
  const errors:string[]=[];
  for(const axis of ['x','y','z'] as const) if(!Number.isFinite(c[axis]) || c[axis]<=0 || c[axis]>5000) errors.push(`${axis.toUpperCase()} must be greater than 0 and at most 5000 mm.`);
  if(![0.2,0.4,0.6,0.8,1].includes(c.nozzle)) errors.push('Choose a supported nozzle diameter.');
  if(!Number.isFinite(c.smallestDetail) || c.smallestDetail<=0) errors.push('Enter a smallest preserved detail greater than 0 mm.');
  if(c.smallestDetail>Math.max(c.x,c.y,c.z)) errors.push('The smallest detail cannot exceed the model’s largest dimension.');
  return errors;
}
const fmt=(v:number)=>Number(v.toPrecision(4)).toString();
const mm=(v:number)=>`${fmt(v)} mm`;
function rule(r:Omit<Recommendation,'kind'|'version'|'reviewed'>):Recommendation {
  return {...r,kind:'HEURISTIC / PRACTICAL STARTING POINT',version:BLENDER_VERSION,reviewed:REVIEWED};
}
export function advise(c:Context,problemId:string,a:Answers) {
  const errors=validateContext(c);
  if(errors.length) return {errors,settings:[] as Recommendation[],warnings:[] as string[],voxelBurden:undefined as number|undefined};
  const settings:Recommendation[]=[];
  const warnings:string[]=[];
  const d=diagnose(problemId,c,a);
  const longest=Math.max(c.x,c.y,c.z);
  const multiplier=c.load==='display'?3:c.load==='handling'?4:6;
  const thickness=c.nozzle*multiplier;
  const baseAssumptions=['Final physical dimensions have been verified in Blender.','Scale has been applied on the working duplicate.','No mesh has been inspected by this website.'];
  const critical=c.load==='critical';
  if(c.smallestDetail<c.nozzle) warnings.push(`Your ${mm(c.smallestDetail)} detail is smaller than the ${mm(c.nozzle)} nozzle diameter. Some isolated XY features may not survive slicing; check actual line width, orientation and a test print.`);
  else if(c.smallestDetail<2*c.nozzle) warnings.push(`Your ${mm(c.smallestDetail)} detail is under two nozzle diameters. Treat unsupported strands and attachments as fragile; inspect layer preview and test handling.`);
  if(longest<60) warnings.push('At this small print size, inspect face details, lettering, fingers and support contact areas closely. A model can be watertight and still lose useful detail.');
  if(c.material==='TPU') warnings.push('TPU flexibility changes the intended stiffness and handling behavior. A geometric thickness screen cannot establish rigidity; test the actual filament and geometry.');
  if(c.material==='ABS/ASA') warnings.push('Allow for process-dependent shrinkage and warping when validating fit. Do not invent a universal clearance from the material name.');
  if(c.material==='Other') warnings.push('Material properties are unspecified. Thickness suggestions are geometric screens only; use the supplier’s process data and a test print.');
  if(c.load==='functional') warnings.push('The thicker trial below is a prototype screening target, not a structural design or load rating. Load direction and layer orientation still require testing.');
  if(critical) warnings.push('Critical load selected: no numerical wall-strength recommendation is issued. Obtain a design review and appropriate validation for the actual application.');
  if(!critical) settings.push(rule({
    id:'wall-screen',toolId:d.tools.includes('solidify')?'solidify':'toolbox',setting:d.tools.includes('solidify')?'Thickness trial for a new shell':'Thickness check target',
    value:mm(thickness),trialRange:`${mm(thickness)}–${mm(thickness+c.nozzle)}`,
    why:`A ${c.nozzle} mm nozzle and ${c.load==='display'?'decorative display':c.load==='handling'?'routine handling':'functional prototype'} use give an authored screening target of ${multiplier} nozzle diameters. This does not set slicer wall count or prove strength in ${c.material}.`,
    higher:'More material and less cavity clearance; adding thickness can also cause intersections.',lower:'Fewer toolpaths may fit across a narrow section; unsupported parts may be fragile.',
    formula:`${multiplier} × nozzle diameter = ${mm(thickness)}. Actual extrusion width and orientation must be checked in the slicer.`,confidence:c.material==='Other'||c.load==='functional'?'Low':'Medium',
    sourceIds:['solidify','prusa-design','formlabs-wall'],assumptions:[...baseAssumptions,'Nozzle diameter is used as a rough proxy for line width; this is not an exact perimeter calculation.'],
  }));
  if(d.tools.includes('merge-distance') && !c.requirements.length) {
    const merge=Math.min(longest/10000,c.smallestDetail/20);
    settings.push(rule({id:'merge-trial',toolId:'merge-distance',setting:'Merge Distance',value:mm(merge),trialRange:`${mm(merge/2)}–${mm(Math.min(merge*2,c.smallestDetail/10))}`,
      why:'Start well below the detail that must survive. Select only suspected duplicate vertices, then inspect how many are merged.',higher:'May fuse nearby details or close small intentional gaps.',lower:'May leave near-duplicate vertices unmerged.',formula:`min(largest dimension / 10,000, smallest detail / 20) = ${mm(merge)}. Ratios are guide heuristics.`,confidence:'Low',sourceIds:['cleanup'],assumptions:baseAssumptions}));
  }
  let voxelBurden:number|undefined;
  if(d.allowRemesh) {
    const quality=c.detail==='high'?[800,6]:c.detail==='balanced'?[500,4]:[300,3];
    const voxel=Math.min(longest/quality[0],c.smallestDetail/quality[1]);
    voxelBurden=(c.x/voxel)*(c.y/voxel)*(c.z/voxel);
    if(voxelBurden>200_000_000) warnings.push('Voxel resolution would imply a very large bounding-box grid. A numerical remesh trial is withheld: test a cropped local region or repair locally before attempting the whole object. This is a conservative workload screen, not a Blender RAM estimate.');
    else settings.push(rule({id:'voxel-trial',toolId:'remesh',setting:'Voxel Size',value:mm(voxel),trialRange:`${mm(voxel*.75)}–${mm(Math.min(voxel*1.5,c.smallestDetail/3))}`,
      why:`The ${c.detail} detail choice limits voxel size both by overall scale and by the ${mm(c.smallestDetail)} feature you want to retain. Smaller grid cells sample smaller shapes; they do not guarantee those shapes survive.`,
      higher:'Faster/coarser rebuilding; small gaps, facial features and thin parts may disappear or merge.',lower:'More geometry and memory cost; noise can be retained and Blender may become unresponsive.',
      formula:`min(${fmt(longest)} / ${quality[0]}, ${fmt(c.smallestDetail)} / ${quality[1]}) = ${mm(voxel)}. Adaptivity 0 is an initial uniform-grid trial.`,confidence:'Low',sourceIds:['voxel','retopology','remesh-mod'],assumptions:[...baseAssumptions,'Confirmed closed organic volume, no critical dimensional interfaces.','Backup exists; acceptable topology and detail changes have been considered.'],
    }));
  }
  if(d.tools.includes('decimate') && !c.requirements.length) {
    const ratio=c.detail==='high'?.9:c.detail==='balanced'?.75:.6;
    const lower=c.detail==='high'?.8:c.detail==='balanced'?.6:.4;
    settings.push(rule({id:'decimate-trial',toolId:'decimate',setting:'Collapse Ratio',value:ratio.toFixed(2),trialRange:`${lower.toFixed(2)}–1.00`,why:`Retain about ${ratio*100}% of the input faces for an initial ${c.detail}-detail comparison. No numerical surface-error guarantee follows from this ratio.`,higher:'More faces retained and less reduction in file/editing cost.',lower:'More shape simplification; thin features and rounded silhouettes may degrade.',formula:'Quality-based authored retention trial, not a polygon-count target or official Blender default.',confidence:'Low',sourceIds:['decimate'],assumptions:[...baseAssumptions,'Original mesh actually has excess density; visual comparison is required.']}));
  }
  if(problemId==='rough' && !c.requirements.length) settings.push(rule({id:'smooth-trial',toolId:'sculpt-smooth',setting:'Smooth brush Strength',value:'0.15',trialRange:'0.05–0.25',why:'Use one light stroke on a masked region and inspect before repeating. Radius depends on the defect and current zoom.',higher:'Repeated or stronger strokes can erase detail and shrink thin regions.',lower:'May require several controlled strokes; check accumulated effect.',formula:'Authored low-strength trial. Mesh density and brush footprint cannot be inferred from overall size.',confidence:'Low',sourceIds:['sculpt-smooth','mask'],assumptions:[...baseAssumptions,'Important details are masked; only the defective region is edited.']}));
  if(c.requirements.length) warnings.push('Global remesh, merge-distance and simplification trials are withheld because you selected a critical dimension/interface requirement. The thickness screen remains a diagnostic target, not a CAD tolerance.');
  return {errors,settings,warnings,voxelBurden};
}
