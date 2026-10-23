import type { LocalMesh,MeshHealth } from './types';
export const TOPOLOGY_TRIANGLE_LIMIT=200_000;
export function analyzeMesh(mesh:LocalMesh,progress:(s:string)=>void=()=>{}):MeshHealth {
  const p=mesh.positions,n=p.length/9;
  if(!Number.isInteger(n)||n<1)throw new Error('The model contains no complete triangles.');
  const min:[number,number,number]=[Infinity,Infinity,Infinity],max:[number,number,number]=[-Infinity,-Infinity,-Infinity];
  for(let i=0;i<p.length;i++){const axis=i%3;if(!Number.isFinite(p[i]))throw new Error('The model contains an invalid coordinate.');min[axis]=Math.min(min[axis],p[i]);max[axis]=Math.max(max[axis],p[i]);}
  const dimensions=min.map((v,i)=>max[i]-v) as [number,number,number];const longest=Math.max(...dimensions);
  if(longest<1e-8)throw new Error('The model has no measurable extent.');
  const tolerance=Math.max(1e-7,longest*1e-8),areaTolerance=tolerance*tolerance;
  const checked=n<=TOPOLOGY_TRIANGLE_LIMIT;
  const vertices=new Map<string,number>(),edges=new Map<string,{count:number;balance:number;face:number}>(),faces=new Set<string>();
  const parent=new Uint32Array(checked?n:0),active=new Uint8Array(checked?n:0),volumes=new Float64Array(checked?n:0);
  if(checked)for(let i=0;i<n;i++)parent[i]=i;
  const root=(v:number):number=>{let r=v;while(parent[r]!==r)r=parent[r];while(parent[v]!==v){const next=parent[v];parent[v]=r;v=next;}return r;};
  const join=(a:number,b:number)=>{const x=root(a),y=root(b);if(x!==y)parent[y]=x;};
  const center=min.map((v,i)=>(v+max[i])/2);let area=0,degenerate=0,duplicates=0;
  progress(checked?'Checking edges, components and winding locally…':'Measuring all triangles; detailed topology is skipped for this large model…');
  for(let face=0;face<n;face++){
    const o=face*9,a=[p[o],p[o+1],p[o+2]],b=[p[o+3],p[o+4],p[o+5]],c=[p[o+6],p[o+7],p[o+8]];
    const u=b.map((v,i)=>v-a[i]),v=c.map((x,i)=>x-a[i]),cross=[u[1]*v[2]-u[2]*v[1],u[2]*v[0]-u[0]*v[2],u[0]*v[1]-u[1]*v[0]],triangleArea=Math.hypot(...cross)/2;
    if(triangleArea<=areaTolerance){degenerate++;continue;}area+=triangleArea;
    if(!checked)continue;active[face]=1;
    const ids=[a,b,c].map(point=>{const key=point.map(v=>Math.round(v/tolerance)).join(',');let id=vertices.get(key);if(id===undefined){id=vertices.size;vertices.set(key,id);}return id;});
    if(new Set(ids).size<3){degenerate++;active[face]=0;continue;}
    const key=[...ids].sort((a,b)=>a-b).join(',');if(faces.has(key))duplicates++;else faces.add(key);
    for(let i=0;i<3;i++){
      const x=ids[i],y=ids[(i+1)%3],key=x<y?`${x},${y}`:`${y},${x}`,edge=edges.get(key);
      if(edge){edge.count++;edge.balance+=x<y?1:-1;join(face,edge.face);}else edges.set(key,{count:1,balance:x<y?1:-1,face});
    }
    const ac=a.map((v,i)=>v-center[i]),bc=b.map((v,i)=>v-center[i]),cc=c.map((v,i)=>v-center[i]);
    volumes[face]=(ac[0]*(bc[1]*cc[2]-bc[2]*cc[1])+ac[1]*(bc[2]*cc[0]-bc[0]*cc[2])+ac[2]*(bc[0]*cc[1]-bc[1]*cc[0]))/6;
  }
  if(area<=areaTolerance)throw new Error('Only zero-area geometry was found. Export a surface mesh from Blender.');
  let boundary=0,nonmanifold=0,winding=0;for(const e of edges.values()){if(e.count===1)boundary++;else if(e.count>2)nonmanifold++;else if(e.balance!==0)winding++;}
  const componentVolumes=new Map<number,number>();if(checked)for(let i=0;i<n;i++)if(active[i]){const r=root(i);componentVolumes.set(r,(componentVolumes.get(r)||0)+volumes[i]);}
  const closedCandidate=checked&&!boundary&&!nonmanifold&&!winding&&!duplicates&&!degenerate;
  // Negative signed volume is meaningful only for closed, consistently wound shells.
  const inward=closedCandidate?[...componentVolumes.values()].filter(v=>v<-(tolerance**3)).length:null;
  return {dimensions,min,max,triangles:n,area,topologyChecked:checked,weldTolerance:tolerance,
    boundaryEdges:checked?boundary:null,nonManifoldEdges:checked?nonmanifold:null,inconsistentEdges:checked?winding:null,
    components:checked?componentVolumes.size:null,duplicateTriangles:checked?duplicates:null,degenerateTriangles:degenerate,
    inwardComponents:inward,closedCandidate,notes:[...mesh.notes,
      'Topology counts use approximate coordinate welding; the tolerance is shown in the analysis details.',
      'Connected components are edge-connected shells. Multiple components can be deliberate parts or nested cavity walls.',
      'Self-intersections, local wall thickness, load capacity and missing artistic detail are not measured.',
      ...(checked?[]:['Above 200,000 triangles, detailed edge, winding, duplicate and component checks are not performed; dimensions and area still use all triangles.'])]};
}
