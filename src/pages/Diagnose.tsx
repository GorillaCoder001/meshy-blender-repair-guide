import { useState } from 'react';
import { ArrowLeft,ArrowRight,Check,AlertTriangle,SlidersHorizontal,CheckCircle2 } from 'lucide-react';
import type { Answers,Context,Mode } from '../types';
import { defaultAnswers } from '../data/model-types';
import { problems,problemById } from '../data/repair-problems';
import { toolById } from '../data/blender-tools';
import { ContextForm } from '../components/ContextForm';
import { ComparisonDiagram } from '../components/ComparisonDiagram';
import { Evidence } from '../components/Evidence';
import { ToolGuide } from '../components/ToolGuide';
import { diagnose } from '../engine/diagnosis-engine';
import { chooseApproach } from '../engine/cad-escalation';
import { advise,validateContext } from '../engine/settings-engine';
import { workflowFor } from '../engine/workflow-engine';
export function ObservationForm({problemId,answers:a,onChange}:{problemId:string;answers:Answers;onChange:(a:Answers)=>void}) {
  const set=<K extends keyof Answers>(k:K,v:Answers[K])=>onChange({...a,[k]:v});
  return <div className="observation-form"><div className="section-label"><span>02</span><div><h3>Confirm what you can see</h3><p>Your observations guide the branch. Uncertain is a valid answer.</p></div></div>
    {problemId==='holes'&&<label>Is the opening part of the intended design?<select value={a.opening} onChange={e=>set('opening',e.target.value as Answers['opening'])}><option value="unknown">I’m not sure yet</option><option value="unintended">No · it is a missing surface</option><option value="intentional">Yes · keep the opening</option></select></label>}
    {['hollow','non-manifold','thin','clothing','rough','distorted','intersections','unknown'].includes(problemId)&&<label>What kind of geometry have you confirmed?<select value={a.geometry} onChange={e=>set('geometry',e.target.value as Answers['geometry'])}><option value="unknown">Not confirmed · inspect first</option><option value="closed">Closed outer volume</option><option value="surface">Open / zero-thickness surface</option><option value="cavity">Cavity with existing walls</option></select><span className="field-help">Confirm in Blender using boundaries, orientation and cross-section inspection. Appearance alone can mislead.</span></label>}
    {problemId==='hollow'&&<label>Should the final design have a cavity?<select value={String(a.wantHollow)} onChange={e=>set('wantHollow',e.target.value==='true')}><option value="false">No · I want an enclosed volume</option><option value="true">Yes · preserve or create a cavity</option></select></label>}
    {['floating','parts','hair'].includes(problemId)&&<><label>Does the detached piece belong to the design?<select value={a.pieces} onChange={e=>set('pieces',e.target.value as Answers['pieces'])}><option value="unknown">Not sure · inspect the component first</option><option value="keep">Yes · keep / attach it</option><option value="debris">No · confirmed unwanted debris</option></select></label>{a.pieces==='keep'&&<label>Is there real material contact?<select value={a.contact} onChange={e=>set('contact',e.target.value as Answers['contact'])}><option value="unknown">Not confirmed</option><option value="overlap">Volumes overlap</option><option value="separate">Gap / point contact only</option></select></label>}</>}
    <fieldset><legend>Shape and detail checks</legend><div className="observation-checks"><label><input type="checkbox" checked={a.importantMissing} onChange={e=>set('importantMissing',e.target.checked)}/>Important geometry is missing</label><label><input type="checkbox" checked={!a.faceUsable} onChange={e=>set('faceUsable',!e.target.checked)}/>The character’s face is unusable</label><label><input type="checkbox" checked={a.backInvented} onChange={e=>set('backInvented',e.target.checked)}/>The unseen back is badly invented</label><label><input type="checkbox" checked={a.destroysDetail} onChange={e=>set('destroysDetail',e.target.checked)}/>Topology rebuilding would destroy key details</label></div></fieldset>
    <ComparisonDiagram kind={problemById[problemId]?.diagram??'manifold'} compact/>
  </div>;
}
export function DecisionPanel({context,answers}:{context:Context;answers:Answers}) {
  const d=chooseApproach(context,answers);
  return <section className={`decision-panel ${d.tone}`}><span className="eyebrow">RECOMMENDED APPROACH · RULE-BASED</span><h3>{d.choice}</h3><p>{d.reason}</p><p className="muted">{d.next}</p><Evidence ids={d.sources} kind="HEURISTIC / PRACTICAL STARTING POINT" reason="This is an explicit decision rule based on your requirements and reported observations. It is not a scan, a cost estimate or an official vendor classification."/></section>;
}
export function DiagnosisResults({context:c,problemId,answers:a,mode}:{context:Context;problemId:string;answers:Answers;mode:Mode}) {
  const d=diagnose(problemId,c,a);const r=advise(c,problemId,a);const workflow=workflowFor(d);
  return <div className="results"><div className="result-heading"><CheckCircle2 size={24}/><div><span className="eyebrow">YOUR GUIDED REPAIR PATH</span><h2>{d.title}</h2></div></div><p className="lead small-lead">{d.explanation}</p><div className="notice neutral"><p>Based on your answers. No model file has been inspected. Recheck your observations in Blender before editing.</p></div>
    <DecisionPanel context={c} answers={a}/>
    <section className="result-section"><span className="eyebrow">BEFORE YOU CHANGE ANYTHING</span><h3>Confirm the diagnosis</h3>{d.confirmations.map(text=><p key={text}>{text}</p>)}</section>
    {[...d.warnings,...r.warnings].length>0&&<div className="notice amber"><AlertTriangle size={19}/><ul>{[...new Set([...d.warnings,...r.warnings])].map(w=><li key={w}>{w}</li>)}</ul></div>}
    <section className="result-section"><div className="section-title"><SlidersHorizontal size={21}/><h3>Context-aware starting points</h3></div><p className="muted">Every number below is an authored heuristic. A source link supports the tool’s behavior, not these coefficients.</p>
    {r.settings.length?r.settings.map(s=><article className="setting-row" key={s.id}><div className="setting-top"><div><a className="setting-tool" href={`#tools/${s.toolId}`}>{toolById[s.toolId].name}</a><h4>{s.setting}</h4></div><strong className="setting-value">{s.value}</strong></div><div className="setting-meta"><span className="badge amber">Heuristic</span><span>{s.confidence} numerical confidence</span><span>Suggested trial range: <b>{s.trialRange}</b></span></div><p>{s.why}</p><details className="tradeoffs"><summary>Formula, assumptions & tradeoffs</summary><div><code>{s.formula}</code><p><strong>If higher:</strong> {s.higher}</p><p><strong>If lower:</strong> {s.lower}</p><ul>{s.assumptions.map(t=><li key={t}>{t}</li>)}</ul></div></details><Evidence ids={s.sourceIds} kind={s.kind} reason="The formula is a Created3D practical trial, not a Blender default or a tested safety limit. Adjust on a duplicate after actual geometry inspection."/></article>):<p>No numerical trial is appropriate for the current context. Follow the inspection steps and obtain any required design review.</p>}</section>
    <section className="result-section"><h3>The repair workflow</h3><p className="muted">Keep a backup. Open each step for the exact Blender path, tool controls, risks and verification.</p><div className="workflow-tools">{workflow.map((id,i)=><div className="workflow-tool" key={id}><span className="step-number">{String(i+1).padStart(2,'0')}</span><ToolGuide tool={toolById[id]} mode={mode}/></div>)}</div></section>
    <div className="verification-box"><Check size={23}/><div><h3>How to know the repair worked</h3><p>{d.verification}</p><a className="text-link" href="#print-check">Continue to print checks & Bambu handoff <ArrowRight size={15}/></a></div></div>
  </div>;
}
export function DiagnosePage({initialProblem='unknown',advisor=false,context,onContextChange,mode}:{initialProblem?:string;advisor?:boolean;context:Context;onContextChange:(c:Context)=>void;mode:Mode}) {
  const [problemId,setProblem]=useState(problemById[initialProblem]?initialProblem:'unknown');
  const [answers,setAnswers]=useState(defaultAnswers);const [stage,setStage]=useState(0);const [errors,setErrors]=useState<string[]>([]);
  const next=()=>{const e=validateContext(context);setErrors(e);if(!e.length){setStage(s=>s+1);window.scrollTo({top:0,behavior:'smooth'});}};
  return <><div className="page-heading"><span className="eyebrow">{advisor?'PRINT CONTEXT → PRACTICAL TRIALS':'OBSERVE → UNDERSTAND → REPAIR'}</span><h1>{advisor?'Settings advisor':'Diagnose your model'}</h1><p>A guided path from an observed symptom to a tool you understand.</p></div>
    <nav className="wizard-progress" aria-label="Diagnosis steps">{['Print context','Confirm symptom','Repair path'].map((label,i)=><button key={label} disabled={i>stage} aria-current={i===stage?'step':undefined} onClick={()=>setStage(i)}><span>{i<stage?<Check size={14}/>:i+1}</span>{label}</button>)}</nav>
    <div className={stage===2?'':'diagnose-layout'}><div>
      {stage===0&&<><label className="problem-select">What problem does your Meshy model have?<select value={problemId} onChange={e=>{setProblem(e.target.value);setAnswers(defaultAnswers);}}>{problems.map(p=><option key={p.id} value={p.id}>{p.title}</option>)}</select></label><ContextForm context={context} onChange={onContextChange}/></>}
      {stage===1&&<ObservationForm problemId={problemId} answers={answers} onChange={setAnswers}/>}
      {stage===2&&<DiagnosisResults context={context} problemId={problemId} answers={answers} mode={mode}/>}
      {errors.length>0&&<div role="alert" className="notice amber"><ul>{errors.map(e=><li key={e}>{e}</li>)}</ul></div>}
      <div className="wizard-actions">{stage>0&&<button className="button secondary" onClick={()=>setStage(s=>s-1)}><ArrowLeft size={16}/>Back</button>}{stage<2?<button className="button primary" onClick={next}>{stage===0?'Continue to observations':'Build my repair path'}<ArrowRight size={16}/></button>:<button className="button secondary" onClick={()=>setStage(0)}>Edit print context</button>}</div>
    </div>{stage!==2&&<aside className="context-aside"><span className="eyebrow">REPAIR THE RIGHT THING</span><ComparisonDiagram kind={problemById[problemId].diagram} compact/><h3>{problemById[problemId].title}</h3><p>{problemById[problemId].confirm}</p><div className="aside-note"><span className="status-dot"/> All guidance runs in your browser.<br/>No upload. No account. No API key.</div></aside>}</div>
  </>;
}
