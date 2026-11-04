import {spawnSync} from 'node:child_process';
import {rm,mkdir,cp} from 'node:fs/promises';
const base='/healthy-life/';
const variants=[['single',base,{VITE_STATIC_DEMO:'true',VITE_ROOM_API:''}],['multiplayer',base+'multiplayer/',{VITE_STATIC_DEMO:'',VITE_ROOM_API:'https://shan-si-multiplayer.tingzhang1119.chatgpt.site'}]];
await rm('.pages-build',{recursive:true,force:true});
for(const [name,path,settings] of variants){
 const result=spawnSync(process.execPath,['node_modules/vite/bin/vite.js','build','--outDir',`.pages-build/${name}`],{stdio:'inherit',env:{...process.env,VITE_BASE_PATH:path,...settings}});
 if(result.status!==0)process.exit(result.status||1);
}
await rm('dist',{recursive:true,force:true});await mkdir('dist',{recursive:true});
await cp('.pages-build/single','dist',{recursive:true});
await cp('.pages-build/multiplayer','dist/multiplayer',{recursive:true});
await rm('.pages-build',{recursive:true,force:true});
console.log('Published variants: /healthy-life/ (single), /healthy-life/multiplayer/ (online)');
