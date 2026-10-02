import fs from 'node:fs/promises';
import path from 'node:path';
const root=path.resolve('out');
const pages=[];
async function walk(dir){for(const e of await fs.readdir(dir,{withFileTypes:true})){const p=path.join(dir,e.name);if(e.isDirectory()){if(e.name!=='_next')await walk(p);}else if(e.name==='index.html')pages.push(p);}}
await walk(root);
const refs=new Set();const broken=[];const routes=[];
for(const p of pages){const html=await fs.readFile(p,'utf8');for(const m of html.matchAll(/(?:src|href)="(\/[^"#?]*)/g)){if(m[1].startsWith('//'))continue;refs.add(m[1]);}if(!p.includes('_not-found')&&!p.includes(path.sep+'404'+path.sep)){const route='/'+path.relative(root,path.dirname(p)).split(path.sep).join('/')+'/';const url='http://127.0.0.1:3100'+route.replace('//','/');const response=await fetch(url);routes.push({route:route.replace('//','/'),status:response.status});if(response.status!==200)broken.push(url);}}
for(const ref of refs){let target=path.join(root,decodeURIComponent(ref));try{const st=await fs.stat(target);if(st.isDirectory())target=path.join(target,'index.html');await fs.access(target);}catch{broken.push(ref);}}
const icons=['gve-original-logo.png','gve-favicon.png','gve-icon-192.png','gve-apple-icon.png'];for(const icon of icons){const r=await fetch('http://127.0.0.1:3100/brand/'+icon);if(r.status!==200)broken.push(icon);}
console.log(JSON.stringify({routes,localReferences:refs.size,broken},null,2));if(broken.length)process.exitCode=1;
