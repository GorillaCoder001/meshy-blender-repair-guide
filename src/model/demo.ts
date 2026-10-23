export function binarySTL(positions:Float32Array):ArrayBuffer{
  const buffer=new ArrayBuffer(84+positions.length/9*50),view=new DataView(buffer);
  new Uint8Array(buffer,0,25).set(new TextEncoder().encode('Created3D local demo mesh'));
  view.setUint32(80,positions.length/9,true);
  for(let i=0;i<positions.length/9;i++)for(let k=0;k<9;k++)view.setFloat32(84+i*50+12+k*4,positions[i*9+k],true);
  return buffer;
}
export function demoPositions(open=true,detached=true):Float32Array{
  const vertices=[[0,0,0],[30,0,0],[30,30,0],[0,30,0],[0,0,40],[30,0,40],[30,30,40],[0,30,40]];
  const faces=[[0,2,1],[0,3,2],[0,1,5],[0,5,4],[1,2,6],[1,6,5],[2,3,7],[2,7,6],[3,0,4],[3,4,7],...(!open?[[4,5,6],[4,6,7]]:[])];
  const out=faces.flatMap(f=>f.flatMap(i=>vertices[i]));
  if(detached){const tetra=[[45,10,20],[55,10,20],[45,20,20],[45,10,30]];for(const f of [[0,2,1],[0,1,3],[1,2,3],[2,0,3]])for(const i of f)out.push(...tetra[i]);}
  return new Float32Array(out);
}
