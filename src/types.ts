export type Mode = 'beginner' | 'intermediate' | 'advanced';
export type SourceType = 'Blender Official' | 'Meshy Official' | 'Bambu Official' | 'Industry' | 'Education' | 'Community';
export type Confidence = 'High' | 'Medium' | 'Low';
export type EvidenceKind = 'OFFICIAL / DOCUMENTED' | 'HEURISTIC / PRACTICAL STARTING POINT';
export interface Source {
  id: string; title: string; url: string; type: SourceType; accessed: string;
  blenderVersion: string; confidence: Confidence; note: string;
  verification: 'Indexed documentation' | 'Full page' | 'Catalogue';
}
export interface Tool {
  id: string; name: string; category: 'Inspect' | 'Repair' | 'Rebuild' | 'Refine' | 'Prepare';
  purpose: string; path: string[]; controls: string[]; starting: string;
  scale: string; risks: string; avoid: string; verify: string; steps: string[];
  advanced: string; sources: string[]; diagram: DiagramKind;
  destructive: boolean; version: string; confidence: Confidence;
}
export type DiagramKind = 'manifold' | 'shell' | 'normals' | 'internal' | 'floating' | 'intersection' | 'hole' | 'voxel' | 'decimate' | 'thickness';
export interface Problem {
  id: string; title: string; description: string; keywords: string[];
  tools: string[]; confirm: string; verify: string; diagram: DiagramKind;
}
export interface Context {
  modelType: string; x: number; y: number; z: number;
  nozzle: number; material: 'PLA' | 'PETG' | 'ABS/ASA' | 'TPU' | 'Other';
  load: 'display' | 'handling' | 'functional' | 'critical'; smallestDetail: number;
  detail: 'high' | 'balanced' | 'coarse'; severity: 'minor' | 'moderate' | 'severe';
  organic: boolean; requirements: string[];
}
export interface Answers {
  opening: 'unintended' | 'intentional' | 'unknown';
  geometry: 'closed' | 'surface' | 'cavity' | 'unknown';
  wantHollow: boolean; pieces: 'keep' | 'debris' | 'unknown';
  contact: 'overlap' | 'separate' | 'unknown';
  importantMissing: boolean; faceUsable: boolean; backInvented: boolean;
  destroysDetail: boolean;
}
export interface Diagnosis {
  title: string; explanation: string; tools: string[]; warnings: string[];
  confirmations: string[]; verification: string; allowRemesh: boolean;
}
export interface Recommendation {
  id: string; toolId: string; setting: string; value: string; trialRange: string;
  why: string; higher: string; lower: string; formula: string;
  kind: EvidenceKind; confidence: Confidence; sourceIds: string[];
  assumptions: string[]; version: string; reviewed: string;
}
export interface MeshAnalysis {
  origin: 'local-file'; dimensionsMm: [number, number, number];
  triangleCount?: number; components?: number; boundaryEdges?: number;
  limitations: string[];
}
