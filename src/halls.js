// Five independent side sanctuaries, all connected to the original courtyard.
export const HALLS=[
 {id:'guanyin',name:'观音殿',x:-28,z:18,color:0x496c62,poem:'慈悲观照，心生清凉',description:'莲台净瓶，愿慈悲常在'},
 {id:'wenchang',name:'普贤菩萨殿',x:28,z:18,color:0x3d5368,poem:'愿行相应，步步践行',description:'乘白象而来，愿善行常在'},
 {id:'wenshu',name:'文殊殿',x:-28,z:43,color:0x786039,poem:'智慧如灯，照见前路',description:'慧剑经卷，愿智慧增长'},
 {id:'dizang',name:'地藏菩萨殿',x:28,z:43,color:0x674958,poem:'心怀大愿，步步安宁',description:'锡杖明珠，愿众生安宁'},
 {id:'caishen',name:'财神殿',x:0,z:65,color:0x963d25,poem:'勤勉有得，善用其财',description:'惜福行善，愿生活丰足'}
];
export const HALL_IDS=['hall',...HALLS.map(h=>h.id)];
export const hallAt=(x,z)=>HALLS.find(h=>Math.abs(x-h.x)<7&&z>h.z-9&&z<h.z+9)?.id;
export const hallById=id=>HALLS.find(h=>h.id===id);
