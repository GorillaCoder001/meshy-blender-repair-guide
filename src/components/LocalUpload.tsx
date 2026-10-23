import { useRef,useState } from 'react';
import { Upload,FolderOpen,LockKeyhole,LoaderCircle,X } from 'lucide-react';
import type { LocalModelController } from '../model/useLocalModel';
import { binarySTL,demoPositions } from '../model/demo';
export function LocalUpload({controller:c}:{controller:LocalModelController}){
  const input=useRef<HTMLInputElement>(null);const [drag,setDrag]=useState(false);
  return <section className={`local-upload ${drag?'dragging':''}`} onDragOver={e=>{e.preventDefault();setDrag(true);}} onDragLeave={()=>setDrag(false)} onDrop={e=>{e.preventDefault();setDrag(false);if(e.dataTransfer.files.length===1)void c.load(e.dataTransfer.files[0]);}}>
    <input ref={input} type="file" hidden accept=".stl,.3mf,.obj" aria-label="Choose a local 3D model" onChange={e=>{const f=e.currentTarget.files?.[0];if(f)void c.load(f);e.currentTarget.value='';}}/>
    <div className="upload-glyph">{c.busy?<LoaderCircle className="spinning" size={26}/>:<Upload size={26}/>}</div><div className="upload-copy"><h2>{c.busy?'Inspecting your model…':c.model?'Choose another model':'Start with your model'}</h2><p>{c.busy?c.progress:'Drop an STL, 3MF or triangulated OBJ here, or choose a file.'}</p><span><LockKeyhole size={12}/>Files are read on this device. Nothing is sent to a server.</span></div>
    <div className="upload-actions"><button className="button primary" onClick={()=>input.current?.click()} disabled={c.busy}><FolderOpen size={16}/>Choose local model</button><button className="text-button" onClick={()=>void c.load(new File([binarySTL(demoPositions())],'repair-demo.stl',{type:'application/octet-stream'}))} disabled={c.busy}>Try a demo model</button>{(c.model||c.busy)&&<button className="text-button" onClick={c.clear}><X size={13}/>{c.busy?'Cancel analysis':'Remove model'}</button>}</div>
    {c.error&&<p className="upload-error" role="alert">{c.error}</p>}
  </section>;
}
