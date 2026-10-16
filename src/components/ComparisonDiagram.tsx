import { useId, useState } from 'react';
import type { DiagramKind } from '../types';
const descriptions:Record<DiagramKind,[string,string,string]>={
  manifold:['Broken boundary','Closed boundary','A closed edge connection is one check; intersections and useful thickness need separate review.'],
  shell:['Single surface','Wall volume + cavity','A designed cavity can remain empty while the connected walls enclose a printable material volume.'],
  normals:['Inconsistent directions','Coherent directions','Arrows represent face normals. Orientation repair does not create missing faces.'],
  internal:['Unwanted inner surface','Intended boundary only','Delete only confirmed redundant geometry. Keep any surface that defines an intended cavity.'],
  floating:['Detached component','Intentional attachment','An important part needs real material contact, or a deliberate separately printed assembly.'],
  intersection:['Overlapping surfaces','Unified outer boundary','A Boolean union can join suitable overlapping volumes. Inspect the resulting joint.'],
  hole:['Missing patch','Rebuilt patch','A boundary patch must follow the intended shape. Filling cannot infer missing anatomy.'],
  voxel:['Original surface','Sampled on a grid','Voxel reconstruction approximates the surface. Grid size controls detail and workload.'],
  decimate:['Dense mesh','Reduced mesh','Fewer faces can approximate the silhouette. A ratio does not define a dimensional error bound.'],
  thickness:['Thin region','Measured wall','Wall thickness is a geometric requirement. Strength still depends on material, orientation and use.'],
};
export function ComparisonDiagram({kind,compact=false}:{kind:DiagramKind;compact?:boolean}) {
  const [after,setAfter]=useState(false); const id=useId().replace(/:/g,'');
  const [beforeLabel,afterLabel,caption]=descriptions[kind];
  const color=after?'#8ed2b5':'#f5a374'; const muted='#657582';
  const cube='M90 65 160 30 230 65 230 145 160 180 90 145Z M90 65 160 100 230 65 M160 100V180';
  const meshLines=Array.from({length:7},(_,i)=>{const y=45+i*20;return <path key={i} d={`M75 ${y}H245 M${100+i*18} 35V180`} />;});
  let body;
  switch(kind) {
    case 'manifold': body=<><path d={cube} fill="none" stroke={muted}/><path d={after?'M90 65 160 100 230 65':'M90 65 148 94 M172 94 230 65'} fill="none" stroke={color} strokeWidth="4"/>{!after&&<circle cx="160" cy="100" r="20" fill="none" stroke={color} strokeDasharray="4 4"/>}</>;break;
    case 'shell': body=<><path d={after?'M85 45V170H235V45H219V154H101V45Z':'M85 45V170H235V45'} fill={after?'#8ed2b526':'none'} stroke={color} strokeWidth="3"/>{after&&<><text x="160" y="100" textAnchor="middle">cavity</text><path d="M215 175v12h22v-12" fill="none" stroke={color}/></>}<text x="160" y="202" textAnchor="middle">{after?'walls enclose material':'zero-thickness surface'}</text></>;break;
    case 'normals': body=<><path d="m95 140 30-80 85 5 25 75-70 35Z" fill="#ffffff06" stroke={muted}/>{[[95,140,65,145],[125,60,115,30],[210,65,236,45],[235,140,265,145],[165,175,165,202]].map(([x,y,dx,dy],i)=><path key={i} d={after||i%2===0?`M${x} ${y} ${dx} ${dy}`:`M${dx} ${dy} ${x} ${y}`} stroke={color} markerEnd={`url(#${id}-arrow)`}/>)}</>;break;
    case 'internal': body=<><path d={cube} fill="#ffffff03" stroke={muted}/>{!after&&<path d="m115 85 75-20v80l-75 20Z" fill="#f5a37428" stroke={color}/>}<text x="160" y="210" textAnchor="middle">{after?'inspect intended cavities separately':'unwanted nested surface'}</text></>;break;
    case 'floating': body=<><path d="M95 80Q155 45 190 95L210 165H90Z" fill="#ffffff04" stroke={muted}/><path d={after?'M190 95 224 66 247 95 210 126Z':'M220 44 247 67 227 89 202 65Z'} fill={after?'#8ed2b520':'#f5a37414'} stroke={color}/>{!after&&<path d="m195 93 20-6" stroke={color} strokeDasharray="4 3"/>}</>;break;
    case 'intersection': body=after?<path d="M160 54A63 63 0 1 0 160 164A63 63 0 1 0 160 54Z" fill="#8ed2b510" stroke={color}/>:<><circle cx="125" cy="110" r="63" fill="#ffffff04" stroke={muted}/><circle cx="195" cy="110" r="63" fill="#f5a3740a" stroke={color}/><path d="M160 58Q110 110 160 164Q210 110 160 58Z" fill="#f5a37425" stroke={color}/></>;break;
    case 'hole': body=<><path d="m80 55 145-20 30 133-150 20Z" fill="#ffffff03" stroke={muted}/><path d="M80 55 143 110 105 188 M225 35 143 110 255 168 M80 55 225 35 255 168 105 188Z" fill="none" stroke={muted}/><path d="m143 110 62-20-15 64Z" fill={after?'#8ed2b524':'#111820'} stroke={color} strokeDasharray={after?'':'5 4'}/></>;break;
    case 'voxel': body=<><path d={after?'M80 160V100H100V80H120V60H160V80H180V60H200V80H220V120H240V160Z':'M80 160Q65 105 105 75T158 68Q179 95 192 64Q222 53 232 110L240 160Z'} fill={after?'#8ed2b510':'#ffffff05'} stroke={color}/>{after&&<g stroke="#8ed2b533" strokeWidth=".7">{meshLines}</g>}</>;break;
    case 'decimate': body=<><path d="m80 120 30-60 75-20 58 55-20 75-90 17Z" fill="#ffffff03" stroke={color}/><g stroke={muted} strokeWidth="1">{(after?[0,2,4]:[0,1,2,3,4,5,6]).map(i=><path key={i} d={`M${110+i*16} ${60+i*4} 133 187 M80 120 ${185+i*8} ${40+i*17}`}/>)}</g></>;break;
    case 'thickness': body=<><path d="M85 50H235V180H85Z" fill={after?'#8ed2b51c':'#f5a3740a'} stroke={muted}/><path d={after?'M110 75H210V155H110Z':'M91 56H229V174H91Z'} fill="#111820" stroke={color}/><path d={after?'M85 196H110':'M85 196H91'} stroke={color} strokeWidth="3"/><text x="160" y="218" textAnchor="middle">{after?'measure actual thickness':'inspect at final print size'}</text></>;break;
  }
  return <figure className={`diagram ${compact?'compact':''}`}>
    <div className="diagram-switch" aria-label="Concept comparison"><button type="button" aria-pressed={!after} onClick={()=>setAfter(false)}>{beforeLabel}</button><button type="button" aria-pressed={after} onClick={()=>setAfter(true)}>{afterLabel}</button></div>
    <svg viewBox="0 0 320 235" role="img" aria-label={`${after?afterLabel:beforeLabel}: ${caption}`}>
      <defs><marker id={`${id}-arrow`} markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><path d="m0 0 6 3-6 3" fill={color}/></marker><pattern id={`${id}-grid`} width="20" height="20" patternUnits="userSpaceOnUse"><path d="M20 0H0V20" fill="none" stroke="#ffffff05"/></pattern></defs>
      <rect width="320" height="235" fill={`url(#${id}-grid)`}/><g strokeWidth="1.8">{body}</g>
    </svg><figcaption>{caption} <span>Concept illustration.</span></figcaption>
  </figure>;
}
