import http from 'node:http';
import {readFile,stat} from 'node:fs/promises';
import {resolve,extname,sep} from 'node:path';
const root=resolve('out');
const types={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.json':'application/json','.txt':'text/plain; charset=utf-8','.svg':'image/svg+xml','.webp':'image/webp','.png':'image/png','.jpeg':'image/jpeg','.jpg':'image/jpeg','.ico':'image/x-icon','.woff2':'font/woff2'};
http.createServer(async(req,res)=>{
  try{
    const url=new URL(req.url,'http://127.0.0.1:3100');
    let file=resolve(root,'.'+decodeURIComponent(url.pathname));
    if(file!==root&&!file.startsWith(root+sep)){res.writeHead(403);res.end();return;}
    const info=await stat(file);
    if(info.isDirectory()){
      if(!url.pathname.endsWith('/')){res.writeHead(301,{Location:url.pathname+'/'+url.search});res.end();return;}
      file=resolve(file,'index.html');
    }
    const data=await readFile(file);
    res.writeHead(200,{'Content-Type':types[extname(file)]||'application/octet-stream','Cache-Control':'no-cache'});
    res.end(req.method==='HEAD'?undefined:data);
  }catch{
    res.writeHead(404,{'Content-Type':'text/html; charset=utf-8'});
    res.end(await readFile(resolve(root,'404.html')).catch(()=>Buffer.from('Page not found')));
  }
}).listen(3100,'127.0.0.1',()=>console.log('GVE brand preview: http://127.0.0.1:3100/'));
