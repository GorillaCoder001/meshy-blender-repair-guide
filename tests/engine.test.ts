import { describe,it,expect } from 'vitest';
import { defaultContext as c, defaultAnswers as a } from '../src/data/model-types';
import { diagnose } from '../src/engine/diagnosis-engine';
import { advise } from '../src/engine/settings-engine';
import { chooseApproach } from '../src/engine/cad-escalation';
import { workflowFor } from '../src/engine/workflow-engine';
import { search } from '../src/engine/search';
import { tools,toolById } from '../src/data/blender-tools';
import { problems } from '../src/data/repair-problems';
import { workflows, printChecks, checklistGroups } from '../src/data/workflows';
import { sources,sourceById } from '../src/data/sources';
describe('Required real-world diagnosis scenarios',()=>{
  it('separates closed volume from a zero-thickness hollow surface',()=>{
    expect(diagnose('hollow',c,{...a,geometry:'closed'}).tools).not.toContain('solidify');
    expect(diagnose('hollow',c,{...a,geometry:'surface',wantHollow:true}).tools).toContain('solidify');
    expect(diagnose('hollow',c,{...a,geometry:'unknown'}).title).toContain('first');
  });
  it('preserves an intentional cavity',()=>expect(diagnose('hollow',c,{...a,geometry:'cavity',wantHollow:true}).tools).not.toContain('fill-holes'));
  it('never seals a known intentional opening',()=>expect(diagnose('holes',c,{...a,opening:'intentional'}).tools).not.toContain('fill-holes'));
  it('joins floating intentional hair only after actual contact',()=>{
    expect(diagnose('floating',c,{...a,pieces:'keep',contact:'overlap'}).tools).toContain('boolean');
    expect(diagnose('floating',c,{...a,pieces:'keep',contact:'separate'}).title).toContain('attachment');
    expect(diagnose('floating',c,{...a,pieces:'debris'}).tools).toContain('meshy-cleanup');
    expect(diagnose('floating',c,a).tools).not.toContain('delete-loose');
  });
  it('non-manifold figurine has a Blender path and gated remesh',()=>{
    expect(chooseApproach(c,a).choice).toBe('FIX IN BLENDER');
    expect(diagnose('non-manifold',c,a).allowRemesh).toBe(false);
    expect(diagnose('non-manifold',c,{...a,geometry:'closed'}).allowRemesh).toBe(true);
  });
  it('reversed normals receives orientation and normal repair, not universal remesh',()=>{
    const d=diagnose('normals',c,a); expect(d.tools).toContain('normals'); expect(d.tools).not.toContain('remesh');
  });
  it('severely invented back with unusable geometry favors regeneration',()=>{
    expect(chooseApproach({...c,severity:'severe'},{...a,backInvented:true}).choice).toBe('REGENERATE IN MESHY');
  });
  it('exact bookmark and fitted bottle cavity escalate by requirement',()=>{
    expect(chooseApproach({...c,modelType:'bookmark',requirements:['dimensions']},a).choice).toBe('REBUILD PART IN CAD');
    expect(chooseApproach({...c,modelType:'bottle',requirements:['cavity','fit']},a).choice).toBe('REBUILD PART IN CAD');
  });
  it.each(['bookmark','coaster','bottle'])('decorative %s stays Blender-oriented',modelType=>{
    expect(chooseApproach({...c,modelType},a).choice).toBe('FIX IN BLENDER');
  });
  it('40 mm keychain gets more specific small-feature warnings than a 200 mm figurine',()=>{
    const small=advise({...c,modelType:'keychain',x:25,y:5,z:40,smallestDetail:.3},'thin',a);
    const large=advise({...c,x:120,y:80,z:200,smallestDetail:2},'thin',a);
    expect(small.warnings.some(w=>w.includes('small print size'))).toBe(true);
    expect(large.warnings.some(w=>w.includes('small print size'))).toBe(false);
    expect(small.warnings.some(w=>w.includes('smaller than'))).toBe(true);
  });
  it('thin surface clothing gets Solidify; existing thick clothing does not',()=>{
    expect(diagnose('clothing',c,{...a,geometry:'surface'}).tools).toContain('solidify');
    expect(diagnose('clothing',c,{...a,geometry:'closed'}).tools).not.toContain('solidify');
  });
  it('excess polygon advice preserves more faces for high detail',()=>{
    const high=advise(c,'polygons',a).settings.find(r=>r.id==='decimate-trial')!;
    const coarse=advise({...c,detail:'coarse'},'polygons',a).settings.find(r=>r.id==='decimate-trial')!;
    expect(Number(high.value)).toBeGreaterThan(Number(coarse.value));
  });
});
describe('Rules and evidence integrity',()=>{
  it.each([0,-1,NaN,Infinity,5001])('rejects invalid dimension %s without recommendations',x=>{
    const r=advise({...c,x},'thin',a); expect(r.errors.length).toBeGreaterThan(0); expect(r.settings).toEqual([]);
  });
  it('blocks dimension-critical global numeric repairs',()=>{
    expect(advise({...c,requirements:['fit']},'non-manifold',{...a,geometry:'closed'}).settings.every(r=>!['remesh','merge-distance','decimate'].includes(r.toolId))).toBe(true);
  });
  it('withholds excessive voxel trials rather than issuing a huge grid',()=>{
    const result=advise({...c,x:200,y:200,z:200,smallestDetail:.1},'non-manifold',{...a,geometry:'closed'});
    expect(result.settings.some(r=>r.id==='voxel-trial')).toBe(false);
    expect(result.warnings.some(w=>w.includes('large bounding-box grid'))).toBe(true);
  });
  it('does not issue a strength number for a critical load',()=>expect(advise({...c,load:'critical'},'thin',a).settings.some(r=>r.id==='wall-screen')).toBe(false));
  it('load, nozzle and material change the relevant advice',()=>{
    const r=advise({...c,nozzle:.6,load:'handling',material:'TPU'},'thin',a);
    expect(r.settings[0].value).toBe('2.4 mm'); expect(r.warnings.some(w=>w.includes('TPU'))).toBe(true);
  });
  it('every possible recommendation has resolvable tools and complete provenance',()=>{
    for(const p of problems) for(const detail of ['high','balanced','coarse'] as const) {
      const context={...c,detail}; const answers={...a,geometry:'closed' as const};
      const d=diagnose(p.id,context,answers);
      for(const id of workflowFor(d)) expect(toolById[id],id).toBeDefined();
      for(const r of advise(context,p.id,answers).settings) {
        expect(r.kind).toBe('HEURISTIC / PRACTICAL STARTING POINT');
        expect(r.formula.length).toBeGreaterThan(10); expect(r.sourceIds.length).toBeGreaterThan(0);
        expect(r.version).toBe('5.2 LTS'); expect(r.reviewed).toBe('2026-10-16'); expect(toolById[r.toolId]).toBeDefined();
        for(const id of r.sourceIds) expect(sourceById[id],id).toBeDefined();
      }
    }
  });
  it('all tool paths and source references resolve',()=>{
    for(const t of tools) { expect(t.path.length).toBeGreaterThan(1); expect(t.steps.length).toBeGreaterThan(1); for(const id of t.sources) expect(sourceById[id],id).toBeDefined(); }
    for(const p of [...problems,...workflows,...printChecks]) { for(const id of p.tools) expect(toolById[id],id).toBeDefined(); }
    for(const w of [...workflows,...printChecks]) for(const id of w.sources) expect(sourceById[id],id).toBeDefined();
  });
  it('stable identifiers are unique within each content namespace',()=>{
    for(const list of [tools,problems,workflows,printChecks,sources]) expect(new Set(list.map(i=>i.id)).size).toBe(list.length);
    const ids=checklistGroups.flatMap(g=>g.items.map(([id])=>id)); expect(new Set(ids).size).toBe(ids.length);
  });
  it.each(['hollow','floating hair','non manifold','bad normals','voxel','decimate','holes','thin wall'])('search resolves %s',q=>expect(search(q).length).toBeGreaterThan(0));
});
