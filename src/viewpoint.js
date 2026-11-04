import * as THREE from 'three';

export const EYE_HEIGHT=1.65;
export function lookHeight(position){
 // A person naturally looks upward on approaching the tall sanctuary.
 const hallGaze=THREE.MathUtils.lerp(1.85,1.40,THREE.MathUtils.smoothstep(position.z,12,18));
 return THREE.MathUtils.lerp(4.2,hallGaze,THREE.MathUtils.smoothstep(position.z,-9.5,5));
}
export function resetEyeView(camera,controls,position,mobile=false){
 controls.target.copy(position).add(new THREE.Vector3(0,lookHeight(position),0));
 camera.position.copy(position).add(new THREE.Vector3(0,EYE_HEIGHT,mobile?6.4:5.6));
 controls.update();
}
export function keepEyeHeight(camera){camera.position.y=THREE.MathUtils.clamp(camera.position.y,1.50,1.85);}
