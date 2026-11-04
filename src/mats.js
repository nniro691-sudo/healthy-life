export const CHARACTER_SCALE=.50;
export const MAT_SCALE=.72;
export const MAT_HEIGHT=.075*MAT_SCALE;
export const MAT_FOOT_OFFSET=.35*MAT_SCALE;
export const WORLD_BOUNDS={minX:-19,maxX:19,minZ:-10,maxZ:39};
export const MATS=Array.from({length:64},(_,i)=>{const col=i%8;return {id:`mat-${i}`,x:col<4?-1.25-(3-col)*1.45:1.25+(col-4)*1.45,z:-7.5+Math.floor(i/8)*1.85};});
