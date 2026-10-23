export interface LocalMesh { positions:Float32Array; format:'STL'|'3MF'|'OBJ'; notes:string[]; }
export interface MeshHealth {
  dimensions:[number,number,number]; min:[number,number,number]; max:[number,number,number];
  triangles:number; area:number; topologyChecked:boolean; weldTolerance:number;
  boundaryEdges:number|null; nonManifoldEdges:number|null; inconsistentEdges:number|null;
  components:number|null; duplicateTriangles:number|null; degenerateTriangles:number;
  inwardComponents:number|null; closedCandidate:boolean; notes:string[];
}
export interface LocalModel { name:string; mesh:LocalMesh; health:MeshHealth; unitFactor:number; }
export interface RepairFinding {
  id:string; title:string; level:'review'|'issue'|'info'; detail:string;
  toolId:string; problemId:string;
}
export type ModelWorkerRequest={id:number;name:string;buffer:ArrayBuffer;unitFactor:number};
export type ModelWorkerResponse={id:number;progress:string}|{id:number;model:LocalModel}|{id:number;error:string};
