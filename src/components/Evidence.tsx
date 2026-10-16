import { ExternalLink, BookOpen, ShieldCheck } from 'lucide-react';
import { sourceById, BLENDER_VERSION, REVIEWED } from '../data/sources';
import type { EvidenceKind } from '../types';
export function Evidence({ids,kind='OFFICIAL / DOCUMENTED',reason}:{ids:string[];kind?:EvidenceKind;reason?:string}) {
  return <details className="evidence"><summary><BookOpen size={14}/><span>Why this guidance?</span><span className="source-count">{ids.length} source{ids.length!==1?'s':''}</span></summary><div className="evidence-body">
    <span className={`badge ${kind.startsWith('HEURISTIC')?'amber':'green'}`}>{kind}</span>
    <p>{reason ?? 'Sources support tool behavior and UI semantics. Numerical trials are authored heuristics; they are not official Blender recommendations.'}</p>
    {ids.map(id=>{const s=sourceById[id];return s?<article className="source-mini" key={id}><a href={s.url} target="_blank" rel="noopener noreferrer">{s.title}<ExternalLink size={13}/></a><div className="muted small">{s.type} · {s.confidence} confidence · {s.verification}</div><p>{s.note}</p><span className="muted small">Accessed {s.accessed} · Blender {s.blenderVersion}</span></article>:<p role="alert" key={id}>Source reference unavailable: {id}</p>;})}
    <p className="muted small"><ShieldCheck size={13}/> Researched for Blender {BLENDER_VERSION} · Reviewed {REVIEWED}. Documentary verification; live Blender UI validation remains outstanding.</p>
  </div></details>;
}
