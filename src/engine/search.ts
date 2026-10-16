import { tools } from '../data/blender-tools';
import { problems } from '../data/repair-problems';
import { workflows } from '../data/workflows';
import { glossary } from '../data/glossary';
import { sources } from '../data/sources';
export const searchIndex=[
  ...problems.map(p=>({id:'problem-'+p.id,type:'Problem',title:p.title,text:[p.description,...p.keywords].join(' '),href:'#diagnose/'+p.id})),
  ...tools.map(t=>({id:'tool-'+t.id,type:'Tool',title:t.name,text:[t.purpose,...t.path,...t.controls].join(' '),href:'#tools/'+t.id})),
  ...workflows.map(w=>({id:'workflow-'+w.id,type:'Workflow',title:w.title,text:w.description+' '+w.steps.join(' '),href:'#workflows/'+w.id})),
  ...glossary.map(([term,definition])=>({id:'term-'+term,type:'Glossary',title:term,text:definition,href:'#learn/'+encodeURIComponent(term)})),
  ...sources.map(s=>({id:'source-'+s.id,type:'Source',title:s.title,text:s.note+' '+s.type,href:'#sources/'+s.id})),
];
const normalized=(s:string)=>s.toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
export function search(query:string) {
  const words=normalized(query).split(' ').filter(Boolean);
  if(!words.length) return [];
  return searchIndex.filter(i=>words.every(w=>normalized(i.title+' '+i.text).includes(w)))
    .sort((a,b)=>Number(normalized(b.title).includes(normalized(query)))-Number(normalized(a.title).includes(normalized(query))));
}
