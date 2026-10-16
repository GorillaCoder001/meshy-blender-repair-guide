import type { Answers, Context } from '../types';
export const modelTypes = [
  ['chibi','Chibi figurine'],['realistic','Realistic figurine'],['anime','Anime character'],
  ['keychain','Keychain'],['sculpture','Decorative sculpture'],['bottle','Bottle cover'],
  ['coaster','Coaster'],['bookmark','Bookmark'],['functional','Functional part'],
  ['container','Container'],['sign','Sign / plaque'],['other','Other'],
] as const;
export const fitRequirements = [
  ['dimensions','Exact dimensions'],['fit','Mating / fit tolerances'],['cavity','Accurate cylindrical cavity'],
  ['holes','Screw / shaft holes'],['snaps','Snap fits'],['flatness','Critical flatness'],
  ['interface','Mechanical interface'],['parametric','Repeatable parametric dimensions'],
] as const;
export const defaultContext: Context = {
  modelType:'chibi',x:50,y:40,z:80,nozzle:0.4,material:'PLA',load:'display',smallestDetail:1,
  detail:'high',severity:'moderate',organic:true,requirements:[],
};
export const defaultAnswers: Answers = {
  opening:'unknown',geometry:'unknown',wantHollow:false,pieces:'unknown',contact:'unknown',
  importantMissing:false,faceUsable:true,backInvented:false,destroysDetail:false,
};
