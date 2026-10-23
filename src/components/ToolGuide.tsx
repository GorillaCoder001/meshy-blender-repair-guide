import { useState } from 'react';
import { AlertTriangle, ChevronRight,MousePointer2 } from 'lucide-react';
import type { Mode,Tool } from '../types';
import { Evidence } from './Evidence';
import { ComparisonDiagram } from './ComparisonDiagram';
import { VisualRepairGuide } from './VisualRepairGuide';
export function BlenderPath({path}:{path:string[]}) {
  return <div className="blender-path" aria-label="Blender UI path">{path.map((p,i)=><span key={i}>{i>0&&<ChevronRight size={12}/>}<span>{p}</span></span>)}</div>;
}
export function ToolGuide({tool:t,mode='beginner',open=false}:{tool:Tool;mode?:Mode;open?:boolean}) {
  const [visual,setVisual]=useState(false);
  return <details className="tool-guide" open={open||undefined} id={`tool-${t.id}`}><summary><span className="tool-index">{t.category}</span><span><strong>{t.name}</strong><span className="tool-purpose">{t.purpose}</span></span><ChevronRight size={18} className="expander"/></summary><div className="tool-body">
    <BlenderPath path={t.path}/>
    <button className="button secondary visual-guide-button" aria-expanded={visual} onClick={()=>setVisual(!visual)}><MousePointer2 size={16}/>{visual?'Hide screenshot guide':'Show me where to click'}</button>
    {visual&&<VisualRepairGuide key={t.id} toolId={t.id}/>}
    {(t.destructive||t.path.includes('Modifiers'))&&<div className="notice amber"><AlertTriangle size={17}/><p>{t.destructive?'Save a separate file and duplicate the object before this operation.':'Keep the original and inspect the modifier preview before applying.'} Applying a modifier commits its geometry changes. Recover from a saved backup if needed.</p></div>}
    <div className="tool-columns"><div><span className="eyebrow">PRACTICAL STARTING PROCEDURE</span><p>{t.starting}</p>
      <div className="control-tags">{t.controls.map(c=><span key={c}>{c}</span>)}</div>
      {mode!=='intermediate'&&<ol className="steps">{t.steps.map(s=><li key={s}>{s}</li>)}</ol>}
      <h4>What could go wrong</h4><p>{t.risks}</p><h4>When to choose another method</h4><p>{t.avoid}</p>
      <h4>Verify the result</h4><p>{t.verify}</p>
      {mode==='advanced'&&<><h4>Topology & tradeoffs</h4><p>{t.advanced}</p><p className="muted">Scale dependency: {t.scale}</p></>}
    </div><ComparisonDiagram kind={t.diagram} compact/></div>
    <Evidence ids={t.sources}/><div className="small muted">Blender {t.version} · {t.confidence} documentary confidence · Numeric starting procedures are guide heuristics.</div>
  </div></details>;
}
