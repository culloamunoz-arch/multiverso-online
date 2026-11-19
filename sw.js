/* Multiverso · modo sin internet (versión segura).
   Regla de oro: CON internet siempre se muestra lo más nuevo; la copia guardada solo se usa SIN internet.
   Sube VERSION cuando quieras forzar una limpieza completa. */
const VERSION='mvo-v7';
const THREE='https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
const SUPA='https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.js';
const FONTHOSTS=['fonts.googleapis.com','fonts.gstatic.com'];
// lo mínimo para abrir sin internet; el resto se guarda solo a medida que lo visitas
const BASE=['./','./juegos/','./visit.js','./manifest.webmanifest','./icons/icon-192.png','./icons/apple-touch-icon.png'];
const ROOT=new URL('./',self.location).href; // funciona en la raíz del dominio o en una subcarpeta (GitHub Pages)

self.addEventListener('install',e=>{
 self.skipWaiting(); // la versión nueva toma el control de inmediato
 e.waitUntil(caches.open(VERSION).then(c=>Promise.allSettled([...BASE.map(u=>c.add(new Request(u,{cache:'reload'}))),...[THREE,SUPA].map(u=>fetch(u,{mode:'no-cors'}).then(res=>c.put(u,res)))])));
});
self.addEventListener('activate',e=>{
 e.waitUntil((async()=>{
  for(const k of await caches.keys()) if(k!==VERSION) await caches.delete(k);
  await self.clients.claim();
  // recarga las pestañas abiertas para que muestren la versión nueva (arregla las que quedaron pegadas)
  for(const cl of await self.clients.matchAll({type:'window'})){ try{ cl.navigate(cl.url); }catch(err){} }
 })());
});
self.addEventListener('message',e=>{ if(e.data==='limpiar') e.waitUntil((async()=>{ for(const k of await caches.keys()) await caches.delete(k); await self.registration.unregister(); })()); });

async function network(url,ms){ // pide por URL (Safari no permite copiar peticiones de navegación con opciones)
 const ctl=new AbortController(), t=setTimeout(()=>ctl.abort(),ms);
 try{ return await fetch(url,{signal:ctl.signal,cache:'no-cache',credentials:'same-origin'}); } finally{ clearTimeout(t); }
}
self.addEventListener('fetch',e=>{
 const r=e.request; if(r.method!=='GET') return;
 const u=new URL(r.url);
 const same=u.origin===location.origin;
 const lib=u.href===THREE||u.href===SUPA||FONTHOSTS.includes(u.hostname);
 if(!same&&!lib) return;                       // Supabase (datos, juego en línea) y demás: siempre directo a la red
 if(same&&(u.pathname.endsWith('/sw.js')||u.pathname.endsWith('/version.json'))) return; // nunca se guardan
 if(same&&(r.mode==='navigate'||/\.(html|js|json|webmanifest)$/.test(u.pathname)||u.pathname.endsWith('/'))){
  // páginas y código: primero internet; si no hay, la copia guardada
  e.respondWith((async()=>{
   const key=u.origin+u.pathname;
   try{
    const res=await network(u.href,10000);
    if(res&&res.ok&&!res.redirected){ const c=await caches.open(VERSION); c.put(key,res.clone()).catch(()=>{}); }
    return res;
   }catch(err){
    const c=await caches.open(VERSION);
    const hit=await c.match(key,{ignoreSearch:true})||(r.mode==='navigate'?(await c.match(ROOT+'juegos/')||await c.match(ROOT)):null);
    return hit||new Response('<meta charset="utf-8"><body style="font-family:sans-serif;background:#120624;color:#fff;text-align:center;padding:40px">Sin conexión y esta página aún no se había guardado.<br>Vuelve a intentarlo con internet.</body>',{status:503,headers:{'Content-Type':'text/html; charset=utf-8'}});
   }
  })());
  return;
 }
 // imágenes, iconos, librerías y fuentes: copia guardada primero (no cambian)
 e.respondWith((async()=>{
  const c=await caches.open(VERSION);
  const hit=await c.match(r); if(hit) return hit;
  try{ const res=await fetch(r); if(res&&(res.ok||res.type==='opaque')) c.put(r,res.clone()).catch(()=>{}); return res; }
  catch(err){ return new Response('',{status:504}); }
 })());
});
