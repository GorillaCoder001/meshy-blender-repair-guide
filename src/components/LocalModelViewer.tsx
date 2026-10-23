import { useEffect,useRef,useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RotateCcw,Grid3X3 } from 'lucide-react';
import type { LocalMesh } from '../model/types';
const PREVIEW_LIMIT=200_000;
export function previewPositions(positions:Float32Array){
  const count=positions.length/9;if(count<=PREVIEW_LIMIT)return positions.slice();
  const result=new Float32Array(PREVIEW_LIMIT*9);
  for(let i=0;i<PREVIEW_LIMIT;i++){const start=Math.floor(i*(count-1)/(PREVIEW_LIMIT-1))*9;result.set(positions.subarray(start,start+9),i*9);}return result;
}
export function LocalModelViewer({mesh}:{mesh:LocalMesh}){
  const host=useRef<HTMLDivElement>(null),api=useRef<{reset:()=>void;wire:(enabled:boolean)=>void}|null>(null);
  const [wire,setWire]=useState(false),[error,setError]=useState('');
  useEffect(()=>{
    const el=host.current;if(!el)return;
    let renderer:THREE.WebGLRenderer;
    try{renderer=new THREE.WebGLRenderer({antialias:true});}catch{setError('3D preview is unavailable on this device. Local file analysis and repair guidance still work.');return;}
    setError('');setWire(false);renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.5));renderer.setClearColor(0x111820);el.appendChild(renderer.domElement);
    const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(38,1,.001,100000),controls=new OrbitControls(camera,renderer.domElement);camera.up.set(0,0,1);
    scene.add(new THREE.HemisphereLight(0xe4fff6,0x28333b,2.5));const light=new THREE.DirectionalLight(0xffddbb,3);light.position.set(-100,-150,200);scene.add(light);
    const bounds=new THREE.Box3().setFromBufferAttribute(new THREE.BufferAttribute(mesh.positions,3)),size=bounds.getSize(new THREE.Vector3()),center=bounds.getCenter(new THREE.Vector3());
    const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.BufferAttribute(previewPositions(mesh.positions),3));geometry.translate(-center.x,-center.y,-bounds.min.z);geometry.computeVertexNormals();
    const material=new THREE.MeshStandardMaterial({color:0xa3c8bb,roughness:.6,metalness:.05,side:THREE.DoubleSide});scene.add(new THREE.Mesh(geometry,material));
    const extent=Math.max(size.x,size.y,size.z,.001),grid=new THREE.GridHelper(extent*1.8,20,0x425950,0x253a34);grid.rotation.x=Math.PI/2;grid.position.z=-extent*.002;scene.add(grid);
    const render=()=>renderer.render(scene,camera);
    const reset=()=>{controls.target.set(0,0,size.z/2);camera.near=Math.max(extent/10000,.00001);camera.far=extent*1000;camera.position.set(extent*1.8,-extent*2.1,size.z/2+extent*1.6);camera.updateProjectionMatrix();controls.update();render();};
    api.current={reset,wire:enabled=>{material.wireframe=enabled;render();}};
    const resize=()=>{const {width,height}=el.getBoundingClientRect();if(!width||!height)return;renderer.setSize(width,height);camera.aspect=width/height;camera.updateProjectionMatrix();render();};
    const observer=new ResizeObserver(resize);observer.observe(el);controls.addEventListener('change',render);resize();reset();
    return()=>{observer.disconnect();controls.dispose();geometry.dispose();material.dispose();grid.geometry.dispose();(grid.material as THREE.Material).dispose();renderer.dispose();renderer.domElement.remove();api.current=null;};
  },[mesh]);
  return <section className="local-viewer"><div className="local-viewer-header"><span className="eyebrow">YOUR MODEL · LOCAL PREVIEW</span><div><button aria-label="Reset model view" onClick={()=>api.current?.reset()}><RotateCcw size={15}/></button><button aria-label="Toggle wireframe" aria-pressed={wire} onClick={()=>{setWire(!wire);api.current?.wire(!wire);}}><Grid3X3 size={15}/></button></div></div><div ref={host} className="local-viewer-canvas" aria-label="3D model preview: drag to rotate, scroll to zoom"/>{error&&<p className="viewer-fallback" role="status">{error}</p>}<div className="local-viewer-footer"><span>Drag to rotate · Scroll to zoom</span><span>Z ↑ · mm</span></div>{mesh.positions.length/9>PREVIEW_LIMIT&&<p className="small muted">Preview samples 200,000 triangles; measurements use all triangles. This display sample can omit fine details.</p>}</section>;
}
