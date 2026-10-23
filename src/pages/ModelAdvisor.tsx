import { useEffect,useState } from 'react';
import { ArrowRight,Check,ChevronDown,ScanLine,TriangleAlert } from 'lucide-react';
import type { Answers,Context } from '../types';
import type { LocalModelController } from '../model/useLocalModel';
import { findingsFor } from '../model/findings';
import { defaultAnswers,modelTypes } from '../data/model-types';
import { tools,toolById } from '../data/blender-tools';
import { LocalUpload } from '../components/LocalUpload';
import { LocalModelViewer } from '../components/LocalModelViewer';
import { VisualRepairGuide } from '../components/VisualRepairGuide';
import { Evidence } from '../components/Evidence';
import { advise } from '../engine/settings-engine';
const number=(n:number)=>Number(n.toFixed(3)).toLocaleString();
export default function ModelAdvisor({controller,context,onContextChange}:{controller:LocalModelController;context:Context;onContextChange:(c:Context)=>void}){
  const {model}=controller;const [selectedTool,setSelectedTool]=useState('toolbox'),[all,setAll]=useState(false),[answers,setAnswers]=useState(defaultAnswers),[contextOpen,setContextOpen]=useState(false);
  const findings=model?findingsFor(model.health):[];const activeFinding=findings.find(f=>f.toolId===selectedTool);
  useEffect(()=>{
    if(!model)return;
    setSelectedTool(findingsFor(model.health)[0].toolId);setAnswers(defaultAnswers);
    onContextChange({...context,x:model.health.dimensions[0],y:model.health.dimensions[1],z:model.health.dimensions[2]});
  },[model]);
  const problemId=activeFinding?.problemId??(selectedTool==='decimate'?'polygons':selectedTool==='solidify'?'thin':selectedTool==='smooth'?'rough':'unknown');
  const trials=advise(context,problemId,answers);
  const set=<K extends keyof Context>(key:K,value:Context[K])=>onContextChange({...context,[key]:value});
  const checkRows=model?[
    ['Triangles',model.health.triangles.toLocaleString()],
    ['Boundary edges',model.health.boundaryEdges?.toLocaleString()??'Not checked'],
    ['Non-manifold junctions',model.health.nonManifoldEdges?.toLocaleString()??'Not checked'],
    ['Connected shells',model.health.components?.toLocaleString()??'Not checked'],
    ['Winding conflicts',model.health.inconsistentEdges?.toLocaleString()??'Not checked'],
    ['Duplicate triangles',model.health.duplicateTriangles?.toLocaleString()??'Not checked'],
    ['Collapsed triangles',model.health.degenerateTriangles.toLocaleString()],
  ]:[];
  return <><div className="page-heading model-advisor-heading"><span className="eyebrow">YOUR MODEL → A REPAIR PLAN → WHERE TO CLICK</span><h1>Model repair advisor</h1><p>Choose a local model. Review the measured findings. Follow arrows on real Blender screenshots.</p></div><LocalUpload controller={controller}/>
    {model?<><div className="model-advisor-overview"><LocalModelViewer mesh={model.mesh}/><section className="model-facts"><div className="model-file-line"><span className="badge green">{model.mesh.format} · LOCAL FILE</span><h2>{model.name}</h2></div><div className="measured-dimensions">{model.health.dimensions.map((n,i)=><div key={i}><span>{['X','Y','Z'][i]}</span><strong>{number(n)}</strong><small>mm</small></div>)}</div>
      {model.mesh.format!=='3MF'?<label className="unit-control">Original file coordinates mean<select aria-label="Model coordinate units" value={model.unitFactor} onChange={e=>controller.changeUnits(Number(e.target.value))}><option value="1">Millimetres (assumed)</option><option value="10">Centimetres</option><option value="1000">Metres</option><option value="25.4">Inches</option></select></label>:<p className="small muted">3MF units and build/component transforms were read from the file.</p>}
      <dl className="health-readings">{checkRows.map(([name,value])=><div key={name}><dt>{name}</dt><dd>{value}</dd></div>)}</dl><details className="analysis-details"><summary>What these checks can and cannot establish</summary><p>Approximate coordinate-weld tolerance: {model.health.weldTolerance.toExponential(2)} mm. A closed edge result is not a self-intersection, thickness or strength certificate.</p><ul>{model.health.notes.map(n=><li key={n}>{n}</li>)}</ul></details>
    </section></div>
    <section className="advisor-context"><button className="context-toggle" aria-expanded={contextOpen} onClick={()=>setContextOpen(!contextOpen)}><span><strong>Print context</strong><small>{context.nozzle} mm nozzle · {context.material} · {context.load} · {context.smallestDetail} mm detail</small></span><ChevronDown size={18}/></button>{contextOpen&&<div className="advisor-selects"><label>Model type<select value={context.modelType} onChange={e=>set('modelType',e.target.value)}>{modelTypes.map(([id,name])=><option value={id} key={id}>{name}</option>)}</select></label><label>Nozzle<select value={context.nozzle} onChange={e=>set('nozzle',Number(e.target.value))}>{[.2,.4,.6,.8,1].map(n=><option key={n} value={n}>{n} mm</option>)}</select></label><label>Material<select value={context.material} onChange={e=>set('material',e.target.value as Context['material'])}>{['PLA','PETG','ABS/ASA','TPU','Other'].map(m=><option key={m}>{m}</option>)}</select></label><label>Use / load<select value={context.load} onChange={e=>set('load',e.target.value as Context['load'])}><option value="display">Decorative display</option><option value="handling">Routine handling</option><option value="functional">Functional prototype</option><option value="critical">Critical load</option></select></label><label>Smallest detail to preserve<select value={context.smallestDetail} onChange={e=>set('smallestDetail',Number(e.target.value))}>{[.1,.2,.4,.6,.8,1,1.5,2,3,5].map(n=><option value={n} key={n}>{n} mm</option>)}</select></label><label>Geometry confirmed in Blender<select value={answers.geometry} onChange={e=>setAnswers({...answers,geometry:e.target.value as Answers['geometry']})}><option value="unknown">Not yet confirmed</option><option value="closed">Closed outer volume</option><option value="surface">Open / zero-thickness surface</option><option value="cavity">Designed cavity with walls</option></select></label><a className="text-link" href="#diagnose">More context & precision requirements<ArrowRight size={14}/></a></div>}</section>
    <section className="findings-section"><div className="section-heading"><div><span className="eyebrow">BASED ON YOUR LOCAL GEOMETRY</span><h2>What to inspect first</h2></div><button className="text-button" onClick={()=>setAll(!all)}>{all?'Show findings':'Browse all repairs'}</button></div><div className="finding-list">{findings.map(f=><button className={`finding-row ${selectedTool===f.toolId?'active':''}`} key={f.id} onClick={()=>setSelectedTool(f.toolId)}>{f.level==='issue'?<TriangleAlert size={18}/>:<ScanLine size={18}/>}<span><strong>{f.title}</strong><small>{f.detail}</small></span><span className="finding-action">Show me<ArrowRight size={15}/></span></button>)}</div>{all&&<div className="all-repair-buttons">{tools.map(t=><button className={selectedTool===t.id?'active':''} key={t.id} onClick={()=>setSelectedTool(t.id)}>{t.name}</button>)}</div>}</section>
    </>:<section className="advisor-start"><div><span className="eyebrow">OR EXPLORE A REPAIR</span><h2>Show me where to click</h2><p>Select a repair below to open a visual guide without loading a model.</p><div className="all-repair-buttons">{['non-manifold','merge-distance','fill-holes','normals','solidify','boolean','decimate','remesh-mod','smooth','toolbox'].map(id=><button className={selectedTool===id?'active':''} key={id} onClick={()=>setSelectedTool(id)}>{toolById[id].name}</button>)}</div></div></section>}
    <div className="advisor-guide-anchor" id="repair-guide"><VisualRepairGuide key={selectedTool} toolId={selectedTool}/></div>
    {model&&<section className="advisor-starting-points"><h3>Starting points for this print context</h3><p className="small muted">Geometry checks establish only the findings above. Numerical trials still depend on your print context and actual Blender inspection.</p>{trials.errors.length>0?<p className="small muted">This model’s raw dimensions need review before numerical trials. A planar source may need a designed thickness; use the manual context workflow for the intended final dimensions.</p>:trials.settings.map(s=><article key={s.id}><div><span>{s.setting}</span><strong>{s.value}</strong><span className="badge amber">Heuristic</span></div><p>{s.why}</p><small>Suggested trial range: {s.trialRange}</small><Evidence ids={s.sourceIds} kind={s.kind}/></article>)}{trials.warnings.map(w=><p className="small muted" key={w}>{w}</p>)}</section>}
    <div className="advisor-bottom"><Check size={18}/><p>Save a Blender duplicate before repair. After each change, re-export and choose the revised file here to compare the basic checks. Always inspect Bambu Studio’s layer preview.</p></div>
  </>;
}
