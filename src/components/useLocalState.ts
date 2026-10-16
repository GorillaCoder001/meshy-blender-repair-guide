import { useState } from 'react';
export function useLocalState<T>(key:string,initial:T,valid:(value:unknown)=>value is T) {
  const [value,setValue]=useState<T>(()=>{try{const raw=localStorage.getItem(key);if(raw){const parsed:unknown=JSON.parse(raw);if(valid(parsed))return parsed;}}catch{/* Storage may be unavailable. */}return initial;});
  const update=(next:T)=>{setValue(next);try{localStorage.setItem(key,JSON.stringify(next));}catch{/* In-memory state remains functional. */}};
  return [value,update] as const;
}
