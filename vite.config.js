import {defineConfig} from 'vite';
import {createRoomService} from './server/rooms.js';
export default defineConfig({base:process.env.VITE_BASE_PATH||'/',plugins:[{name:'temple-rooms',configureServer(server){const service=createRoomService();server.middlewares.use(service.middleware);server.httpServer?.once('close',()=>service.close());},configurePreviewServer(server){const service=createRoomService();server.middlewares.use(service.middleware);server.httpServer?.once('close',()=>service.close());}}],build:{rollupOptions:{output:{manualChunks:{three:['three']}}}}});
