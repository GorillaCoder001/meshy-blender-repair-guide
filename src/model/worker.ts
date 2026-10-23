/// <reference lib="webworker" />
import { parseModel } from './parsers';
import { analyzeMesh } from './analyze';
import type { ModelWorkerRequest,ModelWorkerResponse } from './types';
const worker=self as unknown as DedicatedWorkerGlobalScope;
worker.onmessage=(event:MessageEvent<ModelWorkerRequest>)=>{
  const {id,name,buffer,unitFactor}=event.data;
  const send=(v:ModelWorkerResponse)=>worker.postMessage(v);
  try{
    if(!Number.isFinite(unitFactor)||unitFactor<=0)throw new Error('Invalid unit conversion.');
    send({id,progress:'Reading model geometry in your browser…'});
    const mesh=parseModel(buffer,name);
    const factor=mesh.format==='3MF'?1:unitFactor;
    if(factor!==1)for(let i=0;i<mesh.positions.length;i++)mesh.positions[i]*=factor;
    const health=analyzeMesh(mesh,progress=>send({id,progress}));
    worker.postMessage({id,model:{name,mesh,health,unitFactor:factor}},[mesh.positions.buffer]);
  }catch(error){send({id,error:error instanceof Error?error.message:'This file could not be read.'});}
};
