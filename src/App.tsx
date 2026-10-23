import { lazy,Suspense,useEffect,useState } from 'react';
import { Box,LayoutDashboard,ScanLine,Route,SlidersHorizontal,BookOpen,CheckSquare,GraduationCap,Library,PanelLeftClose,PanelLeftOpen,Menu,X,Search,GitBranch,ArrowUp,Split } from 'lucide-react';
import type { Mode } from './types';
import { defaultContext } from './data/model-types';
import { BLENDER_VERSION,REVIEWED } from './data/sources';
import { HomePage } from './pages/Home';
import { DiagnosePage } from './pages/Diagnose';
import { ToolsPage,WorkflowsPage,PrintCheckPage,LearnPage,SourcesPage,DecisionPage,SearchPage } from './pages/LibraryPages';
import { useLocalState } from './components/useLocalState';
import { useLocalModel } from './model/useLocalModel';
const ModelAdvisor=lazy(()=>import('./pages/ModelAdvisor'));
export const navItems=[
  {id:'home',name:'Overview',icon:LayoutDashboard},{id:'diagnose',name:'Diagnose a model',icon:ScanLine},
  {id:'model-advisor',name:'Model advisor · upload',icon:Box},
  {id:'workflows',name:'Repair workflows',icon:Route},{id:'advisor',name:'Settings advisor',icon:SlidersHorizontal},
  {id:'decision',name:'Fix / regenerate / CAD',icon:Split},{id:'tools',name:'Blender tools',icon:BookOpen},
  {id:'print-check',name:'Print checks',icon:CheckSquare},{id:'learn',name:'Learn the geometry',icon:GraduationCap},
  {id:'sources',name:'Research & sources',icon:Library},
];
function getRoute() {const raw=location.hash.slice(1)||'home';const slash=raw.indexOf('/');let detail='';try{detail=decodeURIComponent(slash<0?'':raw.slice(slash+1));}catch{detail='';}return {page:slash<0?raw:raw.slice(0,slash),detail};}
export default function App() {
  const [route,setRoute]=useState(getRoute);const [mobileOpen,setMobileOpen]=useState(false);const [context,setContext]=useState(defaultContext);
  const localModel=useLocalModel();
  const [collapsed,setCollapsed]=useLocalState('created3d-nav-collapsed',false,(v):v is boolean=>typeof v==='boolean');
  const [mode,setMode]=useLocalState<Mode>('created3d-learning-mode','beginner',(v):v is Mode=>v==='beginner'||v==='intermediate'||v==='advanced');
  const [query,setQuery]=useState(route.page==='search'?route.detail:'');
  useEffect(()=>{const update=()=>{const next=getRoute();setRoute(next);setMobileOpen(false);if(next.page==='search')setQuery(next.detail);window.scrollTo({top:0});document.getElementById('main-content')?.focus({preventScroll:true});};window.addEventListener('hashchange',update);return()=>window.removeEventListener('hashchange',update);},[]);
  useEffect(()=>{const close=(e:KeyboardEvent)=>{if(e.key==='Escape')setMobileOpen(false);};window.addEventListener('keydown',close);return()=>window.removeEventListener('keydown',close);},[]);
  const active=navItems.find(n=>n.id===route.page);
  useEffect(()=>{document.title=`${active?.name??'Search'} · Mesh Repair Lab · Created3D`;},[active?.name]);
  let page;
  switch(route.page) {
    case 'home':page=<HomePage/>;break;
    case 'model-advisor':page=<Suspense fallback={<p role="status">Opening local model advisor…</p>}><ModelAdvisor controller={localModel} context={context} onContextChange={setContext}/></Suspense>;break;
    case 'diagnose':case 'advisor':page=<DiagnosePage key={route.page+'/'+route.detail} advisor={route.page==='advisor'} initialProblem={route.detail} context={context} onContextChange={setContext} mode={mode}/>;break;
    case 'tools':page=<ToolsPage selected={route.detail} mode={mode}/>;break;
    case 'workflows':page=<WorkflowsPage selected={route.detail} mode={mode}/>;break;
    case 'print-check':page=<PrintCheckPage mode={mode}/>;break;
    case 'learn':page=<LearnPage selected={route.detail}/>;break;
    case 'sources':page=<SourcesPage selected={route.detail}/>;break;
    case 'decision':page=<DecisionPage context={context} onChange={setContext}/>;break;
    case 'search':page=<SearchPage query={route.detail}/>;break;
    default:page=<div className="empty-state"><h1>Page not found</h1><a className="button primary" href="#home">Return to the lab</a></div>;
  }
  return <div className={`app-shell ${collapsed?'nav-collapsed':''}`}><a className="skip-link" href="#main-content" onClick={e=>{e.preventDefault();document.getElementById('main-content')?.focus();}}>Skip to content</a>
    {mobileOpen&&<button className="nav-scrim" aria-label="Close navigation overlay" onClick={()=>setMobileOpen(false)}/>}
    <aside className={`sidebar ${mobileOpen?'mobile-open':''}`} id="primary-sidebar" aria-label="Workspace navigation"><a href="#home" className="brand" aria-label="Created3D Mesh Repair Lab overview"><span className="brand-icon"><Box size={25}/></span><span className="brand-text"><strong>CREATED3D</strong><span>Mesh Repair Lab</span></span></a><div className="sidebar-label">WORKSPACE</div><nav>{navItems.map(n=>{const Icon=n.icon;return <a href={`#${n.id}`} key={n.id} aria-current={route.page===n.id?'page':undefined} title={n.name}><Icon size={19}/><span>{n.name}</span>{n.id==='diagnose'&&<small>START</small>}</a>;})}</nav><div className="sidebar-bottom"><div className="local-status"><span className="status-dot"/><div>Local by design<small>Files stay on your device.</small></div></div><button className="collapse-button" onClick={()=>setCollapsed(!collapsed)} aria-label={collapsed?'Expand sidebar':'Collapse sidebar'}>{collapsed?<PanelLeftOpen size={19}/>:<PanelLeftClose size={19}/>}<span>Collapse navigation</span></button><button className="mobile-close" onClick={()=>setMobileOpen(false)}><X size={18}/>Close menu</button></div></aside>
    <div className="workspace"><header className="topbar"><button className="mobile-menu" aria-label="Open navigation" aria-expanded={mobileOpen} aria-controls="primary-sidebar" onClick={()=>setMobileOpen(!mobileOpen)}>{mobileOpen?<X size={21}/>:<Menu size={21}/>}</button><div className="breadcrumb">Workspace <span>/</span><strong>{active?.name??'Search'}</strong></div><form className="global-search" onSubmit={e=>{e.preventDefault();location.hash='search/'+encodeURIComponent(query.trim());}}><Search size={16}/><input aria-label="Search all content" placeholder="Search tools, problems…" value={query} onChange={e=>setQuery(e.target.value)}/><kbd>↵</kbd></form><span className="version-pill"><i className="status-dot"/>Blender {BLENDER_VERSION}</span></header>
      <div className="learning-bar"><span>THE MESHY REPAIR WORKSPACE</span><label>Learning mode<select aria-label="Learning mode" value={mode} onChange={e=>setMode(e.target.value as Mode)}><option value="beginner">Beginner</option><option value="intermediate">Intermediate</option><option value="advanced">Advanced</option></select></label></div>
      <main id="main-content" tabIndex={-1}>{page}</main><footer className="site-footer"><div><strong>CREATED3D</strong><span>Made With Purpose.</span></div><span>Blender {BLENDER_VERSION} · Reviewed {REVIEWED}<small>Learning guidance. Inspect the mesh. Verify the slice.</small></span><a href="https://github.com/GorillaCoder001/meshy-blender-repair-guide" target="_blank" rel="noopener noreferrer"><GitBranch size={15}/>Project source</a></footer><button className="to-top" aria-label="Move to top" onClick={()=>window.scrollTo({top:0,behavior:'smooth'})}><ArrowUp size={18}/></button>
    </div></div>;
}
