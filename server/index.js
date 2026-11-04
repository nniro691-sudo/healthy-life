import {createServer} from 'node:http';
import {readFile,stat} from 'node:fs/promises';
import {resolve,extname} from 'node:path';
import {createRoomService} from './rooms.js';
const root=resolve('dist'),service=createRoomService();
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.jpg':'image/jpeg','.png':'image/png','.webp':'image/webp','.glb':'model/gltf-binary','.svg':'image/svg+xml'};
const server=createServer((req,res)=>{if(req.method==='GET'&&req.url==='/healthz'){res.writeHead(200,{'Content-Type':'application/json','Cache-Control':'no-store'});res.end(JSON.stringify({ok:true}));return;}return service.middleware(req,res,async()=>{try{const url=new URL(req.url,'http://localhost');const requested=resolve(root,'.'+decodeURIComponent(url.pathname));if(requested!==root&&!requested.startsWith(root+'/')){res.writeHead(403);return res.end();}let file=requested;try{if((await stat(file)).isDirectory())file=resolve(file,'index.html');}catch{if(extname(file)){res.writeHead(404);return res.end();}file=resolve(root,'index.html');}const body=await readFile(file);res.writeHead(200,{'Content-Type':types[extname(file)]||'application/octet-stream','Cache-Control':extname(file)==='.html'?'no-cache':'public, max-age=3600'});res.end(body);}catch{res.writeHead(404);res.end('Not found');}});});
server.listen(Number(process.env.PORT)||5173,'0.0.0.0',()=>console.log(`山寺多人服务已启动：http://localhost:${server.address().port}`));
const shutdown=()=>{service.close();server.close();};process.on('SIGTERM',shutdown);process.on('SIGINT',shutdown);
