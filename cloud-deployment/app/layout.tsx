import type {Metadata} from 'next';
import './globals.css';
export const metadata:Metadata={title:'山寺 · 多人共修',description:'与朋友共同参拜、合十问候的山寺在线空间。'};
export default function RootLayout({children}:Readonly<{children:React.ReactNode}>){return <html lang="zh-CN"><body style={{background:'#1c211b'}}>{children}</body></html>}
