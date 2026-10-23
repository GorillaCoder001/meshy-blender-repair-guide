import { useId,useState } from 'react';
import { ArrowLeft,ArrowRight,ExternalLink,Maximize2,Minimize2,CheckCircle2 } from 'lucide-react';
import { guideImages,stepsForTool } from '../data/visual-guides';
import { toolById } from '../data/blender-tools';
export function VisualRepairGuide({toolId}:{toolId:string}){
  const [step,setStep]=useState(0),[zoom,setZoom]=useState(false),[done,setDone]=useState(false);
  const steps=stepsForTool(toolId),current=steps[Math.min(step,steps.length-1)],asset=guideImages[current.image],marker=useId().replace(/:/g,'');
  const [x,y]=current.target;
  const view=asset.panel?[0,0,asset.width,Math.min(asset.height,580)]:zoom?[Math.max(0,Math.min(asset.width-720,x-360)),Math.max(0,Math.min(asset.height-410,y-180)),720,410]:[0,0,asset.width,asset.height];
  const startX=x<asset.width*.45?x+Math.min(asset.width*.13,150):x-Math.min(asset.width*.13,150);
  const startY=Math.max(view[1]+22,Math.min(view[1]+view[3]-22,y+Math.min(view[3]*.17,95)));
  const next=()=>{if(step<steps.length-1){setStep(step+1);setDone(false);}else setDone(true);};
  return <section className="visual-repair-guide"><div className="visual-guide-heading"><div><span className="eyebrow">FOLLOW IN YOUR BLENDER WINDOW</span><h3>{toolById[toolId]?.name??'Repair guide'}</h3></div><span className="mono">{step+1} / {steps.length}</span></div>
    <div className="visual-step-title"><span>{String(step+1).padStart(2,'0')}</span><h4>{current.title}</h4></div><p className="visual-instruction">{current.instruction}</p>
    <div className={`screenshot-stage ${asset.panel?'panel-reference':'workspace-reference'}`}><svg viewBox={view.join(' ')} role="img" aria-label={`${current.title}: arrow points to the control on a ${asset.version} screenshot`}>
      <defs><marker id={marker} markerWidth="9" markerHeight="9" refX="7.5" refY="4.5" orient="auto"><path d="M0 0 9 4.5 0 9Z" fill="#ffad7d"/></marker></defs>
      <image href={`${import.meta.env.BASE_URL}blender/${asset.file}`} width={asset.width} height={asset.height}/>
      <path d={`M${startX} ${startY}L${x} ${y}`} stroke="#111b" strokeWidth={asset.panel?9:13} fill="none"/>
      <path className="screenshot-arrow" d={`M${startX} ${startY}L${x} ${y}`} stroke="#ffad7d" strokeWidth={asset.panel?4:6} markerEnd={`url(#${marker})`} fill="none"/>
      <foreignObject x={x-25} y={y-25} width="50" height="50"><button className="screenshot-hotspot" aria-label={`${current.action} — continue guide`} onClick={next}/></foreignObject>
    </svg>{!asset.panel&&<button className="screenshot-zoom" aria-label={zoom?'Show full Blender screenshot':'Zoom to arrow target'} onClick={()=>setZoom(!zoom)}>{zoom?<Minimize2 size={17}/>:<Maximize2 size={17}/>}</button>}</div>
    <div className="screenshot-credit"><span>{asset.version}{asset.panel?' · reference layout; compare labels with your version':''}</span>{asset.source&&<a href={asset.source} target="_blank" rel="noopener noreferrer" aria-label="Open screenshot source"><ExternalLink size={12}/></a>}</div>
    <div className="visual-guide-actions"><button className="button secondary" disabled={step===0} onClick={()=>{setStep(step-1);setDone(false);}}><ArrowLeft size={15}/>Previous</button><button className="button primary" onClick={next}>{step<steps.length-1?'Next step':'Mark reviewed'}<ArrowRight size={15}/></button></div>
    {done&&<p className="guide-reviewed" role="status"><CheckCircle2 size={15}/>Navigation reviewed. Verify the actual repair in Blender and the slicer.</p>}
    <p className="screenshot-help">Click the arrow target or use Next after following the step in Blender. Arrows are the only image annotations. Existing screenshot values are examples, not recommended settings.</p>
    {asset.panel&&<p className="screenshot-attribution">{asset.credit}. <a href="https://creativecommons.org/licenses/by-sa/4.0/" target="_blank" rel="noopener noreferrer">Licence</a>.</p>}
  </section>;
}
