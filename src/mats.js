import {HALLS} from './halls.js';
export const CHARACTER_SCALE=.50;
export const MAT_SCALE=.72;
export const MAT_HEIGHT=.075*MAT_SCALE;
export const MAT_FOOT_OFFSET=.35*MAT_SCALE;
export const WORLD_BOUNDS={minX:-37,maxX:37,minZ:-10,maxZ:76};
const MAIN_MATS=Array.from({length:64},(_,i)=>{const col=i%8;return {id:`mat-${i}`,x:col<4?-1.25-(3-col)*1.45:1.25+(col-4)*1.45,z:-7.5+Math.floor(i/8)*1.85};});

export const MATS=[...MAIN_MATS.map(m=>({...m,scene:'hall'})),...HALLS.flatMap(h=>Array.from({length:12},(_,i)=>({id:`${h.id}-mat-${i}`,scene:h.id,x:h.x+(i%4-1.5)*2,z:h.z-1+Math.floor(i/4)*2})))];
