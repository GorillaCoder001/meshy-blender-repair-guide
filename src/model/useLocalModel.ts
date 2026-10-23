import { useEffect,useRef,useState } from 'react';
import type { LocalModel,ModelWorkerResponse } from './types';
import { LIMITS } from './parsers';
export function useLocalModel(){
  const [model,setModel]=useState<LocalModel|null>(null),[busy,setBusy]=useState(false),[progress,setProgress]=useState(''),[error,setError]=useState('');
  const worker=useRef<Worker|null>(null),requestId=useRef(0),file=useRef<File|null>(null),timer=useRef<ReturnType<typeof setTimeout>|null>(null);
  const stop=()=>{worker.current?.terminate();worker.current=null;if(timer.current)clearTimeout(timer.current);};
  useEffect(()=>()=>stop(),[]);
  const load=async(selected:File,unitFactor=1)=>{
    stop();const id=++requestId.current;setError('');setModel(null);file.current=selected;
    if(!/\.(stl|3mf|obj)$/i.test(selected.name)){setError('Choose an STL, 3MF or triangulated OBJ file.');setBusy(false);return;}
    if(!selected.size||selected.size>LIMITS.bytes){setError('Choose a non-empty model file up to 256 MB.');setBusy(false);return;}
    setBusy(true);setProgress('Reading your local file…');
    try{
      const buffer=await selected.arrayBuffer();if(requestId.current!==id)return;
      if(typeof Worker==='undefined')throw new Error('This browser cannot run local analysis workers. Use a current desktop browser.');
      const w=new Worker(new URL('./worker.ts',import.meta.url),{type:'module'});worker.current=w;
      const fail=(message:string)=>{if(requestId.current!==id)return;stop();setError(message);setBusy(false);setProgress('');};
      w.onmessage=(event:MessageEvent<ModelWorkerResponse>)=>{
        const response=event.data;if(response.id!==requestId.current)return;
        if('progress'in response)setProgress(response.progress);
        else if('error'in response)fail(response.error);
        else{setModel(response.model);setBusy(false);setProgress('');stop();}
      };
      w.onerror=()=>fail('Local analysis could not finish. Try exporting a simpler STL or fewer parts from Blender.');
      timer.current=setTimeout(()=>fail('Analysis reached its time limit. Export a simpler inspection copy or fewer model parts.'),90_000);
      w.postMessage({id,name:selected.name,buffer,unitFactor},[buffer]);
    }catch(e){if(requestId.current===id){stop();setError(e instanceof Error?e.message:'Could not read this file.');setBusy(false);setProgress('');}}
  };
  const clear=()=>{++requestId.current;stop();setModel(null);setBusy(false);setError('');setProgress('');file.current=null;};
  const changeUnits=(factor:number)=>{if(file.current)void load(file.current,factor);};
  return {model,busy,progress,error,load,clear,changeUnits};
}
export type LocalModelController=ReturnType<typeof useLocalModel>;
