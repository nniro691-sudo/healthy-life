import {WORLD_BOUNDS} from './mats.js';
import {HALLS,hallAt} from './halls.js';
export function regionAt(x,z){return hallAt(x,z)||(z<15&&Math.abs(x)<12?'hall':z>30&&z<40&&Math.abs(x)<10?'gate':x>10&&x<20&&z<30?'tree':'court');}
const walls=[{x:-11.8,z:-2,w:.9,d:32},{x:11.8,z:-2,w:.9,d:32}];
for(const h of HALLS){walls.push({x:h.x-7,z:h.z,w:.7,d:18},{x:h.x+7,z:h.z,w:.7,d:18},{x:h.x,z:h.z-9,w:14,d:.7},{x:h.x-4.9,z:h.z+9,w:4.2,d:.7},{x:h.x+4.9,z:h.z+9,w:4.2,d:.7},{x:h.x,z:h.z-5.9,w:7,d:4.6});}
const trunks=[{x:15,z:22,r:1.1},{x:-4,z:36,r:.6},{x:4,z:36,r:.6}];
export function walkable(x,z){return x>=WORLD_BOUNDS.minX&&x<=WORLD_BOUNDS.maxX&&z>=WORLD_BOUNDS.minZ&&z<=WORLD_BOUNDS.maxZ&&!walls.some(o=>Math.abs(x-o.x)<o.w/2+.24&&Math.abs(z-o.z)<o.d/2+.24)&&!trunks.some(o=>Math.hypot(x-o.x,z-o.z)<o.r);}
export function clampToWalkable(p){p.x=Math.max(WORLD_BOUNDS.minX,Math.min(WORLD_BOUNDS.maxX,p.x));p.z=Math.max(WORLD_BOUNDS.minZ,Math.min(WORLD_BOUNDS.maxZ,p.z));for(const o of walls){const dx=p.x-o.x,dz=p.z-o.z,wx=o.w/2+.24,wz=o.d/2+.24;if(Math.abs(dx)<wx&&Math.abs(dz)<wz){if(wx-Math.abs(dx)<wz-Math.abs(dz))p.x=o.x+Math.sign(dx||1)*wx;else p.z=o.z+Math.sign(dz||1)*wz;}}for(const o of trunks){const dx=p.x-o.x,dz=p.z-o.z,d=Math.hypot(dx,dz);if(d<o.r){p.x=o.x+(d>.001?dx/d:1)*o.r;p.z=o.z+(d>.001?dz/d:0)*o.r;}}return p;}
export function needsEntrance(from,to){return (from.z>=14&&to.z<14&&Math.abs(from.x)>9)||(from.z<14&&to.z>=14&&Math.abs(to.x)>9);}
// Grid A* finds the actual open doorway instead of walking through shrine walls.
export function pathBetween(from,to){const step=.65,key=(x,z)=>x+','+z,node=p=>({x:Math.round(p.x/step),z:Math.round(p.z/step)}),start=node(from),goal=node(to),goalKey=key(goal.x,goal.z),open=[{...start,g:0,f:0}],seen=new Map([[key(start.x,start.z),{...start,g:0}]]),closed=new Set();let end=null;
 while(open.length&&closed.size<18000){open.sort((a,b)=>b.f-a.f);const n=open.pop(),k=key(n.x,n.z);if(closed.has(k))continue;if(k===goalKey){end=n;break;}closed.add(k);for(const [dx,dz]of [[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]]){const x=n.x+dx,z=n.z+dz,nk=key(x,z);if(closed.has(nk)||!walkable(x*step,z*step)||(dx&&dz&&(!walkable((n.x+dx)*step,n.z*step)||!walkable(n.x*step,(n.z+dz)*step))))continue;const g=n.g+Math.hypot(dx,dz);if(g>=(seen.get(nk)?.g??Infinity))continue;const next={x,z,g,f:g+Math.hypot(x-goal.x,z-goal.z),prev:n};seen.set(nk,next);open.push(next);}}
 if(!end)return [];const result=[];while(end.prev){result.push({x:end.x*step,z:end.z*step});end=end.prev;}result.reverse();if(walkable(to.x,to.z))result.push({x:to.x,z:to.z});return result;
}
