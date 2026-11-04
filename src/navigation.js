import {WORLD_BOUNDS} from './mats.js';
export function regionAt(x,z){return z<15?'hall':z>30?'gate':x>10?'tree':'court';}
export function clampToWalkable(p){p.z=Math.max(WORLD_BOUNDS.minZ,Math.min(WORLD_BOUNDS.maxZ,p.z));const width=p.z<14?10.3:19;p.x=Math.max(-width,Math.min(width,p.x));for(const o of [{x:15,z:22,r:1.1},{x:-4,z:36,r:.6},{x:4,z:36,r:.6}]){const dx=p.x-o.x,dz=p.z-o.z,d=Math.hypot(dx,dz);if(d<o.r){p.x=o.x+(d>.001?dx/d:1)*o.r;p.z=o.z+(d>.001?dz/d:0)*o.r;}}return p;}
export function needsEntrance(from,to){return (from.z>=14&&to.z<14&&Math.abs(from.x)>9)||(from.z<14&&to.z>=14&&Math.abs(to.x)>9);}
