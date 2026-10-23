import { describe,it,expect } from 'vitest';
import { zipSync,strToU8 } from 'fflate';
import { parseModel,parseSTL,parse3MF,parseOBJ } from '../src/model/parsers';
import { analyzeMesh,TOPOLOGY_TRIANGLE_LIMIT } from '../src/model/analyze';
import { demoPositions,binarySTL } from '../src/model/demo';
import { findingsFor } from '../src/model/findings';
import { tools } from '../src/data/blender-tools';
import { guideImages,stepsForTool } from '../src/data/visual-guides';
const text=(s:string)=>new TextEncoder().encode(s).buffer;
const zipModel=(xml:string)=>zipSync({'3D/3dmodel.model':strToU8(xml)}).buffer as ArrayBuffer;
const model3mf=(unit='millimeter',transform='1 0 0 0 1 0 0 0 1 0 0 0')=>`<?xml version="1.0"?><model unit="${unit}" xmlns="http://schemas.microsoft.com/3dmanufacturing/core/2015/02"><resources><object id="1" type="model"><mesh><vertices><vertex x="0" y="0" z="0"/><vertex x="1" y="0" z="0"/><vertex x="0" y="1" z="0"/></vertices><triangles><triangle v1="0" v2="1" v3="2"/></triangles></mesh></object></resources><build><item objectid="1" transform="${transform}"/></build></model>`;
describe('Local model import and actual geometry checks',()=>{
  it('reads a binary STL even when its header begins with solid',()=>{
    const data=binarySTL(demoPositions(false,false));new Uint8Array(data,0,5).set(new TextEncoder().encode('solid'));
    expect(parseSTL(data).positions.length/9).toBe(12);
  });
  it('reads ASCII STL facets and rejects malformed input',()=>{
    const valid='solid test\nfacet normal 0 0 1\nouter loop\nvertex 0 0 0\nvertex 10 0 0\nvertex 0 10 0\nendloop\nendfacet\nendsolid test';
    expect(parseSTL(text(valid)).positions.length).toBe(9);
    expect(()=>parseSTL(text(valid.replace('vertex 0 10 0','')))).toThrow(/exactly three/);
  });
  it('rejects non-finite coordinates and truncated binary files',()=>{
    const invalid=binarySTL(demoPositions());new DataView(invalid).setFloat32(96,NaN,true);
    expect(()=>parseSTL(invalid)).toThrow(/invalid/);
    expect(()=>parseSTL(binarySTL(demoPositions()).slice(0,-1))).toThrow();
  });
  it('distinguishes a closed cube, open cube and detached component',()=>{
    const closed=analyzeMesh({positions:demoPositions(false,false),format:'STL',notes:[]});
    expect(closed.dimensions).toEqual([30,30,40]);expect(closed.boundaryEdges).toBe(0);expect(closed.components).toBe(1);expect(closed.closedCandidate).toBe(true);
    const open=analyzeMesh({positions:demoPositions(true,true),format:'STL',notes:[]});
    expect(open.boundaryEdges).toBe(4);expect(open.components).toBe(2);expect(open.closedCandidate).toBe(false);
    expect(findingsFor(open).map(f=>f.id)).toEqual(expect.arrayContaining(['boundaries','components']));
  });
  it('finds duplicates and orientation conflicts separately from boundary count',()=>{
    const mesh=demoPositions(false,false),duplicate=new Float32Array(mesh.length+9);duplicate.set(mesh);duplicate.set(mesh.subarray(0,9),mesh.length);
    expect(analyzeMesh({positions:duplicate,format:'STL',notes:[]}).duplicateTriangles).toBe(1);
    const flipped=mesh.slice(),a=flipped.slice(3,6),b=flipped.slice(6,9);flipped.set(b,3);flipped.set(a,6);
    expect(analyzeMesh({positions:flipped,format:'STL',notes:[]}).inconsistentEdges).toBe(3);
  });
  it('reports an inverted closed shell without treating every inner cavity as broken',()=>{
    const data=demoPositions(false,false);for(let i=0;i<data.length;i+=9){const a=data.slice(i+3,i+6),b=data.slice(i+6,i+9);data.set(b,i+3);data.set(a,i+6);}
    const h=analyzeMesh({positions:data,format:'STL',notes:[]});expect(h.inwardComponents).toBe(1);expect(findingsFor(h).some(f=>f.detail.includes('cavity'))).toBe(true);
  });
  it('does not count an ignored degenerate triangle as another connected shell',()=>{
    const data=demoPositions(false,false),p=new Float32Array(data.length+9);p.set(data);
    const h=analyzeMesh({positions:p,format:'STL',notes:[]});expect(h.degenerateTriangles).toBe(1);expect(h.components).toBe(1);
  });
  it('marks large-model topology unknown, never zero/pass',()=>{
    const p=new Float32Array((TOPOLOGY_TRIANGLE_LIMIT+1)*9);for(let i=0;i<p.length;i+=9)p.set([0,0,0,1,0,0,0,1,0],i);
    const h=analyzeMesh({positions:p,format:'STL',notes:[]});expect(h.topologyChecked).toBe(false);expect(h.boundaryEdges).toBeNull();expect(h.components).toBeNull();expect(h.closedCandidate).toBe(false);
  });
  it('reads triangulated OBJ with negative indices and ignores external materials',()=>{
    const mesh=parseOBJ(text('mtllib https://untrusted.invalid/file.mtl\nv 0 0 0\nv 10 0 0\nv 0 10 0\nf -3 -2 -1'));
    expect(mesh.positions.length).toBe(9);expect(mesh.format).toBe('OBJ');
    expect(()=>parseOBJ(text('v 0 0 0\nv 1 0 0\nv 1 1 0\nv 0 1 0\nf 1 2 3 4'))).toThrow(/non-triangular/);
  });
  it('reads 3MF units and build transforms from the local container',()=>{
    const mesh=parse3MF(zipModel(model3mf('inch','1 0 0 0 1 0 0 0 1 2 0 0')));
    expect(mesh.positions[0]).toBeCloseTo(50.8,4);expect(mesh.positions[3]).toBeCloseTo(76.2,4);
    expect(analyzeMesh(mesh).dimensions[0]).toBeCloseTo(25.4,4);
  });
  it('preserves the winding of a mirrored 3MF build instance',()=>{
    const mesh=parse3MF(zipModel(model3mf('millimeter','-1 0 0 0 1 0 0 0 1 0 0 0')));
    const p=mesh.positions;const cross=(p[3]-p[0])*(p[7]-p[1])-(p[4]-p[1])*(p[6]-p[0]);expect(cross).toBeGreaterThan(0);
  });
  it('rejects unsafe 3MF paths, XML entities and missing geometry references',()=>{
    expect(()=>parse3MF(zipSync({'../bad.model':strToU8('bad')}).buffer as ArrayBuffer)).toThrow(/Unsafe/);
    expect(()=>parse3MF(zipModel(model3mf().replace('<model ','<!DOCTYPE model [<!ENTITY x "bad">]><model ')))).toThrow(/entities/);
    expect(()=>parse3MF(zipModel(model3mf().replace('objectid="1"','objectid="9"')))).toThrow(/missing object/);
  });
  it('rejects unsupported formats rather than guessing the mesh',()=>expect(()=>parseModel(text('not a mesh'),'test.blend')).toThrow(/STL/));
});
describe('Authentic screenshot navigation metadata',()=>{
  it('provides an arrow tour for every repair tool',()=>{
    for(const tool of tools){const steps=stepsForTool(tool.id);expect(steps.length).toBeGreaterThan(0);for(const s of steps){const a=guideImages[s.image];expect(a).toBeDefined();expect(s.target[0]).toBeGreaterThanOrEqual(0);expect(s.target[0]).toBeLessThan(a.width);expect(s.target[1]).toBeLessThan(a.height);}}
  });
  it('distinguishes the supplied 5.2.2 workspace from older manual panels',()=>{
    expect(guideImages.workspace.version).toBe('Blender 5.2.2 LTS');for(const a of Object.values(guideImages).filter(a=>a.panel)){expect(a.version).toContain('4.5 reference');expect(a.credit).toContain('CC BY-SA');}
  });
});
